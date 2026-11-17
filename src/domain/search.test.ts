import { describe, expect, it } from 'vitest'
import { foldForSearch, searchItems } from './search'
import { GRAMMAR_ITEMS } from './__fixtures__/grammar'
import { ITEMS, TOPICS } from './__fixtures__/items'

const ALL = { topic: 'all', level: 'all', kind: 'all' } as const

describe('dictionary search', () => {
  it('is lenient about umlauts and Czech diacritics (search only, not answers)', () => {
    expect(foldForSearch('zurücksetzen')).toBe(foldForSearch('zuruecksetzen'))
    expect(foldForSearch('Größe')).toBe(foldForSearch('groesse'))
    expect(searchItems(ITEMS, TOPICS, 'zurucksetzen', ALL).map((i) => i.id)).toEqual(['identity-v-001'])
    expect(searchItems(ITEMS, TOPICS, 'zuruecksetzen', ALL).map((i) => i.id)).toEqual(['identity-v-001'])
    expect(searchItems(ITEMS, TOPICS, 'postovni schranka', ALL).map((i) => i.id)).toEqual(['m365-v-001'])
  })

  it('finds plural and past forms', () => {
    expect(searchItems(ITEMS, TOPICS, 'postfacher', ALL)[0]?.id).toBe('m365-v-001')
    expect(searchItems(ITEMS, TOPICS, 'hat zuruckgesetzt', ALL)[0]?.id).toBe('identity-v-001')
  })

  it('filters by topic and level', () => {
    expect(searchItems(ITEMS, TOPICS, '', { ...ALL, topic: 'm365', level: 'B1' }).map((i) => i.id)).toEqual(['m365-v-001', 'm365-v-002'])
    expect(searchItems(ITEMS, TOPICS, '', { ...ALL, topic: 'identity' }).map((i) => i.id)).toEqual([
      'identity-v-001',
      'identity-s-001',
    ])
  })

  it('ranks headword matches before matches in examples', () => {
    const ids = searchItems(ITEMS, TOPICS, 'postfach', ALL).map((i) => i.id)
    expect(ids[0]).toBe('m365-v-001')
    expect(ids).toContain('m365-v-003')
  })
})

describe('dictionary kind filter', () => {
  const ALL_ITEMS = [...ITEMS, ...GRAMMAR_ITEMS]

  it('separates words and phrases, sentences and grammar tasks', () => {
    const ids = (kind: 'vocab' | 'sentence' | 'grammar') => searchItems(ALL_ITEMS, TOPICS, '', { ...ALL, kind }).map((i) => i.id)
    expect(ids('sentence').sort()).toEqual(['identity-s-001', 'm365-s-001'])
    expect(ids('grammar').sort()).toEqual(GRAMMAR_ITEMS.map((i) => i.id).sort())
    expect(ids('vocab')).toHaveLength(ITEMS.length - 2)
    expect(searchItems(ALL_ITEMS, TOPICS, '', ALL)).toHaveLength(ALL_ITEMS.length)
  })

  it('finds grammar tasks by their solved sentence', () => {
    expect(searchItems(ALL_ITEMS, TOPICS, 'kummere mich um', { ...ALL, kind: 'grammar' }).map((i) => i.id)).toEqual(['m365-g-001'])
  })
})
