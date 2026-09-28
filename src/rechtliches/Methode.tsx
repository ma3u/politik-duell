import { useEffect, useState } from 'react'
import { supabase } from '../data/quelle'
import { BETREIBER } from './betreiber'
import { UMSETZBARKEIT, WIRKSAMKEIT } from './massstab'

// „So bewerten wir“ (#/methode): offene Methode und Fehlermeldung.
// Die Skalen hier müssen zu den Bewertungen in der Datenbank passen – wer
// Maßnahmen bewertet, richtet sich nach dieser Seite.

export function Skala({ stufen }: { stufen: string[] }) {
  return (
    <dl className="skala">
      {stufen.map((text, wert) => (
        <div key={wert}>
          <dt>{wert}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  )
}

interface PruefendeJeThema {
  thema_id: number
  thema: string
  anzahl: number
  namen: string[]
}

/** „bewertet von A, B und einer weiteren Person“ – Namen nur mit Einwilligung der Person. */
function bewertetVon({ anzahl, namen }: PruefendeJeThema): string {
  const rest = anzahl - namen.length
  if (namen.length === 0) return anzahl === 1 ? 'einer unabhängigen Person' : `${anzahl} unabhängigen Prüfenden`
  const teile = [...namen, ...(rest > 0 ? [rest === 1 ? 'einer weiteren Person' : `${rest} weiteren Personen`] : [])]
  return teile.length === 1 ? teile[0] : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`
}

/** Wer welche Themen bewertet hat (aus Supabase; ohne Verbindung oder ohne Einträge unsichtbar). */
function Pruefende() {
  const [liste, setListe] = useState<PruefendeJeThema[]>([])
  useEffect(() => {
    let aktiv = true
    void supabase
      ?.rpc('pruefende_oeffentlich')
      .then(({ data }) => aktiv && Array.isArray(data) && setListe(data as PruefendeJeThema[]))
    return () => {
      aktiv = false
    }
  }, [])
  if (!liste.length) return null
  return (
    <ul>
      {liste.map((e) => (
        <li key={e.thema_id}>
          {e.thema}: bewertet von {bewertetVon(e)}
        </li>
      ))}
    </ul>
  )
}

export function Methode() {
  return (
    <article>
      <h1>So bewerten wir</h1>
      <p>
        Das Politik-Duell fragt nicht, welche Partei sympathischer ist, sondern wer liefert: welche Partei für ein
        konkretes Alltagsproblem die wirksamste und umsetzbare Lösung anbietet. Alle Parteien werden nach denselben
        Kriterien bewertet. Das Ergebnis steht vorher nicht fest: Liefert eine Partei nachweislich die beste Lösung, gewinnt sie – egal welche.
      </p>

      <h2>1. Vom Problem zu den Ursachen</h2>
      <p>
        Jedes Thema (z. B. Miete) hat Ursachen, die wir mit einer Quelle belegen (z. B. „zu wenig Neubau“). Nennst du ein
        Problem, ordnet eine KI es einem Thema und den passenden Ursachen zu. Die KI vergibt keine Punkte, nennt keine
        Quellen und bewertet keine Parteien.
      </p>
      <p>
        Die Ursachen legen wir fest, bevor wir in die Wahlprogramme schauen. Sie beschreiben, was schiefläuft, nicht wie
        es zu beheben ist – so können Lösungen aus ganz unterschiedlichen Richtungen Punkte bekommen. Wir stützen uns auf
        Quellen unterschiedlicher Ausrichtung und prüfen, ob die Problemdiagnosen aus der Fachdebatte vorkommen. Eine
        Diagnose, die sich nicht unabhängig belegen lässt, nehmen wir nicht auf – gleich, wer sie vertritt.
      </p>

      <h2>2. Maßnahmen aus den Wahlprogrammen</h2>
      <p>
        Für jede Partei erfassen wir die Maßnahmen aus ihrem Wahlprogramm zur Bundestagswahl 2025, die an diesen
        Ursachen ansetzen – mit wörtlichem Zitat, Seitenangabe, Stand des Programms und, wo vorhanden, einer Studie zur
        Wirkung. Jede Bewertung hat eine kurze Begründung, die in der Auflösung angezeigt wird. Ins Spiel kommt ein
        Thema für eine Partei erst, wenn alle Einträge dazu geprüft sind.
      </p>
      <p>
        <strong>Wer bewertet?</strong> Mindestens zwei, besser drei unabhängige Prüfende mit Fachwissen, die wir
        persönlich einladen. Jede Person bewertet die Maßnahmen eines Themas für sich: ohne Parteinamen, in gemischter
        Reihenfolge und ohne die Bewertungen der anderen zu sehen. Unseren Entwurf mit Begründung sehen sie erst,
        nachdem sie selbst bewertet haben. Je Maßnahme zählt der Median der Einzelwerte, getrennt für Wirksamkeit und
        Umsetzbarkeit; die Punkte ergeben sich erst daraus. Liegen die Einschätzungen weit auseinander, klären wir den
        Maßstab, bevor wir die Werte übernehmen. Zitat, Seite und Zuordnung zu den Ursachen prüfen wir zusätzlich
        selbst.
      </p>
      <Pruefende />
      <p>
        Wer als unabhängige Prüferin oder unabhängiger Prüfer mitmachen möchte, ist herzlich eingeladen (Kontakt im
        Impressum).
      </p>

      <h2>3. Zwei Kriterien, je 0 bis 3 Punkte</h2>
      <h3>Wirksamkeit: Wie stark hilft die Maßnahme den Betroffenen?</h3>
      <p>
        Jedes Thema hat ein Ziel aus Sicht der Menschen, die das Problem haben – bei Miete etwa: eine passende Wohnung
        finden und die Miete dauerhaft bezahlen können. Wir bewerten, wie stark eine Maßnahme über die Ursache, an der
        sie ansetzt, zu diesem Ziel beiträgt.
      </p>
      <Skala stufen={WIRKSAMKEIT} />
      <p>
        Die höchste Stufe setzt voraus, dass die Wirkung belegt ist – durch übereinstimmende Studien oder Erfahrungen
        anderswo. Kommt die Forschung zu unterschiedlichen Ergebnissen, vergeben wir höchstens 2 und nennen in der
        Begründung beide Seiten.
      </p>
      <h3>Umsetzbarkeit: Ist sie rechtlich, finanziell und zeitlich realistisch?</h3>
      <Skala stufen={UMSETZBARKEIT} />
      <p>
        <strong>Rolle:</strong> Wählst du eine Rolle (z. B. Mieter:in), kann eine Maßnahme für dich mehr oder weniger
        bringen. Dann verschiebt sich ihre Wirksamkeit für dich um bis zu zwei Stufen (innerhalb von 0 bis 3). Solche
        Auf- oder Abwertungen sind je Maßnahme einzeln begründet und werden angezeigt.
      </p>

      <h2>4. Punkte in der Runde</h2>
      <ul>
        <li>
          Pro Ursache zählt die beste Maßnahme einer Partei: Wirksamkeit × Umsetzbarkeit, also 0 bis 9 Punkte. So
          bringt eine Maßnahme ohne Wirkung keine Punkte, auch wenn sie leicht umzusetzen wäre – und eine wirksame, die
          sich nicht umsetzen lässt, ebenso wenig.
        </li>
        <li>
          Mehrere Maßnahmen zur selben Ursache ergeben keinen Zuschlag – sonst gewänne, wer mehr aufschreibt, nicht wer
          besser ansetzt.
        </li>
        <li>
          Die Rundenpunkte sind die Summe über alle zugeordneten Ursachen. Parteien setzen oft an verschiedenen Ursachen
          an; so können sehr unterschiedliche Programme ähnlich viele Punkte erreichen.
        </li>
        <li>Die höhere Summe bekommt den Spielpunkt, bei Gleichstand beide.</li>
        <li>
          Finden wir im Programm keine Maßnahme zu den Ursachen, gibt es 0 Punkte. Das heißt nur: Im Wahlprogramm mit
          dem angegebenen Stand steht dazu nichts – nicht, dass die Partei sich nie dazu geäußert hätte. Steht zum
          ganzen Thema nichts im Programm, halten wir fest, was wir durchsucht haben.
        </li>
        <li>
          Haben wir das Programm einer Partei zu einem Thema noch nicht vollständig ausgewertet und geprüft, zeigen wir
          „noch nicht erfasst“. Dann wird die Runde nicht gewertet: Fehlende Daten sollen keiner Partei einen Punkt
          kosten. Bei der besten Lösung aller Parteien vergleichen wir nur Parteien, für die das Thema erfasst ist.
        </li>
        <li>
          Themen, die wir noch nicht bewertet haben, zeigen wir als „ungeprüft – keine Wertung“, ohne Punkte und ohne
          Links.
        </li>
      </ul>

      <h2>5. Was die Punkte bedeuten – und was nicht</h2>
      <p>
        Die Punkte sind eine Einschätzung nach dieser Methode, bezogen auf einzelne Alltagsprobleme. Sie sind kein
        Gesamturteil über eine Partei und keine Wahlempfehlung. Ein Spiel deckt nur die fünf genannten Probleme ab.
      </p>

      <h2>6. Offen und korrigierbar</h2>
      <p>
        Alle Bewertungen, Begründungen und Belege stehen im <a href={BETREIBER.quellcode}>öffentlichen Quellcode</a>.
        Änderungen sind dort nachvollziehbar und brauchen immer eine Quelle.
      </p>

      <h2 id="fehler">7. Fehler melden</h2>
      <p>
        Ist eine Maßnahme falsch wiedergegeben, fehlt etwas oder ist ein Beleg veraltet? Bitte melde es mit Link auf die
        Stelle im Programm:
      </p>
      <ul>
        <li>
          per E-Mail: <a href={`mailto:${BETREIBER.email}?subject=Politik-Duell%20%E2%80%93%20Fehler`}>{BETREIBER.email}</a>
        </li>
        <li>
          oder öffentlich auf <a href={`${BETREIBER.quellcode}/issues/new`}>GitHub</a>
        </li>
      </ul>
      <p>
        Wir prüfen jede Meldung und korrigieren belegte Fehler so schnell wie möglich. Parteien können ihre Einträge
        jederzeit prüfen und eine Stellungnahme schicken.
      </p>
    </article>
  )
}
