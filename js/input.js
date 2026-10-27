/* Epochenkrieg – Kamera und Eingabe (Maus, Touch, Tastatur).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* Sicherheitsnetz: Loslassen ausserhalb der Karte oder abgebrochener Zeiger beendet das Mauerziehen (die Karte selbst wertet es vorher aus) */
addEventListener('pointerup',()=>{wallDrag=null;wallAng=null});addEventListener('pointercancel',()=>{wallDrag=null});
/* ---------- camera & input ---------- */
function resize(){const r=view.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);VW=r.width;VH=r.height;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);
  const mr=mm.getBoundingClientRect();MW=mr.width;MH=mr.height;mm.width=Math.round(MW*dpr);mm.height=Math.round(MH*dpr);if(typeof r3Resize==='function')r3Resize();uiInsets(true);clampCam()}
/* Kamera: cam.x/cam.y = Punkt in der Bildmitte (Spielpixel), cam.z = Zoom. Umrechnung Bildschirm ↔ Spiel: toWorld/scr in render3d.js */
/* Zoom-Grenzen (cam.z): 0,3 = weit weg (Übersicht), 3,2 = ganz nah (Figur ~70 Bildpunkte hoch bei 720p) */
const ZOOM={min:.3,max:3.2};
/* Freie Kamera: Neigung (pitch, Radiant; 1,14 = Standard) von fast waagrecht bis fast senkrecht; Drehung (yaw) unbegrenzt. Ziele tyaw/tpitch, camSmooth lässt die Kamera weich nachlaufen. */
const PITCH0=1.14,PITCH_MIN=.2,PITCH_MAX=1.5;
function camRot(dyaw,dpitch){cam.tyaw+=dyaw;cam.tpitch=Math.max(PITCH_MIN,Math.min(PITCH_MAX,cam.tpitch+dpitch))}
function camReset(){cam.tyaw=Math.round(cam.yaw/(2*Math.PI))*2*Math.PI;cam.tpitch=PITCH0}
/* Taste gehalten? (Taste aus den änderbaren Tastenkürzeln) */
function kHeld(a){const k=OPT.keys[a];return !!k&&!!keys[k]}
function camSmooth(dt){
  if(!R3.ok||!VW||EGO.on)return;const wide=typeof ROOM!=='undefined'&&ROOM.wide();
  if(wide){cam.yaw=cam.tyaw=0;cam.pitch=cam.tpitch=PITCH0;return}
  if(G&&G.running&&!menuOpen){const r=1.7*OPT.camRot*dt,t=1.1*OPT.camRot*dt;
    if(kHeld('rotL'))camRot(-r,0);if(kHeld('rotR'))camRot(r,0);if(kHeld('tiltU'))camRot(0,-t);if(kHeld('tiltD'))camRot(0,t)}
  const ey=cam.tyaw-cam.yaw,ep=cam.tpitch-cam.pitch;if(Math.abs(ey)<1e-4&&Math.abs(ep)<1e-4){cam.yaw=cam.tyaw;cam.pitch=cam.tpitch;return}
  /* um den Punkt in der Mitte der freien Fläche drehen (dort schaut der Spieler hin), nicht um die Bildmitte unter der Konsole */
  camUpdate();const F=freeCenter(),a=toWorld(F.x,F.y,true),f=1-Math.exp(-Math.min(dt,.1)/.09);
  cam.yaw+=ey*f;cam.pitch+=ep*f;camUpdate();const b=toWorld(F.x,F.y,true);cam.x+=a.x-b.x;cam.y+=a.y-b.y;clampCam()}
/* Verdeckte Höhen: obere Leiste und Befehlskonsole liegen über der Karte. Werte kommen aus dem DOM (nie festverdrahtet), werden alle 0,4 s und bei Grössenänderung neu gelesen. */
const UIINS={t:0,b:0,r:0,at:-1e9};
function uiInsets(force){const now=performance.now();if(!force&&now-UIINS.at<400)return UIINS;UIINS.at=now;
  const tp=document.getElementById('top'),pn=document.getElementById('panel'),hid=el=>!el||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden';
  let t=hid(tp)?0:tp.offsetHeight,b=hid(pn)?0:pn.offsetHeight;if(document.body.classList.contains('mm')){t=0;b=0}
  let r=0;
  /* Neue Oberfläche: #panel ist display:contents (Höhe 0); die Seitenleiste (rechts, bei schmalem Fenster eine Schublade unten) nimmt Platz weg */
  if(document.body.classList.contains('ui2')){const sd=document.getElementById('side');if(sd&&!hid(sd)){const q=sd.getBoundingClientRect();if(q.width>0&&q.height>0){if(q.width>VW*.6)b=Math.max(b,VH-q.top);else r=Math.max(0,VW-q.left)}}
    const bt=document.querySelector('#top .tl');if(bt){const w=Math.ceil(bt.getBoundingClientRect().width)+'px';if(UIINS.bw!==w){UIINS.bw=w;requestAnimationFrame(()=>document.body.style.setProperty('--btnsW',w))}}}
  if(VH){t=Math.min(t,VH*.3);b=Math.min(b,VH*.5)}if(VW)r=Math.min(r,VW*.4);UIINS.t=t;UIINS.b=b;UIINS.r=r;return UIINS}
/* Mittelpunkt der freien Fläche (zwischen Leiste und Konsole) in Bildschirmpunkten */
function freeCenter(){const u=uiInsets();return{x:(VW-u.r)/2,y:(u.t+VH-u.b)/2}}
/* Begrenzung = die ganze Brettfläche (auch bei kleinen Karten mit Randgebirge: so ist der echte Brettrand immer erreichbar) */
function playRect(){return{x0:0,x1:W,y0:0,y1:H}}
/* Der Mittelpunkt der freien Fläche darf über jede Kartenkante hinaus, bis zum Überlauf (wächst mit dem Zoom: halbe sichtbare Breite/Höhe × 0,4).
   So liegt jeder Kartenrand (auch der untere) immer vollständig über der Konsole, und man sieht ein Stück Tisch dahinter. */
function clampCam(){
  const wide=typeof ROOM!=='undefined'&&ROOM.wide();
  if(wide||!R3.ok||!VW){cam.x=Math.max(0,Math.min(W,cam.x));cam.y=Math.max(0,Math.min(H,cam.y));camUpdate();return}
  const F=freeCenter(),u=UIINS,B=playRect();camUpdate();
  for(let i=0;i<3;i++){
    const c=toWorld(F.x,F.y,true),hx0=toWorld(VW-u.r,F.y,true),hx1=toWorld(0,F.y,true),hy0=toWorld(F.x,VH-u.b,true),hy1=toWorld(F.x,u.t,true),lim=R3.D0/cam.z*R3.S*.9,hx=Math.min(lim,Math.hypot(hx0.x-hx1.x,hx0.y-hx1.y)/2),hy=Math.min(lim,Math.hypot(hy0.x-hy1.x,hy0.y-hy1.y)/2),
      ok=typeof ROOM!=='undefined'&&ROOM.on?.4:.2/* ohne Spielzimmer nur ein schmaler Rand (dahinter ist nur Meer) */,ox=hx*ok,oy=hy*ok,nx=Math.max(B.x0-ox,Math.min(B.x1+ox,c.x)),ny=Math.max(B.y0-oy,Math.min(B.y1+oy,c.y));
    if(Math.abs(nx-c.x)<.5&&Math.abs(ny-c.y)<.5)break;
    cam.x+=nx-c.x;cam.y+=ny-c.y;camUpdate()}
}
if(window.ResizeObserver){let roQ=0;const ro=new ResizeObserver(()=>{if(roQ)return;roQ=requestAnimationFrame(()=>{roQ=0;uiInsets(true);if(G&&G.running)clampCam()})});for(const id of['top','panel','side']){const el=document.getElementById(id);if(el)ro.observe(el)}const tl=document.querySelector('#top .tl');if(tl)ro.observe(tl);}
/* Ziel in die Mitte der freien Fläche bringen (nicht in die Fenstermitte, die teils unter der Konsole liegt) */
function centerOn(x,y){cam.x=x;cam.y=y;if(R3.ok&&VW&&!(typeof ROOM!=='undefined'&&ROOM.wide())){camUpdate();const F=freeCenter(),c=toWorld(F.x,F.y,true);cam.x+=x-c.x;cam.y+=y-c.y}clampCam()}
function evPos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}

const tpts=new Map();let pinch=null; /* Touch: aktive Finger und Pinch-Zoom */
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running)return;const p=evPos(e);mouse.type=e.pointerType;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(e.pointerType!=='mouse'){tpts.set(e.pointerId,{x:p.x,y:p.y});
    if(tpts.size===2){/* zwei Finger: Pinch-Zoom */const[a,b]=[...tpts.values()];pinch={d:Math.max(20,Math.hypot(a.x-b.x,a.y-b.y)),z:cam.z,an:Math.atan2(b.y-a.y,b.x-a.x),my:(a.y+b.y)/2,yaw:cam.tyaw,pit:cam.tpitch,on:false};drag=null;return}
    if(!e.isPrimary)return;drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,touch:true,moved:false};return}
  const w=toWorld(p.x,p.y);
  if(e.button===2){if(wallDrag){wallDrag=null;return}if(placing||armed){placing=null;armed=false;return}command(w.x,w.y,e.shiftKey,{x:p.x,y:p.y});if(ownSel().length)sfx('order');return}
  if(e.button===1){drag=e.shiftKey?{pan:true,lx:p.x,ly:p.y}:{rot:true,lx:p.x,ly:p.y};e.preventDefault();return}
  if(e.button===0&&e.altKey&&!placing&&!armed){drag={rot:true,lx:p.x,ly:p.y};e.preventDefault();return}
  if(e.button===0){if(placing){
      /* Mauer: erst beim Loslassen bauen – Klick = ein Stück wie bisher, Ziehen = ganze Mauerlinie (Vorschau in render.js) */
      if(placing==='wall'){wallDrag={sx:p.x,sy:p.y,x:w.x,y:w.y,line:false,shift:e.shiftKey};return}
      tryPlace(w.x,w.y,e.shiftKey);return}
    if(armed){attackMove(w.x,w.y,e.shiftKey);return}drag={sx:p.x,sy:p.y,box:false,shift:e.shiftKey}}
});
cv.addEventListener('pointermove',e=>{
  const p=evPos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;mouse.type=e.pointerType;
  if(tpts.has(e.pointerId)){tpts.set(e.pointerId,{x:p.x,y:p.y});
    if(pinch&&tpts.size>=2){const[a,b]=[...tpts.values()],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,before=toWorld(mx,my,true);
      cam.z=Math.max(ZOOM.min,Math.min(ZOOM.max,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));
      /* Zwei-Finger-Drehen (Verdrehen der Finger) und -Neigen (beide Finger gemeinsam hoch/runter, erst ab 14 Pixel) */
      {let da=Math.atan2(b.y-a.y,b.x-a.x)-pinch.an;da=Math.atan2(Math.sin(da),Math.cos(da));const dm=my-pinch.my;if(Math.abs(da)>.06)pinch.rt=true;if(Math.abs(dm)>14)pinch.tl=true;
        if(pinch.rt)cam.tyaw=pinch.yaw+da*OPT.camRot;if(pinch.tl)cam.tpitch=Math.max(PITCH_MIN,Math.min(PITCH_MAX,pinch.pit+(dm-Math.sign(dm)*14)*.004*OPT.camRot))}
      camUpdate();const after=toWorld(mx,my,true);cam.x+=before.x-after.x;cam.y+=before.y-after.y;clampCam();return}}
  if(wallDrag){
    /* Rechte Maustaste während des Ziehens (kommt als pointermove) bricht ab; Maustaste nicht mehr gedrückt (z. B. nach Fensterwechsel) ebenso */
    if(placing!=='wall'||(e.pointerType==='mouse'&&(e.buttons&2||!(e.buttons&1)))){wallDrag=null;return}
    if(!wallDrag.line&&Math.hypot(p.x-wallDrag.sx,p.y-wallDrag.sy)>8)wallDrag.line=true;return}
  if(!drag)return;
  if(drag.rot){camRot(-(p.x-drag.lx)*.006*OPT.camRot,(p.y-drag.ly)*.004*OPT.camRot);drag.lx=p.x;drag.ly=p.y;return}
  if(drag.pan||drag.touch){if(drag.touch&&!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)<9)return;if(drag.touch)drag.moved=true;{const a=toWorld(drag.lx,drag.ly,true),b=toWorld(p.x,p.y,true);cam.x+=a.x-b.x;cam.y+=a.y-b.y}drag.lx=p.x;drag.ly=p.y;clampCam();return}
  if(Math.hypot(p.x-drag.sx,p.y-drag.sy)>5)drag.box=true;
});
cv.addEventListener('pointerleave',()=>{mouse.in=false});
const endTouch=e=>{if(tpts.delete(e.pointerId)&&tpts.size<2&&pinch){pinch=null;drag=null}};cv.addEventListener('pointerup',endTouch);cv.addEventListener('pointercancel',endTouch);
cv.addEventListener('pointerup',e=>{
  if(wallDrag){const wd=wallDrag;wallDrag=null;if(placing!=='wall'||e.button!==0)return;
    if(wd.line){const w=toWorld(evPos(e).x,evPos(e).y);placeWallLine(wd.x,wd.y,w.x,w.y,false,wd.shift||e.shiftKey)}
    else tryPlace(wd.x,wd.y,true);
    return}
  if(!drag)return;const p=evPos(e);const d=drag;drag=null;
  if(d.pan||d.rot)return;
  if(d.touch){if(!d.moved)tap(p);return}
  if(d.box){const x0=Math.min(d.sx,p.x),x1=Math.max(d.sx,p.x),y0=Math.min(d.sy,p.y),y1=Math.max(d.sy,p.y);
    const us=G.ents.filter(u=>{if(u.dead||u.inm||u.kind!=='unit'||u.team!==0)return false;const q=scr(u.x,u.y,entH(u)*.45);return q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1});
    if(!d.shift)sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';return}
  clickSelect(p,d.shift);
});
function clickSelect(p,shift){
  const e=entityAt(0,0,p);const now=performance.now();
  if(!e){if(!shift)sel.clear();panelSig='';return}
  if(e.team===0&&now-lastClick.t<350&&lastClick.id===e.id){
    sel.clear();G.ents.forEach(o=>{if(o.dead||o.team!==0||o.type!==e.type)return;const q=scr(o.x,o.y,0);if(q.x>=0&&q.x<=VW&&q.y>=0&&q.y<=VH)sel.add(o.id)});
  }else if(shift&&e.team===0&&e.kind==='unit'){if(sel.has(e.id))sel.delete(e.id);else{selection().forEach(o=>{if(o.kind!=='unit'||o.team!==0)sel.delete(o.id)});sel.add(e.id)}}
  else{sel.clear();sel.add(e.id)}
  lastClick={t:now,id:e.id};panelSig='';if(e.team===0)sfx('select');
}
function tap(p){
  const w=toWorld(p.x,p.y);
  if(placing){tryPlace(w.x,w.y,false);return}
  if(armed){attackMove(w.x,w.y);return}
  const e=entityAt(0,0,p),s=ownSel();
  if(s.length){const workers=s.some(u=>UNITS[u.type].gather);
    const cmd=!e||e.team===1||(e.kind==='node'&&workers)||(e.kind==='node'&&s[0].kind==='bld')||(e.team===0&&e.kind==='bld'&&s[0].kind==='unit'&&workers&&(!e.built||e.hp<e.maxHp-1||(BLDS[e.type].drop&&s.some(u=>u.carry>0))));
    if(cmd){command(w.x,w.y,false,p);return}}
  clickSelect(p,false);
}
cv.addEventListener('wheel',e=>{e.preventDefault();if(!G)return;const p=evPos(e);const before=toWorld(p.x,p.y,true);
  cam.z=Math.max(ZOOM.min,Math.min(ZOOM.max,cam.z*Math.exp(-e.deltaY*.0015*OPT.zoomSpeed)));camUpdate();const after=toWorld(p.x,p.y,true);cam.x+=before.x-after.x;cam.y+=before.y-after.y;clampCam()},{passive:false});
let mmDrag=false;
function mmGo(e){const r=mm.getBoundingClientRect();centerOn((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)}
mm.addEventListener('pointerdown',e=>{if(!G)return;if(e.button===2&&G.running){const r=mm.getBoundingClientRect();command((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H,e.shiftKey);return}mmDrag=true;try{mm.setPointerCapture(e.pointerId)}catch(_){}mmGo(e)});
mm.addEventListener('pointermove',e=>{if(mmDrag)mmGo(e)});
mm.addEventListener('pointerup',()=>{mmDrag=false});
mm.addEventListener('contextmenu',e=>e.preventDefault());
/* Kontrollgruppen: Strg/Cmd+Ziffer speichert die Auswahl, Umschalt+Ziffer fügt hinzu, Ziffer wählt sie wieder, zweimal schnell = Kamera springt hin.
   Gespeichert werden Nummern (G.byId), je Partie neu; Einheiten und Gebäude werden nicht gemischt (die Befehlsknöpfe gelten für eine Art). */
const GRP={g:null,list:[],lastN:0,lastT:0};
function grpList(n){if(GRP.g!==G){GRP.g=G;GRP.list=[];GRP.lastN=0}return GRP.list[n]||(GRP.list[n]=[])}
function grpKey(e){
  const m=/^(?:Digit|Numpad)([1-9])$/.exec(e.code||'');if(!m||e.altKey||(typeof EGO!=='undefined'&&EGO.on)||/^(INPUT|TEXTAREA|SELECT)$/.test((e.target&&e.target.tagName)||''))return false;
  const n=+m[1];e.preventDefault();
  if(e.ctrlKey||e.metaKey||e.shiftKey){
    let own=ownSel();if(!own.length){toast(tr('Nichts ausgewählt, die Gruppe bleibt wie sie war.'));return true}
    const us=own.filter(u=>u.kind==='unit');own=us.length?us:own.filter(b=>b.kind==='bld');
    const add=e.shiftKey&&!(e.ctrlKey||e.metaKey),cur=grpList(n);let ids=own.map(u=>u.id);
    if(add){const keep=cur.map(id=>G.byId.get(id)).filter(u=>u&&!u.dead&&(u.kind==='unit')===(own[0].kind==='unit'));ids=[...new Set([...keep.map(u=>u.id),...ids])]}
    GRP.list[n]=ids;toast(tr(add?'Gruppe {0}: {1} Einträge':'Gruppe {0} gespeichert: {1}',n,ids.length),'good');sfx('select');return true}
  const us=grpList(n).map(id=>G.byId.get(id)).filter(u=>u&&!u.dead&&u.team===0&&!u.inm);
  if(!us.length){toast(tr('Gruppe {0} ist leer. Mit Strg + {0} speichern.',n));return true}
  GRP.list[n]=us.map(u=>u.id);sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';sfx('select');
  const now=performance.now();if(GRP.lastN===n&&now-GRP.lastT<450){const cx=us.reduce((a,u)=>a+u.x,0)/us.length,cy=us.reduce((a,u)=>a+u.y,0)/us.length;centerOn(cx,cy)}
  GRP.lastN=n;GRP.lastT=now;return true}
addEventListener('keydown',e=>{
  keys[e.key]=true;keys[e.key.toLowerCase()]=true;
  if(e.key==='Escape'&&menuOpen){toggleMenu();return}
  if(menuOpen||!G||!G.running)return;
  if(kA(e)==='pause'){e.preventDefault();togglePause()}
  else if(grpKey(e)){}
  else if(e.key==='Escape'){if(wallDrag)wallDrag=null;else if(placing||armed){placing=null;armed=false}else toggleMenu()}
  else if(kA(e)==='form'){curForm=(curForm+1)%FORMS.length;panelSig='';toast(tr('Formation: {0}',tr(FORMS[curForm])),'good')}
  else if(kA(e)==='rage'){const ids=ownSel().filter(u=>u.kind==='unit').map(u=>u.id);if(ids.length){if(NET.client)NET.send({c:'rage',ids});else if(!useRage(0,ids))toast(tr('Kampfrausch lädt noch.'),'warn')}}
  else if(kA(e)==='mute'){SND.setMute(!SND.muted);toast(SND.muted?tr('Ton aus'):tr('Ton an'))}
  else if(kA(e)==='attack'){if(ownSel().some(u=>u.kind==='unit'&&!UNITS[u.type].passive)){armed=true;placing=null}}
  else if(kA(e)==='look'){if(e.key.length>1)e.preventDefault();if(!e.repeat&&!EGO.on&&!document.pointerLockElement)try{const p=cv.requestPointerLock&&cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
  else if(kA(e)==='camReset'||e.key==='Home'){e.preventDefault();camReset()}
  else if(kA(e)==='tiltU'||kA(e)==='tiltD'||kA(e)==='rotL'||kA(e)==='rotR'){if(e.key.length>1)e.preventDefault()}
  else if(kA(e)==='home'){const hq=G.ents.find(o=>o.type==='hq'&&o.team===0&&!o.dead);if(hq){sel.clear();sel.add(hq.id);centerOn(hq.x,hq.y);panelSig=''}}
  else if(kA(e)==='idle'){selectIdle()}
  else if(/^F[1-4]$/.test(e.key)){e.preventDefault();const f=e.key,m=f==='F1'?u=>u.type==='worker':f==='F2'?u=>u.type!=='worker'&&!UNITS[u.type].naval:f==='F4'?u=>UNITS[u.type].naval:()=>false;
    const us=G.ents.filter(u=>!u.dead&&u.team===0&&u.kind==='unit'&&m(u));if(!us.length){toast(f==='F3'?tr('Lufttruppen gibt es noch nicht.'):tr('Keine passenden Einheiten.'));return}sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';sfx('select')}
  else if(kA(e)==='explore'){if(NET.client)NET.send({c:'explore',ids:ownSel().map(u=>u.id)});else doExplore()}
  else if(kA(e)==='loop'){if(NET.client)NET.send({c:'loop',ids:ownSel().map(u=>u.id)});else toggleLoopSel()}
  else if(e.key==='Backspace'||e.key==='Delete'){if(NET.client){NET.send({c:'clr',ids:ownSel().map(u=>u.id)});e.preventDefault()}else if(clearChainSel())e.preventDefault()}
  else if(kA(e)==='yes'){advAnswer(true)}
  else if(kA(e)==='no'){advAnswer(false)}
  if(e.key.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.key]=false;keys[e.key.toLowerCase()]=false;if(kA(e)==='look'&&document.pointerLockElement===cv&&!EGO.on)try{document.exitPointerLock()}catch(_){}});
/* Fokusverlust / Zeigerfang verloren (Esc, Fensterwechsel): gehaltene Tasten zurücksetzen, sonst dreht die Kamera weiter oder Tasten klemmen */
function releaseKeys(){for(const k in keys)keys[k]=false;try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}}
addEventListener('blur',releaseKeys);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseKeys()});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&!EGO.on){const k=OPT.keys&&OPT.keys.look;if(k){keys[k]=false;keys[String(k).toLowerCase()]=false}}});
/* Umschauen: Taste halten (Standard R) und Maus bewegen, ohne Klicken (Mac-Trackpad ohne Mitteltaste); Zeiger wird dabei festgehalten, loslassen = Kamera bleibt stehen */
addEventListener('mousemove',e=>{if(typeof EGO!=='undefined'&&EGO.on)return;if(!G||!G.running||menuOpen||!kHeld('look'))return;
  const dx=e.movementX||0,dy=e.movementY||0;if(dx||dy)camRot(-dx*.006*OPT.camRot,dy*.004*OPT.camRot)},true);
function scrollCam(dt){
  if(EGO.on)return;
  let vx=0,vy=0;const s=700/cam.z*OPT.camSpeed;
  if(keys.ArrowLeft||keys.a)vx-=1;if(keys.ArrowRight||keys.d)vx+=1;if(keys.ArrowUp||keys.w)vy-=1;if(keys.ArrowDown||keys.s)vy+=1;
  if(OPT.edgeScroll&&mouse.in&&mouse.type==='mouse'&&!drag&&!mmDrag&&G&&G.running){const m=14;if(mouse.x<m)vx-=1;if(mouse.x>VW-m)vx+=1;if(mouse.y<m)vy-=1;if(mouse.y>VH-m)vy+=1}
  if(vx||vy){const cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw);/* relativ zur Blickrichtung */cam.x+=(vx*cy+vy*sy)*s*dt;cam.y+=(-vx*sy+vy*cy)*s*dt;clampCam()}
}
function togglePause(){if(G.mp)return;G.paused=!G.paused;$('pauseBtn').textContent=G.paused?tr('Weiter'):tr('Pause')}
let idleIdx=0;
function selectIdle(){const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle');if(!idle.length){toast(tr('Alle Arbeiter haben zu tun.'));return}const u=idle[idleIdx++%idle.length];sel.clear();sel.add(u.id);centerOn(u.x,u.y);panelSig=''}
