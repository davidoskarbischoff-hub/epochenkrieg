# Roadmap

## Schon drin (Prototyp v0.1)
- [x] Karte mit Bäumen, Beerensträuchern und Steinvorkommen, fair gespiegelt
- [x] Ressourcen: Nahrung, Holz, Stein
- [x] Gebäude: Hauptlager, Hütte, Lager, Kaserne, Wachturm
- [x] Einheiten: Arbeiter, Keulenkrieger, Speerträger, Bogenschütze, Schwertkämpfer
- [x] Drei Epochen: Steinzeit, Bronzezeit, Eisenzeit
- [x] KI-Gegner mit drei Schwierigkeitsstufen, greift in Wellen an
- [x] Minikarte, Zoom, Sammelpunkte, Angriffsmarsch, Tempo 1–3×

## Aufgeräumt
- [x] Dateien in `css/` und `js/` einsortiert (style.css, game.js, data.js)
- [x] Testlauf im Browser: Partie startet, keine Skriptfehler
- [x] Flackernde Aktionsleiste behoben (hell/dunkel-Wechsel); bezahlbar = hell, Rest ausgegraut
- [x] Favicon ergänzt
- [x] Sounds: Geräusche (Axt, Spitzhacke, Rascheln im Busch, Schwert, Pfeil, Alarm, Fanfare), Knöpfe Musik/Ton, Tasten M und N
- [x] Musik: klassische, gemeinfreie Stücke je Epoche (Satie, Pachelbel, Grieg)

- [x] Krieger-Linien mit einem Grundkörper (Adventurer) durch alle Zeitalter, Teamfarbe ab Mittelalter, Brustpanzer/Stahlhelm als echte Modelle (`wear`)
- [ ] Armbrust-Modell für den Armbrustschützen besorgen (trägt noch Bogen)
- [x] Truppen/KI hängen fest auf grossen Karten: Entfernungsfeld bei langen Wegen, Neusuche nach Abdrängen, Gleiten am Ufer (Ankunft 386→441 von 448, Festhänge-Auslöser 6836→231, KI-Stillstand 5–26 %→<1 %)
- [ ] Wegfindung: Boote zu unerreichbaren Fischgründen suchen immer wieder (Kosten), Dinos/Tiere blockieren Pässe
## Ideen für die nächsten Schritte
Davids eigene Wünsche aus dem Testspielen hier ergänzen und nach oben sortieren.

### Als Nächstes (Davids Wunsch, früh wichtig)
- [x] Nebel des Krieges: dunkelgrau = unerkundet, hellgrau = erkundet, hell = gerade sichtbar (Karte nie schwarz) (auch auf der Minikarte)
- [x] Späher (Hauptlager, 60 Nahrung + 20 Holz): schnell, Sichtweite 300, kämpft nicht von selbst
- [x] Gegner-KI sieht noch die ganze Karte (kein Nebel für sie)
- [x] Gegnerische Gebäude merken sich (zeigen im Nebel den letzten bekannten Stand)

### Erledigt: Bedienung
- [x] Statusknopf oben: rot "N untätige Arbeiter", grün "Alle Arbeiter beschäftigt"; rote ! über untätigen Arbeitern
- [x] Gebäude im Bau: Balken mit Prozent, rot und "Kein Bauarbeiter!" wenn niemand baut
- [x] WASD bewegt die Kamera (Angriffsmarsch jetzt auf Q)
- [x] Menü (Esc oder Knopf oben rechts): Regler für Musik und Ton, Sprache Deutsch/Englisch, Neues Spiel

- [x] Gebiet: eigenes Reich grün mit dauerhafter Sicht, Gegner rot (sichtbar nach dem Erkunden); Wachturm erobert neues Land, andere Gebäude nur im eigenen Gebiet
- [x] Wachturm schon ab der Steinzeit baubar
- [x] KI soll ebenfalls Türme zur Expansion bauen

- [x] Balancing Nahrung: Beeren schneller (×1,5), 15 pro Fuhre, Büsche mit 220 Vorrat (`GATHER` in `data.js`)
- [x] Stufen für Einheiten und Gebäude (I/II/III, Farbe + Anzeige): mehr Leben, Schaden, Abbautempo; Upgrade-Knopf im Hauptlager mit Kosten, Dauer und Balken oben; Aufstieg erst nach Upgrade
- [x] Stein erst ab Stufe II, neues Eisen ab Stufe III (Schwertkämpfer kosten Eisen)
- [ ] Upgrade-Kosten und -Dauer nach dem Testspielen anpassen (`UPG`, `UPG_TIME`)
- [x] Upgrade-Liste im Hauptlager: pro Gruppe (Arbeiter, Hütten, …) einzeln oder alles, Kosten grün/rot, mehrere Upgrades gleichzeitig
- [x] Eigene Technologien pro Epoche

- [x] Karte größer (3600×2400) mit Land und Wasser: tiefes Wasser (nur für Schiffe), flaches Wasser (auch für Truppen), Küste mit Strand
- [x] Wegfindung (A*), Festhänge-Erkennung, Arbeiter verteilen sich auf Bäume; Bäume stehen weiter auseinander
- [x] Fischquellen (Fische, Delfine ab Stufe II, Wale ab Stufe III), Hafen am Ufer, Fischerboote, Kriegsschiffe (Bronzezeit)
- [ ] Seegefechte und Landungen testen und balancen (Kriegsschiffe, Küstenverteidigung)
- [x] Gegner-KI nutzt Wasser noch nicht (kein Hafen, keine Boote)
- [ ] Brücken über tiefes Wasser

- [x] Grafik aufgewertet: jede Einheit eigenes Aussehen (mit Lauf-, Arbeits- und Schlaganimation), Bäume (Laub und Nadel), Büsche mit Beeren, Felsen und Eisen mit Facetten
- [x] Grafik: Gebäude im gleichen Stil überarbeiten, Einheiten sehen je nach Stufe unterschiedlich aus (Rüstung)

- [x] Symbole für Nahrung, Holz, Stein, Eisen, Bevölkerung; Kosten grün (leistbar) oder rot
- [x] KI-Berater mit Vorschlägen zum Annehmen/Ablehnen (Y/X), im Menü abschaltbar
- [x] Berater klüger machen (Angriffe erkennen, Ressourcenengpässe, Verteidigung)
- [ ] Interface weiter an War Selection annähern (Farben, Minikarte, Bildschirmanordnung)

- [x] Befehlsketten: Umschalt + Rechtsklick/Bauen/Angriffsmarsch hängt Aufträge an (Nummern und Linie auf der Karte)
- [x] Befehlsketten: Schleife (Patrouille), Kette per Tastenkürzel löschen

- [x] Nebel und Gebietsrand mit weichen Kanten
- [x] Zwei neue Zeitalter: Mittelalter (Ritter, Armbrustschütze, Galeone, Burg; Musik: Greensleeves) und Neuzeit (Musketier, Kanone; Musik: Ode an die Freude)
- [ ] Neue Epochen balancen (Kosten, Aufstiegszeit, Einheitenwerte) und weitere Gebäude/Technologien
- [x] Mauern und Belagerung (Rammbock, Katapult) fürs Mittelalter

- [x] Technologien pro Gebäude (Hauptlager, Hafen, Kaserne, Türme): ein bis zwei pro Epoche, nur aktuelle sieht man; Truppen müssen erst freigeschaltet werden (z. B. Speerbau, Eisenschmiede, Reiterei, Schießpulver)
- [x] Hafen-Technologien: größere Netze, stationäre Fischer (Nahrung ohne Quelle), schnelle Kiele, Harpunen, Schiffs- und Galeonenbau
- [x] Späher erkunden automatisch (Taste E / Knopf); Berater schickt Späher, erkennt Angriffe, Verteidigung, Rohstoffmangel
- [x] KI: Hafen, Fischerboote, Kriegsschiffe/Galeonen, Flotte greift an; Türme zur Expansion; eigene Erkundung (muss den Spieler erst finden); Rückzug bei großen Verlusten
- [x] Mauern (ab Mittelalter), Rammbock und Katapult (Technologie Belagerungswerkstatt)
- [x] Befehlsketten: Taste L = Schleife (Patrouille), Rücktaste = Kette löschen
- [x] Gebäude im neuen Grafikstil mit Material je Epoche; Einheiten zeigen ihre Stufe (Umhang, Schulterschmuck, Kamm, Schimmer)
- [ ] Balancing nach Testspielen: Technologie-Kosten, Belagerer, Marine, KI-Tempo
- [ ] Brücken über tiefes Wasser
- [x] Mehrspieler für zwei Spieler: Lobby mit Einladungslink, Kartenwahl, Seitenwahl; Gastgeber rechnet, Gast schickt Befehle (WebRTC über PeerJS, oder zwei Tabs lokal)
- [x] Vier Karten: Küste und Landzunge, Festland, Bergland (Berge, Klippen, Hafen nur an Lücken), Große Bucht; Auswahl auch im Einzelspiel
- [x] Mehrspieler-Fehler behoben: Gast-Aufstieg stufte dessen Einheiten wie bei der KI sofort hoch und schenkte alle Technologien („Alle upgraden“ beim Gast wirkungslos); Gast konnte keine Mine setzen (Gastgeber prüfte Erze gegen seinen eigenen Nebel)
- [ ] Mehrspieler weiter ausbauen: Reconnect, Chat, Bereit-Knopf, Zuschauer, Spiel pausieren, 3–4 Spieler, Team-Farben wählbar, Sound-Events beim Gast
- [ ] Mehrspieler: Berater und Pause im Mehrspieler; verzögerungsfreie Vorhersage für den Gast
- [ ] Karten: Höhenstufen (Plateaus mit Rampen), Brücken, Karte-Zufallsauswahl, mehr Kartenarten
- [ ] Spielstand speichern, Kartengröße wählbar, mehrere KI-Gegner/Teams

### Einfach
- [ ] Sounds nach dem Testspielen feinjustieren
- [ ] Balancing nach dem Testspielen anpassen
- [ ] Grössere Karte, Wahl der Kartengrösse

### Mittel
- [ ] Bessere Wegfindung um Gebäude und Wälder
- [ ] Klügere KI (gezielte Angriffe auf Arbeiter, Rückzug)
- [x] Technologien und Upgrades pro Epoche
- [ ] Spielstand speichern
- [ ] Mehrere KI-Gegner (bis 4 Spieler, Teams)

### Später / schwer
- [ ] Online-Multiplayer

## Zuletzt erledigt
- [x] Ressourcen: grosse Vorkommen, Wälder, Steinhaufen
- [x] Schräge 2,5D-Ansicht mit aufrechten Figuren (`sprites.js`)
- [x] Oberfläche im dunklen Stein/Bronze-Stil, Minikarte unten links
- [ ] Idee: Befehlsknöpfe mit eigenen Symbolen und Tastenkürzeln für alle Aktionen
- [x] Kartenauswahl mit Vorschaubildern (`mapPreview` in nav.js), neue Karte Seenplatte, Seen/Teiche auf mehreren Karten (`lakes` in `MAPS`)
- [x] Berater: 5 Taktiken (`STRATS`), Lagebild/Erkenntnisse über den Gegner (`advIntel`), Auto-Modus
- [x] Code aufgeteilt (state/map/sim/ai/commands/input/mp/advisor/render/ui/main)
- [x] Optik: weiche Küsten, Sandstrand und Brandung, Gras mit Korn/Blumen/Steinchen, Küstenschatten, Licht von links oben
- [x] Partikel: Rauch (Hütten, Hauptlager), Feuer bei beschädigten Gebäuden, Staub, Funken im Kampf, Späne beim Sammeln, Kielwasser
- [ ] Nächste Optik-Ideen: Tag/Nacht-Licht, Wolkenschatten, bessere Schatten, Wasser-Animation
- [ ] Später: echte 3D-Modelle oder vorgerenderte Bilder, Spielserver, Steam

## Plan nach dem 3D-Test (Stil ist entschieden: 3D mit Three.js, siehe 3dtest.html / js/test3d.js)
1. [ ] 3D-Umstieg Darstellung: neuer Renderer `render3d.js` statt `render.js`/`sprites.js`; Spielregeln, KI, Mehrspieler bleiben. Klicken per Strahl (Raycast), Kamera wie im Test, Minikarte bleibt 2D.
2. [ ] Mehr Detail an den 3D-Modellen (Epochen-Aussehen, Fenster, Dachziegel, Texturen), später echte Modelle (glTF) einsetzbar.
3. [ ] Wilde Tiere (`kind:'animal'`): Reh (friedlich, jagbar = Nahrung), Wolf, Bär, Tiger (Aggro-Reichweite, Revier/Leine), Anzahl je nach Zone/Biom; Mehrspieler-Spielstand und Nebel beachten.
4. [ ] Ton und Musik: bessere Geräusche, dynamische Musik (ruhig im Frieden, Kampfmusik bei Krieg/Angriff, Übergänge).
5. [ ] Danach: Spielserver, GitHub Pages, Steam-Vorbereitung.

## Stand nach der grossen Überarbeitung (3D, Tiere, Ton, Balancing)
- [x] 3D-Darstellung (Three.js): Gelände mit Höhen, Modelle je Epoche, Bäume/Büsche/Felsen als Instanzen, Gras und Blumen, Wellen
- [x] Wilde Tiere: Reh (jagbar), Wolf, Bär, Tiger mit Revier und Aggro-Reichweite
- [x] Dynamische Musik (Kampfebene), Wind, Vogelgezwitscher, Raubtier-Geräusche
- [x] Balancing: KI-Tempo (`AI_MINT`), Heeresgrösse (`DIFF.army`), Nahrung wächst nach, mehr Beeren, KI baut Lager
- [x] Berater: Lager am Wald, Fischerboote, Arbeiter umverteilen; Aufstieg braucht 10/20/30/40 Arbeiter
- [x] Anleitung GitHub Pages: `VEROEFFENTLICHEN.md`
- [ ] Idee: Felder/Farmen als wiederholbare Nahrungsquelle, Heilung/Priester, Luftheinheiten (F3)
- [ ] Idee: Modelle durch echte glTF-Modelle ersetzen (`models3d.js` ist die einzige Stelle)
- [ ] Idee: Spielserver für zuverlässigen Mehrspieler, Steam-Vorbereitung (Electron/Tauri)
- [ ] Idee: Tag/Nacht, Wetter, Schnee/Wüste-Gebiete

## Runde: Epochen-Looks, Gegner-Typen, Gold, Ton
- [x] Sechstes Zeitalter (Industriezeit), Einheiten sehen je Stufe anders aus, Steinzeit-Gebäude (Zelte, Totem, Menhire), Renaissance-/Industrie-Zusätze
- [x] Sprachwahl bleibt hervorgehoben, Tempo 5
- [x] Gegner-KI auf „normal“ abgeschwächt, Gegner-Typen (Turtle, Rush, Wirtschaft, Aufstieg, Ausgewogen)
- [x] Berater schneller, konkreter, dringende Vorschläge unterbrechen, Minen/Markt/Mangel-Regeln
- [x] Gold, Minen (für Eisen und Gold), Markt, Rohstoffe erscheinen je Epoche
- [x] Mammut und Säbelzahntiger (sterben aus), Wölfe/Bären/Tiger erst später
- [x] Stimmen, Kriegshorn, dritte Musikstufe, Ton-Schalter, `SOUNDS.md`
- [ ] Idee: Gegner-Typ „Zufall“, Handelsrouten/Schiffe mit Gold, Berater-Warnung bei Gold-Überschuss
- [ ] Idee: Mehrspieler siehe `MEHRSPIELER-VORSCHLAG.md`

## Runde 3: Animation, Karten, Felder, Kampf
- [x] Animationen (Gehen, Abbauen, Kampf, Treffer, Sterben), Teamfarben an allen Figuren
- [x] Hall und Stereo-Klang, bessere Instrumente
- [x] Karten Flusstal und Gebirgspass, Berge mit Schnee überall, Biome, Wegfindungs-Fehler behoben
- [x] Arbeiter reparieren/bauen selbst, Frontlinie, Berater reagiert auf Angriff, Felder, Heiler, Kampfrausch, Gegenstücke
- [ ] Idee: Handelsrouten/Schiffe mit Gold, Inselkarten mit Schiffsüberfahrt, Formationen, weitere Fähigkeiten pro Einheit

## Runde J
- [x] KI-Bauabstände, Arbeiter-Verteilung, verborgene Erze, Öl, Mauern/Tore, Sanitäter, Formationen, Nationen, Flugzeuge/Flugplatz
- [ ] Diktaturen/Asien-Zweig im Zeitalter-Baum, 21. Jahrhundert, bessere Flugzeugmodelle, Luftabwehr, Mehrspieler für Nationen

## Runde K
- [x] Ausbaubäume (Turm, Hauptlager, Kaserne), KI baut sie aus
- [x] Balance Weltkriegseinheiten (Duell-Test kostengleicher Gruppen)
- [x] Leistung: Gitter für Kollisionen, gedrosselte Feindsuche/Zählung
- [x] Mehrspieler-Lobby: Grösse, Karte, Tempo, Farbe, Vorschläge
- [x] Echte Kartengrössen (Randgebirge), Ausbau Hafen/Markt/Flugplatz
- [ ] Kartengrösse auch im Einzelspieler-Startmenü, Fliegerabwehr, Diktaturen-Zweig ausbauen

## Desktop-App
- [x] Electron-App (Windows, Mac optional) mit Vollbild, ohne Server, ohne Hintergrund-Drosseln
- [x] Auto-Update über GitHub Releases mit Bestätigung, Versionsanzeige im Menü
- [x] GitHub Action baut den Installer bei neuem Release; Anleitung in `VEROEFFENTLICHEN.md`
- [ ] Windows-Installer signieren (kostenpflichtig, entfernt die SmartScreen-Warnung), Mac-Signatur/Notarisierung
- [ ] Einladungslink direkt in der App öffnen (eigenes `epochenkrieg://`-Protokoll), Steam-Anbindung später prüfen

## Grafik (Schritt für Schritt) – bisher nur auf dem Branch, noch nicht veröffentlicht
- [x] 1 Licht & Stimmung: wärmeres Licht, kühles Gegenlicht, Kontaktschatten, Vignette, Farbkorrektur
- [x] 2 Gelände & Wasser: Küstenschaum, grossflächige Bodenvariation
- [x] 3 Vegetation: Wind in Bäumen, Büschen und Gras
- [x] 4 Materialien: Umgebungsspiegelung für alle Materialien
- [x] 5 Effekte: Rauch aus Schornsteinen/Schmieden
- [x] 6 Leuchten (Bloom, abschaltbar)
- [ ] Später: Wasserspiegelung, Tag/Nacht und Wetter, Feuer und Staub in 3D, echte Nachbearbeitung (SSAO)
- [x] Wirtschaft: mehr Stein und Eisen in mittlerer/grosser Entfernung

## Neue Modelle / Engine
- [x] glTF-Pipeline (Manifest, Rückfall, Team-Farbe, Animationen, Vorschau-Werkzeug, Anleitung `MODELLE.md`)
- [ ] Modelle beschaffen (CC0-Pakete, KI-Generator oder Auftrag) und erste Einheit/Gebäude je Zeitalter austauschen
- [ ] glTF für Tiere, Bäume und Felsen (Instanzen), Mauern/Tore, Sterbe-Animation
- [ ] Spätere Entscheidung: Engine-Wechsel (Godot) nur bei Steam-/Konsolenplänen oder sehr vielen animierten Einheiten

## Release 2 – Runde 1 (2026-10-11)
- [x] Mauer durch Ziehen bauen
- [x] Dichte Wälder mit Durchgängen, nur Randbäume fällbar; KI holt Holz auch weiter weg (60-Minuten-Test: Holz geht nicht aus)
- [x] Arbeitsgeräusche (Axt, Beeren, Bauen) passend und gleich laut; Tiere schauen in Laufrichtung
- [x] Obere Leiste in zwei festen Ebenen (springt nicht mehr)
- [x] Alle Menschen in Arbeitergröße, kein Schwert bei Schützen, Speer kürzer, Feldarbeit mit Sense, Animationen im Spieltempo
- [x] Veraltete Truppen in späteren Zeitaltern nicht mehr ausbildbar (`UPTO`/`uOk`)
- [x] Gebäude abreißen (50 % zurück)
- [x] Minen neu: Stein/Eisen/Gold nur mit Mine, Bergleute drinnen, Lore zum Lager, Ausbau Schienen/Tiefer Stollen
- [x] Kenney-Schiffe/Katapult/Ramme mit Farbtabelle, Bäume größer, Erze als gleiche Felsart, Kaserne je Zeitalter, Hauptlager Renaissance
- [x] Desktop-App kopiert alle benutzten Modelldateien
- [ ] Einheiten-Kontinuität (ein Grundkörper je Truppenlinie, Ausrüstung je Zeitalter); Heiler-Modell; Klötzchen-Figuren ersetzen
- [ ] Ritter mit echtem Pferd; Bohrturm/Raffinerie-Modelle; Ölfelder unregelmäßiger
- [ ] Englisch vollständig (21 Texte), Fenster „Mitwirkende“ (CC-BY-Namensnennung)
- [ ] Unbenutzte Modelle in Archiv-Ordner, Code-Modelle auslagern, Verschlanken (siehe RELEASE-2.md)
- [ ] Leistung: nur sichtbare Bäume zeichnen

## Release 2 – Runde 2 (2026-10-11)
- [x] Reiter auf echtem Pferd (Ritter, Kürassier, Kosak, Kamelreiter: Pferd + Soldat der Schwertlinie), Heiler mit Truppenkörper statt Hexe
- [x] Englische Übersetzung vollständig; Reiter „Mitwirkende“ im Optionsmenü (Lizenzen/Namensnennung)
- [x] Unbenutzte Modelle nach `models/archiv/` (772 Dateien, 162 MB, nichts gelöscht)
- [x] Bäume ohne Schatten bis Grafik „Mittel“ (Testmessung ×2,6 schneller)
- [ ] Kanone/Haubitze/Panzerschiff haben weiter gute Code-Modelle (kein passendes glTF vorhanden)
- [ ] Code-Modelle bleiben als Rückfall in models3d.js (werden noch für Lore, Artillerie, Schiffe gebraucht)

## Release 3 (gemerkt)
- [ ] Vorschaubilder in den Knöpfen (Kaserne, Hauptlager …) zeigen noch das allgemeine Modell – eigene, schönere Bilder je Einheit/Zeitalter

## Release 2 – Runde 3 (Davids Testrunde)
- [x] Menü: untere Konsole ausgeblendet, Knopf „Übernehmen“; Holzfällen leiser; Fische weiter auseinander, blockieren Boote nicht
- [x] Weniger Hirsche/Mammuts, mehr Wölfe; mehr Wälder und Haine; Lore fährt nicht zum Hafen
- [x] Bau-Animation erst am Bauplatz; Bücken beim Beerenpflücken; Feldarbeiter auf dem Acker
- [x] Rammbock, Katapult, Ruderboot fahren geradeaus; Fischer sitzt im Ruderboot
- [x] Gold/Eisen mit Kristallen; Öl als unregelmäßige Lache; Steinzeit-Fellweste, engerer Fellrock
- [x] Späher-Kreislauf (Gegner → Karte → Gegner)
- [x] Forschung in der Warteschlange (mit Ausbildung, einzeln, Kosten über Zeit)
- [x] Mine direkt auf dem Vorkommen, 8 Bergleute, erschöpft = dunkel, Abriss gibt Minenlager zurück
- [x] Reiter sitzen mit angewinkelten Beinen; Lanzen-/Speerreiter und Schwertreiter
- [ ] Fischernetze am Boot (kein passendes Modell vorhanden)
- [ ] Schwere Reiterei: Pferd und Reiter mit Rüstung (Pferdedecke/Harnisch) – Release 3

## v0.2.1 – Leistung und Hauptmenü (2026-10-11)
- [x] Leistung im Langzeitspiel: Wegsuche ~5× schneller, KI-Turmsuche gedrosselt, Gelände in Stücken (nur Sichtbares wird gezeichnet), Vorkommen ausserhalb des Bildes übersprungen, dynamische Auflösung bei wenig FPS.
- [x] Hauptmenü (`js/mainmenu.js`, `css/mainmenu.css`): Ladebildschirm „Epochenkrieg – Daveson für Deus Vult Infidel“, Hauptseite mit eigener Musik und fliegender Kamera über die Karte, Einzelspieler-Seite mit Kartenkacheln, Reglern (Kartengröße, Schwierigkeit, Wildtiere) und Gegner-Kacheln; Mehrspieler mit Beta-Hinweis; Tutorial (Release 3) und Story (Release 4) als „Bald“.
- [ ] Tutorial (Release 3), Story (Release 4).
- [ ] Altes `showStart` in ui.js entfernen, sobald das neue Menü bewährt ist.
- [ ] Eigenes, langes Menü-Musikstück (jetzt: Greensleeves-Synthesizer).

## Grafik-Runde 1: Figuren und frühe Gebäude (2026-10-11)
- [x] Puppen-Figuren (Animated Base Character) ersetzt: Steinzeit bis Eisenzeit nutzen jetzt die Quaternius-Figur „Adventurer“ (gleicher Stil wie Bauer/Soldat), je Zeitalter andere Kleidung (Steinzeit: Fell, nackte Beine, Fellrock, Zahnkette; Bronzezeit: Leinen + Leder; Eisenzeit: Wolle), Haut- und Haarfarbe je Figur verschieden (`skins`, `hairs`, Farbe `skin` im Manifest).
- [x] Arbeiter-Linie: Adventurer (Stein/Bronze/Eisen) → Bauer (Mittelalter/Renaissance) → Arbeiter (Industrie/Weltkrieg).
- [x] Eigene Gebäude für Steinzeit (Fellzelte, Mammutknochen-Hütte, Schädel, Stoßzahn-Tor, Feuerstellen) und Bronzezeit (Rundhäuser mit Strohdach, Speicher auf Stelzen, Palisade, Bronzeschilde): `js/eramodels.js`.
- [ ] Nächste Schritte Grafik: Eisenzeit-Gebäude eigener Stil, Krieger-Ausrüstung je Zeitalter verfeinern (Helme, Rüstungen), Tiere/Bäume prüfen, Mine/Feld in der Steinzeit.

## Neue Modelle von David (2026-10-12)
- [x] Dinosaurier in der Steinzeit (statt Mammut/Säbelzahntiger): Parasaurolophus (scheu, Herde), Triceratops und Stegosaurus (friedlich, wehren sich), Brontosaurus (riesig, selten), Velociraptor (Rudel, greift an), T-Rex (nur einer je Seite, greift alles an). Sterben beim ersten Aufstieg aus.
- [x] Fahrzeuge Weltkriegszeit: Späher = Kradmelder (Motorrad), Sanitäter = Sanitätswagen, Lore ab Industriezeit = Lastwagen.
- [x] Foltergeräte als Beiwerk: Galgen, Pranger, Käfig an der Burg (Mittelalter/Renaissance), Pranger an der Kaserne (Mittelalter).
- [x] Architektur: Torbogen am Hauptlager (Eisenzeit), Kirche am Hauptlager (Mittelalter), Scheune = Lager ab Industriezeit, Riesenrad am Markt ab Industriezeit.
- [ ] Noch ungenutzt: Hubschrauber, Jeep, Light Tank, Military Boat, Fahrrad, Brücke, Cottage, Cabin Shed, Fortress, Castle, Guillotine, Elektrischer Stuhl u. a. – Ideen: Jeep/Light Tank als Nationen-Einheiten, Military Boat als Patrouillenboot, Brücke über Flüsse.
- [x] Quelle/Lizenz der neuen Modelle in models/CREDITS.md eintragen.

## Davids Testrunde 2 (2026-10-12)
- [x] Kleinere Karten: Kamera bleibt beim Spielfeld, vom Randgebirge nur ein schmaler Streifen (große Karte unverändert)
- [x] Gebäude wechseln ihr Aussehen erst nach dem Upgrade (nicht schon beim Aufstieg), z. B. Kaserne
- [x] Herbstbäume entfernt (kommen mit den Jahreszeiten wieder); Kolosseum nicht mehr als Kaserne
- [x] Arbeiter-Kleidung je Zeitalter: Steinzeit Fell/Leder, Bronzezeit Leinen mit Ocker, Eisenzeit grüne Wolle
- [x] Karren wird von einem Arbeiter geschoben (`rider.push` im Manifest)
- [x] Hinweise über den Ausbildungs-Knöpfen: Rolle, Leben, Angriff/Heilung, Reichweite, Tempo, Stark gegen (`unitTip` in ui.js)
- [x] Bogenschützen halten den Bogen im ausgestreckten Arm; Holzfällen: Schlag nach vorn, Axtklinge zum Baum
- [x] Mehr Land auf Küste/Bucht/Bergland; Kartenvorschau mit Höhen, Fels, Schnee, Hangschatten
- [x] Fischgründe klein und verteilt, auch im tiefen Wasser; Delfine brauchen das Segelboot (Stufe IV), Wale den Kutter (Stufe VI), beide mehr Nahrung, Wal gibt zusätzlich Öl
- [x] Leistung: Gras nur im Bild, Bäume und Gelände vereinfacht in der Fernsicht, Bäume genauer am Bildrand abgeschnitten, Figuren als ein Teil gezeichnet, versteckt statt gelöscht außerhalb des Bildes, Schatten jedes 2. Bild (siehe Messwerte in OPTIMIERUNG.md)

### Merkliste (später)
- [ ] Jahreszeiten: Frühling (blühend), Sommer, Herbst (orange/gelbe Bäume, die Herbstbäume sind schon im Natur-Paket), Winter (Schnee); evtl. ausgetrocknet im Sommer
- [ ] Kolosseum als Hauptlager der Nation Italien (größer skaliert)
- [ ] Lore auf Schienen nach dem Ausbau „Schienen“ an der Mine – braucht ein echtes Loren-Modell (David um ein Paket bitten; die alte Code-Lore ist nach Davids Regel nicht erlaubt)
- [ ] Holzfällen: eigene Hack-Animation von oben (es gibt im Paket nur Schlag/Schwert-Bewegungen)
- [ ] Bogenschützen: echte Spann-Animation (Paket mit Bogen-Animationen nötig)

## Release 3 – Animationen (2026-10-13)
- [x] Universal Animation Library wird beim Laden auf unsere Figuren übertragen (`ualFor` in gltfmodels.js, `UAL:Name` im Manifest): Sterben (Death01), Karren schieben (Push_Loop), kniend bauen (Fixing_Kneeling)
- [x] Wikingerboot = Kriegsschiff, großes Segelschiff = Galeone
- [x] Treffer-Reaktionen (Hit-Clips), Kampfhaltung je Waffe, Lauftempo an Geschwindigkeit gekoppelt, Lore mit sichtbarer Ladung und Schieber am Griff, Avatare Mittelalter/Neuzeit mit Teamfarbe
- [ ] Weitere UAL-Bewegungen: Sitzen für Reiter/Ruderer, Aufheben beim Pflücken
- [ ] Truppenlinien in Ep. 5/6 (Speer/Schwert/Bogen = gleiche Soldier-Figur) besser unterscheiden; Teamfarbe in Ep. 6 (Tarnfarbe) kaum sichtbar
- [ ] Lore-Schieber: Hände noch leicht über den Holmen, eigenes Schiebe-Paket wäre besser
- [ ] Bogenschießen und Axthieb von oben: nicht in UAL1 (evtl. UAL2)
- [ ] Neue Gebäude (Bank, Krankenhaus, Laden, Häuser, Wohnblöcke): Texturdatei fehlt, deshalb noch nicht benutzt

- [x] Ufer-Fischen für Arbeiter, Fischer auf Segelboot/Kutter, Nationen-Einheiten auf Adventurer, Pferde kleiner, Stahlhelm als eigene Datei

## Spielzimmer (12.10.)
- [x] Karte als Brett auf echtem Schreibtisch in der Maler-Werkstatt (Rundum-Foto 4K als Raum mit Boden)
- [x] Hauptmenü: Kamera kreist um den Tisch; Brett zeigt gewählte Karte (auch beim Drüberfahren) und Grösse
- [x] Anflug vom Raum zum eigenen Hauptlager (~5 s), Menümusik „Die Moldau“
- [x] Fische: ruhige Arten (Thunfisch, Schnapper), Schwarm mit Abstand
- [x] Raum-Auswahl (Werkstatt/Studio) und Spielzimmer an/aus im Menü (Grafik)
- [ ] Bei kleiner Karte: Randgebirge auf dem Brett eher als Brettrand gestalten
- [x] Ladezeit: Raum lädt erst nach den Spielmodellen; unbenutzte Raum-Modelle und Roh-Bilder ins Archiv (models/raum jetzt ~23 MB)
