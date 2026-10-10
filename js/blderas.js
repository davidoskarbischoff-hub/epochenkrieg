/* Epochenkrieg – Gebäude-Aussehen je Zeitalter (Ergänzung zu models3d.js):
   Hütte → Fachwerk → Bürgerhaus → Stadthaus → Backsteinhaus → Betonbau; Kaserne, Mine, Hauptlager (Renaissance-Palazzo, Industrie-Rathaus, Betonbunker) und Turm. */
(()=>{
const O={house:BLD3.house,barracks:BLD3.barracks,mine:BLD3.mine,tower:BLD3.tower,hq:BLD3.hq,store:BLD3.store};
const mud=()=>m3Mat('planks',0xb89466),plaster=()=>m3Plain(0xe2d8c0,.9),beam=()=>woodD(),conc=()=>m3Mat('stone',0x9a9a94),concD=()=>m3Plain(0x6a6c6a,.9),
  brick=c=>m3Mat('brick',c||0xa8503f),sand=()=>m3Plain(0xb8a578,.95),camo=()=>m3Plain(0x5a6a3e,.95),iron=()=>m3Plain(0x3a3d42,.5,{metalness:.6});
const glass=()=>m3Plain(0xbad4e6,.2,{metalness:.2}),dark=()=>m3Plain(0x15110c,.9);
function winGrid(g,xs,ys,z,w,h,lit){for(const y of ys)for(const x of xs){put(g,new THREE.BoxGeometry(w+.14,h+.14,.08),woodD(),x,y,z,false);put(g,new THREE.BoxGeometry(w,h,.1),lit?m3Plain(0xffe9a8,.3,{emissive:0xffcc66,emissiveIntensity:.35}):glass(),x,y,z+.02,false)}}
function winGridBack(g,xs,ys,z,w,h){winGrid(g,xs,ys,z,w,h)}
function chimney(g,x,y,z,h,m){put(g,bx(.38,h,.38,1),m,x,y+h/2,z);put(g,bx(.5,.12,.5,1),m,x,y+h,z)}
function sandbags(g,x,y,z,n,r){for(let i=0;i<n;i++){const a=i/n*6.283;const b=put(g,new THREE.SphereGeometry(.2,6,5),sand(),x+Math.cos(a)*r,y,z+Math.sin(a)*r);b.scale.set(1.4,.7,1)}}
function sbLine(g,x,y,z,n,len){for(let i=0;i<n;i++){const b=put(g,new THREE.SphereGeometry(.2,6,5),sand(),x-len/2+i*len/(n-1),y+.12+(i%2)*.0,z);b.scale.set(1.5,.7,1)}for(let i=0;i<n-1;i++){const b=put(g,new THREE.SphereGeometry(.2,6,5),sand(),x-len/2+(i+.5)*len/(n-1),y+.3,z);b.scale.set(1.5,.7,1)}}
function camoNet(g,x,y,z,w,d){const n=put(g,new THREE.BoxGeometry(w,.05,d),camo(),x,y,z);n.rotation.z=.08;for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]])put(g,cyl(.04,.04,y,4),woodD(),x+a*w/2,y/2,z+b*d/2)}
function tent(g,x,z,s){const t=put(g,cone(.7*s,.75*s,4),m3Plain(0x7a7a58,.95),x,.37*s,z);t.rotation.y=.785;t.scale.set(1.3,1,1)}

/* ----- Wohnhäuser ----- */
BLD3.house=(R,st,team)=>{const ep=st.ep;if(ep<=0)return O.house(R,st,team);
  const g=new THREE.Group(),w=R*2.2,d=R*1.7;
  if(ep===1){for(const[x,z,k]of[[0,0,1],[R*1.25,-R*.5,.7]]){put(g,cyl(R*.75*k,R*.82*k,R*.7*k,12),mud(),x,R*.35*k+.1,z);put(g,cone(R*1.12*k,R*.95*k,12),m3Mat('thatch',0xc9a864),x,R*.7*k+R*.47*k+.1,z);if(k===1){door(g,x,z+R*.78,R*.4,R*.55)}}
    for(let i=0;i<9;i++){const a=-.9+i*.35;put(g,cyl(.04,.04,.5,4),woodD(),Math.cos(a+1.57)*R*1.5,.25,Math.sin(a+1.57)*R*1.5+R*.3)}
    g.userData.h=R*1.8;return g}
  if(ep===2){const h=R*.95;put(g,bx(w,h*.5,d,2),m3Mat('stone',0x9a968c),0,h*.25,0);put(g,bx(w*.98,h*.55,d*.98,2),plaster(),0,h*.5+h*.27,0);
    for(let i=0;i<6;i++)put(g,bx(.1,h*.56,.1,1),beam(),-w*.45+i*w*.18,h*.5+h*.27,d*.5);
    put(g,bx(w,.1,.1,1),beam(),0,h*.55,d*.5);put(g,bx(w,.1,.1,1),beam(),0,h*1.0,d*.5);
    gab(g,0,h*1.05,0,w,d,h*.8,plaster(),m3Mat('shingle',0x6a5a48),.3);door(g,-w*.25,d/2+.02,R*.4,R*.62);winGrid(g,[w*.2],[h*.72],d/2+.04,.34,.36);chimney(g,w*.32,h*1.1,-d*.2,h*.7,m3Mat('stone',0x8d8a80));g.userData.h=h*2;return g}
  if(ep===3){const h=R*.7;put(g,bx(w*.92,h,d*.92,2),m3Mat('stone',0xa29d94),0,h/2,0);put(g,bx(w*1.04,h*.85,d*1.02,2),plaster(),0,h+h*.43,0);
    for(let i=0;i<7;i++)put(g,bx(.1,h*.85,.1,1),beam(),-w*.5+i*w*.166,h+h*.43,d*.52);for(const y of[h+.05,h*1.85])put(g,bx(w*1.06,.12,.12,1),beam(),0,y,d*.52);
    for(let i=0;i<4;i++){const x=-w*.4+i*w*.27;const dg=put(g,bx(.08,h*.9,.08,1),beam(),x,h+h*.43,d*.52);dg.rotation.z=i%2?.7:-.7}
    gab(g,0,h*1.85,0,w*1.06,d*1.04,h*.95,plaster(),m3Mat('tiles',0x9a4a38),.3);door(g,-w*.22,d*.46+.02,R*.38,R*.55);winGrid(g,[w*.18,w*.38],[h*.55,h*1.45],d*.52+.04,.3,.34);chimney(g,w*.3,h*2.1,-d*.2,h*.8,m3Mat('stone',0x8d8a80));g.userData.h=h*3;return g}
  if(ep===4){const h=R*.62;put(g,bx(w,h*2.1,d,2),m3Mat('stone',0xc4b8a2),0,h*1.05,0);for(const y of[h*1.05])put(g,bx(w*1.03,.14,d*1.03,1),m3Plain(0xe8dcc4,.8),0,y,0);put(g,bx(w*1.04,.2,d*1.04,1),m3Plain(0xe8dcc4,.8),0,h*2.1,0);
    gab(g,0,h*2.1,0,w*1.04,d*1.04,h*.8,m3Plain(0xc4b8a2),m3Mat('shingle',0x58708a),.2);
    door(g,0,d/2+.02,R*.4,R*.62);put(g,new THREE.BoxGeometry(R*.7,.12,.3),m3Plain(0xe8dcc4,.8),0,R*.72,d/2+.12);
    winGrid(g,[-w*.32,w*.32],[h*.6,h*1.55],d/2+.04,.32,.5);winGrid(g,[-w*.12,w*.12],[h*1.55],d/2+.04,.32,.5);
    for(const x of[-w*.22,w*.22]){put(g,bx(.5,.5,.5,1),m3Plain(0xc4b8a2),x,h*2.1+h*.5,d*.1);gab(g,x,h*2.1+h*.75,d*.1,.5,.5,.3,m3Plain(0xc4b8a2),m3Mat('shingle',0x58708a),.05)}
    chimney(g,w*.34,h*2.4,-d*.25,h*.7,m3Mat('brick',0xa8503f));g.userData.h=h*3.4;return g}
  if(ep===5){const h=R*.62;put(g,bx(w,h*3,d*.95,2),brick(),0,h*1.5,0);put(g,bx(w*1.04,.18,d,1),m3Plain(0x5a5048,.9),0,h*3,0);
    gab(g,0,h*3,0,w*1.02,d*.98,h*.45,brick(0x8f4538),m3Mat('shingle',0x3e444d),.1);
    winGrid(g,[-w*.34,-w*.12,w*.12,w*.34],[h*.65,h*1.5,h*2.35],d*.475+.04,.3,.44,true);door(g,0,d*.475+.02,R*.4,R*.6);
    chimney(g,-w*.3,h*3.2,0,h*1.1,brick(0x6a3a2e));chimney(g,w*.3,h*3.2,0,h*1.0,brick(0x6a3a2e));g.userData.h=h*4.2;return g}
  { /* ep6: Betonblock */ const h=R*.6;put(g,bx(w,h*3,d*.95,2),conc(),0,h*1.5,0);put(g,bx(w*1.04,.2,d,1),concD(),0,h*3,0);for(const y of[h,h*2])put(g,bx(w*1.02,.1,d*.97,1),concD(),0,y,0);
    winGrid(g,[-w*.36,-w*.18,0,w*.18,w*.36],[h*.62,h*1.55,h*2.45],d*.475+.04,.2,.4,true);door(g,w*.28,d*.475+.02,R*.34,R*.55);
    put(g,cyl(.35,.35,.7,10),m3Plain(0x5a6a5a,.6,{metalness:.4}),-w*.3,h*3.45,0);put(g,cyl(.02,.02,1.4,4),iron(),w*.32,h*3.9,0);g.userData.h=h*4.2;return g}
};

/* ----- Kaserne ----- */
BLD3.barracks=(R,st,team)=>{const ep=st.ep;if(ep<=0||ep===3||ep===4)return O.barracks(R,st,team);
  const g=new THREE.Group(),w=R*2.6,d=R*1.5,h=R*.8;
  if(ep===1){put(g,bx(w,h*.7,d,2),mud(),0,h*.35,0);gab(g,0,h*.7,0,w+.3,d+.4,h*.8,mud(),m3Mat('thatch',0xc9a864),.3);door(g,0,d/2+.02,R*.7,R*.62);
    for(let i=-7;i<=7;i++){const x=i*R*.22;put(g,cyl(.1,.12,R*1.0,6),wood(),x,R*.5,R*1.25);put(g,cone(.12,.3,6),wood(),x,R*1.0+.15,R*1.25)}
    for(let i=0;i<4;i++)put(g,cyl(.04,.04,1.6,5),woodD(),w*.6+i*.22,.8,-d*.3).rotation.z=.1;g.userData.h=h*2;flagPole(g,-w*.4,h*1.6,-d*.3,R*1.1,team);return g}
  if(ep===2){put(g,bx(w,h,d,2),m3Mat('stone',0x9a968c),0,h/2,0);gab(g,0,h,0,w,d,h*.7,m3Mat('stone',0x9a968c),m3Mat('shingle',0x6a5a48),.25);door(g,0,d/2+.02,R*.65,R*.7);winGrid(g,[-w*.32,w*.32],[h*.6],d/2+.04,.34,.4);
    for(const x of[-1,1]){put(g,cyl(.08,.1,1.0,6),woodD(),x*w*.7,.5,R*.9);put(g,new THREE.SphereGeometry(.28,8,6),m3Plain(0xb8a578,.9),x*w*.7,1.15,R*.9)}
    for(let i=-4;i<=4;i++)put(g,cyl(.05,.06,.8,5),wood(),i*R*.3,.4,R*1.5);flagPole(g,w*.4,h*1.6,-d*.3,R*1.1,team);g.userData.h=h*2;return g}
  if(ep===5){put(g,bx(w,h*1.5,d,2),brick(),0,h*.75,0);put(g,bx(w*1.03,.16,d*1.03,1),m3Plain(0x5a5048,.9),0,h*1.5,0);gab(g,0,h*1.5,0,w*1.02,d*1.02,h*.5,brick(0x8f4538),m3Mat('shingle',0x3e444d),.1);
    winGrid(g,[-w*.35,-w*.18,w*.18,w*.35],[h*.5,h*1.1],d/2+.04,.26,.34,true);put(g,bx(R*.9,h*2.3,R*.9,2),brick(),0,h*1.15,d/2+R*.3);put(g,cone(R*.75,R*.5,4),m3Mat('shingle',0x3e444d),0,h*2.3+R*.25,d/2+R*.3).rotation.y=.785;
    put(g,cyl(.28,.28,.08,16),m3Plain(0xf0ead6,.5),0,h*1.8,d/2+R*.78).rotation.x=Math.PI/2;door(g,0,d/2+R*.76,R*.45,R*.6);
    flagPole(g,w*.42,h*2.0,-d*.2,R*1.2,team);for(let i=-3;i<=3;i++)put(g,cyl(.04,.04,.7,4),iron(),i*R*.4,.35,R*1.5);g.userData.h=h*3;return g}
  { /* ep6 */ put(g,bx(w,h*.9,d,2),conc(),0,h*.45,0);put(g,bx(w*1.04,.2,d*1.04,1),concD(),0,h*.9,0);sandbags(g,0,h*.95,0,18,Math.min(w,d)*.55);
    put(g,bx(w*.5,h*.5,d*.5,2),concD(),w*.1,h*1.15,0);put(g,new THREE.BoxGeometry(w*.5,.3,.12),dark(),0,h*.55,d/2+.02);winGrid(g,[-w*.3,w*.3],[h*.55],d/2+.04,.5,.2);door(g,0,d/2+.02,R*.5,R*.55);
    camoNet(g,-w*.55,1.1,R*1.0,R*1.5,R*1.1);tent(g,w*.62,R*.8,1.1);tent(g,w*.62,-R*.5,1.0);sbLine(g,w*.3,.1,R*1.3,6,R*1.4);flagPole(g,w*.42,h*1.6,-d*.3,R*1.2,team);g.userData.h=h*2.4;return g}
};

/* ----- Mine ----- */
BLD3.mine=(R,st,team)=>{const ep=st.ep;if(ep<=1)return O.mine(R,st,team);
  const g=new THREE.Group(),rk=m3Mat('stone',0x7a766c);put(g,new THREE.CylinderGeometry(R*1.25,R*1.5,.5,14),rk,0,.25,0);
  const rail=(len)=>{for(const s of[-1,1])put(g,bx(len,.06,.06,1),iron(),R*.9+len/2-.2,.55,s*.22);for(let i=0;i<6;i++)put(g,bx(.1,.06,.7,1),woodD(),R*.9+i*len/6,.52,0)};
  if(ep<=3){put(g,bx(R*1.7,R*1.2,R*.7,2),m3Mat('stone',0x8d8a80),0,R*.6+.4,-R*.5);put(g,new THREE.BoxGeometry(R*.8,R*.9,.12),dark(),0,R*.45+.4,-R*.14);
    for(const s of[-1,1])put(g,bx(.2,R*1.0,.2,1),woodD(),s*R*.5,R*.5+.4,-R*.12);put(g,bx(R*1.2,.2,.24,1),woodD(),0,R*.95+.4,-R*.12);rail(R*1.4);
    put(g,bx(.8,.4,.5,1),m3Mat('planks',0x6a4a2c),R*1.5,.75,0);put(g,new THREE.SphereGeometry(.22,8,6),m3Plain(ep>=3?0xf0c030:0x8d9bb0,.4,{metalness:.8}),R*1.5,1.0,0);g.userData.h=R*1.8;flagPole(g,-R*.9,.6,R*.3,R*1.0,team);return g}
  const H=ep>=6?R*3.4:R*2.8,mat=ep>=6?concD():m3Plain(0x4a4f5a,.5,{metalness:.6});
  for(const[x,z]of[[-1,-1],[1,-1],[1,1],[-1,1]])put(g,cyl(.08,.1,H,6),mat,x*R*.5,H/2+.3,z*R*.5).rotation.set(z*.12,0,-x*.12);
  for(let k=1;k<4;k++)put(g,bx(R*.95,.07,.07,1),mat,0,H*k/4+.3,R*.45*(k%2?1:-1));
  put(g,bx(R*1.3,.25,R*1.3,1),mat,0,H+.4,0);const wh=put(g,cyl(R*.5,R*.5,.14,16),iron(),0,H+.7,0);wh.rotation.x=Math.PI/2;put(g,cyl(.04,.04,H,4),m3Plain(0xcccccc,.6),R*.2,H*.5+.3,0);
  put(g,bx(R*1.4,R*.9,R*1.0,2),ep>=6?conc():brick(),-R*.3,R*.45+.4,-R*1.0);gab(g,-R*.3,R*.9+.4,-R*1.0,R*1.4,R*1.0,R*.4,brick(),m3Mat('shingle',0x3e444d),.1);
  rail(R*1.6);put(g,bx(.9,.5,.55,1),iron(),R*1.7,.8,0);put(g,new THREE.SphereGeometry(.26,8,6),m3Plain(ep>=6?0xf0c030:0xf0c030,.3,{metalness:.9}),R*1.7,1.1,0);
  if(ep>=6){put(g,cyl(.3,.3,1.2,10),m3Plain(0x5a6a5a,.6,{metalness:.4}),R*1.2,.8,-R*1.0);sbLine(g,0,.3,R*1.3,6,R*1.6)}
  g.userData.h=H+1;flagPole(g,R*.9,H*.5,R*.9,R*1.0,team);return g};

/* ----- Turm im Weltkrieg: Betonwachturm mit Scheinwerfer ----- */
BLD3.tower=(R,st,team)=>{if(st.ep<6)return O.tower(R,st,team);
  const g=new THREE.Group(),H=R*3;put(g,cyl(R*.8,R*1.0,H,12),conc(),0,H/2,0);put(g,cyl(R*1.2,R*1.1,.5,12),concD(),0,H+.15,0);
  sandbags(g,0,H+.55,0,14,R*1.05);put(g,cyl(.28,.28,.3,10),iron(),R*.4,H+.7,0);const sl=put(g,cyl(.22,.3,.5,10),m3Plain(0xdddddd,.3,{metalness:.8}),-R*.4,H+.85,0);sl.rotation.z=1.2;
  put(g,bx(.9,.5,.12,1),dark(),0,H*.6,R*.82);put(g,cyl(.02,.02,R*1.6,4),iron(),R*.5,H+R*.9,-R*.3);flagPole(g,0,H+.4,0,R*1.1,team);g.userData.h=H+R;return g};

/* ----- Hauptlager: Renaissance-Palazzo, Industrie-Rathaus, Betonbunker ----- */
BLD3.hq=(R,st,team)=>{const ep=st.ep;if(ep<4)return O.hq(R,st,team);
  const g=new THREE.Group(),w=R*2.8,d=R*1.7,h=R*1.05;
  if(ep===4){const stn=m3Plain(0xd8cdb4,.85),trim=m3Plain(0xf0e8d6,.7),roof=m3Mat('shingle',0x58708a);
    put(g,bx(w+1.2,.3,d+1.2,3),m3Mat('stone',0xa89a80),0,.15,0);put(g,bx(w,h*2,d,2),stn,0,.3+h,0);put(g,bx(w+.2,.2,d+.2,1),trim,0,.3+h*2,0);put(g,bx(w+.1,.12,d+.1,1),trim,0,.3+h,0);
    for(let i=0;i<5;i++)put(g,bx(.18,h*.18,.2,1),trim,-w*.48+i*w*.24,.3+h*2.12,d*.5);
    winGrid(g,[-w*.4,-w*.28,-w*.16,w*.16,w*.28,w*.4],[.3+h*.55,.3+h*1.5],d/2+.04,.3,.55);
    const px=R*.9;put(g,bx(px*2,h*2.05,.5,1),trim,0,.3+h,d/2+.25);for(let i=-2;i<=2;i++)put(g,cyl(.14,.16,h*1.7,10),trim,i*px*.42,.3+h*.9,d/2+.55);
    const ped=gab(g,0,.3+h*1.95,d/2+.3,.5,px*2.1,h*.45,trim,trim,.05);door(g,0,d/2+.5,R*.5,R*.8);
    for(const s of[-1,1]){put(g,bx(R*.7,h*2.5,d*.9,2),stn,s*(w/2+R*.2),.3+h*1.25,0);put(g,cone(R*.6,R*.6,4),roof,s*(w/2+R*.2),.3+h*2.5+R*.3,0).rotation.y=.785}
    put(g,cyl(R*.7,R*.78,h*.55,16),trim,0,.3+h*2+h*.27,-d*.1);put(g,new THREE.SphereGeometry(R*.72,16,10,0,6.283,0,1.57),roof,0,.3+h*2.55,-d*.1);put(g,new THREE.SphereGeometry(.2,8,6),m3Plain(0xf0c030,.3,{metalness:.9}),0,.3+h*2.55+R*.8,-d*.1);
    flagPole(g,0,.3+h*2.55+R*.85,-d*.1,R*1.3,team);g.userData.h=h*3.6;return g}
  if(ep===5){const bk=brick(),roofm=m3Mat('shingle',0x3e444d);
    put(g,bx(w+1,.35,d+1,3),m3Mat('stone',0x8a8780),0,.17,0);put(g,bx(w,h*2.2,d,2),bk,0,.35+h*1.1,0);put(g,bx(w+.15,.2,d+.15,1),m3Plain(0x5a5048,.9),0,.35+h*2.2,0);
    for(let i=0;i<4;i++){const x=-w*.375+i*w*.25;gab(g,x,.35+h*2.2,0,w*.25,d,h*.45,bk,roofm,.02)}
    winGrid(g,[-w*.4,-w*.28,-w*.16,w*.16,w*.28,w*.4],[.35+h*.55,.35+h*1.5],d/2+.04,.3,.5,true);
    put(g,bx(R*.9,h*3.6,R*.9,2),bk,0,.35+h*1.8,d*.2);put(g,cone(R*.8,R*.8,4),roofm,0,.35+h*3.6+R*.4,d*.2).rotation.y=.785;for(const a of[0,1.57,3.14,4.71])put(g,cyl(.3,.3,.08,16),m3Plain(0xf0ead6,.5),Math.cos(a)*R*.46,.35+h*3.0,d*.2+Math.sin(a)*R*.46).rotation.set(0,-a+1.57,Math.PI/2);
    door(g,0,d/2+.02,R*.55,R*.8);for(const x of[-w*.45,w*.45]){put(g,cyl(.3,.38,h*3.3,12),bk,x,.35+h*1.65,-d*.3);put(g,cyl(.42,.34,.25,12),m3Plain(0x3a3a3a,.8),x,.35+h*3.3,-d*.3)}
    put(g,cyl(.08,.08,w*.8,6),iron(),0,.35+h*2.65,-d*.3).rotation.z=Math.PI/2;flagPole(g,w*.1,.35+h*3.9,d*.2,R*1.2,team);g.userData.h=h*4.4;return g}
  { /* ep6 Betonbunker-Kommandozentrale */ const cn=conc(),cd=concD();
    put(g,bx(w+.8,.3,d+.8,3),m3Plain(0x7a7a74,.95),0,.15,0);put(g,bx(w,h*1.1,d,2),cn,0,.3+h*.55,0);put(g,bx(w*.72,h*.8,d*.8,2),cn,0,.3+h*1.1+h*.4,0);put(g,bx(w+.1,.2,d+.1,1),cd,0,.3+h*1.1,0);put(g,bx(w*.74,.2,d*.82,1),cd,0,.3+h*1.9,0);
    put(g,new THREE.BoxGeometry(w*.7,.3,.14),dark(),0,.3+h*.6,d/2+.02);winGrid(g,[-w*.3,-w*.1,w*.1,w*.3],[.3+h*1.5],d*.4+.04,.5,.22);door(g,0,d/2+.02,R*.55,R*.7);
    sandbags(g,0,.3+h*1.95,0,22,Math.min(w,d)*.52);for(const s of[-1,1]){put(g,cyl(.04,.04,R*3,4),iron(),s*w*.3,.3+h*1.9+R*1.5,-d*.1);put(g,bx(.5,.04,.04,1),iron(),s*w*.3,.3+h*1.9+R*2.4,-d*.1)}
    put(g,cyl(.5,.5,.2,14),m3Plain(0xdddddd,.4,{metalness:.7}),w*.32,.3+h*2.0,d*.1);camoNet(g,-w*.6,1.2,R*1.1,R*1.8,R*1.2);tent(g,w*.66,R*.9,1.2);tent(g,-w*.66,-R*.7,1.1);sbLine(g,0,.1,d/2+R*.9,8,R*2.2);
    flagPole(g,w*.4,.3+h*1.95,-d*.3,R*1.6,team);g.userData.h=h*3.4;return g}
};
})();
