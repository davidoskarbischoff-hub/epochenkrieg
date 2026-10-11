# Dauer-Optimierung (Auftrag von David, 2026-10-12)

Auftrag: Das Spiel laufend verbessern, bis das Nutzungslimit erreicht ist, danach automatisch weitermachen.
Schwerpunkte: Grafik, Modelle, Feintuning. Fehlende Modelle mit passenden vorhandenen Modellen ergänzen (umwandeln, umfärben).
Bei jeder Änderung prüfen:
- Laufrichtung, Farben und Größenverhältnisse
- Balance
- Stimmigkeit über die Zeitalter, also passende Vorgänger und Nachfolger

Ablauf je Runde:
1. Diese Liste lesen und den nächsten offenen Punkt nehmen.
2. Umsetzen, im Spiel prüfen (Screenshots, Konsole) und die Qualitäts-Leitung (`epochen-qa`) prüfen lassen.
3. Committen, auf `claude/youthful-brahmagupta-8dmxq5` pushen, hier abhaken und neue Funde ergänzen.

Hilfsmittel:
- Test-Skripte: `qa/` im Sitzungs-Notizordner, siehe README dort.
- FBX-Umwandler: `tools/fbx2glb`.
- Kontaktbögen: `sheet2.js` (Einheiten/Gebäude je Zeitalter) und `raw.js` (rohe GLB-Dateien).

## Offene Punkte (Reihenfolge = Priorität)
- [ ] **R1:** Davids neue Modelle einbauen (Workflow läuft) und die Ergebnisse zusammenführen:
  - Natur-Paket (Bäume, Beerensträucher, Getreide, Schnee-Varianten)
  - Türme
  - Fischernetz für den Angler mit Animation
  - mittelalterliche Menschen
- [ ] **R2:** Truppenlinien-Durchsicht. Jede Linie von Zeitalter 0 bis 6 als Kontaktbogen prüfen und Brüche beheben:
  - Linien: Arbeiter, Keule/Speer, Schwert, Bogen → Armbrust → Muskete → Gewehr, Späher, Heiler, Reiterei, Belagerung, Schiffe, Flieger
  - Prüfen: gleicher Grundkörper, wachsende Ausrüstung, Waffe richtig gehalten, Blickrichtung, Größe, Teamfarbe erkennbar
- [ ] **R3:** Gebäude-Durchsicht je Zeitalter:
  - Gebäude: hq, house, store, barracks, tower, harbor, market, castle, mine, farm, wall, gate, airfield, derrick, refinery, trench
  - Prüfen: fehlende Modelle (Code-Rückfall), Größenverhältnisse, Teamfarbe/Flagge, eigener Stil der Eisenzeit
- [ ] **R4:** Tiere und Natur:
  - Blickrichtung und Größe im Vergleich (Reh, Wolf, Dinos, Menschen)
  - Animationen
  - Fische und Wale
  - Aussterben und Skelette
- [ ] **R5:** Fehlende Modelle ergänzen (auch aus ROADMAP Release 3). Erst in `models/neu`, `arch`, `military` und den Kenney-Bausätzen suchen.
  - Bohrturm, Raffinerie
  - Galeere
  - Fischernetze an Booten
  - schwere gepanzerte Reiterei
  - Kanone, Haubitze
  - Flugplatz
  - Betonhafen
- [ ] **R6:** Balance:
  - Selbstspiel Berater gegen KI auf allen Schwierigkeiten
  - Duell-Test der Einheiten (kostengleiche Gruppen)
  - Dino-Gefährlichkeit
  - Aufstiegstempo
- [ ] **R7:** Leistung mit allen neuen Modellen:
  - Draw-Calls und Dreiecke (`r3.renderer.info`) im späten Spiel
  - Instanzen für Deko
  - Dateigrößen
- [ ] **R8:** Häuser-Paket (House_01–20) einbauen, sobald David `House_texture_atlas.png` hochlädt.
- [ ] **R9:** Oberfläche:
  - Vorschaubilder in den Knöpfen passend zu den neuen Modellen (ICON3)
  - Hauptmenü-Hintergrund mit Szene
- [ ] **R10:** Durchspiel-Audit aller Zeitalter wie ein Spieler und Auffälligkeiten sammeln (Agent `epochen-qa`).

## Erledigt
- (wird je Runde ergänzt)
