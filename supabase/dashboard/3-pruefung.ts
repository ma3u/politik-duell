// @ts-nocheck
// AUTOMATISCH ERZEUGT aus supabase/functions/pruefung (npm run dashboard) – nicht von Hand bearbeiten.
// Im Supabase-Dashboard: Edge Functions → Deploy a new function → Via Editor,
// Name „pruefung“, diesen Inhalt komplett einfügen → Deploy.
// pruefung/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

// _shared/fehler.ts
var EingabeFehler = class extends Error {
};

// _shared/pruef-massnahmen.ts
var MASSNAHMEN_JE_THEMA = {
  2: [
    2001,
    2002,
    2003,
    2004,
    2005,
    2006,
    2011,
    2012,
    2013,
    2014,
    2015,
    2021,
    2022,
    2023,
    2024,
    2031,
    2032,
    2033,
    2034,
    2041,
    2042,
    2043,
    2051,
    2052,
    2053,
    2054,
    2055,
    2056,
    2061,
    2062,
    2063,
    2064
  ],
  4: [
    4001,
    4002,
    4003,
    4004,
    4011,
    4012,
    4013,
    4014,
    4015,
    4021,
    4022,
    4023,
    4024,
    4025,
    4031,
    4032,
    4033,
    4034,
    4035,
    4036,
    4041,
    4042,
    4043,
    4044,
    4051,
    4052,
    4053,
    4054,
    4055,
    4056,
    4057,
    4061,
    4062,
    4063,
    4064,
    4065,
    4066,
    4067,
    4068,
    4101,
    4102,
    4103,
    4104,
    4105,
    4106,
    4107,
    4111,
    4112,
    4113,
    4114,
    4115,
    4116,
    4117,
    4118,
    4119,
    4121,
    4122,
    4123,
    4124,
    4125,
    4126,
    4127,
    4128,
    4129,
    4130,
    4131,
    4132,
    4133,
    4134,
    4135,
    4136,
    4137,
    4141,
    4142,
    4143,
    4144,
    4145,
    4146,
    4161,
    4162,
    4163,
    4164,
    4165,
    4166,
    4167,
    4168,
    4169,
    4201,
    4202,
    4203,
    4204,
    4205,
    4206,
    4207,
    4208,
    4209,
    4210,
    4211,
    4212,
    4213,
    4214,
    4215,
    4216,
    4217,
    4221,
    4222,
    4223,
    4224,
    4225,
    4231,
    4232,
    4233,
    4234,
    4235,
    4236,
    4241,
    4242,
    4243,
    4244,
    4245,
    4246,
    4247,
    4248,
    4249,
    4251,
    4252,
    4253,
    4254,
    4271,
    4272,
    4273,
    4274,
    4275,
    4276,
    4277,
    4301,
    4302,
    4303,
    4304,
    4305,
    4306,
    4311,
    4312,
    4313,
    4314,
    4315,
    4316,
    4317,
    4318,
    4319,
    4321,
    4322,
    4323,
    4324,
    4325,
    4326,
    4327,
    4328,
    4331,
    4332,
    4333,
    4334,
    4341,
    4342,
    4343,
    4344,
    4345,
    4346,
    4347,
    4361,
    4362,
    4363,
    4364,
    4365,
    4366
  ],
  5: [
    5001,
    5002,
    5003,
    5004,
    5005,
    5011,
    5012,
    5013,
    5014,
    5015,
    5016,
    5017,
    5021,
    5022,
    5023,
    5024,
    5025,
    5026,
    5027,
    5028,
    5031,
    5032,
    5033,
    5034,
    5035,
    5036,
    5037,
    5041,
    5042,
    5043,
    5044,
    5045,
    5046,
    5047,
    5051,
    5052,
    5053,
    5054,
    5055,
    5056,
    5061,
    5062,
    5063,
    5064,
    5065,
    5066,
    5067
  ],
  6: [
    6001,
    6002,
    6003,
    6004,
    6005,
    6006,
    6007,
    6008,
    6009,
    6010,
    6011,
    6012,
    6013,
    6014,
    6015,
    6016,
    6021,
    6022,
    6023,
    6024,
    6025,
    6026,
    6027,
    6031,
    6032,
    6033,
    6034,
    6035,
    6036,
    6037,
    6038,
    6039,
    6040,
    6041,
    6042,
    6043,
    6044,
    6045,
    6046,
    6047,
    6048,
    6049,
    6050,
    6051,
    6052,
    6053,
    6054,
    6055,
    6061,
    6062,
    6063,
    6064,
    6065,
    6066
  ]
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
    const { status, body } = await bearbeitePruefung(anfrage, speicher, MASSNAHMEN_JE_THEMA);
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
