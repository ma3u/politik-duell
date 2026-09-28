-- AUTOMATISCH ERZEUGT aus daten/ (npm run seed) – nicht von Hand bearbeiten.
-- Nur vollständig geprüfte Einträge je Thema und Partei; alles andere gilt als „noch nicht erfasst“.

-- Mehrfach ausführbar: Stammdaten per Upsert, Maßnahmen und Abdeckung werden neu geschrieben.
-- Gespielte Runden bleiben erhalten.
delete from public.massnahmen;
delete from public.abdeckung;

insert into public.parteien (id, name, kurzname, farbe, programm_url, programm_stand) values
  (11, 'CDU/CSU', 'Union', '#8a96a3', 'https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf', '2024-12-17'),
  (12, 'SPD', 'SPD', '#f0605d', 'https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf', '2025-01-11'),
  (13, 'Bündnis 90/Die Grünen', 'Grüne', '#6fbf4a', 'https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf', '2025-01-26'),
  (14, 'FDP', 'FDP', '#ffe74d', 'https://www.fdp.de/sites/default/files/2024-12/fdp-wahlprogramm_2025.pdf', '2025-02-09'),
  (15, 'AfD', 'AfD', '#4fb8e8', 'https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf', '2025-01-12'),
  (16, 'Die Linke', 'Linke', '#e0659b', 'https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf', '2025-01-18'),
  (17, 'BSW', 'BSW', '#b784c9', 'https://bsw-vg.de/wp-content/themes/bsw/assets/downloads/BSW%20Wahlprogramm%202025.pdf', '2025-01-12')
on conflict (id) do update set name = excluded.name, kurzname = excluded.kurzname, farbe = excluded.farbe,
  programm_url = excluded.programm_url, programm_stand = excluded.programm_stand;

-- Parteien, die nicht mehr im Katalog stehen (z. B. fiktive nach dem Umstieg), entfernen.
-- Gespielte Runden bleiben erhalten, ihr Parteiverweis wird leer.
delete from public.parteien where id not in (11, 12, 13, 14, 15, 16, 17);

insert into public.themen (id, name, beschreibung) values
  (1, 'Arzttermine', 'Lange Wartezeiten und schwer erreichbare Praxen.'),
  (2, 'Miete', 'Hohe Mieten und schwierige Wohnungssuche.'),
  (3, 'Energiepreise', 'Hohe Kosten für Strom und Heizung.'),
  (4, 'Schule', 'Unterrichtsausfall, fehlende Lehrkräfte und marode Schulgebäude.'),
  (5, 'Arbeitsplätze', 'Unsichere Jobs, Stellenabbau und schwache Wirtschaft.'),
  (6, 'Zuwanderung und Integration', 'Probleme bei Aufnahme, Integration und Rückführung von Zugewanderten.'),
  (7, 'Rente', 'Niedrige Renten und Sorge um die Altersvorsorge.'),
  (8, 'Bus und Bahn', 'Seltene Verbindungen, Ausfälle und Verspätungen.'),
  (9, 'Sicherheit', 'Sich im Alltag unsicher fühlen oder Opfer von Kriminalität werden.'),
  (10, 'Pflege', 'Pflegeplatz oder Pflegedienst finden, hohe Kosten, überlastete Angehörige.')
on conflict (id) do update set name = excluded.name, beschreibung = excluded.beschreibung;

insert into public.ursachen (id, thema_id, beschreibung, quelle_url) values
  (101, 1, 'Zu wenige Hausarztpraxen, besonders auf dem Land; viele Ärztinnen und Ärzte gehen bald in den Ruhestand', 'https://idw-online.de/de/news769524'),
  (102, 1, 'Termine und Wege durch das Gesundheitssystem werden kaum gesteuert; knappes Personal wird nicht gezielt eingesetzt', 'https://www.svr-gesundheit.de/publikationen/gutachten-2024/'),
  (103, 1, 'Unterschiedliche Vergütung: Facharztpraxen vergeben Termine bevorzugt an Privatversicherte', 'https://idw-online.de/de/news750098'),
  (201, 2, 'Es werden weniger Wohnungen gebaut als gebraucht (Bedarf laut Prognose rund 320.000 pro Jahr)', 'https://www.bbsr.bund.de/BBSR/DE/presse/presseinformationen/2025/wohnungsbedarfsprognose.html'),
  (202, 2, 'Mieten bei Neuvermietung liegen rund 43 % über Bestandsmieten, in großen Städten besonders hoch', 'https://www.bbsr.bund.de/BBSR/DE/startseite/topmeldungen/entwicklung-wohnungsmieten-2025.html'),
  (203, 2, 'Stark gestiegene Baukosten: Wohngebäude wurden 2010 bis 2025 um 89 % teurer, mehr als doppelt so stark wie die Inflation', 'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Baupreise-Immobilienpreisindex/_inhalt.html'),
  (204, 2, 'Mieten in laufenden Verträgen steigen weiter (Nettokaltmieten 2025 im Schnitt +2,1 %)', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/01/PD26_019_611.html'),
  (301, 3, 'Hohe Netzentgelte für den Betrieb und Ausbau der Stromnetze', 'https://www.bundesnetzagentur.de/DE/Vportal/Energie/PreiseAbschlaege/Tarife-table.html'),
  (302, 3, 'Steuern, Abgaben und Umlagen machen einen großen Teil des Strompreises aus', 'https://www.bundesnetzagentur.de/DE/Vportal/Energie/PreiseAbschlaege/Tarife-table.html'),
  (303, 3, 'Rund 70 % der Energie wird importiert, vor allem Öl, Gas und Steinkohle', 'https://www.umweltbundesamt.de/daten/umweltzustand-trends/energie/primaerenergiegewinnung-importe'),
  (401, 4, 'Zu wenige Lehrkräfte: Kurzfristig liegt das Angebot deutlich unter dem Einstellungsbedarf', 'https://www.kmk.org/downloads-dokumente/statistik/schulstatistik/lehrkraefteeinstellungsbedarf-und-angebot.html'),
  (402, 4, 'Großer Sanierungsstau bei Schulgebäuden (rund 68 Mrd. Euro, größter Posten der Kommunen)', 'https://www.bundestag.de/resource/blob/1157306/KfW-Kommunalpanel-2025.pdf'),
  (403, 4, 'Wachsende Lernrückstände: Ein Drittel der Neuntklässler verfehlt den Mindeststandard in Mathematik', 'https://www.iqb.hu-berlin.de/de/schule/sekundarstufe-i/bildungstrend/2024/'),
  (404, 4, 'Viele Kinder haben schon vor der Einschulung Sprachförderbedarf; die Länder erfassen und fördern das sehr unterschiedlich', 'https://www.bildungsbericht.de/de/bildungsberichte-seit-2006/bildungsbericht-2024/pdf-dateien-2024/bildungsbericht-2024-kapitel-c.pdf'),
  (405, 4, 'Der Schulerfolg hängt stark von der sozialen Herkunft ab; sozial benachteiligte Jugendliche fallen seit 2018 weiter zurück', 'https://www.iqb.hu-berlin.de/de/schule/sekundarstufe-i/bildungstrend/2024/'),
  (501, 5, 'Die Industrie verliert an Wettbewerbsfähigkeit: überdurchschnittlich gestiegene Energiepreise und Lohnstückkosten, dazu hohe wirtschaftspolitische Unsicherheit und geopolitische Veränderungen', 'https://www.sachverstaendigenrat-wirtschaft.de/fileadmin/dateiablage/gutachten/jg202526/JG202526_Kurzfassung.pdf'),
  (502, 5, 'Strukturwandel: Die Industrie baut Stellen ab, neue Jobs entstehen vor allem in anderen Branchen', 'https://iab.de/presseinfo/iab-prognose-fuer-2026-2027-erwerbstaetigkeit-schrumpft-trotz-besserer-konjunktur/'),
  (503, 5, 'Löhne in Ostdeutschland liegen weiterhin deutlich unter denen im Westen', 'https://www.destatis.de/DE/Themen/Querschnitt/35-Jahre-Deutsche-Einheit/Vermoegen-Einkommen/Textbausteine/01_verdienstunterschiede.html'),
  (504, 5, 'Zu wenig Investitionen: Für Verkehr, Bildung, Kommunen und Klimaschutz fehlen über zehn Jahre rund 600 Mrd. Euro zusätzliche öffentliche Investitionen', 'https://www.iwkoeln.de/fileadmin/user_upload/Studien/policy_papers/PDF/2024/IW-Policy-Paper_2024-Investitionsbedarfe.pdf'),
  (505, 5, 'Hohe Bürokratiekosten: Unternehmen tragen jährlich rund 64 Mrd. Euro Kosten für Berichts- und Informationspflichten', 'https://www.normenkontrollrat.bund.de/Webs/NKR/SharedDocs/Downloads/DE/Jahresberichte/2025-jahresbericht.pdf?__blob=publicationFile&v=5'),
  (506, 5, 'Mehr zu arbeiten lohnt sich für Menschen im Bürgergeld oft kaum, weil der Hinzuverdienst größtenteils angerechnet wird', 'https://www.bmas.de/DE/Service/Publikationen/Forschungsberichte/fb-629-erwerbstaetigenfreibetraege.html'),
  (507, 5, 'Nur knapp die Hälfte der Beschäftigten (49 %) arbeitet in einem tarifgebundenen Betrieb', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/03/PD25_109_623.html'),
  (601, 6, 'Zahl der Neuankommenden und Kapazitäten vor Ort passen vielerorts nicht zusammen: Unterbringung bleibt für die meisten Kommunen herausfordernd, Ausländerbehörden sind besonders stark belastet', 'https://mediendienst-integration.de/fileadmin/Dateien/EXPERTISE_FLUECHTLINGSAUFNAHME_IN_DEN_KOMMUNEN_MEDIENDIENST_INTEGRATION_NOV_2025_FINAL.pdf'),
  (602, 6, 'Asyl- und Gerichtsverfahren dauern lange (im Schnitt rund anderthalb Jahre bis zur rechtskräftigen Entscheidung)', 'https://www.bundestag.de/presse/hib/kurzmeldungen-1145824'),
  (603, 6, 'Sprachkurse, Anerkennung von Abschlüssen und Zugang zum Arbeitsmarkt dauern lange', 'https://iab-forum.de/10-jahre-fluchtmigration-2015-was-integration-foerdert-und-was-sie-bremst/'),
  (604, 6, 'Viele Ausreisepflichtige werden nicht zurückgeführt, etwa wegen fehlender Papiere', 'https://mediendienst-integration.de/fluechtlinge/abschiebungen/warum-werden-ausreisepflichtige-personen-nicht-abgeschoben/'),
  (605, 6, 'Die EU-Zuständigkeitsregeln (Dublin) greifen kaum: 2025 wurde nur rund jede siebte von Deutschland beantragte Überstellung vollzogen', 'https://www.bundestag.de/presse/hib/kurzmeldungen-1161094'),
  (606, 6, 'Viele Menschen leben jahrelang nur geduldet: Rund 41 % der gut 180.000 Geduldeten sind seit mehr als fünf Jahren in Deutschland', 'https://mediendienst-integration.de/fluechtlinge/duldung/wie-viele-personen-haben-eine-duldung/'),
  (701, 7, 'Immer weniger Beitragszahlende kommen auf eine Rentnerin oder einen Rentner', 'https://www.demografie-portal.de/DE/Fakten/altersrentner-beitragszahler.html'),
  (702, 7, 'Niedrige Löhne und Lücken im Erwerbsleben (z. B. Arbeitslosigkeit) führen zu niedrigen Rentenansprüchen', 'https://www.diw.de/sixcms/detail.php?id=diw_01.c.402060.de'),
  (703, 7, 'Viele Beschäftigte haben keine betriebliche Altersvorsorge, vor allem in kleinen Betrieben', 'https://www.bpb.de/themen/soziale-lage/rentenpolitik/291012/empirische-befunde-zur-betrieblichen-altersversorgung/'),
  (801, 8, 'Rund 21 Millionen Menschen fehlt ein gutes Grundangebot an Bus und Bahn, besonders auf dem Land', 'https://www.agora-verkehrswende.de/aktuelles/oev-atlas-zeigt-grosse-unterschiede-beim-bus-und-bahnangebot'),
  (802, 8, 'Marodes, überaltertes Schienennetz mit wachsendem Nachholbedarf', 'https://www.bundesrechnungshof.de/fileadmin/import/SharedDocs/Downloads/DE/Berichte/2025/evaluation-luf-3_volltext-evaluation-luf-3_volltext.pdf'),
  (803, 8, 'Zu wenige Bus- und Straßenbahnfahrerinnen und -fahrer; viele Stellen bleiben unbesetzt', 'https://www.kofa.de/daten-und-fakten/studien/fachkraeftereport-juni-2025/'),
  (901, 9, 'Unsicherheit ballt sich an bestimmten Orten: nachts fühlen sich viele an Bahnhöfen und in Parks unsicher', 'https://www.bka.de/DE/Presse/Listenseite_Pressemitteilungen/2026/Presse2026/260420_PM_PKS_SKiD.html'),
  (902, 9, 'Überlastete Strafjustiz: Rund eine Million offene Ermittlungsverfahren, Verfahren dauern lange', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/10/PD25_360_2421.html'),
  (903, 9, 'Junge Menschen werden häufiger Opfer von Gewalt; die Zahl tatverdächtiger Kinder steigt', 'https://www.bka.de/DE/Presse/Listenseite_Pressemitteilungen/2026/Presse2026/260420_PM_PKS_SKiD.html'),
  (1001, 10, 'Zu wenige Pflegekräfte; bis 2049 fehlen je nach Szenario 280.000 bis 690.000', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2024/01/PD24_033_23_12.html'),
  (1002, 10, 'Steigende Eigenanteile im Pflegeheim (im ersten Jahr im Schnitt über 3.300 Euro im Monat)', 'https://www.vdek.com/presse/pressemitteilungen/2026/stationaere-pflege-eigenanteile-juli-2026.html'),
  (1003, 10, 'Durch die Alterung steigt die Zahl der Pflegebedürftigen deutlich', 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2023/03/PD23_124_12.html'),
  (1004, 10, 'Pflegende Angehörige tragen die Hauptlast; Entlastungsangebote werden wenig genutzt', 'https://www.zqp.de/thema/entlastung-pflegende/')
on conflict (id) do update set thema_id = excluded.thema_id, beschreibung = excluded.beschreibung,
  quelle_url = excluded.quelle_url;
