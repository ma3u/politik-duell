# Übergabe der App an den Verein

Nach der Eintragung überträgt die Gründerin das Projekt an den Verein. Der Vertrag regelt die Rechte, die Checkliste die praktische Umstellung.

Urheberrecht selbst ist in Deutschland nicht übertragbar (§ 29 UrhG) – übertragen werden **ausschließliche Nutzungsrechte**. Daneben bleiben die Werke unter der freien Lizenz des Repos für alle nutzbar (siehe [README → Phase 1](README.md#phase-1--jetzt-allein-ohne-mitstreiterinnen-möglich)).

## Vertrag (Vorlage)

> ### Vereinbarung über die Übertragung des Projekts „Politik-Duell“
>
> zwischen
> **[Vor- und Nachname, Anschrift]** – im Folgenden „Gründerin“ –
> und
> **Politik-Duell e. V.**, [Anschrift], eingetragen im Vereinsregister des Amtsgerichts [Ort] unter VR [Nummer], vertreten durch [vertretungsberechtigte Vorstandsmitglieder] – im Folgenden „Verein“ –
>
> **§ 1 Gegenstand**
> (1) Die Gründerin hat das Lernspiel „Politik-Duell“ entwickelt, bestehend insbesondere aus dem Quellcode im Repository `github.com/politik-duell/politik-duell` der GitHub-Organisation `politik-duell`, dem Datenkatalog (`daten/`), den Texten zur Methode, dem Logo und Design sowie der Datenbank bei Supabase (im Folgenden „Projekt“).
> (2) Zum Projekt gehören ferner die Domains `politik-duell.de` und `politikduell.de`, das E-Mail-Postfach `politik-duell@posteo.de` und die Konten nach Anlage 1.
>
> **§ 2 Nutzungsrechte**
> (1) Die Gründerin räumt dem Verein an allen von ihr geschaffenen Bestandteilen des Projekts das ausschließliche, räumlich und zeitlich unbeschränkte Recht ein, sie in allen bekannten Nutzungsarten zu nutzen, zu bearbeiten, zu veröffentlichen und Dritten Rechte daran einzuräumen, insbesondere unter freien Lizenzen.
> (2) Bereits erteilte freie Lizenzen ([AGPL-3.0 für den Quellcode, CC BY 4.0 für die Daten]) bleiben unberührt. Die Gründerin behält das einfache Recht, ihre Beiträge weiter zu nutzen, auch außerhalb des Vereins.
> (3) Die Gründerin verzichtet darauf, als Urheberin bei jeder Nutzung genannt zu werden; eine Nennung als Gründerin im Impressum, in der Projektbeschreibung oder im Quellcode genügt.
> (4) Bestandteile Dritter (Open-Source-Bibliotheken, Wahlprogramme, Studien) sind nicht Gegenstand dieses Vertrags; für sie gelten deren Lizenzen bzw. das Zitatrecht.
>
> **§ 3 Name, Domains, Konten**
> (1) Die Gründerin überträgt dem Verein alle Rechte, die sie am Namen „Politik-Duell“ und am Logo erworben hat.
> (2) Sie veranlasst den Inhaberwechsel der Domains auf den Verein und überträgt die Konten nach Anlage 1 oder übergibt die Zugangsdaten. Bis zur Umstellung verwaltet sie Domains und Konten treuhänderisch für den Verein.
>
> **§ 4 Gegenleistung, Kosten**
> (1) Die Übertragung ist unentgeltlich.
> (2) Der Verein erstattet der Gründerin gegen Beleg die Gründungskosten nach § 14 der Satzung. Laufende Kosten des Projekts trägt der Verein ab dem [Datum der Übertragung].
>
> **§ 5 Gewährleistung**
> Die Gründerin versichert, dass sie die übertragenen Bestandteile selbst geschaffen hat oder zur Übertragung berechtigt ist, soweit ihr bekannt keine Rechte Dritter entgegenstehen und das Projekt mit Hilfe von KI-Werkzeugen erstellt wurde, deren Bedingungen die Nutzung der Ergebnisse erlauben. Eine weitergehende Haftung ist ausgeschlossen, außer bei Vorsatz und grober Fahrlässigkeit.
>
> **§ 6 Datenschutz**
> Mit der Übertragung wird der Verein Verantwortlicher im Sinne der DSGVO für die im Projekt verarbeiteten Daten. Die Gründerin übergibt die Unterlagen zur Verarbeitung (Datenschutzerklärung, Auftragsverarbeitungsverträge, Moderations- und Prüferkonten) und löscht bei sich verbliebene Kopien personenbezogener Daten, soweit sie nicht als Vereinsmitglied Zugriff behält.
>
> **§ 7 Rückfall**
> Wird der Verein aufgelöst, verliert er die Gemeinnützigkeit oder betreibt er das Projekt länger als zwölf Monate nicht mehr, kann die Gründerin verlangen, dass ihr die Rechte nach §§ 2 und 3 unentgeltlich zurückübertragen werden, soweit sie nicht nach § 13 Abs. 3 der Satzung an eine andere steuerbegünstigte Körperschaft gehen, die das Projekt frei zugänglich weiterführt.
>
> **§ 8 Schlussbestimmungen**
> Änderungen bedürfen der Textform. Ist eine Bestimmung unwirksam, bleibt der Vertrag im Übrigen wirksam.
>
> [Ort, Datum]
>
> ______________________ Gründerin  ______________________ für den Verein
>
> Anlage 1: Konten und Zugänge (Checkliste unten, ausgefüllt)

**Interessenkonflikt:** Ist die Gründerin selbst im Vorstand, unterschreiben für den Verein die **anderen** vertretungsberechtigten Vorstandsmitglieder (§ 181 BGB – kein Vertrag mit sich selbst). Die Gründungsversammlung hat den Vertrag unter TOP 7 gebilligt.

**Zuwendungsbestätigung:** Die Übertragung von Nutzungsrechten ist grundsätzlich eine Sachspende, aber schwer zu bewerten. Einfacher: auf eine Spendenquittung verzichten. Erstattete Gründungskosten sind Aufwandsersatz, keine Spende.

## Checkliste: Konten und Zugänge (Anlage 1)

| Dienst | Heute | Umstellung | Erledigt |
| --- | --- | --- | --- |
| **GitHub** | Repo `politik-duell/politik-duell` in der Organisation `politik-duell` (Owner: Gründerin) | Organisation angelegt und Repo übertragen, Links im Repo (`betreiber.ts` → `quellcode`/Impressum, `supabase/EINRICHTEN.md`) angepasst (September 2026). Offen: Organisation dem Verein übergeben (mind. 2 Owner aus dem Vorstand). | [ ] |
| **Vercel** | Projekt `politik-duell` im privaten Konto | Team für den Verein anlegen, Projekt übertragen (*Settings → Transfer*); Tarif klären (Hobby nur für persönliche, nicht-kommerzielle Nutzung; ein Verein als Inhaber oder ein Spendenaufruf auf der Seite passt nicht mehr dazu). Domain-Verbindung und Umgebungsvariablen prüfen. | [ ] |
| **Supabase** | Projekt `wer-liefert` (`xfprvshhexhzhfgkfxpi`) | Organisation des Vereins anlegen, Projekt übertragen (*Project Settings → General → Transfer project*); Mitglieder mit eigenen Konten statt geteiltem Passwort. Admins in Tabelle `admins` prüfen. | [ ] |
| **Mistral** | privates Konto, Secret `MISTRAL_API_KEY` | Organisation/Workspace für den Verein mit Vereinskonto als Zahlungsmittel; neuen API-Schlüssel erzeugen, in Supabase-Secret eintragen, alten löschen. Ausgabenlimit wieder setzen, Training-Opt-out prüfen. | [ ] |
| **INWX** (Domains) | `politik-duell.de`, `politikduell.de` | Inhaberwechsel (Owner-Change) auf „Politik-Duell e. V.“; Rechnungen an den Verein. | [ ] |
| **Posteo** | `politik-duell@posteo.de` | Zahlung auf den Verein umstellen, Zugang an Vorstand (Passwortmanager); Wiederherstellungsadresse ändern. | [ ] |
| **Passwortmanager** | – | Gemeinsamer Tresor des Vorstands, mind. zwei Personen mit Zugriff. | [ ] |
| **Zahlungsmittel** | privat | Alle Dienste auf Vereinskonto/-karte umstellen. | [ ] |

## Änderungen in der App

Nach der Übertragung in einem Pull Request:

- [ ] `src/rechtliches/betreiber.ts`: `name: 'Politik-Duell e. V.'`, Anschrift des Vereins, `inhaltlichVerantwortlich` (eine natürliche Person aus dem Vorstand mit Anschrift), `quellcode` auf die neue Organisation
- [ ] Impressum (`src/rechtliches/Rechtliches.tsx`): „vertreten durch den Vorstand: [Namen]“, „Registergericht: Amtsgericht [Ort], Registernummer: VR [Nummer]“, Hinweis auf Gemeinnützigkeit
- [ ] Datenschutzerklärung: Verantwortlicher ist der Verein; `DATENSCHUTZ_STAND` aktualisieren
- [ ] Auftragsverarbeitungsverträge (Vercel, Supabase, Mistral) im Namen des Vereins abschließen bzw. übernehmen
- [ ] `CLAUDE.md` (Branding, offene Punkte), `README.md`, `supabase/EINRICHTEN.md`: neue Organisation, neue Links
- [ ] Optional: Hinweis „Getragen vom gemeinnützigen Politik-Duell e. V.“ in der Fußzeile, Seite mit Satzung, Vorstand, Methodenbeirat und Geldgebern
