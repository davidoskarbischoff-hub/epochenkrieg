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
