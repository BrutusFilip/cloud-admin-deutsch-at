import { installFakeSpeech } from './fakeSpeech.ts'
import { expect, squash, store, test } from './fixtures.ts'
import type { Page } from '@playwright/test'

const speech = (page: Page) => page.evaluate(() => window.__speech ?? { spoken: [], cancels: 0, overlaps: 0 })
const speaking = (page: Page) => page.evaluate(() => speechSynthesis.speaking || speechSynthesis.pending)

test('celý pohovor skončí souhrnem sebehodnocení, který přežije reload', async ({ page }) => {
  await page.goto('./#/pohovor')
  await page.getByRole('radio', { name: /Představení a motivace/ }).check()
  await page.getByRole('button', { name: 'Začít pohovor' }).click()
  await expect(page).toHaveURL(/#\/pohovor\/motivation$/)

  // Přímá odpověď, Struktura, Slovní zásoba, Doplňující otázka for each of the three questions
  const answers = [
    ['Ano', 'Ano', 'Částečně', 'Ano'],
    ['Ano', 'Ne', 'Ano', 'Ano'],
    ['Částečně', 'Ano', 'Ano', 'Ano'],
  ]
  for (const [n, values] of answers.entries()) {
    await expect(page.locator('.lesson-position')).toHaveText(new RegExp(`^Otázka ${n + 1} z 3`))
    await expect(page.locator('#interview-prompt')).toBeFocused()
    await page.getByRole('button', { name: 'Pokračovat na doplňující otázku' }).click()
    await page.getByRole('button', { name: 'Zobrazit vzorovou odpověď' }).click()
    await expect(page.locator('.interview-review .chip--illustrative').first()).toHaveText('Ilustrační')
    const criteria = page.locator('fieldset.self-check')
    for (const [i, value] of values.entries()) await criteria.nth(i).getByRole('radio', { name: value, exact: true }).check()
    await page.getByRole('button', { name: /^Uložit a / }).click()
  }

  const title = page.getByRole('heading', { name: 'Souhrn pohovoru', level: 1 })
  await expect(title).toBeFocused()
  await expect(page.locator('.interview-answered')).toHaveText('Zodpovězené otázky: 3 z 3')
  const table = async () => {
    const rows: Record<string, string[]> = {}
    for (const row of await page.locator('.check-table tbody tr').all()) {
      rows[squash(await row.locator('th').innerText())] = (await row.locator('td').allInnerTexts()).map(squash)
    }
    return rows
  }
  const expected = {
    'Přímá odpověď': ['2', '1', '0'],
    Struktura: ['2', '0', '1'],
    'Slovní zásoba': ['2', '1', '0'],
    'Doplňující otázka': ['3', '0', '0'],
  }
  expect(await table()).toEqual(expected)
  await expect(page.locator('.focus-list')).toContainText('Struktura')
  expect(Object.keys((await store(page)).interview.attempts).sort()).toEqual(['intro-i-001', 'intro-i-002', 'intro-i-003'])

  await page.reload()
  await expect(title).toBeVisible()
  expect(await table()).toEqual(expected)
})

test('Incident za 5 kroků skončí výsledkem výzvy po krocích', async ({ page }) => {
  await page.goto('./')
  await page.locator('.challenge-entry input[name="challenge-case"]').first().check()
  await page.getByRole('button', { name: 'Spustit výzvu' }).click()
  await expect(page.locator('.lesson-title')).toContainText('Incident za 5 kroků')
  const position = page.locator('.lesson-position')
  const next = page.getByRole('button', { name: 'Pokračovat', exact: true })

  // 1 – a wrong choice: feedback and the reason right away
  await expect(position).toHaveText(/^Krok 1 z 5/)
  await page.locator('label.choice').first().click()
  await page.getByRole('button', { name: 'Zkontrolovat' }).click()
  await expect(page.locator('.feedback--error .verdict')).toContainText('Chyba')
  await expect(page.locator('.explanation').first()).toHaveText(/^Proč/)
  await next.click()
  // 2 – "Nevím"
  await expect(position).toHaveText(/^Krok 2 z 5/)
  await page.getByRole('button', { name: /^Nevím/ }).click()
  await next.click()
  // 3 – the right word order
  await expect(position).toHaveText(/^Krok 3 z 5/)
  for (const word of ['das Zertifikat', 'abgelaufen', 'ist']) {
    await page.locator('.token-bank').getByRole('button', { name: new RegExp(`^(\\d+\\. ?)?${word}$`) }).click()
  }
  await page.getByRole('button', { name: 'Zkontrolovat' }).click()
  await expect(page.locator('.feedback--ok')).toBeVisible()
  await page.keyboard.press('3')
  // 4 – the right gap
  await expect(position).toHaveText(/^Krok 4 z 5/)
  await page.getByLabel('Doplňte mezeru').fill('Könnten')
  await page.keyboard.press('Enter')
  await expect(page.locator('.feedback--ok')).toBeVisible()
  await page.keyboard.press('3')
  // 5 – "Nevím"
  await expect(position).toHaveText(/^Krok 5 z 5/)
  await page.getByRole('button', { name: /^Nevím/ }).click()
  await next.click()

  const result = page.getByRole('heading', { name: 'Výsledek výzvy' })
  await expect(result).toBeFocused()
  const outcomes = ['chyba', 'řešení odhaleno', 'správně', 'správně', 'řešení odhaleno']
  await expect(page.locator('.challenge-step-outcome')).toHaveText(outcomes)
  await expect(page.locator('.challenge-score')).toHaveText('Napoprvé správně: 2 z 5 (40 %)', { useInnerText: true })
  await expect(page.getByRole('button', { name: 'Zopakovat chyby (3)' })).toBeVisible()
  await page.reload()
  await expect(page.locator('.challenge-step-outcome')).toHaveText(outcomes)
})

test('odchod z otázky zastaví časovač i předčítání', async ({ page }) => {
  await page.addInitScript(installFakeSpeech)
  await page.clock.install()
  await page.goto('./#/pohovor/vpn-incident')
  await page.getByRole('button', { name: 'Začít pohovor' }).click()
  const timer = page.locator('.timer-value')
  await expect(timer).toHaveText('1:30')
  await page.getByRole('button', { name: 'Spustit časovač' }).click()
  await page.clock.fastForward(10_000)
  await expect(timer).toHaveText('1:20')

  // Read aloud only on a click; a second start replaces the first, nothing is queued.
  expect((await speech(page)).spoken).toEqual([])
  const read = page.getByRole('button', { name: 'Přečíst otázku nahlas' })
  const stop = page.getByRole('button', { name: 'Zastavit předčítání' })
  await read.click()
  await stop.click()
  await read.click()
  await expect(stop).toBeVisible()
  await expect.poll(() => speaking(page)).toBe(true)
  const before = await speech(page)
  expect(before.spoken).toHaveLength(2)
  expect(before.overlaps).toBe(0)

  // Leaving for the dictionary cancels the voice and stops the timer.
  const nav = page.getByRole('navigation', { name: 'Hlavní navigace' })
  await nav.getByRole('link', { name: 'Slovník' }).click()
  await expect(page.getByRole('heading', { name: 'Slovník', level: 1 })).toBeVisible()
  expect((await speech(page)).cancels).toBeGreaterThan(before.cancels)
  expect(await speaking(page)).toBe(false)
  await page.clock.fastForward(120_000)

  await nav.getByRole('link', { name: 'Pohovor' }).click()
  await page.locator('.resume').getByRole('button', { name: 'Pokračovat v pohovoru' }).click()
  await expect(timer).toHaveText('1:30')
  await expect(page.getByRole('button', { name: 'Spustit časovač' })).toBeVisible()
  await page.clock.fastForward(5_000)
  await expect(timer).toHaveText('1:30')

  // Moving on to the follow-up stops both as well.
  await page.getByRole('button', { name: 'Spustit časovač' }).click()
  await read.click()
  await page.clock.fastForward(3_000)
  const cancels = (await speech(page)).cancels
  await page.getByRole('button', { name: 'Pokračovat na doplňující otázku' }).click()
  await expect(page.getByRole('button', { name: 'Spustit časovač' })).toBeVisible()
  await expect(timer).toHaveText('1:00')
  expect((await speech(page)).cancels).toBeGreaterThan(cancels)
  expect(await speaking(page)).toBe(false)
  expect((await speech(page)).overlaps).toBe(0)
})
