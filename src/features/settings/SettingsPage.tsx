import { useEffect, useRef, useState } from 'react'
import { KNOWN_CARD_IDS } from '../../content'
import { localDay } from '../../domain/localDay'
import { formatShortDay } from '../../lib/format'
import { pickVoice, speechSupported } from '../../lib/speech'
import { useGermanVoices, useSpeech } from '../../lib/useSpeech'
import { useMessages } from '../../i18n'
import type { Messages } from '../../i18n/cs'
import { firstAttemptAccuracy } from '../../domain/stats'
import {
  exportFileName,
  MAX_IMPORT_BYTES,
  parseImport,
  parseKeptData,
  summarizeProgress,
  type ImportPreview,
  type ImportProblem,
} from '../../storage/backup'
import { UI_LANGUAGES } from '../../storage/store'
import { useProgress } from '../../state/progressContext'
import { speechStatusText } from '../../components/speechStatus'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { showStorageBanner } from '../../components/storageBannerFocus'

/**
 * `#/nastaveni`, in the order a learner needs it: the language of the controls, the voice
 * for reading aloud, saving and backing up progress, and finally the statistics.
 */
export function SettingsPage() {
  const m = useMessages()
  return (
    <div className="page">
      <header className="page-head">
        <h1 id="page-title" tabIndex={-1}>
          {m.settings.title}
        </h1>
      </header>
      <LanguageSection />
      <SpeechSection />
      <ProgressSection />
      <StatsSection />
    </div>
  )
}

function LanguageSection() {
  const m = useMessages()
  const { store, setUiLanguage } = useProgress()
  return (
    <section className="sheet settings-section" aria-labelledby="language-title">
      <h2 id="language-title">{m.settings.languageTitle}</h2>
      <fieldset className="segmented settings-language" aria-describedby="language-hint">
        <legend className="sr-only">{m.language.label}</legend>
        {UI_LANGUAGES.map((language) => (
          <label key={language} className="segment">
            <input
              type="radio"
              name="ui-language"
              value={language}
              checked={store.prefs.uiLanguage === language}
              onChange={() => setUiLanguage(language)}
            />
            <span lang={language}>{m.language[language]}</span>
          </label>
        ))}
      </fieldset>
      <p className="muted settings-hint" id="language-hint">
        {m.settings.languageHint}
      </p>
    </section>
  )
}

function SpeechSection() {
  const m = useMessages()
  const { store, setSpeechPrefs } = useProgress()
  const prefs = store.prefs.speech
  const { voices, ready } = useGermanVoices()
  const speech = useSpeech(prefs.voiceURI)
  const supported = speechSupported()
  const chosenAvailable = prefs.voiceURI !== null && voices.some((v) => v.voiceURI === prefs.voiceURI)
  const automatic = pickVoice(voices, null)
  const active = speech.status === 'loading' || speech.status === 'speaking'

  return (
    <section className="sheet settings-section" aria-labelledby="speech-title">
      <h2 id="speech-title">{m.settings.speechTitle}</h2>
      <label className="check">
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={(e) => setSpeechPrefs({ ...prefs, enabled: e.target.checked })}
          aria-describedby="speech-enabled-hint"
        />
        {m.settings.enabled}
      </label>
      <p className="muted check-hint" id="speech-enabled-hint">
        {m.settings.enabledHint}
      </p>

      {supported ? (
        <>
          <div className="field settings-voice">
            <label htmlFor="speech-voice">{m.settings.voice}</label>
            <select
              id="speech-voice"
              aria-describedby="speech-voice-hint"
              value={chosenAvailable && prefs.voiceURI ? prefs.voiceURI : ''}
              onChange={(e) => setSpeechPrefs({ ...prefs, voiceURI: e.target.value === '' ? null : e.target.value })}
            >
              <option value="">{m.settings.auto}</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
          <p className="muted settings-hint" id="speech-voice-hint">
            {m.settings.voiceHint}
          </p>
          {ready && voices.length === 0 && <p className="explanation">{m.settings.noVoices}</p>}
          {!chosenAvailable && automatic && <p className="muted">{m.settings.autoPicked(`${automatic.name} (${automatic.lang})`)}</p>}
          <div className="read-aloud">
            <button type="button" className="btn btn--small" onClick={() => (active ? speech.stop() : speech.speak(m.settings.testText))}>
              <span className="read-aloud-icon" aria-hidden="true">
                {active ? '■' : '▶'}
              </span>
              {active ? m.speech.stop : m.settings.test}
            </button>
            <p className="speech-status" aria-live="polite">
              {speechStatusText(speech, m)}
            </p>
          </div>
        </>
      ) : (
        <p className="explanation">{m.settings.unsupported}</p>
      )}
      <p className="settings-note">{m.settings.note}</p>
    </section>
  )
}

/**
 * Statistics from real study events only: lessons when they ended, first
 * attempts the app checked, the learner's own ratings, and interview
 * self-assessments – each on its own line, never mixed into one score.
 */
function StatsSection() {
  const m = useMessages()
  const { store } = useProgress()
  const st = store.stats
  const accuracy = firstAttemptAccuracy(st.firstAttempt)
  const checkedKeys = ['correct', 'variant', 'accepted', 'incorrect', 'revealed'] as const
  const selfTotal = st.selfRating.again + st.selfRating.hard + st.selfRating.good
  const interviewAttempts = Object.values(store.interview.attempts).flat()
  const hinted = interviewAttempts.filter((a) => a.hint === true).length
  return (
    <section className="sheet settings-section" aria-labelledby="stats-title">
      <h2 id="stats-title">{m.settings.statsTitle}</h2>
      <p className="muted">{m.settings.statsSince(formatShortDay(localDay(new Date(st.since)), m))}</p>
      <dl className="progress-stats">
        <div>
          <dt>{m.settings.statsLessons}</dt>
          <dd>{st.lessons.completed}</dd>
        </div>
        <div>
          <dt>{m.settings.statsEndedEarly}</dt>
          <dd>{st.lessons.endedEarly}</dd>
        </div>
      </dl>
      <h3 className="settings-sub">{m.settings.statsFirstAttempt}</h3>
      {accuracy.total === 0 || accuracy.percent === null ? (
        <p>{m.settings.statsNone}</p>
      ) : (
        <>
          <p>
            <strong>{m.settings.statsFirstAttemptValue(accuracy.correct, accuracy.total, accuracy.percent)}</strong>
          </p>
          <ul className="summary-breakdown">
            {checkedKeys
              .filter((k) => st.firstAttempt[k] > 0)
              .map((k) => (
                <li key={k} className={`breakdown breakdown--${k}`}>
                  {m.summary.checked[k]}: <strong>{st.firstAttempt[k]}</strong>
                </li>
              ))}
          </ul>
        </>
      )}
      <h3 className="settings-sub">{m.settings.statsSelf}</h3>
      {selfTotal === 0 ? (
        <p>{m.settings.statsNone}</p>
      ) : (
        <ul className="summary-breakdown">
          {(['good', 'hard', 'again'] as const).map((r) => (
            <li key={r}>
              {m.rating[r]}: <strong>{st.selfRating[r]}</strong>
            </li>
          ))}
        </ul>
      )}
      <h3 className="settings-sub">{m.settings.statsInterview}</h3>
      <p>{interviewAttempts.length === 0 ? m.settings.statsNone : m.settings.statsInterviewValue(interviewAttempts.length, hinted)}</p>
      <p className="muted settings-note">{m.settings.statsNote}</p>
    </section>
  )
}

/** Problems are stored as data and worded at render time, so they follow a change of the interface language. */
type Problem = ImportProblem | { kind: 'unreadable' } | { kind: 'replace-failed' } | { kind: 'read-only' }

function problemText(problem: Problem, m: Messages): string {
  const p = m.settings.importProblem
  switch (problem.kind) {
    case 'unreadable':
      return p.unreadable
    case 'replace-failed':
      return m.settings.replaceFailed
    case 'read-only':
      return m.settings.replaceReadOnly
    case 'too-large':
      return p.tooLarge(Math.ceil(problem.bytes / 1024))
    case 'empty':
      return p.empty
    case 'not-json':
      return p.notJson
    case 'not-export':
      return p.notExport
    case 'newer-format':
      return p.newerFormat(problem.version)
    case 'newer-schema':
      return p.newerSchema(problem.version)
    case 'invalid-data':
      return p.invalidData(problem.parts.map((part) => m.settings.part[part]).join(', '))
  }
}

type ImportState =
  | { step: 'idle' }
  | { step: 'reading' }
  | { step: 'error'; problem: Problem }
  | { step: 'preview'; preview: ImportPreview; source: 'file' | 'backup' }

type Notice = { kind: 'export'; name: string } | { kind: 'replaced'; cards: number } | { kind: 'memory' } | { kind: 'reset' } | { kind: 'reset-failed' }

function noticeText(notice: Notice | null, m: Messages): string {
  if (!notice) return ''
  switch (notice.kind) {
    case 'export':
      return m.settings.exportStarted(notice.name)
    case 'replaced':
      return m.settings.replaced(notice.cards)
    case 'memory':
      return m.settings.replacedMemory
    case 'reset':
      return m.settings.resetDone
    case 'reset-failed':
      return m.settings.resetFailed
  }
}

/** Whether progress is being saved right now, in words; a problem points to the message with the choices. */
function StorageState() {
  const m = useMessages()
  const { storageStatus, tab } = useProgress()
  const kind = tab.role === 'passive' ? 'passive' : storageStatus.kind
  const problem = kind !== 'ok'
  return (
    <div className={problem ? 'storage-state storage-state--problem' : 'storage-state'}>
      <p className="storage-state-line">
        <span className="storage-state-mark" aria-hidden="true">
          {problem ? '!' : '✓'}
        </span>
        <span>
          <strong>{m.settings.statusLabel}:</strong> {m.settings.status[kind]}
        </span>
      </p>
      {problem && (
        <div className="storage-state-more">
          <p>{m.settings.statusMore}</p>
          <button type="button" className="btn btn--small" onClick={showStorageBanner}>
            {m.settings.statusShow}
          </button>
        </div>
      )}
    </div>
  )
}

function ProgressSection() {
  const m = useMessages()
  const { store, today, tab, exportProgress, replaceProgress, resetProgress, backup, downloadBackup, removeBackup } = useProgress()
  const readOnly = tab.role === 'passive'
  const current = summarizeProgress(store, KNOWN_CARD_IDS)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [state, setState] = useState<ImportState>({ step: 'idle' })
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const download = () => {
    exportProgress()
    setNotice({ kind: 'export', name: exportFileName(today) })
  }

  const clearFile = () => {
    if (fileRef.current) fileRef.current.value = ''
  }

  const choose = async (file: File | undefined) => {
    setNotice(null)
    if (!file) {
      setState({ step: 'idle' })
      return
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setState({ step: 'error', problem: { kind: 'too-large', bytes: file.size } })
      return
    }
    setState({ step: 'reading' })
    let text: string
    try {
      text = await file.text()
    } catch {
      setState({ step: 'error', problem: { kind: 'unreadable' } })
      return
    }
    const result = parseImport(text, KNOWN_CARD_IDS, new Date())
    setState(result.ok ? { step: 'preview', preview: result.preview, source: 'file' } : { step: 'error', problem: result.problem })
  }

  /** The data from before the last update goes through the same check, summary and confirmation as an import. */
  const restoreKept = () => {
    setNotice(null)
    if (!backup) return
    const result = parseKeptData(backup.raw, backup.savedAt, KNOWN_CARD_IDS, new Date())
    setState(result.ok ? { step: 'preview', preview: result.preview, source: 'backup' } : { step: 'error', problem: result.problem })
  }

  const replace = (preview: ImportPreview) => {
    const result = replaceProgress(preview.store)
    clearFile()
    if (result === 'failed' || result === 'read-only') {
      setState({ step: 'error', problem: { kind: result === 'failed' ? 'replace-failed' : 'read-only' } })
      return
    }
    setState({ step: 'idle' })
    setNotice(result === 'saved' ? { kind: 'replaced', cards: preview.summary.cards } : { kind: 'memory' })
  }

  const cancelImport = () => {
    clearFile()
    setState({ step: 'idle' })
  }

  const reset = () => {
    const ok = resetProgress()
    setConfirmReset(false)
    setState({ step: 'idle' })
    clearFile()
    setNotice({ kind: ok ? 'reset' : 'reset-failed' })
  }

  return (
    <section className="sheet settings-section" aria-labelledby="progress-title">
      <h2 id="progress-title">{m.settings.progressTitle}</h2>
      <StorageState />
      <p>{m.settings.progressWhere}</p>
      <p>{m.settings.progressExportUse}</p>
      <dl className="progress-stats">
        <div>
          <dt>{m.settings.statCards}</dt>
          <dd>{current.cards}</dd>
        </div>
        <div>
          <dt>{m.settings.statAttempts}</dt>
          <dd>{current.attempts}</dd>
        </div>
        <div>
          <dt>{m.settings.statExamples}</dt>
          <dd>{current.ownExamples}</dd>
        </div>
      </dl>
      <p className="settings-message" aria-live="polite">
        {noticeText(notice, m)}
      </p>
      {readOnly && <p className="explanation">{m.settings.readOnlyNote}</p>}

      <h3 className="settings-sub">{m.settings.exportTitle}</h3>
      <p className="muted">{m.settings.exportText}</p>
      <button type="button" className="btn" onClick={download}>
        {m.settings.exportButton}
      </button>

      <h3 className="settings-sub">{m.settings.importTitle}</h3>
      <p className="muted">{m.settings.importText}</p>
      <div className="field settings-file">
        <label htmlFor="import-file">{m.settings.importLabel}</label>
        <input
          ref={fileRef}
          id="import-file"
          type="file"
          accept=".json,application/json"
          onChange={(e) => void choose(e.target.files?.[0])}
        />
      </div>
      {state.step === 'reading' && <p className="muted">{m.settings.importReading}</p>}
      {state.step === 'error' && (
        <div className="import-error" role="alert">
          <p className="form-error">{problemText(state.problem, m)}</p>
          <p>{m.settings.importKept}</p>
        </div>
      )}
      {state.step === 'preview' && (
        <ConfirmDialog
          className="import-summary"
          titleId="import-summary-title"
          title={state.source === 'backup' ? m.settings.restoreSummaryTitle : m.settings.summaryTitle}
          initialFocus="title"
          describe={false}
          confirmLabel={m.settings.replaceConfirm}
          cancelLabel={m.settings.replaceCancel}
          onConfirm={() => replace(state.preview)}
          onCancel={cancelImport}
          returnFocus={() => (state.source === 'file' ? fileRef.current : null)}
          fallbackFocus={() => fileRef.current}
          extra={
            <button type="button" className="btn btn--quiet" onClick={download}>
              {m.settings.backupFirst}
            </button>
          }
        >
          <ImportSummary preview={state.preview} source={state.source} current={current} />
        </ConfirmDialog>
      )}

      {backup && (
        <>
          <h3 className="settings-sub">{m.settings.backupTitle}</h3>
          <p className="muted">{m.settings.backupText(formatShortDay(localDay(new Date(backup.savedAt)), m), backup.fromVersion)}</p>
          <div className="card-actions card-actions--row card-actions--tight">
            <button type="button" className="btn" onClick={downloadBackup}>
              {m.settings.backupDownload}
            </button>
            <button type="button" className="btn" onClick={restoreKept}>
              {m.settings.backupRestore}
            </button>
            <button type="button" className="btn btn--quiet" onClick={removeBackup}>
              {m.settings.backupRemove}
            </button>
          </div>
        </>
      )}

      <PersistStatus />

      <h3 className="settings-sub">{m.settings.resetTitle}</h3>
      <p className="muted">{m.settings.resetText}</p>
      <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
        {m.settings.resetButton}
      </button>
      {confirmReset && (
        <ConfirmDialog
          title={m.settings.resetDialogTitle}
          confirmLabel={m.settings.resetConfirm}
          cancelLabel={m.settings.resetCancel}
          onConfirm={reset}
          onCancel={() => setConfirmReset(false)}
          extra={
            <button type="button" className="btn btn--quiet" onClick={download}>
              {m.settings.backupFirst}
            </button>
          }
        >
          <p>{m.settings.resetConfirmText}</p>
        </ConfirmDialog>
      )}
    </section>
  )
}

interface SummaryProps {
  preview: ImportPreview
  source: 'file' | 'backup'
  current: ReturnType<typeof summarizeProgress>
}

/** What an import or a restore would bring, and what it replaces; shown inside the confirmation dialog. */
function ImportSummary({ preview, source, current }: SummaryProps) {
  const m = useMessages()
  const s = preview.summary
  const open = [s.openLesson && m.settings.summaryOpenLesson, s.openInterview && m.settings.summaryOpenInterview].filter(Boolean)
  return (
    <>
      <dl className="import-facts">
        <div>
          <dt>{source === 'backup' ? m.settings.summaryKept : m.settings.summaryExported}</dt>
          <dd>{formatShortDay(localDay(new Date(preview.exportedAt)), m)}</dd>
        </div>
        {source === 'file' && (
          <div>
            <dt>{m.settings.summaryVersion}</dt>
            <dd>{preview.appVersion}</dd>
          </div>
        )}
        <div>
          <dt>{m.settings.summaryCards}</dt>
          <dd>
            {s.cards} <span className="muted">({m.settings.summaryMastered(s.mastered)})</span>
          </dd>
        </div>
        {s.unknownCards > 0 && (
          <div>
            <dt>{m.settings.summaryUnknown}</dt>
            <dd>{s.unknownCards}</dd>
          </div>
        )}
        <div>
          <dt>{m.settings.summaryAttempts}</dt>
          <dd>{s.attempts}</dd>
        </div>
        <div>
          <dt>{m.settings.summaryExamples}</dt>
          <dd>{s.ownExamples}</dd>
        </div>
        <div>
          <dt>{m.settings.summaryLessons}</dt>
          <dd>{s.lessonsCompleted}</dd>
        </div>
        <div>
          <dt>{m.settings.summaryOpen}</dt>
          <dd>{open.length > 0 ? open.join(', ') : m.settings.summaryNothingOpen}</dd>
        </div>
      </dl>
      <p className="import-warning">{m.settings.replaceWarning(current.cards, current.attempts, current.ownExamples)}</p>
    </>
  )
}

/**
 * Whether the browser keeps this site's data even when space runs low. Asking
 * is the learner's choice (some browsers show a prompt); the export stays the
 * real backup.
 */
function PersistStatus() {
  const m = useMessages()
  const storage = typeof navigator !== 'undefined' ? navigator.storage : undefined
  const [state, setState] = useState<'unknown' | 'unsupported' | 'granted' | 'not-granted' | 'denied'>(() =>
    storage?.persisted ? 'unknown' : 'unsupported',
  )

  useEffect(() => {
    let alive = true
    if (!storage?.persisted) return
    storage
      .persisted()
      .then((granted) => {
        if (alive) setState(granted ? 'granted' : 'not-granted')
      })
      .catch(() => {
        if (alive) setState('unsupported')
      })
    return () => {
      alive = false
    }
  }, [storage])

  const ask = () => {
    if (!storage?.persist) return
    storage
      .persist()
      .then((granted) => setState(granted ? 'granted' : 'denied'))
      .catch(() => setState('denied'))
  }

  if (state === 'unknown') return null
  return (
    <div className="persist-status">
      <h3 className="settings-sub">{m.settings.persistTitle}</h3>
      {state === 'granted' && <p className="muted">{m.settings.persistGranted}</p>}
      {state === 'unsupported' && <p className="muted">{m.settings.persistUnsupported}</p>}
      {(state === 'not-granted' || state === 'denied') && (
        <>
          <p className="muted">{m.settings.persistNotGranted}</p>
          {state === 'denied' && <p className="muted">{m.settings.persistDenied}</p>}
          <button type="button" className="btn btn--small" onClick={ask}>
            {m.settings.persistAsk}
          </button>
        </>
      )}
    </div>
  )
}
