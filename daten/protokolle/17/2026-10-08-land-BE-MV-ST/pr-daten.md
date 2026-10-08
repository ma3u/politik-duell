## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 5 → 4 | 2 → 2 | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **BE** 1704 Volt; 1705 Volt. **MV** 1701 Volt; 1704 Volt. **ST** 1701 Volt; 1704 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1701  1702  1703  1704  1705
Volt-BE           27    96     9    45     0
Volt-MV            7    35     2    13     1
Volt-ST           26   114    11    65     4
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 1705 (S. 44, 45): Kapitel Kita (S. 44-45) gelesen; keine Aussage zu Elternbeiträgen. Beitragsfreie Vorschule nur als Best Practice Frankreich.
Volt-MV 1704 (S. 8, 9, 12): Treffer zu 'verlässlich' betreffen digitale Infrastruktur, Schulbetrieb, Mobilität; nichts zu ungeplanten Kita-Schließungen. Ganztagsschule erhalten (S. 9) ist Schulbetreuung, keine Kita-Zusage.
Volt-MV 1701 (S. 5, 9, 10): Keine Zusage zum Ausbau von Kita-Plätzen; Kita-Treffer betreffen Kostenfreiheit, Qualität, Sprachförderung.
Volt-ST 1701 (S. 14, 123): Nur Leitbild ('sozial gerechter Ausbau der Betreuung') bzw. unbestimmter Ausbau von Betreuungs- und Ganztagsangeboten ohne konkrete Zusage zu Plätzen unter Dreijähriger.
Volt-ST 1704 (S. 14, 123): Treffer 'verlässlich' meist in fremdem Zusammenhang; zu Kita-Schließzeiten/Öffnungszeiten keine Zusage.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 10 Kennungen, Prüfsumme `65bcb678ac3679beb6dfeb0b6e6d43efb2028845841df0d0009531d3673d35cd`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M01 1704); offene bestätigt 0; verworfen 1
Zuordnung: Volt (MV): 2 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 3 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** 

```
M01: Bewertung sieht zusätzlich Ursache 1701 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
```

**Punkte** (`npm run punkte`):

```
Kita-Betreuung – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1701 1702 1703 1704 1705   alle
Union       4    0    0    0    3      7
SPD         4    4    0    4    4     16
Grüne       6    4    0    4    4     18
FDP         9    6    4    5    4     28
AfD       7.3    2    0    0    0    9.3
Linke       4    7    4    0    4     19
BSW         6    4    0    0  4.5   14.5
Volt      6.8  6.5    3    2    4   22.3

BE       1701 1702 1703 1704 1705   alle
Union     4.5    4    0    0    4   12.5
SPD         4    6    4    0    0     14
Grüne     7.1    0    4    0    0   11.1
FDP         9    6    4    0    0     19
AfD         7    4    4    0    5     20
Linke       9    9    9    0  5.5   32.5
BSW         0    0    0    0    0      0
Volt        6    6    6    0    0     18

MV       1701 1702 1703 1704 1705   alle
Union       7    7    4    0    0     18
SPD         6    4    4    0    4     18
Grüne       6    6    4    0    4     20
FDP         7  7.4    6    6    0   26.4
AfD         4    6    4    0    4     18
Linke       6    0    4    0    4     14
BSW         0    4    4    0    4     12
Volt        0    4    4    0    4     12

ST       1701 1702 1703 1704 1705   alle
Union       9  8.8    6    6    0   29.8
SPD       6.3    6    4    0    3   19.3
Grüne       8  7.5    4    0    3   22.5
FDP         4    6    4    4    3     21
AfD         0    0    0    0    4      4
Linke       5    9    8    0  6.5   28.5
BSW         0    6    4    0    4     14
Volt        0    6    4    0    4     14
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M01 -> 1704. Flexiblere Öffnungszeiten für Schichtarbeitende setzen nicht an ungeplanten Schließtagen an, sondern an der Passung von Angebot und Bedarf. Stattdessen 1701 genannt (außerhalb der vorgeschlagenen Listen, als Hinweis); das DJI belegt, dass Eltern zeitlich flexiblere Angebote wünschen und die Lücke zwischen Wunsch und Nutzung auch an fehlender Passung liegt. Wird 1701 nicht übernommen, setzt M01 an keiner der vorgeschlagenen Ursachen an.
- Offen entschieden: M09 -> 1702 bestätigt, weil der Text ausdrücklich „mehr pädagogisches Personal“ zusagt (wie M05: „mehr pädagogisches Personal pro Gruppe“ plus Vergütung). M02 nennt nur Zielgrößen ohne Weg zu mehr Personal, daher nur 1703.
- Zuordnung zu vorhandenen Instrumenten: M02 entspricht genau 7286 (1:3 / 1:7,5, Land). M05 und M09 ohne Zielwert -> 7287 (schrittweise Verbesserung); M05 enthält zusätzlich Vergütung, die Bewertung (2/2) wäre bei 7291 gleich. M04 (6 Stunden beitragsfrei, darüber einkommensgestaffelt) und M06 (Beitragsfreiheit sichern) -> 7302; die Teil-Beitragsfreiheit mit Staffelung wäre nicht anders zu bewerten. M10 (Vorrang für Quartiere mit hohem Bedarf beim Ausbau) -> 7276 (bedarfsorientierte Steuerung), alternativ 7274.
- Quellen der vorhandenen Instrumente geöffnet (DJI ERiK 2024 zu Personalschlüsseln und Ausfällen; DJI Personalkrise; DJI gebührenfreie Kitas; DJI bedarfsgerechte Angebote; DJI flexible Betreuungsangebote): Sie tragen die jeweiligen Einstufungen. Die Quelle von 7298 (DJI ERiK 2024) sagt zu multiprofessionellen Teams wenig; die Einstufung „gemischt“ bleibt vertretbar, eine passendere Quelle wäre wünschenswert.
- Schwer fiel: M01 (Ursache), M10 (zwischen Planung 7276 und Ausbau 7274).
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

