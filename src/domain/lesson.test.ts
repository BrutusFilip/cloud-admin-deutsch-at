import { describe, expect, it } from 'vitest'
import { buildCards } from './cards'
import {
  acceptAnswer,
  allowedRatings,
  ALL_CARDS,
  composeDaily,
  composeFree,
  composeMistakes,
  currentTurn,
  finishEarly,
  isCompleted,
  isResumable,
  LESSON_SIZE,
  MAX_ATTEMPTS,
  mistakeCards,
  pendingFor,
  pruneLesson,
  rateCurrent,
  rateSubmitted,
  startLesson,
  submitAnswer,
  summarize,
  type CardStates,
  type Lesson,
} from './lesson'
import { isDue, type CardState } from './scheduler'
import { GRAMMAR_ITEMS } from './__fixtures__/grammar'
import { ITEMS, TOPICS } from './__fixtures__/items'
import type { CardId, StudyItem } from './types'

const CARDS = buildCards(ITEMS, TOPICS)
const NOW = new Date(2026, 10, 4, 18, 0)
const TODAY = '2026-11-04'

function seen(due: string, partial: Partial<CardState> = {}): CardState {
  return { level: 1, due, lastReviewed: '2026-11-01', lastRating: 'good', reviews: 1, againCount: 0, ...partial }
}

function many(count: number): StudyItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `m365-v-${String(100 + i).padStart(3, '0')}`,
    kind: 'phrase' as const,
    topic: 'm365' as const,
    level: 'B2' as const,
    de: `Ausdruck ${i}`,
    cz: `výraz ${i}`,
    example: { de: `Satz ${i}.`, cz: `Věta ${i}.` },
  }))
}

describe('cards on the study path', () => {
  it('orders cards by topic, content order and flashcard before writing', () => {
    expect(CARDS.map((c) => c.id)).toEqual([
      'identity-v-001:flashcard',
      'identity-v-001:write',
      'identity-s-001:write',
      'm365-v-001:flashcard',
      'm365-v-001:write',
      'm365-v-002:flashcard',
      'm365-v-002:write',
      'm365-v-003:flashcard',
      'm365-v-003:write',
      'm365-s-001:write',
    ])
  })
})

describe('daily lesson composition', () => {
  it('offers due cards first (longest waiting first), then new cards, at most 10', () => {
    const items = many(12)
    const cards = buildCards(items, TOPICS)
    const states: CardStates = {
      'm365-v-105:flashcard': seen('2026-11-04'),
      'm365-v-103:flashcard': seen('2026-10-30'),
      'm365-v-110:flashcard': seen('2026-11-09'),
    }
    const ids = composeDaily(cards, states, TODAY, ALL_CARDS)
    expect(ids).toHaveLength(LESSON_SIZE)
    expect(ids.slice(0, 2)).toEqual(['m365-v-103:flashcard', 'm365-v-105:flashcard'])
    expect(ids).not.toContain('m365-v-110:flashcard')
    expect(ids[2]).toBe('m365-v-100:flashcard')
  })

  it('offers a vocabulary writing card only after its flashcard was rated (mixed lessons)', () => {
    expect(composeDaily(CARDS, {}, TODAY, ALL_CARDS)).toEqual([
      'identity-v-001:flashcard',
      'identity-s-001:write',
      'm365-v-001:flashcard',
      'm365-v-002:flashcard',
      'm365-v-003:flashcard',
      'm365-s-001:write',
    ])
    const states: CardStates = { 'identity-v-001:flashcard': seen('2026-11-07') }
    expect(composeDaily(CARDS, states, TODAY, ALL_CARDS)).toContain('identity-v-001:write')
  })

  it('takes at most one card per item, so a flashcard never gives away the writing answer', () => {
    const states: CardStates = {
      'identity-v-001:flashcard': seen('2026-11-03'),
      'identity-v-001:write': seen('2026-11-02'),
    }
    const ids = composeDaily(CARDS, states, TODAY, ALL_CARDS)
    expect(ids[0]).toBe('identity-v-001:write')
    expect(ids).not.toContain('identity-v-001:flashcard')
    expect(new Set(ids.map((id) => id.split(':')[0])).size).toBe(ids.length)
  })

  it('opens all writing cards when writing is chosen explicitly', () => {
    const ids = composeDaily(CARDS, {}, TODAY, { ...ALL_CARDS, exercise: 'write' })
    expect(ids).toContain('identity-v-001:write')
    expect(ids.every((id) => id.endsWith(':write'))).toBe(true)
  })

  it('filters by topic and level and returns nothing when a topic is used up', () => {
    const states: CardStates = Object.fromEntries(
      CARDS.filter((c) => c.item.topic === 'identity').map((c) => [c.id, seen('2026-11-08')]),
    )
    expect(composeDaily(CARDS, states, TODAY, { ...ALL_CARDS, topic: 'identity' })).toEqual([])
    expect(composeDaily(CARDS, {}, TODAY, { ...ALL_CARDS, topic: 'm365', level: 'C1' })).toEqual(['m365-s-001:write'])
  })
})

describe('lesson flow', () => {
  function run(lesson: Lesson, states: CardStates, rating: 'again' | 'hard' | 'good', now = NOW) {
    const id = lesson.queue[0] as CardId
    const r = rateCurrent(lesson, states[id], rating, 'self', now)
    return { lesson: r.lesson, states: { ...states, [id]: r.state }, result: r }
  }

  it('"Znovu" brings the card back three cards later and limits attempts', () => {
    const ids = composeDaily(CARDS, {}, TODAY, ALL_CARDS)
    let lesson = startLesson('daily', ids, ALL_CARDS, NOW)
    let states: CardStates = {}
    const first = lesson.queue[0]
    ;({ lesson, states } = run(lesson, states, 'again'))
    expect(lesson.queue.indexOf(first!)).toBe(3)
    expect(states[first!]).toMatchObject({ level: 0, due: '2026-11-05' })

    // Repeat until the attempt limit is reached.
    for (let attempt = 2; attempt <= MAX_ATTEMPTS; attempt++) {
      while (lesson.queue[0] !== first) ({ lesson, states } = run(lesson, states, 'good'))
      ;({ lesson, states } = run(lesson, states, 'again'))
    }
    expect(lesson.queue).not.toContain(first)
    expect(lesson.attempts[first!]).toBe(MAX_ATTEMPTS)
  })

  it('a later "Umím" in the same lesson does not reward a failed card', () => {
    const ids = composeDaily(CARDS, {}, TODAY, ALL_CARDS)
    let lesson = startLesson('daily', ids, ALL_CARDS, NOW)
    let states: CardStates = {}
    const first = lesson.queue[0]!
    ;({ lesson, states } = run(lesson, states, 'again'))
    while (lesson.queue[0] !== first) ({ lesson, states } = run(lesson, states, 'good'))
    const r = run(lesson, states, 'good')
    expect(r.result.effect).toBe('practice')
    expect(r.states[first]).toMatchObject({ level: 0, due: '2026-11-05', lastRating: 'good' })
  })

  it('finishes when the queue is empty and summarises first ratings and mistakes', () => {
    let lesson = startLesson('daily', ['identity-v-001:flashcard', 'm365-v-001:flashcard', 'm365-v-002:flashcard'], ALL_CARDS, NOW)
    let states: CardStates = {}
    ;({ lesson, states } = run(lesson, states, 'good'))
    ;({ lesson, states } = run(lesson, states, 'hard'))
    ;({ lesson, states } = run(lesson, states, 'again'))
    expect(lesson.queue).toEqual(['m365-v-002:flashcard'])
    ;({ lesson, states } = run(lesson, states, 'good'))
    expect(lesson.finishedAt).not.toBeNull()
    const summary = summarize(lesson)
    expect(summary).toMatchObject({
      total: 3,
      rated: 3,
      first: { again: 1, hard: 1, good: 1 },
      firstCorrect: 2,
      mistakes: ['m365-v-001:flashcard', 'm365-v-002:flashcard'],
      repeats: 1,
      skipped: 0,
    })
    // Only the first attempt of a card counts; the later "Umím" of the failed card does not.
    expect(summary.firstEntries['m365-v-002:flashcard']?.rating).toBe('again')
  })

  it('handles a lesson that crosses local midnight consistently', () => {
    const lateEvening = new Date(2026, 10, 4, 23, 58)
    const justBefore = new Date(2026, 10, 4, 23, 59)
    const justAfter = new Date(2026, 10, 5, 0, 1)
    let lesson = startLesson('daily', ['identity-v-001:flashcard', 'm365-v-001:flashcard', 'm365-v-002:flashcard'], ALL_CARDS, lateEvening)
    let states: CardStates = {}
    ;({ lesson, states } = run(lesson, states, 'again', justBefore)) // due 5 Nov, back in queue
    ;({ lesson, states } = run(lesson, states, 'good', justAfter)) // new card, first rated on 5 Nov
    expect(states['m365-v-001:flashcard']).toMatchObject({ level: 1, due: '2026-11-08' })
    ;({ lesson, states } = run(lesson, states, 'hard', justAfter))
    expect(states['m365-v-002:flashcard']).toMatchObject({ due: '2026-11-06' })
    const retry = run(lesson, states, 'good', justAfter) // failed before midnight, repeated after it
    expect(retry.result.effect).toBe('practice')
    expect(isDue(retry.states['identity-v-001:flashcard'], '2026-11-05')).toBe(true)
    // The unfinished lesson can be resumed on its own day only.
    expect(isResumable(lesson, '2026-11-04')).toBe(true)
    expect(isResumable(lesson, '2026-11-05')).toBe(false)
  })

  it('drops removed cards from a resumed lesson', () => {
    const lesson = startLesson('daily', ['identity-v-001:flashcard', 'gone-v-001:flashcard'], ALL_CARDS, NOW)
    const pruned = pruneLesson(lesson, new Set(CARDS.map((c) => c.id)), NOW)
    expect(pruned.queue).toEqual(['identity-v-001:flashcard'])
  })
})

describe('free practice and mistakes', () => {
  it('free practice takes seen cards that are not due, soonest first', () => {
    const states: CardStates = {
      'm365-v-001:flashcard': seen('2026-11-20'),
      'm365-v-002:flashcard': seen('2026-11-06'),
      'm365-v-003:flashcard': seen('2026-11-04'),
    }
    expect(composeFree(CARDS, states, TODAY, ALL_CARDS)).toEqual(['m365-v-002:flashcard', 'm365-v-001:flashcard'])
  })

  it('mistakes are cards last rated "Znovu" or "Těžké", most recent first', () => {
    const states: CardStates = {
      'm365-v-001:flashcard': seen('2026-11-05', { lastRating: 'again', lastReviewed: '2026-11-03' }),
      'm365-v-002:flashcard': seen('2026-11-05', { lastRating: 'hard', lastReviewed: '2026-11-04' }),
      'm365-v-003:flashcard': seen('2026-11-07', { lastRating: 'good', lastReviewed: '2026-11-04' }),
    }
    expect(mistakeCards(CARDS, states, ALL_CARDS).map((c) => c.id)).toEqual(['m365-v-002:flashcard', 'm365-v-001:flashcard'])
  })

  it('a quick repeat of mistakes uses one card per item and does not lengthen intervals', () => {
    const states: CardStates = {
      'm365-v-001:flashcard': seen('2026-11-05', { lastRating: 'again', lastReviewed: '2026-11-04' }),
      'm365-v-001:write': seen('2026-11-05', { lastRating: 'hard', lastReviewed: '2026-11-03' }),
    }
    const ids = composeMistakes(CARDS, states, ALL_CARDS)
    expect(ids).toEqual(['m365-v-001:flashcard'])
    const lesson = startLesson('mistakes', ids, ALL_CARDS, NOW)
    const r = rateCurrent(lesson, states['m365-v-001:flashcard'], 'good', 'self', NOW)
    expect(r.effect).toBe('practice')
    expect(r.state).toMatchObject({ level: 1, due: '2026-11-05', lastRating: 'good' })
  })
})

describe('grammar tasks in lessons', () => {
  const WITH_GRAMMAR = buildCards([...ITEMS, ...GRAMMAR_ITEMS], TOPICS)

  it('gives every grammar task exactly one card', () => {
    const grammar = WITH_GRAMMAR.filter((c) => c.item.kind === 'grammar')
    expect(grammar.map((c) => c.id).sort()).toEqual(GRAMMAR_ITEMS.map((i) => `${i.id}:grammar`).sort())
    expect(grammar.every((c) => c.exercise === 'grammar')).toBe(true)
  })

  it('mixes grammar into the daily lesson in path order, without waiting for a flashcard', () => {
    const ids = composeDaily(WITH_GRAMMAR, {}, TODAY, ALL_CARDS)
    expect(ids).toContain('identity-g-001:grammar')
    expect(ids.indexOf('identity-v-001:flashcard')).toBeLessThan(ids.indexOf('identity-g-001:grammar'))
  })

  it('filters by exercise "grammar" and by grammar focus', () => {
    const grammar = composeDaily(WITH_GRAMMAR, {}, TODAY, { ...ALL_CARDS, exercise: 'grammar' })
    expect(grammar.every((id) => id.endsWith(':grammar'))).toBe(true)
    expect(grammar).toHaveLength(GRAMMAR_ITEMS.length)
    const wordOrder = composeDaily(WITH_GRAMMAR, {}, TODAY, { ...ALL_CARDS, exercise: 'grammar', focus: 'word-order' })
    expect(wordOrder.sort()).toEqual(['m365-g-002:grammar', 'm365-g-003:grammar'])
    // A focus always means grammar tasks, even in a mixed filter.
    expect(composeDaily(WITH_GRAMMAR, {}, TODAY, { ...ALL_CARDS, focus: 'past' })).toEqual(['identity-g-003:grammar'])
  })
})

describe('stage 7: one answer and one rating per turn', () => {
  const W = 'm365-s-001:write' as CardId
  const F = 'identity-v-001:flashcard' as CardId
  const start = () => startLesson('daily', [W, F], ALL_CARDS, NOW)

  it('hands in an answer once; a stale or repeated call changes nothing', () => {
    const lesson = start()
    const handed = submitAnswer(lesson, W, 0, 'incorrect', { type: 'text', value: 'falsch' }, NOW)!
    expect(pendingFor(handed)).toMatchObject({ cardId: W, turn: 0, verdict: 'incorrect' })
    expect(submitAnswer(handed, W, 0, 'correct', { type: 'text', value: 'richtig' }, NOW)).toBeNull() // second Enter
    expect(submitAnswer(lesson, F, 0, 'self', null, NOW)).toBeNull() // another card
    expect(submitAnswer(lesson, W, 1, 'self', null, NOW)).toBeNull() // another turn
    expect(submitAnswer(lesson, W, 0, 'accepted', null, NOW)).toBeNull() // "accepted" only follows a wrong answer
  })

  it('allows only the ratings that fit the verdict', () => {
    expect(allowedRatings('incorrect')).toEqual(['again'])
    expect(allowedRatings('unknown')).toEqual(['again'])
    expect(allowedRatings('correct')).toEqual(['hard', 'good'])
    expect(allowedRatings('accepted')).toEqual(['hard', 'good'])
    expect(allowedRatings('self')).toEqual(['again', 'hard', 'good'])
    const wrong = submitAnswer(start(), W, 0, 'incorrect', { type: 'text', value: 'falsch' }, NOW)!
    expect(rateSubmitted(wrong, undefined, W, 0, 'good', NOW)).toBeNull()
    const claimed = acceptAnswer(wrong, W, 0)!
    expect(pendingFor(claimed)?.verdict).toBe('accepted')
    expect(acceptAnswer(claimed, W, 0)).toBeNull()
    expect(rateSubmitted(claimed, undefined, W, 0, 'hard', NOW)?.lesson.log[0]).toMatchObject({ rating: 'hard', verdict: 'accepted' })
  })

  it('rates only after the answer is in, then moves to the next turn', () => {
    const lesson = start()
    expect(rateSubmitted(lesson, undefined, W, 0, 'again', NOW)).toBeNull() // nothing handed in yet
    const handed = submitAnswer(lesson, W, 0, 'correct', { type: 'text', value: 'ok' }, NOW)!
    const rated = rateSubmitted(handed, undefined, W, 0, 'good', NOW)!
    expect(currentTurn(rated.lesson)).toBe(1)
    expect(rated.lesson.pending).toBeNull()
    expect(rateSubmitted(rated.lesson, rated.state, W, 0, 'good', NOW)).toBeNull()
  })

  it('keeps the checked result apart from own ratings in the summary', () => {
    let lesson = startLesson('daily', ['m365-s-001:write', 'identity-v-001:flashcard', 'm365-v-001:flashcard'], ALL_CARDS, NOW)
    let states: CardStates = {}
    const step = (verdict: Parameters<typeof submitAnswer>[3], rating: 'again' | 'hard' | 'good') => {
      const id = lesson.queue[0]!
      const handed = submitAnswer(lesson, id, currentTurn(lesson), verdict, null, NOW)!
      const r = rateSubmitted(handed, states[id], id, currentTurn(lesson), rating, NOW)!
      lesson = r.lesson
      states = { ...states, [id]: r.state }
    }
    step('unknown', 'again') // writing: solution revealed
    step('self', 'good') // flashcard
    step('self', 'again') // flashcard, own rating
    const s = summarize(lesson)
    expect(s.checked).toEqual({ correct: 0, variant: 0, accepted: 0, incorrect: 0, revealed: 1 })
    expect(s.self).toEqual({ again: 1, hard: 0, good: 1 })
    expect(s.completed).toBe(false) // two cards came back after "Znovu"
    expect(isCompleted(lesson)).toBe(false)
  })

  it('a lesson ended early is not completed; one emptied by ratings is', () => {
    const lesson = start()
    const closed = finishEarly(submitAnswer(lesson, W, 0, 'correct', { type: 'text', value: 'ok' }, NOW)!, {}, NOW)
    expect(isCompleted(closed.lesson)).toBe(false)
    let one = startLesson('daily', [F], ALL_CARDS, NOW)
    one = submitAnswer(one, F, 0, 'self', null, NOW)!
    expect(isCompleted(rateSubmitted(one, undefined, F, 0, 'good', NOW)!.lesson)).toBe(true)
  })

  it('a wrong answer handed in before midnight counts on its own day when the lesson closes the next day', () => {
    const evening = new Date(2026, 10, 4, 23, 50)
    const handed = submitAnswer(start(), W, 0, 'incorrect', { type: 'text', value: 'falsch' }, evening)!
    const closed = finishEarly(handed, {}, new Date(2026, 10, 5, 8, 0))
    expect(closed.cards[W]).toMatchObject({ lastReviewed: '2026-11-04', due: '2026-11-05', level: 0 })
  })
})
