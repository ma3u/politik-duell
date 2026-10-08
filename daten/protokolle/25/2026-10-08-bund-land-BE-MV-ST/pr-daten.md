## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 0 → 0 | 1 → 1 | 2 → 2 | 0 → 0 |
| SPD | 5 → 5 | 2 → 2 | 1 → 1 | 2 → 2 |
| Grüne | 4 → 4 | 4 → 4 | 1 → 1 | 1 → 0 |
| FDP | 0 → 0 | 1 → 1 | 0 → 0 | 1 → 0 |
| AfD | 2 → 2 | 2 → 2 | 0 → 0 | 2 → 1 |
| Linke | 1 → 1 | 2 → 1 | 2 → 2 | 2 → 2 |
| BSW | 2 → 2 | 0 → 0 | 0 → 0 | 0 → 0 |
| Volt | 2 → 2 | 1 → 1 | 0 → 0 | 2 → 1 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2501 Union, FDP, AfD, Linke; 2502 Union, FDP, BSW, Volt; 2503 Union, Grüne, FDP, AfD, Linke, BSW, Volt. **BE** 2501 BSW, Volt; 2503 Union, FDP, AfD, Linke, BSW. **MV** 2501 SPD, FDP, AfD, BSW, Volt; 2503 Grüne, FDP, AfD, BSW, Volt. **ST** 2501 Union, Grüne, FDP, BSW, Volt; 2503 Union, Grüne, FDP, AfD, Linke, BSW.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2501  2502  2503
Union-Bund         5     1     1
Union-BE          11     –     1
Union-MV          11     –     3
Union-ST           4     –     5
SPD-Bund          12     1     2
SPD-BE            15     –     4
SPD-MV             3     –    15
SPD-ST            10     –     2
Grune-Bund        13     0     6
Grune-BE          36     –    11
Grune-MV          13     –     7
Grune-ST           9     –     4
FDP-Bund           3     3     1
FDP-BE             8     –     3
FDP-MV            14     –     2
FDP-ST             2     –     3
AfD-Bund           6     1     0
AfD-BE             9     –     0
AfD-MV             6     –     0
AfD-ST             6     –     1
Linke-Bund         5     2     3
Linke-BE          35     –    10
Linke-MV          13     –     6
Linke-ST          20     –     5
BSW-Bund          10     1     2
BSW-BE             2     –     0
BSW-MV             5     –     5
BSW-ST             4     –     2
Volt-Bund         14     1     2
Volt-BE            8     –     1
Volt-MV            2     –     0
Volt-ST           21     –     5
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-BE 2503 (S. 63): Medienkompetenz an Schulen (S. 63) zielt auf Informationsprüfung und Desinformation, nicht auf Gesprächskultur oder Anfeindungen; sonst keine Zusage zu Prävention oder Moderationsdesign.
Union-ST 2501 (S. 32, 35, 58, 59, 60): Beratungsstellen betreffen Kinderschutz, Gewalt in Familien, Verbraucher; Staatsanwaltschaften nur Standorte; Meldemöglichkeiten (S. 35) nur im Jugendmedienschutz, nicht für Hass.
Union-ST 2503 (S. 19, 22, 35, 36): Medienkompetenz zielt auf Bewertung von Inhalten/KI und Desinformation, kein Bezug zu Hass oder Anfeindung (R2).
SPD-BE 2501 (S. 9, 19, 20, 32, 34, 35, 48): Weitere Treffer betreffen Staatsanwaltschaft für Mitbestimmung/Miete und allgemeine Beratungsstellen, nicht Hass im Netz.
SPD-MV 2501 (S. 38, 58, 72, 39): S. 38 betrifft Frauenschutzhäuser/häusliche Gewalt, S. 58 und 72 nur Personalnot der Staatsanwaltschaften, S. 39 allgemeine Absicht gegen Hassdiskurs ohne Meldewege oder Hilfe.
Grune-Bund 2501 (S. 85, 86, 116, 118, 121, 133): Beratungsstellen und Hilfen betreffen Kinder, Diskriminierung, Partnerschaftsgewalt; keine Hilfe/Meldewege für Betroffene von Online-Hass. Polizeistatistik und Queer-Hasskriminalität nicht netzbezogen.
Grune-Bund 2503 (S. 77, 110, 115, 126): Medienkompetenz und Algorithmen allgemein bzw. gegen Desinformation, ohne Bezug zu Hass/Anfeindung.
Grune-MV 2503 (S. 44, 74, 75, 98): Medienkompetenz in Schule (Cybermobbing), Algorithmen-Transparenz für Verwaltung und Bibliotheksförderung: kein Bezug zu Anfeindungen im Netz bzw. zu Plattformen.
Grune-ST 2503 (S. 53, 64): Medienkompetenz und Algorithmen-Verständnis dort im Zusammenhang mit Desinformation und Schulbildung, nicht mit Hass oder Anfeindung; keine Moderations- oder Gesprächsdesign-Zusage.
FDP-Bund 2501 (S. 25, 23): Hasskriminalität nur LSBTI-bezogen und ohne Netzbezug; Staatsanwaltschaft nur Ausstattung der Justiz.
FDP-Bund 2502 (S. 27, 49, 24): DSA-Sorgfaltspflichten nur als Warnung vor Eingriffen in Meinungsfreiheit; S. 49 betrifft Billigprodukte; Uploadfilter-Ablehnung betrifft Privatsphäre.
FDP-Bund 2503 (S. 9): Medienkompetenz als Schulfach allgemein, ohne Bezug zu Hass im Netz (R2).
FDP-BE 2503 (S. 16, 76): Medienkompetenz-Abschnitt nennt Cybermobbing/Desinformation, aber nicht Hass oder Anfeindung und keine Gesprächs- oder Moderationsgestaltung; S. 76 lehnt neue Gesetze gegen Hass ab.
FDP-MV 2501 (S. 53, 137, 138, 139, 146, 151): S. 53 Beratungsstellen betreffen Gewaltopfer allgemein (Frauenhäuser), nicht Hass im Netz; S. 137-139 Personal der Justiz ohne Bezug zu Hass im Netz; S. 146 Beratungsstelle zu DDR-Unrecht; S. 151 Löschverbot für Plattformen betrifft Plattformpflichten (2502, nur Bund).
FDP-MV 2503 (S. 87, 95, 136): S. 95 Finanz-Medienkompetenz, S. 136 Verschlüsselungsalgorithmen, ohne Bezug zu Hass; S. 87 Prävention von Cybermobbing in Schulen gehört nach R2 zu Mobbing in der Schule.
FDP-ST 2501 (S. 39, 45): S. 39 Beratungsstellen betreffen Gesundheit/Sucht, S. 45 Digitalisierung der Justiz; nichts zu Hass im Netz.
AfD-MV 2501 (S. 43, 44, 47, 53): Allgemeine Strafrechtsanwendung, beschleunigte Verfahren, Strafbarkeit linksradikaler Netzwerke und Meldestellen von Verbänden: kein Bezug zu Hass im Netz oder Betroffenen.
AfD-MV 2503 (S. 43, 44): Keine Fundstellen; keine Zusage zu Prävention oder Plattformgestaltung gefunden.
AfD-ST 2501 (S. 32, 89, 108, 120): Fundstellen betreffen Passprüfung, Schüler-Straftaten, Ermittlungen und Überstellung; kein Bezug zu Hass im Netz, keine Meldewege oder Hilfe für Betroffene.
Linke-Bund 2501 (S. 28, 48, 49, 51, 55): Fundstellen betreffen Betriebsräte, allgemeine Kriminalitätsbekämpfung, Lobbyismus, Beratung gegen Rechtsextremismus und Straftaten gegen Medienschaffende, ohne Bezug zu Hass im Netz.
Linke-Bund 2503 (S. 40, 43, 48): Medienkompetenz in der Ausbildung (S. 40) und Anonymität/Algorithmen (S. 43, 48) stehen in anderem Zusammenhang, keine Zusage zu Prävention oder Gesprächsdesign.
BSW-MV 2501 (S. 62, 64, 69): Beratungsstellen betreffen Sucht, Glücksspiel und Rechtsberatung, nicht Hass im Netz.
BSW-MV 2503 (S. 47, 48, 61, 91): Medienkompetenz in Schulen und Gesundheit ohne Bezug zu Hass; Algorithmen-Stelle betrifft Verwaltungs-KI.
Volt-Bund 2502 (S. 58): S. 58: DSA nur im KI-Kontext (Diskriminierung, Desinformation, Datenmissbrauch), kein Bezug zu Hass im Netz.
Volt-Bund 2503 (S. 142, 160): Medienkompetenz nur für Institutionen bzw. Medienschaffende, nicht zu Anfeindungen im Netz.
Volt-BE 2501 (S. 37, 75, 77, 85): Beratungsstellen (S. 37, 85), Staatsanwaltschaft (S. 75) und Meldestelle (S. 77) betreffen andere Zusammenhänge, nicht Hass im Netz.
Volt-ST 2501 (S. 155, 169, 170, 172): Beratungsstellen für Gewaltbetroffene, Hasskriminalität-Statistik und Schwerpunktstaatsanwaltschaften beziehen sich auf Gewalt allgemein, nicht auf Hass im Netz; Cybercrime (S. 172) betrifft Betrug/IT-Kriminalität (R2); Meldestellen S. 155 nur für Journalisten; übrige Treffer fachfremd.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 45 Kennungen, Prüfsumme `e57c4b5bfe48e31e4c07534a0f2904245acd2701d01936e35b8ceff1812fa6d7`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (MV): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Union (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (BE): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Grüne (BE): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M20 2501); offene bestätigt 0; verworfen 1
Zuordnung: FDP (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M41 2503); offene bestätigt 0; verworfen 1
Zuordnung: AfD (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (BE): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (ST): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M39 2503); offene bestätigt 1; verworfen 1
Zuordnung: Linke (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (BE): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M23 2503); offene bestätigt 0; verworfen 1
Zuordnung: Linke (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M08 2503); offene bestätigt 0; verworfen 1
```

**Hinweise zur Bewertung:** 

```
16 von 25 Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen
M16: Bewertung sieht zusätzlich Ursache 2502 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M44: Bewertung sieht zusätzlich Ursache 2501 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
Instrument I2: Maßnahmen mit unterschiedlichen Ursachen (M16 2501, M44 2502) – gleicher Lösungsweg, gleiche Zuordnung?
```

**Punkte** (`npm run punkte`):

```
Hass und Anfeindungen im Internet – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2501 2502 2503   alle
Union       0    0    0      0
SPD         9    6    1     16
Grüne       4    9    0     13
FDP         0    0    0      0
AfD         0    0    0      0
Linke       0    6    0      6
BSW         0    0    0      0
Volt      4.5    0    0    4.5

BE       2501 2502 2503   alle
Union       6    0    0      6
SPD         6    6    3     15
Grüne       9    9    3     21
FDP         2    0    0      2
AfD         0    0    0      0
Linke       6    6    0     12
BSW         0    0    0      0
Volt        0    0    3      3

MV       2501 2502 2503   alle
Union       1    0    1      2
SPD         0    6    3      9
Grüne       6    9    0     15
FDP         0    0    0      0
AfD         0    0    0      0
Linke       6    6    3     15
BSW         0    0    0      0
Volt        0    0    0      0

ST       2501 2502 2503   alle
Union       0    0    0      0
SPD         6    6    3     15
Grüne       0    9    0      9
FDP         0    0    0      0
AfD         0    0    0      0
Linke       9    6    0     15
BSW         0    0    0      0
Volt        0    0    3      3
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt (keine Ursache, Regel 2): M08 und M41 (Medienbildung ohne Bezug zu Hass im Zitat oder in der Beschreibung; Desinformation bzw. Jugendmedienschutz), M20 (Opferarbeit für Betroffene „digitaler Kriminalität“ allgemein, ohne Bezug zu Hass – eher Thema Sicherheit), M23 (Aufklärung über extrem rechte Ideologien – Thema Radikalisierung und Extremismus), M39 (Kampagnen gegen Löschregeln und Algorithmen ohne Bezug zu Hass; allgemeine Netzpolitik).
- Offene Ursachen: M33 und M37 auf 2501 übernommen (Strafverfolgung bzw. Strafrecht ohne Plattformbezug). M35: 2502 übernommen (gerichtliche Accountsperren wirken über die Plattformen).
- Zusätzlich als Hinweis außerhalb der Listen: M16 → 2502 und M44 → 2501. Beide gehören zum selben Lösungsweg (digitales Gewaltschutzgesetz mit Accountsperren und Rechten für Betroffene), der an beiden Ursachen ansetzt; gleiche Ursachen für denselben Lösungsweg.
- Schwierig: (1) Maßnahmen, die Schutz abbauen (M07, M09, M10, M15, M22, M24, M37): Ich habe sie den Ursachen zugeordnet, an denen sie laut Text ansetzen, und mit Wirksamkeit 0 bewertet statt sie als „ohne Ursache“ zu streichen. (2) Ob das Streichen des § 188 StGB überhaupt an einer Ursache ansetzt, ist ein Grenzfall. (3) I1 nur mit 2: Die Studie zum NetzDG trägt, aber bei sehr großen Plattformen setzt die EU-Kommission den DSA durch. (4) Für Beratungsangebote (I3) und Meldestellen fand ich keine Evaluation ihrer Wirkung auf Meldequote oder Ausmaß des Hasses, nur Fallzahlen; deshalb „offen“. Den Volltext der Studie „Lauter Hass – leiser Rückzug“ (PDF) konnte ich nicht öffnen.
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

