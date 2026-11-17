import { describe, expect, it } from 'vitest'
import { CARDS, INTERVIEW_BY_ID, KNOWN_CARD_IDS } from '../content'
import { advancePhase, setCheck, startSession } from '../domain/interview'
import {
  composeDaily,
  currentCardId,
  currentTurn,
  finishEarly,
  pendingFor,
  rateCurrent,
  rateSubmitted,
  startLesson,
  submitAnswer,
  type CardFilter,
  type Lesson,
} from '../domain/lesson'
import { localDay } from '../domain/localDay'
import { counts } from '../domain/progressViews'
import { recordLesson } from '../domain/stats'
import type { CardId } from '../domain/types'
import { MemoryStorage } from './__fixtures__/memoryStorage'
import { Persistence } from './persistence'
import { prepareStore } from './restore'
import { createStore, STORAGE_KEY, type Store } from './store'

/**
 * `npm run test:reload` – what a reload keeps:
 * - before an answer: the lesson at the same card, nothing counted;
 * - after the answer was handed in: the same result, waiting for its rating, no second answer;
 * - after the rating: the next card, the rating counted exactly once;
 * - after the lesson: the summary; the statistics count it once, however often it is shown.
 */

const NOW = new Date(2026, 10, 11, 9, 0)
const TODAY = localDay(NOW)
const ALL: CardFilter = { topic: 'all', level: 'all', exercise: 'mixed', focus: 'all' }
const WRITE = 'access-v-006:write' // die Authentifizierungsmethode
const FLASH = 'network-v-001:flashcard'

/** A daily lesson with three cards rated, as the app would have saved it. */
function inProgress(): Store {
  let store = createStore(NOW)
  let lesson = startLesson('daily', composeDaily(CARDS, store.cards, TODAY, ALL), ALL, NOW)
  for (const rating of ['good', 'again', 'hard'] as const) {
    const id = currentCardId(lesson)!
    const result = rateCurrent(lesson, store.cards[id], rating, 'self', NOW)
    store = { ...store, cards: { ...store.cards, [id]: result.state } }
    lesson = result.lesson
  }
  const interview = INTERVIEW_BY_ID.get('vpn-incident')!
  let progress = advancePhase(advancePhase(startSession(interview, store.interview, NOW), 'question'), 'followUp')
  progress = setCheck(progress, 'direct', 'yes')
  return { ...store, lesson, interview: progress }
}

/** Saves like the app does: load first (that enables writing and reads the revision), then save. */
function persist(storage: MemoryStorage, store: Store): void {
  const p = new Persistence(storage)
  p.load(NOW)
  expect(p.save(store).status).toBe('saved')
}

function reload(storage: MemoryStorage): Store {
  const outcome = new Persistence(storage).load(NOW)
  expect(outcome.status).toBe('loaded')
  return prepareStore(outcome.store, KNOWN_CARD_IDS, NOW)
}

function withLesson(cards: CardId[]): Store {
  return { ...createStore(NOW), lesson: startLesson('daily', cards, ALL, NOW) }
}

describe('recovery after a reload', () => {
  it('continues the lesson at the same card with the same counters', () => {
    const storage = new MemoryStorage()
    const before = inProgress()
    persist(storage, before)
    const writes = storage.writes
    const after = reload(storage)
    expect(storage.writes).toBe(writes)
    expect(currentCardId(after.lesson!)).toBe(currentCardId(before.lesson!))
    expect(after.lesson!.log).toHaveLength(3)
    expect(after.lesson!.queue).toEqual(before.lesson!.queue)
    expect(counts(CARDS, after.cards, TODAY, ALL)).toEqual(counts(CARDS, before.cards, TODAY, ALL))
  })

  it('reloading twice changes nothing', () => {
    const storage = new MemoryStorage()
    persist(storage, inProgress())
    const first = reload(storage)
    const second = reload(storage)
    expect(second).toEqual(first)
  })

  it('keeps the interview at the same question, phase and started self-assessment', () => {
    const storage = new MemoryStorage()
    persist(storage, inProgress())
    const session = reload(storage).interview.session
    expect(session).toMatchObject({ interviewId: 'vpn-incident', index: 0, phase: 'review', draft: { direct: 'yes' }, finishedAt: null })
  })

  it('drops cards that left the content from the queue, without touching progress', () => {
    const storage = new MemoryStorage()
    const store = inProgress()
    const gone = 'retired-v-001:flashcard' as const
    const lesson = { ...store.lesson!, cards: [...store.lesson!.cards, gone], queue: [...store.lesson!.queue, gone] }
    persist(storage, { ...store, lesson, cards: { ...store.cards, [gone]: { ...Object.values(store.cards)[0]! } } })
    const after = reload(storage)
    expect(after.lesson!.queue).not.toContain(gone)
    expect(after.cards[gone]).toBeDefined()
  })

  it('reset removes only the keys of this app', () => {
    const storage = new MemoryStorage()
    storage.data.set('another-app:settings', '{"theme":"dark"}')
    const p = new Persistence(storage)
    p.load(NOW)
    p.save(inProgress())
    expect(p.clear()).toEqual({ status: 'saved', rev: 0 })
    expect(storage.data.has(STORAGE_KEY)).toBe(false)
    expect(storage.data.get('another-app:settings')).toBe('{"theme":"dark"}')
    expect(new Persistence(storage).load(NOW).status).toBe('fresh')
  })
})

describe('reload at each step of a turn', () => {
  it('before answering: same card, nothing counted', () => {
    const storage = new MemoryStorage()
    persist(storage, withLesson([WRITE, FLASH]))
    const after = reload(storage)
    expect(currentCardId(after.lesson!)).toBe(WRITE)
    expect(pendingFor(after.lesson!)).toBeNull()
    expect(after.lesson!.log).toHaveLength(0)
    expect(after.cards[WRITE]).toBeUndefined()
  })

  it('after handing in a wrong answer: the same result waits for its rating and cannot be replaced', () => {
    const storage = new MemoryStorage()
    const store = withLesson([WRITE, FLASH])
    const handedIn = submitAnswer(store.lesson!, WRITE, 0, 'incorrect', { type: 'text', value: 'die Authentifizierungsmetode' }, NOW)!
    persist(storage, { ...store, lesson: handedIn })

    const after = reload(storage)
    expect(pendingFor(after.lesson!)).toMatchObject({
      cardId: WRITE,
      turn: 0,
      verdict: 'incorrect',
      response: { type: 'text', value: 'die Authentifizierungsmetode' },
    })
    // A second answer – e.g. the right one after seeing the solution – is refused.
    expect(submitAnswer(after.lesson!, WRITE, 0, 'correct', { type: 'text', value: 'die Authentifizierungsmethode' }, NOW)).toBeNull()
    // A wrong answer can only be rated "Znovu".
    expect(rateSubmitted(after.lesson!, after.cards[WRITE], WRITE, 0, 'good', NOW)).toBeNull()
    const rated = rateSubmitted(after.lesson!, after.cards[WRITE], WRITE, 0, 'again', NOW)!
    expect(rated.lesson.log).toEqual([expect.objectContaining({ cardId: WRITE, rating: 'again', verdict: 'incorrect' })])
    expect(rated.state).toMatchObject({ level: 0, due: '2026-11-12' })
  })

  it('after rating: the next card, and the same rating sent again is ignored', () => {
    const storage = new MemoryStorage()
    const store = withLesson([FLASH, WRITE])
    const revealed = submitAnswer(store.lesson!, FLASH, 0, 'self', null, NOW)!
    const rated = rateSubmitted(revealed, undefined, FLASH, 0, 'good', NOW)!
    persist(storage, { ...store, lesson: rated.lesson, cards: { [FLASH]: rated.state } })

    const after = reload(storage)
    expect(currentCardId(after.lesson!)).toBe(WRITE)
    expect(currentTurn(after.lesson!)).toBe(1)
    // A double click or a stale screen repeats the call for turn 0: nothing changes.
    expect(rateSubmitted(after.lesson!, after.cards[FLASH], FLASH, 0, 'good', NOW)).toBeNull()
    expect(after.lesson!.log).toHaveLength(1)
    expect(after.cards[FLASH]).toMatchObject({ level: 1, reviews: 1 })
  })

  it('"Znovu" on the last card brings it back at once, yet one click counts once', () => {
    let lesson: Lesson = withLesson([FLASH]).lesson!
    lesson = submitAnswer(lesson, FLASH, 0, 'self', null, NOW)!
    const first = rateSubmitted(lesson, undefined, FLASH, 0, 'again', NOW)!
    expect(currentCardId(first.lesson)).toBe(FLASH) // back at once
    expect(rateSubmitted(first.lesson, first.state, FLASH, 0, 'again', NOW)).toBeNull() // the second click of a double click
    expect(first.lesson.log).toHaveLength(1)
  })

  it('after the lesson: the summary stays, and the statistics count the lesson once', () => {
    const storage = new MemoryStorage()
    const store = withLesson([FLASH])
    const revealed = submitAnswer(store.lesson!, FLASH, 0, 'self', null, NOW)!
    const rated = rateSubmitted(revealed, undefined, FLASH, 0, 'good', NOW)!
    expect(rated.lesson.finishedAt).not.toBeNull()
    const stats = recordLesson(store.stats, rated.lesson)
    persist(storage, { ...store, lesson: rated.lesson, cards: { [FLASH]: rated.state }, stats })

    const after = reload(storage)
    expect(after.lesson!.finishedAt).not.toBeNull()
    expect(after.stats.lessons).toEqual({ completed: 1, endedEarly: 0 })
    // Leaving and opening the summary again records nothing new.
    expect(recordLesson(after.stats, after.lesson!)).toBe(after.stats)
  })

  it('ending a lesson after a wrong answer still counts it as "Znovu"', () => {
    const store = withLesson([WRITE, FLASH])
    const handedIn = submitAnswer(store.lesson!, WRITE, 0, 'unknown', null, NOW)!
    const closed = finishEarly(handedIn, store.cards, new Date(NOW.getTime() + 60_000))
    expect(closed.lesson.finishedAt).not.toBeNull()
    expect(closed.lesson.pending).toBeNull()
    expect(closed.lesson.log).toEqual([expect.objectContaining({ cardId: WRITE, rating: 'again', verdict: 'unknown' })])
    expect(closed.cards[WRITE]).toMatchObject({ level: 0, due: '2026-11-12', againCount: 1 })
  })

  it('ending a lesson with a correct answer that was not rated yet leaves the card as it was', () => {
    const store = withLesson([WRITE])
    const handedIn = submitAnswer(store.lesson!, WRITE, 0, 'correct', { type: 'text', value: 'die Authentifizierungsmethode' }, NOW)!
    const closed = finishEarly(handedIn, store.cards, NOW)
    expect(closed.lesson.log).toHaveLength(0)
    expect(closed.cards[WRITE]).toBeUndefined()
  })
})
