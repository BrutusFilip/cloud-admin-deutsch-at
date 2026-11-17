import { evaluateAnswer, normalizeForCompare, normalizeText } from './answerCheck'
import { acceptedVariantsOf, answerRulesOf, exercisesOf, writeSpecOf } from './cards'
import {
  canonicalSentence,
  countBlanks,
  gapRules,
  isTokenPermutation,
  ORDER_RULES,
  transformRules,
} from './grammar'
import { isLocalDay } from './localDay'
import {
  ANSWER_STEPS,
  CHALLENGE_STEPS,
  GENDERS,
  GRAMMAR_FOCI,
  GRAMMAR_TASK_TYPES,
  INTERVIEW_QUESTION_KINDS,
  ITEM_KINDS,
  LEVELS,
  SELF_CHECK_IDS,
  type AnswerRules,
  type ChallengeCase,
  type Gender,
  type GrammarItem,
  type Interview,
  type StudyItem,
  type Topic,
} from './types'

/**
 * Content rules checked by `npm run check:content` (and by `npm test`):
 * IDs, required fields, valid types, answer definitions, sources, privacy,
 * and the "Incident za 5 kroků" cases. Data is checked as plain data, so
 * mistakes hidden by type casts are found too.
 */

export interface ContentIssue {
  id: string
  message: string
}

export interface ValidateOptions {
  retiredIds?: readonly string[]
  /** Extra forbidden terms, e.g. from a local, uncommitted deny-list. */
  denylist?: readonly string[]
}

const ITEM_ID_RE = /^([a-z0-9]+)-([vsg])-(\d{3})$/
const CHALLENGE_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const ARTICLE_GENDER: Record<string, Gender> = { der: 'm', die: 'f', das: 'n' }
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_RE = /\+\d[\d\s/-]{6,}\d|\b\d{3}[\s/-]?\d{3}[\s/-]?\d{3,}\b/
const URL_RE = /https?:\/\/|www\./i
const IPV4_RE = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g
const MAX_NOTE_LENGTH = 320
const MAX_EXPLANATION_LENGTH = 420
const MAX_WHY_LENGTH = 200
const MAX_TOKENS = 8
const ID_LETTER: Record<string, string> = { sentence: 's', grammar: 'g' }
const WRITE_MODES = new Set(['auto', 'compare'])
const POS = new Set(['adverb', 'adjective'])

function isAllowedIp(a: number, b: number, c: number): boolean {
  if (a === 10 || a === 127) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  // Documentation ranges (RFC 5737)
  if (a === 192 && b === 0 && c === 2) return true
  if (a === 198 && b === 51 && c === 100) return true
  if (a === 203 && b === 0 && c === 113) return true
  return false
}

function isText(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== ''
}

function isTextList(v: unknown): v is string[] {
  return Array.isArray(v) && v.length > 0 && v.every(isText)
}

function textsOf(item: StudyItem): string[] {
  const texts: unknown[] = [item.de, item.cz, item.example?.de, item.example?.cz, item.noteCz, item.atNote]
  if (item.kind === 'noun') texts.push(item.plural)
  if (item.kind === 'verb') texts.push(item.government, item.past)
  if (item.kind === 'phrase' || item.kind === 'word') texts.push(item.grammar)
  if (item.kind === 'grammar') {
    const task = item.task as unknown as Record<string, unknown>
    texts.push(item.promptCz, item.explanationCz, task?.text, task?.source)
    for (const key of ['answers', 'options', 'tokens', 'whyCz'] as const) {
      if (Array.isArray(task?.[key])) texts.push(...(task[key] as unknown[]))
    }
  } else {
    const write = item.kind === 'sentence' || item.write ? (item.write as unknown as Record<string, unknown> | undefined) : undefined
    if (write) {
      texts.push(write.promptCz)
      if (Array.isArray(write.accept)) {
        for (const v of write.accept as { text?: unknown; noteCz?: unknown }[]) texts.push(v?.text, v?.noteCz)
      }
    }
  }
  return texts.filter((t): t is string => typeof t === 'string' && t !== '')
}

/** Personal data and local deny-list terms in any text of the content. */
function privacyIssues(text: string, denylist: readonly string[]): string[] {
  const found: string[] = []
  if (EMAIL_RE.test(text)) found.push(`Looks like an e-mail address: "${text}".`)
  if (PHONE_RE.test(text)) found.push(`Looks like a phone number: "${text}".`)
  if (URL_RE.test(text)) found.push(`Links belong in sources, not in text: "${text}".`)
  for (const ip of text.matchAll(IPV4_RE)) {
    const [a, b, c] = [Number(ip[1]), Number(ip[2]), Number(ip[3])]
    if (!isAllowedIp(a, b, c)) found.push(`Public IP address in text: "${ip[0]}". Use RFC 5737 ranges.`)
  }
  const lower = text.toLocaleLowerCase('de-AT')
  for (const term of denylist) {
    if (lower.includes(term)) found.push('Contains a term from the local deny-list.')
  }
  return found
}

function normalizedDenylist(options: ValidateOptions): string[] {
  return (options.denylist ?? []).map((t) => t.trim().toLocaleLowerCase('de-AT')).filter(Boolean)
}

function uniqueUnder(values: readonly string[], rules: AnswerRules): boolean {
  const keys = values.map((v) => normalizeForCompare(v, rules))
  return new Set(keys).size === keys.length
}

function validateGrammar(item: GrammarItem, add: (message: string) => void): void {
  if (!(GRAMMAR_FOCI as readonly unknown[]).includes(item.focus)) add(`Unknown grammar focus "${String(item.focus)}".`)
  if (!isText(item.promptCz)) add('Missing promptCz (instruction).')
  if (!isText(item.explanationCz)) add('Missing explanationCz (why the solution works).')
  else if (item.explanationCz.length > MAX_EXPLANATION_LENGTH) add(`explanationCz is longer than ${MAX_EXPLANATION_LENGTH} characters.`)

  const task = item.task as unknown as Record<string, unknown> | undefined
  if (!task || typeof task !== 'object') {
    add('Missing task.')
    return
  }
  if (!(GRAMMAR_TASK_TYPES as readonly unknown[]).includes(task.type)) {
    add(`Unknown task type "${String(task.type)}".`)
    return
  }

  switch (item.task.type) {
    case 'gap': {
      const t = item.task
      if (!isText(t.text) || countBlanks(t.text) !== 1) add('Gap text needs exactly one blank "___".')
      if (!isTextList(t.answers)) {
        add('Gap needs at least one non-empty answer.')
        break
      }
      const rules = gapRules(t)
      if (!uniqueUnder(t.answers, rules)) add('Gap answers repeat each other.')
      for (const a of t.answers) {
        if (evaluateAnswer(a, t.answers[0] as string, t.answers.slice(1).map((text) => ({ text })), rules).result !== 'correct') {
          add(`Gap answer "${a}" is not accepted by the checker.`)
        }
      }
      break
    }
    case 'choice': {
      const t = item.task
      if (t.text !== undefined && (!isText(t.text) || countBlanks(t.text) !== 1)) add('Choice text needs exactly one blank "___" (or no text).')
      if (!isTextList(t.options) || t.options.length < 2 || t.options.length > 4) {
        add('Choice needs 2–4 non-empty options.')
        break
      }
      if (!uniqueUnder(t.options, { case: 'ignore', punctuation: 'ignore' })) add('Choice options repeat each other.')
      if (!Number.isInteger(t.correct) || t.correct < 0 || t.correct >= t.options.length) add('Choice "correct" must point to one of the options.')
      // Every wrong option explains its one mistake; the correct one leaves its entry empty.
      const why: unknown = (t as { whyCz?: unknown }).whyCz
      if (!Array.isArray(why) || why.length !== t.options.length) {
        add('Choice needs whyCz with one entry per option.')
        break
      }
      why.forEach((text, i) => {
        if (i === t.correct) {
          if (text !== '') add('whyCz of the correct option must be empty.')
        } else if (!isText(text)) add(`Wrong option ${i + 1} needs a reason in whyCz.`)
        else if (text.length > MAX_WHY_LENGTH) add(`whyCz of option ${i + 1} is longer than ${MAX_WHY_LENGTH} characters.`)
      })
      break
    }
    case 'order': {
      const t = item.task
      if (!isText(t.text) || countBlanks(t.text) !== 1) add('Order text needs exactly one blank "___".')
      if (!isTextList(t.tokens) || t.tokens.length < 2 || t.tokens.length > MAX_TOKENS) {
        add(`Order needs 2–${MAX_TOKENS} non-empty tokens.`)
        break
      }
      if (new Set(t.tokens.map((x) => normalizeText(x))).size !== t.tokens.length) add('Order tokens repeat each other.')
      if (!isTextList(t.answers)) {
        add('Order needs at least one answer.')
        break
      }
      if (!uniqueUnder(t.answers, ORDER_RULES)) add('Order answers repeat each other.')
      for (const a of t.answers) {
        if (!isTokenPermutation(a, t.tokens)) add(`Order answer "${a}" does not use exactly the given tokens.`)
      }
      const shown = normalizeText(t.tokens.join(' '))
      if (t.answers.some((a) => normalizeText(a) === shown)) add('Order tokens are already shown in a correct order.')
      break
    }
    case 'transform': {
      const t = item.task
      if (!isText(t.source)) add('Transform needs a source text.')
      if (!isTextList(t.answers)) {
        add('Transform needs at least one answer.')
        break
      }
      const rules = transformRules(t)
      if (!uniqueUnder(t.answers, rules)) add('Transform answers repeat each other.')
      if (isText(t.source) && t.answers.some((a) => normalizeForCompare(a, rules) === normalizeForCompare(t.source, rules))) {
        add('Transform answer equals the source; nothing to transform.')
      }
      for (const a of t.answers) {
        if (evaluateAnswer(a, t.answers[0] as string, t.answers.slice(1).map((text) => ({ text })), rules).result !== 'correct') {
          add(`Transform answer "${a}" is not accepted by the checker.`)
        }
      }
      break
    }
  }

  if (isText(item.de) && normalizeText(canonicalSentence(item)) !== normalizeText(item.de)) {
    add(`The solved task "${canonicalSentence(item)}" differs from de "${item.de}".`)
  }
}

export function validateContent(
  items: readonly StudyItem[],
  topics: readonly Topic[],
  options: ValidateOptions = {},
): ContentIssue[] {
  const issues: ContentIssue[] = []
  const topicIds = new Set(topics.map((t) => t.id))
  const retired = new Set(options.retiredIds ?? [])
  const seen = new Set<string>()
  const denylist = normalizedDenylist(options)

  if (new Set(topics.map((t) => t.id)).size !== topics.length) issues.push({ id: 'topics', message: 'Duplicate topic ID.' })
  if (new Set(topics.map((t) => t.order)).size !== topics.length) issues.push({ id: 'topics', message: 'Duplicate topic order.' })

  for (const item of items) {
    const id = typeof item.id === 'string' ? item.id : String(item.id)
    const add = (message: string) => issues.push({ id, message })

    if (!(ITEM_KINDS as readonly unknown[]).includes(item.kind)) {
      add(`Unknown item kind "${String(item.kind)}".`)
      continue
    }
    const m = ITEM_ID_RE.exec(id)
    if (!m) add('ID must look like <topic>-<v|s|g>-<NNN>.')
    else {
      if (m[1] !== item.topic) add(`ID prefix "${m[1]}" does not match topic "${item.topic}".`)
      const letter = ID_LETTER[item.kind] ?? 'v'
      if (m[2] !== letter) add(`Kind "${item.kind}" needs the letter "${letter}" in its ID.`)
    }
    if (seen.has(id)) add('Duplicate item ID.')
    seen.add(id)
    if (retired.has(id)) add('Retired IDs must not be reused.')
    if (!topicIds.has(item.topic)) add(`Unknown topic "${String(item.topic)}".`)
    if (!(LEVELS as readonly unknown[]).includes(item.level)) add(`Unknown level "${String(item.level)}".`)
    for (const [field, value] of [
      ['de', item.de],
      ['cz', item.cz],
      ['example.de', item.example?.de],
      ['example.cz', item.example?.cz],
    ] as const) {
      if (!isText(value)) add(`Missing ${field}.`)
    }
    for (const [field, value] of [
      ['noteCz', item.noteCz],
      ['atNote', item.atNote],
    ] as const) {
      if (value !== undefined && (!isText(value) || value.length > MAX_NOTE_LENGTH)) {
        add(`${field} must be non-empty text of at most ${MAX_NOTE_LENGTH} characters.`)
      }
    }
    if (item.illustrative !== undefined && item.illustrative !== true) add('illustrative must be true or omitted.')

    if (item.kind === 'noun') {
      if (!(GENDERS as readonly unknown[]).includes(item.gender)) add(`Unknown gender "${String(item.gender)}".`)
      const [article, noun] = isText(item.de) ? item.de.split(' ') : []
      if (!article || ARTICLE_GENDER[article] !== item.gender) add('Noun must start with the article matching its gender.')
      if (!noun || noun.charAt(0) !== noun.charAt(0).toLocaleUpperCase('de-AT')) add('Noun must be capitalised.')
      if (item.plural === undefined) add('Missing plural (use null when there is none).')
      else if (item.plural !== null && (!isText(item.plural) || !item.plural.startsWith('die '))) add('Plural must start with "die ".')
    }
    if (item.kind === 'verb') {
      if (!isText(item.government)) add('Missing government.')
      else if (!item.government.includes(item.de.replace(/^sich /, ''))) add('Government must contain the infinitive.')
      if (!isText(item.past)) add('Missing past forms.')
    }
    if (item.kind === 'word' && !POS.has(item.pos)) add(`Unknown part of speech "${String(item.pos)}".`)

    if (item.kind === 'grammar') {
      validateGrammar(item, add)
    } else {
      const raw = (item as { write?: unknown }).write
      if (item.kind === 'sentence' && (raw === undefined || raw === false)) add('Sentence needs a writing exercise.')
      const write = writeSpecOf(item)
      if (write) {
        if (!WRITE_MODES.has(write.mode)) add(`Unknown writing mode "${String(write.mode)}".`)
        if (write.accept !== undefined && !Array.isArray(write.accept)) add('write.accept must be a list.')
        const rules = answerRulesOf(item)
        if (isText(item.de) && evaluateAnswer(item.de, item.de, [], rules).result !== 'correct') add('Canonical answer does not match itself.')
        const normalized = new Set<string>(isText(item.de) ? [normalizeForCompare(item.de, rules)] : [])
        for (const variant of acceptedVariantsOf(item)) {
          if (!isText(variant?.text)) {
            add('Empty accepted variant.')
            continue
          }
          const key = normalizeForCompare(variant.text, rules)
          if (normalized.has(key)) add(`Accepted variant "${variant.text}" duplicates another answer.`)
          normalized.add(key)
          if (evaluateAnswer(variant.text, item.de, acceptedVariantsOf(item), rules).result !== 'correct') {
            add(`Accepted variant "${variant.text}" is not accepted by the checker.`)
          }
        }
      }
    }

    for (const source of item.sources ?? []) {
      if (!isText(source.label)) add('Source needs a label.')
      if (!isText(source.url) || !source.url.startsWith('https://')) add('Source URL must use https.')
      if (!isLocalDay(source.checkedAt)) add('Source checkedAt must be YYYY-MM-DD.')
    }

    for (const text of textsOf(item)) {
      for (const message of privacyIssues(text, denylist)) add(message)
    }
  }
  return issues
}

/** Cases of "Incident za 5 kroků": five existing, auto-checked, distinct steps each; texts pass the privacy rules. */
export function validateChallenges(
  cases: readonly ChallengeCase[],
  items: readonly StudyItem[],
  options: ValidateOptions = {},
): ContentIssue[] {
  const issues: ContentIssue[] = []
  const denylist = normalizedDenylist(options)
  const byId = new Map(items.map((i) => [i.id, i]))
  const seen = new Set<string>()
  for (const c of cases) {
    const id = `challenge:${String(c.id)}`
    const add = (message: string) => issues.push({ id, message })
    if (!isText(c.id) || !CHALLENGE_ID_RE.test(c.id)) add('Challenge ID must be kebab-case.')
    if (seen.has(c.id)) add('Duplicate challenge ID.')
    seen.add(c.id)
    if (!(LEVELS as readonly unknown[]).includes(c.level)) add(`Unknown level "${String(c.level)}".`)
    for (const [field, value] of [
      ['titleCz', c.titleCz],
      ['titleDe', c.titleDe],
      ['situationDe', c.situationDe],
      ['situationCz', c.situationCz],
    ] as const) {
      if (!isText(value)) add(`Missing ${field}.`)
      else for (const message of privacyIssues(value, denylist)) add(message)
    }
    if (!Array.isArray(c.steps) || c.steps.length !== CHALLENGE_STEPS) {
      add(`A challenge needs exactly ${CHALLENGE_STEPS} steps.`)
      continue
    }
    const stepItems = new Set<string>()
    c.steps.forEach((step, i) => {
      const where = `Step ${i + 1}`
      if (!isText(step?.stageCz)) add(`${where} needs a stage name.`)
      else for (const message of privacyIssues(step.stageCz, denylist)) add(message)
      const item = byId.get(step?.item)
      if (!item) {
        add(`${where} refers to unknown item "${String(step?.item)}".`)
        return
      }
      if (stepItems.has(item.id)) add(`${where} repeats item "${item.id}".`)
      stepItems.add(item.id)
      const autoChecked = item.kind === 'grammar' || (exercisesOf(item).includes('write') && writeSpecOf(item)?.mode === 'auto')
      if (!autoChecked) add(`${where} item "${item.id}" must be checked automatically (grammar task or auto writing).`)
    })
  }
  return issues
}

const QUESTION_ID_RE = /^([a-z0-9]+)-i-(\d{3})$/
const ANSWER_SECONDS = new Set([60, 75, 90])

function count(text: string, part: string): number {
  return part === '' ? 0 : text.split(part).length - 1
}

/**
 * Pohovor: 3–4 questions per interview, each with a follow-up, a model answer
 * in the steps of its structure, facts to replace, phrases, a concrete
 * checklist and 2–3 existing dictionary items. Texts pass the privacy rules.
 */
export function validateInterviews(
  interviews: readonly Interview[],
  items: readonly StudyItem[],
  topics: readonly Topic[],
  options: ValidateOptions = {},
): ContentIssue[] {
  const issues: ContentIssue[] = []
  const denylist = normalizedDenylist(options)
  const itemIds = new Set(items.map((i) => i.id))
  const topicIds = new Set(topics.map((t) => t.id))
  const interviewIds = new Set<string>()
  const questionIds = new Set<string>()
  const privacy = (add: (message: string) => void, ...texts: unknown[]) => {
    for (const text of texts) if (typeof text === 'string') for (const message of privacyIssues(text, denylist)) add(message)
  }

  for (const interview of interviews) {
    const iid = `interview:${String(interview.id)}`
    const addI = (message: string) => issues.push({ id: iid, message })
    if (!isText(interview.id) || !CHALLENGE_ID_RE.test(interview.id)) addI('Interview ID must be kebab-case.')
    if (interviewIds.has(interview.id)) addI('Duplicate interview ID.')
    interviewIds.add(interview.id)
    if (!(LEVELS as readonly unknown[]).includes(interview.level)) addI(`Unknown level "${String(interview.level)}".`)
    for (const [field, value] of [
      ['titleCz', interview.titleCz],
      ['titleDe', interview.titleDe],
      ['contextDe', interview.contextDe],
      ['contextCz', interview.contextCz],
    ] as const) {
      if (!isText(value)) addI(`Missing ${field}.`)
    }
    privacy(addI, interview.titleCz, interview.titleDe, interview.contextDe, interview.contextCz)
    if (!Array.isArray(interview.questions) || interview.questions.length < 3 || interview.questions.length > 4) {
      addI('An interview needs 3–4 questions.')
      if (!Array.isArray(interview.questions)) continue
    }

    for (const q of interview.questions) {
      const qid = typeof q?.id === 'string' ? q.id : String(q?.id)
      const add = (message: string) => issues.push({ id: qid, message })
      const m = QUESTION_ID_RE.exec(qid)
      if (!m) add('Question ID must look like <topic>-i-<NNN>.')
      else if (m[1] !== q.topic) add(`ID prefix "${m[1]}" does not match topic "${String(q.topic)}".`)
      if (questionIds.has(qid)) add('Duplicate question ID.')
      questionIds.add(qid)
      if (!topicIds.has(q.topic)) add(`Unknown topic "${String(q.topic)}".`)
      if (!(INTERVIEW_QUESTION_KINDS as readonly unknown[]).includes(q.kind)) {
        add(`Unknown question kind "${String(q.kind)}".`)
        continue
      }
      if (!ANSWER_SECONDS.has(q.seconds)) add('Answer time must be 60, 75 or 90 seconds.')
      if (!isText(q.de)) add('Missing de (question).')
      if (!isText(q.cz)) add('Missing cz (translation).')
      if (!Array.isArray(q.hintCz) || q.hintCz.length < 2 || q.hintCz.length > 5 || !q.hintCz.every(isText)) add('Hint needs 2–5 points.')
      if (!Array.isArray(q.startersDe) || q.startersDe.length < 1 || q.startersDe.length > 4 || !q.startersDe.every(isText)) {
        add('Starters need 1–4 phrases.')
      }

      if (!Array.isArray(q.followUps) || q.followUps.length < 1) add('A question needs at least one follow-up.')
      const followUps = Array.isArray(q.followUps) ? q.followUps : []
      followUps.forEach((f, i) => {
        if (!isText(f?.de) || !isText(f?.cz) || !isText(f?.model?.de) || !isText(f?.model?.cz)) {
          add(`Follow-up ${i + 1} needs de, cz and a model answer (de, cz).`)
        }
      })

      const parts = Array.isArray(q.model?.parts) ? q.model.parts : []
      const steps = parts.map((p) => p?.step)
      const expected = ANSWER_STEPS[q.kind]
      if (steps.length !== expected.length || steps.some((step, i) => step !== expected[i])) {
        add(`Model answer must follow the steps ${expected.join(' → ')}.`)
      }
      if (!parts.every((p) => isText(p?.de))) add('Every model part needs text.')
      if (!isText(q.model?.cz)) add('Model answer needs a Czech translation.')

      const modelText = [...parts.map((p) => (typeof p?.de === 'string' ? p.de : '')), ...followUps.map((f) => f?.model?.de ?? '')].join('\n')
      if (!Array.isArray(q.replace) || q.replace.length < 1) add('Mark at least one fact the learner replaces with their own.')
      for (const r of Array.isArray(q.replace) ? q.replace : []) {
        if (!isText(r?.text) || !isText(r?.noteCz)) {
          add('A fact to replace needs text and noteCz.')
          continue
        }
        const n = count(modelText, r.text)
        if (n !== 1) add(`Fact to replace "${r.text}" must occur exactly once in the model answers (found ${n}).`)
      }

      if (!Array.isArray(q.phrases) || q.phrases.length < 3 || q.phrases.length > 6 || !q.phrases.every((p) => isText(p?.de) && isText(p?.cz))) {
        add('Phrases need 3–6 entries with de and cz.')
      }
      for (const id of SELF_CHECK_IDS) {
        if (!isText(q.checks?.[id])) add(`Self-assessment criterion "${id}" needs a concrete description.`)
      }
      const links = Array.isArray(q.dictionary) ? q.dictionary : []
      if (links.length < 2 || links.length > 3) add('Link 2–3 dictionary items.')
      if (new Set(links).size !== links.length) add('Dictionary links repeat each other.')
      for (const id of links) if (!itemIds.has(id)) add(`Dictionary link "${String(id)}" does not exist.`)

      privacy(
        add,
        q.de,
        q.cz,
        ...(q.hintCz ?? []),
        ...(q.startersDe ?? []),
        ...followUps.flatMap((f) => [f?.de, f?.cz, f?.model?.de, f?.model?.cz]),
        ...parts.map((p) => p?.de),
        q.model?.cz,
        ...(q.replace ?? []).flatMap((r) => [r?.text, r?.noteCz]),
        ...(q.phrases ?? []).flatMap((p) => [p?.de, p?.cz]),
        ...SELF_CHECK_IDS.map((id) => q.checks?.[id]),
      )
    }
  }
  return issues
}
