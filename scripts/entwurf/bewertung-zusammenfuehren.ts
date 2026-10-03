// Teil-Neubewertung: führt die Antwort des Bewertungs-Agenten zu den neuen oder geänderten Kennungen
// (blind.json mit Block „teilbewertung“, siehe entwurf:blind --teil) mit der bisherigen Bewertung zusammen.
// Lehnt ab, wenn der Block nicht aus den Dateien folgt, unveränderte Kennungen oder bisherige
// Instrumente anders bewertet sind oder eine zu bewertende Kennung fehlt. Das Ergebnis prüft danach
// entwurf:bewertung-pruefen genauso streng wie eine vollständige Bewertung.
// Aufruf: npm run entwurf:bewertung-zusammenfuehren -- <erfassung.json> <bisherige-bewertung.json> <teil.json> <ziel.json>
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { blindListe, fuehreTeilbewertungZusammen, gleich, teilbewertung, type Bewertung, type BlindListe } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { leseErfassung } from './erfassung-datei.ts'
import { leseKennungen } from './kennungen-datei.ts'
import { archivPfad } from './protokoll-lesen.ts'

const [pfad, vorherPfad, teilPfad, ziel, ...rest] = process.argv.slice(2)
if (!pfad || !vorherPfad || !teilPfad || !ziel || rest.length) {
  console.error('Aufruf: npm run entwurf:bewertung-zusammenfuehren -- <erfassung.json> <bisherige-bewertung.json> <teil.json> <ziel.json>')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const lies = <T>(p: string) => JSON.parse(readFileSync(p, 'utf8')) as T
const fehlerliste: string[] = []
const erfassung = leseErfassung(pfad)
const { fest, probleme } = leseKennungen(pfad, erfassung)
fehlerliste.push(...probleme)
const blind = lies<BlindListe>(join(pfad, '..', 'blind.json'))
const vorher = lies<Bewertung>(vorherPfad)
const teil = lies<Bewertung>(teilPfad)
if (!fest) fehlerliste.push('kennungen.json fehlt')
const jetzt = fest && !probleme.length ? blindListe(katalog, erfassung, fest) : undefined
if (jetzt && jetzt.pruefsumme !== blind.pruefsumme) fehlerliste.push('blind.json passt nicht zur aktuellen Erfassung – entwurf:blind --teil erneut')
if (!blind.teilbewertung) fehlerliste.push('blind.json hat keinen Block „teilbewertung“ – erst npm run entwurf:blind -- <erfassung.json> --teil <bisherige-bewertung.json>')
const archiv = vorher.blind_pruefsumme ? archivPfad(pfad, vorher.blind_pruefsumme) : ''
if (!archiv || !existsSync(archiv)) fehlerliste.push('archivierte Blindliste der bisherigen Bewertung fehlt (protokoll/blind-<Prüfsumme>.json)')
for (const f of fehlerliste) console.error(`Fehler:  ${f}`)
if (fehlerliste.length || !jetzt || !blind.teilbewertung) process.exit(1)

// Der Block in blind.json muss genau aus bisheriger Bewertung und archivierter Liste folgen.
const { block, fehler: blockFehler } = teilbewertung(lies<BlindListe>(archiv), jetzt, vorher)
if (!block || !gleich(block, blind.teilbewertung)) {
  for (const f of blockFehler) console.error(`Fehler:  ${f}`)
  console.error('Fehler:  Block „teilbewertung“ in blind.json folgt nicht aus der bisherigen Bewertung – entwurf:blind --teil erneut ausführen und neu bewerten lassen')
  process.exit(1)
}
const { bewertung, fehler: zFehler } = fuehreTeilbewertungZusammen(jetzt, block, teil)
for (const f of zFehler) console.error(`Fehler:  ${f}`)
if (!bewertung) process.exit(1)
writeFileSync(ziel, JSON.stringify(bewertung, null, 2) + '\n', 'utf8')
console.log(`${ziel}: ${block.zu_bewerten.length} Kennungen neu bewertet, ${bewertung.zuordnung.length - block.zu_bewerten.length} übernommen. Weiter: npm run entwurf:bewertung-pruefen -- ${pfad} ${ziel}`)
