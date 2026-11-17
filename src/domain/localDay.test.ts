import { describe, expect, it } from 'vitest'
import { addDays, dayToDate, diffDays, isLocalDay, localDay, msUntilNextLocalMidnight } from './localDay'

describe('localDay', () => {
  it('uses the local calendar day and switches exactly at local midnight', () => {
    expect(localDay(new Date(2026, 10, 4, 23, 59, 59, 999))).toBe('2026-11-04')
    expect(localDay(new Date(2026, 10, 5, 0, 0, 0, 0))).toBe('2026-11-05')
    expect(localDay(new Date(2026, 10, 5, 0, 0, 1))).toBe('2026-11-05')
  })

  it('stays on the local day around daylight saving changes', () => {
    expect(localDay(new Date(2026, 2, 29, 23, 30))).toBe('2026-03-29')
    expect(localDay(new Date(2026, 2, 30, 0, 30))).toBe('2026-03-30')
    expect(localDay(new Date(2026, 9, 25, 23, 59))).toBe('2026-10-25')
    expect(localDay(new Date(2026, 9, 26, 0, 1))).toBe('2026-10-26')
  })

  it('pads years, months and days', () => {
    expect(localDay(new Date(2027, 0, 3, 12))).toBe('2027-01-03')
  })
})

describe('addDays and diffDays', () => {
  it('crosses month, year and leap-day boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addDays('2026-11-04', 60)).toBe('2027-01-03')
  })

  it('adds whole calendar days across DST without drift', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26')
    expect(diffDays('2026-03-28', '2026-03-31')).toBe(3)
    expect(diffDays('2026-10-24', '2026-10-27')).toBe(3)
  })

  it('counts days in both directions', () => {
    expect(diffDays('2026-11-04', '2026-11-07')).toBe(3)
    expect(diffDays('2026-11-07', '2026-11-04')).toBe(-3)
  })
})

describe('isLocalDay', () => {
  it('accepts only real calendar days', () => {
    expect(isLocalDay('2026-11-04')).toBe(true)
    expect(isLocalDay('2026-02-30')).toBe(false)
    expect(isLocalDay('2026-1-4')).toBe(false)
    expect(isLocalDay('2026-11-04T10:00:00Z')).toBe(false)
    expect(isLocalDay(20261104)).toBe(false)
  })
})

describe('midnight helpers', () => {
  it('measures the time to the next local midnight', () => {
    expect(msUntilNextLocalMidnight(new Date(2026, 10, 4, 23, 59, 0))).toBe(60_000)
    expect(msUntilNextLocalMidnight(new Date(2026, 10, 4, 0, 0, 0))).toBe(24 * 3_600_000)
  })

  it('handles the 25-hour day at the end of summer time (Europe/Prague)', () => {
    expect(msUntilNextLocalMidnight(new Date(2026, 9, 25, 0, 0, 0))).toBe(25 * 3_600_000)
  })

  it('handles the 23-hour day at the start of summer time (Europe/Prague)', () => {
    expect(msUntilNextLocalMidnight(new Date(2026, 2, 29, 0, 0, 0))).toBe(23 * 3_600_000)
    expect(msUntilNextLocalMidnight(new Date(2026, 2, 29, 3, 30, 0))).toBe(20.5 * 3_600_000)
  })

  it('formats a day back to a Date at local noon', () => {
    const d = dayToDate('2026-11-04')
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 10, 4, 12])
  })
})
