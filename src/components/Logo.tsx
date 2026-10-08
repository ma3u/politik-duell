/**
 * Eigenes Logo: Wahlurne, in die gerade ein Stimmzettel mit Kreuz fällt – die Urne als Paket, das „liefert“.
 * `animiert`: einmaliger Auftritt (Urne springt auf, Kreuz wird gezeichnet, Zettel fällt hinein, Urne federt).
 */
export function Logo({ groesse = 64, animiert = false }: { groesse?: number; animiert?: boolean }) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={animiert ? 'logo logo-an' : 'logo'}
    >
      <g className="logo-zettel">
        <g transform="rotate(-8 32 20)">
          <rect x="19" y="4" width="26" height="30" rx="3" fill="#fff" stroke="var(--tinte)" strokeWidth="2.5" />
          <path
            className="logo-kreuz"
            pathLength={1}
            d="M26 11.5c3 3 8 8.4 12 11.6M37.6 10.6c-3.4 3.8-7.8 8.6-11.8 13"
            fill="none"
            stroke="var(--stimmblau)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </g>
      <g className="logo-urne">
        <rect x="6" y="28" width="52" height="31" rx="7" fill="var(--stimmblau)" />
        <rect x="4" y="25" width="56" height="8" rx="4" fill="var(--tinte)" />
        <rect x="18" y="27.5" width="28" height="3" rx="1.5" fill="var(--papier)" opacity="0.5" />
      </g>
    </svg>
  )
}
