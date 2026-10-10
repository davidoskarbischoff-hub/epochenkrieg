# Neue 3D-Modelle einbauen (Anleitung für David)

Das Spiel kann jetzt **echte 3D-Modelle** (Dateien mit der Endung **.glb**) statt der selbst gebauten Formen anzeigen. Fehlt ein Modell, nimmt das Spiel automatisch das bisherige – du kannst also **Stück für Stück** austauschen (erst die Arbeiter, später die Burg …).

## Engine-Frage (Unity, Godot, Unreal …?)
**Empfehlung: bei Three.js bleiben.** Eine andere Engine bedeutet, das ganze Spiel neu zu schreiben (alle ~15.000 Zeilen Spiellogik, Mehrspieler, KI, Oberfläche, Wegfindung). Das wären Wochen bis Monate, und die Web-Version (GitHub Pages), die Desktop-App-Updates und der Mehrspieler per Link müssten neu gebaut werden. Der Gewinn an Grafik kommt aber hauptsächlich von **besseren Modellen und Texturen**, nicht von der Engine. Das geht mit dem neuen System schon jetzt.
Wann eine Engine sich lohnt: wenn du später auf **Steam/Konsole** willst oder sehr viele Einheiten (mehrere Hundert, aufwendig animiert) brauchst. Dann wäre **Godot** (kostenlos, Web-Export möglich) der passende Kandidat – die Modelle (.glb) lassen sich dort 1:1 weiterverwenden. Die Arbeit, die du jetzt in Modelle steckst, geht also **nicht verloren**.

## Wo bekommst du Modelle?
Ich kann Modelle nicht selbst „malen“ (kein Blender in meiner Umgebung), aber das Spiel ist vorbereitet. Möglichkeiten:
1. **Kostenlose Pakete (CC0 = darf man frei nutzen):** *Kenney.nl*, *Quaternius* (viele Fantasy-/Mittelalter-/Sci-Fi-Pakete, auch mit Animationen), *Poly Pizza*, *Sketchfab* (Filter „Downloadable“ + Lizenz CC0/CC-BY). Auf die Lizenz achten und in `models/CREDITS.md` eintragen.
2. **Bezahl-Pakete** (Unity Asset Store, Fab.com, itch.io, CGTrader): oft 10–60 € je Paket, meist mit Epochen-Looks. Wichtig: Lizenz „kommerziell nutzbar“ und Format **glTF/GLB** oder FBX (FBX kann man in Blender nach GLB umwandeln).
3. **KI-Generatoren** (Meshy, Tripo, Rodin u. a.): Text/Bild → 3D-Modell, kostet je nach Anbieter ein paar Euro im Monat. Gut für Gebäude und Requisiten; Figuren sind oft ohne Skelett/Animation und brauchen Nacharbeit. Nutzungsrechte des Anbieters prüfen.
4. **Auftragsarbeit** (Fiverr, ArtStation, Reddit r/INAT): ca. 30–150 € je Einheit/Gebäude, mit genauen Wünschen (siehe „Regeln“ unten).
5. **Selbst modellieren:** *Blender* (kostenlos). Zum Lernen gibt es viele deutschsprachige Anfänger-Kurse.

## Regeln für Modelle (das gibst du dem Künstler / prüfst du in der Vorschau)
- Format **.glb** (glTF 2.0 binär). Aus Blender: *Datei → Exportieren → glTF 2.0 → „glTF-Binär (.glb)“*.
- **Blickrichtung +Z** (der Blender-Export macht das normalerweise richtig, wenn die Figur nach „vorn“ −Y schaut), **Y oben**, Modell steht mit den Füßen auf dem Nullpunkt.
- **Dreiecke:** Einheiten bis ca. **8.000**, Gebäude bis ca. **40.000**, Bäume/Felsen bis ca. 3.000. Texturen höchstens **2048 × 2048**.
- **Team-Farbe:** Ein Material (z. B. Fahne, Umhang, Dach-Streifen) bekommt den **Namen „TeamColor“**. Das Spiel färbt es für jeden Spieler anders. Ohne so ein Material sehen beide Spieler gleich aus.
- **Animationen** (nur Einheiten) mit den Namen **Idle** (Stehen), **Walk** (Gehen), **Attack** (Angriff), **Work** (Arbeiten/Bauen). Andere Namen gehen auch, dann in `manifest.json` zuordnen. Fehlt eine Animation, bleibt die Figur dort einfach stehen.
- **Größe:** egal – das Spiel passt jedes Modell automatisch an die Spielgröße an (Einheiten an die Größe des bisherigen Modells, Gebäude an die Grundfläche).
- Für jedes **Zeitalter** darf es ein anderes Modell geben (z. B. Haus aus Fell, aus Holz, aus Ziegeln …).

## So baust du ein Modell ein (ohne Programmieren)
1. **Prüfen:** Die Seite `tools/model-viewer.html` öffnen (im Spiel-Ordner per Doppelklick, oder online unter `…/tools/model-viewer.html`). Die .glb-Datei hineinziehen. Du siehst das Modell, einen Mensch-Maßstab, Team-Farbe Blau/Rot, die Animationen und eine **Prüfliste** (Dreiecke, Team-Material, Animationen).
2. **Einsortieren:** Datei nach `models/units/` (Einheiten) oder `models/buildings/` (Gebäude) kopieren.
3. **Eintragen:** In der Vorschau unten „4 · Eintrag für manifest.json“: Einheit/Gebäude und Zeitalter wählen, den Text kopieren und in `models/manifest.json` bei `"units"` bzw. `"buildings"` einfügen (Beispiele stehen schon drin; bei „off“ → `true` entfernen). Die Namen der Einheiten/Gebäude (z. B. `worker`, `house`, `barracks`) sind die Spiel-Namen aus der Auswahlliste.
4. **Ausprobieren:** Spiel neu laden, Partie starten. Passt die Größe/Drehung nicht: im Eintrag `"scale"` (größer/kleiner, z. B. 1.2), `"yaw"` (Drehung in Grad, z. B. 90) oder bei Gebäuden `"fit"` ändern.
5. **Notieren:** Quelle und Lizenz in `models/CREDITS.md` eintragen.
6. **Veröffentlichen:** wie gewohnt (Pull Request mergen, Release). Die Desktop-App nimmt den Ordner `models/` automatisch mit.

## Beispiel (Eintrag)
```json
"worker": { "file": "units/arbeiter.glb", "epochs": [0,1,2], "yaw": 0, "scale": 1,
            "anim": { "idle": "Idle", "walk": "Walk", "attack": "Attack", "work": "Work" } }
```
Mehrere Zeitalter-Versionen: ein **Array** `[ {…}, {…} ]` mit je eigenem `epochs`.
Nützliche Felder: `height` (Zielhöhe einer Einheit, sonst automatisch), `fit: "length"` (Fahrzeuge nach Länge statt Höhe anpassen), `lift` (Modell etwas anheben), `footprint` (Gebäudebreite fest), `off: true` (Eintrag vorübergehend abschalten).

## Was schon geht und was noch nicht
- ✔ Einheiten (mit Animationen), Gebäude (Zeitalter-Varianten, Team-Farbe, Rauch/Ausbau-Zusätze funktionieren weiter)
- ✔ Rückfall auf die eingebauten Modelle bei fehlender/defekter Datei
- ✘ Noch nicht: **Tiere, Bäume, Felsen** (kommen als nächster Schritt; sie werden anders gezeichnet), Mauern/Tore, Schiffe/Flugzeuge mit eigenen Animationen (laufen als normale Einheit), Sterbe-Animation
- Technik: `js/gltfmodels.js` (Laden), Baustein `js/vendor/gltf-bundle.js` (siehe `tools/gltf-bundle/README.md`).
