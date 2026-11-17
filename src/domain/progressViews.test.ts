import { describe, expect, it } from 'vitest'
import { CARDS } from '../content'
import { addDays } from './localDay'
import { ALL_CARDS, availability, composeDaily, LESSON_SIZE, type CardFilter, type CardStates } from './lesson'
import { counts, todayPlan } from './progressViews'
import { isDue, RATINGS } from './scheduler'

/** The numbers on "Dnes" and the cards of the next lesson come from the same data. */

const TODAY = '2026-11-11'

/** Deterministic pseudo-random progress over the real content. */
function randomStates(seed: number): CardStates {
  let x = seed
  const next = () => {
    x = (x * 1103515245 + 12345) % 2147483648
    return x / 2147483648
  }
  const states: CardStates = {}
  for (const card of CARDS) {
    if (next() < 0.45) continue
    const level = Math.floor(next() * 6)
    states[card.id] = {
      level,
      due: addDays(TODAY, Math.floor(next() * 40) - 20),
      lastReviewed: addDays(TODAY, -Math.floor(next() * 30) - 1),
      lastRating: RATINGS[Math.floor(next() * 3)]!,
      reviews: level + 1,
      againCount: 0,
    }
  }
  return states
}

const FILTERS: CardFilter[] = [
  ALL_CARDS,
  { ...ALL_CARDS, topic: 'network' },
  { ...ALL_CARDS, topic: 'austria' },
  { ...ALL_CARDS, level: 'C1' },
]

describe('today plan', () => {
  it('derives counts and the lesson from one availability, for many random states', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const states = randomStates(seed)
      for (const filter of FILTERS) {
        const plan = todayPlan(CARDS, states, TODAY, filter)
        const { due, fresh } = availability(CARDS, states, TODAY, filter)
        const c = counts(CARDS, states, TODAY, filter)
        // Same numbers as the counters and the lesson composition elsewhere.
        expect({ due: plan.due, fresh: plan.fresh, total: plan.total, started: plan.started, mastered: plan.mastered }).toEqual(c)
        expect(plan.lesson).toEqual(composeDaily(CARDS, states, TODAY, filter))
        // The lesson takes only cards that the counters count, due ones first, at most 10, one per item.
        const counted = new Set([...due, ...fresh].map((card) => card.id))
        expect(plan.lesson.every((id) => counted.has(id))).toBe(true)
        expect(plan.lesson.length).toBeLessThanOrEqual(LESSON_SIZE)
        expect(new Set(plan.lesson.map((id) => id.split(':')[0])).size).toBe(plan.lesson.length)
        const firstFresh = plan.lesson.findIndex((id) => !isDue(states[id], TODAY))
        if (firstFresh >= 0) expect(plan.lesson.slice(firstFresh).every((id) => !isDue(states[id], TODAY))).toBe(true)
        expect(plan.lessonDue + plan.lessonFresh).toBe(plan.lesson.length)
        expect(plan.lessonDue).toBe(plan.lesson.filter((id) => isDue(states[id], TODAY)).length)
        expect(plan.locked).toBe(plan.total - plan.started - plan.fresh)
        expect(plan.locked).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('offers a lesson exactly when the counters show something to do', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const plan = todayPlan(CARDS, randomStates(seed), TODAY, { ...ALL_CARDS, topic: 'powershell' })
      expect(plan.lesson.length > 0).toBe(plan.due + plan.fresh > 0)
    }
  })
})
