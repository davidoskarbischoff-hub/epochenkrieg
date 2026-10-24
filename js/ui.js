/* Epochenkrieg – Oberfläche: Menü, Info-Feld, Befehlsknöpfe, Startbildschirm, Spielende.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- Menü ---------- */
let menuOpen=false,menuPaused=false;
function toggleMenu(){
  menuOpen=!menuOpen;const m=$('menu');document.body.classList.toggle('menu-open',menuOpen);
  if(menuOpen){if(G&&G.running&&!G.paused&&!G.mp){G.paused=true;menuPaused=true}else menuPaused=false;renderMenu();m.hidden=false}
  else{m.hidden=true;if(menuPaused&&G){G.paused=false;menuPaused=false}$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause')}
}
/* Pause-Menü im Stil eines PC-Spiels: Hauptmenü links, Optionen mit Reitern (Spiel, Grafik, Ton, Steuerung, KI & Berater) */
let optTab='game';
function renderMenu(){
  const m=$('menu');
  m.innerHTML=`<div class="gm"><div class="gm-frame"><div class="gm-crest">⚔</div><h1 class="gm-title">Epochenkrieg</h1><div class="gm-sub">${tr('Pause')}</div><div class="gm-rule"></div>
  <nav class="gm-nav"><button class="go" id="mResume">${tr('Spiel fortsetzen')}</button><button id="mOpt">${tr('Optionen')}</button><button id="mMulti">${tr('Mehrspieler')}</button>${window.EK_APP?`<button id="mUpd">${tr('Nach Updates suchen')}</button>`:''}<button id="mNew">${tr('Neues Spiel')}</button></nav>
  <div class="gm-foot">${versionLabel()} · ${tr('Tipp')}: M = ${tr('Ton')}, F = ${tr('Kampfrausch')}, Esc = ${tr('Menü')}</div></div></div>`;
  $('mResume').onclick=toggleMenu;$('mOpt').onclick=renderOptions;
  const up=$('mUpd');if(up)up.onclick=()=>{window.EK_APP.checkForUpdates();toggleMenu()};
  $('mNew').onclick=()=>{toggleMenu();showStart()};
  $('mMulti').onclick=()=>{toggleMenu();if(window.Lobby)Lobby.open()};
}
function renderOptions(){
  const m=$('menu'),pc=v=>Math.round(v*100)+' %',tabs=[['game','Spiel'],['gfx','Grafik'],['snd','Ton'],['ctl','Steuerung'],['ai','KI & Berater'],['cred','Mitwirkende']];
  const row=(label,ctl,desc)=>`<div class="orow"><div class="ol"><b>${tr(label)}</b>${desc?`<small>${tr(desc)}</small>`:''}</div><div class="oc">${ctl}</div></div>`;
  const tog=(id,on)=>`<label class="sw"><input type="checkbox" id="${id}" ${on?'checked':''}><span></span></label>`;
  const seg=(id,vals,cur)=>`<div class="seg" id="${id}">${vals.map(([v,n])=>`<button data-v="${v}" aria-pressed="${String(v)===String(cur)}">${tr(n)}</button>`).join('')}</div>`;
  const rng=(id,min,max,step,val,out)=>`<div class="rg"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}o">${out}</output></div>`;
  let body='';
  if(optTab==='game')body=row('Kamera-Geschwindigkeit',rng('oCam',.4,2.2,.1,OPT.camSpeed,OPT.camSpeed.toFixed(1)+'×'),'Wie schnell die Karte mit Tasten und Bildschirmrand wandert')
    +row('Kamera-Drehung',rng('oRot',.3,2.5,.1,OPT.camRot,OPT.camRot.toFixed(1)+'×'),'Wie schnell sich die Kamera beim Drehen und Neigen bewegt')
    +row('Ego: Mausempfindlichkeit',rng('oEgoS',.3,2.5,.1,OPT.egoSens,OPT.egoSens.toFixed(1)+'×'),'Wie schnell sich der Blick in der Ego-Ansicht dreht')
    +row('Ego: Kopf-Wippen',tog('oEgoB',OPT.egoBob),'Die Kamera wippt leicht, wenn die Figur läuft')
    +row('Kamera zurücksetzen','<button id="oCamR" type="button" class="kmbtn">'+tr('Zurücksetzen')+'</button>','Drehung und Neigung auf Standard. Umschauen: Taste halten (Standard R) und die Maus bewegen')
    +row('Bildschirmrand-Scrollen',tog('oEdge',OPT.edgeScroll),'Maus an den Rand schieben, um die Karte zu bewegen')
    +row('Zoom-Stärke',rng('oZoom',.4,2.5,.1,OPT.zoomSpeed,OPT.zoomSpeed.toFixed(1)+'×'),'Wie stark das Mausrad zoomt')
    +row('Lebensbalken',seg('oHp',[['hurt','Verletzte'],['all','Alle'],['off','Aus']],OPT.hpBars),'Wann Balken über Einheiten und Gebäuden stehen')
    +row('Oberfläche',seg('oUi',[['new','Liquid Glass'],['classic','Klassisch']],OPT.uiClassic?'classic':'new'),'Liquid-Glass-Oberfläche (Glasflächen, Seitenleiste) oder die klassische Konsole unten')
    +row('Hinweise beim Verweilen',tog('oTips',OPT.tips),'Text erscheint, wenn die Maus kurz auf einem Symbol liegt')
    +row('Meldungen',tog('oToasts',OPT.toasts),'Kleine Texte am Rand (Warnungen bleiben immer)')
    +row('Wildtiere (nächstes Spiel)',seg('oWild',[['none','Keine'],['half','Wenige'],['normal','Normal'],['double','Viele']],wildAmt()),'Wie viele wilde Tiere auf der Karte leben')
    +row('Sprache',seg('oLang',[['de','Deutsch'],['en','English']],LANG));
  if(optTab==='gfx')body=row('Qualität',seg('oGfx',[[0,'Niedrig'],[1,'Mittel'],[2,'Hoch'],[3,'Ultra']],gfxQ),'Schärfe, Schatten, Gras, Leuchten und Rauch – „Ultra“ braucht eine gute Grafikkarte')
    +row('Schatten',tog('oShadow',OPT.shadows),'Aus macht das Spiel auf schwachen Geräten schneller')
    +row('Gras und Blumen',tog('oGrass',OPT.grass))
    +row('Farbfilter',tog('oGrade',OPT.grade),'Etwas kräftigerer Kontrast und kräftigere Farben')
    +row('Team-Markierung',seg('oTm',[['off','Aus'],['soft','Dezent'],['strong','Deutlich']],OPT.teamMark),'Ring unter Einheiten und Gebäuden in Teamfarbe (eigene Kreis, Gegner Raute) und Lebensbalken nach Team')
    +row('Leuchten (Bloom)',tog('oBloom',OPT.bloom),'Helle Stellen strahlen weich nach – kostet etwas Leistung')
    +row('Wolkenschatten',tog('oCloud',OPT.cloudShade),'Weiche Schatten ziehen langsam über das Gelände – nur Optik, aus bei Grafik Niedrig')
    +row('Wetter (Laub, Schnee)',tog('oWeather',OPT.weather),'Fallende Blätter im Herbst, Blütenblätter im Frühling, Schnee im Winter – nur Optik')
    +row('Spielzimmer',tog('oRoom',OPT.room),'Karte liegt als Brett auf einem Schreibtisch in einer Werkstatt')
    +row('Intro-Animation',tog('oIntro',OPT.intro!==false),'Der Spielkarton öffnet sich beim Start; Klick oder Taste überspringt')
    +row('Raum: Fotostudio',tog('oRoomSt',OPT.roomStudio),'Statt der Maler-Werkstatt ein helles Fotostudio')
    +row('Bildrate anzeigen',tog('oFps',OPT.fps));
  if(optTab==='snd')body=row('Ton an',tog('oMute',!SND.muted),'Taste M schaltet alles stumm')
    +row('Musik',rng('mv',0,100,1,Math.round(SND.music*100),pc(SND.music)))
    +row('Effekte',rng('sv',0,100,1,Math.round(SND.sfx*100),pc(SND.sfx)))
    +row('Kampfmusik',tog('oWar',OPT.combatMusic),'Trommeln und Bläser bei Gefechten')
    +row('Stimmen',tog('oVoice',OPT.voices),'Brummen der Arbeiter, Kampfschreie, Kriegshorn');
  if(optTab==='ctl'){const K=[['WASD / Pfeile','Karte bewegen'],['Mausrad','Zoom'],['Mittlere Maustaste ziehen / Alt + Linksziehen','Kamera drehen und neigen'],['Umschalt + Mittlere Maustaste ziehen','Karte schieben'],['Zwei Finger verdrehen / gemeinsam hoch und runter','Kamera drehen / neigen (Touch)'],['Linksklick / Rahmen','Auswählen'],['Doppelklick','Alle gleichen im Bild'],['Rechtsklick','Bewegen, sammeln, bauen, angreifen, reparieren'],['Q','Angriffsmarsch'],['F','Kampfrausch'],['G','Formation wechseln (Linie, Keil, Kolonne, Karree, Kreis)'],['H','Zum Hauptlager'],['E','Späher erkunden'],['.','Untätigen Arbeiter wählen'],['Y / X','Berater: annehmen / ablehnen'],['Leertaste','Pause'],['M','Ton an/aus'],['Esc','Menü']];
    const fixed=K.filter(([k])=>!['Q','F','G','H','E','.','Y / X','Leertaste','M'].includes(k));
    body='<h3 class="ktitle">'+tr('Tastenkürzel (zum Ändern anklicken)')+'</h3><div class="keymap">'+KEYDEF.map(([a,d,lab])=>`<div class="kmrow"><span>${tr(lab)}</span><button class="kmbtn" data-a="${a}">${keyLabel(OPT.keys[a]||'')||'–'}</button></div>`).join('')+'</div><div class="kmnote">'+tr('Esc bricht ab. Eine Taste, die schon vergeben ist, wird der alten Aktion weggenommen.')+' <button class="kmreset" id="kmReset">'+tr('Standard')+'</button></div><h3 class="ktitle">'+tr('Maus und Karte')+'</h3><div class="keys">'+fixed.map(([k,d])=>`<div><kbd>${k}</kbd><span>${tr(d)}</span></div>`).join('')+'</div>'}
  if(optTab==='cred')body=`<div class="credits"><p>${tr('Epochenkrieg – Idee und Spielgestaltung: Daveson für Deus Vult Infidel. Programmiert mit Claude (Anthropic).')}</p>
    <h4>${tr('3D-Modelle')}</h4><ul><li>Quaternius (quaternius.com) – CC0</li><li>Kenney (kenney.nl) – CC0</li><li>Poly by Google – CC BY 3.0 (${tr('Boote, Katapult, Flugzeug, Luftschiff, Ballon')})</li><li>Gilang Romadhan – CC BY (${tr('Flugzeug')})</li><li>J-Toastie – CC BY (${tr('Fischernetz')})</li><li>${tr('Weitere Pakete von itch.io und poly.pizza (Dinosaurier, Fahrzeuge, Natur, Türme, Menschen, Architektur) – siehe models/CREDITS.md')}</li></ul>
    <h4>${tr('Klänge und Musik')}</h4><ul><li>Kenney (kenney.nl) – CC0 (${tr('Geräusche, Fanfaren')})</li><li>${tr('Hintergrundmusik: eigene Synthesizer-Fassungen nach Satie, Pachelbel und Grieg (gemeinfrei)')}</li></ul>
    <h4>${tr('Technik')}</h4><ul><li>three.js – MIT</li><li>PeerJS – MIT</li></ul>
    <p><small>${tr('Vielen Dank an alle, die ihre Werke frei zur Verfügung stellen.')}</small></p></div>`;
  if(optTab==='ai')body=row('Berater',tog('advChk',advOn),'Schlägt Aktionen vor (Annehmen: Y, Ablehnen: X)')
    +row('Berater im Auto-Modus',tog('oAuto',advisor.auto),'Der Berater führt seine Vorschläge selbst aus')
    +row('Taktik des Beraters',seg('oStrat',Object.entries(STRATS).map(([k,v])=>[k,v.name]),advisor.strat),'Ändert, was er zuerst vorschlägt')
    +row('Arbeiter denken mit',tog('abChk',autoBuildOn),'Arbeiter reparieren, bauen Lager und Türme und machen Gebäude fertig')
    +row('Truppen denken mit',tog('gdChk',guardOn),'Truppen im Leerlauf schützen Arbeiter vor gefährlichen Wildtieren und gehen Streife (nur Einzelspieler)')
    +row('Gegner-Typ (nächstes Spiel)',seg('oAiS',Object.entries(AI_STYLES).map(([k,v])=>[k,v.name]),aiStyle),'Wirkt beim nächsten „Neues Spiel“')
    +row('Schwierigkeit (nächstes Spiel)',seg('oDiff',[['leicht','leicht'],['normal','normal'],['schwer','schwer']],diff),'Wirkt beim nächsten „Neues Spiel“');
  m.innerHTML=`<div class="gm"><div class="gm-frame wide"><h1 class="gm-title sm">${tr('Optionen')}</h1><div class="gm-rule"></div>
   <div class="otabs" role="tablist">${tabs.map(([k,n])=>`<button data-t="${k}" aria-pressed="${k===optTab}">${tr(n)}</button>`).join('')}</div>
   <div class="obody">${body}</div><div class="gm-rule"></div>
   <div class="btnrow"><button class="btn2" id="oReset">${tr('Zurücksetzen')}</button><button class="go" id="oBack">${tr('Übernehmen')}</button></div></div></div>`;
  m.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{optTab=b.dataset.t;renderOptions()});
  const q=id=>document.getElementById(id),bind=(id,fn)=>{const e=q(id);if(e)fn(e)};
  const segB=(id,fn)=>bind(id,e=>e.querySelectorAll('button').forEach(b=>b.onclick=()=>{fn(b.dataset.v);e.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))}));
  bind('oCam',e=>e.oninput=()=>{optSet('camSpeed',+e.value);q('oCamo').textContent=(+e.value).toFixed(1)+'×'});
  bind('oEgoS',e=>e.oninput=()=>{optSet('egoSens',+e.value);q('oEgoSo').textContent=(+e.value).toFixed(1)+'×'});bind('oEgoB',e=>e.onchange=()=>optSet('egoBob',e.checked));
  bind('oCamR',e=>e.onclick=()=>camReset());
  bind('oEdge',e=>e.onchange=()=>optSet('edgeScroll',e.checked));
  bind('oRot',e=>e.oninput=()=>{optSet('camRot',+e.value);q('oRoto').textContent=(+e.value).toFixed(1)+'×'});
  bind('oZoom',e=>e.oninput=()=>{optSet('zoomSpeed',+e.value);q('oZoomo').textContent=(+e.value).toFixed(1)+'×'});
  segB('oUi',v=>{optSet('uiClassic',v==='classic');panelSig='';infoCache='';if(G)updateUI()});segB('oHp',v=>optSet('hpBars',v));segB('oTm',v=>optSet('teamMark',v));bind('oTips',e=>e.onchange=()=>optSet('tips',e.checked));bind('oToasts',e=>e.onchange=()=>optSet('toasts',e.checked));
  segB('oLang',v=>{applyLang(v);renderOptions()});
  segB('oWild',v=>{try{localStorage.setItem('ek-wild',v)}catch(_){}renderOptions()});
  document.querySelectorAll('.kmbtn').forEach(b=>b.onclick=()=>{b.textContent=tr('Taste drücken …');b.classList.add('wait');
    const h=ev=>{ev.preventDefault();ev.stopPropagation();removeEventListener('keydown',h,true);if(ev.key!=='Escape'&&ev.key!=='Shift'&&ev.key!=='Control'&&ev.key!=='Alt'&&ev.key!=='Meta'){keySet(b.dataset.a,ev.key.length===1?ev.key.toLowerCase():ev.key)}renderOptions()};addEventListener('keydown',h,true)});
  bind('kmReset',e=>e.onclick=()=>{keysReset();renderOptions()});
  segB('oGfx',v=>setGfx(+v));bind('oShadow',e=>e.onchange=()=>optSet('shadows',e.checked));bind('oGrass',e=>e.onchange=()=>optSet('grass',e.checked));bind('oBloom',e=>e.onchange=()=>optSet('bloom',e.checked));bind('oCloud',e=>e.onchange=()=>optSet('cloudShade',e.checked));bind('oWeather',e=>e.onchange=()=>optSet('weather',e.checked));bind('oRoom',e=>e.onchange=()=>{optSet('room',e.checked);if(typeof ROOM!=='undefined'){if(!ROOM.g&&e.checked)ROOM.init();else ROOM.apply()}});bind('oIntro',e=>e.onchange=()=>optSet('intro',e.checked));bind('oRoomSt',e=>e.onchange=()=>{optSet('roomStudio',e.checked);if(typeof ROOM!=='undefined')ROOM.setBg()});bind('oGrade',e=>e.onchange=()=>optSet('grade',e.checked));bind('oFps',e=>e.onchange=()=>optSet('fps',e.checked));
  bind('oMute',e=>e.onchange=()=>SND.setMute(!e.checked));
  bind('mv',e=>e.oninput=()=>{SND.init();SND.setMusic(e.value/100);q('mvo').textContent=pc(SND.music)});
  bind('sv',e=>{e.oninput=()=>{SND.init();SND.setSfx(e.value/100);q('svo').textContent=pc(SND.sfx)};e.onchange=()=>SND.play('select')});
  bind('oWar',e=>e.onchange=()=>optSet('combatMusic',e.checked));bind('oVoice',e=>e.onchange=()=>optSet('voices',e.checked));
  bind('advChk',e=>e.onchange=()=>{advOn=e.checked;try{localStorage.setItem('ek-advisor',advOn?'1':'0')}catch(_){}if(!advOn)advisor.cur=null});
  bind('oAuto',e=>e.onchange=()=>{advisor.auto=e.checked;advisor.autoAt=(G?G.t:0)+2});
  segB('oStrat',v=>{advisor.strat=v;advisor.ignore={};advisor.cur=null;advisor.next=0;advisor.reacted=null});
  bind('gdChk',e=>e.onchange=()=>{guardOn=e.checked;try{localStorage.setItem('ek-guard',guardOn?'1':'0')}catch(_){}});
  bind('abChk',e=>e.onchange=()=>{autoBuildOn=e.checked;try{localStorage.setItem('ek-autobuild2',autoBuildOn?'1':'0')}catch(_){}});
  segB('oAiS',v=>{aiStyle=v});segB('oDiff',v=>{diff=v});
  q('oReset').onclick=()=>{optReset();setGfx(1);renderOptions()};q('oBack').onclick=renderMenu;
}
function applyLang(l){setLang(l);panelSig='';infoCache='';$('speedBtn').textContent=tr('Tempo {0}×',G?G.speed:1);$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause');if(!$('overlay').hidden&&$('overlay').querySelector('[data-l]'))showStart();if(G)updateUI()}
$('menuBtn').onclick=()=>{SND.init();toggleMenu()};
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(typeof SND!=='undefined')SND.init()},{once:true}));
$('pauseBtn').onclick=()=>{if(G&&G.running)togglePause()};
$('speedBtn').onclick=()=>{if(!G||G.mp)return;G.speed=G.speed===1?2:G.speed===2?3:G.speed===3?5:1;$('speedBtn').textContent=tr('Tempo {0}×',G.speed)};
$('idleBtn').onclick=()=>{if(G&&G.running)selectIdle()};

/* ---------- UI ---------- */
function toast(msg,kind){if(NET.cap){NET.cap.push([msg,kind]);return}if(!OPT.toasts&&kind!=='warn')return;const el=document.createElement('div');el.className='toast'+(kind?' '+kind:'');el.textContent=msg;const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),450)},3200)}
const costHTML=c=>RES.filter(r=>c[r]).map(r=>`<span class="c ${(G&&G.res[0][r]||0)>=c[r]?'ok':'bad'}" data-r="${r}" data-n="${c[r]}">${ART.icon(r)}${Math.ceil(c[r])}</span>`).join('');
function actionsFor(s){const a=actionsFor0(s);if(s.length&&!EGO.on&&EGO.can(s[0]))a.unshift({key:'ego',nm:tr('Ego-Ansicht'),sub:tr('Taste {0}: aus den Augen schauen',keyLabel(OPT.keys.ego||'v')),run:()=>EGO.start(s[0])});return a}
function actionsFor0(s){
  if(!s.length||s[0].team!==0)return[];const f=s[0],acts=[],ep=G.epoch[0];
  if(f.kind==='unit'){
    if(s.some(u=>UNITS[u.type].builds))for(const k of ['house','store','barracks','airfield','farm','mine','derrick','refinery','market','harbor','tower','castle','wall','gate','trench'].filter(k=>BLDS[k].ep<=ep)){const d=BLDS[k];acts.push({key:'b'+k,nm:tr(d.name),cost:d.cost,sub:tr(d.sub),lock:d.ep>ep?tr(EPOCHS[d.ep].name):null,run:()=>startPlace(k)})}
    if(s.some(u=>u.kind==='unit'&&!UNITS[u.type].passive))acts.push({key:'am',nm:tr('Angriffsmarsch'),sub:tr('Taste Q, dann Ziel'),run:()=>{armed=true;placing=null}});
    if(s.filter(u=>u.kind==='unit'&&!UNITS[u.type].gather).length>1)acts.push({key:'form',nm:tr('Formation: {0}',tr(FORMS[curForm])),sub:tr('Taste G wechselt: Linie, Keil, Kolonne, Karree, Kreis'),run:()=>{curForm=(curForm+1)%FORMS.length;panelSig='';toast(tr('Formation: {0}',tr(FORMS[curForm])),'good')}});
    if(s.some(u=>u.kind==='unit'&&!UNITS[u.type].passive&&!UNITS[u.type].naval))acts.push({key:'rage',nm:tr('Kampfrausch'),sub:tr('Taste F: mehr Schaden und Tempo für {0} s',RAGE.dur),run:()=>{const ids=s.filter(u=>u.kind==='unit').map(u=>u.id);if(NET.client)NET.send({c:'rage',ids});else if(!useRage(0,ids))toast(tr('Kampfrausch lädt noch.'),'warn')}});
    if(s.some(u=>u.type==='scout'))acts.push({key:'exp',nm:tr('Erkunden'),sub:tr('Taste E: automatisch'),run:()=>{if(NET.client)NET.send({c:'explore',ids:s.map(u=>u.id)});else doExplore()}});
    acts.push({key:'stop',nm:tr('Halt'),sub:tr('Befehle abbrechen'),run:()=>{if(NET.client){NET.send({c:'halt',ids:s.map(u=>u.id)});return}s.forEach(u=>{if(u.kind==='unit'){u.state='idle';u.amove=null;u.q=[];u.loop=null;u.manual=true}})}});
    return acts;
  }
  if(f.kind==='bld'&&f.built){
    for(const [k,d] of Object.entries(UNITS))if(d.from===f.type&&uOk(k,ep)&&(!d.nation||d.nation===G.nation[0])){const nt=d.tech&&!G.tech[0].has(d.tech);acts.push({key:'t'+k,nm:tr(UNAMES[k]?UNAMES[k][Math.min(5,G.epoch[0])]:d.name),cost:ucost(0,k),need:nt?tr('Technologie nötig: {0}',tr(TECH[d.tech].name)):null,sub:nt?tr('Technologie nötig'):null,run:()=>enqueue(f,k,0),unit:k})}
    if(BSPEC[f.type]&&f.team===0&&!f.spec)for(const [k,sp] of Object.entries(BSPEC[f.type]).filter(([k,sp])=>(sp.ep||0)<=G.epoch[0])){acts.push({key:'ts'+k,ib:f.type,nm:tr(sp.name),cost:sp.cost,sub:tr(sp.sub),adv:true,run:()=>{if(!buildSpec(0,f.id,k))toast(tr('Nicht genug Rohstoffe.'),'warn')}})}
    if(f.type==='mine'&&f.team===0&&!f.empty&&cartWant(f)<CART_MAX)acts.push({key:'cart2',nm:tr('Zusätzliche Lore'),cost:CART_COST,sub:tr('Lore {0} von {1}: mehr Erz zum Lager',cartWant(f)+1,CART_MAX),adv:true,run:()=>{if(!buyCart(0,f.id))toast(tr('Nicht genug Rohstoffe.'),'warn');else panelSig=''}});
    if(f.type==='mine'&&f.team===0){const n=minersIn(f);if(n)acts.push({key:'unmine',nm:tr('Arbeiter herausholen'),sub:tr('{0} Bergleute kommen heraus',n),run:()=>{mineRelease(0,f.id);panelSig=''}})}
    if(f.team===0&&f.type!=='hq'&&f.kind==='bld'){const k=f.built?.5:1,c={};for(const r in BLDS[f.type].cost)c[r]=Math.round(BLDS[f.type].cost[r]*k);
      acts.push({key:'demo',nm:tr('Abreißen'),sub:tr('Gibt {0} % der Rohstoffe zurück',Math.round(k*100)),adv:true,run:()=>{if(G.demoArm!==f.id||G.t>G.demoT){G.demoArm=f.id;G.demoT=G.t+3;toast(tr('Zum Abreißen noch einmal klicken.'),'warn');return}G.demoArm=null;demolish(0,f.id)}})}
    if(f.type==='market')for(const rt of['food','wood','stone','iron'])for(const dir of['sell','buy']){const lot=TRADE.lot,g=Math.round(lot*TRADE.sell*(1+SF(0).trade)),c=Math.round(lot*TRADE.buy);
      acts.push({key:'tr'+dir+rt,nm:dir==='sell'?tr('{0} → Gold',lot+' '+rn(rt)):tr('Gold → {0}',lot+' '+rn(rt)),cost:dir==='sell'?{[rt]:lot}:{gold:c},sub:dir==='sell'?tr('Du erhältst {0} Gold',g):tr('Du erhältst {0}',lot+' '+rn(rt)),run:()=>{if(NET.client)NET.send({c:'trade',rt,dir});else if(!trade(0,rt,dir))toast(tr('Nicht genug Rohstoffe.'),'warn')}})}
    if(f.type==='hq'&&f.team===0){const pd=pending(0);
      if(pd.n)acts.push({key:'upg',nm:tr('Alle upgraden'),cost:pd.cost,adv:true,sub:tr('{0} Gebäude · {1} Truppen',pd.nb,pd.nu),run:()=>startUpgrade(0,'all')});
      if(ep<EPOCHS.length-1)acts.push({key:'adv',nm:tr('Aufstieg: {0}',tr(EPOCHS[ep+1].name)),cost:EPOCHS[ep].cost,adv:true,need:wkCount(0)<wkNeed(ep)?tr('Für den Aufstieg brauchst du {0} Arbeiter.',wkNeed(ep)):pd.n?tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]):null,sub:wkCount(0)<wkNeed(ep)?wkCount(0)+'/'+wkNeed(ep)+' '+tr('Arbeiter').toLowerCase()+'':pd.n?tr('Erst upgraden'):null,run:()=>advance(0)})}
  }
  return acts;
}
let curActs=[],infoCache='';
/* Tastenschild auf Aktionen: kommt aus den (änderbaren) Tastenkürzeln KEYDEF */
const ACT_KEYS={am:'attack',exp:'explore',rage:'rage',form:'form',ego:'ego'};
function actKey(k){const a=ACT_KEYS[k];if(!a||!OPT.keys[a]||(!ui2()&&k!=='am'&&k!=='exp'))return'';return keyLabel(OPT.keys[a])}
$('acts').addEventListener('click',e=>{const b=e.target.closest('.act');if(!b||!G||!G.running)return;const a=curActs[+b.dataset.i];if(!a)return;if(a.lock){toast(tr('Erst ab der {0} verfügbar.',a.lock));sfx('error');return}if(a.need){toast(a.need);sfx('error');return}sfx('click');a.run()});
$('info').addEventListener('pointerdown',e=>{if(!G||!G.running)return;const q=e.target.closest('[data-q]');if(q){const b=selection()[0];if(b&&b.team===0)cancelQueue(b,+q.dataset.q);return}if(e.target.closest('[data-clear]')){sel.clear();panelSig='';return}const tb=e.target.closest('[data-tech]');if(tb){startResearch(0,tb.dataset.tech);infoCache='';panelSig='';return}const ub=e.target.closest('[data-upg]');if(ub){startUpgrade(0,ub.dataset.upg);infoCache='';panelSig=''}});
function techBlock(e){
  const ts=techsFor(e.type).filter(t=>t.ep<=G.epoch[0]);if(!ts.length)return '';const own=G.tech[0];
  let h=`<div class="upg"><div class="uh"><b>${tr('Technologien')}</b></div>`;
  for(const t of ts){if(own.has(t.id))continue;const rs=G.rs[0].find(r=>r.id===t.id);
    if(rs)h+=`<div class="ur run"><span class="un">${tr(t.name)}</span><span class="uc"><small>${Math.floor(rs.t/rs.time*100)} %</small></span><span class="ub busy">${tr(rs.q?'wartet':'läuft')}</span></div>`;
    else{const ok=afford(0,t.cost);h+=`<div class="ur"><span class="un"><b class="tn">${tr(t.name)}</b><small>${tr(t.desc)}</small></span><span class="uc">${costHTML(t.cost)}<small>${t.time} s</small></span><button class="ub ${ok?'ok':'bad'}" data-tech="${t.id}">${tr('Erforschen')}</button></div>`}}
  const done=ts.filter(t=>own.has(t.id));if(done.length)h+=`<div class="line upd">✔ ${done.map(t=>tr(t.name)).join(' · ')}</div>`;
  return h+'</div>'}
/* Kopfbild in der Seitenleiste (nur neue Oberfläche): Rendering des echten Modells */
function hdIcon(e){if(!ui2()||typeof ICON3==='undefined'||(e.kind!=='unit'&&e.kind!=='bld'))return'';try{const u=ICON3.thing(e.kind,e.type);return u?`<img class="hic" src="${u}" alt="">`:''}catch(_){return''}}
function infoHTML(s){
  const clr='<button class="x" data-clear aria-label="'+tr('Auswahl aufheben')+'">×</button>';
  if(!s.length)return '<p class="muted">'+tr('Linksklick oder Rahmen ziehen wählt aus. Rechtsklick gibt Befehle: bewegen, sammeln, bauen, angreifen. Doppelklick wählt alle gleichen Einheiten im Bild.')+'</p>';
  if(s.length>1){const c={};s.forEach(e=>{const n=nameOf(e);c[n]=(c[n]||0)+1});return `<div class="ih"><h2>${s.length} ${tr('ausgewählt')}</h2>${clr}</div><div class="chips">${Object.entries(c).map(([n,k])=>`<span class="chip">${k}× ${n}</span>`).join('')}</div>`}
  const e=s[0];
  if(e.kind==='animal'){const d=ANIMALS[e.type];return `<div class="ih"><h2>${nameOf(e)}</h2><span class="tag">${tr('Wildtier')}</span>${clr}</div><div class="hpw"><div class="hp"><span style="width:${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%"></span></div>${Math.ceil(e.hp)} / ${e.maxHp}</div><div class="line"><em>${tr(d.info)}</em></div>${d.food?`<div class="line">${tr('Jagdbeute')}: <b>${d.food}</b> ${rn('food')}</div>`:''}<div class="line"><em>${d.agg?tr('Angriff {0}',d.atk):tr('Rechtsklick mit Einheiten zum Jagen')}</em></div>`}
  const tag=e.team===1?'<span class="tag enemy">'+tr('Gegner')+'</span>':e.team===0?'<span class="tag">'+tr(EPOCHS[G.epoch[0]].name)+'</span>':'';
  const lv=e.kind==='node'?'':`<span class="tag" style="color:${LVLC[e.lvl]};border-color:${LVLC[e.lvl]}">${tr('Stufe {0}',LVLN[e.lvl])}</span>`;
  let h=`<div class="ih">${hdIcon(e)}<h2>${nameOf(e)}</h2>${tag}${lv}${clr}</div>`;
  if(e.kind==='node')return h+`<div class="line">${tr('Vorrat')}: <b>${Math.ceil(e.amount)}</b> ${rn(e.rt)}</div>`;
  h+=`<div class="hpw"><div class="hp"><span style="width:${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%"></span></div>${Math.ceil(e.hp)} / ${e.maxHp}</div>`;
  if(e.kind==='unit'){const d=UNITS[e.type];let st=tr(STATE[e.state]||'');if(e.state==='gather')st=tr('Sammelt {0}',rn(e.rtype||e.ctype||'food'));if(e.state==='return')st=tr('Bringt {0} zum Lager',rn(e.ctype));
    h+=`<div class="line">${st}${e.carry>0?` <em>· ${tr('trägt {0} {1}',Math.floor(e.carry),rn(e.ctype))}</em>`:''}</div>${e.q&&e.q.length?`<div class="line"><em>${tr('Befehlskette: {0} weitere Aufträge',e.q.length)}${e.loop?' · '+tr('Schleife'):''}</em></div>`:''}<div class="line"><em>${tr('Angriff {0} · Reichweite {1}',d.atk,d.ranged?d.rng:tr('Nahkampf'))}</em></div>`}
  else{
    if(!e.built)h+=`<div class="line">${tr('Im Bau: {0} %',Math.floor(e.prog*100))}${e.team===0?' <em>· '+tr('Arbeiter per Rechtsklick zum Bauen schicken')+'</em>':''}</div>`;
    if(e.team===0&&e.type==='hq'&&G.adv[0])h+=`<div class="line">${tr('Aufstieg in die {0}',tr(EPOCHS[G.epoch[0]+1].name))}: <b>${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</b></div>`;
    if(e.team===0&&e.type==='hq'&&G.epoch[0]>=1){const pd=pending(0),R=G.res[0];
      h+=`<div class="upg"><div class="uh"><b>${tr('Upgrades auf Stufe {0}',LVLN[G.epoch[0]])}</b><em>${tr('Vor dem nächsten Aufstieg müssen alle darauf sein')}</em></div>`;
      for(const g of pd.groups){const ok=afford(0,g.cost);h+=`<div class="ur"><span class="un">${tr(g.nm)} <b>×${g.n}</b></span><span class="uc">${costHTML(g.cost)}<small>${Math.ceil(g.time)} s</small></span><button class="ub ${ok?'ok':'bad'}" data-upg="${g.key}">${tr('Upgrade')}</button></div>`}
      for(const j of G.jobs[0]){h+=`<div class="ur run"><span class="un">${j.label}</span><span class="uc"><small>${Math.floor(j.t/j.time*100)} %</small></span><span class="ub busy">${tr('läuft')}</span></div>`}
      if(pd.groups.length>1){const ok=afford(0,pd.cost);h+=`<div class="ur all"><span class="un"><b>${tr('Alles')}</b> <b>×${pd.n}</b></span><span class="uc">${costHTML(pd.cost)}<small>${Math.ceil(pd.time)} s</small></span><button class="ub ${ok?'ok':'bad'}" data-upg="all">${tr('Alles upgraden')}</button></div>`}
      else if(!pd.groups.length&&!G.jobs[0].length)h+=`<div class="line upd">✔ ${tr('Alles auf Stufe {0}',LVLN[G.epoch[0]])}</div>`;
      h+='</div>'}
    if(e.type==='mine'&&e.built){const n=minersIn(e),tot=Object.values(e.st||{}).reduce((a,v)=>a+v,0);
      h+=`<div class="line">${tr('Bergleute: {0} / {1}',n,MINE_CAP)}</div><div class="chips"><span class="q">${tr('Minenlager')}: ${Math.floor(tot)} / ${MINE_STOCK}<span class="qb"><span style="width:${Math.min(100,tot/MINE_STOCK*100)}%"></span></span></span></div>`;
      h+=`<div class="line">${tr('Loren: {0} / {1}',cartWant(e),CART_MAX)}</div>`;
      if(e.empty)h+='<div class="line"><em>'+tr('Vorkommen erschöpft – Mine abreißen, um den Rest aus dem Minenlager zu bekommen.')+'</em></div>';
      else if(e.team===0&&!n)h+='<div class="line"><em>'+tr('Arbeiter per Rechtsklick auf die Mine oder das Vorkommen schicken. Eine Lore bringt das Erz zum Lager.')+'</em></div>'}
    if(e.team===0&&e.built)h+=techBlock(e);
    if(e.team===0&&e.queue.length){h+='<div class="chips">'+e.queue.map((q,i)=>`<button class="q${q.blocked?' blocked':''}" data-q="${i}" title="${tr('Klicken zum Abbrechen')}">${q.tech?'⚗ '+tr(TECH[q.tech].name):tr(UNITS[q.type].name)}${q.blocked?' – '+tr(q.tech?'Rohstoffe fehlen':'Platz fehlt'):''}<span class="qb"><span style="width:${i===0?(q.t/(q.tech?TECH[q.tech].time:UNITS[q.type].time)*100).toFixed(0):0}%"></span></span></button>`).join('')+'</div>'}
    if(e.team===0&&e.built&&(e.type==='hq'||e.type==='barracks')&&!e.queue.length)h+='<div class="line"><em>'+tr('Rechtsklick auf die Karte setzt den Sammelpunkt.')+'</em></div>';
    if(e.team===0&&BLDS[e.type].pop)h+=`<div class="line"><em>${tr('Bietet Platz für {0} Bewohner',BLDS[e.type].pop)}</em></div>`;
  }
  return h;
}
function updateUI(){
  if(typeof SND!=='undefined'){SND.setAlert(G.t-G.alertT<22?.85:0);if(G.t-(G.batT||-9)>.5){G.batT=G.t;let n=0;for(const e of G.ents)if(!e.dead&&e.kind==='unit'&&e.state==='attack'&&G.t-(e.swing||-9)<3&&shown(e))n++;SND.setBattle(Math.min(1,n/16))}}
  const r=G.res[0];$('v-food').textContent=Math.floor(r.food);$('v-wood').textContent=Math.floor(r.wood);$('v-stone').textContent=Math.floor(r.stone);$('v-iron').textContent=Math.floor(r.iron);$('res-iron').hidden=G.epoch[0]<2&&r.iron<=0;$('v-gold').textContent=Math.floor(r.gold||0);$('res-gold').hidden=G.epoch[0]<3&&!(r.gold>0);$('v-oil').textContent=Math.floor(r.oil||0);$('res-oil').hidden=G.epoch[0]<5&&!(r.oil>0);
  {const w=wkCount(0),nd=wkNeed(G.epoch[0]),last=G.epoch[0]>=EPOCHS.length-1;$('v-wk').textContent=w+(last?'':'/'+nd);$('v-wk').style.color=!last&&w<nd?'':'#a9e283';let tr_=0;for(const e of G.ents)if(!e.dead&&e.team===0&&e.kind==='unit'&&e.type!=='worker')tr_++;$('v-troop').textContent=tr_}
  if(document.body.dataset.ep!==String(G.epoch[0]))document.body.dataset.ep=G.epoch[0];
  const pe=$('v-pop');pe.textContent=G.pop[0]+'/'+G.cap[0];pe.style.color=G.pop[0]>=G.cap[0]?'var(--warn)':'';
  if(document.body.dataset.ep!==String(G.epoch[0]))document.body.dataset.ep=G.epoch[0];
  $('epoch').innerHTML=tr(EPOCHS[G.epoch[0]].name)+(G.adv[0]?`<span class="prog">→ ${tr(EPOCHS[G.epoch[0]+1].name)} ${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</span>`:'');
  const ub=$('upgbar'),js=G.jobs[0],rs0=G.rs[0];ub.hidden=true;if(false){const h=js.map(j=>{const pc=Math.floor(j.t/j.time*100);return `<div class="uj"><span>${tr('Upgrade')}: ${j.label} → ${tr('Stufe {0}',LVLN[j.to])} · ${pc} %</span><div><i style="width:${pc}%"></i></div></div>`}).join('')+rs0.map(r=>{const pc=Math.floor(r.t/r.time*100);return `<div class="uj tech"><span>${tr('Forschung')}: ${tr(TECH[r.id].name)} · ${pc} %</span><div><i style="width:${pc}%"></i></div></div>`}).join('');if(h!==ub._h){ub._h=h;ub.innerHTML=h}}
  const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle').length;const ib=$('idleBtn');ib.textContent=idle===0?tr('Alle Arbeiter beschäftigt'):idle===1?tr('1 untätiger Arbeiter'):tr('{0} untätige Arbeiter',idle);ib.classList.toggle('alert',idle>0);ib.classList.toggle('ok',idle===0);ib.dataset.n=idle;
  {const sb=$('speedBtn'),pb=$('pauseBtn');sb.dataset.sp=G.speed;pb.dataset.on=G.paused?1:0;const ep=G.epoch[0];if(ib.dataset.ico!==String(ep)&&typeof ICON3!=='undefined'){const u=ICON3.thing('unit','worker');if(u){ib.style.setProperty('--ico','url('+u+')');ib.dataset.ico=ep}}}
  advisorTick();advisorUI();$('pauseBtn').hidden=!!G.mp;$('speedBtn').hidden=!!G.mp;
  const s=selection();document.body.classList.toggle('has-sel',s.length>0);
  const sig=s.map(e=>e.id+(e.built?'b':'')).join(',')+'|'+G.epoch[0]+'|'+(G.adv[0]?1:0)+G.jobs[0].length+'|'+pending(0).n+'|'+G.tech[0].size+'|'+G.rs[0].length+'|v'+(typeof EKMODELS!=='undefined'?EKMODELS.ver:0);
  if(sig!==panelSig){panelSig=sig;curActs=actionsFor(s);$('acts').innerHTML=curActs.map((a,i)=>`<button class="act" data-i="${i}">${actIcon(a)}${actKey(a.key)?`<kbd>${actKey(a.key)}</kbd>`:''}<span class="nm">${a.nm}</span>${a.cost?`<span class="cost">${costHTML(a.cost)}</span>`:''}${a.lock?`<span class="sub">${tr('ab {0}',a.lock)}</span>`:a.sub?`<span class="sub">${a.sub}</span>`:''}</button>`).join('')}
  $('acts').querySelectorAll('.act').forEach(b=>{const a=curActs[+b.dataset.i];if(!a)return;b.classList.toggle('locked',!!a.lock||!!a.need||!!(a.adv&&G.adv[0])||!!(a.key==='adv'&&G.jobs[0].length));b.classList.toggle('poor',!!a.cost&&!afford(0,a.cost));b.querySelectorAll('.c').forEach(ch=>{const ok=(G.res[0][ch.dataset.r]||0)>=+ch.dataset.n;ch.classList.toggle('ok',ok);ch.classList.toggle('bad',!ok)})});
  const ih=infoHTML(s);if(ih!==infoCache){infoCache=ih;$('info').innerHTML=ih}
  const hint=$('hint');
  if(placing){hint.hidden=false;hint.textContent=placing==='wall'?tr('Mauer: Maustaste gedrückt halten und ziehen = durchgehende Mauer · Klick = ein Stück · Rechtsklick oder Esc bricht ab'):tr('{0} platzieren: Klick auf freie Fläche · Umschalt hält den Modus · Rechtsklick oder Esc bricht ab',tr(BLDS[placing].name))}
  else if(armed){hint.hidden=false;hint.textContent=tr('Angriffsmarsch: Ziel anklicken · Truppen greifen unterwegs alles an · Esc bricht ab')}
  else if(G.jobs[0].length){hint.hidden=false;hint.textContent=tr('Upgrade läuft: die betroffenen Einheiten und Gebäude ruhen, bis es fertig ist.')}
  else if((keys.shift||keys.Shift)&&ownSel().some(u=>u.kind==='unit')){hint.hidden=false;hint.textContent=tr('Umschalt gedrückt: Befehle werden hintereinander ausgeführt')}
  else if(G.paused){hint.hidden=false;hint.textContent=tr('Pausiert · Leertaste setzt fort')}
  else hint.hidden=true;
}

/* ---------- overlay ---------- */
function showStart(){
  if(NET.mp){endMP();if(window.Lobby)Lobby.leave()}
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${tr('Prototyp · Echtzeitstrategie · 1 gegen 1')}</p><h1>Epochenkrieg</h1>
  <p>${tr('Führe deinen Stamm durch sechs Zeitalter. Sammle Nahrung, Holz und Stein, baue deine Siedlung aus und zerstöre das Hauptlager des Gegners, bevor er deins erreicht.')}</p>
  <div class="eras">${EPOCHS.map(e=>`<span>${tr(e.name)}</span>`).join('')}</div>
  <div class="diff" role="group" aria-label="${tr('Schwierigkeit')}">${['leicht','normal','schwer'].map(d=>`<button data-d="${d}" aria-pressed="${d===diff}">${tr(d)}</button>`).join('')}</div>
  <div class="diff aist" role="group" aria-label="${tr('Gegner')}">${Object.entries(AI_STYLES).map(([k,v])=>`<button data-as="${k}" aria-pressed="${k===aiStyle}" title="${tr(v.desc)}">${tr(v.name)}</button>`).join('')}</div>
  <div class="maps" role="group" aria-label="${tr('Karte')}">${Object.entries(MAPS).map(([k,m])=>`<button data-map="${k}" aria-pressed="${k===curMap}"><b>${tr(m.name)}</b><img src="${mapPreview(k)}" alt="" title="${tr(m.desc)}"></button>`).join('')}</div>
  <dl class="ctl"><dt>${tr('Auswählen')}</dt><dd>${tr('Linksklick, Rahmen ziehen, Doppelklick für alle gleichen')}</dd><dt>${tr('Befehl')}</dt><dd>${tr('Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt')}</dd><dt>${tr('Kamera')}</dt><dd>${tr('WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt, mittlere Maustaste dreht und neigt')}</dd><dt>${tr('Tasten')}</dt><dd>${tr('Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü')}</dd><dt>${tr('Touch')}</dt><dd>${tr('Tippen wählt aus, mit Auswahl tippen gibt Befehl, Wischen bewegt die Karte')}</dd></dl>
  <div class="langrow"><span>${tr('Sprache')}</span><div class="diff" role="group">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div></div>
  <div class="btnrow row"><button class="go" id="goBtn">${tr('Einzelspiel starten')}</button><button class="btn2" id="mpBtn">${tr('Mehrspieler')} …</button></div></div>`;
  ov.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{curMap=b.dataset.map;ov.querySelectorAll('[data-map]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('mpBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();if(window.Lobby)Lobby.open()};
  ov.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>applyLang(b.dataset.l));
  ov.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{aiStyle=b.dataset.as;ov.querySelectorAll('[data-as]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  ov.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{diff=b.dataset.d;ov.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('goBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();$('goBtn').disabled=true;$('goBtn').textContent=tr('Karte wird erzeugt …');requestAnimationFrame(()=>setTimeout(()=>{newGame(diff,!!(G&&!G.started),{map:curMap,aiStyle});G.running=true;G.started=true;ov.hidden=true;toast(tr('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.'))},20))};
}
function showEnd(){
  G.overShown=true;G.running=false;const win=G.over==='win';sfx(win?'win':'lose');const m=Math.floor(G.t/60),s=Math.floor(G.t%60);
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${G.lostMsg&&NET.mp?tr('Die Verbindung zum Gastgeber ist abgebrochen'):G.leftMsg&&NET.mp?tr('Dein Mitspieler hat das Spiel verlassen'):win?tr('Das gegnerische Hauptlager ist gefallen'):tr('Dein Hauptlager wurde zerstört')}</p><h1>${win?tr('Sieg'):tr('Niederlage')}</h1>
  <div class="stats"><div><b>${m}:${String(s).padStart(2,'0')}</b><small>${tr('Spielzeit')}</small></div><div><b>${G.stats.trained[0]}</b><small>${tr('Ausgebildet')}</small></div><div><b>${G.stats.lost[1]}</b><small>${tr('Gegner besiegt')}</small></div></div>
  <p>${tr('Erreichtes Zeitalter: {0}. Schwierigkeit: {1}.',tr(EPOCHS[G.epoch[0]].name),tr(diff))}</p>
  <button class="go" id="againBtn">${tr('Neues Spiel')}</button></div>`;
  $('againBtn').onclick=showStart;
}


/* ---------- Hinweise: bleibt die Maus kurz auf einem Symbol oder Knopf, erscheint ein erklärender Text ---------- */
const TIPS={'Nahrung':'Wird für Arbeiter und Truppen gebraucht. Beeren, Felder, Wild und Fische liefern Nahrung.','Holz':'Baumaterial für Gebäude und viele Einheiten. Arbeiter fällen Bäume.','Stein':'Für Türme, Mauern und Aufstiege. Abbau ab der Bronzezeit mit Spitzhacke.','Eisen':'Für Waffen, Rüstungen und Aufstiege. Braucht ab der Eisenzeit eine Mine neben dem Vorkommen.','Öl':'Treibstoff für Panzer und Flugzeuge. Ölfelder sind verborgen: erst erkunden, dann Bohrturm bauen, Öl zur Raffinerie bringen.','Gold':'Für späte Einheiten und den Markt. Braucht ab dem Mittelalter eine Mine neben dem Vorkommen.','Bevölkerung':'Belegte Plätze / Gesamtplätze. Hütten und Technologien schaffen mehr Platz.','Spieltempo':'Klicken wechselt zwischen 1×, 2×, 3× und 5×.','Menü (Esc)':'Optionen, Grafik, Ton und Spiel beenden.'};
/* Hinweis zu einer Einheit: Rolle, Werte, Stärken (Tooltip über den Ausbildungs-Knöpfen) */
const UROLE={wk:'Sammelt Rohstoffe, baut und repariert Gebäude.',inf:'Nahkämpfer: robust, gut gegen Fernkämpfer und Belagerung.',spear:'Speerträger: hält Reiterei auf.',rng:'Fernkämpfer: schießt aus der Distanz, gut gegen Nahkämpfer.',cav:'Reiterei: schnell, gut gegen Fernkämpfer, Belagerung und Heiler.',siege:'Belagerung: großer Schaden gegen Gebäude, langsam und verwundbar.',ship:'Schiff: kämpft auf dem Wasser.',air:'Flugzeug: fliegt über alles, nur Fernkämpfer und Flieger treffen es.',med:'Heiler: kämpft nicht, heilt verletzte eigene Truppen in der Nähe.'};
const CLSN={inf:'Nahkämpfer',spear:'Speerträger',rng:'Fernkämpfer',cav:'Reiterei',siege:'Belagerung',med:'Heiler'};
function unitTip(k){const d=UNITS[k];if(!d)return'';const e=Math.min(6,G.epoch[0]),m=v=>Math.round(v*LVL.hp[e]);
  const st=[tr('Leben {0}',m(d.hp)),d.heal?tr('Heilt {0}/s',d.heal):d.atk?tr('Angriff {0}',Math.round(d.atk*LVL.atk[e])):null,d.rng>30?tr('Reichweite {0}',d.rng):null,tr('Tempo {0}',d.spd)].filter(Boolean).join(' · ');
  const good=Object.keys(CTR[d.cls]||{}).map(c=>tr(CLSN[c]||c)).join(', ');
  return '<br>'+[d.gather&&!d.naval?tr(UROLE.wk):d.naval&&d.gather?tr('Fischt auf dem Wasser und bringt Nahrung zum Hafen.'):tr(UROLE[d.cls]||''),st,good?tr('Stark gegen: {0}',good):'',d.air&&!d.bomber?tr('Gewehre und MG treffen Flugzeuge nur mit 30-40 % Wirkung.'):''].filter(Boolean).join('<br>')}
{const tip=document.createElement('div');tip.id='tip';tip.hidden=true;document.body.appendChild(tip);let timer=null,cur=null;
  const content=el=>{
    if(el.classList&&el.classList.contains('act')){const a=curActs[+el.dataset.i];if(!a)return null;return{h:a.nm,t:[a.sub,a.need,a.lock&&tr('Erst ab der {0} verfügbar.',a.lock)].filter(Boolean).join(' · ')+(a.unit?unitTip(a.unit):''),c:a.cost?costHTML(a.cost):''}}
    const k=el.dataset.tt||el.dataset.tip;if(!k)return null;const base=k.split(' (')[0];return{h:tr(k),t:TIPS[base]?tr(TIPS[base]):'',c:''}};
  const hide=()=>{clearTimeout(timer);timer=null;tip.hidden=true;cur=null};
  document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[data-tt],[data-tip],.act');if(el===cur)return;hide();if(!el)return;cur=el;if(el.title)el.title='';
    timer=setTimeout(()=>{if(!OPT.tips)return;const c=content(el);if(!c||!document.body.contains(el)){return}tip.innerHTML=`<b>${c.h}</b>${c.t?`<p>${c.t}</p>`:''}${c.c?`<div class="tc">${c.c}</div>`:''}`;tip.hidden=false;
      const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)),y=r.bottom+8;if(y+h>innerHeight-8)y=r.top-h-8;
      if(el.closest('#side')&&ui2()){x=r.left-w-10;y=Math.min(r.top,innerHeight-h-8);if(x<8){x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2));y=r.top-h-8<8?r.bottom+8:r.top-h-8}}else if(el.closest('#mini')){x=r.right+10;y=r.bottom-h}tip.style.left=x+'px';tip.style.top=Math.max(8,y)+'px'},650)});
  document.addEventListener('mousedown',hide);document.addEventListener('mouseout',e=>{if(!e.relatedTarget)hide()});}

/* ---------- Zeitalter-Baum: alle Zeitalter in einer Reihe, nach der Industriezeit verzweigt er sich in Nationen (Kaiserreiche | Demokratien) ---------- */
let treeOpen=false,treeMode='view',treePaused=false;
function showNationPick(){openTree('pick')}
function openTree(mode){
  if(!G)return;treeOpen=true;treeMode=mode;const el=$('tree')||(()=>{const d=document.createElement('div');d.id='tree';document.getElementById('app').appendChild(d);return d})();
  if(G.running&&!G.paused&&!G.mp){G.paused=true;treePaused=true}else treePaused=false;
  const ep=G.epoch[0],my=G.nation[0],groups={};for(const [k,n] of Object.entries(NATIONS))(groups[n.grp]=groups[n.grp]||[]).push(k);
  const eras=EPOCHS.slice(0,6).map((e,i)=>`<div class="era ${i<ep?'done':i===ep?'cur':''}" style="--c:${LVLC[i]}"><b>${tr(e.name)}</b><small>${LVLN[i]}</small></div>`).join('<span class="arr">▸</span>');
  const card=k=>{const n=NATIONS[k],sel=my===k,pick=mode==='pick';return `<button class="nat ${sel?'sel':''} ${my&&!sel?'dim':''}" data-n="${k}" ${pick?'':'tabindex="-1"'} style="--fc:${n.col}"><span class="flag"></span><b>${tr(n.name)}</b><small class="reg">${tr(n.reg)}</small><span class="bon">${tr(n.bonus)}</span><span class="spc">${n.sp.map(u=>tr(UNITS[u].name)).join(' · ')}</span></button>`};
  el.innerHTML=`<div class="gm"><div class="gm-frame wide tree"><h1 class="gm-title sm">${tr(mode==='pick'?'Wähle deine Nation':'Zeitalter-Baum')}</h1><div class="gm-rule"></div>
   <div class="eras2">${eras}<span class="arr fork">⑂</span><div class="era ${ep>=6?'cur':''}" style="--c:${LVLC[6]}"><b>${tr('Weltkriegszeit')}</b><small>${LVLN[6]}</small></div></div>
   <p class="thint">${tr(mode==='pick'?'Mit dem Aufstieg in die Weltkriegszeit entscheidest du dich für eine Nation. Sie bestimmt Bonus und Spezialeinheiten. Alle Nationen haben gleich starke Grundtruppen (Sturmsoldat, Maschinengewehr, Panzer, Jagdflugzeug).':'Dein Weg durch die Zeitalter. Nach der Industriezeit verzweigt sich der Baum in Nationen.')}</p>
   <div class="natgrid">${Object.entries(groups).map(([g,ks])=>`<div class="natgrp"><h3>${tr(g)}</h3>${ks.map(card).join('')}</div>`).join('')}</div>
   <div class="btnrow"><button class="btn2" id="treeClose">${tr(mode==='pick'?'Abbrechen':'Schließen')}</button></div></div></div>`;
  el.hidden=false;
  el.querySelector('#treeClose').onclick=closeTree;
  if(mode==='pick')el.querySelectorAll('.nat').forEach(b=>b.onclick=()=>{const k=b.dataset.n;closeTree();advance(0,k)});
}
function closeTree(){treeOpen=false;const el=$('tree');if(el)el.hidden=true;if(treePaused&&G){G.paused=false;treePaused=false}}
$('treeBtn').onclick=()=>{SND.init();treeOpen?closeTree():openTree('view')};
addEventListener('keydown',e=>{if(kA(e)==='tree'){if(!G||!G.running||menuOpen)return;treeOpen?closeTree():openTree('view')}else if(e.key==='Escape'&&treeOpen){closeTree();e.stopPropagation()}},true);

/* Vorschaubild für Ausbildungs- und Baukacheln */
function actIcon(a){const k=a.key||'';let kind=null,type=null;if(k[0]==='t'&&UNITS[k.slice(1)]){kind='unit';type=k.slice(1)}else if(k[0]==='b'&&BLDS[k.slice(1)]){kind='bld';type=k.slice(1)}else if(a.ib){kind='bld';type=a.ib}
  if(!kind||typeof ICON3==='undefined')return'';const u=ICON3.thing(kind,type);return u?`<img class="aic" src="${u}" alt="">`:''}

/* Versionsanzeige im Menü: in der Desktop-App die App-Version, im Browser „Web-Version“ */
function versionLabel(){return window.EK_APP?tr('App-Version')+' '+window.EK_APP.version:tr('Web-Version')}
