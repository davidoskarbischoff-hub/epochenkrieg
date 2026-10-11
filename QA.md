# Qualität – Maßstäbe und offene Mängel

Diese Datei führt die Qualitäts-Leitung (Agent `epochen-qa`, Definition in `.claude/agents/epochen-qa.md`). Jede größere Änderung wird von ihr im laufenden Spiel geprüft, bevor sie committet wird.

## Maßstäbe
- **Einheitliches Bild:** gleicher Grafikstil, keine weißen oder knallig-kindlichen Modelle neben realistischen, Gebäude und Einheiten passen zum Zeitalter.
- **Proportionen:** alle Menschen so groß wie der Arbeiter; Pferde, Tiere, Fahrzeuge, Schiffe, Bäume im echten Verhältnis.
- **Kontinuität:** jede Truppenlinie behält ihren Grundkörper, die Ausrüstung entwickelt sich je Zeitalter (Kleidung → Rüstung → Uniform, Waffe passend).
- **Ausrichtung und Animation:** alles schaut in Laufrichtung, jede Tätigkeit hat eine passende Bewegung, Animationen laufen im Spieltempo.
- **Ton:** jedes Ereignis hat einen passenden, hörbaren Klang.
- **Spielgefühl:** klare Oberfläche, nichts springt, Wege frei, niemand bleibt stecken, Berater baut sinnvoll.
- **Balance:** Rohstoffe gehen im Langzeitspiel nicht aus, Aufstiegstempo und Armeen fair, Gegenstücke wirken.
- **Technik:** keine Konsolenfehler, Bildrate nicht schlechter, Mehrspieler bleibt synchron.

## Stand Abschlussprüfung Release 2 (2026-10-11)
Alle von David gemeldeten Mängel der Runden 1–3 sind umgesetzt (Details: ROADMAP.md, Abschnitte „Release 2 – Runde 1/2/3“).
Geprüft: Spiel startet ohne Konsolenfehler, alle Modelle und Klänge laden, Desktop-App-Selbsttest ok, Mehrspieler-Test (Fake-Peer) synchron, Minen/Forschung/Felder/Späher im Selbsttest.
Bekannte Grenzen (Release 3): Fischernetze, Galeere, Bohrturm/Raffinerie/Beton-Hafen als echte Modelle, Kanone/Haubitze, Vorschaubilder in Knöpfen, Truppenlinien farblich unterscheidbar.

## Offene Mängel (von David gemeldet, 2026-10-11)
- [x] Rehe/Bär laufen schräg, Bär ohne Laufbewegung (in Arbeit)
- [x] Holzfällen klingt wie Hämmern, Beeren pflücken und Bauen ohne hörbaren Klang (in Arbeit)
- [x] Menschen unterschiedlich groß (Speerträger, Schleuderer, Bogenschützen größer als Arbeiter); Speer zu lang und falsch gehalten
- [x] Bogen-/Armbrustschützen tragen ein Schwert; Ingenieur im Mittelalter sieht modern aus; Musketiere/Armbrustschützen in der Industriezeit unpassend
- [x] Truppen wirken zusammengewürfelt – Kontinuität über die Zeitalter fehlt
- [x] Animationen laufen nicht im Spieltempo; Feldarbeit sieht aus wie Schieben; Renaissance-Arbeiter halten Schaufel komisch
- [x] Pferde primitiv und zu groß; Bäume zu klein
- [x] Eisen/Gold zu kindlich, zu klein, Stein/Eisen/Gold sehen zu unterschiedlich aus
- [x] Ölfelder hässliche schwarze Pfützen, zu häufig; Bohrturm nicht erkennbar; Raffinerie komisch
- [x] Kaserne hässlich; Kaserne in der Industriezeit modernes Hochhaus; Hauptlager Renaissance zu klein/einfach
- [x] Kenney-Schiffe/Belagerung brauchen Farbtabelle (variation-a..g vorhanden)
- [x] Mine: neues Prinzip (Option A: auf dem Vorkommen, Karren/Lore zum Lager, Schienen-Ausbau), größer
- [x] Holz geht im Langzeitspiel aus, KI kommt nicht weiter → dichte, große Wälder mit Durchgängen (in Arbeit)
- [x] Mauer per Ziehen bauen (in Arbeit)
- [x] Obere Leiste springt zwischen 1 und 2 Zeilen (in Arbeit)
- [x] Berater/Arbeiter bauen Türme und Gebäude zu nah (Berater behoben, Arbeiter-Türme offen)
- [x] Gebäude abreißen mit Rückerstattung (neu)

## Davids Prüfliste vor v0.2.0 (gemeldet 2026-10-11, noch nicht umgesetzt – auf Go warten)
- [ ] Mine auf Eisen: Arbeiter können nicht arbeiten, Meldung „kein abbaubares Vorkommen“, obwohl das Eisen nicht leer ist
- [ ] Bogenschützen (Bronzezeit) werfen statt zu schießen → Animation/Waffe passend machen oder Einheit umbenennen (z. B. „Wurfspeerwerfer“)
- [ ] Fische schwer anklickbar → Fischgründe deutlicher und leichter anklickbar
- [ ] Lore mit Schieber bleibt im (seichten) Wasser stecken → Loren meiden Wasser ganz und fahren außen herum
- [ ] Ausbau im Hauptlager (Handelshof/Kommandozentrale) ohne Bild → eleganter darstellen
- [ ] Upgrade-/Technologie-Liste im Hauptlager wirkt wie eine Tabelle → kompakter und schöner (Kacheln statt ganzer Zeilen)
