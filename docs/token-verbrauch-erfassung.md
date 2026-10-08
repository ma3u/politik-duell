# Tokenverbrauch der Erfassung (`/thema-erfassen`)

Beobachtet beim Durchgang für die Themen 27, 29, 30 und 33 (6. 10. 2026, Pull Request #76). Je Thema laufen 28 Erfassungs-Agenten (7 Parteien × Bund, BE, MV, ST) und ein Blind-Agent; zusammen rund 110 Agenten.

## Hebel, nach Wirkung geordnet

1. **Programme ohne Treffer überspringen.** Viele Programme haben in den Suchbegriffen null Treffer, vor allem Landesprogramme von AfD, FDP und Union. Ihre Agenten liefern fast immer „keine Maßnahme“. `entwurf:auftrag` könnte für solche Programme keinen Auftrag erzeugen und `keine_massnahme` mit „keine Treffer in den Suchbegriffen“ setzen. Das spart gut ein Viertel der Agenten. Risiko: Eine Maßnahme, die ohne die Suchbegriffe formuliert ist, würde übersehen. **Offen:** Reicht „keine Treffer“ als Beleg für „keine Maßnahme“? Das ist eine Methodenentscheidung (`docs/methode.md`).
2. **Kleineres Modell bei wenigen Treffern.** Alle Agenten laufen bisher auf derselben Stufe. Für Programme mit wenigen Treffern genügt vermutlich eine kleinere Stufe; bei vielen Treffern zählt die Zitattreue, dort bleibt die Stufe.
3. **Mehrere Themen in einem Auftrag je Programm.** Bei mehreren Themen liest derselbe Agent dasselbe Programm mehrfach. Ein Auftrag je Programm mit allen Themen bündelt das Lesen; dafür müssen Skript und Agent angepasst werden.
4. **Wiederholungen vermeiden.** Im Durchgang kosteten drei Fehlerbilder zusätzliche Agentenläufe:
   - Der Leitfaden hat keinen `buendel`-Schlüssel, die Agenten setzen trotzdem `buendel` (Richtungsnamen). `programm-pruefen` meldet das nur als Hinweis, `zusammenfuehren` lehnt es als Fehler ab (Thema 29).
   - `keine_massnahme` länger als 400 Zeichen. `eintragen` lehnt ab, `programm-pruefen` nicht (Thema 30, drei Programme).
   - Ein Zitat auf der angegebenen Seite nicht gefunden (Thema 29, Grüne BE).

   Abhilfe: Beide Regeln in `.claude/agents/programm-erfassung.md` aufnehmen und in `programm-pruefen` als Fehler melden. Bei Thema 33 genügte ein Zusatz im Prompt, und es gab keine Wiederholung.
5. **Kurze Ausgaben im Koordinationskontext.** Skriptausgaben mit `Select-Object -Last` und `Select-String` filtern. Die Kurzberichte der Agenten lassen sich nicht weiter kürzen, ohne die Prüfbarkeit zu verlieren.

## Reihenfolge

Größter Gewinn: Punkt 1 zusammen mit Punkt 4. Punkt 1 braucht vorher die Methodenentscheidung.

## Umgesetzt am 8. 10. 2026

Nach der Anleitung „Agentic-Init“ (Abschnitt Token discipline) und den Erfahrungen aus dem Durchgang mit gut 500 Agenten:

- **CLAUDE.md schlank:** 16 600 → 4 200 Zeichen (≈ 3 400 Tokens weniger je Sitzung und je Agent). Die volle Spezifikation steht wortgleich in `docs/projekt.md` und wird nur bei Bedarf gelesen; die Grundprinzipien bleiben in der CLAUDE.md.
- **Agenten:** `maxTurns` als Obergrenze gegen ausufernde Läufe (Erfassung 40, Einordnung 80, Bewertung 120, Recherche 100 – heute gemessen: 5–17, ≈ 38, ≤ 64); `cacheTtl: 1h` für `programm-erfassung` und `haltung-erfassung`, die je Durchgang dutzend- bis hundertfach mit gleichem Prompt starten.
- **Wiederholungen vermeiden (Punkt 4):** `programm-pruefen` meldet `keine_massnahme` über 400 Zeichen jetzt als Fehler, der Agent kürzt selbst (am 8. 10. kostete das vier Nachläufe); die Grenze steht auch in der Agentenanleitung. Bündel werden schon geprüft.
- **Haltungen:** höchstens sechs je Lauf, Nachprüfung der „keine Aussage“ (`.claude/skills/haltung-erfassen`), Suchbegriffe ohne Parteinamen (`daten:pruefen`).
- **settings.json:** `$schema` und Lesesperre für `.env`, `.env.local`, Schlüsseldateien.

Offen: RTK (komprimiert Tool-Ausgaben per PreToolUse-Hook, 60–90 % laut Hersteller) – Installation auf dem eigenen Rechner, nur mit Zustimmung der Betreiberin. Kleinere Stufe (`effort: medium`) für die Erfassung erst nach einem Vergleichslauf (gleiche Funde je Programm).
