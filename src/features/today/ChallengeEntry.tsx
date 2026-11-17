import { LevelChip } from '../../components/LevelChip'
import { useState } from 'react'
import { CHALLENGES, ITEM_BY_ID } from '../../content'
import { challengeCardIds } from '../../domain/challenge'
import { ALL_CARDS } from '../../domain/lesson'
import { navigate, LESSON_HASH } from '../../app/router'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'

/** Optional "Incident za 5 kroků": pick a case, optionally time it, start. */
export function ChallengeEntry({ replacesLesson }: { replacesLesson: boolean }) {
  const m = useMessages()
  const { startLesson } = useProgress()
  const [caseId, setCaseId] = useState(CHALLENGES[0]?.id ?? '')
  const [timed, setTimed] = useState(false)
  const challenge = CHALLENGES.find((c) => c.id === caseId)
  if (!challenge) return null

  const start = () => {
    startLesson('challenge', challengeCardIds(challenge, ITEM_BY_ID), ALL_CARDS, { challengeId: challenge.id, timed })
    navigate(LESSON_HASH)
  }

  return (
    <section className="sheet challenge-entry" aria-labelledby="challenge-title">
      <h2 id="challenge-title">{m.challenge.title}</h2>
      <p>{m.challenge.lead}</p>
      <fieldset className="case-list">
        <legend>{m.challenge.caseLegend}</legend>
        {CHALLENGES.map((c) => (
          <label key={c.id} className="case-option">
            <input type="radio" name="challenge-case" value={c.id} checked={c.id === caseId} onChange={() => setCaseId(c.id)} />
            <span className="case-text">
              <span className="case-title">{m.title(c)}</span>
              {m.subtitle(c) && (
                <span className="case-de" lang="de-AT">
                  {m.subtitle(c)}
                </span>
              )}
            </span>
            <LevelChip level={c.level} />
          </label>
        ))}
      </fieldset>
      <label className="check">
        <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} aria-describedby="challenge-timed-hint" />
        {m.challenge.timed}
      </label>
      <p className="muted check-hint" id="challenge-timed-hint">
        {m.challenge.timedHint}
      </p>
      {replacesLesson && <p className="muted">{m.challenge.replaceNote}</p>}
      <button type="button" className="btn" onClick={start}>
        {m.challenge.start}
      </button>
    </section>
  )
}
