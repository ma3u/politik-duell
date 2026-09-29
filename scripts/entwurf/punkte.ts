// Punkte je Partei und Ursache für ein Thema – im Bund und je Land, wie im Spiel
// (mit KI-Entwürfen, wie in der geschlossenen Testphase). Zum Gegenlesen nach dem Erfassen.
// Aufruf: npm run punkte -- 4
import { spielbareAbdeckung, spielbareLandesprogramme, spielbareMassnahmen } from '../../src/data/katalog.ts'
import { bewertePartei } from '../../supabase/functions/_shared/bewertung.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'

const themaId = Number(process.argv[2])
const { katalog, fehler } = pruefeDatenordner()
const thema = katalog.themen.find((t) => t.id === themaId)
if (fehler.length || !thema) {
  console.error(fehler.length ? 'Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.' : 'Aufruf: npm run punkte -- <Themen-ID>')
  process.exit(1)
}

const massnahmen = spielbareMassnahmen(katalog, true)
const abdeckung = spielbareAbdeckung(katalog, true)
const landesprogramme = spielbareLandesprogramme(katalog)
const ursachen = katalog.ursachen.filter((u) => u.thema_id === themaId)
const faelle = [...ursachen.map((u) => [u.id]), ursachen.map((u) => u.id)]

console.log(`${thema.name} – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)`)
for (const land of [null, ...katalog.laender.map((l) => l.id)]) {
  console.log(`\n${land ?? 'Bund'}`.padEnd(9) + ursachen.map((u) => String(u.id).padStart(5)).join('') + '   alle')
  for (const p of katalog.parteien) {
    const werte = faelle.map((u) => {
      const e = bewertePartei(p, themaId, u, null, massnahmen, abdeckung, { land, ursachen: katalog.ursachen, landesprogramme })
      return (e.abdeckung ? String(e.punkte) : '–').padStart(u.length > 1 ? 7 : 5)
    })
    console.log(p.kurzname.padEnd(8) + werte.join(''))
  }
}
