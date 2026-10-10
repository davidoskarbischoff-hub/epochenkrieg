/* Epochenkrieg – echte 3D-Modelle (glTF/.glb) statt der im Code gebauten Formen.
   Ablauf: models/manifest.json sagt, welche Einheit/welches Gebäude (und welches Zeitalter) welche .glb-Datei bekommt. Fehlt ein Eintrag oder eine Datei,
   nimmt das Spiel automatisch das bisherige Code-Modell (Rückfall). Anleitung für David: MODELLE.md. Vorschau-Werkzeug: tools/model-viewer.html.
   Regeln für Modelle: Blickrichtung +Z (Blender-Standard beim glTF-Export), Y oben, Meter-Maßstab egal (wird auf die Spielgröße angepasst),
   Material mit „Team“ im Namen (z. B. „TeamColor“) bekommt die Spielerfarbe, Animationen heißen z. B. Idle/Walk/Attack/Work. */
const EKMODELS=(()=>{
  let manifest=null,loader=null;const files=new Map(),failed=[],refCache={},teamMats=new Map();
  const R={ready:false,ver:0};
  const secOf=k=>k==='unit'?'units':k==='bld'?'buildings':k==='animal'?'animals':'nodes';
  function entryFor(kind,type,ep){
    const sec=manifest&&manifest[secOf(kind)];let en=sec&&sec[type];if(!en)return null;
    for(const x of Array.isArray(en)?en:[en]){if(x&&x.file&&!x.off&&(!x.epochs||x.epochs.includes(ep))&&files.has(x.file))return x}return null}
  /* Kennzeichen für die Modell-Signatur im Renderer: ändert sich, wenn ein glTF-Modell zuständig wird (dann wird die Figur neu gebaut) */
  function tag(e){if(!manifest||!files.size)return'';
    if(e.kind==='unit'){const en=entryFor('unit',e.type,e.lvl||0);return en?'|g:'+en.file:''}
    if(e.kind==='bld'){const en=entryFor('bld',e.type,G.epoch[e.team]);return en?'|g:'+en.file:''}
    if(e.kind==='animal'){const en=entryFor('animal',e.type,0);return en?'|g:'+en.file:''}
    if(e.kind==='node'&&e.sea&&manifest.sea&&manifest.sea[e.type]&&files.size)return'|gs';return''}
  function has(kind,type,ep){return !!entryFor(kind,type,ep)}
  /* Material mit „Team“ im Namen → Spielerfarbe (je Team ein eigenes Material); alle anderen: schwache Himmelsspiegelung wie im Rest des Spiels */
  function prepare(root,team){
    root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
      const fix=m=>{if(!m)return m;if(/team|farbe/i.test(m.name||'')){const k=m.uuid+':'+team;let c=teamMats.get(k);if(!c){c=m.clone();c.color.set(TC[team]);c.name=m.name;teamMats.set(k,c)}return c}
        if(m.isMeshStandardMaterial&&m.envMapIntensity>.5)m.envMapIntensity=.3;return m};
      o.material=Array.isArray(o.material)?o.material.map(fix):fix(o.material)})}
  const box=o=>{o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o)};
  /* Größe des bisherigen Code-Modells als Maßstab: so passt ein neues Modell automatisch zur Spielgröße */
  function refSize(kind,type,make){const k=kind+type;if(refCache[k])return refCache[k];try{const b=box(make()),s=b.getSize(new THREE.Vector3());return refCache[k]={h:s.y||1,m:Math.max(s.x,s.y,s.z)||1,w:Math.max(s.x,s.z)||1}}catch(_){return refCache[k]={h:2.3,m:3,w:3}}}
  function pickClip(clips,names,re){for(const n of names||[]){const c=clips.find(c=>c.name===n||c.name.split('|').pop()===n);if(c)return c}return clips.find(c=>re.test(c.name))}
  /* Umbauen eines Modells ohne neue Datei: Material einfärben (tint), Teile verstecken (hide), Waffen/Werkzeuge in die Hände (hand/off), Fell-Hüftrock (pelt).
     So wird aus der nackten Basisfigur ein Steinzeit-Jäger, aus der Mittelalterfigur ein Speerträger usw. Siehe MODELLE.md. */
  function findBone(root,re){let f=null;root.traverse(o=>{if(!f&&o.isBone&&re.test(o.name))f=o});return f}
  function attach(root,bone,spec,k){
    const gl=files.get(spec.file);if(!bone||!gl)return;const p=EKGLTF.SkeletonUtils.clone(gl.scene);prepare(p,0);
    const holder=new THREE.Group();holder.add(p);bone.add(holder);root.updateMatrixWorld(true);
    const ws=new THREE.Vector3();bone.getWorldScale(ws);const sc=k*(spec.scale||1)/(ws.x||1);holder.scale.setScalar(sc);
    const r=spec.rot||[0,0,0];holder.rotation.set(r[0]*Math.PI/180,r[1]*Math.PI/180,r[2]*Math.PI/180);
    const q=spec.pos||[0,0,0];holder.position.set(q[0]*k/(ws.x||1),q[1]*k/(ws.x||1),q[2]*k/(ws.x||1))}
  function dress(root,wrap,en,k,team,u){
    const id=(u&&u.id)||0;
    if(en.tint||en.hide){root.traverse(o=>{if(!o.isMesh)return;
      if(en.hide&&en.hide.some(h=>new RegExp(h,'i').test(o.name))){o.visible=false;return}
      if(en.tint){const f=m=>{let c=en.tint[m.name];if(c&&en.skins&&/^M_(Main|Joints)$/.test(m.name))c=en.skins[id%en.skins.length];if(!c)return m;const n=m.clone();n.color.set(c);n.name=m.name;return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}})}
    if(en.tintAll){root.traverse(o=>{if(!o.isMesh)return;const f=m=>{const n=m.clone();n.vertexColors=false;n.map=null;n.color.set(en.tintAll);n.needsUpdate=true;return n};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)})}
    if(en.extras)for(const x of en.extras)attach(root,root,x,k);
    if(en.hand)attach(root,findBone(root,/hand\.?r|wrist\.?r/i),en.hand,k);
    if(en.left)attach(root,findBone(root,/hand\.?l|wrist\.?l/i),en.left,k);
    if(en.pelt)cloth(root,en,k,id);}
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
    if(hips){const g=new THREE.Group(),f=fur(en.pelt),bt=lea(en.belt||'#3b2a1a');
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.2,.255,.2,10,1,true),f),0,-.07,0);
      for(let i=0;i<8;i++){const a=i/8*6.283,z=new THREE.Mesh(new THREE.ConeGeometry(.05,.2,4),f);z.rotation.x=Math.PI;add(g,z,Math.cos(a)*.24,-.26,Math.sin(a)*.24)}
      add(g,new THREE.Mesh(new THREE.CylinderGeometry(.208,.208,.04,10,1,true),bt),0,.03,0);
      add(g,new THREE.Mesh(new THREE.BoxGeometry(.03,.09,.05),bt),.21,0,0);
      mount(hips,g,0,.02,0)}
    const ch=findBone(root,/spine\.?003|spine\.?002/i);
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

  function makeUnit(u,origMake,kind){
    kind=kind||'unit';const en=entryFor(kind,u.type,u.lvl||0);if(!en)return null;const gl=files.get(en.file);
    try{
      const root=EKGLTF.SkeletonUtils.clone(gl.scene),wrap=new THREE.Group();wrap.add(root);prepare(root,u.team);
      root.rotation.y=(en.yaw||0)*Math.PI/180;
      let b=box(wrap),sz=b.getSize(new THREE.Vector3());const ref=refSize(kind,u.type,()=>origMake(u).g);
      const k=(en.human?(2.4/1.84):en.height?en.height/(sz.y||1):(en.fit==='length'||(kind==='animal'&&!en.fit))?ref.m/(Math.max(sz.x,sz.y,sz.z)||1):ref.h/(sz.y||1))*(en.scale||1);
      root.scale.multiplyScalar(k);b=box(wrap);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-b.min.y+(en.lift||0),-c.z);
      dress(root,wrap,en,k,u.team,u);
      const rig={g:wrap,gltf:true,legs:[],arms:[],tools:{},acts:{},cur:null};
      if(gl.animations&&gl.animations.length){rig.mixer=new THREE.AnimationMixer(root);const A=en.anim||{},cl=gl.animations;
        const map={idle:pickClip(cl,[A.idle],/idle|stand|rest/i),walk:pickClip(cl,[A.walk],/walk|run|move/i),attack:pickClip(cl,[A.attack],/attack|hit|strike|shoot|fire/i),work:pickClip(cl,[A.work],/work|gather|chop|mine|build|dig/i)};
        for(const n in map)if(map[n])rig.acts[n]=rig.mixer.clipAction(map[n]);
        const first=rig.acts.idle||rig.acts.walk;if(first){first.play();rig.cur=first===rig.acts.idle?'idle':'walk'}}
      return rig}catch(err){console.warn('glTF-Einheit',u.type,err);return null}}
  function makeBld(type,R_,ep,team,origMake){
    const en=entryFor('bld',type,ep);if(!en)return null;const gl=files.get(en.file);
    try{
      const root=EKGLTF.SkeletonUtils.clone(gl.scene),wrap=new THREE.Group();wrap.add(root);prepare(root,team);root.rotation.y=(en.yaw||0)*Math.PI/180;
      let b=box(wrap),sz=b.getSize(new THREE.Vector3());
      const k=(en.footprint?en.footprint/(Math.max(sz.x,sz.z)||1):(R_*2.5*(en.fit||1))/(Math.max(sz.x,sz.z)||1))*(en.scale||1);
      root.scale.multiplyScalar(k);b=box(wrap);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-b.min.y,-c.z);
      wrap.userData.h=b.max.y-b.min.y;wrap.userData.flags=[];wrap.userData.gltf=true;return wrap}catch(err){console.warn('glTF-Gebäude',type,err);return null}}
  /* Bäume, Felsen, Büsche als Instanzen: liefert die Einzelteile (Geometrie+Material) eines glTF-Modells, auf Höhe/Grundfläche des Code-Modells (refGeo) angepasst */
  function nodeParts(key,v,refGeo){
    const sec=manifest&&manifest.nodes,en0=sec&&sec[key];if(!en0)return null;const L=(Array.isArray(en0)?en0:[en0]).filter(x=>x&&x.file&&!x.off&&files.has(x.file));if(!L.length)return null;
    const en=L[v%L.length],gl=files.get(en.file),parts=[];gl.scene.updateMatrixWorld(true);
    const want=en.mesh&&en.mesh.replace(/\./g,'');gl.scene.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&(!want||o.name===want)){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);parts.push({g,m:o.material})}});if(!parts.length)return null;
    const bb=new THREE.Box3();for(const p of parts){p.g.computeBoundingBox();bb.union(p.g.boundingBox)}
    refGeo.computeBoundingBox();const rb=refGeo.boundingBox,rh=(rb.max.y-rb.min.y)||1,sz=bb.getSize(new THREE.Vector3()),k=(en.height?en.height/(sz.y||1):rh/(sz.y||1))*(en.scale||1),c=bb.getCenter(new THREE.Vector3());
    return parts.map(p=>{p.g.translate(-c.x,-bb.min.y,-c.z);p.g.scale(k,k,k);const m=p.m.clone();if(en.tint&&m.color)m.color.set(en.tint);if(m.isMeshStandardMaterial&&m.envMapIntensity>.5)m.envMapIntensity=.3;return{geo:p.g,mat:m}})}
  /* Meeresbewohner (Fischschwarm, Delfine, Wale): mehrere Fische aus der Liste, im Kreis, mit Schwimm-Animation */
  function makeSea(e,orig){
    const en=manifest&&manifest.sea&&manifest.sea[e.type];if(!en)return null;const L=(en.files||[]).filter(f=>files.has(f));if(!L.length)return null;
    const g=new THREE.Group(),mix=[],n=en.count||1;
    for(let i=0;i<n;i++){const gl=files.get(L[(e.id+i*3)%L.length]),root=EKGLTF.SkeletonUtils.clone(gl.scene),w=new THREE.Group();w.add(root);prepare(root,0);root.rotation.order='YXZ';root.rotation.y=(en.yaw||0)*Math.PI/180;root.rotation.x=(en.roll||0)*Math.PI/180;
      if(en.tint)root.traverse(o=>{if(o.isMesh){const f=m=>{const c=m.clone();c.color.set(en.tint);return c};o.material=Array.isArray(o.material)?o.material.map(f):f(o.material)}});
      let b=box(w),sz=b.getSize(new THREE.Vector3());const k=(en.size||1)*(.85+((e.id*7+i*13)%10)/33)/(Math.max(sz.x,sz.y,sz.z)||1);root.scale.multiplyScalar(k);b=box(w);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-c.y,-c.z);
      const a=i/n*6.283+e.id,r=n>1?(en.spread||1.1)*(.5+((i*37+e.id)%5)/8):0;w.position.set(Math.cos(a)*r,0,Math.sin(a)*r);w.rotation.y=a+1.57;w.userData.ph=i;
      const cl=gl.animations.find(c=>/swim.*(normal|idle)|swim/i.test(c.name))||gl.animations[0];if(cl){const m=new THREE.AnimationMixer(root);m.clipAction(cl).play();m.update(Math.random()*2);mix.push(m)}
      g.add(w)}
    g.userData.mix=mix;return g}
  /* Animationen pro Bild: passenden Clip wählen, weich überblenden */
  function animate(rig,want,dt,speedScale){
    if(!rig.mixer)return;if(want==='idle'&&!rig.acts.idle&&rig.cur){rig.acts[rig.cur].fadeOut(.2);rig.cur=null}if(want==='idle'&&!rig.acts.idle){rig.mixer.update(dt*(speedScale||1));return}const chain={attack:['attack','idle'],work:['work','idle'],walk:['walk','idle'],idle:['idle']},w=(chain[want]||['idle']).find(n=>rig.acts[n])||null;
    if(w&&rig.cur!==w){const a=rig.acts[w],p=rig.cur&&rig.acts[rig.cur];a.reset().fadeIn(.2).play();if(p)p.fadeOut(.2);rig.cur=w}
    rig.mixer.update(dt*(speedScale||1))}
  async function init(url){
    if(typeof EKGLTF==='undefined'){return}
    try{const r=await fetch(url||'models/manifest.json',{cache:'no-cache'});if(!r.ok)return;manifest=await r.json()}catch(_){return}
    loader=new EKGLTF.GLTFLoader();try{loader.setMeshoptDecoder(EKGLTF.MeshoptDecoder)}catch(_){}
    const want=new Set();for(const sn of Object.keys(manifest.sea||{}))for(const f of(manifest.sea[sn].files||[]))want.add(f);for(const s of['units','buildings','animals','nodes'])for(const en of Object.values(manifest[s]||{}))for(const x of Array.isArray(en)?en:[en])if(x&&x.file&&!x.off){want.add(x.file);if(x.hand&&x.hand.file)want.add(x.hand.file);if(x.left&&x.left.file)want.add(x.left.file)}
    await Promise.all([...want].map(async f=>{try{files.set(f,await loader.loadAsync('models/'+f))}catch(err){failed.push(f);console.warn('Modell nicht geladen:',f,err&&err.message)}}));
    R.ready=true;R.ver++;/* Einheiten/Gebäude/Tiere: Signaturen ändern sich über tag() von selbst; Bäume/Felsen: Instanzen neu aufbauen */try{if(typeof r3!=='undefined'&&r3.scene&&typeof G!=='undefined'&&G&&G.ents&&G.ents.length)r3NodesInit()}catch(_){}}
  /* für Tests/Vorschau: Modell von Hand eintragen */
  function register(kind,type,entry,gltf){if(!manifest)manifest={units:{},buildings:{}};const s=secOf(kind);(manifest[s]||(manifest[s]={}))[type]=entry;files.set(entry.file,gltf);R.ver++}
  return Object.assign(R,{init,tag,has,makeUnit,makeBld,makeSea,nodeParts,animate,register,files,failed,refSize,dbg:()=>({refCache})})
})();
/* Modelle in die Bau-Funktionen einhängen (Rückfall auf die Code-Modelle, wenn nichts passt) */
(()=>{const origU=buildUnit,origB=buildBld;window.origBuildUnit=origU;
  buildUnit=function(u){const r=EKMODELS.makeUnit(u,origU);if(r){M3.curId=u.id;return r}return origU(u)};
  const origA=buildAnimal;buildAnimal=function(e){const r=EKMODELS.makeUnit(e,origA,'animal');return r||origA(e)};
  buildBld=function(type,R,ep,team){const g=EKMODELS.makeBld(type,R,ep,team,origB);return g||origB(type,R,ep,team)};
})();
