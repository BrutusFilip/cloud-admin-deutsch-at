import { TOPICS } from '../content'
import { KIND_GROUPS, type KindGroup } from '../domain/search'
import { GRAMMAR_FOCI, LEVELS, type GrammarFocus, type Level, type TopicId } from '../domain/types'
import { useMessages } from '../i18n'

interface TopicSelectProps {
  id: string
  value: TopicId | 'all'
  onChange: (topic: TopicId | 'all') => void
  counts?: Partial<Record<TopicId | 'all', string>>
}

export function TopicSelect({ id, value, onChange, counts }: TopicSelectProps) {
  const m = useMessages()
  const label = (text: string, key: TopicId | 'all') => (counts?.[key] ? `${text} (${counts[key]})` : text)
  return (
    <div className="field">
      <label htmlFor={id}>{m.common.topic}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as TopicId | 'all')}>
        <option value="all">{label(m.common.allTopics, 'all')}</option>
        {TOPICS.map((t) => (
          <option key={t.id} value={t.id}>
            {label(m.title(t), t.id)}
          </option>
        ))}
      </select>
    </div>
  )
}

interface LevelSelectProps {
  id: string
  value: Level | 'all'
  onChange: (level: Level | 'all') => void
}

export function LevelSelect({ id, value, onChange }: LevelSelectProps) {
  const m = useMessages()
  return (
    <div className="field">
      <label htmlFor={id}>{m.common.level}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as Level | 'all')}>
        <option value="all">{m.common.allLevels}</option>
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}

interface FocusSelectProps {
  id: string
  value: GrammarFocus | 'all'
  onChange: (focus: GrammarFocus | 'all') => void
}

export function FocusSelect({ id, value, onChange }: FocusSelectProps) {
  const m = useMessages()
  return (
    <div className="field">
      <label htmlFor={id}>{m.practice.focusLabel}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as GrammarFocus | 'all')}>
        <option value="all">{m.grammar.allFoci}</option>
        {GRAMMAR_FOCI.map((f) => (
          <option key={f} value={f}>
            {m.focus[f]}
          </option>
        ))}
      </select>
    </div>
  )
}

interface KindSelectProps {
  id: string
  value: KindGroup | 'all'
  onChange: (kind: KindGroup | 'all') => void
}

export function KindSelect({ id, value, onChange }: KindSelectProps) {
  const m = useMessages()
  return (
    <div className="field">
      <label htmlFor={id}>{m.dictionary.kindLabel}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as KindGroup | 'all')}>
        <option value="all">{m.dictionary.allKinds}</option>
        {KIND_GROUPS.map((k) => (
          <option key={k} value={k}>
            {m.dictionary.kindGroup[k]}
          </option>
        ))}
      </select>
    </div>
  )
}
