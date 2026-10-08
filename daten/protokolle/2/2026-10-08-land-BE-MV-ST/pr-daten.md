## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 3 → 3 | 2 → 2 | 2 → 2 |

**Ohne Maßnahme zu einer Ursache:** keine

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         201   202   203   204   205   206
Volt-BE            –     –     –     –     –    11
Volt-MV            –     –     –     –     –     8
Volt-ST            –     –     –     –     –    11
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst): keine

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 7 Kennungen, Prüfsumme `6a3214f6a086fc4dce3e4f9dfabba8e4f03b31163020606ea94ad6e247ec9862`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
```

**Punkte** (`npm run punkte`):

```
Miete – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5    3   29.4
SPD       5.5    4    6    6    2    4   27.5
Grüne       6  7.5    4  5.5    4    4     31
FDP       6.8    0    4    0    0    0   10.8
AfD         3    2    1    0    2    2     10
Linke       3  4.3    3    2    2    2   16.3
BSW       6.5    2    4    4    4    4   24.5
Volt      7.2  5.5    3    0    0    4   19.7

BE        201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5  4.5   30.9
SPD       5.5    4    6    6    2    5   28.5
Grüne       6  7.5    4  5.5    4    4     31
FDP       6.8    0    4    0    0    3   13.8
AfD         3    2    1    0    2    3     11
Linke       3  4.3    3    2    2  6.5   20.8
BSW       6.5    2    4    4    4    8   28.5
Volt      7.2  5.5    3    0    0  5.3     21

MV        201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5    3   29.4
SPD       5.5    4    6    6    2    3   26.5
Grüne       6  7.5    4  5.5    4    9     36
FDP       6.8    0    4    0    0    0   10.8
AfD         3    2    1    0    2    0      8
Linke       3  4.3    3    2    2    4   18.3
BSW       6.5    2    4    4    4    4   24.5
Volt      7.2  5.5    3    0    0  5.5   21.2

ST        201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5    3   29.4
SPD       5.5    4    6    6    2    4   27.5
Grüne       6  7.5    4  5.5    4    4     31
FDP       6.8    0    4    0    0    0   10.8
AfD         3    2    1    0    2    4     12
Linke       3  4.3    3    2    2    8   22.3
BSW       6.5    2    4    4    4    4   24.5
Volt      7.2  5.5    3    0    0  5.5   21.2
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen (206) bestätigt. Offene Ursache bei M06 (206) bestätigt: Die Miet-Agentur schafft de facto belegungsgebundenen Wohnraum aus dem Bestand und setzt damit am Mangel an Sozialwohnungen an (ähnlich dem Ankauf von Belegungsrechten). Keine Maßnahme ohne Ursache.
- M01 und M07 nicht 6646 (ausbauen, Bundesmittel voll kofinanzieren) zugeordnet, weil weder Ausbau noch Kofinanzierung genannt sind, aber auch nicht 6645 (fortführen ohne Ausbau), weil Sicherung bzw. dauerhafte Bindung hinzukommen; daher I1 mit gleichen Werten wie 6646. M07 enthält zusätzlich die höhere Fehlbelegungsabgabe und eine WBS-Kampagne; zugeordnet nach dem Hauptinhalt (Landesprogramme).
- M02 nicht 6647 (unbefristet), weil „langfristig“ keine feste Dauer nennt; daher schwächer bewertet (I2). Schwierig: Abgrenzung zu 6647 mit Wirksamkeit 2.
- M05 nicht 6648 (höhere Quote), weil nur die bestehende Quote beibehalten wird; analog zu 6645 (Fortführung) mit Wirksamkeit 1.
- M03 und M04 auf 6649 (Fehlbelegungsabgabe); die Zweckbindung der Einnahmen in M04 ist in der Begründung von 6649 schon berücksichtigt.
- Mehrere Quellen (IWU-Stellungnahme zur Fehlbelegungsabgabe, Hessische Drucksache, Münchner SoBoN-Unterlagen, FEANTSA-Studie) waren als PDF nicht lesbar und sind daher nicht als Beleg angegeben.
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

