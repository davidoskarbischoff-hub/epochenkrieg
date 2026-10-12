# FBX → GLB umwandeln

Das Spiel lädt nur `.glb`. FBX-Dateien (z. B. aus itch.io-Paketen) wandelt dieses Werkzeug im Browser (Chromium über Playwright, three.js r160 FBXLoader + GLTFExporter) um.

Einmalig: `cd tools/fbx2glb && npm install three@0.160.0` (Ordner `node_modules` wird nicht eingecheckt).

Aufruf: `node tools/fbx2glb/conv.js auftraege.json` mit einer Liste von Aufträgen:

```json
[{"src":"models/fbx/towers/_archer_tower_LVL_1.fbx","out":"models/towers/archer_1.glb",
  "tex":{"Texture_MAp_fortress_elves.png":"models/fbx/towers/Texture_MAp_fortress_elves.png"}}]
```

- `tex`: Texturname aus der FBX → Datei im Spielordner (fehlt sie, bleibt das Modell weiss)
- `noflip`: Textur nicht spiegeln. Vorsicht bei Farbstreifen-Texturen: falsch gesetzt vertauscht es die Farben (oben ↔ unten). Turm-Paket: **ohne** `noflip` (geprüft: Kanonen dunkel, Ranken/Dächer grün, Mauern hell); mit `noflip` wurden Kanonen cremefarben und Ranken braun.
- `dark`: Materialfarben aufhellen (Quaternius-FBX werden sonst doppelt abgedunkelt)
- `rotX`: Drehung um X in Grad (Z-oben → Y-oben)

Die Quell-FBX liegen in `models/fbx/` (werden von der Desktop-App nicht mitkopiert).
