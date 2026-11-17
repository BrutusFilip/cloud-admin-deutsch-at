import { describe, expect, it } from 'vitest'
import { evaluateItemAnswer, writeSpecOf } from '../domain/cards'
import { challengeCardIds, challengeResult } from '../domain/challenge'
import { ALL_CARDS, currentTurn, rateSubmitted, startLesson, submitAnswer, type Verdict } from '../domain/lesson'
import { evaluateGrammar, type GrammarResponse } from '../domain/grammar'
import { GRAMMAR_FOCI, GRAMMAR_TASK_TYPES, type GrammarItem } from '../domain/types'
import { validateChallenges, validateContent, validateInterviews } from '../domain/validateContent'
import { CARDS, CHALLENGES, INTERVIEWS, ITEMS, ITEM_BY_ID, RETIRED_IDS, TOPICS } from './index'
import { RELEASED_IDS, RELEASED_QUESTION_IDS } from './releasedIds'

/**
 * `npm run check:content`
 * Optional local deny-list (never committed, see .gitignore): one term per line
 * in content-denylist.local.txt – e.g. names of real employers or clients.
 */
const localFiles = import.meta.glob('/content-denylist.local.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const denylist = Object.values(localFiles)
  .flatMap((text) => text.split(/\r?\n/))
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#'))

const GRAMMAR = ITEMS.filter((i): i is GrammarItem => i.kind === 'grammar')

function fold(text: string): string {
  return text.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/Ä/g, 'A').replace(/Ö/g, 'O').replace(/Ü/g, 'U').replace(/ß/g, 'ss')
}

/** The answer the task defines as canonical. */
function canonicalResponse(item: GrammarItem): GrammarResponse {
  const task = item.task
  switch (task.type) {
    case 'gap':
      return { type: 'gap', value: task.answers[0] ?? '' }
    case 'transform':
      return { type: 'transform', value: task.answers[0] ?? '' }
    case 'choice':
      return { type: 'choice', index: task.correct }
    case 'order': {
      const used = new Set<number>()
      const picked: number[] = []
      let rest = task.answers[0] ?? ''
      while (rest !== '') {
        const index = task.tokens.findIndex((t, i) => !used.has(i) && (rest === t || rest.startsWith(`${t} `)))
        if (index < 0) break
        used.add(index)
        picked.push(index)
        rest = rest.slice((task.tokens[index] ?? '').length).trimStart()
      }
      return { type: 'order', picked }
    }
  }
}

describe('study content', () => {
  it('passes all content and privacy rules', () => {
    expect(validateContent(ITEMS, TOPICS, { retiredIds: RETIRED_IDS, denylist })).toEqual([])
  })

  it('defines valid "Incident za 5 kroků" cases', () => {
    expect(CHALLENGES.length).toBeGreaterThanOrEqual(3)
    expect(validateChallenges(CHALLENGES, ITEMS, { denylist })).toEqual([])
  })

  it('keeps every released ID (progress is stored per ID)', () => {
    const missing = RELEASED_IDS.filter((id) => !ITEM_BY_ID.has(id) && !RETIRED_IDS.includes(id))
    expect(missing, 'released IDs must stay or move to RETIRED_IDS').toEqual([])
    const unlisted = ITEMS.map((i) => i.id).filter((id) => !RELEASED_IDS.includes(id))
    expect(unlisted, 'add new IDs to src/content/releasedIds.ts').toEqual([])
    expect(new Set(RELEASED_IDS).size).toBe(RELEASED_IDS.length)
  })

  it('has at least 80 items, 15 of them grammar tasks, with a B2 majority', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(80)
    expect(GRAMMAR.length).toBeGreaterThanOrEqual(15)
    const b2 = ITEMS.filter((i) => i.level === 'B2').length
    expect(b2 * 2).toBeGreaterThan(ITEMS.length)
    for (const level of ['B1', 'C1'] as const) {
      expect(ITEMS.some((i) => i.level === level), level).toBe(true)
    }
  })

  it('spreads items over every topic and grammar over every focus and task type', () => {
    for (const topic of TOPICS) {
      expect(ITEMS.filter((i) => i.topic === topic.id).length, topic.id).toBeGreaterThanOrEqual(5)
    }
    for (const focus of GRAMMAR_FOCI) {
      expect(GRAMMAR.filter((g) => g.focus === focus).length, focus).toBeGreaterThanOrEqual(3)
    }
    for (const type of GRAMMAR_TASK_TYPES) {
      expect(GRAMMAR.filter((g) => g.task.type === type).length, type).toBeGreaterThanOrEqual(2)
    }
  })

  it('teaches nouns with article and plural, verbs with government and past forms', () => {
    for (const item of ITEMS) {
      if (item.kind === 'noun') {
        expect(item.de, item.id).toMatch(/^(der|die|das) \p{Lu}/u)
        expect(item.plural === null || item.plural.startsWith('die '), item.id).toBe(true)
      }
      if (item.kind === 'verb') {
        expect(item.government.length, item.id).toBeGreaterThan(0)
        expect(item.past, item.id).toMatch(/\b(hat|ist)\b/)
      }
    }
  })

  it('covers every item kind and all three exercises', () => {
    const kinds = new Set(ITEMS.map((i) => i.kind))
    expect([...kinds].sort()).toEqual(['grammar', 'noun', 'phrase', 'sentence', 'verb', 'word'])
    expect(CARDS.some((c) => c.exercise === 'flashcard')).toBe(true)
    expect(CARDS.some((c) => c.exercise === 'write' && c.item.kind === 'sentence')).toBe(true)
    expect(CARDS.filter((c) => c.exercise === 'grammar').length).toBe(GRAMMAR.length)
  })

  it('addresses people formally with Sie everywhere (no du, dich, dir, dein, euch, euer)', () => {
    const texts = JSON.stringify([ITEMS, INTERVIEWS, CHALLENGES])
    const informal = texts.match(/(?<!\p{L})(du|dich|dir|dein|deine[mnrs]?|euch|euer|eure[mnrs]?)(?!\p{L})/giu) ?? []
    expect(informal).toEqual([])
  })

  it('marks the sample experience as illustrative', () => {
    expect(ITEMS.some((i) => i.topic === 'intro' && i.illustrative === true)).toBe(true)
  })

  it('accepts the canonical answer of every writing exercise', () => {
    for (const card of CARDS.filter((c) => c.exercise === 'write')) {
      expect(evaluateItemAnswer(card.item, card.item.de).result, card.id).toBe('correct')
    }
  })

  it('does not silently accept a missing umlaut or ß', () => {
    for (const card of CARDS.filter((c) => c.exercise === 'write' && /[äöüÄÖÜß]/.test(c.item.de))) {
      expect(evaluateItemAnswer(card.item, fold(card.item.de)).result, card.id).toBe('incorrect')
    }
    for (const item of GRAMMAR) {
      const task = item.task
      if (task.type !== 'gap' && task.type !== 'transform') continue
      for (const answer of task.answers.filter((a) => /[äöüÄÖÜß]/.test(a))) {
        expect(evaluateGrammar(item, { type: task.type, value: fold(answer) }).result, item.id).toBe('incorrect')
      }
    }
  })

  it('compares every free sentence with the model; words and phrases have one checkable answer', () => {
    for (const item of ITEMS) {
      const spec = writeSpecOf(item)
      if (!spec) continue
      expect(spec.mode, item.id).toBe(item.kind === 'sentence' ? 'compare' : 'auto')
    }
  })

  it('says when a noun has no common plural', () => {
    for (const item of ITEMS) {
      if (item.kind !== 'noun' || item.plural !== null) continue
      expect(item.noteCz ?? '', item.id).toMatch(/jednotném čísle|Nemá plurál/)
    }
  })

  it('explains the one mistake of every wrong option in a choice task', () => {
    for (const item of GRAMMAR) {
      const task = item.task
      if (task.type !== 'choice') continue
      expect(task.whyCz.length, item.id).toBe(task.options.length)
      task.whyCz.forEach((why, i) => expect(why === '', `${item.id} option ${i}`).toBe(i === task.correct))
    }
  })

  it('lets every "Incident za 5 kroků" case be finished: right answers give 5 of 5, wrong ones still reach the result', () => {
    const NOW = new Date(2026, 10, 11, 9, 0)
    for (const challenge of CHALLENGES) {
      for (const way of ['right', 'wrong'] as const) {
        const ids = challengeCardIds(challenge, ITEM_BY_ID)
        expect(ids, challenge.id).toHaveLength(5)
        let lesson = startLesson('challenge', ids, ALL_CARDS, NOW, { challengeId: challenge.id })
        for (const cardId of ids) {
          const item = ITEM_BY_ID.get(cardId.split(':')[0] as string) as GrammarItem
          const verdict: Verdict = way === 'right' && evaluateGrammar(item, canonicalResponse(item)).result === 'correct' ? 'correct' : 'unknown'
          const turn = currentTurn(lesson)
          expect(lesson.queue[0], `${challenge.id} ${way}`).toBe(cardId)
          const handed = submitAnswer(lesson, cardId, turn, verdict, null, NOW)
          expect(handed, `${challenge.id} ${cardId}`).not.toBeNull()
          const rated = rateSubmitted(handed!, undefined, cardId, turn, verdict === 'correct' ? 'good' : 'again', NOW)
          expect(rated, `${challenge.id} ${cardId}`).not.toBeNull()
          lesson = rated!.lesson
        }
        expect(lesson.finishedAt, `${challenge.id} ${way}`).not.toBeNull()
        const result = challengeResult(lesson, challenge, ITEM_BY_ID)
        expect(result.correct, `${challenge.id} ${way}`).toBe(way === 'right' ? 5 : 0)
        expect(result.steps.every((s) => s.outcome !== 'skipped'), `${challenge.id} ${way}`).toBe(true)
      }
    }
  })

  it('solves every grammar task with its canonical answer and rejects the distractors', () => {
    for (const item of GRAMMAR) {
      const solved = evaluateGrammar(item, canonicalResponse(item))
      expect(solved, item.id).toMatchObject({ result: 'correct', canonical: true })
      const task = item.task
      if (task.type === 'choice') {
        task.options.forEach((_, index) => {
          if (index === task.correct) return
          expect(evaluateGrammar(item, { type: 'choice', index }).result, `${item.id} option ${index}`).toBe('incorrect')
        })
      }
      if (task.type === 'order') {
        const shown = task.tokens.map((_, i) => i)
        expect(evaluateGrammar(item, { type: 'order', picked: shown }).result, `${item.id} shown order`).toBe('incorrect')
      }
      if (task.type === 'gap' || task.type === 'transform') {
        expect(evaluateGrammar(item, { type: task.type, value: '   ' }).result, item.id).toBe('empty')
      }
    }
  })
})

describe('interview content (Pohovor)', () => {
  const questions = INTERVIEWS.flatMap((i) => i.questions)

  it('passes the interview rules', () => {
    expect(validateInterviews(INTERVIEWS, ITEMS, TOPICS, { denylist })).toEqual([])
  })

  it('has four short interviews with 3–4 questions and a follow-up for every question', () => {
    expect(INTERVIEWS.map((i) => i.id)).toEqual(['motivation', 'entra-access', 'vpn-incident', 'powershell-routine'])
    for (const interview of INTERVIEWS) {
      expect(interview.questions.length, interview.id).toBeGreaterThanOrEqual(3)
      expect(interview.questions.length, interview.id).toBeLessThanOrEqual(4)
      for (const q of interview.questions) expect(q.followUps.length, q.id).toBeGreaterThanOrEqual(1)
    }
  })

  it('trains STAR for experience and the four technical steps for technical questions', () => {
    expect(questions.some((q) => q.kind === 'experience')).toBe(true)
    expect(questions.some((q) => q.kind === 'technical')).toBe(true)
    for (const q of questions.filter((x) => x.kind === 'experience')) {
      expect(q.model.parts.map((p) => p.step), q.id).toEqual(['situation', 'task', 'action', 'result'])
    }
    for (const q of questions.filter((x) => x.kind === 'technical')) {
      expect(q.model.parts.map((p) => p.step), q.id).toEqual(['clarify', 'verify', 'safe', 'communicate'])
    }
  })

  it('keeps the tone example from the assignment word for word', () => {
    const vpn = questions.find((q) => q.id === 'network-i-001')!
    expect(vpn.de).toBe('Wie würden Sie vorgehen, wenn sich mehrere Mitarbeitende nach einer Änderung nicht mehr per VPN verbinden können?')
    expect(vpn.followUps[0]?.de).toBe('Welche Informationen würden Sie sammeln, bevor Sie den Vorfall eskalieren?')
    const model = vpn.model.parts.map((p) => p.de).join(' ')
    for (const sentence of [
      'Zuerst würde ich klären, seit wann das Problem auftritt und wer betroffen ist.',
      'Anschließend würde ich die Fehlermeldungen und die letzten Änderungen prüfen.',
      'Wenn ich den Vorfall nicht selbst beheben kann, würde ich die bisherigen Prüfschritte und die Auswirkungen dokumentieren und den Fall an das zuständige Team weitergeben.',
    ]) {
      expect(model).toContain(sentence)
    }
  })

  it('keeps every released question ID', () => {
    const ids = questions.map((q) => q.id)
    expect(RELEASED_QUESTION_IDS.filter((id) => !ids.includes(id))).toEqual([])
    expect(ids.filter((id) => !RELEASED_QUESTION_IDS.includes(id))).toEqual([])
  })
})
