## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund | BE | MV | ST |
| --- | --- | --- | --- | --- |
| Union | 2 → 2 | 7 → 3 | 4 → 2 | 1 → 1 |
| SPD | 3 → 0 | 8 → 8 | 1 → 1 | 3 → 3 |
| Grüne | 4 → 4 | 8 → 8 | 5 → 5 | 5 → 5 |
| FDP | 1 → 0 | 3 → 2 | 3 → 3 | 2 → 2 |
| AfD | 3 → 2 | 3 → 1 | 4 → 4 | 3 → 3 |
| Linke | 5 → 5 | 9 → 9 | 4 → 4 | 5 → 5 |
| BSW | 1 → 1 | 3 → 3 | 1 → 1 | 0 → 0 |
| Volt | 5 → 5 | 5 → 5 | 3 → 3 | 3 → 3 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 3401 Union, SPD, FDP, BSW, Volt; 3402 Union, SPD, FDP, AfD; 3403 SPD, FDP, BSW. **BE** 3401 Volt; 3402 AfD; 3403 FDP, AfD. **MV** 3401 SPD, Grüne, FDP, BSW, Volt; 3402 AfD; 3403 Union, SPD, BSW. **ST** 3401 Union, SPD, Grüne, AfD, Linke, BSW, Volt; 3402 Union, AfD, BSW; 3403 BSW.

**Nicht durchsucht:** keins

<details><summary>Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)</summary>

```
SPD-MV: Synonym „interkulturell kompetent“ → 3402 Kommunikation und Fortbildung der Polizei
Grune-MV: Stand im PDF 16.07.2026
FDP-BE: Synonym „kriminalitätsbelastet“ → 3401 Kontrollen begrenzen und nachvollziehbar machen
FDP-BE: Synonym „kontaktbereichsbeamt“ → 3402 Kommunikation und Fortbildung der Polizei
FDP-ST: Stand im PDF Stand: 05.06.2026 (Titelseite; beschlossen am 25. April 2026)
Linke-MV: Stand im PDF Stand: Juni 2026 (beschlossen am 30. Mai 2026)
```

</details>

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3401  3402  3403
Union-Bund         2     1     3
Union-BE          13     3     3
Union-MV           8     1     0
Union-ST           0     4     4
SPD-Bund           0     0     1
SPD-BE             2     4     2
SPD-MV             0     2     0
SPD-ST             0     1     1
Grune-Bund         1     0     4
Grune-BE           5     5     3
Grune-MV           1     1     4
Grune-ST           3     4     2
FDP-Bund           2     0     0
FDP-BE             2     0     0
FDP-MV             1     2     2
FDP-ST             0     0     0
AfD-Bund           1     0     1
AfD-BE             3     0     1
AfD-MV             0     2     0
AfD-ST             0     0     5
Linke-Bund         5     2     2
Linke-BE           5     9     4
Linke-MV           2     0     2
Linke-ST           0     2     2
BSW-Bund           0     0     1
BSW-BE             1     5     0
BSW-MV             3     2     1
BSW-ST             1     2     0
Volt-Bund          0     5     5
Volt-BE            1     3     4
Volt-MV            0     1     2
Volt-ST            1     3     3
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 3401 (S. 39, 40): S. 40: Kontrollquittung wird nur abgelehnt (keine Pflicht einführen) – Festhalten am Bestehenden ohne eigene Handlung. S. 39: Videoschutz und Gesichtserkennung an Kriminalitätsschwerpunkten dienen der Identifizierung von Straftätern, keine Regel für Personenkontrollen (R2: Aufklärung von Straftaten gehört zu Sicherheit).
Union-MV 3403 (S. 26, 27, 28, 29, 30, 31, 32, 33, 34, 35): Kapitel Sicherheitsland gelesen; keine Zusage zu Beschwerdestellen, unabhängiger Kontrolle, Kennzeichnung oder Dokumentation von Polizeieinsätzen.
Union-ST 3401 (S. 6, 7): Nur allgemeine Zusage, Kompetenzen und Befugnisse der Polizei zu erweitern (S. 6), ohne Regel zu Personenkontrollen; konkretisiert wird sie mit Videoschutz, KI-Videoschutz und biogeographischer Analyse (S. 7) – Verhinderung und Aufklärung von Straftaten, nach R2 Sicherheit. Nichts zu anlasslosen Kontrollen, Kontrollbescheinigung oder Kontrollorten.
SPD-Bund 3403 (S. 40, 41, 42, 43, 47, 50, 55): Keine Zusage zu Beschwerdestellen, Polizeibeauftragten, unabhängiger Kontrolle, Kennzeichnung oder Dokumentation von Polizeieinsätzen; Treffer 'Kennzeichnungspflicht' S. 50 betrifft Bots (KI-Verordnung).
SPD-MV 3401 (S. 46, 47, 48): Kapitel Innenpolitik/Polizei gelesen; keine Aussage zu Kontrollbefugnissen, anlasslosen Kontrollen oder Kontrollbescheinigungen.
SPD-MV 3403 (S. 43, 46, 47, 48): Keine Beschwerdestelle, Polizeibeauftragte, Kennzeichnung oder Einsatzdokumentation; S. 43 nur Bekenntnis zur Trennung von Verfassungsschutz und Polizei, S. 42 Verfassungstreue im öffentlichen Dienst ohne Bezug zu Polizeikontakten.
SPD-ST 3401 (S. 28, 29, 30): Kapitel Sicherheit gelesen; keine Aussage zu Kontrollbefugnissen, anlasslosen Kontrollen, Kontrollbescheinigungen oder Kontrollorten.
Grune-Bund 3401 (S. 133, 134): Neben dem Ticketsystem nur allgemeine Aussagen: Kontrollbefugnisse 'rechtssicher' ausgestalten und Rechtsgrundlagen 'zielgerichtet und anlassbezogen' – ohne erkennbare Richtung bzw. als Leitsatz; nicht als eigene Maßnahme erfasst.
Grune-MV 3401 (S. 77, 78): Racial Profiling (S. 77) gehört nach R2 zu Diskriminierung im Alltag; hohe Hürden für intensive Grundrechtseingriffe betreffen Überwachung (Online-Durchsuchung, Quellen-TKÜ), nicht Kontrollen; anlassloses Abfilmen bei Demonstrationen (S. 78) ist Versammlungsrecht, keine Regel für Kontrollen. Keine Aussage zu anlasslosen Kontrollen, Kontrollbescheinigung oder Kontrollorten.
Grune-ST 3401 (S. 18, 42, 43): Keine Regeln zu anlasslosen Kontrollen, Kontrollbescheinigung oder Kontrollorten. Racial Profiling (S. 43) nur als Ziel der Fortbildung bzw. nach R2 Diskriminierung; S. 42 betrifft Massenüberwachung und Datenanalyse, S. 18 Videoüberwachung in Schlachthöfen.
FDP-Bund 3402 (S. 22, 23, 24, 25, 26): Kapitel IV.a/b gelesen; nichts zu Einsatzpraxis, Kommunikation, Aus- oder Fortbildung der Polizei bei Kontakten mit Bürgern. Fortbildung zur IHRA-Antisemitismusdefinition (S. 26) gehört zu Antisemitismus.
FDP-Bund 3403 (S. 22, 23, 24, 25, 26): Keine Beschwerdestelle, Polizeibeauftragte, Kennzeichnung oder Einsatzdokumentation. Kontrolle betrifft nur die Nachrichtendienste (S. 22); Aufzeichnung betrifft Strafprozesse vor Gericht (S. 23).
FDP-BE 3403 (S. 66, 67, 72, 75, 76): Kapitel Sicherheit, Justiz und Bürgerrechte gelesen; keine Zusage zu Beschwerdestellen, unabhängiger Kontrolle, Kennzeichnung oder Dokumentation von Polizeieinsätzen.
FDP-MV 3401 (S. 133, 134): Keine Regeln zu Personenkontrollen oder Kontrollbefugnissen; abgelehnt werden nur flächendeckende Videoüberwachung, Gesichtserkennung und anlasslose Datenspeicherung (Datenerfassung, keine Polizeikontakte).
AfD-Bund 3402 (S. 119, 120): Kapitel ‚Stärkung der Polizei‘ gelesen: nur Besoldung, Ausrüstung, Versicherung, Versorgung (R2 Sicherheit); nichts zu Einsatzpraxis, Kommunikation oder Aus- und Fortbildung.
AfD-BE 3402 (S. 12, 13): Keine Zusage zu Einsatzpraxis, Kommunikation oder Fortbildung; 'ausreichende Ausbildung des Nachwuchses' steht in der Personalforderung (R2: Sicherheit).
AfD-BE 3403 (S. 13): Treffer 'polizeikontrolle' betrifft anlasslose Kontrollen (3401); keine Zusage zu Beschwerdestellen, Kennzeichnung oder Dokumentation. Aufhebung des LADG gehört nach R2 zu Diskriminierung im Alltag.
AfD-MV 3402 (S. 38, 39, 53, 63): Fortbildung nur als Bedarfsaussage („erforderlich“, „muss … eingeräumt werden“) im Zusammenhang mit Ausstattung und Schießausbildung (R2); Führungskräfteauswahl und interne Mitarbeiterbefragungen betreffen nicht die Einsatzpraxis gegenüber Bürgern; Fundstellen S. 53 (Verwaltung) und S. 63 (Gesundheitswesen) aus anderem Zusammenhang.
AfD-ST 3401 (S. 104, 112, 132, 133): Kapitel Innere Sicherheit und Demokratie/Bürgerrechte gelesen; keine Zusage zu Regeln für Polizeikontrollen oder Kontrollbefugnissen. Ablehnung anlassloser Überwachung (S. 132) betrifft digitale Datenspeicherung.
AfD-ST 3402 (S. 104, 106, 133): Keine Zusage zu Einsatzpraxis, Kommunikation oder Fortbildung im Umgang mit Bürgern; S. 104 nur allgemeines Ziel (Polizei als Freund und Helfer), S. 106 Taser mit Ausbildung ist Ausstattung (R2), S. 133 'neue Praxis der Toleranz gegenüber Demonstrationen' ohne konkretes Instrument.
Linke-ST 3401 (S. 128, 134): Kapitel Innenpolitik (S. 127–135) gelesen; keine Zusage zu anlasslosen Kontrollen, Kontrollbescheinigung oder Kontrollbefugnissen, nur allgemeine Leitsätze („Sicherheit entsteht nicht durch Kontrolle …“).
BSW-Bund 3401 (S. 34, 35): Kapitel 'Sicherheit gewährleisten, Freiheit schützen' gelesen; nichts zu anlasslosen Kontrollen, Kontrollbescheinigungen oder Kontrollorten. Der Grundsatz klarer Grenzen für Befugnisse betrifft Datenauswertung und ist keine konkrete Zusage.
BSW-Bund 3403 (S. 12, 34, 35, 36): Einziger Treffer 'Kennzeichnungspflicht' (S. 12) betrifft die Lebensdauer von Produkten. Parlamentarische Kontrolle (S. 36) betrifft den Verfassungsschutz. Nichts zu Beschwerdestellen, Kennzeichnung oder Dokumentation von Polizeieinsätzen.
BSW-BE 3401 (S. 38, 40, 41): Videoüberwachung an kriminalitätsbelasteten Orten (S. 41) ist keine Regel für Polizeikontrollen von Personen, sondern Überwachungstechnik (Sicherheit, R2); Streifenpräsenz an Brennpunkten (S. 40) betrifft Personaleinsatz (R2); Grundsatz zu verhältnismäßigen, richterlich kontrollierten Eingriffen (S. 38) ist ein Leitbild ohne eigene Handlung. Keine Aussage zu anlasslosen Kontrollen oder Kontrollbescheinigung.
BSW-MV 3401 (S. 67, 92): Nur allgemeine Ablehnung einer Ausweitung staatlicher Kontrollbefugnisse und keine Ausweitung der Videoüberwachung (S. 67) bzw. Grenzen für KI in Polizei (S. 92) – Haltung zum Bestehenden bzw. anderer Zusammenhang, keine Regel für Kontrollen.
BSW-MV 3403 (S. 67, 68, 70, 73): Keine Beschwerdestelle, unabhängige Kontrolle oder Kennzeichnung der Polizei; Kontrolle und Dokumentation auf S. 70 betreffen den Verfassungsschutz, rechtsstaatliche Verfahren auf S. 73 das Asylsystem.
BSW-ST 3401 (S. 67, 68, 86): Nur Grundsatz, Befugnisse müssten verhältnismäßig und begrenzt sein; konkrete Ablehnung betrifft Palantir/automatisierte Datenanalyse, nicht Polizeikontrollen; Videoüberwachung S. 86 betrifft Schlachthöfe.
BSW-ST 3402 (S. 9, 66, 67): ‚Deeskalation ist dabei stets das oberste Gebot‘ (S. 66) ist ein Leitsatz zum Umgang mit Radikalisierung ohne Maßnahme zu Einsatzpraxis oder Fortbildung; S. 9 betrifft Außenpolitik; ‚bürgernahe Polizei‘ (S. 66) nur Leitbild.
BSW-ST 3403 (S. 66, 72): ‚Rechtswidriges staatliches Handeln darf niemals folgenlos bleiben‘ (S. 66) ohne Instrument (keine Beschwerdestelle, Kennzeichnung o. Ä.); Ombudsstellen S. 72 betreffen die Jugendhilfe und sind als ‚können/sollten‘ formuliert.
Volt-Bund 3401 (S. 32, 33, 34, 35, 36): Kapitel Innere Sicherheit gelesen: keine Regeln zu anlasslosen Kontrollen, Kontrollbescheinigung, Kontrollorten oder Kontrollbefugnissen; einheitliches Polizeigesetz (S. 36) ohne Inhalt zu Kontrollen.
Volt-BE 3401 (S. 74, 76, 77, 78): Keine Regel zu Kontrollbefugnissen, anlasslosen Kontrollen oder Kontrollbescheinigung. Die Studie zu Racial Profiling und Personenkontrollen (S. 78) ist ein Untersuchungsauftrag mit erst später abzuleitenden Maßnahmen und gehört nach R2 zu Diskriminierung im Alltag.
Volt-MV 3401 (S. 14, 15, 17, 18, 47): Keine Aussage zu anlasslosen Kontrollen, Kontrollbescheinigungen, Kontrollorten oder Befugnissen der Landespolizei; Grenzkontrollen (S. 47) betreffen Freizügigkeit im Schengenraum, nicht Polizeikontakte im Alltag.
Volt-ST 3401 (S. 92, 168, 170): Keine Regeln zu Kontrollen oder Kontrollbefugnissen gegenüber Personen; S. 92 betrifft Verkehrskontrollen (Vision Zero), S. 168 Kontrollen bei Gewerbeanmeldungen und Befugnisse gegen organisierte Kriminalität.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 117 Kennungen, Prüfsumme `10f8780fed4fee782e418e874f67bc560a7a77c8ff37a15136b54aeebf3c5589`. Entfallene Kennungen: keine.

**Verdächtige Reste:** M063: Ampel; M082: Rot-Rot – Begründung siehe oben

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 2 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M062 3402); offene bestätigt 0; verworfen 0
Zuordnung: Union (BE): 7 Maßnahmen, 7 Zuordnungen (davon 4 offen); nicht bestätigt 4 (M042 3401, M092 3401, M113 3402, M102 3403); offene bestätigt 1; verworfen 4
Zuordnung: Union (MV): 4 Maßnahmen, 4 Zuordnungen (davon 2 offen); nicht bestätigt 2 (M021 3401, M032 3401); offene bestätigt 0; verworfen 2
Zuordnung: Union (ST): 1 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M016 3402); offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 3 (M065 3401, M026 3402, M094 3401); offene bestätigt 0; verworfen 3
Zuordnung: SPD (BE): 8 Maßnahmen, 8 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (MV): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: SPD (ST): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (BE): 8 Maßnahmen, 9 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M110 3402); offene bestätigt 0; verworfen 0
Zuordnung: Grüne (MV): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M115 3402); offene bestätigt 0; verworfen 0
Zuordnung: Grüne (ST): 5 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M076 3401); offene bestätigt 0; verworfen 1
Zuordnung: FDP (BE): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M005 3401); offene bestätigt 0; verworfen 1
Zuordnung: FDP (MV): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: FDP (ST): 2 Maßnahmen, 3 Zuordnungen (davon 2 offen); nicht bestätigt 0; offene bestätigt 2; verworfen 0
Zuordnung: AfD (Bund): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M054 3401); offene bestätigt 0; verworfen 1
Zuordnung: AfD (BE): 3 Maßnahmen, 3 Zuordnungen (davon 2 offen); nicht bestätigt 2 (M109 3401, M017 3401); offene bestätigt 0; verworfen 2
Zuordnung: AfD (MV): 4 Maßnahmen, 5 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: AfD (ST): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Linke (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (BE): 9 Maßnahmen, 9 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (MV): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Linke (ST): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: BSW (BE): 3 Maßnahmen, 3 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: BSW (MV): 1 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M077 3403); offene bestätigt 0; verworfen 0
Zuordnung: BSW (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (BE): 5 Maßnahmen, 6 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M071 3402); offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 3 Maßnahmen, 4 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M030 3402); offene bestätigt 1; verworfen 0
Zuordnung: Volt (ST): 3 Maßnahmen, 4 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M014 3402); offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** keine

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Nicht bestätigte vorgeschlagene Ursachen:
- M026 (3402): Ziel ist der Schutz der Einsatzkräfte durch Ausrüstung und Kräfteansatz; nach Regel 2 gehört das zu Sicherheit.
- M065 (3401): Allgemeine Befugnisse der Bundespolizei für Sicherheitslagen, nichts zu Kontrollen; Sicherheit (gleich behandelt wie M054).
- M113 (3402): Schießtraining betrifft Waffeneinsatz, nicht Kommunikation oder Umgang bei Kontakten.

Offene Ursachen, bestätigt:
- 3402 bei M015, M022, M043, M047, M078 (Aus- und Fortbildung nach Regel 1), M061 (Zusammensetzung des Personals; Studie Chicago), M091 (Kontakt Polizei–Schule, schwach).
- 3401 bei M081 (zusätzliche Kontrollen im öffentlichen Raum, gleich behandelt wie M112), M082 (Rücknahme von Dokumentationspflichten, auch zu Kontrollen).
- 3402 und 3403 bei M040.

Offene Ursachen, nicht bestätigt:
- 3402 bei allen Bodycam-Maßnahmen (M014, M016, M030, M062, M071, M110, M115): Bodycams sind Dokumentation (3403); eine Wirkung auf das Verhalten ist laut Review nicht belegt. Einheitlich für alle Bodycam-Vorschläge.
- 3403 bei M077 (Einsatznachbereitung ist interne Qualitätssicherung, keine Beschwerde- oder Kontrollstelle).

Ohne Ursache (ursachen: []):
- M005 (Datei über Fußballfans: Datenschutz, keine Kontrollregel), M017 (Ausgangssperre für jugendliche Intensivtäter: Sanktion, Jugendkriminalität), M021 und M092 (Versammlungsrecht und Befugnisse gegen Gewalt bei Demonstrationen: Sicherheit), M032, M042, M076, M109 (Videoüberwachung und Gesichtserkennung: keine Personenkontrolle, Sicherheit; einheitlich behandelt), M054 (Strafverfolgungsbefugnisse: Sicherheit), M094 (Harmonisierung von Polizeirecht ohne Inhalt), M102 (allgemeiner Bürokratieabbau ohne Bezug zur Aufklärung), dazu M026, M065, M113 (siehe oben).

Schwierige Einstufungen:
- Maßnahmen, die in Gegenrichtung wirken (mehr Kontrollen, Abschaffung von Polizeibeauftragten, weniger Ermittlungen), habe ich der Ursache zugeordnet und mit Wirksamkeit 0 bewertet, statt sie wegzulassen. So bleibt sichtbar, dass die Partei an der Ursache ansetzt, aber in eine Richtung, die beim Ziel nicht hilft.
- Bundesmaßnahmen zur Polizei allgemein: Umsetzbarkeit 2 (Bund nur für Bundespolizei zuständig); ausdrücklich auf die Bundespolizei bezogene oder bestehende Bundesstellen (M117, M101, I18): 3.
- I2 (anlasslose Kontrollen begrenzen) steht mit „belegt“ auf 2 statt 3: Die Belastung durch häufige Kontrollen ist gut belegt, aber kriminalitätsbelastete Orte und Waffenverbotszonen machen nur einen Teil der Kontakte aus.
- Kennzeichnungspflicht (I7, M041, M117): mit Wirksamkeit 2 trotz „offen“, weil sie eine Voraussetzung für die Zuordnung von Vorwürfen ist (EGMR 2017); Wirkungsstudien habe ich nicht gefunden.
- Antidiskriminierungsschulungen (1) gegenüber Deeskalationstraining (2): Die Studienlage unterscheidet sich (NYPD ohne Verhaltensänderung, Louisville mit weniger Gewaltanwendung). Die Abgrenzung bei gemischten Zitaten (M034, M053) war schwierig.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine

| AfD-Bund, AfD-MV (M063, M082) | Blind-Reste „Ampel“, „Rot-Rot“ | Stehen im wörtlichen Zitat und nennen die frühere Regierung, nicht die fordernde Partei; Zitate werden nicht verändert |
| SPD-MV, FDP-BE | Eigene Synonyme der Erfassung | „interkulturell kompetent“ → 3402; „kriminalitätsbelastet“ → 3401, „kontaktbereichsbeamt“ → 3402 – im Kurzbericht gemeldet |
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

