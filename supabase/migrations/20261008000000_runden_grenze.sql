-- Politik-Duell – Grenze (docs/plan-haltungen.md, Schritt 3; docs/methode.md → „Grenze“)
--
-- Äußerungen, die einer Gruppe die Menschenwürde oder gleiche Rechte absprechen, zu Gewalt aufrufen oder
-- Personen beleidigen, ordnet die KI als `grenze` ein. Das Spiel geht darauf nicht ein. Gespeichert wird nur,
-- dass es eine solche Runde gab – ohne Zusammenfassung, Stichwort, Thema oder Filtergrund. Die Prüfung unten
-- sichert das auch gegen Fehler in der Edge Function oder eine spätere Bearbeitung in der Admin-Ansicht ab.

alter table public.runden drop constraint runden_status_check;
alter table public.runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert', 'forderung', 'grenze'));

alter table public.runden add constraint runden_grenze_ohne_inhalt check (
  status <> 'grenze' or (
    problem_text = '' and stichwort is null and filter_grund is null
    and thema_id is null and instrument_id is null
    and punkte_a is null and punkte_b is null
    and not freigegeben
  )
);
