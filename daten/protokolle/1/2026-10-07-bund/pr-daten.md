## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 103 Volt.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
Volt-Bund: neues Bündel 102 „Selbstbeteiligung bei Facharztbesuch ohne Überweisung“ (S. 125)
Volt-Bund: neues Bündel 101 „Regionale Versorgungszentren“ (S. 125)
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         101   102   103
Volt-Bund         17     7     2
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 103 (S. 123, 124): Keine Zusage zu Vergütung nach Versicherungsstatus; Einheitliches Vergütungssystem betrifft Leistungsarten, gemeinsame Krankenversicherung ist Finanzierungsreform ohne Bezug zur Terminvergabe.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 3 Kennungen, Prüfsumme `07711c6b64f0a1dcf23b40fc0b38710d0e29dc8b857146946a2753c65e7b33a6`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Arzttermine – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      101  102  103   alle
Union       0    6    0      6
SPD         4    5    3     12
Grüne       4  6.5    3   13.5
FDP         2    4    2      8
AfD         6    2    2     10
Linke       5    4    2     11
BSW         5    0    2      7
Volt        5    3    0      8

BE        101  102  103   alle
Union       0    6    0      6
SPD         4    5    3     12
Grüne       4  6.5    3   13.5
FDP         2    4    2      8
AfD         6    2    2     10
Linke       5    4    2     11
BSW         5    0    2      7
Volt        5    3    0      8

MV        101  102  103   alle
Union       0    6    0      6
SPD         4    5    3     12
Grüne       4  6.5    3   13.5
FDP         2    4    2      8
AfD         6    2    2     10
Linke       5    4    2     11
BSW         5    0    2      7
Volt        5    3    0      8

ST        101  102  103   alle
Union       0    6    0      6
SPD         4    5    3     12
Grüne       4  6.5    3   13.5
FDP         2    4    2      8
AfD         6    2    2     10
Linke       5    4    2     11
BSW         5    0    2      7
Volt        5    3    0      8
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; ursachen_offen gab es nicht. Keine Maßnahme ohne Ursache.
- M02 (multiprofessionelle regionale Versorgungszentren) dem vorhandenen Instrument 6679 (Gesundheitszentren fördern, Bund) zugeordnet: gleicher Lösungsweg. Grenzfall: Die Einbindung von Gesundheitsfachberufen berührt auch 102 (gezielter Einsatz knappen Personals) bzw. Instrument 6678; das Zitat spricht aber nur von der Einrichtung der Zentren, daher nur 101.
- M03 nicht auf 6677 (Primärarztsystem) gelegt, sondern einzeln: Die Steuerung erfolgt allein über eine Selbstbeteiligung. Dazu gibt es eigene Erfahrungen – die Praxisgebühr 2004–2012 (Gebühr entfiel bei Überweisung) hatte laut Augurzky/Bauer/Schaffner (RWI 2007) keinen signifikanten Effekt auf Arztbesuche; Gatekeeping insgesamt senkt laut Sripa et al. (BJGP 2019, https://pmc.ncbi.nlm.nih.gov/articles/PMC6478478) die Facharztnutzung. Daher Wirksamkeit 1 bei höherer Umsetzbarkeit (3, Bundesrecht, früher schon umgesetzt). Schwierig: Wer das als denselben Lösungsweg wie 6677 sieht, käme auf 2/2.
- M01: Wirksamkeit 1 statt 2, weil mobile Einheiten Folgen des Praxismangels lindern, ohne Niederlassungen zu schaffen (Medibus Hessen ausgelastet, aber als Übergangslösung bezeichnet: https://www.aerzteblatt.de/themen/hessen/rollende-praxis-medibus-erfuellt-die-erwartungen-143298db-4a45-4aa5-8ff7-c28b64a306fc). Umsetzbarkeit 2: Bund kann über SGB V und Finanzierung beitragen, Betrieb liegt bei KVen/Ländern.
- Für 6679 lag keine Quelle vor; die IGES-Studie für die Robert Bosch Stiftung (2021) war als PDF nicht lesbar, die Pressemitteilung (idw-online.de/de/news769524) enthält keine Evaluationsergebnisse – der Forschungsstand „gemischt“ von 6679 bleibt plausibel.
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

