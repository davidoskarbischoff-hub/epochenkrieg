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
