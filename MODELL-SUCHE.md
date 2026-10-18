# Modell-Suche (18.10.)

Stand: Die Umgebung, in der Claude arbeitet, darf nicht auf Kenney, itch.io, OpenGameArt, poly.pizza oder Sketchfab zugreifen
(Netzwerk-Sperre). Claude kann deshalb nichts herunterladen und die Seiten nicht öffnen. Die Funde unten stammen nur aus der Suchmaschine.
**Lizenz und Inhalt bitte beim Herunterladen auf der Seite selbst prüfen.** Danach baut Claude die Modelle ein, prüft sie im Spiel gegen die Nachbarn
und trägt sie in `models/CREDITS.md` ein.

Wenn Claude selbst herunterladen soll: im Umgebungsmenü (Titelleiste der Sitzung → Bearbeiten) unter „Netzwerkzugriff“ die Seiten
`kenney.nl`, `itch.io`, `opengameart.org`, `poly.pizza` erlauben (oder einen weiteren Zugriff wählen).

## Was fehlt und wo es vermutlich zu finden ist

| Fehlt | Bester Fund | Lizenz | Format | Sicherheit |
|---|---|---|---|---|
| Feldkanone auf Lafette (Zeitalter 4) | Kenney **Pirate Kit** (Kanone, fahrbare Kanone `cannon-mobile`) – https://kenney.nl/assets/pirate-kit , auch https://opengameart.org/content/pirate-kit | CC0 | GLB/OBJ/FBX | Pack ist CC0; ob die fahrbare Kanone dabei ist, kommt aus Claudes Erinnerung, nicht aus der Suche |
| Feldkanone, Alternative | **Low Poly Cannons on Wheels** (trainedeye) – https://trainedeye.itch.io/low-poly-cannons-on-wheels | CC0 | FBX/Blender (kein GLB; `tools/fbx2glb` kann umwandeln) | Lizenz in der Suche bestätigt, Aussehen unbekannt |
| Feldkanone, Alternative mit Namensnennung | **Low Poly Cannon** (Molotov Kittens) – https://molotov-kittens.itch.io/low-poly-cannon | Namensnennung nötig | GLB/FBX/Blend | Lizenzwortlaut „bitte Credit geben“ |
| Schützengraben, Sandsäcke, Bunker | **WW1 Modular Asset Pack – Trenches & Bunker** (heartgrinder) – https://heartgrinder.itch.io/ww1-modular-asset-pack | CC0 | FBX + GLB (~39 Teile, kleine Textur 512) | Lizenz in der Suche genannt; Optik ansehen |
| Schützengraben, Alternative | 3D trench warfare low poly (Nuclearwinter94) – https://nuclearwinter94.itch.io/tre | unklar | GLB/FBX/OBJ/Blend | Lizenz prüfen |
| Ölbohrturm / Pumpe | Kein CC0-Fund. Sketchfab „Oil Pump Jack“ (_._bespalov_._) – https://sketchfab.com/3d-models/oil-pump-jack-08f0fc1d37d74831912c7b9c59c84d5a | CC-BY (Namensnennung) | Sketchfab-Download (GLB) | Aussehen/Größe ansehen |
| Raffinerie | Kein CC0-Fund. Sketchfab „oil refinery Low poly (FREE in FAB)“ (Pplouch) – https://sketchfab.com/3d-models/oil-refinery-low-poly-free-in-fab-94dba47630fc494e848db40148c1adab | unklar (Fab-Seite prüfen) | GLB über Fab/Sketchfab | Lizenz prüfen |
| Raffinerie-Teile (Tanks, Schornsteine) | Kenney **City Kit (Industrial)** – https://kenney.nl/assets/city-kit-industrial ; Kenney **Factory Kit** – https://opengameart.org/content/factory-kit ; zusammengefasst als GLB: https://eclair-assets.itch.io/industrial-city-glb-pack-25-free-cc0-3d-models (inoffiziell) | CC0 | GLB/FBX/OBJ | Enthaltene Tanks/Schornsteine nicht bestätigt |
| Hangar / Flugfeld | Kein CC0-Fund. „Low Poly Military Base“ (116 Prefabs inkl. Hangar) – https://unityassetcollection.com/low-poly-military-base-free-download/ ; „Realistic Airfield Props Pack“ (CC-BY) – https://downloadforfree.gumroad.com/l/free-realistic-airfield-props-pack-low-poly-3d-model | unklar / CC-BY | GLB/FBX | Stil passt vielleicht nicht; Hangar nicht bestätigt |
| Armbrust (Armbrustschütze trägt Bogen) | **Medieval Weapons – Small Low Poly Pack** (rg-poly) – https://rg-poly.itch.io/medieval-weapons-small-low-poly-pack ; **CrossBow 3D Low-Poly** (hibiz3a) – https://hibiz3a.itch.io/crossbow-3d-low-poly | CC0 (rg-poly) / unklar (hibiz3a) | GLB | Armbrust im rg-poly-Pack nicht bestätigt |

Außerdem sinnvoll, aber nicht gesucht: eine Muskete (Zeitalter 4 trägt heute dasselbe Gewehr wie Zeitalter 5) und ein mittelalterlicher Helm für die Schwert- und Speerkämpfer in Zeitalter 3–4.

## Weitere Quellen, die Claude nicht öffnen konnte
Quaternius (Kits, CC0), KayKit (Kay Lousberg, CC0), Poly Pizza (Filter „CC0“), Kenney „All CC0“-Liste auf OpenGameArt, Poly Haven (Raum bereits benutzt).

## Spielidee-Quellen (nur Ideen, kein Code übernehmen)
Offene RTS-Projekte wie 0 A.D., OpenRA, Widelands, Warzone 2100 haben freie Lizenzen (GPL/CC). Daraus nur Spielideen nehmen (Rüstungsarten, Erfahrungsränge,
Sammelpunkt, Anzeige für fehlende Rohstoffe). Code und Modelle daraus nicht übernehmen, denn GPL passt nicht zu unserem Stil und der Datei-Lizenz.
