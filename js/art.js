/* Epochenkrieg – Grafik für Einheiten und Ressourcen (alles prozedural, Draufsicht).
   Gemeinsamer Stil: dunkler Umriss, einfache Farbflächen, ein heller Lichtpunkt oben links.
   Einheiten werden in "lokalen" Koordinaten gezeichnet: +x = Blickrichtung, +y = rechte Seite der Figur. */
const ART=(()=>{
const OUT='#2a2119',SKIN='#e2b98f';
const CARRYC={food:'#c2553f',wood:'#9a6c3c',stone:'#b7b3a8',iron:'#6d7886'};

function circ(c,x,y,r,fill,w){c.fillStyle=fill;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();c.lineWidth=w||1.2;c.strokeStyle=OUT;c.stroke()}
function ell(c,x,y,rx,ry,fill,rot){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,6.283);c.fill();c.lineWidth=1.2;c.strokeStyle=OUT;c.stroke()}
function line(c,x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
/* Linie mit dunklem Umriss (Stiele, Klingen) */
function bar(c,x1,y1,x2,y2,w,col){line(c,x1,y1,x2,y2,w+2,OUT);line(c,x1,y1,x2,y2,w,col)}
function poly(c,pts,fill){c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();c.lineWidth=1.2;c.strokeStyle=OUT;c.stroke()}
function shine(c,x,y,r){c.fillStyle='rgba(255,255,255,.28)';c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
const hash=(s,i)=>{const v=Math.sin((s*1000+i)*12.9898)*43758.5453;return v-Math.floor(v)};

/* ---------------- Ressourcen ---------------- */
function tree(c,e,k){
  const r=e.r*(.78+.22*k),s=e.seed,pine=s<.4;
  c.save();c.translate(e.x,e.y);c.lineJoin='round';
  if(pine){ // Nadelbaum: drei Sternschichten
    const cols=['#2a5a33','#38814a','#52a45f'];
    for(let i=0;i<3;i++){const rr=r*(1.0-i*.26),n=8,pts=[];for(let j=0;j<n*2;j++){const a=j/(n*2)*6.283+s*6+i*.4,q=j%2?rr*.8:rr;pts.push([Math.cos(a)*q,Math.sin(a)*q])}poly(c,pts,cols[i])}
    circ(c,0,0,r*.12,'#7a5a3a',1);shine(c,-r*.22,-r*.25,r*.2);
  }else{ // Laubbaum: mehrere Blätterklumpen
    const lobes=6;
    for(let i=0;i<lobes;i++){const a=i/lobes*6.283+s*6;circ(c,Math.cos(a)*r*.5,Math.sin(a)*r*.5,r*.58,'#2b5a2d')}
    for(let i=0;i<4;i++){const a=i/4*6.283+s*9+.5;circ(c,Math.cos(a)*r*.3,Math.sin(a)*r*.3,r*.42,'#3f7c39',1)}
    circ(c,-r*.12,-r*.15,r*.36,'#58a047',1);shine(c,-r*.28,-r*.32,r*.17);
    if(s>.75){c.fillStyle='#e07a8a';for(let i=0;i<4;i++){c.beginPath();c.arc(Math.cos(i*1.9+s*5)*r*.55,Math.sin(i*2.3+s*5)*r*.55,1.5,0,6.283);c.fill()}} // Blüten
  }
  if(k<.65){circ(c,r*.45,r*.5,2.8,'#b08752',1)} // gefällte Äste / Stumpf
  c.restore();
}
function bush(c,e,k){
  const r=e.r*(.8+.25*k),s=e.seed;
  c.save();c.translate(e.x,e.y);c.lineJoin='round';
  for(let i=0;i<5;i++){const a=i/5*6.283+s*6;circ(c,Math.cos(a)*r*.5,Math.sin(a)*r*.5,r*.55,'#3b6a2c')}
  circ(c,0,0,r*.6,'#4f8636',1);circ(c,-r*.2,-r*.22,r*.3,'#68a246',1);
  const n=Math.ceil(7*e.amount/e.maxAmt);
  for(let i=0;i<n;i++){const a=s*6+i*.9,d=r*(.28+hash(s,i)*.5),x=Math.cos(a)*d,y=Math.sin(a)*d;circ(c,x,y,2.3,'#cf3b45',1);c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(x-.7,y-.7,.7,0,6.283);c.fill()}
  c.restore();
}
function rock(c,e,k,iron){
  const r=e.r*(.78+.3*k)+2,s=e.seed,n=8,pts=[];
  for(let i=0;i<n;i++){const a=i/n*6.283+s*6,q=r*(.82+hash(s,i)*.3);pts.push([Math.cos(a)*q,Math.sin(a)*q])}
  c.save();c.translate(e.x,e.y);c.lineJoin='round';
  poly(c,pts,iron?'#4b5766':'#8d8a82');
  // helle obere Fläche, dunkle untere Fläche
  poly(c,[pts[6],pts[7],pts[0],pts[1],[0,0]].map(([x,y],i)=>i<4?[x*.9,y*.9]:[x,y]),iron?'#7b8a9d':'#bab6ab');
  c.fillStyle=iron?'rgba(10,15,25,.35)':'rgba(40,36,30,.3)';c.beginPath();c.moveTo(pts[2][0]*.9,pts[2][1]*.9);c.lineTo(pts[3][0]*.9,pts[3][1]*.9);c.lineTo(pts[4][0]*.9,pts[4][1]*.9);c.lineTo(0,0);c.closePath();c.fill();
  c.strokeStyle='rgba(30,26,22,.55)';c.lineWidth=1;c.beginPath();c.moveTo(-r*.2,-r*.1);c.lineTo(r*.05,r*.25);c.lineTo(r*.3,r*.2);c.stroke();
  if(iron){for(let i=0;i<4;i++){const x=Math.cos(i*1.7+s*8)*r*.5,y=Math.sin(i*2.1+s*8)*r*.5;circ(c,x,y,1.9,'#e58d3a',.8);shine(c,x-.5,y-.5,.8)}}
  else shine(c,-r*.28,-r*.38,r*.2);
  c.restore();
}

/* ---------------- Einheiten ---------------- */
/* env: {tc,tcd,tcl (Teamfarben), ph (Gehschwung -1..1), sw (Schlagstärke 0..1), work (arbeitet gerade), t (Zeit)} */
const hands=(c,r,E,rx,ry,lx,ly)=>{circ(c,rx,ry,r*.26,SKIN,1);circ(c,lx,ly,r*.26,SKIN,1)};

const ART_UNIT={
  worker(c,u,r,E){
    if(u.carry>0&&u.ctype){circ(c,-r*.8,0,r*.5+u.carry/15*r*.3,CARRYC[u.ctype]);line(c,-r*.5,-r*.3,-r*.5,r*.3,1,OUT)} // Last auf dem Rücken
    ell(c,0,0,r*.62,r*1.0,E.tc);line(c,-r*.05,-r*.62,-r*.05,r*.62,1.2,E.tcd); // Kittel mit Gürtel
    const rx=r*.4+E.ph*r*.3,lx=r*.4-E.ph*r*.3;
    // Werkzeug in der rechten Hand
    const rt=u.state==='build'?'build':u.rtype;let ang=.25;if(E.work)ang=.7-1.7*Math.max(0,Math.sin(E.t*7+u.id));
    c.save();c.translate(rx,r*.95);c.rotate(ang);
    if(rt==='wood'){bar(c,-r*.3,0,r*1.35,0,1.7,'#8a6a42');poly(c,[[r*1.1,-r*.1],[r*1.55,-r*.55],[r*1.65,r*.1],[r*1.2,r*.25]],'#b9bec4')}
    else if(rt==='stone'||rt==='iron'){bar(c,-r*.3,0,r*1.35,0,1.7,'#8a6a42');poly(c,[[r*1.1,-r*.65],[r*1.45,-r*.55],[r*1.55,0],[r*1.45,r*.55],[r*1.1,r*.65],[r*1.25,0]],'#b9bec4')}
    else if(rt==='build'){bar(c,-r*.3,0,r*1.1,0,1.7,'#8a6a42');poly(c,[[r*.95,-r*.4],[r*1.4,-r*.4],[r*1.4,r*.4],[r*.95,r*.4]],'#7e7a72')}
    else if(rt==='food'){ell(c,r*.5,0,r*.55,r*.4,'#b88a4e');line(c,r*.1,0,r*.9,0,1,'#6d4f2c')} // Korb
    else bar(c,-r*.2,0,r*1.0,0,1.7,'#8a6a42');
    c.restore();
    circ(c,lx,-r*.95,r*.26,SKIN,1);circ(c,rx,r*.95,r*.26,SKIN,1);
    circ(c,r*.12,0,r*.52,SKIN);c.fillStyle='#6b4a2b';c.beginPath();c.arc(r*.05,0,r*.53,1.75,4.53);c.closePath();c.fill();c.lineWidth=1;c.strokeStyle=OUT;c.stroke(); // Haare
  },
  scout(c,u,r,E){
    const cloak='#4f7f4f',cl2='#6ba26a';
    poly(c,[[-r*.3,-r*.55],[-r*1.9,E.ph*r*.25],[-r*.3,r*.55]],cloak); // wehender Umhang
    ell(c,0,0,r*.55,r*.85,cloak);ell(c,-r*.05,0,r*.2,r*.8,E.tc); // Schärpe in Teamfarbe
    circ(c,r*.45+E.ph*r*.25,r*.9,r*.24,SKIN,1);circ(c,r*.45-E.ph*r*.25,-r*.9,r*.24,SKIN,1);
    circ(c,r*.1,0,r*.55,cl2);circ(c,r*.4,0,r*.3,SKIN,1); // Kapuze + Gesicht
    bar(c,-r*.2,-r*.35,-r*1.1,-r*.9+E.ph*r*.1,1.2,'#f1e7cf');bar(c,-r*.2,-r*.2,-r*1.0,-r*.5,1,'#c64b3c'); // Federn
  },
  club(c,u,r,E){
    ell(c,0,0,r*.72,r*1.12,'#7a5d3b'); // Fellumhang
    for(let i=0;i<9;i++){const a=i/9*6.283;circ(c,Math.cos(a)*r*.62,Math.sin(a)*r*1.05,r*.2,'#8b6c46',.9)}
    ell(c,r*.05,0,r*.3,r*.85,E.tc);line(c,r*.05,-r*.8,r*.05,r*.8,1,E.tcd); // Teamfarbe als Gürtel/Band
    circ(c,r*.4+E.ph*r*.3,-r*1.05,r*.28,SKIN,1);
    c.save();c.translate(r*.5,r*1.0);c.rotate(E.sw?(.7-1.8*E.sw):.1);
    bar(c,-r*.4,0,r*1.35,0,2.8,'#8a6a42');circ(c,r*1.55,0,r*.5,'#6b4f31');circ(c,r*1.4,-r*.15,r*.12,'#9a7a52',.6);
    c.restore();circ(c,r*.5,r*1.0,r*.28,SKIN,1);
    circ(c,r*.12,0,r*.62,'#4a3320');circ(c,r*.4,0,r*.34,SKIN,1);line(c,r*.5,-r*.12,r*.5,r*.12,1,'#6b3a2a'); // wilde Haare + Gesicht
  },
  spear(c,u,r,E){
    ell(c,0,0,r*.62,r*1.0,'#6b4f35');ell(c,r*.05,0,r*.38,r*.72,'#c78d42'); // Lederhemd, Bronzepanzer
    line(c,r*.05,-r*.6,r*.05,r*.6,1,'#8e5f26');
    // Rundschild links
    circ(c,r*.45,-r*1.15,r*.68,E.tc);circ(c,r*.45,-r*1.15,r*.3,'#c78d42',1);ctx2ring(c,r*.45,-r*1.15,r*.5,E.tcd);
    // Speer rechts
    const th=E.sw?E.sw*r*.8:0;c.save();c.translate(r*.4+E.ph*r*.2+th,r*.95);c.rotate(.08);
    bar(c,-r*1.2,0,r*2.7,0,1.6,'#9a7448');poly(c,[[r*2.6,0],[r*3.1,0],[r*2.55,-r*.32],[r*2.2,0],[r*2.55,r*.32]].slice(0,5),'#d7dbe0');
    c.restore();circ(c,r*.4+th,r*.95,r*.26,SKIN,1);
    circ(c,r*.1,0,r*.55,'#c78d42');line(c,-r*.4,0,r*.5,0,1.6,'#8e5f26');circ(c,r*.35,0,r*.2,SKIN,1); // Bronzehelm mit Kamm
  },
  archer(c,u,r,E){
    // Köcher auf dem Rücken
    poly(c,[[-r*.9,-r*.5],[-r*.35,-r*.55],[-r*.4,-r*.1],[-r*.95,-r*.05]],'#7a5535');for(let i=0;i<3;i++)line(c,-r*.8-i*.3,-r*.35,-r*1.35,-r*.55+i*r*.15,1,'#e8d9b5');
    ell(c,0,0,r*.58,r*.92,'#5b7a44');ell(c,r*.05,0,r*.22,r*.8,E.tc); // Schärpe in Teamfarbe
    // Bogen vorn
    c.save();c.translate(r*.5,0);const pull=u.cd!==undefined&&u.cd<.5&&E.attacking;
    c.strokeStyle=OUT;c.lineWidth=4.2;c.beginPath();c.arc(-r*.1,0,r*1.35,-1.0,1.0);c.stroke();c.strokeStyle='#a9783f';c.lineWidth=2.4;c.beginPath();c.arc(-r*.1,0,r*1.35,-1.0,1.0);c.stroke();
    const bx=-r*.1+Math.cos(1.0)*r*1.35,by=Math.sin(1.0)*r*1.35;line(c,bx,-by,pull?-r*.5:bx,0,.9,'#f1e7cf');line(c,pull?-r*.5:bx,0,bx,by,.9,'#f1e7cf');
    if(pull||E.attacking)bar(c,-r*.5,0,r*1.6,0,1,'#e8d9b5');
    c.restore();
    circ(c,r*.7,r*.45,r*.24,SKIN,1);circ(c,r*.2,-r*.7,r*.24,SKIN,1);
    circ(c,r*.12,0,r*.52,'#41603a');circ(c,r*.38,0,r*.3,SKIN,1); // Kapuze + Gesicht
  },
  sword(c,u,r,E){
    ell(c,0,0,r*.68,r*1.08,'#aab1ba');ell(c,r*.02,0,r*.4,r*.8,E.tc);line(c,r*.02,-r*.75,r*.02,r*.75,1,E.tcd); // Kettenhemd + Waffenrock
    ell(c,-r*.05,-r*.85,r*.3,r*.2,'#c7ccd3');ell(c,-r*.05,r*.85,r*.3,r*.2,'#c7ccd3'); // Schulterplatten
    // Schild links (Wappenform)
    c.save();c.translate(r*.5,-r*1.2);c.rotate(.15);poly(c,[[-r*.55,-r*.6],[r*.55,-r*.6],[r*.6,r*.1],[0,r*.85],[-r*.6,r*.1]].map(([x,y])=>[y*.9,x*1.15]),E.tcl);
    line(c,-r*.45,0,r*.5,0,1.8,'#f3efe4');line(c,0,-r*.5,0,r*.5,1.8,'#f3efe4');c.restore();
    // Schwert rechts
    c.save();c.translate(r*.4+E.ph*r*.15,r*1.0);c.rotate(E.sw?(.9-2.0*E.sw):.12);
    bar(c,-r*.3,0,r*.1,0,2.4,'#6b4f31');bar(c,r*.1,-r*.45,r*.1,r*.45,1.8,'#c9a24e');bar(c,r*.15,0,r*2.2,0,2.4,'#e5e9ee');
    c.restore();circ(c,r*.45,r*1.0,r*.27,'#8f959d',1);
    circ(c,r*.1,0,r*.58,'#b6bcc4');ell(c,-r*.02,0,r*.55,r*.15,E.tcl);line(c,r*.3,-r*.2,r*.58,-r*.2,1,OUT);line(c,r*.3,r*.2,r*.58,r*.2,1,OUT); // Eisenhelm mit Kamm und Sehschlitz
  }
  ,knight(c,u,r,E){
    // Pferd
    const gal=E.ph*r*.18;
    for(const[lx,ly]of[[r*.9,-r*.55],[r*.9,r*.55],[-r*.9,-r*.55],[-r*.9,r*.55]])ell(c,lx+(ly>0?gal:-gal)*(lx>0?1:-1),ly,r*.36,r*.2,'#5b4228');
    ell(c,-r*.15,0,r*1.55,r*.78,'#7a5a3a');ell(c,r*1.5,0,r*.55,r*.34,'#7a5a3a');circ(c,r*1.85,r*.15,r*.1,'#1c1410',.5);
    poly(c,[[r*1.1,-r*.2],[r*.7,-r*.5],[r*.7,r*.5],[r*1.1,r*.2]],'#3f2c1a'); // Mähne
    ell(c,-r*.2,0,r*1.15,r*.82,E.tc);ell(c,-r*.2,0,r*1.15,r*.2,E.tcl); // Satteldecke
    // Reiter
    const tilt=E.sw?-(.8-E.sw)*.5:0;
    c.save();c.rotate(tilt);
    ell(c,0,0,r*.5,r*.8,'#aab1ba');circ(c,r*.2,-r*.85,r*.27,'#8f959d',1);circ(c,r*.2,r*.85,r*.27,'#8f959d',1);
    // Schild links
    poly(c,[[r*.1,-r*1.55],[r*.8,-r*1.2],[r*.8,-r*.5],[r*.1,-r*.3]],E.tcl);line(c,r*.25,-r*1.3,r*.65,-r*.65,1.4,'#f3efe4');
    // Lanze rechts mit Wimpel
    bar(c,-r*.8,r*.8,r*2.9+E.sw*r*.7,r*.8,1.8,'#9a7448');poly(c,[[r*2.5+E.sw*r*.7,r*.8],[r*3.1+E.sw*r*.7,r*.8],[r*2.55+E.sw*r*.7,r*.4]],E.tc);
    circ(c,r*.1,0,r*.46,'#c7ccd3');ell(c,-r*.08,0,r*.46,r*.13,E.tcl);line(c,r*.4,-r*.15,r*.55,-r*.15,1,OUT);
    c.restore();
  }
  ,crossbow(c,u,r,E){
    poly(c,[[-r*.9,-r*.5],[-r*.35,-r*.55],[-r*.4,-r*.1],[-r*.95,-r*.05]],'#6b4f31');for(let i=0;i<3;i++)line(c,-r*.8-i*.3,-r*.35,-r*1.3,-r*.5+i*r*.15,1,'#d8c9a0');
    ell(c,0,0,r*.6,r*.95,'#8a6a3e');ell(c,r*.05,0,r*.4,r*.8,E.tc);line(c,r*.05,-r*.75,r*.05,r*.75,1,E.tcd); // Lederkoller mit Wappenrock
    // Armbrust: Schaft + Bogenarm quer
    bar(c,-r*.1,0,r*1.7,0,2.2,'#6b4f31');bar(c,r*1.25,-r*1,r*1.25,r*1,2.4,'#4a3a28');
    const pull=E.attacking&&u.cd<.6;line(c,r*1.25,-r*1,pull?r*.6:r*1.25,0,.9,'#f1e7cf');line(c,pull?r*.6:r*1.25,0,r*1.25,r*1,.9,'#f1e7cf');
    if(pull||E.sw>.2)bar(c,r*.6,0,r*1.7,0,1.4,'#e5e9ee');
    circ(c,r*.65,r*.45,r*.24,SKIN,1);circ(c,r*.3,-r*.55,r*.24,SKIN,1);
    circ(c,r*.1,0,r*.52,'#8f959d');ell(c,r*.1,0,r*.52,r*.1,'#6a7078');circ(c,r*.3,0,r*.2,SKIN,1); // Eisenhut mit Krempe
  }
  ,musket(c,u,r,E){
    ell(c,0,0,r*.62,r*1.0,E.tc);line(c,r*.0,-r*.6,r*.25,r*.6,1.6,'#f3efe4');line(c,r*.0,r*.6,r*.25,-r*.6,1.6,'#f3efe4'); // Rock mit weißen Kreuzgurten
    // Muskete (Lauf nach vorn)
    const rec=E.sw*r*.35;bar(c,-r*.2-rec,r*.55,r*2.3-rec,r*.55,2,'#4a4a50');bar(c,-r*.45-rec,r*.55,r*.7-rec,r*.55,3.4,'#7a5535');
    if(E.sw>.55){circ(c,r*2.5,r*.55,r*.5*E.sw,'rgba(255,214,120,.9)',.5);circ(c,r*3,r*.55,r*.7*E.sw,'rgba(200,200,200,.5)',.5)} // Mündungsfeuer + Rauch
    circ(c,r*.5,r*.55,r*.25,SKIN,1);circ(c,r*.15,r*.85,r*.25,SKIN,1);
    circ(c,r*.1,0,r*.5,SKIN);poly(c,[[-r*.5,-r*.6],[r*.7,0],[-r*.5,r*.6],[-r*.15,0]],'#2f3238');line(c,-r*.3,-r*.4,r*.5,0,1.2,E.tcl); // Dreispitz
  }
  ,cannon(c,u,r,E){
    const rec=E.sw?E.sw*r*.5:0;
    for(const sd of[-1,1])circ(c,0,sd*r*1.0,r*.55,'#6b4f31');
    for(const sd of[-1,1]){line(c,-r*.55,sd*r*1.0,r*.55,sd*r*1.0,1.2,'#3f2c1a')}
    ell(c,-r*.2,0,r*.8,r*.65,'#7a5a3a');
    bar(c,-r*.6-rec,0,r*2.0-rec,0,r*.78,'#3a3b42');circ(c,r*2.05-rec,0,r*.5,'#2a2b31',1);bar(c,-r*.7-rec,0,-r*.5-rec,0,r*.55,'#2a2b31');
    poly(c,[[-r*.9,-r*.2],[-r*1.7,0],[-r*.9,r*.2]],'#6b4f31'); // Lafettenschwanz
    bar(c,-r*.4,-r*.65,-r*.4,-r*1.6,1.1,'#6b4f31');poly(c,[[-r*.4,-r*1.6],[r*.35,-r*1.4],[-r*.4,-r*1.1]],E.tc);
    if(E.sw>.45){circ(c,r*2.8,0,r*.7*E.sw,'rgba(255,200,110,.9)',.5);circ(c,r*3.5,r*.2,r*1.0*E.sw,'rgba(190,190,195,.55)',.5)}
  }
  ,ram(c,u,r,E){
    const sw=E.sw?E.sw*r*.9:0;
    for(const sx of[-.7,.7])for(const sy of[-1,1])circ(c,sx*r,sy*r*.95,r*.34,'#5b4228',1);
    poly(c,[[-r*1.1,-r*.85],[r*1.1,-r*.85],[r*1.1,r*.85],[-r*1.1,r*.85]],'#8a6a42'); // Rahmen
    poly(c,[[-r*.9,-r*.7],[r*.5,-r*.7],[r*.5,r*.7],[-r*.9,r*.7]],E.tc);for(let i=0;i<4;i++)line(c,-r*.9+i*r*.35,-r*.7,-r*.9+i*r*.35,r*.7,1,E.tcd); // Dach in Teamfarbe
    bar(c,-r*.4+sw,0,r*2.0+sw,0,r*.7,'#6b4f31');poly(c,[[r*1.9+sw,-r*.4],[r*2.4+sw,0],[r*1.9+sw,r*.4]],'#a9b0b8'); // Stamm mit Eisenkopf
  }
  ,catapult(c,u,r,E){
    const k=E.sw?(E.sw>.5?1:E.sw*2):0;
    for(const sy of[-1,1]){circ(c,-r*.3,sy*r*.95,r*.45,'#5b4228',1);circ(c,r*.5,sy*r*.95,r*.45,'#5b4228',1)}
    poly(c,[[-r*1.1,-r*.8],[r*1.0,-r*.8],[r*1.0,r*.8],[-r*1.1,r*.8]],'#8a6a42');bar(c,-r*.6,-r*.8,-r*.6,r*.8,1.6,'#6b4f31');
    // Wurfarm
    const ex=r*(1.6-3.0*k);bar(c,-r*.4,0,ex,0,2.4,'#4a3a28');circ(c,ex,0,r*.34,'#7a5535',1);if(!k)circ(c,ex,0,r*.2,'#8d8a82',.8);
    poly(c,[[r*.7,-r*.8],[r*1.0,-r*.5],[r*.7,-r*.2]],E.tc);
  }
};
function ctx2ring(c,x,y,r,col){c.strokeStyle=col;c.lineWidth=1.6;c.beginPath();c.arc(x,y,r,0,6.283);c.stroke()}

function unit(c,u,r,E){
  c.save();c.lineJoin='round';c.lineCap='round';c.translate(E.x,E.y);c.rotate(E.a);
  (ART_UNIT[u.type]||ART_UNIT.worker)(c,u,r,E);
  // Stufe sichtbar machen: ab II Umhang/Schulterschmuck in Stufenfarbe, ab III Kamm, ab IV Schimmer
  if(E.lvl>=1&&!(ART_UNIT[u.type]===ART_UNIT.cannon||ART_UNIT[u.type]===ART_UNIT.ram||ART_UNIT[u.type]===ART_UNIT.catapult)){
    ell(c,-r*.66,0,r*.18,r*.55,E.lc);
    if(E.lvl>=2){circ(c,r*.02,-r*.98,r*.2,E.lc,1);circ(c,r*.02,r*.98,r*.2,E.lc,1)}
    if(E.lvl>=3)bar(c,-r*.5,0,r*.38,0,1.8,E.lc);
    if(E.lvl>=4){c.strokeStyle=E.lc;c.globalAlpha=.55;c.lineWidth=1.4;c.beginPath();c.arc(0,0,r*1.55,0,6.283);c.stroke();c.globalAlpha=1}
  }
  c.restore();
}
/* Symbole für Ressourcen (SVG, 16x16): gleicher Stil mit dunklem Umriss */
const SV='stroke="#2a2119" stroke-width="1" stroke-linejoin="round"';
const ICONS={
  food:`<circle cx="5.2" cy="10.2" r="3.6" fill="#d23c47" ${SV}/><circle cx="10.8" cy="9.4" r="3.6" fill="#e04b55" ${SV}/><path d="M8 6.4C7.6 3.6 9.6 2 12.4 2c.2 2.6-1.6 4.4-4.4 4.4z" fill="#62ab4a" ${SV}/><circle cx="4" cy="9" r=".9" fill="#fff" opacity=".7"/><circle cx="9.7" cy="8.2" r=".9" fill="#fff" opacity=".7"/>`,
  wood:`<circle cx="4.6" cy="11.4" r="3.5" fill="#b27a3e" ${SV}/><circle cx="11.4" cy="11.4" r="3.5" fill="#b27a3e" ${SV}/><circle cx="8" cy="5.2" r="3.5" fill="#b27a3e" ${SV}/><circle cx="4.6" cy="11.4" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/><circle cx="11.4" cy="11.4" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/><circle cx="8" cy="5.2" r="1.7" fill="#e3b97a" stroke="#6b4a2b" stroke-width=".8"/>`,
  stone:`<polygon points="1.6,12 3.6,6 8.6,2.6 14,6.6 13.2,12.6 7.4,14.4" fill="#aeaaa0" ${SV}/><polygon points="3.6,6 8.6,2.6 14,6.6 8.8,8.6" fill="#dcd8cd" ${SV}/><polyline points="8.8,8.6 7.4,14.4" fill="none" stroke="#2a2119" stroke-width=".8"/>`,
  iron:`<polygon points="2.6,7 13.4,7 15,12.6 1,12.6" fill="#65738a" ${SV}/><polygon points="2.6,7 13.4,7 12.2,4 3.8,4" fill="#a4b2c6" ${SV}/><circle cx="8" cy="9.8" r="1.1" fill="#f0903a"/>`,
  pop:`<circle cx="8" cy="4.8" r="3" fill="#e8c29a" ${SV}/><path d="M1.8 15c0-4.4 2.6-6 6.2-6s6.2 1.6 6.2 6z" fill="#5f8fd3" ${SV}/>`
};
const icon=n=>`<svg class="ic ic-${n}" viewBox="0 0 16 16" aria-hidden="true">${ICONS[n]||''}</svg>`;
/* ---------------- Gebäude (Draufsicht, gleicher Stil) ----------------
   E: {m: Materialfarben der Epoche, tc/tcd/tcl: Teamfarben, t: Zeit, ep: Epoche} */
function flag(c,x,y,len,col,t,seed){c.strokeStyle=OUT;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-len);c.stroke();c.strokeStyle='#cbb88f';c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-len);c.stroke();
  const w=Math.sin(t*3+seed)*2.2;poly(c,[[x,y-len],[x+len*.75,y-len+3+w],[x+len*.6,y-len*.62+w],[x,y-len*.55]],col)}
function rrect(c,x,y,w,h,fill,rad){c.fillStyle=fill;c.beginPath();c.roundRect?c.roundRect(x,y,w,h,rad||2):c.rect(x,y,w,h);c.fill();c.lineWidth=1.3;c.strokeStyle=OUT;c.stroke()}
function crenel(c,r,n,col){c.fillStyle=col;for(let i=0;i<n;i++){const a=i/n*6.283;c.fillRect(Math.cos(a)*r-2.2,Math.sin(a)*r-2.2,4.4,4.4)}}
function bld(c,b,E){
  const r=b.r,m=E.m,seed=b.id||0;
  c.save();c.translate(b.x,b.y);c.lineJoin='round';c.lineCap='round';
  switch(b.type){
  case'hq':{ // Siedlungshalle mit Ringmauer
    c.fillStyle=m.wall;c.beginPath();c.arc(0,0,r,0,6.283);c.fill();c.lineWidth=1.4;c.strokeStyle=OUT;c.stroke();
    if(E.ep>=2)crenel(c,r-3,24,m.line);else{c.fillStyle=m.line;for(let i=0;i<28;i++){const a=i/28*6.283;c.beginPath();c.arc(Math.cos(a)*(r-3),Math.sin(a)*(r-3),2.6,0,6.283);c.fill()}}
    if(E.ep>=3)for(let i=0;i<4;i++){const a=i*1.5708+.785;circ(c,Math.cos(a)*r*.92,Math.sin(a)*r*.92,r*.17,m.roof)}
    c.fillStyle=m.roof;c.beginPath();c.arc(0,0,r*.64,0,6.283);c.fill();c.stroke();
    c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1;for(let i=0;i<10;i++){const a=i/10*6.283;c.beginPath();c.moveTo(Math.cos(a)*r*.2,Math.sin(a)*r*.2);c.lineTo(Math.cos(a)*r*.64,Math.sin(a)*r*.64);c.stroke()}
    c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.moveTo(0,0);c.arc(0,0,r*.64,3.5,4.9);c.closePath();c.fill();
    circ(c,0,0,r*.2,E.tc);shine(c,-r*.06,-r*.06,r*.07);flag(c,r*.15,-r*.1,r*.62,E.tc,E.t,seed);break}
  case'house':{c.rotate(.25);const w=r*2,h=r*1.7;
    rrect(c,-r,-h/2,w,h,m.wall,2);c.fillStyle=m.roof;c.beginPath();c.rect(-r*.92,-h/2+2,w-r*.16,h-4);c.fill();c.strokeStyle=OUT;c.lineWidth=1.2;c.stroke();
    c.fillStyle='rgba(255,255,255,.18)';c.fillRect(-r*.92,-h/2+2,w-r*.16,(h-4)/2);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(-r*.92,0,w-r*.16,(h-4)/2-.5);
    line(c,-r*.92,0,r*.92,0,1.6,'rgba(0,0,0,.5)');c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(-r*.92+i*r*.3,-h/2+2);c.lineTo(-r*.92+i*r*.3,h/2-2);c.stroke()}
    if(E.ep>=1){c.fillStyle=m.line;c.fillRect(r*.45,-h*.38,r*.3,r*.3);c.strokeStyle=OUT;c.strokeRect(r*.45,-h*.38,r*.3,r*.3)}
    rrect(c,-r*.2,h/2-3,r*.4,5,E.tc,1);break}
  case'store':{rrect(c,-r,-r*.78,2*r,1.56*r,m.wall,2);c.fillStyle=m.roof;c.fillRect(-r*.92,-r*.7,r*1.84,r*.62);c.strokeStyle=OUT;c.lineWidth=1;c.strokeRect(-r*.92,-r*.7,r*1.84,r*.62);
    c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.92,-r*.7,r*1.84,r*.3);
    [[-.55,.28],[0,.28],[.55,.28],[-.28,.62-.1],[.28,.62-.1]].forEach(([x,y],i)=>{rrect(c,x*r-5,y*r-4,10,9,i%2?'#a9834f':'#8d6a3e',1);line(c,x*r-5,y*r,x*r+5,y*r,.8,'rgba(0,0,0,.45)')});
    rrect(c,-r,-r*.78,5,1.56*r,E.tc,1);break}
  case'barracks':{rrect(c,-r,-r,2*r,2*r,m.wall,2);c.fillStyle=m.line;for(let i=-3;i<=3;i++){c.fillRect(i*r*.28-2,-r-2,4,4);c.fillRect(i*r*.28-2,r-2,4,4)}
    rrect(c,-r*.72,-r*.72,r*1.44,r*1.44,m.roof,2);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.72,-r*.72,r*1.44,r*.7);line(c,-r*.72,0,r*.72,0,1.6,'rgba(0,0,0,.5)');
    // Waffenständer
    for(let i=0;i<3;i++){line(c,-r*.4+i*r*.4,r*.2,-r*.4+i*r*.4,r*.58,1.6,'#6b4f31');line(c,-r*.46+i*r*.4,r*.2,-r*.34+i*r*.4,r*.2,1.2,'#c7ccd3')}
    flag(c,r*.85,-r*.85,r*.9,E.tc,E.t,seed);break}
  case'tower':{circ(c,0,0,r,m.wall);crenel(c,r-2,10,m.line);circ(c,0,0,r*.62,m.roof);c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.moveTo(0,0);c.arc(0,0,r*.62,3.6,5);c.closePath();c.fill();
    for(let i=0;i<4;i++){const a=i*1.5708+.78;c.fillStyle='#1d1812';c.fillRect(Math.cos(a)*r*.78-1,Math.sin(a)*r*.78-1,2.4,2.4)}
    circ(c,0,0,r*.28,E.tc);flag(c,0,-2,r*1.3,E.tc,E.t,seed);break}
  case'castle':{rrect(c,-r,-r,2*r,2*r,m.wall,3);c.fillStyle=m.line;for(let i=-4;i<=4;i++){c.fillRect(i*r*.22-2,-r-3,4,5);c.fillRect(i*r*.22-2,r-2,4,5);c.fillRect(-r-3,i*r*.22-2,5,4);c.fillRect(r-2,i*r*.22-2,5,4)}
    rrect(c,-r*.62,-r*.62,r*1.24,r*1.24,m.roof,2);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.62,-r*.62,r*1.24,r*.62);line(c,-r*.62,0,r*.62,0,1.4,'rgba(0,0,0,.45)');
    for(const[cx,cy]of[[-r,-r],[r,-r],[-r,r],[r,r]]){circ(c,cx,cy,r*.34,m.wall);circ(c,cx,cy,r*.2,m.roof);shine(c,cx-2,cy-2,2)}
    circ(c,0,0,r*.26,E.tc);flag(c,0,-2,r*1.1,E.tc,E.t,seed);break}
  case'harbor':{c.rotate(b.ang||0);
    c.fillStyle='#8a6a42';c.fillRect(r*.35,-r*.34,r*1.25,r*.68);c.strokeStyle=OUT;c.lineWidth=1.2;c.strokeRect(r*.35,-r*.34,r*1.25,r*.68);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;for(let i=1;i<6;i++){c.beginPath();c.moveTo(r*.35+i*r*.21,-r*.34);c.lineTo(r*.35+i*r*.21,r*.34);c.stroke()}
    for(const[px,py]of[[r*1.6,-r*.34],[r*1.6,r*.34],[r*1.0,-r*.34],[r*1.0,r*.34]])circ(c,px,py,2.6,'#5b4228',.9);
    rrect(c,-r,-r*.72,r*1.5,r*1.44,m.wall,2);c.fillStyle=m.roof;c.fillRect(-r*.92,-r*.64,r*1.34,r*.6);c.strokeStyle=OUT;c.strokeRect(-r*.92,-r*.64,r*1.34,r*.6);c.fillStyle='rgba(255,255,255,.16)';c.fillRect(-r*.92,-r*.64,r*1.34,r*.28);
    circ(c,r*1.05,r*.55,r*.16,'#cbb88f',.8);circ(c,-r*.25,r*.32,r*.2,E.tc);
    c.restore();c.save();c.translate(b.x,b.y);flag(c,-r*.2,-r*.55,r*.7,E.tc,E.t,seed);break}
  case'wall':{circ(c,0,0,r,m.wall);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-r*.8,0);c.lineTo(r*.8,0);c.moveTo(0,-r*.8);c.lineTo(0,0);c.moveTo(-r*.4,0);c.lineTo(-r*.4,r*.8);c.moveTo(r*.4,0);c.lineTo(r*.4,r*.8);c.stroke();shine(c,-r*.3,-r*.35,r*.25);break}
  default:circ(c,0,0,r,m.wall)}
  c.restore();
}
return{tree,bush,rock,unit,icon,bld};
})();
