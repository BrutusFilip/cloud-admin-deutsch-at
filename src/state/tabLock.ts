/**
 * One tab edits the progress at a time.
 *
 * The Web Locks API grants a named lock to a single tab of the origin and
 * releases it by itself when that tab is closed or crashes – a flag in
 * localStorage could do neither atomically. The other tabs wait in the lock's
 * queue and show the progress read-only. The first tab in line takes over by
 * itself when the active tab goes away; "Pracovat v této kartě" takes the lock
 * at once (`steal`), and the tab that lost it becomes read-only.
 *
 * Without the Web Locks API (older browsers, pages served over plain HTTP from
 * another computer) every tab may write. The revision check in Persistence
 * then still keeps a stale tab from overwriting newer progress.
 */

export type TabRole = 'deciding' | 'active' | 'passive'

export const WRITER_LOCK_NAME = 'cloud-admin-deutsch-at:writer'

/** The part of `navigator.locks` this module uses (a fake one in tests). */
export interface LockManagerLike {
  request(
    name: string,
    options: { ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal },
    callback: (lock: unknown) => unknown,
  ): Promise<unknown>
}

export function browserLocks(): LockManagerLike | null {
  try {
    const locks = (globalThis.navigator as Navigator | undefined)?.locks
    return locks && typeof locks.request === 'function' ? (locks as unknown as LockManagerLike) : null
  } catch {
    return null
  }
}

export class WriterLock {
  private role: TabRole = 'deciding'
  private release: (() => void) | null = null
  private waiting: AbortController | null = null
  private stopped = false
  private readonly locks: LockManagerLike | null
  private readonly onRole: (role: TabRole) => void
  private readonly name: string

  constructor(locks: LockManagerLike | null, onRole: (role: TabRole) => void, name: string = WRITER_LOCK_NAME) {
    this.locks = locks
    this.onRole = onRole
    this.name = name
  }

  get supported(): boolean {
    return this.locks !== null
  }

  get current(): TabRole {
    return this.role
  }

  start(): void {
    if (!this.locks) {
      this.set('active')
      return
    }
    this.request({ ifAvailable: true })
  }

  /** "Pracovat v této kartě": take the lock from the active tab, which becomes read-only. */
  takeOver(): void {
    if (!this.locks || this.stopped || this.role === 'active') return
    this.waiting?.abort()
    this.waiting = null
    this.request({ steal: true })
  }

  stop(): void {
    this.stopped = true
    this.waiting?.abort()
    this.waiting = null
    this.release?.()
    this.release = null
  }

  private set(role: TabRole): void {
    if (this.stopped || role === this.role) return
    this.role = role
    this.onRole(role)
  }

  private request(options: { ifAvailable?: boolean; steal?: boolean; signal?: AbortSignal }): void {
    let granted = false
    this.locks!.request(this.name, options, (lock) => {
      if (lock === null) {
        // ifAvailable and another tab holds it: wait in line, read-only meanwhile.
        this.set('passive')
        this.queue()
        return undefined
      }
      granted = true
      return this.hold()
    }).then(
      () => undefined,
      () => {
        // A held lock that rejects was stolen by another tab; a request that was
        // never granted was aborted by take-over or stop and needs nothing.
        if (granted) this.afterLoss()
      },
    )
  }

  private hold(): Promise<void> | undefined {
    // Granted only after stop() (the page left, or React ran the effect twice in
    // development): give the lock back at once instead of holding it forever.
    if (this.stopped) return undefined
    this.waiting = null
    this.set('active')
    return new Promise<void>((resolve) => {
      this.release = resolve
    })
  }

  private queue(): void {
    if (this.stopped) return
    const controller = new AbortController()
    this.waiting = controller
    this.request({ signal: controller.signal })
  }

  private afterLoss(): void {
    this.release = null
    if (this.stopped) return
    this.set('passive')
    this.queue()
  }
}
