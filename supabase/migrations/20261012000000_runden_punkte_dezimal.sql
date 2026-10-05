-- Politik-Duell – Rundenpunkte mit einer Nachkommastelle (docs/methode.md → „Mehrere Maßnahmen je Ursache“)
--
-- Je Ursache zählen mehrere Lösungswege einer Partei mit abnehmendem Gewicht (voll, ½, ¼ …), höchstens 9.
-- Die Summe kann daher halbe oder Viertelpunkte enthalten; sie wird auf eine Nachkommastelle gerundet.

alter table public.runden
  alter column punkte_a type numeric(5, 1),
  alter column punkte_b type numeric(5, 1);
