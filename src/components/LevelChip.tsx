import type { Level } from '../domain/types'
import { useMessages } from '../i18n'

/**
 * The CEFR level of an item, a challenge or an interview. It is an orientation
 * for choosing what to practise, not a certified grading: the chip says so on
 * hover and to screen readers.
 */
export function LevelChip({ level }: { level: Level }) {
  const m = useMessages()
  return (
    <span className="level" title={m.common.levelTitle}>
      <span className="sr-only">{m.common.levelSr} </span>
      {level}
    </span>
  )
}
