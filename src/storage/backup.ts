import type { LocalDay } from '../domain/localDay'
import { MASTERED_LEVEL } from '../domain/scheduler'
import { parseStore, SCHEMA_VERSION, storedSchemaVersion, type Store } from './store'

/**
 * Export and import of the learner's progress (transfer to another browser,
 * backup). The file is versioned JSON; an import is validated completely –
 * format, versions and every value, with the same whitelist as the browser
 * storage – before anything is replaced. A rejected file changes nothing.
 */

export const EXPORT_FORMAT = 'cloud-admin-deutsch-at/progress'
export const EXPORT_FORMAT_VERSION = 1
/** Real exports are a few kB to a few hundred kB; anything bigger is refused before reading. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024

export interface ProgressExport {
  format: typeof EXPORT_FORMAT
  formatVersion: typeof EXPORT_FORMAT_VERSION
  appVersion: string
  contentVersion: string
  exportedAt: string
  data: Store
}

export function createExport(store: Store, versions: { appVersion: string; contentVersion: string }, now: Date): ProgressExport {
  return {
    format: EXPORT_FORMAT,
    formatVersion: EXPORT_FORMAT_VERSION,
    appVersion: versions.appVersion,
    contentVersion: versions.contentVersion,
    exportedAt: now.toISOString(),
    data: store,
  }
}

export function exportText(file: ProgressExport): string {
  return `${JSON.stringify(file, null, 2)}\n`
}

/** Matches the pattern in .gitignore, so an export never ends up in the repository. */
export function exportFileName(day: LocalDay): string {
  return `cloud-admin-deutsch-progress-${day}.json`
}

/** Parts of the stored data a problem can be in (see parseStore). */
export type DataPart = 'app' | 'schemaVersion' | 'rev' | 'createdAt' | 'updatedAt' | 'cards' | 'lesson' | 'prefs' | 'interview' | 'stats'
const DATA_PARTS: readonly DataPart[] = ['app', 'schemaVersion', 'rev', 'createdAt', 'updatedAt', 'cards', 'lesson', 'prefs', 'interview', 'stats']

export type ImportProblem =
  | { kind: 'too-large'; bytes: number }
  | { kind: 'empty' }
  | { kind: 'not-json' }
  | { kind: 'not-export' }
  | { kind: 'newer-format'; version: number }
  | { kind: 'newer-schema'; version: number }
  | { kind: 'invalid-data'; parts: DataPart[] }

export interface ProgressSummary {
  /** Cards with progress. */
  cards: number
  mastered: number
  /** Cards with progress that this version of the content does not know (kept as they are). */
  unknownCards: number
  attempts: number
  ownExamples: number
  /** Lessons completed since the statistics started. */
  lessonsCompleted: number
  openLesson: boolean
  openInterview: boolean
}

export interface ImportPreview {
  exportedAt: string
  appVersion: string
  /** Schema version in the file (older versions are migrated). */
  schemaVersion: number
  summary: ProgressSummary
  /** The validated, migrated progress that would replace the current one. */
  store: Store
}

export type ImportResult = { ok: true; preview: ImportPreview } | { ok: false; problem: ImportProblem }

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isShortText(v: unknown, max: number): v is string {
  return typeof v === 'string' && v.length > 0 && v.length <= max
}

function isIso(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v))
}

export function summarizeProgress(store: Store, knownCardIds: ReadonlySet<string>): ProgressSummary {
  const ids = Object.keys(store.cards)
  return {
    cards: ids.length,
    mastered: ids.filter((id) => (store.cards[id]?.level ?? 0) >= MASTERED_LEVEL).length,
    unknownCards: ids.filter((id) => !knownCardIds.has(id)).length,
    attempts: Object.values(store.interview.attempts).reduce((n, list) => n + list.length, 0),
    ownExamples: Object.keys(store.interview.ownExamples).length,
    lessonsCompleted: store.stats.lessons.completed,
    openLesson: store.lesson !== null && store.lesson.finishedAt === null,
    openInterview: store.interview.session !== null && store.interview.session.finishedAt === null,
  }
}

function dataParts(reason: string): DataPart[] {
  const named = reason.replace(/^invalid-/, '').split(',')
  const parts = DATA_PARTS.filter((p) => named.includes(p))
  return parts.length > 0 ? parts : ['cards']
}

/** Validates an export file completely. Pure: nothing is stored here. */
export function parseImport(text: string, knownCardIds: ReadonlySet<string>, now: Date): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, problem: { kind: 'too-large', bytes: text.length } }
  if (text.trim() === '') return { ok: false, problem: { kind: 'empty' } }
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return { ok: false, problem: { kind: 'not-json' } }
  }
  if (!isObject(value) || value.format !== EXPORT_FORMAT) return { ok: false, problem: { kind: 'not-export' } }
  const formatVersion = value.formatVersion
  if (typeof formatVersion !== 'number' || !Number.isInteger(formatVersion) || formatVersion < 1) {
    return { ok: false, problem: { kind: 'not-export' } }
  }
  if (formatVersion > EXPORT_FORMAT_VERSION) return { ok: false, problem: { kind: 'newer-format', version: formatVersion } }
  if (!isIso(value.exportedAt) || !isShortText(value.appVersion, 40) || !isShortText(value.contentVersion, 40) || !isObject(value.data)) {
    return { ok: false, problem: { kind: 'not-export' } }
  }
  const schemaVersion = value.data.schemaVersion
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion) || schemaVersion < 1) {
    return { ok: false, problem: { kind: 'invalid-data', parts: ['schemaVersion'] } }
  }
  if (schemaVersion > SCHEMA_VERSION) return { ok: false, problem: { kind: 'newer-schema', version: schemaVersion } }

  const parsed = parseStore(JSON.stringify(value.data), now)
  if (!parsed.ok) {
    return parsed.kind === 'unsupported'
      ? { ok: false, problem: { kind: 'newer-schema', version: parsed.version } }
      : { ok: false, problem: { kind: 'invalid-data', parts: dataParts(parsed.reason) } }
  }
  return {
    ok: true,
    preview: {
      exportedAt: value.exportedAt,
      appVersion: value.appVersion,
      schemaVersion,
      summary: summarizeProgress(parsed.store, knownCardIds),
      store: parsed.store,
    },
  }
}

/**
 * The data kept from before the last update (BACKUP_KEY), checked like an
 * import: migrated in memory and validated completely. Pure: nothing is stored here.
 */
export function parseKeptData(raw: string, savedAt: string, knownCardIds: ReadonlySet<string>, now: Date): ImportResult {
  const parsed = parseStore(raw, now)
  if (!parsed.ok) {
    return parsed.kind === 'unsupported'
      ? { ok: false, problem: { kind: 'newer-schema', version: parsed.version } }
      : { ok: false, problem: { kind: 'invalid-data', parts: dataParts(parsed.reason) } }
  }
  return {
    ok: true,
    preview: {
      exportedAt: savedAt,
      appVersion: '–',
      schemaVersion: storedSchemaVersion(raw) ?? SCHEMA_VERSION,
      summary: summarizeProgress(parsed.store, knownCardIds),
      store: parsed.store,
    },
  }
}
