import { describe, expect, it } from 'vitest'
import {
  advancePhase,
  markHint,
  currentQuestion,
  emptyInterviewProgress,
  endSession,
  followUpFor,
  isCheckComplete,
  lastPractised,
  MAX_ATTEMPTS_KEPT,
  retryQuestion,
  revisitQuestion,
  saveAndContinue,
  setCheck,
  setOwnExample,
  startSession,
  summarizeSession,
  type InterviewProgress,
  type SelfCheck,
} from './interview'
import { INTERVIEW, TECH_Q } from './__fixtures__/interview'

const NOW = new Date(2026, 10, 11, 8, 0)
const ALL_YES: SelfCheck = { direct: 'yes', structure: 'yes', vocabulary: 'yes', followUp: 'yes' }

function fill(progress: InterviewProgress, checks: SelfCheck): InterviewProgress {
  let p = progress
  for (const [id, value] of Object.entries(checks)) p = setCheck(p, id as keyof SelfCheck, value)
  return p
}

function answerToReview(progress: InterviewProgress): InterviewProgress {
  return advancePhase(advancePhase(progress, 'question'), 'followUp')
}

describe('interview session', () => {
  it('goes question → follow-up → model and self-assessment', () => {
    let p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    expect(p.session).toMatchObject({ interviewId: 'test-interview', index: 0, phase: 'question', followUp: 0, finishedAt: null })
    expect(currentQuestion(p.session!, INTERVIEW)?.id).toBe('identity-i-001')
    p = advancePhase(p, 'question')
    expect(p.session?.phase).toBe('followUp')
    // A second click from the question screen (double click) does not skip the follow-up.
    expect(advancePhase(p, 'question')).toEqual(p)
    p = advancePhase(p, 'followUp')
    expect(p.session?.phase).toBe('review')
    expect(advancePhase(p, 'review')).toEqual(p)
    expect(advancePhase(p, 'followUp')).toEqual(p)
  })

  it('records the self-assessment only in the review and only when complete', () => {
    let p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    expect(setCheck(p, 'direct', 'yes')).toEqual(p)
    p = answerToReview(p)
    p = setCheck(p, 'direct', 'partly')
    expect(isCheckComplete(p.session!.draft)).toBe(false)
    expect(saveAndContinue(p, INTERVIEW, NOW)).toEqual(p)
    p = fill(p, { ...ALL_YES, direct: 'partly' })
    p = saveAndContinue(p, INTERVIEW, NOW)
    expect(p.attempts['identity-i-001']).toEqual([{ at: NOW.toISOString(), followUp: 0, checks: { ...ALL_YES, direct: 'partly' } }])
    expect(p.session).toMatchObject({ index: 1, phase: 'question', draft: {}, finishedAt: null })
  })

  it('"Zkusit znovu" restarts the question with the next follow-up and keeps a complete self-assessment', () => {
    let p = answerToReview(startSession(INTERVIEW, emptyInterviewProgress(), NOW))
    p = retryQuestion(p, INTERVIEW, NOW)
    expect(p.session).toMatchObject({ index: 0, phase: 'question', followUp: 1 })
    expect(p.attempts['identity-i-001']).toBeUndefined()
    p = fill(answerToReview(p), ALL_YES)
    p = retryQuestion(p, INTERVIEW, NOW)
    expect(p.session).toMatchObject({ index: 0, phase: 'question', followUp: 0, draft: {} })
    expect(p.attempts['identity-i-001']).toHaveLength(1)
    expect(p.session?.tries['identity-i-001']).toBe(1)
  })

  it('ends with a summary, can revisit one question and returns to the summary', () => {
    let p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    const values: SelfCheck[] = [ALL_YES, { ...ALL_YES, structure: 'no' }, { ...ALL_YES, vocabulary: 'partly', structure: 'partly' }]
    for (const checks of values) p = saveAndContinue(fill(answerToReview(p), checks), INTERVIEW, NOW)
    expect(p.session?.finishedAt).toBe(NOW.toISOString())
    const summary = summarizeSession(p.session!, INTERVIEW)
    expect(summary).toMatchObject({ answered: 3, total: 3 })
    expect(summary.counts.structure).toEqual({ yes: 1, partly: 1, no: 1 })
    expect(summary.focus).toEqual(['structure', 'vocabulary'])

    p = revisitQuestion(p, INTERVIEW, 1)
    expect(p.session).toMatchObject({ index: 1, phase: 'question', revisit: true, finishedAt: null, followUp: 1 })
    p = saveAndContinue(fill(answerToReview(p), ALL_YES), INTERVIEW, NOW)
    expect(p.session).toMatchObject({ revisit: false, finishedAt: NOW.toISOString() })
    expect(summarizeSession(p.session!, INTERVIEW).results[1]).toMatchObject({ tries: 2, attempt: { checks: ALL_YES } })
  })

  it('an ended session leaves unanswered questions open', () => {
    let p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    p = saveAndContinue(fill(answerToReview(p), ALL_YES), INTERVIEW, NOW)
    p = endSession(p, NOW)
    const summary = summarizeSession(p.session!, INTERVIEW)
    expect(summary).toMatchObject({ answered: 1, total: 3 })
    expect(summary.results.map((r) => r.attempt === undefined)).toEqual([false, true, true])
    expect(currentQuestion(p.session!, INTERVIEW)).toBeNull()
  })

  it('keeps the last 10 attempts per question and rotates follow-ups across sessions', () => {
    let p = emptyInterviewProgress()
    for (let i = 0; i < MAX_ATTEMPTS_KEPT + 2; i++) {
      p = startSession(INTERVIEW, p, new Date(NOW.getTime() + i * 60_000))
      expect(p.session?.followUp).toBe(i % TECH_Q.followUps.length)
      expect(p.session?.followUp).toBe(followUpFor(TECH_Q, p.attempts[TECH_Q.id]))
      p = saveAndContinue(fill(answerToReview(p), ALL_YES), INTERVIEW, new Date(NOW.getTime() + i * 60_000))
    }
    expect(p.attempts['identity-i-001']).toHaveLength(MAX_ATTEMPTS_KEPT)
    expect(lastPractised(p, INTERVIEW)).toBe(new Date(NOW.getTime() + (MAX_ATTEMPTS_KEPT + 1) * 60_000).toISOString())
    expect(lastPractised(emptyInterviewProgress(), INTERVIEW)).toBeNull()
  })

  it('keeps the own example per question and removes it when emptied', () => {
    let p = setOwnExample(emptyInterviewProgress(), TECH_Q.id, '  Ich habe im Labor Konten entsperrt.  ', 'lab', NOW)
    expect(p.ownExamples[TECH_Q.id]).toEqual({ text: 'Ich habe im Labor Konten entsperrt.', evidence: 'lab', updatedAt: NOW.toISOString() })
    p = setOwnExample(p, TECH_Q.id, 'x'.repeat(2500), 'cv', NOW)
    expect(p.ownExamples[TECH_Q.id]?.text).toHaveLength(2000)
    p = setOwnExample(p, TECH_Q.id, '   ', 'cv', NOW)
    expect(p.ownExamples).toEqual({})
    // Sessions and attempts are not touched.
    const started = startSession(INTERVIEW, p, NOW)
    expect(setOwnExample(started, TECH_Q.id, 'Text', 'cv', NOW).session).toBe(started.session)
  })
})

describe('stage 7: hint and repeated clicks', () => {
  it('notes the hint with the saved attempt and starts the next question without it', () => {
    let p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    p = markHint(p)
    expect(p.session?.hinted).toBe(true)
    expect(markHint(p)).toBe(p)
    p = fill(answerToReview(p), { direct: 'yes', structure: 'partly', vocabulary: 'yes', followUp: 'no' })
    expect(markHint(p)).toBe(p) // in the review the model is visible anyway
    p = saveAndContinue(p, INTERVIEW, NOW)
    expect(p.attempts['identity-i-001']?.[0]?.hint).toBe(true)
    expect(p.session).toMatchObject({ index: 1, phase: 'question', hinted: false })
  })

  it('"Zkusit znovu" does nothing on the question screen, so a double click cannot skip a follow-up', () => {
    const p = startSession(INTERVIEW, emptyInterviewProgress(), NOW)
    expect(retryQuestion(p, INTERVIEW, NOW)).toBe(p)
  })
})
