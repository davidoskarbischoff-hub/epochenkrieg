/* Epochenkrieg – 3D-Modelle (Three.js). Alles wird im Code aus einfachen Formen und Mustertexturen gebaut, keine Dateien.
   Maßstab: 1 Einheit = 10 Spielpixel. Figuren schauen in +x, ca. 2,3 Einheiten hoch. Gebäude werden aus ihrem Radius R (Einheiten) berechnet.
   Später lassen sich diese Funktionen durch geladene glTF-Modelle ersetzen, ohne das Spiel anzufassen. */
'use strict';
const M3={tex:{},mat:{}};

/* ---------- Mustertexturen (hell, grau – die Farbe kommt vom Material) ---------- */
function m3Canvas(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const m3rnd=(()=>{let a=987654321;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}})();
const gray=v=>{v=Math.round(v);return`rgb(${v},${v},${v})`};
const TEXGEN={
  planks:(x,w,h)=>{const n=4,pw=w/n;for(let i=0;i<n;i++){x.fillStyle=gray(205+m3rnd()*35);x.fillRect(i*pw,0,pw,h);for(let k=0;k<14;k++){x.strokeStyle=`rgba(90,70,50,${.1+m3rnd()*.18})`;x.lineWidth=1;const gx=i*pw+3+m3rnd()*(pw-6);x.beginPath();x.moveTo(gx,0);x.bezierCurveTo(gx+3,h*.3,gx-3,h*.6,gx+1,h);x.stroke()}x.fillStyle='rgba(60,45,30,.7)';x.fillRect(i*pw,0,2,h);x.fillStyle='rgba(50,40,30,.55)';for(const y of[10,h-10]){x.beginPath();x.arc(i*pw+pw/2,y,1.6,0,6.283);x.fill()}}},
  stone:(x,w,h)=>{const rows=6,rh=h/rows;for(let j=0;j<rows;j++){let px=-(j%2)*w/6;while(px<w){const bw=w/3*(.8+m3rnd()*.5);x.fillStyle=gray(196+m3rnd()*44);x.fillRect(px,j*rh,bw,rh);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(px+1,j*rh+1,bw-2,2);x.fillStyle='rgba(60,60,60,.5)';x.fillRect(px,j*rh,bw,1.5);x.fillRect(px,j*rh,1.5,rh);px+=bw}}
    for(let i=0;i<260;i++){x.fillStyle=`rgba(60,60,60,${m3rnd()*.14})`;x.fillRect(m3rnd()*w,m3rnd()*h,1+m3rnd()*2,1+m3rnd()*2)}},
  brick:(x,w,h)=>{x.fillStyle='rgb(176,176,176)';x.fillRect(0,0,w,h);const rows=8,rh=h/rows,bw=w/4;for(let j=0;j<rows;j++)for(let i=-1;i<5;i++){const px=i*bw+(j%2)*bw/2;x.fillStyle=gray(205+m3rnd()*40);x.fillRect(px+1,j*rh+1,bw-2,rh-2);x.fillStyle='rgba(255,255,255,.2)';x.fillRect(px+1,j*rh+1,bw-2,1.5)}},
  thatch:(x,w,h)=>{x.fillStyle=gray(215);x.fillRect(0,0,w,h);for(let i=0;i<900;i++){const px=m3rnd()*w,py=m3rnd()*h,l=10+m3rnd()*16,tone=150+m3rnd()*100;x.strokeStyle=gray(tone);x.globalAlpha=.55;x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px+l*.18,py+l);x.stroke()}x.globalAlpha=1;for(let j=1;j<5;j++){x.fillStyle='rgba(70,55,30,.28)';x.fillRect(0,j*h/5,w,2)}},
  shingle:(x,w,h)=>{const rows=8,rh=h/rows;for(let j=0;j<rows;j++){let px=-(j%2)*6;while(px<w){const bw=12;x.fillStyle=gray(190+m3rnd()*50);x.fillRect(px,j*rh,bw,rh);x.fillStyle='rgba(50,35,20,.55)';x.fillRect(px,j*rh+rh-2,bw,2);x.fillRect(px,j*rh,1,rh);px+=bw}}},
  tiles:(x,w,h)=>{const rows=8,rh=h/rows,cw=w/6;x.fillStyle='rgb(140,140,140)';x.fillRect(0,0,w,h);for(let j=0;j<rows;j++)for(let i=-1;i<7;i++){const px=i*cw+(j%2)*cw/2,py=j*rh;x.fillStyle=gray(200+m3rnd()*45);x.beginPath();x.moveTo(px,py);x.lineTo(px+cw,py);x.lineTo(px+cw,py+rh*.7);x.arc(px+cw/2,py+rh*.7,cw/2,0,3.1416);x.closePath();x.fill();x.strokeStyle='rgba(40,30,30,.45)';x.lineWidth=1;x.stroke()}},
  dirt:(x,w,h)=>{x.fillStyle=gray(215);x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=`rgba(70,50,30,${m3rnd()*.2})`;const r=1+m3rnd()*4;x.beginPath();x.arc(m3rnd()*w,m3rnd()*h,r,0,6.283);x.fill()}}
};
function m3Tex(kind){return M3.tex[kind]||(M3.tex[kind]=m3Canvas(128,128,(x,w,h)=>TEXGEN[kind](x,w,h)))}
/* Material mit Muster (kind) und Farbe */
function m3Mat(kind,color,o){const key=kind+color+(o?JSON.stringify(o):'');if(M3.mat[key])return M3.mat[key];
  const p={color:new THREE.Color(color),roughness:.9,metalness:0,...(o||{})};if(kind){const t=m3Tex(kind);p.map=t;p.bumpMap=t;p.bumpScale=.9}
  return M3.mat[key]=new THREE.MeshStandardMaterial(p)}
const m3Plain=(color,rough=.85,o)=>m3Mat(null,color,{roughness:rough,...(o||{})});
function m3Team(team){return m3Plain(TC[team],.6)}
function m3TeamL(team){return m3Plain(TCL[team],.6)}
const metal=()=>m3Plain(0xb9bec4,.32,{metalness:.75}),darkM=()=>m3Plain(0x3a3b42,.5,{metalness:.6}),wood=()=>m3Plain(0x7a5a3a,.9),woodD=()=>m3Plain(0x4d3722,.9),skinM=()=>m3Plain(0xe2b98f,.7),cloth=c=>m3Plain(c,.85);

/* ---------- Geometrie-Helfer ---------- */
function uvScale(g,sx,sy){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*sx,uv.getY(i)*(sy===undefined?sx:sy));return g}
/* Quader, dessen Muster mit der Größe mitwächst (tile = Kantenlänge einer Mustereinheit in Einheiten) */
function bx(w,h,d,tile=2){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*dims[f][0]/tile,uv.getY(i)*dims[f][1]/tile)}return g}
const cyl=(rt,rb,h,s=12)=>new THREE.CylinderGeometry(rt,rb,h,s);
const put=(g,geo,m,x=0,y=0,z=0,shadow=true)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;g.add(o);return o};
/* Satteldach: First entlang x, Breite w (x), Tiefe d (z), Höhe h; [Giebelmaterial, Dachmaterial] */
function gable(w,d,h,gm,rm,ov=.25){const s=new THREE.Shape();s.moveTo(-d/2-ov,0);s.lineTo(d/2+ov,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:w+ov*2,bevelEnabled:false});g.translate(0,0,-(w+ov*2)/2);g.rotateY(Math.PI/2);uvScale(g,.5);
  const m=new THREE.Mesh(g,[gm,rm]);m.castShadow=true;m.receiveShadow=true;return m}
const cone=(r,h,s=10)=>new THREE.ConeGeometry(r,h,s);
const gab=(g,x,y,z,...a)=>{const m=gable(...a);m.position.set(x,y,z);g.add(m);return m};
function setShadows(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o}

/* ---------- Gebäude ----------
   Stil je Epoche: Wand-/Dachmuster; Farben kommen aus MAT[ep] (data.js). */
const STY=[{w:'planks',r:'thatch'},{w:'planks',r:'thatch'},{w:'stone',r:'shingle'},{w:'stone',r:'tiles'},{w:'brick',r:'tiles'}];
function bStyle(ep){const m=MAT[ep],s=STY[ep];return{wall:m3Mat(s.w,m.wall),roof:m3Mat(s.r,m.roof),base:m3Mat('stone',0x8d8a80),line:m3Plain(m.line,.9),ep,flat:ep>=3,wk:s.w}}
function windows(g,st,xs,y,z,w=.5,h=.7){for(const x of xs){const f=put(g,new THREE.BoxGeometry(w+.2,h+.2,.1),woodD(),x,y,z,false);put(g,new THREE.BoxGeometry(w,h,.12),m3Plain(st.ep>=3?0xbad4e6:0x1d1812,.2,{metalness:.2}),x,y,z+.02,false)}}
function door(g,x,z,w,h){put(g,new THREE.BoxGeometry(w+.2,h+.1,.14),woodD(),x,h/2,z,false);const d=put(g,new THREE.BoxGeometry(w,h,.18),m3Mat('planks',0x4a3220),x,h/2-.02,z+.02,false);return d}
function crenels(g,w,d,y,n,st,sz=.45){for(let i=0;i<n;i++){const x=-w/2+sz/2+i*((w-sz)/(n-1));for(const z of[-d/2+sz/2,d/2-sz/2])put(g,new THREE.BoxGeometry(sz,sz*1.1,sz),st.wall,x,y+sz*.55,z)}}
function flagPole(g,x,y,z,len,team){put(g,cyl(.05,.05,len,6),woodD(),x,y+len/2,z,false);const f=put(g,new THREE.PlaneGeometry(len*.55,len*.32,6,1),new THREE.MeshStandardMaterial({color:TC[team],side:THREE.DoubleSide,roughness:.7}),x+len*.28,y+len*.82,z,false);f.userData.flag=true;f.castShadow=false;return f}
function turret(g,x,z,r,h,st,roofCol,team){
  put(g,cyl(r,r*1.1,h,14),st.ep>=2?m3Mat('stone',MAT[st.ep].wall):st.wall,x,h/2,z);
  if(st.ep>=2&&st.ep<4){const n=8;for(let i=0;i<n;i++){const a=i/n*6.283;put(g,new THREE.BoxGeometry(r*.5,r*.5,r*.5),m3Mat('stone',MAT[st.ep].wall),x+Math.cos(a)*r*1.05,h+r*.22,z+Math.sin(a)*r*1.05)}put(g,cyl(r*1.15,r*1.15,.2,14),m3Mat('stone',MAT[st.ep].wall),x,h,z)}
  else put(g,cone(r*1.45,r*1.9,12),st.roof,x,h+r*.95,z);
  put(g,new THREE.BoxGeometry(.16,.5,.12),m3Plain(0x15110c),x,h*.62,z+r,false);
  if(team!==undefined)flagPole(g,x,h+(st.ep>=2&&st.ep<4?.3:r*1.9),z,r*2.4,team)}
const BLD3={
  hq(R,st,team){const g=new THREE.Group(),w=R*2.5,d=R*1.7,h=R*.95;
    put(g,bx(w+.5,.4,d+.5,3),st.base,0,.2,0);
    put(g,bx(w,h,d,2.2),st.wall,0,.4+h/2,0);
    if(st.flat){put(g,bx(w+.3,.3,d+.3,3),st.base,0,.4+h+.15,0);crenels(g,w,d,.4+h+.3,9,st);put(g,bx(w*.5,h*.85,d*.7,2.4),st.wall,0,.4+h+.3+h*.425,0);gab(g,0,.4+h+.3+h*.85,0,w*.5,d*.7,h*.6,st.wall,st.roof)}
    else gab(g,0,.4+h,0,w,d,h*.9,st.wall,st.roof);
    turret(g,-w/2,d*.1,R*.36,h*2.1,st,null,team);turret(g,w/2,d*.1,R*.36,h*2.1,st,null,team);
    door(g,0,d/2,R*.55,R*.8);windows(g,st,[-w*.28,w*.28],.4+h*.6,d/2+.02);
    if(st.ep>=4){put(g,cyl(.45,.45,.15,16),m3Plain(0xf1e7cf),0,.4+h*2.1,d*.05).rotation.x=Math.PI/2}
    if(st.ep<=2){for(let i=-9;i<=9;i++){put(g,cyl(.07,.07,1.3,6),wood(),i*w*.058,.65,d/2+.9);put(g,cone(.08,.3,6),wood(),i*w*.058,1.4,d/2+.9)}}
    g.userData.h=h*2.6;return g},
  house(R,st,team){const g=new THREE.Group(),w=R*2.2,d=R*1.7,h=R*.85;
    put(g,bx(w,h,d,2),st.wall,0,h/2,0);gab(g,0,h,0,w,d,h*.8,st.wall,st.roof);
    door(g,-w*.22,d/2,R*.4,R*.62);windows(g,st,[w*.25],h*.58,d/2+.02,.35,.4);
    if(st.ep>=1)put(g,bx(.4,h*.9,.4,1),st.base,w*.3,h+h*.45,-d*.15);
    g.userData.h=h*2;return g},
  store(R,st,team){const g=new THREE.Group(),w=R*2.3,d=R*1.5,h=R*.7;
    put(g,bx(w,h,d,2),st.wall,0,h/2,0);gab(g,0,h,0,w,d,h*.55,st.wall,st.roof,.4);
    put(g,bx(R*.9,h*.85,.2,1),m3Mat('planks',0x5a4028),0,h*.43,d/2+.05);
    for(const[x,z]of[[w*.62,d*.2],[w*.62,-d*.2],[w*.5,d*.55]]){put(g,bx(.55,.55,.55,1),m3Mat('planks',0xa9834f),x,.28,z)}
    put(g,cyl(.28,.28,.6,10),m3Mat('planks',0x8d6a3e),-w*.62,.3,d*.5);
    g.userData.h=h*1.7;return g},
  barracks(R,st,team){const g=new THREE.Group(),w=R*2.5,d=R*1.5,h=R*.85;
    put(g,bx(w,h,d,2),st.wall,0,h/2,0);
    if(st.flat){crenels(g,w,d,h,10,st);}else gab(g,0,h,0,w,d,h*.7,st.wall,st.roof);
    door(g,0,d/2,R*.65,R*.7);windows(g,st,[-w*.33,w*.33],h*.58,d/2+.02,.4,.5);
    for(let i=0;i<3;i++){put(g,cyl(.05,.05,1.5,6),wood(),w*.62+i*.28,.75,d*.35);put(g,cone(.09,.3,6),metal(),w*.62+i*.28,1.6,d*.35)}
    put(g,cyl(.28,.28,1.2,8),wood(),-w*.62,.6,d*.55);put(g,new THREE.SphereGeometry(.3,10,8),m3Plain(0xc9a24e),-w*.62,1.35,d*.55);
    flagPole(g,w*.4,h+(st.flat?.45:h*.7),-d*.25,R*1.1,team);
    g.userData.h=h*2;return g},
  tower(R,st,team){const g=new THREE.Group();
    if(st.ep<=1){const H=R*3.2;for(const[x,z]of[[-1,-1],[1,-1],[-1,1],[1,1]])put(g,cyl(.1,.14,H,6),wood(),x*R*.55,H/2,z*R*.55);
      for(let k=1;k<4;k++)for(const[a,b,c,d]of[[-1,-1,1,-1],[1,-1,1,1],[1,1,-1,1],[-1,1,-1,-1]])put(g,cyl(.05,.05,R*1.1,5),woodD(),(a+c)/2*R*.55,H*k/4,(b+d)/2*R*.55).rotation.z=(a!==c)?Math.PI/2:0;
      put(g,bx(R*1.6,.18,R*1.6,1),m3Mat('planks',0x7a5a3a),0,H,0);put(g,bx(R*1.6,.5,.1,1),m3Mat('planks',0x7a5a3a),0,H+.3,R*.8);put(g,bx(R*1.6,.5,.1,1),m3Mat('planks',0x7a5a3a),0,H+.3,-R*.8);put(g,bx(.1,.5,R*1.6,1),m3Mat('planks',0x7a5a3a),R*.8,H+.3,0);put(g,bx(.1,.5,R*1.6,1),m3Mat('planks',0x7a5a3a),-R*.8,H+.3,0);
      put(g,cone(R*1.3,R*.9,4),st.roof,0,H+R*.85,0).rotation.y=.785;flagPole(g,0,H+R*1.2,0,R*1.1,team);g.userData.h=H+R*1.6}
    else{const H=R*3;put(g,cyl(R*.85,R*1.1,H,16),m3Mat('stone',MAT[st.ep].wall),0,H/2,0);put(g,cyl(R*1.1,R*1.0,.35,16),m3Mat('stone',MAT[st.ep].wall),0,H,0);
      for(let i=0;i<8;i++){const a=i/8*6.283;put(g,new THREE.BoxGeometry(.5,.55,.5),m3Mat('stone',MAT[st.ep].wall),Math.cos(a)*R*1.0,H+.5,Math.sin(a)*R*1.0)}
      for(const y of[.45,.72])put(g,new THREE.BoxGeometry(.18,.5,.14),m3Plain(0x15110c),0,H*y,R*.95,false);
      if(st.ep>=3)put(g,cone(R*.9,R*1.1,12),st.roof,0,H+R*.55,0);flagPole(g,0,H+.3,0,R*1.2,team);g.userData.h=H+R*1.2}
    return g},
  castle(R,st,team){const g=new THREE.Group(),w=R*2.5,d=R*2.1,h=R*1.25,sm=m3Mat('stone',MAT[st.ep].wall);
    put(g,bx(w,h,d,2.4),sm,0,h/2,0);crenels(g,w,d,h,11,{wall:sm});
    for(const sx of[-1,1])for(const sz of[-1,1])turret(g,sx*w/2,sz*d/2,R*.38,h*1.9,{...st,wall:sm,ep:2},null,sx>0&&sz>0?team:undefined);
    put(g,bx(w*.45,h*.9,d*.55,2.4),sm,0,h+h*.45,0);put(g,cone(R*.75,R*.9,4),st.roof,0,h*1.9+R*.45,0).rotation.y=.785;
    door(g,0,d/2,R*.7,R*.95);windows(g,st,[-w*.3,w*.3],h*.62,d/2+.02,.4,.6);flagPole(g,0,h*1.9+R*.8,0,R*1.1,team);g.userData.h=h*3.2;return g},
  harbor(R,st,team){const g=new THREE.Group();
    put(g,bx(R*2.8,.18,R*1.0,1.5),m3Mat('planks',0x8a6a42),R*1.3,.32,0);
    for(const x of[R*.1,R*1.2,R*2.5])for(const z of[-R*.45,R*.45])put(g,cyl(.1,.1,1.2,6),woodD(),x,.0,z);
    const hut=new THREE.Group();put(hut,bx(R*1.5,R*.8,R*1.2,1.6),st.wall,0,R*.4,0);gab(hut,0,R*.8,0,R*1.5,R*1.2,R*.6,st.wall,st.roof);door(hut,-R*.2,R*.6,R*.35,R*.5);hut.position.set(-R*.3,.2,0);g.add(hut);
    put(g,cyl(.08,.08,R*1.9,6),woodD(),R*1.4,R*.95,0);const arm=put(g,cyl(.05,.05,R*1.1,6),woodD(),R*1.0,R*1.8,0);arm.rotation.z=Math.PI/2-.2;put(g,cyl(.01,.01,R*.7,4),m3Plain(0xcbb88f),R*.5,R*1.45,0,false);
    put(g,cyl(.22,.22,.45,8),m3Mat('planks',0x8d6a3e),R*2.2,.55,R*.25);
    flagPole(g,-R*.9,R*.8,-R*.3,R*1.0,team);g.userData.h=R*2;return g},
  wall(R,st,team){const g=new THREE.Group(),sm=m3Mat('stone',MAT[Math.max(2,st.ep)].wall);put(g,bx(R*2,R*1.5,R*1.2,1.4),sm,0,R*.75,0);for(let i=0;i<3;i++)put(g,new THREE.BoxGeometry(R*.5,R*.4,R*.5),sm,(i-1)*R*.7,R*1.7,0);g.userData.h=R*2;return g}
};
function buildBld(type,R,ep,team){const st=bStyle(ep),g=(BLD3[type]||BLD3.house)(R,st,team);setShadows(g);g.userData.flags=[];g.traverse(o=>{if(o.userData.flag)g.userData.flags.push(o)});return g}

/* ---------- Figuren ---------- */
function limbPivot(parent,x,y,z){const p=new THREE.Group();p.position.set(x,y,z);parent.add(p);return p}
/* Grundfigur mit Beinen, Rumpf, Kopf, Armen. Rückgabe: Rig mit Teilen zum Animieren. */
function human(o){
  const g=new THREE.Group(),skin=skinM(),legM=o.legs||cloth(0x5a4630),rig={g,legs:[],arms:[],tools:{}};
  for(const s of[-1,1]){const p=limbPivot(g,0,.88,s*.17);put(p,cyl(.115,.1,.82,8),legM,0,-.41,0);put(p,new THREE.BoxGeometry(.34,.14,.2),m3Plain(0x2f241a),.06,-.84,0);rig.legs.push(p)}
  const torso=put(g,new THREE.CapsuleGeometry(.29,.52,4,10),o.body,0,1.38,0);torso.scale.z=1.18;rig.torso=torso;
  if(o.belt)put(g,cyl(.33,.33,.1,12),o.belt,0,1.05,0);
  const head=put(g,new THREE.SphereGeometry(.25,14,12),skin,.02,2.0,0);rig.head=head;
  for(const s of[-1,1]){put(g,new THREE.SphereGeometry(.035,6,6),m3Plain(0x15110c),.21,2.03,s*.09,false)}
  for(const s of[-1,1]){const p=limbPivot(g,0,1.7,s*.38);put(p,cyl(.09,.08,.7,8),o.arm||o.body,0,-.34,0);put(p,new THREE.SphereGeometry(.09,8,8),skin,0,-.72,0);rig.arms.push(p)}
  return rig}
const armHand=(rig,i)=>{const p=new THREE.Group();p.position.set(0,-.72,0);rig.arms[i].add(p);return p};
function hat(rig,geo,mat,y=2.2,x=0){return put(rig.g,geo,mat,x,y,0)}

const UNIT3={
  worker(u,tm){const rig=human({body:tm,legs:cloth(0x6b5238),belt:woodD()}),R=armHand(rig,1);
    put(rig.g,cyl(.3,.3,.06,12),m3Plain(0xd9b85c),.0,2.2,0);put(rig.g,new THREE.SphereGeometry(.22,10,8,0,6.283,0,1.6),m3Plain(0xe6c870),0,2.22,0);
    const axe=new THREE.Group();put(axe,cyl(.04,.04,.9,6),wood(),0,.35,0);put(axe,new THREE.BoxGeometry(.38,.28,.05),metal(),.2,.7,0);axe.rotation.z=-.25;R.add(axe);rig.tools.wood=axe;
    const pick=new THREE.Group();put(pick,cyl(.04,.04,.95,6),wood(),0,.35,0);put(pick,new THREE.BoxGeometry(.7,.08,.08),metal(),0,.8,0);pick.rotation.z=-.25;R.add(pick);rig.tools.stone=pick;rig.tools.iron=pick;
    const ham=new THREE.Group();put(ham,cyl(.04,.04,.7,6),wood(),0,.3,0);put(ham,new THREE.BoxGeometry(.3,.2,.2),m3Plain(0x7e7a72),0,.7,0);ham.rotation.z=-.25;R.add(ham);rig.tools.build=ham;
    const bas=new THREE.Group();put(bas,new THREE.CylinderGeometry(.3,.22,.25,10),m3Plain(0xb88a4e),.15,-.05,0);R.add(bas);rig.tools.food=bas;
    const sack=put(rig.g,new THREE.SphereGeometry(.3,10,8),m3Plain(0x9a6c3c),-.38,1.4,0);rig.sack=sack;sack.visible=false;
    rig.tool=k=>{for(const n in rig.tools)rig.tools[n].visible=(n===k)};rig.tool(null);return rig},
  scout(u,tm){const rig=human({body:m3Plain(0x4f7f4f),legs:cloth(0x5a4a30),belt:tm});
    put(rig.g,new THREE.ConeGeometry(.5,.9,3),m3Plain(0x44704a),-.3,1.5,0).rotation.z=.15;
    put(rig.g,new THREE.SphereGeometry(.28,10,8,0,6.283,0,1.5),m3Plain(0x6ba26a),0,2.08,0);put(rig.g,cyl(.01,.01,.5,4),m3Plain(0xf1e7cf),-.2,2.45,0).rotation.z=.8;
    const R=armHand(rig,1);const st=put(R,cyl(.04,.04,2.2,6),wood(),0,.2,0);return rig},
  club(u,tm){const rig=human({body:m3Plain(0x7a5d3b),legs:cloth(0x5a4630),belt:tm}),R=armHand(rig,1);
    put(rig.g,new THREE.SphereGeometry(.28,10,8,0,6.283,0,1.7),m3Plain(0x4a3320),-.03,2.05,0);
    const cl=new THREE.Group();put(cl,cyl(.07,.1,1.1,7),wood(),0,.35,0);put(cl,new THREE.SphereGeometry(.22,8,8),m3Plain(0x6b4f31),0,.95,0);R.add(cl);
    for(let i=0;i<5;i++)put(rig.g,new THREE.ConeGeometry(.08,.22,5),m3Plain(0x8b6c46),-.25+i*.12,1.0,.25).rotation.x=3.14;return rig},
  spear(u,tm){const rig=human({body:m3Plain(0x6b4f35),legs:cloth(0x5a4630),belt:tm}),R=armHand(rig,1),L=armHand(rig,0);
    put(rig.g,new THREE.SphereGeometry(.29,10,8,0,6.283,0,1.6),m3Plain(0xc78d42,.5,{metalness:.5}),.0,2.1,0);
    const sp=new THREE.Group();put(sp,cyl(.035,.035,3.0,6),wood(),0,.9,0);put(sp,cone(.09,.4,6),metal(),0,2.55,0);R.add(sp);sp.rotation.z=.15;
    const sh=put(L,cyl(.5,.5,.07,16),tm,.18,0,.05);sh.rotation.x=Math.PI/2;put(sh,new THREE.SphereGeometry(.12,8,6),m3Plain(0xc78d42,.4,{metalness:.5}),0,.05,0);return rig},
  archer(u,tm){const rig=human({body:m3Plain(0x5b7a44),legs:cloth(0x4a3a2a),belt:tm}),L=armHand(rig,0);
    put(rig.g,new THREE.SphereGeometry(.29,10,8,0,6.283,0,1.7),m3Plain(0x41603a),.0,2.1,0);
    put(rig.g,cyl(.1,.1,.7,8),m3Plain(0x7a5535),-.34,1.5,.1).rotation.z=.3;for(let i=0;i<3;i++)put(rig.g,cyl(.012,.012,.3,4),m3Plain(0xe8d9b5),-.46-i*.02,1.95,.1+i*.03);
    const bow=new THREE.Mesh(new THREE.TorusGeometry(.6,.03,5,16,Math.PI),m3Plain(0xa9783f,.7));bow.rotation.z=-Math.PI/2;bow.position.set(.05,.02,0);bow.castShadow=true;L.add(bow);
    put(L,cyl(.004,.004,1.2,3),m3Plain(0xf1e7cf),.05,0,0,false);rig.bow=true;return rig},
  sword(u,tm){const rig=human({body:m3Plain(0x9aa1ab,.4,{metalness:.55}),legs:cloth(0x59606a),belt:tm}),R=armHand(rig,1),L=armHand(rig,0);
    put(rig.g,new THREE.SphereGeometry(.3,12,10,0,6.283,0,1.7),metal(),.02,2.08,0);put(rig.g,new THREE.ConeGeometry(.07,.4,6),tm,-.1,2.52,0);
    put(rig.g,new THREE.BoxGeometry(.3,.62,.4),tm,.05,1.4,0).scale.set(.9,1,1.15);
    const sw=new THREE.Group();put(sw,new THREE.BoxGeometry(.07,1.15,.03),metal(),0,.7,0);put(sw,new THREE.BoxGeometry(.3,.06,.06),m3Plain(0xc9a24e),0,.12,0);R.add(sw);sw.rotation.z=.2;
    const sh=put(L,cyl(.48,.48,.07,16),m3TeamL(u.team),.2,0,.05);sh.rotation.x=Math.PI/2;return rig},
  crossbow(u,tm){const rig=human({body:m3Plain(0x8a6a3e),legs:cloth(0x4a3a2a),belt:tm}),R=armHand(rig,1);
    put(rig.g,new THREE.SphereGeometry(.29,10,8,0,6.283,0,1.5),m3Plain(0x8f959d,.4,{metalness:.5}),0,2.1,0);put(rig.g,cyl(.4,.4,.05,12),m3Plain(0x6a7078,.4,{metalness:.5}),0,2.0,0);
    put(rig.g,new THREE.BoxGeometry(.3,.6,.4),tm,.05,1.4,0).scale.set(.9,1,1.15);
    const cb=new THREE.Group();put(cb,new THREE.BoxGeometry(.9,.1,.1),woodD(),.3,0,0);put(cb,new THREE.BoxGeometry(.1,.1,.95),woodD(),.7,0,0);R.add(cb);cb.position.set(.15,.1,0);return rig},
  musket(u,tm){const rig=human({body:tm,legs:cloth(0xe8e4d8),belt:m3Plain(0xf3efe4)}),R=armHand(rig,1);
    put(rig.g,new THREE.BoxGeometry(.5,.22,.7),m3Plain(0x2f3238),0,2.22,0);put(rig.g,cyl(.3,.34,.1,8),m3Plain(0x2f3238),0,2.15,0);
    for(const s of[-1,1])put(rig.g,new THREE.BoxGeometry(.03,.8,.03),m3Plain(0xf3efe4),.31,1.45,0).rotation.x=s*.5;
    const mu=new THREE.Group();put(mu,cyl(.025,.025,1.5,6),m3Plain(0x4a4a50,.4,{metalness:.5}),0,.7,0);put(mu,new THREE.BoxGeometry(.12,.55,.1),m3Plain(0x7a5535),0,.1,0);R.add(mu);mu.rotation.z=1.2;mu.position.set(.1,0,0);return rig},
  knight(u,tm){const g=new THREE.Group(),rig={g,legs:[],arms:[],tools:{},horse:true};
    const hm=m3Plain(0x7a5a3a,.8),hd=m3Plain(0x3f2c1a,.9);
    put(g,new THREE.CapsuleGeometry(.5,1.5,4,10),hm,0,1.45,0).rotation.z=Math.PI/2;
    put(g,cyl(.2,.3,1.1,8),hm,1.15,2.05,0).rotation.z=-.65;const hh=put(g,new THREE.BoxGeometry(.75,.34,.32),hm,1.7,2.55,0);hh.rotation.z=-.3;put(g,new THREE.BoxGeometry(.1,.5,.06),hd,1.0,2.35,0).rotation.z=-.65;
    for(const[x,z]of[[-.8,-.28],[-.8,.28],[.85,-.28],[.85,.28]]){const p=limbPivot(g,x,1.1,z);put(p,cyl(.1,.07,1.1,6),m3Plain(0x5b4228),0,-.55,0);rig.legs.push(p)}
    put(g,new THREE.BoxGeometry(1.5,.08,1.0),tm,0,1.95,0);put(g,new THREE.BoxGeometry(1.5,.12,.06),m3TeamL(u.team),0,1.62,.5);
    put(g,new THREE.ConeGeometry(.12,.5,5),hd,-1.55,1.4,0).rotation.z=1.9;
    const r=new THREE.Group();r.position.set(0,1.95,0);g.add(r);const rg=human({body:m3Plain(0xaab1ba,.35,{metalness:.6}),legs:metal(),belt:tm});rg.legs.forEach(l=>{l.rotation.z=1.3});rg.g.scale.setScalar(.8);r.add(rg.g);rg.g.position.y=-.1;
    put(rg.g,new THREE.SphereGeometry(.3,12,10,0,6.283,0,1.8),metal(),.02,2.08,0);put(rg.g,new THREE.ConeGeometry(.07,.45,6),tm,-.1,2.55,0).rotation.z=.3;
    const R=armHand(rg,1);const lance=new THREE.Group();put(lance,cyl(.035,.035,3.6,6),wood(),0,1.3,0);put(lance,cone(.1,.5,6),metal(),0,3.3,0);put(lance,new THREE.PlaneGeometry(.5,.3),new THREE.MeshStandardMaterial({color:TC[u.team],side:THREE.DoubleSide}),.25,2.8,0);R.add(lance);lance.rotation.z=1.25;lance.position.set(.1,0,0);
    const L=armHand(rg,0);const sh=put(L,cyl(.45,.45,.07,16),m3TeamL(u.team),.2,0,.05);sh.rotation.x=Math.PI/2;
    rig.rider=rg;return rig},
  cannon(u,tm){const g=new THREE.Group(),rig={g,legs:[],arms:[],wheels:[]};
    put(g,new THREE.BoxGeometry(2.4,.3,.9),m3Plain(0x6b4f31),0,.8,0);
    for(const z of[-.55,.55]){const w=put(g,cyl(.65,.65,.15,16),m3Plain(0x5b4228),.1,.65,z);w.rotation.x=Math.PI/2;for(let i=0;i<4;i++)put(w,new THREE.BoxGeometry(.08,1.3,.1),woodD(),0,0,0).rotation.z=i*.785;rig.wheels.push(w)}
    const tube=new THREE.Group();tube.position.set(.1,1.25,0);g.add(tube);rig.barrel=tube;const b=put(tube,cyl(.3,.38,2.2,14),darkM(),0,0,0);b.rotation.z=-Math.PI/2;put(tube,cyl(.34,.34,.12,14),m3Plain(0x25262b,.5,{metalness:.6}),.6,0,0).rotation.z=-Math.PI/2;put(tube,new THREE.SphereGeometry(.38,12,10),darkM(),-1.1,0,0);
    put(g,new THREE.BoxGeometry(.9,.15,.9),m3Plain(0x6b4f31),-.9,.62,0).rotation.z=.25;flagPole(g,-1.1,.9,.5,1.1,u.team);return rig},
  ram(u,tm){const g=new THREE.Group(),rig={g,legs:[],arms:[],wheels:[]};
    for(const x of[-.9,.9])for(const z of[-.6,.6]){const w=put(g,cyl(.4,.4,.14,12),m3Plain(0x5b4228),x,.4,z);w.rotation.x=Math.PI/2;rig.wheels.push(w)}
    put(g,new THREE.BoxGeometry(2.6,.2,1.5),m3Plain(0x6b4f31),0,.65,0);
    for(const x of[-1.1,1.1])for(const z of[-.65,.65])put(g,cyl(.07,.07,1.3,6),woodD(),x,1.25,z);
    gab(g,0,1.9,0,2.6,1.7,.7,m3Plain(0x7a5a3a),m3Mat('planks',0x7a5a3a),.15);
    const log=new THREE.Group();log.position.y=1.05;g.add(log);rig.log=log;const lg=put(log,cyl(.28,.28,3.3,10),m3Plain(0x6b4f31),0,0,0);lg.rotation.z=Math.PI/2;put(log,cone(.34,.55,10),metal(),1.85,0,0).rotation.z=-Math.PI/2;
    put(g,new THREE.BoxGeometry(.04,.5,1.3),tm,-1.35,1.4,0);return rig},
  catapult(u,tm){const g=new THREE.Group(),rig={g,legs:[],arms:[],wheels:[]};
    for(const z of[-.7,.7]){const w=put(g,cyl(.5,.5,.14,12),m3Plain(0x5b4228),.0,.5,z);w.rotation.x=Math.PI/2;rig.wheels.push(w)}
    put(g,new THREE.BoxGeometry(2.2,.2,1.1),m3Plain(0x7a5a3a),0,.75,0);
    for(const z of[-.45,.45]){put(g,cyl(.07,.07,1.5,6),woodD(),-.1,1.5,z).rotation.z=.18}
    const arm=new THREE.Group();arm.position.set(-.2,1.9,0);g.add(arm);rig.arm=arm;put(arm,cyl(.07,.07,2.6,6),woodD(),1.0,0,0).rotation.z=Math.PI/2;put(arm,new THREE.SphereGeometry(.3,10,8),m3Plain(0x8d8a82),2.2,0,0);put(arm,new THREE.BoxGeometry(.5,.12,.5),woodD(),2.2,-.15,0);
    put(g,new THREE.BoxGeometry(.1,.7,1.4),tm,-1.0,1.1,0);return rig}
};
function ship(u,tm,war,big){const g=new THREE.Group(),rig={g,legs:[],arms:[],ship:true},S=big?1.5:1,hm=m3Mat('planks',war?0x6b5236:0x9a6c3c);
  const L=2.6*S;const hull=new THREE.Shape();hull.moveTo(-L,0);hull.lineTo(-L*.8,-.6*S);hull.lineTo(L*.8,-.6*S);hull.lineTo(L*1.25,.35*S);hull.lineTo(L*1.0,.5*S);hull.lineTo(-L*.9,.5*S);hull.closePath();
  const hg=new THREE.ExtrudeGeometry(hull,{depth:1.5*S,bevelEnabled:true,bevelSize:.12,bevelThickness:.12,bevelSegments:2});hg.translate(0,0,-.75*S);uvScale(hg,.4);put(g,hg,hm,0,.55*S,0);
  put(g,new THREE.BoxGeometry(L*1.6,.1,.1),tm,0,1.1*S,.78*S);put(g,new THREE.BoxGeometry(L*1.6,.1,.1),tm,0,1.1*S,-.78*S);
  const mast=put(g,cyl(.07,.09,war||big?4.6*S:3.8*S,6),woodD(),.2*S,2.9*S,0);
  const sail=put(g,new THREE.PlaneGeometry(2.0*S,2.4*S,6,1),new THREE.MeshStandardMaterial({color:war?0xe9e1cc:0xf1e7cf,side:THREE.DoubleSide,roughness:.9}),.25*S,3.1*S,0);sail.castShadow=true;rig.sail=sail;
  put(g,new THREE.PlaneGeometry(1.0*S,.9*S),new THREE.MeshStandardMaterial({color:TC[u.team],side:THREE.DoubleSide}),.25*S,3.5*S,.02);
  if(war||big){for(let i=0;i<(big?4:3);i++)for(const z of[-1,1])put(g,cyl(.1,.1,.7,8),darkM(),-L*.5+i*L*.5,1.25*S,z*.82*S).rotation.x=Math.PI/2}
  else{put(g,new THREE.SphereGeometry(.4,8,6),m3Plain(0xcfe6ee),-.8,1.3,0).scale.set(1.4,.5,1)}
  return rig}
UNIT3.boat=(u,tm)=>ship(u,tm,false,false);UNIT3.warship=(u,tm)=>ship(u,tm,true,false);UNIT3.galleon=(u,tm)=>ship(u,tm,true,true);

/* Vierbeiner: o = {col,belly,dark,br (Rumpfradius),bl (Rumpflänge),legH,lw (Beinbreite),hr (Kopfradius),neck:[x,y],snout,ears,tail}. Blickt in +x. */
function quad(o){
  const g=new THREE.Group(),rig={g,legs:[]},m=m3Plain(o.col,.9),mb=m3Plain(o.belly||o.col,.9),dk=m3Plain(o.dark||0x2a2119,.9),by=o.legH+o.br*.85;
  put(g,new THREE.CapsuleGeometry(o.br,o.bl,4,10),m,0,by,0).rotation.z=Math.PI/2;
  put(g,new THREE.CapsuleGeometry(o.br*.78,o.bl*.9,4,8),mb,0,by-o.br*.3,0).rotation.z=Math.PI/2;
  if(o.hump)put(g,new THREE.SphereGeometry(o.br*.95,10,8),m,o.bl*.28,by+o.br*.45,0);
  const hipY=o.legH+o.br*.35;
  for(const[x,z]of[[-o.bl*.5,-o.br*.6],[-o.bl*.5,o.br*.6],[o.bl*.5,-o.br*.6],[o.bl*.5,o.br*.6]]){const p=limbPivot(g,x,hipY,z);put(p,cyl(o.lw,o.lw*.75,hipY,6),m,0,-hipY/2,0);put(p,new THREE.SphereGeometry(o.lw*1.05,6,5),dk,.02,-hipY+o.lw*.4,0);rig.legs.push(p)}
  const nx=o.bl/2+o.br*.5,hx=nx+o.neck[0],hy=by+o.neck[1];
  const neck=put(g,cyl(o.br*.5,o.br*.62,Math.hypot(o.neck[0],o.neck[1])+o.br*.4,8),m,nx+o.neck[0]/2,by+o.neck[1]/2,0);neck.rotation.z=-Math.atan2(o.neck[0],o.neck[1]);
  const head=new THREE.Group();head.position.set(hx,hy,0);g.add(head);rig.head=head;
  put(head,new THREE.SphereGeometry(o.hr,12,10),m,0,0,0);
  const sn=put(head,new THREE.BoxGeometry(o.hr*1.5*(o.snout||1),o.hr*.7,o.hr*.8),o.snoutCol?m3Plain(o.snoutCol):m,o.hr*1.0*(o.snout||1),-o.hr*.2,0);put(head,new THREE.SphereGeometry(o.hr*.2,6,6),dk,o.hr*1.7*(o.snout||1),-o.hr*.15,0);
  for(const z of[-1,1]){put(head,new THREE.SphereGeometry(o.hr*.11,6,6),m3Plain(0x15110c),o.hr*.7,o.hr*.25,z*o.hr*.45,false);put(head,cone(o.hr*.35,o.hr*(o.earLen||.9),5),o.earCol?m3Plain(o.earCol):m,-o.hr*.2,o.hr*.95,z*o.hr*.55).rotation.x=z*.2}
  if(o.antlers)for(const z of[-1,1]){const base=put(head,cyl(.03,.04,o.hr*1.8,5),m3Plain(0xc9b690),-o.hr*.1,o.hr*1.9,z*o.hr*.5);base.rotation.x=z*.35;for(const k of[.4,.8]){const br=put(head,cyl(.025,.03,o.hr*1.1,5),m3Plain(0xc9b690),o.hr*(k*.2),o.hr*(1.3+k),z*o.hr*(.6+k*.5));br.rotation.z=-.7;br.rotation.x=z*.5}}
  const tl=put(g,cone(o.br*.35,o.bl*(o.tail||.5),6),o.tailCol?m3Plain(o.tailCol):m,-o.bl/2-o.br*.7,by+o.br*.15,0);tl.rotation.z=Math.PI/2+.5;
  if(o.stripes)for(let i=0;i<7;i++){const x=-o.bl*.45+i*(o.bl*.9/6);put(g,new THREE.BoxGeometry(o.br*.28,o.br*1.5,o.br*2.1),dk,x,by+o.br*.05,0,false).rotation.z=(i%2?.12:-.12)}
  if(o.spots)for(let i=0;i<8;i++){put(g,new THREE.SphereGeometry(o.br*.16,6,5),m3Plain(0xe8dcc0),-o.bl*.4+(i%4)*o.bl*.27,by+o.br*.7,(i<4?-1:1)*o.br*.3,false)}
  return rig}
const ANI3={
  deer:{col:0xa87a4b,belly:0xd8c19a,dark:0x3a2a1a,br:.34,bl:.85,legH:.85,lw:.075,hr:.2,neck:[.45,.85],snout:1.2,earLen:.8,antlers:true,spots:true,tail:.18,tailCol:0xf3ead6,earCol:0xc39b6a},
  wolf:{col:0x7d7f84,belly:0xc9c9c6,dark:0x222428,br:.29,bl:.75,legH:.52,lw:.07,hr:.2,neck:[.35,.3],snout:1.3,earLen:.7,tail:.8,tailCol:0x6a6c70},
  bear:{col:0x5b3f2a,belly:0x4a3322,dark:0x1c130c,br:.55,bl:1.0,legH:.5,lw:.14,hr:.31,neck:[.5,.3],snout:.8,earLen:.4,hump:true,tail:.15,snoutCol:0x8a6a4a},
  tiger:{col:0xd9822b,belly:0xf1dcb5,dark:0x1d1510,br:.34,bl:1.1,legH:.58,lw:.1,hr:.25,neck:[.45,.28],snout:.9,earLen:.5,stripes:true,tail:.9,tailCol:0xd9822b}
};
/* Stromlinienkörper für Wale und Delfine: Drehkörper mit dickem Kopf und dünnem Schwanz, oben dunkel, unten hell. Nase zeigt nach +x. */
function swimBody(L,R,topC,botC){const N=20,pts=[];for(let i=N;i>=0;i--){const u=i/N,y=L/2-u*L;pts.push(new THREE.Vector2(R*Math.pow(Math.sin(Math.PI*Math.pow(u,.7)),.75)*(1-.45*u)+.002,y))}
  const g=new THREE.LatheGeometry(pts,16);g.rotateZ(-Math.PI/2);const n=g.attributes.normal,col=new Float32Array(n.count*3),a=new THREE.Color(topC),b=new THREE.Color(botC),c=new THREE.Color();
  for(let i=0;i<n.count;i++){c.copy(a).lerp(b,Math.max(0,Math.min(1,.35-n.getY(i)*1.4)));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(col,3));return g}
function buildAnimal(e){const rig=quad(ANI3[e.type]||ANI3.deer);setShadows(rig.g);rig.g.scale.setScalar(e.type==='bear'?1.15:1.1);return rig}
function buildUnit(u){const f=UNIT3[u.type]||UNIT3.worker,tm=m3Team(u.team),rig=f(u,tm);setShadows(rig.g);return rig}

/* ---------- Ressourcen ---------- */
function rockGeo(seed){const g=new THREE.IcosahedronGeometry(1,2),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+Math.sin(x*3.1+seed*13)*.13+Math.cos(z*2.7+seed*7)*.1+Math.sin(y*4.3+x*1.7)*.07;p.setXYZ(i,x*n,Math.max(y*n*.8,-.15),z*n)}g.computeVertexNormals();return g}
/* Mehrere Formen mit je einer Farbe zu einer Geometrie verschmelzen (für Instanzen) */
function mergeColored(parts){let n=0;const gs=parts.map(([g,c])=>{const q=g.index?g.toNonIndexed():g;n+=q.attributes.position.count;return[q,new THREE.Color(c)]});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const[g,c]of gs){const m=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);for(let i=0;i<m;i++){col[(o+i)*3]=c.r;col[(o+i)*3+1]=c.g;col[(o+i)*3+2]=c.b}o+=m}
  const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(pos,3));r.setAttribute('normal',new THREE.BufferAttribute(nor,3));r.setAttribute('color',new THREE.BufferAttribute(col,3));return r}
const tr3=(g,x,y,z)=>{g.translate(x,y,z);return g};
function treeGeo(pine){
  if(pine){const T=cyl(.2,.32,2.2,6);T.translate(0,1.1,0);return mergeColored([[T,0x5b4228],...[[2.0,2.6,2.5,0x2a5a33],[1.55,2.4,3.9,0x35744a],[1.0,2.1,5.2,0x479a58]].map(([r,h,y,c])=>[tr3(new THREE.ConeGeometry(r,h,9),0,y,0),c])])}
  const T=cyl(.24,.38,2.5,6);T.translate(0,1.25,0);const bl=(r,x,y,z,s,c)=>{const b=new THREE.IcosahedronGeometry(r,1),p=b.attributes.position;for(let i=0;i<p.count;i++){const k=1+Math.sin(i*12.9+s)*.14;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*.88,p.getZ(i)*k)}b.computeVertexNormals();b.translate(x,y,z);return[b,c]};
  return mergeColored([[T,0x5b4228],bl(1.6,0,3.5,0,1,0x2e6b33),bl(1.15,.9,2.9,.5,2,0x3a7d3b),bl(1.1,-.8,3.0,-.5,3,0x2e6b33),bl(1.0,.1,4.6,.2,4,0x58a04a)])}
function bushGeoC(){const bl=(r,x,y,z,c)=>{const b=new THREE.IcosahedronGeometry(r,1);b.translate(x,y,z);return[b,c]};const parts=[bl(.8,-.5,.55,0,0x3a6a2c),bl(.8,.5,.55,.2,0x3a6a2c),bl(.9,0,.95,-.2,0x467c33)];
  for(let i=0;i<13;i++){const a=i*2.4;parts.push(bl(.17,Math.cos(a)*(.7+(i%3)*.12),.45+(i%4)*.22,Math.sin(a)*(.65+(i%3)*.1),i%5===0?0xf5d54a:0xee2d45))}return mergeColored(parts)}
function rockGeoC(iron,seed){const g=rockGeo(seed).toNonIndexed();g.computeVertexNormals();const p=g.attributes.position,col=new Float32Array(p.count*3),base=new THREE.Color(iron?0x5a6780:0x9d998e),moss=new THREE.Color(iron?0x4b5870:0x7f8a62),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i),n=.86+.2*Math.sin(p.getX(i)*5+p.getZ(i)*3+seed*4);c.copy(base).multiplyScalar(n);if(y>.45)c.lerp(moss,Math.min(1,(y-.45)*1.3)*.55);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  if(!iron)return g;
  const parts=[[g,0xffffff]],out=[g];for(let i=0;i<7;i++){const a=i*1.9+seed*9,b=new THREE.IcosahedronGeometry(.12,0);b.translate(Math.cos(a)*.78,.3+((i*37)%10)/14,Math.sin(a)*.78);out.push(b)}
  const ore=mergeColored(out.slice(1).map(b=>[b,0xf0903a])),all=new THREE.BufferGeometry(),pa=[g.attributes.position.array,ore.attributes.position.array],na=[g.attributes.normal.array,ore.attributes.normal.array],ca=[g.attributes.color.array,ore.attributes.color.array];
  const cat=arr=>{let n=0;arr.forEach(a=>n+=a.length);const r=new Float32Array(n);let o=0;arr.forEach(a=>{r.set(a,o);o+=a.length});return r};
  all.setAttribute('position',new THREE.BufferAttribute(cat(pa),3));all.setAttribute('normal',new THREE.BufferAttribute(cat(na),3));all.setAttribute('color',new THREE.BufferAttribute(cat(ca),3));return all}
