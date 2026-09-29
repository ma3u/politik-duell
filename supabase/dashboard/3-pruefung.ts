// @ts-nocheck
// AUTOMATISCH ERZEUGT aus supabase/functions/pruefung (npm run dashboard) – nicht von Hand bearbeiten.
// Im Supabase-Dashboard: Edge Functions → Deploy a new function → Via Editor,
// Name „pruefung“, diesen Inhalt komplett einfügen → Deploy.
// pruefung/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

// _shared/fehler.ts
var EingabeFehler = class extends Error {
};

// _shared/pruefung.ts
var TOKEN_MUSTER = /^[A-Za-z0-9_-]{43}$/;
var MAX_NOTIZ = 1e3;
var MAX_BEWERTUNGEN_JE_AUFRUF = 50;
var RATE_LIMIT_EINLADUNG = {
  max: 300,
  fenster: "30 minutes"
};
var RATE_LIMIT_PRUEFUNG_GLOBAL = {
  max: 2e3,
  fenster: "1 hour"
};
var PRUEFUNG_GLOBAL = "00000000-0000-0000-0000-000000000001";
async function tokenHash(token) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [
    ...new Uint8Array(digest)
  ].map((b) => b.toString(16).padStart(2, "0")).join("");
}
var istWert = (v) => v === null || v === 0 || v === 1 || v === 2 || v === 3;
var istId = (v) => typeof v === "number" && Number.isInteger(v) && v > 0 && v <= 2147483647;
function pruefePruefAnfrage(roh) {
  const a = roh;
  if (!a || typeof a !== "object" || Array.isArray(a)) throw new EingabeFehler("Anfrage fehlt.");
  const token = typeof a.token === "string" ? a.token : "";
  switch (a.aktion) {
    case "laden":
    case "widerrufen":
      return {
        token,
        aktion: a.aktion
      };
    case "einwilligen":
      if (typeof a.name_oeffentlich !== "boolean") throw new EingabeFehler("Angabe zur Namensnennung fehlt.");
      return {
        token,
        aktion: "einwilligen",
        name_oeffentlich: a.name_oeffentlich
      };
    case "absenden":
      if (!istId(a.thema_id)) throw new EingabeFehler("Ung\xFCltiges Thema.");
      return {
        token,
        aktion: "absenden",
        thema_id: a.thema_id
      };
    case "speichern": {
      const liste = a.bewertungen;
      if (!Array.isArray(liste) || liste.length === 0 || liste.length > MAX_BEWERTUNGEN_JE_AUFRUF) throw new EingabeFehler("Ung\xFCltige Bewertungen.");
      const gesehen = /* @__PURE__ */ new Set();
      const bewertungen = liste.map((b) => {
        if (!b || typeof b !== "object") throw new EingabeFehler("Ung\xFCltige Bewertung.");
        const { massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen } = b;
        if (!istId(massnahme_id) || gesehen.has(massnahme_id)) throw new EingabeFehler("Ung\xFCltige Ma\xDFnahme.");
        gesehen.add(massnahme_id);
        if (!istWert(wirksamkeit) || !istWert(umsetzbarkeit)) throw new EingabeFehler("Werte m\xFCssen zwischen 0 und 3 liegen.");
        if (notiz !== null && notiz !== void 0 && (typeof notiz !== "string" || notiz.length > MAX_NOTIZ)) throw new EingabeFehler(`Notiz zu lang (h\xF6chstens ${MAX_NOTIZ} Zeichen).`);
        if (typeof empfehlung_gesehen !== "boolean") throw new EingabeFehler("Ung\xFCltige Bewertung.");
        if (empfehlung_gesehen && (wirksamkeit === null || umsetzbarkeit === null)) throw new EingabeFehler("Die Empfehlung gibt es erst nach der eigenen Bewertung.");
        const text = typeof notiz === "string" ? notiz.trim() : "";
        return {
          massnahme_id,
          wirksamkeit,
          umsetzbarkeit,
          notiz: text || null,
          empfehlung_gesehen
        };
      });
      return {
        token,
        aktion: "speichern",
        bewertungen
      };
    }
    default:
      throw new EingabeFehler("Unbekannte Aktion.");
  }
}
var KEIN_ZUGANG = {
  status: 403,
  body: {
    fehler: "Dieser Link ist nicht (mehr) g\xFCltig."
  }
};
async function bearbeitePruefung(anfrage, speicher2, katalog) {
  try {
    return await bearbeite(anfrage, speicher2, katalog);
  } catch (e) {
    if (e instanceof EingabeFehler) return {
      status: 400,
      body: {
        fehler: e.message
      }
    };
    throw e;
  }
}
async function bearbeite(anfrage, speicher2, katalog) {
  const g = RATE_LIMIT_PRUEFUNG_GLOBAL;
  if (!await speicher2.imLimit(PRUEFUNG_GLOBAL, g.max, g.fenster)) return {
    status: 503,
    body: {
      fehler: "Gerade zu viele Anfragen. Bitte sp\xE4ter noch einmal versuchen."
    }
  };
  if (!TOKEN_MUSTER.test(anfrage.token)) return KEIN_ZUGANG;
  const einladung = await speicher2.einladung(await tokenHash(anfrage.token));
  if (!einladung || einladung.gesperrt) return KEIN_ZUGANG;
  const e = RATE_LIMIT_EINLADUNG;
  if (!await speicher2.imLimit(einladung.id, e.max, e.fenster)) return {
    status: 429,
    body: {
      fehler: "Zu viele Anfragen. Bitte ein paar Minuten warten."
    }
  };
  const ok = {
    status: 200,
    body: {
      ok: true
    }
  };
  switch (anfrage.aktion) {
    case "laden": {
      const bewertungen = await speicher2.bewertungen(einladung.id);
      return {
        status: 200,
        body: {
          name: einladung.name,
          themen: einladung.themen,
          einwilligung: einladung.einwilligung_am !== null,
          name_oeffentlich: einladung.name_oeffentlich,
          bewertungen: bewertungen.map(({ massnahme_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen, abgesendet }) => ({
            massnahme_id,
            wirksamkeit,
            umsetzbarkeit,
            notiz,
            empfehlung_gesehen,
            abgesendet
          }))
        }
      };
    }
    case "einwilligen":
      await speicher2.einwilligen(einladung.id, anfrage.name_oeffentlich);
      return ok;
    case "widerrufen":
      await speicher2.widerrufen(einladung.id);
      return ok;
    case "speichern": {
      if (!einladung.einwilligung_am) throw new EingabeFehler("Bitte zuerst einwilligen.");
      const themaVon = /* @__PURE__ */ new Map();
      for (const t of einladung.themen) for (const id of katalog[t] ?? []) themaVon.set(id, t);
      const vorher = new Map((await speicher2.bewertungen(einladung.id)).map((b) => [
        b.massnahme_id,
        b
      ]));
      const zeilen = anfrage.bewertungen.map((b) => {
        const thema_id = themaVon.get(b.massnahme_id);
        if (thema_id === void 0) throw new EingabeFehler("Diese Ma\xDFnahme geh\xF6rt nicht zu deinen Themen.");
        const alt = vorher.get(b.massnahme_id);
        if (alt?.abgesendet && (b.wirksamkeit === null || b.umsetzbarkeit === null)) throw new EingabeFehler("Abgesendete Bewertungen brauchen beide Werte.");
        const empfehlung_gesehen = b.empfehlung_gesehen || (alt?.empfehlung_gesehen ?? false);
        if (empfehlung_gesehen && (b.wirksamkeit === null || b.umsetzbarkeit === null)) throw new EingabeFehler("Nach dem Ansehen der Empfehlung brauchen beide Werte eine Angabe.");
        const geaendert = alt !== void 0 && alt.empfehlung_gesehen && (alt.wirksamkeit !== b.wirksamkeit || alt.umsetzbarkeit !== b.umsetzbarkeit);
        return {
          ...b,
          thema_id,
          empfehlung_gesehen,
          nach_empfehlung_geaendert: (alt?.nach_empfehlung_geaendert ?? false) || geaendert,
          abgesendet: alt?.abgesendet ?? false
        };
      });
      await speicher2.speichern(einladung.id, zeilen);
      return ok;
    }
    case "absenden": {
      if (!einladung.einwilligung_am) throw new EingabeFehler("Bitte zuerst einwilligen.");
      if (!einladung.themen.includes(anfrage.thema_id)) throw new EingabeFehler("Dieses Thema ist nicht freigegeben.");
      const bewertet = new Set((await speicher2.bewertungen(einladung.id)).filter((b) => b.wirksamkeit !== null && b.umsetzbarkeit !== null).map((b) => b.massnahme_id));
      const offen = (katalog[anfrage.thema_id] ?? []).filter((id) => !bewertet.has(id)).length;
      if (offen) throw new EingabeFehler(`Noch ${offen} Ma\xDFnahme${offen === 1 ? "" : "n"} ohne Bewertung.`);
      await speicher2.absenden(einladung.id, anfrage.thema_id);
      return ok;
    }
  }
}

// _shared/zugriff.ts
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

// pruefung/index.ts
var MAX_ANFRAGE_BYTES = 64e3;
var ERLAUBT = erlaubteUrspruenge(Deno.env.get("ERLAUBTE_URSPRUENGE"));
var db = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: {
    persistSession: false
  }
});
var pruefe = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};
var speicher = {
  async imLimit(schluessel, max, fenster) {
    return pruefe(await db.rpc("rate_limit_pruefen", {
      p_sitzung: schluessel,
      p_max: max,
      p_fenster: fenster
    })) === true;
  },
  async einladung(hash) {
    return pruefe(await db.from("pruef_einladungen").select("id, name, themen, gesperrt, einwilligung_am, name_oeffentlich").eq("token_hash", hash).maybeSingle());
  },
  async bewertungen(id) {
    return pruefe(await db.from("pruef_bewertungen").select("massnahme_id, thema_id, wirksamkeit, umsetzbarkeit, notiz, empfehlung_gesehen, nach_empfehlung_geaendert, abgesendet").eq("einladung_id", id));
  },
  async einwilligen(id, nameOeffentlich) {
    pruefe(await db.from("pruef_einladungen").update({
      einwilligung_am: (/* @__PURE__ */ new Date()).toISOString(),
      name_oeffentlich: nameOeffentlich
    }).eq("id", id));
  },
  async speichern(id, zeilen) {
    const jetzt = (/* @__PURE__ */ new Date()).toISOString();
    pruefe(await db.from("pruef_bewertungen").upsert(zeilen.map((z) => ({
      ...z,
      einladung_id: id,
      aktualisiert: jetzt
    })), {
      onConflict: "einladung_id,massnahme_id"
    }));
  },
  async absenden(id, themaId) {
    pruefe(await db.from("pruef_bewertungen").update({
      abgesendet: true,
      aktualisiert: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("einladung_id", id).eq("thema_id", themaId));
  },
  async widerrufen(id) {
    pruefe(await db.from("pruef_bewertungen").delete().eq("einladung_id", id));
    pruefe(await db.from("pruef_einladungen").update({
      einwilligung_am: null,
      name_oeffentlich: false
    }).eq("id", id));
  }
};
var einheiten = null;
async function pruefEinheiten() {
  if (einheiten && Date.now() - einheiten.stand < 6e4) return einheiten.jeThema;
  const zeilen = pruefe(await db.from("pruef_einheiten").select("id, thema_id").limit(1e5));
  const jeThema = {};
  for (const z of zeilen) (jeThema[z.thema_id] ??= []).push(z.id);
  einheiten = {
    stand: Date.now(),
    jeThema
  };
  return jeThema;
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
    const anfrage = pruefePruefAnfrage(await lesJson(req));
    const { status, body } = await bearbeitePruefung(anfrage, speicher, await pruefEinheiten());
    return json(body, status);
  } catch (e) {
    if (e instanceof EingabeFehler) return json({
      fehler: e.message
    }, 400);
    console.error("pruefung:", e instanceof Error ? e.message : "unbekannter Fehler");
    return json({
      fehler: "Speichern hat gerade nicht geklappt. Bitte gleich noch einmal versuchen."
    }, 502);
  }
});
