/* Hauptmenü: Ladebildschirm (einmal beim Start) → Hauptseite (Einzelspieler, Mehrspieler, Tutorial, Story, Einstellungen, Mitwirkende)
   → Einzelspieler-Einstellungen mit Kacheln und Reglern. Im Hintergrund fährt die Kamera langsam über die Karte. Ersetzt showStart() aus ui.js. */
(()=>{
  let splashDone=false,spSize='L';
  const SIZES_SP=[['S','Klein'],['M','Mittel'],['L','Groß']],DIFFS=[['leicht','Leicht'],['normal','Normal'],['schwer','Schwer']],WILD=[['none','Keine'],['half','Wenige'],['normal','Normal'],['double','Viele']];
  const AI_ICON={balanced:'⚖',turtle:'🛡',rush:'⚔',eco:'⚒',boom:'▲'};
  const ov=()=>$('overlay');
  const music=()=>{try{if(typeof SND!=='undefined'){SND.init();SND.setEpoch(7)}}catch(_){}}; /* Menümusik: Smetana, Die Moldau (PIECES[7]) */
  /* Hintergrund: Bedienelemente des Spiels ausblenden, Kamera fährt langsam */
  function bg(on){document.body.classList.toggle('mm',on);if(on&&!bg.raf){const t0=performance.now();const fly=()=>{if(!document.body.classList.contains('mm')){bg.raf=0;return}const t=(performance.now()-t0)/1000*.025;
    if(typeof cam!=='undefined'&&typeof W!=='undefined'){const hq=G&&G.ents.find(e=>e.type==='hq'&&e.team===0)||{x:W/2,y:H/2};cam.x=hq.x+Math.cos(t*4)*260;cam.y=hq.y+Math.sin(t*4)*180;cam.z=.9;clampCam()}bg.raf=requestAnimationFrame(fly)};bg.raf=requestAnimationFrame(fly)}}
  function splash(){
    const o=ov();o.hidden=false;o.className='mmv';bg(true);
    o.innerHTML=`<div class="mm-splash"><div class="mm-crest">⚔</div><h1 class="mm-logo">Epochenkrieg</h1><p class="mm-by">Daveson ${tr('für')} Deus Vult Infidel</p>
      <div class="mm-bar"><i id="mmBar"></i></div><p class="mm-hint" id="mmHint">${tr('Lädt …')}</p></div>`;
    let p=0;const tick=()=>{if(splashDone)return;const ready=typeof EKMODELS==='undefined'||EKMODELS.ready;p=Math.min(ready?100:92,p+(ready?6:1.2));const b=$('mmBar');if(b)b.style.width=p+'%';
      if(p>=100){const h=$('mmHint');if(h)h.textContent=tr('Klicken zum Fortfahren');o.classList.add('mm-ready')}setTimeout(tick,60)};tick();
    o.onclick=()=>{if(!o.classList.contains('mm-ready'))return;splashDone=true;o.onclick=null;music();main()}}
  function main(){
    const o=ov();o.hidden=false;o.className='mmv';bg(true);o.onclick=null;if(G&&!NET.mp)G.running=false; /* alte Partie ruht im Hintergrund */
    const soon=(t,r)=>`<button class="mm-b mm-off" disabled>${tr(t)}<span class="mm-tag soon">${tr('Bald')} · ${r}</span></button>`;
    o.innerHTML=`<div class="mm-side"><div class="mm-crest">⚔</div><h1 class="mm-logo sm">Epochenkrieg</h1><p class="mm-by">Daveson ${tr('für')} Deus Vult Infidel</p>
      <nav class="mm-nav"><button class="mm-b mm-main" id="mmSp">${tr('Einzelspieler')}</button>
      <button class="mm-b" id="mmMp">${tr('Mehrspieler')}<span class="mm-tag beta">Beta</span></button>
      ${soon('Tutorial','Release 3')}${soon('Story','Release 4')}
      <button class="mm-b" id="mmOpt">${tr('Einstellungen')}</button><button class="mm-b" id="mmCred">${tr('Mitwirkende')}</button></nav>
      <div class="mm-foot"><div class="mm-lang">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div><small>${versionLabel()}</small></div></div>`;
    $('mmSp').onclick=()=>{sfx('click');single()};
    $('mmMp').onclick=()=>{music();if(window.Lobby){bg(false);Lobby.open()}};
    $('mmOpt').onclick=()=>openOpt('game');$('mmCred').onclick=()=>openOpt('cred');
    o.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{applyLang(b.dataset.l);main()})}
  function openOpt(tab){if(!menuOpen)toggleMenu();optTab=tab;renderOptions()}
  /* Einstellungen aus dem Hauptmenü: „Übernehmen“ schließt zurück zum Hauptmenü */
  const origOpt=renderOptions;window.renderOptions=function(){origOpt();if(document.body.classList.contains('mm')){const b=$('oBack');if(b)b.onclick=()=>toggleMenu()}};
  const slider=(id,list,cur,label)=>{const i=Math.max(0,list.findIndex(v=>v[0]===cur));return `<div class="mm-tile mm-sl"><b>${tr(label)}</b><input type="range" id="${id}" min="0" max="${list.length-1}" step="1" value="${i}">
    <div class="mm-ticks">${list.map((v,k)=>`<span data-k="${k}" class="${k===i?'on':''}">${tr(v[1])}</span>`).join('')}</div></div>`};
  /* Karten-Auswahl (bleibt gemerkt): Karte, Größe, Wasser, Gebirge, Jahreszeit; seed = Nummer der Karte (Vorschau und Start nutzen denselben Wert) */
  const SPK='ek-sp',WATERS=[[0,'Wenig'],[1,'Mittel'],[2,'Viel']],MOUNTS=[[0,'Keine'],[1,'Wenige'],[2,'Viele']];
  const SEAS=[['spring','Frühling','🌸'],['summer','Sommer','☀️'],['autumn','Herbst','🍂'],['winter','Winter','❄️'],['random','Zufall','🎲']];
  const SP=Object.assign({map:curMap,size:'L',water:1,mount:1,season:'summer'},(()=>{try{return JSON.parse(localStorage.getItem(SPK)||'{}')}catch(_){return{}}})());
  if(!MAPS[SP.map])SP.map='coast';if(!['S','M','L'].includes(SP.size))SP.size='L';SP.seed=(Math.random()*1e9)|0;spSize=SP.size;curMap=SP.map;
  const spSave=()=>{try{localStorage.setItem(SPK,JSON.stringify({map:SP.map,size:SP.size,water:SP.water,mount:SP.mount,season:SP.season}))}catch(_){}};
  const spOpts=()=>({seed:SP.seed,size:SP.size,water:SP.water,mount:SP.mount,season:SP.season});
  const code=n=>n.toString(36).toUpperCase().padStart(6,'0').slice(-6);
  function single(){
    const o=ov();o.className='mmv';bg(true);const wild=typeof wildAmt==='function'?wildAmt():'normal';
    o.innerHTML=`<div class="mm-sp"><div class="mm-head"><button class="mm-back" id="mmBack">‹ ${tr('Zurück')}</button><h2>${tr('Einzelspieler')}</h2></div>
      <div class="mm-grid">
        <section class="mm-col"><h3>${tr('Karte')}</h3>
          <div class="mm-pv"><div class="mm-frame"><canvas id="mmPv" width="720" height="480"></canvas><div class="mm-busy" id="mmBusy"><i></i></div></div>
            <div class="mm-pvbar"><div class="mm-pvt"><b id="mmPvName"></b><small id="mmPvInfo"></small></div>
              <div class="mm-dice"><button class="mm-d main" id="mmRand" title="${tr('Würfelt Kartenart, Wasser, Gebirge, Jahreszeit und Kartennummer')}">🎲 ${tr('Zufällige Karte')}</button><button class="mm-d" id="mmRe" title="${tr('Gleiche Einstellungen, neue Kartennummer')}">↻ ${tr('Neu würfeln')}</button></div></div>
            <div class="mm-leg"><span><i class="lg-b"></i>${tr('Dein Lager')}</span><span><i class="lg-r"></i>${tr('Gegner')}</span><span><i class="lg-g"></i>${tr('Gold')}</span><span><i class="lg-i"></i>${tr('Eisen')}</span><span><i class="lg-s"></i>${tr('Stein')}</span><span><i class="lg-o"></i>${tr('Öl')}</span><span><i class="lg-t"></i>${tr('Wald')}</span><span><i class="lg-f"></i>${tr('Fisch')}</span></div></div>
          <div class="mm-maps">${MAP_ORDER.map(k=>{const m=MAPS[k];return`<button class="mm-map" data-map="${k}" aria-pressed="${k===SP.map}" title="${tr(m.desc)}"><img data-pv="${k}" alt=""><b>${tr(m.name)}</b><small>${tr(m.desc)}</small></button>`}).join('')}</div></section>
        <section class="mm-col"><h3>${tr('Partie')}</h3>
          ${slider('mmSize',SIZES_SP,SP.size,'Kartengröße')}
          ${slider('mmWater',WATERS,SP.water,'Wasser')}${slider('mmMount',MOUNTS,SP.mount,'Gebirge')}<p class="mm-hint2" id="mmHint2"></p>
          <div class="mm-tile mm-sl"><b>${tr('Jahreszeit')}</b><div class="mm-seg" id="mmSeason">${SEAS.map(([k,n,ic])=>`<button data-se="${k}" aria-pressed="${k===SP.season}"><span>${ic}</span>${tr(n)}</button>`).join('')}</div></div>
          ${slider('mmDiff',DIFFS,diff,'Schwierigkeit')}${slider('mmWild',WILD,wild,'Wildtiere')}
          <h3>${tr('Gegner')}</h3><div class="mm-ai">${Object.entries(AI_STYLES).map(([k,v])=>`<button class="mm-tile mm-aib" data-as="${k}" aria-pressed="${k===aiStyle}"><span class="ic">${AI_ICON[k]||'⚔'}</span><b>${tr(v.name)}</b><small>${tr(v.desc)}</small></button>`).join('')}</div>
          <details class="mm-ctl"><summary>${tr('Steuerung')}</summary><dl class="ctl"><dt>${tr('Auswählen')}</dt><dd>${tr('Linksklick, Rahmen ziehen, Doppelklick für alle gleichen')}</dd><dt>${tr('Befehl')}</dt><dd>${tr('Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt')}</dd><dt>${tr('Kamera')}</dt><dd>${tr('WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt')}</dd><dt>${tr('Tasten')}</dt><dd>${tr('Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü')}</dd></dl></details>
        </section></div>
      <div class="mm-go"><button class="go" id="goBtn">${tr('Spiel starten')}</button></div></div>`;
    $('mmBack').onclick=()=>{sfx('click');MPV.stop();clearTimeout(pvT);clearTimeout(boardT);main()};
    let pvT=0,boardT=0;
    const pvCanvas=()=>$('mmPv'),sync=()=>{ /* Bedienelemente an SP angleichen (nach Würfeln) */
      o.querySelectorAll('[data-map]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.map===SP.map));
      o.querySelectorAll('[data-se]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.se===SP.season));
      for(const[id,list,v]of[['mmSize',SIZES_SP,SP.size],['mmWater',WATERS,SP.water],['mmMount',MOUNTS,SP.mount]]){const el=$(id),k=list.findIndex(q=>q[0]===v);el.value=k;el.parentNode.querySelectorAll('[data-k]').forEach(s=>s.classList.toggle('on',+s.dataset.k===k))}
      const h=MAP_HINT[SP.map]||['',''];$('mmHint2').textContent=tr('Wasser wirkt hier auf: {0}. Gebirge: {1}.',tr(h[0]),tr(h[1]));
      const m=MAPS[SP.map],sea=seasonOf(SP.season,SP.seed);$('mmPvName').textContent=tr(m.name);
      $('mmPvInfo').textContent=[tr(SEASON_NAMES[sea]),tr('Wasser')+': '+tr(WATERS[SP.water][1]),tr('Gebirge')+': '+tr(MOUNTS[SP.mount][1]),tr('Karte Nr.')+' '+code(SP.seed)].join(' · ')};
    /* nach jeder Änderung: Kacheln (gestaffelt), große Vorschau (kurz verzögert), Brett im Spielzimmer (noch später) */
    const refresh=(tiles)=>{spSave();curMap=SP.map;sync();
      if(tiles)MPV.fill(o,spOpts(),SP.map);
      const bz=$('mmBusy');if(bz)bz.classList.add('on');clearTimeout(pvT);pvT=setTimeout(()=>{if(!pvCanvas())return;try{MPV.big(pvCanvas(),SP.map,spOpts(),3)}catch(err){console.warn(err)}const b2=$('mmBusy');if(b2)b2.classList.remove('on')},tiles?160:90);
      clearTimeout(boardT);boardT=setTimeout(()=>{if(typeof ROOM==='undefined'||!ROOM.on||!pvCanvas())return;const k=JSON.stringify([SP.map,spOpts()]);if(k===ROOM.pkey)return;ROOM.pkey=k;
        try{newGame(diff,false,{map:SP.map,aiStyle,size:SP.size,seed:SP.seed,water:SP.water,mount:SP.mount,season:SP.season});G.running=false;music()}catch(err){console.warn(err)}},700)};
    o.querySelectorAll('[data-map]').forEach(b=>{b.onclick=()=>{sfx('click');SP.map=b.dataset.map;refresh(false)}});
    o.querySelectorAll('[data-se]').forEach(b=>{b.onclick=()=>{sfx('click');SP.season=b.dataset.se;refresh(true)}});
    o.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{aiStyle=b.dataset.as;o.querySelectorAll('[data-as]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
    const bindSl=(id,list,set)=>{const el=$(id),upd=()=>{const k=+el.value;set(list[k][0]);el.parentNode.querySelectorAll('[data-k]').forEach(s=>s.classList.toggle('on',+s.dataset.k===k))};el.oninput=upd;el.parentNode.querySelectorAll('[data-k]').forEach(s=>s.onclick=()=>{el.value=s.dataset.k;upd()})};
    bindSl('mmSize',SIZES_SP,v=>{SP.size=v;spSize=v;refresh(true)});bindSl('mmWater',WATERS,v=>{SP.water=v;refresh(true)});bindSl('mmMount',MOUNTS,v=>{SP.mount=v;refresh(true)});
    bindSl('mmDiff',DIFFS,v=>diff=v);bindSl('mmWild',WILD,v=>{try{localStorage.setItem('ek-wild',v)}catch(_){}});
    /* Würfeln: „Zufällige Karte“ würfelt alles, „Neu würfeln“ nur die Kartennummer (gleiche Einstellungen) */
    $('mmRand').onclick=()=>{sfx('click');const pick=l=>l[(Math.random()*l.length)|0];let m;do{m=pick(MAP_ORDER)}while(m===SP.map&&MAP_ORDER.length>1);SP.map=m;SP.water=(Math.random()*3)|0;SP.mount=(Math.random()*3)|0;SP.season=pick(SEASON_IDS);SP.seed=(Math.random()*1e9)|0;refresh(true)};
    $('mmRe').onclick=()=>{sfx('click');SP.seed=(Math.random()*1e9)|0;refresh(true)};
    $('goBtn').onclick=()=>{music();MPV.stop();clearTimeout(pvT);clearTimeout(boardT);$('goBtn').disabled=true;$('goBtn').textContent=tr('Karte wird erzeugt …');requestAnimationFrame(()=>setTimeout(()=>{bg(false);o.className='';
      newGame(diff,false,{map:SP.map,aiStyle,size:SP.size,seed:SP.seed,water:SP.water,mount:SP.mount,season:SP.season});if(typeof ROOM!=='undefined')ROOM.pkey=null;G.running=true;G.started=true;o.hidden=true;toast(tr('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.'))},20))};
    refresh(true)}
  /* Einstieg: beim ersten Mal Ladebildschirm, danach (Neues Spiel, Zurück aus der Lobby) direkt Hauptseite */
  window.showStart=function(){if(NET.mp){endMP();if(window.Lobby)Lobby.leave()}if(splashDone)main();else splash()};
})();
