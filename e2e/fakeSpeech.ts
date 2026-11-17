/** What the fake Web Speech API saw (window.__speech). */
export interface SpeechLog {
  spoken: string[]
  cancels: number
  /** speak() while another utterance was still pending or playing: the browser would queue it. */
  overlaps: number
}

declare global {
  interface Window {
    __speech?: SpeechLog
  }
}

/**
 * A stand-in for speechSynthesis, injected with page.addInitScript: two voices (en-US and de-AT),
 * an utterance starts after 50 ms and plays for a minute unless it is cancelled.
 * Self-contained and written without classes or optional chaining, because Playwright
 * sends the transpiled source text of this function to the page.
 */
export function installFakeSpeech(): void {
  interface Utterance {
    text: string
    onstart: ((e: object) => void) | null
    onend: ((e: object) => void) | null
    onerror: ((e: { error: string }) => void) | null
  }
  const voices = [
    { voiceURI: 'fake-en', name: 'Samantha', lang: 'en-US', localService: true, default: true },
    { voiceURI: 'fake-de-at', name: 'Michael', lang: 'de-AT', localService: true, default: false },
  ]
  const log: SpeechLog = { spoken: [], cancels: 0, overlaps: 0 }
  window.__speech = log
  let current: Utterance | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => voices.slice(),
    speak(u: Utterance) {
      if (current) log.overlaps += 1
      log.spoken.push(u.text)
      current = u
      synth.pending = true
      setTimeout(() => {
        if (current !== u) return
        synth.pending = false
        synth.speaking = true
        if (u.onstart) u.onstart({})
        timer = setTimeout(() => {
          if (current !== u) return
          synth.speaking = false
          current = null
          if (u.onend) u.onend({})
        }, 60_000)
      }, 50)
    },
    cancel() {
      log.cancels += 1
      const u = current
      current = null
      clearTimeout(timer)
      synth.speaking = false
      synth.pending = false
      if (u && u.onerror) {
        const onerror = u.onerror
        setTimeout(() => onerror({ error: 'interrupted' }), 0)
      }
    },
    pause() {},
    resume() {},
    addEventListener() {},
    removeEventListener() {},
  }
  const FakeUtterance = function (this: Record<string, unknown>, text: string) {
    this.text = text
    this.lang = ''
    this.voice = null
    this.rate = 1
    this.onstart = null
    this.onend = null
    this.onerror = null
  }
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true })
  Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: FakeUtterance, configurable: true, writable: true })
}
