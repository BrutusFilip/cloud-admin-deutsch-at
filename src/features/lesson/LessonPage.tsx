import { useCallback, useEffect, useState } from 'react'
import { CARD_BY_ID, CHALLENGE_BY_ID, ITEM_BY_ID, TOPIC_BY_ID } from '../../content'
import { challengeCardIds, challengeResult } from '../../domain/challenge'
import {
  currentCardId,
  currentTurn,
  pendingFor,
  ratingEffectFor,
  wouldRequeue,
  type AnswerResponse,
  type Verdict,
} from '../../domain/lesson'
import { diffDays } from '../../domain/localDay'
import { applyRating, RATINGS, type Rating } from '../../domain/scheduler'
import { navigate, TODAY_HASH } from '../../app/router'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'
import { ChallengeTrack, Situation, Stopwatch } from './ChallengeParts'
import { Flashcard } from './Flashcard'
import { GrammarCard } from './GrammarCard'
import type { RatingOption } from './RatingBar'
import { Summary } from './Summary'
import { WriteCard } from './WriteCard'

export function LessonPage() {
  const m = useMessages()
  const { store, today, submitAnswer, acceptAnswer, rate, endLesson, writable } = useProgress()
  const lesson = store.lesson

  // A lesson left unfinished on an earlier day is closed when it is opened again.
  // A lesson that is in progress while midnight passes simply continues.
  const [mounted] = useState(() => ({ day: today, lessonId: lesson?.id ?? null }))
  const stale =
    lesson !== null &&
    lesson.finishedAt === null &&
    lesson.id === mounted.lessonId &&
    lesson.startedDay !== mounted.day
  useEffect(() => {
    if (stale && writable) endLesson()
  }, [stale, writable, endLesson])

  useEffect(() => {
    if (!lesson) navigate(TODAY_HASH)
  }, [lesson])

  const id = lesson ? currentCardId(lesson) : null
  // Every action names its card and turn; a repeated click or a stale screen cannot count twice.
  const turn = lesson ? currentTurn(lesson) : 0
  const pending = lesson ? pendingFor(lesson) : null
  const handleSubmit = useCallback(
    (verdict: Verdict, response: AnswerResponse | null) => {
      if (id) submitAnswer(id, turn, verdict, response)
    },
    [id, turn, submitAnswer],
  )
  const handleAccept = useCallback(() => {
    if (id) acceptAnswer(id, turn)
  }, [id, turn, acceptAnswer])
  const handleRate = useCallback(
    (rating: Rating) => {
      if (id) rate(id, turn, rating)
    },
    [id, turn, rate],
  )

  if (!lesson) return null
  if (lesson.finishedAt !== null || id === null || stale) return <Summary lesson={lesson} />

  const card = CARD_BY_ID.get(id)
  if (!card) {
    return (
      <section className="sheet">
        <p>{m.lesson.missingCard}</p>
        <button type="button" className="btn btn--primary" onClick={endLesson}>
          {m.lesson.end}
        </button>
      </section>
    )
  }

  const prev = store.cards[id]
  const effect = ratingEffectFor(lesson, prev, today)
  const requeue = wouldRequeue(lesson)
  const hint = (rating: Rating): string => {
    if (rating === 'again') return requeue ? m.lesson.ratingEffect.inLesson : m.lesson.ratingEffect.tomorrow
    const next = applyRating(prev, rating, today, effect)
    if (prev && effect === 'practice' && next.due === prev.due) return m.lesson.ratingEffect.unchanged
    const d = diffDays(today, next.due)
    return d <= 1 ? m.lesson.ratingEffect.tomorrow : m.lesson.inDays(d)
  }
  const ratingOptions: RatingOption[] = RATINGS.map((r) => ({ rating: r, hint: hint(r) }))

  const done = lesson.log.length
  const total = done + lesson.queue.length
  // The topic of the card on screen (a lesson over all topics mixes them).
  const topic = TOPIC_BY_ID.get(card.item.topic)
  const key = `${lesson.id}#${turn}`

  const challenge = lesson.kind === 'challenge' && lesson.challengeId ? CHALLENGE_BY_ID.get(lesson.challengeId) : undefined
  const stepIndex = challenge ? challengeCardIds(challenge, ITEM_BY_ID).indexOf(id) : -1
  const stageCz = challenge?.steps[stepIndex]?.stageCz
  const stage = stageCz ? m.stage(stageCz) : undefined

  return (
    <section className={challenge ? 'lesson lesson--challenge' : 'lesson'} aria-labelledby="lesson-title">
      <header className="lesson-head">
        <div className="lesson-head-main">
          <h1 className="lesson-title" id="lesson-title">
            {m.lessonKind[lesson.kind]}
            {challenge ? (
              <span className="lesson-topic">{m.title(challenge)}</span>
            ) : (
              topic && (
                <span className="lesson-topic">
                  <span className="sr-only">{m.common.topic}: </span>
                  {m.title(topic)}
                </span>
              )
            )}
          </h1>
          <p className="lesson-position">
            {challenge && stage ? m.challenge.step(stepIndex + 1, challenge.steps.length, stage) : m.lesson.position(done + 1, total)}
          </p>
        </div>
        <div className="lesson-head-side">
          {challenge && lesson.timed && <Stopwatch lesson={lesson} />}
          <button type="button" className="btn btn--small lesson-exit" onClick={endLesson} aria-describedby="lesson-exit-hint">
            {m.lesson.end}
          </button>
          <span className="sr-only" id="lesson-exit-hint">
            {m.lesson.endHint}
          </span>
        </div>
      </header>
      {challenge ? (
        <>
          <ChallengeTrack challenge={challenge} steps={challengeResult(lesson, challenge, ITEM_BY_ID).steps} current={stepIndex} />
          <Situation challenge={challenge} />
        </>
      ) : (
        <progress className="progress" max={Math.max(total, 1)} value={done} aria-label={m.lesson.progressLabel}>
          {m.lesson.progressText(done, total)}
        </progress>
      )}
      {card.item.kind === 'grammar' ? (
        <GrammarCard
          key={key}
          card={card}
          item={card.item}
          pending={pending}
          ratingOptions={ratingOptions}
          requeue={requeue}
          onSubmit={handleSubmit}
          onAccept={handleAccept}
          onRate={handleRate}
        />
      ) : card.exercise === 'flashcard' ? (
        <Flashcard
          key={key}
          card={card}
          pending={pending}
          ratingOptions={ratingOptions}
          mode={lesson.filter.exercise === 'listen' ? 'listen' : 'read'}
          onSubmit={handleSubmit}
          onRate={handleRate}
        />
      ) : (
        <WriteCard
          key={key}
          card={card}
          pending={pending}
          ratingOptions={ratingOptions}
          requeue={requeue}
          onSubmit={handleSubmit}
          onAccept={handleAccept}
          onRate={handleRate}
        />
      )}
    </section>
  )
}
