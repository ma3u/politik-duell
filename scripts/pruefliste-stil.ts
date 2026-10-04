// Gemeinsames Stylesheet der Prüflisten (Maßnahmen: erzeuge-pruefliste.ts, Haltungen: erzeuge-haltung-pruefliste.ts).
export const STIL = `
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
  .achtung { color: var(--eins); }
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
