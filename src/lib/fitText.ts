import type { CSSProperties } from 'react'

/**
 * Length of the longest run the browser may not break: a word, or the part of a
 * hyphenated compound up to and including its hyphen. Punctuation does not count.
 */
export function longestRun(text: string): number {
  let longest = 0
  for (const word of text.split(/\s+/)) {
    for (const part of word.split(/(?<=-)/)) {
      const n = part.replace(/[.,;:!?…„“”"'()«»/]/g, '').length
      if (n > longest) longest = n
    }
  }
  return longest
}

/**
 * Large German prompts are never hyphenated by the browser: the learner sees the
 * exact spelling. Instead the longest word sets an upper limit for the font size,
 * so that it fits on one line of the card (`.prompt-de` in app.css, using container
 * units). Short words keep the full size.
 */
export function fitStyle(text: string): CSSProperties {
  return { '--longest': Math.max(longestRun(text), 1) } as CSSProperties
}
