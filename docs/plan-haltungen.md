# Plan: Forderungen und Haltungen einordnen

Stand: 4. 10. 2026. Entscheidungen getroffen (siehe „Entscheidungen“). Schritt 1 bis 3 umgesetzt, die weiteren folgen in eigenen Pull Requests (siehe „Reihenfolge“).

## Ziel

Wer eine Forderung („Weniger Zuwanderung!“) oder eine Haltung („Mir ist Heimat wichtig“) nennt, soll sich nicht abgewiesen fühlen. Das Spiel ordnet beides ein – **mit Belegen aus den Programmen, aber ohne Punkte**:

- **Forderung:** Wer fordert das? Was sagt die Forschung zu diesem Lösungsweg? Welches Alltagsproblem steckt dahinter?
- **Haltung:** Wo stehen die Parteien dazu? Welche Zielkonflikte gibt es? Welche Alltagsprobleme hängen damit zusammen?

Grundsatz: **Verortung statt Wertung.** Punkte gibt es weiterhin nur für Lösungen zu Alltagsproblemen (Grundprinzipien 2 und 4 bleiben unverändert).

## Forderung oder Haltung?

Die **Forderungskarte** ordnet einen *Lösungsweg* ein (wie man etwas erreichen will), die **Haltungskarte** eine *Wertfrage* (was man überhaupt will).

| | Forderungskarte | Haltungskarte |
| --- | --- | --- |
| Auslöser | Forderung nach einer bestimmten Maßnahme („Asylsuchende an der Grenze zurückweisen!“) | Haltung oder Wert („Es kommen zu viele, das muss weniger werden.“) |
| Grundlage | Vorhandene Instrumente, schon erfasst und bewertet | Neuer Katalog von Haltungsfragen |
| Inhalt | Welche Parteien den Lösungsweg im Programm haben, Forschungsstand und Begründung | Position aller sieben Parteien mit Zitat, Zielkonflikte |
| Besser oder schlechter? | Ob ein Mittel wirkt, lässt sich untersuchen – daher der Forschungsstand | Über Werte entscheiden keine Studien – daher nur Verortung |

Beide enden mit dem Angebot, ein Alltagsproblem zu nennen; erst das wird gewertet. Kann die KI eine Äußerung weder einem Instrument noch einer Haltung sicher zuordnen, gibt es keine Karte, sondern wie bisher eine Nachfrage.

## Ist-Zustand

| Stelle | Verhalten heute |
| --- | --- |
| `supabase/functions/_shared/ki.ts` → `systemPrompt` | Drei Typen: `problem`, `forderung`, `wert`. Bei `forderung` genau eine Nachfrage nach dem Alltagsproblem. Pauschale Urteile über Gruppen werden als `forderung` eingeordnet und mit „Was hast du selbst erlebt …?“ nachgefragt; das Urteil wird nicht wiederholt. Thema und Ursachen werden nur bei `problem` zugeordnet. |
| `ki.ts` → `nutzerNachrichten` | Nach zwei Nachfragen muss die KI `problem` oder `wert` wählen. |
| `ki.ts` → `bereinigeAntwort` | `forderung` ohne Nachfrage bekommt die Standardfrage; nach zwei Nachfragen wird aus `forderung` ein `problem`. Bei `forderung` und `wert` werden `thema_id` und `ursachen_ids` immer geleert. |
| `src/components/Runde.tsx` | Bei `wert`: Verlauf wird gelöscht, ein fester Satz erscheint („Das klingt nach einer persönlichen Haltung – die respektieren wir. Werte werden hier nicht gewertet. Magst du stattdessen ein konkretes Alltagsproblem nennen?“), die Runde beginnt von vorn. |
| `supabase/functions/analyse/index.ts` → `speichereRunde` | Speichert `wert`-Äußerungen als Runde mit `status = 'wert'` (nur Zusammenfassung). Eine Forderung, die nach zwei Nachfragen zum `problem` wird, landet ohne Thema als `ungeprueft` samt KI-Einschätzung in der Review-Warteschlange. |
| `src/logic/analyse.ts` (Mock ohne KI) | Gleiches Verhalten über Schlagwörter; `wert` nur, wenn kein Thema erkannt wurde. |
| Datenkatalog | Kennt keine Haltungen. `docs/perspektiven-ursachen.md` schiebt Wertfragen ausdrücklich in `wert` (z. B. Tempolimit, „Bevormundung“, Wahlfreiheit bei der Kinderbetreuung). |
| Instrumente | Gleiche Lösungswege mehrerer Programme sind als **Instrument** einmal bewertet (`daten/README.md` → „Instrumente“, derzeit 308). In der Datenbank gibt es sie nicht: `src/data/katalog.ts` löst sie beim Export in die Maßnahmen auf. |

**Lücken:**

1. Eine Haltung bekommt einen Satz und wird dann übergangen. Die Person erfährt nichts, nicht einmal, welche Parteien ihre Haltung teilen.
2. Der Inhalt einer Forderung geht verloren. Viele Forderungen sind schon als Instrument erfasst (z. B. 6099 „Asylsuchende an den Binnengrenzen zurückweisen“), werden aber nicht gezeigt.
3. Die Nachfrage ist offen formuliert. Wer kein Problem in eigenen Worten nennt, landet nach zwei Nachfragen bei „ohne Wertung“ – obwohl das Thema oft erkennbar war.
4. Eine Forderung, die zum `problem` umgedeutet wird, kann eine KI-Einschätzung bekommen, die eigentlich für unbekannte Probleme gedacht ist.

## Grundsätze für alle Teile

1. **Keine Punkte, kein Sieger.** Karten zu Forderungen und Haltungen zählen nicht für den Spielstand und nicht für „beste Partei“.
2. **Nur belegte Aussagen über Parteien.** Jede Position stammt aus dem Programm, mit Zitat und Seitenanker – wie bei Maßnahmen. Die KI ordnet nur einer ID aus dem Katalog zu; sie formuliert keine Positionen.
3. **Alle sieben oder keine.** Eine Haltungskarte erscheint nur, wenn die Positionen aller sieben Bundesprogramme erfasst und geprüft sind (in der Testphase auch als KI-Entwurf). Unvollständige Karten würden einzelne Parteien sichtbarer machen als andere.
4. **Gleiche Darstellung.** Feste Reihenfolge der Parteien wie im übrigen Spiel, gleiche Farben, keine Hervorhebung einer „richtigen“ Position, keine Ampelfarben für Positionen.
5. **Zielkonflikte beidseitig.** Jede Haltung nennt mindestens einen Zielkonflikt für jede Seite der Frage, jeweils mit unabhängiger Quelle.
6. **Brücke zum Alltag.** Jede Karte endet mit dem Angebot, ein Alltagsproblem zu nennen – mit Themenvorschlägen zum Antippen.
7. **Klare Grenze.** Äußerungen, die Menschen wegen ihrer Herkunft, Religion, ihres Geschlechts o. Ä. die Würde absprechen oder zu Gewalt aufrufen, bekommen keine Karte (siehe Teil D).
8. **Datenschutz unverändert.** Gespeichert werden nur IDs und die neutrale Zusammenfassung, kein Originaltext.

## Teil A: Forderungen

### A1 Ablauf

1. Die KI erkennt `forderung` wie bisher und ordnet zusätzlich, wenn erkennbar, **Thema** und **Instrument** zu (neue Felder `thema_id`, `instrument_id`, siehe „KI-Schnittstelle“).
2. Die Antwort spiegelt die Forderung und fragt nach: „Du möchtest, dass X. Was soll sich dadurch in deinem Alltag ändern?“
3. Unter der Nachfrage zeigt die App, sofern ein Thema erkannt ist:
   - die **Ursachen des Themas zum Antippen** („Was davon betrifft dich?“, siehe A2),
   - einen Knopf **„Zeig mir, wer das fordert“** (nur mit erkanntem Instrument, siehe A3).
4. Nennt die Person ein Problem oder tippt Ursachen an, läuft die Runde normal weiter und wird gewertet. Die Forderungskarte erscheint dann zusätzlich in der Auflösung („Deine Forderung: …“).
5. Öffnet die Person die Forderungskarte, kann sie danach ein Problem nennen oder Ursachen antippen. Die Runde bleibt dieselbe; die Karte allein wertet nicht.
6. Bleibt es nach zwei Nachfragen bei der Forderung: Runde ohne Wertung mit Forderungskarte (falls Instrument) bzw. Hinweis auf das Thema. **Keine** KI-Einschätzung und kein Eintrag in die Review-Warteschlange (behebt Lücke 4). Wie bei einer Haltung (E8) verbraucht das die Runde nicht: Die Person kann danach ein Problem nennen; gespeichert wird eine Runde mit `status = 'forderung'`.

### A2 Ursachen zum Antippen

Die Ursachen des erkannten Themas erscheinen als Auswahl (Kurztext, höchstens 8; bei mehr die ersten 8 nach ID und „weitere zeigen“). Gewählte Ursachen gelten als Schilderung der Person und werden gewertet wie von der KI zugeordnete.

- Das ist deterministisch und fällt nicht unter „KI vergibt Punkte“.
- Methodisch neu: Die Zuordnung kommt nicht mehr nur aus der Schilderung. Deshalb gilt dieselbe Bremse wie bisher: höchstens **3** Ursachen je Runde antippbar, sonst gewänne wieder, wer zum Thema die meisten Maßnahmen hat (`docs/methode.md` → „Punkte in der Runde“, Nr. 2).
- Auch für `problem` mit erkanntem Thema, aber ohne erkennbare Ursache, nutzbar (statt der offenen Nachfrage `NACHFRAGE_URSACHE`).

### A3 Forderungskarte

Inhalt, alles aus der Datenbank:

| Abschnitt | Quelle |
| --- | --- |
| Name des Lösungswegs | `instrumente.name` |
| Wer fordert das? Für jede der sieben Parteien: „steht im Bundesprogramm“ (mit Beschreibung und Beleg-Link) · „zu diesem Thema nicht gefunden“ · „noch nicht erfasst“ | Maßnahmen mit diesem Instrument; `abdeckung` |
| Was die Forschung sagt | `instrumente.evidenz` (wie bisher als „Wirkung in der Forschung umstritten“ usw.) und `instrumente.begruendung` |
| Hinweis | „Eingeordnet wird der Lösungsweg, nicht die Partei. Punkte gibt es nur für Lösungen zu einem Alltagsproblem.“ |

Wortlaut „zu diesem Thema nicht gefunden“: Gesucht wurde nach Maßnahmen zu den Ursachen des Themas, nicht nach jeder Erwähnung im Programm. „Steht nicht im Programm“ wäre nicht belegt.

Landesprogramme: Die Karte zeigt zunächst nur Bundesprogramme. Ist ein Bundesland gewählt, kommt ein zweiter Block für dessen Landesprogramme dazu (gleiche Logik). Instrumente sind je Ebene getrennt (`daten/README.md` → „Eine Ebene je Instrument“); die Zuordnung Bund ↔ Land braucht deshalb das neue Feld `entspricht` (siehe Datenmodell).

### A4 Pauschale Urteile

Bleibt wie heute: Einordnung als `forderung`, Nachfrage nach dem Erlebten, Urteil wird nicht wiederholt. **Keine** Forderungskarte und keine Ursachenauswahl zu einem Urteil über eine Gruppe – die KI setzt dann `pauschal: true`, und die App zeigt nur die Nachfrage.

## Teil B: Haltungen

### B1 Was ist eine Haltung im Katalog?

Eine **Wertfrage**, über die vernünftige Menschen verschieden urteilen und bei der sich die Programme unterscheiden. Sie wird als neutrale Ja/Nein-Frage formuliert, z. B.:

- „Soll Zuwanderung stärker begrenzt werden?“
- „Soll es ein generelles Tempolimit auf Autobahnen geben?“
- „Soll der Staat Familien, die ihre Kinder zu Hause betreuen, finanziell unterstützen?“

Aufnahmekriterien:

1. Die Frage kommt in mindestens drei der sieben Bundesprogramme mit erkennbarer Position vor.
2. Die Frage ist keine Tatsachenfrage („Steigt die Kriminalität?“ gehört zu Ursachen bzw. Teil C).
3. Die Frage stellt nicht die Würde oder Gleichberechtigung einer Gruppe zur Abstimmung (Teil D).
4. Frage und Beschreibung sind so formuliert, dass sich Anhänger:innen beider Seiten darin wiederfinden. Das prüfen mindestens zwei Personen mit unterschiedlicher politischer Haltung (wird bei der Besetzung der Prüfenden berücksichtigt).

### B2 Position je Partei

| Wert | Anzeige | Wann |
| --- | --- | --- |
| `ja` | „Ja“ | Programm spricht sich klar dafür aus |
| `nein` | „Nein“ | Programm spricht sich klar dagegen aus |
| `teils` | „Teils“ | Programm befürwortet nur einen Teil oder unter Bedingungen; die Kurzfassung sagt, welchen |
| `keine_aussage` | „Keine Aussage im Programm“ | Programm durchsucht, nichts gefunden; mit `begruendung` (was durchsucht wurde) |

Fehlt der Eintrag: „noch nicht erfasst“ – dann erscheint die Karte nicht (Grundsatz 3).

Zu jeder Position außer `keine_aussage`: **Kurzfassung** in neutralen eigenen Worten (höchstens 25 Wörter), **wörtliches Zitat** und **Beleg-Link** mit `#page=N`. Anders als bei Maßnahmen soll das Zitat **in der Datenbank** stehen und in der Karte aufklappbar sein: Bei Haltungen ist der Wortlaut der eigentliche Beleg, und eine verkürzte Kurzfassung würde schnell als Unterstellung gelesen.

### B3 Zielkonflikte

Zwei bis vier kurze Sätze, je mit unabhängiger Quelle (gleiche Anforderungen wie an Ursachen, `docs/methode.md` → „Ursachen“). Mindestens ein Satz je Seite. Beispiel-Format:

> Wer Zuwanderung stärker begrenzen will, nennt die Belastung von Kommunen bei Unterbringung und Schulplätzen. [Quelle]
> Wer das ablehnt, nennt den Fachkräftebedarf, etwa in der Pflege. [Quelle]

Die Sätze beschreiben, welche Ziele gegeneinander stehen – sie entscheiden den Konflikt nicht.

### B4 Ablauf

1. Die KI erkennt `wert` und ordnet, wenn passend, eine `haltung_id` zu.
2. Mit Haltung und vollständiger Karte: Die App zeigt die **Haltungskarte**:
   - ein Satz: „Das ist eine Haltung – darüber kann man verschieden denken. So stehen die Parteien dazu:“
   - die Frage, die sieben Positionen (Kurzfassung, Zitat aufklappbar, Beleg-Link),
   - die Zielkonflikte,
   - „Welches Alltagsproblem hängt für dich damit zusammen?“ mit den verwandten Themen zum Antippen (`verwandte_themen`). Ein Tipp füllt das Eingabefeld nicht vor, sondern setzt das Thema und zeigt dessen Ursachen zum Antippen (A2).
3. Ohne passende Haltung: wie heute ein freundlicher Satz, aber ohne „Werte werden hier nicht gewertet“ (klingt abweisend). Vorschlag: „Das ist eine persönliche Haltung – darüber kann man verschieden denken. Magst du erzählen, wo dir das im Alltag begegnet?“
4. Die Runde bleibt dieselbe und kann mit einem Problem fortgesetzt werden. Pro Runde höchstens eine Haltungskarte, danach nur noch der Satz aus Schritt 3 – damit fünf Runden nicht zu fünf Haltungsdebatten werden.
5. Die beiden gewählten Parteien werden in der Karte **nicht** hervorgehoben (Entscheidung E5).

### B5 Endbildschirm: „Worüber ihr gesprochen habt“

Nach den fünf Runden ein eigener Abschnitt unter der Zusammenfassung: alle Haltungs- und Forderungskarten der Partie, aufklappbar. Gedacht als Gesprächsanlass nach dem Spiel; ohne Punkte. Im Teilen-Text erscheinen sie nicht (Datenschutz: Haltungen sind besondere Daten).

### B6 Pilot

Start mit drei Haltungen (E7): Zuwanderung begrenzen, Tempolimit, staatliche Unterstützung häuslicher Kinderbetreuung (verwandte Themen 6/9, 15, 17 – dort schon als Wertfragen benannt). Erst nach Tests mit Spielenden aus verschiedenen Lagern (auch Wähler:innen von AfD und BSW) weitere Haltungen.

## Teil C: Tatsachenbehauptungen

Nicht Teil der ersten Umsetzung. Festgehalten wird nur die Regel für den Prompt: Die KI bestätigt oder widerlegt keine Tatsachenbehauptungen und nennt keine Zahlen (gilt schon). Steckt eine Behauptung in einem Problem, ordnet sie wie bisher nur belegte Ursachen zu; die Auflösung zeigt diese mit Quelle. Ein eigener Faktenteil (Behauptung → belegter Befund) wäre ein eigenes Vorhaben mit eigener Prüfung.

## Teil D: Grenze

Neue Regel im Prompt und in `docs/methode.md` (Abschnitt „Sonderfälle“ und „Grenzen der Methode“):

- Äußerungen, die einer Gruppe die Menschenwürde oder gleiche Rechte absprechen, zu Gewalt aufrufen oder Personen beleidigen, ordnet die KI als `grenze` ein.
- Die App antwortet ohne Belehrung: „Darauf geht das Spiel nicht ein. Magst du ein Problem aus deinem Alltag nennen?“ Keine Karte, keine Speicherung des Inhalts (Runde mit `status = 'grenze'`, ohne Zusammenfassung).
- Begründung in der Methode: Art. 1 und 3 GG; die Grenze gilt für alle Richtungen gleich. Positionen von Parteien in ihren Programmen werden davon nicht berührt – sie werden zitiert, nicht gefiltert.
- Abgrenzung zu A4: Ein pauschales Urteil („Die … sind alle kriminell“) ist **noch kein** `grenze`-Fall; dort bleibt die Nachfrage nach dem Erlebten. `grenze` ist für Abwertung und Gewalt reserviert. Die KI soll im Zweifel `forderung` mit `pauschal: true` wählen.

## Datenmodell

### Repo (`daten/`)

Neue Dateien `daten/haltungen/NN-name.json`, eine je Haltung:

```json
{
  "id": 1,
  "frage": "Soll Zuwanderung stärker begrenzt werden?",
  "beschreibung": "Ein neutraler Satz, worum es geht.",
  "verwandte_themen": [6, 9],
  "zielkonflikte": [
    { "seite": "ja", "text": "…", "quelle_url": "https://…" },
    { "seite": "nein", "text": "…", "quelle_url": "https://…" }
  ],
  "positionen": [
    {
      "partei_id": 1,
      "position": "teils",
      "kurzfassung": "…",
      "zitat": "Wörtlich aus dem Programm.",
      "beleg_programm_url": "https://…/wahlprogramm.pdf#page=12",
      "stand": "2026-10-10",
      "geprueft": false,
      "ki_entwurf": true
    },
    {
      "partei_id": 2,
      "position": "keine_aussage",
      "begruendung": "Kapitel Migration und Innenpolitik durchsucht, Suchbegriffe …",
      "stand": "2026-10-10",
      "geprueft": false
    }
  ],
  "freigabe": { "datum": "2026-10-12" }
}
```

- `id`: eigener Nummernkreis für Haltungen (1, 2, …), nie wiederverwendet (wie `daten/README.md` → „IDs“).
- `land` optional an Positionen wie bei Abdeckungseinträgen; zunächst nur Bundesprogramme.
- `freigabe`: Die Betreiberin gibt Frage, Beschreibung und Zielkonflikte frei, **bevor** jemand Positionen erfasst (wie Ursachen vor Maßnahmen).

Instrumente bekommen ein optionales Feld `entspricht` (ID des gleichen Lösungswegs auf der anderen Ebene), damit die Forderungskarte Bund und Land zusammenführen kann.

### Supabase (neue Migration)

```sql
instrumente (
  id int primary key, thema_id int references themen,
  name text not null, begruendung text, evidenz text, ebene text,   -- bund | land
  entspricht int null
)
alter table massnahmen add column instrument_id int null references instrumente;

haltungen (id int primary key, frage text not null, beschreibung text not null, verwandte_themen int[] not null)

haltung_positionen (
  haltung_id int references haltungen, partei_id int references parteien,
  land text null,
  position text not null check (position in ('ja', 'nein', 'teils', 'keine_aussage')),
  kurzfassung text, zitat text, beleg_programm_url text, begruendung text,
  stand date not null, geprueft boolean default false, ki_entwurf boolean default false,
  check (position = 'keine_aussage' or (kurzfassung is not null and zitat is not null and beleg_programm_url is not null)),
  unique (haltung_id, partei_id, land)
)

haltung_zielkonflikte (id serial primary key, haltung_id int references haltungen,
  seite text check (seite in ('ja', 'nein')), text text not null, quelle_url text not null)

-- runden
alter table runden drop constraint runden_status_check;
alter table runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert', 'forderung', 'grenze'));
alter table runden add column haltung_id int null, add column instrument_id int null;
```

Row Level Security wie bei Maßnahmen: lesen nur `geprueft` (oder `ki_entwurf` mit Testphasen-Zugang), schreiben nur Service-Rolle. Die Sicht „Karte vollständig“ (alle sieben Parteien mit Eintrag) als View `haltungen_vollstaendig`, damit App und Edge Function dieselbe Regel nutzen.

`runden.status`:
- `wert`: Haltung ohne Problem (wie heute), neu mit `haltung_id`, falls zugeordnet.
- `forderung`: Forderung ohne Problem nach zwei Nachfragen, mit `thema_id`/`instrument_id`, falls zugeordnet.
- `grenze`: ohne `problem_text`.

## KI-Schnittstelle

### Antwort

```json
{
  "typ": "problem | forderung | wert | grenze",
  "nachfrage": "string | null",
  "thema_id": "number | null",
  "ursachen_ids": [1, 2],
  "instrument_id": "number | null",
  "haltung_id": "number | null",
  "pauschal": "boolean",
  "rueckmeldung": "string | null",
  "zusammenfassung": "string",
  "stichwort": "string",
  "einschaetzung": "string | null"
}
```

Neu: `thema_id` auch bei `forderung` und `wert` (für Ursachenauswahl und Themenvorschläge), `instrument_id`, `haltung_id`, `pauschal`, Typ `grenze`.

### Katalog im Prompt

- Haltungen: nur vollständige, als `Haltung N: Frage` (wenige Zeilen).
- Instrumente: 308 Namen würden den Prompt etwa verdoppeln. Deshalb **zweistufig**: Erkennt der erste Aufruf `forderung` mit Thema, folgt ein zweiter, kurzer Aufruf nur mit den Instrumenten dieses Themas (Bundes-Instrumente, bei gewähltem Land zusätzlich dessen). Zählt für das Rate-Limit als eine Anfrage.

### Prompt-Regeln (Ergänzung)

- Bei `forderung`: Forderung neutral in einem Halbsatz spiegeln, dann nach dem Alltag fragen. Instrument nur, wenn die Forderung diesem Lösungsweg eindeutig entspricht, sonst `null`.
- Bei `wert`: Haltung nur zuordnen, wenn die Äußerung die Frage der Haltung berührt; nicht raten.
- Keine Partei nennen, keine Position einer Partei behaupten (gilt schon).
- `grenze` nur für Abwertung, Gewalt, Beleidigung; im Zweifel `forderung` mit `pauschal: true`.

### Prüfung der Antwort (`bereinigeAntwort`)

- `instrument_id` nur, wenn sie zum Thema gehört und in der Liste des zweiten Aufrufs stand; sonst `null`.
- `haltung_id` nur aus `haltungen_vollstaendig`; sonst `null`.
- Bei `pauschal: true` werden `instrument_id`, `haltung_id` und `thema_id` geleert.
- Bei `grenze`: `zusammenfassung` und `stichwort` leer, keine Nachfrage.
- Bei `problem` bleiben `instrument_id` und `haltung_id` leer.
- Die bisherigen Regeln (höchstens zwei Nachfragen, nur Katalog-IDs, keine Links, keine Parteinamen) gelten weiter. Nach zwei Nachfragen wird `forderung` **nicht** mehr zu `problem` umgedeutet, sondern bleibt `forderung` ohne Wertung (Lücke 4).

### Mock (`src/logic/analyse.ts`)

Bekommt dieselben Felder: Haltungen über Schlagwörter in der Haltungsdatei (`schlagwoerter`, nur Mock), Instrumente über ein optionales Feld `schlagwoerter` am Instrument. Ohne Treffer `null`.

## App

| Datei | Änderung |
| --- | --- |
| `src/components/Runde.tsx` | Neue Zustände: Forderung mit Ursachenauswahl, Forderungskarte, Haltungskarte, Grenze. Ursachenauswahl übergibt die gewählten IDs an `werteAus`. Neuer Text für `wert` ohne Haltung. |
| `src/components/UrsachenAuswahl.tsx` (neu) | Antippbare Ursachen, höchstens 3 wählbar. |
| `src/components/ForderungsKarte.tsx` (neu) | Siehe A3. |
| `src/components/HaltungsKarte.tsx` (neu) | Siehe B4; Zitat aufklappbar, Parteien in fester Reihenfolge. |
| `src/components/Aufloesung.tsx` | Forderungskarte unter dem Ergebnis, wenn die Runde mit einer Forderung begann. |
| `src/components/Ende.tsx` | Abschnitt „Worüber ihr gesprochen habt“ (B5). |
| `src/spiel.ts` | `RundenErgebnis` um `forderung?: { instrument_id, thema_id }` und eine Liste der gesehenen Karten je Partie. |
| `src/data/katalog.ts`, `quelle.ts`, `types.ts`, `_shared/typen.ts` | Instrumente und Haltungen laden. |
| Methodenseite | Neue Abschnitte (siehe unten). |

## Methode und Dokumentation

- `CLAUDE.md`: Spielablauf Schritt 4 und Datenmodell ergänzen; Grundprinzip 4 um „Forderungen werden belegt eingeordnet, aber nicht gewertet“.
- `docs/methode.md`: neuer Abschnitt „Forderungen und Haltungen“ (Verortung statt Wertung, Aufnahmekriterien, Positionswerte, „Alle sieben oder keine“), Sonderfälle-Tabelle um Forderungskarte, Haltungskarte und Grenze ergänzen, „Grenzen der Methode“: Auswahl und Formulierung der Haltungen sind selbst Entscheidungen.
- `daten/README.md`: Format `haltungen/`, Feld `entspricht`, Erfassen und Prüfen von Haltungen.
- `docs/datenmodell.md`: neue Tabellen.

## Automatische Prüfung (`npm run daten:pruefen`)

- Jede Haltung: Frage endet mit „?“, `verwandte_themen` existieren, mindestens ein Zielkonflikt je Seite, jede Quelle eine URL.
- Jede Position: Partei existiert, Pflichtfelder je Positionswert, `beleg_programm_url` zeigt auf das Programm der Partei mit `#page=`, Zitat steht im Programmtext (`npm run zitate:pruefen` erweitern), `stand` nicht vor `programm_stand`.
- Höchstens eine Position je Haltung, Partei und Programm; Haltungs-IDs nie wiederverwendet (`ids.json`).
- Kurzfassung: höchstens 25 Wörter, kein Parteiname (Neutralität wie bei Begründungen).
- `entspricht`: Gegenstück existiert, hat andere Ebene und verweist zurück.

## Erfassen und Prüfen

- Haltungen anlegen wie Themen in zwei Phasen: **A** Frage, Beschreibung, Zielkonflikte (ohne Blick in die Programme, Freigabe durch die Betreiberin), **B** Positionen aus allen sieben Programmen.
- Positionen mit KI-Hilfe erfassen ist erlaubt (gekennzeichnet `ki_entwurf`), wie bei Maßnahmen. Belegprüfung durch die Betreiberin; Einordnung `ja`/`nein`/`teils` zusätzlich durch zwei Prüfende, die die Partei **nicht** sehen (blind wie bei Maßnahmen: Zitat ohne Parteinamen).
- Später eigener Skill `/haltung-anlegen` analog zu `/thema-anlegen`.

## Tests

- `ki.test.ts`: Bereinigung der neuen Felder (fremde IDs, `pauschal` leert alles, `grenze` ohne Text, `forderung` bleibt nach zwei Nachfragen `forderung`).
- `logik.test.ts`: Wertung mit angetippten Ursachen gleich der mit KI-Zuordnung; mehr als drei Ursachen werden abgewiesen.
- Mock: Beispielsätze für Forderung mit Instrument, Haltung, pauschales Urteil, Grenze.
- `datenbank.test.ts`: RLS für neue Tabellen, View `haltungen_vollstaendig`.
- Katalog-Tests für das neue Format und die Prüfregeln.
- Prompt-Evaluation (manuell, vor dem Start): 40 Beispieläußerungen aus verschiedenen Lagern, erwartete Einordnung festgehalten in `docs/`, Ergebnis im Pull Request.

## Reihenfolge

1. **Ursachenauswahl und Forderung ohne Umdeutung** (A1, A2, A4, Lücke 4, neuer `wert`-Text). Braucht keine neuen Daten. *Umgesetzt (4. 10. 2026).* Umsetzungsdetails:
   - Die Ursachen erscheinen nur, solange eine Nachfrage offen ist – nicht nach der letzten Antwort, damit eine Runde nicht doppelt gespeichert wird.
   - Angetippte Ursachen gehen als `auswahl` an die Edge Function `analyse`; sie fragt dann keine KI (zählt nur für das Rate-Limit je Sitzung, nicht für das globale) und speichert die Runde. Als Problem steht dort nur „Thema: n Ursachen angetippt“ – kein Text der Person.
   - Feld `pauschal` und Status `forderung` (Migration `20261006000000_runden_forderung.sql`) sind schon in diesem Schritt dabei; Forderungen ohne Problem kommen wie Haltungen nicht zur Freigabe in der Admin-Ansicht.
   - Nachgereicht: Statt immer desselben Satzes greift die KI eine Haltung oder abschließende Forderung in `rueckmeldung` in eigenen Worten auf (keine Zustimmung, kein Widerspruch). Bei Parteinamen, Filtertreffern, zu kurzem oder zu langem Text und bei Pauschalurteilen zeigt die App den festen Satz.
2. **Forderungskarte** (A3): Instrumente in die Datenbank, zweistufiger KI-Aufruf. *Umgesetzt (4. 10. 2026).* Umsetzungsdetails:
   - Migration `20261007000000_instrumente.sql`: Tabelle `instrumente` (ohne Wirksamkeit und Umsetzbarkeit, dafür mit `beleg_studie_url`, `ki_entwurf` und `entwurf_herkunft`), `massnahmen.instrument_id`, `runden.instrument_id`; `testphase_daten` liefert auch Instrument-Entwürfe. Ein Instrument ist öffentlich, sobald mindestens eine seiner Maßnahmen geprüft ist (bei echten Daten verlangt das schon zwei Bewertungen am Instrument); `entspricht` verweist nur auf ein Gegenstück, das ebenfalls spielbar ist.
   - Katalog: optionales Feld `entspricht` am Instrument, Prüfung (Gegenstück vorhanden, im selben Thema, andere Ebene, verweist zurück). In den Daten ist `entspricht` noch nirgends gesetzt – die Landes-Blöcke erscheinen erst, wenn jemand Bundes- und Landes-Instrumente bewusst verbindet.
   - Zweiter KI-Aufruf in der Edge Function `analyse`: nur bei `forderung` mit erkanntem Thema und ohne `pauschal`. Angeboten werden die Bundes-Instrumente des Themas und, bei gewähltem Land, die Landes-Instrumente, die in einem Programm dieses Landes vorkommen; Entwürfe nur mit Zugang zur Testphase. Die Antwort wird nur übernommen, wenn die ID in der angebotenen Liste stand; scheitert der Aufruf, bleibt die Forderung ohne Karte. Rate-Limit wie vorher: eine Anfrage.
   - App: `ForderungsKarte.tsx` (Logik in `src/logic/forderung.ts`) in der Runde – Knopf „Zeig mir, wer das fordert“ unter der Nachfrage, bei bleibender Forderung gleich offen – und in der Auflösung („Deine Forderung“), wenn die Runde mit einer Forderung begann. Forschungsstand mit Begründung, keine Punkte, feste Parteireihenfolge, keine Hervorhebung der gewählten Parteien. Für „steht nicht drin“ gilt der Wortlaut „zu diesem Thema nicht gefunden“; ein Programm, das für die Ursachen des Lösungswegs noch nicht durchsucht ist, erscheint als „noch nicht erfasst“.
   - Gespeichert wird bei `status = 'forderung'` die `instrument_id` (nur die ID, kein Text). Gewertete Runden speichern sie nicht.
   - Noch offen: Die manuelle Prompt-Evaluation für die Zuordnung (siehe „Tests“) und das Setzen von `entspricht` in den Daten.
3. **Grenze** (Teil D) mit Methodentext. *Umgesetzt (4. 10. 2026).* Umsetzungsdetails:
   - Prompt: neuer Typ `grenze` (Menschenwürde oder gleiche Rechte einer Gruppe absprechen, Gewaltaufruf, Beleidigung; gleich aus welcher Richtung), ausdrücklich abgegrenzt vom Pauschalurteil – im Zweifel `forderung` mit `pauschal: true`.
   - `bereinigeAntwort` übernimmt bei `grenze` nichts aus der KI-Antwort (keine Nachfrage, Rückmeldung, Zusammenfassung, kein Stichwort, Thema, Instrument oder `pauschal`); einen zweiten KI-Aufruf gibt es nicht.
   - Gespeichert wird eine Runde mit `status = 'grenze'` und leerem `problem_text`, ohne Filtergrund. Die Migration `20261008000000_runden_grenze.sql` erlaubt den Status und sichert per Check ab, dass solche Runden keinen Inhalt, kein Thema, keine Punkte und keine Freigabe haben. In der Admin-Ansicht erscheinen sie nicht.
   - App: fester Satz „Darauf geht das Spiel nicht ein. Magst du ein Problem aus deinem Alltag nennen?“; die Äußerung verschwindet aus dem Verlauf, eine offene Forderungskarte wird geschlossen, die Runde läuft weiter (wie bei einer Haltung, E8).
   - Mock: enge Schlagwortmuster für Abwertung, Gewaltaufrufe und Beleidigungen; Pauschalurteile bleiben Nachfragen.
   - Methode: `docs/methode.md` → „Grenze“ (Begründung Art. 1 und 3 GG, Programme werden nicht gefiltert, Abgrenzung zum Pauschalurteil), Sonderfälle, Rolle der KI und „Grenzen der Methode“; kurzer Absatz auf der Methodenseite der App.
   - Noch offen: Grenzfälle in die manuelle Prompt-Evaluation aufnehmen (siehe „Tests“), mit Beispielen aus verschiedenen Richtungen.
4. **Haltungen**: Format, Prüfung, drei Pilot-Haltungen erfassen, Haltungskarte, Endbildschirm.
5. Tests mit Spielenden aus verschiedenen Lagern; danach über weitere Haltungen entscheiden.

## Entscheidungen (von der Betreiberin getroffen, 4. 10. 2026)

| Nr. | Frage | Entscheidung |
| --- | --- | --- |
| E1 | Zeigt die Forderungskarte Forschungsstand und Begründung des Instruments oder nur, wer es fordert? | Mit Forschungsstand und Begründung, ohne Punktzahl – das ist der faktenbasierte Teil. |
| E2 | Dürfen Spielende Ursachen antippen (A2)? Das weicht von „nur aus der Schilderung“ ab. | Ja, höchstens drei. |
| E3 | Reichen die Positionswerte `ja` / `nein` / `teils` / `keine_aussage`? | Ja; feinere Skalen wirken wie eine Bewertung. |
| E4 | Haltungskarte nur, wenn alle sieben Parteien erfasst sind? | Ja (Grundsatz 3). |
| E5 | Gewählte Parteien in der Haltungskarte hervorheben? | Nein, sonst wird daraus ein verdecktes Duell um Haltungen. |
| E6 | Zitate von Haltungspositionen in die Datenbank (bei Maßnahmen bisher nicht)? | Ja, weil bei Haltungen der Wortlaut der eigentliche Beleg ist. |
| E7 | Welche drei Pilot-Haltungen? | Zuwanderung begrenzen, Tempolimit, häusliche Kinderbetreuung fördern. |
| E8 | Verbraucht eine Karte die Runde? | Nein; höchstens eine Haltungskarte je Runde. |
| E9 | Wer prüft die Formulierung der Haltungsfragen (B1 Nr. 4)? | Zwei Personen mit unterschiedlicher politischer Haltung; bis zur Vereinsgründung aus dem Kreis der Prüfenden. |
