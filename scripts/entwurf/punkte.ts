// Punkte je Partei und Ursache für ein Thema – im Bund und je Land, wie im Spiel
// (mit KI-Entwürfen, wie in der geschlossenen Testphase). Zum Gegenlesen nach dem Erfassen.
// Aufruf: npm run punkte -- 4
import { pruefeDatenordner } from '../katalog-laden.ts'
import { punkteTabelle } from './punkte-tabelle.ts'

const themaId = Number(process.argv[2])
const { katalog, fehler } = pruefeDatenordner()
if (fehler.length || !katalog.themen.some((t) => t.id === themaId)) {
  console.error(fehler.length ? 'Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.' : 'Aufruf: npm run punkte -- <Themen-ID>')
  process.exit(1)
}
console.log(punkteTabelle(katalog, themaId))
