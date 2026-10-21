/* Ego-Ansicht (Paket J, Phase 1): in die Augen einer eigenen Einheit, eines eigenen Gebäudes (Wachturm = Aussicht mit Zoom) oder eines sichtbaren Tieres schauen.
   Nur Ansehen, rein lokal (Spielstand und Mehrspieler bleiben unberührt). camUpdate() ruft bei EGO.on egoCam() statt der freien Kamera. */
const EGO={on:false,e:null,yaw:0,pitch:0,zoom:1,eye:1.5,tower:false,saved:null,drag:null};
/* Darf man in dieses Objekt schlüpfen? Eigene Dinge immer, Tiere nur wenn sie im sichtbaren Nebel-Bereich liegen (Nebel des Krieges wird nicht gespäht) */
EGO.can=e=>!!e&&!e.dead&&R3.ok&&(e.kind==='unit'&&e.team===0&&!e.inm||e.kind==='bld'&&e.team===0&&e.built&&e.type!=='wall'&&e.type!=='gate'&&e.type!=='trench'||e.kind==='animal'&&shown(e));
EGO.pick=()=>{const l=[...sel].map(id=>G.ents.find(o=>o.id===id)).filter(Boolean);return l.find(EGO.can)||null};
EGO.start=e=>{
  if(EGO.on||!EGO.can(e))return false;const o=R3.reg.get(entKey(e));if(!o)return false;
  const bb=new THREE.Box3().setFromObject(o.obj),h=Math.max(.8,bb.max.y-o.obj.position.y);
  EGO.e=e;EGO.tower=e.type==='tower';EGO.eye=h*(e.kind==='bld'?.94:.9);
  EGO.zoom=1;EGO.pitch=EGO.tower?-.12:0;
  EGO.yaw=e.fa!==undefined&&e.kind!=='bld'?Math.PI/2-e.fa:cam.yaw+Math.PI;
  EGO.saved={x:cam.x,y:cam.y,z:cam.z,yaw:cam.yaw,pitch:cam.pitch,tyaw:cam.tyaw,tpitch:cam.tpitch};
  EGO.on=true;document.body.classList.add('ego');EGO.ui();
  try{const p=cv.requestPointerLock&&cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}
  panelSig='';return true};
EGO.stop=()=>{
  if(!EGO.on)return;EGO.on=false;document.body.classList.remove('ego');const s=EGO.saved;
  if(s){Object.assign(cam,{x:s.x,y:s.y,z:s.z,yaw:s.yaw,pitch:s.pitch,tyaw:s.tyaw,tpitch:s.tpitch})}
  const o=EGO.e&&R3.reg.get(entKey(EGO.e));if(o)o.obj.visible=true;EGO.e=null;
  try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}
  if(R3.ok){r3.camera.fov=R3.FOV;r3.camera.updateProjectionMatrix();r3.camera.near=.8}
  R3.nodeT=0;EGO.ui();panelSig=''};
EGO.toggle=()=>{if(EGO.on)EGO.stop();else{const e=EGO.pick();if(e)EGO.start(e);else toast(tr('Wähle eine eigene Einheit, ein Gebäude oder ein sichtbares Tier.'),'warn')}};
EGO.ui=()=>{let el=document.getElementById('egohud');
  if(!el){el=document.createElement('div');el.id='egohud';el.innerHTML='<div class="eg-scope"></div><div class="eg-dot"></div><div class="eg-txt"></div>';document.getElementById('view').appendChild(el)}
  el.hidden=!EGO.on;if(EGO.on)EGO.txt()};
EGO.txt=()=>{const el=document.querySelector('#egohud .eg-txt');if(!el||!EGO.e)return;const e=EGO.e,nm=e.kind==='bld'?(BLDS[e.type]&&BLDS[e.type].name)||e.type:e.kind==='unit'?(UNITS[e.type]&&UNITS[e.type].name)||e.type:(ANIMALS[e.type]&&ANIMALS[e.type].name)||e.type;
  el.textContent=tr('Ego-Ansicht: {0}',tr(nm))+' · '+tr('Maus: umschauen · Mausrad: Zoom · Esc oder {0}: zurück',keyLabel(OPT.keys.ego||'v'))+(EGO.zoom>1.05?' · ×'+EGO.zoom.toFixed(1):'')};
/* Kamera aus den Augen (statt camUpdate der freien Kamera) */
function egoCam(){
  const e=EGO.e,o=e&&R3.reg.get(entKey(e));if(!o||e.dead||!EGO.can(e)){EGO.stop();return}
  const{camera,sun}=r3,S=R3.S,p=o.obj.position,gy=Math.max(0,hAt(e.x,e.y));
  const ex=p.x,ez=p.z,ey=Math.max(p.y,gy)+EGO.eye,cp=Math.cos(EGO.pitch),sy=Math.sin(EGO.yaw),cy=Math.cos(EGO.yaw);
  camera.aspect=VW/VH;camera.fov=R3.FOV*1.25/EGO.zoom;camera.near=.15;camera.updateProjectionMatrix();
  camera.position.set(ex,ey,ez);camera.lookAt(ex+cp*sy,ey+Math.sin(EGO.pitch),ez+cp*cy);camera.updateMatrixWorld();
  const reach=(EGO.tower?300:190)*Math.sqrt(Math.max(1,EGO.zoom));/* Zeichenweite in Welteinheiten: Nebel + Auslassen (Leistung) */
  r3.scene.fog.near=reach*.45;r3.scene.fog.far=reach;R3.farT=reach*1.05;R3.cull=reach*1.02*S;R3.cx=e.x;R3.cy=e.y;
  R3.k=(VH/(2*Math.tan(camera.fov*Math.PI/360)*30))/S;
  const b=Math.min(120,reach*.5);sun.position.set(ex-.95*b,ey+.85*b,ez-.5*b);sun.target.position.set(ex,gy,ez);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;sc.left=sc.bottom=-b;sc.right=sc.top=b;sc.near=1;sc.far=b*3.2;sc.updateProjectionMatrix();
  /* sichtbarer Ausschnitt für das Zeichnen = Quadrat um das Auge */
  const r=R3.cull;R3.view={x0:e.x-r,x1:e.x+r,y0:e.y-r,y1:e.y+r}}
/* eigene Figur/Gebäude ausblenden (nach r3Sync, vor dem Zeichnen) */
EGO.hide=()=>{const o=EGO.e&&R3.reg.get(entKey(EGO.e));if(o)o.obj.visible=false};
/* Eingabe: Fang-Listener (Capture), damit die normale Maus-/Tastensteuerung nicht mitläuft */
const _egoStop=e=>{e.stopImmediatePropagation();e.preventDefault()};
cv.addEventListener('pointerdown',e=>{if(!EGO.on)return;_egoStop(e);EGO.drag={x:e.clientX,y:e.clientY};try{if(!document.pointerLockElement&&cv.requestPointerLock)cv.requestPointerLock()}catch(_){}},true);
cv.addEventListener('pointerup',e=>{if(!EGO.on)return;_egoStop(e);EGO.drag=null},true);
cv.addEventListener('pointermove',e=>{if(!EGO.on)return;e.stopImmediatePropagation();
  let dx=0,dy=0;if(document.pointerLockElement){dx=e.movementX||0;dy=e.movementY||0}else if(EGO.drag){dx=e.clientX-EGO.drag.x;dy=e.clientY-EGO.drag.y;EGO.drag={x:e.clientX,y:e.clientY}}
  if(dx||dy){const k=.0042*OPT.camRot/Math.sqrt(EGO.zoom);EGO.yaw-=dx*k;EGO.pitch=Math.max(-1.35,Math.min(1.35,EGO.pitch-dy*k))}},true);
cv.addEventListener('wheel',e=>{if(!EGO.on)return;e.stopImmediatePropagation();e.preventDefault();EGO.zoom=Math.max(1,Math.min(6,EGO.zoom*Math.exp(-e.deltaY*.0016*OPT.zoomSpeed)));EGO.txt()},true);
cv.addEventListener('contextmenu',e=>{if(EGO.on)_egoStop(e)},true);
addEventListener('keydown',e=>{
  if(!G||!G.running)return;
  if(EGO.on&&(e.key==='Escape'||kA(e)==='ego')){e.stopImmediatePropagation();e.preventDefault();EGO.stop();return}
  if(!EGO.on&&kA(e)==='ego'&&!menuOpen&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;e.stopImmediatePropagation();EGO.toggle()}},true);
/* Partie beendet / Objekt verschwunden: Ego-Ansicht verlassen */
setInterval(()=>{if(EGO.on&&(!G||!G.running||!EGO.e||EGO.e.dead))EGO.stop()},400);
