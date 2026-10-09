// Spiellogik, KI, Steuerung, Zeichnen und Benutzeroberfläche.
// Nutzt die Daten aus data.js (wird vorher geladen).
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d'),mm=$('mini'),mctx=mm.getContext('2d'),view=$('view');
let dpr=1,VW=0,VH=0,MW=0,MH=0;
const cam={x:0,y:0,z:1};
/* Ton: Eigene Geräusche immer, fremde nur wenn sie im Bild sind */
/* ---------- Nebel des Krieges ---------- */
const FC=20,FW=W/FC,FH=H/FC;
let fogEx=null,fogVis=null,fogCv=null,fogCtx=null,fogImg=null,fogT=0,terr=null,terrCv=null,terrCtx=null,terrImg=null;
function fogReset(){fogEx=new Uint8Array(FW*FH);fogVis=new Uint8Array(FW*FH);fogCv=document.createElement('canvas');fogCv.width=FW;fogCv.height=FH;fogCtx=fogCv.getContext('2d');fogImg=fogCtx.createImageData(FW,FH);terr=new Int8Array(FW*FH);terrCv=document.createElement('canvas');terrCv.width=FW;terrCv.height=FH;terrCtx=terrCv.getContext('2d');terrImg=terrCtx.createImageData(FW,FH);fogT=0;fogUpdate()}
const fogIdx=(x,y)=>Math.max(0,Math.min(FH-1,y/FC|0))*FW+Math.max(0,Math.min(FW-1,x/FC|0));
function sightOf(e){return e.kind==='unit'?UNITS[e.type].sight:e.built?BLDS[e.type].sight:50}
/* Gebiet: jedes fertige Gebäude beansprucht einen Kreis; bei Überschneidung gewinnt das nähere Gebäude */
function terrUpdate(){
  const best=new Float32Array(FW*FH).fill(9);terr.fill(-1);
  for(const e of G.ents){if(e.dead||e.kind!=='bld'||!e.built)continue;const rad=BLDS[e.type].claim,rc=rad/FC,cx=e.x/FC,cy=e.y/FC;
    for(let y=Math.max(0,Math.floor(cy-rc));y<=Math.min(FH-1,Math.ceil(cy+rc));y++)for(let x=Math.max(0,Math.floor(cx-rc));x<=Math.min(FW-1,Math.ceil(cx+rc));x++){const dx=x+.5-cx,dy=y+.5-cy,k=Math.sqrt(dx*dx+dy*dy)/rc;if(k<=1&&k<best[y*FW+x]){best[y*FW+x]=k;terr[y*FW+x]=e.team}}}
}
const inOwn=(x,y)=>terr[fogIdx(x,y)]===0;
/* Warum darf hier nicht gebaut werden? (null = erlaubt) */
function harborOk(x,y,r){if(terrAt(x,y)!==1)return false;let land=0,water=0;for(let k=0;k<16;k++){const a=k*.3927,px=x+Math.cos(a)*(r+24),py=y+Math.sin(a)*(r+24);if(onLand(px,py))land++;else if(terrAt(px,py)<=1&&navDyn[navCell(px,py)]===0)water++}return land>=2&&water>=3}
function placeBlock(type,x,y){
  const d=BLDS[type];
  if(type==='harbor'){if(!validSpot(x,y,d.r,true))return tr('Hier ist kein Platz.');if(!harborOk(x,y,d.r))return tr('Der Hafen muss zwischen Land und flachem Wasser stehen.')}
  else if(!validSpot(x,y,d.r))return tr('Hier ist kein Platz.');
  if(!fogEx[fogIdx(x,y)])return tr('Dieses Gebiet ist noch unerkundet.');
  if(type!=='tower'&&!inOwn(x,y))return tr('Nur im eigenen Gebiet. Ein Wachturm erobert neues Land.');
  return null;
}
function fogUpdate(){
  terrUpdate();
  fogVis.fill(0);
  for(let i=0;i<terr.length;i++)if(terr[i]===0){fogVis[i]=1;fogEx[i]=1}
  for(const e of G.ents){if(e.dead||e.team!==0)continue;const rc=sightOf(e)/FC,cx=e.x/FC,cy=e.y/FC;
    for(let y=Math.max(0,Math.floor(cy-rc));y<=Math.min(FH-1,Math.ceil(cy+rc));y++)for(let x=Math.max(0,Math.floor(cx-rc));x<=Math.min(FW-1,Math.ceil(cx+rc));x++){const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<=rc*rc){const i=y*FW+x;fogVis[i]=1;fogEx[i]=1}}}
  const px=fogImg.data;for(let i=0;i<fogVis.length;i++){const o=i*4;px[o]=44;px[o+1]=46;px[o+2]=50;px[o+3]=fogVis[i]?0:fogEx[i]?70:165}
  fogCtx.putImageData(fogImg,0,0);
  const tp=terrImg.data;
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const i=y*FW+x,o=i*4,v=terr[i];let a=0;
    if(v===0||(v===1&&fogEx[i])){a=70;const nb=[x>0?terr[i-1]:v,x<FW-1?terr[i+1]:v,y>0?terr[i-FW]:v,y<FH-1?terr[i+FW]:v];if(nb.some(n=>n!==v))a=190}
    tp[o]=v===0?110:215;tp[o+1]=v===0?215:80;tp[o+2]=v===0?95:60;tp[o+3]=a}
  terrCtx.putImageData(terrImg,0,0);
}
/* Die Karte ist überall zu sehen (grau abgedunkelt). Gegnerische Einheiten nur im hellen Bereich, gegnerische Gebäude erst nach dem Erkunden */
const shown=e=>{if(e.team!==1)return true;const i=fogIdx(e.x,e.y);return e.kind==='unit'?fogVis[i]===1:fogEx[i]===1};
function sfx(name,e){if(typeof SND==='undefined')return;if(e&&!shown(e))return;if(e){const sx=(e.x-cam.x)*cam.z,sy=(e.y-cam.y)*cam.z;if(sx<-40||sy<-40||sx>VW+40||sy>VH+40)return}SND.play(name)}
let G=null,bg=null,bgSmall=null,diff='normal';
const sel=new Set();
let placing=null,armed=false,drag=null,panelSig='',uiT=0,lastClick={t:0,id:-1};
const mouse={x:0,y:0,in:false,type:'mouse'};
const keys={};

function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

/* ---------- entities ---------- */
function reg(e){G.ents.push(e);G.byId.set(e.id,e);if(e.kind==='bld'||(e.kind==='node'&&!e.sea))navStamp(e,1);return e}
function addUnit(type,team,x,y){const d=UNITS[type],lvl=G.epoch[team],hp=Math.round(d.hp*LVL.hp[lvl]);return reg({id:G.nid++,kind:'unit',type,team,x,y,r:d.r,lvl,hp,maxHp:hp,state:'idle',cd:0,carry:0,ctype:null,rtype:null,tid:null,dest:null,amove:null,fa:team===0?-1.57:1.57})}
function addBld(type,team,x,y,built){const d=BLDS[type],lvl=G.epoch[team],mh=Math.round(d.hp*LVL.bhp[lvl]);return reg({id:G.nid++,kind:'bld',type,team,x,y,r:d.r,lvl,maxHp:mh,hp:built?mh:1,built,prog:built?1:0,queue:[],rally:null,cd:0})}
function addNode(type,x,y){const d=NODES[type];return reg({id:G.nid++,kind:'node',type,team:-1,x,y,r:d.r,rt:d.rt,sea:!!d.sea,amount:d.amt,maxAmt:d.amt,seed:Math.random()})}
const rn=r=>tr(RN[r]);
function get(id){const e=G.byId.get(id);return e&&!e.dead?e:null}
function nameOf(e){return e.kind==='unit'?tr(UNITS[e.type].name):e.kind==='bld'?tr(BLDS[e.type].name):tr(NODES[e.type].name)}

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
  const GAP={tree:20,bush:14,stone:14,iron:14,fish:10,dolphin:14,whale:20};
  const free=(x,y,r,type)=>!G.ents.some(e=>Math.hypot(e.x-x,e.y-y)<e.r+r+GAP[type]);
  const cluster=(type,cx,cy,n,spread,okFn)=>{for(let i=0;i<n;i++){for(let k=0;k<20;k++){const a=R()*6.283,d=Math.sqrt(R())*spread;const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,r=NODES[type].r;if(!okFn(x,y,r))continue;if(!free(x,y,r,type))continue;addNode(type,x,y);break}}};
  const landOk=(x,y,r)=>okSpot(x,y,r+4);
  const waterOk={fish:(x,y,r)=>x>40&&y>40&&x<W-40&&y<H-40&&terrAt(x,y)===1&&terrAt(x+r,y)===1&&terrAt(x-r,y)===1&&terrAt(x,y+r)===1&&terrAt(x,y-r)===1,
    dolphin:(x,y,r)=>terrAt(x,y)===0&&terrAt(x+r,y)<=1&&terrAt(x-r,y)<=1&&terrAt(x,y+r)<=1&&terrAt(x,y-r)<=1&&x>40&&y>40&&x<W-40&&y<H-40,
    whale:(x,y,r)=>[[0,0],[r,0],[-r,0],[0,r],[0,-r],[r,r],[-r,-r]].every(([a,b])=>terrAt(x+a,y+b)===0)&&x>60&&y>60&&x<W-60&&y<H-60};
  // Spiegeln: beide Seiten bekommen dieselben Vorkommen
  const mirror=(n0)=>{G.ents.slice(n0).forEach(e=>{if(e.kind!=='node')return;const mx=W-e.x,my=H-e.y;if(!G.ents.some(o=>Math.hypot(o.x-mx,o.y-my)<o.r+e.r+3))addNode(e.type,mx,my)})};
  addBld('hq',0,bases[0].x,bases[0].y,true);addBld('hq',1,bases[1].x,bases[1].y,true);
  bases.forEach((b,i)=>{for(let k=0;k<4;k++)addUnit('worker',i,b.x+b.s*(k*18-27),b.y-b.s*58)});
  // Startvorkommen rund um Basis A (zufällige Richtung, gültiges Land), danach gespiegelt auf Basis B
  const near=(type,n,spread,dmin,dmax,okFn)=>{for(let k=0;k<60;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!okFn(x,y,spread*.5))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,okFn);if(G.ents.length-n0>=Math.min(n,3)){mirror(n0);return}}};
  near('tree',16,95,230,340,landOk);near('tree',14,92,300,430,landOk);near('bush',7,48,120,200,landOk);near('stone',4,38,170,260,landOk);near('iron',4,34,200,320,landOk);
  // Fische in Küstennähe von Basis A
  const nearWater=(type,n,spread,dmin,dmax)=>{for(let k=0;k<200;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!waterOk[type](x,y,spread*.4))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,waterOk[type]);if(G.ents.length>n0){mirror(n0);return}}};
  nearWater('fish',5,55,180,520);nearWater('fish',4,50,250,650);nearWater('dolphin',3,50,350,900);
  // gespiegelte Mitte
  const feats=[];
  for(let i=0;i<10;i++)feats.push(['tree',12+Math.floor(R()*8),100,landOk]);
  for(let i=0;i<3;i++)feats.push(['stone',4,38,landOk]);
  for(let i=0;i<3;i++)feats.push(['bush',5,46,landOk]);
  for(let i=0;i<3;i++)feats.push(['iron',4,36,landOk]);
  for(let i=0;i<10;i++)feats.push(['fish',4+Math.floor(R()*2),55,waterOk.fish]);
  for(let i=0;i<6;i++)feats.push(['dolphin',2+Math.floor(R()*2),50,waterOk.dolphin]);
  for(let i=0;i<4;i++)feats.push(['whale',1+Math.floor(R()*2),70,waterOk.whale]);
  for(const [t,n,sp,okFn] of feats){
    let x,y,ok=false;
    for(let k=0;k<200&&!ok;k++){x=150+R()*(W-300);y=150+R()*(H-300);ok=okFn(x,y,sp*.5)&&bases.every(b=>Math.hypot(b.x-x,b.y-y)>(NODES[t].sea?150:520))&&Math.hypot(x-W/2,y-H/2)>90}
    if(!ok)continue;
    const n0=G.ents.length;cluster(t,x,y,n,sp,okFn);mirror(n0);
  }
}
function renderBg(seed){
  bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');const R=mulberry(seed+99);
  const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;const t=tmp.getContext('2d');
  const mask=pred=>{const c=document.createElement('canvas');c.width=TW;c.height=TH;const cx=c.getContext('2d'),im=cx.createImageData(TW,TH);for(let i=0;i<TERR.length;i++){const o=i*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=pred(TERR[i])?255:0}cx.putImageData(im,0,0);return c};
  const shallowM=mask(v=>v>=1),landM=mask(v=>v>=2);
  const cut=(m,offs)=>{t.globalCompositeOperation='destination-in';t.imageSmoothingEnabled=true;for(const[ox,oy]of offs)t.drawImage(m,0,0,TW,TH,ox,oy,W,H);t.globalCompositeOperation='source-over'};
  // 1) tiefes Wasser
  b.fillStyle='#1a4466';b.fillRect(0,0,W,H);
  for(let i=0;i<420;i++){const x=R()*W,y=R()*H,r=90+R()*240,g=b.createRadialGradient(x,y,0,x,y,r),c=R()<.5?'14,52,86':'44,110,146';g.addColorStop(0,`rgba(${c},${.18+R()*.22})`);g.addColorStop(1,`rgba(${c},0)`);b.fillStyle=g;b.fillRect(x-r,y-r,2*r,2*r)}
  // 2) flaches Wasser
  t.clearRect(0,0,W,H);t.fillStyle='#4aa3b0';t.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){const x=R()*W,y=R()*H,r=40+R()*120,g=t.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,200,200,.28)');g.addColorStop(1,'rgba(120,200,200,0)');t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  cut(shallowM,[[0,0]]);b.drawImage(tmp,0,0);
  // Wellen
  b.lineWidth=1.2;{const P=[new Path2D(),new Path2D()];for(let i=0;i<5000;i++){const x=R()*W,y=R()*H,v=terrAt(x,y);if(v===2)continue;const w=6+R()*10,q=P[v];q.moveTo(x-w,y);q.quadraticCurveTo(x,y-3,x+w,y)}b.strokeStyle='rgba(150,200,230,.14)';b.stroke(P[0]);b.strokeStyle='rgba(235,250,250,.32)';b.stroke(P[1])}
  // 3) Sandstrand rund ums Land
  t.clearRect(0,0,W,H);t.fillStyle='#d6c08b';t.fillRect(0,0,W,H);cut(landM,[[0,0],[9,0],[-9,0],[0,9],[0,-9],[6,6],[-6,-6],[6,-6],[-6,6]]);b.drawImage(tmp,0,0);
  // 4) Gras auf dem Land
  t.clearRect(0,0,W,H);t.fillStyle='#6c8544';t.fillRect(0,0,W,H);
  for(let i=0;i<1500;i++){const x=R()*W,y=R()*H,r=30+R()*110,g=t.createRadialGradient(x,y,0,x,y,r),c=R()<.55?'82,110,52':R()<.5?'128,146,76':'140,128,78';g.addColorStop(0,`rgba(${c},${.18+R()*.28})`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  for(const e of G.ents)if(e.type==='hq'){const g=t.createRadialGradient(e.x,e.y,30,e.x,e.y,200);g.addColorStop(0,'rgba(146,116,74,.6)');g.addColorStop(1,'rgba(146,116,74,0)');t.fillStyle=g;t.fillRect(e.x-200,e.y-200,400,400)}
  t.lineWidth=1;{const P=[new Path2D(),new Path2D()];for(let i=0;i<16000;i++){const x=R()*W,y=R()*H;if(terrAt(x,y)<2)continue;const q=P[R()<.5?0:1];q.moveTo(x,y);q.lineTo(x+(R()-.5)*3,y-3-R()*3)}t.strokeStyle='rgba(60,84,38,.45)';t.stroke(P[0]);t.strokeStyle='rgba(160,172,98,.35)';t.stroke(P[1])}
  cut(landM,[[0,0]]);b.drawImage(tmp,0,0);
  b.strokeStyle='rgba(30,22,14,.5)';b.lineWidth=6;b.strokeRect(3,3,W-6,H-6);
  bgSmall=document.createElement('canvas');bgSmall.width=240;bgSmall.height=160;bgSmall.getContext('2d').drawImage(bg,0,0,240,160);
}

/* ---------- game ---------- */
let mapSeed=0,mapFresh=false;
function newGame(d,reuse){
  diff=d;
  G={t:0,ents:[],byId:new Map(),nid:1,res:[{food:200,wood:200,stone:100,iron:0},{food:200,wood:200,stone:100,iron:0}],epoch:[0,0],adv:[null,null],jobs:[[],[]],pop:[0,0],cap:[0,0],speed:1,paused:false,running:false,over:null,overShown:false,proj:[],fx:[],aiT:1,alertT:-99,ping:null,ai:{next:DIFF[d].first,wave:DIFF[d].wave},stats:{lost:[0,0],trained:[0,0]}};
  sel.clear();placing=null;armed=false;panelSig='';advisor.cur=null;advisor.ignore={};advisor.next=8;advisor.last=-9;if(typeof SND!=='undefined')SND.setEpoch(0);
  const keep=reuse&&mapFresh&&bg,seed=keep?mapSeed:(typeof window.__seed==='number'?window.__seed:(Math.random()*1e9)|0);mapSeed=seed;mapFresh=true;genTerrain(seed);navInit();genMap(seed);if(!keep)renderBg(seed);
  G.solids=G.ents.filter(e=>e.kind!=='unit');recount();fogReset();
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0);centerOn(hq.x+120,hq.y-80);
  $('pauseBtn').textContent=tr('Pause');$('speedBtn').textContent=tr('Tempo {0}×',1);
}
function recount(){G.pop=[0,0];G.cap=[0,0];for(const e of G.ents){if(e.dead)continue;if(e.kind==='unit')G.pop[e.team]++;else if(e.kind==='bld'&&e.built&&BLDS[e.type].pop)G.cap[e.team]+=BLDS[e.type].pop}G.cap=G.cap.map(c=>Math.min(60,c))}
function afford(t,c){return RES.every(r=>(G.res[t][r]||0)>=(c[r]||0))}
function pay(t,c){if(!afford(t,c))return false;RES.forEach(r=>G.res[t][r]-=c[r]||0);return true}
function refund(t,c){RES.forEach(r=>G.res[t][r]+=c[r]||0)}
function missing(t,c){const m=RES.filter(r=>(G.res[t][r]||0)<(c[r]||0)).map(r=>rn(r));return tr('Nicht genug {0}',m.join(tr(' und ')))}

function step(dt){
  G.t+=dt;G.pfBudget=12;G.load={};
  for(const e of G.ents)if(e.kind==='unit'&&!e.dead&&e.state==='gather'&&e.tid)G.load[e.tid]=(G.load[e.tid]||0)+1;
  G.solids=G.ents.filter(e=>e.kind!=='unit'&&!e.dead);
  recount();
  for(const e of G.ents){if(e.dead||e.upj)continue;if(e.kind==='unit')updUnit(e,dt);else if(e.kind==='bld')updBld(e,dt)}
  for(let t=0;t<2;t++){const js=G.jobs[t];if(!js.length)continue;for(const j of js){j.t+=dt;if(j.t>=j.time){j.done=true;for(const id of j.ids){const e=G.byId.get(id);if(e&&!e.dead){e.upj=null;levelUp(e,j.to)}}if(t===0){panelSig='';infoCache='';sfx('epoch');toast(tr('Upgrade fertig: {0}',j.label),'good')}}}G.jobs[t]=js.filter(j=>!j.done)}
  for(let t=0;t<2;t++){const a=G.adv[t];if(!a)continue;a.t+=dt;if(a.t>=a.time){G.epoch[t]++;G.adv[t]=null;panelSig='';if(t===1)applyLevels(1);if(t===0){sfx('epoch');if(typeof SND!=='undefined')SND.setEpoch(G.epoch[0])}if(t===0)toast(tr('{0} erreicht! Neue Einheiten und Gebäude verfügbar.',tr(EPOCHS[G.epoch[0]].name)),'good');else toast(tr('Der Gegner hat die {0} erreicht.',tr(EPOCHS[G.epoch[1]].name)),'warn')}}
  for(const p of G.proj){const t=get(p.tid);if(!t){p.dead=true;continue}const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy),s=380*dt;p.a=Math.atan2(dy,dx);if(d<=s+t.r*.5){damage(t,p.dmg,get(p.src));p.dead=true}else{p.x+=dx/d*s;p.y+=dy/d*s}}
  G.proj=G.proj.filter(p=>!p.dead);
  separate();
  fogT+=dt;if(fogT>=.2){fogT=0;fogUpdate()}
  G.ents=G.ents.filter(e=>{if(e.dead){G.byId.delete(e.id);return false}return true});
  G.aiT+=dt;if(G.aiT>=1){G.aiT=0;aiTick()}
  G.fx=G.fx.filter(f=>G.t-f.t<.7);
}

function moveToward(u,tx,ty,dt,ignore){
  const ud=UNITS[u.type],naval=!!ud.naval;
  let dx=tx-u.x,dy=ty-u.y;const d=Math.hypot(dx,dy);if(d<1.5)return true;
  const spd=ud.spd*dt,step=Math.min(d,spd);
  // Festhängen erkennen: kaum Bewegung über längere Zeit -> kurz seitlich ausweichen und einen anderen Weg suchen
  const mv=u.lx===undefined?99:Math.hypot(u.x-u.lx,u.y-u.ly);u.lx=u.x;u.ly=u.y;
  if(mv<spd*.25)u.stk=(u.stk||0)+dt;else u.stk=Math.max(0,(u.stk||0)-dt*1.5);
  if(u.stk>1.6){u.stk=0;u.pf=null;u.seed=(u.seed||0)+1+(u.id%13);u.side={a:Math.random()<.5?1:-1,t:.9}}
  if(u.side&&u.side.t>0){u.side.t-=dt;const nx=-dy/d*u.side.a,ny=dx/d*u.side.a,m=Math.hypot(dx/d*.35+nx,dy/d*.35+ny);const sx=(dx/d*.35+nx)/m,sy=(dy/d*.35+ny)/m;
    const px=u.x+sx*step,py=u.y+sy*step;if(terrOk(px,py,naval)){u.x=px;u.y=py;u.mvT=G.t;u.fa=Math.atan2(sy,sx)}return false}
  const tgt=ignore?get(ignore):null,stopR=tgt?tgt.r+u.r+6:8;
  let wx=tx,wy=ty;
  if(d>26&&!navLos(u.x,u.y,tx,ty,naval,Math.max(0,d-stopR))){
    let pf=u.pf;
    if(!pf||Math.hypot(pf.tx-tx,pf.ty-ty)>28||(pf.fail&&G.t-pf.t>1.2)){
      if(G.pfBudget>0&&(!pf||G.t-pf.t>.35)){G.pfBudget--;const path=navPath(u.x,u.y,tx,ty,stopR,naval,u.seed||0);u.pf=pf={tx,ty,path,i:0,t:G.t,fail:!path}}}
    if(pf&&pf.fail)return true; // kein Weg: aufgeben (Aufrufer sieht u.pf.fail)
    if(pf&&pf.path){
      while(pf.i<pf.path.length-1&&Math.hypot(pf.path[pf.i].x-u.x,pf.path[pf.i].y-u.y)<9)pf.i++;
      while(pf.i<pf.path.length-1&&navLos(u.x,u.y,pf.path[pf.i+1].x,pf.path[pf.i+1].y,naval))pf.i++;
      wx=pf.path[pf.i].x;wy=pf.path[pf.i].y}
  }else u.pf=null;
  let ex=wx-u.x,ey=wy-u.y;const ed=Math.hypot(ex,ey);if(ed<.01)return d<=step;
  const st=Math.min(ed,spd);ex/=ed;ey/=ed;
  const nx=u.x+ex*st,ny=u.y+ey*st;
  if(terrOk(nx,ny,naval)){u.x=nx;u.y=ny;u.mvT=G.t}
  u.fa=Math.atan2(ey,ex);return d<=step;
}
function nearestNode(rt,x,y,max,u,free){const naval=!!(u&&UNITS[u.type].naval);let best=null,bd=max;for(const e of G.solids){if(e.kind!=='node'||e.dead||(rt&&e.rt!==rt)||!!e.sea!==naval)continue;if(u&&u.bad&&u.bad[e.id]&&G.t-u.bad[e.id]<40)continue;if(free&&(G.load[e.id]||0)>=NODES[e.type].cap)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function nearestDrop(t,x,y,naval){let best=null,bd=1e9;for(const e of G.solids){if(e.kind!=='bld'||e.team!==t||!e.built||!BLDS[e.type].drop||(naval&&e.type!=='harbor')||e.dead)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function findEnemy(s,rad,unitsOnly){let best=null,bd=1e9;for(const e of G.ents){if(e.dead||e.team<0||e.team===s.team)continue;if(unitsOnly&&e.kind!=='unit')continue;const d=Math.hypot(e.x-s.x,e.y-s.y)-e.r-s.r;if(d>rad)continue;const sc=d+(e.kind==='bld'?80:0);if(sc<bd){bd=sc;best=e}}return best}
const reach=(u,t)=>dist(u,t)<=u.r+t.r+5;

function updUnit(u,dt){
  const d=UNITS[u.type];u.cd=Math.max(0,u.cd-dt);u.px=u.x;u.py=u.y;
  switch(u.state){
  case 'idle':
    if(!d.passive){const t=findEnemy(u,150);if(t){u.tid=t.id;u.state='attack'}}
    break;
  case 'move':if(moveToward(u,u.dest.x,u.dest.y,dt))u.state='idle';break;
  case 'amove':{const t=findEnemy(u,140);if(t){u.tid=t.id;u.state='attack';break}if(moveToward(u,u.amove.x,u.amove.y,dt)){u.state='idle';u.amove=null}break}
  case 'attack':{const t=get(u.tid);if(!t||t.team===u.team||t.team<0){u.state=u.amove?'amove':'idle';break}
    const gap=dist(u,t)-u.r-t.r;
    if(gap<=d.rng){u.fa=Math.atan2(t.y-u.y,t.x-u.x);if(u.cd<=0){u.cd=d.cd;u.swing=G.t;hit(u,t)}}
    else moveToward(u,t.x,t.y,dt,t.id);break}
  case 'gather':{let n=get(u.tid);
    if(!n){n=nearestNode(u.rtype,u.x,u.y,350,u,true)||nearestNode(u.rtype,u.x,u.y,350,u);if(!n){if(u.carry>0)u.state='return';else{u.state='idle';u.rtype=null}break}u.tid=n.id}
    if(u.carry>0&&u.ctype!==n.rt)u.carry=0;
    const gc=GATHER[n.rt];
    if(!canGather(u,n)){u.state='idle';u.tid=null;u.rtype=null;if(u.team===0&&G.t-(G.lvlWarn||-9)>4){G.lvlWarn=G.t;toast(tr('Arbeiter brauchen Stufe {0}, um {1} abzubauen.',LVLN[NODES[n.type].lvl!==undefined?NODES[n.type].lvl:NEED_LVL[n.rt]],tr(NODES[n.type].name)));sfx('error')}break}
    if(u.carry>=gc.carry){u.state='return';break}
    if(reach(u,n)){u.fa=Math.atan2(n.y-u.y,n.x-u.x);u.gat=G.t;if((u.gt=(u.gt||0)-dt)<=0){u.gt=.75+Math.random()*.2;sfx(n.rt==='wood'?'chop':n.rt==='stone'||n.rt==='iron'?'mine':'pick',u)}const rate=.85*gc.rate*(NODES[n.type].gm||1)*LVL.gather[u.lvl]*(u.team===1?DIFF[diff].gather:1);const amt=Math.min(rate*dt,n.amount);u.carry+=amt;u.ctype=n.rt;n.amount-=amt;if(n.amount<=0.001)kill(n);if(u.carry>=gc.carry)u.state='return'}
    else{
      // Absprache: ist der Baum/Busch schon voll besetzt, ein freies Vorkommen in der Nähe suchen
      if((G.load[n.id]||0)>NODES[n.type].cap&&G.t-(u.rs||0)>1.5){u.rs=G.t;const alt=nearestNode(u.rtype||n.rt,u.x,u.y,350,u,true);if(alt&&alt.id!==n.id){G.load[n.id]--;G.load[alt.id]=(G.load[alt.id]||0)+1;u.tid=alt.id;u.pf=null;n=alt}}
      moveToward(u,n.x,n.y,dt,n.id);
      if(u.pf&&u.pf.fail){(u.bad||(u.bad={}))[n.id]=G.t;u.tid=null;u.pf=null}}
    break}
  case 'return':{const dp=nearestDrop(u.team,u.x,u.y,!!d.naval);if(!dp||!u.ctype){u.state='idle';break}
    if(reach(u,dp)){G.res[u.team][u.ctype]+=u.carry;if(u.team===0)sfx('drop',u);u.carry=0;u.state='gather'}else moveToward(u,dp.x,dp.y,dt,dp.id);break}
  case 'build':{const b=get(u.tid);
    if(!b||b.built){u.state='idle';if(b&&b.built&&BLDS[b.type].drop){const n=nearestNode(null,b.x,b.y,260);if(n){u.tid=n.id;u.rtype=n.rt;u.state='gather'}}break}
    if(reach(u,b)){u.fa=Math.atan2(b.y-u.y,b.x-u.x);u.gat=G.t;if((u.bt=(u.bt||0)-dt)<=0){u.bt=.6;sfx('hammer',u)}const inc=dt/BLDS[b.type].time;b.prog=Math.min(1,b.prog+inc);b.hp=Math.min(b.maxHp,b.hp+inc*b.maxHp);
      if(b.prog>=1){b.built=true;panelSig='';if(b.team===0){toast(tr('{0} fertiggestellt.',tr(BLDS[b.type].name)));sfx('built');if(BLDS[b.type].claim>150){fogT=1;toast(tr('Neues Gebiet erobert!'),'good')}}}}
    else moveToward(u,b.x,b.y,dt,b.id);break}
  }
}
function hit(u,t){const d=UNITS[u.type];sfx(d.ranged?'arrow':'hit',u);const mult=t.kind==='bld'?(d.ranged?.3:1):1;
  if(d.ranged)G.proj.push({x:u.x,y:u.y,tid:t.id,dmg:d.atk*mult*LVL.atk[u.lvl],src:u.id,a:0});else damage(t,d.atk*mult*LVL.atk[u.lvl],u)}
function damage(t,amt,src){
  t.hp-=amt;
  if(src&&t.kind==='unit'&&!UNITS[t.type].passive&&t.state==='idle'){t.tid=src.id;t.state='attack'}
  if(t.team===0&&G.t-G.alertT>12){G.alertT=G.t;G.ping={x:t.x,y:t.y,t:G.t};toast(tr('Deine Siedlung wird angegriffen!'),'warn');sfx('alert')}
  if(t.hp<=0)kill(t);
}
function kill(e){if(e.dead)return;e.dead=true;if(e.kind==='bld'||(e.kind==='node'&&!e.sea))navStamp(e,-1);if(e.kind==='unit')sfx('die',e);else if(e.kind==='bld')sfx('crumble',e);sel.delete(e.id);if(e.kind==='unit')G.stats.lost[e.team]++;
  if(e.type==='hq'&&!G.over)G.over=e.team===0?'lose':'win';}
function updBld(b,dt){
  if(!b.built)return;const d=BLDS[b.type];
  if(d.shoot){b.cd=Math.max(0,b.cd-dt);if(b.cd<=0){const t=findEnemy(b,d.shoot.rng,true);if(t){b.cd=d.shoot.cd;sfx('arrow',b);G.proj.push({x:b.x,y:b.y-8,tid:t.id,dmg:d.shoot.atk*LVL.atk[b.lvl],src:b.id,a:0})}}}
  if(b.queue.length){const q=b.queue[0];if(G.pop[b.team]>=G.cap[b.team]){q.blocked=true}else{q.blocked=false;q.t+=dt;if(q.t>=UNITS[q.type].time){b.queue.shift();spawn(b,q.type)}}}
}
function spawn(b,type){
  const rp=b.rally;let ang=rp?Math.atan2(rp.y-b.y,rp.x-b.x):(b.team===0?-1.57:1.57);ang+=(Math.random()-.5)*.8;
  let sx=b.x+Math.cos(ang)*(b.r+10),sy=b.y+Math.sin(ang)*(b.r+10);
  if(UNITS[type].naval){let found=false;for(let k=0;k<24&&!found;k++){const a=(b.ang||0)+(k%2?1:-1)*Math.ceil(k/2)*.2618;for(const dd of[b.r+22,b.r+36]){const x=b.x+Math.cos(a)*dd,y=b.y+Math.sin(a)*dd;if(terrAt(x,y)<=1&&navDyn[navCell(x,y)]===0){sx=x;sy=y;found=true;break}}}}
  const u=addUnit(type,b.team,sx,sy);
  G.pop[b.team]++;G.stats.trained[b.team]++;if(b.team===0)sfx('ready');
  if(rp){const n=rp.id?get(rp.id):null;
    if(n&&n.kind==='node'&&UNITS[type].gather){u.state='gather';u.tid=n.id;u.rtype=n.rt}
    else if(rp.nodeType&&UNITS[type].gather){u.state='gather';u.rtype=rp.nodeType;u.tid=null}
    else{u.state='move';u.dest={x:rp.x+(Math.random()-.5)*30,y:rp.y+(Math.random()-.5)*30}}}
}
function enqueue(b,type,team){
  const d=UNITS[type];
  if(d.ep>G.epoch[team]){if(team===0){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error')}return false}
  if(b.queue.length>=5){if(team===0){toast(tr('Die Warteschlange ist voll (max. 5).'));sfx('error')}return false}
  if(!pay(team,d.cost)){if(team===0){toast(missing(team,d.cost)+'.');sfx('error')}return false}
  b.queue.push({type,t:0});if(team===0)panelSig='';return true;
}
/* ---------- Stufen und Upgrades ---------- */
function levelUp(e,to){if(e.dead||e.kind==='node'||e.lvl>=to)return;
  const nm=e.kind==='unit'?Math.round(UNITS[e.type].hp*LVL.hp[to]):Math.round(BLDS[e.type].hp*LVL.bhp[to]);e.hp=e.hp/e.maxHp*nm;e.maxHp=nm;e.lvl=to}
function applyLevels(team){const to=G.epoch[team];for(const e of G.ents)if(e.team===team)levelUp(e,to)}
const upgCost=(e,to)=>{const c={};for(let l=e.lvl+1;l<=to;l++){const k=UPG[e.kind==='unit'?'unit':'bld'][l];for(const r in k)c[r]=(c[r]||0)+k[r]}return c};
const upgTime=n=>Math.min(UPG_TIME.max,UPG_TIME.base+n*UPG_TIME.each);
/* Was muss noch aufgewertet werden? Gruppen je Einheiten-/Gebäudetyp, mit Anzahl, Kosten und Dauer */
function pending(team){const to=G.epoch[team],groups=new Map();let nb=0,nu=0;const cost={};
  for(const e of G.ents){if(e.dead||e.team!==team||e.kind==='node'||e.lvl>=to||e.upj)continue;
    if(e.kind==='unit')nu++;else nb++;
    const key=e.kind+':'+e.type;let g=groups.get(key);if(!g){g={key,kind:e.kind,type:e.type,nm:e.kind==='unit'?UNITS[e.type].name:BLDS[e.type].name,n:0,cost:{}};groups.set(key,g)}
    g.n++;const c=upgCost(e,to);for(const r in c){g.cost[r]=(g.cost[r]||0)+c[r];cost[r]=(cost[r]||0)+c[r]}}
  const list=[...groups.values()].sort((a,b)=>(a.kind===b.kind?0:a.kind==='unit'?-1:1)||(a.type==='worker'?-1:b.type==='worker'?1:0));
  list.forEach(g=>g.time=upgTime(g.n));
  return{nb,nu,cost,n:nb+nu,groups:list,time:upgTime(nb+nu)}}
/* Upgrade starten: key = 'all' oder eine Gruppe wie 'unit:worker'. Die betroffenen Einheiten/Gebäude ruhen, bis es fertig ist. */
function startUpgrade(team,key){key=key||'all';const p=pending(team);if(!p.n||G.adv[team])return false;
  const gs=key==='all'?p.groups:p.groups.filter(g=>g.key===key);if(!gs.length)return false;
  const cost={};let n=0;gs.forEach(g=>{n+=g.n;for(const r in g.cost)cost[r]=(cost[r]||0)+g.cost[r]});
  if(!pay(team,cost)){if(team===0){toast(missing(team,cost)+'.');sfx('error')}return false}
  const to=G.epoch[team],keys=new Set(gs.map(g=>g.key)),job={team,to,t:0,time:upgTime(n),ids:[],done:false,label:key==='all'?tr('Alle'):tr(gs[0].nm),n};
  for(const e of G.ents){if(e.dead||e.team!==team||e.kind==='node'||e.lvl>=to||e.upj)continue;if(keys.has(e.kind+':'+e.type)){e.upj=job;job.ids.push(e.id)}}
  G.jobs[team].push(job);
  if(team===0){panelSig='';infoCache='';sfx('click');toast(tr('Upgrade gestartet: {0} ruhen, bis es fertig ist.',job.label))}return true}
function canGather(u,x){const need=typeof x==='string'?(NEED_LVL[x]||0):(NODES[x.type].lvl!==undefined?NODES[x.type].lvl:(NEED_LVL[x.rt]||0));return u.lvl>=need}
function advance(team){
  const ep=G.epoch[team];if(ep>=2||G.adv[team])return false;
  if(team===0&&G.jobs[0].length){toast(tr('Erst die laufenden Upgrades abwarten.'));sfx('error');return false}
  if(team===0&&pending(0).n){toast(tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]));sfx('error');return false}
  const c=EPOCHS[ep].cost;
  if(!pay(team,c)){if(team===0)toast(missing(team,c)+'.');return false}
  G.adv[team]={t:0,time:EPOCHS[ep].time};if(team===0){panelSig='';toast(tr('Aufstieg in die {0} begonnen.',tr(EPOCHS[ep+1].name)))}return true;
}
function validSpot(x,y,r,anyTerrain){if(x<r+12||y<r+12||x>W-r-12||y>H-r-12)return false;if(!anyTerrain&&(!onLand(x,y)||!onLand(x+r,y)||!onLand(x-r,y)||!onLand(x,y+r)||!onLand(x,y-r)))return false;for(const e of G.ents){if(e.dead||e.kind==='unit')continue;if(Math.hypot(e.x-x,e.y-y)<e.r+r+5)return false}return true}
function separate(){
  const us=G.ents.filter(e=>e.kind==='unit'&&!e.dead);
  for(let i=0;i<us.length;i++){const a=us[i];for(let j=i+1;j<us.length;j++){const b=us[j];let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(Math.abs(dx)>m||Math.abs(dy)>m)continue;let d=Math.hypot(dx,dy);if(d>=m)continue;if(d<.01){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy)}const p=(m-d)/2*.8;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p}}
  for(const u of us){for(const o of G.solids){if(o.dead)continue;let dx=u.x-o.x,dy=u.y-o.y;const R=o.r+u.r;if(Math.abs(dx)>R||Math.abs(dy)>R)continue;let d=Math.hypot(dx,dy);if(d>=R)continue;if(d<.01){dx=1;dy=0;d=1}u.x=o.x+dx/d*R;u.y=o.y+dy/d*R}
    u.x=Math.max(u.r,Math.min(W-u.r,u.x));u.y=Math.max(u.r,Math.min(H-u.r,u.y));
    if(u.px!==undefined&&!terrOk(u.x,u.y,!!UNITS[u.type].naval)){u.x=u.px;u.y=u.py}}
}

/* ---------- AI ---------- */
function findSpot(team,cx,cy,r,minD,maxD){for(let k=0;k<80;k++){const a=Math.random()*6.283,d=minD+Math.random()*(maxD-minD);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(validSpot(x,y,r))return{x,y}}return null}
function aiPlace(type,hq,minD,maxD){const d=BLDS[type];if(!afford(1,d.cost))return null;const s=findSpot(1,hq.x,hq.y,d.r,minD,maxD);if(!s)return null;pay(1,d.cost);return addBld(type,1,s.x,s.y,false)}
function aiTick(){
  const ai=G.ai,r=G.res[1],ep=G.epoch[1];
  const mine=G.ents.filter(e=>!e.dead&&e.team===1);
  const hq=mine.find(e=>e.type==='hq');if(!hq)return;
  const workers=mine.filter(e=>e.type==='worker'),mil=mine.filter(e=>e.kind==='unit'&&e.type!=='worker'),blds=mine.filter(e=>e.kind==='bld');
  const unbuilt=blds.filter(b=>!b.built);
  const targetW=[10,15,19][ep];
  const saving=ep<2&&!G.adv[1]&&workers.length>=targetW-2;
  const adv=ep<2?EPOCHS[ep].cost:null;
  if(workers.length+hq.queue.filter(q=>q.type==='worker').length<targetW&&hq.queue.length<2&&!(saving&&r.food<adv.food+50))enqueue(hq,'worker',1);
  // gathering balance
  const w8=[{food:.6,wood:.4,stone:0,iron:0},{food:.4,wood:.32,stone:.28,iron:0},{food:.4,wood:.24,stone:.16,iron:.2}][ep];
  const cnt={food:0,wood:0,stone:0,iron:0};workers.forEach(w=>{if(w.state!=='idle'&&w.rtype)cnt[w.rtype]++});
  for(const w of workers){if(w.state!=='idle')continue;
    const n=workers.length;const order=RES.filter(rt=>canGather(w,rt)).sort((a,b)=>(w8[b]*n-cnt[b])-(w8[a]*n-cnt[a]));
    for(const rt of order){const node=nearestNode(rt,hq.x,hq.y,900);if(node){w.state='gather';w.tid=node.id;w.rtype=rt;cnt[rt]++;break}}}
  // builders
  for(const b of unbuilt){const busy=workers.some(w=>w.state==='build'&&w.tid===b.id);if(!busy){let bw=null,bd=1e9;for(const w of workers){if(w.state==='build')continue;const d=dist(w,b);if(d<bd){bd=d;bw=w}}if(bw){bw.state='build';bw.tid=b.id}}}
  // buildings
  if(G.cap[1]-G.pop[1]<=3&&G.cap[1]<60&&!unbuilt.some(b=>b.type==='house'))aiPlace('house',hq,90,200);
  const nBar=blds.filter(b=>b.type==='barracks').length,wantBar=ep>=2&&diff!=='leicht'?2:1;
  if(nBar<wantBar&&workers.length>=6&&!unbuilt.some(b=>b.type==='barracks')){const b=aiPlace('barracks',hq,110,210);if(b){const a=Math.atan2(H/2-hq.y,W/2-hq.x);b.rally={x:hq.x+Math.cos(a)*170,y:hq.y+Math.sin(a)*170}}}
  if(ep>=1&&diff!=='leicht'&&!saving&&!blds.some(b=>b.type==='tower'))aiPlace('tower',hq,70,140);
  if(saving&&afford(1,adv))advance(1);
  // army
  const types=[['club'],['spear','archer','spear'],['sword','archer','sword','spear']][ep];
  for(const b of blds){if(b.type!=='barracks'||!b.built||b.queue.length>=2)continue;
    if(saving&&!(r.food>adv.food+90&&r.wood>(adv.wood||0)+90))continue;
    enqueue(b,types[(G.stats.trained[1]+b.id)%types.length],1)}
  // defend
  const threats=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&blds.some(b=>dist(e,b)<260));
  if(threats.length){for(const m of mil){if(m.state==='attack'||dist(m,hq)>750)continue;let t=null,td=1e9;for(const th of threats){const d=dist(m,th);if(d<td){td=d;t=th}}m.state='attack';m.tid=t.id}}
  // attack waves
  else if(G.t>=ai.next&&mil.length>=ai.wave){
    const targets=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='bld');const tgt=targets.find(e=>e.type==='hq')||targets[0];
    if(tgt){for(const m of mil){m.amove={x:tgt.x,y:tgt.y};m.state='amove'}ai.next=G.t+100;ai.wave+=2}
  }
}

/* ---------- player commands ---------- */
function selection(){const a=[];for(const id of sel){const e=G.byId.get(id);if(e&&!e.dead)a.push(e)}return a}
function ownSel(){return selection().filter(e=>e.team===0)}
function entityAt(x,y){
  let best=null,bd=1e9;
  for(const e of G.ents){if(e.dead)continue;const d=Math.hypot(e.x-x,e.y-y);if(!shown(e))continue;const pad=e.kind==='unit'?5:2;if(d>e.r+pad)continue;const sc=(e.kind==='unit'?0:e.kind==='bld'?1000:2000)+d;if(sc<bd){bd=sc;best=e}}
  return best;
}
function fxMark(x,y,kind){G.fx.push({x,y,t:G.t,kind,rt:performance.now()})}
function command(wx,wy){
  const s=ownSel();if(!s.length)return;
  const t=entityAt(wx,wy);
  if(s[0].kind==='bld'){s.forEach(b=>{if(b.kind==='bld')b.rally={x:wx,y:wy,id:t&&t.kind==='node'?t.id:null,nodeType:t&&t.kind==='node'?t.rt:null}});fxMark(wx,wy,'rally');return}
  const units=s.filter(e=>e.kind==='unit');const cols=Math.ceil(Math.sqrt(units.length));let i=0;
  for(const u of units){
    if(t&&t.kind==='node'&&UNITS[u.type].gather&&!!t.sea===!!UNITS[u.type].naval){u.state='gather';u.tid=t.id;u.rtype=t.rt;u.amove=null}
    else if(t&&t.team===1){u.state='attack';u.tid=t.id;u.amove=null}
    else if(t&&t.team===0&&t.kind==='bld'&&!t.built&&u.type==='worker'){u.state='build';u.tid=t.id}
    else if(t&&t.team===0&&t.kind==='bld'&&BLDS[t.type].drop&&UNITS[u.type].gather&&u.carry>0&&(!UNITS[u.type].naval||t.type==='harbor')){u.state='return'}
    else{const ox=(i%cols-(cols-1)/2)*18,oy=(Math.floor(i/cols)-(cols-1)/2)*18;u.state='move';u.dest={x:wx+ox,y:wy+oy};u.amove=null;i++}
  }
  fxMark(wx,wy,t&&t.team===1?'attack':'move');
}
function attackMove(wx,wy){
  const units=ownSel().filter(e=>e.kind==='unit'&&!UNITS[e.type].passive);const cols=Math.ceil(Math.sqrt(units.length));
  units.forEach((u,i)=>{u.amove={x:wx+(i%cols-(cols-1)/2)*18,y:wy+(Math.floor(i/cols)-(cols-1)/2)*18};u.state='amove'});
  armed=false;fxMark(wx,wy,'attack');
}
function startPlace(type){const d=BLDS[type];if(d.ep>G.epoch[0]){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error');return}if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');sfx('error');return}placing=type;armed=false}
function tryPlace(wx,wy,keep){
  const d=BLDS[placing],blk=placeBlock(placing,wx,wy);if(blk){toast(blk);sfx('error');return}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}
  const b=addBld(placing,0,wx,wy,false);if(b.type==='harbor'){let best=0,bs=-1;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100])sc+=terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===0?2:terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===1?1:-2;if(sc>bs){bs=sc;best=a}}b.ang=best}
  ownSel().filter(u=>u.type==='worker').forEach(u=>{u.state='build';u.tid=b.id});
  if(!(keep&&afford(0,d.cost)))placing=null;
}
function cancelQueue(b,i){const q=b.queue[i];if(!q)return;refund(0,UNITS[q.type].cost);b.queue.splice(i,1);panelSig=''}

/* ---------- camera & input ---------- */
function resize(){const r=view.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);VW=r.width;VH=r.height;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);
  const mr=mm.getBoundingClientRect();MW=mr.width;MH=mr.height;mm.width=Math.round(MW*dpr);mm.height=Math.round(MH*dpr);clampCam()}
function clampCam(){const vw=VW/cam.z,vh=VH/cam.z;cam.x=vw>=W?(W-vw)/2:Math.max(0,Math.min(W-vw,cam.x));cam.y=vh>=H?(H-vh)/2:Math.max(0,Math.min(H-vh,cam.y))}
function centerOn(x,y){cam.x=x-VW/cam.z/2;cam.y=y-VH/cam.z/2;clampCam()}
const toWorld=(sx,sy)=>({x:cam.x+sx/cam.z,y:cam.y+sy/cam.z});
function evPos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}

cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  if(!G||!G.running)return;const p=evPos(e);mouse.type=e.pointerType;
  try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(e.pointerType!=='mouse'){if(!e.isPrimary)return;drag={sx:p.x,sy:p.y,lx:p.x,ly:p.y,touch:true,moved:false};return}
  const w=toWorld(p.x,p.y);
  if(e.button===2){if(placing||armed){placing=null;armed=false;return}command(w.x,w.y);if(ownSel().length)sfx('order');return}
  if(e.button===1){drag={pan:true,lx:p.x,ly:p.y};e.preventDefault();return}
  if(e.button===0){if(placing){tryPlace(w.x,w.y,e.shiftKey);return}if(armed){attackMove(w.x,w.y);return}drag={sx:p.x,sy:p.y,box:false,shift:e.shiftKey}}
});
cv.addEventListener('pointermove',e=>{
  const p=evPos(e);mouse.x=p.x;mouse.y=p.y;mouse.in=true;mouse.type=e.pointerType;
  if(!drag)return;
  if(drag.pan||drag.touch){if(drag.touch&&!drag.moved&&Math.hypot(p.x-drag.sx,p.y-drag.sy)<9)return;if(drag.touch)drag.moved=true;cam.x-=(p.x-drag.lx)/cam.z;cam.y-=(p.y-drag.ly)/cam.z;drag.lx=p.x;drag.ly=p.y;clampCam();return}
  if(Math.hypot(p.x-drag.sx,p.y-drag.sy)>5)drag.box=true;
});
cv.addEventListener('pointerleave',()=>{mouse.in=false});
cv.addEventListener('pointerup',e=>{
  if(!drag)return;const p=evPos(e);const d=drag;drag=null;
  if(d.pan)return;
  if(d.touch){if(!d.moved)tap(p);return}
  if(d.box){const a=toWorld(Math.min(d.sx,p.x),Math.min(d.sy,p.y)),b=toWorld(Math.max(d.sx,p.x),Math.max(d.sy,p.y));
    const us=G.ents.filter(u=>!u.dead&&u.kind==='unit'&&u.team===0&&u.x>=a.x&&u.x<=b.x&&u.y>=a.y&&u.y<=b.y);
    if(!d.shift)sel.clear();us.forEach(u=>sel.add(u.id));panelSig='';return}
  clickSelect(toWorld(p.x,p.y),d.shift);
});
function clickSelect(w,shift){
  const e=entityAt(w.x,w.y);const now=performance.now();
  if(!e){if(!shift)sel.clear();panelSig='';return}
  if(e.team===0&&now-lastClick.t<350&&lastClick.id===e.id){
    const a=toWorld(0,0),b=toWorld(VW,VH);sel.clear();G.ents.forEach(o=>{if(!o.dead&&o.team===0&&o.type===e.type&&o.x>=a.x&&o.x<=b.x&&o.y>=a.y&&o.y<=b.y)sel.add(o.id)});
  }else if(shift&&e.team===0&&e.kind==='unit'){if(sel.has(e.id))sel.delete(e.id);else{selection().forEach(o=>{if(o.kind!=='unit'||o.team!==0)sel.delete(o.id)});sel.add(e.id)}}
  else{sel.clear();sel.add(e.id)}
  lastClick={t:now,id:e.id};panelSig='';if(e.team===0)sfx('select');
}
function tap(p){
  const w=toWorld(p.x,p.y);
  if(placing){tryPlace(w.x,w.y,false);return}
  if(armed){attackMove(w.x,w.y);return}
  const e=entityAt(w.x,w.y),s=ownSel();
  if(s.length){const workers=s.some(u=>UNITS[u.type].gather);
    const cmd=!e||e.team===1||(e.kind==='node'&&workers)||(e.kind==='node'&&s[0].kind==='bld')||(e.team===0&&e.kind==='bld'&&s[0].kind==='unit'&&workers&&(!e.built||(BLDS[e.type].drop&&s.some(u=>u.carry>0))));
    if(cmd){command(w.x,w.y);return}}
  clickSelect(w,false);
}
cv.addEventListener('wheel',e=>{e.preventDefault();if(!G)return;const p=evPos(e);const before=toWorld(p.x,p.y);
  cam.z=Math.max(.55,Math.min(1.6,cam.z*Math.exp(-e.deltaY*.0015)));cam.x=before.x-p.x/cam.z;cam.y=before.y-p.y/cam.z;clampCam()},{passive:false});
let mmDrag=false;
function mmGo(e){const r=mm.getBoundingClientRect();centerOn((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H)}
mm.addEventListener('pointerdown',e=>{if(!G)return;if(e.button===2&&G.running){const r=mm.getBoundingClientRect();command((e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H);return}mmDrag=true;try{mm.setPointerCapture(e.pointerId)}catch(_){}mmGo(e)});
mm.addEventListener('pointermove',e=>{if(mmDrag)mmGo(e)});
mm.addEventListener('pointerup',()=>{mmDrag=false});
mm.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  keys[e.key]=true;keys[e.key.toLowerCase()]=true;
  if(e.key==='Escape'&&menuOpen){toggleMenu();return}
  if(menuOpen||!G||!G.running)return;
  if(e.key===' '){e.preventDefault();togglePause()}
  else if(e.key==='Escape'){if(placing||armed){placing=null;armed=false}else toggleMenu()}
  else if(e.key==='q'||e.key==='Q'){if(ownSel().some(u=>u.kind==='unit'&&!UNITS[u.type].passive)){armed=true;placing=null}}
  else if(e.key==='h'||e.key==='H'){const hq=G.ents.find(o=>o.type==='hq'&&o.team===0&&!o.dead);if(hq){sel.clear();sel.add(hq.id);centerOn(hq.x,hq.y);panelSig=''}}
  else if(e.key==='.'){selectIdle()}
  else if(e.key==='y'||e.key==='Y'){advAnswer(true)}
  else if(e.key==='x'||e.key==='X'){advAnswer(false)}
  if(e.key.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.key]=false;keys[e.key.toLowerCase()]=false});
function scrollCam(dt){
  let vx=0,vy=0;const s=700/cam.z;
  if(keys.ArrowLeft||keys.a)vx-=1;if(keys.ArrowRight||keys.d)vx+=1;if(keys.ArrowUp||keys.w)vy-=1;if(keys.ArrowDown||keys.s)vy+=1;
  if(mouse.in&&mouse.type==='mouse'&&!drag&&!mmDrag&&G&&G.running){const m=14;if(mouse.x<m)vx-=1;if(mouse.x>VW-m)vx+=1;if(mouse.y<m)vy-=1;if(mouse.y>VH-m)vy+=1}
  if(vx||vy){cam.x+=vx*s*dt;cam.y+=vy*s*dt;clampCam()}
}
function togglePause(){G.paused=!G.paused;$('pauseBtn').textContent=G.paused?tr('Weiter'):tr('Pause')}
let idleIdx=0;
function selectIdle(){const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle');if(!idle.length){toast(tr('Alle Arbeiter haben zu tun.'));return}const u=idle[idleIdx++%idle.length];sel.clear();sel.add(u.id);centerOn(u.x,u.y);panelSig=''}
/* ---------- Berater: macht Vorschläge, die man annehmen oder ablehnen kann ---------- */
let advOn=true;try{advOn=localStorage.getItem('ek-advisor')!=='0'}catch(_){}
const advisor={cur:null,ignore:{},next:0,last:-9,shown:''};
function advFindSpot(type){
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0&&!e.dead);if(!hq)return null;const d0=BLDS[type];
  const base=Math.atan2(H/2-hq.y,W/2-hq.x),far=type==='tower';
  for(let d=far?200:100;d<=(far?330:320);d+=20)for(let k=0;k<36;k++){const a=base+(k%2?1:-1)*Math.ceil(k/2)*.17;const x=hq.x+Math.cos(a)*d,y=hq.y+Math.sin(a)*d;if(!placeBlock(type,x,y))return{x,y}}
  return null}
function advBuild(type){
  const spot=advFindSpot(type),d=BLDS[type];if(!spot){toast(tr('Kein passender Platz gefunden.'));sfx('error');return false}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');return false}
  const b=addBld(type,0,spot.x,spot.y,false);
  if(type==='harbor'){let best=0,bs=-9;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100]){const t=terrAt(spot.x+Math.cos(a)*dd,spot.y+Math.sin(a)*dd);sc+=t===0?2:t===1?1:-2}if(sc>bs){bs=sc;best=a}}b.ang=best}
  const ws=G.ents.filter(e=>!e.dead&&e.team===0&&e.type==='worker'&&!e.upj);
  ws.sort((a,c)=>((a.state==='idle'?0:1)-(c.state==='idle'?0:1))||(Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y)));
  if(ws[0]){ws[0].state='build';ws[0].tid=b.id}
  sfx('click');return true}
function advIdle(){
  const R=G.res[0],ep=G.epoch[0];let i=0;
  const need=(ep>=2&&R.iron<100)?'iron':(ep>=1&&R.stone<150)?'stone':R.food<R.wood?'food':'wood';
  for(const u of G.ents){if(u.dead||u.team!==0||u.kind!=='unit'||!UNITS[u.type].gather||u.state!=='idle'||u.upj)continue;
    const order=UNITS[u.type].naval?['food']:[need,R.food<250?'food':'wood','wood','food'];
    const rt0=order[i++%order.length];
    for(const rt of [rt0,'wood','food']){if(!UNITS[u.type].naval&&!canGather(u,rt))continue;const n=nearestNode(rt,u.x,u.y,900,u,true)||nearestNode(rt,u.x,u.y,900,u);if(n){u.state='gather';u.tid=n.id;u.rtype=rt;u.pf=null;break}}}
  sfx('order')}
function advRules(){
  const ep=G.epoch[0],R=G.res[0],hq=G.ents.find(e=>e.type==='hq'&&e.team===0&&!e.dead);if(!hq||!hq.built)return[];
  const mine=G.ents.filter(e=>!e.dead&&e.team===0),has=t=>mine.filter(e=>e.type===t);
  const workers=has('worker'),idle=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle'&&!e.upj);
  const queuedW=hq.queue.filter(q=>q.type==='worker').length,rules=[],push=r=>rules.push(r);
  const bars=has('barracks'),mil=mine.filter(e=>e.kind==='unit'&&!UNITS[e.type].passive).length;
  if(G.pop[0]>=G.cap[0]-1&&G.cap[0]<60&&!mine.some(e=>e.type==='house'&&!e.built)&&afford(0,BLDS.house.cost)&&advFindSpot('house'))
    push({id:'house',txt:'eine Hütte bauen (die Bevölkerungsgrenze ist fast erreicht)',cost:BLDS.house.cost,go:()=>advBuild('house')});
  if(idle.length)push(idle.length===1?{id:'idle',txt:'eine untätige Einheit an die Arbeit schicken',go:advIdle}:{id:'idle',txt:'{0} untätige Einheiten an die Arbeit schicken',args:[idle.length],go:advIdle});
  if(workers.length+queuedW<[10,14,18][ep]&&hq.queue.length<2&&G.pop[0]<G.cap[0]&&afford(0,UNITS.worker.cost))
    push({id:'worker',txt:'einen Arbeiter ausbilden',cost:UNITS.worker.cost,go:()=>enqueue(hq,'worker',0)&&(panelSig='')});
  const pd=pending(0);
  if(pd.n&&!G.adv[0]){const gs=pd.groups.filter(g=>afford(0,g.cost)).sort((a,b)=>a.n-b.n);
    if(afford(0,pd.cost)&&pd.groups.length>1)push({id:'upg:all',txt:'alles auf Stufe {0} upgraden',args:[LVLN[ep]],cost:pd.cost,go:()=>startUpgrade(0,'all')});
    else if(gs[0])push({id:'upg:'+gs[0].key,txt:'{0} auf Stufe {1} upgraden',args:[tr(gs[0].nm),LVLN[ep]],cost:gs[0].cost,go:()=>startUpgrade(0,gs[0].key)})}
  if(ep<2&&!G.adv[0]&&!pd.n&&!G.jobs[0].length&&afford(0,EPOCHS[ep].cost))push({id:'adv',txt:'in die {0} aufsteigen',args:[tr(EPOCHS[ep+1].name)],cost:EPOCHS[ep].cost,go:()=>advance(0)});
  if(!bars.length&&workers.length>=6&&afford(0,BLDS.barracks.cost)&&advFindSpot('barracks'))push({id:'barracks',txt:'eine Kaserne bauen, um Truppen auszubilden',cost:BLDS.barracks.cost,go:()=>advBuild('barracks')});
  if(ep>=1&&!has('tower').length&&workers.length>=8&&afford(0,BLDS.tower.cost)&&advFindSpot('tower'))push({id:'tower',txt:'einen Wachturm bauen, um Land zu erobern und zu überblicken',cost:BLDS.tower.cost,go:()=>advBuild('tower')});
  if(!has('harbor').length&&workers.length>=9&&afford(0,BLDS.harbor.cost)&&advFindSpot('harbor'))push({id:'harbor',txt:'einen Hafen bauen, um Fische zu fangen',cost:BLDS.harbor.cost,go:()=>advBuild('harbor')});
  const ub=bars.find(b=>b.built&&b.queue.length<1);
  if(ub&&mil<6+ep*3){const t=['sword','spear','club'].find(k=>UNITS[k].ep<=ep&&afford(0,UNITS[k].cost));if(t)push({id:'army',txt:'{0} ausbilden',args:[tr(UNITS[t].name)],cost:UNITS[t].cost,go:()=>enqueue(ub,t,0)&&(panelSig='')})}
  if(G.t>40&&!has('scout').length&&hq.queue.length<2&&afford(0,UNITS.scout.cost))push({id:'scout',txt:'einen Späher ausbilden, um die Karte zu erkunden',cost:UNITS.scout.cost,go:()=>enqueue(hq,'scout',0)&&(panelSig='')});
  return rules}
function advisorUI(){
  const el=$('advisor');if(!el)return;const c=advisor.cur;
  if(!advOn||!c||!G||!G.running||menuOpen){el.hidden=true;advisor.shown='';return}
  el.hidden=false;
  const html=`<div class="ah"><span class="ai">★</span><b>${tr('Berater')}</b></div><p>${tr('Dein Berater schlägt vor:')} <b>${tr(c.txt,...(c.args||[]))}</b></p>${c.cost?`<div class="ac">${costHTML(c.cost)}</div>`:''}<div class="ab"><button class="ub ok" data-a="y">${tr('Annehmen')} (Y)</button><button class="ub bad" data-a="n">${tr('Ablehnen')} (X)</button></div>`;
  if(html!==advisor.shown){advisor.shown=html;el.innerHTML=html}}
function advisorTick(){
  if(!G||!G.running||G.over)return;
  if(!advOn){advisor.cur=null;return}
  if(G.t-advisor.last<1)return;advisor.last=G.t;
  const rules=advRules().filter(r=>!(advisor.ignore[r.id]>G.t));
  if(advisor.cur&&rules.some(r=>r.id===advisor.cur.id)){advisor.cur=rules.find(r=>r.id===advisor.cur.id);return}
  advisor.cur=null;
  if(G.t>=advisor.next&&rules.length){advisor.cur=rules[0];advisor.shown='';sfx('select')}}
function advAnswer(yes){const c=advisor.cur;if(!c)return;advisor.cur=null;advisor.shown='';advisor.next=G.t+(yes?5:3);advisor.ignore[c.id]=G.t+(yes?20:120);if(yes)c.go();panelSig='';infoCache='';advisorUI()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#advisor [data-a]');if(b)advAnswer(b.dataset.a==='y')});

/* ---------- Menü ---------- */
let menuOpen=false,menuPaused=false;
function toggleMenu(){
  menuOpen=!menuOpen;const m=$('menu');
  if(menuOpen){if(G&&G.running&&!G.paused){G.paused=true;menuPaused=true}else menuPaused=false;renderMenu();m.hidden=false}
  else{m.hidden=true;if(menuPaused&&G){G.paused=false;menuPaused=false}$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause')}
}
function renderMenu(){
  const pc=v=>Math.round(v*100)+' %';
  $('menu').innerHTML=`<div class="card"><h1>${tr('Menü')}</h1>
  <div class="set"><label for="mv">${tr('Musik')}</label><input type="range" id="mv" min="0" max="100" value="${Math.round(SND.music*100)}"><output id="mvo">${pc(SND.music)}</output></div>
  <div class="set"><label for="sv">${tr('Ton')}</label><input type="range" id="sv" min="0" max="100" value="${Math.round(SND.sfx*100)}"><output id="svo">${pc(SND.sfx)}</output></div>
  <div class="set"><label for="advChk">${tr('Berater')}</label><input type="checkbox" id="advChk" ${advOn?'checked':''} class="chk"><output></output></div>
  <div class="langrow"><span>${tr('Sprache')}</span><div class="diff" role="group">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div></div>
  <div class="btnrow"><button class="go" id="mResume">${tr('Spiel fortsetzen')}</button><button class="btn2" id="mNew">${tr('Neues Spiel')}</button></div></div>`;
  $('mv').oninput=e=>{SND.init();SND.setMusic(e.target.value/100);$('mvo').textContent=pc(SND.music)};
  $('sv').oninput=e=>{SND.init();SND.setSfx(e.target.value/100);$('svo').textContent=pc(SND.sfx)};
  $('sv').onchange=()=>SND.play('select');
  $('menu').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{applyLang(b.dataset.l);renderMenu()});
  $('advChk').onchange=e=>{advOn=e.target.checked;try{localStorage.setItem('ek-advisor',advOn?'1':'0')}catch(_){}if(!advOn)advisor.cur=null};
  $('mResume').onclick=toggleMenu;
  $('mNew').onclick=()=>{toggleMenu();showStart()};
}
function applyLang(l){setLang(l);panelSig='';infoCache='';$('speedBtn').textContent=tr('Tempo {0}×',G?G.speed:1);$('pauseBtn').textContent=G&&G.paused?tr('Weiter'):tr('Pause');if(!$('overlay').hidden&&G&&!G.running&&!G.overShown)showStart();if(G)updateUI()}
$('menuBtn').onclick=()=>{SND.init();toggleMenu()};
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(typeof SND!=='undefined')SND.init()},{once:true}));
$('pauseBtn').onclick=()=>{if(G&&G.running)togglePause()};
$('speedBtn').onclick=()=>{if(!G)return;G.speed=G.speed===1?2:G.speed===2?3:1;$('speedBtn').textContent=tr('Tempo {0}×',G.speed)};
$('idleBtn').onclick=()=>{if(G&&G.running)selectIdle()};

/* ---------- drawing ---------- */
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(20,28,10,.28)';ctx.beginPath();ctx.ellipse(x+3,y+5,rx,ry,0,0,6.283);ctx.fill()}
function drawNode(e){
  const k=Math.max(.55,Math.sqrt(e.amount/e.maxAmt));
  if(e.type==='tree'){shadow(e.x,e.y,e.r*1.05,e.r*.85);ART.tree(ctx,e,k)}
  else if(e.type==='bush'){shadow(e.x,e.y,e.r,e.r*.75);ART.bush(ctx,e,k)}
  else if(e.sea){
    const T=G.t,a0=e.seed*6.283,bob=Math.sin(T*1.6+e.seed*20)*1.6;ctx.save();ctx.translate(e.x,e.y+bob);ctx.rotate(a0+Math.sin(T*.5+e.seed*9)*.15);
    if(e.type==='fish'){const k=Math.max(.6,e.amount/e.maxAmt);ctx.fillStyle='rgba(8,40,60,.25)';ctx.beginPath();ctx.ellipse(0,0,e.r+3,e.r*.8,0,0,6.283);ctx.fill();
      for(let i=0;i<4;i++){const ox=Math.cos(i*1.7)*e.r*.6,oy=Math.sin(i*2.3)*e.r*.5,sc=k*.9+.2;ctx.fillStyle=i%2?'#cfe6ee':'#a9d0de';ctx.beginPath();ctx.ellipse(ox,oy,4.4*sc,2*sc,0,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(ox-4*sc,oy);ctx.lineTo(ox-7*sc,oy-2*sc);ctx.lineTo(ox-7*sc,oy+2*sc);ctx.fill()}}
    else if(e.type==='dolphin'){ctx.fillStyle='rgba(8,40,60,.3)';ctx.beginPath();ctx.ellipse(2,3,e.r+3,e.r*.6,0,0,6.283);ctx.fill();
      for(let i=0;i<2;i++){const oy=(i-.5)*12;ctx.fillStyle='#7f9fb8';ctx.beginPath();ctx.ellipse(0,oy,e.r+1,e.r*.45,0,0,6.283);ctx.fill();ctx.fillStyle='#d4e2ea';ctx.beginPath();ctx.ellipse(1,oy+1.6,e.r*.8,e.r*.2,0,0,6.283);ctx.fill();
        ctx.fillStyle='#6a89a3';ctx.beginPath();ctx.moveTo(-2,oy-3);ctx.lineTo(-6,oy-8);ctx.lineTo(2,oy-3);ctx.fill();ctx.beginPath();ctx.moveTo(-e.r,oy);ctx.lineTo(-e.r-6,oy-4);ctx.lineTo(-e.r-6,oy+4);ctx.fill()}}
    else{ctx.fillStyle='rgba(8,40,60,.32)';ctx.beginPath();ctx.ellipse(3,4,e.r*1.9,e.r*.8,0,0,6.283);ctx.fill();
      ctx.fillStyle='#41587a';ctx.beginPath();ctx.ellipse(0,0,e.r*1.8,e.r*.72,0,0,6.283);ctx.fill();ctx.fillStyle='#8aa0b8';ctx.beginPath();ctx.ellipse(e.r*.2,e.r*.18,e.r*1.3,e.r*.32,0,0,6.283);ctx.fill();
      ctx.fillStyle='#35496a';ctx.beginPath();ctx.moveTo(-e.r*1.7,0);ctx.lineTo(-e.r*2.6,-e.r*.7);ctx.lineTo(-e.r*2.4,0);ctx.lineTo(-e.r*2.6,e.r*.7);ctx.fill();
      ctx.fillStyle='#10202f';ctx.beginPath();ctx.arc(e.r*1.2,-e.r*.2,1.6,0,6.283);ctx.fill();
      const sp=(Math.sin(T*1.1+e.seed*30)+1)/2;ctx.strokeStyle=`rgba(220,240,250,${.25+sp*.45})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.r*.6,0);ctx.lineTo(e.r*.6,-e.r*(.5+sp*.7));ctx.moveTo(e.r*.6,-e.r*(.5+sp*.7));ctx.lineTo(e.r*.6-5,-e.r*(.2+sp*.4));ctx.moveTo(e.r*.6,-e.r*(.5+sp*.7));ctx.lineTo(e.r*.6+5,-e.r*(.2+sp*.4));ctx.stroke()}
    ctx.restore()}
  else{shadow(e.x,e.y,e.r*1.1,e.r*.8);ART.rock(ctx,e,k,e.type==='iron')}
}
function drawBld(b){
  const m=MAT[G.epoch[b.team]],tc=TC[b.team],r=b.r;
  ctx.save();ctx.globalAlpha=b.built?1:.55;shadow(b.x,b.y,r,r*.85);ctx.translate(b.x,b.y);ctx.lineWidth=1.5;ctx.strokeStyle=m.line;
  if(b.type==='hq'){
    ctx.fillStyle=m.wall;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();
    ctx.fillStyle=m.line;for(let i=0;i<28;i++){const a=i/28*6.283;ctx.beginPath();ctx.arc(Math.cos(a)*(r-3),Math.sin(a)*(r-3),2.6,0,6.283);ctx.fill()}
    ctx.fillStyle=m.roof;ctx.beginPath();ctx.arc(0,0,r*.62,0,6.283);ctx.fill();ctx.stroke();
    ctx.beginPath();for(let i=0;i<8;i++){const a=i/8*6.283;ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62)}ctx.stroke();
    ctx.fillStyle=tc;ctx.beginPath();ctx.arc(0,0,r*.2,0,6.283);ctx.fill();ctx.strokeStyle=TCD[b.team];ctx.stroke();
  }else if(b.type==='harbor'){
    ctx.rotate(b.ang||0);ctx.fillStyle=m.wall;ctx.fillRect(-r,-r*.7,r*1.5,r*1.4);ctx.fillStyle=m.roof;ctx.fillRect(-r,-r*.7,r*1.5,r*.55);ctx.strokeRect(-r,-r*.7,r*1.5,r*1.4);
    ctx.fillStyle='#8a6a42';ctx.fillRect(r*.4,-r*.32,r*1.15,r*.64);ctx.strokeStyle=m.line;ctx.lineWidth=1;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(r*.4+i*r*.23,-r*.32);ctx.lineTo(r*.4+i*r*.23,r*.32);ctx.stroke()}
    ctx.fillStyle=m.line;for(const[px,py]of[[r*1.55,-r*.32],[r*1.55,r*.32],[r*.95,-r*.32],[r*.95,r*.32]]){ctx.beginPath();ctx.arc(px,py,2.4,0,6.283);ctx.fill()}
    ctx.fillStyle=tc;ctx.beginPath();ctx.arc(-r*.2,0,r*.2,0,6.283);ctx.fill();
  }else if(b.type==='house'){
    ctx.rotate(.25);ctx.fillStyle=m.wall;ctx.fillRect(-r,-r*.8,2*r,1.6*r);ctx.fillStyle=m.roof;ctx.beginPath();ctx.moveTo(-r,-r*.8);ctx.lineTo(r,-r*.8);ctx.lineTo(r*.7,0);ctx.lineTo(-r*.7,0);ctx.closePath();ctx.fill();
    ctx.strokeRect(-r,-r*.8,2*r,1.6*r);ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.lineTo(r*.7,0);ctx.stroke();ctx.fillStyle=tc;ctx.fillRect(r*.45,r*.25,r*.4,r*.4);
  }else if(b.type==='store'){
    ctx.fillStyle=m.wall;ctx.fillRect(-r,-r*.75,2*r,1.5*r);ctx.strokeRect(-r,-r*.75,2*r,1.5*r);ctx.fillStyle=m.roof;
    [[-.6,-.4],[0,-.4],[.6,-.4],[-.3,.25],[.3,.25]].forEach(([x,y])=>{ctx.fillRect(x*r-4,y*r-4,8,8);ctx.strokeRect(x*r-4,y*r-4,8,8)});ctx.fillStyle=tc;ctx.fillRect(-r,-r*.75,4,1.5*r);
  }else if(b.type==='barracks'){
    ctx.fillStyle=m.wall;ctx.fillRect(-r,-r,2*r,2*r);ctx.strokeRect(-r,-r,2*r,2*r);ctx.fillStyle=m.roof;ctx.fillRect(-r*.7,-r*.7,1.4*r,1.4*r);ctx.strokeRect(-r*.7,-r*.7,1.4*r,1.4*r);
    ctx.beginPath();ctx.moveTo(-r*.7,0);ctx.lineTo(r*.7,0);ctx.stroke();
    ctx.strokeStyle='#2a2119';ctx.beginPath();ctx.moveTo(r*.85,-r*.9);ctx.lineTo(r*.85,-r*1.6);ctx.stroke();ctx.fillStyle=tc;ctx.beginPath();ctx.moveTo(r*.85,-r*1.6);ctx.lineTo(r*1.35,-r*1.45);ctx.lineTo(r*.85,-r*1.3);ctx.fill();
  }else if(b.type==='tower'){
    ctx.fillStyle=m.wall;ctx.beginPath();ctx.arc(0,0,r,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle=m.line;for(let i=0;i<10;i++){const a=i/10*6.283;ctx.fillRect(Math.cos(a)*(r-2)-2,Math.sin(a)*(r-2)-2,4,4)}
    ctx.fillStyle=m.roof;ctx.beginPath();ctx.arc(0,0,r*.55,0,6.283);ctx.fill();ctx.fillStyle=tc;ctx.beginPath();ctx.arc(0,0,r*.25,0,6.283);ctx.fill();
  }
  ctx.restore();
  {const bx=b.x-r+1,by=b.y-r-2;ctx.fillStyle='rgba(20,15,10,.85)';ctx.strokeStyle=LVLC[b.lvl];ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(bx-9,by-6,18,12);ctx.fill();ctx.stroke();ctx.fillStyle=LVLC[b.lvl];ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(LVLN[b.lvl],bx,by+.5)}
  if(!b.built){ctx.strokeStyle='#ecdfc3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,r+6,-1.57,-1.57+b.prog*6.283);ctx.stroke();
    ctx.setLineDash([4,4]);ctx.lineWidth=1;ctx.strokeStyle='rgba(236,223,195,.6)';ctx.beginPath();ctx.arc(b.x,b.y,r+6,0,6.283);ctx.stroke();ctx.setLineDash([])
    // Fortschrittsbalken mit Beschriftung; rot, wenn niemand baut
    const bw=Math.max(46,r*2+10),bx=b.x-bw/2,by=b.y+r+12,busy=G.ents.some(w=>!w.dead&&w.team===b.team&&w.state==='build'&&w.tid===b.id),warn=b.team===0&&!busy;
    ctx.fillStyle='rgba(20,15,10,.85)';ctx.fillRect(bx-1,by-1,bw+2,9);ctx.fillStyle=warn?'#d0432c':'#e0a24a';ctx.fillRect(bx,by,bw*b.prog,7);
    if(b.team===0){ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,15,10,.9)';const lb=warn?tr('Kein Bauarbeiter!'):tr('Im Bau')+' '+Math.floor(b.prog*100)+' %';ctx.strokeText(lb,b.x,by+10);ctx.fillStyle=warn?'#ff9a85':'#f3e2b3';ctx.fillText(lb,b.x,by+10)}}
}
function drawBoat(u){
  const r=u.r,a=u.fa,T=G.t,bob=Math.sin(T*2+u.id)*.9,war=u.type==='warship';
  ctx.save();ctx.translate(u.x,u.y+bob);
  ctx.fillStyle='rgba(8,40,60,.3)';ctx.beginPath();ctx.ellipse(2,4,r*1.5,r*.8,a,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(235,250,250,.55)';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(-Math.cos(a)*r*.9,-Math.sin(a)*r*.9,r*.9,r*.5,a,0,6.283);ctx.stroke();
  ctx.rotate(a);
  ctx.fillStyle=war?'#6b5236':'#9a6c3c';ctx.strokeStyle='#3c2a18';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(r*1.45,0);ctx.quadraticCurveTo(r*.6,r*.78,-r*1.2,r*.62);ctx.lineTo(-r*1.2,-r*.62);ctx.quadraticCurveTo(r*.6,-r*.78,r*1.45,0);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=TC[u.team];ctx.beginPath();ctx.moveTo(-r*1.2,-r*.5);ctx.lineTo(-r*.7,-r*.5);ctx.lineTo(-r*.7,r*.5);ctx.lineTo(-r*1.2,r*.5);ctx.fill();
  if(war){ctx.fillStyle='#8a8478';ctx.fillRect(-r*.2,-r*.35,r*.9,r*.7);ctx.strokeRect(-r*.2,-r*.35,r*.9,r*.7);ctx.fillStyle=TC[u.team];ctx.beginPath();ctx.arc(r*.25,0,r*.2,0,6.283);ctx.fill();ctx.fillStyle='#4a3a28';ctx.fillRect(r*1.0,-1,r*.7,2)}
  else{ctx.fillStyle='#ecdfc3';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-r*.7,-r*.9);ctx.lineTo(-r*.7,r*.9);ctx.closePath();ctx.fill();ctx.strokeStyle='#6b5236';ctx.stroke();ctx.strokeStyle='#3c2a18';ctx.beginPath();ctx.moveTo(0,-r*.2);ctx.lineTo(0,r*.2);ctx.stroke();
    if(u.carry>0){ctx.fillStyle='#cfe6ee';ctx.beginPath();ctx.ellipse(r*.5,0,3+u.carry/CARRY*2,2,0,0,6.283);ctx.fill()}}
  ctx.restore();
  const n=u.lvl+1;ctx.fillStyle=LVLC[u.lvl];ctx.strokeStyle='rgba(20,15,10,.8)';ctx.lineWidth=1;for(let i=0;i<n;i++){const px=u.x+(i-(n-1)/2)*5,py=u.y+r+6;ctx.beginPath();ctx.arc(px,py,2.1,0,6.283);ctx.fill();ctx.stroke()}
  if(u.team===0&&UNITS[u.type].gather&&u.state==='idle'){const bx=u.x,by=u.y-r-12;ctx.fillStyle='#d0432c';ctx.strokeStyle='#fff3ea';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,6.5,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff3ea';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',bx,by+.5)}
}
function drawUnit(u){
  if(UNITS[u.type].naval){drawBoat(u);return}
  const r=u.r,a=u.fa,ca=Math.cos(a),sa=Math.sin(a);
  shadow(u.x,u.y,r*1.05,r*.8);
  const lunge=u.swing&&G.t-u.swing<.15?2.5:0,moving=G.t-(u.mvT||-9)<.2,sw=u.swing&&G.t-u.swing<.28?1-(G.t-u.swing)/.28:0;
  ART.unit(ctx,u,r,{x:u.x+ca*lunge,y:u.y+sa*lunge,a,tc:TC[u.team],tcd:TCD[u.team],tcl:TCL[u.team],ph:moving?Math.sin(G.t*10+u.id):0,sw,work:G.t-(u.gat||-9)<.25,attacking:u.state==='attack',t:G.t});
  {const n=u.lvl+1;ctx.fillStyle=LVLC[u.lvl];ctx.strokeStyle='rgba(20,15,10,.8)';ctx.lineWidth=1;for(let i=0;i<n;i++){const px=u.x+(i-(n-1)/2)*5,py=u.y+r+6;ctx.beginPath();ctx.arc(px,py,2.1,0,6.283);ctx.fill();ctx.stroke()}}
  if(u.team===0&&UNITS[u.type].gather&&u.state==='idle'){const bx=u.x,by=u.y-r-11;ctx.fillStyle='#d0432c';ctx.strokeStyle='#fff3ea';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(bx,by,6.5,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff3ea';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',bx,by+.5)}
}
function hpBar(e){const w=Math.max(18,e.r*2+4),x=e.x-w/2,y=e.y-e.r-(e.kind==='bld'?12:8);const f=Math.max(0,e.hp/e.maxHp);
  ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(x-1,y-1,w+2,5);ctx.fillStyle=f>.5?'#8fbf63':f>.25?'#e0a24a':'#d0533c';ctx.fillRect(x,y,w*f,3)}
function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#1d1812';ctx.fillRect(0,0,VW,VH);
  if(!G||!bg)return;
  const z=cam.z;ctx.setTransform(dpr*z,0,0,dpr*z,-cam.x*dpr*z,-cam.y*dpr*z);
  const vw=VW/z,vh=VH/z;const sx=Math.max(0,cam.x),sy=Math.max(0,cam.y),sw=Math.min(W-sx,vw+2),sh=Math.min(H-sy,vh+2);
  if(sw>0&&sh>0)ctx.drawImage(bg,sx,sy,sw,sh,sx,sy,sw,sh);
  ctx.imageSmoothingEnabled=true;ctx.drawImage(terrCv,0,0,W,H);
  const x0=cam.x-60,y0=cam.y-60,x1=cam.x+vw+60,y1=cam.y+vh+60;
  const vis=G.ents.filter(e=>!e.dead&&e.x>x0&&e.x<x1&&e.y>y0&&e.y<y1&&shown(e));
  const s=new Set(sel);
  // selection rings under everything
  for(const e of vis)if(s.has(e.id)){ctx.strokeStyle=e.team===1?'#ef9b86':e.team<0?'#ecdfc3':'#f3d48a';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(e.x,e.y+2,e.r+4,(e.r+4)*.8,0,0,6.283);ctx.stroke()}
  vis.filter(e=>e.kind==='node').forEach(drawNode);
  vis.filter(e=>e.kind==='bld').sort((a,b)=>a.y-b.y).forEach(drawBld);
  vis.filter(e=>e.kind==='unit').sort((a,b)=>a.y-b.y).forEach(drawUnit);
  // rally
  for(const b of selection())if(b.kind==='bld'&&b.team===0&&b.rally){ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(243,212,138,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.rally.x,b.rally.y);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='#2a2119';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.rally.x,b.rally.y);ctx.lineTo(b.rally.x,b.rally.y-16);ctx.stroke();ctx.fillStyle=TC[0];ctx.beginPath();ctx.moveTo(b.rally.x,b.rally.y-16);ctx.lineTo(b.rally.x+10,b.rally.y-12);ctx.lineTo(b.rally.x,b.rally.y-8);ctx.fill()}
  // projectiles
  ctx.strokeStyle='#2a2119';ctx.lineWidth=1.4;for(const p of G.proj){ctx.beginPath();ctx.moveTo(p.x-Math.cos(p.a)*7,p.y-Math.sin(p.a)*7);ctx.lineTo(p.x,p.y);ctx.stroke()}
  for(const e of vis)if((e.kind!=='node')&&(s.has(e.id)||e.hp<e.maxHp))hpBar(e);
  for(const e of vis)if(e.kind==='node'&&s.has(e.id)){ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(e.x-12,e.y-e.r-9,24,4);ctx.fillStyle='#ecdfc3';ctx.fillRect(e.x-12,e.y-e.r-9,24*e.amount/e.maxAmt,4)}
  // fx
  for(const f of G.fx){const k=(G.t-f.t)/.7;ctx.strokeStyle=f.kind==='attack'?'#e0533c':f.kind==='rally'?'#f3d48a':'#ecdfc3';ctx.globalAlpha=1-k;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,12*(1-k*.6),9*(1-k*.6),0,0,6.283);ctx.stroke();ctx.globalAlpha=1}
  // Nebel
  ctx.imageSmoothingEnabled=true;ctx.drawImage(fogCv,0,0,W,H);
  // ghost
  if(placing&&mouse.in){const w=toWorld(mouse.x,mouse.y),d=BLDS[placing],ok=!placeBlock(placing,w.x,w.y);ctx.fillStyle=ok?'rgba(143,191,99,.3)':'rgba(208,83,60,.35)';ctx.strokeStyle=ok?'#8fbf63':'#d0533c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w.x,w.y,d.r,0,6.283);ctx.fill();ctx.stroke();
    ctx.setLineDash([4,6]);ctx.lineWidth=1;if(d.shoot){ctx.beginPath();ctx.arc(w.x,w.y,d.r+d.shoot.rng,0,6.283);ctx.stroke()}ctx.strokeStyle='rgba(143,191,99,.8)';ctx.beginPath();ctx.arc(w.x,w.y,d.claim,0,6.283);ctx.stroke();ctx.setLineDash([])}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(drag&&drag.box){ctx.strokeStyle='#f3d48a';ctx.fillStyle='rgba(243,212,138,.08)';ctx.lineWidth=1;const x=Math.min(drag.sx,mouse.x),y=Math.min(drag.sy,mouse.y),w=Math.abs(mouse.x-drag.sx),h=Math.abs(mouse.y-drag.sy);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(armed&&mouse.in){ctx.strokeStyle='#e0533c';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,6.283);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke()}
  drawMini();
}
function drawMini(){
  mctx.setTransform(dpr,0,0,dpr,0,0);mctx.drawImage(bgSmall,0,0,MW,MH);const kx=MW/W,ky=MH/H;
  for(const e of G.ents){if(e.dead||!shown(e))continue;
    if(e.kind==='node'){mctx.fillStyle=e.type==='tree'?'#2b4f27':e.type==='bush'?'#c2553f':e.type==='iron'?'#6d7886':e.type==='fish'?'#bfe3ee':e.type==='dolphin'?'#7fa6c0':e.type==='whale'?'#2c3f66':'#c8c4ba';mctx.fillRect(e.x*kx-1,e.y*ky-1,2,2)}
    else if(e.kind==='bld'){mctx.fillStyle=TC[e.team];const s=e.type==='hq'?6:4;mctx.fillRect(e.x*kx-s/2,e.y*ky-s/2,s,s);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(e.x*kx-s/2,e.y*ky-s/2,s,s)}
    else{mctx.fillStyle=e.team===0?'#a9c8f0':'#f2a28c';mctx.fillRect(e.x*kx-1.2,e.y*ky-1.2,2.4,2.4)}}
  mctx.imageSmoothingEnabled=true;mctx.drawImage(terrCv,0,0,MW,MH);mctx.drawImage(fogCv,0,0,MW,MH);
  if(G.ping&&G.t-G.ping.t<4){const k=((G.t-G.ping.t)%1);mctx.strokeStyle='#e0533c';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(G.ping.x*kx,G.ping.y*ky,3+k*10,0,6.283);mctx.stroke()}
  mctx.strokeStyle='#ecdfc3';mctx.lineWidth=1;mctx.strokeRect(cam.x*kx+.5,cam.y*ky+.5,VW/cam.z*kx,VH/cam.z*ky);
}

/* ---------- UI ---------- */
function toast(msg,kind){const el=document.createElement('div');el.className='toast'+(kind?' '+kind:'');el.textContent=msg;const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),450)},3200)}
const costHTML=c=>RES.filter(r=>c[r]).map(r=>`<span class="c ${(G&&G.res[0][r]||0)>=c[r]?'ok':'bad'}" data-r="${r}" data-n="${c[r]}">${ART.icon(r)}${Math.ceil(c[r])}</span>`).join('');
function actionsFor(s){
  if(!s.length||s[0].team!==0)return[];const f=s[0],acts=[],ep=G.epoch[0];
  if(f.kind==='unit'){
    if(s.some(u=>u.type==='worker'))for(const k of ['house','store','barracks','harbor','tower']){const d=BLDS[k];acts.push({key:'b'+k,nm:tr(d.name),cost:d.cost,sub:tr(d.sub),lock:d.ep>ep?tr(EPOCHS[d.ep].name):null,run:()=>startPlace(k)})}
    if(s.some(u=>u.kind==='unit'&&!UNITS[u.type].passive))acts.push({key:'am',nm:tr('Angriffsmarsch'),sub:tr('Taste Q, dann Ziel'),run:()=>{armed=true;placing=null}});
    acts.push({key:'stop',nm:tr('Halt'),sub:tr('Befehle abbrechen'),run:()=>s.forEach(u=>{if(u.kind==='unit'){u.state='idle';u.amove=null}})});
    return acts;
  }
  if(f.kind==='bld'&&f.built){
    for(const [k,d] of Object.entries(UNITS))if(d.from===f.type)acts.push({key:'t'+k,nm:tr(d.name),cost:d.cost,lock:d.ep>ep?tr(EPOCHS[d.ep].name):null,run:()=>enqueue(f,k,0),unit:k});
    if(f.type==='hq'&&f.team===0){const pd=pending(0);
      if(pd.n)acts.push({key:'upg',nm:tr('Alle upgraden'),cost:pd.cost,adv:true,sub:tr('{0} Gebäude · {1} Truppen',pd.nb,pd.nu),run:()=>startUpgrade(0,'all')});
      if(ep<2)acts.push({key:'adv',nm:tr('Aufstieg: {0}',tr(EPOCHS[ep+1].name)),cost:EPOCHS[ep].cost,adv:true,need:pd.n?tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]):null,sub:pd.n?tr('Erst upgraden'):null,run:()=>advance(0)})}
  }
  return acts;
}
let curActs=[],infoCache='';
$('acts').addEventListener('click',e=>{const b=e.target.closest('.act');if(!b||!G||!G.running)return;const a=curActs[+b.dataset.i];if(!a)return;if(a.lock){toast(tr('Erst ab der {0} verfügbar.',a.lock));sfx('error');return}if(a.need){toast(a.need);sfx('error');return}sfx('click');a.run()});
$('info').addEventListener('pointerdown',e=>{if(!G||!G.running)return;const q=e.target.closest('[data-q]');if(q){const b=selection()[0];if(b&&b.team===0)cancelQueue(b,+q.dataset.q);return}if(e.target.closest('[data-clear]')){sel.clear();panelSig='';return}const ub=e.target.closest('[data-upg]');if(ub){startUpgrade(0,ub.dataset.upg);infoCache='';panelSig=''}});
function infoHTML(s){
  const clr='<button class="x" data-clear aria-label="'+tr('Auswahl aufheben')+'">×</button>';
  if(!s.length)return '<p class="muted">'+tr('Linksklick oder Rahmen ziehen wählt aus. Rechtsklick gibt Befehle: bewegen, sammeln, bauen, angreifen. Doppelklick wählt alle gleichen Einheiten im Bild.')+'</p>';
  if(s.length>1){const c={};s.forEach(e=>{const n=nameOf(e);c[n]=(c[n]||0)+1});return `<div class="ih"><h2>${s.length} ${tr('ausgewählt')}</h2>${clr}</div><div class="chips">${Object.entries(c).map(([n,k])=>`<span class="chip">${k}× ${n}</span>`).join('')}</div>`}
  const e=s[0];const tag=e.team===1?'<span class="tag enemy">'+tr('Gegner')+'</span>':e.team===0?'<span class="tag">'+tr(EPOCHS[G.epoch[0]].name)+'</span>':'';
  const lv=e.kind==='node'?'':`<span class="tag" style="color:${LVLC[e.lvl]};border-color:${LVLC[e.lvl]}">${tr('Stufe {0}',LVLN[e.lvl])}</span>`;
  let h=`<div class="ih"><h2>${nameOf(e)}</h2>${tag}${lv}${clr}</div>`;
  if(e.kind==='node')return h+`<div class="line">${tr('Vorrat')}: <b>${Math.ceil(e.amount)}</b> ${rn(e.rt)}</div>`;
  h+=`<div class="hpw"><div class="hp"><span style="width:${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%"></span></div>${Math.ceil(e.hp)} / ${e.maxHp}</div>`;
  if(e.kind==='unit'){const d=UNITS[e.type];let st=tr(STATE[e.state]||'');if(e.state==='gather')st=tr('Sammelt {0}',rn(e.rtype||e.ctype||'food'));if(e.state==='return')st=tr('Bringt {0} zum Lager',rn(e.ctype));
    h+=`<div class="line">${st}${e.carry>0?` <em>· ${tr('trägt {0} {1}',Math.floor(e.carry),rn(e.ctype))}</em>`:''}</div><div class="line"><em>${tr('Angriff {0} · Reichweite {1}',d.atk,d.ranged?d.rng:tr('Nahkampf'))}</em></div>`}
  else{
    if(!e.built)h+=`<div class="line">${tr('Im Bau: {0} %',Math.floor(e.prog*100))}${e.team===0?' <em>· '+tr('Arbeiter per Rechtsklick zum Bauen schicken')+'</em>':''}</div>`;
    if(e.team===0&&e.type==='hq'&&G.adv[0])h+=`<div class="line">${tr('Aufstieg in die {0}',tr(EPOCHS[G.epoch[0]+1].name))}: <b>${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</b></div>`;
    if(e.team===0&&e.type==='hq'&&G.epoch[0]>=1){const pd=pending(0),R=G.res[0];
      h+=`<div class="upg"><div class="uh"><b>${tr('Upgrades auf Stufe {0}',LVLN[G.epoch[0]])}</b><em>${tr('Vor dem nächsten Aufstieg müssen alle darauf sein')}</em></div>`;
      for(const g of pd.groups){const ok=afford(0,g.cost);h+=`<div class="ur"><span class="un">${tr(g.nm)} <b>×${g.n}</b></span><span class="uc">${costHTML(g.cost)}<small>${Math.ceil(g.time)} s</small></span><button class="ub ${ok?'ok':'bad'}" data-upg="${g.key}">${tr('Upgrade')}</button></div>`}
      for(const j of G.jobs[0]){h+=`<div class="ur run"><span class="un">${j.label}</span><span class="uc"><small>${Math.floor(j.t/j.time*100)} %</small></span><span class="ub busy">${tr('läuft')}</span></div>`}
      if(pd.groups.length>1){const ok=afford(0,pd.cost);h+=`<div class="ur all"><span class="un"><b>${tr('Alles')}</b> <b>×${pd.n}</b></span><span class="uc">${costHTML(pd.cost)}<small>${Math.ceil(pd.time)} s</small></span><button class="ub ${ok?'ok':'bad'}" data-upg="all">${tr('Alles upgraden')}</button></div>`}
      else if(!pd.groups.length&&!G.jobs[0].length)h+=`<div class="line upd">✔ ${tr('Alles auf Stufe {0}',LVLN[G.epoch[0]])}</div>`;
      h+='</div>'}
    if(e.team===0&&e.queue.length){h+='<div class="chips">'+e.queue.map((q,i)=>`<button class="q${q.blocked?' blocked':''}" data-q="${i}" title="${tr('Klicken zum Abbrechen')}">${tr(UNITS[q.type].name)}${q.blocked?' – '+tr('Platz fehlt'):''}<span class="qb"><span style="width:${i===0?(q.t/UNITS[q.type].time*100).toFixed(0):0}%"></span></span></button>`).join('')+'</div>'}
    if(e.team===0&&e.built&&(e.type==='hq'||e.type==='barracks')&&!e.queue.length)h+='<div class="line"><em>'+tr('Rechtsklick auf die Karte setzt den Sammelpunkt.')+'</em></div>';
    if(e.team===0&&BLDS[e.type].pop)h+=`<div class="line"><em>${tr('Bietet Platz für {0} Bewohner',BLDS[e.type].pop)}</em></div>`;
  }
  return h;
}
function updateUI(){
  const r=G.res[0];$('v-food').textContent=Math.floor(r.food);$('v-wood').textContent=Math.floor(r.wood);$('v-stone').textContent=Math.floor(r.stone);$('v-iron').textContent=Math.floor(r.iron);$('res-iron').hidden=G.epoch[0]<2&&r.iron<=0;
  const pe=$('v-pop');pe.textContent=G.pop[0]+'/'+G.cap[0];pe.style.color=G.pop[0]>=G.cap[0]?'var(--warn)':'';
  $('epoch').innerHTML=tr(EPOCHS[G.epoch[0]].name)+(G.adv[0]?`<span class="prog">→ ${tr(EPOCHS[G.epoch[0]+1].name)} ${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</span>`:'');
  const ub=$('upgbar'),js=G.jobs[0];ub.hidden=!js.length;if(js.length){const h=js.map(j=>{const pc=Math.floor(j.t/j.time*100);return `<div class="uj"><span>${tr('Upgrade')}: ${j.label} → ${tr('Stufe {0}',LVLN[j.to])} · ${pc} %</span><div><i style="width:${pc}%"></i></div></div>`}).join('');if(h!==ub._h){ub._h=h;ub.innerHTML=h}}
  const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle').length;const ib=$('idleBtn');ib.textContent=idle===0?tr('Alle Arbeiter beschäftigt'):idle===1?tr('1 untätiger Arbeiter'):tr('{0} untätige Arbeiter',idle);ib.classList.toggle('alert',idle>0);ib.classList.toggle('ok',idle===0);
  advisorTick();advisorUI();
  const s=selection();
  const sig=s.map(e=>e.id+(e.built?'b':'')).join(',')+'|'+G.epoch[0]+'|'+(G.adv[0]?1:0)+G.jobs[0].length+'|'+pending(0).n;
  if(sig!==panelSig){panelSig=sig;curActs=actionsFor(s);$('acts').innerHTML=curActs.map((a,i)=>`<button class="act" data-i="${i}"><span class="nm">${a.nm}</span>${a.cost?`<span class="cost">${costHTML(a.cost)}</span>`:''}${a.lock?`<span class="sub">${tr('ab {0}',a.lock)}</span>`:a.sub?`<span class="sub">${a.sub}</span>`:''}</button>`).join('')}
  $('acts').querySelectorAll('.act').forEach(b=>{const a=curActs[+b.dataset.i];if(!a)return;b.classList.toggle('locked',!!a.lock||!!a.need||!!(a.adv&&G.adv[0])||!!(a.key==='adv'&&G.jobs[0].length));b.classList.toggle('poor',!!a.cost&&!afford(0,a.cost));b.querySelectorAll('.c').forEach(ch=>{const ok=(G.res[0][ch.dataset.r]||0)>=+ch.dataset.n;ch.classList.toggle('ok',ok);ch.classList.toggle('bad',!ok)})});
  const ih=infoHTML(s);if(ih!==infoCache){infoCache=ih;$('info').innerHTML=ih}
  const hint=$('hint');
  if(placing){hint.hidden=false;hint.textContent=tr('{0} platzieren: Klick auf freie Fläche · Umschalt hält den Modus · Rechtsklick oder Esc bricht ab',tr(BLDS[placing].name))}
  else if(armed){hint.hidden=false;hint.textContent=tr('Angriffsmarsch: Ziel anklicken · Truppen greifen unterwegs alles an · Esc bricht ab')}
  else if(G.jobs[0].length){hint.hidden=false;hint.textContent=tr('Upgrade läuft: die betroffenen Einheiten und Gebäude ruhen, bis es fertig ist.')}
  else if(G.paused){hint.hidden=false;hint.textContent=tr('Pausiert · Leertaste setzt fort')}
  else hint.hidden=true;
}

/* ---------- overlay ---------- */
function showStart(){
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${tr('Prototyp · Echtzeitstrategie · 1 gegen 1')}</p><h1>Epochenkrieg</h1>
  <p>${tr('Führe deinen Stamm durch drei Zeitalter. Sammle Nahrung, Holz und Stein, baue deine Siedlung aus und zerstöre das Hauptlager des Gegners, bevor er deins erreicht.')}</p>
  <div class="eras"><span>${tr('Steinzeit')}</span><span>${tr('Bronzezeit')}</span><span>${tr('Eisenzeit')}</span></div>
  <div class="diff" role="group" aria-label="${tr('Schwierigkeit')}">${['leicht','normal','schwer'].map(d=>`<button data-d="${d}" aria-pressed="${d===diff}">${tr(d)}</button>`).join('')}</div>
  <dl class="ctl"><dt>${tr('Auswählen')}</dt><dd>${tr('Linksklick, Rahmen ziehen, Doppelklick für alle gleichen')}</dd><dt>${tr('Befehl')}</dt><dd>${tr('Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt')}</dd><dt>${tr('Kamera')}</dt><dd>${tr('WASD oder Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt')}</dd><dt>${tr('Tasten')}</dt><dd>${tr('Q Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause · Esc Menü')}</dd><dt>${tr('Touch')}</dt><dd>${tr('Tippen wählt aus, mit Auswahl tippen gibt Befehl, Wischen bewegt die Karte')}</dd></dl>
  <div class="langrow"><span>${tr('Sprache')}</span><div class="diff" role="group">${['de','en'].map(l=>`<button data-l="${l}" aria-pressed="${l===LANG}">${l==='de'?'Deutsch':'English'}</button>`).join('')}</div></div>
  <button class="go" id="goBtn">${tr('Spiel starten')}</button></div>`;
  ov.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>applyLang(b.dataset.l));
  ov.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{diff=b.dataset.d;ov.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('goBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();newGame(diff,!!(G&&!G.started));G.running=true;G.started=true;ov.hidden=true;toast(tr('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.'))};
}
function showEnd(){
  G.overShown=true;G.running=false;const win=G.over==='win';sfx(win?'win':'lose');const m=Math.floor(G.t/60),s=Math.floor(G.t%60);
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${win?tr('Das gegnerische Hauptlager ist gefallen'):tr('Dein Hauptlager wurde zerstört')}</p><h1>${win?tr('Sieg'):tr('Niederlage')}</h1>
  <div class="stats"><div><b>${m}:${String(s).padStart(2,'0')}</b><small>${tr('Spielzeit')}</small></div><div><b>${G.stats.trained[0]}</b><small>${tr('Ausgebildet')}</small></div><div><b>${G.stats.lost[1]}</b><small>${tr('Gegner besiegt')}</small></div></div>
  <p>${tr('Erreichtes Zeitalter: {0}. Schwierigkeit: {1}.',tr(EPOCHS[G.epoch[0]].name),tr(diff))}</p>
  <button class="go" id="againBtn">${tr('Neues Spiel')}</button></div>`;
  $('againBtn').onclick=showStart;
}

/* ---------- loop ---------- */
let last=0;
function frame(ts){
  const raw=Math.min(.1,(ts-last)/1000||0);last=ts;
  if(G&&G.running&&!G.paused&&!G.over){let t=raw*G.speed;while(t>0){const s=Math.min(t,.04);step(s);t-=s}}
  if(G&&G.over&&!G.overShown){updateUI();showEnd()}
  scrollCam(raw);draw();
  uiT+=raw;if(G&&uiT>.15){uiT=0;updateUI()}
  requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe(view);new ResizeObserver(resize).observe(mm);
window.__ek={get G(){return G},applyLevels,pending,addUnit,addBld,placeBlock,spawn,nearestNode,centerOn,terrAt,cam};
document.querySelectorAll('[data-ic]').forEach(el=>{el.innerHTML=ART.icon(el.dataset.ic)});
setLang(LANG);resize();newGame('normal');updateUI();showStart();requestAnimationFrame(frame);
})();
