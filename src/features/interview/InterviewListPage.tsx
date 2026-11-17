import { LevelChip } from '../../components/LevelChip'
import { useState } from 'react'
import { INTERVIEW_BY_ID, INTERVIEWS } from '../../content'
import { lastPractised } from '../../domain/interview'
import { localDay } from '../../domain/localDay'
import { interviewHash, navigate } from '../../app/router'
import { formatShortDay } from '../../lib/format'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'

/** `#/pohovor`: choose a scenario and start it, or continue the open one. */
export function InterviewListPage() {
  const m = useMessages()
  const { store, startInterview } = useProgress()
  const session = store.interview.session
  const open = session && session.finishedAt === null ? INTERVIEW_BY_ID.get(session.interviewId) : undefined
  const finished = session && session.finishedAt !== null ? INTERVIEW_BY_ID.get(session.interviewId) : undefined
  const [selected, setSelected] = useState(() => open?.id ?? INTERVIEWS[0]?.id ?? '')
  const interview = INTERVIEW_BY_ID.get(selected)
  const resumesSelected = open !== undefined && open.id === selected

  const start = () => {
    if (!interview) return
    if (!resumesSelected) startInterview(interview.id)
    navigate(interviewHash(interview.id))
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1 id="page-title" tabIndex={-1}>
          {m.interview.title}
        </h1>
      </header>

      {open && session && (
        <section className="sheet resume" aria-labelledby="interview-resume-title">
          <h2 id="interview-resume-title">{m.interview.resumeTitle}</h2>
          <p>{m.interview.resumeText(m.title(open), session.index + 1, open.questions.length)}</p>
          <div className="card-actions card-actions--row">
            <button type="button" className="btn btn--primary" onClick={() => navigate(interviewHash(open.id))}>
              {m.interview.resume}
            </button>
          </div>
        </section>
      )}

      <div className="sheet interview-choice">
        <p className="interview-lead">{m.interview.lead}</p>
        <p className="muted">{m.interview.noMic}</p>
        <fieldset className="case-list">
          <legend>{m.interview.scenarioLegend}</legend>
          {INTERVIEWS.map((i) => {
            const last = lastPractised(store.interview, i)
            return (
              <label key={i.id} className="case-option">
                <input type="radio" name="interview-scenario" value={i.id} checked={i.id === selected} onChange={() => setSelected(i.id)} />
                <span className="case-text">
                  <span className="case-title">{m.title(i)}</span>
                  {m.subtitle(i) && (
                    <span className="case-de" lang="de-AT">
                      {m.subtitle(i)}
                    </span>
                  )}
                  <span className="case-meta">
                    {m.interview.questions(i.questions.length)}
                    {last && ` · ${m.interview.lastPractised(formatShortDay(localDay(new Date(last)), m))}`}
                  </span>
                </span>
                <LevelChip level={i.level} />
              </label>
            )
          })}
        </fieldset>
        {open && !resumesSelected && <p className="muted">{m.interview.replaceNote(m.title(open))}</p>}
        <button type="button" className="btn btn--primary" onClick={start}>
          {resumesSelected ? m.interview.resume : m.interview.start}
        </button>
        {finished && (
          <p className="interview-last">
            <a href={interviewHash(finished.id)}>{m.interview.lastSummary(m.title(finished))}</a>
          </p>
        )}
      </div>

      <details className="how">
        <summary>{m.interview.howTitle}</summary>
        <ul>
          {m.interview.how.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
