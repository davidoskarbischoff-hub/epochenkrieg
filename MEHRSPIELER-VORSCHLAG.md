# Mehrspieler: Vorschlag (noch nicht umgesetzt)

GitHub Pages hat keinen Server. Deshalb: **Peer-to-Peer per WebRTC**.

**Weg 1 (bleibt wie jetzt): PeerJS.** Läuft schon (`js/net.js`, Einladungslink `?join=ID`). Nachteil: braucht den öffentlichen PeerJS-Vermittler und scheitert hinter manchen Firewalls ohne TURN-Server.

**Weg 2: Trystero.** Bibliothek, die WebRTC über offene Vermittler (Nostr-Relays, BitTorrent-Tracker, MQTT) aufbaut, ohne eigenen Server. Vorteil: kein zentraler Ausfallpunkt, Räume per Codewort. Gleiche Grenze: ohne TURN klappt es nicht in jedem Netz.

**Umbau (für 2–4 Spieler):**
1. `net.js` in eine kleine Schnittstelle kapseln (`send`, `onMessage`, `peers`), PeerJS/Trystero als austauschbare Treiber.
2. Gastgeber rechnet weiter alles (kein Server nötig). Teams statt fester 0/1: `team` 0–3, `G.res`, `G.epoch`, `G.tech`, `G.pop` usw. sind schon Arrays; `flipTeams` wird durch „Sicht des Spielers“ (`me`) ersetzt statt Vertauschen.
3. Spielstand-Übertragung (`encodeSnap`) pro Gast gefiltert (Nebel), Befehle mit Spieler-Nr.
4. KI-Plätze auffüllen (`aiTick` pro KI-Team), Startpositionen für 3–4 Spieler in den Karten.
5. Lobby: Raumcode, Farbwahl, Gegner-Typen der KI-Plätze.
6. Tests: zwei bis vier Tabs lokal (BroadcastChannel), dann echte Verbindungen.
