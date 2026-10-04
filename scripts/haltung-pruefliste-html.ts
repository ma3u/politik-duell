// HTML-Seiten für die Prüfung der Haltungen (Ablauf: daten/README.md → „Haltungen prüfen“). Eigenständige
// Dateien ohne Server: Eingaben bleiben im Browser gespeichert, das Ergebnis wird kopiert oder als Datei geladen.
//   belegeBlatt       – Belegprüfung durch die Betreiberin (mit Parteinamen, Link, Zitat, Kurzfassung)
//   blindesBlatt      – für zwei Prüfende: Frage und Zitat ohne Parteinamen; sie ordnen Ja/Nein/Teils zu
//   formulierungsBlatt – für zwei Personen mit unterschiedlicher politischer Haltung (E9): Fragen, Beschreibungen,
//                        Zielkonflikte – ohne die Positionen der Parteien
import type { Katalog, KatalogHaltung, KatalogPosition } from '../src/data/katalog.ts'
import { ANTWORTEN, blindeZitate, standVon } from './haltung-pruefung.ts'
import { STIL } from './pruefliste-stil.ts'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const ZUSATZ = `
  .optionen { display: flex; flex-wrap: wrap; gap: 8px 18px; }
  .optionen label { display: flex; gap: 6px; align-items: center; cursor: pointer; }
  .optionen input { margin: 0; }
  .fortschritt { position: sticky; top: 0; z-index: 1; background: var(--grund); padding: 8px 0; border-bottom: 1px solid var(--linie); font-variant-numeric: tabular-nums; }
  .hinweis { background: var(--flaeche); border: 1px solid var(--linie); border-left: 4px solid var(--eins); border-radius: 8px; padding: 10px 14px; }
  .frage-block { display: grid; gap: 6px; padding: 10px 0; border-top: 1px solid var(--linie); }
  .frage-block:first-of-type { border-top: 0; }
  select { max-width: 100%; }
`

function seite(titel: string, kopf: string, inhalt: string, skript: string): string {
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>${STIL}${ZUSATZ}</style>
</head>
<body>
<main class="seite">
  <header class="kopf">
${kopf}
  </header>
${inhalt}
</main>
<script>
${skript}
</script>
</body>
</html>
`
}

const kopfzeile = (etikett: string, titel: string, text: string) =>
  `    <p class="etikett">${esc(etikett)}</p>\n    <h1>${esc(titel)}</h1>\n    <p class="leise">${text}</p>`

/** Gemeinsame Hilfen im Browser: Zustand speichern, Text kopieren, Datei laden. Ohne Template-Literale. */
const HILFEN = `
function laden(schluessel) { try { return JSON.parse(localStorage.getItem(schluessel) || '{}') || {}; } catch (e) { return {}; } }
function sichern(schluessel, z) { try { localStorage.setItem(schluessel, JSON.stringify(z)); } catch (e) {} }
function binden(schluessel, z, nachAenderung) {
  document.querySelectorAll('[data-feld]').forEach(function (el) {
    var key = el.dataset.feld;
    if (el.type === 'radio') {
      if (z[key] === el.value) el.checked = true;
      el.addEventListener('change', function () { if (el.checked) { z[key] = el.value; sichern(schluessel, z); nachAenderung(); } });
    } else if (el.type === 'checkbox') {
      if (z[key]) el.checked = true;
      el.addEventListener('change', function () { z[key] = el.checked; sichern(schluessel, z); nachAenderung(); });
    } else {
      if (z[key] !== undefined) el.value = z[key];
      el.addEventListener('input', function () { z[key] = el.value; sichern(schluessel, z); nachAenderung(); });
    }
  });
}
function kopieren(text, ausgabeId, meldungId) {
  var feld = document.getElementById(ausgabeId);
  var meldung = document.getElementById(meldungId);
  feld.value = text;
  var markieren = function () { feld.focus(); feld.select(); meldung.textContent = 'Text ist markiert – bitte selbst kopieren.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { meldung.textContent = 'In die Zwischenablage kopiert.'; }, markieren);
  } else markieren();
}
function alsDatei(text, name) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name;
  a.click();
}
`

// ---------------------------------------------------------------------------
// Blindblatt
// ---------------------------------------------------------------------------

const DEFINITIONEN = [
  ['Ja', 'Das Zitat spricht sich eindeutig für das aus, wonach die Frage fragt.'],
  ['Nein', 'Das Zitat spricht sich eindeutig dagegen aus.'],
  ['Teils', 'Das Zitat befürwortet nur einen Teil oder macht es von Bedingungen abhängig – oder es beantwortet die Frage für verschiedene Gruppen unterschiedlich.'],
  ['Unklar', 'Aus dem Zitat allein lässt sich keine Zuordnung erkennen.'],
]

export function blindesBlatt(k: Katalog): string {
  const zitate = blindeZitate(k)
  const stand = standVon(k)
  const haltungen = k.haltungen.filter((h) => zitate.some((z) => z.haltung_id === h.id))
  const kartenVon = (h: KatalogHaltung) =>
    zitate
      .filter((z) => z.haltung_id === h.id)
      .map(
        (z) => `
      <div class="karte" data-k="${z.kennung}">
        <div class="karte-kopf"><b>${z.kennung}</b></div>
        <blockquote>„${esc(z.zitat)}“</blockquote>
        <div class="optionen" role="radiogroup" aria-label="Zuordnung ${z.kennung}">${ANTWORTEN.map(
          (a) => `<label><input type="radio" name="r-${z.kennung}" value="${a}" data-feld="a:${z.kennung}"> ${a[0].toUpperCase() + a.slice(1)}</label>`,
        ).join('')}</div>
        <textarea data-feld="n:${z.kennung}" placeholder="Anmerkung (freiwillig)" aria-label="Anmerkung zu ${z.kennung}"></textarea>
      </div>`,
      )
      .join('')
  const inhalt = `
  <div class="hinweis">
    <p><b>So geht es:</b> Unten stehen kurze Zitate aus Wahlprogrammen – ohne Angabe, von wem sie stammen. Zu jeder Gruppe gehört eine Frage. Ordnen Sie jedes Zitat der Frage zu.</p>
    <p>Bitte entscheiden Sie <b>nur nach dem Zitat</b>, nicht nach dem, was Sie über Parteien vermuten oder erraten. Es gibt keine richtige Antwort, die Sie treffen müssen. „Unklar“ ist eine gültige Antwort. Ihre Antworten werden nicht mit Ihrem Namen verknüpft.</p>
  </div>
  <section class="abschnitt" aria-labelledby="h-def">
    <h2 id="h-def">Die Antworten</h2>
    <div class="skala">${DEFINITIONEN.map(([a, t]) => `<b>${a}</b><span>${esc(t)}</span>`).join('')}</div>
  </section>
  <div class="fortschritt" aria-live="polite" id="fortschritt"></div>
  ${haltungen
    .map(
      (h) => `<section class="abschnitt" aria-labelledby="h-${h.id}">
    <h2 id="h-${h.id}">Frage: ${esc(h.frage)}</h2>
    <p class="leise">${esc(h.beschreibung)}</p>${kartenVon(h)}
  </section>`,
    )
    .join('\n  ')}
  <section class="abschnitt" aria-labelledby="h-e">
    <h2 id="h-e">Fertig?</h2>
    <p class="leise">„Antworten kopieren“ erzeugt einen kurzen Text. Schicken Sie ihn zurück (E-Mail oder Nachricht) oder speichern Sie ihn als Datei und schicken die Datei.</p>
    <div class="knoepfe"><button type="button" id="kopieren">Antworten kopieren</button><button type="button" class="zweit" id="datei">Als Datei speichern</button><span id="kopiert" class="leise" aria-live="polite"></span></div>
    <textarea id="ausgabe" readonly style="min-height:9em" aria-label="Ihre Antworten"></textarea>
  </section>`
  const skript = `${HILFEN}
var STAND = ${JSON.stringify(stand)};
var KENNUNGEN = ${JSON.stringify(zitate.map((z) => z.kennung))};
var SCHLUESSEL = 'haltung-blind-' + STAND;
var z = laden(SCHLUESSEL);
function abgabe() {
  var a = {}, n = {};
  KENNUNGEN.forEach(function (k) { if (z['a:' + k]) a[k] = z['a:' + k]; if (z['n:' + k]) n[k] = z['n:' + k]; });
  var o = { stand: STAND, antworten: a };
  if (Object.keys(n).length) o.anmerkungen = n;
  return o;
}
function fortschritt() {
  var n = Object.keys(abgabe().antworten).length;
  document.getElementById('fortschritt').textContent = n + ' von ' + KENNUNGEN.length + ' Zitaten beantwortet';
}
binden(SCHLUESSEL, z, fortschritt);
fortschritt();
document.getElementById('kopieren').addEventListener('click', function () { kopieren(JSON.stringify(abgabe(), null, 2), 'ausgabe', 'kopiert'); });
document.getElementById('datei').addEventListener('click', function () { alsDatei(JSON.stringify(abgabe(), null, 2), 'haltung-antworten.json'); });`
  return seite(
    'Zitate einordnen',
    kopfzeile('Politik-Duell · Einordnung von Zitaten', 'Zitate einordnen', `${zitate.length} Zitate zu ${haltungen.length} Fragen. Dauer etwa 15 bis 20 Minuten.`),
    inhalt,
    skript,
  )
}

// ---------------------------------------------------------------------------
// Formulierungsblatt (E9)
// ---------------------------------------------------------------------------

const FORMULIERUNG_FRAGEN = [
  ['neutral', 'Ist die Frage neutral formuliert – würden Sie sie unverändert so stellen?'],
  ['wiederfinden', 'Finden sich Menschen beider Seiten in der Frage und in der Beschreibung wieder?'],
  ['beschreibung', 'Ist die Beschreibung frei von einem Lösungsweg und von einer Wertung?'],
  ['ziele', 'Sind die genannten Ziele beider Seiten gleich stark und fair formuliert?'],
  ['argument', 'Fehlt ein wichtiges Argument einer Seite?'],
  ['themen', 'Passen die verwandten Themen zur Frage?'],
] as const

export function formulierungsBlatt(k: Katalog): string {
  const haltungen = k.haltungen
  const themaName = (id: number) => k.themen.find((t) => t.id === id)?.name ?? String(id)
  const block = (h: KatalogHaltung) => `
  <section class="abschnitt" aria-labelledby="h-${h.id}">
    <h2 id="h-${h.id}">Frage ${h.id}: ${esc(h.frage)}</h2>
    <p>${esc(h.beschreibung)}</p>
    <p class="etikett">Genannte Ziele</p>
    <ul>${h.zielkonflikte
      .map((z) => `<li><b>${z.seite === 'ja' ? 'Für „Ja“' : 'Für „Nein“'}:</b> ${esc(z.text)} <a href="${esc(z.quelle_url)}" target="_blank" rel="noopener">Quelle</a></li>`)
      .join('')}</ul>
    <p class="leise">Verwandte Themen (zum Antippen im Spiel): ${h.verwandte_themen.map((t) => esc(themaName(t))).join(', ')}</p>
    ${FORMULIERUNG_FRAGEN.map(
      ([f, text]) => `<div class="frage-block">
      <p><b>${esc(text)}</b></p>
      <div class="optionen" role="radiogroup" aria-label="${esc(text)}">
        <label><input type="radio" name="f-${h.id}-${f}" value="passt" data-feld="${h.id}:${f}"> ${f === 'argument' ? 'Nein, nichts fehlt' : 'Ja'}</label>
        <label><input type="radio" name="f-${h.id}-${f}" value="aendern" data-feld="${h.id}:${f}"> ${f === 'argument' ? 'Ja, es fehlt etwas' : 'Nein, ich würde etwas ändern'}</label>
        <label><input type="radio" name="f-${h.id}-${f}" value="unsicher" data-feld="${h.id}:${f}"> Unsicher</label>
      </div>
      <textarea data-feld="${h.id}:${f}:text" placeholder="Was genau? Ihr Vorschlag (freiwillig)" aria-label="Anmerkung: ${esc(text)}"></textarea>
    </div>`,
    ).join('')}
  </section>`
  const inhalt = `
  <div class="hinweis">
    <p><b>Worum es geht:</b> Das Politik-Duell zeigt, wo die Parteien zu Wertfragen stehen. Bevor die Positionen erfasst werden, prüfen zwei Personen mit unterschiedlicher politischer Haltung, ob die Fragen fair gestellt sind. Die Positionen der Parteien sehen Sie hier bewusst nicht.</p>
    <p>Es zählt Ihr Eindruck. Antworten Sie, wie Sie als Mensch mit Ihrer Haltung die Frage lesen würden. Ihre Antworten werden nicht mit Ihrem Namen verknüpft.</p>
  </div>
  <section class="abschnitt">
    <label for="lage"><b>Ihre politische Selbsteinschätzung (freiwillig)</b></label>
    <p class="leise">Nur damit sich zeigen lässt, dass zwei verschiedene Sichtweisen geprüft haben. Es wird nicht mit Ihrem Namen veröffentlicht.</p>
    <select id="lage" data-feld="lage">
      <option value="">Keine Angabe</option><option>eher links</option><option>Mitte</option><option>eher rechts</option><option>lässt sich nicht einordnen</option>
    </select>
  </section>
  ${haltungen.map(block).join('')}
  <section class="abschnitt" aria-labelledby="h-e">
    <h2 id="h-e">Fertig?</h2>
    <div class="knoepfe"><button type="button" id="kopieren">Antworten kopieren</button><span id="kopiert" class="leise" aria-live="polite"></span></div>
    <textarea id="ausgabe" readonly style="min-height:11em" aria-label="Ihre Antworten"></textarea>
  </section>`
  const skript = `${HILFEN}
var HALTUNGEN = ${JSON.stringify(haltungen.map((h) => ({ id: h.id, frage: h.frage })))};
var FRAGEN = ${JSON.stringify(FORMULIERUNG_FRAGEN)};
var SCHLUESSEL = 'haltung-formulierung';
var z = laden(SCHLUESSEL);
var TEXT = { passt: 'in Ordnung', aendern: 'ÄNDERUNG', unsicher: 'unsicher' };
binden(SCHLUESSEL, z, function () {});
document.getElementById('kopieren').addEventListener('click', function () {
  var t = ['### Formulierungsprüfung Haltungen', '', 'Selbsteinschätzung: ' + (z.lage || 'keine Angabe'), ''];
  HALTUNGEN.forEach(function (h) {
    t.push('**Frage ' + h.id + ': ' + h.frage + '**');
    FRAGEN.forEach(function (f) {
      var a = z[h.id + ':' + f[0]];
      var x = z[h.id + ':' + f[0] + ':text'];
      t.push('- ' + f[1] + ' → ' + (a ? TEXT[a] + (f[0] === 'argument' && a === 'passt' ? ' (nichts fehlt)' : f[0] === 'argument' && a === 'aendern' ? ' (es fehlt etwas)' : '') : 'nicht beantwortet') + (x ? ' – ' + String(x).replace(/\\n/g, ' ') : ''));
    });
    t.push('');
  });
  kopieren(t.join('\\n'), 'ausgabe', 'kopiert');
});`
  return seite(
    'Fragen zu Wertfragen prüfen',
    kopfzeile('Politik-Duell · Formulierungsprüfung', 'Sind diese Fragen fair gestellt?', `${haltungen.length} Fragen mit Beschreibung und genannten Zielen. Dauer etwa 15 Minuten.`),
    inhalt,
    skript,
  )
}

// ---------------------------------------------------------------------------
// Belegprüfung (Betreiberin)
// ---------------------------------------------------------------------------

const HAKEN_ZITAT = [
  'Der Link öffnet das richtige Programm auf der richtigen Seite',
  'Das Zitat steht dort wörtlich',
  'Im umliegenden Kapitel steht nichts, was die Aussage einschränkt oder ihr widerspricht',
  'Die Kurzfassung gibt das Zitat richtig und neutral wieder (nicht zugespitzt, kein Parteiname)',
]
const HAKEN_AUSLASSUNG = 'Der ausgelassene Text („[…]“) ändert den Sinn nicht'
const HAKEN_KEINE = ['Eigene Suche im PDF ergab keine Aussage zur Frage', 'Das passende Kapitel habe ich gelesen und nichts dazu gefunden']

/** Hinweis zu Auslassungen im Zitat (HTML) – aus dem Programmtext, falls geladen. */
export type KontextVon = (p: KatalogPosition) => string

export function belegeBlatt(k: Katalog, kontext: KontextVon): string {
  const partei = (id: number) => k.parteien.find((p) => p.id === id)!
  const haltungen = k.haltungen.filter((h) => h.positionen.length)
  const karte = (h: KatalogHaltung, p: KatalogPosition) => {
    const id = `${h.id}/${p.partei_id}`
    const kopf = `<div class="karte-kopf"><b>Haltung ${h.id}</b><span>${esc(partei(p.partei_id).name)}</span><span>Entwurf: ${esc(p.position === 'keine_aussage' ? 'Keine Aussage' : p.position)}${p.ki_entwurf ? ' · KI-Entwurf' : ''}</span></div>`
    if (p.position === 'keine_aussage')
      return `
      <div class="karte" data-id="${id}" data-art="keine">${kopf}
        <p><b>Keine Aussage im Programm</b> – Begründung im Entwurf: ${esc(p.begruendung ?? '')}</p>
        <div class="haken">${HAKEN_KEINE.map((t, i) => `<label><input type="checkbox" data-feld="${id}:b${i}"> ${esc(t)}</label>`).join('')}</div>
        <textarea data-feld="${id}:suche" placeholder="Was habe ich gesucht und gelesen? (mindestens 30 Zeichen – kommt als „zweite_suche“ in die Datei)" aria-label="Zweite Suche"></textarea>
      </div>`
    const mitAuslassung = /\[…\]|…/.test(p.zitat ?? '')
    const haken = [...HAKEN_ZITAT, ...(mitAuslassung ? [HAKEN_AUSLASSUNG] : [])]
    return `
      <div class="karte" data-id="${id}" data-art="zitat" data-haken="${haken.length}">${kopf}
        <p><b>Kurzfassung:</b> ${esc(p.kurzfassung ?? '')}</p>
        <blockquote>„${esc(p.zitat ?? '')}“</blockquote>${kontext(p)}
        <p class="leise"><a href="${esc(p.beleg_programm_url ?? '')}" target="_blank" rel="noopener">Programm öffnen (PDF-Seite ${esc((p.beleg_programm_url ?? '').split('#page=')[1] ?? '?')})</a></p>
        <div class="haken">${haken.map((t, i) => `<label><input type="checkbox" data-feld="${id}:b${i}"> ${esc(t)}</label>`).join('')}</div>
        <textarea data-feld="${id}:notiz" placeholder="Einwand oder Notiz" aria-label="Notiz"></textarea>
      </div>`
  }
  const inhalt = `
  <div class="hinweis">
    <p><b>Was hier geprüft wird:</b> Belege und Wiedergabe – nicht die Einordnung Ja/Nein/Teils. Die bestätigen zwei andere Personen blind (Blindblatt). Du solltest nicht eine der beiden sein, denn du siehst hier die Parteien.</p>
    <p>Hake je Position ab, was stimmt, und notiere Einwände. „Ergebnis erzeugen“ liefert zu jeder vollständig geprüften Position die Zeile für die Datei (<code>pruefung</code>).</p>
  </div>
  <div class="fortschritt" aria-live="polite" id="fortschritt"></div>
  ${haltungen
    .map(
      (h) => `<section class="abschnitt" aria-labelledby="h-${h.id}">
    <h2 id="h-${h.id}">Haltung ${h.id}: ${esc(h.frage)}</h2>${h.positionen.map((p) => karte(h, p)).join('')}
  </section>`,
    )
    .join('\n  ')}
  <section class="abschnitt" aria-labelledby="h-e">
    <h2 id="h-e">Ergebnis</h2>
    <p class="leise">Kopiere den Text in den Pull Request oder gib ihn mir – ich trage die Nachweise ein.</p>
    <div class="knoepfe"><button type="button" id="kopieren">Ergebnis erzeugen und kopieren</button><span id="kopiert" class="leise" aria-live="polite"></span></div>
    <textarea id="ausgabe" readonly style="min-height:12em" aria-label="Ergebnis"></textarea>
  </section>`
  const skript = `${HILFEN}
var SCHLUESSEL = 'haltung-belege';
var z = laden(SCHLUESSEL);
var KARTEN = [].slice.call(document.querySelectorAll('.karte[data-id]'));
function fertig(karte) {
  var id = karte.dataset.id;
  if (karte.dataset.art === 'keine') return !!z[id + ':b0'] && !!z[id + ':b1'] && String(z[id + ':suche'] || '').trim().length >= 30;
  var n = Number(karte.dataset.haken);
  for (var i = 0; i < n; i++) if (!z[id + ':b' + i]) return false;
  return true;
}
function fortschritt() {
  var n = KARTEN.filter(fertig).length;
  document.getElementById('fortschritt').textContent = n + ' von ' + KARTEN.length + ' Positionen vollständig geprüft';
}
binden(SCHLUESSEL, z, fortschritt);
fortschritt();
document.getElementById('kopieren').addEventListener('click', function () {
  var heute = new Date().toISOString().slice(0, 10);
  var t = ['### Belegprüfung Haltungen (' + heute + ')', '', '| Haltung / Partei | Ergebnis | Notiz |', '| --- | --- | --- |'];
  var z2 = [];
  KARTEN.forEach(function (karte) {
    var id = karte.dataset.id, ok = fertig(karte);
    var notiz = String(z[id + ':notiz'] || '').replace(/\\n/g, ' ').replace(/\\|/g, '/');
    t.push('| ' + id.replace('/', ' / Partei ') + ' | ' + (ok ? 'geprüft' : 'offen') + ' | ' + notiz + ' |');
    if (ok) z2.push('Haltung ' + id.replace('/', ', Partei ') + ': "pruefung": ' + (karte.dataset.art === 'keine'
      ? JSON.stringify({ belege_geprueft: heute, zweite_suche: String(z[id + ':suche']).trim() })
      : JSON.stringify({ belege_geprueft: heute })));
  });
  t.push('', 'Einträge für die Datei (bei Positionen mit Zitat kommt „einordnung_bestaetigt“ aus der Auswertung der Blindblätter dazu):', '');
  kopieren(t.concat(z2).join('\\n'), 'ausgabe', 'kopiert');
});`
  return seite(
    'Belegprüfung Haltungen',
    kopfzeile(
      'Politik-Duell · Belegprüfung Haltungen',
      'Belegprüfung Haltungen',
      `${haltungen.reduce((n, h) => n + h.positionen.length, 0)} Positionen. Deine Eingaben bleiben nur in diesem Browser gespeichert.`,
    ),
    inhalt,
    skript,
  )
}
