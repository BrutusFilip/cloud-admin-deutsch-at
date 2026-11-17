import { useEffect, type ReactNode } from 'react'
import { AppShell } from './app/AppShell'
import { ErrorBoundary } from './app/ErrorBoundary'
import { useRoute, type Route } from './app/router'
import { DictionaryPage } from './features/dictionary/DictionaryPage'
import { EntryPage } from './features/dictionary/EntryPage'
import { InterviewListPage } from './features/interview/InterviewListPage'
import { InterviewSessionPage } from './features/interview/InterviewSessionPage'
import { LessonPage } from './features/lesson/LessonPage'
import { PracticePage } from './features/practice/PracticePage'
import { SettingsPage } from './features/settings/SettingsPage'
import { TodayPage } from './features/today/TodayPage'
import { cs } from './i18n/cs'
import { de } from './i18n/de'
import { I18nProvider } from './i18n/I18nProvider'
import { ProgressProvider } from './state/ProgressProvider'
import { useProgress } from './state/progressContext'

function pageFor(route: Route): ReactNode {
  switch (route.name) {
    case 'today':
      return <TodayPage />
    case 'lesson':
      return <LessonPage />
    case 'practice':
      return <PracticePage />
    case 'dictionary':
      return <DictionaryPage initial={{ q: route.q, topic: route.topic, level: route.level, kind: route.kind }} />
    case 'entry':
      return <EntryPage key={route.id} id={route.id} />
    case 'interview':
      return <InterviewListPage />
    case 'interviewSession':
      return <InterviewSessionPage key={route.id} id={route.id} />
    case 'settings':
      return <SettingsPage />
  }
}

/** The interface language is a stored preference (Czech by default); study content does not change with it. */
function LocalizedApp({ route }: { route: Route }) {
  const { store } = useProgress()
  const messages = store.prefs.uiLanguage === 'de' ? de : cs
  useEffect(() => {
    document.documentElement.lang = messages.htmlLang
  }, [messages])
  return (
    <I18nProvider messages={messages}>
      <AppShell route={route}>{pageFor(route)}</AppShell>
    </I18nProvider>
  )
}

export default function App() {
  const route = useRoute()
  return (
    <ErrorBoundary resetKey={JSON.stringify(route)}>
      <ProgressProvider>
        <LocalizedApp route={route} />
      </ProgressProvider>
    </ErrorBoundary>
  )
}
