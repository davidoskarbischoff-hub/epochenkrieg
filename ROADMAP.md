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
- [ ] Gegner-KI sieht noch die ganze Karte (kein Nebel für sie)
- [ ] Gegnerische Gebäude merken sich (zeigen im Nebel den letzten bekannten Stand)

### Erledigt: Bedienung
- [x] Statusknopf oben: rot "N untätige Arbeiter", grün "Alle Arbeiter beschäftigt"; rote ! über untätigen Arbeitern
- [x] Gebäude im Bau: Balken mit Prozent, rot und "Kein Bauarbeiter!" wenn niemand baut
- [x] WASD bewegt die Kamera (Angriffsmarsch jetzt auf Q)
- [x] Menü (Esc oder Knopf oben rechts): Regler für Musik und Ton, Sprache Deutsch/Englisch, Neues Spiel

- [x] Gebiet: eigenes Reich grün mit dauerhafter Sicht, Gegner rot (sichtbar nach dem Erkunden); Wachturm erobert neues Land, andere Gebäude nur im eigenen Gebiet
- [ ] Wachturm schon in der Steinzeit erlauben? (jetzt erst ab Bronzezeit, Expansion bis dahin nur über Hütte/Lager am Rand)
- [ ] KI soll ebenfalls Türme zur Expansion bauen

- [x] Balancing Nahrung: Beeren schneller (×1,5), 15 pro Fuhre, Büsche mit 220 Vorrat (`GATHER` in `data.js`)
- [x] Stufen für Einheiten und Gebäude (I/II/III, Farbe + Anzeige): mehr Leben, Schaden, Abbautempo; Upgrade-Knopf im Hauptlager mit Kosten, Dauer und Balken oben; Aufstieg erst nach Upgrade
- [x] Stein erst ab Stufe II, neues Eisen ab Stufe III (Schwertkämpfer kosten Eisen)
- [ ] Upgrade-Kosten und -Dauer nach dem Testspielen anpassen (`UPG`, `UPG_TIME`)
- [x] Upgrade-Liste im Hauptlager: pro Gruppe (Arbeiter, Hütten, …) einzeln oder alles, Kosten grün/rot, mehrere Upgrades gleichzeitig
- [ ] Eigene Technologien pro Epoche

- [x] Karte größer (3600×2400) mit Land und Wasser: tiefes Wasser (nur für Schiffe), flaches Wasser (auch für Truppen), Küste mit Strand
- [x] Wegfindung (A*), Festhänge-Erkennung, Arbeiter verteilen sich auf Bäume; Bäume stehen weiter auseinander
- [x] Fischquellen (Fische, Delfine ab Stufe II, Wale ab Stufe III), Hafen am Ufer, Fischerboote, Kriegsschiffe (Bronzezeit)
- [ ] Seegefechte und Landungen testen und balancen (Kriegsschiffe, Küstenverteidigung)
- [ ] Gegner-KI nutzt Wasser noch nicht (kein Hafen, keine Boote)
- [ ] Brücken über tiefes Wasser

- [x] Grafik aufgewertet: jede Einheit eigenes Aussehen (mit Lauf-, Arbeits- und Schlaganimation), Bäume (Laub und Nadel), Büsche mit Beeren, Felsen und Eisen mit Facetten
- [ ] Grafik: Gebäude im gleichen Stil überarbeiten, Einheiten sehen je nach Stufe unterschiedlich aus (Rüstung)

- [x] Symbole für Nahrung, Holz, Stein, Eisen, Bevölkerung; Kosten grün (leistbar) oder rot
- [x] KI-Berater mit Vorschlägen zum Annehmen/Ablehnen (Y/X), im Menü abschaltbar
- [ ] Berater klüger machen (Angriffe erkennen, Ressourcenengpässe, Verteidigung)
- [ ] Interface weiter an War Selection annähern (Farben, Minikarte, Bildschirmanordnung)

### Einfach
- [ ] Sounds nach dem Testspielen feinjustieren
- [ ] Balancing nach dem Testspielen anpassen
- [ ] Weitere Epochen (z. B. Mittelalter, Neuzeit) mit eigenen Einheiten
- [ ] Grössere Karte, Wahl der Kartengrösse

### Mittel
- [ ] Bessere Wegfindung um Gebäude und Wälder
- [ ] Klügere KI (gezielte Angriffe auf Arbeiter, Rückzug)
- [ ] Technologien und Upgrades pro Epoche
- [ ] Spielstand speichern
- [ ] Mehrere KI-Gegner (bis 4 Spieler, Teams)

### Später / schwer
- [ ] Online-Multiplayer
