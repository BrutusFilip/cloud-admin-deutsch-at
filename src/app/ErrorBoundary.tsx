import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  /** A new value (the address) clears the error, so navigating away recovers the app. */
  resetKey: string
  children: ReactNode
}

interface State {
  failed: boolean
  resetKey: string
}

const TEXT = {
  cs: {
    title: 'Tuto stránku se nepodařilo zobrazit',
    text: 'Uložený pokrok zůstal v prohlížeči beze změny. Zkuste se vrátit na Dnes nebo stránku načíst znovu.',
    today: 'Zpět na Dnes',
    reload: 'Načíst znovu',
  },
  de: {
    title: 'Diese Seite konnte nicht angezeigt werden',
    text: 'Der gespeicherte Fortschritt bleibt im Browser unverändert. Gehen Sie zurück zu „Heute“ oder laden Sie die Seite neu.',
    today: 'Zurück zu „Heute“',
    reload: 'Neu laden',
  },
}

/**
 * Last line of defence: an unexpected error while rendering shows a short
 * explanation with a way out instead of an empty page. A render error never
 * writes anything, so the stored progress is untouched.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false, resetKey: this.props.resetKey }

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Navigating elsewhere clears the error.
    return props.resetKey !== state.resetKey ? { failed: false, resetKey: props.resetKey } : null
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Cloud Admin Deutsch: rendering failed', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children
    const t = document.documentElement.lang.startsWith('de') ? TEXT.de : TEXT.cs
    return (
      <main className="page crash" id="main" tabIndex={-1}>
        <section className="sheet" role="alert">
          <h1>{t.title}</h1>
          <p>{t.text}</p>
          <div className="card-actions card-actions--row">
            <a className="btn btn--primary" href="#/">
              {t.today}
            </a>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              {t.reload}
            </button>
          </div>
        </section>
      </main>
    )
  }
}
