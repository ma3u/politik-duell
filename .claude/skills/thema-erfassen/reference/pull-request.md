# Inhalt des Pull Requests

Vorlage: `.github/pull_request_template.md` mit der Ja/Nein-Checkliste. Die Beschreibung steht in `.cache/entwurf/<ID>/pr.md` und wird bei jedem Push aktualisiert.

## Inhalt
- Pflichtangaben
- Korrekturen der Koordination
- Offene Fragen

## Pflichtangaben

1. **Modelle** von Koordination, Erfassung und Bewertung (wie in `protokoll/rueckfragen.md`).
2. **Übersicht je Partei:** Zahl der Maßnahmen oder „keine Maßnahme“, Zahl der Rückfragen.
3. **Leitfaden und neue Bündel** (Entscheidung der Betreiberin), jeweils mit Grund.
4. **Suchbegriffe:** Ausgabe von `entwurf:treffer --vorab` und welche Begriffe wie genauer gefasst wurden; verbleibende allgemeine Begriffe mit Grund.
5. **Treffermatrix** je Ursache und Richtung (Summen je Programm) mit den Hinweisen und wie sie erledigt wurden.
6. **Vergleich nach Rückfragen:** die Zeilen von `entwurf:zusammenfuehren` (entfallen, zusammengefasst, Ursache ohne Maßnahme) und warum jede in Ordnung ist.
7. **Kennungen:** Prüfsumme der Blindliste; neue und entfallene Kennungen seit dem ersten Lauf; bei Teil-Neubewertung die neu bewerteten Kennungen.
8. **Verdächtige Reste** mit Begründung.
9. **Zuordnung:** die Zeilen `Zuordnung: …` aus `entwurf:bewertung-pruefen`; Programme, die aus dem Rahmen fallen.
10. **Punkte:** Ausgabe von `npm run punkte -- <ID>`.
11. **Nicht durchsucht:** Programme und Grund (bleiben „noch nicht erfasst“); Seiten ohne Text.
12. **Schwierige Einstufungen** aus der Bewertung (Text unter dem JSON in `bewertung-antwort.txt`).
13. Hinweis: Die Werte sind Entwürfe; es folgen die Bewertung durch eingeladene Prüfende und die Belegprüfung (`npm run pruefliste -- <ID>`).

## Korrekturen der Koordination

Jede Korrektur einer eigenen fehlerhaften Rückfrage: Programm, was falsch war, was korrigiert wurde, welche Kennungen danach neu bewertet wurden. Steht auch als Zeile in `protokoll/rueckfragen.md`.

## Offene Fragen

Fehlende Ursachen, die beim Erfassen aufgefallen sind (die Betreiberin entscheidet), und Abgrenzungsfragen, die der Leitfaden nicht beantwortet.
