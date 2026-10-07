## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 1 → 1 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 1001 Volt; 1002 Volt; 1003 Volt; 1005 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        1001  1002  1003  1004  1005
Volt-Bund         16     0    36     0     0
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 1001 (S. 51, 88, 89, 109, 128, 129): Treffer betreffen Mindestlohn, Erzieherberufe, Heilberufe und allgemeine Anerkennung von Abschlüssen; keine Zusage für Pflegekräfte.
Volt-Bund 1003 (S. 123, 129, 130, 131): Prävention nur allgemein (Klima, Bewegung, Ernährung, Sucht); kein Bezug zu Pflegebedürftigkeit oder Pflege.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 1 Kennungen, Prüfsumme `a822313748cc6a3e315fc2dd5d2e3cae366f38eec950174deb2da4ab256ea314`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 1 Maßnahmen, 1 Zuordnungen (davon 0 offen); nicht bestätigt 0; offene bestätigt 0; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Pflege – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    2   23.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    2   19.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    0      4

BE       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    0   21.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    4     13
Linke     7.4    5    0    5    4   21.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    –      –

MV       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    3   21.8
SPD       7.6    5    3    6    0   21.6
Grüne     7.1    2    3    9    0   21.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    3   20.4
BSW       5.5    3    0    1    4   13.5
Volt        0    0    0    4    –      –

ST       1001 1002 1003 1004 1005   alle
Union     6.8    3    3    6    0   18.8
SPD       7.6    5    3    6    3   24.6
Grüne     7.1    2    3    9    4   25.1
FDP       6.8    3    2    4    0   15.8
AfD         4    0    0    5    0      9
Linke     7.4    5    0    5    4   21.4
BSW       5.5    3    0    1    0    9.5
Volt        0    0    0    4    –      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01 (Betreuungsangebot für Pflegebedürftige deutlich ausbauen, Bund) entspricht dem vorhandenen Instrument 6228 (Tages-, Nacht- und Kurzzeitpflege sowie Beratung ausbauen, Bund): gleicher Lösungsweg, gleiche Ebene, ebenfalls ohne konkreten Zielwert. Daher Verweis statt neuer Bewertung.
- Ursache 1004 bestätigt; keine offenen Ursachen vorgelegt. 1001 (Pflegekräftemangel) nicht genannt, weil der Text nur den Ausbau der Angebote zusagt, nicht mehr Personal.
- Recherche: Die VdK-Pflegestudie (Hochschule Osnabrück, rund 56.000 Befragte, berichtet im Ärzteblatt) zeigt einen großen Wunsch nach Kurzzeit-, Verhinderungs- und Tagespflege bei geringer Nutzung; 49 % nennen zu wenige Tagespflegeplätze, 56 % zu wenige Kurzzeitpflegeplätze. Das stützt die Einstufung von 6228 (Wirksamkeit 2, gemischt): Mehr Plätze setzen an der Ursache an, Zuzahlungen, Antragsverfahren und fehlendes Personal bremsen aber ebenfalls. Quelle: https://www.aerzteblatt.de/news/haeusliche-pflege-ueberlastet-viele-angehoerige-93432955-5f54-4439-8f71-015b647c7308 – 6228 hat bisher keine beleg_studie_url; die Koordination könnte diese ergänzen.
- Leicht schwierig: Der Satz zur „unbezahlten Sorgearbeit“ klingt wie ein Ziel, die Zusage „deutlich ausbauen“ ist aber eine konkrete Maßnahme, deshalb zugeordnet.
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

