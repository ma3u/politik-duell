import { SPRECHER } from './texte'
import { entsperren, setzeTon, startmelodie, tonWahlMerken, useTon, useTonFrei, useUntertitel } from './ton'

// Sichtbare Bausteine der Quiz-Show. Animationen stehen in index.css („Quiz-Show“) und ruhen bei „Bewegung
// anhalten“ bzw. „Bewegung reduzieren“. Kein Blinken (WCAG 2.3.1).

/** Untertitel der Moderatoren – für alle, die ohne Ton spielen oder nicht hören (für Screenreader ausgeblendet: der Inhalt steht ohnehin auf der Seite). */
export function UntertitelLeiste() {
  const u = useUntertitel()
  if (!u) return null
  return (
    <div className={`show-untertitel show-untertitel-${u.sprecher}`} aria-hidden="true">
      <span className="show-sprecher">{SPRECHER[u.sprecher].name}</span>
      <span className="show-satz">
        {u.woerter.map((w, i) => (
          <span key={i} className={i <= u.wort ? 'gesagt' : undefined}>
            {w}{' '}
          </span>
        ))}
      </span>
    </div>
  )
}

function Lautsprecher({ an, groesse = 22 }: { an: boolean; groesse?: number }) {
  return (
    <svg className="show-ton-symbol" viewBox="0 0 24 24" width={groesse} height={groesse} aria-hidden="true" focusable="false">
      <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor" />
      {an ? (
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6" />
          <path d="M18.2 6.3a8 8 0 0 1 0 11.4" />
        </g>
      ) : (
        <>
          {/* Lücke in Knopffarbe, damit der Strich sich vom Lautsprecher abhebt. */}
          <path className="show-ton-luecke" d="M3.5 3.5l17 17" fill="none" strokeWidth="5" strokeLinecap="round" />
          <path d="M3.5 3.5l17 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

/**
 * Ton an/aus (WCAG 1.4.2) – gilt für Sprache und Geräusche. Zeigt den Zustand, nicht die Aktion: Lautsprecher mit
 * Schallwellen = Ton spielt, durchgestrichen = aus oder vom Browser noch nicht freigegeben. Für Screenreader ein
 * Schalter „Ton“ (gedrückt = an); der Tooltip sagt, was ein Tippen tut. Die Wahl bleibt auf dem Gerät (ton.ts).
 */
export function TonKnopf() {
  const an = useTon()
  const frei = useTonFrei()
  const spielt = an && frei
  return (
    <button
      type="button"
      className="knopf knopf-zweit knopf-klein show-ton ton-wahl"
      aria-pressed={spielt}
      aria-label="Ton"
      title={
        spielt
          ? 'Ton ist an – tippen zum Ausschalten'
          : an
            ? 'Ton ist noch nicht freigegeben – tippen zum Einschalten'
            : 'Ton ist aus – tippen zum Einschalten'
      }
      onClick={() => {
        tonWahlMerken(!spielt)
        setzeTon(!spielt)
        // Beim Einschalten die Startmelodie – so hört man sofort, ob der Ton geht. Das Tippen weckt auch eine
        // angehaltene Wiedergabe (iOS).
        if (!spielt) void startmelodie()
      }}
    >
      <Lautsprecher an={spielt} />
    </button>
  )
}

/**
 * Deutlicher Hinweis, solange der Ton an ist, der Browser ihn aber noch nicht freigegeben hat: Browser spielen Ton
 * erst nach einer Nutzeraktion. `mitMelodie`: auf der Startseite die Startmusik spielen, im Spiel nur freischalten.
 */
export function TonAufruf({ mitMelodie }: { mitMelodie: boolean }) {
  const an = useTon()
  const frei = useTonFrei()
  if (frei || !an) return null
  return (
    <section className="ton-aufruf ton-wahl" aria-labelledby="ton-aufruf-titel">
      <Lautsprecher an groesse={34} />
      <div className="ton-aufruf-text">
        <h2 id="ton-aufruf-titel" className="ton-aufruf-titel">
          Mit Ton spielen?
        </h2>
        <p>Musik und zwei Moderatoren begleiten das Quiz. Dein Browser spielt Ton erst, wenn du ihn einschaltest.</p>
        <div className="knopf-reihe">
          <button
            type="button"
            className="knopf"
            onClick={() => {
              tonWahlMerken(true)
              setzeTon(true)
              if (mitMelodie) void startmelodie()
              else entsperren()
            }}
          >
            Ton einschalten
          </button>
          <button
            type="button"
            className="knopf knopf-zweit"
            onClick={() => {
              tonWahlMerken(false)
              setzeTon(false)
            }}
          >
            Ohne Ton spielen
          </button>
        </div>
      </div>
    </section>
  )
}

/** Großer Schriftzug, der auf die Bühne knallt. */
export function Knall({ text, klein, art = 'normal' }: { text: string; klein?: string; art?: 'normal' | 'gut' | 'schlecht' }) {
  return (
    <div className={`show-knall show-knall-${art}`} aria-hidden="true">
      <span className="show-knall-text">{text}</span>
      {klein && <span className="show-knall-klein">{klein}</span>}
    </div>
  )
}

/** Konfettiregen beim Sieg – gemeinsam mit dem Duell (src/components/Konfetti.tsx). */
export { Konfetti } from '../../components/Konfetti'
