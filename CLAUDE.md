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
- `js/game.js` – Spiellogik in einem IIFE: Kartengenerierung, Einheiten-Zustandsmaschine
  (idle, move, amove, attack, gather, return, build), Kampf und Projektile, Gegner-KI (`aiTick`),
  Eingabe (Maus, Touch, Tastatur), Zeichnen und Oberfläche.

## Wichtige Konzepte im Code
- Bewegung: `moveToward` nutzt `navPath` (A*), erkennt Festhängen (`u.stk`, nach 1,6 s Ausweichen + neuer Weg mit Zufallskosten) und gibt auf, wenn es keinen Weg gibt (`u.pf.fail`). Arbeiter verteilen sich auf Bäume/Büsche (`cap` je Vorkommen in `NODES`).
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
