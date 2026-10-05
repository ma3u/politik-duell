// Aufruf: npm run daten:id                         – nächste freie ID für Maßnahmen und Instrumente
//         npm run daten:id -- --haltung            – nächste freie ID für eine Haltung (eigener Nummernkreis)
//         npm run daten:id -- --gegen origin/main  – prüft, dass keine ID verschwindet oder umgewidmet wird,
//                                                   neue Ursachen „durchsucht_fuer“ bekommen, Blindwerte nicht still geändert werden
//                                                   und Ursachen/Ziel nicht im selben Pull Request wie Maßnahmen eines Themas geändert werden
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { gitStand, pruefeDatenordner } from './katalog-laden.ts'
import { naechsteHaltungsId, naechsteId, vergleicheIds } from './ids.ts'
import { vergleicheStand, type Verlauf } from './stand-vergleich.ts'

const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}

const i = process.argv.indexOf('--gegen')
if (process.argv.includes('--haltung')) {
  console.log(naechsteHaltungsId(katalog))
} else if (i < 0) {
  console.log(naechsteId(katalog))
} else {
  const ref = process.argv[i + 1]
  // Ältere Stände folgen teils älteren Regeln; verglichen werden nur IDs, Ursachen, Phasen und Blindwerte.
  const alt = pruefeDatenordner(gitStand(ref)).katalog
  const probleme = [...vergleicheIds(alt, katalog), ...vergleicheStand(alt, katalog, gitVerlauf(ref))]
  for (const p of probleme) console.error(`Fehler:  ${p}`)
  if (probleme.length) process.exit(1)
  console.log(`IDs, neue Ursachen, Phasen und Blindwerte in Ordnung (verglichen mit ${ref}). Nächste freie ID: ${naechsteId(katalog)}`)
}

/** Stände einer Daten-Datei je Commit seit dem Zielzweig (für Phase A und B im selben Pull Request mit KI-Freigabe). */
function gitVerlauf(ref: string): Verlauf {
  const wurzel = new URL('../', import.meta.url)
  const git = (...args: string[]) => execFileSync('git', args, { cwd: wurzel, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  const lies = (stand: string, pfad: string) => {
    try {
      return JSON.parse(git('show', `${stand}:${pfad}`)) as Record<string, unknown>
    } catch {
      return undefined
    }
  }
  const datei = (ordner: string, id: number) =>
    readdirSync(new URL(`daten/${ordner}/`, wurzel)).find((d) => d.endsWith('.json') && JSON.parse(readFileSync(new URL(`daten/${ordner}/${d}`, wurzel), 'utf8')).id === id)
  const staende = (ordner: string) => (id: number) => {
    const name = datei(ordner, id)
    if (!name) return undefined
    const pfad = `daten/${ordner}/${name}`
    try {
      const commits = git('rev-list', '--reverse', '--topo-order', `${ref}..HEAD`, '--', pfad).split('\n').filter(Boolean)
      return [lies(ref, pfad), ...commits.map((c) => lies(c, pfad))]
    } catch {
      return undefined
    }
  }
  return { thema: staende('themen'), haltung: staende('haltungen') }
}
