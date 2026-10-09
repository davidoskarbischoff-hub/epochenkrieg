// Spieldaten: Einheiten, Gebäude, Ressourcen, Epochen, Schwierigkeit, Farben.
// Hier lässt sich das Balancing ändern, ohne die Spiellogik anzufassen.
const W=3600,H=2400,CARRY=15;
// Sammeln je Ressource: Tempo-Faktor und Tragekapazität (Beeren bringen mehr, weil Nahrung sonst knapp ist)
const GATHER={food:{rate:1.5,carry:15},wood:{rate:1,carry:10},stone:{rate:.9,carry:10},iron:{rate:.8,carry:8}};
const UNITS={
  worker:{gather:true,passive:true,name:'Arbeiter',sight:130,hp:40,spd:58,atk:3,rng:4,cd:1.2,r:7,cost:{food:50},time:9,ep:0,from:'hq'},
  scout:{name:'Späher',passive:true,sight:300,hp:40,spd:105,atk:2,rng:4,cd:1.2,r:6,cost:{food:60,wood:20},time:10,ep:0,from:'hq'},
  boat:{name:'Fischerboot',naval:true,gather:true,passive:true,sight:200,hp:90,spd:72,atk:0,rng:4,cd:1.2,r:11,cost:{wood:80},time:14,ep:0,from:'harbor'},
  warship:{name:'Kriegsschiff',naval:true,ranged:true,sight:240,hp:230,spd:62,atk:15,rng:175,cd:1.8,r:13,cost:{wood:140,stone:60},time:24,ep:1,from:'harbor'},
  club:{name:'Keulenkrieger',sight:140,hp:75,spd:52,atk:7,rng:4,cd:1.1,r:8,cost:{food:60,wood:20},time:12,ep:0,from:'barracks'},
  spear:{name:'Speerträger',sight:140,hp:115,spd:54,atk:11,rng:8,cd:1.1,r:8,cost:{food:70,wood:40},time:14,ep:1,from:'barracks'},
  archer:{name:'Bogenschütze',sight:170,hp:55,spd:55,atk:8,rng:130,cd:1.6,r:7,cost:{food:40,wood:60},time:14,ep:1,from:'barracks',ranged:true},
  knight:{name:'Ritter',sight:170,hp:260,spd:70,atk:24,rng:6,cd:1.2,r:10,cost:{food:110,iron:60},time:22,ep:3,from:'barracks'},
  crossbow:{name:'Armbrustschütze',sight:180,hp:95,spd:52,atk:21,rng:150,cd:2,r:7,cost:{food:70,wood:60,iron:30},time:18,ep:3,from:'barracks',ranged:true},
  musket:{name:'Musketier',sight:190,hp:115,spd:52,atk:34,rng:175,cd:2.6,r:7,cost:{food:80,wood:40,iron:60},time:20,ep:4,from:'barracks',ranged:true,gun:true},
  cannon:{name:'Kanone',sight:200,hp:170,spd:34,atk:60,rng:240,cd:4.2,r:11,cost:{wood:160,iron:140},time:30,ep:4,from:'barracks',ranged:true,siege:true},
  galleon:{name:'Galeone',naval:true,ranged:true,sight:260,hp:380,spd:58,atk:28,rng:210,cd:2.2,r:15,cost:{wood:200,iron:80},time:32,ep:3,from:'harbor'},
  sword:{name:'Schwertkämpfer',sight:150,hp:170,spd:52,atk:17,rng:5,cd:1.1,r:9,cost:{food:80,iron:40},time:18,ep:2,from:'barracks'}
};
const BLDS={
  hq:{name:'Hauptlager',sight:280,claim:260,hp:1400,r:36,pop:10,drop:true,shoot:{rng:150,atk:6,cd:1.8}},
  house:{name:'Hütte',sight:150,claim:100,hp:250,r:16,pop:5,cost:{wood:50},time:14,ep:0,sub:'+5 Bevölkerung'},
  store:{name:'Lager',sight:170,claim:120,hp:350,r:18,drop:true,cost:{wood:80},time:16,ep:0,sub:'Abgabestelle'},
  barracks:{name:'Kaserne',sight:190,claim:130,hp:700,r:27,cost:{wood:150},time:24,ep:0,sub:'Bildet Krieger aus'},
  harbor:{name:'Hafen',sight:190,claim:140,hp:600,r:24,drop:true,cost:{wood:120},time:20,ep:0,sub:'Boote und Fischfang'},
  castle:{name:'Burg',sight:330,claim:240,hp:1500,r:30,cost:{wood:200,stone:260,iron:80},time:45,ep:3,shoot:{rng:205,atk:15,cd:1.3},sub:'Starke Festung, erobert Land'},
  tower:{name:'Wachturm',sight:300,claim:320,hp:550,r:14,cost:{wood:60,stone:100},time:28,ep:1,shoot:{rng:170,atk:9,cd:1.5},sub:'Schiesst auf Gegner'}
};
const NODES={tree:{cap:3,rt:'wood',amt:120,r:11,name:'Baum'},bush:{cap:4,rt:'food',amt:220,r:10,name:'Beerenstrauch'},stone:{cap:3,rt:'stone',amt:300,r:13,name:'Steinvorkommen'},iron:{cap:3,rt:'iron',amt:260,r:12,name:'Eisenvorkommen'},
  // Wasser: nur Boote können hier sammeln (Delfine ab Stufe II, Wale ab Stufe III)
  fish:{cap:2,sea:true,rt:'food',amt:160,r:8,name:'Fischschwarm',gm:1},
  dolphin:{cap:3,sea:true,rt:'food',amt:420,r:11,name:'Delfine',gm:1.3,lvl:1},
  whale:{cap:4,sea:true,rt:'food',amt:1100,r:16,name:'Wal',gm:1.7,lvl:2}};
const EPOCHS=[{name:'Steinzeit',cost:{food:350,wood:200},time:30},{name:'Bronzezeit',cost:{food:500,wood:250,stone:200},time:40},{name:'Eisenzeit',cost:{food:700,wood:350,stone:300,iron:150},time:50},{name:'Mittelalter',cost:{food:900,wood:450,stone:450,iron:350},time:60},{name:'Neuzeit'}];
const POPMAX=100;
const RES=['food','wood','stone','iron'],RN={food:'Nahrung',wood:'Holz',stone:'Stein',iron:'Eisen'};
const DIFF={leicht:{gather:.7,first:420,wave:5},normal:{gather:1,first:300,wave:6},schwer:{gather:1.35,first:220,wave:7}};
const TC=['#3d72b8','#b9442f'],TCD=['#1f3f6b','#6e2215'],TCL=['#8fb4e6','#ef9b86'];
const MAT=[{wall:'#7d5f3b',roof:'#a8834f',line:'#4f3a22'},{wall:'#b48a5a',roof:'#cfa66e',line:'#6f5131'},{wall:'#86837c',roof:'#aaa69d',line:'#55524c'},{wall:'#a29d94',roof:'#9a4a38',line:'#4a443d'},{wall:'#c0b4a0',roof:'#58708a',line:'#3a3d46'}];
const STATE={idle:'Wartet',move:'Unterwegs',amove:'Angriffsmarsch',attack:'Kämpft',build:'Baut'};

// Stufen (Level) von Einheiten und Gebäuden: Stufe 0 = Steinzeit, 1 = Bronzezeit, 2 = Eisenzeit.
// Neue Einheiten/Gebäude starten auf der Stufe der aktuellen Epoche; ältere müssen per Upgrade nachgezogen werden.
const LVL={hp:[1,1.25,1.55,1.9,2.3],atk:[1,1.2,1.45,1.75,2.1],gather:[1,1.25,1.5,1.75,2],bhp:[1,1.3,1.7,2.2,2.8]};
const LVLN=['I','II','III','IV','V'],LVLC=['#a39a88','#6fc46a','#eab94b','#ec8a5c','#8fd3f2'];
const NEED_LVL={stone:1,iron:2}; // ab welcher Stufe ein Arbeiter diese Ressource abbauen kann
const UPG={unit:[null,{food:20},{food:30,stone:15},{food:45,iron:20},{food:60,iron:35}],bld:[null,{wood:25},{wood:40,stone:25},{wood:60,stone:40},{wood:80,iron:40}]}; // Kosten pro Stück für die Zielstufe
const UPG_TIME={base:5,each:.7,max:40}; // Dauer in Sekunden
