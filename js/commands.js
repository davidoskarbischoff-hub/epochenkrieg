/* Epochenkrieg – Spielerbefehle: Auswahl, Befehle, Befehlsketten.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- player commands ---------- */
function selection(){const a=[];for(const id of sel){const e=G.byId.get(id);if(e&&!e.dead)a.push(e)}return a}
function ownSel(){return selection().filter(e=>e.team===0)}
/* Was liegt an dieser Stelle? sp = Bildschirmpunkt (Maus): trifft die sichtbare Figur samt Höhe; ohne sp zählt nur der Bodenpunkt (x,y). */
function entityAt(x,y,sp){
  let best=null,bd=1e9;
  for(const e of G.ents){if(e.dead||!shown(e))continue;let sc;
    if(sp){const b=scr(e.x,e.y,0);if(!b.front)continue;const k=R3.k,hp=entH(e)*k,u=e.kind==='unit'||e.kind==='animal',hw=Math.max(7,e.r*k*(e.kind==='node'?.8:1.1))+(u?3:1);
      const onBody=Math.abs(sp.x-b.x)<=hw&&sp.y<=b.y+e.r*k*.4+3&&sp.y>=b.y-hp;if(!onBody&&Math.hypot(sp.x-b.x,(sp.y-b.y)*1.5)>e.r*k+4)continue;
      sc=(u?0:e.kind==='bld'?1000:2000)-b.y*.01+Math.hypot(sp.x-b.x,sp.y-(b.y-hp*.4))*.05}
    else{const d=Math.hypot(e.x-x,e.y-y),u=e.kind==='unit'||e.kind==='animal';if(d>e.r+(u?5:2))continue;sc=(u?0:e.kind==='bld'?1000:2000)+d}
    if(sc<bd){bd=sc;best=e}}
  return best;
}
function fxMark(x,y,kind){G.fx.push({x,y,t:G.t,kind,rt:performance.now()})}
function doExplore(){let n=0;ownSel().forEach(u=>{if(u.type==='scout'){u.state='explore';u.q=[];u.ex=null;n++}});if(n){sfx('order');toast(tr('Späher erkunden automatisch.'))}}
function toggleLoopSel(){let n=0,tog=0;ownSel().forEach(u=>{if(u.kind!=='unit')return;if(u.loop){u.loop=null;tog=-1;return}
    const cur=u.state==='move'&&u.dest?{t:'move',x:u.dest.x,y:u.dest.y}:u.state==='amove'&&u.amove?{t:'amove',x:u.amove.x,y:u.amove.y}:null;
    const list=[...(cur?[cur]:[]),...(u.q||[]).filter(o=>o.t==='move'||o.t==='amove')];if(list.length>=2){u.loop=list.map(o=>({...o}));n++;tog=1}});
  if(tog===1)toast(tr('Befehlskette wird wiederholt (Patrouille). Taste L beendet sie.'));else if(tog===-1)toast(tr('Schleife beendet.'));else toast(tr('Dafür braucht es mindestens zwei Wegpunkte (Umschalt + Rechtsklick).'))}
function clearChainSel(){let n=0;ownSel().forEach(u=>{if(u.kind==='unit'&&((u.q&&u.q.length)||u.loop)){u.q=[];u.loop=null;n++}});if(n)toast(tr('Befehlskette gelöscht.'));return n>0}
/* ---------- Befehlsketten: Umschalt + Befehl hängt den Auftrag hinten an ---------- */
function applyOrder(u,o){u.pf=null;if(u.inm&&o.t!=='mine')mineOut(u);if(u.gar&&o.t!=='garrison'){u.gar=null;u.y+=14}
  switch(o.t){
    case'move':u.state='move';u.dest={x:o.x,y:o.y};u.amove=null;break;
    case'amove':u.state='amove';u.amove={x:o.x,y:o.y};break;
    case'gather':u.state='gather';u.tid=o.tid;u.rtype=o.rt;u.amove=null;break;
    case'build':u.state='build';u.tid=o.tid;u.rep=!!o.rep;u.prev=null;break;
    case'attack':u.state='attack';u.tid=o.tid;u.amove=null;break;
    case'garrison':u.state='garrison';u.tid=o.tid;u.amove=null;break;
    case'mine':u.state='mine';u.tid=o.tid;u.amove=null;break;
    case'return':u.state='return';break}}
function orderValid(o){if(o.t==='build'){const b=get(o.tid);return !!b&&(!b.built||(o.rep&&b.hp<b.maxHp-1))}if(o.t==='gather'||o.t==='attack'||o.t==='garrison')return !!get(o.tid);return true}
function giveOrder(u,o,append){
  if(u.team===0)u.manual=true;
  if(!append)u.loop=null;
  if(!append||(u.state==='idle'&&!(u.q&&u.q.length))){u.q=[];applyOrder(u,o);return}
  (u.q||(u.q=[])).push(o)}
function nextOrder(u){while(u.q&&u.q.length){const o=u.q.shift();if(orderValid(o)){applyOrder(u,o);return true}}return false}
const ordPos=o=>{if(o.x!==undefined)return{x:o.x,y:o.y};const e=o.tid?get(o.tid):null;return e?{x:e.x,y:e.y}:null};
/* Sammelbefehl auf ein Vorkommen: jeder Arbeiter bekommt ein eigenes (erst eines pro Baum/Busch, dann zwei), die nächsten zur Klickstelle.
   Im dichten Wald kommen nur die Randbäume in Frage (nodeOpen); liegt im Umkreis keiner, wird weiter gesucht. */
function spreadGather(units,t){
  const pick=rad=>G.solids.filter(n=>n.kind==='node'&&!n.dead&&n.rt===t.rt&&!!n.sea===!!t.sea&&Math.hypot(n.x-t.x,n.y-t.y)<rad&&!(MINE_RT[n.rt]&&!minedBy(0,n))&&!(n.regen&&n.amount<30)&&nodeOpen(n));
  let same=pick(260);if(!same.length&&!nodeOpen(t))same=pick(700);
  same.sort((a,b)=>Math.hypot(a.x-t.x,a.y-t.y)-Math.hypot(b.x-t.x,b.y-t.y));
  const cnt={},out=new Map();
  for(const lim of[1,2,3,99])for(const u of units){if(out.has(u.id))continue;let best=null,bd=1e9;
    for(const n of same){const c=(G.load[n.id]||0)+(cnt[n.id]||0);if(c>=Math.min(lim,NODES[n.type].cap))continue;const d=Math.hypot(n.x-u.x,n.y-u.y)+c*60;if(d<bd){bd=d;best=n}}
    if(best){out.set(u.id,best);cnt[best.id]=(cnt[best.id]||0)+1}}
  return out}
function command(wx,wy,append,sp){
  const s=ownSel();if(!s.length)return;
  const t=NET.tgtSet?NET.tgt:entityAt(wx,wy,sp);
  if(NET.client){NET.send({c:'cmd',ids:s.map(e=>e.id),x:wx,y:wy,tid:t?t.id:0,append:!!append});fxMark(wx,wy,t&&t.team===1?'attack':'move');return}
  if(s[0].kind==='bld'){const rn0=t&&t.kind==='node'?(nodeOpen(t)?t:(spreadGather([t],t).get(t.id)||t)):null; /* Sammelpunkt im Wald: nächster Randbaum */
    s.forEach(b=>{if(b.kind==='bld')b.rally={x:wx,y:wy,id:rn0?rn0.id:null,nodeType:rn0?rn0.rt:null}});fxMark(wx,wy,'rally');return}
  const units=s.filter(e=>e.kind==='unit');const csp=Math.max(11,Math.max(1,...units.map(u=>u.r))*2.6);const mv=units.filter(u=>!UNITS[u.type].gather&&!UNITS[u.type].naval),movers=new Map();if(!t&&mv.length>1){const sp3=formationSpots(mv,wx,wy,curForm);mv.forEach((u,k)=>movers.set(u.id,sp3[k]))}const spread=t&&t.kind==='node'?spreadGather(units.filter(u=>UNITS[u.type].gather&&!!t.sea===!!UNITS[u.type].naval),t):null;const cols=Math.ceil(Math.sqrt(units.length));let i=0;
  for(const u of units){
    if(t&&t.kind==='node'&&UNITS[u.type].gather&&!!t.sea===!!UNITS[u.type].naval&&!minedBy(0,t)){if(!u.mineMsg||G.t-u.mineMsg>4){u.mineMsg=G.t;toast(tr(MINE_RT[t.rt]==='derrick'?'Für {0} brauchst du einen fertigen Bohrturm in der Nähe.':'Für {0} brauchst du eine fertige Mine in der Nähe.',rn(t.rt)));sfx('error')}}
    else if(t&&t.kind==='node'&&UNITS[u.type].gather&&!!t.sea===!!UNITS[u.type].naval){const tg=(spread&&spread.get(u.id))||t;giveOrder(u,{t:'gather',tid:tg.id,rt:tg.rt},append)}
    else if(t&&(t.team===1||t.kind==='animal')&&u.type!=='scout'){giveOrder(u,{t:'attack',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&!t.built&&UNITS[u.type].builds){giveOrder(u,{t:'build',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&t.built&&(t.type==='wall'||t.type==='tower')&&UNITS[u.type].ranged&&!UNITS[u.type].siege&&!UNITS[u.type].air&&!UNITS[u.type].builds){giveOrder(u,{t:'garrison',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&t.built&&t.type==='mine'&&UNITS[u.type].builds&&t.hp>=t.maxHp-1){giveOrder(u,{t:'mine',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&t.built&&t.hp<t.maxHp-1&&UNITS[u.type].builds){giveOrder(u,{t:'build',tid:t.id,rep:true},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&BLDS[t.type].drop&&UNITS[u.type].gather&&u.carry>0&&(!UNITS[u.type].naval||t.type==='harbor')){giveOrder(u,{t:'return'},append)}
    else{const sp2=movers.get(u.id);const ox=sp2?sp2.x-wx:(i%cols-(cols-1)/2)*csp,oy=sp2?sp2.y-wy:(Math.floor(i/cols)-(cols-1)/2)*csp;giveOrder(u,{t:'move',x:wx+ox,y:wy+oy},append);i++}
  }
  fxMark(wx,wy,t&&t.team===1?'attack':'move');
}
/* Formationen: Linie, Keil, Kolonne, Karree, Kreis. Vorn stehen die Frontkämpfer, hinten Fernkämpfer, Belagerung und Sanitäter. */
let curForm=0;const FORMS=['Linie','Keil','Kolonne','Karree','Kreis'];
const FROLE={inf:0,spear:0,cav:1,rng:2,siege:3,med:3,wk:3};
function formationSpots(units,tx,ty,form){
  const n=units.length;if(n<2)return units.map(()=>({x:tx,y:ty}));
  let cx=0,cy=0;units.forEach(u=>{cx+=u.x;cy+=u.y});cx/=n;cy/=n;const th=Math.atan2(ty-cy,tx-cx),co=Math.cos(th),si=Math.sin(th),sp=Math.max(11,Math.max(...units.map(u=>u.r))*2.6),loc=[];
  if(form===0){const per=Math.min(10,Math.ceil(Math.sqrt(n*2.2)));for(let i=0;i<n;i++){const r=Math.floor(i/per),c=i%per,cnt=Math.min(per,n-r*per);loc.push([-r*sp,(c-(cnt-1)/2)*sp])}}
  else if(form===1){let r=0,k=0;while(loc.length<n){const w=2*r+1;for(let c=0;c<w&&loc.length<n;c++)loc.push([-r*sp,(c-(w-1)/2)*sp]);r++}}
  else if(form===2){for(let i=0;i<n;i++)loc.push([-Math.floor(i/2)*sp,(i%2?1:-1)*sp*.5])}
  else if(form===3){const side=Math.max(2,Math.ceil(n/4)+1),pts=[];for(let i=0;i<side;i++){pts.push([i,0]);pts.push([side-1,i]);pts.push([side-1-i,side-1]);pts.push([0,side-1-i])}const m=(side-1)/2;for(let i=0;i<n;i++){const p=pts[i%pts.length];loc.push([-(p[0]-m)*sp,(p[1]-m)*sp])}}
  else{const R=Math.max(26,n*5.2);for(let i=0;i<n;i++){const a=i/n*6.283;loc.push([Math.cos(a)*R*.8,Math.sin(a)*R])}}
  /* zuordnen: Frontkämpfer auf die vorderen Plätze */
  const order=units.map((u,i)=>i).sort((a,b)=>(FROLE[UNITS[units[a].type].cls]??1)-(FROLE[UNITS[units[b].type].cls]??1)),slots=loc.map((l,i)=>i).sort((a,b)=>loc[b][0]-loc[a][0]),res=[];
  order.forEach((ui,k)=>{const l=loc[slots[k]];res[ui]={x:tx+co*l[0]-si*l[1],y:ty+si*l[0]+co*l[1]}});return res}
function attackMove(wx,wy,append){
  if(NET.client){const us=ownSel().filter(e=>e.kind==='unit'&&!UNITS[e.type].passive);NET.send({c:'amove',ids:us.map(e=>e.id),x:wx,y:wy,append:!!append});armed=false;fxMark(wx,wy,'attack');return}
  const units=ownSel().filter(e=>e.kind==='unit'&&!UNITS[e.type].passive);const cols=Math.ceil(Math.sqrt(units.length));
  const spots=formationSpots(units,wx,wy,curForm);units.forEach((u,i)=>{giveOrder(u,{t:'amove',x:spots[i].x,y:spots[i].y},append)});
  armed=false;fxMark(wx,wy,'attack');
}
/* Markt: 100 Rohstoff gegen Gold verkaufen (dir='sell') oder 100 Rohstoff für Gold kaufen (dir='buy') */
function trade(team,rt,dir){const R=G.res[team],lot=TRADE.lot,g=Math.round(lot*TRADE.sell*(1+SF(team).trade)),c=Math.round(lot*TRADE.buy);
  if(!G.ents.some(b=>b.kind==='bld'&&b.type==='market'&&b.built&&!b.dead&&b.team===team))return false;
  if(dir==='sell'){if(R[rt]<lot)return false;R[rt]-=lot;R.gold=(R.gold||0)+g}else{if((R.gold||0)<c)return false;R.gold-=c;R[rt]+=lot}
  if(team===0)sfx('click');return true}
function startPlace(type){const d=BLDS[type];if(d.ep>G.epoch[0]){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error');return}if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');sfx('error');return}placing=type;armed=false}
/* Mauern/Tore rasten an Mauerenden und grossen Vorkommen ein und drehen sich in Zugrichtung */
let wallAng=null,lastPlaced=null;const WALLHALF=11.5;
function wallSnap(wx,wy){
  let best=null,bd=40;for(const w of G.ents){if(w.dead||w.kind!=='bld'||(w.type!=='wall'&&w.type!=='gate'))continue;const a=w.ang||0;for(const s of[-1,1]){const ex=w.x+Math.cos(a)*WALLHALF*s,ey=w.y+Math.sin(a)*WALLHALF*s,d=Math.hypot(ex-wx,ey-wy);if(d<bd){bd=d;best={x:ex,y:ey,a,s}}}}
  if(best){let a=wallAng!==null?wallAng:best.a;if(Math.abs(Math.atan2(Math.sin(a-best.a),Math.cos(a-best.a)))>.9)a=best.a;const k=(Math.cos(a)*(wx-best.x)+Math.sin(a)*(wy-best.y))>=0?1:-1;return{x:best.x+Math.cos(a)*WALLHALF*k,y:best.y+Math.sin(a)*WALLHALF*k,a:a}}
  let nb=null;bd=34;for(const n of G.ents){if(n.dead||n.kind!=='node'||n.sea||n.r<18)continue;const d=Math.hypot(n.x-wx,n.y-wy)-n.r;if(d<bd){bd=d;nb=n}}
  if(nb){const a=Math.atan2(wy-nb.y,wx-nb.x),dd=nb.r+BLDS.wall.r+1;return{x:nb.x+Math.cos(a)*dd,y:nb.y+Math.sin(a)*dd,a:wallAng!==null?wallAng:a+Math.PI/2}}
  return{x:wx,y:wy,a:wallAng!==null?wallAng:0}}
/* ---------- Mauer ziehen: Maustaste halten, ziehen, loslassen = durchgehende Mauer von A nach B ----------
   Endpunkt einrasten: an ein Mauerende (genau dort, damit die neue Mauer anschliesst) oder an den Rand eines grossen Vorkommens (Seite zum anderen Ende hin). */
const WALL_MAX=80;
function wallEnd(wx,wy,tx,ty){
  let best=null,bd=36;for(const w of G.ents){if(w.dead||w.kind!=='bld'||(w.type!=='wall'&&w.type!=='gate'))continue;const a=w.ang||0;for(const s of[-1,1]){const ex=w.x+Math.cos(a)*WALLHALF*s,ey=w.y+Math.sin(a)*WALLHALF*s,d=Math.hypot(ex-wx,ey-wy);if(d<bd){bd=d;best={x:ex,y:ey,snap:1}}}}
  if(best)return best;
  let nb=null;bd=26;for(const n of G.ents){if(n.dead||n.kind!=='node'||n.sea||n.r<18||!nodeKnown(n))continue;const d=Math.hypot(n.x-wx,n.y-wy)-n.r;if(d<bd){bd=d;nb=n}}
  if(nb){const far=Math.hypot(tx-nb.x,ty-nb.y)>nb.r+4,a=far?Math.atan2(ty-nb.y,tx-nb.x):Math.atan2(wy-nb.y,wx-nb.x),dd=nb.r+2;return{x:nb.x+Math.cos(a)*dd,y:nb.y+Math.sin(a)*dd,snap:2}}
  return{x:wx,y:wy,snap:0}}
/* Teilstücke entlang der Linie: das erste beginnt genau bei A, das letzte endet (so gut es geht) bei B; Abstand höchstens etwas mehr als ein Stück,
   damit sich die Stücke berühren bzw. leicht überlappen (keine Lücken). raw = Endpunkte nicht mehr einrasten (Mehrspieler: kommen schon eingerastet vom Gast). */
function wallLine(x0,y0,x1,y1,raw){
  const A=raw?{x:x0,y:y0,snap:0}:wallEnd(x0,y0,x1,y1),B=raw?{x:x1,y:y1,snap:0}:wallEnd(x1,y1,A.x,A.y);
  const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy),S=2*WALLHALF,segs=[];
  if(L<2)return{A,B,a:0,segs};
  const a=Math.atan2(dy,dx),ux=dx/L,uy=dy/L,n=Math.max(1,Math.min(WALL_MAX,Math.round(L/S)));
  if(n===1){const k=L>S?L/2:WALLHALF;segs.push({x:A.x+ux*k,y:A.y+uy*k})}
  else{const st=Math.max(S*.8,Math.min(S*1.06,(L-S)/(n-1)));for(let i=0;i<n;i++){const k=WALLHALF+i*st;segs.push({x:A.x+ux*k,y:A.y+uy*k})}}
  return{A,B,a,segs}}
/* Wer baut die Mauer? Ausgewählte Bauarbeiter, sonst bis zu 3 untätige Arbeiter in der Nähe des Anfangs */
function wallBuilders(x,y){
  const s=ownSel().filter(u=>u.kind==='unit'&&UNITS[u.type].builds&&!u.upj);if(s.length)return s;
  return G.ents.filter(u=>!u.dead&&u.team===0&&u.kind==='unit'&&UNITS[u.type].builds&&u.state==='idle'&&!u.upj&&Math.hypot(u.x-x,u.y-y)<400).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y)).slice(0,3)}
/* Mauerlinie setzen: freie Stücke der Reihe nach bezahlen und anlegen (blockierte werden ausgelassen, ohne Rohstoffe ist Schluss).
   Die Bauarbeiter teilen sich die Strecke: jeder beginnt an einer anderen Stelle und hilft danach bei den übrigen Stücken. */
function placeWallLine(x0,y0,x1,y1,raw,append){
  const d=BLDS.wall,Ln=wallLine(x0,y0,x1,y1,raw);if(!Ln.segs.length)return 0;
  if(NET.client){const ok=Ln.segs.filter(s=>!placeBlock('wall',s.x,s.y)).length;if(!ok){toast(tr('Hier ist kein Platz.'));sfx('error');return 0}if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return 0}
    NET.send({c:'wline',x0:Ln.A.x,y0:Ln.A.y,x1:Ln.B.x,y1:Ln.B.y,app:!!append,ids:ownSel().filter(u=>u.kind==='unit'&&UNITS[u.type].builds).map(u=>u.id)});sfx('click');if(!afford(0,d.cost))placing=null;return ok}
  const placed=[];let bad=0,poor=false;
  for(const s of Ln.segs){if(placeBlock('wall',s.x,s.y)){bad++;continue}if(!pay(0,d.cost)){poor=true;break}const b=addBld('wall',0,s.x,s.y,false);b.ang=Ln.a;placed.push(b)}
  if(!placed.length){if(poor)toast(missing(0,d.cost)+'.');else toast(tr('Hier ist kein Platz.'));sfx('error');if(!afford(0,d.cost))placing=null;return 0}
  lastPlaced=placed[placed.length-1];
  const us=wallBuilders(Ln.A.x,Ln.A.y),k=us.length,n=placed.length;
  us.forEach((u,j)=>{const off=Math.floor(j*n/k),app=append||u.state==='build'||!!(u.q&&u.q.some(o=>o.t==='build'));
    for(let i=0;i<n;i++)giveOrder(u,{t:'build',tid:placed[(off+i)%n].id},i>0||app)});
  if(poor)toast(missing(0,d.cost)+' – '+tr('{0} von {1} Mauerstücken gesetzt.',n,Ln.segs.length-bad),'warn');
  else if(bad)toast(tr('{0} Mauerstücke ausgelassen (kein Platz).',bad));
  sfx('click');
  if(!afford(0,d.cost))placing=null;
  return n}
function tryPlace(wx,wy,keep){
  let wa=null;if(placing==='wall'||placing==='gate'){const sn=wallSnap(wx,wy);wx=sn.x;wy=sn.y;wa=sn.a}
  const d=BLDS[placing],blk=placeBlock(placing,wx,wy);if(blk){toast(blk);sfx('error');return}
  if(NET.client){if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}NET.send({c:'place',type:placing,x:wx,y:wy,ang:wa,keep:!!keep,ids:ownSel().filter(u=>UNITS[u.type].builds).map(u=>u.id)});sfx('click');if(!keep)placing=null;return}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}
  const b=addBld(placing,0,wx,wy,false);if(wa!==null)b.ang=wa;lastPlaced=b;if(b.type==='harbor'){let best=0,bs=-1;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100])sc+=terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===0?2:terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===1?1:-2;if(sc>bs){bs=sc;best=a}}b.ang=best}
  ownSel().filter(u=>UNITS[u.type].builds).forEach(u=>giveOrder(u,{t:'build',tid:b.id},keep));
  if(!(keep&&afford(0,d.cost)))placing=null;
}
function cancelQueue(b,i){if(NET.client){NET.send({c:'cq',b:b.id,i});return}const q=b.queue[i];if(!q)return;if(q.tech){const c={};for(const r in TECH[q.tech].cost)c[r]=TECH[q.tech].cost[r]*(q.paid||0);refund(0,c)}else refund(0,UNITS[q.type].cost);b.queue.splice(i,1);panelSig=''}

