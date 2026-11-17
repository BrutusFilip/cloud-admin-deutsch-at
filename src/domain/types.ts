/**
 * Content model. Study data lives in src/content and imports only these types.
 * UI strings live separately in src/i18n.
 */

export type Level = 'B1' | 'B2' | 'C1'
export const LEVELS: readonly Level[] = ['B1', 'B2', 'C1']

export type TopicId =
  | 'intro'
  | 'communication'
  | 'identity'
  | 'access'
  | 'm365'
  | 'azure'
  | 'windows'
  | 'network'
  | 'incidents'
  | 'powershell'
  | 'handover'
  | 'career'
  | 'austria'

/** Stable item ID `<topic>-<v|s|g>-<NNN>`. Never renamed or reused once published. */
export type ItemId = string

export type ExerciseType = 'flashcard' | 'write' | 'grammar'
export const EXERCISE_TYPES: readonly ExerciseType[] = ['flashcard', 'write', 'grammar']

/**
 * What the learner chooses in Practice. Listening ('listen') practises the
 * flashcards (DE → CZ) by ear: the German is played and shown only on reveal,
 * so progress stays with the flashcard.
 */
export type PracticeMode = ExerciseType | 'listen'
export const PRACTICE_MODES: readonly PracticeMode[] = ['flashcard', 'listen', 'write', 'grammar']

/** A card is one item practised in one way. Progress is stored per card. */
export type CardId = `${string}:${ExerciseType}`

export interface Topic {
  id: TopicId
  /** Position on the study path; new cards are offered in this order. */
  order: number
  titleCz: string
  titleDe: string
}

export interface Example {
  de: string
  cz: string
}

export interface Source {
  label: string
  url: string
  page?: string
  checkedAt: string
}

/** strict = exact case · ignore-first = case of the very first letter does not matter · ignore = case-insensitive */
export type CaseRule = 'strict' | 'ignore-first' | 'ignore'
/** strict = punctuation counts · ignore-final = trailing . ! ? do not matter · ignore = punctuation does not matter */
export type PunctuationRule = 'strict' | 'ignore-final' | 'ignore'

export interface AnswerRules {
  case: CaseRule
  punctuation: PunctuationRule
}

/** An explicitly allowed alternative answer. Nothing else is merged automatically. */
export interface AcceptedVariant {
  text: string
  noteCz?: string
}

export interface WriteSpec {
  /** auto = the app checks the answer · compare = free sentence: compare with the model and rate yourself */
  mode: 'auto' | 'compare'
  /** Czech prompt; defaults to the item's Czech meaning. */
  promptCz?: string
  accept?: AcceptedVariant[]
  rules?: Partial<AnswerRules>
}

interface ItemBase {
  id: ItemId
  topic: TopicId
  level: Level
  /** German form: noun with article, verb infinitive, phrase or sentence; for grammar tasks the solved sentence. */
  de: string
  /** Czech meaning. */
  cz: string
  /** One sentence in context. */
  example: Example
  noteCz?: string
  /** Austrian usage or a difference from German German. */
  atNote?: string
  sources?: Source[]
  /** A model sentence about experience: not the learner's own, to be adapted. */
  illustrative?: true
}

export type Gender = 'm' | 'f' | 'n'
export const GENDERS: readonly Gender[] = ['m', 'f', 'n']

export interface NounItem extends ItemBase {
  kind: 'noun'
  gender: Gender
  /** Plural with article; null when the noun has no plural. */
  plural: string | null
  /** Omitted = default writing exercise; false = flashcard only. */
  write?: WriteSpec | false
}

export interface VerbItem extends ItemBase {
  kind: 'verb'
  /** Valency, e.g. "jemandem (D) etwas (A) zuweisen". */
  government: string
  /** Relevant past forms, e.g. "wies zu – hat zugewiesen". */
  past: string
  write?: WriteSpec | false
}

export interface PhraseItem extends ItemBase {
  kind: 'phrase'
  grammar?: string
  write?: WriteSpec | false
}

export interface WordItem extends ItemBase {
  kind: 'word'
  pos: 'adverb' | 'adjective'
  grammar?: string
  write?: WriteSpec | false
}

export interface SentenceItem extends ItemBase {
  kind: 'sentence'
  write: WriteSpec
}

/** Grammar phenomena of block 6. */
export type GrammarFocus = 'word-order' | 'case' | 'separable' | 'past' | 'konjunktiv'
export const GRAMMAR_FOCI: readonly GrammarFocus[] = ['word-order', 'case', 'separable', 'past', 'konjunktiv']

/** The blank marker in task texts. */
export const BLANK = '___'

/** Type the missing word(s) into the single blank of `text`. */
export interface GapTask {
  type: 'gap'
  text: string
  /** Accepted fill-ins; [0] gives the canonical sentence. */
  answers: string[]
  /** Default: case strict (ignore-first when the blank starts the sentence), punctuation ignored. */
  rules?: Partial<AnswerRules>
}

/** Pick exactly one option. With `text`, the option fills its blank; without it, options are whole sentences. */
export interface ChoiceTask {
  type: 'choice'
  text?: string
  options: string[]
  correct: number
  /**
   * Per option, in Czech: why a wrong option does not work (the one mistake it
   * contains). The entry of the correct option stays ''. Shown after answering.
   */
  whyCz: string[]
}

/** Put the tokens in order; the result fills the blank of `text`. Tokens are shown in the given order. */
export interface OrderTask {
  type: 'order'
  text: string
  tokens: string[]
  /** Accepted orders written out; [0] gives the canonical sentence. */
  answers: string[]
}

/** Rewrite `source` as instructed (join sentences, change tense …). */
export interface TransformTask {
  type: 'transform'
  source: string
  /** Accepted sentences; [0] is the canonical one. */
  answers: string[]
  /** Default: first letter free, final punctuation free, commas count. */
  rules?: Partial<AnswerRules>
}

export type GrammarTask = GapTask | ChoiceTask | OrderTask | TransformTask
export type GrammarTaskType = GrammarTask['type']
export const GRAMMAR_TASK_TYPES: readonly GrammarTaskType[] = ['gap', 'choice', 'order', 'transform']

export interface GrammarItem extends ItemBase {
  kind: 'grammar'
  focus: GrammarFocus
  /** Czech instruction, e.g. "Doplňte člen ve správném pádě." */
  promptCz: string
  task: GrammarTask
  /** Why the solution works – shown after every answer. */
  explanationCz: string
}

export type VocabItem = NounItem | VerbItem | PhraseItem | WordItem
export type StudyItem = VocabItem | SentenceItem | GrammarItem
export type ItemKind = StudyItem['kind']
export const ITEM_KINDS: readonly ItemKind[] = ['noun', 'verb', 'phrase', 'word', 'sentence', 'grammar']

export interface Card {
  id: CardId
  item: StudyItem
  exercise: ExerciseType
  /** Global position on the study path (topic order, then content order). */
  pathIndex: number
}

/** "Incident za 5 kroků": a short fictitious case with five auto-checked steps. */
export interface ChallengeStep {
  item: ItemId
  /** Czech name of the stage, e.g. "Upřesnění problému". */
  stageCz: string
}

export interface ChallengeCase {
  /** Stable kebab-case ID. */
  id: string
  level: Level
  titleCz: string
  titleDe: string
  situationDe: string
  situationCz: string
  steps: ChallengeStep[]
}

export const CHALLENGE_STEPS = 5

// ---------------------------------------------------------------- interview (E5)

/**
 * Answer structures the interview trains:
 * - personal: starting point → experience and reason → goal (introduction, motivation)
 * - experience: STAR – situation → task → action → result
 * - technical: clarify the problem → test the hypothesis → safe next step → communication
 */
export type InterviewQuestionKind = 'personal' | 'experience' | 'technical'
export const INTERVIEW_QUESTION_KINDS: readonly InterviewQuestionKind[] = ['personal', 'experience', 'technical']

export type AnswerStep =
  | 'start'
  | 'reason'
  | 'goal'
  | 'situation'
  | 'task'
  | 'action'
  | 'result'
  | 'clarify'
  | 'verify'
  | 'safe'
  | 'communicate'

/** Steps of each structure, in the order an answer should follow. */
export const ANSWER_STEPS: Record<InterviewQuestionKind, readonly AnswerStep[]> = {
  personal: ['start', 'reason', 'goal'],
  experience: ['situation', 'task', 'action', 'result'],
  technical: ['clarify', 'verify', 'safe', 'communicate'],
}

export interface ModelPart {
  step: AnswerStep
  de: string
}

/** A fact in the illustrative model answer that the learner replaces with their own. */
export interface ReplaceFact {
  /** Exact text in the model answer (main or follow-up), highlighted on screen. */
  text: string
  /** What to put there instead. */
  noteCz: string
}

export interface FollowUp {
  de: string
  cz: string
  model: { de: string; cz: string }
}

export interface Phrase {
  de: string
  cz: string
}

export type SelfCheckId = 'direct' | 'structure' | 'vocabulary' | 'followUp'
export const SELF_CHECK_IDS: readonly SelfCheckId[] = ['direct', 'structure', 'vocabulary', 'followUp']

export interface InterviewQuestion {
  /** Stable ID `<topic>-i-<NNN>`; attempts are stored per question ID. */
  id: string
  topic: TopicId
  kind: InterviewQuestionKind
  /** Recommended speaking time for the main answer. */
  seconds: 60 | 75 | 90
  de: string
  cz: string
  /** Optional hint: what the answer should cover. */
  hintCz: string[]
  /** Possible first words of an answer. */
  startersDe: string[]
  /** At least one context follow-up; repeated attempts rotate through them. */
  followUps: FollowUp[]
  /** Short illustrative model answer, sentence groups labelled with the structure steps. */
  model: { parts: ModelPart[]; cz: string }
  replace: ReplaceFact[]
  phrases: Phrase[]
  /** Concrete criteria for the self-assessment. */
  checks: Record<SelfCheckId, string>
  /** 2–3 related dictionary items. */
  dictionary: ItemId[]
}

export interface Interview {
  /** Stable kebab-case ID. */
  id: string
  level: Level
  titleCz: string
  titleDe: string
  /** Fictitious setting of the conversation. */
  contextDe: string
  contextCz: string
  questions: InterviewQuestion[]
}
