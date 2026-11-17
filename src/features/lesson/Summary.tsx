import { useEffect, useRef } from 'react'
import { CARD_BY_ID, CHALLENGE_BY_ID, ITEM_BY_ID } from '../../content'
import { challengeCardIds, challengeResult, formatDuration } from '../../domain/challenge'
import { ALL_CARDS, elapsedSeconds, summarize, type CheckedCounts, type Lesson } from '../../domain/lesson'
import { RATINGS } from '../../domain/scheduler'
import type { ChallengeCase } from '../../domain/types'
import { navigate, LESSON_HASH, TODAY_HASH } from '../../app/router'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'

export function Summary({ lesson }: { lesson: Lesson }) {
  const challenge = lesson.kind === 'challenge' && lesson.challengeId ? CHALLENGE_BY_ID.get(lesson.challengeId) : undefined
  return challenge ? <ChallengeSummary lesson={lesson} challenge={challenge} /> : <LessonSummary lesson={lesson} />
}

function useTitleFocus() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [])
  return titleRef
}

function LessonSummary({ lesson }: { lesson: Lesson }) {
  const m = useMessages()
  const { startLesson } = useProgress()
  const s = summarize(lesson)
  const titleRef = useTitleFocus()
  const mistakes = s.mistakes.map((id) => CARD_BY_ID.get(id)).filter((c) => c !== undefined)
  const fromDictionary = lesson.origin?.startsWith('#/slovnik') ?? false
  const checkedKeys: (keyof CheckedCounts)[] = ['correct', 'variant', 'accepted', 'incorrect', 'revealed']
  const checkedTotal = checkedKeys.reduce((n, k) => n + s.checked[k], 0)
  const selfTotal = s.self.again + s.self.hard + s.self.good
  // Why a card is among the mistakes: the app found it wrong, the solution was revealed, or your own rating.
  const why = (cardId: string): string => {
    const entry = lesson.log.find((e) => e.cardId === cardId && (e.rating === 'again' || e.rating === 'hard'))
    if (!entry) return ''
    if (entry.verdict === 'incorrect') return m.summary.why.incorrect
    if (entry.verdict === 'unknown') return m.summary.why.unknown
    return entry.rating === 'hard' ? m.summary.why.hard : m.summary.why.again
  }

  const repeat = () => {
    startLesson(
      'mistakes',
      mistakes.map((c) => c.id),
      lesson.filter,
      { origin: lesson.origin },
    )
    navigate(LESSON_HASH)
  }

  // The finished lesson stays stored until the next one starts, so leaving never races with a redirect.
  const done = () => navigate(lesson.origin ?? TODAY_HASH)

  if (s.rated === 0) {
    return (
      <section className="sheet summary" aria-labelledby="page-title">
        <h1 id="page-title" ref={titleRef} tabIndex={-1}>
          {m.summary.titleEarly}
        </h1>
        <p className="summary-lead">{m.summary.nothingRated}</p>
        <div className="card-actions card-actions--row">
          <button type="button" className="btn btn--primary" onClick={done}>
            {fromDictionary ? m.summary.backToDictionary : m.summary.done}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="sheet summary" aria-labelledby="page-title">
      <h1 id="page-title" ref={titleRef} tabIndex={-1}>
        {s.completed ? m.summary.title : m.summary.titleEarly}
      </h1>
      <p className="summary-lead">
        {m.summary.rated(s.rated)} {s.repeats > 0 && m.summary.repeats(s.repeats)}
      </p>
      {s.skipped > 0 && <p className="muted">{m.summary.skipped(s.skipped)}</p>}
      {!s.completed && s.skipped === 0 && <p className="muted">{m.summary.requeued}</p>}

      {checkedTotal > 0 && (
        <section className="summary-part" aria-labelledby="summary-checked">
          <h2 className="summary-sub" id="summary-checked">
            {m.summary.checkedTitle}
          </h2>
          <p className="muted">{m.summary.checkedLead}</p>
          <p className="summary-score">
            <strong>{m.summary.checkedResult(s.checked.correct + s.checked.variant, checkedTotal)}</strong>
          </p>
          <ul className="summary-breakdown">
            {checkedKeys
              .filter((k) => s.checked[k] > 0)
              .map((k) => (
                <li key={k} className={`breakdown breakdown--${k}`}>
                  {m.summary.checked[k]}: <strong>{s.checked[k]}</strong>
                </li>
              ))}
          </ul>
        </section>
      )}

      {selfTotal > 0 && (
        <section className="summary-part" aria-labelledby="summary-self">
          <h2 className="summary-sub" id="summary-self">
            {m.summary.selfTitle}
          </h2>
          <p className="muted">{m.summary.selfLead}</p>
          <dl className="summary-stats">
            {[...RATINGS].reverse().map((r) => (
              <div key={r} className={s.self[r] === 0 ? `stat stat--${r} stat--zero` : `stat stat--${r}`}>
                <dt>{m.rating[r]}</dt>
                <dd>{s.self[r]}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <h2 className="summary-sub">{m.summary.mistakesTitle}</h2>
      {mistakes.length > 0 ? (
        <ul className="mistakes">
          {mistakes.map((c) => (
            <li key={c.id}>
              <span className="mistake-de" lang="de-AT">
                {c.item.de}
              </span>
              <span className="mistake-cz" lang="cs">
                {c.item.cz}
              </span>
              <span className="mistake-kind">
                {m.exercise[c.exercise === 'flashcard' && lesson.filter.exercise === 'listen' ? 'listen' : c.exercise]} · {why(c.id)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>{m.summary.noMistakes}</p>
      )}

      <div className="card-actions card-actions--row">
        {mistakes.length > 0 && (
          <button type="button" className="btn btn--primary" onClick={repeat}>
            {m.summary.repeatMistakes(mistakes.length)}
          </button>
        )}
        <button type="button" className={mistakes.length > 0 ? 'btn' : 'btn btn--primary'} onClick={done}>
          {fromDictionary ? m.summary.backToDictionary : m.summary.done}
        </button>
      </div>
      <p className="muted summary-note">
        {m.summary.saved} {mistakes.length > 0 && m.summary.repeatHint}
      </p>
    </section>
  )
}

/** "Incident za 5 kroků": first-attempt accuracy per step, mistakes to repeat, optional time. */
function ChallengeSummary({ lesson, challenge }: { lesson: Lesson; challenge: ChallengeCase }) {
  const m = useMessages()
  const { startLesson } = useProgress()
  const titleRef = useTitleFocus()
  const result = challengeResult(lesson, challenge, ITEM_BY_ID)
  const early = result.steps.some((s) => s.outcome === 'skipped')

  const repeat = () => {
    startLesson('mistakes', result.mistakes, ALL_CARDS)
    navigate(LESSON_HASH)
  }
  const retry = () => {
    startLesson('challenge', challengeCardIds(challenge, ITEM_BY_ID), ALL_CARDS, {
      challengeId: challenge.id,
      timed: lesson.timed,
    })
    navigate(LESSON_HASH)
  }

  return (
    <section className="sheet summary summary--challenge" aria-labelledby="page-title">
      <h1 id="page-title" ref={titleRef} tabIndex={-1}>
        {early ? m.challenge.resultTitleEarly : m.challenge.resultTitle}
      </h1>
      <p className="summary-lead">
        {m.title(challenge)}
        {m.subtitle(challenge) && (
          <span className="muted" lang="de-AT">
            {' '}
            · {m.subtitle(challenge)}
          </span>
        )}
      </p>
      <p className="challenge-score">
        <strong>{m.challenge.accuracy(result.correct, result.total)}</strong> <span className="challenge-percent">({result.percent} %)</span>
      </p>
      {(result.accepted > 0 || result.revealed > 0) && (
        <ul className="summary-breakdown">
          {result.accepted > 0 && <li>{m.challenge.acceptedCount(result.accepted)}</li>}
          {result.revealed > 0 && <li>{m.challenge.revealedCount(result.revealed)}</li>}
        </ul>
      )}
      <p className="muted">{m.challenge.accuracyNote}</p>
      {lesson.timed && lesson.finishedAt && (
        <p className="muted">{m.challenge.time(formatDuration(elapsedSeconds(lesson, new Date(lesson.finishedAt))))}</p>
      )}

      <ol className="challenge-steps">
        {result.steps.map((step) => {
          const item = CARD_BY_ID.get(step.cardId)?.item
          return (
            <li key={step.cardId} className={`challenge-step challenge-step--${step.outcome}`}>
              <span className="challenge-step-head">
                <span className="challenge-step-mark" aria-hidden="true">
                  {step.outcome === 'wrong' ? '✕' : step.outcome === 'revealed' ? '?' : step.outcome === 'skipped' ? '–' : '✓'}
                </span>
                <span className="challenge-step-stage">{m.stage(step.stageCz)}</span>
                <span className="challenge-step-outcome">{m.challenge.outcome[step.outcome]}</span>
              </span>
              {item && (
                <span className="challenge-step-de" lang="de-AT">
                  {item.de}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {result.mistakes.length === 0 && !early && <p>{m.challenge.noMistakes}</p>}

      <div className="card-actions card-actions--row">
        {result.mistakes.length > 0 && (
          <button type="button" className="btn btn--primary" onClick={repeat}>
            {m.challenge.repeatMistakes(result.mistakes.length)}
          </button>
        )}
        <button type="button" className={result.mistakes.length > 0 ? 'btn' : 'btn btn--primary'} onClick={retry}>
          {m.challenge.retry}
        </button>
        <button type="button" className="btn btn--quiet" onClick={() => navigate(TODAY_HASH)}>
          {m.summary.done}
        </button>
      </div>
      <p className="muted summary-note">{m.challenge.saved}</p>
    </section>
  )
}
