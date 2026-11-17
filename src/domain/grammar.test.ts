import { describe, expect, it } from 'vitest'
import {
  answerFrame,
  canonicalSentence,
  countBlanks,
  evaluateGrammar,
  gapRules,
  isTokenPermutation,
  orderText,
  splitBlank,
} from './grammar'
import { CHOICE, CHOICE_FULL, GAP, GAP_START, ORDER, TRANSFORM } from './__fixtures__/grammar'
import type { GrammarItem } from './types'

describe('grammar task helpers', () => {
  it('splits text around the blank and builds the solved sentence', () => {
    expect(countBlanks('a ___ b ___')).toBe(2)
    expect(splitBlank('Ich habe ___ Kollegin.')).toEqual(['Ich habe ', ' Kollegin.'])
    expect(canonicalSentence(GAP)).toBe(GAP.de)
    expect(canonicalSentence(CHOICE)).toBe(CHOICE.de)
    expect(canonicalSentence(CHOICE_FULL)).toBe(CHOICE_FULL.de)
    expect(canonicalSentence(ORDER)).toBe(ORDER.de)
    expect(canonicalSentence(TRANSFORM)).toBe(TRANSFORM.de)
    expect(answerFrame(TRANSFORM.task)).toEqual(['', ''])
    expect(answerFrame(CHOICE_FULL.task)).toEqual(['', ''])
    expect(answerFrame(ORDER.task)).toEqual(['Die Anmeldung schlägt fehl, weil ', '.'])
  })

  it('checks that an order answer uses every token exactly once', () => {
    const tokens = ['ist', 'das Kennwort', 'abgelaufen']
    expect(isTokenPermutation('das Kennwort abgelaufen ist', tokens)).toBe(true)
    expect(isTokenPermutation('das Kennwort ist abgelaufen', tokens)).toBe(true)
    expect(isTokenPermutation('das Kennwort abgelaufen', tokens)).toBe(false)
    expect(isTokenPermutation('das Kennwort abgelaufen ist ist', tokens)).toBe(false)
    expect(isTokenPermutation('das Passwort abgelaufen ist', tokens)).toBe(false)
  })

  it('keeps the case of the word after the blank strict unless the blank starts the sentence', () => {
    expect(gapRules(GAP.task as never).case).toBe('strict')
    expect(gapRules(GAP_START.task as never).case).toBe('ignore-first')
  })
})

describe('gap', () => {
  it('accepts the answer and listed alternatives, nothing else', () => {
    expect(evaluateGrammar(GAP, { type: 'gap', value: ' der ' })).toMatchObject({ result: 'correct', canonical: true })
    expect(evaluateGrammar(GAP_START, { type: 'gap', value: 'würden' })).toMatchObject({
      result: 'correct',
      canonical: false,
      matched: 'Würden',
    })
    expect(evaluateGrammar(GAP_START, { type: 'gap', value: 'Können' }).result).toBe('incorrect')
  })

  it('explains a wrong article and never folds umlauts', () => {
    const wrong = evaluateGrammar(GAP, { type: 'gap', value: 'die' })
    expect(wrong).toMatchObject({ result: 'incorrect', expected: 'der' })
    const folded = evaluateGrammar(GAP_START, { type: 'gap', value: 'Konnten' })
    expect(folded.result).toBe('incorrect')
    if (folded.result === 'incorrect') expect(folded.hints).toContainEqual(expect.objectContaining({ type: 'special-letters' }))
  })

  it('treats an empty answer as empty, not wrong', () => {
    expect(evaluateGrammar(GAP, { type: 'gap', value: '  ' }).result).toBe('empty')
  })
})

describe('choice', () => {
  it('compares the chosen index and shows the difference', () => {
    expect(evaluateGrammar(CHOICE, { type: 'choice', index: 1 })).toMatchObject({ result: 'correct', matched: 'um' })
    const wrong = evaluateGrammar(CHOICE, { type: 'choice', index: 2 })
    expect(wrong).toMatchObject({ result: 'incorrect', given: 'über', expected: 'um' })
    expect(evaluateGrammar(CHOICE, { type: 'choice', index: null }).result).toBe('empty')
    expect(evaluateGrammar(CHOICE, { type: 'choice', index: 7 }).result).toBe('empty')
  })

  it('marks only the words that differ in a full-sentence option', () => {
    const wrong = evaluateGrammar(CHOICE_FULL, { type: 'choice', index: 0 })
    expect(wrong.result).toBe('incorrect')
    if (wrong.result === 'incorrect') {
      expect(wrong.givenParts.filter((p) => p.changed).map((p) => p.text).length).toBeGreaterThan(0)
      expect(wrong.givenParts.filter((p) => !p.changed).map((p) => p.text)).toContain('Können')
    }
  })
})

describe('order', () => {
  it('needs every token before it checks', () => {
    expect(evaluateGrammar(ORDER, { type: 'order', picked: [1, 2] }).result).toBe('empty')
    expect(evaluateGrammar(ORDER, { type: 'order', picked: [1, 1, 2] }).result).toBe('empty')
  })

  it('accepts the listed order and rejects the main-clause order', () => {
    expect(orderText(ORDER.task as never, [1, 2, 0])).toBe('das Kennwort abgelaufen ist')
    expect(evaluateGrammar(ORDER, { type: 'order', picked: [1, 2, 0] })).toMatchObject({ result: 'correct', canonical: true })
    const wrong = evaluateGrammar(ORDER, { type: 'order', picked: [1, 0, 2] })
    expect(wrong).toMatchObject({ result: 'incorrect', given: 'das Kennwort ist abgelaufen', expected: 'das Kennwort abgelaufen ist' })
    // The concrete difference: the finite verb stands elsewhere.
    if (wrong.result === 'incorrect') expect(wrong.hints).toEqual([{ type: 'word-order', moved: ['ist'], expected: 'das Kennwort abgelaufen ist' }])
  })

  it('compares a wrong order with the closest listed order and names the misplaced word', () => {
    const two: GrammarItem = {
      ...ORDER,
      task: {
        type: 'order',
        text: 'Abschließend ___.',
        tokens: ['ich', 'im Ticket', 'dokumentiere', 'alle Schritte'],
        answers: ['dokumentiere ich alle Schritte im Ticket', 'dokumentiere ich im Ticket alle Schritte'],
      },
    }
    const wrong = evaluateGrammar(two, { type: 'order', picked: [0, 2, 1, 3] })
    expect(wrong).toMatchObject({
      result: 'incorrect',
      given: 'ich dokumentiere im Ticket alle Schritte',
      expected: 'dokumentiere ich im Ticket alle Schritte',
      // After „Abschließend“ the subject follows the verb (inversion): „ich“ stands elsewhere.
      hints: [{ type: 'word-order', moved: ['ich'], expected: 'dokumentiere ich im Ticket alle Schritte' }],
    })
  })
})

describe('transform', () => {
  it('ignores the first letter and the final full stop, but not word order', () => {
    expect(evaluateGrammar(TRANSFORM, { type: 'transform', value: 'ich habe das Kennwort zurückgesetzt' })).toMatchObject({
      result: 'correct',
      canonical: true,
    })
    expect(evaluateGrammar(TRANSFORM, { type: 'transform', value: 'Das Kennwort habe ich zurückgesetzt.' })).toMatchObject({
      result: 'correct',
      canonical: false,
    })
    const wrong = evaluateGrammar(TRANSFORM, { type: 'transform', value: 'Ich habe zurückgesetzt das Kennwort.' })
    expect(wrong.result).toBe('incorrect')
    if (wrong.result === 'incorrect') expect(wrong.hints).toContainEqual(expect.objectContaining({ type: 'word-order', moved: ['zurückgesetzt'] }))
  })

  it('a missing comma before a subordinate clause is cosmetic, not a word-order mistake', () => {
    const task: GrammarItem = {
      ...TRANSFORM,
      task: { type: 'transform', source: 'Ich habe gesagt: Es geht.', answers: ['Ich habe gesagt, dass es geht.'] },
      de: 'Ich habe gesagt, dass es geht.',
    }
    expect(evaluateGrammar(task, { type: 'transform', value: 'Ich habe gesagt dass es geht' })).toMatchObject({
      result: 'correct',
      canonical: true,
      notes: [{ type: 'punctuation', changes: [{ change: 'missing', mark: ',', after: 'gesagt', before: 'dass' }] }],
    })
  })

  it('rejects a response of the wrong type instead of guessing', () => {
    expect(() => evaluateGrammar(TRANSFORM, { type: 'gap', value: 'x' })).toThrow()
  })
})
