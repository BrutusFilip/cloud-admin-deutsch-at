import type { StudyItem } from '../../domain/types'

export const handover: StudyItem[] = [
  {
    id: 'handover-v-001',
    kind: 'noun',
    topic: 'handover',
    level: 'B2',
    de: 'die Übergabe',
    gender: 'f',
    plural: 'die Übergaben',
    cz: 'předání (práce, agendy)',
    example: {
      de: 'Vor meinem Urlaub bereite ich eine schriftliche Übergabe für das Team vor.',
      cz: 'Před dovolenou připravím pro tým písemné předání.',
    },
    noteCz: 'Velké Ü na začátku slova. Sloveso übergeben je neodlučitelné: ich übergebe, perfekt hat übergeben.',
  },
  {
    id: 'handover-v-002',
    kind: 'verb',
    topic: 'handover',
    level: 'C1',
    de: 'festhalten',
    cz: 'zaznamenat, zachytit (písemně)',
    government: 'etwas (A) (schriftlich) festhalten; etwas (A) in etwas (D) festhalten (im Ticket, im Protokoll)',
    past: 'hielt fest – hat festgehalten',
    example: {
      de: 'Alle Schritte halte ich im Ticket fest, damit die Kollegen nahtlos weiterarbeiten können.',
      cz: 'Všechny kroky zaznamenám v ticketu, aby kolegové mohli plynule pokračovat.',
    },
    noteCz: 'Odlučitelné: ich halte … fest. Druhý význam: pevně držet.',
    write: { mode: 'auto', promptCz: 'zaznamenat (písemně)' },
  },
  {
    id: 'handover-s-001',
    kind: 'sentence',
    topic: 'handover',
    level: 'B2',
    de: 'Die Zugangsdaten sind im Passwortmanager hinterlegt.',
    cz: 'Přístupové údaje jsou uložené ve správci hesel.',
    example: {
      de: 'Die Zugangsdaten sind im Passwortmanager hinterlegt; die Freigabe dafür erteilt die Teamleitung.',
      cz: 'Přístupové údaje jsou uložené ve správci hesel; přístup k nim schvaluje vedoucí týmu.',
    },
    noteCz: '„die Zugangsdaten“ existuje jen v plurálu. „hinterlegt“ = uložené na dohodnutém místě (stavový pasiv: sind hinterlegt).',
    write: {
      mode: 'compare',
      accept: [
        { text: 'Die Zugangsdaten sind im Passwort-Manager hinterlegt.' },
        { text: 'Die Zugangsdaten sind im Passwortmanager gespeichert.', noteCz: 'Uznáno; pro uložení na dohodnuté místo se v IT němčině často říká „hinterlegt“.' },
      ],
    },
  },
  {
    id: 'handover-v-003',
    kind: 'phrase',
    topic: 'handover',
    level: 'B2',
    de: 'den aktuellen Stand übergeben',
    cz: 'předat aktuální stav',
    grammar: 'übergeben – übergab – hat übergeben (neodlučitelné); etwas an jemanden (A) übergeben',
    example: {
      de: 'Vor Schichtende übergebe ich den aktuellen Stand an die Kollegin aus der Spätschicht.',
      cz: 'Před koncem směny předám aktuální stav kolegyni z odpolední směny.',
    },
    noteCz: '„übergeben“ je neodlučitelné: ich übergebe, hat übergeben. „der Stand“ = stav věcí: Wie ist der aktuelle Stand?',
  },
  {
    id: 'handover-s-002',
    kind: 'sentence',
    topic: 'handover',
    level: 'B2',
    de: 'Offen ist nur noch die Rückmeldung des Netzwerkteams.',
    cz: 'Otevřená zůstává už jen odpověď síťového týmu.',
    example: {
      de: 'Erledigt sind die Prüfung der Firewall und der Test mit zwei Nutzern; offen ist nur noch die Rückmeldung des Netzwerkteams.',
      cz: 'Hotová je kontrola firewallu a test se dvěma uživateli; otevřená zůstává už jen odpověď síťového týmu.',
    },
    noteCz: 'Předání v kostce: „Erledigt ist … / Offen ist …“. Sloveso stojí na 2. místě, podmět až za ním.',
    write: {
      mode: 'compare',
      accept: [
        { text: 'Offen ist nur noch die Rückmeldung vom Netzwerkteam.' },
        { text: 'Nur noch die Rückmeldung des Netzwerkteams ist offen.' },
      ],
    },
  },
  {
    id: 'handover-g-001',
    kind: 'grammar',
    topic: 'handover',
    level: 'C1',
    focus: 'past',
    promptCz: 'Spojte věty spojkou „nachdem“ (první děj proběhl dřív).',
    task: {
      type: 'transform',
      source: 'Ich habe das Zertifikat erneuert. Danach habe ich die VPN-Verbindung getestet.',
      answers: [
        'Nachdem ich das Zertifikat erneuert hatte, habe ich die VPN-Verbindung getestet.',
        'Ich habe die VPN-Verbindung getestet, nachdem ich das Zertifikat erneuert hatte.',
        'Nachdem ich das Zertifikat erneuert hatte, testete ich die VPN-Verbindung.',
      ],
    },
    de: 'Nachdem ich das Zertifikat erneuert hatte, habe ich die VPN-Verbindung getestet.',
    cz: 'Poté, co jsem obnovil(a) certifikát, otestoval(a) jsem připojení k VPN.',
    explanationCz:
      'Po „nachdem“ stojí dřívější děj v plusquamperfektu: „erneuert hatte“ (sloveso na konci). Hlavní věta je v perfektu nebo préteritu. Začíná-li věta vedlejší větou, následuje za čárkou hned sloveso: „…, habe ich …“.',
    example: {
      de: 'Nachdem wir den Fehler behoben hatten, haben wir den Kunden informiert.',
      cz: 'Poté, co jsme chybu odstranili, informovali jsme zákazníka.',
    },
  },
  {
    id: 'handover-g-002',
    kind: 'grammar',
    topic: 'handover',
    level: 'C1',
    focus: 'past',
    promptCz: 'Převeďte do minulého času pro krátký popis incidentu: běžné sloveso v perfektu, modální sloveso v préteritu.',
    task: {
      type: 'transform',
      source: 'Der Kollege meldet sich um 8 Uhr. Er kann sich nicht anmelden.',
      answers: [
        'Der Kollege hat sich um 8 Uhr gemeldet. Er konnte sich nicht anmelden.',
        'Der Kollege hat sich um 8 Uhr gemeldet. Er hat sich nicht anmelden können.',
      ],
    },
    de: 'Der Kollege hat sich um 8 Uhr gemeldet. Er konnte sich nicht anmelden.',
    cz: 'Kolega se ozval v 8 hodin. Nemohl se přihlásit.',
    explanationCz:
      'Běžná slovesa popisuje mluvená řeč v perfektu: „hat sich gemeldet“. Modální slovesa se v minulosti používají hlavně v préteritu: „konnte“. Perfektum „hat … anmelden können“ (dva infinitivy na konci) je také správně, jen těžkopádnější.',
    example: {
      de: 'Die Nutzerin hat das Ticket um 9 Uhr eröffnet, weil sie nicht drucken konnte.',
      cz: 'Uživatelka otevřela ticket v 9 hodin, protože nemohla tisknout.',
    },
  },
  {
    id: 'handover-g-003',
    kind: 'grammar',
    topic: 'handover',
    level: 'B1',
    focus: 'word-order',
    promptCz: 'Převeďte na souvětí se spojkou „dass“; začátek věty ponechte.',
    task: {
      type: 'transform',
      source: 'Ich habe dem Team mitgeteilt: Die Störung ist seit 10 Uhr behoben.',
      answers: [
        'Ich habe dem Team mitgeteilt, dass die Störung seit 10 Uhr behoben ist.',
        'Ich habe dem Team mitgeteilt, dass seit 10 Uhr die Störung behoben ist.',
      ],
    },
    de: 'Ich habe dem Team mitgeteilt, dass die Störung seit 10 Uhr behoben ist.',
    cz: 'Týmu jsem oznámil(a), že porucha je od 10 hodin odstraněná.',
    explanationCz:
      'Po „dass“ stojí časované sloveso na konci vedlejší věty: „… behoben ist“. Místo dvojtečky přijde čárka. Hovorově jde říct i „…, die Störung ist behoben“ bez „dass“, zadání ale chce vedlejší větu.',
    example: {
      de: 'Die Kollegin hat bestätigt, dass die Anmeldung wieder funktioniert.',
      cz: 'Kolegyně potvrdila, že přihlášení zase funguje.',
    },
  },
  {
    id: 'handover-v-004',
    kind: 'verb',
    topic: 'handover',
    level: 'B1',
    de: 'dokumentieren',
    cz: 'zdokumentovat, zapsat',
    government: 'etwas (A) dokumentieren; etwas (A) in etwas (D) dokumentieren (im Ticket, im Wiki)',
    past: 'dokumentierte – hat dokumentiert',
    example: {
      de: 'Jeden Schritt dokumentiere ich im Ticket, damit die Übergabe ohne Rückfragen möglich ist.',
      cz: 'Každý krok zapíšu do ticketu, aby předání proběhlo bez doptávání.',
    },
    noteCz: 'Kde → dativ: im Ticket, im Wiki. Slovesa na -ieren tvoří příčestí bez ge-: dokumentiert. Podstatné jméno: die Dokumentation.',
  },
]
