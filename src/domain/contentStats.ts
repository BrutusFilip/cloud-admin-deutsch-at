import { kindGroup, type KindGroup } from './search'
import {
  EXERCISE_TYPES,
  GRAMMAR_FOCI,
  GRAMMAR_TASK_TYPES,
  INTERVIEW_QUESTION_KINDS,
  ITEM_KINDS,
  LEVELS,
  type Card,
  type ChallengeCase,
  type Interview,
  type InterviewQuestionKind,
  type ExerciseType,
  type GrammarFocus,
  type GrammarTaskType,
  type ItemKind,
  type Level,
  type StudyItem,
  type Topic,
  type TopicId,
} from './types'

/** Real counts of the study content, printed by `npm run stats:content`. */
export interface ContentStats {
  items: number
  cards: number
  challenges: number
  illustrative: number
  byKind: Record<ItemKind, number>
  byLevel: Record<Level, number>
  byExercise: Record<ExerciseType, number>
  byFocus: Record<GrammarFocus, number>
  byTaskType: Record<GrammarTaskType, number>
  byTopic: { id: TopicId; titleCz: string; groups: Record<KindGroup, number>; total: number }[]
}

function zero<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>
}

export function contentStats(
  items: readonly StudyItem[],
  topics: readonly Topic[],
  cards: readonly Card[],
  challenges: readonly ChallengeCase[],
): ContentStats {
  const byKind = zero(ITEM_KINDS)
  const byLevel = zero(LEVELS)
  const byExercise = zero(EXERCISE_TYPES)
  const byFocus = zero(GRAMMAR_FOCI)
  const byTaskType = zero(GRAMMAR_TASK_TYPES)
  for (const item of items) {
    byKind[item.kind]++
    byLevel[item.level]++
    if (item.kind === 'grammar') {
      byFocus[item.focus]++
      byTaskType[item.task.type]++
    }
  }
  for (const card of cards) byExercise[card.exercise]++
  const byTopic = [...topics]
    .sort((a, b) => a.order - b.order)
    .map((topic) => {
      const groups: Record<KindGroup, number> = { vocab: 0, sentence: 0, grammar: 0 }
      const own = items.filter((i) => i.topic === topic.id)
      for (const item of own) groups[kindGroup(item.kind)]++
      return { id: topic.id, titleCz: topic.titleCz, groups, total: own.length }
    })
  return {
    items: items.length,
    cards: cards.length,
    challenges: challenges.length,
    illustrative: items.filter((i) => i.illustrative === true).length,
    byKind,
    byLevel,
    byExercise,
    byFocus,
    byTaskType,
    byTopic,
  }
}

function table(head: readonly string[], rows: readonly (readonly (string | number)[])[]): string {
  const line = (cells: readonly (string | number)[]) => `| ${cells.join(' | ')} |`
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n')
}

/** Counts of the Pohovor content. */
export interface InterviewStats {
  interviews: number
  questions: number
  followUps: number
  replaceFacts: number
  dictionaryLinks: number
  byKind: Record<InterviewQuestionKind, number>
  rows: { id: string; titleCz: string; level: Level; byKind: Record<InterviewQuestionKind, number>; questions: number }[]
}

export function interviewStats(interviews: readonly Interview[]): InterviewStats {
  const byKind = zero(INTERVIEW_QUESTION_KINDS)
  const questions = interviews.flatMap((i) => i.questions)
  for (const q of questions) byKind[q.kind]++
  return {
    interviews: interviews.length,
    questions: questions.length,
    followUps: questions.reduce((n, q) => n + q.followUps.length, 0),
    replaceFacts: questions.reduce((n, q) => n + q.replace.length, 0),
    dictionaryLinks: questions.reduce((n, q) => n + q.dictionary.length, 0),
    byKind,
    rows: interviews.map((i) => {
      const own = zero(INTERVIEW_QUESTION_KINDS)
      for (const q of i.questions) own[q.kind]++
      return { id: i.id, titleCz: i.titleCz, level: i.level, byKind: own, questions: i.questions.length }
    }),
  }
}

export function interviewStatsMarkdown(s: InterviewStats): string {
  return [
    `Pohovory: **${s.interviews}** · hlavní otázky: **${s.questions}** · doplňující otázky: **${s.followUps}** · fakta k nahrazení: **${s.replaceFacts}** · odkazy do slovníku: **${s.dictionaryLinks}**`,
    '',
    table(
      ['Pohovor', 'Úroveň', 'Osobní', 'Zkušenost (STAR)', 'Technické', 'Celkem'],
      s.rows.map((r) => [`${r.titleCz} (\`${r.id}\`)`, r.level, r.byKind.personal, r.byKind.experience, r.byKind.technical, r.questions]),
    ),
  ].join('\n')
}

/** Markdown tables for PROJECT_STATE.md. */
export function statsMarkdown(s: ContentStats): string {
  const pairs = <K extends string>(record: Record<K, number>) => Object.entries(record) as [K, number][]
  return [
    `Položky: **${s.items}** · karty: **${s.cards}** · výzvy: **${s.challenges}** · ilustrační: **${s.illustrative}**`,
    '',
    table(['Druh', 'Počet'], pairs(s.byKind)),
    '',
    table(['Úroveň', 'Počet'], pairs(s.byLevel)),
    '',
    table(['Cvičení (karta)', 'Počet'], pairs(s.byExercise)),
    '',
    table(['Gramatika: zaměření', 'Počet'], pairs(s.byFocus)),
    '',
    table(['Gramatika: typ úlohy', 'Počet'], pairs(s.byTaskType)),
    '',
    table(
      ['Téma', 'Slovní zásoba', 'Věty', 'Gramatika', 'Celkem'],
      s.byTopic.map((t) => [`${t.titleCz} (\`${t.id}\`)`, t.groups.vocab, t.groups.sentence, t.groups.grammar, t.total]),
    ),
  ].join('\n')
}
