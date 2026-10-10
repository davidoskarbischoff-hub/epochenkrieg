/* Epochenkrieg – Oberfläche: Menü, Info-Feld, Befehlsknöpfe, Startbildschirm, Spielende.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- Menü ---------- */
let menuOpen=false,menuPaused=false;
function toggleMenu(){
  menuOpen=!menuOpen;const m=$('menu');
  if(menuOpen){if(G&&G.running&&!G.paused&&!G.mp){G.paused=true;menuPaused=true}else menuPaused=false;renderMenu();m.hidden=false}
  else{m.hidden=true;if(menuPaused&&G){G.paused=false;menuPaused=false}$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause')}
}
function renderMenu(){
  const pc=v=>Math.round(v*100)+' %';
  $('menu').innerHTML=`<div class="card"><h1>${tr('Menü')}</h1>
  <div class="set"><label for="mv">${tr('Musik')}</label><input type="range" id="mv" min="0" max="100" value="${Math.round(SND.music*100)}"><output id="mvo">${pc(SND.music)}</output></div>
  <div class="set"><label for="sv">${tr('Ton')}</label><input type="range" id="sv" min="0" max="100" value="${Math.round(SND.sfx*100)}"><output id="svo">${pc(SND.sfx)}</output></div>
  <div class="set"><label for="advChk">${tr('Berater')}</label><input type="checkbox" id="advChk" ${advOn?'checked':''} class="chk"><output></output></div>
  <div class="langrow"><span>${tr('Sprache')}</span><div class="diff" role="group">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div></div>
  <div class="btnrow"><button class="go" id="mResume">${tr('Spiel fortsetzen')}</button><button class="btn2" id="mMulti">${tr('Mehrspieler')} …</button><button class="btn2" id="mNew">${tr('Neues Spiel')}</button></div></div>`;
  $('mv').oninput=e=>{SND.init();SND.setMusic(e.target.value/100);$('mvo').textContent=pc(SND.music)};
  $('sv').oninput=e=>{SND.init();SND.setSfx(e.target.value/100);$('svo').textContent=pc(SND.sfx)};
  $('sv').onchange=()=>SND.play('select');
  $('menu').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{applyLang(b.dataset.l);renderMenu()});
  $('advChk').onchange=e=>{advOn=e.target.checked;try{localStorage.setItem('ek-advisor',advOn?'1':'0')}catch(_){}if(!advOn)advisor.cur=null};
  $('mResume').onclick=toggleMenu;
  $('mNew').onclick=()=>{toggleMenu();showStart()};
  if($('mMulti'))$('mMulti').onclick=()=>{toggleMenu();if(window.Lobby)Lobby.open()};
}
function applyLang(l){setLang(l);panelSig='';infoCache='';$('speedBtn').textContent=tr('Tempo {0}×',G?G.speed:1);$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause');if(!$('overlay').hidden&&G&&!G.running&&!G.overShown)showStart();if(G)updateUI()}
$('menuBtn').onclick=()=>{SND.init();toggleMenu()};
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(typeof SND!=='undefined')SND.init()},{once:true}));
$('pauseBtn').onclick=()=>{if(G&&G.running)togglePause()};
$('speedBtn').onclick=()=>{if(!G||G.mp)return;G.speed=G.speed===1?2:G.speed===2?3:1;$('speedBtn').textContent=tr('Tempo {0}×',G.speed)};
$('idleBtn').onclick=()=>{if(G&&G.running)selectIdle()};

/* ---------- UI ---------- */
function toast(msg,kind){if(NET.cap){NET.cap.push([msg,kind]);return}const el=document.createElement('div');el.className='toast'+(kind?' '+kind:'');el.textContent=msg;const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),450)},3200)}
const costHTML=c=>RES.filter(r=>c[r]).map(r=>`<span class="c ${(G&&G.res[0][r]||0)>=c[r]?'ok':'bad'}" data-r="${r}" data-n="${c[r]}">${ART.icon(r)}${Math.ceil(c[r])}</span>`).join('');
function actionsFor(s){
  if(!s.length||s[0].team!==0)return[];const f=s[0],acts=[],ep=G.epoch[0];
  if(f.kind==='unit'){
    if(s.some(u=>u.type==='worker'))for(const k of ['house','store','barracks','harbor','tower','castle','wall'].filter(k=>BLDS[k].ep<=ep)){const d=BLDS[k];acts.push({key:'b'+k,nm:tr(d.name),cost:d.cost,sub:tr(d.sub),lock:d.ep>ep?tr(EPOCHS[d.ep].name):null,run:()=>startPlace(k)})}
    if(s.some(u=>u.kind==='unit'&&!UNITS[u.type].passive))acts.push({key:'am',nm:tr('Angriffsmarsch'),sub:tr('Taste Q, dann Ziel'),run:()=>{armed=true;placing=null}});
    if(s.some(u=>u.type==='scout'))acts.push({key:'exp',nm:tr('Erkunden'),sub:tr('Taste E: automatisch'),run:()=>{if(NET.client)NET.send({c:'explore',ids:s.map(u=>u.id)});else doExplore()}});
    acts.push({key:'stop',nm:tr('Halt'),sub:tr('Befehle abbrechen'),run:()=>{if(NET.client){NET.send({c:'halt',ids:s.map(u=>u.id)});return}s.forEach(u=>{if(u.kind==='unit'){u.state='idle';u.amove=null;u.q=[];u.loop=null}})}});
    return acts;
  }
  if(f.kind==='bld'&&f.built){
    for(const [k,d] of Object.entries(UNITS))if(d.from===f.type&&d.ep<=ep){const nt=d.tech&&!G.tech[0].has(d.tech);acts.push({key:'t'+k,nm:tr(d.name),cost:d.cost,need:nt?tr('Technologie nötig: {0}',tr(TECH[d.tech].name)):null,sub:nt?tr('Technologie nötig'):null,run:()=>enqueue(f,k,0),unit:k})}
    if(f.type==='hq'&&f.team===0){const pd=pending(0);
      if(pd.n)acts.push({key:'upg',nm:tr('Alle upgraden'),cost:pd.cost,adv:true,sub:tr('{0} Gebäude · {1} Truppen',pd.nb,pd.nu),run:()=>startUpgrade(0,'all')});
      if(ep<EPOCHS.length-1)acts.push({key:'adv',nm:tr('Aufstieg: {0}',tr(EPOCHS[ep+1].name)),cost:EPOCHS[ep].cost,adv:true,need:wkCount(0)<wkNeed(ep)?tr('Für den Aufstieg brauchst du {0} Arbeiter.',wkNeed(ep)):pd.n?tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]):null,sub:wkCount(0)<wkNeed(ep)?wkCount(0)+'/'+wkNeed(ep)+' '+tr('Arbeiter').toLowerCase()+'':pd.n?tr('Erst upgraden'):null,run:()=>advance(0)})}
  }
  return acts;
}
let curActs=[],infoCache='';
$('acts').addEventListener('click',e=>{const b=e.target.closest('.act');if(!b||!G||!G.running)return;const a=curActs[+b.dataset.i];if(!a)return;if(a.lock){toast(tr('Erst ab der {0} verfügbar.',a.lock));sfx('error');return}if(a.need){toast(a.need);sfx('error');return}sfx('click');a.run()});
$('info').addEventListener('pointerdown',e=>{if(!G||!G.running)return;const q=e.target.closest('[data-q]');if(q){const b=selection()[0];if(b&&b.team===0)cancelQueue(b,+q.dataset.q);return}if(e.target.closest('[data-clear]')){sel.clear();panelSig='';return}const tb=e.target.closest('[data-tech]');if(tb){startResearch(0,tb.dataset.tech);infoCache='';panelSig='';return}const ub=e.target.closest('[data-upg]');if(ub){startUpgrade(0,ub.dataset.upg);infoCache='';panelSig=''}});
function techBlock(e){
  const ts=techsFor(e.type).filter(t=>t.ep<=G.epoch[0]);if(!ts.length)return '';const own=G.tech[0];
  let h=`<div class="upg"><div class="uh"><b>${tr('Technologien')}</b></div>`;
  for(const t of ts){if(own.has(t.id))continue;const rs=G.rs[0].find(r=>r.id===t.id);
    if(rs)h+=`<div class="ur run"><span class="un">${tr(t.name)}</span><span class="uc"><small>${Math.floor(rs.t/rs.time*100)} %</small></span><span class="ub busy">${tr('läuft')}</span></div>`;
    else{const ok=afford(0,t.cost);h+=`<div class="ur"><span class="un"><b class="tn">${tr(t.name)}</b><small>${tr(t.desc)}</small></span><span class="uc">${costHTML(t.cost)}<small>${t.time} s</small></span><button class="ub ${ok?'ok':'bad'}" data-tech="${t.id}">${tr('Erforschen')}</button></div>`}}
  const done=ts.filter(t=>own.has(t.id));if(done.length)h+=`<div class="line upd">✔ ${done.map(t=>tr(t.name)).join(' · ')}</div>`;
  return h+'</div>'}
function infoHTML(s){
  const clr='<button class="x" data-clear aria-label="'+tr('Auswahl aufheben')+'">×</button>';
  if(!s.length)return '<p class="muted">'+tr('Linksklick oder Rahmen ziehen wählt aus. Rechtsklick gibt Befehle: bewegen, sammeln, bauen, angreifen. Doppelklick wählt alle gleichen Einheiten im Bild.')+'</p>';
  if(s.length>1){const c={};s.forEach(e=>{const n=nameOf(e);c[n]=(c[n]||0)+1});return `<div class="ih"><h2>${s.length} ${tr('ausgewählt')}</h2>${clr}</div><div class="chips">${Object.entries(c).map(([n,k])=>`<span class="chip">${k}× ${n}</span>`).join('')}</div>`}
  const e=s[0];
  if(e.kind==='animal'){const d=ANIMALS[e.type];return `<div class="ih"><h2>${nameOf(e)}</h2><span class="tag">${tr('Wildtier')}</span>${clr}</div><div class="hpw"><div class="hp"><span style="width:${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%"></span></div>${Math.ceil(e.hp)} / ${e.maxHp}</div><div class="line"><em>${tr(d.info)}</em></div>${d.food?`<div class="line">${tr('Jagdbeute')}: <b>${d.food}</b> ${rn('food')}</div>`:''}<div class="line"><em>${d.agg?tr('Angriff {0}',d.atk):tr('Rechtsklick mit Einheiten zum Jagen')}</em></div>`}
  const tag=e.team===1?'<span class="tag enemy">'+tr('Gegner')+'</span>':e.team===0?'<span class="tag">'+tr(EPOCHS[G.epoch[0]].name)+'</span>':'';
  const lv=e.kind==='node'?'':`<span class="tag" style="color:${LVLC[e.lvl]};border-color:${LVLC[e.lvl]}">${tr('Stufe {0}',LVLN[e.lvl])}</span>`;
  let h=`<div class="ih"><h2>${nameOf(e)}</h2>${tag}${lv}${clr}</div>`;
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
    if(e.team===0&&e.built)h+=techBlock(e);
    if(e.team===0&&e.queue.length){h+='<div class="chips">'+e.queue.map((q,i)=>`<button class="q${q.blocked?' blocked':''}" data-q="${i}" title="${tr('Klicken zum Abbrechen')}">${tr(UNITS[q.type].name)}${q.blocked?' – '+tr('Platz fehlt'):''}<span class="qb"><span style="width:${i===0?(q.t/UNITS[q.type].time*100).toFixed(0):0}%"></span></span></button>`).join('')+'</div>'}
    if(e.team===0&&e.built&&(e.type==='hq'||e.type==='barracks')&&!e.queue.length)h+='<div class="line"><em>'+tr('Rechtsklick auf die Karte setzt den Sammelpunkt.')+'</em></div>';
    if(e.team===0&&BLDS[e.type].pop)h+=`<div class="line"><em>${tr('Bietet Platz für {0} Bewohner',BLDS[e.type].pop)}</em></div>`;
  }
  return h;
}
function updateUI(){
  if(typeof SND!=='undefined')SND.setAlert(G.t-G.alertT<22?.85:0);
  const r=G.res[0];$('v-food').textContent=Math.floor(r.food);$('v-wood').textContent=Math.floor(r.wood);$('v-stone').textContent=Math.floor(r.stone);$('v-iron').textContent=Math.floor(r.iron);$('res-iron').hidden=G.epoch[0]<2&&r.iron<=0;
  {const w=wkCount(0),nd=wkNeed(G.epoch[0]),last=G.epoch[0]>=EPOCHS.length-1;$('v-wk').textContent=w+(last?'':'/'+nd);$('v-wk').style.color=!last&&w<nd?'':'#a9e283';let tr_=0;for(const e of G.ents)if(!e.dead&&e.team===0&&e.kind==='unit'&&e.type!=='worker')tr_++;$('v-troop').textContent=tr_}
  if(document.body.dataset.ep!==String(G.epoch[0]))document.body.dataset.ep=G.epoch[0];
  const pe=$('v-pop');pe.textContent=G.pop[0]+'/'+G.cap[0];pe.style.color=G.pop[0]>=G.cap[0]?'var(--warn)':'';
  $('epoch').innerHTML=tr(EPOCHS[G.epoch[0]].name)+(G.adv[0]?`<span class="prog">→ ${tr(EPOCHS[G.epoch[0]+1].name)} ${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</span>`:'');
  const ub=$('upgbar'),js=G.jobs[0],rs0=G.rs[0];ub.hidden=true;if(false){const h=js.map(j=>{const pc=Math.floor(j.t/j.time*100);return `<div class="uj"><span>${tr('Upgrade')}: ${j.label} → ${tr('Stufe {0}',LVLN[j.to])} · ${pc} %</span><div><i style="width:${pc}%"></i></div></div>`}).join('')+rs0.map(r=>{const pc=Math.floor(r.t/r.time*100);return `<div class="uj tech"><span>${tr('Forschung')}: ${tr(TECH[r.id].name)} · ${pc} %</span><div><i style="width:${pc}%"></i></div></div>`}).join('');if(h!==ub._h){ub._h=h;ub.innerHTML=h}}
  const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle').length;const ib=$('idleBtn');ib.textContent=idle===0?tr('Alle Arbeiter beschäftigt'):idle===1?tr('1 untätiger Arbeiter'):tr('{0} untätige Arbeiter',idle);ib.classList.toggle('alert',idle>0);ib.classList.toggle('ok',idle===0);
  advisorTick();advisorUI();$('pauseBtn').hidden=!!G.mp;$('speedBtn').hidden=!!G.mp;
  const s=selection();
  const sig=s.map(e=>e.id+(e.built?'b':'')).join(',')+'|'+G.epoch[0]+'|'+(G.adv[0]?1:0)+G.jobs[0].length+'|'+pending(0).n+'|'+G.tech[0].size+'|'+G.rs[0].length;
  if(sig!==panelSig){panelSig=sig;curActs=actionsFor(s);$('acts').innerHTML=curActs.map((a,i)=>`<button class="act" data-i="${i}">${({am:'Q',exp:'E'})[a.key]?`<kbd>${({am:'Q',exp:'E'})[a.key]}</kbd>`:''}<span class="nm">${a.nm}</span>${a.cost?`<span class="cost">${costHTML(a.cost)}</span>`:''}${a.lock?`<span class="sub">${tr('ab {0}',a.lock)}</span>`:a.sub?`<span class="sub">${a.sub}</span>`:''}</button>`).join('')}
  $('acts').querySelectorAll('.act').forEach(b=>{const a=curActs[+b.dataset.i];if(!a)return;b.classList.toggle('locked',!!a.lock||!!a.need||!!(a.adv&&G.adv[0])||!!(a.key==='adv'&&G.jobs[0].length));b.classList.toggle('poor',!!a.cost&&!afford(0,a.cost));b.querySelectorAll('.c').forEach(ch=>{const ok=(G.res[0][ch.dataset.r]||0)>=+ch.dataset.n;ch.classList.toggle('ok',ok);ch.classList.toggle('bad',!ok)})});
  const ih=infoHTML(s);if(ih!==infoCache){infoCache=ih;$('info').innerHTML=ih}
  const hint=$('hint');
  if(placing){hint.hidden=false;hint.textContent=tr('{0} platzieren: Klick auf freie Fläche · Umschalt hält den Modus · Rechtsklick oder Esc bricht ab',tr(BLDS[placing].name))}
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
  <p>${tr('Führe deinen Stamm durch fünf Zeitalter. Sammle Nahrung, Holz und Stein, baue deine Siedlung aus und zerstöre das Hauptlager des Gegners, bevor er deins erreicht.')}</p>
  <div class="eras">${EPOCHS.map(e=>`<span>${tr(e.name)}</span>`).join('')}</div>
  <div class="diff" role="group" aria-label="${tr('Schwierigkeit')}">${['leicht','normal','schwer'].map(d=>`<button data-d="${d}" aria-pressed="${d===diff}">${tr(d)}</button>`).join('')}</div>
  <div class="maps" role="group" aria-label="${tr('Karte')}">${Object.entries(MAPS).map(([k,m])=>`<button data-map="${k}" aria-pressed="${k===curMap}"><b>${tr(m.name)}</b><img src="${mapPreview(k)}" alt="" title="${tr(m.desc)}"></button>`).join('')}</div>
  <dl class="ctl"><dt>${tr('Auswählen')}</dt><dd>${tr('Linksklick, Rahmen ziehen, Doppelklick für alle gleichen')}</dd><dt>${tr('Befehl')}</dt><dd>${tr('Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt')}</dd><dt>${tr('Kamera')}</dt><dd>${tr('WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt')}</dd><dt>${tr('Tasten')}</dt><dd>${tr('Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü')}</dd><dt>${tr('Touch')}</dt><dd>${tr('Tippen wählt aus, mit Auswahl tippen gibt Befehl, Wischen bewegt die Karte')}</dd></dl>
  <div class="langrow"><span>${tr('Sprache')}</span><div class="diff" role="group">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div></div>
  <div class="btnrow row"><button class="go" id="goBtn">${tr('Einzelspiel starten')}</button><button class="btn2" id="mpBtn">${tr('Mehrspieler')} …</button></div></div>`;
  ov.querySelectorAll('[data-map]').forEach(b=>b.onclick=()=>{curMap=b.dataset.map;ov.querySelectorAll('[data-map]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('mpBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();if(window.Lobby)Lobby.open()};
  ov.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>applyLang(b.dataset.l));
  ov.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{diff=b.dataset.d;ov.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('goBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();newGame(diff,!!(G&&!G.started),{map:curMap});G.running=true;G.started=true;ov.hidden=true;toast(tr('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.'))};
}
function showEnd(){
  G.overShown=true;G.running=false;const win=G.over==='win';sfx(win?'win':'lose');const m=Math.floor(G.t/60),s=Math.floor(G.t%60);
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${G.leftMsg&&NET.mp?tr('Dein Mitspieler hat das Spiel verlassen'):win?tr('Das gegnerische Hauptlager ist gefallen'):tr('Dein Hauptlager wurde zerstört')}</p><h1>${win?tr('Sieg'):tr('Niederlage')}</h1>
  <div class="stats"><div><b>${m}:${String(s).padStart(2,'0')}</b><small>${tr('Spielzeit')}</small></div><div><b>${G.stats.trained[0]}</b><small>${tr('Ausgebildet')}</small></div><div><b>${G.stats.lost[1]}</b><small>${tr('Gegner besiegt')}</small></div></div>
  <p>${tr('Erreichtes Zeitalter: {0}. Schwierigkeit: {1}.',tr(EPOCHS[G.epoch[0]].name),tr(diff))}</p>
  <button class="go" id="againBtn">${tr('Neues Spiel')}</button></div>`;
  $('againBtn').onclick=showStart;
}

