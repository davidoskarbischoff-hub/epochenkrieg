# glTF-Baustein neu bauen (nur nötig, wenn Three.js aktualisiert wird)
`js/vendor/gltf-bundle.js` enthält GLTFLoader, GLTFExporter, SkeletonUtils und den Meshopt-Decoder von Three.js r160 als eine Datei, die an das globale `THREE` aus `three.min.js` andockt (`window.EKGLTF`).
Neu bauen (Node.js nötig), in einem leeren Ordner:
1. `npm init -y && npm i three@0.160.0 esbuild`
2. die drei Dateien aus diesem Ordner hineinkopieren (`entry.js`, `mk.mjs`, `build.mjs`)
3. `node mk.mjs && node build.mjs` → `gltf-bundle.js` nach `js/vendor/` kopieren.
Die Version von `three` muss zu `js/vendor/three.min.js` passen (r160).
