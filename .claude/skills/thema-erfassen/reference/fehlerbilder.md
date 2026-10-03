# Fehlerbilder

Meldungen der Skripte, ihre übliche Ursache und was zu tun ist. Die Meldungen sind gekürzt.

## Inhalt
- Erfassung (`entwurf:programm-pruefen`, `entwurf:zusammenfuehren`)
- Kennungen und Blindliste (`entwurf:blind`, `entwurf:bewertung-auftrag`)
- Bewertung (`entwurf:json`, `entwurf:bewertung-pruefen`, `entwurf:bewertung-zusammenfuehren`)
- Eintragen und Prüfen (`entwurf:eintragen`, `zitate:pruefen`, `punkte`)

## Erfassung

| Meldung | Ursache | Tun |
| --- | --- | --- |
| `Bündel „…“ schon bei Maßnahme N` | Zwei Maßnahmen im selben Bündel | Gleichartig: nur die konkreteste Stelle. Verschieden: ohne `buendel` oder `neue_buendel`. **Nie zusammenfassen.** Der Agent entscheidet das selbst; eine Rückfrage nennt nur die Regel. |
| `Bündel „…“ steht im Leitfaden nicht` (Hinweis) | Agent meldet ein neues Instrument | Leitfaden ergänzen (gilt für alle) oder vorhandenes Bündel nennen, wenn die Zusage gleichartig ist. |
| `Zitat steht nicht auf S. N` | Seitenmarke verwechselt | Agent korrigiert selbst (Prüfung läuft erneut). |
| `Zahl … steht in der Beschreibung, aber nicht im Zitat` | Beschreibung erfindet oder ergänzt | Beschreibung nur aus dem Zitat. |
| `zusammengefasst? … fehlt, … ist neu oder geändert` | Rückfrage hat zwei Zusagen vereint | Prüfen; war es nicht das Ziel: „Korrektur einer fehlerhaften Rückfrage“ in `SKILL.md`. |
| `Ursache N hatte … Maßnahme(n), jetzt keine` | Rückfrage oder Regel hat die letzte Maßnahme entfernt | Ist das begründet (Protokoll)? Sonst Korrektur. |
| `ganz entfallen` | `programme/<Name>.json` fehlt oder `nicht_durchsucht` | Datei prüfen; nicht durchsucht bleibt „noch nicht erfasst“. |
| `Pflichtursache N (… Treffer) ohne Maßnahme: in „nicht_erfasst“ …` | Agent hat gelesene Seiten nicht angegeben | Agent ergänzt `nicht_erfasst` selbst und prüft erneut – keine Rückfrage nötig. |
| `nicht_erfasst N: keine der genannten Seiten hat einen Treffer` (Hinweis) | Seiten passen nicht zu den Fundstellen | Agent prüft die Seiten; Kapitel ohne Suchtreffer dürfen genannt sein. |

## Kennungen und Blindliste

| Meldung | Ursache | Tun |
| --- | --- | --- |
| `Kennungen: … neu …, … entfallen` | Erfassung seit dem letzten Lauf geändert | Jede Zeile muss zu einer Rückfrage oder Korrektur passen. Neue Kennungen verraten der Bewertung, dass sie später kamen, nicht woher. |
| `kennungen.json nicht lesbar` | Datei beschädigt | `'--neue-kennungen'`; frühere Bewertung ungültig. Nicht von Hand reparieren. |
| `… Maßnahmen mit Wörtern, die auf eine Partei hindeuten` | Parteisprache in Beschreibungen | Beschreibung neutral; sonst `'--schwelle' N` und Begründung im Pull Request. |
| `blind.json passt nicht zur aktuellen Erfassung` | Nach `entwurf:blind` etwas geändert | `entwurf:blind` erneut. |
| `Rückfrage nennt eine Partei …` / `… ein Land …` | Rückfrage an die Bewertung verrät Herkunft | Neutral formulieren, nur Kennungen und Fehler nennen. |
| `Teil-Neubewertung nicht zulässig` | Leitfaden, Ursachen oder vorhandene Instrumente geändert | Vollständig neu bewerten. |

## Bewertung

| Meldung | Ursache | Tun |
| --- | --- | --- |
| `Kein gültiges JSON: … Zeile Z, Spalte S` | Agent hat das JSON beschädigt (sollte seine Selbstprüfung abfangen) | Rückfrage mit Zeile, Spalte und Meldung (`'--rueckfrage'`) an denselben Agenten. Nicht selbst reparieren – die Antwortdatei bleibt wörtlich. |
| Agent meldet, `entwurf:antwort-pruefen` sei gesperrt | Hook erkennt den Befehl nicht (anders geschrieben) | Genau `npm run -s entwurf:antwort-pruefen -- <ID>`; sonst prüft die Koordination wie bisher und fragt nach. |
| `blind_pruefsumme passt nicht` | Bewertung gehört zu einer älteren Liste | Neuer Auftrag mit der aktuellen Liste. |
| `Mn: nicht bewertet` / `mehrfach zugeordnet` | Kennung fehlt oder doppelt | Rückfrage mit den Kennungen. |
| `Instrument …: Maßnahmen aus Bund und Land` | Ebenen gemischt | Rückfrage: je Ebene ein Instrument. |
| `unverändert, aber anders bewertet als bisher` | Teil-Neubewertung ändert Bisheriges | Rückfrage oder vollständige Neubewertung, wenn der Agent Bisheriges für falsch hält. |

## Eintragen und Prüfen

| Meldung | Ursache | Tun |
| --- | --- | --- |
| `protokoll/… fehlt` | Protokolldatei fehlt | Nachtragen (Antworten schreiben die Agenten selbst, Aufträge die Skripte). |
| `bewertung-auftrag.txt nennt nicht die Prüfsumme` | Auftrag gehört zu einer anderen Liste | `entwurf:bewertung-auftrag` neu, Bewertung neu. |
| `zitate:pruefen`: Zitat nicht gefunden | Zitat nach der Prüfung verändert | Rückfrage an den Agenten, nicht passend machen. |
| `zitate:pruefen`: Warnung zu Auslassungen („…“, sehr kurze Teile) | Zitat lässt viel aus, ist aber auf der Seite | Keine Rückfrage; die Zahl der Warnungen in den Pull Request (Belegprüfung sieht sie an). |
| `Treffer: Programm nicht geladen` bei `zitate:pruefen` für ein Programm außerhalb des Durchgangs | z. B. BSW-Bundesprogramm nicht erreichbar | Für diesen Durchgang ohne Belang; im Pull Request nennen. |
| `punkte`: Partei überall 0 | Erfassung lückenhaft oder Programm hat nichts | Vergleich in `staende/` und Protokoll lesen; bei Lücke Rückfrage oder Korrektur. |
