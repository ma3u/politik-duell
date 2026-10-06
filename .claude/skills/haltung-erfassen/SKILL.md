---
name: haltung-erfassen
description: Phase B für eine oder viele Haltungen des Politik-Duells in einem Lauf – je Bundesprogramm ein Agent für alle Haltungen (Zitat und Seite je Frage), dann ein Agent, der ohne Parteinamen einordnet (ja/nein/teils/keine Aussage) und die Kurzfassungen schreibt; Eintragen als ungeprüfter KI-Entwurf. Aufruf mit Haltungs-IDs nach /haltung-anlegen, z. B. /haltung-erfassen 4 oder /haltung-erfassen 4-20.
argument-hint: <Haltungs-ID> [<Haltungs-ID> …] | <von>-<bis>
disable-model-invocation: true
---

# Haltung erfassen (Phase B: Positionen)

Aufruf: **$ARGUMENTS** (Bereiche wie `4-20` als einzelne IDs schreiben).

Du bist Koordination: Programme lesen nur die Agenten `haltung-erfassung`, einordnen nur der Agent `haltung-einordnung` (ohne Parteinamen). Du liest keine Programme und änderst keine Einordnung. Ergebnis: KI-Entwurf für die Testphase. Alle Haltungen laufen **gemeinsam**: sieben Erfassungs-Agenten und ein Einordnungs-Agent, gleich wie viele Haltungen. Bei mehr als 15 Haltungen in Läufen zu höchstens 15 (sonst werden die Aufträge zu lang).

## 0. Voraussetzung

Jede Haltung hat `freigabe`, `suchbegriffe` und `einordnung`, und Phase A ist committet (`git status --short daten/haltungen/` zeigt die Dateien nicht). Sonst erst `/haltung-anlegen`.

## 1. Aufträge

```bash
npm run -s haltung:auftrag '--' <ID> <ID> …
```

Je Bundesprogramm eine Textdatei und ein Auftrag mit allen Haltungen (`.cache/haltung/lauf/`). `NICHT GELADEN` → lokale Kopie erfragen und `'--lokal' <ordner>` (auch bei `haltung:programm-pruefen`); ohne Kopie bleiben die Haltungen unvollständig – nicht eintragen.

## 2. Fundstellen

Je Auftrag ein Agent `haltung-erfassung` (alle sieben gleichzeitig, mit der nächstkleineren Modellstufe deiner Familie), Auftrag nur:

> Erledige den Auftrag `.cache/haltung/lauf/auftraege/<Name>.md` nach `.claude/agents/haltung-erfassung.md`.

Der Agent prüft seine Zitate selbst und speichert je Haltung `.cache/haltung/<ID>/funde/<Name>.json`. Kommt kein „In Ordnung“, denselben Agenten (SendMessage) die Fehler beheben lassen.

## 3. Einordnen ohne Parteinamen

```bash
npm run -s haltung:blind '--' <ID> <ID> …
```

„Rest: …“ heißt: ein Name im Zitat wurde nicht ersetzt – im Pull Request nennen. Dann **ein** Agent `haltung-einordnung` mit deinem eigenen Modell und genau dem Auftragssatz aus der Ausgabe. Er prüft jede Antwort selbst (`haltung:antwort-pruefen`).

## 4. Eintragen

```bash
npm run -s haltung:eintragen '--' <ID> <ID> …
npm run daten:pruefen
npm run -s zitate:pruefen
npm run seed
npm test
```

Haltungen mit weniger als drei erkennbaren Positionen trägt das Skript nicht ein (Meldung, die übrigen laufen weiter). Sie bleiben als Phase A liegen und werden in `docs/haltungen.md` als „zurückgestellt“ vermerkt – kein `--trotzdem` ohne Entscheidung der Betreiberin.

## 5. Abschluss

In `docs/haltungen.md` je Haltung eine Ergebniszeile (Position und Seite je Partei, „KI-Entwurf, Einordnung ohne Parteinamen, <Datum>“). Commit „Haltungen: Positionen aus sieben Bundesprogrammen (KI-Entwurf)“ mit Haltungsdateien, `supabase/seed.sql`, `supabase/seed-teile/`, `daten/protokolle/haltung-<ID>/`, `docs/haltungen.md`. Pull Request mit der Ergebnistabelle und den zurückgestellten Haltungen.
