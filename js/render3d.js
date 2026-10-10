/* Epochenkrieg – 3D-Darstellung (Three.js): Gelände, Modelle, Kamera, Licht. Das Spiel selbst rechnet weiter in 2D-Koordinaten (x, y in Pixeln);
   hier wird daraus die 3D-Welt: Spiel-x → x/S, Spiel-y → z/S, Höhe y kommt vom Gelände. Die Umrechnungen für Maus und Overlay stehen unten (R3.scr, toWorld).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
const R3={S:10,ok:false,D0:74,PITCH:.96,FOV:36,k:1,reg:new Map(),rings:[],ringN:0,t0:0,nodeT:0,bgRef:null,fogN:0};
const _v=()=>new THREE.Vector3();
let r3={};
const smooth3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};

function r3Init(){
  const glc=document.getElementById('gl');
  const rd=new THREE.WebGLRenderer({canvas:glc,antialias:true,powerPreference:'high-performance'});
  rd.shadowMap.enabled=true;rd.shadowMap.type=THREE.PCFSoftShadowMap;rd.outputColorSpace=THREE.SRGBColorSpace;
  rd.toneMapping=THREE.ACESFilmicToneMapping;rd.toneMappingExposure=1.15;
  const scene=new THREE.Scene(),SKY=0x16384f;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(0x9db8c4,260,620);
  const camera=new THREE.PerspectiveCamera(R3.FOV,1,2,1400);
  const sun=new THREE.DirectionalLight(0xfff0d4,2.7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.35;scene.add(sun,sun.target);
  const hemi=new THREE.HemisphereLight(0xcfe3f5,0x56623a,1.5);scene.add(hemi);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(3600,3600).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x17405c,fog:false}));sea.position.set(W/R3.S/2,-.8,H/R3.S/2);scene.add(sea);
  const gEnt=new THREE.Group();scene.add(gEnt);
  r3={rd,scene,camera,sun,hemi,sea,gEnt,vec:_v(),ray:new THREE.Raycaster(),maxTex:rd.capabilities.maxTextureSize};
  R3.ok=true;R3.t0=performance.now();r3Resize();
}
function r3Resize(){if(!R3.ok)return;r3.rd.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));r3.rd.setSize(VW,VH,false);camUpdate()}

/* ---------- Gelände ---------- */
const hgrid={w:0,h:0,a:null};
function hAt(xp,yp){const g=hgrid;if(!g.a)return 0;const fx=Math.max(0,Math.min(g.w-1.001,xp/R3.S)),fz=Math.max(0,Math.min(g.h-1.001,yp/R3.S)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz,a=g.a,W1=g.w;
  return(a[iz*W1+ix]*(1-tx)+a[iz*W1+ix+1]*tx)*(1-tz)+(a[(iz+1)*W1+ix]*(1-tx)+a[(iz+1)*W1+ix+1]*tx)*tz}
function r3Map(){
  const S=R3.S,{scene}=r3;
  for(const o of R3.reg.values())r3.gEnt.remove(o.obj);R3.reg.clear();
  if(r3.terrain){scene.remove(r3.terrain);r3.terrain.geometry.dispose();r3.terrain.material.map.dispose();scene.remove(r3.terrOv);scene.remove(r3.fogOv)}
  const GW=TW,GH=TH,lg=new Float32Array(GW*GH),sg=new Float32Array(GW*GH);
  const cell=(a,x,y)=>a[Math.max(0,Math.min(GH-1,y))*GW+Math.max(0,Math.min(GW-1,x))];
  for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){let sl=0,ss=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(GW-1,x+dx)),ny=Math.max(0,Math.min(GH-1,y+dy)),t=TERR[ny*GW+nx],wt=dx||dy?1:3;sl+=wt*(t>=2?1:0);ss+=wt*(t>=1?1:0);n+=wt}lg[y*GW+x]=sl/n;sg[y*GW+x]=ss/n}
  const bil=(a,xu,zu)=>{const fx=Math.max(0,Math.min(GW-1.001,xu*S/TG-.5)),fz=Math.max(0,Math.min(GH-1.001,zu*S/TG-.5)),ix=fx|0,iz=fz|0,tx=fx-ix,tz=fz-iz;return(a[iz*GW+ix]*(1-tx)+a[iz*GW+ix+1]*tx)*(1-tz)+(a[(iz+1)*GW+ix]*(1-tx)+a[(iz+1)*GW+ix+1]*tx)*tz};
  // Höhenfeld für die Darstellung glätten (sonst sieht man die 20-px-Stufen der Felder)
  const HLs=new Float32Array(GW*GH);for(let pass=0;pass<2;pass++){const src=pass?HLs.slice():HL;for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){let sm=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(GW-1,x+dx)),ny=Math.max(0,Math.min(GH-1,y+dy)),wt=dx||dy?1:3;sm+=wt*src[ny*GW+nx];n+=wt}HLs[y*GW+x]=sm/n}}
  const nz=(x,z)=>Math.sin(x*.11)*Math.cos(z*.09)*.5+Math.sin(x*.23+z*.17)*.25+Math.sin(x*.05-z*.07)*.6;
  const SX=W/S,SZ=H/S,NX=SX+1,NZ=SZ+1;hgrid.w=NX;hgrid.h=NZ;hgrid.a=new Float32Array(NX*NZ);
  const g=new THREE.PlaneGeometry(SX,SZ,SX,SZ);g.rotateX(-Math.PI/2);g.translate(SX/2,0,SZ/2);const pos=g.attributes.position;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const l=bil(lg,i,j),sh=bil(sg,i,j),m=smooth3(.44,.56,l);
    let sea=-.5+.16*smooth3(.3,.8,sh),land=bil(HLs,i,j)+nz(i*2.3,j*2.3)*.05;if(land>1.2)land+=(land-1.2)*.05*(Math.sin(i*.9+j*.3)*Math.cos(j*1.1)+Math.sin(i*2.3+j*1.7)*.6);hgrid.a[j*NX+i]=sea*(1-m)+land*m-(1-smooth3(0,7,Math.min(i,j,NX-1-i,NZ-1-j)))*2.4;pos.setY(j*NX+i,hgrid.a[j*NX+i])}
  g.computeVertexNormals();
  {const nm=g.attributes.normal,col=new Float32Array(pos.count*3);let my=0;for(let i=0;i<TERR.length;i++)if(TERR[i]===3&&HL[i]>my)my=HL[i];
    for(let i=0;i<pos.count;i++){const slope=1-nm.getY(i),sn=my>2.2?smooth3(my*.46,my*.56,hlAt(pos.getX(i)*10,pos.getZ(i)*10)):0,s=smooth3(.1,.4,slope)*(1-sn*.92);const br=1+2.2*sn;col[i*3]=(1-s*.42)*br;col[i*3+1]=(1-s*.5)*br;col[i*3+2]=(1-s*.56)*br*(1+.06*sn)}g.setAttribute('color',new THREE.BufferAttribute(col,3))}
  // Boden-Textur: das fertig gemalte Bild der Karte (renderBg), bei Bedarf verkleinert
  let src=bg;if(Math.max(bg.width,bg.height)>r3.maxTex){const k=r3.maxTex/Math.max(bg.width,bg.height);src=document.createElement('canvas');src.width=Math.floor(bg.width*k);src.height=Math.floor(bg.height*k);src.getContext('2d').drawImage(bg,0,0,src.width,src.height)}
  const tex=new THREE.CanvasTexture(src);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,r3.rd.capabilities.getMaxAnisotropy());
  if(!r3.detail){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),im=x.createImageData(256,256);let a=7;for(let i=0;i<256*256;i++){a=(a*1664525+1013904223)>>>0;const v=100+(a>>>24)*.6;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}x.putImageData(im,0,0);
    for(let i=0;i<500;i++){const px=Math.random()*256,py=Math.random()*256,r=3+Math.random()*10,gr=x.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,2*r,2*r)}
    const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(SX/6,SZ/6);r3.detail=t;
    const wc=document.createElement('canvas');wc.width=wc.height=256;const wx=wc.getContext('2d');wx.clearRect(0,0,256,256);wx.strokeStyle='rgba(255,255,255,.9)';wx.lineCap='round';
    for(let i=0;i<70;i++){const px=Math.random()*256,py=Math.random()*256,l=8+Math.random()*22;wx.lineWidth=1+Math.random()*1.5;wx.globalAlpha=.25+Math.random()*.5;for(const[ox,oy]of[[0,0],[256,0],[-256,0],[0,256],[0,-256]]){wx.beginPath();wx.moveTo(px-l+ox,py+oy);wx.quadraticCurveTo(px+ox,py-4+oy,px+l+ox,py+oy);wx.stroke()}}
    r3.waveTex=wc}
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:1,metalness:0,bumpMap:r3.detail,bumpScale:.45}));mesh.receiveShadow=true;scene.add(mesh);r3.terrain=mesh;
  if(r3.waves)for(const w of r3.waves)scene.remove(w);r3.waves=[];
  for(const[sp,rep,op]of[[1,SX/9,.32],[-1,SX/5.3,.22]]){const wt=new THREE.CanvasTexture(r3.waveTex);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(rep,rep*SZ/SX);const wm=new THREE.Mesh(new THREE.PlaneGeometry(SX,SZ).rotateX(-Math.PI/2).translate(SX/2,0,SZ/2),new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:op,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));wm.position.y=-.34;wm.renderOrder=1;wm.userData.sp=sp;scene.add(wm);r3.waves.push(wm)}
  const ovMat=(cv,order,op)=>{const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false}));m.renderOrder=order;m.material.opacity=op;scene.add(m);return m};
  r3.terrOv=ovMat(terrCv,2,.75);r3.fogOv=ovMat(fogCv,3,1);
  r3NodesInit();R3.bgRef=bg;R3.gRef=G;
}

/* ---------- Kamera und Umrechnung ---------- */
function camUpdate(){
  if(!R3.ok||!VW)return;const{camera,sun}=r3,S=R3.S,d=R3.D0/cam.z,tx=cam.x/S,tz=cam.y/S,ty=hAt(cam.x,cam.y);
  camera.aspect=VW/VH;camera.fov=R3.FOV;camera.updateProjectionMatrix();
  camera.position.set(tx,ty+Math.sin(R3.PITCH)*d,tz+Math.cos(R3.PITCH)*d);camera.lookAt(tx,ty,tz);camera.updateMatrixWorld();
  R3.k=(VH/(2*Math.tan(R3.FOV*Math.PI/360)*d))/S; // Bildschirm-Pixel pro Spiel-Pixel in der Bildmitte
  const b=Math.min(150,d*.85);sun.position.set(tx-.95*b,ty+.85*b,tz-.5*b);sun.target.position.set(tx,ty,tz);sun.target.updateMatrixWorld();
  const sc=sun.shadow.camera;sc.left=sc.bottom=-b;sc.right=sc.top=b;sc.near=1;sc.far=b*3.2;sc.updateProjectionMatrix();
  r3.scene.fog.near=d*2.4;r3.scene.fog.far=d*6;
}
/* Spielpunkt (x,y in Pixeln, Höhe z in Pixeln) → Bildschirm */
function scr(x,y,z){const v=r3.vec,S=R3.S;v.set(x/S,hAt(x,y)+(z||0)/S,y/S).project(r3.camera);return{x:(v.x+1)/2*VW,y:(1-v.y)/2*VH,front:v.z<1}}
/* Bildschirm → Spielpunkt (Strahl auf das Gelände) */
function toWorld(sx,sy){
  if(!R3.ok)return{x:cam.x,y:cam.y};
  const{camera,ray}=r3,S=R3.S;ray.setFromCamera({x:sx/VW*2-1,y:-(sy/VH)*2+1},camera);const o=ray.ray.origin,d=ray.ray.direction;
  let h=0,x=cam.x/S,z=cam.y/S;
  for(let i=0;i<4;i++){const t=(h-o.y)/(d.y<-1e-4?d.y:-1e-4);x=o.x+d.x*t;z=o.z+d.z*t;h=hAt(x*S,z*S)}
  return{x:Math.max(0,Math.min(W,x*S)),y:Math.max(0,Math.min(H,z*S))}}

/* ---------- Instanzen für Bäume, Büsche, Felsen ---------- */
function r3NodesInit(){
  const{scene}=r3;for(const k of['pine','broad','bush','rock','ore','gold'])if(r3['i_'+k]){scene.remove(r3['i_'+k]);r3['i_'+k].dispose()}
  const cnt={tree:0,bush:0,stone:0,iron:0,gold:0};for(const e of G.ents)if(e.kind==='node'&&cnt[e.type]!==undefined)cnt[e.type]++;
  const mk=(geo,n,flat)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,flatShading:!!flat}),Math.max(1,n));m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);return m};
  r3.i_pine=mk(treeGeo(true),cnt.tree,false);r3.i_broad=mk(treeGeo(false),cnt.tree,false);r3.i_bush=mk(bushGeoC(),cnt.bush,false);r3.i_rock=mk(rockGeoC(false,1),cnt.stone*5,true);r3.i_ore=mk(rockGeoC(true,2),cnt.iron*5,true);r3.i_gold=mk(rockGeoC(true,3,true),cnt.gold*5,true);
  r3Grass();R3.nodeT=0;
}
/* Grasbüschel und Blumen: viele winzige Instanzen auf dem Land, damit der Boden aus der Nähe lebendig wirkt */
function r3Grass(){
  const{scene}=r3;for(const k of['i_tuft','i_flower'])if(r3[k]){scene.remove(r3[k]);r3[k].dispose();r3[k]=null}
  const R=mulberry(4242),S=R3.S,pts=[],fl=[];
  for(let i=0;i<Math.round(52000*AREA)&&pts.length<Math.round(15000*AREA);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)!==2)continue;let ok=true;for(let k=0;k<4;k++)if(terrAt(x+Math.cos(k*1.57)*14,y+Math.sin(k*1.57)*14)!==2){ok=false;break}if(!ok)continue;
    const dens=.5+.5*Math.sin(x*.013+Math.cos(y*.011)*2);if(R()>dens*1.1)continue;pts.push({x,y,r:R()*6.28,s:.6+R()*.8,c:.8+R()*.5,j:R()})}
  for(let i=0;i<Math.round(9000*AREA)&&fl.length<Math.round(1800*AREA);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)!==2)continue;const cx=Math.cos(x*.02)*Math.sin(y*.017);if(cx<.35)continue;fl.push({x,y,r:R()*6.28,s:.7+R()*.6,k:(R()*5)|0})}
  const blade=(r,h,ax,az,col)=>{const g=new THREE.ConeGeometry(r,h,3);g.translate(0,h/2,0);g.rotateZ(az);g.rotateX(ax);return[g,col]};
  const tg=mergeColored([blade(.05,.5,.18,.2,0x5f8a3a),blade(.05,.62,-.15,-.1,0x6f9a44),blade(.045,.42,.1,-.3,0x4f7a32),blade(.045,.55,-.2,.25,0x7aa24b)]);
  r3.i_tuft=new THREE.InstancedMesh(tg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}),pts.length);
  r3.grassPts=pts;
  const fg=mergeColored([[tr3(cyl(.012,.012,.38,4),0,.19,0),0x4f7a32],[tr3(new THREE.IcosahedronGeometry(.085,0),0,.4,0),0xffffff]]);
  r3.i_flower=new THREE.InstancedMesh(fg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),fl.length);r3.flowerPts=fl;
  for(const m of[r3.i_tuft,r3.i_flower]){m.frustumCulled=false;m.castShadow=false;m.receiveShadow=true;scene.add(m)}
  const o=new THREE.Object3D(),pal=[0xf4e66a,0xf7f3ea,0xe07a8a,0x9f7ad6,0xf0a24a];
  pts.forEach((p,i)=>{o.position.set(p.x/S,hAt(p.x,p.y),p.y/S);o.rotation.set(0,p.r,0);o.scale.setScalar(p.s);o.updateMatrix();r3.i_tuft.setMatrixAt(i,o.matrix)});
  fl.forEach((p,i)=>{o.position.set(p.x/S,hAt(p.x,p.y),p.y/S);o.rotation.set(0,p.r,0);o.scale.setScalar(p.s);o.updateMatrix();r3.i_flower.setMatrixAt(i,o.matrix);r3.i_flower.setColorAt(i,new THREE.Color(pal[p.k]))});
  r3.i_tuft.instanceMatrix.needsUpdate=true;r3.i_flower.instanceMatrix.needsUpdate=true;r3.blk=new Uint8Array(FW*FH);r3.grassHid=new Uint8Array(pts.length+fl.length);
}
/* Büschel unter Gebäuden und im Nebel ausblenden bzw. abdunkeln (alle 0,4 s) */
function r3GrassShade(){
  if(!r3.i_tuft)return;const blk=r3.blk,S=R3.S;blk.fill(0);
  for(const e of G.ents)if(!e.dead&&e.kind==='bld'){const rr=e.r+10,x0=Math.max(0,(e.x-rr)/FC|0),x1=Math.min(FW-1,(e.x+rr)/FC|0),y0=Math.max(0,(e.y-rr)/FC|0),y1=Math.min(FH-1,(e.y+rr)/FC|0);for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)blk[y*FW+x]=1}
  const c=new THREE.Color(),m=new THREE.Matrix4(),o=new THREE.Object3D();
  r3.grassPts.forEach((p,i)=>{const hid=blk[fogIdx(p.x,p.y)]?1:0,sh=fogShade(p.x,p.y)*p.c;c.setRGB(sh,sh*(.96+p.j*.08),sh*.95);r3.i_tuft.setColorAt(i,c);
    if(hid!==r3.grassHid[i]){r3.grassHid[i]=hid;o.position.set(p.x/S,hAt(p.x,p.y),p.y/S);o.rotation.set(0,p.r,0);o.scale.setScalar(hid?.0001:p.s);o.updateMatrix();r3.i_tuft.setMatrixAt(i,o.matrix);r3.i_tuft.instanceMatrix.needsUpdate=true}});
  r3.i_tuft.instanceColor.needsUpdate=true;
  r3.flowerPts.forEach((p,i)=>{const j=r3.grassPts.length+i,hid=blk[fogIdx(p.x,p.y)]?1:0;if(hid!==r3.grassHid[j]){r3.grassHid[j]=hid;o.position.set(p.x/S,hAt(p.x,p.y),p.y/S);o.rotation.set(0,p.r,0);o.scale.setScalar(hid?.0001:p.s);o.updateMatrix();r3.i_flower.setMatrixAt(i,o.matrix);r3.i_flower.instanceMatrix.needsUpdate=true}});
}
let _o=null,_c=null;
function fogShade(x,y){const i=fogIdx(x,y),a=(1-visF[i])*(165-95*exF[i])/255;return 1-a*.82}
function r3Nodes(){
  if(!_o){_o=new THREE.Object3D();_c=new THREE.Color()}
  const S=R3.S,cnt={pine:0,broad:0,bush:0,rock:0,ore:0,gold:0},I=r3;
  const put=(m,key,x,y,z,ry,sx,sy,col)=>{const n=cnt[key]++;if(n>=m.instanceMatrix.count)return;_o.position.set(x,y,z);_o.rotation.set(0,ry,0);_o.scale.set(sx,sy,sx);_o.updateMatrix();m.setMatrixAt(n,_o.matrix);m.setColorAt(n,col)};
  for(const e of G.ents){if(e.dead||e.kind!=='node'||e.sea||e.type==='field')continue;
    const k=Math.max(.5,Math.sqrt(e.amount/e.maxAmt)),sh=fogShade(e.x,e.y),h=hAt(e.x,e.y),x=e.x/S,z=e.y/S,sd=e.seed;
    if(e.type==='tree'){const s=e.r/11*.62*(.85+sd*.35)*(.55+.45*k),pine=sd<.5,v=.9+((sd*97)%1)*.2;_c.setRGB(v*sh,(.95+((sd*53)%1)*.12)*v*sh,v*sh);put(pine?I.i_pine:I.i_broad,pine?'pine':'broad',x,h,z,sd*6.28,s,s*(.9+((sd*31)%1)*.3),_c)}
    else if(e.type==='bush'){const s=e.r/10*(.55+.45*k);_c.setRGB(sh,sh,sh);put(I.i_bush,'bush',x,h,z,sd*6.28,s,s,_c)}
    else{const iron=e.type==='iron',gold=e.type==='gold',m=gold?I.i_gold:iron?I.i_ore:I.i_rock,key=gold?'gold':iron?'ore':'rock',base=e.r/10*(.6+.4*k);
      for(let j=0;j<5;j++){const a=sd*20+j*1.9,dd=j?e.r/S*.62:0,sz=base*(j?.55+((j*37+sd*50)%7)/14:1.05),xx=x+Math.cos(a)*dd,zz=z+Math.sin(a)*dd;_c.setRGB(sh*(.92+(j%3)*.05),sh*(.92+(j%3)*.05),sh*(.95+(j%2)*.05));put(m,key,xx,hAt(xx*S,zz*S)-.1,zz,a,sz,sz*(j?1:1.15),_c)}}}
  for(const[k,m]of[['pine',I.i_pine],['broad',I.i_broad],['bush',I.i_bush],['rock',I.i_rock],['ore',I.i_ore],['gold',I.i_gold]]){m.count=Math.min(cnt[k],m.instanceMatrix.count);m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}
}

/* ---------- Meeresbewohner ---------- */
function seaModel(e){const g=new THREE.Group(),dark=m3Plain(e.type==='whale'?0x3b5273:0x7f9fb8,.45),belly=m3Plain(e.type==='whale'?0xcdd9e3:0xdce8ef,.5);
  if(e.type==='fish'){const sk=[0xf4fbff,0xffe48a,0xbfe8ff];for(let i=0;i<6;i++){const f=new THREE.Group(),b=put(f,new THREE.SphereGeometry(.4,10,8),new THREE.MeshStandardMaterial({color:sk[i%3],roughness:.3,metalness:.2,emissive:sk[i%3],emissiveIntensity:.25}),0,0,0);b.scale.set(1.7,.6,.42);put(f,cone(.2,.46,4),m3Plain(0xdfeef5),-.78,0,0).rotation.z=Math.PI/2;put(f,cone(.1,.28,3),m3Plain(0xdfeef5),0,.26,0);f.position.set(Math.cos(i*1.7)*e.r/R3.S*.9,-.2,Math.sin(i*2.3)*e.r/R3.S*.9);f.userData.ph=i;g.add(f)}
    const ring=new THREE.Mesh(new THREE.RingGeometry(.9,1,28).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.5,depthWrite:false,fog:false}));ring.userData.ring=true;g.add(ring)}
  else{const whale=e.type==='whale',n=whale?1:2,L=whale?5.4:2.2,Rr=whale?.95:.34,topC=whale?0x56709a:0x86a8c4,botC=whale?0xdde6ee:0xe8f1f6;
    for(let i=0;i<n;i++){const f=new THREE.Group(),bg=swimBody(L,Rr,topC,botC);f.add(new THREE.Mesh(bg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.05})));
      const k=L/2.2,tailX=-L/2;
      const fl=put(f,new THREE.SphereGeometry(1,10,6),dark,tailX-.12*k,.02*k,0);fl.scale.set(.22*k,.035*k,.62*k*(whale?1.1:.7));fl.rotation.z=.1;
      const dors=put(f,cone(.2*k,.5*k,4),dark,-.12*k*(whale?.6:1),Rr*.9,0);dors.rotation.z=-.5;dors.scale.z=.3;
      for(const z of[-1,1]){const fn=put(f,new THREE.SphereGeometry(1,8,6),dark,L*.2,-Rr*.55,z*Rr*.9);fn.scale.set(.3*k,.03*k,.12*k);fn.rotation.y=z*.5;fn.rotation.x=z*.3}
      if(!whale)put(f,new THREE.CylinderGeometry(.04,.075,.32,6),dark,L/2+.1,-.04,0).rotation.z=-Math.PI/2;
      for(const z of[-1,1])put(f,new THREE.SphereGeometry(.05*k,6,6),m3Plain(0x0d1115),L*.36,Rr*.35,z*Rr*.6,false);
      f.position.set(0,-.12,(i-.5)*(n-1)*1.4);f.userData.ph=i;g.add(f)}}
  return setShadows(g)}

/* ---------- Entitäten abgleichen ---------- */
function entKey(e,ghost){return(ghost?'g':e.kind[0])+e.id}
function r3Sync(list,dt,t){
  const S=R3.S,seen=new Set();
  for(const[e,ghost]of list){
    const key=entKey(e,ghost);seen.add(key);
    const ep=e.kind==='bld'?G.epoch[e.team]:0,sig=e.kind==='unit'?e.type+e.team+':'+(e.lvl||0):e.kind==='bld'?e.type+':'+ep+':'+e.team:e.kind==='animal'?e.type:e.type;
    let o=R3.reg.get(key);
    if(!o||o.sig!==sig){if(o)r3.gEnt.remove(o.obj);o=r3Make(e,sig);R3.reg.set(key,o);r3.gEnt.add(o.obj)}
    const h=hAt(e.x,e.y),obj=o.obj;
    if(e.kind==='unit')r3Unit(o,e,h,dt,t);
    else if(e.kind==='bld'){obj.position.set(e.x/S,h,e.y/S);const pr=e.built?1:.12+.88*e.prog;obj.scale.set(1,pr,1);
      if(e.type==='harbor')obj.rotation.y=-(e.ang||0);for(const f of o.flags)f.rotation.y=Math.sin(t*3+f.position.x)*.3}
    else if(e.kind==='node'){obj.position.set(e.x/S,-.38+Math.sin(t*1.6+e.seed*20)*.05,e.y/S);obj.rotation.y=e.seed*6.28+Math.sin(t*.5+e.seed*9)*.15;
      obj.children.forEach(f=>{if(f.userData.ring){const k=(t*.45+e.seed*3)%1;f.scale.setScalar(1.2+k*2.8);f.material.opacity=(1-k)*.55;f.position.y=.05;return}const p=f.userData.ph||0;f.position.y=-.1+Math.sin(t*2+p*2+e.seed*9)*.06;if(e.type==='fish')f.rotation.y=Math.sin(t*1.5+p)*.4})}
    else if(e.kind==='animal')r3Animal(o,e,h,dt,t);
    o.seen=true;o.e=e}
  if(R3.corpG!==G){for(const c of R3.corpses||[])r3.gEnt.remove(c.obj);R3.corpses=[];R3.corpG=G}
  for(const[k,o]of R3.reg)if(!seen.has(k)){
    if(o.e&&o.e.dead&&o.rig&&!o.rig.ship&&(o.e.kind==='animal'||o.rig.up)&&R3.corpses.length<40){R3.corpses.push({obj:o.obj,rig:o.rig,t:0,animal:o.e.kind==='animal',big:o.e.kind==='animal'&&(ANIMALS[o.e.type].r>10)})}
    else r3.gEnt.remove(o.obj);R3.reg.delete(k)}
  for(let i=R3.corpses.length-1;i>=0;i--){const c=R3.corpses[i];c.t+=dt;const f=Math.min(1,c.t/.4);
    if(c.animal)c.rig.g.rotation.x=f*1.45;else{c.rig.g.rotation.z=-f*1.5;if(c.rig.up){c.rig.up.rotation.z=0;for(const l of c.rig.legs)l.rotation.z=0;for(const a of c.rig.arms)a.rotation.z=1.6*f}}
    c.obj.position.y=c.t>2.4?-(c.t-2.4)*.9:c.obj.position.y;
    if(c.t>3.2){r3.gEnt.remove(c.obj);R3.corpses.splice(i,1)}}
}
function r3Make(e,sig){
  const S=R3.S;
  if(e.kind==='unit'){const rig=buildUnit(e),sc=e.r/7*1.25*(UNITS[e.type].naval?.46:UNITS[e.type].siege?.7:1);rig.g.scale.setScalar(sc*(.94+((e.id*37)%13)/13*.12));const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  if(e.kind==='bld'){const g=buildBld(e.type,e.r/S*1.05,G.epoch[e.team],e.team);return{obj:g,sig,flags:g.userData.flags||[]}}
  if(e.kind==='animal'){const rig=buildAnimal(e);const wrap=new THREE.Group();wrap.add(rig.g);return{obj:wrap,rig,ph:Math.random()*6,yaw:-(e.fa||0),sig,flags:[]}}
  const g=seaModel(e);return{obj:g,sig,flags:[]}}
/* Gliederbewegung der Menschen: Gehen (Gegenschwung, Neigen, Wippen), Atmen im Stand, Arbeiten je Werkzeug, Kampf mit Ausholen/Schlag/Rückstoß, Zucken bei Treffern */
function r3Human(o,e,rig,d,s,sw,work,build,moving,dt,t){
  const up=rig.up,L=rig.legs,A=rig.arms,id=e.id,k=Math.max(0,Math.min(1,(G.t-(e.swing||-9))/.5)),fresh=G.t-(e.swing||-9)<.5;
  const heavy=d.siege||e.type==='musket'||e.type==='rifle',carry=e.carry>0&&(e.state==='return'||e.state==='gather');
  if(o.hp===undefined)o.hp=e.hp;if(e.hp<o.hp-.5)o.fl=.28;o.hp=e.hp;o.fl=Math.max(0,(o.fl||0)-dt);
  const fl=o.fl/.28;
  const run=moving?Math.min(1.25,.75+d.spd/110):0,sa=Math.sin(o.ph)*.85*run;
  L[0].rotation.z=-sa;L[1].rotation.z=sa;
  let lean=moving?-.07-.07*run-(carry?.1:0):0,twist=moving?Math.sin(o.ph)*.14*run:0,bob=moving?Math.abs(Math.cos(o.ph))*.06*run:Math.sin(t*1.8+id)*.012;
  let a0=moving?-sa*.7:Math.sin(t*1.3+id)*.04,a1=.12+(moving?sa*.7:Math.sin(t*1.3+id+1.4)*.04);
  if(rig.bow)a0=1.5;
  const atk=e.state==='attack';
  if(atk&&!moving){
    const ranged=d.ranged;
    if(rig.bow){const pull=e.cd<.45?1-e.cd/.45:0;a1=1.5+(fresh?-.3*(1-k):0);a0=1.5;lean=-.05+(pull?.1*pull:0)+(fresh?.12*(1-k):0);twist=-.25}
    else if(ranged){a1=1.25+(fresh?-.5*(1-k):0);a0=.5;lean=fresh?.16*(1-k):-.05;twist=.2}
    else{const wind=e.cd<.4?1-e.cd/.4:0;a1=fresh?.3+1.9*(1-k):-1.5*wind+.15;lean=fresh?-.28*(1-k):.14*wind;twist=fresh?.3*(1-k):-.3*wind;if(!heavy)a0=fresh?-.4*(1-k):-.2*wind}}
  else if((work||build)&&!moving){
    const kind=build?'build':e.rtype,c=(t*(kind==='wood'?6.5:kind==='build'?9:5.2)+id*1.7),ph=.5+.5*Math.sin(c),pow=ph*ph;
    if(kind==='wood'){a1=-2.1+2.8*pow;a0=a1*.85;lean=-.05-.32*pow;twist=-.2+.3*pow;bob=-.04*pow}
    else if(kind==='stone'||kind==='iron'||kind==='gold'){a1=-1.8+2.5*pow;a0=a1*.9;lean=-.12-.3*pow;twist=.15-.2*pow;bob=-.05*pow}
    else if(kind==='build'){a1=-.9+1.6*pow;a0=.3+.4*Math.sin(c*.5);lean=-.18-.1*pow;twist=0}
    else{lean=-.55-.1*ph;a1=.9+.5*Math.sin(c);a0=.9-.5*Math.sin(c);bob=-.1}}
  else if(e.state==='gather'&&!moving&&rig.tool){a1=.12}
  if(o.fl>0){lean+=.45*fl;a0+=.5*fl;a1+=.7*fl}
  A[0].rotation.z+=(a0-A[0].rotation.z)*Math.min(1,dt*16);A[1].rotation.z+=(a1-A[1].rotation.z)*Math.min(1,dt*18);
  up.rotation.z+=(lean-up.rotation.z)*Math.min(1,dt*14);up.rotation.y+=(twist-up.rotation.y)*Math.min(1,dt*14);
  up.position.y=.88+bob;up.position.x=(fresh&&atk&&!rig.bow?.18*(1-k):0)-(o.fl>0?.12*fl:0);
  if(rig.head)rig.head.rotation.y=moving||atk?0:Math.sin(t*.6+id*3)*.45;
  if(rig.tool){const kk=build?'build':(e.state==='gather'||e.state==='return'||work)?e.rtype:null;rig.tool(kk==='food'&&e.carry>0&&e.state==='return'?null:kk);if(rig.sack){rig.sack.visible=e.carry>0&&e.state!=='gather'||e.carry>4;rig.sack.scale.setScalar(.6+Math.min(1,e.carry/CARRY)*.6)}}
}
function r3Unit(o,e,h,dt,t){
  const S=R3.S,d=UNITS[e.type],rig=o.rig,moving=G.t-(e.mvT||-9)<.2,obj=o.obj;
  let want=-e.fa,dy=want-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*14);
  const sw=e.swing&&G.t-e.swing<.28?1-(G.t-e.swing)/.28:0,work=G.t-(e.gat||-9)<.25,build=e.state==='build';
  if(moving)o.ph+=dt*(d.naval?2:7+d.spd*.06);const s=Math.sin(o.ph);
  let y=h;
  if(rig.ship){y=-.42+Math.sin(t*2+e.id)*.06;obj.rotation.z=Math.sin(t*1.7+e.id)*.035;obj.rotation.x=0;if(rig.sail)rig.sail.rotation.y=Math.sin(t*1.3+e.id)*.1}
  else{
    if(moving)y+=Math.abs(s)*.07*(rig.horse?1.6:1);
    if(rig.horse){rig.legs.forEach((l,i)=>l.rotation.z=(i%2?s:-s)*.7);const rd=rig.rider;rd.arms[1].rotation.z=.2+sw*.6}
    else if(rig.wheels){if(moving)rig.wheels.forEach(w=>w.rotation.y+=dt*3.2*(d.spd/40));if(rig.log)rig.log.position.x=sw*.9;if(rig.arm)rig.arm.rotation.z=-sw*1.8;if(rig.barrel)rig.barrel.position.x=.1-sw*.35}
    else if(rig.up){r3Human(o,e,rig,d,s,sw,work,build,moving,dt,t)}
    else{
      const sa=moving?s*.7:0;rig.legs[0].rotation.z=-sa;rig.legs[1].rotation.z=sa;
      rig.arms[0].rotation.z=rig.bow?1.5:moving?sa*.7:0;
      let a=.15+(moving?-sa*.6:0);
      if(rig.bow){a=1.5;rig.arms[1].rotation.z=a+(sw?-.5*sw:0)}
      else{if(e.state==='attack'&&!d.ranged){a=sw>0?.2+1.9*sw:e.cd<.35?-1.0*(1-e.cd/.35):.2}
        else if(d.ranged&&e.state==='attack'){a=1.2+.0;}
        else if(work||build){a=.3+1.1*(.5+.5*Math.sin(t*10+e.id))}
        rig.arms[1].rotation.z=a}
      if(rig.tool){const k=build?'build':(e.state==='gather'||e.state==='return'||work)?e.rtype:null;rig.tool(k==='food'&&e.carry>0&&e.state==='return'?null:k);if(rig.sack){rig.sack.visible=e.carry>0&&e.state!=='gather'||e.carry>4;rig.sack.scale.setScalar(.6+Math.min(1,e.carry/CARRY)*.6)}}
    }
  }
  obj.position.set(e.x/S,y,e.y/S);obj.rotation.y=o.yaw;
}
function r3Animal(o,e,h,dt,t){const S=R3.S,rig=o.rig,moving=G.t-(e.mvT||-9)<.2;let dy=-e.fa-o.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));o.yaw+=dy*Math.min(1,dt*10);if(moving)o.ph+=dt*(6+UNITS_A(e).spd*.05);const s=Math.sin(o.ph);
  rig.legs.forEach((l,i)=>l.rotation.z=moving?(i%2?s:-s)*.7:0);const sw=e.swing&&G.t-e.swing<.3?1-(G.t-e.swing)/.3:0;if(rig.head)rig.head.rotation.z=-sw*.5+(e.state==='graze'?-.6:0);
  o.obj.position.set(e.x/S,h+(moving?Math.abs(s)*.06:0),e.y/S);o.obj.rotation.y=o.yaw}
const UNITS_A=e=>ANIMALS[e.type];

/* ---------- Auswahlringe am Boden ---------- */
function r3Ring(x,y,r,col,op){
  const S=R3.S;let m=R3.rings[R3.ringN];
  if(!m){m=new THREE.Mesh(new THREE.RingGeometry(.9,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,fog:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));m.renderOrder=4;R3.rings.push(m);r3.scene.add(m)}
  R3.ringN++;m.visible=true;m.material.color.set(col);m.material.opacity=op===undefined?.95:op;const rr=r/S;m.scale.set(rr,1,rr);m.position.set(x/S,hAt(x,y)+.1,y/S)}
function r3Ghost(type,x,y,ok){
  if(!r3.ghost||r3.ghostKey!==type+':'+G.epoch[0]){if(r3.ghost)r3.scene.remove(r3.ghost);const g=buildBld(type,BLDS[type].r/R3.S*1.05,G.epoch[0],0);g.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.55;o.castShadow=false}});r3.ghost=g;r3.ghostKey=type+':'+G.epoch[0];r3.scene.add(g)}
  r3.ghost.visible=true;r3.ghost.position.set(x/R3.S,hAt(x,y),y/R3.S);r3.ghost.traverse(o=>{if(o.isMesh&&o.material.emissive)o.material.emissive.setHex(ok?0x1c3a10:0x4a1208)})}

/* ---------- Ein Bild zeichnen ---------- */
function r3Frame(list,rings,dt){
  const t=(performance.now()-R3.t0)/1000;
  if(R3.bgRef!==bg||R3.gRef!==G)r3Map();
  camUpdate();
  for(const w of r3.waves){const m=w.material.map;m.offset.x=(t*.012*w.userData.sp)%1;m.offset.y=(t*.007)%1}
  r3.terrOv.material.map.needsUpdate=true;r3.fogOv.material.map.needsUpdate=true;
  R3.nodeT-=dt;if(R3.nodeT<=0){R3.nodeT=.4;r3Nodes();r3GrassShade()}
  r3Sync(list,dt,t);
  R3.ringN=0;for(const r of rings)r3Ring(r.x,r.y,r.r,r.c,r.o);for(let i=R3.ringN;i<R3.rings.length;i++)R3.rings[i].visible=false;
  if(r3.ghost&&!R3.ghostOn)r3.ghost.visible=false;
  r3.rd.render(r3.scene,r3.camera);R3.ghostOn=false;
}
/* Höhe einer Figur/eines Gebäudes über dem Boden in Spielpixeln (für Lebensbalken, Marker) */
function entH(e){
  if(e.kind==='unit'){const t=e.type,d=UNITS[t];return d.naval?(t==='galleon'?55:40):t==='knight'?46:d.siege?(t==='ram'?30:34):e.r/7*25}
  if(e.kind==='bld'){const o=R3.reg.get(entKey(e,false));return o&&o.obj.userData.h?o.obj.userData.h*R3.S:e.r*2.4}
  if(e.kind==='animal')return ANIMALS[e.type].h||26;
  return e.r*({tree:3.6,bush:1.5,stone:1.1,iron:1.1,gold:1.1}[e.type]||1)}
