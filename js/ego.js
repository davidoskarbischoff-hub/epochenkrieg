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
  if(EGO.mv&&EGO.e&&!EGO.e.dead)EGO.go(0,0);const o=EGO.e&&R3.reg.get(entKey(EGO.e));if(o)o.obj.visible=true;if(EGO.sky)EGO.sky.mesh.visible=false;EGO.clT=0;try{EGO.chunkLod()}catch(_){}EGO.e=null;EGO.tgt=null;EGO.ctl=false;EGO.mv=null;if(typeof ROOM!=='undefined'&&ROOM.apply)ROOM.apply();
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
/* Himmel der Ego-Ansicht: Verlauf Horizont (= Nebelfarbe, damit der Horizont nahtlos wird) → Zenit, Sonne mit Glanz, weiche Wolken; folgt der Kamera, nur in der Ego-Ansicht sichtbar */
const SKYZ={spring:0x4a82c4,summer:0x3b73c2,autumn:0x6f93b6,winter:0x9bb2c8};
EGO.skyMake=()=>{
  const U={uZ:{value:new THREE.Color()},uH:{value:new THREE.Color()},uS:{value:new THREE.Vector3(-.6,.6,-.3)},uC:{value:new THREE.Color(0xfff0c8)},uT:{value:0}};
  const m=new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
    vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`varying vec3 vD;uniform vec3 uZ,uH,uS,uC;uniform float uT;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float e=max(d.y,0.);float t=pow(e,.55);vec3 c=mix(uH,uZ,smoothstep(0.,1.,t));
 float sd=max(dot(d,normalize(uS)),0.);c+=uC*(pow(sd,900.)*3.+pow(sd,24.)*.22+pow(sd,5.)*.07);
 vec2 p=d.xz/(e+.22)*1.7+vec2(uT*.012,uT*.004);float cl=smoothstep(.52,.8,fbm(p))*smoothstep(.01,.2,e);
 c=mix(c,mix(uH,vec3(1.),.75)*(.85+.3*sd),cl*.85);
 gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1000,40,24),m);mesh.renderOrder=-100;mesh.frustumCulled=false;r3.scene.add(mesh);return{mesh,U}};
/* Gelände in der Ego-Ansicht: nahe Stücke fein, ferne grob (nach Abstand zum Auge, statt global nach Zoom); reset = zurück zum Zustand der freien Kamera */
EGO.chunkLod=(ex,ez)=>{for(const gp of R3.chunkGrps||[])for(const c of gp.children){const u=c.userData;if(!u.lo)continue;
  if(u.cx===undefined){const b=u.hi.boundingBox;u.cx=(b.min.x+b.max.x)/2;u.cz=(b.min.z+b.max.z)/2}
  const g=ex===undefined?(R3.lodOn?u.lo:u.hi):((u.cx-ex)*(u.cx-ex)+(u.cz-ez)*(u.cz-ez)>2500?u.lo:u.hi);if(c.geometry!==g)c.geometry=g}};
/* Kamera aus den Augen (statt camUpdate der freien Kamera) */
function egoCam(){
  const e=EGO.e,o=e&&R3.reg.get(entKey(e));if(!o||e.dead||!EGO.can(e)){if(e&&e.team===0&&e.kind==='unit'&&e.dead)toast(tr('Deine Einheit ist gefallen.'),'warn');else if(e&&e.kind==='animal'&&!e.dead)toast(tr('Das Tier ist ausser Sicht.'));EGO.stop(e&&e.dead?{x:e.x,y:e.y}:null);return}
  if(typeof ROOM!=='undefined'){if(ROOM.g&&ROOM.g.visible)ROOM.g.visible=false;if(ROOM.board&&ROOM.board.visible)ROOM.board.visible=false;if(ROOM.spot&&ROOM.spot.visible)ROOM.spot.visible=false}/* Raum-Foto nicht zeigen: Blick über den Kartenrand = Himmelsfarbe statt Foto */
  {const A=R3.atmo;r3.scene.background=EGO.bg||(EGO.bg=new THREE.Color());const fh=R3.fogNow||(A?A.fog:0x9db8c4);EGO.bg.set(fh);r3.scene.fog.color.set(fh);
   const K=EGO.sky||(EGO.sky=EGO.skyMake());K.mesh.visible=true;K.U.uH.value.set(R3.fogNow||(A?A.fog:0x9db8c4));K.U.uZ.value.set(SKYZ[R3.se]||SKYZ.summer);K.U.uT.value=performance.now()/1000;K.mesh.position.copy(r3.camera.position);K.U.uS.value.copy(r3.sun.position).sub(r3.sun.target.position)}
  const{camera,sun}=r3,S=R3.S,p=o.obj.position,gy=Math.max(0,hAt(e.x,e.y));
  const now=performance.now(),dtm=Math.min(.1,Math.max(.001,(now-(EGO.bt||now))/1000));EGO.bt=now;
  /* Kopf-Wippen beim Gehen (nur Fußtruppen am Boden, Option) und kurzer Rückstoß beim Schlag/Schuss */
  const ud=e.kind==='unit'&&UNITS[e.type]||{},spn=Math.hypot(e.x-EGO.lx,e.y-EGO.ly)/dtm;EGO.lx=e.x;EGO.ly=e.y;EGO.sp+=(Math.min(spn,140)-EGO.sp)*Math.min(1,dtm*6);
  EGO.bobA+=((OPT.egoBob&&EGO.ctl&&!ud.air&&!ud.naval&&EGO.sp>8?1:0)-EGO.bobA)*Math.min(1,dtm*8);EGO.bobP+=dtm*EGO.sp*.1;EGO.kick=Math.max(0,EGO.kick-dtm*4.5);
  const bob=Math.sin(EGO.bobP*2)*.045*EGO.bobA/Math.sqrt(EGO.zoom),roll=Math.cos(EGO.bobP)*.012*EGO.bobA,kk=EGO.kick*EGO.kick*.07*EGO.kickK;
  const ex=p.x,ez=p.z,ey=Math.max(p.y,gy)+EGO.eye+bob,cp=Math.cos(EGO.pitch),sy=Math.sin(EGO.yaw),cy=Math.cos(EGO.yaw);
  camera.aspect=VW/VH;camera.fov=R3.FOV*1.5/EGO.zoom;camera.near=.15;camera.updateProjectionMatrix();
  camera.position.set(ex,ey,ez);camera.up.set(Math.sin(roll)*Math.cos(EGO.yaw),Math.cos(roll),-Math.sin(roll)*Math.sin(EGO.yaw));camera.lookAt(ex+cp*sy,ey+Math.sin(EGO.pitch-kk),ez+cp*cy);camera.updateMatrixWorld();
  const reach=(EGO.tower?420:280)*Math.sqrt(Math.max(1,EGO.zoom));/* Zeichenweite in Welteinheiten: Nebel + Auslassen (Leistung) */
  r3.scene.fog.near=reach*.3;r3.scene.fog.far=reach;R3.farT=reach*1.05;R3.cull=reach*1.02*S;R3.fl=1;if(!EGO.clT||performance.now()>EGO.clT){EGO.clT=performance.now()+250;EGO.chunkLod(ex,ez)}R3.cx=e.x;R3.cy=e.y;
  R3.k=(VH/(2*Math.tan(camera.fov*Math.PI/360)*30))/S;
  const b=Math.min(120,reach*.5);sun.position.set(ex+R3.sd[0]*b,ey+R3.sd[1]*b,ez+R3.sd[2]*b);sun.target.position.set(ex,gy,ez);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;sc.left=sc.bottom=-b;sc.right=sc.top=b;sc.near=1;sc.far=b*3.2;sc.updateProjectionMatrix();
  /* sichtbarer Ausschnitt für das Zeichnen = Quadrat um das Auge */
  const r=R3.cull;R3.view={x0:e.x-r,x1:e.x+r,y0:e.y-r,y1:e.y+r};EGO.vmUpdate(dtm)}
/* Waffe im Bild (Ego, eigene Einheit): das echte Waffenmodell der Figur (EKMODELS.held) steht unten im Bild. Eigener Zeichendurchgang nach der Welt
   (Tiefe gelöscht, deshalb taucht sie nie in Wände/Gelände ein), eigene Kamera mit festem Blickwinkel (Zoom ändert die Grösse nicht), Lichter aus der Welt kopiert.
   Haltung je Datei in VMP: len = längste Seite im Bild, fix = Drehung, die die Spitze nach +Y legt (Grad), grip = Griffstelle als Anteil der Länge von unten,
   at = Griffpunkt im Bild (x rechts, y oben, z vorn = negativ), tilt = [Spitze nach vorn, Spitze zur Mitte] in Grad, how = Bewegung beim Angriff (melee/thrust/shoot/none). */
const VMP={
 'waffen/Sword_1_A.glb':{len:.62,fix:[0,90,0],grip:.12,at:[.30,-.36,-.62],tilt:[40,16],how:'melee'},
 'neu/Sword.glb':{len:.62,fix:[0,90,0],grip:.12,at:[.30,-.36,-.62],tilt:[40,16],how:'melee'},
 'waffen/BattleAxe_1_1_A.glb':{len:.62,fix:[0,90,0],grip:.2,at:[.30,-.36,-.62],tilt:[40,12],how:'melee'},
 'waffen/SpikedClub_1_A.glb':{len:.55,fix:[0,0,0],grip:.15,at:[.30,-.36,-.62],tilt:[40,14],how:'melee'},
 'neu/Wooden Torch.glb':{len:.7,fix:[0,0,0],grip:.15,at:[.30,-.36,-.62],tilt:[38,14],how:'melee'},
 'neu/Spear.glb':{len:1.5,fix:[0,0,0],grip:.3,at:[.30,-.34,-.6],tilt:[66,10],how:'thrust'},
 'waffen/DruidStaff_2_1_A.glb':{len:.95,fix:[0,0,0],grip:.3,at:[.30,-.34,-.6],tilt:[48,10],how:'melee'},
 'waffen/Bow_1_1_A_001.glb':{len:.62,fix:[-90,0,0],grip:.5,at:[-.24,-.2,-.7],tilt:[0,-5],yaw:-28,how:'shoot'},
 'neu/Wooden Bow.glb':{len:.62,fix:[0,0,0],grip:.5,at:[-.24,-.2,-.7],tilt:[0,-5],yaw:-28,how:'shoot'},
 'neu/Sniper Rifle.glb':{len:.9,fix:[0,0,90],grip:.3,at:[.2,-.22,-.5],tilt:[78,-6],how:'shoot'},
 'neu/Assault Rifle.glb':{len:.8,fix:[0,0,90],grip:.3,at:[.2,-.22,-.5],tilt:[78,-6],how:'shoot'},
 'archiv/Submachine Gun.glb':{len:.4,fix:[0,0,90],grip:.3,at:[.2,-.2,-.5],tilt:[78,-6],how:'shoot'},
 'waffen/Shield_1_A.glb':{len:.3,fix:[0,-90,0],grip:.5,at:[-.36,-.17,-.64],tilt:[0,-8],how:'none'},
 'waffen/Shield_2_A.glb':{len:.3,fix:[0,-90,0],grip:.5,at:[-.36,-.17,-.64],tilt:[0,-8],how:'none'}};
EGO.vmMake=()=>{const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(58,1,.05,30),g=new THREE.Group(),hemi=new THREE.HemisphereLight(0xffffff,0x666666,1),sun=new THREE.DirectionalLight(0xffffff,1);
  scene.add(g,hemi,sun,sun.target);if(r3.scene.environment)scene.environment=r3.scene.environment;
  return{scene,cam,g,hemi,sun,items:[],key:'',on:false,sw:0,swK:'melee',cd:0,yaw:0,pitch:0,sx:0,sy:0,fa:0}};
/* Waffen der Einheit aufbauen (einmal je Einheit/Stufe) */
EGO.vmBuild=e=>{const vm=EGO.vm,D=Math.PI/180;for(const it of vm.items)vm.g.remove(it.piv);vm.items=[];
  const list=e.kind==='unit'&&typeof EKMODELS!=='undefined'&&EKMODELS.held?EKMODELS.held(e):[];
  for(const h of list){const P=VMP[h.file];if(!P)continue;
    const inner=new THREE.Group(),piv=new THREE.Group();inner.rotation.set(P.fix[0]*D,P.fix[1]*D,P.fix[2]*D);inner.add(h.p);piv.add(inner);vm.g.add(piv);
    inner.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(inner),s=b.getSize(new THREE.Vector3()),k=P.len/Math.max(s.x,s.y,s.z,.01);
    inner.scale.setScalar(k);inner.updateMatrixWorld(true);const b2=new THREE.Box3().setFromObject(inner),c=b2.getCenter(new THREE.Vector3());
    inner.position.set(-c.x,-(b2.min.y+(b2.max.y-b2.min.y)*P.grip),-c.z);
    vm.items.push({piv,P,side:h.side})}
  vm.key=e.id+'|'+(e.lvl||0)+'|'+list.length};
/* je Bild: Haltung (Wippen, Nachschwingen, Schlag/Schuss), Lichter, Sichtbarkeit */
EGO.vmUpdate=dt=>{const e=EGO.e;if(!e||e.kind!=='unit'||!r3.camera){if(EGO.vm)EGO.vm.on=false;return}
  const vm=EGO.vm||(EGO.vm=EGO.vmMake());
  const key=e.id+'|'+(e.lvl||0);if(!vm.key.startsWith(key+'|')||(!vm.items.length&&EGO.vmRetry<performance.now())){EGO.vmRetry=performance.now()+2000;EGO.vmBuild(e)}
  vm.on=vm.items.length>0&&EGO.zoom<1.5&&!EGO.tower&&OPT.egoWeapon!==false;if(!vm.on)return;const D=Math.PI/180;
  const cam=r3.camera,a=VW/VH;if(vm.cam.aspect!==a){vm.cam.aspect=a;vm.cam.updateProjectionMatrix()}
  /* Nachschwingen: Blickdrehung zieht die Waffe kurz in die Gegenrichtung */
  let dy=EGO.yaw-vm.yaw,dp=EGO.pitch-vm.pitch;vm.yaw=EGO.yaw;vm.pitch=EGO.pitch;dy=Math.max(-.25,Math.min(.25,dy));dp=Math.max(-.25,Math.min(.25,dp));
  vm.sx+=dy*.35;vm.sy+=-dp*.35;const dec=Math.exp(-dt*9);vm.sx*=dec;vm.sy*=dec;
  /* Angriff erkennen: Nachladezeit springt hoch (gilt für eigene Schläge und Selbstverteidigung) */
  if(e.cd>vm.cd+.05&&vm.sw<=.05){vm.sw=1;const d=UNITS[e.type]||{};vm.swK=(d.ranged||d.air)?'shoot':'melee'}vm.cd=e.cd||0;
  if(EGO.kick>.95&&vm.sw<=.05){vm.sw=1;const d=UNITS[e.type]||{};vm.swK=(d.ranged||d.air)?'shoot':'melee'}
  vm.sw=EGO.vmHold!==undefined?EGO.vmHold:Math.max(0,vm.sw-dt*3.2);/* vmHold: nur für Bildtests */const s=1-vm.sw,sw=vm.sw>0?Math.sin(Math.min(1,s)*Math.PI):0,bob=EGO.bobA;
  for(const it of vm.items){const P=it.P,p=it.piv,how=P.how;let tx=P.tilt[0],tz=P.tilt[1],px=P.at[0],py=P.at[1],pz=P.at[2];
    py+=Math.sin(EGO.bobP*2)*.012*bob+vm.sy*.5;px+=Math.cos(EGO.bobP)*.01*bob+vm.sx*.5;
    if(vm.sw>0&&it.side==='hand'){
      if(how==='melee'&&vm.swK==='melee'){const cl=x=>Math.max(0,Math.min(1,x));/* kurz ausholen, dann schlagen */tx+=-16*Math.sin(cl(s/.3)*Math.PI/2)*(1-cl((s-.3)/.7))+48*Math.sin(cl((s-.25)/.75)*Math.PI);tz-=sw*14;pz-=sw*.1;px-=sw*.08}
      else if(how==='thrust'&&vm.swK==='melee'){pz-=sw*.38;tx-=sw*8}
      else if(vm.swK==='shoot'||how==='shoot'){const r=(1-s)*(1-s);pz+=r*.07;tx+=r*6}}
    p.position.set(px,py,pz);p.rotation.set(-tx*D,(P.yaw||0)*D,tz*D,'ZXY')}
  /* Lichter: Sonne/Himmel der Welt, Richtung in Kamera-Raum */
  vm.hemi.color.copy(r3.hemi.color);vm.hemi.groundColor.copy(r3.hemi.groundColor);vm.hemi.intensity=r3.hemi.intensity*.9;
  vm.sun.color.copy(r3.sun.color);vm.sun.intensity=r3.sun.intensity*.9;const q=cam.quaternion.clone().invert(),dv=new THREE.Vector3(R3.sd[0],R3.sd[1],R3.sd[2]).applyQuaternion(q);vm.sun.position.copy(dv.multiplyScalar(5));vm.sun.target.position.set(0,0,0)};
EGO.vmRetry=0;
/* zweiter Zeichendurchgang: nur die Waffe, Tiefe vorher gelöscht */
EGO.vmDraw=()=>{const vm=EGO.vm;if(!EGO.on||!vm||!vm.on||!r3.rd)return;const rd=r3.rd,ac=rd.autoClear;rd.autoClear=false;rd.clearDepth();rd.render(vm.scene,vm.cam);rd.autoClear=ac};
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
