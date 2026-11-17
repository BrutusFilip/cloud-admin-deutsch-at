import { describe, expect, it } from 'vitest'
import { WriterLock, type LockManagerLike, type TabRole } from './tabLock'

/**
 * `npm run test:reload` – one tab writes at a time. The fake below follows the
 * Web Locks API for one lock: a queue, `ifAvailable`, `steal`, `signal`, and a
 * lock that is released when its tab disappears.
 */

interface Request {
  callback: (lock: unknown) => unknown
  resolve: (value: unknown) => void
  reject: (error: unknown) => void
}

class FakeLocks implements LockManagerLike {
  holder: Request | null = null
  queue: Request[] = []

  request(_name: string, options: { ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal }, callback: (lock: unknown) => unknown) {
    return new Promise<unknown>((resolve, reject) => {
      const request: Request = { callback, resolve, reject }
      if (options.steal) {
        const old = this.holder
        this.holder = null
        old?.reject(new DOMException('The lock was stolen.', 'AbortError'))
        this.grant(request)
        return
      }
      if (options.ifAvailable && (this.holder || this.queue.length > 0)) {
        Promise.resolve(callback(null)).then(resolve, reject)
        return
      }
      if (!this.holder && this.queue.length === 0) {
        this.grant(request)
        return
      }
      this.queue.push(request)
      options.signal?.addEventListener('abort', () => {
        const i = this.queue.indexOf(request)
        if (i >= 0) {
          this.queue.splice(i, 1)
          reject(new DOMException('Aborted.', 'AbortError'))
        }
      })
    })
  }

  /** The tab holding the lock is closed or crashes: the browser releases its lock, nothing of it runs any more. */
  crashHolder(): void {
    this.holder = null
    this.next()
  }

  private grant(request: Request): void {
    this.holder = request
    Promise.resolve(request.callback({ name: 'writer' })).then(
      (value) => this.finish(request, () => request.resolve(value)),
      (error) => this.finish(request, () => request.reject(error)),
    )
  }

  private finish(request: Request, settle: () => void): void {
    if (this.holder !== request) return
    this.holder = null
    settle()
    this.next()
  }

  private next(): void {
    const request = this.queue.shift()
    if (request) this.grant(request)
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

function tab(locks: LockManagerLike | null) {
  const roles: TabRole[] = []
  const lock = new WriterLock(locks, (role) => roles.push(role))
  return { lock, roles }
}

describe('one tab writes at a time', () => {
  it('makes the first tab active and a second, refreshed or not, read-only', async () => {
    const locks = new FakeLocks()
    const a = tab(locks)
    const b = tab(locks)
    a.lock.start()
    await flush()
    b.lock.start()
    await flush()
    expect(a.lock.current).toBe('active')
    expect(b.lock.current).toBe('passive')
    // Refreshing the second tab: the old page goes away, the new one is read-only again.
    b.lock.stop()
    const b2 = tab(locks)
    b2.lock.start()
    await flush()
    expect(a.lock.current).toBe('active')
    expect(b2.lock.current).toBe('passive')
  })

  it('hands writing over on request; the other tab becomes read-only', async () => {
    const locks = new FakeLocks()
    const a = tab(locks)
    const b = tab(locks)
    a.lock.start()
    b.lock.start()
    await flush()
    b.lock.takeOver()
    await flush()
    expect(b.lock.current).toBe('active')
    expect(a.lock.current).toBe('passive')
    expect(a.roles).toEqual(['active', 'passive'])
  })

  it('a waiting tab takes over by itself when the active tab crashes', async () => {
    const locks = new FakeLocks()
    const a = tab(locks)
    const b = tab(locks)
    a.lock.start()
    b.lock.start()
    await flush()
    locks.crashHolder()
    await flush()
    expect(b.lock.current).toBe('active')
    expect(b.roles).toEqual(['passive', 'active'])
  })

  it('a closed tab releases the lock for the next one', async () => {
    const locks = new FakeLocks()
    const a = tab(locks)
    const b = tab(locks)
    a.lock.start()
    b.lock.start()
    await flush()
    a.lock.stop()
    await flush()
    expect(b.lock.current).toBe('active')
  })

  it('a tab that stops before it gets the lock does not keep it (React runs effects twice in development)', async () => {
    const locks = new FakeLocks()
    // The browser grants a lock asynchronously; this wrapper does the same.
    const later: LockManagerLike = {
      request: (name, options, callback) =>
        new Promise((resolve, reject) => setTimeout(() => locks.request(name, options, callback).then(resolve, reject), 0)),
    }
    const first = tab(later)
    first.lock.start()
    first.lock.stop()
    const second = tab(later)
    second.lock.start()
    await flush()
    await flush()
    expect(second.lock.current).toBe('active')
    expect(first.roles).toEqual([])
    expect(locks.holder).not.toBeNull()
  })

  it('without Web Locks every tab may write (the revision check guards the data)', () => {
    const a = tab(null)
    a.lock.start()
    expect(a.lock.current).toBe('active')
    expect(a.lock.supported).toBe(false)
  })
})
