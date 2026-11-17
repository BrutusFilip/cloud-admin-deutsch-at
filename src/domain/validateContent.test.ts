import { describe, expect, it } from 'vitest'
import type { ChallengeCase, GrammarItem, StudyItem } from './types'
import { validateChallenges, validateContent, validateInterviews } from './validateContent'
import { CHALLENGE, CHOICE, GAP, GRAMMAR_ITEMS, ORDER, TRANSFORM } from './__fixtures__/grammar'
import { INTERVIEW, PERSONAL_Q, STAR_Q, TECH_Q } from './__fixtures__/interview'
import { FREE_SENTENCE, ITEMS, NOUN, SENTENCE, TOPICS, VERB } from './__fixtures__/items'

function messages(items: StudyItem[], options = {}) {
  return validateContent(items, TOPICS, options).map((i) => `${i.id}: ${i.message}`)
}

describe('content check', () => {
  it('accepts valid content', () => {
    expect(messages(ITEMS)).toEqual([])
  })

  it('rejects duplicate, malformed, mismatched and retired IDs', () => {
    const issues = messages(
      [NOUN, { ...NOUN }, { ...VERB, id: 'identity-x-1' }, { ...VERB, id: 'm365-v-009' }, { ...SENTENCE, id: 'identity-v-009' }],
      { retiredIds: ['m365-v-001'] },
    )
    expect(issues).toContain('m365-v-001: Duplicate item ID.')
    expect(issues).toContain('m365-v-001: Retired IDs must not be reused.')
    expect(issues).toContain('identity-x-1: ID must look like <topic>-<v|s|g>-<NNN>.')
    expect(issues).toContain('m365-v-009: ID prefix "m365" does not match topic "identity".')
    expect(issues).toContain('identity-v-009: Kind "sentence" needs the letter "s" in its ID.')
  })

  it('requires article, capital letter and plural form for nouns', () => {
    const issues = messages([
      { ...NOUN, id: 'm365-v-010', de: 'der Postfach' },
      { ...NOUN, id: 'm365-v-011', de: 'das postfach' },
      { ...NOUN, id: 'm365-v-012', plural: 'Postfächer' },
    ])
    expect(issues).toEqual([
      'm365-v-010: Noun must start with the article matching its gender.',
      'm365-v-011: Noun must be capitalised.',
      'm365-v-012: Plural must start with "die ".',
    ])
  })

  it('requires government with the infinitive and past forms for verbs', () => {
    const issues = messages([{ ...VERB, id: 'identity-v-010', government: 'etwas (A)', past: ' ' }])
    expect(issues).toEqual(['identity-v-010: Government must contain the infinitive.', 'identity-v-010: Missing past forms.'])
  })

  it('rejects duplicate variants and variants the checker would not accept', () => {
    const issues = messages([
      {
        ...NOUN,
        id: 'm365-v-013',
        write: { mode: 'auto', accept: [{ text: 'das Postfach.' }, { text: '   ' }] },
      },
    ])
    expect(issues).toContain('m365-v-013: Accepted variant "das Postfach." duplicates another answer.')
    expect(issues).toContain('m365-v-013: Empty accepted variant.')
  })

  it('blocks personal data: e-mail, phone, links in text, public IP addresses, deny-list terms', () => {
    const issues = messages(
      [
        { ...NOUN, id: 'm365-v-014', example: { de: 'Schreiben Sie an max.muster@firma.at.', cz: 'Napište.' } },
        { ...NOUN, id: 'm365-v-015', example: { de: 'Rufen Sie +43 660 1234567 an.', cz: 'Zavolejte.' } },
        { ...NOUN, id: 'm365-v-016', noteCz: 'Viz https://example.com/navod' },
        { ...NOUN, id: 'm365-v-017', example: { de: 'Der Server 8.8.8.8 antwortet nicht.', cz: 'Server neodpovídá.' } },
        { ...NOUN, id: 'm365-v-018', example: { de: 'Der Server 192.0.2.10 antwortet nicht.', cz: 'Server neodpovídá.' } },
        { ...NOUN, id: 'm365-v-019', example: { de: 'Bei Contoso Wien ist das Postfach voll.', cz: 'Schránka je plná.' } },
      ],
      { denylist: ['contoso wien'] },
    )
    expect(issues.some((i) => i.startsWith('m365-v-014: Looks like an e-mail address'))).toBe(true)
    expect(issues.some((i) => i.startsWith('m365-v-015: Looks like a phone number'))).toBe(true)
    expect(issues.some((i) => i.startsWith('m365-v-016: Links belong in sources'))).toBe(true)
    expect(issues.some((i) => i.startsWith('m365-v-017: Public IP address'))).toBe(true)
    expect(issues.some((i) => i.startsWith('m365-v-018'))).toBe(false)
    expect(issues).toContain('m365-v-019: Contains a term from the local deny-list.')
  })

  it('requires https sources with a check date', () => {
    const issues = messages([
      { ...NOUN, id: 'm365-v-020', sources: [{ label: 'Quelle', url: 'http://example.com', checkedAt: '4.11.2026' }] },
    ])
    expect(issues).toEqual(['m365-v-020: Source URL must use https.', 'm365-v-020: Source checkedAt must be YYYY-MM-DD.'])
  })
})

describe('grammar task check', () => {
  const broken = (patch: Partial<GrammarItem> & { id: string }): StudyItem => ({ ...GAP, ...patch }) as StudyItem

  it('accepts valid tasks of every type', () => {
    expect(messages([...ITEMS, ...GRAMMAR_ITEMS])).toEqual([])
  })

  it('rejects unknown item kinds, task types and foci, and missing instructions', () => {
    const issues = messages([
      { ...NOUN, id: 'm365-v-030', kind: 'idiom' } as unknown as StudyItem,
      broken({ id: 'identity-g-010', task: { type: 'match' } as never }),
      broken({ id: 'identity-g-011', focus: 'tenses' as never }),
      broken({ id: 'identity-g-012', promptCz: ' ', explanationCz: '' }),
      broken({ id: 'identity-v-013' }),
    ])
    expect(issues).toContain('m365-v-030: Unknown item kind "idiom".')
    expect(issues).toContain('identity-g-010: Unknown task type "match".')
    expect(issues).toContain('identity-g-011: Unknown grammar focus "tenses".')
    expect(issues).toContain('identity-g-012: Missing promptCz (instruction).')
    expect(issues).toContain('identity-g-012: Missing explanationCz (why the solution works).')
    expect(issues).toContain('identity-v-013: Kind "grammar" needs the letter "g" in its ID.')
  })

  it('rejects gap tasks without exactly one blank or with repeated answers', () => {
    const issues = messages([
      broken({ id: 'identity-g-014', task: { type: 'gap', text: 'Ich habe der Kollegin das Konto entsperrt.', answers: ['der'] } }),
      broken({ id: 'identity-g-015', task: { type: 'gap', text: 'Ich habe ___ Kollegin ___ entsperrt.', answers: ['der'] } }),
      broken({ id: 'identity-g-016', task: { type: 'gap', text: 'Ich habe ___ Kollegin das Konto entsperrt.', answers: ['der', 'der.'] } }),
      broken({ id: 'identity-g-017', task: { type: 'gap', text: 'Ich habe ___ Kollegin das Konto entsperrt.', answers: [] } }),
    ])
    expect(issues).toContain('identity-g-014: Gap text needs exactly one blank "___".')
    expect(issues).toContain('identity-g-015: Gap text needs exactly one blank "___".')
    expect(issues).toContain('identity-g-016: Gap answers repeat each other.')
    expect(issues).toContain('identity-g-017: Gap needs at least one non-empty answer.')
  })

  it('rejects choice tasks with a bad option list or a correct index outside it', () => {
    const issues = messages([
      { ...CHOICE, id: 'm365-g-020', task: { type: 'choice', text: 'Ich kümmere mich ___ das Ticket.', options: ['um'], correct: 0, whyCz: [''] } },
      { ...CHOICE, id: 'm365-g-021', task: { type: 'choice', text: 'Ich kümmere mich ___ das Ticket.', options: ['um', 'für'], correct: 2, whyCz: ['a', 'b'] } },
      { ...CHOICE, id: 'm365-g-022', task: { type: 'choice', text: 'Ich kümmere mich ___ das Ticket.', options: ['um', 'Um', 'für'], correct: 0, whyCz: ['', 'b', 'c'] } },
    ])
    expect(issues).toContain('m365-g-020: Choice needs 2–4 non-empty options.')
    expect(issues).toContain('m365-g-021: Choice "correct" must point to one of the options.')
    expect(issues).toContain('m365-g-022: Choice options repeat each other.')
  })

  it('needs a reason for every wrong option of a choice task, and none for the correct one', () => {
    const task = { type: 'choice' as const, text: 'Ich kümmere mich ___ das Ticket.', options: ['für', 'um', 'über'], correct: 1 }
    const issues = messages([
      { ...CHOICE, id: 'm365-g-023', task: { ...task, whyCz: ['nur zwei'] } },
      { ...CHOICE, id: 'm365-g-024', task: { ...task, whyCz: ['„für“ = pro.', '', ''] } },
      { ...CHOICE, id: 'm365-g-025', task: { ...task, whyCz: ['„für“ = pro.', 'správně', '„über“ ne.'] } },
    ])
    expect(issues).toContain('m365-g-023: Choice needs whyCz with one entry per option.')
    expect(issues).toContain('m365-g-024: Wrong option 3 needs a reason in whyCz.')
    expect(issues).toContain('m365-g-025: whyCz of the correct option must be empty.')
  })

  it('rejects order tasks whose answers do not use the tokens or that are already solved', () => {
    const task = ORDER.task as Extract<GrammarItem['task'], { type: 'order' }>
    const issues = messages([
      { ...ORDER, id: 'm365-g-023', task: { ...task, answers: ['das Passwort abgelaufen ist'] } },
      { ...ORDER, id: 'm365-g-024', task: { ...task, tokens: ['das Kennwort', 'abgelaufen', 'ist'] } },
      { ...ORDER, id: 'm365-g-025', task: { ...task, tokens: ['ist'] } },
    ])
    expect(issues).toContain('m365-g-023: Order answer "das Passwort abgelaufen ist" does not use exactly the given tokens.')
    expect(issues).toContain('m365-g-024: Order tokens are already shown in a correct order.')
    expect(issues).toContain('m365-g-025: Order needs 2–8 non-empty tokens.')
  })

  it('rejects transform tasks that need no change, and solutions that differ from "de"', () => {
    const issues = messages([
      { ...TRANSFORM, id: 'identity-g-026', task: { type: 'transform', source: 'Ich habe das Kennwort zurückgesetzt.', answers: ['ich habe das Kennwort zurückgesetzt'] }, de: 'ich habe das Kennwort zurückgesetzt' },
      { ...GAP, id: 'identity-g-027', de: 'Ich habe die Kollegin das Konto entsperrt.' },
    ])
    expect(issues).toContain('identity-g-026: Transform answer equals the source; nothing to transform.')
    expect(issues).toContain(
      'identity-g-027: The solved task "Ich habe der Kollegin das Konto entsperrt." differs from de "Ich habe die Kollegin das Konto entsperrt.".',
    )
  })
})

describe('challenge check', () => {
  const ALL = [...ITEMS, ...GRAMMAR_ITEMS]
  const check = (cases: ChallengeCase[]) => validateChallenges(cases, ALL).map((i) => `${i.id}: ${i.message}`)

  it('accepts a case with five existing, automatically checked steps', () => {
    expect(check([CHALLENGE])).toEqual([])
  })

  it('rejects bad IDs, duplicates, wrong step counts and unknown or repeated items', () => {
    const steps = CHALLENGE.steps
    const issues = check([
      CHALLENGE,
      { ...CHALLENGE },
      { ...CHALLENGE, id: 'Bad_ID' },
      { ...CHALLENGE, id: 'short', steps: steps.slice(0, 4) },
      { ...CHALLENGE, id: 'unknown-step', steps: [...steps.slice(0, 4), { item: 'm365-g-099', stageCz: 'Předání' }] },
      { ...CHALLENGE, id: 'repeated', steps: [...steps.slice(0, 4), steps[0]!] },
      { ...CHALLENGE, id: 'no-stage', steps: [...steps.slice(0, 4), { item: 'identity-g-003', stageCz: '' }] },
      { ...CHALLENGE, id: 'no-title', titleDe: ' ' },
    ])
    expect(issues).toContain('challenge:test-case: Duplicate challenge ID.')
    expect(issues).toContain('challenge:Bad_ID: Challenge ID must be kebab-case.')
    expect(issues).toContain('challenge:short: A challenge needs exactly 5 steps.')
    expect(issues).toContain('challenge:unknown-step: Step 5 refers to unknown item "m365-g-099".')
    expect(issues).toContain('challenge:repeated: Step 5 repeats item "identity-g-001".')
    expect(issues).toContain('challenge:no-stage: Step 5 needs a stage name.')
    expect(issues).toContain('challenge:no-title: Missing titleDe.')
  })

  it('applies the privacy rules and the local deny-list to case texts', () => {
    const issues = validateChallenges(
      [{ ...CHALLENGE, situationDe: 'Bitte rufen Sie +43 660 1234567 an.', situationCz: 'Volá kolegyně z firmy Contoso Wien.' }],
      ALL,
      { denylist: ['contoso wien'] },
    ).map((i) => `${i.id}: ${i.message}`)
    expect(issues.some((i) => i.startsWith('challenge:test-case: Looks like a phone number'))).toBe(true)
    expect(issues).toContain('challenge:test-case: Contains a term from the local deny-list.')
  })

  it('accepts only steps the app can check automatically', () => {
    const issues = check([{ ...CHALLENGE, id: 'compare', steps: [...CHALLENGE.steps.slice(0, 4), { item: FREE_SENTENCE.id, stageCz: 'Předání' }] }])
    expect(issues).toEqual(['challenge:compare: Step 5 item "m365-s-001" must be checked automatically (grammar task or auto writing).'])
  })
})

describe('interview check', () => {
  const check = (interviews: (typeof INTERVIEW)[], options = {}) =>
    validateInterviews(interviews, ITEMS, TOPICS, options).map((i) => `${i.id}: ${i.message}`)

  it('accepts a valid interview with personal, STAR and technical questions', () => {
    expect(check([INTERVIEW])).toEqual([])
  })

  it('rejects bad interview IDs, duplicates and too few questions', () => {
    const issues = check([INTERVIEW, { ...INTERVIEW, questions: [] }, { ...INTERVIEW, id: 'Bad ID', questions: [TECH_Q, STAR_Q].map((q, i) => ({ ...q, id: `identity-i-01${i}` })) }])
    expect(issues).toContain('interview:test-interview: Duplicate interview ID.')
    expect(issues).toContain('interview:test-interview: An interview needs 3–4 questions.')
    expect(issues).toContain('interview:Bad ID: Interview ID must be kebab-case.')
    expect(issues).toContain('interview:Bad ID: An interview needs 3–4 questions.')
  })

  it('rejects malformed questions: ID, kind, time, follow-ups and structure of the model', () => {
    const issues = check([
      {
        ...INTERVIEW,
        questions: [
          { ...TECH_Q, id: 'identity-x-1' },
          { ...TECH_Q, id: 'm365-i-005' },
          { ...TECH_Q, id: 'identity-i-003', seconds: 45 as never, followUps: [] },
          { ...STAR_Q, id: 'identity-i-004', model: { ...STAR_Q.model, parts: [...STAR_Q.model.parts].reverse() } },
          { ...PERSONAL_Q, id: 'm365-i-006', kind: 'story' as never },
        ],
      },
    ])
    expect(issues).toContain('interview:test-interview: An interview needs 3–4 questions.')
    expect(issues).toContain('identity-x-1: Question ID must look like <topic>-i-<NNN>.')
    expect(issues).toContain('m365-i-005: ID prefix "m365" does not match topic "identity".')
    expect(issues).toContain('identity-i-003: Answer time must be 60, 75 or 90 seconds.')
    expect(issues).toContain('identity-i-003: A question needs at least one follow-up.')
    expect(issues).toContain('identity-i-004: Model answer must follow the steps situation → task → action → result.')
    expect(issues).toContain('m365-i-006: Unknown question kind "story".')
  })

  it('rejects facts to replace that are missing or ambiguous, and incomplete phrases and checklists', () => {
    const issues = check([
      {
        ...INTERVIEW,
        questions: [
          { ...TECH_Q, replace: [{ text: 'per Fax', noteCz: 'x' }] },
          { ...STAR_Q, replace: [{ text: 'Ich', noteCz: 'x' }], phrases: TECH_Q.phrases.slice(0, 2) },
          { ...PERSONAL_Q, replace: [], checks: { ...PERSONAL_Q.checks, followUp: ' ' } },
        ],
      },
    ])
    expect(issues).toContain('identity-i-001: Fact to replace "per Fax" must occur exactly once in the model answers (found 0).')
    expect(issues).toContain('identity-i-002: Fact to replace "Ich" must occur exactly once in the model answers (found 3).')
    expect(issues).toContain('identity-i-002: Phrases need 3–6 entries with de and cz.')
    expect(issues).toContain('m365-i-001: Mark at least one fact the learner replaces with their own.')
    expect(issues).toContain('m365-i-001: Self-assessment criterion "followUp" needs a concrete description.')
  })

  it('needs 2–3 existing, distinct dictionary links', () => {
    const issues = check([
      {
        ...INTERVIEW,
        questions: [
          { ...TECH_Q, dictionary: ['identity-v-001'] },
          { ...STAR_Q, dictionary: ['identity-v-001', 'identity-v-001'] },
          { ...PERSONAL_Q, dictionary: ['identity-v-001', 'm365-v-099'] },
        ],
      },
    ])
    expect(issues).toContain('identity-i-001: Link 2–3 dictionary items.')
    expect(issues).toContain('identity-i-002: Dictionary links repeat each other.')
    expect(issues).toContain('m365-i-001: Dictionary link "m365-v-099" does not exist.')
  })

  it('applies the privacy rules and the local deny-list to interview texts', () => {
    const issues = check(
      [{ ...INTERVIEW, questions: [{ ...TECH_Q, de: 'Schreiben Sie an max.muster@firma.at.' }, STAR_Q, { ...PERSONAL_Q, cz: 'U firmy Contoso Wien.' }] }],
      { denylist: ['contoso wien'] },
    )
    expect(issues.some((i) => i.startsWith('identity-i-001: Looks like an e-mail address'))).toBe(true)
    expect(issues).toContain('m365-i-001: Contains a term from the local deny-list.')
  })
})
