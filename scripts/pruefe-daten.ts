// Prüft den Datenkatalog in daten/ (Format, Quellenpflicht, Abdeckung).
// Aufruf: npm run daten:pruefen            – nur Dateien prüfen
//         npm run daten:pruefen -- --links – zusätzlich alle Links abrufen
import { pruefeDatenordner } from './katalog-laden.ts'
import { fehlendeZahlen } from './zitate.ts'

const { katalog, fehler, warnungen } = pruefeDatenordner()

// Die Beschreibung soll nur wiedergeben, was im Zitat steht – auch bei Zahlen (neue Erfassungen: Fehler in entwurf:blind).
for (const m of katalog.massnahmen) {
  const zahlen = m.zitat ? fehlendeZahlen(m.beschreibung, m.zitat) : []
  if (zahlen.length) warnungen.push(`Maßnahme ${m.id}: Zahl ${zahlen.join(', ')} steht in der Beschreibung, aber nicht im Zitat`)
}

if (process.argv.includes('--links') && !fehler.length) {
  if (katalog.fiktiv) {
    warnungen.push('Link-Prüfung übersprungen: fiktive Daten')
  } else {
    const urls = new Set<string>()
    for (const p of katalog.parteien) urls.add(p.programm_url)
    for (const u of katalog.ursachen) urls.add(u.quelle_url)
    for (const m of katalog.massnahmen) {
      urls.add(m.beleg_programm_url.split('#')[0])
      if (m.beleg_studie_url) urls.add(m.beleg_studie_url)
    }
    await Promise.all(
      [...urls].map(async (url) => {
        try {
          let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15_000) })
          // Manche Server kennen HEAD nicht.
          if (res.status === 405 || res.status === 403) res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) })
          if (!res.ok) fehler.push(`Link nicht erreichbar (${res.status}): ${url}`)
        } catch (e) {
          fehler.push(`Link nicht erreichbar (${e instanceof Error ? e.message : e}): ${url}`)
        }
      }),
    )
  }
}

for (const w of warnungen) console.warn(`Warnung: ${w}`)
for (const f of fehler) console.error(`Fehler:  ${f}`)

const n = (x: number, eins: string, mehr: string) => `${x} ${x === 1 ? eins : mehr}`
const offen = katalog.abdeckung.filter((a) => !a.geprueft).length
console.log(
  `\n${katalog.fiktiv ? 'FIKTIVE Daten · ' : ''}${n(katalog.parteien.length, 'Partei', 'Parteien')}, ` +
    `${n(katalog.themen.length, 'Thema', 'Themen')}, ${n(katalog.ursachen.length, 'Ursache', 'Ursachen')}, ` +
    `${n(katalog.massnahmen.length, 'Maßnahme', 'Maßnahmen')} · ` +
    `Abdeckung ${katalog.abdeckung.length - offen}/${katalog.abdeckung.length} geprüft`,
)
if (fehler.length) {
  console.error(n(fehler.length, 'Fehler', 'Fehler') + ' gefunden.')
  process.exit(1)
}
console.log('Datenkatalog in Ordnung.')
