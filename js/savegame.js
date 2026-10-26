/* Epochenkrieg – Spielstand speichern/laden (nur Einzelspieler).
   Prinzip: Die Karte wird aus Seed + Optionen neu erzeugt (newGame, ist immer dieselbe), danach wird der Spielzustand darübergelegt:
   alle Einheiten, Gebäude, Tiere und Vorkommen, Rohstoffe, Zeitalter, Technologien, Aufträge (Upgrades), KI-Zustand, erkundeter Nebel, Kamera.
   Ein Schnellspeicher-Platz (IndexedDB, Ersatz localStorage) plus kleine Info (Zeitstempel) in localStorage `ek-save-meta`.
   Mehrspieler wird nicht gespeichert (der Spielstand dort liegt beim Gastgeber, Gäste sehen nur Schnappschüsse). */
'use strict';
const SAVE=(()=>{
  const VER=2,META='ek-save-meta',META2='ek-save-meta2',DB='ek-saves';
  /* ---------- Kodierung: Map/Set/Uint8Array und Verweise auf Entitäten werden markiert ---------- */
  const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s)};
  const unb64=s=>{const t=atob(s),u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i);return u};
  /* Felder, die nur Darstellung/Zwischenspeicher sind und beim Laden neu entstehen */
  const SKIP=k=>k[0]==='_'||k==='pf'||k==='tsId'||k==='tsP'||k==='obj'||k==='upj';
  function enc(v,stack){
    if(v===null||v===undefined)return null;
    const t=typeof v;if(t==='number')return Number.isFinite(v)?v:null;if(t==='boolean'||t==='string')return v;if(t==='function')return null;
    if(stack.has(v))return null;
    if(v.id!==undefined&&v.kind&&G.byId.get(v.id)===v)return{$E:v.id};
    stack.add(v);let out;
    if(v instanceof Map)out={$M:[...v].map(([k,x])=>[enc(k,stack),enc(x,stack)])};
    else if(v instanceof Set)out={$S:[...v].map(x=>enc(x,stack))};
    else if(v instanceof Uint8Array)out={$U:b64(v)};
    else if(ArrayBuffer.isView(v))out=null;
    else if(Array.isArray(v))out=v.map(x=>enc(x,stack));
    else{out={};for(const k in v){if(SKIP(k))continue;const x=enc(v[k],stack);if(x!==null||v[k]===null)out[k]=x}}
    stack.delete(v);return out}
  function dec(v){
    if(v===null||typeof v!=='object')return v;
    if(Array.isArray(v))return v.map(dec);
    if(v.$M)return new Map(v.$M.map(([k,x])=>[dec(k),dec(x)]));
    if(v.$S)return new Set(v.$S.map(dec));
    if(v.$U!==undefined)return unb64(v.$U);
    if(v.$E!==undefined)return{$E:v.$E};
    const o={};for(const k in v)o[k]=dec(v[k]);return o}
  /* Platzhalter {$E:id} durch die echte Entität ersetzen (nachdem alle angelegt sind) */
  function resolve(v,seen){
    if(v===null||typeof v!=='object'||seen.has(v))return v;
    if(v.$E!==undefined&&Object.keys(v).length===1)return G.byId.get(v.$E)||null;
    seen.add(v);
    if(Array.isArray(v)){for(let i=0;i<v.length;i++)v[i]=resolve(v[i],seen)}
    else if(v instanceof Map){for(const [k,x] of v)v.set(k,resolve(x,seen))}
    else if(v instanceof Set){const a=[...v].map(x=>resolve(x,seen));v.clear();a.forEach(x=>v.add(x))}
    else if(!ArrayBuffer.isView(v)){for(const k in v)v[k]=resolve(v[k],seen)}
    return v}
  /* ---------- Speicherort: 3 manuelle Plätze + Auto-Platz ---------- */
  const SLOTS=['auto','s1','s2','s3'],KEYOF={auto:'auto',s1:'quick',s2:'s2',s3:'s3'};
  const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
  const lsKey=sl=>'ek-save-data-'+sl;
  async function put(sl,txt){
    try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('s','readwrite');t.objectStore('s').put(txt,KEYOF[sl]);t.oncomplete=res;t.onerror=()=>rej(t.error)});d.close();return true}catch(_){}
    try{localStorage.setItem(lsKey(sl),txt);return true}catch(_){return false}}
  async function get(sl){
    try{const d=await idb();const v=await new Promise((res,rej)=>{const r=d.transaction('s').objectStore('s').get(KEYOF[sl]);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});d.close();if(v)return v}catch(_){}
    try{return localStorage.getItem(lsKey(sl))||(sl==='s1'?localStorage.getItem('ek-save-data'):null)}catch(_){return null}}
  async function del(sl){
    try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('s','readwrite');t.objectStore('s').delete(KEYOF[sl]);t.oncomplete=res;t.onerror=()=>rej(t.error)});d.close()}catch(_){}
    try{localStorage.removeItem(lsKey(sl));if(sl==='s1')localStorage.removeItem('ek-save-data')}catch(_){}
    const m=metas();delete m[sl];setMetas(m)}
  /* kleine Infos (Zeitstempel, Spielzeit, Zeitalter) für die Liste, ohne die Daten zu lesen */
  function metas(){let m={};try{m=JSON.parse(localStorage.getItem(META2)||'null')||{}}catch(_){}
    if(!m.s1){try{const o=JSON.parse(localStorage.getItem(META)||'null');if(o)m.s1={ts:o.ts,t:o.t,ep:o.ep||0,kb:o.kb}}catch(_){}}return m}
  function setMetas(m){try{localStorage.setItem(META2,JSON.stringify(m));localStorage.removeItem(META)}catch(_){}}
  const metaOf=(d,len)=>({ts:d.ts||Date.now(),t:Math.round(d.g&&d.g.t||0),ep:(d.g&&d.g.epoch&&d.g.epoch[0])||0,kb:Math.round(len/1024)});
  /* ---------- Speichern ---------- */
  const can=()=>!!(G&&G.running&&G.sv&&!G.mp&&!NET.mp&&!G.over);
  function snapshot(){
    const S=new Set(),ents=[];
    for(const e of G.ents){if(e.dead)continue;const o={};
      /* enc() würde die Entität selbst als {$E} ablegen – deshalb die Felder einzeln kodieren */
      for(const k in e){if(SKIP(k))continue;const x=enc(e[k],S);if(x!==null||e[k]===null)o[k]=x}
      if(e.upj&&G.jobs[e.upj.team]){const i=G.jobs[e.upj.team].indexOf(e.upj);if(i>=0)o.upj=[e.upj.team,i]}
      ents.push(o)}
    const g={};for(const k of['t','nid','res','epoch','adv','jobs','rs','nation','speed','over','overShown','alertT','alertT1','aiT','stats','bones','forestCut','late','healT','eraT','rcT','tech','mem','ai'])g[k]=enc(G[k],S);
    const ex=new Uint8Array(exF.length);for(let i=0;i<exF.length;i++)ex[i]=Math.min(255,Math.round(exF[i]*255));
    return{v:VER,ts:Date.now(),diff,sv:G.sv,aiStyle,cam:{x:cam.x,y:cam.y,z:cam.z,yaw:cam.tyaw,pitch:cam.tpitch},g,ents,fog:b64(ex),
      adv:{strat:advisor.strat,auto:advisor.auto,ignore:advisor.ignore}}}
  /* quiet = Auto-Speichern: keine Warnung, wenn es nicht geht */
  async function save(sl,quiet){
    sl=sl||'s1';
    if(!can()){if(!quiet)toast(tr('Gespeichert werden kann nur im laufenden Einzelspieler.'),'warn');return false}
    let txt,d,ms;try{const t0=performance.now();d=snapshot();txt=JSON.stringify(d);ms=performance.now()-t0}catch(e){console.warn('save',e);if(!quiet)toast(tr('Speichern fehlgeschlagen.'),'warn');return false}
    api.lastMs=ms;
    const ok=await put(sl,txt);
    if(!ok){if(!quiet)toast(tr('Speichern fehlgeschlagen.'),'warn');return false}
    const m=metas();m[sl]=metaOf(d,txt.length);setMetas(m);
    toast(sl==='auto'?tr('Automatisch gespeichert.'):tr('Spielstand gespeichert.'));return true}
  /* ---------- Auto-Speichern: alle 5 Spielminuten, Option OPT.autosave ---------- */
  const AUTO_EVERY=300;let autoLast=null,autoBusy=false;
  function tick(){
    if(OPT.autosave===false||!can()||G.paused||autoBusy)return;
    if(autoLast===null||G.t<autoLast)autoLast=G.t;
    if(G.t-autoLast<AUTO_EVERY)return;
    autoLast=G.t;autoBusy=true;
    setTimeout(()=>{save('auto',true).finally(()=>{autoBusy=false})},0)}
  /* ---------- Laden ---------- */
  async function read(sl){
    const txt=await get(sl||'s1');if(!txt){toast(tr('Kein Spielstand vorhanden.'),'warn');return null}
    return parse(txt)}
  function parse(txt){
    try{const d=JSON.parse(txt);if(!d||d.v!==VER||!d.sv||d.sv.mv!==MAPGEN_VER||!d.g||!Array.isArray(d.ents)){ /* v2: Vorkommen-Kennungen ändern sich mit der Kartenprüfung (mapaudit.js, MAPGEN_VER) – ältere Stände passen nicht mehr zur neu erzeugten Karte und werden abgelehnt */toast(tr('Spielstand passt nicht zu dieser Version.'),'warn');return null}return d}
    catch(e){console.warn('load',e);toast(tr('Spielstand ist beschädigt.'),'warn');return null}}
  function apply(d){
    const sv=d.sv;diff=d.diff;aiStyle=d.aiStyle||aiStyle;
    newGame(d.diff,false,{map:sv.map,size:sv.size,seed:sv.seed,water:sv.water,mount:sv.mount,season:sv.season,aiStyle:d.g.ai&&d.g.ai.style||aiStyle});
    /* erzeugte Einheiten/Gebäude/Tiere entfernen, Vorkommen behalten (gleiche Karte = gleiche Kennungen) */
    const gen=new Map();
    for(const e of G.ents){if(e.kind==='node')gen.set(e.id,e);else removeEnt(e)}
    const seen=new Set(),made=[];
    for(const rec of d.ents){
      const o=dec(rec),n=gen.get(o.id);
      if(n&&o.kind==='node'){Object.assign(n,o);seen.add(n.id);made.push(n)}
      else{reg(o);made.push(o)}}
    for(const [id,n] of gen)if(!seen.has(id))removeEnt(n);
    G.ents=G.ents.filter(e=>{if(e.dead){G.byId.delete(e.id);return false}return true});
    for(const k in d.g)G[k]=dec(d.g[k]);
    G.tech=G.tech.map(s=>s instanceof Set?s:new Set(s));
    G.nfx=G.nation.map(nationFx);G.tfx=G.tech.map(techFx);
    const seenR=new Set();for(const e of G.ents)resolve(e,seenR);for(const k in d.g)G[k]=resolve(G[k],seenR);
    /* Upgrade-Aufträge: Einheiten zeigen wieder auf ihren Auftrag */
    for(let i=0;i<d.ents.length;i++){const u=d.ents[i].upj;if(u){const e=G.byId.get(d.ents[i].id);if(e&&G.jobs[u[0]])e.upj=G.jobs[u[0]][u[1]]||null}}
    G.mp=false;G.paused=false;G.running=true;G.started=true;G.over=G.over||null;G.sfx=undefined;
    G.solids=G.ents.filter(e=>e.kind!=='unit');specFx();recount();
    const ex=unb64(d.fog);for(let i=0;i<exF.length&&i<ex.length;i++)exF[i]=ex[i]/255;
    fogUpdate();
    /* Kamera und Berater */
    cam.x=d.cam.x;cam.y=d.cam.y;cam.z=d.cam.z;cam.tyaw=cam.yaw=d.cam.yaw||0;cam.tpitch=cam.pitch=d.cam.pitch||1.14;if(typeof clampCam==='function')try{clampCam()}catch(_){}
    advisor.strat=d.adv.strat||advisor.strat;advisor.auto=!!d.adv.auto;advisor.ignore=d.adv.ignore||{};advisor.cur=null;advisor.next=G.t+4;
    sel.clear();placing=null;panelSig='';infoCache='';
    $('speedBtn').textContent=tr('Tempo {0}×',G.speed);$('pauseBtn').textContent=tr('Pause');
    if(typeof SND!=='undefined')SND.setEpoch(Math.min(G.epoch[0],6));
    toast(tr('Spielstand geladen.'));updateUI&&updateUI();return true}
  async function load(sl){const d=await read(sl);if(!d)return false;try{autoLast=null;return apply(d)}catch(e){console.error('Laden fehlgeschlagen',e);toast(tr('Spielstand ist beschädigt.'),'warn');return false}}
  /* ---------- Datei: Export / Import ---------- */
  async function exportSlot(sl){
    const txt=await get(sl);if(!txt){toast(tr('Kein Spielstand vorhanden.'),'warn');return}
    const m=metas()[sl]||{},dt=new Date(m.ts||Date.now()),p=n=>String(n).padStart(2,'0');
    const name='epochenkrieg-'+dt.getFullYear()+p(dt.getMonth()+1)+p(dt.getDate())+'-'+p(dt.getHours())+p(dt.getMinutes())+'.json';
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast(tr('Datei wird gespeichert.'))}
  /* Datei in einen manuellen Platz legen (sl) – nur prüfen und ablegen, nichts laden */
  async function importText(txt,sl){
    const d=parse(txt);if(!d)return false;
    if(!await put(sl,txt)){toast(tr('Speichern fehlgeschlagen.'),'warn');return false}
    const m=metas();m[sl]=metaOf(d,txt.length);setMetas(m);toast(tr('Spielstand importiert.'));return true}
  async function importFile(file,sl){
    let txt;try{txt=await file.text()}catch(_){toast(tr('Datei konnte nicht gelesen werden.'),'warn');return false}
    return importText(txt,sl)}
  /* ---------- Liste ---------- */
  function list(){const m=metas();return SLOTS.map(sl=>({slot:sl,meta:m[sl]||null}))}
  function fmt(m){const d=new Date(m.ts),p=n=>String(n).padStart(2,'0'),mn=Math.floor(m.t/60);
    return d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes())+' · '+tr('Spielzeit')+' '+Math.floor(mn/60)+':'+p(mn%60)+' h · '+tr(EPOCHS[Math.min(m.ep,EPOCHS.length-1)].name)}
  /* Für die Knöpfe: jüngster Spielstand */
  function info(){const l=list().filter(x=>x.meta).sort((a,b)=>b.meta.ts-a.meta.ts);return l.length?l[0].meta:null}
  function label(){const m=info();if(!m)return '';const d=new Date(m.ts),p=n=>String(n).padStart(2,'0'),mn=Math.floor(m.t/60);return d.getDate()+'.'+(d.getMonth()+1)+'. '+p(d.getHours())+':'+p(d.getMinutes())+' · '+Math.floor(mn/60)+':'+p(mn%60)+' h'}
  /* ---------- Fenster mit der Platz-Liste ---------- */
  /* opts.save = Speichern-Knöpfe zeigen (nur im laufenden Spiel); opts.done = nach erfolgreichem Laden aufrufen */
  function panel(opts){
    opts=opts||{};let box=document.getElementById('svdlg');if(box)box.remove();
    box=document.createElement('div');box.id='svdlg';document.body.appendChild(box);
    const close=()=>{box.remove()};
    const draw=()=>{
      const rows=list().map(({slot,meta})=>{
        const nm=slot==='auto'?tr('Automatisch'):tr('Platz {0}',SLOTS.indexOf(slot));
        return `<div class="sv-row${meta?'':' empty'}" data-s="${slot}"><div class="sv-i"><b>${nm}</b><small>${meta?fmt(meta)+' · '+meta.kb+' KB':tr('leer')}</small></div><div class="sv-b">`
          +(opts.save&&slot!=='auto'&&can()?`<button data-a="save">${tr('Speichern')}</button>`:'')
          +(meta&&!NET.mp?`<button data-a="load">${tr('Laden')}</button>`:'')
          +(meta?`<button data-a="exp">${tr('Exportieren')}</button><button data-a="del" class="dng">${tr('Löschen')}</button>`:'')
          +'</div></div>'}).join('');
      box.innerHTML=`<div class="sv-card"><h2>${tr(opts.save?'Speichern & Laden':'Spielstand laden')}</h2><div class="sv-list">${rows}</div>
        <div class="sv-foot"><button data-a="imp">${tr('Datei importieren')}</button><button data-a="close">${tr('Schliessen')}</button></div>
        <small class="sv-note">${tr('Automatisch wird alle 5 Spielminuten gespeichert (abschaltbar unter Optionen).')}</small></div>`};
    draw();
    box.onclick=async ev=>{
      const b=ev.target.closest('button');if(!b){if(ev.target===box)close();return}
      const a=b.dataset.a,row=b.closest('.sv-row'),sl=row&&row.dataset.s;
      if(a==='close')return close();
      if(a==='save'){if(list().find(x=>x.slot===sl).meta&&!b.dataset.sure){b.dataset.sure=1;b.textContent=tr('Überschreiben?');return}
        await save(sl);return draw()}
      if(a==='load'){const d=await read(sl);if(!d)return;close();try{autoLast=null;apply(d);if(opts.done)opts.done()}catch(e){console.error(e);toast(tr('Spielstand ist beschädigt.'),'warn')}return}
      if(a==='exp')return exportSlot(sl);
      if(a==='del'){if(!b.dataset.sure){b.dataset.sure=1;b.textContent=tr('Sicher?');return}await del(sl);return draw()}
      if(a==='imp'){
        const f=document.createElement('input');f.type='file';f.accept='.json,application/json';f.id='svfile';
        f.onchange=async()=>{const file=f.files[0];if(!file)return;
          const m=metas(),free=['s1','s2','s3'].find(x=>!m[x]);let sl=free;
          if(!sl){if(!confirm(tr('Alle drei Plätze sind belegt. Platz 3 überschreiben?')))return;sl='s3'}
          if(await importFile(file,sl))draw()};
        f.click()}};
    return box}
  const api={save,load,read,apply,info,label,can,tick,panel,list,del,exportSlot,importFile,importText,lastMs:0,SLOTS};
  return api
})();
window.SAVE=SAVE;
