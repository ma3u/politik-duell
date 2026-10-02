// Auftrag für einen Erfassungs-Agenten (ein Programm): alles, was er braucht, in einer Datei –
// Ziel, die für dieses Programm zulässigen Ursachen, Leitfaden, Bündel, Trefferzahlen je Begriff und
// die Fundstellen mit PDF-Seite. Die Trefferzahlen sind dieselben, die `entwurf:treffer` später für
// alle Programme zählt; Ursachen mit vielen Treffern stehen als Pflicht im Auftrag, damit sie im
// ersten Durchgang gelesen werden statt erst in einer Rückfrage. Der Agent liest so eine Datei statt
// Regeln, Themendatei, Erfassung und Parteiliste – und sieht keine Ergebnisse anderer Programme.
import type { Katalog } from '../../src/data/katalog.ts'
import { TREFFER_OHNE_MASSNAHME, type Erfassung } from '../entwurf.ts'
import { seitenOhneText } from '../programme.ts'
import { begriffQuelle, fliesstext } from './suche.ts'

export interface AuftragProgramm {
  partei_id: number
  kurzname: string
  /** null = Bundesprogramm */
  land: string | null
  url: string
  stand: string | null
}

export interface AuftragOptionen {
  textPfad: string
  ergebnisPfad: string
  /** Höchstens so viele Seiten mit Auszug (die mit den meisten Treffern); die übrigen nur mit Nummer. */
  maxSeiten?: number
}

/** Ursachen, die für ein Programm zählen: Bund alle, Land nur Ebene „land“. */
export const zulaessigeUrsachen = (k: Katalog, themaId: number, land: string | null) =>
  k.ursachen.filter((u) => u.thema_id === themaId && (!land || (u.ebene ?? 'bund') === 'land'))

export interface Fundstellen {
  /** Treffer je Ursache, Richtung und Begriff im ganzen Programm. */
  zahlen: Record<string, Record<string, Record<string, number>>>
  /** Je Seite (1-basiert): Treffer je „Ursache Richtung“ und ein Auszug um den ersten Treffer. */
  seiten: { n: number; marken: Map<string, number>; auszug: string }[]
}

export function fundstellen(seiten: string[], suchbegriffe: Erfassung['suchbegriffe'], ursachen: number[]): Fundstellen {
  const zahlen: Fundstellen['zahlen'] = {}
  const jeSeite = new Map<number, { marken: Map<string, number>; erster: { stelle: number; laenge: number } | null }>()
  const texte = seiten.map(fliesstext)
  for (const u of ursachen) {
    zahlen[u] = {}
    for (const [richtung, begriffe] of Object.entries(suchbegriffe[String(u)] ?? {})) {
      zahlen[u][richtung] = {}
      for (const b of begriffe) {
        const muster = new RegExp(begriffQuelle(b), 'giu')
        let summe = 0
        for (const [i, text] of texte.entries()) {
          const treffer = [...text.matchAll(muster)]
          if (!treffer.length) continue
          summe += treffer.length
          const s = jeSeite.get(i + 1) ?? { marken: new Map(), erster: null }
          const marke = `${u} ${richtung}`
          s.marken.set(marke, (s.marken.get(marke) ?? 0) + treffer.length)
          if (!s.erster || treffer[0].index < s.erster.stelle) s.erster = { stelle: treffer[0].index, laenge: treffer[0][0].length }
          jeSeite.set(i + 1, s)
        }
        zahlen[u][richtung][b] = summe
      }
    }
  }
  const liste = [...jeSeite.entries()].sort(([a], [b]) => a - b).map(([n, s]) => {
    const text = texte[n - 1]
    const { stelle, laenge } = s.erster!
    const von = Math.max(0, stelle - 140)
    const bis = Math.min(text.length, stelle + laenge + 220)
    const auszug = `${von > 0 ? '…' : ''}${text.slice(von, stelle)}«${text.slice(stelle, stelle + laenge)}»${text.slice(stelle + laenge, bis)}${bis < text.length ? '…' : ''}`
    return { n, marken: s.marken, auszug }
  })
  return { zahlen, seiten: liste }
}

const summe = (r: Record<string, number>) => Object.values(r).reduce((a, c) => a + c, 0)

export function auftragText(k: Katalog, e: Pick<Erfassung, 'thema_id' | 'suchbegriffe' | 'leitfaden'>, p: AuftragProgramm, seiten: string[], o: AuftragOptionen): string {
  const thema = k.themen.find((t) => t.id === e.thema_id)
  if (!thema) throw new Error(`Thema ${e.thema_id} nicht im Katalog`)
  const ursachen = zulaessigeUrsachen(k, e.thema_id, p.land)
  const ids = new Set(ursachen.map((u) => u.id))
  const f = fundstellen(seiten, e.suchbegriffe, ursachen.map((u) => u.id))
  const leer = seitenOhneText(seiten)
  const name = `${p.kurzname} (${p.land ? `Land ${p.land}` : 'Bund'})`
  const z: string[] = []
  z.push(`# Erfassungsauftrag: ${name} – Thema ${thema.id} „${thema.name}“`, '')
  z.push('Vorgehen und Regeln: `.claude/agents/programm-erfassung.md`. Dieser Auftrag enthält alles Übrige. Lies keine anderen Arbeitsdateien – `erfassung.json` und `programme/` enthalten andere Programme.', '')
  z.push('| | |', '| --- | --- |')
  z.push(`| partei_id | ${p.partei_id} |`)
  z.push(`| land | ${p.land ? `"${p.land}"` : 'null (Bundesprogramm)'} |`)
  z.push(`| Programm | ${p.url} (Stand ${p.stand ?? 'unbekannt'}) |`)
  z.push(`| Textdatei | \`${o.textPfad}\` (${seiten.length} PDF-Seiten${leer.length ? `; fast ohne Text: ${leer.join(', ')}` : ''}) |`)
  z.push(`| Ergebnis | \`${o.ergebnisPfad}\` – JSON und Protokoll hierhin schreiben |`)
  z.push(`| Selbstprüfung | \`npm run -s entwurf:programm-pruefen '--' ${o.ergebnisPfad}\` |`, '')
  z.push('## Ziel', '', thema.ziel ?? thema.beschreibung, '')
  z.push(`## Ursachen${p.land ? ' (Landesprogramm: nur Ebene Land)' : ''}`, '')
  for (const u of ursachen) z.push(`- **${u.id}** (${u.ebene === 'land' ? 'Land' : 'Bund'}): ${u.beschreibung}`)
  z.push('')
  const regeln = (e.leitfaden?.regeln ?? []).filter((r) => !r.ursachen?.length || r.ursachen.some((u) => ids.has(u)))
  z.push('## Leitfaden (gilt für alle Programme gleich)', '')
  if (regeln.length) for (const r of regeln) z.push(`- **R${r.nr}**${r.ursachen?.length ? ` [${r.ursachen.join(', ')}]` : ''}: ${r.text}`)
  else z.push('Keine themenbezogenen Regeln – es gelten die allgemeinen Regeln der Agentenbeschreibung.')
  z.push('')
  const buendel = Object.entries(e.leitfaden?.buendel ?? {}).filter(([u, l]) => ids.has(Number(u)) && l.length)
  if (buendel.length) {
    z.push('## Bündel (je Instrument höchstens eine Maßnahme, Feld `buendel`)', '')
    for (const [u, l] of buendel) z.push(`- **${u}**: ${l.map((b) => `„${b}“`).join(' · ')}`)
    z.push('')
  }
  z.push('## Treffer je Ursache und Richtung', '')
  const pflicht: number[] = []
  for (const u of ursachen) {
    const richtungen = Object.entries(f.zahlen[u.id] ?? {})
    const gesamt = richtungen.reduce((a, [, b]) => a + summe(b), 0)
    if (gesamt >= TREFFER_OHNE_MASSNAHME) pflicht.push(u.id)
    z.push(`- **${u.id}** – ${gesamt} Treffer${gesamt >= TREFFER_OHNE_MASSNAHME ? ' (Pflicht, siehe unten)' : ''}`)
    for (const [r, b] of richtungen) {
      const mit = Object.entries(b).filter(([, n]) => n)
      const ohne = Object.entries(b).filter(([, n]) => !n).map(([w]) => w)
      z.push(`  - ${r} (${summe(b)}): ${mit.map(([w, n]) => `${w} ${n}`).join(', ') || '–'}${ohne.length ? ` · ohne Treffer: ${ohne.join(', ')}` : ''}`)
    }
  }
  z.push('')
  if (pflicht.length)
    z.push(
      `**Pflicht:** Zu Ursache ${pflicht.join(', ')} gibt es mindestens ${TREFFER_OHNE_MASSNAHME} Treffer. Hast du dazu am Ende keine Maßnahme, nenne unter „Nicht erfasst“ die gelesenen Fundstellen (Seiten) und den Grund – sonst folgt eine Rückfrage.`,
      '',
    )
  const max = o.maxSeiten ?? 80
  const mitAuszug = new Set([...f.seiten].sort((a, b) => summe(Object.fromEntries(b.marken)) - summe(Object.fromEntries(a.marken))).slice(0, max).map((s) => s.n))
  z.push(`## Fundstellen (${f.seiten.length} Seiten; S. = PDF-Seite, Zahl in Klammern = Treffer)`, '')
  for (const s of f.seiten.filter((x) => mitAuszug.has(x.n)))
    z.push(`- S. ${s.n} [${[...s.marken].map(([m, n]) => `${m} ${n}`).join('; ')}]: ${s.auszug}`)
  const rest = f.seiten.filter((x) => !mitAuszug.has(x.n))
  if (rest.length) z.push('', `Weitere Seiten mit Treffern (ohne Auszug): ${rest.map((s) => `${s.n} [${[...s.marken.keys()].join('; ')}]`).join(', ')}`)
  z.push('')
  return z.join('\n')
}
