/**
 * Keeps an answer field and its main action visible when a phone's on-screen
 * keyboard opens. The keyboard shrinks the visual viewport (`visualViewport`),
 * not always the layout viewport, so the browser alone may leave the button
 * under the keyboard. Only for touch screens; does nothing elsewhere.
 *
 * Keyboards open at different speeds, so every resize in the first moments after
 * the field gets focus is followed (not just the first one), and once more after
 * a short delay for keyboards that do not resize the visual viewport at all.
 */
const MARGIN = 12
const FALLBACK_MS = 400
const WATCH_MS = 1500

export function keepInView(field: HTMLElement | null, action: HTMLElement | null): void {
  if (!field || !action || typeof window === 'undefined') return
  if (!window.matchMedia?.('(pointer: coarse)').matches) return
  const vv = window.visualViewport

  const adjust = () => {
    const top = vv ? vv.offsetTop : 0
    const height = vv ? vv.height : window.innerHeight
    const f = field.getBoundingClientRect()
    const a = action.getBoundingClientRect()
    // Show the action below the field; never push the field above the visible area.
    const below = a.bottom + MARGIN - (top + height)
    const room = f.top - MARGIN - top
    const delta = Math.min(below, room)
    if (delta > 0) window.scrollBy({ top: delta, behavior: 'auto' })
  }

  let frame = 0
  const schedule = () => {
    window.cancelAnimationFrame(frame)
    frame = window.requestAnimationFrame(adjust)
  }
  const fallback = window.setTimeout(schedule, FALLBACK_MS)
  const stop = () => {
    vv?.removeEventListener('resize', schedule)
    window.clearTimeout(fallback)
    window.clearTimeout(watch)
    field.removeEventListener('blur', stop)
  }
  const watch = window.setTimeout(stop, WATCH_MS)
  vv?.addEventListener('resize', schedule)
  field.addEventListener('blur', stop)
}

/**
 * Shows the start of a result that has just appeared (a verdict, a revealed meaning). Its top
 * stays below the top edge of the screen, and as much of it as fits stays above whatever covers
 * the bottom: on phones the sticky rating or action bar of the card and the bottom navigation.
 * Where it is in view already (usually on a large screen), nothing moves.
 */
export function showResult(result: HTMLElement | null): void {
  if (!result || typeof window === 'undefined') return
  const r = result.getBoundingClientRect()
  const top = MARGIN
  const bottom = coveredFrom(result) - MARGIN
  if (r.top < top) {
    window.scrollBy({ top: r.top - top, behavior: 'auto' })
    return
  }
  const wanted = Math.min(r.height, bottom - top)
  const delta = Math.min(r.top + wanted - bottom, r.top - top)
  if (delta > 0) window.scrollBy({ top: delta, behavior: 'auto' })
}

/** Where the screen stops being free: the top of a sticky bar of the card or of the fixed navigation. */
function coveredFrom(el: HTMLElement): number {
  let limit = window.innerHeight
  const card = el.closest('.card')
  const bars = card ? card.querySelectorAll<HTMLElement>(':scope > .rating, :scope > .card-actions--sticky') : []
  for (const bar of bars) {
    if (getComputedStyle(bar).position === 'sticky') limit = Math.min(limit, bar.getBoundingClientRect().top)
  }
  const nav = document.querySelector<HTMLElement>('.nav')
  if (nav) {
    const style = getComputedStyle(nav)
    if (style.position === 'fixed' && style.display !== 'none') limit = Math.min(limit, nav.getBoundingClientRect().top)
  }
  return limit
}
