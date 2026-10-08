## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Union | 4 → 4 |
| SPD | 3 → 3 |
| Grüne | 6 → 6 |
| FDP | 4 → 4 |
| AfD | 4 → 4 |
| Linke | 3 → 3 |
| BSW | 1 → 1 |
| Volt | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2101 SPD, BSW; 2103 AfD, Linke, BSW.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2101  2102  2103
Union-Bund        14     6     0
SPD-Bund          26    19     2
Grune-Bund        43    47     0
FDP-Bund           8     6     1
AfD-Bund          17     5     0
Linke-Bund        17    21     0
BSW-Bund           7     5     0
Volt-Bund         56    10     0
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
SPD-Bund 2101 (S. 26, 27, 21): Keine Zusage zu Höhe oder Bemessung der Grundsicherung; nur allgemeines Ziel 'armutsfeste, unbürokratische Geldleistungen' und Bekenntnis zum Bürgergeld-Prinzip.
BSW-Bund 2101 (S. 21, 22, 32): Bürgergeld soll durch 'faire Grundsicherung' ersetzt werden, ohne Aussage zu Höhe oder Bemessung; Mindestlohn und Mitwirkungspflichten gehören zu anderen Themen/Haltung.
BSW-Bund 2103 (S. 22, 32): Keine Zusage zu Zugang, Beantragung oder automatischer Auszahlung gefunden.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 28 Kennungen, Prüfsumme `fa1bd8e19f7e763f14d2ae73a7dcccc57c131808d3724676c2a4318af5823060`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 6 Maßnahmen, 7 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 4 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M03 2101); offene bestätigt 0; verworfen 0
Zuordnung: Linke (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 3 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
Instrument I3: Maßnahmen mit unterschiedlichen Ursachen (M10 2102, M23 2102+2103) – gleicher Lösungsweg, gleiche Zuordnung?
Volt (Bund): 1 von 3 Maßnahmen mehreren Ursachen zugeordnet (alle Programme: 7 %) – Mehrfachzuordnung prüfen
```

**Punkte** (`npm run punkte`):

```
Armut und Kinderarmut – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2101 2102 2103   alle
Union       0  5.5    4    9.5
SPD         0  5.5    4    9.5
Grüne       3  7.5    6   16.5
FDP         0    3    6      9
AfD         3  3.5    0    6.5
Linke       3    6    0      9
BSW         0    4    0      4
Volt        2    5    2      9

BE       2101 2102 2103   alle
Union       0  5.5    4    9.5
SPD         0  5.5    4    9.5
Grüne       3  7.5    6   16.5
FDP         0    3    6      9
AfD         3  3.5    0    6.5
Linke       3    6    0      9
BSW         0    4    0      4
Volt        2    5    2      9

MV       2101 2102 2103   alle
Union       0  5.5    4    9.5
SPD         0  5.5    4    9.5
Grüne       3  7.5    6   16.5
FDP         0    3    6      9
AfD         3  3.5    0    6.5
Linke       3    6    0      9
BSW         0    4    0      4
Volt        2    5    2      9

ST       2101 2102 2103   alle
Union       0  5.5    4    9.5
SPD         0  5.5    4    9.5
Grüne       3  7.5    6   16.5
FDP         0    3    6      9
AfD         3  3.5    0    6.5
Linke       3    6    0      9
BSW         0    4    0      4
Volt        2    5    2      9
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt. Offene Ursache bei M03 (2101) nicht übernommen: Das Zitat nennt das Existenzminimum getrennter Familien im Wechselmodell, nicht Höhe oder Bemessung der Grundsicherung allgemein; zugeordnet zu 2102 (Familienressourcen nach Trennung).
- Hinweis außerhalb der Listen: M22 nennt auch die automatische Kindergeldauszahlung nach der Geburt (2103), steht aber nicht in ursachen_ids/ursachen_offen; daher nicht eingetragen.
- Keine Maßnahme ohne Ursache.
- Schwierig: M07/M27 (Begrenzen/Absenken des Regelsatzes) setzen an Höhe und Bemessung an (Regel 1), wirken aber gegen das Ziel; daher Wirksamkeit 0 statt Leerzuordnung. M02 mit Wirksamkeit 3: konkretes Niveau an der Armutsgefährdungsgrenze, aber Umsetzbarkeit 1 wegen ungeklärter Kosten. M17 und I5 mit Wirksamkeit 1, weil Steuerabzüge Haushalte ohne Steuerschuld kaum erreichen. M15: ob alle Kinderartikel unter Anhang III der MwSt-Richtlinie fallen, nicht abschließend geprüft (Umsetzbarkeit 2).
- PDF-Quellen (ZEW, Prognos, IAB) waren nicht lesbar; verwendet wurden nur geöffnete HTML-Seiten.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

