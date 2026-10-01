-- Politik-Duell – Abdeckung je Ursache
--
-- Ein Abdeckungseintrag sagt, dass ein Programm zu einem Thema ausgewertet ist. Kommt später
-- eine Ursache hinzu, ist das Programm danach aber nicht unbedingt durchsucht. `durchsucht_fuer`
-- nennt die Ursachen, für die es durchsucht wurde; fehlt eine Ursache darin, wird die Runde für
-- die Partei nicht gewertet („noch nicht erfasst“) statt mit 0 Punkten. null = ältere Einträge,
-- für alle Ursachen des Themas durchsucht. Befüllt aus daten/ (seed.sql).

alter table public.abdeckung add column durchsucht_fuer integer[];
