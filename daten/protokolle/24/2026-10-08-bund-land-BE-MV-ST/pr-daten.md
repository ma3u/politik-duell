## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 3 → 3 | 0 → 0 | 6 → 6 | 7 → 7 |
| SPD | 4 → 4 | 2 → 0 | 3 → 3 | 6 → 6 |
| Grüne | 5 → 5 | 2 → 1 | 6 → 6 | 1 → 1 |
| FDP | 1 → 1 | 1 → 1 | 4 → 4 | 5 → 5 |
| AfD | 3 → 3 | 3 → 3 | 2 → 2 | 8 → 8 |
| Linke | 4 → 4 | 1 → 1 | 3 → 3 | 4 → 3 |
| BSW | 2 → 2 | 1 → 1 | 4 → 4 | 5 → 5 |
| Volt | 6 → 6 | 1 → 0 | 2 → 2 | 4 → 4 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2401 Union, SPD, Grüne, FDP, AfD, BSW; 2402 Union, SPD, Grüne, FDP, Linke, BSW; 2403 AfD; 2404 FDP, AfD. **BE** 2401 Union, SPD, Grüne, FDP, AfD, Linke, BSW, Volt; 2402 Union, SPD, FDP, Linke, BSW, Volt; 2404 Union, SPD, Grüne, Volt. **MV** 2401 AfD, BSW, Volt; 2402 Union, SPD, Grüne, FDP, Linke, BSW, Volt. **ST** 2401 Grüne, Linke; 2402 SPD, Grüne, BSW, Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2401  2402  2403  2404
Union-Bund         2     3     2     1
Union-BE           2     0     –     7
Union-MV          17     0     –    22
Union-ST           0     2     –    14
SPD-Bund           5     0     8     6
SPD-BE             4     5     –     0
SPD-MV             5     2     –     6
SPD-ST             3     2     –     5
Grune-Bund        13     4     6     8
Grune-BE           4     4     –     3
Grune-MV          14     1     –     2
Grune-ST           3     2     –     4
FDP-Bund           4     2     3     1
FDP-BE             1     2     –     8
FDP-MV             9     6     –    11
FDP-ST             2     0     –     9
AfD-Bund          19    22     2     1
AfD-BE            12     6     –     2
AfD-MV            14     5     –     4
AfD-ST            46    18     –     6
Linke-Bund         7     2     9     7
Linke-BE           3     4     –     3
Linke-MV           5     1     –     3
Linke-ST           7     4     –    10
BSW-Bund           3     0     1     3
BSW-BE             3     0     –     1
BSW-MV             4     0     –     5
BSW-ST             8     7     –     7
Volt-Bund          3     1     5     8
Volt-BE            1     0     –     6
Volt-MV            4     1     –     3
Volt-ST           25     5     –     6
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 2401 (S. 6, 60): Treffer zu Zuzug betreffen Migrationsbegrenzung bzw. Familiennachzug, nicht Halten oder Zurückholen junger Menschen in der Region.
Union-Bund 2402 (S. 6, 69): Treffer betreffen Migration und Alterung im Gesundheitssystem; keine Zusage zu Geburten, Zuzug oder Anpassung an Schrumpfung.
Union-BE 2401 (S. 49, 103): S. 49 Hochschulstandorte: Sanierung Berliner Hochschulen, keine Bindung junger Menschen aus ländlichen Regionen; S. 103 Rückkehrprogramme für EU-Bürger ohne Perspektive, anderer Zusammenhang.
Union-BE 2402 (S. 108, 109): Familien- und Generationenkapitel betrifft Berlin-Alltag, nicht Geburten/Alterung in schrumpfenden Regionen.
Union-BE 2404 (S. 32, 34, 35, 42, 50, 81, 83): Genehmigungsverfahren betreffen Energie, Bau, Wirtschaft, Gewässer in Berlin, keine Kommunalfinanzen oder Planungskapazitäten strukturschwacher Kommunen (R2).
Union-ST 2403 (S. 76): Nur allgemeine Aussage zu durchlässigen Bildungswegen, keine Ausbildungsplatz-Zusage mit Regionsbezug.
SPD-Bund 2401 (S. 14, 16, 21, 52, 53): Wohnheim-, BAföG- und Wohnungsmaßnahmen sowie Fachkräfteeinwanderung ohne Bezug zu Region/Abwanderung (R2); Leerstand-Strategie und Stärkung ländlicher Räume setzen nicht an Halten/Zurückholen junger Menschen an.
SPD-Bund 2402 (S. 14, 52): Keine Zusage zu Geburten, Alterung oder Zuzug in Regionen; allgemeine Fachkräfteeinwanderung ohne Regionbezug.
SPD-BE 2402 (S. 7, 8, 35, 37, 52): Treffer sind Zuzug-Erwähnungen im Wohnungsbau, Fachkräfte, Kita-Finanzierung und Rückkehrhilfen für Geflüchtete; keine Zusage zu Geburten oder Alterung ländlicher Regionen.
SPD-BE 2404 (S. 60, 63): Berlin ist Stadtstaat; Haushalts- und Bezirksfinanzierung betrifft nicht die Finanzkraft strukturschwacher Kommunen, kein Finanzausgleich oder Altschuldenzusage.
SPD-MV 2402 (S. 30, 22): Nur Fortführung der Kinderwunschbehandlung (Gesundheitsthema) und Fachkräfte-Zuzug aus dem Ausland ohne Bezug zu Region/Abwanderung; keine Zusage zu Geburten oder Alterung in Regionen.
SPD-ST 2402 (S. 3, 51, 55): Nur Leitbilder (Gesundheit, Willkommenskultur) und Verwaltungs-/Katastrophenschutzplanung unter Demografie; keine Zusage zu Geburten, Zuzug oder Alterung.
Grune-Bund 2401 (S. 20, 43, 46, 50, 51, 69, 92, 123, 126, 130, 144, 148, 151): Treffer sind Fehltreffer (Rückkehr in Beruf/Klimapfad/Syrien, Fachkräfteeinwanderung, Talentabwanderung im Ausland); Kapitel Gleichwertige Lebensverhältnisse (S. 50-51) und Hochschulkapitel ohne Zusage zum Halten oder Zurückholen junger Menschen.
Grune-Bund 2402 (S. 66, 82): Familiengründung nur im Zusammenhang Wohnen bzw. Mutterschaftsgeld Selbstständiger; keine Zusage zu Geburten, Alterung oder Zuzug in Regionen.
Grune-BE 2404 (S. 61, 69, 94): Typengenehmigung/digitale Bauplattform, Bürokratieabbau allgemein: betreffen Bauen bzw. Landesverwaltung, nicht Finanzkraft oder Planungskapazitäten der Kommunen; Stadtstaat ohne Kommunalfinanzausgleich.
Grune-MV 2402 (S. 30): Einzige Fundstelle (Zuzug, S. 30) ist bereits bei 2401 erfasst; keine Zusage zu Geburten oder Alterung gefunden.
Grune-ST 2401 (S. 90, 66, 67): S. 90 'Innovation statt Abwanderung' und Start-up-Abwanderung betrifft Unternehmen/Gründer, nicht junge Menschen; Hochschulfinanzierung (S. 67) ohne Bezug zu Abwanderung; S. 83 Gesundheit.
Grune-ST 2402 (S. 88, 93): Fundstellen nur Lagebeschreibung bzw. anderer Zusammenhang (Kreislaufwirtschaft); keine Zusage zu Geburten oder Zuzug.
FDP-Bund 2401 (S. 12, 16, 22, 28): Treffer sind Wortspiele (zurückkehrt, Abwanderung von Kapitalgebern, Rückführung); nichts zu jungen Menschen in der Region.
FDP-Bund 2402 (S. 22, 31): Zuzug betrifft Asylsystem, Kinderwunschbehandlung ist Familienpolitik ohne Regionbezug; demografischer Wandel nur bei Sozialversicherung.
FDP-Bund 2404 (S. 44): Genehmigungsverfahren betreffen Wohnungsbau, nicht Finanzkraft oder Planungskapazität der Kommunen.
FDP-BE 2401 (S. 16): Berlin ist Stadtstaat; S. 16 (Startchancenkonto) hat keinen Bezug zu Region oder Abwanderung; keine Maßnahme zu Rückkehr oder Standorten.
FDP-BE 2402 (S. 82): S. 82 Kinderwunschbehandlung: Gleichbehandlung bei der Finanzierung, kein Ansatz bei Geburten- oder Alterungsentwicklung.
FDP-MV 2402 (S. 17, 38, 43, 50, 118, 123): Nur Fachkräfteeinwanderung auf Bundesebene, Kinderwunsch-Programm bei gesundheitlichen Einschränkungen, Ehrenamt und Kultur; keine Zusage zu Geburten, Alterung oder Zuzug als Gegenmittel zur Schrumpfung.
AfD-Bund 2401 (S. 16, 40, 102, 108, 109, 114): Rückgewinnungsprogramme (S. 114) und Stopp der Abwanderung (S. 16) betreffen Fachkräfte und Unternehmen bundesweit, nicht junge Menschen aus ländlichen Regionen, Zitate nennen keine Region; S. 40 (ländlicher Raum) nur Leitbild; S. 102-109 Rückkehr von Migranten.
AfD-BE 2401 (S. 21, 22, 37, 52, 54, 55, 95, 50): Alle zwölf Treffer sind Fehltreffer (Rückkehr von Migranten, Energiemix, Haushaltsführung, Abwanderung von Forschung). Berlin ist Stadtstaat; keine Maßnahme zu Halten oder Zurückholen junger Menschen aus ländlichen Regionen.
AfD-MV 2401 (S. 5, 14, 50, 51, 52, 71, 77, 86, 34, 35): Die Treffer zu Rückkehr betreffen Rückkehr von Asylbewerbern und Flüchtlingen (S. 50-52), Städtebau (S. 71) und Tierarten (S. 77); Fachkräfteeinwanderung (S. 14) ist keine Haltemaßnahme. Hochschulkapitel (S. 34-35) enthält nichts zum Halten oder Zurückholen junger Menschen.
Linke-BE 2401 (S. 13, 154): Treffer sind Wortteile (dazugehören) bzw. Rückkehr zur Verbeamtung; keine Maßnahme gegen Abwanderung junger Menschen aus ländlichen Regionen. Berlin ist Stadtstaat.
Linke-BE 2402 (S. 13, 112, 183): Treffer sind Wortteile (dazugehören); Familienförderungsgesetz (S. 183) ist allgemeine Familienpolitik ohne Bezug zu Geburten, Alterung oder Zuzug in Regionen.
Linke-MV 2402 (S. 11, 15): Nur allgemeine Aussagen zu Familienförderung und Wiedereinstieg, keine Zusage zu Geburten, Alterung oder Zuzug in Regionen.
Linke-ST 2403 (S. 42): Keine Zusage zu Ausbildungsplätzen im gelesenen Kontext.
BSW-BE 2401 (S. 36, 39, 57): Treffer sind Fehlgriffe (Abwanderung von Personal bei Polizei, Fachkräfte-Herkunftsländer, Rückkehr der Umweltbildung); Hochschulkapitel (S. 40ff) ohne Maßnahme zum Halten junger Menschen in Regionen.
BSW-BE 2402 (S. 1, 2): Stadtstaat Berlin; keine Maßnahmen zu Geburten, Alterung oder Zuzug im Sinne der Ursache gefunden.
BSW-MV 2401 (S. 14, 34, 50): Nur Ziele und Leitbilder (Abwanderung entgegenwirken, Bedingungen schaffen, Perspektiven vor Ort) ohne konkrete Handlungszusage; Ausbildungsprämien (S. 50) gehören zu 2403, nicht zugelassen.
BSW-MV 2402 (S. 14): Kapitel Demografischer Wandel nennt nur Angebote für Generationen und Begegnungsorte, nichts zu Geburten oder Zuzug.
BSW-ST 2402 (S. 11, 22, 30, 38, 51, 76, 88): Nur Lagebeschreibungen oder Schlagwörter (demografischer Wandel, Kinderwunsch, Familiengründung); keine Zusage zu Geburten, Zuzug oder Alterung. S. 76 (Kitas, kleine Grundschulen) gehört zu eigenen Themen.
Volt-BE 2402 (S. 25, 69): Nichts zu Geburten, Alterung oder Zuzug im Sinne der Ursache; Programm ist auf die Stadt Berlin bezogen.
Volt-BE 2404 (S. 26, 62, 63, 110): Genehmigungsverfahren betreffen Wohnungsbau und Betriebsnachfolge, Strukturförderung die Kultur; keine Zusage zu Finanzkraft oder Planungskapazitäten der Kommunen.
Volt-MV 2401 (S. 21, 32, 34): Treffer nur in Lagebeschreibungen oder bei Ärzte- und Pflegestipendien (eigene Themen Hausärzte/Pflege, R2); keine Zusage gegen Abwanderung junger Menschen allgemein.
Volt-MV 2402 (S. 4): Nur Lagebeschreibung (Überalterung) im Vorwort; keine Zusage zu Geburten, Zuzug oder Anpassung.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 109 Kennungen, Prüfsumme `8f554335e235963ab3a4564662536d0e6e15372e0ed8c48ebfd8b1e93032710f`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (MV): 6 Maßnahmen, 6 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (ST): 7 Maßnahmen, 7 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: SPD (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (BE): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 2 (M025 2401, M056 2401); offene bestätigt 0; verworfen 2
Zuordnung: SPD (MV): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 6 Maßnahmen, 6 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (BE): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M086 2401); offene bestätigt 0; verworfen 1
Zuordnung: Grüne (MV): 6 Maßnahmen, 6 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (BE): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (ST): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (BE): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (ST): 8 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (BE): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Linke (MV): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 4 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M085 2401); offene bestätigt 0; verworfen 1
Zuordnung: BSW (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (ST): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 6 Maßnahmen, 7 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M018 2402); offene bestätigt 1; verworfen 0
Zuordnung: Volt (BE): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M030 2401); offene bestätigt 0; verworfen 1
Zuordnung: Volt (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** 

```
3 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
M025: Bewertung sieht zusätzlich Ursache 2403 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M030: Bewertung sieht zusätzlich Ursache 2403 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M055: Bewertung sieht zusätzlich Ursache 2402 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M086: Bewertung sieht zusätzlich Ursache 2403 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
```

**Punkte** (`npm run punkte`):

```
Abwanderung aus strukturschwachen Regionen – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2401 2402 2403 2404   alle
Union       0    0    4    4      8
SPD         0    0    8  5.5   13.5
Grüne       0    0  6.8    6   12.8
FDP         0    0    4    0      4
AfD         0  2.5    0    0    2.5
Linke       2    0  4.5    4   10.5
BSW         0    0    4    4      8
Volt        2    2  4.5  1.5     10

BE       2401 2402 2403 2404   alle
Union       0    0    4    0      4
SPD         0    0    8    0      8
Grüne       0    3  6.8    0    9.8
FDP         0    0    4    1      5
AfD         0  2.5    0    2    4.5
Linke       0    0  4.5    2    6.5
BSW         0    0    4    1      5
Volt        0    0  4.5    0    4.5

MV       2401 2402 2403 2404   alle
Union     5.5    0    4  7.1   16.6
SPD       5.5    0    8    3   16.5
Grüne       9    0  6.8    6   21.8
FDP         4    0    4  4.5   12.5
AfD         0    2    0    6      8
Linke       3    0  4.5    6   13.5
BSW         0    0    4  8.3   12.3
Volt        0    0  4.5  4.5      9

ST       2401 2402 2403 2404   alle
Union       3    3    4    9     19
SPD         3    0    8  6.5   17.5
Grüne       0    0  6.8    4   10.8
FDP         4    2    4    8     18
AfD       8.3    4    0    4   16.3
Linke       0    3  4.5    5   12.5
BSW         6    0    4    6     16
Volt      8.5    0  4.5    3     16
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M086 (vorgeschlagen 2401). Das Zitat zum Azubiwerk nennt weder Region noch Abwanderung; ein städtisches Azubiwerk hält niemanden in strukturschwachen Regionen. Der Lösungsweg „Wohnheim für Auszubildende“ setzt wie bei M073/M090 (Bund) an der regionalen Passung (2403) an. Darum stehen M025, M030, M086 mit 2403 (außerhalb ihrer Listen, nur als Hinweis); zählt das nicht, fallen sie weg.
- Offene entschieden: M003 -> 2404 (wie M024, Bezirksfinanzen); M018 -> nur 2404 (Finanzausgleich, nicht Geburten/Alterung); M019 -> 2404; M053 -> 2401 (Bindung von Absolventen in der Region); M025, M030 -> nicht 2401 (s. o.); M056 -> keine (Zweck Forschungsexzellenz, kein Bezug zu Region oder Abwanderung); M085 -> keine (Zweck Technologie- und Recyclingforschung).
- M055 zusätzlich 2402 (Zentren für Fachkräfteeinwanderung = Zuzug), wie M002; 2402 liegt außerhalb seiner Listen.
- Schwierig: Pauschalen statt Förderprogramme (I8) zwischen 1 und 2 – Kommunen benennen Förderbürokratie klar als Hemmnis, Wirkung aber nicht evaluiert. Familienpolitische Geldleistungen: Effekt auf Geburten gut belegt, aber klein und für Abwanderung kaum relevant, daher Wirksamkeit 1 trotz „belegt“. Ausbildungsgarantie (M034/M075): Quelle zur Wirkung (Österreich) nur als PDF, nicht lesbar – daher ohne Beleglink. Mehrere PDF-Quellen (Hessenkasse, Bayerisches Absolventenpanel) waren nicht lesbar und wurden nicht verwendet.
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

