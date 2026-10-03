---
name: thema-erfassen
description: Erfasst für ein Thema des Politik-Duells mit freigegebenen Ursachen die Maßnahmen aus allen Wahlprogrammen (Phasen B–D) – je Programm ein Erfassungs-Agent, Bewertung ohne Parteinamen durch einen Blind-Agenten, Eintragen als ungeprüfter KI-Entwurf, automatische Prüfung, Pull Request. Wird mit der Themen-ID aufgerufen, nachdem die Betreiberin die Ursachen freigegeben hat, optional nur für Bund oder Länder, z. B. /thema-erfassen 17 oder /thema-erfassen 4 --land NI.
argument-hint: <Themen-ID> [--bund | --land XX …]
disable-model-invocation: true
---

# Thema erfassen (Phasen B–D: Maßnahmen)

Aufruf: **$ARGUMENTS**

Du bist die **Koordination**: Du startest Skripte und Agenten und prüfst Ergebnisse auf Methode, nicht auf Ergebnis. Programme lesen die Agenten `programm-erfassung`, bewerten tut der Agent `blind-bewertung`. Du liest keine Programme, vergibst keine Werte und keine Zuordnungen. Du kennst die Parteien, die Bewertung nicht – deshalb steht jeder Eingriff von dir im Protokoll. Maßstab: `daten/README.md` („Ablauf für ein neues Thema“, „Erfassen“, „Bewertungsmaßstab“, „Instrumente“) und `docs/methode.md`.

Alle Befehle unten **führst du aus** (`npm run -s …`); die Skripte musst du nicht lesen. Arbeitsordner ist `.cache/entwurf/<ID>/` (nicht im Repository – dort liegen Programmtexte). Unter Windows/PowerShell: [reference/windows.md](reference/windows.md).

## Begriffe

Diese Wörter bedeuten im Skill, in den Agenten und in `daten/README.md` immer dasselbe:

| Begriff | Bedeutung |
| --- | --- |
| **Bündel** | Begrenzung bei der **Erfassung**: je Programm und Bündel höchstens eine Maßnahme – nur für **gleichartige** Einzelzusagen (dasselbe Instrument mehrfach im Programm). Steht im Leitfaden. |
| **Instrument** | Einheit der **Bewertung**: gleicher Lösungsweg, gleiche Werte. Legt die Bewertung fest, nicht die Erfassung. **Ein Bündel ist kein Instrument.** |
| **Leitfaden** | `daten/leitfaeden/<ID>.json`: Regeln zur Abgrenzung je Ursache und Bündel, für alle Programme gleich, ohne Parteinamen. |
| **Kennung** | M01, M02 … – Name einer Maßnahme in der Blindliste. Bleibt gleich, solange die Maßnahme dieselbe ist (Partei, Land, Zitat). |
| **Blindliste** | `blind.json`: alle Maßnahmen ohne Parteinamen, Personen, Länder, mit Prüfsumme. Nur sie liest die Bewertung. |
| **Rückfrage** | Gezielte Nachfrage an einen Agenten zu konkreten Maßnahmen, Seiten oder Fehlern. Steht als Zeile in `protokoll/rueckfragen.md`. |
| **Protokoll** | `protokoll/`: Antworten der Agenten (von ihnen selbst geschrieben), Aufträge, Rückfragen. Ohne Protokoll trägt `entwurf:eintragen` nichts ein. |

**Zwei verschiedene Zusagen werden nie zusammengefasst, nur um die Bündelregel einzuhalten.** Ist das passende Bündel belegt, bleibt die zweite Zusage ohne Bündel – oder sie ist ein eigenes Instrument, dann kommt ein neues Bündel in den Leitfaden (für alle Programme).

## Fortschritt

Kopiere diese Liste in deine erste Antwort und hake ab. Wird ein Durchgang in einem neuen Chat fortgesetzt, ergibt sich der Stand aus den Dateien (rechte Spalte der Tabelle darunter).

```
Thema <ID> – Fortschritt
- [ ] 0 Freigabe: ursachen:freigegeben ohne Fehler
- [ ] 1 Leitfaden und Suchbegriffe; entwurf:treffer --vorab ohne offene Begriffe; entwurf:auftrag
- [ ] 2 Erfassung: alle Agenten fertig; zusammenführen; treffer; Rückfragen erledigt; Vergleich geprüft
- [ ] 3 Bewertung: entwurf:blind (neu/entfallen/geändert geprüft); bewertung-auftrag; Agent; entwurf:json; bewertung-pruefen ohne Fehler
- [ ] 4 Eintragen: entwurf:eintragen; daten:pruefen; zitate:pruefen; punkte; seed; test
- [ ] 5 Dokumentation; pr.md; Commit; Pull Request
```

| Schritt erledigt, wenn … | Datei in `.cache/entwurf/<ID>/` |
| --- | --- |
| 1 | `auftraege/*.md` und `erfassung.json` mit `suchbegriffe` |
| 2 | `programme/<Name>.json` für jeden Auftrag, `erfassung.json` mit `treffer`, `protokoll/rueckfragen.md` |
| 3 | `blind.json`, `kennungen.json`, `protokoll/bewertung-auftrag.txt` und `bewertung-antwort.txt`, `bewertung.json`, die `entwurf:bewertung-pruefen` annimmt |
| 4 | Themendatei in `daten/themen/` mit `abdeckung` für die Programme (`git status --short`) |
| 5 | `pr.md` und ein offener Pull Request |

## Grundregeln

- **Gleich für alle Programme:** dieselben Suchbegriffe, derselbe Leitfaden, dasselbe Modell, derselbe Maßstab bei Rückfragen.
- **Nicht durchsucht** heißt „noch nicht erfasst“, nie `keine_massnahme`. Fehlende Daten kosten keiner Partei einen Punkt.
- **Ursachen und Ziel** ändern sich beim Erfassen nicht. Fehlt eine Ursache: im Pull Request nennen, die Betreiberin entscheidet.
- **Keine Werte, keine Zuordnungen von dir.** Muss ein Wert später mit Kenntnis der Partei geändert werden (nur auf Entscheidung der Betreiberin), steht `"entwurf_herkunft": "nicht_blind"` daran und der Grund im Pull Request.
- **Sparsam:** Was ein Skript kann (zählen, Fundstellen, Zitate prüfen, zusammenführen, vergleichen), macht das Skript. Agenten schreiben ihre Ergebnisse selbst in Dateien; lies Antworten nicht in deinen Kontext, wenn die Skriptausgabe genügt.
- **Viele Programme:** erst Bund (`--bund`) mit eigenem Pull Request, dann Länder (`--land XX`).

## 0. Freigabe prüfen

```bash
git fetch origin main
npm run -s ursachen:freigegeben '--' <ID>
```

Fehler → **abbrechen**: Die Ursachen sind nicht freigegeben (erst `/thema-anlegen`, Merge, `freigabe` durch die Betreiberin) oder verändert.

## 1. Leitfaden, Suchbegriffe, Aufträge

**Leitfaden** `daten/leitfaeden/<ID>.json` (Format `Leitfaden` in `scripts/entwurf.ts`, Beispiel `daten/leitfaeden/18.json`). Er entsteht normalerweise in `/thema-anlegen`. Fehlt er, schreibe ihn jetzt aus `docs/perspektiven-ursachen.md` – ohne Blick in Programme:
- **Regeln** je Ursache: was dazugehört, was nicht, Grenzfälle. Hat die Methode keine Antwort: „nur als `ursachen_offen`“ (dann entscheidet die Bewertung). Keine Parteinamen, keine Wertung.
- **Bündel** nur für breite Lösungsrichtungen mit vielen gleichartigen Einzelzusagen: je Ursache neutral benannte Instrumente, die Lösungswege **aller** Richtungen abdecken (Ausbau wie Rücknahme).

**Suchbegriffe** in `erfassung.json` (`{ "thema_id": <ID>, "suchbegriffe": { … }, "programme": [] }`): je Ursache jede Lösungsrichtung aus „Diagnose aus der Debatte“ (`docs/perspektiven-ursachen.md`, durch „;“ getrennt) mit eigenen Begriffen, z. B. `"1705": { "Beitragsfreiheit": ["beitragsfrei", "gebührenfrei"], "Beiträge nach Einkommen": ["einkommensabhängig"] }`. Wortteile genügen („sozialarbeit“ findet „Schulsozialarbeit“), bei Umlautpluralen der Stamm („betreuungspl“). Sprache aller Richtungen, möglichst spezifisch.

**Begriffe vorab prüfen**, bevor ein Agent startet:

```bash
npm run -s entwurf:treffer '--' .cache/entwurf/<ID>/erfassung.json '--vorab'      # dieselben Schalter wie unten (--bund, --land XX)
```

Gemeldete Begriffe (viele Treffer je Programm oder viele Treffer mitten in anderen Wörtern, etwa „sucht“ in „versucht“) machst du genauer oder ersetzt sie – für alle Programme gleich. Erneut prüfen, bis die Liste leer ist oder jeder verbleibende Begriff im Pull Request begründet ist.

**Aufträge** für alle Programme:

```bash
npm run -s entwurf:auftrag '--' .cache/entwurf/<ID>/erfassung.json        # optional '--bund' oder '--land' XX
```

Schreibt je Programm `texte/<Name>.txt` und `auftraege/<Name>.md` (Ursachen, Leitfaden, Bündel, Treffer, Fundstellen, Pflichtursachen, Ergebnispfad). Programme mit Abdeckungseintrag lässt es aus. `NICHT GELADEN` → siehe „Programm nicht erreichbar“ unten.

## 2. Erfassen (Phase B)

**Modell:** Kannst du beim Start eines Subagenten ein Modell wählen (Claude Code: Parameter `model`), starte `programm-erfassung` mit der **nächstkleineren Stufe deiner Modellfamilie**; bist du schon auf der mittleren, behalte sie. Die kleinste Stufe nur, wenn ein Vergleichstest zeigt, dass sie Zusagen und Zitate verlässlich erkennt (Ergebnis bisher: [evals/README.md](evals/README.md)). Sonst ohne Angabe (der Agent erbt dein Modell). **Alle Erfassungs-Agenten eines Durchlaufs, Rückfragen eingeschlossen, bekommen dasselbe Modell.**

Je Auftrag ein Agent `programm-erfassung`, bis zu sieben gleichzeitig; den nächsten starten, sobald einer fertig ist. Der Auftrag ist nur dieser Satz:

> Erledige den Erfassungsauftrag `.cache/entwurf/<ID>/auftraege/<Name>.md` nach `.claude/agents/programm-erfassung.md`.

Der Agent schreibt `protokoll/erfassung-<Name>.txt`, prüft sie mit `entwurf:programm-pruefen` und speichert bei Erfolg `programme/<Name>.json`. Er gibt nur den **Kurzbericht** des Skripts zurück (feste Form: Ergebniszeile, Grenzfälle, Neue Bündel, Eigene Synonyme, Stand im PDF). Andere Zahlen in seiner Antwort zählen nicht. Fehlt `programme/<Name>.json`, hat die Prüfung nicht bestanden → Agent erneut beauftragen.

Wenn alle fertig sind:

```bash
npm run -s entwurf:zusammenfuehren '--' .cache/entwurf/<ID>/erfassung.json
npm run -s entwurf:treffer '--' .cache/entwurf/<ID>/erfassung.json
```

Prüfe – bei **allen** Programmen mit demselben Maßstab:
- **Eigene Synonyme:** in `suchbegriffe` übernehmen (gelten für alle), `entwurf:treffer` erneut. Nur viele neue Treffer ohne Maßnahme in einem Programm werden eine Rückfrage.
- **Neue Bündel:** ins Leitfaden-Bündel, wenn es ein eigenes Instrument ist; sonst dem Agenten das passende vorhandene nennen – aber nur, wenn die Zusage wirklich gleichartig ist. Im Pull Request nennen.
- **Hinweise von `entwurf:treffer`** („viele Treffer, aber keine Maßnahme“): erledigt, wenn das Protokoll unter „Nicht erfasst“ gelesene Fundstellen und einen Grund nennt; sonst Rückfrage.
- **„Ohne Bündel an Ursachen mit Bündeln“** (Ausgabe von `zusammenfuehren`): erlaubt, wenn es eine eigene Zusage ist. Gleichartig mit einer gebündelten → Rückfrage. Nie eine Zusammenfassung verlangen, nur weil das Bündel belegt ist.
- `nicht_durchsucht` → bleibt draußen, im Pull Request nennen.
- **Unplausibles** (Zitat passt nicht zur Beschreibung, Ziel statt Zusage, falscher Zusammenhang, Leitfaden nicht befolgt): Rückfrage. Zuordnungsfragen sind **keine** Rückfrage – sie entscheidet die Bewertung (zweifelhaft → `ursachen_offen`; das darf der Agent in der Rückfrage ändern).

**Rückfragen: höchstens eine je Programm**, gebündelt, wenn alle Antworten da sind. Sie nennt Maßnahme oder Seite, Anlass und Regel, zum Beispiel:

> Rückfrage 1 zu `auftraege/<Name>.md`: (1) Maßnahme 3, S. 42: Ziel statt Zusage? (R10) (2) Pflichtursache 1805: keine Maßnahme und keine Begründung – Fundstellen S. 51, 60 lesen. Antwort vollständig nach `protokoll/erfassung-<Name>-rueckfrage-1.txt`, dann prüfen.

Eine Rückfrage nennt nie Inhalte anderer Programme. Eine zweite Rückfrage an dasselbe Programm nur bei Fehlern, die ein Skript meldet, oder als Korrektur eines eigenen Fehlers (siehe „Korrektur einer fehlerhaften Rückfrage“).

**Nach jeder Rückfrage** `entwurf:zusammenfuehren` und `entwurf:treffer` erneut. `zusammenfuehren` vergleicht mit dem vorherigen Stand (in `staende/`) und meldet je Programm **entfallene**, **vermutlich zusammengefasste**, neue und geänderte Maßnahmen sowie Ursachen, die keine Maßnahme mehr haben. **Jede dieser Zeilen prüfst du, bevor `entwurf:blind` läuft:** War der Wegfall Ziel der Rückfrage (etwa Ziel statt Zusage)? Sonst ist es ein Fehler – Korrektur unten.

`protokoll/rueckfragen.md` beginnt mit „Modell der Erfassung: …“ und „Modell der Bewertung: …“. Danach je Rückfrage (an Erfassung und Bewertung) und je Korrektur **eine Zeile** `| Programm bzw. Kennung | Anlass (Regel) | Ergebnis |` – gibt es keine: „keine“.

## 3. Bewerten ohne Parteinamen (Phase C)

```bash
npm run -s entwurf:blind '--' .cache/entwurf/<ID>/erfassung.json
```

Schreibt `blind.json` (Parteinamen samt Artikel und „Wir“, Personen und Länder ersetzt; Regeln des Leitfadens; Prüfsumme über alles und je Maßnahme) und `kennungen.json`. Die Ausgabe nennt:
- **Kennungen:** behalten, neu, entfallen, geändert – je Zeile mit Programm und Seite. Unveränderte Maßnahmen behalten ihre Kennung; neue bekommen fortlaufende; entfallene werden nicht neu vergeben. Prüfe, dass nur erwartete Kennungen neu oder entfallen sind.
- **Rest:** verdächtige Wörter („Rest: M07: Fraktion“). Über der Schwelle bricht es ab: Beschreibung neutral formulieren (Zitate bleiben wörtlich) oder mit `'--schwelle' N` bestätigen und jeden Rest im Pull Request begründen.

**Ab jetzt ist die Erfassung eingefroren.** Jede Änderung an Beschreibung, Zitat, Seite, Zuordnung oder Leitfaden ändert die Prüfsumme → `entwurf:blind` erneut und neu bewerten (siehe „Teil-Neubewertung“).

```bash
npm run -s entwurf:bewertung-auftrag '--' .cache/entwurf/<ID>/erfassung.json
```

Prüft Blindliste und Kennungen, legt frühere Fassungen von Auftrag und Antwort als `bewertung-auftrag-N.txt` / `bewertung-antwort-N.txt` ab, archiviert die Liste als `protokoll/blind-<Prüfsumme>.json` und schreibt `protokoll/bewertung-auftrag.txt`. **Genau dessen Text** (zwei Pfade, Prüfsumme, Datum) ist der Auftrag an **einen** Agenten `blind-bewertung` – immer mit deinem eigenen Modell (hier zählen Recherche und Urteil). Nichts dazuschreiben: keine Parteinamen, keine Hinweise auf die Herkunft.

Der Agent liest nur `blind.json` und schreibt nur `protokoll/bewertung-antwort.txt`; der Hook `.claude/hooks/sperre.mjs` sperrt für ihn alles andere (außer WebSearch und WebFetch auf unabhängige Quellen). Danach:

```bash
npm run -s entwurf:json '--' .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt .cache/entwurf/<ID>/bewertung.json
npm run -s entwurf:bewertung-pruefen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
```

**Fehler → Rückfrage an die Bewertung** (Feedback-Schleife): Schreibe die Fehlermeldungen (Zeile und Spalte von `entwurf:json`, Kennungen von `entwurf:bewertung-pruefen`) in eine Datei und starte einen neuen Auftrag:

```bash
npm run -s entwurf:bewertung-auftrag '--' .cache/entwurf/<ID>/erfassung.json '--rueckfrage' .cache/entwurf/<ID>/rueckfrage-bewertung.txt
```

Das Skript lehnt Rückfragen mit Partei-, Personen- oder Ländernamen ab. Eintrag in `rueckfragen.md`. Wiederholen, bis `entwurf:bewertung-pruefen` ohne Fehler durchläuft.

**Die Bewertung entscheidet die Zuordnung zu Ursachen:** Nicht genannte Ursachen fallen beim Eintragen weg, `"ursachen": []` wird nicht eingetragen. Die Zeilen `Zuordnung: …` kommen in den Pull Request. Prüfe selbst nur die Methode: gleiche Lösungswege im selben Instrument, vorhandene Instrumente wiederverwendet, neutrale Begründungen. Werte und Zuordnungen änderst du nicht.

## 4. Eintragen und prüfen (Phase D)

```bash
npm run -s entwurf:eintragen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
npm run daten:pruefen
npm run -s zitate:pruefen '--' '--thema' <ID>
npm run -s punkte '--' <ID>
npm run seed
npm test
git status --short
```

- `entwurf:eintragen` prüft das Protokoll, übernimmt nur bestätigte Ursachen, vergibt IDs, setzt `ki_entwurf: true`, `geprueft: false`, `durchsucht_fuer`, `entwurf_herkunft: blind` und Beleg-Links mit `#page=N`; es schreibt nur, wenn der Katalog danach gültig ist.
- `git status --short` zeigt nur erwartete Dateien (Themendatei, Leitfaden, `supabase/seed.sql`, Dokumentation).
- `zitate:pruefen` meldet ein Zitat auf anderer Seite oder gar nicht: Agent neu zitieren lassen (Rückfrage), nie „passend machen“.
- `punkte`: Hat eine Partei überall 0, obwohl ihr Programm viel zum Thema hat, die Erfassung dieses Programms prüfen (Vergleich in `staende/`, Protokoll). Werte nie anpassen, um ein Ergebnis zu verändern.

Fehlerbilder und ihre Ursachen: [reference/fehlerbilder.md](reference/fehlerbilder.md).

## 5. Dokumentieren und Pull Request

- `docs/perspektiven-ursachen.md`, Abschnitt des Themas: Absatz **„Erfassung“** (Datum, „KI-Entwurf, nach dem Festlegen der Ursachen“, Programme, Leitfaden mit Bündeln, Suchbegriffe je Ursache und Richtung, Ergebnis mit ID-Bereichen, Parteien ohne Maßnahme je Ursache, nicht durchsuchte Programme, „Nicht erfasst wurden: …“).
- `daten/README.md`: Hinweis „Echte Daten, im Aufbau“ aktualisieren.
- Beschreibung nach `.cache/entwurf/<ID>/pr.md`, Inhalt nach [reference/pull-request.md](reference/pull-request.md); bei jedem Push aktualisieren. Titel: „<Thema>: Maßnahmen aus N Programmen (KI-Entwurf)“.

## Sonderfälle

**Programm nicht erreichbar** (`NICHT GELADEN`): Eine lokale Kopie der Betreiberin mit `'--lokal' <ordner>` bei `entwurf:auftrag`, `entwurf:treffer`, `entwurf:programm-pruefen` und `zitate:pruefen` verwenden – sie zählt nur, wenn ihre Prüfsumme der in `daten/parteien.json` entspricht (die Skripte prüfen das). Gibt es keine: Das Programm bleibt „noch nicht erfasst“ und steht im Pull Request. Nie `keine_massnahme`, nie eine andere Fassung.

**Korrektur einer fehlerhaften Rückfrage der Koordination.** Zeigt der Vergleich nach einer Rückfrage (oder später `punkte`), dass deine Rückfrage einen Fehler verursacht hat – etwa eine Zusammenfassung verschiedener Zusagen –, ist eine weitere Rückfrage an dieses Programm erlaubt, auch nach der ersten:
1. Zeile in `protokoll/rueckfragen.md`: `| <Programm> | Korrektur: Rückfrage N war fehlerhaft (<was>) | <Ergebnis> |`.
2. Rückfrage an denselben Agenten-Typ mit demselben Modell, die den Fehler benennt und die frühere Fassung wiederherstellen lässt (Antwort nach `…-rueckfrage-<N+1>.txt`).
3. `entwurf:zusammenfuehren`, `entwurf:treffer`, Vergleich prüfen; dann `entwurf:blind` und Bewertung neu (oder Teil-Neubewertung).
4. Im Pull Request unter „Korrekturen der Koordination“: Programm, Fehler, Korrektur.

**Teil-Neubewertung** (nach einer Korrektur oder späten Rückfrage, wenn nur wenige Kennungen neu oder geändert sind und Leitfaden, Ursachen und vorhandene Instrumente gleich blieben):

```bash
cp .cache/entwurf/<ID>/bewertung.json .cache/entwurf/<ID>/bewertung-vorher.json
npm run -s entwurf:blind '--' .cache/entwurf/<ID>/erfassung.json '--teil' .cache/entwurf/<ID>/bewertung-vorher.json
npm run -s entwurf:bewertung-auftrag '--' .cache/entwurf/<ID>/erfassung.json
# Agent blind-bewertung mit genau diesem Auftrag, dann:
npm run -s entwurf:json '--' .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt .cache/entwurf/<ID>/bewertung-teil.json
npm run -s entwurf:bewertung-zusammenfuehren '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung-vorher.json .cache/entwurf/<ID>/bewertung-teil.json .cache/entwurf/<ID>/bewertung.json
npm run -s entwurf:bewertung-pruefen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
```

Der Agent liest die ganze Liste, bewertet aber nur `teilbewertung.zu_bewerten`. Das Zusammenführen lehnt ab, wenn er Unverändertes anders bewertet; `entwurf:blind --teil` lehnt ab, wenn sich der Maßstab geändert hat – dann vollständig neu bewerten. Im Pull Request: welche Kennungen neu bewertet wurden.

**Kennungen nicht lesbar** (`kennungen.json` beschädigt): `entwurf:blind '--neue-kennungen'` vergibt alle neu; jede frühere Bewertung ist dann ungültig. Nie von Hand bearbeiten.

## Referenzen

- [reference/windows.md](reference/windows.md) – npm-Optionen und Kodierung unter Windows/PowerShell 7
- [reference/fehlerbilder.md](reference/fehlerbilder.md) – typische Fehlermeldungen der Skripte und was zu tun ist
- [reference/pull-request.md](reference/pull-request.md) – Inhalt der Pull-Request-Beschreibung
- [evals/README.md](evals/README.md) – Prüfszenarien für diesen Skill und Vergleichstest der Modellstufen
