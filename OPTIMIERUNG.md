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
