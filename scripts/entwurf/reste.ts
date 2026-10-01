// Restliste über den ganzen Katalog: Welche Maßnahmen enthalten nach dem Neutralisieren
// (Parteien, Personen, Länder wie in npm run entwurf:blind) noch Wörter, die auf eine Partei
// hindeuten können? Jeder Treffer ist entweder harmlos (begründet in docs/plan-sicherungen.md)
// oder ein Grund, die Neutralisierung zu erweitern.
// Aufruf: npm run blind:reste [-- --thema 17]
import { neutralisiere, verdaechtigeReste } from '../entwurf.ts'
import { pruefeDatenordner } from '../katalog-laden.ts'

const i = process.argv.indexOf('--thema')
const nurThema = i >= 0 ? Number(process.argv[i + 1]) : null
const { katalog } = pruefeDatenordner()
const weitere = katalog.parteien.flatMap((p) => [p.name, p.kurzname])
const zaehler = new Map<string, number>()
let n = 0
for (const m of katalog.massnahmen) {
  if (nurThema !== null && m.thema_id !== nurThema) continue
  const reste = verdaechtigeReste(neutralisiere(`${m.beschreibung}\n${m.zitat ?? ''}`, weitere))
  if (!reste.length) continue
  n++
  for (const r of reste) zaehler.set(r.toLowerCase(), (zaehler.get(r.toLowerCase()) ?? 0) + 1)
  console.log(`${m.id} (Thema ${m.thema_id}): ${reste.join(', ')}`)
}
console.log(`\n${n} von ${katalog.massnahmen.filter((m) => nurThema === null || m.thema_id === nurThema).length} Maßnahmen mit Resten.`)
console.log([...zaehler].sort((a, b) => b[1] - a[1]).map(([w, z]) => `${w} ${z}`).join(' · '))
