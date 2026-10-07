## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 7 → 6 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 402 Volt; 403 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         401   402   403   404   405
Volt-Bund         23     0     1    26    75
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 402 (S. 105, 112, 113): Nur Digitalisierungsbudget, Hard-/Software und barrierefreie Gestaltung; keine Zusage zur Sanierung von Schulgebäuden.
Volt-Bund 403 (S. 110, 111, 114): Individuelle Lernwege, Lehrplanreform und Abschaffung der Noten; keine Zusage zum Aufholen von Lernrückständen in Grundkompetenzen.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 7 Kennungen, Prüfsumme `d7c948b7e8bda13aaf7258057b14d5d4adeb91e818c282e9e57fa15025dc1229`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 7 Maßnahmen, 8 Zuordnungen (davon 4 offen); nicht bestätigt 2 (M04 404, M05 403); offene bestätigt 2; verworfen 1
```

**Hinweise zur Bewertung:** 

```
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
```

**Punkte** (`npm run punkte`):

```
Schule – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      401  402  403  404  405   alle
Union       0    0  3.5    5    3   11.5
SPD         4    2    4    4    5     19
Grüne       4    4    2    2    4     16
FDP         4    2  2.5    4    4   16.5
AfD         0    0  1.5    6    0    7.5
Linke       4    2    2    4  3.3   15.3
BSW         4    5    1    4  3.5   17.5
Volt        6    0    0    2  3.5   11.5

BE        401  402  403  404  405   alle
Union       7    4    6    4    3     24
SPD         8    4    3    6  6.3   27.3
Grüne     8.5    2    0    6    6   22.5
FDP         6    0    0    6    3     15
AfD         5    2    3    7    2     19
Linke       9    4    3    2  5.5   23.5
BSW         4    2    3    4    5     18
Volt        –    –    –    –    –      –

MV        401  402  403  404  405   alle
Union       9    2  4.5    6  5.5     27
SPD         8    9    4    3    5     29
Grüne     6.5    0    0    0    3    9.5
FDP         4    3    2    3  5.5   17.5
AfD         9    0  4.5    5    3   21.5
Linke       4    0    2    6    3     15
BSW         6    0    5    6    2     19
Volt        –    –    –    –    –      –

ST        401  402  403  404  405   alle
Union       9    0    4    6    4     23
SPD         9    4    4    3    6     26
Grüne       9    4    0    6  6.3   25.3
FDP         9    2    3    6    2     22
AfD       4.5    0  4.5    3    0     12
Linke       9    4    0    3  4.5   20.5
BSW       6.8    0    3    6  4.8   20.6
Volt        –    –    –    –    –      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle sieben Maßnahmen sind Bundesmaßnahmen und kommen je nur einmal vor; die vorhandenen Bundesinstrumente (6067 Mittagessen, 6068 Schulbau) passen nicht. Daher Einzelbewertungen. Gleiche Lösungswege gibt es auf Landesebene (6073/6088 zu M02, 6078 zu M05, 6072 zu M06, 6079 zu M07) – für die Forderungskarte könnte die Koordination Bundes-Instrumente mit „entspricht“ anlegen.
- Offene Ursachen: M05 – 405 bestätigt (Unterstützung für Kinder in schwierigen Lagen), 403 nicht (Lernrückstände werden nicht direkt adressiert). M06 – 401 bestätigt (Entlastung schafft Lehrkräftezeit, wie Landesinstrument 6072). M04 – 404 nicht bestätigt: Betreuungsschlüssel und Gruppengrößen in Krippen/Kitas betreffen die Kita-Betreuung, Sprachförderung oder -feststellung nennt das Zitat nicht; daher ursachen [] (anderes Thema).
- Alle vorgeschlagenen Ursachen (M01 405, M02 401, M03 404, M07 405) bestätigt.
- Schwierig: M07 weicht vom Landesinstrument 6079 (W1, offen) ab: Die geöffnete DIW-Studie (Matthewes) findet mit deutschen Länderdaten Leistungsgewinne für Leistungsschwächere ohne Nachteile für Stärkere; deshalb „gemischt“ und W2, die Koordination sollte 6079 ggf. angleichen. Umsetzbarkeit 1, weil der Bund keine Kompetenz für die Schulstruktur hat.
- Schwierig: Umsetzbarkeit bei M01 (laufende Kosten in Länderzuständigkeit; Bund nur über Umsatzsteuerverteilung oder Vereinbarung, ähnlich Startchancen) – 2 statt 1 ist ein Grenzfall. M03: Quellen zu Sprachförderprogrammen (Egert/Hopf 2016, EVAS) ließen sich nicht öffnen (PDF nicht lesbar), daher „gemischt“ ohne Beleg-URL, in Übereinstimmung mit 6077/6086. M02: Für duale Lehramtsmodelle fand sich nur der Hinweis auf wenige empirische Befunde (laufende Evaluationen), daher „offen“.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

| Programm | Anlass | Ergebnis |
| --- | --- | --- |
| Volt-Bund | Erste Bewertung lief zum Teil ohne geöffnete Quellen (Sitzungslimit der Websuche) | nach Ablauf des Limits vollständig neu bewertet, mit Recherche |

Rückfragen an die Erfassung: keine
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

