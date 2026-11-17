import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '../../domain/challenge'
import { useMessages } from '../../i18n'

const LENGTHS = [60, 75, 90] as const
const TICK_MS = 250

/**
 * Optional countdown for an answer spoken aloud. It never blocks: the learner
 * can continue at any time, and time running out only shows a message.
 * Changing the length resets the countdown.
 */
export function AnswerTimer({ id, initialSeconds }: { id: string; initialSeconds: number }) {
  const m = useMessages()
  const [seconds, setSeconds] = useState(initialSeconds)
  /** Time counted before the current run (ms). */
  const [banked, setBanked] = useState(0)
  /** Start of the current run (Date.now()), null when stopped. */
  const [since, setSince] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const toggleRef = useRef<HTMLButtonElement>(null)
  const limit = seconds * 1000

  useEffect(() => {
    if (since === null) return
    const timer = window.setInterval(() => {
      const t = Date.now()
      if (banked + (t - since) >= limit) {
        setBanked(limit)
        setSince(null)
      }
      setNow(t)
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [since, banked, limit])

  const elapsed = Math.min(limit, banked + (since === null ? 0 : Math.max(0, now - since)))
  const remaining = limit - elapsed
  const up = since === null && elapsed >= limit
  const state = since !== null ? 'running' : up ? 'up' : elapsed > 0 ? 'paused' : 'ready'

  const toggle = () => {
    const t = Date.now()
    setNow(t)
    if (state === 'running') {
      setBanked(elapsed)
      setSince(null)
    } else if (state === 'up') {
      setBanked(0)
      setSince(t)
    } else {
      setSince(t)
    }
  }
  const reset = () => {
    setBanked(0)
    setSince(null)
    toggleRef.current?.focus()
  }
  const choose = (value: number) => {
    setSeconds(value)
    setBanked(0)
    setSince(null)
  }

  const toggleLabel =
    state === 'running' ? m.timer.pause : state === 'paused' ? m.timer.resume : state === 'up' ? m.timer.restart : m.timer.start

  return (
    <div className={`timer timer--${state}`}>
      <fieldset className="segmented timer-lengths">
        <legend>{m.timer.legend}</legend>
        {LENGTHS.map((value) => (
          <label key={value} className="segment">
            <input type="radio" name={`${id}-length`} value={value} checked={seconds === value} onChange={() => choose(value)} />
            <span>{m.timer.seconds(value)}</span>
          </label>
        ))}
      </fieldset>
      <div className="timer-row">
        <p className="timer-display">
          <span className="timer-label">{m.timer.remaining}</span>{' '}
          <span role="timer" className="timer-value">
            {formatDuration(Math.ceil(remaining / 1000))}
          </span>
        </p>
        <button ref={toggleRef} type="button" className="btn btn--small" onClick={toggle}>
          {toggleLabel}
        </button>
        {state !== 'ready' && (
          <button type="button" className="btn btn--small btn--quiet" onClick={reset}>
            {m.timer.reset}
          </button>
        )}
      </div>
      <span className="timer-bar" aria-hidden="true">
        <span style={{ width: `${Math.round((elapsed / limit) * 100)}%` }} />
      </span>
      <p className="timer-message" aria-live="polite">
        {up ? m.timer.up : ''}
      </p>
    </div>
  )
}
