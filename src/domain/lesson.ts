import { localDay, type LocalDay } from './localDay'
import { applyRating, isDue, type CardState, type Rating, type RatingEffect } from './scheduler'
import type { Card, CardId, ExerciseType, GrammarFocus, Level, PracticeMode, TopicId } from './types'

/**
 * A lesson is a short queue of cards.
 *
 * - Composition: due cards first (longest waiting first), free places filled
 *   with new cards in study-path order; at most LESSON_SIZE cards and at most
 *   one card per item.
 * - "Znovu" puts the card back REQUEUE_GAP cards later; at most MAX_ATTEMPTS
 *   attempts per card and lesson, then it waits for tomorrow. A challenge
 *   ("Incident za 5 kroků") never requeues: each step gets one attempt and
 *   mistakes are offered at the end.
 * - Every turn has two saved steps: the answer is handed in (`submitAnswer`,
 *   kept as `pending`), then rated (`rateSubmitted`). Both steps name the card
 *   and the turn (number of ratings so far), so a repeated click, a second
 *   Enter or an event from an older screen is ignored instead of counted
 *   twice, and leaving or reloading shows the same result again.
 * - Every rating is saved immediately, so leaving a lesson loses nothing.
 *   An unfinished lesson can be resumed on the same local day; from the next
 *   day on it is closed and its unrated cards simply stay due or new. A wrong
 *   or revealed answer that was handed in counts as "Znovu" even then.
 */

export const LESSON_SIZE = 10
export const MAX_ATTEMPTS = 3
export const REQUEUE_GAP = 3
/** Longest answer kept with a submission (sentences are much shorter). */
export const MAX_ANSWER_LENGTH = 2000

/** Card states keyed by card ID. Unknown IDs (removed content) are kept untouched. */
export type CardStates = Record<string, CardState>

export interface CardFilter {
  topic: TopicId | 'all'
  level: Level | 'all'
  /** 'listen' selects the flashcards and presents them by ear (see PracticeMode). */
  exercise: PracticeMode | 'mixed'
  /** Grammar phenomenon; anything but 'all' limits the cards to grammar tasks of that focus. */
  focus: GrammarFocus | 'all'
}

export const ALL_CARDS: CardFilter = { topic: 'all', level: 'all', exercise: 'mixed', focus: 'all' }

export type LessonKind = 'daily' | 'free' | 'mistakes' | 'item' | 'challenge'

/**
 * What the learner did before rating: rated a flashcard themselves ('self'),
 * answered correctly or with an allowed variant, answered wrongly and possibly
 * claimed the answer as correct ('accepted'), revealed the solution with
 * "Nevím" ('unknown') or compared a free sentence with the model ('compared').
 */
export type Verdict = 'self' | 'correct' | 'variant' | 'incorrect' | 'accepted' | 'unknown' | 'compared'
export const VERDICTS: readonly Verdict[] = ['self', 'correct', 'variant', 'incorrect', 'accepted', 'unknown', 'compared']
/** Verdicts an answer is handed in with; 'accepted' only follows 'incorrect'. */
export const SUBMIT_VERDICTS: readonly Verdict[] = ['self', 'correct', 'variant', 'incorrect', 'unknown', 'compared']

/** The learner's answer, kept with the submission so the same result can be shown again. */
export type AnswerResponse =
  | { type: 'text'; value: string }
  | { type: 'choice'; index: number }
  | { type: 'order'; picked: number[] }

/**
 * An answer handed in for the current card and not rated yet. It is saved:
 * leaving the lesson or a reload shows the same result again, and the card
 * cannot be answered a second time in the same turn.
 */
export interface Submission {
  cardId: CardId
  /** Ratings in the lesson when the answer was handed in; identifies the turn. */
  turn: number
  verdict: Verdict
  /** Typed text, chosen option or word order; null for a flashcard and for "Nevím". */
  response: AnswerResponse | null
  at: string
}

/** Ratings that fit a verdict: a wrong or revealed answer is "Znovu", a correct one at least "Těžké". */
export function allowedRatings(verdict: Verdict): readonly Rating[] {
  switch (verdict) {
    case 'incorrect':
    case 'unknown':
      return ['again']
    case 'correct':
    case 'variant':
    case 'accepted':
      return ['hard', 'good']
    case 'self':
    case 'compared':
      return ['again', 'hard', 'good']
  }
}

export interface LessonEntry {
  cardId: CardId
  rating: Rating
  effect: RatingEffect
  verdict: Verdict
  at: string
}

export interface Lesson {
  id: string
  kind: LessonKind
  filter: CardFilter
  startedDay: LocalDay
  startedAt: string
  /** Distinct cards in their original order. */
  cards: CardId[]
  /** Remaining queue; queue[0] is the current card. */
  queue: CardId[]
  attempts: Record<string, number>
  log: LessonEntry[]
  /** Answer to the current card handed in and waiting for its rating. */
  pending: Submission | null
  finishedAt: string | null
  /** Route to return to after the lesson, e.g. a dictionary entry. */
  origin: string | null
  /** Challenge case ID when kind is 'challenge'. */
  challengeId: string | null
  /** Optional stopwatch for a challenge; never blocks answering. */
  timed: boolean
}

export interface StartOptions {
  origin?: string | null
  challengeId?: string | null
  timed?: boolean
}

/** The card exercise a filter selects: listening practises the flashcards. */
export function cardExercise(exercise: CardFilter['exercise']): ExerciseType | 'mixed' {
  return exercise === 'listen' ? 'flashcard' : exercise
}

export function matchesFilter(card: Card, filter: CardFilter): boolean {
  if (filter.focus !== 'all' && (card.item.kind !== 'grammar' || card.item.focus !== filter.focus)) return false
  const exercise = cardExercise(filter.exercise)
  return (
    (filter.topic === 'all' || card.item.topic === filter.topic) &&
    (filter.level === 'all' || card.item.level === filter.level) &&
    (exercise === 'mixed' || card.exercise === exercise)
  )
}

/**
 * New cards that may enter a lesson. In mixed lessons a vocabulary writing
 * card waits until its flashcard has been rated once – you write a word after
 * you have seen it. When writing is chosen explicitly, everything is open.
 */
export function isNewEligible(card: Card, states: CardStates, filter: CardFilter): boolean {
  if (states[card.id] !== undefined) return false
  if (filter.exercise === 'mixed' && card.exercise === 'write' && card.item.kind !== 'sentence') {
    return states[`${card.item.id}:flashcard`] !== undefined
  }
  return true
}

export interface Availability {
  due: Card[]
  fresh: Card[]
}

export function availability(
  cards: readonly Card[],
  states: CardStates,
  today: LocalDay,
  filter: CardFilter,
): Availability {
  const matching = cards.filter((c) => matchesFilter(c, filter))
  const due = matching
    .filter((c) => isDue(states[c.id], today))
    .sort((a, b) => {
      const da = states[a.id]!.due
      const db = states[b.id]!.due
      return da < db ? -1 : da > db ? 1 : a.pathIndex - b.pathIndex
    })
  const fresh = matching.filter((c) => isNewEligible(c, states, filter))
  return { due, fresh }
}

/**
 * At most one card per item in a lesson: a flashcard shown right before the
 * writing card of the same item would give the answer away. The other card
 * stays due (or new) for the next lesson.
 */
export function onePerItem(cards: readonly Card[]): Card[] {
  const seen = new Set<string>()
  return cards.filter((c) => {
    if (seen.has(c.item.id)) return false
    seen.add(c.item.id)
    return true
  })
}

export function composeDaily(
  cards: readonly Card[],
  states: CardStates,
  today: LocalDay,
  filter: CardFilter,
  size = LESSON_SIZE,
): CardId[] {
  const { due, fresh } = availability(cards, states, today, filter)
  return onePerItem([...due, ...fresh])
    .slice(0, size)
    .map((c) => c.id)
}

/** Free practice: cards already seen and not due, soonest first. Never lengthens intervals. */
export function composeFree(
  cards: readonly Card[],
  states: CardStates,
  today: LocalDay,
  filter: CardFilter,
  size = LESSON_SIZE,
): CardId[] {
  const seen = cards
    .filter((c) => matchesFilter(c, filter))
    .filter((c) => {
      const s = states[c.id]
      return s !== undefined && s.due > today
    })
    .sort((a, b) => {
      const sa = states[a.id]!
      const sb = states[b.id]!
      return (sa.due < sb.due ? -1 : sa.due > sb.due ? 1 : 0) || sa.level - sb.level || a.pathIndex - b.pathIndex
    })
  return onePerItem(seen)
    .slice(0, size)
    .map((c) => c.id)
}

/** Cards whose last rating was "Znovu" or "Těžké", most recent first. */
export function mistakeCards(cards: readonly Card[], states: CardStates, filter: CardFilter): Card[] {
  return cards
    .filter((c) => matchesFilter(c, filter))
    .filter((c) => {
      const s = states[c.id]
      return s !== undefined && (s.lastRating === 'again' || s.lastRating === 'hard')
    })
    .sort((a, b) => {
      const la = states[a.id]!.lastReviewed
      const lb = states[b.id]!.lastReviewed
      return la > lb ? -1 : la < lb ? 1 : a.pathIndex - b.pathIndex
    })
}

/** Quick repeat of mistakes: most recent first, one card per item. Never lengthens intervals. */
export function composeMistakes(
  cards: readonly Card[],
  states: CardStates,
  filter: CardFilter,
  size = LESSON_SIZE,
): CardId[] {
  return onePerItem(mistakeCards(cards, states, filter))
    .slice(0, size)
    .map((c) => c.id)
}

export function startLesson(
  kind: LessonKind,
  cardIds: readonly CardId[],
  filter: CardFilter,
  now: Date,
  options: StartOptions = {},
): Lesson {
  const ids = [...new Set(cardIds)]
  return {
    id: `l-${now.getTime().toString(36)}`,
    kind,
    filter,
    startedDay: localDay(now),
    startedAt: now.toISOString(),
    cards: ids,
    queue: [...ids],
    attempts: {},
    log: [],
    pending: null,
    finishedAt: ids.length === 0 ? now.toISOString() : null,
    origin: options.origin ?? null,
    challengeId: kind === 'challenge' ? (options.challengeId ?? null) : null,
    timed: kind === 'challenge' && options.timed === true,
  }
}

export function currentCardId(lesson: Lesson): CardId | null {
  return lesson.finishedAt === null ? (lesson.queue[0] ?? null) : null
}

/** The current turn: how many ratings the lesson has. Each card on screen belongs to exactly one turn. */
export function currentTurn(lesson: Lesson): number {
  return lesson.log.length
}

/** The submission of the current turn, if the answer has been handed in. */
export function pendingFor(lesson: Lesson): Submission | null {
  const p = lesson.pending
  return p && p.cardId === currentCardId(lesson) && p.turn === lesson.log.length ? p : null
}

function isCurrentTurn(lesson: Lesson, cardId: CardId, turn: number): boolean {
  return lesson.finishedAt === null && currentCardId(lesson) === cardId && lesson.log.length === turn
}

/**
 * Hands in the answer to the current card. Returns null – nothing changes – when
 * the call is stale (another card or turn, finished lesson) or the answer of
 * this turn is already in.
 */
export function submitAnswer(
  lesson: Lesson,
  cardId: CardId,
  turn: number,
  verdict: Verdict,
  response: AnswerResponse | null,
  now: Date,
): Lesson | null {
  if (!isCurrentTurn(lesson, cardId, turn) || lesson.pending !== null) return null
  if (!SUBMIT_VERDICTS.includes(verdict)) return null
  const kept: AnswerResponse | null =
    response && response.type === 'text' ? { type: 'text', value: response.value.slice(0, MAX_ANSWER_LENGTH) } : response
  return { ...lesson, pending: { cardId, turn, verdict, response: kept, at: now.toISOString() } }
}

/** "Moje odpověď je také správná" after a wrong answer: the rating then starts at "Těžké". */
export function acceptAnswer(lesson: Lesson, cardId: CardId, turn: number): Lesson | null {
  const p = pendingFor(lesson)
  if (!p || p.cardId !== cardId || p.turn !== turn || p.verdict !== 'incorrect') return null
  return { ...lesson, pending: { ...p, verdict: 'accepted' } }
}

/** Whether the next rating of the current card will schedule (may lengthen) or only practise. */
export function ratingEffectFor(lesson: Lesson, prev: CardState | undefined, today: LocalDay): RatingEffect {
  const id = currentCardId(lesson)
  if (id === null) return 'practice'
  const firstInLesson = !lesson.log.some((e) => e.cardId === id)
  return firstInLesson && (prev === undefined || prev.due <= today) ? 'schedule' : 'practice'
}

/** Whether "Znovu" would bring the current card back in this lesson. */
export function wouldRequeue(lesson: Lesson): boolean {
  const id = currentCardId(lesson)
  if (id === null || lesson.kind === 'challenge') return false
  return (lesson.attempts[id] ?? 0) + 1 < MAX_ATTEMPTS
}

export interface RateResult {
  lesson: Lesson
  state: CardState
  effect: RatingEffect
  requeued: boolean
}

export function rateCurrent(
  lesson: Lesson,
  prev: CardState | undefined,
  rating: Rating,
  verdict: Verdict,
  now: Date,
): RateResult {
  const id = currentCardId(lesson)
  if (id === null) throw new Error('The lesson has no current card.')
  const today = localDay(now)
  const effect = ratingEffectFor(lesson, prev, today)
  const requeued = rating === 'again' && wouldRequeue(lesson)
  const state = applyRating(prev, rating, today, effect)
  const attempts = (lesson.attempts[id] ?? 0) + 1
  const rest = lesson.queue.slice(1)
  const queue = requeued ? [...rest.slice(0, REQUEUE_GAP), id, ...rest.slice(REQUEUE_GAP)] : rest
  const entry: LessonEntry = { cardId: id, rating, effect, verdict, at: now.toISOString() }
  return {
    lesson: {
      ...lesson,
      queue,
      attempts: { ...lesson.attempts, [id]: attempts },
      log: [...lesson.log, entry],
      pending: null,
      finishedAt: queue.length === 0 ? now.toISOString() : null,
    },
    state,
    effect,
    requeued,
  }
}

/**
 * Rates the handed-in answer of the current turn – exactly once. Returns null
 * when the call is stale, when no answer is in, or when the rating does not
 * fit the verdict (e.g. "Umím" after a wrong answer).
 */
export function rateSubmitted(
  lesson: Lesson,
  prev: CardState | undefined,
  cardId: CardId,
  turn: number,
  rating: Rating,
  now: Date,
): RateResult | null {
  const p = pendingFor(lesson)
  if (!p || !isCurrentTurn(lesson, cardId, turn) || p.cardId !== cardId) return null
  if (!allowedRatings(p.verdict).includes(rating)) return null
  return rateCurrent(lesson, prev, rating, p.verdict, now)
}

/** Ends the lesson without touching cards (a lesson whose queue is not empty counts as ended early). */
export function endEarly(lesson: Lesson, now: Date): Lesson {
  return lesson.finishedAt ? lesson : { ...lesson, pending: null, finishedAt: now.toISOString() }
}

/**
 * Ends a lesson before its queue is empty: the "Ukončit lekci" button, a new
 * lesson replacing it, or a lesson from an earlier day. A wrong or revealed
 * answer that was already handed in still counts as "Znovu" (dated when it
 * was handed in); leaving cannot hide it. Other answers waiting for a rating
 * are dropped and their cards stay as they were.
 */
export function finishEarly(lesson: Lesson, cards: CardStates, now: Date): { lesson: Lesson; cards: CardStates } {
  if (lesson.finishedAt !== null) return { lesson, cards }
  let next = lesson
  let states = cards
  const p = pendingFor(lesson)
  if (p && (p.verdict === 'incorrect' || p.verdict === 'unknown')) {
    const at = new Date(p.at)
    const result = rateCurrent(lesson, cards[p.cardId], 'again', p.verdict, Number.isNaN(at.getTime()) ? now : at)
    next = result.lesson
    states = { ...cards, [p.cardId]: result.state }
  }
  return { lesson: { ...next, pending: null, finishedAt: next.finishedAt ?? now.toISOString() }, cards: states }
}

/** Every card of the lesson was worked through; a lesson ended early does not count. */
export function isCompleted(lesson: Lesson): boolean {
  return lesson.finishedAt !== null && lesson.queue.length === 0 && lesson.log.length > 0
}

export function isResumable(lesson: Lesson | null, today: LocalDay): lesson is Lesson {
  return lesson !== null && lesson.finishedAt === null && lesson.queue.length > 0 && lesson.startedDay === today
}

/** Drops cards that no longer exist in the content (e.g. after an update). */
export function pruneLesson(lesson: Lesson, known: ReadonlySet<string>, now: Date): Lesson {
  const queue = lesson.queue.filter((id) => known.has(id))
  const cards = lesson.cards.filter((id) => known.has(id))
  if (queue.length === lesson.queue.length && cards.length === lesson.cards.length) return lesson
  const pruned = { ...lesson, queue, cards }
  return {
    ...pruned,
    pending: pendingFor(pruned),
    finishedAt: lesson.finishedAt ?? (queue.length === 0 ? now.toISOString() : null),
  }
}

/** First attempts of auto-checked cards (writing, grammar): checked by the app, not by the learner. */
export interface CheckedCounts {
  correct: number
  /** An allowed variant of the answer. */
  variant: number
  /** Wrong according to the check, claimed as correct by the learner. */
  accepted: number
  incorrect: number
  /** "Nevím – ukázat řešení". */
  revealed: number
}

/** First own ratings: flashcards and free sentences compared with the model. */
export interface SelfCounts {
  again: number
  hard: number
  good: number
}

export function emptyChecked(): CheckedCounts {
  return { correct: 0, variant: 0, accepted: 0, incorrect: 0, revealed: 0 }
}

export function emptySelf(): SelfCounts {
  return { again: 0, hard: 0, good: 0 }
}

export interface LessonSummary {
  total: number
  rated: number
  first: Record<Rating, number>
  /** First attempt not rated "Znovu". */
  firstCorrect: number
  /** First log entry of every rated card. */
  firstEntries: Partial<Record<CardId, LessonEntry>>
  /** First attempts the app checked (writing, grammar). */
  checked: CheckedCounts
  /** First ratings the learner gave themselves (flashcards, compared sentences). */
  self: SelfCounts
  /** Cards rated "Znovu" or "Těžké" at least once, in order of first appearance. */
  mistakes: CardId[]
  repeats: number
  /** Cards not reached because the lesson was ended early. */
  skipped: number
  /** Every card worked through, nothing left in the queue. */
  completed: boolean
}

export function summarize(lesson: Lesson): LessonSummary {
  const first: Record<Rating, number> = { again: 0, hard: 0, good: 0 }
  const checked = emptyChecked()
  const self = emptySelf()
  const firstEntries: Partial<Record<CardId, LessonEntry>> = {}
  const mistakes: CardId[] = []
  for (const entry of lesson.log) {
    if (!firstEntries[entry.cardId]) {
      firstEntries[entry.cardId] = entry
      first[entry.rating] += 1
      switch (entry.verdict) {
        case 'self':
        case 'compared':
          self[entry.rating] += 1
          break
        case 'unknown':
          checked.revealed += 1
          break
        default:
          checked[entry.verdict] += 1
      }
    }
    if ((entry.rating === 'again' || entry.rating === 'hard') && !mistakes.includes(entry.cardId)) {
      mistakes.push(entry.cardId)
    }
  }
  const rated = Object.keys(firstEntries).length
  return {
    total: lesson.cards.length,
    rated,
    first,
    firstCorrect: first.hard + first.good,
    firstEntries,
    checked,
    self,
    mistakes,
    repeats: lesson.log.length - rated,
    skipped: lesson.cards.filter((id) => !firstEntries[id]).length,
    completed: isCompleted(lesson),
  }
}

/** Elapsed whole seconds of a lesson (up to `now` while it runs). */
export function elapsedSeconds(lesson: Lesson, now: Date): number {
  const end = lesson.finishedAt ? Date.parse(lesson.finishedAt) : now.getTime()
  return Math.max(0, Math.floor((end - Date.parse(lesson.startedAt)) / 1000))
}
