import { Fragment } from 'react'
import type { DiffPart } from '../../domain/answerCheck'
import { useMessages } from '../../i18n'

/**
 * Marks differing words.
 * - given / expected: a checked mistake – wrong words in the answer, corrected ones in the right form.
 * - mine / model: a free translation compared with the model – the words only differ, which may be
 *   a correct alternative, so nothing is called a mistake (neither in colour nor for screen readers).
 */
export function DiffText({ parts, side }: { parts: DiffPart[]; side: 'given' | 'expected' | 'mine' | 'model' }) {
  const m = useMessages()
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {!part.changed ? (
            part.text
          ) : side === 'given' ? (
            <span className="tok tok--wrong">
              <span className="sr-only">{m.feedback.wrongMark}</span>
              {part.text}
            </span>
          ) : side === 'mine' ? (
            <span className="tok tok--differs">
              <span className="sr-only">{m.feedback.differsMark}</span>
              {part.text}
            </span>
          ) : (
            <strong className="tok tok--fix">{part.text}</strong>
          )}
        </Fragment>
      ))}
    </>
  )
}
