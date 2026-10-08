## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 1 → 1 | 2 → 2 | 0 → 0 | 0 → 0 |
| SPD | 1 → 1 | 5 → 5 | 2 → 2 | 2 → 2 |
| Grüne | 3 → 2 | 5 → 5 | 0 → 0 | 6 → 5 |
| FDP | 1 → 0 | 1 → 1 | 3 → 3 | 0 → 0 |
| AfD | 1 → 1 | 1 → 1 | 2 → 2 | 2 → 2 |
| Linke | 0 → 0 | 7 → 7 | 3 → 3 | 1 → 1 |
| BSW | 1 → 1 | 2 → 2 | 2 → 2 | 2 → 1 |
| Volt | 4 → 4 | 1 → 1 | 1 → 1 | 2 → 2 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2301 Union, SPD, Grüne, FDP, Linke, BSW; 2302 Union, SPD, Grüne, FDP, AfD, Linke, BSW; 2303 FDP, AfD, Linke; 2304 Union, SPD, FDP, AfD, Linke, BSW. **BE** 2302 FDP, AfD, Volt; 2304 SPD, FDP, AfD, BSW, Volt. **MV** 2301 Union, Grüne; 2302 Union, SPD, Grüne, Linke, Volt; 2304 Union, Grüne, FDP, AfD, BSW, Volt. **ST** 2301 Union, FDP, Linke, BSW; 2302 Union, FDP, Linke, BSW, Volt; 2304 Union, SPD, FDP, AfD.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2301  2302  2303  2304
Union-Bund         0     4     2    13
Union-BE           4    18     –    15
Union-MV           1    21     –    17
Union-ST           3     8     –    14
SPD-Bund           3     4     1     7
SPD-BE             4    22     –    10
SPD-MV             4    27     –    26
SPD-ST             0    20     –     6
Grune-Bund         3    16     5    13
Grune-BE           7    38     –    37
Grune-MV           4    20     –     9
Grune-ST           4    30     –    12
FDP-Bund           0     4     1     4
FDP-BE             1     8     –     6
FDP-MV             5    23     –     9
FDP-ST             0     8     –    10
AfD-Bund           2     0     0     3
AfD-BE             3     2     –    14
AfD-MV             2     5     –     8
AfD-ST             4     8     –    10
Linke-Bund         3     6     1    10
Linke-BE          14    50     –    25
Linke-MV           4    15     –    11
Linke-ST          11    25     –    10
BSW-Bund           3     2     0     1
BSW-BE             6     8     –     7
BSW-MV             8    11     –    26
BSW-ST             6    25     –    25
Volt-Bund          3    25     7    16
Volt-BE            2    18     –     7
Volt-MV            1    16     –     8
Volt-ST            3    28     –    30
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 2304 (S. 3, 14, 24, 63, 66): Treffer 'Entlastung' betreffen Steuern, Landwirte, Justiz; 'Resilienz' Wirtschaft, Energie, Cyber, Verteidigung. Schulkapitel S. 65-66 gelesen: nichts zu Leistungs- oder Prüfungsdruck.
Union-Bund 2301 (S. 65, 66): Schulkapitel ohne Aussage zu Klassenklima, sozialem Lernen oder Mobbingprävention.
Union-Bund 2302 (S. 66, 67, 69, 70): Fortbildung-Treffer betreffen Berufsbildung; 'Anlaufstelle' Apotheken; Qualifizierung von Lehrkräften (S. 66) nur zu Digitalem.
Union-MV 2302 (S. 28, 48, 50, 60): Schulsozialarbeit (S. 50) und multiprofessionelle Teams (S. 48) ohne Bezug zu Mobbing, Gewalt oder Konflikten (R2); Fortbildung S. 28 betrifft Fachhochschule, übrige Treffer Anlaufstellen/Fortbildung anderer Themen.
Union-MV 2304 (S. 50, 51, 52): Treffer zu Entlastung/Resilienz betreffen Strom, Wirtschaft, Gesundheitswesen; S. 51 will Leistungsanforderungen erhöhen statt Druck zu senken, S. 52 Resilienz nur als Erste-Hilfe-Kompetenz.
Union-MV 2301 (S. 35): Treffer 'Konsequenzen' betrifft Jugendstrafrecht, nicht Schule.
Union-ST 2304 (S. 8, 12, 21, 23, 24, 28): Treffer zu Entlastung betreffen Kommunen, Steuern, Eltern; S. 24 hält an Noten und zentralen Prüfungen fest; S. 28 psychische Gesundheit nur allgemein ohne Schulbezug.
Union-ST 2302 (S. 23, 22, 24): Schulsozialarbeit (S. 23) nur 'möglichst erhalten', ohne Nennung von Mobbing, Gewalt oder Konflikten (R2); Fortbildung nur zu Medienkompetenz bzw. Seiteneinsteigern.
Union-ST 2301 (S. 22, 73): Keine Zusage zu Klassenklima oder sozialem Lernen; S. 73 betrifft religiösen Extremismus.
SPD-Bund 2301 (S. 27, 45, 54, 55): Fundstellen zu Ausgrenzung betreffen gesellschaftliche Diskriminierung, nicht Schulklima; Demokratiebildung in Schulen (S. 27) ohne Bezug zu Mobbing.
SPD-Bund 2302 (S. 28, 30, 37): Anlaufstellen betreffen Apotheken und Sozialleistungen; Schutzkonzepte (S. 28) richten sich gegen Gewalt an Kindern in Einrichtungen, nicht gegen Mobbing unter Schülern.
SPD-Bund 2304 (S. 5, 7, 27, 30, 31): Entlastung/Resilienz bezogen auf Steuern, Pflege, Wirtschaft; Beratungsangebote für psychisch belastete junge Menschen (S. 30) ohne Schulbezug.
SPD-BE 2304 (S. 13, 34, 42): Treffer betreffen Unternehmen, Pflege, Lehrkräfte-Entlastung (Unterrichtsverpflichtung) und allgemeine psychische Gesundheit; keine Zusage zu Leistungs- oder Prüfungsdruck von Schülern.
SPD-MV 2302 (S. 37, 66, 67, 68): Schulsozialarbeit (S. 37) und multiprofessionelle Teams (S. 67) ohne Bezug zu Mobbing, Gewalt oder Konflikten; Fortbildung (S. 66, 68) zu Demokratiebildung, Heterogenität, Digitalem; keine Zusage zu Eingreifen bei Mobbing oder Beschwerdewegen.
Grune-Bund 2302 (S. 77, 85, 76, 79): Mehr Stellen für Schulsozialarbeit und Schulpsychologie (S. 77) nennen weder Mobbing, Gewalt noch Konflikte (R2); übrige Treffer (Anlaufstellen, Fortbildung) betreffen Berufsagenturen, Polizei, Kultur u. a.
Grune-Bund 2304 (S. 81, 84, 85, 91): Treffer zu Entlastung betreffen Familien, Pflege; Resilienz betrifft Wirtschaft, Rechtsstaat; nichts zu Leistungs- oder Prüfungsdruck in der Schule.
Grune-MV 2302 (S. 40, 42, 60, 87, 89, 84): Multiprofessionelle Teams mit Schulsozialarbeit/Schulpsychologie und Schulsozialarbeit (S. 40, 42, 60) nennen weder Mobbing, Gewalt noch Konflikte (R2); Fortbildungen S. 84 betreffen Kinderschutz allgemein; Anlaufstellen S. 87/89 betreffen Queer/Hassverbrechen, nicht Schule.
Grune-MV 2301 (S. 44, 65, 86): Nur allgemeine Mitbestimmung und Demokratiebildung; Ausgrenzung S. 65/86 nicht schulbezogen.
Grune-MV 2304 (S. 43, 44, 58, 64): Psychosoziale Beratung/mentale Gesundheit ohne Bezug zu Leistungs- oder Prüfungsdruck; Entlastung S. 58/64 nicht schulbezogen.
FDP-Bund 2301 (S. 9): Nur Antisemitismus-/Menschenfeindlichkeit im Unterricht, kein Bezug zu Mobbing oder Klassenklima; keine Treffer.
FDP-Bund 2302 (S. 9, 33): Aus- und Fortbildung der Lehrkräfte ohne Bezug zu Mobbing; S. 33 Anlaufstelle meint Hausärzte.
FDP-Bund 2304 (S. 7, 35, 9): Treffer zu Entlastung betreffen Kita-Personal, Pflege; Notenpflicht ab Klasse 3 ist keine Entlastung; psychische Gesundheit (S. 33) ohne Schulbezug.
FDP-BE 2302 (S. 8, 10, 12): Verpflichtende Lehrkräftefortbildung (S. 10) und multiprofessionelle Teams (S. 8) nennen weder Mobbing noch Gewalt oder Konflikte; Medienkompetenz/Cybermobbing (S. 12) gehört zu 2303.
FDP-BE 2304 (S. 8, 11, 20, 21): Treffer zu Entlastung betreffen Bürokratie, Haushalt; G9-Option (S. 11) nennt keinen Leistungs- oder Prüfungsdruck.
FDP-MV 2304 (S. 101, 115): Psychische Gesundheit und Schulpsychologie ohne Bezug zu Leistungs- oder Prüfungsdruck; Treffer zu Entlastung betreffen Bürokratie, Pflege, Ehrenamt.
FDP-ST 2304 (S. 28, 30, 32, 11, 12, 36, 44, 53, 60, 63, 65, 67): Treffer „Entlastung“ betreffen Wohnen, Bürokratie, Haushalt, Ärzte, Rettungsdienst, Pflege, Bahn; nur S. 28/30 betreffen Entlastung von Lehrkräften, nicht von Schülern. S. 32 psychische Gesundheit nur Studierende, allgemeines Leitbild.
FDP-ST 2302 (S. 28, 29, 30, 16, 37, 59): Schulsozialarbeit/Schulpsychologie (S. 28) dienen der Entlastung von Lehrkräften ohne Nennung von Mobbing, Gewalt oder Konflikten (R2); Fortbildung S. 30 betrifft Seiteneinsteiger/Lehrkräftemangel; übrige Treffer in anderem Zusammenhang.
FDP-ST 2301 (S. 26, 28): Keine Treffer; Kapitel Bildung gelesen, keine Zusage zu Klassenklima, sozialem Lernen oder Prävention.
AfD-Bund 2304 (S. 159, 59, 148): Leistungsorientierung und höhere Standards, keine Entlastung; Treffer zu Entlastung betreffen Steuern und Eltern.
AfD-BE 2304 (S. 8, 28, 30, 32, 46, 54, 57, 71, 95, 98): Fundstellen zu „Entlastung“ betreffen Steuern, Energie, Pflege, Haushalt oder Lehrerstunden an Brennpunktschulen, nicht Schülerdruck. Kapitel Schule & Bildung (S. 27–32) gelesen: Leistungsprinzip und Noten werden bekräftigt, keine Entlastungszusage für Schüler.
AfD-BE 2302 (S. 31, 32, 50): Keine Zusage zu Handeln, Qualifikation von Lehrkräften oder Beschwerdewegen bei Mobbing; „Fortbildung“ auf S. 50 betrifft Meister-BAföG.
AfD-MV 2304 (S. 12, 19, 22, 54): Fundstellen zu Entlastung betreffen Steuern, Familien, Wirtschaft; kein Bezug zu Leistungs- oder Prüfungsdruck in der Schule. Kapitel Bildungsland MV (S. 25-32) gelesen.
AfD-ST 2304 (S. 15, 83, 112, 120, 121, 181, 228, 237, 245): Treffer 'Entlastung' betreffen Familien, Haushalt, Strafvollzug, Landwirtschaft, Pflege; S. 83 nur Entlastung der Lehrer (Lehrkräftemangel, gehört zu Schule), nichts zu Leistungs- oder Prüfungsdruck von Schülern.
Linke-Bund 2304 (S. 6, 15, 16, 18, 20, 26, 27, 32, 38, 39): Die 10 Treffer für „Entlastung“ betreffen Steuern, Energie, Pflege, Arbeitsbedingungen; im Schulkapitel nichts zu Leistungs- oder Prüfungsdruck (Hausaufgaben-Abschaffung begründet mit sozialer Ungleichheit).
Linke-MV 2302 (S. 5, 8, 11, 20, 24, 25): Schulsozialarbeit, Schulpsychologie und Fortbildung werden zugesagt, aber ohne Nennung von Mobbing, Gewalt oder Konflikten im Zitat (R2); Fortbildung nur zu Medienkompetenz bzw. Polizei/Justiz.
Linke-ST 2301 (S. 11, 21, 27, 28, 70, 97): Treffer betreffen Ausgrenzung in Armut/Integration, Konsequenzen allgemein; kein Programm zu Klassenklima oder sozialem Lernen gegen Mobbing.
Linke-ST 2302 (S. 27, 28, 34, 59, 60): Schulsozialarbeit (Personalschlüssel 1:150) und Fortbildungen nennen weder Mobbing, Gewalt noch Konflikte (R2), daher nicht zugeordnet; übrige Treffer (Polizei, Medizin, Kommunen) anderer Zusammenhang.
Linke-ST 2304 (S. 30, 32, 46, 56): Treffer zu Entlastung betreffen Familien, Pflege; nur die Kopfnoten-Abschaffung ist als Grenzfall offen erfasst.
BSW-Bund 2301 (S. 25, 31): S. 25: Schutzräume ohne Mobbing nur als Ziel; Unterstützungsteams als 'kann' formuliert, keine Zusage. S. 31: Lagebeschreibung zu Armut.
BSW-Bund 2302 (S. 25, 35): S. 25: Unterstützungsteams dienen der Entlastung von fachfremden Aufgaben, ohne Bezug zu Mobbing/Gewalt/Konflikten (R2). S. 35: Fortbildung betrifft Sicherheitsbehörden.
BSW-Bund 2304 (S. 24, 35): Notengebung als Standard ist keine Entlastung; S. 35 Treffer 'Entlastung' nicht schulbezogen.
BSW-BE 2304 (S. 15, 16, 62): Schulnoten werden beibehalten, Lehrpläne entschlackt für Wiederholung und Förderung; keine Zusage zur Entlastung von Leistungs- oder Prüfungsdruck.
BSW-MV 2304 (S. 46, 47, 48, 61, 63): Resilienz, kleine Klassen und Prävention zielen auf psychische Gesundheit allgemein; keine Zusage zu Leistungs- oder Prüfungsdruck oder Entlastung von Schülern.
Volt-BE 2302 (S. 46, 10, 36, 15): Fundstellen zu Anlaufstelle/Ansprechperson betreffen Verwaltung, Gründung, Gesundheit; Schulsozialarbeit (S. 36) nur Rückblick auf Kürzungen; multiprofessionelle Teams (S. 46) nennen weder Mobbing, Gewalt noch Konflikte (R2), Lehrkräftequalifizierung ohne Mobbingbezug.
Volt-BE 2304 (S. 48, 47, 80, 83): Keine Zusage zu Leistungs- oder Prüfungsdruck; Leistungsrückmeldungen (S. 47) und Lebenskompetenz (S. 48) nennen keinen Druck; übrige Treffer betreffen Gesundheit, Pflege, Klima.
Volt-MV 2302 (S. 6, 7, 8, 10, 12, 17, 18, 30, 32): Fortbildungen betreffen Medien-, Demokratie- und Antidiskriminierungsthemen, nicht Eingreifen bei Mobbing; Schulsozialarbeit/Schulpsychologie (S. 10) ohne Nennung von Mobbing, Gewalt oder Konflikten; Anlaufstellen S. 30/32 sind Gesundheit.
Volt-MV 2304 (S. 5, 11, 12): S. 5 nur Problemschilderung; Abschaffung der Kopfnoten (S. 11) und Entbürokratisierung (S. 12) nicht erkennbar auf Leistungs-/Prüfungsdruck bezogen.
Volt-ST 2302 (S. 19, 20, 22, 28, 30, 123, 124, 128, 131): Schulsozialarbeit/Schulpsychologie und Fortbildungen werden ohne Bezug zu Mobbing, Gewalt oder Konflikten genannt (R2); Fortbildungen betreffen Medien, Antidiskriminierung allgemein; übrige Treffer fachfremd.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 64 Kennungen, Prüfsumme `2af7ee48bca5356dbdb0294b679ef2d826d76f2256385ad63b8a4b1b9f860897`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (BE): 2 Maßnahmen, 3 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Union (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (BE): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M35 2301); offene bestätigt 0; verworfen 0
Zuordnung: SPD (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 2 Maßnahmen, 3 Zuordnungen (davon 3 offen); nicht bestätigt 0; offene bestätigt 3; verworfen 0
Zuordnung: Grüne (Bund): 3 Maßnahmen, 5 Zuordnungen (davon 5 offen); nicht bestätigt 3 (M43 2302, M34 2302, M34 2301); offene bestätigt 2; verworfen 1
Zuordnung: Grüne (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (ST): 6 Maßnahmen, 6 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M16 2304); offene bestätigt 1; verworfen 1
Zuordnung: FDP (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M42 2303); offene bestätigt 0; verworfen 1
Zuordnung: FDP (BE): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (MV): 3 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 1 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M51 2302); offene bestätigt 1; verworfen 0
Zuordnung: AfD (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (ST): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Linke (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (BE): 7 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (MV): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 2 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (MV): 2 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (ST): 2 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 2 (M09 2301, M09 2302); offene bestätigt 0; verworfen 1
Zuordnung: Volt (Bund): 4 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
Instrument I4: Maßnahmen mit unterschiedlichen Ursachen (M04 2301+2302, M10 2302, M21 2301+2302, M28 2302, M45 2301+2302) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I2: Maßnahmen mit unterschiedlichen Ursachen (M22 2301+2302, M23 2301, M48 2301, M53 2301, M58 2301+2302, M64 2301) – gleicher Lösungsweg, gleiche Zuordnung?
FDP (MV): 2 von 3 Maßnahmen mehreren Ursachen zugeordnet (alle Programme: 13 %) – Mehrfachzuordnung prüfen
```

**Punkte** (`npm run punkte`):

```
Mobbing und Druck in der Schule – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2301 2302 2303 2304   alle
Union       0    0    2    0      2
SPD         0    0    2    0      2
Grüne       0    0    2    3      5
FDP         0    0    0    0      0
AfD         1    0    0    0      1
Linke       0    0    0    0      0
BSW         0    0    1    0      1
Volt        4    1    4  2.5   11.5

BE       2301 2302 2303 2304   alle
Union       3    3    2    2     10
SPD       5.5  6.8    2    0   14.3
Grüne       6    3    2    4     15
FDP         4    0    0    0      4
AfD         2    0    0    0      2
Linke       6  5.5    0    5   16.5
BSW         4    6    1    0     11
Volt        4    0    4    0      8

MV       2301 2302 2303 2304   alle
Union       0    0    2    0      2
SPD         4    0    2    2      8
Grüne       0    0    2    0      2
FDP         9    6    0    0     15
AfD         2    4    0    0      6
Linke       3    0    0  4.5    7.5
BSW         6    4    1    0     11
Volt        4    0    4    0      8

ST       2301 2302 2303 2304   alle
Union       0    0    2    0      2
SPD         2    5    2    0      9
Grüne     7.5  5.5    2    3     18
FDP         0    0    0    0      0
AfD         2    2    0    0      4
Linke       0    0    0    2      2
BSW         0    0    1    1      2
Volt        4    0    4    3     11
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M09 (2301, 2302) – das Zitat nennt nur einen Personalschlüssel für Schulsozialarbeit und Schulpsychologie, aber weder Mobbing noch Gewalt noch Konflikte; nach Regel 2 zählt Schulsozialarbeit dann nicht zu diesem Thema (gehört eher zu Schule). Bitte prüfen, ob das Programm den Bezug an derselben Stelle herstellt.
- Offene Ursachen bestätigt: M03, M20 (2301, wie M46 als Sanktionsweg), M11 (2302), M13 (2301, gleicher Weg wie M02/M61), M15 (2303, Plattformschutz wie M40), M21 und M45 (2301, Konflikte/Gewalt genannt, gleich M04), M23 (2301), M29 (2302, Qualifikation von Lehrkräften), M36 (2304), M37 (2303, soziale Medien genannt), M43 (nur 2304), M51 (nur 2301, wie die übrigen Sanktionswege), M52 und M60 (2301, 2302).
- Offene Ursachen verworfen: M35 (2301; ein Team, das Fälle bearbeitet, setzt am Eingreifen an), M43 (2302; keine Lehrkräfte, kein Mobbingbezug), M51 (2302).
- Ohne Ursache: M16 (Zitat nennt Gesundheitsprävention und Freude an Bewegung, keinen Leistungsdruck), M34 (Ziel Chancengleichheit, nicht Mobbing oder Eingreifen bei Übergriffen), M42 (allgemeine Medienkompetenz; Regel 2: Mediennutzung ist eigenes Thema), M09 (siehe oben).
- Schwierig: Wirksamkeit der Beschwerdestellen (I5: 1 oder 2; Norwegen hat sein Mobbing-Ombud evaluiert, Ergebnisse konnte ich nicht öffnen). Sanktionen (I7, M08, M51): Ttofi und Farrington finden "firm disciplinary methods" als wirksamen Programmbaustein, US-Erfahrungen mit Null-Toleranz-Ausschlüssen sprechen dagegen (APA-Bericht nicht abrufbar) – daher gemischt und klare Regeln (M08) höher als Schulverweise. M25 als einziges W3, weil es mehrere erprobte Bausteine schulweit kombiniert; I2 nur W2, weil meist unbestimmt. Noten abschaffen (I8, M30) bewusst W1 wegen uneinheitlicher Belege. Campbell-Review 2021 (Gaffney u. a.) war nicht abrufbar (403), deshalb die Kurzfassung der Meta-Analyse von 2011 als Beleg.
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

