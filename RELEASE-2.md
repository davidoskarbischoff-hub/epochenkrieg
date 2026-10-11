# Release 2 (v0.2.0) – Plan

Geführt von der Release-Leitung (`.claude/agents/epochen-release.md`), abgenommen von der Qualitäts-Leitung (`.claude/agents/epochen-qa.md`, Mängel in `QA.md`). Entscheidungen über Inhalt trifft David.
Letzte Überarbeitung: 2026-10-11 (strategische Grundlage, Runde 1 läuft).

## Ziel
Ein Spiel aus einem Guss: stimmige Grafik über alle Zeitalter, gleiche Größenverhältnisse, Truppen mit Kontinuität, sinnvolle Wirtschaft (Wälder, Minen), polierte Oberfläche, guter Ton, Balance im Langzeitspiel, keine Fehler – Web-Version, Desktop-App und Mehrspieler, Deutsch und Englisch.

## Stand (2026-10-11)
- Erledigt und committet: Zeitalter-Baum mit Bildern und Flaggen (b5743f5), Berater baut mit Abstand (cbf6034, b0d6249).
- Läuft (Runde 1, noch nicht abgenommen): A Ton + Tiere, B Mauer ziehen, C Wälder, D obere Leiste (neue Datei `css/topbar.css`).
- Ausgangs-Messwerte (gleicher Rechner, `__norender`, Software-GL; „heute“ = Arbeitsstand mit den laufenden Änderungen, vorläufig):

| Messung | v0.1 (Commit c8bc661) | heute |
|---|---|---|
| Bäume auf der Karte (Küste, Seed 5 / 11) | 362 / 392 | 552 / 740 |
| Holz auf der ganzen Karte (Seed 5 / 11) | 152 k / 165 k | 232 k / 311 k |
| Holz im Umkreis 900 px je Basis (Küste S5 / Festland S11 / Flusstal S7) | 37 k / 32 k / 23 k | 47 k / **30 k** / 89 k |
| Schrittzeit ohne Zeichnen, Spielbeginn (Seed 5 / 11) | 1,4 / 1,1 ms | 2,1 / 5,0 ms |
| Konsolenfehler beim Start | 0 | 0 |
| Fehlende englische Texte (Prüfskript) | – | 21 |
| Modelldateien, die der Desktop-App fehlen | – | 28 |
| `models/neu`: Dateien / Größe (davon im Manifest benutzt) | – | 869 / 208 MB (≈ 90 / 39 MB) |

Wichtig: Die KI sucht Rohstoffe nur bis 900 px um ihr Hauptlager (`ai.js`, `nearestNode(...,900,...)`). Auf „Festland“ liegen dort nur ~30 k Holz – das erklärt „Holz geht aus, KI kommt nicht weiter“ besser als die Gesamtmenge.

## Arbeitsregeln für alle Runden
- Eine Datei hat je Runde genau einen Bearbeiter (Tabelle „Reihenfolge“). Gleiche Datei = nacheinander.
- Jede fertige Arbeit: Prüfung durch die Qualitäts-Leitung im Spiel → erst dann Commit. Bericht enthält Messwerte (Schrittzeit, Bildrate, Konsolenfehler).
- Neue Texte gleich mit englischer Übersetzung (`i18n.js`). Neue Spieleraktion = `NET.client`-Wächter + `case` in `execRemote` (`mp.js`). Neue Modelldatei = Eintrag im Manifest **und** in `models/CREDITS.md`.
- Kartenerzeugung nur mit dem Seed-Zufall `R()`, nie `Math.random()` (sonst sieht der Gast im Mehrspieler eine andere Karte).

## Umfang
### Muss rein

**M1 Ton: Axt, Beeren, Bauen** (Runde 1 A, läuft) – `audio.js` (SAMPLES), `sounds/`
- [ ] Holzfällen klingt nach Axt, Bauen nach Hammer, Beeren nach Rascheln/Pflücken (QA-Hörtest + David).
- [ ] Lautheit jeder benutzten Probe für chop, pick, hammer, mine, built, drop zwischen −28 und −16 LUFS (`ffmpeg … ebur128`); keine mehr als 6 LU leiser als `click`.
- [ ] Gast im Mehrspieler hört dieselben Arbeitsgeräusche (`SFXNET`).

**M2 Tiere: Ausrichtung, Bär läuft** (Runde 1 A, läuft) – `sim.js` (animalMove), `gltfmodels.js` (animalFace), Manifest `animals`
- [ ] Pfeiltest: bei Blickrichtung 0 schauen alle 7 Tiere nach +X (Abweichung < 15°).
- [ ] Beim Laufen: Winkel zwischen Blickrichtung und tatsächlicher Bewegung < 20° in ≥ 95 % der Bilder (Messskript, 60 s, alle Tierarten).
- [ ] Jedes Tier spielt beim Laufen eine Laufanimation (Bär eingeschlossen), im Stand Idle/Fressen.

**M3 Mauer durch Ziehen** (Runde 1 B, läuft) – `commands.js`, `input.js`, `state.js`, `mp.js`, `render.js`, `ui.js`, `i18n.js`
- [ ] Ziehen von A nach B ergibt eine geschlossene Mauer: `navPath` quer durch die Linie findet keinen Weg (nur um die Enden).
- [ ] Vorschau beim Ziehen: Stückzahl, Kosten, blockierte Stücke rot; „Rohstoffe reichen für N Stücke“.
- [ ] Einrasten an Mauerenden und großen Vorkommen; Klick = ein Stück wie bisher; Rechtsklick/Esc bricht ab; Pfosten an Enden/Ecken.
- [ ] Mehrspieler: Gast zieht eine Mauer → beim Gastgeber dieselben Stücke an derselben Stelle (`wline`), Kosten genau einmal.
- [ ] Texte DE/EN vorhanden.

**M4 Dichte Wälder, Holz reicht, größere Erze** (Runde 1 C, läuft) – `map.js`, `nav.js`, `sim.js`, `data.js`; KI-Teil in Runde 4a
- [ ] Wald ist dicht: kein Weg durch das Innere (Testpfade quer durch 5 Wälder gehen außen herum oder durch eine Schneise).
- [ ] Keine Basis eingesperrt: auf allen 7 Karten × 3 Seeds erreicht jede Basis alles, was sie ohne Wald erreichte (Messskript).
- [ ] Nur Randbäume werden gefällt; kein Arbeiter (Spieler oder KI) steht > 10 s untätig, solange offene Bäume ≤ 900 px entfernt sind.
- [ ] Holz in Reichweite: je Basis ≥ 60 k Holz im Umkreis 900 px auf allen 7 Karten (heute Festland 30 k, Küste 47 k ✗) **oder** KI und Berater holen Holz bis 1.600 px und bauen dort ein Lager (siehe M16).
- [ ] Langzeit: 60-Minuten-Selbstspiel (Berater-Auto gegen KI „normal“, 3 Karten × 2 Seeds): Holzeinkommen in Minute 55–60 ≥ 50 % von Minute 20–25, für beide Seiten; KI erreicht mindestens die Renaissance.
- [ ] Erzvorkommen: großes Vorkommen (sz 1,7) sichtbar ≥ 1,5× Radius des kleinen; Stein/Eisen gesamt ≥ v0.1 (heute erfüllt).
- [ ] Gleicher Seed = gleiche Karte inkl. Baumart/Aussehen (heute nutzt `genForests` `Math.random()` für Baumart und Aussehen → beim Gast andere Bäume).
- [ ] Schrittzeit ohne Zeichnen bei Spielbeginn ≤ 3 ms (heute 2,1–5,0 ms).

**M5 Obere Leiste stabil** (Runde 1 D, läuft) – `css/topbar.css`, `css/style.css`, `index.html`, `ui.js`
- [ ] Höhe von `#top` gleich (±1 px) in allen 7 Zeitaltern, bei 800, 1024, 1280, 1366, 1920 und 2560 px Fensterbreite, Deutsch und Englisch, mit Rohstoffwerten 0 und 99.999, mit und ohne Öl (Messskript mit `getBoundingClientRect`).
- [ ] Kein Zeilenumbruch, nichts überlappt (Berater, Meldungen, Minikarte), Zeitalter-Name ganz lesbar.
- [ ] Danach gibt es nur **eine** Quelle für `#top`: die alten `#top`-Regeln in `style.css` werden gelöscht, nicht nur überschrieben (siehe V3).

**M6 Einheiten-Kontinuität** (Runde 2) – Manifest `units`, `gltfmodels.js`, ggf. `data.js` (E1)
- [ ] Größe: alle Menschen-Einheiten (auch Nationen-Einheiten) stehend innerhalb ±5 % der Arbeiterhöhe (Messskript über die 3D-Objekte, alle Zeitalter).
- [ ] Jede Truppenlinie behält ihren Grundkörper, die Ausrüstung wächst (Fell → Bronze/Leder → Kettenhemd → Rüstung → Uniform → Feldgrau). Beleg: Kontaktbogen „Linie × Zeitalter“ (7 Spalten), von David abgenommen.
- [ ] Waffen in der richtigen Hand und passend lang (Speer 1,1–1,3× Körpergröße, Schwert 0,4–0,5×), sehen gehalten aus; Bogen-/Armbrustschützen ohne Schwert (keine Fremdausrüstung).
- [ ] Zeitalter-stimmig: Ingenieur im Mittelalter mittelalterlich, Musketier/Armbrustschütze nicht in moderner Uniform; keine Einheit moderner als ihr Zeitalter.

**M7 Animationen im Spieltempo, Feldarbeit** (Runde 2) – `render3d.js` (r3Unit, r3Animal), `gltfmodels.js` (animate), Manifest `work`
- [ ] Animationen laufen mit dem Spieltempo (1×/2×/3×/5×) und stehen bei Pause still. Ursache gefunden: `r3Unit`/`r3Animal` geben die echte Bildzeit `dt` an `EKMODELS.animate` weiter, nicht `dt × G.speed`, und beachten Pause nicht.
- [ ] Laufzyklus passt zur Geschwindigkeit (Füße rutschen nicht sichtbar; Schrittlänge über alle Einheiten ±20 %).
- [ ] Jede Arbeit hat ihre Bewegung: Holz (Axt), Stein/Erz (Spitzhacke), Beeren (Pflücken), Feld (Hacke/Sichel, kein Schieben), Bauen (Hammer), Jagen, Fischen; Renaissance-Arbeiter halten die Schaufel mit beiden Händen.

**M8 Modelle & Gebäude** (Runde 3) – Manifest `buildings`/`nodes`/Schiffe/Ritter, `gltfmodels.js`, `models3d.js`, `render3d.js` (r3Nodes), `map.js` (Öl)
- [ ] Kenney-Schiffe/Belagerung mit Farbtabelle (`variation-a..g`): kein weißes Modell (jedes Material hat Textur oder eine Farbe ≠ Weiß).
- [ ] Ritter, Kosak, Kürassier auf echtem glTF-Pferd (Dateien `Horse*.glb` liegen bereit): Widerrist 0,85–0,95× Menschengröße, Pferd mit Laufanimation. Kamelreiter: eigenes Modell oder bewusst Code-Modell (Entscheid in Runde 3).
- [ ] Kaserne passt in jedem Zeitalter (Industriezeit: Backstein-Kaserne, kein Hochhaus, Höhe ≤ 2× Hütte). Hauptlager Renaissance ≥ 1,3× Hüttengröße und reicher gestaltet.
- [ ] Bäume: Nadelbaum 3–5× Arbeiterhöhe, Laubbaum 2,5–4×; Einheiten am Waldrand bleiben anklickbar.
- [ ] Erze: Stein, Eisen, Gold aus demselben Felsen-Grundmodell, Unterschied über Adern/Farbe; nichts Kindliches; Größe (sz) sichtbar.
- [ ] Öl: Ölfeld als erkennbare Quelle (Teer/Gestein, keine flache schwarze Pfütze), höchstens 3 je Spielerhälfte; Bohrturm als Gitterturm (≥ 2× Hüttenhöhe); Raffinerie mit Tanks, Rohren, Schornstein.
- [ ] Jede neu benutzte Datei steht in `models/CREDITS.md` (siehe M12).

**M9 Minen neu (Option A)** (Runde 4a) – `data.js`, `sim.js`, `ai.js`, `advisor.js`, `state.js` (placeBlock), `mp.js`, `render3d.js` (Karren, Schienen), Manifest, `i18n.js`. Vorher Entscheidung E2.
- [ ] Mine steht AUF dem Vorkommen (Mittelpunkt im Vorkommen-Radius) und ist ≥ 1,5× so groß wie heute.
- [ ] Erz fährt per Karren/Lore sichtbar zum nächsten Lager/Hauptlager; Ausbau „Schienen“ (BSPEC) macht Karren 1,5–2× schneller und zeigt Schienen.
- [ ] Balance: Erz je eingesetztem Arbeiter mit Mine (ohne Schienen) = heutiges Sammeln ±15 %; mit Schienen +30–60 %; leeres Vorkommen → Mine meldet sich.
- [ ] KI und Berater bauen Minen und Schienen nach den neuen Regeln (Selbstspiel: KI hat in Minute 30 ≥ 1 Mine mit Einkommen).
- [ ] Mehrspieler: Karren und Schienen im Spielstand; Zwei-Fenster-Test synchron.
- [ ] Texte DE/EN, Klang (Karren), Info-Feld zeigt Erz pro Minute.

**M10 Abstand bei Türmen und Gebäuden** (Runde 4a) – `sim.js` (autoExpand), `advisor.js`, `ai.js`, `data.js`
- [ ] Arbeiter-Lager/-Türme halten dieselben Abstände wie der Berater: Türme ≥ 300 px zu eigenen Türmen/Burgen, Gebäude Kante zu Kante je Typ.
- [ ] Eine gemeinsame Platzsuche und **eine** Abstandstabelle für Berater, KI und Arbeiter (V1).
- [ ] 30-Minuten-Selbstspiel: Abstände aller eigenen Gebäude gemessen, keine Unterschreitung.

**M11 Englisch vollständig** (laufend + Runde 5) – `i18n.js`
- [ ] Prüfskript meldet 0 fehlende Übersetzungen für `tr('…')`, Berater-Texte (`txt`) und Namen/Beschreibungen in `data.js`/`nav.js`. Heute fehlen 21: 6 Berater-Vorschläge (Raffinerie, Markt, Tausch, Fischerboot, Umverteilen, Lager am Wald), 9 Nationen-Beschreibungen, „Krokodil“, 5 Karten-Beschreibungen.
- [ ] Sichtprüfung in Englisch: Start, Menü (alle Reiter), Zeitalter-Baum, Info-Feld, Berater, Lobby, Ende – kein deutscher Text außer Eigennamen, nichts abgeschnitten.

**M12 Lizenzen und Namensnennung** (Runde 5) – `models/CREDITS.md`, `sounds/CREDITS.md`, `music/CREDITS.md`, `ui.js` (Reiter „Über“)
- [ ] Für jede im Manifest benutzte Datei: Quelle (Link), Autor, Lizenz. Heute steht dort „bitte eintragen“.
- [ ] CC-BY-Modelle werden im Spiel genannt (Menü → „Über / Mitwirkende“), u. a. Poly by Google (Ruderboot, Boot, Katapult, Flugzeuge), Gilang Romadhan (Flugzeug), SimplePolygon (Kristalle).
- [ ] Modelle mit unklarer Lizenz werden ersetzt oder nicht ausgeliefert.

**M13 Desktop-App vollständig** (sofort möglich, Datei frei) – `desktop/scripts/copy-game.js`
- [ ] Befund beheben: `copy-game.js` nimmt nur `units/buildings/animals/nodes` mit. Es fehlen 28 benutzte Dateien – alle Waffen (`hand`/`left`), Werkzeuge (`work.tool`), Fische/Wale (`sea`), Rohstoff-Symbole (`icons`). Im letzten App-Bau (11.10., 12:31) fehlen sie tatsächlich → Soldaten ohne Waffe, Arbeiter ohne Werkzeug.
- [ ] Nach `npm run prepare-game` existiert jede im Manifest genannte Datei in `desktop/game/models`; Selbsttest `--smoke`: `EKMODELS.failed` leer, 0 Konsolenfehler.
- [ ] Größe: `desktop/game` ≤ 50 MB, Installer ≤ 150 MB.

**M14 Mehrspieler kennt alle neuen Mechaniken** (jede Runde mit Spiellogik)
- [ ] Mauer ziehen (`wline`), Wälder (gleiche Bäume, gefällte Randbäume öffnen den Weg auch beim Gast), Minen (Karren/Schienen im Stand), Abriss (`case'demo'`), Ausbauten (schon im Stand).
- [ ] „Arbeiter denken mit“ (autoExpand/autoRepair/autoFinish) und Frontlinie bleiben im Mehrspieler aus – bewusst, in der Hilfe nennen.
- [ ] Zwei-Fenster-Test 15 min (lokal, BroadcastChannel) mit allen neuen Aktionen beider Seiten: keine Fehler, Stände gleich (Anzahl Einheiten/Gebäude/Bäume, Rohstoffe ±1).

**M15 Leistung** (jede Runde messen; Hauptarbeit Runde 3) – `render3d.js` (r3Nodes, r3Multi)
- [ ] Bildrate (Grafik „Normal“, Standardkamera; Spielbeginn und Schlacht mit 150 Einheiten) ≥ 80 % von v0.1.0 auf demselben Rechner; Schrittzeit ohne Zeichnen in Minute 30 ≤ 8 ms.
- [ ] Befund: Bäume/Felsen werden alle 0,4 s komplett neu eingetragen und **immer alle** gezeichnet (InstancedMesh mit `frustumCulled=false`, alle werfen Schatten). Mit 552–740 Bäumen à 1.600–3.200 Dreiecke ist das teuer → nur Bäume im Bild (+ Rand) eintragen, Schatten nur in Kameranähe.
- [ ] Steinzeit-Figur hat 13.700 Dreiecke (Arbeiter in Stein-/Bronzezeit): bei 200 Einheiten prüfen, sonst vereinfachen.

**M16 KI und Berater kennen das Neue** (Runde 4a) – `ai.js`, `advisor.js`
- [ ] KI holt Holz/Erz auch weiter als 900 px und baut dort ein Lager; nutzt nur Randbäume; baut neue Minen/Schienen.
- [ ] KI kommt an Mauern vorbei: ist kein Weg zum Ziel frei, greift sie die Mauer an. Test „Spieler mauert die Basis ganz ein“: KI-Truppen beschädigen die Mauer innerhalb von 3 min nach Ankunft (sonst kann man sich einmauern und wird nie angegriffen).
- [ ] Berater kennt Minen neu, Schienen, Abstände (M10), Lager am Waldrand; schlägt nichts vor, was dann nicht geht.

**M17 Durchspiel-Audit und Fix-Runde** (Runde 6)
- [ ] Qualitäts-Leitung spielt jedes Zeitalter (0–6) an: Bilder aller Einheiten, Gebäude, Tiere; alle Tätigkeiten; Aufstieg, Upgrade, Technologien, Nationenwahl, Flugzeuge, Schiffe. Alle „blockierend“-Mängel behoben, „sollte“-Mängel entschieden (beheben oder nach dem Release).

### Soll rein
**S1 Gebäude abreißen mit Rückerstattung** (Runde 4b) – `commands.js`, `ui.js`, `sim.js`, `mp.js`, `i18n.js`
- [ ] Knopf im Info-Feld + Tastenkürzel (nicht Entf/Rücktaste – die löschen Befehlsketten); Rückfrage per zweitem Klick.
- [ ] Rückerstattung: nicht begonnen 100 %, im Bau anteilig, fertig 50 % (E3). Hauptlager nicht abreißbar; Besatzung steigt aus; Wegfeld frei; Gebiet neu berechnet; Klang „crumble“.
- [ ] Mehrspieler `case'demo'`; Texte DE/EN.

**S2 Zeitalter-Baum mit Bildern und Flaggen** ✓ (b5743f5)

**S3 Truppenlinien** (nur wenn David E1 mit Ja beantwortet, dann Teil von Runde 2)

### Nach dem Release
- Tutorial / geführte erste Partie
- 3–4 Spieler
- Echte Musikstücke je Zeitalter (sobald David Dateien liefert)
- KI baut selbst Mauern; Tor in eine bestehende Mauer setzen
- „Arbeiter denken mit“ und Berater im Mehrspieler
- Code-Rückfallmodelle auf einfache Platzhalter kürzen (V4b)
- Spielstand speichern, Brücken, Diktaturen/Asien-Zweig

## Entscheidungen von David (2026-10-11)
- **E1 Truppenlinien:** Ja – in jedem Zeitalter sind nur die aktuellen Einheiten ausbildbar; veraltete nicht mehr (vorhandene bleiben stehen).
- **E2 Minen (Option A):** (a) Auch Stein braucht eine Mine. (b) Eisen/Gold/Stein ohne Mine nicht abbaubar. (c) Arbeiter gehen in die Mine (bis 5 je Mine); im Info-Feld ein Balken, der sich füllt; Knopf „Arbeiter herausholen“. (d) Zahl der Karren je Mine ausprobieren, so wie es gut aussieht und ausbalanciert ist.
- **E3 Abriss:** 50 % Rückerstattung für fertige Gebäude ist in Ordnung (unfertige: bezahlter Anteil zurück).
- **E4 `models/neu`:** Unbenutzte Dateien prüfen und in einen Archiv-Ordner verschieben (nicht löschen, später wieder nutzbar). Erst nach Runde 3 (Modelle), damit nichts Benötigtes verschoben wird; Desktop-App/Pages laden das Archiv nicht.
- **E5 Code-Modelle:** In eine eigene Datei/Ordner auslagern, wo sie nicht stören und später wiederzufinden sind (Rückfall bleibt möglich). In der Verschlanken-Runde.

## Reihenfolge und Datei-Belegung

| Runde | Inhalt | Dateien (Belegung) | parallel möglich |
|---|---|---|---|
| 1 (läuft) | A Ton + Tiere · B Mauer ziehen · C Wälder · D obere Leiste | A: `audio.js`, `sim.js` (animalMove), `gltfmodels.js`, Manifest · B: `commands.js`, `input.js`, `state.js`, `mp.js`, `render.js`, `ui.js`, `i18n.js` · C: `map.js`, `nav.js`, `sim.js`, `data.js` · D: `css/*`, `index.html` | – |
| 1+ (sofort) | E Desktop-Kopie reparieren (M13, V6) + CI-Prüfung erweitern (manifest.json gültig, jede Manifest-Datei vorhanden, Übersetzungs-Prüfskript) · F toter Code in `art.js`, `ai.js` (Teil von V2) | E: `desktop/scripts/copy-game.js`, `.github/workflows/web-check.yml`, `tools/` · F: `art.js`, `ai.js` | ja, mit Runde 1 (keine gemeinsamen Dateien) |
| 2 | Einheiten-Kontinuität, Animation im Spieltempo, Feldarbeit (M6, M7, ggf. S3) | Manifest (units), `gltfmodels.js`, `render3d.js` (r3Unit/r3Animal), ggf. `data.js` | braucht A fertig; nicht parallel zu 3 |
| 3 | Modelle & Gebäude, Erze, Öl, größere Bäume, Baum-Culling (M8, M15), danach V8 | Manifest (buildings/nodes/Ritter/Schiffe), `gltfmodels.js`, `models3d.js`, `render3d.js` (r3Nodes), `map.js` (Öl) | nach 2 (gleiche Dateien) |
| 4a | Minen neu + gemeinsame Platzsuche + Arbeiter-Abstände + KI/Berater-Wissen (M9, M10, M16, V1, V9, V10) | `data.js`, `sim.js`, `ai.js`, `advisor.js`, `state.js`, `mp.js`, `render3d.js`, Manifest, `i18n.js` | Lizenz-Recherche (M12 ohne `ui.js`) |
| 4b | Abriss (S1) | `commands.js`, `ui.js`, `sim.js`, `mp.js`, `i18n.js` | nach 4a |
| 5 | Englisch komplett, Fenster „Über/Mitwirkende“ (M11, M12) | `i18n.js`, `ui.js`, CREDITS-Dateien | nach 4b |
| 6 | Durchspiel-Audit → Fix-Runde (M17) | je nach Mängeln | – |
| 7 | Verschlanken V2–V8 ohne Verhaltensänderung + Regressionsprüfung | viele | – |
| 8 | Release-Checkliste, Doku, Version, App-Bau, Mehrspieler-Test, Go/No-Go | Doku, `index.html` (?v=) | – |

Begründung der Reihenfolge: Einheiten (Runde 2) zuerst, weil die meisten Mängel von David dort liegen; Runde 2 und 3 teilen sich Manifest, `gltfmodels.js` und `render3d.js` und laufen deshalb nacheinander. Minen/Abriss/KI zuletzt, weil sie die meisten Dateien berühren und auf den neuen Wäldern (Runde 1 C) aufbauen. Die Platzsuche (V1) wird dort gleich mit vereinheitlicht, weil M9 und M10 sie ohnehin brauchen.

## Risiken

| Risiko | Wirkung | Gegenmittel |
|---|---|---|
| Mehrere Bearbeiter in denselben Dateien (sim.js, Manifest, render3d.js, ui.js) | verlorene Änderungen, Fehler | Datei-Belegung je Runde (Tabelle oben), kleine Runden, Commit sofort nach QA-Abnahme |
| Minen Option A ist eine große neue Mechanik (Spiellogik, KI, Berater, Mehrspieler, Modelle, Balance) | Release verzögert sich | erst kurze Beschreibung + E2 klären; in zwei Schritten (A1 Mine + Karren, A2 Schienen); geht A2 nicht rechtzeitig: Schienen nach dem Release |
| Leistung: doppelt so viele Bäume ohne Culling, Schatten für alle, Figuren mit 13.700 Dreiecken | ruckelt auf schwachen Laptops | Culling/Schattenreichweite in Runde 3, Messung jede Runde gegen v0.1.0, Grafikstufe „Niedrig“ prüfen |
| Desktop-App unvollständig (nachgewiesen) oder zu groß | Soldaten ohne Waffen in der App | Kopierregel aus dem ganzen Manifest (V6), Selbsttest prüft `EKMODELS.failed`, Größenziel |
| Mehrspieler läuft auseinander durch neue Mechaniken | Abbrüche, unterschiedliche Karten | M14-Liste, Zwei-Fenster-Test nach jeder Spiellogik-Runde, Kartenerzeugung nur mit `R()` |
| Balance verschoben (Wälder, Minen, KI-Suchradius 900 px) | KI bleibt stecken, Spiel kippt | 60-min-Selbstspiel (3 Karten × 2 Seeds) nach jeder Wirtschafts-Runde mit festen Kennzahlen |
| Lizenzen (CC-BY ohne Namensnennung, unklare Quellen) | Veröffentlichung rechtlich unsauber | M12 vor dem Release; im Zweifel Modell ersetzen |
| Stilbruch der Modellquellen (Quaternius, Poly by Google, Kenney) | „zusammengewürfelt“ | Kontaktbögen je Runde von David abnehmen lassen, Farbtabellen/`tint` einheitlich |
| Neue Wünsche während der Arbeit | Release rutscht | neue Wünsche standardmäßig „nach dem Release“, außer sie blockieren; David entscheidet |
| Optische Rückschritte beim CSS-Aufräumen | Oberfläche kaputt | Bildvergleich vorher/nachher (4 Breiten × 3 Zeitalter × Start/Spiel/Menü) |
| Einmauern als Ausnutzung (KI findet keinen Weg) | Spiel unschlagbar leicht | Test in M16, KI greift Mauer an |
| Veraltete Doku (CLAUDE.md verweist noch auf `game.js`) | künftige Arbeiten gehen in die Irre | Doku-Pflege in Runde 8, Pflicht in der Checkliste |

## Verschlanken (nach den laufenden Arbeiten)
Maßstab: gleiches Verhalten, weniger und klarerer Code. Prüfung jeder Vereinfachung: `node --check`, fester Seed + 20 min Selbstspiel vorher/nachher mit gleichen Kennzahlen (±5 %), Bildvergleich der Oberfläche, 0 Konsolenfehler. Zeilen sind dicht geschrieben, deshalb steht die Ersparnis in KB. Zeilennummern Stand 11.10. (Dateien in Arbeit können sich verschieben).

| Nr | Wo | Was ändern | Ersparnis | Risiko | Wann |
|---|---|---|---|---|---|
| V1 | Platzsuche für Gebäude: `ai.js` findSpot (Z. 5), aiBestSpot (8–15), aiPlaceSpread, aiPlaceTower, aiPlace, aiPlaceHarbor, Lager-Platz (64–65), Minen-Platz (71–72); `advisor.js` advFindSpot (27–40), advMineSpot (42–43), Hafen-Winkel in advBuild (48, Kopie von `harborAngle`), Lager-Platz in advRules (126); `sim.js` autoExpand `spot()` (48) | eine Funktion `buildSpot(team,type,{x,y,dmin,dmax,ang,tol})` mit **einer** Abstandstabelle in `data.js` (ersetzt `AI_GAP` und die Berater-Tabelle), `harborAngle` überall; Richtung zum Gegner (`Math.atan2(H/2-hq.y,W/2-hq.x)`, 7×) als `foeDir(hq)` | ~5 KB | mittel (Bauverhalten KI/Berater) | Runde 4a, behebt M10 gleich mit |
| V2 | toter Code: `art.js` Z. 16–65 (2D-Gebäudezeichnung `bld`, `flag`, `crenel` … – benutzt wird nur `ART.icon`); `ui.js` Z. 165 `if(false){…}` alte Upgrade-Leiste + `#upgbar` in `index.html` + 7 CSS-Regeln; `ai.js` aiPlaceOld, aiPlaceToward (nie aufgerufen); `sim.js` navStampSafe (macht nur `sel.delete`), Alias towerSpec (1× in `mp.js`), verwaiste Kommentare (Z. 27, 234) | löschen bzw. direkt aufrufen | ~8 KB | sehr gering | `art.js`/`ai.js` sofort (F), Rest Runde 7 |
| V3 | `css/style.css`: sechs Design-Schichten übereinander (Grundlayout bis Z. 188, „Neues Oberflächen-Design“ 189, „Farbwelten“ 267, „PC-Spiel-Look“ 290, „Rahmen“ 376, „Rahmen 3“ 419) + neu `topbar.css`. Gemessen: `#top` in 16 Regeln, `#epoch` 11, `#panel` 10, `.res` 9; 387 von 2.049 Angaben werden später für denselben Selektor überschrieben | je Bauteil eine Regel mit dem Endwert, überschriebene Angaben löschen, `topbar.css` einarbeiten | ~12–15 KB (49 → ~35 KB) | mittel (Optik) | Runde 7, nach D |
| V4 | Code-Modelle, die glTF ersetzt hat: `blderas.js` (151 Zeilen, 20 KB) baut Hütte/Kaserne/Mine/Turm/Hauptlager/Lager/Hafen/Markt/Burg je Zeitalter – das Manifest deckt genau diese in allen Zeitaltern ab, `blderas.js` greift nur noch, wenn ein glTF nicht lädt. Ebenso in `models3d.js` die Menschen-Figuren (`human`, `dress`, `headgear`, Waffen, UNIT3 der Menschen, ~25 KB) und `render3d.js` `r3Human` (~4 KB): nur Rückfall | V4a: `blderas.js` entfernen (Rückfall = einfaches BLD3-Modell). V4b (E5, nach dem Release): Menschen-Rückfall auf eine einfache Figur kürzen; Tiere/Bäume brauchen das Code-Modell noch als Größenmaß (`refSize`, `refGeo`) → `height` im Manifest eintragen. Behalten: alles ohne glTF (Reiter, Kanone, Rammbock, Haubitze, Panzerschiff, Skoda, Bertha, Mauer/Tor/Graben, Bohrturm/Raffinerie, Ausbau- und Pfosten-Modelle) | V4a 20 KB, V4b ~30 KB | V4a gering, V4b mittel | V4a Runde 7, V4b nach dem Release |
| V5 | `models/neu`: 869 Dateien im Git, 208 MB; im Manifest benutzt ~90 (39 MB); 784 Dateien (169 MB) unbenutzt (Möbel, Essen, Varianten, Kenney-Einzelteile). Dazu `oil.png` (828 KB) im Wurzelordner, nirgends benutzt | unbenutzte Dateien in ein Archiv (Release-Anhang oder eigener Zweig) auslagern; behalten: Benutztes + Geplantes (Pferde, Kenney ship/siege/boat + `variation-*.png`, Cart, Mine). `oil.png` nach M8 löschen | ~150 MB Arbeitskopie und Web-Auslieferung (Git-Verlauf bleibt) | gering | nach Runde 3, Entscheidung E4 |
| V6 | „Welche Dateien werden gebraucht?“ steht zweimal und verschieden: `gltfmodels.js` init (Z. 167) und `desktop/scripts/copy-game.js` → Ursache von M13 | `copy-game.js` nimmt jeden Wert von `file`/`files` im ganzen Manifest (rekursiv); Klänge nur aus `SAMPLES` (36 von ~224 Dateien) | wenig Code, ~2,5 MB App | gering | sofort (E) |
| V7 | Raster-Helfer doppelt: Binär-Heap in `nav.js` (A*) und `map.js` (forestPass); 4er-Nachbarn `[x>0?i-1:-1,…]` 4× (`nav.js` 1×, `map.js` 3×); Rand- und Land-Kreuzprüfung in `validSpot` (sim.js 287), `wallSpot` (state.js), `landSpot` (map.js) | `nb4(i)`, `MinHeap`, `landCross(x,y,r)` einmal in `nav.js` | ~2 KB | gering (Prüfung: gleicher Seed → gleiche Baumliste) | Runde 7, nach C |
| V8 | `gltfmodels.js`: 4× „traverse + `o.material=Array.isArray(...)?…map(f):f(…)`“ (dress/tint, tintAll, makeSea, iconModel), Umgebungslicht-Anpassung doppelt (prepare, nodeParts) | Helfer `eachMat(root,f)` | ~1 KB | gering | Ende Runde 3 |
| V9 | „Bauarbeiter zuweisen“ 6× gleich: `sim.js` autoRepair (33–34), autoFinish (71–72), autoExpand.put (49); `ai.js` (57); `advisor.js` advBuild (49–51), Lager-Vorschlag (127) | `nearestWorker(team,x,y,filter)` + `setBuilder(w,b,rep)` | ~1,5 KB | gering–mittel | Runde 4a |
| V10 | Ausbau-Wirkungen als Sonderfälle: `sim.js` specFx (Z. 20), spawn (217: drill/range/navy/ace/armor/prod), buildSpec (Turm +50 %, Hauptlager +20 % Leben) | Wirkung als `fx` direkt in `BSPEC` (`data.js`), eine Schleife liest sie; neue Ausbauten (z. B. Schienen) brauchen nur Daten | ~1,5 KB | gering–mittel (Werte 1:1 übernehmen) | Runde 4a |

Summe: etwa 55–65 KB weniger JS/CSS (von ~605 KB) und ~150 MB weniger Arbeitskopie. Zusätzlich lohnt ein kleines Prüfskript im Ordner `tools/` (Übersetzungen, Manifest-Dateien vorhanden), das die CI bei jedem Push laufen lässt.

## Release-Checkliste
- [ ] Alle Muss-Punkte M1–M17 von der Qualitäts-Leitung abgenommen (Datum in `QA.md`)
- [ ] `node --check` alle JS; `models/manifest.json` gültig; `EKMODELS.failed` leer; `SND.dbg()` alle Klänge geladen
- [ ] Web-Test: 20-min-Partie ohne Konsolenfehler; nach dem Merge die GitHub-Pages-Version getestet
- [ ] Leistung: Bildrate ≥ 80 % von v0.1.0, Schrittzeit-Ziele aus M4/M15
- [ ] Mehrspieler: 15-min-Zwei-Fenster-Test (M14) und ein Test über das Internet (PeerJS) mit David
- [ ] Desktop: Kopie vollständig, `--smoke` ok, Installer über die Action gebaut, Größe ≤ 150 MB, Auto-Update von v0.1.0 auf v0.2.0 getestet
- [ ] Englisch: Prüfskript 0 fehlend + Sichtprüfung
- [ ] Lizenzen: `models/`, `sounds/`, `music/CREDITS.md` vollständig, Mitwirkende im Spiel
- [ ] Doku aktuell: `CLAUDE.md` (veraltete `game.js`-Verweise, neue Mechaniken Wälder/Mauer ziehen/Minen/Abriss), `ROADMAP.md`, `QA.md`, `VEROEFFENTLICHEN.md`, `MODELLE.md`
- [ ] Cache-Version in `index.html` (`?v=`) erhöht; Versionsanzeige zeigt 0.2.0
- [ ] Release-Notiz „Was ist neu“ (DE/EN) für das GitHub-Release
- [ ] Pull Request gemergt, Release `v0.2.0` erstellt (David)
