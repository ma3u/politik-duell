## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2901 Volt; 2902 Volt; 2904 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2901  2902  2903  2904  2905
Volt-Bund          0    10    22     7     1
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 2902 (S. 38, 89, 92, 108, 109, 130, 132): Ehrenamt-Informationen, Rentenpunkte und Mindestlohn setzen nicht an Einsamkeit durch Armut an; 'Maßnahmen gegen die Vereinsamung' (S. 132) ist ohne konkrete Handlung.
Volt-Bund 2904 (S. 132, 133, 38): Entstigmatisierung nur im Suchtkontext (S. 133, gehört zu Sucht); nichts zu Männern oder Scham bei Hilfesuche.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 3 Kennungen, Prüfsumme `143bf8eb9b05f7537a86d4c05a35d577601c8a5d98a584609ca31bd1ebb310e9`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Einsamkeit und psychische Belastung – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2901 2902 2903 2904 2905   alle
Union       2    0    2    0    3      7
SPD         0    4    0    0    0      4
Grüne       0    6    9    0    8     23
FDP         2    0    4    0    3      9
AfD         0    3    0    0    0      3
Linke       0  4.6    0    0    8   12.6
BSW         0    5    0    0    2      7
Volt        0    0    3    0    6      9

BE       2901 2902 2903 2904 2905   alle
Union     7.5    0    8    0    3   18.5
SPD       8.5    4    9    0    0   21.5
Grüne       9    6    9    3    8     35
FDP         3    0    0    3    3      9
AfD         3    3    0    0    0      6
Linke       9  4.6    9    3    8   33.6
BSW         6    5    4    0    2     17
Volt        –    0    –    –    6      –

MV       2901 2902 2903 2904 2905   alle
Union     8.8    0    4    0    3   15.8
SPD         6    4    3    0    0     13
Grüne       6    6  8.8    3    8   31.8
FDP         6    0    6    0    3     15
AfD         3    3    4    0    0     10
Linke       6  4.6  8.8    0    8   27.4
BSW       8.3    5    9    0    2   24.3
Volt        –    0    –    –    6      –

ST       2901 2902 2903 2904 2905   alle
Union       6    0    3    0    3     12
SPD         9    4    9    3    0     25
Grüne     8.9    6  7.5  4.5    8   34.9
FDP         6    0    0    0    3      9
AfD         0    3    0    0    0      3
Linke       9  4.6  7.5    4    8   33.1
BSW         0    5    8    0    2     15
Volt        –    0    –    –    6      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; keine offenen Ursachen in der Liste; keine Maßnahme ohne Ursache.
- M01 entspricht dem vorhandenen Instrument 8167 (gleicher Lösungsweg, Ebene Bund). Dessen Quelle (Befragung von 447 Psychotherapeuten zur Terminservicestelle, 2026) über die Europe-PMC-Schnittstelle geöffnet: fehlende Kapazitäten als Haupthindernis, trägt die Einstufung.
- M02: Quelle des Landesinstruments 8151 (Netzwerk-Metaanalyse, 137 Studien, 2019) geöffnet und übernommen; auf Bundesebene Umsetzbarkeit 2, weil Kita und Schule in Länderzuständigkeit liegen.
- Grenzfall M03: Gesundheitskioske bieten allgemeine Gesundheitsberatung, nicht ausdrücklich zu psychischer Gesundheit. Zuordnung zu 2903 (niedrigschwellige Beratung) beibehalten, dafür Wirksamkeit nur 1. Die Evaluation (Hamburg, INVEST Billstedt/Horn) zeigt hohe Nutzung und weniger vermeidbare Krankenhausfälle, laut Berichterstattung aber keine signifikante Verbesserung bei Gesundheitskompetenz und Lebensqualität; daher „gemischt“. Die Prüfenden könnten auch eine Zuordnung ohne Ursache vertreten.
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

