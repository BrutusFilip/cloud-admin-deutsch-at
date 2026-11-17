# Pravidla obsahu

Studijní data jsou v `src/content/items/<téma>.ts`, témata v `src/content/topics.ts`, případy výzvy v `src/content/challenges.ts` a pohovory v `src/content/interviews.ts`. Data neimportují nic z UI, jen typy z `src/domain/types.ts`.

Po každé změně spusťte `npm run check:content`. Skutečné počty podle druhu, úrovně, jevu a tématu vypíše `npm run stats:content` (tabulky v Markdownu pro `PROJECT_STATE.md`).

## ID

- Tvar je `<téma>-<v|s|g>-<NNN>`: `v` znamená slovo nebo výraz, `s` větu, `g` gramatickou úlohu. Příklady: `access-v-001`, `career-s-001`, `network-g-001`.
- Zveřejněné ID se nikdy nemění ani se znovu nepoužije, protože na něm závisí pokrok. Každé vydané ID je v `src/content/releasedIds.ts`. Odstraněné ID zapište do `RETIRED_IDS` v `src/content/index.ts`.
- Karty vznikají automaticky: `<ID>:flashcard`, `<ID>:write` a `<ID>:grammar`.

## Druhy položek

| `kind` | Povinné navíc | Karty |
|---|---|---|
| `noun` | `de` se členem (`die Lizenz`), `gender`, `plural` se členem (`die Lizenzen`) nebo `null` | kartička a psaní |
| `verb` | `government` (vazba s pády), `past` (préteritum – perfektum, např. `wies zu – hat zugewiesen`) | kartička a psaní |
| `phrase` | volitelně `grammar` | kartička a psaní |
| `word` | `pos` (`adverb` nebo `adjective`), volitelně `grammar` | kartička a psaní |
| `sentence` | `write` | jen psaní |
| `grammar` | `focus`, `promptCz`, `task`, `explanationCz` | jen gramatická úloha |

Každá položka má `id`, `topic`, `level` (B1, B2 nebo C1), `de`, `cz` a `example`, tedy jednu větu v kontextu s `de` a `cz`. Volitelně může mít:

- `noteCz`: krátké vysvětlení, nejvýše 320 znaků;
- `atNote`: rakouský úzus nebo rozdíl oproti Německu;
- `sources`: zdroje faktů;
- `illustrative: true`: vzorová zkušenost (viz níže).

Úroveň je orientační: B1 = rozcvička, B2 = jádro (má převažovat), C1 = náročnější styl. Rozhraní ji tak i označuje (filtr „Obtížnost (orientační)“, u štítku úrovně „orientační úroveň“ pro čtečky a vysvětlení při najetí myší). Nejde o certifikované hodnocení podle SERR.

**Podstatné jméno bez běžného plurálu** má `plural: null` a `noteCz` začíná „Jen v jednotném čísle.“ nebo „Obvykle jen v jednotném čísle.“ (hlídá test). Aplikace pak u plurálu napíše „jen jednotné číslo (bez běžného plurálu)“.

**Sloveso:** `government` uvádí jen vazby, které se v IT praxi opravdu používají, s pády (`etwas (A) für jemanden (A) freigeben`). Má-li sloveso víc významů s různou vazbou, oddělte je středníkem a význam napište česky do závorky: `etwas (A) für jemanden (A) freigeben (zpřístupnit); etwas (A) freigeben (schválit, např. einen Antrag)`. Příklad v `example` ukáže nejdůležitější vazbu v celé větě. U výrazu (`phrase`) patří tvary a vazba do `grammar`; aplikace je ukáže pod nadpisem „Tvary a vazba“.

## Psaní (`write`)

- `mode: 'auto'`: jednoznačná odpověď (slovo se členem, sloveso, výraz). Aplikace uzná jen vzor a varianty z `accept`, cokoli jiného je chyba s vysvětlením.
- `mode: 'compare'`: volný překlad věty. **Každá věta má `compare`** (hlídá test), protože správných formulací je víc, než se dá vyjmenovat:
  - shoda se vzorem nebo s variantou z `accept` → „Správně“;
  - liší-li se odpověď jen přehláskou, ß nebo velkým písmenem → „Chyba“ s vysvětlením (pravopis nemá správnou alternativu);
  - jiný rozdíl → „Porovnání se vzorem“: aplikace ukáže nejbližší vzor, rozdílná slova označí neutrálně (ne jako chybu) a pojmenuje je jako otázku k zamyšlení („Ve vzoru je slovo „damit“, které ve vaší větě není. Chybí, nebo jste totéž řekli jinak?“). Uživatel se ohodnotí sám: Znovu, Těžké nebo Umím.
- Do `accept` patří běžné správné formulace, které se liší slovosledem nebo slovem (*Starten Sie den Computer bitte neu.*). Čím víc jich je, tím častěji aplikace rovnou řekne „Správně“.
- `promptCz`: české zadání, pokud má být jiné než `cz` (např. s upřesněním „(zvratné sloveso)“).
- `accept`: výslovně povolené varianty, volitelně s `noteCz`. Jiný zápis se neuzná. Zápis bez přehlásky nebo s `ss` místo `ß` projde jen tehdy, když je tu uvedený.
- `rules`: přepisuje výchozí pravidla. Pro slova platí `case: 'ignore-first'` a `punctuation: 'ignore'`, pro věty `case: 'ignore-first'` a `punctuation: 'ignore-final'`.
- **Interpunkce je kosmetická odchylka**, ne chyba v procvičovaném jevu: odpověď, která se od vzoru liší jen čárkou, uvozovkami a podobně, je správně. Aplikace přesně řekne kde („Před „dass“ chybí čárka. Vedlejší větu němčina vždy odděluje čárkou.“). Platí pro psaní i pro doplňování a přepis vět; má-li odpověď i skutečnou chybu, poznámka o interpunkci stojí zvlášť pod ní.
- `write: false`: položka nebude mít psaní.

## Gramatické úlohy (`kind: 'grammar'`)

- `focus`: jev – `word-order` (slovosled po *weil, dass, obwohl, ob*, inverze), `case` (pády a vazby), `separable` (odlučitelná slovesa), `past` (minulý čas v popisu incidentu), `konjunktiv` (zdvořilý Konjunktiv II).
- `promptCz`: zadání, které odpověď jednoznačně ohraničí („Doplňte **určitý** člen“, „Spojte věty spojkou „weil““, „Doplňte příčestí slovesa „ausstellen““).
- `explanationCz`: proč řešení funguje – pravidlo a jeho použití v této větě, nejvýše 420 znaků. Aplikace ho ukáže po každé odpovědi.
- `de`: celá vyřešená věta; kontrola ověří, že ji úloha opravdu dává. `cz`: její překlad (ukáže se až po odpovědi). `example`: jiná věta se stejným jevem.

| `task.type` | Pole | Jak se kontroluje |
|---|---|---|
| `gap` | `text` s právě jednou mezerou `___`, `answers` (první = vzorová) | velikost písmen se hodnotí (jen u mezery na začátku věty je první písmeno volné); interpunkce se nehodnotí; přehlásky a ß nikdy nesplývají |
| `choice` | `options` (2–4), `correct` (index), `whyCz` (u každé chybné možnosti jedna česká věta, proč je chybná, nejvýše 200 znaků; u správné `''`), volitelně `text` s mezerou | porovná se zvolená možnost; po odpovědi se ukáže důvod u zvolené chybné možnosti a ostatní chybné možnosti s důvody ve sbaleném seznamu |
| `order` | `text` s mezerou, `tokens` (2–8 dílků), `answers` (povolená pořadí) | celé pořadí přesně; dílky nesmí být už zobrazené ve správném pořadí. U chyby aplikace porovná s nejbližším povoleným pořadím a jmenuje až tři slova, která stojí jinde |
| `transform` | `source`, `answers` (první = vzorová) | první písmeno a tečka na konci se nehodnotí; ostatní přesně |

Zásady:

1. Psaná odpověď (`gap`, `transform`) jen tam, kde lze správné odpovědi vyjmenovat. Každou další správnou formulaci přidejte do `answers`; pokud by jich bylo mnoho, zvolte `choice` nebo `order`.
2. `choice` má vždy právě jednu správnou možnost. Chybné možnosti jsou věrohodné a typické: špatný pád (*mich* místo *mir*), chybějící přehláska (*Konnten*), sloveso na 2. místě ve vedlejší větě, nerozdělené odlučitelné sloveso, *zu* navíc. Jedna chyba na možnost; `whyCz` ji pojmenuje a řekne správný tvar. Chybná možnost nesmí být jinak také správná (ani méně obvyklá).
3. Mezera nesmí připustit jiný gramaticky správný tvar, který zadání nechce (např. neurčitý člen) – zpřesněte zadání.
4. U `order` stačí 3–4 dílky; víceslovné celky (*nur einen Benutzer oder mehrere*) nechte pohromadě. Každé gramaticky správné pořadí patří do `answers`.

## Výzva „Incident za 5 kroků“

Případ v `src/content/challenges.ts` má `id` (kebab-case), `level`, `titleCz`, `titleDe`, `situationDe`, `situationCz` a přesně pět kroků `{ item, stageCz }`.

- Kroky jsou existující položky, které aplikace kontroluje sama: gramatická úloha, případně psaní slova nebo výrazu (`write.mode: 'auto'`). Věty jsou volný překlad s vlastním hodnocením, krokem výzvy být nemohou. Každá položka jen jednou.
- Pořadí odpovídá postupu: upřesnění problému → rozsah nebo diagnostika → příčina nebo řešení → komunikace → předání.
- Příběh musí držet pohromadě napříč kroky (stejný problém, stejná osoba, stejná příčina). Případ je smyšlený, bez jmen a interních údajů.
- Položka může být součástí výzvy i běžných lekcí; Slovník u ní ukáže „Použito ve výzvě“.

## Pohovor (`src/content/interviews.ts`)

Pohovor má `id` (kebab-case), `level`, `titleCz`, `titleDe`, `contextDe`, `contextCz` (krátké smyšlené zadání: firma, role, kdo se ptá) a 3–4 hlavní otázky.

| Pole otázky | Pravidlo |
|---|---|
| `id` | `<téma>-i-<NNN>`, prefix = `topic`; po vydání se nemění (sebehodnocení se ukládá podle ID) a patří do `RELEASED_QUESTION_IDS` v `releasedIds.ts` |
| `kind` | `personal` (výchozí bod → zkušenost a důvod → cíl), `experience` (STAR: situace → úkol → postup → výsledek), `technical` (upřesnit problém → ověřit hypotézu → bezpečný další krok → komunikace) |
| `seconds` | výchozí délka časovače: 60, 75 nebo 90 |
| `de`, `cz` | otázka ve vykání (*Sie*), čeština se zobrazí jen na vyžádání |
| `hintCz`, `startersDe` | 2–5 bodů nápovědy, 1–4 německé začátky vět |
| `followUps` | aspoň jedna doplňující otázka `{ de, cz, model: { de, cz } }`; navazuje na odpověď (podrobnost, ověření, „a co když …“) |
| `model` | `parts`: jeden krátký odstavec na každý krok podle `kind`, přesně v daném pořadí; `cz`: překlad celé vzorové odpovědi |
| `replace` | fakta, která má uživatel nahradit vlastními: `text` se musí ve vzoru nebo ve vzoru k doplňující otázce vyskytovat přesně jednou, `noteCz` říká čím je nahradit |
| `phrases` | 3–6 užitečných formulací DE + CZ |
| `checks` | konkrétní popis pro každé kritérium sebehodnocení: `direct`, `structure`, `vocabulary`, `followUp` |
| `dictionary` | 2–3 existující položky slovníku, každá jen jednou; heslo pak ukáže „Použito v pohovoru“ |

Zásady:

1. Vzorová odpověď je **ilustrační** a krátká (3–4 věty). Nevymýšlí odpovědnosti ani výsledky: každá role, délka praxe, číslo nebo úspěch patří do `replace` s poznámkou, jak ho nahradit pravdivým faktem (případně formulací v Konjunktivu II, pokud to uživatel nedělal).
2. Technická odpověď vede k bezpečnému kroku: nejdřív upřesnit a ověřit, změny ve sdíleném prostředí jen po domluvě, eskalace s fakty (od kdy, rozsah, kroky, dopad).
3. Doplňující otázka se nedá zodpovědět zopakováním hlavní odpovědi.
4. Platí stejná pravidla jazyka a soukromí jako u položek: smyšlené firmy a role, žádná jména, e-maily ani interní systémy.

## Ilustrační vzorové zkušenosti

- `illustrative: true` patří položkám, jejichž německý text nebo příklad popisuje vlastní praxi mluvčího jako fakt: zkušenost, roli, certifikaci, výsledek („Im Support habe ich gelernt …“). Aplikace je všude označí štítkem „Ilustrační“ s výzvou nahradit je vlastním ověřitelným příkladem.
- Popisy postupu („Zuerst würde ich prüfen …“, „Beim Onboarding lege ich das Konto an …“) se neoznačují.
- Nevymýšlejte odpovědnosti: u výrazů volte v příkladu přání nebo plán („In einer neuen Rolle möchte ich …“) nebo neutrální formulaci.

## Co hlídá automatická kontrola

`npm run check:content` (a tedy i `npm test`) selže, když:

- ID má špatný tvar, písmeno neodpovídá druhu, prefix neodpovídá tématu, ID se opakuje, je vyřazené, vydané ID chybí nebo nové ID není v `releasedIds.ts`;
- chybí povinné pole nebo má neplatnou hodnotu (druh, téma, úroveň, rod, slovní druh, jev, typ úlohy, režim psaní);
- podstatné jméno nemá člen podle rodu, velké písmeno nebo plurál se členem; vazba slovesa neobsahuje infinitiv;
- vzorová odpověď nebo povolená varianta neprojde kontrolou odpovědí nebo se opakuje;
- gramatická úloha nemá právě jednu mezeru, správný index, unikátní možnosti či dílky, pořadí z daných dílků, přepis odlišný od výchozího textu, nebo její řešení nedává `de`;
- výzva nemá pět kroků, odkazuje na neexistující nebo ručně hodnocenou položku, opakuje krok nebo jí chybí texty;
- pohovor nemá 3–4 otázky, otázka má špatné ID, téma, druh nebo délku časovače, chybí jí doplňující otázka, nápověda, formulace nebo popis kritéria, kroky vzoru neodpovídají druhu otázky, fakt k nahrazení se ve vzoru nevyskytuje přesně jednou, nebo odkazuje na méně než 2, víc než 3 či neexistující hesla;
- text obsahuje e-mail, telefon, odkaz, veřejnou IP adresu nebo výraz z lokálního seznamu zakázaných výrazů.

Testy obsahu navíc ověří, že:

- každá gramatická úloha jde vyřešit vzorovou odpovědí, chybné možnosti a zobrazené pořadí dílků se neuznají a chybějící přehláska se nikdy neuzná;
- každá úloha s výběrem má u každé chybné možnosti důvod (`whyCz`) a u správné žádný;
- každá věta má `write.mode: 'compare'`, slova a výrazy `auto`;
- každé podstatné jméno s `plural: null` má v poznámce „jednotném čísle“;
- každý případ výzvy jde dokončit: správné odpovědi dají 5 z 5 a chybné odpovědi i „Nevím“ projdou všemi pěti kroky až k výsledku;
- žádný německý text nepoužívá tykání (*du, dich, dir, dein, euch, euer*).

Co test neověří: přirozenost němčiny, přesnost českého významu, rakouský úzus a vhodnost chybných možností. To je ruční redakční kontrola (krok 5 níže); její výsledek se zapisuje do `PROJECT_STATE.md` zvlášť od výsledku automatické kontroly.

## Jak rozšířit sadu

1. Vyberte téma a další volné číslo pro dané písmeno (`v`, `s`, `g`; otázky pohovoru `i`).
2. Položku zapište podle tabulek výše na konec souboru tématu; pořadí v souboru je pořadí na studijní cestě.
3. ID přidejte do `RELEASED_IDS` v `src/content/releasedIds.ts`.
4. Spusťte `npm run check:content` a opravte nálezy.
5. Projděte položku ručně: vazba a pády, rod, plurál (nebo `null` s poznámkou), velká písmena, slovesné tvary, slovosled, přirozenost celé příkladové věty, vykání *Sie*, přesný a přirozený český význam, názvy technologií v obvyklé podobě; u výběru, že každá chybná možnost je opravdu chybná a `whyCz` to říká správně.
6. Spusťte `npm run stats:content` a aktualizujte počty v `PROJECT_STATE.md` (vypíše i počty pohovorů a otázek).

Nové téma: doplňte ho do `src/content/topics.ts` (stabilní `id` malými písmeny, `order` = pozice na cestě), vytvořte `src/content/items/<téma>.ts` a zařaďte ho do `ITEMS` v `src/content/index.ts`.

## Jazyk

1. Píšeme rakouskou spisovnou němčinou v profesním registru. Rozdíly oproti Německu patří do `atNote` (*Jänner, heuer, Dienstgeber, Inserat*).
2. Otázky jsou ve vykání (*Sie*), věty v 1. osobě. Praxi týmu popisuje *wir*.
3. Anglicismy používáme jen tam, kde je admini běžně říkají (*das Ticket, der Rollout, das Troubleshooting*), a vždy se členem.
4. Produkty uvádíme aktuálním názvem v originále (Microsoft Entra ID, Exchange Online, Microsoft Graph PowerShell). Starý název patří jen do poznámky.
5. Přednost mají věci, které se dají na pohovoru opravdu říct: krátké kolokace, celé odpovědi, reakce na nejasnou otázku, popis postupu, běžné obraty. Téma `communication` drží tři skupiny frází: upřesnění otázky (*Meinen Sie damit … oder …?*, *Darf ich kurz zusammenfassen, worum es Ihnen geht?*), přiznání hranice zkušenosti (*Damit habe ich bisher nur in einer Testumgebung gearbeitet.*) a srozumitelné vysvětlení postupu (*Im ersten Schritt …, im zweiten Schritt …*). Fráze o vlastní zkušenosti mají `illustrative: true`.
6. Čeština má znít přirozeně, ne doslovně. Poznámka má nejvýše 2–3 věty.
7. Rozmanitost má vycházet z různého použití jazyka (jiná vazba, pád, slovosled, funkce v rozhovoru), ne z výměny produktu nebo čísla ve stejné větě.

## Data a zdroje

- Obsah používá jen fiktivní data: role místo jmen, doménu `example.com` a IP adresy z dokumentačních rozsahů (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24). Kontrola odmítne e-maily, telefonní čísla, odkazy v textu a veřejné IP adresy.
- Vlastní zakázané výrazy, například názvy skutečných firem, zapište do souboru `content-denylist.local.txt` v kořeni repozitáře, jeden výraz na řádek. Soubor je v `.gitignore`, takže se nikdy nedostane do repozitáře.
- Fakta (právo, kolektivní smlouvy, funkce produktů) mají v `sources` odkaz přes `https` a datum ověření `checkedAt`. U PDF uveďte i stranu v poli `page`.
- Platové částky obsah nenavrhuje; číslo si uživatel doplní sám.
