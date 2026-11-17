import type { Messages } from '../i18n/cs'
import type { Speech } from '../lib/useSpeech'

/** What the read-aloud status line says (announced politely). */
export function speechStatusText(speech: Speech, m: Messages): string {
  switch (speech.status) {
    case 'idle':
      return ''
    case 'loading':
      return m.speech.loading
    case 'speaking':
      return speech.voice ? m.speech.speaking(`${speech.voice.name} (${speech.voice.lang})`) : ''
    case 'done':
      return m.speech.done
    case 'stopped':
      return m.speech.stopped
    case 'no-voice':
      return m.speech.noVoice
    case 'error':
      return m.speech.error
  }
}
