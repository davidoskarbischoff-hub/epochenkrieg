// Spieldaten: Einheiten, Gebäude, Ressourcen, Epochen, Schwierigkeit, Farben.
// Hier lässt sich das Balancing ändern, ohne die Spiellogik anzufassen.
const W=4800,H=3200,CARRY=15;
const AREA=W*H/(3600*2400); /* Kartengrösse im Vergleich zur ersten Version (für Anzahlen von Vorkommen, Gras usw.) */
// Sammeln je Ressource: Tempo-Faktor und Tragekapazität (Beeren bringen mehr, weil Nahrung sonst knapp ist)
const GATHER={food:{rate:1.5,carry:15},wood:{rate:1.2,carry:12},stone:{rate:.9,carry:10},iron:{rate:.8,carry:8},gold:{rate:.7,carry:8},oil:{rate:.75,carry:10}};
const UNITS={
  worker:{cls:'wk',gather:true,builds:true,passive:true,name:'Arbeiter',sight:130,hp:40,spd:58,atk:3,rng:4,cd:1.2,r:4,vr:7,cost:{food:50},time:9,ep:0,from:'hq'},
  scout:{cls:'wk',name:'Späher',passive:true,sight:300,hp:40,spd:105,atk:0,rng:4,cd:1.2,r:6,cost:{food:60,wood:20},time:10,ep:0,from:'hq'},
  boat:{cls:'ship',name:'Fischerboot',naval:true,gather:true,passive:true,sight:200,hp:90,spd:72,atk:0,rng:4,cd:1.2,r:11,cost:{wood:80},time:14,ep:0,from:'harbor'},
  warship:{cls:'ship',tech:'shipbuild',name:'Kriegsschiff',naval:true,ranged:true,sight:240,hp:230,spd:62,atk:15,rng:175,cd:1.8,r:13,cost:{wood:140,stone:60},time:24,ep:1,from:'harbor'},
  sling:{cls:'rng',name:'Steinschleuderer',sight:150,hp:50,spd:58,atk:6,rng:105,cd:1.7,r:7,cost:{food:40,wood:25},time:12,ep:0,from:'barracks',ranged:true},
  club:{cls:'inf',name:'Keulenkrieger',sight:140,hp:75,spd:52,atk:7,rng:4,cd:1.1,r:8,cost:{food:60,wood:20},time:12,ep:0,from:'barracks'},
  spear:{cls:'spear',tech:'spearbuild',name:'Speerträger',sight:140,hp:115,spd:54,atk:11,rng:8,cd:1.1,r:8,cost:{food:70,wood:40},time:14,ep:1,from:'barracks'},
  archer:{cls:'rng',tech:'bowbuild',name:'Bogenschütze',sight:170,hp:55,spd:55,atk:8,rng:130,cd:1.6,r:7,cost:{food:40,wood:60},time:14,ep:1,from:'barracks',ranged:true},
  hbow:{cls:'rng',tech:'stables',name:'Berittener Schütze',sight:180,hp:120,spd:78,atk:10,rng:125,cd:1.5,r:10,cost:{food:100,wood:60,iron:30},time:20,ep:3,from:'barracks',ranged:true},
  knight:{cls:'cav',tech:'stables',name:'Ritter',sight:170,hp:230,spd:70,atk:21,rng:6,cd:1.2,r:10,cost:{food:110,iron:60},time:22,ep:3,from:'barracks'},
  crossbow:{cls:'rng',tech:'crossbowbuild',name:'Armbrustschütze',sight:180,hp:110,spd:52,atk:28,rng:150,cd:2,r:7,cost:{food:70,wood:60,iron:30},time:18,ep:3,from:'barracks',ranged:true},
  musket:{cls:'rng',tech:'powder',name:'Musketier',sight:190,hp:135,spd:52,atk:46,rng:175,cd:2.2,r:7,cost:{gold:25,food:80,wood:40,iron:60},time:20,ep:4,from:'barracks',ranged:true,gun:true},
  cannon:{cls:'siege',tech:'foundry',name:'Kanone',sight:200,hp:170,spd:34,atk:60,rng:240,cd:4.2,r:11,cost:{gold:60,wood:160,iron:140},time:30,ep:4,from:'barracks',splash:40,ranged:true,siege:true},
  ram:{cls:'siege',tech:'siegeworks',name:'Rammbock',sight:150,hp:330,spd:42,atk:42,rng:6,cd:2.2,r:11,cost:{wood:200,iron:60},time:26,ep:3,from:'barracks',siege:true},
  catapult:{cls:'siege',tech:'siegeworks',name:'Katapult',sight:190,hp:140,spd:36,atk:48,rng:250,cd:4.8,r:10,cost:{wood:220,stone:120},time:30,ep:3,from:'barracks',splash:40,ranged:true,siege:true},
  galleon:{cls:'ship',tech:'galleonbuild',name:'Galeone',naval:true,ranged:true,sight:260,hp:380,spd:58,atk:28,rng:210,cd:2.2,r:15,cost:{wood:200,iron:80},time:32,ep:3,from:'harbor'},
  rifle:{cls:'rng',tech:'rifles',name:'Gewehrschütze',sight:210,hp:190,spd:54,atk:74,rng:195,cd:1.9,r:7,cost:{gold:35,food:100,wood:40,iron:90},time:22,ep:5,from:'barracks',ranged:true,gun:true},
  tank:{cls:'siege',tech:'armor',name:'Panzer',sight:230,hp:900,spd:48,atk:120,rng:210,cd:2.0,r:17,cost:{wood:200,iron:320,gold:140,oil:60},time:38,ep:5,from:'barracks',splash:26,ranged:true,siege:true},
  howitzer:{cls:'siege',tech:'artillery',name:'Haubitze',sight:230,hp:200,spd:34,atk:90,rng:300,cd:4.8,r:12,cost:{gold:110,wood:260,iron:260},time:34,ep:5,from:'barracks',splash:45,ranged:true,siege:true},
  ironclad:{cls:'ship',tech:'ironclads',name:'Panzerschiff',naval:true,ranged:true,sight:280,hp:620,spd:58,atk:44,rng:240,cd:2.4,r:17,cost:{gold:90,wood:260,iron:240},time:40,ep:5,from:'harbor'},
  healer:{cls:'med',passive:true,heal:2.2,name:'Heiler',sight:150,hp:80,spd:56,atk:0,rng:4,cd:1.2,r:7,cost:{food:60,wood:20},time:14,ep:0,from:'barracks'},
  engineer:{cls:'inf',builds:true,name:'Ingenieur',sight:160,hp:95,spd:54,atk:7,rng:5,cd:1.2,r:7,cost:{food:70,wood:50,iron:20},time:16,ep:3,from:'barracks'},
  /* ---- Weltkriegszeit (Zeitalter VII): gemeinsame Truppen für alle Nationen ---- */
  assault:{cls:'inf',name:'Sturmsoldat',sight:170,hp:200,spd:62,atk:32,rng:6,cd:1.0,r:8,cost:{food:110,iron:50,gold:30},time:16,ep:6,from:'barracks'},
  mg:{cls:'rng',name:'Maschinengewehr',sight:200,hp:200,spd:42,atk:20,rng:190,cd:.35,r:8,cost:{food:80,wood:40,iron:110,gold:40},time:22,ep:6,from:'barracks',ranged:true,gun:true},
  plane:{cls:'air',air:true,name:'Jagdflugzeug',sight:280,hp:190,spd:160,atk:16,rng:110,cd:.45,r:10,cost:{wood:150,iron:200,gold:90,oil:80},time:26,ep:6,from:'airfield',ranged:true,gun:true},
  /* ---- Nationen-Spezialeinheiten (je zwei pro Nation) ---- */
  skoda:{cls:'siege',nation:'at',name:'Škoda-Mörser „Emma“',sight:230,hp:240,spd:22,atk:150,rng:330,cd:6.2,r:13,cost:{wood:320,iron:420,gold:200,oil:50},time:44,ep:6,from:'barracks',splash:50,ranged:true,siege:true},
  alpini:{cls:'rng',nation:'at',name:'Kaiserjäger',sight:210,hp:195,spd:54,atk:64,rng:215,cd:1.7,r:7,cost:{food:110,wood:40,iron:90,gold:30},time:22,ep:6,from:'barracks',ranged:true,gun:true},
  sturm:{cls:'inf',nation:'de',name:'Sturmtruppe',sight:180,hp:270,spd:64,atk:42,rng:6,cd:1.0,r:8,cost:{food:115,iron:70,gold:50},time:20,ep:6,from:'barracks'},
  bertha:{cls:'siege',nation:'de',name:'Dicke Bertha',sight:240,hp:280,spd:18,atk:175,rng:380,cd:8,r:14,cost:{wood:400,iron:500,gold:260,oil:70},time:50,ep:6,from:'barracks',splash:60,ranged:true,siege:true},
  rekrut:{cls:'rng',nation:'ru',name:'Rekrut',sight:150,hp:70,spd:56,atk:9,rng:130,cd:1.8,r:7,cost:{food:50,wood:25},time:6,ep:6,from:'barracks',ranged:true,gun:true},
  kosak:{cls:'cav',nation:'ru',name:'Kosak',sight:200,hp:220,spd:92,atk:30,rng:6,cd:1.0,r:11,cost:{food:150,gold:50},time:18,ep:6,from:'barracks'},
  kamel:{cls:'cav',nation:'ot',name:'Kamelreiter',sight:210,hp:180,spd:84,atk:24,rng:6,cd:1.0,r:12,cost:{food:130,gold:30},time:17,ep:6,from:'barracks'},
  janit:{cls:'rng',nation:'ot',name:'Janitschar',sight:190,hp:170,spd:54,atk:50,rng:150,cd:1.5,r:7,cost:{food:100,wood:30,iron:60,gold:40},time:20,ep:6,from:'barracks',ranged:true,gun:true},
  mark1:{cls:'siege',nation:'uk',name:'Mark I',sight:200,hp:780,spd:30,atk:100,rng:150,cd:3,r:15,cost:{wood:230,iron:380,gold:120,oil:70},time:40,ep:6,from:'barracks',splash:26,ranged:true,siege:true},
  bomber:{cls:'air',air:true,nation:'uk',name:'Bomber',sight:260,hp:320,spd:110,atk:120,rng:26,cd:3.5,r:13,cost:{wood:220,iron:260,gold:150,oil:110},time:36,ep:6,from:'airfield',bomber:true},
  renault:{cls:'siege',nation:'fr',name:'Renault FT',sight:190,hp:320,spd:60,atk:55,rng:170,cd:1.8,r:11,cost:{wood:120,iron:180,gold:70,oil:30},time:24,ep:6,from:'barracks',ranged:true,siege:true},
  kurass:{cls:'cav',nation:'fr',name:'Kürassier',sight:200,hp:300,spd:80,atk:40,rng:6,cd:1.0,r:11,cost:{food:140,iron:60,gold:40},time:20,ep:6,from:'barracks'},
  bersag:{cls:'rng',nation:'it',name:'Bersagliere',sight:200,hp:150,spd:78,atk:32,rng:150,cd:1.3,r:7,cost:{food:90,wood:30,iron:50,gold:20},time:16,ep:6,from:'barracks',ranged:true,gun:true},
  carro:{cls:'siege',nation:'it',name:'Carro Veloce',sight:200,hp:360,spd:78,atk:50,rng:150,cd:1.4,r:11,cost:{wood:110,iron:170,gold:60,oil:30},time:22,ep:6,from:'barracks',splash:20,ranged:true,siege:true},
  banzai:{cls:'inf',nation:'jp',name:'Sturmsoldat Banzai',sight:170,hp:250,spd:70,atk:44,rng:6,cd:.9,r:8,cost:{food:120,iron:90,gold:40},time:16,ep:6,from:'barracks'},
  zero:{cls:'air',air:true,nation:'jp',name:'Jagdflugzeug Zero',sight:290,hp:150,spd:200,atk:20,rng:120,cd:.4,r:10,cost:{wood:140,iron:190,gold:100,oil:80},time:28,ep:6,from:'airfield',ranged:true,gun:true},
  doughboy:{cls:'rng',nation:'us',name:'Doughboy',sight:200,hp:210,spd:56,atk:42,rng:170,cd:1.5,r:7,cost:{food:100,wood:30,iron:70,gold:20},time:18,ep:6,from:'barracks',ranged:true,gun:true},
  fighter:{cls:'air',air:true,nation:'us',name:'Jagdflieger',sight:290,hp:190,spd:175,atk:22,rng:120,cd:.4,r:10,cost:{wood:160,iron:210,gold:110,oil:90},time:30,ep:6,from:'airfield',ranged:true,gun:true},
  cart:{cls:'wk',passive:true,name:'Lore',sight:80,hp:160,spd:42,atk:0,rng:4,cd:1,r:6,vr:4.2,cost:{},ep:9,pop:0},
  sword:{cls:'inf',tech:'smithy',name:'Schwertkämpfer',sight:150,hp:150,spd:52,atk:15,rng:5,cd:1.1,r:9,cost:{food:80,iron:40},time:18,ep:2,from:'barracks'}
};
/* Turm-Ausbau: Verteidigung (stärker schiessen, mehr Leben) oder Aussicht (Sicht und Gebiet) */
const BSPEC={
  tower:{def:{name:'Wehrturm',ep:1,cost:{wood:120,stone:140,iron:60},sub:'Schiesst stärker und weiter, hält mehr aus'},obs:{name:'Aussichtsturm',ep:4,cost:{wood:100,stone:80},sub:'Doppelte Sicht, grösseres Gebiet'}},
  hq:{eco:{name:'Handelshof',ep:2,cost:{wood:250,stone:200,gold:60},sub:'Arbeiter sammeln 20 % schneller, +10 Bevölkerung'},mil:{name:'Kommandozentrale',ep:2,cost:{wood:250,stone:200,iron:100},sub:'Ausbildung 25 % schneller, neue Truppen +10 % Leben'}},
  harbor:{fish:{name:'Fischerhafen',ep:2,cost:{wood:200,stone:80},sub:'Boote fangen 25 % mehr'},navy:{name:'Werft',ep:3,cost:{wood:250,iron:120},sub:'Neue Schiffe +25 % Leben'}},
  market:{trade:{name:'Handelskontor',ep:3,cost:{wood:200,stone:150},sub:'Besserer Kurs: Verkauf bringt 25 % mehr Gold'},bank:{name:'Bank',ep:4,cost:{wood:200,stone:250,gold:100},sub:'Bringt dauerhaft Gold (1,5 pro Sekunde)'}},
  airfield:{ace:{name:'Jagdstaffel',ep:6,cost:{wood:200,iron:150,gold:100},sub:'Neue Flugzeuge +25 % Schaden'},armor:{name:'Panzerung',ep:6,cost:{wood:200,iron:200,gold:80},sub:'Neue Flugzeuge +30 % Leben'}},
  mine:{rails:{name:'Schienen',ep:3,cost:{wood:150,iron:60},sub:'Loren auf Schienen: doppelt so schnell, eine zweite Lore'},deep:{name:'Tiefer Stollen',ep:2,cost:{wood:150,stone:100},sub:'Bergleute fördern 30 % mehr'}},
  barracks:{drill:{name:'Drillplatz',ep:1,cost:{wood:150,iron:80},sub:'Nahkämpfer und Reiter dieser Kaserne +25 % Leben'},range:{name:'Schiessstand',ep:2,cost:{wood:150,iron:80},sub:'Fernkämpfer dieser Kaserne +25 % Schaden'}}
};
const TSPEC=BSPEC.tower;
const BLDS={
  hq:{name:'Hauptlager',sight:280,claim:260,hp:1400,r:36,pop:10,drop:true,shoot:{rng:150,atk:6,cd:1.8}},
  house:{name:'Hütte',sight:150,claim:100,hp:250,r:16,pop:5,cost:{wood:50},time:14,ep:0,sub:'+5 Bevölkerung'},
  store:{name:'Lager',sight:170,claim:120,hp:350,r:18,drop:true,cost:{wood:80},time:16,ep:0,sub:'Abgabestelle'},
  airfield:{name:'Flugplatz',sight:200,claim:120,hp:800,r:30,cost:{wood:300,iron:200,gold:100},time:40,ep:6,sub:'Bildet Flugzeuge aus'},
  barracks:{name:'Kaserne',sight:190,claim:130,hp:700,r:27,cost:{wood:150},time:24,ep:0,sub:'Bildet Krieger aus'},
  harbor:{name:'Hafen',sight:190,claim:140,hp:600,r:24,drop:true,cost:{wood:120},time:20,ep:0,sub:'Boote und Fischfang'},
  castle:{name:'Burg',sight:340,claim:250,hp:1600,r:40,cost:{wood:200,stone:260,iron:80},time:45,ep:3,shoot:{rng:205,atk:15,cd:1.3},sub:'Starke Festung, erobert Land'},
  wall:{name:'Mauer',sight:60,hp:520,r:11,cost:{wood:8,stone:3},time:5,ep:1,sub:'Palisade, später Stein und Sperren – Ziehen mit gedrückter Maustaste'},
  gate:{name:'Tor',sight:80,hp:480,r:13,cost:{wood:30,stone:8},time:10,ep:1,passable:true,sub:'Einheiten kommen hindurch'},
  farm:{name:'Feld',sight:120,claim:60,hp:200,r:20,passable:true,cost:{wood:70},time:16,ep:1,sub:'Nahrung, die immer nachwächst'},
  trench:{name:'Stellung',sight:110,hp:260,r:15,cost:{wood:25,stone:10},time:8,ep:1,passable:true,cover:true,sub:'Truppen darin erleiden 35 % weniger Schaden'},
  derrick:{name:'Bohrturm',sight:150,claim:80,hp:420,r:16,cost:{wood:150,iron:80},time:24,ep:5,sub:'Nötig, um Öl zu fördern'},
  refinery:{name:'Raffinerie',sight:170,claim:110,hp:650,r:24,dropOil:true,cost:{wood:200,stone:100,iron:120},time:34,ep:5,sub:'Hier wird Öl abgeliefert'},
  mine:{name:'Mine',sight:150,claim:90,hp:520,r:20,cost:{wood:120},time:20,ep:1,sub:'Für Stein, Eisen und Gold: Arbeiter arbeiten drinnen, eine Lore bringt das Erz zum Lager'},
  market:{name:'Markt',sight:170,claim:110,hp:520,r:22,cost:{wood:150,stone:80},time:24,ep:3,sub:'Rohstoffe gegen Gold tauschen'},
  tower:{name:'Wachturm',sight:300,claim:320,hp:550,r:14,cost:{wood:70,stone:60},time:26,ep:0,shoot:{rng:170,atk:9,cd:1.5},sub:'Schiesst auf Gegner'}
};
const NODES={tree:{cap:3,rt:'wood',amt:420,r:11,name:'Baum'},bush:{cap:3,rt:'food',amt:340,r:8,name:'Beerenstrauch',regen:1.4},stone:{cap:6,rt:'stone',amt:3200,r:38,name:'Steinvorkommen'},iron:{cap:5,rt:'iron',amt:4000,r:36,name:'Eisenvorkommen'},gold:{cap:4,rt:'gold',amt:2100,r:32,name:'Goldvorkommen'},oil:{cap:3,rt:'oil',amt:2600,r:26,name:'Ölfeld'},field:{cap:5,rt:'food',amt:700,r:25,name:'Feld',regen:3.2,hidden:true},
  // Wasser: nur Boote können hier sammeln (Delfine ab Stufe II, Wale ab Stufe III)
  fish:{cap:2,sea:true,rt:'food',amt:160,r:8,name:'Fischschwarm',gm:1,regen:.55},
  dolphin:{cap:3,sea:true,rt:'food',amt:420,r:11,name:'Delfine',gm:1.3,lvl:1,regen:.45},
  whale:{cap:4,sea:true,rt:'food',amt:1100,r:16,name:'Wal',gm:1.7,lvl:2,regen:.5}};
const EPOCHS=[{name:'Steinzeit',cost:{food:350,wood:200},time:30},{name:'Bronzezeit',cost:{food:500,wood:250,stone:200},time:40},{name:'Eisenzeit',cost:{food:700,wood:350,stone:300,iron:150},time:50},{name:'Mittelalter',cost:{food:900,wood:450,stone:450,iron:350,gold:200},time:60},{name:'Renaissance',cost:{food:1100,wood:600,stone:500,iron:450,gold:350},time:70},{name:'Industriezeit',cost:{food:1300,wood:700,stone:600,iron:550,gold:450,oil:150},time:80},{name:'Weltkriegszeit'}];
/* Wilde Tiere: agg = Aggro-Reichweite (greift an, wenn jemand näher kommt), leash = so weit folgt es seinem Revier-Mittelpunkt, roam = Streifgebiet,
   flee = friedliche Tiere fliehen ab dieser Nähe, food = Nahrung für den, der es erlegt, h = Höhe fürs Anzeigen */
const ANIMALS={
  deer:{name:'Reh',hp:45,spd:82,r:7,sight:170,flee:140,roam:120,food:120,h:24,info:'Friedlich und scheu – jagbar, gibt Nahrung'},
  wolf:{name:'Wolf',from:1,hp:75,spd:86,atk:9,rng:5,cd:1,r:7,sight:170,agg:140,leash:380,roam:90,food:70,h:20,pack:true,info:'Rudeltier – greift an, wenn man zu nah kommt'},
  bear:{name:'Bär',from:1,hp:280,spd:60,atk:24,rng:7,cd:1.3,r:11,sight:150,agg:120,leash:300,roam:80,food:220,h:34,info:'Sehr stark – verteidigt sein Revier'},
  mammoth:{name:'Mammut',hp:520,spd:46,atk:30,rng:10,cd:1.6,r:16,sight:150,agg:75,leash:260,roam:70,food:700,h:46,ext:1,info:'Riesig und friedlich, wehrt sich aber – viel Nahrung. Stirbt nach der Steinzeit aus'},
  sabertooth:{name:'Säbelzahntiger',hp:240,spd:100,atk:26,rng:7,cd:1,r:10,sight:200,agg:190,leash:450,roam:150,food:200,h:28,ext:1,info:'Schnell und tödlich. Stirbt nach der Steinzeit aus'},
  croc:{name:'Krokodil',from:1,hp:210,spd:75,atk:24,rng:9,cd:1.2,r:10,sight:170,agg:105,leash:210,roam:60,food:160,h:10,water:true,info:'Lauert im seichten Wasser – gefährlich für alles am Ufer'},
  /* Dinosaurier der Steinzeit (sterben beim ersten Aufstieg aus): Pflanzenfresser fliehen oder wehren sich, Fleischfresser jagen alles in ihrer Nähe */
  para:{name:'Parasaurolophus',hp:160,spd:80,r:11,sight:180,flee:150,roam:130,food:280,h:34,ext:1,info:'Pflanzenfresser – scheu, flieht im Rudel. Viel Nahrung'},
  trike:{name:'Triceratops',hp:620,spd:50,atk:34,rng:12,cd:1.5,r:17,sight:150,agg:65,leash:240,roam:70,food:700,h:36,ext:1,info:'Pflanzenfresser – friedlich, wehrt sich aber mit den Hörnern. Viel Nahrung'},
  stego:{name:'Stegosaurus',hp:520,spd:46,atk:28,rng:12,cd:1.6,r:16,sight:150,agg:55,leash:220,roam:70,food:600,h:36,ext:1,info:'Pflanzenfresser – friedlich, schlägt mit dem Stachelschwanz zurück'},
  bronto:{name:'Brontosaurus',hp:1300,spd:38,atk:45,rng:16,cd:2,r:24,sight:150,agg:45,leash:200,roam:60,food:1400,h:60,ext:1,info:'Riesiger Pflanzenfresser – nur gefährlich, wenn man ihn reizt. Enorm viel Nahrung'},
  raptor:{name:'Velociraptor',hp:85,spd:108,atk:11,rng:6,cd:.8,r:7,sight:200,agg:170,leash:460,roam:150,food:90,h:20,ext:1,pack:true,info:'Fleischfresser im Rudel – schnell und angriffslustig'},
  trex:{name:'Tyrannosaurus',hp:950,spd:72,atk:58,rng:14,cd:1.4,r:20,sight:220,agg:180,leash:520,roam:140,food:900,h:56,ext:1,info:'Der König der Fleischfresser – greift alles an. Sehr selten'},
  tiger:{name:'Tiger',from:2,hp:180,spd:98,atk:18,rng:6,cd:.9,r:9,sight:190,agg:170,leash:420,roam:140,food:160,h:26,info:'Schnell und gefährlich'}
};
/* Gegenstücke: Schadensfaktor Angreifer-Klasse -> Ziel-Klasse (Speer schlägt Reiter, Reiter jagen Fernkämpfer, Fernkämpfer schwächen Nahkämpfer, Nahkämpfer erreichen Fernkämpfer und Belagerung) */
const CTR={spear:{cav:1.8},cav:{rng:1.4,siege:1.4,med:1.4},rng:{inf:1.2,spear:1.15},inf:{rng:1.25,siege:1.3,med:1.3},spear_:{}};
const RAGE={dur:6,cd:35,dmg:1.35,spd:1.25}; /* Fähigkeit Kampfrausch (Taste F) */
/* Einheiten ändern ihren Namen mit dem Zeitalter (Sanitäter-Reihe) */
/* Truppenlinien: ab einem späteren Zeitalter ist eine Einheit veraltet und nicht mehr ausbildbar (upto = letztes Zeitalter); vorhandene bleiben. uOk prüft beides. */
/* Minen: bis MINE_CAP Arbeiter arbeiten drinnen, das Erz sammelt sich im Minenlager (MINE_STOCK) und eine Lore (Einheit cart) fährt es zum nächsten Lager */
const MINE_CAP=8,MINE_STOCK=300,CART_LOAD=60;
const UPTO={hbow:5,sling:0,club:1,archer:2,warship:2,crossbow:3,catapult:3,ram:3,spear:4,sword:4,musket:4,cannon:4,galleon:4,knight:5};for(const k in UPTO)UNITS[k].upto=UPTO[k];
const uOk=(k,ep)=>UNITS[k].ep<=ep&&!(UNITS[k].upto<ep);
const UNAMES={knight:['Ritter','Ritter','Ritter','Ritter','Kürassier','Dragoner'],hbow:['Berittener Schütze','Berittener Schütze','Berittener Schütze','Berittener Armbrustschütze','Berittener Musketier','Karabinerreiter'],healer:['Schamane','Heiler','Priester','Feldscher','Sanitäter','Medizintechniker']};
/* Nationen (ab der Industriezeit wählbar): Gruppe, Region, Farbe, Bonus (fx), Spezialeinheiten. fx: art = Artillerie-Schaden, gather = Sammeltempo, oilgold = Öl und Gold, tankCost = Panzerkosten, foodCost = Nahrungskosten der Truppen, prod = Ausbildungstempo, hp = Leben der Truppen, navhp = Leben der Schiffe, pop = Bevölkerung, air = Flugzeug-Leben */
const NATIONS={
  at:{name:'Österreich-Ungarn',short:'k.u.k.',grp:'Kaiserreiche',reg:'Europa',col:'#d8c24a',desc:'Donaumonarchie mit gewaltiger Festungsartillerie.',bonus:'Belagerungswaffen +15 % Schaden, Gebäude +10 % Leben',fx:{art:.15,bhp:.1},sp:['skoda','alpini']},
  de:{name:'Deutsches Kaiserreich',short:'Kaiserreich',grp:'Kaiserreiche',reg:'Europa',col:'#8a8e96',desc:'Starke Industrie, Artillerie und Sturmtruppen.',bonus:'Artillerie +25 % Schaden, Truppen +5 % Leben',fx:{art:.25,hp:.05},sp:['sturm','bertha']},
  ru:{name:'Russisches Zarenreich',short:'Zarenreich',grp:'Kaiserreiche',reg:'Europa / Asien',col:'#3f7a4a',desc:'Unerschöpfliche Menschenmassen, aber schlechter ausgerüstet.',bonus:'Truppen kosten 25 % weniger Nahrung, +30 Bevölkerung, Truppen −8 % Leben',fx:{foodCost:.25,pop:30,hp:-.08},sp:['rekrut','kosak']},
  ot:{name:'Osmanisches Reich',short:'Osmanen',grp:'Kaiserreiche',reg:'Asien',col:'#b8362e',desc:'Herr über Wüste und Ölvorkommen.',bonus:'Öl und Gold +40 % Ertrag, Reiter +10 % Tempo',fx:{oilgold:.4},sp:['kamel','janit']},
  uk:{name:'Britisches Empire',short:'Empire',grp:'Demokratien',reg:'Europa',col:'#2d4a8a',desc:'Seemacht mit Panzern der ersten Stunde und Bomberflotte.',bonus:'Schiffe +25 % Leben, Flugzeuge +15 % Leben',fx:{navhp:.25,air:.15},sp:['mark1','bomber']},
  it:{name:'Königreich Italien',short:'Faschisten',grp:'Diktaturen',reg:'Europa',col:'#4a8a4a',desc:'Schnelle Truppen und wendige Panzerchen unter einem starken Mann.',bonus:'Ausbildung 15 % schneller',fx:{prod:.15},sp:['bersag','carro']},
  jp:{name:'Kaiserreich Japan',short:'Japan',grp:'Kaiserreiche',reg:'Asien',col:'#c8d0e0',desc:'Fanatische Sturmtruppen und wendige Jäger aus dem Osten.',bonus:'Flugzeuge +15 % Leben',fx:{air:.15},sp:['banzai','zero']},
  fr:{name:'Frankreich',short:'Republik',grp:'Demokratien',reg:'Europa',col:'#3a64b0',desc:'Erbe Napoleons: Reiterei und leichte Panzer in Massen.',bonus:'Panzer kosten 25 % weniger, Reiter +15 % Leben',fx:{tankCost:.25,cavhp:.15},sp:['renault','kurass']},
  us:{name:'Vereinigte Staaten',short:'USA',grp:'Demokratien',reg:'Amerika',col:'#4a6ca8',desc:'Frische Truppen, starke Wirtschaft, überlegene Jäger.',bonus:'Sammeln +20 %, Ausbildung +20 % schneller',fx:{gather:.2,prod:.2},sp:['doughboy','fighter']}
};
const NFX0={art:0,gather:0,oilgold:0,tankCost:0,foodCost:0,prod:0,hp:0,navhp:0,pop:0,air:0,bhp:0,cavhp:0};
const nationFx=k=>Object.assign({},NFX0,k&&NATIONS[k]?NATIONS[k].fx:{});
const TANKS=new Set(['tank','mark1','renault']);
const POPMAX=100;
const RES=['food','wood','stone','iron','gold','oil'],RN={food:'Nahrung',wood:'Holz',stone:'Stein',iron:'Eisen',gold:'Gold',oil:'Öl'};
const RES_EP={stone:1,iron:2,gold:3,oil:5},MINE_RT={stone:'mine',iron:'mine',gold:'mine',oil:'derrick'}; /* ab welcher Epoche eine Ressource erscheint; Erz und Gold brauchen eine Mine in der Nähe */
const MINE_RNG=150,TRADE={sell:.5,buy:1,lot:100}; /* Markt: 100 Rohstoff -> 50 Gold, 100 Gold -> 100 Rohstoff */
/* army = Faktor für die Heeresgrösse der KI; pace = Tempo-Faktor für die frühesten Aufstiegszeiten der KI (kleiner = schneller) */
const DIFF={leicht:{gather:.7,first:460,wave:4,pace:1.35,army:.55},normal:{gather:.85,first:480,wave:7,pace:1.3,army:.55},schwer:{gather:1.35,first:240,wave:6,pace:.8,army:1.1}};
/* Gegner-Typen (unabhängig von der Schwierigkeit): wk = Arbeiter-Faktor, pace = Aufstiegstempo (kleiner = früher), army = Heeresgrösse, first = Zeit bis zum ersten Angriff, wave = Truppen für den Angriff,
   tow = Zusatz-Türme, bar = Zusatz-Kasernen, def = Verteidigungsradius */
const AI_STYLES={
  balanced:{name:'Ausgewogen',desc:'Von allem etwas',wk:1,pace:1,army:1,first:1,wave:1,tow:0,bar:0,def:260},
  turtle:{name:'Turtle',desc:'Baut viele Türme, verteidigt, greift spät an',wk:1,pace:1.05,army:.9,first:2,wave:1.7,tow:2,bar:0,def:380},
  rush:{name:'Rush',desc:'Früh viele Truppen und frühe Angriffe, kaum Wirtschaft',wk:.65,pace:1.5,army:1.5,first:.55,wave:.65,tow:-1,bar:1,def:240},
  eco:{name:'Wirtschaft',desc:'Viele Arbeiter, große Vorräte, späte Armee',wk:1.3,pace:.95,army:.7,first:1.5,wave:1.3,tow:0,bar:0,def:260},
  boom:{name:'Aufstieg',desc:'Steigt so schnell wie möglich auf',wk:1.1,pace:.7,army:.6,first:1.4,wave:1.2,tow:0,bar:0,def:260}
};
const AI_MINT=[230,520,900,1320,1800,2300]; /* früheste Zeit (s), zu der die KI in die nächste Epoche steigen darf (normal) */
const TC=['#3d72b8','#b9442f'],TCD=['#1f3f6b','#6e2215'],TCL=['#8fb4e6','#ef9b86'];
/* Teamfarben zur Auswahl (Mehrspieler) */
const PALETTE=[['Blau','#3d72b8'],['Rot','#b9442f'],['Grün','#4a8a3a'],['Gelb','#d1a82c'],['Violett','#7a4aa8'],['Orange','#d27a2a'],['Türkis','#2a9a9a'],['Weiss','#d8d8d0']];
function shadeHex(h,k){const n=parseInt(h.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(k>=0?c+(255-c)*k:c*(1+k))));return'#'+[(n>>16)&255,(n>>8)&255,n&255].map(f).map(v=>v.toString(16).padStart(2,'0')).join('')}
function setTeamColors(a,b){[a,b].forEach((c,i)=>{TC[i]=c;TCD[i]=shadeHex(c,-.45);TCL[i]=shadeHex(c,.5)})}
const MAT=[{wall:'#7d5f3b',roof:'#a8834f',line:'#4f3a22'},{wall:'#b48a5a',roof:'#cfa66e',line:'#6f5131'},{wall:'#86837c',roof:'#aaa69d',line:'#55524c'},{wall:'#a29d94',roof:'#9a4a38',line:'#4a443d'},{wall:'#c0b4a0',roof:'#58708a',line:'#3a3d46'},{wall:'#a8503f',roof:'#3e444d',line:'#2d2926'},{wall:'#8a8f86',roof:'#4a4f4a',line:'#2a2d2a'}];
const STATE={idle:'Wartet',move:'Unterwegs',amove:'Angriffsmarsch',attack:'Kämpft',build:'Baut',explore:'Erkundet'};

// Stufen (Level) von Einheiten und Gebäuden: Stufe 0 = Steinzeit, 1 = Bronzezeit, 2 = Eisenzeit.
// Neue Einheiten/Gebäude starten auf der Stufe der aktuellen Epoche; ältere müssen per Upgrade nachgezogen werden.
const LVL={hp:[1,1.25,1.55,1.9,2.3,2.7,3.1],atk:[1,1.2,1.45,1.75,2.1,2.45,2.8],gather:[1,1.25,1.5,1.75,2,2.25,2.5],bhp:[1,1.3,1.7,2.2,2.8,3.4,4]};
const LVLN=['I','II','III','IV','V','VI','VII'],LVLC=['#a39a88','#6fc46a','#eab94b','#ec8a5c','#8fd3f2','#d6a6f0','#f2e07a'];
const NEED_LVL={stone:1,iron:2,gold:3,oil:5}; // ab welcher Stufe ein Arbeiter diese Ressource abbauen kann
const UPG={unit:[null,{food:20},{food:30,stone:15},{food:45,iron:20},{food:60,iron:35},{food:75,iron:50},{food:90,iron:60,oil:10}],bld:[null,{wood:25},{wood:40,stone:25},{wood:60,stone:40},{wood:80,iron:40},{wood:100,iron:55},{wood:120,iron:70,stone:40}]}; // Kosten pro Stück für die Zielstufe
const UPG_TIME={base:5,each:.7,max:40}; // Dauer in Sekunden

/* Technologien: gehören zu einem Gebäudetyp, werden mit Ressourcen und Zeit erforscht und gelten für das ganze Team.
   Man sieht nur Technologien der aktuellen und früherer Epochen.
   fx: carry/gather/wspeed (Arbeiter), pop (Bevölkerungslimit), bcarry/bgather/bspeed/statfish/shiphp (Wasser), hp/matk/ratk (Truppen), tower (Türme) */
const TECHS=[
  {id:'baskets',bld:'hq',ep:0,name:'Tragekörbe',desc:'Arbeiter tragen 50 % mehr pro Fuhre',cost:{food:90,wood:70},time:18,fx:{carry:.5}},
  {id:'commune',bld:'hq',ep:0,name:'Dorfgemeinschaft',desc:'+10 Bevölkerungslimit',cost:{food:120,wood:100},time:22,fx:{pop:10}},
  {id:'shoes',bld:'hq',ep:1,name:'Lederschuhe',desc:'Arbeiter laufen 20 % schneller',cost:{food:150,wood:120},time:24,fx:{wspeed:.2}},
  {id:'bronzetools',bld:'hq',ep:1,name:'Bronzewerkzeuge',desc:'Arbeiter sammeln 20 % schneller',cost:{food:200,wood:150,stone:60},time:30,fx:{gather:.2}},
  {id:'townlaw',bld:'hq',ep:2,name:'Stadtrecht',desc:'+15 Bevölkerungslimit',cost:{food:300,wood:250,stone:150},time:34,fx:{pop:15}},
  {id:'irontools',bld:'hq',ep:2,name:'Eisenwerkzeuge',desc:'Arbeiter sammeln 25 % schneller',cost:{food:300,wood:200,iron:100},time:36,fx:{gather:.25}},
  {id:'carts',bld:'hq',ep:3,name:'Handkarren',desc:'Arbeiter tragen nochmal 40 % mehr',cost:{food:400,wood:300,iron:120},time:40,fx:{carry:.4}},
  {id:'guilds',bld:'hq',ep:3,name:'Zünfte',desc:'+20 Bevölkerungslimit',cost:{food:450,wood:350,stone:200},time:42,fx:{pop:20}},
  {id:'industry',bld:'hq',ep:4,name:'Manufaktur',desc:'Arbeiter sammeln 30 % schneller',cost:{food:600,wood:400,iron:250},time:46,fx:{gather:.3}},
  {id:'metropolis',bld:'hq',ep:4,name:'Metropole',desc:'+25 Bevölkerungslimit',cost:{food:700,wood:500,stone:300},time:48,fx:{pop:25}},
  {id:'influence1',bld:'hq',ep:1,name:'Einfluss',desc:'Dein Gebiet wächst: alle Gebäude beanspruchen 25 % mehr Land',cost:{food:200,wood:150,stone:100},time:30,fx:{claim:.25}},
  {id:'influence2',bld:'hq',ep:3,name:'Herrschaft',desc:'Dein Gebiet wächst nochmal um 25 %',cost:{food:450,wood:300,iron:150},time:40,fx:{claim:.25}},
  {id:'nets',bld:'harbor',ep:0,name:'Größere Fangnetze',desc:'Boote tragen 50 % mehr und fangen 25 % schneller',cost:{wood:90,food:60},time:20,fx:{bcarry:.5,bgather:.25}},
  {id:'statfish',bld:'harbor',ep:1,name:'Stationäre Fischer',desc:'Jeder Hafen fängt selbst Nahrung (1,5 pro Sekunde), ganz ohne Fischquelle',cost:{wood:160,food:120},time:30,fx:{statfish:1.5}},
  {id:'shipbuild',bld:'harbor',ep:1,name:'Schiffsbau',desc:'Erlaubt Kriegsschiffe',cost:{wood:150,stone:60},time:26,fx:{}},
  {id:'keels',bld:'harbor',ep:2,name:'Schnelle Kiele',desc:'Boote und Schiffe sind 20 % schneller',cost:{wood:200,iron:60},time:30,fx:{bspeed:.2}},
  {id:'harpoons',bld:'harbor',ep:2,name:'Harpunen',desc:'Boote fangen 40 % schneller',cost:{wood:220,iron:90},time:34,fx:{bgather:.4}},
  {id:'galleonbuild',bld:'harbor',ep:3,name:'Galeonenbau',desc:'Erlaubt Galeonen',cost:{wood:300,iron:150},time:38,fx:{}},
  {id:'plating',bld:'harbor',ep:4,name:'Panzerrümpfe',desc:'Schiffe haben 25 % mehr Leben',cost:{wood:350,iron:250},time:44,fx:{shiphp:.25}},
  {id:'spearbuild',bld:'barracks',ep:1,name:'Speerbau',desc:'Erlaubt Speerträger',cost:{food:100,wood:100},time:20,fx:{}},
  {id:'bowbuild',bld:'barracks',ep:1,name:'Bogenbau',desc:'Erlaubt Bogenschützen',cost:{food:100,wood:120},time:22,fx:{}},
  {id:'leather',bld:'barracks',ep:1,name:'Lederrüstung',desc:'Alle Truppen haben 15 % mehr Leben',cost:{food:160,wood:140},time:28,fx:{hp:.15}},
  {id:'whet',bld:'barracks',ep:1,name:'Schleifstein',desc:'Nahkämpfer machen 15 % mehr Schaden',cost:{food:150,stone:80},time:26,fx:{matk:.15}},
  {id:'smithy',bld:'barracks',ep:2,name:'Eisenschmiede',desc:'Erlaubt Schwertkämpfer',cost:{food:250,wood:150,iron:80},time:32,fx:{}},
  {id:'marksman',bld:'barracks',ep:2,name:'Treffsicherheit',desc:'Fernkämpfer machen 20 % mehr Schaden (bessere Genauigkeit)',cost:{food:240,wood:200},time:32,fx:{ratk:.2}},
  {id:'siegeworks',bld:'barracks',ep:3,name:'Belagerungswerkstatt',desc:'Erlaubt Rammbock und Katapult',cost:{wood:350,iron:180},time:40,fx:{}},
  {id:'stables',bld:'barracks',ep:3,name:'Reiterei',desc:'Erlaubt Ritter und berittene Schützen',cost:{food:400,wood:250,iron:150},time:38,fx:{}},
  {id:'crossbowbuild',bld:'barracks',ep:3,name:'Armbrustbau',desc:'Erlaubt Armbrustschützen',cost:{food:300,wood:250,iron:100},time:36,fx:{}},
  {id:'plate',bld:'barracks',ep:3,name:'Plattenpanzer',desc:'Alle Truppen haben 20 % mehr Leben',cost:{food:420,iron:200},time:40,fx:{hp:.2}},
  {id:'powder',bld:'barracks',ep:4,name:'Schießpulver',desc:'Erlaubt Musketiere',cost:{food:500,wood:300,iron:250},time:42,fx:{}},
  {id:'foundry',bld:'barracks',ep:4,name:'Gießerei',desc:'Erlaubt Kanonen',cost:{wood:500,iron:350},time:46,fx:{}},
  {id:'rifling',bld:'barracks',ep:4,name:'Gezogene Läufe',desc:'Fernkämpfer machen 25 % mehr Schaden',cost:{food:500,iron:300},time:44,fx:{ratk:.25}},
  {id:'electric',bld:'hq',ep:5,name:'Elektrizität',desc:'Arbeiter sammeln 35 % schneller',cost:{food:800,wood:500,iron:350},time:50,fx:{gather:.35}},
  {id:'railway',bld:'hq',ep:5,name:'Eisenbahn',desc:'+30 Bevölkerungslimit',cost:{food:900,wood:600,stone:400},time:52,fx:{pop:30}},
  {id:'rifles',bld:'barracks',ep:5,name:'Gezogene Gewehre',desc:'Erlaubt Gewehrschützen',cost:{food:600,wood:350,iron:300},time:44,fx:{}},
  {id:'artillery',bld:'barracks',ep:5,name:'Schwere Artillerie',desc:'Erlaubt Haubitzen',cost:{wood:600,iron:450},time:48,fx:{}},
  {id:'armor',bld:'barracks',ep:5,name:'Panzerbau',desc:'Erlaubt Panzer',cost:{wood:600,iron:500,gold:150},time:50,fx:{}},
  {id:'ironclads',bld:'harbor',ep:5,name:'Panzerschiffbau',desc:'Erlaubt Panzerschiffe',cost:{wood:500,iron:400},time:48,fx:{}},
  {id:'concrete',bld:'tower',blds:['tower','castle'],ep:5,name:'Beton',desc:'Türme und Burgen machen 40 % mehr Schaden',cost:{stone:500,iron:300},time:44,fx:{tower:.4}},
  {id:'slits',bld:'tower',blds:['tower','castle'],ep:1,name:'Schießscharten',desc:'Türme und Burgen machen 25 % mehr Schaden',cost:{wood:150,stone:120},time:28,fx:{tower:.25}},
  {id:'castiron',bld:'tower',blds:['tower','castle'],ep:4,name:'Gusseisen',desc:'Türme und Burgen machen 35 % mehr Schaden',cost:{stone:300,iron:250},time:40,fx:{tower:.35}}
];
const TECH=Object.fromEntries(TECHS.map(t=>[t.id,t]));
