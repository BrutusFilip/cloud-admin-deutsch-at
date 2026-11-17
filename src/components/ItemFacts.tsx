import type { StudyItem } from '../domain/types'
import { useMessages } from '../i18n'
import { fitStyle } from '../lib/fitText'
import { CzechText } from './CzechText'

/** Grammar line, one sentence in context and notes – shared by flashcards, feedback and the dictionary. */
export function ItemFacts({ item, showExample = true }: { item: StudyItem; showExample?: boolean }) {
  const m = useMessages()
  const f = m.feedback
  const rows: { label: string; value: string; de?: boolean }[] = []
  if (item.kind === 'noun') {
    rows.push({ label: f.plural, value: item.plural ?? f.noPlural, de: item.plural !== null })
  }
  if (item.kind === 'verb') {
    rows.push({ label: f.government, value: item.government, de: true })
    rows.push({ label: f.past, value: item.past, de: true })
  }
  if ((item.kind === 'phrase' || item.kind === 'word') && item.grammar) {
    // Principal parts of the verb and its government, or the forms of the phrase.
    rows.push({ label: f.forms, value: item.grammar, de: true })
  }

  return (
    <div className="facts">
      {rows.length > 0 && (
        <dl className="facts-grammar">
          {item.kind === 'noun' && (
            <div>
              <dt>{f.genderLabel}</dt>
              <dd>{m.gender(item.gender)}</dd>
            </div>
          )}
          {rows.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd lang={r.de ? 'de-AT' : undefined}>{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {showExample && (
        <figure className="facts-example">
          <figcaption>{item.kind === 'grammar' ? m.grammar.moreExample : f.inContext}</figcaption>
          <blockquote lang="de-AT" style={fitStyle(item.example.de)}>
            {item.example.de}
          </blockquote>
          <p className="facts-example-cz" lang="cs">
            {item.example.cz}
          </p>
        </figure>
      )}
      {item.noteCz && (
        <p className="facts-note">
          <span className="facts-label">{f.note}</span> <span lang="cs">
            <CzechText text={item.noteCz} />
          </span>
        </p>
      )}
      {item.atNote && (
        <p className="facts-note facts-note--at">
          <span className="facts-label">{f.austria}</span> <span lang="cs">{item.atNote}</span>
        </p>
      )}
      {item.illustrative && <IllustrativeNote />}
    </div>
  )
}

/** Sample experience: shown wherever the item is, so it is never mistaken for a fact about the learner. */
export function IllustrativeNote() {
  const m = useMessages()
  return (
    <p className="facts-note facts-note--illustrative">
      <span className="chip chip--illustrative">{m.illustrative.label}</span> {m.illustrative.text}
    </p>
  )
}
