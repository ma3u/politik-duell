-- Politik-Duell – Forderungen ohne Umdeutung (docs/plan-haltungen.md, Schritt 1)
--
-- Bleibt es nach zwei Nachfragen bei einer Forderung ohne Alltagsproblem, wird sie nicht mehr
-- zum Problem umgedeutet (und landet nicht mehr in der Warteschlange für neue Themen), sondern
-- als eigene Runde ohne Wertung gespeichert – mit dem erkannten Thema, falls vorhanden.

alter table public.runden drop constraint runden_status_check;
alter table public.runden add constraint runden_status_check
  check (status in ('gewertet', 'ungeprueft', 'unvollstaendig', 'wert', 'forderung'));
