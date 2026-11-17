import { useCallback, useEffect, useRef, useState } from 'react'
import { germanVoices, pickVoice, speechSupported, type VoiceLike } from './speech'

/**
 * React side of reading aloud. Speaking starts only from `speak` (a click);
 * leaving the component (another question, another page) or the page stops it.
 * Browsers differ: voices may load late, `onend` may never fire, speaking may
 * silently fail. The status always says what happened, the text stays readable.
 */

export type SpeechStatus = 'idle' | 'loading' | 'speaking' | 'done' | 'stopped' | 'no-voice' | 'error'

const VOICE_WAIT_MS = 1000
const START_TIMEOUT_MS = 4000
const POLL_MS = 400

function currentVoices(): SpeechSynthesisVoice[] {
  try {
    return window.speechSynthesis.getVoices()
  } catch {
    return []
  }
}

function onVoicesChanged(listener: () => void): () => void {
  const synth = window.speechSynthesis
  if (typeof synth.addEventListener !== 'function') return () => {}
  synth.addEventListener('voiceschanged', listener)
  return () => synth.removeEventListener('voiceschanged', listener)
}

/** Voices can arrive after the page loads (`voiceschanged`); waits about a second at most. */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const now = currentVoices()
  if (now.length > 0) return Promise.resolve(now)
  return new Promise((resolve) => {
    let settled = false
    let unsubscribe = () => {}
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      unsubscribe()
      resolve(currentVoices())
    }
    const timer = window.setTimeout(finish, VOICE_WAIT_MS)
    unsubscribe = onVoicesChanged(finish)
  })
}

/** German voices offered by this browser, Austrian first; `ready` once the list had time to load. */
export function useGermanVoices(): { supported: boolean; voices: SpeechSynthesisVoice[]; ready: boolean } {
  const supported = speechSupported()
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => (supported ? germanVoices(currentVoices()) : []))
  const [waited, setWaited] = useState(false)
  useEffect(() => {
    if (!supported) return
    const update = () => setVoices(germanVoices(currentVoices()))
    const unsubscribe = onVoicesChanged(update)
    const timer = window.setTimeout(() => {
      update()
      setWaited(true)
    }, VOICE_WAIT_MS)
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [supported])
  return { supported, voices, ready: waited || voices.length > 0 }
}

export interface Speech {
  supported: boolean
  status: SpeechStatus
  voice: VoiceLike | null
  speak: (text: string) => void
  stop: () => void
}

export function useSpeech(preferredURI: string | null): Speech {
  const supported = speechSupported()
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [voice, setVoice] = useState<VoiceLike | null>(null)
  /** Each request gets a number; callbacks of older requests are ignored. */
  const run = useRef(0)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const started = useRef(false)
  const requestedAt = useRef(0)

  const cancel = useCallback(() => {
    run.current += 1
    if (utterance.current) {
      utterance.current = null
      try {
        window.speechSynthesis.cancel()
      } catch {
        // Nothing left to stop.
      }
    }
  }, [])

  // Leaving the question (unmount) or the page stops reading.
  useEffect(() => {
    if (!supported) return
    const onPageHide = () => {
      if (!utterance.current) return
      cancel()
      setStatus('stopped')
    }
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      cancel()
    }
  }, [supported, cancel])

  // Some browsers never fire `onend`, or drop an utterance without an error: check the engine state.
  useEffect(() => {
    if (status !== 'speaking') return
    const id = run.current
    const timer = window.setInterval(() => {
      if (id !== run.current || !utterance.current) return
      const synth = window.speechSynthesis
      if (synth.speaking || synth.pending) return
      if (started.current) {
        utterance.current = null
        setStatus('done')
      } else if (Date.now() - requestedAt.current > START_TIMEOUT_MS) {
        cancel()
        setStatus('error')
      }
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [status, cancel])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      cancel()
      const id = run.current
      setStatus('loading')
      void loadVoices().then((voices) => {
        if (id !== run.current) return
        const chosen = pickVoice(voices, preferredURI)
        setVoice(chosen)
        if (!chosen) {
          setStatus('no-voice')
          return
        }
        try {
          const u = new SpeechSynthesisUtterance(text)
          u.voice = chosen
          u.lang = chosen.lang
          u.rate = 0.95
          u.onstart = () => {
            if (id === run.current) started.current = true
          }
          u.onend = () => {
            if (id !== run.current) return
            utterance.current = null
            setStatus('done')
          }
          u.onerror = (event) => {
            if (id !== run.current) return
            utterance.current = null
            setStatus(event.error === 'interrupted' || event.error === 'canceled' ? 'stopped' : 'error')
          }
          utterance.current = u
          started.current = false
          requestedAt.current = Date.now()
          setStatus('speaking')
          window.speechSynthesis.speak(u)
        } catch {
          utterance.current = null
          setStatus('error')
        }
      })
    },
    [supported, cancel, preferredURI],
  )

  const stop = useCallback(() => {
    cancel()
    setStatus('stopped')
  }, [cancel])

  return { supported, status, voice, speak, stop }
}
