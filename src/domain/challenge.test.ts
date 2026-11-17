import { describe, expect, it } from 'vitest'
import { buildCards } from './cards'
import { challengeCardIds, challengeResult, formatDuration } from './challenge'
import { ALL_CARDS, elapsedSeconds, endEarly, rateCurrent, startLesson, summarize, wouldRequeue, type Lesson, type Verdict } from './lesson'
import type { Rating } from './scheduler'
import { CHALLENGE, GRAMMAR_ITEMS } from './__fixtures__/grammar'
import { ITEMS, TOPICS } from './__fixtures__/items'
import type { CardId, StudyItem } from './types'

const ALL: StudyItem[] = [...ITEMS, ...GRAMMAR_ITEMS]
const BY_ID = new Map(ALL.map((i) => [i.id, i]))
const NOW = new Date(2026, 10, 10, 18, 0, 0)

function answer(lesson: Lesson, rating: Rating, verdict: Verdict, seconds: number): Lesson {
  const at = new Date(NOW.getTime() + seconds * 1000)
  return rateCurrent(lesson, undefined, rating, verdict, at).lesson
}

describe('"Incident za 5 kroků"', () => {
  it('maps steps to grammar or writing cards in a fixed order', () => {
    expect(challengeCardIds(CHALLENGE, BY_ID)).toEqual([
      'identity-g-001:grammar',
      'm365-g-002:grammar',
      'm365-g-003:grammar',
      'identity-s-001:write',
      'identity-g-003:grammar',
    ])
    const known = new Set(buildCards(ALL, TOPICS).map((c) => c.id))
    expect(challengeCardIds(CHALLENGE, BY_ID).every((id) => known.has(id))).toBe(true)
  })

  it('gives each step one attempt: a wrong answer is not requeued', () => {
    const lesson = startLesson('challenge', challengeCardIds(CHALLENGE, BY_ID), ALL_CARDS, NOW, { challengeId: CHALLENGE.id })
    expect(lesson).toMatchObject({ kind: 'challenge', challengeId: 'test-case', timed: false })
    expect(wouldRequeue(lesson)).toBe(false)
    const after = answer(lesson, 'again', 'incorrect', 10)
    expect(after.queue).toEqual(lesson.queue.slice(1))
  })

  it('reports first-attempt accuracy, mistakes to repeat and steps not reached', () => {
    let lesson = startLesson('challenge', challengeCardIds(CHALLENGE, BY_ID), ALL_CARDS, NOW, { challengeId: CHALLENGE.id, timed: true })
    lesson = answer(lesson, 'good', 'correct', 20)
    lesson = answer(lesson, 'again', 'incorrect', 45)
    lesson = answer(lesson, 'hard', 'accepted', 70)
    lesson = answer(lesson, 'again', 'unknown', 90)
    lesson = endEarly(lesson, new Date(NOW.getTime() + 95_000))

    const result = challengeResult(lesson, CHALLENGE, BY_ID)
    expect(result.steps.map((s) => s.outcome)).toEqual(['correct', 'wrong', 'accepted', 'revealed', 'skipped'])
    // Accuracy counts what the app found correct; a claimed answer and a revealed solution are shown apart.
    expect(result).toMatchObject({ correct: 1, accepted: 1, revealed: 1, total: 5, percent: 20 })
    expect(result.mistakes).toEqual<CardId[]>(['m365-g-002:grammar', 'identity-s-001:write'])
    expect(result.steps[0]?.stageCz).toBe('Upřesnění')
    expect(summarize(lesson).firstCorrect).toBe(2)
    expect(elapsedSeconds(lesson, new Date(NOW.getTime() + 999_000))).toBe(95)
  })

  it('stores the optional stopwatch only for challenges', () => {
    expect(startLesson('daily', [], ALL_CARDS, NOW, { timed: true, challengeId: 'x' })).toMatchObject({ timed: false, challengeId: null })
  })

  it('formats durations as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(600)).toBe('10:00')
  })
})
