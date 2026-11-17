import { expect, practise, store, test } from './fixtures.ts'

// communication-s-007: a free translation with listed formulations.
const LISTED = 'Meinen Sie die Berechtigungen in Entra ID oder die Freigaben auf dem Dateiserver?'
const OTHER = 'Meinen Sie damit die Berechtigungen in Entra ID oder eher die Freigaben auf dem Dateiserver?'
// communication-s-010: the model sentence.
const MODEL = 'Im ersten Schritt prüfe ich, wer betroffen ist, und im zweiten Schritt grenze ich die Ursache ein.'

test.describe('psaná odpověď', () => {
  test('uvedená varianta je správně', async ({ page }) => {
    await practise(page, 'communication-s-007', 'Procvičit psaní')
    await page.getByLabel('Napište německy').fill(LISTED)
    await page.getByRole('button', { name: 'Zkontrolovat' }).click()
    await expect(page.locator('.feedback--ok .verdict')).toContainText('Správně – povolená varianta')
    await expect(page.locator('.rate .rate-label')).toHaveText(['Těžké', 'Umím'])
    await page.keyboard.press('3')
    await expect(page.getByRole('heading', { name: 'Výsledek lekce' })).toBeVisible()
    expect((await store(page)).lesson?.log.at(-1)).toMatchObject({ verdict: 'variant', rating: 'good' })
  })

  test('chybný člen je chyba a vysvětlení jmenuje rod', async ({ page }) => {
    await practise(page, 'access-v-006', 'Procvičit psaní')
    await page.getByLabel('Napište německy').fill('der Authentifizierungsmethode')
    await page.keyboard.press('Enter')
    const feedback = page.locator('.feedback--error')
    await expect(feedback.locator('.verdict')).toContainText('Chyba')
    await expect(feedback.locator('.hints li')).toContainText(['Člen: správně „die“ (ženský rod), ne „der“.'])
    await expect(page.getByRole('button', { name: 'Pokračovat – karta se vrátí' })).toBeFocused()
  })

  test('chybějící přehláska je chyba; znak z lišty ji doplní na místo kurzoru', async ({ page }) => {
    await practise(page, 'communication-s-010', 'Procvičit psaní')
    const field = page.getByLabel('Napište německy')
    await field.fill(MODEL.replace('prüfe', 'prufe'))
    await page.keyboard.press('Enter')
    const feedback = page.locator('.feedback--error')
    await expect(feedback.locator('.verdict')).toContainText('Chyba')
    await expect(feedback.locator('.hints li').first()).toHaveText(/^Chybí ü: správně „prüfe“/)

    await practise(page, 'communication-s-010', 'Procvičit psaní')
    await field.pressSequentially('Im ersten Schritt pr')
    await page.getByRole('button', { name: 'Vložit ü', exact: true }).click()
    await expect(field).toBeFocused()
    await field.pressSequentially(MODEL.slice('Im ersten Schritt prü'.length))
    await expect(field).toHaveValue(MODEL)
    await page.keyboard.press('Enter')
    await expect(page.locator('.feedback--ok .verdict')).toContainText('Správně')
  })

  test('volná formulace se porovná se vzorem a ohodnotí sebehodnocením', async ({ page }) => {
    await practise(page, 'communication-s-007', 'Procvičit psaní')
    await page.getByLabel('Napište německy').fill(OTHER)
    await page.getByRole('button', { name: 'Zkontrolovat' }).click()
    const feedback = page.locator('.feedback--compare')
    await expect(feedback.locator('.verdict')).toHaveText('Porovnání se vzorem')
    await expect(page.locator('.feedback--error')).toHaveCount(0)
    await expect(feedback.locator('.hints--soft li')).toContainText(['Slovo „eher“ ve vzoru není. Mění význam, nebo je jen navíc?'])
    await expect(page.locator('.rate .rate-label')).toHaveText(['Znovu', 'Těžké', 'Umím'])
    await page.getByRole('button', { name: /^Umím/ }).click()
    await expect(page.getByRole('heading', { name: 'Výsledek lekce' })).toBeVisible()
    expect((await store(page)).lesson?.log.at(-1)).toMatchObject({ verdict: 'compared', rating: 'good' })
  })
})
