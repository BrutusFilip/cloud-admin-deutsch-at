import { useEffect, useState } from 'react'
import type { ChallengeStepResult } from '../../domain/challenge'
import { elapsedSeconds, type Lesson } from '../../domain/lesson'
import { formatDuration } from '../../domain/challenge'
import type { ChallengeCase } from '../../domain/types'
import { useMessages } from '../../i18n'

/** Five numbered steps; done steps show their first-attempt outcome as text and mark, never by colour alone. */
export function ChallengeTrack({ challenge, steps, current }: { challenge: ChallengeCase; steps: ChallengeStepResult[]; current: number }) {
  const m = useMessages()
  return (
    <ol className="challenge-track" aria-label={m.challenge.track}>
      {challenge.steps.map((step, i) => {
        const result = steps[i]
        const outcome = result && result.outcome !== 'skipped' ? result.outcome : null
        const state = i === current ? 'current' : outcome ?? 'upcoming'
        const label = m.challenge.stepLabel(i + 1, m.stage(step.stageCz), outcome ? m.challenge.outcome[outcome] : i === current ? m.challenge.current : null)
        return (
          <li key={step.item} className={`track-step track-step--${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="track-dot" aria-hidden="true">
              {outcome === 'wrong' ? '✕' : outcome === 'revealed' ? '?' : outcome ? '✓' : i + 1}
            </span>
            <span className="sr-only">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

/** The case in German; Czech only on request. */
export function Situation({ challenge }: { challenge: ChallengeCase }) {
  const m = useMessages()
  return (
    <section className="situation" aria-labelledby="situation-title">
      <h2 className="situation-title" id="situation-title">
        {m.challenge.situation}
      </h2>
      <p className="situation-de" lang="de-AT">
        {challenge.situationDe}
      </p>
      <details className="situation-cz">
        <summary>{m.challenge.showCz}</summary>
        <p lang="cs">{challenge.situationCz}</p>
      </details>
    </section>
  )
}

/** Optional stopwatch. role="timer" is not announced every second; it never limits answering. */
export function Stopwatch({ lesson }: { lesson: Lesson }) {
  const m = useMessages()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <p className="stopwatch">
      <span className="stopwatch-label">{m.challenge.elapsed}</span>{' '}
      <span role="timer" className="stopwatch-value">
        {formatDuration(elapsedSeconds(lesson, new Date(now)))}
      </span>
    </p>
  )
}
