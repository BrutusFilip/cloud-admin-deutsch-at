import type { RefObject } from 'react'
import { useMessages } from '../../i18n'

const LETTERS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'] as const

interface Props {
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

/** Inserts German letters at the caret and keeps the focus in the answer field. */
export function UmlautBar({ inputRef, value, onChange }: Props) {
  const m = useMessages()

  const insert = (letter: string) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + letter + value.slice(end))
    window.requestAnimationFrame(() => {
      if (!input) return
      input.focus()
      const caret = start + letter.length
      input.setSelectionRange(caret, caret)
    })
  }

  return (
    <fieldset className="umlauts">
      <legend className="sr-only">{m.lesson.insertLetter}</legend>
      {LETTERS.map((letter) => (
        <button
          key={letter}
          type="button"
          lang="de-AT"
          className="umlaut"
          aria-label={m.lesson.insert(letter)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => insert(letter)}
        >
          {letter}
        </button>
      ))}
    </fieldset>
  )
}
