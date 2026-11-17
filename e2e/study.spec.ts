import { lessonStore } from './data.ts'
import { cardOnScreen, expect, finishLesson, localDay, rawStore, seed, store, test } from './fixtures.ts'

const counts = '.today-main .counts dd'

test('nový uživatel dokončí lekci a po reloadu vidí pokrok i další termín', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Vítejte v Cloud Admin Deutsch' })).toBeVisible()
  expect(await rawStore(page), 'opening the app writes nothing').toBeNull()

  // A topic small enough to be finished today: the first lesson takes every card that is open now.
  await page.getByLabel('Téma', { exact: true }).selectOption('career')
  await expect(page.locator('.today-preview')).toHaveText(/^Trénink nabídne \d+ nov/)
  const [due0, fresh0, mastered0] = await page.locator(counts).allInnerTexts()
  const total = Number(mastered0.split('/')[1])
  expect(due0).toBe('0')
  expect(mastered0).toBe(`0/${total}`)
  expect(Number(fresh0), 'one lesson (at most 10 cards) takes every open card').toBeLessThanOrEqual(10)

  await page.getByRole('button', { name: 'Začít trénink' }).click()
  await expect(page).toHaveURL(/#\/lekce$/)
  await finishLesson(page) // flashcards "Umím", writing and grammar "Nevím"
  await expect(page.locator('.summary-score')).toHaveText(/^Napoprvé správně: 0 z \d+$/)

  await page.getByRole('button', { name: 'Zpět na Dnes' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Dnes', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Téma', { exact: true })).toHaveValue('career')
  // Nothing is due today any more; the writing cards of the seen words are now open.
  await expect(page.locator(counts)).toHaveText(['0', String(total - Number(fresh0)), `0/${total}`])

  const tomorrow = await localDay(page, 1)
  const inThreeDays = await localDay(page, 3)
  const first = await store(page)
  const lessonCards = first.lesson?.cards ?? []
  expect(lessonCards).toHaveLength(Number(fresh0))
  for (const id of lessonCards) {
    const card = first.cards[id]
    expect(card.reviews, id).toBeGreaterThan(0)
    expect(card.due, id).toBe(id.endsWith(':flashcard') ? inThreeDays : tomorrow)
  }
  expect(first.stats.lessons).toEqual({ completed: 1, endedEarly: 0 })

  // The dictionary shows the next date of each card.
  const flashcard = lessonCards.find((id) => id.endsWith(':flashcard')) ?? ''
  const written = lessonCards.find((id) => id.endsWith(':write')) ?? ''
  await page.goto(`./#/slovnik/${flashcard.split(':')[0]}`)
  await expect(page.locator('.entry-cards')).toContainText('další opakování za 3 dny')
  await page.goto(`./#/slovnik/${written.split(':')[0]}`)
  await expect(page.locator('.entry-cards')).toContainText('další opakování zítra')

  // The rest of the topic, then Today names the next review.
  await page.goto('./')
  await page.getByRole('button', { name: 'Začít trénink' }).click()
  await finishLesson(page)
  await page.getByRole('button', { name: 'Zpět na Dnes' }).click()
  await expect(page.getByRole('heading', { name: 'V tomto tématu teď nic nečeká' })).toBeVisible()
  const dueTomorrow = Object.values((await store(page)).cards).filter((c) => c.due === tomorrow).length
  const next = new RegExp(`Nejbližší opakování: zítra \\(${dueTomorrow} (karta|karty|karet)\\)\\.`)
  await expect(page.locator('.empty')).toContainText(next)
  await page.reload()
  await expect(page.locator('.empty')).toContainText(next)
  expect((await store(page)).stats.lessons).toEqual({ completed: 2, endedEarly: 0 })
})

const WRITE = 'access-v-006:write' // metoda ověřování → die Authentifizierungsmethode
const FLASH = 'network-v-001:flashcard'
const GRAMMAR = 'network-g-001:grammar'

test('rozpracovaná lekce přežije reload před odpovědí i po kontrole a opakovaný vstup nic nezdvojí', async ({ page }) => {
  await page.goto('./')
  await seed(page, lessonStore(await localDay(page), [WRITE, FLASH, GRAMMAR]), './#/lekce')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 1 z 3')
  const field = page.getByLabel('Napište německy')

  // Before checking: the same card comes back, the typed text is not kept and nothing is counted.
  await field.fill('die Authentif')
  await page.reload()
  await expect(page.locator('.prompt-cz')).toHaveText('metoda ověřování')
  await expect(field).toHaveValue('')
  expect((await store(page)).lesson).toMatchObject({ log: [], pending: null })

  // Checking saves the answer at once; a double click checks once and rates nothing.
  await field.fill('die Authentifizierungsmetode')
  await page.getByRole('button', { name: 'Zkontrolovat' }).dblclick()
  await expect(page.locator('.feedback--error')).toBeVisible()
  expect((await store(page)).lesson).toMatchObject({ log: [], pending: { cardId: WRITE, verdict: 'incorrect' } })

  // After a reload: the same result, no second answer, focus on the remaining choice.
  await page.reload()
  await expect(page.locator('.feedback--error')).toContainText('die Authentifizierungsmethode')
  await expect(field).toHaveCount(0)
  const again = page.getByRole('button', { name: 'Pokračovat – karta se vrátí' })
  await expect(again).toBeFocused()

  // Enter ×3: the wrong answer is rated once, the next card is at most revealed, never rated.
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await expect(page.locator('.lesson-position')).toHaveText('Karta 2 z 4')
  let data = await store(page)
  expect(data.lesson?.log.map((e) => [e.cardId, e.verdict, e.rating])).toEqual([[WRITE, 'incorrect', 'again']])
  expect(data.cards[WRITE].reviews).toBe(1)
  expect(data.cards[FLASH]).toBeUndefined()

  // A revealed flashcard stays revealed after a reload; a double click on "Umím" rates once.
  const reveal = page.getByRole('button', { name: /^Odkrýt řešení/ })
  if (await reveal.count()) await reveal.dblclick()
  await expect(page.locator('.answer-cz')).toBeVisible()
  await page.reload()
  await expect(page.locator('.answer-cz')).toBeVisible()
  expect(await cardOnScreen(page)).toBe(FLASH)
  await page.locator('button.rate--good').dblclick()
  await expect(page.locator('.lesson-position')).toHaveText('Karta 3 z 4')
  data = await store(page)
  expect(data.lesson?.log.map((e) => [e.cardId, e.rating])).toEqual([[WRITE, 'again'], [FLASH, 'good']])
  expect(data.lesson?.pending).toBeNull()
  expect(data.cards[FLASH].reviews).toBe(1)

  // After a reload the lesson goes on where it was, the earlier ratings stored once each.
  await page.reload()
  await expect(page.locator('.lesson-position')).toHaveText('Karta 3 z 4')
  expect((await store(page)).lesson?.log).toHaveLength(2)
})
