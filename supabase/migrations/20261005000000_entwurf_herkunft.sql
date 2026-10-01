-- Politik-Duell – Herkunft der Entwurfswerte
--
-- KI-Entwürfe sind seit 1. 10. 2026 ohne Parteinamen bewertet (`blind`). Werte, die jemand mit Kenntnis
-- der Partei vergeben oder geändert hat, und ältere Entwürfe (null) zeigt das Spiel in der Testphase
-- als „vorläufige Bewertung, nicht blind“ statt als „KI-Entwurf“. Bei geprüften Maßnahmen bleibt die
-- Spalte leer: Ihre Werte stammen aus der Bewertung durch die Prüfenden. Befüllt aus daten/ (seed.sql).

alter table public.massnahmen add column entwurf_herkunft text check (entwurf_herkunft in ('blind', 'nicht_blind'));
