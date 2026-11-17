import { progressStore, REVIEWED_COUNT } from './data.ts'
import {
  answerAny,
  downloadedJson,
  expect,
  exportFile,
  localDay,
  rawStore,
  seed,
  squash,
  store,
  test,
  upload,
  type Stored,
} from './fixtures.ts'

const settingsSection = (title: string) => `.settings-section:has(h2:text-is("${title}"))`
const todayCounts = '.today-main .counts dd'

test('export a import v novém profilu obnoví pokrok, rozpracovanou lekci, pohovor i nastavení', async ({ page, newProfile }) => {
  // Real study in the first profile: a lesson ended early, a new one with an answer waiting for its rating.
  await page.goto('./')
  await page.getByLabel('Téma', { exact: true }).selectOption('network')
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  for (const key of ['3', '2', '1', '3']) {
    await page.getByRole('button', { name: /^(Odkrýt řešení|Nevím)/ }).first().waitFor()
    await answerAny(page, key)
  }
  await page.getByRole('button', { name: 'Ukončit lekci' }).click()
  await page.getByRole('button', { name: 'Zpět na Dnes' }).click()
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  await page.getByRole('button', { name: /^(Odkrýt řešení|Nevím)/ }).first().click()
  // One interview answer and two settings.
  await page.goto('./#/pohovor/vpn-incident')
  await page.getByRole('button', { name: 'Začít pohovor' }).click()
  await page.getByRole('button', { name: 'Pokračovat na doplňující otázku' }).click()
  await page.getByRole('button', { name: 'Zobrazit vzorovou odpověď' }).click()
  for (const [i, value] of ['Ano', 'Částečně', 'Ano', 'Ne'].entries()) {
    await page.locator('fieldset.self-check').nth(i).getByRole('radio', { name: value, exact: true }).check()
  }
  await page.getByRole('button', { name: 'Uložit a další otázka' }).click()
  await page.goto('./#/nastaveni')
  await page.getByLabel('Nabízet předčítání otázek v Pohovoru').uncheck()
  const before = await store(page)
  expect(before.lesson?.pending).not.toBeNull()
  await page.goto('./')
  const countsBefore = await page.locator(todayCounts).allInnerTexts()

  await page.goto('./#/nastaveni')
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Stáhnout export' }).click()
  const download = await downloading
  expect(download.suggestedFilename()).toMatch(/^cloud-admin-deutsch-progress-\d{4}-\d{2}-\d{2}\.json$/)
  const file = (await downloadedJson(download)) as { format: string; formatVersion: number; data: Stored }
  expect(file).toMatchObject({ format: 'cloud-admin-deutsch-at/progress', formatVersion: 1 })
  expect(file.data).toEqual(before)

  // A new browser profile: import, check the summary, replace.
  const fresh = await newProfile()
  await fresh.goto('./#/nastaveni')
  await upload(fresh, 'progress.json', Buffer.from(JSON.stringify(file)))
  const summary = fresh.locator('.import-summary')
  await expect(summary).toBeVisible()
  await expect(summary).toContainText('Rozpracováno lekce, pohovor', { useInnerText: true })
  await fresh.getByRole('button', { name: 'Nahradit pokrok' }).click()
  await expect(fresh.locator(settingsSection('Pokrok a záloha')).locator('.settings-message')).toHaveText(/^Hotovo: pokrok je obnovený ze souboru/)
  const after = await store(fresh)
  for (const part of ['cards', 'lesson', 'interview', 'prefs', 'stats', 'createdAt'] as const) {
    expect(after[part], part).toEqual(before[part])
  }
  await fresh.reload()
  await expect(fresh.getByLabel('Nabízet předčítání otázek v Pohovoru')).not.toBeChecked()
  await fresh.goto('./')
  await expect(fresh.locator(todayCounts)).toHaveText(countsBefore)
  await fresh.locator('.resume').getByRole('button', { name: 'Pokračovat v lekci' }).click()
  await expect(fresh.locator('.lesson-position')).toBeVisible()
  expect(await fresh.locator('article.card').getAttribute('aria-labelledby')).toBe(`prompt-${before.lesson?.pending?.cardId}`)
})

test('import: neplatný a novější nepodporovaný soubor se odmítne, starší formát se převede', async ({ page }) => {
  await page.goto('./')
  const day = await localDay(page)
  await seed(page, progressStore(day), './#/nastaveni')
  const before = await rawStore(page)
  const current = JSON.parse(before ?? '{}')
  const refused = [
    ['not-json.json', Buffer.from('hello'), 'Soubor není platný JSON.'],
    ['other.json', Buffer.from('{"a": 1}'), 'Soubor není export z Cloud Admin Deutsch.'],
    ['newer-format.json', exportFile(current, { formatVersion: 2 }), 'Export má novější formát (2)'],
    ['newer-schema.json', exportFile({ ...current, schemaVersion: 99 }), 'Export pochází z novější verze aplikace (schéma 99).'],
  ] as const
  for (const [name, content, reason] of refused) {
    await upload(page, name, content)
    const alert = page.locator('.import-error')
    await expect(alert, name).toContainText(reason)
    await expect(alert, name).toContainText('Pokrok v tomto prohlížeči zůstal beze změny.')
    await expect(page.locator('.import-summary')).toHaveCount(0)
    expect(await rawStore(page), name).toBe(before)
  }

  // An export of version 1.0 (schema 4): checked, summarised and converted to schema 5.
  const old = progressStore(day, 4)
  await upload(page, 'version-1.0.json', exportFile(old))
  await expect(page.locator('.import-summary')).toContainText(`Karty s pokrokem ${REVIEWED_COUNT}`, { useInnerText: true })
  await page.getByRole('button', { name: 'Nahradit pokrok' }).click()
  const converted = await store(page)
  expect(converted.schemaVersion).toBe(5)
  expect(converted.cards).toEqual(old.cards)
  expect(converted.stats.lessons).toEqual({ completed: 0, endedEarly: 0 })
})

test('smazání pokroku potvrdí dialog a odstraní jen klíče aplikace', async ({ page }) => {
  await page.goto('./')
  await seed(page, progressStore(await localDay(page)), './#/nastaveni')
  await page.evaluate(() => localStorage.setItem('another-app:data', 'keep me'))
  const reset = page.getByRole('button', { name: 'Smazat pokrok…' })
  await reset.click()
  const dialog = page.getByRole('dialog', { name: 'Smazat veškerý pokrok?' })
  await expect(dialog).toContainText('Tuto akci nelze vrátit')
  await expect(dialog.getByRole('button', { name: 'Zpět' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Zpět' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(reset).toBeFocused()
  expect(await rawStore(page)).not.toBeNull()

  await reset.click()
  await dialog.getByRole('button', { name: 'Ano, smazat' }).click()
  await expect(page.locator(settingsSection('Pokrok a záloha')).locator('.settings-message')).toHaveText('Pokrok je smazaný, aplikace začíná znovu.')
  expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual(['another-app:data'])
  await page.getByRole('link', { name: 'Dnes' }).click()
  await expect(page.getByRole('heading', { name: 'Vítejte v Cloud Admin Deutsch' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Vítejte v Cloud Admin Deutsch' })).toBeVisible()
})

test('chyba zápisu: banner nabídne export neuložené změny a ukládání jde obnovit', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Object.assign(window, { __restoreSetItem: () => (Storage.prototype.setItem = original) })
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  const banner = page.locator('.banner--warn')
  await expect(banner).toContainText('Poslední změnu se nepodařilo uložit')
  const downloading = page.waitForEvent('download')
  await banner.getByRole('button', { name: 'Stáhnout export aktuálního stavu' }).click()
  const file = (await downloadedJson(await downloading)) as { data: Stored }
  expect(file.data.lesson?.cards.length, 'the export holds the lesson that could not be saved').toBeGreaterThan(0)
  expect(await rawStore(page)).toBeNull()

  await page.getByRole('button', { name: 'Pokračovat bez ukládání' }).click()
  await expect(page.locator('.banner--compact')).toContainText('Pracujete bez ukládání')
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).click()
  await page.keyboard.press('3')
  await page.evaluate(() => (window as unknown as { __restoreSetItem: () => void }).__restoreSetItem())
  await page.getByRole('button', { name: 'Znovu ukládat' }).click()
  await expect(page.locator('.banner')).toHaveCount(0)
  const saved = await store(page)
  expect(Object.keys(saved.cards)).toHaveLength(1)
  expect(saved.lesson?.log).toHaveLength(1)
  expect(squash(await page.locator('.lesson-position').innerText())).toBe('Karta 2 z 10')
})

test('chyba zápisu při importu a při smazání: data zůstanou, jak byla, a hlášení to řekne jednou', async ({ page }) => {
  await page.goto('./')
  const day = await localDay(page)
  await seed(page, progressStore(day), './#/nastaveni')
  const before = await rawStore(page)
  const section = page.locator(settingsSection('Pokrok a záloha'))
  const counts = await section.locator('.progress-stats dd').allInnerTexts()

  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    Object.assign(window, { __restoreSetItem: () => (Storage.prototype.setItem = original) })
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  const other = { ...progressStore(day), cards: {} }
  await upload(page, 'backup.json', exportFile(other))
  await page.getByRole('button', { name: 'Nahradit pokrok' }).click()
  await expect(page.locator('.import-error')).toHaveText('Zápis se nepodařil. Pokrok v tomto prohlížeči zůstal beze změny.', { useInnerText: true })
  expect(await rawStore(page)).toBe(before)
  await expect(section.locator('.progress-stats dd')).toHaveText(counts)
  await page.evaluate(() => (window as unknown as { __restoreSetItem: () => void }).__restoreSetItem())

  await page.evaluate(() => {
    Storage.prototype.removeItem = () => {
      throw new DOMException('denied', 'SecurityError')
    }
  })
  await page.getByRole('button', { name: 'Smazat pokrok…' }).click()
  await page.getByRole('button', { name: 'Ano, smazat' }).click()
  await expect(section.locator('.settings-message')).toHaveText('Smazání se nepodařilo, data zůstala beze změny.')
  expect(await rawStore(page)).toBe(before)
  await expect(section.locator('.progress-stats dd')).toHaveText(counts)
})
