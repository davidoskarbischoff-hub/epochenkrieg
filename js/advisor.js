/* Epochenkrieg – Berater: Taktiken, Lagebild, Vorschläge.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- Berater: macht Vorschläge, die man annehmen oder ablehnen kann ---------- */
let advOn=true;try{advOn=localStorage.getItem('ek-advisor')!=='0'}catch(_){}
const advisor={cur:null,ignore:{},next:0,last:-9,shown:'',strat:'balanced',intel:null,open:true,auto:false,autoAt:0};
/* Taktiken des Beraters: wk = Arbeiterziel je Epoche, mil = Truppenziel, atk = ab so vielen Truppen Angriff, tow = Türme, barW = ab so vielen Arbeitern Kaserne, w = Reihenfolge der Vorschläge (kleiner = früher) */
const STRATS={
  balanced:{name:'Ausgewogen',desc:'Von allem etwas',wk:[18,28,38,48,54,56,58],mil:ep=>10+ep*8,atk:ep=>ep<4?99:10+ep*8,tow:()=>1,barW:6,bar2:20,hs:5,w:{}},
  turtle:{name:'Verteidigung',desc:'Türme, solide Armee, spät angreifen',wk:[15,22,30,40,45,46,48],mil:ep=>8+ep*3,atk:ep=>16+ep*4,tow:ep=>2+ep,barW:6,bar2:99,hs:1,w:{tower:1,upg:2,army:2,barracks:2,tech:3,attack:9}},
  boom:{name:'Aufstieg',desc:'So schnell wie möglich in die höchste Epoche',wk:[7,13,23,33,41,41,43],mil:ep=>3+ep*2,atk:ep=>14+ep*3,tow:()=>1,barW:9,bar2:99,hs:2,w:{adv:1,upg:1,tech:2,worker:2,house:2,balance:2,barracks:8,army:8,attack:9}},
  rush:{name:'Angriff',desc:'Früh viele Truppen, schnell zuschlagen',wk:[5,8,10,12,12,12,12],mil:ep=>12+ep*5,atk:ep=>5+ep,tow:()=>1,barW:4,bar2:8,hs:1,w:{barracks:1,army:1,attack:2,worker:4,adv:7,tech:7,upg:6}},
  eco:{name:'Wirtschaft',desc:'Viele Arbeiter, große Vorräte',wk:[8,14,26,36,44,44,46],mil:ep=>4+ep*2,atk:ep=>12+ep*3,tow:()=>1,barW:10,bar2:99,hs:3,w:{worker:1,house:1,balance:1,harbor:2,tech:2,shift:2,adv:3,upg:3,barracks:7,army:7,attack:9}}
};
/* Lagebild: was der Spieler vom Gegner weiß (gemerkte Gebäude, sichtbare Truppen) */
function advIntel(){
  const mem=[...G.mem.values()],vis=G.ents.filter(e=>!e.dead&&e.team===1&&e.kind==='unit'&&shown(e)&&!UNITS[e.type].passive);
  const cnt=(a,f)=>a.filter(f).length,navalVis=cnt(vis,u=>UNITS[u.type].naval);
  const I={known:mem.length>0,ep:G.epoch[1],bars:cnt(mem,m=>m.type==='barracks'),towers:cnt(mem,m=>m.type==='tower'||m.type==='castle'),harbor:cnt(mem,m=>m.type==='harbor')>0,
    vis:vis.length,ranged:cnt(vis,u=>UNITS[u.type].ranged&&!UNITS[u.type].naval),horse:cnt(vis,u=>u.type==='knight'),siege:cnt(vis,u=>UNITS[u.type].siege),naval:navalVis,mel:cnt(vis,u=>!UNITS[u.type].ranged&&!UNITS[u.type].naval&&u.type!=='knight')};
  return I}
function advIntelText(I){
  if(!I.known&&!I.vis)return tr('Noch nichts vom Gegner gesehen – Späher losschicken.');
  const p=[];if(I.known)p.push(tr('Gegner: {0}',tr(EPOCHS[I.ep].name)));
  if(I.bars)p.push(tr('{0} Kaserne(n)',I.bars));if(I.towers)p.push(tr('{0} Türme/Burgen',I.towers));if(I.harbor)p.push(tr('Hafen'));
  if(I.vis)p.push(tr('{0} Truppen in Sicht',I.vis));return p.join(' · ')}
let advH={};
/* bekannte Fischgründe, die der Spieler schon fangen darf (für den Hafen-Standort) */
function advFish(){return G.ents.filter(n=>n.kind==='node'&&!n.dead&&n.sea&&nodeKnown(n)&&!(NODES[n.type].lvl>G.epoch[0]))}
function advFindSpot(type,need){
  const hq=G.ents.find(e=>e.type==='hq'&&e.team===0&&!e.dead);if(!hq)return null;const d0=BLDS[type];
  const base=Math.atan2(H/2-hq.y,W/2-hq.x),far=type==='tower';
  if(far){/* Türme verteilt: möglichst weit weg von eigenen Türmen/Burgen (mind. 300 px), bevorzugt Richtung Gegner, Ring wächst mit der Anzahl */
    const tw=G.ents.filter(e=>!e.dead&&e.team===0&&(e.type==='tower'||e.type==='castle'));let best=null,bs=-1e9;
    for(let d=220;d<=420+tw.length*40;d+=20)for(let k=0;k<48;k++){const a=base+k*.1309,x=hq.x+Math.cos(a)*d,y=hq.y+Math.sin(a)*d;if(placeBlock(type,x,y))continue;
      let g=1e9;for(const t of tw)g=Math.min(g,Math.hypot(t.x-x,t.y-y));if(g<300)continue;
      const da=Math.abs(Math.atan2(Math.sin(a-base),Math.cos(a-base)));const sc=Math.min(g,700)-da*120-Math.abs(d-300)*.3;if(sc>bs){bs=sc;best={x,y}}}
    return best}
  if(type==='harbor'){/* Hafen dort, wo Fisch ist: Uferplätze nach Schwärmen im Umkreis bewerten, kleiner Abzug für den Weg zum Hauptlager (Ergebnis kurz gemerkt) */
    if(advH.spot&&G.t>=advH.t&&G.t-advH.t<4&&!placeBlock(type,advH.spot.x,advH.spot.y))return advH.spot;
    const best=harborNearFish(hq,advFish(),(x,y)=>!placeBlock(type,x,y),80,520);
    if(best){advH={spot:best,t:G.t};return best}if(need)return null}
  /* andere Gebäude: mit Abstand zu eigenen Gebäuden (Kante zu Kante), damit Wege frei bleiben und es nicht gedrängt aussieht */
  const gap={house:26,farm:22,barracks:46,store:40,market:44,refinery:40,harbor:30,airfield:50,castle:60}[type]||30,own=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='bld');
  const free=(x,y)=>{for(const e of own){if(e.type==='wall'||e.type==='gate'||e.type==='trench')continue;if(Math.hypot(e.x-x,e.y-y)-e.r-d0.r<gap)return false}return true};
  for(const need of[true,false])for(let d=100;d<=(need?420:320);d+=20)for(let k=0;k<36;k++){const a=base+(k%2?1:-1)*Math.ceil(k/2)*.17;const x=hq.x+Math.cos(a)*d,y=hq.y+Math.sin(a)*d;if(placeBlock(type,x,y))continue;if(need&&!free(x,y))continue;return{x,y}}
  return null}
/* Platz für eine Mine: nahe dem nächsten Vorkommen (Eisen oder Gold), das noch keine Mine hat */
function advMineSpot(rt,hq){if(MINE_RT[rt]==='mine'){if(G.ents.some(b=>b.type==='mine'&&b.team===0&&!b.dead&&b.built&&!b.empty&&minersIn(b)<MINE_CAP&&mineNode(b,{lvl:9,team:0})&&mineNode(b,{lvl:9,team:0}).rt===rt))return null;const n=mineFree(rt,hq.x,hq.y,0);return n&&!placeBlock('mine',n.x,n.y)?{x:n.x,y:n.y}:null}
  const nd=nearestNode(rt,hq.x,hq.y,2600);if(!nd||minedBy(0,nd))return null;
  for(let d=34;d<=MINE_RNG*.8;d+=12)for(let k=0;k<20;k++){const a=k*.314,x=nd.x+Math.cos(a)*d,y=nd.y+Math.sin(a)*d;if(!placeBlock(MINE_RT[rt],x,y))return{x,y}}return null}
function advBuild(type,at){
  const spot=at||advFindSpot(type),d=BLDS[type];if(!spot){toast(tr('Kein passender Platz gefunden.'));sfx('error');return false}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');return false}
  const b=addBld(type,0,spot.x,spot.y,false);
  if(type==='harbor'){let best=0,bs=-9;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100]){const t=terrAt(spot.x+Math.cos(a)*dd,spot.y+Math.sin(a)*dd);sc+=t===0?2:t===1?1:-2}if(sc>bs){bs=sc;best=a}}b.ang=best}
  const ws=G.ents.filter(e=>!e.dead&&e.team===0&&e.type==='worker'&&!e.upj);
  ws.sort((a,c)=>((a.state==='idle'?0:1)-(c.state==='idle'?0:1))||(Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y)));
  if(ws[0]){ws[0].state='build';ws[0].tid=b.id}
  sfx('click');return true}
function advIdle(){
  const R=G.res[0],ep=G.epoch[0];let i=0;
  const goal={food:300,wood:300,stone:ep>=1?160:0,iron:ep>=2?100:0,gold:ep>=3?150:0,oil:ep>=5&&G.ents.some(b=>!b.dead&&b.team===0&&b.type==='refinery'&&b.built)?100:0},need=RES.filter(rt=>goal[rt]).sort((a,b)=>R[a]/goal[a]-R[b]/goal[b])[0];
  for(const u of G.ents){if(u.dead||u.team!==0||u.kind!=='unit'||!UNITS[u.type].gather||u.state!=='idle'||u.upj)continue;
    const order=UNITS[u.type].naval?['food']:[need,'food','wood','food'];
    const rt0=order[i++%order.length];
    for(const rt of [rt0,'wood','food']){if(!UNITS[u.type].naval&&!canGather(u,rt))continue;const n=nearestNode(rt,u.x,u.y,900,u,true)||nearestNode(rt,u.x,u.y,900,u);if(n){u.state='gather';u.tid=n.id;u.rtype=rt;u.pf=null;break}}}
  sfx('order')}
function shiftWorkers(from,to,n){let k=0;for(const w of G.ents){if(k>=n)break;if(w.dead||w.team!==0||w.type!=='worker'||w.rtype!==from||(w.state!=='gather'&&w.state!=='mine')||w.upj||!canGather(w,to))continue;const nd=nearestNode(to,w.x,w.y,900,w,true)||nearestNode(to,w.x,w.y,900,w);if(nd){if(w.inm)mineOut(w);w.state='gather';w.tid=nd.id;w.rtype=to;w.pf=null;w.carry=0;k++}}sfx('order')}
function sendArmy(tx,ty){const us=G.ents.filter(u=>!u.dead&&u.team===0&&u.kind==='unit'&&!UNITS[u.type].passive&&!UNITS[u.type].naval&&!u.upj);const cols=Math.ceil(Math.sqrt(us.length)||1);us.forEach((u,i)=>giveOrder(u,{t:'amove',x:tx+(i%cols-(cols-1)/2)*20,y:ty+(Math.floor(i/cols)-(cols-1)/2)*20},false));fxMark(tx,ty,'attack');sfx('order')}
/* Reihenfolge der Vorschläge: kleiner = wichtiger (Verteidigung 0, Mangel/Untätige 1, ...) */
function advKey(r){const S=STRATS[advisor.strat]||STRATS.balanced,bw=S.w||{},base={defend:0,low:0.5,idle:1,adv:1.5,demo:1.8,surplus:2.1,balance:2,explore:3,in:4},k=r.id.split(':')[0];return bw[k]!==undefined?bw[k]:base[k]!==undefined?base[k]:5}
let ADV_SIEGE_CAP=true;
function advRules(){
  const ep=G.epoch[0],R=G.res[0],hq=G.ents.find(e=>e.type==='hq'&&e.team===0&&!e.dead);if(!hq||!hq.built)return[];
  const mine=G.ents.filter(e=>!e.dead&&e.team===0),has=t=>mine.filter(e=>e.type===t);
  const workers=has('worker'),idle=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].gather&&e.state==='idle'&&!e.upj);
  const queuedW=hq.queue.filter(q=>q.type==='worker').length,rules=[],push=r=>rules.push(r);
  const bars=has('barracks'),mil=mine.filter(e=>e.kind==='unit'&&!UNITS[e.type].passive&&!UNITS[e.type].naval).length,S=STRATS[advisor.strat]||STRATS.balanced,I=advIntel();advisor.intel=I;
  // Gefahr: Feinde in der Nähe der Siedlung
  const blds0=mine.filter(e=>e.kind==='bld');
  const foes=G.ents.filter(e=>!e.dead&&e.team===1&&e.kind==='unit'&&shown(e)&&blds0.some(b=>dist(b,e)<320));
  if(foes.length){advisor.calmT=G.t;if(advisor.strat!=='turtle'&&!advisor.reacted){advisor.reacted=advisor.strat;advisor.strat='turtle';toast(tr('Berater: Wegen des Angriffs wechselt die Taktik auf Verteidigung.'),'warn')}}
  else if(advisor.reacted&&G.t-(advisor.calmT||0)>90){advisor.strat=advisor.reacted;advisor.reacted=null;toast(tr('Berater: Die Lage ist ruhig, Taktik zurück auf {0}.',tr(STRATS[advisor.strat].name)),'good')}
  if(foes.length){const c=foes.reduce((a,e)=>({x:a.x+e.x/foes.length,y:a.y+e.y/foes.length}),{x:0,y:0});if(mil>0)push({id:'defend',txt:'Angriff! {0} Feinde bei deiner Siedlung – alle Truppen zur Verteidigung schicken',args:[foes.length],go:()=>{sendArmy(c.x,c.y)}})}
  if(G.pop[0]>=G.cap[0]-S.hs&&G.cap[0]<POPMAX&&!mine.some(e=>e.type==='house'&&!e.built)&&afford(0,BLDS.house.cost)&&advFindSpot('house'))
    push({id:'house',txt:'eine Hütte bauen (die Bevölkerungsgrenze ist fast erreicht)',cost:BLDS.house.cost,go:()=>advBuild('house')});
  if(has('scout').some(u=>u.state==='idle'&&!u.upj))push({id:'explore',txt:'die Späher automatisch erkunden lassen',go:()=>{has('scout').forEach(u=>{if(u.state==='idle'){u.state='explore';u.ex=null}});sfx('order')}});
  if(idle.length)push(idle.length===1?{id:'idle',txt:'eine untätige Einheit an die Arbeit schicken',go:advIdle}:{id:'idle',txt:'{0} untätige Einheiten an die Arbeit schicken',args:[idle.length],go:advIdle});
  if(workers.length+queuedW<Math.max(S.wk[ep],wkNeed(ep))&&hq.queue.length<2&&G.pop[0]<G.cap[0]&&afford(0,UNITS.worker.cost))
    push({id:'worker',txt:'einen Arbeiter ausbilden',cost:UNITS.worker.cost,go:()=>enqueue(hq,'worker',0)&&(panelSig='')});
  const pd=pending(0);
  const danger=foes.length>0||G.t-(advisor.calmT||-999)<30; /* M4: unter Angriff (und 30 s danach) keine Upgrades, sie lassen Einheiten und Gebäude ruhen */
  if(pd.n&&!G.adv[0]&&!danger){const gs=pd.groups.filter(g=>afford(0,g.cost)).sort((a,b)=>a.n-b.n);
    if(afford(0,pd.cost)&&pd.groups.length>1)push({id:'upg:all',txt:'alles auf Stufe {0} upgraden',args:[LVLN[ep]],cost:pd.cost,go:()=>startUpgrade(0,'all')});
    else if(gs[0])push({id:'upg:'+gs[0].key,txt:'{0} auf Stufe {1} upgraden',args:[tr(gs[0].nm),LVLN[ep]],cost:gs[0].cost,go:()=>startUpgrade(0,gs[0].key)})}
  if(ep<EPOCHS.length-1&&!G.adv[0]&&!pd.n&&!G.jobs[0].length&&afford(0,EPOCHS[ep].cost))push({id:'adv',txt:'in die {0} aufsteigen',args:[tr(EPOCHS[ep+1].name)],cost:EPOCHS[ep].cost,go:()=>advance(0)});
  if(!bars.length&&workers.length>=S.barW&&afford(0,BLDS.barracks.cost)&&advFindSpot('barracks'))push({id:'barracks',txt:'eine Kaserne bauen, um Truppen auszubilden',cost:BLDS.barracks.cost,go:()=>advBuild('barracks')});
  if(ep>=(advisor.strat==='turtle'?0:1)&&has('tower').length<S.tow(ep)&&workers.length>=8&&afford(0,BLDS.tower.cost)&&advFindSpot('tower'))push({id:'tower',txt:'einen Wachturm bauen, um Land zu erobern und zu überblicken',cost:BLDS.tower.cost,go:()=>advBuild('tower')});
  if(!has('harbor').length&&workers.length>=9&&afford(0,BLDS.harbor.cost)&&advFish().length&&advFindSpot('harbor',1))push({id:'harbor',txt:'einen Hafen bauen, um Fische zu fangen',cost:BLDS.harbor.cost,go:()=>advBuild('harbor',advFindSpot('harbor',1))});
  if(ep>=1&&workers.length>=8&&has('farm').length<Math.min(2+ep,5)&&R.food<420&&afford(0,BLDS.farm.cost)&&advFindSpot('farm')&&!mine.some(e=>e.type==='farm'&&!e.built))push({id:'farm',txt:'ein Feld anlegen (Nahrung, die nie ausgeht)',cost:BLDS.farm.cost,go:()=>advBuild('farm')});
  {const cm=has('mine').find(b=>b.built&&!b.empty&&cartWant(b)<CART_MAX&&mineStock(b)>=MINE_STOCK*.8&&minersIn(b)>=3&&afford(0,CART_COST));if(cm)push({id:'cart2:'+cm.id,txt:'eine zusätzliche Lore für die Mine kaufen (das Minenlager ist fast voll)',cost:CART_COST,go:()=>{buyCart(0,cm.id)}})}
  // erschöpfte Minen abreißen (Rest im Lager wird erstattet; nicht, solange noch eine Lore unterwegs ist)
  {const em=has('mine').find(b=>b.built&&b.empty&&!G.ents.some(c=>c.type==='cart'&&c.home===b.id&&!c.dead));if(em)push({id:'demo:'+em.id,txt:'die erschöpfte Mine abreißen (es gibt dort nichts mehr zu holen)',go:()=>{demolish(0,em.id);sfx('click')}})}
  // Minen: Eisen ab der Eisenzeit, Gold ab dem Mittelalter; Markt zum Tauschen
  if(ep>=1&&workers.length>=6&&!mine.some(e=>(e.type==='mine'||e.type==='derrick')&&!e.built))for(const rt of['stone','iron','gold','oil']){if(ep<RES_EP[rt])continue;const bt=MINE_RT[rt],sp=advMineSpot(rt,hq);if(!afford(0,BLDS[bt].cost))continue;
    if(sp){push({id:'mine:'+rt,txt:bt==='mine'?'eine Mine für {0} bauen (ohne Mine kann man {0} nicht abbauen)':'einen Bohrturm für {0} bauen (ohne Bohrturm gibt es kein {0})',args:[rn(rt)],cost:BLDS[bt].cost,go:()=>advBuild(bt,sp)});break}}
  if(ep>=5&&has('derrick').some(b=>b.built)&&!has('refinery').length&&afford(0,BLDS.refinery.cost)&&advFindSpot('refinery'))push({id:'refinery',txt:'eine Raffinerie bauen (hier wird das Öl abgeliefert)',cost:BLDS.refinery.cost,go:()=>advBuild('refinery')});
  if(ep>=3&&!has('market').length&&workers.length>=14&&R.gold<250&&afford(0,BLDS.market.cost)&&advFindSpot('market'))push({id:'market',txt:'einen Markt bauen, um Rohstoffe gegen Gold zu tauschen',cost:BLDS.market.cost,go:()=>advBuild('market')});
  /* Gold-Überschuss: viel Gold liegt herum, ein Rohstoff ist knapp -> 100 davon auf dem Markt kaufen */
  if(has('market').some(b=>b.built)&&R.gold>=Math.max(1200,TRADE.lot*TRADE.buy*4)){const rt=['food','wood','stone','iron'].filter(x=>ep>=(RES_EP[x]||0)&&R[x]<350).sort((x,y)=>R[x]-R[y])[0];if(rt)push({id:'gbuy:'+rt,txt:'100 {0} auf dem Markt mit Gold kaufen (viel Gold im Lager, {0} ist knapp)',args:[rn(rt)],go:()=>{if(!trade(0,rt,'buy'))toast(tr('Nicht genug Rohstoffe.'),'warn')}})}
  if(has('market').some(b=>b.built)&&R.gold<200){const rt=['food','wood','stone'].find(x=>R[x]>(x==='stone'?450:800));if(rt)push({id:'trade:'+rt,txt:'100 {0} auf dem Markt gegen Gold tauschen (Vorrat ist groß)',args:[rn(rt)],go:()=>{trade(0,rt,'sell');sfx('click')}})}
  const ub=bars.find(b=>b.built&&b.queue.length<(R.food>350&&R.wood>250?2:1));
  if(ub&&mil<S.mil(ep)){const t=Object.keys(UNITS).filter(k=>UNITS[k].from==='barracks'&&uOk(k,ep)&&!UNITS[k].siege&&!UNITS[k].passive&&(!UNITS[k].tech||G.tech[0].has(UNITS[k].tech))).sort((a,b)=>UNITS[b].ep-UNITS[a].ep).find(k=>afford(0,UNITS[k].cost));if(t)push({id:'army',txt:'{0} ausbilden',args:[tr(UNITS[t].name)],cost:UNITS[t].cost,go:()=>enqueue(ub,t,0)&&(panelSig='')})}
  {const have=new Set([...G.tech[0],...G.rs[0].map(r=>r.id)]);const cand=TECHS.filter(t=>t.ep<=ep&&!have.has(t.id)&&afford(0,t.cost)&&mine.some(e=>e.kind==='bld'&&e.built&&(e.type===t.bld||(t.blds&&t.blds.includes(e.type)))));
    const prefer=cand.find(t=>t.bld==='barracks'&&bars.length&&!t.fx.ratk&&!t.fx.matk&&!t.fx.hp)||cand.find(t=>t.bld==='hq')||cand[0];
    if(prefer&&!G.rs[0].length&&workers.length>=6)push({id:'tech:'+prefer.id,txt:'die Technologie {0} erforschen',args:[tr(prefer.name)],cost:prefer.cost,go:()=>startResearch(0,prefer.id)})}
  // Angriff, wenn die Armee groß genug ist und ein Ziel bekannt ist
  {const known=[...G.mem.values()];const tgt=known.find(m=>m.type==='hq')||known.sort((a,b)=>dist(a,hq)-dist(b,hq))[0];
    if(tgt&&mil>=S.atk(ep)&&!foes.length)push({id:'attack',txt:'mit {0} Truppen das gegnerische {1} angreifen',args:[mil,tr(BLDS[tgt.type].name)],go:()=>sendArmy(tgt.x,tgt.y)})}
  // Rohstoffmangel: für den nächsten Aufstieg fehlt eine Ressource, aber kaum jemand sammelt sie
  if(ep<EPOCHS.length-1&&workers.length>=8){const goal=EPOCHS[ep].cost;
    for(const rt of RES){const need=goal[rt]||0;if(!need||R[rt]>=need)continue;const on=workers.filter(w=>w.rtype===rt&&((w.state==='gather'||w.state==='mine')||w.state==='return')).length;if(on>=5||!workers.some(w=>canGather(w,rt)))continue;
      const donor=RES.filter(x=>x!==rt&&R[x]>(goal[x]||0)+150).sort((a,b)=>R[b]-R[a])[0];if(donor){push({id:'shift:'+rt,txt:'Arbeiter auf {0} umstellen (wird für den Aufstieg gebraucht)',args:[rn(rt)],go:()=>shiftWorkers(donor,rt,3)});break}}}
  // Knappe Vorräte: sofort reagieren, wenn eine Ressource fast leer ist
  if(workers.length>=6)for(const rt of RES){const goal={food:60,wood:60,stone:30,iron:30}[rt];if(!goal||R[rt]>=goal||!workers.some(w=>canGather(w,rt)))continue;
    const on=workers.filter(w=>w.rtype===rt&&(w.state==='gather'||w.state==='mine')).length,donor=RES.filter(x=>x!==rt&&on<3&&workers.filter(w=>w.rtype===x&&(w.state==='gather'||w.state==='mine')).length>=4).sort((x,y)=>R[y]-R[x])[0];
    if(donor){push({id:'low:'+rt,txt:'{0} ist knapp ({1}) – 3 Arbeiter von {2} auf {0} umstellen',args:[rn(rt),Math.floor(R[rt]),rn(donor)],go:()=>shiftWorkers(donor,rt,3)});break}}
  // Fischerboote: Nahrung vom Meer
  {const hb=has('harbor').find(b=>b.built&&b.queue.length<1),nb=has('boat').length;
    if(hb&&nb<2+Math.min(3,ep)&&G.pop[0]<G.cap[0]&&afford(0,UNITS.boat.cost))push({id:'boat',txt:'ein Fischerboot ausbilden (Nahrung vom Meer)',cost:UNITS.boat.cost,go:()=>enqueue(hb,'boat',0)&&(panelSig='')})}
  // Arbeiter umverteilen: ein Rohstoff fehlt, ein anderer liegt ungenutzt herum
  if(workers.length>=8){const can=RES.filter(rt=>workers.some(w=>canGather(w,rt))),on=rt=>workers.filter(w=>w.rtype===rt&&(w.state==='gather'||w.state==='mine')).length;
    const lo=can.filter(rt=>R[rt]<100).sort((x,y)=>R[x]-R[y])[0],hi=can.filter(rt=>R[rt]>420&&on(rt)>=4).sort((x,y)=>R[y]-R[x])[0];
    if(lo&&hi&&lo!==hi)push({id:'balance:'+lo,txt:'3 Arbeiter von {0} auf {1} umstellen (hier fehlt es, dort liegt genug)',args:[rn(hi),rn(lo)],go:()=>shiftWorkers(hi,lo,3)})}
  // Überschuss: ein Rohstoff liegt weit über dem Bedarf (> 1800), ein anderer ist knapp -> 4 Arbeiter umstellen (auch Stein/Eisen/Gold, sobald eine Mine mit freiem Platz da ist)
  if(workers.length>=10){const goal=ep<EPOCHS.length-1?EPOCHS[ep].cost:{},can=RES.filter(rt=>ep>=(RES_EP[rt]||0)&&workers.some(w=>canGather(w,rt))),on=rt=>workers.filter(w=>w.rtype===rt&&(w.state==='gather'||w.state==='mine')).length;
    const big=rt=>Math.max(1800,(goal[rt]||0)*1.25+500),low=rt=>Math.max(450,Math.min(900,(goal[rt]||0)*.6)),hi=can.filter(rt=>R[rt]>big(rt)&&on(rt)>=5).sort((x,y)=>R[y]/big(y)-R[x]/big(x))[0];
    if(hi){const lo=can.filter(rt=>rt!==hi&&rt!=='oil'&&R[rt]<low(rt)&&on(rt)<14&&nearestNode(rt,hq.x,hq.y,900,workers[0],true)).sort((x,y)=>R[x]/low(x)-R[y]/low(y))[0];
      if(lo)push({id:'surplus:'+lo,txt:'4 Arbeiter von {0} ({1} im Lager) auf {2} umstellen (zu viel {0}, zu wenig {2})',args:[rn(hi),Math.floor(R[hi]),rn(lo)],go:()=>shiftWorkers(hi,lo,4)})}}
  // Lager am Wald: wenn viele Holzfäller weit vom nächsten Abgabegebäude arbeiten
  {const drops=mine.filter(e=>e.kind==='bld'&&e.built&&BLDS[e.type].drop),cutters=workers.filter(w=>w.rtype==='wood'&&(w.state==='gather'||w.state==='return')&&w.tid&&G.byId.get(w.tid));
    if(cutters.length>=3&&drops.length&&workers.length>=6&&afford(0,BLDS.store.cost)&&!mine.some(e=>e.type==='store'&&!e.built)){
      const far=cutters.filter(w=>{const n=G.byId.get(w.tid);return Math.min(...drops.map(d=>Math.hypot(d.x-n.x,d.y-n.y)))>170});
      if(far.length>=3){const cx=far.reduce((s,w)=>s+G.byId.get(w.tid).x,0)/far.length,cy=far.reduce((s,w)=>s+G.byId.get(w.tid).y,0)/far.length;
        let spot=null;for(let d=30;d<=110&&!spot;d+=14)for(let k=0;k<24&&!spot;k++){const a=k*.2618,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(!placeBlock('store',x,y)&&!mine.some(e=>e.kind==='bld'&&BLDS[e.type].drop&&Math.hypot(e.x-x,e.y-y)<170)&&!mine.some(e=>e.kind==='bld'&&Math.hypot(e.x-x,e.y-y)-e.r-BLDS.store.r<30))spot={x,y}}
        if(spot)push({id:'store',txt:'ein Lager nahe dem Wald bauen, damit die Holzfäller kürzere Wege haben',cost:BLDS.store.cost,go:()=>{if(!pay(0,BLDS.store.cost)){toast(missing(0,BLDS.store.cost)+'.');return false}const b=addBld('store',0,spot.x,spot.y,false);const ws=far.slice(0,2);ws.forEach(w=>{w.state='build';w.tid=b.id;w.pf=null});sfx('click');return true}})}}}
  if(G.t>40&&!has('scout').length&&hq.queue.length<2&&afford(0,UNITS.scout.cost))push({id:'scout',txt:'einen Späher ausbilden, um die Karte zu erkunden',cost:UNITS.scout.cost,go:()=>enqueue(hq,'scout',0)&&(panelSig='')});
  // zweite Kaserne bei Angriffstaktik
  if(bars.length===1&&bars[0].built&&workers.length>=S.bar2&&afford(0,BLDS.barracks.cost)&&advFindSpot('barracks'))push({id:'barracks2',txt:'eine zweite Kaserne bauen, um mehr Truppen gleichzeitig auszubilden',cost:BLDS.barracks.cost,go:()=>advBuild('barracks')});
  // Erkenntnisse über den Gegner
  if(I.known||I.vis){
    const trainable=ks=>{const b=bars.find(b=>b.built&&b.queue.length<2);if(!b)return null;const t=ks.find(k=>UNITS[k]&&UNITS[k].ep<=ep&&(!UNITS[k].tech||G.tech[0].has(UNITS[k].tech))&&afford(0,UNITS[k].cost));return t?{b,t}:null};
    const counter=(id,txt,ks)=>{const c=trainable(ks);if(c)push({id,txt,args:[tr(UNITS[c.t].name)],cost:UNITS[c.t].cost,go:()=>enqueue(c.b,c.t,0)&&(panelSig='')})};
    if(I.horse>=2)counter('cn:horse','Der Gegner hat Reiter – {0} ausbilden (stark gegen Reiter)',['spear']);
    if(I.ranged>=4)counter('cn:ranged','Der Gegner setzt auf Fernkämpfer – {0} ausbilden, um sie schnell zu erreichen',['knight','sword','club']);
    if(I.mel>=5&&I.mel>mil)counter('cn:mel','Viele gegnerische Nahkämpfer – {0} ausbilden (schießen aus der Distanz)',['musket','crossbow','archer']);
    /* M5: Belagerung begrenzen: höchstens 1 + Türme/2 (+1 ab Mittelalter), nie mehr als 4 und nie mehr als ein Drittel der Truppen (vorher unbegrenzt: viele Rammen) */
    const sg=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].siege).length+bars.reduce((n,b)=>n+b.queue.filter(q=>q.type&&UNITS[q.type]&&UNITS[q.type].siege).length,0),sgCap=ADV_SIEGE_CAP?Math.min(4,1+Math.ceil(I.towers/2)+(ep>=3?1:0),Math.max(1,Math.floor(mil/3))):99;
    if((I.towers>=2||I.siege)&&sg<sgCap&&(mil>=3||!ADV_SIEGE_CAP))counter('cn:siege','Der Gegner baut Türme und Burgen – {0} ausbilden, um sie zu brechen',['cannon','catapult','ram']);
    if(I.vis>=4&&I.vis>mil+2&&hq)push({info:true,id:'in:weak',txt:'Achtung: Der Gegner hat mehr Truppen in Sicht ({0}) als du ({1}) – mehr Truppen und Türme einplanen',args:[I.vis,mil],go:()=>{sfx('click')}});
    if(I.known&&I.ep>ep&&ep<EPOCHS.length-1)push({info:true,id:'in:behind',txt:'Der Gegner ist schon in der {0} – du liegst zurück, steige bald auf',args:[tr(EPOCHS[I.ep].name)],go:()=>{sfx('click')}});
    if((I.harbor||I.naval)&&!has('harbor').length&&workers.length>=8&&afford(0,BLDS.harbor.cost)&&advFindSpot('harbor'))push({id:'in:harbor',txt:'Der Gegner hat Schiffe oder einen Hafen – baue selbst einen Hafen und Kriegsschiffe',cost:BLDS.harbor.cost,go:()=>advBuild('harbor')});
  }
  rules.sort((a,b)=>advKey(a)-advKey(b));
  return rules}
function advisorUI(){
  const el=$('advisor');if(!el)return;/* Auto an: keine Blase mit Haken/X (Auto führt selbst aus), nur eine ruhige Zeile mit der letzten Meldung (~3,5 s) */
  const c=advisor.auto?null:advisor.cur,nt=advisor.auto&&advisor.note&&advisor.note.until>G.t?advisor.note:null;
  if(!advOn||!G||!G.running||menuOpen||G.mp){el.hidden=true;advisor.shown='';return}
  el.hidden=false;
  if(advisor.o2===undefined){advisor.o2=1;if(ui2())advisor.open=false} // neue Oberfläche: Berater startet als kleine Pille
  const I=advisor.intel||advIntel();
  const chips=Object.entries(STRATS).map(([k,v])=>`<button class="st" data-st="${k}" aria-pressed="${k===advisor.strat}" title="${tr(v.desc)}">${tr(v.name)}</button>`).join('');
  const open_=advisor.open?`<div class="sts" role="group" aria-label="${tr('Taktik')}">${chips}</div><p class="intel">${advIntelText(I)}</p>`:'';
  /* Neue Oberfläche: Sprechblase/Pille mit runden Ja/Nein-Knöpfen (Y/X bleiben) */
  const html=ui2()?`<div class="bb${c?' has':''}"><span class="av">★</span><div class="bm">${c?`<p>${tr(c.txt,...(c.args||[]))}</p>${c.cost?`<div class="ac">${costHTML(c.cost)}</div>`:''}`:`<p class="idl">${nt?nt.txt:tr('Berater')}</p>`}</div>${c?`<button class="yn yes" data-a="y" title="${tr('Annehmen (Y)')}" aria-label="${tr('Annehmen (Y)')}">✓</button><button class="yn no" data-a="n" title="${tr('Ablehnen (X)')}" aria-label="${tr('Ablehnen (X)')}">✕</button>`:''}<button class="auto" data-ad="auto" aria-pressed="${advisor.auto}" title="${tr('Auto-Modus: Vorschläge werden nach 2 Sekunden automatisch angenommen')}">${tr('Auto')} ${advisor.auto?tr('an'):tr('aus')}</button><button class="x" data-ad="tog" title="${advisor.open?tr('Einklappen'):tr('Aufklappen')}" aria-label="${advisor.open?tr('Einklappen'):tr('Aufklappen')}">${advisor.open?'–':'+'}</button></div>${open_}`:
  `<div class="ah"><span class="ai">★</span><b>${tr('Berater')}</b><button class="auto" data-ad="auto" aria-pressed="${advisor.auto}" title="${tr('Auto-Modus: Vorschläge werden nach 2 Sekunden automatisch angenommen')}">${tr('Auto')} ${advisor.auto?tr('an'):tr('aus')}</button><button class="x" data-ad="tog" title="${tr('Einklappen')}">${advisor.open?'–':'+'}</button></div>`+(advisor.open?`<div class="sts" role="group" aria-label="${tr('Taktik')}">${chips}</div><p class="intel">${advIntelText(I)}</p>`:'')+(nt?`<p class="intel">${nt.txt}</p>`:'')+(c?`<p>${tr('Dein Berater schlägt vor:')} <b>${tr(c.txt,...(c.args||[]))}</b></p>${c.cost?`<div class="ac">${costHTML(c.cost)}</div>`:''}<div class="ab"><button class="ub ok" data-a="y">${tr('Annehmen')} (Y)</button><button class="ub bad" data-a="n">${tr('Ablehnen')} (X)</button></div>`:'');
  if(html!==advisor.shown){advisor.shown=html;el.innerHTML=html}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#advisor [data-st],#advisor [data-ad]');if(!t)return;if(t.dataset.st){advisor.strat=t.dataset.st;advisor.ignore={};advisor.cur=null;advisor.next=0;advisor.last=-9;toast(tr('Taktik: {0}',tr(STRATS[advisor.strat].name)),'good');sfx('click')}else if(t.dataset.ad==='auto'){advisor.auto=!advisor.auto;advisor.autoAt=G.t+2;toast(advisor.auto?tr('Auto-Modus an: Der Berater handelt selbst.'):tr('Auto-Modus aus.'),'good')}else advisor.open=!advisor.open;advisor.shown='';advisorUI()});
function advisorTick(){
  if(!G||!G.running||G.over)return;if(G.mp){advisor.cur=null;return}
  if(!advOn){advisor.cur=null;return}
  if(G.t-advisor.last<.5)return;advisor.last=G.t;
  const rules=advRules().filter(r=>!(advisor.ignore[r.id]>G.t));
  if(advisor.cur&&rules.some(r=>r.id===advisor.cur.id)){const top=rules[0];
    if(top&&top.id!==advisor.cur.id&&advKey(top)<advKey(advisor.cur)&&advKey(top)<=0){advisor.cur=top;advisor.shown='';advisor.autoAt=G.t+2;sfx('select');return} // Dringendes (Angriff) unterbricht den alten Vorschlag
    advisor.cur=rules.find(r=>r.id===advisor.cur.id);if(advisor.auto&&G.t>=advisor.autoAt)advAnswer(true);return}
  advisor.cur=null;
  if(G.t>=advisor.next&&rules.length){advisor.cur=rules[0];advisor.shown='';advisor.autoAt=G.t+1.2;if(!advisor.auto)sfx('select')}}
function advAnswer(yes){const c=advisor.cur;if(!c)return;advisor.cur=null;advisor.shown='';advisor.next=G.t+(yes?.8:1.5);advisor.ignore[c.id]=G.t+(c.info?240:yes?12:70);if(yes)c.go();if(yes&&advisor.auto)advisor.note={txt:tr(c.txt,...(c.args||[])),until:G.t+3.5};panelSig='';infoCache='';advisorUI()}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#advisor [data-a]');if(b)advAnswer(b.dataset.a==='y')});

