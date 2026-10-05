// Selbstprüfung des Agenten haltung-erfassung: Felder, Form und ob das Zitat wörtlich auf der genannten
// PDF-Seite steht. Bei Erfolg wird der Fund als funde/<Name>.json gespeichert.
// Aufruf: npm run haltung:programm-pruefen -- <.cache/haltung/<ID>/protokoll/fund-<Name>.json> [--lokal <ordner>]
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fundName, pruefeFund, type HaltungFund } from '../haltung-erfassung.ts'
import { erfassungsSeiten, lokalePdfs } from '../programme.ts'
import { findeZitat } from '../zitate.ts'
import { erstesJsonObjekt } from '../entwurf/json-text.ts'
import { abbruch, fundeOrdner, katalogUndHaltung, ordnerAnlegen } from './gemeinsam.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
const pfad = args[0]
if (!pfad) abbruch('Aufruf: npm run haltung:programm-pruefen -- <protokoll/fund-<Name>.json>')
let fund: HaltungFund
try {
  fund = erstesJsonObjekt(readFileSync(pfad, 'utf8')).objekt as HaltungFund
} catch (e) {
  abbruch(`Kein gültiges JSON in ${pfad}: ${e instanceof Error ? e.message : e}`)
}
const { katalog, haltung, arbeit } = (() => {
  try {
    return katalogUndHaltung(String(fund.haltung_id))
  } catch (e) {
    abbruch(e)
  }
})()
const fehler = pruefeFund(katalog, haltung, fund)
const partei = katalog.parteien.find((p) => p.id === fund.partei_id)
if (partei && fund.zitat && Number.isInteger(fund.seite)) {
  const { seiten } = await erfassungsSeiten(partei.programm_url, partei.programm_sha256, lokal)
  const b = findeZitat(fund.zitat, seiten, fund.seite!)
  if (b.status === 'andere_seite') fehler.push(`Zitat steht nicht auf S. ${fund.seite}, sondern auf S. ${b.seiten.join(', ')}`)
  if (b.status === 'nicht_gefunden') fehler.push('Zitat nicht im Programm gefunden – wörtlich zitieren, eine Auslassung höchstens als „[…]“')
}
for (const f of fehler) console.error(`Fehler:  ${f}`)
if (fehler.length) process.exit(1)
if (resolve(dirname(pfad)) !== resolve(arbeit, 'protokoll')) abbruch(`Der Fund gehört nach ${join(arbeit, 'protokoll')}/`)
ordnerAnlegen(fundeOrdner(arbeit))
const ziel = join(fundeOrdner(arbeit), `${fundName(katalog, fund.partei_id)}.json`)
writeFileSync(ziel, JSON.stringify(fund, null, 2) + '\n', 'utf8')
console.log(`In Ordnung: ${fund.zitat ? `Zitat S. ${fund.seite}` : 'keine Aussage'} → ${ziel}`)
