import type { CosmeticNote } from '../../domain/answerCheck'
import { useMessages } from '../../i18n'

/**
 * Differences that are not a mistake in the practised phenomenon (so far only
 * punctuation), named exactly – e.g. "Před „dass“ chybí čárka." – and kept
 * apart from the verdict.
 */
export function CosmeticNotes({ notes }: { notes: readonly CosmeticNote[] | undefined }) {
  const m = useMessages()
  if (!notes || notes.length === 0) return null
  const lines = notes.flatMap((note) => m.cosmetic.lines(note))
  return (
    <div className="cosmetic">
      <p className="cosmetic-title">{m.cosmetic.title}</p>
      <ul className="cosmetic-list">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
