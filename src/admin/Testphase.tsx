import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { neuerToken, tokenHash } from '../../supabase/functions/_shared/pruefung'
import { adminDb } from './client'

// Admin → Testphase: Zugangslinks für die geschlossene Testphase. Wer einen Link
// hat, sieht im Spiel zusätzlich KI-Entwürfe (mit Hinweis am Ergebnis). Wie bei
// den Prüf-Einladungen steht der Token nur im Link; die Datenbank kennt nur
// seinen SHA-256-Hash. Ein Link lässt sich deshalb nur einmal anzeigen.

interface Zugang {
  id: string
  name: string
  erstellt: string
  gesperrt: boolean
}

const datum = (iso: string) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const linkFuer = (token: string) => `${location.origin}${location.pathname}#/testphase/${token}`

export function Testphase() {
  const db = adminDb!
  const [zugaenge, setZugaenge] = useState<Zugang[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState<{ name: string; url: string } | null>(null)
  const [kopiert, setKopiert] = useState(false)
  const [laeuft, setLaeuft] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const { data, error } = await db
      .from('testphase_zugaenge')
      .select('id, name, erstellt, gesperrt')
      .order('erstellt', { ascending: false })
    // Fehlt die Tabelle, ist die Migration noch nicht eingespielt.
    setFehler(error ? `${error.message} – ist die Migration 20261002000000_testphase.sql ausgeführt?` : null)
    if (data) setZugaenge(data as Zugang[])
  }, [db])

  useEffect(() => {
    let aktiv = true
    void Promise.resolve().then(() => {
      if (aktiv) void laden()
    })
    return () => {
      aktiv = false
    }
  }, [laden])

  async function anlegen(e: FormEvent) {
    e.preventDefault()
    setLaeuft(true)
    setFehler(null)
    const token = neuerToken()
    const { error } = await db.from('testphase_zugaenge').insert({ token_hash: await tokenHash(token), name: name.trim() })
    setLaeuft(false)
    if (error) return setFehler(error.message)
    setLink({ name: name.trim(), url: linkFuer(token) })
    setKopiert(false)
    setName('')
    await laden()
  }

  async function kopieren() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link.url)
      setKopiert(true)
    } catch {
      setFehler('Kopieren nicht möglich – bitte den Link markieren und selbst kopieren.')
    }
  }

  async function sperren(z: Zugang) {
    const { error } = await db.from('testphase_zugaenge').update({ gesperrt: !z.gesperrt }).eq('id', z.id)
    setFehler(error?.message ?? null)
    await laden()
  }

  async function loeschen(z: Zugang) {
    if (!confirm(`Zugang „${z.name}“ löschen? Der Link funktioniert danach nicht mehr.`)) return
    const { error } = await db.from('testphase_zugaenge').delete().eq('id', z.id)
    setFehler(error?.message ?? null)
    await laden()
  }

  return (
    <>
      <p className="admin-hinweis">
        Zugangslinks für die geschlossene Testphase. Mit Link zählen im Spiel auch KI-Entwürfe – deutlich als „vorläufige
        KI-Bewertung“ gekennzeichnet. Ein Link pro Person, damit sich einzelne Zugänge sperren lassen. Der Link bleibt im
        Browser gespeichert, bis die Person „Testphase verlassen“ wählt.
      </p>
      {fehler && (
        <p className="admin-fehler" role="alert">
          {fehler}
        </p>
      )}
      <form className="admin-eintrag pruef-anlegen" onSubmit={anlegen}>
        <p className="admin-text">Neuer Zugang</p>
        <label className="admin-stichwort">
          Name (nur intern sichtbar)
          <input value={name} maxLength={80} required onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="admin-aktionen">
          <button className="knopf knopf-klein" disabled={laeuft || !name.trim()}>
            {laeuft ? 'Lege an …' : 'Zugang anlegen'}
          </button>
        </div>
      </form>

      {link && (
        <div className="admin-eintrag pruef-link" role="status">
          <p className="admin-text">Link für {link.name}</p>
          <p className="admin-warnung">
            Nur jetzt sichtbar – der Link wird nicht gespeichert. Jetzt kopieren und der Person persönlich schicken.
          </p>
          <input readOnly value={link.url} onFocus={(e) => e.target.select()} aria-label="Zugangslink" />
          <div className="admin-aktionen">
            <button className="knopf knopf-klein" onClick={() => void kopieren()}>
              {kopiert ? 'Kopiert ✓' : 'Link kopieren'}
            </button>
            <button className="knopf knopf-klein knopf-leise" onClick={() => setLink(null)}>
              Fertig
            </button>
          </div>
        </div>
      )}

      {zugaenge.length === 0 && !fehler && <p className="admin-leer">Noch keine Zugänge.</p>}
      <ul className="admin-liste">
        {zugaenge.map((z) => (
          <li key={z.id} className="admin-eintrag">
            <p className="admin-text">
              {z.name}
              {z.gesperrt && <span className="admin-warnung"> · gesperrt</span>}
            </p>
            <p className="admin-klein">Angelegt am {datum(z.erstellt)}</p>
            <div className="admin-aktionen">
              <span className="admin-klein" />
              <button className="knopf knopf-klein knopf-leise" onClick={() => void sperren(z)}>
                {z.gesperrt ? 'Entsperren' : 'Sperren'}
              </button>
              <button className="knopf knopf-klein knopf-gefahr" onClick={() => void loeschen(z)}>
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
