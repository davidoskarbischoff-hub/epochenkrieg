let startK=1;
/* Epochenkrieg – Entitäten (Einheiten, Gebäude, Ressourcen) und Kartengenerierung.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- entities ---------- */
function reg(e){G.ents.push(e);G.byId.set(e.id,e);if((e.kind==='bld'&&!BLDS[e.type].passable)||(e.kind==='node'&&!e.sea&&e.type!=='field'))navStamp(e,1);return e}
function addUnit(type,team,x,y,fid){const d=UNITS[type],lvl=G.epoch[team],hp=unitHp(team,type,lvl);return reg({id:fid!==undefined?fid:G.nid++,kind:'unit',type,team,x,y,r:d.r,lvl,hp,maxHp:hp,state:'idle',cd:0,carry:0,ctype:null,rtype:null,tid:null,dest:null,amove:null,fa:team===0?-1.57:1.57})}
function wallNeighbor(b){let best=null,bd=48;for(const o of G.ents)if(o!==b&&!o.dead&&o.kind==='bld'&&(o.type==='wall'||o.type==='gate')&&o.team===b.team){const d=Math.hypot(o.x-b.x,o.y-b.y);if(d<bd){bd=d;best=o}}return best}
function addBld(type,team,x,y,built,fid){const d=BLDS[type],lvl=G.epoch[team],mh=Math.round(d.hp*LVL.bhp[lvl]*(1+(G.nfx?G.nfx[team].bhp:0)));let r0=d.r;if(type==='mine')for(const n of G.ents)if(n.kind==='node'&&!n.dead&&MINE_RT[n.rt]==='mine'&&Math.hypot(n.x-x,n.y-y)<2){r0=Math.max(r0,n.r+2);var ore=n.rt} /* Mine auf dem Vorkommen: so groß wie der Felsen */
  const b=reg({id:fid!==undefined?fid:G.nid++,kind:'bld',type,team,x,y,r:r0,lvl,maxHp:mh,hp:built?mh:1,built,prog:built?1:0,queue:[],rally:null,cd:0});if(type==='mine'&&typeof ore!=='undefined'&&ore)b.ore=ore;if(type==='wall'||type==='gate'){const n=wallNeighbor(b);if(n){const a=Math.atan2(n.y-b.y,n.x-b.x);b.ang=a;if(n.type==='wall'&&n.ang===undefined)n.ang=a}}return b}
function addAnimal(type,x,y,fid){const d=ANIMALS[type];return reg({id:fid!==undefined?fid:G.nid++,kind:'animal',type,team:-1,x,y,r:d.r,hp:d.hp,maxHp:d.hp,lvl:0,state:'idle',cd:0,home:{x,y},fa:Math.random()*6.283,wt:Math.random()*4})}
function addNode(type,x,y,sz){const d=NODES[type];sz=sz||1;return reg({id:G.nid++,kind:'node',type,team:-1,x,y,sz,r:Math.round(d.r*Math.sqrt(sz)),rt:d.rt,sea:!!d.sea,amount:Math.round(d.amt*sz),maxAmt:Math.round(d.amt*sz),regen:d.regen||0,seed:Math.random()})}
const rn=r=>tr(RN[r]);
function get(id){const e=G.byId.get(id);return e&&!e.dead?e:null}
function nameOf(e){return e.kind==='animal'?tr(ANIMALS[e.type].name):e.kind==='unit'?tr(UNAMES[e.type]?UNAMES[e.type][Math.min(5,e.lvl||0)]:UNITS[e.type].name):e.kind==='bld'?tr(BLDS[e.type].name):tr(NODES[e.type].name)}

/* ---------- map ---------- */
/* Ein Platz taugt nur, wenn rundherum (Abstand r) Land des Hauptlandes ist */
function landSpot(x,y,r){if(x<24||y<24||x>W-24||y>H-24)return false;for(let k=0;k<8;k++){const a=k*.785,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(px<10||py<10||px>W-10||py>H-10||!onLand(px,py))return false}const c=Math.max(0,Math.min(TH-1,(y/TG)|0))*TW+Math.max(0,Math.min(TW-1,(x/TG)|0));return MAINLAND[c]===1}
function genMap(seed){
  const R=mulberry(seed);
  const okSpot=landSpot;
  // Basis A: auf der Diagonale, möglichst nah an der Küste (Hafen soll früh erreichbar sein)
  const Ld=Math.hypot(W,H),nx=H/Ld,ny=W/Ld;let A=null;
  for(let pp=700;pp>=0&&!A;pp-=20){const c={x:W/2+(.17*W+nx*pp-W/2)*startK,y:H/2+(.83*H+ny*pp-H/2)*startK};if(okSpot(c.x,c.y,175))A=c}
  if(!A)A={x:W/2+(.17*W-W/2)*startK,y:H/2+(.83*H-H/2)*startK};
  const bases=[{x:A.x,y:A.y,s:1},{x:W-A.x,y:H-A.y,s:-1}];
  genRelief(A,bases[1],seed,curMap);applyPlayRect(playF);navInit(); // Hügel, Plateaus, Klippen
  if(MAPS[curMap]&&MAPS[curMap].cliff){carveCoast(A.x,A.y,380);carveCoast(W-A.x,H-A.y,380);navInit()}
  const GAP={tree:15,bush:12,stone:14,iron:14,gold:14,oil:16,fish:10,dolphin:14,whale:20};
  const free=(x,y,r,type)=>!G.ents.some(e=>Math.hypot(e.x-x,e.y-y)<e.r+r+GAP[type]);
  const ORE=new Set(['stone','iron','gold','oil']);let szForce=0;const szFor=type=>{if(!ORE.has(type))return 1;if(type==='oil')return 1.7;/* Ölfelder: wenige, dafür grosse */if(szForce)return szForce;const q=R();return q<.4?.5:q<.8?1:1.7};
  const cluster=(type,cx,cy,n,spread,okFn)=>{for(let i=0;i<n;i++){for(let k=0;k<20;k++){const a=R()*6.283,d=Math.sqrt(R())*spread;const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,sz=szFor(type),r=Math.round(NODES[type].r*Math.sqrt(sz));if(!okFn(x,y,r))continue;if(!free(x,y,r,type))continue;addNode(type,x,y,sz);break}}};
  const landOk=(x,y,r)=>okSpot(x,y,r+4);
  const waterOk={fish:(x,y,r)=>x>40&&y>40&&x<W-40&&y<H-40&&terrAt(x,y)===1&&terrAt(x+r,y)===1&&terrAt(x-r,y)===1&&terrAt(x,y+r)===1&&terrAt(x,y-r)===1,
    dolphin:(x,y,r)=>terrAt(x,y)===0&&terrAt(x+r,y)<=1&&terrAt(x-r,y)<=1&&terrAt(x,y+r)<=1&&terrAt(x,y-r)<=1&&x>40&&y>40&&x<W-40&&y<H-40,
    deep:(x,y,r)=>terrAt(x,y)===0&&terrAt(x+r,y)===0&&terrAt(x-r,y)===0&&terrAt(x,y+r)===0&&terrAt(x,y-r)===0&&x>40&&y>40&&x<W-40&&y<H-40,
    whale:(x,y,r)=>[[0,0],[r,0],[-r,0],[0,r],[0,-r],[r,r],[-r,-r]].every(([a,b])=>terrAt(x+a,y+b)===0)&&x>60&&y>60&&x<W-60&&y<H-60};
  // Spiegeln: beide Seiten bekommen dieselben Vorkommen
  const mirror=(n0)=>{G.ents.slice(n0).forEach(e=>{if(e.kind!=='node')return;const mx=W-e.x,my=H-e.y;if(!G.ents.some(o=>Math.hypot(o.x-mx,o.y-my)<o.r+e.r+3))addNode(e.type,mx,my,e.sz)})};
  addBld('hq',0,bases[0].x,bases[0].y,true);addBld('hq',1,bases[1].x,bases[1].y,true);
  bases.forEach((b,i)=>{for(let k=0;k<4;k++)addUnit('worker',i,b.x+b.s*(k*18-27),b.y+b.s*58)});
  // Startvorkommen rund um Basis A (zufällige Richtung, gültiges Land), danach gespiegelt auf Basis B
  const near=(type,n,spread,dmin,dmax,okFn)=>{for(let k=0;k<60;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!okFn(x,y,spread*.5))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,okFn);if(G.ents.length-n0>=Math.min(n,3)){mirror(n0);return}}};
  // Die Wälder kommen erst am Schluss (genForests) und weichen allem anderen aus
  near('bush',8,52,110,200,landOk);near('bush',6,44,290,430,landOk);szForce=1;near('stone',1,40,200,285,landOk);szForce=.5;near('iron',1,40,265,365,landOk);szForce=0;near('iron',1,40,520,720,landOk);near('stone',1,40,480,680,landOk);near('iron',1,62,800,1150,landOk);near('stone',1,62,760,1100,landOk);
  // Fische in Küstennähe von Basis A
  const nearWater=(type,n,spread,dmin,dmax)=>{for(let k=0;k<200;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!waterOk[type](x,y,spread*.4))continue;const n0=G.ents.length;cluster(type,x,y,n,spread,waterOk[type]);if(G.ents.length>n0){mirror(n0);return}}};
  nearWater('fish',2,90,180,480);nearWater('fish',2,90,260,620);nearWater('fish',2,100,300,760);nearWater('dolphin',2,80,350,900);
  // gespiegelte Mitte
  const feats=[];
  const cnt=n=>Math.max(1,Math.round(n*Math.sqrt(AREA)*1.1*playF*playF));
  for(let i=0;i<cnt(4);i++)feats.push(['stone',1,74,landOk]);
  for(let i=0;i<cnt(3);i++)feats.push(['bush',5,44,landOk]);
  for(let i=0;i<cnt(3);i++)feats.push(['iron',1,72,landOk]);
  for(let i=0;i<cnt(2);i++)feats.push(['oil',1,40,landOk]);
  for(let i=0;i<cnt(2);i++)feats.push(['gold',1,62,landOk]);
  for(let i=0;i<cnt(14);i++)feats.push(['fish',2+Math.floor(R()*2),120,waterOk.fish]);
  for(let i=0;i<cnt(8);i++)feats.push(['fish',1+Math.floor(R()*2),140,waterOk.deep]); /* kleine Schwärme auch draussen im tiefen Wasser */
  for(let i=0;i<cnt(6);i++)feats.push(['dolphin',1+Math.floor(R()*2),90,waterOk.dolphin]);
  for(let i=0;i<cnt(4);i++)feats.push(['whale',1+Math.floor(R()*2),70,waterOk.whale]);
  for(const [t,n,sp,okFn] of feats){
    let x,y,ok=false;
    for(let k=0;k<200&&!ok;k++){x=150+R()*(W-300);y=150+R()*(H-300);ok=okFn(x,y,sp*.5)&&bases.every(b=>Math.hypot(b.x-x,b.y-y)>(NODES[t].sea?150:520))&&Math.hypot(x-W/2,y-H/2)>90}
    if(!ok)continue;
    const n0=G.ents.length;cluster(t,x,y,n,sp,okFn);mirror(n0);
  }
  genForests(R,bases,A,cnt);
  spawnAnimals(R,bases,A);
}
/* ---------- Wälder ----------
   Dichte Wälder: Die Bäume stehen auf einem leicht verwackelten Dreiecksgitter mit FOREST_S px Abstand. Jeder Baum sperrt in der
   Wegfindung die Felder bis r+5 = 16 px um sich, und ein Arbeiter (r 4) passt erst ab 30 px Baumabstand durch – so kommt niemand
   durch den Wald, man muss aussen herum oder sich einen Weg freischlagen (gefällt werden nur Randbäume, siehe nodeOpen in nav.js).
   Formen: Fleck (mehrere Ellipsen) oder Band (gebogener Streifen), mit welligem Rand; grosse Wälder bekommen eine Schneise.
   Alles punktsymmetrisch. Danach prüft forestPass, ob jede Basis noch alles erreicht, was ohne Wald erreichbar war,
   und schlägt sonst eine Gasse (mindestens 3 Felder breit) frei – auf beiden Seiten gleich. */
const FOREST_S=21;
function genForests(R,bases,A,cnt){
  const pre=bases.map(b=>navReach(b));
  const nz=vnoise(R,48,32),tr0=NODES.tree.r;
  // Land rundherum und zu Fuss von einer Basis erreichbar (auch über flaches Wasser – bei Seen ist das "Hauptland" sonst zu klein)
  const walk=(x,y,r)=>{if(x<24||y<24||x>W-24||y>H-24)return false;for(let k=0;k<8;k++){const a=k*.785;if(!onLand(x+Math.cos(a)*r,y+Math.sin(a)*r))return false}const i=navCell(x,y);return pre[0][i]===1||pre[1][i]===1};
  const others=G.ents.filter(e=>e.kind==='bld'||(e.kind==='node'&&!e.sea)); // allem, was schon steht, weicht der Wald aus
  const CS=32,grid=new Map(),gk=(gx,gy)=>gx*1024+gy;
  const treeNear=(x,y,d)=>{const cx=(x/CS)|0,cy=(y/CS)|0,k=Math.ceil(d/CS);for(let gx=cx-k;gx<=cx+k;gx++)for(let gy=cy-k;gy<=cy+k;gy++){const l=grid.get(gk(gx,gy));if(l)for(const t of l)if(Math.hypot(t.x-x,t.y-y)<d)return true}return false};
  const addT=(x,y,pine)=>{const e=addNode('tree',x,y);e.seed=pine?R()*.5:.5+R()*.5;const k=gk((x/CS)|0,(y/CS)|0);(grid.get(k)||grid.set(k,[]).get(k)).push(e)};
  // schmale Landstellen (Furten, Landbrücken, Pässe) bleiben frei: Land muss in mindestens einer von zwei Gegenrichtungen weit reichen
  const narrow=(x,y)=>{for(let k=0;k<4;k++){const a=k*.785,c=Math.cos(a),s=Math.sin(a);let h=0;for(const sg of[1,-1])for(let d=40;d<=120;d+=20)if(!onLand(x+c*d*sg,y+s*d*sg)){h++;break}if(h===2)return true}return false};
  const spotOk=(x,y,mb)=>{if(!walk(x,y,tr0+20)||narrow(x,y))return false;for(const b of bases)if(Math.hypot(b.x-x,b.y-y)<mb)return false;
    for(const o of others){const g=o.kind==='bld'?40:o.type==='bush'||o.type==='field'?14:42;if(Math.abs(o.x-x)<o.r+tr0+g&&Math.hypot(o.x-x,o.y-y)<o.r+tr0+g)return false}
    return !treeNear(x,y,13)};
  // Umriss eines Waldes: inside(x,y) und Ausdehnung
  const shape=(cx,cy,size,band)=>{
    if(!band){const el=[],n=2+((R()*3)|0);for(let i=0;i<n;i++){const a=R()*6.283,d=i?size*(.35+R()*.45):0;el.push({x:cx+Math.cos(a)*d,y:cy+Math.sin(a)*d,a:R()*3.142,rx:size*(i?.5+R()*.35:.8+R()*.25),ry:size*(i?.4+R()*.3:.55+R()*.3)})}
      return{ext:size*2,cut:null,in:(x,y)=>{const w=1+(nz(x,y)-.5)*.6;for(const q of el){const dx=x-q.x,dy=y-q.y,c=Math.cos(q.a),s=Math.sin(q.a),u=(dx*c+dy*s)/q.rx,v=(dy*c-dx*s)/q.ry;if(u*u+v*v<w*w)return true}return false}}}
    const a=R()*6.283,L=size*(1.5+R()*.8),bend=(R()-.5)*size*1.6,hw=size*(.34+R()*.14),p0={x:cx-Math.cos(a)*L,y:cy-Math.sin(a)*L},p2={x:cx+Math.cos(a)*L,y:cy+Math.sin(a)*L},p1={x:cx-Math.sin(a)*bend,y:cy+Math.cos(a)*bend},pts=[];
    for(let i=0;i<=28;i++){const t=i/28,m=1-t;pts.push({x:m*m*p0.x+2*m*t*p1.x+t*t*p2.x,y:m*m*p0.y+2*m*t*p1.y+t*t*p2.y,t})}
    const ct=pts[10+((R()*9)|0)];
    return{ext:L+hw+Math.abs(bend),cut:{x:ct.x,y:ct.y,a:a+1.571},in:(x,y)=>{let bd=1e9,bt=0;for(const p of pts){const d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);if(d<bd){bd=d;bt=p.t}}return Math.sqrt(bd)<hw*(.4+.6*Math.sqrt(Math.sin(Math.PI*bt)))*(1+(nz(x,y)-.5)*.7)}}};
  // Wald setzen (mit Spiegelbild), wenn genug Bäume Platz finden
  const forest=(cx,cy,size,band,minN,mb)=>{ /* mb = Mindestabstand der Bäume zu den Basen */const sh=shape(cx,cy,size,band),ang=R()*1.047,c=Math.cos(ang),s=Math.sin(ang),S=FOREST_S,rh=S*.866,E=sh.ext;let cand=[];
    for(let j=-Math.ceil(E/rh);j<=Math.ceil(E/rh);j++)for(let i=-Math.ceil(E/S)-1;i<=Math.ceil(E/S)+1;i++){const lx=i*S+(j&1?S/2:0)+(R()-.5)*5,ly=j*rh+(R()-.5)*5,x=cx+lx*c-ly*s,y=cy+lx*s+ly*c;if(sh.in(x,y))cand.push({x,y})}
    // grosse Wälder: Schneise quer hindurch (Baummitten mindestens 31 px von der Linie = 3 Felder freier Weg)
    if(cand.length>90){const q=sh.cut||{x:cx+(R()-.5)*size*.4,y:cy+(R()-.5)*size*.4,a:R()*3.142},sa=Math.sin(q.a),ca=Math.cos(q.a);cand=cand.filter(p=>Math.abs((p.x-q.x)*sa-(p.y-q.y)*ca)>31)}
    cand=cand.filter(p=>spotOk(p.x,p.y,mb)&&spotOk(W-p.x,H-p.y,mb));if(cand.length<minN)return false;
    const pf=.15+R()*.7;
    for(const p of cand){if(!spotOk(p.x,p.y,mb))continue;const mx=W-p.x,my=H-p.y,self=Math.hypot(mx-p.x,my-p.y)<S;if(!self&&!spotOk(mx,my,mb))continue;const pine=R()<pf;addT(p.x,p.y,pine);if(!self)addT(mx,my,pine)}
    return true};
  // nahe der Basis A (gespiegelt auf B): ein grosser Wald, ein zweiter etwas weiter weg, ein Wäldchen
  const nearF=(size,band,dmin,dmax,minN)=>{for(let k=0;k<60;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!walk(x,y,30))continue;if(forest(x,y,size,band,minN,175))return}};
  nearF(64,false,250,320,34);nearF(52,R()<.5,380,500,24);nearF(34,false,430,560,10);
  // weiter draussen: grosse Wälder (Flecken und Bänder) und kleine Haine
  const far=(size,band,minN)=>{for(let k=0;k<80;k++){const x=150+R()*(W-300),y=150+R()*(H-300);if(!walk(x,y,40)||bases.some(b=>Math.hypot(b.x-x,b.y-y)<700)||Math.hypot(x-W/2,y-H/2)<90)continue;if(forest(x,y,size,band,minN,600))return}};
  for(let i=0;i<cnt(6);i++)far(72+R()*48,R()<.5,30);
  for(let i=0;i<cnt(6);i++)far(30+R()*16,R()<.3,8);
  forestPass(bases,pre);
}
/* Freie Felder, die eine Basis zu Fuss erreicht (4er-Nachbarschaft wie die Wegsuche ohne Eckenschneiden) */
function navStart(b){let best=-1,bd=1e9;const c=navCell(b.x,b.y),cx=c%NW,cy=(c/NW)|0;for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=NW||y>=NH)continue;const i=y*NW+x;if(!navOpen(i,false))continue;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}}return best}
function navReach(b){const m=new Uint8Array(NW*NH),s=navStart(b);if(s<0)return m;const st=[s];m[s]=1;
  while(st.length){const i=st.pop(),x=i%NW;for(const j of[x>0?i-1:-1,x<NW-1?i+1:-1,i>=NW?i-NW:-1,i+NW<NW*NH?i+NW:-1])if(j>=0&&!m[j]&&navOpen(j,false)){m[j]=1;st.push(j)}}
  return m}
/* Durchgänge sichern: Was eine Basis vor dem Wald erreichen konnte (pre), muss sie danach auch erreichen. Sonst den billigsten Weg
   durch den Wald suchen (Baumfeld kostet 8, freies Feld 1) und entlang des Weges Bäume entfernen – gespiegelt auf beiden Seiten. */
function forestPass(bases,pre){
  const N=NW*NH,hard=new Uint8Array(N);
  for(const e of G.ents){if(e.dead||!((e.kind==='bld'&&!BLDS[e.type].passable)||(e.kind==='node'&&!e.sea&&e.type!=='tree')))continue;const r=e.r+5;
    for(let y=Math.max(0,Math.floor((e.y-r)/NS));y<=Math.min(NH-1,Math.floor((e.y+r)/NS));y++)for(let x=Math.max(0,Math.floor((e.x-r)/NS));x<=Math.min(NW-1,Math.floor((e.x+r)/NS));x++){const dx=(x+.5)*NS-e.x,dy=(y+.5)*NS-e.y;if(dx*dx+dy*dy<=r*r)hard[y*NW+x]=1}}
  const trees=G.ents.filter(e=>e.kind==='node'&&e.type==='tree'),CS=40,grid=new Map();for(const t of trees){const k=((t.x/CS)|0)*1024+((t.y/CS)|0);(grid.get(k)||grid.set(k,[]).get(k)).push(t)}
  const cutAt=(x,y,rad)=>{let n=0;const cx=(x/CS)|0,cy=(y/CS)|0,k=Math.ceil(rad/CS);for(let gx=cx-k;gx<=cx+k;gx++)for(let gy=cy-k;gy<=cy+k;gy++){const l=grid.get(gx*1024+gy);if(l)for(const t of l)if(!t.dead&&Math.hypot(t.x-x,t.y-y)<rad){t.dead=true;navStamp(t,-1);n++}}return n};
  const skip=new Set();let cutN=0;
  for(let it=0;it<24;it++){let worked=false;
    for(let bi=0;bi<bases.length&&!worked;bi++){const now=navReach(bases[bi]),P=pre[bi];
      // abgeschnittene freie Felder in Gruppen einteilen
      const comp=new Int32Array(N).fill(-1),sizes=[];
      for(let i=0;i<N;i++){if(!P[i]||now[i]||comp[i]>=0||!navOpen(i,false))continue;const id=sizes.length,st=[i];comp[i]=id;let sz=0;
        while(st.length){const c=st.pop(),x=c%NW;sz++;for(const j of[x>0?c-1:-1,x<NW-1?c+1:-1,c>=NW?c-NW:-1,c+NW<N?c+NW:-1])if(j>=0&&comp[j]<0&&P[j]&&!now[j]&&navOpen(j,false)){comp[j]=id;st.push(j)}}sizes.push(sz)}
      // wichtig: grössere Gebiete und alles, was an einem Vorkommen (Busch, Stein, Erz) oder einer Basis liegt
      const imp=new Set();sizes.forEach((s,id)=>{if(s>=12)imp.add(id)});
      for(const e of G.ents){if(e.dead||e.kind==='unit'||e.kind==='animal'||e.sea||e.type==='tree')continue;const r=e.r+16;
        for(let y=Math.max(0,Math.floor((e.y-r)/NS));y<=Math.min(NH-1,Math.floor((e.y+r)/NS));y++)for(let x=Math.max(0,Math.floor((e.x-r)/NS));x<=Math.min(NW-1,Math.floor((e.x+r)/NS));x++){const c=comp[y*NW+x];if(c>=0)imp.add(c)}}
      const tgts=[...imp].filter(id=>!skip.has(bi+':'+sizes[id]+':'+id)).sort((a,b)=>sizes[b]-sizes[a]);
      for(const tgt of tgts){
        // billigster Weg vom abgeschnittenen Gebiet zum erreichbaren Gebiet (Dijkstra mit kleinem Heap)
        const dist=new Float32Array(N).fill(1e9),par=new Int32Array(N).fill(-1),hp=[],hf=[];
        const push=(i,f)=>{hp.push(i);hf.push(f);let k=hp.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[hp[p],hp[k]]=[hp[k],hp[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
        const pop=()=>{const r=hp[0],lh=hp.pop(),lf=hf.pop();if(hp.length){hp[0]=lh;hf[0]=lf;let k=0;for(;;){const l=2*k+1,rr=l+1;let m=k;if(l<hp.length&&hf[l]<hf[m])m=l;if(rr<hp.length&&hf[rr]<hf[m])m=rr;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return r};
        for(let i=0;i<N;i++)if(comp[i]===tgt){dist[i]=0;push(i,0)}
        let end=-1;
        while(hp.length){const f=hf[0],i=pop();if(f>dist[i])continue;if(now[i]){end=i;break}const x=i%NW;
          for(const j of[x>0?i-1:-1,x<NW-1?i+1:-1,i>=NW?i-NW:-1,i+NW<N?i+NW:-1]){if(j<0||hard[j]||!(navT[j]===1||navT[j]===2))continue;const c=dist[i]+(navDyn[j]?8:1);if(c<dist[j]){dist[j]=c;par[j]=i;push(j,c)}}}
        if(end<0){skip.add(bi+':'+sizes[tgt]+':'+tgt);continue}
        // Bäume nur dort fällen, wo der Weg durch den Wald führt (31 px um jedes zugewachsene Feld = Gasse von 3 Feldern)
        const blk=[];for(let i=end;i>=0;i=par[i])if(navDyn[i])blk.push(i);
        for(const i of blk){const x=(i%NW+.5)*NS,y=(((i/NW)|0)+.5)*NS;cutN+=cutAt(x,y,31)+cutAt(W-x,H-y,31)}
        worked=true;break}}
    if(!worked)break}
  if(cutN||trees.some(t=>t.dead)){for(const t of trees)if(t.dead)G.byId.delete(t.id);G.ents=G.ents.filter(e=>!e.dead)}
  G.forestCut=cutN}
/* Wilde Tiere: Rehe in der Nähe der Startgebiete, Wölfe in Wäldern, Bären weit draußen, Tiger in der Mitte. Immer punktsymmetrisch, damit beide Seiten gleich viele haben. */
function wildAmt(){try{return localStorage.getItem('ek-wild')||'normal'}catch(_){return'normal'}}
function spawnAnimals(R,bases,A){
  const wm={none:0,half:.25,normal:.5,double:1}[wildAmt()]??.5,nn=n=>Math.round(n*wm); /* Wildtiere: Menge aus den Optionen */
  const treesNear=(x,y,r)=>{let n=0;for(const e of G.ents)if(e.kind==='node'&&e.type==='tree'&&Math.hypot(e.x-x,e.y-y)<r)n++;return n};
  const good=(x,y)=>{if(x<90||y<90||x>W-90||y>H-90)return false;for(let k=0;k<8;k++){const a=k*.785;if(terrAt(x+Math.cos(a)*22,y+Math.sin(a)*22)!==2)return false}return navDyn[navCell(x,y)]===0&&MAINLAND[Math.max(0,Math.min(TH-1,(y/TG)|0))*TW+Math.max(0,Math.min(TW-1,(x/TG)|0))]===1};
  const farBase=(x,y,d)=>bases.every(b=>Math.hypot(b.x-x,b.y-y)>d);
  const place=(type,n,org,dmin,dmax,need)=>{const late=ANIMALS[type].from;
    for(let k=0;k<160;k++){const a=R()*6.283,d=dmin+R()*(dmax-dmin),x=org.x+Math.cos(a)*d,y=org.y+Math.sin(a)*d;
      if(!good(x,y)||!need(x,y))continue;const pts=[];
      for(let i=0;i<n;i++){const px=x+(i?(R()-.5)*70:0),py=y+(i?(R()-.5)*70:0);if(good(px,py)&&!pts.some(q=>Math.hypot(q.x-px,q.y-py)<16)&&!G.ents.some(e=>e.kind==='animal'&&Math.hypot(e.x-px,e.y-py)<50))pts.push({x:px,y:py})}
      if(pts.length<Math.min(n,2))continue;
      for(const q of pts){const sp=late?(x,y)=>G.late.push({type,x,y}):(x,y)=>addAnimal(type,x,y);sp(q.x,q.y);if(good(W-q.x,H-q.y))sp(W-q.x,H-q.y)}return true}
    return false};
  for(let i=0;i<nn(3);i++)place('deer',2+Math.floor(R()*2),A,380,950,(x,y)=>farBase(x,y,360));
  for(let i=0;i<nn(6);i++)place('wolf',2+Math.floor(R()*2),A,850,2200,(x,y)=>farBase(x,y,750)&&treesNear(x,y,170)>=4);
  for(let i=0;i<nn(3);i++)place('bear',1,A,1100,2800,(x,y)=>farBase(x,y,950)&&treesNear(x,y,170)>=2);
  /* Steinzeit: Dinosaurier statt Mammut und Säbelzahntiger (Pflanzenfresser häufiger, T-Rex nur einer je Seite) */
  for(let i=0;i<nn(3);i++)place('para',2+Math.floor(R()*2),A,500,1500,(x,y)=>farBase(x,y,450));
  for(let i=0;i<nn(2);i++)place('trike',1,A,800,2400,(x,y)=>farBase(x,y,700));
  for(let i=0;i<nn(2);i++)place('stego',1,A,800,2400,(x,y)=>farBase(x,y,700));
  if(wm>=.5)place('bronto',1,A,1200,2600,(x,y)=>farBase(x,y,1000));
  for(let i=0;i<nn(4);i++)place('raptor',2+Math.floor(R()*2),A,950,2500,(x,y)=>farBase(x,y,850));
  if(wm>=.25)place('trex',1,{x:W/2,y:H/2},150,900,(x,y)=>farBase(x,y,1000));
  if(wm>=.5)place('tiger',2,{x:W/2,y:H/2},0,750,(x,y)=>farBase(x,y,800));
  const shallow=(x,y)=>{if(x<90||y<90||x>W-90||y>H-90)return false;for(let k=0;k<8;k++){const a=k*.785;if(terrAt(x+Math.cos(a)*26,y+Math.sin(a)*26)!==1)return false}return terrAt(x,y)===1&&navDyn[navCell(x,y)]===0};
  for(let n=0,k=0;n<Math.round(4*wm)&&k<600;k++){const a=R()*6.283,d=420+R()*1500,x=A.x+Math.cos(a)*d,y=A.y+Math.sin(a)*d;if(!shallow(x,y)||!farBase(x,y,380))continue;G.late.push({type:'croc',x,y});if(shallow(W-x,H-y))G.late.push({type:'croc',x:W-x,y:H-y});n++}
}
function renderBg(seed){
  const K=.75; /* Bodentextur in 75 % Auflösung (spart Zeit und Speicher); alle Zeichenbefehle bleiben in Spielpixeln */
  bg=document.createElement('canvas');bg.width=Math.round(W*K);bg.height=Math.round(H*K);const b=bg.getContext('2d');b.scale(K,K);const R=mulberry(seed+99);
  const tmp=document.createElement('canvas');tmp.width=Math.round(W*K);tmp.height=Math.round(H*K);const t=tmp.getContext('2d');t.scale(K,K);
  const mask=pred=>{ /* weiche Landform: Gelände glätten, in 4-facher Auflösung abtasten, Kante bei 50 % */
    const K=4,w=TW*K,h=TH*K,g=new Float32Array(TW*TH);for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let sm=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=Math.max(0,Math.min(TW-1,x+dx)),ny=Math.max(0,Math.min(TH-1,y+dy)),wt=dx||dy?1:3;sm+=wt*(pred(TERR[ny*TW+nx])?1:0);n+=wt}g[y*TW+x]=sm/n}
    const c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d'),im=cx.createImageData(w,h);
    for(let Y=0;Y<h;Y++){const fy=Math.max(0,Math.min(TH-1.001,(Y+.5)/K-.5)),iy=fy|0,ty=fy-iy;for(let X=0;X<w;X++){const fx=Math.max(0,Math.min(TW-1.001,(X+.5)/K-.5)),ix=fx|0,tx=fx-ix;
      const v=(g[iy*TW+ix]*(1-tx)+g[iy*TW+ix+1]*tx)*(1-ty)+(g[(iy+1)*TW+ix]*(1-tx)+g[(iy+1)*TW+ix+1]*tx)*ty,o=(Y*w+X)*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=Math.max(0,Math.min(255,((v-.5)*5+.5)*255))}}
    cx.putImageData(im,0,0);return c};
  const shallowM=mask(v=>v>=1),landM=mask(v=>v>=2);
  const cut=(m,offs)=>{t.globalCompositeOperation='destination-in';t.imageSmoothingEnabled=true;for(const[ox,oy]of offs)t.drawImage(m,0,0,m.width,m.height,ox,oy,W,H);t.globalCompositeOperation='source-over'};
  // 1) tiefes Wasser
  b.fillStyle='#1a4466';b.fillRect(0,0,W,H);
  for(let i=0;i<Math.round(420*AREA);i++){const x=R()*W,y=R()*H,r=90+R()*240,g=b.createRadialGradient(x,y,0,x,y,r),c=R()<.5?'14,52,86':'44,110,146';g.addColorStop(0,`rgba(${c},${.18+R()*.22})`);g.addColorStop(1,`rgba(${c},0)`);b.fillStyle=g;b.fillRect(x-r,y-r,2*r,2*r)}
  // 2) flaches Wasser
  t.clearRect(0,0,W,H);t.fillStyle='#4aa3b0';t.fillRect(0,0,W,H);
  for(let i=0;i<Math.round(500*AREA);i++){const x=R()*W,y=R()*H,r=40+R()*120,g=t.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,200,200,.28)');g.addColorStop(1,'rgba(120,200,200,0)');t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  cut(shallowM,[[0,0]]);b.drawImage(tmp,0,0,W,H);
  // Wellen
  b.lineWidth=1.2;{const P=[new Path2D(),new Path2D()];for(let i=0;i<Math.round(5000*AREA);i++){const x=R()*W,y=R()*H,v=terrAt(x,y);if(v>=2)continue;const w=6+R()*10,q=P[v];q.moveTo(x-w,y);q.quadraticCurveTo(x,y-3,x+w,y)}b.strokeStyle='rgba(150,200,230,.14)';b.stroke(P[0]);b.strokeStyle='rgba(235,250,250,.32)';b.stroke(P[1])}
  // 3) Brandung, nasser Sand und Sandstrand rund ums Land (Land nach außen aufgeweitet)
  const dil=(m,r,col,alpha)=>{t.imageSmoothingEnabled=true;t.clearRect(0,0,W,H);t.globalCompositeOperation='source-over';{const n=Math.max(8,Math.round(r*.6));for(let k=0;k<n;k++){const a=k/n*6.283;t.drawImage(m,0,0,m.width,m.height,Math.cos(a)*r,Math.sin(a)*r,W,H)}}t.drawImage(m,0,0,m.width,m.height,0,0,W,H);t.globalCompositeOperation='source-in';t.fillStyle=col;t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';b.globalAlpha=alpha;b.drawImage(tmp,0,0,W,H);b.globalAlpha=1};
  dil(landM,22,'rgb(190,230,225)',.3);dil(landM,15,'rgb(238,246,244)',.4);dil(landM,11,'#bfa874',1);dil(landM,7,'#d9c690',1);
  // 4) Gras auf dem Land
  t.clearRect(0,0,W,H);t.fillStyle='#6c8544';t.fillRect(0,0,W,H);
  for(let i=0;i<Math.round(1700*AREA);i++){const x=R()*W,y=R()*H,r=30+R()*110,g=t.createRadialGradient(x,y,0,x,y,r),c=R()<.55?'82,110,52':R()<.5?'128,146,76':'140,128,78';g.addColorStop(0,`rgba(${c},${.18+R()*.28})`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
  // Biome: große, punktsymmetrische Flecken (trockene Steppe, saftiger Wald-Boden, karge Tundra)
  {const bi=[['190,172,86',.3],['96,150,62',.26],['150,156,130',.22]];const rb=mulberry(seed+555);for(let i=0;i<Math.round(14*AREA);i++){const x=rb()*W,y=rb()*H,r=320+rb()*420,[c,al]=bi[i%3];for(const[px,py]of[[x,y],[W-x,H-y]]){const g=t.createRadialGradient(px,py,r*.1,px,py,r);g.addColorStop(0,`rgba(${c},${al})`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(px-r,py-r,2*r,2*r)}}}
  // Erdflecken und dunklere Wiesenstücke
  for(let i=0;i<Math.round(160*AREA);i++){const x=R()*W,y=R()*H,r=14+R()*40,g=t.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,92,58,.38)');g.addColorStop(1,'rgba(120,92,58,0)');t.fillStyle=g;t.beginPath();t.ellipse(x,y,r*1.4,r,R()*3,0,6.283);t.fill()}
  for(const e of G.ents)if(e.type==='hq'){const g=t.createRadialGradient(e.x,e.y,30,e.x,e.y,210);g.addColorStop(0,'rgba(150,118,76,.7)');g.addColorStop(.6,'rgba(150,118,76,.35)');g.addColorStop(1,'rgba(150,118,76,0)');t.fillStyle=g;t.fillRect(e.x-210,e.y-210,420,420)}
  // feines Korn (Rauschen) über dem Gras
  {const n=document.createElement('canvas');n.width=n.height=160;const nx=n.getContext('2d'),im=nx.createImageData(160,160);for(let i=0;i<160*160;i++){const v=110+R()*60|0;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}nx.putImageData(im,0,0);
    t.globalCompositeOperation='soft-light';t.globalAlpha=.55;t.fillStyle=t.createPattern(n,'repeat');t.fillRect(0,0,W,H);t.globalAlpha=1;t.globalCompositeOperation='source-over'}
  // Grashalme, Büschel, Steinchen, Blumen
  t.lineWidth=1;{const P=[new Path2D(),new Path2D(),new Path2D()];for(let i=0;i<Math.round(24000*AREA);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)<2)continue;const q=P[(R()*3)|0];q.moveTo(x,y);q.lineTo(x+(R()-.5)*4,y-3-R()*4)}t.strokeStyle='rgba(52,76,32,.5)';t.stroke(P[0]);t.strokeStyle='rgba(170,184,104,.4)';t.stroke(P[1]);t.strokeStyle='rgba(98,128,58,.45)';t.stroke(P[2])}
  for(let i=0;i<Math.round(5200*AREA);i++){const x=R()*W,y=R()*H;if(terrAt(x,y)<2)continue;const r=1.5+R()*2.6;t.fillStyle='rgba(30,40,18,.28)';t.beginPath();t.ellipse(x+1,y+1,r+.6,r*.6,0,0,6.283);t.fill();t.fillStyle=R()<.5?'#8d8a7f':'#a39f92';t.beginPath();t.ellipse(x,y,r,r*.62,0,0,6.283);t.fill();t.fillStyle='rgba(255,255,255,.28)';t.beginPath();t.ellipse(x-r*.25,y-r*.2,r*.4,r*.22,0,0,6.283);t.fill()}
  {const cols=['#f4e66a','#f7f3ea','#e07a8a','#9f7ad6','#f0a24a'];for(let i=0;i<Math.round(260*AREA);i++){const cx=R()*W,cy=R()*H;if(terrAt(cx,cy)<2)continue;const c=cols[(R()*cols.length)|0],n=3+(R()*7|0);for(let k=0;k<n;k++){const x=cx+(R()-.5)*26,y=cy+(R()-.5)*18;t.fillStyle='rgba(40,60,25,.55)';t.fillRect(x,y,1,3);t.fillStyle=c;t.beginPath();t.arc(x,y,1.5,0,6.283);t.fill()}}}
  cut(landM,[[0,0]]);b.drawImage(tmp,0,0,W,H);
  // dunkler Rand der Wiese an der Küste (Tiefe)
  {const ec=document.createElement('canvas');ec.width=Math.round(W*K);ec.height=Math.round(H*K);const ex=ec.getContext('2d');ex.scale(K,K);ex.imageSmoothingEnabled=true;t.imageSmoothingEnabled=true;ex.drawImage(landM,0,0,landM.width,landM.height,0,0,W,H);ex.globalCompositeOperation='destination-in';for(let k=0;k<8;k++){const a=k/8*6.283;ex.drawImage(landM,0,0,landM.width,landM.height,Math.cos(a)*9,Math.sin(a)*9,W,H)}
    t.clearRect(0,0,W,H);t.globalCompositeOperation='source-over';t.drawImage(landM,0,0,landM.width,landM.height,0,0,W,H);t.globalCompositeOperation='destination-out';t.drawImage(ec,0,0,W,H);t.globalCompositeOperation='source-in';t.fillStyle='rgba(28,44,18,.38)';t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';b.drawImage(tmp,0,0,W,H)}
  // Licht von links oben: großflächige Aufhellung und Abdunklung
  {const g=b.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,240,200,.10)');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(10,20,40,.16)');b.fillStyle=g;b.fillRect(0,0,W,H)}
  // Fels (Berge, Klippen): graubraune Gesteinsfläche mit Schichten und Flecken; die Form kommt aus dem 3D-Relief
  if(TERR.some(v=>v===3)){const rockM=mask(v=>v===3);t.clearRect(0,0,W,H);t.fillStyle='#8d8679';t.fillRect(0,0,W,H);
    for(let i=0;i<Math.round(1800*AREA);i++){const x=R()*W,y=R()*H,r=14+R()*60,g=t.createRadialGradient(x,y,0,x,y,r),c=R()<.5?'60,52,44':'196,186,168';g.addColorStop(0,`rgba(${c},${.12+R()*.2})`);g.addColorStop(1,`rgba(${c},0)`);t.fillStyle=g;t.fillRect(x-r,y-r,2*r,2*r)}
    t.lineWidth=1.4;t.strokeStyle='rgba(50,44,38,.28)';t.beginPath();for(let i=0;i<Math.round(2600*AREA);i++){const x=R()*W,y=R()*H,l=18+R()*60;t.moveTo(x,y);t.lineTo(x+l,y+(R()-.5)*8)}t.stroke();
    t.strokeStyle='rgba(235,226,205,.2)';t.beginPath();for(let i=0;i<Math.round(1200*AREA);i++){const x=R()*W,y=R()*H,l=10+R()*40;t.moveTo(x,y);t.lineTo(x+l,y-2-R()*5)}t.stroke();
    cut(rockM,[[0,0]]);b.drawImage(tmp,0,0,W,H);
    // Schnee auf den höchsten Gipfeln (Höhe aus dem Relief), weich verlaufend
    let mx=0;for(let i=0;i<TW*TH;i++)if(TERR[i]===3&&HL[i]>mx)mx=HL[i];
    if(mx>2.2){const sn=mx*.5,rs=mulberry(seed+31);t.clearRect(0,0,W,H);
      for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x;if(TERR[i]!==3)continue;const a=(HL[i]-sn+(rs()-.5)*mx*.06)/(mx*.16);if(a<=0)continue;t.fillStyle=`rgba(255,255,255,${Math.min(1,a*1.4)})`;t.fillRect(x*TG-2,y*TG-2,TG+4,TG+4)}
      b.save();b.filter='blur(4px)';b.drawImage(tmp,0,0,W,H);b.restore()}}
  b.strokeStyle='rgba(30,22,14,.5)';b.lineWidth=6;b.strokeRect(3,3,W-6,H-6);
  bgSmall=document.createElement('canvas');bgSmall.width=240;bgSmall.height=160;bgSmall.getContext('2d').drawImage(bg,0,0,240,160);
}

