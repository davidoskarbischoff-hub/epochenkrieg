# Epochenkrieg veröffentlichen (GitHub Pages statt Netlify)

Das Spiel besteht nur aus Dateien (HTML, CSS, JavaScript) – es braucht keinen Server und keinen Build-Schritt.
GitHub kann diese Dateien direkt kostenlos ausliefern („GitHub Pages“). Jeder neue Stand, den du auf den Hauptzweig (`main`) bringst, ist dann nach ca. 1 Minute online.

## Einmalig einrichten
1. **Arbeitsstand in `main` bringen.** Aktuell liegt alles auf dem Zweig `claude/youthful-brahmagupta-8dmxq5`.
   Auf GitHub: Reiter *Pull requests* → *New pull request* → Zweig `claude/youthful-brahmagupta-8dmxq5` nach `main` → *Create* → *Merge*.
   (Oder sag mir Bescheid, dann erledige ich das.)
2. **Pages einschalten.** Auf GitHub im Repository: *Settings* → *Pages* → bei *Build and deployment* → *Source*: **Deploy from a branch** →
   *Branch*: `main`, Ordner `/ (root)` → *Save*.
3. **Adresse abwarten.** Nach etwa einer Minute steht oben auf der Pages-Seite die Adresse, z. B.
   `https://davidoskarbischoff-hub.github.io/epochenkrieg/`. Diese Adresse kannst du jedem schicken.
4. **Netlify abschalten (optional).** Wenn alles läuft: in Netlify die Seite löschen oder pausieren, damit es keine zwei Versionen gibt.

## Neue Version veröffentlichen
Änderungen auf `main` bringen (Pull request mergen). GitHub veröffentlicht automatisch neu. Fertig.
Tipp: Gib wichtigen Ständen eine Versionsnummer (*Releases* → *Draft a new release* → Tag z. B. `v0.2`) – so kannst du später immer zu einem alten Stand zurück.

## Mehrspieler
- Der Einladungslink (`…?join=…`) zeigt auf die Seite, auf der der Gastgeber das Spiel geöffnet hat. Die Seite muss **öffentlich** sein –
  bei Netlify darf deshalb kein Passwort- oder Teamschutz an sein. Bei GitHub Pages ist das automatisch so.
- Die Verbindung läuft direkt zwischen den Spielern (PeerJS/WebRTC). In manchen Firmen- oder Schul-WLANs klappt das nicht.
  Für zuverlässigen Mehrspieler braucht es später einen kleinen Spielserver.

## Lokal ausprobieren
`index.html` per Doppelklick öffnen, oder im Ordner `npx serve .` starten und die angezeigte Adresse öffnen.
