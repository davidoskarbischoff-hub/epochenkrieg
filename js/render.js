/* Epochenkrieg – Zeichnen der Karte, Einheiten, Gebäude und der Minikarte.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- drawing ---------- */
function shadow(x,y,rx,ry){ctx.fillStyle='rgba(20,28,10,.3)';ctx.beginPath();ctx.ellipse(x+rx*.25,y+ry*.2,rx,ry,0,0,6.283);ctx.fill()}
/* Zeichnet fn im aufrechten Raum am Bodenpunkt (x,y): 1 Einheit = 1 Bildschirm-Pixel bei Zoom 1 */
function upright(x,y,fn){ctx.save();ctx.translate(x,y);ctx.scale(1,1/TILT);fn();ctx.restore()}
const lvlDots=(lvl,y)=>{const n=lvl+1;ctx.fillStyle=LVLC[lvl];ctx.strokeStyle='rgba(20,15,10,.8)';ctx.lineWidth=1;for(let i=0;i<n;i++){ctx.beginPath();ctx.arc((i-(n-1)/2)*5,y,2.1,0,6.283);ctx.fill();ctx.stroke()}};
function idleMark(y){ctx.fillStyle='#d0432c';ctx.strokeStyle='#fff3ea';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,y,6.5,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#fff3ea';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',0,y+.5)}
function drawNode(e){
  const k=Math.max(.55,Math.sqrt(e.amount/e.maxAmt));
  if(e.type==='tree'){shadow(e.x,e.y,e.r*1.3,e.r*.9);upright(e.x,e.y,()=>SPR.tree(ctx,e,k))}
  else if(e.type==='bush'){shadow(e.x,e.y,e.r*1.2,e.r*.8);upright(e.x,e.y,()=>SPR.bush(ctx,e,k))}
  else if(e.sea){
    const T=G.t,a0=e.seed*6.283,bob=Math.sin(T*1.6+e.seed*20)*1.6;ctx.save();ctx.translate(e.x,e.y+bob);ctx.rotate(a0+Math.sin(T*.5+e.seed*9)*.15);
    if(e.type==='fish'){const k=Math.max(.6,e.amount/e.maxAmt);ctx.fillStyle='rgba(8,40,60,.25)';ctx.beginPath();ctx.ellipse(0,0,e.r+3,e.r*.8,0,0,6.283);ctx.fill();
      for(let i=0;i<4;i++){const ox=Math.cos(i*1.7)*e.r*.6,oy=Math.sin(i*2.3)*e.r*.5,sc=k*.9+.2;ctx.fillStyle=i%2?'#cfe6ee':'#a9d0de';ctx.beginPath();ctx.ellipse(ox,oy,4.4*sc,2*sc,0,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(ox-4*sc,oy);ctx.lineTo(ox-7*sc,oy-2*sc);ctx.lineTo(ox-7*sc,oy+2*sc);ctx.fill()}}
    else if(e.type==='dolphin'){ctx.fillStyle='rgba(8,40,60,.3)';ctx.beginPath();ctx.ellipse(2,3,e.r+3,e.r*.6,0,0,6.283);ctx.fill();
      for(let i=0;i<2;i++){const oy=(i-.5)*12;ctx.fillStyle='#7f9fb8';ctx.beginPath();ctx.ellipse(0,oy,e.r+1,e.r*.45,0,0,6.283);ctx.fill();ctx.fillStyle='#d4e2ea';ctx.beginPath();ctx.ellipse(1,oy+1.6,e.r*.8,e.r*.2,0,0,6.283);ctx.fill();
        ctx.fillStyle='#6a89a3';ctx.beginPath();ctx.moveTo(-2,oy-3);ctx.lineTo(-6,oy-8);ctx.lineTo(2,oy-3);ctx.fill();ctx.beginPath();ctx.moveTo(-e.r,oy);ctx.lineTo(-e.r-6,oy-4);ctx.lineTo(-e.r-6,oy+4);ctx.fill()}}
    else{ctx.fillStyle='rgba(8,40,60,.32)';ctx.beginPath();ctx.ellipse(3,4,e.r*1.9,e.r*.8,0,0,6.283);ctx.fill();
      ctx.fillStyle='#41587a';ctx.beginPath();ctx.ellipse(0,0,e.r*1.8,e.r*.72,0,0,6.283);ctx.fill();ctx.fillStyle='#8aa0b8';ctx.beginPath();ctx.ellipse(e.r*.2,e.r*.18,e.r*1.3,e.r*.32,0,0,6.283);ctx.fill();
      ctx.fillStyle='#35496a';ctx.beginPath();ctx.moveTo(-e.r*1.7,0);ctx.lineTo(-e.r*2.6,-e.r*.7);ctx.lineTo(-e.r*2.4,0);ctx.lineTo(-e.r*2.6,e.r*.7);ctx.fill();
      ctx.fillStyle='#10202f';ctx.beginPath();ctx.arc(e.r*1.2,-e.r*.2,1.6,0,6.283);ctx.fill();
      const sp=(Math.sin(T*1.1+e.seed*30)+1)/2;ctx.strokeStyle=`rgba(220,240,250,${.25+sp*.45})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.r*.6,0);ctx.lineTo(e.r*.6,-e.r*(.5+sp*.7));ctx.moveTo(e.r*.6,-e.r*(.5+sp*.7));ctx.lineTo(e.r*.6-5,-e.r*(.2+sp*.4));ctx.moveTo(e.r*.6,-e.r*(.5+sp*.7));ctx.lineTo(e.r*.6+5,-e.r*(.2+sp*.4));ctx.stroke()}
    ctx.restore()}
  else{shadow(e.x,e.y,e.r*1.5,e.r*.9);upright(e.x,e.y,()=>SPR.rock(ctx,e,k,e.type==='iron'))}
}
function drawBld(b){
  const m=MAT[G.epoch[b.team]],r=b.r,hh=SPR.height(b);
  shadow(b.x+r*.3,b.y,r*1.25,r*.8);
  upright(b.x,b.y,()=>{
    ctx.save();
    if(!b.built){ // im Bau: nur der fertige Teil von unten ist sichtbar
      ctx.beginPath();ctx.rect(-r*3,-hh*2.2*(.12+.88*b.prog),r*6,hh*2.4);ctx.clip();ctx.globalAlpha=.75}
    SPR.bld(ctx,b,{m,tc:TC[b.team],tcd:TCD[b.team],tcl:TCL[b.team],t:G.t,ep:G.epoch[b.team]});
    ctx.restore();
    if(!b.built){ctx.strokeStyle='rgba(236,223,195,.7)';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.strokeRect(-r*1.2,-hh*(.12+.88*b.prog),r*2.4,hh*(.12+.88*b.prog));ctx.setLineDash([])}
    if(b.type!=='wall'){const bx=-r+1,by=-hh-8;ctx.fillStyle='rgba(20,15,10,.85)';ctx.strokeStyle=LVLC[b.lvl];ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(bx-9,by-6,18,12);ctx.fill();ctx.stroke();ctx.fillStyle=LVLC[b.lvl];ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(LVLN[b.lvl],bx,by+.5)}
    if(!b.built){
      const bw=Math.max(46,r*2+10),bx=-bw/2,by=6,busy=G.ents.some(w=>!w.dead&&w.team===b.team&&w.state==='build'&&w.tid===b.id),warn=b.team===0&&!busy;
      ctx.fillStyle='rgba(20,15,10,.85)';ctx.fillRect(bx-1,by-1,bw+2,9);ctx.fillStyle=warn?'#d0432c':'#e0a24a';ctx.fillRect(bx,by,bw*b.prog,7);
      if(b.team===0){ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=3;ctx.strokeStyle='rgba(20,15,10,.9)';const lb=warn?tr('Kein Bauarbeiter!'):tr('Im Bau')+' '+Math.floor(b.prog*100)+' %';ctx.strokeText(lb,0,by+10);ctx.fillStyle=warn?'#ff9a85':'#f3e2b3';ctx.fillText(lb,0,by+10)}}
  });
}
function drawUnit(u){
  const d=UNITS[u.type],r=u.r,naval=!!d.naval,moving=G.t-(u.mvT||-9)<.2,sw=u.swing&&G.t-u.swing<.28?1-(G.t-u.swing)/.28:0;
  if(naval)shadow(u.x,u.y+2,r*1.8,r*.6);else shadow(u.x,u.y,r*1.05,r*.55);
  const face=Math.cos(u.fa)>=0?1:-1;
  upright(u.x,u.y,()=>{
    SPR.unit(ctx,u,r,{id:u.id,lvl:u.lvl,lc:LVLC[u.lvl],face,tc:TC[u.team],tcd:TCD[u.team],tcl:TCL[u.team],ph:moving?Math.sin(G.t*10+u.id):0,moving,sw,work:G.t-(u.gat||-9)<.25,attacking:u.state==='attack',cd:u.cd||0,t:G.t,naval,ranged:!!d.ranged,reach:0,lift:0});
    lvlDots(u.lvl,6);
    if(u.team===0&&d.gather&&u.state==='idle')idleMark(-SPR.height(u)-9);
  });
}
function hpBar(e){const w=Math.max(18,e.r*2+4),x=-w/2,y=-SPR.height(e)-(e.kind==='bld'?20:8);const f=Math.max(0,e.hp/e.maxHp);
  upright(e.x,e.y,()=>{ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(x-1,y-1,w+2,5);ctx.fillStyle=f>.5?'#8fbf63':f>.25?'#e0a24a':'#d0533c';ctx.fillRect(x,y,w*f,3)})}
/* ---------- Partikel: Rauch, Feuer, Staub, Funken (nur Optik, nicht Teil des Spielstands) ---------- */
const PARTS=[];let lastRT=0;
function addPart(k,x,y,z,vx,vy,vz,life,size,col){if(PARTS.length<600)PARTS.push({k,x,y,z,vx,vy,vz,l:life,m:life,s:size,c:col})}
function partsStep(vis){
  if(PARTS.g!==G){PARTS.length=0;PARTS.g=G}
  const now=performance.now(),dt=Math.min(.05,Math.max(0,(now-lastRT)/1000));lastRT=now;
  if(!G.paused&&dt>0){const R=Math.random,T=G.t;
    for(const e of vis){
      if(e.kind==='bld'){const h=SPR.height(e),r=e.r,hp=e.hp/e.maxHp;
        if(!e.built){if((e._d=(e._d||0)-dt)<=0){e._d=.35+R()*.3;addPart('dust',e.x+(R()-.5)*r*1.6,e.y+r*.4,2,(R()-.5)*14,(R()-.5)*6,8,1.1,5,'196,170,128')}continue}
        if(hp<.5){if((e._f=(e._f||0)-dt)<=0){e._f=.06+hp*.12;const fx=(R()-.5)*r*1.4;addPart('fire',e.x+fx,e.y,R()*h*.5,(R()-.5)*8,0,26+R()*24,.55+R()*.35,5+R()*5,'');if(R()<.4)addPart('smoke',e.x+fx,e.y,h*.6,6+R()*8,0,18+R()*10,1.8,6,'40,38,36')}}
        else if(e.type==='house'||(e.type==='hq'&&G.epoch[e.team]<=1)){if((e._sm=(e._sm||0)-dt)<=0){e._sm=.55+R()*.5;addPart('smoke',e.x+(e.type==='house'?r*.78:0),e.y,e.type==='house'?r*2.6:h*.95,5,0,16,2.6,5,'170,168,164')}}
      }else if(e.kind==='unit'){const d=UNITS[e.type],mv=T-(e.mvT||-9)<.2;
        if(mv){if((e._d=(e._d||0)-dt)<=0){e._d=.16+R()*.08;if(d.naval)addPart('foam',e.x-Math.cos(e.fa)*e.r,e.y-Math.sin(e.fa)*e.r*.6,0,0,0,0,.9,e.r*.5,'235,250,250');else if(terrAt(e.x,e.y)===2)addPart('dust',e.x+(R()-.5)*4,e.y+1,1,(R()-.5)*8,-2,6,.7,e.type==='knight'||d.siege?4.5:2.6,'176,150,108')}}
        if(e.swing&&e.swing!==e._ps){e._ps=e.swing;if(T-e.swing<.12&&e.state==='attack'&&!d.ranged)for(let i=0;i<5;i++)addPart('spark',e.x+Math.cos(e.fa)*e.r*1.7,e.y+Math.sin(e.fa)*e.r*1.7,10+R()*8,(R()-.5)*60+Math.cos(e.fa)*30,(R()-.5)*30,40+R()*50,.3+R()*.2,1.6,'255,226,140')}
        if(T-(e.gat||-9)<.1&&e._gc!==((T*5)|0)){e._gc=(T*5)|0;const n=e.tid&&G.byId.get(e.tid);if(n&&e.rtype!=='food'){const c=e.rtype==='wood'?'168,122,68':e.rtype==='stone'?'190,186,176':'240,170,80';for(let i=0;i<3;i++)addPart('chip',n.x+(R()-.5)*n.r,n.y+n.r*.3,8+R()*14,(R()-.5)*50,(R()-.5)*20,50+R()*50,.45,1.6,c)}}
      }
    }
    for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.l-=dt;if(p.l<=0){PARTS.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
      if(p.k==='spark'||p.k==='chip'){p.vz-=220*dt;if(p.z<0){p.z=0;p.vz*=-.3;p.vx*=.5}}else if(p.k==='smoke'){p.vx+=4*dt}else if(p.k==='dust'){p.vz*=.96}}}
}
function partsDraw(){
  for(const p of PARTS){const f=p.l/p.m,g=1-f;ctx.save();ctx.translate(p.x,p.y);ctx.scale(1,1/TILT);
    if(p.k==='smoke'){ctx.globalAlpha=.42*f*Math.min(1,g*6);ctx.fillStyle=`rgb(${p.c})`;ctx.beginPath();ctx.arc(0,-p.z,p.s*(1+g*1.8),0,6.283);ctx.fill()}
    else if(p.k==='dust'){ctx.globalAlpha=.34*f;ctx.fillStyle=`rgb(${p.c})`;ctx.beginPath();ctx.arc(0,-p.z,p.s*(1+g*1.5),0,6.283);ctx.fill()}
    else if(p.k==='foam'){ctx.globalAlpha=.55*f;ctx.strokeStyle=`rgb(${p.c})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,p.s*(1+g*2.4),p.s*(1+g*2.4)*.6,0,0,6.283);ctx.stroke()}
    else if(p.k==='fire'){ctx.globalCompositeOperation='lighter';const r=p.s*(1-g*.55);const gr=ctx.createRadialGradient(0,-p.z,0,0,-p.z,r*2.4);gr.addColorStop(0,`rgba(255,${200-g*120|0},60,${.85*f+.1})`);gr.addColorStop(.45,`rgba(255,${110-g*60|0},20,${.45*f})`);gr.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(0,-p.z,r*2.4,0,6.283);ctx.fill()}
    else{ctx.globalAlpha=Math.min(1,f*1.6);ctx.fillStyle=`rgb(${p.c})`;if(p.k==='spark')ctx.globalCompositeOperation='lighter';ctx.beginPath();ctx.arc(0,-p.z,p.s,0,6.283);ctx.fill()}
    ctx.restore()}
}
function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#1d1812';ctx.fillRect(0,0,VW,VH);
  if(!G||!bg)return;
  const z=cam.z;ctx.setTransform(dpr*z,0,0,dpr*z*TILT,-cam.x*dpr*z,-cam.y*dpr*z*TILT);
  const vw=VW/z,vh=VH/(z*TILT);const sx=Math.max(0,cam.x),sy=Math.max(0,cam.y),sw=Math.min(W-sx,vw+2),sh=Math.min(H-sy,vh+2);
  if(sw>0&&sh>0)ctx.drawImage(bg,sx,sy,sw,sh,sx,sy,sw,sh);
  ctx.imageSmoothingEnabled=true;ctx.drawImage(terrCv,0,0,W,H);
  const x0=cam.x-80,y0=cam.y-40,x1=cam.x+vw+80,y1=cam.y+vh+140;
  const vis=G.ents.filter(e=>!e.dead&&e.x>x0&&e.x<x1&&e.y>y0&&e.y<y1&&shown(e)&&(e.kind!=='bld'||e.team!==1||fogVis[fogIdx(e.x,e.y)]===1));
  const ghosts=[...G.mem.values()].filter(m=>m.x>x0&&m.x<x1&&m.y>y0&&m.y<y1&&!fogVis[fogIdx(m.x,m.y)]);
  const s=new Set(sel);
  // selection rings on the ground
  for(const e of vis)if(s.has(e.id)){ctx.strokeStyle=e.team===1?'#ef9b86':e.team<0?'#ecdfc3':'#f3d48a';ctx.lineWidth=1.6/TILT;ctx.beginPath();ctx.ellipse(e.x,e.y,e.r+4,(e.r+4)*.9,0,0,6.283);ctx.stroke()}
  vis.filter(e=>e.kind==='node'&&e.sea).forEach(drawNode);
  // alles Aufrechte nach Tiefe (y) sortiert
  const order=vis.filter(e=>!(e.kind==='node'&&e.sea)).concat(ghosts).sort((a,b)=>a.y-b.y);
  for(const e of order){if(e.kind==='node')drawNode(e);else if(e.kind==='unit')drawUnit(e);else drawBld(e)}
  // Einheiten hinter Gebäuden: durchscheinend noch einmal davor zeichnen
  {const bl=order.filter(e=>e.kind==='bld');if(bl.length){ctx.save();ctx.globalAlpha=.5;for(const u of order){if(u.kind!=='unit')continue;if(bl.some(b=>u.y<b.y&&Math.abs(u.x-b.x)<b.r+4&&u.y>b.y-SPR.height(b)/TILT))drawUnit(u)}ctx.restore()}}
  partsStep(vis);partsDraw();
  // rally
  for(const b of selection())if(b.kind==='bld'&&b.team===0&&b.rally){ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(243,212,138,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.rally.x,b.rally.y);ctx.stroke();ctx.setLineDash([]);
    upright(b.rally.x,b.rally.y,()=>{ctx.strokeStyle='#2a2119';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-16);ctx.stroke();ctx.fillStyle=TC[0];ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(10,-12);ctx.lineTo(0,-8);ctx.fill()})}
  // Befehlsketten der ausgewählten Einheiten
  {let cnt=0;for(const u of selection()){if(u.kind!=='unit'||u.team!==0||!u.q||!u.q.length||cnt++>12)continue;
    let cur=null;if(u.state==='move')cur=u.dest;else if(u.state==='amove')cur=u.amove;else if(u.tid&&(u.state==='build'||u.state==='gather'||u.state==='attack')){const e=get(u.tid);if(e)cur={x:e.x,y:e.y}}
    const pts=[];if(cur)pts.push(cur);for(const o of u.q){const q=ordPos(o);if(q)pts.push(q)}
    ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(243,212,138,.75)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(u.x,u.y);pts.forEach(q=>ctx.lineTo(q.x,q.y));ctx.stroke();ctx.setLineDash([]);
    pts.forEach((q,i)=>upright(q.x,q.y,()=>{ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(33,26,19,.92)';ctx.strokeStyle='#f3d48a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,7,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#f3d48a';ctx.fillText(String(i+1),0,.5)}))}}
  // projectiles (y-Wert = Bodenpunkt, Höhe wird abgezogen)
  for(const p of G.proj){upright(p.x,p.y,()=>{const hz=p.big||p.gun?-14:-18;ctx.strokeStyle='#2a2119';ctx.lineWidth=1.4;
    if(p.big||p.gun){ctx.fillStyle=p.big?'#2b2b30':'#46464c';ctx.beginPath();ctx.arc(0,hz,p.big?4.2:2,0,6.283);ctx.fill();return}
    const ca=Math.cos(p.a),sa=Math.sin(p.a)*TILT;ctx.beginPath();ctx.moveTo(-ca*7,hz-sa*7);ctx.lineTo(0,hz);ctx.stroke()})}
  for(const e of vis)if((e.kind!=='node')&&(s.has(e.id)||e.hp<e.maxHp))hpBar(e);
  for(const e of vis)if(e.kind==='node'&&s.has(e.id))upright(e.x,e.y,()=>{const y=-SPR.height(e)-6;ctx.fillStyle='rgba(20,15,10,.75)';ctx.fillRect(-12,y,24,4);ctx.fillStyle='#ecdfc3';ctx.fillRect(-12,y,24*e.amount/e.maxAmt,4)});
  // fx
  for(const f of G.fx){const k=(G.t-f.t)/.7;ctx.strokeStyle=f.kind==='attack'?'#e0533c':f.kind==='rally'?'#f3d48a':'#ecdfc3';ctx.globalAlpha=1-k;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,12*(1-k*.6),12*(1-k*.6),0,0,6.283);ctx.stroke();ctx.globalAlpha=1}
  // Nebel
  ctx.imageSmoothingEnabled=true;ctx.drawImage(fogCv,0,0,W,H);
  // ghost
  if(placing&&mouse.in){const w=toWorld(mouse.x,mouse.y),d=BLDS[placing],ok=!placeBlock(placing,w.x,w.y);ctx.fillStyle=ok?'rgba(143,191,99,.3)':'rgba(208,83,60,.35)';ctx.strokeStyle=ok?'#8fbf63':'#d0533c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(w.x,w.y,d.r,0,6.283);ctx.fill();ctx.stroke();
    ctx.save();ctx.globalAlpha=.55;ctx.fillStyle='transparent';upright(w.x,w.y,()=>SPR.bld(ctx,{type:placing,r:d.r,id:0,ang:0},{m:MAT[G.epoch[0]],tc:TC[0],tcd:TCD[0],tcl:TCL[0],t:G.t,ep:G.epoch[0]}));ctx.restore();
    ctx.setLineDash([4,6]);ctx.lineWidth=1;if(d.shoot){ctx.beginPath();ctx.arc(w.x,w.y,d.r+d.shoot.rng,0,6.283);ctx.stroke()}ctx.strokeStyle='rgba(143,191,99,.8)';ctx.beginPath();ctx.arc(w.x,w.y,d.claim,0,6.283);ctx.stroke();ctx.setLineDash([])}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(drag&&drag.box){ctx.strokeStyle='#f3d48a';ctx.fillStyle='rgba(243,212,138,.08)';ctx.lineWidth=1;const x=Math.min(drag.sx,mouse.x),y=Math.min(drag.sy,mouse.y),w=Math.abs(mouse.x-drag.sx),h=Math.abs(mouse.y-drag.sy);ctx.fillRect(x,y,w,h);ctx.strokeRect(x+.5,y+.5,w,h)}
  if(armed&&mouse.in){ctx.strokeStyle='#e0533c';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mouse.x,mouse.y,9,0,6.283);ctx.moveTo(mouse.x-14,mouse.y);ctx.lineTo(mouse.x+14,mouse.y);ctx.moveTo(mouse.x,mouse.y-14);ctx.lineTo(mouse.x,mouse.y+14);ctx.stroke()}
  drawMini();
}
function drawMini(){
  mctx.setTransform(dpr,0,0,dpr,0,0);mctx.drawImage(bgSmall,0,0,MW,MH);const kx=MW/W,ky=MH/H;
  for(const e of G.ents){if(e.dead||!shown(e)||(e.kind==='bld'&&e.team===1))continue;
    if(e.kind==='node'){mctx.fillStyle=e.type==='tree'?'#2b4f27':e.type==='bush'?'#c2553f':e.type==='iron'?'#6d7886':e.type==='fish'?'#bfe3ee':e.type==='dolphin'?'#7fa6c0':e.type==='whale'?'#2c3f66':'#c8c4ba';mctx.fillRect(e.x*kx-1,e.y*ky-1,2,2)}
    else if(e.kind==='bld'){mctx.fillStyle=TC[e.team];const s=e.type==='hq'?6:4;mctx.fillRect(e.x*kx-s/2,e.y*ky-s/2,s,s);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(e.x*kx-s/2,e.y*ky-s/2,s,s)}
    else{mctx.fillStyle=e.team===0?'#a9c8f0':'#f2a28c';mctx.fillRect(e.x*kx-1.2,e.y*ky-1.2,2.4,2.4)}}
  for(const m of G.mem.values()){mctx.fillStyle=TC[1];const sz=m.type==='hq'?6:4;mctx.fillRect(m.x*kx-sz/2,m.y*ky-sz/2,sz,sz);mctx.strokeStyle='#1d1812';mctx.lineWidth=.8;mctx.strokeRect(m.x*kx-sz/2,m.y*ky-sz/2,sz,sz)}
  mctx.imageSmoothingEnabled=true;mctx.drawImage(terrCv,0,0,MW,MH);mctx.drawImage(fogCv,0,0,MW,MH);
  if(G.ping&&G.t-G.ping.t<4){const k=((G.t-G.ping.t)%1);mctx.strokeStyle='#e0533c';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(G.ping.x*kx,G.ping.y*ky,3+k*10,0,6.283);mctx.stroke()}
  mctx.strokeStyle='#ecdfc3';mctx.lineWidth=1;mctx.strokeRect(cam.x*kx+.5,cam.y*ky+.5,VW/cam.z*kx,VH/(cam.z*TILT)*ky);
}

