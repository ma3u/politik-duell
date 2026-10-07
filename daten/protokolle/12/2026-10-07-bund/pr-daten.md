## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 6 → 6 |

**Ohne Maßnahme zu einer Ursache:** keine

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1201  1202  1203  1204
Volt-Bund        117    32    18    29
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1203 (S. 41, 54, 97, 53): Nur Vergaberecht allgemein (S. 54, ohne Bezug zu Bau) und Bauvorschriften für Wohnungsbau (S. 97); Verfahren für Infrastrukturprojekte (S. 53) bei 1201 erfasst, ersatzweise offen. Kein Personal in Bauverwaltungen.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 6 Kennungen, Prüfsumme `32d776a472db5d3da300e280efac1e30ffceb4613d9f6726d091062190a39a5b`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 6 Maßnahmen, 7 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Straßen und Brücken – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1201 1202 1203 1204   alle
Union       9    0    6    4     19
SPD         9    2    7  5.5   23.5
Grüne       9    2    0    8     19
FDP         8    0  7.5    0   15.5
AfD         9    0    6    0     15
Linke       7    2    0    8     17
BSW         8    5    0    0     13
Volt      6.5    1    2    9   18.5

BE       1201 1202 1203 1204   alle
Union       9    6    0    6     21
SPD         9    6    0    9     24
Grüne       9    0    0    9     18
FDP         8    0    0    6     14
AfD         9    6    0    6     21
Linke       7    6    4    9     26
BSW         8    6    0    6     20
Volt      6.5    –    –    –      –

MV       1201 1202 1203 1204   alle
Union       9    2    8    6     25
SPD         9    6    6    9     30
Grüne       9    0    0    6     15
FDP         8    7    6    6     27
AfD         9    6    6    6     27
Linke       7    2    0    6     15
BSW         8    6    6    6     26
Volt      6.5    –    –    –      –

ST       1201 1202 1203 1204   alle
Union       9    6    6  7.5   28.5
SPD         9    6    0  7.5   22.5
Grüne       9    7    0    6     22
FDP         8    6    6    6     26
AfD         9    6    6    9     30
Linke       7    6    0    9     22
BSW         8    2    6    6     22
Volt      6.5    –    –    –      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt. Offene Ursache 1203 bei M05 bestätigt: Die Maßnahme betrifft Infrastrukturprojekte allgemein, und lange Genehmigungen nennt die KfW als Hemmnis kommunaler Investitionen.
- Keine Maßnahme ohne Ursache.
- M01 einzeln statt Instrument 6937: Tempo 80 auf Landstraßen schließt die Lücke, die 6937 die Wirksamkeit 3 kostete (Landstraßen nicht erfasst); Quelle Cerema-Evaluation zu Frankreich (90 auf 80 km/h). Schwierig: Die Evaluation misst alle Getöteten, nicht nur Radfahrende; die Wirkung auf Radunfälle ergibt sich aus der allgemeinen Geschwindigkeits-Unfall-Beziehung.
- M02 (streckenabhängige Pkw-Maut) Instrument 6932 zugeordnet (Nutzerfinanzierung der Autobahnen); eine nicht diskriminierende streckenabhängige Maut gilt als EU-rechtlich zulässig, anders als die gescheiterte Infrastrukturabgabe.
- M05 einzeln statt 6933, weil die feste Drei-Monats-Frist für alle Infrastrukturprojekte die Umsetzbarkeit senkt.
- M06 einzeln statt 6934, weil der Ersatz aufkommensneutral ist (kein zusätzliches Geld) und eine Grundgesetzänderung naheliegt. Zur Wirkung auf Straßeninvestitionen fand ich keine Untersuchung (offen).
- Hinweis zu M03: Die Ausnahme von der Schuldenbremse könnte auch 1202 betreffen (Länder und Kommunen); nicht genannt, da nicht in den Listen und das Zitat nur allgemein von Infrastruktur spricht.
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

