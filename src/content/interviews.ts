import type { Interview } from '../domain/types'

/**
 * Pohovor: four short fictitious interviews. Model answers are illustrative –
 * `replace` marks the facts the learner swaps for their own verifiable ones.
 * Question IDs are stable (`<topic>-i-<NNN>`); attempts are stored per ID.
 */
export const INTERVIEWS: Interview[] = [
  {
    id: 'motivation',
    level: 'B2',
    titleCz: 'Představení a motivace',
    titleDe: 'Vorstellung und Motivation',
    contextDe: 'Erstes Gespräch für eine Stelle als Cloud Administrator (m/w/d) in einem mittelständischen Unternehmen in Wien.',
    contextCz: 'První kolo pohovoru na pozici Cloud Administrator ve středně velké firmě ve Vídni.',
    questions: [
      {
        id: 'intro-i-001',
        topic: 'intro',
        kind: 'personal',
        seconds: 90,
        de: 'Erzählen Sie uns bitte kurz etwas über sich und Ihren beruflichen Werdegang.',
        cz: 'Řekněte nám prosím krátce něco o sobě a o své profesní dráze.',
        hintCz: [
          'Začněte současnou rolí, ne životopisem od školy.',
          'Vyberte dvě až tři zkušenosti, které souvisejí s pozicí.',
          'Zakončete tím, kam chcete směřovat.',
        ],
        startersDe: ['Derzeit arbeite ich als …', 'Davor war ich … tätig.', 'Jetzt möchte ich …'],
        followUps: [
          {
            de: 'Welche Aufgabe in Ihrer jetzigen Rolle machen Sie am liebsten – und warum?',
            cz: 'Kterou práci ve své současné roli děláte nejraději – a proč?',
            model: {
              de: 'Am liebsten kümmere ich mich um Probleme, die sich dauerhaft lösen lassen, zum Beispiel um wiederkehrende Tickets. Da sehe ich am deutlichsten, dass meine Arbeit dem ganzen Team Zeit spart.',
              cz: 'Nejraději se věnuji problémům, které se dají vyřešit natrvalo, například opakujícím se ticketům. Tam nejvíc vidím, že moje práce šetří čas celému týmu.',
            },
          },
        ],
        model: {
          parts: [
            {
              step: 'start',
              de: 'Derzeit arbeite ich im IT-Support und kümmere mich vor allem um Benutzerkonten, Lizenzen und Postfächer in Microsoft 365.',
            },
            {
              step: 'reason',
              de: 'Davor war ich zwei Jahre im Service Desk tätig, wo ich gelernt habe, Probleme strukturiert einzugrenzen und verständlich zu erklären.',
            },
            {
              step: 'goal',
              de: 'Jetzt möchte ich den nächsten Schritt machen und mich auf die Administration von Cloud-Diensten konzentrieren.',
            },
          ],
          cz: 'V současnosti pracuji v IT supportu a starám se hlavně o uživatelské účty, licence a poštovní schránky v Microsoft 365. Předtím jsem dva roky pracoval(a) na service desku, kde jsem se naučil(a) problémy systematicky lokalizovat a srozumitelně vysvětlovat. Teď chci udělat další krok a soustředit se na správu cloudových služeb.',
        },
        replace: [
          { text: 'im IT-Support', noteCz: 'Vaše skutečná současná role.' },
          { text: 'Benutzerkonten, Lizenzen und Postfächer in Microsoft 365', noteCz: 'Úkoly, které opravdu děláte a umíte doložit.' },
          { text: 'zwei Jahre im Service Desk', noteCz: 'Vaše předchozí role a její skutečná délka.' },
          { text: 'wiederkehrende Tickets', noteCz: 'Konkrétní typ práce z vaší praxe.' },
        ],
        phrases: [
          { de: 'Derzeit arbeite ich als …', cz: 'V současnosti pracuji jako …' },
          { de: 'Davor war ich … tätig.', cz: 'Předtím jsem pracoval(a) …' },
          { de: 'Ich habe gelernt, … zu …', cz: 'Naučil(a) jsem se …' },
          { de: 'den nächsten Schritt machen', cz: 'udělat další krok' },
        ],
        checks: {
          direct: 'Začali jste současnou rolí, ne obecným úvodem.',
          structure: 'Současnost → zkušenost → cíl, nejvýš tři hlavní body.',
          vocabulary: 'Např. derzeit, tätig sein, sich kümmern um, Erfahrungen sammeln.',
          followUp: 'Jmenovali jste jeden konkrétní úkol a důvod („…, weil …“).',
        },
        dictionary: ['intro-s-001', 'intro-v-001', 'intro-v-004'],
      },
      {
        id: 'intro-i-002',
        topic: 'intro',
        kind: 'personal',
        seconds: 75,
        de: 'Warum möchten Sie vom IT-Support in die Cloud-Administration wechseln?',
        cz: 'Proč chcete přejít z IT supportu do cloudové administrace?',
        hintCz: [
          'Jeden hlavní důvod, ne seznam.',
          'Opřete ho o zkušenost ze supportu.',
          'Řekněte, co chcete v nové roli dělat.',
        ],
        startersDe: ['Im Support habe ich gemerkt, dass …', 'Mich reizt vor allem, dass …'],
        followUps: [
          {
            de: 'Welche Kenntnisse fehlen Ihnen noch für diese Rolle, und wie bauen Sie sie auf?',
            cz: 'Jaké znalosti vám pro tuto roli ještě chybí a jak si je doplňujete?',
            model: {
              de: 'Mehr Praxis brauche ich noch bei Azure-Ressourcen und bei der Automatisierung mit PowerShell. Deshalb übe ich regelmäßig in einer eigenen Testumgebung und bereite mich auf eine Azure-Zertifizierung vor.',
              cz: 'Víc praxe ještě potřebuji s prostředky v Azure a s automatizací v PowerShellu. Proto pravidelně cvičím ve vlastním testovacím prostředí a připravuji se na certifikaci Azure.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'start', de: 'Im Support löse ich viele Probleme, deren Ursache in der Konfiguration liegt.' },
            { step: 'reason', de: 'Mich reizt, Systeme so einzurichten, dass solche Probleme gar nicht erst entstehen.' },
            { step: 'goal', de: 'Deshalb möchte ich in die Cloud-Administration wechseln und Verantwortung für die Umgebung übernehmen.' },
          ],
          cz: 'V supportu řeším hodně problémů, jejichž příčina je v konfiguraci. Láká mě nastavovat systémy tak, aby takové problémy vůbec nevznikaly. Proto chci přejít do cloudové administrace a převzít odpovědnost za prostředí.',
        },
        replace: [
          { text: 'deren Ursache in der Konfiguration liegt', noteCz: 'Vlastní pozorování z praxe, které umíte doložit příkladem.' },
          { text: 'bei Azure-Ressourcen und bei der Automatisierung mit PowerShell', noteCz: 'Mezery, které opravdu máte – upřímnost tu působí dobře.' },
          { text: 'in einer eigenen Testumgebung', noteCz: 'Jen pokud lab opravdu máte; jinak řekněte, co konkrétně děláte.' },
          { text: 'auf eine Azure-Zertifizierung', noteCz: 'Zkouška, na kterou se skutečně připravujete.' },
        ],
        phrases: [
          { de: 'Mich reizt vor allem, dass …', cz: 'Láká mě hlavně to, že …' },
          { de: 'Verantwortung für etwas übernehmen', cz: 'převzít odpovědnost za něco' },
          { de: 'Mehr Praxis brauche ich noch bei …', cz: 'Víc praxe ještě potřebuji v …' },
          { de: 'sich auf etwas vorbereiten', cz: 'připravovat se na něco' },
        ],
        checks: {
          direct: 'Hlavní důvod zazněl v první nebo druhé větě.',
          structure: 'Výchozí bod → důvod opřený o zkušenost → cíl.',
          vocabulary: 'Např. reizen, wechseln, Verantwortung übernehmen, sich weiterentwickeln.',
          followUp: 'Přiznali jste konkrétní mezeru a řekli, co s ní děláte.',
        },
        dictionary: ['intro-s-002', 'intro-v-003', 'intro-s-004'],
      },
      {
        id: 'intro-i-003',
        topic: 'intro',
        kind: 'experience',
        seconds: 90,
        de: 'Erzählen Sie uns von einer Situation, in der Sie ein wiederkehrendes Problem dauerhaft gelöst haben.',
        cz: 'Povězte nám o situaci, kdy jste trvale vyřešil(a) opakující se problém.',
        hintCz: [
          'Situace a úkol stručně – jedna věta na každý.',
          'Nejvíc času věnujte postupu: co jste udělal(a) vy.',
          'Výsledek nejlépe číslem, které umíte doložit.',
        ],
        startersDe: ['In meinem Team gab es …', 'Meine Aufgabe war, …', 'Seitdem …'],
        followUps: [
          {
            de: 'Woran haben Sie gemerkt, dass Ihre Lösung wirklich funktioniert?',
            cz: 'Podle čeho jste poznal(a), že vaše řešení opravdu funguje?',
            model: {
              de: 'Ich habe die Zahl dieser Tickets einen Monat lang beobachtet und mit den Wochen davor verglichen.',
              cz: 'Měsíc jsem sledoval(a) počet těchto ticketů a porovnal(a) ho s týdny předtím.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'situation', de: 'Im Support kamen jede Woche mehrere Tickets zu gesperrten Konten.' },
            { step: 'task', de: 'Meine Aufgabe war, die Ursache zu finden, statt die Konten immer wieder nur zu entsperren.' },
            {
              step: 'action',
              de: 'Ich habe die Anmeldeprotokolle ausgewertet und festgestellt, dass alte Smartphones mit gespeicherten Kennwörtern die Sperren auslösten. Gemeinsam mit dem Team habe ich eine kurze Anleitung für die Benutzer erstellt.',
            },
            { step: 'result', de: 'Danach ist die Zahl dieser Tickets deutlich zurückgegangen.' },
          ],
          cz: 'Na supportu chodilo každý týden několik ticketů kvůli zablokovaným účtům. Mým úkolem bylo najít příčinu, místo abychom účty jen znovu a znovu odemykali. Vyhodnotil(a) jsem protokoly přihlášení a zjistil(a), že zablokování způsobují staré chytré telefony s uloženými hesly. Spolu s týmem jsem pro uživatele připravil(a) krátký návod. Potom počet těchto ticketů výrazně klesl.',
        },
        replace: [
          { text: 'Tickets zu gesperrten Konten', noteCz: 'Skutečný opakující se problém z vaší praxe.' },
          { text: 'alte Smartphones mit gespeicherten Kennwörtern', noteCz: 'Příčina, kterou jste opravdu zjistil(a).' },
          { text: 'deutlich zurückgegangen', noteCz: 'Výsledek, nejlépe ověřitelným číslem („von etwa zehn auf zwei pro Woche“).' },
          { text: 'einen Monat lang', noteCz: 'Jak a jak dlouho jste výsledek skutečně ověřoval(a).' },
        ],
        phrases: [
          { de: 'Meine Aufgabe war, …', cz: 'Mým úkolem bylo …' },
          { de: 'Ich habe festgestellt, dass …', cz: 'Zjistil(a) jsem, že …' },
          { de: 'die Ursache finden', cz: 'najít příčinu' },
          { de: 'Die Zahl … ist deutlich zurückgegangen.', cz: 'Počet … výrazně klesl.' },
        ],
        checks: {
          direct: 'Hned v první větě zaznělo, o jaký problém šlo.',
          structure: 'STAR: situace → úkol → postup → výsledek; nejvíc o postupu.',
          vocabulary: 'Např. auswerten, feststellen, die Ursache, zurückgehen; perfektum správně (habe … ausgewertet).',
          followUp: 'Jmenovali jste konkrétní měřítko nebo kontrolu, ne jen „funguje to“.',
        },
        dictionary: ['identity-v-005', 'incidents-v-004', 'intro-s-003'],
      },
    ],
  },
  {
    id: 'entra-access',
    level: 'B2',
    titleCz: 'Praxe v Entra ID a Microsoft 365',
    titleDe: 'Praxisfälle: Entra ID und Microsoft 365',
    contextDe: 'Fachgespräch mit der Teamleitung IT-Betrieb über typische Fälle im Benutzer- und Zugriffsmanagement.',
    contextCz: 'Odborný pohovor s vedoucí IT provozu o typických situacích ve správě uživatelů a přístupů.',
    questions: [
      {
        id: 'access-i-001',
        topic: 'access',
        kind: 'technical',
        seconds: 90,
        de: 'Eine Kollegin hat ein neues Diensthandy und kann sich nicht mehr anmelden, weil die Authenticator-App noch auf dem alten Gerät eingerichtet ist. Wie gehen Sie vor?',
        cz: 'Kolegyně má nový služební telefon a nemůže se přihlásit, protože aplikace Authenticator je stále nastavená na starém zařízení. Jak postupujete?',
        hintCz: [
          'Nejdřív ověření totožnosti – bez něj žádný zásah do MFA.',
          'Zkontrolujte registrované metody ověřování.',
          'Bezpečný krok: dočasný přístup podle pravidel firmy.',
          'Na konci test přihlášení a záznam v ticketu.',
        ],
        startersDe: ['Zuerst würde ich die Identität … überprüfen.', 'Danach würde ich im Entra Admin Center …'],
        followUps: [
          {
            de: 'Die Kollegin hat in zehn Minuten einen Kundentermin und drängt. Würden Sie auf die Identitätsprüfung verzichten?',
            cz: 'Kolegyně má za deset minut schůzku se zákazníkem a naléhá. Vynechal(a) byste ověření totožnosti?',
            model: {
              de: 'Nein, darauf würde ich nicht verzichten, weil gerade solche Anrufe für Social Engineering genutzt werden. Ich würde ihr das kurz erklären und die Prüfung so schnell wie möglich erledigen.',
              cz: 'Ne, to bych nevynechal(a), protože právě takové hovory se zneužívají k sociálnímu inženýrství. Krátce bych jí to vysvětlil(a) a ověření co nejrychleji vyřídil(a).',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich die Identität der Kollegin überprüfen, zum Beispiel per Rückruf unter der hinterlegten Nummer.' },
            { step: 'verify', de: 'Danach würde ich im Entra Admin Center prüfen, welche Authentifizierungsmethoden registriert sind.' },
            {
              step: 'safe',
              de: 'Wenn keine zweite Methode vorhanden ist, würde ich die alte Methode entfernen und – sofern unsere Richtlinie das vorsieht – einen Temporary Access Pass ausstellen.',
            },
            { step: 'communicate', de: 'Zum Schluss würde ich die Anmeldung gemeinsam mit ihr testen und alle Schritte im Ticket dokumentieren.' },
          ],
          cz: 'Nejdřív bych ověřil(a) totožnost kolegyně, například zpětným zavoláním na uložené číslo. Potom bych v Entra admin centru zkontroloval(a), jaké metody ověřování jsou zaregistrované. Pokud žádná druhá metoda není, odstranil(a) bych starou metodu a – pokud to naše pravidla umožňují – vystavil(a) Temporary Access Pass. Nakonec bych s ní společně vyzkoušel(a) přihlášení a všechny kroky zapsal(a) do ticketu.',
        },
        replace: [
          { text: 'per Rückruf unter der hinterlegten Nummer', noteCz: 'Postup ověření totožnosti, který se u vás skutečně používá.' },
          { text: 'einen Temporary Access Pass', noteCz: 'Jen pokud ho vaše organizace povoluje; jinak váš postup obnovy MFA.' },
        ],
        phrases: [
          { de: 'die Identität überprüfen', cz: 'ověřit totožnost' },
          { de: 'sofern die Richtlinie das vorsieht', cz: 'pokud to pravidla umožňují' },
          { de: 'einen Temporary Access Pass ausstellen', cz: 'vystavit Temporary Access Pass' },
          { de: 'auf etwas verzichten', cz: 'něco vynechat, vzdát se něčeho' },
        ],
        checks: {
          direct: 'Ověření totožnosti zaznělo hned jako první krok.',
          structure: 'Ověření totožnosti → kontrola metod → bezpečný zásah → test a dokumentace.',
          vocabulary: 'Např. Authentifizierungsmethoden, überprüfen, ausstellen, dokumentieren.',
          followUp: 'Zkratku jste odmítli, zdůvodnili to a zůstali vstřícní.',
        },
        dictionary: ['access-v-006', 'access-g-002', 'identity-g-002'],
      },
      {
        id: 'access-i-002',
        topic: 'access',
        kind: 'technical',
        seconds: 75,
        de: 'Ein Mitarbeiter hat plötzlich keinen Zugriff mehr auf ein freigegebenes Postfach. Wie gehen Sie vor?',
        cz: 'Zaměstnanec najednou nemá přístup ke sdílené schránce. Jak postupujete?',
        hintCz: [
          'Upřesněte: od kdy, jen on, nebo i další?',
          'Hypotéza: změna členství ve skupině nebo oprávnění.',
          'Bezpečný krok: přístup jen se schválením a přes skupinu.',
          'Komunikace: dát vědět a zapsat schválení.',
        ],
        startersDe: ['Zuerst würde ich klären, seit wann …', 'Dann würde ich prüfen, ob …'],
        followUps: [
          {
            de: 'Wie stellen Sie sicher, dass Sie dabei nicht zu viele Rechte vergeben?',
            cz: 'Jak zajistíte, abyste přitom nepřidělil(a) příliš mnoho práv?',
            model: {
              de: 'Ich vergebe nur die Rechte, die für die Aufgabe nötig sind, und zwar über Gruppen statt direkt an Personen. So bleibt nachvollziehbar, wer warum Zugriff hat.',
              cz: 'Přiděluji jen práva potřebná pro daný úkol, a to přes skupiny, ne přímo jednotlivcům. Tak je dohledatelné, kdo má přístup a proč.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich klären, seit wann das Problem besteht und ob auch Kollegen betroffen sind.' },
            {
              step: 'verify',
              de: 'Dann würde ich im Exchange Admin Center prüfen, ob er noch Mitglied der berechtigten Gruppe ist oder ob sich an den Berechtigungen etwas geändert hat.',
            },
            { step: 'safe', de: 'Fehlt ihm die Berechtigung, würde ich die Freigabe der Führungskraft einholen und den Zugriff wieder über die Gruppe vergeben.' },
            { step: 'communicate', de: 'Danach würde ich ihm Bescheid geben und die Freigabe im Ticket festhalten.' },
          ],
          cz: 'Nejdřív bych si ujasnil(a), od kdy problém trvá a jestli se týká i kolegů. Potom bych v Exchange admin centru zkontroloval(a), jestli je pořád členem oprávněné skupiny, nebo jestli se v oprávněních něco změnilo. Pokud mu oprávnění chybí, vyžádal(a) bych si schválení vedoucího a přístup bych znovu přidělil(a) přes skupinu. Potom bych mu dal(a) vědět a schválení zapsal(a) do ticketu.',
        },
        replace: [{ text: 'die Freigabe der Führungskraft', noteCz: 'Kdo u vás přístupy skutečně schvaluje (vedoucí, vlastník schránky).' }],
        phrases: [
          { de: 'seit wann das Problem besteht', cz: 'od kdy problém trvá' },
          { de: 'die Freigabe einholen', cz: 'vyžádat si schválení' },
          { de: 'den Zugriff über Gruppen vergeben', cz: 'přidělovat přístup přes skupiny' },
          { de: 'nachvollziehbar', cz: 'dohledatelný, srozumitelný' },
        ],
        checks: {
          direct: 'Začali jste upřesněním (od kdy, kdo), ne hned změnou oprávnění.',
          structure: 'Upřesnění → ověření členství a oprávnění → schválení a přidělení přes skupinu → informace a záznam.',
          vocabulary: 'Např. freigegebenes Postfach, Berechtigung, Freigabe, Gruppe.',
          followUp: 'Zmínili jste nejnižší nutná oprávnění nebo přidělování přes skupiny.',
        },
        dictionary: ['m365-v-004', 'access-v-007', 'access-s-001'],
      },
      {
        id: 'identity-i-001',
        topic: 'identity',
        kind: 'technical',
        seconds: 90,
        de: 'Wie würden Sie das Offboarding einer Mitarbeiterin in Microsoft 365 durchführen?',
        cz: 'Jak byste provedl(a) offboarding zaměstnankyně v Microsoft 365?',
        hintCz: [
          'Upřesněte: datum odchodu a kdo převezme data.',
          'Zjistěte, jaké přístupy, licence a zařízení má.',
          'Bezpečnost nejdřív: zablokovat přihlášení a zrušit relace.',
          'Komunikace: vedoucí a záznam podle checklistu.',
        ],
        startersDe: ['Zuerst würde ich mit der Führungskraft klären, …', 'Am letzten Arbeitstag würde ich …'],
        followUps: [
          {
            de: 'Was passiert mit dem Postfach und den Dateien der Mitarbeiterin?',
            cz: 'Co se stane se schránkou a soubory zaměstnankyně?',
            model: {
              de: 'Nach Rücksprache mit der Führungskraft würde ich das Postfach in ein freigegebenes Postfach umwandeln, damit keine Anfragen verloren gehen. Die Dateien aus OneDrive übergebe ich so, wie es die interne Regelung vorsieht.',
              cz: 'Po domluvě s vedoucím bych schránku převedl(a) na sdílenou, aby se neztratily žádné dotazy. Soubory z OneDrivu předám tak, jak určují interní pravidla.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich mit der Führungskraft klären, ab wann der Zugang gesperrt werden soll und wer die Daten übernimmt.' },
            { step: 'verify', de: 'Dann würde ich prüfen, in welchen Gruppen sie Mitglied ist und welche Lizenzen und Geräte ihr zugeordnet sind.' },
            {
              step: 'safe',
              de: 'Am letzten Arbeitstag würde ich zuerst die Anmeldung blockieren und alle aktiven Sitzungen widerrufen; erst danach entziehe ich Gruppenmitgliedschaften und Lizenzen.',
            },
            { step: 'communicate', de: 'Alle Schritte halte ich anhand einer Checkliste im Ticket fest, damit nichts vergessen wird.' },
          ],
          cz: 'Nejdřív bych si s vedoucím ujasnil(a), od kdy má být přístup zablokovaný a kdo převezme data. Potom bych zjistil(a), ve kterých skupinách je členkou a jaké licence a zařízení má přiřazené. Poslední pracovní den bych nejdřív zablokoval(a) přihlášení a zrušil(a) všechny aktivní relace; teprve potom odeberu členství ve skupinách a licence. Všechny kroky zapíšu podle checklistu do ticketu, aby se na nic nezapomnělo.',
        },
        replace: [{ text: 'anhand einer Checkliste', noteCz: 'Jak to u vás skutečně dokumentujete (checklist, šablona ticketu).' }],
        phrases: [
          { de: 'die Anmeldung blockieren', cz: 'zablokovat přihlášení' },
          { de: 'alle aktiven Sitzungen widerrufen', cz: 'zrušit všechny aktivní relace' },
          { de: 'Lizenzen entziehen', cz: 'odebrat licence' },
          { de: 'nach Rücksprache mit …', cz: 'po domluvě s …' },
        ],
        checks: {
          direct: 'Hned na začátku zaznělo, co ujasníte (kdy, kdo převezme data).',
          structure: 'Upřesnění → zjištění přístupů → blokace a relace jako první bezpečný krok → dokumentace.',
          vocabulary: 'Např. blockieren, widerrufen, entziehen, freigegebenes Postfach.',
          followUp: 'Data jste řešili po domluvě s vedoucím, ne na vlastní pěst.',
        },
        dictionary: ['identity-v-006', 'identity-s-003', 'access-v-001'],
      },
      {
        id: 'access-i-003',
        topic: 'access',
        kind: 'technical',
        seconds: 75,
        de: 'Ein Benutzer meldet, dass er laufend MFA-Anfragen bekommt, die er nicht selbst ausgelöst hat. Was tun Sie?',
        cz: 'Uživatel hlásí, že mu neustále chodí žádosti o MFA, které sám nevyvolal. Co uděláte?',
        hintCz: [
          'Okamžitě: žádnou žádost nepotvrzovat.',
          'Hypotéza: někdo zná heslo – ověřte to v protokolech přihlášení.',
          'Bezpečný krok: změna hesla a zrušení relací.',
          'Komunikace: eskalace na bezpečnostní tým s fakty.',
        ],
        startersDe: ['Zuerst würde ich den Benutzer bitten, …', 'Danach würde ich in den Anmeldeprotokollen …'],
        followUps: [
          {
            de: 'Was dokumentieren Sie, bevor Sie den Fall übergeben?',
            cz: 'Co zdokumentujete, než případ předáte?',
            model: {
              de: 'Ich halte fest, wann die Anfragen begonnen haben, welche IP-Adressen und Standorte in den Protokollen auftauchen und welche Schritte ich bereits gesetzt habe.',
              cz: 'Zaznamenám, kdy žádosti začaly, jaké IP adresy a lokality se objevují v protokolech a jaké kroky jsem už udělal(a).',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich den Benutzer bitten, keine Anfrage zu bestätigen, und fragen, seit wann die Anfragen kommen.' },
            { step: 'verify', de: 'Danach würde ich in den Anmeldeprotokollen prüfen, woher die Anmeldeversuche kommen.' },
            { step: 'safe', de: 'Da das Kennwort offenbar bekannt ist, würde ich es sofort zurücksetzen und alle aktiven Sitzungen widerrufen.' },
            { step: 'communicate', de: 'Den Vorfall würde ich mit den gesammelten Informationen an das Security-Team eskalieren.' },
          ],
          cz: 'Nejdřív bych uživatele požádal(a), aby žádnou žádost nepotvrzoval, a zeptal(a) se, od kdy žádosti chodí. Potom bych v protokolech přihlášení zjistil(a), odkud pokusy o přihlášení přicházejí. Protože heslo zřejmě někdo zná, hned bych ho resetoval(a) a zrušil(a) všechny aktivní relace. Incident bych se zjištěnými informacemi eskaloval(a) na bezpečnostní tým.',
        },
        replace: [{ text: 'an das Security-Team', noteCz: 'Komu u vás bezpečnostní incidenty patří (SOC, bezpečnostní tým, externí partner).' }],
        phrases: [
          { de: 'eine Anfrage bestätigen', cz: 'potvrdit žádost' },
          { de: 'das Kennwort zurücksetzen', cz: 'resetovat heslo' },
          { de: 'den Vorfall eskalieren', cz: 'eskalovat incident' },
          { de: 'Schritte setzen', cz: 'udělat kroky (v Rakousku běžné, podobně „Maßnahmen setzen“)' },
        ],
        checks: {
          direct: 'První věta říká, co uživatel nemá dělat a co zjistíte.',
          structure: 'Upřesnění → ověření v protokolech → reset hesla a relací → eskalace.',
          vocabulary: 'Např. auslösen, Anmeldeprotokolle, zurücksetzen, eskalieren.',
          followUp: 'Uvedli jste čas, zdroj pokusů (IP, lokalita) a provedené kroky.',
        },
        dictionary: ['incidents-v-002', 'access-s-002', 'identity-v-006'],
      },
    ],
  },
  {
    id: 'vpn-incident',
    level: 'B2',
    titleCz: 'Incident s VPN a DNS',
    titleDe: 'Störungsfall: VPN und DNS',
    contextDe: 'Gespräch mit dem Leiter des IT-Betriebs. Er möchte wissen, wie Sie bei Störungen vorgehen und kommunizieren.',
    contextCz: 'Pohovor s vedoucím IT provozu. Zajímá ho, jak při poruchách postupujete a komunikujete.',
    questions: [
      {
        id: 'network-i-001',
        topic: 'network',
        kind: 'technical',
        seconds: 90,
        de: 'Wie würden Sie vorgehen, wenn sich mehrere Mitarbeitende nach einer Änderung nicht mehr per VPN verbinden können?',
        cz: 'Jak byste postupoval(a), kdyby se po změně několik zaměstnanců nemohlo připojit přes VPN?',
        hintCz: [
          'Upřesněte rozsah: od kdy, kdo, odkud.',
          'Hypotéza: souvisí to se změnou? Chybová hlášení, záznam o změně.',
          'Bezpečný krok: rollback jen po domluvě s odpovědnými.',
          'Komunikace: fakta pro eskalaci a informace pro uživatele.',
        ],
        startersDe: ['Zuerst würde ich klären, seit wann …', 'Anschließend würde ich … prüfen.'],
        followUps: [
          {
            de: 'Welche Informationen würden Sie sammeln, bevor Sie den Vorfall eskalieren?',
            cz: 'Jaké informace byste shromáždil(a), než incident eskalujete?',
            model: {
              de: 'Ich würde festhalten, seit wann der Fehler auftritt, wie viele Personen und Standorte betroffen sind, wie die genaue Fehlermeldung lautet und welche Änderung zuletzt durchgeführt wurde. Dazu kommen die Prüfschritte, die ich schon gemacht habe, samt Ergebnis.',
              cz: 'Zaznamenal(a) bych, od kdy chyba nastává, kolika lidí a lokalit se týká, jak přesně zní chybové hlášení a jaká změna proběhla naposledy. K tomu kroky, které jsem už udělal(a), i s výsledky.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich klären, seit wann das Problem auftritt und wer betroffen ist.' },
            { step: 'verify', de: 'Anschließend würde ich die Fehlermeldungen und die letzten Änderungen prüfen.' },
            {
              step: 'safe',
              de: 'Hängt der Fehler mit der Änderung zusammen, würde ich sie nicht eigenmächtig zurücknehmen, sondern einen Rollback mit den Verantwortlichen abstimmen.',
            },
            {
              step: 'communicate',
              de: 'Wenn ich den Vorfall nicht selbst beheben kann, würde ich die bisherigen Prüfschritte und die Auswirkungen dokumentieren und den Fall an das zuständige Team weitergeben.',
            },
          ],
          cz: 'Nejdřív bych si ujasnil(a), od kdy problém nastává a koho se týká. Potom bych zkontroloval(a) chybová hlášení a poslední změny. Pokud chyba se změnou souvisí, nevracel(a) bych ji na vlastní pěst, ale rollback bych domluvil(a) s odpovědnými lidmi. Pokud incident nedokážu vyřešit sám (sama), zdokumentoval(a) bych dosavadní kroky a dopady a předal(a) případ příslušnému týmu.',
        },
        replace: [
          { text: 'einen Rollback mit den Verantwortlichen abstimmen', noteCz: 'Jak u vás funguje změnové řízení a kdo rollback schvaluje.' },
          { text: 'an das zuständige Team', noteCz: 'Kdo u vás VPN spravuje (síťový tým, externí dodavatel).' },
        ],
        phrases: [
          { de: 'Zuerst würde ich klären, seit wann …', cz: 'Nejdřív bych si ujasnil(a), od kdy …' },
          { de: 'Wer ist betroffen?', cz: 'Koho se to týká?' },
          { de: 'die bisherigen Prüfschritte dokumentieren', cz: 'zdokumentovat dosavadní kroky' },
          { de: 'den Fall an das zuständige Team weitergeben', cz: 'předat případ příslušnému týmu' },
        ],
        checks: {
          direct: 'První věta říká, co uděláte nejdřív.',
          structure: 'Upřesnění → ověření hypotézy (chyby, změny) → bezpečný krok (rollback po domluvě) → komunikace a eskalace.',
          vocabulary: 'Např. betroffen, die Änderung, eingrenzen, eskalieren, dokumentieren.',
          followUp: 'Vyjmenovali jste aspoň tři informace: od kdy, rozsah, chybové hlášení, poslední změna, dosavadní kroky.',
        },
        dictionary: ['incidents-v-007', 'incidents-v-002', 'network-v-006'],
      },
      {
        id: 'network-i-002',
        topic: 'network',
        kind: 'technical',
        seconds: 75,
        de: 'Ein interner Webdienst ist über den Namen nicht erreichbar, über die IP-Adresse aber schon. Woran denken Sie zuerst?',
        cz: 'Interní webová služba není dostupná přes název, přes IP adresu ale ano. Na co pomyslíte nejdřív?',
        hintCz: [
          'Vyslovte hypotézu: překlad jmen (DNS).',
          'Upřesněte: jedno zařízení, nebo všichni?',
          'Ověřte: nslookup, použitý DNS server, záznam.',
          'Bezpečný krok a komunikace: opravu jen s odpovědným týmem, informovat uživatele.',
        ],
        startersDe: ['Das klingt nach …', 'Zuerst würde ich klären, ob …'],
        followUps: [
          {
            de: 'Wie würden Sie Ihre Vermutung konkret überprüfen?',
            cz: 'Jak byste svou domněnku konkrétně ověřil(a)?',
            model: {
              de: 'Mit nslookup würde ich prüfen, welche IP-Adresse der DNS-Server für den Namen liefert, und sie mit der tatsächlichen Adresse des Servers vergleichen. Zusätzlich würde ich mit ipconfig /all kontrollieren, welcher DNS-Server am Client eingetragen ist.',
              cz: 'Pomocí nslookup bych zjistil(a), jakou IP adresu pro název vrací DNS server, a porovnal(a) ji se skutečnou adresou serveru. Navíc bych přes ipconfig /all zkontroloval(a), jaký DNS server má klient nastavený.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Das klingt nach einem Problem mit der Namensauflösung. Zuerst würde ich klären, ob nur ein Gerät betroffen ist oder alle.' },
            { step: 'verify', de: 'Dann würde ich prüfen, welchen DNS-Server der Client verwendet und zu welcher Adresse der Name aufgelöst wird.' },
            {
              step: 'safe',
              de: 'Ist der DNS-Eintrag falsch, würde ich ihn nicht sofort selbst ändern, sondern die Korrektur mit dem zuständigen Team abstimmen.',
            },
            { step: 'communicate', de: 'Die betroffenen Benutzer würde ich kurz informieren, woran wir arbeiten und wann die nächste Rückmeldung kommt.' },
          ],
          cz: 'Zní to jako problém s překladem jmen. Nejdřív bych zjistil(a), jestli se to týká jen jednoho zařízení, nebo všech. Potom bych zkontroloval(a), jaký DNS server klient používá a na jakou adresu se název překládá. Pokud je záznam v DNS špatně, neměnil(a) bych ho hned sám (sama), ale opravu bych domluvil(a) s příslušným týmem. Zasažené uživatele bych krátce informoval(a), na čem pracujeme a kdy dostanou další zprávu.',
        },
        replace: [{ text: 'mit dem zuständigen Team', noteCz: 'Kdo u vás DNS spravuje a schvaluje změny záznamů.' }],
        phrases: [
          { de: 'Das klingt nach …', cz: 'Zní to jako …' },
          { de: 'die Namensauflösung', cz: 'překlad jmen' },
          { de: 'Der Name wird zu … aufgelöst.', cz: 'Název se překládá na …' },
          { de: 'eine Vermutung überprüfen', cz: 'ověřit domněnku' },
        ],
        checks: {
          direct: 'Hned jste vyslovili hypotézu (DNS, překlad jmen).',
          structure: 'Hypotéza a rozsah → ověření nástrojem → bezpečná oprava → informace uživatelům.',
          vocabulary: 'Např. Namensauflösung, auflösen, DNS-Eintrag, überprüfen.',
          followUp: 'Jmenovali jste konkrétní nástroj a s čím výsledek porovnáte.',
        },
        dictionary: ['network-v-004', 'network-s-002', 'network-s-001'],
      },
      {
        id: 'incidents-i-001',
        topic: 'incidents',
        kind: 'technical',
        seconds: 75,
        de: 'Wie informieren Sie die betroffenen Benutzer während einer größeren Störung?',
        cz: 'Jak informujete zasažené uživatele během větší poruchy?',
        hintCz: [
          'Upřesněte, kdo je zasažen a jaký kanál ještě funguje.',
          'Ověřte, co víte jistě a co je domněnka.',
          'Bezpečně: neslibujte termín, který nevíte.',
          'Pravidelné aktualizace a zpráva o konci poruchy.',
        ],
        startersDe: ['Zuerst würde ich klären, welche Benutzer …', 'In der Nachricht schreibe ich …'],
        followUps: [
          {
            de: 'Was schreiben Sie, wenn Sie noch keine Lösung haben?',
            cz: 'Co napíšete, když ještě nemáte řešení?',
            model: {
              de: 'Ich schreibe ehrlich, dass die Ursache noch nicht feststeht, nenne eine Umgehungslösung, falls es eine gibt, und kündige die nächste Information für eine konkrete Uhrzeit an.',
              cz: 'Napíšu upřímně, že příčina zatím není známá, uvedu náhradní řešení, pokud nějaké existuje, a oznámím další informaci na konkrétní čas.',
            },
          },
        ],
        model: {
          parts: [
            {
              step: 'clarify',
              de: 'Zuerst würde ich klären, welche Benutzer betroffen sind und über welchen Kanal ich sie noch erreiche, zum Beispiel über Teams oder per SMS.',
            },
            { step: 'verify', de: 'Dann würde ich mit dem Team abstimmen, was wir sicher wissen und was noch eine Vermutung ist.' },
            {
              step: 'safe',
              de: 'In der Nachricht schreibe ich kurz und sachlich, was nicht funktioniert und woran wir arbeiten – ohne einen Zeitpunkt zu versprechen, den wir nicht halten können.',
            },
            { step: 'communicate', de: 'Außerdem kündige ich an, wann die nächste Information kommt, und melde mich auch, wenn die Störung behoben ist.' },
          ],
          cz: 'Nejdřív bych zjistil(a), kterých uživatelů se to týká a jakým kanálem je ještě zastihnu, třeba přes Teams nebo SMS. Potom bych si s týmem ujasnil(a), co víme jistě a co je zatím jen domněnka. Do zprávy napíšu krátce a věcně, co nefunguje a na čem pracujeme – bez slibu termínu, který nemusíme dodržet. Navíc oznámím, kdy přijde další informace, a ozvu se i ve chvíli, kdy je porucha odstraněná.',
        },
        replace: [{ text: 'über Teams oder per SMS', noteCz: 'Kanály, které u vás opravdu existují (stavová stránka, e-mail, Teams).' }],
        phrases: [
          { de: 'Wir arbeiten bereits an einer Lösung.', cz: 'Na řešení už pracujeme.' },
          { de: 'Die nächste Information folgt um … Uhr.', cz: 'Další informace přijde v … hodin.' },
          { de: 'die Umgehungslösung', cz: 'náhradní řešení (workaround)' },
          { de: 'Vielen Dank für Ihre Geduld.', cz: 'Děkujeme za trpělivost.' },
        ],
        checks: {
          direct: 'Hned jste řekli, jak a kterým kanálem uživatele informujete.',
          structure: 'Rozsah a kanál → ověřená fakta → věcná zpráva bez slibů → další termín a zpráva o konci.',
          vocabulary: 'Např. betroffen, die Störung, die Umgehungslösung, die nächste Information.',
          followUp: 'Byli jste upřímní, nabídli náhradní řešení a konkrétní čas další zprávy.',
        },
        dictionary: ['incidents-s-002', 'incidents-v-003', 'incidents-s-001'],
      },
      {
        id: 'handover-i-001',
        topic: 'handover',
        kind: 'technical',
        seconds: 60,
        de: 'Ihr Dienst endet, die Störung ist aber noch nicht behoben. Wie übergeben Sie den Fall?',
        cz: 'Vaše směna končí, ale porucha ještě není odstraněná. Jak případ předáte?',
        hintCz: [
          'Upřesněte, kdo případ převezme.',
          'Ověřte, že ticket obsahuje aktuální stav.',
          'Bezpečně: předání osobně nebo telefonem, ne jen e-mailem.',
          'Komunikace: kdo je informovaný a co je další krok.',
        ],
        startersDe: ['Zuerst würde ich klären, wer …', 'Vorher bringe ich das Ticket …'],
        followUps: [
          {
            de: 'Was gehört für Sie unbedingt in eine Übergabe?',
            cz: 'Co podle vás do předání nezbytně patří?',
            model: {
              de: 'Unbedingt dazu gehören die Auswirkungen, die bisherigen Prüfschritte mit Ergebnis, der nächste geplante Schritt und wer schon informiert wurde.',
              cz: 'Nezbytně do něj patří dopady, dosavadní kroky s výsledkem, další plánovaný krok a kdo už byl informován.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich klären, wer den Fall übernimmt, und mit dieser Person einen kurzen Termin vereinbaren.' },
            { step: 'verify', de: 'Vorher bringe ich das Ticket auf den aktuellen Stand: Auswirkungen, bisherige Prüfschritte und Ergebnisse.' },
            { step: 'safe', de: 'Die Übergabe mache ich persönlich oder telefonisch, damit Rückfragen sofort geklärt werden.' },
            { step: 'communicate', de: 'Zum Schluss informiere ich die Betroffenen, wer ab jetzt zuständig ist.' },
          ],
          cz: 'Nejdřív bych si ujasnil(a), kdo případ převezme, a domluvil(a) si s ním krátkou schůzku. Předtím aktualizuji ticket: dopady, dosavadní kroky a výsledky. Předání udělám osobně nebo po telefonu, aby se dotazy vyjasnily hned. Nakonec dám zasaženým vědět, kdo je teď za případ odpovědný.',
        },
        replace: [{ text: 'persönlich oder telefonisch', noteCz: 'Jak u vás předávání směn skutečně probíhá.' }],
        phrases: [
          { de: 'den aktuellen Stand übergeben', cz: 'předat aktuální stav' },
          { de: 'das Ticket auf den aktuellen Stand bringen', cz: 'aktualizovat ticket' },
          { de: 'Rückfragen klären', cz: 'vyjasnit dotazy' },
          { de: 'ab jetzt zuständig sein', cz: 'být od teď odpovědný' },
        ],
        checks: {
          direct: 'Hned jste řekli, komu a jak případ předáte.',
          structure: 'Kdo převezme → aktuální ticket → předání naživo → informace zasaženým.',
          vocabulary: 'Např. übergeben, der aktuelle Stand, zuständig, Prüfschritte.',
          followUp: 'Jmenovali jste dopady, kroky s výsledkem, další krok a informované osoby.',
        },
        dictionary: ['handover-v-003', 'handover-s-002', 'handover-v-001'],
      },
    ],
  },
  {
    id: 'powershell-routine',
    level: 'C1',
    titleCz: 'Automatizace v PowerShellu',
    titleDe: 'Automatisierung mit PowerShell',
    contextDe: 'Technisches Gespräch mit einem Senior-Administrator. Er möchte sehen, wie Sie Routineaufgaben automatisieren und absichern.',
    contextCz: 'Technický pohovor se seniorním administrátorem. Chce vidět, jak automatizujete rutinní úkoly a jak je jistíte.',
    questions: [
      {
        id: 'powershell-i-001',
        topic: 'powershell',
        kind: 'experience',
        seconds: 90,
        de: 'Erzählen Sie von einer Routineaufgabe, die Sie mit PowerShell automatisiert haben – oder automatisieren würden.',
        cz: 'Povězte o rutinním úkolu, který jste zautomatizoval(a) v PowerShellu – nebo byste zautomatizoval(a).',
        hintCz: [
          'Pokud jste nic podobného nedělal(a), mluvte v Konjunktivu II („Ich würde …“) nebo o labu.',
          'STAR: situace → úkol → postup → výsledek.',
          'Výsledek: ušetřený čas nebo méně chyb – jen ověřitelná čísla.',
        ],
        startersDe: ['In meinem Team wurden … manuell …', 'Ich habe ein Skript geschrieben, das …', 'Seitdem …'],
        followUps: [
          {
            de: 'Wie haben Sie das Skript getestet, bevor es produktiv lief?',
            cz: 'Jak jste skript otestoval(a), než se nasadil do produkce?',
            model: {
              de: 'Ich habe es zuerst in einer Testumgebung mit Testkonten ausgeführt und mit -WhatIf geprüft, was die Befehle ändern würden. Erst danach lief es mit echten Daten, und zwar zuerst für ein einzelnes Konto.',
              cz: 'Nejdřív jsem ho spustil(a) v testovacím prostředí s testovacími účty a přes -WhatIf ověřil(a), co by příkazy změnily. Teprve potom běžel s ostrými daty, a to nejdřív pro jediný účet.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'situation', de: 'In meinem Team wurden neue Benutzerkonten manuell angelegt, was pro Person etwa 20 Minuten gedauert hat.' },
            { step: 'task', de: 'Meine Aufgabe war, den Ablauf schneller und weniger fehleranfällig zu machen.' },
            { step: 'action', de: 'Ich habe ein Skript geschrieben, das die Daten aus einer CSV-Datei einliest, die Konten anlegt und die Gruppen zuweist.' },
            { step: 'result', de: 'Seitdem dauert das Anlegen nur noch wenige Minuten, und Tippfehler sind selten geworden.' },
          ],
          cz: 'V mém týmu se nové uživatelské účty zakládaly ručně, což u každého člověka trvalo asi 20 minut. Mým úkolem bylo postup zrychlit a omezit chyby. Napsal(a) jsem skript, který načte data ze souboru CSV, založí účty a přiřadí skupiny. Od té doby zakládání trvá jen pár minut a překlepy jsou vzácné.',
        },
        replace: [
          { text: 'etwa 20 Minuten', noteCz: 'Skutečně změřená doba – nebo údaj vynechte.' },
          {
            text: 'Ich habe ein Skript geschrieben',
            noteCz: 'Jen pokud je to pravda. Jinak „In meiner Testumgebung habe ich …“ nebo „Ich würde ein Skript schreiben, das …“.',
          },
          { text: 'nur noch wenige Minuten', noteCz: 'Ověřitelný výsledek z praxe nebo z labu.' },
          { text: 'in einer Testumgebung mit Testkonten', noteCz: 'Kde jste skutečně testoval(a) (lab, testovací tenant).' },
        ],
        phrases: [
          { de: 'Meine Aufgabe war, den Ablauf … zu machen.', cz: 'Mým úkolem bylo postup …' },
          { de: 'Daten aus einer CSV-Datei einlesen', cz: 'načíst data ze souboru CSV' },
          { de: 'fehleranfällig', cz: 'náchylný k chybám' },
          { de: 'Seitdem dauert … nur noch …', cz: 'Od té doby trvá … už jen …' },
        ],
        checks: {
          direct: 'Hned jste řekli, o jaký úkol šlo.',
          structure: 'STAR, nejvíc o postupu; u neprovedeného případu Konjunktiv II.',
          vocabulary: 'Např. automatisieren, einlesen, anlegen, zuweisen, fehleranfällig.',
          followUp: 'Zmínili jste testovací prostředí, -WhatIf nebo postupné nasazení.',
        },
        dictionary: ['powershell-v-002', 'powershell-g-001', 'powershell-v-001'],
      },
      {
        id: 'powershell-i-002',
        topic: 'powershell',
        kind: 'technical',
        seconds: 75,
        de: 'Wie stellen Sie sicher, dass ein Skript keinen Schaden anrichtet, wenn es viele Konten auf einmal ändert?',
        cz: 'Jak zajistíte, aby skript nenapáchal škody, když najednou mění mnoho účtů?',
        hintCz: [
          'Upřesněte, které účty skript smí měnit.',
          'Ověřte nanečisto: -WhatIf a testovací účty.',
          'Bezpečně: záloha stavu, malá dávka, účet s minimem práv.',
          'Komunikace: ohlásit změnu a zapsat ji.',
        ],
        startersDe: ['Zuerst würde ich genau festlegen, …', 'Vor dem echten Lauf …'],
        followUps: [
          {
            de: 'Und wie prüfen Sie nach dem Lauf, ob alles geklappt hat?',
            cz: 'A jak po běhu zkontrolujete, jestli všechno vyšlo?',
            model: {
              de: 'Das Skript schreibt für jedes Konto einen Eintrag in ein Protokoll, auch bei Fehlern. Danach prüfe ich die Fehler und vergleiche Stichproben im Admin Center mit dem Protokoll.',
              cz: 'Skript zapíše za každý účet záznam do protokolu, i při chybě. Potom projdu chyby a namátkou porovnám několik účtů v admin centru s protokolem.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst würde ich genau festlegen, welche Konten das Skript ändern darf, zum Beispiel über einen Filter auf eine bestimmte Gruppe.' },
            { step: 'verify', de: 'Dann würde ich es mit -WhatIf und mit einigen Testkonten ausführen und das Ergebnis kontrollieren.' },
            {
              step: 'safe',
              de: 'Vor dem echten Lauf exportiere ich den aktuellen Stand, damit ich Änderungen zurücknehmen kann, und starte zuerst mit einer kleinen Gruppe. Das Skript läuft mit einem Konto, das nur die nötigen Rechte hat.',
            },
            { step: 'communicate', de: 'Die Änderung kündige ich dem Team vorher an und halte den Lauf im Ticket fest.' },
          ],
          cz: 'Nejdřív bych přesně určil(a), které účty smí skript měnit, například filtrem na konkrétní skupinu. Potom bych ho spustil(a) s -WhatIf a na několika testovacích účtech a zkontroloval(a) výsledek. Před ostrým během vyexportuji aktuální stav, abych mohl(a) změny vrátit, a začnu s malou skupinou. Skript běží pod účtem, který má jen nezbytná práva. Změnu týmu předem ohlásím a běh zapíšu do ticketu.',
        },
        replace: [{ text: 'mit einem Konto, das nur die nötigen Rechte hat', noteCz: 'Jak to u vás skutečně řešíte (servisní účet, spravovaná identita).' }],
        phrases: [
          { de: 'keinen Schaden anrichten', cz: 'nenapáchat škody' },
          { de: 'Änderungen zurücknehmen', cz: 'vrátit změny' },
          { de: 'mit einer kleinen Gruppe starten', cz: 'začít s malou skupinou' },
          { de: 'Stichproben prüfen', cz: 'kontrolovat namátkou' },
        ],
        checks: {
          direct: 'Hned jste řekli hlavní pojistku (test, -WhatIf, omezený rozsah).',
          structure: 'Rozsah → test nanečisto → záloha a malá dávka → ohlášení a záznam.',
          vocabulary: 'Např. -WhatIf, exportieren, zurücknehmen, die nötigen Rechte.',
          followUp: 'Zmínili jste protokol, kontrolu chyb a namátkovou kontrolu.',
        },
        dictionary: ['powershell-v-003', 'powershell-s-001', 'access-v-007'],
      },
      {
        id: 'powershell-i-003',
        topic: 'powershell',
        kind: 'technical',
        seconds: 75,
        de: 'Wie dokumentieren Sie ein Skript, damit Kolleginnen und Kollegen es ohne Sie verwenden können?',
        cz: 'Jak dokumentujete skript, aby ho kolegyně a kolegové mohli používat i bez vás?',
        hintCz: [
          'Upřesněte, kdo bude skript používat a co potřebuje vědět.',
          'Nápověda přímo ve skriptu (.SYNOPSIS, .PARAMETER, .EXAMPLE) – a ověřte, že stačí.',
          'Bezpečně: žádná hesla ve skriptu, verze v Gitu.',
          'Komunikace: krátký návod a představení týmu.',
        ],
        startersDe: ['Zuerst überlege ich, wer …', 'Im Skript steht …'],
        followUps: [
          {
            de: 'Wie gehen Sie mit Zugangsdaten um, die das Skript braucht?',
            cz: 'Jak naložíte s přístupovými údaji, které skript potřebuje?',
            model: {
              de: 'Zugangsdaten gehören nie ins Skript. Ich würde sie in einem Tresor wie Azure Key Vault hinterlegen oder, wo es möglich ist, eine verwaltete Identität verwenden.',
              cz: 'Přístupové údaje do skriptu nikdy nepatří. Uložil(a) bych je do trezoru, jako je Azure Key Vault, nebo bych tam, kde to jde, použil(a) spravovanou identitu.',
            },
          },
        ],
        model: {
          parts: [
            { step: 'clarify', de: 'Zuerst überlege ich, wer das Skript verwenden wird und was diese Person wissen muss.' },
            {
              step: 'verify',
              de: 'Im Skript steht eine kommentarbasierte Hilfe mit .SYNOPSIS, .PARAMETER und .EXAMPLE. Ob sie reicht, teste ich, indem eine Kollegin das Skript nur mithilfe von Get-Help verwendet.',
            },
            { step: 'safe', de: 'Kennwörter schreibe ich nie ins Skript, und das Skript selbst liegt versioniert in einem Git-Repository.' },
            { step: 'communicate', de: 'Zusätzlich lege ich im Wiki eine kurze Anleitung mit einem Beispielaufruf an und stelle das Skript im Team kurz vor.' },
          ],
          cz: 'Nejdřív si ujasním, kdo bude skript používat a co ten člověk potřebuje vědět. Ve skriptu je nápověda v komentářích s .SYNOPSIS, .PARAMETER a .EXAMPLE. Jestli stačí, otestuji tak, že kolegyně skript použije jen s pomocí Get-Help. Hesla do skriptu nikdy nepíšu a samotný skript je verzovaný v repozitáři Git. Navíc ve wiki založím krátký návod s ukázkovým voláním a skript týmu krátce představím.',
        },
        replace: [
          { text: 'in einem Git-Repository', noteCz: 'Kde u vás skripty skutečně leží (Git, sdílené úložiště).' },
          { text: 'im Wiki', noteCz: 'Váš skutečný nástroj pro dokumentaci (Confluence, SharePoint, wiki).' },
        ],
        phrases: [
          { de: 'die kommentarbasierte Hilfe', cz: 'nápověda v komentářích skriptu' },
          { de: 'etwas versioniert ablegen', cz: 'ukládat něco s verzemi' },
          { de: 'Zugangsdaten hinterlegen', cz: 'uložit přístupové údaje' },
          { de: 'einen Beispielaufruf zeigen', cz: 'ukázat příklad volání' },
        ],
        checks: {
          direct: 'Hned jste řekli, kde dokumentace bude (ve skriptu a v návodu).',
          structure: 'Pro koho → nápověda a test podle ní → bezpečnost (hesla, verze) → návod a představení.',
          vocabulary: 'Např. kommentarbasierte Hilfe, versioniert, Zugangsdaten, hinterlegen.',
          followUp: 'Vyloučili jste hesla ve skriptu a jmenovali bezpečné úložiště.',
        },
        dictionary: ['handover-s-001', 'handover-v-002', 'powershell-v-001'],
      },
    ],
  },
]
