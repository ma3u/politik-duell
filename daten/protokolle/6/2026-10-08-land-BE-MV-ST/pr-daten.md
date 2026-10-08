## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 2 → 2 | 0 → 0 | 1 → 1 |

**Ohne Maßnahme zu einer Ursache:** **MV** 601 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         601   602   603   604   605   606
Volt-BE           16     –     –     –     –     –
Volt-MV           25     –     –     –     –     –
Volt-ST          110     –     –     –     –     –
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-MV 601 (S. 16, 17, 23, 24, 34, 47, 48): Integrationsmaßnahmen (Arbeitsmarkt, Sprachkurse, Anerkennung) setzen nicht an Unterbringung oder Ausländerbehörden an; Kommunalfinanzierung (S. 23-24) ist allgemein ohne Bezug zu Aufnahme; Grenzkontrollen/Asylstandards sind Bund/EU.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 3 Kennungen, Prüfsumme `db95b3d99f7b9a98262ca014402a7bbc313160639bfd5730ceec1a3f0e69ea32`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Zuwanderung und Integration – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      601  602  603  604  605  606   alle
Union     3.8    3    8  8.8  1.5    8   33.1
SPD         2    4    6    4    1    8     25
Grüne       2    0    9    5    1    8     25
FDP       4.9    2  5.5  3.3  1.5    4   21.2
AfD       4.4    5    2  4.6  1.5    4   21.5
Linke       4    0    9    0    1    6     20
BSW         1    4    8    2    1    0     16
Volt        0    4    9    0    1    6     20

BE        601  602  603  604  605  606   alle
Union       4    3    8  8.8  1.5    8   33.3
SPD         3    4    6    4    1    8     26
Grüne     6.8    0    9    5    1    8   29.8
FDP         4    2  5.5  3.3  1.5    4   20.3
AfD         4    5    2  4.6  1.5    4   21.1
Linke     5.6    0    9    0    1    6   21.6
BSW       4.4    4    8    2    1    0   19.4
Volt        4    4    9    0    1    6     24

MV        601  602  603  604  605  606   alle
Union       3    3    8  8.8  1.5    8   32.3
SPD         0    4    6    4    1    8     23
Grüne       2    0    9    5    1    8     25
FDP         6    2  5.5  3.3  1.5    4   22.3
AfD       4.3    5    2  4.6  1.5    4   21.4
Linke       2    0    9    0    1    6     18
BSW       4.3    4    8    2    1    0   19.3
Volt        0    4    9    0    1    6     20

ST        601  602  603  604  605  606   alle
Union     6.1    3    8  8.8  1.5    8   35.4
SPD         2    4    6    4    1    8     25
Grüne       5    0    9    5    1    8     28
FDP         4    2  5.5  3.3  1.5    4   20.3
AfD       5.1    5    2  4.6  1.5    4   22.2
Linke       2    0    9    0    1    6     18
BSW         1    4    8    2    1    0     16
Volt        2    4    9    0    1    6     22
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01: entspricht dem vorhandenen Instrument 6118 (dezentrale Unterbringung, Land); Ursache 601 bestätigt.
- M02: offene Ursache 601 bestätigt, weil die Maßnahme ausdrücklich neue feste Stellen in den Landesämtern für Einwanderung und für Flüchtlingsangelegenheiten schafft (Personal in überlasteten Behörden). Grenzfall: Der Schwerpunkt liegt auf Zuständigkeit und Ansprechpersonen für Zugewanderte, nicht auf Kapazität; deshalb nur Wirksamkeit 1 und kein Verweis auf 6115 (dort gezielte personelle und digitale Stärkung der Ausländerbehörden).
- M03: Ursache 601 bestätigt; eigene Bewertung, weil ein Rahmenvertrag für Betreiber weder 6116 (Geld für Kommunen) noch 6121 (verbindlich mehr Plätze) entspricht.
- Keine Maßnahme ohne Ursache. Schwer fiel die Einstufung von M02 (Ursache ja oder nein).
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

