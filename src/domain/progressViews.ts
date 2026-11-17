import { availability, LESSON_SIZE, matchesFilter, onePerItem, type CardFilter, type CardStates } from './lesson'
import type { LocalDay } from './localDay'
import { isDue, MASTERED_LEVEL, type CardState } from './scheduler'
import type { Card, CardId, StudyItem } from './types'

export type Status = 'new' | 'learning' | 'mastered'

export interface Counts {
  due: number
  fresh: number
  total: number
  started: number
  mastered: number
}

export function counts(cards: readonly Card[], states: CardStates, today: LocalDay, filter: CardFilter): Counts {
  const matching = cards.filter((c) => matchesFilter(c, filter))
  const { due, fresh } = availability(cards, states, today, filter)
  let started = 0
  let mastered = 0
  for (const c of matching) {
    const s = states[c.id]
    if (s) {
      started += 1
      if (s.level >= MASTERED_LEVEL) mastered += 1
    }
  }
  return { due: due.length, fresh: fresh.length, total: matching.length, started, mastered }
}

export interface TodayPlan extends Counts {
  /** Writing cards that wait for their flashcard: neither due nor new yet. */
  locked: number
  /** The next lesson, composed from the very same due and new cards as the counts. */
  lesson: CardId[]
  lessonDue: number
  lessonFresh: number
}

/**
 * Counts for "Dnes" and the next lesson in one pass over one availability, so
 * the numbers shown and the cards picked can never disagree.
 */
export function todayPlan(
  cards: readonly Card[],
  states: CardStates,
  today: LocalDay,
  filter: CardFilter,
  size = LESSON_SIZE,
): TodayPlan {
  const matching = cards.filter((c) => matchesFilter(c, filter))
  const { due, fresh } = availability(cards, states, today, filter)
  let started = 0
  let mastered = 0
  for (const c of matching) {
    const s = states[c.id]
    if (s) {
      started += 1
      if (s.level >= MASTERED_LEVEL) mastered += 1
    }
  }
  const lesson = onePerItem([...due, ...fresh]).slice(0, size)
  const lessonDue = lesson.filter((card) => isDue(states[card.id], today)).length
  return {
    due: due.length,
    fresh: fresh.length,
    total: matching.length,
    started,
    mastered,
    locked: matching.length - started - fresh.length,
    lesson: lesson.map((card) => card.id),
    lessonDue,
    lessonFresh: lesson.length - lessonDue,
  }
}

/** The nearest future due day among the filtered cards and how many cards fall on it. */
export function nextDue(
  cards: readonly Card[],
  states: CardStates,
  today: LocalDay,
  filter: CardFilter,
): { day: LocalDay; count: number } | null {
  let day: LocalDay | null = null
  let count = 0
  for (const c of cards) {
    if (!matchesFilter(c, filter)) continue
    const s = states[c.id]
    if (!s || s.due <= today) continue
    if (day === null || s.due < day) {
      day = s.due
      count = 1
    } else if (s.due === day) count += 1
  }
  return day === null ? null : { day, count }
}

export function cardStatus(state: CardState | undefined): Status {
  if (!state) return 'new'
  return state.level >= MASTERED_LEVEL ? 'mastered' : 'learning'
}

export function itemStatus(item: StudyItem, cards: readonly Card[], states: CardStates): Status {
  const own = cards.filter((c) => c.item.id === item.id)
  const statuses = own.map((c) => cardStatus(states[c.id]))
  if (statuses.every((s) => s === 'new')) return 'new'
  if (statuses.every((s) => s === 'mastered')) return 'mastered'
  return 'learning'
}
