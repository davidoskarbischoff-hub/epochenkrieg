/* Epochenkrieg – Gegner-KI (aiTick).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- AI ---------- */
function findSpot(team,cx,cy,r,minD,maxD){for(let k=0;k<80;k++){const a=Math.random()*6.283,d=minD+Math.random()*(maxD-minD);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d;if(validSpot(x,y,r))return{x,y}}return null}
function aiPlace(type,hq,minD,maxD){const d=BLDS[type];if(!afford(1,d.cost))return null;const s=findSpot(1,hq.x,hq.y,d.r,minD,maxD);if(!s)return null;pay(1,d.cost);return addBld(type,1,s.x,s.y,false)}
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
  const ai=G.ai,r=G.res[1],ep=G.epoch[1];
  const mine=G.ents.filter(e=>!e.dead&&e.team===1);
  const hq=mine.find(e=>e.type==='hq');if(!hq)return;
  const workers=mine.filter(e=>e.type==='worker'),blds=mine.filter(e=>e.kind==='bld');
  const army=mine.filter(e=>e.kind==='unit'&&!UNITS[e.type].passive&&!UNITS[e.type].naval),boats=mine.filter(e=>e.type==='boat'),ships=mine.filter(e=>e.kind==='unit'&&UNITS[e.type].naval&&UNITS[e.type].ranged),scouts=mine.filter(e=>e.type==='scout');
  const unbuilt=blds.filter(b=>!b.built);
  aiLook(mine);
  const targetW=[10,15,19,22,25][ep];
  const saving=ep<EPOCHS.length-1&&!G.adv[1]&&workers.length>=targetW-2;
  const adv=ep<EPOCHS.length-1?EPOCHS[ep].cost:null;
  if(workers.length+hq.queue.filter(q=>q.type==='worker').length<targetW&&hq.queue.length<2&&!(saving&&r.food<adv.food+50))enqueue(hq,'worker',1);
  // Späher: einer erkundet die Karte
  if(G.t>60&&r.food>=130&&!scouts.length&&!hq.queue.some(q=>q.type==='scout')&&hq.queue.length<2&&G.pop[1]<G.cap[1])enqueue(hq,'scout',1);
  for(const sc of scouts)if(sc.state==='idle')sc.state='explore';
  // Sammeln verteilen
  const w8=[{food:.6,wood:.4,stone:0,iron:0},{food:.4,wood:.32,stone:.28,iron:0},{food:.4,wood:.24,stone:.16,iron:.2},{food:.36,wood:.22,stone:.18,iron:.24},{food:.34,wood:.2,stone:.18,iron:.28}][ep];
  const cnt={food:0,wood:0,stone:0,iron:0};workers.forEach(w=>{if(w.state!=='idle'&&w.rtype)cnt[w.rtype]++});
  for(const w of workers){if(w.state!=='idle')continue;
    const n=workers.length;const order=RES.filter(rt=>canGather(w,rt)).sort((a,b)=>(w8[b]*n-cnt[b])-(w8[a]*n-cnt[a]));
    for(const rt of order){const node=nearestNode(rt,hq.x,hq.y,900,w,true)||nearestNode(rt,hq.x,hq.y,900,w);if(node){w.state='gather';w.tid=node.id;w.rtype=rt;cnt[rt]++;break}}}
  // Bauarbeiter
  for(const b of unbuilt){const busy=workers.some(w=>w.state==='build'&&w.tid===b.id);if(!busy){let bw=null,bd=1e9;for(const w of workers){if(w.state==='build')continue;const d=dist(w,b);if(d<bd){bd=d;bw=w}}if(bw){bw.state='build';bw.tid=b.id}}}
  // Gebäude
  if(G.cap[1]-G.pop[1]<=3&&G.cap[1]<POPMAX&&!unbuilt.some(b=>b.type==='house'))aiPlace('house',hq,90,200);
  const nBar=blds.filter(b=>b.type==='barracks').length,wantBar=ep>=2&&diff!=='leicht'?2:1;
  if(nBar<wantBar&&workers.length>=6&&!unbuilt.some(b=>b.type==='barracks')){const b=aiPlace('barracks',hq,110,210);if(b){const a=Math.atan2(H/2-hq.y,W/2-hq.x);b.rally={x:hq.x+Math.cos(a)*170,y:hq.y+Math.sin(a)*170}}}
  if(diff!=='leicht'&&!saving&&!blds.some(b=>b.type==='tower')&&(ep>=1||(G.t>170&&workers.length>=10)))aiPlace('tower',hq,70,140);
  // Expansion: weitere Türme Richtung Kartenmitte erobern Land
  const nTow=blds.filter(b=>b.type==='tower').length;
  if(ep>=1&&diff!=='leicht'&&!saving&&nTow<Math.min(4,1+ep)&&G.t>ai.towT&&!unbuilt.some(b=>b.type==='tower')&&afford(1,BLDS.tower.cost)&&aiPlaceToward('tower',hq,190,320))ai.towT=G.t+75;
  if(saving&&afford(1,adv))advance(1);
  // Marine: Hafen, Fischerboote, Kriegsschiffe
  if(diff!=='leicht'){
    const harbor=blds.find(b=>b.type==='harbor'&&b.built);
    if(!blds.some(b=>b.type==='harbor')&&workers.length>=8&&G.t>100&&r.wood>=BLDS.harbor.cost.wood+120)aiPlaceHarbor(hq);
    if(harbor){
      if(boats.length+harbor.queue.filter(q=>q.type==='boat').length<2&&harbor.queue.length<2)enqueue(harbor,'boat',1);
      const wantShips=ep>=1&&!saving?Math.min(5,1+ep):0;
      if(ships.length+harbor.queue.filter(q=>UNITS[q.type].ranged).length<wantShips&&harbor.queue.length<2){const t=ep>=3&&G.tech[1].has('galleonbuild')&&Math.random()<.6?'galleon':'warship';enqueue(harbor,t,1)}
      for(const bt of boats)if(bt.state==='idle'){const n=nearestNode('food',harbor.x,harbor.y,1500,bt,true)||nearestNode('food',harbor.x,harbor.y,1500,bt);if(n){bt.state='gather';bt.tid=n.id;bt.rtype='food'}}
      // Flotte greift an
      if(ships.length>=2&&G.t>=ai.shipNext){const seenHq=[...ai.seen.values()].find(s=>{const e=get(s.id);return e&&e.type==='hq'});const t=seenHq||{x:W-hq.x,y:H-hq.y};const w=aiWaterTarget(t.x,t.y);if(w){for(const sh of ships){sh.state='amove';sh.amove={x:w.x+(Math.random()-.5)*60,y:w.y+(Math.random()-.5)*60}}}ai.shipNext=G.t+110}
    }
  }
  // Armee
  const types=[['club'],['spear','archer','spear'],['sword','archer','sword','spear'],['knight','crossbow','sword','catapult','knight'],['musket','cannon','knight','musket','crossbow']][ep];
  for(const b of blds){if(b.type!=='barracks'||!b.built||b.queue.length>=2)continue;
    if(saving&&!(r.food>adv.food+90&&r.wood>(adv.wood||0)+90))continue;
    enqueue(b,types[(G.stats.trained[1]+b.id)%types.length],1)}
  // Verteidigung
  const threats=G.ents.filter(e=>!e.dead&&e.team===0&&e.kind==='unit'&&blds.some(b=>dist(e,b)<260));
  if(threats.length){for(const m of army){if(m.state==='attack'||dist(m,hq)>750)continue;let t=null,td=1e9;for(const th of threats){const d=dist(m,th);if(d<td){td=d;t=th}}m.state='attack';m.tid=t.id}}
  else{
    // Angriff: erst wenn der Gegner gefunden ist, sonst wird gesucht
    const seenB=[...ai.seen.values()].map(s=>get(s.id)).filter(e=>e&&e.kind==='bld');
    const tgt=seenB.find(e=>e.type==='hq')||seenB.sort((a,b)=>dist(a,hq)-dist(b,hq))[0];
    if(!ai.attack&&G.t>=ai.next&&army.length>=ai.wave){ai.attack=true;ai.wave+=2}
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

