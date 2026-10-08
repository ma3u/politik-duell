## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 5 → 5 | 0 → 0 | 4 → 4 |

**Ohne Maßnahme zu einer Ursache:** **MV** 2901 Volt; 2903 Volt; 2904 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2901  2902  2903  2904  2905
Volt-BE            3     –    18     1     –
Volt-MV            2     –     6     0     –
Volt-ST            1     –    25     8     –
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-MV 2901 (S. 13, 26): S. 13 nennt Einsamkeit nur als Lagebeschreibung und Leitbild; S. 26 Co-Working/Co-Living als Begegnungsstätten dient Arbeitsbedingungen, kein Bezug zu Verwitwung oder Einsamkeit.
Volt-MV 2903 (S. 30, 32, 44, 64): S. 44 und 64 Resilienz im Sinne Digital/Landwirtschaft; S. 30 Diagnostikzentren (ADHS, Autismus) und S. 32 Gesundheitsstützpunkte ohne Bezug zu psychischer Aufklärung oder Beratung; S. 29 nur Lagebeschreibung.
Volt-MV 2904 (S. 29): Keine Treffer; kein Kapitel zu Entstigmatisierung oder Männergesundheit.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 9 Kennungen, Prüfsumme `02e8e1a0b85c98f0a9fa8b3a6e334c261b5e127cb27f4e7f7c23899425724be5`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
M05: Bewertung sieht zusätzlich Ursache 2903 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
Instrument 8154: Maßnahmen mit unterschiedlichen Ursachen (M04 2903, M05 2904) – gleicher Lösungsweg, gleiche Zuordnung?
```

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
Volt        6    0    6    3    6     21

MV       2901 2902 2903 2904 2905   alle
Union     8.8    0    4    0    3   15.8
SPD         6    4    3    0    0     13
Grüne       6    6  8.8    3    8   31.8
FDP         6    0    6    0    3     15
AfD         3    3    4    0    0     10
Linke       6  4.6  8.8    0    8   27.4
BSW       8.3    5    9    0    2   24.3
Volt        0    0    0    0    6      6

ST       2901 2902 2903 2904 2905   alle
Union       6    0    3    0    3     12
SPD         9    4    9    3    0     25
Grüne     8.9    6  7.5  4.5    8   34.9
FDP         6    0    0    0    3      9
AfD         0    3    0    0    0      3
Linke       9  4.6  7.5    4    8   33.1
BSW         0    5    8    0    2     15
Volt        3    0    6  7.5    6   22.5
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle Maßnahmen sind Landesebene; alle vorgeschlagenen Ursachen bestätigt. Keine offenen Ursachen in der Liste. Keine Maßnahme ohne Ursache.
- M05: zusätzlich 2903 genannt (Hinweis, nicht in ursachen_ids), weil der Text neben Männerberatung allgemein den Ausbau psychosozialer Beratung zusagt – nach Regel 1 niedrigschwellige Beratung (2903). Zugeordnet zu 8154, da derselbe Lösungsweg (Beratungsstellen ausbauen); die zielgruppengerechte Ausrichtung auf Männer stützt eine Review zu Hilfesuche-Interventionen für Männer (7 von 9 Studien mit Verbesserung, meist nur Einstellungen gemessen, https://pmc.ncbi.nlm.nih.gov/articles/PMC6560805/), daher keine abweichende Bewertung.
- M02: Mental Health Coaches an Schulen und Jugendzentren zu 8150 (zusätzliches Fachpersonal an Schulen) statt 8151 (Lehrplan), weil das Personal der stärkere Teil der Zusage ist. Die Evaluation eines vergleichbaren Modellprogramms misst vor allem Akzeptanz, nicht Wirkung auf psychische Gesundheit – passt zu „offen“ in 8150. Lehrplan-Teil allein wäre 8151.
- M07: Einbeziehung Betroffener in Anti-Stigma-Kampagnen zu 8152; Kontaktansätze sind laut Übersicht die wirksamste Form, aber nur kurzfristig belegt – daher keine Höherstufung.
- M09 fiel schwer: Gesundheitskioske sind allgemeine Gesundheitsberatung, psychische Gesundheit nennt das Zitat nicht ausdrücklich. 2903 als Randbezug bestätigt (Wirksamkeit 1); man könnte auch „keine Ursache“ vertreten.
- M08 fiel schwer: „Programme gegen Einsamkeit“ ohne Inhalt – nicht 8143 (Strategie/Koordination), da Programme angekündigt werden, aber auch nicht 8142, da kein konkretes Angebot benannt ist; daher Einzelbewertung mit 1.
- Quellen 21843337, 26410341, 31734106 und PMC13341547 über die Europe-PMC-Schnittstelle geprüft (Seiten selbst gaben 403); Forschungsstand der Instrumente übernommen.
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

