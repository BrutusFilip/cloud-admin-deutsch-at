import { test as base, expect, type BrowserContext, type Download, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

export { expect }

/** Key of the progress in localStorage (src/storage/store.ts). */
export const STORAGE_KEY = 'cloud-admin-deutsch-at:progress'

/** The parts of the stored progress (schema 5) that the tests read. */
export interface CardState {
  level: number
  due: string
  lastReviewed: string | null
  lastRating: string | null
  reviews: number
  againCount: number
}

export interface LogEntry {
  cardId: string
  verdict: string
  rating: string
}

export interface Stored {
  schemaVersion: number
  rev: number
  createdAt: string
  cards: Record<string, CardState>
  lesson: null | {
    id: string
    cards: string[]
    log: LogEntry[]
    pending: null | { cardId: string; verdict: string }
    finishedAt: string | null
  }
  interview: { attempts: Record<string, unknown[]>; ownExamples: Record<string, unknown>; session: unknown }
  prefs: { todayTopic: string; uiLanguage: string; speech: { enabled: boolean; voiceURI: string | null } }
  stats: { lessons: { completed: number; endedEarly: number } }
}

interface Guard {
  /** Watches a page of another browser profile as well. */
  watch(page: Page): void
}

/**
 * Every test fails on a console error or warning, an uncaught exception, a native
 * dialog, an HTTP error response or a request to another host than the preview server.
 */
export const test = base.extend<{ guard: Guard; newProfile: () => Promise<Page> }>({
  guard: [
    async ({ context }, provide) => {
      const problems: string[] = []
      const watch = (page: Page) => {
        page.on('console', (m) => {
          if (m.type() === 'error' || m.type() === 'warning') problems.push(`console.${m.type()}: ${m.text()}`)
        })
        page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
        page.on('dialog', (d) => {
          problems.push(`native dialog: ${d.type()} ${d.message()}`)
          void d.dismiss()
        })
        page.on('response', (r) => {
          if (r.status() >= 400) problems.push(`HTTP ${r.status()} ${r.url()}`)
        })
        page.on('request', (r) => {
          const url = new URL(r.url())
          if (/^https?:$/.test(url.protocol) && url.hostname !== 'localhost') problems.push(`external request: ${r.url()}`)
        })
      }
      context.on('page', watch)
      context.pages().forEach(watch)
      await provide({ watch })
      expect(problems, 'console errors, page errors, failed or external requests').toEqual([])
    },
    { auto: true },
  ],

  /** A page in a new, empty browser profile (its own storage), closed after the test. */
  newProfile: async ({ browser, baseURL, locale, timezoneId, viewport, guard }, provide) => {
    const opened: BrowserContext[] = []
    await provide(async () => {
      const context = await browser.newContext({ baseURL, locale, timezoneId, viewport })
      opened.push(context)
      context.on('page', guard.watch)
      return context.newPage()
    })
    for (const context of opened) await context.close()
  },
})

/** The stored progress, or null when the app has not saved anything. */
export async function readStore(page: Page): Promise<Stored | null> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
  return raw === null ? null : (JSON.parse(raw) as Stored)
}

/** Like readStore, for steps that need saved progress. */
export async function store(page: Page): Promise<Stored> {
  const data = await readStore(page)
  expect(data, 'the app has saved its progress').not.toBeNull()
  return data as Stored
}

/** The stored text exactly as it is (to prove that nothing was written). */
export function rawStore(page: Page): Promise<string | null> {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
}

/**
 * Opens `path` with fictional progress stored before the app reads it. An init script writes it
 * once in this tab (later reloads keep what the app saves); the hop over about:blank makes sure
 * a new document loads even when only the hash of the address changes.
 */
let seeds = 0
export async function seed(page: Page, data: unknown, path = './'): Promise<void> {
  seeds += 1
  await page.addInitScript(
    ([key, text, token]) => {
      if (location.protocol !== 'http:' || sessionStorage.getItem(token) !== null) return
      localStorage.setItem(key, text)
      sessionStorage.setItem(token, 'done')
    },
    [STORAGE_KEY, JSON.stringify(data), `e2e-seed-${seeds}`],
  )
  await page.goto('about:blank')
  await page.goto(path)
}

/** The browser's calendar day (YYYY-MM-DD), `offset` days from today. */
export function localDay(page: Page, offset = 0): Promise<string> {
  return page.evaluate((n) => {
    const d = new Date()
    d.setDate(d.getDate() + n)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, offset)
}

/** ID of the card on the screen ("access-v-006:write"). */
export async function cardOnScreen(page: Page): Promise<string> {
  const labelledBy = await page.locator('article.card').getAttribute('aria-labelledby')
  return (labelledBy ?? '').replace(/^prompt-/, '')
}

/** Flashcard: reveal and rate with the key (1–3). Writing or grammar: "Nevím" and continue (counts as "Znovu"). */
export async function answerAny(page: Page, key = '3'): Promise<void> {
  const reveal = page.getByRole('button', { name: /^Odkrýt řešení/ })
  if (await reveal.count()) {
    await reveal.click()
    await page.keyboard.press(key)
    return
  }
  await page.getByRole('button', { name: /^Nevím/ }).click()
  await page.getByRole('button', { name: /^Pokračovat/ }).first().click()
}

/** Answers every card with answerAny until the lesson summary appears. */
export async function finishLesson(page: Page, key = '3'): Promise<void> {
  const summary = page.getByRole('heading', { name: 'Výsledek lekce' })
  const next = page.getByRole('button', { name: /^(Odkrýt řešení|Nevím)/ }).first()
  for (let turn = 0; turn < 60; turn++) {
    await expect(next.or(summary)).toBeVisible()
    if (await summary.isVisible()) return
    await answerAny(page, key)
  }
  throw new Error('the lesson did not end within 60 answers')
}

/** Opens a dictionary entry and practises one of its cards (a lesson with this card only). */
export async function practise(page: Page, itemId: string, button: string): Promise<void> {
  await page.goto(`./#/slovnik/${itemId}`)
  await page.getByRole('button', { name: button }).click()
  await expect(page.locator('.lesson-title')).toContainText('Procvičení položky')
}

/** Reads a downloaded file as JSON. */
export async function downloadedJson(download: Download): Promise<unknown> {
  return JSON.parse(await readFile(await download.path(), 'utf8'))
}

/** An import file (the export format of version 1.0 and later). */
export function exportFile(data: unknown, overrides: Record<string, unknown> = {}): Buffer {
  return Buffer.from(
    JSON.stringify({
      format: 'cloud-admin-deutsch-at/progress',
      formatVersion: 1,
      appVersion: '1.0.0',
      contentVersion: '2026-11-11',
      exportedAt: '2026-11-10T18:00:00.000Z',
      data,
      ...overrides,
    }),
  )
}

/** Chooses a file in Nastavení → Pokrok a záloha → Načíst ze souboru. */
export async function upload(page: Page, name: string, content: Buffer): Promise<void> {
  await page.setInputFiles('#import-file', { name, mimeType: 'application/json', buffer: content })
}

/** Text with runs of white space squashed, as a reader sees it. */
export function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
