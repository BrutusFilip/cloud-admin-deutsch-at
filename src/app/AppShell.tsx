import { useEffect, useRef, type ReactNode } from 'react'
import { StorageBanner } from '../components/StorageBanner'
import { useMessages } from '../i18n'
import { useProgress } from '../state/progressContext'
import { UI_LANGUAGES } from '../storage/store'
import type { Route } from './router'

interface Props {
  route: Route
  children: ReactNode
}

/** Overview pages use the full width on large screens (two columns); study and settings pages keep one readable column. */
const WIDE: ReadonlySet<Route['name']> = new Set(['today', 'dictionary'])

/** Header, navigation (top on desktop, bottom on phones), main area and footer. */
export function AppShell({ route, children }: Props) {
  const m = useMessages()
  const { store, setUiLanguage } = useProgress()
  const key =
    route.name === 'entry' ? `entry:${route.id}` : route.name === 'interviewSession' ? `interview:${route.id}` : route.name
  const first = useRef(true)

  // On navigation: scroll to the top and move focus to the page title (not on the first load).
  // A lesson and an interview move focus themselves (to the card or the question).
  useEffect(() => {
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    if (key !== 'lesson' && !key.startsWith('interview:')) document.getElementById('page-title')?.focus({ preventScroll: true })
  }, [key])

  const section =
    route.name === 'entry'
      ? 'dictionary'
      : route.name === 'interviewSession'
        ? 'interview'
        : route.name === 'lesson' || route.name === 'settings'
          ? null
          : route.name
  const links = [
    { href: '#/', label: m.nav.today, name: 'today' },
    { href: '#/procvicovani', label: m.nav.practice, name: 'practice' },
    { href: '#/pohovor', label: m.nav.interview, name: 'interview' },
    { href: '#/slovnik', label: m.nav.dictionary, name: 'dictionary' },
  ] as const

  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        {m.skipToContent}
      </a>
      <header className="masthead">
        <div className="topbar">
          <a className="brand" href="#/">
            {m.appName}
          </a>
        </div>
        <nav className="nav" aria-label={m.nav.label}>
          <ul>
            {links.map((link) => (
              <li key={link.name}>
                <a href={link.href} aria-current={section === link.name ? 'page' : undefined}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <fieldset className="lang-switch">
          <legend className="sr-only">{m.language.label}</legend>
          {UI_LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              lang={language}
              aria-label={`${m.language.short[language]} – ${m.language[language]}`}
              aria-pressed={store.prefs.uiLanguage === language}
              onClick={() => setUiLanguage(language)}
            >
              {m.language.short[language]}
            </button>
          ))}
        </fieldset>
      </header>
      <main id="main" tabIndex={-1} className={WIDE.has(route.name) ? 'main main--wide' : 'main'}>
        <StorageBanner />
        {children}
      </main>
      <footer className="footer">
        <p>
          {m.footer} <a href="#/nastaveni">{m.nav.settings}</a>
        </p>
      </footer>
    </div>
  )
}
