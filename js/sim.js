/* Epochenkrieg – Spielsimulation: Start, Spielschritt, Einheiten-Zustände, Kampf, Ausbildung, Stufen, Technologien.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- game ---------- */
let mapSeed=0,mapFresh=false,mapKey='',curMap='coast';
function newGame(d,reuse,opts){
  opts=opts||{};diff=d;if(opts.map)curMap=opts.map;else if(typeof window.__map==='string')curMap=window.__map;
  G={t:0,ents:[],byId:new Map(),nid:1,res:[{food:200,wood:200,stone:100,iron:0},{food:200,wood:200,stone:100,iron:0}],epoch:[0,0],adv:[null,null],jobs:[[],[]],tech:[new Set(),new Set()],rs:[[],[]],tfx:[techFx(new Set()),techFx(new Set())],pop:[0,0],cap:[0,0],speed:1,paused:false,running:false,over:null,overShown:false,proj:[],fx:[],aiT:1,alertT:-99,ping:null,ev:[],alertT1:-99,mem:new Map(),ai:{next:DIFF[d].first,wave:DIFF[d].wave,ex:new Uint8Array(FW*FH),seen:new Map(),attack:false,towT:0,shipNext:200,exPt:null},stats:{lost:[0,0],trained:[0,0]}};
  sel.clear();placing=null;armed=false;panelSig='';advisor.cur=null;advisor.ignore={};advisor.next=8;advisor.last=-9;if(typeof SND!=='undefined')SND.setEpoch(0);
  const want=opts.seed!==undefined?opts.seed:(typeof window.__seed==='number'?window.__seed:undefined),keep=reuse&&mapFresh&&bg&&mapKey===curMap&&want===undefined,seed=keep?mapSeed:(want!==undefined?want:(Math.random()*1e9)|0);mapSeed=seed;mapFresh=true;mapKey=curMap;genTerrain(seed,curMap);navInit();genMap(seed);if(!keep)renderBg(seed);
  if(opts.flip)flipTeams();G.mp=!!opts.mp;if(G.mp)G.speed=1;
  G.solids=G.ents.filter(e=>e.kind!=='unit');recount();fogReset();
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0);centerOn(hq.x+120,hq.y-80);
  $('pauseBtn').textContent=tr('Pause');$('speedBtn').textContent=tr('Tempo {0}×',1);
}
function recount(){G.pop=[0,0];G.cap=[0,0];for(const e of G.ents){if(e.dead)continue;if(e.kind==='unit')G.pop[e.team]++;else if(e.kind==='bld'&&e.built&&BLDS[e.type].pop)G.cap[e.team]+=BLDS[e.type].pop}G.cap=G.cap.map((c,t)=>Math.min(POPMAX,c+(G.tfx?G.tfx[t].pop:0)))}
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
  for(let t=0;t<2;t++){const rs=G.rs[t];if(!rs.length)continue;for(const r of rs){r.t+=dt;if(r.t>=r.time){r.done=true;G.tech[t].add(r.id);techRefresh(t);if(t===0){panelSig='';infoCache='';sfx('epoch');toast(tr('Erforscht: {0}',tr(TECH[r.id].name)),'good')}}}G.rs[t]=rs.filter(r=>!r.done)}
  for(let t=0;t<2;t++){const a=G.adv[t];if(!a)continue;a.t+=dt;if(a.t>=a.time){G.epoch[t]++;G.adv[t]=null;panelSig='';if(t===1){applyLevels(1);grantAiTechs(1)}if(t===0){sfx('epoch');if(typeof SND!=='undefined')SND.setEpoch(G.epoch[0])}if(t===0)toast(tr('{0} erreicht! Neue Einheiten und Gebäude verfügbar.',tr(EPOCHS[G.epoch[0]].name)),'good');else toast(tr('Der Gegner hat die {0} erreicht.',tr(EPOCHS[G.epoch[1]].name)),'warn')}}
  for(const p of G.proj){const t=get(p.tid);if(!t){p.dead=true;continue}const dx=t.x-p.x,dy=t.y-p.y,d=Math.hypot(dx,dy),s=380*dt;p.a=Math.atan2(dy,dx);if(d<=s+t.r*.5){damage(t,p.dmg,get(p.src));p.dead=true}else{p.x+=dx/d*s;p.y+=dy/d*s}}
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
  const fxt=G.tfx[u.team],spd=ud.spd*dt*(1+(ud.naval?fxt.bspeed:ud.gather?fxt.wspeed:0)),step=Math.min(d,spd);
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
  case 'idle':
    if(!d.passive){const t=findEnemy(u,150);if(t){u.tid=t.id;u.state='attack'}}
    break;
  case 'explore':{const g=exGrid(u.team);if(!u.ex||G.t>u.ex.until||g[u.ex.i]){u.ex=pickExplore(u);if(!u.ex){u.state='idle';break}u.ex.until=G.t+45;u.pf=null}
    const done=moveToward(u,u.ex.x,u.ex.y,dt);if(u.pf&&u.pf.fail){(u.badEx||(u.badEx={}))[u.ex.i]=G.t;u.ex=null;u.pf=null}else if(done)u.ex=null;break}
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
    const cap=gc.carry*(1+G.tfx[u.team].carry+(d.naval?G.tfx[u.team].bcarry:0));
    if(u.carry>=cap){u.state='return';break}
    if(reach(u,n)){u.fa=Math.atan2(n.y-u.y,n.x-u.x);u.gat=G.t;if((u.gt=(u.gt||0)-dt)<=0){u.gt=.75+Math.random()*.2;sfx(n.rt==='wood'?'chop':n.rt==='stone'||n.rt==='iron'?'mine':'pick',u)}const rate=.85*gc.rate*(1+G.tfx[u.team].gather+(d.naval?G.tfx[u.team].bgather:0))*(NODES[n.type].gm||1)*LVL.gather[u.lvl]*(u.team===1?DIFF[diff].gather:1);const amt=Math.min(rate*dt,n.amount);u.carry+=amt;u.ctype=n.rt;n.amount-=amt;if(n.amount<=0.001)kill(n);if(u.carry>=cap)u.state='return'}
    else{
      // Absprache: ist der Baum/Busch schon voll besetzt, ein freies Vorkommen in der Nähe suchen
      if((G.load[n.id]||0)>NODES[n.type].cap&&G.t-(u.rs||0)>1.5){u.rs=G.t;const alt=nearestNode(u.rtype||n.rt,u.x,u.y,350,u,true);if(alt&&alt.id!==n.id){G.load[n.id]--;G.load[alt.id]=(G.load[alt.id]||0)+1;u.tid=alt.id;u.pf=null;n=alt}}
      moveToward(u,n.x,n.y,dt,n.id);
      if(u.pf&&u.pf.fail){(u.bad||(u.bad={}))[n.id]=G.t;u.tid=null;u.pf=null}}
    break}
  case 'return':{const dp=nearestDrop(u.team,u.x,u.y,!!d.naval);if(!dp||!u.ctype){u.state='idle';break}
    if(reach(u,dp)){G.res[u.team][u.ctype]+=u.carry;if(u.team===0)sfx('drop',u);u.carry=0;if(!(u.q&&u.q.length&&nextOrder(u)))u.state='gather'}else moveToward(u,dp.x,dp.y,dt,dp.id);break}
  case 'build':{const b=get(u.tid);
    if(!b||b.built){u.state='idle';if(b&&b.built&&BLDS[b.type].drop&&!(u.q&&u.q.length)){const n=nearestNode(null,b.x,b.y,260);if(n){u.tid=n.id;u.rtype=n.rt;u.state='gather'}}break}
    if(reach(u,b)){u.fa=Math.atan2(b.y-u.y,b.x-u.x);u.gat=G.t;if((u.bt=(u.bt||0)-dt)<=0){u.bt=.6;sfx('hammer',u)}const inc=dt/BLDS[b.type].time;b.prog=Math.min(1,b.prog+inc);b.hp=Math.min(b.maxHp,b.hp+inc*b.maxHp);
      if(b.prog>=1){b.built=true;panelSig='';if(b.team===0){toast(tr('{0} fertiggestellt.',tr(BLDS[b.type].name)));sfx('built');if(BLDS[b.type].claim>150){fogT=1;toast(tr('Neues Gebiet erobert!'),'good')}}}}
    else moveToward(u,b.x,b.y,dt,b.id);break}
  }
}
function hit(u,t){const d=UNITS[u.type];sfx(d.siege?'boom':d.gun?'shot':d.ranged?'arrow':'hit',u);const mult=(t.kind==='bld'?(d.siege?1.8:d.ranged?.3:1):(d.siege&&!d.ranged?.35:1))*(1+(d.ranged?G.tfx[u.team].ratk:G.tfx[u.team].matk));
  if(d.ranged)G.proj.push({x:u.x,y:u.y,tid:t.id,dmg:d.atk*mult*LVL.atk[u.lvl],src:u.id,a:0,big:!!d.siege,gun:!!d.gun});else damage(t,d.atk*mult*LVL.atk[u.lvl],u)}
function damage(t,amt,src){
  t.hp-=amt;
  if(src&&t.kind==='unit'&&!UNITS[t.type].passive&&t.state==='idle'){t.tid=src.id;t.state='attack'}
  if(t.team===0&&G.t-G.alertT>12){G.alertT=G.t;G.ping={x:t.x,y:t.y,t:G.t};toast(tr('Deine Siedlung wird angegriffen!'),'warn');sfx('alert')}
  if(t.team===1&&G.mp&&G.t-G.alertT1>12){G.alertT1=G.t;G.ev.push({t:'alert',x:Math.round(t.x),y:Math.round(t.y)})}
  if(t.hp<=0)kill(t);
}
function kill(e){if(e.dead)return;e.dead=true;if(e.kind==='bld'||(e.kind==='node'&&!e.sea))navStamp(e,-1);if(e.kind==='unit')sfx('die',e);else if(e.kind==='bld')sfx('crumble',e);sel.delete(e.id);if(e.kind==='unit')G.stats.lost[e.team]++;
  if(e.type==='hq'&&!G.over)G.over=e.team===0?'lose':'win';}
function updBld(b,dt){
  if(!b.built)return;const d=BLDS[b.type];
  if(b.type==='harbor'&&G.tfx[b.team].statfish)G.res[b.team].food+=G.tfx[b.team].statfish*dt*(1+.2*b.lvl);
  if(d.shoot){b.cd=Math.max(0,b.cd-dt);if(b.cd<=0){const t=findEnemy(b,d.shoot.rng,true);if(t){b.cd=d.shoot.cd;sfx('arrow',b);G.proj.push({x:b.x,y:b.y-8,tid:t.id,dmg:d.shoot.atk*LVL.atk[b.lvl]*(1+G.tfx[b.team].tower),src:b.id,a:0})}}}
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
  if(NET.client&&team===0){NET.send({c:'train',b:b.id,type});return true}
  const d=UNITS[type];
  if(d.ep>G.epoch[team]){if(team===0){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error')}return false}
  if(d.tech&&!G.tech[team].has(d.tech)){if(team===0){toast(tr('Technologie nötig: {0}',tr(TECH[d.tech].name)));sfx('error')}return false}
  if(b.queue.length>=5){if(team===0){toast(tr('Die Warteschlange ist voll (max. 5).'));sfx('error')}return false}
  if(!pay(team,d.cost)){if(team===0){toast(missing(team,d.cost)+'.');sfx('error')}return false}
  b.queue.push({type,t:0});if(team===0)panelSig='';return true;
}
/* ---------- Stufen und Upgrades ---------- */
/* ---------- Technologien ---------- */
function techFx(set){const f={carry:0,gather:0,wspeed:0,pop:0,bcarry:0,bgather:0,bspeed:0,statfish:0,shiphp:0,hp:0,matk:0,ratk:0,tower:0};for(const id of set){const t=TECH[id];if(t)for(const k in t.fx)f[k]+=t.fx[k]}return f}
const techsFor=type=>TECHS.filter(t=>t.bld===type||(t.blds&&t.blds.includes(type)));
const unitHp=(team,type,lvl)=>{const d=UNITS[type],f=G.tfx[team];const b=d.naval?f.shiphp:(d.gather||d.passive?0:f.hp);return Math.round(d.hp*LVL.hp[lvl]*(1+b))};
function techRefresh(team){G.tfx[team]=techFx(G.tech[team]);for(const e of G.ents){if(e.dead||e.team!==team||e.kind!=='unit')continue;const nm=unitHp(team,e.type,e.lvl);e.hp=e.hp/e.maxHp*nm;e.maxHp=nm}}
function startResearch(team,id){if(NET.client&&team===0){NET.send({c:'tech',id});return true}const t=TECH[id];if(!t||G.tech[team].has(id)||G.rs[team].some(r=>r.id===id)||t.ep>G.epoch[team])return false;
  if(!G.ents.some(e=>!e.dead&&e.team===team&&e.kind==='bld'&&e.built&&(e.type===t.bld||(t.blds&&t.blds.includes(e.type))))){if(team===0){toast(tr('Dafür fehlt das passende Gebäude.'));sfx('error')}return false}
  if(!pay(team,t.cost)){if(team===0){toast(missing(team,t.cost)+'.');sfx('error')}return false}
  G.rs[team].push({id,t:0,time:t.time});if(team===0){panelSig='';infoCache='';sfx('click');toast(tr('Forschung gestartet: {0}',tr(t.name)))}return true}
function grantAiTechs(team){for(const t of TECHS)if(t.ep<=G.epoch[team]&&t.id!=='statfish')G.tech[team].add(t.id);techRefresh(team)}
function levelUp(e,to){if(e.dead||e.kind==='node'||e.lvl>=to)return;
  const nm=e.kind==='unit'?unitHp(e.team,e.type,to):Math.round(BLDS[e.type].hp*LVL.bhp[to]);e.hp=e.hp/e.maxHp*nm;e.maxHp=nm;e.lvl=to}
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
const wkNeed=ep=>10*(ep+1); /* Arbeiter, die für den Aufstieg aus Epoche ep nötig sind: 10, 20, 30, 40 */
const wkCount=t=>G.ents.reduce((n,e)=>n+(!e.dead&&e.team===t&&e.kind==='unit'&&e.type==='worker'?1:0),0);
function advance(team){
  if(NET.client&&team===0){NET.send({c:'adv'});return true}
  const ep=G.epoch[team];if(ep>=EPOCHS.length-1||G.adv[team])return false;
  if(team===0&&G.jobs[0].length){toast(tr('Erst die laufenden Upgrades abwarten.'));sfx('error');return false}
  if(team===0&&pending(0).n){toast(tr('Erst alle Gebäude und Truppen auf Stufe {0} bringen.',LVLN[ep]));sfx('error');return false}
  if(team===0&&wkCount(0)<wkNeed(ep)){toast(tr('Für den Aufstieg brauchst du {0} Arbeiter.',wkNeed(ep)));sfx('error');return false}
  const c=EPOCHS[ep].cost;
  if(!pay(team,c)){if(team===0)toast(missing(team,c)+'.');return false}
  G.adv[team]={t:0,time:EPOCHS[ep].time};if(team===0){panelSig='';toast(tr('Aufstieg in die {0} begonnen.',tr(EPOCHS[ep+1].name)))}return true;
}
function validSpot(x,y,r,anyTerrain){if(x<r+12||y<r+12||x>W-r-12||y>H-r-12)return false;if(!anyTerrain&&(!onLand(x,y)||!onLand(x+r,y)||!onLand(x-r,y)||!onLand(x,y+r)||!onLand(x,y-r)))return false;for(const e of G.ents){if(e.dead||e.kind==='unit')continue;if(Math.hypot(e.x-x,e.y-y)<e.r+r+5)return false}return true}
function separate(){
  const us=G.ents.filter(e=>e.kind==='unit'&&!e.dead);
  for(let i=0;i<us.length;i++){const a=us[i];for(let j=i+1;j<us.length;j++){const b=us[j];let dx=b.x-a.x,dy=b.y-a.y;const m=a.r+b.r;if(Math.abs(dx)>m||Math.abs(dy)>m)continue;let d=Math.hypot(dx,dy);if(d>=m)continue;if(d<.01){dx=Math.random()-.5;dy=Math.random()-.5;d=Math.hypot(dx,dy)}const p=(m-d)/2*.8;a.x-=dx/d*p;a.y-=dy/d*p;b.x+=dx/d*p;b.y+=dy/d*p}}
  for(const u of us){const nav=!!UNITS[u.type].naval;for(const o of G.solids){if(o.dead||(o.sea&&!nav))continue;let dx=u.x-o.x,dy=u.y-o.y;const R=o.r+u.r;if(Math.abs(dx)>R||Math.abs(dy)>R)continue;let d=Math.hypot(dx,dy);if(d>=R)continue;if(d<.01){dx=1;dy=0;d=1}u.x=o.x+dx/d*R;u.y=o.y+dy/d*R}
    u.x=Math.max(u.r,Math.min(W-u.r,u.x));u.y=Math.max(u.r,Math.min(H-u.r,u.y));
    if(u.px!==undefined&&!terrOk(u.x,u.y,!!UNITS[u.type].naval)){u.x=u.px;u.y=u.py}}
}

