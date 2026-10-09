/* Epochenkrieg – Spielerbefehle: Auswahl, Befehle, Befehlsketten.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- player commands ---------- */
function selection(){const a=[];for(const id of sel){const e=G.byId.get(id);if(e&&!e.dead)a.push(e)}return a}
function ownSel(){return selection().filter(e=>e.team===0)}
function entityAt(x,y){
  let best=null,bd=1e9;
  for(const e of G.ents){if(e.dead||!shown(e))continue;const dx=Math.abs(e.x-x),d=Math.hypot(e.x-x,e.y-y);
    const h=SPR.height(e)/TILT,hw=e.r*(e.kind==='unit'?1.1:1.0)+(e.kind==='unit'?5:2);
    const onSprite=dx<=hw&&y<=e.y+3&&y>=e.y-h*(e.kind==='node'?.8:1);
    if(!onSprite&&d>e.r+(e.kind==='unit'?5:2))continue;
    const sc=(e.kind==='unit'?0:e.kind==='bld'?1000:2000)-e.y*.01+d*.1;if(sc<bd){bd=sc;best=e}}
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
function applyOrder(u,o){u.pf=null;
  switch(o.t){
    case'move':u.state='move';u.dest={x:o.x,y:o.y};u.amove=null;break;
    case'amove':u.state='amove';u.amove={x:o.x,y:o.y};break;
    case'gather':u.state='gather';u.tid=o.tid;u.rtype=o.rt;u.amove=null;break;
    case'build':u.state='build';u.tid=o.tid;break;
    case'attack':u.state='attack';u.tid=o.tid;u.amove=null;break;
    case'return':u.state='return';break}}
function orderValid(o){if(o.t==='build'){const b=get(o.tid);return !!b&&!b.built}if(o.t==='gather'||o.t==='attack')return !!get(o.tid);return true}
function giveOrder(u,o,append){
  if(!append)u.loop=null;
  if(!append||(u.state==='idle'&&!(u.q&&u.q.length))){u.q=[];applyOrder(u,o);return}
  (u.q||(u.q=[])).push(o)}
function nextOrder(u){while(u.q&&u.q.length){const o=u.q.shift();if(orderValid(o)){applyOrder(u,o);return true}}return false}
const ordPos=o=>{if(o.x!==undefined)return{x:o.x,y:o.y};const e=o.tid?get(o.tid):null;return e?{x:e.x,y:e.y}:null};
function command(wx,wy,append){
  const s=ownSel();if(!s.length)return;
  const t=NET.tgtSet?NET.tgt:entityAt(wx,wy);
  if(NET.client){NET.send({c:'cmd',ids:s.map(e=>e.id),x:wx,y:wy,tid:t?t.id:0,append:!!append});fxMark(wx,wy,t&&t.team===1?'attack':'move');return}
  if(s[0].kind==='bld'){s.forEach(b=>{if(b.kind==='bld')b.rally={x:wx,y:wy,id:t&&t.kind==='node'?t.id:null,nodeType:t&&t.kind==='node'?t.rt:null}});fxMark(wx,wy,'rally');return}
  const units=s.filter(e=>e.kind==='unit');const cols=Math.ceil(Math.sqrt(units.length));let i=0;
  for(const u of units){
    if(t&&t.kind==='node'&&UNITS[u.type].gather&&!!t.sea===!!UNITS[u.type].naval){giveOrder(u,{t:'gather',tid:t.id,rt:t.rt},append)}
    else if(t&&t.team===1){giveOrder(u,{t:'attack',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&!t.built&&u.type==='worker'){giveOrder(u,{t:'build',tid:t.id},append)}
    else if(t&&t.team===0&&t.kind==='bld'&&BLDS[t.type].drop&&UNITS[u.type].gather&&u.carry>0&&(!UNITS[u.type].naval||t.type==='harbor')){giveOrder(u,{t:'return'},append)}
    else{const ox=(i%cols-(cols-1)/2)*18,oy=(Math.floor(i/cols)-(cols-1)/2)*18;giveOrder(u,{t:'move',x:wx+ox,y:wy+oy},append);i++}
  }
  fxMark(wx,wy,t&&t.team===1?'attack':'move');
}
function attackMove(wx,wy,append){
  if(NET.client){const us=ownSel().filter(e=>e.kind==='unit'&&!UNITS[e.type].passive);NET.send({c:'amove',ids:us.map(e=>e.id),x:wx,y:wy,append:!!append});armed=false;fxMark(wx,wy,'attack');return}
  const units=ownSel().filter(e=>e.kind==='unit'&&!UNITS[e.type].passive);const cols=Math.ceil(Math.sqrt(units.length));
  units.forEach((u,i)=>{giveOrder(u,{t:'amove',x:wx+(i%cols-(cols-1)/2)*18,y:wy+(Math.floor(i/cols)-(cols-1)/2)*18},append)});
  armed=false;fxMark(wx,wy,'attack');
}
function startPlace(type){const d=BLDS[type];if(d.ep>G.epoch[0]){toast(tr('Erst ab der {0} verfügbar.',tr(EPOCHS[d.ep].name)));sfx('error');return}if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');sfx('error');return}placing=type;armed=false}
function tryPlace(wx,wy,keep){
  const d=BLDS[placing],blk=placeBlock(placing,wx,wy);if(blk){toast(blk);sfx('error');return}
  if(NET.client){if(!afford(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}NET.send({c:'place',type:placing,x:wx,y:wy,keep:!!keep,ids:ownSel().filter(u=>u.type==='worker').map(u=>u.id)});sfx('click');if(!keep)placing=null;return}
  if(!pay(0,d.cost)){toast(missing(0,d.cost)+'.');placing=null;return}
  const b=addBld(placing,0,wx,wy,false);if(b.type==='harbor'){let best=0,bs=-1;for(let k=0;k<24;k++){const a=k*.2618;let sc=0;for(const dd of[40,70,100])sc+=terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===0?2:terrAt(wx+Math.cos(a)*dd,wy+Math.sin(a)*dd)===1?1:-2;if(sc>bs){bs=sc;best=a}}b.ang=best}
  ownSel().filter(u=>u.type==='worker').forEach(u=>giveOrder(u,{t:'build',tid:b.id},keep));
  if(!(keep&&afford(0,d.cost)))placing=null;
}
function cancelQueue(b,i){if(NET.client){NET.send({c:'cq',b:b.id,i});return}const q=b.queue[i];if(!q)return;refund(0,UNITS[q.type].cost);b.queue.splice(i,1);panelSig=''}

