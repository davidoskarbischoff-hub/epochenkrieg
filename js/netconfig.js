/* Epochenkrieg – Netzwerk-Einstellungen für den Mehrspieler.
   TURN-Server: Sie leiten Daten weiter, wenn zwei Spieler sich wegen Router/Firewall (z. B. Handy-Netz, Firmen-WLAN) nicht direkt verbinden können.
   Eintragen kannst du einen TURN-Server entweder hier (gilt für alle), im Spiel unter Mehrspieler → „Erweitert“ (gilt nur für diesen Browser)
   oder im Einladungslink: …?join=ID&turn=turn:host:3478,benutzer,passwort
   Beispiel für eintrag unten:  {urls:'turn:turn.example.com:3478',username:'benutzer',credential:'passwort'} */
window.EK_NET={
  turn:[
    /* hier TURN-Server eintragen, z. B. von einem eigenen Server (coturn) oder einem Anbieter mit Gratis-Kontingent */
  ]
};
