# Release 2 (v0.2.0) – Plan

Geführt von der Release-Leitung (`.claude/agents/epochen-release.md`), abgenommen von der Qualitäts-Leitung (`.claude/agents/epochen-qa.md`, Mängel in `QA.md`). Entscheidungen über Inhalt trifft David.

## Ziel
Ein Spiel aus einem Guss: stimmige Grafik über alle Zeitalter, gleiche Größenverhältnisse, Truppen mit Kontinuität, sinnvolle Wirtschaft (Wälder, Minen), polierte Oberfläche, guter Ton, Balance im Langzeitspiel, keine Fehler – Web-Version, Desktop-App und Mehrspieler.

## Umfang
### Muss rein
- [ ] Sounds: Axt, Beeren pflücken, Bauen hörbar und passend
- [ ] Tiere: Ausrichtung (Rehe, Bär), Bär mit Laufbewegung
- [ ] Mauer durch Ziehen bauen
- [ ] Dichte Wälder mit Durchgängen, nur Randbäume fällbar, Holz geht im Langzeitspiel nicht aus; größere Erzvorkommen
- [ ] Obere Leiste stabil (springt nicht)
- [ ] Einheiten-Kontinuität: ein Grundkörper, Ausrüstung wächst je Zeitalter; alle Menschen in Arbeitergröße; Waffen/Werkzeuge richtig
- [ ] Animationen im Spieltempo; Feldarbeit-Animation
- [ ] Modelle: Kenney-Schiffe/Belagerung mit Farbe, Ritter mit echtem Pferd, Kaserne (alle Zeitalter, Industrie passend), Hauptlager Renaissance, größere Bäume, Erze einheitlich und realistisch, Ölfeld/Bohrturm/Raffinerie
- [ ] Minen neu (Option A): auf dem Vorkommen, Transport zum Lager, Schienen-Ausbau, ausbalanciert
- [ ] Türme/Gebäude mit Abstand (Berater ✓, Arbeiter offen)
- [ ] Durchspiel-Audit aller Zeitalter und Fix-Runde

### Soll rein
- [ ] Gebäude abreißen mit Rückerstattung
- [ ] Zeitalter-Baum mit Bildern und Flaggen ✓ (erledigt)

### Nach dem Release
- Tutorial / geführte erste Partie
- 3–4 Spieler
- Echte Musikstücke je Zeitalter (sobald David Dateien liefert)

## Reihenfolge (wegen gemeinsamer Dateien)
1. Laufend: Sounds+Tiere · Mauer · Wälder · obere Leiste
2. Einheiten-Kontinuität (gltfmodels.js, manifest, render3d.js) inkl. Größen, Waffen, Tempo-Animationen, Feldarbeit
3. Modelle & Gebäude (manifest, gltfmodels.js), Erze/Öl
4. Minen neu (sim.js, ai.js, advisor.js, data.js, mp) + Gebäude abreißen + Arbeiter-Türme
5. Durchspiel-Audit → Fix-Runde → Aufräumen/Verschlanken
6. Release-Checkliste

## Release-Checkliste
- [ ] Alle Muss-Punkte von der Qualitäts-Leitung abgenommen
- [ ] Web-Test, keine Konsolenfehler; Leistung nicht schlechter als v0.1.0
- [ ] Mehrspieler-Test (zwei Fenster) synchron
- [ ] Desktop-App Selbsttest; App-Größe geprüft (nur benutzte Modelle/Klänge)
- [ ] Englische Texte vollständig
- [ ] `CLAUDE.md`, `ROADMAP.md`, `QA.md`, `VEROEFFENTLICHEN.md` aktuell; Lizenzen geprüft
- [ ] Pull Request gemergt, Release `v0.2.0` erstellt (David)
