/* Epochenkrieg – echte 3D-Modelle (glTF/.glb) statt der im Code gebauten Formen.
   Ablauf: models/manifest.json sagt, welche Einheit/welches Gebäude (und welches Zeitalter) welche .glb-Datei bekommt. Fehlt ein Eintrag oder eine Datei,
   nimmt das Spiel automatisch das bisherige Code-Modell (Rückfall). Anleitung für David: MODELLE.md. Vorschau-Werkzeug: tools/model-viewer.html.
   Regeln für Modelle: Blickrichtung wird angeglichen (Menschen: aus den Händen, Tiere mit Skelett: Kopf- minus Körperknochen, sonst „yaw“ im Manifest
   so wählen, dass der Kopf bei Spielrichtung 0 nach +X zeigt; Blender-Export schaut meist nach +Z → "yaw": 90), Y oben, Meter-Maßstab egal (wird auf die Spielgröße angepasst),
   Material mit „Team“ im Namen (z. B. „TeamColor“) bekommt die Spielerfarbe, Animationen heißen z. B. Idle/Walk/Attack/Work. */
const EKMODELS=(()=>{
  let manifest=null,loader=null;const files=new Map(),failed=[],refCache={},teamMats=new Map();
  const R={ready:false,ver:0};
  const secOf=k=>k==='unit'?'units':k==='bld'?'buildings':k==='animal'?'animals':'nodes';
  /* sp = Ausbau-Richtung (BSPEC, z. B. 'def'): Einträge mit "spec" gelten nur für diesen Ausbau, sonst der normale Eintrag des Zeitalters */
  function entryFor(kind,type,ep,sp){
    const sec=manifest&&manifest[secOf(kind)];let en=sec&&sec[type];if(!en)return null;let base=null;
    const L=(Array.isArray(en)?en:[en]).filter(x=>x&&x.file&&!x.off&&files.has(x.file));
    for(const x of L)if(!x.epochs||x.epochs.includes(ep)){if(!x.spec){if(!base)base=x}else if(x.spec===sp)return x}
    /* Einheiten: kein Eintrag für dieses Zeitalter → nächstgelegenes Zeitalter (lieber das frühere) statt der alten Code-Figur */
    if(base||kind!=='unit'||!L.length)return base;let best=null,bd=99;for(const x of L)if(!x.spec)for(const e of x.epochs||[]){const d=e<=ep?ep-e:(e-ep)+.5;if(d<bd){bd=d;best=x}}return best}
  /* Kennzeichen für die Modell-Signatur im Renderer: ändert sich, wenn ein glTF-Modell zuständig wird (dann wird die Figur neu gebaut) */
  function tag(e){if(!manifest||!files.size)return'';
    if(e.kind==='unit'){const en=entryFor('unit',e.type,e.lvl||0);return en?'|g:'+en.file:''}
    if(e.kind==='bld'){const en=entryFor('bld',e.type,G.epoch[e.team],e.spec);return en?'|g:'+en.file:''}
    if(e.kind==='animal'){const en=entryFor('animal',e.type,0);return en?'|g:'+en.file:''}
    if(e.kind==='node'&&e.sea&&manifest.sea&&manifest.sea[e.type]&&files.size)return'|gs';return''}
  function has(kind,type,ep){return !!entryFor(kind,type,ep)}
  /* Material mit „Team“ im Namen → Spielerfarbe (je Team ein eigenes Material); alle anderen: schwache Himmelsspiegelung wie im Rest des Spiels */
  function prepare(root,team){
    root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
      const fix=m=>{if(!m)return m;if(/team|farbe/i.test(m.name||'')){const k=m.uuid+':'+team;let c=teamMats.get(k);if(!c){c=m.clone();c.color.set(TC[team]);c.name=m.name;teamMats.set(k,c)}return c}
        if(m.isMeshStandardMaterial&&m.envMapIntensity>.5)m.envMapIntensity=.3;return m};
      o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material)})}
  /* Farbtabellen-Texturen umfärben (Pakete mit Farbstreifen, z. B. die Türme): pal:{"#fff1c9":"#a39d90","#30a262":"team"} – Pixel nahe (Abstand < 24) an einer Quellfarbe
     bekommen die Zielfarbe, "team" = Spielerfarbe. Je Material+Farbe+Tabelle einmal erzeugt (64×64-Bild, kostet nichts). */
  const palMats=new Map(),hex3=s=>{const n=parseInt(String(s).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
  function palette(root,pal,team){const tc=TC[team]||'#888888',pk=JSON.stringify(pal);
    root.traverse(o=>{if(!o.isMesh)return;const f=m=>{if(!m||!m.map||!m.map.image)return m;const k=m.uuid+tc+pk;let c=palMats.get(k);if(c)return c;
      const im=m.map.image,cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const x=cv.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,cv.width,cv.height),p=d.data;
      const L=Object.entries(pal).map(([a,b])=>[hex3(a),hex3(b==='team'?tc:b)]);
      for(let i=0;i<p.length;i+=4){let bd=24,to=null;for(const[a,b]of L){const dd=Math.abs(p[i]-a[0])+Math.abs(p[i+1]-a[1])+Math.abs(p[i+2]-a[2]);if(dd<bd){bd=dd;to=b}}if(to){p[i]=to[0];p[i+1]=to[1];p[i+2]=to[2]}}
      x.putImageData(d,0,0);const t=new THREE.CanvasTexture(cv),s=m.map;t.flipY=s.flipY;t.colorSpace=s.colorSpace;t.wrapS=s.wrapS;t.wrapT=s.wrapT;t.magFilter=s.magFilter;t.minFilter=s.minFilter;
      c=m.clone();c.map=t;palMats.set(k,c);return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
  const box=o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o)};
  /* Größe des bisherigen Code-Modells als Maßstab: so passt ein neues Modell automatisch zur Spielgröße */
  function refSize(kind,type,make){const k=kind+type;if(refCache[k])return refCache[k];try{const b=box(make()),s=b.getSize(new THREE.Vector3());return refCache[k]={h:s.y||1,m:Math.max(s.x,s.y,s.z)||1,w:Math.max(s.x,s.z)||1}}catch(_){return refCache[k]={h:2.3,m:3,w:3}}}
  function pickClip(clips,names,re){for(const n of names||[]){const c=clips.find(c=>c.name===n||c.name.split('|').pop()===n);if(c)return c}return clips.find(c=>re.test(c.name))}
  /* Umbauen eines Modells ohne neue Datei: Material einfärben (tint), Teile verstecken (hide), Waffen/Werkzeuge in die Hände (hand/off), Fell-Hüftrock (pelt).
     So wird aus der nackten Basisfigur ein Steinzeit-Jäger, aus der Mittelalterfigur ein Speerträger usw. Siehe MODELLE.md. */
  function findBone(root,re){let f=null;root.traverse(o=>{if(!f&&o.isBone&&re.test(o.name))f=o});return f}
  function attach(root,bone,spec,k){
    const gl=files.get(spec.file);if(!bone||!gl)return null;const p=EKGLTF.SkeletonUtils.clone(gl.scene);prepare(p,0);
    const holder=new THREE.Group();holder.add(p);bone.add(holder);root.updateMatrixWorld(true);
    const ws=new THREE.Vector3();bone.getWorldScale(ws);const sc=k*(spec.scale||1)/(ws.x||1);holder.scale.setScalar(sc);
    const r=spec.rot||[0,0,0];holder.rotation.set(r[0]*Math.PI/180,r[1]*Math.PI/180,r[2]*Math.PI/180);
    const q=spec.pos||[0,0,0];holder.position.set(q[0]*k/(ws.x||1),q[1]*k/(ws.x||1),q[2]*k/(ws.x||1));return holder}
  /* Eigene Farbtabelle je Eintrag (Kenney-Bausätze haben unterschiedliche colormap-Aufteilungen): cmap:'neu/variation-c.png' */
  const cmapCache={};function cmapOf(root,f){if(!f)return;const t=cmapCache[f]||(cmapCache[f]=(()=>{const x=new THREE.TextureLoader().load('models/'+f);x.flipY=false;x.colorSpace=THREE.SRGBColorSpace;x.magFilter=THREE.NearestFilter;return x})());
    root.traverse(o=>{if(!o.isMesh)return;const f2=m=>{if(!m.map)return m;const n=m.clone();n.map=t;n.needsUpdate=true;return n};o.material=Array.isArray(o.material)?o.material.map(f2):f2(o.material)})}
  /* Materialfarbe nach Materialname setzen (bei Texturen = abdunkeln/tönen), je Material+Farbe nur einmal geklont: {"People_texture_map":"#d0c8c0"} */
  const tintCache=new Map();
  function tintMats(root,map){root.traverse(o=>{if(!o.isMesh)return;const f=m=>{const c=m&&map[m.name];if(!c)return m;const k=m.uuid+c;let n=tintCache.get(k);if(!n){n=m.clone();n.color.set(c);n.name=m.name;tintCache.set(k,n)}return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
  function dress(root,wrap,en,k,team,u){
    const id=(u&&u.id)||0;
    const hide=(en.hide||[]).concat(en.hand||en.left?['^Sword']:[]);/* eigene Waffe → eingebautes Schwert (Sword, Sword_1 …) weg */
    if(en.tint||en.skins||en.hairs||hide.length){root.traverse(o=>{if(!o.isMesh)return;
      if(hide.some(h=>new RegExp(h,'i').test(o.name))){o.visible=false;return}
      if(en.tint||en.skins||en.hairs){const sk=en.skins?en.skins[id%en.skins.length]:null,hr=en.hairs?en.hairs[(id>>1)%en.hairs.length]:null;
        /* Haut je Figur verschieden (Material Skin oder Farbe 'skin' = barfuss/nackte Beine), Haare/Augenbrauen aus 'hairs' */
        const f=m=>{let c=en.tint&&en.tint[m.name];if(sk&&(c==='skin'||(/^(M_Main|M_Joints|Skin)$/.test(m.name))))c=sk;if(hr&&/^(Hair|Eyebrows|Moustache)$/.test(m.name))c=hr;if(!c)return m;const n=m.clone();n.color.set(c);n.name=m.name;return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}})}
    if(en.tintAll){root.traverse(o=>{if(!o.isMesh)return;const f=m=>{const n=m.clone();n.vertexColors=false;n.map=null;n.color.set(en.tintAll);n.needsUpdate=true;return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
    if(en.extras)for(const x of en.extras)attach(root,root,x,k);
    let hh=null;if(en.hand)hh=attach(root,findBone(root,/hand\.?r|wrist\.?r/i),en.hand,k);wrap.userData.handHolder=hh;
    if(en.left)attach(root,findBone(root,/hand\.?l|wrist\.?l/i),en.left,k);
    if(en.pelt||en.cape||en.tooth)cloth(root,en,k,id);}
  /* Fischernetz (work.<art>.net = {file,len,tint,grip,hands,pitch,yaw,bend,twist,cycle}): hängt nicht an der Hand, sondern vor der Figur
     (Halter im Figurenraum: vorn +X, oben +Y, rechts +Z). Im Modell liegt der Stiel entlang −Z mit dem Netz am −Z-Ende → nach +X gedreht,
     Griffende am Halter, Gesamtlänge len. Beide Hände greifen per IK an den Stiel (netPose), Finger zur Faust (erstes Bild eines Punch-Clips). */
  function netRig(rig,root,wrap,s,id,cl){
    const gl=files.get(s.file);if(!gl)return null;const p=EKGLTF.SkeletonUtils.clone(gl.scene);prepare(p,0);
    if(s.tint)p.traverse(o=>{if(!o.isMesh)return;const f=m=>{const c=s.tint[m.name];if(!c)return m;const n=m.clone();n.color.set(c);n.metalness=0;n.roughness=.85;n.name=m.name;return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)});
    const D=Math.PI/180,r=s.rot||[0,-90,0],inner=new THREE.Group();p.rotation.set(r[0]*D,r[1]*D,r[2]*D);inner.add(p);
    let b=box(inner);p.scale.multiplyScalar((s.len||2.8)/((b.max.x-b.min.x)||1));b=box(inner);p.position.x-=b.min.x;
    const h=new THREE.Group();h.rotation.order='YXZ';h.add(inner);wrap.add(h);
    const B=(n,sd)=>findBone(root,new RegExp('^('+n+')[._]?'+sd+'$','i'));
    const arms=['R','L'].map(sd=>[B('UpperArm|Upperarm|upper_arm',sd),B('LowerArm|Lowerarm|forearm',sd),B('Wrist|Hand',sd)]);/* je Arm: Ober-, Unterarm, Handgelenk */
    const fc=cl&&pickClip(cl,[s.fist],/punch/i),fist=[];if(fc)for(const tk of fc.tracks){const m=/^(.+)\.quaternion$/.exec(tk.name),b=m&&/^(index|middle|ring|pinky|thumb)\d/i.test(m[1])&&root.getObjectByName(m[1]);if(b&&b.isBone)fist.push([b,new THREE.Quaternion().fromArray(tk.values,0)])}
    rig.net={h,s,t:0,ph:(id%7)*1.13,bend:0,chest:findBone(root,/^(chest|spine_?03|spine\.?003|spine2)$/i),arms,fist};netPose(rig,0,1);return h}
  /* Zwei-Knochen-IK in Weltkoordinaten: Knochen so drehen, dass der Kindpunkt zum Ziel zeigt; Ellbogen Richtung „pole“ */
  const V=[...Array(12)].map(()=>new THREE.Vector3()),Q=[0,1,2,3].map(()=>new THREE.Quaternion());
  function turnW(b,q){b.parent.getWorldQuaternion(Q[1]);Q[2].copy(Q[1]).invert();b.quaternion.premultiply(q.premultiply(Q[2]).multiply(Q[1]))}/* Drehung q (Welt) auf Knochen b */
  function aimBone(b,child,to){const P=b.getWorldPosition(V[0]),C=child.getWorldPosition(V[1]);turnW(b,Q[0].setFromUnitVectors(C.sub(P).normalize(),V[2].copy(to).sub(P).normalize()))}
  function ik2(U,L,H,T,pole,off){const S=U.getWorldPosition(V[3]),a=S.distanceTo(L.getWorldPosition(V[4])),b=V[4].distanceTo(H.getWorldPosition(V[5])),n=V[6].copy(T).sub(S);
    let d=n.length();n.divideScalar(d||1);d=Math.min(Math.max(d-off,Math.abs(a-b)+1e-3),(a+b)*.999);const x=(a*a-b*b+d*d)/(2*d),hh=Math.sqrt(Math.max(0,a*a-x*x));
    const m=V[7].copy(pole).addScaledVector(n,-pole.dot(n)).normalize(),E=V[8].copy(S).addScaledVector(n,x).addScaledVector(m,hh),Tc=V[9].copy(S).addScaledVector(n,d);
    aimBone(U,L,E);aimBone(L,H,Tc)}
  /* Fischen mit dem Netz: Netz vorn-unten ins Wasser halten, langsam hin und her schwenken und eintauchen, alle paar Sekunden herausheben (Fang ansehen);
     Oberkörper gebeugt (rig.bend) und zum Stiel gedreht, Hände am Stiel. only = nur den Halter stellen (beim Bauen der Figur) */
  function netPose(rig,dt,only){const N=rig.net,s=N.s,h=N.h,t=(N.t+=dt)+N.ph,cy=s.cycle||7,c=t%cy,up=c>cy-1.8?Math.sin((c-cy+1.8)/1.8*Math.PI):0,D=Math.PI/180,g=s.grip||[.3,1.5,.08],sw=Math.sin(t*.8)*(1-.6*up),dip=Math.sin(t*1.4);
    h.position.set(g[0]-.1*up,g[1]+.1*up+.04*dip,g[2]+.06*sw);h.rotation.set(0,(s.yaw||0)*D+.25*sw,-((s.pitch||45)*D+.07*dip)*(1-up)+.3*up);N.bend=(s.bend||.5)*(1-.6*up);if(only)return;
    /* Mixer schreibt Knochen nur bei geänderten Werten → Ausgangslage merken und vor dem nächsten Mixer-Schritt zurücksetzen (sonst addieren sich die Drehungen) */
    if(!N.sv)N.sv=[N.chest,...N.arms.flat(),...N.fist.map(f=>f[0])].filter(Boolean).map(b=>[b,new THREE.Quaternion()]);N.sv.forEach(([b,q])=>q.copy(b.quaternion));N.on=1;
    const wq=h.parent.getWorldQuaternion(Q[3]),hs=s.hands||[.06,.28];
    if(N.chest)turnW(N.chest,Q[0].setFromAxisAngle(V[0].set(0,1,0).applyQuaternion(wq),-(s.twist||.35)+.12*sw));
    h.updateWorldMatrix(true,false);
    N.fist.forEach(([b,q])=>b.quaternion.copy(q));N.arms.forEach(([U,L,H],i)=>{if(!U||!L||!H)return;const T=h.localToWorld(V[10].set(hs[i],0,0));
      ik2(U,L,H,T,V[11].set(i?0:-.4,-1,i?-.7:.7).applyQuaternion(wq),s.palm||.06)})}
  /* Steinzeit-Kleidung aus Formen mit Fell-/Lederstruktur: Hüftrock mit Zipfeln, Gürtel, Fellumhang, Haare, Zahnkette */
  function cloth(root,en,k,id){
    root.updateMatrixWorld(true);
    const sc=b=>{const w=new THREE.Vector3();b.getWorldScale(w);return k/(w.x||1)};
    /* Gruppe an einem Knochen anbringen, aber an der Welt ausrichten (Knochenachsen sind oft gedreht): vorn = +X, oben = +Y */
    const mount=(b,g,x,y,z)=>{const qb=new THREE.Quaternion(),qr=new THREE.Quaternion();b.getWorldQuaternion(qb);root.getWorldQuaternion(qr);
      g.quaternion.copy(qr.clone().invert().multiply(qb).invert());g.scale.setScalar(sc(b));
      const o=new THREE.Vector3(x||0,y||0,z||0).applyQuaternion(g.quaternion);g.position.copy(o.multiplyScalar(g.scale.x));b.add(g)};
    const fur=c=>m3Mat('fur',c,{side:THREE.DoubleSide,flatShading:true}),lea=c=>m3Mat('leather',c,{side:THREE.DoubleSide});
    const add=(g,mesh,x,y,z)=>{mesh.position.set(x,y,z);mesh.castShadow=true;g.add(mesh);return mesh};
    const hips=findBone(root,/hips|pelvis/i);
    if(hips&&en.pelt){const g=new THREE.Group(),f=fur(en.pelt),bt=lea(en.belt||'#3b2a1a');
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.175,.215,.2,10,1,true),f),0,-.07,0);
      for(let i=0;i<8;i++){const a=i/8*6.283,z=new THREE.Mesh(new THREE.ConeGeometry(.05,.2,4),f);z.rotation.x=Math.PI;add(g,z,Math.cos(a)*.2,-.26,Math.sin(a)*.2)}
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.04,10,1,true),bt),0,.03,0);
      add(g,new THREE.Mesh(new THREE.BoxGeometry(.03,.09,.05),bt),.185,0,0);
      mount(hips,g,0,.02,0)}
    const ch=findBone(root,/spine\.?003|spine\.?002|^chest$/i);
    /* Steinzeit-Oberteil: Fellweste über der Brust mit Schulterriemen */
    const sp1=findBone(root,/spine\.?002|spine\.?001/i);
    if(sp1&&en.pelt){const g=new THREE.Group(),f=fur(en.top||en.pelt);
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.185,.175,.34,10,1,true),f),0,.1,0);
      const st=add(g,new THREE.Mesh(new THREE.BoxGeometry(.05,.36,.42),f),0,.18,0);st.rotation.x=.55;
      mount(sp1,g,0,0,0)}
    if(ch&&en.cape){const g=new THREE.Group(),f=fur(en.cape);
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.27,.33,.2,10,1,true,Math.PI/2+.7,Math.PI*2-1.4),f),0,.05,0);
      const s2=add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),f),-.06,.14,.22);s2.scale.set(1.2,.5,1);const s3=add(g,new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),f),-.06,.14,-.22);s3.scale.set(1.2,.5,1);
      mount(ch,g,0,0,0)}
    const hd=findBone(root,/^DEF-?head$|head/i);
    if(hd&&en.hair){const hc=en.hair[id%en.hair.length],g=new THREE.Group(),hm=m3Plain(hc,.9);
      const cap=add(g,new THREE.Mesh(new THREE.SphereGeometry(.168,10,8,0,6.283,0,Math.PI*.52),hm),-.015,.16,0);cap.scale.set(1.05,.9,1);
      add(g,new THREE.Mesh(new THREE.SphereGeometry(.07,6,5),hm),-.12,.14,0).scale.set(.8,1,1);
      for(let i=0;i<4;i++){const lk=new THREE.Mesh(new THREE.ConeGeometry(.035,.2,4),hm);lk.rotation.z=.18;add(g,lk,-.14,.05-i*.02,(i-1.5)*.06)}
      if(id%3===0)add(g,new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),hm),.1,.07,0).scale.set(.7,1.1,1.2);
      mount(hd,g,0,0,0)}
    const nk=findBone(root,/neck/i);
    if(nk&&en.tooth){const g=new THREE.Group();for(let i=0;i<7;i++){const a=i/7*6.283,t=new THREE.Mesh(new THREE.ConeGeometry(.018,.06,4),m3Plain('#efe6d2',.7));t.rotation.x=Math.PI;add(g,t,Math.cos(a)*.1,-.03,Math.sin(a)*.1)}
      add(g,new THREE.Mesh(new THREE.TorusGeometry(.1,.008,5,14),lea('#3b2a1a')),0,0,0).rotation.x=Math.PI/2;mount(nk,g,0,0,0)}
  }

  /* Blickrichtung automatisch aus dem Skelett: links→rechts-Richtung der Hände (T-Haltung) ergibt die Blickrichtung (vorn = links × oben);
     liefert die Drehung um Y, die die Figur nach +X (Spielrichtung 0) dreht */
  function faceAngle(root){
    try{root.updateMatrixWorld(true);let L=null,R=null;root.traverse(o=>{if(!o.isBone)return;if(!L&&/(hand|wrist)\.?l$/i.test(o.name))L=o;if(!R&&/(hand|wrist)\.?r$/i.test(o.name))R=o});
    if(!L||!R)return null;const a=new THREE.Vector3(),b=new THREE.Vector3();L.getWorldPosition(a);R.getWorldPosition(b);
    const lx=a.x-b.x,lz=a.z-b.z;if(Math.hypot(lx,lz)<1e-5)return null;
    /* vorn = links × oben(0,1,0) = (lz, 0, -lx) */
    const fx=-lz,fz=lx;return Math.round(Math.atan2(fz,fx)/(Math.PI/2))*(Math.PI/2)}catch(_){return null}}
  /* Tiere mit Skelett: Blickrichtung aus Kopf-Knochen minus Körper-/Hüftknochen (waagrecht), auf 90° gerundet.
     Liefert die Drehung um Y, die den Kopf nach +X (Spielrichtung 0) dreht; null = kein passendes Skelett (dann gilt nur „yaw“ im Manifest) */
  function animalFace(root){
    try{root.updateMatrixWorld(true);let H=null,B=null;
    root.traverse(o=>{if(!o.isBone)return;if(!H&&/^head$/i.test(o.name))H=o;if(!B&&/^(body|hips|pelvis|root|spine\d*|torso\d*)$/i.test(o.name))B=o});
    if(!H)root.traverse(o=>{if(!H&&o.isBone&&/head/i.test(o.name)&&!/end|top/i.test(o.name))H=o});
    if(!H||!B)return null;const a=new THREE.Vector3(),b=new THREE.Vector3();H.getWorldPosition(a);B.getWorldPosition(b);
    const fx=a.x-b.x,fz=a.z-b.z;if(Math.hypot(fx,fz)<1e-5)return null;
    return Math.round(Math.atan2(fz,fx)/(Math.PI/2))*(Math.PI/2)}catch(_){return null}}
  function makeUnit(u,origMake,kind,enO){
    kind=kind||'unit';const en=enO||entryFor(kind,u.type,u.lvl||0);if(!en)return null;
    /* Abwechslung: vary:[Dateien] – jede Figur bekommt nach ihrer Nummer (u.id) eine davon (z. B. verschiedene Bauern), sonst file */
    const fv=(en.vary||[]).filter(f=>files.has(f)),gl=files.get(fv.length?fv[(u.id||0)%fv.length]:en.file);
    try{
      const root=EKGLTF.SkeletonUtils.clone(gl.scene),wrap=new THREE.Group();wrap.add(root);prepare(root,u.team);
      {const fa=en.human?faceAngle(root):kind==='animal'?animalFace(root):null;root.rotation.y=(fa||0)+(en.yaw||0)*Math.PI/180}
      let b=box(wrap),sz=b.getSize(new THREE.Vector3());const ref=refSize(kind,u.type,()=>origMake(u).g);
      const k=(en.human?(2.4/1.84):en.len?en.len/(Math.max(sz.x,sz.z)||1):en.height?en.height/(sz.y||1):(en.fit==='length'||(kind==='animal'&&!en.fit))?ref.m/(Math.max(sz.x,sz.y,sz.z)||1):ref.h/(sz.y||1))*(en.scale||1);
      root.scale.multiplyScalar(k);b=box(wrap);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-b.min.y+(en.lift||0),-c.z);
      cmapOf(root,en.cmap);dress(root,wrap,en,k,u.team,u);
      const rig={g:wrap,gltf:true,bend:en.human?findBone(root,/^(Abdomen|Spine|Spine1|spine|DEF-spine\.?001)$/i):null,bendA:0,human:!!(en.human||(en.rider&&!en.rider.free)),legs:[],arms:[],tools:{},acts:{},cur:null};
      if(gl.animations&&gl.animations.length){rig.mixer=new THREE.AnimationMixer(root);const A=en.anim||{},cl=gl.animations;
        const map={idle:pickClip(cl,[A.idle],/idle|stand|rest/i),walk:pickClip(cl,[A.walk],/walk|run|move/i),attack:pickClip(cl,[A.attack],/attack|hit|strike|shoot|fire/i),work:pickClip(cl,[A.work],/work|gather|chop|mine|build|dig/i)};
        for(const n in map)if(map[n])rig.acts[n]=rig.mixer.clipAction(map[n]);
        if(en.work){rig.wtools={};const hb=findBone(root,/hand\.?r|wrist\.?r/i);rig.hand=wrap.userData.handHolder||null;
          for(const kd in en.work){const w=en.work[kd],c=pickClip(cl,[w.clip],/work|interact/i);if(c)rig.acts['w:'+kd]=rig.mixer.clipAction(c);
            const h=w.net?netRig(rig,root,wrap,w.net,u.id||0,cl):w.tool&&hb?attach(root,hb,w.tool,k):null;if(h){h.visible=false;rig.wtools[kd]=h}}}
        const first=rig.acts.idle||rig.acts.walk;if(first){first.play();rig.cur=first===rig.acts.idle?'idle':'walk'}}
      /* Reiter: Pferd + Figur einer anderen Truppenlinie (rider.as) im selben Zeitalter, sitzt auf dem Rücken */
      if(en.rider){let rr=null;for(const as of[].concat(en.rider.as)){if(entryFor('unit',as,u.lvl||0)){rr=makeUnit(Object.assign({},u,{type:as}),origMake,'unit');break}}if(rr){
        /* sitzen: Oberschenkel nach vorn und leicht gespreizt (wird nach jeder Animation aufgesetzt) */rr.sit=['L','R'].map(s=>findBone(rr.g,new RegExp('^(UpperLeg|thigh|DEF-thigh)\\.?'+s+'$','i'))).filter(Boolean);rr.shin=['L','R'].map(s=>findBone(rr.g,new RegExp('^(LowerLeg|shin|DEF-shin)\\.?'+s+'$','i'))).filter(Boolean);if(en.rider.scale)rr.g.scale.multiplyScalar(en.rider.scale);if(en.rider.net&&rr.net){rr.net.s=Object.assign({},rr.net.s,en.rider.net);rr.net.side=(u.id||0)%2?1:-1}/* Netz-Haltung im Boot: turn = Drehung zur Bordwand, pitch flacher */const hb=box(wrap);rr.g.position.set(en.rider.x||0,(hb.max.y-hb.min.y)*(en.rider.seat||.55)-1.05,0);wrap.add(rr.g);rig.rider=rr}}
      return rig}catch(err){console.warn('glTF-Einheit',u.type,err);return null}}
  function makeBld(type,R_,ep,team,origMake,sp){
    const en=entryFor('bld',type,ep,sp);if(!en)return null;const gl=files.get(en.file);
    try{
      const root=EKGLTF.SkeletonUtils.clone(gl.scene),wrap=new THREE.Group();wrap.add(root);prepare(root,team);cmapOf(root,en.cmap);if(en.pal)palette(root,en.pal,team);root.rotation.y=(en.yaw||0)*Math.PI/180;
      let b=box(wrap),sz=b.getSize(new THREE.Vector3());
      const k=(en.footprint?en.footprint/(Math.max(sz.x,sz.z)||1):(R_*2.5*(en.fit||1))/(Math.max(sz.x,sz.z)||1))*(en.scale||1);
      root.scale.multiplyScalar(k);b=box(wrap);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-b.min.y,-c.z);
      wrap.userData.h=b.max.y-b.min.y;wrap.userData.flags=[];wrap.userData.gltf=true;wrap.userData.spec=en.spec||''/* eigenes Ausbau-Modell: Code-Zusätze (specModel) entfallen */;
      /* Fahne in Spielerfarbe: flag:{x,z,y,h} – x/z in Gebäude-Radien, y = Anteil der Modellhöhe (1 = ganz oben), h = Mastlänge in Radien */
      if(en.flag){const F=en.flag,H=wrap.userData.h,ph=(F.h||.9)*R_,pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,ph,5),m3Plain(0x4a3a2a,.8));
        pole.position.set((F.x||0)*R_,(F.y===undefined?1:F.y)*H+ph/2-.05,(F.z||0)*R_);wrap.add(pole);const fp=new THREE.Group();fp.position.set(pole.position.x,pole.position.y+ph*.32,pole.position.z);fp.userData.flag=true;
        const cl=new THREE.Mesh(new THREE.BoxGeometry(ph*.5,ph*.32,.03),m3Team(team));cl.position.x=ph*.25/* Tuch zeigt zur Kamera */;pole.castShadow=cl.castShadow=true;fp.add(cl);wrap.add(fp);wrap.userData.flags.push(fp)}
      /* Beiwerk neben dem Gebäude (z. B. Pranger, Galgen): props:[{file,h,x,z,ry,y}] – x/z in Gebäude-Radien, h = Höhe in Welteinheiten */
      for(const pr of en.props||[]){const g2=files.get(pr.file);if(!g2)continue;const o=EKGLTF.SkeletonUtils.clone(g2.scene);prepare(o,team);if(pr.tint)tintMats(o,pr.tint);o.rotation.y=(pr.ry||0)*Math.PI/180;
        const s2=box(o).getSize(new THREE.Vector3());o.scale.setScalar((pr.h||1.5)/(s2.y||1));const b3=box(o),c3=b3.getCenter(new THREE.Vector3());o.position.set((pr.x||0)*R_-c3.x,-b3.min.y+(pr.y||0)*wrap.userData.h,(pr.z||0)*R_-c3.z);wrap.add(o)
        /* Figuren als Beiwerk (König, Bürger): anim = Clip, der dauernd läuft (z. B. Idle = Atmen), versetzt gestartet; der Renderer ruft userData.mix je Bild auf */
        const ac=pr.anim&&pickClip(g2.animations||[],[pr.anim],/idle/i);if(ac){const mx=new THREE.AnimationMixer(o);mx.clipAction(ac).play();mx.update((pr.x||0)*7%ac.duration+ac.duration);(wrap.userData.mix||(wrap.userData.mix=[])).push(mx)}} /* y = Höhe in Gebäudehöhen (z. B. Ballon über dem Turm) */
      return wrap}catch(err){console.warn('glTF-Gebäude',type,err);return null}}
  /* Bäume, Felsen, Büsche als Instanzen: liefert die Einzelteile (Geometrie+Material) eines glTF-Modells. Grösse: k = fester Massstab (Modell-Einheiten → Spiel,
     behält die Grössenunterschiede innerhalb eines Pakets), sonst height, sonst Höhe des Code-Modells (refGeo); scale wirkt zusätzlich.
     Modelle ohne Texturen werden „gebacken“: alle Teile in EINE Geometrie mit Eckpunkt-Farben (1 Zeichenaufruf je Variante); colors:{Material:Farbe} färbt einzelne Materialien um */
  const nodeList=key=>{const en0=manifest&&manifest.nodes&&manifest.nodes[key];return en0?(Array.isArray(en0)?en0:[en0]).filter(x=>x&&x.file&&!x.off&&files.has(x.file)):[]};
  const pCache=new Map();
  function bakeParts(parts,en){
    let nv=0,ni=0;for(const p of parts){nv+=p.g.attributes.position.count;ni+=p.g.index?p.g.index.count:p.g.attributes.position.count}
    const hasN=parts.every(p=>p.g.attributes.normal),pos=new Float32Array(nv*3),nor=hasN?new Float32Array(nv*3):null,col=new Float32Array(nv*3),idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni),c=new THREE.Color();let o=0,oi=0,ro=0;
    for(const p of parts){const P=p.g.attributes.position,N=p.g.attributes.normal,n=P.count,nm=(p.m.name||'').replace(/\.\d+$/,'');c.copy(p.m.color);if(en.tint)c.set(en.tint);else if(en.colors&&en.colors[nm])c.set(en.colors[nm]);
      for(let i=0;i<n;i++){const j=(o+i)*3;pos[j]=P.getX(i);pos[j+1]=P.getY(i);pos[j+2]=P.getZ(i);if(nor){nor[j]=N.getX(i);nor[j+1]=N.getY(i);nor[j+2]=N.getZ(i)}col[j]=c.r;col[j+1]=c.g;col[j+2]=c.b}
      if(p.g.index)for(let i=0;i<p.g.index.count;i++)idx[oi++]=p.g.index.getX(i)+o;else for(let i=0;i<n;i++)idx[oi++]=o+i;o+=n;ro+=p.m.roughness!==undefined?p.m.roughness:.9}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));if(nor)g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:Math.max(.6,ro/parts.length),metalness:0,flatShading:!nor,side:parts.some(p=>p.m.side===THREE.DoubleSide)?THREE.DoubleSide:THREE.FrontSide});m.envMapIntensity=.3;
    return[{g,m,baked:true}]}
  function nodeParts(key,v,refGeo){
    const L=nodeList(key);if(!L.length)return null;const ck=key+'|'+v;if(pCache.has(ck))return pCache.get(ck);
    const en=L[v%L.length],gl=files.get(en.file);let parts=[];gl.scene.updateMatrixWorld(true);
    const want=en.mesh&&en.mesh.replace(/\./g,'');gl.scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&(!want||o.name===want)){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);parts.push({g,m:o.material})}});if(!parts.length)return null;
    if(en.bake!==false&&parts.every(p=>p.m&&p.m.color&&!p.m.map&&!p.g.attributes.color))parts=bakeParts(parts,en);
    const bb=new THREE.Box3();for(const p of parts){p.g.computeBoundingBox();bb.union(p.g.boundingBox)}
    const sz=bb.getSize(new THREE.Vector3());let rh=1;if(!en.k&&!en.height&&refGeo){refGeo.computeBoundingBox();const rb=refGeo.boundingBox;rh=(rb.max.y-rb.min.y)||1}
    const k=(en.k||(en.height||rh)/(sz.y||1))*(en.scale||1),c=bb.getCenter(new THREE.Vector3());
    const out=parts.map(p=>{p.g.translate(-c.x,-bb.min.y,-c.z);p.g.scale(k,k,k);if(p.baked)return{geo:p.g,mat:p.m};const m=p.m.clone();if(en.tint&&m.color)m.color.set(en.tint);if(m.isMeshStandardMaterial&&m.envMapIntensity>.5)m.envMapIntensity=.3;return{geo:p.g,mat:m}});
    /* Zusatz auf dem Felsen (z. B. Erz-Kristalle): extra:{file,mesh,tint,scale,y,n} – n Kristalle rund um die Kuppe */
    const X=en.extra,gx=X&&files.get(X.file);if(gx){gx.scene.updateMatrixWorld(true);const want2=X.mesh&&X.mesh.replace(/\./g,'');let src=null;gx.scene.traverse(o=>{if(!src&&o.isMesh&&(!want2||o.name===want2))src=o});
      if(src){const H=sz.y*k,W2=Math.max(sz.x,sz.z)*k;for(let i=0;i<(X.n||3);i++){const g=src.geometry.clone();g.applyMatrix4(src.matrixWorld);g.computeBoundingBox();const b2=g.boundingBox,s2=b2.getSize(new THREE.Vector3()),c2=b2.getCenter(new THREE.Vector3());
        const kk=H*(X.scale||.5)*(.75+.25*((i*7+v)%3))/(s2.y||1);g.translate(-c2.x,-b2.min.y,-c2.z);g.scale(kk,kk,kk);g.rotateZ((i-1)*.35);g.rotateY(i*2.1+v);const a=i*2.1+v,rr=W2*.18;g.translate(Math.cos(a)*rr,H*(X.y||.55),Math.sin(a)*rr);
        const m=src.material.clone();if(X.tint)m.color.set(X.tint);m.metalness=X.metal||.4;m.roughness=.35;if(X.glow){m.emissive=new THREE.Color(X.tint);m.emissiveIntensity=X.glow}out.push({geo:g,mat:m})}}}
    pCache.set(ck,out);return out}
  /* Anzahl der Varianten eines Natur-Schlüssels und Zusatzangaben (z. B. Getreide-Reihen auf dem Feld) */
  const nodeN=key=>nodeList(key).length,nodeMeta=key=>nodeList(key)[0]||null;
  /* Symbole (Ressourcen in der oberen Leiste): echtes Modell aus manifest.icons, vom Symbol-Renderer (ICON3) in ein Bild gemalt */
  function iconModel(name){
    const en=manifest&&manifest.icons&&manifest.icons[name];if(!en||!files.has(en.file))return null;
    const root=EKGLTF.SkeletonUtils.clone(files.get(en.file).scene);
    root.traverse(o=>{if(!o.isMesh)return;const f=m=>{const c=m.clone();if(en.tint&&c.color){c.color.set(en.tint);if(en.metal!==undefined)c.metalness=en.metal;if(en.rough!==undefined)c.roughness=en.rough}if(c.isMeshStandardMaterial)c.envMapIntensity=.3;return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)});
    const g=new THREE.Group(),r=en.rot||[0,0,0];root.rotation.set(r[0]*Math.PI/180,r[1]*Math.PI/180,r[2]*Math.PI/180);g.add(root);g.userData.focus=en.focus||0;return g}
  /* Meeresbewohner (Fischschwarm, Delfine, Wale): mehrere Fische aus der Liste, im Kreis, mit Schwimm-Animation */
  function makeSea(e,orig){
    const en=manifest&&manifest.sea&&manifest.sea[e.type];if(!en)return null;const L=(en.files||[]).filter(f=>files.has(f));if(!L.length)return null;
    const g=new THREE.Group(),mix=[],n=en.count||1;
    for(let i=0;i<n;i++){const gl=files.get(L[(e.id+i*3)%L.length]),root=EKGLTF.SkeletonUtils.clone(gl.scene),w=new THREE.Group();w.add(root);prepare(root,0);root.rotation.order='YXZ';root.rotation.y=(en.yaw||0)*Math.PI/180;root.rotation.x=(en.roll||0)*Math.PI/180;
      if(en.tint)root.traverse(o=>{if(o.isMesh){const f=m=>{const c=m.clone();c.color.set(en.tint);return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}});
      let b=box(w),sz=b.getSize(new THREE.Vector3());const k=(en.size||1)*(.85+((e.id*7+i*13)%10)/33)/(Math.max(sz.x,sz.y,sz.z)||1);root.scale.multiplyScalar(k);b=box(w);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-c.y,-c.z);
      const a=i/n*6.283+e.id,r=n>1?(en.spread||1.1)*1.7*(.5+((i*37+e.id)%5)/8):0;w.position.set(Math.cos(a)*r,0,Math.sin(a)*r);w.rotation.y=-(a+1.5708);w.userData.ph=i;
      const cl=gl.animations.find(c=>/swim.*(normal|idle)|swim/i.test(c.name))||gl.animations[0];if(cl){const m=new THREE.AnimationMixer(root);m.clipAction(cl).play();m.update(Math.random()*2);mix.push(m)}
      if(n>1)(g.userData.school||(g.userData.school=[])).push({w,a,r,sp:.35+((i*17+e.id)%5)/25});
      g.add(w)}
    const ring=new THREE.Mesh(new THREE.RingGeometry(.82,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:.75,depthWrite:false,fog:false}));ring.userData.ring=true;g.add(ring);
    g.userData.mix=mix;return g}
  /* Animationen pro Bild: passenden Clip wählen, weich überblenden */
  function animate(rig,want,dt,speedScale,kind){
    if(rig.rider){const r=rig.rider,pose=k=>{if(r.sit)r.sit.forEach((b,i)=>{b.rotation.x-=1.35*k;b.rotation.z+=(i?-.35:.35)*k});if(r.shin)r.shin.forEach(b=>{b.rotation.x+=1.3*k})};if(r.posed)pose(-1);
      /* Fischerboot: der Ruderer dreht sich zur Bordwand (net.turn, Seite je Boot) und hält das Netz ins Wasser */const rf=r.net&&want==='work'&&kind==='fish';
      if(r.net){const tn=rf?(r.net.s.turn||0)*Math.PI/180*(r.net.side||1):0,sp=typeof G!=='undefined'&&(G.paused||G.netPause)?0:1;r.g.rotation.y+=(tn-r.g.rotation.y)*Math.min(1,dt*sp*3)}
      animate(r,rf?'work':want==='walk'||want==='work'?'idle':want,dt,1,rf?'fish':'');pose(1);r.posed=1}
    if(!rig.mixer)return;if(typeof G!=='undefined')dt*=G.paused||G.netPause?0:(G.speed||1);
    if(rig.wtools){for(const kd in rig.wtools)rig.wtools[kd].visible=(want==='work'&&kind===kd);if(rig.hand)rig.hand.visible=!(want==='work'&&rig.wtools[kind])}
    const wkey=want==='work'&&kind&&rig.acts['w:'+kind]?'w:'+kind:null;
    if(want==='idle'&&!rig.acts.idle&&rig.cur){rig.acts[rig.cur].fadeOut(.2);rig.cur=null}if(want==='idle'&&!rig.acts.idle){rig.mixer.update(dt*(speedScale||1));return}
    const chain={attack:['attack','idle'],work:['work','idle'],walk:['walk','idle'],idle:['idle']},w=wkey||(chain[want]||['idle']).find(n=>rig.acts[n])||null;
    /* gleicher Clip unter zwei Namen (z. B. Fischen = Idle) ist dieselbe Aktion: nicht ein- und zugleich ausblenden (sonst Gewicht 0 = Grundhaltung) */
    if(w&&rig.cur!==w){const a=rig.acts[w],p=rig.cur&&rig.acts[rig.cur];if(a!==p){a.reset().fadeIn(.2).play();if(p)p.fadeOut(.2)}rig.cur=w}
    if(rig.bend&&rig.bendP){rig.bend.rotation.x-=rig.bendP;rig.bendP=0}if(rig.net&&rig.net.on){rig.net.sv.forEach(([b,q])=>b.quaternion.copy(q));rig.net.on=0}
    rig.mixer.update(dt*(speedScale||1));
    /* Beeren pflücken / Fischen: Oberkörper nach vorn beugen (nach der Animation aufgesetzt), beim Fischen danach Netz-Pose */
    const fish=rig.net&&want==='work'&&kind==='fish';
    if(rig.bend){const t=want==='work'&&kind==='pick'?.75:fish?rig.net.bend:0;rig.bendA+=(t-rig.bendA)*Math.min(1,dt*5);if(rig.bendA>.01){rig.bend.rotation.x+=rig.bendA;rig.bendP=rig.bendA}}
    if(fish)netPose(rig,dt)}
  async function init(url){
    if(typeof EKGLTF==='undefined'){return}
    try{const r=await fetch(url||'models/manifest.json',{cache:'no-cache'});if(!r.ok)return;manifest=await r.json()}catch(_){return}
    /* Kenney-Bausätze verweisen auf Textures/colormap.png: stattdessen die Farbtabelle aus dem Manifest (cmap) nehmen */
    const mgr=new THREE.LoadingManager();if(manifest.cmap)mgr.setURLModifier(u=>/colormap\.png$/.test(u)?'models/'+manifest.cmap:u);
    loader=new EKGLTF.GLTFLoader(mgr);try{loader.setMeshoptDecoder(EKGLTF.MeshoptDecoder)}catch(_){}
    const want=new Set();for(const x of Object.values(manifest.icons||{}))if(x&&x.file)want.add(x.file);for(const sn of Object.keys(manifest.sea||{}))for(const f of(manifest.sea[sn].files||[]))want.add(f);for(const s of['units','buildings','animals','nodes'])for(const en of Object.values(manifest[s]||{}))for(const x of Array.isArray(en)?en:[en])if(x&&x.file&&!x.off){want.add(x.file);for(const f of x.vary||[])want.add(f);if(x.hand&&x.hand.file)want.add(x.hand.file);if(x.left&&x.left.file)want.add(x.left.file);if(x.work)for(const w of Object.values(x.work)){if(w.tool&&w.tool.file)want.add(w.tool.file);if(w.net&&w.net.file)want.add(w.net.file)}if(x.extra&&x.extra.file)want.add(x.extra.file);for(const pr of(x.props||[]).concat(x.extras||[]))if(pr&&pr.file)want.add(pr.file)}
    await Promise.all([...want].map(async f=>{try{files.set(f,await loader.loadAsync('models/'+f))}catch(err){failed.push(f);console.warn('Modell nicht geladen:',f,err&&err.message)}}));
    pCache.clear();R.ready=true;R.ver++;/* Einheiten/Gebäude/Tiere: Signaturen ändern sich über tag() von selbst; Bäume/Felsen: Instanzen neu aufbauen */try{if(typeof r3!=='undefined'&&r3.scene&&typeof G!=='undefined'&&G&&G.ents&&G.ents.length)r3NodesInit()}catch(_){}
    try{if(typeof ICON3!=='undefined'){ICON3.clear();document.querySelectorAll('[data-ic]').forEach(el=>{el.innerHTML=ART.icon(el.dataset.ic)})}}catch(_){}}
  /* für Tests/Vorschau: Modell von Hand eintragen */
  function register(kind,type,entry,gltf){if(!manifest)manifest={units:{},buildings:{}};const s=secOf(kind);(manifest[s]||(manifest[s]={}))[type]=entry;files.set(entry.file,gltf);R.ver++}
  return Object.assign(R,{init,tag,has,makeUnit,makeBld,makeSea,iconModel,nodeParts,nodeN,nodeMeta,nodeL:nodeList,animate,register,files,failed,refSize,dbg:()=>({refCache})})
})();
/* Modelle in die Bau-Funktionen einhängen (Rückfall auf die Code-Modelle, wenn nichts passt) */
(()=>{const origU=buildUnit,origB=buildBld;window.origBuildUnit=origU;
  buildUnit=function(u){const r=EKMODELS.makeUnit(u,origU);if(r){M3.curId=u.id;return r}return origU(u)};
  const origA=buildAnimal;buildAnimal=function(e){const r=EKMODELS.makeUnit(e,origA,'animal');return r||origA(e)};
  buildBld=function(type,R,ep,team,sp){const g=EKMODELS.makeBld(type,R,ep,team,origB,sp);return g||origB(type,R,ep,team)};
})();
