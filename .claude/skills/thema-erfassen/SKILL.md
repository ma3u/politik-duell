---
name: thema-erfassen
description: Phasen B–D für ein Thema des Politik-Duells mit freigegebenen Ursachen – Maßnahmen aus allen Wahlprogrammen erfassen (ein Agent je Programm), ohne Parteinamen bewerten, eintragen und automatisch prüfen. Endet mit einem Pull Request. Aufruf mit der Themen-ID, optional nur für Länder, z. B. /thema-erfassen 17 oder /thema-erfassen 4 --land NI.
argument-hint: <Themen-ID> [--bund | --land XX …]
disable-model-invocation: true
---

# Thema erfassen (Phasen B–D: Maßnahmen)

Aufruf: **$ARGUMENTS**

Du koordinierst nur. Programme lesen die Agenten `programm-erfassung`, bewerten tut der Agent `blind-bewertung`. Du selbst liest keine Programme und vergibst keine Werte. Maßgeblich sind `daten/README.md` („Ablauf für ein neues Thema“, „Erfassen“, „Bewertungsmaßstab“, „Instrumente“) und `docs/methode.md`.

Arbeitsdateien liegen in `.cache/entwurf/<ID>/` (nicht im Repository – dort stehen Programmtexte).

## 0. Freigabe prüfen

```bash
git fetch origin main
npm run ursachen:freigegeben -- <ID>
```

Schlägt das fehl: **abbrechen**. Die Ursachen sind noch nicht freigegeben (erst `/thema-anlegen`, dann Merge durch die Betreiberin) oder wurden verändert. Ursachen werden beim Erfassen nicht ergänzt oder umformuliert. Fällt beim Erfassen auf, dass eine Ursache fehlt, halte es im Pull Request fest – die Entscheidung trifft die Betreiberin.

## 1. Programme und Suchbegriffe festlegen

- **Programme:** alle Bundesprogramme (`daten/parteien.json`); hat das Thema Ursachen mit `ebene: land`, zusätzlich alle aktuellen Landesprogramme (Liste: `npm run -s programme:suche -- x --zaehlen`). Mit `--bund` nur Bund, mit `--land XX` nur diese Länder. Programme, zu denen schon ein Abdeckungseintrag besteht, auslassen (die ergänzt man von Hand).
- **Suchbegriffe:** je Ursache Begriffe samt Synonymen, **bevor** ein Agent startet – als eine Liste für alle Programme. Wortteile genügen („sozialarbeit“ findet „Schulsozialarbeit“). Begriffe aus der Sprache aller politischen Richtungen (etwa „Zuwanderung“, „Migration“, „Einwanderung“, „Asyl“). Die Liste kommt später in die Dokumentation.

## 2. Erfassen (Phase B)

Starte je Programm einen Agenten `programm-erfassung`, bis zu sieben gleichzeitig. Jeder bekommt dasselbe: Thema mit Ziel, Ursachen (ID, Beschreibung, Ebene), die Suchbegriffe – dazu seine Partei (ID, Kurzname), Ebene (Bund oder Land XX), URL und Stand des Programms.

Prüfe jede Antwort:
- `nicht_durchsucht` → Programm **weglassen** (bleibt „noch nicht erfasst“), im Pull Request nennen. Nie in `keine_massnahme` umwandeln.
- Unplausibel (Zitat passt nicht zur Beschreibung, Ursache falsch, Landesmaßnahme zu Bundesursache, allgemeines Ziel statt Maßnahme) → Agent mit konkreter Rückfrage erneut beauftragen.
- Maßnahmenbeschreibungen einheitlich knapp und ohne Parteinamen.

Schreibe das Ergebnis nach `.cache/entwurf/<ID>/erfassung.json` (Format: `Erfassung` in `scripts/entwurf.ts`):

```json
{ "thema_id": 17, "suchbegriffe": ["…"], "programme": [ { "partei_id": 11, "land": null, "massnahmen": [ { "beschreibung": "…", "ursachen_ids": [1701], "zitat": "…", "seite": 12 } ] } ] }
```

Zitate gleich prüfen lässt sich erst nach dem Eintragen (Schritt 4); grobe Fehler fängt aber schon `npm run entwurf:blind` ab.

## 3. Bewerten ohne Parteinamen (Phase C)

```bash
npm run -s entwurf:blind -- .cache/entwurf/<ID>/erfassung.json > .cache/entwurf/<ID>/blind.json
```

Starte **einen** Agenten `blind-bewertung` und gib ihm **nur** den Inhalt von `blind.json` und das heutige Datum – keine Parteinamen, keine Hinweise auf die Herkunft, nichts aus der Erfassung. Speichere seine JSON-Antwort als `.cache/entwurf/<ID>/bewertung.json`.

Prüfe die Antwort auf Methode, nicht auf Ergebnis: gleiche Lösungswege im selben Instrument, vorhandene Instrumente wiederverwendet, ein Instrument je Ebene, Wirksamkeit 3 nur mit `belegt`, neutrale Begründungen. Bei Mängeln den Agenten erneut beauftragen (wieder nur mit `blind.json` und deiner Rückfrage). Werte änderst du nicht selbst.

## 4. Eintragen und prüfen (Phase D)

```bash
npm run entwurf:eintragen -- .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
npm run daten:pruefen
npm run zitate:pruefen -- --thema <ID>
npm run punkte -- <ID>
npm run seed
npm test
```

- `entwurf:eintragen` vergibt die IDs, setzt `ki_entwurf: true`, `geprueft: false` und baut die Beleg-Links mit `#page=N`. Es schreibt nur, wenn der Katalog danach gültig ist.
- Meldet `zitate:pruefen` ein Zitat auf einer anderen Seite oder gar nicht: in der Themendatei korrigieren (Seite) oder den zuständigen Agenten die Stelle neu zitieren lassen. Zitate nie „passend machen“, ohne die Seite zu lesen.
- `punkte`: auf Auffälligkeiten achten (eine Partei überall 0, obwohl das Programm viel zum Thema hat? Dann die Erfassung dieses Programms prüfen lassen). Werte nicht nachträglich anpassen, um ein Ergebnis zu verändern.

## 5. Dokumentieren und Pull Request

- `docs/perspektiven-ursachen.md`, Abschnitt des Themas: Absatz **„Erfassung“** mit Datum, „KI-Entwurf, nach dem Festlegen der Ursachen“, erfasste Programme, Suchbegriffe, Ergebnis (Zahl der Maßnahmen und Instrumente mit ID-Bereich), welche Parteien zu welchen Ursachen nichts haben, nicht durchsuchte Programme und „Nicht erfasst wurden: …“ mit Gründen (aus den Protokollen der Agenten).
- `daten/README.md`: Hinweis „Echte Daten, im Aufbau“ oben aktualisieren (Themen, Zahl der Instrumente).
- Commit und Pull Request („<Thema>: Maßnahmen aus N Programmen (KI-Entwurf)“). In der Beschreibung: Übersicht je Partei (Zahl der Maßnahmen oder „keine Maßnahme“), Ausgabe von `npm run punkte`, offene Fragen und schwierige Einstufungen aus der Bewertung, nicht durchsuchte Programme. Hinweis: Die Werte sind Entwürfe; es folgen die Bewertung durch eingeladene Prüfende und die Belegprüfung (`npm run pruefliste -- <ID>`).
