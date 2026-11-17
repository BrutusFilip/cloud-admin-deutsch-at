import { Fragment } from 'react'
import { GERMAN_WORDS } from '../content/germanWords'
import { splitQuotedGerman } from '../lib/quotedGerman'

/** Czech study text in which quoted German („einrichten“) is marked as German (lang="de-AT"). */
export function CzechText({ text }: { text: string }) {
  const parts = splitQuotedGerman(text, GERMAN_WORDS)
  if (parts.length === 1 && !parts[0]?.german) return text
  return parts.map((part, i) =>
    part.german ? (
      <span key={i} lang="de-AT">
        {part.text}
      </span>
    ) : (
      <Fragment key={i}>{part.text}</Fragment>
    ),
  )
}
