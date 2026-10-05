// Trägt die Positionen in die Haltungsdatei ein (ungeprüfter KI-Entwurf) und legt Funde, Blindliste, Kennungen
// und Antwort unter daten/protokolle/haltung-<ID>/<Datum>/ ab. Weniger als drei erkennbare Positionen
// (Aufnahmekriterium): nichts eintragen, außer mit --trotzdem.
// Aufruf: npm run haltung:eintragen -- <Haltungs-ID> [--trotzdem] [--stand JJJJ-MM-TT]
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { erkennbar, positionenEintragen, pruefeHaltungAntwort, type HaltungAntwort, type HaltungBlindliste } from '../haltung-erfassung.ts'
import { erstesJsonObjekt } from '../entwurf/json-text.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { formatiere } from '../pruefung-export.ts'
import { abbruch, katalogUndHaltung, leseFunde, ordnerAnlegen, WURZEL } from './gemeinsam.ts'

const args = process.argv.slice(2)
const trotzdem = args.includes('--trotzdem')
const s = args.indexOf('--stand')
const heute = s >= 0 ? args[s + 1] : new Date().toISOString().slice(0, 10)
let ctx
try {
  ctx = katalogUndHaltung(args[0])
} catch (e) {
  abbruch(e)
}
const { katalog, haltung, datei, arbeit } = ctx
if (haltung.positionen.some((p) => p.geprueft))
  abbruch(`Haltung ${haltung.id} hat geprüfte Positionen – ein neuer KI-Entwurf würde sie ersetzen. Abgebrochen.`)
const liste = JSON.parse(readFileSync(join(arbeit, 'blind.json'), 'utf8')) as HaltungBlindliste
const kennungen = JSON.parse(readFileSync(join(arbeit, 'kennungen.json'), 'utf8')) as { kennung: string; partei_id: number }[]
const antwort = erstesJsonObjekt(readFileSync(join(arbeit, 'protokoll', 'einordnung-antwort.txt'), 'utf8')).objekt as HaltungAntwort
const fehler = pruefeHaltungAntwort(liste, antwort)
if (fehler.length) abbruch(`Antwort fehlerhaft:\n  ${fehler.join('\n  ')}`)
const funde = leseFunde(arbeit).filter((f) => f.haltung_id === haltung.id)
const original = readFileSync(datei, 'utf8')
const neu = positionenEintragen(katalog, JSON.parse(original), funde, kennungen, antwort, heute)
const n = erkennbar(neu)
if (n < 3 && !trotzdem)
  abbruch(`Nur ${n} Programme mit erkennbarer Position – Aufnahmekriterium sind drei. Nichts eingetragen (Haltung zurückstellen oder mit --trotzdem eintragen und begründen).`)
writeFileSync(datei, formatiere(neu) + '\n')
const nachher = pruefeDatenordner()
if (nachher.fehler.length) {
  writeFileSync(datei, original)
  abbruch(`Eintragen verworfen, Katalog wäre fehlerhaft:\n  ${nachher.fehler.join('\n  ')}`)
}
const archiv = fileURLToPath(new URL(`daten/protokolle/haltung-${haltung.id}/${heute}/`, WURZEL))
ordnerAnlegen(join(archiv, 'funde'))
for (const f of ['blind.json', 'kennungen.json']) copyFileSync(join(arbeit, f), join(archiv, f))
copyFileSync(join(arbeit, 'protokoll', 'einordnung-antwort.txt'), join(archiv, 'einordnung-antwort.txt'))
for (const f of funde) writeFileSync(join(archiv, 'funde', `${f.partei_id}.json`), JSON.stringify(f, null, 2) + '\n')
console.log(`Haltung ${haltung.id}: ${neu.positionen && (neu.positionen as unknown[]).length} Positionen eingetragen, ${n} erkennbar. Protokoll: ${archiv}`)
