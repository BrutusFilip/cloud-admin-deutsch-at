import type { ChallengeCase, GrammarItem } from '../types'

/** Small, stable grammar tasks – one per task type – independent of the real study data. */

export const GAP: GrammarItem = {
  id: 'identity-g-001',
  kind: 'grammar',
  topic: 'identity',
  level: 'B2',
  focus: 'case',
  promptCz: 'Doplňte určitý člen.',
  task: { type: 'gap', text: 'Ich habe ___ Kollegin das Konto entsperrt.', answers: ['der'] },
  de: 'Ich habe der Kollegin das Konto entsperrt.',
  cz: 'Kolegyni jsem odemkl účet.',
  explanationCz: 'Komu → dativ: der Kollegin.',
  example: { de: 'Ich habe dem Kollegen geholfen.', cz: 'Pomohl jsem kolegovi.' },
}

export const GAP_START: GrammarItem = {
  id: 'identity-g-002',
  kind: 'grammar',
  topic: 'identity',
  level: 'B2',
  focus: 'konjunktiv',
  promptCz: 'Doplňte zdvořilý tvar.',
  task: { type: 'gap', text: '___ Sie mir bitte helfen?', answers: ['Könnten', 'Würden'] },
  de: 'Könnten Sie mir bitte helfen?',
  cz: 'Mohl byste mi prosím pomoct?',
  explanationCz: 'Konjunktiv II zní zdvořile.',
  example: { de: 'Würden Sie das bitte prüfen?', cz: 'Ověřil byste to prosím?' },
}

export const CHOICE: GrammarItem = {
  id: 'm365-g-001',
  kind: 'grammar',
  topic: 'm365',
  level: 'B1',
  focus: 'case',
  promptCz: 'Vyberte předložku.',
  task: {
    type: 'choice',
    text: 'Ich kümmere mich ___ das Ticket.',
    options: ['für', 'um', 'über'],
    correct: 1,
    whyCz: ['„für“ = pro; s „kümmern“ se nepojí.', '', '„sich kümmern über“ neexistuje.'],
  },
  de: 'Ich kümmere mich um das Ticket.',
  cz: 'Postarám se o ticket.',
  explanationCz: 'sich kümmern um + A.',
  example: { de: 'Wer kümmert sich um die Übergabe?', cz: 'Kdo se postará o předání?' },
}

export const CHOICE_FULL: GrammarItem = {
  id: 'm365-g-002',
  kind: 'grammar',
  topic: 'm365',
  level: 'B2',
  focus: 'word-order',
  promptCz: 'Vyberte správnou větu.',
  task: {
    type: 'choice',
    options: ['Können Sie mir sagen, seit wann besteht das Problem?', 'Können Sie mir sagen, seit wann das Problem besteht?'],
    correct: 1,
    whyCz: ['V nepřímé otázce je sloveso na konci.', ''],
  },
  de: 'Können Sie mir sagen, seit wann das Problem besteht?',
  cz: 'Můžete mi říct, od kdy problém trvá?',
  explanationCz: 'Nepřímá otázka: sloveso na konci.',
  example: { de: 'Wissen Sie, wann es begonnen hat?', cz: 'Víte, kdy to začalo?' },
}

export const ORDER: GrammarItem = {
  id: 'm365-g-003',
  kind: 'grammar',
  topic: 'm365',
  level: 'B2',
  focus: 'word-order',
  promptCz: 'Seřaďte slova.',
  task: {
    type: 'order',
    text: 'Die Anmeldung schlägt fehl, weil ___.',
    tokens: ['ist', 'das Kennwort', 'abgelaufen'],
    answers: ['das Kennwort abgelaufen ist'],
  },
  de: 'Die Anmeldung schlägt fehl, weil das Kennwort abgelaufen ist.',
  cz: 'Přihlášení selhává, protože vypršelo heslo.',
  explanationCz: 'Po „weil“ stojí sloveso na konci.',
  example: { de: 'Das VPN geht nicht, weil das Zertifikat abgelaufen ist.', cz: 'VPN nejde, protože vypršel certifikát.' },
}

export const TRANSFORM: GrammarItem = {
  id: 'identity-g-003',
  kind: 'grammar',
  topic: 'identity',
  level: 'B1',
  focus: 'past',
  promptCz: 'Převeďte do perfekta.',
  task: {
    type: 'transform',
    source: 'Ich setze das Kennwort zurück.',
    answers: ['Ich habe das Kennwort zurückgesetzt.', 'Das Kennwort habe ich zurückgesetzt.'],
  },
  de: 'Ich habe das Kennwort zurückgesetzt.',
  cz: 'Obnovil jsem heslo.',
  explanationCz: 'Perfektum: haben + příčestí.',
  example: { de: 'Wir haben das Konto gesperrt.', cz: 'Zablokovali jsme účet.' },
}

export const GRAMMAR_ITEMS: GrammarItem[] = [GAP, GAP_START, CHOICE, CHOICE_FULL, ORDER, TRANSFORM]

export const CHALLENGE: ChallengeCase = {
  id: 'test-case',
  level: 'B2',
  titleCz: 'Testovací případ',
  titleDe: 'Testfall',
  situationDe: 'Eine Kollegin kann sich nicht anmelden.',
  situationCz: 'Kolegyně se nemůže přihlásit.',
  steps: [
    { item: 'identity-g-001', stageCz: 'Upřesnění' },
    { item: 'm365-g-002', stageCz: 'Rozsah' },
    { item: 'm365-g-003', stageCz: 'Příčina' },
    { item: 'identity-s-001', stageCz: 'Komunikace' },
    { item: 'identity-g-003', stageCz: 'Předání' },
  ],
}
