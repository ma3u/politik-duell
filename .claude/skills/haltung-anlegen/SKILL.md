---
name: haltung-anlegen
description: Phase A für eine oder viele Haltungen (Wertfragen) des Politik-Duells – je Haltung ein Agent haltung-recherche (parallel) für neutrale Ja/Nein-Frage, Beschreibung, Zielkonflikte mit unabhängigen Quellen, Maßstab der Einordnung und Suchbegriffe, ohne Blick in Wahlprogramme. Endet mit KI-Freigabe (Testphase) und eigenem Commit; mit --erfassen geht es direkt mit /haltung-erfassen weiter. Aufruf z. B. /haltung-anlegen Wehrpflicht; Schuldenbremse --erfassen oder mit einer Auswahl aus /liste-einordnen.
argument-hint: <Wertfrage oder Stichwort>[; …] | --liste <.cache/listen/…md> [--erfassen]
disable-model-invocation: true
---

# Haltung anlegen (Phase A)

Aufruf: **$ARGUMENTS**

Eine **Haltung** ist eine Wertfrage, über die vernünftige Menschen verschieden urteilen; die Haltungskarte zeigt ohne Punkte, wo die Parteien stehen. Regeln: `docs/plan-haltungen.md` → B1–B3, Format: `daten/README.md` → „haltungen/NN-name.json“. Diese Phase legt Frage und Maßstab fest, **bevor** jemand in Programme schaut, und endet mit KI-Freigabe für die Testphase.

**Eingabe:** einzelne Stichwörter durch „;“ getrennt, oder mit `--liste <datei>` die bestätigten Zeilen einer Einordnungstabelle: `npm run -s liste:auswahl -- <datei> --art haltung` (Vorschlag für die Frage steht in der Tabelle). **Vor** `phase-a start` ausführen – während der Sperre ist `.cache/` nicht lesbar.

**Als Erstes:** `npm run phase-a -- start "Haltungen"` (sperrt Programme, auch für Agenten). **Zum Schluss:** `npm run phase-a -- ende`.

## Schritte

1. **Aufnahme prüfen** – nur bei Stichwörtern ohne Tabelle (die Tabelle ist schon geprüft): vorhandene Fragen in `daten/haltungen/*.json` → `frage`, Themen mit `npm run -s themen:ueberblick`. Nicht aufnehmen (ein Satz Grund): Tatsachenfrage, Alltagsproblem (→ `/thema-anlegen`), Forderung zu einem Thema (→ `/forderung-erfassen`), Frage über Würde oder gleiche Rechte einer Gruppe, schon vorhanden. Ob drei Programme eine Position haben, zeigt erst `/haltung-erfassen`.
2. **Recherche:** je Haltung ein Agent `haltung-recherche`, bis zu zehn gleichzeitig. Auftrag: Stichwort bzw. vorgeschlagene Frage, die Liste der vorhandenen Fragen (damit nichts doppelt wird), Datum. Der Agent gibt JSON zurück; bei `"abbruch"` die Haltung auslassen und den Grund notieren.
3. **Form prüfen** (keine eigene Nachrecherche): Frage endet mit „?“, ohne Partei und wertende Wörter; zwei bis vier Zielkonflikte, je Seite mindestens einer, jeder mit https-Quelle; `einordnung` mit allen drei Werten; 4–10 spezifische Suchbegriffe. Bei Mängeln **eine** Rückfrage an denselben Agenten (SendMessage), danach auslassen, was nicht passt.
4. **Dateien** `daten/haltungen/NN-name.json`, IDs fortlaufend ab `npm run -s daten:id -- --haltung`: `id`, `frage`, `beschreibung`, `verwandte_themen` (passende Themen-IDs – du wählst sie aus `themen:ueberblick`), `zielkonflikte`, `einordnung`, `suchbegriffe`, `schlagwoerter`, `freigabe: { "datum": "<heute>", "art": "ki" }`. Format wie `01-tempolimit.json`.
5. **Dokumentieren:** in `docs/haltungen.md` unter „Weitere Haltungen (KI-Entwurf)“ je Haltung eine Tabellenzeile: Nr., Frage, Quellen der Zielkonflikte, „KI-Freigabe <Datum>“. Ausgelassenes mit Grund darunter.
6. **Prüfen:** `npm run daten:pruefen && npm test`.
7. **Abschließen:** `npm run phase-a -- ende`, **eigener Commit** nur mit Phase A („Haltungen: Fragen und Zielkonflikte (KI-Freigabe)“) – er belegt, dass die Fragen standen, bevor Positionen dazukamen.
8. **Weiter:** mit `--erfassen` `.claude/skills/haltung-erfassen/SKILL.md` lesen und für alle neuen IDs in **einem** Lauf folgen; sonst pushen und „Weiter mit `/haltung-erfassen <IDs>`“ melden.
