/* Gemeinsame Daten für die Mockups (nur zur Ansicht, kein Spielcode).
   Aufruf: a.html?ep=0|6&sel=none|worker|barracks|hq&adv=1|0&menu=1|0 */
const Q=new URLSearchParams(location.search);
const EP=Q.get('ep')==='6'?6:0;
const SEL=Q.get('sel')||'barracks';
const ADV=Q.get('adv')!=='0';
const MENU=Q.get('menu')==='1';
document.body.dataset.ep=EP;
document.body.classList.add(innerWidth>=1700?'big':'small');
const BG=`bilder/bg-ep${EP}-${innerWidth>=1700?1920:1280}.jpg`;
document.getElementById('bg').style.backgroundImage=`url(${BG})`;
const I=(n)=>n.startsWith('res-')||['pop','wk','troop'].includes(n)?`bilder/ic/${n}.png`:`bilder/ic/ep${EP}-${n}.png`;
const img=(n,c='')=>`<img class="${c}" src="${I(n)}" alt="">`;
const EPN=EP===0?'Steinzeit':'Weltkriegszeit';
const RES=[['res-food','Nahrung',1234],['res-wood','Holz',1234],['res-stone','Stein',1234],['res-iron','Eisen',1234],['res-gold','Gold',1234]].concat(EP===6?[['res-oil','Öl',1234]]:[]);
RES.push(['pop','Bevölkerung','20/15'],['wk','Arbeiter',EP===0?'14/14':'14'],['troop','Truppen',6]);
const COST={food:'res-food',wood:'res-wood',stone:'res-stone',iron:'res-iron',gold:'res-gold',oil:'res-oil'};
const SC={
 worker:{name:'Arbeiter',sub:EPN+' · Stufe '+(EP?'VII':'I'),hp:[40,40],img:'unit-worker',
   text:'Rechtsklick: sammeln, bauen oder reparieren. Untätige Arbeiter: Taste Punkt.',
   acts:[['Hütte','bld-house',{wood:60},'B'],['Kaserne','bld-barracks',{wood:150},'K'],['Wachturm','bld-tower',{wood:100,stone:40},'W'],['Lager','bld-store',{wood:80},'L']]},
 barracks:{name:'Kaserne',sub:EPN+' · Stufe '+(EP?'VII':'I'),hp:EP?[2800,2800]:[700,700],img:'bld-barracks',
   text:'Rechtsklick auf die Karte setzt den Sammelpunkt.',
   acts:EP===0?[['Steinschleuderer','unit-sling',{food:40,wood:25},'Q'],['Keulenkrieger','unit-club',{food:60,wood:20},'W'],['Schamane','unit-healer',{food:60,wood:20},'E'],['Ego-Ansicht','unit-scout',{},'V']]
     :[['Gewehrschütze','unit-rifle',{food:100,wood:40,iron:90,gold:35},'Q'],['Panzer','unit-tank',{wood:200,iron:320,gold:140,oil:60},'W'],['Haubitze','unit-howitzer',{wood:260,iron:260,gold:110},'E'],['Sanitäter','unit-healer',{food:60,wood:20},'R'],['Ego-Ansicht','unit-scout',{},'V']]},
 hq:{name:'Hauptlager',sub:EPN+' · Stufe '+(EP?'VII':'I'),hp:[1400,1400],img:'bld-hq',
   text:'Upgrades und Technologien: Tragekörbe, Dorfgemeinschaft, Lederschuhe, Handkarren …',
   acts:[['Arbeiter','unit-worker',{food:50},'Q'],['Späher','unit-scout',{food:60,wood:20},'W'],['Alle upgraden','bld-hq',{food:1280,wood:425},'U'],['Ego-Ansicht','unit-scout',{},'V']]}
};
const S=SC[SEL]||null;
const costHtml=(c)=>Object.entries(c).map(([k,v])=>`<span class="co"><img src="${I(COST[k])}" alt="">${v}</span>`).join('');

const TREE='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4.5M12 12H5v4.5M12 12h7v4.5"/></svg>';
