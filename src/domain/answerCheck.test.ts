import { describe, expect, it } from 'vitest'
import { evaluateAnswer, normalizeForCompare, normalizeText, type Evaluation } from './answerCheck'
import { evaluateItemAnswer, evaluateWritten } from './cards'
import { NOUN, NOUN_ESZETT, NOUN_ESZETT_VARIANT, SENTENCE, VERB } from './__fixtures__/items'
import type { AnswerRules } from './types'

const WORD: AnswerRules = { case: 'ignore-first', punctuation: 'ignore' }
const SENTENCE_RULES: AnswerRules = { case: 'ignore-first', punctuation: 'ignore-final' }

function hintsOf(e: Evaluation) {
  return e.result === 'incorrect' ? e.hints : []
}

describe('normalisation', () => {
  it('normalises Unicode to NFC', () => {
    const decomposed = 'zurücksetzen'
    expect(decomposed).not.toBe('zurücksetzen')
    expect(normalizeText(decomposed)).toBe('zurücksetzen')
    expect(evaluateItemAnswer(VERB, decomposed).result).toBe('correct')
  })

  it('trims and collapses spaces, tabs, line breaks and non-breaking spaces', () => {
    expect(normalizeText('  das \t Postfach \n')).toBe('das Postfach')
    expect(normalizeText('das  Postfach')).toBe('das Postfach')
    expect(normalizeText('das​Postfach')).toBe('dasPostfach')
    expect(evaluateItemAnswer(NOUN, '   das    Postfach  ').result).toBe('correct')
  })

  it('unifies typographic quotes and removes spaces before punctuation', () => {
    expect(normalizeText('„Danke“ , sagte er .')).toBe('"Danke", sagte er.')
  })

  it('applies case and punctuation rules per exercise', () => {
    expect(normalizeForCompare('Das Postfach.', WORD)).toBe('das Postfach')
    expect(normalizeForCompare('Bitte starten Sie den Computer neu!', SENTENCE_RULES)).toBe('bitte starten Sie den Computer neu')
    expect(normalizeForCompare('Ja, gerne.', SENTENCE_RULES)).toBe('ja, gerne')
    expect(normalizeForCompare('Das Postfach', { case: 'ignore', punctuation: 'strict' })).toBe('das postfach')
  })
})

describe('umlauts and ß are never merged automatically', () => {
  it('rejects a missing umlaut and explains it', () => {
    const e = evaluateItemAnswer(VERB, 'zurucksetzen')
    expect(e.result).toBe('incorrect')
    expect(hintsOf(e)).toEqual([{ type: 'special-letters', expected: 'zurücksetzen', given: 'zurucksetzen', letters: ['ü'] }])
  })

  it('rejects the transliteration "ue" as well', () => {
    expect(hintsOf(evaluateItemAnswer(VERB, 'zuruecksetzen'))[0]).toMatchObject({ type: 'special-letters', letters: ['ü'] })
  })

  it('rejects ss for ß unless the item lists it explicitly', () => {
    const rejected = evaluateItemAnswer(NOUN_ESZETT, 'die Grösse')
    expect(rejected.result).toBe('incorrect')
    const strict = evaluateItemAnswer(NOUN_ESZETT, 'die Groesse')
    expect(hintsOf(strict)[0]).toMatchObject({ type: 'special-letters', letters: ['ö', 'ß'] })

    const allowed = evaluateItemAnswer(NOUN_ESZETT_VARIANT, 'die Strasse')
    expect(allowed).toEqual({ result: 'correct', variant: { text: 'die Strasse', noteCz: 'Švýcarský pravopis.' } })
  })

  it('accepts the canonical spelling with ä/ö/ü/ß', () => {
    expect(evaluateItemAnswer(NOUN_ESZETT, 'die Größe').result).toBe('correct')
  })
})

describe('capitalisation, articles and word order keep their meaning', () => {
  it('ignores only the very first letter (phones capitalise it)', () => {
    expect(evaluateItemAnswer(NOUN, 'Das Postfach').result).toBe('correct')
  })

  it('reports a lower-case noun', () => {
    expect(hintsOf(evaluateItemAnswer(NOUN, 'das postfach'))).toEqual([
      { type: 'capitalization', expected: 'Postfach', given: 'postfach' },
    ])
  })

  it('reports lower-case "sie" where the polite "Sie" is meant', () => {
    expect(hintsOf(evaluateItemAnswer(SENTENCE, 'Bitte starten sie den Computer neu.'))).toEqual([
      { type: 'capitalization', expected: 'Sie', given: 'sie' },
    ])
  })

  it('reports a wrong article', () => {
    expect(hintsOf(evaluateItemAnswer(NOUN, 'der Postfach'))).toEqual([{ type: 'determiner', expected: 'das', given: 'der' }])
  })

  it('reports a missing article', () => {
    expect(hintsOf(evaluateItemAnswer(NOUN, 'Postfach'))).toEqual([{ type: 'missing-word', expected: 'das', determiner: true }])
  })

  it('reports the plural instead of the singular', () => {
    expect(hintsOf(evaluateItemAnswer(NOUN, 'die Postfächer'))).toEqual([{ type: 'plural-instead' }])
  })

  it('reports word order when all words are right', () => {
    expect(hintsOf(evaluateItemAnswer(SENTENCE, 'Bitte Sie starten den Computer neu.'))).toEqual([
      { type: 'word-order', moved: ['Sie'], expected: 'Bitte starten Sie den Computer neu.' },
    ])
  })

  it('names the word that stands elsewhere, e.g. the verb at the end of a subordinate clause', () => {
    const e = evaluateAnswer(
      'Ich habe dem Team mitgeteilt, dass die Störung ist seit 10 Uhr behoben.',
      'Ich habe dem Team mitgeteilt, dass die Störung seit 10 Uhr behoben ist.',
      [],
      SENTENCE_RULES,
    )
    expect(hintsOf(e)).toEqual([
      { type: 'word-order', moved: ['ist'], expected: 'Ich habe dem Team mitgeteilt, dass die Störung seit 10 Uhr behoben ist.' },
    ])
  })
})

describe('punctuation is cosmetic', () => {
  it('accepts an answer that only lacks a comma and says where the comma belongs', () => {
    expect(evaluateAnswer('Ja gerne', 'Ja, gerne.', [], SENTENCE_RULES)).toEqual({
      result: 'correct',
      variant: null,
      notes: [{ type: 'punctuation', changes: [{ change: 'missing', mark: ',', after: 'Ja', before: 'gerne' }] }],
    })
  })

  it('names an extra comma too', () => {
    const e = evaluateAnswer('Ich glaube, dass, es klappt', 'Ich glaube, dass es klappt.', [], SENTENCE_RULES)
    expect(e).toMatchObject({ result: 'correct', notes: [{ type: 'punctuation', changes: [{ change: 'extra', mark: ',', after: 'dass', before: 'es' }] }] })
  })

  it('a final full stop alone is no note at all', () => {
    expect(evaluateAnswer('Ja, gerne', 'Ja, gerne.', [], SENTENCE_RULES)).toEqual({ result: 'correct', variant: null })
  })

  it('keeps a real mistake a mistake and reports the comma beside it', () => {
    const e = evaluateAnswer('Ich konnte ab Jänner beginnen da es passt', 'Ich könnte ab Jänner beginnen, da es passt.', [], SENTENCE_RULES)
    expect(e.result).toBe('incorrect')
    expect(hintsOf(e)).toEqual([{ type: 'special-letters', expected: 'könnte', given: 'konnte', letters: ['ö'] }])
    expect(e).toMatchObject({ notes: [{ type: 'punctuation', changes: [{ change: 'missing', mark: ',', after: 'beginnen', before: 'da' }] }] })
  })
})

describe('results', () => {
  it('accepts the explicit sentence variant and ignores the final full stop', () => {
    expect(evaluateItemAnswer(SENTENCE, 'Starten Sie bitte den Computer neu')).toEqual({
      result: 'correct',
      variant: { text: 'Starten Sie bitte den Computer neu.' },
    })
  })

  it('returns empty for whitespace only', () => {
    expect(evaluateItemAnswer(NOUN, '   ').result).toBe('empty')
  })

  it('gives no diagnosis when the cause is not certain, but marks the differing words', () => {
    const e = evaluateAnswer('das Konto', 'das Benutzerkonto', [], WORD)
    expect(e.result).toBe('incorrect')
    if (e.result !== 'incorrect') return
    expect(e.hints).toEqual([])
    expect(e.givenParts).toEqual([
      { text: 'das', changed: false },
      { text: 'Konto', changed: true },
    ])
    expect(e.expectedParts).toEqual([
      { text: 'das', changed: false },
      { text: 'Benutzerkonto', changed: true },
    ])
  })

  it('diagnoses against the closest accepted variant', () => {
    const e = evaluateItemAnswer(SENTENCE, 'Starten sie bitte den Computer neu.')
    expect(e.result).toBe('incorrect')
    if (e.result !== 'incorrect') return
    expect(e.expected).toBe('Starten Sie bitte den Computer neu.')
    expect(e.hints).toEqual([{ type: 'capitalization', expected: 'Sie', given: 'sie' }])
  })
})

describe('free translation (compare mode)', () => {
  const FREE = {
    ...SENTENCE,
    de: 'Ich melde mich bei Ihnen, sobald ich mehr weiß.',
    write: { mode: 'compare' as const, accept: [{ text: 'Sobald ich mehr weiß, melde ich mich bei Ihnen.' }] },
  }

  it('the model or a listed formulation counts as correct', () => {
    expect(evaluateWritten(FREE, 'ich melde mich bei Ihnen, sobald ich mehr weiß')).toEqual({ result: 'correct', variant: null })
    expect(evaluateWritten(FREE, 'Sobald ich mehr weiß, melde ich mich bei Ihnen.')).toMatchObject({ result: 'correct', variant: { text: 'Sobald ich mehr weiß, melde ich mich bei Ihnen.' } })
  })

  it('a missing comma is only a note', () => {
    expect(evaluateWritten(FREE, 'Ich melde mich bei Ihnen sobald ich mehr weiß.')).toMatchObject({
      result: 'correct',
      notes: [{ type: 'punctuation', changes: [{ change: 'missing', mark: ',', after: 'Ihnen', before: 'sobald' }] }],
    })
  })

  it('spelling (umlaut, ß, capital letters) has no valid alternative: still a mistake', () => {
    expect(evaluateWritten(FREE, 'Ich melde mich bei Ihnen, sobald ich mehr weiss.')).toMatchObject({
      result: 'incorrect',
      hints: [{ type: 'special-letters', expected: 'weiß', given: 'weiss', letters: ['ß'] }],
    })
    expect(evaluateWritten(FREE, 'Ich melde mich bei ihnen, sobald ich mehr weiß.')).toMatchObject({
      result: 'incorrect',
      hints: [{ type: 'capitalization', expected: 'Ihnen', given: 'ihnen' }],
    })
  })

  it('another wording is not marked wrong: the learner compares and rates', () => {
    const e = evaluateWritten(FREE, 'Ich rufe Sie an, sobald ich Neuigkeiten habe.')
    expect(e.result).toBe('compare')
    if (e.result === 'compare') {
      expect(e.closest).toBe('Ich melde mich bei Ihnen, sobald ich mehr weiß.')
      expect(e.givenParts.some((p) => p.changed)).toBe(true)
    }
  })

  it('an article or a missing word is named as something to check, not as a verdict', () => {
    expect(evaluateWritten(FREE, 'Ich melde mich bei Ihnen, sobald ich weiß.')).toMatchObject({
      result: 'compare',
      hints: [{ type: 'missing-word', expected: 'mehr', determiner: false }],
    })
  })

  it('a misspelt word is named even when the sentence also differs in other ways', () => {
    const e = evaluateWritten(FREE, 'Ich melde mich bei ihnen, wenn ich mehr weiss.')
    expect(e).toMatchObject({
      result: 'compare',
      hints: [
        { type: 'capitalization', expected: 'Ihnen', given: 'ihnen' },
        { type: 'special-letters', expected: 'weiß', given: 'weiss', letters: ['ß'] },
      ],
    })
  })

  it('another wording without a misspelt word gets no spelling hint; the first word may differ in case', () => {
    expect(evaluateWritten(FREE, 'Ich rufe Sie an, sobald ich Neuigkeiten habe.')).toMatchObject({ result: 'compare', hints: [] })
    expect(evaluateWritten(FREE, 'ich rufe Sie an, sobald ich mehr weiß.')).toMatchObject({ result: 'compare', hints: [] })
  })

  it('auto mode keeps judging everything that is not a listed answer', () => {
    expect(evaluateWritten(SENTENCE, 'Starten Sie den Computer bitte neu.').result).toBe('incorrect')
  })
})
