import type { ItemKind, Level, StudyItem, Topic, TopicId } from './types'

/**
 * Dictionary search is deliberately lenient (unlike answer checking):
 * diacritics are ignored and ä = a = ae, ß = ss, so "zuruecksetzen",
 * "zurucksetzen" and Czech "opravneni" all find their entries.
 */
export function foldForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('de-AT')
    .replace(/ß/g, 'ss')
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Dictionary groups: words and phrases, sentences, grammar tasks. */
export type KindGroup = 'vocab' | 'sentence' | 'grammar'
export const KIND_GROUPS: readonly KindGroup[] = ['vocab', 'sentence', 'grammar']

export function kindGroup(kind: ItemKind): KindGroup {
  if (kind === 'sentence' || kind === 'grammar') return kind
  return 'vocab'
}

export interface SearchFilter {
  topic: TopicId | 'all'
  level: Level | 'all'
  kind: KindGroup | 'all'
}

function haystack(item: StudyItem): string {
  const parts = [item.de, item.cz, item.example.de, item.example.cz]
  if (item.kind === 'noun' && item.plural) parts.push(item.plural)
  if (item.kind === 'verb') parts.push(item.government, item.past)
  if ((item.kind === 'phrase' || item.kind === 'word') && item.grammar) parts.push(item.grammar)
  return foldForSearch(parts.join('   '))
}

export function searchItems(
  items: readonly StudyItem[],
  topics: readonly Topic[],
  query: string,
  filter: SearchFilter,
): StudyItem[] {
  const order = new Map(topics.map((t) => [t.id, t.order]))
  const q = foldForSearch(query)
  const terms = q === '' ? [] : q.split(' ')
  const scored: { item: StudyItem; rank: number; index: number }[] = []
  items.forEach((item, index) => {
    if (filter.topic !== 'all' && item.topic !== filter.topic) return
    if (filter.level !== 'all' && item.level !== filter.level) return
    if (filter.kind !== 'all' && kindGroup(item.kind) !== filter.kind) return
    if (terms.length > 0) {
      const hay = haystack(item)
      if (!terms.every((t) => hay.includes(t))) return
    }
    let rank = 2
    if (q !== '') {
      const head = [foldForSearch(item.de), foldForSearch(item.cz)]
      if (head.some((h) => h.startsWith(q) || h.includes(` ${q}`))) rank = 0
      else if (head.some((h) => h.includes(q))) rank = 1
    }
    scored.push({ item, rank, index })
  })
  return scored
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        (order.get(a.item.topic) ?? 0) - (order.get(b.item.topic) ?? 0) ||
        a.index - b.index,
    )
    .map((s) => s.item)
}
