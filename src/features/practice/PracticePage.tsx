import { FocusSelect, LevelSelect, TopicSelect } from '../../components/Selects'
import { isFocus, isLevel, isTopicId } from '../../lib/guards'
import { CARDS } from '../../content'
import { composeDaily, composeFree, composeMistakes, mistakeCards, type CardFilter } from '../../domain/lesson'
import { isDue } from '../../domain/scheduler'
import { counts, nextDue } from '../../domain/progressViews'
import { PRACTICE_MODES, type CardId, type PracticeMode } from '../../domain/types'
import { navigate, LESSON_HASH } from '../../app/router'
import { relativeDay } from '../../lib/format'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'

export function PracticePage() {
  const m = useMessages()
  const { store, today, startLesson, setPracticeFilter } = useProgress()
  const saved = store.prefs.practice
  const exercise = saved.exercise === 'mixed' ? 'flashcard' : saved.exercise
  const filter: CardFilter = {
    topic: saved.topic === 'all' || isTopicId(saved.topic) ? saved.topic : 'all',
    level: saved.level === 'all' || isLevel(saved.level) ? saved.level : 'all',
    exercise,
    // The grammar focus only applies to grammar tasks.
    focus: exercise === 'grammar' && isFocus(saved.focus) ? saved.focus : 'all',
  }
  const states = store.cards
  const c = counts(CARDS, states, today, filter)
  const planned = composeDaily(CARDS, states, today, filter)
  const free = composeFree(CARDS, states, today, filter)
  const next = nextDue(CARDS, states, today, filter)
  // Quick repeat of mistakes covers every exercise of the chosen topic and level.
  const mistakeFilter: CardFilter = { ...filter, exercise: 'mixed', focus: 'all' }
  const mistakes = mistakeCards(CARDS, states, mistakeFilter)

  const update = (patch: Partial<CardFilter>) => {
    const next = { ...filter, ...patch }
    setPracticeFilter(next.exercise === 'grammar' ? next : { ...next, focus: 'all' })
  }
  const run = (kind: 'daily' | 'free' | 'mistakes', ids: readonly CardId[]) => {
    startLesson(kind, ids, kind === 'mistakes' ? mistakeFilter : filter)
    navigate(LESSON_HASH)
  }
  const dueInLesson = planned.filter((id) => isDue(states[id], today)).length

  return (
    <div className="page">
      <header className="page-head">
        <h1 id="page-title" tabIndex={-1}>
          {m.practice.title}
        </h1>
      </header>

      <div className="sheet">
        <fieldset className="segmented">
          <legend>{m.practice.exerciseLegend}</legend>
          {PRACTICE_MODES.map((ex: PracticeMode) => (
            <label key={ex} className="segment">
              <input
                type="radio"
                name="exercise"
                value={ex}
                checked={filter.exercise === ex}
                onChange={() => update({ exercise: ex })}
              />
              <span>{m.exercise[ex]}</span>
            </label>
          ))}
        </fieldset>
        {filter.exercise === 'listen' && <p className="muted mode-hint">{m.listen.modeHint}</p>}
        <div className="filters">
          <TopicSelect id="practice-topic" value={filter.topic} onChange={(topic) => update({ topic })} />
          <LevelSelect id="practice-level" value={filter.level} onChange={(level) => update({ level })} />
          {filter.exercise === 'grammar' && (
            <FocusSelect id="practice-focus" value={filter.focus} onChange={(focus) => update({ focus })} />
          )}
        </div>
        <dl className="counts">
          <div>
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
        {planned.length > 0 ? (
          <>
            <p className="today-preview">{m.today.preview(dueInLesson, planned.length - dueInLesson)}</p>
            <button type="button" className="btn btn--primary btn--wide" onClick={() => run('daily', planned)}>
              {m.practice.start}
            </button>
          </>
        ) : (
          <div className="empty">
            <h2>{m.today.emptyTopicTitle}</h2>
            <p>{next ? m.today.nextDue(relativeDay(next.day, today, m), next.count) : m.today.nothingSeen}</p>
            {free.length > 0 && (
              <>
                <button type="button" className="btn btn--primary" onClick={() => run('free', free)}>
                  {m.today.freePractice}
                </button>
                <p className="muted">{m.today.freePracticeHint}</p>
              </>
            )}
          </div>
        )}
      </div>

      <section className="sheet" aria-labelledby="mistakes-title">
        <h2 id="mistakes-title">{m.practice.mistakesTitle}</h2>
        <p>{mistakes.length > 0 ? m.practice.mistakesText(mistakes.length) : m.practice.noMistakes}</p>
        {mistakes.length > 0 && (
          <button
            type="button"
            className="btn"
            onClick={() => run('mistakes', composeMistakes(CARDS, states, mistakeFilter))}
          >
            {m.practice.repeatMistakes}
          </button>
        )}
      </section>
    </div>
  )
}
