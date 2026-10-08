## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 5 → 5 | 6 → 6 | 5 → 5 |

**Ohne Maßnahme zu einer Ursache:** **BE** 403 Volt. **MV** 402 Volt. **ST** 402 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         401   402   403   404   405
Volt-BE           13     0     2    32    34
Volt-MV           24     0     0    10    33
Volt-ST           28     0     6    34    74
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 403 (S. 48, 47): Nur allgemeine Bekenntnisse zu sicheren Kompetenzen in Deutsch, Mathematik, Naturwissenschaften; keine konkrete Maßnahme gegen Lernrückstände.
Volt-MV 402 (S. 8): Keine Zusage zur Sanierung von Schulgebäuden; nur WLAN und IT-Teams (S. 8), keine Fundstellen.
Volt-ST 402 (S. 17, 77): Keine Zusage zur Sanierung von Schulgebäuden; S. 77 betrifft Kühlung (Klimaanpassung), S. 17 Digitalinfrastruktur.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 16 Kennungen, Prüfsumme `e016319cbab305341dea28f809632d82df6620328aafcbfd288905c10536df28`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 6 Maßnahmen, 7 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
2 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
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
Volt        6    4    0    8    4     22

MV        401  402  403  404  405   alle
Union       9    2  4.5    6  5.5     27
SPD         8    9    4    3    5     29
Grüne     6.5    0    0    0    3    9.5
FDP         4    3    2    3  5.5   17.5
AfD         9    0  4.5    5    3   21.5
Linke       4    0    2    6    3     15
BSW         6    0    5    6    2     19
Volt      4.5    0    4  5.5    3     17

ST        401  402  403  404  405   alle
Union       9    0    4    6    4     23
SPD         9    4    4    3    6     26
Grüne       9    4    0    6  6.3   25.3
FDP         9    2    3    6    2     22
AfD       4.5    0  4.5    3    0     12
Linke       9    4    0    3  4.5   20.5
BSW       6.8    0    3    6  4.8   20.6
Volt        4    0    4  7.5    4   19.5
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; ursachen_offen enthielt die Liste nicht. Keine Maßnahme ohne Ursache.
- M13 bekommt ein eigenes Instrument statt 6069, weil es neben Sprache auch mathematische Defizite erfasst (daher zusätzlich 403) und keine Verbindlichkeit/Förderpflicht nennt.
- M09 („Sanierung beschleunigen“ plus „verlässliche Investitionen“) zu 6076 statt 6085 gestellt, weil es eine Investitionszusage enthält; Grenzfall.
- M05 ist ein Bündel (Entlastung, Ausbildung, weniger Mehrarbeit, Schlüssel), das Zitat deckt vor allem die praxisnähere Ausbildung; daher Einzelbewertung statt 6072/6073.
- M16 schwer: Ein Personalschlüssel setzt am Mangel nur über die Verteilung an, verschärft ihn rechnerisch; Umsetzbarkeit 1, weil Personal absehbar fehlt.
- Hinweis zu 6079 (Längeres gemeinsames Lernen, „offen“): Internationale Differenzen-in-Differenzen-Studien finden, dass frühe Aufteilung die Ungleichheit erhöht (Hanushek/Woessmann, https://hanushek.stanford.edu/publications/does-educational-tracking-affect-performance-and-inequality-differences-differences); „gemischt“ wäre eher passend.
- Hinweis zu 6071 (Sozialindex): Die US-Evaluation der School Improvement Grants fand keine signifikanten Effekte von Turnaround-Programmen (https://ies.ed.gov/use-work/resource-library/report/evaluation-report/school-improvement-grants-implementation-and-effectiveness); „gemischt“ bleibt vertretbar.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

| Programm | Anlass | Ergebnis |
| --- | --- | --- |
| Volt-BE | zusammenfuehren: 3 Maßnahmen mit Bündeln, die im Leitfaden nicht bei ihren Ursachen stehen | Bündelangaben entfernt, Datei neu geprüft |
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

