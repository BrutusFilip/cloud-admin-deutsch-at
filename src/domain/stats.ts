import { emptyChecked, emptySelf, summarize, type CheckedCounts, type Lesson, type SelfCounts } from './lesson'

/**
 * Study statistics built only from real study events: a lesson is counted
 * once, at the moment it ends – never when its summary is shown again.
 *
 * Three things are kept apart on purpose:
 * - first-attempt accuracy: what the app checked (writing and grammar);
 * - own ratings: what the learner said about flashcards and compared sentences;
 * - lessons: completed (every card worked through) and ended early.
 */
export interface StudyStats {
  /** When counting started (the update that introduced statistics); earlier study is not included. */
  since: string
  lessons: { completed: number; endedEarly: number }
  firstAttempt: CheckedCounts
  selfRating: SelfCounts
  /** The most recently counted lessons; a lesson ID in this list is never counted again. */
  recorded: string[]
}

export const RECORDED_KEPT = 30

export function emptyStats(now: Date): StudyStats {
  return {
    since: now.toISOString(),
    lessons: { completed: 0, endedEarly: 0 },
    firstAttempt: emptyChecked(),
    selfRating: emptySelf(),
    recorded: [],
  }
}

function add<T extends object>(a: T, b: T): T {
  const sum = { ...a } as Record<string, number>
  for (const [key, value] of Object.entries(b as Record<string, number>)) sum[key] = (sum[key] ?? 0) + value
  return sum as T
}

/**
 * Counts a lesson that has ended. Idempotent: an unfinished lesson or one
 * already counted leaves the statistics unchanged. A lesson without a single
 * rating (started and left at once) is remembered but not counted.
 */
export function recordLesson(stats: StudyStats, lesson: Lesson): StudyStats {
  if (lesson.finishedAt === null || stats.recorded.includes(lesson.id)) return stats
  const recorded = [lesson.id, ...stats.recorded].slice(0, RECORDED_KEPT)
  if (lesson.log.length === 0) return { ...stats, recorded }
  const s = summarize(lesson)
  return {
    ...stats,
    recorded,
    lessons: s.completed
      ? { ...stats.lessons, completed: stats.lessons.completed + 1 }
      : { ...stats.lessons, endedEarly: stats.lessons.endedEarly + 1 },
    firstAttempt: add(stats.firstAttempt, s.checked),
    selfRating: add(stats.selfRating, s.self),
  }
}

/** Share of first attempts the app found correct (an allowed variant included; a claimed answer not). */
export function firstAttemptAccuracy(counts: CheckedCounts): { correct: number; total: number; percent: number | null } {
  const correct = counts.correct + counts.variant
  const total = correct + counts.accepted + counts.incorrect + counts.revealed
  return { correct, total, percent: total === 0 ? null : Math.round((correct / total) * 100) }
}
