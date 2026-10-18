/* Epochenkrieg – Arbeits-Haltungen für die glTF-Menschen (Holzfällen, Beeren pflücken, Bauen, Feldarbeit, Jagd, Last tragen, Umschauen).
   Das Modell bleibt das echte Skelett (Quaternius-Figuren): nach dem Abspielen des Grund-Clips (Idle bzw. Knien aus der Animationsbibliothek)
   werden Hüfte, Wirbelsäule, Kopf, Beine und Arme per Knochen-Drehung und Zwei-Knochen-IK (EKMODELS.util.ik2) auf Zielpunkte gestellt.
   Alle Punkte stehen im Figurenraum, gemessen in Körperhöhen H: x = vorn, y = oben, z = rechts. Die Werkzeuge (echte glTF-Modelle) hängen
   nicht an der Hand, sondern folgen der rechten Hand (Griffpunkt) und stehen in einer festen Richtung; die linke Hand greift den Stiel.
   Takt: ph (0..1) kommt aus der Spielrechnung (u.gt/u.gl bzw. u.bt/u.cd, siehe wkPhase in render3d.js); ph = 0 ist der Aufprall (Geräusch, Späne).
   Zeichnen ohne Spielwirkung: ändert keine Sammelraten. Skelette ohne die erwarteten Knochen bekommen kein rig.wp (dann bleibt der Clip). */
const WPOSE=(()=>{
  const EU=EKMODELS.util;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),sm=x=>{x=cl(x,0,1);return x*x*(3-2*x)},D=Math.PI/180;
  const nrm=n=>n.replace(/[.\s_]/g,'').toLowerCase(),m3=new THREE.Matrix3();
  const A=[...Array(10)].map(()=>new THREE.Vector3()),QA=new THREE.Quaternion(),QB=new THREE.Quaternion(),MB=new THREE.Matrix4();
  const R={files:[],n:0,max:80},EL_L=[0,-.6,-.8],EL_R=[0,-.6,.8];
  /* Grund-Clip je Tätigkeit: Idle, nur Beeren: Knien aus der Animationsbibliothek (hinknien ab 0,25 s, halten bei 1,9 s, beim Aufstehen ab 4,3 s) */
  const BASE={chop:{clip:'Idle'},mine:{clip:'Idle'},build:{clip:'Idle'},farm:{clip:'Idle'},hunt:{clip:'Idle'},
    pick:{clip:'UAL:Fixing_Kneeling',from:.25,at:1.9,out:4.3,rate:1.15,fade:.3,outRate:1.5,outFade:.5}};
  /* Werkzeuge: Griffpunkte entlang des Stiels in Modelleinheiten (Ursprung = Griff, +Y = Kopfende, +X = Schneide); r = rechte, l = linke Hand, mul = Grösse */
  const TOOLS={'neu/Axe Small.glb':{mul:1.3,r:.1,l:-.5},'neu/Doublesided Hammer.glb':{mul:1.15,r:.15,l:-.55},'neu/Doublesided Hammer.glb|build':{mul:1.6,r:.15,l:-.55},'neu/Scythe.glb':{mul:1,r:-.3,l:-1.5},'neu/Spear.glb':{mul:.55,r:-1.3,l:.35}};
  /* Beiwerk (manifest.wprops): Beutel beim Beerenpflücken; Last auf dem Rücken */
  const hs=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s)};
  function kf(ph,keys,out){let i=0;while(i<keys.length-2&&ph>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],x=cl((ph-a[0])/((b[0]-a[0])||1),0,1),e=b[2]?Math.pow(x,b[2]):sm(x);
    for(let j=0;j<out.length;j++)out[j]=a[1][j]+(b[1][j]-a[1][j])*e;return out}
  /* Schlag-Tätigkeiten: Tabelle [ph, [Griffpunkt x,y,z (H), Stielwinkel hoch/runter (°), Stiel seitlich (°), Rumpf vor (rad), Hüfte x,y (H), Drehung (rad), Kopf nicken (rad)], Beschleunigung]
     ph 0 = Treffer. Der letzte Schlüssel ist der erste: der Hieb beschleunigt in den Aufprall. */
  const CHOP0=[.23,.75,0,-20,0,.38,.04,-.05,.10,.18];
  const SWING={
    chop:{keys:[[0,CHOP0],[.08,[.23,.75,0,-16,0,.36,.04,-.05,.08,.15]],[.36,[.12,.93,.02,40,0,.12,.01,-.01,-.02,.05]],[.62,[.04,1.06,.03,105,0,-.10,-.01,0,-.10,-.05]],[.76,[.02,1.08,.03,112,0,-.14,-.02,.01,-.12,-.08]],[1,CHOP0,2.4]],
      fa:[[.09,-.10],[-.11,.10]],two:1,el:[[.2,-.8,-.6],[.2,-.8,.6]]},
    mine:{keys:[[0,[.25,.66,0,-32,0,.42,.05,-.06,.10,.20]],[.10,[.25,.66,0,-30,0,.40,.05,-.06,.10,.20]],[.42,[.10,.92,.02,35,0,.10,0,-.01,-.02,.05]],[.66,[.03,1.05,.03,100,0,-.12,-.01,0,-.10,-.05]],[.80,[.02,1.07,.03,106,0,-.15,-.02,.01,-.12,-.08]],[1,[.25,.66,0,-32,0,.42,.05,-.06,.10,.20],2.2]],
      fa:[[.09,-.10],[-.11,.10]],two:1,el:[[.2,-.8,-.6],[.2,-.8,.6]]},
    build:{keys:[[0,[.30,.70,.06,-25,0,.22,.02,-.03,.05,.20]],[.10,[.30,.70,.06,-22,0,.22,.02,-.03,.05,.20]],[.58,[.18,.98,.08,78,0,.14,0,0,0,.12]],[.68,[.17,1.0,.08,82,0,.14,0,0,0,.10]],[1,[.30,.70,.06,-25,0,.22,.02,-.03,.05,.20],2]],
      fa:[[.04,-.09],[-.06,.09]],two:0,el:[[.2,-.8,-.6],[.2,-.8,.6]],lh:[.34,.74,-.08]},
    farm:{keys:[[0,[.30,.46,-.16,25,-28,.50,.05,-.06,-.30,.25]],[.12,[.27,.46,-.18,25,-32,.50,.05,-.06,-.34,.25]],[.45,[.10,.58,.14,38,38,.32,0,-.02,.30,.15]],[.70,[.08,.60,.18,40,45,.30,0,-.02,.36,.15]],[1,[.30,.46,-.16,25,-28,.50,.05,-.06,-.30,.25],2]],
      fa:[[.09,-.10],[-.11,.10]],two:1,el:[[.2,-.8,-.6],[.2,-.8,.6]]},
    hunt:{keys:[[0,[.20,.82,.05,-4,2,.20,.05,-.01,.10,.08]],[.18,[.20,.82,.05,-4,2,.20,.05,-.01,.10,.08]],[.55,[-.06,.80,.10,12,10,0,-.02,0,-.18,0]],[.80,[-.06,.80,.10,12,10,0,-.02,0,-.18,0]],[1,[.20,.82,.05,-4,2,.20,.05,-.01,.10,.08],2.5]],
      fa:[[.10,-.09],[-.14,.10]],two:1,el:[[.2,-.8,-.6],[.2,-.8,.6]]}};
  const PROF={};
  /* Beeren pflücken (kniend): rechte Hand greift in den Strauch, zupft, führt die Beeren zum Beutel, legt sie ab und greift neu; linke Hand stützt sich ab */
  const PK=[[0,[.50,-.30,.04]],[.10,[.45,-.27,.04]],[.40,[.38,-.20,-.06]],[.52,[.06,-.52,-.32]],[.66,[.06,-.52,-.32]],[.92,[.56,-.26,.05],1.6],[1,[.50,-.30,.04]]];
  PROF.pick=(W,c,P)=>{const ph=c.ph,v=[0,0,0];kf(ph,PK,v);const near=ph>.7||ph<.2,zz=v[2]+(near?(hs(c.n,3)-.5)*.12:0),yy=v[1]+(near?(hs(c.n,7)-.5)*.09:0),toBag=sm(1-Math.abs(ph-.55)/.25);
    P.hr=[[.16,-.46,-.03+Math.sin(ph*6.283)*.02],[v[0],yy,zz]];P.el=[[0,-.4,-.9],[0,-.4,.9]];P.lean=-.22;P.twist=-.15*toBag;P.head=[.25,.1*(zz>0?1:-1)*(1-toBag)-.1*toBag]};
  /* Umschauen im Stand: ab und zu dreht die Figur den Kopf (und ein wenig den Oberkörper) zur Seite */
  PROF.idle=(W,c,P)=>{const G=W.gl;G.t-=c.dt;if(G.t<=0){const r=hs(W.id,G.n++);G.t=2.5+r*4.5;G.to=r<.35?0:(hs(G.n,W.id)-.5)*1.5;G.t2=1.2+hs(G.n,3)*1.4}
    else if(G.t2>0){G.t2-=c.dt}else G.to=0;G.y+=(G.to-G.y)*Math.min(1,c.dt*3);P.head=[Math.abs(G.y)*.08,G.y];P.twist=G.y*.2};
  /* Last tragen: leicht vorgebeugt, Kopf gesenkt, Hände an den Trageriemen */
  PROF.carry=(W,c,P)=>{P.lean=.15;P.head=[.12,0];P.hr=[[.10,-.30,-.07],[.10,-.30,.07]];P.el=[[0,-.6,-.8],[0,-.6,.8]]};
  for(const k in SWING)PROF[k]=(W,c,P)=>{const S=SWING[k],v=[0,0,0,0,0,0,0,0,0,0];kf(c.ph,S.keys,v);const j=(hs(c.n,5)-.5)*.05,x=v[3]*D,y=v[4]*D;
    P.tool=[v[0],v[1],v[2]+j,x,y,0];P.two=S.two;P.lean=v[5];P.hip=[v[6],v[7],0];P.twist=v[8];P.head=[v[9],0];P.el=S.el;P.fa=S.fa;if(S.lh)P.h=[S.lh,null]};
  function newP(){return{hip:null,lean:0,side:0,twist:0,head:null,fa:null,h:null,hr:null,el:null,tool:null,two:0,ft:null}}
  /* ---------- Aufbau: Knochen suchen ---------- */
  function setup(rig,root,wrap,k,u){
    const bn={};root.traverse(o=>{if(o.name)bn[nrm(o.name)]=o});const pr=a=>[bn[a+'l'],bn[a+'r']];
    const ua=pr('upperarm'),la=pr('lowerarm'),wr=pr('wrist'),ul=pr('upperleg'),ll=pr('lowerleg'),ft=pr('foot');
    if([bn.hips,bn.abdomen,bn.torso,bn.chest,bn.head,...ua,...la,...wr,...ul,...ll,...ft].some(x=>!x))return null;
    const end=[bn.lowerleglend||ft[0],bn.lowerlegrend||ft[1]],pel=ul[0].parent,isD=(a,b)=>{for(let q=a.parent;q;q=q.parent)if(q===b)return true;return false};
    wrap.updateMatrixWorld(true);const hp=new THREE.Vector3();bn.head.getWorldPosition(hp);wrap.worldToLocal(hp);
    const W={rig,wrap,root,id:u&&u.id||0,H:hp.y*1.05,pel,hips:bn.hips,abd:bn.abdomen,tor:bn.torso,che:bn.chest,nek:bn.neck||bn.head,hd:bn.head,ua,la,wr,ul,ll,ft,end,ind:!isD(ft[0],ll[0]),
      k0:0,tg:0,cur:null,sv:[],tl:{},tip:new THREE.Vector3(),gl:{t:1+hs(u&&u.id||0,1)*3,n:0,y:0,to:0,t2:0},c:{ph:0,n:0,dt:.016},props:{}};
    const all=[pel,W.hips,W.abd,W.tor,W.che,W.nek,W.hd,...ua,...la,...wr,...ul,...ll];if(W.ind)all.push(...ft);
    W.sv=[...new Set(all)].map(b=>({b,q:new THREE.Quaternion(),p:new THREE.Vector3()}));
    W.F0=[new THREE.Vector3(),new THREE.Vector3()];W.FQ=[new THREE.Quaternion(),new THREE.Quaternion()];
    return W}
  const baseOf=kd=>BASE[kd]||null,hasTool=kd=>kd==='chop'||kd==='mine'||kd==='build'||kd==='farm'||kd==='hunt';
  /* Werkzeug als Kind der Figur (nicht der Hand): Modell-Ursprung = Griff, +Y = Kopf; Grösse wie bisher k·scale (aus dem Manifest) */
  function tool(rig,root,wrap,spec,kd,k,team){
    const W=rig.wp,gl=EKMODELS.files.get(spec.file);if(!W||!gl)return null;const cfg=TOOLS[spec.file+'|'+kd]||TOOLS[spec.file]||{mul:1,r:0,l:-.4};
    const m=EKGLTF.SkeletonUtils.clone(gl.scene);EU.prepare(m,0);const inner=new THREE.Group(),holder=new THREE.Group();inner.add(m);holder.add(inner);
    const sc=k*(spec.scale||1)*cfg.mul;inner.scale.setScalar(sc);wrap.add(holder);holder.userData.wp=1;
    const bb=EU.box(m),hi=bb.max.y,lo=bb.min.y;W.tl[kd]={holder,sc,cfg,hi,lo};return holder}
  /* Beiwerk (manifest.wprops): Beutel für die Beeren liegt vor der Figur am Boden */
  function props(rig,root,wrap,k){
    const W=rig.wp,F=EKMODELS.files,man=EKMODELS.util.man(),en=man&&man.wprops&&man.wprops.bag,gl=en&&F.get(en.file);if(!W||!gl)return W;
    const o=EKGLTF.SkeletonUtils.clone(gl.scene);EU.prepare(o,0);const gr=new THREE.Group();gr.add(o);const s=EU.box(o).getSize(new THREE.Vector3());o.scale.setScalar(W.H*.2/(Math.max(s.x,s.z)||1));
    const b2=EU.box(o),c=b2.getCenter(new THREE.Vector3());o.position.set(-c.x,-b2.min.y,-c.z);gr.position.set(.24*W.H,0,-.26*W.H);gr.visible=false;wrap.add(gr);W.props.bag=gr;return W}
  /* Last am Rücken (Holz = Stämme, sonst Sack): als Kind des Brustbeins, in der Ruhelage an der Figur ausgerichtet; wird beim ersten Tragen angelegt */
  function load(W,ct){
    const man=EKMODELS.util.man(),wp=man&&man.wprops,name=ct==='wood'?'logs':'sack',en=wp&&wp[name],gl=en&&EKMODELS.files.get(en.file);if(!gl)return null;
    const tint={stone:'#8d8d86',iron:'#8a4e3a',gold:'#e8c048',oil:'#2a2a2a'}[ct],o=EKGLTF.SkeletonUtils.clone(gl.scene);EU.prepare(o,0);
    if(tint)o.traverse(x=>{if(!x.isMesh)return;const f=m=>{const c=m.clone();c.color.set(tint);return c};x.material=Array.isArray(x.material)?x.material.map(f):f(x.material)});
    const gr=new THREE.Group();gr.add(o);o.rotation.y=(en.ry||0)*D;const s=EU.box(o).getSize(new THREE.Vector3());o.scale.setScalar((en.w||.4)*W.H/(Math.max(s.x,s.z)||1));
    const b2=EU.box(o),c=b2.getCenter(new THREE.Vector3());o.position.set(-c.x,-c.y,-c.z);
    const ch=W.che,wrap=W.wrap;wrap.updateMatrixWorld(true);const qc=new THREE.Quaternion(),qw=new THREE.Quaternion(),ws=new THREE.Vector3(),ww=new THREE.Vector3();ch.getWorldQuaternion(qc);wrap.getWorldQuaternion(qw);ch.getWorldScale(ws);wrap.getWorldScale(ww);
    const hold=new THREE.Group();hold.quaternion.copy(qc.invert().multiply(qw));hold.scale.setScalar(ww.x/(ws.x||1));hold.position.copy(ch.worldToLocal(wrap.localToWorld(new THREE.Vector3(-.2*W.H,.77*W.H,0))));hold.add(gr);ch.add(hold);gr.visible=false;return gr}
  /* ---------- Anwenden ---------- */
  const fw=(W,x,y,z,o)=>o.set(x*W.H,y*W.H,z*W.H).applyMatrix3(m3),loc=(W,x,y,z,o)=>o.set(x*W.H,y*W.H,z*W.H);
  /* Weltmatrizen der Knochen ohne Dauer-Neuberechnung: getWorldPosition & Co. rechnen bei jeder Abfrage die ganze Eltern-Kette neu (bei 80 Haltungen je Bild der größte Posten).
     Hier trägt jeder veränderte Knochen eine Änderungsmarke (_mod); eine Matrix gilt als aktuell, wenn sie nach der letzten Änderung von Knochen und Vorfahren berechnet wurde (_wv).
     Anker = Eltern des Beckens (wird nie verändert, je Bild einmal aufgefrischt). Ergebnis ist mit der alten Rechnung identisch (geprüft an allen Tätigkeiten). */
  let CLK=1,T0=0,ANC=null;const _p=new THREE.Vector3(),_s=new THREE.Vector3(),QF=[0,1,2].map(()=>new THREE.Quaternion()),VF=[...Array(10)].map(()=>new THREE.Vector3());
  const mod=b=>{b._mod=++CLK},ver=b=>b===ANC?0:Math.max(b._mod||0,ver(b.parent));
  function fresh(b){if(b===ANC)return;if((b._wv||0)>T0&&b._wv>=ver(b))return;const p=b.parent;fresh(p);if(b.matrixAutoUpdate)b.updateMatrix();b.matrixWorld.multiplyMatrices(p.matrixWorld,b.matrix);b._wv=CLK}
  const wpos=(b,o)=>{fresh(b);return o.setFromMatrixPosition(b.matrixWorld)},wquat=(b,o)=>{fresh(b);b.matrixWorld.decompose(_p,o,_s);return o};
  function turnF(b,q){wquat(b.parent,QF[1]);QF[2].copy(QF[1]).invert();b.quaternion.premultiply(q.premultiply(QF[2]).multiply(QF[1]));mod(b)}/* Drehung q (Welt) auf Knochen b */
  function aimF(b,child,to){const P=wpos(b,VF[0]),C=wpos(child,VF[1]);turnF(b,QF[0].setFromUnitVectors(C.sub(P).normalize(),VF[2].copy(to).sub(P).normalize()))}
  function ik2(U,L,H,T,pole,off){const S=wpos(U,VF[3]),a=S.distanceTo(wpos(L,VF[4])),b=VF[4].distanceTo(wpos(H,VF[5])),n=VF[6].copy(T).sub(S);
    let d=n.length();n.divideScalar(d||1);d=Math.min(Math.max(d-off,Math.abs(a-b)+1e-3),(a+b)*.999);const x=(a*a-b*b+d*d)/(2*d),hh=Math.sqrt(Math.max(0,a*a-x*x));
    const m=VF[7].copy(pole).addScaledVector(n,-pole.dot(n)).normalize(),E=VF[8].copy(S).addScaledVector(n,x).addScaledVector(m,hh),Tc=VF[9].copy(S).addScaledVector(n,d);
    aimF(U,L,E);aimF(L,H,Tc)}
  const rotB=(b,ax,ang)=>{if(Math.abs(ang)>1e-4)turnF(b,QA.setFromAxisAngle(ax,ang))};
  function restore(W){for(const s of W.sv){s.b.quaternion.copy(s.q);s.b.position.copy(s.p)}W.saved=false}
  const VX=new THREE.Vector3(),VY=new THREE.Vector3(),VZ=new THREE.Vector3(),TG=[new THREE.Vector3(),new THREE.Vector3()],VG=new THREE.Vector3(),VD=new THREE.Vector3(),VE=new THREE.Vector3(),VT=new THREE.Vector3(),VW=new THREE.Vector3();
  function apply(W,P,kk,dt){
    const wrap=W.wrap,H=W.H;T0=CLK;CLK++;ANC=W.pel.parent;ANC.updateWorldMatrix(true,false);m3.setFromMatrix4(wrap.matrixWorld);
    for(const s of W.sv){s.q.copy(s.b.quaternion);s.p.copy(s.b.position)}W.saved=true;
    const X=fw(W,1,0,0,VX).normalize(),Y=fw(W,0,1,0,VY).normalize(),Z=fw(W,0,0,1,VZ).normalize(),legs=P.fa||P.hip;
    /* Füsse aus dem Clip merken, bevor etwas verändert wird */
    if(legs)for(let i=0;i<2;i++){wpos(W.ft[i],W.F0[i]);wquat(W.ft[i],W.FQ[i])}
    /* Hüfte */
    if(P.hip){const d=fw(W,P.hip[0]*kk,P.hip[1]*kk,P.hip[2]*kk,A[0]);const p=wpos(W.pel,A[1]).add(d);W.pel.position.copy(W.pel.parent.worldToLocal(p));mod(W.pel)}
    /* Wirbelsäule: Neigen (vor = positiv), Drehen, Seitneigen; Kopf */
    const ln=P.lean*kk,tw=P.twist*kk,sd=P.side*kk;
    if(ln||tw||sd)for(const[b,f,t]of[[W.abd,.3,0],[W.tor,.35,.5],[W.che,.35,.5]]){rotB(b,Z,-ln*f);rotB(b,Y,-tw*t);rotB(b,X,sd*f)}
    if(P.head){rotB(W.nek,Z,-P.head[0]*kk*.5);rotB(W.hd,Z,-P.head[0]*kk*.5);rotB(W.nek,Y,-P.head[1]*kk*.5);rotB(W.hd,Y,-P.head[1]*kk*.5)}
    /* Beine: Füsse bleiben fest am Boden (Zielpunkt aus Clip oder P.fa), Knie nach vorn */
    if(legs){for(let i=0;i<2;i++){const T=A[2].copy(W.F0[i]);if(P.fa&&P.fa[i]){wrap.worldToLocal(T);const f=P.fa[i];T.x+=(f[0]*H-T.x)*kk;T.z+=(f[1]*H-T.z)*kk;wrap.localToWorld(T)}
        ik2(W.ul[i],W.ll[i],W.end[i],T,fw(W,1,0,i?.25:-.25,A[3]),0);
        if(W.ind){fresh(W.ft[i].parent);W.ft[i].position.copy(W.ft[i].parent.worldToLocal(A[4].copy(T)));mod(W.ft[i])}
        else{wquat(W.ft[i].parent,QB).invert();W.ft[i].quaternion.copy(QB.multiply(W.FQ[i]));mod(W.ft[i])}}}
    /* Handziele: P.hr = relativ zur Schulter, P.h = im Figurenraum, Werkzeug: rechter Griff + linker Griff am Stiel */
    const palm=.08*H/2.1,has=[false,false],TL=P.tool&&W.tl[W.cur];
    for(let i=0;i<2;i++){
      if(P.hr&&P.hr[i]){wpos(W.ua[i],TG[i]).add(fw(W,P.hr[i][0],P.hr[i][1],P.hr[i][2],A[7]));has[i]=true}
      else if(P.h&&P.h[i]){loc(W,P.h[i][0],P.h[i][1],P.h[i][2],TG[i]);wrap.localToWorld(TG[i]);has[i]=true}}
    let d=null,e=null;
    if(TL){const t=P.tool,a=t[3],b=t[4];d=VD.set(Math.cos(a)*Math.cos(b),Math.sin(a),Math.cos(a)*Math.sin(b));e=VE.set(Math.sin(a)*Math.cos(b),-Math.cos(a),Math.sin(a)*Math.sin(b));
      if(t[5])e.applyAxisAngle(d,t[5]);
      loc(W,t[0],t[1],t[2],VG);TG[1].copy(VG);wrap.localToWorld(TG[1]);has[1]=true;
      if(P.two){VT.copy(VG).addScaledVector(d,(TL.cfg.l-TL.cfg.r)*TL.sc);TG[0].copy(VT);wrap.localToWorld(TG[0]);has[0]=true}}
    for(let i=0;i<2;i++){if(!has[i])continue;const c=wpos(W.wr[i],A[8]);const q=A[9].copy(c).lerp(TG[i],kk);
      const el=P.el&&P.el[i]||(i?EL_R:EL_L);ik2(W.ua[i],W.la[i],W.wr[i],q,fw(W,el[0],el[1],el[2],A[3]),palm)}
    /* Werkzeug an die tatsächliche rechte Hand setzen */
    if(TL){const wp=wpos(W.wr[1],A[0]),fd=A[1].copy(wp).sub(wpos(W.la[1],A[2])).normalize();VW.copy(wp).addScaledVector(fd,palm);wrap.worldToLocal(VW);
      A[4].crossVectors(e,d);MB.makeBasis(e,d,A[4]);TL.holder.quaternion.setFromRotationMatrix(MB);
      TL.holder.position.copy(VW).addScaledVector(d,-TL.cfg.r*TL.sc);
      W.tip.copy(TL.holder.position).addScaledVector(d,TL.hi*TL.sc*.85);wrap.localToWorld(W.tip)}
  }
  /* ---------- je Bild ---------- */
  function run(rig,want,kind,dt,opt){
    const W=rig.wp;if(!W||!opt)return;
    let prof=null;
    if(opt.near){if(want==='work'&&opt.ph!==undefined&&PROF[kind]&&kind!=='fish')prof=kind;else if(want==='idle'&&!opt.fight&&R.n<40)prof='idle';else if(want==='walk'&&opt.cv)prof='carry'}
    if(prof&&W.k0<=0&&!W.cur&&R.n>=R.max)prof=null;/* Rechenbudget je Bild: neue Haltungen nur, solange noch Platz ist (laufende bleiben) */
    if(prof!==W.cur){W.tg=0;if(W.k0<=0){W.cur=prof;W.tg=prof?1:0}}else W.tg=prof?1:0;
    W.k0=cl(W.k0+(W.tg?dt/.3:-dt/.22),0,1);
    for(const kd in W.tl)W.tl[kd].holder.visible=W.cur===kd&&W.k0>.25;
    if(W.props.bag)W.props.bag.visible=W.cur==='pick'&&W.k0>.5;
    {const ct=opt.cv&&want!=='work'&&want!=='attack'?opt.ct:null,L=W.props.load||(W.props.load={});if(ct&&!L[ct]&&L[ct]!==null)L[ct]=load(W,ct);for(const k in L)if(L[k])L[k].visible=k===ct}
    if(!W.cur||W.k0<=0)return;
    const c=W.c;if(opt.ph!==undefined&&want==='work'){c.ph=opt.ph;c.n=opt.n||0}c.dt=dt;
    R.n++;const P=newP();PROF[W.cur](W,c,P);apply(W,P,sm(W.k0),dt)}
  return Object.assign(R,{setup,tool,props,run,restore,baseOf,hasTool})
})();
