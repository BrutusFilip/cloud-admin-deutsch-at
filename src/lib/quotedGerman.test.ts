import { describe, expect, it } from 'vitest'
import { collectGermanWords, looksGerman, splitQuotedGerman } from './quotedGerman'

const WORDS = collectGermanWords([{ de: 'Ich melde mich bei Ihnen, sobald ich mehr weiß.', cz: 'Ozvu se vám, jakmile budu vědět víc.' }, { accept: [{ text: 'Es geht um das Postfach.' }] }])

describe('quoted German inside Czech explanations', () => {
  it('collects words only from German fields', () => {
    expect(WORDS.has('sobald')).toBe(true)
    expect(WORDS.has('postfach')).toBe(true)
    expect(WORDS.has('ozvu')).toBe(false)
  })

  it('recognises German by its letters, its known words or a German ending', () => {
    expect(looksGerman('Könnten Sie …?', WORDS)).toBe(true)
    expect(looksGerman('sobald', WORDS)).toBe(true)
    expect(looksGerman('einrichten', WORDS)).toBe(true)
    expect(looksGerman('es geht um', WORDS)).toBe(true)
  })

  it('keeps Czech and unsure quotes Czech', () => {
    expect(looksGerman('Znovu', WORDS)).toBe(false)
    expect(looksGerman('VPN nejde.', WORDS)).toBe(false)
    expect(looksGerman('mohl(a) jste', WORDS)).toBe(false)
    expect(looksGerman('její', WORDS)).toBe(false)
    expect(looksGerman('in + akuzativ', WORDS)).toBe(false)
  })

  it('splits the text, the quotation marks stay with the Czech text', () => {
    expect(splitQuotedGerman('Po „ob“ stojí sloveso na konci, viz „sobald“ a „Znovu“.', new Set(['ob', ...WORDS]))).toEqual([
      { text: 'Po „', german: false },
      { text: 'ob', german: true },
      { text: '“ stojí sloveso na konci, viz „', german: false },
      { text: 'sobald', german: true },
      { text: '“ a „Znovu“.', german: false },
    ])
  })
})
