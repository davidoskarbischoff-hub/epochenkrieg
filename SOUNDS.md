# Klang: Quellen und Lizenzen

Epochenkrieg verwendet **keine Audiodateien**. Jeder Ton wird beim Spielen im Browser mit der Web-Audio-API erzeugt (`js/audio.js`):

- **Geräusche** (Holz hacken, Hämmern, Schlagen, Pfeile, Schüsse, Kanonen, Stimmen wie Brummen/Kampfschrei, Kriegshorn, Tiergeräusche, Wind und Vögel) entstehen aus Schwingungen und gefiltertem Rauschen. Sie sind eigene Arbeit des Projekts und stehen unter derselben Lizenz wie der Code.
- **Musik** wird als Notenfolge im Code hinterlegt und mit einem einfachen Synthesizer gespielt:
  - Steinzeit: Erik Satie, *Gymnopédie Nr. 1* (1888, gemeinfrei)
  - Bronzezeit: Johann Pachelbel, *Kanon in D* (um 1680, gemeinfrei)
  - Eisenzeit: Edvard Grieg, *In der Halle des Bergkönigs* (1875, gemeinfrei)
  - Mittelalter: *Greensleeves* (traditionell, gemeinfrei)
  - Renaissance: Ludwig van Beethoven, *Ode an die Freude* (1824, gemeinfrei)
  - Industriezeit: eigene Marschmelodie (Eigenkomposition im Stil des 19. Jahrhunderts)
  - Klang-Technik: Hall (Faltungshall aus abklingendem Rauschen), Stereo-Position und Lautstärke nach Bildschirmposition, Kompressor gegen Übersteuern, Klavier/Zupf-/Streicher-Klänge aus Oszillatoren.
  - Kampfmusik: eigene Trommel-, Bläser- und Streicherebenen je Epoche (Eigenkomposition), mit drei Spannungsstufen (Epochenmusik, Kampfebene, Höchststufe bei großen Gefechten).

Die Noten sind vereinfachte Eigenbearbeitungen; die Werke selbst sind gemeinfrei. Es werden keine Samples, Soundfonts oder Bibliotheken von Dritten eingebunden.

**Bedienung:** Regler „Musik“ und „Ton“ im Menü, Schalter „Ton an“ im Menü, Taste **M** schaltet alles stumm. Die Einstellungen werden im Browser gespeichert.

## Nachtrag: Musikdateien
Seit Paket K spielt die Musik aus acht von David bereitgestellten mp3-Dateien in `music/` (Quelle/Lizenz: `music/CREDITS.md`, Lizenz noch zu prüfen). Der Synthesizer-Teil oben bleibt als Rückfall, falls eine Datei fehlt.
