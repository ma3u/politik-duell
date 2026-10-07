## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 2 → 2 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 1602 Volt; 1604 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1601  1602  1603  1604
Volt-Bund         87   121     7     2
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1602 (S. 66, 67, 68, 96): Kapitel Wärmewende und Klimaneutral Bauen gelesen; keine Zusage zu stabilen Heizungsregeln. Treffer zu 'geg'/'verlässlich' sind Wortteile in anderem Zusammenhang.
Volt-Bund 1604 (S. 54, 96): Keine Zusage zu Umlage, Warmmiete oder Vermieter-Anreizen für Heizungen; Treffer zu Abschreibung betreffen private Investitionen allgemein bzw. Wohnbau.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 2 Kennungen, Prüfsumme `70a396382debe6a39b2c86cb0e96be0a511c681024f3667b11fbd6165885ecec`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Heizungstausch – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1601 1602 1603 1604   alle
Union       6    3    0    2     11
SPD         8    3    4    4     19
Grüne       8    3    0    3     14
FDP         0    3    0    3      6
AfD         0    3    0    0      3
Linke       2    0    4    4     10
BSW         6    3    4    0     13
Volt        6    0    4    0     10

BE       1601 1602 1603 1604   alle
Union       6    3    6    2     17
SPD         8    3    6    4     21
Grüne       8    3    6    3     20
FDP         0    3    6    3     12
AfD         0    3    0    0      3
Linke       2    0    6    4     12
BSW         6    3    6    0     15
Volt        6    0    –    0      –

MV       1601 1602 1603 1604   alle
Union       6    3    0    2     11
SPD         8    3    6    4     21
Grüne       8    3    6    3     20
FDP         0    3  6.5    3   12.5
AfD         0    3    2    0      5
Linke       2    0    0    4      6
BSW         6    3    0    0      9
Volt        6    0    –    0      –

ST       1601 1602 1603 1604   alle
Union       6    3    3    2     14
SPD         8    3    6    4     21
Grüne       8    3    6    3     20
FDP         0    3    6    3     12
AfD         0    3    1    0      4
Linke       2    0    6    4     12
BSW         6    3    3    0     12
Volt        6    0    –    0      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01 (Bund): dauerhafte Finanzierung der Wärmeplanung und Förderung des Fernwärmeausbaus entspricht dem vorhandenen Bundesinstrument 7038; die zusätzlichen Duldungspflichten ändern den Lösungsweg nicht wesentlich. Ursache 1603 bestätigt. Die BBSR-Quelle (geöffnet) trägt den Stand der Wärmeplanung (26,3 % der Gemeinden abgeschlossen), sagt aber nichts zur Wirkung der Bundesförderung – die Einstufung "gemischt" bleibt daher plausibel.
- M02 (Bund): allgemeine Fördermittel für klimaneutrale Maßnahmen in Neubau und Sanierung; ordne ich dem Zuschussinstrument 7034 zu, weil der Lösungsweg (Zuschuss senkt die Investition) gleich ist. Ursache 1601 bestätigt; 1604 nicht, da nichts zu Mietern gesagt wird. Die KfW-PDF ließ sich nicht als Text lesen; geöffnet habe ich stattdessen den Bericht zur externen BEG-Evaluation (Prognos u. a., über solarserver.de): deutliche CO2-Einsparung und zusätzliche Maßnahmen, laut Evaluation aber auch 30–50 % Mitnahme – das stützt "gemischt".
- Schwierig: M02 ist nicht ausdrücklich auf Heizungen bezogen und nennt keinen Betrag; man könnte die Wirksamkeit für das Thema Heizungstausch niedriger ansetzen. Ich halte die Zuordnung zu 7034 trotzdem für vertretbar, weil Heizungstausch die häufigste geförderte Sanierungsmaßnahme ist.
- Keine Maßnahme ohne Ursache.
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

