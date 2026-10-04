// @ts-nocheck
// AUTOMATISCH ERZEUGT aus supabase/functions/analyse (npm run dashboard) – nicht von Hand bearbeiten.
// Im Supabase-Dashboard: Edge Functions → Deploy a new function → Via Editor,
// Name „analyse“, diesen Inhalt komplett einfügen → Deploy.
// analyse/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

// _shared/bewertung.ts
var findeAbdeckung = (abdeckung, parteiId, themaId, land = null) => abdeckung.find((a) => a.partei_id === parteiId && a.thema_id === themaId && (a.land ?? null) === land) ?? null;
function programmFuer(ursacheId, ebenen) {
  if (!ebenen?.land) return null;
  const ebene = ebenen.ursachen.find((u) => u.id === ursacheId)?.ebene ?? "bund";
  return ebene === "land" ? ebenen.land : null;
}
function massnahmenPunkte(m, rolle) {
  const mod = rolle ? m.rollen_modifikator?.[rolle] : void 0;
  const rollenBonus = mod?.wert ?? 0;
  const hoechstens = m.evidenz === "gemischt" || m.evidenz === "offen" ? Math.max(2, m.wirksamkeit) : 3;
  const wirksamkeit = Math.min(hoechstens, Math.max(0, m.wirksamkeit + rollenBonus));
  return {
    punkte: wirksamkeit * m.umsetzbarkeit,
    wirksamkeit,
    rollenBonus,
    rollenBegruendung: mod?.begruendung
  };
}
function bewertePartei(partei, themaId, ursachenIds, rolle, massnahmen, abdeckung, ebenen) {
  const benoetigt = ursachenIds.length ? [
    ...new Set(ursachenIds.map((id) => programmFuer(id, ebenen)))
  ] : [
    null
  ];
  const programme = [];
  const ohneWertung = (fehlt) => ({
    partei,
    punkte: 0,
    treffer: [],
    abdeckung: null,
    fehlt,
    programme: []
  });
  for (const land of benoetigt) {
    let url = partei.programm_url;
    let stand = partei.programm_stand;
    if (land !== null) {
      const lp = ebenen?.landesprogramme.find((p) => p.partei_id === partei.id && p.land === land);
      if (!lp) return ohneWertung({
        grund: "nicht_erfasst",
        land
      });
      if (!lp.url || !lp.stand) return ohneWertung({
        grund: "kein_landesprogramm",
        land,
        begruendung: lp.kein_programm ?? void 0
      });
      url = lp.url;
      stand = lp.stand;
    }
    const a = findeAbdeckung(abdeckung, partei.id, themaId, land);
    if (!a) return ohneWertung({
      grund: "nicht_erfasst",
      land
    });
    if (a.durchsucht_fuer && ursachenIds.some((id) => programmFuer(id, ebenen) === land && !a.durchsucht_fuer.includes(id))) return ohneWertung({
      grund: "nicht_erfasst",
      land
    });
    programme.push({
      land,
      url,
      stand,
      abdeckung: a
    });
  }
  const erfasst = programme.every((p) => p.abdeckung.art === "keine") ? programme[0].abdeckung : programme.find((p) => p.abdeckung.art === "massnahmen").abdeckung;
  const eigene = massnahmen.filter((m) => m.partei_id === partei.id && m.thema_id === themaId);
  const trefferJeMassnahme = /* @__PURE__ */ new Map();
  let punkte = 0;
  for (const ursacheId of ursachenIds) {
    const land = programmFuer(ursacheId, ebenen);
    let beste = null;
    for (const m of eigene) {
      if (!m.ursachen_ids.includes(ursacheId) || (m.land ?? null) !== land) continue;
      const p = massnahmenPunkte(m, rolle);
      if (!beste || p.punkte > beste.p.punkte) beste = {
        m,
        p
      };
    }
    if (!beste) continue;
    punkte += beste.p.punkte;
    const vorhanden = trefferJeMassnahme.get(beste.m.id);
    if (vorhanden) {
      vorhanden.ursachen_ids.push(ursacheId);
    } else {
      trefferJeMassnahme.set(beste.m.id, {
        massnahme: beste.m,
        ursachen_ids: [
          ursacheId
        ],
        punkteJeUrsache: beste.p.punkte,
        rollenBonus: beste.p.rollenBonus,
        wirksamkeit: beste.p.wirksamkeit,
        rollenBegruendung: beste.p.rollenBegruendung
      });
    }
  }
  const kiEntwurf = programme.some((p) => p.abdeckung.ki_entwurf);
  const treffer = [
    ...trefferJeMassnahme.values()
  ];
  const nichtBlind = treffer.some((t) => t.massnahme.ki_entwurf && t.massnahme.entwurf_herkunft !== "blind");
  return {
    partei,
    punkte,
    treffer,
    abdeckung: erfasst,
    programme,
    ...kiEntwurf ? {
      ki_entwurf: true
    } : {},
    ...nichtBlind ? {
      nicht_blind: true
    } : {}
  };
}
function rundenpunkte(a, b) {
  if (a === 0 && b === 0) return [
    0,
    0
  ];
  if (a === b) return [
    1,
    1
  ];
  return a > b ? [
    1,
    0
  ] : [
    0,
    1
  ];
}
function werteRunde(a, b) {
  if (!a.abdeckung || !b.abdeckung) return {
    status: "unvollstaendig",
    punkte: [
      0,
      0
    ]
  };
  return {
    status: "gewertet",
    punkte: rundenpunkte(a.punkte, b.punkte)
  };
}

// _shared/fehler.ts
var EingabeFehler = class extends Error {
};

// _shared/moderation.ts
var BELEIDIGUNGEN = [
  "arschloch",
  "arschgeige",
  "idiot",
  "vollidiot",
  "depp",
  "trottel",
  "vollpfosten",
  "wichser",
  "wixer",
  "fotze",
  "hurensohn",
  "hure",
  "schlampe",
  "spast",
  "spacko",
  "missgeburt",
  "pisser",
  "drecksau",
  "bastard",
  "schwuchtel",
  "ficken",
  "fick dich",
  "verpiss",
  "honk",
  "halt die fresse"
];
var BELEIDIGENDE_WORTTEILE = [
  "drecks",
  "schei\xDF",
  "scheiss",
  "arschloch",
  "hurensohn",
  "wichser",
  "fotze",
  "idiot"
];
var HETZE = [
  "kanake",
  "kanacke",
  "neger",
  "nigger",
  "zigeuner",
  "kameltreiber",
  "untermensch",
  "judenpack",
  "judensau",
  "vergasen",
  "erschie\xDFen",
  "erschiessen",
  "abknallen",
  "totschlagen",
  "abstechen",
  "sieg heil",
  "heil hitler"
];
var PERSON_MUSTER = [
  /(^|[^\p{L}])(Herr|Herrn|Frau|Hr\.|Fr\.|Dr\.|Prof\.)\s+[A-ZÄÖÜ][a-zäöüß]+/u,
  /(^|\s)@[a-z0-9_]{3,}/i
];
var KONTAKT_MUSTER = [
  /[\w.+-]+@[\w-]+\.[a-z]{2,}/i,
  /(\+49|\b0049|\b0)[\s/-]?\d{2,5}[\s/-]?\d{4,}/,
  /(https?:\/\/|www\.)\S+/i,
  /\b[a-zäöüß]+(straße|str\.|weg|gasse|allee)\s+\d+[a-z]?\b/i
];
function normalisiere(text) {
  return " " + text.toLowerCase().replace(/[0@4$1!3]/g, (z) => ({
    "0": "o",
    "@": "a",
    "4": "a",
    $: "s",
    "1": "i",
    "!": "i",
    "3": "e"
  })[z] ?? z).replace(/[^a-zäöüß ]+/g, " ").replace(/(.)\1{2,}/g, "$1$1").replace(/\s+/g, " ") + " ";
}
var amWortanfang = (normal, liste) => liste.some((w) => normal.includes(" " + w));
var irgendwo = (normal, liste) => liste.some((w) => normal.includes(w));
function pruefeText(...texte) {
  const roh = texte.filter(Boolean).join(" \n ");
  if (!roh.trim()) return null;
  if (KONTAKT_MUSTER.some((m) => m.test(roh))) return "kontaktdaten";
  const normal = normalisiere(roh);
  if (amWortanfang(normal, HETZE)) return "hetze";
  if (amWortanfang(normal, BELEIDIGUNGEN) || irgendwo(normal, BELEIDIGENDE_WORTTEILE)) return "beleidigung";
  if (PERSON_MUSTER.some((m) => m.test(roh))) return "person";
  return null;
}
function bereinigeStichwort(roh, ersatz) {
  const text = (typeof roh === "string" && roh.trim() ? roh : ersatz).replace(/(https?:\/\/|www\.)\S+/gi, "").replace(/[„“"'»«.!?;:]+/g, "").replace(/\s+/g, " ").trim();
  const woerter = text.split(" ").filter(Boolean).slice(0, 3);
  let s = "";
  for (const w of woerter) {
    const neu = s ? `${s} ${w}` : w;
    if (neu.length > 40) break;
    s = neu;
  }
  return s || text.slice(0, 40) || "Problem";
}

// _shared/typen.ts
var ROLLEN_IDS = [
  "mieter",
  "eigentuemer",
  "angestellt",
  "selbststaendig",
  "rentner",
  "arbeitslos",
  "studierend",
  "vermoegend"
];
var MAX_AUSWAHL = 3;

// _shared/ki.ts
var MAX_NACHFRAGEN = 2;
var MAX_NACHRICHTEN = 2 * MAX_NACHFRAGEN + 1;
var MAX_TEXTLAENGE = 500;
var NACHFRAGE_BEISPIEL = "Magst du ein Beispiel nennen, wann dich das zuletzt betroffen hat?";
var NACHFRAGE_FORDERUNG = "Was soll sich dadurch in deinem Alltag \xE4ndern?";
var NACHFRAGE_URSACHE = "Was genau macht dir dabei Sorgen? Beschreib kurz, woran es in deinem Alltag hakt.";
var ROLLEN_TEXT = {
  mieter: "Mieter:in",
  eigentuemer: "Eigent\xFCmer:in",
  angestellt: "Angestellt",
  selbststaendig: "Selbstst\xE4ndig",
  rentner: "Rentner:in",
  arbeitslos: "Arbeitslos",
  studierend: "Studierend",
  vermoegend: "Verm\xF6gend"
};
function systemPrompt(themen, ursachen) {
  const katalog = themen.map((t) => {
    const u = ursachen.filter((x) => x.thema_id === t.id).map((x) => `    - Ursache ${x.id}: ${x.beschreibung}`).join("\n");
    return `- Thema ${t.id}: ${t.name} \u2013 ${t.beschreibung}
${u}`;
  }).join("\n");
  return `Du moderierst das Spiel \u201EPolitik-Duell\u201C. Spieler:innen nennen Alltagsprobleme.
Deine einzige Aufgabe: die \xC4u\xDFerung einordnen und einem Thema und Ursachen aus dem Katalog zuordnen.

Regeln:
- Neutral, respektvoll, freundlich. Keine Belehrung. Deutsch, kurze S\xE4tze.
- Bewerte NIEMALS Parteien, Politiker:innen oder Ma\xDFnahmen. Nenne keine Parteien.
- Nenne NIEMALS Links, Quellen oder Zahlen aus Studien.
- Vergib keine Punkte.

Einordnung ("typ"):
- "problem": ein konkretes Alltagsproblem (z. B. \u201EIch finde keine bezahlbare Wohnung\u201C).
- "forderung": eine politische Forderung ohne konkretes Alltagsproblem (z. B. \u201EWeniger Steuern!\u201C).
  Dann gib die Forderung in "nachfrage" in einem neutralen Halbsatz wieder und stelle danach immer genau eine
  kurze, freundliche Frage nach dem Alltag dahinter, z. B. \u201EDu m\xF6chtest weniger Steuern zahlen. Was soll sich
  dadurch in deinem Alltag \xE4ndern?\u201C. Die Wiedergabe allein reicht nie \u2013 "nachfrage" endet immer mit der Frage.
  Gib die Forderung nur wieder, wenn das ohne Wertung geht, sonst nur die Frage.
  Setze "thema_id" auf das Thema aus dem Katalog, zu dem die Forderung geh\xF6rt, sonst null; "ursachen_ids": [].
- "wert": eine pers\xF6nliche Haltung oder ein Wert (z. B. \u201EMir ist Gerechtigkeit wichtig\u201C), kein Problem.
  Dann "thema_id": null und "ursachen_ids": [], und in "rueckmeldung" 1\u20132 kurze S\xE4tze: die Haltung in eigenen
  Worten neutral aufgreifen, sagen, dass man dar\xFCber verschieden denken kann, und fragen, wo sie der Person im
  Alltag begegnet \u2013 z. B. \u201EHeimat ist dir wichtig \u2013 dar\xFCber kann man verschieden denken. Wo begegnet dir das im
  Alltag?\u201C. Stimme nicht zu und widersprich nicht. Wertet die Haltung eine Gruppe von Menschen ab, gib sie nicht
  wieder und frag nur nach dem Alltag.
- Ein pauschales Urteil \xFCber eine Gruppe von Menschen (z. B. \u201EDie Ausl\xE4nder sind alle kriminell\u201C, \u201ERentner sind \u2026\u201C)
  ist weder Problem noch Wert: Ordne es als "forderung" mit "pauschal": true und "thema_id": null ein und frage
  nach dem Alltag dahinter, z. B. \u201EWas hast du selbst erlebt, oder wo f\xFChlst du dich unsicher?\u201C.
  Widersprich nicht, belehre nicht, wiederhole das Urteil nicht und \xFCbernimm es nicht in "nachfrage",
  "zusammenfassung" oder "stichwort".
  Sonst ist "pauschal" immer false.

Sonst ist "rueckmeldung" null (Ausnahme: abschlie\xDFende Forderung, siehe Hinweis im Gespr\xE4ch).

Zuordnung (nur bei "problem"):
- "thema_id": die ID aus dem Katalog, die am besten passt, sonst null.
- "ursachen_ids": nur die IDs der Ursachen dieses Themas, die sich aus der Schilderung erkennen lassen.
  Nimm keine Ursache dazu, nur weil sie zum Thema geh\xF6rt \u2013 jede zugeordnete Ursache z\xE4hlt in der Wertung.
- Unterscheide Erlebnis und Gef\xFChl: Schildert jemand vor allem ein Gef\xFChl oder eine Sorge (z. B. \u201EIch f\xFChle mich
  unsicher, seit \u2026\u201C), passen Ursachen, die beschreiben, wie Wahrnehmung und Wirklichkeit auseinanderfallen oder wo
  sich Unsicherheit ballt. Ursachen zu Taten oder T\xE4tergruppen nur, wenn die Schilderung sie erkennen l\xE4sst.
- L\xE4sst sich keine Ursache erkennen: "thema_id" wie erkannt, "ursachen_ids": [] und in "nachfrage" genau eine
  kurze, freundliche Frage, woran es im Alltag konkret hakt, z. B. \u201EWas genau macht dir dabei Sorgen?\u201C.
  Gib keine Antworten vor.
- Passt kein Thema: "thema_id": null, "ursachen_ids": [] und in "einschaetzung" 1\u20132 neutrale S\xE4tze zu m\xF6glichen
  Ursachen des Problems \u2013 ohne Parteien, ohne L\xF6sungsbewertung, ohne Links.

"zusammenfassung": ein kurzer, neutraler Satz zum Problem, ohne Namen oder pers\xF6nliche Details.
"stichwort": 1\u20133 W\xF6rter, die das Problem neutral benennen (z. B. \u201EFacharzttermin\u201C, \u201ENebenkosten-Nachzahlung\u201C),
  ohne Namen, Orte, Beleidigungen oder Wertungen.

Formulierungen:
- Gib "nachfrage" und "rueckmeldung" jeweils als Liste von drei Fassungen an, die dasselbe sagen, aber mit
  anderen W\xF6rtern und anderem Satzbau \u2013 das Spiel zeigt eine davon zuf\xE4llig, damit es nicht wie ein Textbaustein
  wirkt. Jede Fassung f\xFCr sich erf\xFCllt die Regeln oben. Gibt es keine Nachfrage oder R\xFCckmeldung: null.

Katalog:
${katalog}

Antworte ausschlie\xDFlich mit einem JSON-Objekt:
{"typ": "problem" | "forderung" | "wert", "nachfrage": string[] | null, "thema_id": number | null,
 "ursachen_ids": number[], "pauschal": boolean, "zusammenfassung": string, "stichwort": string,
 "einschaetzung": string | null, "rueckmeldung": string[] | null}`;
}
function instrumenteZurAuswahl(themaId, instrumente, massnahmen, land) {
  return instrumente.filter((i) => i.thema_id === themaId && (i.ebene === "bund" || land !== null && massnahmen.some((m) => m.instrument_id === i.id && m.land === land))).sort((a, b) => a.id - b.id);
}
function instrumentPrompt(thema, instrumente) {
  const liste = instrumente.map((i) => `- Instrument ${i.id}: ${i.name}`).join("\n");
  return `Du hilfst im Spiel \u201EPolitik-Duell\u201C. Eine Person hat eine politische Forderung zum Thema \u201E${thema.name}\u201C genannt.
Deine einzige Aufgabe: Entspricht die Forderung eindeutig einem der folgenden L\xF6sungswege (Instrumente)?

Regeln:
- W\xE4hle ein Instrument nur, wenn die Forderung genau diesem L\xF6sungsweg entspricht. \xC4hnlich oder verwandt gen\xFCgt nicht.
  Rate nicht: Im Zweifel "instrument_id": null.
- Bewerte nichts und nenne keine Parteien, Links oder Zahlen.

Instrumente:
${liste}

Antworte ausschlie\xDFlich mit einem JSON-Objekt: {"instrument_id": number | null}`;
}
function instrumentNachrichten(verlauf) {
  return verlauf.map((n) => ({
    role: n.von === "spieler" ? "user" : "assistant",
    content: n.text
  }));
}
function bereinigeInstrument(roh, erlaubt) {
  const id = roh && typeof roh === "object" ? roh.instrument_id : null;
  return typeof id === "number" && erlaubt.some((i) => i.id === id) ? id : null;
}
function mitInstrument(antwort, instrumentId) {
  if (antwort.typ !== "forderung" || antwort.pauschal || antwort.thema_id === null || instrumentId === null) return antwort;
  return {
    ...antwort,
    instrument_id: instrumentId
  };
}
function nutzerNachrichten(verlauf, rolle) {
  const nachfragen = verlauf.filter((n) => n.von === "ki").length;
  const hinweis = `Rolle der Person: ${rolle ? ROLLEN_TEXT[rolle] : "keine Angabe"}.` + (nachfragen === 1 ? " Es wurde schon einmal nachgefragt: Falls du noch einmal nachfragst, frag anders als zuvor, z. B. nach einem konkreten Beispiel aus dem Alltag, und gib die Forderung nicht noch einmal wieder." : "") + (nachfragen >= MAX_NACHFRAGEN ? ' Es wurde bereits zweimal nachgefragt: Ordne jetzt abschlie\xDFend ein und stelle keine Nachfrage mehr. Bleibt es bei einer Forderung ohne Alltagsproblem, ordne sie als "forderung" ein und schreib in "rueckmeldung" 1\u20132 kurze S\xE4tze: die Forderung neutral aufgreifen, sagen, dass hier L\xF6sungen f\xFCr konkrete Alltagsprobleme gewertet werden, und zu einem solchen Problem einladen. W\xE4hle nur Ursachen, die sich aus dem Gesagten erkennen lassen.' : "");
  return [
    {
      role: "system",
      content: hinweis
    },
    ...verlauf.map((n) => ({
      role: n.von === "spieler" ? "user" : "assistant",
      content: n.text
    }))
  ];
}
var SITZUNG_MUSTER = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function pruefeAnfrage(roh) {
  const a = roh;
  if (!a || typeof a !== "object") throw new EingabeFehler("Anfrage fehlt.");
  if (typeof a.sitzung !== "string" || !SITZUNG_MUSTER.test(a.sitzung)) throw new EingabeFehler("Ung\xFCltige Sitzung.");
  const auswahl = pruefeAuswahl(a.auswahl);
  if (!Array.isArray(a.verlauf) || a.verlauf.length === 0 && !auswahl || a.verlauf.length > MAX_NACHRICHTEN) throw new EingabeFehler("Ung\xFCltiger Verlauf.");
  for (const n of a.verlauf) {
    if (!n || n.von !== "spieler" && n.von !== "ki" || typeof n.text !== "string") throw new EingabeFehler("Ung\xFCltige Nachricht.");
    if (n.text.trim().length === 0 || n.text.length > MAX_TEXTLAENGE) throw new EingabeFehler("Text zu lang oder leer.");
  }
  if (!auswahl && a.verlauf[a.verlauf.length - 1].von !== "spieler") throw new EingabeFehler("Letzte Nachricht muss vom Spieler sein.");
  if (a.rolle !== null && a.rolle !== void 0 && !ROLLEN_IDS.includes(a.rolle)) throw new EingabeFehler("Ung\xFCltige Rolle.");
  if (!Array.isArray(a.parteien) || a.parteien.length !== 2 || !a.parteien.every((p) => Number.isInteger(p)) || a.parteien[0] === a.parteien[1]) throw new EingabeFehler("Ung\xFCltige Parteien.");
  if (a.land !== null && a.land !== void 0 && (typeof a.land !== "string" || !/^[A-Z]{2}$/.test(a.land))) throw new EingabeFehler("Ung\xFCltiges Bundesland.");
  if (a.zugang !== null && a.zugang !== void 0 && (typeof a.zugang !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(a.zugang))) throw new EingabeFehler("Ung\xFCltiger Zugang zur Testphase.");
  return {
    sitzung: a.sitzung,
    verlauf: a.verlauf,
    rolle: a.rolle ?? null,
    land: a.land ?? null,
    zugang: a.zugang ?? null,
    parteien: a.parteien,
    auswahl
  };
}
function pruefeAuswahl(roh) {
  if (roh === null || roh === void 0) return null;
  const w = roh;
  const ids = w.ursachen_ids;
  if (typeof w !== "object" || !Number.isInteger(w.thema_id) || !Array.isArray(ids) || ids.length === 0 || ids.length > MAX_AUSWAHL || !ids.every((id) => Number.isInteger(id)) || new Set(ids).size !== ids.length) throw new EingabeFehler(`Ung\xFCltige Auswahl (1 bis ${MAX_AUSWAHL} Ursachen eines Themas).`);
  return {
    thema_id: w.thema_id,
    ursachen_ids: ids
  };
}
function antwortAusAuswahl(auswahl, themen, ursachen) {
  const thema = themen.find((t) => t.id === auswahl.thema_id);
  const passt = auswahl.ursachen_ids.every((id) => ursachen.some((u) => u.id === id && u.thema_id === auswahl.thema_id));
  if (!thema || !passt) throw new EingabeFehler("Diese Ursachen geh\xF6ren nicht zu diesem Thema.");
  const n = auswahl.ursachen_ids.length;
  return {
    typ: "problem",
    nachfrage: null,
    thema_id: thema.id,
    ursachen_ids: [
      ...auswahl.ursachen_ids
    ],
    zusammenfassung: kurz(`${thema.name}: ${n === 1 ? "eine Ursache" : `${n} Ursachen`} angetippt`, 200),
    stichwort: bereinigeStichwort(thema.name, thema.name),
    einschaetzung: null
  };
}
var regexText = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function ohneParteinamen(text, parteien) {
  const namen = /* @__PURE__ */ new Set();
  for (const p of parteien) {
    for (const n of [
      p.name,
      p.kurzname,
      ...p.kurzname.split("/")
    ]) {
      const t = n.trim();
      if (t.length >= 2) namen.add(t).add(t.toUpperCase());
    }
  }
  if (namen.size === 0) return text;
  const alternativen = [
    ...namen
  ].sort((a, b) => b.length - a.length).map(regexText).join("|");
  const muster = new RegExp(`(?:(?<!\\p{L})[Dd](?:ie|er|en|em|es)\\s+)?(?<![\\p{L}\\d])(?:${alternativen})(?:n|en|s)?(?![\\p{L}\\d])`, "gu");
  return text.replace(muster, "[Partei]");
}
var MAX_RUECKMELDUNG = 240;
function bereinigeRueckmeldung(roh, ohneLinks) {
  const text = ohneLinks(kurz(roh, MAX_RUECKMELDUNG + 1));
  if (text.length < 10 || text.length > MAX_RUECKMELDUNG || text.includes("[Partei]") || pruefeText(text)) return null;
  return text;
}
var fassungen = (roh) => Array.isArray(roh) ? roh.slice(0, 5) : [
  roh
];
var zufaellig = (liste, zufall) => liste[Math.min(liste.length - 1, Math.floor(zufall() * liste.length))];
var vergleichbar = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function ohneWiederholung(nachfrage, verlauf) {
  if (!nachfrage) return nachfrage;
  const frueher = new Set(verlauf.filter((n) => n.von === "ki").map((n) => vergleichbar(n.text)));
  for (const kandidat of [
    nachfrage,
    NACHFRAGE_BEISPIEL,
    NACHFRAGE_URSACHE
  ]) {
    if (!frueher.has(vergleichbar(kandidat))) return kandidat;
  }
  return nachfrage;
}
var kurz = (s, max) => typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, max) : "";
function bereinigeAntwort(roh, verlauf, themen, ursachen, parteien = [], zufall = Math.random) {
  const r = roh && typeof roh === "object" ? roh : {};
  const nachfragen = verlauf.filter((n) => n.von === "ki").length;
  const letzterText = verlauf.filter((n) => n.von === "spieler").at(-1)?.text ?? "";
  const ohneLinks = (s) => ohneParteinamen(s.replace(/(https?:\/\/|www\.)\S+/gi, ""), parteien).trim();
  const typ = r.typ === "forderung" || r.typ === "wert" ? r.typ : "problem";
  const pauschal = typ === "forderung" && r.pauschal === true;
  const frueher = new Set(verlauf.filter((n) => n.von === "ki").map((n) => vergleichbar(n.text)));
  const vorschlaege = fassungen(r.nachfrage).map((x) => ohneLinks(kurz(x, 200))).filter(Boolean);
  const gute = vorschlaege.filter((q) => q.includes("?") && !frueher.has(vergleichbar(q)));
  let nachfrage = zufaellig(gute.length ? gute : vorschlaege, zufall) ?? "";
  if (typ === "forderung") {
    if (nachfragen >= MAX_NACHFRAGEN) nachfrage = "";
    else if (!nachfrage) nachfrage = "Was l\xE4uft in deinem Alltag konkret schief?";
    else if (!nachfrage.includes("?")) nachfrage = `${nachfrage.replace(/[.!…]*$/, "")}. ${NACHFRAGE_FORDERUNG}`;
  }
  nachfrage = ohneWiederholung(nachfrage, verlauf);
  const erkanntesThema = themen.find((t) => t.id === Number(r.thema_id)) ?? null;
  const rueckmeldung = () => zufaellig(fassungen(r.rueckmeldung).map((x) => bereinigeRueckmeldung(x, ohneLinks)).filter((x) => x !== null), zufall) ?? null;
  const zusammenfassung = ohneLinks(kurz(r.zusammenfassung, 200)) || ohneLinks(kurz(letzterText, 120));
  const stichwortRoh = typeof r.stichwort === "string" ? ohneLinks(r.stichwort).replace(/\[Partei\]/g, "").trim() : "";
  const stichwort = bereinigeStichwort(stichwortRoh, zusammenfassung.replace(/\[Partei\]/g, ""));
  if (typ !== "problem") {
    const offen = typ === "forderung" ? nachfrage || null : null;
    return {
      typ,
      nachfrage: offen,
      // Bei einer Forderung: erkanntes Thema für die Ursachenauswahl (nicht bei Pauschalurteilen).
      thema_id: typ === "forderung" && !pauschal ? erkanntesThema?.id ?? null : null,
      ursachen_ids: [],
      ...pauschal ? {
        pauschal: true
      } : {},
      zusammenfassung,
      stichwort,
      einschaetzung: null,
      rueckmeldung: offen || pauschal ? null : rueckmeldung()
    };
  }
  const thema = erkanntesThema;
  if (!thema) {
    return {
      typ,
      nachfrage: null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: ohneLinks(kurz(r.einschaetzung, 400)) || null
    };
  }
  const erlaubt = ursachen.filter((u) => u.thema_id === thema.id).map((u) => u.id);
  const genannt = Array.isArray(r.ursachen_ids) ? r.ursachen_ids.map(Number).filter((id) => erlaubt.includes(id)) : [];
  if (genannt.length === 0) {
    const fragen = nachfragen < MAX_NACHFRAGEN;
    return {
      typ,
      // Ohne Frage (nur eine Feststellung) die Standardfrage nehmen.
      nachfrage: fragen ? ohneWiederholung(nachfrage.includes("?") ? nachfrage : NACHFRAGE_URSACHE, verlauf) : null,
      thema_id: fragen ? thema.id : null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: null
    };
  }
  return {
    typ,
    nachfrage: null,
    thema_id: thema.id,
    ursachen_ids: [
      ...new Set(genannt)
    ],
    zusammenfassung,
    stichwort,
    einschaetzung: null
  };
}

// _shared/pruefung.ts
async function tokenHash(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [
    ...new Uint8Array(digest)
  ].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// _shared/zugriff.ts
var RATE_LIMIT_SITZUNG = {
  max: 40,
  fenster: "30 minutes"
};
var RATE_LIMIT_GLOBAL = {
  max: 600,
  fenster: "1 hour"
};
var GLOBALE_SITZUNG = "00000000-0000-0000-0000-000000000000";
function globalesLimit(wert) {
  const n = Number(wert);
  return Number.isInteger(n) && n > 0 ? n : RATE_LIMIT_GLOBAL.max;
}
function erlaubteUrspruenge(wert) {
  const eintraege = (wert ?? "").split(",").map((s) => s.trim().replace(/\/+$/, "")).filter(Boolean);
  if (eintraege.length === 0) return null;
  return eintraege.map((e) => new RegExp("^" + e.split("*").map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[a-z0-9-]*") + "$", "i"));
}
function ursprungErlaubt(ursprung, erlaubt) {
  if (!erlaubt) return true;
  return ursprung !== null && erlaubt.some((r) => r.test(ursprung));
}
function corsKoepfe(ursprung, erlaubt) {
  return {
    "Access-Control-Allow-Origin": erlaubt ? ursprungErlaubt(ursprung, erlaubt) ? ursprung : "null" : "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    ...erlaubt ? {
      Vary: "Origin"
    } : {}
  };
}

// analyse/index.ts
var MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";
var MAX_ANFRAGE_BYTES = 8e3;
var ERLAUBT = erlaubteUrspruenge(Deno.env.get("ERLAUBTE_URSPRUENGE"));
var GLOBAL_MAX = globalesLimit(Deno.env.get("RATE_LIMIT_GLOBAL"));
var db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: {
    persistSession: false
  }
});
async function frageMistral(system, nachrichten) {
  const key = Deno.env.get("MISTRAL_API_KEY");
  if (!key) throw new Error("MISTRAL_API_KEY fehlt");
  const res = await fetch(MISTRAL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: Deno.env.get("MISTRAL_MODEL") ?? "mistral-small-latest",
      temperature: 0.1,
      // Platz für drei Fassungen von Nachfrage bzw. Rückmeldung.
      max_tokens: 700,
      response_format: {
        type: "json_object"
      },
      messages: [
        {
          role: "system",
          content: system
        },
        ...nachrichten
      ]
    }),
    signal: AbortSignal.timeout(2e4)
  });
  if (!res.ok) throw new Error(`Mistral ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const daten = await res.json();
  return JSON.parse(daten.choices?.[0]?.message?.content ?? "{}");
}
async function lesJson(req) {
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_ANFRAGE_BYTES) throw new EingabeFehler("Anfrage zu gro\xDF.");
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
async function imLimit(sitzung, max, fenster) {
  const { data, error } = await db.rpc("rate_limit_pruefen", {
    p_sitzung: sitzung,
    p_max: max,
    p_fenster: fenster
  });
  if (error) throw error;
  return data === true;
}
Deno.serve(async (req) => {
  const ursprung = req.headers.get("origin");
  const cors = corsKoepfe(ursprung, ERLAUBT);
  const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json"
    }
  });
  if (!ursprungErlaubt(ursprung, ERLAUBT)) return json({
    fehler: "Aufruf von dieser Seite nicht erlaubt."
  }, 403);
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: cors
  });
  if (req.method !== "POST") return json({
    fehler: "Nur POST erlaubt."
  }, 405);
  try {
    const anfrage = pruefeAnfrage(await lesJson(req));
    if (!await imLimit(anfrage.sitzung, RATE_LIMIT_SITZUNG.max, RATE_LIMIT_SITZUNG.fenster)) return json({
      fehler: "Zu viele Anfragen. Bitte warte ein paar Minuten."
    }, 429);
    if (!anfrage.auswahl && !await imLimit(GLOBALE_SITZUNG, GLOBAL_MAX, RATE_LIMIT_GLOBAL.fenster)) return json({
      fehler: "Gerade spielen sehr viele Leute. Bitte versuch es etwas sp\xE4ter noch einmal."
    }, 503);
    const [themenRes, ursachenRes, parteienRes] = await Promise.all([
      db.from("themen").select("id, name, beschreibung"),
      db.from("ursachen").select("*"),
      db.from("parteien").select("*")
    ]);
    if (themenRes.error) throw themenRes.error;
    if (ursachenRes.error) throw ursachenRes.error;
    if (parteienRes.error) throw parteienRes.error;
    const themen = themenRes.data;
    const ursachen = ursachenRes.data;
    const parteien = parteienRes.data;
    const testphase = anfrage.zugang ? await zugangGueltig(anfrage.zugang) : false;
    let antwort = anfrage.auswahl ? antwortAusAuswahl(anfrage.auswahl, themen, ursachen) : bereinigeAntwort(await frageMistral(systemPrompt(themen, ursachen), nutzerNachrichten(anfrage.verlauf, anfrage.rolle)), anfrage.verlauf, themen, ursachen, parteien);
    if (antwort.typ === "forderung" && !antwort.pauschal && antwort.thema_id !== null) {
      const thema = themen.find((t) => t.id === antwort.thema_id);
      if (thema) antwort = mitInstrument(antwort, await erkenneInstrument(thema, anfrage.verlauf, anfrage.land, testphase));
    }
    if (!antwort.nachfrage) {
      const original = anfrage.verlauf.filter((n) => n.von === "spieler").map((n) => n.text);
      await speichereRunde(antwort, anfrage.parteien, anfrage.rolle, anfrage.land, testphase, original, parteien, ursachen);
    }
    return json(antwort);
  } catch (e) {
    if (e instanceof EingabeFehler) return json({
      fehler: e.message
    }, 400);
    console.error("analyse:", e instanceof Error ? e.message : e);
    return json({
      fehler: "Die Einordnung hat gerade nicht geklappt. Bitte versuch es noch einmal."
    }, 502);
  }
});
async function erkenneInstrument(thema, verlauf, land, testphase) {
  try {
    let iAbfrage = db.from("instrumente").select("id, thema_id, name, ebene").eq("thema_id", thema.id);
    let mAbfrage = db.from("massnahmen").select("instrument_id, land").eq("thema_id", thema.id).not("instrument_id", "is", null);
    if (!testphase) {
      iAbfrage = iAbfrage.eq("ki_entwurf", false);
      mAbfrage = mAbfrage.eq("ki_entwurf", false);
    }
    const [iRes, mRes] = await Promise.all([
      iAbfrage,
      mAbfrage
    ]);
    if (iRes.error) throw iRes.error;
    if (mRes.error) throw mRes.error;
    const kandidaten = instrumenteZurAuswahl(thema.id, iRes.data, mRes.data, land);
    if (!kandidaten.length) return null;
    const roh = await frageMistral(instrumentPrompt(thema, kandidaten), instrumentNachrichten(verlauf));
    return bereinigeInstrument(roh, kandidaten);
  } catch (e) {
    console.error("erkenneInstrument:", e instanceof Error ? e.message : e);
    return null;
  }
}
async function zugangGueltig(token) {
  const { data, error } = await db.from("testphase_zugaenge").select("id").eq("token_hash", await tokenHash(token)).eq("gesperrt", false).maybeSingle();
  if (error) throw error;
  return data !== null;
}
async function speichereRunde(antwort, [parteiA, parteiB], rolle, land, testphase, original, parteien, ursachen) {
  const stichwort = antwort.stichwort ?? null;
  const basis = {
    problem_text: antwort.zusammenfassung,
    stichwort,
    // Automatischer Filter: Treffer landen in der Admin-Ansicht unter „Vom Filter gestoppt“.
    filter_grund: pruefeText(stichwort, antwort.zusammenfassung, ...original),
    partei_a: parteiA,
    partei_b: parteiB,
    testphase
  };
  if (antwort.typ === "wert") {
    await db.from("runden").insert({
      ...basis,
      status: "wert"
    });
    return;
  }
  if (antwort.typ === "forderung") {
    await db.from("runden").insert({
      ...basis,
      status: "forderung",
      thema_id: antwort.thema_id,
      ...antwort.instrument_id ? {
        instrument_id: antwort.instrument_id
      } : {}
    });
    return;
  }
  if (antwort.thema_id === null) {
    await Promise.all([
      db.from("runden").insert({
        ...basis,
        status: "ungeprueft"
      }),
      db.from("review_warteschlange").insert({
        problem_text: antwort.zusammenfassung,
        einschaetzung: antwort.einschaetzung ?? null
      })
    ]);
    return;
  }
  let mAbfrage = db.from("massnahmen").select("*").eq("thema_id", antwort.thema_id).in("partei_id", [
    parteiA,
    parteiB
  ]);
  let aAbfrage = db.from("abdeckung").select("*").eq("thema_id", antwort.thema_id).in("partei_id", [
    parteiA,
    parteiB
  ]);
  if (!testphase) {
    mAbfrage = mAbfrage.eq("ki_entwurf", false);
    aAbfrage = aAbfrage.eq("ki_entwurf", false);
  }
  const [mRes, aRes, lpRes] = await Promise.all([
    mAbfrage,
    aAbfrage,
    land ? db.from("landesprogramme").select("*").eq("land", land).in("partei_id", [
      parteiA,
      parteiB
    ]) : Promise.resolve({
      data: [],
      error: null
    })
  ]);
  const fehler = mRes.error ?? aRes.error ?? lpRes.error;
  if (fehler) {
    console.error("speichereRunde:", fehler.message);
    return;
  }
  const massnahmen = mRes.data;
  const abdeckung = aRes.data;
  const a = parteien.find((p) => p.id === parteiA);
  const b = parteien.find((p) => p.id === parteiB);
  if (!a || !b) return;
  const ebenen = {
    land,
    ursachen,
    landesprogramme: lpRes.data
  };
  const ea = bewertePartei(a, antwort.thema_id, antwort.ursachen_ids, rolle, massnahmen, abdeckung, ebenen);
  const eb = bewertePartei(b, antwort.thema_id, antwort.ursachen_ids, rolle, massnahmen, abdeckung, ebenen);
  const { status } = werteRunde(ea, eb);
  const punkte = status === "gewertet" ? {
    punkte_a: ea.punkte,
    punkte_b: eb.punkte
  } : {};
  await db.from("runden").insert({
    ...basis,
    thema_id: antwort.thema_id,
    status,
    ...punkte
  });
}
