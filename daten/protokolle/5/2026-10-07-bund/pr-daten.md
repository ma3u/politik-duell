## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 12 → 11 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 503 Volt; 506 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         501   502   503   504   505   506   507
Volt-Bund         76    40    55    46    31     4     1
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 503 (S. 19, 20, 54): Kapitel zur Einheit (S. 19-20) und Wirtschaftskapitel gelesen: nur Dialogformate und allgemeine Regionalförderung (GRW, Wirtschaftsförderung), keine Zusage zur Lohnangleichung Ost; 'osten'-Treffer sind fast alle 'Kosten'.
Volt-Bund 506 (S. 94, 101): Treffer sind Steuerfreibeträge; keine Zusage zu Hinzuverdienst oder Anrechnung im Bürgergeld im Programm gefunden (Volltextsuche nach Bürgergeld/Hinzuverdienst ohne Treffer).
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 12 Kennungen, Prüfsumme `c67651b717025269b5b097ec355362759428fe25fb1a4b8cc5177cbc3124e0af`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 12 Maßnahmen, 12 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M09 504); offene bestätigt 0; verworfen 1
```

**Hinweise zur Bewertung:** 

```
3 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
M09: Bewertung sieht zusätzlich Ursache 501 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
```

**Punkte** (`npm run punkte`):

```
Arbeitsplätze – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      501  502  503  504  505  506  507   alle
Union       5    2    0    0    4    4    0     15
SPD         5    3    6    4    4    0    6     28
Grüne       5    4    6    4    4    2    6     31
FDP         5    4    2    2    4    4    0     21
AfD       5.5    2    0    2    2    2    0   13.5
Linke       6    4    6    2    0    0    4     22
BSW       3.3    0    6    2    2    0    6   19.3
Volt      5.5  6.5    0    3    4    0    2     21

BE        501  502  503  504  505  506  507   alle
Union       5    2    0    0    4    4    0     15
SPD         5    3    6    4    4    0    6     28
Grüne       5    4    6    4    4    2    6     31
FDP         5    4    2    2    4    4    0     21
AfD       5.5    2    0    2    2    2    0   13.5
Linke       6    4    6    2    0    0    4     22
BSW       3.3    0    6    2    2    0    6   19.3
Volt      5.5  6.5    0    3    4    0    2     21

MV        501  502  503  504  505  506  507   alle
Union       5    2    0    0    4    4    0     15
SPD         5    3    6    4    4    0    6     28
Grüne       5    4    6    4    4    2    6     31
FDP         5    4    2    2    4    4    0     21
AfD       5.5    2    0    2    2    2    0   13.5
Linke       6    4    6    2    0    0    4     22
BSW       3.3    0    6    2    2    0    6   19.3
Volt      5.5  6.5    0    3    4    0    2     21

ST        501  502  503  504  505  506  507   alle
Union       5    2    0    0    4    4    0     15
SPD         5    3    6    4    4    0    6     28
Grüne       5    4    6    4    4    2    6     31
FDP         5    4    2    2    4    4    0     21
AfD       5.5    2    0    2    2    2    0   13.5
Linke       6    4    6    2    0    0    4     22
BSW       3.3    0    6    2    2    0    6   19.3
Volt      5.5  6.5    0    3    4    0    2     21
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M09 (Investitionsprämie für private Investitionen) war 504 zugeordnet. Ursache 504 betrifft die Lücke bei öffentlichen Investitionen (Verkehr, Bildung, Kommunen); eine Prämie für private Investitionen setzt daran nicht an. Ich habe sie dem vorhandenen Instrument 6093 zugeordnet und, so wie dessen Begründung (Bezug auf die Gründe des Sachverständigenrats) es nahelegt, 501 genannt. 501 steht nicht in ursachen_ids, ist also nur ein Hinweis – bitte prüfen, ob 6093 anderswo bei 501 oder 504 steht, und einheitlich entscheiden.
- Offene Ursachen gab es nicht; alle Maßnahmen setzen an mindestens einer Ursache an.
- M12 nicht unter 6091 (systematischer Bürokratieabbau), weil der Umfang (eine Berichtspflicht, rund 4 Mio. Euro) eine deutlich geringere Wirksamkeit ergibt. M02 nicht unter 6095, weil kein Weg genannt ist. M05 (Energiesteuer) nicht unter 6089 (Stromsteuer und Netzentgelte), weil andere Energieträger und Entlastung vor allem außerhalb der Industrie.
- Schwierig: M06 – ob Genehmigungsverfahren zu den „Berichts- und Informationspflichten“ von 505 zählen (Antragsunterlagen sind Informationspflichten, deshalb ja) und ob die feste Drei-Monats-Frist die Umsetzbarkeit auf 1 drückt (EU-UVP-Richtlinie, Vollzug durch Länderbehörden mit Personalmangel). M12: evidenz „belegt“ bezieht sich auf die bezifferte, kleine Entlastung im Gesetzentwurf (gelesen in der Zusammenfassung des NWB-Blogs, die Bundesrat-PDF war nicht lesbar), nicht auf Beschäftigungseffekte. Die vorhandenen Instrumente enthielten in der Liste keine Quellen-URL, daher konnte ich dort keine Quelle zuerst öffnen.
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

