## Daten aus den Arbeitsdateien (npm run entwurf:bericht)

**Modelle** (`protokoll/rueckfragen.md`):

- Modell der Erfassung: Claude Sonnet (Agent programm-erfassung, nur Volt-Bundesprogramm, Nachtrag 7. 10. 2026)
- Modell der Bewertung: Claude Opus (Agent blind-bewertung)

**Übersicht je Programm** (erfasst → eingetragen; Rückfragen):

| Partei | Bund |
| --- | --- |
| Volt | 2 → 2 |

**Ohne Maßnahme zu einer Ursache:** **Bund** 2701 Volt; 2702 Volt; 2703 Volt; 2706 Volt.

**Nicht durchsucht:** keins

Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF): keine

<details><summary>Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)</summary>

```
Programm        2701  2702  2703  2704  2705  2706
Volt-Bund          0     3     0     3    16     0
```

</details>

**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): keine

<details><summary>Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)</summary>

```
Volt-Bund 2701 (S. 127, 128): Keine Zusage zu Personalbemessung oder Personalausstattung; Fachkräftemangel nur als Begründung der Notfallreform.
Volt-Bund 2703 (S. 126, 127): Dokumentationsstandards (KDL, ePA) sind Datenstandards, keine Entlastung der Beschäftigten von Dokumentationsaufwand.
```

</details>

**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): keine Rückfrage, kein früherer Stand

Ohne Bündel an Ursachen mit Bündeln (0, nur zur Information – je Instrument zählt eine Maßnahme): keine

**Blindliste:** 2 Kennungen, Prüfsumme `1859c55ae445f084f769259bb12d22dbdc9fbcbdac0544c4bb8f82508078deee`. Entfallene Kennungen: keine.

**Verdächtige Reste:** keine

**Zuordnung** (`entwurf:bewertung-pruefen`):

```
Zuordnung: Volt (Bund): 2 Maßnahmen, 2 Zuordnungen (davon 1 offen); nicht bestätigt 0; offene bestätigt 1; verworfen 0
```

**Hinweise zur Bewertung:** keine

**Punkte** (`npm run punkte`):

```
Arbeitsbelastung im Gesundheitswesen – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)

Bund     2701 2702 2703 2704 2705 2706   alle
Union       4    4    4    6    3    0     21
SPD       6.8    5    4  8.8  5.5    0   30.1
Grüne       6    0    4    4    6    0     20
FDP         5    0    4    2    0    0     11
AfD         5    0    0    0    0    2      7
Linke     7.5    9    0    7    9    0   32.5
BSW         4    0    0    9    0    0     13
Volt        0    0    0    2    2    0      4

BE       2701 2702 2703 2704 2705 2706   alle
Union       4    4    4    6    2    0     20
SPD       6.8    5    4  8.8  6.7    0   31.3
Grüne       6    0    4    4    4    4     22
FDP         5    0    4    2    4    0     15
AfD         5    0    0    0    0    0      5
Linke     7.5    9    0    7    6    0   29.5
BSW         4    0    0    9    0    0     13
Volt        0    0    0    2    –    –      –

MV       2701 2702 2703 2704 2705 2706   alle
Union       4    4    4    6    0    0     18
SPD       6.8    5    4  8.8    4    0   28.6
Grüne       6    0    4    4    4    0     18
FDP         5    0    4    2    4    0     15
AfD         5    0    0    0    4    4     13
Linke     7.5    9    0    7  5.5    0     29
BSW         4    0    0    9    4    0     17
Volt        0    0    0    2    –    –      –

ST       2701 2702 2703 2704 2705 2706   alle
Union       4    4    4    6    4    0     22
SPD       6.8    5    4  8.8    4    4   32.6
Grüne       6    0    4    4  5.5    0   19.5
FDP         5    0    4    2    0    0     11
AfD         5    0    0    0    3    0      8
Linke     7.5    9    0    7  6.5    4     34
BSW         4    0    0    9    5    0     18
Volt        0    0    0    2    –    –      –
```

<details><summary>Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)</summary>

```
Hinweise:
- M01: Vorgeschlagene Ursache 2704 bestätigt (Karriereperspektiven sind Teil der Belohnungsseite im Aufwand-Belohnungs-Modell). Kein Verweis auf Instrument 8014, weil dessen Name auf die Pflege begrenzt ist und die Maßnahme Rettungsfachpersonal betrifft; die Werte entsprechen in der Umsetzbarkeit 8014, in der Wirksamkeit liegen sie niedriger (1 statt 2), weil nur ausgewählte Studien- und Weiterbildungsangebote ohne neue Rollen oder Befugnisse genannt sind. Falls die Koordination 8014 als gleichen Lösungsweg sieht, wäre auch ein Verweis vertretbar. Die geöffnete WHO-Quelle zu 8014 (State of the World's Nursing 2020) bezieht sich auf die Pflege; stattdessen dient eine deutsche Befragung von Rettungskräften als Beleg. Sie belegt den Zusammenhang, nicht die Wirkung der Maßnahme, deshalb "offen".
- M02: Offene Ursache 2705 aufgenommen, und zwar ausdrücklich mit Wirksamkeit 1, analog zur Pflegekammer (8018, 8058): Mitsprache über die berufliche Selbstvertretung auf Systemebene, nicht am Arbeitsplatz. Diese Einstufung fiel schwer. Wer 2705 eng als Mitsprache "am Arbeitsplatz" liest, käme auf ursachen []. Zum Einwand gegen die Legitimation eines Stimmrechts: https://www.aerzteblatt.de/themen/g-ba/streit-um-stimmrecht-fuer-die-pflege-im-g-ba-6528402e-693e-4819-90d6-02dd652ea2c1
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

