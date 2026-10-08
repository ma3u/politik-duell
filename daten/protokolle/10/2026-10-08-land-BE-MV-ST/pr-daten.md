## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 0 → 0 | 1 → 1 | 1 → 1 |

**Ohne Maßnahme zu einer Ursache:** **BE** 1005 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1001  1002  1003  1004  1005
Volt-BE            –     –     –     –     0
Volt-MV            –     –     –     –     3
Volt-ST            –     –     –     –     9
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 1005 (S. 80, 82): Nur Unterstützung pflegender Angehöriger, Hotline, Gesundheitskioske; keine Förderung von Heim-Investitionskosten.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 2 Kennungen, Prüfsumme `c511070c76b8c8ef8b233fa543c73cddba69beb274d937877d9a270e5f2a8aef`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Pflege – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    2   23.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    2   19.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    0      4

BE       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    0   21.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    4     13
Linke     7.4    5    0    5    4   21.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    0      4

MV       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    3   21.8
SPD       7.6    5    3    6    0   21.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    3   20.4
BSW       5.5    3    0    1    4   13.5
Volt        0    0    0    4    3      7

ST       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    3   24.6
Grüne     7.1    2    3    9    4   25.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    4   21.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    3      7
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01: Vorschlag 1005 bestätigt. „Ausbau der Investitionskostenförderung“ ohne Umfang entspricht dem vorhandenen Instrument 6448 (Landesbeteiligung ohne Umfang). Recherche: vdek-Analyse (über AOK, https://www.aok.de/pp/gg/update/vdek-analyse/) – Länder trugen 2022 rund 876 Mio. Euro Investitionskosten, Bewohner rund 4,4 Mrd.; volle Übernahme entlastete im Schnitt um 498 Euro im Monat. Das stützt die Richtung, nicht den Umfang ohne Zielwert; deshalb Werte von 6448 passend.
- M02: offene Ursache 1005 angenommen, als Einzelbewertung. Grenzfall: Das Zitat nennt nur „Versorgung vor Ort sichern“, die Beschreibung zusätzlich „bezahlbar halten“; eine Landesförderung von Einrichtungen wirkt am ehesten über die weitergegebenen Investitionskosten. Nicht 6449 zugeordnet, weil Bau/Sanierung nicht genannt ist und die Förderung auf Trägerarten zielt. Daten (pflegemarkt.com laut t-online) zeigen, dass kommunale und freigemeinnützige Heime im Schnitt höhere Eigenanteile haben als private – Wirkung auf die Bezahlbarkeit daher offen. Wer 1005 hier zu weit gefasst findet, kann M02 auf „ursachen: []“ setzen (Versorgungssicherung ist keine erfasste Ursache).
- Keine Maßnahme ohne Ursache.
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

