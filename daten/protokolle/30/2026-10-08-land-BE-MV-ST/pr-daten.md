## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 1 → 1 | 0 → 0 | 0 → 0 |

**Ohne Maßnahme zu einer Ursache:** **BE** 3001 Volt; 3004 Volt. **MV** 3001 Volt; 3004 Volt; 3006 Volt. **ST** 3001 Volt; 3004 Volt; 3006 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3001  3002  3003  3004  3005  3006
Volt-BE            0     –     –     0     –     2
Volt-MV            0     –     –     0     –     0
Volt-ST            0     –     –     0     –     3
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 3001 (S. 86): Nur alkoholfreie Pride-Veranstaltungsformate gefördert; keine Regel zu Verkauf oder Verfügbarkeit von Alkohol.
Volt-BE 3004 (S. 84): Im ganzen Programm nichts zu Glücksspiel, Spielhallen oder Sportwetten.
Volt-ST 3001 (S. 146): Nur Steuern auf Alkohol (Ursache 3002) und der unspezifische Satz 'Kombination mit Werbe- und Jugendschutzmaßnahmen' ohne konkrete Zusage.
Volt-ST 3004 (S. 146): Kein Wort zu Glücksspiel, Spielhallen oder Sportwetten im Programm.
Volt-ST 3006 (S. 15, 37, 128): 'Entstigmatisierung' (S. 37) betrifft Schwangerschaftsabbruch, 'Peer' (S. 15) Schulentwicklung, S. 128 Männerberatung ohne Sucht.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 1 Kennungen, Prüfsumme `18a4ec311bcc036bc38ba3b6ce1492e8a06ff8be958081d27268ae1b70491584`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 0 Maßnahmen, 0 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Sucht und Glücksspiel – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     3001 3002 3003 3004 3005 3006   alle
Union       0    0    0    0    3    0      3
SPD         0    0    6    0    2    0      8
Grüne       0    0  7.5    0    3    4   14.5
FDP         0    0    0    0    6    0      6
AfD         0    0    0    0    3    4      7
Linke       0    0    6    0  6.5    4   16.5
BSW         0    0    0    0    0    0      0
Volt        0    0    0    3  5.6    6   14.6

BE       3001 3002 3003 3004 3005 3006   alle
Union       0    0    0    0    3    0      3
SPD         2    0    6    0    2    9     19
Grüne       0    0  7.5    6    3    9   25.5
FDP         0    0    0    4    6    9     19
AfD         0    0    0    0    3    0      3
Linke       0    0    6    5  6.5    9   26.5
BSW         0    0    0    0    0    4      4
Volt        0    0    0    0  5.6    4    9.6

MV       3001 3002 3003 3004 3005 3006   alle
Union       0    0    0  5.5    3    3   11.5
SPD         2    0    6    0    2    3     13
Grüne       0    0  7.5    0    3    6   16.5
FDP         0    0    0    0    6    0      6
AfD         3    0    0    0    3    0      6
Linke       0    0    6    0  6.5    0   12.5
BSW         0    0    0  3.5    0    9   12.5
Volt        0    0    0    0  5.6    0    5.6

ST       3001 3002 3003 3004 3005 3006   alle
Union       0    0    0    2    3    0      5
SPD         0    0    6    0    2    6     14
Grüne       0    0  7.5    0    3    9   19.5
FDP         0    0    0    0    6    0      6
AfD         0    0    0    0    3    0      3
Linke       0    0    6    0  6.5    6   18.5
BSW         0    0    0    0    0    0      0
Volt        0    0    0    0  5.6    0    5.6
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01 (Diamorphin-Substitution ausbauen, Zugang zu Psychotherapie) passt zum vorhandenen Landesinstrument 8322 (Konsumräume, Streetwork, Substitution, kürzere Wartezeiten): gleicher Lösungsweg (Ausbau von Substitution und Behandlungszugang), gleiche Ebene. Die Werte von 8322 (Wirksamkeit 2, Umsetzbarkeit 2, belegt) passen auch für Diamorphin: Der Cochrane-Review (Ferri u. a. 2011, Zusammenfassung unter https://www.drugsandalcohol.ie/16167/ geöffnet) zeigt bessere Haltequote und weniger illegalen Konsum bei behandlungsresistenten Menschen, aber mehr schwere Nebenwirkungen und hohen Aufwand für ausgestattete Ambulanzen – das stützt Umsetzbarkeit 2. Die Quelle von 8322 (doi 10.1016/j.drugalcdep.2014.10.012) war nur als Weiterleitung erreichbar, nicht inhaltlich lesbar; der Cochrane-Review trägt den Forschungsstand für Substitution unabhängig davon.
- Ursache 3006 bestätigt (Behandlung, Regel 1). Grenzfall 3005: Diamorphin ersetzt Straßenheroin mit unbekannter Dosis durch geprüften Wirkstoff und setzt damit auch an 3005 an; 3005 stand aber weder in ursachen_ids noch in ursachen_offen. Ich nenne sie deshalb nicht, sondern nur als Hinweis: Wird 8322 bei anderen Maßnahmen (Konsumräume) mit 3005 verbunden, wäre 3005 auch hier konsequent.
- Keine Maßnahme ohne Ursache.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

Rückfragen: keine
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

