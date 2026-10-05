---
name: haltung-erfassen
description: Phase B für eine oder mehrere Haltungen des Politik-Duells – je Bundesprogramm sucht ein Agent die klarste Stelle zur Frage (Zitat und Seite), ein zweiter Agent ordnet ohne Parteinamen ein (ja/nein/teils/keine Aussage) und schreibt die Kurzfassung; Eintragen als ungeprüfter KI-Entwurf. Aufruf mit Haltungs-IDs nach /haltung-anlegen, z. B. /haltung-erfassen 4 oder /haltung-erfassen 4 5.
argument-hint: <Haltungs-ID> [<Haltungs-ID> …]
disable-model-invocation: true
---

# Haltung erfassen (Phase B: Positionen)

Aufruf: **$ARGUMENTS**

Du bist Koordination: Programme lesen nur die Agenten `haltung-erfassung`, einordnen nur der Agent `haltung-einordnung` (ohne Parteinamen). Du liest keine Programme und änderst keine Einordnung. Ergebnis: KI-Entwurf für die Testphase. Arbeitsordner `.cache/haltung/<ID>/`. Mehrere Haltungen: Schritte 1–2 für alle gleichzeitig, dann je Haltung 3–5.

## 0. Voraussetzung

Die Haltung hat `freigabe`, `suchbegriffe` und `einordnung`, und Phase A ist committet (`git status --short daten/haltungen/` zeigt die Datei nicht). Sonst erst `/haltung-anlegen`.

## 1. Aufträge

```bash
npm run -s haltung:auftrag '--' <ID>
```

Je Bundesprogramm Textdatei und Auftrag. `NICHT GELADEN` → lokale Kopie erfragen und `'--lokal' <ordner>` (auch bei `haltung:programm-pruefen`); ohne Kopie bleibt die Haltung unvollständig – nicht eintragen.

## 2. Fundstellen

Je Auftrag ein Agent `haltung-erfassung` (bis zu sieben gleichzeitig, alle mit der nächstkleineren Modellstufe deiner Familie), Auftrag nur:

> Erledige den Auftrag `.cache/haltung/<ID>/auftraege/<Name>.md` nach `.claude/agents/haltung-erfassung.md`.

Der Agent prüft sein Zitat selbst und speichert `funde/<Name>.json`. Fehlt die Datei, denselben Agenten (SendMessage) die Fehler beheben lassen.

## 3. Einordnen ohne Parteinamen

```bash
npm run -s haltung:blind '--' <ID>
```

„Rest: …“ heißt: ein Name im Zitat wurde nicht ersetzt – im Pull Request nennen. Dann **ein** Agent `haltung-einordnung` mit deinem eigenen Modell und genau dem Auftragssatz aus der Ausgabe. Er prüft seine Antwort selbst (`haltung:antwort-pruefen`).

## 4. Eintragen

```bash
npm run -s haltung:eintragen '--' <ID>
npm run daten:pruefen
npm run -s zitate:pruefen
npm run seed
npm test
```

Weniger als drei erkennbare Positionen: Das Skript trägt nichts ein. Dann die Haltung zurückstellen (Vermerk in `docs/haltungen.md`) – kein `--trotzdem` ohne Entscheidung der Betreiberin.

## 5. Abschluss

In `docs/haltungen.md` je Haltung eine Ergebniszeile (Position und Seite je Partei, „KI-Entwurf, Einordnung ohne Parteinamen, <Datum>“). Commit „Haltung <Kurzname>: Positionen aus sieben Bundesprogrammen (KI-Entwurf)“ mit Haltungsdatei, `supabase/seed.sql`, `daten/protokolle/haltung-<ID>/`, `docs/haltungen.md`. Pull Request mit der Ergebnistabelle.
