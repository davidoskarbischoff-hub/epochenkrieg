/* Epochenkrieg – Zeitalter-Baum (Taste T, Knopf „Baum“): Zeitleiste mit Bildern je Zeitalter, Details zum gewählten Zeitalter
   (neue Einheiten/Gebäude als Bilder, Aufstiegskosten), darunter die Nationen der Weltkriegszeit mit Flaggen und Spezialeinheiten.
   Ersetzt openTree aus ui.js (wird danach geladen); closeTree bleibt dort. Bilder kommen aus ICON3.thing (werden nach und nach gemalt). */
const FLAG_SVG={
  at:'<rect width="30" height="40" fill="#fff"/><rect width="30" height="13.3" fill="#c8102e"/><rect y="26.7" width="30" height="13.3" fill="#c8102e"/><rect x="30" width="30" height="40" fill="#fff"/><rect x="30" width="30" height="13.3" fill="#c8102e"/><rect x="30" y="26.7" width="30" height="13.3" fill="#477050"/><circle cx="30" cy="20" r="6" fill="#e7c24a" stroke="#6b4a10"/>',
  de:'<rect width="60" height="13.4" fill="#111"/><rect y="13.3" width="60" height="13.4" fill="#fff"/><rect y="26.6" width="60" height="13.4" fill="#d1121c"/>',
  ru:'<rect width="60" height="13.4" fill="#fff"/><rect y="13.3" width="60" height="13.4" fill="#2a4fa0"/><rect y="26.6" width="60" height="13.4" fill="#d1121c"/>',
  ot:'<rect width="60" height="40" fill="#c8102e"/><circle cx="25" cy="20" r="10" fill="#fff"/><circle cx="28" cy="20" r="8" fill="#c8102e"/><polygon points="38,20 33.5,21.6 34.3,16.9 37.3,20.5 32.6,18.3" fill="#fff"/>',
  uk:'<rect width="60" height="40" fill="#1f3c88"/><path d="M0,0 60,40M60,0 0,40" stroke="#fff" stroke-width="8"/><path d="M0,0 60,40M60,0 0,40" stroke="#c8102e" stroke-width="3"/><path d="M30,0V40M0,20H60" stroke="#fff" stroke-width="12"/><path d="M30,0V40M0,20H60" stroke="#c8102e" stroke-width="7"/>',
  it:'<rect width="20" height="40" fill="#008c45"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#cd212a"/><rect x="25.5" y="13" width="9" height="12" rx="1.5" fill="#cd212a" stroke="#1f4fa0" stroke-width="1.2"/><path d="M30,14.5V23.5M26.8,19H33.2" stroke="#fff" stroke-width="2"/>',
  jp:'<rect width="60" height="40" fill="#fff"/>'+Array.from({length:16},(_,i)=>{const a=i/16*6.283,b=a+.2;return`<polygon points="24,20 ${24+Math.cos(a)*60},${20+Math.sin(a)*60} ${24+Math.cos(b)*60},${20+Math.sin(b)*60}" fill="#c8102e"/>`}).join('')+'<circle cx="24" cy="20" r="9" fill="#c8102e"/>',
  fr:'<rect width="20" height="40" fill="#1f3c9a"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#e1252f"/>',
  us:Array.from({length:13},(_,i)=>`<rect y="${i*40/13}" width="60" height="${40/13+.1}" fill="${i%2?'#fff':'#b31942'}"/>`).join('')+'<rect width="26" height="21.5" fill="#0a3161"/>'+Array.from({length:20},(_,i)=>`<circle cx="${3+(i%5)*5}" cy="${3+Math.floor(i/5)*5}" r="1.1" fill="#fff"/>`).join('')
};
const flagSVG=(k,col)=>`<svg class="flg" viewBox="0 0 60 40" preserveAspectRatio="none" aria-hidden="true">${FLAG_SVG[k]||`<rect width="60" height="40" fill="${col||'#888'}"/>`}<rect width="60" height="40" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/></svg>`;
let treeEra=null;
/* Einheiten/Gebäude, die in Zeitalter i neu dazukommen (ohne Nationen-Einheiten) */
const treeNew=i=>({u:Object.entries(UNITS).filter(([t,d])=>(d.ep||0)===i&&!d.nation).map(([t])=>t),b:Object.entries(BLDS).filter(([t,d])=>(d.ep||0)===i&&t!=='hq').map(([t])=>t),
  t:(typeof TECHS!=='undefined'?TECHS:[]).filter(x=>x.ep===i).length});
const timg=(kind,type,ep,cls)=>`<img class="${cls||'ti'}" data-k="${kind}|${type}|${ep}" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">`;
/* Bilder nach und nach malen, damit das Fenster sofort aufgeht */
function treePaint(el){const imgs=[...el.querySelectorAll('img[data-k]')];let i=0;const tick=()=>{if(!treeOpen)return;const t0=performance.now();
  while(i<imgs.length&&performance.now()-t0<25){const im=imgs[i++],[k,t,ep]=im.dataset.k.split('|');try{const u=ICON3.thing(k,t,+ep);if(u){im.src=u;im.classList.add('ok')}}catch(_){}}
  if(i<imgs.length)setTimeout(tick,0)};tick()}
openTree=function(mode){
  if(!G)return;const wasOpen=treeOpen;treeOpen=true;treeMode=mode;const el=$('tree')||(()=>{const d=document.createElement('div');d.id='tree';document.getElementById('app').appendChild(d);return d})();
  if(!wasOpen){if(G.running&&!G.paused&&!G.mp){G.paused=true;treePaused=true}else treePaused=false}
  const ep=G.epoch[0],my=G.nation[0],pick=mode==='pick';if(treeEra===null||treeEra>6)treeEra=pick?6:ep;const sel=treeEra;
  const state=i=>i<ep?'done':i===ep?'cur':'lock',lab={done:'✓ '+tr('erreicht'),cur:'● '+tr('jetzt'),lock:'🔒 '+tr('kommt noch')};
  const tiles=EPOCHS.map((e,i)=>`<button class="et ${state(i)} ${i===sel?'sel':''}" data-e="${i}" style="--c:${LVLC[i]}">${timg('bld','hq',i,'ehq')}<span class="en"><i>${LVLN[i]}</i>${tr(e.name)}</span><span class="es">${lab[state(i)]}</span>${i===6?'<span class="efork" title="'+tr('Hier wählst du eine Nation')+'">⚑</span>':''}</button>`).join('<span class="econ"></span>');
  const n=treeNew(sel),nm=x=>tr(x.name),cost=EPOCHS[sel-1]&&sel>0?EPOCHS[sel-1].cost:null;
  const card=(kind,t)=>{const d=kind==='unit'?UNITS[t]:BLDS[t];return`<div class="tc">${timg(kind,t,sel)}<span>${nm(d)}</span></div>`};
  const detail=`<div class="edet" style="--c:${LVLC[sel]}"><div class="edh"><b>${LVLN[sel]} · ${tr(EPOCHS[sel].name)}</b>${cost?`<span class="ecost">${tr('Aufstieg hierher')}: ${costHTML(cost)} · ${tr('{0} Arbeiter',wkNeed(sel-1))}</span>`:`<span class="ecost">${tr('Startzeitalter')}</span>`}</div>
    <div class="erow"><h4>${tr('Neue Einheiten')}</h4><div class="tcs">${n.u.length?n.u.map(t=>card('unit',t)).join(''):'<i class="none">–</i>'}</div></div>
    <div class="erow"><h4>${tr('Neue Gebäude')}</h4><div class="tcs">${n.b.length?n.b.map(t=>card('bld',t)).join(''):'<i class="none">–</i>'}</div></div>
    ${n.t?`<div class="etech">${tr('{0} neue Technologien',n.t)}</div>`:''}</div>`;
  const groups={};for(const [k,v] of Object.entries(NATIONS))(groups[v.grp]=groups[v.grp]||[]).push(k);
  const nat=k=>{const v=NATIONS[k],s=my===k;return`<button class="nat2 ${s?'sel':''} ${my&&!s?'dim':''} ${pick?'pick':''}" data-n="${k}" ${pick?'':'tabindex="-1"'}>${flagSVG(k,v.col)}<span class="nh"><b>${tr(v.name)}</b><small>${tr(v.reg)}</small></span>
    <span class="nb">★ ${tr(v.bonus)}</span><span class="nsp">${v.sp.map(u=>`<span class="nu">${timg('unit',u,6,'ti sm')}<small>${tr(UNITS[u].name)}</small></span>`).join('')}</span></button>`};
  el.innerHTML=`<div class="gm"><div class="gm-frame wide tree2"><h1 class="gm-title sm">${tr(pick?'Wähle deine Nation':'Zeitalter-Baum')}</h1><div class="gm-rule"></div>
   <div class="etl">${tiles}</div>
   <p class="thint">${tr(pick?'Mit dem Aufstieg in die Weltkriegszeit entscheidest du dich für eine Nation. Sie bestimmt Bonus und Spezialeinheiten.':'Klicke ein Zeitalter an, um zu sehen, was es Neues bringt. In der Weltkriegszeit wählst du eine Nation.')}</p>
   ${pick?'':detail}
   <h3 class="nt">${flagSVG('de')}${tr('Nationen der Weltkriegszeit')}</h3>
   <div class="natgrid2">${Object.entries(groups).map(([g,ks])=>`<div class="ng"><h4>${tr(g)}</h4>${ks.map(nat).join('')}</div>`).join('')}</div>
   <div class="btnrow"><button class="btn2" id="treeClose">${tr(pick?'Abbrechen':'Schließen')}</button></div></div></div>`;
  el.hidden=false;
  el.querySelector('#treeClose').onclick=()=>{treeEra=null;closeTree()};
  el.querySelectorAll('.et').forEach(b=>b.onclick=()=>{treeEra=+b.dataset.e;openTree(mode)});
  if(pick)el.querySelectorAll('.nat2').forEach(b=>b.onclick=()=>{const k=b.dataset.n;treeEra=null;closeTree();advance(0,k)});
  treePaint(el);
};
