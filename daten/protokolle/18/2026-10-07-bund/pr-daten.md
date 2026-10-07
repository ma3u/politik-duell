## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 11 → 10 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 1806 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1801  1802  1803  1804  1805  1806
Volt-Bund        124     5     5     7     3     4
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1806 (S. 19, 93, 94, 130): Treffer nur zu Soforthilfe/Eigenverantwortung in anderem Zusammenhang; nichts zu Elementarschadenversicherung.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

<details><summary>Ohne Bündel an Ursachen mit Bündeln (2, nur zur Information – je Instrument zählt eine Maßnahme)</summary>

```
Volt (Bund): S. 76 „Klimaanpassung wird als Gemeinschaftsaufgabe im Grundgesetz verankert.“ ohne Bündel (Ursache 1801 hat Bündel)
Volt (Bund): S. 62 „Subventionen für fossile Energieträger in der Industrie vollständig abbauen.“ ohne Bündel (Ursache 1801 hat Bündel)
```

</details>

**Blindliste:** 11 Kennungen, Prüfsumme `b5808b953edbc28a07420511416b7b6fb2b605e409a312afa8d2e70c32b80bca`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 11 Maßnahmen, 18 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M02 1801); offene bestätigt 1; verworfen 1
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Hitze und Unwetter – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1801 1802 1803 1804 1805 1806   alle
Union     4.5  4.5    2    2    2    6     21
SPD       5.3  4.5  7.5    0    0    0   17.3
Grüne     5.3    9    6    8    6    4   38.3
FDP       3.5  3.5    0    0    0    0      7
AfD         0    0    0    0    0    0      0
Linke     4.3  8.1    8    2    0    0   22.4
BSW       4.5  4.5    0    0    6    0     15
Volt      4.8  6.4    7    2    6    0   26.2

BE       1801 1802 1803 1804 1805 1806   alle
Union     4.5  4.5    –    –    –    6      –
SPD       5.3  4.5    –    –    –    0      –
Grüne     5.3    9    –    –    –    4      –
FDP       3.5  3.5    –    –    –    0      –
AfD         0    0    –    –    –    0      –
Linke     4.3  8.1    –    –    –    0      –
BSW       4.5  4.5    –    –    –    0      –
Volt      4.8  6.4    –    –    –    0      –

MV       1801 1802 1803 1804 1805 1806   alle
Union     4.5  4.5    –    –    –    6      –
SPD       5.3  4.5    –    –    –    0      –
Grüne     5.3    9    –    –    –    4      –
FDP       3.5  3.5    –    –    –    0      –
AfD         0    0    –    –    –    0      –
Linke     4.3  8.1    –    –    –    0      –
BSW       4.5  4.5    –    –    –    0      –
Volt      4.8  6.4    –    –    –    0      –

ST       1801 1802 1803 1804 1805 1806   alle
Union     4.5  4.5    –    –    –    6      –
SPD       5.3  4.5    –    –    –    0      –
Grüne     5.3    9    –    –    –    4      –
FDP       3.5  3.5    –    –    –    0      –
AfD         0    0    –    –    –    0      –
Linke     4.3  8.1    –    –    –    0      –
BSW       4.5  4.5    –    –    –    0      –
Volt      4.8  6.4    –    –    –    0      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M02 (Klimaanpassung als Gemeinschaftsaufgabe im Grundgesetz): vorgeschlagene Ursache 1801 nicht bestätigt. Nach Regel 10 ist eine Finanzierungs- und Zuständigkeitszusage für „Klimaanpassung“ allgemein ohne Zweck aus einer Ursache keine Maßnahme. Grenzfall zu Regel 2 (Anpassung mit konkreter Zusage); würde sie gezählt, wäre sie mit Wirksamkeit 1, Umsetzbarkeit 1 (Grundgesetzänderung mit Zweidrittelmehrheit) zu bewerten.
- M08: offene Ursache 1803 bestätigt – das Zitat nennt Gebäudebegrünung und „urbane Widerstandsfähigkeit“ (Stadtbezug, Regel 4), dazu Entsiegelung und Schwammstadt (1804). Zugeordnet zu 7941, da weder Instrument noch Mittel genannt werden.
- M10: nicht 7932 zugeordnet, weil der geforderte Start 2027 seit der EU-Verordnung von 2026 (Start 2028) nicht mehr allein durch Deutschland erreichbar ist (Umsetzbarkeit 1 statt 2). Die Quelle von 7932 (PMC11099057) war nicht erreichbar (Captcha); der Forschungsstand „belegt“ ist aus 7932 übernommen, die Beleg-URL betrifft die Verschiebung.
- M09: schwierig zwischen 2 und 3 – die Wirkung von Hitzeschutzplänen ist gut belegt, die Zusage bleibt aber unbestimmt und die Umsetzung liegt vor allem bei Ländern und Kommunen, daher 2.
- M06: „gemischt“, weil die Emissionswirkung des Subventionsabbaus in der Industrie kaum beziffert ist und Verlagerungsrisiken bestehen; die IISD-Schätzungen betreffen vor allem Verbrauchersubventionen in anderen Ländern (Seite nicht erreichbar, daher nicht als Beleg genutzt).
- Keine neuen Instrumente: die Klimaschutzmaßnahmen M03, M05, M06, M07 kommen je nur einmal vor und unterscheiden sich im Lösungsweg.
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

