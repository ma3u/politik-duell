# Datenkatalog

Hier liegen alle Daten, aus denen das Politik-Duell Punkte vergibt: Parteien, Themen, Ursachen und Maßnahmen – dazu die Haltungen (Wertfragen ohne Punkte, `haltungen/`). Die KI liest diese Daten nur, um ein Problem einem Thema und seinen Ursachen zuzuordnen. **Punkte und Links kommen ausschließlich von hier.**

Lizenz: [CC BY 4.0](LICENSE) für Auswahl, Struktur, Ursachen, Bewertungen und Begründungen. Die wörtlichen Zitate aus Wahlprogrammen und die verlinkten Quellen sind davon nicht erfasst. Mit einem Pull Request stellst du deinen Beitrag unter dieselbe Lizenz.

Änderungen laufen per Pull Request mit Quellenpflicht. Jeder Pull Request wird automatisch geprüft (`npm run daten:pruefen`).

> **Echte Daten, im Aufbau.** Parteien und Programme siehe unten („Programme“). Maßnahmen sind für alle achtzehn Themen erfasst (als KI-Entwurf aus allen sieben Bundesprogrammen; Schule, Zuwanderung und Integration, Pflege (Investitionskosten der Heime), Miete (Sozialwohnungen), Bus und Bahn (Angebot, Fahrpersonal, Ticketpreise), Straßen und Brücken (kommunale Straßen, Bauverwaltung, Radverkehr), Behördengänge (Online-Angebote, Personal), Heizungstausch (Wärmeplanung) sowie Kita-Betreuung zusätzlich aus allen 21 Landesprogrammen für ST, MV und BE) und noch nicht geprüft – öffentlich gilt deshalb vorerst alles als „noch nicht erfasst“; KI-Entwürfe erscheinen nur in der geschlossenen Testphase. Gleiche Lösungswege sind als 308 Instrumente zusammengefasst (siehe „Instrumente“). Sicherheit ist neu angelegt (Ziel und Ursachen am 2. 10. 2026 freigegeben, die bisherigen Maßnahmen stillgelegt in `ids.json`) und neu aus den sieben Bundesprogrammen und den 21 Landesprogrammen für ST, MV und BE erfasst. Hitze und Unwetter ist aus den sieben Bundesprogrammen erfasst (KI-Entwurf vom 3. 10. 2026; die Landesprogramme folgen).
>
> Die fiktiven Beispieldaten für „Mit Beispieldaten spielen“ und die Tests liegen getrennt in [`beispiel/`](beispiel/) und werden nicht weiter gepflegt.

## Ablauf für ein neues Thema

Die Reihenfolge ist wichtig für die Neutralität.

1. **Thema und Ursachen festlegen – ohne Blick in die Wahlprogramme.**
   Ursachen beschreiben, *warum* das Alltagsproblem besteht. Jede Ursache braucht eine unabhängige Quelle (z. B. Statistisches Bundesamt, Sachverständigenrat, Bundesbank, wissenschaftliche Studie). Keine Parteiquellen, keine Quellen von Lobbyverbänden als einzige Quelle.
   Ursachen **lösungsoffen** formulieren (was schiefläuft, nicht wie es zu beheben ist), Quellen unterschiedlicher Ausrichtung heranziehen und eine **Perspektivenprüfung** machen: Kommen die in der Fachdebatte vertretenen Problemdiagnosen in mindestens einer belegten Ursache vor? Ergebnis, Zuständigkeitsebene (Bund oder Land) und verworfene Kandidaten in [`docs/perspektiven-ursachen.md`](../docs/perspektiven-ursachen.md) festhalten (Regeln: [`docs/methode.md`](../docs/methode.md) → „Ursachen“).
   Eigener Pull Request, damit die Ursachen feststehen, bevor Maßnahmen dazukommen (die Prüfung lehnt Ursachen oder Ziel und Maßnahmen desselben Themas im selben Pull Request ab). Die Themendatei enthält dann noch keine `abdeckung` – das Thema gilt für alle Parteien als „noch nicht erfasst“. Die Perspektivenprüfung nennt je Ursache die **Lösungsrichtungen** aus der Debatte; jede bekommt beim Erfassen eigene Suchbegriffe. Freigegeben sind Ziel und Ursachen, wenn die Betreiberin `freigabe` (Datum, bestätigte Quellen) einträgt.
   **Testphase:** Für den schnellen Aufbau genügt eine **KI-Freigabe** (`"freigabe": { "datum": "…", "art": "ki" }`, gesetzt von `/thema-anlegen`). Dann dürfen Ursachen und Maßnahmen im selben Pull Request stehen, wenn die Ursachen vorher in einem **eigenen Commit** mit der KI-Freigabe feststanden und sich danach nicht mehr ändern – das prüft `npm run daten:id -- --gegen` am Commit-Verlauf. Geprüft (`geprueft: true`) darf in einem solchen Thema nichts sein, bis die Betreiberin die KI-Freigabe durch ihre eigene ersetzt.
2. **Maßnahmen aus den Programmen erfassen.**
   Für **jede** Partei entweder Maßnahmen mit **wörtlichem Zitat** (`zitat`) und Seitenanker eintragen oder ausdrücklich `keine_massnahme` mit kurzer Begründung („Programm Stand … durchsucht, Kapitel … enthält nichts zu …“). Neue Einträge haben `"geprueft": false`. Nur Maßnahmen aufnehmen, die an einer der erfassten Ursachen ansetzen. Ursachen werden dafür grundsätzlich nicht nachträglich ergänzt; Ausnahmen (bisher: Miete 204–206, Pflege 1005, Bus und Bahn 804; Sicherheit 904–910 bis zur Neuanlage am 2. 10. 2026) sind mit `nachtraeglich` gekennzeichnet. Werkzeuge dafür: siehe „Erfassen“.
3. **Entwurf bewerten** nach dem Maßstab unten, möglichst **ohne Parteinamen** (Maßnahmentext allein beurteilen). Schlägt ein anderes Programm denselben Lösungsweg vor, auf dessen **Instrument** verweisen statt neu zu bewerten; kommt ein Lösungsweg in mehreren Programmen vor, ein Instrument anlegen (siehe „Instrumente“). Die Entwurfswerte sind die „Empfehlung“, die Prüfende erst nach ihrer eigenen Bewertung sehen.
4. **Prüfen:** Eingeladene Prüfende bewerten in der App, die Betreiberin prüft die Belege und setzt `"geprueft": true` (siehe „Prüfung“).

Ins Spiel kommt ein Thema für eine Partei erst, wenn der **ganze Eintrag** geprüft ist: alle Maßnahmen der Partei zum Thema bzw. `keine_massnahme`. Bis dahin gilt es als **„noch nicht erfasst“** – die App zeigt das so an und wertet Runden mit dieser Partei zu diesem Thema nicht (fehlende Daten sollen keiner Partei einen Punkt kosten). Ungeprüfte Einträge bleiben als Entwurf im Repo und landen nicht in der Datenbank. Bei fiktiven Daten zählt alles.

| In `daten/` | Anzeige im Spiel | Punkte |
| --- | --- | --- |
| Maßnahmen zum Thema, alle geprüft; eine passt zu den Ursachen | Maßnahme mit Bewertung und Belegen | nach Bewertung |
| Maßnahmen zum Thema, alle geprüft; keine passt zu den Ursachen | „keine Maßnahme zu diesen Ursachen“ | 0 |
| `keine_massnahme`, geprüft | „enthält keine Maßnahme zu diesem Thema“ + Begründung | 0 |
| Eintrag (teilweise) ungeprüft oder Partei fehlt in `abdeckung` | „noch nicht erfasst“ | Runde wird nicht gewertet |

## Prüfung

Ein Pull Request pro Thema. Die Prüfung hat zwei Teile: Die **Bewertung** übernehmen eingeladene Prüfende in der App, die **Belege** prüft die Betreiberin selbst.

### Bewertung durch eingeladene Prüfende

1. **Einladen:** In der Admin-Ansicht (`#/admin` → „Prüfung“) je Person eine Einladung mit Name und Themen anlegen. Der Link wird nur einmal angezeigt – kopieren und persönlich schicken.
2. **Bewerten:** Die Person willigt ein und bewertet in der App (`#/pruefen/…`) jede **Prüfeinheit** des Themas – ein Instrument einmal für alle Programme, die es vorschlagen (die Formulierungen aus den Programmen stehen dabei), sonst die einzelne Maßnahme: ohne Parteinamen, in gemischter Reihenfolge, ohne die Bewertungen der anderen zu sehen. Die Empfehlung (Entwurfswerte und Begründung) wird erst nach der eigenen Bewertung sichtbar; Änderungen danach werden vermerkt. Am Ende „Absenden“.
3. **Auswerten:** Admin → „Prüfung“ → „Auswertung“ zeigt je Prüfeinheit alle Einzelwerte, Median Wirksamkeit, Median Umsetzbarkeit, Punkte (= Median W × Median U) und Spannweite. Es zählen nur abgesendete Bewertungen nicht gesperrter Einladungen.
4. **Übernehmen:** „Export (ohne Namen)“ herunterladen, dann `npm run pruefung:uebernehmen -- <export.json>`. Das Skript schreibt die Mediane als `wirksamkeit`/`umsetzbarkeit` an das Instrument bzw. die Maßnahme ohne Instrument und hält in `bewertung` Anzahl, Mediane, Spannweite, Datum und die ursprünglichen Entwurfswerte fest. Den Export legt es unter `pruefungen/thema-NN-<datum>.json` ab – er kommt mit ins Repository: Er enthält nur Zahlen (je Prüfeinheit Anzahl, Mediane, Spannweite und die sortierten Einzelwerte, ohne Zuordnung zu Personen), und `npm run daten:pruefen` gleicht jede `bewertung` im Katalog damit ab. Ein von Hand eingetragenes Prüfergebnis fällt so auf.

Regeln:

- **Mindestens 2, besser 3** unabhängige Bewertungen je Thema. Bei echten Daten darf eine Maßnahme erst mit `bewertung.anzahl` ≥ 2 `geprueft: true` sein – bei Maßnahmen mit Instrument zählt die `bewertung` des Instruments (prüft `npm run daten:pruefen`).
- **Median je Kriterium**, Punkte erst daraus. Bei gerader Anzahl mit zwei verschiedenen mittleren Werten (z. B. 2,5) entscheidet die Betreiberin zwischen diesen beiden, trägt den Wert in der Exportdatei ein und begründet es im Pull Request – das Skript nimmt vorher nichts an.
- **Spannweite ≥ 2:** vor der Übernahme klären – Maßstab hier präzisieren oder bei den Prüfenden nachfragen. Danach übernehmen mit `--geklaert`.
- **Namen nie ins Repo.** Im Datenkatalog stehen nur Anzahl, Median, Spannweite und Datum; die Zuordnung Person ↔ Bewertung bleibt in Supabase. Die Methodenseite nennt Namen nur von Personen, die der öffentlichen Nennung zugestimmt haben, sonst „von n unabhängigen Prüfenden“.
- **Löschen:** Auf Wunsch die Einladung in der Admin-Ansicht löschen (löscht alle Bewertungen der Person) – oder die Person widerruft selbst auf der Prüfseite.

### Belegprüfung durch die Betreiberin

`npm run pruefliste -- <Themen-ID>` erzeugt `pruefung/<nr>-<thema>.html` (nicht im Repo) – im Browser öffnen, Eingaben bleiben dort gespeichert. Durchgang A (eigene Bewertung ohne Parteinamen) ist durch die Bewertung in der App ersetzt; maßgeblich ist:

1. **Durchgang B – Belege.** Je Maßnahme: Link öffnet die richtige Seite · Zitat steht dort wörtlich · Kurzbeschreibung gibt es richtig wieder · passt zu den Ursachen · Begründung neutral. Bei `keine_massnahme`: Stichprobe mit der PDF-Suche.
   Die Prüfliste zeigt zu jedem Zitat den **ausgelassenen Text** („[…]“) und hebt hervor, was den Sinn ändern könnte: Auslassungen über 200 Zeichen, Teile unter 20 Zeichen, einschränkende Wörter („nicht“, „nur“, „sofern“ …) im Ausgelassenen und Zahlen, die nur in der Beschreibung stehen.
2. **Zweite Suche bei `keine_massnahme`:** mit eigenen Begriffen im PDF suchen, das passende Kapitel lesen und mit der Trefferzahl (`treffer` am Eintrag, aus der Treffermatrix der Erfassung) abgleichen. Was gesucht und gelesen wurde, kommt in `pruefung.zweite_suche`.
3. **Ergebnis** mit „Zusammenfassung kopieren“ als Kommentar in den Pull Request; Einwände als Zeilenkommentar. Sind Bewertung übernommen und alle Belege einer Partei in Ordnung, `geprueft: true` setzen und das Datum der Belegprüfung eintragen (`"pruefung": { "belege_geprueft": "JJJJ-MM-TT" }`, bei `keine_massnahme` zusätzlich `zweite_suche`) – erst dann zählt das Thema für diese Partei. Ohne diesen Nachweis lehnt die Prüfung `geprueft` ab.

### Haltungen prüfen

Für Haltungen (`haltungen/`) gibt es dieselben Stufen wie bei Maßnahmen, aber andere Hilfen, weil es keine Punkte zu bewerten gibt: Die Belege prüft die Betreiberin, die Einordnung Ja/Nein/Teils bestätigen zwei Prüfende, die die Partei nicht sehen, und die Formulierung der Frage prüfen zwei Personen mit unterschiedlicher politischer Haltung (E9). Eine Haltung ist erst `geprueft`, wenn alles davon erledigt ist.

`npm run haltung:pruefliste` erzeugt drei eigenständige HTML-Seiten in `pruefung/` (nicht im Repo; mit `-- --lokal <ordner>` aus lokalen Programm-PDFs). Eingaben bleiben im Browser gespeichert, die Ergebnisse werden kopiert oder als Datei geladen.

| Seite | Wer | Was |
| --- | --- | --- |
| `haltungen-formulierung.html` | zwei Personen mit unterschiedlicher politischer Haltung | Fragen, Beschreibungen und Ziele – **ohne** die Positionen. Ist die Frage fair gestellt, finden sich beide Seiten wieder, fehlt ein Argument? Die Antworten kommen zurück als Text. Ändert sich daraufhin Frage, Beschreibung oder ein Ziel, braucht die Haltung eine neue `freigabe`. |
| `haltungen-blind.html` | zwei Prüfende, die die Partei nicht sehen sollen | Frage und Zitat ohne Parteinamen (stattdessen „[Partei]“), gemischt, ohne Kurzfassung und ohne die Einordnung des Entwurfs. Sie wählen Ja, Nein, Teils oder Unklar; „Antworten kopieren“ liefert einen kurzen JSON-Text ohne Namen. |
| `haltungen-belege.html` | die Betreiberin | Je Position Link auf die PDF-Seite, Zitat, Kurzfassung, Auslassungen im Zitat und Prüfpunkte (Link, wörtlich, Kapitel schränkt nicht ein, Kurzfassung neutral). Bei „Keine Aussage“: eigene Suche und gelesenes Kapitel. Das Ergebnis liefert je geprüfter Position die Zeile `pruefung` für die Datei. |

`npm run haltung:auswerten -- antwort-1.json antwort-2.json` vergleicht die Antworten der Blindblätter mit dem Entwurf und zeigt, welche Positionen mindestens zwei Prüfende bestätigen (`einordnung_bestaetigt`). Abweichungen werden **nicht gemittelt**, sondern geklärt: Wortlaut ändern oder den Maßstab schärfen, dann neu beantworten lassen. Jede Antwort trägt eine Prüfsumme der Fragen und Zitate (`stand`); ändert sich der Katalog nach dem Versand, lehnt die Auswertung sie ab.

Wer die Blindblätter beantwortet, sollte nicht zugleich die Belege prüfen, und die Parteizugehörigkeit der Zitate nicht kennen. Namen der Prüfenden stehen nie im Repository, nur die Zahl `einordnung_bestaetigt` und der Vermerk in `docs/haltungen.md`. Die Seiten sind unabhängig von der App; die Prüfseite für Maßnahmen (`#/pruefen/…`) deckt Haltungen nicht ab.

## Programme

Grundlage sind die Wahlprogramme zur Bundestagswahl 2025. Neuere Grundsatzprogramme gibt es bisher bei keiner der Parteien (Stand September 2026: SPD, FDP und Linke wollen 2027 neue beschließen; CDU 2024, Grüne 2020, AfD 2016). Kommt ein neues Programm hinzu, `programm_url`, `programm_stand` und die Prüfsumme anpassen (`npm run programm:sichern -- <url>`) – die Prüfung meldet dann alle älteren Einträge zur Neuprüfung.

Zu jedem Programm steht in `parteien.json` die **SHA-256-Prüfsumme** der ausgewerteten PDF-Datei (`programm_sha256` bzw. `sha256`). Sie belegt, welche Fassung ausgewertet wurde, auch wenn eine Partei die Datei später austauscht oder löscht: Die Zitatprüfung warnt, wenn die abrufbare Datei abweicht, und der wöchentliche Lauf sichert jedes Programm im Internet Archive, dessen Kopie sich über die Prüfsumme als dieselbe Fassung erkennen lässt.

| ID | Partei | Programm | Beschluss |
| --- | --- | --- | --- |
| 11 | CDU/CSU | [Politikwechsel für Deutschland](https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf) | 17. 12. 2024 |
| 12 | SPD | [Mehr für Dich. Besser für Deutschland.](https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf) | 11. 1. 2025 |
| 13 | Bündnis 90/Die Grünen | [Zusammen wachsen](https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf) (Fassung vom 18. 3. 2025) | 26. 1. 2025 |
| 14 | FDP | [Alles lässt sich ändern](https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf) | 9. 2. 2025 |
| 15 | AfD | [Zeit für Deutschland](https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf) | 12. 1. 2025 |
| 16 | Die Linke | [Alle wollen regieren. Wir wollen verändern.](https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf) | 18. 1. 2025 |
| 17 | BSW | [Unser Land verdient mehr!](https://bsw-vg.de/wp-content/themes/bsw/assets/downloads/BSW%20Wahlprogramm%202025.pdf) | 12. 1. 2025 |
| 18 | Volt Deutschland | [Holen wir uns die Zukunft zurück](https://voltdeutschland.org/storage/assets-btw25/volt-programm-bundestagswahl-2025.pdf) | 16. 1. 2025 (Datum der PDF-Fassung; ein Beschlussdatum ist nicht veröffentlicht) |

**Volt** ist im Fork seit 7. 10. 2026 dabei. Die Positionen zu den Haltungen kommen als Nachtrag dazu (`npm run haltung:auftrag|haltung:blind|haltung:eintragen -- <IDs> --nachtrag 18`): nur das Volt-Programm wird erfasst und ohne Parteinamen eingeordnet, die Positionen der übrigen Parteien bleiben unverändert. Maßnahmen und Landesprogramme von Volt sind noch nicht erfasst.

Seitenanker `#page=N` zählen PDF-Seiten, nicht die gedruckten Seitenzahlen. Die IDs 1–5 waren fiktive Parteien und werden nicht wiederverwendet. Das BSW heißt ab 1. 10. 2026 „Bündnis Soziale Gerechtigkeit und Wirtschaftliche Vernunft“; die Abkürzung bleibt.

### Landesprogramme

Für Ursachen mit `ebene: land` zählt bei gewähltem Bundesland das Wahlprogramm der laufenden Wahlperiode (siehe `parteien.json` → `landesprogramme`). Datum = Beschluss; bei FDP Berlin ist kein Beschlussdatum veröffentlicht, dort steht das Datum der Endfassung. Die Server der Linken in ST und BE sind aus GitHub Actions zeitweise nicht erreichbar; deren Zitate prüft die automatische Prüfung dann über die Kopie im Internet Archive oder gar nicht (Warnung) – lokal mit `npm run zitate:pruefen -- --lokal <ordner>` (siehe „Erfassen“).

| Land | Union | SPD | Grüne | FDP | AfD | Linke | BSW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sachsen-Anhalt (Wahl 6. 9. 2026) | [13. 6. 2026](https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf) | [21. 3. 2026](https://spdsachsenanhalt.de/wp-content/uploads/sites/63/2026/03/SPD-Wahlprogramm-2026.pdf) | [9. 5. 2026](https://www.gruene-lsa.de/wp-content/uploads/2026/05/Programm-zur-Landtagswahl-2026.pdf) | [25. 4. 2026](https://www.fdp-lsa.de/sites/default/files/2026-07/fdpwahlprogrammltw2026.pdf) | [11. 4. 2026](https://afd-lsa.de/wp-content/uploads/2026/07/AfD_Sachsen-Anhalt_Regierungsprogramm_2026_230726-web.pdf) | [14. 3. 2026](https://www.dielinke-sachsen-anhalt.de/fileadmin/aaa_download_lsa/Parteitage/10._LPT_2._Tagung_VV_LTW_2026/Beschluesse/2026-03-19_Landtagswahlprogramm__final_.pdf) | [7. 3. 2026](https://st.bsw-vg.de/wp-content/uploads/2026/04/BSW_Landtagswahlprogramm_SachsenAnhalt.pdf) |
| Mecklenburg-Vorpommern (Wahl 20. 9. 2026) | [5. 6. 2026](https://cdu-mv.de/wp-content/uploads/2026/06/Wahlprogramm-CDU-MV-2026.pdf) | [13. 6. 2026](https://spd-mv.de/uploads/bilderpool/2-Mecklenburg-Vorpommern/Wahlen-und-Kandidaturen/2026-Landtagswahlen/SPD_MV_Programm_2026.pdf) | [6. 6. 2026](https://gruene-mv.de/?wpdmdl=33772) | [22. 3. 2026](https://www.fdp-mv.de/sites/default/files/2026-06/Landtagswahlprogramm_2026.pdf) | [30. 5. 2026](https://afd-vg.de/wp-content/uploads/2026/06/AfD-Regierungsprogramm-Mecklenburg-Vorpommern-2026.pdf) | [30. 5. 2026](https://wahlprogramm26.die-linke-mv.de/wp-content/uploads/sites/77/2026/08/LINKE-MV_LTW26_Langwahlprogramm_A4_web.pdf) | [14. 3. 2026](https://mv.bsw-vg.de/wp-content/uploads/2026/04/Landeswahlprogramm-2026.pdf) |
| Berlin (Wahl 20. 9. 2026) | [9. 6. 2026](https://berlin-wird.de/image/uploads/data/regierungsprogramm2026_2031.pdf) | [9. 5. 2026](https://library.fes.de/pdf-files/bibliothek/ltw-programme/SPD_Berlin_Wahlprogramm_20260521-v3-4_7942063.pdf) | [15. 2. 2026](https://gruene.berlin/fileadmin/BE/lv_berlin/files/Wahlprogramm_2026_Online.pdf) | [17. 7. 2026](https://www.fdp-berlin.de/sites/default/files/2026-07/Wahlprogramm_FDP%20Berlin_Abgeordnetenhauswahl%202026_FINAL.pdf) | [30. 5. 2026](https://lichtenberg.afd.berlin/wp-content/uploads/2026/07/AfD-WK-Berlin-Wahlprogramm-Webversion.pdf) | [25. 4. 2026](https://dielinke.berlin/fileadmin/download/2026/Wahlprogramm_AGH_2026_Die_Linke_Berlin.pdf) | [25. 4. 2026](https://bsw.berlin/wp-content/uploads/Wahlprogramm-BSW-Berlin-AGH-Wahl-2026.pdf) |

## Themenauswahl

Welche Themen in den Katalog kommen, richtet sich danach, was Menschen selbst als wichtigste Probleme nennen – nicht nach den Schwerpunkten einzelner Parteien. Grundlage für die ersten zehn Themen (Stand September 2026) sind die Umfragen vor den Wahlen 2026:

| Wahl | Meistgenannte Probleme | Umfrage |
| --- | --- | --- |
| Sachsen-Anhalt (6. 9. 2026) | Wirtschaftslage 22 %, Arbeitslosigkeit 17 %, Bildung/Schule 17 %; laut Infratest dimap vorn: Zuwanderung, Bildung, Wirtschaft | [Politbarometer Extra I, Aug. 2026](https://presseportal.zdf.de/pressemitteilung/zdf-politbarometer-extra-i-sachsen-anhalt-august-2026), [LänderTREND Mai 2026](https://www.infratest-dimap.de/umfragen-analysen/bundeslaender/sachsen-anhalt/laendertrend/2026/mai/) |
| Mecklenburg-Vorpommern (20. 9. 2026) | vorn: Bildung, Wirtschaft, Zuwanderung; außerdem genannt: Arbeitslosigkeit, Gesundheit/Pflege, Rente, Verkehr, Wohnen, Lebenshaltungskosten¹ | [LänderTREND Sept. 2026](https://www.infratest-dimap.de/umfragen-analysen/bundeslaender/mecklenburg-vorpommern/laendertrend/2026/september/) |
| Berlin (20. 9. 2026) | Wohnen/Mieten 32 %, kein anderes Thema vergleichbar; im Wahlkampf außerdem Verkehr, Sicherheit, Müll | BerlinTrend Sept. 2026 (rbb/Infratest dimap), zitiert bei [entwicklungsstadt.de](https://www.entwicklungsstadt.de/enteignung-vor-der-berlin-wahl-2026-was-parteien-und-berliner-wollen/); Themen: [t-online](https://www.t-online.de/nachrichten/deutschland/innenpolitik/id_101442118/themen-der-berlin-wahl-2026-wohnen-verkehr-sicherheit-und-muell.html) |

¹ Infratest dimap veröffentlicht für Mecklenburg-Vorpommern nur die Rangfolge der ersten drei. Die übrigen Themen und Prozentwerte (Bildung 25 %, Wirtschaft 16 %, Zuwanderung 16 %, Arbeitslosigkeit 14 %, Gesundheit/Pflege 10 %, Rente 10 %, Verkehr 8 %, Wohnen 7 %, Lebenshaltungskosten 6 %) stammen aus einer Weitergabe der Umfrage durch [@Wahlen_DE](https://x.com/Wahlen_DE/status/2095567466701226140) und sind an der Originalquelle nicht überprüfbar.

Weitere Belege, vor allem für Pflege und Rente, deren Prozentwerte in Mecklenburg-Vorpommern nicht an der Originalquelle prüfbar sind:

| Umfrage | Ergebnis |
| --- | --- |
| [Sachsen-Anhalt-Monitor 2025](https://lpb.sachsen-anhalt.de/fileadmin/Bibliothek/Politik_und_Verwaltung/MK/LPB/Uploads/SAM_2025_V0812_1.pdf) (offene Frage nach den wichtigsten Problemen im Land, n = 1.077, S. 46 f.) | Vorn: Infrastruktur und Mobilität (360 Nennungen), Wirtschaft und Finanzen (352), Soziales und Gerechtigkeit (292) – darunter Gesundheitsversorgung, Pflege, Altersarmut und zu niedrige Renten –, Erwerbsarbeit (287), Migration und Integration (266), Bildung (260) |
| [DAK-Pflegereport, Berlin](https://www.tagesspiegel.de/berlin/hohe-kosten-personalmangel-fehlende-krafte-mehrheit-in-berlin-gibt-pflege-schlechte-noten-15259316.html) (Allensbach) | 61 % halten die Pflegesituation für nicht gut; je 63 % nennen hohe Heimkosten und Personalmangel als größte Probleme |
| [ARD-DeutschlandTrend Juli 2026](https://www.infratest-dimap.de/umfragen-analysen/bundesweit/ard-deutschlandtrend/2026/juli/) (bundesweit) | Mehr als die Hälfte der Erwerbstätigen fürchtet, im Alter Geldprobleme zu haben |
| [R+V „Die Ängste der Deutschen 2025“](https://www.ruv.de/newsroom/themenspezial-die-aengste-der-deutschen/pressemitteilungen/2025-09-18-studie-aengste-der-deutschen) (bundesweit) | 39 % fürchten, im Alter auf Pflege angewiesen zu sein (Platz 13) |

Daraus: Arzttermine und Pflege (Gesundheit/Pflege), Miete, Energiepreise (Lebenshaltungskosten), Schule, Arbeitsplätze (Wirtschaft und Arbeitslosigkeit), Zuwanderung und Integration, Rente, Bus und Bahn, Sicherheit.

**Erweiterung (30. 9. 2026):** Die Betreiberin hat acht Themenkomplexe vorgelegt, die Menschen bundesweit belasten (Lebenshaltungskosten, Migration und Sicherheit, Energie und Klima, Infrastruktur und Digitalisierung, Mobilität, Krieg und Verteidigung, Vertrauen in den Staat, Sozialstaat). Abgeglichen mit den vorhandenen Themen kamen sechs neue dazu, weil sie Aspekte betreffen, die noch keine Ursache abdeckte:

| Thema | Aus dem Komplex | Weitere Belege |
| --- | --- | --- |
| Preise und Löhne (11) | Lebensmittelpreise, stagnierende Reallöhne | Sachsen-Anhalt-Monitor 2025: Wirtschaft und Finanzen, Soziales (s. o.); MV: Lebenshaltungskosten, Armut |
| Straßen und Brücken (12) | marode Brücken und Straßen, fehlende Radwege | Sachsen-Anhalt-Monitor 2025: Infrastruktur und Mobilität am häufigsten genannt (360 Nennungen) |
| Internet und Mobilfunk (13) | Funklöcher | ebenda |
| Behördengänge (14) | langsame Behörden, bürokratische Trägheit | Berlin: Bürgeramt-Termine (Kandidat seit 2026) |
| Autofahren (15) | Spritpreise, Ladesäulen | [ZDF-Politbarometer Sept. 2026](https://presseportal.zdf.de/pressemitteilung/zdf-politbarometer-september-2026): 78 % finden, die Bundesregierung tue zu wenig gegen steigende Energiepreise; Tankrabatt 2026 |
| Heizungstausch (16) | Überforderung durch das Heizungsgesetz | Gebäudemodernisierungsgesetz seit Juli 2026 |

Schon abgedeckt und deshalb nicht neu aufgenommen: Energie- und Mietpreise, Arbeitsplatzverlust in der Industrie (Arbeitsplätze), Zuwanderung, Integration in Arbeit und überlastete Kommunen (Zuwanderung und Integration), Sicherheit, Bahn und ÖPNV auf dem Land (Bus und Bahn), Lehrermangel (Schule), Ärztemangel auf dem Land (Arzttermine), Rente und Pflegekosten.

**Erweiterung (1. 10. 2026): Kita-Betreuung (17).** Das Thema stand als Kandidat für Sachsen-Anhalt in dieser Liste. Eine Umfrage, in der Menschen dort Kita-Betreuung als wichtigstes Problem nennen, liegt nicht vor (Sachsen-AnhaltTREND Mai 2026: Zuwanderung, Bildung, Wirtschaft). Aufgenommen ist es auf Wunsch der Betreiberin, weil das Erleben der Eltern belegt ist: Laut [DJI](https://www.dji.de/veroeffentlichungen/pressemitteilungen/detailansicht/article/fruehe-bildung-es-werden-weiterhin-plaetze-benoetigt.html) konnten 2025 11 % der Eltern von Kindern unter drei Jahren trotz Bedarf keinen Platz nutzen, und nach einer [DJI-Analyse](https://www.dji.de/veroeffentlichungen/aktuelles/news/article/1730-unerwartete-kita-schliessungen-gehen-mit-verstaerkten-zweifeln-an-der-qualitaet-einher.html) erlebten 2023/24 43 % der Familien ungeplante Schließtage. Abgegrenzt von Schule (Sprachförderung vor der Einschulung bleibt Ursache 404).

**Erweiterung (2. 10. 2026): Hitze und Unwetter (18).** Das Thema stand als Kandidat in der Liste „Kandidaten für später“. Eine Umfrage, in der Menschen Hitze oder Unwetter als wichtigstes Problem nennen, liegt nicht vor: Laut [UBA, Umweltbewusstsein in Deutschland 2024](https://www.umweltbundesamt.de/publikationen/umweltbewusstsein-in-deutschland-2024) (Herbst 2024, rund 2.500 Befragte) nimmt die Bedeutung von Umwelt und Klima seit 2022 ab, und viele empfinden Gesundheit, Bildung und Wirtschaft als dringlicher. Aufgenommen ist es auf Wunsch der Betreiberin, weil das Erleben belegt ist: Dieselbe Umfrage zeigt, dass sich zwei Drittel durch Hitzeperioden gesundheitlich belastet fühlen und über 80 % deutlichen Bedarf sehen, den Schutz vor Hitze zu verbessern. Das RKI schätzt für 2023 und 2024 je rund 3.000 hitzebedingte Sterbefälle. Der Klimaschutz selbst bleibt kein eigenes Thema; erfasst sind die Folgen. Abgegrenzt von Energiepreise und Heizungstausch (Heizkosten, Heiztechnik, Kühlung als Stromkosten), Miete, Straßen und Brücken sowie Schule und Pflege (Einrichtungen).

Bewusst nicht als eigenes Thema aufgenommen:
- **Krieg, Geopolitik und Verteidigung.** Die Sorge vor einer Eskalation ist verständlich, aber kein Alltagsproblem, dessen Ursachen sich unabhängig belegen und an dem sich Maßnahmen nach Wirksamkeit messen ließen: Ob Abschreckung oder Verhandlungen Krieg eher verhindern, ist eine Wertungs- und Einschätzungsfrage, keine Frage belegter Wirkung. Im Spiel wird das als persönliche Haltung (`wert`) behandelt. Folgen im Alltag (Energie- und Spritpreise) sind über Energiepreise und Autofahren abgedeckt.
- **Vertrauen in Politik und Medien.** Querschnittsthema; der greifbare Teil (langsame Verwaltung, Bürokratie) ist jetzt das Thema Behördengänge. Streit in Koalitionen oder das Gefühl der Ohnmacht sind keine Ursachen, an denen Programm-Maßnahmen gemessen werden können.
- **Tempolimit, Parkplätze, Verbrenner-Aus als Kulturkampf.** Wertfragen; die Kosten des Autofahrens sind im Thema Autofahren erfasst (siehe Perspektivenprüfung).

- **Sprache, Gendern und Quoten** (aus dem Komplex „Identity Politics, Gesellschaftsklima und Sprachkritik“, Abgleich vom 1. 10. 2026). Ob Gendern oder Quoten richtig sind, ist eine Wertfrage, kein Problem mit belegbaren Ursachen, an dem sich die Wirksamkeit von Maßnahmen messen ließe. Im Spiel wird das als persönliche Haltung (`wert`) behandelt.

### Kandidaten für später

Noch nicht aufgenommen. Jedes Thema wird einzeln mit `/thema-anlegen` geprüft (Umfragebeleg, Überschneidung, Wertfrage) und erst danach mit `/thema-erfassen` erfasst; ein Eintrag hier ist noch keine Entscheidung für die Aufnahme. Häufige Einträge in der Review-Warteschlange sind ein weiterer Hinweis.

**Abgleich (1. 10. 2026):** Die Betreiberin hat eine erweiterte Liste mit zehn Themenkomplexen vorgelegt (zusätzlich zu den acht oben: „Identity Politics, Gesellschaftsklima und Sprachkritik“ sowie „Social-Media-Dynamiken und Polarisierung im Netz“). Schon abgedeckt sind daraus Lebenshaltungskosten (Miete, Energiepreise, Preise und Löhne), Arbeitsplatzverlust (Arbeitsplätze), überlastete Kommunen, Integration und Sicherheit (Zuwanderung und Integration, Sicherheit), Heizungsgesetz (Heizungstausch), Bahn, Brücken, Lehrermangel, Funklöcher und Behörden (Bus und Bahn, Straßen und Brücken, Schule, Internet und Mobilfunk, Behördengänge), Spritpreise, Ladesäulen und Radwege (Autofahren, Straßen und Brücken), Altersarmut, Pflegekosten und Ärztemangel auf dem Land (Rente, Pflege, Arzttermine). Krieg und Verteidigung, Vertrauen in Politik und Medien sowie Gendern und Quoten bleiben aus den oben genannten Gründen draußen. Nicht abgedeckt sind die folgenden Aspekte:

| Kandidat | Aus dem Komplex bzw. Anlass | Hinweis für `/thema-anlegen` |
| --- | --- | --- |
| Psychotherapie-Plätze | Verunsicherung jüngerer Generationen (Komplex 6), Gesundheit/Pflege (MV 10 %) | Arzttermine (1) hat nur Ursachen zu Haus- und Facharztpraxen. Prüfen, ob eigenes Thema oder neue Ursache in Arzttermine. |
| Hass und Desinformation im Netz | Social-Media-Dynamiken (Komplex 10), Vorwürfe der Manipulation (Komplex 8) | Abgrenzen von Sicherheit (Cyberkriminalität, politisch motivierte Kriminalität). Perspektivenprüfung: Maßnahmen berühren die Meinungsfreiheit; das Ziel muss beide Sorgen fassen (Schutz vor Hass und vor Überregulierung). |
| Kinder und Jugendliche in sozialen Netzwerken | Social-Media-Dynamiken (Komplex 10), Verunsicherung jüngerer Generationen (Komplex 6) | Ggf. mit „Hass und Desinformation im Netz“ zusammenlegen; Abgrenzung zu Schule (Medienbildung). |
| Sichere Stromversorgung | Unsicherheit über die künftige Energieversorgung (Komplex 3) | Prüfen, ob Menschen Stromausfälle selbst als Problem erleben oder nur befürchten (Umfragebeleg nötig); abgrenzen von Energiepreise (Preis, nicht Versorgung). |
| Armut und soziale Ungerechtigkeit | Ungerechtigkeit bei Sozialleistungen (Komplex 9), MV 8 % | Abgrenzen von Preise und Löhne, Rente und Arbeitsplätze (Ursache Hinzuverdienst im Bürgergeld). „Gerechtigkeit“ der Verteilung ist teils Wertfrage; greifbar sind etwa Kinderarmut oder nicht abgerufene Leistungen. |
| Ländlicher Raum und Abwanderung | Veröden des ländlichen Raums (Komplex 9), Abwanderung junger Menschen (Sachsen-Anhalt) | Ärztemangel und ÖPNV sind schon in Arzttermine und Bus und Bahn; offen sind etwa Abwanderung, fehlende Läden und Treffpunkte. |
| Müll | Berlin, im Wahlkampf genannt | Fast nur Länder- und Kommunalzuständigkeit; nur mit Landesprogrammen sinnvoll. |

## Bewertungsmaßstab

Maßgeblich ist die Methodenseite der App (`src/rechtliches/Methode.tsx`, in der App unter „So bewerten wir“). Die Tabellen hier geben sie wieder und ergänzen Beispiele – bei Änderungen beide anpassen.

### Wirksamkeit (0–3): Wie stark bringt die Maßnahme das Ziel des Themas voran?

Jedes Thema hat ein **Ziel aus Sicht der Betroffenen** (`ziel`, z. B. Miete: „Mieterinnen und Mieter finden eine passende Wohnung und können sich die Miete dauerhaft leisten.“). Gemessen wird, wie stark die Maßnahme über die Ursache, an der sie ansetzt, zu diesem Ziel beiträgt. Vor- oder Nachteile für andere Gruppen (z. B. Vermieter) gehören nicht in die Wirksamkeit, sondern höchstens in den Rollen-Modifikator.

| Wert | Bedeutung |
| --- | --- |
| 0 | hilft beim Ziel nicht: setzt an keiner der erfassten Ursachen an |
| 1 | hilft kaum: berührt eine Ursache nur am Rand oder lindert nur Folgen (z. B. einmalige Entlastung, Zuschuss ohne mehr Angebot) |
| 2 | hilft spürbar: setzt an einer Ursache an, eine deutliche Verbesserung ist zu erwarten |
| 3 | hilft stark: setzt direkt an einer Hauptursache an; die Wirkung ist gut belegt (Studie oder Erfahrungen anderswo) |

**Ablehnungen:** Lehnt eine Maßnahme ein Mittel ab oder nimmt es zurück, zählt nur, was sie selbst zum Ziel beiträgt. Ist das abgelehnte Mittel nicht selbst Teil des Problems (anders als etwa ein CO₂-Preis bei Energiekosten), ist die Wirksamkeit 0 – auch wenn das Mittel nur schwach wirkt. Was das Programm stattdessen vorschlägt, wird als eigene Maßnahme bewertet (Entscheidung der Betreiberin, 2. 10. 2026).

### Umsetzbarkeit (0–3): Ist die Maßnahme realistisch?

Gemeint ist: Könnte die Regierung der Ebene, aus deren Programm die Maßnahme stammt (Bund oder Land), sie in einer Wahlperiode rechtlich und finanziell umsetzen? Ob die Maßnahme politisch mehrheitsfähig ist, spielt keine Rolle.

Steht eine Maßnahme im **Bundesprogramm**, betrifft aber Länderzuständigkeit (etwa Schule), gilt einheitlich: 3 – der Bund ist zuständig oder finanziert es bereits; 2 – der Bund kann mit Geld, einem Programm oder einer Vereinbarung mit den Ländern beitragen; 1 – nur die Länder können es über ihr eigenes Recht regeln (kein Hebel des Bundes), es braucht eine Grundgesetzänderung, oder das nötige Personal fehlt absehbar.

Hängt eine Maßnahme ganz oder teilweise von EU-Entscheidungen ab, die Deutschland nicht allein treffen kann (etwa EU-Emissionshandel, EU-Berichtspflichten, Sanktionen), gilt 1; ist sie klar EU-rechtswidrig, 0. Hängt sie von der Zustimmung anderer Staaten ab (etwa Rücknahmeabkommen mit Herkunftsstaaten), gilt höchstens 2.

| Wert | Bedeutung |
| --- | --- |
| 0 | rechtlich oder finanziell derzeit nicht umsetzbar (z. B. verfassungs- oder EU-rechtswidrig) |
| 1 | nur mit großen Hürden umsetzbar (z. B. Verfassungsänderung, ungeklärte Finanzierung) |
| 2 | umsetzbar mit Aufwand oder in mehreren Jahren |
| 3 | rechtlich möglich, finanziert und innerhalb einer Wahlperiode realistisch |

### Rollen-Modifikator (−2 bis +2, optional)

Nur wenn eine Maßnahme für eine Rolle nachweislich deutlich besser oder schlechter wirkt (z. B. Mietrecht für Mieter:innen vs. Eigentümer:innen). Immer mit Begründung. Auf Wirksamkeit 3 hebt der Modifikator nur bei `evidenz: belegt`; sonst zählt er höchstens bis 2 (die Prüfung warnt). Rollen: `mieter`, `eigentuemer`, `angestellt`, `selbststaendig`, `rentner`, `arbeitslos`, `studierend`, `vermoegend`.

### Stand der Forschung

Feld `evidenz`: `belegt` (übereinstimmende Studien oder Erfahrungen anderswo), `gemischt` (Studien kommen zu unterschiedlichen Ergebnissen) oder `offen` (kaum untersucht). Wirksamkeit 3 nur mit `belegt` und einer Studie (`beleg_studie_url`, bei neuen Blindbewertungen Pflicht, sonst Warnung); bei `gemischt` oder `offen` höchstens 2, und die Begründung nennt beide Seiten. Das Spiel zeigt „Wirkung in der Forschung umstritten“ bzw. „Wirkung bisher kaum untersucht“ an. Ergibt die Prüfung einen Median von 3 bei nicht belegter Wirkung, meldet `npm run pruefung:uebernehmen` einen Fehler – dann Forschungsstand klären oder die Wirksamkeit begründet auf 2 setzen.

### Begründung

Ein bis zwei neutrale Sätze: was dafür, was dagegen spricht. Keine Wertung der Partei, nur der Maßnahme.

### Instrumente

Viele Programme schlagen denselben Lösungsweg vor – etwa ein Handyverbot an Schulen oder mehr Schulsozialarbeit. Damit er überall gleich bewertet wird, auch in anderen Ländern und späteren Wahlperioden, stehen Wirksamkeit, Umsetzbarkeit, Begründung, Forschungsstand und Studie **einmal** am Instrument (`instrumente` in der Themendatei). Jede Maßnahme, die ihn vorschlägt, verweist mit `instrument` darauf und hat selbst nur Beschreibung, Ursachen, Zitat und Beleg. Prüfende bewerten das Instrument einmal; das Ergebnis gilt für alle Maßnahmen dahinter.

- **Gleicher Lösungsweg, gleiches Instrument.** Unterscheidet sich eine Maßnahme so, dass sie anders zu bewerten ist – etwa ein Schulbauprogramm mit Betrag statt ohne –, bekommt sie ein eigenes Instrument (bei nur einem Programm: eigene Bewertung ohne Instrument).
- **Eine Ebene je Instrument.** Die Umsetzbarkeit wird aus Sicht von Bund oder Land bewertet; dasselbe Vorhaben im Bundes- und im Landesprogramm braucht deshalb zwei Instrumente.
- Instrumente und Maßnahmen teilen sich einen Nummernkreis (siehe „IDs“).
- **Bund ↔ Land: `entspricht`.** Weil ein Instrument nur für eine Ebene gilt, bekommt der gleiche Lösungsweg im Bundes- und im Landesprogramm zwei Instrumente. Mit dem optionalen Feld `entspricht` (ID des Gegenstücks im selben Thema) verweist jedes auf das andere; die Forderungskarte zeigt dann bei gewähltem Bundesland beide Blöcke. Die Prüfung verlangt, dass das Gegenstück existiert, zur anderen Ebene gehört und zurückverweist. `entspricht` ändert keine Bewertung.
- **Forderungskarte:** Die Karte zeigt zu einem erkannten Instrument Name, Forschungsstand (`evidenz`), Begründung, Studie und welche Parteien es vorschlagen – ohne Wirksamkeit und Umsetzbarkeit. Je Partei steht dort „steht im Programm“ (mit den Maßnahmen und Belegen), „zu diesem Thema nicht gefunden“ oder „noch nicht erfasst“ (aus `abdeckung`). Deshalb: Name so wählen, dass Spielende ihre Forderung darin erkennen („Asylsuchende an den Binnengrenzen zurückweisen“), und `begruendung` neutral halten.
- `schlagwoerter` (optional, nur für den Mock ohne KI): Wörter, an denen die Mock-Analyse eine Forderung diesem Instrument zuordnet.
- **Instrument ist nicht Bündel.** Ein *Instrument* ist die Einheit der Bewertung (gleicher Lösungsweg, gleiche Werte) und wird bei der Bewertung festgelegt. Ein *Bündel* (Erfassungsleitfaden, siehe „Mit KI-Agenten“) begrenzt nur die Erfassung: je Programm und Bündel höchstens eine Maßnahme, und nur für gleichartige Einzelzusagen. Zwei verschiedene Zusagen werden nie zusammengefasst, nur um die Bündelregel einzuhalten.

## Dateiformat

### `parteien.json`

```json
{
  "fiktiv": false,
  "parteien": [
    {
      "id": 1,
      "name": "Voller Name",
      "kurzname": "Kurz",
      "farbe": "#1a2b3c",
      "programm_url": "https://…/wahlprogramm.pdf",
      "programm_stand": "2026-01-01",
      "programm_sha256": "64 Zeichen, von npm run programm:sichern"
    }
  ]
}
```

`programm_url` ist die Adresse des ganzen Programms ohne `#`-Anker. Erscheint ein neues Programm, `programm_url` und `programm_stand` ändern: Die Prüfung meldet dann alle Einträge dieser Partei mit älterem `stand` zur Neuprüfung.

#### Länder und Landesprogramme

```json
{
  "fiktiv": false,
  "laender": [
    { "id": "ST", "name": "Sachsen-Anhalt", "letzte_wahl": "2026-09-06" }
  ],
  "parteien": [
    {
      "id": 11,
      "…": "…",
      "landesprogramme": [
        { "land": "ST", "landtagswahl": "2026-09-06", "url": "https://…/landeswahlprogramm.pdf", "stand": "2026-03-14", "sha256": "…" },
        { "land": "MV", "landtagswahl": "2026-09-20", "kein_programm": "Zur Landtagswahl nicht angetreten." }
      ]
    }
  ]
}
```

- `laender` nennt nur Länder, für die Landesprogramme erfasst werden, mit dem Datum der letzten Landtagswahl. In der App stehen sie zur Wahl, sobald für das Land mindestens ein Eintrag geprüft ist.
- Je Partei, Land und Landtagswahl ein Eintrag: das Programm (`url`, Beschlussdatum `stand`, Prüfsumme `sha256`) oder `kein_programm` mit Begründung (nicht angetreten, kein Programm veröffentlicht). Fehlt der Eintrag zur letzten Wahl, gilt das Land für die Partei als „noch nicht erfasst“.
- **Laufende Wahlperiode:** Es zählt nur das Programm zur `letzte_wahl` des Landes. Programme früherer Wahlen **bleiben stehen**, ebenso ihre Maßnahmen – sie belegen gespielte Runden, zählen aber nicht mehr und werden nicht mehr geprüft. Ablauf siehe „Neue Wahlperiode“.

### `themen/NN-name.json` – eine Datei pro Thema

```json
{
  "id": 4,
  "name": "Kita-Plätze",
  "beschreibung": "Kurzer neutraler Satz.",
  "ziel": "Was sich für die Betroffenen ändern soll – Maßstab für die Wirksamkeit.",
  "schlagwoerter": ["kita", "betreuung"],
  "freigabe": { "datum": "2026-10-02", "quellen_bestaetigt": [401] },
  "ursachen": [
    { "id": 401, "beschreibung": "Zu wenige Fachkräfte", "quelle_url": "https://…", "ebene": "land" }
  ],
  "instrumente": [
    {
      "id": 6200,
      "name": "Quereinstieg mit Qualifizierung",
      "wirksamkeit": 2,
      "umsetzbarkeit": 3,
      "begruendung": "Ein bis zwei neutrale Sätze.",
      "evidenz": "gemischt"
    }
  ],
  "abdeckung": [
    {
      "partei_id": 1,
      "massnahmen": [
        {
          "id": 101,
          "beschreibung": "Was die Partei vorschlägt (sinngemäß, kurz)",
          "ursachen_ids": [401],
          "wirksamkeit": 2,
          "umsetzbarkeit": 2,
          "rollen_modifikator": { "angestellt": { "wert": 1, "begruendung": "…" } },
          "begruendung": "Ein bis zwei neutrale Sätze.",
          "zitat": "Wörtlich aus dem Programm, so wie es auf der Seite steht.",
          "beleg_programm_url": "https://…/wahlprogramm.pdf#page=17",
          "beleg_studie_url": "https://…",
          "evidenz": "gemischt",
          "stand": "2026-03-01",
          "geprueft": false
        }
      ]
    },
    {
      "partei_id": 1,
      "land": "ST",
      "landtagswahl": "2026-09-06",
      "massnahmen": [
        {
          "id": 102,
          "instrument": 6200,
          "beschreibung": "Seiteneinsteiger berufsbegleitend qualifizieren",
          "ursachen_ids": [401],
          "zitat": "…",
          "beleg_programm_url": "https://…/landeswahlprogramm.pdf#page=31",
          "stand": "2026-09-01",
          "geprueft": false,
          "ki_entwurf": true
        }
      ]
    },
    {
      "partei_id": 2,
      "keine_massnahme": {
        "begruendung": "Programm Stand 2026-01 durchsucht, Kapitel Familie enthält nichts dazu.",
        "stand": "2026-03-01",
        "geprueft": false
      }
    }
  ]
}
```

- **IDs:** siehe „IDs“ unten.
- `instrumente` (optional): gemeinsame Bewertung gleicher Lösungswege, siehe „Instrumente“. Optional `entspricht` (ID des Gegenstücks auf der anderen Ebene) und `schlagwoerter` (nur Mock). Eine Maßnahme mit `instrument` hat **keine** eigenen Felder `wirksamkeit`, `umsetzbarkeit`, `begruendung`, `evidenz`, `beleg_studie_url`, `rollen_modifikator` und `bewertung` – die kommen vom Instrument. Ein Instrument, auf das keine Maßnahme verweist, meldet die Prüfung (Warnung).
- `alltag` (optional, Ursachen): dieselbe Ursache in der Sprache der Betroffenen, in der Ich-Form und ohne Zahlen („Ich finde keine Hausarztpraxis, die neue Patienten nimmt“). Nur sie steht in der Auswahl zum Antippen; gewertet und belegt wird an `beschreibung`. Höchstens 160 Zeichen, lösungsoffen und ohne Parteinamen. Fehlt sie, zeigt die App `beschreibung`. Eine Änderung zählt nicht als Änderung der Ursache (keine neue Freigabe nötig).
- `ebene` (Pflicht bei Ursachen): `bund` oder `land` – wer vor allem zuständig ist. Bei `land` zählt das Landesprogramm, wenn Spielende ein Bundesland wählen; sonst das Bundesprogramm. Zuordnung und Begründung in [`docs/perspektiven-ursachen.md`](../docs/perspektiven-ursachen.md).
- `land` und `landtagswahl` (bei Abdeckungseinträgen): Eintrag aus dem Landesprogramm der Partei in diesem Land zu dieser Wahl. Ohne `land` ist es das Bundesprogramm. Je Thema, Partei und Programm höchstens ein Eintrag. Landeseinträge sind eine Ergänzung: „noch nicht erfasst“ bezieht sich auf das Bundesprogramm; für Landesursachen gibt es bei gewähltem Bundesland zusätzlich „noch nicht erfasst“ für das Land.
- `durchsucht_fuer` (bei Abdeckungseinträgen, von `npm run entwurf:eintragen` gesetzt): Ursachen, nach denen das Programm durchsucht wurde (bei Landeseinträgen nur Ursachen mit `ebene: land`). Fehlt eine Ursache, gilt sie für die Partei als „noch nicht erfasst“, und eine Runde mit ihr wird nicht gewertet. Ohne das Feld (ältere Einträge) gilt das Programm für alle Ursachen als durchsucht. Kommt eine Ursache zu einem Thema mit Abdeckung hinzu, verlangt die Prüfung bei Pull Requests das Feld an jedem aktuellen Eintrag, für den die Ursache zählt – mit der neuen Ursache erst, wenn das Programm danach durchsucht ist.
- `entwurf_herkunft` (bei Instrumenten und Maßnahmen ohne Instrument): `blind`, wenn die Entwurfswerte aus der Blindbewertung stammen (setzt `entwurf:eintragen`), `nicht_blind`, wenn jemand sie mit Kenntnis der Partei vergeben oder geändert hat. Fehlt bei Einträgen von vor dem 1. 10. 2026 (nicht blind entstanden). Werte mit `blind` dürfen sich nur durch die Prüfung ändern; wer sie anders ändert, setzt `nicht_blind` und begründet es im Pull Request (prüft die CI).
- `freigabe` (bei neuen Themen vor dem Erfassen Pflicht): Datum, an dem die Betreiberin Ziel und Ursachen freigegeben hat, und die Ursachen, deren Quellen sie im Original bestätigt hat. Trägt nur die Betreiberin ein (meist als letzter Commit im Pull Request der Phase A). `npm run ursachen:freigegeben` verlangt das Feld im Zielzweig und jede Ursache in `quellen_bestaetigt` – ein Merge allein ist keine Freigabe. Themen, die vor dem 2. 10. 2026 erfasst wurden, haben das Feld noch nicht. **KI-Freigabe** für die Testphase: `{ "datum": "…", "art": "ki" }` ohne `quellen_bestaetigt` – genügt `ursachen:freigegeben`, aber nicht für `geprueft` (siehe „Ablauf für ein neues Thema“).
- `pruefung` (bei `geprueft: true` Pflicht): `{ "belege_geprueft": "JJJJ-MM-TT" }` an jeder Maßnahme; bei `keine_massnahme` zusätzlich `"zweite_suche"`: Suchbegriffe, gelesene Kapitel und Abgleich mit der Treffermatrix. Siehe „Belegprüfung“.
- `treffer` (bei `keine_massnahme`, von `npm run entwurf:eintragen` gesetzt): Treffer aller Suchbegriffe in diesem Programm – Anhaltspunkt für die zweite Suche.
- `nachtraeglich` (optional, bei Ursachen): Wurde eine Ursache erst nach dem Blick in die Programme ergänzt, steht hier Datum und Grund. Das soll die Ausnahme bleiben und ist im Pull Request zu begründen (Verfahren: [`docs/methode.md`](../docs/methode.md) → „Nachträgliche Ursachen“). Nur so darf eine Ursache im selben Pull Request wie Maßnahmen des Themas dazukommen – und nur, wenn jeder aktuelle Abdeckungseintrag `durchsucht_fuer` angibt.
- `zitat` ist bei echten Daten Pflicht: der Satz aus dem Programm, auf den sich die Maßnahme stützt, wörtlich (Silbentrennungen am Zeilenende zusammengezogen). Es dient der Prüfung und kommt nicht in die Datenbank.
- `schlagwoerter` braucht nur die Offline-Analyse ohne KI; kleingeschrieben, Umlaute als ae/oe/ue.
- `beleg_programm_url` muss auf `programm_url` der Partei zeigen (bei Landeseinträgen auf die `url` des Landesprogramms), mit Seitenanker `#page=N`.
- `evidenz`: Stand der Forschung, siehe „Stand der Forschung“. Pflicht, bevor eine Maßnahme `geprueft` wird, und bei KI-Entwürfen.
- `ki_entwurf` (optional, bei Maßnahmen und `keine_massnahme`): `true`, wenn der Eintrag mit Hilfe einer KI erstellt wurde. Öffentlich zählt er wie jeder ungeprüfte Eintrag nicht („noch nicht erfasst“). In der **geschlossenen Testphase** (nur mit Zugangslink, siehe `supabase/EINRICHTEN.md`) zählt ein Eintrag, wenn jede Maßnahme darin geprüft oder KI-Entwurf ist – im Spiel deutlich als „vorläufige KI-Bewertung“ gekennzeichnet. Nach der menschlichen Prüfung bleibt das Feld als Herkunftsangabe stehen; entscheidend ist dann `geprueft`.
- `beleg_studie_url` ist optional.
- `bewertung` schreibt nur `npm run pruefung:uebernehmen` (siehe „Prüfung“), z. B. `{ "anzahl": 3, "median_w": 2, "median_u": 2, "spannweite": 1, "datum": "2026-10-05", "entwurf": [2, 3] }`. `wirksamkeit` und `umsetzbarkeit` müssen den Medianen entsprechen; `entwurf` hält die ursprünglichen Werte fest.
- `stand` darf nicht vor dem `programm_stand` der Partei liegen (bei Landeseinträgen: vor dem `stand` des Landesprogramms).

### `haltungen/NN-name.json` – eine Datei pro Haltung

Eine **Haltung** ist eine Wertfrage, über die man verschieden denken kann, als neutrale Ja/Nein-Frage. Sie bekommt **keine Punkte**: Die Haltungskarte zeigt nur, wo die Parteien dazu stehen (mit Zitat) und welche Ziele gegeneinander stehen (Regeln: [`docs/methode.md`](../docs/methode.md) → „Forderungen und Haltungen“, Plan: [`docs/plan-haltungen.md`](../docs/plan-haltungen.md), Teil B).

```json
{
  "id": 1,
  "frage": "Soll es ein generelles Tempolimit auf Autobahnen geben?",
  "beschreibung": "Ein neutraler Satz, worum es geht.",
  "verwandte_themen": [8],
  "zielkonflikte": [
    { "seite": "ja", "text": "Wer ein Tempolimit will, nennt …", "quelle_url": "https://…" },
    { "seite": "nein", "text": "Wer es ablehnt, nennt …", "quelle_url": "https://…" }
  ],
  "freigabe": { "datum": "2026-10-12" },
  "positionen": [
    {
      "partei_id": 11,
      "position": "teils",
      "kurzfassung": "Neutrale eigene Worte, höchstens 25 Wörter, ohne Parteinamen.",
      "zitat": "Wörtlich aus dem Programm.",
      "beleg_programm_url": "https://…/wahlprogramm.pdf#page=12",
      "stand": "2026-10-14",
      "geprueft": false,
      "ki_entwurf": true
    },
    {
      "partei_id": 12,
      "position": "keine_aussage",
      "begruendung": "Kapitel Verkehr durchsucht, Suchbegriffe Tempolimit, Höchstgeschwindigkeit, Autobahn – nichts gefunden.",
      "stand": "2026-10-14",
      "geprueft": false
    }
  ]
}
```

- **Zwei Phasen wie bei Themen.** Phase A: `frage` (endet mit „?“, nennt keine Partei), `beschreibung`, `verwandte_themen` (bestehende Themen-IDs, zum Antippen auf der Karte) und `zielkonflikte` – ohne Blick in die Programme, eigener Pull Request. Freigegeben ist Phase A, wenn die Betreiberin `freigabe.datum` einträgt; für die Testphase genügt `"art": "ki"` (wie bei Themen, dann auch beide Phasen in einem Pull Request mit eigenem Commit für Phase A, aber nichts `geprueft`). Zu Phase A gehört außerdem `einordnung` (`{ "ja", "teils", "nein" }`: wann ein Programm wie eingeordnet wird – Maßstab für die Einordnung ohne Parteinamen); `suchbegriffe` (Liste) sind die Begriffe für die Erfassung, gleich für alle Programme. Phase B: `positionen` aus allen sieben Bundesprogrammen, erst nach der Freigabe. Die Prüfung lehnt Phase A und Positionen derselben Haltung im selben Pull Request ab und verlangt nach einer Änderung von Phase A eine neue Freigabe.
- `zielkonflikte`: zwei bis vier Sätze, mindestens einer je `seite` (`ja`/`nein`), jeder mit unabhängiger `quelle_url` (Anforderungen wie bei Ursachen). Sie beschreiben, welche Ziele gegeneinander stehen, und entscheiden den Konflikt nicht.
- `position`: `ja` (klar dafür), `nein` (klar dagegen), `teils` (nur ein Teil oder unter Bedingungen – die Kurzfassung sagt, welcher) oder `keine_aussage` (durchsucht, nichts gefunden). Bei `ja`/`nein`/`teils` sind `kurzfassung`, `zitat` und `beleg_programm_url` (Programm der Partei mit `#page=`) Pflicht; bei `keine_aussage` nur `begruendung` (was durchsucht wurde). Je Partei höchstens eine Position; `stand` nicht vor dem `programm_stand`. Zunächst nur Bundesprogramme.
- Anders als bei Maßnahmen kommt das **Zitat in die Datenbank** und ist auf der Karte aufklappbar: Bei Haltungen ist der Wortlaut der eigentliche Beleg. `npm run zitate:pruefen` prüft es mit.
- `geprueft` nur mit `pruefung`: bei `ja`/`nein`/`teils` `{ "belege_geprueft": Datum, "einordnung_bestaetigt": n }` – die Betreiberin hat Zitat und Seite geprüft, und mindestens zwei Prüfende haben die Einordnung bestätigt, ohne die Partei zu sehen (nur das Zitat); bei `keine_aussage` `{ "belege_geprueft": Datum, "zweite_suche": "…" }`. `ki_entwurf` wie bei Maßnahmen: öffentlich zählt nur Geprüftes, Entwürfe erscheinen nur in der geschlossenen Testphase.
- **Alle sieben oder keine:** Die Karte erscheint erst, wenn jede Partei eine Position hat (sonst Warnung). Weniger als drei Programme mit erkennbarer Position (Aufnahmekriterium) meldet die Prüfung ebenfalls als Warnung.
- `schlagwoerter` (optional, nur für den Mock ohne KI): Wörter, an denen die Mock-Analyse eine Haltung dieser Frage zuordnet.
- **IDs:** eigener Nummernkreis 1, 2, … (`npm run daten:id -- --haltung`), nie wiederverwendet; eine entfernte Haltung kommt mit Grund in [`ids.json`](ids.json) → `haltungen_stillgelegt`.
- **Programm-Quiz:** Aus jeder Haltung, deren sieben Positionen geprüft sind, macht `npm run quiz:erzeugen` eine Quizfrage in `public/quiz/fragen.json` (Regeln: [`docs/plan-quiz.md`](../docs/plan-quiz.md)). Die Datei nicht von Hand ändern – nach einer Änderung an Haltungen neu erzeugen und mit einchecken; die automatische Prüfung meldet eine veraltete Datei.

### IDs

- **Einmal vergeben, nie wieder.** Gespielte Runden, Bewertungen der Prüfenden und Links verweisen auf IDs. Deshalb werden Einträge nicht gelöscht, sondern bleiben stehen – auch aus früheren Wahlperioden.
- **Maßnahmen und Instrumente** teilen sich einen fortlaufenden Nummernkreis ohne Bedeutung: `npm run daten:id` nennt die nächste freie Nummer. Die älteren IDs folgen noch der früheren Regel „Themen-ID × 1000 + laufende Nummer“; sie bleiben, wie sie sind.
- **Ursachen:** Themen-ID × 100 + laufende Nummer (je Thema reichen 99).
- **Haltungen:** eigener Nummernkreis 1, 2, … (`npm run daten:id -- --haltung`); stillgelegte stehen in `ids.json` → `haltungen_stillgelegt`.
- Muss ein Eintrag doch weg (etwa doppelt erfasst), kommt seine ID mit Grund in [`ids.json`](ids.json) → `stillgelegt`. Bei jedem Pull Request vergleicht die Prüfung die IDs mit dem Zielzweig: Verschwindet eine ID, ohne stillgelegt zu sein, oder steht sie plötzlich für etwas anderes (anderes Thema, andere Partei, anderes Programm), schlägt sie fehl.

## Erfassen

Werkzeuge für Schritt 2 und 3 des Ablaufs (neues Thema oder neues Programm). Sie brauchen Internet oder eine lokale Kopie des PDFs.

```bash
npm run programme:laden                                   # alle Programme in den Zwischenspeicher .cache/ (einmalig, ca. 1 Minute)
npm run programme:texte -- .cache/entwurf/17/texte        # Text aller aktuellen Programme als Textdateien mit Seitenmarken (zum Lesen mit Read/Grep)
npm run programme:suche -- "Wort" "Synonym"               # alle Programme auf einmal durchsuchen: Fundstellen + Übersicht je Programm
npm run programme:suche -- "Wort" "Synonym" --je-begriff --zaehlen   # Treffer je Begriff und Programm
npm run programme:suche -- "Wort" --land BE               # nur Landesprogramme von BE (--bund: nur Bund; --partei SPD; --zaehlen)
npm run programm:text -- <url|datei.pdf> --seiten 2-4     # nur diese Seiten (Inhaltsverzeichnis, ein Kapitel)
npm run programm:text -- <url|datei.pdf> auszug.txt       # Text mit Seitenmarken „===== Seite N =====“ (N = #page=N)
npm run programm:text -- <url|datei.pdf> --suche "Wort"   # Fundstellen mit Seite
npm run programm:sichern -- <url> [--datei kopie.pdf]     # Prüfsumme in parteien.json, Kopie im Internet Archive
npm run quelle:text -- <url> --suche "Wort"              # unabhängige Quelle (Studie, Statistik) als PDF lesen; Programmserver gesperrt
npm run daten:id                                          # nächste freie ID
npm run daten:pruefen                                     # Format, Instrumente, Belege
npm run zitate:pruefen -- --thema 4                       # Zitate gegen die PDFs
npm run zitate:pruefen -- --thema 4 --lokal pdfs/         # dasselbe mit lokalen PDFs (Zuordnung über die Prüfsumme)
npm run punkte -- 4                                       # Punkte je Partei und Ursache, Bund und jedes Land
npm run seed && npm run dashboard                         # Datenbank- und Dashboard-Dateien neu erzeugen
```

Reihenfolge beim Erfassen eines Programms: Programm in `parteien.json` eintragen und sichern → Text auslesen und nach den Ursachen des Themas durchsuchen → Maßnahmen mit Zitat eintragen, vorhandene Instrumente wiederverwenden (`instrumente` der Themendatei), neue anlegen → `daten:pruefen`, `zitate:pruefen`, `punkte` → Pull Request.

**Suchen statt ganze Programme lesen.** Alle Programme zusammen haben rund 7,6 Millionen Zeichen – zu viel, um sie für jedes Thema ganz zu lesen (auch für eine KI). Deshalb: je Ursache Suchbegriffe samt Synonymen festlegen, `programme:suche` über alle Programme laufen lassen, dann die Fundstellen und über das Inhaltsverzeichnis (`programm:text -- <url> --seiten …`) die passenden Kapitel lesen. Dieselben Begriffe für alle Parteien. Null Treffer allein reicht nicht für `keine_massnahme` – erst das passende Kapitel ansehen.

**Programme nie ins Repository.** Die PDFs und ihre Texte sind urheberrechtlich geschützt (Wahlprogramme sind keine amtlichen Werke). Sie liegen nur im Zwischenspeicher `.cache/` (in `.gitignore`), als vorübergehende Kopie zur Auswertung; ins Repository kommen nur URL, Prüfsumme, Seitenanker und kurze wörtliche Zitate. In Cloud-Sitzungen von Claude Code lädt `.claude/hooks/session-start.sh` die Programme beim Start automatisch – außer in Phase A (`npm run phase-a -- start`).

### Mit KI-Agenten

Für Claude Code liegen sechs Skills im Repository. Sie bauen den Katalog für die **geschlossene Testphase** auf: alles als KI-Entwurf mit KI-Freigabe, ohne menschliche Prüfschritte unterwegs; die menschliche Prüfung („Prüfung“ oben) folgt danach und ist Voraussetzung für die öffentliche Anzeige.

| Aufruf | Was | Wer arbeitet | Ergebnis |
| --- | --- | --- | --- |
| `/liste-einordnen liste.txt` (danach `… --ausfuehren`) | Liste von Äußerungen sortieren (Haltung, Forderung, Thema, Grenze, Pauschalurteil, Tatsache, Meta, doppelt), neutrale Vorschläge | die Koordination, Programme gesperrt | Tabelle `.cache/listen/…` (nicht im Repository) zum Bestätigen; danach verteilt an die Skills unten, umschriebene Beispiele für `docs/prompt-evaluation.md` |
| `/thema-anlegen Kita-Betreuung` (mehrere mit „;“, `--erfassen` für direkt weiter) | Ziel, Ursachen, Ebene, Perspektivenprüfung, Leitfaden mit Suchbegriffen | Agent `ursachen-recherche` – nur Web-Recherche, kein Zugriff auf Programme | Themendatei mit KI-Freigabe, eigener Commit |
| `/thema-erfassen 17` (mehrere IDs, optional `--bund`, `--land XX`) | Maßnahmen erfassen und ohne Parteinamen bewerten | je Programm ein Agent `programm-erfassung`; **ein** Agent `blind-bewertung`, der nur die Liste ohne Parteinamen sieht | Maßnahmen und Instrumente als KI-Entwurf, Pull Request |
| `/forderung-erfassen 2 "Mietendeckel"` | Lösungsweg nachtragen, nach dem bisher nicht gesucht wurde (Forderungskarte) | wie `/thema-erfassen`, nur für die neuen Suchbegriffe und nur in schon erfassten Programmen | Einträge ergänzt, neues oder vorhandenes Instrument |
| `/haltung-anlegen Wehrpflicht; Schuldenbremse` (`--liste`, `--erfassen`) | Frage, Beschreibung, Zielkonflikte, Maßstab der Einordnung, Suchbegriffe | je Haltung ein Agent `haltung-recherche` (parallel, Programme gesperrt) | Haltungsdateien mit KI-Freigabe, eigener Commit |
| `/haltung-erfassen 4 5 6` | Positionen aus den sieben Bundesprogrammen, alle Haltungen in einem Lauf | je Programm **ein** Agent `haltung-erfassung` für alle Fragen (nur Zitat und Seite); **ein** Agent `haltung-einordnung` ohne Parteinamen (Einordnung und Kurzfassung) | Positionen als KI-Entwurf |

Die Definitionen liegen in `.claude/skills/` und `.claude/agents/`. Was für die Neutralität zwingend ist, sichern Skripte ab, nicht nur die Anleitung:

```bash
npm run phase-a -- start "Kita-Betreuung"              # Phase A: Programme und .cache/ gesperrt (auch für Agenten); Ende: npm run phase-a -- ende
npm run themen:ueberblick                               # vorhandene Themen nur mit Ziel und Ursachen (für Phase A)
npm run themen:ueberblick -- --ohne 9                   # dasselbe ohne ein Thema – für dessen Neuanlage (/thema-anlegen <Thema> --neu <ID>)
npm run ursachen:freigegeben -- 17                      # bricht ab ohne „freigabe“ im Zielzweig oder wenn Ursachen bzw. Ziel verändert wurden
npm run entwurf:treffer -- erfassung.json --vorab      # vor den Aufträgen: Suchbegriffe mit vielen (Fehl-)Treffern in allen Programmen melden (außer begründeten in suchbegriffe_geprueft)
npm run entwurf:auftrag -- erfassung.json               # je Programm Textdatei und Auftrag: zulässige Ursachen, Leitfaden, Bündel, Treffer je Begriff, Fundstellen mit Seite
npm run entwurf:programm-pruefen -- protokoll/erfassung-SPD-Bund.txt   # Selbstprüfung des Agenten: Felder, Ebenen, Bündel, Zitat auf der Seite; speichert programme/SPD-Bund.json
npm run entwurf:zusammenfuehren -- erfassung.json       # geprüfte Ergebnisse je Programm in die Erfassung (nicht durchsuchte bleiben draußen); Vergleich mit dem vorherigen Stand
npm run entwurf:treffer -- erfassung.json               # zählt jeden Suchbegriff (je Ursache und Lösungsrichtung) in allen Programmen der Erfassung
npm run entwurf:blind -- erfassung.json                 # blind.json: ohne Parteinamen, Personen und Länder, gemischte Reihenfolge, stabile Kennungen M01 … (kennungen.json, meldet neu/entfallen/geändert), Prüfsumme gesamt und je Maßnahme; bricht bei zu vielen verdächtigen Resten ab
npm run entwurf:blind -- erfassung.json --teil bewertung-vorher.json   # Teil-Neubewertung: nur neue oder geänderte Kennungen bewerten lassen
npm run entwurf:bewertung-auftrag -- erfassung.json     # Auftrag an den Bewertungs-Agenten (zwei Pfade, Prüfsumme, Datum) nach protokoll/; frühere Fassungen ablegen, Liste archivieren
npm run blind:reste                                     # verdächtige Reste nach dem Neutralisieren über den ganzen Katalog
npm run entwurf:antwort-pruefen -- 17                   # Selbstprüfung des Bewertungs-Agenten: Antwort nur gegen blind.json (dieselben Regeln wie bewertung-pruefen)
npm run entwurf:json -- antwort.txt bewertung.json      # JSON-Objekt aus einer gespeicherten Agentenantwort holen (Fehler mit Zeile und Spalte)
npm run entwurf:bewertung-zusammenfuehren -- erfassung.json vorher.json teil.json bewertung.json   # Teil-Neubewertung mit der bisherigen zusammenführen; lehnt Abweichungen bei Unverändertem ab
npm run entwurf:bewertung-pruefen -- erfassung.json bewertung.json   # Prüfsumme der Blindliste, Ursachen je Kennung, Ebenen, unbenutzte Instrumente, Wirksamkeit 3, Hinweise, Bilanz der Zuordnung je Programm
npm run entwurf:eintragen -- erfassung.json bewertung.json   # verlangt protokoll/; nur bestätigte Ursachen, neue IDs, Beleg-Links, KI-Entwurf, durchsucht_fuer, entwurf_herkunft
npm run entwurf:bericht -- erfassung.json bewertung.json     # Datenteil der Pull-Request-Beschreibung (pr-daten.md), wörtlich aus den Arbeitsdateien
npm run entwurf:archivieren -- erfassung.json            # Protokolle, Stände, Kennungen, Blindliste und Bewertung nach daten/protokolle/<ID>/ (ohne Programmtexte)
npm run instrumente -- 2                                 # Ursachen und Instrumente eines Themas ohne Parteinamen (gibt es einen Lösungsweg schon?)
npm run liste:auswahl -- .cache/listen/….md [--art haltung|forderung|thema] [--evaluation]   # Einordnungstabelle prüfen, bestätigte Aufträge je Skill, Zeilen für die Prompt-Evaluation
npm run haltung:auftrag -- 4 5 6                         # Haltungen: je Bundesprogramm Textdatei und ein Auftrag für alle (.cache/haltung/lauf/)
npm run haltung:programm-pruefen -- .cache/haltung/lauf/protokoll/fund-SPD-Bund.json   # Selbstprüfung: je Haltung ein Fund, Zitat wörtlich auf der Seite; speichert .cache/haltung/<ID>/funde/
npm run haltung:blind -- 4 5 6                           # je Haltung blind.json ohne Parteinamen (Kennungen H1 …), kennungen.json für das Eintragen
npm run haltung:antwort-pruefen -- 4                     # Selbstprüfung des Agenten haltung-einordnung (je Haltung)
npm run haltung:eintragen -- 4 5 6                       # Positionen als KI-Entwurf (nicht unter drei erkennbaren, nie über geprüfte), Protokoll nach daten/protokolle/haltung-<ID>/
```

**Nachtrag eines Lösungswegs:** Steht in `erfassung.json` ein `nachtrag` (`{ "forderung": "…", "richtungen": { "<Ursache>": ["<Richtung>", …] } }`, Richtungen mit Suchbegriffen im Leitfaden), beschränken die Skripte Suchbegriffe, Ursachen und Aufträge auf diese Richtungen, beauftragen nur schon erfasste Programme (mit der Liste der bereits erfassten Zitate) und `entwurf:eintragen` ergänzt die vorhandenen Einträge, statt neue anzulegen.

**Windows/PowerShell 7:** npm verschluckt Optionen mit Wert (`--partei`, `--seiten`, `--ausgabe`, `--thema`), wenn das erste `--` nicht in Anführungszeichen steht. Schreibe dann `npm run programme:suche '--' "Wort" '--partei' SPD` oder rufe das Skript direkt auf (`node --experimental-strip-types scripts/entwurf/programme-suche.ts "Wort" --partei SPD`).

Formate der Arbeitsdateien (`Erfassung`, `Bewertung`) stehen in `scripts/entwurf.ts`; sie liegen in `.cache/entwurf/<Themen-ID>/` und kommen nicht ins Repository. Ins Repository kommt der **Erfassungsleitfaden** `daten/leitfaeden/<Themen-ID>.json` (Format `Leitfaden`): Regeln zur Abgrenzung und Zuordnung je Ursache, Bündellisten für breite Lösungsrichtungen und die **Suchbegriffe** je Ursache und Lösungsrichtung (`suchbegriffe`, gelten für Bund und Länder; begründete Ausnahmen der Vorabprüfung unter `suchbegriffe_geprueft`). Ebenfalls ins Repository kommen die **Protokolle** jedes Durchgangs (`daten/protokolle/<ID>/<Datum>-<Ebene>/`, von `entwurf:archivieren`): Erfassung, Stände nach Rückfragen, Kennungen, bewertete Blindliste, Bewertung und `protokoll/` – ohne Programmtexte und Aufträge. Er entsteht mit den Ursachen in Phase A, ohne Blick in die Programme, und gilt beim Erfassen und in der Bewertung für alle Programme gleich.

Was technisch abgesichert ist, damit Eingriffe des Koordinators (der die Parteien kennt) sichtbar bleiben:

- **Prüfsumme der Blindliste:** `blind.json` trägt eine `pruefsumme` über den ganzen Inhalt; der Bewertungs-Agent gibt sie als `blind_pruefsumme` zurück. Wird danach eine Beschreibung, ein Zitat, eine Seite, eine Ursachenzuordnung oder ein vorhandenes Instrument geändert, lehnen `entwurf:bewertung-pruefen` und `entwurf:eintragen` die Bewertung ab. Jede Maßnahme hat zusätzlich eine eigene Prüfsumme: Bei einer Teil-Neubewertung gilt nur als unverändert, was dieselbe Prüfsumme hat; Leitfaden, Ursachen und vorhandene Instrumente müssen gleich bleiben.
- **Stabile Kennungen:** `kennungen.json` ordnet Kennungen über den Inhalt zu (Partei, Land, Zitat), nicht über die Stelle in der Erfassung. Neue Maßnahmen bekommen fortlaufende Kennungen, entfallene werden nicht neu vergeben; `entwurf:blind` meldet jede Änderung als „neu / entfallen / geändert“.
- **Protokoll:** `entwurf:eintragen` verlangt neben der Erfassung den Ordner `protokoll/` mit `erfassung-<Partei>-<Bund|Land>.txt` (Antwort jedes Erfassungs-Agenten samt Protokoll, vom Agenten selbst geschrieben; Antworten auf Rückfragen daneben als `…-rueckfrage-N.txt`), `bewertung-auftrag.txt` (von `entwurf:bewertung-auftrag` geschrieben: Pfade von Liste und Antwort, Prüfsumme der Liste, Datum, ggf. Rückfrage – ohne Parteinamen), `bewertung-antwort.txt` (vom Bewertungs-Agenten selbst geschrieben) und `rueckfragen.md` (jede Rückfrage und jede Korrektur einer eigenen fehlerhaften Rückfrage mit Programm bzw. Kennung, Anlass und Ergebnis, sonst „keine“). Frühere Fassungen liegen als `bewertung-auftrag-N.txt` / `bewertung-antwort-N.txt` daneben, die bewerteten Listen als `blind-<Prüfsumme>.json`; frühere Stände der Erfassung in `staende/`.
- **Programmsperre:** Ein PreToolUse-Hook (`.claude/hooks/sperre.mjs`, Liste in [`gesperrte-adressen.json`](gesperrte-adressen.json)) weist WebFetch auf Partei-, Fraktions- und Stiftungsserver, die Server aller Programme und dieses Repository ab – auch bei Agenten. In Phase A (`npm run phase-a -- start`) sperrt er zusätzlich `.cache/` und alle Werkzeuge, die Programme lesen; der Sitzungsstart lädt dann keine Programme. Für den Agenten `blind-bewertung` (erkannt an `agent_type` in der Hook-Eingabe) erlaubt er nur `Read` auf `.cache/entwurf/<ID>/blind.json` und die eigene Antwort, `Write` auf `.cache/entwurf/<ID>/protokoll/bewertung-antwort.txt`, genau den Befehl `npm run -s entwurf:antwort-pruefen -- <ID>`, WebSearch und WebFetch – so liest er die Liste selbst, prüft seine Antwort selbst, und niemand muss Liste oder Antwort abschreiben.
- **Suchbegriffe je Lösungsrichtung:** `suchbegriffe` im Leitfaden (von dort in die Erfassung übernommen) ist `{ "<Ursache>": { "<Richtung>": ["Begriff", …] } }` mit den Richtungen aus der Spalte „Diagnose aus der Debatte“. `entwurf:blind` lehnt Ursachen ohne Richtung und Richtungen ohne Begriffe ab und verlangt die Treffermatrix (`entwurf:treffer`) zu genau diesen Begriffen. Hat ein Programm zu einer Ursache viele Treffer, aber keine Maßnahme, nennt der Erfassungs-Agent die gelesenen Seiten und den Grund in `nicht_erfasst` (Pflicht, sonst lehnt `entwurf:programm-pruefen` ab); fehlt das, gibt es einen Hinweis. Nennt ein Erfassungs-Agent eigene Synonyme, kommen sie in `suchbegriffe` und werden mit einem neuen Lauf in allen Programmen gezählt.
- **Blindliste:** Parteinamen samt Artikel und „Wir“ („Wir Freie Demokraten“, „Die LINKE“), Namen aus mehreren Wörtern ohne Rücksicht auf Groß- und Kleinschreibung, bekannte Personen, Länder, Städte und Landesorgane („Senat“, „Abgeordnetenhaus“) werden ersetzt. Wörter, die trotzdem auf eine Partei hindeuten können („liberal“, „Fraktion“, „Ampel“ …), meldet `entwurf:blind`; über einer Schwelle (3 oder 5 %) bricht es ab. Vorhandene Instrumente stehen mit Begründung, Forschungsstand und Quelle (`beleg_studie_url`) in der Liste: Für denselben Lösungsweg auf der anderen Ebene prüft die Bewertung diese Quelle zuerst, statt neu zu recherchieren.
- **Zuordnung blind entschieden:** Die Erfassung ordnet nach dem Leitfaden zu (`ursachen_ids`) und markiert Grenzfälle als `ursachen_offen`. Der Bewertungs-Agent nennt je Maßnahme die Ursachen, an denen sie ansetzt (`ursachen`, gewählt aus beiden Listen). Was er nicht nennt, trägt `entwurf:eintragen` nicht ein; eine Maßnahme ohne bestätigte Ursache entfällt (bleibt einem Programm keine, bekommt es `keine_massnahme`). So entscheidet über die Zuordnung – und damit, bei wie vielen Problemen eine Maßnahme Punkte holt – niemand, der die Partei kennt. `entwurf:bewertung-pruefen` gibt je Programm eine Bilanz aus (nicht bestätigt, offene bestätigt, verworfen), die in den Pull Request kommt. Hinweise gibt es, wenn er zusätzliche Ursachen sieht (zählen nicht), Maßnahmen desselben Instruments verschiedenen Ursachen zugeordnet sind oder ein Programm deutlich öfter mehreren Ursachen zugeordnet ist als die übrigen.
- **Bündel:** Nennt der Leitfaden für eine Ursache Bündel (Arten von Zusagen einer breiten Lösungsrichtung), erfasst jedes Programm je Bündel höchstens eine Maßnahme – die konkreteste Stelle, nicht die „beste“ – und nur für gleichartige Einzelzusagen. Eine zweite, verschiedene Zusage bleibt ohne Bündel oder bekommt ein neues. Bündel begrenzen nur den Aufwand: Je Instrument zählt nur eine Maßnahme, eine zusätzliche gleichartige bringt keinen Punkt. Verschiedene Instrumente zur selben Ursache zählen dagegen mit abnehmendem Gewicht (bester Weg voll, dann ½, ¼ …, höchstens 9; `docs/methode.md` → „Mehrere Lösungswege je Ursache“) – eine zweite, *verschiedene* Zusage nicht weglassen. Maßnahmen ohne Bündel stehen nur zur Information im Pull Request. Welche Maßnahmen denselben Lösungsweg haben, entscheidet die Bewertung ohne Parteinamen über das Instrument (`instrument`); eine Maßnahme ohne Instrument zählt als eigener Weg. `entwurf:zusammenfuehren` meldet nach jeder Rückfrage entfallene oder vermutlich zusammengefasste Maßnahmen und Ursachen, die keine Maßnahme mehr haben. Die Liste deckt alle Richtungen ab (Ausbau wie Rücknahme) und ist offen: Ein neues Instrument meldet ein Agent, es gilt dann für alle Programme. Die Prüfung lehnt unbekannte und doppelte Bündel ab und weist auf viele ungebündelte Maßnahmen an einer solchen Ursache hin.
- **Modelle:** Die Erfassungs-Agenten laufen mit der nächstkleineren Stufe der Modellfamilie des Koordinators, wenn die Umgebung das erlaubt (in Claude Code `opus` → `sonnet`, nie automatisch die kleinste Stufe); die Bewertung mit dem Modell des Koordinators. Alle Programme eines Durchlaufs werden mit demselben Modell erfasst. Die Modelle stehen in `protokoll/rueckfragen.md` und im Pull Request.
- **Selbstprüfung und Aufträge:** `entwurf:auftrag` gibt jedem Erfassungs-Agenten nur sein Programm, die zulässigen Ursachen, den Leitfaden und die Fundstellen – keine Ergebnisse anderer Programme. Ursachen mit vielen Treffern stehen als Pflicht im Auftrag. `entwurf:programm-pruefen` prüft vor der Abgabe, ob jedes Zitat auf der angegebenen PDF-Seite steht, und gibt den Kurzbericht in fester Form aus (Zahlen nur aus der Datei).
- **Zahlen:** Steht in einer Beschreibung eine Zahl, die das Zitat nicht enthält, lehnt `entwurf:blind` ab (im Katalog: Warnung).
- **Programmfassung:** `programme:texte`, `programme:suche` und `programm:text` lesen nur die Fassung mit der Prüfsumme aus `parteien.json`; bei Abweichung gilt das Programm als nicht durchsucht. `programme:texte` nennt Seiten fast ohne Text (Bilder, Scans). Ein Programm, das ein Agent nicht laden konnte, wird ausgelassen (bleibt „noch nicht erfasst“) und nie als „keine Maßnahme“ eingetragen.

## Neue Wahlperiode

**Landtagswahl:** Programme werden erfasst, sobald sie beschlossen sind; bis zur Wahl zählt weiter das Programm der laufenden Wahlperiode.

1. Neue Einträge unter `landesprogramme` mit der neuen `landtagswahl` anlegen und sichern (`npm run programm:sichern`). Die alten bleiben stehen.
2. Maßnahmen als **neue Abdeckungseinträge** mit neuer `landtagswahl` und **neuen IDs** erfassen. Unveränderte Lösungswege verweisen auf dasselbe Instrument – die Bewertung ist damit schon da, zu prüfen sind nur neue Instrumente und die Belege.
3. Nach der Wahl `letzte_wahl` des Landes ändern. Ab dann zählen die neuen Einträge, die alten nicht mehr. Fehlt für eine Partei das neue Programm, warnt die Prüfung, und das Land gilt für sie als „noch nicht erfasst“.

**Bundestagswahl:** Bis jetzt gibt es nur ein Bundesprogramm je Partei (`programm_url`). Vor der nächsten Bundestagswahl (spätestens 2029) wird das Format nach dem Muster der Länder erweitert (Programm je Wahl, alte Einträge bleiben stehen); bis dahin gilt „Kommt ein neues Programm hinzu“ unter „Programme“.

## Was die automatische Prüfung kontrolliert

- Pflichtfelder, Wertebereiche, Datumsformat, keine unbekannten Felder (Tippfehler)
- eindeutige IDs und Namen; Maßnahmen und Instrumente in einem Nummernkreis; keine stillgelegte ID wiederverwendet; bei Pull Requests: keine ID entfernt oder umgewidmet
- **Instrumente:** Verweis auf ein Instrument desselben Themas, keine doppelten Bewertungsfelder an der Maßnahme, ein Instrument nur für eine Ebene
- jede Ursache mit https-Quelle; Maßnahmen verweisen nur auf Ursachen ihres Themas
- Beleg zeigt ins Programm der richtigen Partei, mit Seitenanker; bei echten Daten ein wörtliches Zitat
- **Abdeckung:** jede Partei höchstens einmal pro Thema und Programm – mit Maßnahmen oder `keine_massnahme`; fehlende Parteien (Bundesprogramm) werden als „noch nicht erfasst“ gemeldet (Warnung)
- **Bund und Länder:** jede Ursache mit `ebene`; Landeseinträge nur mit eingetragenem Landesprogramm, Beleg in diesem Programm und nur für Ursachen mit `ebene: land`; Programme früherer Wahlperioden bleiben stehen, zählen aber nicht; fehlt das Programm zur letzten Wahl, gibt es eine Warnung
- **Stand der Forschung:** Wirksamkeit 3 nur mit `evidenz: belegt` (Warnung ohne Studie); `geprueft` nur mit `evidenz`; Rollen-Modifikatoren, die ohne belegte Wirkung auf 3 heben würden (Warnung, zählen bis 2)
- **Abdeckung je Ursache:** `durchsucht_fuer` nur mit Ursachen des Themas (bei Landeseinträgen nur Landesursachen); Maßnahmen nur zu durchsuchten Ursachen; bei Pull Requests: neue Ursache in einem Thema mit Abdeckung → `durchsucht_fuer` an jedem aktuellen Eintrag, für den sie zählt
- **Blindbewertung:** bei Pull Requests keine geänderten Werte an Einträgen mit `entwurf_herkunft: blind` außer durch die Prüfung
- **Phasen getrennt:** bei Pull Requests nicht Ursachen oder Ziel und Maßnahmen (Abdeckung, Instrumente) desselben Themas zugleich – außer eine neue Ursache mit `nachtraeglich` und `durchsucht_fuer` an jedem aktuellen Eintrag; neue oder geänderte Ursachen und Ziele nennen keine Partei
- **Nachweis der Prüfung:** `geprueft` nur mit `pruefung.belege_geprueft` (bei `keine_massnahme` mit `zweite_suche`); jede `bewertung` passt zu einem Export in `pruefungen/` (Anzahl, Mediane, Spannweite, Einzelwerte)
- **Freigabe:** `freigabe.quellen_bestaetigt` nur mit Ursachen des Themas (verlangt von `ursachen:freigegeben`)
- **Haltungen:** Frage mit „?“ und ohne Parteinamen, verwandte Themen vorhanden, zwei bis vier Zielkonflikte mit mindestens einem je Seite und https-Quelle; Positionen erst nach `freigabe`, höchstens eine je Partei, Pflichtfelder je Positionswert, Beleg im Programm der Partei mit Seitenanker, `stand` nicht vor dem Programm, Kurzfassung höchstens 25 Wörter ohne Parteinamen, `geprueft` nur mit Nachweis (Belege, zwei blinde Bestätigungen bzw. zweite Suche); fehlende Parteien und weniger als drei erkennbare Positionen als Warnung; bei Pull Requests keine Haltung entfernt ohne Stilllegung und Phase A und Positionen nicht zugleich
- Zahlen in Beschreibungen, die nicht im Zitat stehen (Warnung)
- Einträge sind nicht älter als das aktuelle Programm
- bei echten Daten: keine Platzhalter-Links (example.org); Warnung für ungeprüfte Einträge (die im Spiel „noch nicht erfasst“ sind)
- bei echten Daten: `geprueft: true` nur mit mindestens zwei Bewertungen (`bewertung.anzahl`), Werte gleich den Medianen
- `supabase/seed.sql` passt zum Katalog
- bei echten Daten: Prüfsumme je Programm (sonst Warnung)
- **Zitate** (eigener Ablauf, lädt die Programme herunter): Jedes `zitat` (Maßnahmen und Positionen zu Haltungen) steht auf der Seite, auf die `beleg_programm_url` zeigt – verglichen ohne Leerzeichen, Satzzeichen und Silbentrennung, Auslassungen als „[…]“. Steht es auf einer anderen Seite, nennt die Prüfung die richtige. Ist ein Parteiserver aus GitHub Actions nicht erreichbar, nimmt sie die Kopie auf web.archive.org; fehlt auch die, bleiben die Zitate dieses Programms ungeprüft (Warnung am Lauf) – dann `npm run zitate:pruefen` von einem normalen Internetanschluss aus starten oder mit `--lokal`. Weicht eine Datei von der Prüfsumme ab, warnt sie (Programm ausgetauscht?). Auslassungen über 200 Zeichen, Teile unter 20 Zeichen und einschränkende Wörter im ausgelassenen Text meldet sie als Hinweis (kein Fehler) – nachzusehen in der Prüfliste. Montags läuft sie ohne Zwischenspeicher und sichert fehlende Programme im Internet Archive.

```bash
npm run daten:pruefen              # Dateien prüfen
npm run daten:pruefen -- --links   # zusätzlich alle Links abrufen
npm run seed                       # supabase/seed.sql neu erzeugen
npm run dashboard                  # zusätzlich Dateien fürs Supabase-Dashboard
npm run pruefung:uebernehmen -- export.json   # Ergebnis der Prüfung übernehmen
npm run zitate:pruefen             # Zitate gegen die Programm-PDFs prüfen (braucht Internet)
npm run daten:id -- --gegen origin/main       # IDs, neue Ursachen, Phasen und Blindwerte mit einem anderen Stand vergleichen
npm run daten:id -- --haltung                 # nächste freie ID für eine Haltung
```

Werkzeuge zum Erfassen: siehe „Erfassen“.
