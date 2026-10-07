import { supabase } from '../data/quelle'
import { STUN_URLS } from './netz'
import type { Weg } from './spielleitung'

// Verbindungen im Quiz (docs/plan-quiz.md → „Technik“): WebRTC-Datenkanal von Browser zu Browser. Zum
// Verbindungsaufbau dient ein flüchtiger Signalkanal – Supabase Realtime Broadcast (nichts wird gespeichert)
// oder ohne Supabase ein BroadcastChannel zwischen Tabs desselben Browsers (zum Ausprobieren). Steht die direkte
// Verbindung nicht rechtzeitig, leitet der Signalkanal die Spielnachrichten weiter.

/** Kennung der Spielleitung im Raum; Gäste bekommen eine zufällige. */
export const LEITUNG_ID = 'leitung'

/** Signalkanal: Supabase (übers Internet) oder lokal (nur Tabs dieses Browsers). */
export const SIGNAL_ART: 'supabase' | 'lokal' = supabase ? 'supabase' : 'lokal'

const SUCHE_MS = 1500
const RAUM_AUS_MS = 12_000
const DIREKT_MS = 8000
const MAX_NACHRICHT = 100_000

/** Eine Verbindung zu einem anderen Gerät im Raum. `onNachricht`/`onZu` setzt, wer sie benutzt. */
export interface Leitung {
  weg: Weg
  senden(n: unknown): void
  /** Schließt ohne `onZu` auszulösen. */
  schliessen(): void
  onNachricht: (n: unknown) => void
  onZu: () => void
}

export type RaumFehlerGrund = 'nicht_gefunden' | 'voll' | 'laeuft' | 'signal'

export class RaumFehler extends Error {
  readonly grund: RaumFehlerGrund
  constructor(grund: RaumFehlerGrund) {
    super(grund)
    this.grund = grund
  }
}

type Signal =
  | { typ: 'suche'; von: string }
  | { typ: 'voll'; von: string; an: string; grund: 'voll' | 'laeuft' }
  | { typ: 'angebot' | 'antwort'; von: string; an: string; sdp: RTCSessionDescriptionInit }
  | { typ: 'kandidat'; von: string; an: string; kandidat: RTCIceCandidateInit }
  | { typ: 'relais' | 'tschuess'; von: string; an: string }
  | { typ: 'daten'; von: string; an: string; daten: unknown }

const TYPEN = ['suche', 'voll', 'angebot', 'antwort', 'kandidat', 'relais', 'tschuess', 'daten']
const istSignal = (s: unknown): s is Signal =>
  !!s && typeof s === 'object' && TYPEN.includes((s as Signal).typ) && typeof (s as Signal).von === 'string'

interface Signalweg {
  senden(s: Signal): void
  schliessen(): void
}

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Raumcode aus sechs gut lesbaren Zeichen (ohne 0/O, 1/I/L). */
export function neuerRaumcode(): string {
  const z = crypto.getRandomValues(new Uint32Array(6))
  return [...z].map((n) => ALPHABET[n % ALPHABET.length]).join('')
}

export const istRaumcode = (s: string) => new RegExp(`^[${ALPHABET}]{6}$`).test(s)

const zufallsId = () => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('')

async function oeffneSignalweg(code: string, onSignal: (s: Signal) => void): Promise<Signalweg> {
  const empfang = (s: unknown) => istSignal(s) && onSignal(s)
  if (!supabase) {
    const kanal = new BroadcastChannel(`politik-duell-quiz-${code}`)
    kanal.onmessage = (e) => empfang(e.data)
    return { senden: (s) => kanal.postMessage(s), schliessen: () => kanal.close() }
  }
  const sb = supabase
  const kanal = sb.channel(`quiz-${code}`, { config: { broadcast: { self: false } } })
  kanal.on('broadcast', { event: 'signal' }, ({ payload }) => empfang(payload))
  await new Promise<void>((ok, fehler) =>
    kanal.subscribe((status) => {
      if (status === 'SUBSCRIBED') ok()
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') fehler(new RaumFehler('signal'))
    }),
  )
  return {
    senden: (s) => void kanal.send({ type: 'broadcast', event: 'signal', payload: s }),
    schliessen: () => void sb.removeChannel(kanal),
  }
}

const rtcKonfiguration = (): RTCConfiguration => ({ iceServers: STUN_URLS.length ? [{ urls: STUN_URLS }] : [] })

function datenkanalLeitung(dc: RTCDataChannel, pc: RTCPeerConnection): Leitung {
  let offen = true
  const zu = () => {
    if (!offen) return
    offen = false
    l.onZu()
  }
  const l: Leitung = {
    weg: 'direkt',
    senden: (n) => dc.readyState === 'open' && dc.send(JSON.stringify(n)),
    schliessen: () => {
      offen = false
      dc.close()
      pc.close()
    },
    onNachricht: () => {},
    onZu: () => {},
  }
  dc.onmessage = (e) => {
    if (typeof e.data !== 'string' || e.data.length > MAX_NACHRICHT) return
    try {
      l.onNachricht(JSON.parse(e.data))
    } catch {
      // kaputte Nachricht: verwerfen
    }
  }
  dc.onclose = zu
  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'closed') zu()
  })
  return l
}

/** Weiterleitung über den Signalkanal – wenn keine direkte Verbindung zustande kommt. */
function relaisLeitung(weg: Signalweg, ich: string, du: string, nachSchliessen?: () => void): Leitung {
  return {
    weg: SIGNAL_ART === 'supabase' ? 'server' : 'lokal',
    senden: (daten) => weg.senden({ typ: 'daten', von: ich, an: du, daten }),
    schliessen: () => {
      weg.senden({ typ: 'tschuess', von: ich, an: du })
      nachSchliessen?.()
    },
    onNachricht: () => {},
    onZu: () => {},
  }
}

async function kandidatHinzu(pc: RTCPeerConnection, k: RTCIceCandidateInit) {
  try {
    await pc.addIceCandidate(k)
  } catch {
    // veralteter oder unpassender Kandidat
  }
}

export interface Raum {
  /** Signalkanal schließen, sobald niemand mehr über ihn läuft (nach dem Start: so wenig Server wie möglich). */
  signalPausieren(): void
  /** Wieder öffnen, damit neue Gäste den Raum finden (zurück in den Raum nach „Nochmal“). */
  signalFortsetzen(): Promise<void>
  schliessen(): void
}

/**
 * Eröffnet einen Raum als Spielleitung. `darfBeitreten` entscheidet über neue Gäste, `onGast` bekommt jede neue
 * Verbindung – kommt für dieselbe ID eine zweite (Wechsel auf die Weiterleitung), ersetzt sie die erste.
 */
export async function eroeffneRaum(
  code: string,
  { darfBeitreten, onGast }: { darfBeitreten: () => 'ja' | 'voll' | 'laeuft'; onGast: (id: string, l: Leitung) => void },
): Promise<Raum> {
  interface Gast {
    pc?: RTCPeerConnection
    relais?: Leitung
    puffer: RTCIceCandidateInit[]
  }
  const gaeste = new Map<string, Gast>()
  let weg: Signalweg | null = null
  let geschlossen = false

  async function verbindeDirekt(id: string, g: Gast) {
    const pc = new RTCPeerConnection(rtcKonfiguration())
    g.pc = pc
    const dc = pc.createDataChannel('quiz', { ordered: true })
    pc.onicecandidate = (e) => e.candidate && weg?.senden({ typ: 'kandidat', von: LEITUNG_ID, an: id, kandidat: e.candidate.toJSON() })
    dc.onopen = () => {
      if (g.pc === pc) onGast(id, datenkanalLeitung(dc, pc))
    }
    await pc.setLocalDescription(await pc.createOffer())
    weg?.senden({ typ: 'angebot', von: LEITUNG_ID, an: id, sdp: pc.localDescription!.toJSON() })
  }

  async function onSignal(s: Signal) {
    if (s.typ !== 'suche' && s.an !== LEITUNG_ID) return
    const g = gaeste.get(s.von)
    switch (s.typ) {
      case 'suche': {
        if (g) return
        const ok = darfBeitreten()
        if (ok !== 'ja') return weg?.senden({ typ: 'voll', von: LEITUNG_ID, an: s.von, grund: ok })
        const neu: Gast = { puffer: [] }
        gaeste.set(s.von, neu)
        return verbindeDirekt(s.von, neu).catch(() => gaeste.delete(s.von))
      }
      case 'antwort':
        if (!g?.pc || g.pc.remoteDescription) return
        await g.pc.setRemoteDescription(s.sdp)
        for (const k of g.puffer.splice(0)) await kandidatHinzu(g.pc, k)
        return
      case 'kandidat':
        if (!g?.pc) return
        if (g.pc.remoteDescription) return kandidatHinzu(g.pc, s.kandidat)
        g.puffer.push(s.kandidat)
        return
      case 'relais': {
        if (!g || !weg) return
        g.pc?.close()
        g.pc = undefined
        g.relais = relaisLeitung(weg, LEITUNG_ID, s.von, () => gaeste.delete(s.von))
        onGast(s.von, g.relais)
        return
      }
      case 'daten':
        return g?.relais?.onNachricht(s.daten)
      case 'tschuess':
        g?.relais?.onZu()
        gaeste.delete(s.von)
        return
    }
  }

  const oeffnen = async () => {
    weg = await oeffneSignalweg(code, (s) => void onSignal(s).catch(() => {}))
    if (geschlossen) weg.schliessen()
  }
  await oeffnen()

  return {
    signalPausieren() {
      if (!weg || [...gaeste.values()].some((g) => g.relais)) return
      weg.schliessen()
      weg = null
    },
    async signalFortsetzen() {
      if (!weg && !geschlossen) await oeffnen()
    },
    schliessen() {
      geschlossen = true
      for (const g of gaeste.values()) g.pc?.close()
      weg?.schliessen()
      weg = null
    },
  }
}

/**
 * Tritt einem Raum bei. Gibt die Leitung zur Spielleitung zurück – direkt, wenn der Datenkanal innerhalb von
 * DIREKT_MS steht, sonst über die Weiterleitung. `signal` bricht den Versuch ab.
 */
export async function betrete(code: string, abbruch: AbortSignal): Promise<Leitung> {
  const ich = zufallsId()
  let pc: RTCPeerConnection | null = null
  let relais: Leitung | null = null
  const puffer: RTCIceCandidateInit[] = []
  let fertig = false
  const timer: ReturnType<typeof setTimeout>[] = []
  let ok: (l: Leitung) => void = () => {}
  let fehler: (e: Error) => void = () => {}
  const ergebnis = new Promise<Leitung>((a, b) => ((ok = a), (fehler = b)))

  const aufraeumen = () => {
    fertig = true
    timer.forEach(clearTimeout)
    timer.forEach(clearInterval)
  }

  const weg = await oeffneSignalweg(code, (s) => void onSignal(s).catch(() => {}))
  if (abbruch.aborted) {
    weg.schliessen()
    throw new DOMException('abgebrochen', 'AbortError')
  }
  const ende = (e: Error) => {
    if (fertig) return
    aufraeumen()
    pc?.close()
    weg.schliessen()
    fehler(e)
  }
  abbruch.addEventListener('abort', () => ende(new DOMException('abgebrochen', 'AbortError')))

  async function onSignal(s: Signal) {
    if (s.typ === 'suche' || s.an !== ich || s.von !== LEITUNG_ID) return
    switch (s.typ) {
      case 'voll':
        return ende(new RaumFehler(s.grund))
      case 'angebot': {
        if (pc || fertig) return
        clearInterval(timer[0])
        const neu = new RTCPeerConnection(rtcKonfiguration())
        pc = neu
        neu.onicecandidate = (e) => e.candidate && weg.senden({ typ: 'kandidat', von: ich, an: LEITUNG_ID, kandidat: e.candidate.toJSON() })
        neu.ondatachannel = (e) => {
          const dc = e.channel
          dc.onopen = () => {
            if (fertig) return dc.close()
            aufraeumen()
            weg.schliessen()
            ok(datenkanalLeitung(dc, neu))
          }
        }
        await neu.setRemoteDescription(s.sdp)
        for (const k of puffer.splice(0)) await kandidatHinzu(neu, k)
        await neu.setLocalDescription(await neu.createAnswer())
        weg.senden({ typ: 'antwort', von: ich, an: LEITUNG_ID, sdp: neu.localDescription!.toJSON() })
        timer.push(
          setTimeout(() => {
            if (fertig) return
            aufraeumen()
            neu.close()
            weg.senden({ typ: 'relais', von: ich, an: LEITUNG_ID })
            relais = relaisLeitung(weg, ich, LEITUNG_ID, () => weg.schliessen())
            ok(relais)
          }, DIREKT_MS),
        )
        return
      }
      case 'kandidat':
        if (pc?.remoteDescription) return kandidatHinzu(pc, s.kandidat)
        puffer.push(s.kandidat)
        return
      case 'daten':
        return relais?.onNachricht(s.daten)
      case 'tschuess':
        relais?.onZu()
        weg.schliessen()
        return
    }
  }

  const suche = () => weg.senden({ typ: 'suche', von: ich })
  timer.push(setInterval(suche, SUCHE_MS))
  timer.push(setTimeout(() => !pc && ende(new RaumFehler('nicht_gefunden')), RAUM_AUS_MS))
  suche()
  return ergebnis
}
