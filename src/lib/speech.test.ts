import { describe, expect, it } from 'vitest'
import { germanVoices, pickVoice, type VoiceLike } from './speech'

const v = (name: string, lang: string): VoiceLike => ({ name, lang, voiceURI: `uri-${name}` })

describe('choosing a voice for reading aloud', () => {
  const voices = [v('Samantha', 'en-US'), v('Anna', 'de-DE'), v('Michael', 'de_AT'), v('Lea', 'de-CH')]

  it('prefers Austrian German, then German German, then another German voice', () => {
    expect(pickVoice(voices, null)?.name).toBe('Michael')
    expect(pickVoice([v('Anna', 'de-DE'), v('Lea', 'de-CH')], null)?.name).toBe('Anna')
    expect(pickVoice([v('Lea', 'de-CH')], null)?.name).toBe('Lea')
  })

  it('never reads German with a non-German voice', () => {
    expect(pickVoice([v('Samantha', 'en-US'), v('Zuzana', 'cs-CZ')], null)).toBeNull()
    expect(pickVoice([], null)).toBeNull()
    expect(pickVoice(voices, 'uri-Samantha')?.name).toBe('Michael')
  })

  it('uses the chosen voice while it is available', () => {
    expect(pickVoice(voices, 'uri-Anna')?.name).toBe('Anna')
    expect(pickVoice(voices, 'uri-gone')?.name).toBe('Michael')
  })

  it('lists only German voices, Austrian first', () => {
    expect(germanVoices(voices).map((x) => x.name)).toEqual(['Michael', 'Anna', 'Lea'])
  })
})
