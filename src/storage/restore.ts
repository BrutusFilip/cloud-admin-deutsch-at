import { pruneLesson } from '../domain/lesson'
import type { Store } from './store'

/**
 * A store read from the browser or from an import, made ready for this
 * version of the content: an unfinished lesson keeps its place, cards that
 * no longer exist leave its queue. Card progress itself is never changed.
 */
export function prepareStore(store: Store, knownCardIds: ReadonlySet<string>, now: Date): Store {
  if (!store.lesson) return store
  return { ...store, lesson: pruneLesson(store.lesson, knownCardIds, now) }
}
