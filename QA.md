# Qualität – Maßstäbe und offene Mängel

Diese Datei führt die Qualitäts-Leitung (Agent `epochen-qa`, Definition in `.claude/agents/epochen-qa.md`). Jede größere Änderung wird von ihr im laufenden Spiel geprüft, bevor sie committet wird.

## Maßstäbe
- **Einheitliches Bild:** gleicher Grafikstil, keine weißen oder knallig-kindlichen Modelle neben realistischen, Gebäude und Einheiten passen zum Zeitalter.
- **Proportionen:** alle Menschen so groß wie der Arbeiter; Pferde, Tiere, Fahrzeuge, Schiffe, Bäume im echten Verhältnis.
- **Kontinuität:** jede Truppenlinie behält ihren Grundkörper, die Ausrüstung entwickelt sich je Zeitalter (Kleidung → Rüstung → Uniform, Waffe passend).
- **Ausrichtung und Animation:** alles schaut in Laufrichtung, jede Tätigkeit hat eine passende Bewegung, Animationen laufen im Spieltempo.
- **Ton:** jedes Ereignis hat einen passenden, hörbaren Klang.
- **Spielgefühl:** klare Oberfläche, nichts springt, Wege frei, niemand bleibt stecken, Berater baut sinnvoll.
- **Balance:** Rohstoffe gehen im Langzeitspiel nicht aus, Aufstiegstempo und Armeen fair, Gegenstücke wirken.
- **Technik:** keine Konsolenfehler, Bildrate nicht schlechter, Mehrspieler bleibt synchron.

## Stand Abschlussprüfung Release 2 (2026-10-11)
Alle von David gemeldeten Mängel der Runden 1–3 sind umgesetzt (Details: ROADMAP.md, Abschnitte „Release 2 – Runde 1/2/3“).
Geprüft: Spiel startet ohne Konsolenfehler, alle Modelle und Klänge laden, Desktop-App-Selbsttest ok, Mehrspieler-Test (Fake-Peer) synchron, Minen/Forschung/Felder/Späher im Selbsttest.
Bekannte Grenzen (Release 3): Fischernetze, Galeere, Bohrturm/Raffinerie/Beton-Hafen als echte Modelle, Kanone/Haubitze, Vorschaubilder in Knöpfen, Truppenlinien farblich unterscheidbar.

## Offene Mängel (von David gemeldet, 2026-10-11)
- [x] Rehe/Bär laufen schräg, Bär ohne Laufbewegung (in Arbeit)
- [x] Holzfällen klingt wie Hämmern, Beeren pflücken und Bauen ohne hörbaren Klang (in Arbeit)
- [x] Menschen unterschiedlich groß (Speerträger, Schleuderer, Bogenschützen größer als Arbeiter); Speer zu lang und falsch gehalten
- [x] Bogen-/Armbrustschützen tragen ein Schwert; Ingenieur im Mittelalter sieht modern aus; Musketiere/Armbrustschützen in der Industriezeit unpassend
- [x] Truppen wirken zusammengewürfelt – Kontinuität über die Zeitalter fehlt
- [x] Animationen laufen nicht im Spieltempo; Feldarbeit sieht aus wie Schieben; Renaissance-Arbeiter halten Schaufel komisch
- [x] Pferde primitiv und zu groß; Bäume zu klein
- [x] Eisen/Gold zu kindlich, zu klein, Stein/Eisen/Gold sehen zu unterschiedlich aus
- [x] Ölfelder hässliche schwarze Pfützen, zu häufig; Bohrturm nicht erkennbar; Raffinerie komisch
- [x] Kaserne hässlich; Kaserne in der Industriezeit modernes Hochhaus; Hauptlager Renaissance zu klein/einfach
- [x] Kenney-Schiffe/Belagerung brauchen Farbtabelle (variation-a..g vorhanden)
- [x] Mine: neues Prinzip (Option A: auf dem Vorkommen, Karren/Lore zum Lager, Schienen-Ausbau), größer
- [x] Holz geht im Langzeitspiel aus, KI kommt nicht weiter → dichte, große Wälder mit Durchgängen (in Arbeit)
- [x] Mauer per Ziehen bauen (in Arbeit)
- [x] Obere Leiste springt zwischen 1 und 2 Zeilen (in Arbeit)
- [x] Berater/Arbeiter bauen Türme und Gebäude zu nah (Berater behoben, Arbeiter-Türme offen)
- [x] Gebäude abreißen mit Rückerstattung (neu)

## Davids Prüfliste vor v0.2.0 (gemeldet 2026-10-11, noch nicht umgesetzt – auf Go warten)
- [x] Mine auf Eisen: Arbeiter können nicht arbeiten, Meldung „kein abbaubares Vorkommen“, obwohl das Eisen nicht leer ist
- [x] Bogenschützen (Bronzezeit) werfen statt zu schießen → Animation/Waffe passend machen oder Einheit umbenennen (z. B. „Wurfspeerwerfer“)
- [x] Fische schwer anklickbar → Fischgründe deutlicher und leichter anklickbar
- [x] Lore mit Schieber bleibt im (seichten) Wasser stecken → Loren meiden Wasser ganz und fahren außen herum
- [x] Ausbau im Hauptlager (Handelshof/Kommandozentrale) ohne Bild → eleganter darstellen
- [x] Upgrade-/Technologie-Liste im Hauptlager wirkt wie eine Tabelle → kompakter und schöner (Kacheln statt ganzer Zeilen)

## Offene Mängel aus der Prüfung (2026-10-12, Stränge Netz/Menschen)
- Finger (Ring3R) bleibt nach direktem Wechsel Fischen → Hacken/Angriff 60° gebeugt (nur bei erzwungenem Uferfischen sichtbar); Restore vor dem Aktionswechsel in animate() setzen.
- Ruderboot: Netzseite hängt nur an der Figurennummer, kann über Sand hängen → Seite zum tieferen Wasser wählen.
- netRig klont die getönten Netz-Materialien je Arbeiter (Cache wie teamMats).
- Ruderer-Beine ragen unter dem Ruderboot heraus.
- Meeres-Fischmodelle an den Fischquellen sehr groß.
- Arbeiter haben keine Teamfarbe am Modell (gegnerische Arbeiter schwer erkennbar).
- Mittelalter-Schwertkämpfer (neu/Medieval.glb) hält das Schwert im Stand waagrecht nach vorn wie ein Gewehr.

## Prüfung Commit a24133c – Krieger-Linien Adventurer (2026-10-12)
- [x] Helm (Stahlhelm „Military man“) sass zu hoch/hinten, Haare ragten vorn heraus → `wear.pos` [-0.04,0.12,0.04], `scale` 1.4 (behoben).
- [ ] (sollte) Nationen-Einheiten der Weltkriegszeit (alpini, rekrut, janit, bersag, doughboy = `Soldier.glb`; sturm, banzai = `Swat.glb`) und Ingenieur (`Worker.glb`, wirkt kleiner) nutzen nicht den Adventurer-Grundkörper → Bruch mit der einheitlichen Linie. Auf Adventurer + `wear` umstellen.
- [ ] (sollte) Musketier Ep. 4 und Gewehrschütze Ep. 5 tragen dasselbe moderne Zielfernrohr-Gewehr wie Ep. 6 – keine erkennbare Waffenentwicklung, Muskete wirkt anachronistisch.
- [ ] (schön wäre) Bogenreiter/Ritter Ep. 5: Reiter sitzt klein auf dem Pferd (Grössenverhältnis prüfen); Späher Ep. 6 auf Motorrad hat keinen Helm.
- Geprüft ok: alle 63 gültigen Linien×Zeitalter laden (`EKMODELS.failed` leer), Teamfarbe blau/rot erkennbar, Waffen in rechter Hand, Blickrichtung im Kampf zum Gegner, Konsole ohne Fehler, ~250–280 Draw-Calls bei 12 Kämpfern.

## Prüfung Pakete Team-Markierung / Loren / Liquid Glass / Ego (2026-10-21)
- [x] (sollte, behoben) Umschauen-Taste R: kein Zurücksetzen bei Fensterwechsel/Esc/Zeigerfang-Verlust, Kamera drehte weiter bzw. Tasten klemmten → `releaseKeys` + `blur`/`visibilitychange`/`pointerlockchange` in input.js. Geprüft: R+Maus dreht, nach Loslassen/Blur/Lock-Verlust 0, N setzt zurück.
- Geprüft ok: Team-Markierung (Kreis eigene, Raute Gegner) in Wüste, Winter, Boote, Flieger, 90 Einheiten lesbar (Bilder qa/…/tm_*.png im Scratch-Ordner); Loren 1–3 (Schienen + Knopf nie > 3, Info „Loren x / 3“, 3 Loren fahren), Berater-Regel cart2 vorhanden (Rang niedrig), `cart2`/`tfire` über execRemote mit Besitzprüfung; Liquid Glass 1920×1080 bis 390×844 ohne Seiten-Scroll, Chips einheitlich hoch; Berater Auto ohne Haken/X; Ego Boot/Kriegsschiff/Reh/Turm (Nachlade-Balken, Treffer), Esc beendet.
- [x] (21.10. behoben, Text korrigiert) Schienen kaufen bei bereits 2 Zusatz-Loren bringt keine Lore mehr (nur Tempo), Knopftext verspricht „eine zweite Lore“.
- [x] (21.10. Meldung „Das Tier ist ausser Sicht.“) Ego-Reh: Ansicht endet von selbst, sobald das Tier aus dem sichtbaren Bereich läuft (gewollt wegen Nebel, aber ohne Meldung).
- Bildrate Software-GL ~1 fps, Unterschied Aus/Dezent/Deutlich nicht messbar; Rechenaufwand der Ringe gering (2 InstancedMesh).

## Zwei-Fenster-Mehrspielertest neue Befehle (2026-10-21)
Aufbau: zwei Playwright-Seiten, lokaler BroadcastChannel (`Lobby.open()` + „Lokal testen“, `?join=local:CODE`), Software-GL, eigener Port, Skripte im Scratch-Ordner (`mpq/t1.js` Logik ohne Zeichnen, `t2.js`/`t5.js` mit Zeichnen, Gastgeber ohne Zeichnen). Bilder: `/tmp/claude-0/-home-user-epochenkrieg/69c8489a-2fbd-5d9c-8744-c05459ace21d/scratchpad/mpq/` (`host_scene.png`, `guest_scene2.png`, `guest_ego.png`).
- [x] `cart2`: Gast kauft Lore, Gastgeber zieht 100 Holz + 40 Eisen ab, Stand beim Gast gleich, `xc` und `Loren x/3` kommen an, Maximum 3 (2 Zusatzkäufe) greift, die 3 Loren fahren auf beiden Seiten an gleicher Stelle.
- [x] `tspec`: Ausbau Wehrturm bezahlt (120/140/60) auf beiden Seiten gleich, Leben ×1,5, zweiter Ausbau am selben Turm abgelehnt.
- [x] `tfire`/`ufire`: Schuss/Schlag kommt an, Nachladezeit wird vom Gastgeber erzwungen (zweiter Aufruf sofort = abgelehnt), zu weites Ziel abgelehnt.
- [x] Gast darf nichts Fremdes steuern: `buyCart`, `buildSpec`, `towerFire`, `unitStrike`, `cmd` auf Objekte des Gastgebers bleiben ohne Wirkung (Kosten, Ausbau, Lebenspunkte, Befehle unverändert); Ego-Start auf Gegner/Nebel-Tier = `false`; Tab wechselt nur durch eigene Einheiten.
- [x] Team-Markierung: Gast sieht eigene Einheiten mit Kreis + grünem Rahmen, Gegner mit Raute + rotem Rahmen, Teamfarben sind auf beiden Bildschirmen dieselben (Gast rot, Gastgeber blau); Minikarte stimmt.
- [x] Keine KI/Berater im MP (`aiT` bleibt stehen, `advisor.cur` leer), Gegner-Typ „Zufall“ ohne Wirkung; Umschauen R / Zurücksetzen N wirken nur lokal, Gastgeber-Kamera unberührt.
- [x] 3+ Spielminuten (Gastgeber 5×): gleiche Zahl Einheiten/Gebäude, Position/Team/Ausbau/`xc` gleich, Rohstoffe gleich, keine Konsolenfehler. (3 Lebenspunkt-Abweichungen = Übertragungsverzug, kein Dauerfehler.)
- [x] BEHOBEN: Gast sah beim Minenlager immer „0 / 800“ (`b.st` fehlte im Stand) → Feld `sk` in `encodeSnap`, `applySnap` setzt `e.st` (mp.js). Gemessen: Gast 340 bei Gastgeber 340.
- [x] BEHOBEN: Ego-Ansicht zeigte große weiße/gelbe Scheiben (Auswahl- und Teamringe nahe am Auge), auch im Einzelspiel → in Ego keine Ringe (`r3TeamMarks`/`r3Ring`, render3d.js).
- [x] BEHOBEN (Paket E4): Ego-Ansicht zeigt oben einen dunklen Kasten mit rotem Band (Raum/Brett-Rahmen über dem Horizont, im Einzelspiel genauso, `guest_ego.png`); Ursache war NICHT Raum/Brett (GL-Bild sauber, per Pixelabfrage nach jedem `render()` belegt), sondern das 2D-Canvas `#c`: der Lebensbalken (`hpBar`, Rahmen grün `#9be08a`/rot `#ff7a5c`) der eigenen Figur/nahe Objekte wurde wegen winziger Tiefe `dep` riesig gezeichnet (`scr()` in render3d.js: `k` ~ 1/dep, ausserdem mit `R3.FOV` statt `camera.fov`); flackerte je Bild. Fix: `scr().front` verlangt in Ego dep > 3, `k` nutzt `camera.fov`. Zusätzlich blendet `egoCam` Brett (`ROOM.board`) und Lampe aus. Bilder `scratchpad/e4/before_ego_up.png` / `after2_ego_up.png`, `after2_edge.png` (Kartenrand = Himmel).
- [ ] Beobachtung (kein Fehler): Der Gast wartet im Ego auf eigene Nachladezeit (`EGO.nextFire`), der Gastgeber entscheidet; bei langsamem Gastgeber (Software-GL ~0,15× Echtzeit) wirkt Ego-Laufen/Schiessen verzögert. In Echtzeit nicht gemessen (Software-GL zu langsam), dort nur Befehlsankunft belegt.
- [x] BEHOBEN (E4): Turm-`cd` steht jetzt im Stand (`cd` in `encodeSnap`/`applySnap`, 0,1 s gerundet, nur bei Türmen); Gast-Balken nimmt max(eigene Uhr, `e.cd`). Gemessen Gastgeber/Gast: 0,98/1,0; 0,58/0,6; 1,38/1,4. Einheiten-`cd` stand schon im Stand (Gast 0,2 bei Gastgeber 0,14).
- [ ] offen: Gast-Ego-Schlag mit Treffer nicht belegt: im Test lehnt der Gastgeber `unitStrike` ab, weil die Einheit selbst gerade nachlädt (Auto-Angriff); Befehlsankunft belegt, Wirkung in Echtzeit nicht messbar (Software-GL).

## Durchspiel-Audit nach Ladeumbau D5 (2026-10-21)
Skripte/Bilder: `/tmp/claude-0/-home-user-epochenkrieg/69c8489a-2fbd-5d9c-8744-c05459ace21d/scratchpad/lz/` (`t1.js` Lazy-Load-Rückfälle, `t2.js` Kachel-Symbole, `t3.js` alle Zeitalter, `bal.js` Berater-Auto, `perf.js`; Bilder `icons_late_noreselect.png`, `ep6.png`).
- [x] BEHOBEN (sollte): Befehlskacheln (Kaserne/Hauptlager usw.) behielten nach dem Nachladen der Spät-Modelle die Code-Figur-Symbole, solange die Auswahl blieb (`panelSig` kannte `EKMODELS.ver` nicht, `ICON3` wird zwar geleert, aber die Kacheln nicht neu gebaut). Fix: `|v`+`EKMODELS.ver` in `panelSig` (ui.js). Geprüft: Kachel-`src` ändert sich ohne Neuauswahl.
- Geprüft ok: Normalstart ohne `__eagerModels` (`failed` leer, kein Fehler in der Konsole); Zeitalter 0 beim Start ohne Rückfall-Figur/-Gebäude; Aufstieg auf 5 direkt nach Start: Reiter, Panzer, Haubitze, Kriegsschiff, Hauptlager, Kaserne, Mauer, Tor, Markt, Turm … sind kurz Code-Rückfall und springen nach `loadAll` sauber auf glTF um. Nach `loadAll` in Zeitalter 0–6: alle Einheiten/Gebäude glTF ausser bekannte Lücken (Graben, Bohrturm, Feldkanone Ep. 4); alle `ICON3`-Symbole (Einheiten+Gebäude je Zeitalter) nicht leer/schwarz.
- Balance Berater-Auto (Normal, M, 40 min, Seeds Küste 11 / Festland 12): Spieler steigt auf bei Min. ~9/18/24/33/38 (Küste) bzw. 9/19/24/29 (Festland) – früher als die dokumentierten 10/20/29/38/47. Festland: Sieg Min. 37 (KI nur Zeitalter 2, 22 Arbeiter, Heer 2). Küste: kein Ende bis Min. 40, KI Zeitalter 2, 27 Arbeiter, Heer 27.
- [ ] (sollte) Rohstoffberge im späten Spiel des Beraters: Küste Min. 35/40 Nahrung 9219/11711, Holz 5262/9669; Festland Min. 35/37 Nahrung 5466/9985, Holz 5954/10204 (bei Min. 30 noch 898–2442). `surplus:`-Regel greift ab Zeitalter 4 offenbar nicht mehr; Aufstiege kosten bis ~6800 – Bedarf wächst, Einkommen aber mehr (54 Arbeiter).
- [ ] (sollte) KI-Wirtschaft schwach in der Mitte des Spiels (Normal): Zeitalter 1 erst ~Min. 12–15, Zeitalter 2 ~Min. 28–30; Nahrung 4000–7000 und Stein 2300–4200 liegen ungenutzt, Heer fällt zwischendurch (5–10). Kein Stillstand, aber bei Min. 40 deutlich hinter dem Berater-Auto.
- Beobachtung: 2 KI-Kriegsschiffe stehen dauerhaft `idle` mit `pf.fail` am Kartenrand (x~3700, y~370) – harmlos, aber zählt als „festhängend“.
- Loren: keine Engpässe sichtbar (Min. 30: 12–15 Loren, Minenlager 0–300 je Mine). Leistung (Software-GL, Küste L, 100 Einheiten, 40 Gebäude, 6 Loren, 1568 Entitäten, Zeitalter 5): Team-Markierung aus/dezent/deutlich 631/765/647 Aufrufe, 1,40/1,64/1,38 Mio. Dreiecke (nur 3 Bilder je Stufe, Schwankung durch Schattenbild jedes 2. Bildes) – kein messbarer Mehraufwand.
- [x] (sollte, gemildert 21.10.) Rohstoffberge des Beraters: Ursache `army`-Pause 12 s, jetzt 2 s (Heer Minute 30: 27,8 -> 33,6, Sieg frühestens Min. 30). Siehe OPTIMIERUNG.md.
- [ ] (kann) KI-Mitte: Zeitalter 2 erst Min. 27 ist `AI_MINT` x `pace` 1,3 (gewollt); nur Balance-Entscheidung, nichts geändert.
- [x] BEHOBEN (21.10.): „Grünes Flugzeug direkt nach dem Spawn“: Ursache = noch nicht geladene Spät-Modelle (Zeitalter 2+, `EKMODELS.full` false): `buildUnit` fiel auf die olivgrüne Code-Figur (`jetBody`, 0x6b7a56) zurück, bis `loadAll` fertig war und `tag()` neu baute. Mit `__eagerModels` + `loadAll` ist alles korrekt (Bilder `scratchpad/jet/before0.png`, `e30.png`). Fix in `gltfmodels.js` (Hülle um `buildUnit`): solange `!EKMODELS.full` und Stufe >= 2 ist die Rückfall-Figur unsichtbar, danach ersetzt das echte Modell sie. Bilder `jet/lz0.png` (vorher: Code-Flugzeug) → `jet/af0.png` (leer) → `jet/aflate.png` (echtes Modell). Gast-Ego-Schlag: Code geprüft (`ufire` → `execRemote` → `unitStrike(0,…)` nach `flipTeams`, Besitz-/Reichweitenprüfung beim Gastgeber), noch nicht mit zwei Spielern gelaufen.

## Echter Zwei-Seiten-Mehrspielertest `tools/mp-test.js` (21.10.)
Aufruf: `NODE_PATH=<playwright> node tools/mp-test.js [Bilderordner]` (~5 Min., Software-GL, eigener Port, lokale Lobby per BroadcastChannel, Gastgeber ohne Zeichnen, ohne `__eagerModels`). Letzter Lauf: ALLES OK.
- [x] (1) Verbindung, Start, Snapshot beim Gast, gleiche Zahl Einheiten/Gebäude, keine Konsolenfehler.
- [x] (2) Aufstieg 5 auf 6 mit Nationen beider Seiten (Gastgeber `de`, Gast `ru` per echtem `adv` über das Netz); Gast sieht Nation/Zeitalter richtig (Teams vertauscht); Sturm/Bertha/Rekrut/Kosak kommen beim Gast an, keine Fehler in `applySnap`/`execRemote`. Bild `gast_nationen.png`: glTF-Figuren, Teamfarben sichtbar; Feinbeurteilung wegen Software-GL/Kameraausschnitt begrenzt.
- [x] (3) Nach `EKMODELS.loadAll`: beim Gast alle sichtbaren Einheiten/Gebäude glTF. Objekte ausserhalb des Bildes (z. B. eigenes Hauptlager) bleiben bis zum Hinschauen Code-Modell (gewollt, `o.off`); der Test schwenkt über beide Hauptlager.
- [x] (4) Gast-`ufire` real über das Netz: Gastgeber wendet Schaden an. Nachladeuhr wird im Test zurückgesetzt, sonst verwirft der Gastgeber den Schlag (gewollt).
- Kein Programmfehler gefunden, am Spielcode nichts geändert.

## Mehrspieler-Prüfung Ego-Schlag/Nationen/späte Modelle (21.10.)
- Gast-`ufire` (Host-Seite, `execRemote` in Playwright/__norender): Schaden wird angewendet (11 bei Speer gegen Speer). Läuft `u.cd` (auch durch automatischen Angriff), verwirft der Host den Schlag still (`unitStrike` gibt false) – gewollt, gleiche Uhr wie im Einzelspieler; kein Fix. Zwei getrennte Seiten (Fake-Peer) nicht aufgebaut: Weg nur über Code geprüft.
- Nationen (nur Code gelesen, nicht im Lauf): Gast schickt `adv` mit Nation, `nat` steht im Stand, `nfx` wird beim Gast neu berechnet, `enqueue` prüft Nation; kein Fehler gefunden.
- Späte Modelle: `entryFor` filtert auf geladene Dateien, also ändert sich `tag()` beim Nachladen und `r3Sync` baut jede Einheit/jedes Gebäude neu (auch unverändert stehende). Unsichtbar nur Code-Figur Lvl>=2 bis `EKMODELS.full`. Nicht im Lauf geprüft.

## Meshopt-Modelle (21.10.)
- 213 benutzte .glb mit Meshopt komprimiert (48,8 -> 21,9 MB). Struktur und Namen identisch, Kontaktbogen und Spielszene unverändert, keine Konsolenfehler. Nicht geprüft: Animation im Dauerlauf (nur Standbild), Desktop-App. Sieht eine Figur nach dem Laden verzerrt aus: Datei aus Git zurückholen und `tools/meshopt/pack.mjs` prüfen.
- 24.10. Wolkenschatten (Option Grafik): Software-GL-Bild geprüft, Echtzeit-FPS auf echter GPU noch offen.
- 24.10. Marine: Panzerschiff aufgewertet, KI-Flottenangriff erst ab 3 Schiffen, Boote sperren unerreichbare Fischgründe teamweit (Details OPTIMIERUNG.md). Offen: Kriegsschiffe vs. Küste nur im Gefecht ohne Landung gemessen, Landungen (Transport) gibt es nicht.

- KI-Taktik Schwer (Rückzug/Sammlerjagd) nur per Selbstspiel gemessen, nicht im Fenster angesehen; Wirkung klein und verrauscht (siehe OPTIMIERUNG.md).

- Moves 24.10.: Schlag-Takt, Zucken, Jog geprüft per Bildfolge; Bogenschützen spannen nicht sichtbar (nur Gun_Shoot-Clip).

## Durchspiel-Audit nach den Änderungen vom 24.10. (2026-10-24)
Bilder: `qa/bilder/era0.png`, `era3.png`, `era6.png`, `ui640.png`, `seq_sword.png`, `seq_knight.png`.
- [x] Bäume/Büsche/Felsen/Erze/Gebäude Zeitalter 0/3/6 ohne dunkle Quadrate, richtige Größe (Stein, Eisen, Gold geprüft; Öl ist bewusst tiefschwarz). `EKMODELS.failed` leer, mp-test (tools/mp-test.js) ALLES OK, `node --check` aller js/ und tools/ ok, Lücken nur cannon/trench/derrick.
- [x] (sollte, behoben 24.10.) Obere Glaskapsel bei <= 640 px füllte die ganze Zeile (leere Glasleiste links der Knöpfe, `flex:1 0 100%` in css/ui2.css). Jetzt Zeilenumbruch über `#top::before` und Kapsel nur so breit wie die Knöpfe. Kein Überlappen mit Chips bei 1100/900/700/640/480/360 px gemessen. Netzstatus (`#netbadge`) wurde nur bei 1100 px per Test sichtbar gemessen (dort links neben der Kapsel, ohne Überlappung), bei <= 900 px nicht im Bild geprüft (Anzeige existiert nur im Mehrspieler).
- [ ] (schön wäre) Wolkenschatten: Umschalten an/aus ohne Fehler, aber im Standbild (pausiert, 1100 px) kein Unterschied erkennbar; im laufenden Spiel nicht beurteilt.
- [ ] (schön wäre) Bogenschütze: Gun_Shoot zeigt zwischen den Schüssen fast dieselbe Haltung (Schreitpose), Schuss nur kurz erkennbar; Schwert und Reiter (Attack_Kick, Pferd streckt Hinterbeine) laufen sauber im Takt, Start- und Endhaltung der Clips passen (Pop 0,2 bis 0,5 rad Summe), keine Verdrehung, Clip bleibt `attack`.

- [x] Balancing Truppen Z3-Z6 (24.10., messbasiert, Details OPTIMIERUNG.md): hbow, Flugzeuge, Bomber vs Gebäude, Renault, Mark I, Doughboy, Bertha angepasst; mp-test ALLES OK, `node --check` ok, Lücken nur cannon/trench/derrick. Nicht im Spiel mit Menschen getestet (nur headless).

- Flugzeuge/Bodenfeuer (24.10.): `AA_GUN` in `hit()` (sim.js) kürzt Gewehr-/MG-Schaden gegen Flugzeuge (x0,4/x0,3); kostengleich plane-mg -0,04, plane-rifle -0,14. Bei neuen `gun:true`-Einheiten oder Flak daran denken. Zahlen in OPTIMIERUNG.md.
