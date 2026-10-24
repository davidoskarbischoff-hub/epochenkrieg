/* Ego-Ansicht (Paket J, Phase 1): in die Augen einer eigenen Einheit, eines eigenen Gebäudes (Wachturm = Aussicht mit Zoom) oder eines sichtbaren Tieres schauen.
   Nur Ansehen, rein lokal (Spielstand und Mehrspieler bleiben unberührt). camUpdate() ruft bei EGO.on egoCam() statt der freien Kamera. */
const EGO={on:false,e:null,yaw:0,pitch:0,zoom:1,eye:1.5,tower:false,saved:null,drag:null,ctl:false,mv:null,mvT:0,fire:0,bobP:0,bobA:0,sp:0,kick:0,kickK:1,hintT:0,aimT:0,tgt:null};
/* Darf man in dieses Objekt schlüpfen? Eigene Dinge immer, Tiere nur wenn sie im sichtbaren Nebel-Bereich liegen (Nebel des Krieges wird nicht gespäht) */
EGO.can=e=>!!e&&!e.dead&&R3.ok&&(e.kind==='unit'&&e.team===0&&!e.inm||e.kind==='bld'&&e.team===0&&e.built&&e.type!=='wall'&&e.type!=='gate'&&e.type!=='trench'||e.kind==='animal'&&shown(e));
/* Steuerbar: nur eigene Einheit (kein Gebäude/Tier); Befehle laufen wie normale Spielerbefehle (command/giveOrder, im Mehrspieler als 'cmd') */
EGO.canCtl=e=>!!e&&e.kind==='unit'&&e.team===0&&!e.dead&&!e.upj;
EGO.pick=()=>{const l=[...sel].map(id=>G.ents.find(o=>o.id===id)).filter(Boolean);return l.find(EGO.can)||null};
/* an eine Figur/ein Gebäude "anheften": Augenhöhe aus der Modellhöhe, Steuerung nur bei eigenen Einheiten */
EGO.attach=(e,o)=>{const bb=new THREE.Box3().setFromObject(o.obj),h=Math.max(.8,bb.max.y-o.obj.position.y);
  EGO.e=e;EGO.tower=e.type==='tower';EGO.ctl=EGO.canCtl(e);EGO.mv=null;if(EGO.ctl){sel.clear();sel.add(e.id)}EGO.eye=h*(e.kind==='bld'?.94:.9);
  EGO.lx=e.x;EGO.ly=e.y;EGO.sp=0;EGO.hp0=e.hp;EGO.tgt=null;EGO.nextFire=0};
EGO.start=e=>{
  if(EGO.on||!EGO.can(e))return false;const o=R3.reg.get(entKey(e));if(!o)return false;
  EGO.attach(e,o);
  if(EGO.tower&&!G.mp&&G.speed!==1){EGO.speedBack=G.speed;G.speed=1;try{uiRefresh&&uiRefresh()}catch(_){}} /* Turm: Tempo 1, beim Verlassen zurück (David 24.10.) */
  EGO.zoom=1;EGO.pitch=EGO.tower?-.12:0;EGO.hintT=performance.now()+8000;
  EGO.yaw=e.fa!==undefined&&e.kind!=='bld'?Math.PI/2-e.fa:cam.yaw+Math.PI;
  EGO.saved={x:cam.x,y:cam.y,z:cam.z,yaw:cam.yaw,pitch:cam.pitch,tyaw:cam.tyaw,tpitch:cam.tpitch};
  EGO.on=true;document.body.classList.add('ego');EGO.ui();
  try{const p=cv.requestPointerLock&&cv.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(_){}
  panelSig='';return true};
EGO.stop=(pos)=>{
  if(!EGO.on)return;EGO.on=false;document.body.classList.remove('ego');const s=EGO.saved;
  if(EGO.speedBack){if(!G.mp)G.speed=EGO.speedBack;EGO.speedBack=0}
  if(s){Object.assign(cam,{x:s.x,y:s.y,z:s.z,yaw:s.yaw,pitch:s.pitch,tyaw:s.tyaw,tpitch:s.tpitch})}
  if(EGO.mv&&EGO.e&&!EGO.e.dead)EGO.go(0,0);const o=EGO.e&&R3.reg.get(entKey(EGO.e));if(o)o.obj.visible=true;EGO.e=null;EGO.tgt=null;EGO.ctl=false;EGO.mv=null;if(typeof ROOM!=='undefined'&&ROOM.apply)ROOM.apply();
  try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}
  if(R3.ok){r3.camera.fov=R3.FOV;r3.camera.updateProjectionMatrix();r3.camera.near=.8}
  R3.nodeT=0;EGO.ui();panelSig='';if(pos)centerOn(pos.x,pos.y)};
/* nächste/vorherige eigene Einheit (nach Nummer sortiert); aus Gebäude/Tier heraus: die erste bzw. letzte */
EGO.cycle=dir=>{const l=G.ents.filter(u=>u.kind==='unit'&&u.team===0&&u.type!=='cart'&&EGO.canCtl(u)&&!u.inm&&R3.reg.get(entKey(u))).sort((a,b)=>a.id-b.id);if(!l.length)return;
  let i=l.indexOf(EGO.e);i=i<0?(dir>0?0:l.length-1):(i+dir+l.length)%l.length;const n=l[i];if(n===EGO.e)return;
  if(EGO.mv&&EGO.e&&!EGO.e.dead)EGO.go(0,0);const o0=EGO.e&&R3.reg.get(entKey(EGO.e));if(o0)o0.obj.visible=true;
  EGO.attach(n,R3.reg.get(entKey(n)));EGO.pitch=0;EGO.yaw=n.fa!==undefined?Math.PI/2-n.fa:EGO.yaw;EGO.zoom=1;EGO.hintT=performance.now()+3000;EGO.txt();
  const h=document.getElementById('egohud');if(h){h.classList.add('sw');setTimeout(()=>h.classList.remove('sw'),260)}};
EGO.toggle=()=>{if(EGO.on)EGO.stop();else{const e=EGO.pick();if(e)EGO.start(e);else toast(tr('Wähle eine eigene Einheit, ein Gebäude oder ein sichtbares Tier.'),'warn')}};
EGO.ui=()=>{let el=document.getElementById('egohud');
  if(!el){el=document.createElement('div');el.id='egohud';el.innerHTML='<div class="eg-scope"></div><div class="eg-cross"></div><div class="eg-dot"></div><div class="eg-txt"></div><div class="eg-me"><b></b><div class="eg-bar"><i></i></div></div><div class="eg-tg" hidden><b></b><span></span><div class="eg-bar"><i></i></div></div>';document.getElementById('view').appendChild(el)}
  el.hidden=!EGO.on;if(EGO.on)EGO.txt()};
EGO.scopeOn=()=>EGO.tower||EGO.zoom>2.2;
EGO.txt=()=>{const el=document.querySelector('#egohud .eg-txt');if(!el||!EGO.e)return;const e=EGO.e,nm=e.kind==='bld'?(BLDS[e.type]&&BLDS[e.type].name)||e.type:e.kind==='unit'?(UNITS[e.type]&&UNITS[e.type].name)||e.type:(ANIMALS[e.type]&&ANIMALS[e.type].name)||e.type;
  const hud=document.getElementById('egohud');if(hud)hud.classList.toggle('scope',EGO.scopeOn());
  const kv=keyLabel(OPT.keys.ego||'v'),kn=keyLabel(OPT.keys.egoNext||'Tab'),full=performance.now()<EGO.hintT;
  const how=EGO.tower?tr('Klick/Leertaste: Turm feuert · Maus: umschauen · Mausrad: Zoom · Esc oder {0}: zurück',kv):EGO.ctl?(full?tr('WASD: gehen · Maus: umschauen · Klick/Leertaste: schlagen, schießen, sammeln · Rad: Zoom · {1}: nächste Einheit · Esc oder {0}: zurück',kv,kn):tr('Esc oder {0}: zurück · {1}: nächste Einheit',kv,kn)):tr('Maus: umschauen · Mausrad: Zoom · Esc oder {0}: zurück',kv);
  el.textContent=tr('Ego-Ansicht: {0}',tr(nm))+' · '+how+(EGO.zoom>1.05?' · ×'+EGO.zoom.toFixed(1):'');el.classList.toggle('quiet',!full&&!EGO.tower)};
/* Nachlade-Anzeige im Turm (#egohud .eg-rl): Balken füllt sich, solange der Turm nachlädt */
EGO.reloadUi=dt=>{const hud=document.getElementById('egohud');if(!hud)return;let el=hud.querySelector('.eg-rl');
  const e=EGO.e,ud=e&&e.kind==='unit'&&UNITS[e.type],bd=e&&e.kind==='bld'&&BLDS[e.type]&&BLDS[e.type].shoot,now=performance.now();
  if(!EGO.on||!e||!(bd||(EGO.ctl&&ud&&ud.atk>0))){if(el)el.hidden=true;if(EGO.on)EGO.hudTick(hud,now);return}
  if(!el){el=document.createElement('div');el.className='eg-rl';el.innerHTML='<i></i>';hud.appendChild(el)}
  const cd=bd?bd.cd*(e.spec==='obs'?1.3:1):ud.cd;let f=1;if(NET.client){const rem=Math.max(EGO.nextFire>now?EGO.nextFire-now:0,(e.cd||0)*1000);f=rem>0?Math.max(0,1-rem/(cd*1000)):1}else f=e.cd>0?1-e.cd/cd:1;
  el.hidden=false;el.firstChild.style.width=Math.round(Math.max(0,Math.min(1,f))*100)+'%';el.classList.toggle('ready',f>=1);
  if(EGO.flash>0){EGO.flash=0;hud.classList.add('shot');setTimeout(()=>hud.classList.remove('shot'),120)}
  EGO.hudTick(hud,now)};
/* HUD: eigenes Leben, Ziel im Fadenkreuz (Name, Leben, Entfernung, in Reichweite), Hinweiszeile verblasst nach dem Einstieg */
EGO.inRange=t=>{const e=EGO.e;if(!e||!t)return false;const d=e.kind==='unit'?UNITS[e.type]:(BLDS[e.type]||{}).shoot;if(!d)return false;
  const g=Math.hypot(t.x-e.x,t.y-e.y)-(e.kind==='unit'?e.r+(t.r||0):0);return g<=d.rng*(e.spec==='def'?1.3:e.spec==='obs'?.8:1)};
EGO.hudTick=(hud,now)=>{const e=EGO.e;if(!e)return;
  if(now-EGO.aimT>110){EGO.aimT=now;EGO.tgt=(EGO.ctl||EGO.tower)?EGO.aim():null;if(EGO.hintT&&now>EGO.hintT){EGO.hintT=0;EGO.txt()}}
  const me=hud.querySelector('.eg-me'),tg=hud.querySelector('.eg-tg'),dot=hud.querySelector('.eg-dot');
  if(e.maxHp>0&&e.hp!==undefined){me.hidden=false;me.firstChild.textContent=tr(e.kind==='bld'?(BLDS[e.type]||{}).name||e.type:(UNITS[e.type]||ANIMALS[e.type]||{}).name||e.type)+' '+Math.max(0,Math.round(e.hp))+'/'+Math.round(e.maxHp);
    me.querySelector('i').style.width=Math.round(Math.max(0,Math.min(1,e.hp/e.maxHp))*100)+'%';if(e.hp<EGO.hp0-.4){hud.classList.add('hurt');setTimeout(()=>hud.classList.remove('hurt'),220)}EGO.hp0=e.hp}else me.hidden=true;
  const t=EGO.tgt;if(t&&!t.dead&&shown(t)){const nm=t.kind==='node'?(NODES[t.type]||{}).name||t.type:t.kind==='bld'?(BLDS[t.type]||{}).name||t.type:t.kind==='unit'?(UNITS[t.type]||{}).name||t.type:(ANIMALS[t.type]||{}).name||t.type;
    const foe=t.kind!=='node'&&t.team!==0,dist=Math.round(Math.hypot(t.x-e.x,t.y-e.y)/10);tg.hidden=false;tg.classList.toggle('foe',foe);
    tg.firstChild.textContent=tr(nm);tg.children[1].textContent=(t.kind==='node'?tr('Vorrat {0}',Math.round(t.amount||0)):t.maxHp?Math.max(0,Math.round(t.hp))+'/'+Math.round(t.maxHp):'')+' · '+tr('{0} m',dist);
    const bar=tg.querySelector('.eg-bar');bar.hidden=!(t.maxHp>0);if(t.maxHp>0)bar.firstChild.style.width=Math.round(Math.max(0,Math.min(1,t.hp/t.maxHp))*100)+'%';
    dot.classList.toggle('in',foe&&EGO.inRange(t))}else{tg.hidden=true;dot.classList.remove('in')}};
/* Befehl wie vom Spieler: nur diese Einheit auswählen, command() (Wegfindung, Kollision, im Mehrspieler 'cmd' mit Wächter) */
EGO.order=(x,y,t)=>{const e=EGO.e;if(!e||!EGO.ctl||e.dead)return;if(!(sel.size===1&&sel.has(e.id))){sel.clear();sel.add(e.id)}
  NET.tgtSet=true;NET.tgt=t||null;try{command(x,y,false)}finally{NET.tgtSet=false;NET.tgt=null}};
/* Gehen: Richtung relativ zum Blick (vor = (sin yaw, cos yaw)), Ziel kurz vor der Figur */
EGO.go=(f,r)=>{const e=EGO.e;if(!e)return;let dx=Math.sin(EGO.yaw)*f-Math.cos(EGO.yaw)*r,dy=Math.cos(EGO.yaw)*f+Math.sin(EGO.yaw)*r;const l=Math.hypot(dx,dy);
  if(!l){EGO.order(e.x,e.y,null);EGO.mv=null;return}const L=70;EGO.order(e.x+dx/l*L,e.y+dy/l*L,null);EGO.mv=[f,r];EGO.mvT=0};
/* anvisiertes Ziel: kleinster Winkel zur Blickrichtung (nur sichtbare Dinge, kein Nebel-Spähen) */
EGO.aim=()=>{const e=EGO.e,o=e&&R3.reg.get(entKey(e));if(!o)return null;const cp=Math.cos(EGO.pitch),dir=[cp*Math.sin(EGO.yaw),Math.sin(EGO.pitch),cp*Math.cos(EGO.yaw)],S=R3.S,wk=!!(UNITS[e.type]||{}).gather,ey=Math.max(o.obj.position.y,hAt(e.x,e.y))+EGO.eye;let best=null,ba=.16/Math.sqrt(EGO.zoom);
  for(const t of G.ents){if(t.dead||t===e||!shown(t))continue;
    const ok=t.kind==='node'?(wk&&nodeKnown(t)&&nodeEpochOk(t,0)):(t.team===1&&(t.kind==='unit'||t.kind==='bld')||t.kind==='animal');if(!ok)continue;
    const vx=t.x/S-o.obj.position.x,vz=t.y/S-o.obj.position.z,to=R3.reg.get(entKey(t)),vy=Math.max(to?to.obj.position.y:0,hAt(t.x,t.y))+1.2-ey,d=Math.hypot(vx,vy,vz);if(d<.1||d*S>360)continue;
    const a=Math.acos(Math.max(-1,Math.min(1,(vx*dir[0]+vy*dir[1]+vz*dir[2])/d)));const ar=Math.atan((t.r||8)/S/d);if(a-ar<ba&&EGO.clear(o.obj.position.x,ey,o.obj.position.z,t.x/S,vy+ey,t.y/S)){ba=a-ar;best=t}}
  return best};
/* einfacher Sichttest: Gelände (hAt) zwischen Auge und Ziel darf die Sichtlinie nicht überragen (Berge/Hügel verdecken) */
EGO.clear=(x0,y0,z0,x1,y1,z1)=>{for(let i=1;i<8;i++){const f=i/8,gx=(x0+(x1-x0)*f)*R3.S,gz=(z0+(z1-z0)*f)*R3.S;if(Math.max(0,hAt(gx,gz))>y0+(y1-y0)*f+.15)return false}return true};
EGO.act=()=>{if(EGO.tower&&EGO.e&&EGO.e.kind==='bld'){EGO.shoot();return}if(!EGO.ctl)return;const e=EGO.e,d=UNITS[e.type],t=EGO.aim();if(!t){toast(tr('Kein Ziel im Fadenkreuz.'),'warn');return}
  const foe=t.kind!=='node'&&t.team!==0;if(foe&&d.atk>0&&EGO.inRange(t)){EGO.strike(t);return}EGO.order(t.x,t.y,t)};
/* Schlag/Schuss der eigenen Einheit auf das Ziel im Fadenkreuz (Reichweite/Schaden/Nachladezeit wie im normalen Kampf, siehe unitStrike) */
EGO.strike=t=>{const e=EGO.e,d=UNITS[e.type],now=performance.now();
  if(NET.client){if(EGO.nextFire>now)return;EGO.nextFire=now+d.cd*1000;unitStrike(0,e.id,t.id);EGO.fx(d);return}
  if(unitStrike(0,e.id,t.id))EGO.fx(d)};
EGO.fx=d=>{EGO.flash=1;EGO.kick=1;EGO.kickK=(d.ranged||d.air)?-.5:1};
/* Turm: Schuss auf das Ziel im Fadenkreuz (nur Feinde/Tiere; gleiche Sichtprüfung wie die Zielwahl). Nachladen = b.cd des Turms. */
EGO.aimFoe=()=>{const t=EGO.aim();return t&&(t.kind==='unit'||t.kind==='animal'||t.kind==='bld')&&t.team!==0?t:null};
EGO.aimPoint=()=>{const e=EGO.e,o=e&&R3.reg.get(entKey(e));if(!o)return null;const cp=Math.cos(EGO.pitch),dx=cp*Math.sin(EGO.yaw),dy=Math.sin(EGO.pitch),dz=cp*Math.cos(EGO.yaw),S=R3.S;let x=o.obj.position.x,y=Math.max(o.obj.position.y,hAt(e.x,e.y))+EGO.eye,z=o.obj.position.z;
  for(let i=0;i<120;i++){x+=dx*.5;y+=dy*.5;z+=dz*.5;if(Math.max(0,hAt(x*S,z*S))>y)break}return{x:x*S,y:z*S}};
EGO.shoot=()=>{const b=EGO.e;if(!b||b.kind!=='bld'||!BLDS[b.type].shoot)return;const t=EGO.aimFoe();
  if(!t){/* kein Ziel im Fadenkreuz: trotzdem schiessen, Pfeil fliegt in Blickrichtung */const P=EGO.aimPoint();if(!P)return;
    if(NET.client){b.manT=G.t+2.5;if(!(EGO.nextFire>performance.now())){EGO.nextFire=performance.now()+BLDS[b.type].shoot.cd*1000;towerFire(0,b.id,0,P.x,P.y);EGO.flash=1}return}
    if(towerFire(0,b.id,0,P.x,P.y))EGO.flash=1;return}
  if(NET.client){b.manT=G.t+2.5;if(!(EGO.nextFire>performance.now())){EGO.nextFire=performance.now()+BLDS[b.type].shoot.cd*1000;towerFire(0,b.id,t.id);EGO.flash=1}return}
  if(towerFire(0,b.id,t.id))EGO.flash=1;else if(b.cd>0)EGO.flash=EGO.flash||0;else toast(tr('Ziel ausser Reichweite.'),'warn')};
EGO.tick=dt=>{EGO.reloadUi(dt);if(!EGO.on||!EGO.ctl||!EGO.e||(typeof menuOpen!=='undefined'&&menuOpen))return;
  const f=(keys.w||keys.ArrowUp?1:0)-(keys.s||keys.ArrowDown?1:0),r=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0);
  if(f||r){EGO.mvT-=dt;const ch=!EGO.mv||EGO.mv[0]!==f||EGO.mv[1]!==r;if(ch||EGO.mvT<=0||EGO.yawSent===undefined||Math.abs(EGO.yaw-EGO.yawSent)>.12){EGO.go(f,r);EGO.mvT=.25;EGO.yawSent=EGO.yaw}}
  else if(EGO.mv){EGO.go(0,0)}};
/* Kamera aus den Augen (statt camUpdate der freien Kamera) */
function egoCam(){
  const e=EGO.e,o=e&&R3.reg.get(entKey(e));if(!o||e.dead||!EGO.can(e)){if(e&&e.team===0&&e.kind==='unit'&&e.dead)toast(tr('Deine Einheit ist gefallen.'),'warn');else if(e&&e.kind==='animal'&&!e.dead)toast(tr('Das Tier ist ausser Sicht.'));EGO.stop(e&&e.dead?{x:e.x,y:e.y}:null);return}
  if(typeof ROOM!=='undefined'){if(ROOM.g&&ROOM.g.visible)ROOM.g.visible=false;if(ROOM.board&&ROOM.board.visible)ROOM.board.visible=false;if(ROOM.spot&&ROOM.spot.visible)ROOM.spot.visible=false}/* Raum-Foto nicht zeigen: Blick über den Kartenrand = Himmelsfarbe statt Foto */
  {const A=R3.atmo;r3.scene.background=EGO.bg||(EGO.bg=new THREE.Color());EGO.bg.set(A?A.sky:0x16384f);r3.scene.fog.color.set(A?A.fog:0x9db8c4)}
  const{camera,sun}=r3,S=R3.S,p=o.obj.position,gy=Math.max(0,hAt(e.x,e.y));
  const now=performance.now(),dtm=Math.min(.1,Math.max(.001,(now-(EGO.bt||now))/1000));EGO.bt=now;
  /* Kopf-Wippen beim Gehen (nur Fußtruppen am Boden, Option) und kurzer Rückstoß beim Schlag/Schuss */
  const ud=e.kind==='unit'&&UNITS[e.type]||{},spn=Math.hypot(e.x-EGO.lx,e.y-EGO.ly)/dtm;EGO.lx=e.x;EGO.ly=e.y;EGO.sp+=(Math.min(spn,140)-EGO.sp)*Math.min(1,dtm*6);
  EGO.bobA+=((OPT.egoBob&&EGO.ctl&&!ud.air&&!ud.naval&&EGO.sp>8?1:0)-EGO.bobA)*Math.min(1,dtm*8);EGO.bobP+=dtm*EGO.sp*.1;EGO.kick=Math.max(0,EGO.kick-dtm*4.5);
  const bob=Math.sin(EGO.bobP*2)*.045*EGO.bobA/Math.sqrt(EGO.zoom),roll=Math.cos(EGO.bobP)*.012*EGO.bobA,kk=EGO.kick*EGO.kick*.07*EGO.kickK;
  const ex=p.x,ez=p.z,ey=Math.max(p.y,gy)+EGO.eye+bob,cp=Math.cos(EGO.pitch),sy=Math.sin(EGO.yaw),cy=Math.cos(EGO.yaw);
  camera.aspect=VW/VH;camera.fov=R3.FOV*1.25/EGO.zoom;camera.near=.15;camera.updateProjectionMatrix();
  camera.position.set(ex,ey,ez);camera.up.set(Math.sin(roll)*Math.cos(EGO.yaw),Math.cos(roll),-Math.sin(roll)*Math.sin(EGO.yaw));camera.lookAt(ex+cp*sy,ey+Math.sin(EGO.pitch-kk),ez+cp*cy);camera.updateMatrixWorld();
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
cv.addEventListener('pointerdown',e=>{if(!EGO.on)return;_egoStop(e);EGO.drag={x:e.clientX,y:e.clientY};EGO.dn={x:e.clientX,y:e.clientY};try{if(!document.pointerLockElement&&cv.requestPointerLock)cv.requestPointerLock()}catch(_){}},true);
cv.addEventListener('pointerup',e=>{if(!EGO.on)return;_egoStop(e);const d=EGO.drag;EGO.drag=null;if((EGO.ctl||EGO.tower)&&e.button===0&&(!d||!EGO.dn||Math.hypot(e.clientX-EGO.dn.x,e.clientY-EGO.dn.y)<5))EGO.act()},true);
cv.addEventListener('pointermove',e=>{if(!EGO.on)return;e.stopImmediatePropagation();
  let dx=0,dy=0;if(document.pointerLockElement){dx=e.movementX||0;dy=e.movementY||0}else if(EGO.drag){dx=e.clientX-EGO.drag.x;dy=e.clientY-EGO.drag.y;EGO.drag={x:e.clientX,y:e.clientY}}
  if(dx||dy){const k=.0042*OPT.camRot*(OPT.egoSens||1)/Math.sqrt(EGO.zoom);EGO.yaw-=dx*k;EGO.pitch=Math.max(-1.35,Math.min(1.35,EGO.pitch-dy*k))}},true);
cv.addEventListener('wheel',e=>{if(!EGO.on)return;e.stopImmediatePropagation();e.preventDefault();EGO.zoom=Math.max(1,Math.min(6,EGO.zoom*Math.exp(-e.deltaY*.0016*OPT.zoomSpeed)));EGO.txt()},true);
cv.addEventListener('contextmenu',e=>{if(EGO.on)_egoStop(e)},true);
addEventListener('keydown',e=>{
  if(!G||!G.running)return;
  if(EGO.on&&(e.key==='Escape'||kA(e)==='ego')){e.stopImmediatePropagation();e.preventDefault();EGO.stop();return}
  if(EGO.on&&kA(e)==='egoNext'){e.stopImmediatePropagation();e.preventDefault();if(!e.repeat)EGO.cycle(e.shiftKey?-1:1);return}
  if(EGO.on&&(EGO.ctl||EGO.tower)&&(e.code==='Space'||e.key===' ')){e.stopImmediatePropagation();e.preventDefault();if(!e.repeat)EGO.act();return}
  if(!EGO.on&&kA(e)==='ego'&&!menuOpen&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;e.stopImmediatePropagation();EGO.toggle()}},true);
/* Partie beendet / Objekt verschwunden: Ego-Ansicht verlassen */
setInterval(()=>{if(EGO.on&&(!G||!G.running||!EGO.e||EGO.e.dead))EGO.stop()},400);
