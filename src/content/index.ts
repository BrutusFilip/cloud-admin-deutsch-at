import { buildCards } from '../domain/cards'
import type { Card, CardId, ChallengeCase, Interview, InterviewQuestion, ItemId, StudyItem, Topic, TopicId } from '../domain/types'
import { CHALLENGES } from './challenges'
import { INTERVIEWS } from './interviews'
import { access } from './items/access'
import { austria } from './items/austria'
import { azure } from './items/azure'
import { career } from './items/career'
import { communication } from './items/communication'
import { handover } from './items/handover'
import { identity } from './items/identity'
import { incidents } from './items/incidents'
import { intro } from './items/intro'
import { m365 } from './items/m365'
import { network } from './items/network'
import { powershell } from './items/powershell'
import { windows } from './items/windows'
import { TOPICS } from './topics'

/** Bump when study content changes. */
export const CONTENT_VERSION = '2026-11-11'

/** IDs that were published and later removed. They must never be reused. */
export const RETIRED_IDS: readonly ItemId[] = []

export const ITEMS: readonly StudyItem[] = [
  ...intro,
  ...communication,
  ...identity,
  ...access,
  ...m365,
  ...azure,
  ...windows,
  ...network,
  ...incidents,
  ...powershell,
  ...handover,
  ...career,
  ...austria,
]

export const CARDS: readonly Card[] = buildCards(ITEMS, TOPICS)
export const ITEM_BY_ID: ReadonlyMap<ItemId, StudyItem> = new Map(ITEMS.map((i) => [i.id, i]))
export const CARD_BY_ID: ReadonlyMap<CardId, Card> = new Map(CARDS.map((c) => [c.id, c]))
export const TOPIC_BY_ID: ReadonlyMap<TopicId, Topic> = new Map(TOPICS.map((t) => [t.id, t]))
export const KNOWN_CARD_IDS: ReadonlySet<string> = new Set(CARDS.map((c) => c.id))
export const CHALLENGE_BY_ID: ReadonlyMap<string, ChallengeCase> = new Map(CHALLENGES.map((c) => [c.id, c]))
export const INTERVIEW_BY_ID: ReadonlyMap<string, Interview> = new Map(INTERVIEWS.map((i) => [i.id, i]))

/** Interview questions that link to a dictionary item, for "Použito v pohovoru". */
export function interviewLinks(itemId: ItemId): { interview: Interview; question: InterviewQuestion; n: number }[] {
  return INTERVIEWS.flatMap((interview) =>
    interview.questions.flatMap((question, i) => (question.dictionary.includes(itemId) ? [{ interview, question, n: i + 1 }] : [])),
  )
}

export { CHALLENGES, INTERVIEWS, TOPICS }
