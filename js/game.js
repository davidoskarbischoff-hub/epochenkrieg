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
let fogEx=null,fogVis=null,fogCv=null,fogCtx=null,fogImg=null,fogT=0;
function fogReset(){fogEx=new Uint8Array(FW*FH);fogVis=new Uint8Array(FW*FH);fogCv=document.createElement('canvas');fogCv.width=FW;fogCv.height=FH;fogCtx=fogCv.getContext('2d');fogImg=fogCtx.createImageData(FW,FH);fogT=0;fogUpdate()}
const fogIdx=(x,y)=>Math.max(0,Math.min(FH-1,y/FC|0))*FW+Math.max(0,Math.min(FW-1,x/FC|0));
function sightOf(e){return e.kind==='unit'?UNITS[e.type].sight:e.built?BLDS[e.type].sight:50}
function fogUpdate(){
  fogVis.fill(0);
  for(const e of G.ents){if(e.dead||e.team!==0)continue;const rc=sightOf(e)/FC,cx=e.x/FC,cy=e.y/FC;
    for(let y=Math.max(0,Math.floor(cy-rc));y<=Math.min(FH-1,Math.ceil(cy+rc));y++)for(let x=Math.max(0,Math.floor(cx-rc));x<=Math.min(FW-1,Math.ceil(cx+rc));x++){const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<=rc*rc){const i=y*FW+x;fogVis[i]=1;fogEx[i]=1}}}
  const px=fogImg.data;for(let i=0;i<fogVis.length;i++){const o=i*4;px[o]=44;px[o+1]=46;px[o+2]=50;px[o+3]=fogVis[i]?0:fogEx[i]?70:165}
  fogCtx.putImageData(fogImg,0,0);
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
function reg(e){G.ents.push(e);G.byId.set(e.id,e);return e}
function addUnit(type,team,x,y){const d=UNITS[type];return reg({id:G.nid++,kind:'unit',type,team,x,y,r:d.r,hp:d.hp,maxHp:d.hp,state:'idle',cd:0,carry:0,ctype:null,rtype:null,tid:null,dest:null,amove:null,fa:team===0?-1.57:1.57})}
function addBld(type,team,x,y,built){const d=BLDS[type];return reg({id:G.nid++,kind:'bld',type,team,x,y,r:d.r,maxHp:d.hp,hp:built?d.hp:1,built,prog:built?1:0,queue:[],rally:null,cd:0})}
function addNode(type,x,y){const d=NODES[type];return reg({id:G.nid++,kind:'node',type,team:-1,x,y,r:d.r,rt:d.rt,amount:d.amt,maxAmt:d.amt,seed:Math.random()})}
function get(id){const e=G.byId.get(id);return e&&!e.dead?e:null}
function nameOf(e){return e.kind==='unit'?UNITS[e.type].name:e.kind==='bld'?BLDS[e.type].name:NODES[e.type].name}

/* ---------- map ---------- */
function genMap(seed){
  const R=mulberry(seed);
  const bases=[{x:330,y:1270,s:1},{x:W-330,y:H-1270,s:-1}];
  const cluster=(type,cx,cy,n,spread)=>{for(let i=0;i<n;i++){for(let k=0;k<14;k++){const a=R()*6.283,d=Math.sqrt(R())*spread;const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,r=NODES[type].r;if(x<24||y<24||x>W-24||y>H-24)continue;if(G.ents.some(e=>Math.hypot(e.x-x,e.y-y)<e.r+r+3))continue;addNode(type,x,y);break}}};
  bases.forEach((b,i)=>{
    addBld('hq',i,b.x,b.y,true);
    for(let k=0;k<4;k++)addUnit('worker',i,b.x+b.s*(k*18-27),b.y-b.s*58);
    const s=b.s;
    cluster('tree',b.x+s*235,b.y+s*40,16,70);
    cluster('tree',b.x+s*40,b.y-s*300,14,68);
    cluster('bush',b.x-s*10,b.y-s*165,7,38);
    cluster('stone',b.x-s*175,b.y+s*25,4,30);
  });
  // mirrored middle features keep the map fair
  const feats=[];
  for(let i=0;i<6;i++)feats.push(['tree',12+Math.floor(R()*8),80]);
  for(let i=0;i<2;i++)feats.push(['stone',4,32]);
  for(let i=0;i<2;i++)feats.push(['bush',5,38]);
  for(const [t,n,sp] of feats){
    let x,y,ok=false;
    for(let k=0;k<40&&!ok;k++){x=150+R()*(W-300);y=150+R()*(H-300);ok=bases.every(b=>Math.hypot(b.x-x,b.y-y)>460)&&Math.hypot(x-W/2,y-H/2)>90}
    if(!ok)continue;
    const n0=G.ents.length;cluster(t,x,y,n,sp);
    const made=G.ents.slice(n0);made.forEach(e=>{const mx=W-e.x,my=H-e.y;if(!G.ents.some(o=>Math.hypot(o.x-mx,o.y-my)<o.r+e.r+3))addNode(e.type,mx,my)});
  }
}
function renderBg(seed){
  bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');const R=mulberry(seed+99);
  b.fillStyle='#6c8544';b.fillRect(0,0,W,H);
  for(let i=0;i<700;i++){const x=R()*W,y=R()*H,r=30+R()*110;const g=b.createRadialGradient(x,y,0,x,y,r);const c=R()<.55?'82,110,52':R()<.5?'128,146,76':'140,128,78';g.addColorStop(0,`rgba(${c},${.18+R()*.28})`);g.addColorStop(1,`rgba(${c},0)`);b.fillStyle=g;b.fillRect(x-r,y-r,2*r,2*r)}
  [[330,1270],[W-330,H-1270]].forEach(([x,y])=>{const g=b.createRadialGradient(x,y,30,x,y,190);g.addColorStop(0,'rgba(146,116,74,.6)');g.addColorStop(1,'rgba(146,116,74,0)');b.fillStyle=g;b.fillRect(x-190,y-190,380,380)});
  b.lineWidth=1;for(let i=0;i<7000;i++){const x=R()*W,y=R()*H;b.strokeStyle=R()<.5?'rgba(60,84,38,.45)':'rgba(160,172,98,.35)';b.beginPath();b.moveTo(x,y);b.lineTo(x+(R()-.5)*3,y-3-R()*3);b.stroke()}
  b.strokeStyle='rgba(30,22,14,.5)';b.lineWidth=6;b.strokeRect(3,3,W-6,H-6);
  bgSmall=document.createElement('canvas');bgSmall.width=240;bgSmall.height=160;bgSmall.getContext('2d').drawImage(bg,0,0,240,160);
}

/* ---------- game ---------- */
function newGame(d){
  diff=d;
  G={t:0,ents:[],byId:new Map(),nid:1,res:[{food:200,wood:200,stone:100},{food:200,wood:200,stone:100}],epoch:[0,0],adv:[null,null],pop:[0,0],cap:[0,0],speed:1,paused:false,running:false,over:null,overShown:false,proj:[],fx:[],aiT:1,alertT:-99,ping:null,ai:{next:DIFF[d].first,wave:DIFF[d].wave},stats:{lost:[0,0],trained:[0,0]}};
  sel.clear();placing=null;armed=false;panelSig='';if(typeof SND!=='undefined')SND.setEpoch(0);
  const seed=(Math.random()*1e9)|0;genMap(seed);renderBg(seed);
  G.solids=G.ents.filter(e=>e.kind!=='unit');recount();fogReset();
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0);centerOn(hq.x+120,hq.y-80);
  $('pauseBtn').textContent='Pause';$('speedBtn').textContent='Tempo 1×';
}
function recount(){G.pop=[0,0];G.cap=[0,0];for(const e of G.ents){if(e.dead)continue;if(e.kind==='unit')G.pop[e.team]++;else if(e.kind==='bld'&&e.built&&BLDS[e.type].pop)G.cap[e.team]+=BLDS[e.type].pop}G.cap=G.cap.map(c=>Math.min(60,c))}
function afford(t,c){return RES.every(r=>(G.res[t][r]||0)>=(c[r]||0))}
function pay(t,c){if(!afford(t,c))return false;RES.forEach(r=>G.res[t][r]-=c[r]||0);return true}
function refund(t,c){RES.forEach(r=>G.res[t][r]+=c[r]||0)}
function missing(t,c){const m=RES.filter(r=>(G.res[t][r]||0)<(c[r]||0)).map(r=>RN[r]);return 'Nicht genug '+m.join(' und ')}

function step(dt){
  G.t+=dt;
  G.solids=G.ents.filter(e=>e.kind!=='unit'&&!e.dead);
  recount();
  for(const e of G.ents){if(e.dead)continue;if(e.kind==='unit')updUnit(e,dt);else if(e.kind==='bld')updBld(e,dt)}
  for(let t=0;t<2;t++){const a=G.adv[t];if(!a)continue;a.t+=dt;if(a.t>=a.time){G.epoch[t]++;G.adv[t]=null;panelSig='';if(t===0){sfx('epoch');if(typeof SND!=='undefined')SND.setEpoch(G.epoch[0])}if(t===0)toast(EPOCHS[G.epoch[0]].name+' erreicht! Neue Einheiten und Gebäude verfügbar.','good');else toast('Der Gegner hat die '+EPOCHS[G.epoch[1]].name+' erreicht.','warn')}}
  for(const p of G.proj){const t=get(p.tid);if(!t){p.dead=true;continue}const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy),s=380*dt;p.a=Math.atan2(dy,dx);if(d<=s+t.r*.5){damage(t,p.dmg,get(p.src));p.dead=true}else{p.x+=dx/d*s;p.y+=dy/d*s}}
  G.proj=G.proj.filter(p=>!p.dead);
  separate();
  fogT+=dt;if(fogT>=.2){fogT=0;fogUpdate()}
  G.ents=G.ents.filter(e=>{if(e.dead){G.byId.delete(e.id);return false}return true});
  G.aiT+=dt;if(G.aiT>=1){G.aiT=0;aiTick()}
  G.fx=G.fx.filter(f=>G.t-f.t<.7);
}

function moveToward(u,tx,ty,dt,ignore){
  let dx=tx-u.x,dy=ty-u.y;const d=Math.hypot(dx,dy);if(d<1.5)return true;
  const step=Math.min(d,UNITS[u.type].spd*dt);dx/=d;dy/=d;
  for(const o of G.solids){if(o.id===ignore||o.dead)continue;const ox=o.x-u.x,oy=o.y-u.y,od=Math.hypot(ox,oy),R=o.r+u.r+1;
    if(od<R+step+3&&(ox*dx+oy*dy)>0&&od>0.01){let tx2=-oy/od,ty2=ox/od;if(tx2*dx+ty2*dy<0){tx2=-tx2;ty2=-ty2}dx=tx2;dy=ty2;break}}
  u.x+=dx*step;u.y+=dy*step;u.fa=Math.atan2(dy,dx);return d<=step;
}
function nearestNode(rt,x,y,max){let best=null,bd=max;for(const e of G.solids){if(e.kind!=='node'||e.dead||(rt&&e.rt!==rt))continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function nearestDrop(t,x,y){let best=null,bd=1e9;for(const e of G.solids){if(e.kind!=='bld'||e.team!==t||!e.built||!BLDS[e.type].drop||e.dead)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function findEnemy(s,rad,unitsOnly){let best=null,bd=1e9;for(const e of G.ents){if(e.dead||e.team<0||e.team===s.team)continue;if(unitsOnly&&e.kind!=='unit')continue;const d=Math.hypot(e.x-s.x,e.y-s.y)-e.r-s.r;if(d>rad)continue;const sc=d+(e.kind==='bld'?80:0);if(sc<bd){bd=sc;best=e}}return best}
const reach=(u,t)=>dist(u,t)<=u.r+t.r+5;

function updUnit(u,dt){
  const d=UNITS[u.type];u.cd=Math.max(0,u.cd-dt);
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
    if(!n){n=nearestNode(u.rtype,u.x,u.y,350);if(!n){if(u.carry>0)u.state='return';else{u.state='idle';u.rtype=null}break}u.tid=n.id}
    if(u.carry>0&&u.ctype!==n.rt)u.carry=0;
    if(u.carry>=CARRY){u.state='return';break}
    if(reach(u,n)){u.fa=Math.atan2(n.y-u.y,n.x-u.x);if((u.gt=(u.gt||0)-dt)<=0){u.gt=.75+Math.random()*.2;sfx(n.rt==='wood'?'chop':n.rt==='stone'?'mine':'pick',u)}const rate=.85*(u.team===1?DIFF[diff].gather:1);const amt=Math.min(rate*dt,n.amount);u.carry+=amt;u.ctype=n.rt;n.amount-=amt;if(n.amount<=0.001)kill(n);if(u.carry>=CARRY)u.state='return'}
    else moveToward(u,n.x,n.y,dt,n.id);break}
  case 'return':{const dp=nearestDrop(u.team,u.x,u.y);if(!dp||!u.ctype){u.state='idle';break}
    if(reach(u,dp)){G.res[u.team][u.ctype]+=u.carry;if(u.team===0)sfx('drop',u);u.carry=0;u.state='gather'}else moveToward(u,dp.x,dp.y,dt,dp.id);break}
  case 'build':{const b=get(u.tid);
    if(!b||b.built){u.state='idle';if(b&&b.built&&BLDS[b.type].drop){const n=nearestNode(null,b.x,b.y,260);if(n){u.tid=n.id;u.rtype=n.rt;u.state='gather'}}break}
    if(reach(u,b)){u.fa=Math.atan2(b.y-u.y,b.x-u.x);if((u.bt=(u.bt||0)-dt)<=0){u.bt=.6;sfx('hammer',u)}const inc=dt/BLDS[b.type].time;b.prog=Math.min(1,b.prog+inc);b.hp=Math.min(b.maxHp,b.hp+inc*b.maxHp);
      if(b.prog>=1){b.built=true;panelSig='';if(b.team===0){toast(BLDS[b.type].name+' fertiggestellt.');sfx('built')}}}
    else moveToward(u,b.x,b.y,dt,b.id);break}
  }
}
function hit(u,t){const d=UNITS[u.type];sfx(d.ranged?'arrow':'hit',u);const mult=t.kind==='bld'?(d.ranged?.3:1):1;
  if(d.ranged)G.proj.push({x:u.x,y:u.y,tid:t.id,dmg:d.atk*mult,src:u.id,a:0});else damage(t,d.atk*mult,u)}
function damage(t,amt,src){
  t.hp-=amt;
  if(src&&t.kind==='unit'&&!UNITS[t.type].passive&&t.state==='idle'){t.tid=src.id;t.state='attack'}
  if(t.team===0&&G.t-G.alertT>12){G.alertT=G.t;G.ping={x:t.x,y:t.y,t:G.t};toast('Deine Siedlung wird angegriffen!','warn');sfx('alert')}
  if(t.hp<=0)kill(t);
}
function kill(e){if(e.dead)return;e.dead=true;if(e.kind==='unit')sfx('die',e);else if(e.kind==='bld')sfx('crumble',e);sel.delete(e.id);if(e.kind==='unit')G.stats.lost[e.team]++;
  if(e.type==='hq'&&!G.over)G.over=e.team===0?'lose':'win';}
function updBld(b,dt){
  if(!b.built)return;const d=BLDS[b.type];
  if(d.shoot){b.cd=Math.max(0,b.cd-dt);if(b.cd<=0){const t=findEnemy(b,d.shoot.rng,true);if(t){b.cd=d.shoot.cd;sfx('arrow',b);G.proj.push({x:b.x,y:b.y-8,tid:t.id,dmg:d.shoot.atk,src:b.id,a:0})}}}
  if(b.queue.length){const q=b.queue[0];if(G.pop[b.team]>=G.cap[b.team]){q.blocked=true}else{q.blocked=false;q.t+=dt;if(q.t>=UNITS[q.type].time){b.queue.shift();spawn(b,q.type)}}}
}
function spawn(b,type){
  const rp=b.rally;let ang=rp?Math.atan2(rp.y-b.y,rp.x-b.x):(b.team===0?-1.57:1.57);ang+=(Math.random()-.5)*.8;
  const u=addUnit(type,b.team,b.x+Math.cos(ang)*(b.r+10),b.y+Math.sin(ang)*(b.r+10));
  G.pop[b.team]++;G.stats.trained[b.team]++;if(b.team===0)sfx('ready');
  if(rp){const n=rp.id?get(rp.id):null;
    if(n&&n.kind==='node'&&type==='worker'){u.state='gather';u.tid=n.id;u.rtype=n.rt}
    else if(rp.nodeType&&type==='worker'){u.state='gather';u.rtype=rp.nodeType;u.tid=null}
    else{u.state='move';u.dest={x:rp.x+(Math.random()-.5)*30,y:rp.y+(Math.random()-.5)*30}}}
}
function enqueue(b,type,team){
  const d=UNITS[type];
  if(d.ep>G.epoch[team]){if(team===0){toast('Erst ab der '+EPOCHS[d.ep].name+' verfügbar.');sfx('error')}return false}
  if(b.queue.length>=5){if(team===0){toast('Die Warteschlange ist voll (max. 5).');sfx('error')}return false}
  if(!pay(team,d.cost)){if(team===0){toast(missing(team,d.cost)+'.');sfx('error')}return false}
  b.queue.push({type,t:0});if(team===0)panelSig='';return true;
}
function advance(team){
  const ep=G.epoch[team];if(ep>=2||G.adv[team])return false;const c=EPOCHS[ep].cost;
  if(!pay(team,c)){if(team===0)toast(missing(team,c)+'.');return false}
  G.adv[team]={t:0,time:EPOCHS[ep].time};if(team===0){panelSig='';toast('Aufstieg in die '+EPOCHS[ep+1].name+' begonnen.')}return true;
}
function validSpot(x,y,r){if(x<r+12||y<r+12||x>W-r-12||y>H-r-12)return false;for(const e of G.ents){if(e.dead||e.kind==='unit')continue;if(Math.hypot(e.x-x,e.y-y)<e.r+r+5)return false}return true}
function separate(){
  const us=G.ents.filter(e=>e.kind==='unit'&&!e.dead);
  for(let i=0;i<us.length;i++){const a=us[i];for(let j=i+1;j<us.length;j++){const b=us[j];let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(Math.abs(dx)>m||Math.abs(dy)>m)continue;let d=Math.hypot(dx,dy);if(d>=m)continue;if(d<.01){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy)}const p=(m-d)/2*.8;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p}}
  for(const u of us){for(const o of G.solids){if(o.dead)continue;let dx=u.x-o.x,dy=u.y-o.y;const R=o.r+u.r;if(Math.abs(dx)>R||Math.abs(dy)>R)continue;let d=Math.hypot(dx,dy);if(d>=R)continue;if(d<.01){dx=1;dy=0;d=1}u.x=o.x+dx/d*R;u.y=o.y+dy/d*R}
    u.x=Math.max(u.r,Math.min(W-u.r,u.x));u.y=Math.max(u.r,Math.min(H-u.r,u.y))}
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
  const w8=[{food:.6,wood:.4,stone:0},{food:.4,wood:.32,stone:.28},{food:.42,wood:.26,stone:.32}][ep];
  const cnt={food:0,wood:0,stone:0};workers.forEach(w=>{if(w.state!=='idle'&&w.rtype)cnt[w.rtype]++});
  for(const w of workers){if(w.state!=='idle')continue;
    const n=workers.length;const order=RES.slice().sort((a,b)=>(w8[b]*n-cnt[b])-(w8[a]*n-cnt[a]));
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
    if(t&&t.kind==='node'&&u.type==='worker'){u.state='gather';u.tid=t.id;u.rtype=t.rt;u.amove=null}
    else if(t&&t.team===1){u.state='attack';u.tid=t.id;u.amove=null}
    else if(t&&t.team===0&&t.kind==='bld'&&!t.built&&u.type==='worker'){u.state='build';u.tid=t.id}
    else if(t&&t.team===0&&t.kind==='bld'&&BLDS[t.type].drop&&u.type==='worker'&&u.carry>0){u.state='return'}
    else{const ox=(i%cols-(cols-1)/2)*18,oy=(Math.floor(i/cols)-(cols-1)/2)*18;u.state='move';u.dest={x:wx+ox,y:wy+oy};u.amove=null;i++}
  }
  fxMark(wx,wy,t&&t.team===1?'attack':'move');
}
function attackMove(wx,wy){
  const units=ownSel().filter(e=>e.kind==='unit'&&e.type!=='worker');const cols=Math.ceil(Math.sqrt(units.length));
  units.forEach((u,i)=>{u.amove={x:wx+(i%cols-(cols-1)/2)*18,y:wy+(Math.floor(i/cols)-(cols-1)/2)*18};u.state='amove'});
  armed=false;fxMark(wx,wy,'attack');
}
function startPlace(type){const d=BLDS[type];if(d.ep>G.epoch[0]){toast('Erst ab der '+EPOCHS[d.ep].name+' verfügbar.');sfx('error');return}if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');sfx('error');return}placing=type;armed=false}
function tryPlace(wx,wy,keep){
  const d=BLDS[placing];if(!validSpot(wx,wy,d.r)){toast('Hier ist kein Platz.');return}
  if(!fogEx[fogIdx(wx,wy)]){toast('Dieses Gebiet ist noch unerkundet.');sfx('error');return}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}
  const b=addBld(placing,0,wx,wy,false);
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
  if(s.length){const workers=s.some(u=>u.type==='worker');
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
  keys[e.key]=true;if(!G||!G.running)return;
  if(e.key===' '){e.preventDefault();togglePause()}
  else if(e.key==='Escape'){if(placing||armed){placing=null;armed=false}else{sel.clear();panelSig=''}}
  else if(e.key==='a'||e.key==='A'){if(ownSel().some(u=>u.kind==='unit'&&u.type!=='worker')){armed=true;placing=null}}
  else if(e.key==='h'||e.key==='H'){const hq=G.ents.find(o=>o.type==='hq'&&o.team===0&&!o.dead);if(hq){sel.clear();sel.add(hq.id);centerOn(hq.x,hq.y);panelSig=''}}
  else if(e.key==='.'){selectIdle()}
  else if(e.key==='m'||e.key==='M'){$('musicBtn').click()}
  else if(e.key==='n'||e.key==='N'){$('sfxBtn').click()}
  if(e.key.startsWith('Arrow'))e.preventDefault();
});
addEventListener('keyup',e=>{keys[e.key]=false});
function scrollCam(dt){
  let vx=0,vy=0;const s=700/cam.z;
  if(keys.ArrowLeft)vx-=1;if(keys.ArrowRight)vx+=1;if(keys.ArrowUp)vy-=1;if(keys.ArrowDown)vy+=1;
  if(mouse.in&&mouse.type==='mouse'&&!drag&&!mmDrag&&G&&G.running){const m=14;if(mouse.x<m)vx-=1;if(mouse.x>VW-m)vx+=1;if(mouse.y<m)vy-=1;if(mouse.y>VH-m)vy+=1}
  if(vx||vy){cam.x+=vx*s*dt;cam.y+=vy*s*dt;clampCam()}
}
function togglePause(){G.paused=!G.paused;$('pauseBtn').textContent=G.paused?'Weiter':'Pause'}
let idleIdx=0;
function selectIdle(){const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.type==='worker'&&e.state==='idle');if(!idle.length){toast('Alle Arbeiter haben zu tun.');return}const u=idle[idleIdx++%idle.length];sel.clear();sel.add(u.id);centerOn(u.x,u.y);panelSig=''}
function soundBtns(){if(typeof SND==='undefined')return;$('musicBtn').classList.toggle('off',!SND.music);$('sfxBtn').classList.toggle('off',!SND.sfx)}
$('musicBtn').onclick=()=>{SND.init();SND.toggleMusic();soundBtns()};
$('sfxBtn').onclick=()=>{SND.init();SND.toggleSfx();soundBtns()};
soundBtns();
['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,()=>{if(typeof SND!=='undefined')SND.init()},{once:true}));
$('pauseBtn').onclick=()=>{if(G&&G.running)togglePause()};
$('speedBtn').onclick=()=>{if(!G)return;G.speed=G.speed===1?2:G.speed===2?3:1;$('speedBtn').textContent='Tempo '+G.speed+'×'};
$('idleBtn').onclick=()=>{if(G&&G.running)selectIdle()};

/* ---------- drawing ---------- */
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(20,28,10,.28)';ctx.beginPath();ctx.ellipse(x+3,y+5,rx,ry,0,0,6.283);ctx.fill()}
function drawNode(e){
  const k=Math.max(.55,Math.sqrt(e.amount/e.maxAmt));
  if(e.type==='tree'){shadow(e.x,e.y,e.r,e.r*.8);ctx.fillStyle='#2b4f27';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.283);ctx.fill();
    ctx.fillStyle='#3c6c33';ctx.beginPath();ctx.arc(e.x-2,e.y-2,e.r*.68,0,6.283);ctx.fill();ctx.fillStyle='#55883f';ctx.beginPath();ctx.arc(e.x-3.5,e.y-4,e.r*.32,0,6.283);ctx.fill();
    if(k<.99){ctx.fillStyle='#a77b48';ctx.beginPath();ctx.arc(e.x+e.r*.5,e.y+e.r*.5,2.5,0,6.283);ctx.fill()}}
  else if(e.type==='bush'){shadow(e.x,e.y,e.r,e.r*.7);ctx.fillStyle='#466f30';ctx.beginPath();ctx.arc(e.x,e.y,e.r*k+2,0,6.283);ctx.fill();
    ctx.fillStyle='#5b8a3b';ctx.beginPath();ctx.arc(e.x-2,e.y-2,e.r*.6*k+1,0,6.283);ctx.fill();
    const n=Math.ceil(5*e.amount/e.maxAmt);ctx.fillStyle='#c73a3f';for(let i=0;i<n;i++){const a=e.seed*6+i*1.26;ctx.beginPath();ctx.arc(e.x+Math.cos(a)*e.r*.55,e.y+Math.sin(a)*e.r*.55,1.8,0,6.283);ctx.fill()}}
  else{const r=e.r*k+3;shadow(e.x,e.y,r,r*.7);ctx.fillStyle='#8a877e';ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*6.283+e.seed,rr=r*(.8+((i*37+e.seed*100)%10)/40);ctx.lineTo(e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr)}ctx.closePath();ctx.fill();
    ctx.fillStyle='#b3afa4';ctx.beginPath();ctx.moveTo(e.x-r*.5,e.y-r*.1);ctx.lineTo(e.x-r*.1,e.y-r*.6);ctx.lineTo(e.x+r*.35,e.y-r*.3);ctx.lineTo(e.x,e.y+r*.05);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#5d5a53';ctx.lineWidth=1;ctx.stroke()}
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
  if(!b.built){ctx.strokeStyle='#ecdfc3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,r+6,-1.57,-1.57+b.prog*6.283);ctx.stroke();
    ctx.setLineDash([4,4]);ctx.lineWidth=1;ctx.strokeStyle='rgba(236,223,195,.6)';ctx.beginPath();ctx.arc(b.x,b.y,r+6,0,6.283);ctx.stroke();ctx.setLineDash([])}
}
function drawUnit(u){
  const tc=TC[u.team],r=u.r,a=u.fa,ca=Math.cos(a),sa=Math.sin(a);
  shadow(u.x,u.y,r,r*.7);
  const lunge=u.swing&&G.t-u.swing<.15?2.5:0;const x=u.x+ca*lunge,y=u.y+sa*lunge;
  ctx.lineCap='round';ctx.strokeStyle='#e8d9b5';
  const tip=(len,w)=>{ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x+ca*r*.3-sa*r*.6,y+sa*r*.3+ca*r*.6);ctx.lineTo(x+ca*(r+len)-sa*r*.6,y+sa*(r+len)+ca*r*.6);ctx.stroke()};
  if(u.type==='scout')tip(9,1);else if(u.type==='club')tip(4,3.2);else if(u.type==='spear')tip(11,1.6);else if(u.type==='sword'){tip(7,2.2);ctx.lineWidth=1.6;ctx.beginPath();const bx=x+ca*r-sa*r*.6,by=y+sa*r+ca*r*.6;ctx.moveTo(bx-sa*3,by+ca*3);ctx.lineTo(bx+sa*3,by-ca*3);ctx.stroke()}
  else if(u.type==='archer'){ctx.lineWidth=1.6;ctx.strokeStyle='#c9a36a';ctx.beginPath();ctx.arc(x,y,r+3,a-.9,a+.9);ctx.stroke()}
  else if(u.type==='worker'){ctx.lineWidth=1.6;ctx.strokeStyle='#a98a5c';ctx.beginPath();ctx.moveTo(x-sa*r*.5,y+ca*r*.5);ctx.lineTo(x+ca*(r+3)-sa*r*.5,y+sa*(r+3)+ca*r*.5);ctx.stroke()}
  ctx.fillStyle=tc;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle=TCD[u.team];ctx.stroke();
  ctx.fillStyle=TCL[u.team];ctx.beginPath();ctx.arc(x+ca*r*.25,y+sa*r*.25,r*.42,0,6.283);ctx.fill();
  if(u.type!=='worker'){ctx.strokeStyle=u.type==='scout'?'#9fc7a0':u.type==='sword'?'#d8d4cb':u.type==='spear'||u.type==='archer'?'#c9a36a':'#8a6a42';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r-1.5,0,6.283);ctx.stroke()}
  if(u.carry>0&&u.ctype){ctx.fillStyle=u.ctype==='food'?'#c2553f':u.ctype==='wood'?'#9a6c3c':'#c8c4ba';ctx.beginPath();ctx.arc(x-ca*r*.9,y-sa*r*.9,2.6+u.carry/CARRY*1.5,0,6.283);ctx.fill()}
}
function hpBar(e){const w=Math.max(18,e.r*2+4),x=e.x-w/2,y=e.y-e.r-(e.kind==='bld'?12:8);const f=Math.max(0,e.hp/e.maxHp);
  ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(x-1,y-1,w+2,5);ctx.fillStyle=f>.5?'#8fbf63':f>.25?'#e0a24a':'#d0533c';ctx.fillRect(x,y,w*f,3)}
function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#1d1812';ctx.fillRect(0,0,VW,VH);
  if(!G||!bg)return;
  const z=cam.z;ctx.setTransform(dpr*z,0,0,dpr*z,-cam.x*dpr*z,-cam.y*dpr*z);
  const vw=VW/z,vh=VH/z;const sx=Math.max(0,cam.x),sy=Math.max(0,cam.y),sw=Math.min(W-sx,vw+2),sh=Math.min(H-sy,vh+2);
  if(sw>0&&sh>0)ctx.drawImage(bg,sx,sy,sw,sh,sx,sy,sw,sh);
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
  if(placing&&mouse.in){const w=toWorld(mouse.x,mouse.y),d=BLDS[placing],ok=validSpot(w.x,w.y,d.r);ctx.fillStyle=ok?'rgba(143,191,99,.3)':'rgba(208,83,60,.35)';ctx.strokeStyle=ok?'#8fbf63':'#d0533c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w.x,w.y,d.r,0,6.283);ctx.fill();ctx.stroke();
    if(d.shoot){ctx.setLineDash([4,6]);ctx.lineWidth=1;ctx.beginPath();ctx.arc(w.x,w.y,d.r+d.shoot.rng,0,6.283);ctx.stroke();ctx.setLineDash([])}}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(drag&&drag.box){ctx.strokeStyle='#f3d48a';ctx.fillStyle='rgba(243,212,138,.08)';ctx.lineWidth=1;const x=Math.min(drag.sx,mouse.x),y=Math.min(drag.sy,mouse.y),w=Math.abs(mouse.x-drag.sx),h=Math.abs(mouse.y-drag.sy);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(armed&&mouse.in){ctx.strokeStyle='#e0533c';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,6.283);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke()}
  drawMini();
}
function drawMini(){
  mctx.setTransform(dpr,0,0,dpr,0,0);mctx.drawImage(bgSmall,0,0,MW,MH);const kx=MW/W,ky=MH/H;
  for(const e of G.ents){if(e.dead||!shown(e))continue;
    if(e.kind==='node'){mctx.fillStyle=e.type==='tree'?'#2b4f27':e.type==='bush'?'#c2553f':'#c8c4ba';mctx.fillRect(e.x*kx-1,e.y*ky-1,2,2)}
    else if(e.kind==='bld'){mctx.fillStyle=TC[e.team];const s=e.type==='hq'?6:4;mctx.fillRect(e.x*kx-s/2,e.y*ky-s/2,s,s);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(e.x*kx-s/2,e.y*ky-s/2,s,s)}
    else{mctx.fillStyle=e.team===0?'#a9c8f0':'#f2a28c';mctx.fillRect(e.x*kx-1.2,e.y*ky-1.2,2.4,2.4)}}
  mctx.imageSmoothingEnabled=true;mctx.drawImage(fogCv,0,0,MW,MH);
  if(G.ping&&G.t-G.ping.t<4){const k=((G.t-G.ping.t)%1);mctx.strokeStyle='#e0533c';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(G.ping.x*kx,G.ping.y*ky,3+k*10,0,6.283);mctx.stroke()}
  mctx.strokeStyle='#ecdfc3';mctx.lineWidth=1;mctx.strokeRect(cam.x*kx+.5,cam.y*ky+.5,VW/cam.z*kx,VH/cam.z*ky);
}

/* ---------- UI ---------- */
function toast(msg,kind){const el=document.createElement('div');el.className='toast'+(kind?' '+kind:'');el.textContent=msg;const box=$('toasts');box.appendChild(el);while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),450)},3200)}
const costHTML=c=>RES.filter(r=>c[r]).map(r=>`<span class="c"><i class="rdot ${r}"></i>${c[r]}</span>`).join('');
function actionsFor(s){
  if(!s.length||s[0].team!==0)return[];const f=s[0],acts=[],ep=G.epoch[0];
  if(f.kind==='unit'){
    if(s.some(u=>u.type==='worker'))for(const k of ['house','store','barracks','tower']){const d=BLDS[k];acts.push({key:'b'+k,nm:d.name,cost:d.cost,sub:d.sub,lock:d.ep>ep?EPOCHS[d.ep].name:null,run:()=>startPlace(k)})}
    if(s.some(u=>u.kind==='unit'&&u.type!=='worker'))acts.push({key:'am',nm:'Angriffsmarsch',sub:'Taste A, dann Ziel',run:()=>{armed=true;placing=null}});
    acts.push({key:'stop',nm:'Halt',sub:'Befehle abbrechen',run:()=>s.forEach(u=>{if(u.kind==='unit'){u.state='idle';u.amove=null}})});
    return acts;
  }
  if(f.kind==='bld'&&f.built){
    for(const [k,d] of Object.entries(UNITS))if(d.from===f.type)acts.push({key:'t'+k,nm:d.name,cost:d.cost,lock:d.ep>ep?EPOCHS[d.ep].name:null,run:()=>enqueue(f,k,0),unit:k});
    if(f.type==='hq'&&ep<2)acts.push({key:'adv',nm:'Aufstieg: '+EPOCHS[ep+1].name,cost:EPOCHS[ep].cost,adv:true,run:()=>advance(0)});
  }
  return acts;
}
let curActs=[],infoCache='';
$('acts').addEventListener('click',e=>{const b=e.target.closest('.act');if(!b||!G||!G.running)return;const a=curActs[+b.dataset.i];if(!a)return;if(a.lock){toast('Erst ab der '+a.lock+' verfügbar.');sfx('error');return}sfx('click');a.run()});
$('info').addEventListener('pointerdown',e=>{if(!G||!G.running)return;const q=e.target.closest('[data-q]');if(q){const b=selection()[0];if(b&&b.team===0)cancelQueue(b,+q.dataset.q);return}if(e.target.closest('[data-clear]')){sel.clear();panelSig=''}});
function infoHTML(s){
  const clr='<button class="x" data-clear aria-label="Auswahl aufheben">×</button>';
  if(!s.length)return '<p class="muted">Linksklick oder Rahmen ziehen wählt aus. Rechtsklick gibt Befehle: bewegen, sammeln, bauen, angreifen. Doppelklick wählt alle gleichen Einheiten im Bild.</p>';
  if(s.length>1){const c={};s.forEach(e=>{const n=nameOf(e);c[n]=(c[n]||0)+1});return `<div class="ih"><h2>${s.length} ausgewählt</h2>${clr}</div><div class="chips">${Object.entries(c).map(([n,k])=>`<span class="chip">${k}× ${n}</span>`).join('')}</div>`}
  const e=s[0];const tag=e.team===1?'<span class="tag enemy">Gegner</span>':e.team===0?'<span class="tag">'+EPOCHS[G.epoch[0]].name+'</span>':'';
  let h=`<div class="ih"><h2>${nameOf(e)}</h2>${tag}${clr}</div>`;
  if(e.kind==='node')return h+`<div class="line">Vorrat: <b>${Math.ceil(e.amount)}</b> ${RN[e.rt]}</div>`;
  h+=`<div class="hpw"><div class="hp"><span style="width:${Math.max(0,e.hp/e.maxHp*100).toFixed(0)}%"></span></div>${Math.ceil(e.hp)} / ${e.maxHp}</div>`;
  if(e.kind==='unit'){const d=UNITS[e.type];let st=STATE[e.state]||'';if(e.state==='gather')st='Sammelt '+RN[e.rtype||e.ctype||'food'];if(e.state==='return')st='Bringt '+RN[e.ctype]+' zum Lager';
    h+=`<div class="line">${st}${e.carry>0?` <em>· trägt ${Math.floor(e.carry)} ${RN[e.ctype]}</em>`:''}</div><div class="line"><em>Angriff ${d.atk} · Reichweite ${d.ranged?d.rng:'Nahkampf'}</em></div>`}
  else{
    if(!e.built)h+=`<div class="line">Im Bau: ${Math.floor(e.prog*100)} %${e.team===0?' <em>· Arbeiter per Rechtsklick zum Bauen schicken</em>':''}</div>`;
    if(e.team===0&&e.type==='hq'&&G.adv[0])h+=`<div class="line">Aufstieg in die ${EPOCHS[G.epoch[0]+1].name}: <b>${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</b></div>`;
    if(e.team===0&&e.queue.length){h+='<div class="chips">'+e.queue.map((q,i)=>`<button class="q${q.blocked?' blocked':''}" data-q="${i}" title="Klicken zum Abbrechen">${UNITS[q.type].name}${q.blocked?' – Platz fehlt':''}<span class="qb"><span style="width:${i===0?(q.t/UNITS[q.type].time*100).toFixed(0):0}%"></span></span></button>`).join('')+'</div>'}
    if(e.team===0&&e.built&&(e.type==='hq'||e.type==='barracks')&&!e.queue.length)h+='<div class="line"><em>Rechtsklick auf die Karte setzt den Sammelpunkt.</em></div>';
    if(e.team===0&&BLDS[e.type].pop)h+=`<div class="line"><em>Bietet Platz für ${BLDS[e.type].pop} Bewohner</em></div>`;
  }
  return h;
}
function updateUI(){
  const r=G.res[0];$('v-food').textContent=Math.floor(r.food);$('v-wood').textContent=Math.floor(r.wood);$('v-stone').textContent=Math.floor(r.stone);
  const pe=$('v-pop');pe.textContent=G.pop[0]+'/'+G.cap[0];pe.style.color=G.pop[0]>=G.cap[0]?'var(--warn)':'';
  $('epoch').innerHTML=EPOCHS[G.epoch[0]].name+(G.adv[0]?`<span class="prog">→ ${EPOCHS[G.epoch[0]+1].name} ${Math.floor(G.adv[0].t/G.adv[0].time*100)} %</span>`:'');
  const idle=G.ents.filter(e=>!e.dead&&e.team===0&&e.type==='worker'&&e.state==='idle').length;const ib=$('idleBtn');ib.textContent='Untätig: '+idle;ib.classList.toggle('hot',idle>0);
  const s=selection();
  const sig=s.map(e=>e.id+(e.built?'b':'')).join(',')+'|'+G.epoch[0]+'|'+(G.adv[0]?1:0);
  if(sig!==panelSig){panelSig=sig;curActs=actionsFor(s);$('acts').innerHTML=curActs.map((a,i)=>`<button class="act" data-i="${i}"><span class="nm">${a.nm}</span>${a.cost?`<span class="cost">${costHTML(a.cost)}</span>`:''}${a.lock?`<span class="sub">ab ${a.lock}</span>`:a.sub?`<span class="sub">${a.sub}</span>`:''}</button>`).join('')}
  $('acts').querySelectorAll('.act').forEach(b=>{const a=curActs[+b.dataset.i];if(!a)return;b.classList.toggle('locked',!!a.lock||!!(a.adv&&G.adv[0]));b.classList.toggle('poor',!!a.cost&&!afford(0,a.cost))});
  const ih=infoHTML(s);if(ih!==infoCache){infoCache=ih;$('info').innerHTML=ih}
  const hint=$('hint');
  if(placing){hint.hidden=false;hint.textContent=BLDS[placing].name+' platzieren: Klick auf freie Fläche · Umschalt hält den Modus · Rechtsklick oder Esc bricht ab'}
  else if(armed){hint.hidden=false;hint.textContent='Angriffsmarsch: Ziel anklicken · Truppen greifen unterwegs alles an · Esc bricht ab'}
  else if(G.paused){hint.hidden=false;hint.textContent='Pausiert · Leertaste setzt fort'}
  else hint.hidden=true;
}

/* ---------- overlay ---------- */
function showStart(){
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">Prototyp · Echtzeitstrategie · 1 gegen 1</p><h1>Epochenkrieg</h1>
  <p>Führe deinen Stamm durch drei Zeitalter. Sammle Nahrung, Holz und Stein, baue deine Siedlung aus und zerstöre das Hauptlager des Gegners, bevor er deins erreicht.</p>
  <div class="eras"><span>Steinzeit</span><span>Bronzezeit</span><span>Eisenzeit</span></div>
  <div class="diff" role="group" aria-label="Schwierigkeit">${['leicht','normal','schwer'].map(d=>`<button data-d="${d}" aria-pressed="${d===diff}">${d[0].toUpperCase()+d.slice(1)}</button>`).join('')}</div>
  <dl class="ctl"><dt>Auswählen</dt><dd>Linksklick, Rahmen ziehen, Doppelklick für alle gleichen</dd><dt>Befehl</dt><dd>Rechtsklick: bewegen, sammeln, bauen, angreifen, Sammelpunkt</dd><dt>Kamera</dt><dd>Pfeiltasten, Bildschirmrand, Minikarte, Mausrad zoomt</dd><dt>Tasten</dt><dd>A Angriffsmarsch · H Hauptlager · . untätiger Arbeiter · Leertaste Pause</dd><dt>Touch</dt><dd>Tippen wählt aus, mit Auswahl tippen gibt Befehl, Wischen bewegt die Karte</dd></dl>
  <button class="go" id="goBtn">Spiel starten</button></div>`;
  ov.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{diff=b.dataset.d;ov.querySelectorAll('[data-d]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
  $('goBtn').onclick=()=>{if(typeof SND!=='undefined')SND.init();newGame(diff);G.running=true;ov.hidden=true;toast('Tipp: Wähle deine Arbeiter aus und schick sie per Rechtsklick zu Beeren oder Bäumen.')};
}
function showEnd(){
  G.overShown=true;G.running=false;const win=G.over==='win';sfx(win?'win':'lose');const m=Math.floor(G.t/60),s=Math.floor(G.t%60);
  const ov=$('overlay');ov.hidden=false;
  ov.innerHTML=`<div class="card"><p class="eyebrow">${win?'Das gegnerische Hauptlager ist gefallen':'Dein Hauptlager wurde zerstört'}</p><h1>${win?'Sieg':'Niederlage'}</h1>
  <div class="stats"><div><b>${m}:${String(s).padStart(2,'0')}</b><small>Spielzeit</small></div><div><b>${G.stats.trained[0]}</b><small>Ausgebildet</small></div><div><b>${G.stats.lost[1]}</b><small>Gegner besiegt</small></div></div>
  <p>Erreichtes Zeitalter: ${EPOCHS[G.epoch[0]].name}. Schwierigkeit: ${diff}.</p>
  <button class="go" id="againBtn">Neues Spiel</button></div>`;
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
resize();newGame('normal');updateUI();showStart();requestAnimationFrame(frame);
})();
