# PROJECT_STATE — Cloud Admin Deutsch (AT)

Předávací stav projektu, aktualizuje se na konci každé etapy. Anglický přehled je v [`README.md`](README.md), český návod v [`docs/README.cs.md`](docs/README.cs.md), návrh a kontroly etap v [`docs/PLAN.md`](docs/PLAN.md), pravidla obsahu v [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md). **Stav požadavků, závady P0–P2 a jejich etapy vede [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md).**

**Stav:** verze 1.0.0, **vydaná 2026-11-17** · etapa 12 (publikace) hotová · repozitář [BrutusFilip/cloud-admin-deutsch-at](https://github.com/BrutusFilip/cloud-admin-deutsch-at), živé demo [brutusfilip.github.io/cloud-admin-deutsch-at](https://brutusfilip.github.io/cloud-admin-deutsch-at/) · otevřená závada P0 ani P1 nezbývá, nová P2 Z48 · **Aktualizováno:** 2026-11-17

## Etapy k první veřejné verzi

Číslování podle vašich promptů. Písmeno E v dalších kapitolách označuje body původního plánu, ne tyto etapy.

- [x] 1 — realizační plán (plán E0)
- [x] 2 — první použitelná verze (plán E1, E2, E3)
- [x] 3 — gramatika, výzva a rozšíření obsahu (plán E4)
- [x] 4 — pohovor (plán E5)
- [x] 5 — portfolio v1.0 (export, import, německé rozhraní, Pages, README)
- [x] 6 — audit podle zadání, opravy instalace, spuštění a navigace (2026-11-11)
- [x] 7 — spolehlivost studia a uloženého pokroku (Z03–Z05, Z16–Z22, z Z06 trvalé uložení) (2026-11-11)
- [x] 8 — výukový obsah a zpětná vazba (redakční kontrola, vyhodnocování, režimy; Z24–Z29) (2026-11-12)
- [x] 9 — ucelené rozhraní pro veřejnou verzi (vizuální systém, stavy, dialog, přístupnost, rozlišení; Z30–Z45) (2026-11-12)
- [x] 10 — závěrečné ověření před balením (Playwright v repozitáři, 8 skupin průchodů, build, prohlížeče, úniky, přístupnost; Z46, Z47) (2026-11-16)
- [x] 11 — balení a příprava vydání (Node 26 LTS, čistá instalace, README, `docs/QUICKSTART_CS.md`, workflows, screenshoty) (2026-11-16)
- [x] 12 — publikace: repozitář, push, CI včetně Firefoxu a WebKitu, GitHub Pages, krátký průchod živou adresou, odkaz na demo; licence zůstává na vás (O02) (2026-11-17)
- [ ] po vydání — studijní průchod a nastavení (Z07–Z10, připomínka zálohy ze Z06), můj návrh
- [ ] po dokončení této verze — rozšíření obsahu o další desítky položek (Z11, zbytek Z12)

Obsah etap 7 až 12 určila vaše zadání. Etapa 11 připravila balík a konfiguraci vydání, etapa 12 aplikaci publikovala. Můj dřívější návrh „studijní průchod a nastavení“ jsou rozšíření s dopadem P2, ne podmínka vydání, a zůstává za vydáním. Podrobně v `docs/RELEASE_CHECKLIST.md`, kap. 16.

## Pracovní pravidla pro etapy 6 až vydání

Vaše pravidla ze zadání etapy 6, platí pro všechny navazující etapy:

1. Zachovat zavedený stack, stabilní ID studijních položek a uložená uživatelská data. Měnit existující projekt a respektovat rozpracované změny.
2. Nejdřív problém reprodukovat, pak udělat nejmenší úplnou opravu a ověřit ji běžným vstupem do aplikace. Závislosti aktualizovat jen cíleně, když to oprava vyžaduje. Jeden správce balíčků (npm) a jeho lockfile.
3. Každou etapu dokončit v jejím rozsahu. U dlouhé práce průběžně aktualizovat tento soubor, aby šlo po limitu navázat.
4. Výsledky kontrol uvádět podle skutečného provedení. Když kontrolu prostředí neumožní, zapsat důvod a konkrétní další krok. Předat přenositelné soubory s cestami a příkazy pro lokální ověření.
5. Po každé etapě aktualizovat tento soubor a `docs/RELEASE_CHECKLIST.md`: požadavek, stav, ověřovací postup, výsledek a zbývající problém.

## Etapa 12: publikace (2026-11-17)

**Zadání v kostce:**
- zjistit stav gitu, větev, remotes a přihlášení GitHub CLI bez výpisu tokenů; cíl a viditelnost vzít z vašeho zadání;
- před commitem projít soubory k publikaci a diff, ověřit kontroly a staging; srozumitelný první commit;
- nahrát zdrojové soubory a dokumentaci a řešit chyby CI, dokud kontrola neprojde;
- GitHub Pages se zdrojem GitHub Actions, nasazení z `main` sledované do výsledku;
- krátký průchod skutečnou adresou: assety, navigace a reload, lekce se zachováním pokroku, pohovor, telefon;
- URL dema do README a do About, dokumentační commit přes kontroly, aktualizovat tento soubor a checklist.

### Výsledek

**Aplikace je publikovaná a živá adresa prošla krátkým průchodem.** Nasazený build je bajt po bajtu stejný jako build ověřený v etapách 10 a 11. Kód aplikace se v etapě 12 nezměnil. Opravil jsem jen dva testy, které ve Firefoxu a WebKitu selhaly na vlastních předpokladech (D112).

| Hodnota | Stav |
|---|---|
| Repozitář | https://github.com/BrutusFilip/cloud-admin-deutsch-at, veřejný, výchozí větev `main` |
| Živé demo | https://brutusfilip.github.io/cloud-admin-deutsch-at/ |
| Nasazený commit | `19c3db1`. Aplikace je shodná s `690451b`, `19c3db1` mění jen dva soubory v `e2e/`. Workflow Deploy, běh 44043735149, druhý pokus. |
| Commity | `690451b` „Initial release: Cloud Admin Deutsch 1.0.0“ (154 souborů, balík etapy 11) · `19c3db1` „Make the Firefox and WebKit browser tests pass“ · dokumentační commit s odkazem na demo a s tímto stavem |
| Identita commitů | identita této relace „Claude <noreply@anthropic.com>“ s podpisem a řádkem `Co-Authored-By`; váš e-mail v historii není (D111) |
| About repozitáře | popis a web nastavíte vy: zápis nastavení repozitáře relace nesmí (O31) |
| Licence | žádná, tedy všechna práva vyhrazena (O02) |

| Krok | Co proběhlo | Výsledek |
|---|---|---|
| Výchozí stav | Složka nebyla git repozitář, remotes žádné. GitHub CLI přihlášené jako `BrutusFilip`, token jsem nevypisoval; relace smí pracovat jen s připojenými repozitáři. Cíl a viditelnost podle vašeho zadání: `cloud-admin-deutsch-at`, veřejný. | jednoznačný cíl |
| Soubory k publikaci | `git init -b main`, `git add -A`; seznam porovnaný s ověřeným balíkem etapy 11; hledání osobních a interních údajů, tajných hodnot, exportů pokroku a lokálních souborů; metadata screenshotů | 154 souborů = balík etapy 11; nic nežádoucího; PNG bez textových metadat |
| Kontroly před commitem | Node 26.13.0, npm 11.21.2: `npm run check`, `CI=1 npm run test:e2e` | exit 0, 237 testů prošlo a 1 vynechaný, 23/23 v prohlížeči, build shodný s etapou 10 |
| Repozitář | Založení přes API relace odmítla (403). Prázdný veřejný repozitář jste založili vy a povolili k němu přístup aplikace Claude. | push `690451b` do `main` |
| CI `690451b` | běh 44042153770 | lint, typy, testy a build ✅, Chromium 23/23 ✅; nepovinné Firefox 20/21 a WebKit 22/23 ❌ |
| Oprava testů | Telefonní test počítal s obrazovkou 360 × 800, WebKit ale testuje iPhone 13 (390 × 664). Test klávesnice tabuloval za konec stránky, kde Firefox přesune fokus do svého rozhraní. Teď jde testy zpět přes Shift+Tab a meze berou z velikosti projektu. Lokálně Chromium 23/23, oba soubory třikrát (15/15) a telefonní testy s velikostí iPhonu 13 v Chromiu 2/2. | `19c3db1` |
| CI `19c3db1` | běh 44043364589, ubuntu-latest (Ubuntu 26.04), Node 26.13.1 | všechny 4 úlohy ✅: lint, typy, testy a build (237 + 1 vynechaný), Chromium 23/23, Firefox 155 21/21, WebKit 26.6 23/23 |
| GitHub Pages | Nastavení přes API relace odmítla (403). Source: GitHub Actions jste nastavili vy. | `has_pages: true` |
| Nasazení | Deploy z `main` pro `690451b` a první pokus pro `19c3db1`: kontroly, build a testy buildu ✅, samotné nasazení 404 „Ensure GitHub Pages has been enabled“. Po zapnutí Pages jsem znovu spustil jen úlohu nasazení. | ✅ 2026-11-17, `page_url` https://brutusfilip.github.io/cloud-admin-deutsch-at/ |
| README | odkaz na demo v `README.md` a `docs/README.cs.md`, podpora prostředí podle nových kontrol | ✅ (dokumentační commit) |

**Krátký průchod živou adresou** proběhl v integrovaném prohlížeči aplikace Claude na vašem Windows (Chromium 156). Velikost okna byla emulovaná: 1280 × 900 a telefon 375 × 812 s dotykem.

| Oblast | Postup | Výsledek |
|---|---|---|
| Načtení a assety | první načtení, síť a konzole; všech 15 souborů buildu přes `fetch` a SHA-256 | 8 požadavků (HTML, 2× JS, 2× CSS, 3 písma), všechny HTTP 200 a jen na `brutusfilip.github.io`; konzole bez jediné zprávy. Všech 15 souborů je shodných s ověřeným buildem, typy obsahu sedí, písma se načetla. |
| Navigace a reload | Dnes, Procvičování, Pohovor, Slovník; pak `#/slovnik/access-v-006` a obnovení stránky | správné nadpisy i `aria-current`, slovník 150 hesel; po obnovení (typ `reload`, HTTP 200) stejné heslo |
| Lekce a pokrok | „Začít trénink“: 10 karet, z toho 6 kartiček, 3 věty a 1 slovosled; pak obnovení stránky | souhrn „Prošli jste 10 karet“, napoprvé správně 2 z 2. Po obnovení 10 uložených karet (schéma 5) s termínem 20. 11. 2026, na Dnes „Nové 145“ (předtím 150), ve Statistikách „Dokončené lekce 1“. |
| Pohovor | „Představení a motivace“: otázka, doplňující otázka, vzorová odpověď, sebehodnocení, další otázka, ukončení | vzor označený „Ilustrační“ s místy k nahrazení vlastními fakty, 3 odkazy do slovníku, 5 otázek sebehodnocení včetně doložení příkladu; souhrn „Zodpovězené otázky: 1 z 3“ s hodnocením |
| Telefon | 375 × 812: Dnes, Slovník s filtry, Pohovor, kartička | navigace dole (752–812 px), nic se neposouvá do strany, filtry složené pod „Filtry (2)“; odkrytý význam je vidět, volby hodnocení mají 81 px a končí nad navigací |

Průchod našel jednu novou závadu: **Z48** (P2, text). Po procvičení jedné karty souhrn píše „Prošli jste 1 karta.“ místo „1 kartu“. Podobně „Trénink nabídne 1 karta k opakování“ a „Dalších 1 až 4 karty psaní se odemkne“, v němčině „Weitere 1 Karte … werden freigeschaltet“. Opravu nechávám do další etapy, aby nasazený build zůstal ten ověřený (D113).

Smyšlený testovací pokrok z průchodu (11 karet, jedna odpověď v pohovoru) zůstal jen v integrovaném prohlížeči aplikace Claude. Jinde váš pokrok neovlivní.

**Přenos vašeho pokroku**, jen pokud ho potřebujete:
1. Na původní adrese, například `http://localhost:5173/`, otevřete Nastavení → „Stáhnout export“.
2. Na živé adrese otevřete Nastavení → Import, vyberte soubor a zvolte „Nahradit pokrok“.

V náhledu v Claude export nefunguje (O21). Soubor exportu do repozitáře ani do dema nepatří.

**Zbývá:**
- licence (O02);
- About repozitáře (O31);
- lokální běh na Windows (O12);
- Safari na macOS a iOS, Edge a skutečné telefony (Z13);
- Z48;
- rozhodnutí, zda Firefox a WebKit v CI udělat povinné (O30).

## Etapa 11: balení a příprava vydání (2026-11-16)

**Zadání v kostce:**
- podporovaná verze Node.js kompatibilní s balíčky, popsaná stejně v projektu i v CI; správce balíčků z repozitáře;
- čistá instalace `npm ci` v oddělené dočasné kopii, pak kontroly a build; soubory pracovní složky a používání aplikace zachovat;
- skripty `dev`, `build` a `preview` musí existovat; názvy `lint`, `typecheck` a `test` stejně v dokumentaci i ve workflows;
- README v angličtině pro náboráře a vývojáře se skutečnými screenshoty desktopu a mobilu;
- `docs/QUICKSTART_CS.md` pro Windows a PowerShell, včetně řešení potíží a vzdáleného serveru;
- workflows podle aktuální oficiální dokumentace použitých Actions;
- Pages podcesta, routování a `BASE_URL`;
- `.gitignore` a soubory ke commitu; licence jen z existujícího rozhodnutí;
- výsledek čisté instalace a zbývající hodnoty pro GitHub.

### Výsledek

**Balík zdrojových souborů je lokálně spustitelný a konfigurace vydání je připravená.** Kód aplikace se nezměnil a build je bajt po bajtu stejný jako v etapě 10 (`index-CpVPZXr1.js`). Změnily se konfigurace, workflows, dokumentace a screenshoty. Všechno běželo 2026-11-16 v mém cloudovém prostředí na Linuxu, v dočasných kopiích mimo pracovní složku. Skutečný Windows ověřený není.

| Oblast | Co je hotové | Ověření |
|---|---|---|
| Node.js | Node 26 LTS v `.nvmrc`, oba workflows ho čtou přes `node-version-file`. `engines` zůstává `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`. Nový `.npmrc` s `engine-strict=true` (D107, D108). | viz čistá instalace níže |
| Správce balíčků | npm a `package-lock.json` (lockfileVersion 3), beze změny | `npm ci` s npm 10.9.9 i 11.21.2 lockfile nezměnil |
| Skripty | `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `check`, `test:e2e` existují. Stejné názvy používají README, `docs/README.cs.md`, `docs/QUICKSTART_CS.md` i oba workflows. | `npm run dev` a `npm run preview` z čisté kopie odpověděly HTTP 200 |
| README | přepsané pro náboráře a vývojáře: účel, funkce, co hodnotí aplikace a co vy, skutečné ukázky výsledků, stack, rychlé spuštění, kontroly s výsledky, podporovaná prostředí podle kontrol, datový tok, ukládání, rozšíření obsahu, nasazení, struktura | tabulky a odkazy zkontrolované (`md_check.py`) |
| Screenshoty | 4 nové z produkčního buildu s ilustračními daty: Dnes a porovnání odpovědi se vzorem (1440 × 900), odkrytá kartička a pohovor v německém rozhraní (390 × 844) | Playwright, 0 chyb v konzoli; 233 kB po zmenšení palety na 256 barev (z 728 kB), text bez viditelné změny |
| QUICKSTART_CS | Windows a PowerShell: složka `$HOME\Projects\cloud-admin-deutsch-at` a jak ji najít, Node a npm, instalace, kontroly, dev server a jeho zastavení, náhled i pod podcestou, pokrok a jeho přenos, 10 potíží, vzdálený server a SSH tunel, publikace s přesnými příkazy | chybové hlášky a chování portů jsem ověřil na Linuxu; Windows neověřený |
| Workflows | `ci.yml` a `deploy.yml` podle aktuální dokumentace (D109) | actionlint 1.7.12 se shellcheck 0.11.0 bez nálezů; běh na GitHubu až po pushi |
| Pages podcesta | nic se nenastavuje: relativní `base: './'` a hash routování. Jediné popsané místo pro případnou změnu je `vite.config.ts` (D110). | `import.meta.env.BASE_URL` je `./` a kód ho nepoužívá; build pod `/cloud-admin-deutsch-at/`, pod jiným názvem i v kořeni (etapa 10, V10) |
| Soubory ke commitu | `.gitignore` beze změny | zkušební `git add -A` v kopii s `node_modules`, `dist`, výstupy testů, exportem, `*.local.*` a `.env`: 154 souborů, nic nežádoucího |
| Licence | rozhodnutí neexistuje, zůstává otevřený bod O02; README: „all rights reserved“ | – |

**Čistá instalace v dočasných kopiích** (bez `node_modules`, `dist` a výstupů testů):

| Prostředí | Postup | Výsledek |
|---|---|---|
| Node 26.13.0 a npm 11.21.2, tj. to, co přinese Node 26 LTS na Windows | `npm ci`, `npm run lint`, `typecheck`, `test`, `build`, `dev`, `preview`, `CI=1 npm run test:e2e` | `added 56 packages … in 2s`, lockfile beze změny. Vše exit 0, 237 testů prošlo, 1 vynechaný. Build shodný s etapou 10. `dev` na `http://localhost:5173/` i `preview` na `http://localhost:4173/` HTTP 200. Testy v prohlížeči 23/23. Celkem 52 s. |
| Node 24.22.2 a 22.23.4, npm 10.9.9 | `npm ci`, `npm run check` | exit 0, 0 varování, lockfile beze změny, 237 testů |
| Node 20.20.2 | `npm ci` | exit 1: `EBADENGINE`, `Required: {"node":"^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0"}` |
| Windows x64 a macOS arm64 | `npm ci --os=… --cpu=… --ignore-scripts` | doinstalují nativní balíčky oxlint, Rolldown, TypeScript a Lightning CSS, macOS i `fsevents` |
| Obsazený port | dev a preview při obsazeném 5173 a 4173 | `Port 5173 is in use, trying another one...`, pak 5174 a 4174 |

### Zbývající hodnoty pro GitHub

| Hodnota | Stav |
|---|---|
| Účet | `BrutusFilip` podle připojeného GitHubu; pokud publikujete jinde, nahraďte ho v příkazech |
| Repozitář | `cloud-admin-deutsch-at`, zatím neexistuje. Veřejný, protože GitHub Pages pro soukromý repozitář vyžaduje placený plán. |
| Publikační větev | `main`: `PUBLISH_BRANCH` v `deploy.yml` a `branches: [main]` v `ci.yml` |
| GitHub Pages | Settings → Pages → Source: GitHub Actions; v prostředí `github-pages` povolená větev `main` |
| Adresa | `https://brutusfilip.github.io/cloud-admin-deutsch-at/` (podcesta `/cloud-admin-deutsch-at/`, nastavovat ji nemusíte) |
| Licence | rozhodnete vy (O02) |
| Číslo verze | 1.0.0 v `package.json` a `src/version.ts`, potvrďte |
| Git identita | `user.name` a `user.email` (doporučená adresa `…@users.noreply.github.com`) |
| Odkaz na živé demo | do README až po publikaci (O22) |

Přesné příkazy jsou v `docs/QUICKSTART_CS.md`, kap. 10.

## Etapa 10: závěrečné ověření před balením (2026-11-16)

**Zadání v kostce:**
- spustit lint, typy, validaci studijních dat, cílené testy a produkční build;
- hlavní průchody ověřit v reálném prohlížeči, také pod plánovanou Pages podcestou;
- chybí-li automatizace zásadního průchodu, přidat malou sadu testů (Playwright) do projektu;
- ověřit 8 skupin průchodů: nový uživatel, rozpracovaná lekce, psaná odpověď, slovník, pohovor a výzva, záloha, CZ/DE a dvě karty, telefon s klávesnicí, dialogy a animacemi;
- soubory buildu, odkazy na obrázky, písma a data, dostupné prohlížeče;
- velké závislosti a zdroje, úniky časovačů a posluchačů, opakované přehrávání;
- k automatické přístupnosti ruční průchod klávesnicí;
- závady opravit a kontroly zopakovat; zapsat výsledky a připravenost k balení.

**Průběh** (etapu přerušil limit; po přerušení jsem navázal podle tohoto seznamu):
- [x] prostředí: Node 26.13, Playwright 1.63, Chromium 153 a Chrome for Testing 153; Firefox a WebKit chybí;
- [x] statické kontroly a reprodukovatelnost buildu;
- [x] Playwright testy v projektu;
- [x] průchody v prohlížeči pod Pages podcestou;
- [x] úniky, velikost zdrojů, klávesnice;
- [x] opravy a opakované kontroly;
- [x] dokumentace, zip, náhled.

### Výsledek

**Aplikace je připravená na balení pro vydání.** Otevřená závada P0 ani P1 nezbývá. V etapě 10 jsem našel dvě závady P2 a obě jsem opravil a znovu ověřil:
- **Z46:** na nízkém telefonu zůstal odkrytý význam pod lištou hodnocení a verdikt mezery nad okrajem;
- **Z47:** hlášení importu při chybě zápisu opakovalo stejnou větu.

Neověřené zůstávají Firefox, WebKit a Safari, Edge, skutečné telefony, čtečka obrazovky, skutečné hlasy, běh workflow na GitHubu a živá adresa. Publikaci neblokují. Podporu dalších prohlížečů ale uvádějte až po jejich ověření (Z13).

Všechno běželo 2026-11-16 v mém cloudovém pracovním prostoru, finální build `index-CpVPZXr1.js`. Podrobná tabulka (prostředí, příkaz nebo postup, očekávání, výsledek, zbývající problém) je v `docs/RELEASE_CHECKLIST.md`, kap. 12, řádky V01–V25.

| Oblast | Čím | Výsledek |
|---|---|---|
| Lint, typy, data, cílené testy | `npm run lint`, `typecheck`, `check:content`, `test:answers`, `test:scheduler`, `test:reload`, `test:stats`, `test:import` | vše exit 0: 22 (+1) / 46 / 47 / 44 / 20 / 11 testů |
| Čistá kopie | `npm ci` a `npm run check` na Node 22.23.4, 24.22.2 a 26.13.0 a s npm 11.21.2; na Node 26 i `npm run test:e2e` | exit 0, 237 testů, bez varování, lockfile beze změny; 23/23 testů v prohlížeči |
| Reprodukovatelný build | 2 buildy po sobě a build z čisté kopie, SHA-256 všech 15 souborů | shodné |
| Testy v repozitáři | `npm run test:e2e` (Chromium: počítač, telefon 360 × 800 a 375 × 553) | **23/23**; v Google Chrome 21/21 (testy pro počítač) |
| Široký průchod | `e2e_check.py`, 41 scénářů, axe-core 4.14 | **576/576 v Chromiu i v Chrome**, axe 32 obrazovek bez nálezů |
| Pages podcesta | `vite preview --base /cloud-admin-deutsch-at/`, statický server se 3 základními adresami | každý pohled se otevře přímo i po reloadu, žádná odpověď ≥ 400 |
| Soubory a zdroje | audit `dist/`, síťový log, `npm audit` | odkazy relativní a existující, žádná zdrojová mapa ani cizí server; 0 zranitelností; asi 193 kB gzip JS a CSS, první návštěva 3 písma (163 kB) |
| Úniky a přehrávání | instrumentace časovačů, posluchačů a `speechSynthesis`, 10–40 opakování 5 průchodů bez reloadu | intervaly 0, posluchače a uzly beze změny, každá promluva zrušena, nikdy dvě naráz |
| Klávesnice | Tab přes 14 obrazovek (232 zastávek) se záznamem pořadí a fokusu | logické pořadí, viditelný fokus, žádná past; dialog drží a vrací fokus |
| Dev server | `devsmoke.py`, 11 kroků jen přes navigaci | 11/11 na dev serveru i pod podcestou, 0 chyb v konzoli |

### Testy v repozitáři (D104)

`playwright.config.ts`, `e2e/` (9 souborů), `tsconfig.e2e.json` a skript `npm run test:e2e`. Testují produkční build přes `vite preview` pod podcestou `/cloud-admin-deutsch-at/` s českou lokalizací a časovou zónou Europe/Prague. Každý test selže při chybě nebo varování v konzoli, nezachycené výjimce, nativním dialogu, odpovědi ≥ 400 a požadavku na jiný server (`e2e/fixtures.ts`). Data jsou smyšlená (`e2e/data.ts`), hlas je falešný (`e2e/fakeSpeech.ts`).

| Soubor | Co hlídá (riziko ztráty pokroku nebo zablokování studia) |
|---|---|
| `study.spec.ts` | nový uživatel: lekce, reload, počty, termíny a „Nejbližší opakování“; rozpracovaná lekce před kontrolou a po ní, dvojklik a Enter ×3 |
| `answers.spec.ts` | uvedená varianta, chybný člen, chybějící přehláska a lišta znaků, volná formulace se sebehodnocením |
| `dictionary.spec.ts` | hledání bez diakritiky, štítky filtrů v adrese, prázdný výsledek; odkaz z rozboru pohovoru na heslo a zpět |
| `interview.spec.ts` | celý pohovor se souhrnem, výzva se souhrnem po krocích, odchod zruší časovač a hlas |
| `backup.spec.ts` | export → import v novém profilu, neplatný, novější a starší soubor, reset jen klíčů aplikace, chyba zápisu při studiu, importu a smazání |
| `tabs-language.spec.ts` | CZ/DE během lekce i s rozepsaným textem; dvě karty a převzetí zápisu |
| `release.spec.ts` | 11 pohledů přímo i po reloadu pod podcestou, písma; klávesnice a dialog; omezené animace |
| `mobile.spec.ts` | telefon: dotyk, hodnocení na dosah, dialog, složené filtry; nízký telefon (Z46) |

CI: úloha `e2e` (Chromium) běží u každého pull requestu a pushe do `main`. Úloha `e2e-other-browsers` spustí stejné testy ve Firefoxu a WebKitu, výsledek workflow ale neshodí, dokud je jednou neověříte (Z13).

### Nálezy a opravy

| ID | Před opravou (reprodukce) | Oprava | Po opravě |
|---|---|---|---|
| Z46 | 375 × 553 (iPhone SE v Safari s lištami), dotyk. Po „Odkrýt řešení“ byl význam na y = 343–373 px, ale lišta hodnocení začínala na 312 px. Na 320 × 568 totéž. U mezery s chybou se verdikt posunul na y = −43 px. Nový test `mobile.spec.ts` selhal. | `showResult` v `src/lib/keepInView.ts`: začátek výsledku dostane na obrazovku nad lištu karty a nad spodní navigaci. Nikdy ho neposune nad horní okraj a kde je výsledek vidět, nic nehne. Kartička ho volá pro význam, psaní a gramatika pro výsledek místo `scrollIntoView({ block: 'nearest' })` (D103). | Test prošel. Na 10 velikostech (320 × 568 až 1280 × 720 a 740 × 360) je význam i verdikt vidět. Na 360 × 640 a větších se po odkrytí nic neposune, jako dřív. Python E2E 576/576. |
| Z47 | Nastavení, `setItem` vyhazuje, import platného souboru → „Nahradit pokrok“. Hlášení: „Zápis se nepodařil, pokrok zůstal beze změny. Pokrok v tomto prohlížeči zůstal beze změny.“ Stejně v kartě jen pro čtení. | Kratší texty `replaceFailed` a `replaceReadOnly` v `cs.ts` i `de.ts`. Větu o nezměněném pokroku přidává hlášení samo. | „Zápis se nepodařil. Pokrok v tomto prohlížeči zůstal beze změny.“ Nový test v `backup.spec.ts` (i smazání při chybě úložiště). |

Bez nálezu (ověřeno, beze změny):
- dvojkliky na krocích pohovoru, výzvy a lekce;
- import a smazání při chybě úložiště nechají data i počty beze změny;
- telefon na šířku (740 × 360);
- úniky;
- pořadí fokusu.

### Pravidla zápisu, která testy hlídají

Popsaná v README („Saving“) a na Dnes v „Co se ukládá a kdy“:
- odpověď se uloží ve chvíli kontroly, rozepsaný text reload nezachová, každé hodnocení se započítá jednou;
- zapisuje jedna karta prohlížeče, ostatní jsou jen pro čtení, dokud nezvolíte „Pracovat v této kartě“;
- import nahradí pokrok až po souhrnu a potvrzení, neplatný soubor nic nezmění;
- reset smaže jen klíče `cloud-admin-deutsch-at:*`;
- při chybě zápisu se nabídne export aktuálního stavu a data v úložišti zůstanou, jak byla.

## Etapa 9: ucelené rozhraní pro veřejnou verzi (2026-11-12)

**Zadání v kostce:**
- prohlédnout skutečné obrazovky a stavy;
- jeden vizuální směr: světlé pozadí, tmavý text, jedna akcentní barva;
- malý soubor designových hodnot;
- hierarchie studijní obrazovky;
- Dnes, slovník, pohovor a nastavení;
- stavy prvků, dialog s fokusem, přístupnost a texty CZ/DE;
- rozlišení 360 × 800, 768 × 1024 a 1440 × 900, zvětšení 200 %, mobilní klávesnice, ovládání jednou rukou;
- skutečné snímky.

Logika lekcí, ukládání a hodnocení zůstala. Změnilo se jen zobrazení a ovládání a jedna doménová drobnost (Z41). Schéma dat zůstává 5, studijní ID se nezměnila.

### Výsledek podle skutečně provedené kontroly

Všechno běželo 2026-11-12 v Chromiu 153 přes Playwright 1.63 na produkčním buildu, s ilustračními daty. Skripty auditu jsou mimo repozitář (D04).

| Oblast | Čím | Výsledek |
|---|---|---|
| Obrazovky a stavy | `audit.py`: 22 scénářů, 42 obrazovek a stavů, každá v 360 × 800, 768 × 1024 a 1440 × 900 | Žádný vodorovný posuv a žádný prvek přes okraj. Axe-core na 11 obrazovkách × 3 rozlišení bez nálezů. Na telefonu i tabletu jsou všechny ovládací prvky vysoké aspoň 44 px, výjimkou je jen lišta ä ö ü ß na telefonu (39 × 44 px, Z38). |
| Klávesnice, dialog, zvětšení, pohyb, jazyk | `probe2.py` | 31/31, rozpis v tabulce „Ověřená rozlišení a stavy“ |
| Stavy prvků | `states.py`: 58 snímků 20 ovládacích prvků (výchozí, najetí, fokus z klávesnice, stisknutí, nedostupné, chybný vstup, vybrané) | prošel jsem je na snímcích, nález Z40 je opravený |
| Dlouhá slova | `wordbreaks.py`: 7 obrazovek s nejdelšími slovy × 4 šířky (320, 360, 768, 1440 px) | slov rozdělených uvnitř: build etapy 8 **44**, teď **0** |
| Kontrast | výpočet podle WCAG z hodnot v `tokens.css` | všechny dvojice textu ≥ 4,5 : 1, ovládací prvky ≥ 3 : 1, tabulka níže |
| Tok v prohlížeči | E2E, 41 scénářů | **576/576**. Nový scénář `stage9_ui` má 24 kontrol, upravená očekávání jsou v kapitole „Kontroly“. Axe-core na 32 obrazovkách bez nálezů. |
| Unit testy | Vitest, 22 souborů | 237 prošlo, 1 vynechaný (v etapě 8 231). Nově 2 testy pravopisu ve volném překladu a 4 testy citované němčiny. |

### Nálezy auditu a co se změnilo

Audit buildu etapy 8: 17 scén ve 3 rozlišeních, zvětšení 200 % a zmenšené okno jako mobilní klávesnice. Z43–Z45 jsem našel až během etapy.

| Závada | Před | Teď | Ověřeno |
|---|---|---|---|
| Z30 psaní na telefonu | Mezi polem a „Zkontrolovat“ stál odstavec pravidel. Hlavní akce byla na y = 776 px z 800 a s klávesnicí daleko pod okrajem. | Nad polem je krátký úkol („Celá věta.“), pravidla jsou pod tlačítky ve sbaleném „Jak se odpověď hodnotí“. S klávesnicí (viditelná výška 420 px) je pole na 146–228 px a tlačítka na 308–408 px, i když se klávesnice otevře až po 700 ms. Při psaní se schová spodní navigace. | `probe2` |
| Z31 posun po odkrytí a kontrole | Po „Odkrýt řešení“ skočila stránka o 380 px, po „Zkontrolovat“ o 270 px, slovo zmizelo nad okrajem. | Odkrytí stránku neposune (slovo zůstane na 241 px). Hodnocení je přilepené nad navigací (559–740 px). Po kontrole je verdikt vidět. | `probe2` |
| Z32 hlavička lekce | Téma jen u lekce z jednoho tématu, průběh čára 3 px, „Ukončit lekci“ 36 px. | Druh lekce, téma právě zobrazené karty a pozice. Nativní `<progress>` 6 px s názvem „Průběh lekce“. „Ukončit lekci“ (a stejně „Ukončit pohovor“) má pro čtečky vysvětlení, co zůstane uložené. | E2E `stage9_ui` |
| Z33 Dnes | Doporučená lekce byla jen věta pod počty. | Blok „Doporučená lekce“: téma, skutečné počty (k opakování modře), „Trénink nabídne N karet …“ a hlavní tlačítko. Rozpracovaná lekce je první, s průběhem a vysvětlením „Zahodit a začít novou“. Na širokém displeji je výzva a pravidla vpravo. | E2E `stage9_ui`, `main_flow`, `plan_matches_lesson` |
| Z34 slovník | Aktivní filtry nebyly vidět, vyčistit šly jen bez výsledků, na telefonu zabraly první obrazovku. | Štítky aktivních filtrů s ×, od dvou filtrů „Zrušit vše“, počet výsledků, stav bez výsledků s nadpisem, důvodem a tlačítkem. Na telefonu jsou filtry za „Filtry (n)“, na širokém displeji je hledání vlevo. | E2E `stage9_ui`, `dictionary` |
| Z35 pohovor | Fáze se lišily jen nadpisem a štítkem. | Tři pojmenované fáze otázky: „Odpověď na otázku“, „Doplňující otázka“, „Rozbor a sebehodnocení“. Aktuální je označená `aria-current`, hotové ✓ a textem pro čtečky. Doplňující otázka má modrý pruh a nad sebou hlavní otázku, rozbor horní pruh. | E2E `stage9_ui`, `interview` |
| Z36 nastavení | Statistiky mezi hlasem a zálohou, nestylovaný výběr souboru, potvrzení v textu stránky. | Pořadí jazyk ovládání → hlas a předčítání → pokrok a záloha → statistiky. Výběr souboru vypadá jako ostatní tlačítka. Smazání, import a obnova se potvrzují v dialogu (D91). | E2E `progress_backup`, `stage9_ui`; `probe2` |
| Z37 hlášení ukládání | Selhání zápisu bylo vidět jen nahoře na stránce. | Když je hlášení mimo obrazovku, ukáže se upozornění tam, kde jste, s tlačítky „Zobrazit možnosti“ a „Skrýt“. Nastavení → Pokrok a záloha začíná řádkem „Stav ukládání“ a při problému tlačítkem „Zobrazit hlášení“. | E2E `stage9_ui` (telefon) |
| Z38 dotyk | Pod 44 px byly CZ/DE, malá tlačítka, odkazy zpět, souhrny a odkaz v patičce. | Na dotykové obrazovce mají všechny prvky výšku aspoň 44 px, CZ a DE i šířku. Výjimka: lišta ä ö ü ß Ä Ö Ü má na 360 px tlačítka 39 × 44 px, aby se vešla do jedné řady nad klávesnicí. WCAG 2.5.8 požaduje 24 px. | `audit.py` |
| Z39 dělení slov | Prohlížeč dělil studijní text („freigege-bene“) i na 1440 px. | Prohlížeč německý studijní text nedělí. Velký text se zmenší podle nejdelšího slova, takže se vejde na řádek. Dělit smí jen text ke čtení: otázky a vzory pohovoru a situace (D90). | `wordbreaks.py` (44 → 0), E2E `narrow`, `stage9_ui` |
| Z40 stavy tlačítek | Nebezpečné tlačítko při najetí zmodralo, chyběl stav stisknutí. | Nebezpečné tlačítko při najetí ztmavne do červena, stisknuté tlačítko se posune o 1 px, nedostupné je bledé a nereaguje. Souhrny mají šipku, která se při rozbalení otočí. | `states.py` |
| Z41 volný překlad | Chybějící přehláska spolu s jiným rozdílem (*fur das*) zůstala bez upozornění. | Slovo, které se od vzoru liší jen přehláskou, ß nebo velkým písmenem, se pojmenuje i při dalším rozdílu: „Pravopis: ve vzoru „für“, u vás „fur“.“ (D101) | 2 unit testy, E2E `stage9_ui` |
| Z42 CSS | 21 různých mezer bez stupnice. | Barvy, písmo, mezery po 4 px, šířky, rámečky, zaoblení, fokus, dotyk a trvání jsou v `tokens.css`. `app.css` jiné barvy nepoužívá (D88). | ruční kontrola, výpočet kontrastu |
| Z43 fokus pod navigací | Prvek u spodního okraje mohl skončit pod pevnou navigací telefonu. Našel to E2E `narrow`: tlačítko „Procvičit psaní“ zakryla navigace. | `scroll-padding` drží fokus a posun nad navigací i nad přilepeným hodnocením. | E2E `narrow` |
| Z44 kartička a čtečka | Po odkrytí čtečka ohlásila jen otázku hodnocení, ne řešení. | Skupina hodnocení má v popisu i český význam, takže ho čtečka přečte s otázkou. | atributy v E2E a `probe2`; skutečnou čtečkou neověřeno |
| Z45 citovaná němčina | Německé výrazy v českých poznámkách („einrichten“) nesly `lang="cs"`, čtečka by je četla česky. | Jednoznačně německé citace mají `lang="de-AT"`, nejisté zůstávají česky (D100). | 4 unit testy, E2E `stage9_ui`, `probe2` |

### Ověřená rozlišení a stavy

Vše je emulace v Chromiu 153, ne skutečné zařízení.

| Rozlišení / stav | Co jsem ověřil | Výsledek |
|---|---|---|
| 360 × 800, telefon s dotykem | 42 obrazovek a stavů, snímky, metriky, axe | bez posuvu a přetečení, cíle ≥ 44 px (kromě lišty znaků), axe bez nálezů |
| 768 × 1024, tablet s dotykem | totéž | bez posuvu a přetečení, cíle ≥ 44 px, axe bez nálezů; filtry slovníku jsou vidět bez rozbalování |
| 1440 × 900, desktop | totéž | bez nálezů; Dnes a Slovník ve dvou sloupcích, studijní stránky v jednom |
| zvětšení 200 % (720 × 450 CSS px) | Dnes, psaní, Nastavení, Slovník s filtry, Pohovor, otevřený dialog | bez vodorovného posuvu; dialog se vejde a jeho tlačítka jsou dosažitelná |
| mobilní klávesnice (viditelná výška 420 px) | psaní věty, doplnění v gramatice, klávesnice otevřená až po 700 ms | pole i hlavní tlačítko nad klávesnicí, navigace schovaná |
| jedna ruka (360 px) | hodnocení po odkrytí, další krok po chybě, potvrzovací dialog | hodnocení a další krok dole nad navigací; dialog je spodní panel s tlačítky pod sebou |
| dialog | smazání v Nastavení i v banneru, obnova platných dat, souhrn importu | Dialog je modální, s názvem a popisem. Fokus začíná na „Zpět“, u souhrnu importu na nadpisu. Tab nevyjde na stránku za dialogem, Esc dialog zruší. Fokus se pak vrátí na tlačítko, které dialog otevřelo (ověřeno u smazání v Nastavení i v banneru), u importu na výběr souboru. |
| `prefers-reduced-motion` | odkrytí řešení, dialog, šipka souhrnu | animace vypnuté |
| jazyk úseků | 6 obrazovek v českém i německém ovládání | `<html lang>` podle ovládání; text v druhém jazyce má vlastní `lang` |
| 320 × 700 | E2E `narrow` | bez posuvu, dlouhá slova se nerozdělí |

**Neověřeno:**
- skutečné telefony a jejich klávesnice (iOS Safari, Android Chrome); klávesnici jsem simuloval zmenšením okna;
- čtečka obrazovky (NVDA, VoiceOver): ověřil jsem jen role, názvy, popisy a `aria-live`;
- Firefox a Safari: `<dialog>`, `:has()` a kontejnerové dotazy podporují aktuální verze, ale nespouštěl jsem je;
- vynucené barvy (Windows High Contrast);
- tmavý režim: zůstává jen světlý vzhled (Z10).

### Kontrast (WCAG 2.2, spočítáno z hodnot v `tokens.css`)

| Dvojice | Poměr | Požadavek |
|---|---|---|
| inkoust na papíře / listu / modrém podkladu | 15,8 / 17,2 / 14,6 | 4,5 |
| grafit (vedlejší text) na papíře / listu / modrém podkladu / červeném podkladu | 7,2 / 7,8 / 6,6 / 6,8 | 4,5 |
| modrá na listu / papíře / modrém podkladu; bílá na modré | 8,2 / 7,5 / 6,9; 8,2 | 4,5 |
| červená na listu / papíře / červeném podkladu | 6,5 / 6,0 / 5,7 | 4,5 |
| okraj ovládacích prvků na papíře / listu / modrém podkladu | 3,3 / 3,7 / 3,1 | 3 |
| fokus (modrá) na papíře / listu | 7,5 / 8,2 | 3 |

### Snímky

Snímky jsou s ilustračními daty a dodané mimo repozitář:
- desktop 1440 × 900: Dnes, porovnání se vzorem, doplňující otázka, slovník s filtry, dialog;
- telefon 360 × 800: Dnes, kartička s hodnocením, chyba v psaní, slovník bez výsledků, dialog, pohovor německy.

V repozitáři jsou aktualizované `docs/screenshots/today.png` a `interview-de-mobile.png`.

## Etapa 8: výukový obsah a zpětná vazba (2026-11-12)

**Zadání v kostce:**
- redakční kontrola všech položek;
- doplnit skutečné mezery a fráze pro upřesnění otázky, přiznání hranice zkušenosti a vysvětlení postupu;
- dopracovat vyhodnocování:
  - jednoznačná úloha jen s definovanými odpověďmi;
  - volný překlad s porovnáním a vlastním hodnocením;
  - kosmetika oddělená od chyby;
  - speciální znaky na místo kurzoru;
- vysvětlení u chybných možností;
- jasné režimy psaní, kartička a poslech;
- výzva s návazným příběhem;
- ověřit pohovor.

Rozšíření o další desítky položek až po dokončení této verze.

### Výsledek podle skutečně provedené kontroly

Automatickou validaci a ruční jazykovou kontrolu vedu odděleně.

| Oblast | Druh kontroly | Čím | Výsledek |
|---|---|---|---|
| Struktura dat, odpovědi, výzvy, pohovory, soukromí | automatická validace | `npm run check:content`: 22 testů, 1 vynechaný výpis | bez nálezů. Nová pravidla: `whyCz`, režim vět, poznámka u jmen bez plurálu, dokončitelnost výzev, vykání *Sie*. |
| Jazyk: členy, plurály, vazby, pády, tvary, slovosled, přirozenost, český význam | ruční redakční kontrola | já (Claude), položku po položce; **není to kontrola rodilým mluvčím** | 150 položek, 3 případy výzvy, 4 pohovory a 42 odkazů do slovníku. Opravy jsou v tabulce níže. Rakouský úzus a přirozenost by měl potvrdit rodilý mluvčí (O16). |
| Vyhodnocování, režimy, pohovor | unit testy a průchod v prohlížeči | Vitest; Playwright 1.63 + Chromium 153 na produkčním buildu | 231 testů prošlo, 1 vynechaný; E2E 552/552; axe-core na 32 obrazovkách bez nálezů |

### Počty položek

Výstup `npm run stats:content` ze dne 2026-11-12. Položky: **150** (do etapy 7: 135, nové: 15), karty: **225**, ilustrační: **8**.

| Druh | Počet | | Úroveň (orientační) | Počet |
|---|---|---|---|---|
| podstatné jméno | 39 | | B1 | 24 |
| sloveso | 17 | | B2 | 114 (76 %) |
| výraz | 18 | | C1 | 12 |
| slovo | 1 | | | |
| věta | 41 | | | |
| gramatická úloha | 34 | | | |

| Téma | Slovní zásoba | Věty | Gramatika | Celkem | Nové v etapě 8 |
|---|---|---|---|---|---|
| Představení a přechod do cloudu (`intro`) | 5 | 4 | 1 | 10 | – |
| Komunikace a reakce v rozhovoru (`communication`) | 7 | 10 | 6 | 23 | 9 |
| Identity v AD a Entra ID (`identity`) | 6 | 3 | 2 | 11 | – |
| MFA a přístupová práva (`access`) | 7 | 2 | 3 | 12 | – |
| Správa Microsoft 365 (`m365`) | 4 | 3 | 5 | 12 | – |
| Správa Azure (`azure`) | 6 | 2 | 2 | 10 | 2 |
| Windows a koncová zařízení (`windows`) | 6 | 2 | 4 | 12 | – |
| Sítě a VPN (`network`) | 6 | 2 | 2 | 10 | – |
| Incidenty a eskalace (`incidents`) | 7 | 3 | 3 | 13 | – |
| Automatizace v PowerShellu (`powershell`) | 5 | 2 | 2 | 9 | 3 |
| Dokumentace a předání (`handover`) | 4 | 2 | 3 | 9 | 1 |
| Náplň, motivace, dostupnost, plat (`career`) | 3 | 5 | 1 | 9 | – |
| Rakouský pracovní kontext (`austria`) | 9 | 1 | 0 | 10 | – |

Gramatika podle jevu:
- slovosled 9;
- pády a vazby 8;
- odlučitelná slovesa 6;
- minulý čas 6;
- zdvořilý Konjunktiv II 5.

Podle typu úlohy:
- doplnění 14;
- výběr 9;
- řazení 5;
- přepis 6.

Karty: kartička 75 (procvičuje se i v režimu Poslech), psaní 116, gramatika 34.

Pohovory:
- 4 pohovory: 3 / 4 / 4 / 3 hlavní otázky, 14 doplňujících;
- 2 otázky na zkušenost (STAR), 10 technických a 2 osobní.

**Požadavek zadání:**

| Požadavek | Skutečnost |
|---|---|
| ≥ 80 kvalitních položek | 150 |
| ≥ 15 gramatických úloh | 34 |
| prioritní IT témata | všech 13 témat má aspoň 9 položek |
| čtyři pohovory se 3–4 hlavními otázkami | splněno |

### Doplněné položky (15, nová ID, žádné staré ID se nezměnilo)

| Skupina | Položky |
|---|---|
| Upřesnění otázky | `communication-s-007`: *Meinen Sie damit die Berechtigungen in Entra ID oder die Freigaben auf dem Dateiserver?*<br>`communication-v-005`: *auf etwas (A) eingehen*<br>`communication-g-006`: *Darf ich kurz zusammenfassen, worum es Ihnen geht?* (dativ *Ihnen*) |
| Přiznání hranice zkušenosti (ilustrační) | `communication-s-008`: *Damit habe ich bisher nur in einer Testumgebung gearbeitet.*<br>`communication-s-009`: *Das habe ich selbst noch nicht umgesetzt, aber ich kenne das Prinzip.*<br>`communication-v-006`: *sich in etwas (A) einarbeiten* |
| Srozumitelné vysvětlení postupu | `communication-v-007`: *vorgehen*<br>`communication-s-010`: *Im ersten Schritt …, und im zweiten Schritt …*<br>`communication-g-005`: inverze po *Abschließend* (řazení, dvě správná pořadí) |
| Tenká témata (dřív 6–8 položek) | `azure-v-006`: *die Kosten im Blick behalten*<br>`azure-g-002`: *auf Ebene der Ressourcengruppe* (genitiv)<br>`powershell-v-004`: *protokollieren*<br>`powershell-v-005`: *die Fehlerbehandlung* (bez běžného plurálu)<br>`powershell-g-002`: *ausprobiert* (bez *ge-*)<br>`handover-v-004`: *dokumentieren* |

Rozmanitost stojí na odlišném použití jazyka: nová vazba, pád nebo slovosled a nová funkce v rozhovoru. Nejde o další variantu stejné věty.

### Ruční jazyková kontrola: hlavní opravy

ID ani význam položek se kvůli korektuře nezměnily.

| Kde | Problém | Oprava |
|---|---|---|
| `intro-s-003`, vzor `intro-i-001` (čeština) | „problémy systematicky zužovat“ je nepřirozené a nepřesné pro *eingrenzen* | „problémy systematicky lokalizovat“ |
| `communication-v-007`, `communication-s-010` (čeština, nové) | „zúžím příčinu“ | „zúžím okruh možných příčin“, shodně s `network-v-001` |
| `intro-g-001` (čeština) | „Přihlásil(a) jsem se k vám“ zní jako přihlášení do systému | „Do výběrového řízení u vás jsem se přihlásil(a), …“ |
| `communication-v-002` (příklad) | „wie dringend die Arbeit ist“ je nepřirozené | „wie stark ihre Arbeit eingeschränkt ist“ / „jak moc jim brání v práci“ |
| `access-v-003` *freigeben* (vazba) | jen jedna vazba, přitom se používají dva významy | „etwas (A) für jemanden (A) freigeben (zpřístupnit); etwas (A) freigeben (schválit, např. einen Antrag)“ |
| `handover-v-002` *festhalten* (vazba) | chyběla častá vazba s místem | „etwas (A) (schriftlich) festhalten; etwas (A) in etwas (D) festhalten (im Ticket, im Protokoll)“ |
| `access-v-007`, `network-v-004`, `austria-v-007` a nové `powershell-v-005` (plurál) | `plural: null` bez vysvětlení; rozhraní psalo „bez plurálu“, i když plurál existuje, jen se nepoužívá | poznámka „Jen / Obvykle jen v jednotném čísle“; rozhraní „jen jednotné číslo (bez běžného plurálu)“ |
| `windows-s-001` (varianta) | častá správná formulace se neuznala | přidána varianta *Starten Sie den Computer bitte neu.* |
| 25 z 37 vět s `write.mode: 'auto'` | volný překlad hodnocený jako jednoznačná úloha | všech 41 vět má `compare` (D78) |
| 9 úloh s výběrem | chybělo vysvětlení chybných možností | `whyCz` u každé chybné možnosti. Všechny distraktory jsem posoudil jako jednoznačně chybné (vždy jedna typická chyba). |

**Bez nálezu:**
- **Vykání *Sie*:** všude, nově hlídané testem.
- **Výzvy:** všechny tři mají návazný příběh od upřesnění po předání:
  - *VPN na home office*;
  - *Nový telefon a MFA*;
  - *Schránka bez externích e-mailů*.
- **Pohovory:**
  - **Stavba:** 3–4 otázky; STAR u zkušeností; u technických otázek upřesnit → ověřit → bezpečný krok → komunikace.
  - **Vzory:** ilustrační, s 29 fakty k nahrazení.
  - **Odkazy do slovníku:** všech 42 vede na existující a relevantní hesla. Existenci hlídá validace, relevanci jsem posoudil ručně. 11 odkazů, jejichž heslo se ve vzoru ani v doplňující otázce doslova neobjevuje, jsem prošel znovu proti textu otázky. Všechny odpovídají jejímu obsahu, např. *das Least-Privilege-Prinzip* u doplňující otázky na příliš mnoho práv a *jemanden auf dem Laufenden halten* u informování uživatelů.

### Stav před opravou a po ní

Problémy jsem našel při čtení kódu a obsahu před úpravou. Stejné kroky jsem pak 12. 11. spustil skriptem mimo repo (`repro8.py`) na buildu etapy 7 i na novém buildu:

| Krok | Etapa 7 | Etapa 8 |
|---|---|---|
| Psaní věty `windows-s-001`, správná neuvedená formulace „Bitte starten Sie Ihren Computer neu.“ | „✕ Chyba“, slovo *Ihren* označené jako chyba | „Porovnání se vzorem“: *Ihren* označené neutrálně, vlastní hodnocení (Z24) |
| Přepis `handover-g-003` bez čárky před *dass* | „✕ Chyba“, „Liší se interpunkce.“ | „✓ Správně“ a pod tím „Před „dass“ chybí čárka. Vedlejší větu němčina vždy odděluje čárkou.“ (Z25) |
| Výběr `communication-g-001`, chybná možnost *mich* | jen správné znění, důvod chybí | „Proč ne „Könnten Sie mich …“: „vorlesen“ se pojí s dativem osoby … „mir“, ne „mich“.“ (Z26) |
| Přepis `windows-g-001` se špatným slovosledem | „Slova jsou správně, liší se slovosled.“ | „… liší se slovosled: jinde stojí „besteht“.“ (Z27) |
| Heslo `access-v-007` | „Plurál: bez plurálu“; úroveň „B2“ bez vysvětlení | „jen jednotné číslo (bez běžného plurálu)“; „orientační úroveň B2“ s vysvětlením (Z28) |
| Procvičování | 3 režimy | 4 režimy, nový Poslech (Z29) |

### Co uvidíte

- **Jednoznačná úloha** (slovo, výraz, sloveso, doplnění, výběr, řazení, přepis): uzná jen předem definované odpovědi a varianty, jinak „Chyba“ s vysvětlením.
- **Volný překlad věty:**
  - **Shoda se vzorem nebo s uvedenou formulací** = „Správně“.
  - **Rozdíl jen v přehlásce, ß nebo velkém písmenu** = „Chyba“.
  - **Jiný rozdíl** = „Porovnání se vzorem“:
    - ukáže se nejbližší vzor a rozdílná slova, označená tečkovaně, ne červeně; čtečka řekne „jinak než ve vzoru“;
    - otázky k zamyšlení, např. „Slovo „eher“ ve vzoru není. Mění význam, nebo je jen navíc?“;
    - další správné formulace;
    - hodnocení Znovu, Těžké, Umím.
- **Kosmetická odchylka:** interpunkce nikdy není chyba v procvičovaném jevu. Poznámka „Interpunkce – nepočítá se jako chyba“ jmenuje přesné místo. Při skutečné chybě stojí zvlášť.
- **Výběr:**
  - důvod u zvolené chybné možnosti;
  - ve sbaleném seznamu „Proč ostatní možnosti nesedí“ důvody u ostatních;
  - vysvětlení řešení „Proč“ jako dosud.
- **Řazení a slovosled:** nápověda jmenuje až tři slova, která stojí jinde, proti nejbližšímu povolenému pořadí.
- **Lišta ä ö ü ß Ä Ö Ü:**
  - znak se vloží na místo kurzoru, i doprostřed slova nebo místo označeného textu;
  - funguje myší, klávesnicí (Tab, Enter) i dotykem;
  - fokus a kurzor zůstanou v poli.
- **Režimy Procvičování:** Kartička DE → CZ, **Poslech DE → CZ**, Psaní CZ → DE a Gramatika.
  - **Kartička:** němčina hned, čeština po odkrytí.
  - **Poslech:**
    - němčina se přehraje jen tlačítkem a text se ukáže až s řešením;
    - přehrávání jde zastavit;
    - přechod na další kartu, jinou stránku nebo `pagehide` ho zruší;
    - bez Web Speech API, bez německého hlasu nebo při chybě přehrávání karta ukáže text a důvod;
    - opožděné hlasy (`voiceschanged`) se počkají;
    - pokrok se počítá ke kartičce.
  - **Psaní:** pole, kontrola, výsledek, hodnocení.
- **Pomůcky až v příslušné fázi:**
  - čeština u gramatiky, důvody u možností a vzor věty až po odpovědi;
  - v pohovoru doplňující otázka až po odpovědi, vzor až po ní.
- **Úroveň B1–C1** je všude označená jako orientační (štítek, filtr „Obtížnost (orientační)“).

### Ukázka dokončeného průchodu: výzva „VPN na home office“

Průchod jsem provedl v prohlížeči na produkčním buildu jako E2E scénář `challenge`, se stopkami a omezenými animacemi.

Situace (německy, česky na vyžádání): pondělí 8:15, obchodnici na home office nejde VPN, v 9 má schůzku se zákazníkem.

| Krok | Úloha | Odpověď | Výsledek |
|---|---|---|---|
| 1 Upřesnění problému | výběr zdvořilé prosby (`communication-g-001`) | *Könnten Sie mich bitte die genaue Fehlermeldung vorlesen?* | ✕ Chyba. Proč ne: *vorlesen* + dativ osoby → *mir*. Ve sbaleném seznamu důvody u *Konnten* (minulý čas) a *vorzulesen* (bez *zu*). |
| 2 Rozsah dopadu | řazení po *ob*, jen klávesnicí (`incidents-g-001`) | *… ob die Störung nur einen Benutzer oder mehrere betrifft.* | ✓ Správně, Umím |
| 3 Příčina | řazení po *weil*, myší (`network-g-001`) | *… weil das Zertifikat abgelaufen ist.* | ✓ Správně, Umím |
| 4 Komunikace s uživatelkou | doplnění Konjunktiv II (`network-g-002`) | *Konnten* | ✕ Chyba: „Chybí ö: správně „Könnten“ …“ |
| 5 Předání | přepis se spojkou *nachdem* (`handover-g-001`) | *Nachdem ich das Zertifikat erneuert hatte, habe ich die VPN-Verbindung getestet.* | ✓ Správně |

**Výsledek:**
- „Napoprvé správně: 3 z 5 (60 %)“;
- výsledek po krocích: chyba, správně, správně, chyba, správně;
- čas z volitelných stopek;
- po reloadu stejný výsledek.

„Zopakovat chyby (2)“ nabídne kroky 1 a 4. Obě úlohy jsem zopakoval správně a lekce skončila souhrnem.

Další dva případy výzvy prošel scénář `all_challenges` přes „Nevím“ až k výsledku. Vždy bylo 5 kroků v pořadí příběhu, u každého vysvětlení. Unit test navíc ověřuje, že správné odpovědi dají u všech tří případů 5 z 5.

## Etapa 7: spolehlivost studia a uloženého pokroku (2026-11-11)

**Reprodukce před opravou.** Skript mimo repo procházel build etapy 6 běžně přes rozhraní (Playwright, Chromium 153):

| Závada | Dopad | Co se stalo |
|---|---|---|
| Z16 | P0 | Chybná odpověď při psaní, pak odchod do Slovníku a zpět, nebo reload: výsledek zmizel a šlo odpovídat znovu. Druhá, už správná odpověď se uložila jako „správně / Umím“, karta dostala stupeň 1 a termín za 3 dny. |
| Z17 | P0 | Tutéž lekci ohodnotily dvě karty prohlížeče. V úložišti zůstalo jen hodnocení druhé karty („Znovu“), hodnocení první („Umím“) zmizelo a karta měla v jedné lekci dvě hodnocení. Druhá karta nic neoznámila. |
| Z18 | P0, skrytá | První zápis po převodu dat verze 3 přepsal původní text a cesta zpět nebyla. |
| Z19 | P2 | Banner „Poslední změnu se nepodařilo uložit“ nenabízel export, přestože pokrok zůstal jen ve stránce. |
| Z20 | P2 | Souhrn lekce sčítal „Nevím“ a vlastní „Znovu“ dohromady. Počet dokončených lekcí se nikde nevedl. Otevřená nápověda v pohovoru se nezaznamenala a výzva počítala „uznáno vámi“ jako správně. |
| Z21 | P2 | Odkrytá kartička se po reloadu zase zakryla. |
| Z03, Z04 | P0, P2 | Potvrzeno v kódu: zápis neověřoval, co je mezitím uložené. |

Bez závady už před opravou: dvojklik a opakovaný Enter odpověď dvakrát nezapočítaly; import, při kterém selhal zápis, nechal pokrok beze změny; export → nový profil → import dal shodná data.

**Opravené příčiny:**
1. **Tah lekce.**
   - Odpověď se uloží v okamžiku kontroly (`lesson.pending`).
   - Každá akce nese ID karty a pořadí tahu, takže opožděná nebo opakovaná akce nic nezmění: dvojklik, Enter, nové vykreslení Reactu ani druhá karta.
   - Výsledek na obrazovce se skládá z uložené odpovědi: reload i návrat ukážou totéž.
   - Povolená hodnocení plynou z výsledku kontroly, po chybě a po „Nevím“ je jen „Znovu“. (Z16, Z21)
2. **Ukončení lekce.** Při ukončení nebo začátku nové lekce se odevzdaná chyba započítá jako „Znovu“ s časem odevzdání. Neohodnocená správná odpověď ani odkrytá kartička se nezapočítají a karta zůstane na řadě.
3. **Statistiky** (schéma 5). (Z20)
   - Každá lekce se započítá jednou, když skončí; dokončené a ukončené dřív zvlášť.
   - Přesnost prvního pokusu počítá jen odpovědi, které zkontrolovala aplikace. Vlastní hodnocení kartiček je zvlášť.
   - Nápověda v pohovoru a odhalené řešení jsou ve výsledku označené. Kritéria pohovoru jsou nadepsaná jako sebehodnocení.
4. **Úložiště.** (Z03, Z04, Z18)
   - Načtení nejdřív ověří obálku dat a karty. Teprve pak starší verzi převede v paměti, celou ji ověří a nic nezapíše.
   - Před prvním zápisem převedených dat uloží původní text zvlášť (`cloud-admin-deutsch-at:backup`).
   - Každý zápis ověří revizi, kterou karta naposledy četla. Když se mezitím změnila, nezapíše nic a karta oznámí zastaralý stav.
   - Data novější verze nepřepíše.
5. **Jedna zapisující karta** přes Web Locks API. (Z17)
   - Ostatní karty jsou jen pro čtení a ukazují uložený stav.
   - Zápis převezmou samy po zavření nebo pádu zapisující karty, nebo hned tlačítkem „Pracovat v této kartě“.
6. **Chyby úložiště v rozhraní.** (Z19, Z05, část Z06)
   - Bannery nabízejí export aktuálního stavu.
   - Chyba vykreslení ukáže záchrannou obrazovku.
   - Nastavení ukazuje stav trvalého uložení.
7. **Počty na Dnes** a výběr karet do lekce počítá jedna funkce (`todayPlan`).

**Nalezeno a opraveno během etapy:**
- **Z22 (P1, jen vývojový server):** v `npm run dev` zůstala i jediná karta jen pro čtení a trénink nešel spustit. React StrictMode tam spouští efekty dvakrát a zámek přidělený až po ukončení prvního efektu se nikdy neuvolnil. Teď ho karta v takovém případě hned vrátí. Pokrývá to unit test a průchod na dev serveru (předtím 7/11 kroků, teď 11/11).
- Původní data převedená z verze 1.0 nabídlo Nastavení až po reloadu. Teď je nabídne hned po prvním zápisu.

**Pravidla, která uvidíte.** Najdete je na Dnes → „Co se ukládá a kdy“, v bannerech a v Nastavení → Statistiky.
- **Uložení odpovědi:** odpověď se uloží při „Zkontrolovat“, „Nevím“ nebo „Odkrýt řešení“. Po reloadu nebo návratu do lekce uvidíte stejný výsledek a karta čeká na hodnocení; odpovědět znovu nejde.
- **Rozepsaná odpověď:** rozepsanou a ještě nezkontrolovanou odpověď reload nezachová; nic se nezapočítá.
- **Hodnocení** se uloží hned a jen jednou.
- **Chyba a odhalené řešení** se počítají jako „Znovu“, i když lekci ukončíte dřív nebo začnete novou.
- **Rozpracovaná lekce:** dokončíte ji týž den, od dalšího dne se uzavře.
- **Víc karet prohlížeče:** pokrok upravuje jedna karta. Ostatní mají banner „Tato karta je jen pro čtení“ s tlačítkem „Pracovat v této kartě“.
- **Zastaralý stav:** karta se zastaralým stavem to oznámí. Nastává v prohlížeči bez Web Locks, nebo když data uložila novější verze. Banner nabídne „Načíst aktuální stav“ (u novější verze „Obnovit stránku“) a export.
- **Selhání zápisu:** banner nabídne „Zkusit znovu uložit“, „Stáhnout export aktuálního stavu“ a „Pokračovat bez ukládání“.
- **Statistiky** v Nastavení:
  - dokončené lekce a lekce ukončené dřív;
  - přesnost prvního pokusu (psaní a gramatika);
  - vaše hodnocení kartiček;
  - sebehodnocení v pohovoru s počtem pokusů s nápovědou.

  Počítají se od převodu na schéma 5, dřívější studium ne.

**Doklady.** Pocházejí z E2E na produkčním buildu. Snímky jsem předal v konverzaci, v repu nejsou.
- Obnova lekce po reloadu: scénář `lesson_state`, snímek `s7-01-reload-after-check.png`.
- Obnova exportu v novém profilu prohlížeče: scénář `export_new_profile`, snímek `s7-02-import-restored.png`.
- Zvládnutí chyby zápisu: scénář `write_failure`, snímek `c02-write-failed.png`.

## Etapa 6: audit a opravy (2026-11-11)

- **Umístění:**
  - projekt je v mém cloudovém pracovním prostoru v `/home/claude/cloud-admin-deutsch-at/`;
  - složka není git repozitář (`git status`: *not a git repository*), repo založíte sami podle kroků níže;
  - na GitHubu (v repozitářích, které tato relace vidí) projekt není a ve složkách `Projects` a `Downloads` vašeho počítače není jeho rozbalená kopie (vidím jen názvy podsložek), takže žádné rozpracované změny nebylo potřeba slučovat.
- **Audit:** 32 požadavků R01–R32 v `docs/RELEASE_CHECKLIST.md`: 23 ověřeno, 3 čekají na ověření, 4 chybí nebo nefungují, 2 jsou zčásti hotové a zčásti chybí nebo čekají.
- **Opraveno:**
  - **Z01 (P1):** poškozená procentová sekvence v adrese (`#/slovnik/%E0%A4%A`, `#/pohovor/%`) shodila celou aplikaci do prázdné stránky, i po reloadu. Router teď takový úsek nechá, jak je napsaný, a stránka ukáže „Položka nenalezena.“ nebo „Pohovor nenalezen.“ s odkazem zpět.
  - **Z02 (P2):** `index.html` otevřený z disku nebo bez JavaScriptu zůstal bílý. Teď po 3 s napíše česky a německy, jak aplikaci spustit; README to vysvětluje.
- **Popsáno pro další etapy:**
  - **Z03 (P0, zatím skrytá):** starší záložka přepíše data novější verze. Opravit v etapě 7, dřív než se poprvé změní schéma, a před zveřejněním.
  - **Z04–Z15 (P2):** přehled v `docs/RELEASE_CHECKLIST.md`, kap. 15.

## Plán E0–E10 (původní realizační plán)

- [x] E0 — Realizační plán a stav projektu
- [x] E1 — První použitelná verze (zahrnula i E2, E3, E4.3 a E6.1–E6.3)
- [x] E2 — Datové jádro (hotovo v E1; lekce s rozcvičkou přesunuta do E4.4)
- [x] E3 — Trénink: kartičky a psaní (hotovo v E1)
- [x] E4 — Gramatika, výzva a rozšíření obsahu (**E4.4 lekce s rozcvičkou B1 zbývá**, viz O14)
- [x] E5 — Pohovor (**E5.6 pohovorová otázka na konci lekce** čeká na E4.4, viz O20)
- [ ] E6 — Slovník (zbývá kontext lekcí a filtr stavu)
- [x] E7 — Export, import, nastavení: export, import, smazání pokroku, jazyk rozhraní a předčítání hotovo (v1.0), trvalé uložení a statistiky (etapa 7); zbývá připomínka zálohy, délka tréninku a tmavý režim (O05, O10)
- [ ] E8 — Obsah I: technická témata (rozšířeno v E4 a v etapě 8; plný rozsah až po dokončení této verze, D86)
- [ ] E9 — Obsah II: provoz, pohovor a Rakousko (rozšířeno v E4, E5 a v etapě 8; plný rozsah až po dokončení této verze, D86)
- [x] E10 — Finální kontrola a příprava publikace (v1.0); licence a samotná publikace zbývají na vás

## Dokončeno ve verzi 1.0 (portfolio)

- **Prohlídka očima nového návštěvníka a opravy:**
  - úvod pro první návštěvu na stránce Dnes;
  - vysvětlení, proč je nových karet méně než všech (psaní se odemkne po první kartičce);
  - lekce ukončená bez hodnocení už nehlásí „Bez chyb“ a nemá červenou nulu;
  - Slovník převezme hledání z adresy i při odkazu „Slovník“ nebo zpět/vpřed (dřív zůstal starý filtr);
  - na 320 px přetékalo slovo *Nachrichtenablaufverfolgung* z příkladu ve slovníku – opraveno pro všechny dlouhé složeniny;
  - popis stránky v `index.html` zmiňuje pohovor.
- **Pokrok a záloha** (Nastavení):
  - vysvětlení, že pokrok je jen v tomto prohlížeči na tomto zařízení a export slouží k přenosu a záloze;
  - export do verzovaného JSON;
  - import s úplnou kontrolou formátu, verzí a hodnot: neplatný soubor odmítne s důvodem a nic nezmění, platný ukáže souhrn a nahradí pokrok až po potvrzení;
  - smazání s vlastním potvrzením, které odstraní jen klíč aplikace.
- **Německé rozhraní pro portfolio demo:**
  - přeložená navigace, tlačítka, systémové stavy, nastavení, chybové hlášky a nápovědy;
  - přepínač CZ/DE v záhlaví i v Nastavení;
  - výchozí zůstává čeština; české překlady a zadání CZ → DE zůstávají jako výukový obsah, označené `lang="cs"`.
- **Skripty a testy:** cílené skripty `test:answers`, `test:scheduler`, `check:content`, `test:reload`, `test:import`. Nové testy: export a odmítnutí neplatného importu (8), obnova po reloadu a smazání jen vlastního klíče (5), německé texty (4), adresy (3), verze (1), migrace na schéma 4.
- **GitHub Pages:**
  - `ci.yml` kontroluje pull requesty a push do `main`;
  - `deploy.yml` se spouští ručně;
  - React je ve vlastním chunku, žádný chunk nemá přes 500 kB;
  - ověřeno otevření a reload všech pohledů pod podcestou, pod jiným názvem repa i v kořeni domény.
- **README a repozitář:**
  - anglický README pro náboráře a vývojáře se dvěma skutečnými screenshoty s ilustračními daty;
  - český návod přesunutý do `docs/README.cs.md`;
  - `.gitignore` rozšířený o syrové kopie úložiště, `.env`, výstupy testů a coverage;
  - kontrola obsahu repa a citlivých údajů (výsledky níže).
- **Verze 1.0.0** (`package.json`, `src/version.ts`, schéma dat 4).

## Obsah: skutečné počty

Aktuální počty podle druhu, úrovně, jevu, typu úlohy a tématu jsou v kapitole „Etapa 8 → Počty položek“ (výstup `npm run stats:content` z 2026-11-12): **150 položek**, 225 karet, 34 gramatických úloh, 3 případy výzvy a 4 pohovory se 14 hlavními a 14 doplňujícími otázkami, 29 fakty k nahrazení a 42 odkazy do slovníku.

**Bloky ze zadání:**

| Blok | Témata | Položek |
|---|---|---|
| 1 představení a přechod do cloudu | `intro` | 10 |
| 2 identity, skupiny, práva, MFA, on/offboarding | `identity` + `access` | 23 |
| 3 Microsoft 365, Azure, Windows, PowerShell, rutinní provoz | `m365` + `azure` + `windows` + `powershell` | 43 |
| 4 VPN, DNS, incident, diagnostika, eskalace, předávka | `network` + `incidents` + `handover` | 32 |
| 5 komunikace, prioritizace, dostupnost, rakouské prostředí | `communication` + `career` + `austria` | 42 |
| 6 gramatika | napříč tématy | 34 úloh |

## Jak rozšířit sadu

Podrobně v [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md), v kostce:

1. Položku zapište na konec `src/content/items/<téma>.ts` s dalším volným ID (`v` slovo nebo výraz, `s` věta, `g` gramatická úloha). Případ výzvy patří do `src/content/challenges.ts`, pohovor a jeho otázky (`<téma>-i-<NNN>`) do `src/content/interviews.ts`.
2. Nové ID přidejte do `src/content/releasedIds.ts` (`RELEASED_IDS`, u otázek pohovoru `RELEASED_QUESTION_IDS`).
3. `npm run check:content` – opravte nálezy.
4. Ruční průchod: vazba a pády, rod, plurál, velká písmena, přirozenost celé věty, přirozená čeština, názvy technologií; u vzorů pohovoru, že nevymýšlejí odpovědnosti a každý osobní fakt je mezi fakty k nahrazení.
5. `npm run stats:content` – aktualizujte počty v tomto souboru.

## Ruční revize obsahu v E4: nalezené a opravené chyby

Prošel jsem všech 135 položek a 3 případy výzvy. Opravil jsem:

| Kde | Problém | Oprava |
|---|---|---|
| `identity-g-002`, `m365-g-005` | mezera připouštěla i gramaticky správný neurčitý člen (*eines*, *einer*), který by se neuznal | zadání „Doplňte **určitý** člen“ |
| `network-g-001` | „Die VPN-Verbindung bricht ab“ neodpovídá prošlému certifikátu (spojení se vůbec nenaváže) | „kommt nicht zustande“ |
| `network-g-002` | zdvojené „noch einmal neu aufbauen“ | „noch einmal aufbauen“ |
| `m365-g-001` | méně přirozené „Habe ich richtig verstanden, dass …“ | „Habe ich Sie richtig verstanden, dass …“ |
| `m365-g-004` | věta o blokované doméně zákazníka nesouhlasila s výzvou (blokované byly všechny externí e-maily) | „… weil der Filter externe E-Mails fälschlich blockiert hat“ |
| `access-v-004` | příklad byl doslova řešením úlohy `access-g-003` | nový příklad „Zugriffsberechtigungen vergeben wir ausschließlich über Gruppen.“ |
| `intro-v-003` | příklad vymýšlel odpovědnost („übernehme ich zunehmend Verantwortung …“) | formulace přání do nové role |
| výzva `mfa-new-phone` | situace už obsahovala „od rána“, na co se ptá první krok | údaj odstraněn |
| `powershell-v-001` (E1) | „liest die Benutzer aus einer CSV-Datei“ bez předpony | „liest … ein“ (shoda s úlohou `powershell-g-001`) |
| `powershell-v-002`, `austria-v-004` (E1) | příklady tvrdily vymyšlený úspěch („haben wir … automatisiert“, „Heuer haben wir die Migration … abgeschlossen“) | neutrální věty |
| `intro-v-001`, `intro-s-001` (E1) | vzorová zkušenost nebyla označená | `illustrative: true` |
| `identity-s-001`, `network-v-003` (E1) | starý název produktu; chyběla kolokace „eine Störung eingrenzen“ | Microsoft Entra Connect Sync / Cloud Sync; překlad a poznámka doplněny |

Při kontrolách se ukázaly dvě chyby mimo text, obě jsou opravené a pokryté testem:

- Na 360 px přetékaly dlouhé složeniny (*Authentifizierungsmethoden*) z rámečku zpětné vazby. Týkalo se to i psaní z E1.
- Kontrola soukromí neprocházela texty výzev, takže zakázaný výraz jen v situaci výzvy by prošel.

## Rozhodnutí

| ID | Rozhodnutí | Původ |
|---|---|---|
| D01 | Samostatná složka a repo `cloud-admin-deutsch-at/`, nevnořené do jiného Git repa | zadání |
| D02 | React 19.3, TypeScript 7.0, Vite 8.3, Vitest 5.1, oxlint 1.91; verze zafixované v `package-lock.json` | zadání + E1 |
| D03 | Lint přes oxlint (typescript-eslint nepodporuje TypeScript 7) | E0 |
| D04 | E2E kontroly (Playwright, axe-core) jen v mém prostředí, mimo repo | E0 |
| D05 | `engines`: Node ^22.12, ^24 nebo ≥ 26; `.nvmrc` a CI používají Node 26 (Active LTS) | E1 |
| D06 | Vlastní hash router a `base: './'`: funguje pod libovolným názvem repa, reload nezpůsobí 404 | E0 |
| D07 | Obsah jako TypeScript moduly v `src/content/`; integritu a soukromí hlídá `check:content` včetně lokálního seznamu zakázaných výrazů | E0 + E1 |
| D08 | **Rozšířeno v E4:** stabilní ID `<téma>-<v\|s\|g>-<NNN>` a karet `<ID>:flashcard` / `<ID>:write` / `<ID>:grammar`; nikdy se nemění ani nepoužijí znovu | E0 + E4 |
| D09 | UI česky, obsah v rakouské spisovné němčině, otázky v Sie; kód, názvy souborů a commity anglicky | zadání |
| D10 | Stupně 0–5, hodnocení Znovu / Těžké / Umím. Umím = +1 stupeň a interval 3/7/14/30/60 dní, Těžké = −1 a zítra, Znovu = 0, ještě v lekci a zítra. Pauza stupeň nesnižuje. | zadání E1 |
| D11 | Bez streaků, kvót a kalendáře; lekce má nejvýše 10 karet (volba délky odložena do E7.3) | zadání |
| D12 | Hotovo = splněné kritérium: „Nevím“ i neuznaná chybná odpověď = Znovu; prodloužit interval smí jen první hodnocení karty v lekci, když je nová nebo na řadě. Od etapy 7 to vynucuje doména (D65). | E0 + E1 |
| D13 | **Změněno v etapě 7:** `localStorage`, klíče s předponou `cloud-admin-deutsch-at:`; pokrok pod `…:progress`, `schemaVersion: 5` s migrací z verzí 1–4 (D69); validace whitelistem; nečitelná či novější data se bez výslovné volby nepřepíší | zadání + E4 + E5 + etapa 7 |
| D14 | **Hotovo ve v1.0:** export a import podle kap. 8, jen nahrazení (viz D49) | E0 + zadání v1.0 |
| D15 | Vlastní příklady jen v prohlížeči a v exportu; exportní soubory v `.gitignore` | E0 |
| D16 | Bez rozpoznávání řeči a bez „AI hodnocení“ | E0 |
| D17 | Nejdřív funkce nad startovním obsahem, hromadný obsah až v E8–E9. **Změněno v etapě 8 (D86):** rozšíření o další desítky položek až po dokončení této verze. | E0 + etapa 8 |
| D18 | **Změněno ve v1.0:** kontroly v `ci.yml` pro každý pull request a push do `main`; nasazení na GitHub Pages jen ručně (`deploy.yml`, `workflow_dispatch`), automatické nasazení lze zapnout podle komentáře | E0 + zadání v1.0 |
| D19 | Karta = položka × cvičení. Psaní slova se v tréninku odemkne po první kartičce, v lekci je z položky jen jedna karta. | E1 |
| D20 | Termíny jako místní kalendářní den `YYYY-MM-DD`; Dnes přepne datum o půlnoci bez reloadu | zadání E1 |
| D21 | Kontrola odpovědí: NFC, mezery, uvozovky; velikost písmen a interpunkce podle cvičení; ä/ö/ü/ß se nikdy neslučují, jiný zápis jen jako výslovná varianta; vysvětlení jen když pokryje celý rozdíl. **Doplněno v etapě 8:** volný překlad (D78), interpunkce jako kosmetická odchylka (D79). | zadání E1 + etapa 8 |
| D22 | Nedokončená lekce: hodnocení se ukládají hned; dokončit ji lze týž den i po reloadu; lekce přes půlnoc pokračuje; otevřená lekce z dřívějšího dne se uzavře souhrnem. **Doplněno v etapě 7:** ukládá se i odevzdaná odpověď před hodnocením (D64), ukončení viz D66. | zadání E1 |
| D23 | Dokončená lekce zůstává uložená do začátku další lekce (`#/lekce` ukáže poslední souhrn) | E1 |
| D24 | Vzhled: papír #F3F5F8, inkoust #161A2C, jediný akcent královská modř #2343B8, červená #B4232A jen pro chyby (vždy i s textem nebo značkou); Literata pro němčinu, Atkinson Hyperlegible Next pro UI, lokálně v buildu | zadání E1 |
| D25 | Texty UI v `src/i18n/cs.ts` odděleně od dat; Pohovor v navigaci od E5 (4 položky), Nastavení v patičce | zadání E1 + E5 |
| D26 | Workflow s nejmenšími oprávněními, bez `configure-pages`; `checkout@v7`, `setup-node@v7`, `upload-pages-artifact@v5`, `deploy-pages@v5` | E1 |
| D27 | Smazání a obnova dat se potvrzují přímo v banneru, ne dialogem prohlížeče. **Změněno v etapě 9 (D91):** potvrzení v modálním dialogu aplikace, stále ne dialogem prohlížeče. | E1 |
| D28 | Nové téma `communication` na 2. místě studijní cesty (reakce v rozhovoru, komunikace s uživateli a kolegy, prioritizace, dostupnost); `incidents` se jmenuje „Incidenty a eskalace“. Pořadí témat lze měnit bez vlivu na pokrok. | zadání E4 |
| D29 | Gramatická úloha: 4 typy (`gap`, `choice`, `order`, `transform`), 5 jevů, povinné `promptCz` (ohraničuje odpověď) a `explanationCz`; `de` je vyřešená věta a kontrola ověří, že ji úloha dává | zadání E4 |
| D30 | Kontrola úloh: doplnění hodnotí velikost písmen (kromě mezery na začátku věty), interpunkci ne; přepis jako věta; řazení přesně; výběr podle indexu. „Moje odpověď je také správná“ jen u přepisu, ostatní typy mají pevná řešení. | E4 |
| D31 | Výzva = lekce druhu `challenge` nad běžnými kartami: jeden pokus na krok, hodnocení se plánují jako jinde. Přesnost prvního pokusu: **změněno v etapě 7 (D68)**. Stopky volitelné (`timed`), nic neblokují. | zadání E4 |
| D32 | Migrace schématu po krocích (`MIGRATIONS[n]`: n → n + 1); načtení nic nezapisuje, nová verze se uloží s první změnou; karty se migrací nemění | E4 |
| D33 | Seznam vydaných ID `src/content/releasedIds.ts`: test selže, když vydané ID zmizí bez `RETIRED_IDS` nebo když nové ID chybí v seznamu | zadání E4 |
| D34 | `illustrative: true` u vzorových zkušeností, štítek a výzva k vlastnímu příkladu všude, kde se položka zobrazí; příklady nevymýšlejí odpovědnosti ani úspěchy | zadání E0 + E4 |
| D35 | Čeština u gramatické úlohy až po odpovědi; situace výzvy česky jen na vyžádání | zadání |
| D36 | Procvičování: cvičení „Gramatika“ s filtrem jevu; rychlé opakování chyb dál zahrnuje všechna cvičení zvoleného tématu a úrovně. Slovník: filtr `druh` v adrese. | E4 |
| D37 | `stats:content` přes Vitest (`--mode stats`): bez další závislosti, tabulky v Markdownu | E4 |
| D38 | Pravidla soukromí platí i pro texty výzev | E4 |
| D39 | Pohovor = 4 smyšlené scénáře v `src/content/interviews.ts`, 3–4 otázky s ID `<téma>-i-<NNN>` (vydaná ID v `RELEASED_QUESTION_IDS`). Druh otázky určuje stavbu nápovědy i vzoru: `personal` (výchozí bod → zkušenost a důvod → cíl), `experience` = STAR, `technical` = upřesnit problém → ověřit hypotézu → bezpečný další krok → komunikace. | zadání E5 |
| D40 | Tok otázky: otázka → doplňující otázka → teprve potom vzor „Ilustrační“, fakta k nahrazení, vzor k doplňující otázce, 2–3 hesla ze slovníku, formulace, vlastní příklad a sebehodnocení. Fáze se ukládá, takže pohovor přežije reload i odchod do slovníku. | zadání E5 |
| D41 | Sebehodnocení: 4 kritéria × Ano / Částečně / Ne s konkrétním popisem u každé otázky; uložit lze jen úplné. „Zkusit znovu“ uloží úplné sebehodnocení jako pokus a spustí otázku znovu (s další doplňující otázkou, pokud jich otázka má víc). U každé otázky se drží posledních 10 pokusů. | zadání E5 |
| D42 | Časovač 60 / 75 / 90 s (výchozí délka z otázky, u doplňující otázky 60 s): spustit, pozastavit, pokračovat, vynulovat; po vypršení jen zpráva, nikdy neblokuje. Čas se počítá z hodin (`Date.now()`), ne z počtu tiků. | zadání E5 |
| D43 | Předčítání přes `speechSynthesis` jen na kliknutí. Hlas: zvolený v Nastavení → de-AT → de-DE → jiný de-*, jiný jazyk nikdy. Na hlasy se čeká nejvýš 1 s (`voiceschanged`). Stav: připravuji / přehrávám (hlas) / dokončeno / zastaveno / bez německého hlasu / chyba / nepodporováno. Zrušení při změně fáze, odchodu ze stránky a `pagehide`; když prohlížeč nevyšle `onend`, stav dorovná kontrola enginu. | zadání E5 |
| D44 | Základní režim bez mikrofonu: žádné nahrávání, rozpoznávání řeči ani automatické hodnocení výslovnosti či projevu (navazuje na D16). Zpětná vazba = vzor + checklist. | zadání E5 |
| D45 | Pohovor se nezapojuje do plánovače karet. Místo plánu opakování ukáže souhrn „Na co se zaměřit“ (kritéria s „Ne“ a „Částečně“, nejslabší první) a přehled datum posledního procvičení. | E5 |
| D46 | Vlastní ověřitelný příklad u každé otázky: text do 2 000 znaků a úroveň doložení (životopis, praxe, lab nebo kurz, odhad, neověřeno). Jen v prohlížeči, s upozorněním nepsat jména a interní údaje; příště se ukáže v nápovědě. | zadání E0 + E5 |
| D47 | Schéma 3: `interview` (`attempts`, `ownExamples`, `session`) a `prefs.speech`; migrace 2 → 3 jen doplní výchozí hodnoty. Najednou je otevřený jeden pohovor. **Změněno v etapě 7:** zapisuje jen jedna karta prohlížeče (D72). | E5 |
| D48 | Heslo otevřené z pohovoru vede „Zpět k pohovoru“ (do návštěvy Slovníku), heslo ukazuje „Použito v pohovoru“. Při každé nové otázce či fázi se fokus přesune na její nadpis; stránky pohovoru si fokus řídí samy. | E5 |
| D49 | Export = verzovaný JSON `{ format, formatVersion: 1, appVersion, contentVersion, exportedAt, data }`, kde `data` je celý uložený stav. Import: nejvýš 2 MB, kontrola formátu a verzí, data stejnou validací whitelistem jako při čtení z prohlížeče; jediná neplatná hodnota odmítne celý soubor s důvodem. Souhrn a potvrzení před nahrazením, sloučení není. Od etapy 7 export obsahuje i statistiky a revizi a import exportu verze 1.0 (schéma 4) se převede. | zadání v1.0 |
| D50 | Smazání pokroku (v Nastavení i „Smazat a začít znovu“ v banneru) nechá ostatní data prohlížeče; další změna zapíše nový stav. **Změněno v etapě 7 (D73):** odstraní všechny klíče aplikace. | zadání v1.0 |
| D51 | Německé rozhraní: `src/i18n/de.ts` stejného typu jako `cs.ts` (tvar hlídá TypeScript, nepřeložené texty test). Volba v nastavení i přepínačem CZ/DE v záhlaví, uložená v `prefs.uiLanguage`; výchozí čeština. Názvy témat, výzev a pohovorů v jazyce rozhraní; český výukový obsah má `lang="cs"`, `<html lang>` se přepíná. | zadání v1.0 |
| D52 | Schéma 4: `prefs.uiLanguage` (`cs`/`de`), migrace 3 → 4 doplní češtinu. | v1.0 |
| D53 | React ve vlastním chunku `vendor` (žádný chunk nad 500 kB, lepší cache při změně obsahu); `base: './'` a hash routy zůstávají, takže build funguje pod libovolnou podcestou i v kořeni domény. | v1.0 |
| D54 | Dlouhá slova: `overflow-wrap: break-word` v obsahu stránky a `hyphens: auto` u německého textu. **Změněno v etapě 9 (D90):** studijní text prohlížeč nedělí. | v1.0 |
| D55 | README v angličtině pro náboráře a vývojáře, český návod v `docs/README.cs.md`; screenshoty s ilustračními daty v `docs/screenshots/`. | zadání v1.0 (O09) |
| D56 | Verze 1.0.0; `APP_VERSION` v `src/version.ts` hlídá test proti `package.json`. | v1.0 |
| D57 | První návštěva: úvod na stránce Dnes (zmizí s prvním pokrokem). Pod počítadly vysvětlení zamčených karet psaní. Lekce ukončená bez hodnocení má vlastní krátký souhrn místo „Bez chyb“. | v1.0 |
| D58 | Slovník převezme hledání z adresy i při navigaci uvnitř slovníku (odkaz „Slovník“, zpět/vpřed); psaní adresu jen nahrazuje. | v1.0 |
| D59 | Cílené skripty `test:answers`, `test:scheduler`, `test:reload`, `test:import` a `check:content` vedle `npm test`; E2E kontroly zůstávají mimo repo (D04). | zadání v1.0 |
| D60 | Úsek adresy s poškozenou procentovou sekvencí zůstane, jak je napsaný (`segment()` v `src/app/router.ts`), a vede na stránku „nenalezeno“. Adresa nesmí shodit aplikaci. | etapa 6 (Z01) |
| D61 | `index.html` má v `#root` zprávu, jak aplikaci spustit. Aplikace ji při startu nahradí; viditelná je až po 3 s (jen CSS, funguje i bez JavaScriptu) a nahrazuje dřívější `<noscript>`. | etapa 6 (Z02) |
| D62 | Přehled ověření je `docs/RELEASE_CHECKLIST.md`: požadavky R s ověřením a výsledkem, závady Z s dopadem P0–P2, závislostmi a etapou. Tento soubor drží rozhodnutí, výsledky kontrol a další krok. | zadání etapy 6 |
| D63 | Číslo verze zůstává 1.0.0, dokud nic není zveřejněné; číslo první veřejné verze určí etapa 11. Předávané zipy nesou číslo etapy. | etapa 6 |
| D64 | Tah lekce: odpověď se uloží v okamžiku kontroly jako `lesson.pending` (karta, pořadí tahu = počet hodnocení v lekci, výsledek kontroly, odpověď, čas). Každá akce nese ID karty a tah; akce k jinému tahu, opakované odevzdání ani hodnocení bez odevzdání nic nezmění. Výsledek na obrazovce se skládá z uložené odpovědi. Rozepsaný text se neukládá. | etapa 7 (Z16, Z21) |
| D65 | Povolená hodnocení podle výsledku kontroly: chyba a „Nevím“ → jen Znovu; správně, povolená varianta a „uznáno vámi“ → Těžké nebo Umím; kartička a porovnání se vzorem → všechna tři. | etapa 7 |
| D66 | Ukončení lekce i začátek nové: odevzdaná chyba nebo „Nevím“ se započítá jako Znovu s časem odevzdání. Neohodnocená správná odpověď a odkrytá kartička se nezapočítají, karta zůstane na řadě. | etapa 7 |
| D67 | Statistiky `stats` (schéma 5). Lekce se započítá jednou, když skončí: zvlášť dokončené a ukončené dřív, lekce bez hodnocení vůbec. Opakování hlídá ID lekce (pamatuje si posledních 30). Přesnost prvního pokusu = (správně + povolená varianta) / všechny první pokusy zkontrolované aplikací; „uznáno vámi“ a odhalené řešení se uvádějí zvlášť. Vlastní hodnocení kartiček a porovnaných vět je zvlášť. Pohovor jen jako sebehodnocení s počtem pokusů s nápovědou. Počítá se od převodu na schéma 5. | etapa 7 (Z20) |
| D68 | Výzva: přesnost prvního pokusu počítá jen správně a povolenou variantu; „uznáno vámi“ a „řešení odhaleno“ jsou ve výsledku zvlášť, odhalené řešení má na stopě značku „?“ (mění D31). | etapa 7 (Z20) |
| D69 | Schéma 5: `rev`, `lesson.pending`, `stats`, `interview.session.hinted`, `attempt.hint`. Pořadí čtení: JSON → novější verze odmítnuta → obálka a karty → migrace v paměti → úplná validace. Načtení nic nezapisuje. | etapa 7 (Z18) |
| D70 | Revize zápisu: zápis očekává revizi, kterou karta naposledy četla (data před schématem 5 mají revizi 0). Jinak nezapíše nic a karta ukáže zastaralý stav: změněno, smazáno, nebo novější verze. | etapa 7 (Z03, Z04) |
| D71 | Původní data před aktualizací: před prvním zápisem převedených dat se původní text uloží pod `cloud-admin-deutsch-at:backup` s datem a verzí schématu. Nastavení je nabídne ke stažení, k obnově (stejná kontrola, souhrn a potvrzení jako import) a ke smazání. Zůstanou do smazání nebo resetu. | etapa 7 (Z18) |
| D72 | Jedna zapisující karta přes Web Locks API (zámek `cloud-admin-deutsch-at:writer`). První karta zapisuje, další jsou jen pro čtení: ukazují uložený stav a čekají ve frontě. Zápis převezmou samy po zavření nebo pádu zapisující karty, nebo hned tlačítkem „Pracovat v této kartě“ (`steal`). Záznam v `localStorage` se jako zámek nepoužívá. Bez Web Locks (staré prohlížeče, `http://` adresa z jiného zařízení) zapisuje každá karta a chrání jen revize (D70). | etapa 7 (Z17) |
| D73 | Reset odstraní všechny klíče s předponou `cloud-admin-deutsch-at:` (pokrok i původní data) a nic jiného (mění D50). | etapa 7 |
| D74 | Chyby úložiště hlásí rozhraní a nabídne export aktuálního stavu: nedostupné úložiště, práce bez ukládání, selhání zápisu, zastaralý stav. U nečitelných dat zůstává „Stáhnout uložená data“. | etapa 7 (Z19) |
| D75 | Záchranná obrazovka při chybě vykreslení (`ErrorBoundary`): vysvětlení, „Zpět na Dnes“ a „Načíst znovu“. Pokrok se nemění, přechod na jinou adresu ji zruší. | etapa 7 (Z05) |
| D76 | Nastavení ukazuje, zda prohlížeč data uchová trvale, a nabídne žádost (`navigator.storage.persist()`). Připomínka zálohy se přesouvá do etapy 8 k ostatním nastavením. | etapa 7 (Z06 zčásti) |
| D77 | Počty na Dnes a skladbu lekce počítá jedna funkce (`todayPlan`) ze stejné dostupnosti karet. | etapa 7 |
| D78 | Vyhodnocení psaní podle cíle úlohy. Jednoznačná úloha (`write.mode: 'auto'`: slovo, výraz, sloveso, podstatné jméno; gramatické úlohy) uzná jen definované odpovědi a varianty. Věta je vždy volný překlad (`compare`): shoda se vzorem nebo variantou = správně (`correct`, `variant`); rozdíl jen v přehlásce, ß nebo velkém písmenu = chyba (`incorrect`), protože pravopis nemá správnou alternativu; jiný rozdíl = `compared` s vlastním hodnocením Znovu / Těžké / Umím. Obrazovku výsledku určuje uložený výsledek, takže dřív uložená odpověď se zobrazí podle svého výsledku. Schéma beze změny. | zadání etapy 8 |
| D79 | Interpunkce je kosmetická odchylka, ne chyba v procvičovaném jevu: odpověď, která se od uznané liší jen interpunkcí, je správně s poznámkou (`CosmeticNote`) s přesným místem (znak, slovo před ním a za ním). Před spojkou nebo tázacím slovem vedlejší věty doplní pravidlo o čárce. Skutečná chyba se diagnostikuje bez interpunkce a poznámka stojí zvlášť. Platí pro psaní, doplnění a přepis. | zadání etapy 8 |
| D80 | Diagnóza slovosledu jmenuje až 3 slova, která stojí jinde (LCS proti řešení). U řazení se chybné pořadí porovná s nejbližším povoleným pořadím. | zadání etapy 8 |
| D81 | Porovnání se vzorem: nejbližší vzor, rozdílná slova označená neutrálně (tečkované podtržení, pro čtečky „jinak než ve vzoru“, ne „chyba“), rozdíly formulované jako otázka k zamyšlení, další správné formulace a pokyn k vlastnímu hodnocení. | zadání etapy 8 |
| D82 | Výběr: povinné `whyCz` – u každé chybné možnosti jedna věta, proč je chybná (nejvýše 200 znaků), u správné `''`; hlídá validace i test obsahu. Po odpovědi se ukáže důvod u zvolené chybné možnosti a sbalený seznam ostatních chybných možností s důvody. | zadání etapy 8 |
| D83 | Režim Poslech (`listen`) jako čtvrtý režim Procvičování. Karta zůstává `<ID>:flashcard`, pokrok se počítá ke kartičce; filtr v nastavení i v lekci smí mít `listen` (rozšířený výčet, schéma 5 beze změny). Přehrání jen tlačítkem, text až s řešením, zastavení tlačítkem, odchodem z karty a `pagehide`. Bez Web Speech API, bez německého hlasu nebo při chybě přehrávání karta ukáže text s důvodem a zůstane u textu, i když hlasy dorazí později. Volba „Nabízet předčítání otázek v Pohovoru“ se Poslechu netýká: ten si volíte výslovně. | zadání etapy 8 |
| D84 | Úroveň B1–C1 je orientační: štítek `LevelChip` s textem pro čtečky „orientační úroveň“ a vysvětlením při najetí myší, filtr „Obtížnost (orientační)“ (DE „Niveau (Richtwert)“). | zadání etapy 8 |
| D85 | Podstatné jméno bez běžného plurálu: `plural: null`, v poznámce „(Obvykle) jen v jednotném čísle“ (test), rozhraní „jen jednotné číslo (bez běžného plurálu)“. Vazba slovesa uvádí relevantní konstrukce s pády, při více významech oddělené středníkem s českým významem v závorce. Tvary a vazba výrazu mají nadpis „Tvary a vazba“. | zadání etapy 8 |
| D86 | Rozsah obsahu této verze: aspoň 80 kvalitních položek, z toho 15 gramatických úloh, prioritní IT témata a 4 pohovory po 3–4 hlavních otázkách. Rozšíření o další desítky položek (původní cíl asi 300, R24) až po dokončení této verze. | zadání etapy 8 |
| D87 | Automatická validace dat a ruční jazyková kontrola se evidují odděleně. Vykání *Sie* hlídá test obsahu (žádné *du, dich, dir, dein, euch, euer*). | zadání etapy 8 |
| D88 | Designové hodnoty v `src/styles/tokens.css`. Patří k nim barvy z D24 (navíc tóny pro najetí a podklady), stupnice písma s poměrem asi 1,2, řádkování a mezery po 4 px. Dál šířky (záhlaví 72 rem, studijní stránka 44 rem, text 40 rem), rámečky, zaoblení, fokus (3 px modrá), dotyk 44 px a trvání 0,18 s. `app.css` jiné barvy nepoužívá. Kontrast je spočítaný z hodnot. | zadání etapy 9 |
| D89 | Šířky stránek: záhlaví, patička a přehledy (Dnes, Slovník) mají až 72 rem, od 64 rem dva sloupce. Lekce, pohovor, heslo a Nastavení mají jeden čitelný sloupec 44 rem. | etapa 9 |
| D90 | Prohlížeč německý studijní text nedělí: zadání, odpovědi, slovník, úlohy a příklady. Velký text dostane `--longest` (počet znaků nejdelšího slova) a pomocí jednotek kontejneru se zmenší tak, aby se slovo vešlo na řádek. Měřeno: Literata 0,50–0,58 em na písmeno. Dělit smí jen text ke čtení, tedy otázky a vzory pohovoru a situace. `overflow-wrap` zůstává jen jako poslední záchrana. Mění D54. | etapa 9 (Z39) |
| D91 | Potvrzení s následky (smazání v Nastavení a v banneru, obnova platných dat, souhrn importu a obnovy) jsou v komponentě `ConfirmDialog`. Je postavená na nativním `<dialog>` a `showModal()`. Fokus začíná na bezpečné volbě, u dlouhého souhrnu na nadpisu. Esc znamená zrušit. Tab nevyjde na stránku za dialogem. Po zavření se fokus vrátí na tlačítko, které dialog otevřelo, jinak na zadané místo. Na telefonu je dialog spodní panel. Klávesové zkratky lekce za otevřeným dialogem nepůsobí. Mění D27. | zadání etapy 9 |
| D92 | Telefon (< 48 rem). Hodnocení a další krok jsou přilepené dole nad navigací. Spodní navigace se schová, dokud má fokus textové pole. `keepInView` 1,5 s po fokusu sleduje `visualViewport`, takže pole i hlavní tlačítko zůstanou nad klávesnicí. `scroll-padding` drží fokus mimo pevné lišty. | etapa 9 (Z30, Z31, Z43) |
| D93 | Na dotykových obrazovkách (`pointer: coarse`) mají ovládací prvky výšku aspoň 44 px. Vědomá výjimka je lišta ä ö ü ß Ä Ö Ü na 360 px: 39 × 44 px, jedna řada nad klávesnicí, nad minimem WCAG 2.5.8 (24 px). | etapa 9 (Z38) |
| D94 | Stav ukládání: Nastavení → Pokrok a záloha začíná řádkem „Stav ukládání“ se značkou ✓ nebo !, při problému s tlačítkem „Zobrazit hlášení“. Když selže zápis, zastará stav karty nebo se v kartě jen pro čtení neuloží změna a hlášení je mimo obrazovku, objeví se nahoře pevné upozornění se „Zobrazit možnosti“ a „Skrýt“. Není to druhá oblast `aria-live`, hlášení samo má `role="alert"`. | zadání etapy 9 (Z37) |
| D95 | Nastavení v pořadí: jazyk ovládání, hlas a předčítání, pokrok a záloha, statistiky. „Jazyk ovládání“ se jmenuje stejně v záhlaví i v Nastavení. | zadání etapy 9 |
| D96 | Dnes: blok „Doporučená lekce“ se skutečnými počty, počet k opakování je zvýrazněný a pod ním je velikost lekce. Rozpracovaná lekce je první, s průběhem. Témata mají vysvětlení. Na širokém displeji je výzva a pravidla vpravo. | zadání etapy 9 |
| D97 | Slovník: aktivní filtry (hledání, téma, obtížnost, druh) jako štítky, každý se zruší zvlášť, od dvou je „Zrušit vše“. Počet výsledků je `aria-live`. Stav bez výsledků má nadpis, důvod a jedno tlačítko. Na telefonu jsou filtry za „Filtry (n)“, na úzkém seznamu jsou úroveň a stav pod slovem. | zadání etapy 9 |
| D98 | Pohovor: tři fáze otázky jako seřazený seznam s `aria-current` a stavem „hotovo“ i v textu. Doplňující otázka má boční pruh a hlavní otázku nad sebou, rozbor horní pruh. | zadání etapy 9 |
| D99 | Hlavička lekce: druh lekce, téma zobrazené karty, pozice, `<progress>` s názvem a „Ukončit lekci“ s vysvětlením. Hodnocení má jednu větu vysvětlení. U kartičky se s otázkou hodnocení přečte i význam. Souhrn: „Zopakovat chyby (n)“ a „Zpět na Dnes“ (dřív „Hotovo“). | zadání etapy 9 |
| D100 | Citovaná němčina v českých poznámkách („einrichten“) dostane `lang="de-AT"`, jen když je jednoznačná. Nesmí obsahovat česká písmena ani česká slova. Musí mít ä/ö/ü/ß, nebo jen slova z německého obsahu aplikace, nebo německé koncovky. Nejisté citace zůstávají česky (`src/lib/quotedGerman.ts`). | etapa 9 (Z45) |
| D101 | Volný překlad: když nejde pojmenovat celý rozdíl, pojmenuje se aspoň slovo, které se od slova ve vzoru liší jen přehláskou, ß nebo velkým písmenem. Velké písmeno na začátku věty se nepočítá. | etapa 9 (Z41) |
| D102 | Stavy prvků. Najetí: modrý okraj, u nebezpečného tmavší červená s podkladem. Stisknutí: posun o 1 px. Nedostupné: 50 % a bez reakce. Fokus: 3 px modrý obrys. Souhrny `<details>` mají jednotnou šipku. Pohyb jen jako odezva na akci, vypnutý podle `prefers-reduced-motion`. | etapa 9 (Z40) |
| D103 | Výsledek, který se objeví po akci (odkrytý význam kartičky, verdikt psaní a gramatiky), se ukáže funkcí `showResult` (`src/lib/keepInView.ts`). Začátek výsledku musí být pod horním okrajem a nad tím, co zakrývá spodek obrazovky: přilepenou lištou karty a spodní navigací. Stránka se posune jen o nutný kus, kde je výsledek vidět, nic se nehne. Nahrazuje `scrollIntoView({ block: 'nearest' })`, které přilepenou lištu neznalo. | etapa 10 (Z46) |
| D104 | Testy v prohlížeči v repozitáři: Playwright Test (`@playwright/test` 1.63.0, přesná verze, jen vývojová) nad produkčním buildem přes `vite preview` pod podcestou `/cloud-admin-deutsch-at/`. Malá sada rizikových průchodů (23 testů); každý test hlídá konzoli, výjimky, nativní dialogy, odpovědi ≥ 400 a cizí servery. Data smyšlená, hlas falešný. Projekty `chromium` a `mobile`, další prohlížeče přes `E2E_BROWSERS`. V CI úloha `e2e` a nepovinná `e2e-other-browsers`. Široký Python průchod (41 scénářů) zůstává mimo repozitář (D04). | zadání etapy 10 |
| D105 | Podmnožiny písma Literata pro cyrilici, řečtinu a vietnamštinu (169 kB) zůstávají v buildu: prohlížeč je podle `unicode-range` nestahuje a odstranění by znamenalo vlastní CSS místo balíčku `@fontsource-variable`. Uživatel stahuje jen latin a latin-ext. | etapa 10 |
| D106 | Závislosti se v etapě 10 neaktualizují: `npm audit` je čistý a žádná oprava novější verzi nevyžaduje (dostupné jsou vite 8.3.8, oxlint 1.94, @vitejs/plugin-react 6.3.0, @types/node 26). Jediná nová je `@playwright/test`. | pravidla etap 6+ |
| D107 | Jediná doporučená verze Node.js je **26 LTS**: v `.nvmrc`, v CI i v nasazení přes `node-version-file` a v README, `docs/README.cs.md` a `docs/QUICKSTART_CS.md`. Node 26 je Active LTS do 27. 10. 2027 a dostává bezpečnostní opravy do 30. 4. 2029 (endoflife.date, 2026-11-12). `engines` zůstává `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0`, shodně s Vitest 5.1 (Vite 8, @vitejs/plugin-react a oxlint chtějí `^20.19.0 \|\| >=22.12.0`). Node 22 a 24 jsou ověřené, ale dostávají jen bezpečnostní opravy, Node 22 do 30. 4. 2027 (O28). | zadání etapy 11 |
| D108 | `.npmrc` s `engine-strict=true`: na nepodporované verzi Node se `npm ci` zastaví hned s `EBADENGINE` a s požadovanou i skutečnou verzí, místo pozdější a hůř čitelné chyby. Ověřeno: Node 20 odmítnut, Node 22, 24 a 26 bez varování. | zadání etapy 11 |
| D109 | Workflows podle aktuální dokumentace Actions: `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-pages-artifact@v5` a `actions/deploy-pages@v5` jsou nejnovější hlavní verze; ukázky v dokumentaci GitHub Pages ještě uvádějí v4. `configure-pages` není potřeba, protože build žádnou cestu z ní nepotřebuje a Pages zapnete v nastavení. **CI** (`pull_request`, push do `main`, ruční spuštění): `npm ci`, lint, typecheck, test, build, testy v Chromiu; Firefox a WebKit nepovinně (`continue-on-error`); nikdy nenasazuje. **Deploy** jen ručně a jen z `PUBLISH_BRANCH` (`main`), jinak hned skončí chybou. Stejný Node a lockfile, kontroly, build, testy v prohlížeči nad tímto buildem, `upload-pages-artifact` z `dist`. Úloha `deploy` má `needs: build`, `pages: write` a `id-token: write` a prostředí `github-pages` s adresou. Souběh `pages` neruší běžící nasazení. Bez cache závislostí. `APP_DIR` pro aplikaci v podsložce, `timeout-minutes` u všech úloh. | zadání etapy 11 |
| D110 | Pages podcesta: nic se nenastavuje. Relativní `base: './'` a hash routování fungují pod libovolným názvem repozitáře, v kořeni domény i na jiném statickém serveru, reload načte jen `index.html`. `import.meta.env.BASE_URL` je `./` a kód ho nepoužívá. Jediné místo pro změnu je `vite.config.ts`: absolutní `base` a `404.html` by byly potřeba jen při přechodu na adresy bez `#`. | zadání etapy 11 |
| D111 | Publikace z této relace: repozitář `BrutusFilip/cloud-admin-deutsch-at`, veřejný, podle vašeho zadání (složka `cloud-admin-deutsch-at`, veřejný repozitář, váš GitHub). Commity mají git identitu relace „Claude <noreply@anthropic.com>“ s podpisem a řádek `Co-Authored-By`, takže v historii není váš e-mail. Další commity pod svým jménem udělejte s adresou `…@users.noreply.github.com`. Přímo do `main`, protože nový repozitář ještě nemá jiný postup ani ochrany. | zadání etapy 12 |
| D112 | Nepovinné úlohy Firefox a WebKit v CI selhaly na předpokladech testů, ne na aplikaci. Opravené jsou testy: meze telefonního testu se berou z velikosti projektu (iPhone 13 ve WebKitu má 390 × 664) a test klávesnice nejde za konec stránky, kde Firefox přesune fokus do svého rozhraní. Úlohy zůstávají nepovinné, rozhodnutí je O30. | etapa 12 |
| D113 | Z48 (tvar slova „karta“ u počtu 1 až 4 ve třech větách) se v etapě publikace neopravuje: nasazený build má zůstat ten ověřený. Oprava je první bod další etapy. | etapa 12 |

## Důležité soubory

| Soubor | Účel |
|---|---|
| `docs/RELEASE_CHECKLIST.md` | stav požadavků, závěrečné ověření V01–V25, závady P0–P2, závislosti, etapy 7 až vydání, lokální ověření |
| `README.md` | anglický přehled: účel, funkce, spuštění, testy, build, architektura, přidání lekce, ukládání |
| `index.html` | šablona stránky se zprávou pro případ, že se aplikace nespustí |
| `src/app/router.ts` | hash adresy, bezpečné čtení úseků adresy |
| `docs/README.cs.md` | český návod (plánování opakování, kontrola odpovědí, pohovor, publikace) |
| `docs/screenshots/today.png`, `docs/screenshots/interview-de-mobile.png` | screenshoty s ilustračními daty |
| `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` | kontroly na pull requestu a pushi do `main` včetně testů v Chromiu a nepovinně ve Firefoxu a WebKitu; ruční nasazení z `main` na GitHub Pages po kontrolách, buildu a testech (D109) |
| `src/content/items/*.ts`, `src/content/topics.ts`, `src/content/challenges.ts`, `src/content/interviews.ts` | studijní data |
| `src/content/releasedIds.ts`, `src/content/index.ts` | vydaná a vyřazená ID, verze obsahu |
| `src/domain/*` | čistá logika: kontrola odpovědí, gramatika, plánovač, lekce, výzva, pohovor, hledání, validace obsahu |
| `src/storage/store.ts`, `persistence.ts`, `restore.ts` | schéma 5, migrace, validace, revize zápisu, původní data, ukládání, obnova po načtení |
| `src/domain/lesson.ts`, `src/domain/stats.ts`, `src/domain/progressViews.ts` | tahy lekce, odevzdání, hodnocení, ukončení a souhrn; statistiky; počty a plán na Dnes |
| `src/state/ProgressProvider.tsx`, `src/state/tabLock.ts` | ukládání změn, stav úložiště, jedna zapisující karta (Web Locks API) |
| `src/components/StorageBanner.tsx`, `src/app/ErrorBoundary.tsx` | hlášení úložiště a karty jen pro čtení; záchranná obrazovka |
| `src/storage/__fixtures__/memoryStorage.ts` | úložiště v paměti pro testy |
| `src/storage/backup.ts` | export, validace importu, souhrn |
| `src/features/settings/SettingsPage.tsx` | jazyk ovládání, hlas a předčítání, stav ukládání, export, import, trvalé uložení, původní data, smazání pokroku, statistiky |
| `src/i18n/cs.ts`, `src/i18n/de.ts` | texty rozhraní česky a německy, včetně textů zpětné vazby (nápovědy, porovnání se vzorem, interpunkce) |
| `src/domain/answerCheck.ts`, `src/domain/cards.ts` (`evaluateWritten`), `src/domain/grammar.ts` | kontrola odpovědí, volný překlad, kosmetické poznámky, diagnóza slovosledu |
| `src/features/lesson/WriteCard.tsx`, `GrammarCard.tsx`, `Flashcard.tsx`, `CosmeticNotes.tsx`, `DiffText.tsx`, `UmlautBar.tsx` | psaní s porovnáním se vzorem, důvody u možností, kartička a Poslech, poznámky k interpunkci, označení rozdílů, lišta ä ö ü ß |
| `src/components/LevelChip.tsx`, `ReadAloud.tsx`, `speechStatus.ts` | orientační úroveň; předčítání v pohovoru a stav přehrávání |
| `src/styles/tokens.css`, `src/styles/app.css` | designové hodnoty (D88) a styly z nich |
| `src/components/ConfirmDialog.tsx` | modální potvrzení s řízením fokusu (D91) |
| `src/components/storageBannerFocus.ts`, `StorageBanner.tsx` | hlášení úložiště, upozornění při posunuté stránce (D94) |
| `src/lib/fitText.ts`, `src/lib/keepInView.ts` | velikost písma podle nejdelšího slova (D90); pole a tlačítko nad klávesnicí (D92); výsledek nad přilepenou lištou (`showResult`, D103) |
| `src/lib/quotedGerman.ts`, `src/components/CzechText.tsx`, `src/content/germanWords.ts` | označení citované němčiny v českých poznámkách (D100) |
| `docs/CONTENT_GUIDE.md` | pravidla obsahu: režimy psaní, `whyCz`, plurál `null`, vazby, kosmetická interpunkce, co hlídá test a co ruční kontrola |
| `src/version.ts` | verze aplikace v exportu |
| `.nvmrc`, `.npmrc` | verze Node.js pro lokální běh i CI (D107); zastavení instalace na nepodporovaném Node (D108) |
| `docs/QUICKSTART_CS.md` | spuštění na Windows v PowerShellu, přenos pokroku, řešení potíží, vzdálený server, přesné příkazy k publikaci |
| `docs/screenshots/*.png` | 4 screenshoty produkčního buildu s ilustračními daty pro README |
| `playwright.config.ts`, `e2e/*.spec.ts`, `e2e/fixtures.ts`, `e2e/data.ts`, `e2e/fakeSpeech.ts`, `tsconfig.e2e.json` | testy produkčního buildu v prohlížeči pod podcestou (D104); hlídání konzole a sítě, smyšlená data, falešný hlas |

## Kontroly v etapách 10 až 12 a jejich skutečné výsledky

**Etapa 12 (2026-11-17):**
- Před prvním commitem `npm run check` a `npm run test:e2e` na Node 26.13.0 s npm 11.21.2: exit 0, 237 testů, 1 vynechaný, 23/23 v prohlížeči.
- CI na GitHubu u `19c3db1`: všechny 4 úlohy zelené, Firefox 155 21/21, WebKit 26.6 23/23.
- Deploy z `main` úspěšný.
- Živá adresa: 15 souborů shodných s ověřeným buildem a krátký průchod v Chromiu 156 na Windows.

Rozpis je v kapitole „Etapa 12“ výše a v `docs/RELEASE_CHECKLIST.md`, kap. 14.

**Etapa 11 (2026-11-16):** čistá instalace v dočasných kopiích na Node 26 s npm 11, na Node 24 a 22 s npm 10, odmítnutí Node 20, rozlišení lockfilu pro Windows a macOS, skripty `dev` a `preview` (HTTP 200), testy v prohlížeči 23/23 z čisté kopie a build shodný s etapou 10. Dále actionlint se shellcheck bez nálezů a zkušební `git add -A` se 154 soubory bez nežádoucích. Rozpis je v kapitole „Etapa 11“ výše a v `docs/RELEASE_CHECKLIST.md`, kap. 13.

**Etapa 10:** všechno jsem spustil 2026-11-16 ve svém cloudovém pracovním prostoru na finálním stavu etapy 10. Na vašem počítači nic ověřené není. Úplný rozpis s prostředím a očekáváním je v `docs/RELEASE_CHECKLIST.md`, kap. 12.

| Kontrola | Jak | Výsledek |
|---|---|---|
| Celá sada z čisté kopie | `npm ci` + `npm run check` na Node 22, 24 a 26 a s npm 11 na Node 24 | vše exit 0 na Node 22.23.4, 24.22.2 a 26.13.0 (npm 10.9.9) i s npm 11.21.2; `npm ci` bez varování, lockfile beze změny; 237 testů, 1 vynechaný |
| Windows a macOS | `npm ci --os=win32 --cpu=x64` a `--os=darwin --cpu=arm64` nad lockfilem | oba cíle doinstalují nativní balíčky oxlint, Rolldown, TypeScript a Lightning CSS, macOS i `fsevents` |
| Cílené skripty | `test:answers` / `test:scheduler` / `check:content` / `test:reload` / `test:stats` / `test:import` | 46 / 47 / 22 (+1 vynechaný) / 44 / 20 / 11 testů, vše exit 0 |
| Lint a typy | `npm run lint`, `npm run typecheck` (nově i `e2e/`) | bez nálezů |
| Build | `npm run build` 2× a z čisté kopie | reprodukovatelný (shodné SHA-256 15 souborů); JS 218,8 kB (68,3 kB gzip) + 387,7 kB (114,3 kB gzip), CSS 50,9 kB (9,2 kB gzip) + 2,7 kB, `index.html` 1,7 kB; celkem asi 193 kB gzip, rozpočet 300 kB |
| Závislosti | `npm audit`, `npm ls --omit=dev`, `npm outdated` | 0 zranitelností; běhově jen React a 2 písma; aktualizace nepotřebné (D106) |
| Testy v repozitáři | `npm run test:e2e`; `E2E_BROWSERS=chrome npx playwright test` | Chromium 23/23 (i z čisté kopie), Google Chrome 21/21; opakované běhy bez selhání |
| Široký průchod | `e2e_check.py`, 41 scénářů, Chromium i Chrome | **576/576** v obou; axe na 32 obrazovkách bez nálezů |
| Pages podcesta | `release.spec.ts` (11 pohledů), E2E `pages_paths` (3 základní adresy × 9 pohledů) | přímé otevření i reload, žádná odpověď ≥ 400 |
| Soubory buildu | `dist_audit.py`, síťový log | vše relativní a existující, bez zdrojových map a cizích serverů; stahují se jen latin a latin-ext písma |
| Úniky a přehrávání | `leaks.py`, `leaks_long.py` | žádný únik; každá promluva zrušena, nikdy dvě naráz |
| Klávesnice | `keyboard_walk.py`, 14 obrazovek | 0 problémů v pořadí, fokusu a dialogu |
| Rychlé opakování | `double_actions.py`, 7 dvojkliků na krocích | nic se nepřeskočí ani nezdvojí |
| Nízký a otočený telefon | `reveal_visible.py`, `feedback_visible.py`, 10 velikostí | po opravě Z46 výsledek vždy vidět |
| Průchod navigací | `devsmoke.py`, 11 kroků jen přes odkazy a tlačítka | 11/11 na dev serveru i pod podcestou, 0 varování a chyb v konzoli |
| Workflow | `actionlint` 1.7.12 | bez nálezů |

**Neprovedené kontroly:**
- Firefox a WebKit: v prostředí nejsou a pravidla prostředí zakazují `playwright install`. Další krok: `npx playwright install firefox webkit` a `E2E_BROWSERS=firefox,webkit npm run test:e2e`, nebo úloha `e2e-other-browsers` po pushi.
- Safari na macOS a iOS, Edge, Android a skutečné telefony včetně jejich klávesnice a ovládání jednou rukou.
- Čtečka obrazovky: ověřené jsou role, názvy a `aria-live`, oznámení jsem neslyšel. Dále vynucené barvy.
- Skutečné hlasy prohlížeče: Poslech a předčítání jsou ověřené falešným `speechSynthesis`.
- Kontrola obsahu rodilým mluvčím z Rakouska.
- Skutečná instalace a běh na Windows a macOS: ověřené je jen rozlišení lockfilu.
- Běh workflow na GitHubu a živá adresa.

**Etapa 9 (shrnutí):**
- E2E 576/576 ve 41 scénářích, axe na 32 obrazovkách bez nálezů;
- audit 42 obrazovek × 3 rozlišení;
- `npm run check` na Node 22, 24 a 26 exit 0 (237 testů).

Podrobně v historii `docs/RELEASE_CHECKLIST.md`.

**Známý limit (Z23)** platí dál: jen bez Web Locks API může souběžný zápis dvou karet ve stejném okamžiku uložit pozdější z nich; druhá karta pak ohlásí zastaralý stav.

## Otevřené body

Rozhodnutí a poznámky. Závady s dopadem a etapou vede `docs/RELEASE_CHECKLIST.md` (Z01–Z48). Sloupec „Řešit v“: publikace (etapa 12) je hotová, studijní průchod a nastavení přijdou po vydání.

| ID | Bod | Řešit v |
|---|---|---|
| O01 | HTML dashboard Cloud Admin Journey zatím nebyl přiložen; témata vycházejí ze zadání. | před rozšířením obsahu |
| O02 | Licence repa (návrh: MIT pro kód, CC BY 4.0 pro obsah). Rozhodnutí zatím neexistuje. Repozitář je od 2026-11-17 veřejný bez souboru `LICENSE`, platí tedy všechna práva vyhrazena a README to uvádí. Rozhodnete vy. | vy (Z15) |
| O04 | Doložit zdroji další rakouská fakta: minimální mzda v inzerátech, Probemonat a výpovědní lhůty, All-in, transpozice směrnice EU 2023/970. | etapa 11, vydání (Z12) |
| O05 | Trvalé uložení (`navigator.storage.persist()`) je od etapy 7 v Nastavení, od etapy 9 i „Stav ukládání“. Zbývá nenásilná připomínka zálohy a ověřit, zda Safari/iOS maže data webu po neaktivitě. | po vydání (Z06), Z13 |
| O06 | Nahrávání odpovědi (MediaRecorder, jen v paměti): základní režim je bez mikrofonu. Volitelný režim jen na vaše přání. | vy |
| O07 | Cílový rozsah obsahu (přibližně 300 položek); teď 150. Pro tuto verzi stačí ≥ 80 kvalitních položek (D86). Nejtenčí jsou teď `powershell`, `handover` a `career` (po 9). | po dokončení této verze (Z11) |
| O10 | Tmavý režim: světlý vzhled je od etapy 9 dokončený včetně stavů; tmavý zatím není. Hodnoty v `tokens.css` jsou připravené na druhou sadu barev. | po vydání (Z10), jen na vaše přání |
| O12 | Ověření na vašem počítači a v dalších prohlížečích (Safari, Firefox, Edge, iOS, Android); mé kontroly běžely v Chromiu a od etapy 10 i v Google Chrome. Od etapy 11 hlavně: projít `docs/QUICKSTART_CS.md` na Windows a poslat výsledek `npm ci`, `npm run check` a `npm run test:e2e`. Od etapy 9 hlavně: skutečná klávesnice telefonu (pole a tlačítko nad ní), ovládání jednou rukou, dialog v Safari. Firefox 155 a WebKit 26.6 ověřilo 2026-11-17 CI (všechny testy prošly) a živou adresu krátký průchod v Chromiu 156 na Windows. | vy (Z13) |
| O13 | Intervaly 3/7/14/30/60 dní a hranici „upevněno“ doladit podle zkušenosti z používání. | po používání |
| O14 | Lekce jako obsahová jednotka s rozcvičkou B1 (plán E4.4): je ještě potřeba, nebo ji zrušit? | vy, před studijním průchodem po vydání (Z07) |
| O15 | Výzvy jsou zatím 3 a všechny B2. Další případy a úroveň B1 nebo C1? | po dokončení této verze (Z12) |
| O16 | Jazykovou revizi obsahu, pohovorů i německého rozhraní jsem dělal sám, naposledy v etapě 8 nad všemi 150 položkami. Kontrola rodilým mluvčím z Rakouska, ideálně z IT, zůstává doporučená, hlavně u přirozenosti vět, rakouského úzu a nových frází v tématu `communication`. | vy, nejlépe brzy po publikaci |
| O17 | Výsledky výzev se neukládají do historie. Historie jen pokud ji budete chtít. | vy |
| O18 | Předčítání a Poslech se skutečnými hlasy: které německé hlasy nabízí váš prohlížeč (je mezi nimi de-AT?), zda přehrávání správně skončí a jak zní krátká hesla (např. *eingehen*) bez kontextu. | vy (Z13) |
| O19 | Každá otázka pohovoru má jednu doplňující otázku; druhé by „Zkusit znovu“ zpestřily. | po dokončení této verze (Z12) |
| O20 | Pohovorová otázka jako poslední krok tréninku (plán E5.6) navazuje na lekce (O14). | po vydání (Z08) |
| O21 | Stahování souborů (export) v náhledu v Claude nefunguje kvůli sandboxu; export a import vyzkoušejte lokálně nebo na GitHub Pages. | – |
| O23 | Volný překlad: čím víc běžných správných formulací má věta v `accept`, tím častěji aplikace rovnou řekne „Správně“. Varianty doplňovat podle toho, co při používání píšete. | průběžně, vy |
| O24 | Poslech sdílí pokrok s kartičkou DE → CZ (D83). Pokud ho budete chtít plánovat zvlášť, znamenalo by to nový typ karty a schéma 6. | vy |
| O25 | Lišta ä ö ü ß má na 360 px tlačítka 39 × 44 px, aby byla v jedné řadě (D93). Pokud vám na telefonu půjdou trefovat hůř, rozdělím ji do dvou řad za cenu výšky nad klávesnicí. | vy, po vyzkoušení na telefonu |
| O26 | Čtečka obrazovky: po odkrytí kartičky by měla přečíst otázku hodnocení i český význam (Z44), po kontrole verdikt. Ověřit s NVDA nebo VoiceOver. | etapa 11 a vy (Z13) |
| O28 | Node 22 dostává bezpečnostní opravy jen do 30. 4. 2027, Node 24 do 30. 4. 2028. Po 30. 4. 2027 vyřadit 22 z `engines` (D107). | 2027 |
| O30 | Firefox a WebKit v CI prošly, ale zůstávají nepovinné (`continue-on-error`). Mají se stát povinnými? Pak by neúspěch v nich zastavil CI. Úprava: odstranit `continue-on-error` a „not required“ z názvu úlohy v `ci.yml`. | vy |
| O31 | About repozitáře nastavíte vy, relace zápis nastavení nesmí: na stránce repozitáře ozubené kolečko u **About** → Description „Practise German for cloud and IT admin job interviews in Austria. Static React + TypeScript app; progress stays in your browser.“ → zaškrtnout **Use your GitHub Pages website** → **Save changes**. | vy |
| O27 | Ruční průchod klávesnicí (etapa 10): u otázky pohovoru jsou dvě rozbalení „Zobrazit česky“ (kontext a otázka), v rozboru dvě „Zobrazit překlad“. Vizuálně jednoznačná. Pokud čtečka v seznamu ovládacích prvků poplete, doplním jim různé názvy. | se čtečkou (O26) |

Uzavřeno ve v1.0: O08 (nasazení jen ručně, D18), O09 (anglický README, D55), O11 (další krok). Uzavřeno v etapě 12: O22 (odkaz na demo je v README), O29 (první běh workflows: CI zelené včetně Firefoxu a WebKitu, nasazení úspěšné).

## Příští krok

**Vaše kroky po publikaci:**
1. About repozitáře: popis a web (O31).
2. Licence (O02).
3. Lokální běh na Windows podle `docs/QUICKSTART_CS.md`, kap. 1–7. Výsledek `npm ci`, `npm run check` a `npm run test:e2e` mi prosím pošlete (O12).
4. Rozhodnutí, zda mají být Firefox a WebKit v CI povinné (O30).

**Další etapa (můj návrh):** oprava Z48 s testem tvarů pro 1 až 5 karet, nové nasazení a kontrola živé adresy. Podle dohody také zdroje k rakouským faktům (O04) a úprava kap. 4 v `PLAN.md` (Z14).

Po vydání **studijní průchod a nastavení** (Z06–Z10). Před začátkem prosím rozhodněte O14: lekce s rozcvičkou B1 ano, nebo ne. Rozšíření obsahu o další desítky položek přijde až po dokončení této verze (D86).

## Kroky na GitHubu

**Hotovo 2026-11-17 (etapa 12):**
1. Prázdný veřejný repozitář `BrutusFilip/cloud-admin-deutsch-at` a přístup aplikace Claude k němu (vy).
2. Push do `main`: `690451b` (balík etapy 11), `19c3db1` (oprava testů) a dokumentační commit (já).
3. CI zelené včetně Firefoxu a WebKitu (já).
4. **Settings → Pages → Source: GitHub Actions** (vy).
5. Deploy z `main`, nasazený `19c3db1` (já).

**Zbývá na vás:** About (O31) a licence (O02).

**Další nasazení:**
- **Actions → Deploy to GitHub Pages → Run workflow**, větev `main`. Z jiné větve workflow hned skončí chybou.
- Změny jen v dokumentaci nasazovat nemusíte, build se jimi nemění.
- Automatické nasazení po každém pushi zapnete přidáním `push` triggeru podle komentáře v `.github/workflows/deploy.yml`.
- Jiná publikační větev: změňte `main` v obou workflows (`branches` v `ci.yml`, `PUBLISH_BRANCH` v `deploy.yml`) a povolte ji v **Settings → Environments → github-pages**.
- Aplikace v podsložce repozitáře: nastavte `APP_DIR` v obou workflows.

**Co tato relace na GitHubu smí:**
- smí: push, spuštění workflow a čtení výsledků;
- nesmí: založit repozitář, nastavit Pages, nastavit About.

Přesné příkazy pro vlastní push z PowerShellu jsou v `docs/QUICKSTART_CS.md`, kap. 10.

## Jak výsledek ověříte

Cesty jsou relativní ke kořeni rozbalené složky `cloud-admin-deutsch-at/`.

1. `npm ci` a pak `npm run check`. Očekávaný výsledek: exit 0, 237 testů prošlo a 1 vynechaný.
2. Cílené kontroly, každá s exit 0:
   - `npm run test:answers` (46)
   - `npm run test:scheduler` (47)
   - `npm run check:content` (22, 1 vynechaný)
   - `npm run test:reload` (44)
   - `npm run test:stats` (20)
   - `npm run test:import` (11)
   - `npm run stats:content` vypíše počty z kapitoly „Etapa 8 → Počty položek“
3. `npm run dev` a otevřete http://localhost:5173/.
   1. Na stránce Dnes uvidíte úvod a pod ním „Co se ukládá a kdy“.
   2. V záhlaví přepněte **DE**: navigace bude Heute / Üben / Interview / Wörterbuch. Po reloadu zůstane německy.
4. **Etapa 11 – Windows:** projděte `docs/QUICKSTART_CS.md`, kap. 1–7.
   - `node -v` vypíše `v26.x.x`.
   - `npm ci` skončí bez `npm error`.
   - `npm run check` skončí s `Tests  237 passed | 1 skipped (238)` a `$LASTEXITCODE` je `0`.
   - `npm run dev` vypíše `Local:   http://localhost:5173/` a `Ctrl+C` server zastaví.
   - `npm run build` a `npm run preview` vypíšou `http://localhost:4173/`.
5. **Etapa 11 – nepodporovaný Node:** se starší verzí, například 20, skončí `npm ci` chybou `EBADENGINE` s řádky `Required` a `Actual` (D108).
6. **Etapa 11 – workflows:** po pushi workflow **CI** skončí zeleně. **Deploy** spuštěný z jiné větve než `main` hned skončí chybou „Start this workflow from the branch 'main'“.
7. **Etapa 10 – testy v prohlížeči:**
   1. Jednou spusťte `npx playwright install chromium` (stáhne prohlížeč pro testy).
   2. `npm run test:e2e` sestaví aplikaci a spustí 23 testů. Očekávaný výsledek: „23 passed“.
   3. Volitelně `npx playwright install firefox webkit` a `E2E_BROWSERS=firefox,webkit npm run test:e2e`. Tyto prohlížeče jsem ověřit nemohl, výsledek mi prosím pošlete.
8. **Etapa 10 – nízký telefon (Z46):**
   1. V DevTools nastavte vlastní velikost 375 × 553 a dotykovou emulaci.
   2. Dnes → „Začít trénink“ → „Odkrýt řešení“. Český význam je vidět nad lištou „Jak to šlo?“.
   3. Otevřete `#/slovnik/network-g-002` → „Procvičit úlohu“, napište *wurden* a zvolte „Zkontrolovat“. Nahoře je vidět „Chyba“.
9. **Etapa 10 – import při chybě zápisu (Z47):**
   1. V Nastavení spusťte v konzoli `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }`.
   2. Importujte platný export a zvolte „Nahradit pokrok“.
   3. Hlášení zní „Zápis se nepodařil. Pokrok v tomto prohlížeči zůstal beze změny.“ a počty se nezmění.
10. **Etapa 9 – rozhraní** (v Chromu nebo Edge, DevTools → přepínač zařízení, 360 × 800):
   1. Dnes → „Začít trénink“ → u kartičky „Odkrýt řešení“. Stránka se neposune a hodnocení zůstane dole nad navigací.
   2. U psaní klepněte do pole. Na skutečném telefonu zůstane pole i „Zkontrolovat“ nad klávesnicí a spodní navigace zmizí; DevTools klávesnici nesimuluje.
   3. Otevřete `#/slovnik?q=vpn&tema=network&druh=vocab`. Uvidíte tři štítky filtrů a „2 položky“. Křížek zruší jeden filtr, „Zrušit vše“ všechny. `#/slovnik?q=xyzxyz` ukáže „Nic nenalezeno“ s tlačítkem.
   4. Pohovor → libovolný scénář → „Začít pohovor“. Nad otázkou jsou tři fáze, aktuální je zvýrazněná; po „Pokračovat na doplňující otázku“ se posune.
   5. Nastavení: pořadí Jazyk ovládání, Hlas a předčítání, Pokrok a záloha, Statistiky. Na „Smazat pokrok…“ přejděte klávesou Tab a stiskněte Enter. Fokus je v dialogu na „Zpět“, Esc ho zavře a fokus je zpátky na tlačítku.
   6. Chyba zápisu při posunuté stránce: na Dnes sjeďte k tématům, v konzoli spusťte `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }` a klikněte na téma. Nahoře se objeví „Poslední změnu se nepodařilo uložit.“ se „Zobrazit možnosti“. Obnovením stránky se zápis vrátí do normálu.
   7. Okno 1440 px a zvětšení 200 % (Ctrl + plus): žádná stránka se neposouvá do strany.
   8. DevTools → Rendering → „Emulate CSS prefers-reduced-motion: reduce“: odkrytí řešení a dialog se objeví bez animace.
11. **Etapa 8 – volný překlad:**
   1. Otevřete `#/slovnik/windows-s-001` → „Procvičit psaní“.
   2. Napište *Bitte starten Sie Ihren Computer neu.* a zvolte „Zkontrolovat“.
   3. Uvidíte „Porovnání se vzorem“: *Ihren* je podtržené tečkovaně a nabízí se tři hodnocení.
   4. Napište vzor bez tečky na konci (*Bitte starten Sie den Computer neu*): výsledek je „Správně“, tečka na konci se u vět nehodnotí.
   5. Napište vzor s malým *sie*: výsledek je „Chyba“ s vysvětlením velkého písmene, protože pravopis nemá správnou alternativu.
12. **Etapa 8 – čárka:**
   1. Otevřete `#/slovnik/handover-g-003` → „Procvičit úlohu“.
   2. Napište větu bez čárky před *dass*. Výsledek je „Správně“ a pod ním „Před „dass“ chybí čárka. …“.
13. **Etapa 8 – výběr:**
   1. Otevřete `#/slovnik/communication-g-001` → „Procvičit úlohu“.
   2. Zvolte první možnost. Uvidíte „Proč ne …“ a pod „Proč ostatní možnosti nesedí“ důvody u dalších dvou.
14. **Etapa 8 – lišta znaků:** v poli napište *prfe*, kurzor dejte mezi *r* a *f* a klikněte na „ü“ (nebo k ní dojděte klávesou Tab a stiskněte Enter). Vznikne *prüfe* a kurzor zůstane v poli za *ü*.
15. **Etapa 8 – Poslech:**
   1. Procvičování → „Poslech DE → CZ“ → „Začít procvičování“.
   2. „Přehrát německy“ přehraje výraz hlasem prohlížeče; text uvidíte až po „Odkrýt řešení“.
   3. Bez německého hlasu (některé prohlížeče na Linuxu) karta ukáže text a důvod.
16. **Etapa 8 – časovač v pohovoru:**
   1. Spusťte časovač u otázky a přejděte do Slovníku.
   2. Vraťte se přes Pohovor → „Pokračovat v pohovoru“. Časovač stojí na výchozí délce.
17. **Lekce po reloadu:**
    1. Na Dnes zvolte „Začít trénink“.
    2. U karty s psaním napište chybnou odpověď, zvolte „Zkontrolovat“ a obnovte stránku (F5).
    3. Uvidíte stejný výsledek, žádné pole pro odpověď a jen „Pokračovat – karta se vrátí“.
    4. Totéž platí po odchodu do Slovníku a návratu přes „Pokračovat v lekci“.
18. **Dvě karty:**
    1. Otevřete aplikaci ještě v jedné kartě prohlížeče. Ta ukáže „Tato karta je jen pro čtení“.
    2. Po zavření první karty nebo po „Pracovat v této kartě“ začne zapisovat druhá a první se přepne jen na čtení.
19. **Chyba zápisu:**
    1. V konzoli DevTools spusťte `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }`.
    2. V aplikaci něco změňte, například téma na Dnes. Banner nabídne „Stáhnout export aktuálního stavu“.
    3. Obnovením stránky se zápis vrátí do normálu.
20. **Export → jiný profil → import:**
    1. Nastavení → **Stáhnout export**.
    2. Otevřete aplikaci v jiném profilu prohlížeče nebo v anonymním okně.
    3. Nastavení → Import → **Nahradit pokrok**.
    4. Dnes ukáže stejná čísla, statistiky jsou shodné a rozpracovaná lekce pokračuje na stejné kartě.
21. **Statistiky:** Nastavení → Statistiky ukazují zvlášť:
    - dokončené lekce a lekce ukončené dřív;
    - přesnost prvního pokusu;
    - vaše hodnocení kartiček;
    - sebehodnocení v pohovoru.
22. **Produkční build:** `npm run build` a `npm run preview`, pak otevřete adresu z výpisu. V `dist/index.html` musí být cesty `./assets/…`.
23. **Opravy z etapy 6:**
    1. `http://localhost:5173/#/slovnik/%E0%A4%A` ukáže „Položka nenalezena.“, i po reloadu.
    2. `dist/index.html` otevřený dvojklikem asi po 3 s napíše, jak aplikaci spustit.
24. Po prvním pushi musí workflow **CI** v záložce Actions skončit zeleně.
25. **Etapa 12 – živé demo:**
    1. Otevřete https://brutusfilip.github.io/cloud-admin-deutsch-at/. Načte se Dnes a v DevTools → Network mají všechny požadavky stav 200.
    2. Otevřete `#/slovnik/access-v-006` a stiskněte F5. Zůstane heslo „die Authentifizierungsmethode“.
    3. Dokončete lekci a stiskněte F5. Dnes ukáže méně nových karet a Nastavení → Statistiky „Dokončené lekce 1“.
26. **Etapa 12 – GitHub:** v záložce Actions je u posledního commitu workflow **CI** zelené a u **Deploy to GitHub Pages** úspěšné nasazení s adresou dema.
