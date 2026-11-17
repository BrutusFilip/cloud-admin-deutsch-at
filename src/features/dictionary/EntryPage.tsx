import { ItemFacts } from '../../components/ItemFacts'
import { LevelChip } from '../../components/LevelChip'
import { CARDS, CHALLENGES, interviewLinks, ITEM_BY_ID, TOPIC_BY_ID } from '../../content'
import { acceptedVariantsOf } from '../../domain/cards'
import { answerFrame, splitBlank } from '../../domain/grammar'
import { cardStatus } from '../../domain/progressViews'
import type { GrammarItem } from '../../domain/types'
import { entryHash, entryReturn, interviewHash, lastDictionaryHash, navigate, LESSON_HASH } from '../../app/router'
import { fitStyle } from '../../lib/fitText'
import { formatShortDay, relativeDay } from '../../lib/format'
import { useMessages } from '../../i18n'
import { useProgress } from '../../state/progressContext'
import { CzechText } from '../../components/CzechText'

/** Back to the interview the entry was opened from, else to the last dictionary search. */
function BackLink() {
  const m = useMessages()
  const toInterview = entryReturn()
  return (
    <p>
      <a className="back" href={toInterview ?? lastDictionaryHash()}>
        {toInterview ? m.dictionary.backToInterview : m.dictionary.back}
      </a>
    </p>
  )
}

export function EntryPage({ id }: { id: string }) {
  const m = useMessages()
  const { store, today, startLesson } = useProgress()
  const item = ITEM_BY_ID.get(id)

  if (!item) {
    return (
      <div className="page">
        <BackLink />
        <section className="sheet">
          <h1 id="page-title" tabIndex={-1}>
            {m.dictionary.notFound}
          </h1>
        </section>
      </div>
    )
  }

  const cards = CARDS.filter((c) => c.item.id === item.id)
  const variants = acceptedVariantsOf(item)
  const topic = TOPIC_BY_ID.get(item.topic)
  const usedIn = CHALLENGES.flatMap((c) =>
    c.steps.flatMap((step, i) => (step.item === item.id ? [{ challenge: c, n: i + 1, stage: step.stageCz }] : [])),
  )
  const inInterviews = interviewLinks(item.id)

  return (
    <div className="page">
      <BackLink />
      <article className="sheet entry" aria-labelledby="page-title">
        <p className="card-meta">
          {m.kind(item)}
          {item.kind === 'grammar' && `: ${m.focus[item.focus]}, ${m.taskType[item.task.type]}`}, {topic && m.title(topic)}{' '}
          <LevelChip level={item.level} />
        </p>
        <h1
          id="page-title"
          className={item.kind === 'sentence' || item.kind === 'grammar' ? 'prompt-de prompt-de--sentence' : 'prompt-de'}
          lang="de-AT"
          tabIndex={-1}
          style={fitStyle(item.de)}
        >
          {item.de}
        </h1>
        <p className="answer-cz" lang="cs">
          {item.cz}
        </p>

        {item.kind === 'grammar' && <GrammarDetails item={item} />}

        <ItemFacts item={item} />

        {variants.length > 0 && (
          <section className="entry-section">
            <h2>{m.dictionary.variants}</h2>
            <ul className="variants" lang="de-AT">
              {variants.map((v) => (
                <li key={v.text}>
                  {v.text}
                  {v.noteCz && (
                    <span className="variant-inline" lang="cs">
                      {' '}
                      – <CzechText text={v.noteCz} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.sources && item.sources.length > 0 && (
          <section className="entry-section">
            <h2>{m.dictionary.sources}</h2>
            <ul className="sources">
              {item.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                  , {m.dictionary.checked(formatShortDay(s.checkedAt, m))}
                  {s.page && `, ${m.dictionary.page(s.page)}`}
                </li>
              ))}
            </ul>
          </section>
        )}

        {usedIn.length > 0 && (
          <section className="entry-section">
            <h2>{m.dictionary.usedIn}</h2>
            <ul className="used-in">
              {usedIn.map((u) => (
                <li key={u.challenge.id}>{m.dictionary.challengeStep(m.title(u.challenge), u.n, m.stage(u.stage))}</li>
              ))}
            </ul>
          </section>
        )}

        {inInterviews.length > 0 && (
          <section className="entry-section">
            <h2>{m.dictionary.usedInInterview}</h2>
            <ul className="used-in">
              {inInterviews.map((u) => (
                <li key={u.question.id}>
                  <a href={interviewHash(u.interview.id)}>{m.dictionary.interviewQuestion(m.title(u.interview), u.n)}</a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="entry-section">
          <h2>{m.dictionary.yourCards}</h2>
          <ul className="entry-cards">
            {cards.map((card) => {
              const state = store.cards[card.id]
              const status = m.status[cardStatus(state)]
              const when = state ? relativeDay(state.due, today, m) : null
              return (
                <li key={card.id}>
                  <span className="entry-card-label">{m.exercise[card.exercise]}</span>
                  <span className="entry-card-state">{m.dictionary.cardState(status, when)}</span>
                  <button
                    type="button"
                    className="btn btn--small"
                    onClick={() => {
                      startLesson(
                        'item',
                        [card.id],
                        { topic: item.topic, level: 'all', exercise: card.exercise, focus: 'all' },
                        { origin: entryHash(item.id) },
                      )
                      navigate(LESSON_HASH)
                    }}
                  >
                    {m.dictionary.practiseCard(card.exercise)}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </article>
    </div>
  )
}

/** The task as it is set, the other accepted solutions and why the solution works. */
function GrammarDetails({ item }: { item: GrammarItem }) {
  const m = useMessages()
  const task = item.task
  const [before, after] = answerFrame(task)
  const others =
    task.type === 'choice' ? [] : task.answers.slice(1).map((a) => (task.type === 'transform' ? a : `${before}${a}${after}`))
  const withBlank = (text: string) => {
    const [b, a] = splitBlank(text)
    return (
      <>
        {b}
        <span className="blank">
          <span className="sr-only">{m.grammar.blank}</span>
        </span>
        {a}
      </>
    )
  }

  return (
    <>
      <section className="entry-section">
        <h2>{m.dictionary.task}</h2>
        <p lang="cs">
          <CzechText text={item.promptCz} />
        </p>
        {task.type === 'transform' && (
          <blockquote className="entry-task" lang="de-AT">
            {task.source}
          </blockquote>
        )}
        {(task.type === 'gap' || task.type === 'order' || (task.type === 'choice' && task.text !== undefined)) && (
          <blockquote className="entry-task" lang="de-AT">
            {withBlank(task.type === 'choice' ? (task.text ?? '') : task.text)}
          </blockquote>
        )}
        {task.type === 'choice' && (
          <>
            <h3 className="entry-sub">{m.dictionary.options}</h3>
            <ul className="entry-options" lang="de-AT">
              {task.options.map((o, i) => (
                <li key={o} className={i === task.correct ? 'entry-option entry-option--correct' : 'entry-option'}>
                  {i === task.correct && (
                    <span className="entry-option-mark" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {o}
                  {i === task.correct && <span className="sr-only"> ({m.verdict.correct})</span>}
                </li>
              ))}
            </ul>
          </>
        )}
        {task.type === 'order' && (
          <>
            <h3 className="entry-sub">{m.dictionary.tokens}</h3>
            <ul className="entry-tokens" lang="de-AT">
              {task.tokens.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
      </section>
      {others.length > 0 && (
        <section className="entry-section">
          <h2>{m.dictionary.otherSolutions}</h2>
          <ul className="variants" lang="de-AT">
            {others.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}
      <p className="explanation">
        <span className="facts-label">{m.grammar.why}</span>{' '}
        <span lang="cs">
          <CzechText text={item.explanationCz} />
        </span>
      </p>
    </>
  )
}
