## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 15 → 14 | 7 → 7 | 18 → 18 |

**Ohne Maßnahme zu einer Ursache:** **BE** 908 Volt; 909 Volt. **MV** 909 Volt. **ST** 903 Volt; 909 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         901   902   903   904   905   906   907   908   909   911
Volt-BE           59    18    11    16     –     –     –     4     4     –
Volt-MV           18     4     1     3     –     –     –     3     3     –
Volt-ST           94    44    13    36     –     –     –     7     9     –
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 908 (S. 75, 77): Nur digitale sexuelle Gewalt (S. 75, nach Leitfaden nicht erfasst) und Sexualstrafrecht in der Juristenausbildung (S. 77, keine Maßnahme gegen die Ursache).
Volt-BE 909 (S. 69, 78): Treffer 'Herkunft' nur Herkunftsland von Fachkräften; Racial-Profiling-Studie betrifft Kontrollen, nicht Nennung der Herkunft.
Volt-MV 901 (S. 15, 16, 53, 54, 57, 58): Kapitel Schutz, Sicherheit und Prävention (S. 14-15) gelesen: keine Maßnahmen an Orten, Präsenz, Videoüberwachung oder Verbotszonen; Fundstellen zu ÖPNV/Bahnhöfen betreffen Mobilität, nicht Sicherheit; Lichtkonzepte (S. 15) nur als offene Zuordnung.
Volt-MV 909 (S. 5, 11): Treffer 'Herkunft' betreffen Bildungschancen, nicht Tatverdächtige; nichts zu Kriminalstatistik oder Herkunftsnennung.
Volt-ST 903 (S. 27, 123, 124, 170): Schulsozialarbeit/Jugendarbeit ohne Bezug zu Gewalt oder Kriminalität (S. 27, 123, 124); kein Jugendstrafrecht, kein Messerverbot; S. 170 Gewaltprävention nicht auf junge Menschen bezogen.
Volt-ST 909 (S. 169): Nur Landesstatistik zu Hasskriminalität, keine Nennung der Herkunft von Tatverdächtigen, keine Kriminalstatistik-Reform.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

<details><summary>Ohne Bündel an Ursachen mit Bündeln (5, nur zur Information – je Instrument zählt eine Maßnahme)</summary>

```
Volt (BE): S. 78 „Digitale Meldesysteme, über die Bürger unsichere Orte anonym markieren können“ ohne Bündel (Ursache 901 hat Bündel)
Volt (BE): S. 78 „Studie zu Racial Profiling, die Polizeidaten auswertet und stichprobenartig Pers…“ ohne Bündel (Ursache 902 hat Bündel)
Volt (MV): S. 15 „Kommunale Lichtkonzepte und Bildungskampagnen zur Prävention von Femiziden unter…“ ohne Bündel (Ursache 901 hat Bündel)
Volt (ST): S. 173 „Kampagne „Ist Luisa hier?“ landesweit in Clubs, Bars und bei Veranstaltungen ums…“ ohne Bündel (Ursache 901 hat Bündel)
Volt (ST): S. 168 „Sonderdezernat für Finanzkriminalität und organisierte Kriminalität bei allen St…“ ohne Bündel (Ursache 902 hat Bündel)
```

</details>

**Blindliste:** 40 Kennungen, Prüfsumme `1effa7a09185658bfdd0bea2368d392f1431da6b83410988d279db65942c37d0`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 15 Maßnahmen, 16 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M24 902); offene bestätigt 2; verworfen 1
Zuordnung: Volt (MV): 7 Maßnahmen, 10 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M18 904); offene bestätigt 1; verworfen 0
Zuordnung: Volt (ST): 18 Maßnahmen, 22 Zuordnungen (davon 5 offen); nicht bestätigt 3 (M16 902, M12 901, M01 904); offene bestätigt 2; verworfen 0
```

**Hinweise zur Bewertung:** 

```
7 von 9 Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen
Instrument 7643: Maßnahmen mit unterschiedlichen Ursachen (M20 904, M36 904+908, M37 904) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument 7646: Maßnahmen mit unterschiedlichen Ursachen (M27 904, M31 904+908, M32 904) – gleicher Lösungsweg, gleiche Zuordnung?
```

**Punkte** (`npm run punkte`):

```
Sicherheit – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      901  902  903  904  905  906  907  908  909  911   alle
Union       1  6.3    2  8.8    2  5.3    9    3    0    2   39.4
SPD         4  6.9    0  8.3    2    4  6.8  4.5    0    0   36.5
Grüne       3  7.4    0    9    2    3    9  8.3    3    5   49.7
FDP         0  4.6    0    4    0  3.5  6.3    0    0    0   18.4
AfD         5  6.9    2    0  2.5    0  4.9    0    0    0   21.3
Linke       2    5    0    8    0  4.5  6.3    4    0    2   31.8
BSW         4  6.8    1  6.3    2    4    4    0    0    0   28.1
Volt        0  6.5    4  6.8    3  4.5  7.1    4    0    0   35.9

BE        901  902  903  904  905  906  907  908  909  911   alle
Union       9  6.3  4.5    9    2  5.3    9    0    3    2   50.1
SPD         9  6.8    0  8.6    2    4  6.8    5    3    0   45.2
Grüne       9  7.2  5.5    9    2    3    9  7.8    3    5   60.5
FDP         9  4.8  5.5  6.3    0  3.5  6.3    4    0    0   39.4
AfD         8  6.7  1.5    0  2.5    0  4.9    0    2    0   25.6
Linke       9  5.3    4  6.8    0  4.5  6.3    6    0    2   43.9
BSW         9  7.4  5.5    8    2    4    4    0    0    0   39.9
Volt        9  6.8    4    9    3  4.5  7.1    0    0    0   43.4

MV        901  902  903  904  905  906  907  908  909  911   alle
Union       9  7.2  7.5    9    2  5.3    9    0    0    2     51
SPD       5.5  6.9    0  5.8    2    4  6.8    4    0    0     35
Grüne       9    6    4  5.5    2    3    9    4    3    5   50.5
FDP         4  6.8    0    8    0  3.5  6.3    0    3    0   31.6
AfD         4  7.1  5.8    0  2.5    0  4.9    0  4.5    0   28.8
Linke       0  6.5    0    8    0  4.5  6.3    8    0    2   35.3
BSW         8    9    4    9    2    4    4    0    0    0     40
Volt        6  4.5    4    8    3  4.5  7.1    8    0    0   45.1

ST        901  902  903  904  905  906  907  908  909  911   alle
Union     5.5  7.2    3    4    2  5.3    9    0    0    2     38
SPD         0  6.8    6    4    2    4  6.8    0    0    0   29.6
Grüne       9  6.6    4    6    2    3    9    6    3    5   53.6
FDP         4    5    0    4    0  3.5  6.3    0    0    0   22.8
AfD         2  6.8  4.6    0  2.5    0  4.9    0    0    0   20.8
Linke       6  5.3  8.5    9    0  4.5  6.3    6    3    2   50.6
BSW         4  6.8    4  6.3    2    4    4    6    0    0   37.1
Volt        8    7    0    9    3  4.5  7.1  8.3    0    0   46.9
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Nicht bestätigte Vorschläge:
- M18: 904 nicht bestätigt, stattdessen offene 901. Das Zitat nennt kommunale Lichtkonzepte (Regel 1, öffentlicher Raum); Partnerschaftsgewalt geschieht überwiegend in der Wohnung, Beleuchtung setzt dort nicht an. Die Bildungskampagnen sind zu unbestimmt für ein eigenes Instrument.
- M24: 902 nicht bestätigt, ursachen []. Eine Studie zu Racial Profiling und Menschenfeindlichkeit in der Polizei setzt an keiner Ursache an (weder Aufklärung noch Kriminalstatistik im Sinne von 909).

Offene Ursachen:
- M01: 904 nicht übernommen (anonyme Spurensicherung gehört nach Regel 12 zu 908, das Zitat nennt keine Partnerschaftsgewalt).
- M10, M13, M28: 902 übernommen (Regel 4, organisierte Kriminalität bzw. Behördenvernetzung nur als offen 902).
- M11: 902 übernommen, weil das Zitat ausdrücklich Justiz und Strafverfolgung nennt.
- M12: 901 nicht übernommen (Clubs und Bars sind kein öffentlicher Raum im Sinne von Regel 1).
- M16: 902 nicht übernommen (Präsenzpunkte schaffen keine zusätzlichen Ermittlungskapazitäten, Regel 2).

Schwierige Einstufungen:
- M31 (Koordinierungsstelle plus Fußfessel) habe ich 7646 zugeordnet, weil die Fußfessel der stärkere Teil ist; 908 stammt aber aus der Koordinierungsstelle, für 908 ist W2 daher eher großzügig.
- M04/M26/M08 (Ermittlungsstelle Polizeigewalt) und Bodycams (M09/M19/M33) habe ich gemäß Erfassung bei 902 gelassen; sie berühren nur einen kleinen Ausschnitt der unaufgeklärten Taten. Man kann argumentieren, dass sie gar nicht am Thema ansetzen. Die Campbell-Übersicht zu Bodycams klammert Ermittlungs- und Verurteilungsergebnisse ausdrücklich aus.
- M06 (nur „Konzept erarbeiten“) bekommt dieselbe Bewertung wie der Ausbau der Beleuchtung (7629, W3); eine Herabstufung wegen des reinen Konzeptcharakters wäre vertretbar.
- M14/M34: Instrument 7658 (über den Bund, U1) passt nicht, weil das Land hier eigene Einstellungsspielräume nutzt (U3); daher neues Instrument I3 mit der DRB-Quelle aus 7658.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

