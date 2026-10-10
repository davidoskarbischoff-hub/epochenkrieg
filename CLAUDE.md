# Epochenkrieg – Projektanleitung für Claude

## Worum es geht
Epochenkrieg ist ein Echtzeitstrategiespiel (RTS) im Browser, inspiriert von War Selection (Steam).
Der Spieler führt einen Stamm von der Steinzeit über die Bronzezeit in die Eisenzeit, sammelt
Ressourcen, baut eine Siedlung und besiegt KI-Gegner. Ziel: 1 bis 4 Spieler pro Partie, kein Massen-Multiplayer.

Der Besitzer (David) programmiert nicht selbst, sondern entwickelt das Spiel per "Vibe Coding".
Erkläre Änderungen deshalb kurz und in einfacher Sprache auf Deutsch.

## Technik
- Reines HTML, CSS und JavaScript, kein Framework, kein Build-Schritt.
- Gezeichnet wird in 3D mit Three.js (liegt als Datei in `js/vendor/`, kein Build-Schritt): WebGL-Canvas `#gl` für die Welt, darüber das 2D-Canvas `#c` für Lebensbalken, Marker, Partikel. Alle Modelle und Texturen entstehen prozedural im Code, keine Bilddateien.
- Starten: `index.html` im Browser öffnen, oder `npx serve .` und dann im Browser aufrufen.

## Dateien
- `index.html` – Seitenaufbau (Ressourcenleiste oben, Karte, Befehlskonsole unten mit Info, Aktionen, Minikarte).
- `css/style.css` – Aussehen der Oberfläche.
- `js/data.js` – Alle Spieldaten: Einheiten (`UNITS`), Gebäude (`BLDS`), Ressourcenquellen (`NODES`),
  Epochen (`EPOCHS`), Schwierigkeitsgrade (`DIFF`), Teamfarben und Baumaterial-Farben je Epoche.
  Balancing-Änderungen gehören hierher.
- `js/nav.js` – Gelände (`TERR`: 0 tiefes Wasser, 1 flaches Wasser, 2 Land; Karte wird aus Zufallszahlen punktsymmetrisch erzeugt) und Wegfindung (A* auf 10-px-Raster, Gebäude und Ressourcen blockieren per `navStamp`).
- `js/i18n.js` – Sprachen Deutsch/Englisch: im Code deutsch schreiben, mit `tr('Text {0}',wert)` umschliessen, englische Übersetzung im Wörterbuch `EN` ergänzen.
- `js/audio.js` – Klang (Web Audio, keine Audiodateien): Geräusche `SND.play(name)`, Lautstärke per Regler im Menü und klassische Hintergrundmusik pro Epoche (Satie, Pachelbel, Grieg).
- `js/net.js` – Mehrspieler-Verbindung und Lobby (`Lobby`): WebRTC über PeerJS (Einladungslink `?join=ID`) oder lokal per BroadcastChannel (`?join=local:CODE`, zwei Tabs).
- `js/models3d.js` – 3D-Modelle aus einfachen Formen und Mustertexturen: Gebäude je Epoche (`BLD3`, `buildBld`), Figuren (`UNIT3`, `buildUnit`, Rig mit Beinen/Armen zum Animieren), Tiere (`ANI3`, `quad`), Bäume/Büsche/Felsen als Geometrien für Instanzen. Später durch glTF-Modelle ersetzbar.
- `js/render3d.js` – 3D-Szene: Gelände aus dem gemalten Kartenbild (`bg`) mit Höhen (`hAt`), Wasserwellen, Gras-Instanzen, Entitäten-Abgleich je Bild (`r3Sync`), Kamera (`camUpdate`; `cam.x/y` = Bildmitte in Spielpixeln, `cam.z` = Zoom), Umrechnung Bildschirm↔Spiel (`toWorld`, `scr`), Auswahlringe. Spielkoordinaten (x,y in Pixeln) → 3D: x/10, Höhe, y/10.
- `js/art.js` – nur noch `ART.icon` (SVG-Symbole für die Oberfläche) wird genutzt.
- Spiellogik (früher eine Datei `game.js`, jetzt aufgeteilt; alle Dateien teilen sich globale Namen, Ladereihenfolge siehe `index.html`):
  `state.js` (Seite, Kamera, Nebel, Gebiet, Bauregeln, `NET`), `map.js` (Entitäten, Kartengenerierung), `sim.js` (Spielschritt, Einheiten-Zustandsmaschine, Kampf, Ausbildung, Stufen, Technologien),
  `ai.js` (Gegner-KI `aiTick`), `commands.js` (Spielerbefehle, Befehlsketten), `input.js` (Kamera, Maus, Touch, Tastatur), `mp.js` (Mehrspieler im Spiel),
  `advisor.js` (Berater, Taktiken `STRATS`, Lagebild), `render.js` (2D-Anzeigen über der 3D-Welt, Partikel, Minikarte), `ui.js` (Menü, Info-Feld, Befehlsknöpfe, Startbildschirm, Ende), `main.js` (Spielschleife).

## Wichtige Konzepte im Code
- Mehrspieler (`NET` und Abschnitt "Mehrspieler" in `game.js`): Der Gastgeber rechnet alles, der Gast bekommt 10-mal pro Sekunde einen Spielstand (`encodeSnap`/`applySnap`) und schickt Befehle (`NET.send({c:...})`, Gast-Wächter am Anfang von `command`, `attackMove`, `tryPlace`, `enqueue`, `advance`, `startUpgrade`, `startResearch`, `cancelQueue`). Jeder sieht sich selbst als Team 0 (blau): der Gastgeber vertauscht die Teams kurz (`flipTeams`) zum Senden des Standes und zum Ausführen von Gast-Befehlen (`execRemote`). Neue Spieleraktionen müssen deshalb einen `NET.client`-Wächter bekommen und in `execRemote` einen `case`. Im Mehrspieler gibt es keine KI, keinen Berater, keine Pause.
- Karten (`MAPS` in `nav.js`): Küste, Festland, Bergland (Fels = `TERR` 3, Klippen mit Lücken für Häfen), Große Bucht. Gelände-Feld 3 ist für alle unpassierbar und nicht bebaubar.
- Epochen: `EPOCHS` in `data.js` (Steinzeit, Bronzezeit, Eisenzeit, Mittelalter, Neuzeit). Neue Epoche = Eintrag in `EPOCHS` (mit `cost`/`time` für den Aufstieg), `MAT` (Gebäudefarben), `LVL`/`LVLN`/`LVLC`/`UPG` (Stufenwerte), Musikstück in `audio.js` (`PIECES`), Einheiten/Gebäude mit passendem `ep`, KI-Listen in `aiTick` (`targetW`, `w8`, `types`).
- Bewegung: `moveToward` nutzt `navPath` (A*), erkennt Festhängen (`u.stk`, nach 1,6 s Ausweichen + neuer Weg mit Zufallskosten) und gibt auf, wenn es keinen Weg gibt (`u.pf.fail`). Arbeiter verteilen sich auf Bäume/Büsche (`cap` je Vorkommen in `NODES`).
- Wasser: Hafen (`harbor`, nur auf flachem Wasser am Ufer baubar, `placeBlock`/`harborOk`) bildet Schiffe aus (`naval:true` in `UNITS`: Fischerboot, Kriegsschiff). Fischquellen sind Nodes mit `sea:true` (Fischschwarm, Delfine ab Stufe II, Wale ab Stufe III) und liefern Nahrung. Einheiten mit `gather:true` sammeln, `passive:true` greifen nicht von selbst an. Zum Testen: `window.__seed=<zahl>` vor dem Laden setzen erzeugt immer dieselbe Karte.
- Technologien: `TECHS` in `data.js` (gehören zu einem Gebäudetyp `bld`/`blds`, Epoche `ep`, Effekte `fx`); Einheiten brauchen ggf. `tech` in `UNITS`. Team-Effekte stehen in `G.tfx[team]` (`techFx`), Besitz in `G.tech[team]`, laufende Forschung in `G.rs[team]`. Die KI bekommt beim Aufstieg alle Technologien (`grantAiTechs`). Achtung: `G.fx` sind die Bildeffekte, nicht die Technologien.
- KI (`aiTick`): Erkundung `ai.ex`, gesehene Spielerobjekte `ai.seen`, Angriff erst wenn ein Ziel bekannt ist, Marine (Hafen, Boote, Schiffe), Turm-Expansion. Spieler-Gedächtnis für Gegnergebäude: `G.mem`.
- Späher: Zustand `explore` (`pickExplore`), Taste E.
- Befehlsketten: `u.q` (Liste von Aufträgen), `giveOrder(u,order,append)`; Umschalt + Befehl hängt an, `nextOrder` startet den nächsten, sobald die Einheit idle ist (bei Sammlern nach dem Abliefern).
- Upgrades laufen als Aufträge (`G.jobs[team]`, einzeln pro Gruppe oder "Alle", `pending()` liefert die Gruppen); betroffene Einheiten/Gebäude haben `e.upj` und ruhen. Die Liste steht im Info-Feld des Hauptlagers.
- Berater (`advRules`, `advisorTick`): schlägt eine Aktion nach der anderen vor (Hütte, Arbeiter, Upgrade, Aufstieg, Kaserne, Turm, Hafen, Truppen, Späher); Annehmen = Taste Y, Ablehnen = X; im Menü abschaltbar. Neue Regeln dort ergänzen.
- Stufen: jede Einheit/jedes Gebäude hat `lvl` (0–2, Werte in `LVL` in `data.js`). Neue starten auf der Epochenstufe; der Spieler muss nach dem Aufstieg per "Alle upgraden" (`startUpgrade`) nachziehen, sonst ist der nächste Aufstieg gesperrt. Während des Upgrades ruhen die Einheiten/Gebäude des Teams. Stein braucht Arbeiter ab Stufe 1, Eisen ab Stufe 2 (`NEED_LVL`). Die KI wird beim Aufstieg sofort hochgestuft. Zum Testen gibt es `window.__ek` (Zugriff auf `G`).
- Gebiet (Territorium): Raster `terr` in `game.js`; fertige Gebäude beanspruchen einen Kreis (`claim` in `data.js`), eigenes Gebiet = grün + dauerhafte Sicht, gegnerisches = rot. Ausser dem Wachturm darf nur im eigenen Gebiet gebaut werden (`placeBlock`).
- Nebel des Krieges: Raster `fogEx` (erkundet) und `fogVis` (sichtbar) in `game.js`; Sichtweite steht als `sight` in `data.js`. Karte bleibt überall sichtbar (grau), gegnerische Einheiten/Gebäude nur bei `shown(e)`.
- Globaler Spielzustand `G` (Entitäten, Ressourcen, Epochen, Statistiken).
- Entitäten haben `kind`: `unit`, `bld` (Gebäude), `node` (Ressourcenquelle) oder `animal` (wildes Tier, Team -1). Team 0 = Spieler, 1 = KI, -1 = neutral.
- Die Simulation läuft in festen Teilschritten (`step(dt)`), die KI denkt einmal pro Sekunde.
- Die Karte wird gespiegelt erzeugt, damit beide Startpositionen fair sind.

## Arbeitsweise
- Pro Session ein klar umrissenes Feature. Vor grösseren Umbauten kurz den Plan nennen.
- Nach jeder Änderung das Spiel im Browser testen (laden, Partie starten, Feature ausprobieren, Konsole auf Fehler prüfen).
- Bestehende Steuerung und Spielbarkeit nicht kaputt machen. Wenn `game.js` zu gross wird, sinnvoll in weitere Dateien aufteilen.
- Am Ende jeder Session: `ROADMAP.md` aktualisieren (Erledigtes abhaken, neue Ideen ergänzen).

- Ressourcen (`NODES`): wenige, grosse Vorkommen (Wälder als Gruppen, Steinhaufen mit 1600, Eisen 1200). Oberfläche: dunkler Stein mit Bronze-Rahmen (Block "Neues Oberflächen-Design" am Ende von `style.css`).
- Wilde Tiere: `ANIMALS` in `data.js` (Reh friedlich/jagbar, Wolf/Bär/Tiger mit Aggro-Reichweite `agg`, Revier `leash`), Verhalten `updAnimal` in `sim.js` (idle/wander/flee/chase/return), Aufstellung `spawnAnimals` in `map.js` (punktsymmetrisch). Im Mehrspieler als Liste `A` im Spielstand. Erlegte Tiere geben Nahrung.
- Nahrung wächst nach: Beerensträucher und Fischgründe haben `regen` in `NODES` (Menge steigt wieder bis zum Maximum, die Quelle verschwindet nicht).
- Balancing/Tests: `window.__norender=true` schaltet das Zeichnen ab; `step(.04)` in einer Schleife simuliert ohne Fenster. KI-Tempo: `AI_MINT` und `DIFF[..].pace/army` in `data.js`. Aufstieg des Spielers braucht 10/20/30/40 Arbeiter (`wkNeed`).
- Musik: Epochenstück plus Kampfebene (`pieceWar`), die bei Kampf/Alarm eingeblendet wird (`SND.setAlert`).

## Neu in dieser Runde (Epochen-Looks, Gegner-Typen, Gold, Ton)
- Aussehen je Epoche: Einheiten nutzen `u.lvl` (0–5) in `UNIT3` (`bodyOf`, `dress`, `headgear`, Waffen); Steinzeit-Gebäude stehen in `PRIM` (`models3d.js`), Renaissance/Industriezeit-Zusätze in `epExtras`. Bei Stufenwechsel ändert sich die Signatur in `r3Sync` und das Modell wird neu gebaut.
- Gegner-Typen (`AI_STYLES` in `data.js`, Wahl im Startmenü, `aiStyle` in `state.js`, `G.ai.style`): Ausgewogen, Turtle, Rush, Wirtschaft, Aufstieg. Sie verändern Arbeiterzahl, Aufstiegstempo, Heeresgröße, Angriffszeit, Türme, Kasernen. Schwierigkeit (`DIFF`) wirkt unabhängig davon.
- Berater: Takt 0,5 s, dringende Vorschläge (Angriff, Mangel) unterbrechen alte (`advKey`), Info-Meldungen (`info:true`) wiederholen sich selten, neue Regeln für knappe Vorräte, Minen, Markt.
- Ressourcen: `RES` hat jetzt Gold. Erscheinen je Epoche (`RES_EP`: Stein 1, Eisen 2, Gold 3). Eisen und Gold braucht eine fertige eigene `mine` im Umkreis `MINE_RNG` (`minedBy`, `placeBlock`). `market` (ab Mittelalter) tauscht über `trade()` (100 Rohstoff ↔ Gold, Kurse in `TRADE`); Mehrspieler: `NET.send({c:'trade'})` und `case'trade'` in `execRemote`.
- Tiere je Epoche: `ANIMALS` mit `from` (erscheint ab dieser Epoche, `G.late` → `eraAnimals`) und `ext` (stirbt aus): Mammut und Säbelzahntiger nur Steinzeit/Bronzezeit, Wolf/Bär ab Bronzezeit, Tiger ab Eisenzeit.
- Ton: siehe `SOUNDS.md` (alles synthetisch, Quellen/Lizenzen). Neue Geräusche `grunt`, `yell`, `horn`; Musik hat drei Spannungsstufen (Epoche, Kampfebene, `pieceHi`); `SND.setBattle` (Zahl der Kämpfenden), Taste M = stumm, Schalter „Ton an“ im Menü.
- Tempo: Taste/Knopf wechselt 1×, 2×, 3×, 5× (`G.speed`).
- Testskripte: Selbstspiel Berater (Auto) gegen KI mit `advisor.auto=true` und `aiTick()` im Schleifenlauf (`__norender`).

## Noch neuer (Animation, Karten, Felder, Kampf)
- Menschen-Animation: `addUpper` hängt den Oberkörper an ein Hüftgelenk (`rig.up`), `r3Human` in `render3d.js` steuert Gehen, Atmen, Abbauen je Werkzeug, Kampf (Ausholen, Schlag, Rückstoß), Zucken (`o.fl`); gestorbene Figuren fallen um (`R3.corpses`).
- Wegfindung: `navPath` überspringt veraltete Heap-Einträge (`navCl`) und durchsucht notfalls das ganze Raster. Karten: neu `river` (Flusstal mit Furten) und `pass` (Gebirgspass); alle Karten haben jetzt Berge (`mthr0` je Karte), Gipfel mit Schnee (in `renderBg` und Vertexfarbe in `r3Map`), Biom-Flecken im Boden.
- Arbeiter: reparieren (`autoRepair`, Befehl Rechtsklick auf beschädigtes Gebäude), bauen selbst Lager/Türme (`autoExpand`, Schalter „Arbeiter denken mit“). Truppen im Leerlauf stehen als Frontlinie vorn (`frontLine`, `u.manual` = Spielerbefehl, bleibt unangetastet).
- Aufstieg braucht 5/10/20/30/40 Arbeiter (`wkNeed`). Felder (`farm` + Knoten `field`, wächst nach).
- Kampf: Gegenstücke `CTR` (Klassen `cls` in `UNITS`), Heiler (`healAura`), Fähigkeit Kampfrausch (`useRage`, Taste F, `RAGE`). Duell-Test aller Einheiten: Skript siehe Verlauf (kostengleiche Gruppen).
- Menschen (`human()` in `models3d.js`): Becken/Taille/Brust, Hals, Kopf mit Nase/Ohren/Augen/Haaren, Arme und Beine mit Ellbogen/Knie (`rig.elbows`, `rig.knees`, `rig.hands`); Hautton/Haarfarbe nach `u.id`. Arbeiter-Werkzeuge nach `wkTier` (Epoche + Werkzeug-Technologien), Tragekorb (Technologie `baskets`/`carts`), Schuhe (`shoes`); die Signatur in `r3Sync` baut das Modell bei Änderung neu. Hieb-Animation hängt an `u.gt`/`u.bt` (Aufprall = Geräusch). Tiere: zweiteilige Beine mit Knie, Brust/Hinterteil/Keulen; Gebäude: `bldDetail` (Sockel, Eckpfosten, Stufen, Laterne).
- Grafik-Stufe: `gfxQ`/`setGfx` in `render3d.js` (Menü „Grafik“: normal/hoch/sehr hoch = Auflösung und Schattenkarte), leichter Farbfilter auf `#gl`, Umgebungslicht für Metall (`M3.env`, PMREM). Oberflächen-Texturen `cloth`, `leather`, `scratch`, `rust`, `camo` in `TEXGEN`; `rbox()` = abgerundeter Quader. Panzer (`UNIT3.tank`, Technologie `armor`), Haubitze und Panzerschiff mit Tarnung, Nieten, Rundungen.
- Einstellungen: `js/settings.js` (`OPT`, `optSet`, `optApply`, gespeichert in localStorage `ek-opt`); Menü mit Reitern in `renderMenu`/`renderOptions` (`ui.js`), Hinweise-Tooltips (`TIPS`, `#tip`), FPS-Anzeige `#fps`. PC-Look der Fenster am Ende von `style.css`. Kamera steiler (`R3.PITCH`), Arbeiter kleiner (Faktor .8 in `r3Make`), Burg `r:40`, Berge in 6 Terrassen (`nav.js`, Höhenfeld).

## Nationen und 20. Jahrhundert (Runde J)
- Ab der Industriezeit wählt der Spieler eine Nation (`NATIONS` in `data.js`, `G.nation[team]`, Bonus `G.nfx[team]` via `nationFx`, `advance(team,nat)`; Zeitalter-Baum Taste T, `openTree`/`showNationPick` in `ui.js`). Jede Nation hat Spezialeinheiten (`nation:` in `UNITS`), die KI wählt zufällig.
- Weltkriegszeit (Epoche 6): Sturmsoldat/MG/Panzer, Flugzeuge (`air:true`, fliegen direkt, nur Fernkämpfer/Flieger treffen sie, Bau im `airfield`, Modelle `jetBody` in `models3d.js`, Höhe 5 und Propeller in `r3Unit`).
- Mauern/Tore/Gräben (`wall`,`gate`,`trench`), Öl (`derrick`,`refinery`), verborgene Erze (`HIDDEN_NODES`), Formationen (`FORMS`), Sanitäter-Reihe, Ingenieur: siehe jeweilige Abschnitte in `data.js`/`commands.js`.
- Grenzen: Modelle sind einfache Formen; Gruppe „Diktaturen" und Asien fehlen noch; Mehrspieler kennt Nationen nur grob.
- Turm-Ausbau: `TSPEC` (data.js), `towerSpec` (sim.js, Mehrspieler `case'tspec'`): Wehrturm (`e.spec='def'`, stärker schiessen, +50 % Leben) oder Aussichtsturm (`'obs'`, doppelte Sicht, Gebiet ×1,7, Ballon); Modell `towerSpecModel`. Spec wird noch nicht im Mehrspieler-Stand übertragen.
- Mauern: rasten per `wallSnap` (commands.js) an Mauerenden und grosse Vorkommen ein, drehen sich in Zugrichtung (`e.ang`); `wallPosts` (1×/2 s) setzt Eck-/Endpfosten (`e.pc`, Modell `wallPostModel`). Fernkämpfer besetzen Mauern/Türme per Rechtsklick (`garrison`, `u.gar`, Mauer 2, Turm 4 Plätze, Schaden ×.5, Nahkämpfer können sie nicht anvisieren).
- Fehler behoben: Reparatur von Gebäuden ohne `time` (Hauptlager) ergab NaN-Leben = unsterblich.
- Ausbaubäume: `BSPEC` (data.js) je Gebäudetyp mit Richtungen (Turm: Wehr/Aussicht, Hauptlager: Handelshof/Kommandozentrale, Kaserne: Drillplatz/Schiessstand). `buildSpec` (sim.js, Alias `towerSpec`), Wirkung `specFx` → `G.sfx[team]` (`SF(team)`), Modelle `specModel`; Spec/`pc`/`gar` stehen im Mehrspieler-Stand (`sp`,`pc`,`gr`). KI baut aus (`aiTick`).
- Mehrspieler-Lobby (`net.js`): Konfiguration `st.cfg` {size S/M/L, map, speed 1/2/3, side, colH, colG}; Gast schickt Vorschläge (`prop`, Gastgeber übernimmt/lehnt ab) und wählt seine Farbe (`col`). Kartengrösse wirkt über `startK` (map.js): Startpunkte rücken zur Mitte (S .6, M .8, L 1); jede Grösse zeigt 3 Karten (`SIZES`). Farben: `PALETTE`, `setTeamColors` (data.js); Tempo wird beim Start fest (`G.speed`, Knopf im MP gesperrt).
- Leistung: `separate` mit Gitter (Einheiten 40 px, Feststoffe 64 px), `G.solids`/`recount` nur alle 0,2 s, Feindsuche im Leerlauf/Angriffsmarsch nur alle ~0,25 s je Einheit (`u.ft`), `busyIds` in render.js.
- Vorkommen: `addNode(type,x,y,sz)` – Erze haben Grösse `sz` (.5/1/1.7: Menge und Radius/Optik wachsen mit), am Start nur 1 Stein + 1 kleines Eisen nah, mehr weiter weg (Expansion lohnt sich). Hauptlager hat Bronze-/Eisenzeit-Modelle (`hqBronze`, `hqIron` am Ende von models3d.js).
- Aussterben: Tiere mit `ext:1` (Mammut, Säbelzahntiger) sterben beim ersten Aufstieg eines Spielers; `G.bones` → Skelette (`skeletonModel`, `r3Bones`), im Mehrspieler-Stand als `bn`. Krokodile (`water:true`, `from:1`) leben nur im seichten Wasser.
- Symbole: `js/icons3d.js` (`ICON3.res(name)` Ressourcen, `ICON3.thing('unit'|'bld',type)` Kachel-Bilder) rendert Modelle einmal in PNG; Kacheln zeigen sie über `actIcon` (ui.js). Rahmen oben/unten: durchscheinend, Farbe je Zeitalter über `body[data-ep]` (CSS ganz unten).
- Gebiet und Sicht wachsen mit dem Zeitalter (state.js), Warteschlange 10, Arbeiter `r:4` (Anzeige `vr:7`), Aufstellung nach Einheitengrösse.
- Gebäude je Zeitalter: `js/blderas.js` (nach models3d.js geladen) überschreibt `BLD3.house/barracks/mine/tower/hq/store/harbor/market/castle` nach `st.ep` (Hütte → Fachwerk → Stadthaus → Backstein → Beton; Palazzo, Rathaus, Betonbunker; Sternfestung). Epoche 0 bleibt in `PRIM`. Zum Prüfen: Vorschaubilder mit `ICON3.thing('bld',typ)` je Epoche (Kontaktbogen-Skript im Verlauf).
- Kartengrösse (Mehrspieler): `playF` (S .62, M .84, L 1) → `applyPlayRect` (nav.js) macht ausserhalb eines mittigen Rechtecks ein unpassierbares Randgebirge (TERR 3, hoch); Startpunkte näher (`startK`), Vorkommen skalieren mit `playF²`. Ausbau für Hafen (Fischerhafen/Werft), Markt (Handelskontor/Bank), Flugplatz (Jagdstaffel/Panzerung) in `BSPEC`.
- Mehrspieler-Leistung: `sendSnap` sendet Deltas (nur geänderte Einheiten/Gebäude/Tiere, `d:1`, gelöschte in `X`; alle 3 s voller Stand), Sendetakt `NET.interval` wächst mit der Datenmenge/Rückstau (`NET.backlog`), Stand wird bei vollem Sendepuffer verworfen und neu voll gesendet; `rel()` rundet Zeiten über 1 s weg (sonst ändert sich jeder Datensatz ständig). Gast sendet alle 3 s `ping`, STUN-Server in `new Peer(...)`, Fehler in `applySnap`/`execRemote` werden abgefangen.
- Mehrspieler-Diagnose und Stabilität: `js/netlog.js` (`NetLog`: Protokoll, Status `S`, Anzeige `#netbadge`/`#netpanel`, Sparmodus `saverTick` → `r3Saver`), `js/netconfig.js` (TURN-Server), Wiederverbindung in `net.js` (`onClosed`, `startRejoin`; Gastgeber pausiert mit `G.netPause`, wartet 90 s; Gast versucht ~40 s, Nachricht `hello` mit `rejoin:1`). `frame()` ruft `requestAnimationFrame` zuerst und fängt Fehler ab. Teil-Datensätze `_d:1` (nur geänderte Felder), Client merged mit `e._rec` (`mergeRec`). Ausführlich: `MEHRSPIELER-ABSTUERZE.md`. Test ohne Internet: Fake-`Peer` über BroadcastChannel (siehe Verlauf).

## Desktop-App (Electron)
- Ordner `desktop/` (eigenes `package.json`, Spiel bleibt unverändert im Wurzelordner): `main.js` (Fenster, eigenes Protokoll `app://epochenkrieg/` statt Server, F11/Alt+Enter Vollbild, kein Drosseln im Hintergrund, Fenster-Grösse gemerkt, Selbsttest `--smoke`), `preload.js` (stellt `window.EK_APP` bereit: `version`, `webUrl`, `checkForUpdates`), `updater.js` (electron-updater gegen GitHub Releases: „Neue Version verfügbar“ → Download → „Jetzt installieren“; Mac nur Hinweis + Link), `scripts/copy-game.js` (kopiert `index.html`, `css/`, `js/` nach `desktop/game/`, wird nicht eingecheckt). Bau: electron-builder (Konfiguration in `desktop/package.json` → `build`), Windows NSIS-Installer ohne Admin, Mac dmg/zip unsigniert.
- Spiel-Anpassungen für die App (klein, Web-Version unberührt): `window.EK_APP` wird in `net.js` (`baseUrl` → Einladungslink zeigt auf die Web-Version) und `ui.js` (`versionLabel`, Knopf „Nach Updates suchen“ im Menü) abgefragt.
- Veröffentlichen: GitHub-Release mit Tag `vX.Y.Z` → `.github/workflows/release-app.yml` baut (Version aus dem Tag via `-c.extraMetadata.version`), hängt `Epochenkrieg-Setup-X.Y.Z.exe` + `latest.yml` (+ Mac) ans Release; nutzt nur den automatischen `GITHUB_TOKEN` (Einstellung: Actions → Workflow permissions → Read and write). `.github/workflows/web-check.yml` prüft die Syntax bei jedem Push. `.nojekyll` hält GitHub Pages schlank. Anleitung für David/Tester: `VEROEFFENTLICHEN.md`.
- Grenzen: Windows-Installer ist nicht signiert (SmartScreen-Warnung, siehe Anleitung); Mac ohne Auto-Installation; Linux nicht gebaut; Electron-Test lokal nur mit `xvfb-run npx electron . --no-sandbox --smoke` (Windows-Installer lässt sich unter Linux nur bis `win-unpacked` bauen, `wine` fehlt).

## Grafik-Fahrplan (Schritte 1–6 sind umgesetzt, noch nicht veröffentlicht)
1) Licht & Stimmung (wärmere Sonne, kühles Gegenlicht `fill`, Kontaktschatten `aoDecal` unter Gebäuden, Vignette `#vig`, Farbkorrektur `#gl{filter}`; Achtung: `optApply` setzt den Filter inline).
2) Gelände & Wasser: Küstenschaum `r3.foam` (pulsiert in `r3Frame`), grossflächige Bodenvariation per `onBeforeCompile` im Terrain-Material.
3) Vegetation: Wind (`WIND`, `windify` – Vertex-Shader-Zusatz für Bäume, Büsche, Gras).
4) Materialien: alle `MeshStandardMaterial` erben eine schwache Umgebungsspiegelung (Unterklasse am Anfang von `models3d.js`, `scene.environment`).
5) Effekte: Rauch (`r3Smoke`, Sprite-Pool, Quellen in `SMOKE_SRC`, nur sichtbare Gebäude; im Sparmodus aus). Hinweis: `THREE.Points` mit eigenem Shader wurde in Tests nicht zuverlässig gezeichnet → Sprites.
6) Leuchten: `#bloom` (verkleinerte, weichgezeichnete Kopie des GL-Bildes mit `mix-blend-mode:screen`, `r3Bloom`, Option `OPT.bloom`).
Idee für später: echte Nachbearbeitung (SSAO, Bloom mit Render-Target) braucht Three.js-Zusätze; Wasserspiegelung; Tag/Nacht.
- Mac-Bau: `desktop/scripts/adhoc-sign.js` (afterPack) setzt eine Eigen-Signatur gegen die Meldung „beschädigt“.
- Vorkommen: Stein/Eisen in mittlerer und grosser Entfernung zahlreicher (`near(...)` Ringe und `feats` in `map.js`), `NODES` stone 2400, iron 3000; am Start bleibt es klein.

## Echte 3D-Modelle (glTF) – vorbereitet
- `js/gltfmodels.js` (`EKMODELS`): liest `models/manifest.json`, lädt `.glb` (GLTFLoader aus `js/vendor/gltf-bundle.js`, gebaut aus Three.js r160 – Bauanleitung in `tools/gltf-bundle/`), hängt sich in `buildUnit`/`buildBld` ein (Rückfall auf die Code-Modelle). Einheiten: Skelett-Klon (`SkeletonUtils.clone`), Animationen Idle/Walk/Attack/Work per `EKMODELS.animate` (aufgerufen in `r3Unit`, `rig.gltf`), automatische Skalierung auf die Grösse des Code-Modells (`refSize`), Blickrichtung +Z (Standard-Drehung 90°), Material mit „team|farbe“ im Namen → `TC[team]`. Gebäude: Grundfläche `R*2.5*fit`, `userData.h`. Signatur in `r3Sync` enthält `EKMODELS.tag(e)`, damit beim Laden neu gebaut wird. Noch nicht: Tiere, Bäume/Felsen (Instanzen), Mauern, Sterbe-Animation.
- Vorschau-Werkzeug `tools/model-viewer.html`, Anleitung `MODELLE.md`, Lizenzliste `models/CREDITS.md`, Beispiel `models/_beispiel/` (Testfigur, Testhaus; Test: `EKMODELS.init('models/_beispiel/test-manifest.json')`). Desktop-App kopiert `models/` mit (`copy-game.js`).
