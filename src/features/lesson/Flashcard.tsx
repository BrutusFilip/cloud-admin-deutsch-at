import { useEffect, useRef, useState } from 'react'
import { ItemFacts } from '../../components/ItemFacts'
import { LevelChip } from '../../components/LevelChip'
import { speechStatusText } from '../../components/speechStatus'
import { allowedRatings, type AnswerResponse, type Submission, type Verdict } from '../../domain/lesson'
import type { Rating } from '../../domain/scheduler'
import type { Card } from '../../domain/types'
import { useMessages } from '../../i18n'
import { fitStyle } from '../../lib/fitText'
import { showResult } from '../../lib/keepInView'
import { useGermanVoices, useSpeech } from '../../lib/useSpeech'
import { useProgress } from '../../state/progressContext'
import { RatingBar, type RatingOption } from './RatingBar'

/** read = the German is on screen · listen = the German is played and shown only with the solution */
export type FlashcardMode = 'read' | 'listen'

/** Why listening fell back to the text. */
type Fallback = 'unsupported' | 'no-voice' | 'error'

interface Props {
  card: Card
  /** The revealed card of this turn (saved), or null before revealing. */
  pending: Submission | null
  ratingOptions: RatingOption[]
  mode?: FlashcardMode
  onSubmit: (verdict: Verdict, response: AnswerResponse | null) => void
  onRate: (rating: Rating) => void
}

/**
 * DE → CZ: read (or hear) the German, recall the meaning, reveal, rate yourself.
 * Revealing is saved like an answer. Listening plays only on click and stops
 * when the card is left. Without speech support or a German voice, or when
 * playing fails, the card shows the German text and says why.
 */
export function Flashcard({ card, pending, ratingOptions, mode = 'read', onSubmit, onRate }: Props) {
  const m = useMessages()
  const { store } = useProgress()
  const item = card.item
  const revealed = pending !== null
  const listening = mode === 'listen'
  const voices = useGermanVoices()
  const speech = useSpeech(store.prefs.speech.voiceURI)
  const revealRef = useRef<HTMLButtonElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const answerRef = useRef<HTMLParagraphElement>(null)

  // Once the card fell back to the text it stays so: late voices must not hide the text again.
  const [fallback, setFallback] = useState<Fallback | null>(null)
  const reasonNow: Fallback | null = !listening
    ? null
    : !voices.supported
      ? 'unsupported'
      : speech.status === 'error'
        ? 'error'
        : speech.status === 'no-voice' || (voices.ready && voices.voices.length === 0)
          ? 'no-voice'
          : null
  if (reasonNow !== null && fallback === null) setFallback(reasonNow)
  const reason = fallback ?? reasonNow
  const canPlay = listening && reason === null
  const hideGerman = canPlay && !revealed
  const promptId = `prompt-${card.id}`

  useEffect(() => {
    ;(hideGerman ? playRef.current : revealRef.current)?.focus({ preventScroll: true })
    // Only when the card appears: the focus must not jump while the learner works.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The meaning appears where the reveal button was: on a low phone screen that is under the sticky rating.
  useEffect(() => {
    if (revealed) showResult(answerRef.current)
  }, [revealed])

  // The play button disappeared (no voice after all): keep the keyboard on the card.
  useEffect(() => {
    if (reason === null || revealed) return
    const active = document.activeElement
    if (active === null || active === document.body) revealRef.current?.focus({ preventScroll: true })
  }, [reason, revealed])

  // Space or Enter reveals even when the focus is not on a control.
  useEffect(() => {
    if (revealed) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      // An open dialog (e.g. a storage confirmation) owns the keyboard.
      if (document.querySelector('dialog[open]')) return
      const onControl = target && ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'].includes(target.tagName)
      if (!onControl && !event.repeat && (event.key === ' ' || event.key === 'Enter')) {
        event.preventDefault()
        onSubmit('self', null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [revealed, onSubmit])

  const options = ratingOptions.filter((o) => allowedRatings('self').includes(o.rating))
  const playing = speech.status === 'loading' || speech.status === 'speaking'
  const played = speech.status === 'done' || speech.status === 'stopped'

  const player = (
    <div className="listen-player">
      <button
        ref={playRef}
        type="button"
        className="btn listen-play"
        onClick={() => (playing ? speech.stop() : speech.speak(item.de))}
      >
        <span className="read-aloud-icon" aria-hidden="true">
          {playing ? '■' : '▶'}
        </span>
        {playing ? m.listen.stop : played ? m.listen.again : m.listen.play}
      </button>
      <p className="speech-status" aria-live="polite">
        {speechStatusText(speech, m)}
      </p>
    </div>
  )

  return (
    <article className={listening ? 'sheet card card--listen' : 'sheet card'} aria-labelledby={promptId}>
      <p className="card-meta">
        {listening ? m.exercise.listen : m.exercise.flashcard}, {m.kind(item)} <LevelChip level={item.level} />
      </p>
      {hideGerman ? (
        <div className="listen">
          <p className="listen-prompt" id={promptId}>
            {m.listen.prompt}
          </p>
          {player}
        </div>
      ) : (
        <p className="prompt-de" lang="de-AT" id={promptId} style={fitStyle(item.de)}>
          {item.de}
        </p>
      )}
      {listening && (
        // Always present while listening, so a later fallback (no voice after all) is announced.
        <p className="explanation listen-fallback" aria-live="polite">
          {reason !== null ? m.listen.fallback[reason] : ''}
        </p>
      )}
      {!revealed ? (
        <div className="card-actions">
          <p className="card-question">{m.lesson.flashcardQuestion}</p>
          <button ref={revealRef} type="button" className="btn btn--primary" onClick={() => onSubmit('self', null)}>
            {m.lesson.reveal}
            <kbd className="btn-key" aria-hidden="true">
              {m.lesson.revealKey}
            </kbd>
          </button>
        </div>
      ) : (
        <>
          {canPlay && player}
          <div className="reveal">
            <p className="answer-cz" lang="cs" id={`answer-${card.id}`} ref={answerRef}>
              {item.cz}
            </p>
            <ItemFacts item={item} />
          </div>
          <RatingBar options={options} onRate={onRate} focus="group" describedBy={`answer-${card.id}`} />
        </>
      )}
    </article>
  )
}
