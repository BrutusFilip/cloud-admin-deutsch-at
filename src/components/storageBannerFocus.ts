/** The storage message at the top of the page (StorageBanner) has this id. */
export const STORAGE_BANNER_ID = 'storage-banner'

/** Scrolls to the storage message and moves focus to it (used by its pointer and by Settings). */
export function showStorageBanner(): void {
  const banner = document.getElementById(STORAGE_BANNER_ID)
  if (!banner) return
  banner.scrollIntoView({ block: 'start' })
  banner.focus({ preventScroll: true })
}
