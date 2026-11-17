import { SELF_CHECK_IDS, type Interview, type InterviewQuestion, type SelfCheckId } from './types'

/**
 * Interview practice ("Pohovor"): one question at a time – answer aloud, a
 * context follow-up, then the illustrative model answer and a self-assessment.
 * Nothing is recorded or scored automatically; the learner judges the answer
 * against the model and a concrete checklist.
 */

export type CheckValue = 'yes' | 'partly' | 'no'
export const CHECK_VALUES: readonly CheckValue[] = ['yes', 'partly', 'no']
export type SelfCheck = Record<SelfCheckId, CheckValue>

export interface InterviewAttempt {
  at: string
  /** Which follow-up was asked. */
  followUp: number
  /** The learner's self-assessment – never a score computed by the app. */
  checks: SelfCheck
  /** The hint "Stavba odpovědi" was opened before answering (absent in attempts saved before it was tracked). */
  hint?: boolean
}

export type InterviewPhase = 'question' | 'followUp' | 'review'
export const INTERVIEW_PHASES: readonly InterviewPhase[] = ['question', 'followUp', 'review']

export interface InterviewSession {
  interviewId: string
  startedAt: string
  /** Current question. */
  index: number
  phase: InterviewPhase
  /** Follow-up asked in the current try. */
  followUp: number
  /** Self-assessment of the current try, saved as it is filled in. */
  draft: Partial<SelfCheck>
  /** Latest saved attempt per question in this session. */
  results: Record<string, InterviewAttempt>
  /** Saved attempts per question in this session. */
  tries: Record<string, number>
  /** One question repeated from the summary; saving returns to the summary. */
  revisit: boolean
  /** The hint of the current try was opened. */
  hinted: boolean
  finishedAt: string | null
}

/** How the learner can back up their own example (the model answers are illustrative). */
export type Evidence = 'cv' | 'confirmed' | 'lab' | 'estimate' | 'unverified'
export const EVIDENCE_LEVELS: readonly Evidence[] = ['cv', 'confirmed', 'lab', 'estimate', 'unverified']

/** The learner's own version of an answer – stays in this browser only. */
export interface OwnExample {
  text: string
  evidence: Evidence
  updatedAt: string
}

export const OWN_EXAMPLE_MAX_LENGTH = 2000

export interface InterviewProgress {
  /** Last attempts per question ID, oldest first. */
  attempts: Record<string, InterviewAttempt[]>
  /** Own verifiable example per question ID. */
  ownExamples: Record<string, OwnExample>
  session: InterviewSession | null
}

export const MAX_ATTEMPTS_KEPT = 10

export function emptyInterviewProgress(): InterviewProgress {
  return { attempts: {}, ownExamples: {}, session: null }
}

/** Saves (or, with empty text, removes) the learner's own example for a question. */
export function setOwnExample(
  progress: InterviewProgress,
  questionId: string,
  text: string,
  evidence: Evidence,
  now: Date,
): InterviewProgress {
  const value = text.trim().slice(0, OWN_EXAMPLE_MAX_LENGTH)
  const ownExamples = { ...progress.ownExamples }
  if (value === '') delete ownExamples[questionId]
  else ownExamples[questionId] = { text: value, evidence, updatedAt: now.toISOString() }
  return { ...progress, ownExamples }
}

/** The follow-up after the one asked last time, so repeated practice brings a different one. */
export function followUpFor(question: InterviewQuestion, attempts: readonly InterviewAttempt[] | undefined): number {
  const last = attempts?.[attempts.length - 1]
  return last ? (last.followUp + 1) % Math.max(1, question.followUps.length) : 0
}

export function startSession(interview: Interview, progress: InterviewProgress, now: Date): InterviewProgress {
  const first = interview.questions[0]
  return {
    ...progress,
    session: {
      interviewId: interview.id,
      startedAt: now.toISOString(),
      index: 0,
      phase: 'question',
      followUp: first ? followUpFor(first, progress.attempts[first.id]) : 0,
      draft: {},
      results: {},
      tries: {},
      revisit: false,
      hinted: false,
      finishedAt: null,
    },
  }
}

export function currentQuestion(session: InterviewSession, interview: Interview): InterviewQuestion | null {
  if (session.finishedAt !== null || session.interviewId !== interview.id) return null
  return interview.questions[session.index] ?? null
}

/**
 * question → follow-up → review (model answer and self-assessment). `from` is
 * the phase the learner saw: a repeated click from the same screen does not
 * skip the next phase.
 */
export function advancePhase(progress: InterviewProgress, from: InterviewPhase): InterviewProgress {
  const session = progress.session
  if (!session || session.finishedAt !== null || session.phase !== from || from === 'review') return progress
  const phase: InterviewPhase = from === 'question' ? 'followUp' : 'review'
  return { ...progress, session: { ...session, phase } }
}

/** The hint of the current question was opened; the saved attempt will say so. */
export function markHint(progress: InterviewProgress): InterviewProgress {
  const session = progress.session
  if (!session || session.finishedAt !== null || session.phase === 'review' || session.hinted) return progress
  return { ...progress, session: { ...session, hinted: true } }
}

export function setCheck(progress: InterviewProgress, id: SelfCheckId, value: CheckValue): InterviewProgress {
  const session = progress.session
  if (!session || session.phase !== 'review') return progress
  return { ...progress, session: { ...session, draft: { ...session.draft, [id]: value } } }
}

export function isCheckComplete(draft: Partial<SelfCheck>): draft is SelfCheck {
  return SELF_CHECK_IDS.every((id) => draft[id] !== undefined)
}

function record(progress: InterviewProgress, session: InterviewSession, question: InterviewQuestion, now: Date) {
  const attempt: InterviewAttempt = {
    at: now.toISOString(),
    followUp: session.followUp,
    checks: { ...(session.draft as SelfCheck) },
    ...(session.hinted ? { hint: true } : {}),
  }
  const attempts = {
    ...progress.attempts,
    [question.id]: [...(progress.attempts[question.id] ?? []), attempt].slice(-MAX_ATTEMPTS_KEPT),
  }
  const next: InterviewSession = {
    ...session,
    results: { ...session.results, [question.id]: attempt },
    tries: { ...session.tries, [question.id]: (session.tries[question.id] ?? 0) + 1 },
    draft: {},
    hinted: false,
  }
  return { attempts, session: next }
}

/** Saves the self-assessment, then the next question, the summary after the last one, or back to the summary after a revisit. */
export function saveAndContinue(progress: InterviewProgress, interview: Interview, now: Date): InterviewProgress {
  const session = progress.session
  if (!session || session.phase !== 'review' || !isCheckComplete(session.draft)) return progress
  const question = currentQuestion(session, interview)
  if (!question) return progress
  const recorded = record(progress, session, question, now)
  const next = interview.questions[session.index + 1]
  if (session.revisit || !next) {
    return { ...progress, attempts: recorded.attempts, session: { ...recorded.session, revisit: false, finishedAt: now.toISOString() } }
  }
  return {
    ...progress,
    attempts: recorded.attempts,
    session: {
      ...recorded.session,
      index: session.index + 1,
      phase: 'question',
      followUp: followUpFor(next, recorded.attempts[next.id]),
    },
  }
}

/**
 * "Zkusit znovu": the same question again from the start, with the next
 * follow-up. A complete self-assessment of the try is kept as an attempt first.
 */
export function retryQuestion(progress: InterviewProgress, interview: Interview, now: Date): InterviewProgress {
  const session = progress.session
  // From the question screen there is nothing to retry: a repeated click must not skip a follow-up.
  if (!session || session.phase === 'question') return progress
  const question = currentQuestion(session, interview)
  if (!question) return progress
  const base = isCheckComplete(session.draft)
    ? record(progress, session, question, now)
    : { attempts: progress.attempts, session: { ...session, draft: {}, hinted: false } }
  return {
    ...progress,
    attempts: base.attempts,
    session: {
      ...base.session,
      phase: 'question',
      followUp: (session.followUp + 1) % Math.max(1, question.followUps.length),
    },
  }
}

/** From the summary: one question again, then back to the summary. */
export function revisitQuestion(progress: InterviewProgress, interview: Interview, index: number): InterviewProgress {
  const session = progress.session
  const question = interview.questions[index]
  if (!session || session.finishedAt === null || session.interviewId !== interview.id || !question) return progress
  return {
    ...progress,
    session: {
      ...session,
      index,
      phase: 'question',
      draft: {},
      revisit: true,
      hinted: false,
      finishedAt: null,
      followUp: followUpFor(question, progress.attempts[question.id]),
    },
  }
}

/** Ends the session; questions not answered stay open in the summary. */
export function endSession(progress: InterviewProgress, now: Date): InterviewProgress {
  const session = progress.session
  if (!session || session.finishedAt !== null) return progress
  return { ...progress, session: { ...session, draft: {}, revisit: false, finishedAt: now.toISOString() } }
}

export interface QuestionResult {
  question: InterviewQuestion
  /** The latest saved self-assessment of this session. */
  attempt: InterviewAttempt | undefined
  tries: number
}

export interface InterviewSummary {
  results: QuestionResult[]
  answered: number
  total: number
  counts: Record<SelfCheckId, Record<CheckValue, number>>
  /** Criteria answered "Částečně" or "Ne" at least once, weakest first. */
  focus: SelfCheckId[]
}

export function summarizeSession(session: InterviewSession, interview: Interview): InterviewSummary {
  const results = interview.questions.map((question) => ({
    question,
    attempt: session.results[question.id],
    tries: session.tries[question.id] ?? 0,
  }))
  const counts = Object.fromEntries(
    SELF_CHECK_IDS.map((id) => [id, { yes: 0, partly: 0, no: 0 } as Record<CheckValue, number>]),
  ) as Record<SelfCheckId, Record<CheckValue, number>>
  for (const r of results) {
    if (!r.attempt) continue
    for (const id of SELF_CHECK_IDS) counts[id][r.attempt.checks[id]] += 1
  }
  const focus = SELF_CHECK_IDS.filter((id) => counts[id].no + counts[id].partly > 0).sort(
    (a, b) => counts[b].no * 2 + counts[b].partly - (counts[a].no * 2 + counts[a].partly),
  )
  return { results, answered: results.filter((r) => r.attempt).length, total: results.length, counts, focus }
}

/** When any question of the interview was last practised (ISO), or null. */
export function lastPractised(progress: InterviewProgress, interview: Interview): string | null {
  let latest: string | null = null
  for (const q of interview.questions) {
    for (const a of progress.attempts[q.id] ?? []) {
      if (latest === null || a.at > latest) latest = a.at
    }
  }
  return latest
}
