import { describe, expect, it } from 'vitest'
import { localDay } from './localDay'
import { applyRating, GOOD_INTERVAL_DAYS, isDue, MAX_LEVEL, type CardState } from './scheduler'

const TODAY = '2026-11-04'

function state(partial: Partial<CardState> = {}): CardState {
  return { level: 2, due: TODAY, lastReviewed: '2026-10-28', lastRating: 'good', reviews: 3, againCount: 0, ...partial }
}

describe('scheduling ratings', () => {
  it('"Umím" on a new card starts the ladder at 3 days', () => {
    const s = applyRating(undefined, 'good', TODAY, 'schedule')
    expect(s).toEqual({ level: 1, due: '2026-11-07', lastReviewed: TODAY, lastRating: 'good', reviews: 1, againCount: 0 })
  })

  it('consecutive "Umím" grow the interval 3 → 7 → 14 → 30 → 60 days and stop at level 5', () => {
    let s: CardState | undefined
    let day = TODAY
    const intervals: number[] = []
    for (let i = 0; i < MAX_LEVEL + 1; i++) {
      s = applyRating(s, 'good', day, 'schedule')
      const gap = (Date.parse(s.due) - Date.parse(day)) / 86_400_000
      intervals.push(gap)
      day = s.due
    }
    expect(intervals).toEqual([...GOOD_INTERVAL_DAYS, 60])
    expect(s!.level).toBe(MAX_LEVEL)
  })

  it('"Těžké" plans the card for tomorrow and steps one level down', () => {
    expect(applyRating(undefined, 'hard', TODAY, 'schedule')).toMatchObject({ level: 0, due: '2026-11-05' })
    expect(applyRating(state({ level: 3 }), 'hard', TODAY, 'schedule')).toMatchObject({ level: 2, due: '2026-11-05' })
  })

  it('"Znovu" resets the level, plans tomorrow and counts the failure', () => {
    const s = applyRating(state({ level: 4, againCount: 1 }), 'again', TODAY, 'schedule')
    expect(s).toMatchObject({ level: 0, due: '2026-11-05', lastRating: 'again', reviews: 4, againCount: 2 })
  })

  it('does not penalise a break: an overdue card climbs normally from the review day', () => {
    const overdue = state({ level: 2, due: '2026-09-01' })
    expect(applyRating(overdue, 'good', TODAY, 'schedule')).toMatchObject({ level: 3, due: '2026-11-18' })
  })
})

describe('practice ratings never lengthen the plan', () => {
  it('"Umím" in practice keeps level and due date', () => {
    const before = state({ level: 2, due: '2026-11-10' })
    const after = applyRating(before, 'good', TODAY, 'practice')
    expect(after).toMatchObject({ level: 2, due: '2026-11-10', lastRating: 'good', lastReviewed: TODAY, reviews: 4 })
  })

  it('"Znovu" and "Těžké" in practice make the plan stricter', () => {
    const before = state({ level: 3, due: '2026-11-20' })
    expect(applyRating(before, 'again', TODAY, 'practice')).toMatchObject({ level: 0, due: '2026-11-05' })
    expect(applyRating(before, 'hard', TODAY, 'practice')).toMatchObject({ level: 2, due: '2026-11-05' })
  })

  it('a practice rating never moves an earlier due date later', () => {
    const failedToday = applyRating(state(), 'again', TODAY, 'schedule')
    const retried = applyRating(failedToday, 'good', TODAY, 'practice')
    expect(retried).toMatchObject({ level: 0, due: '2026-11-05' })
  })
})

describe('due dates by local calendar day', () => {
  it('is due on its day and stays due afterwards', () => {
    expect(isDue(state({ due: TODAY }), TODAY)).toBe(true)
    expect(isDue(state({ due: '2026-11-01' }), TODAY)).toBe(true)
    expect(isDue(state({ due: '2026-11-05' }), TODAY)).toBe(false)
    expect(isDue(undefined, TODAY)).toBe(false)
  })

  it('a rating one minute before midnight and one after land on consecutive days', () => {
    const before = applyRating(undefined, 'hard', localDay(new Date(2026, 10, 4, 23, 59)), 'schedule')
    const after = applyRating(undefined, 'hard', localDay(new Date(2026, 10, 5, 0, 1)), 'schedule')
    expect(before.due).toBe('2026-11-05')
    expect(after.due).toBe('2026-11-06')
    // The card rated before midnight is due as soon as the new day starts.
    expect(isDue(before, localDay(new Date(2026, 10, 5, 0, 0, 0)))).toBe(true)
    expect(isDue(before, localDay(new Date(2026, 10, 4, 23, 59, 59)))).toBe(false)
  })

  it('counts due dates in local calendar days across both daylight saving changes', () => {
    // Spring: the night of 28/29 March 2026 has 23 hours.
    const spring = applyRating(undefined, 'good', localDay(new Date(2026, 2, 28, 23, 30)), 'schedule')
    expect(spring).toMatchObject({ lastReviewed: '2026-03-28', due: '2026-03-31' })
    expect(isDue(spring, localDay(new Date(2026, 2, 31, 0, 1)))).toBe(true)
    expect(isDue(spring, localDay(new Date(2026, 2, 30, 23, 59)))).toBe(false)
    // Autumn: 25 October 2026 has 25 hours; "Znovu" late that evening means 26 October.
    const autumn = applyRating(undefined, 'again', localDay(new Date(2026, 9, 25, 23, 30)), 'schedule')
    expect(autumn).toMatchObject({ lastReviewed: '2026-10-25', due: '2026-10-26' })
  })
})
