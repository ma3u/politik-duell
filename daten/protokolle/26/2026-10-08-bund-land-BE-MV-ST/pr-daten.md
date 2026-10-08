## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Vervollständigung aller Parteien, 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Union | 2 → 2 |
| SPD | 2 → 2 |
| Grüne | 4 → 4 |
| FDP | 2 → 1 |
| AfD | 1 → 0 |
| Linke | 4 → 3 |
| BSW | 1 → 1 |
| Volt | 4 → 4 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2601 FDP, AfD, BSW; 2602 AfD; 2603 Union, SPD, Grüne, FDP, AfD, Linke, BSW, Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2601  2602  2603
Union-Bund         5     1     0
SPD-Bund          11     0     0
Grune-Bund        41     2     1
FDP-Bund           3     0     0
AfD-Bund           0     0     2
Linke-Bund        16     2     2
BSW-Bund           1     0     2
Volt-Bund         31     8     9
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Union-Bund 2603 (S. 61, 62): Abschnitt zur Teilhabe gelesen; nichts zu Vorbehalten, Beratung oder flexibleren Regeln bei Einstellung.
Grune-Bund 2603 (S. 19, 90, 123): Nur allgemeine Hinweise auf Abbau von Vorurteilen (S. 19), S. 90 anderer Zusammenhang; keine konkrete Zusage zu Vorbehalten oder Beratung der Betriebe.
FDP-Bund 2603 (S. 25): Abschnitt zu Menschen mit Behinderung gelesen; nichts zu Vorbehalten, Beratung oder Regeln der Beschäftigung.
AfD-Bund 2601 (S. 23, 24): Keine Aussage zu Barrierefreiheit von Bahnhöfen oder Verkehr im Programm; Suche ohne Treffer.
AfD-Bund 2603 (S. 89, 164): Treffer 'Vorbehalte' sind Fehltreffer (Ersatzdienst, Promotionsrecht); nichts zu Vorbehalten gegenüber Beschäftigung.
Linke-Bund 2603 (S. 8, 16, 54): Kündigungsschutz-Treffer betreffen Mieter und Eltern; nichts zu Vorbehalten oder Beratung bei Beschäftigung.
BSW-Bund 2601 (S. 22): Kein Bezug zu Bahnhöfen oder Verkehr; nur allgemeine Forderung nach konsequenterer Umsetzung der UN-BRK.
BSW-Bund 2603 (S. 21, 33): Fundstellen betreffen Betriebsräte und Gewaltschutz, nicht Vorbehalte oder Beschäftigungsregeln.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 20 Kennungen, Prüfsumme `879ae513f767c3055c21f54d42b26e077c49d28fac8fecadfcd2171a872bea94`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Union (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: SPD (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Grüne (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: FDP (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 2 offen); nicht bestätigt 1 (M02 2601); offene bestätigt 1; verworfen 1
Zuordnung: AfD (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 1 (M12 2602); offene bestätigt 0; verworfen 1
Zuordnung: Linke (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 1 offen); nicht bestätigt 1 (M11 2601); offene bestätigt 0; verworfen 1
Zuordnung: BSW (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (Bund): 4 Maßnahmen, 4 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Barrieren für Menschen mit Behinderung – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2601 2602 2603   alle
Union       2    6    0      8
SPD         2    6    0      8
Grüne       5    7    0     12
FDP         0    6    0      6
AfD         0    0    0      0
Linke       2  6.5    0    8.5
BSW         0    4    0      4
Volt        2  8.5    0   10.5

BE       2601 2602 2603   alle
Union       2    6    0      8
SPD         2    6    0      8
Grüne       5    7    0     12
FDP         0    6    0      6
AfD         0    0    0      0
Linke       2  6.5    0    8.5
BSW         0    4    0      4
Volt        2  8.5    0   10.5

MV       2601 2602 2603   alle
Union       2    6    0      8
SPD         2    6    0      8
Grüne       5    7    0     12
FDP         0    6    0      6
AfD         0    0    0      0
Linke       2  6.5    0    8.5
BSW         0    4    0      4
Volt        2  8.5    0   10.5

ST       2601 2602 2603   alle
Union       2    6    0      8
SPD         2    6    0      8
Grüne       5    7    0     12
FDP         0    6    0      6
AfD         0    0    0      0
Linke       2  6.5    0    8.5
BSW         0    4    0      4
Volt        2  8.5    0   10.5
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M12 (Mindestlohn in Werkstätten durch Mittelumschichtung) – vorgeschlagen war 2602. Die Maßnahme betrifft das Entgelt in Werkstätten, nicht fehlende geeignete Tätigkeiten, Ausstattungskosten, Quote oder Abgabe in Betrieben; daher ursachen []. M09/M18 behalten 2602, weil sie zusätzlich Inklusionsbetriebe (Arbeitsplätze auf dem allgemeinen Arbeitsmarkt) schaffen.
- Offene Ursachen: M13 -> 2602 bestätigt (Vermittlung bringt Menschen und geeignete Tätigkeiten zusammen). M02 -> keine Ursache (allgemeines Ziel ohne Bezug zu Verkehr). M11 -> keine Ursache (Pflicht der Privatwirtschaft für Güter und Dienstleistungen, nicht Bahnhöfe/Verkehr; laut Regel 1 nur offen).
- 2603 (Vorbehalte, Beratung) wurde keiner Maßnahme zugeordnet; keine Maßnahme nennt Beratung von Arbeitgebern oder Vorbehalte ausdrücklich. Bei I4 (Vermittlung) ist das ein Grenzfall.
- Schwierig: I2 mit Wirksamkeit 1 – die Ursache 2601 nennt ausdrücklich Steuerung statt Geld als Engpass (Bundesrechnungshof), daher wiegt eine reine Investitions- oder Beschleunigungszusage wenig. M04 (Bahnsanierung, „natürlich barrierefrei“) ist dabei, weil Barrierefreiheit Teil der Zusage ist. M01 (Quote 6 % ohne Freikaufen) gesondert, weil die Abschaffung der Abgabe als Ausgleich rechtlich deutlich heikler ist. M07 belegt: die BMAS-Seite habe ich geöffnet, den Volltext (PDF) konnte das Werkzeug nicht lesen; die Aussage zur Nachhaltigkeit stammt aus der Zusammenfassung der Seite/Suche.
- Quellen ohne Zugriff: CEPR-Fassung der Österreich-Studie (403), SSOAR (gesperrt); ersatzweise RePEc-Zusammenfassung.
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

