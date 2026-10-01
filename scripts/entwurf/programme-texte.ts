// Schreibt den Text aller aktuellen Programme (Bund und Länder) mit Seitenmarken „===== Seite N =====“
// als Textdateien in einen Ordner, damit Erfassungs-Agenten sie mit Read/Grep lesen können, statt
// Konsolenausgaben zu parsen. Aufruf: npm run programme:texte -- <ordner> [--bund | --land BE] [--partei SPD]
// (Unter PowerShell 7 „--“ in Anführungszeichen: npm run programme:texte '--' <ordner> '--bund')
// Der Ordner gehört in .cache/ – die Texte sind urheberrechtlich geschützt und kommen nie ins Repository.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { programmName } from '../entwurf.ts'
import { erfassungsSeiten, programme, seitenOhneText } from '../programme.ts'

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
  const datei = join(ordner, `${programmName(p.partei, p.land)}.txt`)
  try {
    const { seiten } = await erfassungsSeiten(p.url, p.sha256)
    // Seiten ohne Text (Bilder, Scans) stehen am Anfang der Datei: Dort findet keine Suche etwas.
    const leer = seitenOhneText(seiten)
    const kopf = leer.length ? `Hinweis: ${leer.length} von ${seiten.length} Seiten fast ohne Text (Bild oder Scan?): ${leer.join(', ')}\n` : ''
    writeFileSync(datei, kopf + seiten.map((t, n) => `\n===== Seite ${n + 1} =====\n${t}`).join(''), 'utf8')
    console.log(`${datei}  (${seiten.length} Seiten${leer.length ? `, ${leer.length} fast ohne Text: ${leer.join(', ')}` : ''}) – ${p.name}`)
  } catch (e) {
    fehler++
    console.error(`NICHT GELADEN: ${p.name}: ${e instanceof Error ? e.message : e}`)
  }
}
if (fehler) process.exit(1)
