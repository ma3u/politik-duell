// Treffermatrix: zählt jeden Suchbegriff (je Ursache und Lösungsrichtung) in jedem Programm der
// Erfassung und schreibt das Ergebnis als `treffer` in die Erfassung. So ist nachvollziehbar, dass
// alle Programme mit denselben Begriffen durchsucht wurden, und es fällt auf, wo ein Programm viele
// Treffer, aber keine Maßnahme hat. Ergänzt ein Agent eigene Synonyme, kommen sie in `suchbegriffe`
// und werden mit einem neuen Lauf in allen Programmen gezählt.
// Aufruf: npm run entwurf:treffer -- <erfassung.json> [--lokal <ordner>]
import { readFileSync, writeFileSync } from 'node:fs'
import { begriffePruefsumme, erfassungsHinweise, pruefeSuchbegriffe, type Erfassung, type Treffermatrix } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'
import { erfassungsSeiten, lokalePdfs } from '../programme.ts'
import { zaehle } from './suche.ts'

const args = process.argv.slice(2)
const l = args.indexOf('--lokal')
const lokal = l >= 0 ? lokalePdfs(args.splice(l, 2)[1]) : undefined
const [pfad, ...rest] = args
if (!pfad || rest.length) {
  console.error('Aufruf: npm run entwurf:treffer -- <erfassung.json> [--lokal <ordner>]')
  process.exit(1)
}
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}
const erfassung = JSON.parse(readFileSync(pfad, 'utf8')) as Erfassung
// Nur das Format der Begriffe muss stimmen; die Treffer schreibt dieses Skript erst.
const format = pruefeSuchbegriffe(katalog, { ...erfassung, treffer: undefined }).filter((f) => !f.startsWith('treffer'))
for (const f of format) console.error(`Fehler:  ${f}`)
if (format.length) process.exit(1)

const matrix: Treffermatrix = { begriffe_pruefsumme: begriffePruefsumme(erfassung.suchbegriffe), programme: [] }
let nichtGeladen = 0
for (const p of erfassung.programme) {
  const partei = katalog.parteien.find((x) => x.id === p.partei_id)
  const lp = p.land ? katalog.landesprogramme.find((x) => x.partei_id === p.partei_id && x.land === p.land && x.aktuell && x.url) : undefined
  const name = `${partei?.kurzname ?? p.partei_id} (${p.land ?? 'Bund'})`
  const url = lp?.url ?? partei?.programm_url
  if (!url || (p.land && !lp)) {
    console.error(`Fehler:  ${name}: kein Programm im Katalog`)
    nichtGeladen++
    continue
  }
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(url, lp ? lp.sha256 : partei?.programm_sha256, lokal))
  } catch (e) {
    console.error(`NICHT GELADEN: ${name}: ${e instanceof Error ? e.message : e}`)
    nichtGeladen++
    continue
  }
  const ursachen: Treffermatrix['programme'][number]['ursachen'] = {}
  for (const u of katalog.ursachen.filter((x) => x.thema_id === erfassung.thema_id && (!p.land || (x.ebene ?? 'bund') === 'land'))) {
    ursachen[u.id] = {}
    for (const [richtung, begriffe] of Object.entries(erfassung.suchbegriffe[String(u.id)] ?? {}))
      ursachen[u.id][richtung] = Object.fromEntries(begriffe.map((b) => [b, zaehle(seiten, b)]))
  }
  matrix.programme.push({ partei_id: p.partei_id, land: p.land, ursachen })
  const summen = Object.entries(ursachen).map(([u, r]) => `${u}: ${Object.entries(r).map(([rn, b]) => `${rn} ${Object.values(b).reduce((a, c) => a + c, 0)}`).join(' / ')}`)
  console.log(`${name.padEnd(16)} ${summen.join(' · ')}`)
}
if (nichtGeladen) {
  console.error(`${nichtGeladen} Programme nicht gezählt – aus der Erfassung nehmen (bleiben „noch nicht erfasst“) oder mit --lokal laden.`)
  process.exit(1)
}
const neu = { ...erfassung, treffer: matrix }
writeFileSync(pfad, JSON.stringify(neu, null, 2) + '\n', 'utf8')
for (const h of erfassungsHinweise(katalog, neu)) console.error(`Hinweis: ${h}`)
console.log(`\nTreffer für ${matrix.programme.length} Programme in ${pfad} geschrieben.`)
