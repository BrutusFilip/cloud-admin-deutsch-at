import { useMemo } from 'react'
import { TopicSelect } from '../../components/Selects'
import { isTopicId } from '../../lib/guards'
import { CARDS, TOPICS } from '../../content'
import { composeFree, isResumable, pendingFor, type CardFilter } from '../../domain/lesson'
import { counts, nextDue, todayPlan } from '../../domain/progressViews'
import type { TopicId } from '../../domain/types'
import { navigate, LESSON_HASH } from '../../app/router'
import { formatLongDay, relativeDay } from '../../lib/format'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'
import { ChallengeEntry } from './ChallengeEntry'

export function TodayPage() {
  const m = useMessages()
  const { store, today, startLesson, setTodayTopic } = useProgress()
  const topic: TopicId | 'all' = store.prefs.todayTopic === 'all' || isTopicId(store.prefs.todayTopic) ? store.prefs.todayTopic : 'all'
  const filter: CardFilter = { topic, level: 'all', exercise: 'mixed', focus: 'all' }
  const states = store.cards

  // Counts and the next lesson come from one plan, so the numbers shown and the cards picked always agree.
  const c = todayPlan(CARDS, states, today, filter)
  const planned = c.lesson
  const free = composeFree(CARDS, states, today, filter)
  const next = nextDue(CARDS, states, today, filter)
  const resumable = isResumable(store.lesson, today) ? store.lesson : null

  const perTopic = useMemo(
    () =>
      TOPICS.map((t) => ({
        topic: t,
        counts: counts(CARDS, states, today, { topic: t.id, level: 'all', exercise: 'mixed', focus: 'all' }),
      })),
    [states, today],
  )

  const start = () => {
    startLesson('daily', planned, filter)
    navigate(LESSON_HASH)
  }
  const startFree = () => {
    startLesson('free', free, filter)
    navigate(LESSON_HASH)
  }

  const firstVisit = Object.keys(states).length === 0 && Object.keys(store.interview.attempts).length === 0 && store.lesson === null
  // Writing cards of words unlock after the first flashcard: neither due nor new yet.
  const locked = c.locked
  const dueInLesson = c.lessonDue
  const freshInLesson = c.lessonFresh

  return (
    <div className="page page--today">
      <header className="page-head">
        <h1 id="page-title" tabIndex={-1}>
          {m.today.title}
        </h1>
        <p className="page-date">{formatLongDay(today, m)}</p>
      </header>

      {firstVisit && (
        <section className="sheet welcome" aria-labelledby="welcome-title">
          <h2 id="welcome-title">{m.today.welcomeTitle}</h2>
          <p>{m.today.welcomeText}</p>
          <ul className="welcome-list">
            <li>{m.today.welcomeLesson}</li>
            <li>{m.today.welcomeInterview}</li>
            <li>{m.today.welcomeDictionary}</li>
          </ul>
          <p className="muted">{m.today.welcomeNote}</p>
        </section>
      )}

      <div className="today-layout">
        {resumable && (
          <section className="sheet resume" aria-labelledby="resume-title">
            <h2 id="resume-title">{m.today.resumeTitle}</h2>
            <p>{m.today.resumeText(resumable.log.length, resumable.log.length + resumable.queue.length, pendingFor(resumable) !== null)}</p>
            <div className="meter" aria-hidden="true">
              <span style={{ width: `${Math.round((resumable.log.length / Math.max(resumable.log.length + resumable.queue.length, 1)) * 100)}%` }} />
            </div>
            <div className="card-actions card-actions--row">
              <button type="button" className="btn btn--primary" onClick={() => navigate(LESSON_HASH)}>
                {m.today.resume}
              </button>
              {planned.length > 0 && (
                <button type="button" className="btn" onClick={start} aria-describedby="discard-hint">
                  {m.today.discard}
                </button>
              )}
            </div>
            {planned.length > 0 && (
              <p className="muted" id="discard-hint">
                {m.today.discardHint}
              </p>
            )}
          </section>
        )}

        <section className="sheet today-main plan" aria-labelledby="plan-title">
          <h2 id="plan-title">{m.today.planTitle}</h2>
          <TopicSelect id="today-topic" value={topic} onChange={setTodayTopic} />
          <dl className="counts">
            <div className="counts-due">
              <dt>{m.today.due}</dt>
              <dd>{c.due}</dd>
            </div>
            <div>
              <dt>{m.today.fresh}</dt>
              <dd>{c.fresh}</dd>
            </div>
            <div>
              <dt>{m.today.mastered}</dt>
              <dd>
                {c.mastered}
                <span className="counts-total">/{c.total}</span>
              </dd>
            </div>
          </dl>
          {locked > 0 && <p className="muted today-locked">{m.today.locked(locked)}</p>}

          {planned.length > 0 ? (
            <div className="plan-lesson">
              <p className="today-preview">{m.today.preview(dueInLesson, freshInLesson)}</p>
              {resumable ? (
                <p className="muted">{m.today.planAfterResume}</p>
              ) : (
                <button type="button" className="btn btn--primary btn--wide" onClick={start}>
                  {m.today.start}
                </button>
              )}
            </div>
          ) : (
            <div className="empty">
              <h3>{topic === 'all' ? m.today.emptyAllTitle : m.today.emptyTopicTitle}</h3>
              <p>{next ? m.today.nextDue(relativeDay(next.day, today, m), next.count) : m.today.nothingSeen}</p>
              <div className="card-actions card-actions--row">
                {free.length > 0 && (
                  <button type="button" className="btn btn--primary" onClick={startFree}>
                    {m.today.freePractice}
                  </button>
                )}
                {topic !== 'all' && (
                  <button type="button" className="btn" onClick={() => setTodayTopic('all')}>
                    {m.today.showAll}
                  </button>
                )}
              </div>
              {free.length > 0 && <p className="muted">{m.today.freePracticeHint}</p>}
            </div>
          )}
        </section>

        <div className="today-side">
          <ChallengeEntry replacesLesson={resumable !== null} />
          <details className="how">
            <summary>{m.today.howTitle}</summary>
            <ul>
              {m.today.how.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
          <details className="how">
            <summary>{m.today.rulesTitle}</summary>
            <ul>
              {m.today.rules.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        </div>

        <section className="topics" aria-labelledby="topics-title">
          <h2 id="topics-title">{m.today.topicsTitle}</h2>
          <p className="muted topics-lead">{m.today.topicsLead}</p>
          <ul className="topic-list">
            {perTopic.map(({ topic: t, counts: tc }) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="topic-row"
                  aria-pressed={topic === t.id}
                  onClick={() => setTodayTopic(topic === t.id ? 'all' : t.id)}
                >
                  <span className="topic-name">
                    {m.title(t)}
                    {m.subtitle(t) && (
                      <span className="topic-de" lang="de-AT">
                        {m.subtitle(t)}
                      </span>
                    )}
                  </span>
                  <span className="topic-counts">{m.today.topicRow(tc.due, tc.fresh)}</span>
                  <span className="topic-meter" aria-hidden="true">
                    <span style={{ width: `${tc.total ? Math.round((tc.mastered / tc.total) * 100) : 0}%` }} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
