import type { GenutztesProgramm, ParteiErgebnis } from './bewertung'

const datum = (iso: string) =>
  new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })

/** „Das Wahlprogramm (Stand …)“ bzw. „Das Landeswahlprogramm Sachsen-Anhalt (Stand …)“. */
function programmText(land: string | null, stand: string, landName: (id: string) => string) {
  return land ? `Das Landeswahlprogramm ${landName(land)} (Stand ${datum(stand)})` : `Das Wahlprogramm (Stand ${datum(stand)})`
}

/**
 * Warum eine Partei in dieser Runde keine Maßnahme hat – Fälle, die sich für
 * Spieler:innen und für die Fairness deutlich unterscheiden. Immer als
 * überprüfbare Aussage über Programm und Stand, nie als „Partei hat nichts“.
 */
export function ohneTreffer(
  e: ParteiErgebnis,
  landName: (id: string) => string = (id) => id,
): { kurz: string; lang: string; badge?: string } | null {
  if (e.treffer.length > 0) return null
  if (!e.abdeckung) {
    const land = e.fehlt?.land ?? null
    if (e.fehlt?.grund === 'kein_landesprogramm' && land) {
      return {
        badge: 'kein Landesprogramm',
        kurz: 'kein aktuelles Landesprogramm',
        lang:
          `Für ${landName(land)} gibt es kein Wahlprogramm der laufenden Wahlperiode` +
          `${e.fehlt.begruendung ? ` (${e.fehlt.begruendung})` : ''}. Deshalb gibt es in dieser Runde keine Wertung.`,
      }
    }
    return {
      badge: 'noch nicht erfasst',
      kurz: 'noch nicht erfasst',
      lang: land
        ? `Das Landeswahlprogramm ${landName(land)} ist zu diesem Thema noch nicht ausgewertet. Deshalb gibt es in dieser Runde keine Wertung.`
        : `Das Wahlprogramm (Stand ${datum(e.partei.programm_stand)}) ist zu diesem Thema noch nicht ausgewertet. Deshalb gibt es in dieser Runde keine Wertung.`,
    }
  }
  const programme: GenutztesProgramm[] = e.programme.length
    ? e.programme
    : [{ land: null, url: e.partei.programm_url, stand: e.partei.programm_stand, abdeckung: e.abdeckung }]
  const saetze = programme.map((p) => programmText(p.land, p.stand, landName))
  const wer = saetze.map((t, i) => (i > 0 ? t.replace(/^Das /, 'das ') : t)).join(' und ')
  const verb = saetze.length > 1 ? 'enthalten' : 'enthält'
  if (e.abdeckung.art === 'keine') {
    return { kurz: 'nichts zum Thema im Programm', lang: `${wer} ${verb} keine Maßnahme zu diesem Thema.` }
  }
  return {
    kurz: 'nichts zu diesen Ursachen im Programm',
    lang: `${wer} ${verb} keine Maßnahme zu diesen Ursachen.`,
  }
}
