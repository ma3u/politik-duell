## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Union | 3 → 3 |
| SPD | 9 → 9 |
| Grüne | 4 → 4 |
| FDP | 3 → 3 |
| AfD | 1 → 1 |
| Linke | 5 → 5 |
| BSW | 0 → 0 |
| Volt | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 3101 Union, AfD, BSW; 3102 BSW.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3101  3102
Union-Bund         1     7
SPD-Bund          14     6
Grune-Bund        12     5
FDP-Bund           3     6
AfD-Bund           1     1
Linke-Bund        16     5
BSW-Bund           1     2
Volt-Bund          6     3
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 3101 (S. 66, 67): Kapitel Berufliche und akademische Bildung gelesen; nur allgemeine Bekenntnisse (duale Ausbildung voranbringen, Allianz fortführen), nichts zu Ausbildungsvergütung, Tarifbindung oder Azubi-Wohnen.
AfD-Bund 3101 (S. 159, 161, 162): Kapitel berufliche Bildung gelesen: nur Würdigung der dualen Ausbildung, keine Zusage zu Vergütung, Tarifbindung oder Unterstützung von Auszubildenden.
BSW-Bund 3101 (S. 23): Nur Lagebeschreibung (Mangel an bezahlbarem Wohnraum für Auszubildende), keine Handlungszusage.
BSW-Bund 3102 (S. 25): BAföG-Reform und Hochschulsozialpakt nur als 'dringend nötig' bezeichnet, ohne Zusage, Höhe oder Frist.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 28 Kennungen, Prüfsumme `83a72a7423de16841fc3cf59d0d01ff5eb7b08a80a2a613ab93a12d4f90eceae`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 9 Maßnahmen, 13 Zuordnungen (davon 0 offen); nicht bestätigt 2 (M06 3101, M26 3102); offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
M27: Bewertung sieht zusätzlich Ursache 3101 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
Instrument I4: Maßnahmen mit unterschiedlichen Ursachen (M02 3101+3102, M27 3102, M28 3101+3102) – gleicher Lösungsweg, gleiche Zuordnung?
```

**Punkte** (`npm run punkte`):

```
Kosten von Studium und Ausbildung – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     3101 3102   alle
Union       0  5.3    5.3
SPD         9    9     18
Grüne       8    9     17
FDP         3    4      7
AfD         0    3      3
Linke     6.8    3    9.8
BSW         0    0      0
Volt        2    6      8

BE       3101 3102   alle
Union       0  5.3    5.3
SPD         9    9     18
Grüne       8    9     17
FDP         3    4      7
AfD         0    3      3
Linke     6.8    3    9.8
BSW         0    0      0
Volt        2    6      8

MV       3101 3102   alle
Union       0  5.3    5.3
SPD         9    9     18
Grüne       8    9     17
FDP         3    4      7
AfD         0    3      3
Linke     6.8    3    9.8
BSW         0    0      0
Volt        2    6      8

ST       3101 3102   alle
Union       0  5.3    5.3
SPD         9    9     18
Grüne       8    9     17
FDP         3    4      7
AfD         0    3      3
Linke     6.8    3    9.8
BSW         0    0      0
Volt        2    6      8
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: 3101 bei M06 (BAföG-Wohnkostenpauschale gehört laut Regel 1 zu 3102; duale Auszubildende erhalten kein BAföG). 3102 bei M26 (Mobilität steht in Regel 1 nur bei 3101; so auch bei M05, damit beide Ticket-Maßnahmen gleich zugeordnet sind).
- M27: 3101 als Hinweis ergänzt (außerhalb der vorgeschlagenen Liste). Das Programm „Junges Wohnen“ gilt für Studierende und Auszubildende, die Beschreibung nennt Auszubildende; gleicher Lösungsweg wie M02 und M28 (I4), die beide Ursachen haben.
- Keine Maßnahme ohne Ursache; ursachen_offen gab es nicht.
- Schwierig: M05 und M26 (gleicher Lösungsweg, aber „sofort 0 Euro“ für mehrere große Gruppen ist deutlich teurer als „vergünstigt“, daher getrennt mit Umsetzbarkeit 1 bzw. 2). M11 von I2 getrennt, weil „schrittweise“ finanziell eher umsetzbar ist als ein sofortiges elternunabhängiges Vollzuschuss-BAföG. M18 trotz Zielwert (80 %) in I5, weil die Bewertung gleich ausfällt; der Schulgeld-Teil liegt teils bei den Ländern.
- Recherche: Die Websuche war nach einigen Suchen gesperrt (Sitzungsgrenze); für I3 diente ein Pressebericht über den CHE-Studienkredit-Test als Quelle, für Teilzeit-BAföG, Rückzahlungserlass, Stipendien und Führerscheinzuschuss fand ich keine Wirkungsstudien (offen). Die DSW-Seiten waren nicht erreichbar (403).
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

