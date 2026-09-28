// Erzeugt je Thema eine Prüfliste als eigenständige HTML-Seite für die
// Vier-Augen-Prüfung (Ablauf siehe daten/README.md → „Prüfung“).
// Aufruf: npm run pruefliste                  – alle Themen mit Maßnahmen
//         npm run pruefliste -- 2             – nur Thema 2
//         npm run pruefliste -- 2 --artefakt  – ohne HTML-Gerüst (zum Veröffentlichen als Artifact)
// Ausgabe: pruefung/<nr>-<thema>.html (nicht im Repo)
import { mkdirSync, writeFileSync } from 'node:fs'
import { blindeReihenfolge } from '../src/pruefung/auswertung.ts'
import { pruefeDatenordner } from './katalog-laden.ts'

const { katalog, fehler } = pruefeDatenordner()
if (fehler.length) {
  console.error('Datenkatalog fehlerhaft – erst `npm run daten:pruefen` beheben.')
  process.exit(1)
}

const argumente = process.argv.slice(2)
const artefakt = argumente.includes('--artefakt')
const nummer = argumente.find((a) => /^\d+$/.test(a))
const nurThema = nummer ? Number(nummer) : null

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const dateiname = (s: string) =>
  s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ordner = new URL('../pruefung/', import.meta.url)
mkdirSync(ordner, { recursive: true })

const PUNKTE_B = [
  'Link öffnet das richtige Programm auf der richtigen Seite',
  'Zitat steht dort wörtlich',
  'Kurzbeschreibung gibt das Zitat sinngemäß richtig wieder (nicht zugespitzt)',
  'Maßnahme passt zu den eingetragenen Ursachen',
  'Begründung ist neutral und bewertet nur die Maßnahme',
]

const STIL = `
  :root {
    --grund: #f6f7f9; --flaeche: #ffffff; --flaeche-2: #eef1f5; --linie: #d5dbe3;
    --text: #1a1f27; --leise: #5a6475; --akzent: #2f5fb3; --akzent-text: #ffffff;
    --gleich: #1d7a45; --eins: #9a5b00; --zwei: #b4232a; --zitat: #f3f0e8;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --grund: #13161b; --flaeche: #1b1f26; --flaeche-2: #232833; --linie: #333a47;
      --text: #e6e9ef; --leise: #9ba5b6; --akzent: #7ea6ec; --akzent-text: #0d1320;
      --gleich: #6fcf97; --eins: #f2b457; --zwei: #ff8f8a; --zitat: #24221d;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --grund: #13161b; --flaeche: #1b1f26; --flaeche-2: #232833; --linie: #333a47;
    --text: #e6e9ef; --leise: #9ba5b6; --akzent: #7ea6ec; --akzent-text: #0d1320;
    --gleich: #6fcf97; --eins: #f2b457; --zwei: #ff8f8a; --zitat: #24221d;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--grund); color: var(--text);
    font: 16px/1.55 "Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif;
  }
  .seite { max-width: 880px; margin: 0 auto; padding-inline: 16px; padding-block: 24px 64px; display: grid; gap: 28px; }
  h1, h2, h3 { text-wrap: balance; line-height: 1.2; margin: 0; }
  h1 { font-size: 1.75rem; }
  h2 { font-size: 1.3rem; }
  h3 { font-size: 1.05rem; margin-top: 8px; }
  p { margin: 0; }
  .etikett { font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--leise); font-weight: 700; }
  .leise { color: var(--leise); font-size: 0.9rem; }
  .abschnitt { display: grid; gap: 12px; }
  .kopf { display: grid; gap: 6px; }
  .ziel { background: var(--flaeche); border: 1px solid var(--linie); border-left: 4px solid var(--akzent); border-radius: 8px; padding: 10px 14px; display: grid; gap: 4px; font-size: 1.05rem; }
  details.empfehlung { grid-column: 2 / -1; font-size: 0.92rem; }
  details.empfehlung summary { cursor: pointer; color: var(--akzent); font-weight: 700; }
  details.empfehlung[open] summary { margin-bottom: 4px; }
  .schritte { display: flex; flex-wrap: wrap; gap: 8px; }
  .schritt { background: var(--flaeche-2); border-radius: 999px; padding: 4px 12px; font-size: 0.85rem; }
  details.massstab { background: var(--flaeche); border: 1px solid var(--linie); border-radius: 10px; padding: 12px 14px; }
  details.massstab summary { cursor: pointer; font-weight: 700; }
  details.massstab[open] summary { margin-bottom: 10px; }
  .skala { display: grid; grid-template-columns: 2.2em 1fr; gap: 4px 10px; margin-bottom: 10px; font-size: 0.92rem; }
  .skala b { font-variant-numeric: tabular-nums; }
  ul { margin: 0; padding-left: 1.2em; display: grid; gap: 4px; }
  .liste { display: grid; gap: 0; border: 1px solid var(--linie); border-radius: 10px; background: var(--flaeche); overflow: hidden; }
  .zeile { display: grid; grid-template-columns: 3.2em 1fr auto; gap: 8px 12px; padding: 12px 14px; border-top: 1px solid var(--linie); align-items: start; }
  .zeile:first-child { border-top: 0; }
  .kennung { font-weight: 700; font-variant-numeric: tabular-nums; color: var(--leise); }
  .wahl { display: flex; gap: 8px; }
  .wahl label { display: grid; gap: 2px; font-size: 0.75rem; color: var(--leise); text-align: center; }
  .vergleich { grid-column: 2 / -1; font-size: 0.9rem; }
  .vergleich:empty { display: none; }
  select, textarea {
    font: inherit; color: var(--text); background: var(--flaeche-2);
    border: 1px solid var(--linie); border-radius: 6px; padding: 4px 6px;
  }
  select { min-width: 3.2em; font-variant-numeric: tabular-nums; }
  textarea { width: 100%; min-height: 3.2em; resize: vertical; }
  :focus-visible { outline: 2px solid var(--akzent); outline-offset: 2px; }
  .knoepfe { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  button {
    font: inherit; font-weight: 700; padding: 8px 16px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--akzent); background: var(--akzent); color: var(--akzent-text);
  }
  button.zweit { background: transparent; color: var(--akzent); }
  .bilanz { font-variant-numeric: tabular-nums; }
  .gleich { color: var(--gleich); } .eins { color: var(--eins); } .zwei { color: var(--zwei); font-weight: 700; }
  .karte { background: var(--flaeche); border: 1px solid var(--linie); border-radius: 10px; padding: 14px; display: grid; gap: 8px; }
  .karte-kopf { display: flex; flex-wrap: wrap; gap: 6px 12px; font-size: 0.85rem; color: var(--leise); }
  .karte-kopf b { color: var(--text); }
  blockquote {
    margin: 0; padding: 10px 14px; background: var(--zitat); border-radius: 6px;
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif; font-size: 1.02rem; line-height: 1.5;
  }
  .haken { display: grid; gap: 4px; }
  .haken label { display: flex; gap: 8px; align-items: flex-start; }
  .haken input { margin-top: 0.3em; }
  a { color: var(--akzent); overflow-wrap: anywhere; }
  .teil-b > summary { cursor: pointer; list-style: revert; }
  .teil-b > summary h2 { display: inline; }
  .teil-b[open] > summary { margin-bottom: 12px; }
  .teil-b .abschnitt { margin-top: 4px; }
  @media (max-width: 560px) {
    .zeile { grid-template-columns: 2.6em 1fr; }
    .wahl { grid-column: 2; }
  }
`

for (const thema of katalog.themen) {
  if (nurThema !== null && thema.id !== nurThema) continue
  const massnahmen = katalog.massnahmen.filter((m) => m.thema_id === thema.id)
  const keine = katalog.abdeckung.filter((a) => a.thema_id === thema.id && a.art === 'keine')
  if (!massnahmen.length && !keine.length) continue

  const ursachen = katalog.ursachen.filter((u) => u.thema_id === thema.id)
  const ursacheText = (id: number) => ursachen.find((u) => u.id === id)?.beschreibung ?? String(id)
  const partei = (id: number) => katalog.parteien.find((p) => p.id === id)!
  // Feste, aber parteiunabhängige Reihenfolge für Durchgang A (wie auf der Prüfseite der App).
  const blind = blindeReihenfolge(massnahmen)
  const kennung = new Map(blind.map((m, i) => [m.id, `M${i + 1}`]))
  const fehlend = katalog.parteien.filter((p) => !katalog.abdeckung.some((a) => a.thema_id === thema.id && a.partei_id === p.id && !a.land))
  const landName = (id: string) => katalog.laender.find((l) => l.id === id)?.name ?? id
  // Umsetzbarkeit wird auf der Ebene des Programms bewertet (Bund oder Land).
  const ebeneText = (m: (typeof massnahmen)[number]) =>
    m.land ? `Landesebene (${esc(landName(m.land))})` : 'Bundesebene'

  const daten = {
    thema: thema.id,
    massnahmen: blind.map((m) => ({
      id: m.id,
      kennung: kennung.get(m.id),
      partei: partei(m.partei_id).kurzname,
      w: m.wirksamkeit,
      u: m.umsetzbarkeit,
      text: m.beschreibung,
    })),
  }

  const auswahl = (id: number, feld: 'w' | 'u', name: string) => `
          <label for="a-${id}-${feld}">${name}
            <select id="a-${id}-${feld}" data-feld="${feld}"><option value="">–</option>${[0, 1, 2, 3].map((v) => `<option>${v}</option>`).join('')}</select>
          </label>`

  const zeileA = (m: (typeof massnahmen)[number]) => `
      <div class="zeile" data-id="${m.id}" data-teil="a">
        <span class="kennung">${kennung.get(m.id)}</span>
        <div>
          <p>${esc(m.beschreibung)}</p>
          <p class="leise">Setzt an bei: ${m.ursachen_ids.map((u) => esc(ursacheText(u))).join(' · ')} · ${ebeneText(m)}</p>
        </div>
        <div class="wahl">${auswahl(m.id, 'w', 'Wirks.')}${auswahl(m.id, 'u', 'Umsetz.')}</div>
        <details class="empfehlung"><summary>Empfehlung ansehen</summary>
          <p><b>Wirksamkeit ${m.wirksamkeit}, Umsetzbarkeit ${m.umsetzbarkeit}</b> (= ${m.wirksamkeit * m.umsetzbarkeit} Punkte). ${esc(m.begruendung)}</p>
        </details>
        <p class="vergleich" aria-live="polite"></p>
      </div>`

  const karteB = (m: (typeof massnahmen)[number]) => `
      <div class="karte" data-id="${m.id}" data-teil="b">
        <div class="karte-kopf"><b>${kennung.get(m.id)}</b><span>${esc(partei(m.partei_id).name)}</span><span>Entwurf: Wirksamkeit ${m.wirksamkeit} × Umsetzbarkeit ${m.umsetzbarkeit} = ${m.wirksamkeit * m.umsetzbarkeit} Punkte</span></div>
        <p><b>${esc(m.beschreibung)}</b></p>
        <blockquote>„${esc(m.zitat ?? '(kein Zitat)')}“</blockquote>
        <p class="leise"><a href="${esc(m.beleg_programm_url)}" target="_blank" rel="noopener">Programm öffnen (PDF-Seite ${esc(m.beleg_programm_url.split('#page=')[1] ?? '?')})</a>${
          m.beleg_studie_url ? ` · <a href="${esc(m.beleg_studie_url)}" target="_blank" rel="noopener">Studie</a>` : ''
        }</p>
        <p class="leise">Setzt an bei: ${m.ursachen_ids.map((u) => esc(ursacheText(u))).join(' · ')} · ${ebeneText(m)}${
          m.evidenz ? ` · Forschungsstand: ${m.evidenz}` : ''
        }</p>
        <p class="leise">Begründung: ${esc(m.begruendung)}${
          m.rollen_modifikator
            ? `<br>Rollen: ${Object.entries(m.rollen_modifikator)
                .map(([r, v]) => `${r} ${v!.wert > 0 ? '+' : ''}${v!.wert} (${esc(v!.begruendung)})`)
                .join('; ')}`
            : ''
        }</p>
        <div class="haken">${PUNKTE_B.map((p, i) => `<label for="b-${m.id}-${i}"><input type="checkbox" id="b-${m.id}-${i}" data-feld="b${i}"> ${p}</label>`).join('')}</div>
        <textarea id="b-${m.id}-notiz" data-feld="notiz" placeholder="Einwand oder Notiz" aria-label="Notiz zu ${kennung.get(m.id)}"></textarea>
      </div>`

  const inhalt = `<title>Prüfliste ${esc(thema.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>${STIL}</style>
<main class="seite">
  <header class="kopf">
    <p class="etikett">Politik-Duell · Vier-Augen-Prüfung · Stand ${new Date().toISOString().slice(0, 10)}</p>
    <h1>Prüfliste ${esc(thema.name)}</h1>
    <p class="leise">${massnahmen.length} Maßnahmen aus ${new Set(massnahmen.map((m) => m.partei_id)).size} Wahlprogrammen${keine.length ? `, ${keine.length} × „keine Maßnahme“` : ''}.${
      fehlend.length ? ` Noch nicht erfasst: ${fehlend.map((p) => esc(p.name)).join(', ')}.` : ''
    } Deine Eingaben bleiben nur in diesem Browser gespeichert.</p>
    ${thema.ziel ? `<div class="ziel"><p class="etikett">Ziel – daran misst sich die Wirksamkeit</p><p>${esc(thema.ziel)}</p></div>` : ''}
    <div class="schritte"><span class="schritt">1 · Ohne Parteinamen bewerten</span><span class="schritt">2 · Vergleichen</span><span class="schritt">3 · Belege prüfen</span><span class="schritt">4 · Ergebnis kopieren</span></div>
  </header>

  <details class="massstab">
    <summary>Maßstab und Ursachen</summary>
    <p class="etikett">Wirksamkeit: Wie stark hilft sie beim Ziel?</p>
    <p class="leise" style="margin-bottom:6px">Nur aus Sicht der Betroffenen. Vor- und Nachteile für andere (z. B. Vermieter) zählen hier nicht.</p>
    <div class="skala"><b>0</b><span>hilft beim Ziel nicht: setzt an keiner der erfassten Ursachen an</span><b>1</b><span>hilft kaum: nur am Rand oder lindert nur Folgen (z. B. Zuschuss ohne mehr Angebot)</span><b>2</b><span>hilft spürbar: setzt an einer Ursache an, deutliche Verbesserung zu erwarten</span><b>3</b><span>hilft stark: direkt an einer Hauptursache, Wirkung gut belegt</span></div>
    <p class="etikett">Umsetzbarkeit: Könnte eine Bundesregierung sie in einer Wahlperiode rechtlich und finanziell umsetzen?</p>
    <div class="skala"><b>0</b><span>derzeit rechtlich oder finanziell nicht umsetzbar</span><b>1</b><span>nur mit großen Hürden (z. B. Verfassungsänderung, ungeklärte Finanzierung)</span><b>2</b><span>mit Aufwand oder in mehreren Jahren</span><b>3</b><span>rechtlich möglich, finanziert, in einer Wahlperiode realistisch</span></div>
    <p class="leise">Punkte je Maßnahme = Wirksamkeit × Umsetzbarkeit (0 bis 9).</p>
    <p class="etikett" style="margin-top:10px">Ursachen</p>
    <ul>${ursachen.map((u) => `<li>${esc(u.beschreibung)} · <a href="${esc(u.quelle_url)}" target="_blank" rel="noopener">Quelle</a></li>`).join('')}</ul>
  </details>

  <section class="abschnitt" aria-labelledby="h-a">
    <h2 id="h-a">Durchgang A: Bewertung ohne Parteinamen</h2>
    <p class="leise">Die Parteien sind ausgeblendet und die Reihenfolge ist gemischt. Lies die Maßnahme, überlege kurz selbst, und öffne dann bei Bedarf „Empfehlung ansehen“: Dort steht mein Vorschlag mit Begründung. Übernimm ihn, wenn die Begründung dich überzeugt, sonst wähle anders. „Vergleichen“ zeigt am Ende die Parteien und wo du abweichst.</p>
    <div class="liste">${blind.map(zeileA).join('')}</div>
    <div class="knoepfe"><button type="button" id="vergleichen">Vergleichen</button><span id="bilanz" class="bilanz leise"></span></div>
  </section>

  <details class="teil-b" id="teil-b">
    <summary><h2>Durchgang B: Belege prüfen</h2></summary>
    <div class="abschnitt">
    ${[...new Set(massnahmen.map((m) => m.partei_id))]
      .map((pid) => `<h3>${esc(partei(pid).name)}</h3>${massnahmen.filter((m) => m.partei_id === pid).map(karteB).join('')}`)
      .join('')}
    ${
      keine.length
        ? `<h3>„Keine Maßnahme im Programm“</h3>${keine
            .map(
              (k) =>
                `<div class="karte" data-id="k${k.partei_id}" data-teil="b"><b>${esc(partei(k.partei_id).name)}</b><p>${esc(k.begruendung ?? '')}</p><label for="k-${k.partei_id}"><input type="checkbox" id="k-${k.partei_id}" data-feld="b0"> Stichprobe mit der PDF-Suche bestätigt: nichts zum Thema</label></div>`,
            )
            .join('')}`
        : ''
    }
    </div>
  </details>

  <section class="abschnitt" aria-labelledby="h-e">
    <h2 id="h-e">Ergebnis</h2>
    <p class="leise">Erzeugt eine Tabelle mit deinen Werten und Notizen. Füge sie als Kommentar in den Pull Request ein.</p>
    <div class="knoepfe"><button type="button" id="kopieren">Zusammenfassung kopieren</button><span id="kopiert" class="leise" aria-live="polite"></span></div>
    <textarea id="ausgabe" readonly style="min-height:9em" aria-label="Zusammenfassung"></textarea>
  </section>
</main>

<script>
const DATEN = ${JSON.stringify(daten)};
const SCHLUESSEL = 'pruefliste-' + DATEN.thema;
let zustand = {};
try { zustand = JSON.parse(localStorage.getItem(SCHLUESSEL) || '{}') || {}; } catch (e) { zustand = {}; }
const speichern = () => { try { localStorage.setItem(SCHLUESSEL, JSON.stringify(zustand)); } catch (e) {} };
document.querySelectorAll('[data-feld]').forEach((el) => {
  const box = el.closest('[data-id]');
  const key = box.dataset.id + ':' + box.dataset.teil + ':' + el.dataset.feld;
  if (key in zustand) { if (el.type === 'checkbox') el.checked = !!zustand[key]; else el.value = zustand[key]; }
  el.addEventListener('input', () => { zustand[key] = el.type === 'checkbox' ? el.checked : el.value; speichern(); });
  el.addEventListener('change', () => { zustand[key] = el.type === 'checkbox' ? el.checked : el.value; speichern(); });
});
const wert = (id, feld) => { const v = zustand[id + ':a:' + feld]; return v === undefined || v === '' ? null : Number(v); };
function vergleichen() {
  let gleich = 0, eins = 0, zwei = 0, offen = 0;
  for (const m of DATEN.massnahmen) {
    const zelle = document.querySelector('.zeile[data-id="' + m.id + '"] .vergleich');
    const w = wert(m.id, 'w'), u = wert(m.id, 'u');
    if (w === null || u === null) { offen++; zelle.textContent = 'Noch nicht bewertet.'; zelle.className = 'vergleich leise'; continue; }
    const d = Math.max(Math.abs(w - m.w), Math.abs(u - m.u));
    if (d === 0) gleich++; else if (d === 1) eins++; else zwei++;
    zelle.className = 'vergleich ' + (d === 0 ? 'gleich' : d === 1 ? 'eins' : 'zwei');
    zelle.textContent = (d === 0 ? 'Gleich. ' : d === 1 ? '1 Stufe Abstand. ' : d + ' Stufen Abstand – Maßstab klären. ') +
      'Entwurf: ' + m.w + ' × ' + m.u + ' = ' + (m.w * m.u) + ', deine Werte: ' + w + ' × ' + u + ' = ' + (w * u) + ' · ' + m.partei;
  }
  document.getElementById('bilanz').textContent = gleich + ' gleich · ' + eins + ' mit 1 Stufe Abstand · ' + zwei + ' mit 2+ Stufen' + (offen ? ' · ' + offen + ' offen' : '');
}
document.getElementById('vergleichen').addEventListener('click', vergleichen);
document.getElementById('kopieren').addEventListener('click', () => {
  const z = ['### Prüfung Thema ' + DATEN.thema, '', '| Maßnahme | Partei | Entwurf W×U | Prüfung W×U | Belege | Notiz |', '| --- | --- | --- | --- | --- | --- |'];
  for (const m of DATEN.massnahmen) {
    const w = wert(m.id, 'w'), u = wert(m.id, 'u');
    const haken = [0, 1, 2, 3, 4].filter((i) => zustand[m.id + ':b:b' + i]).length;
    const notiz = String(zustand[m.id + ':b:notiz'] || '').replace(/\\n/g, ' ').replace(/\\|/g, '/');
    z.push('| ' + m.kennung + ' (' + m.id + ') ' + m.text.replace(/\\|/g, '/') + ' | ' + m.partei + ' | ' + m.w + '×' + m.u + ' | ' + (w === null ? '–' : w) + '×' + (u === null ? '–' : u) + ' | ' + haken + '/5 | ' + notiz + ' |');
  }
  const text = z.join('\\n');
  const feld = document.getElementById('ausgabe');
  const meldung = document.getElementById('kopiert');
  feld.value = text;
  const markieren = () => { feld.focus(); feld.select(); meldung.textContent = 'Text ist markiert – bitte selbst kopieren.'; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => { meldung.textContent = 'In die Zwischenablage kopiert.'; }, markieren);
  } else markieren();
});
</script>
`

  const html = artefakt
    ? inhalt
    : `<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${inhalt.replace('<main', '</head>\n<body>\n<main')}</body>\n</html>\n`
  const name = `${String(thema.id).padStart(2, '0')}-${dateiname(thema.name)}${artefakt ? '-artefakt' : ''}.html`
  writeFileSync(new URL(name, ordner), html)
  console.log(`geschrieben: pruefung/${name}`)
}
