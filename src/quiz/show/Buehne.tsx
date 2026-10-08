import { SPRECHER } from './texte'
import { setzeTon, startmelodie, useTon, useUntertitel } from './ton'

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

/**
 * Ton an/aus (WCAG 1.4.2) – gilt für Sprache und Geräusche, nur für diesen Besuch. Zeigt den Zustand, nicht die
 * Aktion: Lautsprecher mit Schallwellen = Ton an, durchgestrichen = Ton aus. Für Screenreader ein Schalter „Ton“
 * (gedrückt = an); der Tooltip sagt, was ein Tippen tut.
 */
export function TonKnopf() {
  const an = useTon()
  return (
    <button
      type="button"
      className="knopf knopf-zweit knopf-klein show-ton"
      aria-pressed={an}
      aria-label="Ton"
      title={an ? 'Ton ist an – tippen zum Ausschalten' : 'Ton ist aus – tippen zum Einschalten'}
      onClick={() => {
        setzeTon(!an)
        // Beim Einschalten die Startmelodie – so hört man sofort, ob der Ton geht. Das Tippen weckt auch eine
        // angehaltene Wiedergabe (iOS).
        if (!an) void startmelodie()
      }}
    >
      <svg className="show-ton-symbol" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
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
    </button>
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
