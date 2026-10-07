# Firebase Realtime Database für das Programm-Quiz

Das Quiz (`#/quiz`, [docs/plan-quiz.md](../docs/plan-quiz.md)) braucht einen Dienst, über den sich die Browser
finden. In diesem Fork ist das die **Firebase Realtime Database** im kostenlosen Spark-Tarif (keine Abrechnung,
also keine Kosten möglich). Die App spricht sie über REST und Server-Sent Events an – **ohne Firebase-SDK**, damit
im Browser nichts gespeichert wird.

## Eingerichtet (7. 10. 2026)

| | |
| --- | --- |
| Projekt | `politik-duell-quiz` (ohne Google Analytics, ohne Gemini) |
| Datenbank | `https://politik-duell-quiz-default-rtdb.europe-west1.firebasedatabase.app` |
| Standort | Belgien (`europe-west1`) |
| Regeln | [`database.rules.json`](database.rules.json) – in der Konsole unter *Realtime Database → Rules* eingetragen |
| App | `VITE_FIREBASE_DATABASE_URL` in `.env` (öffentlich; Schutz über die Regeln) |

## Datenmodell

```
quiz/<Raumcode>/an/<Empfänger>/<Nachricht> = { s: "<Signal als JSON, ≤ 60 000 Zeichen>", t: <Serverzeit> }
```

- Empfänger: `leitung` (Spielleitung) oder die zufällige ID eines Gasts (16 Hex-Zeichen).
- Jedes Gerät liest nur sein Postfach und löscht jede Nachricht sofort nach dem Lesen.
- Beim Schließen und beim Verlassen der Seite (`pagehide`, `fetch` mit `keepalive`) löscht ein Gast sein Postfach
  und seine ungelesenen Nachrichten, die Spielleitung den ganzen Raum.
- Reste nach einem harten Abbruch löscht die GitHub Action [`quiz-aufraeumen.yml`](../.github/workflows/quiz-aufraeumen.yml)
  täglich (alles älter als eine Stunde).

## Was die Regeln erlauben

- Lesen: nur ein einzelnes Postfach mit gültigem Raumcode und Empfänger. Räume oder die Raumliste lassen sich nicht
  auflisten.
- Schreiben: neue Nachrichten mit genau `s` (Text, höchstens 60 000 Zeichen) und `t` (= Serverzeit); vorhandene
  Nachrichten lassen sich nicht überschreiben. Löschen ist innerhalb eines gültigen Raums erlaubt.
- Alles andere ist gesperrt. Geprüft per REST: 2 erlaubte Fälle gehen, 9 Missbrauchsfälle werden abgelehnt (401).

Wer den Raumcode kennt, kann die Verbindungsnachrichten des Raums lesen oder ihn löschen – der Code ist das
Geheimnis des Raums (sechs Zeichen, rund 900 Millionen Möglichkeiten, nur im Hash der Adresse).

## Aufräumen einrichten (einmalig)

1. Firebase-Konsole → *Projekteinstellungen → Dienstkonten → Datenbank-Secrets* → Secret anzeigen und kopieren.
2. Im Terminal (das Secret nicht in Chats oder Dateien einfügen):
   `gh secret set FIREBASE_DATABASE_SECRET --repo ma3u/politik-duell`
3. In einem Fork sind GitHub Actions anfangs aus: *Actions* → „I understand my workflows, go ahead and enable them“.
4. Probe: *Actions → Quiz aufräumen → Run workflow*.

Ohne Secret läuft die Action, tut aber nichts.

## Grenzen des Spark-Tarifs

100 gleichzeitige Verbindungen, 1 GB Speicher, 10 GB Download im Monat. Jede Verbindung zur Datenbank besteht nur
beim Verbindungsaufbau (bei der Weiterleitung das ganze Spiel). Ist das Kontingent erschöpft, schlägt das Eröffnen
von Räumen fehl, Kosten entstehen nicht. Gegen Missbrauch (Fremde schreiben Unsinn in Räume) schützen nur die
Regeln; Firebase App Check würde reCAPTCHA von Google laden und ist deshalb bewusst nicht eingerichtet.
