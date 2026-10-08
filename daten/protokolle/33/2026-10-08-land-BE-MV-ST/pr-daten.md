## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | BE | MV | ST |
| --- | --- | --- | --- |
| Volt | 1 → 1 | 1 → 1 | 1 → 1 |

**Ohne Maßnahme zu einer Ursache:** **BE** 3302 Volt. **MV** 3302 Volt. **ST** 3302 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        3301  3302  3303
Volt-BE            –     0     1
Volt-MV            –     0     6
Volt-ST            –     0    13
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-BE 3302 (S. 37, 48): Keine Zusage zu Nutzungszeiten, Schlaf oder Handyregeln im Programm gefunden; Suchbegriffe ohne Treffer.
Volt-MV 3302 (S. 7, 8): Keine Aussagen zu Nutzungszeiten, Schlaf oder Handyregeln im Programm.
Volt-ST 3302 (S. 153): Keine Zusage zu Nutzungszeiten, Schlaf oder Handyregeln im Programm; Suchbegriffe ohne Treffer.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 3 Kennungen, Prüfsumme `23ea3779fcb8365c7c5ac0b116df299ae09666a4058301c8c216195b556b0f09`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (BE): 1 Maßnahmen, 1 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
Zuordnung: Volt (MV): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
Zuordnung: Volt (ST): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Mediennutzung von Kindern und Jugendlichen – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     3301 3302 3303   alle
Union       3    0    0      3
SPD       2.5    0    0    2.5
Grüne       3    0  2.5    5.5
FDP         0    0    1      1
AfD         0    0    0      0
Linke       3    0    2      5
BSW         2    1    0      3
Volt        4    0    4      8

BE       3301 3302 3303   alle
Union       3    0  4.5    7.5
SPD       2.5    3    3    8.5
Grüne       3    3  8.3   14.3
FDP         0    0  8.3    8.3
AfD         0    3    0      3
Linke       3    6    9     18
BSW         2  4.5    3    9.5
Volt        4    0    3      7

MV       3301 3302 3303   alle
Union       3    6    6     15
SPD       2.5    0    3    5.5
Grüne       3    0    3      6
FDP         0    0  4.5    4.5
AfD         0    6    0      6
Linke       3    0  4.5    7.5
BSW         2    0  7.5    9.5
Volt        4    0    3      7

ST       3301 3302 3303   alle
Union       3    0    3      6
SPD       2.5    0    3    5.5
Grüne       3    0    4      7
FDP         0    0    6      6
AfD         0    6    0      6
Linke       3    0    3      6
BSW         2    6    0      8
Volt        4    0    3      7
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- Alle drei Maßnahmen (Land) schlagen denselben Lösungsweg vor: Medienbildung/Medienkompetenz fest im Unterricht verankern. Sie verweisen daher auf das vorhandene Instrument 8389 „Medienbildung in Schule und außerschulischen Angeboten stärken (Land)“. Die dort hinterlegte Quelle (Metaanalyse, 34 Studien, Europe PMC 40549948) habe ich über die Europe-PMC-Schnittstelle geöffnet (die Artikelseite selbst lieferte 403): problematische Nutzung deutlich gesenkt (d = 1,47 bzw. 1,13), Bildschirmzeit kaum (d = 0,15), Publikationsverzerrung möglich – der Forschungsstand „gemischt“ trägt.
- Ursachen: M01 und M03 bestätige ich mit 3303 (Regel 1: Medienbildung gehört zu 3303). Die offene Ursache 3303 bei M02 übernehme ich nach derselben Regel und gleichem Maßstab wie M01/M03. 3301 (Plattformpflichten, Belohnungsdesign) nenne ich nicht, obwohl M01/M02 Plattformlogiken bzw. Algorithmusverständnis erwähnen: Die Maßnahmen ändern nichts an den Plattformen, sondern vermitteln Wissen. Die Teile zu Demokratiebildung, Desinformation und extremistischen Inhalten gehören zu anderen Themen (Regel 2).
- Keine Maßnahme ohne Ursache.
- Schwierig: ob reine schulische Medienbildung überhaupt an 3303 (Begleitung durch Eltern) ansetzt – die Regel ordnet sie dort zu, die Wirkung auf Eltern ist aber nur indirekt; das spiegelt die niedrige Wirksamkeit (1) des Instruments.
```

</details>

<details><summary>Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)</summary>

```
Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, Volt-Landesprogramme ST, MV, BE, Nachtrag 8. 10. 2026)
Modell der Bewertung: Claude Opus (Agent blind-bewertung)

| Programm | Anlass | Ergebnis |
| --- | --- | --- |
| Volt-MV | zusammenfuehren: Maßnahme 1 mit Bündel, das im Leitfaden nicht bei ihrer Ursache steht | Bündelangabe entfernt, Datei neu geprüft |
```

</details>

Kosten je Agent (protokoll/kosten.md): keine

