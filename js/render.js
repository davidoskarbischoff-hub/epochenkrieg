/* Epochenkrieg – Zeichnen: die 3D-Welt kommt aus render3d.js, hier liegen die 2D-Anzeigen darüber (Lebensbalken, Marker, Partikel) und die Minikarte.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- 2D-Anzeigen über der 3D-Welt ---------- */
/* Zeichnet fn am Bildschirmpunkt des Bodenpunkts (x,y); 1 Einheit = 1 Spielpixel (mit Zoom skaliert) */
function atGround(x,y,zpx,fn){const p=scr(x,y,zpx);if(!p.front)return;ctx.save();ctx.translate(p.x,p.y);const k=R3.k;ctx.scale(k,k);fn();ctx.restore()}
const lvlDots=(lvl)=>{const n=lvl+1;ctx.fillStyle=LVLC[lvl];ctx.strokeStyle='rgba(20,15,10,.8)';ctx.lineWidth=1;for(let i=0;i<n;i++){ctx.beginPath();ctx.arc((i-(n-1)/2)*5,0,2.1,0,6.283);ctx.fill();ctx.stroke()}};
function idleMark(){ctx.fillStyle='#d0432c';ctx.strokeStyle='#fff3ea';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,6.5,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff3ea';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',0,.5)}
function hpBar(e){const w=Math.max(18,e.r*2+4),f=Math.max(0,e.hp/e.maxHp);atGround(e.x,e.y,entH(e)+(e.kind==='bld'?10:8),()=>{ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(-w/2-1,-1,w+2,5);ctx.fillStyle=f>.5?'#8fbf63':f>.25?'#e0a24a':'#d0533c';ctx.fillRect(-w/2,0,w*f,3)})}
/* Fortschrittsbalken über einer Einheit oder einem Gebäude (Upgrade, Forschung) */
function progBar(e,frac,label,col){atGround(e.x,e.y,entH(e)+(e.kind==='bld'?34:24),()=>{const w=Math.max(40,e.r*2+8);ctx.fillStyle='rgba(20,15,10,.85)';ctx.fillRect(-w/2-1,-1,w+2,9);ctx.fillStyle=col;ctx.fillRect(-w/2,0,w*Math.min(1,frac),7);
  ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,15,10,.9)';ctx.strokeText(label,0,-2);ctx.fillStyle='#f3e2b3';ctx.fillText(label,0,-2)})}
/* Kleine Beschriftung unter dem Mauszeiger: Name, Vorrat/Leben, Hinweis */
let hoverE=null,hoverT=0;
function drawTip(e){
  const l1=nameOf(e);let l2='',l3='';
  if(e.kind==='node'){l2=rn(e.rt)+': '+Math.ceil(e.amount);if(e.regen)l3=tr('wächst nach');else if(NODES[e.type].cap)l3=tr('bis zu {0} Arbeiter',NODES[e.type].cap)}
  else if(e.kind==='animal'){const d=ANIMALS[e.type];l2=Math.ceil(e.hp)+' / '+e.maxHp;l3=tr(d.info)}
  else{l2=Math.ceil(e.hp)+' / '+e.maxHp;if(e.team===1)l3=tr('Gegner')}
  const lines=[l1,l2,l3].filter(Boolean);ctx.save();ctx.font='bold 12px sans-serif';let w=0;for(const t of lines)w=Math.max(w,ctx.measureText(t).width);w+=16;const h=lines.length*16+8;
  let x=Math.min(VW-w-6,mouse.x+16),y=Math.min(VH-h-6,mouse.y+18);ctx.fillStyle='rgba(24,26,30,.92)';ctx.strokeStyle='rgba(200,170,110,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.rect(x,y,w,h);ctx.fill();ctx.stroke();
  ctx.textAlign='left';ctx.textBaseline='top';lines.forEach((t,i)=>{ctx.fillStyle=i===0?'#f3e2b3':'#c9c3b2';ctx.font=(i===0?'bold ':'')+'12px sans-serif';ctx.fillText(t,x+8,y+5+i*16)});ctx.restore()}
function ovUnit(u){
  const d=UNITS[u.type];
  atGround(u.x,u.y,0,()=>{ctx.translate(0,7);lvlDots(u.lvl)});
  if(u.team===0&&d.gather&&u.state==='idle')atGround(u.x,u.y,entH(u)+16,idleMark);
}
function ovBld(b){
  const r=b.r,hh=entH(b);
  if(b.type!=='wall')atGround(b.x,b.y,hh+6,()=>{const bx=0,by=0;ctx.fillStyle='rgba(20,15,10,.85)';ctx.strokeStyle=LVLC[b.lvl];ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(bx-9,by-6,18,12);ctx.fill();ctx.stroke();ctx.fillStyle=LVLC[b.lvl];ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(LVLN[b.lvl],bx,by+.5)});
  if(!b.built)atGround(b.x,b.y+r,0,()=>{
    const bw=Math.max(46,r*2+10),bx=-bw/2,by=8,busy=G.ents.some(w=>!w.dead&&w.team===b.team&&w.state==='build'&&w.tid===b.id),warn=b.team===0&&!busy;
    ctx.fillStyle='rgba(20,15,10,.85)';ctx.fillRect(bx-1,by-1,bw+2,9);ctx.fillStyle=warn?'#d0432c':'#e0a24a';ctx.fillRect(bx,by,bw*b.prog,7);
    if(b.team===0){ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,15,10,.9)';const lb=warn?tr('Kein Bauarbeiter!'):tr('Im Bau')+' '+Math.floor(b.prog*100)+' %';ctx.strokeText(lb,0,by+10);ctx.fillStyle=warn?'#ff9a85':'#f3e2b3';ctx.fillText(lb,0,by+10)}})
}
/* Linie am Boden durch Spielpunkte */
function groundLine(pts){ctx.beginPath();pts.forEach((q,i)=>{const p=scr(q.x,q.y,0);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)});ctx.stroke()}
function groundCircle(x,y,r,n=48){const pts=[];for(let i=0;i<=n;i++){const a=i/n*6.283;pts.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r})}groundLine(pts)}

/* ---------- Partikel: Rauch, Feuer, Staub, Funken (nur Optik, nicht Teil des Spielstands) ---------- */
const PARTS=[];let lastRT=0;
function addPart(k,x,y,z,vx,vy,vz,life,size,col){if(PARTS.length<600)PARTS.push({k,x,y,z,vx,vy,vz,l:life,m:life,s:size,c:col})}
function partsStep(vis){
  if(PARTS.g!==G){PARTS.length=0;PARTS.g=G}
  const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastRT)/1000));lastRT=now;
  if(!G.paused&&dt>0){const R=Math.random,T=G.t;
    for(const e of vis){
      if(e.kind==='bld'){const h=entH(e),r=e.r,hp=e.hp/e.maxHp;
        if(!e.built){if((e._d=(e._d||0)-dt)<=0){e._d=.35+R()*.3;addPart('dust',e.x+(R()-.5)*r*1.6,e.y+r*.4,2,(R()-.5)*14,(R()-.5)*6,8,1.1,5,'196,170,128')}continue}
        if(hp<.5){if((e._f=(e._f||0)-dt)<=0){e._f=.06+hp*.12;const fx=(R()-.5)*r*1.4;addPart('fire',e.x+fx,e.y,R()*h*.5,(R()-.5)*8,0,26+R()*24,.55+R()*.35,5+R()*5,'');if(R()<.4)addPart('smoke',e.x+fx,e.y,h*.6,6+R()*8,0,18+R()*10,1.8,6,'40,38,36')}}
        else if(e.type==='house'&&G.epoch[e.team]>=1||(e.type==='hq'&&G.epoch[e.team]<=1)){if((e._sm=(e._sm||0)-dt)<=0){e._sm=.55+R()*.5;addPart('smoke',e.x+(e.type==='house'?r*.3:0),e.y-r*.3,h*(e.type==='house'?.95:.9),5,0,16,2.6,5,'170,168,164')}}
      }else if(e.kind==='unit'||e.kind==='animal'){const d=e.kind==='unit'?UNITS[e.type]:ANIMALS[e.type],mv=T-(e.mvT||-9)<.2;
        if(mv){if((e._d=(e._d||0)-dt)<=0){e._d=.16+R()*.08;if(d.naval)addPart('foam',e.x-Math.cos(e.fa)*e.r,e.y-Math.sin(e.fa)*e.r,0,0,0,0,.9,e.r*.5,'235,250,250');else if(terrAt(e.x,e.y)===2)addPart('dust',e.x+(R()-.5)*4,e.y+1,1,(R()-.5)*8,-2,6,.7,e.type==='knight'||d.siege?4.5:2.6,'176,150,108')}}
        if(e.swing&&e.swing!==e._ps){e._ps=e.swing;if(T-e.swing<.12&&e.state==='attack'&&!d.ranged)for(let i=0;i<5;i++)addPart('spark',e.x+Math.cos(e.fa)*e.r*1.7,e.y+Math.sin(e.fa)*e.r*1.7,10+R()*8,(R()-.5)*60+Math.cos(e.fa)*30,(R()-.5)*30,40+R()*50,.3+R()*.2,1.6,'255,226,140')}
        if(e.kind==='unit'&&T-(e.gat||-9)<.1&&e._gc!==((T*5)|0)){e._gc=(T*5)|0;const n=e.tid&&G.byId.get(e.tid);if(n&&e.rtype!=='food'){const c=e.rtype==='wood'?'168,122,68':e.rtype==='stone'?'190,186,176':'240,170,80';for(let i=0;i<3;i++)addPart('chip',n.x+(R()-.5)*n.r,n.y+n.r*.3,8+R()*14,(R()-.5)*50,(R()-.5)*20,50+R()*50,.45,1.6,c)}}
      }
    }
    for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.l-=dt;if(p.l<=0){PARTS.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      if(p.k==='spark'||p.k==='chip'){p.vz-=220*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.5}}else if(p.k==='smoke'){p.vx+=4*dt}else if(p.k==='dust'){p.vz*=.96}}}
}
function partsDraw(){
  for(const p of PARTS){const f=p.l/p.m,g=1-f;const q=scr(p.x,p.y,p.z);if(!q.front)continue;const k=R3.k;ctx.save();ctx.translate(q.x,q.y);ctx.scale(k,k);
    if(p.k==='smoke'){ctx.globalAlpha=.42*f*Math.min(1,g*6);ctx.fillStyle=`rgb(${p.c})`;ctx.beginPath();ctx.arc(0,0,p.s*(1+g*1.8),0,6.283);ctx.fill()}
    else if(p.k==='dust'){ctx.globalAlpha=.34*f;ctx.fillStyle=`rgb(${p.c})`;ctx.beginPath();ctx.arc(0,0,p.s*(1+g*1.5),0,6.283);ctx.fill()}
    else if(p.k==='foam'){ctx.globalAlpha=.55*f;ctx.strokeStyle=`rgb(${p.c})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,p.s*(1+g*2.4),p.s*(1+g*2.4)*.6,0,0,6.283);ctx.stroke()}
    else if(p.k==='fire'){ctx.globalCompositeOperation='lighter';const r=p.s*(1-g*.55);const gr=ctx.createRadialGradient(0,0,0,0,0,r*2.4);gr.addColorStop(0,`rgba(255,${200-g*120|0},60,${.85*f+.1})`);gr.addColorStop(.45,`rgba(255,${110-g*60|0},20,${.45*f})`);gr.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,0,r*2.4,0,6.283);ctx.fill()}
    else{ctx.globalAlpha=Math.min(1,f*1.6);ctx.fillStyle=`rgb(${p.c})`;if(p.k==='spark')ctx.globalCompositeOperation='lighter';ctx.beginPath();ctx.arc(0,0,p.s,0,6.283);ctx.fill()}
    ctx.restore()}
}

/* ---------- Ein Bild ---------- */
let lastDraw=0;
function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,VW,VH);
  if(!G||!bg||!window.THREE||window.__norender)return; /* __norender: Testhilfe ohne Zeichnen */
  if(R3.fail)return;
  if(!R3.ok){try{r3Init();camUpdate()}catch(err){R3.fail=true;console.error(err);const m=document.getElementById('hint');if(m){m.hidden=false;m.textContent=tr('Die 3D-Grafik (WebGL) wird von diesem Browser oder Gerät nicht unterstützt.')}return}}
  const now=performance.now(),dt=Math.min(.05,Math.max(.001,(now-lastDraw)/1000));lastDraw=now;
  // sichtbarer Ausschnitt der Karte (mit Rand), um nur Nahes zu behandeln
  const cs=[toWorld(0,0),toWorld(VW,0),toWorld(0,VH),toWorld(VW,VH)],x0=Math.min(...cs.map(c=>c.x))-140,x1=Math.max(...cs.map(c=>c.x))+140,y0=Math.min(...cs.map(c=>c.y))-140,y1=Math.max(...cs.map(c=>c.y))+200;
  const inV=e=>e.x>x0&&e.x<x1&&e.y>y0&&e.y<y1;
  const vis=G.ents.filter(e=>!e.dead&&inV(e)&&shown(e)&&(e.kind!=='bld'||e.team!==1||fogVis[fogIdx(e.x,e.y)]===1));
  const ghosts=[...G.mem.values()].filter(m=>inV(m)&&!fogVis[fogIdx(m.x,m.y)]);
  const s=new Set(sel);
  // 3D-Szene
  const list=[];for(const e of vis)if(e.kind!=='node'||e.sea)list.push([e,false]);for(const m of ghosts)list.push([m,true]);
  const rings=[];
  for(const e of vis)if(s.has(e.id))rings.push({x:e.x,y:e.y,r:e.r+(e.kind==='bld'?6:4),c:e.team===1?0xef9b86:e.team<0?0xecdfc3:0xf3d48a});
  for(const f of G.fx){const k=(G.t-f.t)/.7;rings.push({x:f.x,y:f.y,r:14*(1-k*.6),c:f.kind==='attack'?0xe0533c:f.kind==='rally'?0xf3d48a:0xecdfc3,o:1-k})}
  let ghostOk=true,pw=null;
  if(placing&&mouse.in){pw=toWorld(mouse.x,mouse.y);ghostOk=!placeBlock(placing,pw.x,pw.y);r3Ghost(placing,pw.x,pw.y,ghostOk);R3.ghostOn=true;rings.push({x:pw.x,y:pw.y,r:BLDS[placing].r+3,c:ghostOk?0x8fbf63:0xd0533c,o:.9})}
  r3Frame(list,rings,dt);
  // Anzeigen darüber
  partsStep(vis);partsDraw();
  for(const b of selection())if(b.kind==='bld'&&b.team===0&&b.rally){ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(243,212,138,.7)';ctx.lineWidth=1.2;groundLine([b,b.rally]);ctx.setLineDash([]);
    atGround(b.rally.x,b.rally.y,0,()=>{ctx.strokeStyle='#2a2119';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-16);ctx.stroke();ctx.fillStyle=TC[0];ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(10,-12);ctx.lineTo(0,-8);ctx.fill()})}
  {let cnt=0;for(const u of selection()){if(u.kind!=='unit'||u.team!==0||!u.q||!u.q.length||cnt++>12)continue;
    let cur=null;if(u.state==='move')cur=u.dest;else if(u.state==='amove')cur=u.amove;else if(u.tid&&(u.state==='build'||u.state==='gather'||u.state==='attack')){const e=get(u.tid);if(e)cur={x:e.x,y:e.y}}
    const pts=[];if(cur)pts.push(cur);for(const o of u.q){const q=ordPos(o);if(q)pts.push(q)}
    ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(243,212,138,.75)';ctx.lineWidth=1.4;groundLine([u,...pts]);ctx.setLineDash([]);
    pts.forEach((q,i)=>atGround(q.x,q.y,0,()=>{ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(33,26,19,.92)';ctx.strokeStyle='#f3d48a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,7,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#f3d48a';ctx.fillText(String(i+1),0,.5)}))}}
  for(const p of G.proj){const q=scr(p.x,p.y,16);if(!q.front)continue;const k=R3.k;ctx.strokeStyle='#2a2119';ctx.lineWidth=1.4;
    if(p.big||p.gun){ctx.fillStyle=p.big?'#2b2b30':'#46464c';ctx.beginPath();ctx.arc(q.x,q.y,(p.big?4.2:2)*k,0,6.283);ctx.fill();continue}
    const a=scr(p.x-Math.cos(p.a)*7,p.y-Math.sin(p.a)*7,16);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
  for(const e of vis){if(e.kind==='unit')ovUnit(e);else if(e.kind==='bld')ovBld(e)}
  if(OPT.hpBars!=='off')for(const e of vis)if(e.kind!=='node'&&(s.has(e.id)||OPT.hpBars==='all'&&e.kind==='unit'||e.hp<e.maxHp))hpBar(e);
  for(const e of vis)if(e.kind==='node'&&s.has(e.id))atGround(e.x,e.y,entH(e)+6,()=>{ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(-12,0,24,4);ctx.fillStyle='#ecdfc3';ctx.fillRect(-12,0,24*e.amount/e.maxAmt,4)});
  if(placing&&pw){const d=BLDS[placing];ctx.setLineDash([4,6]);ctx.lineWidth=1;ctx.strokeStyle='rgba(208,83,60,.85)';if(d.shoot)groundCircle(pw.x,pw.y,d.r+d.shoot.rng);ctx.strokeStyle='rgba(143,191,99,.9)';groundCircle(pw.x,pw.y,d.claim);ctx.setLineDash([])}
  // Upgrade und Forschung: Balken über dem Gebäude bzw. der Einheit
  for(const e of vis){if(e.upj&&e.team===0){const j=e.upj.time?e.upj:G.jobs[0][0];if(j)progBar(e,j.t/j.time,tr('Upgrade'),'#e0a24a')}}
  for(const r of G.rs[0]){const t=TECH[r.id];const b=t&&vis.find(e=>e.kind==='bld'&&e.team===0&&e.built&&(e.type===t.bld||(t.blds&&t.blds.includes(e.type))));if(b)progBar(b,r.t/r.time,tr(t.name),'#7fb2e8')}
  // Hover-Beschriftung
  if(mouse.in&&mouse.type==='mouse'&&!drag&&!placing&&!armed){hoverT-=dt;if(hoverT<=0){hoverT=.08;hoverE=entityAt(0,0,{x:mouse.x,y:mouse.y})}if(hoverE&&!hoverE.dead&&shown(hoverE))drawTip(hoverE)}else hoverE=null;
  if(drag&&drag.box){ctx.strokeStyle='#f3d48a';ctx.fillStyle='rgba(243,212,138,.08)';ctx.lineWidth=1;const x=Math.min(drag.sx,mouse.x),y=Math.min(drag.sy,mouse.y),w=Math.abs(mouse.x-drag.sx),h=Math.abs(mouse.y-drag.sy);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(armed&&mouse.in){ctx.strokeStyle='#e0533c';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,6.283);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke()}
  drawMini();
}
function drawMini(){
  mctx.setTransform(dpr,0,0,dpr,0,0);mctx.drawImage(bgSmall,0,0,MW,MH);const kx=MW/W,ky=MH/H;
  for(const e of G.ents){if(e.dead||!shown(e)||(e.kind==='bld'&&e.team===1))continue;
    if(e.kind==='node'){mctx.fillStyle=e.type==='tree'?'#2b4f27':e.type==='bush'?'#c2553f':e.type==='iron'?'#6d7886':e.type==='gold'?'#e6c35a':e.type==='oil'?'#2a2724':e.type==='fish'?'#bfe3ee':e.type==='dolphin'?'#7fa6c0':e.type==='whale'?'#2c3f66':'#c8c4ba';mctx.fillRect(e.x*kx-1,e.y*ky-1,2,2)}
    else if(e.kind==='bld'){mctx.fillStyle=TC[e.team];const s=e.type==='hq'?6:4;mctx.fillRect(e.x*kx-s/2,e.y*ky-s/2,s,s);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(e.x*kx-s/2,e.y*ky-s/2,s,s)}
    else if(e.kind==='animal'){mctx.fillStyle=ANIMALS[e.type].agg?'#e0a050':'#c9b27a';mctx.fillRect(e.x*kx-1,e.y*ky-1,2,2)}
    else{mctx.fillStyle=e.team===0?'#a9c8f0':'#f2a28c';mctx.fillRect(e.x*kx-1.2,e.y*ky-1.2,2.4,2.4)}}
  for(const m of G.mem.values()){mctx.fillStyle=TC[1];const sz=m.type==='hq'?6:4;mctx.fillRect(m.x*kx-sz/2,m.y*ky-sz/2,sz,sz);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(m.x*kx-sz/2,m.y*ky-sz/2,sz,sz)}
  mctx.imageSmoothingEnabled=true;mctx.drawImage(terrCv,0,0,MW,MH);mctx.drawImage(fogCv,0,0,MW,MH);
  if(G.ping&&G.t-G.ping.t<4){const k=((G.t-G.ping.t)%1);mctx.strokeStyle='#e0533c';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(G.ping.x*kx,G.ping.y*ky,3+k*10,0,6.283);mctx.stroke()}
  if(R3.ok){mctx.strokeStyle='#ecdfc3';mctx.lineWidth=1;mctx.beginPath();[[0,0],[VW,0],[VW,VH],[0,VH]].forEach(([sx,sy],i)=>{const w=toWorld(sx,sy);i?mctx.lineTo(w.x*kx,w.y*ky):mctx.moveTo(w.x*kx,w.y*ky)});mctx.closePath();mctx.stroke()}
}

