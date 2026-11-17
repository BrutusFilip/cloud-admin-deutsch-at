import type { CosmeticNote, Hint, PunctuationChange } from '../domain/answerCheck'
import type { DataPart } from '../storage/backup'
import type { StorageStatus } from '../state/progressContext'
import type { StepOutcome } from '../domain/challenge'
import type { CheckedCounts, LessonKind, Verdict } from '../domain/lesson'
import type { Rating } from '../domain/scheduler'
import type { KindGroup } from '../domain/search'
import type { CheckValue, Evidence, InterviewPhase } from '../domain/interview'
import type {
  AnswerRules,
  AnswerStep,
  ExerciseType,
  Gender,
  GrammarFocus,
  GrammarTaskType,
  InterviewQuestionKind,
  PracticeMode,
  SelfCheckId,
  StudyItem,
} from '../domain/types'

/**
 * Czech interface texts. Study content (German + Czech meanings) lives in
 * src/content; this file holds only the interface, so a German interface can
 * be added later as another object of the same type.
 */

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one
  if (n >= 2 && n <= 4) return few
  return many
}

const cards = (n: number) => `${n} ${plural(n, 'karta', 'karty', 'karet')}`
const days = (n: number) => `${n} ${plural(n, 'den', 'dny', 'dní')}`
const items = (n: number) => `${n} ${plural(n, 'položka', 'položky', 'položek')}`
const questions = (n: number) => `${n} ${plural(n, 'otázka', 'otázky', 'otázek')}`
const attempts = (n: number) => `${n} ${plural(n, 'pokus', 'pokusy', 'pokusů')}`
const examples = (n: number) => `${n} ${plural(n, 'vlastní příklad', 'vlastní příklady', 'vlastních příkladů')}`

/** Content with a Czech and a German title (topics, challenges, interviews). */
interface Titled {
  titleCz: string
  titleDe: string
}

function quote(s: string): string {
  return `„${s}“`
}

function joinLetters(letters: readonly string[]): string {
  return letters.length <= 1 ? (letters[0] ?? '') : `${letters.slice(0, -1).join(', ')} a ${letters[letters.length - 1]}`
}

const GENDER: Record<Gender, string> = { m: 'mužský rod', f: 'ženský rod', n: 'střední rod' }

/** Punctuation marks by name ("chybí čárka"). */
const MARK: Record<string, string> = {
  ',': 'čárka',
  '.': 'tečka',
  ';': 'středník',
  ':': 'dvojtečka',
  '!': 'vykřičník',
  '?': 'otazník',
  '"': 'uvozovka',
  "'": 'apostrof',
  '(': 'závorka',
  ')': 'závorka',
  '…': 'výpustka',
  '–': 'pomlčka',
  '—': 'pomlčka',
}

/** Words that open a subordinate clause; German always puts a comma before them. */
const CLAUSE_OPENERS = new Set(['dass', 'weil', 'ob', 'wenn', 'damit', 'bevor', 'nachdem', 'sobald', 'obwohl', 'während', 'falls', 'wer', 'was', 'wie', 'wo', 'warum', 'wann', 'worum', 'welche', 'welcher', 'welches'])

/** Quote the words a hint names: „a“, „b“ a „c“. */
function quoteList(words: readonly string[]): string {
  return joinLetters(words.map(quote))
}

function punctuationText(c: PunctuationChange): string {
  const name = MARK[c.mark] ?? quote(c.mark)
  const wraps = ['"', "'", '(', ')'].includes(c.mark)
  if (c.change === 'missing') {
    if (wraps) return `U slova ${quote(c.after)} chybí ${name}.`
    if (c.before === null) return `Na konci chybí ${name}.`
    if (c.mark !== ',') return `Za ${quote(c.after)} chybí ${name}.`
    const clause = CLAUSE_OPENERS.has(c.before.toLocaleLowerCase('de-AT'))
    return `Před ${quote(c.before)} chybí čárka.${clause ? ' Vedlejší větu němčina vždy odděluje čárkou.' : ''}`
  }
  if (wraps) return `U slova ${quote(c.after)} je ${name} navíc.`
  if (c.before === null) return `Na konci je ${name} navíc.`
  return c.mark === ',' ? `Před ${quote(c.before)} je čárka navíc.` : `Za ${quote(c.after)} je ${name} navíc.`
}

export const cs = {
  locale: 'cs-CZ',
  /** Value of <html lang>. */
  htmlLang: 'cs',
  appName: 'Cloud Admin Deutsch',
  /** Titles in the interface language; the Czech interface adds the German title as a learning aid. */
  title: (x: Titled): string => x.titleCz,
  subtitle: (x: Titled): string | null => x.titleDe,
  /** Challenge stages exist in Czech only. */
  stage: (stageCz: string): string => stageCz,
  language: { label: 'Jazyk ovládání', cs: 'Česky', de: 'Deutsch', short: { cs: 'CZ', de: 'DE' } },
  skipToContent: 'Přeskočit na obsah',
  footer: 'Pokrok se ukládá jen v tomto prohlížeči.',

  nav: {
    label: 'Hlavní navigace',
    today: 'Dnes',
    practice: 'Procvičování',
    interview: 'Pohovor',
    dictionary: 'Slovník',
    settings: 'Nastavení',
  },

  common: {
    topic: 'Téma',
    level: 'Obtížnost (orientační)',
    levelShort: 'Obtížnost',
    /** Read before the level chip by screen readers. */
    levelSr: 'orientační úroveň',
    levelTitle: 'Orientační úroveň podle SERR (B1–C1). Pomáhá s výběrem, není to certifikované hodnocení.',
    allTopics: 'Všechna témata',
    allLevels: 'Všechny úrovně',
    cards,
    days,
    items,
  },

  kind: (item: StudyItem): string => {
    switch (item.kind) {
      case 'noun':
        return 'podstatné jméno'
      case 'verb':
        return 'sloveso'
      case 'phrase':
        return 'výraz'
      case 'word':
        return item.pos === 'adverb' ? 'příslovce' : 'přídavné jméno'
      case 'sentence':
        return 'věta'
      case 'grammar':
        return 'gramatická úloha'
    }
  },
  gender: (g: Gender) => GENDER[g],
  exercise: {
    flashcard: 'Kartička DE → CZ',
    listen: 'Poslech DE → CZ',
    write: 'Psaní CZ → DE',
    grammar: 'Gramatika',
  } satisfies Record<PracticeMode, string>,
  focus: {
    'word-order': 'Slovosled',
    case: 'Pády a vazby',
    separable: 'Odlučitelná slovesa',
    past: 'Minulý čas',
    konjunktiv: 'Zdvořilý Konjunktiv II',
  } satisfies Record<GrammarFocus, string>,
  taskType: {
    gap: 'doplňování',
    choice: 'výběr',
    order: 'řazení slov',
    transform: 'přepis věty',
  } satisfies Record<GrammarTaskType, string>,
  illustrative: {
    label: 'Ilustrační',
    text: 'Vzorová zkušenost, ne fakt o vás. Na pohovoru ji nahraďte vlastním příkladem, který umíte doložit.',
  },
  status: { new: 'nové', learning: 'učím se', mastered: 'upevněno' },
  rating: { again: 'Znovu', hard: 'Těžké', good: 'Umím' } satisfies Record<Rating, string>,

  relativeDay: (diff: number, formatted: string): string => {
    if (diff <= 0) return 'dnes'
    if (diff === 1) return 'zítra'
    if (diff < 7) return `za ${days(diff)}`
    return `za ${days(diff)}, ${formatted}`
  },

  today: {
    title: 'Dnes',
    resumeTitle: 'Rozpracovaná lekce',
    resumeText: (done: number, total: number, waiting: boolean) =>
      `Hotovo ${done} z ${total}. Ohodnocené karty jsou uložené.${waiting ? ' Odpověď na aktuální kartu je uložená a čeká na hodnocení.' : ''}`,
    resume: 'Pokračovat v lekci',
    discard: 'Zahodit a začít novou',
    discardHint: 'Ohodnocené karty zůstanou uložené, rozpracovaná lekce se uzavře.',
    planTitle: 'Doporučená lekce',
    planAfterResume: 'Novou lekci začnete, až dokončíte rozpracovanou, nebo ji výše zahodíte.',
    topicsLead: 'Klepnutím na téma omezíte doporučenou lekci jen na něj.',
    due: 'K opakování',
    fresh: 'Nové',
    mastered: 'Upevněno',
    preview: (due: number, fresh: number) =>
      due > 0 && fresh > 0
        ? `Trénink nabídne ${cards(due)} k opakování a ${fresh} ${plural(fresh, 'novou', 'nové', 'nových')}.`
        : due > 0
          ? `Trénink nabídne ${cards(due)} k opakování.`
          : `Trénink nabídne ${fresh} ${plural(fresh, 'novou kartu', 'nové karty', 'nových karet')}.`,
    start: 'Začít trénink',
    emptyTopicTitle: 'V tomto tématu teď nic nečeká',
    emptyAllTitle: 'Pro dnešek je hotovo',
    nextDue: (when: string, count: number) => `Nejbližší opakování: ${when} (${cards(count)}).`,
    nothingSeen: 'Všechny karty v tomto výběru jste už viděli a žádná teď není na řadě.',
    freePractice: 'Procvičit volně',
    freePracticeHint: 'Volné procvičení nemění plán opakování, jen ho může zpřísnit.',
    showAll: 'Zobrazit všechna témata',
    topicsTitle: 'Témata',
    topicRow: (due: number, fresh: number) => `${due} k opakování, ${fresh} ${plural(fresh, 'nová', 'nové', 'nových')}`,
    welcomeTitle: 'Vítejte v Cloud Admin Deutsch',
    welcomeText:
      'Trénink němčiny na pohovory pro IT administrátory v Rakousku (cloud, Azure, Microsoft 365) na úrovni B2–C1. Obsah je v rakouské spisovné němčině, vysvětlení česky.',
    welcomeLesson: 'Trénink: krátká lekce s kartičkami, psaním a gramatikou; opakování se naplánuje samo.',
    welcomeInterview: 'Pohovor: odpovídáte nahlas na otázky tazatele a pak se porovnáte se vzorem.',
    welcomeDictionary: 'Slovník: všechna hesla s příklady, vazbami a rakouskými variantami.',
    welcomeNote: 'Pokrok se ukládá jen v tomto prohlížeči. Přenos a zálohu najdete v Nastavení.',
    locked: (n: number) => `Dalších ${cards(n)} psaní se odemkne až po první kartičce daného slova.`,
    howTitle: 'Jak se plánuje opakování',
    how: [
      'Lekce má nejvýše 10 karet: nejdřív ty, které jsou na řadě, zbytek doplní nové. Z jedné položky je v lekci vždy jen jedna karta.',
      'Slovo má dvě karty: kartičku DE → CZ a psaní CZ → DE, které se odemkne po první kartičce. Věta má jen psaní, gramatická úloha jednu kartu s vysvětlením.',
      '„Umím“ posune kartu na 3, 7, 14, 30 a nakonec 60 dní. „Těžké“ ji vrátí zítra a sníží o stupeň.',
      '„Znovu“ ji vrátí ještě v této lekci (nejvýše 3 pokusy) a zítra znovu.',
      'Pauza nic nenuluje: karty počkají, nic se neztrácí.',
    ],
    rulesTitle: 'Co se ukládá a kdy',
    rules: [
      'Odpověď se uloží ve chvíli kontroly („Zkontrolovat“, „Nevím“, „Odkrýt řešení“). Po reloadu nebo návratu do lekce uvidíte stejný výsledek a karta čeká na hodnocení; odpovědět znovu nejde.',
      'Rozepsanou a ještě nezkontrolovanou odpověď reload nezachová; nic se tím nezapočítá.',
      'Hodnocení se uloží hned a jen jednou: dvojklik ani opakovaný Enter odpověď nezapočítá dvakrát.',
      'Chybná odpověď a odhalené řešení se počítají jako „Znovu“, i když lekci ukončíte dřív nebo začnete novou.',
      'Rozpracovanou lekci dokončíte týž den. Od dalšího dne se uzavře a neohodnocené karty zůstanou na řadě.',
      'Pokrok upravuje vždy jen jedna karta prohlížeče. Ostatní karty ukazují uložený stav, dokud nezvolíte „Pracovat v této kartě“.',
    ],
  },

  lessonKind: {
    daily: 'Trénink',
    free: 'Volné procvičení',
    mistakes: 'Opakování chyb',
    item: 'Procvičení položky',
    challenge: 'Incident za 5 kroků',
  } satisfies Record<LessonKind, string>,

  lesson: {
    position: (n: number, total: number) => `Karta ${n} z ${total}`,
    progressLabel: 'Průběh lekce',
    progressText: (done: number, total: number) => `Hotovo ${done} z ${total}`,
    end: 'Ukončit lekci',
    endHint: 'Ohodnocené karty zůstanou uložené, neohodnocené počkají na příště.',
    reveal: 'Odkrýt řešení',
    revealKey: 'mezerník',
    flashcardQuestion: 'Co to znamená česky?',
    rateQuestion: 'Jak to šlo?',
    rateHelp: 'Ohodnoťte, jak dobře jste si vzpomněli. Pod každou volbou je, kdy se karta vrátí.',
    writeLabel: 'Napište německy',
    writeHint: (item: StudyItem): string => {
      switch (item.kind) {
        case 'noun':
          return 'Podstatné jméno se členem, v jednotném čísle.'
        case 'verb':
          return item.de.startsWith('sich ') ? 'Zvratné sloveso v infinitivu (se „sich“).' : 'Sloveso v infinitivu.'
        case 'phrase':
          return 'Celý výraz; osobu zapište jako „jemand“ ve správném pádě.'
        case 'word':
          return 'Jedno slovo.'
        case 'sentence':
          return 'Celá věta.'
        case 'grammar':
          return ''
      }
    },
    rulesTitle: 'Jak se odpověď hodnotí',
    compareRule:
      'Volný překlad může mít víc správných podob: shodu se vzorem uzná aplikace, jinak větu porovnáte se vzorem a ohodnotíte se sami.',
    rules: (rules: AnswerRules): string => {
      const caseText = {
        strict: 'Na velikosti písmen záleží.',
        'ignore-first': 'Na velikosti písmen záleží, kromě prvního písmene.',
        ignore: 'Na velikosti písmen nezáleží.',
      }[rules.case]
      const marksText = {
        strict: 'Rozdíl v interpunkci aplikace ukáže, ale za chybu ho nepočítá.',
        'ignore-final': 'Tečka na konci se nehodnotí; jiný rozdíl v interpunkci aplikace ukáže, ale za chybu ho nepočítá.',
        ignore: 'Interpunkce se nehodnotí.',
      }[rules.punctuation]
      return `${caseText} Přehlásky a ß se hodnotí. ${marksText}`
    },
    check: 'Zkontrolovat',
    dontKnow: 'Nevím – ukázat řešení',
    insertLetter: 'Vložit znak',
    insert: (ch: string) => (ch === ch.toLocaleLowerCase('de-AT') ? `Vložit ${ch}` : `Vložit velké ${ch}`),
    continue: 'Pokračovat',
    continueAgain: 'Pokračovat – karta se vrátí',
    acceptMine: 'Moje odpověď je také správná',
    emptyAnswer: 'Napište odpověď, nebo zvolte „Nevím“.',
    ratingEffect: {
      inLesson: 'ještě v lekci',
      tomorrow: 'zítra',
      unchanged: 'termín beze změny',
    },
    inDays: (n: number) => `za ${days(n)}`,
    missingCard: 'Tato karta už v obsahu není, přeskočím ji.',
  },

  grammar: {
    gapLabel: 'Doplňte mezeru',
    blank: 'mezera',
    sourceLabel: 'Výchozí text',
    transformLabel: 'Napište upravenou větu',
    choiceLegend: 'Možnosti',
    orderBank: 'Slova k seřazení',
    orderHint: 'Klepněte na slova v pořadí, v jakém patří do věty. Opětovným klepnutím slovo odeberete.',
    orderPosition: (n: number) => `${n}.`,
    undo: 'Vrátit poslední',
    clear: 'Začít znovu',
    placed: (token: string, sentence: string) => `Přidáno ${quote(token)}. ${sentence}`,
    removed: (token: string) => `Odebráno ${quote(token)}.`,
    cleared: 'Všechna slova jsou zpět.',
    emptyGap: 'Doplňte mezeru, nebo zvolte „Nevím“.',
    emptyChoice: 'Vyberte jednu možnost, nebo zvolte „Nevím“.',
    emptyOrder: 'Použijte všechna slova, nebo zvolte „Nevím“.',
    emptyTransform: 'Napište větu, nebo zvolte „Nevím“.',
    why: 'Proč',
    whyNotChosen: (option: string) => `Proč ne ${quote(option)}`,
    whyNotOthers: 'Proč ostatní možnosti nesedí',
    moreExample: 'Další příklad',
    allFoci: 'Všechny jevy',
  },

  challenge: {
    title: 'Incident za 5 kroků',
    lead: 'Volitelná výzva: krátký smyšlený případ od upřesnění problému přes diagnostiku po předání. Každý krok má jeden pokus a po každém hned uvidíte vysvětlení.',
    caseLegend: 'Případ',
    timed: 'Měřit čas',
    timedHint: 'Jen pro zajímavost – čas odpověď nijak neomezuje.',
    start: 'Spustit výzvu',
    replaceNote: 'Rozpracovaná lekce se tím ukončí; ohodnocené karty zůstanou uložené.',
    track: 'Postup výzvou',
    step: (n: number, total: number, stage: string) => `Krok ${n} z ${total}: ${stage}`,
    stepLabel: (n: number, stage: string, outcome: string | null) =>
      outcome ? `Krok ${n}: ${stage} – ${outcome}` : `Krok ${n}: ${stage}`,
    current: 'právě teď',
    situation: 'Situace',
    showCz: 'Zobrazit česky',
    elapsed: 'Uplynulý čas',
    resultTitle: 'Výsledek výzvy',
    resultTitleEarly: 'Výzva ukončena',
    accuracy: (correct: number, total: number) => `Napoprvé správně: ${correct} z ${total}`,
    accuracyNote: 'Počítají se jen odpovědi, které uznala aplikace. Vámi uznané odpovědi a odhalená řešení jsou uvedené zvlášť.',
    acceptedCount: (n: number) => `Uznáno vámi: ${n}`,
    revealedCount: (n: number) => `Řešení odhaleno („Nevím“): ${n}`,
    time: (t: string) => `Čas: ${t}`,
    outcome: {
      correct: 'správně',
      accepted: 'uznáno vámi',
      wrong: 'chyba',
      revealed: 'řešení odhaleno',
      skipped: 'nedokončeno',
    } satisfies Record<StepOutcome, string>,
    repeatMistakes: (n: number) => `Zopakovat chyby (${n})`,
    retry: 'Zkusit výzvu znovu',
    noMistakes: 'Všechny kroky napoprvé správně.',
    saved: 'Hodnocení všech kroků jsou uložená; karty se vrátí podle plánu. Opakování chyb termíny neprodlužuje.',
  },

  verdict: {
    self: '',
    correct: 'Správně',
    variant: 'Správně – povolená varianta',
    incorrect: 'Chyba',
    accepted: 'Uznáno jako správné',
    unknown: 'Řešení',
    compared: 'Porovnání se vzorem',
  } satisfies Record<Verdict, string>,

  feedback: {
    yourAnswer: 'Vaše odpověď',
    correctForm: 'Správné znění',
    model: 'Vzor',
    otherForms: 'Další možné formulace',
    matchesModel: 'Shoduje se se vzorem nebo s povolenou formulací.',
    compareYourself: 'Porovnejte svou větu se vzorem a ohodnoťte se sami.',
    compareLead:
      'Věta se od vzoru liší, ale volný překlad může mít víc správných podob, a tak ji aplikace nehodnotí. Porovnejte ji se vzorem a ohodnoťte se sami.',
    closest: 'Nejbližší vzor',
    compareCheck: 'Na co se podívat',
    compareRate:
      'Říká vaše věta totéž a je gramaticky správně? Pak zvolte „Umím“ nebo „Těžké“. Pokud se liší význam nebo je ve větě chyba, zvolte „Znovu“.',
    canonicalNote: 'Nejčastější tvar',
    inContext: 'Ve větě',
    genderLabel: 'Rod',
    plural: 'Plurál',
    noPlural: 'jen jednotné číslo (bez běžného plurálu)',
    government: 'Vazba',
    past: 'Minulost',
    forms: 'Tvary a vazba',
    note: 'Poznámka',
    austria: 'V Rakousku',
    wrongMark: 'chyba: ',
    differsMark: 'jinak než ve vzoru: ',
  },

  hint: (hint: Hint, item: StudyItem): string => {
    switch (hint.type) {
      case 'capitalization': {
        const upper = hint.expected.charAt(0) === hint.expected.charAt(0).toLocaleUpperCase('de-AT')
        return upper
          ? `Velké písmeno: správně ${quote(hint.expected)}. Velkým se píšou podstatná jména, zdvořilé Sie/Ihr a vlastní jména.`
          : `Malé písmeno: správně ${quote(hint.expected)}.`
      }
      case 'special-letters':
        return `Chybí ${joinLetters(hint.letters)}: správně ${quote(hint.expected)}. Přehlásky a ß se s a, o, u a ss nezaměňují.`
      case 'determiner':
        return item.kind === 'noun'
          ? `Člen: správně ${quote(hint.expected)} (${GENDER[item.gender]}), ne ${quote(hint.given)}.`
          : `Tvar členu: správně ${quote(hint.expected)}, ne ${quote(hint.given)}.`
      case 'missing-word':
        return hint.determiner ? `Chybí člen ${quote(hint.expected)}.` : `Chybí slovo ${quote(hint.expected)}.`
      case 'extra-word':
        return `Slovo ${quote(hint.given)} je navíc.`
      case 'word-order':
        return hint.moved.length > 0
          ? `Slova jsou správně, liší se slovosled: jinde stojí ${quoteList(hint.moved)}.`
          : 'Slova jsou správně, liší se slovosled.'
      case 'punctuation':
        return 'Liší se interpunkce.'
      case 'plural-instead':
        return 'Napsali jste plurál; zadání chce jednotné číslo.'
    }
  },

  /** The same differences for a free translation: things to check, not verdicts. */
  compareHint: (hint: Hint): string => {
    switch (hint.type) {
      case 'capitalization':
        return `Velké a malé písmeno: ve vzoru ${quote(hint.expected)}, u vás ${quote(hint.given)}.`
      case 'special-letters':
        return `Pravopis: ve vzoru ${quote(hint.expected)}, u vás ${quote(hint.given)}. Přehlásky a ß se nezaměňují.`
      case 'determiner':
        return `Člen: ve vzoru ${quote(hint.expected)}, u vás ${quote(hint.given)}. Pokud jste použili stejné podstatné jméno, zkontrolujte rod a pád.`
      case 'missing-word':
        return `Ve vzoru je ${hint.determiner ? 'člen' : 'slovo'} ${quote(hint.expected)}, které ve vaší větě není. Chybí, nebo jste totéž řekli jinak?`
      case 'extra-word':
        return `Slovo ${quote(hint.given)} ve vzoru není. Mění význam, nebo je jen navíc?`
      case 'word-order':
        return `Stejná slova v jiném pořadí${hint.moved.length > 0 ? ` (jinde stojí ${quoteList(hint.moved)})` : ''}. Jiné pořadí může být správné; zkontrolujte ale sloveso: v oznamovací větě stojí na druhém místě, ve vedlejší větě na konci.`
      case 'punctuation':
        return 'Liší se interpunkce.'
      case 'plural-instead':
        return 'Napsali jste plurál; zadání chce jednotné číslo.'
    }
  },

  /** Differences that are not mistakes in the practised phenomenon. */
  cosmetic: {
    title: 'Interpunkce – nepočítá se jako chyba',
    lines: (note: CosmeticNote): string[] =>
      note.changes.length > 0 ? note.changes.map(punctuationText) : ['Interpunkce se od řešení liší.'],
  },

  summary: {
    title: 'Výsledek lekce',
    titleEarly: 'Lekce ukončena',
    rated: (n: number) => `Prošli jste ${cards(n)}.`,
    repeats: (n: number) => `Opakování v lekci: ${n}×.`,
    skipped: (n: number) => `${cards(n)} ${plural(n, 'zůstala', 'zůstaly', 'zůstalo')} na příště.`,
    requeued: 'Lekce skončila dřív, než se vrátily všechny karty ohodnocené „Znovu“.',
    checkedTitle: 'Přesnost prvního pokusu',
    checkedLead: 'Psaní a gramatika: odpověď zkontrolovala aplikace.',
    checkedResult: (correct: number, total: number) => `Napoprvé správně: ${correct} z ${total}`,
    checked: {
      correct: 'správně',
      variant: 'povolená varianta',
      accepted: 'uznáno vámi',
      incorrect: 'chyba',
      revealed: 'řešení odhaleno („Nevím“)',
    } satisfies Record<keyof CheckedCounts, string>,
    selfTitle: 'Vaše hodnocení',
    selfLead: 'Kartičky a věty porovnané se vzorem jste ohodnotili sami.',
    why: {
      incorrect: 'chyba',
      unknown: 'odhaleno',
      again: 'Znovu',
      hard: 'Těžké',
    },
    saved: 'Všechna hodnocení jsou uložená a lekce je ve statistikách započtená jednou. Karty se znovu objeví podle plánu.',
    nothingRated: 'Žádnou kartu jste neohodnotili, všechny zůstávají na řadě.',
    mistakesTitle: 'Chyby a těžké karty',
    noMistakes: 'Bez chyb. Karty se vrátí podle plánu.',
    repeatMistakes: (n: number) => `Zopakovat chyby (${n})`,
    repeatHint: 'Opakování chyb termíny neprodlužuje.',
    done: 'Zpět na Dnes',
    backToDictionary: 'Zpět do slovníku',
  },

  practice: {
    title: 'Procvičování',
    exerciseLegend: 'Cvičení',
    focusLabel: 'Gramatický jev',
    start: 'Začít procvičování',
    mistakesTitle: 'Rychlé opakování chyb',
    mistakesText: (n: number) => `${cards(n)} s posledním hodnocením „Znovu“ nebo „Těžké“.`,
    noMistakes: 'Žádné chyby k opakování.',
    repeatMistakes: 'Zopakovat chyby',
  },

  dictionary: {
    title: 'Slovník',
    searchLabel: 'Hledat',
    searchRegion: 'Hledání ve slovníku',
    searchPlaceholder: 'německy nebo česky',
    results: (n: number) => items(n),
    noneTitle: 'Nic nenalezeno',
    none: 'Zkuste jiný výraz, německy nebo česky, nebo zrušte filtry. Diakritiku psát nemusíte.',
    clear: 'Zrušit hledání a filtry',
    filters: (n: number) => (n > 0 ? `Filtry (${n})` : 'Filtry'),
    activeFilters: 'Aktivní filtry',
    activeSearch: (q: string) => `Hledáno: ${quote(q)}`,
    removeFilter: (label: string) => `Zrušit filtr ${label}`,
    clearFilters: 'Zrušit vše',
    back: 'Zpět na slovník',
    notFound: 'Položka nenalezena.',
    meaning: 'Význam',
    variants: 'Povolené varianty při psaní',
    sources: 'Zdroje',
    checked: (day: string) => `ověřeno ${day}`,
    page: (page: string) => `s. ${page}`,
    yourCards: 'Vaše karty',
    cardState: (status: string, when: string | null) => (when ? `${status}, další opakování ${when}` : status),
    practiseCard: (exercise: ExerciseType) =>
      ({ flashcard: 'Procvičit kartičku', write: 'Procvičit psaní', grammar: 'Procvičit úlohu' })[exercise],
    kindLabel: 'Druh',
    allKinds: 'Vše',
    kindGroup: { vocab: 'Slova a výrazy', sentence: 'Věty', grammar: 'Gramatické úlohy' } satisfies Record<KindGroup, string>,
    task: 'Zadání',
    options: 'Možnosti',
    tokens: 'Slova',
    otherSolutions: 'Další správná řešení',
    usedIn: 'Použito ve výzvě',
    challengeStep: (title: string, n: number, stage: string) => `${title} – krok ${n}: ${stage}`,
    usedInInterview: 'Použito v pohovoru',
    interviewQuestion: (title: string, n: number) => `${title} – otázka ${n}`,
    backToInterview: 'Zpět k pohovoru',
  },

  interview: {
    title: 'Pohovor',
    lead: 'Krátké simulace pohovoru v němčině. Na otázku odpovíte nahlas, pak dostanete doplňující otázku a teprve potom ilustrační vzor, užitečné formulace a sebehodnocení podle checklistu.',
    noMic: 'Nic se nenahrává ani automaticky nehodnotí, mikrofon není potřeba.',
    scenarioLegend: 'Scénář',
    questions,
    lastPractised: (day: string) => `naposledy ${day}`,
    start: 'Začít pohovor',
    resumeTitle: 'Rozpracovaný pohovor',
    resumeText: (title: string, n: number, total: number) => `${title}: otázka ${n} z ${total}. Sebehodnocení je průběžně uložené.`,
    resume: 'Pokračovat v pohovoru',
    lastSummary: (title: string) => `Poslední souhrn: ${title}`,
    replaceNote: (title: string) => `Rozpracovaný pohovor „${title}“ se tím ukončí. Uložené pokusy zůstanou.`,
    howTitle: 'Jak pohovor probíhá',
    how: [
      'Otázka je německy, čeština a nápověda jsou na vyžádání. Předčítání se spustí jen tlačítkem.',
      'Odpovězte nahlas. Časovač 60–90 sekund je volitelný a pokračovat můžete kdykoli.',
      'Po odpovědi přijde doplňující otázka. Teprve po ní uvidíte ilustrační vzor, užitečné formulace a odkazy do slovníku.',
      'Otázky na zkušenost trénují STAR: situaci, úkol, postup a výsledek. Technické otázky trénují upřesnění problému, ověření hypotézy, bezpečný další krok a komunikaci.',
      'Sebehodnocení má čtyři kritéria: přímá odpověď, struktura, slovní zásoba a doplňující otázka. U každé otázky se uchová posledních 10 pokusů.',
    ],
    notFound: 'Pohovor nenalezen.',
    back: 'Zpět na přehled pohovorů',
    context: 'Kontext pohovoru',
    showCz: 'Zobrazit česky',
    track: 'Postup pohovorem',
    phasesLabel: 'Fáze otázky',
    phase: { question: 'Odpověď na otázku', followUp: 'Doplňující otázka', review: 'Rozbor a sebehodnocení' } satisfies Record<InterviewPhase, string>,
    trackLabel: (n: number, state: string | null) => (state ? `Otázka ${n}: ${state}` : `Otázka ${n}`),
    trackState: { done: 'hotovo', current: 'právě teď', open: 'nezodpovězeno' },
    position: (n: number, total: number) => `Otázka ${n} z ${total}`,
    kind: {
      personal: 'Osobní otázka',
      experience: 'Otázka na zkušenost (STAR)',
      technical: 'Technická otázka',
    } satisfies Record<InterviewQuestionKind, string>,
    structure: {
      personal: 'Výchozí bod → zkušenost a důvod → cíl',
      experience: 'Situace → úkol → postup → výsledek',
      technical: 'Upřesnit problém → ověřit hypotézu → bezpečný další krok → komunikace',
    } satisfies Record<InterviewQuestionKind, string>,
    step: {
      start: 'Výchozí bod',
      reason: 'Zkušenost a důvod',
      goal: 'Cíl',
      situation: 'Situace',
      task: 'Úkol',
      action: 'Postup',
      result: 'Výsledek',
      clarify: 'Upřesnit problém',
      verify: 'Ověřit hypotézu',
      safe: 'Bezpečný další krok',
      communicate: 'Komunikace',
    } satisfies Record<AnswerStep, string>,
    hint: 'Nápověda',
    hintStructure: 'Stavba odpovědi',
    hintTips: 'Na co myslet',
    hintStarters: 'Jak začít',
    hintOwn: 'Váš uložený příklad',
    answerAloud: 'Odpovězte nahlas, jako byste mluvili s tazatelem. Nic se nenahrává.',
    followUpLabel: 'Doplňující otázka',
    mainQuestion: 'Hlavní otázka',
    answerFollowUp: 'Tazatel navazuje na vaši odpověď. Odpovězte nahlas a konkrétně.',
    toFollowUp: 'Pokračovat na doplňující otázku',
    toReview: 'Zobrazit vzorovou odpověď',
    end: 'Ukončit pohovor',
    modelTitle: 'Vzorová odpověď',
    illustrativeNote: 'Ilustrační příklad, ne fakt o vás. Zvýrazněná místa nahraďte vlastními fakty, která umíte doložit.',
    replaceTitle: 'Nahraďte vlastními fakty',
    replaceMark: (n: number) => `fakt k nahrazení ${n}:`,
    translation: 'Zobrazit překlad',
    followUpModel: 'Vzor k doplňující otázce',
    phrases: 'Užitečné formulace',
    dictionary: 'Souvisí ve slovníku',
    ownTitle: 'Váš vlastní příklad',
    ownLead:
      'Napište si vlastní verzi odpovědi s fakty, která umíte doložit. Zůstane jen v tomto prohlížeči. Nepište jména firem, klientů ani kolegů a žádné interní údaje.',
    ownLabel: 'Vaše verze (německy)',
    evidenceLegend: 'Jak příklad doložíte?',
    evidence: {
      cv: 'Mám v životopise',
      confirmed: 'Doložím z praxe',
      lab: 'Z vlastního labu nebo kurzu',
      estimate: 'Odhad, čísla nejsou změřená',
      unverified: 'Zatím neověřeno',
    } satisfies Record<Evidence, string>,
    evidenceHint: 'Na pohovoru říkejte jen to, co umíte doložit. Odhad pojmenujte jako odhad (etwa, ungefähr).',
    ownSave: 'Uložit příklad',
    ownSaved: 'Příklad je uložený v tomto prohlížeči.',
    ownRemoved: 'Příklad je smazaný.',
    selfTitle: 'Sebehodnocení',
    selfLead: 'Porovnejte svou odpověď se vzorem a s checklistem u každého kritéria.',
    check: {
      direct: 'Odpověděli jste přímo na otázku?',
      structure: 'Drželi jste strukturu?',
      vocabulary: 'Použili jste vhodnou slovní zásobu?',
      followUp: 'Zvládli jste doplňující otázku?',
    } satisfies Record<SelfCheckId, string>,
    checkShort: {
      direct: 'Přímá odpověď',
      structure: 'Struktura',
      vocabulary: 'Slovní zásoba',
      followUp: 'Doplňující otázka',
    } satisfies Record<SelfCheckId, string>,
    value: { yes: 'Ano', partly: 'Částečně', no: 'Ne' } satisfies Record<CheckValue, string>,
    incomplete: 'Ohodnoťte všechna čtyři kritéria.',
    saveNext: 'Uložit a další otázka',
    saveSummary: 'Uložit a zobrazit souhrn',
    retry: 'Zkusit znovu',
    retryNote: (saves: boolean, otherFollowUp: boolean) =>
      `${saves ? 'Vyplněné sebehodnocení se uloží jako pokus a otázka začne znovu.' : 'Otázka začne znovu; neúplné sebehodnocení se neuloží.'}${otherFollowUp ? ' Doplňující otázka bude jiná.' : ''}`,
    summaryTitle: 'Souhrn pohovoru',
    summaryTitleEarly: 'Pohovor ukončen',
    answered: (n: number, total: number) => `Zodpovězené otázky: ${n} z ${total}`,
    notAnswered: 'Nezodpovězeno',
    tries: (n: number) => `${n} ${plural(n, 'pokus', 'pokusy', 'pokusů')}`,
    revisit: 'Zkusit znovu tuto otázku',
    answerNow: 'Odpovědět na tuto otázku',
    criterion: 'Kritérium',
    countsTitle: 'Vaše sebehodnocení podle kritérií',
    hintUsed: 's nápovědou',
    focusTitle: 'Na co se zaměřit',
    focusTip: {
      direct: 'Začněte jádrem odpovědi: první věta říká, co uděláte nebo co jste udělali. Souvislosti až potom.',
      structure:
        'Držte kostru otázky: u zkušenosti STAR, u technické otázky upřesnit → ověřit → bezpečný krok → komunikace. Pomůže nápověda „Stavba odpovědi“.',
      vocabulary: 'Před dalším pokusem si projděte užitečné formulace a hesla ve slovníku a použijte aspoň dvě z nich.',
      followUp: 'Na doplňující otázku odpovězte konkrétně: jeden fakt, krok nebo důvod. Když něco nevíte, řekněte, jak byste to ověřili.',
    } satisfies Record<SelfCheckId, string>,
    allGood: 'Ve všech kritériích jste si dali „Ano“. Zkuste pohovor znovu bez nápovědy nebo s kratším časovačem.',
    again: 'Projít pohovor znovu',
    overview: 'Zpět na přehled',
    savedNote: 'Sebehodnocení je uložené jen v tomto prohlížeči; u každé otázky posledních 10 pokusů.',
  },

  timer: {
    legend: 'Délka časovače',
    seconds: (n: number) => `${n} s`,
    remaining: 'Zbývá',
    start: 'Spustit časovač',
    pause: 'Pozastavit',
    resume: 'Pokračovat v časovači',
    restart: 'Spustit znovu',
    reset: 'Vynulovat',
    up: 'Čas vypršel. Dokončete myšlenku a pokračujte, až budete chtít.',
    note: 'Časovač je jen orientační; pokračovat můžete kdykoli.',
  },

  listen: {
    prompt: 'Poslechněte si německý výraz a vybavte si, co znamená česky. Text uvidíte až s řešením.',
    play: 'Přehrát německy',
    again: 'Přehrát znovu',
    stop: 'Zastavit přehrávání',
    fallback: {
      unsupported: 'Tento prohlížeč přehrávání (Web Speech API) nepodporuje, proto výraz vidíte jako text.',
      'no-voice': 'Prohlížeč nenabízí německý hlas, proto výraz vidíte jako text.',
      error: 'Přehrávání se nepodařilo, proto výraz vidíte jako text.',
    },
    modeHint:
      'Poslech přehraje německý výraz hlasem prohlížeče (de-AT, jinak de-DE) a text ukáže až s řešením. Bez německého hlasu uvidíte text. Hodnocení se počítá ke kartičce DE → CZ.',
  },

  speech: {
    read: 'Přečíst otázku nahlas',
    stop: 'Zastavit předčítání',
    loading: 'Připravuji hlas…',
    speaking: (voice: string) => `Přehrávám: ${voice}.`,
    done: 'Přehrávání dokončeno.',
    stopped: 'Přehrávání zastaveno.',
    noVoice: 'Prohlížeč nenabízí německý hlas. Otázku si přečtěte, text zůstává na obrazovce.',
    error: 'Přehrávání se nepodařilo. Otázku si přečtěte, text zůstává na obrazovce.',
    unsupported: 'Předčítání v tomto prohlížeči není k dispozici; otázka zůstává jako text.',
  },

  settings: {
    title: 'Nastavení',
    speechTitle: 'Hlas a předčítání',
    enabled: 'Nabízet předčítání otázek v Pohovoru',
    enabledHint: 'Otázka se přečte jen po kliknutí na „Přečíst otázku nahlas“.',
    voice: 'Hlas',
    auto: 'Automaticky (de-AT/de-DE)',
    voiceHint: 'Automaticky se použije rakouský hlas (de-AT), jinak německý (de-DE); jiný jazyk nikdy.',
    autoPicked: (voice: string) => `Automaticky se teď použije: ${voice}.`,
    noVoices: 'Prohlížeč teď nenabízí žádný německý hlas. Otázky zůstávají jako text.',
    unsupported: 'Tento prohlížeč předčítání (Web Speech API) nepodporuje. Otázky zůstávají jako text.',
    test: 'Vyzkoušet hlas',
    testText: 'Grüß Gott! So werden die Fragen im Bewerbungsgespräch vorgelesen.',
    note: 'Předčítání používá hlasy prohlížeče a operačního systému. Jak hlas zní, zda je k dispozici rakouská varianta a zda funguje bez internetu, záleží na vybraném hlasu a prohlížeči; některé hlasy prohlížeč zpracovává online. Aplikace mikrofon nepoužívá a nic nenahrává.',
    languageTitle: 'Jazyk ovládání',
    languageHint: 'Mění jen ovládání. Výukový obsah zůstává stejný: německé otázky, české překlady a zadání CZ → DE.',
    progressTitle: 'Pokrok a záloha',
    progressWhere:
      'Pokrok se ukládá jen v tomto prohlížeči na tomto zařízení (localStorage) a aplikace ho nikam neodesílá. Jiný prohlížeč, anonymní okno ani jiné zařízení ho neuvidí a smazáním dat prohlížeče zmizí.',
    progressExportUse: 'Export do souboru slouží k přenosu do jiného prohlížeče a jako záloha.',
    statusLabel: 'Stav ukládání',
    status: {
      ok: 'Ukládá se průběžně v tomto prohlížeči.',
      passive: 'V této kartě se neukládá: pokrok upravuje jiná karta s touto aplikací.',
      unavailable: 'Neukládá se: prohlížeč ukládání nedovolí. Po zavření stránky se pokrok ztratí.',
      memory: 'Neukládá se: zvolili jste práci bez ukládání.',
      'write-failed': 'Poslední změna se neuložila.',
      corrupt: 'Neukládá se: uložená data nejdou přečíst.',
      unsupported: 'Neukládá se: uložená data jsou z novější verze aplikace.',
      stale: 'Neukládá se: pokrok se mezitím změnil v jiné kartě.',
    } satisfies Record<StorageStatus['kind'] | 'passive', string>,
    statusMore: 'Co se stalo a co můžete udělat, popisuje hlášení nahoře na stránce.',
    statusShow: 'Zobrazit hlášení',
    statCards: 'Karty s pokrokem',
    statAttempts: 'Pokusy v pohovoru',
    statExamples: 'Vlastní příklady',
    exportTitle: 'Export',
    exportText:
      'Soubor JSON s pokrokem, rozpracovanou lekcí, statistikami, sebehodnocením, vlastními příklady a nastavením. Obsahuje i vaše vlastní příklady: nesdílejte ho a nevkládejte do repozitáře.',
    exportButton: 'Stáhnout export',
    exportStarted: (name: string) => `Soubor ${name} se stahuje.`,
    importTitle: 'Import',
    importText: 'Načte export z tohoto nebo jiného prohlížeče. Soubor se nejdřív celý zkontroluje a před nahrazením uvidíte souhrn.',
    importLabel: 'Soubor exportu (.json)',
    importReading: 'Kontroluji soubor…',
    importProblem: {
      tooLarge: (kb: number) => `Soubor je příliš velký (${kb} kB). Export této aplikace má nejvýš 2 MB.`,
      empty: 'Soubor je prázdný.',
      notJson: 'Soubor není platný JSON.',
      notExport: 'Soubor není export z Cloud Admin Deutsch.',
      newerFormat: (v: number) => `Export má novější formát (${v}), než tato verze aplikace zná.`,
      newerSchema: (v: number) => `Export pochází z novější verze aplikace (schéma ${v}).`,
      invalidData: (parts: string) => `Soubor obsahuje neplatné údaje: ${parts}.`,
      unreadable: 'Soubor se nepodařilo přečíst.',
    },
    importKept: 'Pokrok v tomto prohlížeči zůstal beze změny.',
    part: {
      app: 'označení aplikace',
      schemaVersion: 'verze dat',
      createdAt: 'datum vytvoření',
      updatedAt: 'datum změny',
      cards: 'karty',
      lesson: 'lekce',
      prefs: 'nastavení',
      interview: 'pohovor',
      rev: 'revize zápisu',
      stats: 'statistiky',
    } satisfies Record<DataPart, string>,
    summaryTitle: 'Souhrn importu',
    summaryExported: 'Exportováno',
    summaryKept: 'Uloženo',
    summaryVersion: 'Verze aplikace',
    summaryCards: 'Karty s pokrokem',
    summaryMastered: (n: number) => `z toho upevněno ${n}`,
    summaryUnknown: 'Karty, které tato verze obsahu nezná (zůstanou uložené)',
    summaryAttempts: 'Pokusy v pohovoru',
    summaryExamples: 'Vlastní příklady',
    summaryLessons: 'Dokončené lekce',
    summaryOpen: 'Rozpracováno',
    summaryOpenLesson: 'lekce',
    summaryOpenInterview: 'pohovor',
    summaryNothingOpen: 'nic',
    replaceWarning: (cardCount: number, attemptCount: number, exampleCount: number) =>
      `Import nahradí veškerý pokrok v tomto prohlížeči (teď ${cards(cardCount)}, ${attempts(attemptCount)} v pohovoru, ${examples(exampleCount)}). Tuto akci nelze vrátit.`,
    replaceConfirm: 'Nahradit pokrok',
    replaceCancel: 'Zrušit import',
    backupFirst: 'Nejdřív stáhnout současný pokrok',
    replaced: (n: number) => `Hotovo: pokrok je obnovený ze souboru (${cards(n)}).`,
    replacedMemory: 'Pokrok je načtený, ale prohlížeč nedovolí ukládat: po zavření stránky se ztratí.',
    /** Shown in the import error box, followed by importKept. */
    replaceFailed: 'Zápis se nepodařil.',
    replaceReadOnly: 'Tato karta je jen pro čtení, nic se nenahradilo.',
    readOnlyNote: 'Tato karta je jen pro čtení. Import a smazání proveďte v kartě, která pokrok upravuje, nebo nahoře zvolte „Pracovat v této kartě“.',
    resetTitle: 'Smazat pokrok',
    resetText:
      'Smaže pokrok, statistiky, sebehodnocení, vlastní příklady, nastavení a uložená původní data této aplikace v tomto prohlížeči (všechny klíče začínající „cloud-admin-deutsch-at:“), včetně jazyka ovládání. Jiná data prohlížeče zůstanou.',
    resetButton: 'Smazat pokrok…',
    resetDialogTitle: 'Smazat veškerý pokrok?',
    resetConfirmText:
      'Smaže se pokrok, statistiky, vlastní příklady a nastavení této aplikace v tomto prohlížeči. Tuto akci nelze vrátit; nejdřív si můžete stáhnout export.',
    resetConfirm: 'Ano, smazat',
    resetCancel: 'Zpět',
    resetDone: 'Pokrok je smazaný, aplikace začíná znovu.',
    resetFailed: 'Smazání se nepodařilo, data zůstala beze změny.',
    statsTitle: 'Statistiky',
    statsSince: (date: string) => `Počítá se od ${date}; dřívější studium se nezapočítalo.`,
    statsLessons: 'Dokončené lekce',
    statsEndedEarly: 'Ukončené dřív',
    statsFirstAttempt: 'Přesnost prvního pokusu (psaní a gramatika)',
    statsFirstAttemptValue: (correct: number, total: number, percent: number) => `${correct} z ${total} (${percent} %)`,
    statsNone: 'zatím nic',
    statsSelf: 'Vaše hodnocení kartiček a porovnaných vět',
    statsInterview: 'Sebehodnocení v pohovoru',
    statsInterviewValue: (n: number, hinted: number) => `${attempts(n)}, z toho s nápovědou ${hinted}`,
    statsNote:
      'Každá lekce se započítá jednou, ve chvíli, kdy skončí. Přesnost počítá jen odpovědi, které zkontrolovala aplikace; vaše hodnocení kartiček a sebehodnocení v pohovoru jsou uvedené zvlášť. U pohovoru se uchovává posledních 10 pokusů na otázku.',
    persistTitle: 'Trvalé uložení v prohlížeči',
    persistGranted: 'Prohlížeč data této stránky uchová, ani když bude docházet místo.',
    persistNotGranted:
      'Prohlížeč může data stránky smazat, když dochází místo nebo když ji dlouho nenavštívíte (týká se hlavně Safari). Můžete požádat o trvalé uložení; skutečnou zálohou je ale jen export.',
    persistAsk: 'Požádat o trvalé uložení',
    persistDenied: 'Prohlížeč žádost teď nepovolil.',
    persistUnsupported: 'Tento prohlížeč trvalé uložení nenabízí; zálohou je export.',
    backupTitle: 'Data před poslední aktualizací',
    backupText: (date: string, version: number) =>
      `Při převodu uložených dat na novou verzi (ze schématu ${version}, ${date}) se původní data uložila zvlášť. Můžete si je stáhnout nebo z nich obnovit pokrok.`,
    backupDownload: 'Stáhnout původní data',
    backupRestore: 'Obnovit z původních dat…',
    backupRemove: 'Smazat původní data',
    backupUnreadable: 'Původní data nejdou přečíst; můžete si je jen stáhnout.',
    restoreSummaryTitle: 'Souhrn obnovy',
  },

  storage: {
    unavailableTitle: 'Pokrok se neukládá',
    unavailableText:
      'Prohlížeč nedovolí ukládat data (např. anonymní okno nebo zablokované úložiště). Můžete trénovat, ale po zavření stránky se pokrok ztratí.',
    corruptTitle: 'Uložená data nelze přečíst',
    corruptText: 'Pracujete bez ukládání. Uložená data zůstala beze změny, dokud nezvolíte jinak.',
    unsupportedTitle: 'Data z novější verze aplikace',
    unsupportedText: (v: number) =>
      `Uložený pokrok má novější formát (verze ${v}). Pracujete bez ukládání a data zůstala beze změny.`,
    writeFailedTitle: 'Poslední změnu se nepodařilo uložit',
    writeFailedText: (error: string) =>
      `Úložiště prohlížeče odmítlo zápis (${error}). Pokrok zatím zůstává jen v této stránce: stáhněte si export, ať o nic nepřijdete.`,
    memoryTitle: 'Pracujete bez ukládání',
    memoryText: 'Změny se neukládají.',
    download: 'Stáhnout uložená data',
    recover: (n: number) => `Obnovit platná data (${cards(n)})`,
    reset: 'Smazat a začít znovu',
    continueWithout: 'Pokračovat bez ukládání',
    retry: 'Zkusit znovu uložit',
    resume: 'Znovu ukládat',
    options: 'Možnosti',
    confirmResetTitle: 'Smazat uložená data a začít znovu?',
    confirmReset: 'Uložená data této aplikace v tomto prohlížeči se smažou. Tuto akci nelze vrátit; nejdřív si je můžete stáhnout.',
    confirmResetYes: 'Ano, smazat',
    confirmRecoverTitle: 'Obnovit jen platná data?',
    confirmRecover: (kept: number, dropped: number) =>
      `Uloží se jen platná data (${cards(kept)}). Poškozené záznamy (${dropped}) se odstraní.`,
    confirmRecoverYes: 'Ano, obnovit',
    back: 'Zpět',
    actionFailed: 'Zápis se nepodařil. Data zůstala beze změny.',
    exportCurrent: 'Stáhnout export aktuálního stavu',
    passiveTitle: 'Tato karta je jen pro čtení',
    passiveText: 'Pokrok právě upravuje jiná karta s touto aplikací. Tady vidíte uložený stav a můžete si prohlížet, ale změny se tu neukládají.',
    takeOver: 'Pracovat v této kartě',
    refused: 'Tato změna se v této kartě neuložila.',
    staleTitle: {
      changed: 'Pokrok se změnil v jiné kartě',
      removed: 'Pokrok byl v jiné kartě smazán',
      newer: 'Data uložila novější verze aplikace',
    },
    staleText: {
      changed: 'Tato karta už nemá aktuální stav, a proto nic neuloží. Načtěte aktuální stav a pokračujte.',
      removed: 'Tato karta proto nic neuloží. Načtěte aktuální stav a začněte znovu, nebo si nejdřív stáhněte export toho, co vidíte.',
      newer: 'Tato verze je nepřepíše. Obnovte stránku, aby se načetla novější verze aplikace.',
    },
    reloadStored: 'Načíst aktuální stav',
    reloadPage: 'Obnovit stránku',
    pointer: {
      'write-failed': 'Poslední změnu se nepodařilo uložit.',
      stale: 'Tato karta už nic neuloží: pokrok se změnil v jiné kartě.',
      refused: 'Tato změna se v této kartě neuložila.',
    },
    showOptions: 'Zobrazit možnosti',
    hidePointer: 'Skrýt',
  },
}

export type Messages = typeof cs
