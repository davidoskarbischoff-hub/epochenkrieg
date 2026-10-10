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
    if(e.kind==='bld'){const en=entryFor('bld',e.type,G.epoch[e.team]);return en?'|g:'+en.file:''}return''}
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
  function pickClip(clips,names,re){for(const n of names||[]){const c=clips.find(c=>c.name===n);if(c)return c}return clips.find(c=>re.test(c.name))}
  function makeUnit(u,origMake){
    const en=entryFor('unit',u.type,u.lvl||0);if(!en)return null;const gl=files.get(en.file);
    try{
      const root=EKGLTF.SkeletonUtils.clone(gl.scene),wrap=new THREE.Group();wrap.add(root);prepare(root,u.team);
      root.rotation.y=((en.yaw===undefined?90:90+en.yaw))*Math.PI/180;
      let b=box(wrap),sz=b.getSize(new THREE.Vector3());const ref=refSize('unit',u.type,()=>origMake(u).g);
      const k=(en.height?en.height/(sz.y||1):en.fit==='length'?ref.m/(Math.max(sz.x,sz.y,sz.z)||1):ref.h/(sz.y||1))*(en.scale||1);
      root.scale.multiplyScalar(k);b=box(wrap);const c=b.getCenter(new THREE.Vector3());root.position.set(-c.x,-b.min.y+(en.lift||0),-c.z);
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
  /* Animationen pro Bild: passenden Clip wählen, weich überblenden */
  function animate(rig,want,dt,speedScale){
    if(!rig.mixer)return;const chain={attack:['attack','idle'],work:['work','idle'],walk:['walk','idle'],idle:['idle']},w=(chain[want]||['idle']).find(n=>rig.acts[n])||null;
    if(w&&rig.cur!==w){const a=rig.acts[w],p=rig.cur&&rig.acts[rig.cur];a.reset().fadeIn(.2).play();if(p)p.fadeOut(.2);rig.cur=w}
    rig.mixer.update(dt*(speedScale||1))}
  async function init(url){
    if(typeof EKGLTF==='undefined'){return}
    try{const r=await fetch(url||'models/manifest.json',{cache:'no-cache'});if(!r.ok)return;manifest=await r.json()}catch(_){return}
    loader=new EKGLTF.GLTFLoader();try{loader.setMeshoptDecoder(EKGLTF.MeshoptDecoder)}catch(_){}
    const want=new Set();for(const s of['units','buildings','animals','nodes'])for(const en of Object.values(manifest[s]||{}))for(const x of Array.isArray(en)?en:[en])if(x&&x.file&&!x.off)want.add(x.file);
    await Promise.all([...want].map(async f=>{try{files.set(f,await loader.loadAsync('models/'+f))}catch(err){failed.push(f);console.warn('Modell nicht geladen:',f,err&&err.message)}}));
    R.ready=true;R.ver++;if(typeof R3!=='undefined'&&R3.reg){/* Anzeige neu aufbauen: Signaturen ändern sich über tag() von selbst */}}
  /* für Tests/Vorschau: Modell von Hand eintragen */
  function register(kind,type,entry,gltf){if(!manifest)manifest={units:{},buildings:{}};const s=secOf(kind);(manifest[s]||(manifest[s]={}))[type]=entry;files.set(entry.file,gltf);R.ver++}
  return Object.assign(R,{init,tag,has,makeUnit,makeBld,animate,register,files,failed})
})();
/* Modelle in die Bau-Funktionen einhängen (Rückfall auf die Code-Modelle, wenn nichts passt) */
(()=>{const origU=buildUnit,origB=buildBld;
  buildUnit=function(u){const r=EKMODELS.makeUnit(u,origU);if(r){M3.curId=u.id;return r}return origU(u)};
  buildBld=function(type,R,ep,team){const g=EKMODELS.makeBld(type,R,ep,team,origB);return g||origB(type,R,ep,team)};
})();
