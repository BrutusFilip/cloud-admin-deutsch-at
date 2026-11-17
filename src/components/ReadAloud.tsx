import { useMessages } from '../i18n'
import { useSpeech } from '../lib/useSpeech'
import { useProgress } from '../state/progressContext'
import { speechStatusText } from './speechStatus'

/**
 * Reading a question aloud (offered while "Nabízet předčítání otázek" is on):
 * starts only on click, stops when the question is left (this component
 * unmounts) or the page is hidden. Without speech support or a German voice
 * the text stays readable and the status says so.
 */
export function ReadAloud({ text }: { text: string }) {
  const m = useMessages()
  const { store } = useProgress()
  const prefs = store.prefs.speech
  const speech = useSpeech(prefs.voiceURI)

  if (!prefs.enabled) return null
  if (!speech.supported) return <p className="speech-status muted">{m.speech.unsupported}</p>

  const active = speech.status === 'loading' || speech.status === 'speaking'
  return (
    <div className="read-aloud">
      <button type="button" className="btn btn--small" onClick={() => (active ? speech.stop() : speech.speak(text))}>
        <span className="read-aloud-icon" aria-hidden="true">
          {active ? '■' : '▶'}
        </span>
        {active ? m.speech.stop : m.speech.read}
      </button>
      <p className="speech-status" aria-live="polite">
        {speechStatusText(speech, m)}
      </p>
    </div>
  )
}
