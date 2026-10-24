/* Epochenkrieg – Spielstand speichern/laden (nur Einzelspieler).
   Prinzip: Die Karte wird aus Seed + Optionen neu erzeugt (newGame, ist immer dieselbe), danach wird der Spielzustand darübergelegt:
   alle Einheiten, Gebäude, Tiere und Vorkommen, Rohstoffe, Zeitalter, Technologien, Aufträge (Upgrades), KI-Zustand, erkundeter Nebel, Kamera.
   Ein Schnellspeicher-Platz (IndexedDB, Ersatz localStorage) plus kleine Info (Zeitstempel) in localStorage `ek-save-meta`.
   Mehrspieler wird nicht gespeichert (der Spielstand dort liegt beim Gastgeber, Gäste sehen nur Schnappschüsse). */
'use strict';
const SAVE=(()=>{
  const VER=1,KEY='quick',META='ek-save-meta',DB='ek-saves';
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
  /* ---------- Speicherort ---------- */
  const idb=()=>new Promise((res,rej)=>{try{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});
  async function put(txt){
    try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction('s','readwrite');t.objectStore('s').put(txt,KEY);t.oncomplete=res;t.onerror=()=>rej(t.error)});d.close();return true}catch(_){}
    try{localStorage.setItem('ek-save-data',txt);return true}catch(_){return false}}
  async function get(){
    try{const d=await idb();const v=await new Promise((res,rej)=>{const r=d.transaction('s').objectStore('s').get(KEY);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});d.close();if(v)return v}catch(_){}
    try{return localStorage.getItem('ek-save-data')}catch(_){return null}}
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
  async function save(){
    if(!can()){toast(tr('Gespeichert werden kann nur im laufenden Einzelspieler.'),'warn');return false}
    let txt;try{txt=JSON.stringify(snapshot())}catch(e){console.warn('save',e);toast(tr('Speichern fehlgeschlagen.'),'warn');return false}
    const ok=await put(txt);
    if(!ok){toast(tr('Speichern fehlgeschlagen.'),'warn');return false}
    try{localStorage.setItem(META,JSON.stringify({ts:Date.now(),t:Math.round(G.t),ep:Math.max(...[G.epoch[0]]),kb:Math.round(txt.length/1024)}))}catch(_){}
    toast(tr('Spielstand gespeichert.'));return true}
  /* ---------- Laden ---------- */
  async function read(){
    const txt=await get();if(!txt){toast(tr('Kein Spielstand vorhanden.'),'warn');return null}
    try{const d=JSON.parse(txt);if(!d||d.v!==VER||!d.sv){toast(tr('Spielstand passt nicht zu dieser Version.'),'warn');return null}return d}
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
  async function load(){const d=await read();if(!d)return false;try{return apply(d)}catch(e){console.error('Laden fehlgeschlagen',e);toast(tr('Spielstand ist beschädigt.'),'warn');return false}}
  /* Info für die Knöpfe (sofort, ohne Warten) */
  function info(){try{return JSON.parse(localStorage.getItem(META)||'null')}catch(_){return null}}
  function label(){const m=info();if(!m)return '';const d=new Date(m.ts),p=n=>String(n).padStart(2,'0');return d.getDate()+'.'+(d.getMonth()+1)+'. '+p(d.getHours())+':'+p(d.getMinutes())+' · '+Math.floor(m.t/60)+' min'}
  return{save,load,read,apply,info,label,can}
})();
window.SAVE=SAVE;
