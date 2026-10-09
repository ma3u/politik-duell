# Projekt: „Politik-Duell"

Slogan: *„Versprechen kann jeder."* Webspiel: Spielende nennen Alltagsprobleme, das Spiel zeigt, welche Partei dafür die **wirksamste und umsetzbare** Lösung bietet – mit Beleg-Link. Volle Spezifikation (Spielablauf, Datenmodell, KI-Schnittstelle, Branding, offene Punkte): [docs/projekt.md](docs/projekt.md) – bei Arbeit an Spiellogik, Datenmodell oder Texten dort nachlesen.

## Grundprinzipien (nicht verhandelbar)

1. **Neutrale Methode, kein vorgegebenes Ergebnis.** Alle Parteien werden nach denselben Kriterien bewertet. Bietet eine Partei nachweislich die beste Lösung, gewinnt sie – egal welche.
2. **Die KI vergibt keine Punkte.** Sie führt nur das Gespräch und ordnet Probleme Themen/Ursachen zu. Punkte kommen deterministisch aus der kuratierten Datenbank. (KI-gestützte Entwürfe im Datenkatalog sind erlaubt, gekennzeichnet und zählen erst nach menschlicher Prüfung – außer in einer geschlossenen Testphase mit deutlichem Hinweis am Ergebnis.)
3. **Die KI erfindet niemals Quellen oder Links.** Alle Belege stammen ausschließlich aus der Datenbank.
4. **Forderung ≠ Problem.** Nennt ein Spieler eine Forderung („weniger X"), fragt die KI nach dem konkreten Alltagsproblem dahinter.
5. **Datenschutz:** Politische Meinungen sind besondere Daten (Art. 9 DSGVO). Keine Konten, keine IPs, kein Audio speichern – nur anonymen Problemtext. Ausnahme: Runden ohne Wertung (auch `grenze`) landen im Wortlaut in `review_eingaben` – nur Admins, ohne Parteien, gelöscht beim Sichten oder nach 30 Tagen. Im Browser nur der Zugang zur geschlossenen Testphase (localStorage).

## Kurz zur Logik

- Punkte je Maßnahme = `wirksamkeit × umsetzbarkeit` (je 0–3); je Ursache Lösungswege mit abnehmendem Gewicht (1, ½, ¼ …, höchstens 9). Höhere Summe gewinnt die Runde. Thema für eine Partei **nicht erfasst** (`abdeckung`) → Runde ohne Wertung; fehlende Daten kosten keiner Partei einen Punkt. Details: `docs/methode.md`.
- KI-Klassifikation: `problem | forderung | wert | grenze`, striktes JSON, Temperatur 0,1, Aufruf nur aus der Edge Function `analyse` (Schlüssel nie im Frontend).
- Parteien: CDU/CSU, SPD, Grüne, FDP, AfD, Linke, BSW, Volt; Bundesprogramme 2025, Landesprogramme ST, MV, BE.

## Befehle

```bash
npm run dev | build | lint | test        # App (React + Vite + TS), Tests mit Vitest
npm run daten:pruefen                    # Datenkatalog prüfen (daten/*.json)
npm run zitate:pruefen                   # jedes Zitat gegen die PDF-Seite
npm run seed && npm run dashboard        # supabase/seed.sql, seed-teile/, dashboard/ neu erzeugen
npm run quiz:erzeugen [-- --entwuerfe]   # Fragen für das Quiz „Wer sagt Ja?“ (eigenes Repository ma3u/wer-sagt-ja)
```

Erfassung von Themen und Haltungen nur über die Skills (`.claude/skills/README.md`).

## Verzeichnisse

`src/` App · `daten/` Katalog als JSON (Parteien, Themen, Haltungen, Leitfäden, Protokolle) · `scripts/` Erfassung, Prüfungen, Generatoren · `supabase/` Schema, Edge Functions, Seed · `docs/` Methode, Pläne, Barrierefreiheit · `.claude/` Skills, Agenten, Sperr-Hook.

## Stolperfallen

- **Nur auf den Fork pushen** (`origin` = ma3u/politik-duell), nie in den Upstream. Schlüssel nur in `.env.local`, vor jedem Commit auf `sk_…` prüfen.
- **Neutralität beim Erfassen:** Die Koordination liest keine Programme und ändert keine Einordnung; Suchbegriffe gleich für alle, kein Suchbegriff in einem Parteinamen; Bewertung und Einordnung nur ohne Parteinamen.
- **KI-Entwürfe** (`ki_entwurf`) erscheinen nur in der Testphase bzw. auf Pages (`VITE_DATENQUELLE=katalog`), immer mit Hinweis.
- **Barrierefreiheit** WCAG 2.2 AA (`docs/barrierefreiheit.md`): neue Ansichten mit `useAnsicht`, Bedienelemente mit `--rand-bedien`, Zielflächen ≥ 24 px, Zeitlimits einstellbar.
- **Lokale Vorschau** der Pages-Fassung braucht `BASIS_PFAD=/politik-duell/` (Build und `vite preview`); der Service Worker liefert danach alte Fassungen, bis er neu registriert ist.
