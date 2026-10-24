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
  - [x] Erledigt (R2 zweiter Durchgang): Mittelalter-Krieger (Speer/Schwert/Reiter-Figur `rider_m`, Zeitalter 3–4) = Bürger `people/city_dwellers_1.glb` mit Schwert/Speer + Schild (Teamfarbe nur am Schildrand, Zeitalter 4 mit Messing-Schulterpanzer). Ehrlich: anderer Körper als Adventurer davor/danach (Zeitalter 2 und 5), Teamfarbe schwächer als beim Hemd
  - [ ] Offen: people-GLBs mit meshopt/Quantisierung verkleinern (+4,3 MB Download). R2: nicht gemacht, im Bundle `gltf-bundle.js` fehlt der Meshopt-Decoder (nur der Haken `setMeshoptDecoder`), Quantisierung bräuchte gltfpack/gltf-transform
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
  - R2 zweiter Durchgang (Kontaktbögen Zeitalter 0–6): Heiler Zeitalter 4/5 hatten keinen Stab → ergänzt; Reiter Zeitalter 6 (`rider_m`/`rider_r`) war eine andere Figur (Soldier, Frau) → wie Zeitalter 5 (Adventurer + Stahlhelm, olive Tarnung); Kamelreiter nutzte die ausgelaufene Schwertlinie → `rider_m`; Fischerboot Zeitalter 0–2: Ruderboot war winzig und der Fischer schwebte → Boot grösser, Fischer steht im Boot. Offen: Armbrustschütze trägt Bogen, Bomber/Jäger Zeitalter 6 sind Doppeldecker, Zeitalter-3/4-Schwert/Speer ohne `hit`/`ready`-Clip (Bürger-Datei hat nur Idle/Walk/Sword_Slash)
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
- [x] **R6b:** KI nach Karten-/Tempo-/Animationsänderungen neu gemessen (18.10.): Die KI häufte Rohstoffe an (bis 12 000 Nahrung, nur 3–16 Soldaten) und verlor, der Berater-Autopilot gewann auf Normal 6 von 6 Läufen nach 28–39 min. Behoben in `aiTick` (Heeresgrenze wächst mit Überschuss, dritte Kaserne, Sammler-Umverteilung, `DIFF.spare`). Normal jetzt 3 Siege/2 Niederlagen/1 offen in 6 Läufen (Küste, Flusstal, Wüste × 2 Seeds). Offen: Wüste ist für den Autopilot am schwersten (beide Läufe verloren), prüfen, ob dort etwas Karten-Bedingtes (Wege, Hafen) die Berater-Armee bremst; Mensch gegen Normal von David testen lassen und `DIFF.normal.spare` (.5) bei Bedarf senken/erhöhen.
- [~] **R7:** Leistung mit allen neuen Modellen (Runde 12.10., Messung große Karte, `qa/perf.js`, `qa/army.js`):
  - Gras nur im sichtbaren Ausschnitt (`r3GrassView`), Halme ohne Boden: normale Ansicht 1,42 Mio. → 0,41 Mio. Dreiecke
  - Fernsicht (Zoom < 0,95, `LOD_Z`): vereinfachte Bäume (`lodGeo`) und Gelände (jeder 2. Eckpunkt): 1,8 Mio. → 0,37–0,42 Mio.
  - Vorkommen/Deko mit Bildschirm-Test (`onS` in `r3Nodes`): Bergland Zoom 1: 1,06 Mio. → 0,78 Mio.
  - Figuren zu einem Teil zusammengefasst (`mergeSkin` in gltfmodels.js, `window.__noMerge=true` schaltet es zum Vergleich ab): 120 Einheiten 2010 → 517 Zeichenaufrufe
  - Figuren außerhalb des Bildes versteckt statt gelöscht (bis 20 s, `o.off`), Schattenkarte jedes 2. Bild
  - (die frühere Liste „Einheiten-LOD, flache Stellen gröber, Beiwerk“ ist in R7 Runde 2 unten abgearbeitet)
  - Draw-Calls und Dreiecke (`r3.renderer.info`) im späten Spiel
  - Instanzen für Deko
  - Dateigrößen (Bericht, nichts gelöscht): >3 MB nur `models/neu/UAL1_Standard.glb` 7,3 MB (in Benutzung) und in `models/archiv/` (unbenutzt, nicht in der App): `raum/artist_workshop_4k.exr` 23 MB, `raum/ferndale_studio_03_2k.hdr` 6,1 MB, Knights-Kit 4,1 MB, Trees 3,3 MB, Rocks 3,1 MB
  - Messung spätes Zeitalter (`qa/perf.js`: Große Karte, Zeitalter 5, 100 Einheiten + 48 Gebäude, gemittelt über Haupt- und Schattenbild, Swiftshader): 100 Einheiten kosten etwa 0,63 Mio. Dreiecke und 470 Zeichenaufrufe (ohne Einheiten 0,83 Mio. / 568 von 1,46 Mio. / 1040); Arbeiter tragen Rucksack-/Werkzeugteile als eigene Meshes
  - Gemacht: Figuren/Tiere werfen in der Fernsicht (Zoom < 0,95) keinen Schatten (`r3UnitSh` in `r3Lod`): Zoom 0,7 vorher 1521 Aufrufe / 2,27 Mio. Dreiecke, nachher 1274 / 1,87 Mio. (-16 % / -18 %); Zoom 1,0 unverändert (~1700 / 1,93 Mio.)
  - **R7 Runde 2 (18.10., späte Partie mit großen Heeren)** – Messung: Küste L, Zeitalter 5, Armee-Szenario mit 1301 Objekten (`SCEN=army`, Swiftshader, gemittelt über Haupt- und Schattenbild, `r3.renderer.info` mit `autoReset=false`). Vorher = Stand vor der Runde, nachher = jetzt:
    - Zoom 1,0: Zeichenaufrufe 1518 → 646 (-57 %), Dreiecke 2,21 → 1,50 Mio. (-32 %)
    - Zoom 0,7: Zeichenaufrufe 1430 → 727 (-49 %), Dreiecke 2,34 → 1,85 Mio. (-21 %)
    - Rechenzeit je Bild (nur JavaScript `r3Sync` samt Animation): 5,8 → 4,4 ms (Zoom 1), 4,4 → 2,3 ms (Zoom 0,7); Zeichen-Aufruf-Zeit (Swiftshader, schwankt von Lauf zu Lauf) etwa 35–47 → 15–20 ms bei Zoom 1, bei Zoom 0,7 19–25 → 18–21 ms (kaum Unterschied: dort bremst die Software-Darstellung durch die vielen Dreiecke, nicht die Aufrufe). Auf einer echten Grafikkarte zählt vor allem die Zahl der Aufrufe.
    - Das Bild bleibt gleich: Eckpunkt-Lagen der zusammengefassten Teile gegen die alten Teile verglichen (64 Fälle, größte Abweichung 0,005), Pixelvergleich aller Einheiten- und Gebäudetypen vorher/nachher identisch.
  - Gemacht (alles in `js/gltfmodels.js` und `js/render3d.js`; `window.__noMerge=true` bzw. `window.__noLod=true` schalten es zum Vergleichen ab):
    - `mergeSkin` fasst jetzt auch fest angebundene Teile (Waffen, Schilde, Helme, Rüstung) mit dem Körper zusammen: starr an einen Knochen gebunden (Gewicht 1), Farbe in Eckpunktfarben gebacken. Gleiche Figuren teilen Geometrie und Material (`mergeCache`, höchstens 120). Ausnahme: das umschaltbare Werkzeug der Ingenieure.
    - Texturen werden vereinheitlicht (`dedupTex`, Bilder ≤ 512 px, Vergleich per Hash): alle Waffen hatten dieselbe 256-px-Karte, dadurch fallen die Waffengruppen auf zwei Materialien zusammen.
    - `mergeStatic`: Gebäude (Hauptmodell + Beiwerk `props` in einem Container) und Einheiten ohne Animation (Schiffe, Fahrzeuge, Katapulte, Code-Gebäude über den `buildBld`-Einstieg) werden zu wenigen Meshes verschmolzen, mit gemeinsamem Zwischenspeicher (`statCache`, höchstens 100). Minen ausgenommen (`noStone`), weil der Erz-Farbton Materialien namens stone/rock färbt.
    - Figuren-LOD (`lodTris`, `r3FigLod`, `FIG_LOD_PX` = 60): Figuren, die auf dem Bildschirm kleiner als 60 Pixel sind (`R3.k*25 < 60`; bei 720p ist ein Mensch bei Zoom 1 etwa 37 px hoch, bei Full-HD etwa 56 px), zeigen eine vereinfachte Fassung (36 % der Dreiecke, mindestens 2600). Die Vereinfachung behält je Rasterzelle einen echten Eckpunkt mit seinen eigenen Skin-Gewichten (kein Mitteln der Gewichte), deshalb stimmt die Animation. Kontaktbogen voll gegen vereinfacht bei 3 Größen (Schwert, Ritter, Gewehr, Arbeiter, Bogen): kein sichtbarer Unterschied; auf sehr großen Bildschirmen (Mensch ≥ 60 px) bleibt die volle Fassung.
    - Animation weit entfernter Figuren seltener (`thr` in `r3Unit`: unter 18 px Höhe nur jedes 3., unter 30 px jedes 2. Bild, immer sofort bei Wechsel der Tätigkeit).
    - Speicher-Leck behoben: ausgetauschte Modelle gaben Geometrien und Knochen-Texturen nicht frei (je Einheit +1 Textur). `r3Drop` gibt sie jetzt frei (Wechsel der Signatur, Löschen, Karte, Leichen, Geisterbild). Seefische werfen keinen Schatten mehr.
    - Texturen verkleinert (`tools/glbtex.py` verkleinert nur noch zu große Bilder, behält PNG bei Alpha/Normalkarten, sonst JPEG q94): Pine 2,15 → 0,60 MB, drei Felsen je 1,06 → 0,11 MB, Kristalle, Eidechse, Katze, Bison, Bär, Flugzeug (0,32 → 0,16 MB), Stahlhelm 227 → 48 KB. Unterschied im Bild: im Mittel höchstens 0,7 von 255. Grafikspeicher der benutzten Modelle geschätzt 138 → etwa 40 MB, Dateien rund 5 MB kleiner. Nichts gelöscht.
    - Arbeiter-Haltungen (`js/workpose.js`, Punkt 4 der Liste): 150 arbeitende Arbeiter bei Zoom ≥ 0,8 kosteten 5,1 ms je Bild (Hälfte davon Neuberechnung der Knochenketten bei jeder Abfrage), die Grenze von 80 Haltungen je Bild bleibt. Jetzt merkt sich die Berechnung Änderungs-Stempel je Knochen und rechnet nur die geänderten Ketten neu: 5,1 → 1,6 ms (Gesamtzeit `r3Sync` 7,5 → 4,0 ms bei Zoom 1; 2,2 → 1,4 ms bei Zoom 0,6). Ergebnis identisch: alle Knochen-Matrizen in 54 Fällen (6 Figuren × 9 Tätigkeiten) vergleichen mit Abweichung 0.
  - Untersucht und bewusst nicht eingebaut:
    - Gelände flacher Stellen gröber (`r3Chunks`): es gibt in der Praxis keine ganz flachen Stücke (Höhenrauschen, Terrassen, Küste), eine Vereinfachung hätte sichtbare Stufen gebracht.
    - Bäume vereinfachen auch im normalen Zoom (Raster-Vereinfachung): Kronen werden löchrig, sieht schlechter aus. Bäume sind bei herausgezoomter Ansicht 36–50 % der Dreiecke; dafür braucht es einen echten Kanten-Zusammenzug (Edge-Collapse) mit Prüfung, nicht das Raster.
  - Weiter offen:
    - Bäume: Kanten-Zusammenzug statt Raster (größter Posten bei herausgezoomter Ansicht).
    - Gelände wird in vier Durchgängen gezeichnet (Boden, Schaum, Gebiet, Nebel). Zu einem Durchgang zusammenlegen würde schwache Grafikkarten entlasten, braucht aber Sorgfalt bei der Wasserschichtung.
    - Schattenbild kostet etwa so viel wie das Hauptbild (Einheiten/Gebäude). Ein gröberes Schatten-Ersatzmodell geht in Three.js r160 nur mit zusätzlichen Aufrufen.
    - Animations-Clips in den Mensch-Dateien kürzen (etwa 0,2 MB je Datei).
- [ ] **R8:** Häuser-Paket (House_01–20) einbauen, sobald David `House_texture_atlas.png` hochlädt.
- [ ] **R9:** Oberfläche:
  - Vorschaubilder in den Knöpfen passend zu den neuen Modellen (ICON3)
  - Hauptmenü-Hintergrund mit Szene
- [x] **R10 (technisch, ohne Bilder):** 60 Spielminuten Selbstspiel (Berater Auto, Normal, Küste M, 1 Spieler gegen KI): 0 JS-Fehler, 0 NaN in Leben/Position, keine negativen Vorräte, keine dauerhaft festhängenden Einheiten, Gebäude werden fertig. Nur Warnungen von Three.js/SwiftShader. Offen: Berater-Auto kam nur bis Epoche 4 (KI Epoche 3); Bevölkerung 73/100, Nahrung stieg auf ~24000 ungenutzt, Berater gibt Überschuss nicht aus (Truppen/Aufstieg zu zögerlich). Visueller Teil von R10 (Agent `epochen-qa`) bleibt offen.

## Davids Rückmeldungen (18.10., nach dem Testspiel) – Arbeitspakete
Regeln: immer nur EIN Agent gleichzeitig, danach prüft Claude Ergebnis und Bilder kritisch, erst dann commit/push. Sparsam arbeiten (kleine Fenster, gezielte Dateiausschnitte). Keine selbst gebauten Code-Modelle. Vor Commit `node tools/modell-luecken.js` und `node --check`.
- [x] **Paket A – Regeln & KI** (Agent 1)
  - [x] A1 Zoom: näher ran UND weiter weg zoomen (Mausrad `input.js` bisher .55–1.8, Pinch, Tasten; Gras/Schatten/LOD/Nebel/Leistung bei den neuen Grenzen prüfen)
    - Ergebnis: `ZOOM` .3–3.2 (Mausrad und Pinch, `OPT.zoomSpeed` bleibt). Nahebene und Schattenbereich folgen dem Kameraabstand (`camUpdate`), Gras gröber bei Fernsicht (`r3GrassView`), Bäume und Fischschwärme dünnen sich aus. Messung HQ-Mitte, Software-GL: Zoom .3 vorher 986 Aufrufe / 2,26 Mio. Dreiecke → 526 / 0,99 Mio.; Zoom .55 (alte Grenze) unverändert 291 / 1,04 Mio.; Zoom 1: 133 / 0,47 Mio.; Zoom 3,2: 49 / 0,17 Mio.
  - [x] A1b Kamera sieht den ganzen Kartenrand (David): `clampCam` liest Leiste `#top` und Konsole `#panel` aus dem DOM (`uiInsets`, ResizeObserver) und klemmt den Mittelpunkt der freien Fläche; jeder Kartenrand (auch unten über der Konsole) ist bei jedem Zoom ganz sichtbar, geprüft bei 800×500 und 1280×720; der Überstand über den Rand wächst mit dem Zoom (Spielzimmer an: 40 % der halben Bildgrösse, aus: 20 %). Brettkante: Holzrahmen mit Schatten (`ROOM.makeBoard`), Tisch/Lampe/Tasse dahinter sichtbar, ohne Raum dunkler sauberer Rand. Minikarte, `toWorld(..,raw)`, Auswahl, Randscrollen, Mehrspieler-Randgebirge (`playF`) laufen mit. Für Paket D bleibt: Tisch/Sofa/Stifte neu anordnen, Rundum-Foto, Startbild.
  - [x] A2 Vorkommen erst im passenden Zeitalter sichtbar: Öl erst viel später, Eisen erst wenn man es abbauen kann, Stein/Gold ebenso (`RES_EP`, `HIDDEN_NODES`, Anzeige, Minikarte, Auswahl, Befehle)
    - Ergebnis: eine zentrale Prüfung `nodeEpochOk`/`nodeKnown` (state.js) für Anzeige, Auswahl, Minikarte, Befehle, `nearestNode` (Arbeiter laufen nicht zu verborgenen Vorkommen) und Mauer-Einrasten; die Simulation/KI kennt sie weiter. Beim Aufstieg wachsen die neuen Vorkommen weich ein (`R3.ap`). Mehrspieler-Gast gleich. Fisch/Wal/Delfin folgen weiter ihren Stufen (`NODES.lvl`).
  - [x] A3 Eisen und Gold viel kleiner, wie Stein (Grösse `sz`, Modell-Massstab, Vergleich mit Stein/Hütte/Baum)
    - Ergebnis: Ursache war die Skalierung auf das Bezugsmodell (Eisen/Gold wurden auf die Höhe des Steins hochgerechnet, aber mit eigenem Modell + Kristallen). Jetzt `NSET.iron/gold` mit `like:'stone'` (`rockGeoC`), Manifest-Massstab Fels .76/.74, Kristalle .6/.56; Mengen und Treffer unverändert, Mine passt.
  - [x] A4 KI baut den Hafen beim Fisch (nicht ans nächste Wasser): `aiPlaceHarbor` wie `advFindSpot('harbor')` beim Berater
    - Ergebnis: gemeinsame Funktion `harborNearFish` (state.js) für Berater und KI; die KI sucht Schwärme im Umkreis von 900 px ums Hauptlager, Ring 80–520 px, dann 540–720 px, sonst wie früher irgendein Uferplatz; nach Fehlschlag 25 s Pause (`hbT`). Messung (15 Karten: Küste, Bucht, Archipel, Seenplatte, Fjord je 3 Seeds, KI-Seite, Mittel): Abstand Hafen–nächster Fischschwarm vorher 436 px → jetzt 88 px; Schwärme im Umkreis 300 px 0,4 → 7,3; Karten ohne Hafenplatz 6 → 2 (Küste 2: gar kein Fisch in 900 px, Fjord 1: kein Uferplatz). Archipel jetzt 124/280/275 px statt 311/kein/kein Platz.
  - [x] A5 KI baut Verteidigungstürme sinnvoll (`aiPlaceTower`): Lage, Abstände, Richtung zum Gegner, nicht komisch verstreut
    - Ergebnis: Ursache war `AI_GAP.tower` 460 (Platzsuche scheiterte fast immer; Küste Seed 1 nach 14 Min: 5 von 6 Türmen ohne Platz, der eine 664 px vom Lager). Neue Regel (`aiTowerSpot`, siehe CLAUDE.md): zuerst Paar vor dem Hauptlager, dann gestaffelt auf der Zugangslinie zum Gegner, dazwischen Deckung für schlecht geschützte Gebäude, Abstand ≥ 220 px, nur erreichbares eigenes Land, nicht am Ufer; 0,3–9 ms je Versuch. Gleiche Küste: 6 Türme kompakt (130–635 px, 4 davon decken je 2 Gebäude). Balance: Heer, Arbeiter und Aufstieg der KI gleich (16 Läufe, Kontrolle ohne Belagerungsregel des Beraters), Türme jetzt 2–3 statt 0. Achtung: Berater-Auto bildet bei ≥ 2 bekannten Türmen Rammen aus und gewinnt dadurch gegen die KI jetzt schon nach 23–25 Min. (vorher 1 von 8 bis Minute 32): das ist der Berater, nicht eine schwächere KI. Offen: KI-Nahkämpfer könnten Rammen gezielt zuerst angreifen.
- [ ] **Paket C – Figuren-Animation** (Agent 2)
  - [ ] C1 Getragene Last (Holz/Erz/Beeren…) schwebt auf dem Rücken → sieht richtig getragen aus (`wprops` in `workpose.js`/Manifest: Sack/Bündel/Korb am Körper, nicht in der Luft)
  - [ ] C2 Lore-Schieber (Steinmine): Füsse zeigen nach innen → Beine/Füsse beim Schieben richtig (`rider.push` in `gltfmodels.js`)
- [ ] **Paket D – Startbildschirm & Spielzimmer** (Agent 3, nur dafür)
  - [ ] D1 Ladebild/Anfang schöner, mit Geschichte: das Spiel ist ein Brettspiel (z. B. Spielkarton/Titelbild, später Davids Titelbild einsetzbar), Vorschau soll beim Laden passen
  - [ ] D2 Rundum-Foto nicht mehr verzerrt (`groundSky` in `room.js`): als normales Bild/Hintergrund, Boden sauber gefüllt
  - [ ] D3 Modelle am Tisch neu anordnen: Sofa ergibt so keinen Sinn, Stifte weg bzw. nur einzelne Teile, nichts schwebt, Gesamtlayout viel besser
- [ ] **Paket B – Meer & Wasser** (Agent 4)
  - [x] B1 Delfin hat ein falsches Modell (Tuna/Schwertfisch): echtes Delfin-Aussehen (vorhandenes Modell suchen, sonst David um Modell bitten)
  - [x] B2 Wale zu klein im Vergleich zu Delfinen → Wal deutlich grösser als Delfin
  - [ ] B3 Wasser an den Ufern zu kantig → weichere Küstenlinien (Gelände/`renderBg`/`r3Map`)
- [ ] **Paket E – Truppen, Tiere, Bauregeln** (Agent, nach B und D)
  - [ ] E1 Mauern müssen auch im seichten Wasser baubar sein (`placeBlock`/`wallSnap`, TERR 1)
  - [ ] E2 Krokodile greifen zu oft und zu viele Arbeiter an (`updAnimal`, Aggro `agg`, Revier `leash`, Wasser-Tiere)
  - [ ] E3 Truppen reagieren nicht automatisch: im Leerlauf Gefahren in der Nähe angreifen; dazu Wildtiere (gefährliche, nicht alle) rund um Arbeiter/Basis säubern, Truppen schauen im eigenen Gebiet nach (nicht gegen friedliche Tiere/Rehe als Beute verwechseln)
  - [ ] E4 Heiler/Priester zu stark, zu viel Heilung: abschwächen (`healAura`, `CTR`)
- [ ] **Paket F – Wirtschaft, Berater, Karten-Vorkommen** (Agent, nach E)
  - [x] F1 Davids Partie: viel zu viel Nahrung und Holz (z. B. 16 000 Holz), die KI/der Berater baut kaum Stein und Eisen ab. Berater/Arbeiter-Verteilung (`advRules`, Auto-Verteilung) und KI (`w8`) prüfen; Farmen vs. Fischen vs. Jagd abgleichen (Farm soll weniger lohnen als Fischen/Jagd)
  - [x] F2 Karten prüfen: Anzahl Bäume pro Karte (zu wenige), Stein/Eisen-Vorkommen und Spawns (`near(...)`, `feats` in `map.js`), Bäume sollen nicht zu schnell leer sein
  - [x] F3 Berater reißt erschöpfte Minen automatisch ab und zeigt vorher den Hinweis „Mine erschöpft" (kleiner roter Pfeil/Marker, Meldung)
  - [x] F4 Arbeiter an Bäumen kleben aneinander: besser auf Bäume/Büsche verteilen (`cap`, Zielwahl `nearestNode`, Abstand)
- [ ] **Paket G – Optik-Feinschliff** (Agent, nach F)
  - [x] G1 Beeren sammeln: Griffweite für Sträucher 1,15 → 1,9 (render3d.js `o.sh`, Figur darf bis 1,3 zurück); Kopf nicht mehr im Laub, Hände noch am Busch. Winter-Variante nicht einzeln geprüft
  - [x] G2 (durch Paket D erledigt) Holzrand des Bretts mit Details (z. B. Schriftzug „Epochenkrieg", Verzierung)
  - [x] G3 Mehr Vielfalt bei Arbeitern: `vary`-Einträge im Manifest dürfen Objekte sein `{file,tint,skin,hair}`. Steinzeit/Bronze/Eisen je 8 Typen (Adventurer, andere Kleidungsfarben/Haut/Haar), Mittelalter 7 Bauern (wie vorher), Renaissance 7 (Bürger/Reiche + 2 Bauern, eigener Eintrag), Industrie/Weltkrieg 9 (Bauarbeiter mit Helm/Weste in 6 Farbtypen, Overall-Farmer x3). Bewusst nicht: Bürger-Modelle in Industrie/Weltkrieg (Renaissance-Kleidung passt nicht)
- Erledigt/Klärung: Delfine und Wale erscheinen erst im passenden Zeitalter (so gewollt); „Normal"-Schwierigkeit gefällt David; kein weisser Bildschirm mehr.
- Davids Lob (nicht kaputt machen): Karten, Jahreszeiten, Arbeiter-Animationen.

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

## Kandidaten für fehlende Modelle (15.10., Recherche; Download war nicht möglich, kenney.nl ist im Proxy gesperrt)
Bitte selbst herunterladen und hochladen (nur CC0/CC-BY). Lizenz auf der Seite vor dem Einbau prüfen, nichts davon ist hier geprüft/eingebaut.
- Feldkanone auf Lafette: Kenney "Pirate Kit" (CC0, enthält Kanone, GLB) – https://kenney.nl/assets/pirate-kit ; Kenney "Castle Kit" – https://kenney.nl/assets/castle-kit (Belagerungsgerät). Nur falls Stil passt.
- Ölbohrturm / Pumpe, Raffinerie, Hangar, Schützengraben: kein CC0-GLB gefunden. Suche auf https://poly.pizza (Filter CC0/CC-BY, Stichwort "oil", "hangar", "trench"), https://quaternius.com und https://opengameart.org ("oil derrick", "refinery", "hangar", "trench"). Gefundene Pumpjacks (thepixellab, CGTrader, RenderHub) sind nicht CC0 oder kostenpflichtig, nicht nehmen.
- Hangar-Ersatz: Kenney "Modular Buildings"/"City Kit (Industrial)" – https://kenney.nl/assets/city-kit-industrial (CC0, Hallen/Tanks, könnte Raffinerie/Hangar per Umfärben ergeben).

## Ideen aus anderen Open-Source-RTS (nur Ideen)
- 0 A.D.: Gebäude und Einheiten haben Rüstung gegen Hieb/Stich/Druck getrennt, so entsteht Stein-Schere-Papier ohne neue Werte pro Einheit.
- 0 A.D.: Einheiten sammeln Erfahrung (Ränge) und werden durch Kämpfe stärker, das macht kleine Truppen wertvoll.
- OpenRA: Wegfindung mit Verkehrsregeln – stehende Einheiten weichen marschierenden aus, das löst Staus an Engstellen.
- OpenRA: Bauwarteschlange pro Gebäudetyp und gesetzter Sammelpunkt (Rally) spart dem Spieler viele Klicks.
- Widelands: Wirtschaft über Straßen/Warenfluss mit sichtbaren Engpässen; für uns: Anzeige, welche Ressource gerade fehlt.

- Mauer/Tor-Modelle geprüft (Messung im Spiel): lange Achse liegt richtig in Zugrichtung, aber Stücke waren 28,9 px lang bei 24 px Abstand (Überlappung). `fit` 0,85 für Holz/Stein-Mauer und Tor → 24,5 px, keine Lücken. Pfosten (`wallPosts`) unverändert. Keine Konsolenfehler; keine Screenshots nötig.

## R10-Nachtrag: Berater-Tempo (Selbstspiel, Normal, 60 min)
- Ursache: Berater-Arbeiterziel (45) lag unter dem Aufstiegsbedarf `wkNeed` (46) -> Aufstieg Epoche 3->4 wartete. Ausserdem: Hütten zu spät (Bevölkerungsgrenze bremste), wenig Truppen. Nahrung "ungenutzt" ist grossenteils Sparen für die Aufstiegskosten (6600 Nahrung ab Epoche 1) – Kosten bleiben unverändert.
- Änderung (`advisor.js`): Arbeiterziel mindestens `wkNeed(ep)`, Taktik "Ausgewogen": mehr Arbeiter (18/28/38/48/54), `hs:5` (Hütten früher), Truppenziel 10+8*Ep, zweite Kaserne ab 20 Arbeitern, Angriff erst ab Epoche 4.
- Ergebnis: vorher Epoche 4 nach 60 min, 26 Truppen, 15700 Nahrung; nachher Epoche 4 nach ~55–60 min bzw. Sieg über die KI (KI Epoche 2–3) nach 42–50 min mit 36 Truppen. Epoche 5 ohne Kostenänderung nicht erreichbar (~13 min je Aufstieg, Einkommen ist die Grenze).


## Tempo-Abstimmung (18.10.)
- Auslöser: David (spielt mit Tempo 5x) fand das Spiel zu langsam: die Aufstiegskosten waren um das 11- bis 14-Fache gestiegen (Steinzeit 3800 Essen/2500 Holz statt 350/200), nicht um das Dreifache.
- Messung (Berater-Auto, Küste M, Seed 5, Aufstieg 1/2/3 in Minuten): Kostenfaktor 1,0 → 15/28/40; 0,6 → 13/25/33; 0,45 → 13/25/35; 0,3 → 10/21/29; 0,2 → 10/17/23; 0,12 → 9/15/23. Unter ca. 0,3 ändert sich der erste Aufstieg kaum (Arbeiter-Bedarf 14 + Aufstiegsdauer begrenzen).
- Gewählt: ansteigende Kurve (ca. 28 % bis 45 % der alten Kosten, später Zeitalter etwas günstiger), Aufstiegsdauer 90/110/130/150/170/190 s. Ergebnis: Berater steigt bei ca. Minute 9–10 / 17–23 / 25–29 / 36–43 auf.
- KI: `AI_MINT` angepasst, Normal wk 1,35 / army 0,8, Schwer wk 1,6 / army 1,35. 4 Karten (Seeds 5/11/23/31, 62 min): Berater gewinnt Min. 26 und 49, KI gewinnt Min. 49, einmal offen bis Min. 62. Leicht (Seed 11): Berater gewinnt Min. 40, KI kaum entwickelt; Schwer: KI gewinnt Min. 42.
- Gefundener Fehler: `advIdle` rief `has()` auf (nur in `advRules` bekannt), ab Epoche 5 brach der Berater-Tick ab. Behoben.
- Offen: Streuung der ersten KI-Angriffswelle (kann früh sterben); KI trainiert in der Sparphase vor einem Aufstieg wenig. Messskripte liegen im Scratchpad (bal/bal.js, `EPS` überschreibt die Aufstiegskosten).

## Paket B (19.10.): Delfin, Wal, weiche Ufer, pendelnde Rehe
- [x] B1 Delfin: im ganzen Repo (`models/`, `models/archiv/`, CREDITS.md) gibt es kein Delfin- oder Wal-Modell (nur Fische, Hai). Kein Selbstbau; Delfin bleibt Tuna/Schwertfisch (Grösse 2,3), Wal bleibt getönter Hai. Bitte David um ein Paket mit Delfin/Wal (z. B. Quaternius „Ultimate Animals“ Meer).
- [x] B2 Wal 12 statt 6,5 Einheiten (ca. 5x Delfin, ca. 2,5x Fischerboot), Delfin 2,3; Vorkommen `whale` r 24 (vorher 16), Abstand `GAP.whale` 30. Wale pro Karte (S/L Küste): 6/14 statt 6/16; Fjord L und Seen L 0 statt 2 (tiefes Wasser fehlt).
- [x] B3 Ufer: Ursache = Land/Wasser-Anteil nur einmal 3x3 geglättet und bilinear abgetastet (eckige Facetten), Schaum aus 20-px-Quadraten. Jetzt `shoreField` (2 Glättungen) + `shoreAt` (bikubisch) in nav.js, benutzt von `r3Map` (Gelände, Übergang .40–.60), Schaum (`r3.foam`) und `renderBg`-Maske. Nur Darstellung, TERR unverändert. Kosten: ca. 75 ms je Maske (L), `r3Map` 0,6 s einmalig.
- [x] B4 Rehe/Tiere: Ursache 1: Wanderziele lagen in der Scheuchzone von Gebäuden/Einheiten -> Flucht, Wandern, Flucht. Ursache 2: Flucht wählte bei Blockade zufällige Richtung (Eckenpendeln). Ursache 3: Krokodil/Wolf jagten ein unerreichbares Ziel am Ufer endlos (bis 171 Richtungswechsel in 3 min). Fix in `updAnimal`: Ziele ausserhalb Scheuchzone (`a.nb`), Flucht-Hysterese 1,35x, Fluchtrichtung nur alle 1,2 s über begehbares Land, Jagd gibt nach 3 s ohne Annäherung auf (`noChase` 10 s). Test (3 Karten, 3 min, Arbeiter neben 6 Rehen): Rehe-Richtungswechsel 11/5/7 -> 1/3/0, Krokodil 171 -> 0, Wolf 21 -> 10 (Küste).
## Davids Rückmeldungen – Paket C (Arbeiter-Animationen)
- [x] C1 Last schwebt: Rucksack (aus Adventurer) am Rücken + echte Ladung obenauf (Holz, Erz, Gold, Nahrung), alle Körper/Zeitalter geprüft.
- [x] C2 Lore-Schieber: Füsse nach innen = Schienbein-Beugung der Reiter wurde auch auf Schieber angewandt; behoben.
- [x] C3 Tempo 5×: Hiebe/Geräusche je Echtzeitsekunde 0,8 / 2,4 / 4,0 bei 1× / 3× / 5× (vorher Dehnung ×N, Clips max. 3×).

## Paket D (19.10.): Startbild, Raum ohne Verzerrung, Tischlayout
- [x] D1 Ladebild = Spielkarton (CSS/SVG): Deckel mit Titelbild-Platz (`images/titel.jpg|png|webp`, sonst gemalte Platzhalter-Grafik), Fortschritt mit Aufbau-Meldungen, wartet auf Modelle UND Raum samt Foto (kein halb geladenes Bild), Klick hebt den Deckel ab. Hauptmenü zeigt das Titelbild klein (ab 760 px Höhe) und verschiebt den Raum nach rechts. Austausch: `images/LIESMICH.md`.
- [x] D2 Rundum-Foto unverzerrt: Kugelkappe um Augenhöhe (Foto 1:1, leicht weichgezeichnet, 2048 px) bis 14° unter dem Horizont, darunter ein echter Boden (Parkett aus Canvas, weicher Rand). Die Kappe braucht eigene UV (`v` wie bei voller Kugel), sonst wird das Foto gestreckt. `OPT.room`/`OPT.roomStudio` funktionieren weiter (Studio-Bild nicht neu geprüft).
- [x] D3 Layout: Stifte raus, Sofa links schräg zum Tisch, Stuhl zum Tisch gerückt, Teppich unter Tisch/Stuhl (nur Farben), Kontaktschatten unter allen Möbeln/Gegenständen (`blob`), Öllampen-Glas durchsichtig (war schwarzer Stab), Menü-Kamera pendelt ±35° vor dem Tisch (statt Vollkreis durchs Sofa). Brettrahmen 14 breit mit Schriftzug „EPOCHENKRIEG“ und Rauten.
- Ladezeit: Foto 4096→2048 px als Canvas (weniger Grafikspeicher), Parkett/Teppich aus Code (keine neuen Bilddateien).

## Paket E (19.10.): Davids Rückmeldungen
- [x] E1 Mauern/Tore auch im seichten Wasser (`wallSpot` in state.js: Land oder TERR 1; tiefes Wasser/Fels weiter gesperrt; im Wasser keine Steilheits-Prüfung, Fischschwärme stören nicht). Getestet: Mauerlinie über Ufer ins Flache, blockiert `navDyn`, Weg drumherum gefunden, Hafenregel unverändert.
- [x] E2 Krokodile: `ANIMALS.croc` agg 105→70, leash 210→150, Schaden 24→15, Abklingzeit 1,2→1,6 s, `ambush:{bites:2,rest:55,grp:3}` (greift keine Gruppe ab 3 Einheiten an, höchstens 2 Bisse, dann `a.rest` 55 s Rückzug; verletzt <40 % taucht es ab). Test (12 Krokodile × 4 Arbeiter am Ufer, 15 min, 3 Karten): getötete Arbeiter 127 → 5 von 144.
- [x] E3 „Truppen denken mit“ (`guardTick` in sim.js, Schalter `guardOn`/`ek-guard`, Standard an, nur Einzelspieler wie `frontLine`): freie Truppen (Leerlauf, kein `manual`) bekämpfen gefährliche Wildtiere (agg ≥ 110 oder jagend; keine Rehe, Krokodile, friedliche Dinos) im Umkreis 300 px um Arbeiter/Wirtschaftsgebäude, höchstens 8 Einheiten, nur bei klarer Überlegenheit (Leben×Schaden ≥ 1,3×), Leine 520 px/60 s (`u.gd`); Rundgänge: höchstens 2 Truppen gleichzeitig (`u.pat`), danach holt sie `frontLine` zurück. Kosten ca. 0 ms (0,91 vs 0,96 ms je Schritt).
- [x] E4 Heiler: `healAura` neu: höchstens `HEAL_N`=3 Ziele je Heiler (die Verletztesten), im Kampf (Treffer < 4 s, `u.lh`) nur 40 %, mehrere Heiler = stärkster Wert + 25 % der übrigen, Heilrate 2,2 → 1,8, Faktor (1+maxHp/400). Gesamtheilung bei 10 Verwundeten: 1 Heiler 37,8 → 7,3 hp/s (Kampf 2,9), 4 Heiler 151 → 12,9 hp/s.

## Davids Wünsche vom 20.10. (Reihenfolge, immer nur EIN Agent)
- [x] **Paket H – Freie Kamera** (erledigt 20.10., siehe CLAUDE.md „Freie Kamera“; offen: Figuren-LOD/Weather bei flachem Blick global nach Bildmitte, Minikarte zeigt Sichtfeld als offenes Dreieck bei flachem Blick) (wichtig, Grundlage für First Person): Kamera drehen (Yaw), neigen (Pitch), Höhe/Zoom; rundum schauen; im Spielzimmer sieht man bei tiefem Blickwinkel Tisch, Brettrand und Raum. Maus/Tasten/Touch, Tasten änderbar (`KEYDEF`), Zurücksetzen-Taste. Alles, was Bildschirm↔Spiel umrechnet, muss mitdrehen (`toWorld`, `scr`, Auswahlrahmen, Minikarte-Sichtfeld, `clampCam`, Randscrollen, Schatten, LOD).
- [x] **Paket I – Intro-Animation (erledigt 21.10., siehe CLAUDE.md „Intro“):** Beim Start ist das Titelbild die Spielverpackung; sie öffnet sich (Deckel hebt ab), dann lädt das Vorzimmer = Spielzimmer, auf dem Tisch liegt das Brettspiel. (Grundlage: Ladebild-Karton `splash`, `mm-opening`, `ROOM.fly` aus Paket D; Übergang flüssiger und filmischer machen.)
- [x] **Paket J – First Person (Phase 1 fertig, 21.10.):** `js/ego.js`: Taste V (änderbar, `KEYDEF` `ego`) oder Knopf „Ego-Ansicht“ im Info-Feld; eigene Einheit/Gebäude/sichtbares Tier, Maus dreht (Zeiger-Sperre, sonst Ziehen), Mausrad = Zoom (bis ×6, v.a. Wachturm), Esc/V beendet. Offen: Phase 2 (Fernrohr-Optik, Figur steuern), Raumfoto/Brettrand sichtbar beim Blick über den Kartenrand, Knopf steht bei Arbeitern am Ende der Liste. Ursprünglicher Text: Auf Einheit, Gebäude oder Tier klicken → Ego-Sicht. Wachturm: Fernrohr mit Zoom zum Weitblick. Stufen: (1) Ansehen, (2) Umschauen mit Fernrohr, (3) später eine Figur selbst steuern (Toy-Soldiers-Idee, siehe ROADMAP). In Ego-Sicht/gedrehter Kamera noch mehr vom Raum und Spielbrettrand sehen.
- [x] **Paket K – Musik (21.10. erledigt, siehe CLAUDE.md):** Davids acht Stücke in `music/` (Lobby, Kampf, Vivaldi Vier Jahreszeiten, Mittelalter-Tanz, Color-Tribe) den Zeitaltern/Menü/Kampf zuordnen (`PIECES`, `SND.setEpoch`, `pieceWar`, Überblenden), Lautstärke angleichen, Lizenzen in `music/CREDITS.md` prüfen.
- [ ] **Paket L – Oberfläche auf neues Niveau (Konzept fertig, wartet auf Davids Wahl A oder B, siehe `UI-KONZEPT.md` und `tools/ui-konzept/a.html`, `b.html`; Empfehlung B in zwei Schritten):** Die ganze Benutzeroberfläche wirkt zu alt: moderner, zukunftsorientiert, mehr Transparenz, Platz besser nutzen. Erst Konzept (Skizzen/Varianten), dann Umbau von oben/unten Leiste, Konsole, Info-Feld, Menüs, Berater.
- [x] **R3 Gebäude-Durchsicht (21.10., Wachturm korrigiert; R3b 21.10. erledigt: Hauptlager Ep.5 `scale` 1,45 (4,69 → 6,8 hoch), Haus Ep.5 `scale` 1,25 (2,57 → 3,21), Lager Ep.5/6 `scale` 1,5/1,6 (1,77 → 2,66/2,83, Ep.6 graue Farbtabelle), Kaserne Ep.6 = Large Building 1bt4 `fit` .65 mit Zelt/Jeep/Truck/Puppe (2,94 → 6,24; Zelte waren zu breit/dunkel); Messfalle: Messung muss ~30 s auf das Laden warten, sonst zeigt `buildBld` Code-Modelle; Markt ist niedrig, weil Stände flach sind (Höhe = Figuren/Riesenrad), nicht geändert; Mine/Farm/Markt Ep.0–2 sind nicht baubar (`ep` in BLDS), Rückfall egal; Rest offen war: Hauptlager Ep.5 niedriger als Ep.4 (4,7 statt 6,6), Haus/Lager/Kaserne Ep.6 uneinheitlich, Markt Ep.3+ flach (1,5 statt 4,9), Kaserne Ep.6 = Zelte klein; Town Center/VillagePack liegen in models/neu bzw. archiv, Town Center Ep.0 schon im Einsatz, VillagePack nur als .rar, nicht eingesetzt)** (David 20.10.: Wachturm in der Renaissance ist kleiner als der davor → Größenverhältnisse aller Gebäude über die Zeitalter prüfen, Wachturm zuerst: Höhe/Grundfläche je Zeitalter messen, jeder Nachfolger mindestens so groß wie der Vorgänger; auch Hauptlager, Kaserne, Haus, Hafen, Markt) (mit Town Center, VillagePack von David; Häuser-Paket House_01–20 gestrichen, Farbbild fehlt).
- Entschieden: Hai greift nicht an (Deko). Häuser-Paket gestrichen.

## Paket M – Rückmeldung zu Fischen, KI und Berater (David 20.10., direkt nach H)
- [x] **M1 Fische:** schwimmen schräg (Neigung/`roll`/Pitch prüfen, waagrecht schwimmen), Tempo viel langsamer; beim Anklicken ein komischer weißer Rahmen/Balken (Auswahlring/Auswahlkasten für Fischschwärme entfernen oder durch dezenten Ring ersetzen); Fische sind unter Wasser oft kaum sichtbar → Wasser über Fischen transparenter/Fische heller oder größer, damit man sie sieht (Wasser-Material `r3` prüfen).
- [x] **M2 Fischerboote:** Füße der Fischer im Boot wieder verbuggt (Sitz/`rider.seat`, Beinhaltung, vgl. R2 Fischerboot).
- [x] **M3 KI-Wirtschaft Fischen:** KI soll primär nicht mit Arbeitern selbst fischen, sondern zuerst Fischerboote/Fischer ausbilden (Hafen); falls Arbeiter-Fischen attraktiver ist (Rate/Kosten messen), Regel anpassen (`aiTick`, `shoreOf`, `SHORE_RATE`).
- [x] **M4 Berater-Upgrades:** Der Berater upgradet immer alles, auch wenn man gerade angegriffen wird (Upgrades lassen Einheiten ruhen!). Regel: bei Angriff/Gefahr keine Upgrades vorschlagen/auslösen (`advRules`, `startUpgrade`, Auto-Modus).
- [x] **M5 Rammböcke:** KI-Berater baut viel zu viele Rammböcke (Regel `cn:siege` u. a.); prüfen, ob Rammböcke zu stark sind (`hit()` Belagerung ×1,4, Kosten, Zeit), Mischung/Obergrenze und Werte ausbalancieren, mit Messung (Berater-Auto, mehrere Seeds; Messfalle Siege-Regel beachten).

## Warteschlange (David, 21.10.)
- Nach Ego-Phase 2: **Paket L2 = Oberfläche nach Entwurf B** (siehe `UI-KONZEPT.md`; in zwei Schritten: 1. Glas-Material + Berater-Sprechblase, 2. Layout B). Entwurf A bleibt als Ansicht gespeichert: `tools/ui-konzept/a.html` + Bilder `tools/ui-konzept/bilder/a-*` (spaeter noch aenderbar).
- [x] (21.10., NICHTS EINGEBAUT, Begründung: chinesisch-asiatischer Cartoon-Stil mit knallrot/türkis passt zu keinem europäischen Zeitalter, Lizenz unbekannt; geeignet höchstens für eine spätere Nation Asien) Danach **Paket V = VillagePack** (`models/neu/VillagePack.rar` entpacken, Haeuser neben Nachbarn im Spiel pruefen, nur einsetzen wenn passend; CLAUDE.md-Regeln: nie blind einbauen).
- [x] **Paket J Phase 2 (21.10.):** Fernrohr-Maske (`#egohud.scope`, runde Maske, feiner Rand, Fadenkreuz) im Wachturm und ab Zoom ×2,2; Steuern eigener Einheiten (WASD relativ zum Blick, Klick/Leertaste = anvisiertes Ziel angreifen/sammeln, über `command`/`NET.tgtSet`, im Mehrspieler normaler `cmd`); Raum-Foto im Ego-Modus aus (Himmelsfarbe), Ego-Knopf jetzt vorn in der Liste. Offen: Start-Blickrichtung `e.fa` nur beim Arbeiter geprüft, Fahrzeuge/Schiffe nicht; Ziel-Anvisieren grob (Winkel), kein Strahltest gegen Gelände; Mehrspieler nur per Code geprüft, nicht mit zwei Spielern.
- [x] **Paket L2 (21.10.): Oberfläche nach Entwurf B umgesetzt** (beide Etappen). Neue Datei `css/ui2.css` (gilt nur mit `body.ui2`), Schalter Menü > Spiel > „Oberfläche: Neu / Klassisch“ (`OPT.uiClassic`, `ui2()`/`uiApply()` in settings.js; „Klassisch“ = alte Konsole unverändert). Etappe 1 Material: durchscheinendes Glas ohne `backdrop-filter` (nur Farbverlauf aus `--tint` + dünner Rand in `--fr`, keine Schmuckrahmen), Berater = Pille/Sprechblase (aufklappbar, runde ✓/✕ = Y/X, Auto-Schalter bleibt), Pause-Menü und Zeitalter-Baum mit schlankem Rand. Etappe 2 Layout: Zeitalter + Rohstoffe als Chips oben links, runde Knöpfe oben rechts (Arbeiter mit roter Zahl, Baum, Pause, Tempo, Menü; Symbole per CSS), Seitenleiste rechts nur bei Auswahl (`body.has-sel`; Kopf mit echtem Modellbild, Zustand, Warteschlange, Aktionszeilen mit ICON3-Bild/Kosten/Tastenschild aus `KEYDEF`, danach lange Upgrade-/Technologielisten; scrollt), Minikarte klein unten links, Berater darüber. Schmale Fenster (<640 px): Knöpfe in eigener Zeile, Seitenleiste wird Schublade unten. Technik: `#side` umschliesst `#info`/`#acts` (klassisch `display:contents`), `#panel` ist neu `display:contents`; `uiInsets` kennt jetzt rechts (`UIINS.r`) und Schublade unten, `freeCenter`/`clampCam` rechnen mit `VW-u.r`; `--btnsW` (Breite der Knöpfe) und `--topH` werden per rAF gesetzt (sonst „ResizeObserver loop“-Fehler); Tooltips gehen in der Seitenleiste nach links. Test (Playwright, Software-GL): Auswahl/Bauen/Rechtsklick/Minikarte/Klick in Seitenleiste/Chips, Y-Taste, Menü-Schalter, Kamerarand 4 Seiten, 1280/1920/390 px, Konsole ohne Fehler. Bilder `tools/ui-konzept/bilder/l2-*.jpg`.
  - Offen: Hauptlager-Technologien sind eine lange Spalte (scrollt, kein Reiter „Technologien“); Mehrspieler-Anzeigen (`#netbadge` links neben den Knöpfen) nur mit künstlich eingeblendetem Abzeichen geprüft, nicht in einer echten Partie; Mobil-Hochformat: Minikarte/Berater verschwinden solange etwas gewählt ist; Arbeiter-Symbol im Knopf kommt aus `ICON3.thing` (bei spät geladenen Modellen kurz leer); Leistung nicht gemessen (Software-GL), aber kein `backdrop-filter` mehr im neuen Look; Hell/Dunkel-Lesbarkeit nur nach Augenmass (Winter/Schnee-Karte noch ansehen).

- [x] **Paket N1 (21.10.): Gebäude-Mängel R3b-Rest.** Manifest: Hauptlager Ep.5 `scale` 1,1 (13,7×13,4 → 12,4×10,8, Höhe 6,6 wie Ep.4) + echte Windmühle (`archiv/Windmill.glb`, h 6,6) daneben (Variante mit Mühle hinter dem Dach sah verklebt aus, verworfen); Haus Ep.5 `scale` 1,1 (5,3 → 4,6 breit); Lager Ep.5/6 `scale` 1,1/1,15 (6,7/7,2 → 4,9/5,2 breit, Ep.4 4,7; Höhe 1,9/2,0 bleibt niedriger, weil Breite und Höhe nur gemeinsam skalieren). Markt: Versuch mit `archiv/Market Stand.glb` (h 4,2) verdeckte die Stände und wurde verworfen; Markt Ep.3/4 bleibt flach (Stände), Ep.5/6 hat das Riesenrad. Bilder `qa/bilder/n1-*.jpg`. Offen: Hauptlager Ep.5 bleibt das schwächste Modell (zwei Fachwerkhäuser); bessere Vorlage nur mit neuem Paket.

## Paket L3 (21.10.): Liquid Glass, Prüfung der Oberfläche
- Geprüft (Playwright, Software-GL): Wüste/Winter/Wasser, 1280x720, 1920x1080, 800x600, 390x844: nichts überlappt, Seitenleiste scrollt (Technologien erreichbar), Klick auf Aktion und Minikarte funktioniert, Konsole ohne Fehler.
- Behoben: Ego-Zielwahl ohne Sichttest (jetzt `EGO.clear`), Absturz von `EGO.aim` bei Gebäuden (`UNITS[e.type]` undefiniert), `#netbadge` konnte bei 641-900 px die Chips überdecken.
- Frame-Zeit mit/ohne Oberfläche und mit leichtem `backdrop-filter` auf Chips/Minikarte: in Software-GL nicht aussagekräftig (~2 s je Bild, alle Varianten gleich); Entscheidung bleibt: kein Blur, nur Verläufe/Innenglanz.
- Offen: Nationen-Auswahl zeigt fehlende Einheiten-Bilder, solange Modelle nachladen; Mehrspieler-Anzeigen/`tfire` nicht mit zwei Spielern getestet; Ego-Blickrichtung Boot passt rechnerisch (yaw = pi/2 - fa), Tiere nur per Code.

## Paket N2: Loren (21.10.)
Messskript (nicht im Repo): 8 Bergleute Stufe 5 in einer Mine, 20 min `step(.04)` mit `__norender`. Eisen 336 px vom Lager: 1 Lore 240–300/min (Lore ist die Bremse, Minenlager 13 % voll), 2 Loren 480–540/min. Stein 188 px: 570/min ohne Rückstau. Gold: auf dem Testkarte kein Vorkommen nah. Zweite/dritte Lore: Knopf (Holz 100, Eisen 40), Berater-Vorschlag, KI-Kauf bei vollem Lager.

## Team-Markierung (21.10.)
Zwei InstancedMesh (max. 1600 je Team-Art), Matrizen pro Bild neu geschrieben (billig, 2 Zeichenaufrufe statt je Einheit einer). Bildrate nicht gemessen (Software-GL).

## Ego Phase 3 (21.10.)
- [x] Ego: HUD (eigenes Leben, Ziel mit Name/Leben/Entfernung, roter Punkt in Reichweite), Nachlade-Balken für Einheiten, Schlag/Schuss per Klick/Leertaste (`unitStrike`, Mehrspieler `ufire`), Kopf-Wippen (Option), Rückstoß, Mausempfindlichkeit-Regler, Tab/Umschalt+Tab = nächste/vorherige eigene Einheit, Hinweiszeile, Tod = Ansicht endet sanft am Todesort, Tier außer Sicht = Meldung. Getestet (Software-GL): Bogenschütze trifft Speerträger (Leben 115 -> 101,7, zweiter Schuss während Nachladen abgewiesen), Wippen/Wechsel/Tod/Flugzeug ohne Konsolenfehler.
- Offen: Klick per Maus in Playwright löst durch den Zeigerfang einen Blick-Sprung aus (nur Testumgebung), deshalb Schlag per `EGO.act()` geprüft; Mehrspieler `ufire` nur per Code, nicht mit zwei Spielern; Schwung-Animation sieht nur der Gegner (eigene Figur ist ausgeblendet), in Ego gibt es Rückstoß + Blitz; Flugzeug-Ego erst nach Start in der Luft gut (am Boden Gras im Bild).
- [x] Lore-Knopf: Schienen-Text („2 Loren statt 1, mit Zusatz-Loren höchstens 3“) stimmt jetzt mit `cartWant`.
- [x] Gegner-Typ „Zufall“, Berater-Regel Gold kaufen (siehe CLAUDE.md).

## Paket E4 (21.10.)
- Ego: Flackern (Balken nur in jedem 2.-3. Bild) kam vom 2D-`hpBar` der eigenen Figur; GL-Bild war sauber. Kosten der Änderung: keine (eine Bedingung in `scr`). Turm-`cd` im Stand: ein Zahlenfeld je Turm, ändert sich nur beim Nachladen (Delta-freundlich).

## Download-/Ladegröße (Paket D5, 21.10.)
Messung: Playwright, `index.html` über lokalen Server, Netzwerk-Log aller Antworten (Rohgröße; gzip = `zlib.gzipSync` je Datei als Näherung für GitHub Pages). Die Web-Version lädt nur, was der Code anfordert (nicht alles aus dem Repo); unbenutzte Ordner (`models/archiv` ausser Beiwerk, `models/fbx`, Wurzel-FBX/ZIP, `T_TownCenter_*.png`, `VillagePack.rar`, Roh-EXR/HDR) kosten den Spieler nichts, nur das Repo (~120 MB Pack).
- Vorher: bis zum Menü wurden **alle** Manifest-Modelle geladen (`EKMODELS.init`): 251 Dateien, **50,3 MB roh / 17,6 MB gzip** (nur Modelle), dazu Spielzimmer (Raum-Modelle ~23 MB roh, davon ~16 MB JPG-Texturen in fast verlustfreier Qualität) und Foto 1,3 MB. Gesamt bis Menü im Browser-Log (Software-GL, langsam): 257 Dateien, 51,9 MB roh / 19,0 MB gzip nach 100 s und noch nicht fertig.
- Grösste Einzeldateien: `UAL1_Standard.glb` 7,6 MB (Animationsbibliothek, nötig), Adventurer 1,9, Farmer 1,4, Panzer ~1 MB je (4 Stück), `titel.jpg` 0,23, three.min.js 0,67, gltf-bundle 0,12. Musik (lazy, nur beim Abspielen): 8 Stücke à 256 kbps = 45 MB.
- Massnahme 1, gestaffeltes Laden (`gltfmodels.js` `init`): Dateien, die nur Einträge ab Zeitalter 2 nutzen (frühestes Zeitalter aus `epochs` bzw. `UNITS/BLDS[..].ep`, Beiwerk erbt vom Eintrag; Tiere, Natur, Meer, Symbole, Arbeitswerkzeuge immer sofort), laden nach dem Spielzimmer (spätestens nach 25 s) im Hintergrund, Zeitalter für Zeitalter (`EKMODELS.loadAll()`, `EKMODELS.full`, `lateN`). Bis zum Menü: **160 Dateien, 25,1 MB roh / 10,2 MB gzip** (−50 % roh, −42 % gzip), 92 Dateien (25 MB roh) kommen danach. Bis dahin greift der vorhandene Rückfall (`entryFor` filtert nach geladenen Dateien: Einheiten nehmen das nächste geladene Zeitalter, Gebäude kurz Code-Modell), `tag()` ändert sich beim Laden und baut die Figur neu; Symbole werden nach jeder Stufe neu gemalt. Mit `window.__eagerModels=true` lädt wieder alles vorab (für Tests/Messen späterer Zeitalter oder `await EKMODELS.loadAll()`).
- Massnahme 2, Raum-Texturen (`models/raum/**/*.jpg`, 1k): waren mit JPEG-Qualität 100 gespeichert (Poly Haven). Neu Qualität 92, progressive, Normal-/ARM-Karten ohne Farbunterabtastung. 15,2 MB → 7,0 MB (−8,1 MB), PSNR je Textur 38–57 dB (≥ 40 dB bei fast allen), nur Dateien mit Qualität 100 angefasst, Auflösung gleich.
- Massnahme 3, Musik: alle 8 mp3 von 256 auf 160 kbps (libmp3lame), 45,3 → 29 MB, Lautstärke ±0,4 dB gleich (`MGAIN` unverändert), Lobby-Stück 3,7 → 2,3 MB.
- Nicht gemacht: Meshopt/Draco (Decoder fehlt im Bundle, Modelle sind überwiegend Geometrie/Animation, Texturen schon klein: Quantisierung bräuchte gltfpack), `UAL1_Standard.glb` (nötig und ohne Bilder), Foto 4K (JPG 1,3 MB, Auflösung wird im Raum gebraucht), `titel.jpg` (0,23 MB).
- Messung im Browser mit `__norender` (ohne Software-GL-Last): Modelle bereit nach 11,6 s (vorher 12,1 s – lokal zählt das Parsen, nicht die Bytes; im Netz zählen die Bytes: bei 20 Mbit/s ≈ 6,8 s gegen 11,7 s nur für die Modelle), alles geladen nach 39 s. Konsole ohne Fehler, `modell-luecken.js` weiter nur cannon/trench/derrick.

## Berater-Rohstoffberge und KI-Mitte (21.10.)
- Ursache Rohstoffberge: `surplus:` greift nur, wenn ein ANDERER Rohstoff knapp ist (sonst nichts umzustellen); ab Zeitalter 3 liegt aber alles hoch, und Truppen waren der einzige Verbraucher. Dort bremste `advAnswer` die Regel `army` nach jeder Annahme 12 s lang (`advisor.ignore`) = höchstens ~5 Truppen/min trotz freier Kaserne. Dazu die Bevölkerungsgrenze `POPMAX` 100 (54 Arbeiter + Heer): Nahrung/Holz lassen sich darüber hinaus kaum ausgeben.
- Änderung (advisor.js, `advAnswer`): nach angenommenem `army` nur 2 s Pause statt 12 s. Messung Berater-Auto, Normal, M, 5 Läufe (Küste 11/14, Festland 12/13/15; Läufe streuen auch bei gleichem Seed): Heer bei Minute 30 Mittel 27,8 -> 33,6 (24/17/33/33/32 -> 38/26/36/35/33); Siege bis Minute 35: 2 von 5 (32, 33) -> 3 von 5 (30, 34, 35), frühester Sieg Minute 30 (nicht unter 20). Nahrung/Holz bleiben hoch (Minute 35 Nahrung 2000-6700): nur gemildert (Rest: `POPMAX`, Aufstieg dauert 150 s, Eisen als Engpass).
- KI-Mitte: kein Fehler, sondern gewollte Bremse `AI_MINT` x `DIFF.normal.pace` 1,3: Zeitalter 1 frühestens Minute 13, Zeitalter 2 frühestens 27,3 (1260 s x 1,3). Nicht geändert, weil Tempo/Siegzeit des Beraters daran hängen (Entscheidung für David: `pace` 1,3 -> 1,15 zöge Zeitalter 2 auf Minute 24, ungemessen). Heer-Einbrüche kommen von Angriffswellen.
- (21.10.) Code-Rückfall-Figuren von Einheiten ab Stufe 2 bleiben unsichtbar, bis `EKMODELS.full` (Spät-Modelle geladen); danach kommt das echte Modell. Ein Flugzeug erscheint beim sehr frühen Erreichen von Zeitalter 6 (vor Ende des Hintergrundladens) kurz gar nicht statt als grünes Code-Modell.

## Meshopt-Komprimierung der Modelle (21.10.)
- Der Decoder ist schon im Bundle (`EKGLTF.MeshoptDecoder`) und in `gltfmodels.js` eingetragen. Modelle jetzt mit `tools/meshopt/pack.mjs` (gltf-transform: reorder + Quantisierung + `EXT_meshopt_compression`, Methode QUANTIZE) verkleinert. Nur im Manifest benutzte Dateien: 213 von 231; die 18 Kenney-Kit-Dateien mit externer `Textures/colormap.png` blieben unverändert (zusammen ca. 1 MB).
- Benutzte Modelle: 48,8 MB -> 21,9 MB (-26,9 MB Download). Ganzer Ordner `models/` 407,8 -> 381,0 MB (Archiv unverändert). Beispiele: UAL1_Standard 7,6 -> 4,3 MB (Animationsdaten, wenig Gewinn), Adventurer 1,9 -> 0,73 MB.
- Wichtig: Positionen von Skin-Meshes werden NICHT quantisiert (Figuren waren sonst verzerrt/unsichtbar, im Kontaktbogen gesehen), nur Normalen/UV/Gewichte. Statische Meshes: 16 Bit Position, 10 Bit Normalen, 14 Bit UV. `gltfpack` getestet und verworfen: benennt Meshes/Knoten um (`Adventurer_Body_1` -> `mesh_0`) und resampelt Animationen (Dauer +3 %), das Manifest (`hide`, `mesh:'^Helmet'`) hängt an den Namen.
- Prüfung (Playwright): 213 Dateien alt/neu geladen, Knoten-, Mesh-, Knochen-, Material-, Animationsnamen, Dauer und Dreieckszahl identisch; Kontaktbogen vorher/nachher 63 von 800 000 Pixeln verschieden (`qa/bilder/meshopt-kontakt-*.png`); Spielszene (Einheiten, Reiter, Panzer, Hauptlager, Zeitalter 5) ohne Konsolenfehler (`qa/bilder/meshopt-spiel-nachher.png`). `tools/contact-sheet.html` setzt jetzt den Meshopt-Decoder.
- Nicht geprüft: Desktop-App (WASM im Decoder ist eingebettet), Mehrspieler (unberührt).

- Meshopt-Korrektur (24.10.): Komprimierte statische Modelle (Bäume, Büsche, Felsen, Gebäude, Props) zeigten im Spiel falsche Büsche/Bäume (Position quantisiert, Knoten-Transform wird beim Instanzieren nicht beachtet). Alle Dateien ohne Skelett (175) sind wieder die unkomprimierten Originale; nur Figuren mit Skelett (38) bleiben komprimiert. Lehre: Meshopt-Packen nur mit unquantisierter Position oder nach Test der Instanz-Pfade (`nodeParts`, `r3Multi`).

## Wolkenschatten (24.10.)
- `CLOUD` (render3d.js): Terrain-Material mischt per `onBeforeCompile` einen langsam ziehenden Rauschschatten ein (Wellenlänge ~300 px, Tempo ~2 px/s, bis ca. 20 % dunkler, weiche Kanten). Option `OPT.cloudShade` (Menü Grafik, DE/EN), aus bei Grafik Niedrig (`GQ[..].cloud`), Sparmodus, `R3.slow` und Eis. Nur Optik, keine Zusatzgeometrie: Aufrufe 259–261 / Dreiecke 390 000 mit und ohne (Software-GL, FPS-Wert dort nicht aussagekräftig, ~0,5). Wellen: Verschiebung mit sanftem Pendeln (`sin`), keine neue Ebene (zusätzliche Glanz-Ebene getestet, im Bild nicht erkennbar besser, deshalb weggelassen).
- Bilder: scratchpad `c0.png` (aus) / `c1.png` (an).

## Marine messen (24.10.)
- Duell (kostengleiche Gruppen, offenes Tiefwasser, `step(.04)`): Panzerschiff war zu schwach: 3 Panzerschiffe (Wert ~890) verloren gegen 8 Galeonen und gegen 11 Kriegsschiffe (alle Zeitalter 5) mit 5-6 Überlebenden; Kriegsschiff 6x gegen Galeone 4x (gleiche Kosten): Galeone gewinnt ohne Verlust (gewollt, höhere Stufe). Änderung `ironclad`: hp 620->780, atk 44->58, Kosten Gold 90->70, Holz 260->220, Eisen 240->200. Danach: 3 Panzerschiffe (Z5) schlagen 8 Galeonen (Z3) und liegen gegen 8 Galeonen/11 Kriegsschiffe desselben Zeitalters etwa gleichauf (4 Überlebende von 8 bzw. 11).
- Schiff gegen Küstenturm: Gebäude nehmen von Fernkämpfern nur x.1 Schaden (`hit`), deshalb braucht man ~6 Kriegsschiffe, 4 Galeonen oder 3 Panzerschiffe für einen Turm (halbe Flotte geht verloren), 2-3 Schiffe verlieren. Nicht geändert (Turm ist so gewollt stark).
- KI-Marine (Küste M Seeds 11/23, Inselreich 37, 30 min, Berater-Auto als Gegner): Hafen steht ab Minute ~8, 3-5 Boote, 2 Kriegsschiffe um Minute 20, 3 ab Minute 30, keines bleibt am Kartenrand hängen (0 von allen). Auf Inselreich griff die KI mit 2 Schiffen an und verlor 12 von 13 Schiffen (Kosten ~3000). Änderung `ai.js`: Flottenangriff erst ab 3 Schiffen; danach 0 Verluste bis Minute 30 (Angriff beginnt später).
- Boote und unerreichbare Fischgründe: Küste M Seed 11, 30 min: 2610 Wegsuchen von Booten, davon 708 ohne Weg (1162 ms, 1,6 ms je) auf nur 32 verschiedene Ziele (je ~22 Mal). Pause war nur 40 s je Boot. Änderung `sim.js`: Fehlschlag sperrt den Schwarm für das ganze Team (`G.nbad`, Pause 60 s, verdoppelt sich bis 480 s). Danach 1520 Wegsuchen, 129 Fehlschläge (359 ms), Gesamtzeit der Bootsuche 1271 -> 409 ms.
- Berater-Auto gegen KI, Küste M Seeds 3/5/8, 40 min: vorher alle offen (Z 4/2 je Seite), nachher offen (Z 5/2, 4/2, 4/2): keine Verschiebung.

## KI-Taktik Schwer (Paket KI-T)
- `aiTick` (nur `diff==='schwer'`, im Angriffsast): Einheiten unter 25 % Leben ziehen sich 14 s zum Hauptlager zurück (`m.rt`, nur wenn das Heer > 3 ist); alle 3 s sucht die Welle gesehene Sammler (`ai.seen`, `UNITS.gather`) bis 420 px um den Heerschwerpunkt und schickt 60 % der Kämpfer darauf. Normal/Leicht ohne Änderung (Code-Wächter).
- Messung Berater-Auto (Selbstspiel, Schwer, Küste 3 / Festland 5 / Pass 7, M, Zufall fest): Zeit bis zur Niederlage des Beraters vorher 1431/1587/1440 s, nachher 1683/943/1743 s; Verluste KI/Berater vorher 114/129, 147/121, 122/81, nachher 165/153, 56/57, 196/128 (Summe 417 gegen 338 statt 383 gegen 331). Streuung gross, kein klarer Gewinn oder Schaden; Berater-Auto verliert auf Schwer wie schon immer. Messfalle: `advisorTick()` im Skript selbst aufrufen (alle 0,5 s), `step()` tut es nicht.
- Gebirgspass mit Wildtieren: 12 Läufe (S/M/L x 4 Seeds), keine Gruppe hing fest, keine Änderung.

- Moves (24.10.): Angriffs-Clip im Takt zum Schaden (`ATK_IMPACT`, Ausholen vor dem Schlag über `e.cd`, Nachschwung nach `e.swing`), Treffer-Zucken und Rückstoss auch für glTF-Figuren (vorher nie ausgelöst, `o.fl` fehlte), Angriffsmarsch = Jog-Clip, Idle/Gehen starten je Figur an anderer Clip-Stelle. Rechenaufwand: nur Zeitsetzen am Clip, WPOSE unberührt. Bilder qa/bilder/moves-*.png (Software-GL, Zeitlupe).

- Balancing Truppen Zeitalter 3-6 (24.10., Messung headless, Skripte nicht im Repo): Duelle aller Truppenlinien je Zeitalter in kostengleichen Gruppen (Budget 3000, Wert = Nahrung+Holz+1,2 Stein+1,5 Eisen+3 Gold+3 Öl; Land, `step(.04)`), dazu Belagerung gegen Hauptgebäude (Kaserne/Turm). Wert = mittlerer Lebensanteil-Vorsprung gegen alle anderen. Gegenstücke funktionieren (Speer schlägt Ritter -0,53, Ritter jagt Schützen/Berittene +0,8). Auffällig und geändert (vorher -> nachher, Rang-Mittel):
  - Berittener Schütze `hbow` (205): Z3 -0,65 -> 0,04, Z4 -0,58 (ohne Änderung des Gegners ähnlich), Z5 -0,58 -> -0,05. Leben 120 -> 160, Schaden 10 -> 20.
  - Flugzeuge (alle verloren gegen Gewehr-Gruppen mit -0,9): plane -0,39 -> -0,18, zero -0,34 -> -0,16, fighter -0,22 -> -0,03. Leben +37 % (190->260, 150->210), Schaden +25 %, Kosten -20 % (plane 960 -> 760, zero 965 -> 765, fighter 1075 -> 820). Gegen MG/Gewehr bleiben sie bewusst im Nachteil (~-0,8), gewinnen gegen Nahkämpfer, Reiter, Artillerie.
  - Bomber: Schaden gegen Gebäude war nur ×.25 (kein `siege`), 2 Bomber brauchten 59 s für eine Kaserne (Haubitze 13 s). `hit()`: `d.bomber` gegen Gebäude ×1 -> 17 s.
  - Renault FT (690) war dem Carro Veloce (635) in allem unterlegen: -0,32 -> -0,04; Leben 320 -> 420, Kosten Eisen 180 -> 150, Gold 70 -> 55 (Wert 600), Zeit zwischen Schüssen 1,8 -> 1,5 s.
  - Mark I (1370) war teurer und schwächer als der Panzer: -0,17 -> -0,18 im Rang (die anderen stiegen), gegen Gebäude 17 s -> 14 s; Schaden 100 -> 120, Eisen 380 -> 340. Bleibt bewusst unter dem Panzer.
  - Doughboy (295) schlug 20 von 22 Gegnern, Rang 1 (0,39), Kennzahl Schaden×Leben/Kosten² 30 % über dem Gewehrschützen: Schaden 42 -> 38, Rang 0,24 (gleichauf mit MG/Panzer).
  - Dicke Bertha (2140): brauchte 33 s für eine Kaserne (Tank 8 s, Škoda 15 s): Schaden 175 -> 200, 25 s (Kosten unverändert; mit Kostensenkung würde die Gruppengrösse von 1 auf 2 springen).
- Nur beobachtet, nicht geändert: Haubitze/Škoda/Bertha verlieren Feldschlachten gegen Gruppen (-0,4 bis -0,6), das ist ihre Rolle (Gebäude); Rekrut (75, Russland) Rang 1-2 im Kostengleichstand wegen Masse (Lanchester), aber Bevölkerungsgrenze und Ausbildung begrenzen ihn im Spiel; Ritter in Z3-Z5 stärkster Nahkämpfer (+0,3), nur der Speer kontert ihn (ab Z5 gibt es keinen Speer mehr, Z5-Ritter schlägt Gewehr +0,15, verliert gegen Panzer -0,2); Panzer (1280) verliert gegen kostengleiche Gewehr-/Infanterie-Gruppen (-0,3), gewinnt aber Gebäude 8 s und gegen MG/Kosak; Schwert und Speer in Z3 liegen bei ±0,1.
- Aufstiegszeiten Berater-Auto (Küste M, Zeitalter 1-5 in Minuten, Seeds 11/23, 50 min): Seed 11 9,2/16,6/24,5/33,0/42,0 (vorher = nachher), Seed 23 7,9/15,7/21,6/30,5/35,8 (nachher 30,3); Abstände 7-9 Minuten, keine auffällige Epoche, Aufstieg Z6 liegt jenseits der 50 Minuten (~51). Nichts angepasst. Siegzeit des Beraters: Seed 11 >50 min -> 34,5; Seed 23 35,9 -> 44,9 (Streuung durch geänderte Zufallsfolge, im Mittel ~40 min vorher wie nachher).

- Jagdflugzeuge gegen Bodenfeuer (24.10.): Flugzeuge verloren kostengleich klar gegen MG/Gewehr. `hit()` (sim.js): `AA_GUN` = Schaden von Bodenwaffen mit `gun:true` gegen Flugzeuge, Gewehr-Linien x0,4, MG x0,3 (MG feuert viele Schüsse, daher stärker gekürzt). Nur Flugzeuge als Ziel; Jäger gegen Jäger, Bomber, Panzer, Nahkämpfer unverändert. Tooltip (`unitTip`) und EN-Text ergänzt. Messung (Zeitalter 6, Budget 3000, Rang = Lebensanteil-Vorsprung der Flugzeuge, vorher -> nachher; 1v1 in Klammern):

  | Paarung (kostengleich) | vorher | nachher | 1v1 vorher -> nachher |
  |---|---|---|---|
  | plane - mg (4v7) | -0,81 | -0,04 | -0,01 -> 0,69 |
  | plane - rifle (4v8) | -0,72 | -0,14 | 0,23 -> 0,69 |
  | zero - rifle | -0,63 | -0,19 | 0,36 -> 0,75 |
  | fighter - mg | -0,60 | +0,44 | 0,31 -> 0,79 |
  | plane - rekrut (4v40) | -0,77 | -0,27 | 0,97 -> 0,99 |
  | plane - tank | -0,63 | -0,57 | -0,82 (gleich) |
  | plane - howitzer | +0,49 | +0,45 | |
  | plane - sturm | +0,36 | +0,50 | |
  | plane - kosak | +0,30 | +0,30 | |
  | plane - plane | -0,11 | +0,19 (Streuung, Spiegelduell) | |
  | bomber - plane | -0,79 | -0,79 | |

  Grenzen: im Einzelduell sind Flugzeuge jetzt klar stark, kostengleich ausgeglichen. Fighter (USA, bessere Werte) etwas über dem Ziel (+0,44). Berater-Auto erreicht Zeitalter 6 erst nach ~50 min, die Siegzeit hängt davon nicht ab (nicht neu gemessen).

- Rehe haengen (24.10.): `updAnimal` Flucht: Richtung nach freier Laufstrecke bewertet (14 Richtungen, bis 120 px, Mindestlaenge 40) statt nur "alle 4 Punkte frei"; Gefahrenpunkt = Mitte aller nahen Bedrohungen; eingekesselt -> `a.nofl` 3 s keine neue Flucht; `a.fbad` meidet Zielpunkt ohne Fortschritt. Messung (Skript nicht im Repo, 12 Min, Wildtiere "viel", 24 Karten/Seeds, headless): haengende Rehe 1/638 (0,2 
- Rehe haengen (24.10.): `updAnimal` Flucht: Richtung nach freier Laufstrecke bewertet (14 Richtungen, bis 120 px, Mindestlaenge 40) statt nur "alle 4 Punkte frei"; Gefahrenpunkt = Mitte aller nahen Bedrohungen; eingekesselt -> `a.nofl` 3 s keine neue Flucht; `a.fbad` meidet Zielpunkt ohne Fortschritt. Messung (Skript nicht im Repo, 12 Min, Wildtiere "viel", 24 Karten/Seeds, headless): haengende Rehe 1/638 (0,2 %) schon vorher; mit absichtlich nahen Arbeitern+Haeusern (18 Laeufe) 1,3 % -> 0,4-0,6 %; CPU 0,83-0,88 ms/Schritt unveraendert. Der Screenshot-Fall (Uferstreifen) liess sich nicht gezielt nachstellen.

## Fischerboote und Angriffsplan (24.10.)
- Ursache Boote: Nach dem Abliefern blieb das Boot am alten Schwarm (nur bei leerem Schwarm neue Suche, dann `nearestNode` = Luftlinie vom Boot, ohne Menge, ohne Entfernung zum Hafen); volle Schwärme (`cap`) wurden nur über Umwege umgangen, leergefischte Nachbarn führten zu Fahrten über die halbe Karte (bis 1360 px) für eine Teilladung.
- Neu `boatPick(u,cur)` (sim.js): Kosten je Nahrung = (2 x Weg Schwarm-Hafen + 0,5 x Weg Boot-Schwarm + Fangzeit) / tatsächliche Ladung (Menge des Schwarms beachtet), + Aufschlag für Boote auf dem Schwarm und für volle Schwärme; Schwärme über Nähe-Grenze (> naechster + 360 px, > 3 x naechster + 300 px) fallen weg; `G.nbad`/`u.bad` bleiben Sperre. Gilt für Spieler-Boote nach jedem Abliefern (wechselt nur bei > 15 % Gewinn), Boote ohne Ziel, Absprache bei vollem Schwarm, `advIdle` und KI-Boote (`aiTick`). Teilladung: nur weiterfischen, wenn der nächste Schwarm < 220 px entfernt ist.
- Messung (5 Boote, Hafen am Fisch, 15 min, Nahrung/min | Fahrstrecke je 100 Nahrung, vorher -> nachher): Küste M s7 83 -> 84 | 2403 -> 2304; Küste M s11 239 -> 239 | 2466 -> 2208; Küste L s7 238 -> 238 | 2300 -> 1750; Küste L s11 183 -> 197 | 6780 -> 6088; Inselreich M s7 219 -> 252 | 2531 -> 2490. Fahrten > 1000 px entfallen. Die Menge/min ist durch das Nachwachsen der Schwärme (`regen` .55/s) begrenzt, deshalb ändert sich vor allem der Weg, nicht die Menge. Messskript liegt nicht im Repo.
- Angriffsplan Berater: Chip „Angreifen“ (`advisor.atk`, `advSetAtk`) oder Taktik „Angriff“ (`advSetStrat`). Vorher: Ziel wurde nur aus `G.mem` genommen, ein Späher erst nach 40 s und als normaler Vorschlag spät in der Liste; Ausgewogen/Aufstieg/Wirtschaft/Verteidigung greifen nie vor Zeitalter 4 an (`atk` 99), „Angriff“ schickte schon bei 5 Truppen. Jetzt: Späher sofort, Kaserne ab 5 Arbeitern, Truppenziel mindestens 8 (`atkN`), Vorschläge Späher/Erkunden/Truppen/Angriff stehen vorn (`ADV_ATK_KEYS`), Text sagt „Ziel unbekannt“. Auto führt aus, ohne Auto Annehmen (Y). Bei Auto an weiter keine Meldung.
- Messung Angriffsplan (Normal, Küste M/Festland M, Seeds 11/12, 25 min, Berater simuliert): Ausgewogen alt 0 von 4 Siegen (Feindgebäude 13-14 nach 25 min); Chip „Angreifen“ neu 4 von 4 Siegen nach 14-16 min (Auto) und 4 von 4 nach 14-17 min (Annehmen nach 1,5 s); Späher ab Sekunde 12 statt 65.
