# Release checklist – Cloud Admin Deutsch (AT)

Přehled ověření k první veřejné verzi: co je ověřené, co čeká na ověření a co chybí nebo nefunguje. Aktualizuje se na konci každé etapy spolu s [`PROJECT_STATE.md`](../PROJECT_STATE.md).

**Aktualizováno:** 2026-11-17, etapa 12 (publikace) · **Verze:** 1.0.0, vydaná 2026-11-17 na [brutusfilip.github.io/cloud-admin-deutsch-at](https://brutusfilip.github.io/cloud-admin-deutsch-at/) z repozitáře [BrutusFilip/cloud-admin-deutsch-at](https://github.com/BrutusFilip/cloud-admin-deutsch-at).

**Prostředí kontrol:**
- můj cloudový pracovní prostor: Linux, Node 22, 24 a 26, Chromium 153 a Google Chrome for Testing 153 přes Playwright 1.63;
- od etapy 12 GitHub Actions: ubuntu-latest, Node 26.13.1, Chromium, Firefox 155 a WebKit 26.6;
- živá adresa: integrovaný prohlížeč aplikace Claude na vašem Windows (Chromium 156).

Lokální instalace na vašem počítači zatím ověřená není.

**Základ porovnání.** Doslovné znění vašich promptů 1–4 už v této konverzaci nemám, starší části se zhustily. Porovnávám proto se zápisem zadání v [`PLAN.md`](PLAN.md) (kap. 3–5, 8 a 10), s rozhodnutími s původem „zadání“ v `PROJECT_STATE.md` a s doslovným zadáním promptu 5 (portfolio v1.0). Pokud chcete porovnání s původním textem, vložte ho a rozdíly doplním. Zadání etap 6 až 10 mám doslovně; požadavky z etapy 8 jsou R34–R36 a upravené R12, R13, R15 a R24, požadavky z etapy 9 jsou R37–R46 a upravené R18, R26–R28. Závěrečné ověření z etapy 10 je v kap. 12 (V01–V25), upravené jsou R01–R04, R08, R21, R26, R27, R29, R30 a R45. Balení a příprava vydání z etapy 11 jsou v kap. 13 (B01–B14), upravené jsou R01–R04, R29 a R31. Publikace z etapy 12 je v kap. 14 (P01–P12). Upravené jsou R08, R29–R31, B09, B10, B12, Z13 a Z15, nová je závada Z48.

**Stavy:**
- ✅ ověřeno;
- ⏳ čeká na ověření: hotovo, ale neověřeno ve skutečném prostředí;
- ❌ chybí nebo nefunguje.

## 1. Instalace a spuštění

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R01 | Instalace z čisté kopie jedním správcem balíčků s lockfilem (npm, `package-lock.json`) | ✅ | dočasné kopie bez `node_modules` a `dist`, `npm ci` (etapa 11, 2026-11-16) | exit 0 na Node 26.13.0 s npm 11.21.2 a na Node 24.22.2 a 22.23.4 s npm 10.9.9, bez varování; lockfile se nezměnil. Node 20 instalaci odmítne (`EBADENGINE`, D108). Doporučená verze je Node 26 LTS v `.nvmrc` a CI (D107). | skutečný Windows (R03) |
| R02 | Základní kontroly `npm run check`: lint, typy, testy, build | ✅ | totéž; na Node 26 s npm 11 jednotlivě `npm run lint`, `typecheck`, `test`, `build` a `CI=1 npm run test:e2e` (etapa 11) | exit 0 na všech verzích výše; 22 souborů, 237 testů prošlo, 1 vynechaný (výpis statistik); testy v prohlížeči 23/23; build shodný s etapou 10 | – |
| R03 | Instalace na Windows a macOS | ⏳ | nativní balíčky v lockfilu; `npm ci --os=win32 --cpu=x64` a `--os=darwin --cpu=arm64` (etapa 11); kopie s konci řádků CRLF (etapa 9); návod `docs/QUICKSTART_CS.md` pro Windows a PowerShell (etapa 11) | oba cíle doinstalují oxlint, Rolldown, TypeScript a Lightning CSS pro svou platformu, macOS i `fsevents`; kopie s CRLF: `npm run check` exit 0 | skutečný běh na vašem Windows podle `docs/QUICKSTART_CS.md`, kap. 1–7 (O12) |
| R04 | Spuštění `npm run dev` a `npm run preview` | ✅ | čistá kopie, Node 26 a npm 11 (etapa 11); průchod navigací v Playwrightu (`devsmoke.py`, etapa 10) | `npm run dev` na `http://localhost:5173/` a `npm run preview` na `http://localhost:4173/` odpověděly HTTP 200; při obsazeném portu Vite vezme další volný. Průchod 11/11 kroků bez varování a chyb v konzoli na dev serveru i na buildu pod podcestou. | – |
| R05 | Spuštění mimo webový server nebo bez JavaScriptu neskončí prázdnou stránkou | ✅ opraveno v etapě 6 (Z02) | E2E `start_note` (`dist/index.html` přes `file://`, vypnutý JavaScript) a `addresses` (běžný start) | po 3 s se ukáže česko-německá zpráva, jak aplikaci spustit; při běžném startu se neukáže | – |

## 2. Navigace

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R06 | Navigace Dnes, Procvičování, Pohovor a Slovník, Nastavení v patičce, přepínač CZ/DE, značka vede na Dnes, zpět a vpřed | ✅ | průchod jen přes navigaci (dev, preview, podcesta); patička na 390 a 320 px | 11/11 kroků; odkaz Nastavení je na telefonu viditelný a klikatelný | – |
| R07 | Neplatné a neznámé adresy | ✅ opraveno v etapě 6 (Z01) | unit test v `router.test.ts`; E2E `addresses`: 5 adres, otevření i reload, odkazy zpět | poškozená sekvence `%` vede na „Položka nenalezena.“ nebo „Pohovor nenalezen.“ s odkazem zpět; neznámá adresa na Dnes; konzole bez chyb | – |
| R08 | Hash routing pod podcestou repa i v kořeni domény (GitHub Pages) | ✅ | E2E `pages_paths`: `/cloud-admin-deutsch-at/`, `/muj-portfolio-demo/` a kořen; 9 adres, otevření i reload. Od etapy 10 i Playwright v repozitáři (`release.spec.ts`, 11 pohledů, V10). Etapa 12: živá adresa, hlavní navigace a obnovení `#/slovnik/access-v-006` (P08). | vše správně, žádná odpověď 4xx ani 5xx | – |

## 3. Dnes a trénink

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R09 | Dnes: karty k opakování, nové a upevněné, výběr tématu, rozpracovaná lekce, přehled témat, úvod pro první návštěvu, vysvětlení zamčených karet (PLAN kap. 3, D57); počty ze stejných dat jako výběr karet (etapa 7) | ✅ | `progressViews.test.ts` (náhodná data); E2E `main_flow`, `counters`, `midnight`, `plan_matches_lesson`, `dst` | Počítadla sedí po reloadu, po lekci i po opakování chyb. Náhled „Trénink nabídne …“ se v 5 tématech shoduje s kartami, které lekce vzala. O půlnoci se datum přepne bez reloadu. Termíny jsou kalendářní dny i přes 25hodinový a 23hodinový den. | – |
| R10 | Trénink: nejvýše 10 karet, „Znovu“ vrátí kartu o 3 karty později (nejvýše 3 pokusy), uložení po každém hodnocení, dokončení po reloadu, souhrn, opakování chyb (PLAN kap. 4, D10–D12, D22). Od etapy 7 je odevzdání a hodnocení jednoznačné: reload i návrat zachovají výsledek, každá odpověď se započítá jednou a pravidla vidí uživatel (D64–D66). | ✅ opraveno v etapě 7 (Z16, Z21) | `npm run test:scheduler` (47), `npm run test:reload` (44); E2E `main_flow`, `counters`, `keyboard`, `lesson_state` | Prošlo, celé kolo jde projít jen klávesnicí. Reload před kontrolou, po kontrole, po odkrytí, po hodnocení i po dokončení se chová podle pravidel. Dvojklik ani Enter ×3 nic nezapočítají dvakrát. Dokončená lekce se nezapočítá znovu. | – |
| R11 | Lekce jako obsahová jednotka s cílem a rozcvičkou B1; pohovorová otázka na konci tréninku (plán E4.4, E5.6) | ❌ | kód a plán | není implementováno | Z07, Z08 |
| R12 | Volitelná výzva „Incident za 5 kroků“: 3 smyšlené případy, zpětná vazba po každém kroku, přesnost prvního pokusu, opakování chyb, volitelné stopky (zadání E4). Od etapy 8: návazný příběh a všechny kroky dosažitelně dokončit. | ✅ | E2E `challenge`, `challenge_mobile` (360 px, dotyk, klávesnice) a `all_challenges`; test obsahu „lets every … case be finished“; ruční kontrola příběhu | Prošlo, funguje i s omezenými animacemi. Všechny 3 případy: 5 kroků v pořadí příběhu, vysvětlení po každém. Správné odpovědi dají 5 z 5, chybné i „Nevím“ dojdou k výsledku. | jen 3 případy, všechny B2 (Z12, po dokončení této verze) |

## 4. Procvičování

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R13 | Kartičky DE → CZ, psaní CZ → DE s lištou ä ö ü ß a vysvětlením chyb, gramatika (4 typy úloh, filtr jevu), rychlé opakování chyb, filtry téma a úroveň (PLAN kap. 3, zadání E1 a E4). Od etapy 8: Poslech DE → CZ, znaky z lišty na místo kurzoru bez ztráty fokusu, úroveň jako orientační. | ✅ v Chromiu | `npm run test:answers` (46 testů); E2E `main_flow`, `grammar`, `keyboard`, `narrow`, `umlaut_caret`, `listening` | Prošlo. Přehlásky a ß se nikdy neslučují s a, o, u, ss; řazení slov jde bez myši. Znak z lišty se vloží doprostřed textu i místo výběru myší, klávesnicí i dotykem, fokus a kurzor zůstanou v poli. | Poslech se skutečnými hlasy (Z13) |
| R34 | Vyhodnocování podle cíle úlohy (zadání etapy 8):<br>• jednoznačná úloha hodnotí automaticky jen předem definované odpovědi a varianty;<br>• volný překlad dovolí porovnání se vzorem a vlastní hodnocení;<br>• umlauty, ß, členy, pády a velká písmena se hodnotí;<br>• kosmetická odchylka je oddělená od chyby v procvičovaném jevu;<br>• vysvětlení konkrétního rozdílu;<br>• důvody u chybných možností výběru | ✅ v Chromiu | `npm run test:answers` (46); testy obsahu (režimy vět, `whyCz`); E2E `free_translation`, `grammar`, `challenge`; `repro8.py` na buildu etapy 7 a 8 | Uvedená formulace věty: „Správně“. Neuvedená správná formulace: „Porovnání se vzorem“, neutrální označení a tři hodnocení. Chybějící ü nebo malé *sie*: „Chyba“. Čárka: „Správně“ s přesným místem. Slovosled jmenuje slovo, které stojí jinde. Výběr ukáže důvod u zvolené možnosti. Od etapy 9 se ve volném překladu pojmenuje i chybné slovo, když se věta liší i jinak (Z41). | – |
| R35 | Jasné a ovladatelné režimy: psaná odpověď, odhalení kartičky a poslech; pomůcky a vzory až v příslušné fázi (zadání etapy 8) | ✅ v Chromiu | E2E `listening` (falešný `speechSynthesis`: přehrát, zastavit, odkrýt, ohodnotit, reload, bez německého hlasu, hlasy po 400 ms, chyba enginu, bez Web Speech API), `main_flow`, `keyboard`, `grammar`, `interview` | Čtyři režimy v Procvičování, každý s vlastním popiskem na kartě. Poslech skrývá text do odkrytí. Přehrávání jde zastavit a odchod z karty ho zruší. Bez hlasu se ukáže text s důvodem. Čeština, důvody a vzory se ukážou až po odpovědi. | skutečné hlasy (Z13) |

## 5. Pohovor

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R14 | 4 pohovorové scénáře po 3–4 otázkách: osobní otázky, STAR u zkušenosti, 4 kroky u technických otázek (zadání E5) | ✅ | `npm run check:content` (validace pohovorů), `npm run stats:content` | 4 scénáře, 14 hlavních a 14 doplňujících otázek, 29 faktů k nahrazení, 42 odkazů do slovníku; po scénářích 3 / 4 / 4 / 3 otázky | – |
| R15 | Tok otázka → doplňující otázka → ilustrační vzor s fakty k nahrazení, hesla, formulace, vlastní ověřitelný příklad, sebehodnocení, „Zkusit znovu“, souhrn; časovač 60–90 s; předčítání jen na kliknutí (zadání E5). Od etapy 8 navíc: STAR a technický postup ve vzorech; relevantní a existující odkazy do slovníku; časovač neblokuje a při opuštění otázky se zastaví; zrušení přehrávání, opožděné hlasy a stav bez německého hlasu. | ✅ v Chromiu | E2E `interview`, `interview_voices`, `interview_mobile_no_speech`, `interview_keyboard`, `interview_timer_leave`; existence odkazů ve validaci; relevance všech 42 odkazů ruční kontrolou | Prošlo. Vzor se před doplňující otázkou neukáže, bez `speechSynthesis` tok funguje. Časovač po odchodu do Slovníku a návratu stojí na výchozí délce. | skutečné hlasy (Z13), druhé doplňující otázky (Z12, po dokončení této verze) |

## 6. Slovník

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R16 | Hledání DE i CZ bez ohledu na diakritiku, filtry téma, úroveň a druh, detail hesla, hluboký odkaz i po reloadu, „Použito ve výzvě“ a „Použito v pohovoru“ (PLAN kap. 3, E6.1–E6.3) | ✅ | unit testy hledání; E2E `dictionary`, `pages_paths` | prošlo | – |
| R17 | Kontext lekcí v detailu hesla a filtr podle stavu karet (plán E6.4, E6.5) | ❌ | kód a plán | není implementováno | Z09 |

## 7. Rozhraní česky a německy

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R18 | Výchozí čeština, volitelná němčina: navigace, tlačítka, systémové stavy, nastavení; výukový obsah zůstává; `lang` stránky (zadání v1.0). Od etapy 9 i `lang` u německých citací v českých poznámkách. | ✅ | `i18n.test.ts` (4 testy); `quotedGerman.test.ts` (4); E2E `german_ui`, `stage9_ui`; `probe2` (6 obrazovek v obou jazycích) | `<html lang="de-AT">`; mimo prvky `lang="cs"` na 9 obrazovkách žádný český text; volba drží po reloadu. Jednoznačně německé citace v českých poznámkách mají `lang="de-AT"`. | jazyková kontrola rodilým mluvčím (O16, vy) |

## 8. Ukládání, export a import

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R19 | Ukládání v prohlížeči: schéma 5, migrace z verzí 1–4 až po validaci, původní data zachovaná, validace whitelistem, nečitelná nebo novější data se bez volby nepřepíší, režim bez ukládání, chyba úložiště v rozhraní s exportem aktuálního stavu (PLAN kap. 8, zadání etapy 7) | ✅ opraveno v etapě 7 (Z18, Z19) | `npm run test:reload` (44); E2E `corrupt`, `storage_unavailable`, `write_failure`, `migration`, `migration_v2`, `migration_backup` | Prošlo. Načtení nic nezapíše. První zápis převedených dat nejdřív uloží původní text, který jde stáhnout i obnovit. Banner chyby zápisu nabízí export, který obsahuje i neuloženou změnu. | – |
| R20 | Více otevřených karet prohlížeče: pokrok se neztratí, smazaný se nevrátí, zastaralý stav je vidět (PLAN kap. 8, zadání etapy 7) | ✅ opraveno v etapě 7 (Z03, Z04, Z17) | `tabLock.test.ts`, revize v `persistence.test.ts`; E2E `two_tabs`, `tabs_without_locks`, `newer_version`, `reset_other_tab` | Zapisuje jen jedna karta (Web Locks API), ostatní ukazují uložený stav jen pro čtení. Ověřeno současným odevzdáním, obnovením druhé karty a pádem první (druhá převzala zápis sama). Bez Web Locks karta se zastaralým stavem nic neuloží a řekne to. | Firefox a Safari (Z13); limit bez Web Locks (Z23) |
| R21 | Export verzovaného JSON se vším pro obnovu; import ověřený předem jako celek (typy, povolené hodnoty, velikost) se souhrnem a potvrzením; chyba validace nebo zápisu nechá stav použitelný; reset jen klíčů aplikace (zadání v1.0 a etapy 7) | ✅ v Chromiu | `npm run test:import` (11); E2E `progress_backup`, `export_new_profile` | 9 druhů neplatných souborů odmítnuto s důvodem a beze změny. Export verze 1.0 se převede. Export → nový profil prohlížeče → import: shodné termíny, výsledky, statistiky, nastavení i rozpracovaná lekce. Reset odstraní přesně klíče `cloud-admin-deutsch-at:*`. Od etapy 9 je souhrn importu i smazání v dialogu (R43). Etapa 10: export → import v novém profilu i odmítnutí neplatného, novějšího a převod staršího formátu v Playwrightu v repozitáři; import a smazání při chybě úložiště nechají data beze změny a řeknou to jednou (Z47, V19). | stahování v náhledu v Claude nefunguje (O21); připomínka zálohy (Z06, po vydání) |
| R33 | Statistiky ze skutečných studijních událostí: přesnost prvního pokusu, vlastní hodnocení kartiček a dokončené lekce zvlášť; nápověda a odhalené řešení rozpoznatelné; pohovor jako sebehodnocení (zadání etapy 7) | ✅ nové v etapě 7 (Z20) | `npm run test:stats` (20); E2E `main_flow`, `grammar`, `challenge`, `interview`, `lesson_state` | Každá lekce se započítá jednou, když skončí. Souhrn lekce, výsledek výzvy i Nastavení → Statistiky oddělují přesnost a vlastní hodnocení. „Řešení odhaleno“ a „uznáno vámi“ jsou zvlášť. Pokus s nápovědou je v pohovoru označený. | – |
| R22 | Obsah exportu není v demu ani v repozitáři | ✅ | `.gitignore` (`cloud-admin-deutsch-progress-*.json`, syrové kopie úložiště); prohledání stromu a zipu | žádný export ani syrová kopie | – |

## 9. Obsah

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R23 | Struktura položek: stabilní ID, povinná pole, definice odpovědí, zdroje u faktů, vydaná ID, soukromí (PLAN kap. 5, D07, D08, D33). Od etapy 8: `whyCz` u výběru, režim psaní vět, poznámka u jmen bez plurálu, dokončitelnost výzev, vykání *Sie*. | ✅ | `npm run check:content` (22 testů a 1 vynechaný výpis) | prošlo; 15 nových ID je ve `RELEASED_IDS`, žádné vydané ID se nezměnilo | – |
| R24 | **Změněno zadáním etapy 8 (D86):** pro tuto verzi aspoň 80 kvalitních položek, z toho 15 gramatických úloh, prioritní IT témata a 4 pohovory po 3–4 hlavních otázkách. Rozšíření o další desítky položek (původní plán kap. 5, asi 300 položek) až po dokončení této verze. | ✅ | `npm run stats:content`, `npm run check:content` a ruční redakční kontrola | 150 položek (75 hesel, 41 vět, 34 úloh) ve 13 tématech, každé téma aspoň 9 položek; 4 pohovory po 3 / 4 / 4 / 3 otázkách | rozšíření po dokončení této verze (Z11) |
| R25 | Rakouská fakta doložená zdroji; jazyková kontrola rodilým mluvčím | ❌ / ⏳ | ruční kontrola | chybí zdroje k minimální mzdě v inzerátech, Probemonat, výpovědním lhůtám, All-in a směrnici EU 2023/970 (O04); jazykovou revizi zatím dělal jen Claude, naposledy v etapě 8 nad všemi 150 položkami (O16, R36) | Z12 (zdroje v etapě 10); O16 vy |
| R36 | Redakční kontrola všech položek: členy, plurály, vazby, pády, slovesné tvary, slovosled, přirozenost, přesný český význam, rakouská spisovná němčina, vykání *Sie*; automatická validace a ruční kontrola evidované zvlášť (zadání etapy 8) | ✅ automaticky / ✅ ručně (Claude) / ⏳ rodilý mluvčí | `npm run check:content`; ruční průchod 150 položek, 3 výzev, 4 pohovorů a 42 odkazů do slovníku (PROJECT_STATE, etapa 8) | Automaticky bez nálezů. Ručně opravené české významy, příklad, vazby, poznámky u jmen bez plurálu a varianta věty. Všech 25 vět, které se hodnotily automaticky, přešlo na volný překlad. Všech 9 úloh s výběrem má `whyCz`. | kontrola rodilým mluvčím (O16) |

## 10. Kvalita a publikace

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R26 | Testy a build v rozpočtu ≤ 300 kB gzip | ✅ | `npm test`, `npm run build`, `npm run test:e2e` (etapa 10) | 237 testů prošlo, 1 vynechaný; 23 testů v prohlížeči (V11); JS 68,3 + 114,3 kB gzip, CSS 9,2 + 0,7 kB gzip, HTML 0,9 kB, celkem asi 193 kB. Build je reprodukovatelný (V06). | – |
| R27 | Přístupnost: klávesnice, viditelný fokus, kontrast, `lang`, `aria-live`, omezené animace | ✅ v Chromiu a Chrome | E2E `keyboard`, `interview_keyboard`, `reduced_motion`, `lesson_state`, `umlaut_caret`, `listening`, `stage9_ui`; axe-core 4.14; `probe2`; výpočet kontrastu (etapa 9) | Axe na 32 obrazovkách v E2E a 33× v auditu bez nálezů. Po reloadu je fokus na zbývající volbě. S `prefers-reduced-motion` se animace vypnou. Kontrast textu ≥ 5,7 : 1, ovládacích prvků ≥ 3,1 : 1 (spočítaný z hodnot). Rozdíly ve volném překladu čtečka nečte jako chybu, úroveň čte jako orientační. Etapa 10: axe na 32 obrazovkách v Chromiu i Chrome bez nálezů (V23), ruční průchod klávesnicí 14 obrazovek bez problému (V24). | čtečka obrazovky (Z13, O26) |
| R28 | Úzké zobrazení, dlouhá německá slova a speciální znaky | ✅ | E2E `narrow`, `mobile` a `stage9_ui` (320 a 360 px); `wordbreaks.py` (etapa 9) | 11 obrazovek bez vodorovného posuvu; ä ö ü ß a „ “ se zobrazují. Od etapy 9 se dlouhé slovo nerozdělí: na 7 obrazovkách ve 4 šířkách 0 rozdělených slov (dřív 44). | – |
| R29 | GitHub Pages: `ci.yml` pro pull requesty a push do `main`, ruční `deploy.yml` (zadání v1.0, upřesněné v etapě 11) | ✅ | actionlint 1.7.12 se shellcheck 0.11.0; E2E `pages_paths`; Playwright v repozitáři; porovnání s aktuální dokumentací Actions (etapa 11, D109); běh na GitHubu (etapa 12, P04–P07) | bez nálezů. CI na pull requestu: lint, typecheck, test, build, testy v Chromiu, nepovinně Firefox a WebKit; nic nenasazuje. Deploy jen ručně z `main`: stejné Node a lockfile, kontroly, build, testy nad tímto buildem, upload, nasazení v `github-pages`, souběh bez rušení. Build funguje pod libovolnou podcestou. Na GitHubu 2026-11-17: CI zelené, Deploy úspěšný. | – |
| R30 | Prohlížeče a zařízení mimo Chromium | ✅ Google Chrome, Firefox, WebKit / ⏳ ostatní | Playwright v repozitáři a E2E (41 scénářů) v Google Chrome for Testing 153 (etapa 10, V12, V13); úloha `e2e-other-browsers` v CI (etapa 12, P05) | Chrome 153: 21/21 testů v repozitáři a 576/576 kontrol E2E. Firefox 155: 21/21 a WebKit 26.6 včetně emulace iPhonu 13: 23/23 (CI, 2026-11-17). Safari na macOS a iOS, Edge a skutečné telefony neověřené. | Z13 |
| R31 | README pro náboráře a vývojáře; odkaz na demo až po publikaci; licenci volíte vy | ✅ / ⏳ licence | obsah README (přepsaný v etapě 11), 4 skutečné screenshoty, `docs/QUICKSTART_CS.md`; odkaz na demo po ověření živé adresy (etapa 12, P11) | README: účel, funkce, automatické hodnocení a sebehodnocení, skutečné ukázky, stack, rychlé spuštění, kontroly, podporovaná prostředí podle kontrol, datový tok, ukládání, rozšíření obsahu, nasazení, odkaz na živé demo. Licence čeká. | O02 (Z15) |
| R32 | Soukromí: žádné externí požadavky, jen fiktivní data | ✅ | E2E sledování sítě; `check:content` (e-maily, telefony, veřejné IP, seznam zakázaných výrazů) | žádný požadavek mimo lokální server; kontrola obsahu prošla | – |

## 11. Rozhraní a přístupnost (etapa 9)

| ID | Požadavek | Stav | Ověření | Výsledek | Zbývá |
|---|---|---|---|---|---|
| R37 | Jeden vizuální směr (světlé pozadí, tmavý text, jedna akcentní barva) z malého souboru designových hodnot: barvy, typografie, mezery, šířka obsahu, rámečky, fokus | ✅ | `src/styles/tokens.css` (D88); `app.css` bez vlastních barev; výpočet kontrastu | Jedna akcentní modrá, červená jen pro chyby a nebezpečné akce. Mezery po 4 px, šířky 72 / 44 / 40 rem, fokus 3 px modrý. Kontrast textu ≥ 5,7 : 1, ovládacích prvků ≥ 3,1 : 1. | tmavý režim (Z10, O10) |
| R38 | Studijní obrazovka: zvýrazněné německé zadání, místo pro odpověď, hlavní akce a zpětná vazba; čitelné téma, průběh a možnost odchodu; vysvětlení ovládání tam, kde se uživatel rozhoduje | ✅ v Chromiu | E2E `stage9_ui`, `main_flow`, `keyboard`; `probe2`; snímky | Hlavička má druh lekce, téma karty, „Karta n z N“, `<progress>` „Průběh lekce“ a „Ukončit lekci“ s vysvětlením. Nad polem je úkol, pod tlačítky „Jak se odpověď hodnotí“. U hodnocení je věta, kdy se karta vrátí, u „Zahodit a začít novou“ důsledek. | – |
| R39 | Dnes: skutečný počet splatných položek, krátká doporučená lekce, pokračování rozpracované lekce; po dokončení zopakování chyb nebo návrat | ✅ v Chromiu | E2E `stage9_ui`, `main_flow`, `counters`, `plan_matches_lesson` | Blok „Doporučená lekce“ má počty ze stejné funkce jako lekce (D77) a větu „Trénink nabídne N karet …“. Rozpracovaná lekce je první, s průběhem. Souhrn nabízí „Zopakovat chyby (n)“ a „Zpět na Dnes“. | – |
| R40 | Slovník: aktivní filtry, počet výsledků, vyčištění filtrů, použitelný stav bez výsledků | ✅ v Chromiu | E2E `stage9_ui`, `dictionary` | Štítky s křížkem a „Zrušit vše“, počet položek (`aria-live`). „Nic nenalezeno“ s důvodem a „Zrušit hledání a filtry“. Na telefonu „Filtry (n)“. | – |
| R41 | Pohovor: jasně odlišené fáze otázky, doplňující otázky a rozboru | ✅ v Chromiu | E2E `stage9_ui`, `interview` | Tři pojmenované fáze, aktuální s `aria-current`, hotové s ✓ a textem pro čtečky. Doplňující otázka má boční pruh a nad sebou hlavní otázku, rozbor horní pruh. | – |
| R42 | Nastavení: přehledně jazyk ovládání, hlas a zálohování pokroku; stav ukládání srozumitelný v okamžiku problému | ✅ v Chromiu | E2E `stage9_ui` (desktop i telefon), `progress_backup`, `write_failure` | Sekce v pořadí jazyk ovládání, hlas a předčítání, pokrok a záloha, statistiky. „Stav ukládání“ slovy se značkou. Při chybě zápisu na posunuté stránce se ukáže upozornění tam, kde uživatel je, se „Zobrazit možnosti“. | připomínka zálohy (Z06) |
| R43 | Modální dialog pracuje s fokusem a po zavření ho vrátí | ✅ v Chromiu | `probe2` (desktop i telefon), E2E `corrupt`, `progress_backup` | Fokus začíná na bezpečné volbě, u souhrnu na nadpisu. Tab nevyjde na stránku za dialogem, Esc zruší. Fokus se vrátí na tlačítko, které dialog otevřelo, u importu na výběr souboru. Zkratky lekce za dialogem nepůsobí. | Safari (Z13) |
| R44 | Stavy a přístupnost: disabled, hover, focus, chybný vstup, prázdná data, dlouhé věty; sémantické prvky, textové popisky, klávesnice; oznámení pro čtečku; zpětná vazba bez rozlišování barev; kontrast; jazyk stránky a německých úseků | ✅ v Chromiu / ⏳ čtečka | `states.py` (58 stavů 20 prvků); E2E `keyboard`, `interview_keyboard`, `stage9_ui`; axe; `probe2`; výpočet kontrastu | Stavy jsou sjednocené (D102). Chybný vstup má text i červenou čáru. Verdikt má vždy značku ✓ nebo ✕ a slovo, rozdíly jsou podtržené různým stylem. Kartička nechá čtečku přečíst i význam (Z44). `lang` mají i německé citace (D100). | skutečná čtečka (Z13, O26) |
| R45 | Layout při 360 × 800, 768 × 1024 a 1440 × 900; zvětšení 200 %; odpověď viditelná při mobilní klávesnici; ovládání jednou rukou; omezení dekorativního pohybu | ✅ emulace v Chromiu / ⏳ zařízení | `audit.py` (42 obrazovek × 3 rozlišení), `probe2` | Bez posuvu a přetečení. Při 200 % bez vodorovného posuvu. Pole a tlačítko zůstanou nad klávesnicí, i když se otevře až po 700 ms. Hodnocení a další krok jsou dole, dialog je spodní panel. S `prefers-reduced-motion` jsou animace vypnuté. Od etapy 10 je i na nízkém telefonu (375 × 553, 320 × 568) a na šířku (740 × 360) odkrytý význam a verdikt vidět nad lištou hodnocení (Z46, V21). | skutečný telefon (Z13, O12, O25) |
| R46 | Texty CZ/DE (tlačítka, chyby, nastavení); český překlad studijní věty zůstává i v německém ovládání; dlouhá německá slova, přetékání karet a posun layoutu po zobrazení řešení | ✅ | `i18n.test.ts`; E2E `german_ui`, `narrow`, `stage9_ui`; `wordbreaks.py`; `probe2` | Nové texty jsou v obou jazycích (stejný typ hlídá TypeScript), „Jazyk ovládání“ jednotně. Čeština zůstává s `lang="cs"`. Rozdělená slova 44 → 0. Bez přetečení na 320–1440 px, odkrytí stránku neposune. | kontrola rodilým mluvčím (O16) |

## 12. Závěrečné ověření (etapa 10)

Všechno běželo 2026-11-16 na finálním stavu etapy 10, tedy i po opravách Z46 a Z47. Pomocné skripty mimo repozitář (D04) mají v tabulce příponu `.py`, testy v repozitáři jsou ve složce `e2e/`.

**Prostředí:**
- **L**: můj cloudový pracovní prostor, Linux, Node 26.13.0 a npm 10.9.9; čisté kopie i na Node 22.23.4 a 24.22.2 a s npm 11.21.2 na Node 24.
- **Cr**: Chromium 153.0.8010.12 (Playwright 1.63.0, headless shell).
- **Ch**: Google Chrome for Testing 153.0.8010.12 (Playwright, kanál `chrome`).
- **P**: produkční build pod podcestou. Buď `vite preview --base /cloud-admin-deutsch-at/` na portu 4180 (testy v repozitáři), nebo statický server Pythonu s `/cloud-admin-deutsch-at/`, `/muj-portfolio-demo/` a kořenem domény (ostatní skripty). Ten jako GitHub Pages přesměruje adresu bez koncového lomítka.

Testy v prohlížeči používají smyšlená data a falešný `speechSynthesis`. Každý test v repozitáři selže při chybě nebo varování v konzoli, nezachycené výjimce, nativním dialogu, odpovědi ≥ 400 a požadavku na jiný server.

| ID | Kontrola | Prostředí | Příkaz nebo postup | Očekávání | Výsledek | Zbývající problém |
|---|---|---|---|---|---|---|
| V01 | Lint | L | `npm run lint` | exit 0 bez nálezů, i ve složce `e2e/` | ✅ exit 0, 0 nálezů | – |
| V02 | Typy | L | `npm run typecheck` (`tsc -b`: aplikace, konfigurace, nově `tsconfig.e2e.json`) | exit 0 | ✅ exit 0 | – |
| V03 | Validace studijních dat | L | `npm run check:content` | exit 0 | ✅ 22 testů prošlo, 1 vynechaný (výpis statistik) | – |
| V04 | Cílené testy | L | `npm run test:answers`, `test:scheduler`, `test:reload`, `test:stats`, `test:import` | exit 0 | ✅ 46 / 47 / 44 / 20 / 11 testů | – |
| V05 | Celá sada z čisté kopie | L | kopie bez `node_modules` a `dist`; `npm ci` a `npm run check`; na Node 26 navíc `CI=1 npm run test:e2e` | exit 0, bez varování, lockfile beze změny | ✅ Node 22, 24 i 26 a npm 11: exit 0, 237 testů, 1 vynechaný, 0 řádků s varováním nebo chybou, lockfile beze změny. Na Node 26 `test:e2e` 23/23. | skutečný Windows a macOS (R03) |
| V06 | Reprodukovatelný produkční build | L | `npm run build` dvakrát po sobě, k tomu build z čisté kopie (V05); SHA-256 všech souborů `dist/` | stejné soubory, stejné hashe | ✅ 15 souborů, ve všech třech buildech shodné hashe (`index-CpVPZXr1.js`) | – |
| V07 | Závislosti | L | `npm ls --omit=dev`, `npm audit`, `npm audit --omit=dev`, `npm outdated` | jen nutné běhové závislosti, žádná zranitelnost | ✅ Běhové závislosti: `react`, `react-dom` a 2 balíčky písem. 0 zranitelností. Novější jsou jen vite 8.3.8, oxlint 1.94, @vitejs/plugin-react 6.3.0 a @types/node 26; žádná oprava je nevyžaduje, proto zůstávají. | – |
| V08 | Velikost zdrojů | L, Cr | výpis `vite build`; síťový log první návštěvy (Dnes, lekce, heslo, pohovor) | JS a CSS do 300 kB gzip; stahuje se jen to, co stránka potřebuje | ✅ JS 114,3 + 68,3 kB gzip, CSS 9,2 + 0,7 kB, HTML 0,9 kB, celkem asi 193 kB gzip. První návštěva stáhne 8 souborů, z toho 3 písma (latin a latin-ext Atkinson, latin Literata; 163 kB woff2). Dalších 5 podmnožin Literaty (cyrilice, řečtina, vietnamština; 169 kB) je v `dist`, ale prohlížeč je nestahuje. | – (vědomě beze změny, D105) |
| V09 | Soubory buildu a odkazy | L, Cr | `dist_audit.py`: odkazy v `index.html`, `url()` v CSS, adresy v JS, zdrojové mapy; síťový log | všechny odkazy relativní a existující, nic z cizího serveru | ✅ 15 souborů. 5 odkazů v `index.html` a 9 `url()` v CSS existuje, vše relativně (`./`). Žádné zdrojové mapy. V JS jsou jen jmenné prostory Reactu a odkaz na zdroj Arbeiterkammer Wien, který se nestahuje. Studijní data jsou součástí JS a slovník ukáže všech 150 položek. | – |
| V10 | Pages podcesta: přímé otevření a reload | L, Cr, P | `release.spec.ts`: 11 pohledů včetně neznámé adresy a neexistujícího hesla; E2E `pages_paths`: 3 základní adresy × 9 pohledů | každý pohled se otevře přímo i po reloadu, žádná odpověď ≥ 400 | ✅ vše; cesta zůstává `/cloud-admin-deutsch-at/` | Adresu bez koncového lomítka (`/cloud-admin-deutsch-at`) server Pythonu i GitHub Pages přesměrují (301). `vite preview` vrátí 404, to je chování náhledového serveru, ne aplikace. |
| V11 | Playwright testy v repozitáři | L, Cr (1280 × 900; telefon 360 × 800 a 375 × 553), P | `npm run test:e2e` | všechny projdou | ✅ 23/23 i s buildem za 34 s; další 2 běhy bez selhání | – |
| V12 | Totéž v Google Chrome | L, Ch, P | `E2E_BROWSERS=chrome npx playwright test` | jako V11 | ✅ 21/21 (testy pro počítač); další běh bez selhání | – |
| V13 | Široký průchod mimo repozitář | L, Cr i Ch, P | `e2e_check.py`: 41 scénářů, 576 kontrol, axe-core 4.14 | 576/576 | ✅ Cr 576/576, Ch 576/576 (finální build). V Ch dřív jednou selhala jen pomocná kontrola „první karta opravdu spadla“: `chrome://crash` kartu neshodil. Převzetí zápisu po skutečném pádu karty (CDP `Page.crash`) v Ch prošlo zvlášť. | – |
| V14 | Průchod 1: nový uživatel | Cr | `study.spec.ts` | Dnes → lekce → reload: správné počty, termíny a další opakování | ✅ Téma „career“: lekce vzala všech 9 otevřených karet. Kartičky („Umím“) mají termín za 3 dny, psaní a gramatika („Nevím“) zítra. Po reloadu 0 k opakování a 3 odemčené karty psaní. Heslo ukazuje „další opakování za 3 dny“ a „zítra“. Po druhé lekci Dnes napíše „Nejbližší opakování: zítra (n karet).“, počet sedí s uloženými termíny, i po reloadu. | – |
| V15 | Průchod 2: rozpracovaná lekce a rychlé opakování | Cr | `study.spec.ts`; `double_actions.py` | reload před odpovědí i po ní zachová stav; opakovaná akce nic nezdvojí | ✅ Reload před kontrolou: stejná karta, prázdné pole, nic nezapočítáno. Po kontrole: stejný výsledek, žádné pole. Dvojklik na „Zkontrolovat“, Enter ×3 a dvojklik na „Umím“ dají jedno hodnocení a další kartu nehodnotí. Dvojkliky na krocích pohovoru, výzvy a lekce (7 případů) nic nepřeskočí ani nezdvojí. | – |
| V16 | Průchod 3: psaná odpověď | Cr | `answers.spec.ts` | uvedená varianta, gramatická chyba, speciální znak a volná formulace se rozliší | ✅ Uvedená varianta: „Správně – povolená varianta“. *der Authentifizierungsmethode*: „Chyba“ a „Člen: správně „die“ (ženský rod), ne „der“.“. *prufe*: „Chyba“ a „Chybí ü …“; s ü z lišty na místě kurzoru „Správně“. Jiná formulace: „Porovnání se vzorem“, tři hodnocení, uloženo jako porovnání s vlastním „Umím“. | – |
| V17 | Průchod 4: slovník a odkaz z pohovoru | Cr | `dictionary.spec.ts` | hledání, filtry, prázdný výsledek; odkaz z rozboru otevře odpovídající heslo | ✅ Hledání bez diakritiky. Tři štítky (hledání, téma, druh), přežijí reload, každý se zruší zvlášť, „Zrušit vše“ vrátí fokus do hledání. „Nic nenalezeno“ s tlačítkem. Odkaz z rozboru otevře heslo se stejným slovem (`lang="de-AT"`) a „Použito v pohovoru“. „Zpět k pohovoru“ vrátí rozpracované sebehodnocení. | – |
| V18 | Průchod 5: pohovor a výzva; odchod z obrazovky | Cr (falešný `speechSynthesis`, řízené hodiny) | `interview.spec.ts`; `leaks.py` | souhrny dávají smysl; odchod zruší časovač i hlas | ✅ Pohovor se 3 otázkami: „Souhrn pohovoru“ s počty podle kritérií a „Na co se zaměřit“, i po reloadu. Výzva: „Výsledek výzvy“ 2 z 5 (40 %), výsledek každého kroku, „Zopakovat chyby (3)“. Odchod do Slovníku i na doplňující otázku zruší přehrávání a zastaví časovač; po návratu stojí na výchozí délce. Nikdy nehrají dvě promluvy naráz. | skutečné hlasy (Z13) |
| V19 | Průchod 6: záloha | Cr, druhý profil prohlížeče | `backup.spec.ts`; `write_fail_import_reset.py` | export → import v novém profilu obnoví data; neplatný, starší a novější formát skončí podle pravidel; reset a chyba zápisu podle README | ✅ Nový profil: shodné karty a termíny, lekce s čekající odpovědí, pohovor, nastavení, statistiky i počty na Dnes. Neplatný JSON, cizí soubor, novější formát (2) a schéma 99: odmítnuto s důvodem, data beze změny. Export verze 1.0 (schéma 4) se převede. Reset: dialog, „Zpět“ nic nezmění, smaže jen klíče aplikace. Chyba zápisu: banner s exportem neuložené změny, „Pokračovat bez ukládání“, „Znovu ukládat“. Import i smazání při chybě úložiště nechají data beze změny a řeknou to jednou (Z47). | – |
| V20 | Průchod 7: CZ/DE a dvě karty | Cr | `tabs-language.spec.ts`; E2E `two_tabs`, `tabs_without_locks`, `reset_other_tab` | přepnutí jazyka zachová rozpracované studium; zápis podle pravidla jedné zapisující karty | ✅ Odkrytá karta, hodnocení, rozepsaný text v poli i jazyk po reloadu zůstanou. Druhá karta je jen pro čtení: změnu neuloží a řekne to, sleduje uložený stav a zápis převezme tlačítkem „Pracovat v této kartě“. | – |
| V21 | Průchod 8: telefon, klávesnice, dialogy, omezené animace, konzole | Cr (dotyk 360 × 800, 375 × 553, 320 × 568, 740 × 360 a dalších 5 velikostí) | `mobile.spec.ts`, `release.spec.ts`; `reveal_visible.py`, `feedback_visible.py` | použitelné ovládání, žádná nevysvětlená chyba v konzoli | ✅ Po opravě Z46 je odkrytý význam i verdikt vidět nad lištou hodnocení na všech 10 velikostech. Hodnocení má aspoň 44 px a je nad navigací. Dialog se vejde na obrazovku. Ovládání klávesami Tab, mezerník, 1–3, Enter a Esc. Animace odkrytí 0,18 s, s omezenými animacemi 0,00001 s. V konzoli 0 chyb a varování ve všech bězích. | skutečný telefon (Z13) |
| V22 | Úniky časovačů a posluchačů, opakované přehrávání | Cr | `leaks.py` a `leaks_long.py`: pohovor s časovačem a předčítáním (10× a 40×), Poslech (přehrát, zastavit, znovu; 10×), lekce (10×), výzva se stopkami (6×), dialog (10×), vše bez reloadu | počty s opakováním nerostou | ✅ Po odchodu běží 0 intervalů. Čeká 1 časovač: přepnutí dne o půlnoci. Posluchače na `window` a `document` (6, v Nastavení 7), uzly DOM a posluchače na prvcích se nemění. Každá promluva se zrušila (40/40) a nikdy nehrály dvě naráz. Halda po úklidu: +0,7 MB v prvních 10 cyklech (zahřátí), pak +0,07 až 0,11 MB na 10 cyklů. | – (problém se neukázal, optimalizace nebyla potřeba) |
| V23 | Přístupnost automaticky | Cr, Ch | axe-core 4.14 v E2E | žádný vážný ani kritický nález | ✅ 32 obrazovek v Cr i Ch, 0 nálezů | – |
| V24 | Ruční průchod klávesnicí | Cr | `keyboard_walk.py`: Tab od začátku do konce stránky na 14 obrazovkách se záznamem pořadí, `:focus-visible`, obrysu a polohy; dialog Tab i Shift+Tab; prošel jsem záznam | logické pořadí, fokus vždy vidět, žádná past, Esc vrátí fokus | ✅ 14 obrazovek, 232 zastávek, 0 problémů. První je „Přeskočit na obsah“, pak záhlaví, obsah v pořadí čtení a patička. Dialog drží fokus na svých 3 tlačítkách a liště prohlížeče, Esc vrátí fokus na „Smazat pokrok…“. | Dvě rozbalení „Zobrazit česky“ u otázky pohovoru (kontext a otázka) a dvě „Zobrazit překlad“ v rozboru mají stejný název. V kontextu jsou jednoznačná, se čtečkou neověřeno (O26). |
| V25 | Workflow | L | `actionlint` 1.7.12 | bez nálezů | ✅ `ci.yml` (nové úlohy `e2e` a `e2e-other-browsers`) i `deploy.yml` bez nálezů | běh na GitHubu po vašem pushi (Z15) |

**Neověřeno (vynechané kontroly):**
- Firefox 155 a WebKit (jádro Safari) v Playwrightu. V prostředí nejsou nainstalované a pravidla prostředí zakazují `playwright install`. Další krok: `npx playwright install firefox webkit` a `E2E_BROWSERS=firefox,webkit npm run test:e2e`, nebo výsledek úlohy `e2e-other-browsers` po pushi (Z13).
- Microsoft Edge, Safari na macOS a iOS, Chrome na Androidu, skutečné telefony a jejich klávesnice.
- Čtečka obrazovky (NVDA, VoiceOver) a vynucené barvy (Windows High Contrast).
- Skutečné hlasy Web Speech API.
- Běh workflow na GitHubu a živá adresa na GitHub Pages (Z15).
- Instalace a běh na skutečném Windows a macOS; ověřené je jen rozlišení lockfilu pro win32 a darwin.
- Pomalá síť, offline režim a plné úložiště skutečného prohlížeče. Chyba zápisu je ověřená simulací `QuotaExceededError`.

**Připravenost:** otevřená závada P0 ani P1 nezbývá a obě závady nalezené v etapě 10 (P2) jsou opravené a znovu ověřené. Aplikace je připravená na balení pro vydání. Neověřené body výše publikaci neblokují, ale podporu dalších prohlížečů uvádějte až po jejich ověření.

## 13. Balení a příprava vydání (etapa 11)

Všechno běželo 2026-11-16 v dočasných kopiích projektu mimo pracovní složku. Prostředí jsou stejná jako v kap. 12 (L, Cr), navíc npm 11.21.2 na Node 26 a Node 20.20.2 pro kontrolu odmítnutí. Kód aplikace se nezměnil a build je shodný s etapou 10.

| ID | Kontrola | Prostředí | Příkaz nebo postup | Očekávání | Výsledek | Zbývající problém |
|---|---|---|---|---|---|---|
| B01 | Verze Node.js | L | `.nvmrc`, `engines`, `node-version-file` v `ci.yml` a `deploy.yml`, dokumentace | jedna doporučená verze všude, kompatibilní s balíčky | ✅ Node 26 LTS v `.nvmrc`, oba workflows ho čtou z `.nvmrc`, README, `docs/README.cs.md` a `docs/QUICKSTART_CS.md` uvádějí 26 LTS. `engines` je rozsah Vitestu 5.1 (D107). | Node 22 po 30. 4. 2027 vyřadit (O28) |
| B02 | Čistá instalace s verzí, kterou dostanete na Windows | L, Node 26.13.0, npm 11.21.2 | dočasná kopie; `npm ci`, `npm run lint`, `typecheck`, `test`, `build` | exit 0, lockfile beze změny | ✅ `added 56 packages … in 2s`, lockfile beze změny, vše exit 0, 237 testů, 1 vynechaný; build shodný s etapou 10 | – |
| B03 | Další podporované verze | L, Node 24.22.2 a 22.23.4, npm 10.9.9 | dočasná kopie; `npm ci`, `npm run check` | exit 0 bez varování | ✅ obě exit 0, 0 varování, lockfile beze změny, 237 testů | – |
| B04 | Nepodporovaná verze | L, Node 20.20.2 | `npm ci` | instalace se hned zastaví se srozumitelnou chybou | ✅ exit 1, `EBADENGINE`, řádky `Required` a `Actual` (D108) | – |
| B05 | Windows a macOS | L | `npm ci --os=win32 --cpu=x64` a `--os=darwin --cpu=arm64 --ignore-scripts` | lockfile nainstaluje nativní balíčky platformy | ✅ oxlint, Rolldown, TypeScript a Lightning CSS pro obě platformy, macOS i `fsevents` | skutečný Windows (R03, O12) |
| B06 | Skripty `dev`, `build`, `preview` | L, Node 26, npm 11 | z čisté kopie `npm run dev` a `npm run preview` (po buildu), `curl`; obsazené porty 5173 a 4173 | server odpoví na výchozím portu; při obsazeném vezme další | ✅ HTTP 200 na `http://localhost:5173/` a `http://localhost:4173/`; obsazený port: `Port 5173 is in use, trying another one...`, pak 5174 a 4174 | – |
| B07 | Testy v prohlížeči z čisté kopie | L, Cr, Node 26, npm 11 | `CI=1 npm run test:e2e` | 23 testů projde | ✅ 23/23 za 36,7 s | – |
| B08 | Názvy skriptů v dokumentaci a workflows | L | porovnání `package.json` s README, `docs/README.cs.md`, `docs/QUICKSTART_CS.md`, `ci.yml` a `deploy.yml` | `lint`, `typecheck`, `test`, `build`, `check`, `test:e2e` všude stejně | ✅ shodné; workflows volají `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e` nebo `npx playwright test` nad hotovým buildem | – |
| B09 | Workflows podle aktuální dokumentace | L | porovnání s dokumentací GitHub Pages a s README a vydáními checkout, setup-node, upload-pages-artifact a deploy-pages; `actionlint` 1.7.12 se shellcheck 0.11.0 | nejnovější hlavní verze, oprávnění, prostředí, návaznost, souběh; CI na pull requestu nic nenasazuje | ✅ checkout v7, setup-node v7, upload-pages-artifact v5, deploy-pages v5. Deploy jen ručně z `PUBLISH_BRANCH`, `needs: build`, `pages: write` a `id-token: write` jen u nasazení, prostředí `github-pages` s adresou, souběh `pages` bez rušení. Kontroly a testy nad buildem před uploadem, bez cache závislostí. actionlint bez nálezů (D109). | ✅ běh na GitHubu v etapě 12 (P04–P07) |
| B10 | Pages podcesta, routování, `BASE_URL` | L, Cr, P | `vite.config.ts`; `grep import.meta.env` v `src/`; testy pod `/cloud-admin-deutsch-at/` (etapa 10, V10) | podcesta odvozená od repozitáře nebo jedno popsané místo | ✅ Nic se nenastavuje: `base: './'` a hash routování fungují pod libovolným názvem. `BASE_URL` (`./`) kód nepoužívá. Pro `BrutusFilip/cloud-admin-deutsch-at` vyjde `https://brutusfilip.github.io/cloud-admin-deutsch-at/`. Jediné místo pro případnou změnu je komentované v `vite.config.ts` (D110). | ✅ živá adresa ověřená v etapě 12 (P07, P08) |
| B11 | Soubory ke commitu | L | kopie s `node_modules`, `dist`, `test-results`, `playwright-report`, exportem, `notes.local.md` a `.env`; `git init` a `git add -A` | žádné závislosti, buildy, výstupy testů, exporty ani lokální soubory | ✅ 154 souborů ke commitu, nic nežádoucího; `.npmrc`, `.nvmrc`, oba workflows a lockfile jsou mezi nimi | – |
| B12 | README pro náboráře a vývojáře | L | obsah, `md_check.py`, 4 screenshoty z produkčního buildu (`readme_shots.py`) | účel, funkce, stack, rychlé spuštění, kontroly, datový tok, ukládání, rozšíření, nasazení, automatické hodnocení a sebehodnocení, prostředí podle kontrol, pravdivé ukázky | ✅ všechny části; ukázky výsledků jsou ty, které ověřují testy; screenshoty s ilustračními daty (1440 × 900 a 390 × 844), 0 chyb v konzoli | ✅ odkaz na demo doplněný v etapě 12 (P11) |
| B13 | Návod pro Windows | L | `docs/QUICKSTART_CS.md`; hlášky `EBADENGINE` a obsazeného portu ověřené na Linuxu | složka, Node a npm, instalace, dev server a jeho zastavení, náhled, pokrok, potíže (chybějící `package.json`, Node, port, lockfile), vzdálený server, publikace | ✅ všechny části, 10 řešených potíží, SSH tunel s odlišením adresy serveru a PC, přesné příkazy k publikaci | skutečný běh na Windows (O12) |
| B14 | Licence | – | hledání rozhodnutí v projektu a zadáních | jen existující oprávněné rozhodnutí | ⏳ rozhodnutí neexistuje, proto bez souboru `LICENSE`; README: „all rights reserved“ | O02, rozhodnete vy |

## 14. Publikace (etapa 12)

Všechno proběhlo 2026-11-17. Kód aplikace se nezměnil a nasazený build je shodný s etapami 10 a 11.

**Prostředí:**
- **L** a **Cr** jako v kap. 12.
- **GA**: GitHub Actions, ubuntu-latest (Ubuntu 26.04), Node 26.13.1, prohlížeče Playwright 1.63.
- **W**: integrovaný prohlížeč aplikace Claude na vašem Windows (Chromium 156). Velikost okna byla emulovaná: 1280 × 900 a 375 × 812 s dotykem.

| ID | Kontrola | Prostředí | Příkaz nebo postup | Očekávání | Výsledek | Zbývající problém |
|---|---|---|---|---|---|---|
| P01 | Výchozí stav gitu a GitHubu | L | stav gitu a remotes, `gh auth status` bez tokenů, seznam repozitářů | jednoznačný cíl a viditelnost | ✅ Složka nebyla git repozitář, remotes žádné. `gh` přihlášené jako `BrutusFilip`. Cíl `BrutusFilip/cloud-admin-deutsch-at`, veřejný, podle vašeho zadání (D111). | – |
| P02 | Soubory k publikaci | L | `git init -b main`, `git add -A`, porovnání s balíkem etapy 11; hledání osobních a interních údajů, tajných hodnot, exportů a lokálních souborů; metadata PNG | jen soubory projektu | ✅ 154 souborů, stejné jako balík etapy 11, nic nežádoucího; screenshoty bez textových metadat | – |
| P03 | Kontroly před commitem | L, Cr, Node 26.13.0, npm 11.21.2 | `npm run check`, `CI=1 npm run test:e2e` | exit 0 | ✅ 237 testů prošlo, 1 vynechaný; 23/23 v prohlížeči; build shodný s etapou 10 | – |
| P04 | CI po prvním pushi | GA | push `690451b`, běh 44042153770 | povinné úlohy zelené | ✅ lint, typy, testy, build; Chromium 23/23. Nepovinné ❌: Firefox 20/21 a WebKit 22/23, chyby v testech (P05). | – |
| P05 | Firefox a WebKit | GA, L, Cr | Oprava testů v `19c3db1` (D112). Lokálně Chromium 23/23, oba změněné soubory třikrát 15/15, telefonní testy s velikostí iPhonu 13 v Chromiu 2/2. CI běh 44043364589. | všechny testy projdou | ✅ všechny 4 úlohy zelené: Chromium 23/23, Firefox 155 21/21, WebKit 26.6 23/23 (počítač i iPhone 13) | Safari na macOS a iOS (Z13); povinnost úloh (O30) |
| P06 | GitHub Pages | – | Settings → Pages → Source: GitHub Actions | Pages zapnuté | ✅ nastavili jste vy, API relace to odmítla (403); `has_pages: true` | – |
| P07 | Nasazení | GA | Deploy z `main`, běh 44043735149; po zapnutí Pages znovu jen úloha nasazení | úspěšné nasazení | ✅ Druhý pokus úspěšný, `page_url` https://brutusfilip.github.io/cloud-admin-deutsch-at/, nasazený `19c3db1`. Předtím 2× 404 „Ensure GitHub Pages has been enabled“, kontroly a build vždy ✅. | – |
| P08 | Assety, navigace a reload na živé adrese | W | síť a konzole; 15 souborů přes `fetch` a SHA-256; Dnes, Procvičování, Pohovor, Slovník; `#/slovnik/access-v-006` a obnovení | vše 200, bez chyb, build shodný | ✅ Při prvním načtení 8 požadavků, všechny HTTP 200 a jen na `brutusfilip.github.io`. Konzole bez zpráv, 15/15 souborů shodných. Navigace s `aria-current`. Po obnovení stejné heslo (HTTP 200). | – |
| P09 | Lekce se zachováním pokroku | W | „Začít trénink“: 10 karet (6 kartiček, 3 věty, 1 slovosled); obnovení stránky | pokrok po obnovení zůstane | ✅ Souhrn „Prošli jste 10 karet“. Po obnovení 10 karet (schéma 5) s termínem 20. 11. 2026, „Nové 145“ místo 150, „Dokončené lekce 1“. | – |
| P10 | Pohovor a telefon | W | pohovor „Představení a motivace“ až do souhrnu; na 375 × 812 Dnes, Slovník s filtry, Pohovor a kartička | celý průchod pohovoru; navigace dole, nic se neposouvá do strany | ✅ Vzor „Ilustrační“, 5 otázek sebehodnocení, souhrn 1 z 3. Navigace 752–812 px, bez posunu do strany, „Filtry (2)“, hodnocení 81 px nad navigací. Souhrn procvičení jedné karty ukázal Z48. | skutečný telefon (Z13); Z48 |
| P11 | README a dokumentace | L | odkaz na demo v `README.md` a `docs/README.cs.md`, prostředí podle P05 a P08; dokumentační commit a jeho CI | odkaz až po ověření | ✅ doplněno po P08–P10; výsledek CI dokumentačního commitu je v závěrečném předání | – |
| P12 | About repozitáře | – | `gh repo edit --homepage --description` | popis a web dema | ⏳ relace zápis nastavení nesmí (403), krok pro vás je v O31 | O31 |

## 15. Závady podle dopadu

- **P0:** ztráta nebo poškození pokroku.
- **P1:** blokuje spuštění nebo hlavní studijní průchod.
- **P2:** ostatní nedostatky v rozsahu této verze.

| ID | Dopad | Závada | Reprodukce | Stav | Závisí na | Etapa |
|---|---|---|---|---|---|---|
| Z01 | P1 | Poškozená procentová sekvence v adrese shodila celou aplikaci | `#/slovnik/%E0%A4%A` nebo `#/pohovor/%`: prázdná stránka i po reloadu, v konzoli `URIError: URI malformed` | ✅ opraveno v etapě 6 | – | 6 |
| Z02 | P2 | `index.html` otevřený z disku nebo bez JavaScriptu zůstal prázdný bez vysvětlení | `dist/index.html` přes `file://`: prohlížeč zablokuje skripty i styly, stránka zůstane bílá | ✅ opraveno v etapě 6 | – | 6 |
| Z03 | P0, skrytá | Záložka se starší verzí aplikace přepíše data, která mezitím uložila novější verze, včetně novějšího pokroku | Záložka B zapíše stav se `schemaVersion: 5` a kartou na stupni 4. V záložce A (v1.0) stačí přepnout jazyk a v úložišti je zase schéma 4 a stupeň 2. | ✅ opraveno v etapě 7: revize zápisu (D70) a jedna zapisující karta (D72); karta s daty novější verze nic nezapíše a vyzve k obnovení stránky. Unit testy, E2E `newer_version` (reprodukce z auditu) a `tabs_without_locks`. | – | 7 |
| Z04 | P2 | Smazání pokroku v jedné záložce druhá otevřená záložka nepřevezme a svou první akcí ho zapíše zpět | Nastavení → „Smazat pokrok…“ v záložce B; v záložce A přepnout jazyk; v úložišti je zase původní pokrok | ✅ opraveno v etapě 7: karta jen pro čtení smazání převezme. Karta bez zámku hlásí „Pokrok byl v jiné kartě smazán“ a nic nezapíše. Pokryto unit testem a E2E `reset_other_tab`. | Z03 | 7 |
| Z05 | P2 | Chybí záchranná obrazovka pro neočekávanou chybu vykreslení; pád by znamenal prázdnou stránku | preventivní: po opravě Z01 jsem pád nenašel (10 neobvyklých adres, 7 druhů neobvyklých dat, průchod navigací) | ✅ opraveno v etapě 7: `ErrorBoundary` s vysvětlením, „Zpět na Dnes“ a „Načíst znovu“ (D75); E2E `render_error` se simulovanou chybou | – | 7 |
| Z06 | P2 | Pokrok drží jen prohlížeč: chybí `navigator.storage.persist()` a nenásilná připomínka zálohy; Safari a iOS mohou data webu po neaktivitě mazat (neověřeno) | O05 | ❌ zčásti: stav trvalého uložení a žádost v Nastavení hotové (D76), od etapy 9 i „Stav ukládání“ (D94); připomínka zálohy zbývá | – | 7 (hotová část), po vydání (návrh) |
| Z07 | P2 | Lekce jako obsahová jednotka s cílem a rozcvičkou B1 (plán E4.4) | O14: nejdřív rozhodněte, zda ji chcete | ❌ | vaše rozhodnutí O14 | po vydání (návrh) |
| Z08 | P2 | Pohovorová otázka jako poslední krok tréninku (plán E5.6) | O20 | ❌ | Z07 | po vydání (návrh) |
| Z09 | P2 | Slovník: kontext lekcí v detailu hesla (E6.4) a filtr podle stavu karet (E6.5) | – | ❌ | E6.4 na Z07 | po vydání (návrh) |
| Z10 | P2 | Nastavení: délka tréninku, nejvýše nových karet, kdy ukazovat češtinu, výchozí časovač; tmavý režim (plán E7.3, O10) | – | ❌ | Z03 (splněno v etapě 7), protože nová nastavení mění schéma | po vydání (návrh) |
| Z11 | P2 | Rozšíření obsahu o další desítky položek k cíli plánu (asi 300); pro tuto verzi rozsah splněn (R24, D86); O07 | `npm run stats:content` | ❌ | Z07 (lekce jako součást obsahu) | po dokončení této verze (D86) |
| Z12 | P2 | Zdroje k rakouským faktům (O04), druhé doplňující otázky (O19), další případy výzvy a úroveň B1 nebo C1 (O15) | – | ❌ | – | zdroje v etapě 11, zbytek po dokončení této verze |
| Z13 | P2 | Ověření mimo Chromium: Firefox, WebKit a Safari, Edge, iOS, Android, čtečka obrazovky, skutečné hlasy, skutečná klávesnice telefonu (O12, O18, O26) | – | ⏳ zčásti: Google Chrome 153 ověřený v etapě 10 (V12, V13); Firefox 155 a WebKit 26.6 v CI v etapě 12 (P05); živá adresa v Chromiu 156 na Windows (P08–P10). Zbývá Safari na macOS a iOS, Edge, skutečné telefony, čtečka a hlasy. | – | zařízení vy |
| Z14 | P2 | `PLAN.md` kap. 4 popisuje u Pohovoru původní návrh z E0 (celkové hodnocení s termínem opakování, nahrávka, doporučená otázka), který zadání E5 nahradilo (D41, D44, D45) | ruční porovnání dokumentace s aplikací | ❌ | – | 11 |
| Z15 | P2 | Publikace: workflow na GitHubu zatím neběžel, chybí odkaz na živé demo a licence (O02, O22) | – | ✅ zčásti v etapě 12: CI a nasazení proběhly (P04–P07), odkaz na demo je v README (P11). Zbývá licence (O02). | vaše rozhodnutí O02 | 12 |
| Z16 | P0 | Odevzdaná odpověď se neukládala. Po odchodu z lekce nebo reloadu šlo odpovědět znovu a do pokroku se zapsala až druhá odpověď. | psaní: chybná odpověď → Slovník → Dnes → „Pokračovat v lekci“ → správná odpověď: zapsáno „správně / Umím“, stupeň 1, termín za 3 dny | ✅ opraveno v etapě 7: tah lekce (D64, D65). Unit testy v `lesson.test.ts` a `reload.test.ts`, E2E `lesson_state`. | – | 7 |
| Z17 | P0 | Tutéž lekci šlo hodnotit ve dvou kartách; hodnocení jedné karty se ztratilo, karta měla v lekci dvě hodnocení | lekce otevřená ve dvou kartách, v každé jiné hodnocení téže karty: uloženo jen druhé, `reviews: 2` | ✅ opraveno v etapě 7: jedna zapisující karta (D72). Unit test `tabLock.test.ts`, E2E `two_tabs`. | – | 7 |
| Z18 | P0, skrytá | Migrace přepsala původní data bez možnosti obnovy; chyba v migraci by pokrok nevratně poškodila | data verze 3 → první změna: původní text v úložišti nikde | ✅ opraveno v etapě 7: validace před migrací a zachování původních dat (D69, D71). Unit testy, E2E `migration`, `migration_v2`, `migration_backup`. | – | 7 |
| Z19 | P2 | Banner chyby zápisu nenabízel export, přestože pokrok zůstal jen ve stránce | `setItem` vyhazuje `QuotaExceededError` → banner bez exportu | ✅ opraveno v etapě 7 (D74), E2E `write_failure` | – | 7 |
| Z20 | P2 | Statistiky: „Nevím“ a vlastní „Znovu“ sečtené dohromady; počet dokončených lekcí se nevedl; nápověda v pohovoru nezaznamenaná; výzva počítala „uznáno vámi“ jako správně | lekce s „Nevím“ a kartičkou „Znovu“ → souhrn „Znovu 2“ | ✅ opraveno v etapě 7 (D67, D68), `npm run test:stats`, E2E | – | 7 |
| Z21 | P2 | Odkrytá kartička se po reloadu zase zakryla | odkrýt → reload | ✅ opraveno v etapě 7 (D64), E2E `lesson_state` | – | 7 |
| Z22 | P1, jen `npm run dev` | Na vývojovém serveru zůstala i jediná karta jen pro čtení a trénink nešel spustit. React StrictMode tam spouští efekty dvakrát a zámek přidělený po ukončení prvního efektu se neuvolnil. Vzniklo v etapě 7, našel to průchod na dev serveru před předáním. | `npm run dev` → „Začít trénink“ nic neudělá | ✅ opraveno v etapě 7, unit test v `tabLock.test.ts`, průchod na dev serveru 11/11 | – | 7 |
| Z23 | P2, limit | Bez Web Locks API (staré prohlížeče, `http://` adresa z jiného zařízení) nepozná revize zápis jiné karty ve stejném okamžiku; uloží se pozdější a druhá karta pak hlásí zastaralý stav | neověřeno, plyne z `localStorage` bez atomického porovnání a zápisu | ❌ ponecháno: v prohlížečích s Web Locks nenastane. Rozhodnete vy, zda to stačí. | – | – |
| Z24 | P2 | Volný překlad věty: správná, ale neuvedená formulace skončila verdiktem „Chyba“ (25 z 37 vět se hodnotilo jako jednoznačná úloha) | `windows-s-001`: „Bitte starten Sie Ihren Computer neu.“ → „✕ Chyba“, *Ihren* označené jako chyba | ✅ opraveno v etapě 8: věty jako volný překlad s porovnáním a vlastním hodnocením, neutrální označení rozdílů (D78, D81). Testy v `answerCheck.test.ts` a obsahu, E2E `free_translation`, `repro8.py`. | – | 8 |
| Z25 | P2 | Chybějící čárka se hodnotila jako chyba v procvičovaném jevu | přepis `handover-g-003` bez čárky před *dass* → „✕ Chyba, Liší se interpunkce.“ | ✅ opraveno v etapě 8: interpunkce jako kosmetická poznámka s přesným místem (D79). Testy v `answerCheck.test.ts` a `grammar.test.ts`, E2E `grammar` a `free_translation`. | – | 8 |
| Z26 | P2 | Výběr: chybělo vysvětlení, proč je zvolená možnost chybná | `communication-g-001`, možnost s *mich* → jen správné znění | ✅ opraveno v etapě 8: povinné `whyCz`, důvod u zvolené možnosti a sbalené ostatní (D82). Validace, test obsahu, E2E `challenge`. | – | 8 |
| Z27 | P2 | Slovosled: nápověda nejmenovala konkrétní rozdíl; řazení slov nemělo nápovědu vůbec | přepis `windows-g-001` → „Slova jsou správně, liší se slovosled.“ | ✅ opraveno v etapě 8: nápověda jmenuje slova, která stojí jinde, i u řazení slov (D80). Testy v `grammar.test.ts`, E2E `grammar`. | – | 8 |
| Z28 | P2 | Úroveň B1–C1 nebyla označená jako orientační; „bez plurálu“ u jmen, která plurál mají, jen se nepoužívá | heslo `access-v-007`: „Plurál: bez plurálu“, úroveň jen „B2“ | ✅ opraveno v etapě 8 (D84, D85). E2E `dictionary`, test obsahu u jmen bez plurálu. | – | 8 |
| Z29 | P2 | Chyběl režim poslechu | Procvičování: jen kartička, psaní a gramatika | ✅ doplněno v etapě 8: Poslech DE → CZ (D83), E2E `listening` | – | 8 |
| Z30 | P2 | Psaní na telefonu: hlavní akce pod okrajem, s klávesnicí nedosažitelná | 360 × 800, psaní věty: „Zkontrolovat“ na y = 776 px, s klávesnicí (výška 420 px) daleko pod okrajem | ✅ opraveno v etapě 9: úkol nad polem, pravidla ve sbaleném „Jak se odpověď hodnotí“, `keepInView`, navigace se při psaní schová (D92). `probe2`: pole 146–228 px, tlačítka 308–408 px z 420, i s klávesnicí po 700 ms. | – | 9 |
| Z31 | P2 | Posun stránky po odkrytí a kontrole | kartička 360 × 800: „Odkrýt řešení“ → posun o 380 px, slovo nad okrajem; po „Zkontrolovat“ posun o 270 px | ✅ opraveno v etapě 9: fokus bez posunu, přilepené hodnocení a další krok (D92). `probe2`: posun 0, verdikt po kontrole vidět. | – | 9 |
| Z32 | P2 | Hlavička lekce bez tématu karty, slabý průběh, malé „Ukončit lekci“ | lekce přes všechna témata: téma nikde; průběh 3 px | ✅ opraveno v etapě 9 (D99), E2E `stage9_ui` | – | 9 |
| Z33 | P2 | Dnes: doporučená lekce bez vlastního místa | Dnes s pokrokem: jen věta pod počty | ✅ opraveno v etapě 9 (D96), E2E `stage9_ui` | – | 9 |
| Z34 | P2 | Slovník: aktivní filtry neviditelné, vyčištění jen bez výsledků, na telefonu filtry přes celou obrazovku | `#/slovnik?q=vpn&tema=network` | ✅ opraveno v etapě 9 (D97), E2E `stage9_ui` | – | 9 |
| Z35 | P2 | Pohovor: fáze otázky, doplňující otázky a rozboru špatně odlišené | libovolný pohovor | ✅ opraveno v etapě 9 (D98), E2E `stage9_ui` | – | 9 |
| Z36 | P2 | Nastavení: statistiky uprostřed, nestylovaný výběr souboru, potvrzení v textu stránky | Nastavení | ✅ opraveno v etapě 9 (D91, D95), E2E `progress_backup`, `stage9_ui`, `probe2` | – | 9 |
| Z37 | P2 | Selhání zápisu vidět jen nahoře na stránce | chyba zápisu při posunuté stránce | ✅ opraveno v etapě 9 (D94), E2E `stage9_ui` | – | 9 |
| Z38 | P2 | Dotykové cíle pod 44 px | 360 px: CZ/DE 36 px, malá tlačítka 36 px, odkazy zpět 26 px | ✅ opraveno v etapě 9 (D93); vědomá výjimka lišta znaků 39 × 44 px (O25). `audit.py`. | – | 9 |
| Z39 | P2 | Prohlížeč dělil německý studijní text („freigege-bene“) | 7 obrazovek s dlouhými slovy × 4 šířky: 44 slov rozdělených uvnitř | ✅ opraveno v etapě 9 (D90): 0 rozdělených slov (`wordbreaks.py`, E2E `stage9_ui`) | – | 9 |
| Z40 | P2 | Stavy tlačítek: nebezpečné při najetí modré, bez stisknutí | Nastavení → najetí na „Smazat pokrok…“ | ✅ opraveno v etapě 9 (D102), `states.py` | – | 9 |
| Z41 | P2 | Volný překlad: chybná přehláska spolu s jiným rozdílem bez upozornění | `access-s-001`: „… fur das …“ | ✅ opraveno v etapě 9 (D101), 2 unit testy, E2E `stage9_ui` | – | 9 |
| Z42 | P2 | CSS bez stupnice: 21 různých mezer | `app.css` | ✅ opraveno v etapě 9 (D88) | – | 9 |
| Z43 | P2 | Prvek u spodního okraje mohl skončit pod pevnou navigací telefonu | E2E `narrow`: „Procvičit psaní“ zakrytá navigací | ✅ opraveno v etapě 9: `scroll-padding` (D92), E2E `narrow` | – | 9 |
| Z44 | P2 | Kartička: čtečka po odkrytí neohlásí význam | odkrytí kartičky, fokus na hodnocení | ✅ opraveno v etapě 9: popis skupiny hodnocení obsahuje význam (D99); skutečnou čtečkou neověřeno (O26) | – | 9 |
| Z45 | P2 | Citovaná němčina v českých poznámkách měla `lang="cs"` | heslo `m365-s-002`, poznámka s „Nachrichtenablaufverfolgung“ | ✅ opraveno v etapě 9 (D100), 4 unit testy, E2E `stage9_ui` | – | 9 |
| Z46 | P2 | Nízký telefon: odkrytý význam kartičky zůstal pod přilepenou lištou hodnocení a verdikt gramatické úlohy se posunul nad horní okraj. Týká se výšky do asi 560 px, například iPhonu SE v Safari s lištami (375 × 553). | 375 × 553, dotyk: „Odkrýt řešení“ → význam na y = 343–373 px, lišta od 312 px. Mezera s chybným *wurden* → verdikt na y = −43 px. | ✅ opraveno v etapě 10: `showResult` počítá s lištou karty i spodní navigací (D103). Test `mobile.spec.ts` předtím selhal, teď prošel; měření na 10 velikostech, Python E2E 576/576. | – | 10 |
| Z47 | P2 | Hlášení importu při chybě zápisu a v kartě jen pro čtení opakovalo stejnou větu dvakrát | Nastavení → `setItem` vyhazuje → import → „Nahradit pokrok“: „Zápis se nepodařil, pokrok zůstal beze změny. Pokrok v tomto prohlížeči zůstal beze změny.“ | ✅ opraveno v etapě 10 (CZ i DE): „Zápis se nepodařil. Pokrok v tomto prohlížeči zůstal beze změny.“ Nový test v `backup.spec.ts` ověří i smazání při chybě úložiště. | – | 10 |
| Z48 | P2 | Tvar slova „karta“ u počtu 1 až 4 ve třech českých větách: souhrn „Prošli jste 1 karta.“ místo „1 kartu“, „Trénink nabídne 1 karta k opakování“ místo „1 kartu“, „Dalších 1–4 karty psaní se odemkne“ místo „Další … se odemknou“. V němčině „Weitere 1 Karte … werden freigeschaltet“. Příčina: funkce `cards()` v `src/i18n/cs.ts` vrací 1. pád, věty potřebují 4. pád nebo jinou shodu. | živá adresa, Slovník → heslo → „Procvičit kartičku“ → hodnocení: „Prošli jste 1 karta.“ (P10) | ❌ nalezeno v etapě 12; neopraveno, aby nasazený build zůstal ověřený (D113) | – | další etapa (návrh) |

**Stav po publikaci:** otevřená závada P0 ani P1 nezbývá (ověřeno v etapě 10, kap. 12; etapy 11 a 12 kód aplikace neměnily). Verze 1.0.0 je od 2026-11-17 publikovaná a živá adresa prošla krátkým průchodem (kap. 14). Otevřené P2 jsou hlavně Z48 a rozšíření po vydání.

### Závislosti mezi opravami

- Z03, Z04 a Z17 jsou opravené společně: revize zápisu a jedna zapisující karta (etapa 7).
- Z10 mění schéma: migrace, validace před migrací a zachování původních dat jsou připravené (D69, D71).
- Vaše rozhodnutí O14 → Z07 → Z08 a Z09 (kontext lekcí), později i Z11 (lekce jsou součástí obsahu).
- Z13 a Z14 (etapa 11) běží nad obsahem této verze; rozšíření obsahu (Z11, zbytek Z12) až po dokončení této verze (D86).
- Z13: Firefox a WebKit spustí stejné testy jako Chromium (`E2E_BROWSERS`, úloha `e2e-other-browsers`); nové testy nejsou potřeba.
- Rozhraní z etapy 9 je základ pro nová nastavení (Z10, podle návrhu po vydání): skupiny Nastavení a designové hodnoty jsou připravené, tmavý režim by znamenal druhou sadu barev v `tokens.css`.
- Váš push a zapnutí Pages → Z15 (hotovo v etapě 12, zbývá licence O02).
- Z48 mění jen texty: oprava, unit test tvarů pro 1 až 5 karet, nové nasazení a kontrola živé adresy.

## 16. Etapy 7 až vydání (návrh)

Číslování odpovídá vašim promptům:
1. plán (E0);
2. první verze (E1);
3. gramatika a výzva (E4);
4. pohovor (E5);
5. portfolio v1.0;
6. audit;
7. spolehlivost studia a uloženého pokroku;
8. výukový obsah a zpětná vazba;
9. ucelené rozhraní pro veřejnou verzi;
10. závěrečné ověření před balením;
11. balení a příprava vydání;
12. publikace.

Zadání etapy 8 přesunulo rozšíření obsahu o další desítky položek až za dokončení této verze (D86). Původní etapy „obsah I“ a „obsah II“ jsem proto přeřadil za vydání. Etapa 9 se podle vašeho zadání věnovala rozhraní a etapa 10 závěrečnému ověření s otázkou, zda je aplikace připravená na balení. Etapa 11 podle vašeho zadání připravila balík a konfiguraci vydání a etapa 12 aplikaci publikovala. Jako další navrhuji opravu Z48. Studijní průchod a nastavení (Z06, Z07–Z10) jsou rozšíření s dopadem P2; navrhuji je až po vydání. Rozhodnete vy podle dalších promptů.

| Etapa | Obsah | Závady | Hotovo, když |
|---|---|---|---|
| 7 – Spolehlivost studia a pokroku ✅ | tah lekce, opakování a počty na Dnes, persistence se zálohou původních dat, jedna zapisující karta, zálohy, statistiky | Z03–Z05, Z16–Z22; z Z06 trvalé uložení | hotovo 2026-11-11: každá oprava má test, E2E 453/453 |
| 8 – Výukový obsah a zpětná vazba ✅ | redakční kontrola všech položek, 15 nových položek, vyhodnocování podle cíle úlohy, kosmetické odchylky, důvody u možností, režim Poslech, orientační úroveň, ověření výzev a pohovoru | Z24–Z29 | hotovo 2026-11-12: R34–R36 ✅, E2E 552/552, axe 32 obrazovek |
| 9 – Ucelené rozhraní pro veřejnou verzi ✅ | designové hodnoty, hierarchie studijní obrazovky, Dnes, slovník, pohovor, nastavení, stav ukládání, dialog s fokusem, stavy prvků, přístupnost, texty CZ/DE, 3 rozlišení, zvětšení, klávesnice, jedna ruka | Z30–Z45 | hotovo 2026-11-12: R37–R46 ✅ v Chromiu, E2E 576/576, audit 42 obrazovek × 3 rozlišení |
| 10 – Závěrečné ověření před balením ✅ | lint, typy, data, cílené testy, reprodukovatelný build, Playwright v repozitáři, 8 skupin průchodů pod Pages podcestou, Chrome, soubory buildu, závislosti, úniky, přístupnost a klávesnice | Z46, Z47 | hotovo 2026-11-16: V01–V25 ✅, Python E2E 576/576 v Chromiu i Chrome, testy v repozitáři 23/23; připraveno na balení |
| 11 – Balení a příprava vydání ✅ | Node 26 LTS v projektu i CI, `engine-strict`, čistá instalace v dočasných kopiích, README pro náboráře a vývojáře se screenshoty, `docs/QUICKSTART_CS.md`, workflows podle aktuální dokumentace, Pages podcesta, soubory ke commitu | – | hotovo 2026-11-16: B01–B13 ✅, B14 čeká na vás |
| 12 – Publikace ✅ | repozitář, kontrola souborů, první commit a push, CI včetně Firefoxu a WebKitu, oprava dvou testů, Pages, nasazení, krátký průchod živou adresou, odkaz na demo v README | Z13 (zčásti), Z15 (zčásti), nová Z48 | hotovo 2026-11-17: P01–P11 ✅, P12 a licence čekají na vás; R29 a R30 ✅, R31 ✅ až na licenci |
| další (návrh) – Oprava Z48 a body po vydání | tvary „karta“ u 1 až 4, test, nové nasazení a kontrola živé adresy; zdroje k rakouským faktům a úprava kap. 4 PLAN podle dohody | Z48, Z12 (zdroje), Z14 | `npm run check`, testy v prohlížeči, živá adresa |
| po vydání (návrh) – Studijní průchod a nastavení | lekce s cílem a rozcvičkou, pohovorová otázka na konci tréninku, kontext ve slovníku a filtr stavu, nastavení tréninku, připomínka zálohy, případně tmavý režim | Z06 (zbytek), Z07–Z10 | průchod Dnes → lekce → otázka → souhrn v E2E; migrace na nové schéma |
| po dokončení této verze – Rozšíření obsahu | další desítky položek k cíli plánu, druhé doplňující otázky, další výzvy a úrovně | Z11, zbytek Z12 | `check:content`, ruční redakční průchod, `stats:content` |

## 17. Jak to ověříte lokálně

Ve složce `cloud-admin-deutsch-at/` (Node.js 22.12 nebo novější):

```bash
npm ci
npm run check            # exit 0: 237 testů prošlo, 1 vynechaný
npm run test:answers     # 46 testů
npm run test:scheduler   # 47 testů
npm run check:content    # 22 testů, 1 vynechaný
npm run test:reload      # 44 testů
npm run test:stats       # 20 testů
npm run test:import      # 11 testů
npm run stats:content    # počty položek podle druhu, úrovně, jevu a tématu
npx playwright install chromium   # jednou: prohlížeč pro testy (asi 170 MB)
npm run test:e2e         # build a 23 testů v prohlížeči pod podcestou /cloud-admin-deutsch-at/
npm run dev              # http://localhost:5173/
```

Etapu 12 ověříte na živé adrese https://brutusfilip.github.io/cloud-admin-deutsch-at/:

1. **Načtení:** stránka Dnes se načte; v DevTools → Network mají všechny požadavky stav 200 a konzole je bez chyb.
2. **Reload:** otevřete `#/slovnik/access-v-006` a stiskněte F5. Zůstane heslo „die Authentifizierungsmethode“.
3. **Pokrok:** dokončete lekci a stiskněte F5. Dnes ukáže méně nových karet a Nastavení → Statistiky „Dokončené lekce 1“.
4. **GitHub:** v záložce Actions je u posledního commitu workflow **CI** zelené (4 úlohy) a u **Deploy to GitHub Pages** úspěšné nasazení.
5. **Z48 před opravou:** otevřete `#/slovnik/career-v-001` → „Procvičit kartičku“ → „Odkrýt řešení“ → „Umím“. Souhrn píše „Prošli jste 1 karta.“

Etapu 11 ověříte takto (Windows, PowerShell; podrobně `docs/QUICKSTART_CS.md`):

1. **Instalace:** ve složce projektu `node -v` vypíše `v26.x.x`. `npm ci` skončí bez `npm error` a `npm run check` s `Tests  237 passed | 1 skipped (238)`.
2. **Servery:** `npm run dev` vypíše `Local:   http://localhost:5173/` a `Ctrl+C` server zastaví. `npm run build` a `npm run preview` vypíšou `http://localhost:4173/`.
3. **Nepodporovaný Node:** se starší verzí, například 20, skončí `npm ci` chybou `EBADENGINE` s řádky `Required` a `Actual`.
4. **Soubory ke commitu:** po `git init -b main` a `git add .` nesmí `git status` ukázat `node_modules`, `dist`, `test-results`, `playwright-report`, `*.local.*` ani `cloud-admin-deutsch-progress-*.json`.
5. **Workflows po pushi:** CI skončí zeleně. Deploy spuštěný z jiné větve než `main` hned skončí chybou „Start this workflow from the branch 'main'“.

Etapu 10 ověříte takto:

1. **Testy v prohlížeči:** `npm run test:e2e` skončí „23 passed“. Další prohlížeče: `npx playwright install firefox webkit` a `E2E_BROWSERS=firefox,webkit npm run test:e2e`. Ty jsem ověřit nemohl, výsledek mi prosím pošlete.
2. **Nízký telefon (Z46):** Chrome nebo Edge, DevTools → přepínač zařízení, vlastní velikost 375 × 553. Dnes → „Začít trénink“ → „Odkrýt řešení“: český význam je vidět nad lištou „Jak to šlo?“. Ve slovníku `#/slovnik/network-g-002` → „Procvičit úlohu“ → *wurden* → „Zkontrolovat“: nahoře je vidět „Chyba“.
3. **Import při chybě zápisu (Z47):** Nastavení → v konzoli `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }` → import platného exportu → „Nahradit pokrok“. Hlášení zní „Zápis se nepodařil. Pokrok v tomto prohlížeči zůstal beze změny.“ a počty se nezmění. Obnovením stránky se zápis vrátí do normálu.
4. **Podcesta:** `npm run build` a `npx vite preview --base /cloud-admin-deutsch-at/`. Otevřete `http://localhost:4173/cloud-admin-deutsch-at/#/slovnik/access-v-006` a obnovte stránku: heslo zůstane.

Etapu 9 ověříte takto (Chrome nebo Edge, DevTools → přepínač zařízení, 360 × 800):

1. **Studijní obrazovka:** Dnes → „Začít trénink“ → u kartičky „Odkrýt řešení“. Stránka se neposune a hodnocení zůstane dole nad navigací. V hlavičce je téma karty, „Karta n z N“, průběh a „Ukončit lekci“.
2. **Klávesnice:** na skutečném telefonu klepněte do pole u psaní. Pole i „Zkontrolovat“ zůstanou nad klávesnicí, spodní navigace zmizí. DevTools klávesnici nesimuluje.
3. **Slovník:** `#/slovnik?q=vpn&tema=network&druh=vocab` ukáže tři štítky a „2 položky“. Křížek zruší jeden filtr, „Zrušit vše“ všechny. `#/slovnik?q=xyzxyz` ukáže „Nic nenalezeno“ s tlačítkem.
4. **Pohovor:** po „Začít pohovor“ jsou nad otázkou tři fáze. Po „Pokračovat na doplňující otázku“ je aktuální druhá a první má ✓.
5. **Dialog:** Nastavení → na „Smazat pokrok…“ přejděte klávesou Tab a stiskněte Enter. Fokus je na „Zpět“, Tab neopustí dialog, Esc ho zavře a fokus je zpátky na tlačítku.
6. **Stav ukládání:** na Dnes sjeďte k tématům, v konzoli spusťte `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }` a klikněte na téma. Nahoře se objeví „Poslední změnu se nepodařilo uložit.“. Nastavení → Pokrok a záloha pak začíná „Stav ukládání: Poslední změna se neuložila.“. Obnovení stránky zápis vrátí.
7. **Zvětšení a pohyb:** okno 1440 px a Ctrl + plus na 200 %: nic se neposouvá do strany. DevTools → Rendering → „prefers-reduced-motion: reduce“: odkrytí a dialog se objeví bez animace.

Etapu 8 ověříte takto:

1. **Volný překlad:**
   1. Otevřete `#/slovnik/windows-s-001` → „Procvičit psaní“.
   2. Napište *Bitte starten Sie Ihren Computer neu.* → „Porovnání se vzorem“: *Ihren* je podtržené tečkovaně a nabízí se tři hodnocení.
   3. S malým *sie* je výsledek „Chyba“ s vysvětlením velkého písmene.
2. **Čárka:** `#/slovnik/handover-g-003` → „Procvičit úlohu“. Věta bez čárky před *dass* je „Správně“ s poznámkou „Před „dass“ chybí čárka. …“.
3. **Výběr:** `#/slovnik/communication-g-001` → „Procvičit úlohu“, první možnost. Uvidíte „Proč ne …“ a sbalené „Proč ostatní možnosti nesedí“.
4. **Lišta znaků:** v poli napište *prfe*, kurzor dejte mezi *r* a *f* a klikněte na „ü“ (nebo Tab a Enter). Vznikne *prüfe* a kurzor zůstane v poli.
5. **Poslech:**
   1. Procvičování → „Poslech DE → CZ“ → „Začít procvičování“.
   2. Text se ukáže až po „Odkrýt řešení“.
   3. Bez německého hlasu uvidíte text a důvod.
6. **Časovač:**
   1. V pohovoru spusťte časovač a odejděte do Slovníku.
   2. Po návratu přes „Pokračovat v pohovoru“ časovač stojí na výchozí délce.

Opravy z etapy 7 ověříte takto:

1. **Lekce po reloadu:**
   1. Na Dnes zvolte „Začít trénink“.
   2. U karty s psaním napište chybnou odpověď, zvolte „Zkontrolovat“ a stiskněte F5.
   3. Uvidíte stejný výsledek, žádné pole pro odpověď a jen „Pokračovat – karta se vrátí“.
   4. Totéž platí po odchodu do Slovníku a návratu přes „Pokračovat v lekci“. Pravidla jsou na Dnes pod „Co se ukládá a kdy“.
2. **Dvě karty:**
   1. Otevřete aplikaci ve druhé kartě prohlížeče. Ukáže „Tato karta je jen pro čtení“ a průběh z první karty.
   2. Zavřete první kartu, nebo ve druhé zvolte „Pracovat v této kartě“. Zapisovat začne druhá karta.
3. **Chyba zápisu:**
   1. V konzoli DevTools spusťte `Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError') }`.
   2. Změňte téma na Dnes. Banner nabídne „Zkusit znovu uložit“, „Stáhnout export aktuálního stavu“ a „Pokračovat bez ukládání“.
   3. Obnovením stránky se zápis vrátí do normálu.
4. **Export → jiný profil → import:**
   1. Nastavení → „Stáhnout export“.
   2. Otevřete aplikaci v jiném profilu prohlížeče nebo v anonymním okně.
   3. Nastavení → Import → „Nahradit pokrok“.
   4. Dnes ukáže stejná čísla, statistiky jsou shodné a rozpracovaná lekce pokračuje na stejné kartě.
5. **Statistiky:** Nastavení → Statistiky.

Opravy z etapy 6 platí dál:
- `#/slovnik/%E0%A4%A` ukáže „Položka nenalezena.“;
- `dist/index.html` otevřený dvojklikem po 3 s napíše, jak aplikaci spustit.

## 18. Historie

- **2026-11-11 · etapa 6:** audit podle zadání. Opravené závady: Z01 (P1) a Z02. Popsané a zařazené do etap: Z03–Z15. Založen tento přehled. Kontroly etapy 6: `npm run check` na Node 22, 24 a 26 exit 0 (170 testů), E2E 378/378, axe na 25 obrazovkách bez nálezů.
- **2026-11-11 · etapa 7:** spolehlivost studia a uloženého pokroku.
  - Nejdřív reprodukováno: Z16, Z17 (P0), Z18 (P0, skrytá), Z19–Z21; potvrzeny Z03 a Z04.
  - Opraveno: Z03, Z04, Z05 a Z16–Z21. Z Z06 je hotové trvalé uložení. Během etapy nalezena a opravena Z22.
  - Ponechán limit Z23.
  - Nové požadavky R33 (statistiky) a rozšířené R09, R10, R19–R21.
  - Kontroly: `npm run check` na Node 22, 24 a 26 exit 0 (213 testů), E2E 453/453, axe na 28 obrazovkách bez nálezů.
- **2026-11-12 · etapa 8:** výukový obsah a zpětná vazba.
  - Redakční kontrola všech 150 položek, 3 výzev a 4 pohovorů. Automatická validace a ruční kontrola jsou evidované zvlášť. Ruční kontrolu dělal Claude, ne rodilý mluvčí.
  - Nových 15 položek: upřesnění otázky, hranice zkušenosti, vysvětlení postupu a tenká témata `azure`, `powershell`, `handover`. Žádné vydané ID se nezměnilo.
  - Opraveno a doplněno: Z24–Z29. Stav před opravou je doložený stejnými kroky na buildu etapy 7.
  - Nové požadavky R34–R36, upravené R12, R13, R15, R23 a R24 (rozsah této verze podle zadání etapy 8).
  - Etapy přečíslované: 9 studijní průchod, 10 vydání, rozšíření obsahu po dokončení této verze.
  - Kontroly:
    - `npm run check` na Node 22, 24 a 26 exit 0 (231 testů);
    - E2E 552/552 ve 40 scénářích;
    - axe na 32 obrazovkách bez nálezů;
    - průchod navigací 11/11 na dev serveru, v preview i pod podcestou.
- **2026-11-12 · etapa 9:** ucelené rozhraní pro veřejnou verzi.
  - Audit buildu etapy 8 ve 3 rozlišeních, zvětšení a s klávesnicí: Z30–Z42. Během etapy nalezeny a opravené Z43–Z45.
  - Opraveno: Z30–Z45. Z38 má vědomou výjimku: lišta znaků 39 × 44 px (O25).
  - Nové požadavky R37–R46, upravené R18, R21, R26–R28 a R34.
  - Rozhodnutí D88–D102, změněné D27 a D54.
  - Etapy přečíslované: 10 studijní průchod a nastavení, 11 vydání.
  - Kontroly:
    - `npm ci` a `npm run check` z čisté kopie na Node 22, 24 a 26 i s npm 11 exit 0 (237 testů), lockfile beze změny;
    - E2E 576/576 ve 41 scénářích, axe na 32 obrazovkách bez nálezů;
    - audit 42 obrazovek × 3 rozlišení, axe 33× bez nálezů;
    - `probe2` 31/31;
    - 0 rozdělených slov (dřív 44);
    - průchod navigací 11/11 na dev serveru, v preview i pod podcestou.
- **2026-11-16 · etapa 10:** závěrečné ověření před balením.
  - Statické kontroly, validace dat a cílené testy bez nálezů. Build je reprodukovatelný (3 buildy, shodné SHA-256). Závislosti bez zranitelností.
  - Nově Playwright v repozitáři: 23 testů rizikových průchodů pod Pages podcestou, kontrola konzole a sítě v každém testu, úloha `e2e` v CI a nepovinná úloha pro Firefox a WebKit (D104).
  - Ověřeno všech 8 skupin průchodů ze zadání v Chromiu 153 a Google Chrome 153 (V14–V21), soubory buildu a odkazy, úniky časovačů a posluchačů, opakované přehrávání, axe a ruční průchod klávesnicí 14 obrazovek.
  - Nalezeno a opraveno: Z46 (nízký telefon: význam a verdikt mimo obrazovku, D103) a Z47 (zdvojená věta v hlášení importu). Bez optimalizace zůstaly podmnožiny písem (D105) a verze závislostí (D106).
  - Neověřeno: Firefox, WebKit a Safari, Edge, skutečné telefony, čtečka, skutečné hlasy, běh na GitHubu a živá adresa.
  - Etapy přečíslované (návrh): 11 balení a vydání, studijní průchod a nastavení po vydání.
  - Kontroly:
    - `npm ci` a `npm run check` z čisté kopie na Node 22, 24 a 26 i s npm 11 exit 0 (237 testů), lockfile beze změny;
    - `npm run test:e2e` 23/23, v Chrome 21/21;
    - E2E 576/576 v Chromiu i Chrome, axe na 32 obrazovkách bez nálezů;
    - průchod navigací 11/11 na dev serveru i pod podcestou.
- **2026-11-16 · etapa 11:** balení a příprava vydání.
  - Node.js 26 LTS jako jediná doporučená verze v `.nvmrc`, CI, nasazení i dokumentaci (D107). Nový `.npmrc` s `engine-strict=true` zastaví instalaci na nepodporovaném Node (D108).
  - Čistá instalace v dočasných kopiích (B02–B07): Node 26 s npm 11, Node 24 a 22 s npm 10, odmítnutí Node 20, rozlišení lockfilu pro Windows a macOS, `dev` a `preview` HTTP 200, testy v prohlížeči 23/23, build shodný s etapou 10.
  - README přepsané pro náboráře a vývojáře se 4 novými screenshoty; nový `docs/QUICKSTART_CS.md` pro Windows a PowerShell.
  - Workflows podle aktuální dokumentace Actions: CI na pull requestu bez nasazení; Deploy jen ručně z `main`, s kontrolami, buildem a testy před nasazením, prostředím `github-pages`, oprávněními a souběhem (D109). actionlint se shellcheck bez nálezů.
  - Pages podcesta: nic se nenastavuje, jedno popsané místo v `vite.config.ts` (D110).
  - Soubory ke commitu: 154, nic nežádoucího. Licence zůstává otevřená (O02).
  - Nové otevřené body O28 (konec Node 22) a O29 (první běh workflows).
- **2026-11-17 · etapa 12:** publikace.
  - Repozitář `BrutusFilip/cloud-admin-deutsch-at`, veřejný, s větví `main`. Založení repozitáře, přístup aplikace Claude a zapnutí Pages jste udělali vy, protože relace tyto kroky nesmí.
  - První commit `690451b` se 154 soubory balíku etapy 11. Kontroly před commitem: exit 0, 237 testů, 23/23 v prohlížeči.
  - CI: povinné úlohy zelené hned. Firefox a WebKit selhaly na předpokladech testů; opravené testy jsou v `19c3db1` (D112). Pak všechny 4 úlohy zelené: Firefox 155 21/21, WebKit 26.6 23/23.
  - Nasazení z `main` (`19c3db1`) úspěšné po zapnutí Pages. Živá adresa: build shodný s ověřeným, krátký průchod bez chyb (P08–P10).
  - Nalezena Z48 (P2, tvar „karta“ u počtu 1 až 4), oprava v další etapě (D113).
  - Odkaz na demo v README; About čeká na vás (O31), licence také (O02). Uzavřené body O22 a O29, nové O30 a O31.
