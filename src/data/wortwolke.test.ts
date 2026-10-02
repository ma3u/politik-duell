import { describe, expect, it } from "vitest";
import { MOCK_DATEN, type Daten } from "./quelle";
import { themenWoerter } from "./wortwolke";

const thema = (id: number, name: string) => ({ id, name, beschreibung: "" });
const ursache = (id: number, thema_id: number) => ({
  id,
  thema_id,
  beschreibung: "",
  quelle_url: "",
  ebene: "bund" as const,
});

const eintrag = (
  partei_id: number,
  thema_id: number,
  land: string | null = null,
) =>
  ({
    partei_id,
    thema_id,
    land,
    art: "keine",
    stand: "2026-01-01",
  }) as unknown as Daten["abdeckung"][number];

describe("themenWoerter", () => {
  it("zeigt nur erfasste Themen mit Ursachen, mit mehr Ursachen zuerst", () => {
    const d: Daten = {
      ...MOCK_DATEN,
      themen: [
        thema(1, "Miete"),
        thema(2, "Rente"),
        thema(3, "Schule"),
        thema(4, "Pflege"),
      ],
      ursachen: [
        ursache(11, 1),
        ursache(21, 2),
        ursache(22, 2),
        ursache(41, 4),
      ],
      abdeckung: [
        eintrag(1, 1),
        eintrag(2, 2),
        eintrag(1, 3),
        eintrag(1, 2, "ST"),
      ],
    };
    expect(themenWoerter(d)).toEqual([
      { text: "Rente", anzahl: 2 },
      { text: "Miete", anzahl: 1 },
    ]);
  });

  it("lässt Themen ohne Eintrag und Themen nur mit Landeseintrag weg", () => {
    const d: Daten = {
      ...MOCK_DATEN,
      themen: [thema(1, "Miete"), thema(2, "Rente")],
      ursachen: [ursache(11, 1), ursache(21, 2)],
      abdeckung: [eintrag(1, 2, "ST")],
    };
    expect(themenWoerter(d)).toEqual([]);
  });

  it("zeigt bei den Beispieldaten genau die erfassten Themen", () => {
    expect(
      themenWoerter(MOCK_DATEN)
        .map((w) => w.text)
        .sort(),
    ).toEqual(
      MOCK_DATEN.themen
        .filter((t) => MOCK_DATEN.abdeckung.some((a) => a.thema_id === t.id))
        .map((t) => t.name)
        .sort(),
    );
  });
});
