/* Spielzimmer: die Karte liegt als Spielbrett auf einem echten Schreibtisch in einer Werkstatt (Vorbild „Toy Soldiers“).
   Echte Modelle aus models/raum (Poly Haven, CC0), Rundum-Foto der Werkstatt als unscharfer Hintergrund.
   Hauptmenü: Kamera kreist im Raum um den Tisch; „Spiel starten“: Flug vom Raum aufs Brett. Abschaltbar: OPT.room=false. */
const ROOM={BGS:{werkstatt:'artist_workshop.jpg',studio:'ferndale_studio.jpg'},on:false,ready:false,g:null,K:520,DESK:-6,mode:'game',t:0,fly:null,ang:0};
(()=>{
  const B='models/raum/',K=ROOM.K;
  /* Platzierung in Welt-Einheiten (Karte = x 0..480, z 0..320; vorn = grosses z, unten im Bild). on:'desk'|'floor', s = Zusatz-Massstab */
  /* aufgeräumt: auf dem Tisch nur Lampe, Schach, Bücher, Öllampe, Tee, Stifte; der Rest steht geordnet an der Rückwand bzw. auf dem Teewagen */
  const DESK_PROPS=[ /* Tisch: x -250..730, z -160..480; Brett 0..480 × 0..320 → nur die Ränder sind frei */
    {f:'desk_lamp_arm_01',x:-150,z:-60,ry:-.75},
    {f:'book_encyclopedia_set_01',x:-150,z:170,ry:1.57,s:.6},
    {f:'chess_set',x:615,z:60,ry:0,s:.6},
    {f:'vintage_oil_lamp',x:-160,z:400,ry:0},
    {f:'tea_set_01',x:620,z:400,ry:.3,s:.7,only:/cup|saucer|plate/i,one:1},
    {f:'stationery_supplies',x:260,z:410,ry:0}];
  /* Möbel am Boden: nur der Stuhl – den Raum selbst liefert das Foto (Boden = auf den Boden projiziertes Foto) */
  const FLOOR_PROPS=[{f:'plastic_monobloc_chair_01',x:240,z:720,ry:3.14}];
  const load=(L,f)=>new Promise(r=>L.load(B+f+'/'+f+'_1k.gltf',g=>r(g.scene),undefined,e=>{console.warn('Raum-Modell',f,e&&e.message);r(null)}));
  const box=o=>new THREE.Box3().setFromObject(o);
  function prep(o){o.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=true;m.userData.noShadow=true;if(m.material){m.material.fog=true}}})}
  /* nur Tasse + Untertasse behalten (Teeservice hat Kanne, Zuckerdose, mehrere Tassen) */
  function keep(o,p){const hit=[];o.traverse(m=>{if(m.isMesh)hit.push(m)});const names=hit.map(m=>m.name);console.log('Teeservice-Teile',names.join(','));
    const want=new Set();for(const re of[/cup/i,/saucer|plate/i]){const m=hit.find(x=>re.test(x.name)||re.test(x.parent&&x.parent.name||''));if(m)want.add(m)}
    if(want.size)hit.forEach(m=>{if(!want.has(m))m.visible=false})}
  /* Foto-Raum: Kugel, deren untere Hälfte auf eine Bodenebene gedrückt ist (wie three.js GroundedSkybox) → Tisch steht auf dem Fotoboden */
  function groundSky(tex,height,radius){const g=new THREE.SphereGeometry(radius,96,48);g.scale(1,1,-1);const pos=g.attributes.position,v=new THREE.Vector3(),y1=-height*1.5;
    for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i);if(v.y<0){const f=v.y<y1?-height/v.y:1-v.y*v.y/(3*y1*y1);v.multiplyScalar(f);v.toArray(pos.array,3*i)}}pos.needsUpdate=true;
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,depthWrite:false,fog:false}));m.renderOrder=-1;return m}
  ROOM.init=async function(){
    if(ROOM.g||typeof EKGLTF==='undefined'||!R3.ok)return;if(typeof OPT!=='undefined'&&OPT.room===false)return;
    const L=new EKGLTF.GLTFLoader(),g=new THREE.Group();g.name='room';ROOM.g=g;g.visible=false;r3.scene.add(g);
    /* Schreibtisch: Platte so gross, dass das Brett (480×320) mit Rand Platz hat */
    const desk=await load(L,'metal_office_desk');let deskTop=ROOM.DESK,floor=ROOM.DESK-.75*K;
    if(desk){prep(desk);desk.updateMatrixWorld(true);let b=box(desk),sz=b.getSize(new THREE.Vector3());
      desk.scale.set(980/sz.x,(.75*K)/sz.y,640/sz.z);desk.updateMatrixWorld(true);b=box(desk);
      desk.position.set(240-(b.min.x+b.max.x)/2,deskTop-b.max.y,160-(b.min.z+b.max.z)/2);g.add(desk);floor=deskTop-(b.max.y-b.min.y)}
    ROOM.floor=floor;
    const place=async(p,y0)=>{const o=await load(L,p.f);if(!o)return;if(p.only)keep(o,p);prep(o);o.scale.setScalar(K*(p.s||1));o.rotation.y=p.ry||0;o.updateMatrixWorld(true);const b=box(o);
      o.position.set(p.x,p.ceil?floor+2.7*K-b.max.y:y0-b.min.y,p.z);g.add(o);
      if(p.top){o.updateMatrixWorld(true);const tb=box(o);await Promise.all(p.top.map(q=>place({f:q.f,x:p.x+q.dx,z:p.z,ry:q.ry},tb.max.y)))}};
    await Promise.all(DESK_PROPS.map(p=>place(p,deskTop)).concat(FLOOR_PROPS.map(p=>place(p,floor))));
    /* Rundum-Foto der Werkstatt als Hintergrund (unscharf) */
    const bgf=ROOM.BGS[(typeof OPT!=='undefined'&&OPT.roomBg)||'werkstatt']||ROOM.BGS.werkstatt;
    new THREE.TextureLoader().load(B+bgf,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const H=1.6*K,sk=groundSky(t,H,7000);sk.position.set(240,floor+H,160);g.add(sk);ROOM.sky=sk;ROOM.bg=t;ROOM.apply()});
    /* Seiten des Bretts: dunkle Erde unter dem Kartenrand, damit die Karte wie eine Platte auf dem Tisch liegt */
    const sm=new THREE.MeshStandardMaterial({color:0x3b2a1c,roughness:.95}),W3=W/R3.S,H3=H/R3.S,T=Math.abs(ROOM.DESK)+1;
    for(const[w,x,z,ry]of[[W3,W3/2,0,0],[W3,W3/2,H3,Math.PI],[H3,0,H3/2,Math.PI/2],[H3,W3,H3/2,-Math.PI/2]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,T+3),sm);m.position.set(x,ROOM.DESK+(T+3)/2-.5,z);m.rotation.y=ry;m.material.side=THREE.DoubleSide;g.add(m)}
    /* Boden (dunkles Holz) unter den Möbeln, damit nichts im Foto schwebt; Lampenlicht nur im Menü/Anflug */
    const sp=new THREE.SpotLight(0xffc68a,2.2,0,.75,.7,0);sp.position.set(-120,ROOM.DESK+620,-60);sp.target.position.set(260,ROOM.DESK,170);g.add(sp,sp.target);ROOM.spot=sp;
    ROOM.ready=true;ROOM.apply()};
  /* an/aus: Hintergrund, Meer nur auf dem Brett, Sichtweite */
  ROOM.apply=function(){if(!R3.ok)return;const on=ROOM.ready&&!(typeof OPT!=='undefined'&&OPT.room===false);ROOM.on=on;if(ROOM.g)ROOM.g.visible=on;
    const sc=r3.scene;if(on&&ROOM.bg){sc.background=new THREE.Color(0x2a241e);sc.fog.color.set(0x8f877a)}
    if(r3.sea){if(on){r3.sea.scale.set(W/R3.S/3600,1,H/R3.S/3600)}else r3.sea.scale.set(1,1,1)}
    r3.camera.far=on?16000:1400;r3.camera.updateProjectionMatrix()};
  /* Raum-Kamera: Blick von schräg oben auf Tisch und Brett, kreist langsam (Hauptmenü) */
  function roomPose(a){const c=new THREE.Vector3(240,ROOM.DESK,160),r=1150;return{p:new THREE.Vector3(c.x+Math.sin(a)*r,c.y+560,c.z+Math.cos(a)*r),t:c}}
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  const oCam=camUpdate;
  camUpdate=function(){oCam();if(!ROOM.on||!R3.ok)return;const cmr=r3.camera,fg=r3.scene.fog;
    const menu=document.body.classList.contains('mm');
    if(ROOM.spot)ROOM.spot.visible=menu||!!ROOM.fly;
    {const kk=.9/(typeof playF!=='undefined'?playF:.9),gg=ROOM.g;gg.scale.setScalar(gg.scale.x+(kk-gg.scale.x)*.08);gg.position.set(240*(1-gg.scale.x),ROOM.DESK*(1-gg.scale.x),160*(1-gg.scale.x))}
    if(menu){ROOM.ang+=.0012;cmr.fov=50;cmr.updateProjectionMatrix();const P=roomPose(ROOM.ang);cmr.position.copy(P.p);cmr.lookAt(P.t);cmr.updateMatrixWorld();fg.near=1400;fg.far=6000;ROOM.fly={a:ROOM.ang,t0:-1};return}
    if(ROOM.fly){const f=ROOM.fly;const now=performance.now();if(f.t0<0){f.t0=now;f.k=0}f.k+=Math.min(.05,(now-f.t0)/1000)/2.6;f.t0=now;const k=Math.min(1,f.k),e=ease(k);
      const P=roomPose(f.a),gp=cmr.position.clone(),gt=new THREE.Vector3(cam.x/R3.S,hAt(cam.x,cam.y),cam.y/R3.S);
      cmr.position.lerpVectors(P.p,gp,e);cmr.fov=50+(R3.FOV-50)*e;cmr.updateProjectionMatrix();cmr.lookAt(P.t.clone().lerp(gt,e));cmr.updateMatrixWorld();fg.near=1400+(fg.near-1400)*e;fg.far=6000+(fg.far-6000)*e;if(k>=1)ROOM.fly=null}};
})();
ROOM.wide=()=>ROOM.on&&(!!ROOM.fly||document.body.classList.contains('mm'));
/* Start, sobald 3D und Modell-Lader bereit sind */
(function wait(){if(typeof R3!=='undefined'&&R3.ok&&typeof EKGLTF!=='undefined'&&typeof W!=='undefined'&&!window.__norender){ROOM.init()}else setTimeout(wait,300)})();
