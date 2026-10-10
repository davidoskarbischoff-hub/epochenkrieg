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
  fur:(x,w,h)=>{x.fillStyle=gray(200);x.fillRect(0,0,w,h);for(let i=0;i<700;i++){x.strokeStyle=gray(120+m3rnd()*130);x.lineWidth=1;const px=m3rnd()*w,py=m3rnd()*h;x.beginPath();x.moveTo(px,py);x.lineTo(px+(m3rnd()-.5)*4,py+3+m3rnd()*5);x.stroke()}},
  cloth:(x,w,h)=>{x.fillStyle=gray(215);x.fillRect(0,0,w,h);for(let i=0;i<w;i+=2){x.fillStyle=`rgba(0,0,0,${.07+m3rnd()*.09})`;x.fillRect(i,0,1,h)}for(let j=0;j<h;j+=2){x.fillStyle=`rgba(255,255,255,${.05+m3rnd()*.08})`;x.fillRect(0,j,w,1)}
    for(let i=0;i<60;i++){x.fillStyle=`rgba(40,30,20,${m3rnd()*.1})`;x.beginPath();x.arc(m3rnd()*w,m3rnd()*h,2+m3rnd()*7,0,6.283);x.fill()}},
  leather:(x,w,h)=>{x.fillStyle=gray(205);x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=`rgba(0,0,0,${m3rnd()*.14})`;const r=1+m3rnd()*3;x.beginPath();x.ellipse(m3rnd()*w,m3rnd()*h,r*1.4,r,m3rnd()*3,0,6.283);x.fill()}
    x.strokeStyle='rgba(30,20,10,.25)';for(let i=0;i<40;i++){x.beginPath();const px=m3rnd()*w,py=m3rnd()*h;x.moveTo(px,py);x.lineTo(px+(m3rnd()-.5)*30,py+(m3rnd()-.5)*30);x.stroke()}},
  scratch:(x,w,h)=>{x.fillStyle=gray(214);x.fillRect(0,0,w,h);for(let i=0;i<260;i++){const v=m3rnd()<.5?60:255;x.strokeStyle=`rgba(${v},${v},${v},${.05+m3rnd()*.22})`;x.lineWidth=.6+m3rnd();x.beginPath();const px=m3rnd()*w,py=m3rnd()*h,l=6+m3rnd()*34,a=m3rnd()<.7?.15:m3rnd()*3;x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
    for(let i=0;i<30;i++){x.fillStyle=`rgba(0,0,0,${.05+m3rnd()*.1})`;x.beginPath();x.arc(m3rnd()*w,m3rnd()*h,2+m3rnd()*9,0,6.283);x.fill()}},
  rust:(x,w,h)=>{x.fillStyle='rgb(150,150,150)';x.fillRect(0,0,w,h);for(let i=0;i<150;i++){const r=3+m3rnd()*16,g=x.createRadialGradient(m3rnd()*w,m3rnd()*h,0,m3rnd()*w,m3rnd()*h,r);const px=m3rnd()*w,py=m3rnd()*h,gg=x.createRadialGradient(px,py,0,px,py,r);gg.addColorStop(0,`rgba(${m3rnd()<.5?'160,90,50':'60,50,45'},${.25+m3rnd()*.3})`);gg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gg;x.fillRect(px-r,py-r,2*r,2*r)}
    for(let i=0;i<200;i++){x.fillStyle=`rgba(255,255,255,${m3rnd()*.1})`;x.fillRect(m3rnd()*w,m3rnd()*h,1+m3rnd()*3,1)}},
  camo:(x,w,h)=>{x.fillStyle='rgb(92,102,76)';x.fillRect(0,0,w,h);const cols=['rgb(70,78,56)','rgb(122,108,70)','rgb(52,58,44)','rgb(104,114,84)'];for(let i=0;i<46;i++){x.fillStyle=cols[i%4];x.beginPath();const px=m3rnd()*w,py=m3rnd()*h,r=8+m3rnd()*22;x.ellipse(px,py,r*1.5,r,m3rnd()*3,0,6.283);x.fill()}
    for(let i=0;i<260;i++){x.fillStyle=`rgba(20,16,10,${m3rnd()*.14})`;const r=1+m3rnd()*4;x.beginPath();x.arc(m3rnd()*w,m3rnd()*h,r,0,6.283);x.fill()}
    for(let i=0;i<90;i++){x.fillStyle=`rgba(200,200,190,${.08+m3rnd()*.15})`;x.fillRect(m3rnd()*w,m3rnd()*h,1+m3rnd()*5,1)}},
  dirt:(x,w,h)=>{x.fillStyle=gray(215);x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=`rgba(70,50,30,${m3rnd()*.2})`;const r=1+m3rnd()*4;x.beginPath();x.arc(m3rnd()*w,m3rnd()*h,r,0,6.283);x.fill()}}
};
function m3Tex(kind){return M3.tex[kind]||(M3.tex[kind]=m3Canvas(256,256,(x,w,h)=>TEXGEN[kind](x,w,h)))}
/* Material mit Muster (kind) und Farbe */
function m3Mat(kind,color,o){const key=kind+color+(o?JSON.stringify(o):'');if(M3.mat[key])return M3.mat[key];
  const p={color:new THREE.Color(color),roughness:.9,metalness:0,...(o||{})};if(M3.env&&p.metalness>.3){p.envMap=M3.env;p.envMapIntensity=.7}if(kind){const t=m3Tex(kind);p.map=t;p.bumpMap=t;p.bumpScale=.9}
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
/* Abgerundeter Quader (Platten, Kästen): Rundung r, ergibt weichere Kanten als eine harte Kiste */
function rbox(w,h,d,r=.05){r=Math.min(r,w/2.2,h/2.2,d/2.2);const s=new THREE.Shape(),a=w/2-r,b=h/2-r;s.moveTo(-a,-b-r);s.lineTo(a,-b-r);s.quadraticCurveTo(a+r,-b-r,a+r,-b);s.lineTo(a+r,b);s.quadraticCurveTo(a+r,b+r,a,b+r);s.lineTo(-a,b+r);s.quadraticCurveTo(-a-r,b+r,-a-r,b);s.lineTo(-a-r,-b);s.quadraticCurveTo(-a-r,-b-r,-a,-b-r);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r*.9,bevelSize:r*.9,bevelSegments:2,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return g}
const put=(g,geo,m,x=0,y=0,z=0,shadow=true)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;g.add(o);return o};
/* Satteldach: First entlang x, Breite w (x), Tiefe d (z), Höhe h; [Giebelmaterial, Dachmaterial] */
function gable(w,d,h,gm,rm,ov=.25){const s=new THREE.Shape();s.moveTo(-d/2-ov,0);s.lineTo(d/2+ov,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:w+ov*2,bevelEnabled:false});g.translate(0,0,-(w+ov*2)/2);g.rotateY(Math.PI/2);uvScale(g,.5);
  const m=new THREE.Mesh(g,[gm,rm]);m.castShadow=true;m.receiveShadow=true;return m}
const cone=(r,h,s=10)=>new THREE.ConeGeometry(r,h,s);
const gab=(g,x,y,z,...a)=>{const m=gable(...a);m.position.set(x,y,z);g.add(m);return m};
function setShadows(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o}

/* ---------- Gebäude ----------
   Stil je Epoche: Wand-/Dachmuster; Farben kommen aus MAT[ep] (data.js). */
const STY=[{w:'planks',r:'thatch'},{w:'planks',r:'thatch'},{w:'stone',r:'shingle'},{w:'stone',r:'tiles'},{w:'brick',r:'tiles'},{w:'brick',r:'tiles'}];
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
  farm(R,st,team){const g=new THREE.Group(),soil=m3Mat('dirt',0x6a4a2c),crop=[0x5a9a3a,0x7ab04a,0xc8b44a][Math.min(2,Math.max(0,st.ep-1))];
    put(g,bx(R*2.1,.14,R*2.1,2),soil,0,.07,0);
    for(let i=-3;i<=3;i++){const r=put(g,new THREE.BoxGeometry(R*1.9,.22+(i%2?.06:0),.34),m3Plain(i%2?crop:0x4a8a30,.9),0,.2,i*R*.27);r.castShadow=false;
      for(let k=0;k<5;k++)put(g,cone(.1,.34,5),m3Plain(crop,.8),-R*.8+k*R*.4,.42,i*R*.27,false)}
    for(const x of[-1,1])for(const z of[-1,1])put(g,cyl(.06,.06,.5,5),woodD(),x*R*1.05,.25,z*R*1.05);
    const s=put(g,cyl(.05,.05,1.1,5),woodD(),R*.9,.55,-R*.9);put(g,new THREE.BoxGeometry(.9,.07,.07),woodD(),R*.9,.95,-R*.9);put(g,new THREE.SphereGeometry(.17,8,6),m3Plain(0xd9c28a),R*.9,1.2,-R*.9);
    g.userData.h=1.4;return g},
  mine(R,st,team){const g=new THREE.Group(),rock=m3Mat('stone',0x7a766c);
    const m=put(g,new THREE.SphereGeometry(R*1.2,10,8,0,6.283,0,1.57),rock,0,0,-R*.3);m.scale.set(1.2,.9,1);
    put(g,new THREE.BoxGeometry(R*.18,R*.9,R*.18),woodD(),-R*.45,R*.45,R*.62);put(g,new THREE.BoxGeometry(R*.18,R*.9,R*.18),woodD(),R*.45,R*.45,R*.62);put(g,new THREE.BoxGeometry(R*1.2,R*.18,R*.2),woodD(),0,R*.95,R*.62);
    put(g,new THREE.BoxGeometry(R*.7,R*.8,.1),m3Plain(0x120d08),0,R*.4,R*.55,false);
    for(const z of[-.6,.6])put(g,new THREE.BoxGeometry(.08,.06,R*1.6),m3Plain(0x3a3b42,.5,{metalness:.5}),z*R*.3,.05,R*1.4);
    const c=put(g,new THREE.BoxGeometry(R*.6,R*.35,R*.4),m3Mat('planks',0x8a6a42),R*.1,R*.28,R*1.5);put(c,new THREE.DodecahedronGeometry(R*.2,0),m3Plain(st.ep>=3?0xf7d64a:0x5a6780,.5),0,R*.22,0);
    flagPole(g,R*.9,R*.4,0,R*1.1,team);g.userData.h=R*1.6;return g},
  market(R,st,team){const g=new THREE.Group();
    put(g,bx(R*2.4,.18,R*1.8,2),st.base,0,.09,0);
    const cols=[0xc84b3a,0xe8dfc8,0x3d72b8];
    for(let i=0;i<3;i++){const x=(i-1)*R*.8;
      for(const dx of[-1,1])put(g,cyl(.05,.05,R*.9,5),woodD(),x+dx*R*.34,R*.5,-R*.3);
      const aw=put(g,new THREE.BoxGeometry(R*.76,.08,R*.8),m3Plain(cols[i],.8),x,R*.95,-R*.05);aw.rotation.x=.25;
      put(g,new THREE.BoxGeometry(R*.7,R*.35,R*.4),m3Mat('planks',0x8a6a42),x,R*.2,-R*.1);
      put(g,new THREE.SphereGeometry(R*.14,8,6),m3Plain([0xd9a441,0xc84b3a,0x8aa84a][i],.6),x-R*.15,R*.43,-R*.1);put(g,new THREE.SphereGeometry(R*.12,8,6),m3Plain([0xe6c35a,0xe6c35a,0xf1e7cf][i],.4),x+R*.15,R*.42,-R*.1)}
    for(let i=0;i<2;i++)put(g,cyl(R*.2,R*.2,R*.4,10),m3Mat('planks',0x8d6a3e),-R*1.0+i*.2,R*.2,R*.6);
    put(g,cyl(.18,.18,.12,10),goldM(),R*1.0,R*.35,R*.6);put(g,cyl(.18,.18,.12,10),goldM(),R*1.0,R*.47,R*.6);put(g,cyl(.18,.18,.12,10),goldM(),R*1.0,R*.59,R*.6);
    flagPole(g,0,R*.9,R*.5,R*1.2,team);g.userData.h=R*1.8;return g},
  wall(R,st,team){const g=new THREE.Group(),L=R*2.3,ep=st.ep;
    if(ep<=2){ /* Holzpalisade: angespitzte Stämme mit Querbalken und Schnüren */
      const H=R*1.7,n=6,lg=m3Mat('planks',ep===1?0x8a6a42:0x7a5a3a);for(let i=0;i<n;i++){const x=-L/2+L*(i+.5)/n,h=H*(.9+.18*((i*7)%3)/2);put(g,cyl(.15,.17,h,7),lg,x,h/2,0);put(g,cone(.15,.34,7),lg,x,h+.15,0)}
      for(const y of[H*.3,H*.68])put(g,new THREE.BoxGeometry(L,.1,.1),woodD(),0,y,.17);
      for(let i=0;i<n;i++)put(g,new THREE.TorusGeometry(.17,.02,5,8),m3Plain(0xb59a68,.9),-L/2+L*(i+.5)/n,H*.5,0).rotation.x=Math.PI/2;
      g.userData.h=H+.5}
    else if(ep<=4){ /* Steinmauer (Mittelalter) / Ziegelmauer mit Pfeilern (Renaissance) */
      const sm=ep===3?m3Mat('stone',MAT[3].wall):m3Mat('brick',MAT[4].wall),H=R*1.8;put(g,rbox(L,H,R*.95,.06),sm,0,H/2,0);put(g,rbox(L*1.03,.22,R*1.1,.05),st.base,0,H+.05,0);put(g,rbox(L*1.04,.3,R*1.15,.05),st.base,0,.12,0,false);
      if(ep===3)for(let i=0;i<3;i++)put(g,new THREE.BoxGeometry(L*.22,.38,R*.95),sm,(i-1)*L*.36,H+.3,0);
      else for(const x of[-L/2,L/2])put(g,rbox(.34,H+.3,R*1.15,.05),m3Mat('brick',0x9a4a3a),x,(H+.3)/2,0);
      g.userData.h=H+.5}
    else{ /* Industriezeit: Panzersperren (Stahlträger-Igel) und Stacheldraht */
      const st2=m3Mat('scratch',0x6a6e74,{roughness:.5,metalness:.7}),con=m3Mat('scratch',0x8a8a84,{roughness:.9});
      for(const x of[-L*.28,L*.28]){const ig=new THREE.Group();ig.position.set(x,.5,0);g.add(ig);for(const [rx,ry,rz] of[[0,0,.8],[.8,0,0],[0,.8,0]]){const b=put(ig,new THREE.BoxGeometry(1.3,.12,.12),st2,0,0,0);b.rotation.set(rx*1.0,ry*1.0,rz*1.0)}}
      for(let k=0;k<3;k++){const c=put(g,new THREE.TorusGeometry(.22,.012,5,10),m3Plain(0x3a3b3a,.5,{metalness:.8}),-L*.4+k*L*.4,.3,0);c.rotation.y=1.57;c.scale.set(1,1,1.6)}
      put(g,new THREE.BoxGeometry(L,.05,.05),st2,0,.2,.0);for(const x of[-L/2,L/2])put(g,cyl(.04,.04,.7,5),st2,x,.35,0);
      for(let i=0;i<4;i++)put(g,new THREE.SphereGeometry(.3,7,5),m3Plain(0xb8a578,.95),-L*.35+i*L*.23,.14,R*.5).scale.set(1,.5,.8);
      g.userData.h=1.3}
    return g},
  gate(R,st,team){const g=new THREE.Group(),ep=st.ep,L=R*2.4;
    if(ep<=2){const H=R*2.1,lg=m3Mat('planks',0x7a5a3a);for(const x of[-L/2,L/2])put(g,cyl(.2,.24,H,8),lg,x,H/2,0);put(g,new THREE.BoxGeometry(L+.6,.24,.3),woodD(),0,H,0);
      for(const s of[-1,1]){const d=put(g,new THREE.BoxGeometry(L*.42,H*.8,.1),m3Mat('planks',0x5a4028),s*(L/2+.1),H*.42,-.55);d.rotation.y=s*1.1}
      put(g,cone(.22,.5,7),lg,-L/2,H+.3,0);put(g,cone(.22,.5,7),lg,L/2,H+.3,0);flagPole(g,0,H,0,R*.9,team);g.userData.h=H+R}
    else if(ep<=4){const sm=ep===3?m3Mat('stone',MAT[3].wall):m3Mat('brick',MAT[4].wall),H=R*2.4;for(const x of[-L/2,L/2]){put(g,rbox(.9,H,1.1,.06),sm,x,H/2,0);put(g,rbox(1.1,.3,1.25,.05),st.base,x,H+.1,0)}
      const ar=new THREE.Mesh(new THREE.TorusGeometry(L/2-.05,.2,8,16,Math.PI),sm);ar.position.set(0,H*.62,0);ar.castShadow=true;g.add(ar);put(g,rbox(L+.8,.5,1.1,.05),sm,0,H*.62+L/2+.12,0);
      for(let i=-2;i<=2;i++)put(g,cyl(.035,.035,H*.62,5),m3Plain(0x2a2b2c,.5,{metalness:.7}),i*L*.17,H*.31,0);flagPole(g,0,H*.62+L/2+.3,0,R*1.0,team);g.userData.h=H+R}
    else{const st2=m3Mat('scratch',0x6a6e74,{roughness:.5,metalness:.7});for(const x of[-L/2,L/2]){put(g,cyl(.1,.1,1.3,8),st2,x,.65,0);for(let i=0;i<4;i++)put(g,new THREE.SphereGeometry(.3,7,5),m3Plain(0xb8a578,.95),x+(i%2?.4:-.4)*(x>0?1:-1),.14+Math.floor(i/2)*.26,.55).scale.set(1,.55,.8)}
      const arm=put(g,new THREE.BoxGeometry(L*.95,.1,.1),m3Plain(0xe8e8e8,.6),0,1.2,0);for(let i=0;i<5;i++)put(g,new THREE.BoxGeometry(L*.1,.11,.11),m3Plain(0xc43a2a,.6),-L*.4+i*L*.2,1.2,0);flagPole(g,L/2,1.3,0,R*1.0,team);g.userData.h=2}
    return g},
};
/* Steinzeit: ganz einfache Bauten aus Fell, Holz und Stein */
const PRIM={
  hq(R,st,team){const g=new THREE.Group(),hide=m3Mat('fur',0xa07a50),hide2=m3Mat('fur',0x7a5a38);
    const t=put(g,cone(R*1.25,R*1.9,10),hide,0,R*.95,0);t.scale.set(1.2,1,.9);
    for(let i=0;i<6;i++){const a=i/6*6.283;put(g,cyl(.06,.06,R*2.1,5),woodD(),Math.cos(a)*R*.18,R*1.9,Math.sin(a)*R*.14).rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12)}
    put(g,new THREE.BoxGeometry(R*.5,R*.8,.1),m3Plain(0x1c140c),0,R*.4,R*.82*.9,false);
    for(const s of[-1,1]){const tk=put(g,new THREE.TorusGeometry(R*.4,.07,6,12,Math.PI*.9),m3Plain(0xece4cf,.7),s*R*1.1,R*.4,R*.9);tk.rotation.set(0,0,s>0?1.2:1.9)}
    const tot=new THREE.Group();tot.position.set(-R*1.35,0,R*.6);g.add(tot);put(tot,cyl(.16,.2,R*2.2,8),m3Mat('planks',0x6a4a2a),0,R*1.1,0);
    for(const[y,c]of[[R*.55,0xc84b3a],[R*1.0,0xe8dfc8],[R*1.45,0x3d72b8]]){put(tot,new THREE.BoxGeometry(.55,.32,.4),m3Plain(c),0,y,0);put(tot,new THREE.BoxGeometry(.9,.1,.1),m3Plain(c),0,y+.05,0)}
    put(tot,new THREE.SphereGeometry(.22,8,6),m3Plain(0xe8dfc8),0,R*2.3,0);
    put(g,cyl(R*.35,R*.4,.12,10),m3Plain(0x4a443d,.95),R*.9,.06,R*1.1);for(let i=0;i<7;i++){const a=i/7*6.283;put(g,new THREE.DodecahedronGeometry(.16,0),m3Plain(0x8d8a80,.95),R*.9+Math.cos(a)*R*.38,.14,R*1.1+Math.sin(a)*R*.38)}
    put(g,cone(.18,.5,6),m3Plain(0xf08a2c,.5,{emissive:0xd45a10,emissiveIntensity:.8}),R*.9,.4,R*1.1);
    flagPole(g,R*.3,R*1.9,0,R*1.3,team);g.userData.h=R*3.2;return g},
  house(R,st,team){const g=new THREE.Group(),hide=m3Mat('fur',0xa98558);
    const t=put(g,cone(R*.95,R*1.5,7),hide,0,R*.75,0);
    for(let i=0;i<5;i++){const a=i/5*6.283+.3;put(g,cyl(.05,.05,R*.5,5),woodD(),Math.cos(a)*R*.1,R*1.6,Math.sin(a)*R*.1).rotation.set(Math.sin(a)*.2,0,-Math.cos(a)*.2)}
    put(g,new THREE.BoxGeometry(R*.4,R*.55,.1),m3Plain(0x1c140c),0,R*.28,R*.86,false);
    put(g,new THREE.DodecahedronGeometry(.3,0),m3Plain(0x8d8a80,.95),R*.95,.25,R*.3);g.userData.h=R*1.8;return g},
  store(R,st,team){const g=new THREE.Group();
    for(const x of[-1,1])for(const z of[-1,1])put(g,cyl(.07,.08,R*1.5,6),wood(),x*R*.9,R*.75,z*R*.5).rotation.z=x*.08;
    for(const y of[R*1.2,R*.8])for(const z of[-1,1])put(g,cyl(.05,.05,R*1.9,5),woodD(),0,y,z*R*.5).rotation.z=Math.PI/2;
    for(let i=0;i<4;i++){const h=put(g,new THREE.PlaneGeometry(R*.38,R*.7,1,1),m3Mat('fur',[0xa98558,0x7a5a38,0xc9a878,0x8f6c44][i]),-R*.7+i*R*.47,R*.8,R*.5);h.material=h.material.clone();h.material.side=THREE.DoubleSide}
    put(g,new THREE.SphereGeometry(R*.5,8,6),m3Mat('fur',0x7a5a38),R*.3,R*.22,-R*.5).scale.set(1.3,.45,1);
    for(const[x,z]of[[R*1.1,R*.1],[R*1.2,-R*.3]]){put(g,new THREE.SphereGeometry(.38,8,6),m3Plain(0xb88a4e),x,.3,z).scale.set(1,.9,1)}
    for(let i=0;i<3;i++)put(g,new THREE.DodecahedronGeometry(.22,0),m3Plain(0x8d8a80,.95),-R*1.1+i*.1,.2,R*.7-i*.18);
    g.userData.h=R*1.8;return g},
  barracks(R,st,team){const g=new THREE.Group(),sm=m3Plain(0x8d8a80,.95);
    const n=8;for(let i=0;i<n;i++){const a=i/n*6.283,h=R*(.9+.5*((i*37)%5)/4);const m=put(g,new THREE.BoxGeometry(.6,h,.35),sm,Math.cos(a)*R*1.15,h/2,Math.sin(a)*R*.8);m.rotation.y=-a;m.rotation.z=((i*13)%5-2)*.02}
    put(g,cyl(R*.3,R*.35,.1,10),m3Plain(0x4a443d,.95),0,.05,0);put(g,cone(.16,.45,6),m3Plain(0xf08a2c,.5,{emissive:0xd45a10,emissiveIntensity:.8}),0,.35,0);
    for(let i=0;i<4;i++){const c=put(g,cyl(.05,.07,R*1.0,6),wood(),R*.3+i*.22,R*.5,-R*.2);c.rotation.z=-.25;put(g,new THREE.DodecahedronGeometry(.13,0),sm,R*.3+i*.22+R*.12,R*1.0,-R*.2)}
    for(let i=0;i<3;i++){const sk=put(g,new THREE.SphereGeometry(.14,8,6),m3Plain(0xe8dfc8),-R*.3+i*.3,.14,R*.4)}
    flagPole(g,0,R*1.4,0,R*1.2,team);g.userData.h=R*2.4;return g}
};
/* Neuzeit-Merkmale: Renaissance (Kuppel, Säulen, Kanone), Industriezeit (Schornsteine, Eisenträger, Gleis) */
function epExtras(g,type,R,st){
  const ep=st.ep;if(ep<4)return;const iron=m3Plain(0x3a3b42,.5,{metalness:.6}),gold=goldM(),pale=m3Plain(0xece6d6,.6);
  if(ep===4){
    if(type==='hq'){for(const x of[-.5,-.2,.2,.5])put(g,cyl(.14,.16,R*1.1,10),pale,x*R*1.6,R*.6,R*.95);put(g,new THREE.BoxGeometry(R*2.6,.22,.5),pale,0,R*1.2,R*.95);const d=put(g,new THREE.SphereGeometry(R*.45,14,10,0,6.283,0,1.6),gold,0,R*2.15,0);put(g,cyl(.05,.05,.5,5),gold,0,R*2.75,0)}
    if(type==='house'){for(const x of[-.5,.5])put(g,new THREE.BoxGeometry(.16,.55,.08),m3Plain(0x4a6a52),x*R*.8,R*.5,R*.88);put(g,new THREE.BoxGeometry(R*.9,.1,.2),m3Plain(0x4a6a52),R*.5,R*.28,R*.9)}
    if(type==='store'){const c=put(g,cyl(.06,.06,R*1.6,6),woodD(),R*1.2,R*.8,-R*.4);const a=put(g,cyl(.05,.05,R*1.1,6),woodD(),R*.7,R*1.55,-R*.4);a.rotation.z=Math.PI/2;put(g,new THREE.BoxGeometry(.4,.3,.4),m3Mat('planks',0xa9834f),R*.25,R*.95,-R*.4)}
    if(type==='barracks'){const cg=new THREE.Group();cg.position.set(R*1.3,0,R*.5);g.add(cg);put(cg,cyl(.4,.4,.14,10),woodD(),0,.4,.4).rotation.x=Math.PI/2;put(cg,cyl(.4,.4,.14,10),woodD(),0,.4,-.4).rotation.x=Math.PI/2;put(cg,new THREE.BoxGeometry(1.4,.18,.8),woodD(),0,.7,0);put(cg,cyl(.2,.26,1.5,10),iron,.3,.95,0).rotation.z=-1.35}
    if(type==='tower'){put(g,new THREE.SphereGeometry(R*.5,10,8,0,6.283,0,1.6),gold,0,R*3.4,0)}
  }else{
    const smoke=(x,y,z,h)=>{put(g,cyl(.22,.3,h,10),m3Mat('brick',0x8a4a38),x,y+h/2,z);put(g,cyl(.3,.24,.2,10),iron,x,y+h,z)};
    if(type==='hq'){smoke(-R*.9,R*1.0,-R*.4,R*1.6);smoke(R*.9,R*1.0,-R*.4,R*1.3);for(const x of[-1.2,0,1.2])put(g,new THREE.BoxGeometry(.12,R*.6,.12),iron,x*R*.5,R*1.0,R*.95)}
    if(type==='house'){smoke(R*.5,R*.9,-R*.2,R*.9);put(g,cyl(.04,.04,R*1.5,5),woodD(),-R*1.1,R*.75,R*.5);put(g,new THREE.BoxGeometry(.6,.05,.05),woodD(),-R*1.1,R*1.4,R*.5)}
    if(type==='store'){for(const z of[-.5,.5])put(g,new THREE.BoxGeometry(R*3.2,.08,.1),iron,0,.1,R*.9+z*.45);for(let i=0;i<8;i++)put(g,new THREE.BoxGeometry(.08,.05,.7),woodD(),-R*1.5+i*R*.42,.06,R*.9+.0);const cart=put(g,new THREE.BoxGeometry(.9,.4,.6),iron,R*.8,.4,R*1.15)}
    if(type==='barracks'){for(let i=0;i<5;i++)put(g,new THREE.SphereGeometry(.28,6,5),m3Plain(0xb8a578,.95),-R*1.2+i*.5,.25,R*.95).scale.set(1,.8,.8);for(let i=0;i<3;i++)put(g,cyl(.03,.03,1.2,5),iron,R*.3+i*.25,.8,R*.9)}
    if(type==='tower'){const l=put(g,new THREE.SphereGeometry(.3,8,6),m3Plain(0xfff2b0,.2,{emissive:0xffe28a,emissiveIntensity:.9}),0,R*3.1+.4,R*.2)}
    if(type==='harbor'){smoke(R*.3,R*.8,-R*.3,R*1.4)}
    if(type==='castle'){smoke(0,R*1.8,0,R*1.2)}
  }}
/* Gemeinsame Details für Wohn- und Zweckbauten: Sockel, Eckpfosten bzw. Eckquader, Türstufen, Laterne ab der Eisenzeit */
function bldDetail(g,type,R,st){
  if(!['house','store','barracks','hq'].includes(type))return;
  const bb=new THREE.Box3().setFromObject(g),w=bb.max.x-bb.min.x,d=bb.max.z-bb.min.z,cx=(bb.max.x+bb.min.x)/2,wh=(g.userData.h||R*2)*(type==='hq'?.38:.5),ww=Math.min(w,type==='hq'?R*2.5:w)*.5,dd=Math.min(d,R*1.9)*.5;
  const post=st.ep>=3?m3Mat('stone',0xb8b2a4):woodD();
  for(const sx of[-1,1])for(const sz of[-1,1])put(g,new THREE.BoxGeometry(.2,wh*1.02,.2),post,cx+sx*ww*(type==='hq'?.98:.96)*.99,wh*.5+.1,sz*dd*.9);
  put(g,new THREE.BoxGeometry(ww*2.06,.2,dd*1.9),st.base,cx,.1,0,false);
  put(g,new THREE.BoxGeometry(.5,.12,R*.9),st.base,cx,.06,dd*.9+.45,false);put(g,new THREE.BoxGeometry(.35,.12,R*.8),st.base,cx,.12,dd*.9+.15,false);
  if(st.ep>=2){put(g,cyl(.03,.03,.5,5),woodD(),cx+R*.5,.75,dd*.95,false);put(g,new THREE.SphereGeometry(.09,6,5),m3Plain(0xffe9a8,.3,{emissive:0xffcc66,emissiveIntensity:.9}),cx+R*.5,1.05,dd*.95,false)}}
/* Umgebung der Gebäude: Holzstapel, Säcke, Übungspuppe, Waffenständer, Feuerschalen, Zaun */
function bldDecor(g,type,R,st,team){
  const wd=woodD(),log=m3Mat('planks',0x8a6a42),straw=m3Plain(0xd9c27a,.95),steel=m3Plain(0x6a6e74,.4,{metalness:.7});
  if(type==='store'){for(let i=0;i<7;i++){const l=put(g,cyl(.13,.13,1.1,8),log,-R*1.5+(i%4)*.27,.14+Math.floor(i/4)*.24,R*1.1);l.rotation.z=Math.PI/2}for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(.26,8,6),m3Plain([0xb99a62,0x9d8754,0xc4aa72][i],.95),R*1.3+i*.3,.22,R*1.05).scale.set(1,.85,.9)}
  if(type==='barracks'){const d=new THREE.Group();d.position.set(-R*1.55,0,R*.9);g.add(d);put(d,cyl(.07,.08,1.5,6),wd,0,.75,0);put(d,cyl(.04,.04,.9,5),wd,0,1.2,0).rotation.x=Math.PI/2;put(d,new THREE.SphereGeometry(.2,8,6),straw,0,1.62,0);put(d,new THREE.CylinderGeometry(.22,.26,.55,8),straw,0,1.0,0);
    const rk=new THREE.Group();rk.position.set(R*1.5,0,R*.95);g.add(rk);put(rk,cyl(.05,.05,1.3,5),wd,-.4,.65,0);put(rk,cyl(.05,.05,1.3,5),wd,.4,.65,0);put(rk,cyl(.04,.04,.9,5),wd,0,1.0,0).rotation.z=Math.PI/2;for(let i=0;i<3;i++)put(rk,cyl(.025,.025,1.1,5),steel,-.25+i*.25,.85,.08).rotation.z=.12;
    put(g,rbox(.05,.9,.6,.02),team===undefined?woodD():m3Team(team),R*.55,R*.95,R*.95,false)}
  if(type==='hq'&&st.ep>=1)for(const s of[-1,1]){const br=new THREE.Group();br.position.set(s*R*.75,0,R*1.05);g.add(br);put(br,cyl(.12,.16,.6,8),m3Plain(0x3a3b42,.5,{metalness:.6}),0,.3,0);put(br,cone(.17,.34,7),m3Plain(0xf08a2c,.5,{emissive:0xe85a10,emissiveIntensity:1}),0,.75,0,false)}
  if(type==='house'&&st.ep<=3){for(let i=0;i<5;i++){put(g,cyl(.04,.04,.55,5),wd,-R*1.25+i*.28,.28,-R*1.0);}put(g,cyl(.03,.03,1.2,4),wd,-R*.85,.5,-R*1.0).rotation.z=Math.PI/2}
}
function buildBld(type,R,ep,team){const st=bStyle(ep),g=(ep===0&&PRIM[type]||BLD3[type]||BLD3.house)(R,st,team);if(ep>0)bldDetail(g,type,R,st);bldDecor(g,type,R,st,team);if(ep>=4)epExtras(g,type,R,st);setShadows(g);g.userData.flags=[];g.traverse(o=>{if(o.userData.flag)g.userData.flags.push(o)});return g}

/* ---------- Figuren ---------- */
function limbPivot(parent,x,y,z){const p=new THREE.Group();p.position.set(x,y,z);parent.add(p);return p}
/* Grundfigur mit Beinen, Rumpf, Kopf, Armen. Rückgabe: Rig mit Teilen zum Animieren. */
const SKINS=[0xe2b98f,0xc8946a,0xf0cfae,0x9c6b48],HAIRS=[0x2c2018,0x5a3a20,0xb88a4e,0x1a1612,0x7a4a2a];
function human(o){
  const id=M3.curId||0,g=new THREE.Group(),skin=o.skin||m3Plain(SKINS[id%4],.7),legM=o.legs||cloth(0x5a4630),boot=o.boot||m3Plain(0x2f241a),sleeve=o.arm||o.body,rig={g,legs:[],knees:[],arms:[],elbows:[],hands:[],tools:{}};
  /* Beine: Oberschenkel, Knie, Unterschenkel, Fuß mit Spitze */
  for(const s of[-1,1]){const p=limbPivot(g,0,.9,s*.15);put(p,cyl(.125,.1,.46,9),legM,0,-.22,0);
    const k=limbPivot(p,0,-.45,0);put(k,new THREE.SphereGeometry(.1,8,6),legM,0,0,0);put(k,cyl(.098,.075,.42,9),legM,0,-.21,0);
    put(k,cyl(.085,.09,.14,8),boot,0,-.36,0);put(k,new THREE.BoxGeometry(.3,.11,.17),boot,.07,-.425,0);put(k,new THREE.SphereGeometry(.085,6,6),boot,.2,-.42,0);
    rig.legs.push(p);rig.knees.push(k)}
  /* Rumpf: Becken, Taille, Brustkorb mit breiten Schultern, Hals */
  put(g,new THREE.BoxGeometry(.3,.2,.42),legM,0,1.0,0);
  const waist=put(g,new THREE.CapsuleGeometry(.2,.16,4,10),o.body,0,1.2,0);waist.scale.set(.9,1,1.12);
  const torso=put(g,new THREE.CapsuleGeometry(.27,.26,4,12),o.body,0,1.5,0);torso.scale.set(.82,1,1.34);rig.torso=torso;
  put(g,new THREE.SphereGeometry(.13,8,6),o.body,0,1.74,-.4,false);put(g,new THREE.SphereGeometry(.13,8,6),o.body,0,1.74,.4,false);
  if(o.belt)put(g,cyl(.3,.3,.1,12),o.belt,0,1.07,0);
  put(g,cyl(.085,.1,.17,8),skin,.01,1.88,0);
  /* Kopf: gestreckt, Nase, Kinn, Ohren, Brauen, Augen, Haare */
  const head=new THREE.Group();head.position.set(.02,2.04,0);g.add(head);rig.head=head;
  const hs=put(head,new THREE.SphereGeometry(.235,14,12),skin,0,0,0);hs.scale.set(.96,1.1,.9);
  put(head,new THREE.SphereGeometry(.09,8,6),skin,.12,-.17,0,false).scale.set(1,.8,1);
  put(head,cone(.04,.11,5),skin,.24,-.02,0,false).rotation.z=-Math.PI/2;
  for(const s of[-1,1]){put(head,new THREE.SphereGeometry(.045,6,6),skin,-.02,-.02,s*.225,false).scale.set(.6,1.1,.5);
    put(head,new THREE.SphereGeometry(.04,6,6),m3Plain(0xf2eee4,.5),.2,.04,s*.085,false);put(head,new THREE.SphereGeometry(.022,6,6),m3Plain(0x15110c),.235,.04,s*.085,false);
    put(head,new THREE.BoxGeometry(.04,.025,.1),m3Plain(HAIRS[(id*7)%5],.95),.215,.1,s*.085,false)}
  if(id%3===0&&!o.noBeard){const bd=put(head,new THREE.SphereGeometry(.17,10,8,0,6.283,1.2,1.7),m3Plain(HAIRS[(id*7)%5],.95),.09,-.16,0,false);bd.scale.set(.9,1.1,1.15)}
  const hr=put(head,new THREE.SphereGeometry(.25,12,10,0,6.283,0,1.75),o.hairM||m3Plain(HAIRS[(id*7)%5],.95),-.03,.03,0);hr.scale.set(1.02,1.05,.98);
  /* Arme: Schulter, Oberarm, Ellbogen, Unterarm, Hand */
  for(const s of[-1,1]){const p=limbPivot(g,0,1.72,s*.4);put(p,new THREE.SphereGeometry(.11,8,6),sleeve,0,0,0,false);put(p,cyl(.088,.074,.37,9),sleeve,0,-.18,0);
    const el=limbPivot(p,0,-.36,0);put(el,new THREE.SphereGeometry(.075,8,6),sleeve,0,0,0,false);put(el,cyl(.07,.058,.34,9),o.fore||sleeve,0,-.17,0);
    const hd=limbPivot(el,0,-.36,0);put(hd,new THREE.SphereGeometry(.085,8,8),skin,0,0,0);
    rig.arms.push(p);rig.elbows.push(el);rig.hands.push(hd)}
  return rig}
const armHand=(rig,i)=>rig.hands[i];

/* ---------- Ausrüstung je Zeitalter ----------
   Die Stufe der Einheit (u.lvl, steigt mit dem Zeitalter) bestimmt den Look: 0 Steinzeit (Fell, Stein), 1 Bronze, 2 Eisen, 3 Kettenhemd/Mittelalter,
   4 Renaissance (Uniformrock, Morion), 5 Industriezeit (dunkle Uniform, Käppi). */
const TIERMET=[0x8d8a80,0xc2884a,0xa3abb6,0xced3db,0xd5d9e0,0xd9dde3];
const metT=t=>t===0?m3Plain(TIERMET[0],.95):m3Mat('scratch',new THREE.Color(TIERMET[Math.min(5,t)]).multiplyScalar(.62).getHex(),{roughness:.42,metalness:.75});
const hairM=()=>m3Plain(0x2c2018,.95),furM=c=>m3Mat('fur',c||0x8a6a45),goldM=()=>m3Plain(0xe6c35a,.3,{metalness:.8});
function bodyOf(t,type,tm){
  const war=type!=='worker'&&type!=='scout',cl=(c,o)=>m3Mat('cloth',c,{roughness:.9,...(o||{})}),lt=c=>m3Mat('leather',c,{roughness:.75});
  if(t===0)return{body:skinM(),arm:skinM(),legs:skinM(),belt:furM(0x5a4028)};
  if(t===1)return{body:cl(war?0x80603c:0xb59a68),legs:cl(0x6b5238),belt:lt(0x4d3722)};
  if(t===2)return{body:cl(war?0x6e747c:0xa4a27c),legs:cl(0x4d4a46),belt:lt(0x4a3220)};
  if(t===3)return war?{body:m3Mat('scratch',0x8a8f98,{roughness:.45,metalness:.55}),legs:cl(0x3f3a36),belt:lt(0x2a2119)}:{body:cl(0x8a6f4a),legs:cl(0x4a3a2a),belt:lt(0x3a2a1a)};
  if(t===4)return war?{body:tm,legs:cl(0xe8e4d8),belt:cl(0xf3efe4)}:{body:cl(0x6e5a46),legs:cl(0x3a3028),belt:lt(0x3a2a1a)};
  return war?{body:cl(0x3b4252),legs:cl(0x2a2f3c),belt:tm}:{body:cl(0x5a5f6a),legs:cl(0x33363e),belt:lt(0x2a2119)}}
/* Kleidung und Rüstung als Zusatzteile */
function dress(rig,t,type,tm){
  const g=rig.g,war=type!=='worker'&&type!=='scout';
  /* Teamfarbe gut erkennbar: Schärpe über der Brust (Kämpfer) bzw. Stirnband (Arbeiter, Späher) */
  if(t!==4){if(war){const sh=put(g,new THREE.BoxGeometry(.09,.85,.62),tm,.27,1.45,0,false);sh.rotation.x=.55;put(g,new THREE.BoxGeometry(.5,.14,.7),tm,0,1.78,0,false)}else{const hb=put(g,new THREE.TorusGeometry(.255,.035,6,14),tm,.02,2.1,0,false);hb.rotation.x=Math.PI/2}}
  if(war&&t>=3){const cp=put(g,rbox(.05,.95,.74,.025),tm,-.34,1.32,0,false);cp.rotation.z=.08;put(g,new THREE.SphereGeometry(.07,6,5),metT(t),-.3,1.74,.28,false);put(g,new THREE.SphereGeometry(.07,6,5),metT(t),-.3,1.74,-.28,false)}
  if(war&&(t===2||t===3)){const mt=metT(t);const cu=put(g,rbox(.36,.62,.66,.07),mt,.07,1.5,0);cu.scale.set(.9,1,1);put(g,rbox(.4,.12,.7,.05),mt,.02,1.2,0);
    if(t===3)for(const s of[-1,1]){const pd=put(g,new THREE.SphereGeometry(.17,10,8,0,6.283,0,1.6),mt,0,1.78,s*.43);pd.scale.set(1.1,.8,1)}}
  if(t===0){put(g,cyl(.33,.4,.3,10),furM(0x7a5a38),0,1.02,0);const p=put(g,new THREE.SphereGeometry(.26,8,6),furM(0x9a7a50),0,1.82,-.3);p.scale.set(1,.7,1.1);const bn=put(g,new THREE.TorusGeometry(.2,.028,6,12),m3Plain(0xe8dfc8,.7),.03,1.84,0,false);bn.rotation.x=1.45}
  else if(t===1){if(war)for(const s of[-1,1])put(g,cyl(.15,.15,.05,10),metT(1),0,1.84,s*.4,false).rotation.x=Math.PI/2}
  else if(t===2){if(war)put(g,new THREE.BoxGeometry(.32,.5,.5),metT(2),.02,1.46,0);else put(g,new THREE.BoxGeometry(.06,.5,.42),cloth(0xd8d2c0),.3,1.2,0)}
  else if(t===3){if(war){put(g,new THREE.BoxGeometry(.06,.62,.54),tm,.3,1.38,0);put(g,new THREE.BoxGeometry(.06,.62,.54),tm,-.3,1.38,0)}}
  else if(t===4){if(war){for(const s of[-1,1])put(g,new THREE.BoxGeometry(.03,.78,.04),m3Plain(0xf3efe4),.31,1.45,0).rotation.x=s*.5;for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(.03,6,6),goldM(),.3,1.7-i*.17,0,false)}}
  else{for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(.03,6,6),goldM(),.3,1.7-i*.17,0,false);if(war)put(g,new THREE.BoxGeometry(.2,.4,.5),m3Plain(0x4a3d2e),-.36,1.45,0)}
}
/* Kopfbedeckung: 'war' Helm, 'work' Arbeiterhut, 'hood' Kapuze */
function headgear(rig,t,kind,tm){
  const g=rig.g,m=metT(t);
  if(kind==='war'){
    if(t===0){put(g,new THREE.SphereGeometry(.28,10,8,0,6.283,0,2.0),hairM(),-.05,2.05,0);put(g,cyl(.27,.27,.07,10),furM(0x6e5030),0,2.14,0)}
    else if(t===1){put(g,cone(.27,.5,10),m,0,2.38,0);put(g,cyl(.28,.29,.07,12),m,0,2.14,0)}
    else if(t===2){put(g,new THREE.SphereGeometry(.29,12,10,0,6.283,0,1.7),m,0,2.06,0);put(g,new THREE.BoxGeometry(.04,.22,.05),m,.27,2.0,0)}
    else if(t===3){put(g,new THREE.SphereGeometry(.29,12,10,0,6.283,0,1.7),m,0,2.08,0);put(g,cyl(.4,.4,.04,14),m,0,2.1,0);put(g,cyl(.3,.27,.16,12),metT(3),0,1.9,0)}
    else if(t===4){put(g,new THREE.SphereGeometry(.29,12,10,0,6.283,0,1.7),m,0,2.08,0);put(g,new THREE.BoxGeometry(.08,.14,.55),m,0,2.36,0);put(g,cyl(.4,.34,.05,14),m,0,2.1,0);put(g,cone(.07,.4,6),tm,-.2,2.45,0).rotation.z=.9}
    else{put(g,cyl(.25,.28,.2,12),m3Plain(0x2c3550),0,2.28,0);put(g,new THREE.BoxGeometry(.34,.03,.5),m3Plain(0x1c2238),.2,2.18,0);put(g,cyl(.255,.285,.04,12),goldM(),0,2.2,0)}
  }else if(kind==='work'){
    if(t===0){put(g,cyl(.27,.27,.06,10),furM(0x6e5030),0,2.14,0);put(g,new THREE.SphereGeometry(.28,10,8,0,6.283,0,2.0),hairM(),-.05,2.05,0)}
    else if(t===1){put(g,cyl(.38,.38,.04,14),m3Plain(0xd9bc62),0,2.16,0);put(g,new THREE.SphereGeometry(.2,10,8,0,6.283,0,1.6),m3Plain(0xe6cc78),0,2.18,0)}
    else if(t===2){put(g,new THREE.SphereGeometry(.27,10,8,0,6.283,0,1.8),cloth(0x6b5238),0,2.08,0)}
    else if(t===3){put(g,new THREE.SphereGeometry(.3,10,8,0,6.283,0,2.2),cloth(0x7a5a3a),-.02,2.04,0);put(g,cone(.12,.3,6),cloth(0x7a5a3a),-.2,2.2,0).rotation.z=.9}
    else if(t===4){put(g,cyl(.4,.4,.04,14),m3Plain(0x3a3028),0,2.14,0);put(g,cyl(.22,.22,.26,12),m3Plain(0x3a3028),0,2.28,0)}
    else{put(g,cyl(.27,.28,.09,12),m3Plain(0x3b4252),0,2.2,0);put(g,new THREE.BoxGeometry(.3,.03,.36),m3Plain(0x2a2f3c),.22,2.16,0)}
  }else{
    if(t===0){put(g,cyl(.27,.27,.05,10),furM(0x6e5030),0,2.14,0);put(g,cone(.03,.5,4),m3Plain(0xe8e0cc),-.1,2.4,.15).rotation.z=.4;put(g,cone(.03,.45,4),m3Plain(0xc84b3a),-.12,2.38,-.12).rotation.z=.4;put(g,new THREE.SphereGeometry(.28,10,8,0,6.283,0,1.9),hairM(),-.05,2.05,0)}
    else{const hc=cloth(t>=4?0x3a4a3a:0x4f6f46);put(g,new THREE.SphereGeometry(.3,12,10,0,6.283,0,2.1),hc,-.02,2.04,0);put(g,cone(.13,.35,6),hc,-.22,2.18,0).rotation.z=.9}
  }}
/* Waffen und Schilde */
function clubW(t){const cl=new THREE.Group();put(cl,cyl(.06,.09,1.1,7),wood(),0,.35,0);
  if(t===0){put(cl,new THREE.DodecahedronGeometry(.24,0),m3Plain(0x8d8a80,.95),0,.98,0);put(cl,cyl(.1,.1,.12,8),m3Plain(0x5b4228),0,.8,0)}
  else{put(cl,new THREE.SphereGeometry(.2,8,8),metT(t),0,.98,0);for(let i=0;i<6;i++){const a=i*1.05;put(cl,cone(.045,.14,5),metT(t),Math.cos(a)*.2,.98+(i%2?.1:-.08),Math.sin(a)*.2).rotation.z=-Math.cos(a)*1.4}}
  return cl}
function spearW(t){const sp=new THREE.Group();put(sp,cyl(.035,.035,3.0,6),wood(),0,.9,0);const hd=put(sp,t<=1?new THREE.OctahedronGeometry(.16,0):cone(.09,.42,6),t===0?m3Plain(0x8d8a80,.95):metT(t),0,2.55,0);if(t<=1)hd.scale.set(.7,2.0,.5);return sp}
function shieldW(t,tm,tl){
  if(t<=0)return null;const sh=new THREE.Group();
  if(t<=2){const d=put(sh,cyl(.5,.5,.07,16),m3Mat('planks',t===1?0x9a7440:0x7a5a3a),0,0,0);d.rotation.x=Math.PI/2;const bs=put(sh,new THREE.SphereGeometry(.12,8,6),metT(t),0,0,.05);bs.scale.z=.6;
    const pt=put(sh,new THREE.TorusGeometry(.33,.05,6,16),tm,0,0,.04);if(t===2){const rim=new THREE.Mesh(new THREE.TorusGeometry(.5,.04,6,18),metT(2));sh.add(rim)}}
  else{const s=new THREE.Shape();s.moveTo(-.36,.42);s.lineTo(.36,.42);s.lineTo(.36,-.05);s.quadraticCurveTo(.28,-.42,0,-.6);s.quadraticCurveTo(-.28,-.42,-.36,-.05);s.closePath();
    const f=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:.07,bevelEnabled:false}),tm);f.castShadow=true;f.position.z=-.03;sh.add(f);put(sh,new THREE.BoxGeometry(.08,.9,.09),m3Plain(0xf3efe4),0,-.05,.02);put(sh,new THREE.BoxGeometry(.6,.08,.09),m3Plain(0xf3efe4),0,.18,.02)}
  return sh}
function swordW(t){const sw=new THREE.Group(),m=metT(t);
  if(t<=2){put(sw,new THREE.BoxGeometry(.07,.9,.03),m,0,.55,0);put(sw,new THREE.BoxGeometry(.28,.05,.06),goldM(),0,.1,0)}
  else if(t===3){put(sw,new THREE.BoxGeometry(.08,1.15,.03),m,0,.7,0);put(sw,new THREE.BoxGeometry(.4,.06,.07),goldM(),0,.1,0);put(sw,new THREE.SphereGeometry(.06,6,6),goldM(),0,-.1,0)}
  else if(t===4){put(sw,new THREE.BoxGeometry(.035,1.3,.02),m,0,.78,0);const gd=new THREE.Mesh(new THREE.TorusGeometry(.14,.015,5,12),goldM());gd.position.set(0,.12,0);gd.rotation.x=1.2;sw.add(gd)}
  else{put(sw,new THREE.BoxGeometry(.06,.55,.025),m,0,.45,0);const b2=put(sw,new THREE.BoxGeometry(.06,.5,.025),m,.07,.95,0);b2.rotation.z=-.25;put(sw,new THREE.BoxGeometry(.26,.05,.06),goldM(),0,.1,0)}
  return sw}
function gunW(t,rifle){const g=new THREE.Group(),steel=m3Plain(0x4a4a50,.35,{metalness:.7}),wd=m3Mat('planks',0x7a5535),L=rifle?1.7:1.5;
  put(g,cyl(.022,.026,L,8),steel,0,.75+(rifle?.05:0),0);                                   /* Lauf */
  const st=put(g,new THREE.BoxGeometry(.13,.62,.09),wd,0,.12,0);st.rotation.z=.05;           /* Schaft */
  put(g,new THREE.BoxGeometry(.1,.36,.07),wd,0,-.22,.0).rotation.z=-.25;                    /* Kolbenhals */
  put(g,new THREE.BoxGeometry(.075,.55,.09),wd,0,.66,0);                                    /* Handschutz */
  put(g,new THREE.BoxGeometry(.06,.2,.05),steel,.05,.45,0);put(g,cyl(.02,.02,.14,6),steel,.1,.42,0).rotation.x=Math.PI/2;put(g,new THREE.SphereGeometry(.03,6,6),steel,.1,.42,.08); /* Verschluss */
  put(g,new THREE.TorusGeometry(.07,.01,5,10),m3Plain(0x3a2c1c,.9),.0,.95,0).rotation.y=1.57;put(g,new THREE.BoxGeometry(.02,.05,.02),steel,.04,1.5,0); /* Ring, Visier */
  if(rifle){const b=put(g,new THREE.BoxGeometry(.018,.46,.04),metT(5),.06,1.98,0);put(g,cyl(.03,.03,.1,6),steel,.04,1.62,0)} /* Bajonett */
  return g}

/* Werkzeug-Stufe der Arbeiter: Epoche, aber auch erforschte Werkzeug-Technologien */
function wkTier(u){const tf=G&&G.tech?G.tech[u.team]:null;let t=Math.min(5,u.lvl||0);if(tf){if(tf.has('bronzetools'))t=Math.max(t,1);if(tf.has('irontools'))t=Math.max(t,2);if(tf.has('industry'))t=Math.max(t,4);if(tf.has('electric'))t=Math.max(t,5)}return t}
const UNIT3={
  worker(u,tm){const tt=wkTier(u),t=Math.min(5,u.lvl||0),bo=bodyOf(t,'worker',tm),tf=G&&G.tech?G.tech[u.team]:null,shoes=tf&&tf.has('shoes'),
      rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt,boot:shoes?m3Plain(0x7a4a28,.7):null}),R=armHand(rig,1);dress(rig,t,'worker',tm);headgear(rig,t,'work',tm);
    const hd=tt===0?m3Plain(0x8d8a80,.95):metT(tt),lash=m3Plain(0x6b4a2a,.9),L=[.85,.95,1.0,1.1,1.15,1.2][tt];
    /* Alle Werkzeuge: Griff zeigt in der Hand nach +y, der Kopf sitzt oben; die Gruppe wird gedreht, damit der Kopf in Armrichtung (nach unten/vorn) zeigt */
    const mk=(fn)=>{const gr=new THREE.Group();fn(gr);gr.rotation.z=Math.PI+.18;R.add(gr);return gr};
    const axe=mk(gr=>{put(gr,cyl(.034,.04,L,6),wood(),0,L/2-.1,0);const w=.26+.045*tt,h=.2+.025*tt;
      if(tt===0){const st=put(gr,new THREE.DodecahedronGeometry(.13,0),hd,-.1,L-.12,0);st.scale.set(1.4,1,.5);put(gr,new THREE.TorusGeometry(.06,.014,5,8),lash,-.02,L-.12,0).rotation.y=1.57}
      else{const bl=put(gr,new THREE.BoxGeometry(w,h,.05),hd,-w/2-.02,L-.14,0);bl.geometry.translate(0,0,0);put(gr,new THREE.BoxGeometry(.09,.2,.07),metT(tt),0,L-.14,0);
        if(tt>=3)put(gr,new THREE.BoxGeometry(w*.8,h*.7,.05),hd,.14+w*.1,L-.14,0)}});
    const pw=[.5,.62,.7,.8,.85,.9][tt],pick=mk(gr=>{put(gr,cyl(.034,.04,L,6),wood(),0,L/2-.1,0);
      if(tt===0){const st=put(gr,new THREE.DodecahedronGeometry(.1,0),hd,0,L-.12,0);st.scale.set(.7,1,2.6);put(gr,new THREE.TorusGeometry(.055,.014,5,8),lash,0,L-.12,0)}
      else{const bar=put(gr,new THREE.BoxGeometry(.07,.08,pw),hd,0,L-.12,0);for(const z of[-1,1]){put(gr,cone(.05,.2,6),hd,0,L-.12,z*(pw/2+.07)).rotation.x=z*-Math.PI/2}}});
    const ham=mk(gr=>{put(gr,cyl(.034,.04,.7,6),wood(),0,.25,0);put(gr,new THREE.BoxGeometry(.3,.2,.2),tt===0?m3Plain(0x8d8a80,.95):m3Plain(0x7e7a72),0,.62,0)});
    rig.tools.wood=axe;rig.tools.stone=pick;rig.tools.iron=pick;rig.tools.gold=pick;rig.tools.build=ham;
    /* Beeren: Korb in der Hand (geflochten, mit Beeren) */
    const bas=new THREE.Group();bas.position.y=.05;R.add(bas);put(bas,new THREE.CylinderGeometry(.24,.17,.22,10,1,true),m3Plain(0xb88a4e,.9),.12,-.1,0);put(bas,cyl(.17,.17,.03,10),m3Plain(0xa07840,.9),.12,-.21,0);
    for(let i=0;i<7;i++)put(bas,new THREE.SphereGeometry(.045,6,5),m3Plain(i%2?0xc2352f:0x8a2a4a,.5),.12+Math.cos(i*2.1)*.1,-.04,Math.sin(i*2.1)*.1,false);
    rig.tools.food=bas;
    /* Tragekorb auf dem Rücken (Technologie Tragekörbe), Handkarren-Ausbau mit zweitem Korb (Technologie Handkarren) */
    const hasB=tf&&tf.has('baskets'),hasC=tf&&tf.has('carts');
    if(hasB){const bk=new THREE.Group();bk.position.set(-.34,1.5,0);rig.g.add(bk);const wk=m3Plain(0xb88a4e,.9);put(bk,new THREE.CylinderGeometry(.3,.2,.5,10,1,true),wk,0,0,0);put(bk,cyl(.2,.2,.04,10),m3Plain(0xa07840,.9),0,-.25,0);
      for(let i=0;i<3;i++)put(bk,new THREE.TorusGeometry(.26-i*.02,.014,5,12),m3Plain(0x8a6a38,.9),0,.1-i*.17,0).rotation.x=Math.PI/2;
      for(const z of[-1,1])put(bk,cyl(.014,.014,.7,4),lash,.26,.1,z*.2).rotation.z=.5;
      if(hasC){const b2=put(bk,new THREE.CylinderGeometry(.22,.15,.4,10,1,true),wk,-.12,.45,0);put(b2,cyl(.15,.15,.03,10),m3Plain(0xa07840,.9),0,-.2,0)}
      rig.back=bk}
    const sack=put(rig.g,new THREE.SphereGeometry(.28,10,8),m3Plain(0x9a6c3c),-.4,hasB?1.78:1.45,0);rig.sack=sack;sack.visible=false;
    rig.tool=k=>{for(const n in rig.tools)rig.tools[n].visible=(n===k)};rig.tool(null);return rig},
  scout(u,tm){const t=Math.min(5,u.lvl||0),bo=bodyOf(t,'scout',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:tm});dress(rig,t,'scout',tm);headgear(rig,t,'hood',tm);
    if(t===0){const p=put(rig.g,new THREE.ConeGeometry(.5,.9,5),furM(0x6e5030),-.3,1.5,0);p.rotation.z=.15}else{const p=put(rig.g,new THREE.ConeGeometry(.5,.9,3),cloth(t>=4?0x3a4a3a:0x44704a),-.3,1.5,0);p.rotation.z=.15}
    const R=armHand(rig,1);put(R,cyl(.04,.04,2.2,6),wood(),0,.2,0);if(t>=1)put(R,cone(.07,.25,5),metT(t),0,1.4,0);return rig},
  club(u,tm){const t=Math.min(5,u.lvl||0),bo=bodyOf(t,'club',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1);dress(rig,t,'club',tm);headgear(rig,t,'war',tm);
    const cl=clubW(t);R.add(cl);cl.position.set(0,0,0);return rig},
  sling(u,tm){const t=Math.min(5,u.lvl||0),bo=bodyOf(t,'sling',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1);dress(rig,t,'sling',tm);headgear(rig,t,'war',tm);
    const sl=new THREE.Group();put(sl,cyl(.012,.012,.75,4),m3Plain(0x7a5a3a),0,-.35,0);put(sl,new THREE.SphereGeometry(.1,8,6),m3Plain(0x6b4f31),0,-.78,0);put(sl,new THREE.DodecahedronGeometry(.07,0),m3Plain(0x8d8a80,.95),0,-.78,0);R.add(sl);sl.position.set(.1,0,0);rig.sling=sl;
    put(rig.g,new THREE.SphereGeometry(.14,8,6),m3Plain(0x6b4f31),.0,1.0,.33);put(rig.g,new THREE.DodecahedronGeometry(.06,0),m3Plain(0x8d8a80,.95),.0,1.12,.33,false);return rig},
  spear(u,tm){const t=Math.max(1,Math.min(5,u.lvl||1)),bo=bodyOf(t,'spear',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1),L=armHand(rig,0);dress(rig,t,'spear',tm);headgear(rig,t,'war',tm);
    const sp=spearW(t);R.add(sp);sp.rotation.z=.15;const sh=shieldW(t,tm,m3TeamL(u.team));if(sh){L.add(sh);sh.position.set(.18,0,.05)}return rig},
  archer(u,tm){const t=Math.max(1,Math.min(5,u.lvl||1)),bo=bodyOf(t,'archer',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),L=armHand(rig,0);dress(rig,t,'archer',tm);headgear(rig,t,t>=4?'war':'hood',tm);
    const q=put(rig.g,cyl(.1,.1,.7,8),m3Plain(0x7a5535),-.34,1.5,.1);q.rotation.z=.3;for(let i=0;i<3;i++)put(rig.g,cyl(.012,.012,.3,4),m3Plain(0xe8d9b5),-.46-i*.02,1.95,.1+i*.03);
    const bw=new THREE.Mesh(new THREE.TorusGeometry(t>=2?.75:.6,t>=2?.035:.03,5,16,Math.PI),m3Plain(t>=2?0x8a5a2a:0xa9783f,.7));bw.rotation.z=-Math.PI/2;bw.position.set(.05,.02,0);bw.castShadow=true;L.add(bw);
    put(L,cyl(.004,.004,t>=2?1.5:1.2,3),m3Plain(0xf1e7cf),.05,0,0,false);rig.bow=true;return rig},
  sword(u,tm){const t=Math.max(2,Math.min(5,u.lvl||2)),bo=bodyOf(t,'sword',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1),L=armHand(rig,0);dress(rig,t,'sword',tm);headgear(rig,t,'war',tm);
    const sw=swordW(t);R.add(sw);sw.rotation.z=.2;const sh=shieldW(Math.min(3,t),tm,m3TeamL(u.team));if(sh&&t<=3){L.add(sh);sh.position.set(.2,0,.05)}return rig},
  crossbow(u,tm){const t=Math.max(3,Math.min(5,u.lvl||3)),bo=bodyOf(t,'crossbow',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1);dress(rig,t,'crossbow',tm);headgear(rig,t,'war',tm);
    const cb=new THREE.Group();put(cb,new THREE.BoxGeometry(.9,.1,.1),woodD(),.3,0,0);put(cb,new THREE.BoxGeometry(.1,.1,.95),metT(t),.7,0,0);R.add(cb);cb.position.set(.15,.1,0);return rig},
  musket(u,tm){const t=Math.max(4,Math.min(5,u.lvl||4)),bo=bodyOf(t,'musket',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1);dress(rig,t,'musket',tm);headgear(rig,t,'war',tm);
    const mu=gunW(t,false);R.add(mu);mu.rotation.z=1.2;mu.position.set(.1,0,0);return rig},
  rifle(u,tm){const r0=UNIT3._rifle(u,tm);return r0},
  _rifle(u,tm){const t=5,bo=bodyOf(t,'rifle',tm),rig=human({body:bo.body,legs:bo.legs,arm:bo.arm,belt:bo.belt}),R=armHand(rig,1);dress(rig,t,'rifle',tm);headgear(rig,t,'war',tm);
    const mu=gunW(t,true);R.add(mu);mu.rotation.z=1.2;mu.position.set(.1,0,0);return rig},
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
UNIT3.howitzer=(u,tm)=>{const g=new THREE.Group(),rig={g,legs:[],arms:[],wheels:[]};
  const paint=m3Mat('camo',0xffffff,{roughness:.65,metalness:.3}),steel=m3Mat('scratch',0x8a8d90,{roughness:.4,metalness:.8}),dark=m3Mat('scratch',0x3a3d38,{roughness:.55,metalness:.6}),wd=m3Mat('planks',0x6a4a2a);
  /* Räder mit Speichen und Reifen */
  for(const z of[-1,1]){const zz=z*.82,w=new THREE.Group();w.position.set(0,.6,zz);g.add(w);const rim=new THREE.Mesh(new THREE.TorusGeometry(.55,.07,8,22),dark);rim.castShadow=true;w.add(rim);
    put(w,cyl(.12,.12,.2,10),steel,0,0,0).rotation.x=Math.PI/2;for(let i=0;i<8;i++){const sp=put(w,cyl(.025,.025,.98,5),wd,0,0,0,false);sp.rotation.z=i*Math.PI/8}
    w.userData.axis='z';rig.wheels.push(w)}
  put(g,cyl(.06,.06,1.8,8),steel,0,.6,0).rotation.x=Math.PI/2;                                   /* Achse */
  /* Lafette: Wiege, Rohr mit Rücklaufhülse, Schutzschild, Holme (Spreizlafette) */
  put(g,rbox(1.3,.22,.8,.05),paint,0,.85,0);
  const bar=new THREE.Group();bar.position.set(.1,1.08,0);g.add(bar);rig.barrel=bar;
  put(bar,cyl(.13,.17,1.7,14),steel,.75,0,0).rotation.z=Math.PI/2;put(bar,cyl(.17,.17,.7,14),dark,.1,0,0).rotation.z=Math.PI/2;put(bar,cyl(.2,.2,.14,14),steel,.55,0,0).rotation.z=Math.PI/2;
  for(const x of[1.5,1.58,1.66])put(bar,cyl(.145,.145,.04,12),steel,x,0,0).rotation.z=Math.PI/2;
  const sh=put(g,rbox(.1,.95,1.45,.06),paint,.5,1.18,0);sh.rotation.z=-.12;put(g,rbox(.12,.5,.5,.05),dark,.5,1.1,0).rotation.z=-.12;
  for(const z of[-1,1]){const tr=put(g,rbox(2.2,.12,.14,.04),paint,-1.1,.35,z*.45);tr.rotation.y=z*.22;tr.rotation.z=.12;put(g,cyl(.05,.05,.3,8),steel,-2.05,.2,z*.7)}
  put(g,rbox(.1,.4,1.1,.04),tm,-.12,1.15,0,false);put(g,cyl(.05,.05,.5,6),steel,-.2,.9,.3).rotation.z=.5;                /* Teamfarbe, Richtkurbel */
  return rig};
UNIT3.ironclad=(u,tm)=>{const g=new THREE.Group(),rig={g,legs:[],arms:[],ship:true},hm=m3Mat('rust',0x4a505c,{roughness:.55,metalness:.55}),steel=m3Mat('scratch',0x6a707a,{roughness:.4,metalness:.8}),dark=m3Mat('scratch',0x2f3238,{roughness:.55,metalness:.6}),L=3.4;
  const hull=new THREE.Shape();hull.moveTo(-L,0);hull.lineTo(-L*.8,-.7);hull.lineTo(L*.8,-.7);hull.quadraticCurveTo(L*1.35,-.1,L*1.3,.3);hull.lineTo(L,.6);hull.lineTo(-L*.9,.6);hull.closePath();
  const hg=new THREE.ExtrudeGeometry(hull,{depth:1.7,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:2});hg.translate(0,0,-.85);uvScale(hg,.4);put(g,hg,hm,0,.55,0);
  put(g,rbox(2.8,.75,1.5,.12),m3Mat('rust',0x5a606c,{roughness:.55,metalness:.55}),0,1.55,0);                                       /* Kasematte */
  for(let i=0;i<14;i++){const a=i*.45;put(g,new THREE.SphereGeometry(.035,5,4),steel,-L*.8+i*.4,1.08,.85,false);put(g,new THREE.SphereGeometry(.035,5,4),steel,-L*.8+i*.4,1.08,-.85,false)}  /* Nieten */
  for(const x of[-.75,.95]){put(g,cyl(.3,.34,1.7,14),dark,x,2.4,0);put(g,cyl(.34,.34,.08,14),steel,x,3.25,0)}                    /* Schornsteine */
  for(const x of[-1.9,2.0]){const tr=put(g,cyl(.4,.45,.35,14),steel,x,1.0,0);put(g,cyl(.09,.09,1.3,10),dark,x+.75,1.1,0).rotation.z=Math.PI/2}  /* Geschütztürme */
  put(g,cyl(.02,.02,2.2,5),dark,-.2,3.2,.0);put(g,new THREE.PlaneGeometry(.9,.65),new THREE.MeshStandardMaterial({color:TC[u.team],side:THREE.DoubleSide}),-.65,3.9,0);
  put(g,new THREE.BoxGeometry(.05,.8,.06),dark,-.2,2.45,0);
  return rig};
/* Panzer: gerundete Wanne mit Glacis, Ketten mit Laufrollen und Gliedern, Turm mit Kuppel, Rohr mit Mündungsbremse, Nieten, Staukästen, Auspuff, Antenne; Tarnanstrich mit Kratzern */
UNIT3.tank=(u,tm)=>{const g=new THREE.Group(),rig={g,legs:[],arms:[],wheels:[]};
  const paint=m3Mat('camo',0xffffff,{roughness:.62,metalness:.3}),dark=m3Mat('scratch',0x3a3d38,{roughness:.55,metalness:.6}),steel=m3Mat('scratch',0x8a8d90,{roughness:.38,metalness:.8}),rub=m3Mat('rust',0x2c2a28,{roughness:.9}),olive2=m3Mat('camo',0xcfd6c0,{roughness:.7,metalness:.3});
  {const s=new THREE.Shape();s.moveTo(-1.65,.52);s.lineTo(-1.72,1.0);s.quadraticCurveTo(-1.7,1.14,-1.5,1.15);s.lineTo(.85,1.15);s.lineTo(1.72,.82);s.quadraticCurveTo(1.76,.7,1.66,.52);s.closePath();
   const hg=new THREE.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:3});hg.translate(0,0,-.6);uvScale(hg,.5);put(g,hg,paint,0,0,0)}
  const trk=[],riv=[];
  for(const z of[-1,1]){const zz=z*.95;
    const sh=new THREE.Shape();const L=1.95,Rr=.36;sh.moveTo(-L+Rr,.18);sh.lineTo(L-Rr,.18);sh.absarc(L-Rr,.54,Rr,-Math.PI/2,Math.PI/2,false);sh.lineTo(-L+Rr,.9);sh.absarc(-L+Rr,.54,Rr,Math.PI/2,Math.PI*1.5,false);
    const tg=new THREE.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:true,bevelSize:.03,bevelThickness:.03,bevelSegments:1});tg.translate(0,0,-.25);uvScale(tg,.4);put(g,tg,rub,0,0,zz);
    for(let i=0;i<5;i++){const w=put(g,cyl(.27,.27,.16,16),steel,-1.2+i*.62,.5,zz+z*.27);w.rotation.x=Math.PI/2;rig.wheels.push(w);put(g,cyl(.1,.1,.18,8),paint,-1.2+i*.62,.5,zz+z*.28).rotation.x=Math.PI/2;
      for(let k=0;k<6;k++){const a=k*1.047;riv.push([new THREE.SphereGeometry(.02,5,4).translate(-1.2+i*.62+Math.cos(a)*.19,.5+Math.sin(a)*.19,zz+z*.36),0x303030])}}
    for(const x of[-1.62,1.62]){const w=put(g,cyl(.34,.34,.17,18),steel,x,.54,zz+z*.27);w.rotation.x=Math.PI/2;rig.wheels.push(w)}
    for(let i=0;i<3;i++){const w=put(g,cyl(.1,.1,.14,8),steel,-.9+i*.9,.92,zz+z*.22);w.rotation.x=Math.PI/2}
    for(let i=0;i<34;i++){const x=-L+.3+i*(2*(L-.3)/33);trk.push([new THREE.BoxGeometry(.11,.06,.54).translate(x,.165,zz),0x242525]);trk.push([new THREE.BoxGeometry(.11,.06,.54).translate(x,.915,zz),0x242525])}
    put(g,rbox(3.8,.07,.66,.03),olive2,0,1.03,zz);put(g,rbox(.55,.1,.66,.03),olive2,1.92,.9,zz).rotation.z=-.5;
    put(g,rbox(3.4,.4,.05,.02),dark,0,.75,zz+z*.33);
    for(let i=0;i<22;i++)riv.push([new THREE.SphereGeometry(.022,5,4).translate(-1.55+i*.15,1.12,z*.62),0x3a3a38]);
    for(let i=0;i<14;i++)riv.push([new THREE.SphereGeometry(.022,5,4).translate(-1.4+i*.2,.62,z*.63),0x3a3a38])}
  {const m=new THREE.Mesh(mergeColored(trk),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:.5}));m.castShadow=true;g.add(m);
   const m2=new THREE.Mesh(mergeColored(riv),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.7}));g.add(m2)}
  for(const z of[-1,1]){put(g,rbox(.62,.22,.32,.04),olive2,-.9,1.18,z*.95);put(g,cyl(.1,.1,.34,10),m3Plain(0x6a5a2a,.6,{metalness:.3}),-1.35,1.2,z*.9).rotation.x=Math.PI/2;put(g,new THREE.SphereGeometry(.1,10,8),m3Plain(0xfff2c0,.3,{emissive:0xffe9a0,emissiveIntensity:.8}),1.5,1.12,z*.45);put(g,cyl(.1,.1,.05,10),dark,1.46,1.12,z*.45).rotation.x=Math.PI/2}
  put(g,new THREE.TorusGeometry(.5,.03,6,16,Math.PI*1.2),dark,.3,1.18,.58).rotation.x=Math.PI/2;
  for(const z of[-.3,.3]){put(g,cyl(.07,.07,.5,10),steel,-1.75,.95,z).rotation.z=Math.PI/2-.3;put(g,cyl(.09,.09,.08,10),dark,-1.97,.9,z).rotation.z=Math.PI/2}
  put(g,cyl(.012,.012,1.7,4),steel,-1.4,1.95,-.55);
  const tu=new THREE.Group();tu.position.set(-.15,1.15,0);g.add(tu);
  {const s=new THREE.Shape();s.moveTo(-.9,-.62);s.lineTo(.45,-.72);s.quadraticCurveTo(.95,-.5,.98,-.2);s.lineTo(.98,.2);s.quadraticCurveTo(.95,.5,.45,.72);s.lineTo(-.9,.62);s.quadraticCurveTo(-1.1,.3,-1.1,0);s.quadraticCurveTo(-1.1,-.3,-.9,-.62);
   const tg=new THREE.ExtrudeGeometry(s,{depth:.46,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:3});tg.rotateX(Math.PI/2);tg.translate(0,.56,0);uvScale(tg,.5);put(tu,tg,paint,0,0,0)}
  put(tu,rbox(.34,.44,.86,.07),dark,.98,.3,0);
  put(tu,cyl(.27,.31,.17,16),paint,-.35,.62,.26);put(tu,cyl(.22,.22,.05,16),steel,-.35,.72,.26);put(tu,rbox(.34,.05,.34,.02),steel,-.35,.77,.26).rotation.y=.4;put(tu,cyl(.05,.05,.1,8),dark,-.35,.8,.26);
  put(tu,cyl(.13,.13,.13,12),dark,-.1,.64,-.32);put(tu,cyl(.015,.015,.55,5),steel,.1,.98,-.32).rotation.z=-.4;
  for(const z of[-1,1]){put(tu,rbox(.66,.22,.04,.02),tm,-.1,.34,z*.76,false);put(tu,new THREE.SphereGeometry(.05,6,5),steel,.5,.5,z*.74)}
  const bar=new THREE.Group();bar.position.set(1.1,.34,0);tu.add(bar);rig.barrel=bar;
  put(bar,cyl(.085,.1,1.9,14),steel,.95,0,0).rotation.z=Math.PI/2;put(bar,cyl(.12,.12,.3,12),dark,1.95,0,0).rotation.z=Math.PI/2;
  for(const x of[1.86,1.93,2.0,2.07])put(bar,cyl(.128,.128,.03,12),steel,x,0,0).rotation.z=Math.PI/2;
  put(bar,cyl(.125,.14,.36,12),paint,.12,0,0).rotation.z=Math.PI/2;put(bar,cyl(.12,.12,.06,12),dark,.55,0,0).rotation.z=Math.PI/2;
  put(g,new THREE.SphereGeometry(.09,10,8),dark,1.3,1.0,-.25);put(g,cyl(.02,.02,.4,5),steel,1.5,1.0,-.25).rotation.z=Math.PI/2;
  return rig};
/* Gewehrschütze: Tornister mit Decke, Kreuzriemen, Patronentaschen, Feldflasche, Gamaschen */
{const base=UNIT3._rifle;UNIT3._rifle=(u,tm)=>{const rig=base(u,tm),leather=m3Plain(0x5a4028,.8),canvas=m3Plain(0xb7ab88,.9),g=rig.g;
  put(g,new THREE.BoxGeometry(.26,.52,.4),leather,-.4,1.52,0);put(g,cyl(.1,.1,.46,10),m3Plain(0x6a6048,.9),-.44,1.88,0).rotation.x=Math.PI/2;put(g,cyl(.08,.08,.2,8),m3Plain(0x7a8a5a,.5,{metalness:.4}),-.42,1.16,.25).rotation.x=0;
  for(const s of[-1,1]){const b=put(g,new THREE.BoxGeometry(.03,.9,.1),canvas,.28,1.5,0,false);b.rotation.x=s*.5}
  for(const z of[-.2,0,.2])put(g,new THREE.BoxGeometry(.1,.13,.12),leather,.3,1.1,z,false);
  put(g,new THREE.BoxGeometry(.04,.4,.62),canvas,.0,1.45,0,false).scale.set(.1,1,1);
  rig.knees.forEach(k=>{put(k,cyl(.1,.11,.26,8),canvas,0,-.3,0,false)});return rig}}
UNIT3.rifle=(u,tm)=>UNIT3._rifle(u,tm);
UNIT3.healer=(u,tm)=>{const t=Math.min(5,u.lvl||0),rig=human({body:m3Plain([0xd9cdb0,0xe8dfc8,0xf1ead6,0xf1ead6,0xf3efe4,0xe9edf2][t],.9),legs:cloth(0xe8e0cc),belt:tm}),R=armHand(rig,1);
  put(rig.g,new THREE.BoxGeometry(.5,.12,.64),tm,0,1.78,0,false);put(rig.g,cyl(.34,.42,.9,12),m3Plain([0xd9cdb0,0xe8dfc8,0xf1ead6,0xf1ead6,0xf3efe4,0xe9edf2][t],.9),0,1.0,0);
  put(rig.g,new THREE.BoxGeometry(.04,.34,.1),m3Plain(0x3aa05a),.3,1.4,0,false);put(rig.g,new THREE.BoxGeometry(.04,.1,.34),m3Plain(0x3aa05a),.3,1.4,0,false);
  put(rig.g,new THREE.SphereGeometry(.29,10,8,0,6.283,0,2.1),m3Plain(0xe8dfc8,.9),-.03,2.04,0);
  put(R,cyl(.04,.04,1.9,6),wood(),0,.3,0);put(R,new THREE.SphereGeometry(.14,8,8),m3Plain(0x3aa05a,.4,{emissive:0x2a8a4a,emissiveIntensity:.5}),0,1.28,0);return rig};
UNIT3.boat=(u,tm)=>ship(u,tm,false,false);UNIT3.warship=(u,tm)=>ship(u,tm,true,false);UNIT3.galleon=(u,tm)=>ship(u,tm,true,true);

/* Vierbeiner: o = {col,belly,dark,br (Rumpfradius),bl (Rumpflänge),legH,lw (Beinbreite),hr (Kopfradius),neck:[x,y],snout,ears,tail}. Blickt in +x. */
function quad(o){
  const g=new THREE.Group(),rig={g,legs:[]},m=m3Plain(o.col,.9),mb=m3Plain(o.belly||o.col,.9),dk=m3Plain(o.dark||0x2a2119,.9),by=o.legH+o.br*.85;
  put(g,new THREE.CapsuleGeometry(o.br,o.bl*.62,4,10),m,o.bl*.2,by+o.br*.06,0).rotation.z=Math.PI/2; /* Brust und Schulter */
  put(g,new THREE.CapsuleGeometry(o.br*.92,o.bl*.55,4,10),m,-o.bl*.24,by,0).rotation.z=Math.PI/2; /* Hinterteil */
  put(g,new THREE.CapsuleGeometry(o.br*.74,o.bl*.95,4,8),mb,0,by-o.br*.34,0).rotation.z=Math.PI/2; /* Bauch */
  for(const z of[-1,1])put(g,new THREE.SphereGeometry(o.br*.62,8,6),m,-o.bl*.42,by+o.br*.05,z*o.br*.5).scale.set(1,1.1,.8); /* Keulen */
  if(o.hump)put(g,new THREE.SphereGeometry(o.br*.95,10,8),m,o.bl*.28,by+o.br*.45,0);
  const hipY=o.legH+o.br*.35;
  rig.knees=[];for(const[x,z]of[[-o.bl*.5,-o.br*.6],[-o.bl*.5,o.br*.6],[o.bl*.5,-o.br*.6],[o.bl*.5,o.br*.6]]){const p=limbPivot(g,x,hipY,z);put(p,cyl(o.lw*1.3,o.lw*.95,hipY*.55,7),m,0,-hipY*.27,0);
    const kn=limbPivot(p,0,-hipY*.55,0);put(kn,new THREE.SphereGeometry(o.lw*.95,6,5),m,0,0,0);put(kn,cyl(o.lw*.8,o.lw*.6,hipY*.47,7),m,0,-hipY*.23,0);put(kn,new THREE.SphereGeometry(o.lw*1.05,6,5),dk,.03,-hipY*.46,0).scale.set(1.3,.8,1);rig.legs.push(p);rig.knees.push(kn)}
  const nx=o.bl/2+o.br*.5,hx=nx+o.neck[0],hy=by+o.neck[1];
  const neck=put(g,cyl(o.br*.5,o.br*.62,Math.hypot(o.neck[0],o.neck[1])+o.br*.4,8),m,nx+o.neck[0]/2,by+o.neck[1]/2,0);neck.rotation.z=-Math.atan2(o.neck[0],o.neck[1]);
  const head=new THREE.Group();head.position.set(hx,hy,0);g.add(head);rig.head=head;
  put(head,new THREE.SphereGeometry(o.hr,12,10),m,0,0,0);
  const sn=put(head,new THREE.BoxGeometry(o.hr*1.5*(o.snout||1),o.hr*.7,o.hr*.8),o.snoutCol?m3Plain(o.snoutCol):m,o.hr*1.0*(o.snout||1),-o.hr*.2,0);put(head,new THREE.SphereGeometry(o.hr*.2,6,6),dk,o.hr*1.7*(o.snout||1),-o.hr*.15,0);
  for(const z of[-1,1]){put(head,new THREE.SphereGeometry(o.hr*.11,6,6),m3Plain(0x15110c),o.hr*.7,o.hr*.25,z*o.hr*.45,false);put(head,cone(o.hr*.35,o.hr*(o.earLen||.9),5),o.earCol?m3Plain(o.earCol):m,-o.hr*.2,o.hr*.95,z*o.hr*.55).rotation.x=z*.2}
  if(o.antlers)for(const z of[-1,1]){const base=put(head,cyl(.03,.04,o.hr*1.8,5),m3Plain(0xc9b690),-o.hr*.1,o.hr*1.9,z*o.hr*.5);base.rotation.x=z*.35;for(const k of[.4,.8]){const br=put(head,cyl(.025,.03,o.hr*1.1,5),m3Plain(0xc9b690),o.hr*(k*.2),o.hr*(1.3+k),z*o.hr*(.6+k*.5));br.rotation.z=-.7;br.rotation.x=z*.5}}
  if(o.trunk){const tk=put(head,cyl(o.hr*.38,o.hr*.22,o.hr*3.2,8),m,o.hr*1.2,-o.hr*1.2,0);tk.rotation.z=.25;put(head,cyl(o.hr*.22,o.hr*.16,o.hr*1.2,8),m,o.hr*1.65,-o.hr*2.6,0).rotation.z=-.5}
  if(o.tusks)for(const z of[-1,1]){const t=put(head,new THREE.TorusGeometry(o.hr*1.1,o.hr*.09,6,12,2.3),m3Plain(0xf1ead2,.6),o.hr*1.0,-o.hr*.9,z*o.hr*.55);t.rotation.set(0,0,-1.3)}
  if(o.fangs)for(const z of[-1,1])put(head,cone(o.hr*.12,o.hr*1.0,5),m3Plain(0xf1ead2,.6),o.hr*1.5,-o.hr*.95,z*o.hr*.25).rotation.x=Math.PI;
  if(o.shaggy)put(g,new THREE.SphereGeometry(o.br*1.05,10,8),m3Mat('fur',0x5a3c28),0,o.legH+o.br*.7,0).scale.set(1.5,.55,1);
  const tl=put(g,cone(o.br*.35,o.bl*(o.tail||.5),6),o.tailCol?m3Plain(o.tailCol):m,-o.bl/2-o.br*.7,by+o.br*.15,0);tl.rotation.z=Math.PI/2+.5;
  if(o.stripes)for(let i=0;i<7;i++){const x=-o.bl*.45+i*(o.bl*.9/6);put(g,new THREE.BoxGeometry(o.br*.28,o.br*1.5,o.br*2.1),dk,x,by+o.br*.05,0,false).rotation.z=(i%2?.12:-.12)}
  if(o.spots)for(let i=0;i<8;i++){put(g,new THREE.SphereGeometry(o.br*.16,6,5),m3Plain(0xe8dcc0),-o.bl*.4+(i%4)*o.bl*.27,by+o.br*.7,(i<4?-1:1)*o.br*.3,false)}
  return rig}
const ANI3={
  deer:{col:0xa87a4b,belly:0xd8c19a,dark:0x3a2a1a,br:.34,bl:.85,legH:.85,lw:.075,hr:.2,neck:[.45,.85],snout:1.2,earLen:.8,antlers:true,spots:true,tail:.18,tailCol:0xf3ead6,earCol:0xc39b6a},
  wolf:{col:0x7d7f84,belly:0xc9c9c6,dark:0x222428,br:.29,bl:.75,legH:.52,lw:.07,hr:.2,neck:[.35,.3],snout:1.3,earLen:.7,tail:.8,tailCol:0x6a6c70},
  bear:{col:0x5b3f2a,belly:0x4a3322,dark:0x1c130c,br:.55,bl:1.0,legH:.5,lw:.14,hr:.31,neck:[.5,.3],snout:.8,earLen:.4,hump:true,tail:.15,snoutCol:0x8a6a4a},
  mammoth:{col:0x6b4a30,belly:0x5a3c28,dark:0x2a1c12,br:.95,bl:1.7,legH:.95,lw:.26,hr:.5,neck:[.75,.25],snout:.5,earLen:.5,hump:true,tail:.2,trunk:true,tusks:true,shaggy:true},
  sabertooth:{col:0xc99a5a,belly:0xe8d4a8,dark:0x2a1c10,br:.4,bl:1.2,legH:.55,lw:.13,hr:.28,neck:[.5,.28],snout:.8,earLen:.45,tail:.25,tailCol:0xc99a5a,fangs:true,spots:true},
  tiger:{col:0xd9822b,belly:0xf1dcb5,dark:0x1d1510,br:.34,bl:1.1,legH:.58,lw:.1,hr:.25,neck:[.45,.28],snout:.9,earLen:.5,stripes:true,tail:.9,tailCol:0xd9822b}
};
/* Stromlinienkörper für Wale und Delfine: Drehkörper mit dickem Kopf und dünnem Schwanz, oben dunkel, unten hell. Nase zeigt nach +x. */
function swimBody(L,R,topC,botC){const N=20,pts=[];for(let i=N;i>=0;i--){const u=i/N,y=L/2-u*L;pts.push(new THREE.Vector2(R*Math.pow(Math.sin(Math.PI*Math.pow(u,.7)),.75)*(1-.45*u)+.002,y))}
  const g=new THREE.LatheGeometry(pts,16);g.rotateZ(-Math.PI/2);const n=g.attributes.normal,col=new Float32Array(n.count*3),a=new THREE.Color(topC),b=new THREE.Color(botC),c=new THREE.Color();
  for(let i=0;i<n.count;i++){c.copy(a).lerp(b,Math.max(0,Math.min(1,.35-n.getY(i)*1.4)));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}g.setAttribute('color',new THREE.BufferAttribute(col,3));return g}
function buildAnimal(e){const rig=quad(ANI3[e.type]||ANI3.deer);setShadows(rig.g);rig.g.scale.setScalar(e.type==='bear'?1.15:e.type==='mammoth'?1.25:1.1);return rig}
/* Oberkörper an einem Hüftgelenk aufhängen, damit er sich beim Gehen, Arbeiten und Kämpfen neigen und drehen kann */
function addUpper(rig){
  if(!rig.legs||rig.legs.length!==2||!rig.arms||rig.arms.length!==2||rig.horse||rig.wheels||rig.ship)return;
  const up=new THREE.Group();up.position.y=.9;
  for(const ch of[...rig.g.children]){if(rig.legs.includes(ch))continue;rig.g.remove(ch);ch.position.y-=.9;up.add(ch)}
  rig.g.add(up);rig.up=up}
function buildUnit(u){M3.curId=u.id;const f=UNIT3[u.type]||UNIT3.worker,tm=m3Team(u.team),rig=f(u,tm);addUpper(rig);setShadows(rig.g);return rig}

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
/* Vorkommen: je Art drei Varianten (Form und Farbe): Stein = Granit-Block, Sandstein-Platte, dunkler Basalt-Turm; Eisen = rostbraune Brocken mit Erzadern; Gold = Quarz mit Goldkristallen; Öl = dunkle Lache mit Pumpenschatten */
const ROCKPAL={stone:[0x9d998e,0xb59a68,0x585550],iron:[0x6b4a3a,0x4a5060,0x5a3a30],gold:[0x7a6a48,0x8a7d5c,0x6a5f4a],oil:[0x1d1a18,0x26211d,0x15120f]};
function rockGeoC(kind,v){
  const seed=v*2+1+(kind==='iron'?10:kind==='gold'?20:0),g=rockGeo(seed).toNonIndexed(),p=g.attributes.position;
  const sh=[[1,1,1],[1.5,.55,1.25],[.7,1.7,.75]][v];for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*sh[0],p.getY(i)*sh[1],p.getZ(i)*sh[2]);g.computeVertexNormals();
  const col=new Float32Array(p.count*3),base=new THREE.Color(ROCKPAL[kind][v]),moss=new THREE.Color(kind==='stone'?0x7f8a62:ROCKPAL[kind][v]).multiplyScalar(.9),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const y=p.getY(i),n=.84+.22*Math.sin(p.getX(i)*5+p.getZ(i)*3+seed*4);c.copy(base).multiplyScalar(n);if(kind==='stone'&&y>.45)c.lerp(moss,Math.min(1,(y-.45)*1.3)*.5);if(kind==='stone'&&v===1)c.multiplyScalar(.9+.1*Math.sin(y*30));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const parts=[];
  if(kind==='iron')for(let i=0;i<9;i++){const a=i*1.9+seed*9,b=new THREE.IcosahedronGeometry(.11+(i%3)*.03,0);b.translate(Math.cos(a)*.8*sh[0]*.9,.3+((i*37)%10)/14*sh[1],Math.sin(a)*.8*sh[2]*.9);parts.push([b,[0xf0903a,0xd96a2a,0x9aa4b4][i%3]])}
  if(kind==='gold')for(let i=0;i<13;i++){const a=i*2.3+seed*5,b=new THREE.OctahedronGeometry(.17,0);b.scale(.8,2.4+(i%3)*.6,.8);b.rotateZ((i%3-1)*.4);b.translate(Math.cos(a)*.62*sh[0],.55+(i%4)*.12,Math.sin(a)*.62*sh[2]);parts.push([b,[0xf7d64a,0xffe680,0xe0b030][i%3]])}
  if(kind==='stone')for(let i=0;i<4;i++){const a=i*1.7+seed,b=new THREE.DodecahedronGeometry(.16+(i%2)*.06,0);b.translate(Math.cos(a)*1.25*sh[0],.06,Math.sin(a)*1.25*sh[2]);parts.push([b,ROCKPAL.stone[(v+i)%3]])}
  if(kind==='oil'){const d=new THREE.CylinderGeometry(1.2,1.3,.08,16);d.translate(0,.02,0);parts.push([d,0x0c0a09]);for(let i=0;i<5;i++){const b=new THREE.SphereGeometry(.2+(i%3)*.07,8,6);b.scale(1,.35,1);b.translate(Math.cos(i*1.3)*.8,.06,Math.sin(i*1.3)*.8);parts.push([b,0x151210])}}
  if(!parts.length)return g;
  const extra=mergeColored(parts),all=new THREE.BufferGeometry(),cat=arr=>{let n=0;arr.forEach(a=>n+=a.length);const r=new Float32Array(n);let o=0;arr.forEach(a=>{r.set(a,o);o+=a.length});return r};
  const gg=kind==='oil'?null:g;
  const pa=[...(gg?[g.attributes.position.array]:[]),extra.attributes.position.array],na=[...(gg?[g.attributes.normal.array]:[]),extra.attributes.normal.array],ca=[...(gg?[g.attributes.color.array]:[]),extra.attributes.color.array];
  all.setAttribute('position',new THREE.BufferAttribute(cat(pa),3));all.setAttribute('normal',new THREE.BufferAttribute(cat(na),3));all.setAttribute('color',new THREE.BufferAttribute(cat(ca),3));return all}
