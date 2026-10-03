// Datenteil der Pull-Request-Beschreibung (npm run entwurf:bericht): alles, was in den Pull Request
// gehört und sich aus den Dateien ergibt, wörtlich aus ihnen – nicht von der Koordination abgeschrieben.
// Das spart Ausgabetokens und schließt Abschreibfehler aus. Die Koordination ergänzt nur Einordnung und
// offene Fragen (.claude/skills/thema-erfassen/reference/pull-request.md).
import type { Katalog } from '../../src/data/katalog.ts'
import {
  bestaetigteUrsachen,
  bewertungsHinweise,
  blindReste,
  erfassungsHinweise,
  ohneBuendel,
  programmName,
  vergleicheErfassung,
  vorgeschlageneUrsachen,
  zuordnungsBilanz,
  zuordnungsHinweise,
  type Bewertung,
  type BlindListe,
  type Erfassung,
  type ErfasstesProgramm,
  type Kennung,
} from '../entwurf.ts'
import { zulaessigeUrsachen } from './auftrag-text.ts'
import { erstesJsonObjekt } from './json-text.ts'

export interface BerichtDaten {
  katalog: Katalog
  erfassung: Erfassung
  bewertung?: Bewertung
  fest?: Kennung[]
  liste?: BlindListe
  /** Dateien in protokoll/ (Name → Inhalt). */
  protokoll: Map<string, string>
  /** Frühere Stände der Erfassung (staende/erfassung-1.json …), älteste zuerst. */
  staende: Erfassung[]
  /** Programme, die nicht durchsucht werden konnten (Name → Grund). */
  nichtDurchsucht: [string, string][]
  /** Entfallene Kennungen aus kennungen.json. */
  entfallen: Kennung[]
  /** Ausgabe von punkteTabelle, wenn schon eingetragen. */
  punkte?: string
}

const details = (titel: string, inhalt: string[]) =>
  inhalt.length ? ['<details><summary>' + titel + '</summary>', '', '```', ...inhalt, '```', '', '</details>', ''] : [`${titel}: keine`, '']

export function berichtText(d: BerichtDaten): string {
  const { katalog: k, erfassung: e, bewertung: b } = d
  const z: string[] = ['## Daten aus den Arbeitsdateien (npm run entwurf:bericht)', '']
  const kurz = (p: { partei_id: number }) => k.parteien.find((x) => x.id === p.partei_id)?.kurzname ?? String(p.partei_id)
  const name = (p: ErfasstesProgramm) => programmName(kurz(p), p.land)

  // Modelle: Kopf von rueckfragen.md (vor der Tabelle).
  const rueckfragen = d.protokoll.get('rueckfragen.md') ?? ''
  const kopf = rueckfragen.split('\n').filter((l) => /^Modell/.test(l.trim()))
  z.push('**Modelle** (`protokoll/rueckfragen.md`):', '', ...(kopf.length ? kopf.map((l) => `- ${l.trim()}`) : ['- fehlt']), '')

  // Übersicht je Programm: erfasst → eingetragen (nach der Bewertung bestätigt), Rückfragen.
  const zuordnung = new Map((b?.zuordnung ?? []).map((x) => [x.kennung, x]))
  const kennungNach = new Map((d.fest ?? []).map((x) => [`${x.programm}/${x.massnahme}`, x.kennung]))
  const ebenen = [...new Set(e.programme.map((p) => p.land ?? 'Bund'))].sort((a, c) => (a === 'Bund' ? -1 : c === 'Bund' ? 1 : a.localeCompare(c)))
  const zeile = (p: ErfasstesProgramm, i: number) => {
    const bleiben = b ? p.massnahmen.filter((m, j) => bestaetigteUrsachen(m, zuordnung.get(kennungNach.get(`${i}/${j}`) ?? '')).length).length : undefined
    const rf = [...d.protokoll.keys()].filter((n) => n.startsWith(`erfassung-${name(p)}-rueckfrage-`)).length
    return `${p.massnahmen.length}${bleiben !== undefined ? ` → ${bleiben}` : ''}${rf ? `; ${rf} Rückfrage${rf > 1 ? 'n' : ''}` : ''}`
  }
  z.push(`**Übersicht je Programm** (erfasst${b ? ' → eingetragen' : ''}; Rückfragen):`, '', `| Partei | ${ebenen.join(' | ')} |`, `| --- |${ebenen.map(() => ' --- |').join('')}`)
  for (const partei of k.parteien) {
    const zellen = ebenen.map((eb) => {
      const i = e.programme.findIndex((p) => p.partei_id === partei.id && (p.land ?? 'Bund') === eb)
      return i < 0 ? '–' : zeile(e.programme[i], i)
    })
    if (zellen.some((x) => x !== '–')) z.push(`| ${partei.kurzname} | ${zellen.join(' | ')} |`)
  }
  z.push('')

  // Ohne Maßnahme zu einer Ursache (nach der Bewertung, sonst nach der Erfassung).
  const ohne: string[] = []
  for (const eb of ebenen) {
    const jeUrsache = new Map<number, string[]>()
    for (const [i, p] of e.programme.entries()) {
      if ((p.land ?? 'Bund') !== eb) continue
      for (const u of zulaessigeUrsachen(k, e.thema_id, p.land)) {
        const hat = p.massnahmen.some((m, j) =>
          b ? bestaetigteUrsachen(m, zuordnung.get(kennungNach.get(`${i}/${j}`) ?? '')).includes(u.id) : vorgeschlageneUrsachen(m).includes(u.id),
        )
        if (!hat) jeUrsache.set(u.id, [...(jeUrsache.get(u.id) ?? []), kurz(p)])
      }
    }
    if (jeUrsache.size) ohne.push(`**${eb}** ${[...jeUrsache].sort(([a], [c]) => a - c).map(([u, l]) => `${u} ${l.join(', ')}`).join('; ')}`)
  }
  z.push('**Ohne Maßnahme zu einer Ursache:** ' + (ohne.length ? ohne.join('. ') + '.' : 'keine'), '')
  z.push('**Nicht durchsucht:** ' + (d.nichtDurchsucht.length ? d.nichtDurchsucht.map(([n, g]) => `${n} (${g})`).join('; ') : 'keins'), '')

  // Leitfaden: neue Bündel, eigene Synonyme, Stand im PDF – aus den Ergebnissen der Agenten.
  const meldungen = e.programme.flatMap((p) => [
    ...(p.neue_buendel ?? []).map((x) => `${name(p)}: neues Bündel ${x.ursache} „${x.name}“${x.seite ? ` (S. ${x.seite})` : ''}`),
    ...(p.eigene_synonyme ?? []).map((x) => `${name(p)}: Synonym „${x.begriff}“ → ${x.ursache} ${x.richtung}`),
    ...(p.stand_im_pdf ? [`${name(p)}: Stand im PDF ${p.stand_im_pdf}`] : []),
  ])
  z.push(...details('Meldungen der Erfassungs-Agenten (neue Bündel, Synonyme, Stand im PDF)', meldungen))

  // Treffer je Programm und Ursache (Summen), offene Hinweise und strukturierte Begründungen.
  if (e.treffer) {
    const ursachen = k.ursachen.filter((u) => u.thema_id === e.thema_id).map((u) => u.id)
    const zeilen = [`${'Programm'.padEnd(14)}${ursachen.map((u) => String(u).padStart(6)).join('')}`]
    for (const t of e.treffer.programme) {
      const summe = (u: number) => {
        const r = t.ursachen[String(u)]
        return r ? String(Object.values(r).reduce((a, x) => a + Object.values(x).reduce((s, n) => s + n, 0), 0)) : '–'
      }
      zeilen.push(`${programmName(kurz(t), t.land).padEnd(14)}${ursachen.map((u) => summe(u).padStart(6)).join('')}`)
    }
    z.push(...details('Treffer je Programm und Ursache (Summe aller Begriffe; je Richtung in treffer.txt)', zeilen))
  }
  const hinweise = erfassungsHinweise(k, e)
  z.push('**Offene Hinweise von entwurf:treffer** (erledigte haben `nicht_erfasst` mit Seiten): ' + (hinweise.length ? '' : 'keine'), '')
  if (hinweise.length) z.push('```', ...hinweise, '```', '')
  const begruendet = e.programme.flatMap((p) => (p.nicht_erfasst ?? []).map((n) => `${name(p)} ${n.ursache} (S. ${n.seiten.join(', ')}): ${n.grund}`))
  z.push(...details('Ursachen ohne Maßnahme mit gelesenen Fundstellen (nicht_erfasst)', begruendet))

  // Vergleich nach Rückfragen: jeder frühere Stand mit dem nächsten.
  const folge = [...d.staende, e]
  const vergleich = folge.slice(1).flatMap((jetzt, n) => {
    const zeilen = vergleicheErfassung(k, folge[n].programme, jetzt.programme)
    return zeilen.length ? [`Stand ${n + 1} → ${n + 2 < folge.length ? `Stand ${n + 2}` : 'jetzt'}:`, ...zeilen.map((x) => `  ${x}`)] : []
  })
  z.push(
    '**Vergleich nach Rückfragen** (`entwurf:zusammenfuehren`): ' + (d.staende.length ? (vergleich.length ? '' : 'keine Änderung') : 'keine Rückfrage, kein früherer Stand'),
    '',
  )
  if (vergleich.length) z.push('```', ...vergleich, '```', '')
  const ungebuendelt = ohneBuendel(k, e)
  z.push(...details(`Ohne Bündel an Ursachen mit Bündeln (${ungebuendelt.length}, nur zur Information – je Ursache zählt die beste Maßnahme)`, ungebuendelt))

  // Blindliste und Bewertung.
  if (d.liste) {
    z.push(`**Blindliste:** ${d.liste.massnahmen.length} Kennungen, Prüfsumme \`${d.liste.pruefsumme}\`. Entfallene Kennungen: ${d.entfallen.length ? d.entfallen.map((x) => x.kennung).join(', ') : 'keine'}.`)
    if (b?.teilbewertung) z.push(`Teil-Neubewertung: neu bewertet ${b.teilbewertung.neu_bewertet.join(', ') || 'keine'} (bisherige Liste ${b.teilbewertung.vorherige_pruefsumme.slice(0, 16)}…).`)
    const reste = blindReste(d.liste)
    z.push('', '**Verdächtige Reste:** ' + (reste.length ? reste.map((r) => `${r.kennung}: ${r.reste.join(', ')}`).join('; ') + ' – Begründung siehe oben' : 'keine'), '')
  }
  if (b) {
    z.push('**Zuordnung** (`entwurf:bewertung-pruefen`):', '', '```', ...zuordnungsBilanz(k, e, b, d.fest).map((x) => `Zuordnung: ${x}`), '```', '')
    const bh = [...bewertungsHinweise(b), ...zuordnungsHinweise(k, e, b, d.fest)]
    z.push('**Hinweise zur Bewertung:** ' + (bh.length ? '' : 'keine'), '')
    if (bh.length) z.push('```', ...bh, '```', '')
  }
  if (d.punkte) z.push('**Punkte** (`npm run punkte`):', '', '```', d.punkte, '```', '')

  // Wörtlich aus dem Protokoll.
  const antwort = d.protokoll.get('bewertung-antwort.txt') ?? ''
  const ende = antwortEnde(antwort)
  if (ende) z.push(...details('Schwierige Einstufungen (Text der Bewertung unter dem JSON, wörtlich)', ende.split('\n')))
  z.push(...details('Rückfragen und Korrekturen (protokoll/rueckfragen.md, wörtlich)', rueckfragen.trim() ? rueckfragen.trim().split('\n') : []))
  const kosten = d.protokoll.get('kosten.md')
  z.push(...details('Kosten je Agent (protokoll/kosten.md)', kosten?.trim() ? kosten.trim().split('\n') : []))
  return z.join('\n')
}

/** Text nach dem ersten vollständigen JSON-Objekt einer Antwort (Anmerkungen der Bewertung). */
function antwortEnde(text: string): string {
  try {
    return erstesJsonObjekt(text).rest
  } catch {
    return ''
  }
}
