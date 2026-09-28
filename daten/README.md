# Datenkatalog

Hier liegen alle Daten, aus denen das Politik-Duell Punkte vergibt: Parteien, Themen, Ursachen und Maßnahmen. Die KI liest diese Daten nur, um ein Problem einem Thema und seinen Ursachen zuzuordnen. **Punkte und Links kommen ausschließlich von hier.**

Lizenz: [CC BY 4.0](LICENSE) für Auswahl, Struktur, Ursachen, Bewertungen und Begründungen. Die wörtlichen Zitate aus Wahlprogrammen und die verlinkten Quellen sind davon nicht erfasst. Mit einem Pull Request stellst du deinen Beitrag unter dieselbe Lizenz.

Änderungen laufen per Pull Request mit Quellenpflicht. Jeder Pull Request wird automatisch geprüft (`npm run daten:pruefen`).

> **Echte Daten, im Aufbau.** Parteien und Programme siehe unten („Programme“). Maßnahmen sind bisher nur für Miete erfasst und noch nicht geprüft – im Spiel gilt deshalb vorerst alles als „noch nicht erfasst“.
>
> Die fiktiven Beispieldaten für „Mit Beispieldaten spielen“ und die Tests liegen getrennt in [`beispiel/`](beispiel/) und werden nicht weiter gepflegt.

## Ablauf für ein neues Thema

Die Reihenfolge ist wichtig für die Neutralität.

1. **Thema und Ursachen festlegen – ohne Blick in die Wahlprogramme.**
   Ursachen beschreiben, *warum* das Alltagsproblem besteht. Jede Ursache braucht eine unabhängige Quelle (z. B. Statistisches Bundesamt, Sachverständigenrat, Bundesbank, wissenschaftliche Studie). Keine Parteiquellen, keine Quellen von Lobbyverbänden als einzige Quelle.
   Ursachen **lösungsoffen** formulieren (was schiefläuft, nicht wie es zu beheben ist), Quellen unterschiedlicher Ausrichtung heranziehen und eine **Perspektivenprüfung** machen: Kommen die in der Fachdebatte vertretenen Problemdiagnosen in mindestens einer belegten Ursache vor? Ergebnis, Zuständigkeitsebene (Bund oder Land) und verworfene Kandidaten in [`docs/perspektiven-ursachen.md`](../docs/perspektiven-ursachen.md) festhalten (Regeln: [`docs/methode.md`](../docs/methode.md) → „Ursachen“).
   Eigener Pull Request, damit die Ursachen feststehen, bevor Maßnahmen dazukommen. Die Themendatei enthält dann noch keine `abdeckung` – das Thema gilt für alle Parteien als „noch nicht erfasst“.
2. **Maßnahmen aus den Programmen erfassen.**
   Für **jede** Partei entweder Maßnahmen mit **wörtlichem Zitat** (`zitat`) und Seitenanker eintragen oder ausdrücklich `keine_massnahme` mit kurzer Begründung („Programm Stand … durchsucht, Kapitel … enthält nichts zu …“). Neue Einträge haben `"geprueft": false`. Nur Maßnahmen aufnehmen, die an einer der erfassten Ursachen ansetzen. Ursachen werden dafür grundsätzlich nicht nachträglich ergänzt; Ausnahmen (bisher: Miete, Ursache 204) sind mit `nachtraeglich` gekennzeichnet.
3. **Entwurf bewerten** nach dem Maßstab unten, möglichst **ohne Parteinamen** (Maßnahmentext allein beurteilen). Die Entwurfswerte sind die „Empfehlung“, die Prüfende erst nach ihrer eigenen Bewertung sehen.
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
2. **Bewerten:** Die Person willigt ein und bewertet in der App (`#/pruefen/…`) jede Maßnahme des Themas: ohne Parteinamen, in gemischter Reihenfolge, ohne die Bewertungen der anderen zu sehen. Die Empfehlung (Entwurfswerte und Begründung) wird erst nach der eigenen Bewertung sichtbar; Änderungen danach werden vermerkt. Am Ende „Absenden“.
3. **Auswerten:** Admin → „Prüfung“ → „Auswertung“ zeigt je Maßnahme alle Einzelwerte, Median Wirksamkeit, Median Umsetzbarkeit, Punkte (= Median W × Median U) und Spannweite. Es zählen nur abgesendete Bewertungen nicht gesperrter Einladungen.
4. **Übernehmen:** „Export (ohne Namen)“ herunterladen, dann `npm run pruefung:uebernehmen -- <export.json>`. Das Skript schreibt die Mediane als `wirksamkeit`/`umsetzbarkeit` und hält in `bewertung` Anzahl, Mediane, Spannweite, Datum und die ursprünglichen Entwurfswerte fest. Die Exportdatei selbst gehört nicht ins Repo.

Regeln:

- **Mindestens 2, besser 3** unabhängige Bewertungen je Thema. Bei echten Daten darf eine Maßnahme erst mit `bewertung.anzahl` ≥ 2 `geprueft: true` sein (prüft `npm run daten:pruefen`).
- **Median je Kriterium**, Punkte erst daraus. Bei gerader Anzahl mit zwei verschiedenen mittleren Werten (z. B. 2,5) entscheidet die Betreiberin zwischen diesen beiden, trägt den Wert in der Exportdatei ein und begründet es im Pull Request – das Skript nimmt vorher nichts an.
- **Spannweite ≥ 2:** vor der Übernahme klären – Maßstab hier präzisieren oder bei den Prüfenden nachfragen. Danach übernehmen mit `--geklaert`.
- **Namen nie ins Repo.** Im Datenkatalog stehen nur Anzahl, Median, Spannweite und Datum; die Zuordnung Person ↔ Bewertung bleibt in Supabase. Die Methodenseite nennt Namen nur von Personen, die der öffentlichen Nennung zugestimmt haben, sonst „von n unabhängigen Prüfenden“.
- **Löschen:** Auf Wunsch die Einladung in der Admin-Ansicht löschen (löscht alle Bewertungen der Person) – oder die Person widerruft selbst auf der Prüfseite.

### Belegprüfung durch die Betreiberin

`npm run pruefliste -- <Themen-ID>` erzeugt `pruefung/<nr>-<thema>.html` (nicht im Repo) – im Browser öffnen, Eingaben bleiben dort gespeichert. Durchgang A (eigene Bewertung ohne Parteinamen) ist durch die Bewertung in der App ersetzt; maßgeblich ist:

1. **Durchgang B – Belege.** Je Maßnahme: Link öffnet die richtige Seite · Zitat steht dort wörtlich · Kurzbeschreibung gibt es richtig wieder · passt zu den Ursachen · Begründung neutral. Bei `keine_massnahme`: Stichprobe mit der PDF-Suche.
2. **Ergebnis** mit „Zusammenfassung kopieren“ als Kommentar in den Pull Request; Einwände als Zeilenkommentar. Sind Bewertung übernommen und alle Belege einer Partei in Ordnung, `geprueft: true` setzen – erst dann zählt das Thema für diese Partei.

## Programme

Grundlage sind die Wahlprogramme zur Bundestagswahl 2025. Neuere Grundsatzprogramme gibt es bisher bei keiner der Parteien (Stand September 2026: SPD, FDP und Linke wollen 2027 neue beschließen; CDU 2024, Grüne 2020, AfD 2016). Kommt ein neues Programm hinzu, `programm_url` und `programm_stand` anpassen – die Prüfung meldet dann alle älteren Einträge zur Neuprüfung.

| ID | Partei | Programm | Beschluss |
| --- | --- | --- | --- |
| 11 | CDU/CSU | [Politikwechsel für Deutschland](https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf) | 17. 12. 2024 |
| 12 | SPD | [Mehr für Dich. Besser für Deutschland.](https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf) | 11. 1. 2025 |
| 13 | Bündnis 90/Die Grünen | [Zusammen wachsen](https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf) (Fassung vom 18. 3. 2025) | 26. 1. 2025 |
| 14 | FDP | [Alles lässt sich ändern](https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf) | 9. 2. 2025 |
| 15 | AfD | [Zeit für Deutschland](https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf) | 12. 1. 2025 |
| 16 | Die Linke | [Alle wollen regieren. Wir wollen verändern.](https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf) | 18. 1. 2025 |
| 17 | BSW | [Unser Land verdient mehr!](https://bsw-vg.de/wp-content/themes/bsw/assets/downloads/BSW%20Wahlprogramm%202025.pdf) | 12. 1. 2025 |

Seitenanker `#page=N` zählen PDF-Seiten, nicht die gedruckten Seitenzahlen. Die IDs 1–5 waren fiktive Parteien und werden nicht wiederverwendet. Das BSW heißt ab 1. 10. 2026 „Bündnis Soziale Gerechtigkeit und Wirtschaftliche Vernunft“; die Abkürzung bleibt.

## Themenauswahl

Welche Themen in den Katalog kommen, richtet sich danach, was Menschen selbst als wichtigste Probleme nennen – nicht nach den Schwerpunkten einzelner Parteien. Grundlage für die zehn Themen (Stand September 2026) sind die Umfragen vor den Wahlen 2026:

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

Noch nicht aufgenommen, Kandidaten für später: soziale Ungerechtigkeit/Armut (MV 8 %), Verwaltung und Bürgeramt-Termine sowie Müll (Berlin, im Wahlkampf genannt), Abwanderung junger Menschen und Kita-Betreuung (Sachsen-Anhalt). Häufige Einträge in der Review-Warteschlange sind ein weiterer Hinweis.

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

### Umsetzbarkeit (0–3): Ist die Maßnahme realistisch?

Gemeint ist: Könnte die Regierung der Ebene, aus deren Programm die Maßnahme stammt (Bund oder Land), sie in einer Wahlperiode rechtlich und finanziell umsetzen? Ob die Maßnahme politisch mehrheitsfähig ist, spielt keine Rolle.

| Wert | Bedeutung |
| --- | --- |
| 0 | rechtlich oder finanziell derzeit nicht umsetzbar (z. B. verfassungs- oder EU-rechtswidrig) |
| 1 | nur mit großen Hürden umsetzbar (z. B. Verfassungsänderung, ungeklärte Finanzierung) |
| 2 | umsetzbar mit Aufwand oder in mehreren Jahren |
| 3 | rechtlich möglich, finanziert und innerhalb einer Wahlperiode realistisch |

### Rollen-Modifikator (−2 bis +2, optional)

Nur wenn eine Maßnahme für eine Rolle nachweislich deutlich besser oder schlechter wirkt (z. B. Mietrecht für Mieter:innen vs. Eigentümer:innen). Immer mit Begründung. Rollen: `mieter`, `eigentuemer`, `angestellt`, `selbststaendig`, `rentner`, `arbeitslos`, `studierend`, `vermoegend`.

### Stand der Forschung

Feld `evidenz`: `belegt` (übereinstimmende Studien oder Erfahrungen anderswo), `gemischt` (Studien kommen zu unterschiedlichen Ergebnissen) oder `offen` (kaum untersucht). Wirksamkeit 3 nur mit `belegt`; bei `gemischt` oder `offen` höchstens 2, und die Begründung nennt beide Seiten. Das Spiel zeigt „Wirkung in der Forschung umstritten“ bzw. „Wirkung bisher kaum untersucht“ an. Ergibt die Prüfung einen Median von 3 bei nicht belegter Wirkung, meldet `npm run pruefung:uebernehmen` einen Fehler – dann Forschungsstand klären oder die Wirksamkeit begründet auf 2 setzen.

### Begründung

Ein bis zwei neutrale Sätze: was dafür, was dagegen spricht. Keine Wertung der Partei, nur der Maßnahme.

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
      "programm_stand": "2026-01-01"
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
        { "land": "ST", "landtagswahl": "2026-09-06", "url": "https://…/landeswahlprogramm.pdf", "stand": "2026-03-14" },
        { "land": "MV", "landtagswahl": "2026-09-20", "kein_programm": "Zur Landtagswahl nicht angetreten." }
      ]
    }
  ]
}
```

- `laender` nennt nur Länder, für die Landesprogramme erfasst werden, mit dem Datum der letzten Landtagswahl. In der App stehen sie zur Wahl, sobald für das Land mindestens ein Eintrag geprüft ist.
- Je Partei und Land höchstens ein Eintrag: das Programm zur letzten Wahl (`url`, Beschlussdatum `stand`) oder `kein_programm` mit Begründung (nicht angetreten, kein Programm veröffentlicht). Fehlt der Eintrag, gilt das Land für die Partei als „noch nicht erfasst“.
- **Laufende Wahlperiode:** Nach einer neuen Landtagswahl `letzte_wahl` ändern. Ältere Programme zählen dann automatisch nicht mehr (Warnung), bis das neue eingetragen ist.

### `themen/NN-name.json` – eine Datei pro Thema

```json
{
  "id": 4,
  "name": "Kita-Plätze",
  "beschreibung": "Kurzer neutraler Satz.",
  "ziel": "Was sich für die Betroffenen ändern soll – Maßstab für die Wirksamkeit.",
  "schlagwoerter": ["kita", "betreuung"],
  "ursachen": [
    { "id": 401, "beschreibung": "Zu wenige Fachkräfte", "quelle_url": "https://…", "ebene": "land" }
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
      "massnahmen": [
        { "id": 102, "…": "wie oben, Beleg im Landesprogramm, nur Ursachen mit \"ebene\": \"land\"" }
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

- **IDs** sind im ganzen Katalog eindeutig und ändern sich nie (gespielte Runden verweisen darauf). Konvention für Ursachen: Themen-ID × 100 + laufende Nummer; für Maßnahmen: Themen-ID × 1000 + laufende Nummer (Miete: 2001, 2002 …).
- `ebene` (Pflicht bei Ursachen): `bund` oder `land` – wer vor allem zuständig ist. Bei `land` zählt das Landesprogramm, wenn Spielende ein Bundesland wählen; sonst das Bundesprogramm. Zuordnung und Begründung in [`docs/perspektiven-ursachen.md`](../docs/perspektiven-ursachen.md).
- `land` (bei Abdeckungseinträgen): Eintrag aus dem Landesprogramm der Partei in diesem Land. Ohne `land` ist es das Bundesprogramm. Je Thema, Partei und Programm höchstens ein Eintrag. Landeseinträge sind eine Ergänzung: „noch nicht erfasst“ bezieht sich auf das Bundesprogramm; für Landesursachen gibt es bei gewähltem Bundesland zusätzlich „noch nicht erfasst“ für das Land.
- `nachtraeglich` (optional, bei Ursachen): Wurde eine Ursache erst nach dem Blick in die Programme ergänzt, steht hier Datum und Grund. Das soll die Ausnahme bleiben und ist im Pull Request zu begründen.
- `zitat` ist bei echten Daten Pflicht: der Satz aus dem Programm, auf den sich die Maßnahme stützt, wörtlich (Silbentrennungen am Zeilenende zusammengezogen). Es dient der Prüfung und kommt nicht in die Datenbank.
- `schlagwoerter` braucht nur die Offline-Analyse ohne KI; kleingeschrieben, Umlaute als ae/oe/ue.
- `beleg_programm_url` muss auf `programm_url` der Partei zeigen (bei Landeseinträgen auf die `url` des Landesprogramms), mit Seitenanker `#page=N`.
- `evidenz`: Stand der Forschung, siehe „Stand der Forschung“. Pflicht, bevor eine Maßnahme `geprueft` wird, und bei KI-Entwürfen.
- `ki_entwurf` (optional, bei Maßnahmen und `keine_massnahme`): `true`, wenn der Eintrag mit Hilfe einer KI erstellt wurde. Öffentlich zählt er wie jeder ungeprüfte Eintrag nicht („noch nicht erfasst“). In der **geschlossenen Testphase** (nur mit Zugangslink, siehe `supabase/EINRICHTEN.md`) zählt ein Eintrag, wenn jede Maßnahme darin geprüft oder KI-Entwurf ist – im Spiel deutlich als „vorläufige KI-Bewertung“ gekennzeichnet. Nach der menschlichen Prüfung bleibt das Feld als Herkunftsangabe stehen; entscheidend ist dann `geprueft`.
- `beleg_studie_url` ist optional.
- `bewertung` schreibt nur `npm run pruefung:uebernehmen` (siehe „Prüfung“), z. B. `{ "anzahl": 3, "median_w": 2, "median_u": 2, "spannweite": 1, "datum": "2026-10-05", "entwurf": [2, 3] }`. `wirksamkeit` und `umsetzbarkeit` müssen den Medianen entsprechen; `entwurf` hält die ursprünglichen Werte fest.
- `stand` darf nicht vor dem `programm_stand` der Partei liegen (bei Landeseinträgen: vor dem `stand` des Landesprogramms).

## Was die automatische Prüfung kontrolliert

- Pflichtfelder, Wertebereiche, Datumsformat, keine unbekannten Felder (Tippfehler)
- eindeutige IDs und Namen
- jede Ursache mit https-Quelle; Maßnahmen verweisen nur auf Ursachen ihres Themas
- Beleg zeigt ins Programm der richtigen Partei, mit Seitenanker; bei echten Daten ein wörtliches Zitat
- **Abdeckung:** jede Partei höchstens einmal pro Thema und Programm – mit Maßnahmen oder `keine_massnahme`; fehlende Parteien (Bundesprogramm) werden als „noch nicht erfasst“ gemeldet (Warnung)
- **Bund und Länder:** jede Ursache mit `ebene`; Landeseinträge nur mit eingetragenem Landesprogramm, Beleg in diesem Programm und nur für Ursachen mit `ebene: land`; Programme früherer Wahlperioden zählen nicht (Warnung)
- **Stand der Forschung:** Wirksamkeit 3 nur mit `evidenz: belegt`; `geprueft` nur mit `evidenz`
- Einträge sind nicht älter als das aktuelle Programm
- bei echten Daten: keine Platzhalter-Links (example.org); Warnung für ungeprüfte Einträge (die im Spiel „noch nicht erfasst“ sind)
- bei echten Daten: `geprueft: true` nur mit mindestens zwei Bewertungen (`bewertung.anzahl`), Werte gleich den Medianen
- `supabase/seed.sql` passt zum Katalog
- **Zitate** (eigener Ablauf, lädt die Programme herunter): Jedes `zitat` steht auf der Seite, auf die `beleg_programm_url` zeigt – verglichen ohne Leerzeichen, Satzzeichen und Silbentrennung, Auslassungen als „[…]“. Steht es auf einer anderen Seite, nennt die Prüfung die richtige.

```bash
npm run daten:pruefen              # Dateien prüfen
npm run daten:pruefen -- --links   # zusätzlich alle Links abrufen
npm run seed                       # supabase/seed.sql neu erzeugen
npm run dashboard                  # zusätzlich Dateien fürs Supabase-Dashboard
npm run pruefung:uebernehmen -- export.json   # Ergebnis der Prüfung übernehmen
npm run zitate:pruefen             # Zitate gegen die Programm-PDFs prüfen (braucht Internet)
```
