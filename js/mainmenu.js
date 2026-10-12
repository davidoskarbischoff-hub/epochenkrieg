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
  function single(){
    const o=ov();o.className='mmv';bg(true);const wild=typeof wildAmt==='function'?wildAmt():'normal';
    o.innerHTML=`<div class="mm-sp"><div class="mm-head"><button class="mm-back" id="mmBack">‹ ${tr('Zurück')}</button><h2>${tr('Einzelspieler')}</h2></div>
      <div class="mm-grid">
        <section class="mm-col"><h3>${tr('Karte')}</h3><div class="mm-maps">${Object.entries(MAPS).map(([k,m])=>`<button class="mm-map" data-map="${k}" aria-pressed="${k===curMap}" title="${tr(m.desc)}"><img src="${mapPreview(k)}" alt=""><b>${tr(m.name)}</b><small>${tr(m.desc)}</small></button>`).join('')}</div></section>
        <section class="mm-col"><h3>${tr('Partie')}</h3>
          ${slider('mmSize',SIZES_SP,spSize,'Kartengröße')}${slider('mmDiff',DIFFS,diff,'Schwierigkeit')}${slider('mmWild',WILD,wild,'Wildtiere')}
          <h3>${tr('Gegner')}</h3><div class="mm-ai">${Object.entries(AI_STYLES).map(([k,v])=>`<button class="mm-tile mm-aib" data-as="${k}" aria-pressed="${k===aiStyle}"><span class="ic">${AI_ICON[k]||'⚔'}</span><b>${tr(v.name)}</b><small>${tr(v.desc)}</small></button>`).join('')}</div>
          <details class="mm-ctl"><summary>${tr('Steuerung')}</summary><dl class="ctl"><dt>${tr('Auswählen')}</dt><dd>${tr('Linksklick, Rahmen ziehen, Doppelklick für alle gleichen')}</dd><dt>${tr('Befehl')}</dt><dd>${tr('Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt')}</dd><dt>${tr('Kamera')}</dt><dd>${tr('WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt')}</dd><dt>${tr('Tasten')}</dt><dd>${tr('Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü')}</dd></dl></details>
        </section></div>
      <div class="mm-go"><button class="go" id="goBtn">${tr('Spiel starten')}</button></div></div>`;
    $('mmBack').onclick=()=>{sfx('click');main()};
    /* Spielzimmer: das Brett auf dem Tisch zeigt die gewählte Karte (auch beim Drüberfahren) in der gewählten Grösse; derselbe Zufallswert gilt beim Start */
    let pvT=0;const pseed=(Math.random()*1e9)|0,preview=(m,sz)=>{clearTimeout(pvT);pvT=setTimeout(()=>{if(!window.ROOM||!ROOM.on)return;const k=m+'|'+sz;if(k===ROOM.pkey)return;ROOM.pkey=k;try{newGame(diff,false,{map:m,aiStyle,size:sz,seed:pseed});G.running=false;music()}catch(err){console.warn(err)}},300)};
    o.querySelectorAll('[data-map]').forEach(b=>{b.onclick=()=>{curMap=b.dataset.map;o.querySelectorAll('[data-map]').forEach(x=>x.setAttribute('aria-pressed',x===b));preview(curMap,spSize)};b.onmouseenter=()=>preview(b.dataset.map,spSize);b.onmouseleave=()=>preview(curMap,spSize)});
    preview(curMap,spSize);
    o.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{aiStyle=b.dataset.as;o.querySelectorAll('[data-as]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
    const bindSl=(id,list,set)=>{const el=$(id),upd=()=>{const k=+el.value;set(list[k][0]);el.parentNode.querySelectorAll('[data-k]').forEach(s=>s.classList.toggle('on',+s.dataset.k===k))};el.oninput=upd;el.parentNode.querySelectorAll('[data-k]').forEach(s=>s.onclick=()=>{el.value=s.dataset.k;upd()})};
    bindSl('mmSize',SIZES_SP,v=>{spSize=v;preview(curMap,v)});bindSl('mmDiff',DIFFS,v=>diff=v);bindSl('mmWild',WILD,v=>{try{localStorage.setItem('ek-wild',v)}catch(_){}});
    $('goBtn').onclick=()=>{music();$('goBtn').disabled=true;$('goBtn').textContent=tr('Karte wird erzeugt …');requestAnimationFrame(()=>setTimeout(()=>{bg(false);o.className='';
      newGame(diff,false,{map:curMap,aiStyle,size:spSize,seed:pseed});if(window.ROOM)ROOM.pkey=null;G.running=true;G.started=true;o.hidden=true;toast(tr('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.'))},20))}}
  /* Einstieg: beim ersten Mal Ladebildschirm, danach (Neues Spiel, Zurück aus der Lobby) direkt Hauptseite */
  window.showStart=function(){if(NET.mp){endMP();if(window.Lobby)Lobby.leave()}if(splashDone)main();else splash()};
})();
