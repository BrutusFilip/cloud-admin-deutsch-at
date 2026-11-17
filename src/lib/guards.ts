import { TOPICS } from '../content'
import { KIND_GROUPS, type KindGroup } from '../domain/search'
import { GRAMMAR_FOCI, LEVELS, type GrammarFocus, type Level, type TopicId } from '../domain/types'

export function isTopicId(value: string): value is TopicId {
  return TOPICS.some((t) => t.id === value)
}

export function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value)
}

export function isFocus(value: string): value is GrammarFocus {
  return (GRAMMAR_FOCI as readonly string[]).includes(value)
}

export function isKindGroup(value: string): value is KindGroup {
  return (KIND_GROUPS as readonly string[]).includes(value)
}
