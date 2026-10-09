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
- `js/audio.js` – Klang (Web Audio, keine Audiodateien): Geräusche `SND.play(name)` und Hintergrundmusik pro Epoche.
- `js/game.js` – Spiellogik in einem IIFE: Kartengenerierung, Einheiten-Zustandsmaschine
  (idle, move, amove, attack, gather, return, build), Kampf und Projektile, Gegner-KI (`aiTick`),
  Eingabe (Maus, Touch, Tastatur), Zeichnen und Oberfläche.

## Wichtige Konzepte im Code
- Globaler Spielzustand `G` (Entitäten, Ressourcen, Epochen, Statistiken).
- Entitäten haben `kind`: `unit`, `bld` (Gebäude) oder `node` (Ressourcenquelle). Team 0 = Spieler, 1 = KI, -1 = neutral.
- Die Simulation läuft in festen Teilschritten (`step(dt)`), die KI denkt einmal pro Sekunde.
- Die Karte wird gespiegelt erzeugt, damit beide Startpositionen fair sind.

## Arbeitsweise
- Pro Session ein klar umrissenes Feature. Vor grösseren Umbauten kurz den Plan nennen.
- Nach jeder Änderung das Spiel im Browser testen (laden, Partie starten, Feature ausprobieren, Konsole auf Fehler prüfen).
- Bestehende Steuerung und Spielbarkeit nicht kaputt machen. Wenn `game.js` zu gross wird, sinnvoll in weitere Dateien aufteilen.
- Am Ende jeder Session: `ROADMAP.md` aktualisieren (Erledigtes abhaken, neue Ideen ergänzen).
