# Projekt: „Politik-Duell"

Slogan: *„Versprechen kann jeder."*

Ein Zwei-Spieler-Webspiel: Spieler nennen reale Alltagsprobleme, das Spiel prüft, welche Partei dafür die **wirksamste und umsetzbare** Lösung bietet – mit Beleg-Link nach jeder Runde.

## Grundprinzipien (nicht verhandelbar)

1. **Neutrale Methode, kein vorgegebenes Ergebnis.** Alle Parteien werden nach denselben Kriterien bewertet. Bietet eine Partei nachweislich die beste Lösung, gewinnt sie – egal welche.
2. **Die KI vergibt keine Punkte.** Sie führt nur das Gespräch und ordnet Probleme Themen/Ursachen zu. Punkte kommen deterministisch aus der kuratierten Datenbank. (KI-gestützte Entwürfe für Maßnahmen und Bewertungen im Datenkatalog sind erlaubt, sind gekennzeichnet und zählen erst nach menschlicher Prüfung – außer in einer geschlossenen Testphase mit deutlichem Hinweis am Ergebnis.)
3. **Die KI erfindet niemals Quellen oder Links.** Alle Belege stammen ausschließlich aus der Datenbank.
4. **Forderung ≠ Problem.** Nennt ein Spieler eine Forderung („weniger X"), fragt die KI nach dem konkreten Alltagsproblem dahinter.
5. **Datenschutz:** Politische Meinungen sind besondere Daten (Art. 9 DSGVO). Keine Konten, keine IPs, kein Audio speichern – nur anonymen Problemtext. Ausnahme: Runden ohne Wertung (auch `grenze`) landen im Wortlaut in der Review-Warteschlange `review_eingaben` – nur Admins, ohne Parteien und ohne Verbindung zur Runde, gelöscht beim Sichten oder nach 30 Tagen.

## Spielablauf

1. Startbildschirm mit Titel, kurzer Erklärung, Datenschutzhinweis. Im Hintergrund: langsam bewegte Wortwolke der Themen, die das Spiel kennt (angelegt, mit belegten Ursachen; keine Eingaben von Spielenden).
2. Spieler A und B wählen je eine Partei (nicht dieselbe) und optional eine Rolle (Mieter, Eigentümer, Angestellte, Selbstständig, Rentner, Arbeitslos, Studierend, Vermögend).
3. Pro Runde (insgesamt 5, abwechselnd): Ein Spieler **hält einen Knopf gedrückt** und spricht sein Problem ein (Text-Eingabe als Alternative).
4. KI klassifiziert: `problem` | `forderung` | `wert` | `grenze`.
   - `forderung` → max. 2 Nachfragen („Was läuft in deinem Alltag konkret schief?"), die Forderung wird dabei neutral wiedergegeben. Ist das Thema erkennbar, kann die Person stattdessen bis zu drei Ursachen des Themas antippen (gewertet wie eine Zuordnung der KI; nicht bei Pauschalurteilen über Gruppen). Bleibt es bei der Forderung: Runde ohne Wertung, neues Problem möglich – keine Umdeutung zum Problem. Entspricht die Forderung eindeutig einem erfassten Lösungsweg (Instrument des Themas, zweiter KI-Aufruf), zeigt ein Knopf „Zeig mir, wer das fordert“ die **Forderungskarte**: welche Parteien den Lösungsweg im Programm haben (mit Beleg-Link), Forschungsstand und Begründung – ohne Punkte; nach einem gewerteten Problem erscheint sie zusätzlich in der Auflösung. Weitere Schritte (Forderungs- und Haltungskarte): `docs/plan-haltungen.md`.
   - `wert` → respektvoll als persönliche Haltung benennen, Runde ohne Wertung, neues Problem möglich. Berührt die Haltung eindeutig eine erfasste Wertfrage (`haltung_id`, nur Haltungen mit Position aller sieben Parteien), zeigt die Runde die **Haltungskarte** (höchstens eine je Runde): die Frage, die Position jeder Partei aus dem Bundesprogramm (`ja`/`nein`/`teils`/`keine_aussage`, Kurzfassung, Zitat aufklappbar, Beleg-Link) und die Zielkonflikte beider Seiten – ohne Punkte, ohne Hervorhebung der gewählten Parteien; verwandte Themen zum Antippen führen zu deren Ursachen.
   - `grenze` → Abwertung einer Gruppe (Menschenwürde, gleiche Rechte), Gewaltaufruf oder Beleidigung: „Darauf geht das Spiel nicht ein. Magst du ein Problem aus deinem Alltag nennen?“ – ohne Belehrung, ohne Wiedergabe, ohne Karte; in `runden` ohne Inhalt (Wortlaut nur in `review_eingaben`, s. Datenschutz); neues Problem möglich. Ein Pauschalurteil über eine Gruppe ist **kein** `grenze`-Fall (dort Nachfrage nach dem Erlebten), im Zweifel Nachfrage (`docs/methode.md` → „Grenze“).
   - Die eigene Eingabe bleibt sichtbar: nach einer Runde ohne Wertung (auch `grenze`) oben im Verlauf bis zur nächsten Eingabe, nach einer Wertung in der Auflösung über der Kurzfassung (nicht im Teilen-Text).
   - `problem` → Zuordnung zu Thema + Ursachen. Nur Ursachen, die sich aus der Schilderung erkennen lassen; ist keine erkennbar, fragt die KI nach (Nachfragen insgesamt max. 2, mit Ursachen zum Antippen), sonst Runde ohne Wertung.
5. Auflösung: Beide gewählten Parteien werden gezeigt mit Maßnahme, Punktzahl, Kurzbegründung und **Beleg-Links** (Wahlprogramm mit Seitenanker + ggf. Studie). Zusätzlich: welche Partei insgesamt die beste Lösung hätte.
6. Nach 5 Runden: Gesamtsieger, Zusammenfassung aller Runden mit Links, „Worüber ihr gesprochen habt“ (alle Haltungs- und Forderungskarten der Partie, aufklappbar, nicht im Teilen-Text), Teilen-Button.

## Programm-Quiz „Wer sagt Ja?“ (`#/quiz`)

Zweiter Modus, ohne Datenbank und ohne KI (`docs/plan-quiz.md`): Bis zu acht Personen raten, welche Parteien im Bundesprogramm zu einer Haltung Ja (oder Nein) sagen; Punkte für Treffer, mehr für Tempo – nie für eine Meinung. Fragen entstehen mechanisch aus Haltungen mit sieben geprüften Positionen (`npm run quiz:erzeugen` → `public/quiz/fragen.json`), je Spiel ist keine Partei mehr als einmal die einzige richtige Antwort. Zitate nur als Beleg in der Auflösung (§ 51 UrhG), nie als Rätseltext. Show mit zwei erfundenen KI-Moderatoren (Mara, Ben; ElevenLabs, vorab aufgenommen mit `npm run quiz:stimmen`, Schlüssel nur in `.env.local`), Animationen und Geräuschen, synchron nach festem Zeitplan; Moderationstexte nennen keine Parteien (`src/quiz/show/texte.ts`). Räume heißen merkbar „Kluge Eule 27“ (Code daraus berechnet, `src/quiz/raumname.ts`); Name und Raumname nur mit Häkchen im localStorage, die Ton-Wahl (an/aus) nur nach ausdrücklichem Antippen; ohne Freigabe durch den Browser bittet das Quiz deutlich „Mit Ton spielen?“; öffentliche Räume („Mit Zufälligen spielen“) stehen während des Wartens in `quiz-oeffentlich` (Firebase); anstößige Namen ersetzt die Spielleitung durch „Gast N“. Verbindung per WebRTC; zur Vermittlung und als Weiterleitung die Firebase Realtime Database (Projekt `politik-duell-quiz`, Belgien, Spark-Tarif, per REST ohne SDK – im Browser wird nichts gespeichert; Nachrichten werden nach dem Lesen gelöscht, Regeln in `firebase/database.rules.json`, `firebase/README.md`), ersatzweise Supabase Realtime Broadcast.

## Bewertungslogik

Pro Maßnahme in der Datenbank:
- `wirksamkeit` 0–3: Setzt die Maßnahme an den tatsächlichen Ursachen an?
- `umsetzbarkeit` 0–3: rechtlich, finanziell, zeitlich realistisch?
- optional `rollen_modifikator`: Auf- oder Abwertung je Rolle (z. B. Mietrecht für Mieter vs. Eigentümer), begründet.

Punkte je Maßnahme = `wirksamkeit × umsetzbarkeit` (0–9); der Rollen-Modifikator verschiebt die Wirksamkeit (innerhalb 0–3). Pro Ursache zählen die verschiedenen Lösungswege (je Instrument die beste Maßnahme, ohne Instrument je Maßnahme) mit abnehmendem Gewicht: bester voll, zweiter ½, dritter ¼ …, zusammen höchstens 9, auf eine Nachkommastelle (Begründung und Forschung: `docs/methode.md` → „Mehrere Lösungswege je Ursache“). Rundenpunkte = Summe über die zugeordneten Ursachen. Höhere Summe gewinnt die Runde (1 Punkt). Gleichstand: beide je 1 Punkt. Hat eine Partei keine Maßnahme zum Thema: 0.

Ist ein Thema für eine der beiden Parteien noch **nicht erfasst** (Programm nicht vollständig ausgewertet und geprüft, Tabelle `abdeckung`), wird die Runde nicht gewertet – fehlende Daten dürfen keiner Partei einen Punkt kosten. Die Anzeige unterscheidet „keine Maßnahme zu diesen Ursachen“, „nichts zum Thema im Programm“ und „noch nicht erfasst“.

Ist ein Thema nicht in der DB: KI gibt eine vorläufige Einschätzung, deutlich als **„ungeprüft – keine Wertung"** gekennzeichnet, ohne Punkte und ohne Links. Eintrag landet in einer Review-Warteschlange.

## Tech-Stack

- **Frontend:** React + Vite + TypeScript, mobil-first, als PWA. Hosting: Vercel oder Netlify.
- **Backend:** Supabase, Region Frankfurt (Postgres, Edge Functions, Realtime).
- **KI:** API-Aufruf ausschließlich aus einer Edge Function (API-Key nie im Frontend). Günstiges Modell (z. B. Claude Haiku oder Mistral). Antworten als striktes JSON. Rate-Limit pro Sitzung.
- **Barrierefreiheit:** WCAG 2.2 AA für Handy, iPad und Desktop (`docs/barrierefreiheit.md`): neue Ansichten mit `useAnsicht` (Seitentitel, Fokus auf die Überschrift), Bedienelemente mit `--rand-bedien`, Zielflächen ≥ 24 px, Zeitlimits einstellbar.
- **Sprache:** Push-to-talk via Web Speech API (Chrome/Safari); Fallback Texteingabe. Später optional Transkriptionsdienst.
- **Wortwolke:** d3-cloud, sanfte Bewegung. Die Wörter sind die angelegten Themen mit belegten Ursachen, die für alle sieben Parteien erfasst sind (Bundesprogramm, Tabelle `abdeckung`), Größe nach Zahl der Ursachen (`src/data/wortwolke.ts`). Auf dem Startbildschirm über die ganze Fläche, im Spiel nur links und rechts neben der Spielspalte (bei schmalen Fenstern gar nicht). Noch nicht erfasste Themen zeigt die Wolke nicht.

## Datenmodell (Entwurf)

```sql
parteien (id, name, kurzname, farbe, programm_url, programm_stand date)

themen (id, name, beschreibung)

ursachen (id, thema_id, beschreibung, quelle_url, ebene)   -- ebene: bund | land

laender (id, name, letzte_wahl)                    -- nur Länder mit erfassten Landesprogrammen
landesprogramme (partei_id, land, url, stand, kein_programm)   -- nur laufende Wahlperiode

massnahmen (
  id, thema_id, partei_id,
  land text null,                     -- null = Bundesprogramm
  beschreibung,
  ursachen_ids int[],
  instrument_id int null,             -- gleicher Lösungsweg wie in anderen Programmen (Forderungskarte)
  wirksamkeit smallint check (0..3),
  umsetzbarkeit smallint check (0..3),
  rollen_modifikator jsonb,
  begruendung text,
  beleg_programm_url text not null,   -- mit #page=N wo möglich
  beleg_studie_url text,
  evidenz text,                       -- belegt | gemischt | offen
  stand date,
  geprueft boolean default false,
  ki_entwurf boolean default false    -- nur mit Zugang zur geschlossenen Testphase sichtbar
)

instrumente (id, thema_id, name, begruendung, evidenz, beleg_studie_url, ebene, entspricht, ki_entwurf)
  -- Lösungswege für die Forderungskarte, ohne Punkte; entspricht = gleicher Weg auf der anderen Ebene (Bund ↔ Land)

haltungen (id, frage, beschreibung, verwandte_themen)   -- Wertfragen für die Haltungskarte, eigener Nummernkreis
haltung_positionen (haltung_id, partei_id, land, position, kurzfassung, zitat, beleg_programm_url, begruendung, stand, ki_entwurf)
haltung_zielkonflikte (haltung_id, seite, text, quelle_url)

review_eingaben (id, created_at, grund, eingaben text[], thema_id, zusammenfassung)
  -- Runden ohne Wertung im Wortlaut, nur Admins, gelöscht beim Sichten oder nach 30 Tagen
  -- View haltungen_vollstaendig: Haltungen mit Position aller Parteien („Alle sieben oder keine“)

runden (
  id, created_at, thema_id null, instrument_id null, haltung_id null, problem_text,
  partei_a, partei_b, punkte_a, punkte_b,   -- numeric(5,1)
  status text,            -- gewertet | ungeprueft | unvollstaendig | wert | forderung | grenze (ohne Inhalt)
  freigegeben boolean default false   -- Freigabe für eine mögliche öffentliche Anzeige (die Wortwolke zeigt derzeit Themen, keine Probleme)
)
```

Row Level Security: Frontend darf nur lesen (Themen, Maßnahmen, freigegebene Probleme) und über die Edge Function schreiben.

## KI-Schnittstelle

Edge Function `analyse` erhält: Gesprächsverlauf der Runde, Rolle, Liste aller Themen + Ursachen (IDs + Kurztext) und der vollständig erfassten Haltungen (ID + Frage).
Antwort (JSON):

```json
{
  "typ": "problem | forderung | wert | grenze",
  "nachfrage": "string[] | null (drei Fassungen; die Edge Function zeigt eine zufällig)",
  "thema_id": "number | null",
  "ursachen_ids": [1, 2],
  "instrument_id": "number | null (nur bei forderung mit Thema; zweiter, kurzer Aufruf nur mit den Instrumenten des Themas)",
  "haltung_id": "number | null (nur bei wert; nur vollständig erfasste Haltungen stehen im Prompt)",
  "pauschal": "boolean (Pauschalurteil über eine Gruppe: keine Ursachenauswahl)",
  "rueckmeldung": "string[] | null (drei Fassungen; bei wert und abschließender forderung: greift die Äußerung neutral auf; sonst fester Satz)",
  "zusammenfassung": "kurzer neutraler Satz zum Problem"
}
```

Systemprompt-Regeln: neutral, respektvoll, keine Belehrung, keine eigenen Bewertungen von Parteien, keine Links, Deutsch, kurze Sätze. Temperatur niedrig (0,1), damit die Zuordnung zu Thema und Ursachen stabil bleibt; Abwechslung im Text kommt aus den drei Fassungen, nicht aus einer höheren Temperatur.

## Moderation

Vor jeder öffentlichen Anzeige von Spielereingaben (derzeit zeigt die Wortwolke nur Themen): automatischer Filter (Beleidigungen, Namen von Privatpersonen, Hetze) + Admin-Freigabe in einfacher Admin-Ansicht (Supabase Auth, nur Admins).

## Branding

- Name: **„Politik-Duell"**, Slogan: **„Versprechen kann jeder."**
- „Wer liefert?" ist nicht mehr der Name (zu nah an der Marke „wer liefert was“/wlw), darf aber als Frage im Spiel vorkommen. Repository (`politik-duell/politik-duell`, in der GitHub-Organisation `politik-duell`) und Vercel-Projekt (`politik-duell.vercel.app`) heißen `politik-duell`; nur das Supabase-Projekt heißt technisch weiterhin `wer-liefert`. Domain: **politik-duell.de** (Hauptadresse), politikduell.de leitet dorthin weiter.
- Eigenes, originales Logo und Design mit Quizshow-Anmutung (Spannung, Auflösung, Punktestand), aber **nicht** Logo, Farbschema oder Studiodesign von „Wer wird Millionär" nachbilden (markenrechtlich geschützt).
- Tonalität: neutral, freundlich, leicht spielerisch; keine Seitenhiebe auf einzelne Parteien in Texten, Grafiken oder Animationen.

## Meilensteine

1. **Klickbarer Prototyp:** Parteiwahl, Texteingabe, Mock-Daten für 3 Themen (Arzttermine, Miete, Energiepreise), Punktevergabe + Beleg-Links, Endbildschirm.
2. Push-to-talk-Knopf.
3. Supabase-Anbindung: Schema, Seed-Daten, Edge Function mit KI.
4. Wortwolke mit Realtime + Moderation/Admin-Ansicht.
5. Datenschutzseite, Impressum, Rate-Limit, Deployment.

## Offene Punkte

- ~~Welche Parteien sind dabei?~~ Entschieden: CDU/CSU, SPD, Grüne, FDP, AfD, Linke, BSW; im Fork seit 7. 10. 2026 zusätzlich Volt (ID 18). Volt-Positionen der Haltungen als Nachtrag (`--nachtrag 18`, übrige Positionen unverändert); Volt-Maßnahmen für alle 22 erfassten Themen aus dem Bundesprogramm (KI-Entwurf, 7. 10. 2026, Leitfäden mit Suchbegriffen aus den dokumentierten Stichwörtern der ersten Erfassung); Landesprogramme von Volt noch nicht erfasst. Grundlage sind die Wahlprogramme zur Bundestagswahl 2025, wo vorhanden ergänzt um neuere Grundsatzprogramme. Für Ursachen in Länderzuständigkeit zählen Landtagswahlprogramme der laufenden Wahlperiode, wenn Spielende ein Bundesland wählen (Datenformat und Wertung umgesetzt, Landesprogramme werden erfasst – zuerst ST, MV, BE; siehe `docs/methode.md` → „Bund und Länder“).
- Wer pflegt und prüft die Bewertungen? Format und Ablauf stehen (`daten/` als JSON, Pull Requests mit Quellenpflicht, automatische Prüfung; Bewertung durch eingeladene Prüfende in der App mit Median je Kriterium, Belegprüfung durch die Betreiberin, siehe `daten/README.md` → „Prüfung“ und `docs/plan-pruefung.md`) – offen ist, welche Personen das übernehmen.
- ~~Domain sichern~~ Erledigt (September 2026): politik-duell.de ist die Hauptadresse (bei INWX, in Vercel verbunden, HTTPS, in `ERLAUBTE_URSPRUENGE` und als Supabase *Site URL* eingetragen), politikduell.de leitet dorthin weiter. Kontakt: politik-duell@posteo.de.
- Trägerschaft: Geplant ist ein gemeinnütziger Verein „Politik-Duell e. V.“ (politische Bildung, Methodenbeirat, Neutralität in der Satzung). Unterlagen und Fahrplan in `docs/verein/`. Lizenz festgelegt: Code AGPL-3.0-or-later (`LICENSE`), Daten CC BY 4.0 (`daten/LICENSE`). Offen: sieben Gründungsmitglieder finden; bis dahin betreibt die Gründerin das Projekt als Einzelperson.
- Markenlage vor einer Markenanmeldung oder Veröffentlichung in App Stores prüfen (DPMAregister, TMview). „Politik-Duell“ ist beschreibend und daher kaum als Marke schützbar.
