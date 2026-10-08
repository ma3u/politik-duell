# Politik-Duell

*„Versprechen kann jeder."* – Zwei-Spieler-Webspiel: Alltagsprobleme nennen, das Spiel zeigt, welche Partei dafür die wirksamste und umsetzbare Lösung bietet – mit Beleg-Link nach jeder Runde.

Grundprinzipien und Kurzüberblick: [CLAUDE.md](CLAUDE.md); Konzept, Spielablauf und Meilensteine: [docs/projekt.md](docs/projekt.md). Methode zum Weitergeben an Partner und Prüfende: [docs/methode.md](docs/methode.md). Vereinsgründung (Satzung, Fahrplan, Übergabe der App): [docs/verein/](docs/verein/README.md).

## Dieser Fork: ma3u/politik-duell

Testversion: **https://ma3u.github.io/politik-duell/** (GitHub Pages, ohne Supabase). Stand gegenüber dem Upstream [politik-duell/politik-duell](https://github.com/politik-duell/politik-duell): 35 eigene Commits seit `feb91ac`; die 8 neueren Upstream-Commits (u. a. Hebel-Checkliste im Leitfaden, Forderungen je Programm bündeln, sparsamere Skills) sind noch nicht übernommen. Änderungen gehen nur auf den Fork, nicht in den Upstream.

**Programm-Quiz „Wer sagt Ja?“** (neu, `#/quiz`, auf Pages die Startseite)
- Mehrspieler bis acht Personen, Browser zu Browser per WebRTC; Vermittlung über die Firebase Realtime Database (REST, ohne SDK), ersatzweise Supabase Realtime; merkbare Raumnamen („Kluge Eule 27“), „Mit Fremden“, „Mit Freunden“ (Raum eröffnen oder beitreten), „Alleine“
- Show mit zwei KI-Moderatoren (Mara, Ben; ElevenLabs, vorab aufgenommen), Animationen, Geräuschen, Konfetti für den Sieg, Startmusik im Party-Elektro-Stil; Ton-Schalter als Lautsprecher, Hinweis „Mit Ton spielen?“ bis der Browser den Ton freigibt
- Startseite: Name (wird gemerkt) und Zeit je Frage als Knopf in einer Zeile; Ton-Wahl wird auf ausdrücklichen Wunsch gemerkt
- 24 Fragen aus den Haltungen, auf Pages mit KI-Entwürfen (gekennzeichnet)

**Daten**
- **Volt** als achte Partei: Bundesprogramm, Landesprogramme ST, MV, BE, Positionen der erfassten Haltungen
- **Alle 37 Themen** mit Maßnahmen aller acht Parteien aus Bundes- und (wo Landessache) Landesprogrammen ST, MV, BE – 3242 Maßnahmen, Einordnung ohne Parteinamen, alle als **ungeprüfter KI-Entwurf**
- **Haltungen** der Quizfragen neu erfasst (weniger „keine Aussage“, Suchbegriffe bereinigt, siehe [docs/haltungen.md](docs/haltungen.md))
- **Programmtext:** doppelt gezeichneter Fettdruck wird beim Auslesen zusammengeführt (im Unionsprogramm 2025 waren 902 Zeilen verschränkt; die Suche fand dort etwa „Schuldenbremse“ nicht)

**App und Betrieb**
- Barrierefreiheit nach WCAG 2.2 AA für Handy, iPad und Desktop ([docs/barrierefreiheit.md](docs/barrierefreiheit.md))
- Duell auf Pages mit dem echten Katalog (`VITE_DATENQUELLE=katalog`, Stichwortsuche im Browser statt KI), Einstieg ins Quiz (`VITE_STARTSEITE=quiz`)
- Startseiten mit einmaligem Auftritt und animiertem Logo; PWA-Precache bis 4 MiB, damit der Katalog offline bleibt
- `.env` nicht mehr im Repository (Vorlage `.env.example`); Schlüssel wie `ELEVENLABS_API_KEY` nur in `.env.local`

## Stand: Meilenstein 1 – klickbarer Prototyp

- Startbildschirm mit Erklärung, Datenschutzhinweis und schwebender Wortwolke der erfassten Themen
- Parteiwahl für Spieler:in A und B (nicht dieselbe) plus optionale Rolle
- 5 Runden abwechselnd, Texteingabe
- Mock-Analyse im Format der späteren Edge Function `analyse` (`problem` | `forderung` | `wert`)
  - Forderung → höchstens 2 Nachfragen nach dem Alltagsproblem
  - Wert → respektvoller Hinweis, Runde wird nicht gewertet, neues Problem möglich
  - Unbekanntes Thema → „ungeprüft – keine Wertung", keine Punkte, keine Links, Review-Warteschlange
- Deterministische Punktevergabe aus Mock-Daten (3 Themen: Arzttermine, Miete, Energiepreise)
- Auflösung mit Maßnahme, Punktzahl, Begründung, Beleg-Links und bester Partei insgesamt
- Endbildschirm mit Gesamtsieger, Rundenübersicht mit Links und Teilen-Button

> **Mock-Daten:** Parteien („Partei Alpha" … „Partei Epsilon"), Maßnahmen, Punkte und Links (`example.org`) sind **fiktiv**. Echte Parteien kommen erst mit geprüften, belegten Daten hinzu – so entsteht keine ungeprüfte Bewertung realer Parteien.

## Stand: Meilenstein 2 – Push-to-talk

- Großer Mikrofon-Knopf: gedrückt halten, sprechen, loslassen (Maus, Touch oder Leertaste/Enter)
- Web Speech API (`de-DE`), Live-Anzeige des erkannten Texts; nach dem Loslassen landet der Text im Eingabefeld und kann vor dem Senden korrigiert werden
- Hinweis unter dem Knopf, dass der Browser-Dienst (bei Chrome Google-Server) die Erkennung übernimmt. Audio wird nie gespeichert. (Die lokale Erkennung per `SpeechRecognition.available()` ist bewusst nicht eingebaut: Der Aufruf hing bzw. stürzte in Tests mit Chromium ab.)
- Verständliche Fehlermeldungen (kein Mikrofon, keine Freigabe, nichts gehört …); ohne Unterstützung bleibt die Texteingabe

## Stand: Meilenstein 3 – Supabase und KI

- Datenbankschema mit Row Level Security (`supabase/migrations/`): App liest nur Stammdaten und freigegebene Probleme, geschrieben wird ausschließlich über die Edge Function
- Seed-Daten aus den fiktiven Beispieldaten (`npm run seed` → `supabase/seed.sql`)
- Edge Function `analyse` (`supabase/functions/analyse/`): Mistral ordnet die Äußerung ein (striktes JSON), die Antwort wird streng geprüft (nur IDs aus dem Katalog, keine Links, höchstens zwei Nachfragen)
- Punkte berechnet dieselbe Logik in App und Funktion (`supabase/functions/_shared/bewertung.ts`) – die KI vergibt keine Punkte
- Abgeschlossene Runden werden anonym gespeichert (nur neutrale Kurzfassung); unbekannte Themen landen in `review_warteschlange` mit vorläufiger Einschätzung; Runden ohne Wertung (auch Grenzfälle) zusätzlich im Wortlaut in `review_eingaben` (nur Admins, gelöscht beim Sichten oder nach 30 Tagen)
- Rate-Limit pro zufälliger Sitzungs-ID
- Ohne Supabase-Verbindung: „Mit Beispieldaten spielen“ bzw. `VITE_DATENQUELLE=mock`; echter Katalog aus `daten/` mit KI-Entwürfen und Stichwortsuche statt KI: `VITE_DATENQUELLE=katalog` (so auf GitHub Pages)
- Startseite: `VITE_STARTSEITE=quiz` öffnet beim Aufruf ohne Unterseite das Programm-Quiz (so auf GitHub Pages), sonst das Duell

## Stand: Meilenstein 4 – Wortwolke und Moderation

- Wortwolke auf dem Startbildschirm mit d3-cloud: die angelegten Themen mit belegten Ursachen, die für alle Parteien erfasst sind (keine Spielereingaben; noch nicht erfasste Themen fehlen), Größe nach Zahl der Ursachen, langsames Schweben; im Spiel in den Rändern neben der Spielspalte. Ursprünglich zeigte sie freigegebene Stichwörter; diese werden weiter gespeichert und moderiert, aber nicht mehr angezeigt
- Die KI liefert pro Problem ein neutrales Stichwort (1–3 Wörter); öffentlich wird es erst nach Freigabe
- Automatischer Filter (`supabase/functions/_shared/moderation.ts`): Beleidigungen, Hetze/Gewalt, Namen mit Anrede, Kontaktdaten und Links → „Vom Filter gestoppt“
- Admin-Ansicht unter `#/admin` (Supabase Auth, nur Konten in `admins`): Stichwort anpassen, freigeben, ablehnen, zurückziehen, löschen; Review-Warteschlange für neue Themen abhaken
- Zugriffsregeln: Admins dürfen nur die Moderationsfelder ändern (nicht Punkte, Parteien oder Texte); anon sieht weiter nur Freigegebenes

## Stand: Meilenstein 5 – Rechtliches, Rate-Limit, Deployment

- Datenschutzerklärung (`#/datenschutz`) und Impressum (`#/impressum`), verlinkt in der Fußzeile jedes Bildschirms; ein laufendes Spiel bleibt beim Öffnen erhalten
- Betreiberangaben zentral in `src/rechtliches/betreiber.ts` – solange Platzhalter drinstehen, zeigen beide Seiten einen Entwurfs-Hinweis
- Ausdrückliche Einwilligung vor dem Spielstart (Art. 9 DSGVO: Eingaben können politische Meinungen erkennen lassen)
- Rate-Limit zweistufig: pro Sitzung (40 / 30 min) und global über alle Sitzungen (Standard 600 / h, Secret `RATE_LIMIT_GLOBAL`) als Kostendeckel – ohne IP-Adressen; Anfragen über 8 KB werden abgelehnt
- Optional nur Aufrufe von der eigenen Website (Secret `ERLAUBTE_URSPRUENGE`, mit `*` für Vercel-Vorschauen)
- Seite „So bewerten wir“ (`#/methode`): Skalen für Wirksamkeit und Umsetzbarkeit, Punkteregeln, was die Punkte bedeuten, Fehler melden – verlinkt in Fußzeile, Auflösung und Endbildschirm
- Äußerungsrechtlich vorsichtige Formulierungen: 0 Punkte heißt „Im Wahlprogramm (Stand …) keine Maßnahme zu diesen Ursachen gefunden“
- Parteinamen in KI-Antworten (Kurzfassung, Stichwort, Einschätzung, Nachfrage) werden durch „[Partei]“ ersetzt bzw. entfernt – Aussagen über Parteien kommen nur belegt aus der Datenbank
- Installierbar als PWA: Service Worker (`vite-plugin-pwa`) speichert nur die App-Dateien, damit sie auch ohne Netz startet; Supabase- und KI-Anfragen laufen immer live und werden nie zwischengespeichert
- `vercel.json`: Build-Einstellungen und Sicherheits-Header (Content-Security-Policy, HSTS, `Referrer-Policy: no-referrer`, Mikrofon nur für die eigene Seite), lange Cache-Zeiten für Assets

**Einrichten:** siehe [supabase/EINRICHTEN.md](supabase/EINRICHTEN.md).

## Programm-Quiz „Wer sagt Ja?“ (`#/quiz`)

Zweiter Spielmodus ohne Datenbank und ohne KI (Plan und rechtliche Einordnung: [docs/plan-quiz.md](docs/plan-quiz.md)):

- Bis zu acht Personen raten, welche Parteien im Wahlprogramm zu einer Frage Ja (oder Nein) sagen – Einzel- oder Mehrfachauswahl, schnellere richtige Antworten bringen mehr Punkte (bis 1000 je Frage); allein üben geht auch
- Fragen aus den geprüften Haltungen: `npm run quiz:erzeugen` schreibt `public/quiz/fragen.json`; mit `-- --entwuerfe` zusätzlich eine lokale Fassung mit KI-Entwürfen (`fragen-entwurf.json`, nicht im Repository; ins Build nur mit `VITE_QUIZ_ENTWUERFE=true`, so auf der Pages-Testversion)
- Browser zu Browser per WebRTC; den Verbindungsaufbau vermittelt die Firebase Realtime Database (`VITE_FIREBASE_DATABASE_URL`, per REST ohne SDK, jede Nachricht wird nach dem Lesen gelöscht – siehe [firebase/README.md](firebase/README.md)), die auch weiterleitet, wenn keine Direktverbindung zustande kommt. Ohne Firebase-Adresse übernimmt ein Supabase-Realtime-Kanal; ohne beides funktionieren Räume zwischen Tabs desselben Browsers
- Optional `VITE_STUN_URLS` (z. B. `stun:stun.example.eu:3478`) für Direktverbindungen übers Internet – die Datenschutzerklärung nennt den Server dann automatisch

## Datenkatalog

- **Echte Parteien:** CDU/CSU, SPD, Grüne, FDP, AfD, Linke, BSW, Volt mit ihren Wahlprogrammen zur Bundestagswahl 2025, dazu Landesprogramme für Sachsen-Anhalt, Mecklenburg-Vorpommern und Berlin (`daten/parteien.json`). Für alle 37 Themen sind Maßnahmen aller Parteien erfasst – als KI-Entwurf, bis Menschen sie prüfen (im Spiel nur in der Testphase bzw. auf der Pages-Testversion)
- Jede Maßnahme mit wörtlichem Zitat und Seitenanker; `npm run pruefliste` erzeugt je Thema eine Prüfliste (Bewertung ohne Parteinamen, dann Belege)
- „Mit Beispieldaten spielen“ und die Tests nutzen die fiktiven Daten in `daten/beispiel/`; der Hinweis auf Platzhalterdaten erscheint nur dann


- Alle Parteien, Themen, Ursachen und Maßnahmen liegen als JSON in [`daten/`](daten/README.md) – Änderungen per Pull Request mit Quellenpflicht
- Automatische Prüfung (`npm run daten:pruefen`, auch in GitHub Actions): Pflichtfelder, Wertebereiche, Beleg mit Seitenanker im Programm der richtigen Partei, Quelle für jede Ursache, keine Platzhalter-Links bei echten Daten
- **Abdeckung:** Pro Thema steht bei einer erfassten Partei entweder eine Maßnahme oder ausdrücklich „keine Maßnahme im Programm“ – so lässt sich „nichts im Programm“ von „noch nicht erfasst“ unterscheiden. Fehlt eine Partei noch, gilt das Thema für sie als „noch nicht erfasst“
- **37 Themen mit belegten Ursachen:** Auswahl nach den meistgenannten Problemen vor den Wahlen 2026 in Sachsen-Anhalt, Mecklenburg-Vorpommern und Berlin; jede Ursache mit unabhängiger Quelle (Destatis, BBSR, Sachverständigenräte, IAB, DIW, BKA u. a.) ([Themenauswahl](daten/README.md#themenauswahl))
- Bei echten Daten kommt ein Thema für eine Partei erst ins Spiel, wenn der ganze Eintrag geprüft ist (`geprueft: true`); ungeprüfte Entwürfe bleiben im Repo und kommen nicht in die Datenbank
- **Anzeige im Spiel** (Tabelle `abdeckung`): „keine Maßnahme zu diesen Ursachen“, „nichts zum Thema im Programm“ (mit Begründung, was durchsucht wurde) oder „noch nicht erfasst“ – im letzten Fall wird die Runde nicht gewertet, damit fehlende Daten keiner Partei einen Punkt kosten; die beste Lösung aller Parteien vergleicht nur erfasste Parteien
- Einträge, die älter als das aktuelle Programm einer Partei sind, werden zur Neuprüfung gemeldet
- Bewertungsmaßstab für Wirksamkeit und Umsetzbarkeit (0–3) und Ablauf für neue Themen: [`daten/README.md`](daten/README.md)

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver
npm test         # Tests: Analyse, Bewertung, KI-Prüfung, Datenbank (PGlite)
npm run lint
npm run build
npm run daten:pruefen  # Datenkatalog prüfen (mit -- --links auch alle Links abrufen)
npm run seed       # supabase/seed.sql und seed-teile/ aus daten/ erzeugen
npm run pruefliste # Prüflisten je Thema nach pruefung/ (mit -- <Themen-ID> nur eines)
npm run dashboard  # Dateien zum Einfügen im Supabase-Dashboard neu erzeugen
```

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `supabase/migrations/` | Datenbankschema, Zugriffsregeln, Rate-Limit |
| `daten/` | Datenkatalog: Parteien, Themen, Ursachen, Maßnahmen (JSON, Anleitung in `daten/README.md`) |
| `scripts/` | Prüfung des Katalogs, Seed- und Dashboard-Erzeugung |
| `supabase/seed.sql` | Seed-Daten (erzeugt aus `daten/`) |
| `supabase/seed-teile/` | Dieselben Seed-Daten je Thema, für den SQL Editor im Dashboard |
| `supabase/dashboard/` | Erzeugte Dateien zum Einfügen im Dashboard (SQL komplett, Edge Function als eine Datei) |
| `supabase/functions/analyse/` | Edge Function: KI-Einordnung und Speichern der Runde |
| `supabase/functions/_shared/` | Gemeinsamer Code von App und Funktion: Typen, Punktelogik, KI-Prompt und -Prüfung, Moderationsfilter |
| `src/data/quelle.ts` | Datenquelle der App: Supabase oder Beispieldaten |
| `src/data/katalog.ts` | Prüfregeln und Aufbau des Datenkatalogs |
| `src/data/mock.ts` | Eingebaute Daten der App (aus `daten/`, derzeit fiktiv) |
| `src/logic/analyse.ts` | Offline-Ersatz für die KI (Schlagwörter) |
| `src/logic/sprache.ts` | Hook für die Spracherkennung (Push-to-talk) |
| `src/components/` | Bildschirme: Start (mit Wortwolke), Setup, Runde, Auflösung, Ende |
| `src/data/wortwolke.ts` | Wörter der Wortwolke (erfasste Themen) |
| `src/admin/` | Admin-Ansicht zur Moderation (`#/admin`, eigenes Bundle) |
| `src/rechtliches/` | Impressum, Datenschutzerklärung und Betreiberangaben |
| `vercel.json` | Deployment: Build und Sicherheits-Header |

## Bewertungsregeln im Prototyp

- Punkte je Maßnahme: `wirksamkeit × umsetzbarkeit` (0–9); der Rollen-Modifikator verschiebt die Wirksamkeit (0–3). Pro zugeordneter Ursache zählen die verschiedenen Lösungswege der Partei mit abnehmendem Gewicht (bester voll, dann ½, ¼ …), höchstens 9 je Ursache. Rundenpunkte = Summe.
- Höhere Summe → 1 Spielpunkt, Gleichstand → je 1 Punkt.
- Annahme: Haben **beide** Parteien 0 Punkte (keine Maßnahme), gibt es keinen Punkt.
- Die Rolle der Person, die das Problem nennt, gilt für die Bewertung beider Parteien.

## Lizenz

- **Quellcode:** [GNU Affero General Public License 3.0 oder später](LICENSE) (AGPL-3.0-or-later). Wer eine veränderte Fassung öffentlich betreibt, muss deren Quellcode ebenfalls offenlegen.
- **Datenkatalog** (`daten/`): [Creative Commons Namensnennung 4.0](daten/LICENSE) (CC BY 4.0). Namensnennung: „Politik-Duell (politik-duell.de)“ mit Link auf die Lizenz.
- **Nicht** von den Lizenzen erfasst: wörtliche Zitate aus Wahlprogrammen und die verlinkten Programme und Studien (Rechte bei den jeweiligen Urheber:innen, Zitate nach § 51 UrhG) sowie Bibliotheken von Dritten (eigene Lizenzen, siehe `package.json`).
