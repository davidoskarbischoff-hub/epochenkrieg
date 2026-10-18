/* Epochenkrieg – Gegner-KI (aiTick).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- AI ---------- */
function findSpot(team,cx,cy,r,minD,maxD){for(let k=0;k<80;k++){const a=Math.random()*6.283,d=minD+Math.random()*(maxD-minD);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(validSpot(x,y,r))return{x,y}}return null}
/* Platzwahl mit Abstand: viele Kandidaten, nur gültige mit Mindestlücke zu eigenen Gebäuden, der mit der größten Lücke gewinnt (so entsteht keine Klumpenbildung) */
const AI_GAP={house:46,barracks:90,store:80,farm:55,market:90,mine:30,harbor:60,castle:160,tower:460};
function aiBestSpot(type,hq,minD,maxD,wantAng,tol){
  const d=BLDS[type],gap=AI_GAP[type]||50,own=G.ents.filter(e=>!e.dead&&e.team===1&&e.kind==='bld'),towers=own.filter(e=>e.type==='tower'||e.type==='castle');
  let best=null,bs=-1e9;
  for(let k=0;k<160;k++){const a=wantAng===undefined?Math.random()*6.283:wantAng+(Math.random()-.5)*2*tol,dd=minD+Math.random()*(maxD-minD),x=hq.x+Math.cos(a)*dd,y=hq.y+Math.sin(a)*dd;
    if(!validSpot(x,y,d.r))continue;let g=1e9;for(const e of own)g=Math.min(g,Math.hypot(e.x-x,e.y-y)-e.r-d.r);if(g<gap)continue;
    let sc=Math.min(g,260)+Math.random()*30;if(type==='tower'){let tg=1e9;for(const t of towers)tg=Math.min(tg,Math.hypot(t.x-x,t.y-y));if(tg<AI_GAP.tower)continue;sc+=Math.min(tg,500)*.3}
    if(sc>bs){bs=sc;best={x,y}}}
  return best}
function aiPlaceSpread(type,hq,minD,maxD,wantAng,tol){const d=BLDS[type];if(!afford(1,d.cost))return null;const s=aiBestSpot(type,hq,minD,maxD,wantAng,tol);if(!s)return null;pay(1,d.cost);return addBld(type,1,s.x,s.y,false)}
/* Türme bilden einen weiten Ring: der erste zeigt zur Kartenmitte (Gegner), weitere versetzt links/rechts und dann hinten */
function aiPlaceTower(hq,n){const base=Math.atan2(H/2-hq.y,W/2-hq.x),offs=[0,.95,-.95,1.9,-1.9,3.1];return aiPlaceSpread('tower',hq,290+Math.min(n,4)*40,470+Math.min(n,4)*50,base+offs[n%offs.length],.5)||aiPlaceSpread('tower',hq,220,520)}
function aiPlace(type,hq,minD,maxD){return aiPlaceSpread(type,hq,minD,maxD)||(()=>{const d=BLDS[type];if(!afford(1,d.cost))return null;const s=findSpot(1,hq.x,hq.y,d.r,minD,maxD);if(!s)return null;pay(1,d.cost);return addBld(type,1,s.x,s.y,false)})()}
function aiPlaceOld(type,hq,minD,maxD){const d=BLDS[type];if(!afford(1,d.cost))return null;const s=findSpot(1,hq.x,hq.y,d.r,minD,maxD);if(!s)return null;pay(1,d.cost);return addBld(type,1,s.x,s.y,false)}
/* Turm in Richtung Kartenmitte: so wächst das Gebiet der KI nach vorn */
function aiPlaceToward(type,hq,minD,maxD){const d=BLDS[type];if(!afford(1,d.cost))return null;const base=Math.atan2(H/2-hq.y,W/2-hq.x);
  for(let k=0;k<80;k++){const a=base+(Math.random()-.5)*2,dd=minD+Math.random()*(maxD-minD),x=hq.x+Math.cos(a)*dd,y=hq.y+Math.sin(a)*dd;if(validSpot(x,y,d.r)){pay(1,d.cost);return addBld(type,1,x,y,false)}}return null}
function harborAngle(x,y){let best=0,bs=-9;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100]){const t=terrAt(x+Math.cos(a)*dd,y+Math.sin(a)*dd);sc+=t===0?2:t===1?1:-2}if(sc>bs){bs=sc;best=a}}return best}
function aiPlaceHarbor(hq){const d=BLDS.harbor;if(!afford(1,d.cost))return null;
  for(let k=0;k<200;k++){const a=Math.random()*6.283,dd=140+Math.random()*360,x=hq.x+Math.cos(a)*dd,y=hq.y+Math.sin(a)*dd;if(validSpot(x,y,d.r,true)&&harborOk(x,y,d.r)){pay(1,d.cost);const b=addBld('harbor',1,x,y,false);b.ang=harborAngle(x,y);return b}}return null}
/* Was die KI vom Gegner weiß: eigene Erkundung (ai.ex) und gesehene Gebäude/Einheiten (ai.seen) */
function aiLook(mine){const ai=G.ai,ex=ai.ex;
  for(const e of mine){const rc=sightOf(e)*.95/FC,cx=e.x/FC,cy=e.y/FC;for(let y=Math.max(0,Math.floor(cy-rc));y<=Math.min(FH-1,Math.ceil(cy+rc));y++)for(let x=Math.max(0,Math.floor(cx-rc));x<=Math.min(FW-1,Math.ceil(cx+rc));x++){const dx=x+.5-cx,dy=y+.5-cy;if(dx*dx+dy*dy<=rc*rc)ex[y*FW+x]=1}}
  for(const o of G.ents){if(o.dead||o.team!==0||o.kind==='node')continue;const i=fogIdx(o.x,o.y);if(ex[i]&&mine.some(e=>dist(e,o)<sightOf(e)+o.r))ai.seen.set(o.id,{id:o.id,x:o.x,y:o.y,kind:o.kind})}
  for(const [id] of ai.seen)if(!G.byId.has(id))ai.seen.delete(id)}
function aiWaterTarget(tx,ty){let best=null,bd=1e9;for(let r=120;r<=800;r+=40)for(let k=0;k<28;k++){const a=k*.2244,x=tx+Math.cos(a)*r,y=ty+Math.sin(a)*r;if(x<30||y<30||x>W-30||y>H-30||terrAt(x,y)>1||navDyn[navCell(x,y)])continue;const d=Math.hypot(x-tx,y-ty);if(d<bd){bd=d;best={x,y}}}return best}
function aiTick(){
  const ai=G.ai,r=G.res[1],ep=G.epoch[1],ST=AI_STYLES[ai.style]||AI_STYLES.balanced;
  const mine=G.ents.filter(e=>!e.dead&&e.team===1);
  const hq=mine.find(e=>e.type==='hq');if(!hq)return;
  const workers=mine.filter(e=>e.type==='worker'),blds=mine.filter(e=>e.kind==='bld');
  const army=mine.filter(e=>e.kind==='unit'&&!UNITS[e.type].passive&&!UNITS[e.type].naval),boats=mine.filter(e=>e.type==='boat'),ships=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].naval&&UNITS[e.type].ranged),scouts=mine.filter(e=>e.type==='scout');
  const unbuilt=blds.filter(b=>!b.built);
  aiLook(mine);
  const targetW=Math.round([6,12,20,30,36,38,40][ep]*ST.wk*(DIFF[diff].wk||1)),minT=ep<EPOCHS.length-1?AI_MINT[ep]*DIFF[diff].pace*ST.pace:0;
  const saving=ep<EPOCHS.length-1&&!G.adv[1]&&workers.length>=targetW-2&&G.t>=minT-60;
  const adv=ep<EPOCHS.length-1?advCost(1,ep):null;
  if(workers.length+hq.queue.filter(q=>q.type==='worker').length<targetW&&hq.queue.length<2&&!(saving&&r.food<adv.food+50))enqueue(hq,'worker',1);
  // Späher: einer erkundet die Karte
  if(G.t>60&&r.food>=130&&!scouts.length&&!hq.queue.some(q=>q.type==='scout')&&hq.queue.length<2&&G.pop[1]<G.cap[1])enqueue(hq,'scout',1);
  for(const sc of scouts)if(sc.state==='idle')sc.state='explore';
  // Sammeln verteilen
  const w8=[{food:.6,wood:.4,stone:0,iron:0},{food:.4,wood:.32,stone:.28,iron:0},{food:.4,wood:.24,stone:.16,iron:.2},{food:.36,wood:.22,stone:.18,iron:.24},{food:.34,wood:.2,stone:.18,iron:.28},{food:.32,wood:.2,stone:.16,iron:.32},{food:.3,wood:.18,stone:.14,iron:.3}][ep];
  w8.gold=[0,0,0,.1,.14,.16,.18][ep];w8.oil=blds.some(b=>b.type==='refinery'&&b.built)?[0,0,0,0,0,.12,.14][ep]:0;
  for(const k of RES){if(w8[k]){const f=r[k]>700?.3:r[k]>350?.65:r[k]<120?1.7:1;w8[k]*=f}} // Vorrat steuert die Verteilung: Überfluss -> weniger Arbeiter dort
  const cnt={food:0,wood:0,stone:0,iron:0,gold:0,oil:0};workers.forEach(w=>{if(w.state!=='idle'&&w.rtype)cnt[w.rtype]++});
  for(const w of workers){if(w.state!=='idle')continue;
    const n=workers.length;const order=RES.filter(rt=>canGather(w,rt)).sort((a,b)=>(w8[b]*n-cnt[b])-(w8[a]*n-cnt[a]));
    for(const rt of order){const node=nearestNode(rt,hq.x,hq.y,900,w,true)||nearestNode(rt,hq.x,hq.y,900,w)||nearestNode(rt,w.x,w.y,1800,w);if(node){w.state='gather';w.tid=node.id;w.rtype=rt;cnt[rt]++;break}}}
  // Umverteilen: Sammler wechseln nie von selbst; bei Überfluss an einem Rohstoff und Mangel an einem anderen gehen zwei in den Leerlauf und werden neu verteilt
  if(diff!=='leicht'&&G.t>(ai.balT||0)){ai.balT=G.t+12;
    const rich=RES.filter(k=>w8[k]&&r[k]>1800),poor=RES.filter(k=>w8[k]&&r[k]<450&&k!=='oil');
    if(rich.length&&poor.length){let n=0;for(const w of workers)if(n<2&&w.state==='gather'&&rich.includes(w.rtype)&&!(w.carry>1)&&!w.upj){w.state='idle';w.tid=null;w.rtype=null;n++}}}
  // Bauarbeiter
  for(const b of unbuilt){const busy=workers.some(w=>w.state==='build'&&w.tid===b.id);if(!busy){let bw=null,bd=1e9;for(const w of workers){if(w.state==='build')continue;const d=dist(w,b);if(d<bd){bd=d;bw=w}}if(bw){bw.state='build';bw.tid=b.id}}}
  // Lager neben weit entfernten Vorkommen, damit die Wege kurz bleiben
  if(G.t>(ai.storeT||60)&&workers.length>=8&&!unbuilt.some(b=>b.type==='store')&&afford(1,BLDS.store.cost)){ai.storeT=G.t+30;
    const drops=blds.filter(b=>b.built&&BLDS[b.type].drop),far={};
    for(const w of workers){if(w.state!=='gather'||!w.tid)continue;const n=get(w.tid);if(!n||n.sea)continue;if(Math.min(...drops.map(d=>dist(d,n)))>210)(far[n.rt]=far[n.rt]||[]).push(n)}
    const best=Object.values(far).sort((a,b)=>b.length-a.length)[0];
    const cx=best?best.reduce((s,n)=>s+n.x,0)/best.length:0,cy=best?best.reduce((s,n)=>s+n.y,0)/best.length:0;
    if(best&&best.length>=3&&blds.filter(b=>b.type==='store').length<2+ep&&!blds.some(b=>b.type==='store'&&Math.hypot(b.x-cx,b.y-cy)<190)){
      for(let d=24;d<=120;d+=12){let done=false;for(let k=0;k<14;k++){const a=Math.random()*6.283,x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(validSpot(x,y,BLDS.store.r)){pay(1,BLDS.store.cost);addBld('store',1,x,y,false);done=true;break}}if(done)break}}}
  // Felder: Nahrung, die nachwächst (ab Bronzezeit), wenn Beeren und Wild knapp werden
  if(ep>=1&&workers.length>=8&&G.t>(ai.farmT||0)&&!unbuilt.some(b=>b.type==='farm')){ai.farmT=G.t+35;const nf=blds.filter(b=>b.type==='farm').length;
    if(nf<Math.min(2+ep,5)&&r.wood>=BLDS.farm.cost.wood+60&&(r.food<400||nf<2))aiPlace('farm',hq,60,150)}
  for(const b of blds)if(b.type==='mine'&&b.empty&&!G.ents.some(c=>c.type==='cart'&&c.home===b.id&&!c.dead))demolish(1,b.id); // erschöpfte Minen abtragen
  // Minen für Eisen und Gold, Markt für Gold
  if(ep>=1&&workers.length>=6&&G.t>(ai.mineT||0)&&!unbuilt.some(b=>b.type==='mine'||b.type==='derrick')){ai.mineT=G.t+25;
    for(const rt of['stone','iron','gold','oil']){if(ep<RES_EP[rt])continue;const bt=MINE_RT[rt];if(!afford(1,BLDS[bt].cost))continue;
      if(bt==='mine'){if(blds.some(b=>b.type==='mine'&&b.built&&!b.empty&&minersIn(b)<MINE_CAP&&(mineNode(b,{lvl:9,team:1})||{}).rt===rt))continue;const n=mineFree(rt,hq.x,hq.y,1);if(n){pay(1,BLDS.mine.cost);addBld('mine',1,n.x,n.y,false);break}continue}
      const nd=nearestNode(rt,hq.x,hq.y,2600);if(!nd||minedBy(1,nd))continue;
      for(let k=0;k<60;k++){const a=Math.random()*6.283,d=34+Math.random()*(MINE_RNG*.55),x=nd.x+Math.cos(a)*d,y=nd.y+Math.sin(a)*d;if(validSpot(x,y,BLDS[bt].r)){pay(1,BLDS[bt].cost);addBld(bt,1,x,y,false);break}}break}}
  if(ep>=5&&blds.some(b=>b.type==='derrick'&&b.built)&&!blds.some(b=>b.type==='refinery')&&afford(1,BLDS.refinery.cost))aiPlace('refinery',hq,100,260);
  if(ep>=3&&workers.length>=16&&!blds.some(b=>b.type==='market')&&r.gold<250&&afford(1,BLDS.market.cost))aiPlace('market',hq,90,230);
  if(blds.some(b=>b.type==='market'&&b.built)&&r.gold<260)for(const rt of['food','wood','stone']){if(r[rt]>(rt==='stone'?500:850)&&trade(1,rt,'sell'))break}
  // Gebäude
  if(G.cap[1]-G.pop[1]<=3&&G.cap[1]<POPMAX&&!unbuilt.some(b=>b.type==='house'))(aiPlace('house',hq,90,200)||aiPlace('house',hq,150,330));
  const nBar=blds.filter(b=>b.type==='barracks').length,wantBar=(ep>=2&&diff!=='leicht'?2:1)+ST.bar+(diff!=='leicht'&&ep>=2&&workers.length>=12&&Math.min(r.food,r.wood)>1400?1:0);
  if(nBar<wantBar&&workers.length>=6&&!unbuilt.some(b=>b.type==='barracks')){const b=aiPlace('barracks',hq,110,210);if(b){const a=Math.atan2(H/2-hq.y,W/2-hq.x);b.rally={x:hq.x+Math.cos(a)*170,y:hq.y+Math.sin(a)*170}}}
  if(diff!=='leicht'&&!saving&&!blds.some(b=>b.type==='tower')&&(ep>=1||(G.t>170&&workers.length>=10))&&ST.tow>=0&&G.t>(ai.tow0T||0)&&afford(1,BLDS.tower.cost)){ai.tow0T=G.t+20;aiPlaceTower(hq,0)} /* Bauplatzsuche ist teuer: nur alle 20 s versuchen */
  // Expansion: weitere Türme Richtung Kartenmitte erobern Land
  const nTow=blds.filter(b=>b.type==='tower').length;
  if(ep>=1&&diff!=='leicht'&&!saving&&nTow<Math.min(4,1+ep)+ST.tow&&ST.tow>=0&&G.t>ai.towT&&!unbuilt.some(b=>b.type==='tower')&&afford(1,BLDS.tower.cost))ai.towT=G.t+(aiPlaceTower(hq,nTow)?80:25);
  if(saving&&G.t>=minT&&workers.length>=targetW-1&&afford(1,adv))advance(1);
  // Marine: Hafen, Fischerboote, Kriegsschiffe
  if(diff!=='leicht'){
    const harbor=blds.find(b=>b.type==='harbor'&&b.built);
    if(!blds.some(b=>b.type==='harbor')&&workers.length>=8&&G.t>100&&r.wood>=BLDS.harbor.cost.wood+120)aiPlaceHarbor(hq);
    if(harbor){
      if(boats.length+harbor.queue.filter(q=>q.type==='boat').length<2&&harbor.queue.length<2)enqueue(harbor,'boat',1);
      const wantShips=ep>=1&&!saving?Math.min(5,1+ep):0;
      if(ships.length+harbor.queue.filter(q=>UNITS[q.type].ranged).length<wantShips&&harbor.queue.length<2){const t=['ironclad','galleon','warship'].find(k=>uOk(k,ep)&&(k!=='galleon'||G.tech[1].has('galleonbuild')))||'boat';enqueue(harbor,t,1)}
      for(const bt of boats)if(bt.state==='idle'){const n=nearestNode('food',harbor.x,harbor.y,1500,bt,true)||nearestNode('food',harbor.x,harbor.y,1500,bt);if(n){bt.state='gather';bt.tid=n.id;bt.rtype='food'}}
      // Flotte greift an
      if(ships.length>=2&&G.t>=ai.shipNext){const seenHq=[...ai.seen.values()].find(s=>{const e=get(s.id);return e&&e.type==='hq'});const t=seenHq||{x:W-hq.x,y:H-hq.y};const w=aiWaterTarget(t.x,t.y);if(w){for(const sh of ships){sh.state='amove';sh.amove={x:w.x+(Math.random()-.5)*60,y:w.y+(Math.random()-.5)*60}}}ai.shipNext=G.t+110}
    }
  }
  // Armee
  /* Armeemischung nach Rollen: Front (hält die Linie), Fernkampf, Reiter, Belagerung, Sanitäter. Gebaut wird, was gemessen am Ziel-Anteil fehlt. */
  const ROLE=u=>({hbow:'rng',club:'front',spear:'front',sword:'front',engineer:'front',knight:'shock',sling:'rng',archer:'rng',crossbow:'rng',musket:'rng',rifle:'rng',catapult:'siege',cannon:'siege',howitzer:'siege',ram:'siege',tank:'siege',healer:'med'})[u]||({inf:'front',rng:'rng',cav:'shock',siege:'siege'})[UNITS[u].cls]||'front';
  const MIX={balanced:{front:.38,rng:.3,shock:.1,siege:.12,med:.1},turtle:{front:.5,rng:.3,siege:.1,med:.1},rush:{front:.42,shock:.22,rng:.22,siege:.09,med:.05},eco:{front:.4,rng:.35,siege:.1,med:.15},boom:{front:.35,rng:.3,siege:.2,med:.15}}[ai.style]||{front:.4,rng:.3,siege:.1,med:.1,shock:.1};
  const have=u=>uOk(u,ep)&&(!UNITS[u].tech||G.tech[1].has(UNITS[u].tech))&&u!=='scout'&&UNITS[u].from==='barracks'&&(!UNITS[u].nation||UNITS[u].nation===G.nation[1]);
  const pool=Object.keys(UNITS).filter(have),healers=mine.filter(e=>e.type==='healer'),all=army.concat(healers),tot=Math.max(1,all.length);
  const armyBase=Math.round([8,13,20,28,36,44,52][ep]*DIFF[diff].army*ST.army);
  /* Überschuss: liegt viel ungenutzt im Lager (die KI wartet auf den Aufstieg), wächst die Heeresgrenze um die Zahl der bezahlbaren Einheiten mit (Grenze je Schwierigkeit `DIFF.spare`); Aufstiegskosten bleiben zurückgelegt */
  const spare=Math.min((r.food-(saving?adv.food:0)-300)/70,(r.wood-(saving?(adv.wood||0):0)-100)/40),armyCap=armyBase+Math.max(0,Math.min(Math.ceil(armyBase*(DIFF[diff].spare||0)),Math.floor(spare))),queued=blds.reduce((n,b)=>n+(b.type==='barracks'?b.queue.length:0),0);
  for(const b of blds){if(b.type!=='barracks'||!b.built||b.queue.length>=2||army.length+queued>=armyCap)continue;
    if(saving&&!(r.food>adv.food+90&&r.wood>(adv.wood||0)+90))continue;
    const share={};for(const u of all)share[ROLE(u.type)]=(share[ROLE(u.type)]||0)+1;for(const q of blds.flatMap(x=>x.queue||[]))if(UNITS[q.type])share[ROLE(q.type)]=(share[ROLE(q.type)]||0)+1;
    const roles=Object.keys(MIX).sort((x,y)=>((share[x]||0)/tot/MIX[x])-((share[y]||0)/tot/MIX[y]));
    let pick=null;for(const role of roles){const cand=pool.filter(u=>ROLE(u)===role&&afford(1,UNITS[u].cost)).sort((x,y)=>UNITS[y].ep-UNITS[x].ep||(Math.random()<.5?1:-1));if(cand.length){pick=cand[Math.random()<.3&&cand.length>1?1:0];break}}
    if(!pick)pick=pool.filter(u=>afford(1,UNITS[u].cost)&&ROLE(u)==='front')[0];
    if(pick)enqueue(b,pick,1)}
  // Flugplatz und Flugzeuge (Weltkriegszeit), Turm-Ausbau
  if(ep>=6){const afs=blds.filter(b=>b.type==='airfield');
    if(!afs.length&&workers.length>=8&&!unbuilt.some(b=>b.type==='airfield'))aiPlace('airfield',hq,110,230);
    for(const b of afs){if(!b.built||b.queue.length>=1)continue;const planes=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].air).length;if(planes>=4+ep)continue;
      const cand=Object.keys(UNITS).filter(u=>UNITS[u].from==='airfield'&&(!UNITS[u].nation||UNITS[u].nation===G.nation[1])&&afford(1,UNITS[u].cost));if(cand.length)enqueue(b,cand[(Math.random()*cand.length)|0],1)}}
  for(const b of blds)if(b.built&&!b.spec&&BSPEC[b.type]){let k;if(b.type==='tower')k=Math.hypot(b.x-hq.x,b.y-hq.y)>330?'obs':'def';else if(b.type==='hq')k=(ai.style==='eco'||ai.style==='boom')?'eco':'mil';else{const ks=Object.keys(BSPEC[b.type]);k=ks[b.id%2]}if(buildSpec(1,b.id,k)||(k==='obs'&&G.epoch[1]<4&&buildSpec(1,b.id,'def')))break}
  // Sanitäter laufen hinter der Armee her
  if(healers.length&&army.length){const c=army.reduce((p,m)=>({x:p.x+m.x/army.length,y:p.y+m.y/army.length}),{x:0,y:0});for(const h of healers){if(h.state==='idle'||h.state==='move'){const d=Math.hypot(h.x-c.x,h.y-c.y);if(d>110&&(!h.dest||Math.hypot(h.dest.x-c.x,h.dest.y-c.y)>90)){h.state='move';h.dest={x:c.x-(c.x-hq.x)*.08,y:c.y};h.pf=null}}}}
  // Kampfrausch, sobald eine größere Gruppe im Gefecht ist
  {const fighting=army.filter(m=>m.state==='attack');if(fighting.length>=5&&G.t>(ai.rageT||0)){ai.rageT=G.t+30;useRage(1,fighting.map(m=>m.id))}}
  // Verteidigung
  const threats=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&blds.some(b=>dist(e,b)<ST.def));
  if(threats.length){for(const m of army){if(m.state==='attack'||dist(m,hq)>750)continue;let t=null,td=1e9;for(const th of threats){const d=dist(m,th);if(d<td){td=d;t=th}}m.state='attack';m.tid=t.id}}
  else{
    // Angriff: erst wenn der Gegner gefunden ist, sonst wird gesucht
    const seenB=[...ai.seen.values()].map(s=>get(s.id)).filter(e=>e&&e.kind==='bld');
    const tgt=seenB.find(e=>e.type==='hq')||seenB.sort((a,b)=>dist(a,hq)-dist(b,hq))[0];
    if(!ai.attack&&G.t>=ai.next&&army.length>=Math.min(ai.wave,armyCap-1)){ai.attack=true;ai.wave+=1.5;if(typeof SND!=='undefined')SND.play('horn')}
    if(ai.attack){
      if(army.length<Math.max(3,ai.wave*.35)){ai.attack=false;ai.next=G.t+70;const a=Math.atan2(H/2-hq.y,W/2-hq.x);for(const m of army){m.state='amove';m.amove={x:hq.x+Math.cos(a)*170,y:hq.y+Math.sin(a)*170}}}
      else{
        let pt=tgt;
        if(!pt){if(!ai.exPt||ai.ex[ai.exPt.i]){const c=army.reduce((s,m)=>({x:s.x+m.x/army.length,y:s.y+m.y/army.length}),{x:0,y:0});ai.exPt=pickExplore({x:c.x,y:c.y,team:1,type:'club'})}pt=ai.exPt}
        if(pt)for(const m of army){if(m.state==='attack')continue;if(m.state==='idle'||!m.amove||Math.hypot(m.amove.x-pt.x,m.amove.y-pt.y)>200){m.amove={x:pt.x+(Math.random()-.5)*80,y:pt.y+(Math.random()-.5)*80};m.state='amove'}}
      }
    }
  }
}

