// Spieldaten: Einheiten, Gebäude, Ressourcen, Epochen, Schwierigkeit, Farben.
// Hier lässt sich das Balancing ändern, ohne die Spiellogik anzufassen.
const W=2400,H=1600,CARRY=10;
const UNITS={
  worker:{name:'Arbeiter',hp:40,spd:58,atk:3,rng:4,cd:1.2,r:7,cost:{food:50},time:9,ep:0,from:'hq'},
  club:{name:'Keulenkrieger',hp:75,spd:52,atk:7,rng:4,cd:1.1,r:8,cost:{food:60,wood:20},time:12,ep:0,from:'barracks'},
  spear:{name:'Speerträger',hp:115,spd:54,atk:11,rng:8,cd:1.1,r:8,cost:{food:70,wood:40},time:14,ep:1,from:'barracks'},
  archer:{name:'Bogenschütze',hp:55,spd:55,atk:8,rng:130,cd:1.6,r:7,cost:{food:40,wood:60},time:14,ep:1,from:'barracks',ranged:true},
  sword:{name:'Schwertkämpfer',hp:170,spd:52,atk:17,rng:5,cd:1.1,r:9,cost:{food:80,stone:40},time:18,ep:2,from:'barracks'}
};
const BLDS={
  hq:{name:'Hauptlager',hp:1400,r:36,pop:10,drop:true,shoot:{rng:150,atk:6,cd:1.8}},
  house:{name:'Hütte',hp:250,r:16,pop:5,cost:{wood:50},time:14,ep:0,sub:'+5 Bevölkerung'},
  store:{name:'Lager',hp:350,r:18,drop:true,cost:{wood:80},time:16,ep:0,sub:'Abgabestelle'},
  barracks:{name:'Kaserne',hp:700,r:27,cost:{wood:150},time:24,ep:0,sub:'Bildet Krieger aus'},
  tower:{name:'Wachturm',hp:550,r:14,cost:{wood:60,stone:100},time:28,ep:1,shoot:{rng:170,atk:9,cd:1.5},sub:'Schiesst auf Gegner'}
};
const NODES={tree:{rt:'wood',amt:120,r:11,name:'Baum'},bush:{rt:'food',amt:160,r:10,name:'Beerenstrauch'},stone:{rt:'stone',amt:300,r:13,name:'Steinvorkommen'}};
const EPOCHS=[{name:'Steinzeit',cost:{food:350,wood:200},time:30},{name:'Bronzezeit',cost:{food:500,wood:250,stone:200},time:40},{name:'Eisenzeit'}];
const RES=['food','wood','stone'],RN={food:'Nahrung',wood:'Holz',stone:'Stein'};
const DIFF={leicht:{gather:.7,first:420,wave:5},normal:{gather:1,first:300,wave:6},schwer:{gather:1.35,first:220,wave:7}};
const TC=['#3d72b8','#b9442f'],TCD=['#1f3f6b','#6e2215'],TCL=['#8fb4e6','#ef9b86'];
const MAT=[{wall:'#7d5f3b',roof:'#a8834f',line:'#4f3a22'},{wall:'#b48a5a',roof:'#cfa66e',line:'#6f5131'},{wall:'#86837c',roof:'#aaa69d',line:'#55524c'}];
const STATE={idle:'Wartet',move:'Unterwegs',amove:'Angriffsmarsch',attack:'Kämpft',build:'Baut'};
