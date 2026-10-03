# Evaluationen für `/thema-erfassen`

Szenarien im Format der Skill-Best-Practices (`skills`, `query`, `files`, `expected_behavior`). Sie stammen aus echten Fehlern beim Erfassen von Thema 9 (Sicherheit; Bundes- und Landesdurchgang). Jedes Szenario ist zusätzlich als automatischer Test umgesetzt (`scripts/entwurf.test.ts` → „Evaluationen des Skills“, dort wird auch das Format dieser Dateien geprüft). Das Verhalten der Koordination selbst (`expected_behavior`) lässt sich nur in einem Durchlauf beobachten; die Tests sichern die Skripte, auf die sich dieses Verhalten stützt.

| Datei | Szenario | Automatisch geprüft |
| --- | --- | --- |
| [a-buendel-belegt.json](a-buendel-belegt.json) | Bündel belegt, zweite *verschiedene* Zusage → nicht zusammenfassen | Fehlermeldung von `entwurf:programm-pruefen`, Liste „ohne Bündel“, Vergleich meldet „zusammengefasst?“ |
| [b-kennungen-stabil.json](b-kennungen-stabil.json) | Maßnahme nach Rückfrage eingefügt → Kennungen stabil, Meldung neu/entfallen | eine neue Kennung, alte Bewertung passt nicht mehr, Teil-Neubewertung nur für die neue |
| [c-programm-nicht-erreichbar.json](c-programm-nicht-erreichbar.json) | Programm online nicht erreichbar → lokale Kopie mit Prüfsumme, sonst „noch nicht erfasst“ | kein Abdeckungseintrag, lokale Kopie nur über die Prüfsumme |
| [d-parteiname-im-zitat.json](d-parteiname-im-zitat.json) | Rest eines Parteinamens im Zitat → Meldung, Begründung im Pull Request | Rest gemeldet, Zitat wörtlich, Parteiname in Rückfrage erkannt; Hook-Tests in `scripts/sperre.test.ts` |
| [e-pflichtursache-begruendet.json](e-pflichtursache-begruendet.json) | Pflichtursache ohne Maßnahme und ohne gelesene Seiten → Agent ergänzt `nicht_erfasst`, keine Rückfrage | Format, Hinweis erledigt, Kurzbericht |
| [f-formfehler-bewertung.json](f-formfehler-bewertung.json) | Formfehler der Bewertung → Rückfrage an denselben Agenten, Selbstprüfung | `pruefeAntwort` = `pruefeBewertung`, Skript mit Zeile/Spalte, Hook erlaubt nur den Prüfbefehl |

## Vergleichstest: kleinste Modellstufe bei der Erfassung

**Frage:** Erkennt die kleinste Stufe der Modellfamilie (in Claude Code: `model: haiku`) Zusagen und Zitate so verlässlich, dass `programm-erfassung` mit ihr laufen kann?

**Aufbau (3. 10. 2026):** Bundesprogramm der FDP, Thema 9, Suchbegriffe aus `docs/perspektiven-ursachen.md` („Erfassung“), Leitfaden `daten/leitfaeden/9.json`, Auftrag mit `auftragText` wie bei `entwurf:auftrag` (Arbeitsordner `.cache/vergleich/9/`, nicht im Repository). Ein Agent `programm-erfassung` mit `model: haiku`, Auftrag wie im Skill. Vergleich mit den 11 Maßnahmen in `daten/themen/09-sicherheit.json` (Erfassung mit der mittleren Stufe, nach der Bewertung ohne Parteinamen).

**Ergebnis:** 20 Maßnahmen, alle Zitate bestanden `entwurf:programm-pruefen` (wörtlich, richtige Seite).

| | Anzahl | Einzelheiten |
| --- | --- | --- |
| Gleiche Stelle wie die vorhandene Erfassung | 6 von 11 | Europol (S. 22), Geldwäsche/Einziehung, Strafgesetzbuch (S. 23), islamistische Influencer (S. 26), Frauenhäuser (S. 29); Quick Freeze mit einem anderen Satz derselben Seite |
| Ähnlich, andere Stelle | 2 | Videoüberwachung (S. 24) statt der Ablehnung flächendeckender Überwachung; Organisationsverbote S. 26 statt S. 51 |
| Fehlt | 3 | Rechtsgrundlagen der Nachrichtendienste (S. 22), Digitalisierung der Gerichte (S. 23, stattdessen Aufzeichnung von Verhandlungen), Schutz gefährdeter Gruppen (S. 26) |
| Zusätzlich, gegen den Leitfaden | 7 | sechs Maßnahmen zu Asyl, Grenze, Sprachkursen und Einbürgerung aus dem Migrationskapitel (S. 28–29) ohne Straftaten- oder Sicherheitsbezug (Regel 8: nur „wenn Zitat oder Abschnitt Straftaten oder Sicherheit nennt“); ein Prüfauftrag („Islamverbände einer kritischen Prüfung unterziehen“, S. 25) |
| Zusätzlich, vertretbar | 4 | Imam-Ausbildung, Evaluation von Präventionsprogrammen, Arbeitsdefinition Antisemitismus, Abschiebungen beim Bund bündeln |
| Kurzbericht | – | Der feste Block war korrekt; der Agent hängte aber eine frei formulierte Zusammenfassung an |

**Schluss:** Zitate und Seiten erkennt die kleinste Stufe verlässlich (die Selbstprüfung erzwingt das ohnehin). Zusagen und Leitfaden-Regeln nicht: Rund ein Drittel der Maßnahmen widerspricht dem Leitfaden oder ist ein Prüfauftrag, drei Zusagen fehlen. Das würde Rückfragen und Bewertung belasten und Programme ungleich behandeln, wenn nicht alle mit derselben Stufe laufen. **Der Skill bleibt unverändert:** Erfassung mit der nächstkleineren Stufe (mittlere), die kleinste nicht. Ein neuer Vergleichstest lohnt sich mit einer neuen Modellgeneration.
