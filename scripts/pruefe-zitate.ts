// Prüft alle wörtlichen Zitate gegen die Programm-PDFs: Steht das Zitat auf der
// Seite, auf die der Beleg zeigt? Lädt jedes Programm einmal herunter und legt
// es in .cache/programme/ ab.
// Aufruf: npm run zitate:pruefen              – alle Maßnahmen
//         npm run zitate:pruefen -- --thema 4 – nur ein Thema
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { findeZitat, seiteVon, seitenTexte } from './zitate.ts'

const CACHE = new URL('../.cache/programme/', import.meta.url)

const hinweise: string[] = []

/**
 * Lädt ein Programm. Manche Parteiserver lehnen Verbindungen aus Rechenzentren
 * (z. B. GitHub Actions) ab; dann die Kopie im Internet Archive (web.archive.org,
 * unverändertes Original über „id_“) – mit Hinweis in der Ausgabe.
 */
async function lade(url: string): Promise<Uint8Array> {
  const datei = new URL(`${createHash('sha1').update(url).digest('hex')}.pdf`, CACHE)
  if (existsSync(datei)) return new Uint8Array(readFileSync(datei))
  let daten: Uint8Array
  try {
    daten = await herunterladen(url)
  } catch (e) {
    try {
      // Zeitstempel „jetzt“: die jüngste Kopie; „id_“ liefert die Datei unverändert.
      const jetzt = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
      daten = await herunterladen(`https://web.archive.org/web/${jetzt}id_/${url}`)
      hinweise.push(`Direkt nicht erreichbar (${e instanceof Error ? e.message : e}), geprüft mit der Kopie auf web.archive.org: ${url}`)
    } catch (archiv) {
      const text = (x: unknown) => (x instanceof Error ? x.message : String(x))
      throw new Error(`${text(e)}; Kopie auf web.archive.org: ${text(archiv)}`)
    }
  }
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(datei, daten)
  return daten
}

async function herunterladen(url: string): Promise<Uint8Array> {
  // Manche Parteiserver brechen Verbindungen gelegentlich ab: bis zu dreimal versuchen.
  let res: Response | null = null
  for (let versuch = 1; !res; versuch++) {
    try {
      res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(120_000) })
    } catch (e) {
      // „fetch failed“ allein sagt nichts – die eigentliche Ursache (DNS, TLS, Abbruch) steht in `cause`.
      const ursache = e instanceof Error && e.cause instanceof Error ? `${e.message}: ${e.cause.message}` : String(e)
      if (versuch >= 3) throw new Error(ursache)
      await new Promise((r) => setTimeout(r, 2000 * versuch))
    }
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const daten = new Uint8Array(await res.arrayBuffer())
  // Ein Archiv oder Server liefert manchmal eine HTML-Seite statt des PDFs.
  if (new TextDecoder().decode(daten.slice(0, 5)) !== '%PDF-') throw new Error('keine PDF-Datei')
  return daten
}

const { katalog, fehler: katalogFehler } = pruefeDatenordner()
if (katalogFehler.length) {
  console.error('Datenkatalog fehlerhaft – erst npm run daten:pruefen.')
  process.exit(1)
}

const i = process.argv.indexOf('--thema')
const nurThema = i >= 0 ? Number(process.argv[i + 1]) : null
const massnahmen = katalog.massnahmen.filter((m) => m.zitat && (nurThema === null || m.thema_id === nurThema))
const partei = (id: number) => katalog.parteien.find((p) => p.id === id)?.kurzname ?? String(id)

const jeProgramm = new Map<string, typeof massnahmen>()
for (const m of massnahmen) {
  const url = m.beleg_programm_url.split('#')[0]
  jeProgramm.set(url, [...(jeProgramm.get(url) ?? []), m])
}

const fehler: string[] = []
let ok = 0
let ungeprueft = 0
for (const [url, liste] of jeProgramm) {
  let seiten: string[]
  try {
    seiten = await seitenTexte(await lade(url))
  } catch (e) {
    // Kein Datenfehler, sondern ein gesperrter Server: melden, aber die Prüfung der anderen nicht rot färben.
    hinweise.push(`Programm nicht erreichbar (${e instanceof Error ? e.message : e}): ${url} – ${liste.length} Zitate ungeprüft, bitte von einem normalen Internetanschluss aus prüfen`)
    ungeprueft += liste.length
    continue
  }
  for (const m of liste) {
    const wo = `Maßnahme ${m.id} (${partei(m.partei_id)}${m.land ? `, ${m.land}` : ''})`
    const seite = seiteVon(m.beleg_programm_url)
    if (seite === null) {
      fehler.push(`${wo}: Beleg ohne Seitenanker`)
      continue
    }
    const befund = findeZitat(m.zitat!, seiten, seite)
    if (befund.status === 'ok') ok++
    else if (befund.status === 'andere_seite')
      fehler.push(`${wo}: Zitat steht nicht auf S. ${seite}, sondern auf S. ${befund.seiten.join(', ')} – Seitenanker anpassen`)
    else fehler.push(`${wo}: Zitat nicht im Programm gefunden (S. ${seite}) – Wortlaut prüfen`)
  }
}

// In GitHub Actions als Warnung am Lauf sichtbar, damit ungeprüfte Zitate nicht untergehen.
for (const h of hinweise) console.warn(process.env.GITHUB_ACTIONS ? `::warning::${h}` : `Hinweis: ${h}`)
for (const f of fehler) console.error(`Fehler:  ${f}`)
console.log(
  `\n${ok} von ${massnahmen.length} Zitaten auf der angegebenen Seite gefunden` +
    (ungeprueft ? `, ${ungeprueft} ungeprüft (Programm nicht erreichbar).` : '.'),
)
if (fehler.length) process.exit(1)
console.log(ungeprueft ? 'Alle erreichbaren Zitate in Ordnung.' : 'Alle Zitate in Ordnung.')
