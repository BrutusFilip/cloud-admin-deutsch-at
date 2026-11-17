import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONTENT_VERSION, INTERVIEW_BY_ID, KNOWN_CARD_IDS } from '../content'
import {
  advancePhase,
  endSession,
  markHint,
  retryQuestion,
  revisitQuestion,
  saveAndContinue,
  setCheck,
  setOwnExample,
  startSession,
  type InterviewProgress,
} from '../domain/interview'
import {
  acceptAnswer as acceptInLesson,
  finishEarly,
  rateSubmitted,
  startLesson as createLesson,
  submitAnswer as handIn,
} from '../domain/lesson'
import { localDay } from '../domain/localDay'
import { recordLesson } from '../domain/stats'
import { downloadText } from '../lib/download'
import { createExport, exportFileName, exportText } from '../storage/backup'
import { getBrowserStorage, Persistence, type LoadOutcome } from '../storage/persistence'
import { prepareStore } from '../storage/restore'
import {
  createStore,
  parseStore,
  SCHEMA_VERSION,
  STORAGE_KEY,
  BACKUP_KEY,
  storedSchemaVersion,
  type SpeechPrefs,
  type Store,
  type UiLanguage,
} from '../storage/store'
import { APP_VERSION } from '../version'
import { ProgressContext, type ProgressContextValue, type StorageStatus, type TabState } from './progressContext'
import { browserLocks, WriterLock, type TabRole } from './tabLock'
import { useToday } from './useToday'

function statusFromOutcome(outcome: LoadOutcome): StorageStatus {
  switch (outcome.status) {
    case 'fresh':
    case 'loaded':
      return { kind: 'ok' }
    case 'unavailable':
      return { kind: 'unavailable' }
    case 'corrupt':
      return {
        kind: 'corrupt',
        recoverable: outcome.recoverable
          ? { cards: Object.keys(outcome.recoverable.store.cards).length, dropped: outcome.recoverable.dropped }
          : null,
      }
    case 'unsupported':
      return { kind: 'unsupported', version: outcome.version }
  }
}

/** The interview of the open session (undefined without one or when its content is gone). */
function sessionInterview(store: Store) {
  const session = store.interview.session
  return session ? INTERVIEW_BY_ID.get(session.interviewId) : undefined
}

function prepared(store: Store): Store {
  return prepareStore(store, KNOWN_CARD_IDS, new Date())
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    const persistence = new Persistence(getBrowserStorage())
    return { persistence, outcome: persistence.load(new Date()) }
  })
  const persistence = initial.persistence
  const [store, setStore] = useState<Store>(() => prepared(initial.outcome.store))
  const [storageStatus, setStorageStatus] = useState<StorageStatus>(() => statusFromOutcome(initial.outcome))
  // Without storage there is nothing to share between tabs: this tab simply writes (to memory).
  const [tab, setTab] = useState<TabState>(() => ({
    role: persistence.hasStorage ? 'deciding' : 'active',
    coordinated: persistence.hasStorage && browserLocks() !== null,
    refused: 0,
  }))
  const [backup, setBackup] = useState(() => persistence.readBackup())
  const storeRef = useRef(store)
  const statusRef = useRef(storageStatus)
  const roleRef = useRef<TabRole>(persistence.hasStorage ? 'deciding' : 'active')
  const lockRef = useRef<WriterLock | null>(null)
  const recoverableRef = useRef(initial.outcome.status === 'corrupt' ? initial.outcome.recoverable : null)
  const today = useToday()

  const apply = useCallback((next: Store) => {
    storeRef.current = next
    setStore(next)
  }, [])

  const setStatus = useCallback((next: StorageStatus) => {
    statusRef.current = next
    setStorageStatus(next)
  }, [])

  /** Reads the stored progress again and continues with it (after another tab saved, or on taking over). */
  const reload = useCallback(() => {
    const outcome = persistence.load(new Date())
    recoverableRef.current = outcome.status === 'corrupt' ? outcome.recoverable : null
    apply(prepared(outcome.store))
    setStatus(statusFromOutcome(outcome))
    setBackup(persistence.readBackup())
    setTab((t) => (t.refused === 0 ? t : { ...t, refused: 0 }))
  }, [persistence, apply, setStatus])

  /** A read-only tab shows exactly what the active tab saved. */
  const mirror = useCallback(() => {
    const raw = persistence.readRaw()
    if (raw === null) {
      apply(createStore(new Date()))
      return
    }
    const parsed = parseStore(raw, new Date())
    if (parsed.ok) apply(prepared(parsed.store))
    else if (parsed.kind === 'unsupported') setStatus({ kind: 'stale', reason: 'newer' })
    setBackup(persistence.readBackup())
  }, [persistence, apply, setStatus])

  // One tab saves at a time (see tabLock.ts). Without storage there is nothing to share.
  useEffect(() => {
    if (!persistence.hasStorage) return
    const lock = new WriterLock(browserLocks(), (role) => {
      const was = roleRef.current
      roleRef.current = role
      setTab((t) => ({ ...t, role, refused: role === 'active' ? 0 : t.refused }))
      // Getting the lock: read what is stored now – another tab may have saved since this one read it.
      if (role === 'active' && was !== 'active') reload()
      else if (role === 'passive') mirror()
    })
    lockRef.current = lock
    lock.start()
    return () => {
      lock.stop()
      lockRef.current = null
    }
  }, [persistence, reload, mirror])

  // Changes saved by another tab: a read-only tab follows them, an active tab stops writing until it reloads.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === BACKUP_KEY) {
        setBackup(persistence.readBackup())
        return
      }
      if (event.key !== STORAGE_KEY && event.key !== null) return
      if (roleRef.current !== 'active') {
        mirror()
        return
      }
      // Storage events never reach the tab that wrote, so another tab (or version) has saved.
      if (persistence.currentMode !== 'persistent') return
      const raw = persistence.readRaw()
      const newer = raw !== null && (storedSchemaVersion(raw) ?? 0) > SCHEMA_VERSION
      setStatus({ kind: 'stale', reason: raw === null ? 'removed' : newer ? 'newer' : 'changed' })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [persistence, mirror, setStatus])

  const writableNow = () => roleRef.current === 'active' && statusRef.current.kind !== 'stale'

  const refuse = useCallback(() => setTab((t) => ({ ...t, refused: t.refused + 1 })), [])

  /** Saves a change. In a read-only or stale tab nothing changes (and the page says why). */
  const commit = useCallback(
    (next: Store): boolean => {
      if (!writableNow()) {
        refuse()
        return false
      }
      const stamped: Store = { ...next, updatedAt: new Date().toISOString() }
      const result = persistence.save(stamped)
      switch (result.status) {
        case 'saved':
          apply({ ...stamped, rev: result.rev })
          // The first write after an update keeps the earlier data; Settings offers it from now on.
          if (result.keptOriginal) setBackup(persistence.readBackup())
          if (statusRef.current.kind === 'write-failed') setStatus({ kind: 'ok' })
          return true
        case 'failed':
          // Keep working in memory; the banner offers retry, export and continuing without saving.
          apply(stamped)
          setStatus({ kind: 'write-failed', error: result.error })
          return true
        case 'skipped':
          apply(stamped)
          return true
        case 'conflict':
          setStatus({ kind: 'stale', reason: result.reason })
          return false
      }
    },
    [persistence, apply, setStatus, refuse],
  )

  const startLesson = useCallback<ProgressContextValue['startLesson']>(
    (kind, cardIds, filter, options = {}) => {
      const current = storeRef.current
      const now = new Date()
      let cards = current.cards
      let stats = current.stats
      if (current.lesson && current.lesson.finishedAt === null) {
        // The open lesson ends here; a wrong answer already handed in still counts.
        const closed = finishEarly(current.lesson, cards, now)
        cards = closed.cards
        stats = recordLesson(stats, closed.lesson)
      }
      commit({ ...current, cards, stats, lesson: createLesson(kind, cardIds, filter, now, options) })
    },
    [commit],
  )

  const submitAnswer = useCallback<ProgressContextValue['submitAnswer']>(
    (cardId, turn, verdict, response) => {
      const current = storeRef.current
      if (!current.lesson) return
      const lesson = handIn(current.lesson, cardId, turn, verdict, response, new Date())
      if (lesson) commit({ ...current, lesson })
    },
    [commit],
  )

  const acceptAnswer = useCallback<ProgressContextValue['acceptAnswer']>(
    (cardId, turn) => {
      const current = storeRef.current
      if (!current.lesson) return
      const lesson = acceptInLesson(current.lesson, cardId, turn)
      if (lesson) commit({ ...current, lesson })
    },
    [commit],
  )

  const rate = useCallback<ProgressContextValue['rate']>(
    (cardId, turn, rating) => {
      const current = storeRef.current
      const lesson = current.lesson
      if (!lesson) return
      // Only the card of this turn with its handed-in answer can be rated – once.
      const result = rateSubmitted(lesson, current.cards[cardId], cardId, turn, rating, new Date())
      if (!result) return
      const stats = result.lesson.finishedAt !== null ? recordLesson(current.stats, result.lesson) : current.stats
      commit({ ...current, cards: { ...current.cards, [cardId]: result.state }, lesson: result.lesson, stats })
    },
    [commit],
  )

  const endLesson = useCallback(() => {
    const current = storeRef.current
    if (!current.lesson || current.lesson.finishedAt !== null) return
    const closed = finishEarly(current.lesson, current.cards, new Date())
    commit({ ...current, cards: closed.cards, lesson: closed.lesson, stats: recordLesson(current.stats, closed.lesson) })
  }, [commit])

  const setTodayTopic = useCallback(
    (topic: Store['prefs']['todayTopic']) => {
      const current = storeRef.current
      if (current.prefs.todayTopic !== topic) commit({ ...current, prefs: { ...current.prefs, todayTopic: topic } })
    },
    [commit],
  )

  const setPracticeFilter = useCallback<ProgressContextValue['setPracticeFilter']>(
    (filter) => {
      const current = storeRef.current
      commit({ ...current, prefs: { ...current.prefs, practice: filter } })
    },
    [commit],
  )

  const updateInterview = useCallback(
    (change: (progress: InterviewProgress, now: Date) => InterviewProgress) => {
      const current = storeRef.current
      const next = change(current.interview, new Date())
      if (next !== current.interview) commit({ ...current, interview: next })
    },
    [commit],
  )

  const startInterview = useCallback(
    (interviewId: string) => {
      const interview = INTERVIEW_BY_ID.get(interviewId)
      if (interview) updateInterview((p, now) => startSession(interview, p, now))
    },
    [updateInterview],
  )

  const advanceInterview = useCallback<ProgressContextValue['advanceInterview']>(
    (from) => updateInterview((p) => advancePhase(p, from)),
    [updateInterview],
  )

  const markInterviewHint = useCallback(() => updateInterview((p) => markHint(p)), [updateInterview])

  const setInterviewCheck = useCallback<ProgressContextValue['setInterviewCheck']>(
    (id, value) => updateInterview((p) => setCheck(p, id, value)),
    [updateInterview],
  )

  const saveInterviewAttempt = useCallback(() => {
    const interview = sessionInterview(storeRef.current)
    if (interview) updateInterview((p, now) => saveAndContinue(p, interview, now))
  }, [updateInterview])

  const retryInterviewQuestion = useCallback(() => {
    const interview = sessionInterview(storeRef.current)
    if (interview) updateInterview((p, now) => retryQuestion(p, interview, now))
  }, [updateInterview])

  const revisitInterviewQuestion = useCallback(
    (index: number) => {
      const interview = sessionInterview(storeRef.current)
      if (interview) updateInterview((p) => revisitQuestion(p, interview, index))
    },
    [updateInterview],
  )

  const endInterview = useCallback(() => updateInterview((p, now) => endSession(p, now)), [updateInterview])

  const saveOwnExample = useCallback<ProgressContextValue['saveOwnExample']>(
    (questionId, text, evidence) => updateInterview((p, now) => setOwnExample(p, questionId, text, evidence, now)),
    [updateInterview],
  )

  const setUiLanguage = useCallback(
    (language: UiLanguage) => {
      const current = storeRef.current
      if (current.prefs.uiLanguage !== language) commit({ ...current, prefs: { ...current.prefs, uiLanguage: language } })
    },
    [commit],
  )

  const exportProgress = useCallback(() => {
    const file = createExport(storeRef.current, { appVersion: APP_VERSION, contentVersion: CONTENT_VERSION }, new Date())
    downloadText(exportFileName(localDay(new Date())), exportText(file))
  }, [])

  const setSpeechPrefs = useCallback(
    (speech: SpeechPrefs) => {
      const current = storeRef.current
      const same = current.prefs.speech.enabled === speech.enabled && current.prefs.speech.voiceURI === speech.voiceURI
      if (!same) commit({ ...current, prefs: { ...current.prefs, speech: { ...speech } } })
    },
    [commit],
  )

  const downloadStoredData = useCallback(() => {
    const raw = persistence.readRaw()
    if (raw !== null) downloadText(`cloud-admin-deutsch-stored-data-${today}.json`, raw)
  }, [persistence, today])

  /** Explicit choice (import, recovery): replaces whatever is stored. Refused in a read-only tab. */
  const replaceStored = useCallback(
    (next: Store): boolean => {
      if (roleRef.current !== 'active') {
        refuse()
        return false
      }
      const result = persistence.overwrite(next)
      if (result.status !== 'saved') return false
      apply({ ...next, rev: result.rev })
      setStatus({ kind: 'ok' })
      return true
    },
    [persistence, apply, setStatus, refuse],
  )

  const recoverStoredData = useCallback((): boolean => {
    const recoverable = recoverableRef.current
    if (!recoverable) return false
    const ok = replaceStored(prepared(recoverable.store))
    if (ok) recoverableRef.current = null
    return ok
  }, [replaceStored])

  /** Import, after the learner confirmed the summary: replaces all progress in this browser. */
  const replaceProgress = useCallback<ProgressContextValue['replaceProgress']>(
    (imported) => {
      if (roleRef.current !== 'active') {
        refuse()
        return 'read-only'
      }
      const next = prepared(imported)
      if (!persistence.hasStorage) {
        apply(next)
        return 'memory'
      }
      return replaceStored(next) ? 'saved' : 'failed'
    },
    [persistence, replaceStored, apply, refuse],
  )

  /** Explicit reset: removes only this app's keys in the browser storage. */
  const resetProgress = useCallback((): boolean => {
    if (roleRef.current !== 'active') {
      refuse()
      return false
    }
    const result = persistence.clear()
    if (result.status === 'failed') return false
    apply(createStore(new Date()))
    setBackup(null)
    recoverableRef.current = null
    if (result.status === 'saved') setStatus({ kind: 'ok' })
    return true
  }, [persistence, apply, setStatus, refuse])

  const continueWithoutSaving = useCallback(() => {
    persistence.useMemoryOnly()
    if (statusRef.current.kind === 'write-failed') setStatus({ kind: 'memory' })
  }, [persistence, setStatus])

  const retrySave = useCallback(() => {
    if (!writableNow()) {
      refuse()
      return
    }
    const result = persistence.save(storeRef.current)
    if (result.status === 'saved') {
      apply({ ...storeRef.current, rev: result.rev })
      if (result.keptOriginal) setBackup(persistence.readBackup())
      setStatus({ kind: 'ok' })
    } else if (result.status === 'failed') setStatus({ kind: 'write-failed', error: result.error })
    else if (result.status === 'conflict') setStatus({ kind: 'stale', reason: result.reason })
  }, [persistence, apply, setStatus, refuse])

  const resumeSaving = useCallback(() => {
    persistence.resumeSaving()
    retrySave()
  }, [persistence, retrySave])

  const takeOver = useCallback(() => lockRef.current?.takeOver(), [])

  const downloadBackup = useCallback(() => {
    const kept = persistence.readBackup()
    if (kept) downloadText(`cloud-admin-deutsch-stored-data-${localDay(new Date(kept.savedAt))}-v${kept.fromVersion}.json`, kept.raw)
  }, [persistence])

  const removeBackup = useCallback(() => {
    if (roleRef.current !== 'active') {
      refuse()
      return
    }
    if (persistence.removeBackup()) setBackup(null)
  }, [persistence, refuse])

  const writable = tab.role === 'active' && storageStatus.kind !== 'stale'

  const value = useMemo<ProgressContextValue>(
    () => ({
      store,
      today,
      storageStatus,
      tab,
      writable,
      startLesson,
      submitAnswer,
      acceptAnswer,
      rate,
      endLesson,
      setTodayTopic,
      setPracticeFilter,
      startInterview,
      advanceInterview,
      markInterviewHint,
      setInterviewCheck,
      saveInterviewAttempt,
      retryInterviewQuestion,
      revisitInterviewQuestion,
      endInterview,
      saveOwnExample,
      setSpeechPrefs,
      setUiLanguage,
      exportProgress,
      replaceProgress,
      resetProgress,
      downloadStoredData,
      recoverStoredData,
      continueWithoutSaving,
      retrySave,
      resumeSaving,
      reloadStored: reload,
      takeOver,
      backup,
      downloadBackup,
      removeBackup,
    }),
    [
      store,
      today,
      storageStatus,
      tab,
      writable,
      startLesson,
      submitAnswer,
      acceptAnswer,
      rate,
      endLesson,
      setTodayTopic,
      setPracticeFilter,
      startInterview,
      advanceInterview,
      markInterviewHint,
      setInterviewCheck,
      saveInterviewAttempt,
      retryInterviewQuestion,
      revisitInterviewQuestion,
      endInterview,
      saveOwnExample,
      setSpeechPrefs,
      setUiLanguage,
      exportProgress,
      replaceProgress,
      resetProgress,
      downloadStoredData,
      recoverStoredData,
      continueWithoutSaving,
      retrySave,
      resumeSaving,
      reload,
      takeOver,
      backup,
      downloadBackup,
      removeBackup,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
