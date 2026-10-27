/* Epochenkrieg – 3D-Darstellung (Three.js): Gelände, Modelle, Kamera, Licht. Das Spiel selbst rechnet weiter in 2D-Koordinaten (x, y in Pixeln);
   hier wird daraus die 3D-Welt: Spiel-x → x/S, Spiel-y → z/S, Höhe y kommt vom Gelände. Die Umrechnungen für Maus und Overlay stehen unten (R3.scr, toWorld).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
const R3={S:10,ok:false,D0:74,sd:[-.95,.85,-.5],todOn:false,PITCH:1.14,FOV:36,k:1,reg:new Map(),rings:[],ringN:0,t0:0,nodeT:0,bgRef:null,fogN:0};
const _v=()=>new THREE.Vector3();
let r3={};
const smooth3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

function r3Init(){
  const glc=document.getElementById('gl');
  const rd=new THREE.WebGLRenderer({canvas:glc,antialias:true,powerPreference:'high-performance'});
  rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.outputColorSpace=THREE.SRGBColorSpace;
  rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=1.12;
  const scene=new THREE.Scene(),SKY=0x16384f;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(0x9db8c4,260,620);
  const camera=new THREE.PerspectiveCamera(R3.FOV,1,2,1400);
  const sun=new THREE.DirectionalLight(0xffe2b8,3.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.35;scene.add(sun,sun.target);
  const hemi=new THREE.HemisphereLight(0xbcd2ee,0x4a5230,1.0);scene.add(hemi);
  const fill=new THREE.DirectionalLight(0x9db8ff,.38);fill.position.set(60,40,70);scene.add(fill); /* kühles Gegenlicht: Schattenseiten bekommen Farbe statt Grau */
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(3600,3600).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x17405c,fog:false}));sea.position.set(W/R3.S/2,-.8,H/R3.S/2);scene.add(sea);
  /* Umgebungslicht für Metall: ein kleiner gemalter Himmel (blau oben, warm am Horizont, dunkler Boden, helle Sonne) wird zur Spiegelung für Helme, Panzer, Waffen */
  try{const es=new THREE.Scene(),eg=new THREE.SphereGeometry(50,24,16),ec=[],c=new THREE.Color();const pa=eg.attributes.position;
    for(let i=0;i<pa.count;i++){const y=pa.getY(i)/50;if(y>0)c.setRGB(.55-.25*y,.7-.2*y,.95-.1*y).multiplyScalar(1.6);else c.setRGB(.34,.3,.22).multiplyScalar(.6+y*.3);ec.push(c.r,c.g,c.b)}
    eg.setAttribute('color',new THREE.Float32BufferAttribute(ec,3));es.add(new THREE.Mesh(eg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
    const sd=new THREE.Mesh(new THREE.SphereGeometry(6,12,8),new THREE.MeshBasicMaterial({color:0xfff3d6}));sd.material.color.multiplyScalar(14);sd.position.set(-25,32,-20);es.add(sd);
    R3.es=es;const pm=new THREE.PMREMGenerator(rd);M3.env=pm.fromScene(es,.04).texture;pm.dispose();scene.environment=M3.env}catch(err){console.warn('env',err)}
  const gEnt=new THREE.Group();scene.add(gEnt);
  r3={rd,scene,camera,sun,hemi,fill,sea,gEnt,vec:_v(),ray:new THREE.Raycaster(),maxTex:rd.capabilities.maxTextureSize};
  R3.ok=true;R3.t0=performance.now();setGfx(gfxQ);if(typeof optApply==='function')optApply();
  rd.domElement.addEventListener('webglcontextrestored',()=>setTimeout(()=>r3Revive(true),50));
}
/* Nach Fensterwechsel oder Grafikkarten-Reset: Zeichenfläche neu anlegen; nach Kontextverlust zusätzlich die einmal berechnete Umgebungsspiegelung (PMREM) neu malen, sonst bleibt die Welt dunkel oder weiß */
function r3Revive(full){if(!R3.ok)return;try{
  if(full&&R3.es){const old=M3.env,pm=new THREE.PMREMGenerator(r3.rd),t=pm.fromScene(R3.es,.04).texture;pm.dispose();M3.env=t;r3.scene.environment=t;r3.scene.traverse(o=>{if(!o.isMesh)return;for(const m of[].concat(o.material))if(m&&m.envMap===old){m.envMap=t;m.needsUpdate=true}})}
  r3.rd.setSize(Math.max(1,VW)+1,Math.max(1,VH),false);r3Resize();R3.bloomOff=0}catch(e){console.warn('revive',e)}}
/* Grafikqualität (Menü): 0 Niedrig, 1 Mittel, 2 Hoch (Standard), 3 Ultra – unterscheiden sich sichtbar in Schärfe, Schatten, Gras, Leuchten und Rauch */
const GQ=[{n:'Niedrig',pr:.7,sh:1024,grass:.25,bloom:0,smoke:0,rad:1,cloud:0},{n:'Mittel',pr:1,sh:1024,grass:.6,bloom:0,smoke:1,rad:1.5,cloud:1},{n:'Hoch',pr:1.5,sh:2048,grass:1,bloom:1,smoke:1,rad:2.5,cloud:1},{n:'Ultra',pr:2.2,sh:4096,grass:1.7,bloom:1,smoke:1,rad:4,cloud:1}];
let gfxQ=2;try{const q=localStorage.getItem('ek-gfx2');if(q!==null)gfxQ=Math.max(0,Math.min(3,+q||0));else{const o=localStorage.getItem('ek-gfx');if(o!==null)gfxQ=Math.max(0,Math.min(3,(+o||0)+1))}}catch(_){}
function setGfx(q,temp){const old=gfxQ;gfxQ=q;try{r3.scene.traverse(o=>{if(o.userData&&o.userData.veg)o.castShadow=q>=2})}catch(_){}if(!temp)try{localStorage.setItem('ek-gfx2',q)}catch(_){}if(!R3.ok)return;const g=GQ[q],sz=Math.min(g.sh,r3.maxTex);if(r3.sun.shadow.mapSize.x!==sz){r3.sun.shadow.mapSize.set(sz,sz);if(r3.sun.shadow.map){r3.sun.shadow.map.dispose();r3.sun.shadow.map=null}}
  r3.sun.shadow.radius=g.rad;r3Resize();if(typeof optApply==='function')optApply();if(GQ[old].grass!==g.grass&&r3.i_tuft&&typeof W!=='undefined')r3Grass()}
function r3Resize(){if(!R3.ok)return;r3.rd.setPixelRatio(Math.max(.4,Math.min(GQ[gfxQ].pr,Math.max(1,window.devicePixelRatio||1)*1.5)*(R3.dyn||1)));r3.rd.setSize(VW,VH,false);camUpdate()}

/* ---------- Gelände ---------- */
const hgrid={w:0,h:0,a:null};
function hAt(xp,yp){const g=hgrid;if(!g.a)return 0;const fx=Math.max(0,Math.min(g.w-1.001,xp/R3.S)),fz=Math.max(0,Math.min(g.h-1.001,yp/R3.S)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,a=g.a,W1=g.w;
  return(a[iz*W1+ix]*(1-tx)+a[iz*W1+ix+1]*tx)*(1-tz)+(a[(iz+1)*W1+ix]*(1-tx)+a[(iz+1)*W1+ix+1]*tx)*tz}
/* Gelände in Kacheln (gemeinsame Punkte, je Kachel eigener Index): nur sichtbare Kacheln werden gezeichnet */
function r3Chunks(g,NX,NZ,mat,C){C=C||32;const grp=new THREE.Group(),pos=g.attributes.position;grp.material=mat;grp.geometry=g;
  for(let cz=0;cz<NZ-1;cz+=C)for(let cx=0;cx<NX-1;cx+=C){const idx=[],x1=Math.min(NX-1,cx+C),z1=Math.min(NZ-1,cz+C);let y0=1e9,y1=-1e9;
    for(let j=cz;j<z1;j++)for(let i=cx;i<x1;i++){const a=j*NX+i,b=a+1,c=a+NX,d=c+1;idx.push(a,c,b,c,d,b)}
    for(let j=cz;j<=z1;j++)for(let i=cx;i<=x1;i++){const y=pos.getY(j*NX+i);if(y<y0)y0=y;if(y>y1)y1=y}
    const cg=new THREE.BufferGeometry();for(const k in g.attributes)cg.setAttribute(k,g.attributes[k]);cg.setIndex(idx);
    cg.boundingBox=new THREE.Box3(new THREE.Vector3(cx,y0,cz),new THREE.Vector3(x1,y1,z1));cg.boundingSphere=cg.boundingBox.getBoundingSphere(new THREE.Sphere());
    const m=new THREE.Mesh(cg,mat);grp.add(m);
    /* grobe Fassung (jeder 2. Eckpunkt, 1/4 der Dreiecke) für die Fernsicht – gleiche Eckpunkt-Daten, nur andere Dreiecke */
    if((x1-cx)%2===0&&(z1-cz)%2===0){const id2=[];for(let j=cz;j<z1;j+=2)for(let i=cx;i<x1;i+=2){const a=j*NX+i,b=a+2,c=a+2*NX,d=c+2;id2.push(a,c,b,c,d,b)}
      const lg=new THREE.BufferGeometry();for(const k in g.attributes)lg.setAttribute(k,g.attributes[k]);lg.setIndex(id2);lg.boundingBox=cg.boundingBox;lg.boundingSphere=cg.boundingSphere;m.userData.hi=cg;m.userData.lo=lg;if(R3.lodOn)m.geometry=lg}}
  (R3.chunkGrps||(R3.chunkGrps=new Set())).add(grp);
  Object.defineProperty(grp,'renderOrder',{set(v){grp.children.forEach(c=>c.renderOrder=v)},get(){return grp.children[0]?grp.children[0].renderOrder:0}});
  return grp}
/* ---------- Jahreszeiten (nur Aussehen): Licht, Himmel, Nebel, Meer, Belichtung; dazu Wetter (fallende Blätter, Blütenblätter, Schnee) ---------- */
const ATMO={ /* Sonne [Farbe,Stärke], Himmelslicht [oben,unten,Stärke], Gegenlicht [Farbe,Stärke], Himmel, Nebel, Meer, Belichtung */
  spring:{sun:[0xfff1d4,3],hemi:[0xc9e2f8,0x5a6c3a,1.05],fill:[0xa8c4ff,.4],sky:0x1c4a60,fog:0xb2cdd2,sea:0x1b4b68,exp:1.14},
  summer:{sun:[0xffe2b8,3.1],hemi:[0xbcd2ee,0x4a5230,1],fill:[0x9db8ff,.38],sky:0x16384f,fog:0x9db8c4,sea:0x17405c,exp:1.12},
  autumn:{sun:[0xffc78a,3],hemi:[0xc8b9a6,0x5a4426,1],fill:[0xb0a8c8,.34],sky:0x28363f,fog:0xb7a995,sea:0x1b3a4a,exp:1.1},
  winter:{sun:[0xe6eeff,2.45],hemi:[0xd6e4f6,0x8d98aa,1.3],fill:[0xb8ccff,.42],sky:0x2a4258,fog:0xc2d0de,sea:0x1c3850,exp:1.2}};
const lerpHex=(a,b,t)=>new THREE.Color(a).lerp(new THREE.Color(b),t).getHex();
/* Licht und Stimmung setzen (aus den Jahreszeit-Werten A; die Tageszeit ruft dies je Bild mit abgewandelten Werten) */
function r3Light(A){
  const{scene,sun,hemi,fill}=r3,room=typeof ROOM!=='undefined'&&ROOM.on;R3.fogNow=A.fog;
  sun.color.setHex(A.sun[0]);sun.intensity=A.sun[1];hemi.color.setHex(A.hemi[0]);hemi.groundColor.setHex(A.hemi[1]);hemi.intensity=A.hemi[2];fill.color.setHex(A.fill[0]);fill.intensity=A.fill[1];
  r3.rd.toneMappingExposure=A.exp;if(r3.sea)r3.sea.material.color.setHex(A.sea);
  if(room){scene.fog.color.setHex(0x8f877a).lerp(TC1.setHex(A.fog),.4)}else{if(!(scene.background&&scene.background.isColor))scene.background=new THREE.Color();scene.background.setHex(A.sky);scene.fog.color.setHex(A.fog)}}
/* ---------- Tageszeit (nur Optik, Option „Tageszeit“: Aus/Dezent/Voll): Sonnenstand, Farbe und Helligkeit wandern über einen Tag von 25 Spielminuten ---------- */
const TOD={len:1500,start:.1},TC1=new THREE.Color(),TC2=new THREE.Color();
/* Schlüsselbilder je Tagesabschnitt ph (0 Sonnenaufgang, .25 Mittag, .5 Sonnenuntergang, .75 Mitternacht): [ph, Sonne×, warm, blau, Höhe°, Seite°, Himmelslicht×, Belichtung×] */
const TODK={soft:[[0,.82,.9,0,22,-38,.95,1],[.1,.95,.4,0,35,-22,1,1],[.25,1,0,0,56,0,1,1],[.4,.98,.2,0,42,22,1,1],[.5,.8,.95,0,22,38,.95,1],[.6,.68,.3,.3,26,42,.9,1.02],[.75,.62,0,.5,40,0,.85,1.04],[.9,.66,.2,.35,26,-42,.9,1.02]],
  full:[[0,.7,.95,.15,16,-40,.8,1.02],[.1,.95,.25,0,35,-22,1,1],[.25,1,0,0,56,0,1,1],[.4,.97,.14,0,42,22,1,1],[.5,.7,.95,.1,16,40,.8,1.02],[.6,.4,.25,.55,24,44,.6,1.08],[.75,.2,0,.9,42,0,.42,1.12],[.9,.4,.2,.55,24,-44,.6,1.08]]};
const smooth01=t=>t*t*(3-2*t);
function r3Tod(){
  const m0=OPT.tod||'soft',off=m0==='off'||!G||!G.running||(typeof ROOM!=='undefined'&&ROOM.wide());
  if(off||!R3.atmo){if(R3.todOn){R3.todOn=false;R3.sd[0]=-.95;R3.sd[1]=.85;R3.sd[2]=-.5;if(R3.atmo)r3Light(R3.atmo)}return}
  const m=EGO.on&&m0==='full'?'soft':m0,K=TODK[m],ph=(((G.t||0)/TOD.len)+TOD.start)%1;let i=0;while(i<K.length-1&&K[i+1][0]<=ph)i++;
  const a=K[i],b=K[(i+1)%K.length],pa=a[0],pb=i+1<K.length?b[0]:1,t=smooth01(Math.max(0,Math.min(1,(ph-pa)/(pb-pa||1)))),L=(k)=>a[k]+(b[k]-a[k])*t;
  const sunM=L(1),warm=L(2),blue=L(3),elev=L(4)*Math.PI/180,az=L(5)*Math.PI/180,hemM=L(6),expM=L(7),A=R3.atmo;
  const th=Math.atan2(-.5,-.95)+az,ch=Math.cos(elev)*1.369;R3.sd[0]=Math.cos(th)*ch;R3.sd[1]=Math.sin(elev)*1.369;R3.sd[2]=Math.sin(th)*ch;
  const col=(hex,warmHex,blueHex,w,bl)=>TC2.setHex(hex).lerp(TC1.setHex(warmHex),w).lerp(TC1.setHex(blueHex),bl).getHex();
  r3Light({sun:[col(A.sun[0],0xff9d5a,0x8aa6e6,warm,blue),A.sun[1]*sunM],hemi:[col(A.hemi[0],0xffc79a,0x6f8ac8,warm*.5,blue*.6),col(A.hemi[1],0x7a5a3a,0x1c2a44,warm*.2,blue*.5),A.hemi[2]*hemM],fill:[col(A.fill[0],0xffb0a0,0x7f9bd8,warm*.3,blue*.5),A.fill[1]*(1+blue*.6)],exp:A.exp*expM,
    sky:col(A.sky,0x6a3a3a,0x0b1424,warm*.4,blue*.8),fog:col(A.fog,0xe8a77a,0x2c3d5e,warm*.4,blue*.62),sea:col(A.sea,0x3a4a52,0x0b1a30,warm*.2,blue*.6)});
  R3.todOn=true}
function r3Season(){
  if(!R3.ok||typeof MOPT==='undefined')return;
  const se=MOPT.season||'summer',pal=(MAPS[curMap]||{}).pal||'green',A=Object.assign({},ATMO[se]||ATMO.summer),P=mapPal(curMap,se);
  /* die Farbwelt der Karte färbt das Licht mit */
  if(pal==='desert'||pal==='canyon'){A.sun=[lerpHex(A.sun[0],0xffd49a,.7),A.sun[1]*1.03];A.fog=lerpHex(A.fog,0xd8c19c,.55);A.hemi=[A.hemi[0],lerpHex(A.hemi[1],0x86643c,.6),A.hemi[2]]}
  else if(pal==='swamp'){A.fog=lerpHex(A.fog,0xa6b8a0,.5);A.sun=[lerpHex(A.sun[0],0xf4e8c0,.4),A.sun[1]*.94];A.sea=lerpHex(A.sea,0x1c4a48,.5)}
  else if(pal==='crater'||pal==='fjord'){A.fog=lerpHex(A.fog,0xb0c0cc,.4)}
  R3.atmo=A;R3.se=se;R3.dry=pal==='desert'||pal==='canyon';R3.ice=P.ice||0;R3.pk=P.peak;
  const{scene,sun,hemi,fill}=r3,room=typeof ROOM!=='undefined'&&ROOM.on;
  r3Light(A);
  /* Modelle der Jahreszeit/Farbwelt nachladen (erst jetzt nötig); danach Bäume neu aufbauen */
  if(typeof EKMODELS!=='undefined'&&EKMODELS.loadWhen)EKMODELS.loadWhen([se,'pal:'+pal]).then(n=>{if(n&&r3.ns&&R3.gRef===G)r3NodesInit()}).catch(()=>{})}
/* Wetter: Instanzen aus kleinen Vierecken, die zur Kamera zeigen; wandern mit dem Bildausschnitt, im Sparmodus und bei Grafik „Niedrig“ aus */
const WX={autumn:{n:130,col:[0xd9731c,0xc23c18,0xe8b82c,0xcf8a22],sz:.62,fall:2.2,sway:1.8,spin:3},winter:{n:380,col:[0xffffff,0xeef4ff],sz:.34,fall:3,sway:.8,spin:0},spring:{n:90,col:[0xf6b8d0,0xffffff,0xf8d0dc],sz:.46,fall:1.5,sway:1.8,spin:2}};
function r3Weather(dt,t){
  const c=WX[R3.se],on=c&&OPT.weather&&GQ[gfxQ].smoke&&!R3.saverOn&&!R3.slow&&(R3.dyn||1)>=1&&cam.z>=.5&&typeof ROOM!=='undefined'&&!(ROOM.on&&document.body.classList.contains('mm'));
  if(!on){if(r3.wx)r3.wx.visible=false;return}
  const S=R3.S;
  if(!r3.wx||r3.wx.userData.se!==R3.se||r3.wx.userData.gq!==gfxQ){
    if(r3.wx){r3.scene.remove(r3.wx);r3.wx.dispose()}
    const n=Math.round(c.n*(gfxQ>=3?1.4:1)),m=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({transparent:true,opacity:.92,depthWrite:false,side:THREE.DoubleSide,fog:false}),n),col=new THREE.Color(),R=mulberry(777);
    const st=new Float32Array(n*6);for(let i=0;i<n;i++){st[i*6]=R()*W/S;st[i*6+1]=R()*H/S;st[i*6+2]=R();st[i*6+3]=R()*6.283;st[i*6+4]=.6+R()*.8;st[i*6+5]=R()*6.283;col.setHex(c.col[i%c.col.length]);m.setColorAt(i,col)}
    m.frustumCulled=false;m.renderOrder=5;m.userData={se:R3.se,gq:gfxQ,st,n};m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);r3.scene.add(m);r3.wx=m}
  const m=r3.wx,st=m.userData.st,n=m.userData.n,d=R3.D0/cam.z,hw=d*.95,hd=d*.8,top=d*.42+6,tx=cam.x/S,tz=cam.y/S,o=r3.wxO||(r3.wxO=new THREE.Object3D()),q=r3.camera.quaternion,qz=new THREE.Quaternion(),ax=new THREE.Vector3(0,0,1);
  m.visible=true;
  for(let i=0;i<n;i++){const j=i*6;
    /* st: x,z (Weltkoordinaten, wandern beim Verschieben des Bildes im Kasten um die Kamera), Fallhöhe 0..1, Phase, Tempofaktor, Drehphase */
    st[j+2]-=dt*c.fall*st[j+4]/top;if(st[j+2]<0)st[j+2]+=1;
    const px=tx-hw+((st[j]+Math.sin(t*.7+st[j+3])*c.sway-(tx-hw))%(2*hw)+2*hw)%(2*hw),pz=tz-hd+((st[j+1]-(tz-hd))%(2*hd)+2*hd)%(2*hd),gy=hAt(px*S,pz*S),y=gy+st[j+2]*top;
    o.position.set(px,y,pz);o.quaternion.copy(q);if(c.spin){qz.setFromAxisAngle(ax,t*c.spin*st[j+4]+st[j+5]);o.quaternion.multiply(qz)}o.scale.setScalar(c.sz*(.7+.5*st[j+4]));o.updateMatrix();m.setMatrixAt(i,o.matrix)}
  m.instanceMatrix.needsUpdate=true;m.count=n}
function r3Map(){
  const S=R3.S,{scene}=r3;r3Season();
  for(const o of R3.reg.values()){r3.gEnt.remove(o.obj);r3Drop(o.obj)}R3.reg.clear();
  if(r3.terrain){scene.remove(r3.terrain);r3.terrain.geometry.dispose();r3.terrain.material.map.dispose();scene.remove(r3.terrOv);scene.remove(r3.fogOv)}
  const GW=TW,GH=TH;
  const cell=(a,x,y)=>a[Math.max(0,Math.min(GH-1,y))*GW+Math.max(0,Math.min(GW-1,x))];
  const lg=shoreField(t=>t>=2),sg=shoreField(t=>t>=1);
  const bil=(a,xu,zu)=>shoreAt(a,xu*S/TG-.5,zu*S/TG-.5),bilH=(a,xu,zu)=>{const fx=Math.max(0,Math.min(GW-1.001,xu*S/TG-.5)),fz=Math.max(0,Math.min(GH-1.001,zu*S/TG-.5)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz;return(a[iz*GW+ix]*(1-tx)+a[iz*GW+ix+1]*tx)*(1-tz)+(a[(iz+1)*GW+ix]*(1-tx)+a[(iz+1)*GW+ix+1]*tx)*tz};
  // Höhenfeld für die Darstellung glätten (sonst sieht man die 20-px-Stufen der Felder)
  const HLs=new Float32Array(GW*GH);for(let pass=0;pass<2;pass++){const src=pass?HLs.slice():HL;for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){let sm=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(GW-1,x+dx)),ny=Math.max(0,Math.min(GH-1,y+dy)),wt=dx||dy?1:3;sm+=wt*src[ny*GW+nx];n+=wt}HLs[y*GW+x]=sm/n}}
  const nz=(x,z)=>Math.sin(x*.11)*Math.cos(z*.09)*.5+Math.sin(x*.23+z*.17)*.25+Math.sin(x*.05-z*.07)*.6;
  const SX=W/S,SZ=H/S,NX=SX+1,NZ=SZ+1;hgrid.w=NX;hgrid.h=NZ;hgrid.a=new Float32Array(NX*NZ);
  const g=new THREE.PlaneGeometry(SX,SZ,SX,SZ);g.rotateX(-Math.PI/2);g.translate(SX/2,0,SZ/2);const pos=g.attributes.position;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const l=bil(lg,i,j),sh=bil(sg,i,j),m=smooth3(.40,.60,l);
    let sea=-.5+.16*smooth3(.3,.8,sh),land=bilH(HLs,i,j)+nz(i*2.3,j*2.3)*.05;if(land>1.2)land+=(land-1.2)*.05*(Math.sin(i*.9+j*.3)*Math.cos(j*1.1)+Math.sin(i*2.3+j*1.7)*.6);hgrid.a[j*NX+i]=sea*(1-m)+land*m-(1-smooth3(0,7,Math.min(i,j,NX-1-i,NZ-1-j)))*2.4;pos.setY(j*NX+i,hgrid.a[j*NX+i])}
  g.computeVertexNormals();
  {const nm=g.attributes.normal,col=new Float32Array(pos.count*3);let my=0;for(let i=0;i<TERR.length;i++)if(TERR[i]===3&&HL[i]>my)my=HL[i];
    for(let i=0;i<pos.count;i++){const slope=1-nm.getY(i),sn=my>2.2&&R3.pk>0?smooth3(my*.46/R3.pk,my*.56/R3.pk,hlAt(pos.getX(i)*10,pos.getZ(i)*10)):0,s=smooth3(.1,.4,slope)*(1-sn*.92);const br=1+2.2*sn;col[i*3]=(1-s*.42)*br;col[i*3+1]=(1-s*.5)*br;col[i*3+2]=(1-s*.56)*br*(1+.06*sn)}g.setAttribute('color',new THREE.BufferAttribute(col,3))}
  // Boden-Textur: das fertig gemalte Bild der Karte (renderBg), bei Bedarf verkleinert
  let src=bg;if(Math.max(bg.width,bg.height)>r3.maxTex){const k=r3.maxTex/Math.max(bg.width,bg.height);src=document.createElement('canvas');src.width=Math.floor(bg.width*k);src.height=Math.floor(bg.height*k);src.getContext('2d').drawImage(bg,0,0,src.width,src.height)}
  const tex=new THREE.CanvasTexture(src);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,r3.rd.capabilities.getMaxAnisotropy());
  if(!r3.detail){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);let a=7;for(let i=0;i<256*256;i++){a=(a*1664525+1013904223)>>>0;const v=100+(a>>>24)*.6;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}x.putImageData(im,0,0);
    for(let i=0;i<500;i++){const px=Math.random()*256,py=Math.random()*256,r=3+Math.random()*10,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,2*r,2*r)}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(SX/6,SZ/6);r3.detail=t;
    const wc=document.createElement('canvas');wc.width=wc.height=256;const wx=wc.getContext('2d');wx.clearRect(0,0,256,256);wx.strokeStyle='rgba(255,255,255,.9)';wx.lineCap='round';
    for(let i=0;i<70;i++){const px=Math.random()*256,py=Math.random()*256,l=8+Math.random()*22;wx.lineWidth=1+Math.random()*1.5;wx.globalAlpha=.25+Math.random()*.5;for(const[ox,oy]of[[0,0],[256,0],[-256,0],[0,256],[0,-256]]){wx.beginPath();wx.moveTo(px-l+ox,py+oy);wx.quadraticCurveTo(px+ox,py-4+oy,px+l+ox,py+oy);wx.stroke()}}
    r3.waveTex=wc}
  const tm=new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:1,metalness:0,bumpMap:r3.detail,bumpScale:.45});
  /* großflächige Helligkeits-/Farbschwankung im Boden (bricht die gleichförmigen Flächen auf), per Shader-Zusatz */
  tm.onBeforeCompile=sh=>{sh.uniforms.uCT=CLOUD.t;sh.uniforms.uCK=CLOUD.k;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;varying vec3 vWn;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWp=(modelMatrix*vec4(position,1.0)).xyz;vWn=normal;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uCT;uniform float uCK;\nvarying vec3 vWp;varying vec3 vWn;\nfloat h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}')
      .replace('#include <map_fragment>','#include <map_fragment>\n{float n=vn(vWp.xz*0.035)*0.55+vn(vWp.xz*0.11)*0.3+vn(vWp.xz*0.4)*0.15;float k=0.86+0.3*n;diffuseColor.rgb*=vec3(k*1.02,k,k*0.97);'+(window.__noStrata?'':'float cl=smoothstep(0.1,0.42,1.0-normalize(vWn).y);if(cl>0.0){float sn=vn(vec2((vWp.x+vWp.z)*0.33,vWp.y*1.9));float bd=smoothstep(0.15,0.85,0.5+0.5*sin(vWp.y*2.8+vn(vWp.xz*0.25)*5.0));float cr=vn(vec2((vWp.x-vWp.z)*1.3,vWp.y*0.5))*0.65+vn(vec2((vWp.x+vWp.z)*3.1,vWp.y*1.1))*0.35;diffuseColor.rgb*=1.0+cl*((0.74+0.34*sn)*(0.8+0.3*bd)*(0.76+0.44*cr)-1.0);}')+'if(uCK>0.0){vec2 cp=vWp.xz*0.0032+vec2(uCT*0.0022,uCT*0.0009);float c=vn(cp)*0.7+vn(cp*2.3+7.0)*0.3;float cs=smoothstep(0.47,0.6,c);diffuseColor.rgb*=1.0-uCK*cs*vec3(0.5,0.45,0.35);}}')};
  const mesh=r3Chunks(g,NX,NZ,tm);mesh.children.forEach(c=>c.receiveShadow=true);scene.add(mesh);r3.terrain=mesh;
  if(r3.waves)for(const w of r3.waves)scene.remove(w);r3.waves=[];
  for(const[sp,rep,op]of[[1,SX/9,.32],[-1,SX/5.3,.22]]){const wt=new THREE.CanvasTexture(r3.waveTex);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(rep,rep*SZ/SX);const wm=new THREE.Mesh(new THREE.PlaneGeometry(SX,SZ).rotateX(-Math.PI/2).translate(SX/2,0,SZ/2),new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));wm.position.y=-.34;wm.renderOrder=1;wm.userData.sp=sp;wm.userData.op0=op;scene.add(wm);r3.waves.push(wm)}
  const ovMat=(cv,order,op)=>{const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;const m=r3Chunks(g,NX,NZ,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false}));m.renderOrder=order;m.material.opacity=op;scene.add(m);return m};
  /* Küstenschaum: helle, weich verlaufende Linie im flachen Wasser am Ufer; pulsiert wie anlaufende Wellen */
  if(r3.foam){scene.remove(r3.foam);r3.foam.material.map.dispose()}
  {const K=4,fc=document.createElement('canvas');fc.width=TW*K;fc.height=TH*K;const fx=fc.getContext('2d');
    /* aus dem weichen Land-/Flachwasser-Feld (shoreField), nicht aus den eckigen Feldern: Schaum folgt der runden Küstenlinie */
    {const w=fc.width,h=fc.height,im=fx.createImageData(w,h);
      for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){const gx=(X+.5)/K-.5,gy=(Y+.5)/K-.5,v=shoreAt(lg,gx,gy);if(v<.04||v>=.54)continue;const sv=shoreAt(sg,gx,gy),a=smooth3(.04,.32,v)*.95*(1-smooth3(.44,.54,v))*smooth3(.45,.6,sv),o=(Y*w+X)*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=a*255}
      fx.putImageData(im,0,0)}
    const f2=document.createElement('canvas');f2.width=fc.width;f2.height=fc.height;const x2=f2.getContext('2d');x2.filter='blur(3px)';x2.drawImage(fc,0,0);
    const t=new THREE.CanvasTexture(f2);t.colorSpace=THREE.SRGBColorSpace;
    const m=r3Chunks(g,NX,NZ,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,opacity:.5,fog:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.renderOrder=1;scene.add(m);r3.foam=m}
  r3.terrOv=ovMat(terrCv,2,.75);r3.fogOv=ovMat(fogCv,3,1);
  r3NodesInit();R3.bgRef=bg;R3.gRef=G;
}

/* ---------- Kamera und Umrechnung ---------- */
function camUpdate(){
  if(!R3.ok||!VW)return;if(EGO.on){egoCam();if(EGO.on)return}if(EGO.on){egoCam();if(EGO.on)return}const{camera,sun}=r3,S=R3.S,d=R3.D0/cam.z,tx=cam.x/S,tz=cam.y/S,ty=hAt(cam.x,cam.y);
  camera.aspect=VW/VH;camera.fov=R3.FOV;camera.near=Math.max(.8,Math.min(2,d*.06));/* ganz nah ran: nichts schneidet in die Kamera */camera.updateProjectionMatrix();
  /* freie Kamera: Blick von (yaw, pitch) auf den Punkt cam.x/cam.y; yaw 0 = Standard (Norden oben), pitch 1,14 = Standard-Neigung */
  const pc=Math.cos(cam.pitch)*d,px=tx+Math.sin(cam.yaw)*pc,pz=tz+Math.cos(cam.yaw)*pc;let py=ty+Math.sin(cam.pitch)*d;
  /* nie unter den Boden / das Brett: Mindesthöhe über dem Gelände an der Kameraposition (und über dem Brett ausserhalb der Karte) */
  py=Math.max(py,Math.max(0,hAt(px*S,pz*S))+1.6);
  camera.position.set(px,py,pz);camera.lookAt(tx,ty,tz);camera.updateMatrixWorld();
  R3.k=(VH/(2*Math.tan(R3.FOV*Math.PI/360)*d))/S; // Bildschirm-Pixel pro Spiel-Pixel in der Bildmitte
  const b=Math.min(260,d*.85);/* weiter Zoom: Schattenbild deckt die Bildmitte weiträumig ab */sun.position.set(tx+R3.sd[0]*b,ty+R3.sd[1]*b,tz+R3.sd[2]*b);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;sc.left=sc.bottom=-b;sc.right=sc.top=b;sc.near=1;sc.far=b*3.2;sc.updateProjectionMatrix();
  /* Flacher Blick sieht viel mehr Land (5× Dreiecke): Nebel rückt dann näher, und was hinter dem Nebel liegt, wird gar nicht erst gezeichnet (R3.cull = Reichweite in Spielpixeln) */
  const fl=Math.max(0,Math.min(1,(1-cam.pitch)/.7)),fn=d*(2.4-1.1*fl),ff=d*(6-2.8*fl);r3.scene.fog.near=fn;r3.scene.fog.far=ff;R3.farT=ff*1.05;R3.fl=fl;R3.cull=fl>0?ff*1.02*S:0;R3.cx=cam.x+Math.sin(cam.yaw)*pc*S;R3.cy=cam.y+Math.cos(cam.yaw)*pc*S;
}
/* Spielpunkt (x,y in Pixeln, Höhe z in Pixeln) → Bildschirm. k = Bildschirm-Pixel je Spielpixel genau an diesem Punkt (Tiefe), front = vor der Kamera und im Tiefenbereich */
const _sc3=new THREE.Vector3();
function scr(x,y,z){const v=r3.vec,S=R3.S,c=r3.camera;v.set(x/S,hAt(x,y)+(z||0)/S,y/S);_sc3.copy(v).sub(c.position);const e=c.matrixWorld.elements,dep=-(_sc3.x*e[8]+_sc3.y*e[9]+_sc3.z*e[10]);v.project(c);return{x:(v.x+1)/2*VW,y:(1-v.y)/2*VH,front:v.z<1&&dep>(EGO.on?3:0),k:dep>0?VH/(2*Math.tan(c.fov*Math.PI/360)*dep)/S:R3.k}}
/* Bildschirm → Spielpunkt (Strahl auf das Gelände). Bei steilem Blick wenige Fixpunkt-Schritte, bei flachem Blick Strahlmarsch (Berge verdecken sonst falsch). */
function toWorld(sx,sy,raw){/* raw: auch ausserhalb der Karte (Kamera, Tisch), sonst auf die Karte begrenzt */
  if(!R3.ok)return{x:cam.x,y:cam.y};
  const{camera,ray}=r3,S=R3.S;ray.setFromCamera({x:sx/VW*2-1,y:-(sy/VH)*2+1},camera);const o=ray.ray.origin,d=ray.ray.direction,far=R3.farT||1200;
  let x,z;
  if(cam.pitch>=.95){let h=0;x=cam.x/S;z=cam.y/S;
    for(let i=0;i<4;i++){const t=Math.min(far,(h-o.y)/(d.y<-1e-4?d.y:-1e-4));x=o.x+d.x*t;z=o.z+d.z*t;h=hAt(x*S,z*S)}}
  else{/* Strahlmarsch bis zum ersten Punkt unter dem Gelände, dann halbieren */
    let t0=0,t1=-1,st=Math.max(.8,far/260);
    for(let t=st;t<=far;t+=st*(1+t/far)){if(o.y+d.y*t<=Math.max(-2.4,hAt((o.x+d.x*t)*S,(o.z+d.z*t)*S))){t1=t;break}t0=t}
    if(t1<0)t1=far;else for(let i=0;i<7;i++){const m=(t0+t1)/2;if(o.y+d.y*m<=Math.max(-2.4,hAt((o.x+d.x*m)*S,(o.z+d.z*m)*S)))t1=m;else t0=m}
    x=o.x+d.x*t1;z=o.z+d.z*t1}
  return raw?{x:x*S,y:z*S}:{x:Math.max(0,Math.min(W,x*S)),y:Math.max(0,Math.min(H,z*S))}}

/* Wind: Bäume, Büsche und Gras wiegen sich (Vertex-Shader-Zusatz; Ausschlag wächst mit der Höhe, jede Instanz hat eine andere Phase) */
const WIND={value:0};
const CLOUD={t:{value:0},k:{value:0}};/* Wolkenschatten: Zeit, Stärke (0 = aus) */
function windify(mat,amp){mat.customProgramCacheKey=()=>"wind"+amp;/* eigener Programm-Schlüssel je Ausschlag (sonst teilen sich gleiche Materialien das zuerst übersetzte Programm) */mat.onBeforeCompile=sh=>{sh.uniforms.uWind=WIND;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  float hw=max(position.y,0.0);float pw=instanceMatrix[3].x*0.55+instanceMatrix[3].z*0.43;
  transformed.x+=(sin(uWind*1.7+pw)+0.4*sin(uWind*3.3+pw*1.7))*${amp.toFixed(3)}*hw*hw;
  transformed.z+=cos(uWind*1.3+pw*0.8)*${(amp*.6).toFixed(3)}*hw*hw;
  #endif`)};return mat}
/* ---------- Instanzen für Bäume, Büsche, Felsen, Deko ---------- */
/* Mehrteilige Instanzen (glTF-Bäume/Felsen: ein InstancedMesh je Teil), sieht von aussen wie ein einzelnes InstancedMesh aus */
/* Vereinfachte Fassung eines Modells für die Fernsicht (Eckpunkte in einem Raster zusammenlegen, Farben mitteln, flach schattiert) */
function lodGeo(g,div){if(!g.attributes.color||g.attributes.uv&&g.attributes.uv.count&&!g.attributes.color)return null;const P=g.attributes.position,C=g.attributes.color,I=g.index,nt=(I?I.count:P.count)/3;if(nt<300)return null;
  g.computeBoundingBox();const b=g.boundingBox,sz=b.getSize(new THREE.Vector3()),cs=Math.max(sz.x,sz.y,sz.z)/div,key=new Map(),acc=[],id=new Int32Array(P.count);
  for(let i=0;i<P.count;i++){const k=Math.floor((P.getX(i)-b.min.x)/cs)+'|'+Math.floor((P.getY(i)-b.min.y)/cs)+'|'+Math.floor((P.getZ(i)-b.min.z)/cs);let j=key.get(k);if(j===undefined){j=acc.length;key.set(k,j);acc.push([0,0,0,0,0,0,0])}const a=acc[j];a[0]+=P.getX(i);a[1]+=P.getY(i);a[2]+=P.getZ(i);a[3]+=C.getX(i);a[4]+=C.getY(i);a[5]+=C.getZ(i);a[6]++;id[i]=j}
  const pos=[],col=[];for(let t=0;t<nt;t++){const v=[0,1,2].map(q=>id[I?I.getX(t*3+q):t*3+q]);if(v[0]===v[1]||v[1]===v[2]||v[0]===v[2])continue;for(const j of v){const a=acc[j];pos.push(a[0]/a[6],a[1]/a[6],a[2]/a[6]);col.push(a[3]/a[6],a[4]/a[6],a[5]/a[6])}}
  if(pos.length/9>nt*.7)return null;const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('color',new THREE.Float32BufferAttribute(col,3));o.computeVertexNormals();o.computeBoundingSphere();return o}
const LOD_Z=.95; /* unterhalb dieses Zooms (weiter weg) zeichnen Bäume ihre vereinfachte Fassung */
/* Fernsicht: Figuren werfen keinen Schatten (halbiert ihre Zeichenaufrufe/Dreiecke; aus der Ferne unsichtbar) */
function r3UnitSh(obj,on){obj.traverse(x=>{if(!x.isMesh)return;if(x.userData.csh===undefined)x.userData.csh=x.castShadow;x.castShadow=on?false:x.userData.csh})}
/* Figuren: auf dem Bildschirm kleiner als FIG_LOD_PX Pixel (R3.k = Bildschirm-Pixel je Spielpixel, ein Mensch ist ~25 Spielpixel hoch) nehmen sie ihre grobe Fassung (~1/3 der Dreiecke, nur anderer Index) */
const FIG_LOD_PX=60;
/* Entfernte Objekte: Eckpunkt-Daten, die nur dem Objekt gehören (zusammengefasste Gebäude ohne Zwischenspeicher), und die Knochen-Textur der Figuren im Grafikspeicher freigeben */
function r3Drop(obj){obj.traverse(x=>{if(x.isMesh&&x.geometry.userData.own)x.geometry.dispose();if(x.isSkinnedMesh&&x.skeleton)x.skeleton.dispose()/* Knochen-Textur der Figur */})}
function r3UnitLod(obj,on){obj.traverse(x=>{if(x.isSkinnedMesh&&x.userData.lo)x.geometry=on?x.userData.lo:x.userData.hi})}
function r3FigLod(){const on=R3.k*25<FIG_LOD_PX&&!window.__noLod;if(on===R3.figLod)return;R3.figLod=on;for(const e of G.ents)if(e.kind==='unit'||e.kind==='animal'){const o=R3.reg.get(entKey(e));if(o)r3UnitLod(o.obj,on)}}
function r3Lod(){r3FigLod();const on=!EGO.on&&cam.z<LOD_Z;if(on===R3.lodOn||!r3.ns)return;R3.lodOn=on;for(const e of G.ents)if(e.kind==='unit'||e.kind==='animal'){const o=R3.reg.get(entKey(e));if(o)r3UnitSh(o.obj,on)}for(const gp of R3.chunkGrps||[]){if(!gp.parent){R3.chunkGrps.delete(gp);continue}for(const c of gp.children)if(c.userData.lo)c.geometry=on?c.userData.lo:c.userData.hi}for(const k in r3.ns)for(const m of r3.ns[k].L)if(m.isMulti)for(const q of m.parts)if(q.userData.lo)q.geometry=on?q.userData.lo:q.userData.hi}
function r3Multi(parts,n,wind){
  const ms=parts.map(p=>{const mt=p.mat;if(wind)windify(mt,wind);const m=new THREE.InstancedMesh(p.geo,mt,Math.max(1,n));/* keine vereinfachten Bäume mehr: die Raster-Vereinfachung liess Nadelbäume beim Rauszoomen verschwinden */if(wind&&window.__treeLod){if(p.lo===undefined)p.lo=lodGeo(p.geo,9);if(p.lo){m.userData.hi=p.geo;m.userData.lo=p.lo;if(R3.lodOn)m.geometry=p.lo}}m.userData.veg=true;m.castShadow=gfxQ>=2;/* Schatten der vielen Bäume nur ab Grafik „Hoch“ (spart die Hälfte der Zeichenarbeit) */m.receiveShadow=true;m.frustumCulled=false;m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);return m});
  return{isMulti:true,parts:ms,setMatrixAt(i,mx){ms.forEach(m=>m.setMatrixAt(i,mx))},setColorAt(i,c){ms.forEach(m=>m.setColorAt(i,c))},dispose(){ms.forEach(m=>m.dispose())}}}
function r3DropInst(m){if(!m)return;if(m.isMulti)m.parts.forEach(p=>r3.scene.remove(p));else r3.scene.remove(m);m.dispose()}
/* Natur-Sätze: je Schlüssel eine Instanz-Gruppe pro Modell-Variante (Liste in manifest.nodes). geo = Code-Modell (Rückfall und Grössenmassstab),
   alt = Ersatz-Schlüssel ohne eigene Modelle, rock = 3 feste Varianten (Felsen/Erze), low = flach am Boden (kein Schatten). Puffer wachsen bei Bedarf (nsBuild). */
const NSET={pine:{geo:()=>treeGeo(true),wind:.022},broad:{geo:()=>treeGeo(false),wind:.03},birch:{wind:.03,alt:'broad'},willow:{wind:.03,alt:'broad'},autumn:{wind:.03,alt:'broad'},
  bush:{geo:()=>bushGeoC(),wind:.05},bushE:{wind:.05,alt:'bush'},stump:{},wheat:{wind:.12,low:1},alpine:{wind:.015},snowy:{wind:.012},
  /* Jahreszeiten (Manifest: when) – fehlen die Modelle noch, springt der Schlüssel auf alt */
  broadA:{wind:.03,alt:'broad'},birchA:{wind:.03,alt:'birch'},willowA:{wind:.03,alt:'willow'},broadW:{wind:.02,alt:'broad'},birchW:{wind:.02,alt:'birch'},willowW:{wind:.02,alt:'willow'},bloom:{wind:.03,alt:'broad'},bloomW:{wind:.03,alt:'broad'},broadD:{wind:.025,alt:'broad'},cactus:{wind:.008},
  stone:{rock:1},iron:{rock:1,like:'stone'},gold:{rock:1,like:'stone'},oil:{rock:1}}; /* like: Grössenmassstab der echten Felsmodelle = Stein (das Code-Modell von Eisen/Gold ist mit Erzbrocken/Kristallen viel höher → die Felsen wurden 1,2–1,6× zu gross) */
function nsBuild(key,cap){const d=NSET[key],old=r3.ns[key];if(old)old.L.forEach(r3DropInst);const L=[];
  const mk=geo=>{const mt=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,flatShading:!!d.rock});if(d.wind)windify(mt,d.wind);const m=new THREE.InstancedMesh(geo,mt,cap);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);r3.scene.add(m);return m};
  const n=d.rock?3:EKMODELS.nodeN(key);
  for(let v=0;v<n;v++){const ref=d.rock?rockGeoC(key,v):d.geo?d.geo():null,ps=EKMODELS.nodeParts(key,v,d.like?rockGeoC(d.like,v):ref);
    if(ps){const m=r3Multi(ps,cap,d.wind);m.parts.forEach(p=>{if(d.low){p.castShadow=false;p.userData.veg=false}r3.scene.add(p)});L.push(m)}else if(ref)L.push(mk(ref))}
  if(!L.length&&d.geo)L.push(mk(d.geo()));
  return r3.ns[key]={L,cap}}
function r3NodesInit(){
  if(r3.ns)for(const k in r3.ns)r3.ns[k].L.forEach(r3DropInst);r3.ns={};
  const cnt={};for(const e of G.ents)if(e.kind==='node')cnt[e.type]=(cnt[e.type]||0)+1;
  for(const k in NSET)nsBuild(k,NSET[k].rock?(cnt[k]||0)*6+6:k==='bush'||k==='bushE'?(cnt.bush||0)+4:64);
  r3Deco();r3Grass();R3.nodeT=0;
}
/* Berg-Deko ohne Spielwirkung: auf Fels (TERR 3, nicht am Rand) knorrige Bäume, Kiefern, Felsbrocken; oberhalb der Schneegrenze (wie in r3Map) verschneite Bäume und Felsen */
function r3Deco(){const R=mulberry(9173),L=[],rock=(x,y)=>x>=0&&y>=0&&x<TW&&y<TH&&TERR[y*TW+x]===3;let my=0;for(let i=0;i<TERR.length;i++)if(TERR[i]===3&&HL[i]>my)my=HL[i];
  const pick=(key,r)=>{const L=EKMODELS.nodeL(key);let t=0;for(const x of L)t+=x.w||1;let a=r*t;for(let i=0;i<L.length;i++){a-=L[i].w||1;if(a<=0)return i}return 0}; /* Variante nach Gewicht w im Manifest */
  const cl=(x,y)=>.2+1.6*smooth3(.45,.8,.5+.25*Math.sin(x*.011+1.3)*Math.cos(y*.013-.4)+.25*Math.sin((x+y)*.023)); /* Dichte in Gruppen statt gleichmässig gestreut */
  if(EKMODELS.nodeN('alpine')||EKMODELS.nodeN('snowy'))for(let ty=2;ty<TH-2;ty++)for(let tx=2;tx<TW-2;tx++){if(!rock(tx,ty)||R()>.075*cl(tx*TG,ty*TG))continue;let ok=true;for(let dy=-2;dy<=2&&ok;dy++)for(let dx=-2;dx<=2;dx++)if(!rock(tx+dx,ty+dy)){ok=false;break}if(!ok)continue;
    const x=(tx+.15+R()*.7)*TG,y=(ty+.15+R()*.7)*TG,sn=my>2.2&&R3.pk>0?smooth3(my*.46/R3.pk,my*.56/R3.pk,hlAt(x,y)):0;let h=hAt(x,y);for(let k=0;k<4;k++)h=Math.min(h,hAt(x+Math.cos(k*1.57)*8,y+Math.sin(k*1.57)*8));
    const key=sn>.5?'snowy':'alpine';L.push({x,y,h:h-.05,key,v:pick(key,R()),ry:R()*6.283,s:.75+R()*.5})}
  /* Wüste/Canyon: Kakteen als Deko, in Gruppen, nicht auf Vorkommen und nicht nahe der Startplätze */
  if(R3.dry&&EKMODELS.nodeN('cactus')){const grid=new Map(),gk=(x,y)=>((x/60)|0)*1000+((y/60)|0),hq=G.ents.filter(e=>e.type==='hq');
    for(const e of G.ents)if(e.kind==='node'&&!e.sea){const k=gk(e.x,e.y);(grid.get(k)||grid.set(k,[]).get(k)).push(e)}
    const near=(x,y)=>{for(let gx=-1;gx<=1;gx++)for(let gy=-1;gy<=1;gy++){const l=grid.get(gk(x+gx*60,y+gy*60));if(l)for(const e of l)if(Math.hypot(e.x-x,e.y-y)<e.r+16)return true}return false};
    const want=Math.round(420*AREA);let n=0;
    for(let i=0;i<want*8&&n<want;i++){const x=40+R()*(W-80),y=40+R()*(H-80);if(terrAt(x,y)!==2||terrAt(x+14,y)!==2||terrAt(x-14,y)!==2||terrAt(x,y+14)!==2||terrAt(x,y-14)!==2)continue;
      if(R()>cl(x,y)*.7||slopeNear(x,y,12)>.5||hq.some(h=>Math.hypot(h.x-x,h.y-y)<230)||near(x,y))continue;
      L.push({x,y,h:hAt(x,y)-.04,key:'cactus',v:pick('cactus',R()),ry:R()*6.283,s:.7+R()*.7,fx:1});n++}}
  R3.deco=L}
/* Grasfarben je Jahreszeit (vier Halmfarben) */
const GRASSC={summer:[0x5f8a3a,0x6f9a44,0x4f7a32,0x7aa24b],spring:[0x7ab04a,0x8cc255,0x66a03c,0x9ad060],autumn:[0xa28a38,0xb89a44,0x8a6c2c,0xc8a850],winter:[0xaebfd0,0xc8d6e4,0x93a8bc,0xdbe6f0],dry:[0xb49a58,0xc8ae68,0xa08648,0xd2bc78]};
/* Grasbüschel und Blumen: viele winzige Instanzen auf dem Land, damit der Boden aus der Nähe lebendig wirkt */
function r3Grass(){
  const{scene}=r3;for(const k of['i_tuft','i_flower'])if(r3[k]){scene.remove(r3[k]);r3[k].dispose();r3[k]=null}
  const R=mulberry(4242),S=R3.S,pts=[],fl=[],GP=mapPal(curMap,R3.se||'summer'),gk=(({spring:1.1,autumn:.9,winter:.32})[R3.se]||1)*(R3.dry?.32:1),gcol=GRASSC[R3.dry?'dry':R3.se]||GRASSC.summer;
  for(let i=0;i<Math.round(52000*AREA*GQ[gfxQ].grass*gk)&&pts.length<Math.round(15000*AREA*GQ[gfxQ].grass*gk);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)!==2)continue;let ok=true;for(let k=0;k<4;k++)if(terrAt(x+Math.cos(k*1.57)*14,y+Math.sin(k*1.57)*14)!==2){ok=false;break}if(!ok)continue;
    const dens=.5+.5*Math.sin(x*.013+Math.cos(y*.011)*2);if(R()>dens*1.1)continue;pts.push({x,y,r:R()*6.28,s:.6+R()*.8,c:.8+R()*.5,j:R()})}
  for(let i=0;i<Math.round(9000*AREA*Math.min(1.5,GQ[gfxQ].grass)*GP.flowerN)&&fl.length<Math.round(1800*AREA*Math.min(1.5,GQ[gfxQ].grass)*GP.flowerN);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)!==2)continue;const cx=Math.cos(x*.02)*Math.sin(y*.017);if(cx<.35)continue;fl.push({x,y,r:R()*6.28,s:.7+R()*.6,k:(R()*5)|0})}
  const blade=(r,h,ax,az,col)=>{const g=new THREE.ConeGeometry(r,h,3,1,true);/* ohne Boden: spart ein Drittel der Dreiecke */g.translate(0,h/2,0);g.rotateZ(az);g.rotateX(ax);return[g,col]};
  const tg=mergeColored([blade(.05,.5,.18,.2,gcol[0]),blade(.05,.62,-.15,-.1,gcol[1]),blade(.045,.42,.1,-.3,gcol[2]),blade(.045,.55,-.2,.25,gcol[3])]);
  r3.i_tuft=new THREE.InstancedMesh(tg,windify(new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}),.55),pts.length);
  const fg=mergeColored([[tr3(cyl(.012,.012,.38,4),0,.19,0),0x4f7a32],[tr3(new THREE.IcosahedronGeometry(.085,0),0,.4,0),0xffffff]]);
  r3.i_flower=new THREE.InstancedMesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),fl.length);
  for(const m of[r3.i_tuft,r3.i_flower]){m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;m.count=0;scene.add(m)}
  /* Nur die Büschel im sichtbaren Ausschnitt kommen in die Instanzen (r3GrassView); dafür Punkte in 200-px-Zellen einsortieren */
  const pal=GP.flowers.map(c=>parseInt(c.slice(1),16)),GC=200,gw=Math.ceil(W/GC),cells=(L)=>{const c=Array.from({length:gw*Math.ceil(H/GC)},()=>[]);L.forEach(p=>c[((p.y/GC)|0)*gw+((p.x/GC)|0)].push(p));return c};
  for(const p of pts){p.h=hAt(p.x,p.y);p.hid=0}for(const p of fl){p.h=hAt(p.x,p.y);p.col=new THREE.Color(pal[p.k%pal.length]);p.hid=0}
  r3.grassPts=pts;r3.flowerPts=fl;r3.gCells={GC,gw,t:cells(pts),f:cells(fl)};r3.gKey='';r3.blk=new Uint8Array(FW*FH);
}
/* Gras im sichtbaren Ausschnitt in die Instanzen schreiben (nur wenn sich der Ausschnitt merklich ändert oder der Nebel neu schattiert wurde) */
function r3GrassView(force){
  const v=R3.view,gc=r3.gCells;if(!r3.i_tuft||!v||!gc)return;const gq=EGO.on?1:Math.max(0,Math.min(1,(cam.z-.3)/.25)),gd=.25+.75*gq*gq/* weit weg: weniger Büschel, dafür grösser (spart Dreiecke, Gras ist dort ohnehin nur Farbfleck); stetig statt Stufen, jedes Büschel wächst über ein Band weich ein/aus */,key=Math.round(gd*20)+':'+[v.x0,v.x1,v.y0,v.y1].map(a=>Math.round(a/80)).join()+(R3.cull?':'+Math.round(R3.cx/80)+','+Math.round(R3.cy/80)+','+Math.round(R3.cull/80):'');if(!force&&key===r3.gKey)return;r3.gKey=key;
  const S=R3.S,o=_gO||(_gO=new THREE.Object3D()),c=_gC||(_gC=new THREE.Color()),cx0=Math.max(0,(v.x0/gc.GC)|0),cx1=Math.min(gc.gw-1,(v.x1/gc.GC)|0),cy0=Math.max(0,(v.y0/gc.GC)|0),cy1=Math.min(((H-1)/gc.GC)|0,(v.y1/gc.GC)|0);
  const sk=gd<1?Math.min(1.7,1+.28*(1/gd-1)):1,sm3=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t)},cl=R3.cull,fill=(m,cells,col)=>{let k=0;for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){if(R3.cull){const ddx=(cx+.5)*gc.GC-R3.cx,ddy=(cy+.5)*gc.GC-R3.cy;if(ddx*ddx+ddy*ddy>(R3.cull+gc.GC)*(R3.cull+gc.GC))continue}const ls=cells[cy*gc.gw+cx];for(let q=0;q<ls.length;q++){const p=ls[q];if(p.hid)continue;let a=gd<1?sm3((gd*1.22-(p.j!==undefined?p.j:(p.r*.159155)%1))/.22):1;if(cl){const f=Math.hypot(p.x-R3.cx,p.y-R3.cy)/cl;if(f>.88)a*=sm3((1-f)/.12)}if(a<.03)continue;o.position.set(p.x/S,p.h,p.y/S);o.rotation.set(0,p.r,0);o.scale.setScalar(p.s*sk*a);o.updateMatrix();m.setMatrixAt(k,o.matrix);m.setColorAt(k,col(p));k++}}
    m.count=k;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true};
  fill(r3.i_tuft,gc.t,p=>{const sh=fogShade(p.x,p.y)*p.c;return c.setRGB(sh,sh*(.96+p.j*.08),sh*.95)});fill(r3.i_flower,gc.f,p=>p.col)}
let _gO=null,_gC=null;
/* Büschel unter Gebäuden und im Nebel ausblenden bzw. abdunkeln (alle 0,4 s) */
function r3GrassShade(){
  if(!r3.i_tuft)return;const blk=r3.blk;blk.fill(0);
  for(const e of G.ents)if(!e.dead&&e.kind==='bld'){const rr=e.r+10,x0=Math.max(0,(e.x-rr)/FC|0),x1=Math.min(FW-1,(e.x+rr)/FC|0),y0=Math.max(0,(e.y-rr)/FC|0),y1=Math.min(FH-1,(e.y+rr)/FC|0);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)blk[y*FW+x]=1}
  const v=R3.view,inV=p=>!v||(p.x>v.x0-200&&p.x<v.x1+200&&p.y>v.y0-200&&p.y<v.y1+200);
  for(const p of r3.grassPts)if(inV(p))p.hid=blk[fogIdx(p.x,p.y)];
  for(const p of r3.flowerPts)if(inV(p))p.hid=blk[fogIdx(p.x,p.y)];
  r3GrassView(true)}
let _o=null,_c=null;
function fogShade(x,y){const i=fogIdx(x,y),a=(1-visF[i])*(165-95*exF[i])/255;return 1-a*.82}
/* Baum-Art (einmal je Baum bestimmt): Nadelbaum, Laubbaum, Birken in Hainen, Weiden am Wasser, Herbstfarben als Flecken in der Landschaft */
/* Jahreszeit: welcher Satz (Herbstlaub, Schnee, Blüten, dürre Bäume) und welche Tönung (r,g,b) für einen Baum; h = fester Zufall je Baum */
function treeSea(k,sd){const se=R3.se,h=(sd*131.7)%1;
  if(se==='autumn'){if(k==='pine')return[k,.86,.92,.8];return h<.12?[k,1.05,.95,.8]:[k+'A',1,1,1]}
  if(se==='winter'){if(k==='pine')return[k,1.5,1.7,1.9];return[k+'W',1,1,1]}
  if(se==='spring'){if(k==='broad'&&h<.3)return[h<.16?'bloom':'bloomW',1,1,1];if(k==='birch'&&h<.2)return['bloom',1,1,1];if(k==='pine')return[k,1.1,1.16,1];return[k,1.12,1.22,.92]}
  if(R3.dry){if(k==='pine')return[k,1.2,1.05,.75];return[k==='willow'?'willow':'broadD',1,1,1]}
  return[k,1,1,1]}
function treeKind(e){let c=R3.tk.get(e.id);if(c)return c;const sd=e.seed,x=e.x,y=e.y,h1=(sd*7919.3)%1,h2=(sd*104.729)%1;
  if(sd<.5)c={k:'pine',v:(h1*997)|0};
  else{let wet=false;for(let k=0;k<8&&!wet;k++){const a=k*.785;for(const d of[36,66])if(terrAt(x+Math.cos(a)*d,y+Math.sin(a)*d)<2){wet=true;break}}
    const au=Math.sin(x*.0023+.7)*Math.sin(y*.0019+1.9)+.35*Math.sin((x-y)*.006),bi=Math.sin(x*.0041+2.1)*Math.cos(y*.0037+.4);
    c={k:wet&&h1<.8?'willow':/* Herbstbäume erst mit Jahreszeiten (Merkliste) */h1<.12+.5*smooth3(-.2,.7,bi)?'birch':'broad',v:((h1+h2)*997)|0}}
  R3.tk.set(e.id,c);return c}
const hsh=(a,b)=>{const t=Math.sin(a*12.9898+b*78.233)*43758.5453;return t-Math.floor(t)};
function r3Nodes(){
  if(!_o){_o=new THREE.Object3D();_c=new THREE.Color()}
  if(R3.natG!==G){R3.natG=G;R3.tk=new Map();R3.tl=new Map();R3.stumps=[];R3.ap={};R3.hidT={}} /* neue Partie: Baum-Arten und Stümpfe vergessen */
  const S=R3.S,B={},V=R3.view,M=260,fr=R3.fr=(R3.fr||0)+1,tl=R3.tl;R3.nodeZ=cam.z;
  /* Baumdichte: stetig nach Zoom (weit weg weniger Bäume) und Entfernung (flacher Blick), kein Springen: jeder Baum hat einen festen Rang (Weyl-Folge aus der Kennung), ist ab Dichte>Rang da und wächst über ein Band weich ein/aus */
  const sm3=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t)},zdn=(()=>{const q=EGO.on?1:Math.max(0,Math.min(1,(cam.z-.3)/.2));return .3+.7*q*q})(),trk=id=>(Math.imul(id|0,2654435761)>>>0)/4294967296,flw=Math.min(1,(R3.fl||0)*3);
  /* Neu freigeschaltete Vorkommen (Zeitalter-Aufstieg) wachsen in ~1,8 s sanft aus dem Boden: ap[Typ] = Spielzeit der Freischaltung, hidT[Typ] = war wegen des Zeitalters versteckt */
  const ap=R3.ap,hidT=R3.hidT;let apBusy=false;
  const grow=ty=>{const t0=ap[ty];if(t0===undefined)return 1;const k=Math.min(1,(G.t-t0)/1.8);if(k<1)apBusy=true;const g=k*k*(3-2*k);return Math.max(.03,g)};
  /* Instanz vormerken: Schlüssel ohne eigene Modelle → Ersatz (alt) */
  const add=(key,v,x,y,z,ry,sx,sy,r,g,b)=>{let d;while((!r3.ns[key]||!r3.ns[key].L.length)&&(d=NSET[key])&&d.alt)key=d.alt;const s=r3.ns[key];if(!s||!s.L.length)return;const bb=B[key]||(B[key]=[]),i=v%s.L.length;(bb[i]||(bb[i]=[])).push(x,y,z,ry,sx,sy,r,g,b);return{key,v:i,i:bb[i].length/9-1,p:[x,y,z,ry,sx,sy]}};
  const inV0=(x,y,m)=>!V||(x>=V.x0-m&&x<=V.x1+m&&y>=V.y0-m&&y<=V.y1+m);
  /* genauer: Fusspunkt auf dem Bildschirm (Rand links/rechts 170 px, oben 120 px, unten 300 px für hohe Bäume, deren Krone ins Bild ragt) */
  const sv=r3.vec,pm=new THREE.Matrix4().multiplyMatrices(r3.camera.projectionMatrix,r3.camera.matrixWorldInverse),sv2=new THREE.Vector3(),mx=1+340/Math.max(1,VW),myT=1+240/Math.max(1,VH),myB=1+240/Math.max(1,VH);
  const cl=R3.cull,cl2=cl*cl,onS=(x,y)=>{if(cl){const dx=x-R3.cx,dy=y-R3.cy;if(dx*dx+dy*dy>cl2)return false}const hh=hAt(x,y);sv.set(x/S,hh,y/S).applyMatrix4(pm);if(!(sv.z<1&&sv.x>-mx&&sv.x<mx&&sv.y<myT))return false;sv2.set(x/S,hh+9.2,y/S).applyMatrix4(pm);return sv2.y>-myB}; /* Fusspunkt nicht über dem oberen Rand, Kopfpunkt (hohe Krone) nicht unter dem unteren */
  const inV=(x,y,m)=>inV0(x,y,m)&&onS(x,y);
  R3.nodeV=V&&{x:(V.x0+V.x1)/2,y:(V.y0+V.y1)/2,w:V.x1-V.x0}; /* nur Vorkommen im Bild (+Rand) zeichnen */
  const fields=new Map(),farms=[];
  for(const e of G.ents){
    if(e.kind==='bld'){if(e.type==='farm'&&e.built&&!e.dead&&inV(e.x,e.y,M)&&(e.team!==1||shown(e)))farms.push(e);continue}
    if(e.dead||e.kind!=='node'||e.sea)continue;
    if(e.type==='tree'){const t=tl.get(e.id);if(t)t.f=fr;else tl.set(e.id,{x:e.x,y:e.y,r:e.r,sd:e.seed,f:fr})}
    if(e.type==='field'){fields.set(e.farm,e.amount/e.maxAmt);continue}
    if(!inV(e.x,e.y,M))continue;
    let tf=1,tbst=1,dd=0;if(cl){dd=Math.hypot(e.x-R3.cx,e.y-R3.cy)/cl;if(dd>.88)tf=sm3((1-dd)/.12)} /* Rand der Sichtweite: schrumpfen statt abschneiden */
    if(e.type==='tree'){let dn=zdn;if(cl)dn=Math.min(dn,1-.8*flw*sm3((dd-.1)/.4));tf*=sm3((dn*1.22-trk(e.id))/.22);if(dn<1)tbst=Math.min(1.6,1+.28*(1/dn-1))} /* weit weg: weniger Bäume, die übrigen etwas grösser (Wald bleibt dicht, weniger Dreiecke) */
    if(tf<.02)continue;
    const k=Math.max(.5,Math.sqrt(e.amount/e.maxAmt)),sh=fogShade(e.x,e.y),h=hAt(e.x,e.y),x=e.x/S,z=e.y/S,sd=e.seed;
    if(e.type==='tree'){const s=e.r/11*.62*(.85+sd*.35)*(.55+.45*k)*tbst*tf,tk=treeKind(e),v=.9+((sd*97)%1)*.2;{const ts=treeSea(tk.k,sd),ix=add(ts[0],tk.v,x,h-.05,z,sd*6.28,s,s*(.9+((sd*31)%1)*.3),v*sh*ts[1],(.95+((sd*53)%1)*.12)*v*sh*ts[2],v*sh*ts[3]);if(ix&&SHK.size){const sk=SHK.get(e.id);if(sk)sk.ix=ix}}}
    else if(e.type==='bush'){const s=e.r/10*(.55+.45*k)*tf;add(e.amount<e.maxAmt*.25?'bushE':'bush',(sd*97)|0,x,h-.03,z,sd*6.28,s,s,sh,sh,sh)} /* fast leer gepflückt: Busch ohne Beeren */
    else{if(HIDDEN_NODES.has(e.type)){if(!nodeKnown(e)){if(!nodeEpochOk(e,0))hidT[e.type]=1;continue}if(hidT[e.type]&&ap[e.type]===undefined)ap[e.type]=G.t}if(!NSET[e.type])continue;const gk=grow(e.type),kv=Math.floor(sd*3)%3,base=e.r/10*(.6+.4*k)*.78*gk*tf;
      const nn=e.type==='oil'?1:5;for(let j=0;j<nn;j++){const a=sd*20+j*1.9,dd=j?e.r/S*.62:0,sz=base*(j?.55+((j*37+sd*50)%7)/14:1.05),xx=x+Math.cos(a)*dd,zz=z+Math.sin(a)*dd,cc=sh*(.92+(j%3)*.05);add(e.type,kv,xx,hAt(xx*S,zz*S)-.1,zz,a,sz,sz*(j?1:1.15),cc,cc,sh*(.95+(j%2)*.05))}}}
  /* Baumstümpfe: wo ein Baum gefällt wurde (verschwindet aus der Liste), bleibt ein Stumpf stehen – nur Deko, unter Gebäuden ausgeblendet */
  for(const[id,t]of tl)if(t.f!==fr){tl.delete(id);R3.stumps.push({x:t.x,y:t.y,s:t.r/11*(1+t.sd*.35),ry:t.sd*40,v:id});if(R3.stumps.length>1500)R3.stumps.shift()}
  const fadeAt=(x,y)=>{if(!cl)return 1;const q=Math.hypot(x-R3.cx,y-R3.cy)/cl;return q>.88?sm3((1-q)/.12):1};
  for(const t of R3.stumps){if(!inV(t.x,t.y,M)||(r3.blk&&r3.blk[fogIdx(t.x,t.y)]))continue;const f=fadeAt(t.x,t.y);if(f<.02)continue;const sh=fogShade(t.x,t.y);add('stump',t.v,t.x/S,hAt(t.x,t.y)-.03,t.y/S,t.ry,t.s*f,t.s*f,sh,sh,sh)}
  /* Getreide auf den Feldern: Reihen aus manifest.nodes.wheat (rows = [z, x von, x bis] im Feld-Modell, Breite 1), Höhe wächst mit der Nahrung im Feld */
  const wm=farms.length&&EKMODELS.nodeMeta('wheat');
  if(wm&&wm.rows)for(const e of farms){if(wm.for&&!EKMODELS.tag(e).includes(wm.for))continue;const W=e.r/S*1.05*2.5*(wm.fit||1),gr=fields.has(e.id)?fields.get(e.id):1,gy=.3+.7*gr,sh=fogShade(e.x,e.y),y0=hAt(e.x,e.y)+(wm.y||0)*W,st=(wm.step||.08)*(gfxQ?1:1.6);let i=0;
    for(const[rz,a,b]of wm.rows)for(let nx=a;nx<=b+1e-6;nx+=st){i++;const j1=hsh(i,e.id),j2=hsh(e.id,i),sc=.85+.3*j1;add('wheat',i,e.x/S+(nx+(j2-.5)*st*.5)*W,y0,e.y/S+(rz+(j1-.5)*.03)*W,j2*6.283,sc*1.6,sc*gy,sh*(.95+.1*j2),sh,sh)}}
  /* Berg-Deko (r3Deco), nicht bei Grafik „Niedrig“/Sparmodus */
  if(gfxQ>0)for(const d of R3.deco||[]){if(!inV(d.x,d.y,140)||(d.fx&&r3.blk&&r3.blk[fogIdx(d.x,d.y)]))continue;const f=fadeAt(d.x,d.y);if(f<.02)continue;const sh=fogShade(d.x,d.y);add(d.key,d.v,d.x/S,d.h,d.y/S,d.ry,d.s*f,d.s*f,sh,sh,sh)}
  /* in die Instanz-Puffer schreiben (nur den benutzten Teil hochladen); reicht ein Puffer nicht, wird der Satz grösser neu gebaut */
  for(const key in r3.ns){let s=r3.ns[key];const bb=B[key]||[];let need=0;for(const a of bb)if(a&&a.length/9>need)need=a.length/9;if(need>s.cap)s=nsBuild(key,Math.ceil(need*1.4)+16);
    s.L.forEach((m,v)=>{const a=bb[v],n=a?a.length/9:0;for(let i=0;i<n;i++){const j=i*9;_o.position.set(a[j],a[j+1],a[j+2]);_o.rotation.set(0,a[j+3],0);_o.scale.set(a[j+4],a[j+5],a[j+4]);_o.updateMatrix();m.setMatrixAt(i,_o.matrix);_c.setRGB(a[j+6],a[j+7],a[j+8]);m.setColorAt(i,_c)}
      for(const p of m.isMulti?m.parts:[m]){p.count=n;p.visible=n>0;if(!n)continue;const im=p.instanceMatrix,ic=p.instanceColor;im.clearUpdateRanges();im.addUpdateRange(0,n*16);im.needsUpdate=true;if(ic){ic.clearUpdateRanges();ic.addUpdateRange(0,n*3);ic.needsUpdate=true}}})}  R3.apBusy=apBusy;
}

/* ---------- Meeresbewohner ---------- */
function seaModel(e){const g=new THREE.Group(),dark=m3Plain(e.type==='whale'?0x3b5273:0x7f9fb8,.45),belly=m3Plain(e.type==='whale'?0xcdd9e3:0xdce8ef,.5);
  if(e.type==='fish'){const sk=[0xf4fbff,0xffe48a,0xbfe8ff];for(let i=0;i<6;i++){const f=new THREE.Group(),b=put(f,new THREE.SphereGeometry(.4,10,8),new THREE.MeshStandardMaterial({color:sk[i%3],roughness:.3,metalness:.2,emissive:sk[i%3],emissiveIntensity:.25}),0,0,0);b.scale.set(1.7,.6,.42);put(f,cone(.2,.46,4),m3Plain(0xdfeef5),-.78,0,0).rotation.z=Math.PI/2;put(f,cone(.1,.28,3),m3Plain(0xdfeef5),0,.26,0);f.position.set(Math.cos(i*1.7)*e.r/R3.S*.9,-.2,Math.sin(i*2.3)*e.r/R3.S*.9);f.userData.ph=i;g.add(f)}
    const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1,28).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false,fog:false}));ring.userData.ring=true;g.add(ring)}
  else{const whale=e.type==='whale',n=whale?1:2,L=whale?5.4:2.2,Rr=whale?.95:.34,topC=whale?0x56709a:0x86a8c4,botC=whale?0xdde6ee:0xe8f1f6;
    for(let i=0;i<n;i++){const f=new THREE.Group(),bg=swimBody(L,Rr,topC,botC);f.add(new THREE.Mesh(bg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.05})));
      const k=L/2.2,tailX=-L/2;
      const fl=put(f,new THREE.SphereGeometry(1,10,6),dark,tailX-.12*k,.02*k,0);fl.scale.set(.22*k,.035*k,.62*k*(whale?1.1:.7));fl.rotation.z=.1;
      const dors=put(f,cone(.2*k,.5*k,4),dark,-.12*k*(whale?.6:1),Rr*.9,0);dors.rotation.z=-.5;dors.scale.z=.3;
      for(const z of[-1,1]){const fn=put(f,new THREE.SphereGeometry(1,8,6),dark,L*.2,-Rr*.55,z*Rr*.9);fn.scale.set(.3*k,.03*k,.12*k);fn.rotation.y=z*.5;fn.rotation.x=z*.3}
      if(!whale)put(f,new THREE.CylinderGeometry(.04,.075,.32,6),dark,L/2+.1,-.04,0).rotation.z=-Math.PI/2;
      for(const z of[-1,1])put(f,new THREE.SphereGeometry(.05*k,6,6),m3Plain(0x0d1115),L*.36,Rr*.35,z*Rr*.6,false);
      f.position.set(0,-.12,(i-.5)*(n-1)*1.4);f.userData.ph=i;g.add(f)}}
  return setShadows(g)}

/* ---------- Entitäten abgleichen ---------- */
function entKey(e,ghost){return(ghost?'g':e.kind[0])+e.id}
function r3Sync(list,dt,t){
  const S=R3.S,seen=new Set();
  for(const[e,ghost]of list){
    const key=entKey(e,ghost);seen.add(key);
    let sig;const ep=e.kind==='bld'?(e.lvl??G.epoch[e.team]):0;sig=e.kind==='unit'?e.type+e.team+':'+(e.lvl||0)+(e.type==='worker'?':'+wkTier(e)+(G.tech[e.team].has('baskets')?'b':'')+(G.tech[e.team].has('carts')?'c':'')+(G.tech[e.team].has('shoes')?'s':''):''):e.kind==='bld'?e.type+':'+ep+':'+e.team+(e.spec||'')+(e.pc||''):e.kind==='animal'?e.type:e.type;
    sig+=EKMODELS.tag(e)+(e.empty?'x':'')+(e.ore||'');
    let o=R3.reg.get(key);
    if(!o||o.sig!==sig){if(o){r3.gEnt.remove(o.obj);r3Drop(o.obj)}o=r3Make(e,sig);if(R3.lodOn&&(e.kind==='unit'||e.kind==='animal'))r3UnitSh(o.obj,true);if(R3.figLod&&(e.kind==='unit'||e.kind==='animal'))r3UnitLod(o.obj,true);R3.reg.set(key,o);r3.gEnt.add(o.obj)}
    const h=hAt(e.x,e.y),obj=o.obj;if(o.off){o.off=0;obj.visible=true}
    if(e.kind==='unit')r3Unit(o,e,h,dt,t);
    else if(e.kind==='bld'){obj.position.set(e.x/S,h,e.y/S);const pr=e.built?1:.12+.88*e.prog;obj.scale.set(1,pr,1);if(obj.userData.props)for(const q of obj.userData.props)q.visible=pr>=1 /* Beiwerk (Figuren, Ballon) erst nach dem Bau */;
      if(e.type==='harbor'||e.type==='wall'||e.type==='gate')obj.rotation.y=-(e.ang||0);for(const f of o.flags)f.rotation.y=Math.sin(t*3+f.position.x)*.3;
      if(obj.userData.mix&&e.built&&!(G.paused||G.netPause))for(const mx of obj.userData.mix)mx.update(dt*(G.speed||1))/* Figuren am Gebäude (König, Bürger) atmen */}
    else if(e.kind==='node'){if(e.sea){const iv=!((R3.ice||0)>.5&&terrAt(e.x,e.y)===1)/* Eis auf flachem Wasser: Fische darunter nicht zeigen */;if(obj.visible!==iv)obj.visible=iv}const far=cam.z<.5,lim=cam.z<.4?1:cam.z<.5?2:99/* weit weg: nur 1–2 Fische je Schwarm zeichnen, Animation halb so oft (spart hunderte Zeichenaufrufe) */;if(obj.userData.mix&&(!far||(R3.fn+e.id)%2===0))for(const mx of obj.userData.mix)mx.update(far?dt*2:dt);if(obj.userData.school){let si=0;for(const it of obj.userData.school){const tg=si++<lim?1:0;it.s=it.s===undefined?tg:it.s+(tg-it.s)*Math.min(1,dt*6)/* Fische schrumpfen/wachsen weich statt zu springen */;const sv=Math.abs(it.s-tg)<.02?tg:it.s,vis=sv>0;if(it.w.visible!==vis)it.w.visible=vis;if(!vis)continue;if(it.w.scale.x!==sv)it.w.scale.setScalar(sv);it.a+=it.sp*dt;it.w.position.x=Math.cos(it.a)*it.r;it.w.position.z=Math.sin(it.a)*it.r;it.w.rotation.y=-(it.a+1.5708)}}obj.position.set(e.x/S,-.26+Math.sin(t*.8+e.seed*20)*.03,e.y/S);obj.rotation.y=e.seed*6.28+Math.sin(t*.5+e.seed*9)*.15;
      obj.children.forEach(f=>{if(f.userData.ring){const k=(t*.45+e.seed*3)%1;f.scale.setScalar(1.2+k*2.8);f.material.opacity=(1-k)*.55;f.position.y=.05;return}const p=f.userData.ph||0;f.position.y=-.1+Math.sin(t*2+p*2+e.seed*9)*.06;if(e.type==='fish')f.rotation.y=Math.sin(t*1.5+p)*.4})}
    else if(e.kind==='animal')r3Animal(o,e,h,dt,t);
    o.seen=true;o.e=e}
  if(R3.corpG!==G){for(const c of R3.corpses||[])r3.gEnt.remove(c.obj);R3.corpses=[];R3.corpG=G}
  for(const[k,o]of R3.reg)if(!seen.has(k)){
    if(o.e&&o.e.dead&&o.rig&&!o.rig.ship&&(o.e.kind==='animal'||o.rig.up||(o.rig.acts&&o.rig.acts.die))&&R3.corpses.length<40){R3.corpses.push({obj:o.obj,rig:o.rig,t:0,animal:o.e.kind==='animal',big:o.e.kind==='animal'&&(ANIMALS[o.e.type].r>10)})}
    else if(o.e&&!o.e.dead&&(o.off||0)<20&&R3.reg.size<1500){if(!o.off)o.obj.visible=false;o.off=(o.off||0)+Math.max(dt,.001);continue} /* nur aus dem Bild: versteckt aufheben statt löschen (Neubau beim Zurückschwenken ruckelt) */
    else{r3.gEnt.remove(o.obj);r3Drop(o.obj)}R3.reg.delete(k)}
  for(let i=R3.corpses.length-1;i>=0;i--){const c=R3.corpses[i];c.t+=dt;const f=Math.min(1,c.t/.4);
    const dA=c.rig.acts&&c.rig.acts.die;if(dA){if(!c.dp){c.dp=1;c.rig.mixer.stopAllAction();dA.reset();dA.setLoop(THREE.LoopOnce,1);dA.clampWhenFinished=true;dA.play()}c.rig.mixer.update(dt)} /* echte Sterbe-Bewegung (UAL) */
    else if(c.animal)c.rig.g.rotation.x=f*1.45;else{c.rig.g.rotation.z=-f*1.5;if(c.rig.up){c.rig.up.rotation.z=0;for(const l of c.rig.legs)l.rotation.z=0;for(const a of c.rig.arms)a.rotation.z=1.6*f}}
    c.obj.position.y=c.t>2.4?-(c.t-2.4)*.9:c.obj.position.y;
    if(c.t>3.2){r3.gEnt.remove(c.obj);r3Drop(c.obj);R3.corpses.splice(i,1)}}
  r3Bones()
}
/* Kontaktschatten: weicher dunkler Fleck unter Gebäuden – die Bauten sitzen dadurch „im“ Boden statt darauf zu schweben */
let _aoTex=null,_aoMat=null;
function aoDecal(radius,op){
  if(!_aoTex){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,6,64,64,64);g.addColorStop(0,'rgba(0,0,0,.85)');g.addColorStop(.55,'rgba(0,0,0,.4)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
    _aoTex=new THREE.CanvasTexture(c);_aoMat=new THREE.MeshBasicMaterial({map:_aoTex,transparent:true,depthWrite:false,opacity:.6,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})}
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),_aoMat);m.scale.set(radius*2,1,radius*2);m.position.y=.07;m.renderOrder=1;m.castShadow=false;m.receiveShadow=false;m.userData.noShadow=true;return m}
function r3Make(e,sig){
  const S=R3.S;
  if(e.kind==='unit'){const rig=buildUnit(e);let sc=(UNITS[e.type].vr||e.r)/7*1.25*(UNITS[e.type].naval?.46:e.type==='tank'||e.type==='mark1'?.72:UNITS[e.type].siege?.7:UNITS[e.type].cls==='cav'?.74:e.type==='worker'?.8:1);if(rig.human)sc=UNITS.worker.vr/7*1.25*.8/* alle Menschen so groß wie der Arbeiter */;rig.g.scale.setScalar(sc*(.94+((e.id*37)%13)/13*.12));const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  if(e.kind==='bld'){M3.curId=e.id;const g=buildBld(e.type,e.r/S*1.05,e.lvl??G.epoch[e.team]/* Aussehen erst nach dem Upgrade */,e.team,e.spec);if(e.empty)g.traverse(o=>{if(o.isMesh){const f=m=>{const c=m.clone();if(c.color)c.color.multiplyScalar(.45);return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}}) /* erschöpfte Mine: dunkel/grau */;if(e.ore&&e.ore!=='stone'&&!e.empty){const tc=new THREE.Color(e.ore==='gold'?0xffd166:0xd08a6a);g.traverse(o=>{if(o.isMesh){const f=m=>{if(!/stone|rock/i.test(m.name||''))return m;const c=m.clone();if(c.color)c.color.lerp(tc,.45);return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}})} /* Eisen-/Goldmine: rötlich bzw. golden getönt */;if(e.type!=='wall'&&e.type!=='gate'&&e.type!=='trench'&&e.type!=='farm')g.add(aoDecal(e.r/S*1.55));if(e.pc&&typeof wallPostModel==='function')wallPostModel(g,e.pc,e.r/S*1.05,G.epoch[e.team],e.team);if(e.spec&&!g.userData.spec&&typeof specModel==='function')specModel(g,e.type,e.spec,e.r/S*1.05,e.team,G.epoch[e.team]);return{obj:g,sig,flags:g.userData.flags||[]}}
  if(e.kind==='animal'){const rig=buildAnimal(e);const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  const g=EKMODELS.makeSea(e)||seaModel(e);g.traverse(o=>{if(o.isMesh)o.castShadow=false})/* Fische unter Wasser: Schatten nicht sichtbar, spart Zeichenaufrufe in der Schattenkarte */;return{obj:g,sig,flags:[]}}
/* Gliederbewegung der Menschen: Gehen (Gegenschwung, Neigen, Wippen), Atmen im Stand, Arbeiten je Werkzeug, Kampf mit Ausholen/Schlag/Rückstoß, Zucken bei Treffern */
function r3Human(o,e,rig,d,s,sw,work,build,moving,dt,t){
  const up=rig.up,L=rig.legs,K=rig.knees,A=rig.arms,E=rig.elbows,id=e.id,since=G.t-(e.swing||-9),k=Math.max(0,Math.min(1,since/.5)),fresh=since<.5;
  const heavy=d.siege||e.type==='musket'||e.type==='rifle',carry=e.carry>0&&(e.state==='return'||e.state==='gather');
  if(o.hp===undefined)o.hp=e.hp;if(e.hp<o.hp-.5)o.fl=.28;o.hp=e.hp;o.fl=Math.max(0,(o.fl||0)-dt);const fl=o.fl/.28;
  const run=moving?Math.min(1.25,.75+d.spd/110):0,sa=Math.sin(o.ph)*.85*run,cb=Math.cos(o.ph);
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=x=>x*x*(3-2*x),lerp=(a,b,x)=>a+(b-a)*x;
  /* Beine mit Kniebeuge: das Schwungbein beugt das Knie */
  L[0].rotation.z=-sa;L[1].rotation.z=sa;K[0].rotation.z=moving?Math.max(0,-Math.sin(o.ph+.9))*1.0*run:0;K[1].rotation.z=moving?Math.max(0,Math.sin(o.ph+.9))*1.0*run:0;
  let lean=moving?-.07-.07*run-(carry?.1:0):0,twist=moving?Math.sin(o.ph)*.14*run:0,bob=moving?Math.abs(cb)*.06*run:Math.sin(t*1.8+id)*.012;
  let a0=moving?-sa*.7:Math.sin(t*1.3+id)*.04,a1=.12+(moving?sa*.7:Math.sin(t*1.3+id+1.4)*.04),e0=.18+(moving?.25:0),e1=.18+(moving?.25:0);
  if(rig.bow){a0=1.5;e0=.05}
  const atk=e.state==='attack';
  if(atk&&!moving){
    if(rig.bow){const pull=e.cd<.45?1-e.cd/.45:0;a1=1.5;e1=.2+pull*1.9;a0=1.5;lean=-.05+(pull?.1*pull:0)+(fresh?.12*(1-k):0);twist=-.25}
    else if(d.ranged){a1=1.25+(fresh?-.5*(1-k):0);a0=.5;e1=.2;e0=.9;lean=fresh?.16*(1-k):-.05;twist=.2}
    else{const wind=e.cd<.4?1-e.cd/.4:0;
      /* Nahkampf: Waffe wird über die Schulter gehoben (Ausholen), dann schnell nach vorn-unten geführt */
      if(fresh){a1=lerp(.2,2.3,1-ease(k));e1=lerp(.2,1.0,1-k);lean=-.3*(1-k);twist=.3*(1-k)}else{a1=lerp(.2,2.3,ease(wind));e1=lerp(.2,1.2,wind);lean=.14*wind;twist=-.3*wind}
      if(!heavy)a0=fresh?-.4*(1-k):-.2*wind}}
  else if((work||build)&&!moving){
    const kind=build?'build':e.rtype,ph=cl(1-((build?e.bt:e.gt)||0)/(build?.6:.85),0,1);
    if(kind==='wood'||kind==='stone'||kind==='iron'||kind==='gold'){
      /* Zweihändiger Hieb: ausholen (Arm hoch über den Kopf), schnell herabsausen (Aufprall bei ph=1 = Geräusch), kurz verharren */
      const hi=kind==='wood'?2.55:2.7,low=kind==='wood'?.55:.3;let a;
      if(ph<.62)a=lerp(low+.4,hi,ease(ph/.62));else if(ph<.9)a=lerp(hi,low,Math.pow((ph-.62)/.28,1.6));else a=low-.08*Math.sin((ph-.9)*30);
      a1=a;a0=a*.92;e1=lerp(.15,1.15,cl((a-low)/(hi-low),0,1));e0=e1;
      const w=cl((a-low)/(hi-low),0,1);lean=lerp(-.38,.18,w);twist=lerp(.25,-.2,w);bob=-.05*(1-w)}
    else if(kind==='build'){const w=ph<.7?ease(ph/.7):1-ease((ph-.7)/.3)*.0;a1=lerp(.5,1.9,ph<.7?w:1-Math.pow((ph-.7)/.3,2));e1=lerp(.3,1.2,ph<.7?w:1-(ph-.7)/.3);a0=.5;e0=.9;lean=-.2-.1*(1-w);twist=0}
    else{ /* Beeren pflücken: vorgebeugt, rechte Hand greift nach vorn-unten zum Strauch und zurück zum Korb in der linken Hand */
      const c=Math.sin(ph*Math.PI);lean=-.6;a1=lerp(.7,1.7,c);e1=lerp(1.0,.2,c);a0=.75;e0=1.25;bob=-.1;twist=.12*Math.sin(ph*Math.PI*2)}}
  else if(e.state==='gather'&&!moving&&rig.tool){a1=.12}
  if(o.fl>0){lean+=.45*fl;a0+=.5*fl;a1+=.7*fl}
  const sm=(cur,tg,r)=>cur+(tg-cur)*Math.min(1,dt*r);
  A[0].rotation.z=sm(A[0].rotation.z,a0,18);A[1].rotation.z=sm(A[1].rotation.z,a1,work||build||atk?30:18);E[0].rotation.z=sm(E[0].rotation.z,e0,18);E[1].rotation.z=sm(E[1].rotation.z,e1,work||build||atk?30:18);
  up.rotation.z=sm(up.rotation.z,lean,work||atk?22:14);up.rotation.y=sm(up.rotation.y,twist,14);
  up.position.y=.9+bob;up.position.x=(fresh&&atk&&!rig.bow?.18*(1-k):0)-(o.fl>0?.12*fl:0);
  if(rig.head)rig.head.rotation.y=moving||atk?0:Math.sin(t*.6+id*3)*.45;
  if(rig.tool){const kk=build?'build':(e.state==='gather'||e.state==='return'||work)?e.rtype:null;rig.tool(kk==='food'&&e.carry>0&&e.state==='return'?null:kk);if(rig.sack){rig.sack.visible=e.carry>0&&e.state!=='gather'||e.carry>4;rig.sack.scale.setScalar(.6+Math.min(1,e.carry/CARRY)*.6)}}
}
/* Welche Arbeit macht die Einheit gerade? (bestimmt Werkzeug und Bewegung) */
function wkKind(e){if(e.state==='build')return'build';const n=e.tid!=null&&e.tid!==undefined?G.byId.get(e.tid):null;if(!n)return'';if(n.kind==='animal')return'hunt';const t=n.type;return t==='tree'?'chop':(t==='stone'||t==='iron'||t==='gold'||t==='oil')?'mine':t==='field'?'farm':t==='bush'?'pick':n.sea?'fish':''}
/* Takt der Arbeit für die Arbeits-Haltungen: ph 0..1, ph = 0 ist der Aufprall. Aus der Spielrechnung (u.gt/u.gl Sammeln, u.bt/u.bl Bauen, u.cd Jagd),
   sonst (Mehrspieler-Gast, dort fehlt gt) ein eigener Takt. imp = in diesem Bild hat ein neuer Hieb begonnen (Geräusch kam vom Spiel). */
const WCYC={chop:1.2,mine:1.1,pick:2.1,farm:1.5,build:.6,hunt:1.2};
function wkPhase(o,e,kd,dt,want,hunt,d){
  if(want!=='work')return null;let ph,imp=false;const tm=hunt?(d.cd||1.2):kd==='build'?(e.bl||.6):(e.gl||0),cur=hunt?e.cd:kd==='build'?e.bt:e.gt;
  if(tm&&cur!==undefined&&!NET.client){ph=1-Math.max(0,Math.min(1,cur/tm));if(o.pg!==undefined&&cur>o.pg+.12){imp=true;o.wn=(o.wn||0)+1}o.pg=cur}
  else{o.fph=((o.fph||0)+(G.paused||G.netPause?0:dt*Math.min(G.speed||1,5)/(WCYC[kd]||1.2)))%1;if(o.fph<(o.pf||0)){imp=true;o.wn=(o.wn||0)+1}o.pf=o.fph;ph=o.fph}
  /* Takt = Spieltakt: ph kommt direkt aus u.gt/u.bt/u.cd (laufen mit dem Spieltempo), bei 5× also 5× so viele Hiebe je Sekunde wie bei 1×; Pause = Stillstand (Takt steht). */
  return{ph,imp}}
/* Aufprall: Späne am Werkzeugkopf (nur Optik), Baum wackelt kurz */
const SHK=new Map();
function r3Impact(o,e,kd,rig){
  const n=e.tid!=null?G.byId.get(e.tid):null;if(!n||(kd!=='chop'&&kd!=='mine'))return;
  /* Aufprallpunkt: am Stamm bzw. Fels auf der Seite der Figur, in Brusthöhe (unabhängig vom Spieltempo, die Axt trifft dort) */
  const c=kd==='chop'?'168,122,68':'196,192,182',R=Math.random,bx=Math.cos(e.fa),by=Math.sin(e.fa),rr=kd==='chop'?3.5:n.r*.9,x=n.x-bx*rr,y=n.y-by*rr,z=kd==='chop'?14:10;
  for(let i=0;i<(kd==='chop'?5:4);i++)addPart('chip',x,y,z+R()*4,-bx*(10+R()*30)+(R()-.5)*40,-by*(10+R()*30)+(R()-.5)*40,40+R()*50,.45+R()*.2,1.5+R(),c);
  if(kd==='chop'&&n.type==='tree')SHK.set(n.id,{t:0,ax:bx,az:by,ix:null})}
/* Baumwackeln: die Instanz des getroffenen Baums kurz neigen (Matrix wird je Bild überschrieben, danach stellt r3Nodes sie wieder gerade) */
const _so=new THREE.Object3D(),_sq=new THREE.Quaternion(),_sa=new THREE.Vector3(),_sb=new THREE.Euler();
function r3Shake(dt){
  for(const[id,s]of SHK){s.t+=dt;const done=s.t>.9;if(!s.ix){if(done)SHK.delete(id);continue}
    const ix=s.ix,m=r3.ns&&r3.ns[ix.key]&&r3.ns[ix.key].L[ix.v];if(!m){SHK.delete(id);continue}
    const a=done?0:.05*Math.exp(-s.t*4.2)*Math.sin(s.t*24);_sa.set(-s.az,0,s.ax);_sq.setFromAxisAngle(_sa,a);_so.position.set(ix.p[0],ix.p[1],ix.p[2]);_so.quaternion.setFromEuler(_sb.set(0,ix.p[3],0)).premultiply(_sq);_so.scale.set(ix.p[4],ix.p[5],ix.p[4]);_so.updateMatrix();m.setMatrixAt(ix.i,_so.matrix);
    for(const q of m.isMulti?m.parts:[m]){const im=q.instanceMatrix;im.clearUpdateRanges();im.addUpdateRange(ix.i*16,16);im.needsUpdate=true}
    if(done)SHK.delete(id)}}
function r3Unit(o,e,h,dt,t){
  const S=R3.S,d=UNITS[e.type],rig=o.rig,moving=G.t-(e.mvT||-9)<.2,obj=o.obj;
  let want=-e.fa,dy=want-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*14);
  const sw=e.swing&&G.t-e.swing<.28?1-(G.t-e.swing)/.28:0,work=G.t-(e.gat||-9)<.25,build=e.state==='build'&&work;
  if(moving)o.ph+=dt*(d.naval?2:7+d.spd*.06);const s=Math.sin(o.ph);
  let y=h;
  if(rig.ship){y=-.42+Math.sin(t*2+e.id)*.06;obj.rotation.z=Math.sin(t*1.7+e.id)*.035;obj.rotation.x=0;if(rig.sail)rig.sail.rotation.y=Math.sin(t*1.3+e.id)*.1}
  else{
    if(e.gar){const gb=G.byId.get(e.gar);y=h+(gb&&gb.type==='tower'?4.2:2.1)}
    if(rig.props){y=h+5+Math.sin(t*1.5+e.id)*.25;rig.props.forEach(pr=>pr.rotation.x+=dt*40);obj.rotation.z=moving?-.12:0}
    else if(moving&&!rig.gltf)y+=Math.abs(s)*.07*(rig.horse?1.6:1);
    if(rig.loads)for(const k in rig.loads)rig.loads[k].visible=e.carry>0&&e.ctype===k;
    if(rig.gltf){
      /* Treffer-Reaktion (auch für glTF-Figuren): Leben gesunken → o.fl; kurzer Rückstoss (unten) + Zuck-Clip (animate, nicht mitten im eigenen Schlag) */
      if(o.hp===undefined)o.hp=e.hp;if(e.hp<o.hp-.5&&G.t-(o.hitAt||-9)>.35){o.fl=.3;o.hitAt=G.t}o.hp=e.hp;o.fl=Math.max(0,(o.fl||0)-dt);
      const kd=wkKind(e),near=cam.z>=.8,hunt=!!rig.wp&&near&&kd==='hunt'&&e.state==='attack'&&!moving&&d.gather&&G.t-(e.swing||-9)<2.6;/* Arbeiter jagt mit dem Speer */
      const swA=G.t-(e.swing||-9),wind=e.state==='attack'&&!moving&&e.cd>0&&e.cd<.55&&d.cd>.6;/* Ausholen schon vor dem Schlag (Takt = Abklingzeit) */
      const wantW=!hunt&&((e.state==='attack'&&(swA<1||wind))||(!moving&&G.t-(e.healT||-9)<.6))?'attack':(work||build||hunt)?'work':moving?'walk':'idle';
      const wp=rig.wp&&near?wkPhase(o,e,kd,dt,wantW,hunt,d):null;if(wantW!=='work')o.pg=undefined;
      /* Fernsicht: kleine Figuren (unter ~30 Pixel Höhe, weit herausgezoomt) rechnen ihr Skelett nur jedes 2. (unter ~18 Pixel jedes 3.) Bild, versetzt nach Nummer, mit der angesammelten Zeit; bei Wechsel der Tätigkeit sofort */
      const thr=R3.k*25<18?3:R3.k*25<30?2:1;o.ad=(o.ad||0)+dt;
      if(thr<2||o.lw!==wantW||(R3.fn+e.id)%thr===0||o.ad>.12){const adt=o.ad;o.ad=0;o.lw=wantW;
      EKMODELS.animate(rig,wantW,adt,moving?Math.max(.6,d.spd/60):1,kd,{v:moving?d.spd*(e.spk||1)*(e.rage>G.t?RAGE.spd:1)/10/(obj.scale.x||1):0,hit:o.fl>.2&&!(swA<.45||wind),atk:wantW==='attack'&&e.state==='attack'?{s:swA,cd:e.cd||0,per:d.cd}:null,fight:(e.state==='attack'||e.state==='amove')&&!d.gather&&e.type!=='worker',
        near,ph:wp?wp.ph:undefined,n:o.wn||0,cv:e.carry>0&&e.state==='return',ct:e.ctype})}
      e._wi=!!(wp&&rig.wp.cur&&(kd==='chop'||kd==='mine'));/* Späne kommen dann vom Aufprall (r3Impact), nicht vom Takt in render.js */
      if(wp&&wp.imp)r3Impact(o,e,kd,rig);
      /* Figur tritt beim Arbeiten bis auf Griffweite an Baum/Strauch heran (nur Darstellung, die Spielposition bleibt) */
      let sh=0;if(wp&&rig.wp.cur&&(kd==='chop'||kd==='pick'||kd==='mine')){const nd=G.byId.get(e.tid);if(nd){const dd=Math.hypot(nd.x-e.x,nd.y-e.y)/S,gap=kd==='chop'?1.35:kd==='pick'?1.9:nd.r/S*.9+1;sh=Math.max(kd==='pick'?-1.3:-.3,Math.min(1.1,dd-gap))}}
      o.sh=(o.sh||0)+(sh-(o.sh||0))*Math.min(1,dt*3)}
    else if(rig.horse){rig.legs.forEach((l,i)=>l.rotation.z=(i%2?s:-s)*.7);const rd=rig.rider;rd.arms[1].rotation.z=.2+sw*.6}
    else if(rig.wheels){if(rig.load){rig.load.visible=(e.carry||0)>0;if(rig.loadMat&&rig.lc!==e.ctype){rig.lc=e.ctype;rig.loadMat.color.set({stone:0x8a8278,iron:0x8a4e3a,gold:0xe8c048}[e.ctype]||0x8a8278);if(rig.loadMat.metalness!==undefined)rig.loadMat.metalness=e.ctype==='gold'?.7:e.ctype==='iron'?.3:0}}if(rig.pusher&&moving){const p=rig.pusher,s=Math.sin(G.t*9);(p.legs||[]).forEach((l,i)=>l.rotation.z=(i?s:-s)*.5)}if(moving)rig.wheels.forEach(w=>w.rotation[w.userData.axis||'y']+=dt*3.2*(d.spd/40));if(rig.log)rig.log.position.x=sw*.9;if(rig.arm)rig.arm.rotation.z=-sw*1.8;if(rig.barrel)rig.barrel.position.x=.1-sw*.35}
    else if(rig.up){r3Human(o,e,rig,d,s,sw,work,build,moving,dt,t)}
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
  /* Rückstoss beim Treffer: Figur weicht kurz nach hinten (nur Darstellung), schnell hin, weich zurück */
  const rc=rig.gltf&&o.fl>0&&!rig.ship&&!d.siege?Math.sin(Math.min(1,o.fl/.3)*Math.PI)*(rig.horse?.16:.26):0;
  obj.position.set(e.x/S+(o.sh?Math.cos(e.fa)*o.sh:0)-Math.cos(e.fa)*rc,y,e.y/S+(o.sh?Math.sin(e.fa)*o.sh:0)-Math.sin(e.fa)*rc);obj.rotation.y=o.yaw;
}
function r3Animal(o,e,h,dt,t){const S=R3.S,rig=o.rig,moving=G.t-(e.mvT||-9)<.2;let dy=-e.fa-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*10);if(moving)o.ph+=dt*(6+UNITS_A(e).spd*.05);const s=Math.sin(o.ph);
  if(rig.gltf){EKMODELS.animate(rig,e.state==='graze'?'work':(e.swing&&G.t-e.swing<.8)?'attack':moving?'walk':'idle',dt,moving?1.4:1);if(!rig.mixer)rig.g.rotation.z=moving?Math.sin(o.ph)*.06:0}
  rig.legs.forEach((l,i)=>{const ph=(i===0||i===3?s:-s);l.rotation.z=moving?ph*.7:0;if(rig.knees&&rig.knees[i])rig.knees[i].rotation.z=moving?Math.max(0,-ph)*.9:0});rig.g.scale.y=rig.g.userData.sy=1+(moving?0:Math.sin(t*1.6+e.id)*.012);const sw=e.swing&&G.t-e.swing<.3?1-(G.t-e.swing)/.3:0;if(rig.head)rig.head.rotation.z=-sw*.5+(e.state==='graze'?-.6:0);
  o.obj.position.set(e.x/S,(UNITS_A(e).water?Math.max(h,-.12):h)+(moving?Math.abs(s)*.06:0),e.y/S);o.obj.rotation.y=o.yaw}
const UNITS_A=e=>ANIMALS[e.type];

/* ---------- Team-Markierung: je Einheit/Gebäude ein dünner Bodenring (eigene = Kreis, Gegner = Raute, auch ohne Farbsehen unterscheidbar); zwei InstancedMesh, kein Aufbau je Bild ---------- */
const TM_MAX=1600,_tmM=new THREE.Matrix4(),_tmC=new THREE.Color(),_tmQ=new THREE.Quaternion(),_tmS=new THREE.Vector3(),_tmP=new THREE.Vector3();
function r3TeamMarks(arr,mode){
  if(!R3.tm){R3.tm=[0,1].map(i=>{const g=i?new THREE.RingGeometry(.84,1,4,1,Math.PI/4).rotateX(-Math.PI/2):new THREE.RingGeometry(.9,1,40).rotateX(-Math.PI/2);const m=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),TM_MAX);m.renderOrder=3;m.frustumCulled=false;m.count=0;m.setColorAt(0,_tmC.set('#fff'));r3.scene.add(m);return m})}
  const S=R3.S,n=[0,0];
  for(const e of arr){const i=e.team===0?0:1,m=R3.tm[i];if(n[i]>=TM_MAX)continue;
    const rr=(e.r+(e.kind==='bld'?3:2))/S*(i?1.12:1);_tmP.set(e.x/S,hAt(e.x,e.y)+.12,e.y/S);_tmS.set(rr,1,rr);_tmM.compose(_tmP,_tmQ,_tmS);m.setMatrixAt(n[i],_tmM);
    _tmC.set(shadeHex(TC[e.team]||'#ffffff',.18));m.setColorAt(n[i],_tmC);n[i]++}
  for(const i of[0,1]){const m=R3.tm[i];m.count=mode==='off'?0:n[i];m.material.opacity=mode==='strong'?.95:.6;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}}
/* ---------- Auswahlringe am Boden ---------- */
function r3Ring(x,y,r,col,op){
  const S=R3.S;let m=R3.rings[R3.ringN];
  if(!m){m=new THREE.Mesh(new THREE.RingGeometry(.9,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.renderOrder=4;R3.rings.push(m);r3.scene.add(m)}
  R3.ringN++;m.visible=true;m.material.color.set(col);m.material.opacity=op===undefined?.95:op;const rr=r/S;m.scale.set(rr,1,rr);m.position.set(x/S,hAt(x,y)+.1,y/S)}
function r3Ghost(type,x,y,ok){
  if(!r3.ghost||r3.ghostKey!==type+':'+G.epoch[0]){if(r3.ghost){r3.scene.remove(r3.ghost);r3Drop(r3.ghost)}const g=buildBld(type,BLDS[type].r/R3.S*1.05,G.epoch[0],0);g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.castShadow=false}});r3.ghost=g;r3.ghostKey=type+':'+G.epoch[0];r3.scene.add(g)}
  r3.ghost.visible=true;r3.ghost.position.set(x/R3.S,hAt(x,y),y/R3.S);r3.ghost.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(ok?0x1c3a10:0x4a1208)})}

/* ---------- Ein Bild zeichnen ---------- */
/* Dynamische Auflösung: läuft das Bild zäh (< ~40 FPS), wird die Auflösung schrittweise gesenkt, bei flüssigem Bild wieder angehoben */
function r3Dyn(dt){if(!(dt>0)||dt>.5)return;R3.dyn=R3.dyn||1;R3.dynA=(R3.dynA||1/60)*.95+dt*.05;R3.dynT=(R3.dynT||0)+dt;if(R3.dynT<1.5)return;R3.dynT=0;
  const f=1/R3.dynA,old=R3.dyn;if(f<38&&R3.dyn>.5)R3.dyn=Math.max(.5,R3.dyn-.1);else if(f>55&&R3.dyn<1)R3.dyn=Math.min(1,R3.dyn+.05);if(R3.dyn!==old)r3Resize();R3.slow=f<30}
/* ---------- Reichweiten-Ringe: dünnes, dem Gelände folgendes Band um ausgewählte Fernkämpfer/Türme (nur Anzeige) ---------- */
const RR_N=72;
function r3Ranges(list){
  const S=R3.S,pool=R3.rr||(R3.rr=[]);let n=0;
  for(const q of list){let m=pool[n];
    if(!m){const g=new THREE.BufferGeometry(),idx=[];g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((RR_N+1)*6),3));
      for(let i=0;i<RR_N;i++){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,b,c,b,d,c)}g.setIndex(idx);
      m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false,depthTest:false,fog:false,side:THREE.DoubleSide}));m.renderOrder=6;m.frustumCulled=false;r3.scene.add(m);pool[n]=m}
    const pa=m.geometry.attributes.position,w=Math.max(.16,.24/Math.max(.45,cam.z)),r=q.r/S;m.material.color.set(q.c);m.material.opacity=q.o||.55;
    for(let i=0;i<=RR_N;i++){const a=i/RR_N*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),x=q.x+ca*q.r,y=q.y+sa*q.r,h=hAt(x,y)+.2;
      pa.setXYZ(i*2,(q.x/S)+ca*(r-w/2),h,(q.y/S)+sa*(r-w/2));pa.setXYZ(i*2+1,(q.x/S)+ca*(r+w/2),h,(q.y/S)+sa*(r+w/2))}
    pa.needsUpdate=true;m.visible=true;n++}
  for(let i=n;i<pool.length;i++)pool[i].visible=false}
function r3Frame(list,rings,dt){r3Dyn(dt);
  const t=(performance.now()-R3.t0)/1000;WIND.value=t;CLOUD.t.value=t;CLOUD.k.value=(OPT.cloudShade&&GQ[gfxQ].cloud&&!R3.saverOn&&!R3.slow&&!(R3.ice>.5))?.8:0;
  if(R3.bgRef!==bg||R3.gRef!==G)r3Map();
  r3Tod();
  camUpdate();
  if(r3.foam)r3.foam.material.opacity=(.42+.3*Math.sin(t*1.4)+.1*Math.sin(t*3.1))*(1-(R3.ice||0)*.8);
  for(const w of r3.waves){w.material.opacity=w.userData.op0*(1-(R3.ice||0)*.72);const m=w.material.map;m.offset.x=(t*.012*w.userData.sp+.012*Math.sin(t*.35+w.userData.sp*3))%1;m.offset.y=(t*.007+.01*Math.sin(t*.27+w.userData.sp))%1}
  r3.terrOv.material.map.needsUpdate=true;r3.fogOv.material.map.needsUpdate=true;
  {const V=R3.view,N=R3.nodeV,ck=Math.round(cam.yaw*12)+','+Math.round(cam.pitch*12);if(ck!==R3.camK){R3.camK=ck;R3.nodeT=0}if(Math.abs(Math.log(cam.z/(R3.nodeZ||cam.z)))>.02)R3.nodeT=0;if(V&&N&&(Math.abs((V.x0+V.x1)/2-N.x)>70||Math.abs((V.y0+V.y1)/2-N.y)>70||Math.abs((V.x1-V.x0)-N.w)>150))R3.nodeT=0}
  r3Lod();R3.nodeT-=dt;R3.gsT=(R3.gsT||0)-dt;if(R3.nodeT<=0){R3.nodeT=R3.apBusy?.06:.4;r3Nodes();if(R3.gsT<=0){R3.gsT=.4;r3GrassShade()}else r3GrassView()}else r3GrassView();if(SHK.size)r3Shake(dt)
  if(typeof WPOSE!=='undefined')WPOSE.n=0;R3.fn=(R3.fn||0)+1;r3Sync(list,dt,t);if(EGO.on)EGO.hide();r3Smoke(Math.min(dt,.1),t);r3Weather(Math.min(dt,.1),t);
  r3TeamMarks(EGO.on?[]:R3.tmList||[],OPT.teamMark||'soft');
  R3.ringN=0;for(const r of EGO.on?[]:rings)r3Ring(r.x,r.y,r.r,r.c,r.o);for(let i=R3.ringN;i<R3.rings.length;i++)R3.rings[i].visible=false;
  r3Ranges(EGO.on||!OPT.rangeRing?[]:R3.rangeList||[]);
  if(r3.ghost&&!R3.ghostOn)r3.ghost.visible=false;
  /* Schattenkarte nur jedes 2. Bild neu (bewegt sich die Kamera, sofort) – halbiert die Schatten-Zeichenarbeit, Unterschied ist nicht zu sehen */
  {const sm=r3.rd.shadowMap,ck=cam.x.toFixed(1)+','+cam.y.toFixed(1)+','+cam.z.toFixed(3)+','+cam.yaw.toFixed(3)+','+cam.pitch.toFixed(3);sm.autoUpdate=false;R3.shF=(R3.shF||0)+1;if(R3.shF%2===0||ck!==R3.shK){sm.needsUpdate=true;R3.shK=ck}}
  r3.rd.render(r3.scene,r3.camera);R3.ghostOn=false;r3Bloom();
}
/* Höhe einer Figur/eines Gebäudes über dem Boden in Spielpixeln (für Lebensbalken, Marker) */
function entH(e){
  if(e.kind==='unit'){const t=e.type,d=UNITS[t];return d.air?60:d.naval?(t==='galleon'?55:40):t==='knight'?46:d.siege?(t==='ram'?30:34):e.r/7*25}
  if(e.kind==='bld'){const o=R3.reg.get(entKey(e,false));return o&&o.obj.userData.h?o.obj.userData.h*R3.S:e.r*2.4}
  if(e.kind==='animal')return ANIMALS[e.type].h||26;
  return e.r*({tree:3.6,bush:1.5,stone:1.1,iron:1.1,gold:1.1}[e.type]||1)}

/* Skelette ausgestorbener Tiere (Mammut, Säbelzahntiger): liegen dauerhaft am Boden, sobald das Tier umgefallen ist */
function skeletonModel(type){
  const g=new THREE.Group(),bone=m3Plain(0xe8e0cc,.8),big=['mammoth','trex','trike','stego','bronto'].includes(type),k=big?1.5:.8;
  const L=big?3.2:2.0;
  put(g,cyl(.07*k,.07*k,L,6),bone,0,.2,0).rotation.z=Math.PI/2;
  for(let i=0;i<7;i++){const x=-L*.35+i*L*.12;for(const s of[-1,1]){const rb=put(g,new THREE.TorusGeometry(.4*k*(1-Math.abs(i-3)*.12),.035*k,5,10,Math.PI),bone,x,.28,0);rb.rotation.set(0,Math.PI/2,s>0?0:Math.PI);rb.rotation.x=s>0?Math.PI/2:-Math.PI/2}}
  const hx=L*.55;put(g,new THREE.SphereGeometry(.28*k,8,6),bone,hx,.25,0).scale.set(1.3,.8,.9);put(g,new THREE.BoxGeometry(.5*k,.1*k,.2*k),bone,hx+.3*k,.15,0);
  if(big){for(const s of[-1,1]){const t=put(g,cone(.07,1.8,6),bone,hx+.5,.35,s*.28);t.rotation.set(s*.2,0,-1.2)}}
  else{for(const s of[-1,1])put(g,cone(.035,.3,5),bone,hx+.45*k,.05,s*.07).rotation.z=Math.PI;}
  for(let i=0;i<4;i++){const s=i%2?1:-1,x=i<2?-L*.3:L*.2;put(g,cyl(.04*k,.04*k,.7*k,5),bone,x,.12,s*.5*k).rotation.set(s*1.2,0,.3)}
  for(let i=0;i<5;i++)put(g,cyl(.025*k,.015*k,.25*k,4),bone,-L*.55-i*.12,.1,0).rotation.z=Math.PI/2;
  return g}
function r3Bones(){
  if(R3.boneG!==G){for(const o of R3.boneObjs||[])r3.gEnt.remove(o);R3.boneObjs=[];R3.boneDone=new Set();R3.boneG=G}
  const L=G.bones||[];
  for(let i=0;i<L.length;i++){if(R3.boneDone.has(i))continue;const b=L[i];if(G.t<b[4]+3.2)continue;
    const m=skeletonModel(b[0]);m.position.set(b[1]/R3.S,hAt(b[1],b[2])+.02,b[2]/R3.S);m.rotation.y=-b[3];setShadows(m);r3.gEnt.add(m);R3.boneObjs.push(m);R3.boneDone.add(i)}}

/* Sparmodus (Mehrspieler): wenn das Bild zu langsam wird, Grafik vorübergehend vereinfachen (niedrige Auflösung, keine Schatten); wird nicht gespeichert */
function r3Saver(on){if(!R3.ok)return;if(on&&!R3.saverOn){R3.saverOn=true;R3.savedQ=gfxQ;setGfx(0,true);r3.sun.castShadow=false;r3Resize()}
  else if(!on&&R3.saverOn){R3.saverOn=false;setGfx(R3.savedQ,true);r3.sun.castShadow=true;r3Resize()}}


/* ---------- Rauch: steigt aus Schornsteinen, Schmieden und Feuerstellen auf (weiche Punktwolken, driften mit dem Wind) ---------- */
const SMOKE_SRC={house:{ep:2,o:[.42,.95,-.25],rate:.9},hq:{ep:1,o:[.3,.9,-.3],rate:.45},barracks:{ep:1,o:[-.5,.8,-.2],rate:.7},store:{ep:5,o:[-.4,.9,0],rate:1.2},harbor:{ep:5,o:[-.2,.9,0],rate:1.1},refinery:{ep:5,o:[.1,1,0],rate:.35},castle:{ep:3,o:[.3,.9,0],rate:1.4},market:{ep:5,o:[.3,.9,0],rate:1.6},mine:{ep:4,o:[-.5,.8,-.6],rate:1.3}};
function r3SmokeInit(){
  const MAX=140,c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.5,'rgba(255,255,255,.4)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  const tex=new THREE.CanvasTexture(c),pool=[];
  for(let i=0;i<MAX;i++){const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,fog:false,color:0xd9d6d0,opacity:0});const sp=new THREE.Sprite(m);sp.visible=false;sp.renderOrder=5;r3.scene.add(sp);pool.push({sp,m,on:false,age:0,life:1,vx:0,vy:0,vz:0,s0:.6,s1:2,a0:.4})}
  r3.smoke={pool,max:MAX,n:0}}
function r3Smoke(dt,t){
  if(!R3.ok)return;if(!r3.smoke)r3SmokeInit();const S=r3.smoke,Sc=R3.S;
  if(G&&G.ents&&!R3.saverOn&&GQ[gfxQ].smoke){for(const e of G.ents){if(e.dead||e.kind!=='bld'||!e.built)continue;const d=SMOKE_SRC[e.type];if(!d||G.epoch[e.team]<d.ep||!shown(e))continue;
    e._sm=(e._sm||Math.random())-dt;if(e._sm>0)continue;e._sm=d.rate*(.7+Math.random()*.6);const q=S.pool.find(p=>!p.on);if(!q)break;
    const o=R3.reg.get(e.id),R=e.r/Sc*1.05,top=(o&&o.obj.userData.h)||R*2;
    q.on=true;q.age=0;q.life=3.6+Math.random()*2.0;q.vx=.5+Math.random()*.3;q.vy=.9+Math.random()*.5;q.vz=(Math.random()-.5)*.25;q.s0=1.1;q.s1=4.2+Math.random()*1.6;q.a0=.8;q.m.color.setHex(G.epoch[e.team]>=5?0x8f8c88:0xe2dfd8);
    q.sp.position.set(e.x/Sc+d.o[0]*R,hAt(e.x,e.y)+top*d.o[1],e.y/Sc+d.o[2]*R);q.sp.visible=true}}
  for(const q of S.pool){if(!q.on)continue;q.age+=dt;if(q.age>=q.life){q.on=false;q.sp.visible=false;continue}
    const u=q.age/q.life,p=q.sp.position;p.x+=(q.vx+Math.sin(t*.7+p.z)*.1)*dt;p.y+=q.vy*(1-u*.5)*dt;p.z+=q.vz*dt;const s=q.s0+(q.s1-q.s0)*u;q.sp.scale.set(s,s,1);q.m.opacity=q.a0*Math.min(1,u*8)*(1-u)}}


/* Leuchten (Bloom): verkleinerte Kopie des Bildes liegt weichgezeichnet und aufgehellt per „Bildschirm“-Überblendung über der Welt – helle Stellen (Sonnenlicht auf Wasser, Fenster, Feuer) strahlen sanft nach.
   Billiger Ersatz für eine echte Nachbearbeitung; abschaltbar im Menü (Grafik). */
function r3Bloom(){
  if(R3.slow||(R3.dyn||1)<1){if(!R3.bloomOff){R3.bloomOff=1;const c=document.getElementById('bloom');if(c)c.width=c.width}return}R3.bloomOff=0; /* zähes Bild: Leuchten aus (leeren) */
  if(!OPT.bloom||!GQ[gfxQ].bloom||R3.saverOn)return;const c=document.getElementById('bloom');if(!c||c.hidden)return;
  R3.bloomN=(R3.bloomN||0)+1;if(R3.bloomN%2)return;
  const w=Math.max(160,Math.round(r3.rd.domElement.width/5)),h=Math.max(90,Math.round(r3.rd.domElement.height/5));if(c.width!==w||c.height!==h){c.width=w;c.height=h}
  const x=c.getContext('2d');x.globalCompositeOperation='copy';x.drawImage(r3.rd.domElement,0,0,w,h)}
