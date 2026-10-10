/* Epochenkrieg – Entitäten (Einheiten, Gebäude, Ressourcen) und Kartengenerierung.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- entities ---------- */
function reg(e){G.ents.push(e);G.byId.set(e.id,e);if(e.kind==='bld'||(e.kind==='node'&&!e.sea))navStamp(e,1);return e}
function addUnit(type,team,x,y,fid){const d=UNITS[type],lvl=G.epoch[team],hp=unitHp(team,type,lvl);return reg({id:fid!==undefined?fid:G.nid++,kind:'unit',type,team,x,y,r:d.r,lvl,hp,maxHp:hp,state:'idle',cd:0,carry:0,ctype:null,rtype:null,tid:null,dest:null,amove:null,fa:team===0?-1.57:1.57})}
function addBld(type,team,x,y,built,fid){const d=BLDS[type],lvl=G.epoch[team],mh=Math.round(d.hp*LVL.bhp[lvl]);return reg({id:fid!==undefined?fid:G.nid++,kind:'bld',type,team,x,y,r:d.r,lvl,maxHp:mh,hp:built?mh:1,built,prog:built?1:0,queue:[],rally:null,cd:0})}
function addAnimal(type,x,y,fid){const d=ANIMALS[type];return reg({id:fid!==undefined?fid:G.nid++,kind:'animal',type,team:-1,x,y,r:d.r,hp:d.hp,maxHp:d.hp,lvl:0,state:'idle',cd:0,home:{x,y},fa:Math.random()*6.283,wt:Math.random()*4})}
function addNode(type,x,y){const d=NODES[type];return reg({id:G.nid++,kind:'node',type,team:-1,x,y,r:d.r,rt:d.rt,sea:!!d.sea,amount:d.amt,maxAmt:d.amt,regen:d.regen||0,seed:Math.random()})}
const rn=r=>tr(RN[r]);
function get(id){const e=G.byId.get(id);return e&&!e.dead?e:null}
function nameOf(e){return e.kind==='animal'?tr(ANIMALS[e.type].name):e.kind==='unit'?tr(UNITS[e.type].name):e.kind==='bld'?tr(BLDS[e.type].name):tr(NODES[e.type].name)}

/* ---------- map ---------- */
function genMap(seed){
  const R=mulberry(seed);
  // Ein Platz taugt nur, wenn rundherum Land des Hauptlandes ist
  const okSpot=(x,y,r)=>{if(x<24||y<24||x>W-24||y>H-24)return false;for(let k=0;k<8;k++){const a=k*.785,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(px<10||py<10||px>W-10||py>H-10||!onLand(px,py))return false}const c=Math.max(0,Math.min(TH-1,(y/TG)|0))*TW+Math.max(0,Math.min(TW-1,(x/TG)|0));return MAINLAND[c]===1};
  // Basis A: auf der Diagonale, möglichst nah an der Küste (Hafen soll früh erreichbar sein)
  const Ld=Math.hypot(W,H),nx=H/Ld,ny=W/Ld;let A=null;
  for(let pp=700;pp>=0&&!A;pp-=20){const c={x:.17*W+nx*pp,y:.83*H+ny*pp};if(okSpot(c.x,c.y,175))A=c}
  if(!A)A={x:.17*W,y:.83*H};
  const bases=[{x:A.x,y:A.y,s:1},{x:W-A.x,y:H-A.y,s:-1}];
  if(MAPS[curMap]&&MAPS[curMap].cliff){carveCoast(A.x,A.y,380);carveCoast(W-A.x,H-A.y,380);navInit()}
  const GAP={tree:15,bush:12,stone:12,iron:12,fish:10,dolphin:14,whale:20};
  const free=(x,y,r,type)=>!G.ents.some(e=>Math.hypot(e.x-x,e.y-y)<e.r+r+GAP[type]);
  const cluster=(type,cx,cy,n,spread,okFn)=>{for(let i=0;i<n;i++){for(let k=0;k<20;k++){const a=R()*6.283,d=Math.sqrt(R())*spread;const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,r=NODES[type].r;if(!okFn(x,y,r))continue;if(!free(x,y,r,type))continue;addNode(type,x,y);break}}};
  const landOk=(x,y,r)=>okSpot(x,y,r+4);
  const waterOk={fish:(x,y,r)=>x>40&&y>40&&x<W-40&&y<H-40&&terrAt(x,y)===1&&terrAt(x+r,y)===1&&terrAt(x-r,y)===1&&terrAt(x,y+r)===1&&terrAt(x,y-r)===1,
    dolphin:(x,y,r)=>terrAt(x,y)===0&&terrAt(x+r,y)<=1&&terrAt(x-r,y)<=1&&terrAt(x,y+r)<=1&&terrAt(x,y-r)<=1&&x>40&&y>40&&x<W-40&&y<H-40,
    whale:(x,y,r)=>[[0,0],[r,0],[-r,0],[0,r],[0,-r],[r,r],[-r,-r]].every(([a,b])=>terrAt(x+a,y+b)===0)&&x>60&&y>60&&x<W-60&&y<H-60};
  // Spiegeln: beide Seiten bekommen dieselben Vorkommen
  const mirror=(n0)=>{G.ents.slice(n0).forEach(e=>{if(e.kind!=='node')return;const mx=W-e.x,my=H-e.y;if(!G.ents.some(o=>Math.hypot(o.x-mx,o.y-my)<o.r+e.r+3))addNode(e.type,mx,my)})};
  addBld('hq',0,bases[0].x,bases[0].y,true);addBld('hq',1,bases[1].x,bases[1].y,true);
  bases.forEach((b,i)=>{for(let k=0;k<4;k++)addUnit('worker',i,b.x+b.s*(k*18-27),b.y+b.s*58)});
  // Startvorkommen rund um Basis A (zufällige Richtung, gültiges Land), danach gespiegelt auf Basis B
  const near=(type,n,spread,dmin,dmax,okFn)=>{for(let k=0;k<60;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!okFn(x,y,spread*.5))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,okFn);if(G.ents.length-n0>=Math.min(n,3)){mirror(n0);return}}};
  near('tree',28,92,175,265,landOk);near('tree',24,88,285,400,landOk);near('bush',8,52,110,200,landOk);near('bush',6,44,290,430,landOk);near('stone',2,52,170,270,landOk);near('iron',2,50,210,330,landOk);
  // Fische in Küstennähe von Basis A
  const nearWater=(type,n,spread,dmin,dmax)=>{for(let k=0;k<200;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!waterOk[type](x,y,spread*.4))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,waterOk[type]);if(G.ents.length>n0){mirror(n0);return}}};
  nearWater('fish',5,55,180,520);nearWater('fish',4,50,250,650);nearWater('dolphin',3,50,350,900);
  // gespiegelte Mitte
  const feats=[];
  for(let i=0;i<8;i++)feats.push(['tree',22+Math.floor(R()*12),98,landOk]);
  for(let i=0;i<3;i++)feats.push(['stone',2,52,landOk]);
  for(let i=0;i<3;i++)feats.push(['bush',5,44,landOk]);
  for(let i=0;i<3;i++)feats.push(['iron',2,50,landOk]);
  for(let i=0;i<10;i++)feats.push(['fish',4+Math.floor(R()*2),55,waterOk.fish]);
  for(let i=0;i<6;i++)feats.push(['dolphin',2+Math.floor(R()*2),50,waterOk.dolphin]);
  for(let i=0;i<4;i++)feats.push(['whale',1+Math.floor(R()*2),70,waterOk.whale]);
  for(const [t,n,sp,okFn] of feats){
    let x,y,ok=false;
    for(let k=0;k<200&&!ok;k++){x=150+R()*(W-300);y=150+R()*(H-300);ok=okFn(x,y,sp*.5)&&bases.every(b=>Math.hypot(b.x-x,b.y-y)>(NODES[t].sea?150:520))&&Math.hypot(x-W/2,y-H/2)>90}
    if(!ok)continue;
    const n0=G.ents.length;cluster(t,x,y,n,sp,okFn);mirror(n0);
  }
  spawnAnimals(R,bases,A);
}
/* Wilde Tiere: Rehe in der Nähe der Startgebiete, Wölfe in Wäldern, Bären weit draußen, Tiger in der Mitte. Immer punktsymmetrisch, damit beide Seiten gleich viele haben. */
function spawnAnimals(R,bases,A){
  const treesNear=(x,y,r)=>{let n=0;for(const e of G.ents)if(e.kind==='node'&&e.type==='tree'&&Math.hypot(e.x-x,e.y-y)<r)n++;return n};
  const good=(x,y)=>{if(x<90||y<90||x>W-90||y>H-90)return false;for(let k=0;k<8;k++){const a=k*.785;if(terrAt(x+Math.cos(a)*22,y+Math.sin(a)*22)!==2)return false}return navDyn[navCell(x,y)]===0&&MAINLAND[Math.max(0,Math.min(TH-1,(y/TG)|0))*TW+Math.max(0,Math.min(TW-1,(x/TG)|0))]===1};
  const farBase=(x,y,d)=>bases.every(b=>Math.hypot(b.x-x,b.y-y)>d);
  const place=(type,n,org,dmin,dmax,need)=>{
    for(let k=0;k<160;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=org.x+Math.cos(a)*d,y=org.y+Math.sin(a)*d;
      if(!good(x,y)||!need(x,y))continue;const pts=[];
      for(let i=0;i<n;i++){const px=x+(i?(R()-.5)*70:0),py=y+(i?(R()-.5)*70:0);if(good(px,py)&&!pts.some(q=>Math.hypot(q.x-px,q.y-py)<16)&&!G.ents.some(e=>e.kind==='animal'&&Math.hypot(e.x-px,e.y-py)<50))pts.push({x:px,y:py})}
      if(pts.length<Math.min(n,2))continue;
      for(const q of pts){addAnimal(type,q.x,q.y);if(good(W-q.x,H-q.y))addAnimal(type,W-q.x,H-q.y)}return true}
    return false};
  for(let i=0;i<4;i++)place('deer',2+Math.floor(R()*3),A,380,850,(x,y)=>farBase(x,y,360));
  for(let i=0;i<3;i++)place('wolf',3,A,800,1800,(x,y)=>farBase(x,y,700)&&treesNear(x,y,170)>=4);
  for(let i=0;i<2;i++)place('bear',1,A,1000,2300,(x,y)=>farBase(x,y,900)&&treesNear(x,y,170)>=2);
  place('tiger',2,{x:W/2,y:H/2},0,750,(x,y)=>farBase(x,y,800));
}
function drawMountains(b,t,tmp,R){
  const rock=document.createElement('canvas');rock.width=TW;rock.height=TH;const rc=rock.getContext('2d'),im=rc.createImageData(TW,TH);for(let i=0;i<TERR.length;i++){const o=i*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=TERR[i]===3?255:0}rc.putImageData(im,0,0);
  const cut=(offs)=>{t.globalCompositeOperation='destination-in';t.imageSmoothingEnabled=true;for(const[ox,oy]of offs)t.drawImage(rock,0,0,TW,TH,ox,oy,W,H);t.globalCompositeOperation='source-over'};
  // Schatten
  t.clearRect(0,0,W,H);t.fillStyle='rgba(20,20,16,.55)';t.fillRect(0,0,W,H);cut([[5,7],[3,5],[7,5]]);b.drawImage(tmp,0,0);
  // Felsfläche
  t.clearRect(0,0,W,H);t.fillStyle='#807c74';t.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){const x=R()*W,y=R()*H,r=30+R()*70,g=t.createRadialGradient(x,y,0,x,y,r),c=R()<.5?'150,146,136':'92,88,80';g.addColorStop(0,`rgba(${c},.45)`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  cut([[0,0]]);b.drawImage(tmp,0,0);
  // Gipfel: kleine Berge mit heller und dunkler Seite, Schnee auf den höchsten
  const peaks=[];for(let y=0;y<TH;y++)for(let x=0;x<TW;x++)if(TERR[y*TW+x]===3&&R()<.5)peaks.push([(x+.5)*TG+(R()-.5)*14,(y+.5)*TG+(R()-.5)*14,16+R()*20]);
  b.lineJoin='round';b.lineWidth=1.2;b.strokeStyle='#2a2119';
  for(const[x,y,h]of peaks){const w=h*.9;
    b.fillStyle='#b4afa4';b.beginPath();b.moveTo(x,y-h);b.lineTo(x-w,y+h*.35);b.lineTo(x+w*.1,y+h*.35);b.closePath();b.fill();b.stroke();
    b.fillStyle='#6d695f';b.beginPath();b.moveTo(x,y-h);b.lineTo(x+w,y+h*.35);b.lineTo(x+w*.1,y+h*.35);b.closePath();b.fill();b.stroke();
    if(h>28){b.fillStyle='#f1f3f5';b.beginPath();b.moveTo(x,y-h);b.lineTo(x-w*.32,y-h*.52);b.lineTo(x,y-h*.64);b.lineTo(x+w*.3,y-h*.5);b.closePath();b.fill()}}
}
function renderBg(seed){
  bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');const R=mulberry(seed+99);
  const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;const t=tmp.getContext('2d');
  const mask=pred=>{ /* weiche Landform: Gelände glätten, in 4-facher Auflösung abtasten, Kante bei 50 % */
    const K=4,w=TW*K,h=TH*K,g=new Float32Array(TW*TH);for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let sm=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(TW-1,x+dx)),ny=Math.max(0,Math.min(TH-1,y+dy)),wt=dx||dy?1:3;sm+=wt*(pred(TERR[ny*TW+nx])?1:0);n+=wt}g[y*TW+x]=sm/n}
    const c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d'),im=cx.createImageData(w,h);
    for(let Y=0;Y<h;Y++){const fy=Math.max(0,Math.min(TH-1.001,(Y+.5)/K-.5)),iy=fy|0,ty=fy-iy;for(let X=0;X<w;X++){const fx=Math.max(0,Math.min(TW-1.001,(X+.5)/K-.5)),ix=fx|0,tx=fx-ix;
      const v=(g[iy*TW+ix]*(1-tx)+g[iy*TW+ix+1]*tx)*(1-ty)+(g[(iy+1)*TW+ix]*(1-tx)+g[(iy+1)*TW+ix+1]*tx)*ty,o=(Y*w+X)*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=Math.max(0,Math.min(255,((v-.5)*5+.5)*255))}}
    cx.putImageData(im,0,0);return c};
  const shallowM=mask(v=>v>=1),landM=mask(v=>v>=2);
  const cut=(m,offs)=>{t.globalCompositeOperation='destination-in';t.imageSmoothingEnabled=true;for(const[ox,oy]of offs)t.drawImage(m,0,0,m.width,m.height,ox,oy,W,H);t.globalCompositeOperation='source-over'};
  // 1) tiefes Wasser
  b.fillStyle='#1a4466';b.fillRect(0,0,W,H);
  for(let i=0;i<420;i++){const x=R()*W,y=R()*H,r=90+R()*240,g=b.createRadialGradient(x,y,0,x,y,r),c=R()<.5?'14,52,86':'44,110,146';g.addColorStop(0,`rgba(${c},${.18+R()*.22})`);g.addColorStop(1,`rgba(${c},0)`);b.fillStyle=g;b.fillRect(x-r,y-r,2*r,2*r)}
  // 2) flaches Wasser
  t.clearRect(0,0,W,H);t.fillStyle='#4aa3b0';t.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){const x=R()*W,y=R()*H,r=40+R()*120,g=t.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,200,200,.28)');g.addColorStop(1,'rgba(120,200,200,0)');t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  cut(shallowM,[[0,0]]);b.drawImage(tmp,0,0);
  // Wellen
  b.lineWidth=1.2;{const P=[new Path2D(),new Path2D()];for(let i=0;i<5000;i++){const x=R()*W,y=R()*H,v=terrAt(x,y);if(v>=2)continue;const w=6+R()*10,q=P[v];q.moveTo(x-w,y);q.quadraticCurveTo(x,y-3,x+w,y)}b.strokeStyle='rgba(150,200,230,.14)';b.stroke(P[0]);b.strokeStyle='rgba(235,250,250,.32)';b.stroke(P[1])}
  // 3) Brandung, nasser Sand und Sandstrand rund ums Land (Land nach außen aufgeweitet)
  const dil=(m,r,col,alpha)=>{t.imageSmoothingEnabled=true;t.clearRect(0,0,W,H);t.globalCompositeOperation='source-over';for(let k=0;k<16;k++){const a=k/16*6.283;t.drawImage(m,0,0,m.width,m.height,Math.cos(a)*r,Math.sin(a)*r,W,H)}t.drawImage(m,0,0,m.width,m.height,0,0,W,H);t.globalCompositeOperation='source-in';t.fillStyle=col;t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';b.globalAlpha=alpha;b.drawImage(tmp,0,0);b.globalAlpha=1};
  dil(landM,22,'rgb(190,230,225)',.3);dil(landM,15,'rgb(238,246,244)',.4);dil(landM,11,'#bfa874',1);dil(landM,7,'#d9c690',1);
  // 4) Gras auf dem Land
  t.clearRect(0,0,W,H);t.fillStyle='#6c8544';t.fillRect(0,0,W,H);
  for(let i=0;i<1700;i++){const x=R()*W,y=R()*H,r=30+R()*110,g=t.createRadialGradient(x,y,0,x,y,r),c=R()<.55?'82,110,52':R()<.5?'128,146,76':'140,128,78';g.addColorStop(0,`rgba(${c},${.18+R()*.28})`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  // Erdflecken und dunklere Wiesenstücke
  for(let i=0;i<160;i++){const x=R()*W,y=R()*H,r=14+R()*40,g=t.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,92,58,.38)');g.addColorStop(1,'rgba(120,92,58,0)');t.fillStyle=g;t.beginPath();t.ellipse(x,y,r*1.4,r,R()*3,0,6.283);t.fill()}
  for(const e of G.ents)if(e.type==='hq'){const g=t.createRadialGradient(e.x,e.y,30,e.x,e.y,210);g.addColorStop(0,'rgba(150,118,76,.7)');g.addColorStop(.6,'rgba(150,118,76,.35)');g.addColorStop(1,'rgba(150,118,76,0)');t.fillStyle=g;t.fillRect(e.x-210,e.y-210,420,420)}
  // feines Korn (Rauschen) über dem Gras
  {const n=document.createElement('canvas');n.width=n.height=160;const nx=n.getContext('2d'),im=nx.createImageData(160,160);for(let i=0;i<160*160;i++){const v=110+R()*60|0;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}nx.putImageData(im,0,0);
    t.globalCompositeOperation='soft-light';t.globalAlpha=.55;t.fillStyle=t.createPattern(n,'repeat');t.fillRect(0,0,W,H);t.globalAlpha=1;t.globalCompositeOperation='source-over'}
  // Grashalme, Büschel, Steinchen, Blumen
  t.lineWidth=1;{const P=[new Path2D(),new Path2D(),new Path2D()];for(let i=0;i<24000;i++){const x=R()*W,y=R()*H;if(terrAt(x,y)<2)continue;const q=P[(R()*3)|0];q.moveTo(x,y);q.lineTo(x+(R()-.5)*4,y-3-R()*4)}t.strokeStyle='rgba(52,76,32,.5)';t.stroke(P[0]);t.strokeStyle='rgba(170,184,104,.4)';t.stroke(P[1]);t.strokeStyle='rgba(98,128,58,.45)';t.stroke(P[2])}
  for(let i=0;i<5200;i++){const x=R()*W,y=R()*H;if(terrAt(x,y)<2)continue;const r=1.5+R()*2.6;t.fillStyle='rgba(30,40,18,.28)';t.beginPath();t.ellipse(x+1,y+1,r+.6,r*.6,0,0,6.283);t.fill();t.fillStyle=R()<.5?'#8d8a7f':'#a39f92';t.beginPath();t.ellipse(x,y,r,r*.62,0,0,6.283);t.fill();t.fillStyle='rgba(255,255,255,.28)';t.beginPath();t.ellipse(x-r*.25,y-r*.2,r*.4,r*.22,0,0,6.283);t.fill()}
  {const cols=['#f4e66a','#f7f3ea','#e07a8a','#9f7ad6','#f0a24a'];for(let i=0;i<260;i++){const cx=R()*W,cy=R()*H;if(terrAt(cx,cy)<2)continue;const c=cols[(R()*cols.length)|0],n=3+(R()*7|0);for(let k=0;k<n;k++){const x=cx+(R()-.5)*26,y=cy+(R()-.5)*18;t.fillStyle='rgba(40,60,25,.55)';t.fillRect(x,y,1,3);t.fillStyle=c;t.beginPath();t.arc(x,y,1.5,0,6.283);t.fill()}}}
  cut(landM,[[0,0]]);b.drawImage(tmp,0,0);
  // dunkler Rand der Wiese an der Küste (Tiefe)
  {const ec=document.createElement('canvas');ec.width=W;ec.height=H;const ex=ec.getContext('2d');ex.imageSmoothingEnabled=true;t.imageSmoothingEnabled=true;ex.drawImage(landM,0,0,landM.width,landM.height,0,0,W,H);ex.globalCompositeOperation='destination-in';for(let k=0;k<12;k++){const a=k/12*6.283;ex.drawImage(landM,0,0,landM.width,landM.height,Math.cos(a)*9,Math.sin(a)*9,W,H)}
    t.clearRect(0,0,W,H);t.globalCompositeOperation='source-over';t.drawImage(landM,0,0,landM.width,landM.height,0,0,W,H);t.globalCompositeOperation='destination-out';t.drawImage(ec,0,0);t.globalCompositeOperation='source-in';t.fillStyle='rgba(28,44,18,.38)';t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';b.drawImage(tmp,0,0)}
  // Licht von links oben: großflächige Aufhellung und Abdunklung
  {const g=b.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,240,200,.10)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,20,40,.16)');b.fillStyle=g;b.fillRect(0,0,W,H)}
  if(TERR.some(v=>v===3))drawMountains(b,t,tmp,R);
  b.strokeStyle='rgba(30,22,14,.5)';b.lineWidth=6;b.strokeRect(3,3,W-6,H-6);
  bgSmall=document.createElement('canvas');bgSmall.width=240;bgSmall.height=160;bgSmall.getContext('2d').drawImage(bg,0,0,240,160);
}

