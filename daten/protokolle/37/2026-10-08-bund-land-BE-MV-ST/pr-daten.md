## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 5 → 4 | 15 → 15 | 7 → 6 | 8 → 8 |
| SPD | 2 → 1 | 8 → 8 | 2 → 2 | 6 → 6 |
| Grüne | 4 → 4 | 7 → 7 | 1 → 1 | 7 → 7 |
| FDP | 3 → 2 | 5 → 5 | 9 → 9 | 8 → 8 |
| AfD | 0 → 0 | 2 → 2 | 5 → 5 | 2 → 1 |
| Linke | 2 → 2 | 17 → 17 | 2 → 2 | 6 → 6 |
| BSW | 2 → 1 | 6 → 6 | 4 → 4 | 3 → 3 |
| Volt | 3 → 3 | 3 → 3 | 1 → 1 | 5 → 5 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 3701 FDP, AfD; 3702 Union, SPD, Grüne, FDP, AfD, BSW, Volt; 3703 SPD, AfD, Linke, BSW. **BE** 3702 FDP, AfD, Volt; 3703 AfD. **MV** 3701 Volt; 3702 Union, SPD, Grüne, AfD, Linke, BSW, Volt; 3703 Grüne. **ST** 3701 AfD; 3702 Union, SPD, AfD, BSW.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
Grune-MV: Stand im PDF Stand: 16.07.2026 (Inhaltsverzeichnis S. 2)
Linke-MV: Stand im PDF Stand: Juni 2026 (S. 2; beschlossen am 30. Mai 2026)
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3701  3702  3703
Union-Bund         1     7     5
Union-BE          18     4    20
Union-MV           9     3    17
Union-ST           5     6     8
SPD-Bund           1     0     3
SPD-BE             8     1     5
SPD-MV             7     0     5
SPD-ST             3     1     0
Grune-Bund         5     1     4
Grune-BE          22     0     5
Grune-MV           2     0     0
Grune-ST           4     3     9
FDP-Bund           0     2     2
FDP-BE             2     5     1
FDP-MV             7    20     6
FDP-ST             6    10     4
AfD-Bund           0     7     1
AfD-BE             3    10     1
AfD-MV             5     8     2
AfD-ST             1     9     6
Linke-Bund         7     0     8
Linke-BE          17     6    14
Linke-MV           0     0     3
Linke-ST          12     4     5
BSW-Bund           1     0     1
BSW-BE            13     0     4
BSW-MV             2     0     1
BSW-ST             5     2     9
Volt-Bund          1     4     6
Volt-BE            3     5     4
Volt-MV            1     3     0
Volt-ST            3     4     7
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 3702 (S. 9, 12, 13, 58, 67, 69, 70): „Eigenverantwortung“ nur in Gesundheit, Leitbild, Kultur und Forschung; im Sportkapitel (S. 60–61) und bei den Kommunalfinanzen (S. 76) nichts zu Betriebskosten, Hallenentgelten oder Zuschüssen für den Betrieb von Sportstätten.
Union-MV 3702 (S. 2, 50, 71): Treffer „Eigenverantwortung“ in Grundsätzen, Bildung und Gesundheit ohne Bezug zum Sport; im Kapitel Sportoffensive (S. 82–84) nichts zu Betriebskosten, Hallenentgelten oder Energiekosten.
Union-ST 3702 (S. 12, 26, 27, 46, 49, 55, 70, 71, 79): Keine Zusage zu Betriebs-, Nutzungs- oder Energiekosten von Sportstätten; Treffer zu Eigenverantwortung/Auslastung betreffen Wirtschaft, Gesundheit, Kita und Verwaltung; kommunaler Finanzausgleich (S. 79) ohne Bezug zu Sportstätten.
SPD-Bund 3702 (S. 51, 52): Sportkapitel (S. 51–52) gelesen; nichts zu Betriebskosten, Hallenentgelten oder Betriebszuschüssen für Sportstätten.
SPD-MV 3702 (S. 40, 51, 52): Keine Zusage zu Betriebs- oder Nutzungskosten von Sportstätten (Hallenentgelte, Energiekosten, Betriebszuschüsse); S. 51 nur Rückblick auf Kommunalverfassung und Prüfauftrag zu freiwilligen Leistungen.
SPD-ST 3702 (S. 37, 40): Keine Zusage zu Betriebs-, Energie- oder Nutzungskosten von Sportstätten; Treffer S. 37 ('Eigenverantwortung') betrifft Kulturförderung.
Grune-Bund 3702 (S. 42, 108, 111, 112): Keine Zusage zu Betriebs-, Energie- oder Nutzungskosten von Sportstätten; Fundstelle S. 42 betrifft Stromnetze.
Grune-BE 3703 (S. 52, 180, 191): Wohngemeinnützigkeit (S. 52) und Kooperation von Schulen/Jugendhilfe mit Sportvereinen (S. 180, 191) gehören nach R2 zu anderen Themen; Vereinsförderung selbst ist auf S. 37 erfasst.
Grune-MV 3701 (S. 10, 64): S. 10 betrifft gemeinsame Nutzung von Netzanschlusspunkten (anderer Zusammenhang); S. 64 'Angebot an Jugendclubs, Vereinen, Kultur-, Musik- und Sportstätten unterstützen' ist ein allgemeines Ziel ohne konkretes Instrument (Jugendpolitik); Doppelnutzung von Landesliegenschaften dort bezieht sich auf Jugendkultur.
Grune-MV 3702 (S. 63, 104): Keine Zusage zu Betriebskosten oder Hallenentgelten von Sportstätten. S. 63: Vereine sollen Nachbarschaftstreffs gegen minimale Gebühr nutzen können – Gemeinschaftsräume, keine Sportstätten; S. 104: allgemeine Kommunalfinanzen (Schwimmbad nur als Beispiel in der Einleitung).
Grune-MV 3703 (S. 68, 107): Keine Vereinsförderung mit Bezug zum Sport. S. 68: Freistellung für Ehrenamt nur als Prüfauftrag bzw. allgemein für Engagement; S. 107: Unterstützung von Vereinen bei EU-Fördermitteln allgemein, ohne Sportbezug.
FDP-Bund 3701 (S. 22, 32, 36): Kapitel Sport und Ehrenamt (S. 32) und Föderalismusreform (S. 36) gelesen; keine Zusage zu Sanierung oder Neubau von Sportstätten.
FDP-Bund 3702 (S. 18, 20, 32): Fundstellen S. 18 und 20 betreffen Arbeitsrecht und Arbeitslosenversicherung; zu Betriebs- oder Nutzungskosten von Sportstätten nichts.
FDP-BE 3702 (S. 8, 16, 59, 83, 102, 112): Keine Zusage zu Betriebskosten, Hallenentgelten oder Betriebszuschüssen für Sportstätten; Fundstellen zu Eigenverantwortung/Auslastung betreffen Schulen, Startchancenkonto, ÖPNV, Kultur und Sozialsysteme.
FDP-MV 3702 (S. 4, 9, 29, 40, 41, 76, 102, 113, 121, 124, 126, 128, 129): Treffer „Eigenverantwortung“ fast nur in Kapitelüberschriften oder anderen Zusammenhängen (Wirtschaft, Gesundheit, Hochschulen, Katastrophenschutz); zu Betriebskosten nur die kostenfreie Hallennutzung (S. 122), die erfasst ist. S. 76 sichert freiwillige Leistungen (Sportstätten) nur als Ziel.
FDP-ST 3702 (S. 3, 12, 15, 17, 28, 35, 50, 51, 52): Treffer zu „Eigenverantwortung“ und „wirtschaftlicher Betrieb“ stehen in anderem Zusammenhang (Präambel, Wohnen, Landwirtschaft, Schule, Senioren, Kommunalfinanzen). Keine Zusage zu Hallenentgelten, Betriebskosten oder Betriebszuschüssen; die Gleichstellung vereinseigener Anlagen (S. 52) steht als Grenzfall bei 3703.
AfD-Bund 3701 (S. 39): Nur Sanierung maroder Bauwerke allgemein (Brücken, Spannbeton); nichts zu Sportstätten oder Sporthallen.
AfD-Bund 3702 (S. 16, 34, 55, 56, 62): 'Eigenverantwortung' nur als allgemeines Leitbild in Wirtschafts-, Haushalts- und Währungspolitik; Konnexitätsprinzip allgemein ohne Bezug zum Betrieb von Sportstätten.
AfD-Bund 3703 (S. 16, 30, 171, 174): 'Mitgliedsbeiträge' betrifft die WHO; Ehrenamt (S. 16) und lokale Kulturvereine (S. 171) nur als Leitbild ohne Förderzusage; S. 174 betrifft Bekenntnispflicht geförderter Vereine, nicht Sportvereinsförderung.
AfD-BE 3702 (S. 46, 48, 49, 61, 62, 65, 69, 72, 79): Treffer zu „Eigenverantwortung“ betreffen Sozialpolitik, Familie, Gesundheit, Umwelt bzw. im Sportkapitel (S. 65) eine Lagebeschreibung; nichts zu Betriebskosten, Hallenentgelten oder Zuschüssen für den Betrieb von Sportstätten. Sportkapitel S. 65–67 vollständig gelesen.
AfD-BE 3703 (S. 51, 52, 65, 66, 67, 77): „Mitgliedsbeiträge“ (S. 77) betrifft die Finanzierung politischer NGOs; Ehrenamtsförderung (S. 51–52) allgemein, ohne Bezug zu Sportvereinen; Sportkapitel enthält keine Zusage zur Vereinsförderung.
AfD-MV 3702 (S. 12, 22, 54, 58, 59, 67, 69, 72): Treffer zu Eigenverantwortung/Auslastung betreffen Wirtschaft, Familie, Kommunen allgemein, Gesundheit und Tourismus; nichts zu Betriebskosten, Hallenmieten oder Betriebszuschüssen für Sportstätten.
AfD-ST 3701 (S. 200): Schwimmbäder nur als Beispiel belasteter freiwilliger Aufgaben im Abschnitt Fährverbindungen; keine Zusage zu Sanierung oder Neubau von Sportstätten im Programm.
AfD-ST 3702 (S. 45, 46, 59, 202, 221, 242): Treffer (Auslastung, Eigenverantwortung, Kostensenkung) betreffen Abschiebehaft, Wohnungsbau, Behindertenparkplätze, MDR und Gesundheit; nichts zu Betriebs- oder Nutzungskosten von Sportstätten.
Linke-Bund 3703 (S. 9, 12, 16, 20, 49, 56): Keine Zusage zur Förderung oder Entlastung von Sportvereinen: Gemeinnützigkeit S. 9 (Wohnen) und S. 12 (politische Willensbildung), Sponsoring S. 20 (Suchtmittelwerbung) und S. 49 (Parteien) gehören in andere Zusammenhänge; S. 16 gebührenfreie Sportvereine für Kinder gehört nach R2 zu Freizeitangeboten; S. 56 nur allgemeine Sportförderung/Leitbild.
Linke-MV 3702 (S. 8, 11): Nichts zu Betriebs- oder Nutzungskosten von Sportstätten (Hallenmieten, Energiekosten, Betriebszuschüsse); S. 8 nur allgemein kommunale Finanzausstattung.
BSW-Bund 3702 (S. 14, 32): Nichts zu Betriebs- oder Nutzungskosten von Sportstätten (Hallenmieten, Energiekosten, Betriebszuschüsse); S. 14 nur allgemein Mittel für Kommunen und Altschuldenlösung ohne Bezug zum Sport.
BSW-MV 3702 (S. 75, 76): Keine Zusage zu Betriebskosten, Hallenentgelten oder Verlustausgleich kommunaler Sportbetriebe; nur allgemeine Zusagen zur auskömmlichen Finanzierung kommunaler Aufgaben und pauschalen Zuweisungen ohne Bezug zu Sportstätten.
BSW-ST 3702 (S. 20, 41, 42, 75, 76): Kapitel ‚Breitensport stärken‘ und ‚Starke Kommunen‘ gelesen; nichts zu Betriebskosten, Hallenentgelten oder Betriebszuschüssen. Treffer S. 20 betrifft land- und forstwirtschaftliche Betriebe.
Volt-Bund 3702 (S. 42, 93, 94, 130, 161, 162): Keine Zusage zu Betriebs- oder Nutzungskosten von Sportstätten (Hallenmieten, Energiekosten, Betriebszuschüsse). Treffer zu Auslastung/Eigenverantwortung betreffen Rüstung (S. 42), Rente (S. 93), Finanzbildung (S. 94) und Gesundheitskompetenz (S. 130).
Volt-BE 3702 (S. 9, 18, 34, 47, 86, 87, 88): Treffer zu Eigenverantwortung/Nutzungsgebühr betreffen Verwaltung, Baustellen und Schulen; im Sportkapitel nichts zu Hallenentgelten, Betriebs- oder Energiekosten von Sportstätten.
Volt-MV 3701 (S. 46): Einziger Treffer (gemeinsame Nutzung) betrifft Funkmasten; das Programm enthält kein Wort zu Sportstätten, Sporthallen oder Schwimmbädern.
Volt-MV 3702 (S. 27, 32, 63, 24): Treffer betreffen Tourismus, Patienten und landwirtschaftliche Betriebe; Kommunalfinanzierung S. 24 allgemein ohne Bezug zu Sportstätten oder deren Betrieb.
Volt-ST 3702 (S. 20, 29, 97, 108, 135, 153): Keine eigene Zusage zu Hallenentgelten, Betriebskostenzuschüssen oder Energiekosten der Vereine; 'Betrieb' nur im Investitionsprogramm für Schwimmbäder (S. 29, dort als offen eingetragen); übrige Treffer (S. 20, 97, 108, 135) aus anderem Zusammenhang.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Änderung

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 160 Kennungen, Prüfsumme `30a2bc38fa66a1751fcc56b46058d5c8e80f8fbf0b39573e2f29773e985fb31a`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M015 3703); offene bestätigt 1; verworfen 1
Zuordnung: Union (BE): 15 Maßnahmen, 17 Zuordnungen (davon 3 offen); nicht bestätigt 0; offene bestätigt 3; verworfen 0
Zuordnung: Union (MV): 7 Maßnahmen, 7 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M054 3703); offene bestätigt 1; verworfen 1
Zuordnung: Union (ST): 8 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M092 3703); offene bestätigt 0; verworfen 1
Zuordnung: SPD (BE): 8 Maßnahmen, 10 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: SPD (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 6 Maßnahmen, 6 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Grüne (BE): 7 Maßnahmen, 9 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M083 3703); offene bestätigt 1; verworfen 0
Zuordnung: Grüne (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Grüne (ST): 7 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M121 3703); offene bestätigt 0; verworfen 1
Zuordnung: FDP (BE): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M030 3702); offene bestätigt 0; verworfen 0
Zuordnung: FDP (MV): 9 Maßnahmen, 10 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M122 3701); offene bestätigt 0; verworfen 0
Zuordnung: FDP (ST): 8 Maßnahmen, 9 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (BE): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 5 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (ST): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M117 3703); offene bestätigt 0; verworfen 1
Zuordnung: Linke (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Linke (BE): 17 Maßnahmen, 20 Zuordnungen (davon 5 offen); nicht bestätigt 0; offene bestätigt 5; verworfen 0
Zuordnung: Linke (MV): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Linke (ST): 6 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M063 3703); offene bestätigt 1; verworfen 1
Zuordnung: BSW (BE): 6 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (ST): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Volt (BE): 3 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M051 3703); offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (ST): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** 

```
34 von 44 Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
M002: Bewertung sieht zusätzlich Ursache 3702 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M093: Bewertung sieht zusätzlich Ursache 3702 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M116: Bewertung sieht zusätzlich Ursache 3703 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M133: Bewertung sieht zusätzlich Ursache 3703 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
M156: Bewertung sieht zusätzlich Ursache 3702 – zählt nicht (nur vorgeschlagene Ursachen); gleiche Stelle in anderen Programmen prüfen
Instrument I5: Maßnahmen mit unterschiedlichen Ursachen (M002 3701, M024 3701+3702, M036 3701+3702, M093 3701, M156 3701) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I4: Maßnahmen mit unterschiedlichen Ursachen (M005 3701+3702, M013 3701, M023 3701+3702, M031 3701, M045 3701, M129 3701, M138 3701) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I10: Maßnahmen mit unterschiedlichen Ursachen (M020 3701+3703, M055 3701+3703, M087 3701+3703, M116 3701, M125 3701+3703, M133 3701) – gleicher Lösungsweg, gleiche Zuordnung?
```

**Punkte** (`npm run punkte`):

```
Finanzierung von Sportvereinen und Sportstätten – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     3701 3702 3703   alle
Union       6    0  5.3   11.3
SPD         6    0    0      6
Grüne       7    0  4.5   11.5
FDP         0    0  4.5    4.5
AfD         0    0    0      0
Linke       6    2    0      8
BSW         2    0    0      2
Volt        2    0    4      6

BE       3701 3702 3703   alle
Union     7.4  5.8  6.7   19.9
SPD         7    3  6.8   16.8
Grüne     7.3    4    6   17.3
FDP       6.3    0  4.5   10.8
AfD       5.5    0    0    5.5
Linke     7.8    5  6.4   19.2
BSW       5.5    4    3   12.5
Volt        3    0    3      6

MV       3701 3702 3703   alle
Union     5.5    0  6.5     12
SPD         4    0    3      7
Grüne       4    0    0      4
FDP         6    4  5.8   15.8
AfD         3    0  6.5    9.5
Linke       3    0    2      5
BSW         3    0  6.3    9.3
Volt        0    0    2      2

ST       3701 3702 3703   alle
Union     4.5    0  7.2   11.7
SPD       5.5    0  6.3   11.8
Grüne     6.8    4  5.8   16.6
FDP         4    2  7.2   13.2
AfD         0    0    3      3
Linke       6    2    6     14
BSW         4    0    4      8
Volt        4    4  6.6   14.6
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise zur Zuordnung:
- Nicht bestätigt: M030 (3702 offen) – Onlineportal und Öffnung von Schulanlagen senken keine Betriebskosten; M051 und M083 (3703 offen) – bessere Belegung betrifft die Anlagen, nicht die Vereinsförderung; M122 (3701 offen) – im Kern kostenfreie Nutzung, keine Investition.
- Offene Ursachen bestätigt: M005 (3701), M008 (3701), M011, M050 (3703, Ehrenamt), M020, M055, M087, M125 (Vereinsinvestitionen: 3701 und 3703), M023, M024, M036 (3702, Betriebs-/Energiekosten), M032, M095 (3702), M078, M089, M105, M113, M123, M129, M139 (3701; Schulsporthallen zählen als Sportstätten, wie bei M085/M154), M086, M096, M114, M137, M147, M157 (3703), M126, M159 (3702).
- Ursachen außerhalb der Listen als Hinweis (gleicher Lösungsweg im selben Instrument): M002, M093, M156 zusätzlich 3702 (energetische Sanierung senkt Energiekosten wie bei M024/M036); M116, M133 zusätzlich 3703 (Investitionsförderung für Vereinsanlagen wie M020/M055/M087).
- Ohne Ursache: M054, M063, M117 (Mitgliedsbeiträge für Kinder übernehmen – nach Regel 2 Kosten für Freizeit von Kindern, anderes Thema); M015, M121 (Gemeinnützigkeit des E-Sports – erweitert den Kreis der begünstigten Vereine, setzt nicht an Finanzlage oder Anlagen bestehender Sportvereine an); M092 (Ziel ohne Instrument).
- Schwierig: (1) Maßnahmen zur besseren Nutzung vorhandener Anlagen (I8) setzen eigentlich an knappen Hallenzeiten an, für die es keine eigene Ursache gibt; der Zuordnung zu 3701 folge ich mit Wirksamkeit 1. (2) Kostenfreie Nutzung (I9) senkt Vereinskosten, verschiebt sie aber zu den Kommunen, deren Verluste Ursache 3702 beschreibt. (3) Abgrenzung neues/aufgestocktes Sanierungsprogramm (I1, W2) gegenüber allgemeiner Zusage oder Fortführung (I2, W1). (4) Übungsleiter- und Ehrenamtspauschale wurde 2026 bereits erhöht; Forschung zu Geldanreizen im Ehrenamt zeigt Verdrängungseffekte, daher gemischt. Der Sportentwicklungsbericht und das KfW-Kommunalpanel als PDF ließen sich nicht öffnen; die Problemlage stützt sich auf die KfW-Pressemitteilung und die Bundestagsmeldung zum Sanierungsprogramm des Bundes.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine
| AfD-Bund | eintragen: „keine_massnahme“ länger als 400 Zeichen | vom Erfassungsagenten selbst auf 371 Zeichen gekürzt (Inhalt und Seiten erhalten); Blindliste unverändert |
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

