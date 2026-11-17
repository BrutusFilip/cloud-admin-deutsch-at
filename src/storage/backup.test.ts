import { describe, expect, it } from 'vitest'
import { KNOWN_CARD_IDS } from '../content'
import { finishEarly, startLesson, submitAnswer, ALL_CARDS } from '../domain/lesson'
import { recordLesson } from '../domain/stats'
import { APP_VERSION } from '../version'
import { createExport, exportFileName, exportText, MAX_IMPORT_BYTES, parseImport, parseKeptData, type ProgressExport } from './backup'
import { createStore, SCHEMA_VERSION, type Store } from './store'

/** `npm run test:import` – export, and refusal of every kind of invalid import. */

const NOW = new Date(2026, 10, 11, 9, 0)
const CARD = { level: 3, due: '2026-11-25', lastReviewed: '2026-11-11', lastRating: 'good', reviews: 4, againCount: 1 } as const

function progress(): Store {
  const store = createStore(NOW)
  store.cards['access-v-001:flashcard'] = { ...CARD }
  store.cards['network-g-001:grammar'] = { ...CARD, level: 1 }
  store.cards['retired-v-001:flashcard'] = { ...CARD, level: 0 }
  store.lesson = startLesson('daily', ['access-v-001:write', 'network-s-001:write'], ALL_CARDS, NOW)
  store.interview.attempts['network-i-001'] = [
    { at: NOW.toISOString(), followUp: 0, checks: { direct: 'yes', structure: 'partly', vocabulary: 'yes', followUp: 'no' } },
  ]
  store.interview.ownExamples['network-i-001'] = { text: 'Im Testlabor habe ich die DNS-Auflösung geprüft.', evidence: 'lab', updatedAt: NOW.toISOString() }
  store.prefs.uiLanguage = 'de'
  return store
}

function file(overrides: Partial<Record<keyof ProgressExport, unknown>> = {}, data: unknown = progress()): string {
  const base = createExport(progress(), { appVersion: APP_VERSION, contentVersion: '2026-11-11' }, NOW)
  return JSON.stringify({ ...base, data, ...overrides })
}

function problemOf(text: string) {
  const result = parseImport(text, KNOWN_CARD_IDS, NOW)
  return result.ok ? null : result.problem
}

describe('progress export', () => {
  it('is versioned JSON that imports back to the same progress', () => {
    const store = progress()
    const text = exportText(createExport(store, { appVersion: APP_VERSION, contentVersion: '2026-11-11' }, NOW))
    const json = JSON.parse(text)
    expect(json).toMatchObject({ format: 'cloud-admin-deutsch-at/progress', formatVersion: 1, appVersion: APP_VERSION, exportedAt: NOW.toISOString() })
    expect(json.data.schemaVersion).toBe(SCHEMA_VERSION)
    const result = parseImport(text, KNOWN_CARD_IDS, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.preview.store).toEqual(store)
    expect(result.preview.summary).toEqual({
      cards: 3,
      mastered: 1,
      unknownCards: 1,
      attempts: 1,
      ownExamples: 1,
      lessonsCompleted: 0,
      openLesson: true,
      openInterview: false,
    })
  })

  it('has a file name that .gitignore keeps out of the repository', () => {
    expect(exportFileName('2026-11-11')).toBe('cloud-admin-deutsch-progress-2026-11-11.json')
  })

  it('migrates progress exported from an older schema', () => {
    const { interview: _interview, ...rest } = createStore(NOW)
    const v2 = {
      ...rest,
      schemaVersion: 2,
      cards: { 'access-v-001:flashcard': { ...CARD } },
      prefs: { todayTopic: 'all', practice: { topic: 'all', level: 'all', exercise: 'flashcard', focus: 'all' } },
    }
    const result = parseImport(file({}, v2), KNOWN_CARD_IDS, NOW)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.preview.schemaVersion).toBe(2)
    expect(result.preview.store.schemaVersion).toBe(SCHEMA_VERSION)
    expect(result.preview.store.cards).toEqual(v2.cards)
    expect(result.preview.store.prefs.uiLanguage).toBe('cs')
  })
})

describe('refusing an invalid import', () => {
  it('refuses files that are not an export of this app', () => {
    expect(problemOf('')).toEqual({ kind: 'empty' })
    expect(problemOf('{"format": ')).toEqual({ kind: 'not-json' })
    expect(problemOf('[1, 2, 3]')).toEqual({ kind: 'not-export' })
    expect(problemOf(JSON.stringify({ hello: 'world' }))).toEqual({ kind: 'not-export' })
    expect(problemOf(file({ format: 'another-app/progress' }))).toEqual({ kind: 'not-export' })
    expect(problemOf(file({ formatVersion: '1' }))).toEqual({ kind: 'not-export' })
    expect(problemOf(file({ exportedAt: 'yesterday' }))).toEqual({ kind: 'not-export' })
    expect(problemOf(file({ data: null }))).toEqual({ kind: 'not-export' })
    // A raw browser copy of the store is not an export either.
    expect(problemOf(JSON.stringify(progress()))).toEqual({ kind: 'not-export' })
  })

  it('refuses files that are too large before parsing them', () => {
    expect(problemOf(' '.repeat(MAX_IMPORT_BYTES + 1))).toEqual({ kind: 'too-large', bytes: MAX_IMPORT_BYTES + 1 })
  })

  it('refuses newer versions instead of guessing', () => {
    expect(problemOf(file({ formatVersion: 2 }))).toEqual({ kind: 'newer-format', version: 2 })
    expect(problemOf(file({}, { ...progress(), schemaVersion: SCHEMA_VERSION + 1 }))).toEqual({ kind: 'newer-schema', version: SCHEMA_VERSION + 1 })
  })

  it('refuses any invalid value and names the part', () => {
    const bad = (change: (store: Record<string, unknown>) => void) => {
      const data = JSON.parse(JSON.stringify(progress())) as Record<string, unknown>
      change(data)
      return problemOf(file({}, data))
    }
    expect(bad((d) => (d.schemaVersion = 0))).toEqual({ kind: 'invalid-data', parts: ['schemaVersion'] })
    expect(bad((d) => (d.app = 'something-else'))).toEqual({ kind: 'invalid-data', parts: ['app'] })
    expect(bad((d) => ((d.cards as Record<string, unknown>)['access-v-001:flashcard'] = { ...CARD, level: 9 }))).toEqual({ kind: 'invalid-data', parts: ['cards'] })
    expect(bad((d) => ((d.cards as Record<string, unknown>)['access-v-001:flashcard'] = { ...CARD, due: '2026-02-30' }))).toEqual({ kind: 'invalid-data', parts: ['cards'] })
    expect(bad((d) => ((d.prefs as Record<string, unknown>).uiLanguage = 'en'))).toEqual({ kind: 'invalid-data', parts: ['prefs'] })
    expect(
      bad((d) => (((d.interview as Record<string, Record<string, unknown>>).ownExamples['network-i-001'] as Record<string, unknown>).text = 'x'.repeat(2001))),
    ).toEqual({ kind: 'invalid-data', parts: ['interview'] })
    expect(bad((d) => ((d.lesson as Record<string, unknown>).queue = 'all'))).toEqual({ kind: 'invalid-data', parts: ['lesson'] })
  })

  it('refuses prototype keys', () => {
    const text = file().replace('"cards":{', '"cards":{"__proto__":{"level":1},')
    expect(text).toContain('"__proto__"')
    expect(problemOf(text)).toEqual({ kind: 'invalid-data', parts: ['cards'] })
  })
})

describe('stage 7: the export restores the study state exactly', () => {
  it('keeps due dates, the answer waiting in the lesson, statistics and settings', () => {
    const store = progress()
    const lesson = submitAnswer(store.lesson!, 'access-v-001:write', 0, 'incorrect', { type: 'text', value: 'falsch' }, NOW)!
    const finished = finishEarly(startLesson('daily', ['access-v-001:flashcard'], ALL_CARDS, NOW), {}, NOW).lesson
    const withAll: Store = {
      ...store,
      lesson,
      stats: recordLesson(store.stats, finished),
      prefs: { ...store.prefs, todayTopic: 'network', speech: { enabled: false, voiceURI: 'Test Voice' } },
    }
    const text = exportText(createExport(withAll, { appVersion: APP_VERSION, contentVersion: '2026-11-11' }, NOW))
    const result = parseImport(text, KNOWN_CARD_IDS, new Date(2026, 11, 1))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.preview.store).toEqual(withAll)
    expect(result.preview.store.lesson?.pending).toMatchObject({ cardId: 'access-v-001:write', verdict: 'incorrect' })
  })

  it('refuses an export whose waiting answer does not belong to the current card', () => {
    const store = progress()
    const lesson = { ...store.lesson!, pending: { cardId: 'network-s-001:write', turn: 0, verdict: 'incorrect', response: null, at: NOW.toISOString() } }
    expect(problemOf(file({}, { ...store, lesson }))).toEqual({ kind: 'invalid-data', parts: ['lesson'] })
  })

  it('reads the data kept from before an update like an import', () => {
    const v4 = { ...progress(), schemaVersion: 4, lesson: null } as Record<string, unknown>
    delete v4.rev
    delete v4.stats
    const result = parseKeptData(JSON.stringify(v4), NOW.toISOString(), KNOWN_CARD_IDS, NOW)
    expect(result).toMatchObject({ ok: true, preview: { schemaVersion: 4, summary: { cards: 3 } } })
    expect(parseKeptData('{broken', NOW.toISOString(), KNOWN_CARD_IDS, NOW)).toMatchObject({ ok: false })
  })
})
