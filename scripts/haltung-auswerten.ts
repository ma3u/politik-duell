// Wertet die Antworten der Blindblätter aus (npm run haltung:pruefliste erzeugt das Blatt) und zeigt, welche
// Positionen mindestens zwei Prüfende wie der Entwurf eingeordnet haben (`einordnung_bestaetigt`).
// Aufruf: npm run haltung:auswerten -- antwort-1.json antwort-2.json [weitere …]
// Abweichungen werden nicht gemittelt: Sie stehen unten und werden geklärt (Wortlaut oder Maßstab ändern).
import { readFileSync } from 'node:fs'
import { pruefeDatenordner } from './katalog-laden.ts'
import { auswerten, standVon, type Abgabe } from './haltung-pruefung.ts'

const dateien = process.argv.slice(2)
if (!dateien.length) {
  console.error('Aufruf: npm run haltung:auswerten -- antwort-1.json antwort-2.json')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}

const abgaben: Abgabe[] = []
for (const d of dateien) {
  try {
    abgaben.push(JSON.parse(readFileSync(d, 'utf8')) as Abgabe)
  } catch (e) {
    console.error(`${d}: nicht lesbar – ${e instanceof Error ? e.message : e}`)
    process.exit(1)
  }
}

const { fehler: probleme, zeilen } = auswerten(katalog, abgaben)
const partei = (id: number) => katalog.parteien.find((p) => p.id === id)?.kurzname ?? String(id)
console.log(`Stand ${standVon(katalog)}, ${abgaben.length} Abgaben\n`)
console.log('Kennung | Haltung | Partei | Entwurf | Antworten | bestätigt')
for (const z of zeilen)
  console.log(`${z.kennung} | ${z.haltung_id} | ${partei(z.partei_id)} | ${z.entwurf} | ${z.antworten.map((a) => a ?? '–').join(', ')} | ${z.bestaetigt}`)

const bestaetigt = zeilen.filter((z) => z.bestaetigt >= 2)
const abweichend = zeilen.filter((z) => z.bestaetigt < abgaben.length)
console.log(`\n${bestaetigt.length} von ${zeilen.length} Positionen von mindestens zwei Prüfenden bestätigt (einordnung_bestaetigt ≥ 2).`)
if (abweichend.length) {
  console.log('\nZu klären (nicht alle stimmen mit dem Entwurf überein):')
  for (const z of abweichend) console.log(`- ${z.kennung} (${partei(z.partei_id)}, Haltung ${z.haltung_id}): Entwurf ${z.entwurf}, Antworten ${z.antworten.map((a) => a ?? '–').join(' / ')}`)
}
for (const f of probleme) console.error(`Fehler:  ${f}`)
if (probleme.length) process.exit(1)
