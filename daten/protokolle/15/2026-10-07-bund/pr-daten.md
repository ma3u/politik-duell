## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 1501 Volt; 1503 Volt; 1504 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1501  1502  1503  1504  1505
Volt-Bund         13     4    77    94     2
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1501 (S. 44, 66, 67): Wasserstoff nur für Industrie und Wärme, Diversifizierung nur von Lieferketten gegenüber China; nichts zu Ölabhängigkeit oder Kraftstoffen.
Volt-Bund 1503 (S. 48, 50, 53, 55): 'Wettbewerb' nur als Wettbewerbsfähigkeit der Wirtschaft; nichts zu Kartellrecht oder Preisaufsicht bei Kraftstoffen.
Volt-Bund 1504 (S. 54, 62, 68, 70): 'Förderung' in anderen Zusammenhängen; Investitionsprämie und Subventionen betreffen Unternehmen; keine Kaufprämie oder Social Leasing für E-Autos.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 3 Kennungen, Prüfsumme `c5e162dd2b1eac7c306045ae86eb1a3a604f99bfa23f2da47e76b7200d14befd`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Autofahren – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1501 1502 1503 1504 1505   alle
Union     3.8    4    0    0    3   10.8
SPD         3    2    0    6    3     14
Grüne       3    2    0    6    3     14
FDP         1    1    0    0    0      2
AfD         1    5    0    0    0      6
Linke       3  4.5    0    6    3   16.5
BSW       4.3    2    0    6    0   12.3
Volt        0    4    0    0    3      7

BE       1501 1502 1503 1504 1505   alle
Union     3.8    4    0    0    3   10.8
SPD         3    2    0    6    3     14
Grüne       3    2    0    6    3     14
FDP         1    1    0    0    0      2
AfD         1    5    0    0    0      6
Linke       3  4.5    0    6    3   16.5
BSW       4.3    2    0    6    0   12.3
Volt        0    4    0    0    3      7

MV       1501 1502 1503 1504 1505   alle
Union     3.8    4    0    0    3   10.8
SPD         3    2    0    6    3     14
Grüne       3    2    0    6    3     14
FDP         1    1    0    0    0      2
AfD         1    5    0    0    0      6
Linke       3  4.5    0    6    3   16.5
BSW       4.3    2    0    6    0   12.3
Volt        0    4    0    0    3      7

ST       1501 1502 1503 1504 1505   alle
Union     3.8    4    0    0    3   10.8
SPD         3    2    0    6    3     14
Grüne       3    2    0    6    3     14
FDP         1    1    0    0    0      2
AfD         1    5    0    0    0      6
Linke       3  4.5    0    6    3   16.5
BSW       4.3    2    0    6    0   12.3
Volt        0    4    0    0    3      7
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; offene Ursachen gab es nicht. Keine Maßnahme ohne Ursache.
- M02 (Ausbau der Ladeinfrastruktur) auf das vorhandene Instrument 7015 gelegt: gleicher Lösungsweg und gleiche Ebene; die Preiskomponente von 7015 fehlt im Text, ändert die Bewertung aber nicht.
- M01: Vorhandenes Instrument 7260 (Senkung in Preiskrisen, befristet, inkl. Umsatzsteuer) passt nicht, da M01 eine dauerhafte Senkung nur der Energiesteuer ist. Die Monopolkommission-Quelle von 7260 war nur als nicht lesbares PDF abrufbar; stattdessen ZEW-Studie (Dovern u. a. 2023) zum Tankrabatt 2022 geöffnet. Kosten hochgerechnet aus den Steuerausfällen des Tankrabatts (3,15 Mrd. Euro für drei Monate, Bundestag). Schwierig: Wirksamkeit 2 oder 3 – direkt an der Hauptursache Steuern und gut belegte Weitergabe bei Benzin, aber bei Diesel nur teilweise und kleiner Betrag; 2 auch in Linie mit 7011 (CO₂-Preis abschaffen). Umsetzbarkeit 2 statt 1: rechtlich erprobt (2022), aber dauerhafter Einnahmeausfall von rund 12 Mrd. Euro ohne Gegenfinanzierung im Text – Prüfende könnten hier 1 sehen.
- M03: setzt an der Ursache Steuern an, aber in Gegenrichtung (Steuererhöhung für Diesel); daher Wirksamkeit 0 mit Zuordnung statt leerer Ursachenliste. Grenzfall, ob stattdessen „ursachen: []“ passender wäre.
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

