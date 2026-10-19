/* Spielzimmer: die Karte liegt als Spielbrett auf einem echten Schreibtisch in einer Werkstatt (Vorbild „Toy Soldiers“).
   Echte Modelle aus models/raum (Poly Haven, CC0), Rundum-Foto der Werkstatt als unscharfer Hintergrund.
   Hauptmenü: Kamera kreist im Raum um den Tisch; „Spiel starten“: Flug vom Raum aufs Brett. Abschaltbar: OPT.room=false. */
const ROOM={BGS:{werkstatt:'artist_workshop.jpg',studio:'ferndale_studio.jpg'},on:false,ready:false,g:null,K:520,DESK:-6,mode:'game',t:0,fly:null,ang:0};
(()=>{
  const B='models/raum/',K=ROOM.K;
  /* Platzierung in Welt-Einheiten (Karte = x 0..480, z 0..320; vorn = grosses z, unten im Bild). on:'desk'|'floor', s = Zusatz-Massstab */
  /* aufgeräumt: auf dem Tisch nur Lampe, Schach, Bücher, Öllampe, Tee, Stifte; der Rest steht geordnet an der Rückwand bzw. auf dem Teewagen */
  /* Anordnung aus Sicht des Spielers auf dem Stuhl vorn (z gross, Blick nach hinten; rechts = +x). Tisch: x -250..730, z -160..480; Brett 0..480 × 0..320.
     Lampe links, Kopf zeigt aufs Brett (Lampenkopf liegt im Modell bei −z → ry = atan2(−dx,−dz)); Tasse hinten rechts; Bücher und Schach rechts; Öllampe hinten links; Stifte vorn. */
  /* Tisch (x -250..730, z -160..480, Platte y = -6). Links: Schwanenhals-Lampe (Klemme am Rand, Kopf über dem Brett) und Öllampe hinten; rechts hinten Bücherstapel und Tasse; rechts vorn Schach.
     Vorn und in der Mitte bleibt frei (dort liegen die Hände des Spielers). Stifte entfernt (schwebten). */
  const DESK_PROPS=[
    {f:'desk_lamp_arm_01',x:-150,z:150,ry:-1.6},
    {f:'vintage_oil_lamp',x:-170,z:-90,ry:0},
    {f:'tea_set_01',x:585,z:-60,ry:.3,s:.9,only:1},
    {f:'book_encyclopedia_set_01',x:640,z:150,ry:1.57,s:.6},
    {f:'chess_set',x:615,z:380,ry:0,s:.6}];
  /* Am Boden: Stuhl des Spielers vorn (zum Tisch gerückt), Sofa links hinten schräg zum Tisch (Sitzecke), Teppich unter Tisch und Stuhl */
  const FLOOR_PROPS=[{f:'plastic_monobloc_chair_01',x:240,z:700,ry:3.14},{f:'sofa_02',x:-900,z:-330,ry:1.2}];
  const load=(L,f)=>new Promise(r=>L.load(B+f+'/'+f+'_1k.gltf',g=>r(g.scene),undefined,e=>{console.warn('Raum-Modell',f,e&&e.message);r(null)}));
  const box=o=>new THREE.Box3().setFromObject(o);
  function prep(o){o.traverse(m=>{if(m.isMesh){if(/_glass$/i.test(m.name)&&m.material){const q=m.material;q.transparent=true;q.opacity=.16;q.depthWrite=false;q.metalness=0;q.roughness=.1;q.color.set(0xdfe8ee);if(q.map)q.map=null}m.castShadow=false;m.receiveShadow=true;m.userData.noShadow=true;if(m.material){m.material.fog=true}}})}
  /* nur Tasse + Untertasse behalten (Teeservice hat Kanne, Zuckerdose, mehrere Tassen) */
  function keep(o,p){const hit=[];o.traverse(m=>{if(m.isMesh)hit.push(m)});const cup=hit.find(m=>/_cup_small/i.test(m.name)),sau=hit.find(m=>/saucer/i.test(m.name));
    if(!cup||!sau)return;hit.forEach(m=>{if(m!==cup&&m!==sau)m.parent.remove(m)});if(cup.parent===sau.parent){cup.position.x=sau.position.x;cup.position.z=sau.position.z}}
  /* Foto-Raum ohne Verzerrung: Das Rundum-Foto liegt unverändert (wie durch ein Fenster fotografiert) auf einer Kugelkappe um den Tisch.
     Die Kappe endet dort, wo im Foto Wand und Boden zusammenstossen (Höhenwinkel E0); darunter liegt ein echter Boden (Parkett), der genau am Rand anschliesst. */
  const E0=14*Math.PI/180;
  function dome(tex,Rs){const th=Math.PI/2+E0,g=new THREE.SphereGeometry(Rs,128,56,0,Math.PI*2,0,th);g.scale(-1,1,1);
    const pos=g.attributes.position,col=new Float32Array(pos.count*3);
    for(let i=0;i<pos.count;i++){const el=Math.asin(pos.getY(i)/Rs),t=Math.min(1,Math.max(0,(el+E0)/.28)),k=.16+.84*(t*t*(3-2*t));col[3*i]=col[3*i+1]=col[3*i+2]=k} /* unten weich ins Dunkle (Fussleiste/Boden) */
    {const uv=g.attributes.uv;for(let i=0;i<pos.count;i++)uv.setY(i,1-Math.acos(Math.max(-1,Math.min(1,pos.getY(i)/Rs)))/Math.PI)} /* Kappe: v wie bei der vollen Kugel (sonst wird das Foto gestreckt) */
    g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,vertexColors:true,depthWrite:false,fog:false}));m.renderOrder=-1;m.frustumCulled=false;return m}
  /* Foto leicht weichzeichnen und verkleinern (Hintergrund soll nicht schärfer sein als das Spiel davor) */
  function softPhoto(img,w){const c=document.createElement('canvas');c.width=w;c.height=w/2;const x=c.getContext('2d');try{x.filter='blur(1.6px)'}catch(_){}x.drawImage(img,0,0,c.width,c.height);return c}
  /* Parkett: Dielen im Verband, nahtlos wiederholbar (Tafel = 800 Welt-Einheiten) */
  ROOM.TILE=800;
  function parquetTex(){const N=1024,rows=16,rh=N/rows,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');let r=11;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
    x.fillStyle='#3a2c20';x.fillRect(0,0,N,N);
    for(let j=0;j<rows;j++){let px=-rnd()*400;const y=j*rh;
      while(px<N){const L=260+rnd()*340,x0=px,x1=Math.min(N,px+L),w=x1-Math.max(0,x0);px+=L;if(w<=0)continue;const a=Math.max(0,x0);
        const l=27+rnd()*9,h=26+rnd()*8,s=10+rnd()*9;x.fillStyle='hsl('+h+','+s+'%,'+l+'%)';x.fillRect(a,y,w,rh);
        for(let i=0;i<9;i++){const gy=y+rnd()*rh;x.strokeStyle=rnd()<.5?'rgba(30,18,8,'+(.10+rnd()*.16)+')':'rgba(220,190,150,'+(.05+rnd()*.08)+')';x.lineWidth=.6+rnd()*1.2;x.beginPath();x.moveTo(a,gy);x.bezierCurveTo(a+w*.3,gy+(rnd()-.5)*4,a+w*.7,gy+(rnd()-.5)*4,a+w,gy+(rnd()-.5)*3);x.stroke()}
        x.fillStyle='rgba(15,8,3,.55)';x.fillRect(a,y,1.6,rh);x.fillRect(a,y,w,1.4);x.fillStyle='rgba(235,205,160,.10)';x.fillRect(a,y+rh-1.2,w,1.2)}}
    for(let i=0;i<60;i++){x.fillStyle='rgba(20,10,4,'+(.05+rnd()*.07)+')';x.beginPath();x.ellipse(rnd()*N,rnd()*N,4+rnd()*14,2+rnd()*5,rnd()*3,0,6.283);x.fill()}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
  /* weicher Schattenfleck (Kontakt zum Boden bzw. zur Tischplatte), Grösse aus der Boxgrösse des Gegenstands */
  let blobTex=null;
  function blob(w,d,y,op){if(!blobTex){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),gr=x.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(.55,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);blobTex=new THREE.CanvasTexture(c)}
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,opacity:op,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.rotation.x=-Math.PI/2;m.position.y=y;m.renderOrder=1;return m}
  ROOM.init=async function(){
    if(ROOM.g||typeof EKGLTF==='undefined'||!R3.ok)return;if(typeof OPT!=='undefined'&&OPT.room===false)return;
    const L=new EKGLTF.GLTFLoader(),g=new THREE.Group();g.name='room';ROOM.g=g;g.visible=false;r3.scene.add(g);
    /* Schreibtisch: Platte so gross, dass das Brett (480×320) mit Rand Platz hat */
    const desk=await load(L,'metal_office_desk');let deskTop=ROOM.DESK,floor=ROOM.DESK-.75*K;
    if(desk){desk.name='desk';prep(desk);ROOM.deskMats=[];desk.traverse(m=>{if(m.isMesh&&m.material&&!ROOM.deskMats.includes(m.material))ROOM.deskMats.push(m.material)});desk.updateMatrixWorld(true);let b=box(desk),sz=b.getSize(new THREE.Vector3());
      desk.scale.set(980/sz.x,(.75*K)/sz.y,640/sz.z);desk.updateMatrixWorld(true);b=box(desk);
      desk.position.set(240-(b.min.x+b.max.x)/2,deskTop-b.max.y,160-(b.min.z+b.max.z)/2);g.add(desk);floor=deskTop-(b.max.y-b.min.y)}
    ROOM.floor=floor;
    /* Teppich unter Tisch und Stuhl (nur Muster aus Farben, kein Modell) + weicher Kontaktschatten des Tisches */
    {const W2=1280,D2=1320,c=document.createElement('canvas');c.width=512;c.height=528;const x=c.getContext('2d'),w=512,h=528;
      x.fillStyle='#5a2a24';x.fillRect(0,0,w,h);
      const fr=(m,col,t)=>{x.strokeStyle=col;x.lineWidth=t;x.strokeRect(m,m,w-2*m,h-2*m)};fr(14,'#d8c9a0',5);fr(30,'#22304a',22);fr(52,'#d8c9a0',3);fr(60,'#8c3b2c',6);
      x.save();x.translate(w/2,h/2);x.fillStyle='#22304a';x.beginPath();x.moveTo(0,-170);x.lineTo(120,0);x.lineTo(0,170);x.lineTo(-120,0);x.closePath();x.fill();
      x.strokeStyle='#d8c9a0';x.lineWidth=3;x.stroke();x.fillStyle='#8c3b2c';x.beginPath();x.moveTo(0,-100);x.lineTo(70,0);x.lineTo(0,100);x.lineTo(-70,0);x.closePath();x.fill();x.fillStyle='#d8c9a0';x.beginPath();x.arc(0,0,16,0,6.283);x.fill();x.restore();
      let r=5;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;for(let i=0;i<3500;i++){x.fillStyle=rnd()<.5?'rgba(0,0,0,.07)':'rgba(255,230,200,.05)';x.fillRect(rnd()*w,rnd()*h,1.5,1.5+rnd()*2)}
      x.fillStyle='#cdbf98';for(let i=0;i<w;i+=5){x.fillRect(i,0,2,6);x.fillRect(i,h-6,2,6)}
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(W2,D2),new THREE.MeshStandardMaterial({map:t,roughness:.95,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
      m.rotation.x=-Math.PI/2;m.position.set(240,floor+.5,380);m.name='rug';m.receiveShadow=true;m.userData.noShadow=true;g.add(m);
      const bl=blob(1180,820,floor+1,.55);bl.position.set(240,floor+1,160);g.add(bl)}
    const place=async(p,y0)=>{const o=await load(L,p.f);if(!o)return;o.name=p.f;if(p.only)keep(o,p);prep(o);o.scale.setScalar(K*(p.s||1));o.rotation.y=p.ry||0;o.updateMatrixWorld(true);const b=box(o);
      o.position.set(p.x-(p.only?(b.min.x+b.max.x)/2:0),p.ceil?floor+2.7*K-b.max.y:y0-b.min.y,p.z-(p.only?(b.min.z+b.max.z)/2:0));g.add(o);{const bb=box(o),w=bb.max.x-bb.min.x,d=bb.max.z-bb.min.z;if(!p.only||true){const bl=blob(w*1.35,d*1.35,y0+.2,y0===floor?.5:.4);bl.position.x=(bb.min.x+bb.max.x)/2;bl.position.z=(bb.min.z+bb.max.z)/2;g.add(bl)}}
      if(p.top){o.updateMatrixWorld(true);const tb=box(o);await Promise.all(p.top.map(q=>place({f:q.f,x:p.x+q.dx,z:p.z,ry:q.ry},tb.max.y)))}};
    await Promise.all(DESK_PROPS.map(p=>place(p,deskTop)).concat(FLOOR_PROPS.map(p=>place(p,floor))));
    /* Spielbrett: Holzrahmen rund um die Karte (steht direkt am Kartenrand, wird NICHT mit dem Raum skaliert) + weicher Schatten auf dem Tisch */
    ROOM.makeBoard();
    /* Boden (dunkles Holz) unter den Möbeln, damit nichts im Foto schwebt; Lampenlicht nur im Menü/Anflug */
    const sp=new THREE.SpotLight(0xffc68a,2.2,0,.75,.7,0);sp.position.set(-120,ROOM.DESK+620,-60);sp.target.position.set(260,ROOM.DESK,170);g.add(sp,sp.target);ROOM.spot=sp;
    /* Rundum-Foto als Raum (Werkstatt oder Studio, OPT.roomStudio) */
    ROOM.floorY=floor;ROOM.makeFloor(floor);ROOM.setBg();
    ROOM.ready=true;ROOM.apply()};
  /* Holzmaserung für den Brettrahmen (Längsrichtung = u) */
  function woodTex(){const c=document.createElement('canvas');c.width=512;c.height=64;const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'#8b6240');g.addColorStop(.5,'#7a5535');g.addColorStop(1,'#6c4a2e');x.fillStyle=g;x.fillRect(0,0,512,64);
    let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
    for(let i=0;i<46;i++){const y=rnd()*64,l=120+rnd()*380,x0=rnd()*512;x.strokeStyle=rnd()<.55?'rgba(40,24,10,'+(.08+rnd()*.16)+')':'rgba(215,170,120,'+(.05+rnd()*.1)+')';x.lineWidth=.6+rnd()*1.6;x.beginPath();x.moveTo(x0,y);x.bezierCurveTo(x0+l*.3,y+(rnd()-.5)*3,x0+l*.7,y+(rnd()-.5)*3,x0+l,y+(rnd()-.5)*2);x.stroke()}
    for(let i=0;i<4;i++){const kx=rnd()*512,ky=10+rnd()*44;x.fillStyle='rgba(50,30,14,.35)';x.beginPath();x.ellipse(kx,ky,6+rnd()*5,3+rnd()*2,0,0,6.283);x.fill()}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t}
  /* Rahmenbreite, Oberkante (y) des Rahmens: knapp über dem Meeresspiegel, der Kartenrand fällt nach aussen ab */
  ROOM.FRAME={w:14,top:-1.1};
  ROOM.makeBoard=function(){if(ROOM.board)return;const W3=W/R3.S,H3=H/R3.S,fw=ROOM.FRAME.w,y1=ROOM.FRAME.top,y0=ROOM.DESK,hh=y1-y0,g=new THREE.Group();g.name='board';g.visible=false;
    const tex=woodTex(),mk=(L)=>{const t=tex.clone();t.needsUpdate=true;t.repeat.set(L/150,1);return new THREE.MeshStandardMaterial({map:t,color:0x8a7768,emissive:0x2a1a0e,roughness:.72,metalness:0,envMapIntensity:.35})};
    /* vorn/hinten über die Ecken, links/rechts dazwischen: so überlappen sich keine Flächen (kein Flackern) */
    for(const[L,x,z,ry]of[[W3+2*fw,W3/2,-fw/2,0],[W3+2*fw,W3/2,H3+fw/2,0],[H3,-fw/2,H3/2,Math.PI/2],[H3,W3+fw/2,H3/2,Math.PI/2]]){
      const m=new THREE.Mesh(new THREE.BoxGeometry(L,hh,fw),mk(L));m.position.set(x,y0+hh/2,z);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;m.userData.noShadow=true;g.add(m)}
    /* Schatten des Bretts auf der Tischplatte (weich, leicht nach rechts/vorn versetzt wie das Sonnenlicht von links hinten) */
    {const pad=46,pw=W3+2*fw+2*pad,ph=H3+2*fw+2*pad,sc=1.6,c=document.createElement('canvas');c.width=Math.round(pw*sc);c.height=Math.round(ph*sc);const x=c.getContext('2d');
      x.shadowColor='rgba(0,0,0,.8)';x.shadowBlur=15*sc;x.shadowOffsetX=0;x.fillStyle='#000';x.fillRect(pad*sc+3*sc,pad*sc+4*sc,(W3+2*fw)*sc,(H3+2*fw)*sc);
      const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
      const m=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.62,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
      m.rotation.x=-Math.PI/2;m.position.set(W3/2,ROOM.DESK+.12,H3/2);m.renderOrder=0;g.add(m)}
    /* Verzierung auf dem Rahmen (nur Bemalung): vorn der Schriftzug in Gold mit dunkler Kontur, überall Doppellinie und Rauten */
    {const sc=7,mkTex=(L,txt)=>{const w=Math.round(L*sc),h=Math.round(fw*sc),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');
        const ln=(y,a)=>{x.fillStyle='rgba(30,16,6,'+a+')';x.fillRect(h*.4,y,w-h*.8,Math.max(1,h*.035));x.fillStyle='rgba(255,225,170,'+a*.35+')';x.fillRect(h*.4,y+h*.035,w-h*.8,Math.max(1,h*.02))};
        ln(h*.12,.75);ln(h*.84,.75);
        const dia=(cx,r)=>{x.beginPath();x.moveTo(cx,h/2-r);x.lineTo(cx+r,h/2);x.lineTo(cx,h/2+r);x.lineTo(cx-r,h/2);x.closePath();x.fillStyle='#c9a24f';x.fill();x.lineWidth=h*.03;x.strokeStyle='rgba(40,22,8,.9)';x.stroke()};
        let tw=0;if(txt){x.font='700 '+Math.round(h*.56)+'px Georgia,"Times New Roman",serif';if('letterSpacing' in x)x.letterSpacing=Math.round(h*.16)+'px';tw=x.measureText(txt).width;x.textBaseline='middle';x.textAlign='center';
          x.lineJoin='round';x.lineWidth=h*.07;x.strokeStyle='rgba(40,22,8,.95)';x.strokeText(txt,w/2,h*.53);x.fillStyle='#e2bd63';x.fillText(txt,w/2,h*.53)}
        const gap=tw/2+h*.9;for(const sd of[-1,1]){const x0=w/2+sd*gap,x1=w/2+sd*(w/2-h*1.4);const n=Math.max(2,Math.floor(Math.abs(x1-x0)/(h*1.3)));
          for(let i=0;i<=n;i++){dia(x0+(x1-x0)*i/n,h*.12)}
          x.strokeStyle='rgba(40,22,8,.7)';x.lineWidth=h*.03;x.beginPath();x.moveTo(x0,h/2);x.lineTo(x1,h/2);x.stroke();x.strokeStyle='rgba(226,189,99,.9)';x.lineWidth=h*.012;x.stroke()}
        const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t},
      ov=(L,x,z,ry,txt)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(L,fw),new THREE.MeshBasicMaterial({map:mkTex(L,txt),transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
        m.rotation.order='YXZ';m.rotation.set(-Math.PI/2,ry,0);m.position.set(x,y1+.06,z);m.renderOrder=2;g.add(m)};
      ov(W3+2*fw,W3/2,H3+fw/2,0,'EPOCHENKRIEG');ov(W3+2*fw,W3/2,-fw/2,Math.PI,'');ov(H3,-fw/2,H3/2,Math.PI/2,'');ov(H3,W3+fw/2,H3/2,-Math.PI/2,'')}
    r3.scene.add(g);ROOM.board=g};
  /* Tischplatte im Spiel: die Schreibtisch-Textur ist ein helles Metall und wirkt unter der kräftigen Spielsonne weiss überstrahlt → im Spiel matter und dunkler (k: 0 = Menü-Look, 1 = Spiel-Look, weicher Übergang) */
  ROOM.tone=function(k){if(!ROOM.deskMats)return;if(Math.abs(k-(ROOM.tk||0))<.002&&ROOM.tk!==undefined)return;ROOM.tk=k;
    for(const t of ROOM.deskMats){if(!t.userData.c0)t.userData.c0=t.color.clone();t.color.copy(t.userData.c0).multiplyScalar(1-.55*k);t.metalness=1-k;t.roughness=1-.2*k;t.envMapIntensity=1-.7*k}};
  ROOM.RS=3514;
  ROOM.setBg=function(){if(!ROOM.g)return;const bgf=ROOM.BGS[typeof OPT!=='undefined'&&OPT.roomStudio?'studio':'werkstatt'],floor=ROOM.floorY,g=ROOM.g,Rs=ROOM.RS;
    const img=new Image();img.onload=()=>{if(ROOM.sky){g.remove(ROOM.sky);ROOM.sky.geometry.dispose();ROOM.sky.material.map.dispose();ROOM.sky.material.dispose()}
      const t=new THREE.CanvasTexture(softPhoto(img,2048));t.colorSpace=THREE.SRGBColorSpace;t.flipY=true;t.anisotropy=4;
      const sk=dome(t,Rs);sk.position.set(240,floor+Rs*Math.sin(E0),160);sk.rotation.y=ROOM.rotY||0;g.add(sk);ROOM.sky=sk;ROOM.bg=t;ROOM.apply()};img.src=B+bgf};
  /* Boden: Parkett bis zum Rand der Kuppel, am Rand weich abgedunkelt */
  ROOM.makeFloor=function(floor){const Rw=ROOM.RS*Math.cos(E0),g=ROOM.g,t=parquetTex();t.repeat.set(2*Rw/ROOM.TILE,2*Rw/ROOM.TILE);
    const f=new THREE.Mesh(new THREE.CircleGeometry(Rw,96),new THREE.MeshStandardMaterial({map:t,color:0xb9aea2,roughness:.55,metalness:0,envMapIntensity:.25}));
    f.rotation.x=-Math.PI/2;f.position.set(240,floor,160);f.receiveShadow=true;f.userData.noShadow=true;g.add(f);
    /* weicher Rand + Lichtkegel der Lampe auf dem Boden */
    const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),gr=x.createRadialGradient(128,128,20,128,128,128);gr.addColorStop(0,'rgba(8,5,3,0)');gr.addColorStop(.45,'rgba(8,5,3,.15)');gr.addColorStop(.8,'rgba(8,5,3,.7)');gr.addColorStop(1,'rgba(8,5,3,1)');x.fillStyle=gr;x.fillRect(0,0,256,256);
    const v=new THREE.Mesh(new THREE.CircleGeometry(Rw+2,64),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false}));v.rotation.x=-Math.PI/2;v.position.set(240,floor+.6,160);v.renderOrder=1;g.add(v)};
  /* an/aus: Hintergrund, Meer nur auf dem Brett, Sichtweite */
  ROOM.apply=function(){if(!R3.ok)return;const on=ROOM.ready&&!(typeof OPT!=='undefined'&&OPT.room===false);ROOM.on=on;if(ROOM.g)ROOM.g.visible=on;if(ROOM.board)ROOM.board.visible=on;document.body.classList.toggle('room',on);
    const sc=r3.scene;if(on){sc.background=new THREE.Color(0x2a241e);sc.fog.color.set(0x8f877a)}else{const A=R3.atmo;sc.background=new THREE.Color(A?A.sky:0x16384f);sc.fog.color.set(A?A.fog:0x9db8c4)}
    if(r3.sea){if(on){r3.sea.scale.set(W/R3.S/3600,1,H/R3.S/3600)}else r3.sea.scale.set(1,1,1)}
    r3.camera.far=on?16000:1400;r3.camera.updateProjectionMatrix()};
  /* Raum-Kamera: Blick von schräg oben auf Tisch und Brett, kreist langsam (Hauptmenü) */
  function roomPose(a){const c=new THREE.Vector3(240,ROOM.DESK,160),k=ROOM.g?ROOM.g.scale.x:1,r=1250*k;return{p:new THREE.Vector3(c.x+Math.sin(a)*r,c.y+470*k,c.z+Math.cos(a)*r),t:c}}
  const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
  const oCam=camUpdate;
  camUpdate=function(){oCam();if(!ROOM.on||!R3.ok)return;const cmr=r3.camera,fg=r3.scene.fog;
    const menu=document.body.classList.contains('mm');
    if(ROOM.spot)ROOM.spot.visible=menu||!!ROOM.fly;
    {const now=performance.now(),dt=Math.min(.1,(now-(ROOM.tt||now))/1000);ROOM.tt=now;const tg=menu?0:1,k0=ROOM.tk===undefined?tg:ROOM.tk;ROOM.tone(k0+(tg-k0)*(1-Math.exp(-dt/.7)))}
    {const kk=.9/(typeof playF!=='undefined'?playF:.9),gg=ROOM.g;gg.scale.setScalar(gg.scale.x+(kk-gg.scale.x)*.08);gg.position.set(240*(1-gg.scale.x),ROOM.DESK*(1-gg.scale.x),160*(1-gg.scale.x))}
    /* Einzelspieler-Seite: Einstellungen rechts → Bild nach links schieben, damit das Brett frei sichtbar ist */
    const side=menu&&!!document.querySelector('#overlay .mm-sp')&&innerWidth>820,left=menu&&!side&&!!document.querySelector('#overlay .mm-side')&&innerWidth>820;if(side)cmr.setViewOffset(VW,VH,VW*.2,0,VW,VH);else if(left)cmr.setViewOffset(VW,VH,-VW*.11,0,VW,VH);else if(cmr.view&&cmr.view.enabled)cmr.clearViewOffset();
    if(ROOM.dbg){const d=ROOM.dbg;cmr.fov=d.fov||50;cmr.updateProjectionMatrix();cmr.position.set(...d.p);cmr.lookAt(...d.t);cmr.updateMatrixWorld();fg.near=1400;fg.far=6000;if(!menu)ROOM.dbg=null;else return}
    if(menu){ROOM.ang+=side?.0004:.0012;const sw=.62*Math.sin(ROOM.ang*.8);cmr.fov=50;cmr.updateProjectionMatrix();const P=roomPose(sw);cmr.position.copy(P.p);cmr.lookAt(P.t);cmr.updateMatrixWorld();fg.near=1400;fg.far=6000;ROOM.fly={a:sw,t0:-1};return}
    if(ROOM.fly){const f=ROOM.fly;const now=performance.now();if(f.t0<0){f.t0=now;f.k=0}f.k+=Math.min(.05,(now-f.t0)/1000)/5;f.t0=now;const k=Math.min(1,f.k),e=ease(k);
      const P=roomPose(f.a),gp=cmr.position.clone(),gt=new THREE.Vector3(cam.x/R3.S,hAt(cam.x,cam.y),cam.y/R3.S);
      cmr.position.lerpVectors(P.p,gp,e);cmr.fov=50+(R3.FOV-50)*e;cmr.updateProjectionMatrix();cmr.lookAt(P.t.clone().lerp(gt,e));cmr.updateMatrixWorld();fg.near=1400+(fg.near-1400)*e;fg.far=6000+(fg.far-6000)*e;if(k>=1)ROOM.fly=null}};
})();
ROOM.wide=()=>ROOM.on&&(!!ROOM.fly||document.body.classList.contains('mm'));
/* Start, sobald 3D und Modell-Lader bereit sind */
(function wait(){if(typeof R3!=='undefined'&&R3.ok&&typeof EKGLTF!=='undefined'&&(typeof EKMODELS==='undefined'||EKMODELS.ready)&&typeof W!=='undefined'&&!window.__norender){ROOM.init()}else setTimeout(wait,300)})();
