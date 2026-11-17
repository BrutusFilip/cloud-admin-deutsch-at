# Cloud Admin Deutsch (AT) – návod česky

Statická webová aplikace pro trénink němčiny na IT pohovory v Rakousku: Cloud Administrator, Azure Administrator, Microsoft 365 Administrator a IT System Administrator. Je součástí projektu Cloud Admin Journey in Austria.

Verze 1.0 · anglický přehled pro GitHub: [README.md](../README.md) · stav a další kroky: [PROJECT_STATE.md](../PROJECT_STATE.md) · stav požadavků a závad: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) · plán: [PLAN.md](PLAN.md)

## Co umí

- **Dnes:** počet karet k opakování a nových, výběr tématu, krátká lekce s nejvýše 10 kartami, dokončení rozpracované lekce a pravidla „Co se ukládá a kdy“.
- **Lekce:**
  - kartičky DE → CZ s odkrytím a sebehodnocením;
  - poslech DE → CZ: německý výraz přehraje hlas prohlížeče a text se ukáže až s řešením; bez německého hlasu uvidíte text a důvod;
  - psaní CZ → DE s kontrolou, vysvětlením chyby a větou v kontextu;
  - u vět volný překlad: shodu se vzorem uzná aplikace, jinou formulaci porovnáte se vzorem a ohodnotíte se sami;
  - gramatické úlohy: doplnění, výběr, řazení slov (myší, dotykem i klávesnicí) a přepis věty, vždy s vysvětlením, proč řešení funguje;
  - souhrn: přesnost prvního pokusu (odpovědi zkontrolované aplikací) zvlášť od vašeho hodnocení kartiček, u každé chyby důvod, opakování chyb.
- **Výzva „Incident za 5 kroků“ (volitelná):** smyšlený případ od upřesnění problému po předání, zpětná vazba po každém kroku, přesnost prvního pokusu a opakování chyb; stopky jen na přání.
- **Procvičování:** kartičky, poslech, psaní nebo gramatika podle tématu, orientační obtížnosti a gramatického jevu a rychlé opakování chyb.
- **Pohovor:** 4 krátké simulace pohovoru se 14 hlavními otázkami. Odpovídáte nahlas, pak přijde doplňující otázka, teprve potom ilustrační vzor, užitečné formulace, odkazy do slovníku a sebehodnocení podle checklistu (viz níže).
- **Slovník:** hledání německy i česky bez ohledu na diakritiku, filtry téma, obtížnost a druh, aktivní filtry jako štítky s počtem výsledků a možností je zrušit, detail hesla s procvičením a odkazy „Použito ve výzvě“ a „Použito v pohovoru“.
- **Nastavení** v tomto pořadí: jazyk ovládání (česky, nebo německy pro portfolio demo; přepínač CZ/DE je i v záhlaví), hlas a předčítání, pokrok a záloha (stav ukládání slovy, export, import, trvalé uložení, původní data z doby před aktualizací, smazání pokroku) a statistiky.
- **Rozhraní:** jeden světlý vzhled z malé sady designových hodnot (`src/styles/tokens.css`), jedna akcentní barva, Literata pro němčinu a Atkinson Hyperlegible Next pro ovládání. Ověřené na šířce 360, 768 a 1440 px a při zvětšení 200 %. Na telefonu zůstane pole pro odpověď i tlačítko nad klávesnicí a hodnocení nebo další krok dole na dosah palce. Ovládání klávesnicí, potvrzení v dialogu, který drží a vrací fokus, oznámení pro čtečky obrazovky, zpětná vazba nezávislá na barvě, `lang` u německých úseků (i u němčiny citované v českých poznámkách) a omezený pohyb podle `prefers-reduced-motion`. Dlouhá německá slova prohlížeč nikdy nedělí: velký text se zmenší podle nejdelšího slova.
- **Obsah:** 150 originálních položek ve 13 tématech, z toho 34 gramatických úloh; fráze pro upřesnění otázky, přiznání hranice zkušenosti a vysvětlení postupu; rakouská pracovní slovní zásoba, 3 případy výzvy a 4 pohovory. Vzorové zkušenosti a vzorové odpovědi jsou označené jako ilustrační. Úroveň B1–C1 je orientační.

Aplikace nemá registraci, backend, placená API ani telemetrii. Pokrok zůstává jen v prohlížeči.

## Spuštění

Potřebujete Node.js 26 LTS (verze v `.nvmrc`, používá ji i CI); funguje i 22.12+ a 24, starší verzi `npm` odmítne. Krok za krokem pro Windows a PowerShell, včetně řešení potíží a přenosu pokroku: [QUICKSTART_CS.md](QUICKSTART_CS.md).

```bash
npm ci
npm run dev        # http://localhost:5173/
```

| Příkaz | Co dělá |
|---|---|
| `npm run dev` | vývojový server |
| `npm run build` | typová kontrola a produkční build do `dist/` |
| `npm run preview` | náhled produkčního buildu |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript |
| `npm test` | unit testy (Vitest) |
| `npm run check:content` | kontrola studijních dat, odpovědí, výzev a soukromí |
| `npm run stats:content` | skutečné počty položek podle druhu, úrovně, jevu a tématu |
| `npm run test:answers` | jen kontrola německých odpovědí a gramatických úloh |
| `npm run test:scheduler` | jen plánovač, skladba lekcí, počty na Dnes a místní kalendářní dny (půlnoc, změna času) |
| `npm run test:reload` | jen obnova po reloadu v každém kroku karty, ukládání, revize zápisu a jedna zapisující karta |
| `npm run test:stats` | jen statistiky, výsledek výzvy a nápověda v pohovoru |
| `npm run test:import` | jen export, odmítnutí neplatného importu a export → import |
| `npm run check` | lint, typy, testy a build najednou |
| `npm run test:e2e` | build a testy produkčního buildu v prohlížeči pod podcestou GitHub Pages (Playwright, Chromium na počítači a telefonu); poprvé `npx playwright install chromium` |

**Ověřené prohlížeče** (2026-11-16, Linux): Chromium 153 a Google Chrome for Testing 153, na počítači i v emulaci telefonu. Firefox, Safari (WebKit), Edge a skutečné telefony zatím ověřené nejsou.

Aplikace musí běžet z webového serveru: `npm run dev`, `npm run preview` nebo GitHub Pages. Soubor `dist/index.html` otevřený přímo z disku prohlížeč zablokuje a stránka asi po 3 s napíše, jak aplikaci spustit.

## Jak se plánuje opakování

Položka má jednu nebo dvě **karty**: kartičku DE → CZ a psaní CZ → DE. Věta má jen psaní, gramatická úloha jen svou kartu. Psaní slova se v tréninku odemkne po první kartičce. Pokrok se ukládá zvlášť pro každou kartu.

| Hodnocení | Stupeň | Další opakování |
|---|---|---|
| Umím | +1 (nejvýše 5) | za 3 / 7 / 14 / 30 / 60 dní podle nového stupně |
| Těžké | −1 (nejméně 0) | zítra |
| Znovu | 0 | ještě v lekci (o 3 karty později, nejvýše 3 pokusy), potom zítra |

- **Skladba lekce:** nejdřív karty na řadě (nejdéle čekající první), volná místa doplní nové karty v pořadí studijní cesty. Lekce má nejvýše 10 karet a z jedné položky obsahuje jen jednu kartu.
- **Prodloužení intervalu:** interval prodlouží jen první hodnocení karty v lekci, a to jen když je karta nová nebo na řadě. Opakování v lekci, opakování chyb a volné procvičení plán nikdy neprodlouží, mohou ho jen zpřísnit.
- **Chybná psaná odpověď** znamená „Znovu“, pokud ji výslovně neuznáte tlačítkem „Moje odpověď je také správná“ (u gramatiky jen u přepisu věty; doplnění, výběr a řazení mají pevná řešení). „Nevím“ znamená vždy „Znovu“.
- **Výzva** kartu v lekci nevrací: každý krok má jeden pokus a chyby nabídne souhrn k zopakování.
- **Termíny** jsou kalendářní dny v místním čase. „Zítra“ proto znamená příští den i přes půlnoc a změnu času.
- **Pauza** nic nenuluje: karty počkají a stupeň se nesníží.
- **Nedokončená lekce:** každé hodnocení se uloží hned. Ve stejný den můžete lekci dokončit i po obnovení stránky. Od dalšího dne se uzavře souhrnem a neohodnocené karty zůstanou na řadě nebo nové.
- **Co se ukládá a kdy** (stejná pravidla jsou na stránce Dnes):
  - Odpověď se uloží při kontrole („Zkontrolovat“, „Nevím“, „Odkrýt řešení“). Po reloadu nebo návratu do lekce uvidíte stejný výsledek a karta čeká na hodnocení; odpovědět znovu nejde.
  - Rozepsanou a ještě nezkontrolovanou odpověď reload nezachová; nic se tím nezapočítá.
  - Hodnocení se uloží hned a jen jednou: dvojklik ani opakovaný Enter odpověď nezapočítá dvakrát.
  - Chybná odpověď a odhalené řešení se počítají jako „Znovu“, i když lekci ukončíte dřív nebo začnete novou.
  - Dokončená lekce se do statistik započítá jednou; reload ani návrat ji nezapočítají znovu.

## Pohovor

1. Na přehledu `#/pohovor` vyberete scénář: představení a motivace, praxe v Entra ID a Microsoft 365, incident s VPN a DNS, nebo automatizace v PowerShellu.
2. Otázka je německy. Čeština, nápověda (stavba odpovědi, na co myslet, jak začít) a předčítání jsou jen na vyžádání.
3. Odpovídáte nahlas. Časovač 60, 75 nebo 90 sekund lze spustit, pozastavit a vynulovat; pokračovat můžete kdykoli, i když čas vyprší.
4. Po odpovědi přijde doplňující otázka, která navazuje na vaši odpověď.
5. Teprve potom uvidíte vzorovou odpověď označenou „Ilustrační“. Zvýrazněná místa jsou fakta, která máte nahradit vlastními; seznam pod vzorem říká čím. Následují vzor k doplňující otázce, 2–3 hesla ze slovníku a užitečné formulace.
6. Sebehodnocení má čtyři kritéria s konkrétním popisem u každé otázky: přímá odpověď, struktura, slovní zásoba, doplňující otázka (Ano / Částečně / Ne). „Zkusit znovu“ spustí otázku od začátku; vyplněné sebehodnocení se uloží jako pokus.
7. Souhrn ukáže výsledek každé otázky, počty napříč kritérii a na co se zaměřit. Jednotlivou otázku lze ze souhrnu zopakovat.

Otázky na zkušenost trénují STAR (situace, úkol, postup, výsledek). Technické otázky trénují upřesnění problému, ověření hypotézy, bezpečný další krok a komunikaci. Ke každé otázce si můžete napsat **vlastní příklad** s úrovní doložení (životopis, praxe, lab nebo kurz, odhad, neověřeno). Příklad zůstává jen v prohlížeči a příště se ukáže v nápovědě.

Aplikace nic nenahrává, mikrofon nepotřebuje a odpověď automaticky nehodnotí (ani výslovnost, ani obsah).

**Předčítání otázek** (Web Speech API) se spustí jen tlačítkem „Přečíst otázku nahlas“. Aplikace použije zvolený německý hlas, jinak de-AT, jinak de-DE; jiný než německý hlas nikdy. Při přechodu na další krok, jinou stránku nebo zavření stránky se předčítání zastaví. Bez podpory nebo bez německého hlasu zůstane otázka jako text a stav to vysvětlí. Jak hlas zní, zda je k dispozici rakouská varianta a zda funguje bez internetu, záleží na prohlížeči a vybraném hlasu; některé hlasy prohlížeč zpracovává online.

## Kontrola psaných odpovědí

- **Vždy:** Unicode NFC, ořez a sloučení mezer, sjednocení uvozovek.
- **Podle cvičení:** u slov i vět se nehodnotí velikost prvního písmene. U doplnění se velikost písmen hodnotí (kromě mezery na začátku věty); řazení slov se porovná přesně.
- **Jednoznačná úloha** (slovo, výraz, sloveso, doplnění, výběr, řazení, přepis): aplikace uzná jen předem definované odpovědi a varianty, cokoli jiného je chyba s vysvětlením.
- **Volný překlad věty:** shoda se vzorem nebo s uvedenou formulací je „Správně“. Rozdíl jen v přehlásce, ß nebo velkém písmenu je „Chyba“. Jiný rozdíl aplikace nehodnotí: ukáže nejbližší vzor, rozdílná slova označí neutrálně, pojmenuje je jako otázku k zamyšlení a vy se ohodnotíte sami (Znovu, Těžké, Umím).
- **Interpunkce je kosmetická:** odpověď, která se liší jen čárkou nebo uvozovkami, je správně a poznámka řekne přesně kde, například „Před „dass“ chybí čárka.“
- **Nikdy** se neslučuje ä/a, ö/o, ü/u ani ß/ss. Jiný zápis platí jen tehdy, když ho položka výslovně povoluje jako variantu.
- **Vysvětlení** chyby se zobrazí jen tehdy, když pokryje celý rozdíl: velké písmeno, přehláska nebo ß, člen, chybějící nebo přebývající slovo, slovosled (s tím, které slovo stojí jinde), plurál místo singuláru. V ostatních případech uvidíte porovnání po slovech. U výběru se po odpovědi ukáže, proč je zvolená možnost chybná, a ve sbaleném seznamu i důvody u ostatních.
- **Znaky ä ö ü ß Ä Ö Ü** z lišty se vloží na místo kurzoru (i doprostřed slova nebo místo označeného textu) myší, klávesnicí i dotykem a kurzor zůstane v poli.

## Pokrok a soukromí

- **Kde je pokrok.** Ukládá se do `localStorage` pod klíči s předponou `cloud-admin-deutsch-at:`.
  - Pokrok je pod `…:progress` (`schemaVersion: 5`).
  - Data ze starších verzí (1–4) se převedou v paměti, a to až po kontrole. Nová verze se zapíše s první změnou. Těsně předtím se původní text uloží pod `…:backup` a Nastavení ho nabídne ke stažení, obnově nebo smazání.
  - Pokrok karet se převodem nemění.
- **Pohovor** ukládá:
  - sebehodnocení (posledních 10 pokusů na otázku, u pokusu i to, zda jste otevřeli nápovědu);
  - rozpracovaný pohovor;
  - vlastní příklady;
  - nastavení předčítání.

  Do vlastních příkladů nepište jména firem, klientů ani kolegů a žádné interní údaje: jiné stránky na stejné doméně GitHub Pages mohou `localStorage` číst.
- **Statistiky** (Nastavení → Statistiky) počítají každou lekci jednou, když skončí. Zvlášť uvádějí:
  - dokončené lekce a lekce ukončené dřív;
  - přesnost prvního pokusu u psaní a gramatiky, kde odpověď zkontrolovala aplikace;
  - vaše hodnocení kartiček;
  - sebehodnocení v pohovoru.

  Počítají se od převodu na schéma 5.
- **Stabilní ID.** Pokrok je vázaný na stabilní ID karet (např. `access-v-001:flashcard`), takže přežije přidání obsahu.
- **Víc karet prohlížeče.** Pokrok upravuje vždy jen jedna karta prohlížeče (Web Locks API).
  - Ostatní karty s aplikací ukazují uložený stav s bannerem „Tato karta je jen pro čtení“.
  - Zápis převezmou, když zapisující kartu zavřete nebo spadne, nebo hned tlačítkem „Pracovat v této kartě“.
  - Každý zápis navíc ověří revizi uložených dat. Karta se zastaralým stavem nic nepřepíše a nabídne „Načíst aktuální stav“. Data uložená novější verzí aplikace se nepřepíší nikdy.
- **Nečitelná nebo poškozená data** aplikace bez vaší výslovné volby nepřepíše. Pracuje dál bez ukládání a nabídne stažení dat, obnovu platných záznamů nebo smazání.
- **Nedostupné úložiště nebo chyba zápisu:** aplikace to oznámí a nabídne:
  - stažení exportu aktuálního stavu;
  - nový pokus o uložení;
  - pokračování bez ukládání.

  Když se zápis nepovede ve chvíli, kdy jste na stránce níž, objeví se krátké upozornění tam, kde jste, s tlačítkem „Zobrazit možnosti“. Nastavení → Pokrok a záloha začíná řádkem „Stav ukládání“.
- **Trvalé uložení:** Nastavení ukáže, zda prohlížeč data stránky uchová, i když dochází místo, a umožní o to požádat. Skutečnou zálohou je ale jen export.
- **Export** (Nastavení → Pokrok a záloha) stáhne soubor `cloud-admin-deutsch-progress-RRRR-MM-DD.json`.
  - Je to verzovaný JSON se vším, co potřebujete k pokračování: karty a termíny, rozpracovaná lekce, sebehodnocení, vlastní příklady, statistiky a nastavení.
  - Slouží k přenosu do jiného prohlížeče a jako záloha.
  - Obsahuje vaše vlastní příklady, proto ho nesdílejte; vzor názvu je v `.gitignore`.
- **Import** soubor nejdřív celý zkontroluje: formát, verzi formátu i dat a každou hodnotu stejně přísně jako při čtení z prohlížeče (nejvýš 2 MB).
  - Neplatný soubor odmítne s důvodem a pokrok nechá beze změny.
  - Platný soubor ukáže v dialogu souhrn (datum, verze, počty) a pokrok nahradí až po potvrzení.
  - Export z verze 1.0 se převede.
- **Smazání pokroku** má vlastní potvrzovací dialog a odstraní všechny klíče této aplikace (předpona `cloud-admin-deutsch-at:`); jiná data prohlížeče zůstanou.

## Struktura

```text
src/
  content/      studijní data (bez UI) a jejich kontrola
  domain/       čistá logika: karty, kontrola odpovědí, plánovač, lekce, hledání
  storage/      schéma, validace a ukládání pokroku
  state/        stav aplikace v Reactu a napojení na úložiště
  features/     obrazovky: today, lesson, practice, interview, dictionary, settings
  lib/          pomocné funkce (formáty, stahování, předčítání, velikost písma podle nejdelšího slova, pole nad klávesnicí)
  components/   sdílené komponenty (potvrzovací dialog, hlášení úložiště, štítek úrovně, čeština s označenou němčinou)
  i18n/         texty rozhraní (česky, oddělené od dat)
  styles/       design tokeny a CSS
docs/           plán a pravidla obsahu
```

Postup pro přidání obsahu popisuje [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Publikace na GitHub Pages

1. Vytvořte repozitář (např. `cloud-admin-deutsch-at`) a nahrajte obsah složky do větve `main`.
2. V repozitáři nastavte **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Workflow `.github/workflows/ci.yml` zkontroluje každý pull request a push do `main` (`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`). Nic nenasazuje.
4. Nasazení spustíte ručně: **Actions → Deploy to GitHub Pages → Run workflow** (větev `main`). Workflow `.github/workflows/deploy.yml` se stejnou verzí Node a lockfilem provede kontroly, build a testy v prohlížeči a nasadí právě tento `dist/` do prostředí `github-pages`. Z jiné větve nenasadí. Automatické nasazení po každém pushi zapnete podle komentáře v souboru.
5. Aplikace poběží na `https://<účet>.github.io/<repozitář>/`. Díky relativním cestám a hash adresám funguje pod libovolným názvem repozitáře a podcestu nikde nastavovat nemusíte. Přesné příkazy pro váš projekt jsou v [QUICKSTART_CS.md](QUICKSTART_CS.md), kap. 10.

## Licence

Repo zatím nemá licenci, platí tedy „všechna práva vyhrazena“. Viz otevřený bod O02 v [PROJECT_STATE.md](../PROJECT_STATE.md).
