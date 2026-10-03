// Punkte je Partei und Ursache für ein Thema – im Bund und je Land, wie im Spiel (mit KI-Entwürfen, wie
// in der geschlossenen Testphase). Gemeinsam für npm run punkte und npm run entwurf:bericht.
import { spielbareAbdeckung, spielbareLandesprogramme, spielbareMassnahmen, type Katalog } from '../../src/data/katalog.ts'
import { bewertePartei } from '../../supabase/functions/_shared/bewertung.ts'

export function punkteTabelle(katalog: Katalog, themaId: number): string {
  const thema = katalog.themen.find((t) => t.id === themaId)
  if (!thema) throw new Error(`Thema ${themaId} nicht im Katalog`)
  const massnahmen = spielbareMassnahmen(katalog, true)
  const abdeckung = spielbareAbdeckung(katalog, true)
  const landesprogramme = spielbareLandesprogramme(katalog)
  const ursachen = katalog.ursachen.filter((u) => u.thema_id === themaId)
  const faelle = [...ursachen.map((u) => [u.id]), ursachen.map((u) => u.id)]
  const z = [`${thema.name} – Punkte je Ursache und für alle zusammen („–“ = noch nicht erfasst)`]
  for (const land of [null, ...katalog.laender.map((l) => l.id)]) {
    z.push('', `${land ?? 'Bund'}`.padEnd(8) + ursachen.map((u) => String(u.id).padStart(5)).join('') + '   alle')
    for (const p of katalog.parteien) {
      const werte = faelle.map((u) => {
        const e = bewertePartei(p, themaId, u, null, massnahmen, abdeckung, { land, ursachen: katalog.ursachen, landesprogramme })
        return (e.abdeckung ? String(e.punkte) : '–').padStart(u.length > 1 ? 7 : 5)
      })
      z.push(p.kurzname.padEnd(8) + werte.join(''))
    }
  }
  return z.join('\n')
}
