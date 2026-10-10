// Spieldaten: Einheiten, Gebäude, Ressourcen, Epochen, Schwierigkeit, Farben.
// Hier lässt sich das Balancing ändern, ohne die Spiellogik anzufassen.
const W=4800,H=3200,CARRY=15;
const AREA=W*H/(3600*2400); /* Kartengrösse im Vergleich zur ersten Version (für Anzahlen von Vorkommen, Gras usw.) */
// Sammeln je Ressource: Tempo-Faktor und Tragekapazität (Beeren bringen mehr, weil Nahrung sonst knapp ist)
const GATHER={food:{rate:1.5,carry:15},wood:{rate:1.2,carry:12},stone:{rate:.9,carry:10},iron:{rate:.8,carry:8}};
const UNITS={
  worker:{gather:true,passive:true,name:'Arbeiter',sight:130,hp:40,spd:58,atk:3,rng:4,cd:1.2,r:7,cost:{food:50},time:9,ep:0,from:'hq'},
  scout:{name:'Späher',passive:true,sight:300,hp:40,spd:105,atk:0,rng:4,cd:1.2,r:6,cost:{food:60,wood:20},time:10,ep:0,from:'hq'},
  boat:{name:'Fischerboot',naval:true,gather:true,passive:true,sight:200,hp:90,spd:72,atk:0,rng:4,cd:1.2,r:11,cost:{wood:80},time:14,ep:0,from:'harbor'},
  warship:{tech:'shipbuild',name:'Kriegsschiff',naval:true,ranged:true,sight:240,hp:230,spd:62,atk:15,rng:175,cd:1.8,r:13,cost:{wood:140,stone:60},time:24,ep:1,from:'harbor'},
  sling:{name:'Steinschleuderer',sight:150,hp:50,spd:58,atk:6,rng:105,cd:1.7,r:7,cost:{food:40,wood:25},time:12,ep:0,from:'barracks',ranged:true},
  club:{name:'Keulenkrieger',sight:140,hp:75,spd:52,atk:7,rng:4,cd:1.1,r:8,cost:{food:60,wood:20},time:12,ep:0,from:'barracks'},
  spear:{tech:'spearbuild',name:'Speerträger',sight:140,hp:115,spd:54,atk:11,rng:8,cd:1.1,r:8,cost:{food:70,wood:40},time:14,ep:1,from:'barracks'},
  archer:{tech:'bowbuild',name:'Bogenschütze',sight:170,hp:55,spd:55,atk:8,rng:130,cd:1.6,r:7,cost:{food:40,wood:60},time:14,ep:1,from:'barracks',ranged:true},
  knight:{tech:'stables',name:'Ritter',sight:170,hp:260,spd:70,atk:24,rng:6,cd:1.2,r:10,cost:{food:110,iron:60},time:22,ep:3,from:'barracks'},
  crossbow:{tech:'crossbowbuild',name:'Armbrustschütze',sight:180,hp:95,spd:52,atk:21,rng:150,cd:2,r:7,cost:{food:70,wood:60,iron:30},time:18,ep:3,from:'barracks',ranged:true},
  musket:{tech:'powder',name:'Musketier',sight:190,hp:115,spd:52,atk:34,rng:175,cd:2.6,r:7,cost:{food:80,wood:40,iron:60},time:20,ep:4,from:'barracks',ranged:true,gun:true},
  cannon:{tech:'foundry',name:'Kanone',sight:200,hp:170,spd:34,atk:60,rng:240,cd:4.2,r:11,cost:{wood:160,iron:140},time:30,ep:4,from:'barracks',ranged:true,siege:true},
  ram:{tech:'siegeworks',name:'Rammbock',sight:150,hp:330,spd:42,atk:42,rng:6,cd:2.2,r:11,cost:{wood:200,iron:60},time:26,ep:3,from:'barracks',siege:true},
  catapult:{tech:'siegeworks',name:'Katapult',sight:190,hp:140,spd:36,atk:48,rng:250,cd:4.8,r:10,cost:{wood:220,stone:120},time:30,ep:3,from:'barracks',ranged:true,siege:true},
  galleon:{tech:'galleonbuild',name:'Galeone',naval:true,ranged:true,sight:260,hp:380,spd:58,atk:28,rng:210,cd:2.2,r:15,cost:{wood:200,iron:80},time:32,ep:3,from:'harbor'},
  rifle:{tech:'rifles',name:'Gewehrschütze',sight:210,hp:150,spd:54,atk:46,rng:195,cd:2.3,r:7,cost:{food:100,wood:40,iron:90},time:22,ep:5,from:'barracks',ranged:true,gun:true},
  howitzer:{tech:'artillery',name:'Haubitze',sight:230,hp:200,spd:34,atk:90,rng:300,cd:4.8,r:12,cost:{wood:260,iron:260},time:34,ep:5,from:'barracks',ranged:true,siege:true},
  ironclad:{tech:'ironclads',name:'Panzerschiff',naval:true,ranged:true,sight:280,hp:620,spd:58,atk:44,rng:240,cd:2.4,r:17,cost:{wood:260,iron:240},time:40,ep:5,from:'harbor'},
  sword:{tech:'smithy',name:'Schwertkämpfer',sight:150,hp:170,spd:52,atk:17,rng:5,cd:1.1,r:9,cost:{food:80,iron:40},time:18,ep:2,from:'barracks'}
};
const BLDS={
  hq:{name:'Hauptlager',sight:280,claim:260,hp:1400,r:36,pop:10,drop:true,shoot:{rng:150,atk:6,cd:1.8}},
  house:{name:'Hütte',sight:150,claim:100,hp:250,r:16,pop:5,cost:{wood:50},time:14,ep:0,sub:'+5 Bevölkerung'},
  store:{name:'Lager',sight:170,claim:120,hp:350,r:18,drop:true,cost:{wood:80},time:16,ep:0,sub:'Abgabestelle'},
  barracks:{name:'Kaserne',sight:190,claim:130,hp:700,r:27,cost:{wood:150},time:24,ep:0,sub:'Bildet Krieger aus'},
  harbor:{name:'Hafen',sight:190,claim:140,hp:600,r:24,drop:true,cost:{wood:120},time:20,ep:0,sub:'Boote und Fischfang'},
  castle:{name:'Burg',sight:330,claim:240,hp:1500,r:30,cost:{wood:200,stone:260,iron:80},time:45,ep:3,shoot:{rng:205,atk:15,cd:1.3},sub:'Starke Festung, erobert Land'},
  wall:{name:'Mauer',sight:60,hp:520,r:9,cost:{stone:12},time:5,ep:3,sub:'Hält Feinde auf'},
  tower:{name:'Wachturm',sight:300,claim:320,hp:550,r:14,cost:{wood:70,stone:60},time:26,ep:0,shoot:{rng:170,atk:9,cd:1.5},sub:'Schiesst auf Gegner'}
};
const NODES={tree:{cap:3,rt:'wood',amt:260,r:11,name:'Baum'},bush:{cap:3,rt:'food',amt:340,r:8,name:'Beerenstrauch',regen:1.4},stone:{cap:6,rt:'stone',amt:1600,r:22,name:'Steinvorkommen'},iron:{cap:5,rt:'iron',amt:1200,r:20,name:'Eisenvorkommen'},
  // Wasser: nur Boote können hier sammeln (Delfine ab Stufe II, Wale ab Stufe III)
  fish:{cap:2,sea:true,rt:'food',amt:160,r:8,name:'Fischschwarm',gm:1,regen:.55},
  dolphin:{cap:3,sea:true,rt:'food',amt:420,r:11,name:'Delfine',gm:1.3,lvl:1,regen:.45},
  whale:{cap:4,sea:true,rt:'food',amt:1100,r:16,name:'Wal',gm:1.7,lvl:2,regen:.5}};
const EPOCHS=[{name:'Steinzeit',cost:{food:350,wood:200},time:30},{name:'Bronzezeit',cost:{food:500,wood:250,stone:200},time:40},{name:'Eisenzeit',cost:{food:700,wood:350,stone:300,iron:150},time:50},{name:'Mittelalter',cost:{food:900,wood:450,stone:450,iron:350},time:60},{name:'Renaissance',cost:{food:1100,wood:600,stone:500,iron:450},time:70},{name:'Industriezeit'}];
/* Wilde Tiere: agg = Aggro-Reichweite (greift an, wenn jemand näher kommt), leash = so weit folgt es seinem Revier-Mittelpunkt, roam = Streifgebiet,
   flee = friedliche Tiere fliehen ab dieser Nähe, food = Nahrung für den, der es erlegt, h = Höhe fürs Anzeigen */
const ANIMALS={
  deer:{name:'Reh',hp:45,spd:82,r:7,sight:170,flee:140,roam:120,food:120,h:24,info:'Friedlich und scheu – jagbar, gibt Nahrung'},
  wolf:{name:'Wolf',hp:75,spd:86,atk:9,rng:5,cd:1,r:7,sight:170,agg:140,leash:380,roam:90,food:70,h:20,pack:true,info:'Rudeltier – greift an, wenn man zu nah kommt'},
  bear:{name:'Bär',hp:280,spd:60,atk:24,rng:7,cd:1.3,r:11,sight:150,agg:120,leash:300,roam:80,food:220,h:34,info:'Sehr stark – verteidigt sein Revier'},
  tiger:{name:'Tiger',hp:180,spd:98,atk:18,rng:6,cd:.9,r:9,sight:190,agg:170,leash:420,roam:140,food:160,h:26,info:'Schnell und gefährlich'}
};
const POPMAX=100;
const RES=['food','wood','stone','iron'],RN={food:'Nahrung',wood:'Holz',stone:'Stein',iron:'Eisen'};
/* army = Faktor für die Heeresgrösse der KI; pace = Tempo-Faktor für die frühesten Aufstiegszeiten der KI (kleiner = schneller) */
const DIFF={leicht:{gather:.7,first:460,wave:4,pace:1.35,army:.55},normal:{gather:1,first:330,wave:5,pace:1,army:.8},schwer:{gather:1.35,first:240,wave:6,pace:.8,army:1.1}};
const AI_MINT=[230,520,900,1320,1800]; /* früheste Zeit (s), zu der die KI in die nächste Epoche steigen darf (normal) */
const TC=['#3d72b8','#b9442f'],TCD=['#1f3f6b','#6e2215'],TCL=['#8fb4e6','#ef9b86'];
const MAT=[{wall:'#7d5f3b',roof:'#a8834f',line:'#4f3a22'},{wall:'#b48a5a',roof:'#cfa66e',line:'#6f5131'},{wall:'#86837c',roof:'#aaa69d',line:'#55524c'},{wall:'#a29d94',roof:'#9a4a38',line:'#4a443d'},{wall:'#c0b4a0',roof:'#58708a',line:'#3a3d46'},{wall:'#a8503f',roof:'#3e444d',line:'#2d2926'}];
const STATE={idle:'Wartet',move:'Unterwegs',amove:'Angriffsmarsch',attack:'Kämpft',build:'Baut',explore:'Erkundet'};

// Stufen (Level) von Einheiten und Gebäuden: Stufe 0 = Steinzeit, 1 = Bronzezeit, 2 = Eisenzeit.
// Neue Einheiten/Gebäude starten auf der Stufe der aktuellen Epoche; ältere müssen per Upgrade nachgezogen werden.
const LVL={hp:[1,1.25,1.55,1.9,2.3,2.7],atk:[1,1.2,1.45,1.75,2.1,2.45],gather:[1,1.25,1.5,1.75,2,2.25],bhp:[1,1.3,1.7,2.2,2.8,3.4]};
const LVLN=['I','II','III','IV','V','VI'],LVLC=['#a39a88','#6fc46a','#eab94b','#ec8a5c','#8fd3f2','#d6a6f0'];
const NEED_LVL={stone:1,iron:2}; // ab welcher Stufe ein Arbeiter diese Ressource abbauen kann
const UPG={unit:[null,{food:20},{food:30,stone:15},{food:45,iron:20},{food:60,iron:35},{food:75,iron:50}],bld:[null,{wood:25},{wood:40,stone:25},{wood:60,stone:40},{wood:80,iron:40},{wood:100,iron:55}]}; // Kosten pro Stück für die Zielstufe
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
  {id:'stables',bld:'barracks',ep:3,name:'Reiterei',desc:'Erlaubt Ritter',cost:{food:400,wood:250,iron:150},time:38,fx:{}},
  {id:'crossbowbuild',bld:'barracks',ep:3,name:'Armbrustbau',desc:'Erlaubt Armbrustschützen',cost:{food:300,wood:250,iron:100},time:36,fx:{}},
  {id:'plate',bld:'barracks',ep:3,name:'Plattenpanzer',desc:'Alle Truppen haben 20 % mehr Leben',cost:{food:420,iron:200},time:40,fx:{hp:.2}},
  {id:'powder',bld:'barracks',ep:4,name:'Schießpulver',desc:'Erlaubt Musketiere',cost:{food:500,wood:300,iron:250},time:42,fx:{}},
  {id:'foundry',bld:'barracks',ep:4,name:'Gießerei',desc:'Erlaubt Kanonen',cost:{wood:500,iron:350},time:46,fx:{}},
  {id:'rifling',bld:'barracks',ep:4,name:'Gezogene Läufe',desc:'Fernkämpfer machen 25 % mehr Schaden',cost:{food:500,iron:300},time:44,fx:{ratk:.25}},
  {id:'electric',bld:'hq',ep:5,name:'Elektrizität',desc:'Arbeiter sammeln 35 % schneller',cost:{food:800,wood:500,iron:350},time:50,fx:{gather:.35}},
  {id:'railway',bld:'hq',ep:5,name:'Eisenbahn',desc:'+30 Bevölkerungslimit',cost:{food:900,wood:600,stone:400},time:52,fx:{pop:30}},
  {id:'rifles',bld:'barracks',ep:5,name:'Gezogene Gewehre',desc:'Erlaubt Gewehrschützen',cost:{food:600,wood:350,iron:300},time:44,fx:{}},
  {id:'artillery',bld:'barracks',ep:5,name:'Schwere Artillerie',desc:'Erlaubt Haubitzen',cost:{wood:600,iron:450},time:48,fx:{}},
  {id:'ironclads',bld:'harbor',ep:5,name:'Panzerschiffbau',desc:'Erlaubt Panzerschiffe',cost:{wood:500,iron:400},time:48,fx:{}},
  {id:'concrete',bld:'tower',blds:['tower','castle'],ep:5,name:'Beton',desc:'Türme und Burgen machen 40 % mehr Schaden',cost:{stone:500,iron:300},time:44,fx:{tower:.4}},
  {id:'slits',bld:'tower',blds:['tower','castle'],ep:1,name:'Schießscharten',desc:'Türme und Burgen machen 25 % mehr Schaden',cost:{wood:150,stone:120},time:28,fx:{tower:.25}},
  {id:'castiron',bld:'tower',blds:['tower','castle'],ep:4,name:'Gusseisen',desc:'Türme und Burgen machen 35 % mehr Schaden',cost:{stone:300,iron:250},time:40,fx:{tower:.35}}
];
const TECH=Object.fromEntries(TECHS.map(t=>[t.id,t]));
