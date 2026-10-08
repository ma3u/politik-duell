# Plan: Programm-Quiz „Wer sagt Ja?“

Stand: 7. 10. 2026 · Status: **Vorschlag, umgesetzt als erste Fassung** (Entscheidungen Q1–Q6 unten offen)

## Ziel

Ein zweiter Spielmodus neben dem Duell: Mehrere Personen treten gegeneinander an und raten, **welche Parteien in ihrem Wahlprogramm** zu einer Frage Ja (oder Nein) sagen. Wer richtig liegt, bekommt Punkte, wer schneller antwortet, mehr. Nach jeder Frage zeigt das Spiel für alle sieben Parteien die Stelle im Programm (Kurzfassung, Wortlaut, Link mit Seitenanker).

Bildungsziel: Programme kennenlernen, nicht Meinungen bewerten. Punkte gibt es für Wissen über Programme, **nie für eine eigene Haltung**.

Leitplanken aus dem Projekt bleiben: neutrale Methode, keine KI im Spiel, keine erfundenen Quellen, Datensparsamkeit.

## Kurzfassung der Entscheidungen

| Frage | Lösung |
| --- | --- |
| Woher kommen die Aussagen? | Aus den Haltungen (`daten/haltungen/`): Dort steht je Wertfrage die Position **aller sieben** Bundesprogramme mit Zitat und Seitenanker – auch „keine Aussage im Programm“, nach Durchsuchen belegt. Nur so ist auch die *falsche* Antwort belegt. |
| JSON-Liste | `npm run quiz:erzeugen` schreibt daraus `public/quiz/fragen.json` (nur geprüfte Positionen). Gepflegt wird weiter in `daten/haltungen/` mit dem bestehenden Prüfablauf; die Liste ist abgeleitet und wird in CI auf Aktualität geprüft. |
| Datenbank? | Keine. Die Fragen sind eine statische Datei, das Spiel läuft im Browser. |
| Verbindung | WebRTC-Datenkanal Browser zu Browser. Für den Verbindungsaufbau (Signalisierung) dient in diesem Fork die **Firebase Realtime Database** (Spark-Tarif, Belgien, per REST ohne SDK): Postfach je Gerät, jede Nachricht wird nach dem Lesen gelöscht ([`firebase/README.md`](../firebase/README.md)). Ohne Firebase-Adresse ein flüchtiger Supabase-Realtime-Kanal (Broadcast). Klappt keine direkte Verbindung, leitet derselbe Weg die Spielnachrichten weiter. |
| Antwortarten | **Einzelauswahl**, wenn genau eine Partei klar Ja (bzw. Nein) sagt; sonst **Mehrfachauswahl**. |
| Tempo | Bis zu 1000 Punkte je Frage: Anteil richtig × (500 + 500 × verbleibende Zeit). |
| KI-Entwürfe | Öffentlich nur geprüfte Positionen. Entwürfe nur lokal (`npm run quiz:erzeugen -- --entwuerfe`), mit Hinweis im Spiel. |

## Rechtliche Einordnung: Was darf zwischengespeichert werden?

> **Keine Rechtsberatung.** Das ist eine sorgfältige Einschätzung nach deutschem Recht zur Planung. Vor einer breiten Veröffentlichung (oder einer Förderung durch öffentliche Stellen) sollte eine Anwältin bzw. ein Anwalt für Urheber- und Medienrecht drüberschauen – etwa über den Verein oder eine Landeszentrale für politische Bildung.

### 1. Urheberrecht an den Wahlprogrammen

- Wahlprogramme sind **urheberrechtlich geschützte Sprachwerke** (§ 2 Abs. 1 Nr. 1 UrhG). Sie sind **keine amtlichen Werke** (§ 5 UrhG), weil Parteien keine Behörden sind. Dass die Parteien sie frei ins Netz stellen, ist keine Lizenz zum Kopieren.
- **Erlaubt ohne Zustimmung:**
  - **Eigene Kurzfassungen** („Will ein Tempolimit von 130 km/h einführen“). Inhalte, Ideen und Forderungen sind nicht geschützt, nur die konkrete Formulierung. Die Quizfrage selbst arbeitet deshalb nur mit eigenen Worten (Frage der Haltung, Kurzfassung).
  - **Kurze wörtliche Zitate als Beleg** (Zitatrecht, § 51 UrhG). Voraussetzung ist ein *Zitatzweck*: Das Zitat muss eigene Ausführungen belegen oder Grundlage einer Auseinandersetzung sein, nicht bloß Inhalt „für sich“ liefern. Im Quiz belegt das Zitat in der Auflösung die eigene Aussage „Partei X sagt Ja“ – genau dafür ist das Zitatrecht da. **Deshalb steht das Zitat nicht als Rätseltext in der Frage, sondern als Beleg in der Auflösung.**
  - Pflichten dabei: Quelle angeben (§ 63 UrhG – Partei, Programm, Seite, Link), nicht verändern (§ 62 UrhG – Auslassungen mit „…“ kennzeichnen, nichts umformulieren), nur so viel wie für den Beleg nötig (ein bis zwei Sätze).
  - **Links mit Seitenanker** (`…pdf#page=36`) auf frei zugängliche Programme sind keine Vervielfältigung und keine eigene Veröffentlichung (EuGH, *Svensson*, C-466/12; *BestWater*, C-348/13).
- **Erlaubt mit Einschränkung – Zwischenspeicher der PDFs zur Auswertung:** Die PDFs vorübergehend herunterzuladen, um Zitate zu finden und Seiten zu prüfen, ist als Text und Data Mining zulässig (§ 44b UrhG; bei wissenschaftlicher Forschung § 60d), solange die Programme rechtmäßig frei zugänglich sind und kein maschinenlesbarer Nutzungsvorbehalt besteht. Die Kopien sind zu löschen, wenn sie nicht mehr gebraucht werden. Das Projekt macht das schon so: nur in `.cache/` (in `.gitignore`), nie im Repository.
- **Nicht erlaubt ohne Zustimmung:**
  - Ganze Programme oder lange Abschnitte ins Repository, in die App, in den Offline-Speicher (Service Worker) oder von Browser zu Browser weitergeben.
  - Zitate umschreiben und trotzdem als Wortlaut ausgeben, oder Zitate ohne Quelle zeigen.
  - Parteilogos verwenden (Marken- und Urheberrecht). Namen und Farben als Kennzeichnung sind in Ordnung; das Projekt nutzt bereits keine Logos.
- **Unsere JSON-Liste** (Auswahl, Struktur, Kurzfassungen, Einordnungen) ist eigene Leistung und steht unter CC BY 4.0 (`daten/LICENSE`). Die Zitate darin sind davon ausgenommen – das steht schon in `README.md` und `daten/README.md`.
- **Zwischenspeichern der JSON-Liste** im Browser (Service Worker, damit das Quiz offline startet) ist unproblematisch: Sie enthält nur Kurzfassungen, kurze Belegzitate und Links – dieselben Inhalte, die die Seite ohnehin zeigt.

### 2. Neutralität und Chancengleichheit

- Der Fall Wahl-O-Mat (VG Köln, Beschluss vom 20. 5. 2019, 6 L 1056/19) zeigt: Öffentliche Stellen müssen Parteien chancengleich behandeln (Art. 21 GG, § 5 PartG). Für ein privates Projekt gilt das nicht unmittelbar, wird aber wichtig, sobald öffentliche Fördermittel fließen. Das Quiz hält sich deshalb an dieselben Regeln wie die Haltungskarte: alle sieben Parteien, gleiche Darstellung, feste Reihenfolge, Fragen werden mechanisch aus dem Katalog erzeugt (keine redaktionelle Auswahl, welche Partei „auffällt“).
- Welche Parteien dabei sind, ist schon entschieden (docs/projekt.md → Offene Punkte) und begründet; das sollte auf der Methodenseite für das Quiz genauso stehen.

### 3. Datenschutz

- **Antworten im Quiz** zeigen, was jemand über Programme *weiß*, nicht was er politisch *denkt*. Sie sind deshalb in der Regel keine besonderen Daten nach Art. 9 DSGVO. Trotzdem gilt: Sie gehen nur an die Geräte im Raum und werden nirgends gespeichert.
- **IP-Adressen** sind personenbezogene Daten (EuGH, *Breyer*, C-582/14). Bei einer direkten WebRTC-Verbindung erfahren die Geräte im Raum gegenseitig ihre IP-Adressen – das ist technisch unvermeidbar und muss in der Datenschutzerklärung stehen. Wer das nicht möchte, spielt über die Weiterleitung (Q3).
- **Signalisierung über Firebase:** Verbindungsangebote (SDP) und Netzwerk-Kandidaten liegen nur bis zum Lesen in der Datenbank (Sekundenbruchteile); Reste nach Abstürzen löscht eine tägliche GitHub Action (älter als eine Stunde). Anbieter ist Google Ireland (Firebase-Datenverarbeitungsbedingungen, Standort Belgien, mögliche US-Übermittlung auf Basis des Data Privacy Framework). Bewusst **ohne Firebase-SDK**: Das SDK legte im Browser eine IndexedDB (`firebase-heartbeat-database`) und einen localStorage-Eintrag an – nach § 25 TDDDG nicht unbedingt erforderlich und damit einwilligungspflichtig. Per REST und Server-Sent Events speichert die App im Browser nichts (geprüft).
- **Signalisierung über Supabase** (Alternative ohne Firebase): Broadcast-Nachrichten werden nicht gespeichert; Supabase führt kurzzeitige Verbindungsprotokolle.
- **STUN-Server:** Ohne STUN finden sich Geräte direkt nur im selben Netz (z. B. Schul-WLAN); sonst greift die Weiterleitung. Mit STUN (etwa Cloudflare, oder ein eigener Server in der EU) klappt die Direktverbindung auch übers Internet – der Betreiber des STUN-Servers sieht dann die IP-Adresse. Deshalb ist STUN standardmäßig **aus** und nur per `VITE_STUN_URLS` zuschaltbar (Q3); die Datenschutzerklärung nennt den Server automatisch.
- **Name im Quiz:** freiwillig, höchstens 20 Zeichen, nur im Arbeitsspeicher; geht nur an die Mitspielenden.
- **Raumcode:** steht im Hash der Adresse (`#/quiz/ABC234`) und geht damit nie an den Webserver.
- Kein Konto, kein Cookie, kein localStorage für das Quiz. Rechtsgrundlage für die Verbindungsdaten: berechtigtes Interesse am gewünschten Mehrspielerbetrieb (Art. 6 Abs. 1 lit. f DSGVO).

### 4. Sonstiges

- **Gewinnspielrecht:** Keine Preise, kein Einsatz – kein Glücksspiel, keine Gewinnspielpflichten.
- **Jugendschutz / Schule:** Keine Konten und keine Speicherung – für den Einsatz im Unterricht günstig. Für Klassen ist die Weiterleitung über den Server (ohne gegenseitige IP-Sichtbarkeit) die vorsichtigere Wahl.

## Fragen aus dem Katalog

Quelle: freigegebene Haltungen, für die alle sieben Bundesprogramme eine Position haben (Regel „Alle sieben oder keine“, `vollstaendigeHaltungen`). Öffentlich nur, wenn **alle sieben Positionen geprüft** sind.

Je Haltung höchstens eine Frage, mechanisch bestimmt:

| Positionen | Frage | Art | Richtig | Weder noch |
| --- | --- | --- | --- | --- |
| genau 1× `ja` | „Nur eine Partei sagt klar Ja. Welche?“ | einzeln | die Ja-Partei | – |
| ≥ 2× `ja` | „Welche Parteien sagen Ja?“ | mehrfach | alle Ja-Parteien | `teils` |
| 0× `ja`, genau 1× `nein` | „Nur eine Partei sagt klar Nein. Welche?“ | einzeln | die Nein-Partei | – |
| 0× `ja`, ≥ 2× `nein` | „Welche Parteien sagen Nein?“ | mehrfach | alle Nein-Parteien | `teils` |
| sonst | keine Frage | | | |

`keine_aussage` zählt wie die **heutige Lage** (`status_quo` der Haltung, `ja` oder `nein`): Ein Programm, das zu einer Frage nichts sagt, will daran nichts ändern – wer etwa zum Euro schweigt, steht für „behalten“. Die Positionen werden also erst auf Ja/Nein/teils abgebildet, dann greift die Tabelle; stehen danach alle Parteien auf derselben Seite, gibt es keine Frage. In der Anleitung steht der Satz „Kein Wort dazu heißt: Es bleibt, wie es ist – also Ja“, in der Auflösung „keine Aussage, zählt als Ja“. Ist die heutige Lage weder klar Ja noch klar Nein (`status_quo: "offen"`, etwa Solaranlagen auf Äckern: erlaubt, aber nur in Gebietskulissen) oder fehlt das Feld (alte Datenbankzeilen), zählt `keine_aussage` wie bisher als „nicht Ja“ bzw. „nicht Nein“. `teils` zählt bei der Mehrfachauswahl weder als richtig noch als falsch, weil „teils“ weder Ja noch Nein ist; das steht in der Frage dabei.

Format von `public/quiz/fragen.json` (Auszug):

```json
{
  "version": "3f2a9c1e",
  "entwurf": false,
  "parteien": [{ "id": 11, "name": "CDU/CSU", "kurzname": "Union", "farbe": "#8a96a3", "programm_url": "…" }],
  "fragen": [{
    "id": "h1",
    "haltung_id": 1,
    "frage": "Soll es ein generelles Tempolimit auf Autobahnen geben?",
    "beschreibung": "…",
    "art": "mehrfach",
    "gesucht": "ja",
    "status_quo": "nein",
    "richtig": [12, 13, 16],
    "neutral": [],
    "positionen": [{ "partei_id": 12, "position": "ja", "kurzfassung": "…", "zitat": "…", "beleg_url": "…#page=36", "begruendung": null }],
    "zielkonflikte": [{ "seite": "ja", "text": "…", "quelle_url": "…" }],
    "ki_entwurf": false
  }]
}
```

Warum nicht eine frei gepflegte Liste „Aussage → Parteien“? Bei einer Mehrfachauswahl ist jede *nicht* gewählte Partei auch eine Aussage („steht nicht im Programm“). Die braucht einen Beleg, dass das Programm durchsucht wurde – genau das liefern die Haltungen schon, mit Prüfung. Eine zweite Liste müsste denselben Ablauf noch einmal aufbauen. Spätere Ergänzung möglich (Q5).

## Punkte

- Einzelauswahl: richtig = Anteil 1, sonst 0.
- Mehrfachauswahl: Anteil = max(0, (Treffer − Fehlgriffe) / Zahl der richtigen). Gar nichts oder alles anzukreuzen bringt 0; `teils`-Parteien zählen nicht.
- Tempo: Faktor 0,5 bis 1 je nach verbleibender Zeit; Punkte = round(1000 × Anteil × Faktor).
- Zeit: 20 s (einzeln), 30 s (mehrfach). Bei Ablauf zählt eine schon angekreuzte, aber nicht abgegebene Auswahl mit voller Zeit.
- Zeit einstellbar (WCAG 2.2.1, [`barrierefreiheit.md`](barrierefreiheit.md)): vor dem Start normal, doppelt oder ohne Zeitlimit – dann ohne Tempobonus, und die Spielleitung kann „Jetzt auflösen“.
- Die Zeit misst jedes Gerät selbst ab Anzeige der Frage – Netzlaufzeiten benachteiligen niemanden. Die Spielleitung rechnet die Punkte. Wer schummeln will, kann das (die Lösungen stehen in der öffentlichen Datei) – bewusst hingenommen, es geht um Bildung, nicht um Preise.
- Fünf Fragen je Spiel (weniger, wenn der Katalog weniger hat), zufällige Reihenfolge.

## Ablauf

1. `#/quiz`: Name (optional), „Raum eröffnen“, „Allein üben“ oder Code eingeben.
2. Raum: Code und Link zum Teilen; bis zu acht Personen. Die eröffnende Person ist Spielleitung und spielt mit.
3. Frage: Frage, Beschreibung, Hinweis zur Antwortart, Zeitleiste, die sieben Parteien als Stimmzettelzeilen zum Ankreuzen.
4. Auflösung: alle sieben Positionen in fester Reihenfolge mit Kurzfassung, Seitenlink und Wortlaut zum Aufklappen, dazu die Zielkonflikte beider Seiten; markiert sind nur die eigenen Kreuze (Treffer/daneben), keine Ampelfarben für Positionen. Punkte der Runde und Zwischenstand.
5. Ende: Rangliste, alle Fragen mit Belegen, „Nochmal“ (Spielleitung).

## Räume: Namen, Merken, Zufall

- **Merkbare Raumnamen** („Kluge Eule 27“: Adjektiv + Tier mit Stabreim + Zahl, ohne Umlaute). Jedes Gerät berechnet daraus denselben sechsstelligen Code (`codeAusName`); alte Codes funktionieren weiter. Einladungslink `#/quiz/kluge-eule-27`.
- **Name im Spiel:** bleibt ohne Häkchen im localStorage, damit er beim nächsten Mal dasteht (Entscheidung der Betreiberin, 8. 10. 2026); leeres Namensfeld löscht ihn, Raumnamen merkt sich das Quiz nicht.
- **Raum eröffnen:** Einladungslink als QR-Code (Paket `qrcode`, im Browser als SVG erzeugt, kein externer Dienst) neben Link und „Einladen“, damit Mitspielende im selben Raum einfach abfotografieren.
- **Frage und Auflösung kompakt** (8. 10. 2026): kleinere Bühne und Zeilen, kurze Anleitung in einer Zeile; sobald das Antwortfenster offen ist, springt die Seite zur Parteienliste mit „Abgeben“ (`scrollIntoView`, ohne Animation bei „Bewegung anhalten“). In der Lösungstafel steht der Zusatz nur, wo der Stempel nichts sagt (Nein, teils, keine Aussage); Wortlaut und Seite liegen eingeklappt unter „Was in den Programmen steht“.
- **Startseite:** Name und Zeit-Knopf (Normal → Doppelt → Ohne Limit, je Tippen weiter) in einer Zeile, darunter „Mit Fremden“, „Mit Freunden“, „Alleine“; „Mit Freunden“ klappt erst den eigenen Raum (eröffnen) und das Beitreten auf.
- **Mit Zufälligen spielen:** Öffentliche Räume stehen, solange sie warten, unter `quiz-oeffentlich/<Code>` (Name, Spielerzahl, Serverzeit; Lebenszeichen alle 30 s, nach 90 s ausgeblendet, beim Start gelöscht). Beleidigende Namen (Filter aus `moderation.ts`) zeigt die Spielleitung als „Gast N“; mit einem solchen Namen kann man keinen öffentlichen Raum eröffnen oder suchen.

## Show: Moderation, Animationen, Geräusche

Inspiriert von schnellen Quizshows (kinetische Schrift, freche Moderation, Knall-Effekte), aber eigene Gestaltung im Stimmzettel-Stil – kein fremdes Logo, keine fremden Figuren.

- **Zwei erfundene Moderatoren im Dialog:** Mara (stellt die Fragen, löst auf) und Ben (sagt an, erklärt, kommentiert). Texte in `src/quiz/show/texte.ts`. Frech gegenüber den Spielenden, nie wertend gegenüber Parteien; ein Test prüft, dass Moderationstexte keine Parteinamen enthalten.
- **Ablauf je Frage** (`src/quiz/show/ablauf.ts`): Intro (nur Frage 1 des ersten Spiels) → Ansage „Frage 2!“ mit Knall → Frage Wort für Wort im Takt der Sprache → Anleitung → Antworten poppen beim Namen auf (beim ersten Mal vorgelesen) → „Los!“. Erst dann läuft die Zeit. Auflösung: Trommelwirbel → Stempel „Ja“/„Nein“ beim Nennen der Partei → Reaktion auf das eigene Ergebnis mit Punkte-Zählwerk. Ende: „Gewonnen!“ mit Konfetti, „Verloren!“ sackt zusammen, dazu Fanfare oder Posaune.
- **Synchron auf allen Geräten:** Jedes Gerät spielt die Show selbst ab, nach einem festen Zeitplan aus den Clip-Dauern (`dauerMs`). Die Spielleitung verlängert ihre Frist um den Vorspann; das Antwortfenster der Gäste endet zum selben Zeitpunkt. Gemessen: Antwortfenster öffnen sich auf zwei Geräten im Abstand von wenigen Millisekunden.
- **Aufnahmen:** `npm run quiz:stimmen` erzeugt mit ElevenLabs (Voice Design für zwei neue Stimmen, `eleven_v3` mit Zeitstempeln je Zeichen, Sound Effects) alle Clips nach `public/quiz/audio/` samt `manifest.json` (Dauer, Wortzeiten). Unveränderte Clips werden übersprungen. Der Schlüssel liegt nur in `.env.local`. Erster Lauf: 89 Clips (4470 Zeichen), 12 Geräusche, ca. 3 MB.
- **Startmelodie und Vorladen:** Beim Öffnen des Quiz lädt die Seite alle Aufnahmen und Geräusche (ca. 3 MB), beim ersten Tippen werden sie dekodiert – so kommt der Ton ab der ersten Ansage pünktlich. Dieses erste Tippen auf der Startseite (und jedes Einschalten des Tons) spielt die Startmelodie: ein kurzer Party-Elektro-Song mit Chor „Politik-Duell!“ (Music-API von ElevenLabs, `STARTMUSIK` in `texte.ts`); fehlt die Datei, ein Beat (Sound Effects) mit Sprechchor beider Moderatoren, zeitgenau gemischt (`startmelodie` in `ton.ts`). Die Startmusik wird gestreamt (`<audio>`, spielt nach den ersten Sekunden Puffer) und puffert beim Öffnen des Quiz zuerst; der übrige Show-Ton lädt erst danach (höchstens 4 s später), damit er ihr die Leitung nicht nimmt. So hört man vor dem Spiel, ob der Ton an ist. Browser spielen Ton erst nach einer Nutzeraktion: Solange das nicht geschehen ist, zeigt das Quiz den Hinweis „Mit Ton spielen?“ (Ton einschalten / Ohne Ton spielen), und der Lautsprecher in der Kopfzeile ist durchgestrichen. Die ausdrücklich getroffene Wahl bleibt im localStorage (`politik-duell-ton`); bei „an“ versucht das Quiz beim nächsten Besuch gleich zu starten. Beginnt das Spiel, blendet sie aus.
- **Auftritt:** Startseiten von Duell und Quiz mit einmaligem Auftritt je Besuch (Zettel fährt ein, Logo: Urne springt auf, Kreuz wird gezeichnet, Stimmzettel fällt hinein, Slogan als Stempel). Konfettiregen für den Sieg im Quiz und im Duell.
- **Ohne Ton** läuft derselbe Zeitplan mit Untertiteln; ohne Aufnahmen werden Dauern aus der Textlänge geschätzt.
- **Barrierefreiheit:** Ton-aus-Knopf in der Kopfzeile (1.4.2), Untertitel aller Ansagen, Frage für Screenreader vollständig im Titel, Animationen ruhen bei „Bewegung anhalten“/„Bewegung reduzieren“, Sichtbarkeit hängt nie am Ende einer Animation, nichts blinkt (2.3.1). „Ansage überspringen“ beim Alleinspiel.
- **Recht:** Starter-Tarif von ElevenLabs mit kommerzieller Lizenz für Sprache. Die Stimmen sind KI-erzeugt und erfunden (keine geklonte echte Person) und als KI-Stimmen gekennzeichnet (Startseite des Quiz, Datenschutzerklärung) – passend zur Transparenzpflicht für synthetische Audioinhalte (Art. 50 KI-Verordnung). Beim Spielen fließen keine Daten zu ElevenLabs.

## Technik

```
Gast-Browser ──(1) „suche“ ─────────▶ Firebase RTDB quiz/<Code>/an/<Empfänger> (gelöscht nach dem Lesen)
             ◀─(2) Angebot/Antwort/ICE ─▶ Spielleitung
             ◀══(3) WebRTC-Datenkanal (direkt) ══▶  …oder Weiterleitung über denselben Kanal, wenn (3) nach 8 s nicht steht
```

- `src/quiz/fragen.ts` – Fragen aus Haltungen (rein, getestet), `scripts/erzeuge-quiz.ts` schreibt die Datei.
- `src/quiz/punkte.ts`, `src/quiz/spielleitung.ts` – Punkte und Spielzustand als reine Funktionen (getestet). Die Spielleitung schickt nach jeder Änderung einen Schnappschuss an alle; Antworten der anderen sind darin erst nach der Auflösung enthalten.
- `src/quiz/verbindung.ts` – Signalisierung (Firebase per REST/SSE, sonst Supabase, ohne beides `BroadcastChannel` zwischen Tabs desselben Browsers zum Testen), WebRTC, Weiterleitung.
- `firebase/database.rules.json` – Regeln der Datenbank; `scripts/quiz-aufraeumen.ts` + `.github/workflows/quiz-aufraeumen.yml` – tägliches Aufräumen.
- Nach Spielstart schließt die Spielleitung den Signalkanal, wenn alle direkt verbunden sind. Nachzügler und Wiederverbinden gibt es in der ersten Fassung nicht.
- Eingehende Nachrichten werden geprüft (Typen, Längen, Bereiche); Namen werden gekürzt.
- CSP: `connect-src` erlaubt zusätzlich `https://*.europe-west1.firebasedatabase.app` (REST und Server-Sent Events); WebRTC fällt nicht unter `connect-src`.

## Offene Entscheidungen

| Nr. | Frage | Vorschlag |
| --- | --- | --- |
| Q1 | Punkte zu Haltungen? `plan-haltungen.md` Grundsatz 1 sagt „keine Punkte“ – gemeint ist: niemand wird für eine Haltung belohnt. Im Quiz gibt es Punkte nur fürs Wissen, *was im Programm steht*. | Zulassen, mit Ergänzung im Plan der Haltungen. Grundsätze 2–5 gelten unverändert. |
| Q2 | Ist das Quiz öffentlich, während das Duell noch in der geschlossenen Testphase ist? | Ja – es zeigt nur geprüfte Positionen (derzeit Tempolimit und Zuwanderung, die Pilot-Haltungen aus E7). Weitere Haltungen erst nach Prüfung. **Ausnahme Fork (entschieden 7. 10. 2026):** Die Testversion auf GitHub Pages (`ma3u.github.io/politik-duell`) zeigt zusätzlich die Entwurfsfragen, mit Banner und Hinweis „noch nicht von Menschen geprüft“ in jeder betroffenen Auflösung (`VITE_QUIZ_ENTWUERFE=true`). |
| Q3 | STUN-Server für Direktverbindungen übers Internet? | Vorerst aus (sonst Weiterleitung über Firebase). Später eigener STUN in der EU, oder Cloudflare mit Hinweis. |
| Q4 | Welche Fragenzahl und Zeiten? | 5 Fragen, 20/30 s; nach ersten Tests anpassen. |
| Q5 | Zusätzlich frei formulierte Aussagen („Wer will Tempo 130?“) aus den Maßnahmen? | Später, wenn Maßnahmen geprüft sind – dann mit Beleg für alle sieben Parteien. |
| Q6 | Klassenmodus (Beamer zeigt Frage, Handys nur Antwortknöpfe)? | Nächster Schritt nach ersten Tests. |
| Q7 | Gleichbehandlung bei Einzelfragen: In den KI-Entwürfen (24 Fragen) ist bei 6 von 10 Einzelfragen dieselbe Partei die einzige Ja-Partei. Das bildet die Programme ab, ließe diese Partei im Spiel aber ständig „allein dastehen“. | Umgesetzt: Je Spiel ist keine Partei mehr als einmal die einzige richtige Antwort (`waehleFragen`). Vor der Veröffentlichung weiterer Haltungen mit Testspielenden aus verschiedenen Lagern prüfen (wie Nachtrag zu E7). |

## Getestet

- Unit-Tests `src/quiz/quiz.test.ts`: Fragenregeln, Punkte, Spielzustand, Ausgleich, Prüfung eingehender Nachrichten.
- Im Browser (Headless-Chrome, zwei bis drei Tabs, ohne Supabase): Raum eröffnen, Einladungslink, direkte WebRTC-Verbindung, fünf Fragen mit Einzel- und Mehrfachauswahl, Zwischenstand, Endstand, „Nochmal“; Rückfall auf die Weiterleitung nach 8 s, wenn die Direktverbindung scheitert; Gast verlässt mitten in der Frage; Spielleitung verlässt den Raum; unbekannter Raumcode; Allein üben mit Zeitablauf.
- Gegen die echte Firebase-Datenbank (Belgien): ganzes Spiel mit Direktverbindung, Weiterleitung, Abbrüche, unbekannter Raum; danach war die Datenbank leer, im Browser lag nichts (IndexedDB, localStorage, sessionStorage, Cookies leer).
- Noch nicht getestet: Geräte in verschiedenen Netzen und echte Mobilgeräte.

## Grenzen der ersten Fassung

- Derzeit gibt es **zwei** vollständig geprüfte Haltungen – das reicht für zwei Fragen. Das Quiz wächst mit der Prüfung der Haltungen (33 weitere liegen als KI-Entwurf vor).
- Kein Wiederverbinden nach Verbindungsabbruch, keine Nachzügler. Verlässt die Spielleitung den Raum, endet das Spiel für alle.
- Ohne STUN direkte Verbindungen nur im selben Netz.
