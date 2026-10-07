## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 21 → 20 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 901 Volt; 909 Volt; 911 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm         901   902   903   904   905   906   907   908   909   911
Volt-Bund          9    42     6     8    26    56    70     5     9     7
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 901 (S. 32, 33, 61, 69, 70): Keine Maßnahme zu Orten, Präsenz, Kameras, Beleuchtung oder Waffenverbotszonen; ÖPNV-Treffer betreffen nur Mobilität; Ablehnung flächendeckender Überwachung (S. 26) ist keine Handlungszusage zu Orten.
Volt-Bund 909 (S. 18, 83, 86, 106, 123): Herkunft-Treffer stammen aus Lebensmittelkennzeichnung und Gleichbehandlung; nichts zu Nennung der Herkunft von Tatverdächtigen, Lagebildern oder Dunkelfeld.
Volt-Bund 911 (S. 32, 133): Psychotherapie-Kassensitze, Resilienz und Konsumräume/Drug-Checking ohne Bezug zu Gewalt oder schweren Erkrankungen.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

<details><summary>Ohne Bündel an Ursachen mit Bündeln (5, nur zur Information – je Instrument zählt eine Maßnahme)</summary>

```
Volt (Bund): S. 35 „Opportunitätsprinzip ausweiten, damit Polizeiressourcen gezielter eingesetzt wer…“ ohne Bündel (Ursache 902 hat Bündel)
Volt (Bund): S. 154 „Besitz und Gebrauch aller psychoaktiven Substanzen sanktionsfrei stellen.“ ohne Bündel (Ursache 902 hat Bündel)
Volt (Bund): S. 35 „Spezialeinheiten gegen organisierte Kriminalität bei BKA, Zoll und in den Länder…“ ohne Bündel (Ursache 902 hat Bündel)
Volt (Bund): S. 31 „Europol zu einer europäischen Polizei mit Exekutivrechten ausbauen, gegen grenzü…“ ohne Bündel (Ursache 907 hat Bündel)
Volt (Bund): S. 19 „Deradikalisierungsprogramme und Ausstiegshilfen fördern.“ ohne Bündel (Ursache 907 hat Bündel)
```

</details>

**Blindliste:** 21 Kennungen, Prüfsumme `2460efeed02aa498a8129da97016820f1d1357cf1d0020a922cbf9cfb1be8cd5`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 21 Maßnahmen, 23 Zuordnungen (davon 3 offen); nicht bestätigt 2 (M06 902, M10 908); offene bestätigt 2; verworfen 1
```

**Hinweise zur Bewertung:** 

```
Instrument 7491: Maßnahmen mit unterschiedlichen Ursachen (M10 904, M21 907) – gleicher Lösungsweg, gleiche Zuordnung?
```

**Punkte** (`npm run punkte`):

```
Sicherheit – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund      901  902  903  904  905  906  907  908  909  911   alle
Union       1  6.3    2  8.8    2  5.3    9    3    0    2   39.4
SPD         4  6.9    0  8.3    2    4  6.8  4.5    0    0   36.5
Grüne       3  7.4    0    9    2    3    9  8.3    3    5   49.7
FDP         0  4.6    0    4    0  3.5  6.3    0    0    0   18.4
AfD         5  6.9    2    0  2.5    0  4.9    0    0    0   21.3
Linke       2    5    0    8    0  4.5  6.3    4    0    2   31.8
BSW         4  6.8    1  6.3    2    4    4    0    0    0   28.1
Volt        0  6.5    4  6.8    3  4.5  7.1    4    0    0   35.9

BE        901  902  903  904  905  906  907  908  909  911   alle
Union       9  6.3  4.5    9    2  5.3    9    0    3    2   50.1
SPD         9  6.8    0  8.6    2    4  6.8    5    3    0   45.2
Grüne       9  7.2  5.5    9    2    3    9  7.8    3    5   60.5
FDP         9  4.8  5.5  6.3    0  3.5  6.3    4    0    0   39.4
AfD         8  6.7  1.5    0  2.5    0  4.9    0    2    0   25.6
Linke       9  5.3    4  6.8    0  4.5  6.3    6    0    2   43.9
BSW         9  7.4  5.5    8    2    4    4    0    0    0   39.9
Volt        –    –    –    –    3  4.5  7.1    –    –    0      –

MV        901  902  903  904  905  906  907  908  909  911   alle
Union       9  7.2  7.5    9    2  5.3    9    0    0    2     51
SPD       5.5  6.9    0  5.8    2    4  6.8    4    0    0     35
Grüne       9    6    4  5.5    2    3    9    4    3    5   50.5
FDP         4  6.8    0    8    0  3.5  6.3    0    3    0   31.6
AfD         4  7.1  5.8    0  2.5    0  4.9    0  4.5    0   28.8
Linke       0  6.5    0    8    0  4.5  6.3    8    0    2   35.3
BSW         8    9    4    9    2    4    4    0    0    0     40
Volt        –    –    –    –    3  4.5  7.1    –    –    0      –

ST        901  902  903  904  905  906  907  908  909  911   alle
Union     5.5  7.2    3    4    2  5.3    9    0    0    2     38
SPD         0  6.8    6    4    2    4  6.8    0    0    0   29.6
Grüne       9  6.6    4    6    2    3    9    6    3    5   53.6
FDP         4    5    0    4    0  3.5  6.3    0    0    0   22.8
AfD         2  6.8  4.6    0  2.5    0  4.9    0    0    0   20.8
Linke       6  5.3  8.5    9    0  4.5  6.3    6    3    2   50.6
BSW         4  6.8    4  6.3    2    4    4    6    0    0   37.1
Volt        –    –    –    –    3  4.5  7.1    –    –    0      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Nicht bestätigt: M06 (unabhängige Kontrollstellen für Polizei, Verwaltung, Justiz) setzt an keiner Ursache an – es geht um Kontrolle staatlichen Fehlverhaltens, nicht um Aufklärung oder Folgen von Straftaten (vorgeschlagen war 902). M10: 908 (offen) nicht bestätigt, da das Zitat „Belästigung und Gewalt“ nicht ausdrücklich als sexualisiert benennt und „neue Formen“ eher auf digitale Gewalt deutet (nach Regel 12 nicht erfasst).
- Offene entschieden: M07 907 bestätigt (Zitat nennt Terrorismus ausdrücklich; 906 als Vorschlag beibehalten wegen internationaler Zusammenarbeit, gleiche Zuordnung wie beim Instrument). M14 902 bestätigt (Personal von Ermittlungsbehörden, organisierte Kriminalität nach Regel 4).
- Schwierig: M08 (Bleibeperspektive, Regel 8 „in beiden Richtungen“) – Zitat nennt Straffälligkeit, daher 905; Wirkung klein, weil die Gruppe schon arbeitet. M11 als Einzelbewertung statt 7490, weil „sanktionsfrei“ über das portugiesische Modell hinausgeht (Umsetzbarkeit 2). M10 und M21 zu 7491 (Strafverschärfung für ein Deliktfeld), obwohl der Instrumentname „Gewalt- und Sexualdelikte“ nennt. M04: Wirksamkeit 2 vs. 1 knapp, weil Auslandstaten kaum aufklärbar sind.
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

