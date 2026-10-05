// Angaben für Impressum und Datenschutzerklärung. VOR DEM ÖFFENTLICHEN START
// alle Felder mit „[…]“ durch echte Angaben ersetzen – solange welche fehlen,
// zeigen beide Seiten einen deutlichen Hinweis.

export const BETREIBER = {
  /** Vor- und Nachname (bei Vereinen/Firmen: Name und Rechtsform) */
  name: '[Vor- und Nachname]',
  strasse: '[Straße und Hausnummer]',
  ort: '[PLZ Ort]',
  email: 'politik-duell@posteo.de',
  /** Optional, leer lassen wenn nicht gewünscht */
  telefon: '',
  /** Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (meist dieselbe Person) */
  inhaltlichVerantwortlich: '[Vor- und Nachname, Anschrift wie oben]',
  /** Datenschutz-Aufsichtsbehörde des eigenen Bundeslands */
  aufsichtsbehoerde: {
    name: '[Landesdatenschutzbehörde des Bundeslands]',
    url: 'https://www.bfdi.bund.de/DE/Service/Anschriften/Laender/Laender-node.html',
  },
  /** Öffentlicher Quellcode (für Transparenz der Bewertungen) */
  quellcode: 'https://github.com/politik-duell/politik-duell',
}

/** Stand der Datenschutzerklärung – bei inhaltlichen Änderungen anpassen. */
export const DATENSCHUTZ_STAND = '5. Oktober 2026'

export const betreiberVollstaendig = () =>
  !JSON.stringify(BETREIBER).includes('[')
