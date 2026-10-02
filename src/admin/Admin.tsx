import type { Session } from '@supabase/supabase-js'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { FILTER_TEXTE, pruefeText, type FilterGrund } from '../../supabase/functions/_shared/moderation'
import { Logo } from '../components/Logo'
import { adminDb, type AdminRunde, type ReviewEintrag } from './client'
import { Pruefung } from './Pruefung'
import { Testphase } from './Testphase'

// Einfache Admin-Ansicht (#/admin): Probleme für eine öffentliche Anzeige freigeben oder
// ablehnen, Review-Warteschlange (Themen ohne Daten) abhaken, Prüfende einladen
// und ihre Bewertungen auswerten.
// Zugriff regelt die Datenbank: Nur Konten in der Tabelle `admins` sehen etwas.

type Reiter = 'offen' | 'gestoppt' | 'frei' | 'abgelehnt' | 'review' | 'pruefung' | 'testphase'

const REITER: { id: Reiter; name: string }[] = [
  { id: 'offen', name: 'Offen' },
  { id: 'gestoppt', name: 'Vom Filter gestoppt' },
  { id: 'frei', name: 'Freigegeben' },
  { id: 'abgelehnt', name: 'Abgelehnt' },
  { id: 'review', name: 'Neue Themen' },
  { id: 'pruefung', name: 'Prüfung' },
  { id: 'testphase', name: 'Testphase' },
]

function reiterVon(r: AdminRunde): Exclude<Reiter, 'review' | 'pruefung' | 'testphase'> {
  if (r.freigegeben) return 'frei'
  if (r.abgelehnt) return 'abgelehnt'
  return r.filter_grund ? 'gestoppt' : 'offen'
}

const zeit = (iso: string) =>
  new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const filterText = (grund: string | null) =>
  grund ? (FILTER_TEXTE[grund as FilterGrund] ?? grund) : null

export function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  // Ergebnis der Admin-Prüfung je Konto; solange es fehlt: „laedt“.
  const [adminFuer, setAdminFuer] = useState<{ id: string; admin: boolean } | null>(null)

  useEffect(() => {
    if (!adminDb) return
    adminDb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = adminDb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!adminDb || !session) return
    const id = session.user.id
    adminDb.rpc('ist_admin').then(({ data, error }) => setAdminFuer({ id, admin: !error && data === true }))
  }, [session])

  const pruefung =
    !session || adminFuer?.id !== session.user.id ? 'laedt' : adminFuer.admin ? 'admin' : 'kein-admin'

  return (
    <div className="app admin">
      <header className="admin-kopf">
        <a href="#/" className="admin-marke">
          <Logo groesse={36} />
          <span>Politik-Duell · Moderation</span>
        </a>
        {session && (
          <button className="knopf knopf-leise" onClick={() => adminDb?.auth.signOut()}>
            Abmelden
          </button>
        )}
      </header>
      {!adminDb ? (
        <p className="admin-hinweis">Keine Supabase-Verbindung konfiguriert (VITE_SUPABASE_URL fehlt).</p>
      ) : !session ? (
        <Anmeldung />
      ) : pruefung === 'laedt' ? (
        <p className="admin-hinweis">Prüfe Berechtigung …</p>
      ) : pruefung === 'kein-admin' ? (
        <p className="admin-hinweis" role="alert">
          Angemeldet als {session.user.email}, aber ohne Admin-Rechte. Ein Admin muss dieses Konto in der Tabelle{' '}
          <code>admins</code> eintragen (siehe EINRICHTEN.md).
        </p>
      ) : (
        <Moderation />
      )}
    </div>
  )
}

function Anmeldung() {
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)

  async function anmelden(e: FormEvent) {
    e.preventDefault()
    setLaeuft(true)
    setFehler(null)
    const { error } = await adminDb!.auth.signInWithPassword({ email, password: passwort })
    setLaeuft(false)
    if (error) setFehler('Anmeldung fehlgeschlagen. E-Mail und Passwort prüfen.')
  }

  return (
    <form className="admin-anmeldung" onSubmit={anmelden}>
      <h1>Anmelden</h1>
      <label>
        E-Mail
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Passwort
        <input
          type="password"
          autoComplete="current-password"
          required
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
      </label>
      {fehler && (
        <p className="admin-fehler" role="alert">
          {fehler}
        </p>
      )}
      <button className="knopf" disabled={laeuft}>
        {laeuft ? 'Melde an …' : 'Anmelden'}
      </button>
    </form>
  )
}

function Moderation() {
  const db = adminDb!
  const [reiter, setReiter] = useState<Reiter>('offen')
  const [runden, setRunden] = useState<AdminRunde[]>([])
  const [review, setReview] = useState<ReviewEintrag[]>([])
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const [r, q] = await Promise.all([
      db
        .from('runden')
        .select('id, created_at, problem_text, stichwort, filter_grund, status, freigegeben, abgelehnt, moderiert_am')
        .neq('status', 'wert') // Werte sind keine Probleme und kommen nicht zur Freigabe
        .order('created_at', { ascending: false })
        .limit(300),
      db
        .from('review_warteschlange')
        .select('*')
        .eq('erledigt', false)
        .order('created_at', { ascending: false })
        .limit(200),
    ])
    const f = r.error ?? q.error
    setFehler(f ? f.message : null)
    if (r.data) setRunden(r.data as AdminRunde[])
    if (q.data) setReview(q.data as ReviewEintrag[])
  }, [db])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const baldLaden = () => {
      clearTimeout(timer)
      timer = setTimeout(() => void laden(), 500)
    }
    const kanal = db
      .channel('moderation')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'runden' }, baldLaden)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'review_warteschlange' }, baldLaden)
      // Erst laden, wenn der Kanal steht – so geht keine Änderung dazwischen verloren.
      // Klappt Realtime nicht, trotzdem einmal laden.
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') void laden()
      })
    return () => {
      clearTimeout(timer)
      void db.removeChannel(kanal)
    }
  }, [db, laden])

  async function aendern(id: number, werte: Partial<AdminRunde>) {
    const { error } = await db.from('runden').update(werte).eq('id', id)
    if (error) setFehler(error.message)
    await laden()
  }

  async function loeschen(id: number) {
    if (!confirm('Eintrag endgültig löschen?')) return
    const { error } = await db.from('runden').delete().eq('id', id)
    if (error) setFehler(error.message)
    await laden()
  }

  async function erledigt(id: number) {
    const { error } = await db.from('review_warteschlange').update({ erledigt: true }).eq('id', id)
    if (error) setFehler(error.message)
    await laden()
  }

  const anzahl = (id: Reiter) =>
    id === 'pruefung' || id === 'testphase' ? null : id === 'review' ? review.length : runden.filter((r) => reiterVon(r) === id).length
  const sichtbar = runden.filter((r) => reiterVon(r) === reiter)
  const jetzt = () => new Date().toISOString()

  return (
    <main>
      <nav className="admin-reiter" aria-label="Bereiche">
        {REITER.map((r) => (
          <button
            key={r.id}
            className={r.id === reiter ? 'aktiv' : ''}
            aria-current={r.id === reiter ? 'page' : undefined}
            onClick={() => setReiter(r.id)}
          >
            {r.name} {anzahl(r.id) !== null && <span className="admin-zahl">{anzahl(r.id)}</span>}
          </button>
        ))}
      </nav>
      {fehler && (
        <p className="admin-fehler" role="alert">
          {fehler}
        </p>
      )}

      {reiter === 'pruefung' ? (
        <Pruefung />
      ) : reiter === 'testphase' ? (
        <Testphase />
      ) : reiter === 'review' ? (
        <>
          <p className="admin-hinweis">
            Probleme ohne passendes Thema in der Datenbank. Neue Themen und Maßnahmen werden mit Quellen im Repo
            ergänzt; hier nur abhaken, was gesichtet ist.
          </p>
          {review.length === 0 && <p className="admin-leer">Nichts offen.</p>}
          <ul className="admin-liste">
            {review.map((e) => (
              <li key={e.id} className="admin-eintrag">
                <p className="admin-text">{e.problem_text}</p>
                {e.einschaetzung && <p className="admin-klein">KI-Einschätzung (ungeprüft): {e.einschaetzung}</p>}
                <div className="admin-aktionen">
                  <span className="admin-klein">{zeit(e.created_at)}</span>
                  <button className="knopf knopf-klein" onClick={() => erledigt(e.id)}>
                    Gesichtet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          {reiter === 'offen' && (
            <p className="admin-hinweis">
              Nur neutrale Stichwörter ohne Namen, Orte oder Beleidigungen freigeben. Freigegebene Stichwörter
              erscheinen derzeit nirgends öffentlich: Die Wortwolke zeigt die erfassten Themen.
            </p>
          )}
          {sichtbar.length === 0 && <p className="admin-leer">Keine Einträge.</p>}
          <ul className="admin-liste">
            {sichtbar.map((r) => (
              <RundenEintrag
                key={r.id}
                runde={r}
                onFreigeben={(stichwort) =>
                  aendern(r.id, { stichwort, freigegeben: true, abgelehnt: false, moderiert_am: jetzt() })
                }
                onAblehnen={() => aendern(r.id, { freigegeben: false, abgelehnt: true, moderiert_am: jetzt() })}
                onZuruecksetzen={() => aendern(r.id, { freigegeben: false, abgelehnt: false, moderiert_am: null })}
                onLoeschen={() => loeschen(r.id)}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  )
}

function RundenEintrag({
  runde,
  onFreigeben,
  onAblehnen,
  onZuruecksetzen,
  onLoeschen,
}: {
  runde: AdminRunde
  onFreigeben: (stichwort: string) => void
  onAblehnen: () => void
  onZuruecksetzen: () => void
  onLoeschen: () => void
}) {
  const [stichwort, setStichwort] = useState(runde.stichwort ?? runde.problem_text.slice(0, 40))
  const bereinigt = stichwort.trim().replace(/\s+/g, ' ')
  const gueltig = bereinigt.length >= 1 && bereinigt.length <= 40
  const warnung = filterText(pruefeText(bereinigt))
  const offen = !runde.freigegeben && !runde.abgelehnt

  return (
    <li className="admin-eintrag">
      <p className="admin-text">{runde.problem_text}</p>
      {runde.filter_grund && <p className="admin-warnung">Filter: {filterText(runde.filter_grund)}</p>}
      {offen ? (
        <label className="admin-stichwort">
          Stichwort
          <input value={stichwort} maxLength={40} onChange={(e) => setStichwort(e.target.value)} />
        </label>
      ) : (
        <p className="admin-klein">
          Stichwort: <strong>{runde.stichwort ?? '–'}</strong>
        </p>
      )}
      {offen && warnung && <p className="admin-warnung">Achtung, Stichwort: {warnung}</p>}
      <div className="admin-aktionen">
        <span className="admin-klein">
          {zeit(runde.created_at)} · {runde.status === 'gewertet' ? 'gewertet' : runde.status === 'unvollstaendig' ? 'Partei noch nicht erfasst' : 'ungeprüft'}
        </span>
        {offen ? (
          <>
            <button className="knopf knopf-klein" disabled={!gueltig} onClick={() => onFreigeben(bereinigt)}>
              Freigeben
            </button>
            <button className="knopf knopf-klein knopf-leise" onClick={onAblehnen}>
              Ablehnen
            </button>
          </>
        ) : (
          <button className="knopf knopf-klein knopf-leise" onClick={onZuruecksetzen}>
            {runde.freigegeben ? 'Zurückziehen' : 'Wieder öffnen'}
          </button>
        )}
        <button className="knopf knopf-klein knopf-gefahr" onClick={onLoeschen}>
          Löschen
        </button>
      </div>
    </li>
  )
}
