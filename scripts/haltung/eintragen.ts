// Trägt die Positionen in die Haltungsdateien ein (ungeprüfter KI-Entwurf) und legt Funde, Blindliste, Kennungen
// und Antwort unter daten/protokolle/haltung-<ID>/<Datum>/ ab. Weniger als drei erkennbare Positionen
// (Aufnahmekriterium): diese Haltung nicht eintragen, außer mit --trotzdem; die übrigen laufen weiter.
// Aufruf: npm run haltung:eintragen -- <Haltungs-ID> [<Haltungs-ID> …] [--trotzdem] [--stand JJJJ-MM-TT]
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { erkennbar, positionenEintragen, pruefeHaltungAntwort, type HaltungAntwort, type HaltungBlindliste } from '../haltung-erfassung.ts'
import { erstesJsonObjekt } from '../entwurf/json-text.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { formatiere } from '../pruefung-export.ts'
import { ids, katalogUndHaltungen, leseFunde, oderAbbruch, ordnerAnlegen, WURZEL } from './gemeinsam.ts'

const args = process.argv.slice(2)
const trotzdem = args.includes('--trotzdem')
const s = args.indexOf('--stand')
const heute = s >= 0 ? args.splice(s, 2)[1] : new Date().toISOString().slice(0, 10)
const { katalog, haltungen } = oderAbbruch(() => katalogUndHaltungen(ids(args)))
let probleme = 0
for (const { haltung, datei, arbeit } of haltungen) {
  const melde = (t: string) => {
    probleme++
    console.error(`Haltung ${haltung.id}: ${t}`)
  }
  if (haltung.positionen.some((p) => p.geprueft)) {
    melde('hat geprüfte Positionen – ein neuer KI-Entwurf würde sie ersetzen. Übersprungen.')
    continue
  }
  let liste: HaltungBlindliste, kennungen: { kennung: string; partei_id: number }[], antwort: HaltungAntwort
  try {
    liste = JSON.parse(readFileSync(join(arbeit, 'blind.json'), 'utf8'))
    kennungen = JSON.parse(readFileSync(join(arbeit, 'kennungen.json'), 'utf8'))
    antwort = erstesJsonObjekt(readFileSync(join(arbeit, 'protokoll', 'einordnung-antwort.txt'), 'utf8')).objekt as HaltungAntwort
  } catch (e) {
    melde(`Arbeitsdateien fehlen oder sind fehlerhaft (${e instanceof Error ? e.message : e}). Übersprungen.`)
    continue
  }
  const fehler = pruefeHaltungAntwort(liste, antwort)
  if (fehler.length) {
    melde(`Antwort fehlerhaft:\n  ${fehler.join('\n  ')}`)
    continue
  }
  const funde = leseFunde(arbeit).filter((f) => f.haltung_id === haltung.id)
  const original = readFileSync(datei, 'utf8')
  const neu = positionenEintragen(katalog, JSON.parse(original), funde, kennungen, antwort, heute)
  const n = erkennbar(neu)
  if (n < 3 && !trotzdem) {
    melde(`nur ${n} Programme mit erkennbarer Position – Aufnahmekriterium sind drei. Nicht eingetragen (zurückstellen oder mit --trotzdem und Begründung).`)
    continue
  }
  writeFileSync(datei, formatiere(neu) + '\n')
  const nachher = pruefeDatenordner()
  if (nachher.fehler.length) {
    writeFileSync(datei, original)
    melde(`Eintragen verworfen, Katalog wäre fehlerhaft:\n  ${nachher.fehler.join('\n  ')}`)
    continue
  }
  const archiv = fileURLToPath(new URL(`daten/protokolle/haltung-${haltung.id}/${heute}/`, WURZEL))
  ordnerAnlegen(join(archiv, 'funde'))
  for (const f of ['blind.json', 'kennungen.json']) copyFileSync(join(arbeit, f), join(archiv, f))
  copyFileSync(join(arbeit, 'protokoll', 'einordnung-antwort.txt'), join(archiv, 'einordnung-antwort.txt'))
  for (const f of funde) writeFileSync(join(archiv, 'funde', `${f.partei_id}.json`), JSON.stringify(f, null, 2) + '\n')
  console.log(`Haltung ${haltung.id}: ${(neu.positionen as unknown[]).length} Positionen eingetragen, ${n} erkennbar. Protokoll: ${archiv}`)
}
if (probleme) process.exitCode = 1
