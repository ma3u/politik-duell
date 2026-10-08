## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 1 → 1 | 7 → 7 | 4 → 3 | 2 → 2 |
| SPD | 2 → 2 | 4 → 4 | 2 → 2 | 1 → 1 |
| Grüne | 4 → 4 | 4 → 4 | 1 → 1 | 3 → 3 |
| FDP | 1 → 1 | 5 → 5 | 1 → 1 | 2 → 2 |
| AfD | 2 → 2 | 0 → 0 | 2 → 2 | 2 → 2 |
| Linke | 2 → 2 | 9 → 9 | 0 → 0 | 1 → 1 |
| BSW | 0 → 0 | 0 → 0 | 1 → 1 | 3 → 2 |
| Volt | 2 → 2 | 8 → 8 | 0 → 0 | 5 → 5 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 3601 Union, SPD, AfD, Linke, BSW, Volt; 3602 Union, FDP, AfD, BSW; 3603 Union, FDP, BSW, Volt; 3604 SPD, Grüne, FDP, BSW, Volt. **BE** 3602 AfD, BSW; 3603 SPD, Grüne, AfD, BSW; 3604 AfD, BSW. **MV** 3602 FDP, AfD, Linke, Volt; 3603 Grüne, FDP, Linke, BSW, Volt; 3604 SPD, Grüne, Linke, BSW, Volt. **ST** 3602 FDP, AfD; 3603 Union, SPD, Grüne, FDP; 3604 SPD, Grüne, AfD, Linke, BSW.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
Union-MV: Synonym „dorfkern“ → 3602 Nutzungsmischung und Ansiedlung fördern
Grune-MV: Stand im PDF 16.07.2026
FDP-ST: Stand im PDF Titelseite: beschlossen am 25. April 2026, Stand: 05.06.2026
Linke-MV: Stand im PDF Stand: Juni 2026 (Impressum S. 2), beschlossen am 30. Mai 2026
Volt-BE: Synonym „leerstehende Gewerbeflächen“ → 3602 Nutzungsmischung und Ansiedlung fördern
Volt-BE: Synonym „Flaniermeile“ → 3603 Aufenthaltsqualität und Verkehrsberuhigung
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3601  3602  3603  3604
Union-Bund         0     0     2     1
Union-BE           –     5    24    18
Union-MV           –    26     4     9
Union-ST           –    20     1     1
SPD-Bund           0     1     2     0
SPD-BE             –     4     8    14
SPD-MV             –    12     0     1
SPD-ST             –     2     0     4
Grune-Bund         0     0     4     3
Grune-BE           –    10    34    12
Grune-MV           –     2     3     5
Grune-ST           –     6     7     6
FDP-Bund           0     0     1     1
FDP-BE             –     5    21    14
FDP-MV             –     8     1     3
FDP-ST             –     4     1     8
AfD-Bund           0     1     2     2
AfD-BE             –     2     8     6
AfD-MV             –     2     1     3
AfD-ST             –     5     4     5
Linke-Bund         0     0     2     1
Linke-BE           –     5    26    17
Linke-MV           –     1     0     1
Linke-ST           –     6     1     3
BSW-Bund           0     1     1     1
BSW-BE             –     3    12     3
BSW-MV             –     3     0     2
BSW-ST             –     4     4     1
Volt-Bund          0     2     3     0
Volt-BE            –     1    14     9
Volt-MV            –     1     0     0
Volt-ST            –    10    19     6
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 3603 (S. 77): Unterstützung von Städten und Gemeinden bei Begrünung steht im Kontext Klimaanpassung und nennt weder Innenstadt noch Einzelhandel (R2).
Union-Bund 3601 (S. 17): Beweislastumkehr bei Dokumentationspflichten für Handwerk, Einzelhandel, Gastronomie ist Bürokratieabbau, betrifft nicht den Wettbewerb zwischen Online- und stationärem Handel (R1).
Union-Bund 3604 (S. 59): Bekenntnis zur Sonntagsruhe ist ein Bekenntnis zu Bestehendem im Kontext christlicher Traditionen, ohne Bezug zu Einzelhandel oder Innenstadt.
Union-BE 3603 (S. 10, 11, 59, 71, 72, 73, 77, 78, 79, 80, 82, 116, 123): Sauberkeits- und Ordnungsmaßnahmen (BSR, Ordnungsämter, Papierkörbe, Graffiti, Tauben an Einkaufszentren), Aufenthaltsqualität an Bahnhöfen, Kurfürstenkiez, Fußgängerzonen (Videoüberwachung, E-Scooter-Tempo) ohne Nennung von Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2) bzw. aus anderem Zusammenhang (Schulhöfe, Gewässer, Gedenkorte)
Union-ST 3603 (S. 86, 68, 66): Aufenthaltsqualität nur im Tourismuskontext (S. 86); klimafeste Stadtquartiere (S. 68) und Wohngebiete (S. 66) ohne Bezug zu Innenstadt oder Einzelhandel.
SPD-Bund 3604 (S. 35, 52): Radschnellwege, Fahrradparkhäuser, Fußverkehrsstrategie (S. 35) und (Ruf-)Busse im ländlichen Raum (S. 52) ohne Bezug zu Innenstadt oder Einzelhandel (R2); nichts zu Parken in Innenstädten oder Öffnungszeiten.
SPD-BE 3603 (S. 19, 21, 22, 23, 24, 25, 26, 55): Gestaltung von Plätzen, Stadtgrün, Sauberkeit (BSR, Sperrmüll) und Verkehrsberuhigung ohne Bezug zu Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2); Instandhaltung betrifft Wohnungen, Fußwege und Sportvereine; Aufenthaltsqualität betrifft das Tempelhofer Feld.
SPD-BE 3604 (S. 24, 25, 26, 33, 51, 63): Außer den Kurzzeitparkplätzen in Geschäftsstraßen (S. 27) nur Parkraumbewirtschaftung, Kiezparkhäuser, Park-and-Ride, Fußwege und Öffnungszeiten von Recyclinghöfen, Notdienstpraxen und Drogenkonsumräumen – ohne Bezug zu Innenstadt oder Einzelhandel (R2).
SPD-MV 3604 (S. 25, 26, 12): Pendlerparkplätze nur als Prüfauftrag und ohne Bezug zu Innenstadt oder Einzelhandel (S. 25); Radwege, Fußverkehr und ÖPNV ohne Nennung von Innenstadt oder Ortskern (S. 12, 26, R2); nichts zu Öffnungszeiten.
SPD-ST 3603 (S. 30, 44): Städtebauliche Maßnahmen und Beleuchtung (S. 30) nur zum Sicherheitsgefühl ohne Bezug zu Innenstadt oder Einzelhandel; Städtebauförderung und Quartiersmanagement (S. 44) ohne Nennung von Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2).
SPD-ST 3604 (S. 27, 28, 40, 41, 42): Öffnungszeiten betreffen Kitas (S. 27, 28) und Bibliotheken (S. 40); ÖPNV-, Rad- und Fußverkehrsmaßnahmen (S. 41–42) ohne Bezug zu Innenstadt oder Einzelhandel (R2).
Grune-Bund 3603 (S. 46, 48, 50, 105): Stadtgrün/Klimaanpassung (S. 46), attraktivere öffentliche Räume (S. 48), Sauberkeit in Bussen und Bahnen (S. 50) und saubere Straßen/Parks (S. 105) ohne Bezug zu Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2).
Grune-Bund 3604 (S. 48, 49, 86, 126): Nahmobilität, Fußwege und Mobilitätsgesetz allgemein ohne Bezug zu Innenstadt oder Einzelhandel (R2); Öffnungszeiten betreffen Bibliotheken (S. 126).
Grune-BE 3603 (S. 12, 20, 21, 22, 27, 28, 42, 43, 62, 64, 67, 80, 81, 89, 91, 106, 218, 232, 242): Zusagen zu Stadtgrün, Straßenreinigung, verkehrsberuhigten Kiezen, Platzumbau und Aufenthaltsqualität gelten der ganzen Stadt, Wohnumfeld, Klimaanpassung, Tourismus oder Sicherheit; kein Zitat nennt Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2).
Grune-MV 3603 (S. 21, 25): S. 21 Instandhaltung von Radwegen, S. 25 Verkehrsberuhigung innerorts (Vision Zero, Verkehrssicherheit); kein Bezug zu Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2).
Grune-MV 3604 (S. 9, 23, 24, 25): S. 9 PV auf Parkplätzen (Energie), S. 23–25 Rad- und Fußwege, Mobilitätsstationen, Verkehrssicherheit allgemein; kein Bezug zu Innenstadt oder Einzelhandel (R2). Zu Öffnungszeiten nichts gefunden.
Grune-ST 3603 (S. 9, 88, 93, 94): S. 93: 'Innenstädte und Ortskerne sollten neu gedacht werden, um die Aufenthaltsqualität zu steigern' ist ein allgemeines Ziel ('sollten'); Förderung von Begrünungskonzepten und Hitzeschutz (S. 93), Dach- und Fassadenbegrünung (S. 93), essbare Städte (S. 94) nennen weder Innenstadt noch Ortskern (R2). S. 9 und 88: Entsiegelung bzw. allgemeines Leitbild.
Grune-ST 3604 (S. 30, 31, 71, 93, 94): Parkraumbewirtschaftung (S. 31), Fußverkehr (S. 30), autoarme Quartiere (S. 93), 15-Minuten-Stadt und Nahmobilität (S. 94) ohne Bezug zu Innenstadt, Ortskern oder Einzelhandel (R2); Sonntagsöffnung S. 71 betrifft Bibliotheken.
FDP-Bund 3602 (S. 12, 13, 14, 15, 16, 43, 44): Kapitel Bürokratie, Steuern sowie Bauen und Wohnen gelesen; nichts zu Sortiment, Ansiedlung, Leerstand oder Nutzungsmischung in Innenstädten.
FDP-Bund 3603 (S. 43, 44): S. 43: Instandhaltung betrifft die Schieneninfrastruktur der Bahn; S. 44: Smart Cities ohne Bezug zu Aufenthaltsqualität oder Innenstadt. Nichts zu Gestaltung oder Sauberkeit des öffentlichen Raums.
FDP-Bund 3604 (S. 18, 41, 42, 43, 44): S. 44: Echtzeiterfassung von Parkplätzen als Baustein eines KI-Verkehrsmanagements, ohne Bezug zu Innenstadt oder Einzelhandel (R2) und ohne eigene Zusage; S. 43 ÖPNV allgemein; S. 18 Arbeitszeitgesetz betrifft Arbeitszeit, nicht Ladenöffnungszeiten.
FDP-MV 3602 (S. 4, 12, 13, 15, 20, 35, 63, 65): Ansiedlung nur von Industrie, Gewerbeflächen, Bundeswehr, Digitalwirtschaft und Forschung; Standortmarketing für Tagungstourismus; nichts zu Sortiment, Ansiedlung oder Nutzungsmischung in Innenstädten.
FDP-MV 3603 (S. 76, 124): Instandhaltung betrifft Sportstätten; S. 76 nur allgemein gegen Verödung von Dörfern und Städten ohne konkrete Zusage zum öffentlichen Raum.
FDP-ST 3602 (S. 7, 9, 14, 58): Treffer zu Ansiedlung betreffen Industrie, Rüstung und Kernenergie (Sonderwirtschaftszone, Produktionsaufbau), nicht Innenstädte; S. 58 „Ortskerne beleben“ nur als Leitbild der Innenentwicklung ohne konkrete Handlung.
FDP-ST 3603 (S. 47, 67): S. 67 Sauberkeit nur als Qualitätskennzahl im Regionalverkehr; S. 47 Sicherheitspartnerschaften Polizei/Ordnungsämter ohne Bezug zu Innenstadt oder Einzelhandel (R2).
AfD-Bund 3602 (S. 82): Fundstelle S. 82 betrifft die Ansiedlung des Wolfs, keine Aussage zu Sortiment, Ansiedlung oder Nutzungsmischung in Innenstädten.
AfD-BE 3602 (S. 21, 47, 48): S. 21 Ansiedlung im Asylkontext, S. 47 Industrieansiedlung (Hochtechnologie), S. 48 'Berliner Mischung' muss erhalten bleiben – allgemeines Leitbild ohne Innenstadt-/Einzelhandelsbezug; Rückbau von Bürokratieauflagen für Einzelhandel und Gastronomie (S. 48) setzt nicht an Sortiment, Ansiedlung oder Nutzungsmischung an.
AfD-BE 3603 (S. 42, 44, 65, 79, 80, 83, 84, 88, 97): Sauberkeitsmaßnahmen (S. 83–84: Ordnungsämter rund um die Uhr, Müll-Sheriffs, Abfallbehälter) gelten stadtweit für Parks und öffentliche Bereiche, nennen weder Innenstadt noch Einzelhandel (R2); S. 42 Sauberkeitsstreifen in U-Bahn, S. 65 Sportstätten, S. 79–80 Stadtgrün/Wälder, S. 88 Rekonstruktion historischer Bauwerke (Stadtbild/Erinnerungskultur), S. 97 Haushaltsinstandhaltung, S. 44 Absage an pauschale Verkehrsberuhigung – jeweils ohne Innenstadtbezug.
AfD-BE 3604 (S. 42, 43, 44, 60): Parkplätze wiederherstellen und Parkraumbewirtschaftung zurückführen (S. 42), Gehweg 2030 (S. 43–44) ohne Bezug zu Innenstadt oder Einzelhandel (R2: gehört zu Autofahren bzw. Verkehr); S. 60 Öffnungszeiten von Kitas.
AfD-MV 3602 (S. 16, 55, 89, 90): S. 16 und 55: Ansiedlung von Industrie bzw. Kostensenkung durch Grunderwerbsteuer, ohne Bezug zu Innenstadt oder Einzelhandel; S. 89 Umwandlung von Gewerbeflächen zu Wohnraum in Mischgebieten und S. 90 Leerstände als Wohnraum nutzbar machen betreffen Wohnraum (R2), nicht Sortiment oder Ansiedlung in Innenstädten.
AfD-ST 3602 (S. 42, 143, 145, 192, 193, 206): Ansiedlung betrifft Rückkehrer, Großkonzerne und Rechenzentren; Dorfläden und Nahversorgung im ländlichen Raum (S. 192, 193) ohne Nennung von Innenstadt, Ortskern, Einzelhandel oder Leerstand (R2); Verpackungssteuerverbot setzt nicht an Sortiment oder Ansiedlung an.
AfD-ST 3604 (S. 198, 199, 202): Parkplätze nur als Behindertenparkplätze ohne Innenstadtbezug; Straßenbau und Baustellen ohne Bezug zur Erreichbarkeit von Innenstadt oder Einzelhandel; keine Aussage zu Öffnungszeiten.
Linke-Bund 3601 (S. 14, 56, 57): Nur Regulierung von Internetkonzernen als Finanzdienstleister (S. 14), Haftung für Onlinemarktplätze im Verbraucherschutz (S. 56) und Kartellrecht gegen digitale Monopole (S. 57) – ohne Bezug zu Innenstadt, Einzelhandel oder Wettbewerb mit dem stationären Handel.
Linke-BE 3603 (S. 32, 46, 48, 54, 66, 67, 201, 204, 206, 207, 208, 210): Weitere Stellen zu Sauberkeit, Bänken, Begrünung, Toiletten, Werbung und Kiezblocks gelten stadtweit ohne Bezug zu Innenstadt oder Einzelhandel (R2); City West nur als Bedarf ohne Zusage.
Linke-BE 3604 (S. 56, 58, 64, 65, 68, 79, 90, 103, 200, 207): Parkgebühren, Parkraumüberwachung, Fuß- und Radwege ohne Bezug zu Innenstadt oder Einzelhandel (R2); Spätis-Ausnahme nur Prüfauftrag.
Linke-MV 3602 (S. 23, 26): S. 26 „Stadtprofile stärken, Innenstädte als lebendige Orte sichern“ ist ein allgemeines Ziel ohne Instrument; „Innenentwicklung vor Außenentwicklung“ ist ein Planungsgrundsatz ohne Bezug zu Einzelhandel/Leerstand im Zitat; S. 23 betrifft Ansiedlung von Schlachtkapazitäten (anderer Zusammenhang).
Linke-MV 3603 (S. 26): Keine Zusage zu Aufenthaltsqualität, Sauberkeit oder Gestaltung des öffentlichen Raums in Innenstädten; Kapitel 16 nur allgemein „Innenstädte müssen lebendig bleiben“.
Linke-MV 3604 (S. 20, 21, 24): S. 24 Öffnungszeiten betreffen Gerichte (anderer Zusammenhang); ÖPNV-, Rad- und Ortsumgehungszusagen (S. 20–21) nennen weder Innenstadt noch Einzelhandel (R2).
Linke-ST 3603 (S. 19, 81): S. 19 Präambel/Einleitung (Stadtgrün allgemein); S. 81 Kommune der Zukunft: Instandhaltung von Fuß- und Radwegen allgemein, ohne Bezug zu Innenstadt oder Einzelhandel (R2).
Linke-ST 3604 (S. 63, 81, 104): S. 63 Öffnungszeiten von Jugendeinrichtungen (anderer Zusammenhang); S. 81 und S. 104 Rad- und Fußverkehr allgemein, ohne Innenstadt, Ortskern, Einzelhandel oder Leerstand im Zitat (R2).
BSW-Bund 3601 (S. 14, 15, 30): Steuergleichheit Konzerne/Mittelstand, Kartellrecht und Marktmacht von Onlinehändlern allgemein; kein Bezug zu Einzelhandel in Innenstädten (R2).
BSW-Bund 3602 (S. 16, 19): S. 19 Ansiedlung von Lebensmittelläden im ländlichen Raum als Folge regionaler Wirtschaftskreisläufe, S. 16 Einkaufsmöglichkeiten als Daseinsvorsorge-Leitbild; weder Innenstadt noch Ortskern genannt (R2).
BSW-Bund 3603 (S. 11): Treffer „Instandhaltung“ betrifft Energienetze, anderer Zusammenhang.
BSW-Bund 3604 (S. 11, 30): S. 11 Treffer in anderem Zusammenhang (Energienetze); S. 30 „Dafür braucht es sichere Radwege in der Innenstadt“ ist Teil eines allgemeinen verkehrspolitischen Leitbilds ohne konkrete Handlungszusage und ohne Bezug zu Einzelhandel.
BSW-BE 3603 (S. 26, 27, 38, 41, 47, 56, 57, 58): Sauberkeitszusagen (Kiezreinigungsteams, Sperrmüll, Kontrollen Ordnungsamt, S. 41, 58) und Begrünung (S. 56) gelten stadtweit und nennen weder Innenstadt noch Einzelhandel (R2); S. 47 nennt Begrünung als 'sinnvolle Investitionen im Innenstadtbereich' ohne Zusage, im Kontext Klima/Hitze; S. 26/27 Instandhaltung von Sportstätten.
BSW-BE 3602 (S. 35, 44, 54): 'Ansiedlung' betrifft Geflüchtete (S. 35), Rüstungsbetriebe (S. 44) und Unternehmen allgemein über die Gewerbesteuer (S. 54); nichts zu Sortiment oder Ansiedlung in Innenstädten.
BSW-BE 3604 (S. 22, 49): Öffnungszeiten betreffen Arztpraxen (S. 22); Parkraummanagement und Ladezonen (S. 49) ohne Bezug zu Innenstadt oder Einzelhandel (R2, gehört zu Autofahren).
BSW-MV 3603 (S. 67, 75, 76): Kein Treffer; Kapitel Innere Sicherheit (Polizeipräsenz, öffentlicher Raum allgemein) und Kommunen gelesen – nichts zu Aufenthaltsqualität, Sauberkeit oder Gestaltung von Innenstädten/Ortskernen (R2).
BSW-MV 3604 (S. 28, 82, 89, 90): Parkplätze nur als Flächen für Photovoltaik; Mobilitätskapitel (ÖPNV, Bahn, Rufbus, Radwege) ohne Bezug zu Innenstadt oder Einzelhandel (R2); nichts zu Öffnungszeiten.
BSW-ST 3604 (S. 25, 32, 33): Parkplätze nur für Photovoltaik (S. 25); ÖPNV, Radverkehr, Park-&-Ride und ÖPNV-Anbindung von Versorgungszentren im ländlichen Raum ohne Bezug zu Innenstadt, Ortskern oder Einzelhandel (R2); nichts zu Öffnungszeiten.
Volt-Bund 3601 (S. 58, 74): Nichts zu Wettbewerb zwischen Online- und stationärem Handel oder Digitalisierung des lokalen Handels; S. 58 (Binnenmarkt, DMA/DSA) und S. 74 (Smarte Städte) ohne Bezug zu Einzelhandel oder Innenstadt.
Volt-Bund 3603 (S. 76, 129): Begrünung nur als Klimaanpassung bzw. Hitzeschutz (Gebäudebegrünung, Schwammstadt, innerstädtische Temperaturen senken), ohne Bezug zu Innenstadt, Einzelhandel oder Leerstand (R2).
Volt-Bund 3604 (S. 69, 70): Mobilität in der Stadt (ÖPNV, Radwege, 15-Minuten-Stadt, Tempo 30) ohne Bezug zu Innenstadt oder Einzelhandel (R2); nichts zu Öffnungszeiten.
Volt-MV 3602 (S. 46): Treffer ‚Ansiedlung‘ betrifft nachhaltige Rechenzentren im Kapitel Europa/Ostseeverbund, kein Bezug zu Innenstadt oder Einzelhandel.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 81 Kennungen, Prüfsumme `0281ff0f128c4d4f359f2325f7dbc11e5671b48e460d443b38cb1652e66edf33`. Entfallene Kennungen: keine.

**Verdächtige Reste:** M28: liberalerer; M42: liberalisieren, Liberalisierung; M81: liberalisieren, Liberalisierung – Begründung siehe oben

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Union (BE): 7 Maßnahmen, 9 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M01 3603); offene bestätigt 1; verworfen 0
Zuordnung: Union (MV): 4 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M10 3602); offene bestätigt 0; verworfen 1
Zuordnung: Union (ST): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: SPD (Bund): 2 Maßnahmen, 4 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M56 3601); offene bestätigt 1; verworfen 0
Zuordnung: SPD (BE): 4 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: SPD (MV): 2 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M27 3602); offene bestätigt 0; verworfen 0
Zuordnung: SPD (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 5 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Grüne (BE): 4 Maßnahmen, 4 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Grüne (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Grüne (ST): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (BE): 5 Maßnahmen, 6 Zuordnungen (davon 3 offen); nicht bestätigt 1 (M61 3602); offene bestätigt 2; verworfen 0
Zuordnung: FDP (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (ST): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: AfD (MV): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (ST): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Linke (Bund): 2 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Linke (BE): 9 Maßnahmen, 11 Zuordnungen (davon 3 offen); nicht bestätigt 0; offene bestätigt 3; verworfen 0
Zuordnung: Linke (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 1 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: BSW (Bund): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (ST): 3 Maßnahmen, 3 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M02 3602); offene bestätigt 1; verworfen 1
Zuordnung: Volt (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: Volt (BE): 8 Maßnahmen, 9 Zuordnungen (davon 6 offen); nicht bestätigt 0; offene bestätigt 6; verworfen 0
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** 

```
28 von 43 Bewertungen mit evidenz „offen“ – Forschungsstand recherchieren lassen
1 Bewertungen mit evidenz „belegt“ oder „gemischt“ ohne beleg_studie_url
Instrument I14: Maßnahmen mit unterschiedlichen Ursachen (M18 3603, M58 3603, M64 3602+3603, M69 3603) – gleicher Lösungsweg, gleiche Zuordnung?
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Nicht bestätigte vorgeschlagene bzw. offene Ursachen:
- M01: offene 3603 nicht übernommen (Strategie und Kiezpläne nennen keine Gestaltung des öffentlichen Raums).
- M27, M61: offene 3602 nicht übernommen (Festivals bzw. Außengastronomie betreffen Aufenthalt, nicht Sortiment oder Nutzungsmischung von Gebäuden).
- M56: offene 3601 nicht übernommen ("stationären Einzelhandel stärken" nennt weder Wettbewerbsbedingungen zum Onlinehandel noch Digitalisierung); 3603 übernommen wie bei allen Städtebauförderungs-Maßnahmen (M11, M24, M56, M57 einheitlich [3602, 3603]).
- Alle übrigen offenen Ursachen übernommen.

Ohne Ursache:
- M02: Zitat nennt weder Innenstadt, Ortskern, Einzelhandel noch Leerstand (allgemeine Förderung von Handel, Dienstleistung und Handwerk), Regel 2.
- M10: integrierte ländliche Entwicklung mit Wohnen, Freizeit, Naherholung; kein Bezug zu Handel oder Ortskern (eher Thema Abwanderung).

Schwierige Einstufungen:
- M59 (weniger verkaufsoffene Sonntage): setzt an den Öffnungszeiten (3604) an, aber in Gegenrichtung zum Ziel; daher zugeordnet mit Wirksamkeit 0 statt ohne Ursache. Ebenso sind I10/I11 (Autoerreichbarkeit) und I12/M20 (Verkehrsberuhigung) gegensätzliche Wege an derselben Ursache; beide "gemischt" (Hass-Klau-Übersicht positiv, Madrid-Central-Studie negativ für Auswärtige).
- I9 (vollständige Sonntagsfreigabe): Umsetzbarkeit 0 wegen Art. 140 GG/Art. 139 WRV (BVerfG 2009); M33 enthält als ersten Schritt mehr bezirkliche Sonntage, die allein eher I8 entsprächen.
- M66 (Polizeipräsenz): Evidenz "belegt" bezieht sich auf Kriminalitätssenkung (Campbell-Review), nicht auf Innenstadtbesuche; daher nur Wirksamkeit 2.
- Zwischennutzung (I3) vs. Umbauprogramm (I4): getrennt, weil befristete Nutzungen anders wirken als dauerhafte Umnutzung; zu beiden fand ich keine Wirkungsevaluation (NRW-Sofortprogramm wird erst bis 2027 untersucht).
- Für Aufwertung öffentlicher Räume (I14) konnte ich die UCL-Studie "Street Appeal" nicht öffnen; daher ohne Beleg-Link, "gemischt".
- M29/M51 (Umwandlung in Wohnraum) zu 3602 gezählt (Nutzungsmischung, Leerstand genannt), aber nur Wirksamkeit 1, weil Einkaufsflächen verloren gehen.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine

| mehrere (M28, M42, M81) | Blind-Reste „liberalerer“, „liberalisieren“ | allgemeine Wortbedeutung (Regeln, Öffnungszeiten lockern), keine Parteibezeichnung; stehen im Zitat bzw. in der Beschreibung des Instruments |
| Union-MV, Volt-BE | Eigene Synonyme der Erfassung | „dorfkern“ → 3602; „leerstehende Gewerbeflächen“ → 3602, „Flaniermeile“ → 3603 – im Kurzbericht gemeldet |
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

