---
name: thema-anlegen
description: Phase A für ein neues Thema des Politik-Duells – Ziel, Ursachen mit unabhängigen Quellen, Ebene und Perspektivenprüfung festlegen, ohne in Wahlprogramme zu schauen. Endet mit einem Pull Request zur Freigabe durch die Betreiberin. Aufruf mit dem Thema, z. B. /thema-anlegen Kita-Betreuung.
argument-hint: <Thema> [Begründung, warum es aufgenommen wird]
disable-model-invocation: true
---

# Neues Thema anlegen (Phase A: Ursachen)

Thema: **$ARGUMENTS**

Diese Phase legt fest, *warum* das Problem besteht. Sie endet mit einem Pull Request und **stoppt dann**. Maßnahmen erfasst erst `/thema-erfassen`, nachdem die Betreiberin die Ursachen gemergt hat. Maßgeblich sind `daten/README.md` („Ablauf für ein neues Thema“, „Themenauswahl“, „Dateiformat“, „IDs“) und `docs/methode.md` („Ursachen“).

## Sperre: keine Wahlprogramme

In dieser Phase schaut **niemand** in Wahlprogramme – du nicht und kein Agent. Also kein `programme:suche`, `programm:text`, `zitate:pruefen`, kein Lesen von `.cache/`, keine Parteiseiten, keine Themendateien-Abschnitte `abdeckung`/`instrumente` anderer Themen als Vorlage für Ursachen. So kann niemand Ursachen passend zu einem Programm zuschneiden.

## Schritte

1. **Aufnahme begründen.** Prüfe gegen `daten/README.md` → „Themenauswahl“: Nennen Menschen das Problem selbst (Umfragen, Review-Warteschlange)? Überschneidet es sich mit einem vorhandenen Thema (`daten/themen/*.json`, nur `name`, `beschreibung`, `ziel`, `ursachen` lesen)? Ist es ein Alltagsproblem mit belegbaren Ursachen oder eine Wertfrage (dann nicht aufnehmen, siehe „Bewusst nicht als eigenes Thema aufgenommen“)? Fehlt eine Begründung im Aufruf, recherchiere Umfragebelege (WebSearch). Überschneidet es sich stark oder ist es eine Wertfrage: **abbrechen** und der Betreiberin erklären, warum.
2. **Recherche an den Agenten geben.** Starte den Agenten `ursachen-recherche` mit: Thema, Aufnahmegrund, Liste der vorhandenen Themen mit Zielen und Ursachen (damit er Überschneidungen vermeidet und angrenzende Themen abgrenzt), heutiges Datum. Er hat keinen Zugriff auf das Repository.
3. **Vorschlag prüfen**, bevor du ihn übernimmst:
   - Jede Ursache lösungsoffen? („zu wenige X“ ist oft schon eine Lösung – umformulieren.)
   - Jede Quelle unabhängig, im Original geöffnet, Aussage wörtlich belegt? Nicht geöffnete Quellen klar markieren.
   - Diagnosen aus unterschiedlichen Richtungen abgedeckt? Keine Diagnose ohne Beleg aufgenommen?
   - Ebene je Ursache plausibel begründet?
   - Grenzt sich das Thema von vorhandenen ab (was gehört woanders hin)?
   Bei Mängeln den Agenten mit konkreten Rückfragen erneut beauftragen.
4. **Themendatei anlegen:** `daten/themen/NN-name.json` mit der nächsten freien Themen-ID (höchste vorhandene + 1), Ursachen-IDs = Themen-ID × 100 + laufende Nummer. Nur `id`, `name`, `beschreibung`, `ziel`, `schlagwoerter`, `ursachen` – **keine** `instrumente`, keine `abdeckung` (das Thema gilt dann für alle als „noch nicht erfasst“). Format wie die vorhandenen Dateien (Listen einfacher Werte in einer Zeile).
5. **Dokumentieren:**
   - `docs/perspektiven-ursachen.md`: neuer Abschnitt `## <Thema> (<ID>)` mit „Stand: <Datum> · KI-Entwurf, noch nicht von der Betreiberin freigegeben“, Ziel, Tabelle, Erläuterungen, „Entschieden:“, „Verworfen:“. Unter „Hinweise zur Quellenprüfung“ die wörtlichen Zitate und Zahlen je Ursache.
   - `daten/README.md` → „Themenauswahl“: das Thema mit Aufnahmegrund und Beleg eintragen (aus „Kandidaten für später“ streichen, falls es dort steht).
   - `docs/methode.md` → „Themen“: die Aufzählung der Themen ergänzen.
6. **Prüfen:** `npm run seed` (die Datenbankdatei muss zum Katalog passen), dann `npm run daten:pruefen` und `npm test`. Alles muss grün sein.
7. **Commit und Pull Request:** eigener Pull Request nur mit Ursachen („Neues Thema <Name>: Ursachen und Perspektivenprüfung“). In der Beschreibung: Aufnahmegrund, Tabelle der Ursachen mit Ebene und Quelle, Verworfenes, und die Bitte an die Betreiberin, die Quellen im Original zu bestätigen. Hinweis: Nach dem Merge geht es mit `/thema-erfassen <ID>` weiter.

**Dann stoppen.** Nicht mit der Erfassung beginnen, auch wenn es naheliegt.
