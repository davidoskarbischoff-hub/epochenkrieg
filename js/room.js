/* Spielzimmer: die Karte liegt als Spielbrett auf einem echten Schreibtisch in einer Werkstatt (Vorbild „Toy Soldiers“).
   Echte Modelle aus models/raum (Poly Haven, CC0), Rundum-Foto der Werkstatt als unscharfer Hintergrund.
   Hauptmenü: Kamera kreist im Raum um den Tisch; „Spiel starten“: Flug vom Raum aufs Brett. Abschaltbar: OPT.room=false. */
const ROOM={BGS:{werkstatt:'artist_workshop.jpg',studio:'ferndale_studio.jpg'},on:false,ready:false,g:null,K:520,DESK:-6,mode:'game',t:0,fly:null,ang:0};
(()=>{
  const B='models/raum/',K=ROOM.K;
  /* Platzierung in Welt-Einheiten (Karte = x 0..480, z 0..320; vorn = grosses z, unten im Bild). on:'desk'|'floor', s = Zusatz-Massstab */
  /* aufgeräumt: auf dem Tisch nur Lampe, Schach, Bücher, Öllampe, Tee, Stifte; der Rest steht geordnet an der Rückwand bzw. auf dem Teewagen */
  const DESK_PROPS=[ /* Tisch: x -250..730, z -160..480; Brett 0..480 × 0..320 → nur die Ränder sind frei */
    {f:'desk_lamp_arm_01',x:-150,z:-60,ry:.6},
    {f:'book_encyclopedia_set_01',x:-150,z:170,ry:1.57,s:.6},
    {f:'chess_set',x:615,z:60,ry:0,s:.6},
    {f:'vintage_oil_lamp',x:-160,z:400,ry:0},
    {f:'tea_set_01',x:610,z:380,ry:.3,s:.7},
    {f:'stationery_supplies',x:260,z:410,ry:0}];
  const FLOOR_PROPS=[
    /* Rückwand (hinten = kleines z), in einer Reihe */
    {f:'metal_tool_chest',x:-600,z:-1900,ry:0},
    {f:'CoffeeCart_01',x:240,z:-1900,ry:0},
    {f:'wooden_ladder',x:950,z:-1950,ry:0},
    {f:'industrial_pipe_lamp',x:1500,z:-1850,ry:0},
    /* Sitzecke seitlich, zum Tisch gedreht */
    {f:'sofa_02',x:-1950,z:250,ry:1.57},
    {f:'mid_century_lounge_chair',x:2000,z:300,ry:-1.57},
    {f:'plastic_monobloc_chair_01',x:240,z:720,ry:3.14},
    {f:'Chandelier_01',x:240,z:160,ry:0,ceil:1}];
  const load=(L,f)=>new Promise(r=>L.load(B+f+'/'+f+'_1k.gltf',g=>r(g.scene),undefined,e=>{console.warn('Raum-Modell',f,e&&e.message);r(null)}));
  const box=o=>new THREE.Box3().setFromObject(o);
  function prep(o){o.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=true;m.userData.noShadow=true;if(m.material){m.material.fog=true}}})}
  ROOM.init=async function(){
    if(ROOM.g||typeof EKGLTF==='undefined'||!R3.ok)return;if(typeof OPT!=='undefined'&&OPT.room===false)return;
    const L=new EKGLTF.GLTFLoader(),g=new THREE.Group();g.name='room';ROOM.g=g;g.visible=false;r3.scene.add(g);
    /* Schreibtisch: Platte so gross, dass das Brett (480×320) mit Rand Platz hat */
    const desk=await load(L,'metal_office_desk');let deskTop=ROOM.DESK,floor=ROOM.DESK-.75*K;
    if(desk){prep(desk);desk.updateMatrixWorld(true);let b=box(desk),sz=b.getSize(new THREE.Vector3());
      desk.scale.set(980/sz.x,(.75*K)/sz.y,640/sz.z);desk.updateMatrixWorld(true);b=box(desk);
      desk.position.set(240-(b.min.x+b.max.x)/2,deskTop-b.max.y,160-(b.min.z+b.max.z)/2);g.add(desk);floor=deskTop-(b.max.y-b.min.y)}
    ROOM.floor=floor;
    const place=async(p,y0)=>{const o=await load(L,p.f);if(!o)return;prep(o);o.scale.setScalar(K*(p.s||1));o.rotation.y=p.ry||0;o.updateMatrixWorld(true);const b=box(o);
      o.position.set(p.x,p.ceil?floor+2.7*K-b.max.y:y0-b.min.y,p.z);g.add(o);
      if(p.top){o.updateMatrixWorld(true);const tb=box(o);await Promise.all(p.top.map(q=>place({f:q.f,x:p.x+q.dx,z:p.z,ry:q.ry},tb.max.y)))}};
    await Promise.all(DESK_PROPS.map(p=>place(p,deskTop)).concat(FLOOR_PROPS.map(p=>place(p,floor))));
    /* Rundum-Foto der Werkstatt als Hintergrund (unscharf) */
    const bgf=ROOM.BGS[(typeof OPT!=='undefined'&&OPT.roomBg)||'werkstatt']||ROOM.BGS.werkstatt;
    new THREE.TextureLoader().load(B+bgf,t=>{t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;ROOM.bg=t;ROOM.apply()});
    /* Seiten des Bretts: dunkle Erde unter dem Kartenrand, damit die Karte wie eine Platte auf dem Tisch liegt */
    const sm=new THREE.MeshStandardMaterial({color:0x3b2a1c,roughness:.95}),W3=W/R3.S,H3=H/R3.S,T=Math.abs(ROOM.DESK)+1;
    for(const[w,x,z,ry]of[[W3,W3/2,0,0],[W3,W3/2,H3,Math.PI],[H3,0,H3/2,Math.PI/2],[H3,W3,H3/2,-Math.PI/2]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,T+3),sm);m.position.set(x,ROOM.DESK+(T+3)/2-.5,z);m.rotation.y=ry;m.material.side=THREE.DoubleSide;g.add(m)}
    /* Boden (dunkles Holz) unter den Möbeln, damit nichts im Foto schwebt; Lampenlicht nur im Menü/Anflug */
    const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(128,128,40,128,128,128);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#000');cx.fillStyle=gr;cx.fillRect(0,0,256,256);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(4200,64).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2e241c,roughness:.55,metalness:0,transparent:true,alphaMap:new THREE.CanvasTexture(cv),depthWrite:false}));fl.position.y=floor+.5;fl.receiveShadow=true;g.add(fl);
    const sp=new THREE.SpotLight(0xffc68a,2.2,0,.75,.7,0);sp.position.set(-120,ROOM.DESK+620,-60);sp.target.position.set(260,ROOM.DESK,170);g.add(sp,sp.target);ROOM.spot=sp;
    ROOM.ready=true;ROOM.apply()};
  /* an/aus: Hintergrund, Meer nur auf dem Brett, Sichtweite */
  ROOM.apply=function(){if(!R3.ok)return;const on=ROOM.ready&&!(typeof OPT!=='undefined'&&OPT.room===false);ROOM.on=on;if(ROOM.g)ROOM.g.visible=on;
    const sc=r3.scene;if(on&&ROOM.bg){sc.background=ROOM.bg;sc.backgroundBlurriness=.025;sc.backgroundIntensity=.6;sc.fog.color.set(0x8f877a)}
    if(r3.sea){if(on){r3.sea.scale.set(W/R3.S/3600,1,H/R3.S/3600)}else r3.sea.scale.set(1,1,1)}
    r3.camera.far=on?9000:1400;r3.camera.updateProjectionMatrix()};
  /* Raum-Kamera: Blick von schräg oben auf Tisch und Brett, kreist langsam (Hauptmenü) */
  function roomPose(a){const c=new THREE.Vector3(240,ROOM.DESK,160),r=1150;return{p:new THREE.Vector3(c.x+Math.sin(a)*r,c.y+560,c.z+Math.cos(a)*r),t:c}}
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  const oCam=camUpdate;
  camUpdate=function(){oCam();if(!ROOM.on||!R3.ok)return;const cmr=r3.camera,fg=r3.scene.fog;
    const menu=document.body.classList.contains('mm');
    if(ROOM.spot)ROOM.spot.visible=menu||!!ROOM.fly;
    if(menu){ROOM.ang+=.0012;cmr.fov=50;cmr.updateProjectionMatrix();const P=roomPose(ROOM.ang);cmr.position.copy(P.p);cmr.lookAt(P.t);cmr.updateMatrixWorld();fg.near=1400;fg.far=6000;ROOM.fly={a:ROOM.ang,t0:-1};return}
    if(ROOM.fly){const f=ROOM.fly;const now=performance.now();if(f.t0<0){f.t0=now;f.k=0}f.k+=Math.min(.05,(now-f.t0)/1000)/2.6;f.t0=now;const k=Math.min(1,f.k),e=ease(k);
      const P=roomPose(f.a),gp=cmr.position.clone(),gt=new THREE.Vector3(cam.x/R3.S,hAt(cam.x,cam.y),cam.y/R3.S);
      cmr.position.lerpVectors(P.p,gp,e);cmr.fov=50+(R3.FOV-50)*e;cmr.updateProjectionMatrix();cmr.lookAt(P.t.clone().lerp(gt,e));cmr.updateMatrixWorld();fg.near=1400+(fg.near-1400)*e;fg.far=6000+(fg.far-6000)*e;if(k>=1)ROOM.fly=null}};
})();
ROOM.wide=()=>ROOM.on&&(!!ROOM.fly||document.body.classList.contains('mm'));
/* Start, sobald 3D und Modell-Lader bereit sind */
(function wait(){if(typeof R3!=='undefined'&&R3.ok&&typeof EKGLTF!=='undefined'&&typeof W!=='undefined'&&!window.__norender){ROOM.init()}else setTimeout(wait,300)})();
