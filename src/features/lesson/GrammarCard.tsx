import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { ItemFacts } from '../../components/ItemFacts'
import { LevelChip } from '../../components/LevelChip'
import {
  answerFrame,
  evaluateGrammar,
  fillBlank,
  gapRules,
  orderText,
  splitBlank,
  transformRules,
  type GrammarEvaluation,
  type GrammarResponse,
} from '../../domain/grammar'
import { allowedRatings, type AnswerResponse, type Submission, type Verdict } from '../../domain/lesson'
import type { Rating } from '../../domain/scheduler'
import type { Card, ChoiceTask, GrammarItem } from '../../domain/types'
import { useMessages } from '../../i18n'
import { fitStyle } from '../../lib/fitText'
import { keepInView, showResult } from '../../lib/keepInView'
import { CosmeticNotes } from './CosmeticNotes'
import { DiffText } from './DiffText'
import { RatingBar, type RatingOption } from './RatingBar'
import { UmlautBar } from './UmlautBar'
import { CzechText } from '../../components/CzechText'

type Checked = Exclude<GrammarEvaluation, { result: 'empty' }>

type Phase =
  | { kind: 'answering' }
  | { kind: 'checked'; evaluation: Checked }
  | { kind: 'accepted' }
  | { kind: 'revealed' }

interface Props {
  card: Card
  item: GrammarItem
  /** The answer of this turn once handed in (saved), or null while answering. */
  pending: Submission | null
  ratingOptions: RatingOption[]
  requeue: boolean
  onSubmit: (verdict: Verdict, response: AnswerResponse | null) => void
  onAccept: () => void
  onRate: (rating: Rating) => void
}

/** The saved answer as the grammar check expects it. */
function grammarResponse(item: GrammarItem, stored: AnswerResponse | null): GrammarResponse | null {
  const task = item.task
  if (!stored) return null
  if ((task.type === 'gap' || task.type === 'transform') && stored.type === 'text') return { type: task.type, value: stored.value }
  if (task.type === 'choice' && stored.type === 'choice') return { type: 'choice', index: stored.index }
  if (task.type === 'order' && stored.type === 'order') return { type: 'order', picked: stored.picked }
  return null
}

/** The result screen follows from the saved submission, so a reload or a return shows the same result. */
function phaseFrom(item: GrammarItem, pending: Submission | null): Phase {
  if (!pending) return { kind: 'answering' }
  if (pending.verdict === 'unknown') return { kind: 'revealed' }
  if (pending.verdict === 'accepted') return { kind: 'accepted' }
  const response = grammarResponse(item, pending.response)
  const evaluation = response ? evaluateGrammar(item, response) : null
  return evaluation && evaluation.result !== 'empty' ? { kind: 'checked', evaluation } : { kind: 'revealed' }
}

function storedResponse(response: GrammarResponse): AnswerResponse {
  switch (response.type) {
    case 'gap':
    case 'transform':
      return { type: 'text', value: response.value }
    case 'choice':
      return { type: 'choice', index: response.index ?? 0 }
    case 'order':
      return { type: 'order', picked: [...response.picked] }
  }
}

/**
 * Grammar task: fill the gap, choose one option, put words in order or rewrite
 * a sentence. Every result shows why the solution works.
 * Order tasks work with mouse, touch and keyboard: each word is a toggle button.
 */
export function GrammarCard({ card, item, pending, ratingOptions, requeue, onSubmit, onAccept, onRate }: Props) {
  const m = useMessages()
  const task = item.task

  const [value, setValue] = useState('')
  const [choice, setChoice] = useState<number | null>(null)
  const [picked, setPicked] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const phase = phaseFrom(item, pending)
  const verdict = pending?.verdict ?? null

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const firstControlRef = useRef<HTMLInputElement | HTMLButtonElement | null>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const baseId = `task-${card.id.replace(/[^a-z0-9-]/g, '-')}`
  const textId = `${baseId}-text`
  const hintId = `${baseId}-hint`
  const fieldId = `${baseId}-answer`

  useEffect(() => {
    const target = task.type === 'gap' || task.type === 'transform' ? inputRef.current : firstControlRef.current
    target?.focus({ preventScroll: true })
  }, [task.type])

  useEffect(() => {
    if (verdict === 'unknown' || verdict === 'incorrect') primaryRef.current?.focus({ preventScroll: true })
    // The result replaces the task: keep it in view instead of jumping to the buttons below.
    if (verdict) showResult(resultRef.current)
  }, [verdict])

  const response = (): GrammarResponse => {
    switch (task.type) {
      case 'gap':
        return { type: 'gap', value }
      case 'transform':
        return { type: 'transform', value }
      case 'choice':
        return { type: 'choice', index: choice }
      case 'order':
        return { type: 'order', picked }
    }
  }

  const emptyMessage = {
    gap: m.grammar.emptyGap,
    choice: m.grammar.emptyChoice,
    order: m.grammar.emptyOrder,
    transform: m.grammar.emptyTransform,
  }[task.type]

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const evaluation = evaluateGrammar(item, response())
    if (evaluation.result === 'empty') {
      setError(emptyMessage)
      if (task.type === 'gap' || task.type === 'transform') inputRef.current?.focus()
      return
    }
    setError(null)
    const answered = response()
    onSubmit(evaluation.result === 'correct' ? (evaluation.canonical ? 'correct' : 'variant') : 'incorrect', storedResponse(answered))
  }

  const reveal = () => onSubmit('unknown', null)

  const liveText =
    phase.kind === 'answering'
      ? announcement
      : phase.kind === 'checked'
        ? phase.evaluation.result === 'correct'
          ? phase.evaluation.canonical
            ? m.verdict.correct
            : m.verdict.variant
          : `${m.verdict.incorrect}. ${m.feedback.correctForm}: ${item.de}`
        : phase.kind === 'accepted'
          ? m.verdict.accepted
          : `${m.verdict.unknown}: ${item.de}`

  const onTextareaKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  // ---------------------------------------------------------------- order
  const orderSentence = (indices: readonly number[]) =>
    task.type === 'order' ? fillBlank(task.text, orderText(task, indices)) : ''

  const toggleToken = (index: number) => {
    if (task.type !== 'order') return
    setError(null)
    const token = task.tokens[index] ?? ''
    if (picked.includes(index)) {
      setPicked(picked.filter((p) => p !== index))
      setAnnouncement(m.grammar.removed(token))
      return
    }
    const next = [...picked, index]
    setPicked(next)
    setAnnouncement(m.grammar.placed(token, orderSentence(next)))
    if (next.length === task.tokens.length) submitRef.current?.focus()
  }

  const undo = () => {
    const last = picked[picked.length - 1]
    if (last !== undefined) toggleToken(last)
  }

  const clear = () => {
    setPicked([])
    setAnnouncement(m.grammar.cleared)
  }

  // ---------------------------------------------------------------- render
  const [before, after] = answerFrame(task)
  const onFieldFocus = () => keepInView(inputRef.current, actionsRef.current)
  const rulesText = task.type === 'gap' ? m.lesson.rules(gapRules(task)) : task.type === 'transform' ? m.lesson.rules(transformRules(task)) : null

  const taskBody = (): ReactNode => {
    switch (task.type) {
      case 'gap':
        return (
          <>
            <p className="task-text" lang="de-AT" id={textId} style={fitStyle(item.de)}>
              {before}
              <Blank value={value.trim()} />
              {after}
            </p>
            <label className="answer-label" htmlFor={fieldId}>
              {m.grammar.gapLabel}
            </label>
            <input
              id={fieldId}
              ref={(el) => {
                inputRef.current = el
              }}
              className="answer-input answer-input--gap"
              lang="de-AT"
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={onFieldFocus}
              enterKeyHint="done"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={textId}
              aria-invalid={error ? true : undefined}
            />
            <UmlautBar inputRef={inputRef} value={value} onChange={setValue} />
          </>
        )
      case 'transform':
        return (
          <>
            <figure className="task-source">
              <figcaption>{m.grammar.sourceLabel}</figcaption>
              <blockquote lang="de-AT" id={textId}>
                {task.source}
              </blockquote>
            </figure>
            <label className="answer-label" htmlFor={fieldId}>
              {m.grammar.transformLabel}
            </label>
            <textarea
              id={fieldId}
              ref={(el) => {
                inputRef.current = el
              }}
              className="answer-input answer-input--sentence"
              lang="de-AT"
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onTextareaKey}
              onFocus={onFieldFocus}
              enterKeyHint="done"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={textId}
              aria-invalid={error ? true : undefined}
            />
            <UmlautBar inputRef={inputRef} value={value} onChange={setValue} />
          </>
        )
      case 'choice':
        return (
          <>
            {task.text !== undefined && (
              <p className="task-text" lang="de-AT" id={textId} style={fitStyle(item.de)}>
                {splitBlank(task.text)[0]}
                <Blank value={choice !== null ? (task.options[choice] ?? '') : ''} />
                {splitBlank(task.text)[1]}
              </p>
            )}
            <fieldset className="choices" aria-describedby={task.text !== undefined ? textId : undefined}>
              <legend className="sr-only">{m.grammar.choiceLegend}</legend>
              {task.options.map((option, i) => (
                <label key={option} className="choice">
                  <input
                    ref={
                      i === 0
                        ? (el) => {
                            firstControlRef.current = el
                          }
                        : undefined
                    }
                    type="radio"
                    name={`${baseId}-choice`}
                    value={i}
                    checked={choice === i}
                    onChange={() => {
                      setChoice(i)
                      setError(null)
                    }}
                  />
                  <span lang="de-AT">{option}</span>
                </label>
              ))}
            </fieldset>
          </>
        )
      case 'order':
        return (
          <>
            <p className="task-text task-text--order" lang="de-AT" id={textId} style={fitStyle(item.de)}>
              {before}
              {picked.length === 0 ? (
                <Blank value="" />
              ) : (
                <span className="order-built">{orderText(task, picked)}</span>
              )}
              {after}
            </p>
            <p className="answer-task" id={hintId}>
              {m.grammar.orderHint}
            </p>
            <fieldset className="token-bank" aria-describedby={hintId}>
              <legend className="sr-only">{m.grammar.orderBank}</legend>
              {task.tokens.map((token, i) => {
                const position = picked.indexOf(i)
                return (
                  <button
                    key={token}
                    ref={
                      i === 0
                        ? (el) => {
                            firstControlRef.current = el
                          }
                        : undefined
                    }
                    type="button"
                    className="token"
                    lang="de-AT"
                    aria-pressed={position >= 0}
                    onClick={() => toggleToken(i)}
                  >
                    {position >= 0 && (
                      <span className="token-position" aria-hidden="true">
                        {m.grammar.orderPosition(position + 1)}
                      </span>
                    )}
                    {token}
                  </button>
                )
              })}
            </fieldset>
            <div className="card-actions card-actions--row card-actions--tight">
              <button type="button" className="btn btn--small btn--quiet" onClick={undo} disabled={picked.length === 0}>
                {m.grammar.undo}
              </button>
              <button type="button" className="btn btn--small btn--quiet" onClick={clear} disabled={picked.length === 0}>
                {m.grammar.clear}
              </button>
            </div>
          </>
        )
    }
  }

  const allowed = verdict ? allowedRatings(verdict) : []
  const options = ratingOptions.filter((o) => allowed.includes(o.rating))
  const acceptedGiven = pending?.response?.type === 'text' ? pending.response.value : null
  const chosen = pending?.response?.type === 'choice' ? pending.response.index : null

  return (
    <article className="sheet card card--grammar" aria-labelledby={`prompt-${card.id}`}>
      <p className="card-meta">
        {m.exercise.grammar}: {m.focus[item.focus]}, {m.taskType[task.type]} <LevelChip level={item.level} />
      </p>
      <p className="prompt-cz" id={`prompt-${card.id}`} lang="cs">
        <CzechText text={item.promptCz} />
      </p>
      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>

      {phase.kind === 'answering' ? (
        <form className="answer-form" onSubmit={submit} noValidate>
          {taskBody()}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="card-actions card-actions--row answer-actions" ref={actionsRef}>
            <button ref={submitRef} type="submit" className="btn btn--primary">
              {m.lesson.check}
            </button>
            <button type="button" className="btn btn--quiet" onClick={reveal}>
              {m.lesson.dontKnow}
            </button>
          </div>
          {rulesText && (
            <details className="answer-rules">
              <summary>{m.lesson.rulesTitle}</summary>
              <p>{rulesText}</p>
            </details>
          )}
        </form>
      ) : (
        <>
          <div className="result" ref={resultRef}>
            <GrammarResult item={item} phase={phase} given={task.type === 'transform' ? acceptedGiven : null} />
          </div>
          <p className="explanation">
            <span className="facts-label">{m.grammar.why}</span>{' '}
            <span lang="cs">
              <CzechText text={item.explanationCz} />
            </span>
          </p>
          {task.type === 'choice' && (
            <ChoiceReasons task={task} chosen={phase.kind === 'checked' && phase.evaluation.result === 'incorrect' ? chosen : null} />
          )}
          <ItemFacts item={item} />
          {(verdict === 'correct' || verdict === 'variant') && <RatingBar options={options} onRate={onRate} focus="good" />}
          {verdict === 'incorrect' && (
            <div className="card-actions card-actions--row card-actions--sticky">
              <button ref={primaryRef} type="button" className="btn btn--primary" onClick={() => onRate('again')}>
                {requeue ? m.lesson.continueAgain : m.lesson.continue}
              </button>
              {task.type === 'transform' && (
                <button type="button" className="btn btn--quiet" onClick={onAccept}>
                  {m.lesson.acceptMine}
                </button>
              )}
            </div>
          )}
          {verdict === 'accepted' && <RatingBar options={options} onRate={onRate} focus="hard" />}
          {verdict === 'unknown' && (
            <div className="card-actions card-actions--sticky">
              <button ref={primaryRef} type="button" className="btn btn--primary" onClick={() => onRate('again')}>
                {requeue ? m.lesson.continueAgain : m.lesson.continue}
              </button>
            </div>
          )}
        </>
      )}
    </article>
  )
}

/** The answer slot in the sentence; empty it reads as "mezera". */
function Blank({ value }: { value: string }) {
  const m = useMessages()
  return (
    <span className={value ? 'blank blank--filled' : 'blank'}>
      {value || <span className="sr-only">{m.grammar.blank}</span>}
    </span>
  )
}

function GrammarResult({
  item,
  phase,
  given,
}: {
  item: GrammarItem
  phase: Exclude<Phase, { kind: 'answering' }>
  given: string | null
}) {
  const m = useMessages()
  const f = m.feedback
  const [before, after] = answerFrame(item.task)
  // Long compounds in the answers shrink to fit the feedback box instead of breaking inside the word.
  const fit = fitStyle(`${given ?? ''} ${item.de}`)

  if (phase.kind === 'checked' && phase.evaluation.result === 'incorrect') {
    const ev = phase.evaluation
    return (
      <div className="feedback feedback--error">
        <p className="verdict">
          <span className="verdict-mark" aria-hidden="true">
            ✕
          </span>
          {m.verdict.incorrect}
        </p>
        <dl className="answers" style={fit}>
          <dt>{f.yourAnswer}</dt>
          <dd lang="de-AT" className="answer-line">
            {before}
            <DiffText parts={ev.givenParts} side="given" />
            {after}
          </dd>
          <dt>{f.correctForm}</dt>
          <dd lang="de-AT" className="answer-line">
            {before}
            <DiffText parts={ev.expectedParts} side="expected" />
            {after}
          </dd>
        </dl>
        {ev.hints.length > 0 && (
          <ul className="hints">
            {ev.hints.map((h, i) => (
              <li key={i}>{m.hint(h, item)}</li>
            ))}
          </ul>
        )}
        <CosmeticNotes notes={ev.notes} />
        <p className="feedback-cz" lang="cs">
          {item.cz}
        </p>
      </div>
    )
  }

  if (phase.kind === 'checked' && phase.evaluation.result === 'correct') {
    const ev = phase.evaluation
    return (
      <div className="feedback feedback--ok">
        <p className="verdict">
          <span className="verdict-mark" aria-hidden="true">
            ✓
          </span>
          {ev.canonical ? m.verdict.correct : m.verdict.variant}
        </p>
        <dl className="answers" style={fit}>
          <dt>{f.correctForm}</dt>
          <dd lang="de-AT" className="answer-line">
            {ev.canonical ? item.de : `${before}${ev.matched}${after}`}
          </dd>
          {!ev.canonical && (
            <>
              <dt>{f.canonicalNote}</dt>
              <dd lang="de-AT" className="answer-line answer-line--secondary">
                {item.de}
              </dd>
            </>
          )}
        </dl>
        <CosmeticNotes notes={ev.notes} />
        <p className="feedback-cz" lang="cs">
          {item.cz}
        </p>
      </div>
    )
  }

  return (
    <div className={`feedback ${phase.kind === 'accepted' ? 'feedback--ok' : 'feedback--neutral'}`}>
      <p className="verdict">{phase.kind === 'accepted' ? m.verdict.accepted : m.verdict.unknown}</p>
      <dl className="answers" style={fit}>
        {phase.kind === 'accepted' && given !== null && (
          <>
            <dt>{f.yourAnswer}</dt>
            <dd lang="de-AT" className="answer-line">
              {given}
            </dd>
          </>
        )}
        <dt>{f.correctForm}</dt>
        <dd lang="de-AT" className="answer-line">
          {item.de}
        </dd>
      </dl>
      <p className="feedback-cz" lang="cs">
        {item.cz}
      </p>
    </div>
  )
}

/**
 * Why the wrong options do not fit. The option the learner chose comes first
 * and stays open; the others are folded away so the solution stays in focus.
 */
function ChoiceReasons({ task, chosen }: { task: ChoiceTask; chosen: number | null }) {
  const m = useMessages()
  const wrong = task.options.map((option, i) => ({ option, i, why: task.whyCz[i] ?? '' })).filter((o) => o.i !== task.correct && o.why !== '')
  const mine = chosen !== null ? wrong.find((o) => o.i === chosen) : undefined
  const others = wrong.filter((o) => o !== mine)
  return (
    <>
      {mine && (
        <p className="explanation why-not">
          <span className="facts-label">
            {m.grammar.whyNotChosen(mine.option)}
          </span>{' '}
          <span lang="cs">
            <CzechText text={mine.why} />
          </span>
        </p>
      )}
      {others.length > 0 && (
        <details className="why-others">
          <summary>{m.grammar.whyNotOthers}</summary>
          <ul>
            {others.map((o) => (
              <li key={o.i}>
                <span lang="de-AT" className="why-option">
                  {o.option}
                </span>{' '}
                –{' '}
                <span lang="cs">
                  <CzechText text={o.why} />
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
