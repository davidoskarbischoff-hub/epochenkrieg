# Epochenkrieg – Projektanleitung für Claude

## Worum es geht
Epochenkrieg ist ein Echtzeitstrategiespiel (RTS) im Browser, inspiriert von War Selection (Steam).
Der Spieler führt einen Stamm von der Steinzeit über die Bronzezeit in die Eisenzeit, sammelt
Ressourcen, baut eine Siedlung und besiegt KI-Gegner. Ziel: 1 bis 4 Spieler pro Partie, kein Massen-Multiplayer.

Der Besitzer (David) programmiert nicht selbst, sondern entwickelt das Spiel per "Vibe Coding".
Erkläre Änderungen deshalb kurz und in einfacher Sprache auf Deutsch.

## Technik
- Reines HTML, CSS und JavaScript, kein Framework, kein Build-Schritt.
- Gezeichnet wird auf einem `<canvas>` (2D, Draufsicht, alle Grafiken prozedural, keine Bilddateien).
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
- `js/sprites.js` – 2,5D-Grafik (`SPR.unit/bld/tree/bush/rock/height`): aufrechte Seitenansichten mit Volumen, Zeichenursprung = Bodenpunkt. Die Karte wird mit `TILT`=0.7 gestaucht (`game.js`: `draw`, `toWorld`, `clampCam`, `entityAt`); aufrechte Dinge zeichnet man mit `upright(x,y,fn)`. Alles wird nach y sortiert gezeichnet.
- `js/art.js` – (alte Draufsicht; nur noch `ART.icon` für die Oberfläche wird genutzt)
- `js/art.js` – Grafik für Einheiten, Gebäude, Bäume, Büsche und Felsen (`ART.unit/bld/tree/bush/rock`): gleicher Stil mit dunklem Umriss und hellem Lichtpunkt. Jede Einheit hat eine eigene Funktion in `ART_UNIT`.
- `js/game.js` – Spiellogik in einem IIFE: Kartengenerierung, Einheiten-Zustandsmaschine
  (idle, move, amove, attack, gather, return, build), Kampf und Projektile, Gegner-KI (`aiTick`),
  Eingabe (Maus, Touch, Tastatur), Zeichnen und Oberfläche.

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
- Entitäten haben `kind`: `unit`, `bld` (Gebäude) oder `node` (Ressourcenquelle). Team 0 = Spieler, 1 = KI, -1 = neutral.
- Die Simulation läuft in festen Teilschritten (`step(dt)`), die KI denkt einmal pro Sekunde.
- Die Karte wird gespiegelt erzeugt, damit beide Startpositionen fair sind.

## Arbeitsweise
- Pro Session ein klar umrissenes Feature. Vor grösseren Umbauten kurz den Plan nennen.
- Nach jeder Änderung das Spiel im Browser testen (laden, Partie starten, Feature ausprobieren, Konsole auf Fehler prüfen).
- Bestehende Steuerung und Spielbarkeit nicht kaputt machen. Wenn `game.js` zu gross wird, sinnvoll in weitere Dateien aufteilen.
- Am Ende jeder Session: `ROADMAP.md` aktualisieren (Erledigtes abhaken, neue Ideen ergänzen).

- Ressourcen (`NODES`): wenige, grosse Vorkommen (Wälder als Gruppen, Steinhaufen mit 1600, Eisen 1200). Oberfläche: dunkler Stein mit Bronze-Rahmen (Block "Neues Oberflächen-Design" am Ende von `style.css`).
