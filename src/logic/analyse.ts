import { MAX_NACHFRAGEN, NACHFRAGE_URSACHE } from '../../supabase/functions/_shared/ki.ts'
import type { AnalyseAntwort, Nachricht, Thema, Ursache } from '../data/types'

// Mock der Edge Function `analyse`. Liefert dasselbe JSON-Format wie später
// die KI, arbeitet aber nur mit Schlagwörtern. Vergibt – wie die KI – keine
// Punkte und keine Links.


export const NACHFRAGEN = [
  'Was läuft in deinem Alltag konkret schief?',
  'Magst du ein Beispiel nennen, wann dich das zuletzt betroffen hat?',
]

const FORDERUNG_MUSTER = [
  /^(weniger|stopp|schluss mit|runter mit|weg mit)\b/,
  /^mehr\b(?! als)/,
  /\b(man|es|die politik|der staat|die regierung) (sollte|muss|soll)\b/,
  /\b(abschaffen|verbieten)\b/,
  /\bwir brauchen\b/,
]

/** Pauschale Urteile über Gruppen („die Ausländer sind alle …“): nachfragen, nicht wiederholen. */
const PAUSCHAL_MUSTER = [
  /\bsind (doch |eh |halt )?alle\b/,
  /\balle (auslaender|migranten|fluechtlinge|zuwanderer|asylanten|asylbewerber|muslime|rentner|politiker|beamten|arbeitslosen)\b/,
]
export const NACHFRAGE_PAUSCHAL = 'Was hast du selbst erlebt, oder wo fühlst du dich unsicher?'

const WERT_MUSTER = [
  /\bich finde\b/,
  /\bmeiner meinung\b/,
  /\b(freiheit|gerechtigkeit|solidaritaet|tradition|heimat|werte|anstand|respekt|zusammenhalt)\b/,
]

/** Kleinschreibung und Umlaute auflösen, damit Schlagwörter robust greifen. */
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .trim()
}

const treffer = (text: string, woerter: string[] = []) => woerter.filter((w) => text.includes(w)).length

function erkenneThema(text: string, themen: Thema[]): Thema | null {
  let bestes: Thema | null = null
  let besteTreffer = 0
  for (const thema of themen) {
    const n = treffer(text, thema.schlagwoerter)
    if (n > besteTreffer) {
      bestes = thema
      besteTreffer = n
    }
  }
  return bestes
}

function erkenneUrsachen(text: string, thema: Thema, ursachen: Ursache[]): number[] {
  const kandidaten = ursachen.filter((u) => u.thema_id === thema.id)
  // Nur Ursachen mit konkretem Hinweis – nicht alle des Themas (siehe bereinigeAntwort).
  return kandidaten.filter((u) => treffer(text, u.schlagwoerter) > 0).map((u) => u.id)
}

function kuerze(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export function analysiere(verlauf: Nachricht[], themen: Thema[], ursachen: Ursache[]): AnalyseAntwort {
  const spielerTexte = verlauf.filter((n) => n.von === 'spieler').map((n) => n.text)
  const letzter = normalisiere(spielerTexte.at(-1) ?? '')
  const gesamt = normalisiere(spielerTexte.join(' '))
  const bisherigeNachfragen = verlauf.filter((n) => n.von === 'ki').length

  const thema = erkenneThema(gesamt, themen)
  const istForderung = FORDERUNG_MUSTER.some((m) => m.test(letzter))

  // Pauschalurteil über eine Gruppe: wie eine Forderung nachfragen, das Urteil aber nicht wiedergeben.
  if (PAUSCHAL_MUSTER.some((m) => m.test(letzter)) && bisherigeNachfragen < MAX_NACHFRAGEN) {
    return {
      typ: 'forderung',
      nachfrage: NACHFRAGE_PAUSCHAL,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung: 'Allgemeine Aussage über eine Gruppe',
    }
  }

  // Forderung ≠ Problem: nach dem Alltagsproblem dahinter fragen (max. 2×).
  if (istForderung && bisherigeNachfragen < MAX_NACHFRAGEN) {
    return {
      typ: 'forderung',
      nachfrage: NACHFRAGEN[bisherigeNachfragen],
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung: `Forderung: ${kuerze(spielerTexte.at(-1) ?? '')}`,
    }
  }

  if (thema) {
    const ursachenIds = erkenneUrsachen(gesamt, thema, ursachen)
    if (ursachenIds.length > 0) {
      return {
        typ: 'problem',
        nachfrage: null,
        thema_id: thema.id,
        ursachen_ids: ursachenIds,
        zusammenfassung: kuerze(spielerTexte.at(-1) ?? ''),
      }
    }
    // Thema klar, Ursache nicht: nachfragen; danach ohne Wertung.
    return {
      typ: 'problem',
      nachfrage: bisherigeNachfragen < MAX_NACHFRAGEN ? NACHFRAGE_URSACHE : null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung: kuerze(spielerTexte.at(-1) ?? ''),
      einschaetzung: null,
    }
  }

  if (WERT_MUSTER.some((m) => m.test(letzter))) {
    return {
      typ: 'wert',
      nachfrage: null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung: `Persönliche Haltung: ${kuerze(spielerTexte.at(-1) ?? '')}`,
    }
  }

  // Problem erkannt, aber Thema nicht in der Datenbank → ungeprüft.
  return {
    typ: 'problem',
    nachfrage: null,
    thema_id: null,
    ursachen_ids: [],
    zusammenfassung: kuerze(spielerTexte.at(-1) ?? ''),
    einschaetzung: null,
  }
}

/** Simuliert die Latenz des späteren Edge-Function-Aufrufs. */
export async function analysiereAsync(
  verlauf: Nachricht[],
  themen: Thema[],
  ursachen: Ursache[],
  verzoegerungMs = 600,
): Promise<AnalyseAntwort> {
  await new Promise((r) => setTimeout(r, verzoegerungMs))
  return analysiere(verlauf, themen, ursachen)
}
