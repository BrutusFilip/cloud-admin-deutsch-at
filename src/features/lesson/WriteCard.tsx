import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ItemFacts } from '../../components/ItemFacts'
import { LevelChip } from '../../components/LevelChip'
import type { Evaluation } from '../../domain/answerCheck'
import {
  acceptedVariantsOf,
  answerRulesOf,
  evaluateItemAnswer,
  evaluateWritten,
  writePromptOf,
  writeSpecOf,
  type WrittenEvaluation,
} from '../../domain/cards'
import { allowedRatings, type AnswerResponse, type Submission, type Verdict } from '../../domain/lesson'
import type { Rating } from '../../domain/scheduler'
import type { Card, StudyItem } from '../../domain/types'
import { useMessages } from '../../i18n'
import { fitStyle } from '../../lib/fitText'
import { keepInView, showResult } from '../../lib/keepInView'
import { CosmeticNotes } from './CosmeticNotes'
import { DiffText } from './DiffText'
import { RatingBar, type RatingOption } from './RatingBar'
import { UmlautBar } from './UmlautBar'
import { CzechText } from '../../components/CzechText'

type Phase =
  | { kind: 'answering' }
  | { kind: 'checked'; evaluation: Exclude<Evaluation, { result: 'empty' }> }
  | { kind: 'accepted' }
  | { kind: 'revealed' }
  | { kind: 'compared'; evaluation: Exclude<WrittenEvaluation, { result: 'empty' }> }

interface Props {
  card: Card
  /** The answer of this turn once handed in (saved), or null while answering. */
  pending: Submission | null
  ratingOptions: RatingOption[]
  requeue: boolean
  onSubmit: (verdict: Verdict, response: AnswerResponse | null) => void
  onAccept: () => void
  onRate: (rating: Rating) => void
}

/**
 * The result screen follows from the saved submission, so a reload or a return
 * shows the same result. The saved verdict decides the screen: an answer saved
 * as a mistake stays a mistake even if the item became a free translation later.
 */
function phaseFrom(item: StudyItem, pending: Submission | null): Phase {
  if (!pending) return { kind: 'answering' }
  const given = pending.response?.type === 'text' ? pending.response.value : ''
  switch (pending.verdict) {
    case 'unknown':
      return { kind: 'revealed' }
    case 'accepted':
      return { kind: 'accepted' }
    case 'compared': {
      const evaluation = evaluateWritten(item, given)
      return evaluation.result === 'empty' ? { kind: 'revealed' } : { kind: 'compared', evaluation }
    }
    default: {
      const evaluation = evaluateItemAnswer(item, given)
      return evaluation.result === 'empty' ? { kind: 'revealed' } : { kind: 'checked', evaluation }
    }
  }
}

/**
 * CZ → DE: write the German form, get feedback, then rate.
 * A word or a phrase has one clear answer and is checked. A sentence is a free
 * translation: a match with the model or a listed formulation is correct, a
 * spelling slip (umlaut, ß, capital letter) is a mistake, and any other
 * difference is compared with the model and rated by the learner.
 */
export function WriteCard({ card, pending, ratingOptions, requeue, onSubmit, onAccept, onRate }: Props) {
  const m = useMessages()
  const item = card.item
  const spec = writeSpecOf(item) ?? { mode: 'auto' as const }
  const rules = answerRulesOf(item)
  const multiline = item.kind === 'sentence'

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const phase = phaseFrom(item, pending)
  const given = pending?.response?.type === 'text' ? pending.response.value : value
  const verdict = pending?.verdict ?? null

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (verdict === 'unknown' || verdict === 'incorrect') primaryRef.current?.focus({ preventScroll: true })
    // The verdict replaces the form: keep it in view instead of jumping to the buttons below.
    if (verdict) showResult(resultRef.current)
  }, [verdict])

  const announcement =
    phase.kind === 'answering'
      ? ''
      : phase.kind === 'checked'
        ? phase.evaluation.result === 'correct'
          ? phase.evaluation.variant
            ? m.verdict.variant
            : m.verdict.correct
          : `${m.verdict.incorrect}. ${m.feedback.correctForm}: ${phase.evaluation.expected}`
        : phase.kind === 'compared'
          ? `${m.verdict.compared}. ${m.feedback.compareYourself}`
          : phase.kind === 'accepted'
            ? m.verdict.accepted
            : m.verdict.unknown

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    const evaluation = evaluateWritten(item, value)
    if (evaluation.result === 'empty') {
      setError(m.lesson.emptyAnswer)
      inputRef.current?.focus()
      return
    }
    setError(null)
    const response: AnswerResponse = { type: 'text', value }
    switch (evaluation.result) {
      case 'correct':
        onSubmit(evaluation.variant ? 'variant' : 'correct', response)
        return
      case 'incorrect':
        onSubmit('incorrect', response)
        return
      case 'compare':
        onSubmit('compared', response)
    }
  }

  const onTextareaKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const reveal = () => onSubmit('unknown', null)

  const allowed = verdict ? allowedRatings(verdict) : []
  const options = ratingOptions.filter((o) => allowed.includes(o.rating))
  const fieldId = `answer-${card.id}`
  const hintId = `${fieldId}-hint`
  const onFieldFocus = () => keepInView(inputRef.current, actionsRef.current)

  return (
    <article className="sheet card" aria-labelledby={`prompt-${card.id}`}>
      <p className="card-meta">
        {m.exercise.write}, {m.kind(item)} <LevelChip level={item.level} />
      </p>
      <p className="prompt-cz" id={`prompt-${card.id}`} lang="cs">
        {writePromptOf(item)}
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {phase.kind === 'answering' ? (
        <form className="answer-form" onSubmit={submit} noValidate>
          <label className="answer-label" htmlFor={fieldId}>
            {m.lesson.writeLabel}
          </label>
          <p className="answer-task" id={hintId}>
            {m.lesson.writeHint(item)}
          </p>
          {multiline ? (
            <textarea
              id={fieldId}
              ref={(el) => {
                inputRef.current = el
              }}
              className="answer-input answer-input--sentence"
              lang="de-AT"
              rows={2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onTextareaKey}
              onFocus={onFieldFocus}
              enterKeyHint="done"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={hintId}
              aria-invalid={error ? true : undefined}
            />
          ) : (
            <input
              id={fieldId}
              ref={(el) => {
                inputRef.current = el
              }}
              className="answer-input"
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
              aria-describedby={hintId}
              aria-invalid={error ? true : undefined}
            />
          )}
          <UmlautBar inputRef={inputRef} value={value} onChange={setValue} />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="card-actions card-actions--row answer-actions" ref={actionsRef}>
            <button type="submit" className="btn btn--primary">
              {m.lesson.check}
            </button>
            <button type="button" className="btn btn--quiet" onClick={reveal}>
              {m.lesson.dontKnow}
            </button>
          </div>
          <details className="answer-rules">
            <summary>{m.lesson.rulesTitle}</summary>
            <p>
              {spec.mode === 'compare' && `${m.lesson.compareRule} `}
              {m.lesson.rules(rules)}
            </p>
          </details>
        </form>
      ) : (
        <>
          <div className="result" ref={resultRef}>
            <Result phase={phase} value={given} card={card} />
          </div>
          <ItemFacts item={item} />
          {(verdict === 'correct' || verdict === 'variant') && <RatingBar options={options} onRate={onRate} focus="good" />}
          {verdict === 'incorrect' && (
            <div className="card-actions card-actions--row card-actions--sticky">
              <button ref={primaryRef} type="button" className="btn btn--primary" onClick={() => onRate('again')}>
                {requeue ? m.lesson.continueAgain : m.lesson.continue}
              </button>
              <button type="button" className="btn btn--quiet" onClick={onAccept}>
                {m.lesson.acceptMine}
              </button>
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
          {verdict === 'compared' && <RatingBar options={options} onRate={onRate} focus="group" />}
        </>
      )}
    </article>
  )
}

/** Other accepted formulations: the model first, then the listed variants, without the one already shown. */
function otherForms(item: StudyItem, shown: string): string[] {
  return [item.de, ...acceptedVariantsOf(item).map((v) => v.text)].filter((t) => t !== shown)
}

function Result({ phase, value, card }: { phase: Exclude<Phase, { kind: 'answering' }>; value: string; card: Card }) {
  const m = useMessages()
  const item = card.item
  const f = m.feedback
  const variants = acceptedVariantsOf(item)
  // Long compounds in the answers shrink to fit the feedback box instead of breaking inside the word.
  const fit = fitStyle([value, item.de, ...variants.map((v) => v.text)].join(' '))

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
            <DiffText parts={ev.givenParts} side="given" />
          </dd>
          <dt>{f.correctForm}</dt>
          <dd lang="de-AT" className="answer-line">
            <DiffText parts={ev.expectedParts} side="expected" />
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
      </div>
    )
  }

  if (phase.kind === 'checked' && phase.evaluation.result === 'correct') {
    const variant = phase.evaluation.variant
    return (
      <div className="feedback feedback--ok">
        <p className="verdict">
          <span className="verdict-mark" aria-hidden="true">
            ✓
          </span>
          {variant ? m.verdict.variant : m.verdict.correct}
        </p>
        <dl className="answers" style={fit}>
          <dt>{f.correctForm}</dt>
          <dd lang="de-AT" className="answer-line">
            {variant ? variant.text : item.de}
          </dd>
          {variant && (
            <>
              <dt>{f.canonicalNote}</dt>
              <dd lang="de-AT" className="answer-line answer-line--secondary">
                {item.de}
              </dd>
            </>
          )}
        </dl>
        {variant?.noteCz && (
          <p className="variant-note" lang="cs">
            <CzechText text={variant.noteCz} />
          </p>
        )}
        <CosmeticNotes notes={phase.evaluation.notes} />
      </div>
    )
  }

  if (phase.kind === 'compared') {
    const ev = phase.evaluation
    // Saved by an older version (every sentence was compared) or a pure spelling slip: no diff to compare.
    if (ev.result === 'correct' || ev.result === 'incorrect') {
      const shown = ev.result === 'correct' ? (ev.variant?.text ?? item.de) : ev.expected
      return (
        <div className="feedback feedback--neutral">
          <p className="verdict">{m.verdict.compared}</p>
          <dl className="answers" style={fit}>
            <dt>{f.yourAnswer}</dt>
            <dd lang="de-AT" className="answer-line">
              {value}
            </dd>
            <dt>{f.model}</dt>
            <dd lang="de-AT" className="answer-line">
              {shown}
            </dd>
          </dl>
          {ev.result === 'incorrect' && ev.hints.length > 0 && (
            <ul className="hints">
              {ev.hints.map((h, i) => (
                <li key={i}>{m.compareHint(h)}</li>
              ))}
            </ul>
          )}
          <p className="variant-note">{ev.result === 'correct' ? f.matchesModel : f.compareYourself}</p>
          <CosmeticNotes notes={ev.notes} />
        </div>
      )
    }
    const others = otherForms(item, ev.closest)
    return (
      <div className="feedback feedback--neutral feedback--compare">
        <p className="verdict">{m.verdict.compared}</p>
        <p className="compare-lead">{f.compareLead}</p>
        <dl className="answers" style={fit}>
          <dt>{f.yourAnswer}</dt>
          <dd lang="de-AT" className="answer-line">
            <DiffText parts={ev.givenParts} side="mine" />
          </dd>
          <dt>{f.closest}</dt>
          <dd lang="de-AT" className="answer-line">
            <DiffText parts={ev.expectedParts} side="model" />
          </dd>
        </dl>
        {others.length > 0 && (
          <>
            <p className="answers-sub">{f.otherForms}</p>
            <ul className="variants" lang="de-AT">
              {others.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        {ev.hints.length > 0 && (
          <>
            <p className="answers-sub">{f.compareCheck}</p>
            <ul className="hints hints--soft">
              {ev.hints.map((h, i) => (
                <li key={i}>{m.compareHint(h)}</li>
              ))}
            </ul>
          </>
        )}
        <CosmeticNotes notes={ev.notes} />
        <p className="compare-rate">{f.compareRate}</p>
      </div>
    )
  }

  // accepted or revealed
  return (
    <div className={`feedback ${phase.kind === 'accepted' ? 'feedback--ok' : 'feedback--neutral'}`}>
      <p className="verdict">{phase.kind === 'accepted' ? m.verdict.accepted : m.verdict.unknown}</p>
      <dl className="answers" style={fit}>
        {phase.kind === 'accepted' && (
          <>
            <dt>{f.yourAnswer}</dt>
            <dd lang="de-AT" className="answer-line">
              {value}
            </dd>
          </>
        )}
        <dt>{f.correctForm}</dt>
        <dd lang="de-AT" className="answer-line">
          {item.de}
        </dd>
      </dl>
      {phase.kind === 'revealed' && variants.length > 0 && (
        <>
          <p className="answers-sub">{f.otherForms}</p>
          <ul className="variants" lang="de-AT">
            {variants.map((v) => (
              <li key={v.text}>{v.text}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
