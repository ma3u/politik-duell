// Erzeugt die Fragen des Programm-Quiz (docs/plan-quiz.md) aus den Haltungen in daten/haltungen/.
// Aufruf:
//   npm run quiz:erzeugen                  → public/quiz/fragen.json (nur geprüfte Positionen, ins Repository)
//   npm run quiz:erzeugen -- --entwuerfe   → zusätzlich public/quiz/fragen-entwurf.json mit KI-Entwürfen
//                                            (in .gitignore, nur lokal; das Quiz zeigt dann einen Hinweis)
//   npm run quiz:erzeugen -- --pruefen     → bricht ab, wenn fragen.json nicht zum Datenkatalog passt (CI)
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { spielbareHaltungen, type Katalog } from '../src/data/katalog.ts'
import { quizFragen, quizParteien } from '../src/quiz/fragen.ts'
import type { QuizDaten } from '../src/quiz/typen.ts'
import { pruefeDatenordner } from './katalog-laden.ts'

const args = process.argv.slice(2)
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error(`Datenkatalog fehlerhaft – Quiz nicht erzeugt:\n  ${fehler.join('\n  ')}`)
  process.exit(1)
}

function quizDaten(k: Katalog, mitEntwuerfen: boolean): string {
  const h = spielbareHaltungen(k, mitEntwuerfen)
  const parteien = quizParteien(k.parteien)
  const fragen = quizFragen(h.haltungen, h.positionen, h.zielkonflikte, parteien)
  const inhalt = { parteien, fragen }
  const version = createHash('sha256').update(JSON.stringify(inhalt)).digest('hex').slice(0, 8)
  const daten: QuizDaten = { version, entwurf: mitEntwuerfen, ...inhalt }
  return `${JSON.stringify(daten, null, 1)}\n`
}

const ordner = new URL('../public/quiz/', import.meta.url)
const oeffentlich = new URL('fragen.json', ordner)
const text = quizDaten(katalog, false)
const anzahl = (t: string) => (JSON.parse(t) as QuizDaten).fragen.length

if (args.includes('--pruefen')) {
  if (!existsSync(oeffentlich) || readFileSync(oeffentlich, 'utf8') !== text) {
    console.error('public/quiz/fragen.json passt nicht zum Datenkatalog – bitte `npm run quiz:erzeugen` ausführen und mit einchecken.')
    process.exit(1)
  }
  console.log(`public/quiz/fragen.json ist aktuell (${anzahl(text)} Fragen).`)
} else {
  mkdirSync(ordner, { recursive: true })
  writeFileSync(oeffentlich, text)
  console.log(`public/quiz/fragen.json geschrieben (${anzahl(text)} Fragen aus geprüften Positionen).`)
  if (args.includes('--entwuerfe')) {
    const entwurf = quizDaten(katalog, true)
    writeFileSync(new URL('fragen-entwurf.json', ordner), entwurf)
    console.log(`public/quiz/fragen-entwurf.json geschrieben (${anzahl(entwurf)} Fragen, mit KI-Entwürfen – nicht im Repository; ins Build nur mit VITE_QUIZ_ENTWUERFE=true).`)
  }
}
