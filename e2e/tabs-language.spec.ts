import { lessonStore } from './data.ts'
import { cardOnScreen, expect, localDay, practise, seed, store, test } from './fixtures.ts'

test('přepnutí CZ/DE zachová rozpracovanou lekci i rozepsanou odpověď', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).click()
  const first = await cardOnScreen(page)
  const language = page.locator('.lang-switch')

  // A revealed card waiting for its rating stays as it was; only the interface changes.
  await language.getByRole('button', { name: 'DE – Deutsch' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de-AT')
  await expect(page.locator('.lesson-position')).toHaveText('Karte 1 von 10')
  expect(await cardOnScreen(page)).toBe(first)
  await expect(page.locator('.answer-cz')).toBeVisible()
  await expect(page.locator('.rate .rate-label')).toHaveText(['Nochmal', 'Schwer', 'Kann ich'])
  await page.getByRole('button', { name: /^Kann ich/ }).click()
  await expect(page.locator('.lesson-position')).toHaveText('Karte 2 von 10')

  await language.getByRole('button', { name: 'CZ – Česky' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'cs')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 2 z 10')
  let data = await store(page)
  expect(data.prefs.uiLanguage).toBe('cs')
  expect(data.lesson?.log.map((e) => [e.cardId, e.rating])).toEqual([[first, 'good']])

  // The language survives a reload, the lesson goes on at the same card.
  await language.getByRole('button', { name: 'DE – Deutsch' }).click()
  const second = await cardOnScreen(page)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'de-AT')
  await expect(page.locator('.lesson-position')).toHaveText('Karte 2 von 10')
  expect(await cardOnScreen(page)).toBe(second)

  // Text typed but not checked yet stays in the field while the language changes.
  await language.getByRole('button', { name: 'CZ – Česky' }).click()
  await practise(page, 'access-v-006', 'Procvičit psaní')
  await page.getByLabel('Napište německy').fill('die Authentif')
  await language.getByRole('button', { name: 'DE – Deutsch' }).click()
  await expect(page.getByLabel('Auf Deutsch schreiben')).toHaveValue('die Authentif')
  await language.getByRole('button', { name: 'CZ – Česky' }).click()
  await expect(page.getByLabel('Napište německy')).toHaveValue('die Authentif')
  data = await store(page)
  expect(data.prefs.uiLanguage).toBe('cs')
})

const FLASH = 'network-v-001:flashcard'
const FLASH2 = 'network-v-002:flashcard'
const WRITE = 'access-v-006:write'

test('dvě karty prohlížeče: zapisuje jen jedna, druhá ukazuje uložený stav a může zápis převzít', async ({ page, context }) => {
  await page.goto('./')
  await seed(page, lessonStore(await localDay(page), [FLASH, WRITE, FLASH2]), './#/lekce')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 1 z 3')

  const second = await context.newPage()
  await second.goto('./#/lekce')
  const banner = second.locator('.banner--tab')
  await expect(banner).toContainText('Tato karta je jen pro čtení')
  await expect(page.locator('.banner')).toHaveCount(0)

  // A change in the read-only tab is refused and said so; nothing is stored.
  await second.getByRole('button', { name: /^Odkrýt řešení/ }).click()
  await expect(banner.locator('.form-error')).toHaveText('Tato změna se v této kartě neuložila.')
  expect((await store(page)).lesson?.pending).toBeNull()

  // The writing tab saves; the read-only tab follows the stored state.
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).click()
  await page.locator('button.rate--good').click()
  await expect(page.locator('.lesson-position')).toHaveText('Karta 2 z 3')
  await expect(second.locator('.lesson-position')).toHaveText('Karta 2 z 3')
  await expect(second.locator('.prompt-cz')).toHaveText('metoda ověřování')

  // A reload keeps the second tab read-only.
  await second.reload()
  await expect(banner).toBeVisible()

  // Hand-over: the second tab writes, the first becomes read-only and follows.
  await banner.getByRole('button', { name: 'Pracovat v této kartě' }).click()
  await expect(banner).toHaveCount(0)
  await expect(page.locator('.banner--tab')).toContainText('Tato karta je jen pro čtení')
  await second.getByLabel('Napište německy').fill('die Authentifizierungsmethode')
  await second.keyboard.press('Enter')
  await expect(second.locator('.feedback--ok')).toBeVisible()
  await second.keyboard.press('3')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 3 z 3')
  const data = await store(second)
  expect(data.lesson?.log.map((e) => [e.cardId, e.verdict, e.rating])).toEqual([
    [FLASH, 'self', 'good'],
    [WRITE, 'correct', 'good'],
  ])
  expect(data.cards[FLASH].reviews).toBe(1)
})
