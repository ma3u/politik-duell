---
name: thema-anlegen
description: Phase A für ein neues Thema des Politik-Duells – Ziel, Ursachen mit unabhängigen Quellen, Ebene und Perspektivenprüfung festlegen, ohne in Wahlprogramme zu schauen. Endet mit einem Pull Request zur Freigabe durch die Betreiberin. Aufruf mit dem Thema, z. B. /thema-anlegen Kita-Betreuung.
argument-hint: <Thema> [Begründung, warum es aufgenommen wird] | <Thema> --neu <ID> (Neuanlage eines vorhandenen Themas)
disable-model-invocation: true
---

# Neues Thema anlegen (Phase A: Ursachen)

Thema: **$ARGUMENTS**

Diese Phase legt fest, *warum* das Problem besteht. Sie endet mit einem Pull Request und **stoppt dann**. Maßnahmen erfasst erst `/thema-erfassen`, nachdem die Betreiberin die Ursachen gemergt hat. Maßgeblich sind `daten/README.md` („Ablauf für ein neues Thema“, „Themenauswahl“, „Dateiformat“, „IDs“) und `docs/methode.md` („Ursachen“).

## Sperre: keine Wahlprogramme

In dieser Phase schaut **niemand** in Wahlprogramme – du nicht und kein Agent. Also kein `programme:suche`, `programm:text`, `zitate:pruefen`, kein Lesen von `.cache/`, keine Parteiseiten, keine Themendateien-Abschnitte `abdeckung`/`instrumente` anderer Themen als Vorlage für Ursachen. So kann niemand Ursachen passend zu einem Programm zuschneiden.

**Als Erstes:** `npm run phase-a -- start "<Thema>"`. Dann sperrt ein Hook (`.claude/hooks/sperre.mjs`) Lesezugriffe auf `.cache/` und alle Werkzeuge, die Programme lesen – auch für Agenten. WebFetch auf Partei-, Fraktions- und Stiftungsserver und dieses Repository ist immer gesperrt. Vorhandene Themen liest du nur über `npm run themen:ueberblick` (Name, Beschreibung, Ziel, Ursachen). **Zum Schluss** (vor dem Pull Request): `npm run phase-a -- ende`.

Erlaubt ist `npm run -s quelle:text -- <url> [--seiten N] [--suche "Wort"]`: Es liest ein **unabhängiges** PDF (Studie, Statistik, Gutachten), das WebFetch nicht lesen kann, und verweigert Adressen auf den Servern der Wahlprogramme.

## Schritte

1. **Aufnahme begründen.** Prüfe gegen `daten/README.md` → „Themenauswahl“: Nennen Menschen das Problem selbst (Umfragen, Review-Warteschlange)? Überschneidet es sich mit einem vorhandenen Thema (`npm run themen:ueberblick`)? Ist es ein Alltagsproblem mit belegbaren Ursachen oder eine Wertfrage (dann nicht aufnehmen, siehe „Bewusst nicht als eigenes Thema aufgenommen“)? Fehlt eine Begründung im Aufruf, recherchiere Umfragebelege (WebSearch). Überschneidet es sich stark oder ist es eine Wertfrage: **abbrechen** und der Betreiberin erklären, warum. Fehlt nur der Umfragebeleg, wünscht die Betreiberin das Thema aber ausdrücklich: aufnehmen und das offen als Aufnahmegrund nennen („auf Wunsch der Betreiberin“, dazu die vorhandenen Belege für das Erleben der Betroffenen).
2. **Recherche an den Agenten geben.** Starte den Agenten `ursachen-recherche` mit: Thema, Aufnahmegrund, Liste der vorhandenen Themen mit Zielen und Ursachen (damit er Überschneidungen vermeidet und angrenzende Themen abgrenzt), heutiges Datum. Er hat keinen Zugriff auf das Repository.
3. **Vorschlag prüfen**, bevor du ihn übernimmst:
   - Jede Ursache lösungsoffen? („zu wenige X“ ist oft schon eine Lösung – umformulieren.) Das **Ziel** ebenso: Es ist der Maßstab für die Wirksamkeit und darf keinen Lösungsweg vorgeben.
   - Belegstufe je Ursache (`docs/methode.md` → „Belegstufen“): A amtliche Messung, B repräsentative Befragung oder begutachtete Studie – je allein ausreichend; C Einschätzung, Prognose, Verbandsangabe – nur mit zweiter Quelle aus A oder B. Gleicher Maßstab für Verworfenes.
   - Quellenart: Stiftungen, Thinktanks, Verbände, Ministerien nur für eigene Daten und dann mit zweiter Quelle; interessennahe Institute mit Angabe der Ausrichtung; Parteien, Fraktionen und parteinahe Stiftungen nie.
   - Spalte „Diagnose aus der Debatte“: je Ursache die **Lösungsrichtungen** einzeln, durch „;“ getrennt – aus ihnen werden beim Erfassen die Suchbegriffe je Richtung.
   - Jede Quelle unabhängig, im Original geöffnet, Aussage wörtlich belegt? Nicht geöffnete Quellen klar markieren.
   - Diagnosen aus unterschiedlichen Richtungen abgedeckt? Keine Diagnose ohne Beleg aufgenommen?
   - Ebene je Ursache plausibel begründet?
   - Grenzt sich das Thema von vorhandenen ab (was gehört woanders hin)?
   Bei Mängeln den Agenten mit konkreten Rückfragen erneut beauftragen.

   **Nicht gelesene Quellen selbst nachlesen.** Konnte der Agent ein PDF nicht öffnen (Studie, Bericht), lies es mit `npm run -s quelle:text -- <url> --suche "<Stichwort>"` und notiere Zitat und PDF-Seite. Hängt eine Diagnose davon ab (etwa „Kosten belasten Familien“), entscheide sie jetzt: belegt → Ursache aufnehmen; nicht belegt → verwerfen. „Offen“ bleibt eine Diagnose nur, wenn die Quelle auch so nicht lesbar ist (Fehlermeldung nennen) – dann wird sie eine Entscheidung für die Betreiberin (Schritt 7).
4. **Themendatei anlegen:** `daten/themen/NN-name.json` mit der nächsten freien Themen-ID (höchste vorhandene + 1), Ursachen-IDs = Themen-ID × 100 + laufende Nummer. Nur `id`, `name`, `beschreibung`, `ziel`, `schlagwoerter`, `ursachen` – **keine** `freigabe` (trägt die Betreiberin ein), keine `instrumente`, keine `abdeckung` (das Thema gilt dann für alle als „noch nicht erfasst“). Format wie die vorhandenen Dateien (Listen einfacher Werte in einer Zeile).
5. **Dokumentieren:**
   - `docs/perspektiven-ursachen.md`: neuer Abschnitt `## <Thema> (<ID>)` mit „Stand: <Datum> · KI-Entwurf, noch nicht von der Betreiberin freigegeben“, Ziel, Tabelle, Erläuterungen, „Entschieden:“, „Verworfen:“. Unter „Hinweise zur Quellenprüfung“ die wörtlichen Zitate und Zahlen je Ursache.
   - **Erfassungsleitfaden** `daten/leitfaeden/<ID>.json` (Format: `Leitfaden` in `scripts/entwurf.ts`, Beispiel `daten/leitfaeden/18.json`): je Ursache Regeln, was dazugehört und was nicht, aus Tabelle, Erläuterungen und „Abgrenzung“ – Grenzfälle, die die Methode nicht entscheidet, als „nur als `ursachen_offen`“. Für breite Lösungsrichtungen mit vielen gleichartigen Einzelzusagen (etwa „Erwärmung begrenzen“) eine Bündelliste neutral benannter Instrumente, die alle Richtungen abdeckt. Keine Parteinamen. Er entsteht hier, weil hier niemand Programme kennt; beim Erfassen gilt er für alle Programme gleich.
   - `daten/README.md` → „Themenauswahl“: das Thema mit Aufnahmegrund und Beleg eintragen (aus „Kandidaten für später“ streichen, falls es dort steht).
   - `docs/methode.md` → „Themen“: die Aufzählung der Themen ergänzen.
   - `daten/README.md`, Hinweis „Echte Daten, im Aufbau“ oben: Zahl der Themen anpassen, das neue Thema in einem **eigenen Satz** am Ende des Absatzes nennen, nichts in vorhandene Klammern schieben. Muster: „<Thema> hat bisher nur Ursachen; Maßnahmen folgen.“
6. **Prüfen:** `npm run seed` (die Datenbankdatei muss zum Katalog passen), dann `npm run daten:pruefen` und `npm test`. Alles muss grün sein.
7. **Commit und Pull Request:** eigener Pull Request nur mit Ursachen („Neues Thema <Name>: Ursachen und Perspektivenprüfung“). Schreibe die Beschreibung **zuerst** nach `.cache/entwurf/<ID>/pr.md` (`.cache/` ist nach `npm run phase-a -- ende` wieder frei) und nutze die Vorlage `.github/pull_request_template.md` als Gliederung, mit der Ja/Nein-Checkliste für die Freigabe (Punkte zu Maßnahmen als „entfällt“ markieren). Aktualisiere `pr.md` und die Beschreibung **bei jedem Push**. Inhalt:
   - Aufnahmegrund, Tabelle der Ursachen mit Ebene und Quelle (als Link), Verworfenes, Perspektivenprüfung.
   - **„Entscheidungen für die Betreiberin“** in einfacher Sprache, je Punkt drei Teile: *Was* ist zu entscheiden, *warum* vor der Erfassung, *was konkret tun* („Öffne <Link>, suche <Stichwort> auf S. N. Steht dort …: Ursache aufnehmen, sonst: so lassen.“). Immer dabei: die Quellen im Original bestätigen (Link und erwartete Zahl je Ursache) und die Ebene je Ursache („Land, weil …“ – „passt“ oder „gehört auf Bund“).
   - Belegstufe (A/B/C) und Quellenart je Ursache.
   - Den Leitfaden mit Regeln und Bündeln als Entscheidung für die Betreiberin („passt“ oder ändern).
   - Hinweis: Freigegeben ist das Thema erst, wenn die Betreiberin in der Themendatei `"freigabe": { "datum": "JJJJ-MM-TT", "quellen_bestaetigt": [<IDs>] }` einträgt (nur Ursachen, deren Quellen sie im Original bestätigt hat). Danach geht es mit `/thema-erfassen <ID>` weiter; `ursachen:freigegeben` verlangt die Freigabe.

   Lege dann den Pull Request mit dieser Beschreibung an. Gibt es für den Zweig schon einen Pull Request (etwa von Hand angelegt), ersetze dessen Beschreibung. Geht beides nicht, gib den Inhalt von `pr.md` am Ende vollständig aus, damit die Betreiberin ihn einfügen kann. Ein Pull Request mit leerer Vorlage ist nicht fertig.

**Dann stoppen.** Nicht mit der Erfassung beginnen, auch wenn es naheliegt.

## Neuanlage eines vorhandenen Themas (`--neu <ID>`)

Für Themen, deren Ursachen nach der Regel „Nachträgliche Ursachen“ (`docs/methode.md`) neu geprüft werden und die noch keine geprüften Einträge haben. Es gilt alles oben, mit diesen Abweichungen:

- **Voraussetzung:** Die Themendatei hat keine `instrumente` und keine `abdeckung` mehr (Maßnahmen vorher in einem eigenen Pull Request stillgelegt, IDs in `daten/ids.json`). Sonst **abbrechen** und das der Betreiberin sagen.
- **Schritt 1 (Aufnahme)** entfällt; Aufnahmegrund ist die Neuprüfung. Die Überschneidungsprüfung läuft gegen die übrigen Themen.
- **Schritt 2 (Recherche):** Der Agent bekommt die Themenliste **ohne** das Thema selbst: `npm run -s themen:ueberblick '--' '--ohne' <ID>`. Gib ihm weder das bisherige Ziel noch die bisherigen Ursachen, nicht einmal sinngemäß – er soll unabhängig herleiten. Nur Name und Beschreibung des Themas.
- **Abgleich erst danach.** Lege in der Dokumentation eine Tabelle an: bisherige Ursache → Ergebnis. Je bisherige Ursache eins von:
  - *bestätigt* – dieselbe Diagnose wurde unabhängig gefunden: ID bleibt, Text und Quelle aus der neuen Recherche;
  - *zusammengelegt* oder *verworfen* – ID entfällt (Ursachen-IDs nie wiederverwenden), Grund unter „Verworfen“;
  - neue Ursachen bekommen IDs ab der höchsten bisherigen + 1.
  Fehlt eine bisherige Diagnose in der neuen Recherche, wird sie nicht einfach übernommen: entweder mit Beleg nach den Belegstufen bestätigen (dann im Pull Request als „aus dem Abgleich“ kennzeichnen) oder verwerfen.
- **Schritt 4 (Datei):** die vorhandene Themendatei überarbeiten (`beschreibung`, `ziel`, `ursachen`), keine neue anlegen. `nachtraeglich` fällt weg – die Ursachen stammen jetzt aus Phase A. Keine `freigabe`.
- **Schritt 5 (Doku):** In `docs/perspektiven-ursachen.md` im Abschnitt des Themas einen neuen Unterabschnitt „Neuanlage <Datum>“ **über** dem alten Stand einfügen (Tabelle, Abgleich, Entschieden, Verworfen); der alte Stand bleibt als Protokoll. `daten/README.md` → „Themenauswahl“ und `docs/methode.md` → „Themen“ bleiben, wie sie sind.
- **Schritt 7 (Pull Request):** Titel „<Thema>: Neuanlage – Ursachen und Perspektivenprüfung“. Unter „Entscheidungen für die Betreiberin“ zusätzlich die Abgleich-Tabelle mit je einem Satz, warum eine bisherige Ursache bleibt oder entfällt.
