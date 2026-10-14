# Dauer-Optimierung (Auftrag von David, 2026-10-12)

Auftrag: Das Spiel laufend verbessern, bis das Nutzungslimit erreicht ist, danach automatisch weitermachen.
Schwerpunkte: Grafik, Modelle, Feintuning. Fehlende Modelle mit passenden vorhandenen Modellen ergänzen (umwandeln, umfärben).
Bei jeder Änderung prüfen:
- Laufrichtung, Farben und Größenverhältnisse
- Balance
- Stimmigkeit über die Zeitalter, also passende Vorgänger und Nachfolger

Grundregel (David): Nicht blind einbauen, immer das Gesamtbild vergleichen. Modelle, die nicht passen oder nicht schön aussehen, werden nicht verwendet. Keine selbst gebauten Formen statt echter Modelle.

Ablauf je Runde:
1. Diese Liste lesen und den nächsten offenen Punkt nehmen.
2. Umsetzen, im Spiel prüfen (Screenshots, Konsole) und die Qualitäts-Leitung (`epochen-qa`) prüfen lassen.
3. Committen, auf `claude/youthful-brahmagupta-8dmxq5` pushen, hier abhaken und neue Funde ergänzen.

Hilfsmittel:
- Test-Skripte: `qa/` im Sitzungs-Notizordner, siehe README dort.
- FBX-Umwandler: `tools/fbx2glb`.
- Kontaktbögen: `sheet2.js` (Einheiten/Gebäude je Zeitalter) und `raw.js` (rohe GLB-Dateien).

## Offene Punkte (Reihenfolge = Priorität)
- [x] **R1:** Davids neue Modelle einbauen:
  - [x] Natur-Paket: Birke, Weide, Herbstbäume, Beerensträucher, Getreide auf Feldern, Baumstümpfe, Berg-Deko mit Schnee (zusammengeführt 12.10.)
  - [x] Türme: Ballisten-Türme als Wehrturm Eisenzeit/Mittelalter. Statt gebauter Zusätze echte Palisaden, wehrhafter Steinturm und Heißluftballon (zusammengeführt 12.10.)
  - [x] Fischernetz statt Angel mit Fischer-Animation (beide Hände, Eintauchen, Herausheben); der Ruderer im Boot (Zeitalter 0–2) fischt über Bord
  - [x] Mittelalterliche Menschen: aufrecht und richtig gefärbt, Bewegungen vom Farmer übertragen (tools/fbx2glb/retarget.js); Bauern als Abwechslung der Arbeiter im Mittelalter/Renaissance, König/Königin am Hauptlager, Bürger am Markt
  - Nachbesserungen: Beiwerk erst nach dem Bau sichtbar, Arbeiter-Symbol ohne verstecktes Netz, Sense und Jagdspeer beim Bauern kleiner
  - [x] Erledigt (David: ja): Arbeiter fischen kleine Schwärme vom Ufer (`shoreOf`). Früher offen: Arbeiter dürfen nicht vom Ufer fischen (nur Boote). Das Netz sieht man daher nur beim Ruderer. → David fragen, ob Uferfischen erwünscht ist
  - [x] Erledigt: Segelboot/Kutter haben einen Fischer mit Netz. Früher offen: Fischerboote ab Zeitalter 3 ohne Fischer (Segelboot 3,5 lang, Kutter 4,2 lang) → Fischer mit Netz als rider ergänzen
  - [ ] Offen: Vorschlag Mittelalter-Krieger = Bürger city_dwellers_1 mit Schwert/Schild (Bilder: scratchpad/menschen2/vorschlag_krieger.png) → zusammen mit R2 entscheiden
  - [ ] Offen: people-GLBs mit meshopt/Quantisierung verkleinern (+4,3 MB Download)
  - Offen aus Natur: Kiefern (neu/Pine) im anderen Stil als die Low-Poly-Laubbäume. Im Natur-Paket gibt es keine Nadelbäume.
  - Offen aus Türme: Code-Zusätze der anderen Ausbauten (Hauptlager eco/cmd, Kaserne usw. in `specModel`) sind noch aus Formen gebaut → durch echte Modelle (props) ersetzen
- [ ] **R2:** Truppenlinien-Durchsicht. Gesamtbogen: scratchpad `s11.png`. Stand:
  - [x] Rammbock, Katapult und Lore waren rosa (falsche Kenney-Farbtabelle) → Holz-Tönung `#9c8a78`, neues Manifest-Feld `cmap` je Eintrag
  - [x] Kradmelder ohne Fahrer → Fahrer (rider rifle, free)
  - [x] Kriegerlinie bricht: Adventurer (bärtiger Mann, 0–2) → Medieval (Frau mit Kapuze, 3–4) → Soldier (Soldatin, 5–6). Ziel: ein Grundkörper durch alle Zeitalter.
    - Kandidaten: neue mittelalterliche Menschen (Strang Menschen, falls animierbar) oder Adventurer mit echter Rüstung/Helm aus dem Archiv (Armor Metal/Leather, Helmet_01 aus „Military man“, Knights Character Kit)
    - Entscheidung nach dem Ergebnis des Strangs Menschen
  - [x] Heiler 3–5 (Medieval/Soldier) entsprechend angleichen
    - Erledigt: alle Krieger-Linien, Heiler, Späher, Reiter nutzen jetzt in jedem Zeitalter `neu/Adventurer.glb`. Ab Zeitalter 3 Hemd = Teamfarbe; neues Manifest-Feld `wear` (gltfmodels.js `wear()`): Brustpanzer Armor Metal (Speer/Schwert/Ritter 3–4, Ep. 4 messingfarben), Armor Leather (Armbrust), Stahlhelm Helmet_01 aus „Military man“ (Gewehr/Sturm/MG/Reiter 5–6). Tote Manifest-Einträge (Zeitalter ausserhalb `uOk`) entfernt; das war auch der Grund für „ERR … not valid JSON“ im Kontaktbogen und für die „gleichen“ Speer/Schwert/Bogen in 5/6 (die gibt es im Spiel gar nicht).
    - Verworfen: Medieval/Soldier (andere Figur, Frau), Knights Character Kit (nur unbenannte Einzelteile, anderer Stil).
    - Neue Funde: Armbrustschütze trägt noch einen Bogen (kein Armbrust-Modell vorhanden → Paket nötig); Military-man-Datei 1,5 MB nur für den Helm (verkleinern mit glbslim); Ep. 6 Hemd in Teamfarbe zur Tarnhose wirkt bunt, aber nötig für die Erkennbarkeit; rider_m/rider_r Ep. 6 (Soldier) ungenutzt
  - Ursprüngliche Aufgabe: Jede Linie von Zeitalter 0 bis 6 als Kontaktbogen prüfen und Brüche beheben:
  - Linien: Arbeiter, Keule/Speer, Schwert, Bogen → Armbrust → Muskete → Gewehr, Späher, Heiler, Reiterei, Belagerung, Schiffe, Flieger
  - Prüfen: gleicher Grundkörper, wachsende Ausrüstung, Waffe richtig gehalten, Blickrichtung, Größe, Teamfarbe erkennbar
- [ ] **R3:** Gebäude-Durchsicht je Zeitalter:
  - Gebäude: hq, house, store, barracks, tower, harbor, market, castle, mine, farm, wall, gate, airfield, derrick, refinery, trench
  - Prüfen: fehlende Modelle (Code-Rückfall), Größenverhältnisse, Teamfarbe/Flagge, eigener Stil der Eisenzeit
- [~] **R4:** Tiere und Natur (12.10.: Blickrichtung und Größe von Reh, Wolf, Bär, Tiger und allen Dinos im Spiel geprüft, passt. Mammut/Säbelzahntiger werden nicht mehr aufgestellt (Dinos ersetzen sie), ihre Einträge sind ungenutzt. Fische/Wale verteilt und an Bootsgröße gebunden. Offen: Animationen im Detail, Skelette):
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
  - [x] Selbstspiel Berater gegen KI auf allen Schwierigkeiten (10 Min: leicht 24:8 Einheiten, normal 23:22, schwer 28:31; kein Sieger, keine Änderung nötig)
  - Duell-Test der Einheiten (kostengleiche Gruppen)
  - [x] Dino-Gefährlichkeit (Rechnung: 6 Steinzeit-Kämpfer ~30 Schaden/s; T-Rex vorher 950 Leben/58 Schaden unschaffbar, jetzt 480/40 = mit ~8 Kämpfern knapp schaffbar; Pflanzenfresser nur wehrhaft, Raptor ok)
  - [x] Aufstiegstempo (Berater-Auto, Normal: 1. Aufstieg 7,6 min, 2. Aufstieg nicht in 15 min, braucht 10 Arbeiter; keine Änderung)
- [~] **R7:** Leistung mit allen neuen Modellen (Runde 12.10., Messung große Karte, `qa/perf.js`, `qa/army.js`):
  - Gras nur im sichtbaren Ausschnitt (`r3GrassView`), Halme ohne Boden: normale Ansicht 1,42 Mio. → 0,41 Mio. Dreiecke
  - Fernsicht (Zoom < 0,95, `LOD_Z`): vereinfachte Bäume (`lodGeo`) und Gelände (jeder 2. Eckpunkt): 1,8 Mio. → 0,37–0,42 Mio.
  - Vorkommen/Deko mit Bildschirm-Test (`onS` in `r3Nodes`): Bergland Zoom 1: 1,06 Mio. → 0,78 Mio.
  - Figuren zu einem Teil zusammengefasst (`mergeSkin` in gltfmodels.js, `window.__noMerge=true` schaltet es zum Vergleich ab): 120 Einheiten 2010 → 517 Zeichenaufrufe
  - Figuren außerhalb des Bildes versteckt statt gelöscht (bis 20 s, `o.off`), Schattenkarte jedes 2. Bild
  - offen: Einheiten-LOD in der Fernsicht, Gelände flacher Stellen gröber, Instanzen für Gebäude-Beiwerk
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

## Funde aus Davids Test (2026-10-12)
- [x] Keulenkrieger fiel in der Bronzezeit auf die alte Code-Figur zurück. Behoben: eigener Eintrag für Zeitalter 1. Außerdem nimmt `entryFor` bei Einheiten jetzt immer das nächstgelegene echte Modell.
- [x] Selbst gebaute Steinzeit-/Bronzezeit-Gebäude (`js/eramodels.js`) entfernt. Stattdessen echte Modelle (Town Center mit Hirsch-Totem, Hütten, Shack, Encampment, Wachtürme, Steg) mit echtem Beiwerk (Lagerfeuer, Schädel, Heu, Fischgräten).
- [x] Code-Rückfälle geschlossen:
  - Lore 0–4: Holzkarren
  - Panzerschiff: grauer Dampfer
  - Haubitze, Skoda, Bertha: Light Tank, oliv umgefärbt
  - Kaserne 5: Backsteinbau mit Übungspuppe/Zielscheibe; Kaserne 6: Zeltlager mit Jeep und Lastwagen
  - Hafen 5–6: Frachthafen
- [ ] Noch Code-Rückfall:
  - Kanone (Zeitalter 4): kein Manifest-Eintrag, `entryFor` findet nichts zum Ausweichen. Vorhanden sind nur `models/towers/cannon_*.glb` (Geschützturm, keine Feldkanone) → fehlt: fahrbare Feldkanone auf Lafette (glTF), David bitten
  - Turm 5–6 (Strang Türme)
  - Mauer, Tor (14.10.): jetzt echte Modelle (Holzwand/Holztor Zeitalter 0–2, Steinmauer/Burgtor ab 3, aus `archiv/`); Länge der Mauersegmente und Pfosten im Spiel noch prüfen. Graben: kein passendes Modell, bleibt Code → David bitten
  - Bohrturm, Raffinerie, Flugplatz (Zeitalter 6, kein Manifest-Eintrag): fehlt Ölförderung/Raffinerie und ein Hangar/Flugfeld (nur `arch/Barn.glb`, passt nicht) → David bitten
  - Geprüft 14.10. und bewusst nicht benutzt: Propangastank (als Raffinerie), Scheune/Lagerschuppen/Zelt (als Hangar), `towers/cannon_*` (Geschützturm statt Feldkanone). Bitte Pakete hochladen: Feldkanone auf Lafette, Ölbohrturm, Raffinerie, Hangar/Flugfeld, Schützengraben.
- [x] Fell-Umhang, Fellrock und Zahnkette (aus Formen gebaut, `cloth()`) an allen Figuren entfernt. Die Zeitalter unterscheiden sich jetzt über die Kleidungsfarben, Späher sind grün, Heiler hell.

- Erledigt (12.10. c): „Military man“ (1,5 MB) durch `archiv/Stahlhelm.glb` (227 KB) ersetzt; Nationen-Einheiten/Ingenieur nutzen den gemeinsamen Grundkörper Adventurer (weniger verschiedene Skelette/Dateien).

- [x] Berater-Selbstspiel (Normal): Aufstieg 1 von 7,6 min auf 6 min, Aufstieg 2 bei ~13,5 min (zuvor nie). Ursachen: Arbeiterziel in Steinzeit nur 6 (jetzt 9/14), und Arbeiter in der Mine (Zustand `mine`) wurden von den Umverteilungs-Regeln nicht gezählt/umgestellt (Stein 2000+ gehortet, Nahrung leer). Offen: ein Lauf von zwei erreicht Aufstieg 2 knapp nach 15 min (Zufall der KI).

## Spieltempo gebremst (14.10.)
- Aufstiegskosten (`EPOCHS` in data.js) etwa verdreifacht (vor allem Nahrung/Holz), Bauzeit 100–220 s, `wkNeed` 14/22/30/40/46/50, Berater-Arbeiterziele 15/22/30/40/45. KI zahlt nur 40 % (`AI_ADV_COST`, `advCost` in sim.js), `AI_MINT` 620/1290/2030/2770/3500/4200.
- Messung (Selbstspiel Berater, Normal, Seed 7, "Arbeiter denken mit" an): Spieler Aufstiege bei 15,4 / 28,1 / 40,4 / 51,8 min (vorher 5,8 / 12 / 17 / 28); KI 18,1 / 30,5 / 47 / 63,7 min.
- Behoben: Eine vom Berater gesetzte Mine blieb unfertig, weil nur ein Bauarbeiter geschickt wurde und er abgezogen werden konnte. `autoFinish` (sim.js) läuft jetzt auch bei Berater-Auto ohne "Arbeiter denken mit" und besetzt unfertige Gebäude neu. Test (30 Min, Normal, M): Mine fertig bei 954 s, Aufstieg bei 894 s.
