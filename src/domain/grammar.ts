import { closestText, diffParts, evaluateAnswer, normalizeText, wordOrderHint, type CosmeticNote, type DiffPart, type Hint } from './answerCheck'
import {
  BLANK,
  type AnswerRules,
  type ChoiceTask,
  type GapTask,
  type GrammarItem,
  type OrderTask,
  type TransformTask,
} from './types'

/**
 * Grammar tasks: gap (type the missing word), choice (one of 2–4 options),
 * order (put the tokens in order) and transform (rewrite a sentence).
 * Written answers use the same checking as the writing exercise: no folding
 * of ä/ö/ü/ß, alternatives only when the task lists them.
 */

export function countBlanks(text: string): number {
  return text.split(BLANK).length - 1
}

export function fillBlank(text: string, value: string): string {
  return text.replace(BLANK, value)
}

/** Text before and after the blank. */
export function splitBlank(text: string): [string, string] {
  const i = text.indexOf(BLANK)
  if (i < 0) return [text, '']
  return [text.slice(0, i), text.slice(i + BLANK.length)]
}

export function gapRules(task: GapTask): AnswerRules {
  const startsWithBlank = task.text.trimStart().startsWith(BLANK)
  return { case: startsWithBlank ? 'ignore-first' : 'strict', punctuation: 'ignore', ...task.rules }
}

export function transformRules(task: TransformTask): AnswerRules {
  return { case: 'ignore-first', punctuation: 'ignore-final', ...task.rules }
}

/** Tokens are fixed, so the built sentence must match exactly. */
export const ORDER_RULES: AnswerRules = { case: 'strict', punctuation: 'strict' }

export function choiceSentence(task: ChoiceTask, index: number): string {
  const option = task.options[index] ?? ''
  return task.text !== undefined ? fillBlank(task.text, option) : option
}

export function orderText(task: OrderTask, picked: readonly number[]): string {
  return normalizeText(picked.map((i) => task.tokens[i] ?? '').join(' '))
}

/** Text around the answer: the blank's surroundings, or nothing when the answer is the whole sentence. */
export function answerFrame(task: GrammarItem['task']): [string, string] {
  if (task.type === 'transform') return ['', '']
  if (task.type === 'choice' && task.text === undefined) return ['', '']
  return splitBlank(task.text ?? '')
}

/** The full correct sentence the task defines (must equal the item's `de`). */
export function canonicalSentence(item: GrammarItem): string {
  const task = item.task
  switch (task.type) {
    case 'gap':
      return fillBlank(task.text, task.answers[0] ?? '')
    case 'choice':
      return choiceSentence(task, task.correct)
    case 'order':
      return fillBlank(task.text, task.answers[0] ?? '')
    case 'transform':
      return task.answers[0] ?? ''
  }
}

/** Whether `answer` is exactly the tokens, each used once, joined by spaces. */
export function isTokenPermutation(answer: string, tokens: readonly string[]): boolean {
  const target = normalizeText(answer)
  const words = tokens.map((t) => normalizeText(t))
  const used = new Array<boolean>(words.length).fill(false)
  const search = (built: string[]): boolean => {
    if (built.length === words.length) return normalizeText(built.join(' ')) === target
    const prefix = normalizeText(built.join(' '))
    if (prefix !== '' && !target.startsWith(prefix)) return false
    for (let i = 0; i < words.length; i++) {
      if (used[i]) continue
      used[i] = true
      const ok = search([...built, words[i] as string])
      used[i] = false
      if (ok) return true
    }
    return false
  }
  return search([])
}

export type GrammarResponse =
  | { type: 'gap'; value: string }
  | { type: 'choice'; index: number | null }
  | { type: 'order'; picked: readonly number[] }
  | { type: 'transform'; value: string }

export type GrammarEvaluation =
  /** Nothing typed, nothing chosen or not all tokens placed. */
  | { result: 'empty' }
  /** `matched` is the accepted answer as the task writes it (canonical or listed alternative); `notes` = cosmetic differences. */
  | { result: 'correct'; given: string; matched: string; canonical: boolean; notes?: CosmeticNote[] }
  | {
      result: 'incorrect'
      given: string
      expected: string
      hints: Hint[]
      givenParts: DiffPart[]
      expectedParts: DiffPart[]
      notes?: CosmeticNote[]
    }

function fromWritten(value: string, answers: readonly string[], rules: AnswerRules): GrammarEvaluation {
  const [canonical = '', ...rest] = answers
  const evaluation = evaluateAnswer(
    value,
    canonical,
    rest.map((text) => ({ text })),
    rules,
  )
  const given = normalizeText(value)
  if (evaluation.result === 'empty') return { result: 'empty' }
  if (evaluation.result === 'correct') {
    return {
      result: 'correct',
      given,
      matched: evaluation.variant?.text ?? canonical,
      canonical: evaluation.variant === null,
      ...(evaluation.notes ? { notes: evaluation.notes } : {}),
    }
  }
  return {
    result: 'incorrect',
    given,
    expected: evaluation.expected,
    hints: evaluation.hints,
    givenParts: evaluation.givenParts,
    expectedParts: evaluation.expectedParts,
    ...(evaluation.notes ? { notes: evaluation.notes } : {}),
  }
}

export function evaluateGrammar(item: GrammarItem, response: GrammarResponse): GrammarEvaluation {
  const task = item.task
  if (task.type !== response.type) throw new Error(`Response ${response.type} does not fit task ${task.type}.`)
  switch (task.type) {
    case 'gap':
      return fromWritten((response as { value: string }).value, task.answers, gapRules(task))
    case 'transform':
      return fromWritten((response as { value: string }).value, task.answers, transformRules(task))
    case 'choice': {
      const index = (response as { index: number | null }).index
      if (index === null || task.options[index] === undefined) return { result: 'empty' }
      const given = task.options[index] as string
      if (index === task.correct) return { result: 'correct', given, matched: given, canonical: true }
      const expected = task.options[task.correct] as string
      return { result: 'incorrect', given, expected, hints: [], ...diffParts(given, expected, ORDER_RULES) }
    }
    case 'order': {
      const picked = (response as { picked: readonly number[] }).picked
      if (picked.length !== task.tokens.length || new Set(picked).size !== picked.length) return { result: 'empty' }
      const given = orderText(task, picked)
      const index = task.answers.findIndex((a) => normalizeText(a) === given)
      if (index >= 0) return { result: 'correct', given, matched: task.answers[index] ?? given, canonical: index === 0 }
      // Every token is placed, so the difference is the word order: name the words that stand elsewhere.
      const expected = closestText(given, task.answers, ORDER_RULES)
      return { result: 'incorrect', given, expected, hints: [wordOrderHint(given, expected)], ...diffParts(given, expected, ORDER_RULES) }
    }
  }
}
