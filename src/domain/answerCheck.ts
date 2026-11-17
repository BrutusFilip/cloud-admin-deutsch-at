import type { AcceptedVariant, AnswerRules } from './types'

/**
 * Checking written answers.
 *
 * - Always: Unicode NFC, zero-width characters removed, typographic quotes
 *   unified, repeated/edge whitespace collapsed, no space before punctuation.
 * - Per exercise (AnswerRules): case and punctuation.
 * - Never: folding ä/a, ö/o, ü/u or ß/ss. A different spelling counts only
 *   when the item lists it as an explicit variant.
 * - Diagnosis is reported only when the whole difference is explained
 *   (capitalisation, missing umlaut/ß, article, one missing or extra word,
 *   word order). Otherwise the learner just sees the diff.
 * - Punctuation is cosmetic: an answer that differs from an accepted one only
 *   in commas, quotes or similar marks counts as correct, with a note that
 *   names the exact place (e.g. the comma before "dass"). No task practises
 *   punctuation, so a missing comma never fails the practised phenomenon.
 */

const LOCALE = 'de-AT'
const ZERO_WIDTH = /[​-‍⁠﻿]/g
const SINGLE_QUOTES = /[‘’‚‛′]/g
const DOUBLE_QUOTES = /[“”„‟″«»]/g
const HYPHENS = /[‐‑]/g
const WHITESPACE = /\s+/gu
const SPACE_BEFORE_PUNCT = / ([,.;:!?])/g
const PUNCTUATION = /[.,;:!?"'()…–—]/gu
const FINAL_PUNCTUATION = /[.!?…]+$/u
const MARKS = /[.,;:!?"'()…–—]/gu
const FINAL_MARKS = /[.!?…]+$/u

const DETERMINERS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des',
  'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
  'kein', 'keine', 'keinen', 'keinem', 'keiner', 'keines',
])

const SPECIAL = /[äöüÄÖÜß]/g
const STRIP: Record<string, string> = { ä: 'a', ö: 'o', ü: 'u', Ä: 'A', Ö: 'O', Ü: 'U', ß: 'ss' }
const TRANSLIT: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ß: 'ss' }

export type Hint =
  | { type: 'capitalization'; expected: string; given: string }
  | { type: 'special-letters'; expected: string; given: string; letters: string[] }
  | { type: 'determiner'; expected: string; given: string }
  | { type: 'missing-word'; expected: string; determiner: boolean }
  | { type: 'extra-word'; given: string }
  /** The same words in another order; `moved` are the words that stand elsewhere in the solution. */
  | { type: 'word-order'; moved: string[]; expected: string }
  | { type: 'punctuation' }
  | { type: 'plural-instead' }

/** A punctuation mark the answer lacks ('missing') or has in addition ('extra'), after the word `after`. */
export interface PunctuationChange {
  change: 'missing' | 'extra'
  mark: string
  after: string
  /** The following word, if any: "before dass" is easier to find than "after mitgeteilt". */
  before: string | null
}

/** A difference that is not a mistake in the practised phenomenon. `changes` is empty when the place cannot be named. */
export type CosmeticNote = { type: 'punctuation'; changes: PunctuationChange[] }

export interface DiffPart {
  text: string
  changed: boolean
}

export type Evaluation =
  | { result: 'empty' }
  /** `notes` only when something cosmetic differs (never a mistake). */
  | { result: 'correct'; variant: AcceptedVariant | null; notes?: CosmeticNote[] }
  | {
      result: 'incorrect'
      /** The accepted form closest to the answer (used for diagnosis and diff). */
      expected: string
      hints: Hint[]
      givenParts: DiffPart[]
      expectedParts: DiffPart[]
      /** Cosmetic differences besides the mistake (e.g. a missing comma). */
      notes?: CosmeticNote[]
    }

export function normalizeText(input: string): string {
  return input
    .normalize('NFC')
    .replace(ZERO_WIDTH, '')
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(HYPHENS, '-')
    .replace(WHITESPACE, ' ')
    .replace(SPACE_BEFORE_PUNCT, '$1')
    .trim()
}

function lowerFirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toLocaleLowerCase(LOCALE) + s.slice(1)
}

function stripPunctuation(s: string): string {
  return s.replace(PUNCTUATION, ' ').replace(WHITESPACE, ' ').trim()
}

export function applyRules(text: string, rules: AnswerRules): string {
  let s = text
  if (rules.punctuation === 'ignore') s = stripPunctuation(s)
  else if (rules.punctuation === 'ignore-final') s = s.replace(FINAL_PUNCTUATION, '').trimEnd()
  if (rules.case === 'ignore') s = s.toLocaleLowerCase(LOCALE)
  else if (rules.case === 'ignore-first') s = lowerFirst(s)
  return s
}

export function normalizeForCompare(input: string, rules: AnswerRules): string {
  return applyRules(normalizeText(input), rules)
}

export function isDeterminer(word: string): boolean {
  return DETERMINERS.has(word.toLocaleLowerCase(LOCALE))
}

function specialLetters(word: string): string[] {
  return [...new Set(word.match(SPECIAL) ?? [])]
}

function fold(word: string, table: Record<string, string>): string {
  return word.replace(SPECIAL, (ch) => table[ch] ?? ch)
}

function classifyPair(given: string, expected: string): Hint[] | null {
  const g = given.toLocaleLowerCase(LOCALE)
  const e = expected.toLocaleLowerCase(LOCALE)
  if (g === e) return [{ type: 'capitalization', expected, given }]
  const letters = specialLetters(expected)
  if (letters.length > 0) {
    for (const variant of [fold(expected, STRIP), fold(expected, TRANSLIT)]) {
      if (variant === given) return [{ type: 'special-letters', expected, given, letters }]
      if (variant.toLocaleLowerCase(LOCALE) === g) {
        return [
          { type: 'special-letters', expected, given, letters },
          { type: 'capitalization', expected, given },
        ]
      }
    }
  }
  if (isDeterminer(g) && isDeterminer(e)) return [{ type: 'determiner', expected, given }]
  return null
}

/**
 * Token equality. When the first letter is free (ignore-first), a word that
 * stands first in one of the answers may differ in its first letter's case.
 */
function sameToken(a: string, b: string, firstPosition: boolean, rules: AnswerRules): boolean {
  if (a === b) return true
  return firstPosition && rules.case !== 'strict' && lowerFirst(a) === lowerFirst(b)
}

/** Words of the solution that stand elsewhere in the answer (outside the longest common sequence). */
function movedWords(given: string[], expected: string[]): string[] {
  const [, inE] = lcsMatches(
    given.map((w) => w.toLocaleLowerCase(LOCALE)),
    expected.map((w) => w.toLocaleLowerCase(LOCALE)),
  )
  return expected.filter((_, i) => !inE.has(i)).slice(0, 3)
}

function sameWordsAnyOrder(given: string[], expected: string[], rules: AnswerRules): boolean {
  if (given.length !== expected.length) return false
  const used = new Array<boolean>(expected.length).fill(false)
  return given.every((g, i) => {
    let j = expected.findIndex((e, k) => !used[k] && e === g)
    if (j < 0) j = expected.findIndex((e, k) => !used[k] && sameToken(g, e, i === 0 || k === 0, rules))
    if (j < 0) return false
    used[j] = true
    return true
  })
}

/** Index i in `longer` whose removal yields `shorter`, or -1. */
function insertionIndex(shorter: string[], longer: string[], rules: AnswerRules): number {
  for (let i = 0; i < longer.length; i++) {
    const rest = [...longer.slice(0, i), ...longer.slice(i + 1)]
    if (rest.length === shorter.length && rest.every((v, k) => sameToken(v, shorter[k] as string, k === 0, rules))) return i
  }
  return -1
}

function explain(given: string, expected: string, rules: AnswerRules): Hint[] | null {
  if (rules.punctuation !== 'ignore' && stripPunctuation(given) === stripPunctuation(expected)) {
    return [{ type: 'punctuation' }]
  }
  const gt = given.split(' ')
  const et = expected.split(' ')
  if (gt.length === et.length) {
    const hints: Hint[] = []
    let explained = true
    for (let i = 0; i < gt.length; i++) {
      const g = gt[i] as string
      const e = et[i] as string
      if (g === e) continue
      const pair = classifyPair(g, e)
      if (!pair) {
        explained = false
        break
      }
      hints.push(...pair)
    }
    if (explained && hints.length > 0) return dedupe(hints)
    if (sameWordsAnyOrder(gt, et, rules)) return [{ type: 'word-order', moved: movedWords(gt, et), expected }]
    return null
  }
  if (gt.length + 1 === et.length) {
    const i = insertionIndex(gt, et, rules)
    if (i >= 0) {
      const word = et[i] as string
      return [{ type: 'missing-word', expected: word, determiner: isDeterminer(word) }]
    }
  }
  if (gt.length === et.length + 1) {
    const i = insertionIndex(et, gt, rules)
    if (i >= 0) return [{ type: 'extra-word', given: gt[i] as string }]
  }
  return null
}

/**
 * Words of the answer that differ from a word of the solution only in umlauts, ß or
 * capital letters – also when the sentence differs in other ways as well. Free
 * translation uses it: another wording may be right, a misspelt word never is.
 * The first word is left out for capital letters (it starts the sentence).
 */
export function spellingSlips(given: string, expected: string): Hint[] {
  const words = (text: string) => stripPunctuation(normalizeText(text)).split(' ').filter((w) => w !== '')
  const gw = words(given)
  const ew = words(expected)
  const used = new Set<number>()
  const out: Hint[] = []
  gw.forEach((g, gi) => {
    if (ew.includes(g)) return
    for (let ei = 0; ei < ew.length; ei++) {
      const e = ew[ei] as string
      if (used.has(ei)) continue
      const pair = classifyPair(g, e)
      if (!pair || pair.some((h) => h.type === 'determiner')) continue
      const spelling = pair.filter((h) => h.type !== 'capitalization' || (gi > 0 && ei > 0))
      if (spelling.length === 0) continue
      used.add(ei)
      out.push(...spelling)
      break
    }
  })
  return dedupe(out)
}

function dedupe(hints: Hint[]): Hint[] {
  const seen = new Set<string>()
  return hints.filter((h) => {
    const key = JSON.stringify(h)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function tokenKeys(display: string, rules: AnswerRules): string[] {
  const tokens = display.split(' ')
  return tokens.map((token, i) => {
    let key = token
    if (rules.punctuation === 'ignore') key = key.replace(PUNCTUATION, '')
    else if (rules.punctuation === 'ignore-final' && i === tokens.length - 1) key = key.replace(FINAL_PUNCTUATION, '')
    if (rules.case === 'ignore') key = key.toLocaleLowerCase(LOCALE)
    else if (rules.case === 'ignore-first' && i === 0) key = lowerFirst(key)
    return key
  })
}

function lcsMatches(a: string[], b: string[]): [Set<number>, Set<number>] {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)
    }
  }
  const inA = new Set<number>()
  const inB = new Set<number>()
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      inA.add(i)
      inB.add(j)
      i++
      j++
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) i++
    else j++
  }
  return [inA, inB]
}

function tokenDistance(a: string, b: string): number {
  const at = a.split(' ')
  const bt = b.split(' ')
  const [inA] = lcsMatches(at, bt)
  return at.length + bt.length - 2 * inA.size
}

export function diffParts(given: string, expected: string, rules: AnswerRules): { givenParts: DiffPart[]; expectedParts: DiffPart[] } {
  const gDisplay = normalizeText(given)
  const eDisplay = normalizeText(expected)
  const gTokens = gDisplay === '' ? [] : gDisplay.split(' ')
  const eTokens = eDisplay === '' ? [] : eDisplay.split(' ')
  const [inG, inE] = lcsMatches(tokenKeys(gDisplay, rules), tokenKeys(eDisplay, rules))
  return {
    givenParts: gTokens.map((text, i) => ({ text, changed: !inG.has(i) })),
    expectedParts: eTokens.map((text, i) => ({ text, changed: !inE.has(i) })),
  }
}

/** Words with the punctuation marks around them; marks standing alone belong to the word before. */
function wordsWithMarks(text: string): { word: string; marks: string }[] {
  const out: { word: string; marks: string }[] = []
  for (const token of normalizeText(text).split(' ')) {
    const word = token.replace(MARKS, '')
    const marks = (token.match(MARKS) ?? []).join('')
    if (word === '') {
      const last = out[out.length - 1]
      if (last) last.marks += marks
      continue
    }
    out.push({ word, marks })
  }
  return out
}

function markDifference(a: string, b: string): string[] {
  const rest = [...b]
  const missing: string[] = []
  for (const ch of a) {
    const i = rest.indexOf(ch)
    if (i >= 0) rest.splice(i, 1)
    else missing.push(ch)
  }
  return missing
}

/**
 * Where the punctuation of the answer differs from the solution, word by word.
 * Final marks are skipped when the rules ignore them. Empty when the words do
 * not line up (then the note stays general).
 */
export function punctuationChanges(given: string, expected: string, rules: AnswerRules): PunctuationChange[] {
  const g = wordsWithMarks(given)
  const e = wordsWithMarks(expected)
  if (g.length !== e.length || g.length === 0) return []
  const changes: PunctuationChange[] = []
  e.forEach((ew, i) => {
    const gw = g[i] as { word: string; marks: string }
    const last = i === e.length - 1
    const strip = (m: string) => (last && rules.punctuation !== 'strict' ? m.replace(FINAL_MARKS, '') : m)
    const before = e[i + 1]?.word ?? null
    for (const mark of markDifference(strip(ew.marks), strip(gw.marks))) changes.push({ change: 'missing', mark, after: ew.word, before })
    for (const mark of markDifference(strip(gw.marks), strip(ew.marks))) changes.push({ change: 'extra', mark, after: ew.word, before })
  })
  return changes
}

function punctuationNotes(given: string, expected: string, rules: AnswerRules): CosmeticNote[] {
  if (rules.punctuation === 'ignore') return []
  const loose: AnswerRules = { ...rules, punctuation: 'ignore' }
  const changes = punctuationChanges(given, expected, rules)
  const differs = normalizeForCompare(given, rules) !== normalizeForCompare(expected, rules)
  // Only a real difference after the rules (a final full stop may already be free).
  if (!differs && changes.length === 0) return []
  if (changes.length === 0 && normalizeForCompare(given, loose) !== normalizeForCompare(expected, loose)) return []
  return [{ type: 'punctuation', changes }]
}

/**
 * Word order: the same words in another order. Names up to three words that
 * stand elsewhere in `expected` (used for order tasks, where every token is
 * always placed, so any wrong answer is a word-order difference).
 */
export function wordOrderHint(given: string, expected: string): Hint {
  const shown = (text: string) => wordsWithMarks(text).map((w) => w.word)
  return { type: 'word-order', moved: movedWords(shown(given), shown(expected)), expected }
}

/** The candidate with the fewest differing words (the first one on a tie). */
export function closestText(given: string, candidates: readonly string[], rules: AnswerRules): string {
  const g = normalizeForCompare(given, rules)
  let chosen = candidates[0] ?? ''
  let best = Number.POSITIVE_INFINITY
  for (const c of candidates) {
    const d = tokenDistance(g, normalizeForCompare(c, rules))
    if (d < best) {
      best = d
      chosen = c
    }
  }
  return chosen
}

export function evaluateAnswer(
  given: string,
  canonical: string,
  variants: readonly AcceptedVariant[],
  rules: AnswerRules,
): Evaluation {
  const g = normalizeForCompare(given, rules)
  if (g === '') return { result: 'empty' }

  const candidates: { text: string; variant: AcceptedVariant | null }[] = [
    { text: canonical, variant: null },
    ...variants.map((v) => ({ text: v.text, variant: v })),
  ]
  for (const c of candidates) {
    if (normalizeForCompare(c.text, rules) === g) return { result: 'correct', variant: c.variant }
  }

  // Cosmetic: the same as an accepted answer except for punctuation.
  const loose: AnswerRules = { ...rules, punctuation: 'ignore' }
  if (rules.punctuation !== 'ignore') {
    const gl = normalizeForCompare(given, loose)
    for (const c of candidates) {
      if (normalizeForCompare(c.text, loose) === gl) {
        const notes = punctuationNotes(given, c.text, rules)
        return notes.length > 0 ? { result: 'correct', variant: c.variant, notes } : { result: 'correct', variant: c.variant }
      }
    }
  }

  // A real mistake: diagnose it without the punctuation, which is reported separately.
  const gl = normalizeForCompare(given, loose)
  let chosen = candidates[0]!
  let hints: Hint[] = []
  let best = Number.POSITIVE_INFINITY
  for (const c of candidates) {
    const e = normalizeForCompare(c.text, loose)
    const explanation = explain(gl, e, loose)
    if (explanation) {
      chosen = c
      hints = explanation
      break
    }
    const d = tokenDistance(gl, e)
    if (d < best) {
      best = d
      chosen = c
    }
  }
  const notes = punctuationNotes(given, chosen.text, rules)
  // Word order: name the words as the solution writes them.
  hints = hints.map((h) => (h.type === 'word-order' ? wordOrderHint(given, chosen.text) : h))
  return {
    result: 'incorrect',
    expected: chosen.text,
    hints,
    ...diffParts(given, chosen.text, loose),
    ...(notes.length > 0 ? { notes } : {}),
  }
}
