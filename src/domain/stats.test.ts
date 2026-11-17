import { describe, expect, it } from 'vitest'
import { ALL_CARDS, currentTurn, finishEarly, rateSubmitted, startLesson, submitAnswer, type Lesson, type Verdict } from './lesson'
import type { Rating } from './scheduler'
import type { CardId } from './types'
import { emptyStats, firstAttemptAccuracy, recordLesson, RECORDED_KEPT } from './stats'

/** `npm run test:stats` – statistics come from real events and count each lesson once. */

const NOW = new Date(2026, 10, 11, 9, 0)

function play(cards: CardId[], turns: [Verdict, Rating][]): Lesson {
  let lesson = startLesson('daily', cards, ALL_CARDS, NOW)
  for (const [verdict, rating] of turns) {
    const id = lesson.queue[0]!
    const turn = currentTurn(lesson)
    lesson = rateSubmitted(submitAnswer(lesson, id, turn, verdict, null, NOW)!, undefined, id, turn, rating, NOW)!.lesson
  }
  return lesson
}

describe('study statistics', () => {
  it('counts a completed lesson once, however often its summary is shown', () => {
    const lesson = play(['a-v-001:flashcard', 'a-s-001:write'], [
      ['self', 'good'],
      ['correct', 'good'],
    ])
    expect(lesson.finishedAt).not.toBeNull()
    const once = recordLesson(emptyStats(NOW), lesson)
    expect(once.lessons).toEqual({ completed: 1, endedEarly: 0 })
    expect(recordLesson(once, lesson)).toBe(once)
  })

  it('does not count a lesson that is still running', () => {
    const running = play(['a-v-001:flashcard', 'a-s-001:write'], [['self', 'good']])
    expect(recordLesson(emptyStats(NOW), running)).toEqual(emptyStats(NOW))
  })

  it('separates first-attempt accuracy (checked by the app) from own ratings', () => {
    const lesson = play(['a-s-001:write', 'a-s-002:write', 'a-g-001:grammar', 'a-v-001:flashcard', 'a-s-003:write'], [
      ['correct', 'good'],
      ['incorrect', 'again'],
      ['unknown', 'again'],
      ['self', 'hard'],
      ['compared', 'good'],
      ['incorrect', 'again'], // a-s-002 again: not a first attempt
      ['unknown', 'again'], // a-g-001 again: not a first attempt
    ])
    // Both failed cards would come back once more; the learner ends the lesson here.
    const stats = recordLesson(emptyStats(NOW), finishEarly(lesson, {}, NOW).lesson)
    expect(stats.lessons).toEqual({ completed: 0, endedEarly: 1 })
    expect(stats.firstAttempt).toEqual({ correct: 1, variant: 0, accepted: 0, incorrect: 1, revealed: 1 })
    expect(stats.selfRating).toEqual({ again: 0, hard: 1, good: 1 })
    expect(firstAttemptAccuracy(stats.firstAttempt)).toEqual({ correct: 1, total: 3, percent: 33 })
  })

  it('a claimed answer is not counted as correct', () => {
    expect(firstAttemptAccuracy({ correct: 1, variant: 1, accepted: 2, incorrect: 0, revealed: 0 })).toEqual({ correct: 2, total: 4, percent: 50 })
    expect(firstAttemptAccuracy({ correct: 0, variant: 0, accepted: 0, incorrect: 0, revealed: 0 }).percent).toBeNull()
  })

  it('counts a lesson ended early separately and a lesson without ratings not at all', () => {
    const started = play(['a-v-001:flashcard', 'a-v-002:flashcard'], [['self', 'good']])
    const ended = finishEarly(started, {}, NOW).lesson
    const stats = recordLesson(emptyStats(NOW), ended)
    expect(stats.lessons).toEqual({ completed: 0, endedEarly: 1 })
    const empty = finishEarly(startLesson('daily', ['a-v-003:flashcard'], ALL_CARDS, NOW), {}, NOW).lesson
    const after = recordLesson(stats, empty)
    expect(after.lessons).toEqual(stats.lessons)
    expect(after.recorded[0]).toBe(empty.id)
  })

  it('remembers only the most recent lesson IDs', () => {
    let stats = emptyStats(NOW)
    for (let i = 0; i < RECORDED_KEPT + 5; i++) {
      const lesson = { ...play(['a-v-001:flashcard'], [['self', 'good']]), id: `l-${i}` }
      stats = recordLesson(stats, lesson)
    }
    expect(stats.recorded).toHaveLength(RECORDED_KEPT)
    expect(stats.lessons.completed).toBe(RECORDED_KEPT + 5)
  })
})
