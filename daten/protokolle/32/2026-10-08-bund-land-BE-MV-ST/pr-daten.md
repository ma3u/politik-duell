## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 2 → 2 | 6 → 6 | 3 → 2 | 1 → 1 |
| SPD | 2 → 1 | 5 → 5 | 1 → 1 | 3 → 3 |
| Grüne | 4 → 4 | 19 → 17 | 2 → 2 | 4 → 3 |
| FDP | 0 → 0 | 7 → 7 | 3 → 1 | 0 → 0 |
| AfD | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| Linke | 4 → 4 | 13 → 12 | 4 → 4 | 3 → 3 |
| BSW | 0 → 0 | 0 → 0 | 1 → 1 | 1 → 1 |
| Volt | 3 → 3 | 7 → 6 | 0 → 0 | 2 → 1 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 3201 FDP, AfD, BSW; 3202 SPD, FDP, AfD, Linke, BSW, Volt; 3203 Union, SPD, Grüne, FDP, AfD, BSW; 3204 Union, SPD, FDP, AfD, Linke, BSW, Volt. **BE** 3201 AfD, BSW; 3202 Union, SPD, AfD, BSW; 3203 AfD, BSW, Volt; 3204 SPD, AfD, Linke, BSW. **MV** 3201 SPD, Grüne, FDP, AfD, BSW, Volt; 3202 Union, SPD, Grüne, AfD, Linke, BSW, Volt; 3203 FDP, AfD, Volt; 3204 Union, SPD, Grüne, FDP, AfD, Linke, Volt. **ST** 3201 Union, FDP, AfD, Linke, BSW, Volt; 3202 Union, SPD, FDP, AfD, Linke, BSW; 3203 FDP, AfD, Volt; 3204 Union, SPD, FDP, AfD, Linke, BSW, Volt.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
Grune-MV: Stand im PDF Stand: 16.07.2026 (Inhaltsverzeichnis S. 2)
Linke-MV: Stand im PDF Juni 2026 (Impressum S. 2; beschlossen am 30. Mai 2026)
Linke-ST: Synonym „klub“ → 3203 Verlässliche Förderung für Kulturorte
Linke-ST: Synonym „gewerbemieten“ → 3201 Flächen für Kultur schützen
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3201  3202  3203  3204
Union-Bund         1     1     2     2
Union-BE           1     0     1     5
Union-MV           6     2     4     7
Union-ST           2     0     3     6
SPD-Bund           2     0     1     0
SPD-BE             2     0     3     8
SPD-MV             2     1     6     6
SPD-ST             0     0     7     6
Grune-Bund         1     1     5    14
Grune-BE          15     2     8    25
Grune-MV           2     0     4    15
Grune-ST           7     1     9    13
FDP-Bund           0     0     0     2
FDP-BE             9     3     4     6
FDP-MV             0     1     2     1
FDP-ST             0     0     1     3
AfD-Bund           2     0     4     5
AfD-BE             0     0     5     1
AfD-MV             0     0     1     8
AfD-ST             3     0     1     6
Linke-Bund         2     0     7    38
Linke-BE          14     1    13    31
Linke-MV           1     0     5     3
Linke-ST           0     0     9    21
BSW-Bund           0     0     1     1
BSW-BE             0     0     4     3
BSW-MV             1     0     4     6
BSW-ST             1     0     5    10
Volt-Bund          2     0     2     2
Volt-BE            7     4     3     9
Volt-MV            0     0     2     4
Volt-ST            4     0     1     6
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 3203 (S. 58, 59, 60): Nur allgemeine Kulturförderung (Kulturstiftung des Bundes, Museen, Theater, Kultur-Sponsoring für Kultureinrichtungen, Musikindustrie, internationale Kulturförderung) ohne Bezug zu Clubs, Spielstätten oder soziokulturellen Zentren (R2).
Union-Bund 3204 (S. 26, 37): Treffer aus anderem Zusammenhang (Mehrfachnutzung von Flächen, Waldumbau); nichts zu Umbau, Sanierung oder Brandschutz von Veranstaltungsgebäuden.
Union-BE 3202 (S. 119, 120, 121, 122, 37): Kapitel Kultur und Medien und Stadtentwicklung gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen.
Union-BE 3204 (S. 24, 36, 45, 81): Treffer zu Umbau betreffen JVA Tegel, Flughafenterminal für die BHT, Express-Baugenehmigungen für Start-up- und Kreativflächen und klimaresilienten Umbau von Schulhöfen – keine Veranstaltungsorte.
Union-MV 3202 (S. 88, 134): S. 88 Bau- und Immissionsschutzrecht für Tierhaltung (anderer Zusammenhang), S. 134 Stichwortverzeichnis; im Kapitel Kulturland nichts zu Schall, Lärmschutz oder Genehmigung von Veranstaltungen.
Union-ST 3201 (S. 66, 68, 82): Umnutzung und Mehrfachnutzung (S. 66, 68) betreffen Brachflächen und Flächenverbrauch allgemein, ohne Bezug zu Kulturorten; 'Clubkultur' (S. 82) steht in der Förderzusage, nicht in einem Flächen- oder Mietschutz. Keine Zusage zu Gewerbemieten oder Flächenschutz für Clubs.
Union-ST 3202 (S. 80, 81, 82): Kapitel 'Kulturland Sachsen-Anhalt' (S. 80–82) gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen.
Union-ST 3204 (S. 9, 40, 45, 66, 68, 82): 'Umbau' betrifft Feuerwehrhäuser, Wald, Energieversorgung und Wohnraum; energetische Sanierung von Kultureinrichtungen (S. 82) zielt auf Energieeffizienz allgemeiner Kultureinrichtungen, nicht auf Akustik oder Publikumsbetrieb von Spielstätten.
SPD-Bund 3202 (S. 50, 51): Kulturkapitel (S. 50–52) gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen.
SPD-Bund 3204 (S. 50, 51, 52): Kulturkapitel gelesen; nichts zu Umbau, Sanierung oder Brandschutz von Veranstaltungsorten (Sanierung nur für Sportstätten S. 52, Denkmalschutz S. 50 ohne Bezug zu Spielstätten).
SPD-BE 3202 (S. 11, 13, 39, 53, 54): Kapitel Kreativwirtschaft und Kulturmetropole gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen. Lärmschutz S. 39 betrifft Jugendliche im öffentlichen Raum (anderes Thema).
SPD-BE 3204 (S. 7, 18, 19, 21, 23, 53, 54, 59): Treffer zu Umbau/Mehrfachnutzung betreffen Verkehr, Büro-zu-Wohnraum, Mikroappartements, Wald, kommunale Gebäude für soziale Infrastruktur und Wärmewende; nichts zu Umbau, Akustik oder Brandschutz von Veranstaltungsorten.
SPD-MV 3201 (S. 77, 80, 87, 73): Bezahlbare Räume für Kunst, Proben und Präsentation (S. 77) und landesweites Raumprogramm für Clubs und Spielstätten (S. 80) sind nur Prüfaufträge; S. 87 (leerstehende Gebäude) und S. 73 (Raumnutzung Hochschulen) aus anderem Zusammenhang.
SPD-MV 3202 (S. 14): Einziger Treffer (Bundesimmissionsschutzgesetz) betrifft Genehmigung großer Industrievorhaben; nichts zu Schall oder Genehmigung von Veranstaltungen.
SPD-MV 3204 (S. 19, 54, 88, 89): Treffer „Umbau“ betreffen Energieversorgung, Wohnungsbau und Waldumbau; nichts zu Umbau, Sanierung oder Brandschutz von Veranstaltungsgebäuden.
SPD-ST 3204 (S. 4, 12, 46, 48, 40): Treffer „Umbau“ betreffen Industrie, Krankenhäuser, Tierhaltung und Wald; Unterstützung von Kultureinrichtungen bei Barrierefreiheit (S. 40) ist allgemeine Kulturförderung ohne Bezug zu Spielstätten (R2).
Grune-Bund 3203 (S. 84, 99, 111, 108, 125, 126): Soziokultur-Treffer betreffen das soziokulturelle Existenzminimum (Bürgergeld, Kinderarmut), Sponsoring die Parteienfinanzierung, Bundeskulturförderung die Honoraruntergrenzen; Bundeskulturfonds, Festivalförderfonds und Kulturpass fördern Projekte, Künstler und Nachfrage, nicht den Betrieb von Kulturorten (R2); Kommunalfinanzen S. 108 allgemein.
Grune-MV 3201 (S. 52, 97): S. 52: Zwischennutzung und Leerstandsmanagement im Kapitel Wohnraum, ohne Bezug zu Kulturorten; S. 97: Begegnungsorte bei Stadtentwicklung 'mitdenken' ist keine konkrete Zusage zu Flächen oder Gewerbemieten für Kulturorte.
Grune-MV 3202 (S. 95, 96, 97, 98, 99): Kapitel Kultur vollständig gelesen; nichts zu Schall, Lärmschutz oder Genehmigung von Veranstaltungen.
Grune-MV 3204 (S. 8, 9, 16, 17, 29, 52, 53, 55, 99): Treffer 'Umbau'/'Mehrfachnutzung' betreffen Offshore-Wind, PV, Landwirtschaft, Waldumbau, Betriebe und Wohnungsbau; S. 99 Denkmalsanierung ohne Bezug zu Veranstaltungsgebäuden. Nichts zu Umbau, Akustik oder Brandschutz von Kulturorten.
Grune-ST 3201 (S. 70, 91, 92, 93, 98): Kein Schutz von Flächen oder Gewerbemieten für Kulturorte; Anerkennung der Clubkultur als Kulturgut ohne Instrument; Zwischennutzung und Leerstand (S. 93, 98) ohne Kulturbezug; Miethausprojekte und Umbauordnung (S. 91, 92) betreffen Wohnen und Bauen allgemein.
Grune-ST 3202 (S. 9, 10, 24): Lärmschutz nur zu Verkehrs- und Umweltlärm (S. 9–10) und Immissionsschutz bei Windanlagen (S. 24); keine Regel zu Veranstaltungsschall oder Genehmigungen. Lärmschutzinvestitionen der Clubs sind in der Club-Förderung erfasst.
FDP-Bund 3201 (S. 11, 44): Keine Aussage zu Gewerbemieten oder Flächenschutz für Kulturorte; Mietrecht auf S. 44 betrifft Wohnungen (R1: gehört zu Miete).
FDP-Bund 3202 (S. 11): Keine Aussage zu Schall, Lärmschutz oder Genehmigung von Veranstaltungen.
FDP-Bund 3203 (S. 11): Kulturkapitel nennt nur allgemeine Ziele (Kultur als Staatsziel, Rahmenbedingungen Kreativwirtschaft, Goethe-Institute, EU-Kulturfonds Denkmalschutz) ohne Bezug zu Clubs oder Spielstätten (R2).
FDP-Bund 3204 (S. 31, 44, 46): Treffer 'Umbau' betreffen altersgerechte Wohnungen (S. 31) und Waldumbau (S. 46); Abbau von Bau-Auflagen inkl. Brandschutz (S. 44) betrifft allgemeinen Wohnungsbau, nicht Veranstaltungsgebäude.
FDP-BE 3204 (S. 34, 61, 110, 120): Kein eigenes Programm für Umbau, Sanierung oder Brandschutz von Veranstaltungsorten; S. 110 verlangt nur, dass Planer neuer Quartiere Schall- und Brandschutz mitdenken (gleich wie S. 34). Umbau S. 61 (Kreuzungen) und S. 120 (barrierefreie Theater) anderer Zusammenhang.
FDP-MV 3201 (S. 116, 117, 118, 119, 122): Kulturkapitel gelesen; nichts zu Gewerbemieten oder Flächenschutz für Clubs und Kulturorte. Kostenfreie Nutzung öffentlicher Räume (Schulen, Sporthallen) durch Vereine (S. 122) steht im Ehrenamtskontext ohne Bezug zu Kulturorten.
FDP-MV 3204 (S. 7, 117, 118, 119): Treffer S. 7 ist „Unternehmertum bauen wir ab“ (falscher Treffer); nichts zu Umbau, Sanierung oder Brandschutz von Veranstaltungsgebäuden.
FDP-ST 3201 (S. 29): Öffnung von Schulgebäuden für Vereine und Kulturangebote ohne Bezug zu Clubs, Spielstätten oder soziokulturellen Zentren (R2).
FDP-ST 3203 (S. 41): Erwartung an Eigeneinnahmen und wirtschaftliches Handeln kultureller Einrichtungen allgemein, Evaluation nur als Möglichkeit ('können helfen'); keine Handlungszusage zu Kulturorten.
FDP-ST 3204 (S. 11, 19, 20): 'Umbau' betrifft altersgerechten Wohnungsumbau und Waldumbau, anderer Zusammenhang.
AfD-Bund 3201 (S. 38): Bestandsschutz betrifft Baurecht für Eigentum, nicht Flächenschutz für Kulturorte.
AfD-Bund 3203 (S. 173): Allgemeine Kulturförderung ohne Bezug zu Clubs oder Spielstätten (R2); Umsatzsteuerbefreiung für Künstler ist keine Förderung von Orten.
AfD-Bund 3204 (S. 37): Wohnungsbau, kein Umbau von Veranstaltungsgebäuden; weitere Treffer zu Umbau sind Zusammenhänge fremder Art.
Linke-Bund 3204 (S. 5, 15, 17, 24, 28, 29, 30, 31, 32, 33, 34, 35, 42, 44, 53, 55, 56): Treffer „umbau“ betreffen Wirtschafts-, Industrie-, Agrar-, Stadt- und Wohnungsumbau; Kulturkapitel (S. 55–56) enthält nichts zu Umbau, Sanierung, Akustik oder Brandschutz von Veranstaltungsgebäuden (Sanierung nur für Turnhallen und Sportstätten).
Linke-Bund 3202 (S. 45, 55, 56): Keine Aussage zu Schall, Lärmschutz, Auflagen oder Genehmigung von Veranstaltungen; Kapitel Kommunen und Kultur gelesen.
Linke-BE 3204 (S. 30, 33, 35, 38, 39, 40, 41, 45, 49, 59, 77, 91, 92, 143, 146, 193, 202, 204, 205, 231, 240, 313): „Umbau“-Treffer betreffen Wohnungen, Bürogebäude, Verkehr, Klinik, Wald, Gesellschaft; S. 240 ökologische Umrüstung von Kulturhäusern allgemein, ohne Bezug zu Akustik oder Publikumsbetrieb; S. 313 Mehrfachnutzung von Schulen für Sport. Einzige Stelle zu Umbau von Clubs (S. 217, Barrieren) als Grenzfall erfasst.
Linke-MV 3202 (S. 26, 27): Kapitel Kunst und Kultur gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen.
Linke-MV 3204 (S. 23, 24, 26, 27): Treffer 'Umbau' betreffen Landwirtschaft und Wald; 'bauliche Barrieren abbauen' (S. 26) betrifft Barrierefreiheit, nicht Akustik oder Umbau für Veranstaltungen.
Linke-ST 3204 (S. 6, 13, 33, 54, 58, 83, 85, 90, 91, 92, 95, 111, 112, 115, 116): Alle Treffer zu „Umbau“ betreffen Schulen, Krankenhäuser, Wohnungen, Stadtumbau, Industrie, Ställe oder Wald; nichts zu Umbau, Sanierung oder Brandschutz von Gebäuden für Veranstaltungen.
Linke-ST 3201 (S. 85): S. 85 beschreibt nur, dass kulturelle Einrichtungen unter Gewerbemieten leiden; die folgenden Zusagen betreffen Wohnraum und Stadtumbau, keine Mieten oder Flächen für Kulturorte.
BSW-ST 3204 (S. 25, 26, 29, 30, 42, 80, 81, 82, 86): Treffer betreffen Energie-, Stadt-, Dorf-, Wald- und Stallumbau sowie Mehrfachnutzung von Sportstätten; nichts zu Umbau, Sanierung oder Brandschutz von Gebäuden für Kulturveranstaltungen.
BSW-ST 3201 (S. 84, 39, 40, 41): Treffer S. 84 betrifft Wassernutzungskonflikte; Kulturkapitel ohne Aussage zu Gewerbemieten, Flächenschutz oder Räumen für Kulturorte.
BSW-ST 3202 (S. 39, 40, 41): Kulturkapitel ohne Aussage zu Schall, Lärmschutz oder Genehmigung von Veranstaltungen.
Volt-Bund 3202 (S. 157, 158, 159, 160): Kulturkapitel gelesen; nichts zu Schallschutz, Lärmkonflikten oder Genehmigung von Veranstaltungen.
Volt-Bund 3204 (S. 20, 54, 94, 158): Fundstellen zu 'Umbau' betreffen Wirtschaft (S. 54) und Wohnungsbau (S. 94); im Kulturkapitel nichts zu Umbau, Akustik oder Brandschutz von Veranstaltungsorten.
Volt-MV 3203 (S. 15, 16): MV-Schutzfonds Kultur (Krisenhilfe für Kulturschaffende), Landeskulturpass und Austauschprogramme sind allgemeine Kulturförderung ohne Bezug zu Kulturorten oder Spielstätten (R2).
Volt-MV 3204 (S. 39, 41): ‚Umbau‘ betrifft Waldumbau und Deiche, keine Gebäude für Veranstaltungen.
Volt-ST 3201 (S. 81, 101, 106, 179): Fundstellen zu Umnutzung betreffen Brachflächen/Wohnungsbau, Tankstellenflächen, Benutzeroberflächen und Parkflächen; kein Schutz oder keine Bereitstellung von Flächen für Kulturorte oder Clubs.
Volt-ST 3204 (S. 71, 81, 92, 101): „Umbau“ betrifft Waldumbau, Wohngebäude, Straßen und Tankstellenflächen; nichts zu Umbau, Sanierung oder Brandschutz von Veranstaltungsgebäuden.
Volt-ST 3203 (S. 84, 152, 154): Grundfinanzierung kultureller Infrastruktur, mehrjährige Förderzusagen, lokale Kulturförderung im ländlichen Raum und GEMA-Übernahme für Vereine sind allgemeine Kultur- bzw. Vereinsförderung ohne Bezug zu Clubs, Spielstätten oder soziokulturellen Zentren (R2).
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 100 Kennungen, Prüfsumme `de41c7655e258a1653d7b10cddc3be496ae83debc4087bd10ac38e1ef7d32755`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 2 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Union (BE): 6 Maßnahmen, 7 Zuordnungen (davon 3 offen); nicht bestätigt 0; offene bestätigt 3; verworfen 0
Zuordnung: Union (MV): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M027 3204); offene bestätigt 0; verworfen 1
Zuordnung: Union (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M074 3203); offene bestätigt 0; verworfen 1
Zuordnung: SPD (BE): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 3 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M004 3202); offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 6 Zuordnungen (davon 2 offen); nicht bestätigt 2 (M008 3204, M051 3203); offene bestätigt 0; verworfen 0
Zuordnung: Grüne (BE): 19 Maßnahmen, 21 Zuordnungen (davon 5 offen); nicht bestätigt 3 (M095 3201, M064 3204, M083 3204); offene bestätigt 2; verworfen 2
Zuordnung: Grüne (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (ST): 4 Maßnahmen, 6 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M048 3204); offene bestätigt 1; verworfen 1
Zuordnung: FDP (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (BE): 7 Maßnahmen, 9 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M081 3204); offene bestätigt 1; verworfen 0
Zuordnung: FDP (MV): 3 Maßnahmen, 3 Zuordnungen (davon 3 offen); nicht bestätigt 2 (M028 3203, M053 3203); offene bestätigt 1; verworfen 2
Zuordnung: FDP (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (BE): 13 Maßnahmen, 13 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M080 3204); offene bestätigt 0; verworfen 1
Zuordnung: Linke (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (MV): 1 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 3 Maßnahmen, 5 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M035 3201); offene bestätigt 1; verworfen 0
Zuordnung: Volt (BE): 7 Maßnahmen, 7 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M100 3203); offene bestätigt 1; verworfen 1
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M030 3203); offene bestätigt 1; verworfen 1
```

**Hinweise zur Bewertung:** 

```
27 von 37 Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen
Instrument I3: Maßnahmen mit unterschiedlichen Ursachen (M024 3202, M026 3202, M034 3202, M044 3202, M057 3202, M077 3202+3204) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I4: Maßnahmen mit unterschiedlichen Ursachen (M033 3201+3202, M062 3201, M067 3202) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I5: Maßnahmen mit unterschiedlichen Ursachen (M036 3202, M084 3201+3202) – gleicher Lösungsweg, gleiche Zuordnung?
Instrument I13: Maßnahmen mit unterschiedlichen Ursachen (M073 3202+3203+3204, M082 3203+3204) – gleicher Lösungsweg, gleiche Zuordnung?
Grüne (ST): 1 von 3 Maßnahmen mehreren Ursachen zugeordnet (alle Programme: 8 %) – Mehrfachzuordnung prüfen
Volt (Bund): 1 von 3 Maßnahmen mehreren Ursachen zugeordnet (alle Programme: 8 %) – Mehrfachzuordnung prüfen
```

**Punkte** (`npm run punkte`):

```
Räume für Kultur und Clubs – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     3201 3202 3203 3204   alle
Union       6    7    0    0     13
SPD         6    0    0    0      6
Grüne       4    8    0    6     18
FDP         0    0    0    0      0
AfD         0    0    0    0      0
Linke     5.5    0    2    0    7.5
BSW         0    0    0    0      0
Volt        5    0    5    0     10

BE       3201 3202 3203 3204   alle
Union     7.4    0    3    2   12.4
SPD         7    0    6    0     13
Grüne     7.6    4    8    3   22.6
FDP       5.5  8.8  4.5    3   21.8
AfD         0    0    0    0      0
Linke     7.3  7.5    6    0   20.8
BSW         0    0    0    0      0
Volt        3  8.8    0    3   14.8

MV       3201 3202 3203 3204   alle
Union       2    0    6    0      8
SPD         0    0    6    0      6
Grüne       0    0    6    0      6
FDP         0    3    0    0      3
AfD         0    0    0    0      0
Linke       4    0    6    0     10
BSW         0    0    6    6     12
Volt        0    0    0    0      0

ST       3201 3202 3203 3204   alle
Union       0    0    6    0      6
SPD         2    0    6    0      8
Grüne       2    6    9    6     23
FDP         0    0    0    0      0
AfD         0    0    0    0      0
Linke       0    0    6    0      6
BSW         0    0    6    0      6
Volt        0    3    0    0      3
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Nicht bestätigte vorgeschlagene Ursachen: keine bei ursachen_ids.

Offene Ursachen bestätigt: M009 (3204, Veranstaltungstechnik mit Bezug zu Clubs), M013 (3201, Gewerbemieten), M025 (3204, Umbau für Kulturnutzung), M033 und M084 (3201, Standortsicherung durch Baurecht), M037 (3203), M045 (3201, „geschützt“ analog M004), M050 (3201), M057 (3202, Genehmigung von Veranstaltungen), M060 (3201), M077 (3204, Genehmigung von Umbauten), M082 (3204, Modernisierung), M089 (3202, Auflagen für Veranstaltungen).
Offene Ursachen abgelehnt: M004 (3202, kein Lärmbezug), M008 (3204; Schallschutz wie beim Landesfonds M012 nur unter 3202), M035 (3201, Fonds = Förderung), M051 (3203, Investitionsprogramm betrifft Gebäude, nicht Betrieb), M081 (3204, Zwischennutzung wie M052 nur 3201), M095 (3201, Grundsteuer als Betriebskosten unter 3203).

Ohne Ursache: M027 (allgemeines Kultur-Investitionsprogramm ohne Bezug zu Clubs, Spielstätten oder Soziokultur, Regel 2), M028 (Anerkennung ohne Instrument), M030 (Dritte Orte wie Bibliotheken und Begegnungsräume, Regel 2), M048, M083, M080 (barrierefreier Umbau: Thema Barrieren für Menschen mit Behinderung; M048/M083 zudem allgemeine Kultureinrichtungen), M053 (Unterstützung von Festivalkonzepten, keine dauerhaften Orte), M064 (Förderung von Open-Air-Veranstaltungen, nicht von Orten), M074 (allgemeine Popkulturförderung ohne Bezug zu Orten), M100 (allgemeine Kulturförderung, Regel 2).

Schwierig: Belegt bei Förderung (I12–I14) stützt sich auf Evaluationen mit Selbstauskunft der Geförderten (Spielstättenprogrammpreis, NEUSTART KULTUR). Agent of Change auf Landesebene (I1): Kern ist Bundesrecht, Land kann nur über Bebauungspläne wirken – daher 2. Zwischennutzung (I9) nur 1, weil das Ziel dauerhafte Orte nennt. M027 und M009 liegen nahe beieinander; M009 wurde wegen Clubcommission und Veranstaltungstechnik zugeordnet. Barrierefreier Umbau (M048, M080, M083) könnte man auch unter 3204 fassen.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine

| Linke-ST | Eigene Synonyme der Erfassung | „klub“ → 3203, „gewerbemieten“ → 3201 – im Kurzbericht gemeldet, Treffer gegen die Leitfaden-Begriffe geprüft |

Erste Blindbewertung ohne Recherche (Sitzungslimit der Werkzeuge) verworfen, neu bewertet mit Quellen.
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

