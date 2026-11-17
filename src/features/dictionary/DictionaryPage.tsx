import { useEffect, useState } from 'react'
import { LevelChip } from '../../components/LevelChip'
import { KindSelect, LevelSelect, TopicSelect } from '../../components/Selects'
import { isKindGroup, isLevel, isTopicId } from '../../lib/guards'
import { CARDS, ITEMS, TOPIC_BY_ID, TOPICS } from '../../content'
import { itemStatus } from '../../domain/progressViews'
import { searchItems, type KindGroup } from '../../domain/search'
import type { Level, TopicId } from '../../domain/types'
import { dictionaryHash, entryHash, rememberDictionaryHash, replaceHash, type DictionaryState } from '../../app/router'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'
import { fitStyle } from '../../lib/fitText'

interface Props {
  initial: DictionaryState
}

export function DictionaryPage({ initial }: Props) {
  const m = useMessages()
  const { store } = useProgress()
  const topicTitle = (id: TopicId) => {
    const topic = TOPIC_BY_ID.get(id)
    return topic ? m.title(topic) : ''
  }
  const [q, setQ] = useState(initial.q)
  const [topic, setTopic] = useState<TopicId | 'all'>(isTopicId(initial.topic) ? initial.topic : 'all')
  const [level, setLevel] = useState<Level | 'all'>(isLevel(initial.level) ? initial.level : 'all')
  const [kind, setKind] = useState<KindGroup | 'all'>(isKindGroup(initial.kind) ? initial.kind : 'all')

  // The address changed from outside (a link such as "Slovník" in the navigation, back/forward,
  // an edited URL): take over its search. Typing replaces the address with the same values.
  const addressKey = [initial.q, initial.topic, initial.level, initial.kind].join('\u0000')
  const [seenKey, setSeenKey] = useState(addressKey)
  if (seenKey !== addressKey) {
    setSeenKey(addressKey)
    setQ(initial.q)
    setTopic(isTopicId(initial.topic) ? initial.topic : 'all')
    setLevel(isLevel(initial.level) ? initial.level : 'all')
    setKind(isKindGroup(initial.kind) ? initial.kind : 'all')
  }

  useEffect(() => {
    rememberDictionaryHash(dictionaryHash({ q: initial.q, topic: initial.topic, level: initial.level, kind: initial.kind }))
  }, [initial.q, initial.topic, initial.level, initial.kind])

  const sync = (next: Partial<{ q: string; topic: TopicId | 'all'; level: Level | 'all'; kind: KindGroup | 'all' }>) => {
    const hash = dictionaryHash({ q, topic, level, kind, ...next })
    rememberDictionaryHash(hash)
    replaceHash(hash)
  }

  const results = searchItems(ITEMS, TOPICS, q, { topic, level, kind })
  const filtered = q.trim() !== '' || topic !== 'all' || level !== 'all' || kind !== 'all'
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Each active filter as a removable chip: the learner sees what narrows the list and can undo one at a time.
  const active: { key: string; label: string; clear: () => void }[] = []
  if (q.trim() !== '')
    active.push({ key: 'q', label: m.dictionary.activeSearch(q.trim()), clear: () => (setQ(''), sync({ q: '' })) })
  if (topic !== 'all')
    active.push({ key: 'topic', label: `${m.common.topic}: ${topicTitle(topic)}`, clear: () => (setTopic('all'), sync({ topic: 'all' })) })
  if (level !== 'all')
    active.push({ key: 'level', label: `${m.common.levelShort}: ${level}`, clear: () => (setLevel('all'), sync({ level: 'all' })) })
  if (kind !== 'all')
    active.push({ key: 'kind', label: `${m.dictionary.kindLabel}: ${m.dictionary.kindGroup[kind]}`, clear: () => (setKind('all'), sync({ kind: 'all' })) })
  const filterCount = active.filter((a) => a.key !== 'q').length

  const clearAll = () => {
    setQ('')
    setTopic('all')
    setLevel('all')
    setKind('all')
    sync({ q: '', topic: 'all', level: 'all', kind: 'all' })
    document.getElementById('dict-q')?.focus()
  }

  return (
    <div className="page page--dictionary">
      <header className="page-head">
        <h1 id="page-title" tabIndex={-1}>
          {m.dictionary.title}
        </h1>
      </header>

      <div className="dict-layout">
        <search className="sheet dict-controls" aria-label={m.dictionary.searchRegion}>
          <div className="field field--search">
            <label htmlFor="dict-q">{m.dictionary.searchLabel}</label>
            <input
              id="dict-q"
              type="search"
              value={q}
              placeholder={m.dictionary.searchPlaceholder}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setQ(e.target.value)
                sync({ q: e.target.value })
              }}
            />
          </div>
          <button
            type="button"
            className="btn dict-filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="dict-filters"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {m.dictionary.filters(filterCount)}
          </button>
          <div className={filtersOpen ? 'filters dict-filters is-open' : 'filters dict-filters'} id="dict-filters">
            <TopicSelect
              id="dict-topic"
              value={topic}
              onChange={(t) => {
                setTopic(t)
                sync({ topic: t })
              }}
            />
            <LevelSelect
              id="dict-level"
              value={level}
              onChange={(l) => {
                setLevel(l)
                sync({ level: l })
              }}
            />
            <KindSelect
              id="dict-kind"
              value={kind}
              onChange={(k) => {
                setKind(k)
                sync({ kind: k })
              }}
            />
          </div>
        </search>

        <div className="dict-results">
          <div className="dict-summary">
            <p className="result-count" aria-live="polite">
              {m.dictionary.results(results.length)}
            </p>
            {active.length > 0 && (
              <ul className="active-filters" aria-label={m.dictionary.activeFilters}>
                {active.map((a) => (
                  <li key={a.key}>
                    <button type="button" className="filter-chip" onClick={a.clear} aria-label={m.dictionary.removeFilter(a.label)}>
                      <span>{a.label}</span>
                      <span className="filter-chip-x" aria-hidden="true">
                        ×
                      </span>
                    </button>
                  </li>
                ))}
                {active.length > 1 && (
                  <li>
                    <button type="button" className="btn btn--quiet btn--small" onClick={clearAll}>
                      {m.dictionary.clearFilters}
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          {results.length > 0 ? (
            <ul className="dict-list">
              {results.map((item) => {
                const status = itemStatus(item, CARDS, store.cards)
                return (
                  <li key={item.id}>
                    <a className="dict-row" href={entryHash(item.id)}>
                      <span className="dict-de" lang="de-AT" style={fitStyle(item.de)}>
                        {item.de}
                      </span>
                      <span className="dict-cz" lang="cs">
                        {item.cz}
                      </span>
                      <span className="dict-meta">
                        {m.kind(item)}
                        {item.kind === 'grammar' && ` (${m.focus[item.focus]})`}, {topicTitle(item.topic)}
                      </span>
                      <span className="dict-tags">
                        {item.illustrative && <span className="chip chip--illustrative">{m.illustrative.label}</span>}
                        <LevelChip level={item.level} />
                        <span className={`status status--${status}`}>{m.status[status]}</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="sheet empty">
              <h2 className="empty-title">{m.dictionary.noneTitle}</h2>
              <p>{m.dictionary.none}</p>
              {filtered && (
                <button type="button" className="btn btn--primary" onClick={clearAll}>
                  {m.dictionary.clear}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
