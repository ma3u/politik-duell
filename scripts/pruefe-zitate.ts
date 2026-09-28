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

async function lade(url: string): Promise<Uint8Array> {
  const datei = new URL(`${createHash('sha1').update(url).digest('hex')}.pdf`, CACHE)
  if (existsSync(datei)) return new Uint8Array(readFileSync(datei))
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(120_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const daten = new Uint8Array(await res.arrayBuffer())
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(datei, daten)
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
for (const [url, liste] of jeProgramm) {
  let seiten: string[]
  try {
    seiten = await seitenTexte(await lade(url))
  } catch (e) {
    fehler.push(`Programm nicht lesbar (${e instanceof Error ? e.message : e}): ${url} – ${liste.length} Zitate ungeprüft`)
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

for (const f of fehler) console.error(`Fehler:  ${f}`)
console.log(`\n${ok} von ${massnahmen.length} Zitaten auf der angegebenen Seite gefunden.`)
if (fehler.length) process.exit(1)
console.log('Alle Zitate in Ordnung.')
