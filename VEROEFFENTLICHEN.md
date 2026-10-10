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

---

# Desktop-App für Windows (und Mac) – zum Verteilen an Tester

Die App ist das gleiche Spiel in einem eigenen Fenster (Electron). Sie braucht keinen Server, geht mit **F11** (oder Alt+Enter) in den Vollbildmodus, läuft im Hintergrund ohne Drosseln weiter und **aktualisiert sich selbst**, sobald du eine neue Version veröffentlichst. Die Web-Version (GitHub Pages) bleibt unverändert und läuft weiter.
Alles ist kostenlos. Es sind **keine Passwörter oder Schlüssel** nötig – GitHub bringt für die Action automatisch einen Zugangsschlüssel mit (`GITHUB_TOKEN`), du musst nichts unter *Settings → Secrets* eintragen.

## Einmalig: GitHub vorbereiten
1. Das Repository muss **öffentlich** sein (ist es). Nur dann kann die App ohne Schlüssel nach Updates suchen.
2. *Settings → Actions → General → Workflow permissions* → **Read and write permissions** auswählen → *Save*. (Sonst darf die Action die Installationsdatei nicht ans Release hängen.)
3. Den Arbeitsstand mit der App nach `main` bringen (Pull request mergen), denn GitHub führt die Action aus `main` aus.

## Ein Update veröffentlichen (3 Klicks)
1. Auf GitHub: *Releases* → **Draft a new release**.
2. Bei *Choose a tag* eine neue Versionsnummer eintippen, **immer mit kleinem v davor**: z. B. `v0.2.0` → *Create new tag*. (Zahlen: groß.mittel.klein, z. B. v1.0.0, v1.0.1, v1.1.0.)
3. Titel und ein, zwei Sätze „Was ist neu?“ schreiben (das sehen die Tester im Update-Fenster) → **Publish release**.

Nach ca. **8–15 Minuten** erscheinen am Release automatisch die Dateien:
- `Epochenkrieg-Setup-0.2.0.exe` (Windows-Installer)
- `latest.yml` (für das Auto-Update, nicht anfassen)
- Mac (optional): `.dmg` und `.zip`

Den Fortschritt siehst du unter *Actions* → „Desktop-App bauen“. Gelb = läuft, grün = fertig, rot = Fehler (dann das Protokoll anklicken und mir schicken).
Wichtig: Die Versionsnummer wird **aus dem Tag** genommen – du musst keine Datei ändern.

## So installieren deine Freunde die App (Windows)
1. Auf GitHub beim Repository rechts auf **Releases** → neuestes Release → unter *Assets* **`Epochenkrieg-Setup-….exe`** herunterladen.
2. Doppelklick auf die Datei. **Windows zeigt eine blaue Warnung** („Der Computer wurde durch Windows geschützt“). Das ist normal, weil das Programm keine bezahlte Signatur hat:
   - Auf **„Weitere Informationen“** klicken.
   - Dann auf **„Trotzdem ausführen“** klicken.
3. Die Installation dauert wenige Sekunden (kein Administrator nötig). Danach startet das Spiel; es gibt eine Verknüpfung auf dem Desktop/Startmenü.
4. Falls der Browser oder Defender die Datei beim Herunterladen blockiert: *Behalten* bzw. *Trotzdem behalten* wählen.

**Updates:** Beim Start sucht die App selbst nach einer neuen Version. Erscheint „**Neue Version verfügbar**“ → *Herunterladen* → danach *Jetzt installieren und neu starten*. Man kann auch im Spielmenü auf **„Nach Updates suchen“** klicken. Die aktuelle Versionsnummer steht unten im Spielmenü (Esc).

## Mac (optional)
Die Mac-Dateien (`.dmg`) sind **nicht von Apple signiert**. Installieren: `.dmg` öffnen, Epochenkrieg in *Programme* ziehen, beim ersten Start **Rechtsklick → Öffnen → Öffnen**. Das Auto-Update kann auf dem Mac ohne bezahltes Apple-Zertifikat nicht selbst installieren: Die App zeigt „Neue Version verfügbar“ und öffnet die Download-Seite.

## Mehrspieler in der App
Beim Erstellen eines Spiels enthält der Einladungslink die Adresse der **Web-Version**. Freunde können ihn im Browser öffnen **oder** in der App unter *Mehrspieler → Einladungslink eingeben* einfügen. App und Web-Version können gegeneinander spielen.

## Selbst testen (für Entwickler)
Im Ordner `desktop`: `npm install`, dann `npm start` (startet die App aus dem Quellcode). `npm run smoke` lädt das Spiel kurz und gibt einen Selbsttest aus. Installer lokal bauen: `npm run dist:win` (auf Windows).

## Warum Electron und nicht Tauri?
Electron bringt seinen eigenen Chromium-Browser mit, deshalb sieht das Spiel (WebGL-3D, Ton, WebRTC-Mehrspieler) bei jedem Tester **genau gleich** aus wie in Chrome, und das Auto-Update über GitHub Releases funktioniert **ohne Signaturschlüssel**. Tauri wäre kleiner (ca. 10 statt ca. 90 MB), nutzt aber das unterschiedliche System-Webview (Probleme bei WebGL/WebRTC möglich) und verlangt für Updates einen selbst erzeugten geheimen Schlüssel.

## Probleme?
- *Windows-Warnung lässt sich nicht bestätigen:* Rechtsklick auf die .exe → *Eigenschaften* → unten bei „Sicherheit“ ein Häkchen bei **Zulassen** → *OK*.
- *Update wird nicht gefunden:* Ist das Release wirklich **veröffentlicht** (nicht Entwurf/„Pre-release“)? Liegt `latest.yml` bei den Assets?
- *Das Spiel startet nicht:* Ein Foto der Fehlermeldung schicken. Das Update-Protokoll liegt unter `%APPDATA%\Epochenkrieg\update.log`.
