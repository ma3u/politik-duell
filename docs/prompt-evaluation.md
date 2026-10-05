# Prompt-Evaluation: Äußerungen und erwartete Einordnung

Beispieläußerungen für die manuelle Prüfung der Gesprächs-KI (Edge Function `analyse`, Plan: `docs/plan-haltungen.md` → „Tests“). Je Äußerung steht, wie sie eingeordnet wurde und was die KI antworten soll. Die Äußerungen sollen aus allen politischen Lagern stammen; einseitige Abschnitte sind als solche vermerkt.

Je Liste ein Abschnitt (`## <Datum> <Art der Quelle>`) mit der Tabelle aus `/liste-einordnen` (`npm run liste:auswahl -- <datei> --evaluation`). Die Äußerungen stehen hier **nur umschrieben**: der Kern in sachlichen Worten, ohne Parolen, Beleidigungen, Symbole, antisemitische Behauptungen oder Namen im Wortlaut. Die Originallisten bleiben außerhalb des Repositorys (`.cache/listen/`).

## 2026-10-05 Auszählung aus einer Befragung (überwiegend rechtes Lager)

Die Liste kam fast ganz aus einem politischen Lager; Äußerungen aus den anderen Lagern fehlen und müssen aus weiteren Listen kommen. Bestätigt wurden nur Zeilen der Arten Haltung, Forderung und Thema. „haltung_id“ gilt nur für Haltungen, die alle sieben Parteien erfasst haben (Stand 5. 10. 2026); zurückgestellte Haltungen (6, 17, 22, 23) und nicht angelegte Fragen liefern `wert` ohne `haltung_id`.

| Äußerung (umschrieben) | Art | Erwartet |
| --- | --- | --- |
| Wunsch nach schärferer Abschiebepraxis, Grenzkontrollen und strengerem Asylrecht | haltung | wert, haltung_id 2 |
| Der Ausbau der Windkraft soll aufhören | haltung | wert, haltung_id 4 |
| Deutschland soll wieder Strom aus Kernkraft erzeugen | haltung | wert, haltung_id 5 |
| Gendersprache in Schule und Verwaltung soll nicht verwendet werden | haltung | wert, ohne haltung_id (6 zurückgestellt) |
| Statt Waffenlieferungen an die Ukraine soll Deutschland auf Diplomatie setzen | haltung | wert, haltung_id 7 |
| Zweifel daran, dass alle Kinder mit Förderbedarf in Regelschulen gut aufgehoben sind | haltung | wert, haltung_id 8 |
| Die Düngegrenzen für Betriebe sollen höher liegen | haltung | wert, haltung_id 9 |
| Vermögen- und Erbschaftsteuer sollen entfallen | haltung | wert, haltung_id 10 |
| Der Wehrdienst soll wieder Pflicht sein | haltung | wert, haltung_id 11 |
| Ein gesetzlicher Mindestlohn soll nicht gelten | haltung | wert, haltung_id 12 |
| Die Schuldenbremse soll bleiben | haltung | wert, haltung_id 13 |
| Das Rentenalter soll nicht steigen | haltung | wert, haltung_id 14 |
| Eine Zuckersteuer lehne ich ab | haltung | wert, haltung_id 15 |
| Deutschland soll die NATO und die EU verlassen | haltung | wert, haltung_id 16 |
| Russisches Pipelinegas soll wieder fließen | haltung | wert, haltung_id 18 |
| Der Euro soll bleiben | haltung | wert, haltung_id 19 |
| Solarparks auf Äckern lehne ich ab | haltung | wert, haltung_id 20 |
| Kirchen sollen kein Geld mehr vom Staat bekommen | haltung | wert, ohne haltung_id (17 zurückgestellt) |
| Hausunterricht soll erlaubt sein | haltung | wert, ohne haltung_id (23 zurückgestellt) |
| Kirchenasyl lehne ich ab | haltung | wert, ohne haltung_id (22 zurückgestellt) |
| Gut integrierte Menschen mit Duldung sollen bleiben dürfen | haltung | wert, haltung_id 21 |
| Deutschland soll sich militärisch aus Konflikten heraushalten wie die Schweiz | haltung | wert, ohne haltung_id (nicht angelegt) |
| Die Kulturförderung soll sich an deutscher Heimatkultur ausrichten | haltung | wert, ohne haltung_id (nicht angelegt) |
| Wer in Deutschland geboren wird, soll nicht automatisch Deutscher werden | haltung | wert, ohne haltung_id (nicht angelegt) |
| Steuern und Preise sollen sinken | forderung | forderung, instrument_id aus Thema 11 (Einkommensteuer senken, Sozialabgaben begrenzen) |
| Die Polizei soll mehr Personal und mehr Befugnisse bekommen | forderung | forderung, instrument_id 7482 oder 7635 |
| Weniger Bürokratie für Betriebe | forderung | forderung, instrument_id 6091 oder 6097 |
| Sorge, dass KI Arbeitsplätze ersetzt | thema | problem (Thema 5) oder Nachfrage |
| Schulen brauchen bessere Gebäude, Schüler weniger Leistungsdruck | thema | problem (Thema 4) oder Nachfrage |
| Wegen der Steuerlast denke ich ans Auswandern | thema | problem (Thema 11, Ursache 1104) oder Nachfrage |
| Auf dem Land fehlt es an Infrastruktur | thema | Nachfrage (mehrere Themen möglich: 1, 8, 13) |
