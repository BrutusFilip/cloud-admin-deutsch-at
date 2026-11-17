import type { StorageLike } from '../persistence'

/** localStorage stand-in for tests: counts writes and fails on demand (every key or one key). */
export class MemoryStorage implements StorageLike {
  data = new Map<string, string>()
  writes = 0
  failWith: string | null = null
  failKey: string | null = null

  get length(): number {
    return this.data.size
  }

  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    if (this.failWith && (this.failKey === null || this.failKey === key)) {
      const error = new Error('write failed')
      error.name = this.failWith
      throw error
    }
    this.writes += 1
    this.data.set(key, value)
  }

  removeItem(key: string): void {
    this.data.delete(key)
  }
}
