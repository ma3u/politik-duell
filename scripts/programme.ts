// Programm-PDFs: herunterladen, Prüfsumme bilden, im Internet Archive sichern.
// Genutzt von der Zitatprüfung und den Erfassungswerkzeugen (scripts/entwurf/).
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Katalog } from '../src/data/katalog.ts'
import { seitenTexte } from './zitate.ts'

export const sha256 = (daten: Uint8Array) => createHash('sha256').update(daten).digest('hex')

const cacheName = (url: string) => createHash('sha1').update(url).digest('hex')

const text = (x: unknown) => (x instanceof Error ? x.message : String(x))

export interface Programm {
  url: string
  sha256?: string
  name: string
  partei: string
  /** null = Bundesprogramm */
  land: string | null
  /** false bei Landesprogrammen früherer Wahlperioden */
  aktuell: boolean
}

/** Alle Programme im Katalog mit der Prüfsumme der ausgewerteten Fassung. */
export function programme(k: Katalog): Programm[] {
  const liste = new Map<string, Programm>()
  for (const p of k.parteien)
    liste.set(p.programm_url, { url: p.programm_url, sha256: p.programm_sha256, name: `${p.kurzname} (Bund)`, partei: p.kurzname, land: null, aktuell: true })
  for (const l of k.landesprogramme) {
    const partei = k.parteien.find((p) => p.id === l.partei_id)?.kurzname ?? String(l.partei_id)
    if (l.url)
      liste.set(l.url, { url: l.url, sha256: l.sha256, name: `${partei} (${l.land}, Wahl ${l.landtagswahl})`, partei, land: l.land, aktuell: l.aktuell })
  }
  return [...liste.values()]
}

export async function herunterladen(url: string): Promise<Uint8Array> {
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

/** Unveränderte Kopie aus dem Internet Archive („id_“), die jüngste vor `zeit` (JJJJMMTThhmmss). */
export const archivAdresse = (url: string, zeit = new Date().toISOString().replace(/\D/g, '').slice(0, 14)) =>
  `https://web.archive.org/web/${zeit}id_/${url}`

/**
 * Sorgt dafür, dass das Internet Archive eine Kopie hat. Gibt zurück, was passiert ist.
 * Die Prüfsumme im Katalog belegt später, ob die Kopie die ausgewertete Fassung ist.
 */
export async function archivieren(url: string): Promise<string> {
  const frage = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(30_000) })
  const antwort = (await frage.json()) as { archived_snapshots?: { closest?: { url?: string } } }
  const vorhanden = antwort.archived_snapshots?.closest?.url
  if (vorhanden) return `schon archiviert: ${vorhanden}`
  const res = await fetch(`https://web.archive.org/save/${url}`, { redirect: 'manual', signal: AbortSignal.timeout(180_000) })
  if (res.status >= 400) throw new Error(`Archivierung abgelehnt (HTTP ${res.status})`)
  return `Archivierung angestoßen: https://web.archive.org/web/*/${url}`
}

/** PDFs eines Ordners nach Prüfsumme – so passt jede Datei zum Programm, egal wie sie heißt. */
export function lokalePdfs(ordner: string): Map<string, Uint8Array> {
  const m = new Map<string, Uint8Array>()
  for (const d of readdirSync(ordner).filter((x) => x.toLowerCase().endsWith('.pdf'))) {
    const daten = new Uint8Array(readFileSync(`${ordner.replace(/\/$/, '')}/${d}`))
    m.set(sha256(daten), daten)
  }
  return m
}

/**
 * Lädt ein Programm (mit Zwischenspeicher in .cache/programme/). Manche Parteiserver
 * lehnen Verbindungen aus Rechenzentren (z. B. GitHub Actions) ab; dann die Kopie im
 * Internet Archive. Weicht die Datei von der ausgewerteten Fassung ab, steht das in `hinweis`.
 */
export async function ladeProgramm(
  url: string,
  erwartet: string | undefined,
  lokal?: Map<string, Uint8Array>,
): Promise<{ daten: Uint8Array; hinweis?: string; abweichend?: boolean }> {
  if (erwartet && lokal?.has(erwartet)) return { daten: lokal.get(erwartet)!, hinweis: `lokal geprüft (Prüfsumme stimmt): ${url}` }
  const cache = new URL(`../.cache/programme/${cacheName(url)}.pdf`, import.meta.url)
  let daten: Uint8Array
  let hinweis: string | undefined
  if (existsSync(cache)) daten = new Uint8Array(readFileSync(cache))
  else {
    try {
      daten = await herunterladen(url)
    } catch (e) {
      try {
        daten = await herunterladen(archivAdresse(url))
        hinweis = `Direkt nicht erreichbar (${text(e)}), geprüft mit der Kopie auf web.archive.org: ${url}`
      } catch (archiv) {
        throw new Error(`${text(e)}; Kopie auf web.archive.org: ${text(archiv)}`)
      }
    }
    mkdirSync(new URL('.', cache), { recursive: true })
    writeFileSync(cache, daten)
  }
  if (erwartet && sha256(daten) !== erwartet) {
    const neu = `Datei weicht von der ausgewerteten Fassung ab (sha256 ${sha256(daten).slice(0, 12)}… statt ${erwartet.slice(0, 12)}…): ${url} – ausgetauscht? Zitate und Seiten prüfen, dann npm run programm:sichern`
    hinweis = hinweis ? `${hinweis}. ${neu}` : neu
    return { daten, hinweis, abweichend: true }
  }
  return { daten, hinweis }
}

/**
 * Seitentexte eines Programms (Index 0 = Seite 1), zwischengespeichert in .cache/texte/.
 * Der Zwischenspeicher gilt nur für dieselbe Datei (Prüfsumme). .cache/ ist nicht
 * versioniert: Programme und ihre Texte dürfen nicht ins Repository (Urheberrecht).
 */
export async function programmSeiten(
  url: string,
  erwartet: string | undefined,
  lokal?: Map<string, Uint8Array>,
): Promise<{ seiten: string[]; sha256: string; hinweis?: string; abweichend?: boolean }> {
  const cache = new URL(`../.cache/texte/${cacheName(url)}.json`, import.meta.url)
  // Eine lokale Kopie der ausgewerteten Fassung geht dem Zwischenspeicher vor.
  if (existsSync(cache) && !(erwartet && lokal?.has(erwartet))) {
    const gespeichert = JSON.parse(readFileSync(cache, 'utf8')) as { sha256: string; seiten: string[] }
    const hinweis =
      erwartet && gespeichert.sha256 !== erwartet
        ? `Datei weicht von der ausgewerteten Fassung ab (sha256 ${gespeichert.sha256.slice(0, 12)}… statt ${erwartet.slice(0, 12)}…): ${url}`
        : undefined
    return { seiten: gespeichert.seiten, sha256: gespeichert.sha256, hinweis, ...(hinweis ? { abweichend: true } : {}) }
  }
  const { daten, hinweis, abweichend } = await ladeProgramm(url, erwartet, lokal)
  // Prüfsumme vorher bilden: Das Auslesen übergibt die Daten an pdf.js.
  const summe = sha256(daten)
  const seiten = await seitenTexte(daten)
  mkdirSync(new URL('.', cache), { recursive: true })
  writeFileSync(cache, JSON.stringify({ url, sha256: summe, seiten }))
  return { seiten, sha256: summe, hinweis, ...(abweichend ? { abweichend } : {}) }
}

/**
 * Für das Erfassen: Text der ausgewerteten Fassung – oder ein Fehler, wenn die Datei von der
 * Prüfsumme in parteien.json abweicht. Sonst würden Maßnahmen aus einer anderen Fassung erfasst.
 */
export async function erfassungsSeiten(url: string, erwartet: string | undefined, lokal?: Map<string, Uint8Array>) {
  const r = await programmSeiten(url, erwartet, lokal)
  if (r.abweichend)
    throw new Error(`${r.hinweis} – nicht die ausgewertete Fassung. Richtige Datei mit --lokal angeben oder das neue Programm erst eintragen und sichern (npm run programm:sichern)`)
  return r
}

/** PDF-Seiten fast ohne Text (Bilder, Scans, Leerseiten): Dort kann eine Suche nichts finden. */
export const seitenOhneText = (seiten: string[], mindestens = 200) =>
  seiten.flatMap((t, i) => (t.replace(/\s+/g, '').length < mindestens ? [i + 1] : []))

/** Text eines Programms als Datei für Read/Grep: Seitenmarken „===== Seite N =====“, Seiten ohne Text am Anfang genannt. */
export function textdatei(seiten: string[]): string {
  const leer = seitenOhneText(seiten)
  const kopf = leer.length ? `Hinweis: ${leer.length} von ${seiten.length} Seiten fast ohne Text (Bild oder Scan?): ${leer.join(', ')}\n` : ''
  return kopf + seiten.map((t, n) => `\n===== Seite ${n + 1} =====\n${t}`).join('')
}
