/**
 * Fictional progress for the browser tests: card IDs of the released content,
 * made-up dates, counts and an invented interview example. No personal data.
 */

const PREFS = {
  todayTopic: 'all',
  practice: { topic: 'all', level: 'all', exercise: 'flashcard', focus: 'all' },
  speech: { enabled: true, voiceURI: null },
  uiLanguage: 'cs',
}

function emptyStats(stamp: string) {
  return {
    since: stamp,
    lessons: { completed: 0, endedEarly: 0 },
    firstAttempt: { correct: 0, variant: 0, accepted: 0, incorrect: 0, revealed: 0 },
    selfRating: { again: 0, hard: 0, good: 0 },
    recorded: [],
  }
}

/** A daily lesson in progress with these cards in this order, nothing answered yet (schema 5). */
export function lessonStore(day: string, cards: string[]) {
  const stamp = `${day}T06:00:00.000Z`
  return {
    app: 'cloud-admin-deutsch-at',
    schemaVersion: 5,
    rev: 0,
    createdAt: stamp,
    updatedAt: stamp,
    cards: {},
    lesson: {
      id: 'l-e2e',
      kind: 'daily',
      filter: { topic: 'all', level: 'all', exercise: 'mixed', focus: 'all' },
      startedDay: day,
      startedAt: stamp,
      cards,
      queue: [...cards],
      attempts: {},
      log: [],
      finishedAt: null,
      origin: null,
      challengeId: null,
      timed: false,
      pending: null,
    },
    interview: { attempts: {}, ownExamples: {}, session: null },
    prefs: PREFS,
    stats: emptyStats(stamp),
  }
}

const REVIEWED = [
  'network-v-001:flashcard', 'network-v-001:write', 'network-v-002:flashcard', 'network-s-001:write',
  'access-v-001:flashcard', 'access-v-002:flashcard', 'access-s-001:write', 'identity-v-001:flashcard',
  'm365-v-001:flashcard', 'azure-v-001:flashcard', 'career-v-001:flashcard', 'austria-v-001:flashcard',
]

/** Reviewed cards, two interview attempts and one own example; schema 5, or 4 as version 1.0 wrote it. */
export function progressStore(day: string, schema: 4 | 5 = 5) {
  const stamp = `${day}T08:00:00.000Z`
  const plusDays = (n: number) => {
    const d = new Date(`${day}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + n)
    return d.toISOString().slice(0, 10)
  }
  // Level 2 → in 7 days, 0 → tomorrow ("Těžké"), 1 → in 3 days, 3 → in 14 days.
  const cards = Object.fromEntries(
    REVIEWED.map((id, n) => {
      const level = [2, 0, 1, 3][n % 4]
      const due = plusDays([7, 1, 3, 14][n % 4])
      return [id, { level, due, lastReviewed: plusDays(-2), lastRating: level === 0 ? 'hard' : 'good', reviews: level + 1, againCount: 0 }]
    }),
  )
  const checks = { direct: 'yes', structure: 'partly', vocabulary: 'yes', followUp: 'yes' }
  const data: Record<string, unknown> = {
    app: 'cloud-admin-deutsch-at',
    schemaVersion: schema,
    rev: 0,
    createdAt: stamp,
    updatedAt: stamp,
    cards,
    lesson: null,
    interview: {
      attempts: {
        'network-i-001': [{ at: stamp, followUp: 0, checks }],
        'network-i-002': [{ at: stamp, followUp: 0, checks }],
      },
      ownExamples: {
        'network-i-001': { text: 'Im Testlabor habe ich eine VPN-Störung nachgestellt und die Prüfschritte dokumentiert.', evidence: 'lab', updatedAt: stamp },
      },
      session: null,
    },
    prefs: PREFS,
    stats: {
      since: stamp,
      lessons: { completed: 4, endedEarly: 1 },
      firstAttempt: { correct: 18, variant: 2, accepted: 1, incorrect: 5, revealed: 3 },
      selfRating: { again: 4, hard: 7, good: 21 },
      recorded: ['l-demo-1', 'l-demo-2'],
    },
  }
  if (schema === 4) {
    delete data.rev
    delete data.stats
  }
  return data
}

/** Number of reviewed cards in progressStore. */
export const REVIEWED_COUNT = REVIEWED.length
