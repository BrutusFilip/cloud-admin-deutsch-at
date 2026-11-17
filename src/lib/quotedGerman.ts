/**
 * Czech explanations quote German words and phrases („einrichten“, „Könnten Sie …?“).
 * Marking those quotes as German lets a screen reader pronounce them in German.
 * A quote counts as German only when it clearly is: no Czech letters or Czech
 * words, and either German letters (ä, ö, ü, ß) or only words that the app's
 * German content uses (or that end like German words). Anything unsure stays Czech.
 */

const CZECH_LETTERS = /[ěščřžůďťňáíéýúó]/i
const GERMAN_LETTERS = /[äöüß]/i
const CZECH_WORDS = new Set(['a', 'i', 'k', 'o', 's', 'u', 'v', 'z', 'je', 'se', 'na', 'to', 'jste', 'jsem', 'mohl', 'nejde', 'jejich', 'akuzativ', 'dativ', 'genitiv', 'nominativ'])
const GERMAN_ENDING = /(?:en|ern|eln|ung|heit|keit|lich|isch)$/

export function looksGerman(segment: string, germanWords: ReadonlySet<string>): boolean {
  if (CZECH_LETTERS.test(segment)) return false
  const tokens = (segment.match(/\p{L}+/gu) ?? []).map((t) => t.toLowerCase())
  if (tokens.length === 0 || tokens.some((t) => CZECH_WORDS.has(t))) return false
  if (GERMAN_LETTERS.test(segment)) return true
  return tokens.every((t) => t.length < 2 || germanWords.has(t) || (t.length >= 5 && GERMAN_ENDING.test(t)))
}

export interface TextPart {
  text: string
  german: boolean
}

/** Splits Czech text into plain parts and quoted German parts (the quotation marks stay Czech). */
export function splitQuotedGerman(text: string, germanWords: ReadonlySet<string>): TextPart[] {
  const parts: TextPart[] = []
  const push = (t: string, german: boolean) => {
    if (t === '') return
    const last = parts[parts.length - 1]
    if (last && !last.german && !german) last.text += t
    else parts.push({ text: t, german })
  }
  let rest = text
  const quote = /„([^“„]+)“/
  for (let m = quote.exec(rest); m; m = quote.exec(rest)) {
    const inner = m[1] as string
    push(rest.slice(0, m.index) + '„', false)
    push(inner, looksGerman(inner, germanWords))
    push('“', false)
    rest = rest.slice(m.index + m[0].length)
  }
  push(rest, false)
  return parts
}

/** Lower-case words of German strings found under German keys of any content object. */
export function collectGermanWords(sources: readonly unknown[]): Set<string> {
  const GERMAN_KEYS = new Set(['de', 'text', 'answers', 'options', 'tokens', 'starters', 'plural', 'source', 'accept'])
  const words = new Set<string>()
  const addText = (s: string) => {
    for (const w of s.match(/\p{L}+/gu) ?? []) words.add(w.toLowerCase())
  }
  const walk = (value: unknown, german: boolean): void => {
    if (typeof value === 'string') {
      if (german) addText(value)
    } else if (Array.isArray(value)) {
      for (const v of value) walk(v, german)
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, german || GERMAN_KEYS.has(k))
    }
  }
  walk(sources, false)
  return words
}
