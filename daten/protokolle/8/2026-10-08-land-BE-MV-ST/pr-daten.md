## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 3 → 3 | 4 → 4 | 6 → 6 |

**Ohne Maßnahme zu einer Ursache:** **BE** 804 Volt. **MV** 803 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         801   802   803   804
Volt-BE           30     –     4     9
Volt-MV           32     –     0    14
Volt-ST           82     –    18    43
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 804 (S. 31): Nur Einsatz für langfristige Finanzierung des Deutschlandtickets (bei 801 mitzitiert); keine Zusage zu Preis oder günstigeren Tickets. Übrige Treffer 'kostenlos' sind andere Zusammenhänge.
Volt-MV 803 (S. 54): Nur der Nebensatz zu ausreichend Fahrerinnen und Fahrern beim Rufbus-Ausbau, keine eigene Maßnahme zur Gewinnung von Fahrpersonal.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 13 Kennungen, Prüfsumme `f0c1566081be0b8b8771d9007ba05b8ebf1faa973afb82c2d258f4f49e0b828f`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 6 Maßnahmen, 7 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M04 804); offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Bus und Bahn – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      801  802  803  804   alle
Union       4    5    2    0     11
SPD         4    8    4    3     19
Grüne     6.5    6    4    5   21.5
FDP         2    2    2    0      6
AfD         2    8    0    0     10
Linke       5    6    4  3.5   18.5
BSW         4    8    0    4     16
Volt        5    5    0    4     14

BE        801  802  803  804   alle
Union       4    5    6    0     15
SPD         4    8    0    4     16
Grüne       4    6    6    4     20
FDP         6    2    0    0      8
AfD         4    8    6    0     18
Linke       3    6    9  5.5   23.5
BSW       5.5    8    6    4   23.5
Volt      5.5    5    2    0   12.5

MV        801  802  803  804   alle
Union       3    5    0    6     14
SPD         3    8    0  5.5   16.5
Grüne       5    6    0    6     17
FDP         3    2    0  5.5   10.5
AfD         4    8    0    4     16
Linke       6    6    0    6     18
BSW         4    8    0    4     16
Volt      6.8    5    0    4   15.8

ST        801  802  803  804   alle
Union     5.5    5    0    3   13.5
SPD         5    8    6  5.5   24.5
Grüne       4    6    0    4     14
FDP         6    2    6    3     17
AfD         3    8    0    4     15
Linke       6    6    0    6     18
BSW         4    8    0    6     18
Volt      6.8    5    6    6   23.8
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Ursachen: Alle vorgeschlagenen Ursachen bestätigt. Offen war nur 804 bei M04 (kommunale Nahverkehrsabgabe): nicht übernommen, weil der Hauptpreistreiber laut Ursache der Preis des Deutschlandtickets ist, den die Länder gemeinsam festlegen; eine kommunale Abgabe kann ihn nicht beeinflussen, „stabile Preise“ steht nur als Ziel der Zweckbindung da. Keine Maßnahme ohne Ursache.

Hinweis: M08 nennt zusätzlich die „langfristige Finanzierung des Deutschlandtickets“ (würde zu 804 und Instrument 6839 passen), 804 ist dort aber weder vorgeschlagen noch offen; zugeordnet nur über den Rufbus-/Shuttle-Teil (6750, 801).

Schwierig: M01 – fahrerlose U-Bahnen sind gut erprobt (Evidenz belegt), betreffen aber nur wenige Städte und nicht Bus und Tram, wo der Mangel am größten ist; deshalb Wirksamkeit 1. M04 – Wirksamkeit 2 analog zu 6740 (mehr Geld für Angebot), Umsetzbarkeit 2, weil Abgabe rechtlich sorgfältig (als Beitrag) gestaltet werden muss und Kommunen sie erst einführen müssen. M03 (Fahrzeuge und Fahrpersonal für Rufbusse durch Förderung und Qualifizierung) zu 6754 gezählt, obwohl der Text knapper ist als das Instrument.
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

