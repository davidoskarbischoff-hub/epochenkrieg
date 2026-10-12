/* Epochenkrieg – Mehrspieler im Spiel: Spielstand senden/empfangen, Befehle des Gastes.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- Mehrspieler ----------
   Der Gastgeber (host) rechnet das ganze Spiel. Der Gast (client) bekommt 10-mal pro Sekunde den Spielstand (aus SEINER Sicht: er ist immer Team 0 = blau,
   der Gegner rot) und schickt seine Befehle zurück. Zum Ausführen der Gast-Befehle werden kurz die Teams vertauscht (flipTeams), dann läuft derselbe
   Code wie im Einzelspiel. */
function flipTeams(){
  for(const e of G.ents)if(e.team>=0)e.team=1-e.team;
  for(const k of ['res','epoch','adv','tech','rs','tfx','pop','cap','jobs','nation','nfx','sfx']){const a=G[k];if(a)[a[0],a[1]]=[a[1],a[0]]}
  const st=G.stats;[st.lost[0],st.lost[1]]=[st.lost[1],st.lost[0]];[st.trained[0],st.trained[1]]=[st.trained[1],st.trained[0]];
  for(const js of G.jobs)for(const j of js)j.team=1-j.team;
  if(G.over)G.over=G.over==='win'?'lose':'win'}
const r1=v=>Math.round(v*10)/10;
function encodeSnap(){
  const U=[],B=[],N=[],A=[],rel=v=>v&&G.t-v<1?r1(G.t-v):-1;
  for(const e of G.ents){if(e.dead)continue;
    if(e.kind==='unit')U.push({i:e.id,ty:e.type,m:e.team,x:r1(e.x),y:r1(e.y),a:Math.round(e.fa*100)/100,h:Math.round(e.hp),H:e.maxHp,l:e.lvl,s:e.state,c:r1(e.carry||0),ct:e.ctype||0,rt:e.rtype||0,td:e.tid||0,sw:rel(e.swing),ga:rel(e.gat),mv:rel(e.mvT),u:e.upj?1:0,cd:r1(e.cd||0),q:e.team===0&&e.q&&e.q.length?e.q:0,lp:e.loop?1:0,gr:e.gar||0,im:e.inm||0});
    else if(e.kind==='bld')B.push({i:e.id,ty:e.type,m:e.team,x:r1(e.x),y:r1(e.y),h:Math.round(e.hp),H:e.maxHp,l:e.lvl,b:e.built?1:0,p:Math.round(e.prog*1000)/1000,an:e.ang||0,sp:e.spec||0,em:e.empty||0,or:e.ore||0,pc:e.pc||0,u:e.upj?1:0,qu:e.team===0?e.queue.map(q=>({type:q.type,tech:q.tech,t:r1(q.t),blocked:q.blocked?1:0})):0,r:e.team===0&&e.rally?e.rally:0});
    else if(e.kind==='animal')A.push({i:e.id,ty:e.type,x:r1(e.x),y:r1(e.y),a:Math.round(e.fa*100)/100,h:Math.round(e.hp),s:e.state,sw:rel(e.swing),mv:rel(e.mvT)});
    else if(e.kind==='node'&&(e.amount<e.maxAmt-.5||e.snapLow)){N.push([e.id,Math.round(e.amount)]);e.snapLow=e.amount<e.maxAmt-.5}}
  return{t:r1(G.t),over:G.over,res:G.res.map(r=>({food:Math.floor(r.food),wood:Math.floor(r.wood),stone:Math.floor(r.stone),iron:Math.floor(r.iron),gold:Math.floor(r.gold||0),oil:Math.floor(r.oil||0)})),epoch:G.epoch.slice(),nat:G.nation.slice(),
    adv:G.adv.map(a=>a?{t:r1(a.t),time:a.time}:null),tech:G.tech.map(t=>[...t]),rs:G.rs.map(a=>a.map(r=>({id:r.id,t:r1(r.t),time:r.time}))),
    jobs:G.jobs.map(a=>a.map(j=>({label:j.label,t:r1(j.t),time:j.time,to:j.to,n:j.n,team:j.team}))),stats:{lost:G.stats.lost.slice(),trained:G.stats.trained.slice()},
    U,B,N,A,bn:G.bones||[],P:G.proj.map(p=>[Math.round(p.x),Math.round(p.y),Math.round(p.a*100)/100,p.big?1:0,p.gun?1:0])}}
/* Nur Geändertes senden: Einheiten/Gebäude/Tiere, die sich seit dem letzten Stand nicht verändert haben, entfallen (alle 3 s ein voller Stand zum Abgleich). Sendetakt passt sich der Datenmenge an. */
function sendSnap(){if(!NET.send)return;flipTeams();let snap;try{snap=encodeSnap()}finally{flipTeams()}snap.ev=G.ev;G.ev=[];
  const full=!NET.prev||G.t-(NET.fullT||0)>3,cur=new Map();let len=700;
  const pobj=NET.pobj||new Map(),nobj=new Map();
  for(const k of['U','B','A'])snap[k]=snap[k].map(r=>{const s=k+JSON.stringify(r);cur.set(r.i,s);nobj.set(r.i,r);if(!full&&NET.prev.get(r.i)===s)return null;
    const o=pobj.get(r.i);let out=r;
    if(!full&&o){const d={i:r.i,_d:1};let n=0;for(const key in r){if(key!=='i'&&JSON.stringify(r[key])!==JSON.stringify(o[key])){d[key]=r[key];n++}}if(n<Object.keys(r).length-3)out=d}
    len+=JSON.stringify(out).length;return out}).filter(Boolean);
  NET.pobj=nobj;
  snap.d=full?0:1;if(full)NET.fullT=G.t;else snap.X=[...NET.prev.keys()].filter(id=>!cur.has(id));NET.prev=cur;
  snap.hs=[Math.round(len/102.4)/10,NetLog.S.hostStepMs==null?null:Math.round(NetLog.S.hostStepMs*10)/10,NetLog.S.hostFps==null?null:Math.round(NetLog.S.hostFps)];NetLog.onSnap(len/1024);
  NET.interval=Math.min(.4,Math.max(.1,len/150000+(NET.backlog>65536?.1:0)));
  NET.send({t:'snap',s:snap})}
/* Teil-Datensatz (_d:1) mit dem zuletzt bekannten Datensatz der Entität zusammenführen */
function mergeRec(e,r){if(r._d&&e&&e._rec){r=Object.assign({},e._rec,r);delete r._d}return r}
function removeEnt(e){if(e.dead)return;e.dead=true;if((e.kind==='bld'&&!BLDS[e.type].passable)||(e.kind==='node'&&!e.sea&&e.type!=='field'))navStamp(e,-1);sel.delete(e.id)}
function applySnap(s){
  if(!G||!NET.client)return;
  NET.lastSnap=performance.now();if(s.hs){NetLog.onSnap(s.hs[0]);NetLog.S.hostStepMs=s.hs[1];NetLog.S.hostFps=s.hs[2]}
  G.t=s.t;G.over=s.over;G.res=s.res;G.epoch=s.epoch;if(s.nat){G.nation=s.nat;G.nfx=s.nat.map(nationFx)}G.adv=s.adv;G.tech=s.tech.map(a=>new Set(a));G.tfx=G.tech.map(techFx);G.rs=s.rs;
  G.jobs=s.jobs.map(a=>a.map(j=>({...j,ids:[],done:false})));G.stats=s.stats;G.bones=s.bn||[];
  const seen=new Set();
  for(let r of s.U){seen.add(r.i);let e0=G.byId.get(r.i);r=mergeRec(e0,r);if(r._d)continue;let e=e0;if(!e||e.dead){e=addUnit(r.ty,r.m,r.x,r.y,r.i)}
    e._rec=r;e.team=r.m;e.tx=r.x;e.ty=r.y;e.fa=r.a;e.hp=r.h;e.maxHp=r.H;e.lvl=r.l;e.state=r.s;e.carry=r.c;e.ctype=r.ct||null;e.rtype=r.rt||null;e.tid=r.td||null;
    e.swing=r.sw>=0?G.t-r.sw:undefined;e.gat=r.ga>=0?G.t-r.ga:undefined;e.mvT=r.mv>=0?G.t-r.mv:undefined;e.upj=r.u?{}:null;e.cd=r.cd;e.gar=r.gr||undefined;e.inm=r.im||undefined;e.q=r.q||[];e.loop=r.lp?[{}]:null}
  for(let r of s.B){seen.add(r.i);let e0=G.byId.get(r.i);r=mergeRec(e0,r);if(r._d)continue;let e=e0;if(!e||e.dead){e=addBld(r.ty,r.m,r.x,r.y,!!r.b,r.i)}
    e._rec=r;e.team=r.m;e.x=r.x;e.y=r.y;e.hp=r.h;e.maxHp=r.H;e.lvl=r.l;e.built=!!r.b;e.prog=r.p;e.ang=r.an;e.spec=r.sp||undefined;e.empty=r.em||0;e.ore=r.or||undefined;e.pc=r.pc||undefined;e.upj=r.u?{}:null;e.queue=r.qu||[];e.rally=r.r||null}
  for(let r of s.A||[]){seen.add(r.i);let e0=G.byId.get(r.i);r=mergeRec(e0,r);if(r._d)continue;let e=e0;if(!e||e.dead)e=addAnimal(r.ty,r.x,r.y,r.i);e._rec=r;e.tx=r.x;e.ty=r.y;e.fa=r.a;e.hp=r.h;e.state=r.s;e.swing=r.sw>=0?G.t-r.sw:undefined;e.mvT=r.mv>=0?G.t-r.mv:undefined}
  if(s.d){for(const id of s.X||[]){const e=G.byId.get(id);if(e&&!e.dead)removeEnt(e)}}
  else for(const e of G.ents)if(!e.dead&&(e.kind==='unit'||e.kind==='bld'||e.kind==='animal')&&!seen.has(e.id))removeEnt(e);
  for(const [id,amt] of s.N){const n=G.byId.get(id);if(n&&!n.dead){n.amount=amt;if(amt<=.5&&!n.regen)removeEnt(n)}}
  G.proj=s.P.map(([x,y,a,big,gun])=>({x,y,a,big:!!big,gun:!!gun,dead:false}));
  for(const ev of s.ev||[]){
    if(ev.t==='s')sfx(ev.n,{x:ev.x,y:ev.y,team:0,kind:'x'});
    else if(ev.t==='alert'&&G.t-G.alertT>12){G.alertT=G.t;G.ping={x:ev.x,y:ev.y,t:G.t};toast(tr('Deine Siedlung wird angegriffen!'),'warn');sfx('alert')}}
  panelSig=panelSig;if(sel.size)infoCache=infoCache}
function clientStep(dt){
  G.t+=dt;const k=Math.min(1,dt*14);
  for(const e of G.ents){if(e.dead)continue;if(e.tx!==undefined){e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k}}
  for(const p of G.proj){p.x+=Math.cos(p.a)*380*dt;p.y+=Math.sin(p.a)*380*dt}
  G.ents=G.ents.filter(e=>{if(e.dead){G.byId.delete(e.id);return false}return true});
  recount();fogT+=dt;if(fogT>=.2){fogT=0;fogUpdate()}G.fx=G.fx.filter(f=>G.t-f.t<.7)}
/* Befehl des Gastes ausführen (Gastgeber): Teams kurz vertauschen, damit der Gast "Team 0" ist */
function execRemote(m){
  if(!NET.host||!G||!G.running||G.over||!m)return;
  const saveSel=[...sel],savePl=placing,saveWA=wallAng,msgs=[];
  flipTeams();sel.clear();(m.ids||[]).forEach(id=>sel.add(id));NET.cap=msgs;NET.trust=true;
  try{
    switch(m.c){
      case'cmd':NET.tgtSet=true;NET.tgt=m.tid?get(m.tid):null;command(m.x,m.y,!!m.append);break;
      case'amove':attackMove(m.x,m.y,!!m.append);break;
      case'rage':useRage(0,(m.ids||[]).slice(0,80));break;
      case'trade':if(RES.includes(m.rt)&&m.rt!=='gold')trade(0,m.rt,m.dir==='buy'?'buy':'sell');break;
      case'place':placing=m.type;wallAng=typeof m.ang==='number'?m.ang:null;if(BLDS[m.type]&&BLDS[m.type].ep<=G.epoch[0])tryPlace(m.x,m.y,!!m.keep);break;
      /* Mauerlinie des Gastes: Endpunkte sind bei ihm schon eingerastet, jedes Stück wird hier noch einmal geprüft und bezahlt */
      case'wline':if([m.x0,m.y0,m.x1,m.y1].every(Number.isFinite)&&BLDS.wall.ep<=G.epoch[0]){placing='wall';placeWallLine(m.x0,m.y0,m.x1,m.y1,true,!!m.app)}break;
      case'train':{const b=get(m.b);if(b&&b.team===0&&b.built&&UNITS[m.type]&&UNITS[m.type].from===b.type)enqueue(b,m.type,0);break}
      case'adv':advance(0,m.nation);break;
      case'upg':startUpgrade(0,m.key);break;
      case'unmine':mineRelease(0,m.id);break;
      case'demo':demolish(0,m.id);break;
      case'tspec':towerSpec(0,m.id,m.kind);break;
      case'tech':startResearch(0,m.id);break;
      case'cq':{const b=get(m.b);if(b&&b.team===0)cancelQueue(b,m.i);break}
      case'halt':ownSel().forEach(u=>{if(u.kind==='unit'){u.state='idle';u.amove=null;u.q=[];u.loop=null}});break;
      case'explore':doExplore();break;
      case'loop':toggleLoopSel();break;
      case'clr':clearChainSel();break}
  }catch(err){console.error('Fehler bei Fernbefehl',err)}
  finally{NET.cap=null;NET.tgtSet=false;NET.tgt=null;NET.trust=false;placing=savePl;wallAng=saveWA;flipTeams();sel.clear();saveSel.forEach(id=>sel.add(id));panelSig='';infoCache=''}
  if(msgs.length&&NET.send)NET.send({t:'msgs',list:msgs.slice(0,4)})}
function startMP(o){
  NetLog.saverReset();
  NET.prev=null;NET.interval=.1;NET.mp=true;NET.host=o.role==='host';NET.client=o.role==='client';NET.send=o.send;NET.acc=0;NET.lastSnap=performance.now();
  const flip=NET.host?o.side==='B':o.side!=='B';
  const cf=o.cfg||{};if(cf.colH&&cf.colG){NET.host?setTeamColors(cf.colH,cf.colG):setTeamColors(cf.colG,cf.colH)}
  newGame('normal',false,{map:o.map,seed:o.seed,flip,mp:true,size:cf.size,speed:cf.speed});$('speedBtn').textContent=tr('Tempo {0}×',G.speed);
  G.running=true;G.started=true;$('overlay').hidden=true;$('menu').hidden=true;menuOpen=false;
  toast(tr(NET.host?'Mehrspieler: Du bist der Gastgeber.':'Mehrspieler: Du bist der Gast.'));updateUI()}
function endMP(){NetLog.saverReset();NET.mp=false;NET.host=false;NET.client=false;NET.send=null}
function peerLeft(){if(!G||!NET.mp||G.over)return;if(G.running){G.over='win';G.leftMsg=true}}
