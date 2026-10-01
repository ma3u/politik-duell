// Schreibt den Text aller aktuellen Programme (Bund und Länder) mit Seitenmarken „===== Seite N =====“
// als Textdateien in einen Ordner, damit Erfassungs-Agenten sie mit Read/Grep lesen können, statt
// Konsolenausgaben zu parsen. Aufruf: npm run programme:texte -- <ordner> [--bund | --land BE] [--partei SPD]
// (Unter PowerShell 7 „--“ in Anführungszeichen: npm run programme:texte '--' <ordner> '--bund')
// Der Ordner gehört in .cache/ – die Texte sind urheberrechtlich geschützt und kommen nie ins Repository.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { programme, programmSeiten } from '../programme.ts'

const args = process.argv.slice(2)
const liste = (name: string) => {
  const werte: string[] = []
  for (let i = args.indexOf(name); i >= 0; i = args.indexOf(name)) werte.push(...args.splice(i, 2).slice(1))
  return werte
}
const bundPos = args.indexOf('--bund')
const nurBund = bundPos >= 0
if (nurBund) args.splice(bundPos, 1)
const laender = liste('--land').map((l) => l.toUpperCase())
const parteien = liste('--partei').map((p) => p.toLowerCase())
const [ordner, ...rest] = args
if (!ordner || rest.length) {
  console.error('Aufruf: npm run programme:texte -- <ordner> [--bund | --land BE] [--partei SPD]')
  process.exit(1)
}
if (!/(^|[\\/])\.cache([\\/]|$)/.test(ordner)) {
  console.error('Der Ordner muss unter .cache/ liegen (Programmtexte nie ins Repository).')
  process.exit(1)
}
const ascii = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')

const { katalog } = pruefeDatenordner()
const auswahl = programme(katalog).filter(
  (p) =>
    p.aktuell &&
    (nurBund ? p.land === null : laender.length ? p.land !== null && laender.includes(p.land) : true) &&
    (!parteien.length || parteien.includes(p.partei.toLowerCase())),
)
mkdirSync(ordner, { recursive: true })
let fehler = 0
for (const p of auswahl) {
  const datei = join(ordner, `${ascii(p.partei)}-${p.land ?? 'Bund'}.txt`)
  try {
    const { seiten } = await programmSeiten(p.url, p.sha256)
    writeFileSync(datei, seiten.map((t, n) => `\n===== Seite ${n + 1} =====\n${t}`).join(''), 'utf8')
    console.log(`${datei}  (${seiten.length} Seiten) – ${p.name}`)
  } catch (e) {
    fehler++
    console.error(`NICHT GELADEN: ${p.name}: ${e instanceof Error ? e.message : e}`)
  }
}
if (fehler) process.exit(1)
