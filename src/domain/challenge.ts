import { cardId } from './cards'
import { summarize, type Lesson, type LessonEntry } from './lesson'
import type { CardId, ChallengeCase, StudyItem } from './types'

/**
 * "Incident za 5 kroků": five auto-checked steps in a fixed order.
 * Accuracy counts the first (and in a challenge the only) attempt of each step
 * that the app found correct. An answer claimed as correct by the learner
 * ("uznáno vámi") and a revealed solution ("Nevím") are shown separately.
 */

export function challengeCardIds(challenge: ChallengeCase, items: ReadonlyMap<string, StudyItem>): CardId[] {
  return challenge.steps.map((step) => {
    const item = items.get(step.item)
    return cardId(step.item, item?.kind === 'grammar' ? 'grammar' : 'write')
  })
}

export type StepOutcome = 'correct' | 'accepted' | 'wrong' | 'revealed' | 'skipped'

export interface ChallengeStepResult {
  cardId: CardId
  stageCz: string
  outcome: StepOutcome
  entry: LessonEntry | undefined
}

export interface ChallengeResult {
  steps: ChallengeStepResult[]
  /** Steps the app found correct on the first attempt. */
  correct: number
  /** Steps answered wrongly but claimed as correct by the learner. */
  accepted: number
  /** Steps where the solution was revealed with "Nevím". */
  revealed: number
  total: number
  percent: number
  /** Wrong and revealed steps, offered for "Zopakovat chyby". */
  mistakes: CardId[]
}

function outcomeOf(entry: LessonEntry | undefined): StepOutcome {
  if (!entry) return 'skipped'
  switch (entry.verdict) {
    case 'accepted':
      return 'accepted'
    case 'unknown':
      return 'revealed'
    case 'correct':
    case 'variant':
      return 'correct'
    default:
      return 'wrong'
  }
}

export function challengeResult(lesson: Lesson, challenge: ChallengeCase, items: ReadonlyMap<string, StudyItem>): ChallengeResult {
  const ids = challengeCardIds(challenge, items)
  const { firstEntries } = summarize(lesson)
  const steps = ids.map((id, i) => {
    const entry = firstEntries[id]
    return { cardId: id, stageCz: challenge.steps[i]?.stageCz ?? '', outcome: outcomeOf(entry), entry }
  })
  const correct = steps.filter((s) => s.outcome === 'correct').length
  const total = steps.length
  return {
    steps,
    correct,
    accepted: steps.filter((s) => s.outcome === 'accepted').length,
    revealed: steps.filter((s) => s.outcome === 'revealed').length,
    total,
    percent: total === 0 ? 0 : Math.round((correct / total) * 100),
    mistakes: steps.filter((s) => s.outcome === 'wrong' || s.outcome === 'revealed').map((s) => s.cardId),
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
