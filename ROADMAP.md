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
- [ ] Spielstand speichern, Kartengröße wählbar, mehrere KI-Gegner/Teams, Online-Multiplayer (große Brocken, bewusst noch offen)

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
