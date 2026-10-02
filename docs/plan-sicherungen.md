# Plan: Sicherungen für den Aufbau des Datenkatalogs

Stand: 1. 10. 2026. Grundlage ist eine Prüfung der Werkzeuge für neue Themen (`/thema-anlegen`, `/thema-erfassen`, die drei Agenten und die Skripte in `scripts/entwurf/`). Die Prüfung hat gefragt, ob jede Sicherung, die ein Skill oder Dokument behauptet, auch im Code steht.

Kurzfassung des Befunds: Die Rechenregeln sind gut abgesichert (Punkte, Ebenen, „noch nicht erfasst“, Wortlaut der Zitate, Kennzeichnung als KI-Entwurf). Die Stellen, an denen sich die Neutralität entscheidet – Zuschnitt von Ursachen und Ziel, gleich gründliche Suche, Blindheit der Bewertung –, schützen dagegen meist nur Anweisungstexte. Dazu kommt eine Lücke, durch die fehlende Daten schon heute einen Punkt kosten können (K1).

Die Kennungen (K1, W3 …) folgen dem Prüfbericht.

## Grundsätze für die Umsetzung

- **Erst technisch, dann Text.** Was für die Neutralität zwingend ist, prüft ein Skript oder die CI. Anweisungen in Skills sind Ergänzung, nicht Sicherung.
- **Spurbar statt unmöglich.** Wo sich ein Eingriff nicht verhindern lässt (der Koordinator kennt die Parteien), muss er Spuren hinterlassen, die im Pull Request sichtbar sind.
- **Fehlende Daten kosten keinen Punkt** – auch nicht für einzelne Ursachen.
- **Keine Wertänderung ohne Kennzeichnung.** Werte, die nicht aus der Blindbewertung stammen, sind als solche erkennbar.

## Paket 1 – vor dem nächsten Thema

| Nr. | Was | Dateien | Fertig, wenn |
| --- | --- | --- | --- |
| 1.1 (K1) | **Abdeckung je Ursache.** Abdeckungseinträge nennen in `durchsucht_fuer`, für welche Ursachen das Programm durchsucht wurde. Fehlt eine Ursache darin, gilt sie für die Partei als „noch nicht erfasst“ und die Runde wird nicht gewertet. `entwurf:eintragen` setzt das Feld. Kommt in einem Pull Request eine Ursache zu einem Thema mit Abdeckung hinzu, muss jeder aktuelle Eintrag `durchsucht_fuer` ausdrücklich angeben. Ohne das Feld (ältere Einträge) gilt das Programm wie bisher für alle Ursachen als durchsucht. | `src/data/katalog.ts`, `supabase/functions/_shared/{typen,bewertung}.ts`, `scripts/entwurf.ts`, `scripts/seed-sql.ts`, `scripts/stand-vergleich.ts`, `scripts/daten-id.ts`, neue Migration | Test: Partei mit altem Eintrag und neuer Ursache → „noch nicht erfasst“; CI meldet neue Ursache ohne `durchsucht_fuer` |
| 1.2 (W6) | **Rolle hebt nicht über 2 ohne belegte Wirkung.** Der Rollen-Modifikator kann die Wirksamkeit bei `gemischt` oder `offen` höchstens auf 2 heben; die Datenprüfung warnt bei solchen Modifikatoren. | `bewertung.ts`, `katalog.ts`, `docs/methode.md`, `src/rechtliches/Methode.tsx` | Test; die sechs Fälle in Miete zählen für Mieter mit Wirksamkeit 2 |
| 1.3 (K3) | **Ziel gehört zur Freigabe.** `ursachen:freigegeben` vergleicht auch `ziel` mit dem Zielzweig. | `scripts/entwurf.ts` | Test |
| 1.4 (K4) | **Spuren für den Koordinator.** (a) Die Blindliste trägt eine Prüfsumme über ihren ganzen Inhalt; die Bewertung muss sie als `blind_pruefsumme` zurückgeben, sonst lehnen `entwurf:bewertung-pruefen` und `entwurf:eintragen` ab – geänderte Texte nach der Bewertung fallen so auf. (b) `entwurf:eintragen` verlangt den Ordner `protokoll/` mit der Rohantwort jedes Erfassungs-Agenten, dem Auftrag und der Antwort des Bewertungs-Agenten und einer Liste der Rückfragen; der Auftrag darf keine Parteinamen enthalten. (c) Feld `entwurf_herkunft` (`blind` / `nicht_blind`) an Instrumenten und einzeln bewerteten Maßnahmen; die CI lehnt geänderte Werte einer Blindbewertung ab, solange das Feld nicht auf `nicht_blind` steht. | `scripts/entwurf.ts`, `scripts/entwurf/*.ts`, `scripts/stand-vergleich.ts`, `katalog.ts`, Skill und Agent | Tests; Kita-Instrumente gekennzeichnet (7289 und 7305 `nicht_blind`) |
| 1.5 (W4) | **Richtige Programmfassung beim Erfassen.** `programme:texte`, `programme:suche` und `programm:text` brechen für ein Programm ab, dessen Datei von der Prüfsumme in `parteien.json` abweicht. `programme:texte` nennt Seiten fast ohne Text (Bilder, Scans). | `scripts/programme.ts`, `scripts/entwurf/programme-{texte,suche}.ts`, `programm-text.ts` | Test für die Erkennung; Ausgabe zeigt Leerseiten |
| 1.6 (W7) | **Wirksamkeit 3 nur mit Studienlink.** Bei neuen Bewertungen Fehler, im Katalog Warnung (fünf ältere Fälle). | `scripts/entwurf.ts`, `katalog.ts` | Test |

Dokumentation zu Paket 1: `daten/README.md` (Format, „Mit KI-Agenten“, „Was die automatische Prüfung kontrolliert“), `.claude/skills/thema-erfassen/SKILL.md`, `.claude/agents/blind-bewertung.md`, `.claude/agents/programm-erfassung.md`, `supabase/EINRICHTEN.md` (neue Migration).

## Paket 2 – vor der ersten öffentlichen Wertung

| Nr. | Was | Fertig, wenn |
| --- | --- | --- |
| 2.1 (K2) | **Suchbegriffe je Lösungsrichtung.** Format `suchbegriffe: {Ursache: {Richtung: [...]}}`, abgeleitet aus der Spalte „Diagnose aus der Debatte“; `entwurf:blind` lehnt Richtungen ohne Begriffe ab. Neues Skript zählt alle Begriffe in allen Programmen (Treffermatrix) und schreibt sie in die Erfassung; Warnung bei vielen Treffern ohne Maßnahme. Synonyme eines Agenten werden in allen Programmen nachgesucht. | Kita-Erfassung ließe sich damit nachvollziehen |
| 2.2 (W1) | **Blindliste neutralisieren.** „Wir/Das/Die [Partei]“ ganz neutralisieren, Länder, Hauptstädte, „Senat“, „Abgeordnetenhaus“ → „[Land]“, Namensliste ohne Groß-/Kleinschreibung bei Mehrwortnamen, weitere Namen. `entwurf:blind` gibt verdächtige Reste aus und bricht über einer Schwelle ab. | Restliste über den ganzen Katalog leer oder begründet |
| 2.3 (W2) | **Zuordnung zu Ursachen blind bestätigen.** Der Bewertungs-Agent bestätigt jedes Paar (Maßnahme, Ursache); unbestätigte Paare lehnt `entwurf:bewertung-pruefen` ab. Hinweis bei stark unterschiedlicher Mehrfachzuordnung zwischen Programmen. | Test |
| 2.4 (W3) | **Zitatprüfung mit Kontext.** Warnung bei Auslassungen über 200 Zeichen, Teilen unter 20 Zeichen oder Bedingungs-/Verneinungswörtern im ausgelassenen Text; der ausgelassene Text erscheint in der Prüfliste; Zahlen der Beschreibung müssen im Zitat stehen. | Prüfliste zeigt Auslassungen |
| 2.5 (W5) | **Nachweis für `geprueft`.** Pflichtfeld `pruefung: {belege_geprueft: Datum}`; bei `keine_massnahme` zusätzlich eine dokumentierte zweite Suche, abgeglichen mit der Treffermatrix. Anonyme Exporte der Prüfenden ins Repo, `bewertung` wird dagegen geprüft. | Datenprüfung lehnt `geprueft` ohne Nachweis ab |
| 2.6 (K3) | **Programmsperre technisch.** PreToolUse-Hook sperrt WebFetch für Partei-, Fraktions- und Stiftungsdomains und für das Repository auf GitHub (Liste in `daten/`); in Phase A lädt der Sitzungsstart keine Programme, und ein Hook sperrt Lesezugriffe auf `.cache/` (Markerdatei). Vorher testen, ob Hooks auch bei Agentenaufrufen greifen. Dazu `themen:ueberblick` (nur Name, Ziel, Ursachen vorhandener Themen) und eine CI-Meldung bei Parteinamen in Ursachen und Ziel. | Testlauf: gesperrte Adresse wird abgewiesen |
| 2.7 (W12) | **Phasen in der CI trennen.** Ursachen oder Ziel und Abdeckung oder Instrumente desselben Themas im selben Pull Request → Fehler, außer mit `nachtraeglich` und vollständigem `durchsucht_fuer`. | CI-Test |
| 2.8 (W8, W9) | **Regeln öffentlich, Freigabe als Datum.** Antworten auf die Methodenfragen (siehe unten) in `docs/methode.md` und `Methode.tsx`; Feld `freigabe: {datum, quellen_bestaetigt}` in der Themendatei, das `ursachen:freigegeben` verlangt; `pr.md` bei jedem Push neu; feste Ja/Nein-Checkliste für die Betreiberin. | Methode nennt Regeln für vage Zusagen, Belegstufen, Quellenarten, nachträgliche Ursachen |
| 2.9 (K4c) | **Herkunft im Spiel anzeigen.** `entwurf_herkunft` in die Datenbank und in die Anzeige („vorläufige Bewertung, nicht blind“ statt „KI-Entwurf“). | Migration, Anzeige |

## Paket 3 – später

| Nr. | Was |
| --- | --- |
| 3.1 (W10) | Mehrere Quellen je Ursache mit `art`, `zitat`, `seite`; Skript prüft die Zitate wie `zitate:pruefen` gegen die Quelle. |
| 3.2 (W11) | Erfassungsprotokolle (Begriffe, Treffermatrix, gelesene Seiten, Ausschlüsse, Prüfsumme der Blindliste, Bewertung, Aufträge) unter `docs/erfassung/<ID>-<datum>.json` ins Repository. |
| 3.3 | Zweiter unabhängiger Bewertungslauf bei Themen mit vielen Grenzfällen; Abweichungen ab zwei Stufen klären. Stichprobe: zweiter Erfassungs-Agent für zwei bis drei Programme je Thema. |
| 3.4 | Erkennbarkeitstest (ein getrennter Agent rät die Partei), nur falls die Restliste aus 2.2 nicht genügt. |

**Bewusst nicht vorgesehen:** durchgehend doppelte Läufe (zu teuer), Sperre von WebSearch (Suchanfragen sind frei formuliert), roter CI-Lauf bei nicht erreichbaren Parteiservern (wäre dauerhaft rot; stattdessen lokaler Prüflauf im Pull Request, Teil von 2.4).

## Vorhandene Daten

- **Sicherheit (9):** 7 von 10 Ursachen nachträglich – Thema nach Phase A neu prüfen (Paket 2).
- **Kita (17):** Entscheidungen zu 1705 (Belegstufe), 1703 und zum Ziel (Methodenfragen 3 bis 5).
- **Miete (2):** Rollen-Modifikatoren – durch 1.2 abgedeckt.

## Methodenfragen – Empfehlung, mit Paket 2 in die Methode übernommen

1. **Vage gegen konkret:** Ziel oder Leitbild ohne Handlung und Prüfaufträge zählen nicht als Maßnahme (Anzeige: „nennt das Ziel, aber keine Maßnahme“). Jede Handlungszusage zählt; Unbestimmtheit wirkt nur über die vorhandene Umsetzbarkeits-Skala.
2. **Programmlänge:** nicht herausrechnen; gleich gründliche Suche (2.1) und blind bestätigte Mehrfachzuordnung (2.3) sichern; Zusammenhang je Thema im Pull Request nennen und unter „Grenzen der Methode“ aufführen.
3. **Wirksamkeit 3:** misst die erwartete Verbesserung für die Betroffenen, nicht das genaue Erreichen einer Zielzahl aus der Quelle. Instrument = Lösungsweg und Größe des Schritts.
4. **Ursache und Ziel:** Maßstab ist das Ziel; es wird in Phase A wie die Ursachen auf Lösungsoffenheit geprüft.
5. **Belegstufen für Ursachen:** A amtliche Messung, B repräsentative Befragung oder begutachtete Studie (je allein ausreichend), C Einschätzung, Prognose, Verbandsangabe (nur mit zweiter Quelle aus A oder B). Gilt gleich für aufgenommene und verworfene Diagnosen.
6. **Unabhängige Quellen:** amtlich und begutachtet immer; Forschungsinstitute auch interessennah, mit Angabe der Ausrichtung; Stiftungen, Thinktanks, Verbände, Ministerien nur für eigene Daten, die Begründung braucht eine zweite Quelle; Parteien, Fraktionen und parteinahe Stiftungen nie.
7. **Nachträgliche Ursachen:** erlaubt, mit festem Verfahren (Fachquelle, Recherche ohne Programmzugriff, Freigabe durch zweite Person, Neusuche in allen Programmen, bis dahin „noch nicht erfasst“). Bei mehr als einem Drittel nachträglicher Ursachen wird das Thema neu geprüft.
8. **Lösungsrichtung bleibt sichtbar:** gegenläufige Lösungswege vor der Bewertung benennen und gleich gründlich recherchieren; Prüfende aus verschiedenen Richtungen; Auswertung der Spannweite je Lösungsrichtung.

## Stand der Umsetzung

| Paket | Stand |
| --- | --- |
| 1 | umgesetzt (1. 10. 2026). Ältere Abdeckungseinträge haben kein `durchsucht_fuer` und gelten wie bisher für alle Ursachen als durchsucht; die Pflicht greift ab der nächsten neuen Ursache. Kita-Instrumente tragen `entwurf_herkunft` (7289 und 7305 `nicht_blind`, im Review nach der Blindbewertung geändert). In Supabase: Migration `20261004000000_abdeckung_ursachen.sql`, `seed.sql`, Edge Function `analyse` neu (`supabase/EINRICHTEN.md` → 11). |
| 2 | umgesetzt (2. 10. 2026), Einzelheiten unten. Die Empfehlungen zu den Methodenfragen 1 bis 8 stehen jetzt als Regeln in `docs/methode.md` und `Methode.tsx`; mit dem Merge bestätigt die Betreiberin sie (sonst vorher ändern). In Supabase: Migration `20261005000000_entwurf_herkunft.sql`, `seed.sql`, Edge Function `analyse` neu (`supabase/EINRICHTEN.md` → 12). |
| 3 | offen |

## Paket 2 im Einzelnen (2. 10. 2026)

| Nr. | Umgesetzt | Ergebnis am vorhandenen Katalog |
| --- | --- | --- |
| 2.1 | `suchbegriffe` als `{Ursache: {Richtung: [...]}}`; `npm run entwurf:treffer` zählt alle Begriffe in allen Programmen der Erfassung und schreibt `treffer` (mit Prüfsumme der Begriffe) in die Erfassung; `entwurf:blind` lehnt Ursachen ohne Richtung, Richtungen ohne Begriffe und fehlende oder veraltete Treffer ab; Hinweis ab 10 Treffern zu einer Ursache ohne Maßnahme. Agenten nennen eigene Synonyme, die in `suchbegriffe` kommen und so in allen Programmen gezählt werden. | Nachvollzug Kita (17) mit den Richtungen aus der Perspektivenprüfung über 27 Programme (BSW Bund nicht ladbar): 7 Hinweise, meist durch allgemeine Begriffe („fachkräft“, „vereinbarkeit“ treffen auch Arbeitsmarkt und Familienpolitik) – deshalb im Skill: Begriffe möglichst spezifisch. Auffällig und bei der Prüfung nachzusehen: 1702 bei Union (Bund), AfD (ST), Linke (MV), Grünen und BSW (BE); 1704 bei Union und Linke (BE). |
| 2.2 | Artikel und „Wir“ vor Parteinamen fallen weg; Mehrwortnamen ohne Groß-/Kleinschreibung; Namen mit Artikel aus `parteien.json`; Personen → „[Person]“; Länder, Städte, Berliner Bezirke, Senat, Abgeordnetenhaus → „[Land]“; verdächtige Reste mit Schwelle in `entwurf:blind`; `npm run blind:reste` für den ganzen Katalog. | Restliste über alle 1428 Maßnahmen: nur 7040 („Das Heizungsgesetz der Ampel schaffen wir ab.“) – begründet: Das Zitat nennt die frühere Regierung, keine Partei; „Ampel“ bleibt als Rest gemeldet. Ersetzt wurden u. a. 30 × „Berliner“, 27 × „Berlin“, 21 × „Sachsen-Anhalt“, 6 × „AfD-geführte“ – keine Fehltreffer gefunden. |
| 2.3 | Jede Zuordnung der Bewertung nennt `ursachen`; fehlt eine Ursache der Erfassung, lehnen `entwurf:bewertung-pruefen` und `entwurf:eintragen` ab. Hinweise bei zusätzlichen Ursachen, verschiedenen Ursachen im selben Instrument und deutlich häufigerer Mehrfachzuordnung eines Programms. | gilt ab der nächsten Erfassung |
| 2.4 | `zitatKontext`: ausgelassener Text je „[…]“, Warnungen bei Auslassung über 200 Zeichen, Teilen unter 20 Zeichen (nicht neben Zeilennummern), einschränkenden Wörtern; in `zitate:pruefen` als Hinweis, in der Prüfliste bei jedem Zitat (mit neuem Prüfpunkt). Zahlen der Beschreibung müssen im Zitat stehen (Zahlwörter bis zwölf zählen): Fehler in `entwurf:blind`, Warnung in `daten:pruefen`. | 91 Zitate mit Auslassungen, davon 28 mit Warnung (19 lang, 13 mit einschränkenden Wörtern, 7 kurze Teile). 17 Maßnahmen mit Zahlen nur in der Beschreibung (z. B. 7047 „bis zu 70 %“, 6667 „von 30“, 7109 „über 200 Mio. Euro“) – bei der Belegprüfung korrigieren. |
| 2.5 | `pruefung.belege_geprueft` Pflicht für `geprueft`, bei `keine_massnahme` mit `zweite_suche`; `keine_massnahme.treffer` aus der Treffermatrix; Export mit sortierten Einzelwerten nach `daten/pruefungen/`, `daten:pruefen` gleicht jede `bewertung` damit ab (Anzahl, Mediane, Spannweite, Einzelwerte). | noch nichts geprüft – greift ab der ersten Übernahme |
| 2.6 | PreToolUse-Hook `.claude/hooks/sperre.mjs` mit `daten/gesperrte-adressen.json` (Partei-, Fraktions-, Stiftungsserver, Muster für Landesverbände, Programmserver aus `parteien.json`, Repository, politik-duell.de); Phase A mit `npm run phase-a -- start/ende` (Marker `.cache/phase-a`) sperrt `.cache/` und Programm-Werkzeuge, der Sitzungsstart lädt dann keine Programme; `npm run themen:ueberblick`; Parteinamen in neuen Ursachen und Zielen → CI-Fehler. | Testlauf mit dem Hook-Skript: spd.de, cdulsa.de (auch als Archivkopie), library.fes.de und das Repository auf GitHub werden abgewiesen, destatis.de und dji.de nicht; in Phase A Read/Grep auf `.cache/` und `programme:suche` abgewiesen, `quelle:text` erlaubt. **Offen:** Live-Test in einer neuen Sitzung, ob der Hook auch bei Aufrufen von Agenten greift (Hooks werden beim Sitzungsstart geladen; laut Dokumentation gelten PreToolUse-Hooks auch für Subagenten). Das Muster für Landesverbände erfasst Parteikürzel nur als ganzen Namensteil oder mit Länderkürzel (cdulsa.de, spd-mv.de, dielinke.berlin), damit Fremdadressen wie linkedin.com oder spdx.org frei bleiben. Keine vorhandene Ursache und kein Ziel nennt eine Partei. |
| 2.7 | `daten:id -- --gegen`: Ursachen oder Ziel und Maßnahmen desselben Themas im selben Pull Request → Fehler, außer neue Ursache mit `nachtraeglich` und `durchsucht_fuer` an jedem aktuellen Eintrag. | gegen `origin/main` ohne Befund |
| 2.8 | Regeln zu vagen Zusagen, Programmlänge, Wirksamkeit 3, Ziel, Belegstufen, Quellenarten, nachträglichen Ursachen und Lösungsrichtungen in `docs/methode.md` und `Methode.tsx`; Feld `freigabe: {datum, quellen_bestaetigt}`, das `ursachen:freigegeben` im Zielzweig verlangt; `pr.md` bei jedem Push neu (beide Skills); Ja/Nein-Checkliste in `.github/pull_request_template.md`. | Kein Thema hat bisher `freigabe` – vor der nächsten Erfassung trägt die Betreiberin sie für das Thema ein. |
| 2.9 | Spalte `entwurf_herkunft` in `massnahmen` (bei KI-Entwürfen: vom Instrument bzw. der Maßnahme; ältere Einträge null); Wertung kennzeichnet `nicht_blind`; Anzeige „vorläufige Bewertung, nicht blind“ statt „KI-Entwurf“ in Auflösung, bester Lösung und Endstand. | 154 Maßnahmen `blind`, 2 `nicht_blind` (Kita 7289, 7305), die übrigen KI-Entwürfe null (vor dem 1. 10. 2026, nicht blind) – sie erscheinen in der Testphase als „nicht blind“. |

Noch offen aus „Vorhandene Daten“: Sicherheit (9) mit 7 von 10 nachträglichen Ursachen nach der neuen Regel (mehr als ein Drittel) neu prüfen; Kita-Entscheidungen zu 1705, 1703 und zum Ziel.
