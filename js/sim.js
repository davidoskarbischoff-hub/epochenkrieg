/* Epochenkrieg – Spielsimulation: Start, Spielschritt, Einheiten-Zustände, Kampf, Ausbildung, Stufen, Technologien.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- game ---------- */
let mapSeed=0,mapFresh=false,mapKey='',curMap='coast';
function newGame(d,reuse,opts){
  opts=opts||{};startK=opts.size==='S'?.6:opts.size==='M'?.8:1;if(!opts.mp)setTeamColors('#3d72b8','#b9442f');diff=d;if(opts.aiStyle)aiStyle=opts.aiStyle;if(opts.map)curMap=opts.map;else if(typeof window.__map==='string')curMap=window.__map;
  G={late:[],nation:[null,null],nfx:[nationFx(),nationFx()],t:0,ents:[],byId:new Map(),nid:1,res:[{food:200,wood:200,stone:100,iron:0,gold:0,oil:0},{food:200,wood:200,stone:100,iron:0,gold:0,oil:0}],epoch:[0,0],adv:[null,null],jobs:[[],[]],tech:[new Set(),new Set()],rs:[[],[]],tfx:[techFx(new Set()),techFx(new Set())],pop:[0,0],cap:[0,0],speed:1,paused:false,running:false,over:null,overShown:false,proj:[],fx:[],aiT:1,alertT:-99,ping:null,ev:[],alertT1:-99,mem:new Map(),ai:{style:opts.aiStyle||aiStyle,next:DIFF[d].first*AI_STYLES[opts.aiStyle||aiStyle].first,wave:DIFF[d].wave*AI_STYLES[opts.aiStyle||aiStyle].wave,ex:new Uint8Array(FW*FH),seen:new Map(),attack:false,towT:0,shipNext:200,exPt:null},stats:{lost:[0,0],trained:[0,0]}};
  sel.clear();placing=null;armed=false;panelSig='';advisor.cur=null;advisor.ignore={};advisor.next=8;advisor.last=-9;if(typeof SND!=='undefined')SND.setEpoch(0);
  const want=opts.seed!==undefined?opts.seed:(typeof window.__seed==='number'?window.__seed:undefined),keep=reuse&&mapFresh&&bg&&mapKey===curMap&&want===undefined,seed=keep?mapSeed:(want!==undefined?want:(Math.random()*1e9)|0);mapSeed=seed;mapFresh=true;mapKey=curMap;genTerrain(seed,curMap);navInit();genMap(seed);if(!keep)renderBg(seed);
  if(opts.flip)flipTeams();G.mp=!!opts.mp;if(G.mp)G.speed=opts.speed||1;
  G.solids=G.ents.filter(e=>e.kind!=='unit');recount();fogReset();
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0);centerOn(hq.x+120,hq.y-80);
  $('pauseBtn').textContent=tr('Pause');$('speedBtn').textContent=tr('Tempo {0}×',1);
}
function recount(){G.pop=[0,0];G.cap=[0,0];for(const e of G.ents){if(e.dead)continue;if(e.kind==='unit')G.pop[e.team]++;else if(e.kind==='bld'&&e.built&&BLDS[e.type].pop)G.cap[e.team]+=BLDS[e.type].pop}G.cap=G.cap.map((c,t)=>Math.min(POPMAX+(G.nfx?G.nfx[t].pop:0),c+(G.tfx?G.tfx[t].pop:0)+(G.nfx?G.nfx[t].pop:0)+SF(t).pop))}
function afford(t,c){return RES.every(r=>(G.res[t][r]||0)>=(c[r]||0))}
const SF0={gather:0,prod:0,pop:0};
const SF=t=>(G.sfx&&G.sfx[t])||SF0;
function specFx(){G.sfx=[{gather:0,prod:0,pop:0},{gather:0,prod:0,pop:0}];for(const b of G.ents){if(b.dead||b.kind!=='bld'||!b.built||b.team<0||!b.spec)continue;const f=G.sfx[b.team];if(b.type==='hq'&&b.spec==='eco'){f.gather+=.2;f.pop+=10}if(b.type==='hq'&&b.spec==='mil')f.prod+=.25}}
function buildSpec(team,id,kind){if(NET.client&&team===0){NET.send({c:'tspec',id,kind});return true}const b=G.byId.get(id),sp=b&&BSPEC[b.type]&&BSPEC[b.type][kind];if(!b||b.dead||b.team!==team||!b.built||b.spec||!sp||(sp.ep||0)>G.epoch[team])return false;if(!pay(team,sp.cost))return false;b.spec=kind;if(b.type==='tower'&&kind==='def'){b.maxHp=Math.round(b.maxHp*1.5);b.hp=Math.round(b.hp*1.5)}if(b.type==='hq'){b.maxHp=Math.round(b.maxHp*1.2);b.hp=Math.round(b.hp*1.2)}specFx();recount();terrUpdate();sfx('built',b);return true}
const towerSpec=buildSpec;
function pay(t,c){if(!afford(t,c))return false;RES.forEach(r=>G.res[t][r]-=c[r]||0);return true}
function refund(t,c){RES.forEach(r=>G.res[t][r]+=c[r]||0)}
function missing(t,c){const m=RES.filter(r=>(G.res[t][r]||0)<(c[r]||0)).map(r=>rn(r));return tr('Nicht genug {0}',m.join(tr(' und ')))}

/* Tiere je Zeitalter: Mammut und Säbelzahntiger sterben aus, sobald jemand die Eisenzeit erreicht; Wölfe, Bären und Tiger kommen erst später ins Land */
/* Arbeiter helfen von selbst: beschädigte (vor allem brennende) Gebäude werden repariert, solange kein Feind in der Nähe ist */
function autoRepair(){
  for(const b of G.ents){if(b.dead||b.kind!=='bld'||!b.built||b.hp>=b.maxHp*.8)continue;
    if(G.ents.some(e=>!e.dead&&e.kind==='unit'&&e.team!==b.team&&e.team>=0&&Math.hypot(e.x-b.x,e.y-b.y)<170))continue;
    const have=G.ents.filter(w=>!w.dead&&w.team===b.team&&w.state==='build'&&w.tid===b.id&&w.rep).length;if(have>=(b.hp<b.maxHp*.5?3:1))continue;
    let bw=null,bd=330;for(const w of G.ents){if(w.dead||w.team!==b.team||w.type!=='worker'||w.upj||w.state==='build'||w.state==='attack')continue;const d=Math.hypot(w.x-b.x,w.y-b.y);if(d<bd&&(w.state==='idle'||b.hp<b.maxHp*.5||w.carry<=0)){bd=d;bw=w}}
    if(bw){if(bw.state==='gather'&&bw.tid)bw.prev={tid:bw.tid,rtype:bw.rtype};bw.state='build';bw.tid=b.id;bw.rep=true;bw.pf=null}}}
/* Truppen im Leerlauf stehen vorn: eine Linie vor dem am weitesten vorgeschobenen Arbeiter, Richtung Gegner. Befehle des Spielers (u.manual) bleiben unangetastet. */
function frontLine(){
  if(G.mp)return;const hq=G.ents.find(e=>e.type==='hq'&&e.team===0&&!e.dead);if(!hq)return;
  const ang=Math.atan2(H/2-hq.y,W/2-hq.x),dx=Math.cos(ang),dy=Math.sin(ang);let D=150;
  for(const e of G.ents){if(e.dead||e.team!==0||!(e.type==='worker'||(e.kind==='bld'&&e.built)))continue;D=Math.max(D,(e.x-hq.x)*dx+(e.y-hq.y)*dy+(e.kind==='bld'?90:70))}
  D=Math.min(D,760);const us=G.ents.filter(u=>!u.dead&&u.team===0&&u.kind==='unit'&&u.state==='idle'&&!u.manual&&!u.upj&&!(u.q&&u.q.length)&&!UNITS[u.type].gather&&!UNITS[u.type].passive&&!UNITS[u.type].naval&&u.type!=='scout');
  us.forEach((u,i)=>{const row=Math.floor(i/8),col=i%8-3.5,sx=hq.x+dx*(D-row*26)-dy*col*30,sy=hq.y+dy*(D-row*26)+dx*col*30;
    if(Math.hypot(u.x-sx,u.y-sy)>70&&validSpot(sx,sy,u.r)){u.state='move';u.dest={x:sx,y:sy};u.amove=null;u.pf=null}})}
/* Arbeiter denken mit: bauen selbst ein Lager, wenn Sammler weit vom nächsten Abgabegebäude arbeiten, und einen Wachturm neben weit vorgeschobene Lager/Minen (nur mit Vorrat in der Kasse, abschaltbar im Menü) */
let autoBuildOn=true;try{autoBuildOn=localStorage.getItem('ek-autobuild')!=='0'}catch(_){}
function autoExpand(){
  if(G.mp||!autoBuildOn||G.t<45)return;const R=G.res[0],mine=G.ents.filter(e=>!e.dead&&e.team===0);
  const hq=mine.find(e=>e.type==='hq');if(!hq||mine.some(b=>b.kind==='bld'&&!b.built&&(b.type==='store'||b.type==='tower')))return;
  const spot=(type,cx,cy,d0,d1)=>{for(let d=d0;d<=d1;d+=12)for(let k=0;k<16;k++){const a=k*.3927+d*.07,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(!placeBlock(type,x,y))return{x,y}}return null};
  const put=(type,sp,helpers)=>{if(!pay(0,BLDS[type].cost))return false;const b=addBld(type,0,sp.x,sp.y,false);helpers.forEach(w=>{if(w.state==='gather'&&w.tid)w.prev={tid:w.tid,rtype:w.rtype};w.state='build';w.tid=b.id;w.rep=false;w.pf=null});return true};
  const drops=mine.filter(b=>b.kind==='bld'&&b.built&&BLDS[b.type].drop);
  if(G.t>(G.autoStoreT||0)&&R.wood>=BLDS.store.cost.wood+70){
    const far=mine.filter(w=>w.type==='worker'&&w.state==='gather'&&w.tid&&!w.upj).map(w=>({w,n:get(w.tid)})).filter(o=>o.n&&!o.n.sea&&drops.length&&Math.min(...drops.map(d=>Math.hypot(d.x-o.n.x,d.y-o.n.y)))>200);
    if(far.length>=3){const cx=far.reduce((s,o)=>s+o.n.x,0)/far.length,cy=far.reduce((s,o)=>s+o.n.y,0)/far.length,sp=spot('store',cx,cy,28,120);
      G.autoStoreT=G.t+40;if(sp&&put('store',sp,far.slice(0,2).map(o=>o.w)))toast(tr('Deine Arbeiter bauen ein Lager bei den weit entfernten Vorkommen.'),'good')}}
  if(G.t>(G.autoTowerT||0)&&R.wood>=BLDS.tower.cost.wood+80&&R.stone>=BLDS.tower.cost.stone+60){
    const ang=Math.atan2(H/2-hq.y,W/2-hq.x),dx=Math.cos(ang),dy=Math.sin(ang);
    const out=mine.filter(b=>b.kind==='bld'&&b.built&&(b.type==='store'||b.type==='mine'||b.type==='harbor')&&(b.x-hq.x)*dx+(b.y-hq.y)*dy>320&&!mine.some(t=>t.kind==='bld'&&(t.type==='tower'||t.type==='castle')&&Math.hypot(t.x-b.x,t.y-b.y)<230));
    if(out.length){const b=out[0],sp=spot('tower',b.x+dx*40,b.y+dy*40,30,110);G.autoTowerT=G.t+60;
      if(sp){let w=null,bd=1e9;for(const u of mine)if(u.type==='worker'&&!u.upj&&u.state!=='build'){const d=Math.hypot(u.x-b.x,u.y-b.y);if(d<bd){bd=d;w=u}}
        if(w&&put('tower',sp,[w]))toast(tr('Ein Arbeiter baut einen Wachturm zur Sicherung des vorgeschobenen Lagers.'),'good')}}}}
/* Heiler heilen verbündete Truppen in der Nähe */
function healAura(){for(const h of G.ents){if(h.dead||h.kind!=='unit'||h.type!=='healer'||h.upj)continue;const hv=UNITS.healer.heal*.5*(h.rage>G.t?RAGE.dmg:1);
  for(const u of G.ents){if(u.dead||u.team!==h.team||u.kind!=='unit'||u.hp>=u.maxHp||Math.hypot(u.x-h.x,u.y-h.y)>95)continue;u.hp=Math.min(u.maxHp,u.hp+hv*(u.type==='healer'?.5:1)*(1+u.maxHp/200))}}}
/* Kampfrausch: kurzzeitig mehr Schaden und Tempo für alle gewählten Truppen */
function useRage(team,ids){let n=0;for(const id of ids){const u=G.byId.get(id);if(!u||u.dead||u.team!==team||u.kind!=='unit'||UNITS[u.type].passive||UNITS[u.type].naval||u.upj)continue;if((u.rageCd||0)>G.t)continue;u.rage=G.t+RAGE.dur;u.rageCd=G.t+RAGE.cd;n++}if(n&&team===0)sfx('yell');return n}
/* Angefangene Gebäude ohne Bauarbeiter bekommen einen: Arbeiter, der gerade nichts Wichtiges trägt, hilft beim Fertigbauen */
function autoFinish(){
  if(G.mp||!autoBuildOn)return;
  for(const b of G.ents){if(b.dead||b.kind!=='bld'||b.built||b.team!==0)continue;
    if(G.ents.some(w=>!w.dead&&w.team===0&&w.state==='build'&&w.tid===b.id))continue;
    let bw=null,bd=1e9;for(const w of G.ents){if(w.dead||w.team!==0||w.type!=='worker'||w.upj||w.state==='build'||w.state==='attack')continue;const d=Math.hypot(w.x-b.x,w.y-b.y)+(w.state==='idle'?0:(w.carry>3?400:120));if(d<bd){bd=d;bw=w}}
    if(bw){if(bw.state==='gather'&&bw.tid)bw.prev={tid:bw.tid,rtype:bw.rtype};bw.state='build';bw.tid=b.id;bw.rep=false;bw.pf=null}}}
function eraAnimals(){const me=Math.max(G.epoch[0],G.epoch[1]);
  if(me>=2)for(const e of G.ents)if(e.kind==='animal'&&!e.dead&&ANIMALS[e.type].ext&&me>=ANIMALS[e.type].ext)removeEnt(e);
  if(G.late.length)G.late=G.late.filter(p=>{if(me<ANIMALS[p.type].from)return true;addAnimal(p.type,p.x,p.y);return false})}
function step(dt){
  if(!G.mp||!NET.client){G.healT=(G.healT||0)-dt;if(G.healT<=0){G.healT=.5;healAura()}}
  if(!G.mp||!NET.client){G.eraT=(G.eraT||0)-dt;if(G.eraT<=0){G.eraT=2;eraAnimals();wallPosts();specFx();autoRepair();frontLine();autoExpand();autoFinish()}}
  G.t+=dt;G.pfBudget=12;G.load={};
  for(const e of G.ents)if(e.kind==='unit'&&!e.dead&&e.state==='gather'&&e.tid)G.load[e.tid]=(G.load[e.tid]||0)+1;
  for(const e of G.ents)if(e.regen&&e.amount<e.maxAmt&&!e.dead)e.amount=Math.min(e.maxAmt,e.amount+e.regen*dt);
  G.rcT=(G.rcT||0)-dt;if(G.rcT<=0||!G.solids){G.rcT=.2;G.solids=G.ents.filter(e=>e.kind!=='unit'&&e.kind!=='animal'&&!e.dead);recount()}
  for(const e of G.ents){if(e.dead||e.upj)continue;if(e.kind==='unit')updUnit(e,dt);else if(e.kind==='bld')updBld(e,dt);else if(e.kind==='animal')updAnimal(e,dt)}
  for(let t=0;t<2;t++){const js=G.jobs[t];if(!js.length)continue;for(const j of js){j.t+=dt;if(j.t>=j.time){j.done=true;for(const id of j.ids){const e=G.byId.get(id);if(e&&!e.dead){e.upj=null;levelUp(e,j.to)}}if(t===0){panelSig='';infoCache='';sfx('epoch');toast(tr('Upgrade fertig: {0}',j.label),'good')}}}G.jobs[t]=js.filter(j=>!j.done)}
  for(let t=0;t<2;t++){const rs=G.rs[t];if(!rs.length)continue;for(const r of rs){r.t+=dt;if(r.t>=r.time){r.done=true;G.tech[t].add(r.id);techRefresh(t);if(t===0){panelSig='';infoCache='';sfx('epoch');toast(tr('Erforscht: {0}',tr(TECH[r.id].name)),'good')}}}G.rs[t]=rs.filter(r=>!r.done)}
  for(let t=0;t<2;t++){const a=G.adv[t];if(!a)continue;a.t+=dt;if(a.t>=a.time){G.epoch[t]++;G.adv[t]=null;panelSig='';if(t===1){applyLevels(1);grantAiTechs(1)}if(t===0){sfx('epoch');if(typeof SND!=='undefined')SND.setEpoch(G.epoch[0])}if(t===0)toast(tr('{0} erreicht! Neue Einheiten und Gebäude verfügbar.',tr(EPOCHS[G.epoch[0]].name)),'good');else toast(tr('Der Gegner hat die {0} erreicht.',tr(EPOCHS[G.epoch[1]].name)),'warn')}}
  for(const p of G.proj){const t=get(p.tid);if(!t){p.dead=true;continue}const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy),s=380*dt;p.a=Math.atan2(dy,dx);if(d<=s+t.r*.5){damage(t,p.dmg,get(p.src));if(p.sp){for(const o of G.ents)if(o!==t&&!o.dead&&o.kind==='unit'&&o.team===t.team&&Math.hypot(o.x-t.x,o.y-t.y)<p.sp)damage(o,p.dmg*.5,get(p.src))}p.dead=true}else{p.x+=dx/d*s;p.y+=dy/d*s}}
  G.proj=G.proj.filter(p=>!p.dead);
  separate();
  fogT+=dt;if(fogT>=.2){fogT=0;fogUpdate()}
  G.ents=G.ents.filter(e=>{if(e.dead){G.byId.delete(e.id);return false}return true});
  if(!G.mp){G.aiT+=dt;if(G.aiT>=1){G.aiT=0;aiTick()}}
  G.fx=G.fx.filter(f=>G.t-f.t<.7);
}

function moveToward(u,tx,ty,dt,ignore){
  const ud=UNITS[u.type],naval=!!ud.naval;
  let dx=tx-u.x,dy=ty-u.y;const d=Math.hypot(dx,dy);if(d<1.5)return true;
  if(ud.air){const st=Math.min(d,ud.spd*dt);u.x+=dx/d*st;u.y+=dy/d*st;u.fa=Math.atan2(dy,dx);u.mvT=G.t;return d-st<1.5}
  const fxt=G.tfx[u.team],spd=ud.spd*dt*(1+(ud.naval?fxt.bspeed:ud.gather?fxt.wspeed:0))*(u.rage>G.t?RAGE.spd:1),step=Math.min(d,spd);
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
      if(G.pfBudget>0&&(!pf||G.t-pf.t>.35)){G.pfBudget--;const path=navPath(u.x,u.y,tx,ty,stopR,naval,u.seed||0);u.pf=pf={tx,ty,path,i:0,t:G.t,fail:!(path&&path.length)}}}
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
/* Eisen und Gold lassen sich nur abbauen, wenn eine eigene, fertige Mine in der Nähe steht */
function minedBy(team,n){if(!MINE_RT[n.rt]||team<0)return true;for(const b of G.ents)if(b.kind==='bld'&&b.type===MINE_RT[n.rt]&&b.built&&!b.dead&&b.team===team&&Math.hypot(b.x-n.x,b.y-n.y)<MINE_RNG)return true;return false}
function nearestNode(rt,x,y,max,u,free){const naval=!!(u&&UNITS[u.type].naval);let best=null,bd=max;for(const e of G.solids){if(e.kind!=='node'||e.dead||(rt&&e.rt!==rt)||!!e.sea!==naval||(e.regen&&e.amount<30))continue;if(u&&!minedBy(u.team,e))continue;if(u&&u.team===0&&!G.mp&&!nodeKnown(e))continue;if(u&&u.bad&&u.bad[e.id]&&G.t-u.bad[e.id]<40)continue;if(free&&(G.load[e.id]||0)>=NODES[e.type].cap)continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function nearestDrop(t,x,y,naval,rt){let best=null,bd=1e9;for(const e of G.solids){if(e.kind!=='bld'||e.team!==t||!e.built||e.dead)continue;if(rt==='oil'?!BLDS[e.type].dropOil:!BLDS[e.type].drop)continue;if(naval&&e.type!=='harbor')continue;const d=Math.hypot(e.x-x,e.y-y);if(d<bd){bd=d;best=e}}return best}
function findEnemy(s,rad,unitsOnly){let best=null,bd=1e9;for(const e of G.ents){if(e.dead||e.team===s.team)continue;if(e.team<0&&!(e.kind==='animal'&&e.state==='chase'))continue;if(unitsOnly&&e.kind!=='unit'&&e.kind!=='animal')continue;if(e.gar&&!(UNITS[s.type]&&(UNITS[s.type].ranged||UNITS[s.type].air)))continue;if(UNITS[e.type]&&UNITS[e.type].air&&!(UNITS[s.type]&&(UNITS[s.type].ranged||UNITS[s.type].air)))continue;const d=Math.hypot(e.x-s.x,e.y-s.y)-e.r-s.r;if(d>rad)continue;const sc=d+(e.kind==='bld'?80:0);if(sc<bd){bd=sc;best=e}}return best}
const reach=(u,t)=>dist(u,t)<=u.r+t.r+5;

/* Erkunden: ein freies, unerkundetes Gebiet in der Nähe aussuchen und hinlaufen (Späher; auch für die KI) */
const exGrid=team=>team===0?fogEx:G.ai.ex;
function pickExplore(u){const g=exGrid(u.team),naval=!!UNITS[u.type].naval;let best=null,bs=1e9;
  for(let k=0;k<70;k++){const cx=(Math.random()*FW)|0,cy=(Math.random()*FH)|0,i=cy*FW+cx;if(g[i])continue;const x=(cx+.5)*FC,y=(cy+.5)*FC;
    if(!terrOk(x,y,naval)||(naval?false:!MAINLAND[((y/TG)|0)*TW+((x/TG)|0)]))continue;if(u.badEx&&u.badEx[i]&&G.t-u.badEx[i]<80)continue;
    const d=Math.hypot(x-u.x,y-u.y)+Math.random()*260;if(d<bs){bs=d;best={x,y,i}}}
  return best}
function updUnit(u,dt){
  const d=UNITS[u.type];u.cd=Math.max(0,u.cd-dt);u.px=u.x;u.py=u.y;
  if(u.state==='idle'&&u.loop&&!(u.q&&u.q.length)){u.q=u.loop.map(o=>({...o}))}
  if(u.state==='idle'&&u.q&&u.q.length)nextOrder(u);
  switch(u.state){
  case 'garrison':{const b=get(u.tid);
    if(!b||b.dead||!b.built){if(u.gar){u.x=u.gx||u.x;u.y=(u.gy||u.y)+16}u.gar=null;u.state='idle';break}
    if(u.gar!==b.id){const cap=b.type==='tower'?4:2,n=G.ents.filter(o=>!o.dead&&o.gar===b.id).length;
      if(reach(u,b)){if(n>=cap){toast(tr('Dort ist kein Platz mehr.'));u.state='idle';break}u.gar=b.id;u.gi=n;u.pf=null}else{moveToward(u,b.x,b.y,dt);break}}
    {const a=b.ang||0,off=b.type==='tower'?[[-5,-5],[5,-5],[-5,5],[5,5]][u.gi%4]:[[-6,0],[6,0]][u.gi%2];const ca=Math.cos(a),sa=Math.sin(a);u.gx=u.x=b.x+off[0]*ca-off[1]*sa;u.gy=u.y=b.y+off[0]*sa+off[1]*ca;
     const t=findEnemy(u,d.rng*1.3,false);if(t&&t.kind!=='node'){u.fa=Math.atan2(t.y-u.y,t.x-u.x);if(u.cd<=0){u.cd=d.cd;u.swing=G.t;hit(u,t)}}}
    break}
  case 'idle':
    if(!d.passive&&((u.ft=(u.ft||0)-dt)<=0)){u.ft=.25+Math.random()*.1;const t=findEnemy(u,150);if(t){u.tid=t.id;u.state='attack'}}
    break;
  case 'explore':{const g=exGrid(u.team);if(!u.ex||G.t>u.ex.until||g[u.ex.i]){u.ex=pickExplore(u);if(!u.ex){u.state='idle';break}u.ex.until=G.t+45;u.pf=null}
    const done=moveToward(u,u.ex.x,u.ex.y,dt);if(u.pf&&u.pf.fail){(u.badEx||(u.badEx={}))[u.ex.i]=G.t;u.ex=null;u.pf=null}else if(done)u.ex=null;break}
  case 'move':if(moveToward(u,u.dest.x,u.dest.y,dt))u.state='idle';break;
  case 'amove':{const t=((u.ft=(u.ft||0)-dt)<=0)?(u.ft=.2+Math.random()*.1,findEnemy(u,140)):null;if(t){u.tid=t.id;u.state='attack';break}if(moveToward(u,u.amove.x,u.amove.y,dt)){u.state='idle';u.amove=null}break}
  case 'attack':{const t=get(u.tid);if(!t||t.team===u.team||(t.team<0&&t.kind!=='animal')){u.state=u.amove?'amove':'idle';break}
    const gap=dist(u,t)-u.r-t.r;
    if(gap<=d.rng){u.fa=Math.atan2(t.y-u.y,t.x-u.x);if(u.cd<=0){u.cd=d.cd;u.swing=G.t;hit(u,t)}}
    else moveToward(u,t.x,t.y,dt,t.id);break}
  case 'gather':{let n=get(u.tid);if(n&&n.regen&&n.amount<6)n=null;
    if(!n){n=nearestNode(u.rtype,u.x,u.y,350,u,true)||nearestNode(u.rtype,u.x,u.y,350,u);if(!n){if(u.carry>0)u.state='return';else{u.state='idle';u.rtype=null}break}u.tid=n.id}
    if(u.carry>0&&u.ctype!==n.rt)u.carry=0;
    const gc=GATHER[n.rt];
    if(!canGather(u,n)){u.state='idle';u.tid=null;u.rtype=null;if(u.team===0&&G.t-(G.lvlWarn||-9)>4){G.lvlWarn=G.t;toast(tr('Arbeiter brauchen Stufe {0}, um {1} abzubauen.',LVLN[NODES[n.type].lvl!==undefined?NODES[n.type].lvl:NEED_LVL[n.rt]],tr(NODES[n.type].name)));sfx('error')}break}
    const cap=gc.carry*(1+G.tfx[u.team].carry+(d.naval?G.tfx[u.team].bcarry:0));
    if(u.carry>=cap){u.state='return';break}
    if(reach(u,n)){u.fa=Math.atan2(n.y-u.y,n.x-u.x);u.gat=G.t;if((u.gt=(u.gt||0)-dt)<=0){u.gt=.75+Math.random()*.2;sfx(n.rt==='wood'?'chop':n.rt==='stone'||n.rt==='iron'||n.rt==='gold'?'mine':'pick',u);if(Math.random()<.22)sfx('grunt',u)}const rate=.85*gc.rate*(1+G.tfx[u.team].gather+G.nfx[u.team].gather+((n.rt==='gold'||n.rt==='oil')?G.nfx[u.team].oilgold:0)+(d.naval?G.tfx[u.team].bgather:0)+SF(u.team).gather)*(NODES[n.type].gm||1)*LVL.gather[u.lvl]*(u.team===1?DIFF[diff].gather:1);const amt=Math.min(rate*dt,n.amount);u.carry+=amt;u.ctype=n.rt;n.amount-=amt;if(n.amount<=0.001){if(n.regen)n.amount=0;else kill(n)}if(u.carry>=cap)u.state='return'}
    else{
      // Absprache: ist der Baum/Busch schon voll besetzt, ein freies Vorkommen in der Nähe suchen
      if((G.load[n.id]||0)>NODES[n.type].cap&&G.t-(u.rs||0)>1.5){u.rs=G.t;const alt=nearestNode(u.rtype||n.rt,u.x,u.y,350,u,true);if(alt&&alt.id!==n.id){G.load[n.id]--;G.load[alt.id]=(G.load[alt.id]||0)+1;u.tid=alt.id;u.pf=null;n=alt}}
      moveToward(u,n.x,n.y,dt,n.id);
      if(u.pf&&u.pf.fail){(u.bad||(u.bad={}))[n.id]=G.t;u.tid=null;u.pf=null}}
    break}
  case 'return':{const dp=nearestDrop(u.team,u.x,u.y,!!d.naval,u.ctype);if(!dp||!u.ctype){u.state='idle';break}
    if(reach(u,dp)){G.res[u.team][u.ctype]+=u.carry;if(u.team===0)sfx('drop',u);u.carry=0;if(!(u.q&&u.q.length&&nextOrder(u)))u.state='gather'}else moveToward(u,dp.x,dp.y,dt,dp.id);break}
  case 'build':{const b=get(u.tid);
    if(b&&b.built&&u.rep&&b.hp<b.maxHp-1){ /* Reparatur: kostenlos, etwas langsamer als Bauen */
      if(reach(u,b)){u.fa=Math.atan2(b.y-u.y,b.x-u.x);u.gat=G.t;if((u.bt=(u.bt||0)-dt)<=0){u.bt=.6;sfx('hammer',u)}b.hp=Math.min(b.maxHp,b.hp+dt*b.maxHp/((BLDS[b.type].time||60)*2.2))}else moveToward(u,b.x,b.y,dt,b.id);break}
    if(!b||b.built){u.rep=false;u.state='idle';if(u.prev&&get(u.prev.tid)){u.tid=u.prev.tid;u.rtype=u.prev.rtype;u.state='gather';u.prev=null;break}u.prev=null;if(b&&b.built&&BLDS[b.type].drop&&!(u.q&&u.q.length)){const n=nearestNode(null,b.x,b.y,260);if(n){u.tid=n.id;u.rtype=n.rt;u.state='gather'}}break}
    if(reach(u,b)){u.fa=Math.atan2(b.y-u.y,b.x-u.x);u.gat=G.t;if((u.bt=(u.bt||0)-dt)<=0){u.bt=.6;sfx('hammer',u);if(Math.random()<.2)sfx('grunt',u)}const inc=dt/BLDS[b.type].time;b.prog=Math.min(1,b.prog+inc);b.hp=Math.min(b.maxHp,b.hp+inc*b.maxHp);
      if(b.prog>=1){b.built=true;panelSig='';if(b.type==='farm'){const f=addNode('field',b.x,b.y);f.farm=b.id}if(b.team===0){toast(tr('{0} fertiggestellt.',tr(BLDS[b.type].name)));sfx('built');if(BLDS[b.type].claim>150){fogT=1;toast(tr('Neues Gebiet erobert!'),'good')}}}}
    else moveToward(u,b.x,b.y,dt,b.id);break}
  }
}
function hit(u,t){const d=UNITS[u.type];if(!u.yl||G.t-u.yl>25){u.yl=G.t;if(Math.random()<.5)sfx('yell',u)}sfx(d.siege?'boom':d.gun?'shot':d.ranged?'arrow':'hit',u);const mult=(t.kind==='bld'?(d.siege?1.8:d.ranged?.3:1):(d.siege&&!d.ranged?.35:1))*(1+(d.ranged?G.tfx[u.team].ratk:G.tfx[u.team].matk))*(d.cls==='siege'?1+G.nfx[u.team].art:1)*(t.kind==='unit'?((CTR[d.cls]||{})[UNITS[t.type].cls]||1)*(d.gun&&UNITS[t.type].cls==='cav'?1.3:1):1)*(u.rage>G.t?RAGE.dmg:1)*(u.am||1);
  if(d.ranged)G.proj.push({x:u.x,y:u.y,tid:t.id,dmg:d.atk*mult*LVL.atk[u.lvl],src:u.id,a:0,big:!!d.siege,gun:!!d.gun,sp:d.splash||0});else damage(t,d.atk*mult*LVL.atk[u.lvl],u)}
function damage(t,amt,src){
  if(t.kind==='unit'&&G.ents.some(b=>b.kind==='bld'&&b.type==='trench'&&b.built&&!b.dead&&b.team===t.team&&Math.hypot(b.x-t.x,b.y-t.y)<30))amt*=.65;
  if(!(t.hp>=0))t.hp=t.maxHp||1;
  if(t.gar)amt*=.5;
  t.hp-=amt;
  if(t.kind==='animal'&&src&&src.team>=0&&t.hp>0){const d=ANIMALS[t.type];if(d.agg){if(t.state!=='chase'){t.tid=src.id;t.state='chase'}}else{t.state='flee';t.thr={x:src.x,y:src.y};t.until=G.t+4}}
  if(src&&t.kind==='unit'&&!UNITS[t.type].passive&&t.state==='idle'){t.tid=src.id;t.state='attack'}
  if(src&&src.kind==='animal'&&t.kind==='unit'&&UNITS[t.type].passive&&t.hp>0&&!UNITS[t.type].naval){ // Arbeiter fliehen zum nächsten Lager
    let b=null,bd=1e9;for(const o of G.ents)if(!o.dead&&o.kind==='bld'&&o.team===t.team&&o.built&&BLDS[o.type].drop){const dd=Math.hypot(o.x-t.x,o.y-t.y);if(dd<bd){bd=dd;b=o}}
    if(b&&t.state!=='move'){t.q=[];t.state='move';t.dest={x:b.x,y:b.y+b.r+14};t.pf=null}}
  if(t.team===0&&src&&src.kind==='animal'&&G.t-(G.wildWarn||-99)>15){G.wildWarn=G.t;toast(tr('Ein Wildtier greift an!'),'warn');sfx('alert')}
  if(t.team===0&&G.t-G.alertT>12){G.alertT=G.t;G.ping={x:t.x,y:t.y,t:G.t};toast(tr('Deine Siedlung wird angegriffen!'),'warn');sfx('alert')}
  if(t.team===1&&G.mp&&G.t-G.alertT1>12){G.alertT1=G.t;G.ev.push({t:'alert',x:Math.round(t.x),y:Math.round(t.y)})}
  if(t.hp<=0){kill(t);if(t.kind==='animal'&&src&&src.team>=0){const f=ANIMALS[t.type].food;if(f){G.res[src.team][ 'food']+=f;if(src.team===0&&!NET.cap)toast(tr('Beute erlegt: +{0} Nahrung',f),'good')}}}
}
function kill(e){if(e.dead)return;e.dead=true;if(e.type==='farm')for(const n of G.ents)if(n.type==='field'&&n.farm===e.id)n.dead=true;if((e.kind==='bld'&&!BLDS[e.type].passable)||(e.kind==='node'&&!e.sea))navStamp(e,-1);if(e.kind==='unit'||e.kind==='animal')sfx('die',e);else if(e.kind==='bld')sfx('crumble',e);sel.delete(e.id);if(e.kind==='unit')G.stats.lost[e.team]++;
  if(e.type==='hq'&&!G.over)G.over=e.team===0?'lose':'win';}
function updBld(b,dt){
  if(!b.built)return;const d=BLDS[b.type];
  if(b.type==='harbor'&&G.tfx[b.team].statfish)G.res[b.team].food+=G.tfx[b.team].statfish*dt*(1+.2*b.lvl);
  if(d.shoot){const sd=b.spec==='def',sob=b.spec==='obs';b.cd=Math.max(0,b.cd-dt);if(b.cd<=0){const t=findEnemy(b,d.shoot.rng*(sd?1.3:sob?.8:1),true);if(t){b.cd=d.shoot.cd*(sob?1.3:1);sfx('arrow',b);G.proj.push({x:b.x,y:b.y-8,tid:t.id,dmg:d.shoot.atk*(sd?1.8:sob?.7:1)*LVL.atk[b.lvl]*(1+G.tfx[b.team].tower),src:b.id,a:0})}}}
  if(b.queue.length){const q=b.queue[0];if(G.pop[b.team]>=G.cap[b.team]){q.blocked=true}else{q.blocked=false;q.t+=dt*(1+(G.nfx?G.nfx[b.team].prod:0)+SF(b.team).prod);if(q.t>=UNITS[q.type].time){b.queue.shift();spawn(b,q.type)}}}
}
function spawn(b,type){
  const rp=b.rally;let ang=rp?Math.atan2(rp.y-b.y,rp.x-b.x):(b.team===0?-1.57:1.57);ang+=(Math.random()-.5)*.8;
  let sx=b.x+Math.cos(ang)*(b.r+10),sy=b.y+Math.sin(ang)*(b.r+10);
  if(UNITS[type].naval){let found=false;for(let k=0;k<24&&!found;k++){const a=(b.ang||0)+(k%2?1:-1)*Math.ceil(k/2)*.2618;for(const dd of[b.r+22,b.r+36]){const x=b.x+Math.cos(a)*dd,y=b.y+Math.sin(a)*dd;if(terrAt(x,y)<=1&&navDyn[navCell(x,y)]===0){sx=x;sy=y;found=true;break}}}}
  const u=addUnit(type,b.team,sx,sy);
  {const ud0=UNITS[type];if(b.type==='barracks'&&b.spec==='drill'&&(ud0.cls==='inf'||ud0.cls==='cav')){u.hp=u.maxHp=Math.round(u.maxHp*1.25)}if(b.type==='barracks'&&b.spec==='range'&&ud0.ranged&&!ud0.siege)u.am=1.25;if(SF(b.team).prod>0&&!ud0.air){u.hp=u.maxHp=Math.round(u.maxHp*1.1)}}
  G.pop[b.team]++;G.stats.trained[b.team]++;if(b.team===0)sfx('ready');
  if(rp){const n=rp.id?get(rp.id):null;
    if(n&&n.kind==='node'&&UNITS[type].gather){u.state='gather';u.tid=n.id;u.rtype=n.rt}
    else if(rp.nodeType&&UNITS[type].gather){u.state='gather';u.rtype=rp.nodeType;u.tid=null}
    else{u.state='move';u.dest={x:rp.x+(Math.random()-.5)*30,y:rp.y+(Math.random()-.5)*30}}}
}
function enqueue(b,type,team){
  if(NET.client&&team===0){NET.send({c:'train',b:b.id,type});return true}
  const d=UNITS[type];
  if(d.ep>G.epoch[team]){if(team===0){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error')}return false}
  if(d.tech&&!G.tech[team].has(d.tech)){if(team===0){toast(tr('Technologie nötig: {0}',tr(TECH[d.tech].name)));sfx('error')}return false}
  if(b.queue.length>=5){if(team===0){toast(tr('Die Warteschlange ist voll (max. 5).'));sfx('error')}return false}
  if(d.nation&&G.nation[team]!==d.nation){if(team===0){toast(tr('Diese Einheit gehört zu einer anderen Nation.'));sfx('error')}return false}
  const uc=ucost(team,type);if(!pay(team,uc)){if(team===0){toast(missing(team,uc)+'.');sfx('error')}return false}
  b.queue.push({type,t:0});if(team===0)panelSig='';return true;
}
/* ---------- Stufen und Upgrades ---------- */
/* ---------- Technologien ---------- */
function techFx(set){const f={claim:0,carry:0,gather:0,wspeed:0,pop:0,bcarry:0,bgather:0,bspeed:0,statfish:0,shiphp:0,hp:0,matk:0,ratk:0,tower:0};for(const id of set){const t=TECH[id];if(t)for(const k in t.fx)f[k]+=t.fx[k]}return f}
const techsFor=type=>TECHS.filter(t=>t.bld===type||(t.blds&&t.blds.includes(type)));
const unitHp=(team,type,lvl)=>{const d=UNITS[type],f=G.tfx[team],n=G.nfx?G.nfx[team]:NFX0;let b=d.naval?f.shiphp+n.navhp:(d.gather||d.passive?0:f.hp+n.hp);if(d.cls==='cav')b+=n.cavhp;if(d.air)b+=n.air;return Math.round(d.hp*LVL.hp[lvl]*(1+b))};
/* Kosten mit Nationenbonus (Panzer billiger, Nahrung billiger) */
function ucost(team,type){const d=UNITS[type],n=G.nfx?G.nfx[team]:NFX0,c={...d.cost};if(n.tankCost&&TANKS.has(type))for(const k in c)c[k]=Math.round(c[k]*(1-n.tankCost));if(n.foodCost&&c.food&&!d.gather)c.food=Math.round(c.food*(1-n.foodCost));return c}
function techRefresh(team){G.tfx[team]=techFx(G.tech[team]);for(const e of G.ents){if(e.dead||e.team!==team||e.kind!=='unit')continue;const nm=unitHp(team,e.type,e.lvl);e.hp=e.hp/e.maxHp*nm;e.maxHp=nm}}
function startResearch(team,id){if(NET.client&&team===0){NET.send({c:'tech',id});return true}const t=TECH[id];if(!t||G.tech[team].has(id)||G.rs[team].some(r=>r.id===id)||t.ep>G.epoch[team])return false;
  if(!G.ents.some(e=>!e.dead&&e.team===team&&e.kind==='bld'&&e.built&&(e.type===t.bld||(t.blds&&t.blds.includes(e.type))))){if(team===0){toast(tr('Dafür fehlt das passende Gebäude.'));sfx('error')}return false}
  if(!pay(team,t.cost)){if(team===0){toast(missing(team,t.cost)+'.');sfx('error')}return false}
  G.rs[team].push({id,t:0,time:t.time});if(team===0){panelSig='';infoCache='';sfx('click');toast(tr('Forschung gestartet: {0}',tr(t.name)))}return true}
function grantAiTechs(team){for(const t of TECHS)if(t.ep<=G.epoch[team]&&t.id!=='statfish')G.tech[team].add(t.id);techRefresh(team)}
function levelUp(e,to){if(e.dead||e.kind==='node'||e.lvl>=to)return;
  const nm=e.kind==='unit'?unitHp(e.team,e.type,to):Math.round(BLDS[e.type].hp*LVL.bhp[to]*(1+G.nfx[e.team].bhp));e.hp=e.hp/e.maxHp*nm;e.maxHp=nm;e.lvl=to}
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
function startUpgrade(team,key){key=key||'all';if(NET.client&&team===0){NET.send({c:'upg',key});return true}const p=pending(team);if(!p.n||G.adv[team])return false;
  const gs=key==='all'?p.groups:p.groups.filter(g=>g.key===key);if(!gs.length)return false;
  const cost={};let n=0;gs.forEach(g=>{n+=g.n;for(const r in g.cost)cost[r]=(cost[r]||0)+g.cost[r]});
  if(!pay(team,cost)){if(team===0){toast(missing(team,cost)+'.');sfx('error')}return false}
  const to=G.epoch[team],keys=new Set(gs.map(g=>g.key)),job={team,to,t:0,time:upgTime(n),ids:[],done:false,label:key==='all'?tr('Alle'):tr(gs[0].nm),n};
  for(const e of G.ents){if(e.dead||e.team!==team||e.kind==='node'||e.lvl>=to||e.upj)continue;if(keys.has(e.kind+':'+e.type)){e.upj=job;job.ids.push(e.id)}}
  G.jobs[team].push(job);
  if(team===0){panelSig='';infoCache='';sfx('click');toast(tr('Upgrade gestartet: {0} ruhen, bis es fertig ist.',job.label))}return true}
function canGather(u,x){const need=typeof x==='string'?(NEED_LVL[x]||0):(NODES[x.type].lvl!==undefined?NODES[x.type].lvl:(NEED_LVL[x.rt]||0));return u.lvl>=need}
const wkNeed=ep=>[5,10,20,30,40,45][Math.min(5,ep)]; /* Arbeiter, die für den Aufstieg aus Epoche ep nötig sind */
const wkCount=t=>G.ents.reduce((n,e)=>n+(!e.dead&&e.team===t&&e.kind==='unit'&&e.type==='worker'?1:0),0);
function advance(team,nat){
  const ep0=G.epoch[team];
  /* Beim Schritt aus der Industriezeit in die Weltkriegszeit wählt man eine Nation (Verzweigung im Zeitalter-Baum) */
  if(ep0===5&&!G.nation[team]&&!nat){if(team===1)nat=Object.keys(NATIONS)[Math.floor(Math.random()*Object.keys(NATIONS).length)];else{if(typeof showNationPick==='function')showNationPick();return false}}
  if(NET.client&&team===0){NET.send({c:'adv',nation:nat});return true}
  const ep=G.epoch[team];if(ep>=EPOCHS.length-1||G.adv[team])return false;
  if(team===0&&G.jobs[0].length){toast(tr('Erst die laufenden Upgrades abwarten.'));sfx('error');return false}
  if(team===0&&pending(0).n){toast(tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]));sfx('error');return false}
  if(team===0&&wkCount(0)<wkNeed(ep)){toast(tr('Für den Aufstieg brauchst du {0} Arbeiter.',wkNeed(ep)));sfx('error');return false}
  const c=EPOCHS[ep].cost;
  if(!pay(team,c)){if(team===0)toast(missing(team,c)+'.');return false}
  if(ep===5&&nat&&NATIONS[nat]){G.nation[team]=nat;G.nfx[team]=nationFx(nat);recount()}
  G.adv[team]={t:0,time:EPOCHS[ep].time};if(team===0){panelSig='';toast(tr('Aufstieg in die {0} begonnen.',tr(EPOCHS[ep+1].name)))}return true;
}
function validSpot(x,y,r,anyTerrain){if(x<r+12||y<r+12||x>W-r-12||y>H-r-12)return false;if(!anyTerrain&&(!onLand(x,y)||!onLand(x+r,y)||!onLand(x-r,y)||!onLand(x,y+r)||!onLand(x,y-r)))return false;if(!anyTerrain&&slopeNear(x,y,r)>.9)return false;for(const e of G.ents){if(e.dead||e.kind==='unit')continue;if(Math.hypot(e.x-x,e.y-y)<e.r+r+5)return false}return true}
function separate(){
  const us=G.ents.filter(e=>e.kind==='unit'&&!e.dead&&!e.gar&&!UNITS[e.type].air),CU=40,ug=new Map();
  us.forEach((u,i)=>{u._i=i;const k=((u.x/CU)|0)*4096+((u.y/CU)|0);const l=ug.get(k);if(l)l.push(u);else ug.set(k,[u])});
  for(const a of us){const cx=(a.x/CU)|0,cy=(a.y/CU)|0;
    for(let gx=cx-1;gx<=cx+1;gx++)for(let gy=cy-1;gy<=cy+1;gy++){const l=ug.get(gx*4096+gy);if(!l)continue;
      for(const b of l){if(b._i<=a._i)continue;let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(Math.abs(dx)>m||Math.abs(dy)>m)continue;let d=Math.hypot(dx,dy);if(d>=m)continue;if(d<.01){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy)}const p=(m-d)/2*.8;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p}}}
  const CS=64,sg=new Map();
  for(const o of G.solids){if(o.dead||(o.kind==='bld'&&BLDS[o.type].passable))continue;const rr=o.r+24;
    for(let gx=((o.x-rr)/CS)|0;gx<=((o.x+rr)/CS)|0;gx++)for(let gy=((o.y-rr)/CS)|0;gy<=((o.y+rr)/CS)|0;gy++){const k=gx*4096+gy,l=sg.get(k);if(l)l.push(o);else sg.set(k,[o])}}
  for(const u of us){const nav=!!UNITS[u.type].naval,l=sg.get(((u.x/CS)|0)*4096+((u.y/CS)|0));
    if(l)for(const o of l){if(o.dead||(o.sea&&!nav))continue;let dx=u.x-o.x,dy=u.y-o.y;const R=o.r+u.r;if(Math.abs(dx)>R||Math.abs(dy)>R)continue;let d=Math.hypot(dx,dy);if(d>=R)continue;if(d<.01){dx=1;dy=0;d=1}u.x=o.x+dx/d*R;u.y=o.y+dy/d*R}
    u.x=Math.max(u.r,Math.min(W-u.r,u.x));u.y=Math.max(u.r,Math.min(H-u.r,u.y));
    if(u.px!==undefined&&!terrOk(u.x,u.y,!!UNITS[u.type].naval)){u.x=u.px;u.y=u.py}}
}


/* ---------- Wilde Tiere ---------- */
/* Einfache Bewegung ohne Wegfindung: geradeaus, bei Hindernis seitlich gleiten oder ausweichen. Nur Land, keine Gebäude/Bäume. */
function animalMove(a,tx,ty,dt,spd){
  const dx=tx-a.x,dy=ty-a.y,d=Math.hypot(dx,dy);if(d<2)return true;
  const st=Math.min(d,spd*dt),ux=dx/d,uy=dy/d;let moved=false;
  for(const[mx,my]of[[ux,uy],[ux,0],[0,uy],[ux*.5+uy*.7,uy*.5-ux*.7],[ux*.5-uy*.7,uy*.5+ux*.7]]){
    const nx=a.x+mx*st,ny=a.y+my*st;if(terrAt(nx,ny)===2&&navDyn[navCell(nx,ny)]===0){a.x=nx;a.y=ny;a.fa=Math.atan2(my||uy,mx||ux);a.mvT=G.t;moved=true;break}}
  a.stk=moved?Math.max(0,(a.stk||0)-dt):(a.stk||0)+dt;return false}
function updAnimal(a,dt){
  const d=ANIMALS[a.type];a.cd=Math.max(0,a.cd-dt);
  if(a.hp<a.maxHp&&a.state==='idle')a.hp=Math.min(a.maxHp,a.hp+dt*2);
  // Umgebung beobachten (nicht in jedem Schritt)
  a.th=(a.th||0)-dt;
  if(a.th<=0){a.th=.3+Math.random()*.1;let best=null,bd=1e9;
    for(const e of G.ents){if(e.dead||e.team<0||(e.kind!=='unit'&&e.kind!=='bld')||(e.kind==='unit'&&(UNITS[e.type].naval||e.type==='scout')))continue;const dd=Math.hypot(e.x-a.x,e.y-a.y)-e.r;if(dd<bd){bd=dd;best=e}}
    if(best){
      if(d.agg){if(a.state!=='chase'&&a.state!=='return'&&best.kind==='unit'&&bd<d.agg&&Math.hypot(a.home.x-best.x,a.home.y-best.y)<d.leash){a.tid=best.id;a.state='chase';sfx('growl',a);
        if(d.pack)for(const o of G.ents)if(o.kind==='animal'&&o.type===a.type&&!o.dead&&o!==a&&o.state!=='chase'&&Math.hypot(o.x-a.x,o.y-a.y)<240){o.tid=best.id;o.state='chase'}}}
      else if(bd<d.flee){if(a.state!=='flee')sfx('deer',a);a.state='flee';a.thr={x:best.x,y:best.y};a.until=G.t+2.5}}}
  switch(a.state){
  case'idle':a.wt-=dt;if(a.wt<=0){const ang=Math.random()*6.283,r=Math.random()*d.roam;a.wp={x:a.home.x+Math.cos(ang)*r,y:a.home.y+Math.sin(ang)*r};a.state='wander';a.stk=0}break;
  case'wander':if(animalMove(a,a.wp.x,a.wp.y,dt,d.spd*.35)||a.stk>1){a.state='idle';a.wt=3+Math.random()*6;a.stk=0}break;
  case'flee':{const t=a.thr||{x:a.x,y:a.y};if(G.t>a.until){a.state='idle';a.wt=1;a.home={x:a.x,y:a.y};break}const dx=a.x-t.x,dy=a.y-t.y,l=Math.hypot(dx,dy)||1;animalMove(a,a.x+dx/l*80,a.y+dy/l*80,dt,d.spd);if(a.stk>.5){a.stk=0;a.thr={x:a.x+(Math.random()-.5)*120,y:a.y+(Math.random()-.5)*120}}break}
  case'chase':{const t=get(a.tid);if(!t||Math.hypot(a.home.x-a.x,a.home.y-a.y)>d.leash||Math.hypot(t.x-a.x,t.y-a.y)>d.agg*2.4){a.state='return';a.tid=null;a.stk=0;break}
    const gap=Math.hypot(t.x-a.x,t.y-a.y)-a.r-t.r;
    if(gap<=d.rng){a.fa=Math.atan2(t.y-a.y,t.x-a.x);if(a.cd<=0){a.cd=d.cd;a.swing=G.t;sfx('hit',a);damage(t,d.atk,a)}}
    else{animalMove(a,t.x,t.y,dt,d.spd);if(a.stk>1.2){a.state='return';a.stk=0}}break}
  case'return':if(animalMove(a,a.home.x,a.home.y,dt,d.spd*.7)||Math.hypot(a.home.x-a.x,a.home.y-a.y)<24||a.stk>1.5){a.state='idle';a.wt=2;a.stk=0}break;
  }
}

/* Mauer-Pfosten: Mauerenden und Ecken bekommen einen höheren Turmpfosten (e.pc = "ab", je Ende 0/1) */
function wallPosts(){
  const ws=G.ents.filter(e=>!e.dead&&e.kind==='bld'&&(e.type==='wall'||e.type==='gate'));
  for(const e of ws){const a=e.ang||0;let pc='';
    for(const s of[-1,1]){const ex=e.x+Math.cos(a)*WALLHALF*s,ey=e.y+Math.sin(a)*WALLHALF*s;let post=1;
      for(const o of ws){if(o===e)continue;if(Math.hypot(o.x-ex,o.y-ey)<WALLHALF*1.35){const da=Math.abs(Math.atan2(Math.sin((o.ang||0)-a),Math.cos((o.ang||0)-a)));post=(da>.3&&da<Math.PI-.3)?1:0;if(!post)break}}
      pc+=post}
    e.pc=pc}}
