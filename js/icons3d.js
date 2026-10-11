/* Epochenkrieg – Symbole als kleine 3D-Bilder: Ressourcen-Symbole und Vorschaubilder für Einheiten/Gebäude in der Befehlsleiste.
   Ein eigener kleiner Renderer malt das Modell einmal in ein Bild (PNG), danach kommt es aus dem Zwischenspeicher. */
const ICON3=(()=>{
  let rd=null,scene=null,cam=null;const cache=new Map();
  function init(){
    if(rd||typeof THREE==='undefined')return !!rd;
    try{rd=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});rd.setSize(128,128);rd.setPixelRatio(1);rd.setClearColor(0x000000,0);
      scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x6a5a40,1.9));const d=new THREE.DirectionalLight(0xfff2d8,2.4);d.position.set(3,6,4);scene.add(d);
      cam=new THREE.PerspectiveCamera(28,1,.1,200)}catch(e){rd=null;return false}
    return true}
  function shot(g,dir,focus){
    scene.add(g);g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());let R=Math.max(sz.x,sz.y,sz.z)*.62+.01;
    if(focus){c.y=bb.max.y-sz.y*focus*.5;R=sz.y*focus*.62+.01}
    const dist=R/Math.tan(cam.fov*Math.PI/360);const v=(dir||new THREE.Vector3(1,.85,1.25)).clone().normalize();cam.position.copy(c).addScaledVector(v,dist);cam.lookAt(c);cam.updateProjectionMatrix();
    rd.render(scene,cam);const url=rd.domElement.toDataURL('image/png');scene.remove(g);
    g.traverse(o=>{if(o.geometry)o.geometry.dispose&&0});return url}
  const mat=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
  const M=(g,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o};
  const RES={
    food(){const g=new THREE.Group(),red=mat(0xd0303c,.35),lf=mat(0x4c9a3a,.7);for(const[x,y,z,s]of[[-.3,0,.1,.34],[.28,0,.05,.34],[0,.3,-.2,.32],[0,0,.38,.3]])M(g,new THREE.SphereGeometry(s,16,12),red,x,y+s,z);
      const l=M(g,new THREE.SphereGeometry(.3,10,6),lf,.05,.95,-.1);l.scale.set(1.3,.18,.7);l.rotation.z=.4;M(g,new THREE.CylinderGeometry(.02,.02,.3,5),mat(0x5a3a1a),0,.78,-.1);return g},
    wood(){const g=new THREE.Group(),bark=mat(0x7a4f2a,.9),end=mat(0xd9b277,.8);for(const[x,y]of[[-.32,.3],[.32,.3],[0,.78]]){const c=new THREE.Group();c.position.set(x,y,0);g.add(c);const l=M(c,new THREE.CylinderGeometry(.3,.3,1.3,16),bark);l.rotation.z=Math.PI/2;for(const s of[-1,1]){const e=M(c,new THREE.CylinderGeometry(.27,.27,.02,16),end,s*.66,0,0);e.rotation.z=Math.PI/2}}return g},
    stone(){const g=new THREE.Group(),m=mat(0x8f8c86,.95);for(const[x,y,z,s]of[[0,.35,0,.5],[.5,.2,.2,.32],[-.45,.18,.25,.3]]){const o=M(g,new THREE.DodecahedronGeometry(s,0),m,x,y,z);o.rotation.set(x,y,z)}return g},
    iron(){const g=new THREE.Group(),m=mat(0x8d9bb0,.3,.85);const bar=(x,y,z,r)=>{const o=M(g,new THREE.BoxGeometry(1,.34,.46),m,x,y,z);o.rotation.y=r;return o};bar(0,.17,.28,.05);bar(.1,.17,-.28,-.08);bar(.05,.51,0,.25);return g},
    gold(){const g=new THREE.Group(),m=mat(0xf0c030,.28,.95);const bar=(x,y,z,r)=>{const o=M(g,new THREE.BoxGeometry(1,.3,.5),m,x,y,z);o.rotation.y=r};bar(-.05,.15,.3,.1);bar(.05,.15,-.3,-.05);bar(0,.45,0,.2);const c=M(g,new THREE.CylinderGeometry(.34,.34,.07,20),m,.7,.04,.55);c.rotation.z=.2;return g},
    oil(){const g=new THREE.Group(),m=mat(0x1b1a1a,.4,.5),b=mat(0x6a6a66,.4,.8);M(g,new THREE.CylinderGeometry(.55,.55,1.2,20),m,0,.6,0);for(const y of[.2,.6,1.0])M(g,new THREE.CylinderGeometry(.57,.57,.08,20),b,0,y,0);M(g,new THREE.CircleGeometry(.4,16),mat(0x3a3a3a,.3,.6),0,1.21,0).rotation.x=-Math.PI/2;return g},
    pop(){const g=new THREE.Group();M(g,new THREE.SphereGeometry(.38,18,14),mat(0xe0b48a,.6),0,1.0,0);M(g,new THREE.SphereGeometry(.4,18,10,0,6.283,0,1.3),mat(0x4a3220,.8),0,1.05,-.04);const b=M(g,new THREE.CylinderGeometry(.34,.6,.9,16),mat(0x4f82c8,.7),0,.35,0);b.scale.z=.7;return g}
  };
  const resImg={};
  function res(n){if(resImg[n]!==undefined)return resImg[n];if(!init())return null;
    try{const m=(typeof EKMODELS!=='undefined'&&EKMODELS.iconModel)?EKMODELS.iconModel(n):null;if(m)return resImg[n]=shot(m,new THREE.Vector3(.9,.9,1.25),m.userData.focus)}catch(e){}
    if(!RES[n])return null;try{return resImg[n]=shot(RES[n]())}catch(e){return resImg[n]=null}}
  /* Einheit oder Gebäude: Vorschaubild (Epoche beeinflusst das Aussehen) */
  function thing(kind,type,epArg){
    const ep=epArg!==undefined?epArg:(typeof G!=='undefined'&&G)?G.epoch[0]:0,key=kind+type+':'+ep+':'+(G&&G.nation?G.nation[0]:'');if(cache.has(key))return cache.get(key);
    if(!init())return null;let url=null;
    try{let g;if(kind==='unit'){const u={id:7,type,team:0,lvl:ep,state:'idle',r:UNITS[type].r,x:0,y:0,hp:100,maxHp:100,carry:0};const rig=buildUnit(u);g=new THREE.Group();g.add(rig.g);
        if(rig.props){rig.g.scale.setScalar(1)}}
      else{const d=BLDS[type];g=buildBld(type,d.r/10*1.05,ep,0)}
      url=shot(g,kind==='unit'?new THREE.Vector3(.8,.5,1.3):new THREE.Vector3(1,.95,1.25))}catch(e){url=null}
    cache.set(key,url);return url}
  return{res,thing,init,clear:()=>{cache.clear();for(const k in resImg)delete resImg[k]}}
})();
