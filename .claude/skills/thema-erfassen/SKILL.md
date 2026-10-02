---
name: thema-erfassen
description: Phasen B–D für ein Thema des Politik-Duells mit freigegebenen Ursachen – Maßnahmen aus allen Wahlprogrammen erfassen (ein Agent je Programm), ohne Parteinamen bewerten, eintragen und automatisch prüfen. Endet mit einem Pull Request. Aufruf mit der Themen-ID, optional nur für Länder, z. B. /thema-erfassen 17 oder /thema-erfassen 4 --land NI.
argument-hint: <Themen-ID> [--bund | --land XX …]
disable-model-invocation: true
---

# Thema erfassen (Phasen B–D: Maßnahmen)

Aufruf: **$ARGUMENTS**

Du koordinierst nur. Programme lesen die Agenten `programm-erfassung`, bewerten tut der Agent `blind-bewertung`. Du selbst liest keine Programme und vergibst keine Werte. Maßgeblich sind `daten/README.md` („Ablauf für ein neues Thema“, „Erfassen“, „Bewertungsmaßstab“, „Instrumente“) und `docs/methode.md`.

Arbeitsdateien liegen in `.cache/entwurf/<ID>/` (nicht im Repository – dort stehen Programmtexte). Was du mit den Agenten austauschst, kommt in `.cache/entwurf/<ID>/protokoll/` – ohne dieses Protokoll trägt `entwurf:eintragen` nichts ein. Es macht sichtbar, wo du eingegriffen hast; du kennst die Parteien, die Agenten nicht.

**Windows/PowerShell 7:** npm verschluckt Optionen mit Wert, wenn das erste `--` nicht in Anführungszeichen steht (`--partei SPD` wird zum Suchbegriff „SPD“, `--seiten 2-4` zur Ausgabedatei „2-4“ – im Projektstamm entstehen Textdateien). Schreibe `npm run <skript> '--' <Argumente> '--option' wert` oder rufe das Skript direkt auf (`node --experimental-strip-types scripts/entwurf/<name>.ts …`). Umleitungen mit `>` können die Kodierung zerstören; benutze `--ausgabe <datei>` bzw. Dateiargumente. In den Beispielen unten steht deshalb `'--'`.

## 0. Freigabe prüfen

```bash
git fetch origin main
npm run ursachen:freigegeben '--' <ID>
```

Schlägt das fehl: **abbrechen**. Die Ursachen sind noch nicht freigegeben (erst `/thema-anlegen`, dann Merge und `freigabe` mit Datum und bestätigten Quellen durch die Betreiberin) oder wurden verändert. Ursachen werden beim Erfassen nicht ergänzt oder umformuliert. Fällt beim Erfassen auf, dass eine Ursache fehlt, halte es im Pull Request fest – die Entscheidung trifft die Betreiberin.

## 1. Programme und Suchbegriffe festlegen

- **Programme:** alle Bundesprogramme (`daten/parteien.json`); hat das Thema Ursachen mit `ebene: land`, zusätzlich alle aktuellen Landesprogramme (Liste: `npm run -s programme:suche '--' x '--zaehlen'`). Mit `--bund` nur Bund, mit `--land XX` nur diese Länder. Programme, zu denen schon ein Abdeckungseintrag besteht, auslassen (die ergänzt man von Hand).
- **Textdateien:** `npm run -s programme:texte '--' .cache/entwurf/<ID>/texte` schreibt den Text jedes Programms als `<Partei>-<Bund|XX>.txt` mit Seitenmarken. Die Agenten lesen diese Dateien mit Read/Grep (nicht per Konsolenausgabe). Meldet das Skript ein Programm als `NICHT GELADEN` (Server gesperrt oder Datei weicht von der Prüfsumme ab), mach mit den übrigen weiter: Dieses Programm bleibt „noch nicht erfasst“ und steht im Pull Request. Nennt es Seiten fast ohne Text, gib die Liste dem zuständigen Agenten mit.
- **Suchbegriffe je Lösungsrichtung**, **bevor** ein Agent startet – für alle Programme dieselben. Nimm für jede Ursache die Lösungsrichtungen aus der Spalte „Diagnose aus der Debatte“ in `docs/perspektiven-ursachen.md` (jede durch „;“ getrennte Richtung einzeln) und gib jeder eigene Begriffe. Format in `erfassung.json`: `"suchbegriffe": { "1705": { "Beitragsfreiheit": ["beitragsfrei", "gebührenfrei"], "Beiträge nach Einkommen": ["einkommensabhängig", "sozial gestaffelt"] } }`. Wortteile genügen („sozialarbeit“ findet „Schulsozialarbeit“), bei Umlautpluralen den Stamm nehmen („betreuungspl“). Begriffe aus der Sprache aller politischen Richtungen (etwa „Zuwanderung“, „Migration“, „Einwanderung“, „Asyl“), möglichst spezifisch (allgemeine Wörter wie „Fachkräfte“ treffen auch andere Themen). `entwurf:blind` lehnt Ursachen ohne Richtung und Richtungen ohne Begriffe ab.

## 2. Erfassen (Phase B)

Starte je Programm einen Agenten `programm-erfassung`, bis zu sieben gleichzeitig. Jeder bekommt dasselbe: Thema mit Ziel, Ursachen (ID, Beschreibung, Ebene), die Suchbegriffe je Ursache und Lösungsrichtung – dazu seine Partei (ID, Kurzname), Ebene (Bund oder Land XX), URL und Stand des Programms und den Pfad seiner Textdatei. Gib ihm auch mit: nur konkrete Handlungszusagen aufnehmen (keine Leitbilder, Fragmente, bedingte Warnungen), Beschreibung höchstens 200 Zeichen, Trefferzahl je Begriff im Protokoll (`programme:suche … --je-begriff`).

Speichere jede Antwort unverändert als `protokoll/erfassung-<Partei>-<Bund|XX>.txt` (Name wie die Textdatei), bevor du sie auswertest.

Prüfe jede Antwort:
- `nicht_durchsucht` → Programm **weglassen** (bleibt „noch nicht erfasst“), im Pull Request nennen. Nie in `keine_massnahme` umwandeln.
- Unplausibel (Zitat passt nicht zur Beschreibung, Ursache falsch, Landesmaßnahme zu Bundesursache, allgemeines Ziel oder Satzfragment statt Maßnahme, Stelle aus anderem Zusammenhang) → Agent mit konkreter Rückfrage erneut beauftragen. Streichen ohne Rückfrage tust du nicht. Lege bei allen Programmen denselben Maßstab an, nicht nur bei auffälligen.
- **Jede Rückfrage** – an Erfassungs- und Bewertungs-Agenten – kommt mit Programm bzw. Kennung, Anlass und Ergebnis in `protokoll/rueckfragen.md` (gibt es keine: „keine“). Die Zahl der Rückfragen je Programm steht im Pull Request.
- Maßnahmenbeschreibungen einheitlich knapp (höchstens 200 Zeichen) und ohne Parteinamen.
- Weicht der Programmstand im PDF von `parteien.json` ab (Hinweis im Protokoll), im Pull Request nennen.
- **Eigene Synonyme** eines Agenten (Protokoll, „Eigene Synonyme“) übernimmst du unter der passenden Ursache und Richtung in `suchbegriffe` – sie gelten dann für alle Programme.
- **Treffermatrix:** Wenn alle Antworten da sind, `npm run -s entwurf:treffer '--' .cache/entwurf/<ID>/erfassung.json`. Das zählt jeden Begriff in jedem Programm und schreibt `treffer` in die Erfassung (nach jeder Änderung an `suchbegriffe` erneut). Jeder Hinweis „viele Treffer, aber keine Maßnahme“ wird zu einer Rückfrage an den zuständigen Agenten (Fundstellen lesen, Maßnahme erfassen oder begründen, warum nichts passt) – bei **allen** Programmen mit Hinweis, nicht nur bei auffälligen.

Schreibe das Ergebnis nach `.cache/entwurf/<ID>/erfassung.json` (Format: `Erfassung` in `scripts/entwurf.ts`):

```json
{ "thema_id": 17, "suchbegriffe": { "1701": { "Platzausbau": ["kitaplätze", "betreuungspl"] } }, "programme": [ { "partei_id": 11, "land": null, "massnahmen": [ { "beschreibung": "…", "ursachen_ids": [1701], "zitat": "…", "seite": 12 } ] } ] }
```

Zitate gleich prüfen lässt sich erst nach dem Eintragen (Schritt 4); grobe Fehler (Längen, fehlende Felder, falsche Ebene, Zahlen in der Beschreibung, die nicht im Zitat stehen) fängt aber schon `npm run entwurf:blind` ab.

## 3. Bewerten ohne Parteinamen (Phase C)

```bash
npm run -s entwurf:blind '--' .cache/entwurf/<ID>/erfassung.json '--ausgabe' .cache/entwurf/<ID>/blind.json
```

Das Skript ersetzt Parteinamen (samt Artikel und „Wir“), Personen und Länder und meldet verdächtige Reste („Rest: M07: Fraktion“). Über der Schwelle bricht es ab: Formuliere die betroffenen **Beschreibungen** neutral (Zitate bleiben wörtlich) oder bestätige mit `'--schwelle' N` und begründe jeden Rest im Pull Request. Es speichert die Kennungen (M01 …) als `.cache/entwurf/<ID>/kennungen.json` und benutzt sie danach weiter. `blind.json` trägt eine `pruefsumme` über den ganzen Inhalt. **Ab jetzt ist die Erfassung eingefroren:** Änderst du danach eine Beschreibung, ein Zitat, eine Seite oder eine Ursachenzuordnung, passt die Prüfsumme nicht mehr, und `entwurf:bewertung-pruefen` und `entwurf:eintragen` lehnen die Bewertung ab. Dann `entwurf:blind` erneut ausführen und neu bewerten lassen. Fügst du Maßnahmen hinzu, streichst oder sortierst sie um, erzeugt `entwurf:blind` neue Kennungen – eine frühere Bewertung ist dann ganz ungültig. Korrekturen also vor `entwurf:blind`.

Starte **einen** Agenten `blind-bewertung` und gib ihm **nur** den Inhalt von `blind.json` und das heutige Datum – keine Parteinamen, keine Hinweise auf die Herkunft, nichts aus der Erfassung. (Der Agent hat keinen Dateizugriff; die Liste gehört in den Auftrag. Bei vielen Maßnahmen über 100 kann das ein großer Auftrag werden.) Schreibe den Auftrag **vorher wörtlich** nach `protokoll/bewertung-auftrag.txt` – das Skript prüft, dass er die Blindliste mit ihrer Prüfsumme und keinen Parteinamen enthält – und die Antwort nach `protokoll/bewertung-antwort.txt`. Hole das JSON mit `npm run entwurf:json '--' .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt .cache/entwurf/<ID>/bewertung.json`. Es muss `blind_pruefsumme` enthalten (die `pruefsumme` aus `blind.json`); fehlt sie, den Agenten erneut fragen. Bei einem zweiten Auftrag: auch ihn und die Antwort speichern (`bewertung-auftrag-2.txt` …) und in `rueckfragen.md` eintragen; `bewertung-auftrag.txt` und `bewertung-antwort.txt` sind dann die letzte Fassung.

```bash
npm run -s entwurf:bewertung-pruefen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
```

Das Skript lehnt ab bei: unbestätigter Zuordnung zu einer Ursache (der Bewertungs-Agent nennt je Kennung die `ursachen`, an denen die Maßnahme ansetzt; fehlt eine aus der Erfassung, den zuständigen Erfassungs-Agenten die Stelle prüfen lassen, Zuordnung korrigieren, `entwurf:blind` neu), fehlender oder doppelter Kennung, Instrument über Bund und Land, unbenutztem Instrument, Wirksamkeit 3 ohne `belegt`, zu langen Feldern. Es **warnt** bei fast nur `offen` (Forschungsstand nicht recherchiert), fehlenden Quellen, viel zu vielen Instrumenten, zusätzlich gesehenen Ursachen und unterschiedlicher Mehrfachzuordnung (gleiches Instrument, verschiedene Ursachen; ein Programm deutlich öfter mehreren Ursachen zugeordnet). Hinweise zur Zuordnung gleichst du für **alle** Programme gleich aus. Bei Fehlern oder Hinweisen den Agenten erneut beauftragen (wieder nur mit `blind.json` und deiner Rückfrage; bei einem zweiten Auftrag darfst du ihm seine Maßnahmen-Beschreibungen mit Kennungen ohne Zitate nochmals senden). Prüfe außerdem selbst auf Methode, nicht auf Ergebnis: gleiche Lösungswege im selben Instrument, vorhandene Instrumente wiederverwendet, neutrale Begründungen. Werte änderst du nicht selbst. Muss ein Wert später mit Kenntnis der Partei geändert werden (etwa auf Entscheidung der Betreiberin), steht am Instrument bzw. der Maßnahme `"entwurf_herkunft": "nicht_blind"` und im Pull Request der Grund – sonst lehnt die CI die Änderung ab.

## 4. Eintragen und prüfen (Phase D)

```bash
npm run entwurf:eintragen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
npm run daten:pruefen
npm run zitate:pruefen '--' '--thema' <ID>
npm run punkte '--' <ID>
npm run seed
npm test
git status --short
```

- `entwurf:eintragen` prüft das Protokoll, vergibt die IDs, setzt `ki_entwurf: true`, `geprueft: false`, `durchsucht_fuer` und `entwurf_herkunft: blind` und baut die Beleg-Links mit `#page=N`. Es schreibt nur, wenn der Katalog danach gültig ist.
- `git status --short` zeigt nur die erwarteten Dateien (Themendatei, `supabase/seed.sql`, Dokumentation). Fremde Dateien im Projektstamm (etwa `1-6`, `Kita`) sind Reste verschluckter Optionen – löschen, nie committen.
- Unter Windows kann `npm test` wegen CRLF-Zeilenenden bei `01-arzttermine.json` und `seed.sql` scheitern; das hat mit der Erfassung nichts zu tun (siehe `.gitattributes`).
- Meldet `zitate:pruefen` ein Zitat auf einer anderen Seite oder gar nicht: in der Themendatei korrigieren (Seite) oder den zuständigen Agenten die Stelle neu zitieren lassen. Zitate nie „passend machen“, ohne die Seite zu lesen.
- `punkte`: auf Auffälligkeiten achten (eine Partei überall 0, obwohl das Programm viel zum Thema hat? Dann die Erfassung dieses Programms prüfen lassen). Werte nicht nachträglich anpassen, um ein Ergebnis zu verändern.

## 5. Dokumentieren und Pull Request

- `docs/perspektiven-ursachen.md`, Abschnitt des Themas: Absatz **„Erfassung“** mit Datum, „KI-Entwurf, nach dem Festlegen der Ursachen“, erfasste Programme, Suchbegriffe je Ursache und Lösungsrichtung (Richtungen ohne Maßnahme ausdrücklich nennen), Ergebnis (Zahl der Maßnahmen und Instrumente mit ID-Bereich), welche Parteien zu welchen Ursachen nichts haben, nicht durchsuchte Programme und „Nicht erfasst wurden: …“ mit Gründen (aus den Protokollen der Agenten).
- `daten/README.md`: Hinweis „Echte Daten, im Aufbau“ oben aktualisieren (Themen, Zahl der Instrumente).
- Commit und Pull Request („<Thema>: Maßnahmen aus N Programmen (KI-Entwurf)“). Schreibe die Beschreibung nach `.cache/entwurf/<ID>/pr.md` und aktualisiere sie **bei jedem Push** (Datei und Pull Request), damit sie zum Stand passt. Vorlage: `.github/pull_request_template.md` mit der Ja/Nein-Checkliste. In der Beschreibung: Übersicht je Partei (Zahl der Maßnahmen oder „keine Maßnahme“, Zahl der Rückfragen), Ausgabe von `npm run punkte`, offene Fragen und schwierige Einstufungen aus der Bewertung, nicht durchsuchte Programme, Seiten ohne Text, die Prüfsumme der Blindliste, die Treffermatrix je Ursache und Richtung (Summen je Programm) mit den Hinweisen und wie sie erledigt wurden, verdächtige Reste mit Begründung, die Hinweise zur Zuordnung. Hinweis: Die Werte sind Entwürfe; es folgen die Bewertung durch eingeladene Prüfende und die Belegprüfung (`npm run pruefliste -- <ID>`).
