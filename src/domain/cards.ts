import { evaluateAnswer, normalizeForCompare, spellingSlips, type CosmeticNote, type DiffPart, type Evaluation, type Hint } from './answerCheck'
import type {
  AcceptedVariant,
  AnswerRules,
  Card,
  CardId,
  ExerciseType,
  ItemId,
  StudyItem,
  Topic,
  WriteSpec,
} from './types'

export const CARD_ID_RE = /^([a-z0-9]+-[vsg]-\d{3}):(flashcard|write|grammar)$/

export function cardId(itemId: ItemId, exercise: ExerciseType): CardId {
  return `${itemId}:${exercise}`
}

export function parseCardId(id: string): { itemId: ItemId; exercise: ExerciseType } | null {
  const m = CARD_ID_RE.exec(id)
  if (!m) return null
  return { itemId: m[1] as string, exercise: m[2] as ExerciseType }
}

const DEFAULT_WRITE: WriteSpec = { mode: 'auto' }

export function writeSpecOf(item: StudyItem): WriteSpec | null {
  if (item.kind === 'grammar') return null
  if (item.kind === 'sentence') return item.write
  if (item.write === false) return null
  return item.write ?? DEFAULT_WRITE
}

export function exercisesOf(item: StudyItem): ExerciseType[] {
  if (item.kind === 'grammar') return ['grammar']
  const list: ExerciseType[] = []
  if (item.kind !== 'sentence') list.push('flashcard')
  if (writeSpecOf(item)) list.push('write')
  return list
}

/** Default rules per kind; an item may override them in write.rules. */
export function defaultRules(item: StudyItem): AnswerRules {
  // The first letter is free (phones capitalise it); nouns inside the answer keep their capital.
  if (item.kind === 'sentence') return { case: 'ignore-first', punctuation: 'ignore-final' }
  return { case: 'ignore-first', punctuation: 'ignore' }
}

export function answerRulesOf(item: StudyItem): AnswerRules {
  return { ...defaultRules(item), ...writeSpecOf(item)?.rules }
}

export function acceptedVariantsOf(item: StudyItem): AcceptedVariant[] {
  return writeSpecOf(item)?.accept ?? []
}

export function writePromptOf(item: StudyItem): string {
  return writeSpecOf(item)?.promptCz ?? item.cz
}

export function evaluateItemAnswer(item: StudyItem, given: string): Evaluation {
  const rules = answerRulesOf(item)
  const evaluation = evaluateAnswer(given, item.de, acceptedVariantsOf(item), rules)
  if (
    evaluation.result === 'incorrect' &&
    item.kind === 'noun' &&
    item.plural !== null &&
    normalizeForCompare(given, rules) === normalizeForCompare(item.plural, rules)
  ) {
    return { ...evaluation, hints: [{ type: 'plural-instead' }] }
  }
  return evaluation
}

/**
 * Result of a written answer, by writing mode.
 * - auto (one clear answer, e.g. a word with its article): correct only when it
 *   matches the solution or a listed variant; anything else is a mistake.
 * - compare (free translation of a sentence): a match with the model or a
 *   listed formulation counts as correct; a difference only in umlauts, ß or
 *   capital letters is a mistake (spelling never has a valid alternative);
 *   any other difference may be a correct alternative, so the learner compares
 *   with the model and rates themselves – the app shows where it differs.
 */
export type WrittenEvaluation =
  | Evaluation
  | {
      result: 'compare'
      /** The model or listed formulation closest to the answer. */
      closest: string
      /** Differences the app can name (article, a word, word order) – to check, not verdicts. */
      hints: Hint[]
      givenParts: DiffPart[]
      expectedParts: DiffPart[]
      notes?: CosmeticNote[]
    }

const SPELLING_HINTS = new Set<Hint['type']>(['special-letters', 'capitalization'])

export function evaluateWritten(item: StudyItem, given: string): WrittenEvaluation {
  const evaluation = evaluateItemAnswer(item, given)
  if (writeSpecOf(item)?.mode !== 'compare' || evaluation.result !== 'incorrect') return evaluation
  const spellingOnly = evaluation.hints.length > 0 && evaluation.hints.every((h) => SPELLING_HINTS.has(h.type))
  if (spellingOnly) return evaluation
  // When the whole difference cannot be named, a misspelt word still can (umlaut, ß, capital letter).
  const hints = evaluation.hints.length > 0 ? evaluation.hints : spellingSlips(given, evaluation.expected)
  return {
    result: 'compare',
    closest: evaluation.expected,
    hints,
    givenParts: evaluation.givenParts,
    expectedParts: evaluation.expectedParts,
    ...(evaluation.notes ? { notes: evaluation.notes } : {}),
  }
}

/** All cards in study-path order: topic order, then content order, flashcard before writing. */
export function buildCards(items: readonly StudyItem[], topics: readonly Topic[]): Card[] {
  const order = new Map(topics.map((t) => [t.id, t.order]))
  const sorted = items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (order.get(a.item.topic) ?? 0) - (order.get(b.item.topic) ?? 0) || a.index - b.index)
  const cards: Card[] = []
  for (const { item } of sorted) {
    for (const exercise of exercisesOf(item)) {
      cards.push({ id: cardId(item.id, exercise), item, exercise, pathIndex: cards.length })
    }
  }
  return cards
}
