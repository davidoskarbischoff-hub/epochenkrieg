/* Epochenkrieg – 3D-Darstellung (Three.js): Gelände, Modelle, Kamera, Licht. Das Spiel selbst rechnet weiter in 2D-Koordinaten (x, y in Pixeln);
   hier wird daraus die 3D-Welt: Spiel-x → x/S, Spiel-y → z/S, Höhe y kommt vom Gelände. Die Umrechnungen für Maus und Overlay stehen unten (R3.scr, toWorld).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
const R3={S:10,ok:false,D0:74,PITCH:.96,FOV:36,k:1,reg:new Map(),rings:[],ringN:0,t0:0,nodeT:0,bgRef:null,fogN:0};
const _v=()=>new THREE.Vector3();
let r3={};
const smooth3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

function r3Init(){
  const glc=document.getElementById('gl');
  const rd=new THREE.WebGLRenderer({canvas:glc,antialias:true,powerPreference:'high-performance'});
  rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.outputColorSpace=THREE.SRGBColorSpace;
  rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=1.15;
  const scene=new THREE.Scene(),SKY=0x16384f;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(0x9db8c4,260,620);
  const camera=new THREE.PerspectiveCamera(R3.FOV,1,2,1400);
  const sun=new THREE.DirectionalLight(0xfff0d4,2.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.35;scene.add(sun,sun.target);
  const hemi=new THREE.HemisphereLight(0xcfe3f5,0x56623a,1.5);scene.add(hemi);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(2400,2400).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x1a4466,fog:false}));sea.position.set(W/R3.S/2,-.8,H/R3.S/2);scene.add(sea);
  const gEnt=new THREE.Group();scene.add(gEnt);
  r3={rd,scene,camera,sun,hemi,sea,gEnt,vec:_v(),ray:new THREE.Raycaster(),maxTex:rd.capabilities.maxTextureSize};
  R3.ok=true;R3.t0=performance.now();r3Resize();
}
function r3Resize(){if(!R3.ok)return;r3.rd.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));r3.rd.setSize(VW,VH,false);camUpdate()}

/* ---------- Gelände ---------- */
const hgrid={w:0,h:0,a:null};
function hAt(xp,yp){const g=hgrid;if(!g.a)return 0;const fx=Math.max(0,Math.min(g.w-1.001,xp/R3.S)),fz=Math.max(0,Math.min(g.h-1.001,yp/R3.S)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,a=g.a,W1=g.w;
  return(a[iz*W1+ix]*(1-tx)+a[iz*W1+ix+1]*tx)*(1-tz)+(a[(iz+1)*W1+ix]*(1-tx)+a[(iz+1)*W1+ix+1]*tx)*tz}
function r3Map(){
  const S=R3.S,{scene}=r3;
  for(const o of R3.reg.values())r3.gEnt.remove(o.obj);R3.reg.clear();
  if(r3.terrain){scene.remove(r3.terrain);r3.terrain.geometry.dispose();r3.terrain.material.map.dispose();scene.remove(r3.terrOv);scene.remove(r3.fogOv)}
  const GW=TW,GH=TH,lg=new Float32Array(GW*GH),sg=new Float32Array(GW*GH),rgd=new Float32Array(GW*GH);
  const cell=(a,x,y)=>a[Math.max(0,Math.min(GH-1,y))*GW+Math.max(0,Math.min(GW-1,x))];
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){let sl=0,ss=0,sr=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(GW-1,x+dx)),ny=Math.max(0,Math.min(GH-1,y+dy)),t=TERR[ny*GW+nx],wt=dx||dy?1:3;sl+=wt*(t>=2?1:0);ss+=wt*(t>=1?1:0);sr+=wt*(t===3?1:0);n+=wt}lg[y*GW+x]=sl/n;sg[y*GW+x]=ss/n;rgd[y*GW+x]=sr/n}
  const bil=(a,xu,zu)=>{const fx=Math.max(0,Math.min(GW-1.001,xu*S/TG-.5)),fz=Math.max(0,Math.min(GH-1.001,zu*S/TG-.5)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz;return(a[iz*GW+ix]*(1-tx)+a[iz*GW+ix+1]*tx)*(1-tz)+(a[(iz+1)*GW+ix]*(1-tx)+a[(iz+1)*GW+ix+1]*tx)*tz};
  const nz=(x,z)=>Math.sin(x*.11)*Math.cos(z*.09)*.5+Math.sin(x*.23+z*.17)*.25+Math.sin(x*.05-z*.07)*.6;
  const SX=W/S,SZ=H/S,NX=SX+1,NZ=SZ+1;hgrid.w=NX;hgrid.h=NZ;hgrid.a=new Float32Array(NX*NZ);
  const g=new THREE.PlaneGeometry(SX,SZ,SX,SZ);g.rotateX(-Math.PI/2);g.translate(SX/2,0,SZ/2);const pos=g.attributes.position;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const l=bil(lg,i,j),sh=bil(sg,i,j),rk=bil(rgd,i,j),m=smooth3(.44,.56,l);
    const sea=-.5+.16*smooth3(.3,.8,sh),land=.12+nz(i,j)*.32+smooth3(.35,.7,rk)*(2.4+nz(i*1.7,j*1.7)*.8);hgrid.a[j*NX+i]=sea*(1-m)+land*m;pos.setY(j*NX+i,hgrid.a[j*NX+i])}
  g.computeVertexNormals();
  // Boden-Textur: das fertig gemalte Bild der Karte (renderBg), bei Bedarf verkleinert
  let src=bg;if(Math.max(bg.width,bg.height)>r3.maxTex){const k=r3.maxTex/Math.max(bg.width,bg.height);src=document.createElement('canvas');src.width=Math.floor(bg.width*k);src.height=Math.floor(bg.height*k);src.getContext('2d').drawImage(bg,0,0,src.width,src.height)}
  const tex=new THREE.CanvasTexture(src);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,r3.rd.capabilities.getMaxAnisotropy());
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tex,roughness:1,metalness:0}));mesh.receiveShadow=true;scene.add(mesh);r3.terrain=mesh;
  const ovMat=(cv,order,op)=>{const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false}));m.renderOrder=order;m.material.opacity=op;scene.add(m);return m};
  r3.terrOv=ovMat(terrCv,2,.75);r3.fogOv=ovMat(fogCv,3,1);
  r3NodesInit();R3.bgRef=bg;R3.gRef=G;
}

/* ---------- Kamera und Umrechnung ---------- */
function camUpdate(){
  if(!R3.ok||!VW)return;const{camera,sun}=r3,S=R3.S,d=R3.D0/cam.z,tx=cam.x/S,tz=cam.y/S,ty=hAt(cam.x,cam.y);
  camera.aspect=VW/VH;camera.fov=R3.FOV;camera.updateProjectionMatrix();
  camera.position.set(tx,ty+Math.sin(R3.PITCH)*d,tz+Math.cos(R3.PITCH)*d);camera.lookAt(tx,ty,tz);camera.updateMatrixWorld();
  R3.k=(VH/(2*Math.tan(R3.FOV*Math.PI/360)*d))/S; // Bildschirm-Pixel pro Spiel-Pixel in der Bildmitte
  const b=Math.min(150,d*.85);sun.position.set(tx-.55*b,ty+1.05*b,tz-.35*b);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;sc.left=sc.bottom=-b;sc.right=sc.top=b;sc.near=1;sc.far=b*3.2;sc.updateProjectionMatrix();
  r3.scene.fog.near=d*2.4;r3.scene.fog.far=d*6;
}
/* Spielpunkt (x,y in Pixeln, Höhe z in Pixeln) → Bildschirm */
function scr(x,y,z){const v=r3.vec,S=R3.S;v.set(x/S,hAt(x,y)+(z||0)/S,y/S).project(r3.camera);return{x:(v.x+1)/2*VW,y:(1-v.y)/2*VH,front:v.z<1}}
/* Bildschirm → Spielpunkt (Strahl auf das Gelände) */
function toWorld(sx,sy){
  if(!R3.ok)return{x:cam.x,y:cam.y};
  const{camera,ray}=r3,S=R3.S;ray.setFromCamera({x:sx/VW*2-1,y:-(sy/VH)*2+1},camera);const o=ray.ray.origin,d=ray.ray.direction;
  let h=0,x=cam.x/S,z=cam.y/S;
  for(let i=0;i<4;i++){const t=(h-o.y)/(d.y<-1e-4?d.y:-1e-4);x=o.x+d.x*t;z=o.z+d.z*t;h=hAt(x*S,z*S)}
  return{x:Math.max(0,Math.min(W,x*S)),y:Math.max(0,Math.min(H,z*S))}}

/* ---------- Instanzen für Bäume, Büsche, Felsen ---------- */
function r3NodesInit(){
  const{scene}=r3;for(const k of['pine','broad','bush','rock','ore'])if(r3['i_'+k]){scene.remove(r3['i_'+k]);r3['i_'+k].dispose()}
  const cnt={tree:0,bush:0,stone:0,iron:0};for(const e of G.ents)if(e.kind==='node'&&cnt[e.type]!==undefined)cnt[e.type]++;
  const mk=(geo,n,flat)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,flatShading:!!flat}),Math.max(1,n));m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);return m};
  r3.i_pine=mk(treeGeo(true),cnt.tree,false);r3.i_broad=mk(treeGeo(false),cnt.tree,false);r3.i_bush=mk(bushGeoC(),cnt.bush,false);r3.i_rock=mk(rockGeoC(false,1),cnt.stone*5,true);r3.i_ore=mk(rockGeoC(true,2),cnt.iron*5,true);
  R3.nodeT=0;
}
let _o=null,_c=null;
function fogShade(x,y){const i=fogIdx(x,y),a=(1-visF[i])*(165-95*exF[i])/255;return 1-a*.82}
function r3Nodes(){
  if(!_o){_o=new THREE.Object3D();_c=new THREE.Color()}
  const S=R3.S,cnt={pine:0,broad:0,bush:0,rock:0,ore:0},I=r3;
  const put=(m,key,x,y,z,ry,sx,sy,col)=>{const n=cnt[key]++;if(n>=m.instanceMatrix.count)return;_o.position.set(x,y,z);_o.rotation.set(0,ry,0);_o.scale.set(sx,sy,sx);_o.updateMatrix();m.setMatrixAt(n,_o.matrix);m.setColorAt(n,col)};
  for(const e of G.ents){if(e.dead||e.kind!=='node'||e.sea)continue;
    const k=Math.max(.5,Math.sqrt(e.amount/e.maxAmt)),sh=fogShade(e.x,e.y),h=hAt(e.x,e.y),x=e.x/S,z=e.y/S,sd=e.seed;
    if(e.type==='tree'){const s=e.r/11*.62*(.85+sd*.35)*(.55+.45*k),pine=sd<.5,v=.9+((sd*97)%1)*.2;_c.setRGB(v*sh,(.95+((sd*53)%1)*.12)*v*sh,v*sh);put(pine?I.i_pine:I.i_broad,pine?'pine':'broad',x,h,z,sd*6.28,s,s*(.9+((sd*31)%1)*.3),_c)}
    else if(e.type==='bush'){const s=e.r/10*(.55+.45*k);_c.setRGB(sh,sh,sh);put(I.i_bush,'bush',x,h,z,sd*6.28,s,s,_c)}
    else{const iron=e.type==='iron',m=iron?I.i_ore:I.i_rock,key=iron?'ore':'rock',base=e.r/10*(.6+.4*k);
      for(let j=0;j<5;j++){const a=sd*20+j*1.9,dd=j?e.r/S*.62:0,sz=base*(j?.55+((j*37+sd*50)%7)/14:1.05),xx=x+Math.cos(a)*dd,zz=z+Math.sin(a)*dd;_c.setRGB(sh*(.92+(j%3)*.05),sh*(.92+(j%3)*.05),sh*(.95+(j%2)*.05));put(m,key,xx,hAt(xx*S,zz*S)-.1,zz,a,sz,sz*(j?1:1.15),_c)}}}
  for(const[k,m]of[['pine',I.i_pine],['broad',I.i_broad],['bush',I.i_bush],['rock',I.i_rock],['ore',I.i_ore]]){m.count=Math.min(cnt[k],m.instanceMatrix.count);m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}
}

/* ---------- Meeresbewohner ---------- */
function seaModel(e){const g=new THREE.Group(),bodyM=m3Plain(e.type==='whale'?0x41587a:0x7f9fb8,.5);
  if(e.type==='fish'){for(let i=0;i<5;i++){const f=new THREE.Group(),b=put(f,new THREE.SphereGeometry(.28,8,6),m3Plain(i%2?0xcfe6ee:0xa9d0de,.4,{metalness:.3}),0,0,0);b.scale.set(1.6,.55,.45);put(f,cone(.14,.3,4),bodyM,-.5,0,0).rotation.z=Math.PI/2;f.position.set(Math.cos(i*1.7)*e.r/R3.S*.8,-.2,Math.sin(i*2.3)*e.r/R3.S*.8);f.userData.ph=i;g.add(f)}}
  else{const n=e.type==='whale'?1:2,sc=e.type==='whale'?3.4:1;for(let i=0;i<n;i++){const f=new THREE.Group(),b=put(f,new THREE.CapsuleGeometry(.4*sc,1.5*sc,4,10),bodyM,0,0,0);b.rotation.z=Math.PI/2;put(f,new THREE.BoxGeometry(.5*sc,.5*sc,.06),bodyM,-1.2*sc,0,0).rotation.z=.5;put(f,cone(.2*sc,.55*sc,4),bodyM,-.1*sc,.45*sc,0).rotation.z=-.3;const belly=put(f,new THREE.CapsuleGeometry(.3*sc,1.3*sc,4,8),m3Plain(0xd4e2ea,.5),0,-.12*sc,0);belly.rotation.z=Math.PI/2;f.position.set(0,-.1,(i-.5)*(n-1)*1.4);f.userData.ph=i;g.add(f)}}
  return g}

/* ---------- Entitäten abgleichen ---------- */
function entKey(e,ghost){return(ghost?'g':e.kind[0])+e.id}
function r3Sync(list,dt,t){
  const S=R3.S,seen=new Set();
  for(const[e,ghost]of list){
    const key=entKey(e,ghost);seen.add(key);
    const ep=e.kind==='bld'?G.epoch[e.team]:0,sig=e.kind==='unit'?e.type+e.team:e.kind==='bld'?e.type+':'+ep+':'+e.team:e.kind==='animal'?e.type:e.type;
    let o=R3.reg.get(key);
    if(!o||o.sig!==sig){if(o)r3.gEnt.remove(o.obj);o=r3Make(e,sig);R3.reg.set(key,o);r3.gEnt.add(o.obj)}
    const h=hAt(e.x,e.y),obj=o.obj;
    if(e.kind==='unit')r3Unit(o,e,h,dt,t);
    else if(e.kind==='bld'){obj.position.set(e.x/S,h,e.y/S);const pr=e.built?1:.12+.88*e.prog;obj.scale.set(1,pr,1);
      if(e.type==='harbor')obj.rotation.y=-(e.ang||0);for(const f of o.flags)f.rotation.y=Math.sin(t*3+f.position.x)*.3}
    else if(e.kind==='node'){obj.position.set(e.x/S,-.38+Math.sin(t*1.6+e.seed*20)*.05,e.y/S);obj.rotation.y=e.seed*6.28+Math.sin(t*.5+e.seed*9)*.15;
      obj.children.forEach(f=>{const p=f.userData.ph||0;f.position.y=-.1+Math.sin(t*2+p*2+e.seed*9)*.06;if(e.type==='fish')f.rotation.y=Math.sin(t*1.5+p)*.4})}
    else if(e.kind==='animal')r3Animal(o,e,h,dt,t);
    o.seen=true}
  for(const[k,o]of R3.reg)if(!seen.has(k)){r3.gEnt.remove(o.obj);R3.reg.delete(k)}
}
function r3Make(e,sig){
  const S=R3.S;
  if(e.kind==='unit'){const rig=buildUnit(e),sc=e.r/7*1.25*(UNITS[e.type].naval?.55:UNITS[e.type].siege?.7:1);rig.g.scale.setScalar(sc);const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  if(e.kind==='bld'){const g=buildBld(e.type,e.r/S*1.05,G.epoch[e.team],e.team);return{obj:g,sig,flags:g.userData.flags||[]}}
  if(e.kind==='animal'){const rig=buildAnimal(e);const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  const g=seaModel(e);return{obj:g,sig,flags:[]}}
function r3Unit(o,e,h,dt,t){
  const S=R3.S,d=UNITS[e.type],rig=o.rig,moving=G.t-(e.mvT||-9)<.2,obj=o.obj;
  let want=-e.fa,dy=want-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*14);
  const sw=e.swing&&G.t-e.swing<.28?1-(G.t-e.swing)/.28:0,work=G.t-(e.gat||-9)<.25,build=e.state==='build';
  if(moving)o.ph+=dt*(d.naval?2:7+d.spd*.06);const s=Math.sin(o.ph);
  let y=h;
  if(rig.ship){y=-.42+Math.sin(t*2+e.id)*.06;obj.rotation.z=Math.sin(t*1.7+e.id)*.035;obj.rotation.x=0;if(rig.sail)rig.sail.rotation.y=Math.PI/2+Math.sin(t*1.3)*.06}
  else{
    if(moving)y+=Math.abs(s)*.07*(rig.horse?1.6:1);
    if(rig.horse){rig.legs.forEach((l,i)=>l.rotation.z=(i%2?s:-s)*.7);const rd=rig.rider;rd.arms[1].rotation.z=.2+sw*.6}
    else if(rig.wheels){if(moving)rig.wheels.forEach(w=>w.rotation.y+=dt*3.2*(d.spd/40));if(rig.log)rig.log.position.x=sw*.9;if(rig.arm)rig.arm.rotation.z=-sw*1.8;if(rig.barrel)rig.barrel.position.x=.1-sw*.35}
    else{
      const sa=moving?s*.7:0;rig.legs[0].rotation.z=-sa;rig.legs[1].rotation.z=sa;
      rig.arms[0].rotation.z=rig.bow?1.5:moving?sa*.7:0;
      let a=.15+(moving?-sa*.6:0);
      if(rig.bow){a=1.5;rig.arms[1].rotation.z=a+(sw?-.5*sw:0)}
      else{if(e.state==='attack'&&!d.ranged){a=sw>0?.2+1.9*sw:e.cd<.35?-1.0*(1-e.cd/.35):.2}
        else if(d.ranged&&e.state==='attack'){a=1.2+.0;}
        else if(work||build){a=.3+1.1*(.5+.5*Math.sin(t*10+e.id))}
        rig.arms[1].rotation.z=a}
      if(rig.tool){const k=build?'build':(e.state==='gather'||e.state==='return'||work)?e.rtype:null;rig.tool(k==='food'&&e.carry>0&&e.state==='return'?null:k);if(rig.sack){rig.sack.visible=e.carry>0&&e.state!=='gather'||e.carry>4;rig.sack.scale.setScalar(.6+Math.min(1,e.carry/CARRY)*.6)}}
    }
  }
  obj.position.set(e.x/S,y,e.y/S);obj.rotation.y=o.yaw;
}
function r3Animal(o,e,h,dt,t){const S=R3.S,rig=o.rig,moving=G.t-(e.mvT||-9)<.2;let dy=-e.fa-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*10);if(moving)o.ph+=dt*(6+UNITS_A(e).spd*.05);const s=Math.sin(o.ph);
  rig.legs.forEach((l,i)=>l.rotation.z=moving?(i%2?s:-s)*.7:0);const sw=e.swing&&G.t-e.swing<.3?1-(G.t-e.swing)/.3:0;if(rig.head)rig.head.rotation.z=-sw*.5+(e.state==='graze'?-.6:0);
  o.obj.position.set(e.x/S,h+(moving?Math.abs(s)*.06:0),e.y/S);o.obj.rotation.y=o.yaw}
const UNITS_A=e=>ANIMALS[e.type];

/* ---------- Auswahlringe am Boden ---------- */
function r3Ring(x,y,r,col,op){
  const S=R3.S;let m=R3.rings[R3.ringN];
  if(!m){m=new THREE.Mesh(new THREE.RingGeometry(.9,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.renderOrder=4;R3.rings.push(m);r3.scene.add(m)}
  R3.ringN++;m.visible=true;m.material.color.set(col);m.material.opacity=op===undefined?.95:op;const rr=r/S;m.scale.set(rr,1,rr);m.position.set(x/S,hAt(x,y)+.1,y/S)}
function r3Ghost(type,x,y,ok){
  if(!r3.ghost||r3.ghostKey!==type+':'+G.epoch[0]){if(r3.ghost)r3.scene.remove(r3.ghost);const g=buildBld(type,BLDS[type].r/R3.S*1.05,G.epoch[0],0);g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.castShadow=false}});r3.ghost=g;r3.ghostKey=type+':'+G.epoch[0];r3.scene.add(g)}
  r3.ghost.visible=true;r3.ghost.position.set(x/R3.S,hAt(x,y),y/R3.S);r3.ghost.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(ok?0x1c3a10:0x4a1208)})}

/* ---------- Ein Bild zeichnen ---------- */
function r3Frame(list,rings,dt){
  const t=(performance.now()-R3.t0)/1000;
  if(R3.bgRef!==bg||R3.gRef!==G)r3Map();
  camUpdate();
  r3.terrOv.material.map.needsUpdate=true;r3.fogOv.material.map.needsUpdate=true;
  R3.nodeT-=dt;if(R3.nodeT<=0){R3.nodeT=.4;r3Nodes()}
  r3Sync(list,dt,t);
  R3.ringN=0;for(const r of rings)r3Ring(r.x,r.y,r.r,r.c,r.o);for(let i=R3.ringN;i<R3.rings.length;i++)R3.rings[i].visible=false;
  if(r3.ghost&&!R3.ghostOn)r3.ghost.visible=false;
  r3.rd.render(r3.scene,r3.camera);R3.ghostOn=false;
}
/* Höhe einer Figur/eines Gebäudes über dem Boden in Spielpixeln (für Lebensbalken, Marker) */
function entH(e){
  if(e.kind==='unit'){const t=e.type,d=UNITS[t];return d.naval?(t==='galleon'?55:40):t==='knight'?46:d.siege?(t==='ram'?30:34):e.r/7*25}
  if(e.kind==='bld'){const o=R3.reg.get(entKey(e,false));return o&&o.obj.userData.h?o.obj.userData.h*R3.S:e.r*2.4}
  if(e.kind==='animal')return ANIMALS[e.type].h||26;
  return e.r*({tree:3.6,bush:1.5,stone:1.1,iron:1.1}[e.type]||1)}
