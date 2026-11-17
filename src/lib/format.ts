import { dayToDate, diffDays, type LocalDay } from '../domain/localDay'
import type { Messages } from '../i18n/cs'

export function formatLongDay(day: LocalDay, m: Messages): string {
  return new Intl.DateTimeFormat(m.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(dayToDate(day))
}

export function formatShortDay(day: LocalDay, m: Messages): string {
  return new Intl.DateTimeFormat(m.locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(dayToDate(day))
}

export function relativeDay(day: LocalDay, today: LocalDay, m: Messages): string {
  return m.relativeDay(diffDays(today, day), formatShortDay(day, m))
}
