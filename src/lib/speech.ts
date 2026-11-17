/**
 * Reading questions aloud with the Web Speech API (speechSynthesis).
 * Only ever started by a click. Voices come from the browser and the operating
 * system, so their sound, the Austrian variant and offline use differ between
 * browsers; without a German voice the question simply stays as text.
 */

/** The part of a speech voice the app needs (SpeechSynthesisVoice satisfies it). */
export interface VoiceLike {
  voiceURI: string
  name: string
  lang: string
}

function normLang(lang: string): string {
  return lang.replace('_', '-').toLowerCase()
}

export function isGerman(voice: VoiceLike): boolean {
  return normLang(voice.lang).startsWith('de')
}

/** German voices, Austrian first, then German, then other German variants. */
export function germanVoices<T extends VoiceLike>(voices: readonly T[]): T[] {
  const rank = (v: VoiceLike) => {
    const lang = normLang(v.lang)
    if (lang === 'de-at') return 0
    if (lang === 'de-de') return 1
    return 2
  }
  return voices.filter(isGerman).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
}

/** The chosen voice if it is still available, else de-AT, else de-DE, else another German voice; null without one. */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], preferredURI: string | null): T | null {
  const german = germanVoices(voices)
  if (preferredURI) {
    const chosen = german.find((v) => v.voiceURI === preferredURI)
    if (chosen) return chosen
  }
  return german[0] ?? null
}

export function speechSupported(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.speechSynthesis !== 'undefined' &&
      window.speechSynthesis !== null &&
      typeof window.SpeechSynthesisUtterance === 'function'
    )
  } catch {
    return false
  }
}
