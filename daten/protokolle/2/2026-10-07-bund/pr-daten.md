## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 9 → 9 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 204 Volt; 205 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         201   202   203   204   205   206
Volt-Bund         33    72     5     0    43     6
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 202 (S. 94, 95, 96): Keine Zusage zu Mietpreisbremse, Neuvermietungsmieten oder Mietendeckel; nur Angebotsausweitung, dort erfasst.
Volt-Bund 204 (S. 94, 95, 96): Keine Zusage zu Bestandsmieten, Kappung oder Mietenstopp im Wohnkapitel.
Volt-Bund 205 (S. 50, 135, 94): Zuwanderung wird nur erleichtert (Fachkräfte, Asylsystem), nicht begrenzt oder mit Bezug zur Wohnungsnachfrage gesteuert; Nachverdichtung ist erfasst.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 9 Kennungen, Prüfsumme `663bb8463d6c6f467e3d3d5be998dc5287abfef17f9caeda34196e10d0ffd27f`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 9 Maßnahmen, 13 Zuordnungen (davon 0 offen); nicht bestätigt 2 (M03 203, M04 205); offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
2 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
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
Volt      7.2  5.5    3    0    0    –      –

MV        201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5    3   29.4
SPD       5.5    4    6    6    2    3   26.5
Grüne       6  7.5    4  5.5    4    9     36
FDP       6.8    0    4    0    0    0   10.8
AfD         3    2    1    0    2    0      8
Linke       3  4.3    3    2    2    4   18.3
BSW       6.5    2    4    4    4    4   24.5
Volt      7.2  5.5    3    0    0    –      –

ST        201  202  203  204  205  206   alle
Union     7.4  4.5    8    0  6.5    3   29.4
SPD       5.5    4    6    6    2    4   27.5
Grüne       6  7.5    4  5.5    4    4     31
FDP       6.8    0    4    0    0    0   10.8
AfD         3    2    1    0    2    4     12
Linke       3  4.3    3    2    2    8   22.3
BSW       6.5    2    4    4    4    4   24.5
Volt      7.2  5.5    3    0    0    –      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Nicht bestätigte Ursachen:
- M03: 203 (Baukosten) nicht bestätigt – Steuervorteile und günstige Kredite gleichen Kosten für eine Bauherrengruppe aus, senken aber nicht die Baukosten selbst; gleicher Maßstab wie bei Förderprogrammen (M06).
- M04: 205 (wachsende Nachfrage in Großstädten) nicht bestätigt – Nachverdichtung erweitert das Angebot (201), setzt aber nicht an der Nachfrage an; gleicher Maßstab wie bei Umnutzung (M02).
Offene Ursachen: Die Liste enthält keine `ursachen_offen` und keine `regeln`.
Ohne Ursache: keine.

Schwierige Einstufungen:
- M01: Der Kosteneffekt von Stellplatzpflichten ist gut belegt (IW, US-Studien), Wirksamkeit aber nur 2, weil die Erleichterung an Mobilitätskonzepte geknüpft ist; Umsetzbarkeit 1, weil Stellplatzrecht Landes- und Kommunalrecht ist.
- M06: Ein entsprechendes Bundesprogramm (zinsverbilligte Kredite für klimafreundlichen Neubau im Niedrigpreissegment) läuft bereits, daher Umsetzbarkeit 3; Wirksamkeit 1, weil es keine Miet- oder Belegungsbindung gibt und keine Auswertung vorliegt. Möglich wäre auch 2 – im Vergleich zum Instrument 6642 (Förderung mit langen Bindungen, 2) aber schwächer.
- M04/M08: Beide vereinfachen Verfahren, sie überschneiden sich aber nur teilweise mit Instrument 6641 (Bund, Umsetzbarkeit 3): Aufstockung ist ein eigener Weg, und eine Angleichung der Landesbauordnungen kann der Bund nicht regeln. Deshalb einzeln bewertet.
- M05: Der Forschungsstand ist gemischt, weil die dämpfende Wirkung eines großen kommunalen Bestands belegt ist (Wien, niedrigere Neuvermietungsmieten in Berlin), Rückkäufe aber keine zusätzlichen Wohnungen schaffen.
- Alle Maßnahmen kommen nur einmal vor und haben unterschiedliche Lösungswege, daher keine neuen Instrumente.
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

