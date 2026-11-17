import {
  APP_KEY_PREFIX,
  BACKUP_KEY,
  createStore,
  parseStore,
  SCHEMA_VERSION,
  STORAGE_KEY,
  storedRevision,
  storedSchemaVersion,
  type Store,
} from './store'

/**
 * Browser persistence without surprises:
 * - storage unavailable → the app works in memory and says so;
 * - stored data unreadable (corrupt or from a newer version) → the app works
 *   in memory and never overwrites the stored data unless the learner
 *   explicitly chooses to (overwrite);
 * - a failed write is reported; the learner can retry, export or continue
 *   without saving;
 * - every write checks the stored revision first: a tab never overwrites
 *   progress saved meanwhile by another tab (it reports a conflict instead);
 * - before the first write of migrated data the original text is kept under
 *   BACKUP_KEY, so the data from before an update can be downloaded or restored.
 */

export interface StorageLike {
  readonly length: number
  key(index: number): string | null
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type LoadOutcome =
  | { status: 'fresh'; store: Store }
  | { status: 'loaded'; store: Store; migratedFrom: number | null }
  | { status: 'unavailable'; store: Store }
  | { status: 'corrupt'; store: Store; raw: string; reason: string; recoverable: { store: Store; dropped: number } | null }
  | { status: 'unsupported'; store: Store; raw: string; version: number }

export type SaveOutcome =
  /** keptOriginal: this write first stored the text from before the migration under BACKUP_KEY. */
  | { status: 'saved'; rev: number; keptOriginal?: true }
  | { status: 'skipped'; reason: 'memory' | 'blocked' }
  | { status: 'failed'; error: string }
  /** Another tab or version saved meanwhile (or removed the data): nothing was written. */
  | { status: 'conflict'; reason: 'changed' | 'removed' | 'newer' }

/** persistent = writes allowed · memory = no writes · blocked = unreadable data present, no writes */
export type Mode = 'persistent' | 'memory' | 'blocked'

/** The stored text from before the last migration, kept until a reset or until it is deleted. */
export interface StoredBackup {
  savedAt: string
  fromVersion: number
  raw: string
}

export function getBrowserStorage(): StorageLike | null {
  try {
    const storage = globalThis.localStorage
    if (!storage) return null
    storage.getItem(STORAGE_KEY)
    return storage
  } catch {
    return null
  }
}

function errorName(error: unknown): string {
  if (error instanceof Error) return error.name || 'Error'
  return 'Error'
}

export class Persistence {
  private mode: Mode = 'memory'
  private readonly storage: StorageLike | null
  private readonly key: string
  /** Revision this tab last read or wrote; a write expects to find exactly this one. */
  private rev = 0
  /** Original text of migrated data, written to BACKUP_KEY just before the first write. */
  private pendingBackup: StoredBackup | null = null

  constructor(storage: StorageLike | null, key: string = STORAGE_KEY) {
    this.storage = storage
    this.key = key
  }

  get currentMode(): Mode {
    return this.mode
  }

  get hasStorage(): boolean {
    return this.storage !== null
  }

  get revision(): number {
    return this.rev
  }

  load(now: Date = new Date()): LoadOutcome {
    this.pendingBackup = null
    if (!this.storage) {
      this.mode = 'memory'
      return { status: 'unavailable', store: createStore(now) }
    }
    let raw: string | null
    try {
      raw = this.storage.getItem(this.key)
    } catch {
      this.mode = 'memory'
      return { status: 'unavailable', store: createStore(now) }
    }
    if (raw === null) {
      this.mode = 'persistent'
      this.rev = 0
      return { status: 'fresh', store: createStore(now) }
    }
    const parsed = parseStore(raw, now)
    if (parsed.ok) {
      this.mode = 'persistent'
      this.rev = parsed.store.rev
      if (parsed.migratedFrom !== null) this.pendingBackup = { savedAt: now.toISOString(), fromVersion: parsed.migratedFrom, raw }
      return { status: 'loaded', store: parsed.store, migratedFrom: parsed.migratedFrom }
    }
    this.mode = 'blocked'
    if (parsed.kind === 'unsupported') {
      return { status: 'unsupported', store: createStore(now), raw, version: parsed.version }
    }
    return { status: 'corrupt', store: createStore(now), raw, reason: parsed.reason, recoverable: parsed.recoverable }
  }

  /** Regular save – only in persistent mode and only over the revision this tab knows. */
  save(store: Store): SaveOutcome {
    if (this.mode !== 'persistent') return { status: 'skipped', reason: this.mode === 'blocked' ? 'blocked' : 'memory' }
    const conflict = this.conflict()
    if (conflict) return { status: 'conflict', reason: conflict }
    return this.write(store)
  }

  /** Explicit choice of the learner (import, recovery): replace whatever is stored, including unreadable data. */
  overwrite(store: Store): SaveOutcome {
    if (!this.storage) return { status: 'failed', error: 'StorageUnavailable' }
    let stored: string | null = null
    try {
      stored = this.storage.getItem(this.key)
    } catch {
      stored = null
    }
    const base = stored === null ? 0 : (storedRevision(stored) ?? 0)
    this.rev = Math.max(this.rev, base)
    this.pendingBackup = null
    const result = this.write(store)
    if (result.status === 'saved') this.mode = 'persistent'
    return result
  }

  /**
   * Explicit reset: removes exactly this app's keys (progress, backup) and
   * nothing else in the browser's storage. The next change writes a fresh store.
   */
  clear(): SaveOutcome {
    if (!this.storage) return { status: 'skipped', reason: 'memory' }
    try {
      const keys: string[] = []
      for (let i = 0; i < this.storage.length; i += 1) {
        const key = this.storage.key(i)
        if (key !== null && key.startsWith(APP_KEY_PREFIX)) keys.push(key)
      }
      for (const key of keys) this.storage.removeItem(key)
      this.mode = 'persistent'
      this.rev = 0
      this.pendingBackup = null
      return { status: 'saved', rev: 0 }
    } catch (error) {
      return { status: 'failed', error: errorName(error) }
    }
  }

  /** Stop writing for the rest of the session. */
  useMemoryOnly(): void {
    if (this.mode === 'persistent') this.mode = 'memory'
  }

  /** Re-enable writes after "continue without saving" (only when the stored data is readable). */
  resumeSaving(): void {
    if (this.mode === 'memory' && this.storage) this.mode = 'persistent'
  }

  readRaw(): string | null {
    try {
      return this.storage?.getItem(this.key) ?? null
    } catch {
      return null
    }
  }

  readBackup(): StoredBackup | null {
    try {
      const raw = this.storage?.getItem(BACKUP_KEY) ?? null
      if (raw === null) return null
      const value: unknown = JSON.parse(raw)
      if (typeof value !== 'object' || value === null) return null
      const { savedAt, fromVersion, raw: original } = value as Record<string, unknown>
      if (typeof savedAt !== 'string' || typeof fromVersion !== 'number' || typeof original !== 'string') return null
      return { savedAt, fromVersion, raw: original }
    } catch {
      return null
    }
  }

  removeBackup(): boolean {
    try {
      this.storage?.removeItem(BACKUP_KEY)
      return true
    } catch {
      return false
    }
  }

  /** What is stored now, without validating it: used to tell a conflict apart from a newer version. */
  storedVersion(): number | null {
    const raw = this.readRaw()
    return raw === null ? null : storedSchemaVersion(raw)
  }

  private conflict(): 'changed' | 'removed' | 'newer' | null {
    let raw: string | null
    try {
      raw = this.storage!.getItem(this.key)
    } catch {
      return null // a read error is reported by the write that follows
    }
    if (raw === null) return this.rev > 0 ? 'removed' : null
    const version = storedSchemaVersion(raw)
    if (version !== null && version > SCHEMA_VERSION) return 'newer'
    // Data from before schema 5 has no revision yet: it counts as revision 0.
    const rev = storedRevision(raw) ?? (version !== null && version < SCHEMA_VERSION ? 0 : null)
    return rev === this.rev ? null : 'changed'
  }

  private write(store: Store): SaveOutcome {
    const rev = this.rev + 1
    let keptOriginal = false
    try {
      if (this.pendingBackup) {
        this.storage!.setItem(BACKUP_KEY, JSON.stringify(this.pendingBackup))
        this.pendingBackup = null
        keptOriginal = true
      }
      this.storage!.setItem(this.key, JSON.stringify({ ...store, rev }))
      this.rev = rev
      return keptOriginal ? { status: 'saved', rev, keptOriginal: true } : { status: 'saved', rev }
    } catch (error) {
      return { status: 'failed', error: errorName(error) }
    }
  }
}
