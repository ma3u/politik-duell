// Durchsucht alle Programme auf einmal und gibt nur Fundstellen aus (Seite + Ausschnitt).
// Gedacht zum Erfassen eines Themas: erst suchen, dann nur die Fundstellen und die
// passenden Kapitel lesen statt ganzer Programme. Nutzt den Zwischenspeicher aus
// npm run programme:laden und lädt fehlende Programme nach.
// Aufruf: npm run programme:suche -- "Schulsozialarbeit" "Sozialarbeiter"   – Bund und alle aktuellen Landesprogramme
//         npm run programme:suche -- "Mietpreisbremse" --bund               – nur Bundesprogramme
//         npm run programme:suche -- "Lehrkräfte" --land BE --land MV      – nur diese Länder (ohne Bund)
//         npm run programme:suche -- "Pflege" --partei SPD --max 3         – eine Partei, höchstens 3 Seiten je Programm
//         npm run programme:suche -- "Pflegeheim" --zaehlen                – nur die Übersicht der Treffer je Programm
//         npm run programme:suche -- "kita" "krippe" --je-begriff --zaehlen – Treffer je Begriff und Programm (fürs Protokoll)
// Unter PowerShell 7 verschluckt npm Optionen mit Wert (--partei, --land, --max), wenn "--" nicht in
// Anführungszeichen steht: npm run programme:suche '--' "kita" '--partei' SPD   (oder direkt mit node).
// Suchbegriffe sind Wortteile ohne Groß-/Kleinschreibung: „sozialarbeit“ findet auch
// „Schulsozialarbeit“. Silbentrennung am Zeilenende und Zeilenumbrüche stören nicht.
// Mehrere Begriffe = oder. Kein Treffer heißt nicht „nichts im Programm“: Synonyme
// suchen und die passenden Kapitel lesen (npm run programm:text -- <url> --seiten 12-20).
import { pruefeDatenordner } from '../katalog-laden.ts'
import { erfassungsSeiten, lokalePdfs, programme } from '../programme.ts'

const args = process.argv.slice(2)
const liste = (name: string) => {
  const werte: string[] = []
  for (let i = args.indexOf(name); i >= 0; i = args.indexOf(name)) werte.push(...args.splice(i, 2).slice(1))
  return werte
}
const schalter = (name: string) => {
  const i = args.indexOf(name)
  if (i >= 0) args.splice(i, 1)
  return i >= 0
}
const laender = liste('--land').map((l) => l.toUpperCase())
const parteien = liste('--partei').map((p) => p.toLowerCase())
const max = Number(liste('--max')[0] ?? 8)
const lokalOrdner = liste('--lokal')[0]
const nurBund = schalter('--bund')
const nurZaehlen = schalter('--zaehlen')
const jeBegriff = schalter('--je-begriff')
const alle = schalter('--alle')
const begriffe = args.filter((a) => a.trim())
if (!begriffe.length) {
  console.error('Aufruf: npm run programme:suche -- "Begriff" ["Begriff" …] [--bund | --land BE] [--partei SPD] [--max 8] [--zaehlen] [--je-begriff] [--alle]')
  process.exit(1)
}

/** Fließtext einer Seite: Silbentrennung am Zeilenende zusammengezogen, Leerraum vereinheitlicht. */
const fliesstext = (seite: string) =>
  seite
    .normalize('NFKC')
    .replace(/­/g, '')
    .replace(/(\p{Ll})[-‐]\s*\n\s*(\p{Ll})/gu, '$1$2')
    .replace(/\s+/g, ' ')
// Manche PDFs zerlegen Wörter im Textauszug („unab - dingbar“, „erh ö hen“): Zwischen
// zwei Zeichen eines Begriffs darf deshalb ein Leerzeichen oder eine Trennung stehen.
const zwischen = '(?:\\s*[-‐]\\s+|\\s)?'
const muster = new RegExp(
  begriffe
    .map((b) => [...b.trim().replace(/\s+/g, '')].map((z) => z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(zwischen))
    .join('|'),
  'giu',
)

const lokal = lokalOrdner ? lokalePdfs(lokalOrdner) : undefined
const { katalog } = pruefeDatenordner()
const parteiNamen = new Set(katalog.parteien.flatMap((p) => [p.name.toLowerCase(), p.kurzname.toLowerCase()]))
for (const b of begriffe)
  if (parteiNamen.has(b.trim().toLowerCase()))
    console.error(`Warnung: „${b}“ ist ein Parteiname und wird als Suchbegriff benutzt – hat npm „--partei“ verschluckt? (PowerShell: npm run programme:suche '--' … '--partei' ${b})`)
const auswahl = programme(katalog).filter(
  (p) =>
    (p.aktuell || alle) &&
    (nurBund ? p.land === null : laender.length ? p.land !== null && laender.includes(p.land) : true) &&
    (!parteien.length || parteien.includes(p.partei.toLowerCase())),
)

const uebersicht: { name: string; seiten: number; treffer: number | null }[] = []
for (const p of auswahl) {
  let seiten: string[]
  try {
    ;({ seiten } = await erfassungsSeiten(p.url, p.sha256, lokal))
  } catch (e) {
    uebersicht.push({ name: p.name, seiten: 0, treffer: null })
    console.log(`\n## ${p.name} – NICHT DURCHSUCHT (${e instanceof Error ? e.message : e})`)
    continue
  }
  const fundseiten: { n: number; auszuege: string[]; anzahl: number }[] = []
  if (jeBegriff) {
    const zahlen = begriffe.map((b) => {
      const m = new RegExp([...b.trim().replace(/\s+/g, '')].map((z) => z.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(zwischen), 'giu')
      return `${b} ${seiten.reduce((s, roh) => s + [...fliesstext(roh).matchAll(m)].length, 0)}`
    })
    console.log(`\n## ${p.name} – Treffer je Begriff: ${zahlen.join('; ')}`)
  }
  for (const [i, roh] of seiten.entries()) {
    const text = fliesstext(roh)
    const treffer = [...text.matchAll(muster)]
    if (!treffer.length) continue
    // Höchstens zwei Ausschnitte je Seite, nicht überlappend.
    const auszuege: string[] = []
    let bis = -1
    for (const t of treffer) {
      if (t.index < bis || auszuege.length >= 2) continue
      const von = Math.max(0, t.index - 160)
      bis = Math.min(text.length, t.index + t[0].length + 220)
      auszuege.push(`${von > 0 ? '…' : ''}${text.slice(von, t.index)}«${t[0]}»${text.slice(t.index + t[0].length, bis)}${bis < text.length ? '…' : ''}`)
    }
    fundseiten.push({ n: i + 1, auszuege, anzahl: treffer.length })
  }
  const summe = fundseiten.reduce((s, f) => s + f.anzahl, 0)
  uebersicht.push({ name: p.name, seiten: fundseiten.length, treffer: summe })
  if (nurZaehlen || !fundseiten.length) continue
  console.log(`\n## ${p.name} – ${summe} Treffer auf ${fundseiten.length} Seiten · ${p.url}`)
  // Die Seiten mit den meisten Treffern zuerst, dann in Seitenreihenfolge ausgeben.
  const gezeigt = [...fundseiten].sort((a, b) => b.anzahl - a.anzahl).slice(0, max).sort((a, b) => a.n - b.n)
  for (const f of gezeigt) for (const a of f.auszuege) console.log(`- S. ${f.n} (#page=${f.n}): ${a}`)
  if (fundseiten.length > gezeigt.length)
    console.log(`  … weitere Seiten: ${fundseiten.filter((f) => !gezeigt.includes(f)).map((f) => f.n).join(', ')}`)
}

console.log(`\n## Übersicht: ${begriffe.map((b) => `„${b}“`).join(' oder ')}`)
for (const u of uebersicht)
  console.log(`${u.treffer === null ? 'nicht durchsucht' : `${String(u.treffer).padStart(4)} Treffer / ${String(u.seiten).padStart(3)} Seiten`}  ${u.name}`)
