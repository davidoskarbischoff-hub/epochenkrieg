/* Hauptmenü: Ladebildschirm (einmal beim Start) → Hauptseite (Einzelspieler, Mehrspieler, Tutorial, Story, Einstellungen, Mitwirkende)
   → Einzelspieler-Einstellungen mit Kacheln und Reglern. Im Hintergrund fährt die Kamera langsam über die Karte. Ersetzt showStart() aus ui.js. */
(()=>{
  let splashDone=false,spSize='L';
  const SIZES_SP=[['S','Klein'],['M','Mittel'],['L','Groß']],DIFFS=[['leicht','Leicht'],['normal','Normal'],['schwer','Schwer']],WILD=[['none','Keine'],['half','Wenige'],['normal','Normal'],['double','Viele']];
  const AI_ICON={balanced:'⚖',turtle:'🛡',rush:'⚔',eco:'⚒',boom:'▲',random:'🎲'};
  const ov=()=>$('overlay');
  const music=()=>{try{if(typeof SND!=='undefined'){SND.init();SND.setEpoch(7)}}catch(_){}}; /* Menümusik: Smetana, Die Moldau (PIECES[7]) */
  /* Hintergrund: Bedienelemente des Spiels ausblenden, Kamera fährt langsam */
  function bg(on){document.body.classList.toggle('mm',on);if(on&&!bg.raf){const t0=performance.now();const fly=()=>{if(!document.body.classList.contains('mm')){bg.raf=0;return}const t=(performance.now()-t0)/1000*.025;
    if(typeof cam!=='undefined'&&typeof W!=='undefined'){const hq=G&&G.ents.find(e=>e.type==='hq'&&e.team===0)||{x:W/2,y:H/2};cam.x=hq.x+Math.cos(t*4)*260;cam.y=hq.y+Math.sin(t*4)*180;cam.z=.9;clampCam()}bg.raf=requestAnimationFrame(fly)};bg.raf=requestAnimationFrame(fly)}}
  /* Titelbild: Wenn images/titel.jpg (oder .png/.webp) existiert, liegt es auf dem Kartondeckel; sonst gemalte Platzhalter-Grafik (SVG). */
  const TITLE_FILES=['images/titel.jpg','images/titel.png','images/titel.webp'];let titleSrc;
  const PLACEHOLDER=`<svg class="mm-svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="mmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2c4a"/><stop offset=".45" stop-color="#7a4a58"/><stop offset=".75" stop-color="#d98a55"/><stop offset="1" stop-color="#f3c373"/></linearGradient>
    <radialGradient id="mmSun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2c4"/><stop offset=".35" stop-color="#ffd27a" stop-opacity=".85"/><stop offset="1" stop-color="#ffb457" stop-opacity="0"/></radialGradient></defs>
    <rect width="600" height="400" fill="url(#mmSky)"/><circle cx="300" cy="236" r="150" fill="url(#mmSun)"/>
    <g fill="#f6dfb0" opacity=".7"><circle cx="70" cy="50" r="1.6"/><circle cx="150" cy="86" r="1.2"/><circle cx="470" cy="60" r="1.5"/><circle cx="540" cy="110" r="1.1"/><circle cx="380" cy="40" r="1.2"/><circle cx="230" cy="30" r="1.4"/></g>
    <path d="M0 262 L70 218 L130 250 L205 196 L290 258 L360 214 L440 252 L520 208 L600 246 V400 H0Z" fill="#5b3b4d" opacity=".9"/>
    <path d="M0 300 Q120 262 240 292 T480 284 T600 296 V400 H0Z" fill="#35273a"/>
    <g fill="#150f17"><path d="M0 332 Q150 304 300 326 T600 320 V400 H0Z"/>
      <path d="M44 322 L70 284 L96 322Z"/><path d="M62 322 L70 300 L78 322Z" fill="#35273a"/>
      <path d="M118 322 q0 -26 24 -26 q24 0 24 26Z"/><path d="M200 324 V292 h8 v8 h8 v-8 h8 v8 h8 v-8 h8 v32Z"/><path d="M214 324 V308 a8 8 0 0 1 16 0 V324Z" fill="#35273a"/>
      <path d="M290 326 V262 h22 V326Z"/><path d="M286 262 h30 l-15 -20Z"/>
      <path d="M352 326 V294 h58 V326Z"/><path d="M362 294 V268 h9 V294Z M382 294 V258 h9 V294Z"/>
      <path d="M440 326 V296 l22 -10 l22 10 V326Z"/><path d="M500 328 V300 h46 V328Z"/><path d="M510 300 l18 -12 l18 12Z"/></g>
    <g fill="#150f17" opacity=".85"><path d="M440 120 l30 -3 l8 -9 l3 9 l24 3 l-24 5 l-3 9 l-8 -9Z"/><path d="M90 150 l18 -2 l5 -5 l2 5 l14 2 l-14 3 l-2 5 l-5 -5Z"/></g></svg>`;
  function titleArt(cls){return `<div class="mm-art ${cls||''}">${PLACEHOLDER}<img class="mm-img" alt="" hidden></div>`}
  function loadTitle(root){const img=root.querySelector('.mm-img');if(!img)return;const show=src=>{img.onload=()=>{img.hidden=false;document.body.classList.add('title-img');const sv=root.querySelector('.mm-svg');if(sv)sv.style.display='none'};img.src=src};
    if(titleSrc!==undefined){if(titleSrc)show(titleSrc);return}
    const next=i=>{if(i>=TITLE_FILES.length){titleSrc='';return}const t=new Image();t.onload=()=>{titleSrc=TITLE_FILES[i];show(titleSrc)};t.onerror=()=>next(i+1);t.src=TITLE_FILES[i]};next(0)}
  /* Ladebildschirm als Brettspiel-Karton: Deckel mit Titelbild, Fortschritt als Aufbau-Meldungen; Klick hebt den Deckel ab und gibt das Spielzimmer frei */
  const LOAD_MSG=[[0,'Der Karton wird bereitgestellt …'],[22,'Das Spielbrett wird ausgeklappt …'],[48,'Die Figuren werden aufgestellt …'],[72,'Wälder werden gepflanzt …'],[90,'Die Lampe wird angezündet …']];
  function splash(){
    const o=ov();o.hidden=false;o.className='mmv';bg(true);
    o.innerHTML=`<div class="mm-splash"><div class="mm-box" id="mmBox"><div class="mm-tray"><div class="mm-in"><div class="mm-sheet"><b>Epochenkrieg</b></div></div><div class="mm-wall f"></div><div class="mm-wall r"></div></div><div class="mm-lid">
        ${titleArt('lid')}<div class="mm-label"><h1 class="mm-logo">Epochenkrieg</h1><p class="mm-tag2">${tr('Das Strategiespiel von der Steinzeit bis zur Neuzeit')}</p></div>
        <div class="mm-foil"><span>${tr('1–4 Spieler')}</span><span>${tr('7 Zeitalter')}</span></div></div></div>
      <div class="mm-load"><div class="mm-bar"><i id="mmBar"></i></div><p class="mm-hint" id="mmHint">${tr(LOAD_MSG[0][1])}</p><p class="mm-by">Daveson ${tr('für')} Deus Vult Infidel</p></div></div>`;
    loadTitle(o);
    const t0=performance.now();let p=0,shown=-1;
    const roomOk=()=>{try{return typeof R3==='undefined'||!R3.ok||(typeof OPT!=='undefined'&&OPT.room===false)||(typeof ROOM!=='undefined'&&ROOM.ready&&!!ROOM.sky)}catch(_){return true}};
    const tick=()=>{if(splashDone)return;const ready=(typeof EKMODELS==='undefined'||EKMODELS.ready)&&roomOk()||performance.now()-t0>60000;
      p=Math.min(ready?100:92,p+(ready?4:Math.max(.15,(92-p)*.012)));const b=$('mmBar');if(b)b.style.width=p+'%';
      let k=0;LOAD_MSG.forEach((m,i)=>{if(p>=m[0])k=i});const h=$('mmHint');
      if(p>=100){if(h)h.textContent=tr('Klicken, um den Karton zu öffnen');o.classList.add('mm-ready')}else if(h&&k!==shown){shown=k;h.textContent=tr(LOAD_MSG[k][1])}
      setTimeout(tick,60)};tick();
    /* Öffnen: Deckel hebt ab (CSS-3D, ca. 3 s), Kamera taucht in den Karton, dann Spielzimmer; Klick/Taste überspringt, OPT.intro=false = sofort */
    let fin=null;const done=()=>{if(!fin)return;if(fin)fin();fin=null;document.removeEventListener('keydown',skip,true);o.classList.remove('mm-opening','mm-diving');main()};
    const skip=e=>{if(e&&e.type==='keydown'&&['Shift','Control','Alt','Meta'].includes(e.key))return;if(e)e.stopPropagation();done()};
    o.onclick=()=>{if(fin){done();return}if(!o.classList.contains('mm-ready'))return;splashDone=true;music();try{sfx('click')}catch(_){}
      if(typeof OPT!=='undefined'&&OPT.intro===false){o.onclick=null;main();return}
      o.classList.add('mm-opening');const ts=[setTimeout(()=>{try{sfx('click')}catch(_){}},900),setTimeout(()=>o.classList.add('mm-diving'),1500),setTimeout(()=>done(),3200)];
      fin=()=>ts.forEach(clearTimeout);const f0=fin;fin=()=>{f0()};document.addEventListener('keydown',skip,true)}}
  function main(){
    const o=ov();o.hidden=false;o.className='mmv';bg(true);o.onclick=null;if(G&&!NET.mp)G.running=false; /* alte Partie ruht im Hintergrund */
    const soon=(t,r)=>`<button class="mm-b mm-off" disabled>${tr(t)}<span class="mm-tag soon">${tr('Bald')} · ${r}</span></button>`;
    o.innerHTML=`<div class="mm-side">${titleArt('mini')}<h1 class="mm-logo sm">Epochenkrieg</h1><p class="mm-by">Daveson ${tr('für')} Deus Vult Infidel</p>
      <nav class="mm-nav"><button class="mm-b mm-main" id="mmSp">${tr('Einzelspieler')}</button>
      <button class="mm-b" id="mmMp">${tr('Mehrspieler')}<span class="mm-tag beta">Beta</span></button>
      ${soon('Tutorial','Release 3')}${soon('Story','Release 4')}
      <button class="mm-b" id="mmOpt">${tr('Einstellungen')}</button><button class="mm-b" id="mmCred">${tr('Mitwirkende')}</button></nav>
      <div class="mm-foot"><div class="mm-lang">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div><small>${versionLabel()}</small></div></div>`;
    loadTitle(o);
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
