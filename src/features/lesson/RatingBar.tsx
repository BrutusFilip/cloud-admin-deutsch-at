import { useEffect, useRef } from 'react'
import type { Rating } from '../../domain/scheduler'
import { useMessages } from '../../i18n'

export interface RatingOption {
  rating: Rating
  hint: string
}

const KEYS: Record<Rating, string> = { again: '1', hard: '2', good: '3' }
const BY_KEY: Record<string, Rating> = { '1': 'again', '2': 'hard', '3': 'good' }

interface Props {
  options: RatingOption[]
  onRate: (rating: Rating) => void
  /** What receives focus when the bar appears. 'group' avoids an accidental Enter. */
  focus: 'group' | Rating
  /** Read out with the question when the group gets focus (e.g. the revealed answer of a flashcard). */
  describedBy?: string
}

/**
 * Self-assessment buttons with keyboard shortcuts 1–3. Each button shows when the card returns.
 * On phones the bar stays at the bottom of the screen (within reach of the thumb) while the
 * learner scrolls through the solution.
 */
export function RatingBar({ options, onRate, focus, describedBy }: Props) {
  const m = useMessages()
  const groupRef = useRef<HTMLFieldSetElement>(null)
  const buttons = useRef<Partial<Record<Rating, HTMLButtonElement | null>>>({})
  const used = useRef(false)

  const choose = (rating: Rating) => {
    if (used.current) return
    used.current = true
    onRate(rating)
  }

  // Focus without scrolling: the answer and the feedback above stay where the learner reads them.
  useEffect(() => {
    if (focus === 'group') groupRef.current?.focus({ preventScroll: true })
    else buttons.current[focus]?.focus({ preventScroll: true })
  }, [focus])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      // An open dialog (e.g. a storage confirmation) owns the keyboard.
      if (document.querySelector('dialog[open]')) return
      const rating = BY_KEY[event.key]
      if (rating && options.some((o) => o.rating === rating)) {
        event.preventDefault()
        if (used.current) return
        used.current = true
        onRate(rating)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [options, onRate])

  return (
    <fieldset className="rating" tabIndex={-1} ref={groupRef} aria-describedby={describedBy ? `${describedBy} rating-help` : 'rating-help'}>
      <legend className="rating-question">{m.lesson.rateQuestion}</legend>
      <p className="rating-help" id="rating-help">
        {m.lesson.rateHelp}
      </p>
      <div className="rating-buttons" data-count={options.length}>
        {options.map((o) => (
          <button
            key={o.rating}
            type="button"
            ref={(el) => {
              buttons.current[o.rating] = el
            }}
            className={`rate rate--${o.rating}`}
            onClick={() => choose(o.rating)}
            aria-keyshortcuts={KEYS[o.rating]}
          >
            <span className="rate-label">{m.rating[o.rating]}</span>
            <span className="rate-hint">{o.hint}</span>
            <kbd className="rate-key" aria-hidden="true">
              {KEYS[o.rating]}
            </kbd>
          </button>
        ))}
      </div>
    </fieldset>
  )
}
