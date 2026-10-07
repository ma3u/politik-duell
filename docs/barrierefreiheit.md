# Barrierefreiheit (WCAG 2.2 AA)

Stand: 7. 10. 2026 · Geprüft: Duell (Start, Parteiwahl, Runde, Auflösung, Endstand), Programm-Quiz (Start, Raum,
Frage, Auflösung, Ergebnis), Themen & Zahlen, Methode, Datenschutz, Impressum – jeweils auf Handy (390 px und
320 px), iPad hoch (820 × 1180) und quer (1180 × 820) und Desktop (1366 × 900).

## Umgesetzt

| WCAG | Was | Wo |
| --- | --- | --- |
| 1.3.5 | Namensfeld im Quiz mit `autocomplete="nickname"` | `src/quiz/Quiz.tsx` |
| 1.4.11 | Ränder von Feldern, Auswahllisten, Ursachen-Chips und leisen Knöpfen mit mindestens 3:1 (`--rand-bedien`) | `src/index.css` |
| 2.2.1 | Zeit je Quizfrage vor dem Start einstellbar: normal, doppelt oder ohne Zeitlimit (dann ohne Tempobonus; die Spielleitung kann „Jetzt auflösen“) | `src/quiz/punkte.ts`, `spielleitung.ts`, `Ansicht.tsx` |
| 2.2.2 | „Bewegung anhalten“ in jeder Fußzeile: Wortwolke und Animationen stehen still (wie „Bewegung reduzieren“, das weiter automatisch gilt); nur im Arbeitsspeicher, nichts im Browser gespeichert | `src/barrierefrei.ts`, `Fusszeile.tsx` |
| 2.4.2 | Eigener Seitentitel je Ansicht („Frage 2 von 5 – Politik-Duell“) | `useAnsicht` |
| 2.4.3, 4.1.3 | Beim Wechsel der Ansicht springt der Fokus auf die neue Überschrift (erst nach der ersten Eingabe, nicht beim Laden); nach dem Schließen einer Unterseite zurück zum auslösenden Link | `useAnsicht`, `useFokusZurueck` |
| 2.4.11 | Der klebende Punktestand verdeckt den Fokus nicht (`scroll-padding-top`) | `src/index.css` |
| 2.5.3 | Sichtbarer Name steht im zugänglichen Namen (Balken- und Graph-Knöpfe auf „Themen & Zahlen“) | `Themenstand.tsx`, `Zusammenhaenge.tsx` |
| 2.5.8 | Zielflächen mindestens 24 px: Aufklapper, Fußzeilen-Links, Beleg-Links | `src/index.css` |
| 3.3.2 | Hinweise: „Ein Tipp auf eine Partei gibt die Antwort ab“, Format des Raumcodes | `Ansicht.tsx`, `Quiz.tsx` |
| 4.1.3 | Zeitansage für Screenreader nur bei 10 und 5 Sekunden und bei Ablauf (statt jeder Sekunde) | `Zeitleiste` |
| 1.4.2 | Quiz-Show: „Ton aus“ in der Kopfzeile für Sprache und Geräusche | `src/quiz/show/Buehne.tsx` |
| 1.2.1 | Untertitel aller Ansagen der Moderatoren (die Inhalte stehen zusätzlich als Text auf der Seite) | `UntertitelLeiste` |
| 2.3.1, 2.2.2 | Show-Animationen ohne Blinken, kurz; sie ruhen bei „Bewegung anhalten“ und „Bewegung reduzieren“ (jetzt auch Übergänge); Sichtbarkeit hängt nie am Ende einer Animation | `src/index.css` („Quiz-Show“) |

Schon vorher erfüllt: `lang="de"`, Beschriftungen aller Felder, sichtbarer Fokus (`:focus-visible`), Bedienung
ohne Maus, Spracheingabe mit Tastatur und Texteingabe als Alternative, keine Information nur über Farbe (Parteien
immer mit Namen, Treffer mit ✓/✗ und Text), Ausrichtung frei, `prefers-reduced-motion`.

## Wie geprüft

- **axe-core 4.14** (Regeln `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) in Headless-Chrome in allen
  Ansichten und fünf Größen: keine Verstöße außer einem Fehlalarm (s. u.).
- **Eigene Prüfungen:** Zielgröße 24 × 24 px, waagerechter Überlauf (Umfließen bei 320 px, 1.4.10),
  Textabstände nach 1.4.12 (Zeilenhöhe 1,5, Buchstaben 0,12 em, Wörter 0,16 em, Absätze 2 em: nichts abgeschnitten).
- **Tastatur:** echte Tab-, Leer- und Enter-Tasten über das DevTools-Protokoll. Jedes fokussierte Element hat einen
  sichtbaren Rahmen; eine Quizfrage lässt sich vom Start bis zur Auflösung nur mit der Tastatur spielen.

## Bekannte Grenzen

- **Fehlalarm** `label-content-name-mismatch` im Graphen auf „Themen & Zahlen“: axe zählt die (für Screenreader
  versteckte) Zahl im Knoten zum sichtbaren Text. Der Name beginnt mit dem sichtbaren Themennamen.
- Knoten im Graphen lassen sich ziehen; Ziehen ändert nur die Anordnung, alle Funktionen gehen auch per Knopf und
  Tastatur (Zoom-Knöpfe, Enter/Leertaste).
- **Nicht geprüft:** echte Screenreader (VoiceOver auf iPhone/iPad/Mac, TalkBack, NVDA) und Tests mit Menschen mit
  Behinderung. Automatische Werkzeuge finden nur einen Teil der Probleme – vor einer Veröffentlichung einmal mit
  VoiceOver und NVDA durchspielen.
- Im Mehrspieler-Quiz stellt die Spielleitung die Zeit für alle ein; wer mehr Zeit braucht, sagt es ihr vor dem
  Start (oder übt allein mit eigener Einstellung).
