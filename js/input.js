/* Epochenkrieg – Kamera und Eingabe (Maus, Touch, Tastatur).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- camera & input ---------- */
function resize(){const r=view.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);VW=r.width;VH=r.height;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);
  const mr=mm.getBoundingClientRect();MW=mr.width;MH=mr.height;mm.width=Math.round(MW*dpr);mm.height=Math.round(MH*dpr);clampCam()}
function clampCam(){const vw=VW/cam.z,vh=VH/(cam.z*TILT);cam.x=vw>=W?(W-vw)/2:Math.max(0,Math.min(W-vw,cam.x));cam.y=vh>=H?(H-vh)/2:Math.max(0,Math.min(H-vh,cam.y))}
function centerOn(x,y){cam.x=x-VW/cam.z/2;cam.y=y-VH/(cam.z*TILT)/2;clampCam()}
const toWorld=(sx,sy)=>({x:cam.x+sx/cam.z,y:cam.y+sy/(cam.z*TILT)});
function evPos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}

cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running)return;const p=evPos(e);mouse.type=e.pointerType;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(e.pointerType!=='mouse'){if(!e.isPrimary)return;drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,touch:true,moved:false};return}
  const w=toWorld(p.x,p.y);
  if(e.button===2){if(placing||armed){placing=null;armed=false;return}command(w.x,w.y,e.shiftKey);if(ownSel().length)sfx('order');return}
  if(e.button===1){drag={pan:true,lx:p.x,ly:p.y};e.preventDefault();return}
  if(e.button===0){if(placing){tryPlace(w.x,w.y,e.shiftKey);return}if(armed){attackMove(w.x,w.y,e.shiftKey);return}drag={sx:p.x,sy:p.y,box:false,shift:e.shiftKey}}
});
cv.addEventListener('pointermove',e=>{
  const p=evPos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;mouse.type=e.pointerType;
  if(!drag)return;
  if(drag.pan||drag.touch){if(drag.touch&&!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)<9)return;if(drag.touch)drag.moved=true;cam.x-=(p.x-drag.lx)/cam.z;cam.y-=(p.y-drag.ly)/(cam.z*TILT);drag.lx=p.x;drag.ly=p.y;clampCam();return}
  if(Math.hypot(p.x-drag.sx,p.y-drag.sy)>5)drag.box=true;
});
cv.addEventListener('pointerleave',()=>{mouse.in=false});
cv.addEventListener('pointerup',e=>{
  if(!drag)return;const p=evPos(e);const d=drag;drag=null;
  if(d.pan)return;
  if(d.touch){if(!d.moved)tap(p);return}
  if(d.box){const a=toWorld(Math.min(d.sx,p.x),Math.min(d.sy,p.y)),b=toWorld(Math.max(d.sx,p.x),Math.max(d.sy,p.y));
    const us=G.ents.filter(u=>!u.dead&&u.kind==='unit'&&u.team===0&&u.x>=a.x&&u.x<=b.x&&u.y>=a.y&&u.y<=b.y);
    if(!d.shift)sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';return}
  clickSelect(toWorld(p.x,p.y),d.shift);
});
function clickSelect(w,shift){
  const e=entityAt(w.x,w.y);const now=performance.now();
  if(!e){if(!shift)sel.clear();panelSig='';return}
  if(e.team===0&&now-lastClick.t<350&&lastClick.id===e.id){
    const a=toWorld(0,0),b=toWorld(VW,VH);sel.clear();G.ents.forEach(o=>{if(!o.dead&&o.team===0&&o.type===e.type&&o.x>=a.x&&o.x<=b.x&&o.y>=a.y&&o.y<=b.y)sel.add(o.id)});
  }else if(shift&&e.team===0&&e.kind==='unit'){if(sel.has(e.id))sel.delete(e.id);else{selection().forEach(o=>{if(o.kind!=='unit'||o.team!==0)sel.delete(o.id)});sel.add(e.id)}}
  else{sel.clear();sel.add(e.id)}
  lastClick={t:now,id:e.id};panelSig='';if(e.team===0)sfx('select');
}
function tap(p){
  const w=toWorld(p.x,p.y);
  if(placing){tryPlace(w.x,w.y,false);return}
  if(armed){attackMove(w.x,w.y);return}
  const e=entityAt(w.x,w.y),s=ownSel();
  if(s.length){const workers=s.some(u=>UNITS[u.type].gather);
    const cmd=!e||e.team===1||(e.kind==='node'&&workers)||(e.kind==='node'&&s[0].kind==='bld')||(e.team===0&&e.kind==='bld'&&s[0].kind==='unit'&&workers&&(!e.built||(BLDS[e.type].drop&&s.some(u=>u.carry>0))));
    if(cmd){command(w.x,w.y);return}}
  clickSelect(w,false);
}
cv.addEventListener('wheel',e=>{e.preventDefault();if(!G)return;const p=evPos(e);const before=toWorld(p.x,p.y);
  cam.z=Math.max(.55,Math.min(1.6,cam.z*Math.exp(-e.deltaY*.0015)));cam.x=before.x-p.x/cam.z;cam.y=before.y-p.y/(cam.z*TILT);clampCam()},{passive:false});
let mmDrag=false;
function mmGo(e){const r=mm.getBoundingClientRect();centerOn((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)}
mm.addEventListener('pointerdown',e=>{if(!G)return;if(e.button===2&&G.running){const r=mm.getBoundingClientRect();command((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H,e.shiftKey);return}mmDrag=true;try{mm.setPointerCapture(e.pointerId)}catch(_){}mmGo(e)});
mm.addEventListener('pointermove',e=>{if(mmDrag)mmGo(e)});
mm.addEventListener('pointerup',()=>{mmDrag=false});
mm.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  keys[e.key]=true;keys[e.key.toLowerCase()]=true;
  if(e.key==='Escape'&&menuOpen){toggleMenu();return}
  if(menuOpen||!G||!G.running)return;
  if(e.key===' '){e.preventDefault();togglePause()}
  else if(e.key==='Escape'){if(placing||armed){placing=null;armed=false}else toggleMenu()}
  else if(e.key==='q'||e.key==='Q'){if(ownSel().some(u=>u.kind==='unit'&&!UNITS[u.type].passive)){armed=true;placing=null}}
  else if(e.key==='h'||e.key==='H'){const hq=G.ents.find(o=>o.type==='hq'&&o.team===0&&!o.dead);if(hq){sel.clear();sel.add(hq.id);centerOn(hq.x,hq.y);panelSig=''}}
  else if(e.key==='.'){selectIdle()}
  else if(/^F[1-4]$/.test(e.key)){e.preventDefault();const f=e.key,m=f==='F1'?u=>u.type==='worker':f==='F2'?u=>u.type!=='worker'&&!UNITS[u.type].naval:f==='F4'?u=>UNITS[u.type].naval:()=>false;
    const us=G.ents.filter(u=>!u.dead&&u.team===0&&u.kind==='unit'&&m(u));if(!us.length){toast(f==='F3'?tr('Lufttruppen gibt es noch nicht.'):tr('Keine passenden Einheiten.'));return}sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';sfx('select')}
  else if(e.key==='e'||e.key==='E'){if(NET.client)NET.send({c:'explore',ids:ownSel().map(u=>u.id)});else doExplore()}
  else if(e.key==='l'||e.key==='L'){if(NET.client)NET.send({c:'loop',ids:ownSel().map(u=>u.id)});else toggleLoopSel()}
  else if(e.key==='Backspace'||e.key==='Delete'){if(NET.client){NET.send({c:'clr',ids:ownSel().map(u=>u.id)});e.preventDefault()}else if(clearChainSel())e.preventDefault()}
  else if(e.key==='y'||e.key==='Y'){advAnswer(true)}
  else if(e.key==='x'||e.key==='X'){advAnswer(false)}
  if(e.key.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.key]=false;keys[e.key.toLowerCase()]=false});
function scrollCam(dt){
  let vx=0,vy=0;const s=700/cam.z;
  if(keys.ArrowLeft||keys.a)vx-=1;if(keys.ArrowRight||keys.d)vx+=1;if(keys.ArrowUp||keys.w)vy-=1;if(keys.ArrowDown||keys.s)vy+=1;
  if(mouse.in&&mouse.type==='mouse'&&!drag&&!mmDrag&&G&&G.running){const m=14;if(mouse.x<m)vx-=1;if(mouse.x>VW-m)vx+=1;if(mouse.y<m)vy-=1;if(mouse.y>VH-m)vy+=1}
  if(vx||vy){cam.x+=vx*s*dt;cam.y+=vy*s*dt;clampCam()}
}
function togglePause(){if(G.mp)return;G.paused=!G.paused;$('pauseBtn').textContent=G.paused?tr('Weiter'):tr('Pause')}
let idleIdx=0;
function selectIdle(){const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle');if(!idle.length){toast(tr('Alle Arbeiter haben zu tun.'));return}const u=idle[idleIdx++%idle.length];sel.clear();sel.add(u.id);centerOn(u.x,u.y);panelSig=''}
