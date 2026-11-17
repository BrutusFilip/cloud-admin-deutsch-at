import { describe, expect, it } from 'vitest'
import { startLesson, ALL_CARDS } from '../domain/lesson'
import { emptyStats } from '../domain/stats'
import { MemoryStorage } from './__fixtures__/memoryStorage'
import { Persistence, type StorageLike } from './persistence'
import { BACKUP_KEY, createStore, parseStore, SCHEMA_VERSION, STORAGE_KEY, type Store } from './store'

const NOW = new Date(2026, 10, 4, 18, 0)

function sampleStore(): Store {
  const store = createStore(NOW)
  store.cards['access-v-001:flashcard'] = {
    level: 2,
    due: '2026-11-11',
    lastReviewed: '2026-11-04',
    lastRating: 'good',
    reviews: 2,
    againCount: 0,
  }
  store.lesson = startLesson('daily', ['access-v-001:flashcard', 'm365-v-001:flashcard'], ALL_CARDS, NOW)
  return store
}

describe('saving and loading', () => {
  it('uses an app-specific key and the current schema version', () => {
    expect(STORAGE_KEY).toBe('cloud-admin-deutsch-at:progress')
    const storage = new MemoryStorage()
    const p = new Persistence(storage)
    expect(p.load(NOW).status).toBe('fresh')
    expect(p.save(sampleStore())).toEqual({ status: 'saved', rev: 1 })
    const saved = JSON.parse(storage.data.get(STORAGE_KEY)!)
    expect(saved.schemaVersion).toBe(SCHEMA_VERSION)
    expect(saved.app).toBe('cloud-admin-deutsch-at')
  })

  it('round-trips progress and the unfinished lesson', () => {
    const storage = new MemoryStorage()
    const p = new Persistence(storage)
    p.load(NOW)
    const store = sampleStore()
    p.save(store)
    const again = new Persistence(storage).load(NOW)
    expect(again).toEqual({ status: 'loaded', store: { ...store, rev: 1 }, migratedFrom: null })
  })

  it('keeps progress of cards it does not know (content was changed)', () => {
    const storage = new MemoryStorage()
    const store = sampleStore()
    store.cards['retired-v-999:flashcard'] = { ...store.cards['access-v-001:flashcard']! }
    store.cards['access-v-001:listen'] = { ...store.cards['access-v-001:flashcard']! }
    storage.data.set(STORAGE_KEY, JSON.stringify(store))
    const loaded = new Persistence(storage).load(NOW)
    expect(loaded.status).toBe('loaded')
    if (loaded.status !== 'loaded') return
    expect(Object.keys(loaded.store.cards).sort()).toEqual([
      'access-v-001:flashcard',
      'access-v-001:listen',
      'retired-v-999:flashcard',
    ])
  })
})

describe('unreadable data is never overwritten without an explicit choice', () => {
  it('blocks saving when the stored JSON is broken', () => {
    const storage = new MemoryStorage()
    storage.data.set(STORAGE_KEY, '{"app":"cloud-admin-deutsch-at", broken')
    const p = new Persistence(storage)
    const outcome = p.load(NOW)
    expect(outcome.status).toBe('corrupt')
    expect(p.currentMode).toBe('blocked')
    expect(p.save(sampleStore())).toEqual({ status: 'skipped', reason: 'blocked' })
    expect(storage.data.get(STORAGE_KEY)).toBe('{"app":"cloud-admin-deutsch-at", broken')
    expect(storage.writes).toBe(0)
  })

  it('offers recovery of the valid cards and writes only after the explicit overwrite', () => {
    const storage = new MemoryStorage()
    const store = sampleStore() as unknown as Record<string, unknown>
    ;(store.cards as Record<string, unknown>)['m365-v-001:flashcard'] = { level: 99, due: 'tomorrow' }
    storage.data.set(STORAGE_KEY, JSON.stringify(store))
    const p = new Persistence(storage)
    const outcome = p.load(NOW)
    expect(outcome.status).toBe('corrupt')
    if (outcome.status !== 'corrupt') return
    expect(outcome.recoverable?.dropped).toBe(1)
    expect(Object.keys(outcome.recoverable!.store.cards)).toEqual(['access-v-001:flashcard'])
    expect(storage.writes).toBe(0)
    expect(p.overwrite(outcome.recoverable!.store)).toEqual({ status: 'saved', rev: 1 })
    expect(p.currentMode).toBe('persistent')
    expect(new Persistence(storage).load(NOW).status).toBe('loaded')
  })

  it('does not touch data from a newer schema version', () => {
    const storage = new MemoryStorage()
    const raw = JSON.stringify({ ...sampleStore(), schemaVersion: SCHEMA_VERSION + 1 })
    storage.data.set(STORAGE_KEY, raw)
    const p = new Persistence(storage)
    expect(p.load(NOW)).toMatchObject({ status: 'unsupported', version: SCHEMA_VERSION + 1 })
    expect(p.save(sampleStore()).status).toBe('skipped')
    expect(storage.data.get(STORAGE_KEY)).toBe(raw)
  })

  it('rejects prototype-pollution keys without polluting objects', () => {
    const storage = new MemoryStorage()
    const raw = JSON.stringify(sampleStore()).replace('"cards":{', '"cards":{"__proto__":{"polluted":true},')
    storage.data.set(STORAGE_KEY, raw)
    const outcome = new Persistence(storage).load(NOW)
    expect(outcome.status).toBe('corrupt')
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

describe('storage errors', () => {
  it('works in memory when storage is unavailable', () => {
    const p = new Persistence(null)
    expect(p.load(NOW).status).toBe('unavailable')
    expect(p.save(sampleStore())).toEqual({ status: 'skipped', reason: 'memory' })
  })

  it('treats a throwing read as unavailable', () => {
    const storage: StorageLike = {
      length: 0,
      key: () => null,
      getItem() {
        throw new Error('SecurityError')
      },
      setItem() {},
      removeItem() {},
    }
    expect(new Persistence(storage).load(NOW).status).toBe('unavailable')
  })

  it('reports a failed write and lets the learner continue without saving', () => {
    const storage = new MemoryStorage()
    const p = new Persistence(storage)
    p.load(NOW)
    storage.failWith = 'QuotaExceededError'
    expect(p.save(sampleStore())).toEqual({ status: 'failed', error: 'QuotaExceededError' })
    expect(p.currentMode).toBe('persistent')
    p.useMemoryOnly()
    expect(p.save(sampleStore())).toEqual({ status: 'skipped', reason: 'memory' })
    storage.failWith = null
    p.resumeSaving()
    expect(p.save(sampleStore())).toEqual({ status: 'saved', rev: 1 })
  })
})

describe('schema migration v1 → … → v5', () => {
  /** Exactly what E1 (schema version 1) stored: no grammar focus, no challenge fields. */
  const V1 = {
    app: 'cloud-admin-deutsch-at',
    schemaVersion: 1,
    createdAt: '2026-11-04T17:00:00.000Z',
    updatedAt: '2026-11-04T17:05:00.000Z',
    cards: {
      'access-v-001:flashcard': { level: 2, due: '2026-11-11', lastReviewed: '2026-11-04', lastRating: 'good', reviews: 2, againCount: 0 },
      'intro-s-001:write': { level: 0, due: '2026-11-05', lastReviewed: '2026-11-04', lastRating: 'again', reviews: 1, againCount: 1 },
    },
    lesson: {
      id: 'l-abc',
      kind: 'daily',
      filter: { topic: 'all', level: 'all', exercise: 'mixed' },
      startedDay: '2026-11-04',
      startedAt: '2026-11-04T17:00:00.000Z',
      cards: ['access-v-001:flashcard', 'm365-v-001:flashcard'],
      queue: ['m365-v-001:flashcard'],
      attempts: { 'access-v-001:flashcard': 1 },
      log: [{ cardId: 'access-v-001:flashcard', rating: 'good', effect: 'schedule', verdict: 'self', at: '2026-11-04T17:01:00.000Z' }],
      finishedAt: null,
      origin: null,
    },
    prefs: { todayTopic: 'identity', practice: { topic: 'm365', level: 'B2', exercise: 'write' } },
  }

  it('loads E1 progress unchanged and adds the new fields', () => {
    const storage = new MemoryStorage()
    const raw = JSON.stringify(V1)
    storage.data.set(STORAGE_KEY, raw)
    const p = new Persistence(storage)
    const outcome = p.load(NOW)
    expect(outcome.status).toBe('loaded')
    if (outcome.status !== 'loaded') return
    expect(outcome.store.schemaVersion).toBe(5)
    expect(outcome.store.rev).toBe(0)
    expect(outcome.store.cards).toEqual(V1.cards)
    expect(outcome.store.lesson).toEqual({
      ...V1.lesson,
      filter: { ...V1.lesson.filter, focus: 'all' },
      challengeId: null,
      timed: false,
      pending: null,
    })
    expect(outcome.store.stats).toEqual(emptyStats(NOW))
    expect(outcome.store.prefs).toEqual({
      todayTopic: 'identity',
      practice: { ...V1.prefs.practice, focus: 'all' },
      speech: { enabled: true, voiceURI: null },
      uiLanguage: 'cs',
    })
    expect(outcome.store.interview).toEqual({ attempts: {}, ownExamples: {}, session: null })
    // Loading alone writes nothing; the next save keeps the original text first, then stores version 5.
    expect(storage.writes).toBe(0)
    expect(storage.data.get(STORAGE_KEY)).toBe(raw)
    expect(p.save(outcome.store).status).toBe('saved')
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!).schemaVersion).toBe(5)
    expect(JSON.parse(storage.data.get(BACKUP_KEY)!)).toEqual({ savedAt: NOW.toISOString(), fromVersion: 1, raw })
  })

  it('reports where the data came from', () => {
    const parsed = parseStore(JSON.stringify(V1), NOW)
    expect(parsed).toMatchObject({ ok: true, migratedFrom: 1 })
    expect(parseStore(JSON.stringify(sampleStore()), NOW)).toMatchObject({ ok: true, migratedFrom: null })
  })

  it('still refuses broken v1 data instead of guessing', () => {
    const broken = { ...V1, cards: { 'access-v-001:flashcard': { level: 9 } } }
    const parsed = parseStore(JSON.stringify(broken), NOW)
    expect(parsed).toMatchObject({ ok: false, kind: 'corrupt' })
  })

  it('round-trips a timed challenge lesson', () => {
    const storage = new MemoryStorage()
    const p = new Persistence(storage)
    p.load(NOW)
    const store = createStore(NOW)
    store.lesson = startLesson('challenge', ['network-g-001:grammar', 'incidents-g-001:grammar'], ALL_CARDS, NOW, {
      challengeId: 'vpn-homeoffice',
      timed: true,
    })
    p.save(store)
    expect(new Persistence(storage).load(NOW)).toEqual({ status: 'loaded', store: { ...store, rev: 1 }, migratedFrom: null })
  })
})

describe('schema v3: interview progress and read-aloud settings', () => {
  const attempt = { at: '2026-11-11T07:10:00.000Z', followUp: 0, checks: { direct: 'yes', structure: 'partly', vocabulary: 'yes', followUp: 'no' } }

  function v2(): Record<string, unknown> {
    const { interview: _interview, ...rest } = createStore(NOW)
    const prefs = { todayTopic: 'all', practice: { topic: 'all', level: 'all', exercise: 'grammar', focus: 'case' } }
    return { ...rest, schemaVersion: 2, prefs }
  }

  it('migrates E4 data (version 2): progress kept, empty interview, default read-aloud', () => {
    const data = { ...v2(), cards: { 'network-g-001:grammar': { level: 1, due: '2026-11-14', lastReviewed: '2026-11-11', lastRating: 'good', reviews: 1, againCount: 0 } } }
    const parsed = parseStore(JSON.stringify(data), NOW)
    expect(parsed).toMatchObject({ ok: true, migratedFrom: 2 })
    if (!parsed.ok) return
    expect(parsed.store.cards).toEqual(data.cards)
    expect(parsed.store.prefs.practice).toEqual({ topic: 'all', level: 'all', exercise: 'grammar', focus: 'case' })
    expect(parsed.store.prefs.speech).toEqual({ enabled: true, voiceURI: null })
    expect(parsed.store.interview).toEqual({ attempts: {}, ownExamples: {}, session: null })
  })

  it('round-trips attempts, an own example, an open session and the chosen voice', () => {
    const storage = new MemoryStorage()
    const p = new Persistence(storage)
    p.load(NOW)
    const store = createStore(NOW)
    store.prefs.speech = { enabled: false, voiceURI: 'Microsoft Michael - German (Austria)' }
    store.interview = {
      attempts: { 'network-i-001': [attempt] },
      ownExamples: { 'network-i-001': { text: 'Im Labor habe ich die DNS-Auflösung geprüft.', evidence: 'lab', updatedAt: '2026-11-11T07:12:00.000Z' } },
      session: {
        interviewId: 'vpn-incident',
        startedAt: '2026-11-11T07:00:00.000Z',
        index: 1,
        phase: 'review',
        followUp: 0,
        draft: { direct: 'yes' },
        results: { 'network-i-001': attempt },
        tries: { 'network-i-001': 1 },
        revisit: false,
        hinted: true,
        finishedAt: null,
      },
    } as Store['interview']
    p.save(store)
    expect(new Persistence(storage).load(NOW)).toEqual({ status: 'loaded', store: { ...store, rev: 1 }, migratedFrom: null })
  })

  it('treats damaged interview data as unreadable and offers to keep the cards', () => {
    const store = createStore(NOW)
    store.cards['access-v-001:flashcard'] = sampleStore().cards['access-v-001:flashcard']!
    const bad = [
      JSON.stringify({ ...store, interview: { attempts: { 'network-i-001': [{ ...attempt, checks: { direct: 'maybe' } }] }, ownExamples: {}, session: null } }),
      JSON.stringify({ ...store, interview: { attempts: {}, ownExamples: { 'network-i-001': { text: 'x', evidence: 'proven', updatedAt: attempt.at } }, session: null } }),
      JSON.stringify({ ...store, interview: { attempts: {}, ownExamples: { 'network-i-001': { text: 'x'.repeat(2001), evidence: 'cv', updatedAt: attempt.at } }, session: null } }),
      JSON.stringify({ ...store, interview: { attempts: {}, session: null } }),
      JSON.stringify(store).replace('"attempts":{}', '"attempts":{"__proto__":[]}'),
      JSON.stringify({ ...store, interview: { attempts: {}, ownExamples: {}, session: { interviewId: 'vpn-incident', phase: 'answer' } } }),
      JSON.stringify({ ...store, prefs: { ...store.prefs, speech: { enabled: 'yes', voiceURI: null } } }),
    ]
    for (const raw of bad) {
      const parsed = parseStore(raw, NOW)
      expect(parsed).toMatchObject({ ok: false, kind: 'corrupt' })
      if (parsed.ok || parsed.kind !== 'corrupt') continue
      expect(Object.keys(parsed.recoverable?.store.cards ?? {})).toEqual(['access-v-001:flashcard'])
    }
  })
})

describe('stage 7: several tabs, updates and reset', () => {
  it('refuses to overwrite progress another tab saved meanwhile (revision check)', () => {
    const storage = new MemoryStorage()
    const a = new Persistence(storage)
    const b = new Persistence(storage)
    a.load(NOW)
    b.load(NOW)
    const fromA = sampleStore()
    expect(a.save(fromA)).toEqual({ status: 'saved', rev: 1 })
    const written = storage.data.get(STORAGE_KEY)
    expect(b.save(createStore(NOW))).toEqual({ status: 'conflict', reason: 'changed' })
    expect(storage.data.get(STORAGE_KEY)).toBe(written)
    // After reading again, the other tab may continue from the saved state.
    expect(b.load(NOW).status).toBe('loaded')
    expect(b.save(fromA)).toEqual({ status: 'saved', rev: 2 })
  })

  it('does not bring back progress that another tab deleted', () => {
    const storage = new MemoryStorage()
    const a = new Persistence(storage)
    a.load(NOW)
    a.save(sampleStore())
    storage.removeItem(STORAGE_KEY)
    expect(a.save(sampleStore())).toEqual({ status: 'conflict', reason: 'removed' })
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
  })

  it('never overwrites data that a newer version of the app saved', () => {
    const storage = new MemoryStorage()
    const old = new Persistence(storage)
    old.load(NOW)
    old.save(sampleStore())
    const newer = JSON.stringify({ ...sampleStore(), schemaVersion: SCHEMA_VERSION + 1, rev: 2, cards: {} })
    storage.data.set(STORAGE_KEY, newer)
    expect(old.save(sampleStore())).toEqual({ status: 'conflict', reason: 'newer' })
    expect(storage.data.get(STORAGE_KEY)).toBe(newer)
  })

  it('keeps the original text once before the first write of migrated data', () => {
    const storage = new MemoryStorage()
    const v4 = { ...sampleStore(), schemaVersion: 4, lesson: null } as Record<string, unknown>
    delete v4.rev
    delete v4.stats
    const raw = JSON.stringify(v4)
    storage.data.set(STORAGE_KEY, raw)
    const p = new Persistence(storage)
    const outcome = p.load(NOW)
    expect(outcome).toMatchObject({ status: 'loaded', migratedFrom: 4 })
    if (outcome.status !== 'loaded') return
    // The save that keeps the original says so (the page then offers the kept data at once).
    expect(p.save(outcome.store)).toEqual({ status: 'saved', rev: 1, keptOriginal: true })
    expect(p.readBackup()).toEqual({ savedAt: NOW.toISOString(), fromVersion: 4, raw })
    const writes = storage.writes
    expect(p.save(outcome.store)).toEqual({ status: 'saved', rev: 2 })
    expect(storage.writes).toBe(writes + 1) // the backup is not written again
  })

  it('leaves the original untouched when keeping it fails', () => {
    const storage = new MemoryStorage()
    const v4 = { ...sampleStore(), schemaVersion: 4, lesson: null } as Record<string, unknown>
    delete v4.rev
    delete v4.stats
    const raw = JSON.stringify(v4)
    storage.data.set(STORAGE_KEY, raw)
    const p = new Persistence(storage)
    const outcome = p.load(NOW)
    if (outcome.status !== 'loaded') throw new Error('expected loaded')
    storage.failWith = 'QuotaExceededError'
    storage.failKey = BACKUP_KEY
    expect(p.save(outcome.store)).toEqual({ status: 'failed', error: 'QuotaExceededError' })
    expect(storage.data.get(STORAGE_KEY)).toBe(raw)
  })

  it('reset removes exactly the keys of this app', () => {
    const storage = new MemoryStorage()
    storage.data.set('another-app:settings', '{"theme":"dark"}')
    storage.data.set('cloud-admin-deutsch-at-other', 'not ours either')
    const p = new Persistence(storage)
    p.load(NOW)
    p.save(sampleStore())
    storage.data.set(BACKUP_KEY, JSON.stringify({ savedAt: NOW.toISOString(), fromVersion: 4, raw: '{}' }))
    expect(p.clear()).toEqual({ status: 'saved', rev: 0 })
    expect([...storage.data.keys()].sort()).toEqual(['another-app:settings', 'cloud-admin-deutsch-at-other'])
    expect(p.save(sampleStore())).toEqual({ status: 'saved', rev: 1 })
  })

  it('checks the envelope before migrating: a broken one is not migrated', () => {
    const v3 = { app: 'something-else', schemaVersion: 3, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString(), cards: sampleStore().cards }
    const parsed = parseStore(JSON.stringify(v3), NOW)
    expect(parsed).toMatchObject({ ok: false, kind: 'corrupt', reason: 'invalid-app' })
    if (parsed.ok || parsed.kind !== 'corrupt') return
    // Only the cards can be kept; nothing else was guessed or migrated.
    expect(parsed.recoverable?.store.cards).toEqual(sampleStore().cards)
    expect(parsed.recoverable?.store.lesson).toBeNull()
  })

  it('accepts a waiting answer only for the current card and turn of an open lesson', () => {
    const store = sampleStore()
    const lesson = store.lesson!
    const ok = { ...lesson, pending: { cardId: lesson.queue[0]!, turn: 0, verdict: 'incorrect', response: { type: 'text', value: 'falsch' }, at: NOW.toISOString() } }
    expect(parseStore(JSON.stringify({ ...store, lesson: ok }), NOW)).toMatchObject({ ok: true })
    const wrongCard = { ...ok, pending: { ...ok.pending, cardId: lesson.queue[1]! } }
    const wrongTurn = { ...ok, pending: { ...ok.pending, turn: 3 } }
    const badResponse = { ...ok, pending: { ...ok.pending, response: { type: 'order', picked: [1, 1] } } }
    const finished = { ...ok, finishedAt: NOW.toISOString() }
    for (const bad of [wrongCard, wrongTurn, badResponse, finished]) {
      expect(parseStore(JSON.stringify({ ...store, lesson: bad }), NOW)).toMatchObject({ ok: false, kind: 'corrupt', reason: 'invalid-lesson' })
    }
  })

  it('rejects statistics of the wrong shape', () => {
    const store = sampleStore()
    const bad = [
      { ...store.stats, lessons: { completed: -1, endedEarly: 0 } },
      { ...store.stats, firstAttempt: { correct: 1 } },
      { ...store.stats, recorded: Array.from({ length: 31 }, (_, i) => `l-${i}`) },
    ]
    for (const stats of bad) {
      expect(parseStore(JSON.stringify({ ...store, stats }), NOW)).toMatchObject({ ok: false, kind: 'corrupt', reason: 'invalid-stats' })
    }
  })
})
