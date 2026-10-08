## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 3 → 3 | 2 → 2 | 5 → 5 |

**Ohne Maßnahme zu einer Ursache:** **BE** 1202 Volt; 1203 Volt. **MV** 1203 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1201  1202  1203  1204
Volt-BE            –    28    11    25
Volt-MV            –    30     3    19
Volt-ST            –   123    17    35
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 1202 (S. 33, 34, 4): Keine Zusage zu Finanzierung oder Sanierung von Straßen und Brücken; Mittel aus der City-Maut gehen in ÖPNV, Rad- und Fußwege.
Volt-BE 1203 (S. 34, 59, 15): Baustellenregeln (Vertragsstrafen, Sondernutzungsgebühren) betreffen Baufirmen, nicht Personal oder Genehmigung und Vergabe der Verwaltung; Vergabegesetz S. 59 bezieht sich auf Innovationskriterien.
Volt-MV 1203 (S. 37, 38, 60): Genehmigungsbeschleunigung betrifft Energie (S. 38) und Wohnungsbau (S. 60), nicht Straßen und Verkehrswege; kein Personal in Bauverwaltungen.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 10 Kennungen, Prüfsumme `9463e6cf08780a429c6339fc6c1e14c3d5acab1e462a4f9f90f6f54d430a86ec`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 3 Maßnahmen, 3 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (MV): 2 Maßnahmen, 2 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 5 Maßnahmen, 5 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Straßen und Brücken – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1201 1202 1203 1204   alle
Union       9    0    6    4     19
SPD         9    2    7  5.5   23.5
Grüne       9    2    0    8     19
FDP         8    0  7.5    0   15.5
AfD         9    0    6    0     15
Linke       7    2    0    8     17
BSW         8    5    0    0     13
Volt      6.5    1    2    9   18.5

BE       1201 1202 1203 1204   alle
Union       9    6    0    6     21
SPD         9    6    0    9     24
Grüne       9    0    0    9     18
FDP         8    0    0    6     14
AfD         9    6    0    6     21
Linke       7    6    4    9     26
BSW         8    6    0    6     20
Volt      6.5    0    0    9   15.5

MV       1201 1202 1203 1204   alle
Union       9    2    8    6     25
SPD         9    6    6    9     30
Grüne       9    0    0    6     15
FDP         8    7    6    6     27
AfD         9    6    6    6     27
Linke       7    2    0    6     15
BSW         8    6    6    6     26
Volt      6.5    2    0    6   14.5

ST       1201 1202 1203 1204   alle
Union       9    6    6  7.5   28.5
SPD         9    6    0  7.5   22.5
Grüne       9    7    0    6     22
FDP         8    6    6    6     26
AfD         9    6    6    9     30
Linke       7    6    0    9     22
BSW         8    2    6    6     22
Volt      6.5    2    6    9   23.5
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle vorgeschlagenen Ursachen bestätigt; keine offenen Ursachen in der Liste; keine Maßnahme ohne Ursache.
- M01 und M09 bekommen ein neues Landes-Instrument (Unfallschwerpunkte, Kreuzungen), weil kein vorhandenes Instrument diesen Lösungsweg abdeckt. Forschungsstand gemischt: Elvik (1997) zeigt, dass Wirkungen von Black-Spot-Programmen bei Kontrolle von Regression zur Mitte und Unfallverlagerung schrumpfen; positive Auswertungen (z. B. Flandern) konnten nicht geöffnet werden.
- M06 einzeln statt 7065: Inhaltlich gleicher Weg (Tempo 30), aber „flächendeckend als Standard innerorts“ kann ein Land nicht selbst regeln (StVO ist Bundesrecht, Novelle 2024 erweitert nur Einzelanordnungen) – daher Umsetzbarkeit 2 statt 3. Wirksamkeit trotz „belegt“ bei 2 wie 7065, da Landstraßen und Hauptachsen unberührt bleiben.
- M10 (Konnexität, Ausgleich neuer Pflichten) zu 7061 gestellt: verhindert eher, dass sich die Lage verschlechtert, als dass es neuen Spielraum schafft; Grenzfall zwischen 7061 und Einzelbewertung mit Wirksamkeit 1.
- M02 zu 7066: Cochrane-Review (Duperrex u. a.) zeigt bessere Kenntnisse und Verhalten bei Kindern, aber keine Belege für weniger Unfälle; zudem richtet sich die Maßnahme an Schulkinder, während die Ursache vor allem Ältere auf Pedelecs nennt.
- Geöffnete Quellen ohne Übernahme als Beleg: Teschke u. a. 2012 (AJPH, über ScienceDaily) bestätigt 7064 (getrennte Radwege ca. ein Zehntel des Risikos); KfW-Kommunalpanel 2025 (Pressemitteilung) bestätigt 7061/7062 (53,4 Mrd. Euro Rückstand Straßen, Hemmnisse vor allem Personal und Verfahren).
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

