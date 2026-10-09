/* Epochenkrieg – 2,5D-Figuren (schräge Ansicht).
   Die Karte ist leicht nach hinten gekippt (TILT); Figuren, Gebäude und Ressourcen stehen "aufrecht" auf ihrem Bodenpunkt.
   Alle Funktionen zeichnen in einem Koordinatensystem mit Ursprung am Boden, y nach oben = negativ, Einheiten = Pixel bei Zoom 1.
   Gemeinsamer Stil: dunkler Umriss, Licht von links oben (helle linke/obere, dunklere rechte Flächen), einfache Formen. */
const SPR=(()=>{
const OUT='#2a2119',SKIN='#e2b98f';
/* ---- Farben ---- */
function hexToRgb(h){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function shade(h,f){if(h[0]!=='#')return h;const[r,g,b]=hexToRgb(h);const t=f<0?0:255,p=Math.abs(f);return`rgb(${Math.round(r+(t-r)*p)},${Math.round(g+(t-g)*p)},${Math.round(b+(t-b)*p)})`}
/* ---- Grundformen ---- */
function line(c,x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function limb(c,x1,y1,x2,y2,w,col){line(c,x1,y1,x2,y2,w+2.2,OUT);line(c,x1,y1,x2,y2,w,col)}
function outline(c,w){c.lineWidth=w||1.3;c.strokeStyle=OUT;c.lineJoin='round';c.stroke()}
function poly(c,pts,fill,w){c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();outline(c,w)}
function circ(c,x,y,r,fill,w){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();outline(c,w)}
function ell(c,x,y,rx,ry,fill,w){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();outline(c,w)}
function rect(c,x,y,w,h,fill,rad,lw){c.fillStyle=fill;c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,rad||0);else c.rect(x,y,w,h);c.fill();outline(c,lw)}
function glint(c,x,y,r){c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
function wave(t,s){return Math.sin(t*3+s)}

/* ======== Ressourcen ======== */
function tree(c,e,k){
  const r=e.r*(.82+.18*k),s=e.seed,pine=s<.4,sw=Math.sin(G_T()*1.3+s*40)*.6;
  c.save();c.lineJoin='round';
  // Stamm
  rect(c,-r*.2,-r*1.3,r*.4,r*1.3,'#6b4a2b',1);line(c,-r*.05,-r*1.2,-r*.05,-r*.1,1,'rgba(255,255,255,.18)');
  if(pine){ // Nadelbaum: drei Dreiecksstufen
    const cols=['#2a5a33','#37794a','#4c9a5c'];
    for(let i=0;i<3;i++){const w=r*(1.55-i*.38),y0=-r*(.8+i*.95),h=r*1.35;
      poly(c,[[-w,y0],[w,y0],[sw*.4,y0-h]],cols[i]);poly(c,[[w*.15,y0],[w,y0],[sw*.4,y0-h]],'rgba(10,30,15,.28)',0)}
    glint(c,-r*.35,-r*3.2,r*.2);
  }else{ // Laubbaum: Blätterkugeln mit Licht
    const blobs=[[-r*.7,-r*2.0,r*.95,'#2c5e2e'],[r*.75,-r*2.05,r*.9,'#2c5e2e'],[0,-r*2.55,r*1.05,'#336b34'],[-r*.3,-r*1.6,r*.95,'#3b7a3a']];
    for(const[x,y,rr,col]of blobs)circ(c,x+sw*.3,y,rr,col);
    circ(c,-r*.35+sw*.3,-r*2.7,r*.7,'#4a9047',0);circ(c,-r*.6+sw*.3,-r*2.95,r*.38,'#66b05a',0);
    c.fillStyle='rgba(10,30,15,.22)';c.beginPath();c.ellipse(r*.75,-r*1.7,r*.8,r*.9,0,0,6.283);c.fill();
    if(s>.75){c.fillStyle='#e07a8a';for(let i=0;i<4;i++){c.beginPath();c.arc(Math.cos(i*1.9+s*5)*r*.9,-r*2.2+Math.sin(i*2.3+s*5)*r*.8,1.6,0,6.283);c.fill()}}
  }
  if(k<.6)circ(c,r*.7,-r*.15,2.6,'#b08752',1);
  c.restore();
}
function bush(c,e,k){
  const r=e.r*(.85+.25*k),s=e.seed;
  c.save();c.lineJoin='round';
  circ(c,-r*.7,-r*.7,r*.85,'#3a6a2c');circ(c,r*.7,-r*.7,r*.85,'#3a6a2c');circ(c,0,-r*1.15,r*1.0,'#467c33');circ(c,-r*.25,-r*1.45,r*.55,'#5d9a42',0);
  c.fillStyle='rgba(10,30,15,.2)';c.beginPath();c.ellipse(r*.8,-r*.7,r*.6,r*.7,0,0,6.283);c.fill();
  const n=Math.ceil(8*e.amount/e.maxAmt);
  for(let i=0;i<n;i++){const x=Math.cos(s*6+i*1.3)*r*.95,y=-r*(.5+((i*37+s*50)%10)/12);circ(c,x,y,1.9,'#d03b46',.8);c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x-.6,y-.6,.6,0,6.283);c.fill()}
  c.restore();
}
function rock(c,e,k,iron){
  const r=e.r*(.8+.3*k),s=e.seed;
  c.save();c.lineJoin='round';
  const hgt=r*1.3,base=iron?'#55627a':'#9a968c',lite=iron?'#8896b0':'#c4c0b4',dark=iron?'#323c4e':'#6d6a62';
  // Hauptblock: Polygon mit hellen und dunklen Flächen
  const pts=[[-r*1.25,0],[-r*1.05,-hgt*.55],[-r*.55,-hgt*.95],[r*.1,-hgt*1.1],[r*.75,-hgt*.8],[r*1.2,-hgt*.35],[r*1.3,0]];
  poly(c,pts,base);
  poly(c,[pts[0],pts[1],pts[2],pts[3],[r*.05,-hgt*.35],[-r*.4,0]],lite,0);
  poly(c,[[r*.05,-hgt*.35],pts[3],pts[4],pts[5],pts[6],[r*.4,0]],dark,0);
  c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();outline(c,1.4);
  line(c,r*.05,-hgt*.35,-r*.1,-hgt*.05,1,'rgba(0,0,0,.35)');line(c,-r*.55,-hgt*.95,-r*.4,-hgt*.5,1,'rgba(0,0,0,.25)');
  // kleiner Begleitstein
  poly(c,[[r*1.1,0],[r*1.25,-hgt*.3],[r*1.65,-hgt*.35],[r*1.8,0]],base);poly(c,[[r*1.25,-hgt*.3],[r*1.65,-hgt*.35],[r*1.5,-hgt*.2]],lite,0);
  if(iron){for(let i=0;i<5;i++){const x=Math.cos(i*1.9+s*9)*r*.8,y=-hgt*(.25+((i*29+s*60)%10)/16);circ(c,x,y,2.1,'#f0903a',.8);glint(c,x-.6,y-.6,.8)}}
  else glint(c,-r*.65,-hgt*.8,r*.18);
  c.restore();
}

/* ======== Figuren ======== */
let G_T=()=>0;
/* Allgemeine Person von der Seite. o = {body, legs, head(c,r,E), back(c,r,E), hand(c,hx,hy,r,E), armBack}. */
function person(c,r,E,o){
  c.save();c.scale(E.face,1);c.lineJoin='round';
  const ph=E.ph,bob=E.moving?-Math.abs(ph)*r*.12:0;c.translate(0,bob);
  const hip=-r*1.0;
  for(const s of[-1,1]){const fx=s*ph*r*.6,lift=Math.max(0,-s*ph)*r*.25;limb(c,s*r*.15,hip,fx+s*r*.12,-lift,r*.38,o.legs||'#4a3a2a');rect(c,fx+s*r*.12-r*.12,-lift-r*.1,r*.5,r*.2,'#2f241a',2,1)}
  if(o.back)o.back(c,r,E);
  limb(c,-r*.05,-r*1.9,-r*.5-ph*r*.35,-r*1.3,r*.34,o.arm||SKIN);
  rect(c,-r*.55,-r*2.2,r*1.1,r*1.25,o.body,r*.28);
  c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.ellipse(-r*.25,-r*1.75,r*.14,r*.45,0,0,6.283);c.fill();
  c.fillStyle='rgba(0,0,0,.16)';c.beginPath();c.ellipse(r*.38,-r*1.6,r*.14,r*.45,0,0,6.283);c.fill();
  if(o.bodyExtra)o.bodyExtra(c,r,E);
  const hx=r*.62+E.reach*r,hy=-r*1.45-E.lift*r;
  limb(c,r*.05,-r*1.95,hx,hy,r*.34,o.arm||SKIN);
  circ(c,r*.05,-r*2.75,r*.52,SKIN);c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.arc(-r*.12,-r*2.9,r*.2,0,6.283);c.fill();
  circ(c,r*.3,-r*2.72,r*.07,'#2a2119',0);
  if(o.head)o.head(c,r,E);
  if(o.hand)o.hand(c,hx,hy,r,E);
  circ(c,hx,hy,r*.22,SKIN,1);
  c.restore();
}
function swingAng(E){return E.sw?.3-1.9*E.sw:E.work?.3-1.8*Math.max(0,Math.sin(E.t*7+E.id)):-.35}
function tool(c,hx,hy,ang,fn){c.save();c.translate(hx,hy);c.rotate(ang);fn();c.restore()}

const UNIT={
  worker(c,u,r,E){
    const rt=u.state==='build'?'build':u.rtype;E.reach=.05;E.lift=0;
    person(c,r,E,{body:E.tc,legs:'#6b5238',
      back:(c,r)=>{if(u.carry>0&&u.ctype){const col={food:'#c2553f',wood:'#9a6c3c',stone:'#b7b3a8',iron:'#6d7886'}[u.ctype];circ(c,-r*.7,-r*1.65,r*.5+u.carry/15*r*.25,col);line(c,-r*.4,-r*2.0,-r*.2,-r*2.1,1.2,OUT)}},
      head:(c,r)=>{if(rt==='food'){ell(c,r*.05,-r*3.05,r*.85,r*.2,'#d9b85c');circ(c,r*.05,-r*3.2,r*.4,'#e6c870')}else{c.fillStyle='#6b4a2b';c.beginPath();c.arc(r*.0,-r*2.8,r*.52,3.3,5.9);c.closePath();c.fill();outline(c,1)}},
      hand:(c,hx,hy,r,E)=>{const a=swingAng(E);
        if(rt==='wood')tool(c,hx,hy,a,()=>{limb(c,-r*.3,0,r*1.2,-r*.9,r*.2,'#8a6a42');poly(c,[[r*1.0,-r*.95],[r*1.45,-r*1.25],[r*1.55,-r*.55],[r*1.1,-r*.5]],'#b9bec4')});
        else if(rt==='stone'||rt==='iron')tool(c,hx,hy,a,()=>{limb(c,-r*.3,0,r*1.25,-r*.7,r*.2,'#8a6a42');poly(c,[[r*1.0,-r*1.2],[r*1.55,-r*.9],[r*1.5,-r*.45],[r*1.0,-r*.2],[r*1.2,-r*.7]],'#b9bec4')});
        else if(rt==='build')tool(c,hx,hy,a,()=>{limb(c,-r*.3,0,r*1.0,-r*.8,r*.2,'#8a6a42');rect(c,r*.8,-r*1.2,r*.7,r*.5,'#7e7a72',1)});
        else if(rt==='food')tool(c,hx,hy,-.1,()=>{ell(c,r*.5,r*.1,r*.55,r*.35,'#b88a4e');line(c,r*.1,-r*.1,r*.9,-r*.1,1,'#6d4f2c')});
        else tool(c,hx,hy,-.5,()=>limb(c,-r*.3,0,r*1.0,-r*.9,r*.2,'#8a6a42'))}});
  },
  scout(c,u,r,E){E.reach=.1;E.lift=0;
    person(c,r,E,{body:'#4f7f4f',legs:'#5a4a30',
      back:(c,r,E)=>{poly(c,[[-r*.3,-r*2.1],[-r*1.4,-r*1.2+E.ph*r*.2],[-r*1.1,-r*.5],[-r*.2,-r*1.0]],'#44704a')},
      bodyExtra:(c,r)=>{rect(c,-r*.55,-r*1.55,r*1.1,r*.22,E.tc,2,1)},
      head:(c,r)=>{c.fillStyle='#6ba26a';c.beginPath();c.arc(r*.0,-r*2.8,r*.58,3.2,6.1);c.closePath();c.fill();outline(c,1);
        limb(c,-r*.2,-r*3.3,-r*1.0,-r*3.9+E.ph*r*.1,r*.1,'#f1e7cf');limb(c,-r*.1,-r*3.25,-r*.8,-r*3.5,r*.08,'#c64b3c')},
      hand:(c,hx,hy,r)=>{limb(c,hx-r*.2,hy+r*.5,hx+r*.2,hy-r*1.8,r*.14,'#8a6a42')}});
  },
  club(c,u,r,E){E.reach=.05;E.lift=0;
    person(c,r,E,{body:'#7a5d3b',legs:'#5a4630',
      bodyExtra:(c,r)=>{for(let i=0;i<5;i++)poly(c,[[-r*.55+i*r*.22,-r*1.0],[-r*.45+i*r*.22,-r*.7],[-r*.35+i*r*.22,-r*1.0]],'#8b6c46',.8);rect(c,-r*.55,-r*1.75,r*1.1,r*.18,E.tc,2,1)},
      head:(c,r)=>{c.fillStyle='#4a3320';c.beginPath();c.arc(r*.0,-r*2.85,r*.6,3.0,6.4);c.closePath();c.fill();outline(c,1);for(let i=0;i<3;i++)line(c,-r*.5+i*r*.12,-r*3.2,-r*.7+i*r*.1,-r*3.6,1.4,'#4a3320')},
      hand:(c,hx,hy,r,E)=>{tool(c,hx,hy,swingAng(E),()=>{limb(c,-r*.3,0,r*1.35,-r*.9,r*.3,'#8a6a42');circ(c,r*1.45,-r*1.0,r*.5,'#6b4f31');circ(c,r*1.35,-r*1.2,r*.12,'#9a7a52',.5)})}});
  },
  spear(c,u,r,E){E.reach=.0;E.lift=.1;
    person(c,r,E,{body:'#6b4f35',legs:'#5a4630',
      bodyExtra:(c,r)=>{ell(c,0,-r*1.65,r*.42,r*.5,'#c78d42',1);line(c,-r*.3,-r*1.2,r*.3,-r*1.2,1.2,'#8e5f26')},
      head:(c,r)=>{c.fillStyle='#c78d42';c.beginPath();c.arc(r*.05,-r*2.8,r*.56,3.2,6.3);c.closePath();c.fill();outline(c,1.2);line(c,r*.05,-r*3.35,-r*.4,-r*3.5,2,E.tcl)},
      hand:(c,hx,hy,r,E)=>{const th=E.sw?E.sw*r*.9:0;
        circ(c,r*.3,-r*1.5,r*.78,E.tc);circ(c,r*.3,-r*1.5,r*.3,'#c78d42',1);c.strokeStyle=E.tcd;c.lineWidth=1.6;c.beginPath();c.arc(r*.3,-r*1.5,r*.58,0,6.283);c.stroke();
        limb(c,hx-r*.5+th,hy+r*.9,hx+r*.7+th,hy-r*2.4,r*.17,'#9a7448');poly(c,[[hx+r*.7+th,hy-r*3.2],[hx+r*.5+th,hy-r*2.3],[hx+r*.9+th,hy-r*2.3]],'#d7dbe0',1)}});
  },
  archer(c,u,r,E){E.reach=.45;E.lift=.0;
    person(c,r,E,{body:'#5b7a44',legs:'#4a3a2a',
      back:(c,r)=>{poly(c,[[-r*.85,-r*2.3],[-r*.4,-r*2.2],[-r*.55,-r*1.2],[-r*1.0,-r*1.3]],'#7a5535');for(let i=0;i<3;i++)line(c,-r*.8+i*r*.14,-r*2.3,-r*.95+i*r*.2,-r*2.8,1,'#e8d9b5')},
      bodyExtra:(c,r)=>{rect(c,-r*.55,-r*1.6,r*1.1,r*.2,E.tc,2,1)},
      head:(c,r)=>{c.fillStyle='#41603a';c.beginPath();c.arc(r*.0,-r*2.8,r*.58,3.2,6.2);c.closePath();c.fill();outline(c,1)},
      hand:(c,hx,hy,r,E)=>{const pull=E.attacking&&E.cd<.5;c.strokeStyle=OUT;c.lineWidth=4;c.beginPath();c.arc(hx+r*.1,hy,r*1.3,-1.2,1.2);c.stroke();c.strokeStyle='#a9783f';c.lineWidth=2.2;c.beginPath();c.arc(hx+r*.1,hy,r*1.3,-1.2,1.2);c.stroke();
        const bx=hx+r*.1+Math.cos(1.2)*r*1.3,by=Math.sin(1.2)*r*1.3;line(c,bx,hy-by,pull?hx-r*.7:bx,hy,.9,'#f1e7cf');line(c,pull?hx-r*.7:bx,hy,bx,hy+by,.9,'#f1e7cf');if(pull||E.sw>.2)limb(c,hx-r*.7,hy,hx+r*1.6,hy,r*.08,'#e8d9b5')}});
  },
  sword(c,u,r,E){E.reach=.05;E.lift=.1;
    person(c,r,E,{body:'#aab1ba',legs:'#59606a',
      bodyExtra:(c,r)=>{rect(c,-r*.4,-r*1.95,r*.8,r*.95,E.tc,r*.2,1);line(c,0,-r*1.95,0,-r*1.0,1.2,E.tcd);ell(c,-r*.45,-r*2.15,r*.28,r*.2,'#c7ccd3',1);ell(c,r*.45,-r*2.15,r*.28,r*.2,'#c7ccd3',1)},
      head:(c,r)=>{c.fillStyle='#b6bcc4';c.beginPath();c.arc(r*.05,-r*2.8,r*.6,3.1,6.35);c.closePath();c.fill();outline(c,1.2);line(c,r*.3,-r*2.85,r*.6,-r*2.85,1,OUT);
        poly(c,[[-r*.3,-r*3.35],[r*.2,-r*3.35],[-r*.15,-r*3.8]],E.tcl,1);line(c,-r*.3,-r*3.35,-r*.9,-r*3.2,2.2,E.tcl)},
      hand:(c,hx,hy,r,E)=>{
        poly(c,[[r*.1,-r*2.0],[r*.95,-r*2.0],[r*.95,-r*1.2],[r*.52,-r*.65],[r*.1,-r*1.2]],E.tcl);line(c,r*.52,-r*1.95,r*.52,-r*.8,1.6,'#f3efe4');line(c,r*.2,-r*1.55,r*.85,-r*1.55,1.6,'#f3efe4');
        tool(c,hx,hy,swingAng(E)-.2,()=>{limb(c,-r*.4,0,r*.1,0,r*.28,'#6b4f31');limb(c,r*.1,-r*.5,r*.1,r*.5,r*.2,'#c9a24e');limb(c,r*.15,0,r*2.2,-r*.2,r*.26,'#e5e9ee')})}});
  },
  crossbow(c,u,r,E){E.reach=.45;E.lift=0;
    person(c,r,E,{body:'#8a6a3e',legs:'#4a3a2a',
      bodyExtra:(c,r)=>{rect(c,-r*.45,-r*1.95,r*.9,r*.9,E.tc,r*.2,1);line(c,0,-r*1.95,0,-r*1.05,1.2,E.tcd)},
      head:(c,r)=>{c.fillStyle='#8f959d';c.beginPath();c.arc(r*.05,-r*2.8,r*.58,3.15,6.3);c.closePath();c.fill();outline(c,1.2);ell(c,r*.05,-r*2.5,r*.75,r*.12,'#6a7078',1)},
      hand:(c,hx,hy,r,E)=>{limb(c,hx-r*.5,hy,hx+r*1.5,hy-r*.1,r*.3,'#6b4f31');limb(c,hx+r*1.1,hy-r*1.1,hx+r*1.1,hy+r*.9,r*.2,'#4a3a28');
        const pull=E.attacking&&E.cd<.6;line(c,hx+r*1.1,hy-r*1.1,pull?hx+r*.5:hx+r*1.1,hy,.9,'#f1e7cf');line(c,pull?hx+r*.5:hx+r*1.1,hy,hx+r*1.1,hy+r*.9,.9,'#f1e7cf');if(pull||E.sw>.2)limb(c,hx+r*.5,hy-r*.1,hx+r*1.8,hy-r*.1,r*.08,'#e5e9ee')}});
  },
  musket(c,u,r,E){E.reach=.3;E.lift=.05;
    person(c,r,E,{body:E.tc,legs:'#e8e4d8',
      bodyExtra:(c,r)=>{line(c,-r*.45,-r*2.1,r*.4,-r*1.05,1.8,'#f3efe4');line(c,r*.45,-r*2.1,-r*.4,-r*1.05,1.8,'#f3efe4')},
      head:(c,r)=>{poly(c,[[-r*.65,-r*3.1],[r*.7,-r*3.1],[r*.2,-r*3.55],[-r*.4,-r*3.55]],'#2f3238');line(c,-r*.6,-r*3.1,r*.65,-r*3.1,1.4,E.tcl)},
      hand:(c,hx,hy,r,E)=>{const rec=E.sw*r*.4;limb(c,hx-r*.9-rec,hy+r*.1,hx+r*2.3-rec,hy-r*.25,r*.16,'#4a4a50');limb(c,hx-r*1.1-rec,hy+r*.2,hx+r*.3-rec,hy-r*.05,r*.34,'#7a5535');
        if(E.sw>.5){circ(c,hx+r*2.6,hy-r*.3,r*.55*E.sw,'rgba(255,214,120,.95)',0);circ(c,hx+r*3.3,hy-r*.5,r*.8*E.sw,'rgba(200,200,205,.55)',0)}}});
  },
  knight(c,u,r,E){
    c.save();c.scale(E.face,1);c.lineJoin='round';const ph=E.ph,bob=E.moving?-Math.abs(ph)*r*.18:0;c.translate(0,bob);
    const horse='#7a5a3a';
    // Hinterbeine, Vorderbeine
    for(const[x,s]of[[-r*.95,1],[-r*.7,-1],[r*.8,-1],[r*1.05,1]]){const sw=s*ph*r*.7,lift=Math.max(0,-s*ph)*r*.3;limb(c,x,-r*1.1,x+sw,-lift,r*.3,'#5b4228')}
    poly(c,[[-r*1.4,-r*1.5],[-r*1.7,-r*.7],[-r*1.45,-r*.5],[-r*1.2,-r*1.2]],'#3f2c1a',1);  // Schweif
    ell(c,-r*.1,-r*1.55,r*1.45,r*.75,horse);ell(c,-r*.1,-r*1.3,r*1.1,r*.35,'rgba(255,255,255,.12)',0);
    poly(c,[[r*1.0,-r*1.9],[r*1.65,-r*2.9],[r*2.15,-r*2.7],[r*1.5,-r*1.6]],horse); // Hals
    poly(c,[[r*1.75,-r*2.95],[r*2.5,-r*2.35],[r*2.35,-r*2.0],[r*1.6,-r*2.45]],horse); // Kopf
    poly(c,[[r*1.0,-r*2.05],[r*1.5,-r*2.9],[r*1.35,-r*2.95],[r*.85,-r*2.1]],'#3f2c1a',1);
    circ(c,r*1.95,-r*2.5,r*.07,'#1c1410',0);
    poly(c,[[-r*.9,-r*2.15],[r*.8,-r*2.15],[r*.9,-r*1.0],[-r*1.0,-r*1.0]],E.tc);line(c,-r*.9,-r*1.45,r*.85,-r*1.45,2,E.tcl);   // Satteldecke
    // Reiter
    c.save();c.translate(0,-r*2.2);
    limb(c,-r*.1,-r*.1,r*.5,r*.7,r*.4,'#8f959d');
    rect(c,-r*.5,-r*1.5,r*1.0,r*1.45,'#aab1ba',r*.25);rect(c,-r*.3,-r*1.2,r*.6,r*.8,E.tc,r*.15,1);
    circ(c,r*.05,-r*1.95,r*.5,'#c7ccd3');line(c,r*.3,-r*1.95,r*.55,-r*1.95,1,OUT);poly(c,[[-r*.35,-r*2.4],[r*.15,-r*2.4],[-r*.1,-r*2.85]],E.tcl,1);line(c,-r*.3,-r*2.4,-r*.9,-r*2.2,2.2,E.tcl);
    poly(c,[[r*.1,-r*1.5],[r*.8,-r*1.5],[r*.8,-r*.6],[r*.45,-r*.15],[r*.1,-r*.6]],E.tcl);line(c,r*.45,-r*1.45,r*.45,-r*.4,1.4,'#f3efe4');
    const ext=E.sw?E.sw*r*.8:0;limb(c,r*.1,-r*1.2,r*.9,-r*1.1,r*.3,'#8f959d');limb(c,-r*.6,r*.1,r*3.4+ext,-r*1.5,r*.16,'#9a7448');poly(c,[[r*3.4+ext,-r*1.5],[r*2.8+ext,-r*1.9],[r*2.8+ext,-r*1.2]],E.tc,1);
    c.restore();c.restore();
  },
  cannon(c,u,r,E){c.save();c.scale(E.face,1);c.lineJoin='round';const rec=E.sw?E.sw*r*.5:0;
    poly(c,[[-r*1.5,-r*.3],[-r*.6,-r*1.0],[r*.5,-r*1.0],[r*.7,-r*.3]],'#7a5a3a');
    poly(c,[[-r*1.6,-r*.15],[-r*2.3,0],[-r*1.4,0]],'#5b4228',1);
    c.save();c.translate(-rec,0);c.rotate(-.18);limb(c,-r*.9,-r*1.35,r*1.9,-r*1.35,r*.85,'#3a3b42');for(const x of[-r*.5,r*.5,r*1.4])limb(c,x,-r*1.35-r*.43,x,-r*1.35+r*.43,2.4,'#25262b');circ(c,r*1.95,-r*1.35,r*.45,'#1b1c20',1);circ(c,-r*1.0,-r*1.35,r*.5,'#2a2b31',1);
    if(E.sw>.4){circ(c,r*2.9,-r*1.35,r*.9*E.sw,'rgba(255,200,110,.95)',0);circ(c,r*3.8,-r*1.6,r*1.2*E.sw,'rgba(190,190,195,.55)',0)}c.restore();
    circ(c,0,-r*.62,r*.72,'#6b4f31');circ(c,0,-r*.62,r*.18,'#3f2c1a',1);for(let i=0;i<8;i++){const a=i*.785+(E.moving?E.t*3:0);line(c,0,-r*.62,Math.cos(a)*r*.7,-r*.62+Math.sin(a)*r*.7,1,'#3f2c1a')}
    line(c,-r*.3,-r*1.0,-r*.3,-r*2.3,1.2,'#6b4f31');poly(c,[[-r*.3,-r*2.3],[r*.4,-r*2.1],[-r*.3,-r*1.8]],E.tc,1);c.restore()},
  ram(c,u,r,E){c.save();c.scale(E.face,1);c.lineJoin='round';const sw=E.sw?E.sw*r*.9:0;
    for(const x of[-r*.8,r*.7]){circ(c,x,-r*.45,r*.5,'#5b4228');circ(c,x,-r*.45,r*.14,'#3f2c1a',1)}
    rect(c,-r*1.3,-r*1.0,r*2.6,r*.35,'#8a6a42',1);
    limb(c,-r*.8+sw,-r*.95,r*2.2+sw,-r*.95,r*.8,'#6b4f31');poly(c,[[r*2.1+sw,-r*1.5],[r*2.7+sw,-r*.95],[r*2.1+sw,-r*.4]],'#a9b0b8');
    poly(c,[[-r*1.35,-r*1.0],[-r*.8,-r*2.4],[r*.8,-r*2.4],[r*1.35,-r*1.0]],E.tc);for(let i=0;i<4;i++)line(c,-r*1.0+i*r*.65,-r*1.0,-r*.6+i*r*.4,-r*2.4,1,E.tcd);c.restore()},
  catapult(c,u,r,E){c.save();c.scale(E.face,1);c.lineJoin='round';const k=E.sw?(E.sw>.5?1:E.sw*2):0;
    for(const x of[-r*.8,r*.8]){circ(c,x,-r*.55,r*.6,'#5b4228');circ(c,x,-r*.55,r*.16,'#3f2c1a',1)}
    poly(c,[[-r*1.3,-r*.9],[r*1.3,-r*.9],[r*1.0,-r*1.5],[-r*1.0,-r*1.5]],'#8a6a42');limb(c,-r*.5,-r*.9,-r*.2,-r*2.2,r*.25,'#6b4f31');limb(c,r*.5,-r*.9,r*.2,-r*2.2,r*.25,'#6b4f31');
    const a=-2.5+k*2.1,ex=-r*.0+Math.cos(a)*r*2.1,ey=-r*2.2+Math.sin(a)*r*2.1;limb(c,0,-r*2.2,ex,ey,r*.28,'#4a3a28');circ(c,ex,ey,r*.4,'#7a5535');if(!k)circ(c,ex,ey-r*.1,r*.22,'#8d8a82',.8);
    poly(c,[[r*.9,-r*1.5],[r*1.1,-r*2.4],[r*1.5,-r*1.9]],E.tc,1);c.restore()}
};

/* Schiffe von der Seite */
function boat(c,u,r,E){
  const war=!!E.ranged,t=E.t,bob=Math.sin(t*2+u.id)*1.1;
  c.save();c.scale(E.face,1);c.translate(0,bob);c.lineJoin='round';
  const L=r*2.3,hgt=r*.9;
  poly(c,[[-L,-hgt*1.1],[L*1.1,-hgt*1.25],[L*.75,0],[-L*.8,0]],war?'#6b5236':'#9a6c3c');
  c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.moveTo(-L*.8,0);c.lineTo(L*.75,0);c.lineTo(L*.85,-hgt*.5);c.lineTo(-L*.9,-hgt*.5);c.closePath();c.fill();
  line(c,-L*.95,-hgt*.8,L*1.0,-hgt*.9,2,E.tc);
  if(war){for(let i=0;i<4;i++){rect(c,-L*.5+i*L*.4,-hgt*.95,r*.35,r*.3,'#1b1c20',1,1)}
    limb(c,0,-hgt*1.1,0,-r*3.2,r*.2,'#4a3a28');poly(c,[[0,-r*3.1],[r*1.6,-r*2.6],[r*1.5,-r*1.3],[0,-r*1.6]],'#e9e1cc');poly(c,[[0,-r*2.0],[r*.9,-r*1.9],[0,-r*1.6]],E.tc,1);}
  else{limb(c,r*.2,-hgt*1.1,r*.2,-r*3.1,r*.18,'#4a3a28');poly(c,[[r*.3,-r*3.0],[r*1.7,-r*1.4],[r*.3,-r*1.3]],'#f1e7cf');poly(c,[[r*.2,-r*3.0],[r*.2,-r*3.5],[-r*.5,-r*3.3]],E.tc,1);
    if(u.carry>0)ell(c,-r*.6,-hgt*1.3,r*.7,r*.25,'#cfe6ee',1)}
  c.restore();
}

function unit(c,u,r,E){
  c.save();c.lineJoin='round';
  if(E.naval)boat(c,u,r,E);else(UNIT[u.type]||UNIT.worker)(c,u,r,E);
  // Stufe: Schulterschmuck / Kamm / Schimmer
  if(E.lvl>=1&&!E.naval){c.save();c.scale(E.face,1);if(E.lvl>=2)circ(c,r*.05,-r*2.15,r*.22,E.lc,1);if(E.lvl>=3)line(c,-r*.4,-r*3.5,r*.3,-r*3.5,2,E.lc);c.restore()}
  c.restore();
}

/* ======== Gebäude ======== */
function wallTex(c,x,y,w,h,m,ep){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.strokeStyle='rgba(0,0,0,.22)';c.lineWidth=1;
  if(ep<=1){for(let i=1;i<w/6;i++){c.beginPath();c.moveTo(x+i*6,y);c.lineTo(x+i*6,y+h);c.stroke()}}
  else{const bh=5;for(let j=1;j<h/bh;j++){c.beginPath();c.moveTo(x,y+j*bh);c.lineTo(x+w,y+j*bh);c.stroke();for(let i=0;i<w/10;i++){const off=j%2?5:0;c.beginPath();c.moveTo(x+i*10+off,y+(j-1)*bh);c.lineTo(x+i*10+off,y+j*bh);c.stroke()}}}
  c.restore()}
/* Block mit Vorderseite, rechter Seitenfläche und Dach (Giebel zum Betrachter) */
function block(c,w,h,d,m,E,o){
  o=o||{};const wall=m.wall,roof=o.roof||m.roof,x0=-w/2,dy=d*.45;
  // rechte Seite
  poly(c,[[w/2,0],[w/2+d,-dy],[w/2+d,-dy-h],[w/2,-h]],shade(wall,-.28));
  // Vorderseite
  rect(c,x0,-h,w,h,wall,1);wallTex(c,x0,-h,w,h,m,E.ep);
  c.fillStyle='rgba(255,255,255,.1)';c.fillRect(x0+1,-h+1,w*.35,h-2);
  if(o.flat){ // flaches Dach mit Zinnen
    poly(c,[[x0,-h],[w/2,-h],[w/2+d,-h-dy],[x0+d,-h-dy]],shade(roof,.12));
    if(o.cren){c.fillStyle=shade(wall,-.1);for(let i=0;i<Math.floor(w/9);i++)rect(c,x0+i*9+1,-h-5,5,5,wall,0,1)}
  }else{
    const ov=o.ov!==undefined?o.ov:3,rh=o.rh||h*.8;
    poly(c,[[w/2+ov,-h],[0,-h-rh],[d,-h-rh-dy],[w/2+ov+d,-h-dy]],shade(roof,-.22));
    poly(c,[[x0-ov,-h],[w/2+ov,-h],[0,-h-rh]],shade(roof,.08));
    c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let i=1;i<4;i++){const f=i/4;c.beginPath();c.moveTo(x0-ov+(w/2+ov-(x0-ov))*0+ (0-(x0-ov))*f*0,-h);c.stroke()}
  }
}
function door(c,x,w,h,col){rect(c,x-w/2,-h,w,h,col||'#4a3220',w*.35,1)}
function windowAt(c,x,y,w,h){rect(c,x-w/2,y,w,h,'#9fc4d9',1,1);line(c,x,y,x,y+h,.8,OUT);line(c,x-w/2,y+h/2,x+w/2,y+h/2,.8,OUT)}
function bflag(c,x,y,len,col,t,seed){limb(c,x,y,x,y-len,1.4,'#cbb88f');const w=Math.sin(t*3+seed)*2.2;poly(c,[[x,y-len],[x+len*.8,y-len+3+w],[x+len*.62,y-len*.64+w],[x,y-len*.55]],col)}
function cone(c,x,y,w,h,col){poly(c,[[x-w,y],[x+w,y],[x,y-h]],col);poly(c,[[x+w*.1,y],[x+w,y],[x,y-h]],'rgba(0,0,0,.22)',0)}
function turret(c,x,w,h,m,E,roof){rect(c,x-w/2,-h,w,h,m.wall,2);wallTex(c,x-w/2,-h,w,h,m,E.ep);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x-w/2+1,-h+1,w*.3,h-2);c.fillStyle='rgba(0,0,0,.16)';c.fillRect(x+w*.15,-h+1,w*.35,h-2);if(roof)cone(c,x,-h,w*.7,w*1.0,roof)}

function bld(c,b,E){
  const r=b.r,m=E.m,ep=E.ep,seed=b.id||0;
  c.save();c.lineJoin='round';
  switch(b.type){
  case'hq':{ // Halle mit zwei Türmen; Aussehen je nach Epoche
    if(ep<=1){ // Holzhalle mit Palisade
      block(c,r*1.7,r*.95,r*.55,m,E,{rh:r*.9,ov:6});door(c,0,r*.45,r*.7);windowAt(c,-r*.55,-r*.7,r*.22,r*.22);windowAt(c,r*.55,-r*.7,r*.22,r*.22);
      turret(c,-r*1.15,r*.5,r*1.7,m,E,m.roof);turret(c,r*1.15,r*.5,r*1.7,m,E,m.roof);
      for(let i=-6;i<=6;i++){const x=i*r*.17;poly(c,[[x-r*.07,r*.35],[x+r*.07,r*.35],[x+r*.07,-r*.15],[x,-r*.28],[x-r*.07,-r*.15]],'#8a6a42',.8)}
    }else{
      block(c,r*1.9,r*1.15,r*.6,m,E,{rh:r*.85,ov:5});
      turret(c,-r*1.25,r*.6,r*2.0,m,E,m.roof);turret(c,r*1.25,r*.6,r*2.0,m,E,m.roof);
      rect(c,-r*.45,-r*2.5,r*.9,r*1.4,shade(m.wall,.05),2);wallTex(c,-r*.45,-r*2.5,r*.9,r*1.4,m,ep);cone(c,0,-r*2.5,r*.62,r*.9,m.roof);
      if(ep>=4){circ(c,0,-r*1.95,r*.28,'#f1e7cf',1);line(c,0,-r*1.95,0,-r*2.15,1,OUT);line(c,0,-r*1.95,r*.12,-r*1.9,1,OUT)} // Uhr
      door(c,0,r*.5,r*.75);windowAt(c,-r*.7,-r*.9,r*.24,r*.3);windowAt(c,r*.7,-r*.9,r*.24,r*.3);
      if(ep>=3){c.fillStyle=m.line;for(let i=-4;i<=4;i++)c.fillRect(i*r*.23-2,-r*1.3,4,4)}
    }
    bflag(c,-r*1.15,-r*1.7-(ep>1?r*.3:0),r*.9,E.tc,E.t,seed);bflag(c,r*1.15,-r*1.7-(ep>1?r*.3:0),r*.9,E.tc,E.t,seed+2);break}
  case'house':{block(c,r*2.0,r*1.1,r*.6,m,E,{rh:r*.95,ov:3});door(c,-r*.35,r*.5,r*.8,E.tc);windowAt(c,r*.5,-r*.85,r*.4,r*.4);
    if(ep>=1){rect(c,r*.6,-r*2.6,r*.35,r*.8,shade(m.wall,-.1),1)}break}
  case'store':{block(c,r*2.5,r*1.0,r*.6,m,E,{rh:r*.5,ov:4});rect(c,-r*.45,-r*.95,r*.9,r*.9,'#6b4f31',1);line(c,0,-r*.95,0,-r*.05,1,OUT);line(c,-r*.45,-r*.5,r*.45,-r*.5,1,OUT);
    rect(c,r*1.35,-r*.55,r*.55,r*.5,'#a9834f',1);rect(c,r*1.55,-r*1.0,r*.5,r*.5,'#8d6a3e',1);line(c,0,-r*1.0,0,-r*1.5,1,'rgba(0,0,0,.2)');rect(c,-r*1.25,-r*1.0,r*.18,r*1.0,E.tc,1);break}
  case'barracks':{block(c,r*2.1,r*1.35,r*.7,m,E,{flat:true,cren:true});door(c,0,r*.75,r*.95,'#3a2a1a');line(c,0,-r*.95,0,0,1,OUT);
    for(let i=0;i<3;i++){const x=-r*.8+i*r*.8;if(i===1)continue;windowAt(c,x,-r*1.0,r*.25,r*.4)}
    for(let i=0;i<3;i++)limb(c,r*.95+i*3,-r*.5,r*.95+i*3,-r*1.0,1.4,'#c7ccd3');
    bflag(c,r*.9,-r*1.6,r*1.0,E.tc,E.t,seed);break}
  case'tower':{turret(c,0,r*1.6,r*2.7,m,E,null);c.fillStyle=shade(m.wall,.05);c.fillRect(-r*.95,-r*2.9,r*1.9,r*.35);outline(c,1.2);for(let i=-3;i<=3;i+=2)rect(c,i*r*.28-3,-r*3.2,6,5,m.wall,0,1);
    rect(c,-2,-r*2.3,4,r*.6,'#1d1812',1,.8);rect(c,-2,-r*1.4,4,r*.5,'#1d1812',1,.8);bflag(c,0,-r*3.0,r*1.3,E.tc,E.t,seed);break}
  case'castle':{block(c,r*2.2,r*1.7,r*.7,m,E,{flat:true,cren:true});for(const s of[-1,1])turret(c,s*r*1.3,r*.8,r*2.7,m,E,m.roof);
    rect(c,-r*.7,-r*2.7,r*1.4,r*1.0,shade(m.wall,.05),2);wallTex(c,-r*.7,-r*2.7,r*1.4,r*1.0,m,ep);cone(c,0,-r*2.7,r*.85,r*1.1,m.roof);door(c,0,r*.7,r*1.0,'#3a2a1a');
    windowAt(c,-r*.7,-r*1.3,r*.22,r*.4);windowAt(c,r*.7,-r*1.3,r*.22,r*.4);bflag(c,0,-r*3.7,r*1.1,E.tc,E.t,seed);break}
  case'harbor':{const dir=Math.cos(b.ang||0)<0?-1:1;c.scale(dir,1);
    poly(c,[[r*.2,r*.55],[r*1.9,r*.55],[r*2.1,r*.15],[r*.4,r*.15]],'#8a6a42');c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(r*.2+i*r*.3,r*.55);c.lineTo(r*.4+i*r*.3,r*.15);c.stroke()}
    for(const x of[r*.5,r*1.9])limb(c,x,r*.55,x,r*.95,r*.14,'#5b4228');
    block(c,r*1.5,r*.9,r*.5,m,E,{rh:r*.65,ov:3});door(c,-r*.2,r*.4,r*.65,E.tc);
    limb(c,r*1.5,r*.2,r*1.5,-r*1.6,r*.12,'#6b4f31');limb(c,r*1.5,-r*1.6,r*.5,-r*1.2,r*.1,'#6b4f31');circ(c,r*2.0,r*.1,r*.22,'#cbb88f',1);
    c.scale(dir,1);bflag(c,-r*.6,-r*1.5,r*.8,E.tc,E.t,seed);break}
  case'wall':{poly(c,[[-r,0],[r,0],[r,-r*1.5],[-r,-r*1.5]],m.wall);wallTex(c,-r,-r*1.5,r*2,r*1.5,m,Math.max(2,ep));poly(c,[[-r,-r*1.5],[r,-r*1.5],[r+r*.5,-r*1.5-r*.35],[-r+r*.5,-r*1.5-r*.35]],shade(m.wall,.18));
    c.fillStyle=shade(m.wall,-.28);c.beginPath();c.moveTo(r,0);c.lineTo(r+r*.5,-r*.35);c.lineTo(r+r*.5,-r*1.85);c.lineTo(r,-r*1.5);c.closePath();c.fill();outline(c,1.1);break}
  default:rect(c,-r,-r*1.5,r*2,r*1.5,m.wall,2)}
  c.restore();
}
/* Höhe (in Pixeln bei Zoom 1) für Trefferprüfung und Lebensbalken */
function height(e){
  if(e.kind==='unit'){const t=e.type;return t==='knight'?e.r*4:t==='cannon'||t==='ram'||t==='catapult'?e.r*2.7:(UNITS[t]&&UNITS[t].naval)?e.r*3.4:e.r*3.8}
  if(e.kind==='bld'){return e.r*({hq:3.2,house:2.9,store:2.0,barracks:2.4,tower:3.4,castle:3.8,harbor:2.6,wall:1.9}[e.type]||2.2)}
  return e.r*({tree:3.8,bush:1.9,stone:1.5,iron:1.5}[e.type]||1.2)}
return{unit,bld,tree,bush,rock,height,setClock(f){G_T=f}};
})();
