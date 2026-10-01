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
  return {
    partei,
    punkte,
    treffer: [
      ...trefferJeMassnahme.values()
    ],
    abdeckung: erfasst,
    programme,
    ...kiEntwurf ? {
      ki_entwurf: true
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

// _shared/ki.ts
var MAX_NACHFRAGEN = 2;
var MAX_NACHRICHTEN = 2 * MAX_NACHFRAGEN + 1;
var MAX_TEXTLAENGE = 500;
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
  Dann stelle in "nachfrage" genau eine kurze, freundliche Frage nach dem konkreten Alltagsproblem dahinter,
  z. B. \u201EWas l\xE4uft in deinem Alltag konkret schief?\u201C.
- "wert": eine pers\xF6nliche Haltung oder ein Wert (z. B. \u201EMir ist Gerechtigkeit wichtig\u201C), kein Problem.
- Ein pauschales Urteil \xFCber eine Gruppe von Menschen (z. B. \u201EDie Ausl\xE4nder sind alle kriminell\u201C, \u201ERentner sind \u2026\u201C)
  ist weder Problem noch Wert: Ordne es als "forderung" ein und frage nach dem Alltag dahinter,
  z. B. \u201EWas hast du selbst erlebt, oder wo f\xFChlst du dich unsicher?\u201C. Widersprich nicht, belehre nicht,
  wiederhole das Urteil nicht und \xFCbernimm es nicht in "zusammenfassung" oder "stichwort".

Zuordnung (nur bei "problem"):
- "thema_id": die ID aus dem Katalog, die am besten passt, sonst null.
- "ursachen_ids": nur die IDs der Ursachen dieses Themas, die sich aus der Schilderung erkennen lassen.
  Nimm keine Ursache dazu, nur weil sie zum Thema geh\xF6rt \u2013 jede zugeordnete Ursache z\xE4hlt in der Wertung.
- Unterscheide Erlebnis und Gef\xFChl: Schildert jemand vor allem ein Gef\xFChl oder eine Sorge (z. B. \u201EIch f\xFChle mich
  unsicher, seit \u2026\u201C), passen Ursachen, die beschreiben, wie Wahrnehmung und Wirklichkeit auseinanderfallen oder wo
  sich Unsicherheit ballt. Ursachen zu Taten oder T\xE4tergruppen nur, wenn die Schilderung sie erkennen l\xE4sst.
- L\xE4sst sich keine Ursache erkennen: "ursachen_ids": [] und in "nachfrage" genau eine kurze, freundliche Frage,
  woran es im Alltag konkret hakt, z. B. \u201EWas genau macht dir dabei Sorgen?\u201C. Gib keine Antworten vor.
- Passt kein Thema: "thema_id": null, "ursachen_ids": [] und in "einschaetzung" 1\u20132 neutrale S\xE4tze zu m\xF6glichen
  Ursachen des Problems \u2013 ohne Parteien, ohne L\xF6sungsbewertung, ohne Links.

"zusammenfassung": ein kurzer, neutraler Satz zum Problem, ohne Namen oder pers\xF6nliche Details.
"stichwort": 1\u20133 W\xF6rter, die das Problem neutral benennen (z. B. \u201EFacharzttermin\u201C, \u201ENebenkosten-Nachzahlung\u201C),
  ohne Namen, Orte, Beleidigungen oder Wertungen.

Katalog:
${katalog}

Antworte ausschlie\xDFlich mit einem JSON-Objekt:
{"typ": "problem" | "forderung" | "wert", "nachfrage": string | null, "thema_id": number | null,
 "ursachen_ids": number[], "zusammenfassung": string, "stichwort": string, "einschaetzung": string | null}`;
}
function nutzerNachrichten(verlauf, rolle) {
  const nachfragen = verlauf.filter((n) => n.von === "ki").length;
  const hinweis = `Rolle der Person: ${rolle ? ROLLEN_TEXT[rolle] : "keine Angabe"}.` + (nachfragen >= MAX_NACHFRAGEN ? ' Es wurde bereits zweimal nachgefragt: Ordne jetzt als "problem" oder "wert" ein, nicht als "forderung", und stelle keine Nachfrage mehr. W\xE4hle nur Ursachen, die sich aus dem Gesagten erkennen lassen.' : "");
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
  if (!Array.isArray(a.verlauf) || a.verlauf.length === 0 || a.verlauf.length > MAX_NACHRICHTEN) throw new EingabeFehler("Ung\xFCltiger Verlauf.");
  for (const n of a.verlauf) {
    if (!n || n.von !== "spieler" && n.von !== "ki" || typeof n.text !== "string") throw new EingabeFehler("Ung\xFCltige Nachricht.");
    if (n.text.trim().length === 0 || n.text.length > MAX_TEXTLAENGE) throw new EingabeFehler("Text zu lang oder leer.");
  }
  if (a.verlauf[a.verlauf.length - 1].von !== "spieler") throw new EingabeFehler("Letzte Nachricht muss vom Spieler sein.");
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
    parteien: a.parteien
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
var kurz = (s, max) => typeof s === "string" ? s.trim().replace(/\s+/g, " ").slice(0, max) : "";
function bereinigeAntwort(roh, verlauf, themen, ursachen, parteien = []) {
  const r = roh && typeof roh === "object" ? roh : {};
  const nachfragen = verlauf.filter((n) => n.von === "ki").length;
  const letzterText = verlauf.filter((n) => n.von === "spieler").at(-1)?.text ?? "";
  const ohneLinks = (s) => ohneParteinamen(s.replace(/(https?:\/\/|www\.)\S+/gi, ""), parteien).trim();
  let typ = r.typ === "forderung" || r.typ === "wert" ? r.typ : "problem";
  let nachfrage = ohneLinks(kurz(r.nachfrage, 200));
  if (typ === "forderung" && (nachfragen >= MAX_NACHFRAGEN || !nachfrage)) {
    if (nachfragen >= MAX_NACHFRAGEN) typ = "problem";
    else nachfrage = "Was l\xE4uft in deinem Alltag konkret schief?";
  }
  const zusammenfassung = ohneLinks(kurz(r.zusammenfassung, 200)) || ohneLinks(kurz(letzterText, 120));
  const stichwortRoh = typeof r.stichwort === "string" ? ohneLinks(r.stichwort).replace(/\[Partei\]/g, "").trim() : "";
  const stichwort = bereinigeStichwort(stichwortRoh, zusammenfassung.replace(/\[Partei\]/g, ""));
  if (typ !== "problem") {
    return {
      typ,
      nachfrage: typ === "forderung" ? nachfrage : null,
      thema_id: null,
      ursachen_ids: [],
      zusammenfassung,
      stichwort,
      einschaetzung: null
    };
  }
  const thema = themen.find((t) => t.id === Number(r.thema_id)) ?? null;
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
    return {
      typ,
      nachfrage: nachfragen < MAX_NACHFRAGEN ? nachfrage || NACHFRAGE_URSACHE : null,
      thema_id: null,
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
      max_tokens: 400,
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
    if (!await imLimit(GLOBALE_SITZUNG, GLOBAL_MAX, RATE_LIMIT_GLOBAL.fenster)) return json({
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
    const roh = await frageMistral(systemPrompt(themen, ursachen), nutzerNachrichten(anfrage.verlauf, anfrage.rolle));
    const antwort = bereinigeAntwort(roh, anfrage.verlauf, themen, ursachen, parteien);
    if (!antwort.nachfrage) {
      const original = anfrage.verlauf.filter((n) => n.von === "spieler").map((n) => n.text);
      const testphase = anfrage.zugang ? await zugangGueltig(anfrage.zugang) : false;
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
