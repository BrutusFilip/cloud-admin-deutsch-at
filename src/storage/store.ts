import {
  CHECK_VALUES,
  emptyInterviewProgress,
  EVIDENCE_LEVELS,
  INTERVIEW_PHASES,
  MAX_ATTEMPTS_KEPT,
  OWN_EXAMPLE_MAX_LENGTH,
  type InterviewAttempt,
  type InterviewProgress,
  type InterviewSession,
  type OwnExample,
} from '../domain/interview'
import { isLocalDay } from '../domain/localDay'
import { MAX_ANSWER_LENGTH, VERDICTS, type AnswerResponse, type CardFilter, type Lesson, type LessonEntry, type Submission } from '../domain/lesson'
import { MAX_LEVEL, RATINGS, type CardState } from '../domain/scheduler'
import { emptyStats, RECORDED_KEPT, type StudyStats } from '../domain/stats'
import { LEVELS, PRACTICE_MODES, SELF_CHECK_IDS, type TopicId } from '../domain/types'

/**
 * Persisted progress, schema version 5.
 * Progress is keyed by stable card IDs, so adding cards never touches it and
 * entries for cards that no longer exist are kept as they are.
 *
 * History: v1 (E1) → v2 (E4): filters got a grammar `focus`, lessons got
 * `challengeId` and `timed`, new lesson kind 'challenge', new exercise 'grammar'.
 * v2 → v3 (E5): interview attempts, own examples and session (`interview`),
 * read-aloud settings (`prefs.speech`). v3 → v4: interface language
 * (`prefs.uiLanguage`). v4 → v5 (stage 7): write revision `rev`, the answer
 * waiting for its rating (`lesson.pending`), study statistics (`stats`) and
 * the interview hint (`session.hinted`, `attempt.hint`).
 *
 * Reading order: the envelope (app, version) and the cards – the part no
 * migration ever changes – are checked first; only valid data is migrated, in
 * memory, and the result is validated completely. Nothing is written while
 * reading; the original text is kept as a backup before the first write of a
 * migrated version.
 */

export const APP_ID = 'cloud-admin-deutsch-at'
/** Every key of this app in the browser storage starts with this prefix (reset removes exactly these). */
export const APP_KEY_PREFIX = 'cloud-admin-deutsch-at:'
export const STORAGE_KEY = 'cloud-admin-deutsch-at:progress'
/** The stored text as it was before the last migration to a newer schema. */
export const BACKUP_KEY = 'cloud-admin-deutsch-at:backup'
export const SCHEMA_VERSION = 5

/** Interface language. Study content stays the same: German questions, Czech translations. */
export type UiLanguage = 'cs' | 'de'
export const UI_LANGUAGES: readonly UiLanguage[] = ['cs', 'de']

/** Reading questions aloud (Web Speech API). `voiceURI` null = automatic: de-AT, else de-DE. */
export interface SpeechPrefs {
  enabled: boolean
  voiceURI: string | null
}

export interface Prefs {
  todayTopic: TopicId | 'all'
  practice: CardFilter
  speech: SpeechPrefs
  uiLanguage: UiLanguage
}

export interface Store {
  app: typeof APP_ID
  schemaVersion: typeof SCHEMA_VERSION
  /** Number of saved writes; a write is refused when the stored revision is not the one this tab saw last. */
  rev: number
  createdAt: string
  updatedAt: string
  cards: Record<string, CardState>
  lesson: Lesson | null
  interview: InterviewProgress
  prefs: Prefs
  stats: StudyStats
}

export const DEFAULT_PREFS: Prefs = {
  todayTopic: 'all',
  practice: { topic: 'all', level: 'all', exercise: 'flashcard', focus: 'all' },
  speech: { enabled: true, voiceURI: null },
  uiLanguage: 'cs',
}

export function createStore(now: Date): Store {
  const iso = now.toISOString()
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    rev: 0,
    createdAt: iso,
    updatedAt: iso,
    cards: {},
    lesson: null,
    interview: emptyInterviewProgress(),
    prefs: { ...DEFAULT_PREFS, practice: { ...DEFAULT_PREFS.practice }, speech: { ...DEFAULT_PREFS.speech } },
    stats: emptyStats(now),
  }
}

export type StoreValidation =
  | { ok: true; store: Store; migratedFrom: number | null }
  | { ok: false; kind: 'corrupt'; reason: string; recoverable: { store: Store; dropped: number } | null }
  | { ok: false; kind: 'unsupported'; version: number }

/** Card keys are validated loosely so future exercise types survive. */
const CARD_KEY_RE = /^[a-z0-9-]{1,80}:[a-z-]{1,20}$/
const TOPIC_RE = /^[a-z0-9]{1,30}$/
const FOCUS_RE = /^[a-z-]{1,20}$/
const CHALLENGE_ID_RE = /^[a-z0-9-]{1,40}$/
const QUESTION_ID_RE = /^[a-z0-9]{1,30}-i-\d{3}$/
const INTERVIEW_ID_RE = /^[a-z0-9-]{1,40}$/
const LESSON_KINDS = new Set(['daily', 'free', 'mistakes', 'item', 'challenge'])
/** Order and choice tasks have a few tokens or options; anything larger is not from this app. */
const MAX_RESPONSE_INDEX = 60

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isInt(v: unknown, min: number, max = Number.MAX_SAFE_INTEGER): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max
}

function isIso(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v))
}

function isCardKey(v: unknown): v is string {
  return typeof v === 'string' && CARD_KEY_RE.test(v)
}

export function isCardState(v: unknown): v is CardState {
  if (!isObject(v)) return false
  return (
    isInt(v.level, 0, MAX_LEVEL) &&
    isLocalDay(v.due) &&
    isLocalDay(v.lastReviewed) &&
    typeof v.lastRating === 'string' &&
    (RATINGS as readonly string[]).includes(v.lastRating) &&
    isInt(v.reviews, 1) &&
    isInt(v.againCount, 0) &&
    (v.againCount as number) <= (v.reviews as number)
  )
}

function isFilter(v: unknown): v is CardFilter {
  if (!isObject(v)) return false
  const topicOk = v.topic === 'all' || (typeof v.topic === 'string' && TOPIC_RE.test(v.topic))
  const levelOk = v.level === 'all' || (LEVELS as readonly unknown[]).includes(v.level)
  const exerciseOk = v.exercise === 'mixed' || (PRACTICE_MODES as readonly unknown[]).includes(v.exercise)
  const focusOk = v.focus === 'all' || (typeof v.focus === 'string' && FOCUS_RE.test(v.focus))
  return topicOk && levelOk && exerciseOk && focusOk
}

function isVerdict(v: unknown): boolean {
  return typeof v === 'string' && (VERDICTS as readonly string[]).includes(v)
}

function isEntry(v: unknown): v is LessonEntry {
  if (!isObject(v)) return false
  return (
    isCardKey(v.cardId) &&
    typeof v.rating === 'string' &&
    (RATINGS as readonly string[]).includes(v.rating) &&
    (v.effect === 'schedule' || v.effect === 'practice') &&
    isVerdict(v.verdict) &&
    isIso(v.at)
  )
}

function isCardList(v: unknown, max: number): v is string[] {
  return Array.isArray(v) && v.length <= max && v.every(isCardKey)
}

function isResponse(v: unknown): v is AnswerResponse {
  if (!isObject(v)) return false
  switch (v.type) {
    case 'text':
      return Object.keys(v).length === 2 && typeof v.value === 'string' && v.value.length <= MAX_ANSWER_LENGTH
    case 'choice':
      return Object.keys(v).length === 2 && isInt(v.index, 0, MAX_RESPONSE_INDEX)
    case 'order':
      return (
        Object.keys(v).length === 2 &&
        Array.isArray(v.picked) &&
        v.picked.length <= MAX_RESPONSE_INDEX &&
        v.picked.every((i) => isInt(i, 0, MAX_RESPONSE_INDEX)) &&
        new Set(v.picked).size === v.picked.length
      )
    default:
      return false
  }
}

function isSubmission(v: unknown): v is Submission {
  if (!isObject(v)) return false
  return (
    isCardKey(v.cardId) &&
    isInt(v.turn, 0, 2000) &&
    isVerdict(v.verdict) &&
    (v.response === null || isResponse(v.response)) &&
    isIso(v.at)
  )
}

export function isLesson(v: unknown): v is Lesson {
  if (!isObject(v)) return false
  const attemptsOk =
    isObject(v.attempts) && Object.entries(v.attempts).every(([k, n]) => isCardKey(k) && isInt(n, 1, 1000))
  const shapeOk =
    typeof v.id === 'string' &&
    v.id.length <= 40 &&
    typeof v.kind === 'string' &&
    LESSON_KINDS.has(v.kind) &&
    isFilter(v.filter) &&
    isLocalDay(v.startedDay) &&
    isIso(v.startedAt) &&
    isCardList(v.cards, 200) &&
    isCardList(v.queue, 600) &&
    attemptsOk &&
    Array.isArray(v.log) &&
    v.log.length <= 2000 &&
    v.log.every(isEntry) &&
    (v.finishedAt === null || isIso(v.finishedAt)) &&
    (v.origin === null || (typeof v.origin === 'string' && v.origin.startsWith('#/') && v.origin.length <= 200)) &&
    (v.challengeId === null || (typeof v.challengeId === 'string' && CHALLENGE_ID_RE.test(v.challengeId))) &&
    typeof v.timed === 'boolean'
  if (!shapeOk) return false
  // An answer waits only for the current card of the current turn of an open lesson.
  if (v.pending === null) return true
  return (
    isSubmission(v.pending) &&
    v.finishedAt === null &&
    v.pending.cardId === (v.queue as string[])[0] &&
    v.pending.turn === (v.log as unknown[]).length
  )
}

function isSpeechPrefs(v: unknown): v is SpeechPrefs {
  if (!isObject(v)) return false
  return typeof v.enabled === 'boolean' && (v.voiceURI === null || (typeof v.voiceURI === 'string' && v.voiceURI.length <= 300))
}

function isPrefs(v: unknown): v is Prefs {
  if (!isObject(v)) return false
  const topicOk = v.todayTopic === 'all' || (typeof v.todayTopic === 'string' && TOPIC_RE.test(v.todayTopic))
  const languageOk = typeof v.uiLanguage === 'string' && (UI_LANGUAGES as readonly string[]).includes(v.uiLanguage)
  return topicOk && isFilter(v.practice) && isSpeechPrefs(v.speech) && languageOk
}

function hasCounts(v: unknown, keys: readonly string[]): boolean {
  return isObject(v) && Object.keys(v).length === keys.length && keys.every((k) => isInt(v[k], 0))
}

export function isStats(v: unknown): v is StudyStats {
  if (!isObject(v)) return false
  return (
    isIso(v.since) &&
    hasCounts(v.lessons, ['completed', 'endedEarly']) &&
    hasCounts(v.firstAttempt, ['correct', 'variant', 'accepted', 'incorrect', 'revealed']) &&
    hasCounts(v.selfRating, ['again', 'hard', 'good']) &&
    Array.isArray(v.recorded) &&
    v.recorded.length <= RECORDED_KEPT &&
    v.recorded.every((id) => typeof id === 'string' && id.length > 0 && id.length <= 40)
  )
}

// ---------------------------------------------------------------- interview

function isCheckValue(v: unknown): boolean {
  return typeof v === 'string' && (CHECK_VALUES as readonly string[]).includes(v)
}

function isPartialCheck(v: unknown): boolean {
  return isObject(v) && Object.entries(v).every(([k, value]) => (SELF_CHECK_IDS as readonly string[]).includes(k) && isCheckValue(value))
}

function isAttempt(v: unknown): v is InterviewAttempt {
  if (!isObject(v) || !isIso(v.at) || !isInt(v.followUp, 0, 9) || !isObject(v.checks)) return false
  if (v.hint !== undefined && typeof v.hint !== 'boolean') return false
  const checks = v.checks
  return Object.keys(checks).length === SELF_CHECK_IDS.length && SELF_CHECK_IDS.every((id) => isCheckValue(checks[id]))
}

function isQuestionMap<T>(v: unknown, valid: (value: unknown) => value is T): v is Record<string, T> {
  return isObject(v) && Object.keys(v).length <= 200 && Object.entries(v).every(([k, value]) => QUESTION_ID_RE.test(k) && valid(value))
}

function isAttemptList(v: unknown): v is InterviewAttempt[] {
  return Array.isArray(v) && v.length <= MAX_ATTEMPTS_KEPT && v.every(isAttempt)
}

function isOwnExample(v: unknown): v is OwnExample {
  if (!isObject(v)) return false
  return (
    typeof v.text === 'string' &&
    v.text.trim() !== '' &&
    v.text.length <= OWN_EXAMPLE_MAX_LENGTH &&
    typeof v.evidence === 'string' &&
    (EVIDENCE_LEVELS as readonly string[]).includes(v.evidence) &&
    isIso(v.updatedAt)
  )
}

function isTryCount(v: unknown): v is number {
  return isInt(v, 1, 1000)
}

function isSession(v: unknown): v is InterviewSession {
  if (!isObject(v)) return false
  return (
    typeof v.interviewId === 'string' &&
    INTERVIEW_ID_RE.test(v.interviewId) &&
    isIso(v.startedAt) &&
    isInt(v.index, 0, 20) &&
    typeof v.phase === 'string' &&
    (INTERVIEW_PHASES as readonly string[]).includes(v.phase) &&
    isInt(v.followUp, 0, 9) &&
    isPartialCheck(v.draft) &&
    isQuestionMap(v.results, isAttempt) &&
    isQuestionMap(v.tries, isTryCount) &&
    typeof v.revisit === 'boolean' &&
    typeof v.hinted === 'boolean' &&
    (v.finishedAt === null || isIso(v.finishedAt))
  )
}

export function isInterviewProgress(v: unknown): v is InterviewProgress {
  if (!isObject(v)) return false
  return (
    isQuestionMap(v.attempts, isAttemptList) &&
    isQuestionMap(v.ownExamples, isOwnExample) &&
    (v.session === null || isSession(v.session))
  )
}

// ---------------------------------------------------------------- migrations

type Migration = (data: Record<string, unknown>, now: Date) => Record<string, unknown>

function withFocus(filter: unknown): unknown {
  return isObject(filter) && filter.focus === undefined ? { ...filter, focus: 'all' } : filter
}

/** v1 → v2: add `focus` to filters, `challengeId` and `timed` to the lesson. Cards are untouched. */
function migrateV1toV2(data: Record<string, unknown>): Record<string, unknown> {
  const lesson = isObject(data.lesson)
    ? {
        ...data.lesson,
        filter: withFocus(data.lesson.filter),
        challengeId: data.lesson.challengeId ?? null,
        timed: data.lesson.timed ?? false,
      }
    : data.lesson
  const prefs = isObject(data.prefs) ? { ...data.prefs, practice: withFocus(data.prefs.practice) } : data.prefs
  return { ...data, schemaVersion: 2, lesson, prefs }
}

/** v2 → v3: empty interview progress and default read-aloud settings. Cards are untouched. */
function migrateV2toV3(data: Record<string, unknown>): Record<string, unknown> {
  const prefs = isObject(data.prefs) && data.prefs.speech === undefined ? { ...data.prefs, speech: { ...DEFAULT_PREFS.speech } } : data.prefs
  const interview = data.interview === undefined ? emptyInterviewProgress() : data.interview
  return { ...data, schemaVersion: 3, interview, prefs }
}

/** v3 → v4: Czech interface unless chosen otherwise. Everything else is untouched. */
function migrateV3toV4(data: Record<string, unknown>): Record<string, unknown> {
  const prefs = isObject(data.prefs) && data.prefs.uiLanguage === undefined ? { ...data.prefs, uiLanguage: DEFAULT_PREFS.uiLanguage } : data.prefs
  return { ...data, schemaVersion: 4, prefs }
}

/**
 * v4 → v5: revision 0, no answer waiting in the lesson, statistics counted
 * from now on (earlier study is not reconstructed), interview hint not opened.
 */
function migrateV4toV5(data: Record<string, unknown>, now: Date): Record<string, unknown> {
  const lesson = isObject(data.lesson) && data.lesson.pending === undefined ? { ...data.lesson, pending: null } : data.lesson
  const interview =
    isObject(data.interview) && isObject(data.interview.session) && data.interview.session.hinted === undefined
      ? { ...data.interview, session: { ...data.interview.session, hinted: false } }
      : data.interview
  return {
    ...data,
    schemaVersion: 5,
    rev: data.rev ?? 0,
    lesson,
    interview,
    stats: data.stats ?? emptyStats(now),
  }
}

/** MIGRATIONS[n] converts version n to n + 1. */
const MIGRATIONS: Record<number, Migration> = { 1: migrateV1toV2, 2: migrateV2toV3, 3: migrateV3toV4, 4: migrateV4toV5 }

export function migrate(data: Record<string, unknown>, now: Date = new Date()): Record<string, unknown> {
  let current = data
  while (typeof current.schemaVersion === 'number' && current.schemaVersion < SCHEMA_VERSION) {
    const step = MIGRATIONS[current.schemaVersion]
    if (!step) break
    current = step(current, now)
  }
  return current
}

// ---------------------------------------------------------------- parsing

/** Valid card entries and how many entries were not. Cards look the same in every schema version. */
function readCards(v: unknown): { cards: Record<string, CardState>; dropped: number } | null {
  if (!isObject(v)) return null
  const cards: Record<string, CardState> = {}
  let dropped = 0
  for (const [key, value] of Object.entries(v)) {
    if (isCardKey(key) && isCardState(value)) cards[key] = value
    else dropped += 1
  }
  return { cards, dropped }
}

export function parseStore(raw: string, now: Date): StoreValidation {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, kind: 'corrupt', reason: 'invalid-json', recoverable: null }
  }
  if (!isObject(parsed)) return { ok: false, kind: 'corrupt', reason: 'not-an-object', recoverable: null }

  // 1. Envelope first: which app and which version. A newer version is refused, never migrated or overwritten.
  const version = parsed.schemaVersion
  if (typeof version === 'number' && Number.isInteger(version) && version > SCHEMA_VERSION) {
    return { ok: false, kind: 'unsupported', version }
  }
  const problems: string[] = []
  if (parsed.app !== APP_ID) problems.push('app')
  if (!isInt(version, 1, SCHEMA_VERSION)) problems.push('schemaVersion')
  if (!isIso(parsed.createdAt)) problems.push('createdAt')
  if (!isIso(parsed.updatedAt)) problems.push('updatedAt')
  const read = readCards(parsed.cards)
  if (!read) problems.push('cards')
  if (problems.length > 0) {
    // Not migrated: only the cards could be kept, and only when the card map itself is readable.
    const fresh = createStore(now)
    const recoverable = read ? { store: { ...fresh, cards: read.cards }, dropped: read.dropped + problems.length } : null
    return { ok: false, kind: 'corrupt', reason: `invalid-${problems.join(',')}`, recoverable }
  }

  // 2. Migrate in memory, then validate the result completely.
  const originalVersion = version as number
  const data = originalVersion < SCHEMA_VERSION ? migrate(parsed, now) : parsed
  let dropped = read!.dropped
  const rest: string[] = []
  if (data.schemaVersion !== SCHEMA_VERSION) rest.push('schemaVersion')
  const revOk = isInt(data.rev, 0)
  if (!revOk) rest.push('rev')
  const lessonOk = data.lesson === null || isLesson(data.lesson)
  if (!lessonOk) {
    rest.push('lesson')
    dropped += 1
  }
  const prefsOk = isPrefs(data.prefs)
  if (!prefsOk) {
    rest.push('prefs')
    dropped += 1
  }
  const interviewOk = isInterviewProgress(data.interview)
  if (!interviewOk) {
    rest.push('interview')
    dropped += 1
  }
  const statsOk = isStats(data.stats)
  if (!statsOk) {
    rest.push('stats')
    dropped += 1
  }

  const fresh = createStore(now)
  const store: Store = {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    rev: revOk ? (data.rev as number) : 0,
    createdAt: parsed.createdAt as string,
    updatedAt: parsed.updatedAt as string,
    cards: read!.cards,
    lesson: lessonOk ? (data.lesson as Lesson | null) : null,
    interview: interviewOk ? (data.interview as InterviewProgress) : fresh.interview,
    prefs: prefsOk ? (data.prefs as Prefs) : fresh.prefs,
    stats: statsOk ? (data.stats as StudyStats) : fresh.stats,
  }

  if (rest.length === 0 && dropped === 0) {
    return { ok: true, store, migratedFrom: originalVersion < SCHEMA_VERSION ? originalVersion : null }
  }
  const reason = rest.length > 0 ? `invalid-${rest.join(',')}` : 'invalid-cards'
  // Recovery keeps every valid card and every valid part.
  return { ok: false, kind: 'corrupt', reason, recoverable: { store, dropped } }
}

/** Reads only the revision of a stored text without validating the rest (null: none or not readable). */
export function storedRevision(raw: string): number | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    return isObject(parsed) && isInt(parsed.rev, 0) ? parsed.rev : null
  } catch {
    return null
  }
}

/** Schema version of a stored text, if it has one. */
export function storedSchemaVersion(raw: string): number | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    return isObject(parsed) && isInt(parsed.schemaVersion, 0) ? parsed.schemaVersion : null
  } catch {
    return null
  }
}
