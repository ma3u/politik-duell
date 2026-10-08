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

/** Ton an/aus (WCAG 1.4.2) – gilt für Sprache und Geräusche, nur für diesen Besuch. */
export function TonKnopf() {
  const an = useTon()
  return (
    <button
      type="button"
      className="knopf knopf-zweit knopf-klein show-ton"
      aria-pressed={!an}
      onClick={() => {
        setzeTon(!an)
        // Beim Einschalten die Startmelodie – so hört man sofort, ob der Ton geht. Das Tippen weckt auch eine
        // angehaltene Wiedergabe (iOS).
        if (!an) void startmelodie()
      }}
    >
      {an ? 'Ton aus' : 'Ton an'}
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
