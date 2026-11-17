/**
 * Calendar days in the learner's local time zone, stored as 'YYYY-MM-DD'.
 * All due dates use local days, never timestamps, so "tomorrow" always means
 * the next calendar day – also across midnight and daylight saving changes.
 */

export type LocalDay = string

const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const MS_PER_DAY = 86_400_000

function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}

function format(y: number, m: number, d: number): LocalDay {
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`
}

function parts(day: LocalDay): [number, number, number] {
  const m = DAY_RE.exec(day)
  if (!m) throw new Error(`Invalid local day: ${day}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** Local calendar day of the given moment. */
export function localDay(date: Date): LocalDay {
  return format(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function isLocalDay(value: unknown): value is LocalDay {
  if (typeof value !== 'string') return false
  const m = DAY_RE.exec(value)
  if (!m) return false
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  const t = new Date(Date.UTC(y, mo - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d
}

/** Pure calendar arithmetic – independent of time zone and DST. */
export function addDays(day: LocalDay, days: number): LocalDay {
  const [y, m, d] = parts(day)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return format(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** Number of calendar days from `from` to `to` (negative when `to` is earlier). */
export function diffDays(from: LocalDay, to: LocalDay): number {
  const [y1, m1, d1] = parts(from)
  const [y2, m2, d2] = parts(to)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / MS_PER_DAY)
}

/** Milliseconds until the next local midnight. */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0)
  return next.getTime() - now.getTime()
}

/** Date object at local noon of the day – safe for formatting. */
export function dayToDate(day: LocalDay): Date {
  const [y, m, d] = parts(day)
  return new Date(y, m - 1, d, 12, 0, 0, 0)
}
