import type { CosmeticNote, Hint, PunctuationChange } from '../domain/answerCheck'
import type { StudyItem, Gender } from '../domain/types'
import type { Messages } from './cs'

/**
 * German interface for the portfolio demo. Only the interface changes: the
 * study content stays the same – German questions and examples, Czech
 * translations and CZ → DE writing tasks are part of the learning.
 */

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const cards = (n: number) => count(n, 'Karte', 'Karten')
const days = (n: number) => count(n, 'Tag', 'Tage')
const items = (n: number) => count(n, 'Eintrag', 'Einträge')

function quote(s: string): string {
  return `„${s}“`
}

function joinLetters(letters: readonly string[]): string {
  return letters.length <= 1 ? (letters[0] ?? '') : `${letters.slice(0, -1).join(', ')} und ${letters[letters.length - 1]}`
}

const GENDER: Record<Gender, string> = { m: 'maskulin', f: 'feminin', n: 'neutral' }

/** Punctuation marks with article; `plural` for marks named in the plural. */
const MARK: Record<string, { name: string; plural?: boolean }> = {
  ',': { name: 'ein Komma' },
  '.': { name: 'ein Punkt' },
  ';': { name: 'ein Strichpunkt' },
  ':': { name: 'ein Doppelpunkt' },
  '!': { name: 'ein Rufzeichen' },
  '?': { name: 'ein Fragezeichen' },
  '"': { name: 'ein Anführungszeichen' },
  "'": { name: 'ein Apostroph' },
  '(': { name: 'eine Klammer' },
  ')': { name: 'eine Klammer' },
  '…': { name: 'Auslassungspunkte', plural: true },
  '–': { name: 'ein Gedankenstrich' },
  '—': { name: 'ein Gedankenstrich' },
}

/** Words that open a subordinate clause; German always puts a comma before them. */
const CLAUSE_OPENERS = new Set(['dass', 'weil', 'ob', 'wenn', 'damit', 'bevor', 'nachdem', 'sobald', 'obwohl', 'während', 'falls', 'wer', 'was', 'wie', 'wo', 'warum', 'wann', 'worum', 'welche', 'welcher', 'welches'])

function quoteList(words: readonly string[]): string {
  return joinLetters(words.map(quote))
}

function punctuationText(c: PunctuationChange): string {
  const mark = MARK[c.mark] ?? { name: quote(c.mark) }
  const missing = mark.plural ? 'fehlen' : 'fehlt'
  const extra = mark.plural ? 'stehen' : 'steht'
  const wraps = ['"', "'", '(', ')'].includes(c.mark)
  if (c.change === 'missing') {
    if (wraps) return `Beim Wort ${quote(c.after)} ${missing} ${mark.name}.`
    if (c.before === null) return `Am Ende ${missing} ${mark.name}.`
    if (c.mark !== ',') return `Nach ${quote(c.after)} ${missing} ${mark.name}.`
    const clause = CLAUSE_OPENERS.has(c.before.toLocaleLowerCase('de-AT'))
    return `Vor ${quote(c.before)} fehlt ein Komma.${clause ? ' Einen Nebensatz trennt man im Deutschen immer mit Komma ab.' : ''}`
  }
  if (wraps) return `Beim Wort ${quote(c.after)} ${extra} ${mark.name} zu viel.`
  if (c.before === null) return `Am Ende ${extra} ${mark.name} zu viel.`
  return c.mark === ',' ? `Vor ${quote(c.before)} steht ein Komma zu viel.` : `Nach ${quote(c.after)} ${extra} ${mark.name} zu viel.`
}

/** Challenge stages exist in Czech only in the content; the German interface names them here. */
export const STAGES_DE: Readonly<Record<string, string>> = {
  'Upřesnění problému': 'Problem klären',
  Diagnostika: 'Diagnose',
  'Rozsah dopadu': 'Ausmaß der Störung',
  Příčina: 'Ursache',
  Řešení: 'Lösung',
  'Komunikace s týmem': 'Kommunikation im Team',
  'Komunikace s uživatelkou': 'Kommunikation mit der Benutzerin',
  'Ověření totožnosti': 'Identitätsprüfung',
  Předání: 'Übergabe',
  'Záznam do ticketu': 'Dokumentation im Ticket',
}

export const de: Messages = {
  locale: 'de-AT',
  htmlLang: 'de-AT',
  appName: 'Cloud Admin Deutsch',
  title: (x) => x.titleDe,
  subtitle: () => null,
  stage: (stageCz) => STAGES_DE[stageCz] ?? stageCz,
  language: { label: 'Sprache der Bedienung', cs: 'Česky', de: 'Deutsch', short: { cs: 'CZ', de: 'DE' } },
  skipToContent: 'Zum Inhalt springen',
  footer: 'Der Fortschritt wird nur in diesem Browser gespeichert.',

  nav: {
    label: 'Hauptnavigation',
    today: 'Heute',
    practice: 'Üben',
    interview: 'Interview',
    dictionary: 'Wörterbuch',
    settings: 'Einstellungen',
  },

  common: {
    topic: 'Thema',
    level: 'Niveau (Richtwert)',
    levelShort: 'Niveau',
    levelSr: 'Richtwert Niveau',
    levelTitle: 'Niveau als Richtwert nach GERS (B1–C1). Es hilft bei der Auswahl und ist keine zertifizierte Einstufung.',
    allTopics: 'Alle Themen',
    allLevels: 'Alle Niveaus',
    cards,
    days,
    items,
  },

  kind: (item: StudyItem): string => {
    switch (item.kind) {
      case 'noun':
        return 'Substantiv'
      case 'verb':
        return 'Verb'
      case 'phrase':
        return 'Wendung'
      case 'word':
        return item.pos === 'adverb' ? 'Adverb' : 'Adjektiv'
      case 'sentence':
        return 'Satz'
      case 'grammar':
        return 'Grammatikaufgabe'
    }
  },
  gender: (g) => GENDER[g],
  exercise: { flashcard: 'Karteikarte DE → CZ', listen: 'Hören DE → CZ', write: 'Schreiben CZ → DE', grammar: 'Grammatik' },
  focus: {
    'word-order': 'Satzstellung',
    case: 'Fälle und Rektion',
    separable: 'Trennbare Verben',
    past: 'Vergangenheit',
    konjunktiv: 'Höflicher Konjunktiv II',
  },
  taskType: {
    gap: 'Lückentext',
    choice: 'Auswahl',
    order: 'Wörter ordnen',
    transform: 'Satz umformen',
  },
  illustrative: {
    label: 'Beispiel',
    text: 'Beispielhafte Erfahrung, keine Angabe über Sie. Ersetzen Sie sie im Gespräch durch ein eigenes Beispiel, das Sie belegen können.',
  },
  status: { new: 'neu', learning: 'in Arbeit', mastered: 'gefestigt' },
  rating: { again: 'Nochmal', hard: 'Schwer', good: 'Kann ich' },

  relativeDay: (diff, formatted) => {
    if (diff <= 0) return 'heute'
    if (diff === 1) return 'morgen'
    if (diff < 7) return `in ${diff} Tagen`
    return `in ${diff} Tagen, ${formatted}`
  },

  today: {
    title: 'Heute',
    resumeTitle: 'Begonnene Lektion',
    resumeText: (done, total, waiting) =>
      `${done} von ${total} erledigt. Bewertete Karten sind gespeichert.${waiting ? ' Die Antwort auf die aktuelle Karte ist gespeichert und wartet auf die Bewertung.' : ''}`,
    resume: 'Lektion fortsetzen',
    discard: 'Verwerfen und neu beginnen',
    discardHint: 'Bewertete Karten bleiben gespeichert, die begonnene Lektion wird geschlossen.',
    planTitle: 'Empfohlene Lektion',
    planAfterResume: 'Eine neue Lektion beginnen Sie, wenn die begonnene fertig ist oder Sie sie oben verwerfen.',
    topicsLead: 'Mit einem Klick auf ein Thema beschränken Sie die empfohlene Lektion darauf.',
    due: 'Fällig',
    fresh: 'Neu',
    mastered: 'Gefestigt',
    preview: (due, fresh) =>
      due > 0 && fresh > 0
        ? `Das Training bietet ${cards(due)} zur Wiederholung und ${fresh} neue.`
        : due > 0
          ? `Das Training bietet ${cards(due)} zur Wiederholung.`
          : `Das Training bietet ${count(fresh, 'neue Karte', 'neue Karten')}.`,
    start: 'Training starten',
    emptyTopicTitle: 'In diesem Thema wartet gerade nichts',
    emptyAllTitle: 'Für heute ist alles erledigt',
    nextDue: (when, n) => `Nächste Wiederholung: ${when} (${cards(n)}).`,
    nothingSeen: 'Alle Karten dieser Auswahl haben Sie schon gesehen, und gerade ist keine fällig.',
    freePractice: 'Frei üben',
    freePracticeHint: 'Freies Üben verlängert keine Termine, es kann den Plan nur verschärfen.',
    showAll: 'Alle Themen anzeigen',
    topicsTitle: 'Themen',
    topicRow: (due, fresh) => `${due} fällig, ${fresh} neu`,
    welcomeTitle: 'Willkommen bei Cloud Admin Deutsch',
    welcomeText:
      'Deutschtraining für Vorstellungsgespräche in der IT-Administration in Österreich (Cloud, Azure, Microsoft 365) auf Niveau B2–C1. Die Lerninhalte sind in österreichischem Standarddeutsch, die Erklärungen auf Tschechisch.',
    welcomeLesson: 'Training: kurze Lektion mit Karteikarten, Schreiben und Grammatik; Wiederholungen werden automatisch geplant.',
    welcomeInterview: 'Interview: Sie beantworten Fragen laut und vergleichen sich danach mit einer Musterantwort.',
    welcomeDictionary: 'Wörterbuch: alle Einträge mit Beispielen, Rektion und österreichischen Varianten.',
    welcomeNote: 'Der Fortschritt wird nur in diesem Browser gespeichert. Übertragung und Sicherung finden Sie in den Einstellungen.',
    locked: (n) => `Weitere ${cards(n)} zum Schreiben werden erst nach der ersten Karteikarte des jeweiligen Wortes freigeschaltet.`,
    howTitle: 'Wie Wiederholungen geplant werden',
    how: [
      'Eine Lektion hat höchstens 10 Karten: zuerst die fälligen, den Rest füllen neue auf. Von einem Eintrag ist pro Lektion immer nur eine Karte dabei.',
      'Ein Wort hat zwei Karten: die Karteikarte DE → CZ und das Schreiben CZ → DE, das nach der ersten Karteikarte freigeschaltet wird. Ein Satz hat nur das Schreiben, eine Grammatikaufgabe eine Karte mit Erklärung.',
      '„Kann ich“ verschiebt die Karte auf 3, 7, 14, 30 und schließlich 60 Tage. „Schwer“ bringt sie morgen wieder und senkt die Stufe.',
      '„Nochmal“ bringt sie noch in dieser Lektion zurück (höchstens 3 Versuche) und morgen wieder.',
      'Eine Pause setzt nichts zurück: Die Karten warten, nichts geht verloren.',
    ],
    rulesTitle: 'Was wann gespeichert wird',
    rules: [
      'Die Antwort wird beim Prüfen gespeichert („Prüfen“, „Weiß ich nicht“, „Lösung aufdecken“). Nach dem Neuladen oder der Rückkehr in die Lektion sehen Sie dasselbe Ergebnis, und die Karte wartet auf die Bewertung; ein zweites Antworten ist nicht möglich.',
      'Eine angefangene, noch nicht geprüfte Antwort geht beim Neuladen verloren; gezählt wird dabei nichts.',
      'Jede Bewertung wird sofort und nur einmal gespeichert: Doppelklick oder wiederholtes Enter zählen eine Antwort nicht doppelt.',
      'Eine falsche Antwort und eine aufgedeckte Lösung zählen als „Nochmal“, auch wenn Sie die Lektion früher beenden oder eine neue beginnen.',
      'Eine begonnene Lektion können Sie am selben Tag fortsetzen. Ab dem nächsten Tag wird sie geschlossen, und nicht bewertete Karten bleiben fällig.',
      'Den Fortschritt bearbeitet immer nur ein Browser-Tab. Andere Tabs zeigen den gespeicherten Stand, bis Sie „In diesem Tab arbeiten“ wählen.',
    ],
  },

  lessonKind: {
    daily: 'Training',
    free: 'Freies Üben',
    mistakes: 'Fehler wiederholen',
    item: 'Eintrag üben',
    challenge: 'Incident in 5 Schritten',
  },

  lesson: {
    position: (n, total) => `Karte ${n} von ${total}`,
    progressLabel: 'Fortschritt der Lektion',
    progressText: (done, total) => `${done} von ${total} erledigt`,
    end: 'Lektion beenden',
    endHint: 'Bewertete Karten bleiben gespeichert, nicht bewertete warten auf das nächste Mal.',
    reveal: 'Lösung aufdecken',
    revealKey: 'Leertaste',
    flashcardQuestion: 'Was bedeutet das auf Tschechisch?',
    rateQuestion: 'Wie ist es gelaufen?',
    rateHelp: 'Bewerten Sie, wie gut Sie sich erinnert haben. Unter jeder Wahl steht, wann die Karte wiederkommt.',
    writeLabel: 'Auf Deutsch schreiben',
    writeHint: (item) => {
      switch (item.kind) {
        case 'noun':
          return 'Substantiv mit Artikel, im Singular.'
        case 'verb':
          return item.de.startsWith('sich ') ? 'Reflexives Verb im Infinitiv (mit „sich“).' : 'Verb im Infinitiv.'
        case 'phrase':
          return 'Die ganze Wendung; eine Person als „jemand“ im richtigen Fall.'
        case 'word':
          return 'Ein Wort.'
        case 'sentence':
          return 'Ein ganzer Satz.'
        case 'grammar':
          return ''
      }
    },
    rulesTitle: 'Wie die Antwort bewertet wird',
    compareRule:
      'Eine freie Übersetzung kann mehrere richtige Formen haben: Stimmt sie mit dem Muster überein, erkennt die App sie an, sonst vergleichen Sie sie mit dem Muster und bewerten sich selbst.',
    rules: (rules) => {
      const caseText = {
        strict: 'Groß- und Kleinschreibung zählt.',
        'ignore-first': 'Groß- und Kleinschreibung zählt, außer beim ersten Buchstaben.',
        ignore: 'Groß- und Kleinschreibung zählt nicht.',
      }[rules.case]
      const marksText = {
        strict: 'Abweichende Satzzeichen zeigt die App an, als Fehler zählen sie nicht.',
        'ignore-final': 'Der Punkt am Ende zählt nicht; andere abweichende Satzzeichen zeigt die App an, als Fehler zählen sie nicht.',
        ignore: 'Satzzeichen zählen nicht.',
      }[rules.punctuation]
      return `${caseText} Umlaute und ß zählen. ${marksText}`
    },
    check: 'Prüfen',
    dontKnow: 'Weiß ich nicht – Lösung zeigen',
    insertLetter: 'Zeichen einfügen',
    insert: (ch) => (ch === ch.toLocaleLowerCase('de-AT') ? `${ch} einfügen` : `Großes ${ch} einfügen`),
    continue: 'Weiter',
    continueAgain: 'Weiter – die Karte kommt wieder',
    acceptMine: 'Meine Antwort ist auch richtig',
    emptyAnswer: 'Schreiben Sie eine Antwort oder wählen Sie „Weiß ich nicht“.',
    ratingEffect: {
      inLesson: 'noch in der Lektion',
      tomorrow: 'morgen',
      unchanged: 'Termin unverändert',
    },
    inDays: (n) => `in ${n} Tagen`,
    missingCard: 'Diese Karte ist nicht mehr im Inhalt und wird übersprungen.',
  },

  grammar: {
    gapLabel: 'Lücke füllen',
    blank: 'Lücke',
    sourceLabel: 'Ausgangstext',
    transformLabel: 'Umgeformten Satz schreiben',
    choiceLegend: 'Möglichkeiten',
    orderBank: 'Wörter zum Ordnen',
    orderHint: 'Tippen Sie die Wörter in der Reihenfolge an, in der sie in den Satz gehören. Ein zweites Antippen nimmt ein Wort wieder heraus.',
    orderPosition: (n) => `${n}.`,
    undo: 'Letztes zurücknehmen',
    clear: 'Von vorn beginnen',
    placed: (token, sentence) => `${quote(token)} eingefügt. ${sentence}`,
    removed: (token) => `${quote(token)} entfernt.`,
    cleared: 'Alle Wörter sind zurück.',
    emptyGap: 'Füllen Sie die Lücke oder wählen Sie „Weiß ich nicht“.',
    emptyChoice: 'Wählen Sie eine Möglichkeit oder „Weiß ich nicht“.',
    emptyOrder: 'Verwenden Sie alle Wörter oder wählen Sie „Weiß ich nicht“.',
    emptyTransform: 'Schreiben Sie den Satz oder wählen Sie „Weiß ich nicht“.',
    why: 'Warum',
    whyNotChosen: (option) => `Warum nicht ${quote(option)}`,
    whyNotOthers: 'Warum die anderen Möglichkeiten nicht passen',
    moreExample: 'Weiteres Beispiel',
    allFoci: 'Alle Grammatikthemen',
  },

  challenge: {
    title: 'Incident in 5 Schritten',
    lead: 'Optionale Übung: ein kurzer fiktiver Fall vom Klären des Problems über die Diagnose bis zur Übergabe. Jeder Schritt hat einen Versuch, und nach jedem sehen Sie sofort die Erklärung.',
    caseLegend: 'Fall',
    timed: 'Zeit messen',
    timedHint: 'Nur aus Interesse – die Zeit begrenzt die Antwort nicht.',
    start: 'Übung starten',
    replaceNote: 'Die begonnene Lektion wird damit beendet; bewertete Karten bleiben gespeichert.',
    track: 'Fortschritt der Übung',
    step: (n, total, stage) => `Schritt ${n} von ${total}: ${stage}`,
    stepLabel: (n, stage, outcome) => (outcome ? `Schritt ${n}: ${stage} – ${outcome}` : `Schritt ${n}: ${stage}`),
    current: 'aktuell',
    situation: 'Situation',
    showCz: 'Auf Tschechisch anzeigen',
    elapsed: 'Verstrichene Zeit',
    resultTitle: 'Ergebnis der Übung',
    resultTitleEarly: 'Übung beendet',
    accuracy: (correct, total) => `Beim ersten Versuch richtig: ${correct} von ${total}`,
    accuracyNote: 'Gezählt werden nur Antworten, die die App als richtig erkannt hat. Von Ihnen anerkannte Antworten und aufgedeckte Lösungen stehen getrennt.',
    acceptedCount: (n) => `Von Ihnen anerkannt: ${n}`,
    revealedCount: (n) => `Lösung aufgedeckt („Weiß ich nicht“): ${n}`,
    time: (t) => `Zeit: ${t}`,
    outcome: {
      correct: 'richtig',
      accepted: 'von Ihnen anerkannt',
      wrong: 'Fehler',
      revealed: 'Lösung aufgedeckt',
      skipped: 'nicht beendet',
    },
    repeatMistakes: (n) => `Fehler wiederholen (${n})`,
    retry: 'Übung noch einmal',
    noMistakes: 'Alle Schritte beim ersten Versuch richtig.',
    saved: 'Die Bewertungen aller Schritte sind gespeichert; die Karten kommen nach Plan wieder. Das Wiederholen von Fehlern verlängert keine Termine.',
  },

  verdict: {
    self: '',
    correct: 'Richtig',
    variant: 'Richtig – erlaubte Variante',
    incorrect: 'Fehler',
    accepted: 'Als richtig anerkannt',
    unknown: 'Lösung',
    compared: 'Vergleich mit dem Muster',
  },

  feedback: {
    yourAnswer: 'Ihre Antwort',
    correctForm: 'Richtige Form',
    model: 'Muster',
    otherForms: 'Weitere mögliche Formulierungen',
    matchesModel: 'Stimmt mit dem Muster oder einer erlaubten Formulierung überein.',
    compareYourself: 'Vergleichen Sie Ihren Satz mit dem Muster und bewerten Sie sich selbst.',
    compareLead:
      'Der Satz weicht vom Muster ab, aber eine freie Übersetzung kann mehrere richtige Formen haben, daher bewertet die App ihn nicht. Vergleichen Sie ihn mit dem Muster und bewerten Sie sich selbst.',
    closest: 'Nächstes Muster',
    compareCheck: 'Worauf Sie achten sollten',
    compareRate:
      'Sagt Ihr Satz dasselbe und ist er grammatisch richtig? Dann wählen Sie „Kann ich“ oder „Schwer“. Weicht die Bedeutung ab oder steckt ein Fehler im Satz, wählen Sie „Nochmal“.',
    canonicalNote: 'Häufigste Form',
    inContext: 'Im Satz',
    genderLabel: 'Genus',
    plural: 'Plural',
    noPlural: 'nur Singular (kein gebräuchlicher Plural)',
    government: 'Rektion',
    past: 'Vergangenheit',
    forms: 'Formen und Rektion',
    note: 'Hinweis',
    austria: 'In Österreich',
    wrongMark: 'Fehler: ',
    differsMark: 'anders als im Muster: ',
  },

  hint: (hint: Hint, item: StudyItem): string => {
    switch (hint.type) {
      case 'capitalization': {
        const upper = hint.expected.charAt(0) === hint.expected.charAt(0).toLocaleUpperCase('de-AT')
        return upper
          ? `Großschreibung: richtig ist ${quote(hint.expected)}. Groß schreibt man Substantive, das höfliche Sie/Ihr und Eigennamen.`
          : `Kleinschreibung: richtig ist ${quote(hint.expected)}.`
      }
      case 'special-letters':
        return `Es fehlt ${joinLetters(hint.letters)}: richtig ist ${quote(hint.expected)}. Umlaute und ß werden nicht mit a, o, u und ss gleichgesetzt.`
      case 'determiner':
        return item.kind === 'noun'
          ? `Artikel: richtig ist ${quote(hint.expected)} (${GENDER[item.gender]}), nicht ${quote(hint.given)}.`
          : `Form des Artikels: richtig ist ${quote(hint.expected)}, nicht ${quote(hint.given)}.`
      case 'missing-word':
        return hint.determiner ? `Es fehlt der Artikel ${quote(hint.expected)}.` : `Es fehlt das Wort ${quote(hint.expected)}.`
      case 'extra-word':
        return `Das Wort ${quote(hint.given)} ist zu viel.`
      case 'word-order':
        return hint.moved.length > 0
          ? `Die Wörter stimmen, die Wortstellung ist anders: ${quoteList(hint.moved)} ${hint.moved.length === 1 ? 'steht' : 'stehen'} an anderer Stelle.`
          : 'Die Wörter stimmen, die Wortstellung ist anders.'
      case 'punctuation':
        return 'Die Satzzeichen sind anders.'
      case 'plural-instead':
        return 'Sie haben den Plural geschrieben; gefragt ist der Singular.'
    }
  },

  compareHint: (hint) => {
    switch (hint.type) {
      case 'capitalization':
        return `Groß- und Kleinschreibung: im Muster ${quote(hint.expected)}, bei Ihnen ${quote(hint.given)}.`
      case 'special-letters':
        return `Rechtschreibung: im Muster ${quote(hint.expected)}, bei Ihnen ${quote(hint.given)}. Umlaute und ß werden nicht ersetzt.`
      case 'determiner':
        return `Artikel: im Muster ${quote(hint.expected)}, bei Ihnen ${quote(hint.given)}. Wenn Sie dasselbe Substantiv verwendet haben, prüfen Sie Genus und Fall.`
      case 'missing-word':
        return `Im Muster steht ${hint.determiner ? 'der Artikel' : 'das Wort'} ${quote(hint.expected)}, das in Ihrem Satz fehlt. Fehlt es, oder haben Sie dasselbe anders gesagt?`
      case 'extra-word':
        return `Das Wort ${quote(hint.given)} steht nicht im Muster. Ändert es die Bedeutung, oder ist es nur zusätzlich?`
      case 'word-order':
        return `Dieselben Wörter in anderer Reihenfolge${hint.moved.length > 0 ? ` (${quoteList(hint.moved)} an anderer Stelle)` : ''}. Eine andere Reihenfolge kann richtig sein; prüfen Sie aber das Verb: im Aussagesatz an zweiter Stelle, im Nebensatz am Ende.`
      case 'punctuation':
        return 'Die Satzzeichen sind anders.'
      case 'plural-instead':
        return 'Sie haben den Plural geschrieben; gefragt ist der Singular.'
    }
  },

  cosmetic: {
    title: 'Satzzeichen – zählen nicht als Fehler',
    lines: (note: CosmeticNote) =>
      note.changes.length > 0 ? note.changes.map(punctuationText) : ['Die Satzzeichen weichen von der Lösung ab.'],
  },

  summary: {
    title: 'Ergebnis der Lektion',
    titleEarly: 'Lektion beendet',
    rated: (n) => `Sie haben ${cards(n)} bearbeitet.`,
    repeats: (n) => `Wiederholungen in der Lektion: ${n}×.`,
    skipped: (n) => `${cards(n)} ${n === 1 ? 'bleibt' : 'bleiben'} für das nächste Mal.`,
    requeued: 'Die Lektion endete, bevor alle mit „Nochmal“ bewerteten Karten zurückkamen.',
    checkedTitle: 'Treffsicherheit beim ersten Versuch',
    checkedLead: 'Schreiben und Grammatik: Die App hat die Antwort geprüft.',
    checkedResult: (correct, total) => `Beim ersten Versuch richtig: ${correct} von ${total}`,
    checked: {
      correct: 'richtig',
      variant: 'erlaubte Variante',
      accepted: 'von Ihnen anerkannt',
      incorrect: 'Fehler',
      revealed: 'Lösung aufgedeckt („Weiß ich nicht“)',
    },
    selfTitle: 'Ihre Bewertung',
    selfLead: 'Karteikarten und mit dem Muster verglichene Sätze haben Sie selbst bewertet.',
    why: {
      incorrect: 'Fehler',
      unknown: 'aufgedeckt',
      again: 'Nochmal',
      hard: 'Schwer',
    },
    saved: 'Alle Bewertungen sind gespeichert, und die Lektion ist in der Statistik einmal gezählt. Die Karten kommen nach Plan wieder.',
    nothingRated: 'Sie haben keine Karte bewertet, alle bleiben fällig.',
    mistakesTitle: 'Fehler und schwierige Karten',
    noMistakes: 'Keine Fehler. Die Karten kommen nach Plan wieder.',
    repeatMistakes: (n) => `Fehler wiederholen (${n})`,
    repeatHint: 'Das Wiederholen von Fehlern verlängert keine Termine.',
    done: 'Zurück zu Heute',
    backToDictionary: 'Zurück zum Wörterbuch',
  },

  practice: {
    title: 'Üben',
    exerciseLegend: 'Übung',
    focusLabel: 'Grammatikthema',
    start: 'Üben starten',
    mistakesTitle: 'Schnelle Fehlerwiederholung',
    mistakesText: (n) => `${cards(n)} mit der letzten Bewertung „Nochmal“ oder „Schwer“.`,
    noMistakes: 'Keine Fehler zum Wiederholen.',
    repeatMistakes: 'Fehler wiederholen',
  },

  dictionary: {
    title: 'Wörterbuch',
    searchLabel: 'Suchen',
    searchRegion: 'Suche im Wörterbuch',
    searchPlaceholder: 'Deutsch oder Tschechisch',
    results: (n) => items(n),
    noneTitle: 'Nichts gefunden',
    none: 'Versuchen Sie einen anderen Ausdruck, auf Deutsch oder Tschechisch, oder setzen Sie die Filter zurück. Akzente und Umlaute müssen Sie nicht tippen.',
    clear: 'Suche und Filter zurücksetzen',
    filters: (n) => (n > 0 ? `Filter (${n})` : 'Filter'),
    activeFilters: 'Aktive Filter',
    activeSearch: (q) => `Suche: ${quote(q)}`,
    removeFilter: (label) => `Filter ${label} entfernen`,
    clearFilters: 'Alle zurücksetzen',
    back: 'Zurück zum Wörterbuch',
    notFound: 'Eintrag nicht gefunden.',
    meaning: 'Bedeutung',
    variants: 'Erlaubte Varianten beim Schreiben',
    sources: 'Quellen',
    checked: (day) => `geprüft am ${day}`,
    page: (page) => `S. ${page}`,
    yourCards: 'Ihre Karten',
    cardState: (status, when) => (when ? `${status}, nächste Wiederholung ${when}` : status),
    practiseCard: (exercise) => ({ flashcard: 'Karteikarte üben', write: 'Schreiben üben', grammar: 'Aufgabe üben' })[exercise],
    kindLabel: 'Art',
    allKinds: 'Alle',
    kindGroup: { vocab: 'Wörter und Wendungen', sentence: 'Sätze', grammar: 'Grammatikaufgaben' },
    task: 'Aufgabe',
    options: 'Möglichkeiten',
    tokens: 'Wörter',
    otherSolutions: 'Weitere richtige Lösungen',
    usedIn: 'Verwendet in der Übung',
    challengeStep: (title, n, stage) => `${title} – Schritt ${n}: ${stage}`,
    usedInInterview: 'Verwendet im Interview',
    interviewQuestion: (title, n) => `${title} – Frage ${n}`,
    backToInterview: 'Zurück zum Interview',
  },

  interview: {
    title: 'Interview',
    lead: 'Kurze Simulationen von Vorstellungsgesprächen auf Deutsch. Sie beantworten eine Frage laut, bekommen eine Nachfrage und erst danach eine Musterantwort, nützliche Wendungen und eine Selbsteinschätzung anhand einer Checkliste.',
    noMic: 'Es wird nichts aufgenommen und nichts automatisch bewertet; ein Mikrofon ist nicht nötig.',
    scenarioLegend: 'Szenario',
    questions: (n) => count(n, 'Frage', 'Fragen'),
    lastPractised: (day) => `zuletzt am ${day}`,
    start: 'Interview starten',
    resumeTitle: 'Begonnenes Interview',
    resumeText: (title, n, total) => `${title}: Frage ${n} von ${total}. Die Selbsteinschätzung wird laufend gespeichert.`,
    resume: 'Interview fortsetzen',
    lastSummary: (title) => `Letzte Zusammenfassung: ${title}`,
    replaceNote: (title) => `Das begonnene Interview „${title}“ wird dadurch beendet. Gespeicherte Versuche bleiben erhalten.`,
    howTitle: 'So läuft ein Interview ab',
    how: [
      'Die Frage ist auf Deutsch; Tschechisch und Hilfe gibt es auf Wunsch. Vorlesen startet nur per Knopfdruck.',
      'Antworten Sie laut. Der Timer mit 60–90 Sekunden ist optional, weiter geht es jederzeit.',
      'Nach der Antwort kommt eine Nachfrage. Erst danach sehen Sie die Musterantwort, nützliche Wendungen und Links ins Wörterbuch.',
      'Fragen zur Erfahrung trainieren STAR: Situation, Aufgabe, Vorgehen und Ergebnis. Technische Fragen trainieren Problem klären, Hypothese prüfen, sicheren nächsten Schritt und Kommunikation.',
      'Die Selbsteinschätzung hat vier Kriterien: direkte Antwort, Struktur, Wortschatz und Nachfrage. Pro Frage bleiben die letzten 10 Versuche gespeichert.',
    ],
    notFound: 'Interview nicht gefunden.',
    back: 'Zurück zur Interview-Übersicht',
    context: 'Gesprächskontext',
    showCz: 'Auf Tschechisch anzeigen',
    track: 'Fortschritt im Interview',
    phasesLabel: 'Phasen der Frage',
    phase: { question: 'Antwort auf die Frage', followUp: 'Nachfrage', review: 'Auswertung und Selbsteinschätzung' },
    trackLabel: (n, state) => (state ? `Frage ${n}: ${state}` : `Frage ${n}`),
    trackState: { done: 'erledigt', current: 'aktuell', open: 'offen' },
    position: (n, total) => `Frage ${n} von ${total}`,
    kind: {
      personal: 'Persönliche Frage',
      experience: 'Frage zur Erfahrung (STAR)',
      technical: 'Technische Frage',
    },
    structure: {
      personal: 'Ausgangspunkt → Erfahrung und Grund → Ziel',
      experience: 'Situation → Aufgabe → Vorgehen → Ergebnis',
      technical: 'Problem klären → Hypothese prüfen → sicherer nächster Schritt → Kommunikation',
    },
    step: {
      start: 'Ausgangspunkt',
      reason: 'Erfahrung und Grund',
      goal: 'Ziel',
      situation: 'Situation',
      task: 'Aufgabe',
      action: 'Vorgehen',
      result: 'Ergebnis',
      clarify: 'Problem klären',
      verify: 'Hypothese prüfen',
      safe: 'Sicherer nächster Schritt',
      communicate: 'Kommunikation',
    },
    hint: 'Hilfe',
    hintStructure: 'Aufbau der Antwort',
    hintTips: 'Woran Sie denken sollten',
    hintStarters: 'So können Sie beginnen',
    hintOwn: 'Ihr gespeichertes Beispiel',
    answerAloud: 'Antworten Sie laut, als würden Sie mit der Person sprechen, die das Gespräch führt. Es wird nichts aufgenommen.',
    followUpLabel: 'Nachfrage',
    mainQuestion: 'Hauptfrage',
    answerFollowUp: 'Die Nachfrage knüpft an Ihre Antwort an. Antworten Sie laut und konkret.',
    toFollowUp: 'Weiter zur Nachfrage',
    toReview: 'Musterantwort anzeigen',
    end: 'Interview beenden',
    modelTitle: 'Musterantwort',
    illustrativeNote: 'Ein Beispiel, keine Angaben über Sie. Ersetzen Sie die markierten Stellen durch eigene Fakten, die Sie belegen können.',
    replaceTitle: 'Durch eigene Fakten ersetzen',
    replaceMark: (n) => `Fakt zum Ersetzen ${n}:`,
    translation: 'Übersetzung anzeigen',
    followUpModel: 'Muster zur Nachfrage',
    phrases: 'Nützliche Wendungen',
    dictionary: 'Passend im Wörterbuch',
    ownTitle: 'Ihr eigenes Beispiel',
    ownLead:
      'Schreiben Sie Ihre eigene Version der Antwort mit Fakten, die Sie belegen können. Sie bleibt nur in diesem Browser. Schreiben Sie keine Namen von Firmen, Kundschaft oder Kolleginnen und Kollegen und keine internen Angaben.',
    ownLabel: 'Ihre Version (auf Deutsch)',
    evidenceLegend: 'Wie können Sie das Beispiel belegen?',
    evidence: {
      cv: 'Steht in meinem Lebenslauf',
      confirmed: 'Aus der Praxis belegbar',
      lab: 'Aus eigenem Lab oder Kurs',
      estimate: 'Schätzung, Zahlen nicht gemessen',
      unverified: 'Noch nicht überprüft',
    },
    evidenceHint: 'Sagen Sie im Gespräch nur, was Sie belegen können. Eine Schätzung nennen Sie als Schätzung (etwa, ungefähr).',
    ownSave: 'Beispiel speichern',
    ownSaved: 'Das Beispiel ist in diesem Browser gespeichert.',
    ownRemoved: 'Das Beispiel ist gelöscht.',
    selfTitle: 'Selbsteinschätzung',
    selfLead: 'Vergleichen Sie Ihre Antwort mit dem Muster und der Checkliste bei jedem Kriterium.',
    check: {
      direct: 'Haben Sie die Frage direkt beantwortet?',
      structure: 'Haben Sie die Struktur eingehalten?',
      vocabulary: 'Haben Sie passenden Wortschatz verwendet?',
      followUp: 'Haben Sie die Nachfrage gut beantwortet?',
    },
    checkShort: {
      direct: 'Direkte Antwort',
      structure: 'Struktur',
      vocabulary: 'Wortschatz',
      followUp: 'Nachfrage',
    },
    value: { yes: 'Ja', partly: 'Teilweise', no: 'Nein' },
    incomplete: 'Bewerten Sie alle vier Kriterien.',
    saveNext: 'Speichern und nächste Frage',
    saveSummary: 'Speichern und Zusammenfassung zeigen',
    retry: 'Nochmal versuchen',
    retryNote: (saves, otherFollowUp) =>
      `${saves ? 'Die ausgefüllte Selbsteinschätzung wird als Versuch gespeichert, und die Frage beginnt von vorn.' : 'Die Frage beginnt von vorn; eine unvollständige Selbsteinschätzung wird nicht gespeichert.'}${otherFollowUp ? ' Die Nachfrage wird eine andere sein.' : ''}`,
    summaryTitle: 'Zusammenfassung des Interviews',
    summaryTitleEarly: 'Interview beendet',
    answered: (n, total) => `Beantwortete Fragen: ${n} von ${total}`,
    notAnswered: 'Nicht beantwortet',
    tries: (n) => count(n, 'Versuch', 'Versuche'),
    revisit: 'Diese Frage nochmal',
    answerNow: 'Diese Frage beantworten',
    criterion: 'Kriterium',
    countsTitle: 'Ihre Selbsteinschätzung nach Kriterien',
    hintUsed: 'mit Hilfe',
    focusTitle: 'Worauf Sie achten sollten',
    focusTip: {
      direct: 'Beginnen Sie mit dem Kern der Antwort: Der erste Satz sagt, was Sie tun oder getan haben. Der Kontext kommt danach.',
      structure:
        'Halten Sie das Gerüst der Frage ein: bei Erfahrung STAR, bei technischen Fragen klären → prüfen → sicherer Schritt → Kommunikation. Die Hilfe „Aufbau der Antwort“ unterstützt Sie dabei.',
      vocabulary: 'Sehen Sie sich vor dem nächsten Versuch die nützlichen Wendungen und die Wörterbucheinträge an und verwenden Sie mindestens zwei davon.',
      followUp: 'Beantworten Sie die Nachfrage konkret: ein Fakt, ein Schritt oder ein Grund. Wenn Sie etwas nicht wissen, sagen Sie, wie Sie es prüfen würden.',
    },
    allGood: 'Bei allen Kriterien haben Sie „Ja“ gewählt. Versuchen Sie das Interview noch einmal ohne Hilfe oder mit kürzerem Timer.',
    again: 'Interview noch einmal',
    overview: 'Zurück zur Übersicht',
    savedNote: 'Die Selbsteinschätzung bleibt nur in diesem Browser gespeichert, pro Frage die letzten 10 Versuche.',
  },

  timer: {
    legend: 'Länge des Timers',
    seconds: (n) => `${n} s`,
    remaining: 'Noch',
    start: 'Timer starten',
    pause: 'Pausieren',
    resume: 'Timer fortsetzen',
    restart: 'Neu starten',
    reset: 'Zurücksetzen',
    up: 'Die Zeit ist um. Beenden Sie Ihren Gedanken und machen Sie weiter, wann Sie möchten.',
    note: 'Der Timer dient nur zur Orientierung; weiter geht es jederzeit.',
  },

  listen: {
    prompt: 'Hören Sie den deutschen Ausdruck und überlegen Sie, was er auf Tschechisch bedeutet. Den Text sehen Sie erst mit der Lösung.',
    play: 'Auf Deutsch abspielen',
    again: 'Nochmal abspielen',
    stop: 'Wiedergabe stoppen',
    fallback: {
      unsupported: 'Dieser Browser unterstützt die Wiedergabe (Web Speech API) nicht, daher sehen Sie den Ausdruck als Text.',
      'no-voice': 'Der Browser bietet keine deutsche Stimme an, daher sehen Sie den Ausdruck als Text.',
      error: 'Die Wiedergabe hat nicht funktioniert, daher sehen Sie den Ausdruck als Text.',
    },
    modeHint:
      'Hören spielt den deutschen Ausdruck mit einer Stimme des Browsers ab (de-AT, sonst de-DE) und zeigt den Text erst mit der Lösung. Ohne deutsche Stimme sehen Sie den Text. Die Bewertung zählt für die Karteikarte DE → CZ.',
  },

  speech: {
    read: 'Frage vorlesen',
    stop: 'Vorlesen stoppen',
    loading: 'Stimme wird vorbereitet …',
    speaking: (voice) => `Wiedergabe: ${voice}.`,
    done: 'Wiedergabe beendet.',
    stopped: 'Wiedergabe gestoppt.',
    noVoice: 'Der Browser bietet keine deutsche Stimme an. Lesen Sie die Frage; der Text bleibt sichtbar.',
    error: 'Das Vorlesen hat nicht funktioniert. Lesen Sie die Frage; der Text bleibt sichtbar.',
    unsupported: 'Vorlesen ist in diesem Browser nicht verfügbar; die Frage bleibt als Text.',
  },

  settings: {
    title: 'Einstellungen',
    speechTitle: 'Stimme und Vorlesen',
    enabled: 'Vorlesen der Fragen im Interview anbieten',
    enabledHint: 'Eine Frage wird nur nach einem Klick auf „Frage vorlesen“ vorgelesen.',
    voice: 'Stimme',
    auto: 'Automatisch (de-AT/de-DE)',
    voiceHint: 'Automatisch wird eine österreichische Stimme (de-AT) verwendet, sonst eine deutsche (de-DE); nie eine andere Sprache.',
    autoPicked: (voice) => `Automatisch verwendet wird derzeit: ${voice}.`,
    noVoices: 'Der Browser bietet derzeit keine deutsche Stimme an. Die Fragen bleiben als Text.',
    unsupported: 'Dieser Browser unterstützt das Vorlesen (Web Speech API) nicht. Die Fragen bleiben als Text.',
    test: 'Stimme testen',
    testText: 'Grüß Gott! So werden die Fragen im Bewerbungsgespräch vorgelesen.',
    note: 'Das Vorlesen verwendet die Stimmen des Browsers und des Betriebssystems. Wie eine Stimme klingt, ob es eine österreichische Variante gibt und ob sie ohne Internet funktioniert, hängt von der gewählten Stimme und vom Browser ab; manche Stimmen verarbeitet der Browser online. Die App verwendet kein Mikrofon und nimmt nichts auf.',
    languageTitle: 'Sprache der Bedienung',
    languageHint: 'Ändert nur die Bedienung. Die Lerninhalte bleiben gleich: deutsche Fragen, tschechische Übersetzungen und Schreibaufgaben CZ → DE.',
    progressTitle: 'Fortschritt und Sicherung',
    progressWhere:
      'Der Fortschritt wird nur in diesem Browser auf diesem Gerät gespeichert (localStorage) und von der App nirgendwohin gesendet. Ein anderer Browser, ein privates Fenster oder ein anderes Gerät sieht ihn nicht, und beim Löschen der Browserdaten geht er verloren.',
    progressExportUse: 'Der Export in eine Datei dient zur Übertragung in einen anderen Browser und als Sicherung.',
    statusLabel: 'Speicherstatus',
    status: {
      ok: 'Wird laufend in diesem Browser gespeichert.',
      passive: 'In diesem Tab wird nicht gespeichert: Den Fortschritt bearbeitet ein anderer Tab mit dieser App.',
      unavailable: 'Wird nicht gespeichert: Der Browser erlaubt kein Speichern. Nach dem Schließen der Seite geht der Fortschritt verloren.',
      memory: 'Wird nicht gespeichert: Sie haben das Arbeiten ohne Speichern gewählt.',
      'write-failed': 'Die letzte Änderung wurde nicht gespeichert.',
      corrupt: 'Wird nicht gespeichert: Die gespeicherten Daten sind nicht lesbar.',
      unsupported: 'Wird nicht gespeichert: Die gespeicherten Daten stammen aus einer neueren Version der App.',
      stale: 'Wird nicht gespeichert: Der Fortschritt hat sich inzwischen in einem anderen Tab geändert.',
    },
    statusMore: 'Was passiert ist und was Sie tun können, steht in der Meldung oben auf der Seite.',
    statusShow: 'Meldung anzeigen',
    statCards: 'Karten mit Fortschritt',
    statAttempts: 'Versuche im Interview',
    statExamples: 'Eigene Beispiele',
    exportTitle: 'Export',
    exportText:
      'JSON-Datei mit Fortschritt, begonnener Lektion, Statistik, Selbsteinschätzung, eigenen Beispielen und Einstellungen. Sie enthält auch Ihre eigenen Beispiele: nicht weitergeben und nicht in ein Repository legen.',
    exportButton: 'Export herunterladen',
    exportStarted: (name) => `Die Datei ${name} wird heruntergeladen.`,
    importTitle: 'Import',
    importText: 'Lädt einen Export aus diesem oder einem anderen Browser. Die Datei wird zuerst vollständig geprüft, und vor dem Ersetzen sehen Sie eine Zusammenfassung.',
    importLabel: 'Exportdatei (.json)',
    importReading: 'Datei wird geprüft …',
    importProblem: {
      tooLarge: (kb) => `Die Datei ist zu groß (${kb} kB). Ein Export dieser App hat höchstens 2 MB.`,
      empty: 'Die Datei ist leer.',
      notJson: 'Die Datei ist kein gültiges JSON.',
      notExport: 'Die Datei ist kein Export von Cloud Admin Deutsch.',
      newerFormat: (v) => `Der Export hat ein neueres Format (${v}), als diese Version der App kennt.`,
      newerSchema: (v) => `Der Export stammt aus einer neueren Version der App (Schema ${v}).`,
      invalidData: (parts) => `Die Datei enthält ungültige Daten: ${parts}.`,
      unreadable: 'Die Datei konnte nicht gelesen werden.',
    },
    importKept: 'Der Fortschritt in diesem Browser bleibt unverändert.',
    part: {
      app: 'App-Kennung',
      schemaVersion: 'Datenversion',
      createdAt: 'Erstellungsdatum',
      updatedAt: 'Änderungsdatum',
      cards: 'Karten',
      lesson: 'Lektion',
      prefs: 'Einstellungen',
      interview: 'Interview',
      rev: 'Schreibrevision',
      stats: 'Statistik',
    },
    summaryTitle: 'Zusammenfassung des Imports',
    summaryExported: 'Exportiert am',
    summaryKept: 'Aufbewahrt am',
    summaryVersion: 'App-Version',
    summaryCards: 'Karten mit Fortschritt',
    summaryMastered: (n) => `davon gefestigt: ${n}`,
    summaryUnknown: 'Karten, die diese Inhaltsversion nicht kennt (bleiben gespeichert)',
    summaryAttempts: 'Versuche im Interview',
    summaryExamples: 'Eigene Beispiele',
    summaryLessons: 'Abgeschlossene Lektionen',
    summaryOpen: 'Begonnen',
    summaryOpenLesson: 'Lektion',
    summaryOpenInterview: 'Interview',
    summaryNothingOpen: 'nichts',
    replaceWarning: (cardCount, attemptCount, exampleCount) =>
      `Der Import ersetzt den gesamten Fortschritt in diesem Browser (derzeit ${cards(cardCount)}, ${count(attemptCount, 'Versuch', 'Versuche')} im Interview, ${count(exampleCount, 'eigenes Beispiel', 'eigene Beispiele')}). Das lässt sich nicht rückgängig machen.`,
    replaceConfirm: 'Fortschritt ersetzen',
    replaceCancel: 'Import abbrechen',
    backupFirst: 'Zuerst aktuellen Fortschritt herunterladen',
    replaced: (n) => `Erledigt: Der Fortschritt wurde aus der Datei wiederhergestellt (${cards(n)}).`,
    replacedMemory: 'Der Fortschritt ist geladen, aber der Browser erlaubt kein Speichern: Nach dem Schließen der Seite geht er verloren.',
    replaceFailed: 'Das Speichern ist fehlgeschlagen.',
    replaceReadOnly: 'Dieser Tab ist schreibgeschützt, es wurde nichts ersetzt.',
    readOnlyNote:
      'Dieser Tab ist schreibgeschützt. Import und Löschen führen Sie im Tab durch, der den Fortschritt bearbeitet, oder Sie wählen oben „In diesem Tab arbeiten“.',
    resetTitle: 'Fortschritt löschen',
    resetText:
      'Löscht Fortschritt, Statistik, Selbsteinschätzung, eigene Beispiele, Einstellungen und die aufbewahrten ursprünglichen Daten dieser App in diesem Browser (alle Schlüssel, die mit „cloud-admin-deutsch-at:“ beginnen), auch die Sprache der Bedienung. Andere Browserdaten bleiben erhalten.',
    resetButton: 'Fortschritt löschen …',
    resetDialogTitle: 'Gesamten Fortschritt löschen?',
    resetConfirmText:
      'Gelöscht werden Fortschritt, Statistik, eigene Beispiele und Einstellungen dieser App in diesem Browser. Das lässt sich nicht rückgängig machen; vorher können Sie einen Export herunterladen.',
    resetConfirm: 'Ja, löschen',
    resetCancel: 'Zurück',
    resetDone: 'Der Fortschritt ist gelöscht, die App beginnt von vorn.',
    resetFailed: 'Das Löschen ist fehlgeschlagen, die Daten bleiben unverändert.',
    statsTitle: 'Statistik',
    statsSince: (date) => `Gezählt seit ${date}; früheres Lernen ist nicht enthalten.`,
    statsLessons: 'Abgeschlossene Lektionen',
    statsEndedEarly: 'Vorzeitig beendet',
    statsFirstAttempt: 'Treffsicherheit beim ersten Versuch (Schreiben und Grammatik)',
    statsFirstAttemptValue: (correct, total, percent) => `${correct} von ${total} (${percent} %)`,
    statsNone: 'noch nichts',
    statsSelf: 'Ihre Bewertung der Karteikarten und verglichenen Sätze',
    statsInterview: 'Selbsteinschätzung im Interview',
    statsInterviewValue: (n, hinted) => `${count(n, 'Versuch', 'Versuche')}, davon mit Hilfe: ${hinted}`,
    statsNote:
      'Jede Lektion wird einmal gezählt, wenn sie endet. Die Treffsicherheit zählt nur Antworten, die die App geprüft hat; Ihre Bewertung der Karteikarten und die Selbsteinschätzung im Interview stehen getrennt. Im Interview werden die letzten 10 Versuche pro Frage aufbewahrt.',
    persistTitle: 'Dauerhafte Speicherung im Browser',
    persistGranted: 'Der Browser behält die Daten dieser Seite, auch wenn der Speicherplatz knapp wird.',
    persistNotGranted:
      'Der Browser kann die Daten der Seite löschen, wenn der Speicherplatz knapp wird oder Sie sie lange nicht besuchen (vor allem Safari). Sie können um dauerhafte Speicherung bitten; die eigentliche Sicherung ist aber nur der Export.',
    persistAsk: 'Um dauerhafte Speicherung bitten',
    persistDenied: 'Der Browser hat die Anfrage jetzt nicht erlaubt.',
    persistUnsupported: 'Dieser Browser bietet keine dauerhafte Speicherung an; die Sicherung ist der Export.',
    backupTitle: 'Daten vor dem letzten Update',
    backupText: (date, version) =>
      `Bei der Umwandlung der gespeicherten Daten in die neue Version (aus Schema ${version}, ${date}) wurden die ursprünglichen Daten getrennt aufbewahrt. Sie können sie herunterladen oder den Fortschritt daraus wiederherstellen.`,
    backupDownload: 'Ursprüngliche Daten herunterladen',
    backupRestore: 'Aus den ursprünglichen Daten wiederherstellen …',
    backupRemove: 'Ursprüngliche Daten löschen',
    backupUnreadable: 'Die ursprünglichen Daten sind nicht lesbar; Sie können sie nur herunterladen.',
    restoreSummaryTitle: 'Zusammenfassung der Wiederherstellung',
  },

  storage: {
    unavailableTitle: 'Der Fortschritt wird nicht gespeichert',
    unavailableText:
      'Der Browser erlaubt kein Speichern (z. B. privates Fenster oder blockierter Speicher). Sie können trainieren, aber nach dem Schließen der Seite geht der Fortschritt verloren.',
    corruptTitle: 'Die gespeicherten Daten sind nicht lesbar',
    corruptText: 'Sie arbeiten ohne Speichern. Die gespeicherten Daten bleiben unverändert, bis Sie anders entscheiden.',
    unsupportedTitle: 'Daten aus einer neueren Version der App',
    unsupportedText: (v) => `Der gespeicherte Fortschritt hat ein neueres Format (Version ${v}). Sie arbeiten ohne Speichern, die Daten bleiben unverändert.`,
    writeFailedTitle: 'Die letzte Änderung konnte nicht gespeichert werden',
    writeFailedText: (error) =>
      `Der Browserspeicher hat das Schreiben abgelehnt (${error}). Der Fortschritt bleibt vorerst nur in dieser Seite: Laden Sie einen Export herunter, damit nichts verloren geht.`,
    memoryTitle: 'Sie arbeiten ohne Speichern',
    memoryText: 'Änderungen werden nicht gespeichert.',
    download: 'Gespeicherte Daten herunterladen',
    recover: (n) => `Gültige Daten wiederherstellen (${cards(n)})`,
    reset: 'Löschen und neu beginnen',
    continueWithout: 'Ohne Speichern weiter',
    retry: 'Erneut speichern',
    resume: 'Wieder speichern',
    options: 'Optionen',
    confirmResetTitle: 'Gespeicherte Daten löschen und neu beginnen?',
    confirmReset: 'Die gespeicherten Daten dieser App in diesem Browser werden gelöscht. Das lässt sich nicht rückgängig machen; vorher können Sie sie herunterladen.',
    confirmResetYes: 'Ja, löschen',
    confirmRecoverTitle: 'Nur gültige Daten wiederherstellen?',
    confirmRecover: (kept, dropped) => `Gespeichert werden nur gültige Daten (${cards(kept)}). Beschädigte Einträge (${dropped}) werden entfernt.`,
    confirmRecoverYes: 'Ja, wiederherstellen',
    back: 'Zurück',
    actionFailed: 'Das Speichern ist fehlgeschlagen. Die Daten bleiben unverändert.',
    exportCurrent: 'Export des aktuellen Stands herunterladen',
    passiveTitle: 'Dieser Tab ist schreibgeschützt',
    passiveText:
      'Den Fortschritt bearbeitet gerade ein anderer Tab mit dieser App. Hier sehen Sie den gespeicherten Stand und können sich umsehen, aber Änderungen werden hier nicht gespeichert.',
    takeOver: 'In diesem Tab arbeiten',
    refused: 'Diese Änderung wurde in diesem Tab nicht gespeichert.',
    staleTitle: {
      changed: 'Der Fortschritt hat sich in einem anderen Tab geändert',
      removed: 'Der Fortschritt wurde in einem anderen Tab gelöscht',
      newer: 'Die Daten hat eine neuere Version der App gespeichert',
    },
    staleText: {
      changed: 'Dieser Tab hat nicht mehr den aktuellen Stand und speichert deshalb nichts. Laden Sie den aktuellen Stand und machen Sie weiter.',
      removed:
        'Dieser Tab speichert deshalb nichts. Laden Sie den aktuellen Stand und beginnen Sie neu, oder laden Sie zuerst einen Export dessen herunter, was Sie sehen.',
      newer: 'Diese Version überschreibt sie nicht. Laden Sie die Seite neu, damit die neuere Version der App geladen wird.',
    },
    reloadStored: 'Aktuellen Stand laden',
    reloadPage: 'Seite neu laden',
    pointer: {
      'write-failed': 'Die letzte Änderung konnte nicht gespeichert werden.',
      stale: 'Dieser Tab speichert nichts mehr: Der Fortschritt hat sich in einem anderen Tab geändert.',
      refused: 'Diese Änderung wurde in diesem Tab nicht gespeichert.',
    },
    showOptions: 'Optionen anzeigen',
    hidePointer: 'Ausblenden',
  },
}
