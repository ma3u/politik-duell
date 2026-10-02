---
name: thema-erfassen
description: Phasen B–D für ein Thema des Politik-Duells mit freigegebenen Ursachen – Maßnahmen aus allen Wahlprogrammen erfassen (ein Agent je Programm), ohne Parteinamen bewerten, eintragen und automatisch prüfen. Endet mit einem Pull Request. Aufruf mit der Themen-ID, optional nur für Länder, z. B. /thema-erfassen 17 oder /thema-erfassen 4 --land NI.
argument-hint: <Themen-ID> [--bund | --land XX …]
disable-model-invocation: true
---

# Thema erfassen (Phasen B–D: Maßnahmen)

Aufruf: **$ARGUMENTS**

Du koordinierst nur. Programme lesen die Agenten `programm-erfassung`, bewerten tut der Agent `blind-bewertung`. Du selbst liest keine Programme und vergibst keine Werte. Maßgeblich sind `daten/README.md` („Ablauf für ein neues Thema“, „Erfassen“, „Bewertungsmaßstab“, „Instrumente“) und `docs/methode.md`.

**Sparsam arbeiten.** Was ein Skript kann (zählen, Fundstellen suchen, Zitate und Seiten prüfen, zusammenführen), macht das Skript, nicht ein Agent. Agenten schreiben ihre Ergebnisse selbst in Dateien und geben dir nur einen Kurzbericht zurück. Lies Antworten nicht vollständig in deinen Kontext, wenn die Skriptausgabe genügt. Viele Programme: lieber erst Bund (`--bund`) mit eigenem Pull Request, dann die Länder (`--land XX`) – „noch nicht erfasst“ kostet keiner Partei einen Punkt.

Arbeitsdateien liegen in `.cache/entwurf/<ID>/` (nicht im Repository – dort stehen Programmtexte). Was Agenten liefern, steht in `.cache/entwurf/<ID>/protokoll/` – ohne dieses Protokoll trägt `entwurf:eintragen` nichts ein. Es macht sichtbar, wo du eingegriffen hast; du kennst die Parteien, die Agenten nicht.

**Windows/PowerShell 7:** npm verschluckt Optionen mit Wert, wenn das erste `--` nicht in Anführungszeichen steht (`--partei SPD` wird zum Suchbegriff „SPD“). Schreibe `npm run <skript> '--' <Argumente> '--option' wert` oder rufe das Skript direkt auf (`node --experimental-strip-types scripts/entwurf/<name>.ts …`). Umleitungen mit `>` können die Kodierung zerstören; benutze `--ausgabe <datei>` bzw. Dateiargumente.

## 0. Freigabe prüfen

```bash
git fetch origin main
npm run ursachen:freigegeben '--' <ID>
```

Schlägt das fehl: **abbrechen**. Die Ursachen sind noch nicht freigegeben (erst `/thema-anlegen`, dann Merge und `freigabe` durch die Betreiberin) oder wurden verändert. Ursachen werden beim Erfassen nicht ergänzt oder umformuliert. Fällt beim Erfassen auf, dass eine Ursache fehlt, halte es im Pull Request fest – die Entscheidung trifft die Betreiberin.

## 1. Leitfaden, Suchbegriffe, Aufträge

**Leitfaden** `daten/leitfaeden/<ID>.json` (Format: `Leitfaden` in `scripts/entwurf.ts`, Beispiel: `daten/leitfaeden/18.json`). Er legt fest, was für alle Programme gleich gilt, **bevor** ein Agent startet. Gibt es ihn noch nicht (er entsteht normalerweise in `/thema-anlegen`), schreibe ihn jetzt aus `docs/perspektiven-ursachen.md` (Tabelle, „Abgrenzung“, Erläuterungen) – ohne Blick in Programme:
- **Regeln** je Ursache: was dazugehört, was nicht, typische Grenzfälle (etwa „Wasserrückhalt in Landwirtschaft ohne Siedlungsbezug gehört nicht zu 1804“). Wo die Methode keine Antwort hat, lautet die Regel „nur als `ursachen_offen`“ – dann entscheidet die Bewertung ohne Parteinamen. Keine Parteinamen, keine Wertung (die Regeln gehen an die Bewertung).
- **Bündel** nur für breite Lösungsrichtungen mit vielen gleichartigen Einzelzusagen (etwa „Erwärmung begrenzen“): je Ursache eine Liste neutral benannter Instrumente, die Lösungswege **aller** Richtungen abdeckt (Ausbau wie Rücknahme). Ein Programm erfasst je Instrument höchstens eine Maßnahme.
- Der Leitfaden kommt in den Pull Request; die Betreiberin prüft ihn mit.

**Suchbegriffe je Lösungsrichtung** in `.cache/entwurf/<ID>/erfassung.json` (`{ "thema_id": <ID>, "suchbegriffe": { … }, "programme": [] }`). Nimm für jede Ursache die Lösungsrichtungen aus der Spalte „Diagnose aus der Debatte“ in `docs/perspektiven-ursachen.md` (jede durch „;“ getrennte Richtung einzeln) und gib jeder eigene Begriffe: `"1705": { "Beitragsfreiheit": ["beitragsfrei", "gebührenfrei"], "Beiträge nach Einkommen": ["einkommensabhängig"] }`. Wortteile genügen („sozialarbeit“ findet „Schulsozialarbeit“), bei Umlautpluralen den Stamm („betreuungspl“). Begriffe aus der Sprache aller politischen Richtungen, möglichst spezifisch.

**Aufträge und Texte** für alle Programme in einem Lauf:

```bash
npm run -s entwurf:auftrag '--' .cache/entwurf/<ID>/erfassung.json        # optional '--bund' oder '--land' XX
```

Das schreibt je Programm `texte/<Partei>-<Bund|XX>.txt` und `auftraege/<Partei>-<Bund|XX>.md`: zulässige Ursachen, Leitfaden, Bündel, Trefferzahl jedes Begriffs, Fundstellen mit PDF-Seite, Pflichtursachen (viele Treffer) und den Pfad für das Ergebnis. Programme mit vorhandenem Abdeckungseintrag lässt es aus. `NICHT GELADEN` → dieses Programm bleibt „noch nicht erfasst“ und steht im Pull Request.

## 2. Erfassen (Phase B)

Starte je Auftrag einen Agenten `programm-erfassung`, bis zu sieben gleichzeitig, und starte den nächsten, sobald einer fertig ist (nicht Ebene für Ebene warten). Der Auftrag an den Agenten ist nur: **„Erledige den Erfassungsauftrag `.cache/entwurf/<ID>/auftraege/<Name>.md` nach `.claude/agents/programm-erfassung.md`.“** Alles andere steht in der Auftragsdatei. Gib keine Inhalte aus anderen Programmen mit.

Der Agent schreibt seine Antwort selbst nach `protokoll/erfassung-<Name>.txt`, prüft sie mit `entwurf:programm-pruefen` (Felder, Ebenen, Bündel, Zitat auf der angegebenen Seite) und speichert das Ergebnis als `programme/<Name>.json`. Er gibt dir nur die Erfolgszeile und wenige Zeilen zurück. Fehlt `programme/<Name>.json`, hat die Prüfung nicht bestanden: Agent erneut beauftragen.

Wenn alle fertig sind:

```bash
npm run -s entwurf:zusammenfuehren '--' .cache/entwurf/<ID>/erfassung.json
npm run -s entwurf:treffer '--' .cache/entwurf/<ID>/erfassung.json
```

Dann prüfst du – bei **allen** Programmen mit demselben Maßstab:
- **Eigene Synonyme** aus den Kurzberichten übernimmst du in `suchbegriffe` (gelten dann für alle) und zählst neu. Nur wenn ein neuer Begriff in einem Programm viele neue Treffer ohne Maßnahme bringt, wird das eine Rückfrage.
- **Neue Bündel:** ins Leitfaden-Bündel aufnehmen, wenn es ein eigenes Instrument ist (sonst dem Agenten das passende vorhandene nennen); im Pull Request nennen.
- **Hinweise von `entwurf:treffer`** („viele Treffer, aber keine Maßnahme“): Steht im Protokoll unter „Nicht erfasst“ eine Begründung mit gelesenen Fundstellen, ist der Hinweis erledigt. Sonst Rückfrage.
- `nicht_durchsucht` → bleibt draußen („noch nicht erfasst“), im Pull Request nennen. Nie in `keine_massnahme` umwandeln.
- Unplausibles (Zitat passt nicht zur Beschreibung, Ziel statt Zusage, falscher Zusammenhang, Leitfaden nicht befolgt): Rückfrage. Zuordnungsfragen sind **keine** Rückfrage – sie entscheidet die Bewertung (ist eine Zuordnung zweifelhaft, gehört die Ursache in `ursachen_offen`; das darf der Agent in der Rückfrage ändern).

**Rückfragen: höchstens eine je Programm**, gebündelt, wenn alle Antworten da sind. Sie nennt konkret Maßnahme oder Seite, Anlass und die Leitfaden-Regel, damit der Agent nicht alles neu lesen muss: „Rückfrage 1 zu `auftraege/<Name>.md`: (1) Maßnahme 3, S. 42: Ziel statt Zusage? (R10) (2) Pflichtursache 1805: keine Maßnahme und keine Begründung – Fundstellen S. 51, 60 lesen. Antwort vollständig nach `protokoll/erfassung-<Name>-rueckfrage-1.txt`, dann prüfen.“ Danach `entwurf:zusammenfuehren` und `entwurf:treffer` erneut. Was danach offen bleibt, kommt als Grenzfall in den Pull Request – eine zweite Rückfrage nur bei Fehlern, die ein Skript meldet.

Jede Rückfrage – an Erfassungs- und Bewertungs-Agenten – steht als **eine Zeile** in `protokoll/rueckfragen.md`: `| Programm bzw. Kennung | Anlass (Regel) | Ergebnis |` (gibt es keine: „keine“).

## 3. Bewerten ohne Parteinamen (Phase C)

```bash
npm run -s entwurf:blind '--' .cache/entwurf/<ID>/erfassung.json '--ausgabe' .cache/entwurf/<ID>/blind.json
```

Das Skript ersetzt Parteinamen (samt Artikel und „Wir“), Personen und Länder, gibt die Regeln des Leitfadens mit und meldet verdächtige Reste („Rest: M07: Fraktion“). Über der Schwelle bricht es ab: Formuliere die betroffenen **Beschreibungen** neutral (Zitate bleiben wörtlich) oder bestätige mit `'--schwelle' N` und begründe jeden Rest im Pull Request. Es speichert die Kennungen (M01 …) als `kennungen.json`. `blind.json` trägt eine `pruefsumme` über den ganzen Inhalt (auch die Regeln). **Ab jetzt ist die Erfassung eingefroren:** Änderst du danach eine Beschreibung, ein Zitat, eine Seite, eine Zuordnung oder den Leitfaden, passt die Prüfsumme nicht mehr – dann `entwurf:blind` erneut und neu bewerten lassen. Fügst du Maßnahmen hinzu oder streichst sie, entstehen neue Kennungen. Korrekturen also vor `entwurf:blind`.

Starte **einen** Agenten `blind-bewertung` und gib ihm **nur** den Inhalt von `blind.json` und das heutige Datum – keine Parteinamen, keine Hinweise auf die Herkunft. (Der Agent hat keinen Dateizugriff; die Liste gehört in den Auftrag.) Schreibe den Auftrag **vorher wörtlich** nach `protokoll/bewertung-auftrag.txt` und die Antwort nach `protokoll/bewertung-antwort.txt`. Hole das JSON mit `npm run entwurf:json '--' .cache/entwurf/<ID>/protokoll/bewertung-antwort.txt .cache/entwurf/<ID>/bewertung.json`. Bei einem zweiten Auftrag: auch ihn und die Antwort speichern (`bewertung-auftrag-2.txt` …) und in `rueckfragen.md` eintragen; `bewertung-auftrag.txt` und `bewertung-antwort.txt` sind dann die letzte Fassung.

```bash
npm run -s entwurf:bewertung-pruefen '--' .cache/entwurf/<ID>/erfassung.json .cache/entwurf/<ID>/bewertung.json
```

**Die Bewertung entscheidet die Zuordnung zu Ursachen:** Was sie aus `ursachen_ids` und `ursachen_offen` nicht nennt, fällt beim Eintragen weg; Maßnahmen mit `"ursachen": []` werden nicht eingetragen (ein Programm ohne verbleibende Maßnahme bekommt `keine_massnahme`). Das ist keine Rückfrage, sondern das Ergebnis. Die Zeilen `Zuordnung: …` (je Programm: nicht bestätigt, offene bestätigt, verworfen) kommen in den Pull Request – fällt ein Programm deutlich aus dem Rahmen, nenne es dort.

Das Skript lehnt ab bei: fehlender `blind_pruefsumme` oder Prüfsumme, die nicht passt, fehlenden `ursachen`, fehlender oder doppelter Kennung, Instrument über Bund und Land, unbenutztem Instrument, Wirksamkeit 3 ohne `belegt`, zu langen Feldern. Es **warnt** bei fast nur `offen`, fehlenden Quellen, viel zu vielen Instrumenten, zusätzlich gesehenen Ursachen (zählen nicht) und unterschiedlicher Mehrfachzuordnung. Bei Fehlern den Agenten erneut beauftragen (wieder nur mit `blind.json` und deiner Rückfrage). Prüfe außerdem selbst auf Methode, nicht auf Ergebnis: gleiche Lösungswege im selben Instrument, vorhandene Instrumente wiederverwendet, neutrale Begründungen. Werte und Zuordnungen änderst du nicht selbst. Muss ein Wert später mit Kenntnis der Partei geändert werden (etwa auf Entscheidung der Betreiberin), steht am Instrument bzw. der Maßnahme `"entwurf_herkunft": "nicht_blind"` und im Pull Request der Grund – sonst lehnt die CI die Änderung ab.

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

- `entwurf:eintragen` prüft das Protokoll, übernimmt nur bestätigte Ursachen, vergibt die IDs, setzt `ki_entwurf: true`, `geprueft: false`, `durchsucht_fuer` und `entwurf_herkunft: blind` und baut die Beleg-Links mit `#page=N`. Es schreibt nur, wenn der Katalog danach gültig ist.
- `git status --short` zeigt nur die erwarteten Dateien (Themendatei, Leitfaden, `supabase/seed.sql`, Dokumentation). Fremde Dateien im Projektstamm (etwa `1-6`, `Kita`) sind Reste verschluckter Optionen – löschen, nie committen.
- Unter Windows kann `npm test` wegen CRLF-Zeilenenden bei `01-arzttermine.json` und `seed.sql` scheitern; das hat mit der Erfassung nichts zu tun (siehe `.gitattributes`).
- Meldet `zitate:pruefen` ein Zitat auf einer anderen Seite oder gar nicht (sollte nach `entwurf:programm-pruefen` nicht mehr vorkommen): Seite in der Themendatei korrigieren oder den zuständigen Agenten neu zitieren lassen. Zitate nie „passend machen“, ohne die Seite zu lesen.
- `punkte`: auf Auffälligkeiten achten (eine Partei überall 0, obwohl das Programm viel zum Thema hat? Dann die Erfassung dieses Programms prüfen lassen). Werte nicht nachträglich anpassen, um ein Ergebnis zu verändern.

## 5. Dokumentieren und Pull Request

- `docs/perspektiven-ursachen.md`, Abschnitt des Themas: Absatz **„Erfassung“** mit Datum, „KI-Entwurf, nach dem Festlegen der Ursachen“, erfasste Programme, Verweis auf den Leitfaden (`daten/leitfaeden/<ID>.json`, Bündel benennen), Suchbegriffe je Ursache und Lösungsrichtung (Richtungen ohne Maßnahme ausdrücklich nennen), Ergebnis (Zahl der Maßnahmen und Instrumente mit ID-Bereich), welche Parteien zu welchen Ursachen nichts haben, nicht durchsuchte Programme und „Nicht erfasst wurden: …“ mit Gründen (aus den Protokollen).
- `daten/README.md`: Hinweis „Echte Daten, im Aufbau“ oben aktualisieren (Themen, Zahl der Instrumente).
- Commit und Pull Request („<Thema>: Maßnahmen aus N Programmen (KI-Entwurf)“). Schreibe die Beschreibung nach `.cache/entwurf/<ID>/pr.md` und aktualisiere sie **bei jedem Push**. Vorlage: `.github/pull_request_template.md` mit der Ja/Nein-Checkliste. In der Beschreibung: Übersicht je Partei (Zahl der Maßnahmen oder „keine Maßnahme“, Zahl der Rückfragen), Leitfaden und neue Bündel (Entscheidung der Betreiberin), die Zeilen `Zuordnung: …` aus `entwurf:bewertung-pruefen`, Ausgabe von `npm run punkte`, offene Fragen und schwierige Einstufungen aus der Bewertung, nicht durchsuchte Programme, Seiten ohne Text, die Prüfsumme der Blindliste, die Treffermatrix je Ursache und Richtung (Summen je Programm) mit den Hinweisen und wie sie erledigt wurden, verdächtige Reste mit Begründung. Hinweis: Die Werte sind Entwürfe; es folgen die Bewertung durch eingeladene Prüfende und die Belegprüfung (`npm run pruefliste -- <ID>`).
