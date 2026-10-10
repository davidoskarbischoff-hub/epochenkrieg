# Mehrspieler: Abstürze – Ursachen, Maßnahmen, Test mit einem Freund

## Wahrscheinlichste Ursachen (nach Wahrscheinlichkeit)
1. **Ein kurzer Verbindungsabbruch beendete das Spiel.** Früher rief jeder Abbruch sofort "Mitspieler hat das Spiel verlassen" auf (der Gastgeber „gewann“). Es gab keinen Wiederaufbau. *(behoben: Paket 3)*
2. **Ein einziger Fehler stoppte die ganze Spielschleife.** `requestAnimationFrame(frame)` stand ganz am Ende von `frame()`. Jeder Fehler in Berechnung, Zeichnen oder Oberfläche beendete die Schleife für immer – das Spiel fror ein, wirkte wie ein Absturz. *(behoben: Paket 1)*
3. **Kein TURN-Server.** Es gab nur STUN. In Handy-Netzen, Firmen-/Uni-WLAN oder bei „symmetrischem NAT“ klappt eine direkte WebRTC-Verbindung oft nicht oder bricht ab. *(Paket 5: TURN einstellbar; ohne eigenen TURN-Server bleibt das Risiko)*
4. **Gastgeber überlastet.** Der Gastgeber macht 3D-Grafik, rechnet das ganze Spiel und baut zehnmal pro Sekunde den Spielstand. Wird das Bild langsam, kommen weniger Stände beim Gast an. *(Paket 4: Sparmodus; Paket 2: kleinere Stände)*
5. **Hintergrund-Tab / Energiesparen des Browsers.** Chrome drosselt oder „friert“ versteckte Tabs; das Spiel läuft nur über einen Worker-Takt weiter. Tab nicht verstecken, Browser nicht im Energiesparmodus. *(nicht lösbar im Code, nur abmildern)*
6. **Datenmenge.** Früher bis ~36 KB pro Stand × 10/s = ~360 KB/s bei großen Armeen → Rückstau auf der Leitung. *(Paket 2: jetzt ~1–2 KB pro Stand im Test)*
7. **Der öffentliche PeerJS-Vermittler** (kostenlos) kann ausfallen. Während des Spiels wird er nicht gebraucht, aber zum Verbinden und Wiederverbinden schon.

## Neu: Verbindungsanzeige im Spiel
Oben rechts erscheint im Mehrspieler eine kleine Anzeige: **„Verbindung gut / schwach“, „Gastgeber langsam“, „Verbindung weg – verbinde neu …“**. Ein Klick öffnet das Protokoll (Ping, Rechenzeit des Gastgebers, Datenmenge, ICE-Zustand, Fehler, letzte Ereignisse). **Kopieren** legt den Text in die Zwischenablage – bei Problemen Foto oder Text schicken.

## Test mit einem Freund
1. Spiel auf GitHub Pages öffnen (beide), **Mehrspieler → Spiel erstellen**, Link schicken.
2. Beide: nach dem Start auf die Anzeige oben rechts klicken und offen lassen.
3. Kleinen Abbruch testen: WLAN beim Gast für ~10 Sekunden aus- und wieder einschalten. Erwartet: Gastgeber pausiert („Mitspieler getrennt“), Gast verbindet sich neu, Spiel läuft weiter.
4. Wenn es nicht verbindet: im Protokoll steht **ICE → failed**. Dann TURN eintragen (Lobby → „Erweitert“, beide) oder im Link `&turn=turn:host:3478,benutzer,passwort`.
5. Bei einem Absturz: Anzeige öffnen → **Kopieren** → mir schicken.

## Grenzen
- Wiedereinstieg klappt nur, solange die Seite des Gastes offen bleibt (kein Neuladen).
- Pausiert der Gastgeber beim Abbruch, wartet er 90 s; danach gilt das Spiel als beendet. Der Gast versucht ~40 s.
- Kein TURN-Server ist vorinstalliert (kostet Geld bzw. braucht Zugangsdaten).

## Vorschlag: kleiner eigener Spielserver (noch nicht gebaut)
Ein kleiner Server (Node.js mit WebSocket, z. B. 150–300 Zeilen) würde den **Vermittler und Datenweg** ersetzen: Gastgeber und Gast verbinden sich beide per WebSocket mit dem Server, der Nachrichten nur weiterreicht („Relay“). Spielregeln bleiben beim Gastgeber im Browser.
- **Vorteile:** funktioniert in jedem Netz (kein NAT-Problem, kein TURN nötig), stabile Räume mit Raumcode, Wiederverbindung ist einfach (Raum bleibt bestehen), Ping messbar, später 3–4 Spieler.
- **Nachteile:** braucht Hosting (ein kleiner Server, ab ca. 0–5 €/Monat), jemand muss ihn betreiben; Datenverkehr läuft über den Server (bei ~2–20 KB/s pro Spiel unproblematisch).
- **Aufwand:** ca. **1–2 Tage**: Server (Räume, Weiterleiten, Ping) ~0,5 Tag, Umbau `net.js` auf WebSocket-Treiber ~0,5 Tag, Wiederverbindung/Tests ~0,5 Tag. GitHub Pages bleibt für das Spiel selbst.
- **Größere Stufe (optional, mehrere Wochen):** Der Server rechnet das Spiel selbst (autoritativ). Dann braucht das Spiel einen Node-fähigen Simulationskern ohne Grafik. Lohnt sich nur bei mehr als 4 Spielern oder Cheat-Schutz.
- **Empfehlung:** Erst mit Anzeige/TURN beobachten. Wenn die Anzeige oft „ICE failed“ zeigt, lohnt sich der Relay-Server.
