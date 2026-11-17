# Rychlé spuštění na Windows (PowerShell)

Návod spustí Cloud Admin Deutsch na vašem počítači s Windows 10 nebo 11. Příkazy jsou pro PowerShell; spouštějte je jeden po druhém a po každém zkontrolujte očekávaný výsledek.

**Co je ověřené:** stejné kroky (`npm ci`, kontroly, build, náhled, testy v prohlížeči) prošly 2026-11-16 v čisté kopii projektu na Linuxu s Node.js 26, 24 a 22. Pro Windows je ověřené jen to, že lockfile umí nainstalovat balíčky pro Windows x64. Skutečný běh na Windows zatím neproběhl, výsledek mi prosím pošlete. Podrobnosti jsou v [`RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md).

## 1. Složka projektu

Doporučené místo je `$HOME\Projects\cloud-admin-deutsch-at`, tedy `C:\Users\<vaše jméno>\Projects\cloud-admin-deutsch-at`. Složka `Projects` ve vašem profilu už existuje.

Zip ze složky Stažené soubory rozbalte takto:

```powershell
Expand-Archive -Path "$HOME\Downloads\cloud-admin-deutsch-at-etapa-11.zip" -DestinationPath "$HOME\Projects"
Set-Location "$HOME\Projects\cloud-admin-deutsch-at"
Test-Path .\package.json
```

Očekávaný výsledek: `True`. Jste ve správné složce.

**Starší kopie ze dřívějších etap.** Je-li v `Projects` už složka `cloud-admin-deutsch-at`, `Expand-Archive` skončí chybou, že soubory existují. Starou složku nejdřív přejmenujte:

```powershell
Rename-Item "$HOME\Projects\cloud-admin-deutsch-at" "cloud-admin-deutsch-at-predchozi"
```

Pokrok se tím neztratí. Je uložený v prohlížeči, ne ve složce projektu.

**Nevíte, kam jste projekt rozbalili?** Tento příkaz najde každou složku s `package.json` tohoto projektu ve vašem profilu:

```powershell
Get-ChildItem -Path $HOME -Filter package.json -Recurse -Depth 5 -ErrorAction SilentlyContinue |
  Where-Object { (Get-Content $_.FullName -Raw) -match '"name": "cloud-admin-deutsch-at"' } |
  Select-Object -ExpandProperty DirectoryName
```

Projekt nedávejte do složky synchronizované přes OneDrive (často Dokumenty a Plocha). `node_modules` má tisíce souborů a synchronizace instalaci zpomaluje nebo ruší.

## 2. Node.js a npm

```powershell
node -v
npm -v
```

Očekávaný výsledek: `v26.x.x` a `11.x.x`. Node 26 je aktuální LTS a používá ho i CI (soubor `.nvmrc`). Projekt funguje i s Node 22.12+ a 24, starší verze `npm` odmítne.

**Node chybí nebo je starší.** Nainstalujte aktuální LTS a pak PowerShell zavřete a otevřete znovu:

```powershell
winget install OpenJS.NodeJS.LTS
```

Jinak použijte instalátor „LTS“ z nodejs.org. Používáte-li nvm-windows, spusťte `nvm install 26` a `nvm use 26`.

## 3. Instalace závislostí

```powershell
npm ci
```

`npm ci` nainstaluje přesně verze z `package-lock.json` do složky `node_modules`. Případnou starou `node_modules` předtím smaže a lockfile nikdy nemění.

Očekávaný výsledek: řádek `added … packages`, žádný řádek `npm error`. Výsledek ověříte příkazem `$LASTEXITCODE`, který vypíše `0`.

## 4. Kontroly (doporučené)

```powershell
npm run check
```

Spustí `npm run lint`, `npm run typecheck`, `npm test` a `npm run build`. Očekávaný výsledek: `Tests  237 passed | 1 skipped (238)`, na konci `✓ built in …` a `$LASTEXITCODE` je `0`.

Testy v prohlížeči (volitelné, poprvé stáhnou asi 170 MB):

```powershell
npx playwright install chromium
npm run test:e2e
```

Očekávaný výsledek: `23 passed`.

## 5. Vývojový server

```powershell
npm run dev
```

Výpis obsahuje `Local:   http://localhost:5173/`. Adresu otevřete v prohlížeči, nebo ve druhém okně PowerShellu spusťte `Start-Process http://localhost:5173/`. Změny ve zdrojových souborech se projeví hned.

**Zastavení:** v okně se serverem stiskněte `Ctrl+C`. Když se Windows zeptá `Terminate batch job (Y/N)?`, napište `Y` a Enter.

## 6. Produkční náhled

```powershell
npm run build
npm run preview
```

Náhled běží na `http://localhost:4173/` a zastavíte ho stejně, `Ctrl+C`.

Stejně jako na GitHub Pages, tedy pod podcestou:

```powershell
npx vite preview --base /cloud-admin-deutsch-at/
```

Pak otevřete `http://localhost:4173/cloud-admin-deutsch-at/`. Pohledy, například `#/slovnik/access-v-006`, musí fungovat i po obnovení stránky (F5).

## 7. Uložení a přenos pokroku

- **Kde je pokrok.** Jen v prohlížeči, a to zvlášť pro každou adresu. Vývojový server (`localhost:5173`), náhled (`localhost:4173`) a GitHub Pages mají každý svůj pokrok. Anonymní okno začíná od nuly a po zavření pokrok zapomene.
- **Záloha a přenos:**
  1. Nastavení → Pokrok a záloha → **Stáhnout export**. Do složky Stažené soubory se uloží `cloud-admin-deutsch-progress-RRRR-MM-DD.json`.
  2. Na druhé adrese nebo v druhém prohlížeči: Nastavení → Import → vyberte soubor.
  3. Zkontrolujte souhrn a zvolte **Nahradit pokrok**.
- **Export je soukromý.** Obsahuje vaše vlastní příklady. Nedávejte ho do složky projektu a necommitujte ho; vzor názvu je pro jistotu v `.gitignore`.
- **Smazání:** Nastavení → **Smazat pokrok…** a potvrzení. Smazání dat webu v prohlížeči smaže pokrok taky, proto nejdřív export.

## 8. Řešení potíží

### `npm error code ENOENT … Could not read package.json`

Jste ve špatné složce. Zkontrolujte ji příkazy `Get-Location` a `Test-Path .\package.json` a přejděte do složky z kapitoly 1. Častá příčina je složka dvakrát v sobě, například `…\cloud-admin-deutsch-at\cloud-admin-deutsch-at`.

### `npm error code EBADENGINE` (nekompatibilní Node)

```text
npm error notsup Required: {"node":"^22.12.0 || ^24.0.0 || >=26.0.0"}
npm error notsup Actual:   {"npm":"10.9.9","node":"v20.20.2"}
```

Nainstalujte Node 26 LTS (kapitola 2), otevřete nový PowerShell, ověřte `node -v` a spusťte znovu `npm ci`. Instalaci zastaví nastavení `engine-strict=true` v souboru `.npmrc`, aby se chyba neukázala až později a hůř čitelně.

### `npm.ps1 cannot be loaded because running scripts is disabled`

PowerShell blokuje skripty. Buď pište `npm.cmd` místo `npm` (`npm.cmd ci`, `npm.cmd run dev`), nebo skripty povolte jen pro svůj účet:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Obsazený port

Je-li port 5173 nebo 4173 obsazený, Vite vypíše `Port 5173 is in use, trying another one...` a použije další volný (5174, 4174, …). Otevřete adresu z řádku `Local:`. Konkrétní port zvolíte takto:

```powershell
npm run dev -- --port 5180
```

Kdo port drží, zjistíte takto:

```powershell
Get-NetTCPConnection -LocalPort 5173 -State Listen | Select-Object -ExpandProperty OwningProcess
Get-Process -Id <číslo z předchozího příkazu>
```

Je-li to váš zapomenutý server, ukončete ho příkazem `Stop-Process -Id <číslo>`.

### `npm ci` hlásí chybějící `package-lock.json`

```text
The `npm ci` command can only install with an existing package-lock.json
```

Obnovte soubor ze zipu, nebo v gitu příkazem `git restore package-lock.json`. Nový lockfile přes `npm install` nevytvářejte, vybral by jiné verze než ověřené.

### `npm ci` hlásí nesoulad `package.json` a `package-lock.json`

```text
`npm ci` can only install packages when your package.json and package-lock.json are in sync
```

Soubor `package.json` se změnil bez lockfilu. Obnovte oba ze zipu, nebo příkazem `git restore package.json package-lock.json`. Jestli jste závislost měnili záměrně, spusťte `npm install`, pak `npm run check` a commitněte oba soubory.

### `EPERM` nebo `EBUSY` při `npm ci`

Soubory v `node_modules` drží běžící proces. Zastavte vývojový server a náhled (`Ctrl+C`), zavřete terminály v editoru a spusťte `npm ci` znovu.

### `Executable doesn't exist … ms-playwright`

Chybí prohlížeč pro testy. Spusťte `npx playwright install chromium`.

### Prázdná stránka nebo „Aplikaci se nepodařilo spustit“

Otevřeli jste `dist\index.html` přímo z disku (`file://`) a prohlížeč skripty zablokoval. Použijte `npm run preview`.

## 9. Projekt na vzdáleném serveru

Pokud projekt poběží na vzdáleném Linux serveru nebo VM, rozlišujte dvě adresy:
- **na serveru** znamená `http://localhost:5173` server samotný; tam Vite poslouchá;
- **ve vašem prohlížeči na PC** znamená `localhost` váš počítač.

Vite naslouchá jen na `localhost` serveru, proto `http://<IP serveru>:5173` neotevřete. Je to bezpečné výchozí nastavení. K náhledu použijte SSH tunel.

1. V PowerShellu na PC otevřete tunel (klient OpenSSH je součástí Windows 10 a 11). Okno nechte otevřené:

   ```powershell
   ssh -N -L 5173:localhost:5173 <uživatel>@<server>
   ```

2. Ve druhém SSH připojení na serveru spusťte:

   ```bash
   cd ~/cloud-admin-deutsch-at
   npm ci
   npm run dev
   ```

3. V prohlížeči na PC otevřete `http://localhost:5173/`. Tunel požadavek předá na port 5173 serveru.
4. Pro produkční náhled tunelujte `4173:localhost:4173` a na serveru spusťte `npm run build` a `npm run preview`.

Ukončení: `Ctrl+C` v okně se serverem i v okně s tunelem. Přepínač `--host` na serveru dostupném z internetu nepoužívejte, vývojový server by byl vidět veřejně. Pokrok se v tomto případě ukládá ve vašem prohlížeči pro adresu `http://localhost:5173`.

**Moje pracovní prostředí** (cloudový prostor, ve kterém projekt připravuji) z vašeho počítače dosažitelné není a žádný port z něj neotevírám. Schválený způsob, jak build vidět bez instalace, je náhled v Claude (odkaz posílám v chatu). Stahování exportu v něm nefunguje.

## 10. Publikace na GitHubu (provedete vy)

Hodnoty: účet `BrutusFilip` (podle připojeného GitHubu), repozitář `cloud-admin-deutsch-at` (zatím neexistuje), větev `main`. Očekávaná adresa: `https://brutusfilip.github.io/cloud-admin-deutsch-at/`. Pokud publikujete pod jiným účtem nebo názvem, nahraďte je v příkazech; v projektu se nic měnit nemusí.

1. Na GitHubu vytvořte prázdný **veřejný** repozitář `cloud-admin-deutsch-at`, bez README, licence a `.gitignore`.
2. V PowerShellu:

   ```powershell
   Set-Location "$HOME\Projects\cloud-admin-deutsch-at"
   git init -b main
   git add .
   git status
   ```

   Výpis nesmí obsahovat `node_modules`, `dist`, `test-results`, `playwright-report`, `*.local.*` ani `cloud-admin-deutsch-progress-*.json`.
3. Commitněte a pushněte:

   ```powershell
   git commit -m "Cloud Admin Deutsch 1.0.0"
   git remote add origin https://github.com/BrutusFilip/cloud-admin-deutsch-at.git
   git push -u origin main
   ```

   Když git hlásí `Please tell me who you are`, nastavte `git config --global user.name "<jméno>"` a `git config --global user.email "<e-mail>"`. Jako e-mail můžete použít adresu `…@users.noreply.github.com` ze svého profilu na GitHubu, pak skutečný e-mail v historii nebude.
4. Na GitHubu v záložce **Actions** musí workflow **CI** skončit zeleně, tedy úlohy *Lint, types, tests, build* a *Browser tests (Chromium)*. Úlohy pro Firefox a WebKit výsledek neovlivní, jejich výsledek mi ale prosím pošlete.
5. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
6. **Actions → Deploy to GitHub Pages → Run workflow**, větev `main`. Po doběhnutí je adresa v úloze *Deploy*.
7. Otevřete adresu a vyzkoušejte pohled `#/slovnik/access-v-006` s obnovením stránky.

Licence zatím zvolená není (otevřený bod O02). Do rozhodnutí platí „všechna práva vyhrazena“.
