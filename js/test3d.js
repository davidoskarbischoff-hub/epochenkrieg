/* Epochenkrieg – 3D-Test (nur zum Anschauen, nicht Teil des Spiels).
   Zeigt dieselbe Karte wie das Spiel in echtem 3D (Three.js) mit einfachen Modellen, Licht, Schatten, Nebel, Rauch und Feuer.
   Alle Modelle sind aus einfachen Formen im Code gebaut; echte Modelle könnten später dieselbe Rolle übernehmen. */
import * as THREE from './vendor/three.module.min.js';

const S=10;                                  // 1 Welteinheit = 10 Spiel-Pixel
const MAP=new URLSearchParams(location.search).get('map')||'coast';
genTerrain(+(new URLSearchParams(location.search).get('seed')||7),MAP);
const rnd=(()=>{let a=12345;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();

/* ---------- Renderer, Licht, Nebel ---------- */
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;
document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9fc2d6);scene.fog=new THREE.FogExp2(0x9fc2d6,.0026);
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,1,2000);
const sun=new THREE.DirectionalLight(0xfff1d6,2.6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc=sun.shadow.camera;sc.left=-90;sc.right=90;sc.top=90;sc.bottom=-90;sc.near=1;sc.far=400;sun.shadow.bias=-.0004;sun.shadow.normalBias=.4;
scene.add(sun,sun.target);
const hemi=new THREE.HemisphereLight(0xcfe6ff,0x4b5a2f,.55);scene.add(hemi);

/* ---------- Gelände ---------- */
const GW=TW,GH=TH;
const land=new Float32Array(GW*GH);
for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){let s=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(GW-1,x+dx)),ny=Math.max(0,Math.min(GH-1,y+dy));const t=TERR[ny*GW+nx];s+=(dx||dy?1:3)*(t>=2?1:t===1?.0:0);n+=dx||dy?1:3}land[y*GW+x]=s/n}
const shal=new Float32Array(GW*GH);for(let i=0;i<GW*GH;i++)shal[i]=TERR[i]>=1?1:0;
const bil=(a,px,pz)=>{const fx=Math.max(0,Math.min(GW-1.001,px*S/TG-.5)),fz=Math.max(0,Math.min(GH-1.001,pz*S/TG-.5)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz;
  return(a[iz*GW+ix]*(1-tx)+a[iz*GW+ix+1]*tx)*(1-tz)+(a[(iz+1)*GW+ix]*(1-tx)+a[(iz+1)*GW+ix+1]*tx)*tz};
const noise=(x,z)=>Math.sin(x*.11)*Math.cos(z*.09)*.5+Math.sin(x*.23+z*.17)*.25+Math.sin(x*.05-z*.07)*.6;
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function heightAt(x,z){const l=bil(land,x,z),sh=bil(shal,x,z);const m=smooth(.42,.62,l);const sea=-1.6+smooth(.2,.8,sh)*1.1;return sea*(1-m)+(.35+noise(x,z)*.45)*m}
const WW=W/S,WH=H/S;
{const seg=[360,240],g=new THREE.PlaneGeometry(WW,WH,seg[0],seg[1]);g.rotateX(-Math.PI/2);g.translate(WW/2,0,WH/2);
  const pos=g.attributes.position,col=new Float32Array(pos.count*3),c=new THREE.Color();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),h=heightAt(x,z);pos.setY(i,h);const l=bil(land,x,z),sh=bil(shal,x,z),n=noise(x*2.1,z*2.1)*.5+rnd()*.15;
    if(l<.42){c.set(sh>.5?0x3f8ea0:0x1b4a6c)}else if(l<.58){c.set(0xd6c08b)}else{c.setHSL(.25+n*.03,.5+n*.1,.19+n*.06);const rim=smooth(.58,.78,l);c.lerp(new THREE.Color(0x4f6a30),(1-rim)*.35)}
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95}));mesh.receiveShadow=true;scene.add(mesh)}
const water=new THREE.Mesh(new THREE.PlaneGeometry(WW*1.4,WH*1.4,1,1).rotateX(-Math.PI/2).translate(WW/2,0,WH/2),
  new THREE.MeshStandardMaterial({color:0x2f8aa6,transparent:true,opacity:.62,roughness:.12,metalness:.15}));
water.position.y=-.35;scene.add(water);

/* ---------- Materialien und Hilfsfunktionen ---------- */
const M=(c,r=.85,extra={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...extra});
const mat={wood:M(0x8a6a42),woodD:M(0x5b4228),plank:M(0xc09a64),stone:M(0x9a968c,.95),roof:M(0xa8794a,.9),roofD:M(0x6b4a2c,.9),thatch:M(0xc9a85a,1),skin:M(0xe2b98f,.7),metal:M(0xb9bec4,.35,{metalness:.7}),dark:M(0x2a2119)};
const team=new THREE.Color(0x3d72b8),teamE=new THREE.Color(0xc4452f);
const flagMat=new THREE.MeshStandardMaterial({color:team,roughness:.7,side:THREE.DoubleSide});
function shadowAll(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o}
const add=(parent,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);parent.add(o);return o};
const cyl=(rt,rb,h,s=12)=>new THREE.CylinderGeometry(rt,rb,h,s);
function roofPrism(w,d,h){ // Satteldach: Dreiecksprisma, First entlang x
  const s=new THREE.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:false});g.translate(0,0,-w/2);g.rotateY(Math.PI/2);return g}
function flag(parent,x,y,z,len=3){add(parent,cyl(.07,.07,len,6),mat.woodD,x,y+len/2,z);const f=add(parent,new THREE.PlaneGeometry(1.5,.9,6,1),flagMat,x+.75,y+len-.5,z);f.userData.flag=true;return f}

function hall(){const g=new THREE.Group();
  add(g,new THREE.BoxGeometry(11,.6,7),mat.stone,0,.3,0);
  add(g,new THREE.BoxGeometry(9,3.6,5.4),mat.plank,0,2.4,0);
  const r=add(g,roofPrism(10.4,6.6,3.2),mat.roof,0,4.2,0);
  for(const s of[-1,1]){add(g,cyl(1.15,1.3,6.2,14),mat.plank,s*5.2,3.4,.8);add(g,new THREE.ConeGeometry(1.75,2.6,14),mat.roofD,s*5.2,7.9,.8);flag(g,s*5.2,9,.8,2.6)}
  add(g,new THREE.BoxGeometry(1.5,2.3,.3),mat.dark,0,1.75,2.75);
  for(const x of[-3,3])add(g,new THREE.BoxGeometry(1,1,.2),M(0xa9d0e0,.2,{metalness:.2}),x,3,2.72);
  for(let i=-8;i<=8;i++){const p=add(g,cyl(.16,.16,2.2,6),mat.wood,i*.62,1.1,4.2);add(g,new THREE.ConeGeometry(.17,.5,6),mat.wood,i*.62,2.4,4.2)}
  return shadowAll(g)}
function house(){const g=new THREE.Group();add(g,new THREE.BoxGeometry(5,2.4,3.6),mat.plank,0,1.2,0);add(g,roofPrism(5.6,4.6,2.2),mat.thatch,0,2.4,0);
  add(g,new THREE.BoxGeometry(.9,1.6,.2),mat.dark,-1,.8,1.85);add(g,new THREE.BoxGeometry(.8,.8,.2),M(0xa9d0e0,.2),1.2,1.4,1.85);
  add(g,new THREE.BoxGeometry(.7,1.6,.7),mat.stone,1.6,3.3,-.6);return shadowAll(g)}
function tower(){const g=new THREE.Group();add(g,cyl(1.7,2.1,7.5,16),mat.stone,0,3.75,0);add(g,cyl(2.3,2.3,.7,16),mat.stone,0,7.7,0);
  for(let i=0;i<8;i++){const a=i/8*6.283;add(g,new THREE.BoxGeometry(.7,.8,.7),mat.stone,Math.cos(a)*2.1,8.4,Math.sin(a)*2.1)}
  add(g,new THREE.BoxGeometry(.35,1,.2),mat.dark,0,5,1.8);add(g,new THREE.BoxGeometry(.35,1,.2),mat.dark,0,2.8,1.95);flag(g,0,8.1,0,2.6);return shadowAll(g)}
function unit(kind,col){const g=new THREE.Group(),tm=M(col,.7);
  const body=add(g,new THREE.CapsuleGeometry(.38,.7,4,10),kind==='knight'?M(0xaab1ba,.4,{metalness:.5}):tm,0,1.1,0);
  add(g,new THREE.SphereGeometry(.3,14,12),mat.skin,0,1.95,0);
  const helm=add(g,new THREE.SphereGeometry(.34,14,10,0,6.283,0,1.6),kind==='worker'?M(0xd9b85c):mat.metal,0,2.0,0);
  g.userData.legs=[add(g,cyl(.13,.13,.8,6),M(0x4a3a2a),-.17,.4,0),add(g,cyl(.13,.13,.8,6),M(0x4a3a2a),.17,.4,0)];
  if(kind==='spear'){const sp=add(g,cyl(.04,.04,3.2,6),mat.wood,.55,1.6,.1);add(g,new THREE.ConeGeometry(.12,.45,8),mat.metal,.55,3.35,.1);const sh=add(g,cyl(.5,.5,.1,16),tm,-.5,1.2,.1);sh.rotation.x=Math.PI/2;sh.rotation.z=.2}
  if(kind==='sword'){add(g,new THREE.BoxGeometry(.1,1.3,.04),mat.metal,.55,1.5,.1);const sh=add(g,cyl(.45,.45,.1,16),M(0xd9d4c4),-.5,1.2,.1);sh.rotation.x=Math.PI/2}
  if(kind==='worker'){add(g,cyl(.04,.04,1.6,6),mat.wood,.5,1.0,.1).rotation.z=.4;add(g,new THREE.BoxGeometry(.5,.25,.15),mat.metal,.95,1.7,.1)}
  if(kind==='knight'){ // Pferd
    const h=new THREE.Group();add(h,new THREE.CapsuleGeometry(.5,1.4,4,10),M(0x7a5a3a,.8),0,1.2,0).rotation.z=Math.PI/2;add(h,cyl(.2,.28,1.1,8),M(0x7a5a3a,.8),1.05,1.8,0).rotation.z=-.5;add(h,new THREE.BoxGeometry(.7,.3,.3),M(0x7a5a3a,.8),1.55,2.2,0);
    h.userData.legs=[];for(const[x,z]of[[-.7,-.25],[-.7,.25],[.7,-.25],[.7,.25]])h.userData.legs.push(add(h,cyl(.1,.1,1.0,6),M(0x5b4228),x,.5,z));
    add(h,new THREE.BoxGeometry(1.3,.12,.9),tm,0,1.75,0);g.add(h);g.userData.horse=h;body.position.y=2.35;g.children.forEach(o=>{if(o!==h&&o!==body&&o.position.y<2.2&&!g.userData.legs.includes(o))o.position.y+=1.25});g.userData.legs.forEach(l=>l.visible=false);
    const lance=add(g,cyl(.04,.04,4,6),mat.wood,.9,3.1,.2);lance.rotation.z=-1.2;add(g,new THREE.ConeGeometry(.12,.5,8),mat.metal,2.65,3.7,.2).rotation.z=-1.2-Math.PI/2*0}
  return shadowAll(g)}

/* ---------- Welt aufbauen ---------- */
const base=new THREE.Vector3(W*.17/S,0,H*.83/S);base.y=heightAt(base.x,base.z);
const place=(o,x,z,rot=0,sc=1)=>{o.position.set(x,heightAt(x,z),z);o.rotation.y=rot;o.scale.setScalar(sc);scene.add(o);return o};
const flags=[];
const hq=place(hall(),base.x,base.z,0);
const houses=[[-16,10],[-12,-2],[14,-12],[18,6]].map(([dx,dz],i)=>place(house(),base.x+dx,base.z+dz,i*.7-.4));
const tw=place(tower(),base.x+22,base.z+18,0);
hq.traverse(o=>{if(o.userData.flag)flags.push(o)});tw.traverse(o=>{if(o.userData.flag)flags.push(o)});
// Bäume, Büsche und Felsen mit Instanzen (viele Stück, kaum Rechenaufwand)
const dummy=new THREE.Object3D(),isLand=(x,z)=>bil(land,x,z)>.7;
function inst(geo,m,pts,fn){const im=new THREE.InstancedMesh(geo,m,pts.length);pts.forEach((p,i)=>{dummy.position.set(p.x,heightAt(p.x,p.z)+(p.dy||0),p.z);dummy.rotation.set(0,p.r,0);dummy.scale.set(p.s,p.s*(p.sy||1),p.s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);im.setColorAt(i,fn(p))});im.castShadow=true;im.receiveShadow=true;scene.add(im);return im}
const forests=[];for(let k=0;k<26;k++){const a=rnd()*6.283,d=45+rnd()*90;forests.push({x:base.x+Math.cos(a)*d,z:base.z+Math.sin(a)*d*.8,r:7+rnd()*12})}
forests.push({x:base.x-40,z:base.z-12,r:12},{x:base.x+35,z:base.z-30,r:10});
const trees=[];for(const f of forests)for(let i=0;i<46;i++){const a=rnd()*6.283,d=Math.sqrt(rnd())*f.r,x=f.x+Math.cos(a)*d,z=f.z+Math.sin(a)*d;if(!isLand(x,z)||Math.hypot(x-base.x,z-base.z)<20||x<4||z<4||x>WW-4||z>WH-4)continue;trees.push({x,z,r:rnd()*6.283,s:.8+rnd()*.7,pine:rnd()<.55})}
const pines=trees.filter(t=>t.pine),broad=trees.filter(t=>!t.pine);
const col=(h,s,l)=>new THREE.Color().setHSL(h,s,l);
const trunk=cyl(.25,.4,2.4,6);trunk.translate(0,1.2,0);
inst(trunk,mat.woodD,trees,()=>new THREE.Color(0xffffff));
const cone=(r,h,y)=>{const g=new THREE.ConeGeometry(r,h,9);g.translate(0,y,0);return g};
for(const[r,h,y,l]of[[2.2,2.6,2.6,.2],[1.7,2.4,4.0,.25],[1.1,2.2,5.3,.31]])inst(cone(r,h,y),M(0xffffff,.9),pines,p=>col(.36+(p.s%.1)*.1,.45,l));
const blob=new THREE.IcosahedronGeometry(1.7,1);{const p=blob.attributes.position;for(let i=0;i<p.count;i++){const k=1+(Math.sin(i*12.9)*.5)*.18;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*.9,p.getZ(i)*k)}blob.computeVertexNormals()}
blob.translate(0,3.6,0);const blob2=blob.clone();blob2.scale(.7,.7,.7);blob2.translate(.6,1.4,.4);
inst(blob,M(0xffffff,.85),broad,p=>col(.27+(p.s%.1)*.2,.42,.27));inst(blob2,M(0xffffff,.85),broad,p=>col(.3,.5,.36));
const rocks=[];for(let i=0;i<70;i++){const a=rnd()*6.283,d=18+rnd()*120,x=base.x+Math.cos(a)*d,z=base.z+Math.sin(a)*d*.8;if(isLand(x,z))rocks.push({x,z,r:rnd()*6.283,s:.8+rnd()*1.8,sy:.7})}
const rg=new THREE.DodecahedronGeometry(1.5,0);rg.translate(0,.6,0);inst(rg,new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),rocks,()=>new THREE.Color(0x8d8a80).offsetHSL(0,0,(rnd()-.5)*.1));
const bushes=[];for(let i=0;i<60;i++){const a=rnd()*6.283,d=14+rnd()*40,x=base.x+Math.cos(a)*d,z=base.z+Math.sin(a)*d;if(isLand(x,z))bushes.push({x,z,r:0,s:.6+rnd()*.5})}
inst(new THREE.IcosahedronGeometry(1,1).translate(0,.7,0),M(0xffffff,.9),bushes,()=>new THREE.Color(0x3d6a2c));
inst(new THREE.IcosahedronGeometry(.12,0).translate(0,1.4,0),M(0xffffff,.6),bushes.map(b=>({...b,x:b.x+.5,s:1})),()=>new THREE.Color(0xc03a3a));

/* Einheiten, die herumlaufen */
const walkers=[];const kinds=['spear','sword','worker','spear','knight','worker','sword','spear'];
kinds.forEach((k,i)=>{const u=unit(k,i%3===2?0x3d72b8:0x3d72b8);scene.add(u);const ang=rnd()*6.283,rad=12+rnd()*10;walkers.push({u,ang,rad,sp:(k==='knight'?.55:.28)+rnd()*.1,k,cx:base.x+rnd()*10-12,cz:base.z+14+rnd()*6});});
// ein Gegner-Trupp zum Vergleich der Teamfarbe
for(let i=0;i<4;i++){const u=unit(i%2?'spear':'sword',0xc4452f);scene.add(u);u.position.set(base.x+36+i*1.6,0,base.z+24);u.position.y=heightAt(u.position.x,u.position.z);u.rotation.y=Math.PI*.9}

/* Rauch und Feuer */
const smokeTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,30);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const puffs=[];function emit(x,y,z,kind){const m=new THREE.SpriteMaterial({map:smokeTex,transparent:true,depthWrite:false,color:kind==='fire'?0xffa030:0xb8b6b2,blending:kind==='fire'?THREE.AdditiveBlending:THREE.NormalBlending});const s=new THREE.Sprite(m);s.position.set(x,y,z);scene.add(s);puffs.push({s,l:0,kind,vx:(rnd()-.5)*.3,vz:(rnd()-.5)*.2})}
const chim=new THREE.Vector3();const fireAt=new THREE.Vector3(base.x+22,heightAt(base.x+22,base.z+18)+4,base.z+18);
const fireLight=new THREE.PointLight(0xff8a30,0,22,2);fireLight.position.copy(fireAt);scene.add(fireLight);

/* ---------- Kamera (wie im Spiel: Karte verschieben, zoomen) ---------- */
const cam={tx:base.x+6,tz:base.z-2,dist:70,yaw:.0,pitch:.9};
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key==='n'||e.key==='N')night=!night});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let drag=null;renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,b:e.button};renderer.domElement.setPointerCapture(e.pointerId)});
addEventListener('pointerup',()=>drag=null);
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
  if(drag.b===2){cam.yaw-=dx*.005;cam.pitch=Math.max(.35,Math.min(1.35,cam.pitch+dy*.004))}
  else{const k=cam.dist*.0016;cam.tx-=(Math.cos(cam.yaw)*dx+Math.sin(cam.yaw)*dy)*k;cam.tz-=(-Math.sin(cam.yaw)*dx+Math.cos(cam.yaw)*dy)*k}});
addEventListener('wheel',e=>{cam.dist=Math.max(18,Math.min(220,cam.dist*Math.exp(e.deltaY*.001)))},{passive:true});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()});
let night=false,nightK=0;

/* ---------- Schleife ---------- */
const clock=new THREE.Clock();
function frame(){requestAnimationFrame(frame);const dt=Math.min(.05,clock.getDelta()),t=clock.elapsedTime;
  const sp=cam.dist*.6*dt;if(keys.w){cam.tx-=Math.sin(cam.yaw)*sp;cam.tz-=Math.cos(cam.yaw)*sp}if(keys.s){cam.tx+=Math.sin(cam.yaw)*sp;cam.tz+=Math.cos(cam.yaw)*sp}
  if(keys.a){cam.tx-=Math.cos(cam.yaw)*sp;cam.tz+=Math.sin(cam.yaw)*sp}if(keys.d){cam.tx+=Math.cos(cam.yaw)*sp;cam.tz-=Math.sin(cam.yaw)*sp}
  const ty=heightAt(cam.tx,cam.tz);camera.position.set(cam.tx+Math.sin(cam.yaw)*Math.cos(cam.pitch)*cam.dist,ty+Math.sin(cam.pitch)*cam.dist,cam.tz+Math.cos(cam.yaw)*Math.cos(cam.pitch)*cam.dist);camera.lookAt(cam.tx,ty,cam.tz);
  // Tageszeit: Taste N wechselt zwischen Tag und Abend
  nightK+=((night?1:0)-nightK)*Math.min(1,dt*2);
  const L=(a,b)=>a+(b-a)*nightK;sun.intensity=L(2.5,.9);sun.color.setRGB(1,L(.95,.55),L(.84,.35));hemi.intensity=L(.55,.35);
  const sk=new THREE.Color(0x9fc2d6).lerp(new THREE.Color(0x3a3358),nightK);scene.background.copy(sk);scene.fog.color.copy(sk);
  const sa=L(.9,.28);sun.position.set(cam.tx-60*Math.cos(sa)+25,ty+90*Math.sin(sa)+20,cam.tz-45);sun.target.position.set(cam.tx,ty,cam.tz);
  for(const f of flags)f.rotation.y=Math.sin(t*3)*.25;
  for(const w of walkers){w.ang+=w.sp*dt/ (w.rad*.1);const x=w.cx+Math.cos(w.ang)*w.rad,z=w.cz+Math.sin(w.ang)*w.rad*.6,u=w.u;
    const dx=-Math.sin(w.ang),dz=Math.cos(w.ang)*.6;u.rotation.y=Math.atan2(dx,dz)-Math.PI/2;u.position.set(x,heightAt(x,z)+Math.abs(Math.sin(t*7+w.ang*5))*.12,z);
    const sw=Math.sin(t*(w.k==='knight'?9:7)+w.rad)*.6;(u.userData.legs||[]).forEach((l,i)=>l.rotation.z=i?sw:-sw);if(u.userData.horse)u.userData.horse.userData.legs.forEach((l,i)=>l.rotation.z=(i%2?sw:-sw)*.9)}
  // Rauch aus dem Dach der ersten Hütte, Feuer am Turm
  if(rnd()<dt*3)emit(houses[0].position.x+1.6,houses[0].position.y+4.3,houses[0].position.z-.6,'smoke');
  if(rnd()<dt*18)emit(fireAt.x+(rnd()-.5)*1.2,fireAt.y,fireAt.z+(rnd()-.5)*1.2,'fire');if(rnd()<dt*5)emit(fireAt.x,fireAt.y+1,fireAt.z,'smoke');
  fireLight.intensity=(3+Math.sin(t*23)*1+Math.sin(t*37)*.7)*(1+nightK*2.5);
  for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.l+=dt;const fire=p.kind==='fire',life=fire?.7:3.2,k=p.l/life;if(k>=1){scene.remove(p.s);p.s.material.dispose();puffs.splice(i,1);continue}
    p.s.position.y+=dt*(fire?3.2:1.5);p.s.position.x+=p.vx*dt+(fire?0:dt*.6);p.s.position.z+=p.vz*dt;p.s.scale.setScalar(fire?1.6*(1-k*.6):1.2+k*3.4);p.s.material.opacity=fire?.9*(1-k):.38*(1-k)}
  renderer.render(scene,camera)}
frame();
window.__t3={cam,THREE,scene};
