/* Epochenkrieg – eigene Gebäude für die ersten beiden Zeitalter (statt Holz-Bausätzen):
   Steinzeit (ERA0): Fellzelte, Mammutknochen-Hütten, Stoßzahn-Bögen, Schädel, Feuerstellen, Trockengestelle.
   Bronzezeit (ERA1): Rundhäuser mit Lehmwand und Strohkegeldach, Speicher auf Stelzen, Flechtzäune, Bronze-Sonnenscheiben.
   Wird in buildBld (models3d.js) vor BLD3 abgefragt; nach models3d.js laden. */
const ERA0={},ERA1={};
(()=>{
  const hideC=[0xa07a50,0x8a6a44,0xb89366,0x7a5a38],bone=()=>m3Plain(0xe9dfc6,.65),boneD=()=>m3Plain(0xcfc2a0,.7),
    hide=c=>m3Mat('fur',c,{side:THREE.DoubleSide}),lea=c=>m3Mat('leather',c,{side:THREE.DoubleSide}),rock=()=>m3Plain(0x8d8a80,.95),
    daub=()=>m3Mat('dirt',0xc2a27a),thatch=()=>m3Mat('thatch',0xc9a860),thatchD=()=>m3Mat('thatch',0xa88a4a),bronze=()=>m3Plain(0xc08a3a,.35,{metalness:.8}),
    fireM=()=>m3Plain(0xf08a2c,.5,{emissive:0xd45a10,emissiveIntensity:.9}),dark=()=>m3Plain(0x1c140c,.9);
  /* Kleinteile */
  function tusk(g,x,z,s,ry,m){const t=put(g,new THREE.TorusGeometry(s,.07*s+.04,6,10,Math.PI*.8),m||bone(),x,0,z);t.rotation.set(0,ry,Math.PI*.1);return t}
  function skull(g,x,y,z,s=1,ry=0){const k=new THREE.Group();k.position.set(x,y,z);k.rotation.y=ry;k.scale.setScalar(s);g.add(k);
    put(k,new THREE.SphereGeometry(.16,8,6),bone(),0,0,0).scale.set(1.15,1,.95);put(k,new THREE.BoxGeometry(.14,.09,.16),bone(),.13,-.07,0);
    for(const z2 of[-.06,.06])put(k,new THREE.SphereGeometry(.035,5,4),dark(),.14,.02,z2,false);
    for(const z2 of[-1,1]){const h=put(k,cone(.035,.26,5),boneD(),-.02,.12,z2*.13);h.rotation.x=z2*.9}return k}
  function bonePile(g,x,z,n=4){for(let i=0;i<n;i++){const b=put(g,cyl(.035,.035,.5,5),bone(),x+(i%2)*.15,.05+Math.floor(i/2)*.07,z+i*.08);b.rotation.set(Math.PI/2,i*.7,0);
    for(const e of[-.25,.25])put(g,new THREE.SphereGeometry(.05,5,4),bone(),x+(i%2)*.15+Math.sin(i*.7)*e,.05+Math.floor(i/2)*.07,z+i*.08+Math.cos(i*.7)*e,false)}}
  function fire(g,x,z,r=.45){put(g,cyl(r,r*1.1,.1,10),m3Plain(0x3a342e,.95),x,.05,z,false);for(let i=0;i<8;i++){const a=i/8*6.283;put(g,new THREE.DodecahedronGeometry(r*.28,0),rock(),x+Math.cos(a)*r,.1,z+Math.sin(a)*r)}
    for(let i=0;i<3;i++){const l=put(g,cyl(.05,.05,r*1.4,5),woodD(),x,.16,z);l.rotation.set(Math.PI/2,i*1.05,0)}put(g,cone(r*.4,r*1.1,6),fireM(),x,.45,z,false)}
  function rack(g,x,z,ry,w,h,cols){const k=new THREE.Group();k.position.set(x,0,z);k.rotation.y=ry;g.add(k);
    for(const s of[-1,1]){put(k,cyl(.04,.05,h,5),woodD(),s*w/2,h/2,0)}put(k,cyl(.035,.035,w+.2,5),woodD(),0,h-.05,0).rotation.z=Math.PI/2;
    cols.forEach((c,i)=>{const p=put(k,new THREE.PlaneGeometry(w/cols.length*.85,h*.55),hide(c),-w/2+(i+.5)*w/cols.length,h*.66,0);p.rotation.y=.1*(i%2?1:-1)});return k}
  function tent(g,x,z,r,h,c,poles=5){const t=put(g,cone(r,h,9),hide(c),x,h/2,z);for(let i=0;i<poles;i++){const a=i/poles*6.283;const p=put(g,cyl(.035,.035,h*.35,5),woodD(),x+Math.cos(a)*r*.07,h*1.02,z+Math.sin(a)*r*.07);p.rotation.set(Math.sin(a)*.25,0,-Math.cos(a)*.25)}
    const d=put(g,new THREE.PlaneGeometry(r*.5,h*.42),dark(),x,h*.2,z+r*.72,false);d.rotation.x=-.42;return t}
  function stakeRing(g,r,n,h,skip,ex=1){for(let i=0;i<n;i++){const a=i/n*6.283;if(skip&&skip(a))continue;const hh=h*(.8+.3*((i*7)%5)/4);const p=put(g,cyl(.06,.08,hh,5),wood(),Math.cos(a)*r*ex,hh/2,Math.sin(a)*r);
    put(g,cone(.08,.22,5),woodD(),Math.cos(a)*r*ex,hh+.1,Math.sin(a)*r);p.rotation.z=((i*13)%5-2)*.03}}
  function spearTee(g,x,z,n=5,h=1.6){for(let i=0;i<n;i++){const a=i/n*6.283;const s=put(g,cyl(.025,.025,h,4),woodD(),x+Math.cos(a)*.18,h/2,z+Math.sin(a)*.18);s.rotation.set(-Math.sin(a)*.12,0,Math.cos(a)*.12);
    put(g,cone(.05,.18,4),m3Plain(0x5a5650,.6),x+Math.cos(a)*.08,h+.05,z+Math.sin(a)*.08,false)}}
  function totem(g,x,z,h,team,top){const t=new THREE.Group();t.position.set(x,0,z);g.add(t);put(t,cyl(.14,.18,h,8),m3Mat('planks',0x6a4a2a),0,h/2,0);
    for(const[y,c]of[[h*.3,0xb2452f],[h*.55,0xe8dfc8],[h*.8,0x3d3226]]){put(t,cyl(.17,.17,.12,8),m3Plain(c,.8),0,y,0);put(t,new THREE.BoxGeometry(.5,.08,.08),m3Plain(c,.8),0,y+.12,0)}
    if(top==='sun'){const d=put(t,cyl(.32,.32,.05,16),bronze(),0,h+.3,0);d.rotation.x=Math.PI/2}else skull(t,0,h+.1,0,1.4,Math.PI/2);
    if(team!==undefined){const f=put(t,new THREE.PlaneGeometry(.5,.7),m3Mat('leather',TC[team],{side:THREE.DoubleSide}),.3,h*.62,0,false);f.rotation.y=Math.PI/2}return t}
  /* Rundhaus: Lehmwand, Strohkegeldach mit Überstand, Tür nach vorn (+z) */
  function roundhouse(g,x,z,r,h,roofH){const w=put(g,cyl(r,r*1.04,h,16),daub(),x,h/2,z);w.material=daub();
    put(g,cyl(r*1.03,r*1.07,.18,16),m3Plain(0x7a5a3a,.9),x,.09,z);
    const roof=put(g,cone(r*1.32,roofH,16),thatch(),x,h+roofH/2-.05,z);put(g,cyl(r*1.32,r*1.32,.08,16,1),thatchD(),x,h-.02,z);
    put(g,cone(r*.18,roofH*.2,8),thatchD(),x,h+roofH*.93,z);
    const d=put(g,new THREE.BoxGeometry(r*.5,h*.8,.12),m3Mat('planks',0x4a3220),x,h*.4,z+r*.98,false);
    for(const s of[-1,1])put(g,cyl(.06,.06,h*.95,6),woodD(),x+s*r*.3,h*.47,z+r*1.0,false);put(g,new THREE.BoxGeometry(r*.75,.12,.14),woodD(),x,h*.92,z+r*1.0,false);
    return roof}
  function wattle(g,x,z,len,ry,h=.55){const k=new THREE.Group();k.position.set(x,0,z);k.rotation.y=ry;g.add(k);const n=Math.max(2,Math.round(len/.45));
    for(let i=0;i<=n;i++)put(k,cyl(.035,.035,h+.15,5),woodD(),-len/2+i*len/n,(h+.15)/2,0);
    for(let j=0;j<3;j++)put(k,new THREE.BoxGeometry(len,.09,.06),m3Plain([0x8a6a42,0x7a5a38,0x9a7a4e][j],.95),0,.14+j*h*.33,0);return k}

  /* ======================= Steinzeit ======================= */
  /* Hauptlager: grosses Häuptlingszelt, zwei kleine Zelte, Stoßzahn-Tor, Totem mit Schädel, Feuerstelle, Trockengestell */
  ERA0.hq=(R,st,team)=>{const g=new THREE.Group();
    tent(g,0,-R*.15,R*.95,R*1.75,hideC[0],7);
    for(let i=0;i<8;i++){const a=i/8*6.283+.2;const s=put(g,new THREE.PlaneGeometry(R*.32,R*.4),hide(hideC[(i+1)%4]),Math.cos(a)*R*.7,R*.32,-R*.15+Math.sin(a)*R*.7);s.lookAt(0,R*.32,-R*.15);s.rotation.x+=-.45}
    tent(g,-R*.95,R*.45,R*.45,R*1.0,hideC[2]);tent(g,R*1.0,R*.35,R*.42,R*.95,hideC[3]);
    /* Tor aus zwei Stoßzahn-Paaren vor dem Eingang */
    for(const s of[-1,1]){const t=put(g,new THREE.TorusGeometry(R*.38,.09,6,12,Math.PI*.75),bone(),s*R*.32,0,R*.95);t.rotation.set(0,0,s>0?Math.PI*.25:Math.PI*.0)}
    skull(g,0,R*.78,R*.95,1.5,-Math.PI/2);
    totem(g,-R*.55,R*1.05,R*1.6,team);fire(g,R*.45,R*.95,.42);
    rack(g,R*.6,-R*.95,.4,R*.8,R*.75,[hideC[1],hideC[3]]);bonePile(g,-R*1.0,-R*.7,6);
    for(let i=0;i<3;i++)skull(g,-R*1.15+i*.38,.14,-R*.25,.9,.3*i);
    flagPole(g,R*.15,R*1.65,-R*.15,R*1.0,team);g.userData.h=R*2.7;return g};
  /* Hütte: Mammutknochen-Hütte (Fellkuppel, unten Kieferknochen, Stoßzahn-Eingang) */
  ERA0.house=(R,st,team)=>{const g=new THREE.Group(),c=hideC[(R*10|0)%4],D=R*1.0;
    const d=put(g,new THREE.SphereGeometry(D,14,8,0,6.283,0,Math.PI/2),hide(c),0,0,0);d.scale.set(1,.95,.9);
    /* Stoßzähne als Rippen über der Kuppel */
    for(let i=0;i<3;i++){const t=put(g,new THREE.TorusGeometry(D*1.0,.06,6,18,Math.PI),bone(),0,0,0);t.scale.set(1,.96,1);t.rotation.y=i/3*Math.PI+.3}
    /* Kieferknochen rund um den Fuss */
    for(let i=0;i<12;i++){const a=i/12*6.283;if(Math.abs(a-Math.PI/2)<.35)continue;const b=put(g,new THREE.SphereGeometry(D*.12,6,4),bone(),Math.cos(a)*D*1.0,D*.06,Math.sin(a)*D*.9);b.scale.set(1.3,.6,.7);b.rotation.y=-a}
    for(const s of[-1,1]){const t=put(g,new THREE.TorusGeometry(D*.28,.05,6,10,Math.PI*.6),bone(),s*D*.1,0,D*.9);t.rotation.z=s>0?Math.PI*.4:0}
    put(g,new THREE.PlaneGeometry(D*.36,D*.42),dark(),0,D*.2,D*.88,false);
    put(g,cyl(.05,.05,D*.35,5),woodD(),0,D*.95,0);skull(g,0,D*.62,D*.75,.9,-Math.PI/2);fire(g,D*1.05,D*.75,.22);
    if((R*10|0)%2)rack(g,-D*1.05,D*.45,1.2,D*.6,D*.6,[hideC[2]]);else bonePile(g,-D*1.0,D*.5,4);
    g.userData.h=D*1.2;return g};
  /* Lager: Fell-Unterstand mit Trockengestellen, Holzstapel, Fellbündel, Körbe */
  ERA0.store=(R,st,team)=>{const g=new THREE.Group();
    for(const x of[-1,1]){put(g,cyl(.07,.08,R*1.3,6),woodD(),x*R*.85,R*.65,-R*.45);put(g,cyl(.06,.07,R*.7,6),woodD(),x*R*.85,R*.35,R*.45)}
    const rf=put(g,new THREE.PlaneGeometry(R*1.95,R*1.15),hide(hideC[0]),0,R*1.0,0);rf.rotation.x=-Math.PI/2+.5;
    put(g,cyl(.05,.05,R*1.9,5),woodD(),0,R*1.28,-R*.45).rotation.z=Math.PI/2;
    for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(R*.24,8,6),hide(hideC[i+1]),-R*.45+i*R*.42,R*.18,-R*.1).scale.set(1.2,.7,1);
    rack(g,R*1.05,R*.6,-1.1,R*.7,R*.7,[hideC[2],hideC[1]]);
    for(let i=0;i<2;i++){const b=put(g,cyl(.22,.17,.3,8),m3Mat('thatch',0xb08a50),-R*.9+i*.42,.15,R*.75);put(g,new THREE.SphereGeometry(.16,6,4),m3Plain([0xc84b3a,0x7a3a5a][i],.6),-R*.9+i*.42,.3,R*.75).scale.y=.5}
    skull(g,R*.85,R*1.25,-R*.45,.8,0);g.userData.h=R*1.4;return g};
  /* Kaserne: Kampfplatz mit Pfahlring, Speerbündeln, Schädelstangen, Feuer und Zelt */
  ERA0.barracks=(R,st,team)=>{const g=new THREE.Group();
    stakeRing(g,R*.95,16,R*.65,a=>Math.abs(a-Math.PI/2)<.35,1.1);
    put(g,cyl(R*.85,R*.9,.04,16),m3Mat('dirt',0x8a7458),0,.02,0,false);fire(g,0,0,.4);
    tent(g,-R*.45,-R*.4,R*.4,R*.9,hideC[1]);spearTee(g,R*.45,-R*.35,6,R*.85);spearTee(g,R*.15,-R*.6,4,R*.7);
    for(const s of[-1,1]){const p=put(g,cyl(.05,.05,R*1.1,5),woodD(),s*R*.32,R*.55,R*1.0);skull(g,s*R*.32,R*1.15,R*1.0,1,-Math.PI/2)}
    const d=new THREE.Group();d.position.set(R*.45,0,R*.3);g.add(d);put(d,cyl(.06,.06,1.1,5),woodD(),0,.55,0);put(d,new THREE.SphereGeometry(.22,6,5),hide(hideC[2]),0,.95,0).scale.y=1.4;
    flagPole(g,-R*.1,R*.2,R*.1,R*1.0,team);g.userData.h=R*1.5;return g};
  /* Wachturm: Dreibein aus Stämmen mit Plattform, Fellschutz, Horn und Schädeln */
  ERA0.tower=(R,st,team)=>{const g=new THREE.Group(),H=R*3.4;
    for(let i=0;i<3;i++){const a=i/3*6.283;const p=put(g,cyl(.09,.12,H*1.05,6),wood(),Math.cos(a)*R*.42,H/2,Math.sin(a)*R*.42);p.rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12)}
    for(const y of[H*.3,H*.6]){for(let i=0;i<3;i++){const a=i/3*6.283+Math.PI/3;const r=put(g,cyl(.04,.04,R*.75,5),woodD(),Math.cos(a)*R*.22,y,Math.sin(a)*R*.22);r.rotation.set(0,-a,Math.PI/2)}}
    put(g,cyl(R*.55,R*.55,.12,8),m3Mat('planks',0x7a5a3a),0,H*.92,0);
    put(g,new THREE.CylinderGeometry(R*.56,R*.52,R*.42,8,1,true),hide(hideC[2]),0,H*.92+R*.22,0);
    put(g,cone(R*.75,R*.7,7),hide(hideC[1]),0,H*.92+R*.9,0);const hn=put(g,new THREE.TorusGeometry(.2,.05,5,8,Math.PI*.8),bone(),R*.55,H*.92+R*.15,0);hn.rotation.y=Math.PI/2;
    for(let i=0;i<2;i++)skull(g,Math.cos(i*3)*R*.3,H*.55,Math.sin(i*3)*R*.3+R*.2,.8,i);
    flagPole(g,0,H*.92+R*1.2,0,R*.9,team);g.userData.h=H+R*1.3;return g};
  /* Fischplatz am Wasser: Stammfloß-Steg, Einbaum, Fisch-Trockengestell, Netz */
  ERA0.harbor=(R,st,team)=>{const g=new THREE.Group();
    for(let i=0;i<6;i++){const l=put(g,cyl(.13,.13,R*1.7,6),wood(),-R*.65+i*R*.26,.15,0);l.rotation.x=Math.PI/2}
    for(const x of[-R*.7,R*.7])for(const z of[-R*.75,R*.75])put(g,cyl(.08,.1,.9,5),woodD(),x,.1,z);
    const c=new THREE.Group();c.position.set(R*1.1,.12,R*.2);g.add(c);const hull=put(c,new THREE.SphereGeometry(.4,10,6,0,6.283,Math.PI/2,Math.PI/2),m3Mat('planks',0x6a4a2a,{side:THREE.DoubleSide}),0,.15,0);hull.scale.set(.6,.6,3.4);
    put(c,cyl(.025,.025,1.4,4),woodD(),.1,.3,.3).rotation.x=1.2;
    const rk=new THREE.Group();rk.position.set(-R*.3,.2,-R*.3);g.add(rk);for(const s of[-1,1])put(rk,cyl(.04,.04,1.2,5),woodD(),s*.55,.6,0);put(rk,cyl(.03,.03,1.3,5),woodD(),0,1.15,0).rotation.z=Math.PI/2;
    for(let i=0;i<5;i++){const f=put(rk,new THREE.SphereGeometry(.09,6,4),m3Plain(0x9aa6ac,.4,{metalness:.2}),-.45+i*.22,.9,0);f.scale.set(.5,1.6,.3)}
    const n=put(g,new THREE.PlaneGeometry(R*.7,R*.5,4,3),m3Plain(0x8a7a5a,.95,{wireframe:true}),R*.2,.75,R*.6);n.rotation.y=.4;
    for(const s of[-1,1])put(g,cyl(.03,.03,.9,4),woodD(),R*.2+s*R*.32,.45,R*.6);
    flagPole(g,-R*.6,.2,R*.6,R*1.1,team);g.userData.h=R*1.2;return g};

  /* ======================= Bronzezeit ======================= */
  ERA1.house=(R,st,team)=>{const g=new THREE.Group();roundhouse(g,0,0,R*.85,R*.6,R*1.05);
    const p=put(g,new THREE.SphereGeometry(.2,8,6),m3Plain(0xa0583a,.7),R*.75,.18,R*.6);p.scale.y=1.3;put(g,cyl(.08,.12,.1,8),m3Plain(0xa0583a,.7),R*.75,.42,R*.6);
    wattle(g,-R*.2,R*1.05,R*1.0,0,.4);g.userData.h=R*1.6;return g};
  ERA1.hq=(R,st,team)=>{const g=new THREE.Group();
    roundhouse(g,0,-R*.2,R*.85,R*.7,R*1.25);roundhouse(g,-R*.95,R*.5,R*.38,R*.4,R*.62);roundhouse(g,R*.98,R*.45,R*.36,R*.38,R*.6);
    for(const[x,z,l,ry]of[[0,R*1.15,R*1.2,0],[-R*1.25,-R*.35,R*1.1,Math.PI/2],[R*1.25,-R*.35,R*1.1,Math.PI/2]])wattle(g,x,z,l,ry,.5);
    totem(g,R*.45,R*.95,R*1.5,team,'sun');fire(g,-R*.35,R*.95,.35);
    const ca=put(g,new THREE.SphereGeometry(.28,10,6,0,6.283,Math.PI/2,Math.PI/2),bronze(),R*.15,.34,R*.95);for(let i=0;i<3;i++){const a=i/3*6.283;put(g,cyl(.03,.03,.35,4),m3Plain(0x3a3b42,.5,{metalness:.6}),R*.15+Math.cos(a)*.2,.17,R*.95+Math.sin(a)*.2)}
    flagPole(g,0,R*1.9,-R*.2,R*.9,team);g.userData.h=R*2.6;return g};
  /* Speicher: Kornspeicher auf Stelzen, Vorratskrüge, Säcke */
  ERA1.store=(R,st,team)=>{const g=new THREE.Group();
    for(const x of[-1,1])for(const z of[-1,1]){put(g,cyl(.08,.1,R*.55,6),woodD(),x*R*.42,R*.27,z*R*.42);put(g,new THREE.SphereGeometry(.14,6,4),rock(),x*R*.42,R*.55,z*R*.42).scale.y=.5}
    put(g,new THREE.BoxGeometry(R*1.1,.1,R*1.1),m3Mat('planks',0x7a5a3a),0,R*.6,0);
    const k=new THREE.Group();k.position.y=R*.6;g.add(k);roundhouse(k,0,0,R*.48,R*.45,R*.7);
    for(let i=0;i<4;i++){const a=i*1.3+.4;const j=put(g,new THREE.SphereGeometry(.22,8,6),m3Plain([0xa0583a,0xb86a44,0x8a4a30,0xa0583a][i],.7),R*.95+Math.cos(a)*.3,.24,R*.55+Math.sin(a)*.3);j.scale.y=1.35;put(g,cyl(.07,.1,.12,8),m3Plain(0xa0583a,.7),R*.95+Math.cos(a)*.3,.53,R*.55+Math.sin(a)*.3)}
    for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(.24,8,6),m3Plain([0xd9c08a,0xc8ae78,0xbfa070][i],.95),-R*.9+i*.35,.2,R*.7).scale.set(1,.85,.9);
    g.userData.h=R*2.0;return g};
  /* Kaserne: Palisadenring mit Tor, Rundhaus, Waffengestell mit Bronzeschilden */
  ERA1.barracks=(R,st,team)=>{const g=new THREE.Group();
    stakeRing(g,R*1.0,22,R*.75,a=>Math.abs(a-Math.PI/2)<.3,1.1);roundhouse(g,-R*.25,-R*.3,R*.48,R*.45,R*.75);
    put(g,cyl(R*.9,R*.95,.04,16),m3Mat('dirt',0x8a7458),0,.02,0,false);
    const rk=new THREE.Group();rk.position.set(R*.5,0,R*.15);g.add(rk);for(const s of[-1,1])put(rk,cyl(.05,.05,1.1,5),woodD(),s*.5,.55,0);put(rk,cyl(.04,.04,1.1,5),woodD(),0,1.0,0).rotation.z=Math.PI/2;
    for(let i=0;i<3;i++){const sh=put(rk,cyl(.24,.24,.05,14),bronze(),-.32+i*.32,.7,.08);sh.rotation.x=Math.PI/2;put(rk,new THREE.SphereGeometry(.06,6,4),bronze(),-.32+i*.32,.7,.12)}
    spearTee(g,R*.5,-R*.45,5,R*.9);flagPole(g,R*.1,0,R*.55,R*1.3,team);g.userData.h=R*1.6;return g};
  /* Wachturm: vier Pfosten, Bretterboden, Strohkegeldach, Bronze-Gong */
  ERA1.tower=(R,st,team)=>{const g=new THREE.Group(),H=R*3.2;
    for(const x of[-1,1])for(const z of[-1,1]){const p=put(g,cyl(.09,.11,H,6),wood(),x*R*.4,H/2,z*R*.4);p.rotation.set(-z*.04,0,x*.04)}
    for(const y of[H*.35,H*.65])for(const[x,z,ry]of[[0,R*.4,0],[0,-R*.4,0],[R*.4,0,Math.PI/2],[-R*.4,0,Math.PI/2]]){const b=put(g,new THREE.BoxGeometry(R*.85,.07,.07),woodD(),x,y,z);b.rotation.y=ry;b.rotation.z=.6*(y>H*.5?1:-1)*(ry?1:1)}
    put(g,new THREE.BoxGeometry(R*1.15,.12,R*1.15),m3Mat('planks',0x7a5a3a),0,H,0);
    for(const[x,z,ry]of[[0,R*.55,0],[0,-R*.55,0],[R*.55,0,Math.PI/2],[-R*.55,0,Math.PI/2]])wattle(g,x,z,R*1.1,ry,.35).position.y=H;
    for(const x of[-1,1])for(const z of[-1,1])put(g,cyl(.05,.05,R*.7,5),woodD(),x*R*.5,H+R*.35,z*R*.5);
    put(g,cone(R*.95,R*.8,12),thatch(),0,H+R*.7+R*.35,0);const gg=put(g,cyl(.18,.18,.03,14),bronze(),R*.3,H+R*.45,R*.56);gg.rotation.x=Math.PI/2;
    flagPole(g,0,H+R*1.4,0,R*.8,team);g.userData.h=H+R*1.8;return g};
  /* Hafen: Plankensteg auf Pfählen, Bootsschuppen mit Strohdach, Plankenboot */
  ERA1.harbor=(R,st,team)=>{const g=new THREE.Group();
    put(g,new THREE.BoxGeometry(R*2.0,.12,R*.8),m3Mat('planks',0x7a5a3a),0,.25,0);for(let i=0;i<5;i++)for(const z of[-1,1])put(g,cyl(.07,.08,1.0,6),woodD(),-R*.9+i*R*.45,-.1,z*R*.38);
    const sh=new THREE.Group();sh.position.set(-R*.55,.3,-R*.75);g.add(sh);for(const x of[-1,1])for(const z of[-1,1])put(sh,cyl(.05,.05,R*.7,5),woodD(),x*R*.45,R*.35,z*R*.3);
    gab(sh,0,R*.7,0,R*1.0,R*.7,R*.55,thatchD(),thatch(),.15);
    const b=new THREE.Group();b.position.set(R*.4,.12,R*.75);g.add(b);const hull=put(b,new THREE.SphereGeometry(.5,10,6,0,6.283,Math.PI/2,Math.PI/2),m3Mat('planks',0x6a4a2a,{side:THREE.DoubleSide}),0,.15,0);hull.scale.set(3.2,.7,.75);
    put(b,cyl(.03,.03,1.4,5),woodD(),0,.7,0);
    for(let i=0;i<3;i++)put(g,new THREE.SphereGeometry(.2,8,6),m3Plain(0xa0583a,.7),R*.6+i*.3,.48,-R*.15).scale.y=1.3;
    flagPole(g,R*.9,.3,-R*.3,R*1.1,team);g.userData.h=R*1.4;return g};
})();
