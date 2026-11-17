import type { NounItem, SentenceItem, StudyItem, Topic, VerbItem } from '../types'

/** Small, stable test content – independent of the real study data. */

export const TOPICS: Topic[] = [
  { id: 'identity', order: 1, titleCz: 'Identity', titleDe: 'Identitäten' },
  { id: 'm365', order: 2, titleCz: 'Microsoft 365', titleDe: 'Microsoft 365' },
]

export const VERB: VerbItem = {
  id: 'identity-v-001',
  kind: 'verb',
  topic: 'identity',
  level: 'B2',
  de: 'zurücksetzen',
  government: 'etwas (A) zurücksetzen',
  past: 'setzte zurück – hat zurückgesetzt',
  cz: 'obnovit, resetovat',
  example: { de: 'Ich habe das Passwort zurückgesetzt.', cz: 'Obnovil jsem heslo.' },
}

export const SENTENCE: SentenceItem = {
  id: 'identity-s-001',
  kind: 'sentence',
  topic: 'identity',
  level: 'B1',
  de: 'Bitte starten Sie den Computer neu.',
  cz: 'Restartujte prosím počítač.',
  example: { de: 'Bitte starten Sie den Computer neu.', cz: 'Restartujte prosím počítač.' },
  write: { mode: 'auto', accept: [{ text: 'Starten Sie bitte den Computer neu.' }] },
}

export const NOUN: NounItem = {
  id: 'm365-v-001',
  kind: 'noun',
  topic: 'm365',
  level: 'B1',
  de: 'das Postfach',
  gender: 'n',
  plural: 'die Postfächer',
  cz: 'poštovní schránka',
  example: { de: 'Das Postfach ist voll.', cz: 'Schránka je plná.' },
}

export const NOUN_ESZETT_VARIANT: NounItem = {
  id: 'm365-v-002',
  kind: 'noun',
  topic: 'm365',
  level: 'B1',
  de: 'die Straße',
  gender: 'f',
  plural: 'die Straßen',
  cz: 'ulice',
  example: { de: 'Die Straße ist gesperrt.', cz: 'Ulice je uzavřená.' },
  write: { mode: 'auto', accept: [{ text: 'die Strasse', noteCz: 'Švýcarský pravopis.' }] },
}

export const NOUN_ESZETT: NounItem = {
  id: 'm365-v-003',
  kind: 'noun',
  topic: 'm365',
  level: 'B2',
  de: 'die Größe',
  gender: 'f',
  plural: 'die Größen',
  cz: 'velikost',
  example: { de: 'Die Größe des Postfachs ist begrenzt.', cz: 'Velikost schránky je omezená.' },
}

export const FREE_SENTENCE: SentenceItem = {
  id: 'm365-s-001',
  kind: 'sentence',
  topic: 'm365',
  level: 'C1',
  de: 'Ich würde zuerst die Identität überprüfen.',
  cz: 'Nejdřív bych ověřil totožnost.',
  example: { de: 'Ich würde zuerst die Identität überprüfen.', cz: 'Nejdřív bych ověřil totožnost.' },
  write: { mode: 'compare' },
}

/** Path order: identity (VERB, SENTENCE), then m365 (NOUN, NOUN_ESZETT_VARIANT, NOUN_ESZETT, FREE_SENTENCE). */
export const ITEMS: StudyItem[] = [NOUN, NOUN_ESZETT_VARIANT, NOUN_ESZETT, FREE_SENTENCE, VERB, SENTENCE]
