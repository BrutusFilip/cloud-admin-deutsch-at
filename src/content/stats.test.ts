import { describe, expect, it } from 'vitest'
import { contentStats, interviewStats, interviewStatsMarkdown, statsMarkdown } from '../domain/contentStats'
import { CARDS, CHALLENGES, INTERVIEWS, ITEMS, TOPICS } from './index'

/**
 * `npm run stats:content` prints the real counts as Markdown tables
 * (for PROJECT_STATE.md). In `npm test` it only checks that they add up.
 */
describe('content statistics', () => {
  const stats = contentStats(ITEMS, TOPICS, CARDS, CHALLENGES)
  const interviews = interviewStats(INTERVIEWS)

  it('adds up', () => {
    const sum = (record: Record<string, number>) => Object.values(record).reduce((a, b) => a + b, 0)
    expect(sum(stats.byKind)).toBe(stats.items)
    expect(sum(stats.byLevel)).toBe(stats.items)
    expect(sum(stats.byExercise)).toBe(stats.cards)
    expect(sum(stats.byFocus)).toBe(stats.byKind.grammar)
    expect(sum(stats.byTaskType)).toBe(stats.byKind.grammar)
    expect(stats.byTopic.reduce((a, t) => a + t.total, 0)).toBe(stats.items)
    expect(sum(interviews.byKind)).toBe(interviews.questions)
    expect(interviews.rows.reduce((a, r) => a + r.questions, 0)).toBe(interviews.questions)
  })

  it.runIf(import.meta.env.MODE === 'stats')('prints the tables', () => {
    console.log(`\n${statsMarkdown(stats)}\n\n${interviewStatsMarkdown(interviews)}\n`)
  })
})
