import { addDays, type LocalDay } from './localDay'

/**
 * Spaced repetition – a deliberately simple ladder.
 *
 *  Rating | level            | next due date
 *  -------|------------------|-------------------------------------------
 *  Umím   | +1 (max 5)       | today + 3 / 7 / 14 / 30 / 60 days by new level
 *  Těžké  | −1 (min 0)       | tomorrow
 *  Znovu  | 0                | tomorrow; inside a lesson the card returns later
 *
 * Only a "scheduling" rating may lengthen an interval: the first rating of a
 * card in a lesson when the card is new or due. Every other rating (repeat
 * inside the lesson, "repeat mistakes", free practice of cards that are not
 * due) is "practice": it can make the plan stricter, never looser.
 * Overdue cards are not penalised – a break never lowers the level.
 */

export type Rating = 'again' | 'hard' | 'good'
export const RATINGS: readonly Rating[] = ['again', 'hard', 'good']

export type RatingEffect = 'schedule' | 'practice'

export interface CardState {
  /** 0 = learning / relearning, 1–5 = rung on the ladder */
  level: number
  due: LocalDay
  lastReviewed: LocalDay
  lastRating: Rating
  reviews: number
  againCount: number
}

export const MAX_LEVEL = 5
/** Interval after "Umím" for the new level 1–5. */
export const GOOD_INTERVAL_DAYS: readonly number[] = [3, 7, 14, 30, 60]
/** Level from which a card counts as consolidated (interval of 14+ days). */
export const MASTERED_LEVEL = 3

export function isDue(state: CardState | undefined, today: LocalDay): boolean {
  return state !== undefined && state.due <= today
}

export function goodIntervalDays(level: number): number {
  const index = Math.min(Math.max(level, 1), MAX_LEVEL) - 1
  return GOOD_INTERVAL_DAYS[index] ?? GOOD_INTERVAL_DAYS[GOOD_INTERVAL_DAYS.length - 1]!
}

export function applyRating(
  prev: CardState | undefined,
  rating: Rating,
  today: LocalDay,
  effect: RatingEffect,
): CardState {
  const common = {
    lastReviewed: today,
    lastRating: rating,
    reviews: (prev?.reviews ?? 0) + 1,
    againCount: (prev?.againCount ?? 0) + (rating === 'again' ? 1 : 0),
  }
  const tomorrow = addDays(today, 1)

  if (effect === 'practice' && prev) {
    if (rating === 'good') return { ...prev, ...common }
    const level = rating === 'again' ? 0 : Math.max(0, prev.level - 1)
    const due = prev.due < tomorrow ? prev.due : tomorrow
    return { ...prev, ...common, level, due }
  }

  const prevLevel = prev?.level ?? 0
  switch (rating) {
    case 'good': {
      const level = Math.min(MAX_LEVEL, prevLevel + 1)
      return { ...common, level, due: addDays(today, goodIntervalDays(level)) }
    }
    case 'hard':
      return { ...common, level: Math.max(0, prevLevel - 1), due: tomorrow }
    case 'again':
      return { ...common, level: 0, due: tomorrow }
  }
}
