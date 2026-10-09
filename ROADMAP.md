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
