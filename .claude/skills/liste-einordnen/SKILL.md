---
name: liste-einordnen
description: Ordnet eine Liste von Äußerungen, Haltungen oder Forderungen (etwa aus Umfragen, Interviews, Kommentaren) für das Politik-Duell ein – je Zeile Haltung, Forderung zu einem Thema, neues Thema, Grenze, Pauschalurteil, Tatsachenbehauptung, Aussage über Parteien oder doppelt –, schlägt neutrale Fragen bzw. Forderungen vor und schreibt eine Tabelle zum Bestätigen. Mit --ausfuehren arbeitet es die bestätigten Zeilen mit /haltung-anlegen, /haltung-erfassen, /thema-anlegen, /thema-erfassen und /forderung-erfassen ab. Aufruf z. B. /liste-einordnen liste.txt oder /liste-einordnen .cache/listen/2026-10-05-umfrage.md --ausfuehren.
argument-hint: <Datei oder eingefügte Liste> [--direkt] | <.cache/listen/….md> --ausfuehren
disable-model-invocation: true
---

# Liste einordnen

Aufruf: **$ARGUMENTS**

Listen aus Umfragen oder Gesprächen mischen Wertfragen, Forderungen, Alltagsprobleme, Behauptungen und Abwertungen. Nur ein Teil davon gehört in den Katalog. Dieser Skill sortiert, **bevor** etwas angelegt wird, und verteilt dann an die anderen Skills. Maßstab: `CLAUDE.md` → „Spielablauf“ (Typen `problem`, `forderung`, `wert`, `grenze`), `docs/methode.md` → „Grenze“, `docs/plan-haltungen.md` → B1 (Aufnahmekriterien).

## A. Einordnen (ohne `--ausfuehren`)

1. `npm run phase-a -- start "Liste"` – die Einordnung prägt Fragen und Forderungen, deshalb ohne Blick in Programme.
2. Kontext holen: `npm run -s themen:ueberblick` (Themen mit Ursachen) und die Fragen der vorhandenen Haltungen (`daten/haltungen/*.json` → `id`, `frage`).
3. **Jede Zeile einordnen** (eine Art je Zeile; im Zweifel die vorsichtigere):

   | Art | Wann | Vorschlag | Ziel |
   | --- | --- | --- | --- |
   | `haltung` | Wertfrage, über die man verschieden urteilen kann, mit Bezug zu Programmen (Energie, Verteidigung, Steuern, EU …) | neutrale Ja/Nein-Frage mit „?“, ohne Partei und ohne wertende Wörter | `neu`, oder `H<ID>`, wenn eine vorhandene Haltung sie schon abdeckt |
   | `forderung` | konkreter Lösungsweg für ein vorhandenes Thema („Polizei stärken“, „Steuern senken“) | die Forderung neutral in wenigen Wörtern | `T<ID>` |
   | `thema` | Alltagsproblem („Infrastruktur auf dem Land fehlt“) | Name des Themas | `neu`, oder `T<ID>`, wenn es schon abgedeckt ist |
   | `grenze` | spricht einer Gruppe Würde oder gleiche Rechte ab, ruft zu Gewalt auf, beleidigt, relativiert NS-Verbrechen, antisemitische Behauptungen | kurzer Grund | `–` |
   | `pauschal` | Pauschalurteil über eine Gruppe („Ausländer wollen nicht arbeiten“) | kurzer Grund | `–` |
   | `tatsache` | Tatsachenbehauptung („Klimawandel ist nicht menschengemacht“, „Wahlen wurden manipuliert“) | kurzer Grund | `–` |
   | `meta` | Aussage über Parteien, Wählerinnen, Medien oder die eigene Stimmung, ohne Sachfrage | kurzer Grund | `–` |
   | `doppelt` | gleiche Sache wie eine frühere Zeile | – | `#<Nr>` |

   Regeln:
   - Eine Zeile mit Sachkern **und** Abwertung („Ausländer raus“) ist `grenze` – keine Umdeutung in eine zulässige Frage. Steckt in einer anderen Zeile eine zulässige Sachfrage (Asylrecht verschärfen), wird sie dort aufgenommen.
   - Eine Frage, die über gleiche Rechte einer Gruppe abstimmen ließe (Ausbürgerung wegen Herkunft, Vorrang nach Staatsangehörigkeit im Gesundheitswesen), ist `grenze`. Eine Frage über Regeln, die für alle gleich gelten (Geburtsortsprinzip, Doppelpass, Wartezeit für Sozialleistungen), kann `haltung` sein.
   - `haltung` nur, wenn absehbar mehrere Programme dazu Stellung nehmen – sicher prüft das erst `/haltung-erfassen` (mindestens drei).
   - Gleiche Sache in mehreren Zeilen: erste Zeile mit Vorschlag, die übrigen `doppelt`. Ähnliche Haltungen zu einer Frage zusammenlegen.
   - Vorschläge nennen keine Partei und übernehmen keine wertenden Wörter aus der Zeile.
4. **Tabelle schreiben** (mit Write): `.cache/listen/<Datum>-<kurzname>.md` – **nicht ins Repository**, denn die Liste enthält Äußerungen im Wortlaut, auch abwertende. Ein Satz zur Herkunft der Liste, darunter `| Nr | Eintrag | Art | Vorschlag | Ziel | OK |` – Eintrag wörtlich (ein „|“ im Text als „/“), OK überall `[ ]`. Mit `--direkt` setzt du OK bei allen Zeilen auf `[x]`.
5. `npm run phase-a -- ende` (erst danach ist `.cache/` wieder lesbar), dann `npm run -s liste:auswahl -- <datei>` – muss ohne Fehler durchlaufen.
6. Mit `--direkt` weiter mit B. Sonst **stoppen** und im Chat je Art die Zeilen mit Nr und Vorschlag zeigen (Grenze, Pauschal, Tatsache, Meta nur mit Nr und Grund, nicht im Wortlaut). Die Betreiberin antwortet mit den Nummern, die angelegt werden sollen („alle“, „alle außer 12, 40“), oder mit Änderungen; du setzt die Kästchen und Änderungen in der Tabelle, prüfst erneut mit `liste:auswahl` und machst mit B weiter. Die Tabelle liegt nur im Container – geht er verloren, beginnt es bei A.

## B. Abarbeiten (`--ausfuehren`)

`npm run -s liste:auswahl -- <datei>` prüft die Tabelle und zählt die bestätigten Aufträge. Dann in dieser Reihenfolge, jeweils nach dem genannten Skill (lies dessen `SKILL.md` und folge ihm), im selben Zweig mit eigenen Commits:

1. **Haltungen:** `/haltung-anlegen --liste <datei>` (Vorschläge aus `liste:auswahl -- <datei> --art haltung`), danach `/haltung-erfassen` für alle neuen IDs in einem Lauf (höchstens 15 je Lauf).
2. **Neue Themen:** `/thema-anlegen` mit allen Namen aus `--art thema` (durch „;“ getrennt), danach `/thema-erfassen` für die neuen IDs.
3. **Forderungen:** je Zeile von `--art forderung` (Thema und Forderungen) ein `/forderung-erfassen`-Durchgang; ein Durchgang je Thema mit allen seinen Forderungen.
4. **Prompt-Evaluation:** `npm run -s liste:auswahl -- <datei> --evaluation` liefert je bestätigter Zeile Art und erwartete Antwort. In `docs/prompt-evaluation.md` kommt ein Abschnitt (Datum, Art der Quelle ohne Namen) mit diesen Zeilen, aber die Äußerung **umschrieben**: der Kern in eigenen, sachlichen Worten, so dass die Einordnung erkennbar bleibt – keine Parolen, Beleidigungen, Symbole oder antisemitischen Behauptungen im Wortlaut, keine Namen von Personen („Abwertung einer Gruppe wegen ihrer Herkunft mit Ausweisungsforderung“ statt der Parole). Kommt die Liste überwiegend aus einem politischen Lager, das dort vermerken – die Evaluation braucht Äußerungen aus allen Lagern.

Ein Pull Request am Ende mit der Zählung je Art und je Block den Ergebnissen. Wird der Kontext zu lang, nach einem abgeschlossenen Block committen, pushen und melden, mit welchem Block es weitergeht (der Stand ergibt sich aus Dateien und Commits).
