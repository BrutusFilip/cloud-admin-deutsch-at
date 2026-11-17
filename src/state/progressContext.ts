import { createContext, useContext } from 'react'
import type { CheckValue, Evidence, InterviewPhase } from '../domain/interview'
import type { AnswerResponse, CardFilter, LessonKind, StartOptions, Verdict } from '../domain/lesson'
import type { LocalDay } from '../domain/localDay'
import type { Rating } from '../domain/scheduler'
import type { CardId, SelfCheckId, TopicId } from '../domain/types'
import type { StoredBackup } from '../storage/persistence'
import type { SpeechPrefs, Store, UiLanguage } from '../storage/store'
import type { TabRole } from './tabLock'

export type StorageStatus =
  | { kind: 'ok' }
  | { kind: 'unavailable' }
  | { kind: 'corrupt'; recoverable: { cards: number; dropped: number } | null }
  | { kind: 'unsupported'; version: number }
  | { kind: 'write-failed'; error: string }
  | { kind: 'memory' }
  /** Another tab or version changed or removed the stored progress; this tab does not write until it reloads it. */
  | { kind: 'stale'; reason: 'changed' | 'removed' | 'newer' }

/** Who may write: this tab ('active'), another tab ('passive'), or not decided yet. */
export interface TabState {
  role: TabRole
  /** The browser coordinates tabs (Web Locks); without it every tab writes and conflicts are caught on save. */
  coordinated: boolean
  /** Increments when a change in a read-only tab was refused, so the page can say so. */
  refused: number
}

export interface ProgressContextValue {
  store: Store
  today: LocalDay
  storageStatus: StorageStatus
  tab: TabState
  /** This tab may change the progress now. */
  writable: boolean
  startLesson: (kind: LessonKind, cardIds: readonly CardId[], filter: CardFilter, options?: StartOptions) => void
  /** Hands in the answer of the current turn (saved before rating). */
  submitAnswer: (cardId: CardId, turn: number, verdict: Verdict, response: AnswerResponse | null) => void
  /** "Moje odpověď je také správná" after a wrong answer. */
  acceptAnswer: (cardId: CardId, turn: number) => void
  /** Rates the handed-in answer of the turn; repeated or stale calls are ignored. */
  rate: (cardId: CardId, turn: number, rating: Rating) => void
  endLesson: () => void
  setTodayTopic: (topic: TopicId | 'all') => void
  setPracticeFilter: (filter: CardFilter) => void
  /** Pohovor: one session at a time; starting another replaces it (saved attempts stay). */
  startInterview: (interviewId: string) => void
  /** Moves on from the phase the learner saw; a repeated click does not skip a phase. */
  advanceInterview: (from: InterviewPhase) => void
  markInterviewHint: () => void
  setInterviewCheck: (id: SelfCheckId, value: CheckValue) => void
  saveInterviewAttempt: () => void
  retryInterviewQuestion: () => void
  revisitInterviewQuestion: (index: number) => void
  endInterview: () => void
  saveOwnExample: (questionId: string, text: string, evidence: Evidence) => void
  setSpeechPrefs: (speech: SpeechPrefs) => void
  setUiLanguage: (language: UiLanguage) => void
  /** Downloads the versioned JSON export of the progress as this tab has it (also when it cannot be saved). */
  exportProgress: () => void
  /** Replaces all progress with a validated import: saved, only in memory (no storage), failed or refused (nothing changed). */
  replaceProgress: (store: Store) => 'saved' | 'memory' | 'failed' | 'read-only'
  /** Removes this app's data from the browser (only its own keys). */
  resetProgress: () => boolean
  downloadStoredData: () => void
  recoverStoredData: () => boolean
  continueWithoutSaving: () => void
  retrySave: () => void
  resumeSaving: () => void
  /** Reads the stored progress again (after a change in another tab) and continues with it. */
  reloadStored: () => void
  /** "Pracovat v této kartě": this tab becomes the one that saves. */
  takeOver: () => void
  /** The stored text from before the last update, if kept. */
  backup: StoredBackup | null
  downloadBackup: () => void
  removeBackup: () => void
}

export const ProgressContext = createContext<ProgressContextValue | null>(null)

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used inside ProgressProvider')
  return value
}
