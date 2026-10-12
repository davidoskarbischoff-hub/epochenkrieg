/* Epochenkrieg – Gelände und Wegfindung.
   Gelände: Raster mit 20-px-Feldern (TERR): 0 = tiefes Wasser, 1 = flaches Wasser, 2 = Land, 3 = Fels/Berg (für alle unpassierbar, nichts baubar).
   Wegfindung: feineres Raster mit 10-px-Feldern; Gebäude und Ressourcen blockieren, tiefes Wasser blockiert Landeinheiten,
   Land blockiert Schiffe. Gesucht wird mit A*. */
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TG=20,TW=W/TG,TH=H/TG;
let TERR=null,MAINLAND=null;

/* ---------- Gelände erzeugen ---------- */
/* Kartenarten: mid/ends = Breite der Landzunge in der Mitte und an den Enden, amp = Unregelmäßigkeit, full = nur Land, mount = Berge, cliff = Klippen an der Küste (Zugänge nur an Lücken), bank = Sandbänke */
const MAPS={
  coast:{name:'Küste und Landzunge',desc:'Geschwungene Küste, Hügel, Plateaus, Fischgründe',mid:820,ends:1450,amp:1.25,wind:.8,plat:.55,bank:.6,mount:1,cliff:0,lakes:1.1,mthr0:0.62},
  land:{name:'Festland',desc:'Nur Land mit Hügeln und Plateaus, kein Meer',full:1,amp:1,plat:.65,bank:.6,mount:1,cliff:0,mthr0:0.58},
  lakes:{name:'Seenplatte',desc:'Viele Seen und Teiche, Fische im Binnenland',full:1,amp:1,plat:.4,bank:.6,mount:1,cliff:0,lakes:1.7,mthr0:0.62},
  mountains:{name:'Bergland',desc:'Hohe Berge und Klippen, Häfen nur an Zugängen',mid:760,ends:1350,amp:1.15,wind:.7,plat:.3,bank:.6,mount:1,cliff:1,lakes:.9},
  river:{name:'Flusstal',desc:'Ein Fluss trennt die Basen, nur wenige Furten führen hinüber',full:1,amp:1,plat:.5,bank:.6,mount:1,cliff:0,river:1,mthr0:0.62},
  pass:{name:'Gebirgspass',desc:'Bergmassiv mit engen Pässen als Engstellen',full:1,amp:1,plat:.2,bank:.6,mount:1,cliff:0,mthr0:.4},
  bay:{name:'Große Bucht',desc:'Viel Wasser, breite Landbrücke',mid:600,ends:1250,amp:1,wind:1,plat:.45,bank:.5,mount:1,cliff:0,lakes:.8,mthr0:0.62},
};
/* Höhenfeld (HL, in Einheiten à 10 px, pro Gelände-Feld), Abstand zur Küste (DSEA), Startpunkt des Hauptlandes (MAINPT) */
let HL=null,DSEA=null,MAINPT=null;
const sm3=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function vnoise(R,gw,gh){const g=[];for(let i=0;i<(gw+1)*(gh+1);i++)g.push(R());
  return(x,y)=>{const fx=Math.max(0,Math.min(gw-1e-6,x/W*gw)),fy=Math.max(0,Math.min(gh-1e-6,y/H*gh)),ix=Math.floor(fx),iy=Math.floor(fy);let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);
    const a=g[iy*(gw+1)+ix],b=g[iy*(gw+1)+ix+1],c=g[(iy+1)*(gw+1)+ix],d=g[(iy+1)*(gw+1)+ix+1];return(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty}}
/* nächstes Landfeld zu einem Punkt (Spiralsuche) */
function walkNear(x,y){const cx=Math.max(0,Math.min(TW-1,(x/TG)|0)),cy=Math.max(0,Math.min(TH-1,(y/TG)|0));
  for(let r=0;r<60;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;if(TERR[ny*TW+nx]===2)return ny*TW+nx}
  return cy*TW+cx}
/* Höhe an einem Spielpunkt (bilinear aus dem Höhenfeld) */
function hlAt(x,y){if(!HL)return 0;const fx=Math.max(0,Math.min(TW-1.001,x/TG-.5)),fy=Math.max(0,Math.min(TH-1.001,y/TG-.5)),ix=fx|0,iy=fy|0,tx=fx-ix,ty=fy-iy;
  return(HL[iy*TW+ix]*(1-tx)+HL[iy*TW+ix+1]*tx)*(1-ty)+(HL[(iy+1)*TW+ix]*(1-tx)+HL[(iy+1)*TW+ix+1]*tx)*ty}
const slopeNear=(x,y,r)=>Math.max(Math.abs(hlAt(x+r,y)-hlAt(x-r,y)),Math.abs(hlAt(x,y+r)-hlAt(x,y-r)));
function genTerrain(seed,mapId){
  const cfg=MAPS[mapId]||MAPS.coast;
  const R=mulberry(seed+7);
  const mk=(gw,gh)=>{const g=[];for(let i=0;i<(gw+1)*(gh+1);i++)g.push(R());
    return(x,y)=>{const fx=Math.max(0,Math.min(gw-1e-6,x/W*gw)),fy=Math.max(0,Math.min(gh-1e-6,y/H*gh));const ix=Math.floor(fx),iy=Math.floor(fy);
      let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const a=g[iy*(gw+1)+ix],b=g[iy*(gw+1)+ix+1],c=g[(iy+1)*(gw+1)+ix],d=g[(iy+1)*(gw+1)+ix+1];
      return(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty}};
  const n1=mk(9,6),n2=mk(18,12),n3=mk(14,9),n4=mk(11,7),n5=mk(22,15),n6=mk(16,11),n7=mk(7,5);
  // punktsymmetrisch, damit beide Seiten gleich fair sind
  const sym=(f,x,y)=>(f(x,y)+f(W-x,H-y))/2;
  const L=Math.hypot(W,H);
  TERR=new Uint8Array(TW*TH);
  const land=new Uint8Array(TW*TH),riverM=new Uint8Array(TW*TH);
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const px=(x+.5)*TG,py=(y+.5)*TG;
    const pp0=(H*px+W*py-W*H)/L,t=(px*W+(H-py)*H)/(L*L),pp=pp0-(cfg.wind||0)*(Math.sin((t-.5)*9.42)*430+Math.sin((t-.5)*22)*150);
    const w=cfg.full?3000:cfg.mid+(cfg.ends-cfg.mid)*Math.pow(Math.abs(t-.5)*2,1.4);
    const noise=((sym(n1,px,py)-.5)*400+(sym(n2,px,py)-.5)*140)*cfg.amp;
    const edge=Math.min(px,py,W-px,H-py),fall=Math.max(0,320-edge)*4.5; // Wasserrand rundum
    land[y*TW+x]=w+noise-Math.abs(pp)-fall>0?1:0;
    if(cfg.river&&land[y*TW+x]){ /* Fluss quer zur Verbindungslinie der Basen, punktsymmetrisch, mit Furten (Land) in der Mitte und bei ±820 */
      const u=(t-.5)*L,v=pp0,s=Math.sin(v*.0042)*170+Math.sin(v*.011+1.3)*55;
      if(Math.abs(u-s)<80&&Math.abs(v)>95&&Math.abs(Math.abs(v)-820)>95){land[y*TW+x]=0;riverM[y*TW+x]=1}}}
  // Seen und Teiche im Landesinneren (punktsymmetrisch, Basen und Landverbindung bleiben frei)
  if(cfg.lakes){
    const A={x:W*.17,y:H*.83},B={x:W-A.x,y:H-A.y},base=land.slice();let thr=.66-.08*cfg.lakes;
    const lakeAt=(px,py,thr)=>{const v=sym(n6,px,py)*.65+sym(n7,px,py)*.35;return v>thr&&Math.hypot(px-A.x,py-A.y)>420&&Math.hypot(px-B.x,py-B.y)>420};
    for(let k=0;k<10;k++,thr+=.02){
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;land[i]=base[i]&&!lakeAt((x+.5)*TG,(y+.5)*TG,thr)?1:0}
      const seen=new Uint8Array(TW*TH),st=[Math.floor(A.y/TG)*TW+Math.floor(A.x/TG)],tg=Math.floor(B.y/TG)*TW+Math.floor(B.x/TG);seen[st[0]]=1;let ok=false;
      while(st.length&&!ok){const i=st.pop();if(i===tg){ok=true;break}const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(!seen[j]&&land[j]){seen[j]=1;st.push(j)}}}
      if(ok)break;if(k===9)land.set(base)}
  }
  // flaches Wasser: Küstenstreifen (Abstand zum Land) plus Sandbänke
  const dist=new Int16Array(TW*TH).fill(-1),q=[];
  for(let i=0;i<land.length;i++)if(land[i]){dist[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const i=q[h],x=i%TW,y=(i/TW)|0;if(dist[i]>=9)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(dist[j]<0){dist[j]=dist[i]+1;q.push(j)}}}
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x,px=(x+.5)*TG,py=(y+.5)*TG;
    if(land[i]){TERR[i]=2;continue}
    const bank=sym(n3,px,py)>cfg.bank&&dist[i]>=0&&dist[i]<=9;
    TERR[i]=(dist[i]>=0&&dist[i]<=3)||bank?1:0;if(riverM[i])TERR[i]=1}
  // Berge (unpassierbar) und Klippen an der Küste (Zugang zum Wasser nur an Lücken, dort können Häfen stehen)
  const cliffMask=new Uint8Array(TW*TH);let mthr=9;
  if(cfg.mount||cfg.cliff){
    const a0={x:W*.17,y:H*.83},b0={x:W-a0.x,y:H-a0.y},cliffs=cliffMask;
    if(cfg.cliff)for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(TERR[i]!==2)continue;let near=false;for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;if(TERR[ny*TW+nx]<2){near=true;break}}
      if(near&&sym(n5,(x+.5)*TG,(y+.5)*TG)<.58)cliffs[i]=1}
    const passable=a=>{const seen=new Uint8Array(TW*TH),st=[walkNear(a0.x,a0.y)];
      /* Engstellen müssen auch für Einheiten breit genug sein: Felder bis 2 Felder neben Fels zählen nicht als frei */
      const hz=new Uint8Array(TW*TH),er=new Uint8Array(TW*TH);
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let v=0;for(let d=-2;d<=2&&!v;d++){const nx=x+d;if(nx>=0&&nx<TW&&a[y*TW+nx]===3)v=1}hz[y*TW+x]=v}
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let v=0;for(let d=-2;d<=2&&!v;d++){const ny=y+d;if(ny>=0&&ny<TH&&hz[ny*TW+x])v=1}er[y*TW+x]=!v&&(a[y*TW+x]===2||a[y*TW+x]===1)?1:0}seen[st[0]]=1;const tgt=walkNear(b0.x,b0.y);
      while(st.length){const i=st.pop();if(i===tgt)return true;const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(!seen[j]&&er[j]){seen[j]=1;st.push(j)}}}return false};
    let thr=cfg.mthr0||.54,ok=false;const base=TERR.slice();
    for(let k=0;k<8&&!ok;k++,thr+=.04){const T=base.slice();
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(T[i]!==2)continue;const px=(x+.5)*TG,py=(y+.5)*TG;
        if(cfg.cliff&&cliffs[i]){T[i]=3;continue}
        if(cfg.mount&&sym(n4,px,py)>thr&&Math.hypot(px-a0.x,py-a0.y)>850&&Math.hypot(px-b0.x,py-b0.y)>850)T[i]=3}
      if(passable(T)){TERR.set(T);ok=true;mthr=thr}}
  }
  // Höhenfeld: sanfte Hügel im Inland, Berge als breite Rücken, Klippen an der Küste hoch, Strand niedrig
  DSEA=new Int16Array(TW*TH).fill(99);{const qq=[];for(let i=0;i<TERR.length;i++)if(TERR[i]<2){DSEA[i]=0;qq.push(i)}
    for(let h=0;h<qq.length;h++){const i=qq[h],x=i%TW,y=(i/TW)|0;if(DSEA[i]>=8)continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(DSEA[j]>DSEA[i]+1){DSEA[j]=DSEA[i]+1;qq.push(j)}}}}
  HL=new Float32Array(TW*TH);
  {const a0={x:W*.17,y:H*.83},b0={x:W-a0.x,y:H-a0.y};
    for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(TERR[i]<2){HL[i]=.12;continue}
      const px=(x+.5)*TG,py=(y+.5)*TG,inl=sm3(1,6,DSEA[i]);
      let h=.12+((sym(n1,px,py)-.5)*2.0+(sym(n2,px,py)-.5)*1.0+(sym(n5,px,py)-.5)*.5)*inl;
      if(cfg.mount&&Math.hypot(px-a0.x,py-a0.y)>850&&Math.hypot(px-b0.x,py-b0.y)>850){const nv=sym(n4,px,py),mt=sm3(mthr-.11,mthr+.07,nv),raw=(4.6*mt+16*Math.max(0,nv-mthr-.07)+3.4*mt*(1-Math.abs(sym(n6,px,py)*2-1))+2.2*mt*(sym(n2,px,py)-.5))*inl,st=2.1,f=Math.floor(raw/st),r=raw/st-f; /* sechs Stufen: Terrassen mit steilen Absätzen */
      h+=1.5*st*(f+sm3(.62,.95,r))}
      if(cliffMask[i])h+=1.9;
      HL[i]=h}}
  computeMainland();
}
/* Kleinere Spielfelder: ausserhalb eines mittigen Rechtecks (Anteil f der Karte) steigt ein Randgebirge auf (TERR 3, hoch, unpassierbar) */
let playF=1;
function applyPlayRect(f){
  if(f>=.999)return;const hx=W*f/2,hy=H*f/2,cx=W/2,cy=H/2,SOFT=200,
    /* gewellter Rand (punktsymmetrisch wie die Karte): keine schnurgerade Gebirgskante */wv=(x,y)=>Math.sin(x*.0047+y*.0031)*55+Math.sin(x*.0113-y*.0087+1.7)*30+Math.sin(y*.019+x*.004)*14,wob=(x,y)=>(wv(x,y)+wv(W-x,H-y))/2;
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x,px=(x+.5)*TG,py=(y+.5)*TG,o=Math.max(Math.abs(px-cx)-hx,Math.abs(py-cy)-hy)+wob(px,py);
    if(o>-TG*.5){TERR[i]=3;const k=sm3(0,SOFT,o+TG*.5);HL[i]=Math.max(HL[i],.9+5.8*k+.35*Math.sin(px*.021+py*.017))}
    else if(o>-SOFT&&TERR[i]===2){HL[i]+=2.2*sm3(-SOFT,0,o)}}
  computeMainland()}
/* Relief nach der Wahl der Startplätze: abgerundete Hügel unter den Basen, Plateaus mit steilen Klippen (TERR 3) und Rampen dazwischen */
function genRelief(A,B,seed,mapId){
  const cfg=MAPS[mapId]||MAPS.coast,R=mulberry(seed+4141),nP=vnoise(R,8,5),nR=vnoise(R,26,17),sym=(f,x,y)=>(f(x,y)+f(W-x,H-y))/2;
  MAINPT=A;
  const RD=680;
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(TERR[i]<2)continue;const px=(x+.5)*TG,py=(y+.5)*TG,d=Math.min(Math.hypot(px-A.x,py-A.y),Math.hypot(px-B.x,py-B.y));
    if(d<RD)HL[i]+=2.0*sm3(RD,RD*.38,d)*sm3(1,5,DSEA[i])}
  if(cfg.plat){
    const thr=.665-.1*cfg.plat,T0=TERR.slice(),H0=HL.slice();
    const connected=()=>{const seen=new Uint8Array(TW*TH),st=[walkNear(A.x,A.y)],tgt=walkNear(B.x,B.y);seen[st[0]]=1;
      while(st.length){const i=st.pop();if(i===tgt)return true;const x=i%TW,y=(i/TW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(!seen[j]&&TERR[j]>=1&&TERR[j]<=2){seen[j]=1;st.push(j)}}}return false};
    for(let k=0;k<8;k++){
      const rampT=.58-.05*k;TERR.set(T0);HL.set(H0);
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(T0[i]!==2)continue;const px=(x+.5)*TG,py=(y+.5)*TG;
        if(Math.hypot(px-A.x,py-A.y)<800||Math.hypot(px-B.x,py-B.y)<800)continue;
        const P=sym(nP,px,py);if(P<thr-.2)continue;
        const rn=sym(nR,px,py),w=.016+.15*sm3(rampT-.08,rampT+.1,rn),inl=sm3(1,6,DSEA[i]);
        HL[i]+=3.0*sm3(thr-w,thr+w,P)*inl;
        if(w<.05&&Math.abs(P-thr)<.034&&DSEA[i]>=3)TERR[i]=3}
      if(connected())break}
  }
  computeMainland();
}
/* Kleines Vorschaubild einer Karte (für Auswahl und Lobby): Gelände einer Beispiel-Karte als Bild */
const _mpCache={};
function mapPreview(id){
  if(_mpCache[id])return _mpCache[id];
  const sT=TERR,sM=MAINLAND,sH=HL,sD=DSEA,sP=MAINPT;MAINPT=null;genTerrain(11,id);
  const c=document.createElement('canvas');c.width=TW;c.height=TH;const x=c.getContext('2d'),im=x.createImageData(TW,TH);
  /* Farben wie im Spiel: Wasser nach Tiefe, Land nach Höhe (Wiese → Hügel → Fels → Schnee), dazu Hangschatten von Nordwest */
  const lerp=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t),hl=i=>Math.max(0,HL[i]||0);
  for(let i=0;i<TW*TH;i++){const t=TERR[i],cx=i%TW,cy=(i/TW)|0,j=i*4;let k;
    if(t===0)k=[26,64,96];else if(t===1)k=[58,128,148];
    else{const h=hl(i);k=t===2?(h<1?[98,138,62]:h<3?lerp([98,138,62],[120,128,70],(h-1)/2):lerp([120,128,70],[132,120,96],Math.min(1,(h-3)/4))):h>=12?lerp([205,210,214],[240,244,248],Math.min(1,(h-12)/4)):lerp([118,112,104],[150,144,136],Math.min(1,h/11));
      if(cx>0&&cy>0){const d=hl(i)-hl(i-TW-1);k=k.map(v=>v+Math.max(-34,Math.min(34,d*9)))}}
    im.data[j]=k[0];im.data[j+1]=k[1];im.data[j+2]=k[2];im.data[j+3]=255}
  x.putImageData(im,0,0);
  x.fillStyle='#4a8fe0';x.strokeStyle='#10202f';x.lineWidth=1;for(const[px,py,cl]of[[.17,.83,'#4a8fe0'],[.83,.17,'#e0533c']]){x.fillStyle=cl;x.beginPath();x.arc(px*TW,py*TH,4,0,6.283);x.fill();x.stroke()}
  TERR=sT;MAINLAND=sM;HL=sH;DSEA=sD;MAINPT=sP;return _mpCache[id]=c.toDataURL()}
/* Landfelder, die vom Hauptland aus erreichbar sind (kleine Inseln zählen nicht), merken */
function computeMainland(){
  MAINLAND=new Uint8Array(TW*TH);
  const p=MAINPT||{x:W*.17,y:H*.83},st=[walkNear(p.x,p.y)];MAINLAND[st[0]]=1;
  while(st.length){const i=st.pop(),x=i%TW,y=(i/TW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(!MAINLAND[j]&&TERR[j]===2){MAINLAND[j]=1;st.push(j)}}}
}
/* Klippen rund um einen Punkt (Basis) öffnen, damit dort immer ein Hafen möglich ist */
function carveCoast(x,y,r){
  for(let cy=Math.max(0,Math.floor((y-r)/TG));cy<=Math.min(TH-1,Math.floor((y+r)/TG));cy++)for(let cx=Math.max(0,Math.floor((x-r)/TG));cx<=Math.min(TW-1,Math.floor((x+r)/TG));cx++){
    const i=cy*TW+cx;if(TERR[i]!==3||Math.hypot((cx+.5)*TG-x,(cy+.5)*TG-y)>r)continue;let wet=false;
    for(let dy=-3;dy<=3&&!wet;dy++)for(let dx=-3;dx<=3;dx++){const nx=cx+dx,ny=cy+dy;if(nx>=0&&ny>=0&&nx<TW&&ny<TH&&TERR[ny*TW+nx]<2){wet=true;break}}
    if(wet){TERR[i]=2;if(HL)HL[i]=.3}}
  computeMainland()}
function terrAt(x,y){const cx=Math.max(0,Math.min(TW-1,(x/TG)|0)),cy=Math.max(0,Math.min(TH-1,(y/TG)|0));return TERR[cy*TW+cx]}
const onLand=(x,y)=>terrAt(x,y)===2;

/* ---------- Wegfindung ---------- */
const NS=10,NW=W/NS,NH=H/NS;
let navT=null,navDyn=null;
const navSeen=new Uint32Array(NW*NH),navG=new Float32Array(NW*NH),navPar=new Int32Array(NW*NH);let navGen=0;
function navInit(){navT=new Uint8Array(NW*NH);navDyn=new Uint8Array(NW*NH);
  for(let y=0;y<NH;y++)for(let x=0;x<NW;x++)navT[y*NW+x]=terrAt((x+.5)*NS,(y+.5)*NS)}
/* Gebäude und feste Ressourcen blockieren die Felder in ihrem Umkreis (+5 für die Breite der Einheiten).
   navVer zählt jede Änderung am Raster mit (für gemerkte Ergebnisse wie nodeOpen). */
let navVer=0;
function navStamp(e,sign){const r=e.r+5,x0=Math.max(0,Math.floor((e.x-r)/NS)),x1=Math.min(NW-1,Math.floor((e.x+r)/NS)),y0=Math.max(0,Math.floor((e.y-r)/NS)),y1=Math.min(NH-1,Math.floor((e.y+r)/NS));navVer++;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=(x+.5)*NS-e.x,dy=(y+.5)*NS-e.y;if(dx*dx+dy*dy<=r*r)navDyn[y*NW+x]+=sign}}
const navOpen=(i,naval)=>navDyn[i]===0&&(naval==='dry'?navT[i]===2:naval?navT[i]<=1:(navT[i]===1||navT[i]===2)); /* 'dry' = nur festes Land (Loren) */
const navCell=(x,y)=>Math.max(0,Math.min(NH-1,(y/NS)|0))*NW+Math.max(0,Math.min(NW-1,(x/NS)|0));
/* Dichter Wald: Fällen kann man nur Bäume am Waldrand. Ein Baum ist "offen", wenn ein freies Feld in Arbeiter-Reichweite liegt
   (so weit, wie die Wegsuche einen Arbeiter heranführt) und dieses Feld zu einem grösseren freien Gebiet gehört (keine
   eingeschlossene Lücke mitten im Wald). Stirbt ein Randbaum, werden seine Felder frei und der Baum dahinter wird offen.
   Das Ergebnis wird je Baum gemerkt, bis sich das Raster ändert, höchstens aber 1 s Spielzeit lang (billig, wird oft gefragt). */
const OPEN_ROOM=40,_opSeen=new Uint32Array(NW*NH),_opQ=new Int32Array(OPEN_ROOM+8);let _opGen=0;
function _opRoom(i){ /* begrenzte Flutfüllung: hängt Feld i an mindestens OPEN_ROOM freien Feldern? */
  if(++_opGen>=4294967295){_opGen=1;_opSeen.fill(0)}const g=_opGen;let h=0,t=0;_opQ[t++]=i;_opSeen[i]=g;
  while(h<t){if(t>=OPEN_ROOM)return true;const c=_opQ[h++],x=c%NW;
    for(const j of[x>0?c-1:-1,x<NW-1?c+1:-1,c>=NW?c-NW:-1,c+NW<NW*NH?c+NW:-1]){if(j<0||_opSeen[j]===g||!navOpen(j,false))continue;_opSeen[j]=g;_opQ[t++]=j;if(t>=OPEN_ROOM)return true}}
  return false}
function nodeOpen(n){
  if(!n||n.kind!=='node'||n.sea||n.type!=='tree'||!navDyn)return true;
  const t=G?G.t:0;if(n._opV===navVer||(n._opT!==undefined&&t>=n._opT&&t-n._opT<1))return n._op;
  n._opV=navVer;n._opT=t;
  const R=(n.r+10)/NS+.5,gx=n.x/NS,gy=n.y/NS,x0=Math.max(0,Math.floor(gx-R)),x1=Math.min(NW-1,Math.floor(gx+R)),y0=Math.max(0,Math.floor(gy-R)),y1=Math.min(NH-1,Math.floor(gy+R));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*NW+x;if(!navOpen(i,false))continue;const dx=Math.abs(x+.5-gx),dy=Math.abs(y+.5-gy);
    if(Math.max(dx,dy)+.4142*Math.min(dx,dy)<=R&&_opRoom(i))return n._op=true}
  return n._op=false}
/* Gelände allein (ohne Gebäude): darf diese Einheit hier stehen? */
function terrOk(x,y,naval){const t=terrAt(x,y);return naval==='dry'?t===2:naval?t<=1:(t===1||t===2)}
/* Freie Sicht zwischen zwei Punkten bis zur Länge 'len'? Felder nahe am Start zählen nicht (Start darf im Rand eines Hindernisses liegen) */
function navLos(x0,y0,x1,y1,naval,len){
  const dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy);if(d<1)return true;const L=Math.min(d,len===undefined?d:len);
  for(let s=4;s<=L;s+=4){const x=x0+dx/d*s,y=y0+dy/d*s;if(s>10&&!navOpen(navCell(x,y),naval))return false;if(!terrOk(x,y,naval))return false}
  return true}
/* Entfernungsfeld (Dijkstra vom Ziel aus über die ganze Karte): für weite Wege, bei denen A* an die Suchgrenze stösst.
   Gemerkt je Zielgebiet (150-px-Raster, Gruppen mit gestreuten Zielen teilen sich ein Feld), Zielradius und Einheitenart; 6 Felder, neu nach Rasteränderung frühestens nach 15 s. */
const navFields=[];let navFieldT=-1;
function navField(tx,ty,goalR,naval,peek){
  const kx=Math.round(tx/150),ky=Math.round(ty/150),key=kx+','+ky+','+Math.round(goalR/20)+','+naval;
  const now=typeof G!=='undefined'&&G?G.t:0;
  let f=navFields.find(o=>o.key===key);
  if(f&&(f.ver===navVer||now-f.t<15)){f.use=now;return f}
  if(peek)return null;if(navFieldT===now)return f||null; /* höchstens ein Neuaufbau je Spielschritt (sonst Ruckler), solange reicht das alte Feld */
  if(navFieldT===now)return null;navFieldT=now;
  if(!f){if(navFields.length>=6){navFields.sort((a,b)=>a.use-b.use);f=navFields.shift();f.key=key}else f={key,d:new Float32Array(NW*NH)};navFields.push(f)}
  f.ver=navVer;f.t=f.use=now;const d=f.d;d.fill(1e9);
  const gx=tx/NS,gy=ty/NS,gr=Math.min(8,goalR/NS+.5),R=Math.ceil(gr)+1;let hn=0;
  const push=(i,v)=>{if(hn>=NHI.length){const a=new Int32Array(hn*2),b=new Float32Array(hn*2);a.set(NHI);b.set(NHF);NHI=a;NHF=b}let k=hn++;while(k>0){const q=(k-1)>>1;if(NHF[q]<=v)break;NHI[k]=NHI[q];NHF[k]=NHF[q];k=q}NHI[k]=i;NHF[k]=v};
  const pop=()=>{const r=NHI[0];hn--;if(hn>0){const li=NHI[hn],lf=NHF[hn];let k=0;for(;;){const l=2*k+1;if(l>=hn)break;let m=l;if(l+1<hn&&NHF[l+1]<NHF[l])m=l+1;if(NHF[m]>=lf)break;NHI[k]=NHI[m];NHF[k]=NHF[m];k=m}NHI[k]=li;NHF[k]=lf}return r};
  const cx=gx|0,cy=gy|0,near=j=>Math.abs(j%NW-cx)<=R+2&&Math.abs(((j/NW)|0)-cy)<=R+2; /* Ziel im Gebäude: Felder direkt am Ziel zählen als offen */
  for(let r=gr;!hn&&r<=gr+24;r+=3)for(let y=Math.max(0,cy-Math.ceil(r));y<=Math.min(NH-1,cy+Math.ceil(r));y++)for(let x=Math.max(0,cx-Math.ceil(r));x<=Math.min(NW-1,cx+Math.ceil(r));x++){const j=y*NW+x;if(Math.hypot(x+.5-gx,y+.5-gy)<=r&&(r===gr?terrOk((x+.5)*NS,(y+.5)*NS,naval):navOpen(j,naval))){d[j]=0;push(j,0)}} /* Ziel im Fels/Wasser: nächstgelegene freie Felder */
  const ok=j=>navOpen(j,naval)||(near(j)&&terrOk((j%NW+.5)*NS,(((j/NW)|0)+.5)*NS,naval));
  while(hn){const v=NHF[0],i=pop();if(v>d[i])continue;const x=i%NW,y=(i/NW)|0;
    for(let k=0;k<8;k++){const nx=x+NDX[k],ny=y+NDY[k];if(nx<0||ny<0||nx>=NW||ny>=NH)continue;const j=ny*NW+nx;if(!ok(j))continue;
      if(k>=4&&(!ok(y*NW+nx)||!ok(ny*NW+x)))continue;const g=v+(k<4?1:1.4142);if(g<d[j]){d[j]=g;push(j,g)}}}
  return f}
/* A*: Weg von (sx,sy) bis auf 'goalR' Abstand an (tx,ty). Gibt eine Liste von Wegpunkten zurück, oder null.
   'seed' != 0 würfelt die Kosten leicht, damit festgefahrene Einheiten einen anderen Weg nehmen. */
let navCl=null;
const NDX=[1,-1,0,0,1,1,-1,-1],NDY=[0,0,1,-1,1,-1,1,-1];let NHI=new Int32Array(4096),NHF=new Float32Array(4096); /* Wegsuche: feste Felder statt neuer Arrays je Schritt (schneller) */
function navPath(sx,sy,tx,ty,goalR,naval,seed){
  const s=navCell(sx,sy);navGen++;
  const gx=tx/NS,gy=ty/NS,gr=goalR/NS;
  const hx=(i)=>{const dx=Math.abs((i%NW)+.5-gx),dy=Math.abs(((i/NW)|0)+.5-gy);return(Math.max(dx,dy)+.4142*Math.min(dx,dy))-gr};
  let hn=0;
  const push=(i,f)=>{if(hn>=NHI.length){const a=new Int32Array(hn*2),b=new Float32Array(hn*2);a.set(NHI);b.set(NHF);NHI=a;NHF=b}let k=hn++;while(k>0){const q=(k-1)>>1;if(NHF[q]<=f)break;NHI[k]=NHI[q];NHF[k]=NHF[q];k=q}NHI[k]=i;NHF[k]=f};
  const pop=()=>{const r=NHI[0];hn--;if(hn>0){const li=NHI[hn],lf=NHF[hn];let k=0;for(;;){const l=2*k+1;if(l>=hn)break;let m=l;if(l+1<hn&&NHF[l+1]<NHF[l])m=l+1;if(NHF[m]>=lf)break;NHI[k]=NHI[m];NHF[k]=NHF[m];k=m}NHI[k]=li;NHF[k]=lf}return r};
  if(!navCl||navCl.length!==NW*NH)navCl=new Uint32Array(NW*NH);
  /* Start im Rand eines Gebäudes (z. B. Boot am Hafen): nur wenn das Startfeld selbst blockiert ist, zählt in den ersten Feldern um den Start nur das Gelände */
  const sx0=s%NW,sy0=(s/NW)|0,sIn=!navOpen(s,naval),op=j=>navOpen(j,naval)||(sIn&&Math.max(Math.abs(j%NW-sx0),Math.abs(((j/NW)|0)-sy0))<=6&&terrOk((j%NW+.5)*NS,(((j/NW)|0)+.5)*NS,naval));
  navSeen[s]=navGen;navG[s]=0;navPar[s]=-1;push(s,hx(s));
  let goal=-1,n=0,best=s,bestH=hx(s);const cap=Math.min(NW*NH,14000); /* Suchgrenze: unerreichbare Ziele durchsuchen nicht mehr die ganze Karte */
  const hf=Math.hypot(tx-sx,ty-sy)>600&&navField(tx,ty,goalR,naval,1),hot=hf&&(hf.d[s]<1e8||sIn); /* Gruppe: Feld zum selben Ziel liegt schon vor -> keine A*-Suche nötig */
  while(!hot&&hn&&n++<cap){
    const i=pop();if(navCl[i]===navGen)continue;navCl[i]=navGen; // schon abgearbeitet (veralteter Eintrag)
    const x=i%NW,y=(i/NW)|0,h=hx(i);
    if(h<bestH){bestH=h;best=i}
    if(h<=0.5&&(i===s||navOpen(i,naval))){goal=i;break}
    for(let k=0;k<8;k++){const dx=NDX[k],dy=NDY[k];
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=NW||ny>=NH)continue;const j=ny*NW+nx;if(navCl[j]===navGen||!op(j))continue;
      if(k>=4&&(!op(y*NW+nx)||!op(ny*NW+x)))continue; // keine Ecken schneiden
      let c=k<4?1:1.4142;if(seed)c*=1+((((j*2654435761)^(seed*40503))>>>0)%100)/100*1.4;
      const g=navG[i]+c;if(navSeen[j]!==navGen||g<navG[j]){navSeen[j]=navGen;navG[j]=g;navPar[j]=i;push(j,g+hx(j))}}
  }
  let cells=[];
  if(goal<0){ /* Suchgrenze erreicht (lange Wege, Buchten, Seen): Entfernungsfeld vom Ziel aus (einmal je Ziel, für die ganze Gruppe gemerkt) */
    const fl=hot?hf:navField(tx,ty,goalR,naval);let i=s,nb=-1;
    if(!fl){if(best===s)return[{x:sx,y:sy}];for(let i=best;i>=0;i=navPar[i])cells.push(i);cells.reverse()} /* Feld kommt im nächsten Schritt: so lange Teilweg */
    else{if(fl.d[s]>=1e8&&sIn){let bd=1e8;for(let y=Math.max(0,sy0-6);y<=Math.min(NH-1,sy0+6);y++)for(let x=Math.max(0,sx0-6);x<=Math.min(NW-1,sx0+6);x++){const j=y*NW+x,v=fl.d[j]+Math.hypot(x-sx0,y-sy0);if(v<bd){bd=v;i=j}}} /* Start im Gebäuderand */
    if(fl.d[i]<1e8){cells.push(s);for(let k=0;k<4000&&fl.d[i]>0;k++){const x=i%NW,y=(i/NW)|0;nb=-1;let bd=fl.d[i];
        for(let q=0;q<8;q++){const nx=x+NDX[q],ny=y+NDY[q];if(nx<0||ny<0||nx>=NW||ny>=NH)continue;const j=ny*NW+nx;if(fl.d[j]<bd){bd=fl.d[j];nb=j}}
        if(nb<0)break;i=nb;cells.push(i)}}
    else{if(best===s)return null;for(let i=best;i>=0;i=navPar[i])cells.push(i);cells.reverse()}} // unerreichbar: bis zum nächstgelegenen Punkt
  }else{for(let i=goal;i>=0;i=navPar[i])cells.push(i);cells.reverse()}
  let pts=cells.map(i=>({x:(i%NW+.5)*NS,y:(((i/NW)|0)+.5)*NS}));
  // Weg glätten: Zwischenpunkte weglassen, wenn man direkt hinüberlaufen kann
  const out=[];let a=0;
  while(a<pts.length-1){let b=Math.min(pts.length-1,a+60);while(b>a+1&&!navLos(pts[a].x,pts[a].y,pts[b].x,pts[b].y,naval))b--;out.push(pts[b]);a=b}
  return out;
}
