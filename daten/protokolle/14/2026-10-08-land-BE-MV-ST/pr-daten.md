## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 5 → 4 | 3 → 3 | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **ST** 1402 Volt.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
Volt-BE: neues Bündel 1401 „Durchgängige digitale Prozesse (E-Akte, Once-Only)“ (S. 14)
Volt-BE: neues Bündel 1401 „Bearbeitungsfristen und Genehmigungsfiktion“ (S. 11)
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1401  1402  1403  1404
Volt-BE           54   274     –     –
Volt-MV           12    49     –     –
Volt-ST           59   237     –     –
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-ST 1402 (S. 107, 120, 166, 175): Zusagen zu Personal betreffen Polizei, Justiz, Kommunen-Beratung; keine zur Verwaltung allgemein oder Bürgerbehörden. KI-Treffer meist 'Kinder'.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 11 Kennungen, Prüfsumme `cfa333c6ccd6c349210f41be692495b7618f0b275eb282f1aa36aaf8f7463219`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M10 1401); offene bestätigt 0; verworfen 1
Zuordnung: Volt (MV): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (ST): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
M08: Bewertung sieht zusätzlich Ursache 1403 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M10: Bewertung sieht zusätzlich Ursache 1404 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
```

**Punkte** (`npm run punkte`):

```
Behördengänge – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1401 1402 1403 1404   alle
Union     6.8    4    4    3   17.8
SPD       6.8    5    4    0   15.8
Grüne       6    4    4    3     17
FDP       6.8    4    4    3   17.8
AfD         3    0    0    0      3
Linke       1    0    0    0      1
BSW         4    2    4    0     10
Volt        5    2    4  4.5   15.5

BE       1401 1402 1403 1404   alle
Union       8    4    4    3     19
SPD         6    4    4    0     14
Grüne       6    4    4    3     17
FDP       7.5    3    4    3   17.5
AfD         3    0    0    0      3
Linke       6    0    0    0      6
BSW         4    4    4    0     12
Volt        6    6    4  4.5   20.5

MV       1401 1402 1403 1404   alle
Union       6    0    4    3     13
SPD         6    0    4    0     10
Grüne       0    4    4    3     11
FDP         6    0    4    3     13
AfD         4    4    0    0      8
Linke       0    4    0    0      4
BSW         6    4    4    0     14
Volt        8    2    4  4.5   18.5

ST       1401 1402 1403 1404   alle
Union       3    0    4    3     10
SPD         6    4    4    0     14
Grüne       8    4    4    3     19
FDP         6    0    4    3     13
AfD         6    0    0    0      6
Linke       4    4    0    0      8
BSW         4    4    4    0     12
Volt      7.5    0    4  4.5     16
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M10 (Genehmigungsfiktion) setzt nicht an 1401 an (Auffindbarkeit und durchgängig digitale Online-Angebote), sondern ist eine Verfahrensvereinfachung. Am nächsten liegt 1404 (Überlastung, kleinteilige Vorschriften); 1404 steht nicht in den Listen der Maßnahme und ist daher nur als Hinweis genannt. Hält die Koordination 1404 für unpassend, wäre M10 ohne Ursache (dann fällt sie weg).
- Hinweis-Ursache: M08 nennt ausdrücklich das Once-Only-Prinzip, daher zusätzlich 1403 (Register nicht vernetzt) als Hinweis neben 1401.
- Offene Ursache entschieden: M02 – 1402 bestätigt, aber nur Wirksamkeit 1: Die Automatisierung entlastet, die verbindliche Stellenkürzung in der Ministerialverwaltung (ohne Bürgerkontakt) schöpft den Gewinn ab. Einzeln bewertet, weil sie sich durch die Stellenkürzung deutlich von 7127 unterscheidet.
- Keine Maßnahme ohne Ursache.
- Zuordnungen zu vorhandenen Instrumenten: M01, M06, M11 (Portal/Plattform) sowie M07, M09 (E-Akte, medienbruchfreie Verfahren) zu 7125, weil 7125 „durchgängig digital“ ausdrücklich einschließt; M03 zu 7127; M05 zu 7128 (Besoldung ans Bundesniveau ist ein konkreter Weg der Attraktivitätssteigerung, Bewertung W2/U2 passt auch mit Betrag).
- Schwierig: M08 hätte auch zu 7125 gepasst; wegen des Once-Only-Teils (zusätzliche Ursache, abhängig von der Registermodernisierung) einzeln mit Umsetzbarkeit 2. Die NKR-Quelle aus 6984 (PDF) ließ sich nicht auslesen, daher keine Übernahme von „belegt“ und als Beleg der eGovernment MONITOR 2025 (Nutzer nennen doppelte Dateneingaben und langsame Bearbeitung digitaler Anträge als wichtigste Verbesserungen). M10: Der Beleg ist ein Fachartikel mit Einschätzung eines Verwaltungsrechtlers zu Erfahrungen mit Fiktionen (u. a. Bau), keine systematische Evaluation; Evidenz daher „gemischt“.
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

