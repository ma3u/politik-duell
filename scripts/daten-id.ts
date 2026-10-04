// Aufruf: npm run daten:id                         – nächste freie ID für Maßnahmen und Instrumente
//         npm run daten:id -- --haltung            – nächste freie ID für eine Haltung (eigener Nummernkreis)
//         npm run daten:id -- --gegen origin/main  – prüft, dass keine ID verschwindet oder umgewidmet wird,
//                                                   neue Ursachen „durchsucht_fuer“ bekommen, Blindwerte nicht still geändert werden
//                                                   und Ursachen/Ziel nicht im selben Pull Request wie Maßnahmen eines Themas geändert werden
import { gitStand, pruefeDatenordner } from './katalog-laden.ts'
import { naechsteHaltungsId, naechsteId, vergleicheIds } from './ids.ts'
import { vergleicheStand } from './stand-vergleich.ts'

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
  const probleme = [...vergleicheIds(alt, katalog), ...vergleicheStand(alt, katalog)]
  for (const p of probleme) console.error(`Fehler:  ${p}`)
  if (probleme.length) process.exit(1)
  console.log(`IDs, neue Ursachen, Phasen und Blindwerte in Ordnung (verglichen mit ${ref}). Nächste freie ID: ${naechsteId(katalog)}`)
}
