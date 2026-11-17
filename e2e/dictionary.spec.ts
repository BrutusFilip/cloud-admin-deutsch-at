import { expect, squash, test } from './fixtures.ts'

const count = async (text: Promise<string>) => Number((await text).match(/^\d+/)?.[0])

test('slovník: hledání bez diakritiky, filtry jako štítky a prázdný výsledek', async ({ page }) => {
  await page.goto('./#/slovnik')
  const results = page.locator('.result-count')
  await expect(results).toHaveText(/^\d+ položek$/)
  const all = await count(results.innerText())
  const search = page.getByRole('searchbox', { name: 'Hledat' })

  await search.fill('kundigungsfrist')
  await expect(page.locator('.dict-de').first()).toHaveText('die Kündigungsfrist')
  await expect(page).toHaveURL(/#\/slovnik\?q=kundigungsfrist$/)
  await search.fill('opravneni')
  await expect(page.locator('.dict-list')).toContainText('jemandem eine Berechtigung entziehen')

  // Search and filters together, each shown as a chip that removes just itself.
  await search.fill('vpn')
  await page.getByLabel('Téma', { exact: true }).selectOption('network')
  await page.getByLabel('Druh', { exact: true }).selectOption('vocab')
  const chips = page.getByRole('list', { name: 'Aktivní filtry' }).locator('.filter-chip')
  await expect(chips).toHaveText(['Hledáno: „vpn“ ×', 'Téma: Sítě a VPN ×', 'Druh: Slova a výrazy ×'], { useInnerText: true })
  const filtered = await count(results.innerText())
  expect(filtered).toBeGreaterThan(0)
  expect(filtered).toBeLessThan(all)

  // The search and the filters live in the address: a reload keeps them.
  await page.reload()
  await expect(chips).toHaveCount(3)
  await expect(results).toHaveText(new RegExp(`^${filtered} `))

  await page.getByRole('button', { name: 'Zrušit filtr Téma: Sítě a VPN' }).click()
  await expect(chips).toHaveText(['Hledáno: „vpn“ ×', 'Druh: Slova a výrazy ×'], { useInnerText: true })
  await expect(page.getByLabel('Téma', { exact: true })).toHaveValue('all')
  await page.getByRole('button', { name: 'Zrušit vše' }).click()
  await expect(chips).toHaveCount(0)
  await expect(search).toBeFocused()
  await expect(results).toHaveText(`${all} položek`)

  await search.fill('xyzxyz')
  await expect(page.getByRole('heading', { name: 'Nic nenalezeno' })).toBeVisible()
  await expect(page.locator('.empty')).toContainText('Diakritiku psát nemusíte')
  await page.getByRole('button', { name: 'Zrušit hledání a filtry' }).click()
  await expect(results).toHaveText(`${all} položek`)

  await search.fill('Kündigungsfrist')
  await page.locator('.dict-row', { hasText: 'die Kündigungsfrist' }).first().click()
  await expect(page).toHaveURL(/#\/slovnik\/career-v-001$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('die Kündigungsfrist')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('die Kündigungsfrist')
})

test('odkaz z rozboru pohovoru otevře odpovídající heslo a vede zpět', async ({ page }) => {
  await page.goto('./#/pohovor/vpn-incident')
  await page.getByRole('button', { name: 'Začít pohovor' }).click()
  await page.getByRole('button', { name: 'Pokračovat na doplňující otázku' }).click()
  await page.getByRole('button', { name: 'Zobrazit vzorovou odpověď' }).click()
  await page.locator('fieldset.self-check').first().getByRole('radio', { name: 'Ano', exact: true }).check()

  const link = page.locator('.dictionary-links a').first()
  const href = (await link.getAttribute('href')) ?? ''
  const word = squash(await link.innerText())
  expect(href).toMatch(/^#\/slovnik\/[a-z0-9-]+$/)
  await link.click()
  await expect(page).toHaveURL(new RegExp(`${href.replace(/[/?]/g, '\\$&')}$`))
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText(word)
  await expect(heading).toHaveAttribute('lang', 'de-AT')
  const used = page.locator('.entry-section', { has: page.getByRole('heading', { name: 'Použito v pohovoru' }) })
  await expect(used).toContainText('Incident s VPN a DNS – otázka 1')

  await page.getByRole('link', { name: 'Zpět k pohovoru' }).click()
  await expect(page.getByRole('heading', { name: /^Vzorová odpověď/ })).toBeVisible()
  await expect(page.locator('fieldset.self-check input:checked')).toHaveCount(1)
})
