# Vorbereitung: Name, GitHub-Organisation, Konten

Drei Aufgaben, die du jetzt allein erledigen kannst. Zusammen etwa 2–3 Stunden. Danach hängt das Projekt nicht mehr an deinen privaten Konten, und die spätere Übergabe an den Verein ist schnell erledigt.

Menüs der Dienste ändern sich gelegentlich. Wenn ein Punkt anders heißt, in den Einstellungen nach dem Stichwort in Klammern suchen.

---

## 1. Namen prüfen (ca. 20 Minuten)

Ziel: Sicher sein, dass es keinen Verein und keine Marke „Politik-Duell“ gibt, mit denen es Streit geben könnte.

### 1.1 Vereinsregister

1. [www.handelsregister.de](https://www.handelsregister.de) öffnen → oben **„Normale Suche“**.
2. Bei **Schlagwörter** eingeben: `Politik-Duell`. Darunter bei den Optionen **„mindestens ein Schlagwort enthalten“** wählen.
3. Bei **Registerart** `VR` (Vereinsregister) wählen; Bundesland und Registergericht leer lassen (= ganz Deutschland).
4. **Suchen** klicken.
5. Wiederholen mit `Politikduell`, `Politik Duell` und `Duell` + Registerart `VR` (die letzte Suche zeigt ähnliche Namen).
6. Zur Sicherheit einmal ohne Registerart suchen (auch GmbHs und UGs).

**Auswertung:**
- Kein Treffer → gut, notieren.
- Ein Verein mit gleichem Namen **in einem anderen Ort** → rechtlich erlaubt (§ 57 Abs. 2 BGB verlangt nur Unterscheidbarkeit am selben Ort), aber verwechslungsträchtig. Namen mit Zusatz überlegen, z. B. „Politik-Duell – Verein für politische Bildung“.
- Eine Firma mit gleichem Namen → mir oder einer Beratung zeigen, bevor du weitermachst.

### 1.2 Marken

1. [DPMAregister](https://register.dpma.de/DPMAregister/marke/einsteiger) öffnen (**Marken → Einsteigerrecherche**).
2. Bei **Marke** eingeben: `Politik-Duell` → **Recherche starten**. Wiederholen mit `Politikduell` und `Politik Duell`.
3. Für EU-Marken: [TMview](https://www.tmdn.org/tmview/) → Suchfeld `politik duell` → Gebiete **DE** und **EM** (EU).

**Auswertung:** Wichtig sind nur **eingetragene** Marken („Status: eingetragen“) in den Klassen **9** (Software, Apps), **28** (Spiele), **41** (Bildung, Unterhaltung). Ein solcher Treffer ist ein Grund, vor der Vereinsgründung eine Beratung einzuholen. Treffer mit anderen Klassen oder „zurückgewiesen/gelöscht“ sind unkritisch.

### 1.3 Ergebnis festhalten

Screenshots der Trefferlisten mit Datum im Projektordner ablegen (nicht im Repo), und hier abhaken:

- [ ] Vereinsregister geprüft am ______ – Ergebnis: ______
- [ ] DPMA/TMview geprüft am ______ – Ergebnis: ______

---

## 2. GitHub-Organisation (ca. 30 Minuten)

Ziel: Das Repo gehört nicht mehr deinem persönlichen Konto `abaron-lab`, sondern einer Organisation `politik-duell`. Später bekommen weitere Vorstandsmitglieder Zugang, und der Verein übernimmt die Organisation, ohne dass du dein Konto hergeben musst.

**Stand September 2026:** Organisation `politik-duell` angelegt, Repo nach `politik-duell/politik-duell` übertragen, Links im Repo angepasst. Die Schritte 2.2 und 2.3 unten sind erledigt und bleiben als Nachweis stehen (deshalb nennen sie noch den alten Pfad). Offen: Vercel und Claude Code prüfen (2.4).

- [x] Organisation `politik-duell` angelegt (2.2)
- [x] Repo übertragen (2.3)
- [x] Links im Repo angepasst (2.4, „Links im Repo“)
- [ ] Vercel angeschlossen (2.4)
- [ ] Claude Code angeschlossen (2.4)

### 2.1 Vorher prüfen

- [ ] **Zwei-Faktor-Anmeldung** auf deinem GitHub-Konto ist an: Profilbild → **Settings → Password and authentication** → „Two-factor authentication“ muss „Enabled“ zeigen. Die Wiederherstellungscodes (*Recovery codes*) in den Passwortmanager legen (Abschnitt 3.1).
- [ ] Keine offenen Pull Requests, die gerade von Vercel gebaut werden (sonst nach dem Umzug einmal neu anstoßen).

### 2.2 Organisation anlegen

1. Auf github.com oben rechts **+** → **New organization**.
2. Tarif **Free** → **Create a free organization**.
3. Ausfüllen:
   - **Organization name:** `politik-duell` (ist er vergeben: `politik-duell-de`)
   - **Contact email:** `politik-duell@posteo.de`
   - **This organization belongs to:** *My personal account* (solange es den Verein noch nicht gibt)
4. Häkchen bei den Nutzungsbedingungen → **Next**. Den Schritt „Add organization members“ mit **Skip this step** überspringen.
5. In der neuen Organisation **Settings**:
   - **Profile:** Display name `Politik-Duell`, URL `https://politik-duell.de`, E-Mail `politik-duell@posteo.de`, Beschreibung „Lernspiel zur politischen Bildung – Versprechen kann jeder.“
   - **Authentication security:** **Require two-factor authentication** anhaken → **Save**.
   - **Member privileges:** „Base permissions“ auf **Read** lassen; „Repository creation“ nur für Owner.

### 2.3 Repo übertragen

1. Im Repo `abaron-lab/politik-duell` → **Settings** → **General** → ganz unten **Danger Zone** → **Transfer ownership** (*Transfer*).
2. **Select one of my organizations** → `politik-duell`. Repository-Name bleibt `politik-duell`.
3. Zur Bestätigung `abaron-lab/politik-duell` eintippen → **I understand, transfer this repository**.

Was dabei passiert: Code, Branches, Issues, Pull Requests, Sterne und GitHub Actions ziehen mit um. Alte Links und `git`-Adressen leiten automatisch auf `github.com/politik-duell/politik-duell` weiter. **Lege danach nie ein neues Repo `abaron-lab/politik-duell` an** – das würde die Weiterleitung kaputt machen.

### 2.4 Danach anschließen

**Vercel** (wichtig, sonst gibt es keine neuen Deployments):
1. Auf vercel.com das Projekt `politik-duell` öffnen → **Settings → Git**.
2. Steht dort noch das verbundene Repo `politik-duell/politik-duell`: nichts tun, weiter bei Schritt 4.
3. Sonst **Disconnect** → **Connect Git Repository** → GitHub → **Adjust GitHub App Permissions** / *Install*. GitHub fragt, wo die Vercel-App installiert werden soll: Organisation **politik-duell** → **Only select repositories** → `politik-duell` → **Install**. Dann das Repo in Vercel auswählen.
4. Test: Im Repo eine Kleinigkeit ändern (oder mich einen Pull Request machen lassen) und prüfen, ob unter **Deployments** ein neues Deployment erscheint und `politik-duell.de` weiter läuft. Domain, Umgebungsvariablen und Einstellungen bleiben im Vercel-Projekt, die sind vom Umzug nicht betroffen.

**Claude Code** (damit ich weiter im Repo arbeiten kann):
1. [github.com/apps/claude/installations/select_target](https://github.com/apps/claude/installations/select_target) öffnen → Organisation **politik-duell** → **Only select repositories** → `politik-duell` → **Install**.
2. Neue Sitzungen dann mit dem Repo `politik-duell/politik-duell` starten. Laufende Sitzungen (wie diese) sind auf `abaron-lab/politik-duell` beschränkt – nach dem Umzug am besten eine neue beginnen.

**Supabase:** Die Datenbank hängt nicht an GitHub, dort ist nichts zu tun. Falls du dich bei Supabase *mit GitHub* anmeldest, ändert sich daran auch nichts.

**Links im Repo:** In einer neuen Sitzung sagen: „Repo ist nach politik-duell/politik-duell umgezogen, bitte alle Links anpassen.“ Betroffen sind `src/rechtliches/betreiber.ts` (Link „öffentlicher Quellcode“ im Impressum), `supabase/EINRICHTEN.md`, `CLAUDE.md` und `docs/verein/uebertragung.md`.

**Eigener Rechner** (nur falls du dort eine Kopie hast): `git remote set-url origin https://github.com/politik-duell/politik-duell.git`

---

## 3. Konten auf die Projektadresse umstellen (ca. 1–2 Stunden)

Grundregel: **Anmelden tust weiterhin du persönlich** (mit Zwei-Faktor-Schutz). Auf die Projektadresse `politik-duell@posteo.de` gehören alles, was das *Projekt* betrifft – Rechnungen, Warnungen, Kontaktadresse, Organisationsname. So musst du später keine persönlichen Konten weitergeben, sondern nur Organisationen und Projekte übertragen.

| Dienst | Jetzt | Später (Verein) |
| --- | --- | --- |
| Posteo | absichern | Zugang an Vorstand |
| Passwortmanager | einrichten | geteilter Tresor |
| GitHub | erledigt mit Abschnitt 2 | Vorstand als Owner |
| Supabase | Organisation umbenennen, Rechnungsadresse | Organisation übergeben |
| Mistral | Workspace umbenennen, Rechnungsadresse, Limit | Workspace übergeben, neuer Schlüssel |
| INWX | Kontakt-E-Mail, 2FA | Inhaberwechsel |
| Vercel | 2FA, Benachrichtigungen | Projekt an Team übertragen |

### 3.1 Passwortmanager (zuerst)

1. Einen Passwortmanager wählen, z. B. **Bitwarden** (kostenlos, später Tresor mit dem Vorstand teilbar) oder **KeePassXC** (Datei, ganz ohne Cloud).
2. Einen Ordner **„Politik-Duell“** anlegen. Für jeden Dienst unten einen Eintrag mit: Anmelde-E-Mail, Passwort, **Wiederherstellungscodes der Zwei-Faktor-Anmeldung**, Kundennummer.
3. **Notfallzugang:** Das Hauptpasswort und die Wiederherstellungscodes des Passwortmanagers auf Papier in einen verschlossenen Umschlag an eine Vertrauensperson geben (oder Bitwardens „Notfallzugriff“ nutzen, kostenpflichtig). Sonst ist das Projekt weg, wenn dir etwas passiert.

### 3.2 Posteo (`politik-duell@posteo.de`)

Das Postfach ist der Generalschlüssel: Über es lassen sich alle anderen Passwörter zurücksetzen.

1. Bei posteo.de anmelden → **Einstellungen**.
2. **Zwei-Faktor-Authentifizierung** einschalten (unter *Sicherheit*) und den Wiederherstellungscode in den Passwortmanager.
3. Wiederherstellung einrichten (unter *Passwort* bzw. *Sicherheit*): Posteo arbeitet anonym, ohne Wiederherstellungscode kommt niemand mehr ins Postfach.
4. **Laufzeit prüfen** (unter *Guthaben* / *Laufzeit*): Guthaben für mindestens 12 Monate aufladen, damit das Postfach nicht versehentlich ausläuft. Beleg aufheben.

### 3.3 Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → links oben die **Organisation** auswählen, in der das Projekt `wer-liefert` liegt → **Settings** (Organisation, nicht Projekt).
2. **General → Organization name:** `Politik-Duell` → **Save**.
3. **Billing** (falls vorhanden): **Billing email** auf `politik-duell@posteo.de`.
4. Profilbild → **Account preferences → Security** (*Multi-Factor Authentication*): Zwei-Faktor-Anmeldung einschalten.
5. Projekt `wer-liefert` → **Authentication → Emails / SMTP**: nichts ändern – nur prüfen, dass die Admin-Anmeldungen (Tabelle `admins`) weiter funktionieren.

Später übergibst du die ganze Organisation: weitere Vorstandsmitglieder als **Owner** einladen, dann dich selbst herabstufen oder das Projekt in eine Vereinsorganisation übertragen.

### 3.4 Mistral

1. [console.mistral.ai](https://console.mistral.ai) → oben links den **Workspace** bzw. die **Organisation** öffnen → **Settings** (*Workspace*/*Organization*).
2. Name auf `Politik-Duell` ändern.
3. **Billing**: Rechnungs-E-Mail bzw. Rechnungsadresse auf `politik-duell@posteo.de` (Name vorerst deiner, mit Zusatz „Projekt Politik-Duell“).
4. **Billing → Limits** (*Usage limit*): Ausgabenlimit prüfen (siehe `supabase/EINRICHTEN.md`, z. B. 5–20 €/Monat).
5. **Privacy** / *Data*: prüfen, dass die Nutzung der Anfragen zum Training ausgeschaltet ist.
6. Profil → **Security**: Zwei-Faktor-Anmeldung einschalten, falls angeboten.

Lässt sich bei Mistral die Rechnungsadresse nicht vom Anmeldekonto trennen: so lassen und beim Übergeben an den Verein einen neuen Workspace mit dem Vereinskonto anlegen und einen neuen API-Schlüssel erzeugen (steht schon in [uebertragung.md](uebertragung.md)).

### 3.5 INWX (Domains)

1. Bei [inwx.de](https://www.inwx.de) anmelden → **Konto** (*Account*) → **Sicherheit**: **Mobile TAN / Zwei-Faktor** einschalten, Wiederherstellungscode in den Passwortmanager.
2. **Konto → Kontaktdaten** (*Stammdaten*): Die Adresse fürs Konto selbst kannst du privat lassen; wichtiger sind die Domain-Kontakte.
3. **Domains → Kontakte** (*Handles*): Beim Kontakt, der als **Inhaber (Owner)** an `politik-duell.de` und `politikduell.de` hängt, die **E-Mail** auf `politik-duell@posteo.de` ändern. Name und Anschrift bleiben deine – Inhaber bist bis zur Übertragung du. Gleiches beim **Admin-C**, falls ein eigener Kontakt hinterlegt ist.
4. **Domains → Übersicht:** Bei beiden Domains prüfen, dass **automatische Verlängerung** an ist und das Zahlungsmittel gültig ist. Eine ausgelaufene Domain kann sich jemand anderes schnappen.

### 3.6 Vercel

Den Hobby-Zugang kannst du nicht an andere weitergeben; bei der Übergabe wird das Projekt in ein Team des Vereins übertragen. Jetzt nur absichern:

1. Profilbild → **Account Settings → Authentication** (*Security*): Zwei-Faktor-Anmeldung einschalten. Meldest du dich mit GitHub an, schützt die GitHub-2FA aus Abschnitt 2.1 schon.
2. **Account Settings → General → Email** (*Emails*): `politik-duell@posteo.de` als weitere Adresse hinzufügen und bestätigen, wenn du Warnungen (fehlgeschlagene Deployments, Domain-Probleme) dort bekommen möchtest.

### 3.7 Belege und Kosten

1. Im Postfach `politik-duell@posteo.de` einen Ordner **„Rechnungen“** anlegen; alte Rechnungen von INWX, Posteo, Mistral aus dem privaten Postfach dorthin weiterleiten.
2. Eine einfache Liste führen: Datum, Dienst, Betrag, bezahlt von. Der Verein kann die **Gründungskosten** (Satzung § 14) erstatten; die laufenden Kosten bis zur Übergabe trägst du privat.

### Abhaken

- [ ] Passwortmanager mit Notfallzugang
- [ ] Posteo: 2FA, Wiederherstellung, Guthaben
- [x] GitHub: Organisation angelegt, Repo übertragen, Links angepasst
- [ ] GitHub: 2FA, Vercel und Claude angeschlossen
- [ ] Supabase: Organisation umbenannt, Rechnungsadresse, 2FA
- [ ] Mistral: Workspace, Rechnungsadresse, Limit, Training aus, 2FA
- [ ] INWX: 2FA, Domain-Kontakt-E-Mail, automatische Verlängerung
- [ ] Vercel: 2FA, Projektadresse für Warnungen
- [ ] Rechnungsordner und Kostenliste
