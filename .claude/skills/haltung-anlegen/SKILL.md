---
name: haltung-anlegen
description: Phase A für eine oder mehrere Haltungen (Wertfragen) des Politik-Duells – neutrale Ja/Nein-Frage, Beschreibung, verwandte Themen, Zielkonflikte mit unabhängigen Quellen, Maßstab der Einordnung und Suchbegriffe, ohne Blick in Wahlprogramme. Endet mit KI-Freigabe (Testphase) und eigenem Commit; mit --erfassen geht es direkt mit /haltung-erfassen weiter. Aufruf z. B. /haltung-anlegen Wehrpflicht oder /haltung-anlegen Wehrpflicht; Schuldenbremse --erfassen.
argument-hint: <Wertfrage oder Stichwort>[; …] [--erfassen]
disable-model-invocation: true
---

# Haltung anlegen (Phase A)

Aufruf: **$ARGUMENTS**

Eine **Haltung** ist eine Wertfrage, über die vernünftige Menschen verschieden urteilen; die Haltungskarte zeigt ohne Punkte, wo die Parteien stehen. Regeln: `docs/plan-haltungen.md` → B1–B3, Format: `daten/README.md` → „haltungen/NN-name.json“. Diese Phase legt Frage und Maßstab fest, **bevor** jemand in Programme schaut, und endet mit KI-Freigabe für die Testphase.

**Als Erstes:** `npm run phase-a -- start "<Haltungen>"` (sperrt Programme, auch für Agenten). **Zum Schluss:** `npm run phase-a -- ende`.

## Schritte

1. **Aufnahme prüfen** (vorhandene Fragen: `daten/haltungen/*.json` → `frage`; Themen: `npm run -s themen:ueberblick`). Abbrechen mit einem Satz, wenn
   - es eine Tatsachenfrage ist oder ein Alltagsproblem mit Ursachen (→ `/thema-anlegen`),
   - die Frage Würde oder gleiche Rechte einer Gruppe zur Abstimmung stellt,
   - es die Frage schon gibt.
   Ob mindestens drei Programme eine Position haben, zeigt erst `/haltung-erfassen`.
2. **Frage und Beschreibung:** neutrale Ja/Nein-Frage („Soll …?“), so dass sich beide Seiten darin wiederfinden; keine wertenden Wörter, keine Partei. Beschreibung ein Satz, worum es geht, beide Möglichkeiten genannt.
3. **Zielkonflikte** selbst recherchieren (WebSearch, WebFetch; Quellenregeln wie bei Ursachen: unabhängig, im Original geöffnet, keine Partei-, Fraktions- oder Stiftungsseiten): zwei bis vier Sätze, mindestens einer je Seite, Muster „Wer …, nennt …“, je mit `quelle_url`. Sie beschreiben, welche Ziele gegeneinander stehen, und entscheiden nichts.
4. **Datei** `daten/haltungen/NN-name.json` (ID: `npm run -s daten:id -- --haltung`):
   - `frage`, `beschreibung`, `verwandte_themen` (passende Themen-IDs), `zielkonflikte`,
   - `einordnung`: `{ "ja": "…", "teils": "…", "nein": "…" }` – wann ein Programm wie eingeordnet wird, je ein Satz (Beispiel: `docs/haltungen.md` → „Einordnungsregel für die Zuwanderung“),
   - `suchbegriffe`: Wortteile für beide Seiten und übliche Fachwörter (für alle Programme gleich),
   - `schlagwoerter` (kleingeschrieben, für den Mock),
   - `freigabe`: `{ "datum": "<heute>", "art": "ki" }`.
5. **Dokumentieren:** in `docs/haltungen.md` ein kurzer Abschnitt `## <Nr> <Kurzname>` (Frage, Quellen der Zielkonflikte, Verworfenes, „KI-Freigabe <Datum>“).
6. **Prüfen:** `npm run daten:pruefen && npm test`.
7. **Abschließen:** `npm run phase-a -- ende`, **eigener Commit** nur mit Phase A („Haltung <Kurzname>: Frage und Zielkonflikte (KI-Freigabe)“) – er belegt, dass die Frage stand, bevor Positionen dazukamen.
8. **Weiter:** mit `--erfassen` `.claude/skills/haltung-erfassen/SKILL.md` lesen und für die neuen IDs folgen; sonst pushen und „Weiter mit `/haltung-erfassen <IDs>`“ melden.
