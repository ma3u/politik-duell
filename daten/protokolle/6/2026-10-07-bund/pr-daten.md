## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 8 → 8 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 601 Volt; 604 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         601   602   603   604   605   606
Volt-Bund         27    24    11    12    19     8
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 601 (S. 15, 135, 136, 137): Treffer zu Kommunen nur allgemeine Finanzstärkung, nichts zu Unterbringung oder Kapazitäten für Neuankommende; Resettlement-Passage nur allgemein.
Volt-Bund 604 (S. 26, 139, 137): Keine strengere Identitätsprüfung; Treffer 'Identität' betreffen andere Zusammenhänge; Rückführung wird nur als freiwillige Rückkehr ohne Druck genannt.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 8 Kennungen, Prüfsumme `2f13c27b7c3bd0b0983c2c516d4322a00f526583c00d58fab4945622f1b5c543`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 8 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
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
Volt        –    4    9    0    1    6      –

MV        601  602  603  604  605  606   alle
Union       3    3    8  8.8  1.5    8   32.3
SPD         0    4    6    4    1    8     23
Grüne       2    0    9    5    1    8     25
FDP         6    2  5.5  3.3  1.5    4   22.3
AfD       4.3    5    2  4.6  1.5    4   21.4
Linke       2    0    9    0    1    6     18
BSW       4.3    4    8    2    1    0   19.3
Volt        –    4    9    0    1    6      –

ST        601  602  603  604  605  606   alle
Union     6.1    3    8  8.8  1.5    8   35.4
SPD         2    4    6    4    1    8     25
Grüne       5    0    9    5    1    8     28
FDP         4    2  5.5  3.3  1.5    4   20.3
AfD       5.1    5    2  4.6  1.5    4   22.2
Linke       2    0    9    0    1    6     18
BSW         1    4    8    2    1    0     16
Volt        –    4    9    0    1    6      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; keine offenen Ursachen in der Liste, keine Maßnahme ohne Ursache.
- M01 (Arbeitserlaubnis ab Tag 1) dem Instrument 6110 zugeordnet; Forschungsstand gestützt durch Marbach/Hainmueller/Hangartner 2018 (https://pmc.ncbi.nlm.nih.gov/articles/PMC6155022): sieben Monate längeres Arbeitsverbot senkte die Beschäftigung fünf Jahre später um rund 20 Prozentpunkte.
- M02 und M03 (Bleiberecht nach Arbeit bzw. nach drei Jahren nicht vollzogener Abschiebung) beide Instrument 6108 (Spurwechsel/Bleiberecht für Geduldete); nur Ursache 606, nicht 604 – sie beenden Duldungen, nicht Rückführungen.
- M04 (pauschale Anerkennung nach Berufsbild) zu 6101 gestellt, obwohl sie weiter geht als „vereinfachen“: Schwer fiel die Frage, ob eine pauschale Gleichwertigkeit bei reglementierten Berufen (Länderrecht, Qualitätsanforderungen) eine eigene, niedrigere Umsetzbarkeit verdient; 2/2 erschien passend.
- M06 nur 605 (Dublin), nicht 601: 601 ist eine Landes-Ursache, und die EU-Verteilung wirkt dort nur mittelbar.
- M08 schwierig: Die NRW-Erfahrung (Durchschnitt 16,4 auf 12,2 Monate, Evaluation des Justizministeriums, https://www.land.nrw/pressemitteilung/massnahmen-zur-beschleunigung-der-verwaltungsgerichtlichen-asylverfahren) vermischt Spezialisierung nach Herkunftsländern mit Personalaufbau und ist eine interne Auswertung, daher „offen“ und Wirksamkeit 1, zumal § 83 AsylG Spezialkammern bereits als Soll-Vorschrift enthält. Kein beleg_studie_url, weil die Quelle keine Studie ist.
- M07: Die Asylverfahrensberatung existiert seit 2023 mit Bundesförderung; die BAMF-Evaluation (Forschungsbericht 54, 2026) fand nur geringe Effekte auf Klageverhalten und konnte keine Wirkungsanalyse durchführen.
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

