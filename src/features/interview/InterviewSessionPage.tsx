import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { INTERVIEW_BY_ID, ITEM_BY_ID } from '../../content'
import {
  CHECK_VALUES,
  currentQuestion,
  EVIDENCE_LEVELS,
  INTERVIEW_PHASES,
  isCheckComplete,
  OWN_EXAMPLE_MAX_LENGTH,
  summarizeSession,
  type CheckValue,
  type Evidence,
  type InterviewPhase,
  type InterviewSession,
} from '../../domain/interview'
import { ANSWER_STEPS, SELF_CHECK_IDS, type Interview, type InterviewQuestion } from '../../domain/types'
import { entryHash, interviewHash, setEntryReturn, INTERVIEW_HASH } from '../../app/router'
import { useMessages } from '../../i18n'
import type { Messages } from '../../i18n/cs'
import { useProgress } from '../../state/progressContext'
import { AnswerTimer } from './AnswerTimer'
import { LevelChip } from '../../components/LevelChip'
import { ReadAloud } from '../../components/ReadAloud'
import { CzechText } from '../../components/CzechText'

/** Follow-ups get a shorter default time than the main question. */
const FOLLOW_UP_SECONDS = 60

/**
 * `#/pohovor/<id>`: the intro (no session for this interview yet), the
 * question flow of the open session, or its summary once it is finished.
 */
export function InterviewSessionPage({ id }: { id: string }) {
  const m = useMessages()
  const { store } = useProgress()
  const interview = INTERVIEW_BY_ID.get(id)
  const session = store.interview.session

  if (!interview) {
    return (
      <div className="page">
        <BackLink />
        <section className="sheet">
          <FocusedTitle>{m.interview.notFound}</FocusedTitle>
        </section>
      </div>
    )
  }

  let body: ReactNode
  if (session?.interviewId === interview.id) {
    const question = currentQuestion(session, interview)
    body = question ? (
      <QuestionFlow interview={interview} session={session} question={question} />
    ) : (
      <InterviewSummary interview={interview} session={session} />
    )
  } else {
    const other = session && session.finishedAt === null ? INTERVIEW_BY_ID.get(session.interviewId) : undefined
    body = <InterviewIntro interview={interview} other={other} />
  }

  return (
    <div className="page">
      <BackLink />
      {body}
    </div>
  )
}

/** The page title, focused when it appears (the interview pages manage focus themselves, see AppShell). */
function FocusedTitle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <h1 id="page-title" ref={ref} tabIndex={-1}>
      {children}
    </h1>
  )
}

function BackLink() {
  const m = useMessages()
  return (
    <p>
      <a className="back" href={INTERVIEW_HASH}>
        {m.interview.back}
      </a>
    </p>
  )
}

function InterviewContext({ interview }: { interview: Interview }) {
  const m = useMessages()
  return (
    <section className="situation" aria-labelledby="interview-context-title">
      <h2 className="situation-title" id="interview-context-title">
        {m.interview.context}
      </h2>
      <p className="situation-de" lang="de-AT">
        {interview.contextDe}
      </p>
      <details className="situation-cz">
        <summary>{m.interview.showCz}</summary>
        <p lang="cs">{interview.contextCz}</p>
      </details>
    </section>
  )
}

function InterviewIntro({ interview, other }: { interview: Interview; other: Interview | undefined }) {
  const m = useMessages()
  const { startInterview } = useProgress()
  return (
    <section className="sheet interview-intro" aria-labelledby="page-title">
      <p className="card-meta">
        {m.interview.title} · {m.interview.questions(interview.questions.length)} <LevelChip level={interview.level} />
      </p>
      <FocusedTitle>{m.title(interview)}</FocusedTitle>
      {m.subtitle(interview) && (
        <p className="case-de" lang="de-AT">
          {m.subtitle(interview)}
        </p>
      )}
      <InterviewContext interview={interview} />
      <ul className="interview-kinds">
        {interview.questions.map((q, i) => (
          <li key={q.id}>
            {m.interview.position(i + 1, interview.questions.length)}: {m.interview.kind[q.kind]}
          </li>
        ))}
      </ul>
      <p className="muted">{m.interview.noMic}</p>
      {other && <p className="muted">{m.interview.replaceNote(m.title(other))}</p>}
      <button type="button" className="btn btn--primary" onClick={() => startInterview(interview.id)}>
        {m.interview.start}
      </button>
    </section>
  )
}

/** Numbered questions; answered ones show ✓ and say so in text, never by colour alone. */
function InterviewTrack({ interview, session }: { interview: Interview; session: InterviewSession }) {
  const m = useMessages()
  return (
    <ol className="challenge-track interview-track" aria-label={m.interview.track}>
      {interview.questions.map((q, i) => {
        const current = i === session.index
        const done = session.results[q.id] !== undefined
        const state = current ? 'current' : done ? 'correct' : 'upcoming'
        const label = m.interview.trackLabel(
          i + 1,
          current ? m.interview.trackState.current : done ? m.interview.trackState.done : m.interview.trackState.open,
        )
        return (
          <li key={q.id} className={`track-step track-step--${state}`} aria-current={current ? 'step' : undefined}>
            <span className="track-dot" aria-hidden="true">
              {done && !current ? '✓' : i + 1}
            </span>
            <span className="sr-only">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function QuestionFlow({ interview, session, question }: { interview: Interview; session: InterviewSession; question: InterviewQuestion }) {
  const m = useMessages()
  const { endInterview } = useProgress()
  const promptRef = useRef<HTMLHeadingElement>(null)
  const tries = session.tries[question.id] ?? 0
  const step = `${session.startedAt}|${session.index}|${session.phase}|${tries}`
  const firstStep = useRef(true)

  // A new question or phase replaces the card: start reading at its prompt.
  useEffect(() => {
    if (!firstStep.current) window.scrollTo(0, 0)
    firstStep.current = false
    promptRef.current?.focus({ preventScroll: true })
  }, [step])

  const followUp = question.followUps[session.followUp] ?? question.followUps[0]
  if (!followUp) return null

  return (
    <section className="lesson interview" aria-labelledby="page-title">
      <header className="lesson-head">
        <div>
          <h1 className="lesson-title" id="page-title" tabIndex={-1}>
            {m.interview.title}
            <span className="lesson-topic">{m.title(interview)}</span>
          </h1>
          <p className="lesson-position">
            {m.interview.position(session.index + 1, interview.questions.length)} · {m.interview.kind[question.kind]}
          </p>
        </div>
        <div className="lesson-head-side">
          <button type="button" className="btn btn--small lesson-exit" onClick={endInterview}>
            {m.interview.end}
          </button>
        </div>
      </header>
      <InterviewTrack interview={interview} session={session} />
      <PhaseSteps phase={session.phase} />
      {session.phase === 'question' && <InterviewContext interview={interview} />}

      {session.phase === 'question' && (
        <article className="sheet card interview-card interview-card--question" aria-labelledby="interview-prompt">
          <p className="card-meta">
            {m.interview.kind[question.kind]} <LevelChip level={interview.level} />
          </p>
          <h2 className="interview-prompt" id="interview-prompt" lang="de-AT" ref={promptRef} tabIndex={-1}>
            {question.de}
          </h2>
          <ReadAloud key={`${step}:q`} text={question.de} />
          <details className="situation-cz">
            <summary>{m.interview.showCz}</summary>
            <p lang="cs">{question.cz}</p>
          </details>
          <QuestionHint question={question} />
          <p className="answer-aloud">{m.interview.answerAloud}</p>
          <AnswerTimer key={`${step}:t`} id={`${question.id}-q`} initialSeconds={question.seconds} />
          <div className="card-actions card-actions--row">
            <ContinueButton label={m.interview.toFollowUp} from="question" />
          </div>
        </article>
      )}

      {session.phase === 'followUp' && (
        <article className="sheet card interview-card interview-card--followup" aria-labelledby="interview-prompt">
          <p className="interview-main">
            <span className="facts-label">{m.interview.mainQuestion}</span>{' '}
            <span lang="de-AT">{question.de}</span>
          </p>
          <p className="card-meta">
            <span className="chip chip--followup">{m.interview.followUpLabel}</span>
          </p>
          <h2 className="interview-prompt" id="interview-prompt" lang="de-AT" ref={promptRef} tabIndex={-1}>
            {followUp.de}
          </h2>
          <ReadAloud key={`${step}:f`} text={followUp.de} />
          <details className="situation-cz">
            <summary>{m.interview.showCz}</summary>
            <p lang="cs">{followUp.cz}</p>
          </details>
          <p className="answer-aloud">{m.interview.answerFollowUp}</p>
          <AnswerTimer key={`${step}:t`} id={`${question.id}-f`} initialSeconds={FOLLOW_UP_SECONDS} />
          <div className="card-actions card-actions--row">
            <ContinueButton label={m.interview.toReview} from="followUp" />
          </div>
        </article>
      )}

      {session.phase === 'review' && (
        <Review
          key={step}
          interview={interview}
          session={session}
          question={question}
          followUpIndex={session.followUp}
          promptRef={promptRef}
        />
      )}
    </section>
  )
}

/** Where the learner is within one question: answer, follow-up, then the review. Marked in text, not only by colour. */
function PhaseSteps({ phase }: { phase: InterviewPhase }) {
  const m = useMessages()
  const current = INTERVIEW_PHASES.indexOf(phase)
  return (
    <ol className="phase-steps" aria-label={m.interview.phasesLabel}>
      {INTERVIEW_PHASES.map((p, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming'
        return (
          <li key={p} className={`phase-step phase-step--${state}`} aria-current={i === current ? 'step' : undefined}>
            <span className="phase-step-n" aria-hidden="true">
              {i < current ? '✓' : i + 1}
            </span>
            <span className="phase-step-label">{m.interview.phase[p]}</span>
            {state === 'done' && <span className="sr-only"> ({m.interview.trackState.done})</span>}
          </li>
        )
      })}
    </ol>
  )
}

/** Moves on from the phase on screen; a repeated click cannot skip the next phase. */
function ContinueButton({ label, from }: { label: string; from: InterviewPhase }) {
  const { advanceInterview } = useProgress()
  return (
    <button type="button" className="btn btn--primary" onClick={() => advanceInterview(from)}>
      {label}
    </button>
  )
}

/** Optional help: the structure to keep, what to think of, how to start and the learner's own example. */
function QuestionHint({ question }: { question: InterviewQuestion }) {
  const m = useMessages()
  const { store, markInterviewHint } = useProgress()
  const own = store.interview.ownExamples[question.id]
  // Opening the hint is noted with the attempt, so the summary can show which answers had help.
  return (
    <details
      className="interview-hint"
      onToggle={(event) => {
        if (event.currentTarget.open) markInterviewHint()
      }}
    >
      <summary>{m.interview.hint}</summary>
      <div className="interview-hint-body">
        <h3>{m.interview.hintStructure}</h3>
        <ol className="structure-steps">
          {ANSWER_STEPS[question.kind].map((step) => (
            <li key={step}>{m.interview.step[step]}</li>
          ))}
        </ol>
        <h3>{m.interview.hintTips}</h3>
        <ul className="hints" lang="cs">
          {question.hintCz.map((hint) => (
            <li key={hint}>
              <CzechText text={hint} />
            </li>
          ))}
        </ul>
        <h3>{m.interview.hintStarters}</h3>
        <ul className="starters" lang="de-AT">
          {question.startersDe.map((starter) => (
            <li key={starter}>{starter}</li>
          ))}
        </ul>
        {own && (
          <>
            <h3>{m.interview.hintOwn}</h3>
            <blockquote className="own-quote" lang="de-AT">
              {own.text}
            </blockquote>
            <p className="muted">{m.interview.evidence[own.evidence]}</p>
          </>
        )}
      </div>
    </details>
  )
}

interface Fact {
  text: string
  n: number
}

/** Marks the facts to replace; the number matches the list "Nahraďte vlastními fakty". */
function withFacts(text: string, facts: readonly Fact[], m: Messages): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  while (rest !== '') {
    let best: { index: number; fact: Fact } | null = null
    for (const fact of facts) {
      const index = rest.indexOf(fact.text)
      if (index >= 0 && (best === null || index < best.index)) best = { index, fact }
    }
    if (best === null) {
      out.push(rest)
      break
    }
    if (best.index > 0) out.push(rest.slice(0, best.index))
    out.push(
      <mark key={`${best.fact.n}-${out.length}`} className="fact">
        <span className="sr-only">{m.interview.replaceMark(best.fact.n)} </span>
        {best.fact.text}
        <sup className="fact-n" aria-hidden="true">
          {best.fact.n}
        </sup>
      </mark>,
    )
    rest = rest.slice(best.index + best.fact.text.length)
  }
  return out
}

interface ReviewProps {
  interview: Interview
  session: InterviewSession
  question: InterviewQuestion
  followUpIndex: number
  promptRef: RefObject<HTMLHeadingElement | null>
}

/** After the follow-up: the illustrative model, facts to replace, dictionary, phrases, own example, self-assessment. */
function Review({ interview, session, question, followUpIndex, promptRef }: ReviewProps) {
  const m = useMessages()
  const followUp = question.followUps[followUpIndex] ?? question.followUps[0]
  const facts = question.replace.map((r, i) => ({ text: r.text, n: i + 1 }))
  const links = question.dictionary.flatMap((id) => {
    const item = ITEM_BY_ID.get(id)
    return item ? [item] : []
  })
  if (!followUp) return null

  return (
    <article className="sheet card interview-card interview-review" aria-labelledby="interview-prompt">
      <h2 className="review-title" id="interview-prompt" ref={promptRef} tabIndex={-1}>
        {m.interview.modelTitle} <span className="chip chip--illustrative">{m.illustrative.label}</span>
      </h2>
      <p className="facts-note facts-note--illustrative">{m.interview.illustrativeNote}</p>
      <p className="review-question" lang="de-AT">
        {question.de}
      </p>
      <ol className="model-parts">
        {question.model.parts.map((part) => (
          <li key={part.step}>
            <span className="model-step">{m.interview.step[part.step]}</span>
            <span className="model-de" lang="de-AT">
              {withFacts(part.de, facts, m)}
            </span>
          </li>
        ))}
      </ol>
      <details className="situation-cz">
        <summary>{m.interview.translation}</summary>
        <p lang="cs">{question.model.cz}</p>
      </details>

      <section className="review-section" aria-labelledby="followup-model-title">
        <h3 id="followup-model-title">{m.interview.followUpModel}</h3>
        <p className="review-question" lang="de-AT">
          {followUp.de}
        </p>
        <p className="model-de model-de--block" lang="de-AT">
          {withFacts(followUp.model.de, facts, m)}
        </p>
        <details className="situation-cz">
          <summary>{m.interview.translation}</summary>
          <p lang="cs">{followUp.model.cz}</p>
        </details>
      </section>

      <section className="review-section" aria-labelledby="replace-title">
        <h3 id="replace-title">{m.interview.replaceTitle}</h3>
        <ol className="replace-list">
          {question.replace.map((r) => (
            <li key={r.text}>
              <span className="replace-text" lang="de-AT">
                {r.text}
              </span>
              <span className="replace-note" lang="cs">
                <CzechText text={r.noteCz} />
              </span>
            </li>
          ))}
        </ol>
        <OwnExampleForm question={question} />
      </section>

      <section className="review-section" aria-labelledby="dictionary-links-title">
        <h3 id="dictionary-links-title">{m.interview.dictionary}</h3>
        <ul className="dictionary-links">
          {links.map((item) => (
            <li key={item.id}>
              <a href={entryHash(item.id)} lang="de-AT" onClick={() => setEntryReturn(interviewHash(interview.id))}>
                {item.de}
              </a>
              <span className="dictionary-link-cz" lang="cs">
                {item.cz}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="review-section" aria-labelledby="phrases-title">
        <h3 id="phrases-title">{m.interview.phrases}</h3>
        <ul className="phrase-list">
          {question.phrases.map((p) => (
            <li key={p.de}>
              <span className="phrase-de" lang="de-AT">
                {p.de}
              </span>
              <span className="phrase-cz" lang="cs">
                {p.cz}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <SelfAssessment interview={interview} session={session} question={question} />
    </article>
  )
}

/** The learner's own verifiable version, kept only in this browser; saved on blur, on "Uložit" and with the evidence. */
function OwnExampleForm({ question }: { question: InterviewQuestion }) {
  const m = useMessages()
  const { store, saveOwnExample } = useProgress()
  const saved = store.interview.ownExamples[question.id]
  const [text, setText] = useState(saved?.text ?? '')
  const [evidence, setEvidence] = useState<Evidence>(saved?.evidence ?? 'unverified')
  const [message, setMessage] = useState('')
  const [initiallyOpen] = useState(saved !== undefined)
  const textId = `own-${question.id}`

  const save = (value: string, level: Evidence) => {
    const empty = value.trim() === ''
    if (empty && !saved) return
    saveOwnExample(question.id, value, level)
    setMessage(empty ? m.interview.ownRemoved : m.interview.ownSaved)
  }

  return (
    <details className="own-example" open={initiallyOpen}>
      <summary>{m.interview.ownTitle}</summary>
      <p className="muted">{m.interview.ownLead}</p>
      <label className="answer-label" htmlFor={textId}>
        {m.interview.ownLabel}
      </label>
      <textarea
        id={textId}
        className="answer-input answer-input--sentence own-text"
        lang="de-AT"
        rows={5}
        maxLength={OWN_EXAMPLE_MAX_LENGTH}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setMessage('')
        }}
        onBlur={() => {
          if (text.trim() !== (saved?.text ?? '')) save(text, evidence)
        }}
      />
      <fieldset className="segmented evidence">
        <legend>{m.interview.evidenceLegend}</legend>
        {EVIDENCE_LEVELS.map((level) => (
          <label key={level} className="segment">
            <input
              type="radio"
              name={`evidence-${question.id}`}
              value={level}
              checked={evidence === level}
              onChange={() => {
                setEvidence(level)
                if (text.trim() !== '') save(text, level)
              }}
            />
            <span>{m.interview.evidence[level]}</span>
          </label>
        ))}
      </fieldset>
      <p className="muted check-hint">{m.interview.evidenceHint}</p>
      <div className="card-actions card-actions--row card-actions--tight">
        <button type="button" className="btn btn--small" onClick={() => save(text, evidence)}>
          {m.interview.ownSave}
        </button>
        <p className="own-status" aria-live="polite">
          {message}
        </p>
      </div>
    </details>
  )
}

function SelfAssessment({ interview, session, question }: { interview: Interview; session: InterviewSession; question: InterviewQuestion }) {
  const m = useMessages()
  const { setInterviewCheck, saveInterviewAttempt, retryInterviewQuestion } = useProgress()
  const [error, setError] = useState(false)
  const complete = isCheckComplete(session.draft)
  const last = session.revisit || session.index >= interview.questions.length - 1

  const save = () => {
    if (!complete) {
      setError(true)
      return
    }
    saveInterviewAttempt()
  }
  const choose = (id: (typeof SELF_CHECK_IDS)[number], value: CheckValue) => {
    setInterviewCheck(id, value)
    setError(false)
  }

  return (
    <section className="review-section self-assessment" aria-labelledby="self-title">
      <h3 id="self-title">{m.interview.selfTitle}</h3>
      <p className="muted">{m.interview.selfLead}</p>
      {SELF_CHECK_IDS.map((id) => (
        <fieldset key={id} className="self-check">
          <legend className="self-check-question">{m.interview.check[id]}</legend>
          <p className="self-check-hint" id={`check-hint-${id}`} lang="cs">
            {question.checks[id]}
          </p>
          <div className="self-check-options">
            {CHECK_VALUES.map((value) => (
              <label key={value} className="segment">
                <input
                  type="radio"
                  name={`check-${id}`}
                  value={value}
                  checked={session.draft[id] === value}
                  onChange={() => choose(id, value)}
                  aria-describedby={`check-hint-${id}`}
                />
                <span>{m.interview.value[value]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      {error && !complete && (
        <p className="form-error" role="alert">
          {m.interview.incomplete}
        </p>
      )}
      <div className="card-actions card-actions--row">
        <button type="button" className="btn btn--primary" onClick={save}>
          {last ? m.interview.saveSummary : m.interview.saveNext}
        </button>
        <button type="button" className="btn" onClick={retryInterviewQuestion} aria-describedby="retry-note">
          {m.interview.retry}
        </button>
      </div>
      <p className="muted retry-note" id="retry-note">
        {m.interview.retryNote(complete, question.followUps.length > 1)}
      </p>
    </section>
  )
}

const CHECK_MARK: Record<CheckValue, string> = { yes: '✓', partly: '~', no: '✕' }

function InterviewSummary({ interview, session }: { interview: Interview; session: InterviewSession }) {
  const m = useMessages()
  const { startInterview, revisitInterviewQuestion } = useProgress()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const summary = summarizeSession(session, interview)
  const early = summary.answered < summary.total

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <section className="sheet summary interview-summary" aria-labelledby="page-title">
      <h1 id="page-title" ref={titleRef} tabIndex={-1}>
        {early ? m.interview.summaryTitleEarly : m.interview.summaryTitle}
      </h1>
      <p className="summary-lead">
        {m.title(interview)}
        {m.subtitle(interview) && (
          <span className="muted" lang="de-AT">
            {' '}
            · {m.subtitle(interview)}
          </span>
        )}
      </p>
      <p className="interview-answered">
        <strong>{m.interview.answered(summary.answered, summary.total)}</strong>
      </p>

      <ol className="interview-results">
        {summary.results.map((r, i) => (
          <li key={r.question.id} className="interview-result">
            <p className="interview-result-q">
              <span className="interview-result-n">{i + 1}.</span>{' '}
              <span lang="de-AT">{r.question.de}</span>
            </p>
            {r.attempt ? (
              <>
                <ul className="check-results">
                  {SELF_CHECK_IDS.map((id) => {
                    const value = r.attempt?.checks[id] ?? 'no'
                    return (
                      <li key={id} className={`check-result check-result--${value}`}>
                        <span className="check-mark" aria-hidden="true">
                          {CHECK_MARK[value]}
                        </span>
                        {m.interview.checkShort[id]}: <strong>{m.interview.value[value]}</strong>
                      </li>
                    )
                  })}
                </ul>
                <p className="muted interview-tries">
                  {m.interview.tries(r.tries)}
                  {r.attempt.hint && ` · ${m.interview.hintUsed}`}
                </p>
              </>
            ) : (
              <p className="muted">{m.interview.notAnswered}</p>
            )}
            <button type="button" className="btn btn--small" onClick={() => revisitInterviewQuestion(i)}>
              {r.attempt ? m.interview.revisit : m.interview.answerNow}
            </button>
          </li>
        ))}
      </ol>

      {summary.answered > 0 && (
        <>
          <h2 className="summary-sub">{m.interview.countsTitle}</h2>
          <div className="table-wrap">
            <table className="check-table">
              <thead>
                <tr>
                  <th scope="col">{m.interview.criterion}</th>
                  {CHECK_VALUES.map((value) => (
                    <th key={value} scope="col">
                      {m.interview.value[value]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SELF_CHECK_IDS.map((id) => (
                  <tr key={id}>
                    <th scope="row">{m.interview.checkShort[id]}</th>
                    {CHECK_VALUES.map((value) => (
                      <td key={value}>{summary.counts[id][value]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className="summary-sub">{m.interview.focusTitle}</h2>
          {summary.focus.length > 0 ? (
            <ul className="focus-list">
              {summary.focus.map((id) => (
                <li key={id}>
                  <strong>{m.interview.checkShort[id]}:</strong> {m.interview.focusTip[id]}
                </li>
              ))}
            </ul>
          ) : (
            <p>{m.interview.allGood}</p>
          )}
        </>
      )}

      <div className="card-actions card-actions--row">
        <button type="button" className="btn btn--primary" onClick={() => startInterview(interview.id)}>
          {m.interview.again}
        </button>
        <a className="btn" href={INTERVIEW_HASH}>
          {m.interview.overview}
        </a>
      </div>
      <p className="muted summary-note">{m.interview.savedNote}</p>
    </section>
  )
}
