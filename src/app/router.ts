import { useEffect, useMemo, useState } from 'react'

/** Hash routes work on GitHub Pages without server configuration (no 404 on reload). */
export type Route =
  | { name: 'today' }
  | { name: 'lesson' }
  | { name: 'practice' }
  | { name: 'dictionary'; q: string; topic: string; level: string; kind: string }
  | { name: 'entry'; id: string }
  | { name: 'interview' }
  | { name: 'interviewSession'; id: string }
  | { name: 'settings' }

/** A path segment of the address. A malformed escape (e.g. a cut-off "%E0") stays as typed instead of crashing the app. */
function segment(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/'
  const [path = '/', query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  switch (parts[0]) {
    case undefined:
      return { name: 'today' }
    case 'lekce':
      return { name: 'lesson' }
    case 'procvicovani':
      return { name: 'practice' }
    case 'pohovor':
      if (parts[1]) return { name: 'interviewSession', id: segment(parts[1]) }
      return { name: 'interview' }
    case 'nastaveni':
      return { name: 'settings' }
    case 'slovnik':
      if (parts[1]) return { name: 'entry', id: segment(parts[1]) }
      return {
        name: 'dictionary',
        q: params.get('q') ?? '',
        topic: params.get('tema') ?? 'all',
        level: params.get('uroven') ?? 'all',
        kind: params.get('druh') ?? 'all',
      }
    default:
      return { name: 'today' }
  }
}

export const TODAY_HASH = '#/'
export const LESSON_HASH = '#/lekce'
export const PRACTICE_HASH = '#/procvicovani'
export const INTERVIEW_HASH = '#/pohovor'
export const SETTINGS_HASH = '#/nastaveni'

export function interviewHash(id: string): string {
  return `#/pohovor/${encodeURIComponent(id)}`
}

let entryReturnHash: string | null = null

/** Where a dictionary entry opened from an interview leads back to (until the dictionary itself is visited). */
export function setEntryReturn(hash: string | null): void {
  entryReturnHash = hash
}

export function entryReturn(): string | null {
  return entryReturnHash
}

export interface DictionaryState {
  q: string
  topic: string
  level: string
  kind: string
}

export function dictionaryHash(state: DictionaryState): string {
  const params = new URLSearchParams()
  if (state.q.trim() !== '') params.set('q', state.q)
  if (state.topic !== 'all') params.set('tema', state.topic)
  if (state.level !== 'all') params.set('uroven', state.level)
  if (state.kind !== 'all') params.set('druh', state.kind)
  const query = params.toString()
  return query ? `#/slovnik?${query}` : '#/slovnik'
}

let rememberedDictionaryHash = '#/slovnik'

/** The dictionary address with the learner's last search, for the "back" link of an entry. */
export function lastDictionaryHash(): string {
  return rememberedDictionaryHash
}

/** Visiting the dictionary also ends "back to the interview" for the entries opened from it. */
export function rememberDictionaryHash(hash: string): void {
  rememberedDictionaryHash = hash
  entryReturnHash = null
}

export function entryHash(id: string): string {
  return `#/slovnik/${encodeURIComponent(id)}`
}

export function navigate(hash: string): void {
  if (window.location.hash !== hash) window.location.hash = hash
}

/** Fired after replaceHash, which (unlike a link) does not fire `hashchange`. */
const REPLACED = 'app:hash-replaced'

/** Updates the address without a new history entry (e.g. while typing a search). */
export function replaceHash(hash: string): void {
  if (window.location.hash === hash) return
  window.history.replaceState(null, '', hash)
  window.dispatchEvent(new Event(REPLACED))
}

/** The current route; follows links, back/forward and replaced addresses alike. */
export function useRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    window.addEventListener(REPLACED, onChange)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener(REPLACED, onChange)
    }
  }, [])
  return useMemo(() => parseHash(hash), [hash])
}
