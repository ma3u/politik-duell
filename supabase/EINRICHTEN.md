# Supabase einrichten (Meilenstein 3 bis 5)

Projekt: `xfprvshhexhzhfgkfxpi` (Region Frankfurt).

## Weg A: nur im Browser (empfohlen, kein eigener Rechner nötig)

Die Dateien in `supabase/dashboard/` sind zum Kopieren gedacht. Auf GitHub gibt es oben rechts
über jeder Datei den Knopf **„Copy raw file“** (zwei überlappende Rechtecke).

### 1. Datenbank anlegen

1. Datei öffnen: [`supabase/dashboard/1-datenbank.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/1-datenbank.sql) → **Copy raw file**
2. [SQL Editor öffnen](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new), einfügen, **Run** klicken.
3. Erwartet: „Success. No rows returned“. Im *Table Editor* stehen jetzt Tabellen mit Beispieldaten.

### 2. Edge Function anlegen

1. Datei öffnen: [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) → **Copy raw file**
2. [Edge Functions öffnen](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/functions) → **Deploy a new function** → **Via Editor**.
3. Den vorhandenen Beispielcode komplett löschen, den kopierten Inhalt einfügen.
4. Als Namen der Funktion **`analyse`** eintragen (genau so, klein geschrieben) → **Deploy function**.
5. In der Funktion unter *Details → Function configuration* die Option
   **„Verify JWT with legacy secret“ ausschalten** → **Save changes**.
   Pflicht: Der Publishable Key der App ist kein JWT, sonst werden alle Aufrufe abgelehnt.
   Die App ruft ohne Login auf; geschützt ist die Funktion durch Eingabeprüfung und ein
   Rate-Limit (40 Anfragen pro 30 Minuten und Sitzung).

Das Secret `MISTRAL_API_KEY` ist schon gespeichert ✔. Optional wechselt das Secret
`MISTRAL_MODEL` das Modell (Standard: `mistral-small-latest`).

> **Wichtig bei Mistral:** In der Mistral-Konsole unter *Billing* muss **„API pay-as-you-go“
> aktiviert** sein – auch im Free-Plan. Sonst lehnt Mistral jeden API-Aufruf mit
> `429 Rate limit exceeded` (code 1300) ab, obwohl der Playground funktioniert. Das enthaltene
> Monatsguthaben wird trotzdem genutzt; ein niedriges Ausgabenlimit (z. B. 5 €) deckelt die Kosten.
> Schnelltest ohne App:
> `curl https://api.mistral.ai/v1/chat/completions -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"model":"mistral-small-latest","messages":[{"role":"user","content":"Hallo"}]}'`

### 3. App im Netz starten (Vercel, kostenlos)

1. Auf [vercel.com](https://vercel.com) mit GitHub anmelden → **Add New… → Project** → Repository `politik-duell` importieren.
2. Vercel erkennt Vite automatisch. **Deploy** klicken.
3. Vercel veröffentlicht den Branch `main` unter der Hauptadresse. Für jeden anderen Branch
   entsteht bei jedem Push ein Vorschau-Deployment (im Projekt unter **Deployments**).

URL und Publishable Key liest die App aus der Datei `.env` im Repo; dort ist nichts einzutragen.

### 4. Meilenstein 4: Wortwolke und Moderation

Einmalig, wenn Schritt 1–3 schon erledigt sind:

1. **Datenbank ergänzen:** [`supabase/migrations/20260927000000_moderation.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20260927000000_moderation.sql)
   → **Copy raw file** → im [SQL Editor](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new)
   einfügen → **Run**. Legt Stichwort- und Moderationsfelder, die Tabelle `admins` und die
   Zugriffsregeln für Admins an und schaltet Realtime für `runden` ein.
2. **Edge Function aktualisieren:** in der Funktion `analyse` den Code durch
   [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) ersetzen → **Deploy**
   (sie speichert jetzt ein Stichwort und prüft es mit dem automatischen Filter).
3. **Admin-Konto anlegen:** [Authentication → Users](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/auth/users)
   → **Add user → Create new user**, E-Mail und ein starkes Passwort eintragen,
   **„Auto Confirm User“** anhaken → **Create user**.
4. **Konto zum Admin machen:** im SQL Editor (E-Mail anpassen) → **Run**:
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'admin@example.org';
   ```
   Erwartet: „Success. 1 row affected“ (bei 0: E-Mail-Adresse prüfen).
5. **Empfohlen:** [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/auth/providers)
   → **„Allow new users to sign up“ ausschalten** → Save. Fremde Konten hätten ohnehin keine Rechte,
   so entstehen aber gar keine.
6. **Moderieren:** In der App die Adresse um `#/admin` ergänzen (`https://politik-duell.de/#/admin`)
   und anmelden.

So läuft die Moderation:

- Nach jeder Runde speichert die Funktion ein kurzes Stichwort (z. B. „Facharzttermin“). Öffentlich
  ist es erst nach **Freigabe** in der Admin-Ansicht; das Stichwort kann vorher geändert werden.
- Der automatische Filter (Beleidigungen, Hetze, Namen mit Anrede wie „Herr Müller“, Kontaktdaten,
  Links) prüft Stichwort, Zusammenfassung und Originaltext. Treffer landen unter **„Vom Filter gestoppt“**.
  Der Originaltext wird dafür nur geprüft, nicht gespeichert.
- „Wert“-Runden erscheinen nicht, weil sie keine Probleme sind.
- **Neue Themen:** Probleme ohne passendes Thema (Review-Warteschlange) zum Abhaken.
- Die Wortwolke auf dem Startbildschirm aktualisiert sich live (Supabase Realtime). Solange noch
  nichts freigegeben ist, zeigt sie Beispielwörter.

### 5. Meilenstein 5: Start für die Öffentlichkeit

Datenbank: **nichts zu tun** (keine neue Migration).

1. **Edge Function aktualisieren:** in der Funktion `analyse` den Code durch
   [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) ersetzen → **Deploy**.
   Neu: globales Rate-Limit über alle Sitzungen (Kostendeckel für die KI, ohne IP-Adressen),
   optionale Beschränkung auf die eigene Website, Größenlimit für Anfragen.
2. **Secrets setzen** ([Edge Functions → Secrets](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/functions/secrets)):
   - `ERLAUBTE_URSPRUENGE` – Adressen, von denen die App die Funktion aufrufen darf, mit Komma getrennt,
     ohne Schrägstrich am Ende. `*` steht für einen Teil des Namens (für Vercel-Vorschauen), z. B.
     `https://politik-duell.de, https://www.politik-duell.de, https://politik-duell-*.vercel.app`.
     Leer lassen = von überall erlaubt (praktisch beim Einrichten).
     Aktueller Wert, Erklärung und Fehlersuche: [`ERLAUBTE_URSPRUENGE.md`](ERLAUBTE_URSPRUENGE.md).
   - `RATE_LIMIT_GLOBAL` – optional, KI-Anfragen pro Stunde für alle zusammen (Standard: 600).
     Pro Sitzung gelten weiter 40 Anfragen in 30 Minuten.
3. **Impressum und Datenschutz ausfüllen:** [`src/rechtliches/betreiber.ts`](https://github.com/politik-duell/politik-duell/blob/main/src/rechtliches/betreiber.ts)
   auf GitHub bearbeiten (Stift-Symbol) und alle Felder in `[…]` ersetzen: Name, ladungsfähige
   Anschrift, E-Mail, Aufsichtsbehörde des Bundeslands. Solange etwas fehlt, zeigen beide Seiten
   einen gelben Entwurfs-Hinweis. Die Seiten stehen unter `#/impressum` und `#/datenschutz` und
   sind von jedem Bildschirm aus in der Fußzeile verlinkt.
   **Empfehlung:** die Datenschutzerklärung vor dem Start rechtlich prüfen lassen.
4. **Verträge zur Auftragsverarbeitung (AVV/DPA)** abschließen bzw. bestätigen:
   - Supabase: Dashboard → *Organization → Legal Documents* → DPA
   - Vercel: [vercel.com/legal/dpa](https://vercel.com/legal/dpa)
   - Mistral: gilt mit den Nutzungsbedingungen; im Free-Plan unter *Privacy* das Training abschalten,
     für den Start besser den bezahlten Plan (dort ohne Training).
   - Mistral-Ausgabenlimit setzen (z. B. 5–20 €/Monat) – zusammen mit `RATE_LIMIT_GLOBAL` der Kostendeckel.
5. **Vercel:** `vercel.json` im Repo setzt Sicherheits-Header (u. a. Content-Security-Policy, nur
   Verbindungen zur eigenen Supabase-Instanz, Mikrofon nur für die eigene Seite). Nach dem Merge
   baut Vercel automatisch neu. Wechselt das Supabase-Projekt, die Adresse in `vercel.json` anpassen.
6. **Domain:** in Vercel unter *Settings → Domains* `politik-duell.de` (Hauptadresse) und
   `www.politik-duell.de` eintragen und die angezeigten DNS-Einträge beim Domain-Anbieter setzen.
   `politikduell.de` leitet auf `politik-duell.de` weiter – entweder beim Domain-Anbieter oder in
   Vercel als weitere Domain mit *Redirect to* `politik-duell.de`. Danach beide Schreibweisen von
   `politik-duell.de` in `ERLAUBTE_URSPRUENGE` ergänzen (die Weiterleitungs-Domain nicht nötig,
   die App läuft immer unter der Hauptadresse).
7. **Supabase Auth:** unter [Authentication → URL Configuration](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/auth/url-configuration)
   die *Site URL* auf die öffentliche Adresse setzen. „Allow new users to sign up“ ausgeschaltet lassen (Schritt 4.5).
8. **Probe:** Seite öffnen → Einwilligung anhaken → eine Runde spielen. Im Browser (F12 → Konsole)
   dürfen keine Meldungen „Content Security Policy“ erscheinen.

## Weg B: mit der Supabase-Kommandozeile (auf einem eigenen Rechner)

```bash
npx supabase login
npx supabase link --project-ref xfprvshhexhzhfgkfxpi   # fragt nach dem Datenbank-Passwort
npx supabase db push --include-seed
npx supabase functions deploy analyse --no-verify-jwt
npx supabase functions deploy pruefung --no-verify-jwt
npm install && npm run dev
```

Admin-Konto danach wie in Weg A, Schritt 4.3–4.5.

## Prüfen, ob alles läuft

- *Table Editor*: Tabellen `parteien`, `themen`, `ursachen`, `massnahmen` enthalten Daten.
- Nach einer gespielten Runde steht ein Eintrag in `runden`; Probleme ohne Thema zusätzlich in
  `review_warteschlange`.
- Fehler der Funktion: *Edge Functions → analyse → Logs*.
- Moderation: neue Runden erscheinen in `#/admin` unter „Offen“ ohne Neuladen; nach „Freigeben“
  taucht das Stichwort auf dem Startbildschirm auf (ggf. ein paar Sekunden warten).

### 6. Abdeckung: „nichts im Programm“ vs. „noch nicht erfasst“

Einmalig, **in dieser Reihenfolge** (sonst zeigt die App „Die Spieldaten konnten nicht geladen werden“):

1. **Datenbank ergänzen:** [`supabase/migrations/20260928000000_abdeckung.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20260928000000_abdeckung.sql)
   → **Copy raw file** → im [SQL Editor](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new)
   einfügen → **Run**. Legt die Tabelle `abdeckung` an und erlaubt den Rundenstatus `unvollstaendig`.
2. **Daten einspielen:** Inhalt von [`supabase/seed.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/seed.sql)
   im SQL Editor ausführen (füllt `abdeckung`; gespielte Runden bleiben erhalten).
3. **Edge Function aktualisieren:** in der Funktion `analyse` den Code durch
   [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) ersetzen → **Deploy**
   (speichert Runden mit einer noch nicht erfassten Partei als `unvollstaendig`, ohne Punkte).
4. Erst danach den Branch nach `main` übernehmen, damit Vercel die neue App veröffentlicht.

### 7. Bewertung durch eingeladene Prüfende

Einmalig, **in dieser Reihenfolge**. Ablauf und Regeln: [`daten/README.md`](../daten/README.md) → „Prüfung“.

1. **Datenbank ergänzen:** [`supabase/migrations/20260929000000_pruefung.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20260929000000_pruefung.sql)
   → **Copy raw file** → im [SQL Editor](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new)
   einfügen → **Run**. Legt die Tabellen `pruef_einladungen` und `pruef_bewertungen` an (nur Admins
   und die Edge Function haben Zugriff) und die Funktion `pruefende_oeffentlich` für die Methodenseite.
2. **Edge Function anlegen:** [`supabase/dashboard/3-pruefung.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/3-pruefung.ts)
   → **Copy raw file** → [Edge Functions](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/functions)
   → **Deploy a new function** → **Via Editor** → Beispielcode löschen, einfügen, Name **`pruefung`** → **Deploy function**.
   Danach unter *Details → Function configuration* **„Verify JWT with legacy secret“ ausschalten** → **Save changes**
   (wie bei `analyse`; Prüfende haben kein Konto, Zugang nur über den persönlichen Link).
   Das Secret `ERLAUBTE_URSPRUENGE` gilt auch hier.
3. **Branch nach `main` übernehmen**, damit Vercel die Prüfseite und den Admin-Bereich veröffentlicht.
4. **Einladungen anlegen:** `#/admin` → Reiter **„Prüfung“** → Name eintragen, Thema (z. B. Miete) anhaken →
   **Einladung anlegen**. Den angezeigten Link sofort kopieren und der Person persönlich schicken – er wird
   nicht gespeichert und lässt sich später nicht noch einmal anzeigen. Geht ein Link verloren: bei der
   Person **„Neuer Link“** – der alte Link wird ungültig, Bewertungen und Einwilligung bleiben erhalten
   (braucht Schritt 6).
5. **Auswerten und übernehmen:** Sind genug Bewertungen fertig gemeldet, unter „Auswertung“ **Export (ohne Namen)**
   herunterladen und auf einem Rechner mit dem Repo `npm run pruefung:uebernehmen -- <datei>` ausführen
   (oder die Datei in einer Claude-Code-Sitzung übergeben).

6. **„Neuer Link“ freischalten** (einmalig, nachträglich ergänzt):
   [`supabase/migrations/20260930000000_pruefung_neuer_link.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20260930000000_pruefung_neuer_link.sql)
   → **Copy raw file** → im SQL Editor einfügen → **Run**. Erwartet: „Success. No rows returned“.
   Die Edge Function bleibt unverändert.

Nach Änderungen an den Maßnahmen eines Themas (neue IDs) `npm run dashboard` ausführen und `3-pruefung.ts`
neu einspielen – die Funktion kennt die Maßnahmen-IDs je Thema aus dem Datenkatalog.

### 8. Bund und Länder, Stand der Forschung

Einmalig, **in dieser Reihenfolge**. Regeln: [`docs/methode.md`](../docs/methode.md) → „Bund und Länder“.

1. **Datenbank ergänzen:** [`supabase/migrations/20261001000000_laender.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20261001000000_laender.sql)
   → **Copy raw file** → im [SQL Editor](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new)
   einfügen → **Run**. Ergänzt `ursachen.ebene`, `massnahmen.land` und `massnahmen.evidenz`, `abdeckung.land`
   und legt die Tabellen `laender` und `landesprogramme` an.
2. **Daten einspielen:** Inhalt von [`supabase/seed.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/seed.sql)
   im SQL Editor ausführen (braucht Schritt 1, sonst Fehler bei `laender`).
3. **Edge Function aktualisieren:** in der Funktion `analyse` den Code durch
   [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) ersetzen → **Deploy**
   (wertet mit dem gewählten Bundesland; gespeichert wird es nicht).
4. Danach den Branch nach `main` übernehmen. Die App verträgt es auch, wenn Schritt 1 fehlt: Dann gibt es nur keine
   Bundesland-Auswahl. Die Auswahl erscheint ohnehin erst, wenn für ein Land Landesprogramme ausgewertet und geprüft sind.

### 9. Geschlossene Testphase

Einmalig, **in dieser Reihenfolge**. Wer einen Zugangslink hat, sieht im Spiel zusätzlich KI-Entwürfe – deutlich als
„vorläufige KI-Bewertung“ gekennzeichnet. Alle anderen sehen weiterhin nur Geprüftes.

1. **Datenbank ergänzen:** [`supabase/migrations/20261002000000_testphase.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/migrations/20261002000000_testphase.sql)
   → **Copy raw file** → im [SQL Editor](https://supabase.com/dashboard/project/xfprvshhexhzhfgkfxpi/sql/new)
   einfügen → **Run**. Ergänzt `ki_entwurf` bei Maßnahmen und Abdeckung (öffentlich nicht lesbar), `testphase` bei
   Runden, die Tabelle `testphase_zugaenge` und die Funktion `testphase_daten`.
2. **Daten einspielen:** Inhalt von [`supabase/seed.sql`](https://github.com/politik-duell/politik-duell/blob/main/supabase/seed.sql)
   im SQL Editor ausführen (braucht Schritt 1).
3. **Edge Function aktualisieren:** in der Funktion `analyse` den Code durch
   [`supabase/dashboard/2-analyse.ts`](https://github.com/politik-duell/politik-duell/blob/main/supabase/dashboard/2-analyse.ts) ersetzen → **Deploy**.
   Wichtig, und zwar direkt nach Schritt 1: Die Funktion liest mit dem Service-Key, der die Zugriffsregeln
   umgeht, und schließt KI-Entwürfe ohne Zugang erst in der neuen Fassung aus.
4. Branch nach `main` übernehmen.
5. **Zugänge anlegen:** `#/admin` → Reiter **„Testphase“** → Name eintragen → **Zugang anlegen** → Link kopieren und
   der Person persönlich schicken (er wird nur einmal angezeigt). Einzelne Zugänge lassen sich sperren oder löschen.
   Wer den Link öffnet, bleibt in diesem Browser in der Testphase, bis er „Testphase verlassen“ wählt.

## Nach Änderungen am Code

`npm run dashboard` erzeugt `supabase/seed.sql` und beide Dateien in `supabase/dashboard/` neu.
Danach im Dashboard:

- **Beispieldaten geändert:** nur den Inhalt von `supabase/seed.sql` im SQL Editor ausführen
  (mehrfach ausführbar, gespielte Runden bleiben erhalten).
- **Edge Function geändert:** in der Funktion `analyse` den Code durch `2-analyse.ts` ersetzen → Deploy
  (bzw. `pruefung` durch `3-pruefung.ts`).
- **Neue Migration:** nur die neue Datei aus `supabase/migrations/` im SQL Editor ausführen.

## Datenschutz

- Gespeichert wird nur die neutrale Kurzfassung eines Problems (`runden.problem_text`) und ein Stichwort, keine
  Rohtexte, keine IPs, kein Audio. Die Sitzungs-ID für das Rate-Limit ist zufällig und wird nach
  einem Tag gelöscht.
- Mistral: Im kostenlosen Plan in der Mistral-Konsole unter *Privacy* die Nutzung für Training
  abschalten. Für den öffentlichen Start den bezahlten Plan nutzen (dort kein Training).
- Supabase, Vercel und Mistral protokollieren technisch bedingt Zugriffe; das steht in der
  Datenschutzerklärung (`src/rechtliches/Rechtliches.tsx`). Bei neuen Diensten oder neuen
  gespeicherten Feldern die Erklärung mit anpassen.
- Vor dem Spielstart gibt es eine ausdrückliche Einwilligung (Art. 9 DSGVO), weil Eingaben
  politische Meinungen erkennen lassen können. Sie wird nicht gespeichert.
- Prüfende: Name und Einzelbewertungen stehen nur in Supabase (`pruef_einladungen`, `pruef_bewertungen`),
  nie im Repo. Ihre Einwilligung wird gespeichert (`einwilligung_am`). Auf Wunsch die Einladung in der
  Admin-Ansicht löschen – das löscht alle Bewertungen der Person mit.
