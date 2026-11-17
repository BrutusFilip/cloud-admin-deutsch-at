import type { Interview, InterviewQuestion } from '../types'

/** Small, stable interview – independent of the real study data. */

export const TECH_Q: InterviewQuestion = {
  id: 'identity-i-001',
  topic: 'identity',
  kind: 'technical',
  seconds: 75,
  de: 'Ein Konto ist gesperrt. Wie gehen Sie vor?',
  cz: 'Účet je zablokovaný. Jak postupujete?',
  hintCz: ['Nejdřív ověřte totožnost.', 'Pak zjistěte příčinu.'],
  startersDe: ['Zuerst würde ich …'],
  followUps: [
    {
      de: 'Was tun Sie, wenn es wieder passiert?',
      cz: 'Co uděláte, když se to stane znovu?',
      model: { de: 'Dann würde ich die Anmeldeprotokolle auswerten.', cz: 'Pak bych vyhodnotil protokoly přihlášení.' },
    },
    {
      de: 'Wen informieren Sie?',
      cz: 'Koho informujete?',
      model: { de: 'Ich informiere die Führungskraft.', cz: 'Informuji vedoucího.' },
    },
  ],
  model: {
    parts: [
      { step: 'clarify', de: 'Zuerst würde ich die Identität per Rückruf überprüfen.' },
      { step: 'verify', de: 'Dann würde ich prüfen, warum das Konto gesperrt ist.' },
      { step: 'safe', de: 'Erst danach würde ich es entsperren.' },
      { step: 'communicate', de: 'Zum Schluss dokumentiere ich alles im Ticket.' },
    ],
    cz: 'Nejdřív bych ověřil totožnost zpětným zavoláním. …',
  },
  replace: [{ text: 'per Rückruf', noteCz: 'Váš postup ověření.' }],
  phrases: [
    { de: 'die Identität überprüfen', cz: 'ověřit totožnost' },
    { de: 'ein Konto entsperren', cz: 'odemknout účet' },
    { de: 'im Ticket dokumentieren', cz: 'zapsat do ticketu' },
  ],
  checks: {
    direct: 'První krok hned na začátku.',
    structure: 'Upřesnění → ověření → bezpečný krok → komunikace.',
    vocabulary: 'Např. entsperren, überprüfen.',
    followUp: 'Konkrétní odpověď na doplňující otázku.',
  },
  dictionary: ['identity-v-001', 'identity-s-001'],
}

export const STAR_Q: InterviewQuestion = {
  ...TECH_Q,
  id: 'identity-i-002',
  kind: 'experience',
  de: 'Erzählen Sie von einem schwierigen Ticket.',
  model: {
    parts: [
      { step: 'situation', de: 'Ein Drucker fiel jeden Montag aus.' },
      { step: 'task', de: 'Ich sollte die Ursache finden.' },
      { step: 'action', de: 'Ich habe die Protokolle per Rückruf geprüft.' },
      { step: 'result', de: 'Seitdem läuft er stabil.' },
    ],
    cz: 'Tiskárna každé pondělí vypadla. …',
  },
}

export const PERSONAL_Q: InterviewQuestion = {
  ...TECH_Q,
  id: 'm365-i-001',
  topic: 'm365',
  kind: 'personal',
  de: 'Warum interessiert Sie diese Stelle?',
  model: {
    parts: [
      { step: 'start', de: 'Derzeit arbeite ich im Support.' },
      { step: 'reason', de: 'Ich habe gelernt, Probleme per Rückruf zu klären.' },
      { step: 'goal', de: 'Jetzt möchte ich in die Administration wechseln.' },
    ],
    cz: 'V současnosti pracuji v supportu. …',
  },
}

export const INTERVIEW: Interview = {
  id: 'test-interview',
  level: 'B2',
  titleCz: 'Testovací pohovor',
  titleDe: 'Testgespräch',
  contextDe: 'Ein kurzes Testgespräch.',
  contextCz: 'Krátký testovací pohovor.',
  questions: [TECH_Q, STAR_Q, PERSONAL_Q],
}
