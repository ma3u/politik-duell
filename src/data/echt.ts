import {
  alsDateien,
  ladeKatalog,
  spielbareAbdeckung,
  spielbareHaltungen,
  spielbareInstrumente,
  spielbareLandesprogramme,
  spielbareMassnahmen,
} from './katalog.ts'
import type { Daten } from './quelle.ts'

// ---------------------------------------------------------------------------
// Echter Datenkatalog ohne Datenbank (VITE_DATENQUELLE=katalog, z. B. für die
// Testfassung auf GitHub Pages): die JSON-Dateien aus `daten/`, fest in die App
// gebaut, mit KI-Entwürfen wie in der geschlossenen Testphase (Hinweis oben).
// Die Einordnung übernimmt die Stichwortsuche im Browser (src/logic/analyse.ts),
// keine KI – es geht nichts an einen Server.
// ---------------------------------------------------------------------------

const [parteienDatei] = alsDateien(import.meta.glob('../../daten/parteien.json', { eager: true, import: 'default' }))
const themenDateien = alsDateien(import.meta.glob('../../daten/themen/*.json', { eager: true, import: 'default' }))
const haltungDateien = alsDateien(import.meta.glob('../../daten/haltungen/*.json', { eager: true, import: 'default' }))

const KATALOG = ladeKatalog(parteienDatei, themenDateien, haltungDateien)
const HALTUNGSDATEN = spielbareHaltungen(KATALOG, true)

export const ECHTE_DATEN: Daten = {
  quelle: 'katalog',
  parteien: KATALOG.parteien,
  themen: KATALOG.themen,
  ursachen: KATALOG.ursachen,
  massnahmen: spielbareMassnahmen(KATALOG, true),
  abdeckung: spielbareAbdeckung(KATALOG, true),
  laender: KATALOG.laender,
  landesprogramme: spielbareLandesprogramme(KATALOG),
  instrumente: spielbareInstrumente(KATALOG, true),
  haltungen: HALTUNGSDATEN.haltungen,
  haltungPositionen: HALTUNGSDATEN.positionen,
  zielkonflikte: HALTUNGSDATEN.zielkonflikte,
  testphase: true,
}
