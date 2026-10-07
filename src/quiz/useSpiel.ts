import { useCallback, useEffect, useRef, useState } from 'react'
import type { Zeitfaktor } from './punkte'
import {
  alleFertig,
  alsGastNachricht,
  alsLeitungNachricht,
  aufloesen,
  mitAntwort,
  mitSpieler,
  MAX_SPIELER,
  limitFuer,
  mitZeitfaktor,
  neuerZustand,
  ohneSpieler,
  starte,
  waehleFragen,
  weiter,
  zurLobby,
  type Antwort,
  type LeitungNachricht,
  type QuizZustand,
  type Weg,
} from './spielleitung'
import type { QuizDaten, QuizFrage } from './typen'
import { betrete, eroeffneRaum, LEITUNG_ID, RaumFehler, type Leitung, type Raum } from './verbindung'

/** Kurze Gnadenfrist nach Ablauf der Zeit, damit späte Antworten aus dem Netz noch ankommen. */
const GNADE_MS = 1500

export const frageVon = (daten: QuizDaten, z: QuizZustand): QuizFrage | undefined =>
  daten.fragen.find((f) => f.id === z.fragen[z.index])

/** Zeitlimit der laufenden Frage; null = ohne Zeitlimit. */
const zeitFuer = (daten: QuizDaten, z: QuizZustand) => limitFuer(z, frageVon(daten, z) ?? { art: 'einzeln' })

export interface Spielsicht {
  z: QuizZustand | null
  ich: string | null
  /** Restzeit der laufenden Frage, als der Schnappschuss ankam. */
  restMs: number | null
  antworten: (auswahl: number[], ms: number) => void
}

export interface Leitstand extends Spielsicht {
  z: QuizZustand
  raumFehler: string | null
  raumBereit: boolean
  starten: () => void
  /** Zeit je Frage – nur vor dem Start (WCAG 2.2.1). */
  setzeZeit: (f: Zeitfaktor) => void
  /** Ohne Zeitlimit: Die Spielleitung löst auf, wenn nicht alle antworten. */
  aufloesen: () => void
  weiterGehen: () => void
  nochmal: () => void
}

export function raumFehlerText(e: unknown): string {
  if (e instanceof RaumFehler) {
    if (e.grund === 'nicht_gefunden') return 'Diesen Raum gibt es nicht (mehr), oder die Spielleitung ist nicht erreichbar.'
    if (e.grund === 'voll') return 'Der Raum ist voll (höchstens acht Personen).'
    if (e.grund === 'laeuft') return 'In diesem Raum läuft schon ein Spiel.'
    return 'Der Verbindungsdienst ist gerade nicht erreichbar.'
  }
  return e instanceof Error ? e.message : String(e)
}

/**
 * Spielleitung: hält den Zustand, nimmt Gäste auf, sammelt Antworten und schickt nach jeder Änderung allen einen
 * Schnappschuss. `code` = null: allein üben, ohne Raum.
 */
export function useSpielleitung(daten: QuizDaten, name: string, code: string | null, zeitfaktor: Zeitfaktor = 1): Leitstand {
  const [z, setZ] = useState(() => neuerZustand(daten.version, { id: LEITUNG_ID, name }, zeitfaktor))
  const [raumFehler, setRaumFehler] = useState<string | null>(null)
  const [raumBereit, setRaumBereit] = useState(code === null)
  const zRef = useRef(z)
  const antwortenRef = useRef<Record<string, Antwort>>({})
  const leitungen = useRef(new Map<string, Leitung>())
  const raum = useRef<Raum | null>(null)
  const frageStart = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const verteilen = useCallback(
    (s: QuizZustand) => {
      const limit = s.phase === 'frage' ? zeitFuer(daten, s) : null
      const restMs = limit === null ? null : Math.max(0, limit - (performance.now() - frageStart.current))
      for (const [id, l] of leitungen.current) l.senden({ t: 'zustand', du: id, z: { ...s, restMs } } satisfies LeitungNachricht)
    },
    [daten],
  )

  const setze = useCallback(
    (s: QuizZustand) => {
      zRef.current = s
      setZ(s)
      verteilen(s)
    },
    [verteilen],
  )

  const aufloesenJetzt = useCallback(() => {
    clearTimeout(timer.current)
    const s = zRef.current
    const f = frageVon(daten, s)
    if (s.phase === 'frage' && f) setze(aufloesen(s, f, antwortenRef.current))
  }, [daten, setze])

  const frageBeginnt = useCallback(
    (s: QuizZustand) => {
      antwortenRef.current = {}
      frageStart.current = performance.now()
      clearTimeout(timer.current)
      const limit = zeitFuer(daten, s)
      if (limit !== null) timer.current = setTimeout(aufloesenJetzt, limit + GNADE_MS)
      setze(s)
    },
    [daten, aufloesenJetzt, setze],
  )

  const antwortVon = useCallback(
    (id: string, index: number, auswahl: number[], ms: number) => {
      const s = zRef.current
      const f = frageVon(daten, s)
      if (s.phase !== 'frage' || index !== s.index || s.beantwortet.includes(id) || !f) return
      const ids = new Set(daten.parteien.map((p) => p.id))
      antwortenRef.current[id] = { auswahl: [...new Set(auswahl.filter((p) => ids.has(p)))], ms: Math.min(ms, limitFuer(s, f) ?? ms) }
      const neu = mitAntwort(s, id)
      setze(neu)
      if (alleFertig(neu)) aufloesenJetzt()
    },
    [daten, setze, aufloesenJetzt],
  )

  // Raum eröffnen (nicht beim Alleinspiel).
  useEffect(() => {
    if (code === null) return
    let aus = false
    const verbindungen = leitungen.current
    const weg = (id: string, l: Leitung) => {
      if (verbindungen.get(id) !== l) return
      verbindungen.delete(id)
      const neu = ohneSpieler(zRef.current, id)
      setze(neu)
      if (alleFertig(neu)) aufloesenJetzt()
    }
    eroeffneRaum(code, {
      darfBeitreten: () =>
        zRef.current.phase !== 'lobby' ? 'laeuft' : zRef.current.spieler.length >= MAX_SPIELER ? 'voll' : 'ja',
      onGast: (id, l) => {
        const alt = verbindungen.get(id)
        alt?.schliessen()
        verbindungen.set(id, l)
        l.onZu = () => weg(id, l)
        l.onNachricht = (roh) => {
          const n = alsGastNachricht(roh)
          if (!n) return
          if (n.t === 'antwort') return antwortVon(id, n.index, n.auswahl, n.ms)
          if (n.version !== daten.version) {
            l.senden({ t: 'abgelehnt', grund: 'version' } satisfies LeitungNachricht)
            return
          }
          const s = zRef.current
          const nr = s.spieler.length
          const neu = s.spieler.some((x) => x.id === id)
            ? { ...s, spieler: s.spieler.map((x) => (x.id === id ? { ...x, weg: l.weg as Weg } : x)) }
            : mitSpieler(s, { id, name: n.name || `Gast ${nr}`, weg: l.weg })
          if (typeof neu === 'string') l.senden({ t: 'abgelehnt', grund: neu } satisfies LeitungNachricht)
          else setze(neu)
        }
      },
    })
      .then((r) => {
        if (aus) return r.schliessen()
        raum.current = r
        setRaumBereit(true)
      })
      .catch((e: unknown) => !aus && setRaumFehler(raumFehlerText(e)))
    return () => {
      aus = true
      clearTimeout(timer.current)
      for (const l of verbindungen.values()) l.schliessen()
      verbindungen.clear()
      raum.current?.schliessen()
      raum.current = null
    }
  }, [code, daten, setze, antwortVon, aufloesenJetzt])

  useEffect(() => () => clearTimeout(timer.current), [])

  return {
    z,
    ich: LEITUNG_ID,
    restMs: z.phase === 'frage' ? zeitFuer(daten, z) : null,
    raumFehler,
    raumBereit,
    antworten: (auswahl, ms) => antwortVon(LEITUNG_ID, zRef.current.index, auswahl, ms),
    setzeZeit: (f) => setze(mitZeitfaktor(zRef.current, f)),
    aufloesen: aufloesenJetzt,
    starten: () => {
      frageBeginnt(starte(zRef.current, waehleFragen(daten.fragen)))
      raum.current?.signalPausieren()
    },
    weiterGehen: () => {
      const neu = weiter(zRef.current)
      if (neu.phase === 'frage') frageBeginnt(neu)
      else setze(neu)
    },
    nochmal: () => {
      setze(zurLobby(zRef.current))
      void raum.current?.signalFortsetzen()
    },
  }
}

export interface Gastsicht extends Spielsicht {
  status: 'verbinde' | 'verbunden' | 'getrennt'
  weg: Weg | null
  fehler: string | null
}

/** Gast: verbindet sich mit der Spielleitung, zeigt deren Schnappschüsse und schickt eigene Antworten. */
export function useGast(daten: QuizDaten, name: string, code: string): Gastsicht {
  const [z, setZ] = useState<QuizZustand | null>(null)
  const [ich, setIch] = useState<string | null>(null)
  const [restMs, setRestMs] = useState<number | null>(null)
  const [status, setStatus] = useState<Gastsicht['status']>('verbinde')
  const [weg, setWeg] = useState<Weg | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const leitung = useRef<Leitung | null>(null)
  const zRef = useRef<QuizZustand | null>(null)

  useEffect(() => {
    const abbruch = new AbortController()
    let l: Leitung | null = null
    betrete(code, abbruch.signal)
      .then((neu) => {
        if (abbruch.signal.aborted) return neu.schliessen()
        l = neu
        leitung.current = neu
        setWeg(neu.weg)
        setStatus('verbunden')
        neu.onZu = () => setStatus('getrennt')
        neu.onNachricht = (roh) => {
          const m = alsLeitungNachricht(roh)
          if (!m) return
          if (m.t === 'abgelehnt') {
            setFehler(
              m.grund === 'version'
                ? 'Die Spielleitung hat eine andere Fassung der Fragen. Bitte ladet beide die Seite neu.'
                : raumFehlerText(new RaumFehler(m.grund)),
            )
            return
          }
          const alt = zRef.current
          // Neue Frage: Restzeit merken – die Zeit läuft ab Anzeige auf diesem Gerät.
          if (m.z.phase === 'frage' && (alt?.phase !== 'frage' || alt.index !== m.z.index)) setRestMs(m.z.restMs)
          zRef.current = m.z
          setZ(m.z)
          setIch(m.du)
        }
        neu.senden({ t: 'hallo', name, version: daten.version })
      })
      .catch((e: unknown) => {
        if (!abbruch.signal.aborted) setFehler(raumFehlerText(e))
      })
    return () => {
      abbruch.abort()
      l?.schliessen()
      leitung.current = null
    }
  }, [code, name, daten.version])

  return {
    z,
    ich,
    restMs,
    status,
    weg,
    fehler,
    antworten: (auswahl, ms) => {
      if (zRef.current) leitung.current?.senden({ t: 'antwort', index: zRef.current.index, auswahl, ms })
    },
  }
}
