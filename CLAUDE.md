# Projekt: „Politik-Duell"

Slogan: *„Versprechen kann jeder."*

Ein Zwei-Spieler-Webspiel: Spieler nennen reale Alltagsprobleme, das Spiel prüft, welche Partei dafür die **wirksamste und umsetzbare** Lösung bietet – mit Beleg-Link nach jeder Runde.

## Grundprinzipien (nicht verhandelbar)

1. **Neutrale Methode, kein vorgegebenes Ergebnis.** Alle Parteien werden nach denselben Kriterien bewertet. Bietet eine Partei nachweislich die beste Lösung, gewinnt sie – egal welche.
2. **Die KI vergibt keine Punkte.** Sie führt nur das Gespräch und ordnet Probleme Themen/Ursachen zu. Punkte kommen deterministisch aus der kuratierten Datenbank. (KI-gestützte Entwürfe für Maßnahmen und Bewertungen im Datenkatalog sind erlaubt, sind gekennzeichnet und zählen erst nach menschlicher Prüfung – außer in einer geschlossenen Testphase mit deutlichem Hinweis am Ergebnis.)
3. **Die KI erfindet niemals Quellen oder Links.** Alle Belege stammen ausschließlich aus der Datenbank.
4. **Forderung ≠ Problem.** Nennt ein Spieler eine Forderung („weniger X"), fragt die KI nach dem konkreten Alltagsproblem dahinter.
5. **Datenschutz:** Politische Meinungen sind besondere Daten (Art. 9 DSGVO). Keine Konten, keine IPs, kein Audio speichern – nur anonymen Problemtext.

## Spielablauf

1. Startbildschirm mit Titel, kurzer Erklärung, Datenschutzhinweis. Im Hintergrund: langsam bewegte Wortwolke der Themen, die das Spiel kennt (angelegt, mit belegten Ursachen; keine Eingaben von Spielenden).
2. Spieler A und B wählen je eine Partei (nicht dieselbe) und optional eine Rolle (Mieter, Eigentümer, Angestellte, Selbstständig, Rentner, Arbeitslos, Studierend, Vermögend).
3. Pro Runde (insgesamt 5, abwechselnd): Ein Spieler **hält einen Knopf gedrückt** und spricht sein Problem ein (Text-Eingabe als Alternative).
4. KI klassifiziert: `problem` | `forderung` | `wert`.
   - `forderung` → max. 2 Nachfragen („Was läuft in deinem Alltag konkret schief?").
   - `wert` → respektvoll als persönliche Haltung benennen, Runde ohne Wertung, neues Problem möglich.
   - `problem` → Zuordnung zu Thema + Ursachen. Nur Ursachen, die sich aus der Schilderung erkennen lassen; ist keine erkennbar, fragt die KI nach (Nachfragen insgesamt max. 2), sonst Runde ohne Wertung.
5. Auflösung: Beide gewählten Parteien werden gezeigt mit Maßnahme, Punktzahl, Kurzbegründung und **Beleg-Links** (Wahlprogramm mit Seitenanker + ggf. Studie). Zusätzlich: welche Partei insgesamt die beste Lösung hätte.
6. Nach 5 Runden: Gesamtsieger, Zusammenfassung aller Runden mit Links, Teilen-Button.

## Bewertungslogik

Pro Maßnahme in der Datenbank:
- `wirksamkeit` 0–3: Setzt die Maßnahme an den tatsächlichen Ursachen an?
- `umsetzbarkeit` 0–3: rechtlich, finanziell, zeitlich realistisch?
- optional `rollen_modifikator`: Auf- oder Abwertung je Rolle (z. B. Mietrecht für Mieter vs. Eigentümer), begründet.

Punkte je Maßnahme = `wirksamkeit × umsetzbarkeit` (0–9); der Rollen-Modifikator verschiebt die Wirksamkeit (innerhalb 0–3). Pro Ursache zählt die beste Maßnahme. Rundenpunkte = Summe über die zugeordneten Ursachen. Höhere Summe gewinnt die Runde (1 Punkt). Gleichstand: beide je 1 Punkt. Hat eine Partei keine Maßnahme zum Thema: 0.

Ist ein Thema für eine der beiden Parteien noch **nicht erfasst** (Programm nicht vollständig ausgewertet und geprüft, Tabelle `abdeckung`), wird die Runde nicht gewertet – fehlende Daten dürfen keiner Partei einen Punkt kosten. Die Anzeige unterscheidet „keine Maßnahme zu diesen Ursachen“, „nichts zum Thema im Programm“ und „noch nicht erfasst“.

Ist ein Thema nicht in der DB: KI gibt eine vorläufige Einschätzung, deutlich als **„ungeprüft – keine Wertung"** gekennzeichnet, ohne Punkte und ohne Links. Eintrag landet in einer Review-Warteschlange.

## Tech-Stack

- **Frontend:** React + Vite + TypeScript, mobil-first, als PWA. Hosting: Vercel oder Netlify.
- **Backend:** Supabase, Region Frankfurt (Postgres, Edge Functions, Realtime).
- **KI:** API-Aufruf ausschließlich aus einer Edge Function (API-Key nie im Frontend). Günstiges Modell (z. B. Claude Haiku oder Mistral). Antworten als striktes JSON. Rate-Limit pro Sitzung.
- **Sprache:** Push-to-talk via Web Speech API (Chrome/Safari); Fallback Texteingabe. Später optional Transkriptionsdienst.
- **Wortwolke:** d3-cloud, sanfte Bewegung. Die Wörter sind die angelegten Themen mit belegten Ursachen, Größe nach Zahl der Ursachen (`src/data/wortwolke.ts`). „Erfasst“ bleibt der Wertungsregel (Tabelle `abdeckung`) vorbehalten; die Wolke zeigt auch Themen, die noch für keine Partei erfasst sind.

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

runden (
  id, created_at, thema_id null, problem_text,
  partei_a, partei_b, punkte_a, punkte_b,
  status text,            -- gewertet | ungeprueft | wert
  freigegeben boolean default false   -- Freigabe für eine mögliche öffentliche Anzeige (die Wortwolke zeigt derzeit Themen, keine Probleme)
)
```

Row Level Security: Frontend darf nur lesen (Themen, Maßnahmen, freigegebene Probleme) und über die Edge Function schreiben.

## KI-Schnittstelle

Edge Function `analyse` erhält: Gesprächsverlauf der Runde, Rolle, Liste aller Themen + Ursachen (IDs + Kurztext).
Antwort (JSON):

```json
{
  "typ": "problem | forderung | wert",
  "nachfrage": "string | null",
  "thema_id": "number | null",
  "ursachen_ids": [1, 2],
  "zusammenfassung": "kurzer neutraler Satz zum Problem"
}
```

Systemprompt-Regeln: neutral, respektvoll, keine Belehrung, keine eigenen Bewertungen von Parteien, keine Links, Deutsch, kurze Sätze.

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

- ~~Welche Parteien sind dabei?~~ Entschieden: CDU/CSU, SPD, Grüne, FDP, AfD, Linke, BSW. Grundlage sind die Wahlprogramme zur Bundestagswahl 2025, wo vorhanden ergänzt um neuere Grundsatzprogramme. Für Ursachen in Länderzuständigkeit zählen Landtagswahlprogramme der laufenden Wahlperiode, wenn Spielende ein Bundesland wählen (Datenformat und Wertung umgesetzt, Landesprogramme werden erfasst – zuerst ST, MV, BE; siehe `docs/methode.md` → „Bund und Länder“).
- Wer pflegt und prüft die Bewertungen? Format und Ablauf stehen (`daten/` als JSON, Pull Requests mit Quellenpflicht, automatische Prüfung; Bewertung durch eingeladene Prüfende in der App mit Median je Kriterium, Belegprüfung durch die Betreiberin, siehe `daten/README.md` → „Prüfung“ und `docs/plan-pruefung.md`) – offen ist, welche Personen das übernehmen.
- ~~Domain sichern~~ Erledigt (September 2026): politik-duell.de ist die Hauptadresse (bei INWX, in Vercel verbunden, HTTPS, in `ERLAUBTE_URSPRUENGE` und als Supabase *Site URL* eingetragen), politikduell.de leitet dorthin weiter. Kontakt: politik-duell@posteo.de.
- Trägerschaft: Geplant ist ein gemeinnütziger Verein „Politik-Duell e. V.“ (politische Bildung, Methodenbeirat, Neutralität in der Satzung). Unterlagen und Fahrplan in `docs/verein/`. Lizenz festgelegt: Code AGPL-3.0-or-later (`LICENSE`), Daten CC BY 4.0 (`daten/LICENSE`). Offen: sieben Gründungsmitglieder finden; bis dahin betreibt die Gründerin das Projekt als Einzelperson.
- Markenlage vor einer Markenanmeldung oder Veröffentlichung in App Stores prüfen (DPMAregister, TMview). „Politik-Duell“ ist beschreibend und daher kaum als Marke schützbar.
