import { grenzeAntwort, instrumenteZurAuswahl, MAX_NACHFRAGEN, mitInstrument, NACHFRAGE_URSACHE } from '../../supabase/functions/_shared/ki.ts'
import type { AnalyseAntwort, InstrumentEintrag, Massnahme, Nachricht, Thema, Ursache } from '../data/types'

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
/**
 * Grenze (docs/methode.md → „Grenze“): Abwertung einer Gruppe, Gewaltaufruf, Beleidigung. Bewusst eng –
 * ein Pauschalurteil („die sind alle …“) bleibt eine Nachfrage nach dem Erlebten.
 */
const GRENZE_MUSTER = [
  /\b(sind|seid) (doch |eh |halt |alle |keine )*(keine menschen|untermenschen|ungeziefer|abschaum|parasiten|tiere)\b/,
  /\b(gehoeren|sollte man|muss man|sollen) (alle |die )*(erschossen|aufgehaengt|vergast|abgeknallt|erschiessen|aufhaengen|vergasen|abknallen|totschlagen)\b/,
  /\b(sollen|duerfen|sollten) (doch |eh |halt )?(keine|nicht die gleichen) rechte haben\b/,
  /\b(drecks|scheiss)(auslaender|deutsche|muslime|juden|kanaken|schwule|frauen|weiber|linke|rechte|nazis|zecken)\b/,
  /\b(idiot|vollidiot|arschloch|hurensohn|wichser)\b/,
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

/** Was der Mock für den zweiten Aufruf (Instrument zur Forderung) braucht – wie die Edge Function. */
export interface InstrumentOptionen {
  instrumente?: InstrumentEintrag[]
  massnahmen?: Pick<Massnahme, 'instrument_id' | 'land'>[]
  /** Bundesland der Person: nur dann kommen Landes-Instrumente in Frage. */
  land?: string | null
}

/** Das Instrument des Themas mit den meisten Schlagwort-Treffern; ohne Treffer null (nicht raten). */
function erkenneInstrument(text: string, thema: Thema, o: InstrumentOptionen): number | null {
  const kandidaten = instrumenteZurAuswahl(thema.id, o.instrumente ?? [], o.massnahmen ?? [], o.land ?? null)
  let beste: number | null = null
  let besteTreffer = 0
  for (const i of kandidaten) {
    const n = treffer(text, (o.instrumente ?? []).find((x) => x.id === i.id)?.schlagwoerter)
    if (n > besteTreffer) {
      beste = i.id
      besteTreffer = n
    }
  }
  return beste
}

function kuerze(text: string, max = 90): string {
  const t = text.trim().replace(/\s+/g, ' ')
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export function analysiere(
  verlauf: Nachricht[],
  themen: Thema[],
  ursachen: Ursache[],
  optionen: InstrumentOptionen = {},
): AnalyseAntwort {
  const spielerTexte = verlauf.filter((n) => n.von === 'spieler').map((n) => n.text)
  const letzter = normalisiere(spielerTexte.at(-1) ?? '')
  const gesamt = normalisiere(spielerTexte.join(' '))
  const bisherigeNachfragen = verlauf.filter((n) => n.von === 'ki').length

  const thema = erkenneThema(gesamt, themen)
  const istForderung = FORDERUNG_MUSTER.some((m) => m.test(letzter))

  // Grenze: keine Karte, keine Nachfrage, kein Inhalt.
  if (GRENZE_MUSTER.some((m) => m.test(letzter))) return grenzeAntwort()

  // Pauschalurteil über eine Gruppe: wie eine Forderung nachfragen, das Urteil aber nicht wiedergeben.
  if (PAUSCHAL_MUSTER.some((m) => m.test(letzter)) && bisherigeNachfragen < MAX_NACHFRAGEN) {
    return {
      typ: 'forderung',
      nachfrage: NACHFRAGE_PAUSCHAL,
      thema_id: null,
      ursachen_ids: [],
      pauschal: true,
      zusammenfassung: 'Allgemeine Aussage über eine Gruppe',
    }
  }

  // Forderung ≠ Problem: nach dem Alltagsproblem dahinter fragen (max. 2×), mit dem erkannten
  // Thema für die Ursachenauswahl. Danach bleibt es eine Forderung ohne Wertung.
  if (istForderung) {
    const fragen = bisherigeNachfragen < MAX_NACHFRAGEN
    return mitInstrument(
      {
        typ: 'forderung',
        nachfrage: fragen ? NACHFRAGEN[bisherigeNachfragen] : null,
        thema_id: thema?.id ?? null,
        ursachen_ids: [],
        zusammenfassung: `Forderung: ${kuerze(spielerTexte.at(-1) ?? '')}`,
      },
      thema ? erkenneInstrument(gesamt, thema, optionen) : null,
    )
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
    // Thema klar, Ursache nicht: nachfragen (Thema für die Ursachenauswahl); danach ohne Wertung.
    const fragen = bisherigeNachfragen < MAX_NACHFRAGEN
    return {
      typ: 'problem',
      nachfrage: fragen ? NACHFRAGE_URSACHE : null,
      thema_id: fragen ? thema.id : null,
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
  optionen: InstrumentOptionen = {},
  verzoegerungMs = 600,
): Promise<AnalyseAntwort> {
  await new Promise((r) => setTimeout(r, verzoegerungMs))
  return analysiere(verlauf, themen, ursachen, optionen)
}
