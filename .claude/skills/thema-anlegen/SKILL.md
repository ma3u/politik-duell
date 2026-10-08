---
name: thema-anlegen
description: Phase A für ein oder mehrere neue Themen des Politik-Duells – Ziel, Ursachen mit unabhängigen Quellen, Ebene, Perspektivenprüfung, Leitfaden und Suchbegriffe, ohne Blick in Wahlprogramme. Endet mit KI-Freigabe (Testphase) und einem eigenen Commit; mit --erfassen geht es direkt mit /thema-erfassen weiter. Aufruf z. B. /thema-anlegen Kita-Betreuung oder /thema-anlegen Pflege; Rente --erfassen.
argument-hint: <Thema>[; <Thema> …] [--erfassen] | <Thema> --neu <ID>
disable-model-invocation: true
---

# Neues Thema anlegen (Phase A: Ursachen)

Aufruf: **$ARGUMENTS** (mehrere Themen durch „;“ getrennt).

Diese Phase legt fest, *warum* ein Problem besteht – bevor jemand in Wahlprogramme schaut. Sie endet mit einer **KI-Freigabe** für die geschlossene Testphase (`"freigabe": { "datum": "…", "art": "ki" }`) und einem eigenen Commit. Eine menschliche Prüfung ist dafür nicht nötig; sie ersetzt die KI-Freigabe später (Datum und `quellen_bestaetigt`, ohne `art`). Maßstab: `docs/methode.md` („Ursachen“, „Belegstufen“).

## Sperre: keine Wahlprogramme

**Als Erstes:** `npm run phase-a -- start "<Themen>"`. Dann sperrt ein Hook Programme und `.cache/` (auch für Agenten). Vorhandene Themen nur über `npm run -s themen:ueberblick` (`-- --kurz`: eine Zeile je Thema; `-- --nur <IDs>`: einzelne Themen mit Ursachen). Erlaubt ist `npm run -s quelle:text -- <url> [--suche "Wort"]` für unabhängige PDFs. **Zum Schluss:** `npm run phase-a -- ende`.

## Schritte

1. **Aufnahme.** `npm run -s themen:ueberblick -- --kurz`; bei möglicher Überschneidung die betroffenen Themen mit `-- --nur <IDs>`. Abbrechen (mit einem Satz Begründung), wenn sich das Thema stark mit einem vorhandenen überschneidet oder eine Wertfrage ist (dann `/haltung-anlegen` vorschlagen). Aufnahmegrund in einem Satz (Umfrage, Review-Warteschlange oder „auf Wunsch der Betreiberin“).
2. **Recherche:** je Thema ein Agent `ursachen-recherche`, alle gleichzeitig, mit Thema, Aufnahmegrund, Ausgabe von `themen:ueberblick -- --kurz`, den Ursachen naheliegender Themen (`-- --nur <IDs>`, falls in Schritt 1 gefunden) und Datum.
3. **Vorschlag prüfen** – nur die Form, keine eigene Nachrecherche:
   - Ziel und Ursachen lösungsoffen; Belegstufe A/B je allein, C nur mit zweiter Quelle aus A/B; keine Partei-, Fraktions- oder Stiftungsquellen; Ebene begründet; Lösungsrichtungen je Ursache vorhanden (auch gegenläufige).
   - **Nur Ursachen mit im Original geöffneter Quelle.** Was der Agent nicht öffnen konnte, kommt unter „Verworfen: nicht gelesen“. Hängt eine wichtige Diagnose an genau einem PDF, ein Versuch mit `quelle:text --suche`; sonst verwerfen.
   - Bei Mängeln **eine** gebündelte Rückfrage an denselben Agenten (SendMessage). Danach übernehmen, was die Regeln erfüllt.
4. **Dateien** je Thema:
   - `daten/themen/NN-name.json`: nächste freie Themen-ID, Ursachen-IDs = Themen-ID × 100 + Nr.; `id`, `name`, `beschreibung`, `ziel`, `schlagwoerter`, `ursachen`, `freigabe: { "datum": "<heute>", "art": "ki" }`. Keine `instrumente`, keine `abdeckung`. Format wie die vorhandenen Dateien.
   - `daten/leitfaeden/<ID>.json` (Format `Leitfaden` in `scripts/entwurf.ts`, Beispiel `18.json`): Regeln je Ursache (was dazugehört, was nicht; offene Grenzfälle als „nur als `ursachen_offen`“), Bündel nur für breite Richtungen mit vielen gleichartigen Einzelzusagen, und **`suchbegriffe`**: je Ursache jede Lösungsrichtung mit eigenen Begriffen (Wortteile, Stamm bei Umlautplural, Sprache aller Richtungen, möglichst spezifisch). Keine Parteinamen.
   - `docs/perspektiven-ursachen.md`: Abschnitt `## <Thema> (<ID>)` mit „Stand: <Datum> · KI-Entwurf, KI-Freigabe für die Testphase“, Aufnahmegrund, Ziel, Tabelle (Ursache | Ebene | Quelle mit Belegstufe | Diagnose aus der Debatte), „Verworfen:“ und je Ursache das tragende Zitat mit Zahl. Kurz halten.
   Weitere Dokumente (README-Hinweise, Methodenliste) nicht anfassen.
5. **Prüfen:** `npm run seed && npm run daten:pruefen && npm test` – alles grün.
6. **Abschließen:** `npm run phase-a -- ende`, dann **eigener Commit** nur mit Phase A („Thema <Name>: Ursachen (KI-Freigabe)“). Dieser Commit belegt, dass die Ursachen feststanden, bevor Maßnahmen dazukamen – ohne ihn lehnt die Prüfung Phase A und Maßnahmen im selben Pull Request ab.
7. **Weiter:**
   - Mit `--erfassen`: Lies `.claude/skills/thema-erfassen/SKILL.md` und folge ihm für alle neuen IDs im selben Zweig und Pull Request.
   - Aus `/liste-einordnen` aufgerufen: nur committen – Push und Pull Request macht die Liste.
   - Sonst: pushen; Pull Request „Neue Themen: <Namen> (Ursachen, KI-Freigabe)“ mit Tabelle der Ursachen (Ebene, Quelle als Link, Belegstufe), Verworfenem und dem Satz „Weiter mit `/thema-erfassen <IDs>`“.

## Neuanlage eines vorhandenen Themas (`--neu <ID>`)

Für Themen ohne geprüfte Einträge, deren Ursachen neu hergeleitet werden. Voraussetzung: keine `instrumente` und keine `abdeckung` mehr (vorher stillgelegt, IDs in `daten/ids.json`), sonst abbrechen.
- Schritt 1 entfällt. Der Agent bekommt `npm run -s themen:ueberblick '--' '--kurz' '--ohne' <ID>` und nur Name und Beschreibung des Themas – nicht die bisherigen Ursachen.
- Danach Abgleich je bisheriger Ursache: *bestätigt* (ID bleibt, Text und Quelle neu), *zusammengelegt/verworfen* (ID entfällt, nie wiederverwenden), neue Ursachen ab höchster ID + 1. Eine bisherige Diagnose, die die Recherche nicht fand, nur mit Beleg nach den Belegstufen übernehmen.
- Die vorhandene Themendatei überarbeiten (ohne `nachtraeglich`), neue `freigabe` mit `art: "ki"`. In `docs/perspektiven-ursachen.md` „Neuanlage <Datum>“ über dem alten Stand mit Abgleichtabelle.
