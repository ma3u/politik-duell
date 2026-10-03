# Inhalt des Pull Requests

Vorlage: `.github/pull_request_template.md` mit der Ja/Nein-Checkliste. Die Beschreibung steht in `.cache/entwurf/<ID>/pr.md` und wird bei jedem Push aktualisiert.

## Inhalt
- Pflichtangaben
- Korrekturen der Koordination
- Offene Fragen

## Pflichtangaben

Den Datenteil schreibt `npm run entwurf:bericht` nach `pr-daten.md`: Modelle, Übersicht je Programm (erfasst → eingetragen, Rückfragen), Ohne Maßnahme je Ursache, Nicht durchsucht, Meldungen der Agenten, Treffer je Ursache, offene Hinweise, `nicht_erfasst`, Vergleich nach Rückfragen, Ohne Bündel, Blindliste (Prüfsumme, entfallene Kennungen, Teil-Neubewertung), Reste, Zuordnung, Hinweise zur Bewertung, Punkte, Anmerkungen der Bewertung, Rückfragen, Kosten. Übernimm die Datei unverändert.

Selbst schreibst du nur:
1. **Zusammenfassung** (zwei, drei Sätze: Thema, Programme, Zahl der Maßnahmen und Instrumente mit ID-Bereich).
2. **Suchbegriffe:** welche nach `entwurf:treffer --vorab` geändert oder unter `suchbegriffe_geprueft` belassen wurden (die vollständigen stehen im Leitfaden).
3. **Leitfaden und neue Bündel** mit Grund (Entscheidung der Betreiberin).
4. **Begründungen**, wo der Datenteil eine verlangt: verdächtige Reste, Programme, die bei der Zuordnung aus dem Rahmen fallen, Hinweise zur Bewertung.
5. **Archiv:** Pfad unter `daten/protokolle/<ID>/`.
6. Hinweis: Die Werte sind Entwürfe; es folgen die Bewertung durch eingeladene Prüfende und die Belegprüfung (`npm run pruefliste -- <ID>`).

## Korrekturen der Koordination

Jede Korrektur einer eigenen fehlerhaften Rückfrage: Programm, was falsch war, was korrigiert wurde, welche Kennungen danach neu bewertet wurden. Steht auch als Zeile in `protokoll/rueckfragen.md`.

## Offene Fragen

Fehlende Ursachen, die beim Erfassen aufgefallen sind (die Betreiberin entscheidet), und Abgrenzungsfragen, die der Leitfaden nicht beantwortet.
