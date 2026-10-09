/* Sprachen: Deutsch (Standard) und Englisch. tr('deutscher Text') liefert den englischen Text, wenn Englisch gewählt ist.
   Neue Texte: im Code deutsch schreiben, mit tr('...') umschliessen und hier unten die englische Übersetzung ergänzen. */
const EN={
  // Oberfläche oben
  'Nahrung':'Food','Holz':'Wood','Stein':'Stone','Bevölkerung':'Population','Pause':'Pause','Weiter':'Resume','Menü':'Menu',
  'Spieltempo':'Game speed','Tempo {0}×':'Speed {0}×','Menü (Esc)':'Menu (Esc)',
  'Alle Arbeiter beschäftigt':'All workers busy','{0} untätige Arbeiter':'{0} idle workers','1 untätiger Arbeiter':'1 idle worker',
  'Untätigen Arbeiter auswählen (.)':'Select an idle worker (.)',
  // Namen
  'Arbeiter':'Worker','Späher':'Scout','Keulenkrieger':'Clubman','Speerträger':'Spearman','Bogenschütze':'Archer','Schwertkämpfer':'Swordsman',
  'Hauptlager':'Town Center','Hütte':'Hut','Lager':'Storehouse','Kaserne':'Barracks','Wachturm':'Watchtower',
  'Baum':'Tree','Beerenstrauch':'Berry Bush','Steinvorkommen':'Stone Deposit',
  'Steinzeit':'Stone Age','Bronzezeit':'Bronze Age','Eisenzeit':'Iron Age',
  '+5 Bevölkerung':'+5 population','Abgabestelle':'Drop-off point','Bildet Krieger aus':'Trains warriors','Schiesst auf Gegner':'Shoots at enemies',
  'Wartet':'Idle','Unterwegs':'Moving','Angriffsmarsch':'Attack-move','Kämpft':'Fighting','Baut':'Building',
  // Meldungen
  'Nicht genug {0}':'Not enough {0}',' und ':' and ',
  '{0} erreicht! Neue Einheiten und Gebäude verfügbar.':'{0} reached! New units and buildings available.',
  'Der Gegner hat die {0} erreicht.':'The enemy has reached the {0}.',
  'Deine Siedlung wird angegriffen!':'Your settlement is under attack!',
  'Erst ab der {0} verfügbar.':'Available from the {0}.',
  'Die Warteschlange ist voll (max. 5).':'The queue is full (max. 5).',
  'Aufstieg in die {0} begonnen.':'Advancing to the {0}.',
  '{0} fertiggestellt.':'{0} completed.',
  'Hier ist kein Platz.':'No room here.','Dieses Gebiet ist noch unerkundet.':'This area is still unexplored.',
  'Alle Arbeiter haben zu tun.':'All workers are busy.',
  'Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.':'Tip: Select your workers and right-click berries or trees to send them gathering.',
  // Aktionen und Info
  'Taste Q, dann Ziel':'Key Q, then target','Halt':'Stop','Befehle abbrechen':'Cancel orders','Aufstieg: {0}':'Advance: {0}','ab {0}':'from {0}',
  'Gegner':'Enemy','Vorrat':'Supply','Sammelt {0}':'Gathering {0}','Bringt {0} zum Lager':'Carrying {0} to base','trägt {0} {1}':'carrying {0} {1}',
  'Angriff {0} · Reichweite {1}':'Attack {0} · Range {1}','Nahkampf':'Melee','ausgewählt':'selected',
  'Im Bau: {0} %':'Under construction: {0} %','Arbeiter per Rechtsklick zum Bauen schicken':'Right-click to send workers to build',
  'Aufstieg in die {0}':'Advancing to the {0}','Klicken zum Abbrechen':'Click to cancel','Platz fehlt':'No room',
  'Rechtsklick auf die Karte setzt den Sammelpunkt.':'Right-click the map to set the rally point.',
  'Bietet Platz für {0} Bewohner':'Houses {0} inhabitants','Auswahl aufheben':'Clear selection',
  'Linksklick oder Rahmen ziehen wählt aus. Rechtsklick gibt Befehle: bewegen, sammeln, bauen, angreifen. Doppelklick wählt alle gleichen Einheiten im Bild.':'Left-click or drag a box to select. Right-click to give orders: move, gather, build, attack. Double-click selects all units of the same kind on screen.',
  '{0} platzieren: Klick auf freie Fläche · Umschalt hält den Modus · Rechtsklick oder Esc bricht ab':'Place {0}: click free ground · Shift keeps the mode · right-click or Esc cancels',
  'Angriffsmarsch: Ziel anklicken · Truppen greifen unterwegs alles an · Esc bricht ab':'Attack-move: click a target · troops attack everything on the way · Esc cancels',
  'Pausiert · Leertaste setzt fort':'Paused · Space resumes',
  'Im Bau':'Under construction','Kein Bauarbeiter!':'No builder!',
  // Menü
  'Musik':'Music','Ton':'Sound','Lautstärke':'Volume','Sprache':'Language','Spiel fortsetzen':'Resume game','Neues Spiel':'New game','Einstellungen':'Settings',
  // Start und Ende
  'Prototyp · Echtzeitstrategie · 1 gegen 1':'Prototype · Real-time strategy · 1 vs 1',
  'Führe deinen Stamm durch drei Zeitalter. Sammle Nahrung, Holz und Stein, baue deine Siedlung aus und zerstöre das Hauptlager des Gegners, bevor er deins erreicht.':'Lead your tribe through three ages. Gather food, wood and stone, expand your settlement and destroy the enemy town center before he reaches yours.',
  'Schwierigkeit':'Difficulty','leicht':'Easy','normal':'Normal','schwer':'Hard',
  'Auswählen':'Select','Linksklick, Rahmen ziehen, Doppelklick für alle gleichen':'Left-click, drag a box, double-click for all of a kind',
  'Befehl':'Orders','Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt':'Right-click: move, gather, build, attack, rally point',
  'Kamera':'Camera','WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt':'WASD or arrow keys, screen edge, minimap, mouse wheel zooms',
  'Tasten':'Keys','Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü':'Q attack-move · H town center · . idle worker · Space pause · Esc menu',
  'Touch':'Touch','Tippen wählt aus, mit Auswahl tippen gibt Befehl, Wischen bewegt die Karte':'Tap to select, tap with a selection to give an order, swipe to move the map',
  'Spiel starten':'Start game',
  'Das gegnerische Hauptlager ist gefallen':'The enemy town center has fallen','Dein Hauptlager wurde zerstört':'Your town center was destroyed',
  'Sieg':'Victory','Niederlage':'Defeat','Spielzeit':'Time played','Ausgebildet':'Trained','Gegner besiegt':'Enemies defeated',
  'Erreichtes Zeitalter: {0}. Schwierigkeit: {1}.':'Age reached: {0}. Difficulty: {1}.',
  // Stufen und Upgrades
  'Eisen':'Iron','Eisenvorkommen':'Iron Deposit','Stufe {0}':'Level {0}','Upgrade':'Upgrade','Alle upgraden':'Upgrade all','Erst upgraden':'Upgrade first',
  '{0} Gebäude · {1} Truppen':'{0} buildings · {1} troops',
  'Erst alle Gebäude und Truppen auf Stufe {0} bringen.':'First bring all buildings and troops to level {0}.',
  'Alle Gebäude und Truppen sind jetzt auf Stufe {0}.':'All buildings and troops are now level {0}.',
  'Upgrade gestartet: Truppen und Gebäude ruhen, bis es fertig ist.':'Upgrade started: troops and buildings rest until it is done.',
  'Upgrade läuft: Truppen und Gebäude ruhen, bis es fertig ist.':'Upgrade in progress: troops and buildings rest until it is done.',
  'Arbeiter brauchen Stufe {0}, um {1} abzubauen.':'Workers need level {0} to mine {1}.',
  'Vor dem nächsten Aufstieg müssen alle darauf sein':'All must reach this before the next age',
  // Wasser
  'Hafen':'Harbor','Boote und Fischfang':'Boats and fishing','Fischerboot':'Fishing Boat','Kriegsschiff':'Warship','Fischschwarm':'School of Fish','Delfine':'Dolphins','Wal':'Whale',
  'Der Hafen muss zwischen Land und flachem Wasser stehen.':'The harbor must stand between land and shallow water.',
  // Gebiet
  'Neues Gebiet erobert!':'New territory claimed!',
  'Nur im eigenen Gebiet. Ein Wachturm erobert neues Land.':'Only inside your territory. A watchtower claims new land.'
};
let LANG='de';try{LANG=localStorage.getItem('ek-lang')==='en'?'en':'de'}catch(_){}
function tr(de,...a){let s=LANG==='en'&&EN[de]!==undefined?EN[de]:de;a.forEach((v,i)=>{s=s.split('{'+i+'}').join(v)});return s}
function setLang(l){LANG=l==='en'?'en':'de';try{localStorage.setItem('ek-lang',LANG)}catch(_){}document.documentElement.lang=LANG;
  document.querySelectorAll('[data-t]').forEach(el=>{el.textContent=tr(el.dataset.t)});
  document.querySelectorAll('[data-tt]').forEach(el=>{el.title=tr(el.dataset.tt)})}
