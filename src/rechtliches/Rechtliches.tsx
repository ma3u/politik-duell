import { useEffect } from 'react'
import { Logo } from '../components/Logo'
import { BETREIBER, betreiberVollstaendig, DATENSCHUTZ_STAND } from './betreiber'
import { Methode } from './Methode'

// Impressum (#/impressum), Datenschutzerklärung (#/datenschutz) und Methode (#/methode).
// Die Texte beschreiben, was die App tatsächlich tut – bei Änderungen an
// Datenflüssen (neue Dienste, neue gespeicherte Felder) hier mit anpassen.

export type RechtsSeite = 'impressum' | 'datenschutz' | 'methode'

function Unvollstaendig() {
  if (betreiberVollstaendig()) return null
  return (
    <p className="recht-warnung" role="alert">
      Entwurf: Die Angaben zum Betreiber fehlen noch (Datei <code>src/rechtliches/betreiber.ts</code>).
    </p>
  )
}

function Anschrift() {
  return (
    <p>
      {BETREIBER.name}
      <br />
      {BETREIBER.strasse}
      <br />
      {BETREIBER.ort}
      <br />
      E-Mail: <a href={`mailto:${BETREIBER.email}`}>{BETREIBER.email}</a>
      {BETREIBER.telefon && (
        <>
          <br />
          Telefon: {BETREIBER.telefon}
        </>
      )}
    </p>
  )
}

export function Rechtliches({ seite, onZurueck }: { seite: RechtsSeite; onZurueck: () => void }) {
  useEffect(() => {
    scrollTo(0, 0)
  }, [seite])

  return (
    <main className="seite recht">
      <header className="recht-kopf">
        <button className="knopf knopf-leise" onClick={onZurueck}>
          ← Zurück
        </button>
        <a href="#/" className="recht-marke" aria-label="Politik-Duell – Startseite">
          <Logo groesse={32} />
        </a>
      </header>
      <Unvollstaendig />
      {seite === 'impressum' ? <Impressum /> : seite === 'methode' ? <Methode /> : <Datenschutz />}
    </main>
  )
}

function Impressum() {
  return (
    <article>
      <h1>Impressum</h1>
      <h2>Angaben nach § 5 DDG</h2>
      <Anschrift />
      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>{BETREIBER.inhaltlichVerantwortlich}</p>
      <h2>Zum Projekt</h2>
      <p>
        „Politik-Duell“ ist ein unabhängiges, nicht-kommerzielles Spiel. Es wird von keiner Partei beauftragt oder
        finanziert. Alle Parteien werden nach denselben, offen einsehbaren Kriterien bewertet; die Bewertungen und
        ihre Belege stehen im <a href={BETREIBER.quellcode}>öffentlichen Quellcode</a>. Fehler oder fehlende Belege
        bitte dort melden oder per E-Mail.
      </p>
      <h2>Haftung für Links</h2>
      <p>
        Die Beleg-Links führen zu Wahlprogrammen und Studien auf fremden Websites. Für deren Inhalte sind allein die
        jeweiligen Anbieter verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar; wird uns
        einer bekannt, entfernen wir den Link.
      </p>
    </article>
  )
}

function Datenschutz() {
  return (
    <article>
      <h1>Datenschutzerklärung</h1>
      <p className="meta">Stand: {DATENSCHUTZ_STAND}</p>

      <h2>Das Wichtigste in Kürze</h2>
      <ul>
        <li>Keine Konten, keine Cookies, kein Tracking, keine Werbung.</li>
        <li>Wir speichern keine IP-Adressen und kein Audio.</li>
        <li>
          Was du eingibst, ordnet eine KI (Mistral AI, Paris) ein. Wir speichern davon eine anonyme, neutrale
          Kurzfassung und ein Stichwort. Deinen Originaltext speichern wir nur, wenn eine Runde ohne Wertung endet –
          nur für uns zur Prüfung sichtbar und höchstens 30 Tage.
        </li>
        <li>Die Wortwolke im Hintergrund zeigt nur die Themen, die das Spiel schon werten kann – keine Eingaben von Spielenden.</li>
      </ul>

      <h2>1. Verantwortlich</h2>
      <Anschrift />
      <p>
        Schreibst du uns per E-Mail, verwenden wir deine Adresse und Nachricht nur, um dir zu antworten (Art. 6 Abs. 1
        lit. f DSGVO), und löschen beides, wenn die Sache erledigt ist. Das Postfach liegt bei Posteo e. K. in Berlin.
      </p>

      <h2>2. Aufruf der Website</h2>
      <p>
        Die Website wird bei Vercel Inc. (USA) gehostet und über deren weltweites Netz ausgeliefert. Beim Aufruf
        verarbeitet Vercel technisch notwendige Verbindungsdaten (IP-Adresse, Zeitpunkt, aufgerufene Datei,
        Browserkennung) in Server-Logs, um die Seite auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage ist
        unser berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit Vercel besteht ein
        Vertrag zur Auftragsverarbeitung; Übermittlungen in die USA stützen sich auf das EU-US Data Privacy Framework
        bzw. auf Standardvertragsklauseln (Art. 45, 46 DSGVO).
      </p>

      <h2>3. Spieldaten und Datenbank</h2>
      <p>
        Parteien, Themen und Bewertungen lädt die App aus unserer Datenbank bei Supabase (Supabase Inc.,
        Rechenzentrum in Frankfurt am Main). Supabase verarbeitet dabei technisch notwendige Verbindungsdaten
        einschließlich der IP-Adresse in kurzzeitigen Zugriffsprotokollen (Art. 6 Abs. 1 lit. f DSGVO,
        Auftragsverarbeitungsvertrag). In unseren eigenen Tabellen speichern wir keine IP-Adressen.
      </p>

      <h2>4. Deine Eingaben im Spiel</h2>
      <p>
        Wenn du ein Problem eingibst oder einsprichst, schickt die App den Text zusammen mit der gewählten Rolle und den
        beiden gewählten Parteien an unsere Funktion bei Supabase (Frankfurt). Diese bittet Mistral AI SAS (Paris,
        Frankreich) um eine Einordnung: Ist es ein Problem, eine Forderung oder eine Haltung, und zu welchem Thema
        gehört es? Die Punkte vergibt nicht die KI, sondern unsere feste Bewertungstabelle.
      </p>
      <p>
        Deine Eingaben können politische Meinungen erkennen lassen – das sind besonders geschützte Daten (Art. 9
        DSGVO). Deshalb fragen wir vor dem Spielstart ausdrücklich nach deiner Einwilligung (Art. 6 Abs. 1 lit. a und
        Art. 9 Abs. 2 lit. a DSGVO). Bitte gib keine Namen, Adressen oder anderen persönlichen Details ein.
      </p>
      <p>
        Mistral verarbeitet den Text als Auftragsverarbeiter nur für die Einordnung und nicht zum Training seiner
        Modelle; nach seinen Bedingungen kann Mistral Anfragen für begrenzte Zeit zur Missbrauchserkennung aufbewahren.
        Den Originaltext prüfen wir automatisch auf Beleidigungen, Namen und Kontaktdaten. Endet die Runde mit einer
        Wertung, verwerfen wir ihn danach. Endet sie ohne Wertung (siehe unten), bewahren wir ihn kurz auf.
      </p>
      <p>
        <strong>Gespeichert wird pro Runde:</strong> eine neutrale Kurzfassung des Problems (höchstens 200 Zeichen,
        von der KI ohne Namen und persönliche Details formuliert), ein Stichwort, das zugeordnete Thema, die beiden
        gewählten Parteien, deren Punkte und der Zeitpunkt. Bleibt es bei einer Forderung oder Haltung, speichern wir
        statt Punkten nur die Nummer des erkannten Lösungswegs bzw. der erkannten Wertfrage aus unserem Katalog – nicht,
        welche Seite du vertrittst. Deine Rolle und dein Name im Spiel werden nicht
        gespeichert. Diese Daten lassen sich keiner Person zuordnen. Probleme zu Themen, die wir noch nicht bewertet
        haben, landen zusätzlich mit einer kurzen vorläufigen Einschätzung in einer Liste zur redaktionellen Prüfung.
      </p>
      <p>
        <strong>Runden ohne Wertung:</strong> Endet eine Runde ohne Punkte – weil du eine Haltung oder Forderung
        nennst, das Spiel auf eine Äußerung nicht eingeht, kein Thema oder keine Ursache erkennbar ist oder eine
        Partei zum Thema noch nicht erfasst ist –, speichern wir deine Eingaben dieser Runde im Wortlaut, dazu den
        Grund, das erkannte Thema, die Kurzfassung und den Zeitpunkt. Nicht dabei sind Parteien, Rolle, Bundesland,
        Name im Spiel oder eine Verbindung zur gespeicherten Runde. Zweck: Wir prüfen, ob die KI richtig eingeordnet
        hat, und verbessern Einordnung und Themenkatalog (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO, deine
        Einwilligung vor dem Spielstart). Lesen können die Einträge nur die Admins des Projekts; sie werden nie
        veröffentlicht. Wir löschen sie, sobald wir sie gesichtet haben, spätestens nach 30 Tagen automatisch. Bitte
        gib deshalb erst recht keine Namen oder anderen persönlichen Details ein.
      </p>
      <p>
        <strong>Wortwolke:</strong> Die Wortwolke auf der Startseite zeigt die Themen, die das Spiel schon werten kann. Eingaben
        und Stichwörter von Spielenden erscheinen dort nicht.
      </p>
      <p>
        <strong>Widerruf:</strong> Du kannst deine Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen,
        indem du nicht weiterspielst. Bereits gespeicherte Kurzfassungen und Eingaben sind anonym; wir können sie dir
        deshalb nicht mehr zuordnen und nicht gezielt löschen. Eingaben ohne Wertung löschen wir ohnehin nach
        spätestens 30 Tagen.
      </p>

      <h2>5. Spracheingabe</h2>
      <p>
        Der Mikrofon-Knopf nutzt die Spracherkennung deines Browsers. Dabei schickt der Browser die Aufnahme an den
        Dienst seines Herstellers – bei Chrome an Google, bei Safari an Apple (teils auch direkt auf dem Gerät). Das
        geschieht zwischen dir und dem Browser-Hersteller nach dessen Datenschutzbestimmungen; wir erhalten nur den
        erkannten Text und nie Audio. Die Spracheingabe ist freiwillig – du kannst jederzeit tippen.
      </p>

      <h2>6. Schutz vor Missbrauch</h2>
      <p>
        Damit die KI nicht überlastet wird, begrenzen wir die Anfragen. Dafür erzeugt die App eine zufällige
        Sitzungsnummer und legt sie im Sitzungsspeicher des Browsers ab (sessionStorage – wird beim Schließen des Tabs
        gelöscht). Auf dem Server steht sie mit einem Zähler höchstens einen Tag lang. Sie enthält keine Angaben
        über dich. Das Speichern im Browser ist für den Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG),
        Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>7. Links, Teilen und Schriften</h2>
      <p>
        Beleg-Links führen zu fremden Websites (z. B. Wahlprogramme, Studien); erst mit dem Klick gelten deren
        Datenschutzbestimmungen. „Teilen“ nutzt die Teilen-Funktion deines Geräts bzw. die Zwischenablage – wir
        erfahren davon nichts. Wir laden keine Schriften oder Skripte von fremden Servern.
      </p>

      <h2>8. Moderation</h2>
      <p>
        Nur für die Moderation gibt es Konten (Supabase Auth, E-Mail und Passwort). Sie betreffen ausschließlich
        unser Moderationsteam, nicht die Spieler:innen.
      </p>

      <h2 id="pruefung">9. Prüfung von Bewertungen</h2>
      <p>
        Die Bewertungen der Maßnahmen lassen wir von Personen prüfen, die wir persönlich einladen. Sie erhalten einen
        persönlichen Link, ein Konto gibt es nicht. Dieser Abschnitt betrifft nur die Prüfenden, nicht die
        Spieler:innen.
      </p>
      <p>
        <strong>Gespeichert werden</strong> (bei Supabase, Frankfurt am Main): der Name, den wir beim Einladen
        eintragen, die zugeteilten Themen, ein Hashwert des Links (nicht der Link selbst), der Zeitpunkt der
        Einwilligung und ob der Name öffentlich genannt werden darf; je Maßnahme die beiden Werte, Notizen, ob die
        Empfehlung angesehen und danach etwas geändert wurde, ob abgesendet ist und Zeitpunkte. IP-Adressen speichern
        wir nicht.
      </p>
      <p>
        <strong>Zweck:</strong> Aus den Bewertungen aller Prüfenden bilden wir je Maßnahme den Median. Im öffentlichen
        Quellcode stehen danach nur Anzahl, Median, Spannweite und Datum – keine Namen und keine Einzelwerte. Den Namen
        nennen wir auf der Seite „So bewerten wir“ nur, wenn die Person dem ausdrücklich zugestimmt hat; sonst nur die
        Zahl der Prüfenden.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Bewertungen von Parteimaßnahmen können politische Meinungen erkennen lassen.
        Wir verarbeiten sie deshalb nur mit ausdrücklicher Einwilligung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a
        DSGVO), um die wir vor der ersten Bewertung bitten. Einsehen kann die Daten nur der Betreiber in der
        Admin-Ansicht; andere Prüfende sehen sie nicht.
      </p>
      <p>
        <strong>Speicherdauer und Löschung:</strong> Wir löschen Einladung und Bewertungen, sobald sie für die
        Nachvollziehbarkeit der Punkte nicht mehr gebraucht werden, spätestens mit dem Ende des Projekts. Die
        Einwilligung lässt sich jederzeit auf der Prüfseite widerrufen („Einwilligung widerrufen und alles löschen“)
        oder per E-Mail. Dann löschen wir alle Bewertungen der Person sofort, auf Wunsch auch die Einladung mit dem
        Namen. Bereits übernommene Mediane enthalten keine personenbezogenen Daten und bleiben bestehen.
      </p>

      <h2 id="testphase">10. Geschlossene Testphase</h2>
      <p>
        Für die Testphase laden wir einzelne Personen mit einem persönlichen Zugangslink ein. Mit diesem Link zeigt das
        Spiel zusätzlich vorläufige Bewertungen, die noch nicht von Menschen geprüft sind. Dieser Abschnitt betrifft nur
        Personen mit Zugangslink.
      </p>
      <p>
        <strong>Gespeichert werden:</strong> in deinem Browser der Zugangscode aus dem Link (localStorage), damit du
        die Testphase nicht bei jedem Besuch neu öffnen musst – bis du „Testphase verlassen“ wählst. Das ist für die
        gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Bei uns (Supabase, Frankfurt am Main):
        ein Hashwert des Codes (nicht der Code selbst), ein Name zur Unterscheidung der Zugänge, den wir beim Anlegen
        eintragen, und das Anlegedatum. Runden aus der Testphase sind als solche markiert, damit wir sie getrennt
        auswerten können; sie werden nicht mit dem Zugang verknüpft. Für Eingaben im Spiel gilt Abschnitt 4.
      </p>
      <p>
        <strong>Löschung:</strong> Wir löschen die Zugänge mit dem Ende der Testphase oder vorher auf Wunsch per
        E-Mail.
      </p>

      <h2>11. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
        und Widerspruch (Art. 15–21 DSGVO) sowie auf Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO). Da wir keine
        Daten speichern, die sich dir zuordnen lassen, können wir Anfragen zu gespeicherten Kurzfassungen meist nicht
        beantworten (Art. 11 DSGVO). Für Prüfende gilt das nicht: Ihre Daten sind ihnen zugeordnet, Auskunft,
        Berichtigung und Löschung erledigen wir wie in Abschnitt 9 beschrieben. Schreib uns trotzdem gern: <a href={`mailto:${BETREIBER.email}`}>{BETREIBER.email}</a>.
      </p>
      <p>
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für uns
        zuständigen: <a href={BETREIBER.aufsichtsbehoerde.url}>{BETREIBER.aufsichtsbehoerde.name}</a>.
      </p>
    </article>
  )
}
