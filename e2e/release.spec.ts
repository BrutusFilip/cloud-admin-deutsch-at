import { expect, test } from './fixtures.ts'

const BASE_PATH = '/cloud-admin-deutsch-at/'

test('pod podcestou GitHub Pages se každý pohled otevře přímo i po reloadu', async ({ page }) => {
  const fonts: string[] = []
  page.on('request', (r) => {
    if (r.resourceType() === 'font') fonts.push(new URL(r.url()).pathname.split('/').pop() ?? '')
  })
  const views: [string, string][] = [
    ['./', 'Dnes'],
    ['./#/procvicovani', 'Procvičování'],
    ['./#/pohovor', 'Pohovor'],
    ['./#/pohovor/vpn-incident', 'Incident s VPN a DNS'],
    ['./#/slovnik', 'Slovník'],
    ['./#/slovnik?q=vpn&tema=network&druh=vocab', 'Slovník'],
    ['./#/slovnik/access-v-006', 'die Authentifizierungsmethode'],
    ['./#/nastaveni', 'Nastavení'],
    ['./#/lekce', 'Dnes'], // no lesson in progress: Today
    ['./#/neznama-adresa', 'Dnes'],
    ['./#/slovnik/neni-takove-heslo', 'Položka nenalezena.'],
  ]
  for (const [path, title] of views) {
    await page.goto(path)
    await expect(page.locator('h1').first(), `${path} (open)`).toHaveText(title)
    await page.reload()
    await expect(page.locator('h1').first(), `${path} (reload)`).toHaveText(title)
    expect(await page.evaluate(() => location.pathname)).toBe(BASE_PATH)
  }

  // Both fonts come from the build; only the Latin subsets are needed (German and Czech).
  await page.goto('./#/slovnik/access-v-006')
  await expect(page.locator('h1')).toHaveText('die Authentifizierungsmethode')
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready
    return [...new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')))].sort()
  })
  expect(loaded).toEqual(['Atkinson Hyperlegible Next Variable', 'Literata Variable'])
  expect(fonts.length).toBeGreaterThan(0)
  for (const file of fonts) expect(file).toMatch(/-(latin|latin-ext)-(wght|opsz)-normal-[\w-]+\.woff2$/)
})

test('klávesnice: odkaz na obsah, lekce bez myši a dialog s fokusem a klávesou Esc', async ({ page }) => {
  await page.goto('./')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Přeskočit na obsah' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()

  const tabTo = async (name: string) => {
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab')
      if (await page.evaluate((n) => document.activeElement?.textContent?.trim() === n, name)) return
    }
    throw new Error(`Tab did not reach "${name}"`)
  }
  await tabTo('Začít trénink')
  const ring = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement
    const s = getComputedStyle(el)
    return { visible: el.matches(':focus-visible'), style: s.outlineStyle, width: parseFloat(s.outlineWidth) }
  })
  expect(ring.visible).toBe(true)
  expect(ring.style).toBe('solid')
  expect(ring.width).toBeGreaterThanOrEqual(2)

  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: /^Odkrýt řešení/ })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.locator('.answer-cz')).toBeVisible()
  await page.keyboard.press('3')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 2 z 10')
  await tabTo('Ukončit lekci')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Lekce ukončena', level: 1 })).toBeFocused()

  // A modal dialog: focus starts on the safe choice, stays inside, Esc closes and returns focus.
  await page.goto('./#/nastaveni')
  await tabTo('Smazat pokrok…')
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Smazat veškerý pokrok?' })
  await expect(dialog.getByRole('button', { name: 'Zpět' })).toBeFocused()
  expect(await page.evaluate(() => document.querySelector('dialog[open]')?.matches(':modal'))).toBe(true)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Tab')
    const outside = await page.evaluate(() => {
      const el = document.activeElement
      return el !== null && el !== document.body && el.closest('dialog[open]') === null
    })
    expect(outside, 'focus stays in the dialog').toBe(false)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Smazat pokrok…' })).toBeFocused()
})

test('omezené animace vypnou animaci odkrytí karty', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  await page.getByRole('button', { name: /^Odkrýt řešení/ }).click()
  const duration = () => page.locator('.reveal').evaluate((el) => getComputedStyle(el).animationDuration)
  expect(await duration()).toBe('0.18s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(['1e-05s', '0.00001s', '0s']).toContain(await duration())
})
