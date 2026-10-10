/* Epochenkrieg – Kamera und Eingabe (Maus, Touch, Tastatur).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
let wallDrag=null;addEventListener('pointerup',()=>{wallDrag=null});
/* ---------- camera & input ---------- */
function resize(){const r=view.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);VW=r.width;VH=r.height;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);
  const mr=mm.getBoundingClientRect();MW=mr.width;MH=mr.height;mm.width=Math.round(MW*dpr);mm.height=Math.round(MH*dpr);if(typeof r3Resize==='function')r3Resize();clampCam()}
/* Kamera: cam.x/cam.y = Punkt in der Bildmitte (Spielpixel), cam.z = Zoom. Umrechnung Bildschirm ↔ Spiel: toWorld/scr in render3d.js */
function clampCam(){cam.x=Math.max(0,Math.min(W,cam.x));cam.y=Math.max(0,Math.min(H,cam.y));camUpdate()}
function centerOn(x,y){cam.x=x;cam.y=y;clampCam()}
function evPos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}

cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running)return;const p=evPos(e);mouse.type=e.pointerType;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(e.pointerType!=='mouse'){if(!e.isPrimary)return;drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,touch:true,moved:false};return}
  const w=toWorld(p.x,p.y);
  if(e.button===2){if(placing||armed){placing=null;armed=false;return}command(w.x,w.y,e.shiftKey,{x:p.x,y:p.y});if(ownSel().length)sfx('order');return}
  if(e.button===1){drag={pan:true,lx:p.x,ly:p.y};e.preventDefault();return}
  if(e.button===0){if(placing){const wl=placing==='wall';tryPlace(w.x,w.y,e.shiftKey||wl);if(wl&&placing==='wall')wallDrag={x:w.x,y:w.y};return}if(armed){attackMove(w.x,w.y,e.shiftKey);return}drag={sx:p.x,sy:p.y,box:false,shift:e.shiftKey}}
});
cv.addEventListener('pointermove',e=>{
  const p=evPos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;mouse.type=e.pointerType;
  if(wallDrag&&placing==='wall'){const w=toWorld(p.x,p.y),d=BLDS.wall.r*2+1;let dx=w.x-wallDrag.x,dy=w.y-wallDrag.y,L=Math.hypot(dx,dy),n=0;while(L>=d&&placing==='wall'&&n++<12){const k=d/L;wallDrag.x+=dx*k;wallDrag.y+=dy*k;tryPlace(wallDrag.x,wallDrag.y,true);dx=w.x-wallDrag.x;dy=w.y-wallDrag.y;L=Math.hypot(dx,dy)}return}
  if(!drag)return;
  if(drag.pan||drag.touch){if(drag.touch&&!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)<9)return;if(drag.touch)drag.moved=true;{const a=toWorld(drag.lx,drag.ly),b=toWorld(p.x,p.y);cam.x+=a.x-b.x;cam.y+=a.y-b.y}drag.lx=p.x;drag.ly=p.y;clampCam();return}
  if(Math.hypot(p.x-drag.sx,p.y-drag.sy)>5)drag.box=true;
});
cv.addEventListener('pointerleave',()=>{mouse.in=false});
cv.addEventListener('pointerup',e=>{
  if(!drag)return;const p=evPos(e);const d=drag;drag=null;
  if(d.pan)return;
  if(d.touch){if(!d.moved)tap(p);return}
  if(d.box){const x0=Math.min(d.sx,p.x),x1=Math.max(d.sx,p.x),y0=Math.min(d.sy,p.y),y1=Math.max(d.sy,p.y);
    const us=G.ents.filter(u=>{if(u.dead||u.kind!=='unit'||u.team!==0)return false;const q=scr(u.x,u.y,entH(u)*.45);return q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1});
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
cv.addEventListener('wheel',e=>{e.preventDefault();if(!G)return;const p=evPos(e);const before=toWorld(p.x,p.y);
  cam.z=Math.max(.55,Math.min(1.8,cam.z*Math.exp(-e.deltaY*.0015*OPT.zoomSpeed)));camUpdate();const after=toWorld(p.x,p.y);cam.x+=before.x-after.x;cam.y+=before.y-after.y;clampCam()},{passive:false});
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
  else if(e.key==='f'||e.key==='F'){const ids=ownSel().filter(u=>u.kind==='unit').map(u=>u.id);if(ids.length){if(NET.client)NET.send({c:'rage',ids});else if(!useRage(0,ids))toast(tr('Kampfrausch lädt noch.'),'warn')}}
  else if(e.key==='m'||e.key==='M'){SND.setMute(!SND.muted);toast(SND.muted?tr('Ton aus'):tr('Ton an'))}
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
  let vx=0,vy=0;const s=700/cam.z*OPT.camSpeed;
  if(keys.ArrowLeft||keys.a)vx-=1;if(keys.ArrowRight||keys.d)vx+=1;if(keys.ArrowUp||keys.w)vy-=1;if(keys.ArrowDown||keys.s)vy+=1;
  if(OPT.edgeScroll&&mouse.in&&mouse.type==='mouse'&&!drag&&!mmDrag&&G&&G.running){const m=14;if(mouse.x<m)vx-=1;if(mouse.x>VW-m)vx+=1;if(mouse.y<m)vy-=1;if(mouse.y>VH-m)vy+=1}
  if(vx||vy){cam.x+=vx*s*dt;cam.y+=vy*s*dt;clampCam()}
}
function togglePause(){if(G.mp)return;G.paused=!G.paused;$('pauseBtn').textContent=G.paused?tr('Weiter'):tr('Pause')}
let idleIdx=0;
function selectIdle(){const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle');if(!idle.length){toast(tr('Alle Arbeiter haben zu tun.'));return}const u=idle[idleIdx++%idle.length];sel.clear();sel.add(u.id);centerOn(u.x,u.y);panelSig=''}
