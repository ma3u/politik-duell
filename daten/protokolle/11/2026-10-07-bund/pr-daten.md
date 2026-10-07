## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 6 → 6 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 1102 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1101  1102  1103  1104  1105
Volt-Bund         26    77    18    13    51
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1102 (S. 53, 55, 74): Treffer zu Wettbewerb betreffen Wettbewerbsfähigkeit und Unternehmensthemen; nichts zu Lebensmittelhandel, Marktkonzentration oder Preisaufsicht.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 6 Kennungen, Prüfsumme `16a2730690b5d43889f2875ba9c9e66df172bfdce0c75985955cc5d738431168`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 6 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
```

**Punkte** (`npm run punkte`):

```
Preise und Löhne – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1101 1102 1103 1104 1105   alle
Union       3    0    0    3    2      8
SPD         3    3  7.5    4  7.5     25
Grüne       0    3  7.5    4  8.3   22.8
FDP         0    0    0    3    0      3
AfD         0    0    0    3    0      3
Linke       4  3.8  7.5    4  8.5   27.8
BSW       5.5  4.8  7.5  5.5  8.3   31.6
Volt      4.5    0  7.5    3    8     23

BE       1101 1102 1103 1104 1105   alle
Union       3    0    0    3    2      8
SPD         3    3  7.5    4  7.5     25
Grüne       0    3  7.5    4  8.3   22.8
FDP         0    0    0    3    0      3
AfD         0    0    0    3    0      3
Linke       4  3.8  7.5    4  8.5   27.8
BSW       5.5  4.8  7.5  5.5  8.3   31.6
Volt      4.5    0  7.5    3    8     23

MV       1101 1102 1103 1104 1105   alle
Union       3    0    0    3    2      8
SPD         3    3  7.5    4  7.5     25
Grüne       0    3  7.5    4  8.3   22.8
FDP         0    0    0    3    0      3
AfD         0    0    0    3    0      3
Linke       4  3.8  7.5    4  8.5   27.8
BSW       5.5  4.8  7.5  5.5  8.3   31.6
Volt      4.5    0  7.5    3    8     23

ST       1101 1102 1103 1104 1105   alle
Union       3    0    0    3    2      8
SPD         3    3  7.5    4  7.5     25
Grüne       0    3  7.5    4  8.3   22.8
FDP         0    0    0    3    0      3
AfD         0    0    0    3    0      3
Linke       4  3.8  7.5    4  8.5   27.8
BSW       5.5  4.8  7.5  5.5  8.3   31.6
Volt      4.5    0  7.5    3    8     23
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Ursachen: Alle vorgeschlagenen Ursachen bestätigt; die Liste hat keine offenen Ursachen und keine Regeln. Bei M01 (Mehrwertsteuer-Nullsatz) ist 1101 ein Grenzfall: Die Maßnahme senkt den Lebensmittelpreis, setzt aber nicht an den Energiekosten an. Sie bleibt bei 1101, weil das die einzige Ursache zum Preisniveau von Lebensmitteln ist; die Koordination sollte prüfen, ob Preissenkungen über Steuern dieser Ursache überall gleich zugeordnet werden.
- Keine Maßnahme ohne Ursache.
- M02 dem vorhandenen Instrument 7228 zugeordnet (Qualifizierung als Weg aus dem Niedriglohnbereich), auch wenn der Text auf Langzeitarbeitslose und Lohnkostenzuschüsse zielt; die Wirkung auf 1105 ist ebenso indirekt.
- M03 eigene Bewertung statt 6885/6886: Eine nur moderate Anhebung des Grundfreibetrags ist günstiger und routinemäßig umsetzbar (Umsetzbarkeit 3), wirkt aber schwächer (Wirksamkeit 1). Quelle zur Größenordnung war ein Gesetzentwurf (BT-Drs. 20/12783), deshalb keine Studien-URL.
- M04 fiel schwer: Die Weitergabe von Energiesteuersenkungen ist gut belegt (Kahl 2024, Energy Economics, Tankrabatt), die Wirkung auf Lebensmittelpreise kaum untersucht, daher „gemischt“. Umsetzbarkeit 1 wegen ungeklärter Finanzierung und des EU-abhängigen Teils.
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

