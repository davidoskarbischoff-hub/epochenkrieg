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
- `nocol`: Eckpunkt-Farben entfernen (manche Pakete haben sie auf Schwarz stehen → Modell wirkt schwarz)
- `rig`: Figuren mit Unreal-Skelett (Root, Pelvis, Spine_01…, Clavicle_L, Upperarm_L … Ball_R) spielfertig machen (`retarget.js`): aufrecht (Z-oben → Y-oben), Massstab `scale` (cm → m), Eckpunkt-Farben weg (waren schwarz), Knochen bekommen Namen und Achsen des Quaternius-Skeletts (Hips, Abdomen, Torso, Chest, Neck, Head, UpperArmL, WristL …) und die Animationen `clips` der Quaternius-Figur `from` werden übertragen (gleiche Welt-Drehung je Knochen gegenüber der Ruhepose, Hüfthöhe nach Beinlänge). Ruhepose = erstes Bild von Idle (keine T-Haltung). Beispiel und alle Menschen: `menschen.json` (`node tools/fbx2glb/conv.js tools/fbx2glb/menschen.json`).

Die Quell-FBX liegen in `models/fbx/` (werden von der Desktop-App nicht mitkopiert).
