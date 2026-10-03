# Windows und PowerShell 7

- **Optionen mit Wert:** npm verschluckt sie, wenn das erste `--` nicht in Anführungszeichen steht (`--partei SPD` wird dann zum Suchbegriff „SPD“). Schreibe `npm run <skript> '--' <Argumente> '--option' wert` – so stehen alle Befehle in `SKILL.md`.
- **Direkt aufrufen** geht immer: `node --experimental-strip-types --no-warnings scripts/entwurf/<name>.ts …` (Name ohne `entwurf:`, z. B. `bewertung-auftrag.ts`).
- **Keine Umleitung mit `>`:** Sie kann die Kodierung zerstören. Die Skripte schreiben ihre Dateien selbst (`blind.json`, `bewertung-auftrag.txt`) oder nehmen einen Zielpfad (`entwurf:json <antwort> <ziel>`).
- **Fremde Dateien im Projektstamm** (etwa `1-6`, `Kita`) sind Reste verschluckter Optionen: löschen, nie committen.
- **`npm test` scheitert an CRLF** bei `01-arzttermine.json` und `seed.sql`: hat mit der Erfassung nichts zu tun (siehe `.gitattributes`).
- **Pfade** immer mit `/`, auch unter Windows. Der Hook für den Bewertungs-Agenten vergleicht Pfade ohne Rücksicht auf Groß- und Kleinschreibung.
