import type { Locator, Page } from '@playwright/test'
import { progressStore } from './data.ts'
import { expect, localDay, seed, test } from './fixtures.ts'

// Runs in the phone projects: "mobile" (Chromium, 360 × 800, touch) and, with E2E_BROWSERS=webkit,
// "mobile-webkit" (iPhone 13, 390 × 664). Limits come from the viewport of the project.

const noSideways = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)

function screen(page: Page) {
  const size = page.viewportSize()
  expect(size, 'the project sets a viewport').not.toBeNull()
  return size as { width: number; height: number }
}

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  expect(b, 'element is laid out').not.toBeNull()
  return b as { x: number; y: number; width: number; height: number }
}

test('telefon: lekce dotykem s hodnocením v dosahu palce, dialog a složené filtry', async ({ page }) => {
  await page.goto('./')
  const view = screen(page)
  expect(await noSideways(page)).toBe(true)
  const nav = await box(page.getByRole('navigation', { name: 'Hlavní navigace' }))
  expect(nav.y + nav.height, 'navigation at the bottom of the screen').toBeGreaterThanOrEqual(view.height - 1)

  await page.getByLabel('Téma', { exact: true }).selectOption('career')
  await page.getByRole('button', { name: 'Začít trénink' }).tap()
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).tap()
  // The rating sits above the navigation, inside the screen, each choice at least 44 px tall.
  for (const rate of await page.locator('button.rate').all()) {
    const r = await box(rate)
    expect(r.height).toBeGreaterThanOrEqual(44)
    expect(r.y + r.height).toBeLessThanOrEqual(nav.y + 1)
  }
  expect(await noSideways(page)).toBe(true)
  await page.getByRole('button', { name: /^Umím/ }).tap()
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).tap()
  await page.getByRole('button', { name: /^Umím/ }).tap()

  // Writing: the field and the letter bar work by touch; the feedback keeps long words on screen.
  const field = page.getByLabel('Napište německy')
  await field.tap()
  await field.pressSequentially('Ich k')
  await page.getByRole('button', { name: 'Vložit ö', exact: true }).tap()
  await expect(field).toHaveValue('Ich kö')
  await field.pressSequentially('nnte ab Janner beginnen')
  await page.getByRole('button', { name: 'Zkontrolovat' }).tap()
  await expect(page.locator('.feedback--error .verdict')).toContainText('Chyba')
  expect(await noSideways(page)).toBe(true)
  const next = await box(page.getByRole('button', { name: 'Pokračovat – karta se vrátí' }))
  expect(next.y + next.height).toBeLessThanOrEqual(view.height)

  // A dialog fits the screen and closes by touch.
  await seed(page, progressStore(await localDay(page)), './#/nastaveni')
  await page.getByRole('button', { name: 'Smazat pokrok…' }).tap()
  const dialog = page.getByRole('dialog', { name: 'Smazat veškerý pokrok?' })
  await dialog.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)))
  const d = await box(dialog)
  expect(d.x).toBeGreaterThanOrEqual(0)
  expect(d.x + d.width).toBeLessThanOrEqual(view.width)
  expect(d.y + d.height).toBeLessThanOrEqual(view.height)
  await dialog.getByRole('button', { name: 'Zpět' }).tap()
  await expect(dialog).toHaveCount(0)

  // Dictionary: the filters fold away behind one button that names how many are active.
  await page.goto('./#/slovnik?tema=network&druh=vocab')
  const toggle = page.getByRole('button', { name: 'Filtry (2)' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByLabel('Téma', { exact: true })).toBeHidden()
  await toggle.tap()
  await expect(page.getByLabel('Téma', { exact: true })).toBeVisible()
  expect(await noSideways(page)).toBe(true)
})

test.describe('nízký telefon (375 × 553, Safari s lištami)', () => {
  test.use({ viewport: { width: 375, height: 553 } })

  /** The start of the element is on screen and not under the sticky bar of the card or the navigation. */
  const shown = (page: Page, selector: string) =>
    page.locator(selector).first().evaluate((el) => {
      const r = el.getBoundingClientRect()
      const card = el.closest('.card')
      const bars = card ? [...card.querySelectorAll(':scope > .rating, :scope > .card-actions--sticky')] : []
      const covers = bars.filter((b) => getComputedStyle(b).position === 'sticky').map((b) => b.getBoundingClientRect().top)
      const nav = document.querySelector('.nav')
      if (nav && getComputedStyle(nav).display !== 'none') covers.push(nav.getBoundingClientRect().top)
      return r.top >= 0 && r.top + Math.min(r.height, 24) <= Math.min(innerHeight, ...covers)
    })

  test('výsledek po odkrytí a po kontrole je vidět nad lištou hodnocení', async ({ page }) => {
    await page.goto('./#/slovnik/career-v-001')
    await page.getByRole('button', { name: 'Procvičit kartičku' }).tap()
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.getByRole('button', { name: /^Odkrýt řešení/ }).tap()
    await expect(page.locator('.answer-cz')).toBeVisible()
    await expect.poll(() => shown(page, '.answer-cz'), { message: 'revealed meaning above the rating bar' }).toBe(true)

    await page.goto('./#/slovnik/network-g-002')
    await page.getByRole('button', { name: 'Procvičit úlohu' }).tap()
    await page.getByLabel('Doplňte mezeru').fill('wurden')
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.getByRole('button', { name: 'Zkontrolovat' }).tap()
    await expect(page.locator('.feedback .verdict')).toContainText('Chyba')
    await expect.poll(() => shown(page, '.feedback .verdict'), { message: 'verdict on screen' }).toBe(true)

    await page.goto('./#/slovnik/career-s-001')
    await page.getByRole('button', { name: 'Procvičit psaní' }).tap()
    await page.getByLabel('Napište německy').fill('Ich konnte ab Janner beginnen')
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.getByRole('button', { name: 'Zkontrolovat' }).tap()
    await expect.poll(() => shown(page, '.feedback .verdict'), { message: 'verdict on screen' }).toBe(true)
  })
})
