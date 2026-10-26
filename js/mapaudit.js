/* Epochenkrieg – Kartenprüfung (Dauer-Absicherung).
   Läuft am Ende von genMap (map.js), nach den Wäldern und vor den Tieren, für JEDE Karte (alle Kartenarten, Grössen, Regler; auch Mehrspieler und Kartenvorschau).
   Regel (David): auf jeder Karte hat jede Seite genug Ressourcen, sinnvoll verteilt, und alle Vorkommen, die zählen, sind ZUGÄNGLICH.
   Geprüft und bei Bedarf behoben (immer punktsymmetrisch, Zufall nur aus eigenem Strom `R` ab dem Seed – gleiche Optionen + Seed = gleiche Karte):
   1) Vorkommen ohne Gegenstück auf der anderen Seite: Gegenstück ergänzen oder das Vorkommen entfernen.
   2) Vorkommen auf Gelände, wo sie nicht hingehören (Bäume/Beeren/Erz nicht auf Land, Fisch nicht im Wasser).
   3) Erz (Stein/Eisen/Gold): zu steil für eine Mine (validSpot), eingeschlossen oder ohne Zugang zu Fuss -> versetzen (bis 170 px), sonst ersetzen.
      Öl: erreichbar und mit Platz für einen Bohrturm in Reichweite. Beeren: erreichbar.
   4) Fisch: nur Schwärme, die ein Boot von einem möglichen Hafenplatz aus erreicht (oder Arbeiter vom Ufer); unerreichbare in Hafennähe entfernen.
   5) Mindestmengen je Seite (`MAP_MIN`, `MAP_MIN_FISH`): fehlt etwas, kommen neue Vorkommen in Ringen um das Hauptlager dazu (mit Spiegelbild).
   Ergebnis in `MAPDBG.audit` (Zähler), bei Unbehebbarem console.warn. Kostet ca. 10-20 ms.
   Hinweis Kennungen: neue Vorkommen bekommen neue Kennungen, deshalb gilt `MAPGEN_VER` – Spielstände einer anderen Version werden abgelehnt (savegame.js). */
'use strict';
const MAPGEN_VER=2; /* Version der Kartenerzeugung (Vorkommen-Kennungen); steht in G.sv.mv, SAVE lehnt andere Versionen ab. Bei Änderungen an map.js/mapaudit.js, die Positionen oder Kennungen verschieben, erhöhen */
const SLOPE_MINE=.88; /* flacher als validSpot-Grenze (.9): so viel Gefälle verträgt eine Mine */
const AU_GAP={tree:15,bush:12,stone:14,iron:14,gold:14,oil:16,fish:10,dolphin:14,whale:30};
const AU_TREE_GAP=36; /* Erz/Öl: Abstand zu Bäumen (Mine bzw. Bohrturm und Arbeiter brauchen Platz rundherum) */
/* Mindestmengen je Seite (nutzbar = zu Fuss erreichbar, Mine/Bohrturm baubar), gemessen vom Hauptlager.
   Werte aus dem Ist-Zustand: am Start wenig und nah (ein Stein, ein kleines Eisen, Beeren), dann wächst es nach aussen; gute Karten bleiben unverändert. */
const MAP_MIN=[
  {t:'stone',rad:450,amt:3200,ring:[200,285],sz:1},    /* ein Steinvorkommen gleich am Start */
  {t:'iron',rad:450,amt:2000,ring:[265,365],sz:.5},    /* ein kleines Eisenvorkommen in Reichweite */
  {t:'bush',rad:450,n:7,ring:[110,430]},               /* Beeren am Start (David: Steinzeit lebt von Beeren) */
  {t:'bush',rad:750,n:10,ring:[300,700]},
  {t:'stone',rad:1200,amt:8000,ring:[480,1100],sz:1},  /* genug Stein/Eisen für ein ganzes Spiel */
  {t:'iron',rad:1200,amt:8000,ring:[520,1100],sz:1},
  {t:'gold',rad:850,amt:2100,ring:[600,820],sz:1},     /* Gold ab Mittelalter, Öl ab Industriezeit: je ein Vorkommen in Sichtweite der Expansion */
  {t:'oil',rad:850,amt:2600,ring:[620,840],sz:1.7}
];
const MAP_MIN_FISH=4,AU_FISH_R=900; /* mindestens so viele Fischschwärme im Umkreis 900 px um den nächsten Hafenplatz (wenn ein Hafenplatz in 700 px liegt) */
let _auSt=null;
/* Flutfüllung über freie Wegfelder (4er-Nachbarschaft wie die Wegsuche); mode false = zu Fuss, 'dry' = nur festes Land, true = Schiffe */
function navFlood(starts,mode){
  const N=NW*NH,m=new Uint8Array(N);if(!_auSt||_auSt.length!==N)_auSt=new Int32Array(N);const st=_auSt;let sp=0;
  for(const s of starts)if(s>=0&&!m[s]){m[s]=1;st[sp++]=s}
  while(sp){const i=st[--sp],x=i%NW;
    if(x>0&&!m[i-1]&&navOpen(i-1,mode)){m[i-1]=1;st[sp++]=i-1}
    if(x<NW-1&&!m[i+1]&&navOpen(i+1,mode)){m[i+1]=1;st[sp++]=i+1}
    if(i>=NW&&!m[i-NW]&&navOpen(i-NW,mode)){m[i-NW]=1;st[sp++]=i-NW}
    if(i+NW<N&&!m[i+NW]&&navOpen(i+NW,mode)){m[i+NW]=1;st[sp++]=i+NW}}
  return m}
/* Wie navFlood, aber jede Startfläche bekommt eine Nummer (lab) und eine Grösse (size, Felder); gibt {lab,size} zurück */
function navLabel(starts,mode){
  const N=NW*NH,lab=new Int32Array(N),size=[0];if(!_auSt||_auSt.length!==N)_auSt=new Int32Array(N);const st=_auSt;
  for(const s0 of starts){if(s0<0||lab[s0])continue;const id=size.length;let sp=0,c=0;size.push(0);lab[s0]=id;st[sp++]=s0;
    while(sp){const i=st[--sp],x=i%NW;c++;
      if(x>0&&!lab[i-1]&&navOpen(i-1,mode)){lab[i-1]=id;st[sp++]=i-1}
      if(x<NW-1&&!lab[i+1]&&navOpen(i+1,mode)){lab[i+1]=id;st[sp++]=i+1}
      if(i>=NW&&!lab[i-NW]&&navOpen(i-NW,mode)){lab[i-NW]=id;st[sp++]=i-NW}
      if(i+NW<N&&!lab[i+NW]&&navOpen(i+NW,mode)){lab[i+NW]=id;st[sp++]=i+NW}}
    size[id]=c}
  return{lab,size}}
function mapAudit(seed,bases,A){
  const t0=performance.now(),R=mulberry((seed^0x5bd1e995)+7919),D=MAPDBG.audit={moved:0,removed:0,mirror:0,filled:{},fail:{},soft:{},fish:0,conn:0,split:0,ms:0};
  const MR=BLDS.mine.r,DR=BLDS.derrick.r,HR=BLDS.harbor.r,hq=[bases[0],bases[1]];
  /* ---- räumlicher Index (alle Vorkommen und Gebäude; Einheiten und Tiere zählen nicht – sie sind nicht deterministisch) ---- */
  const CS=64,IDX=new Map(),hk=(x,y)=>((x/CS)|0)*1024+((y/CS)|0);
  const hAdd=n=>{const k=hk(n.x,n.y);(IDX.get(k)||IDX.set(k,[]).get(k)).push(n)};
  const hDel=n=>{const l=IDX.get(hk(n.x,n.y));if(l){const i=l.indexOf(n);if(i>=0)l.splice(i,1)}};
  const hEach=(x,y,rad,f)=>{const cx=(x/CS)|0,cy=(y/CS)|0,k=Math.ceil(rad/CS);for(let gx=cx-k;gx<=cx+k;gx++)for(let gy=cy-k;gy<=cy+k;gy++){const l=IDX.get(gx*1024+gy);if(l)for(const n of l)if(!n.dead&&f(n))return n}return null};
  for(const e of G.ents)if(!e.dead&&(e.kind==='node'||e.kind==='bld'))hAdd(e);
  const isOre=t=>t==='stone'||t==='iron'||t==='gold';
  const gapOf=(t,o)=>o.kind==='bld'?30:(o.type==='tree'&&(isOre(t)||t==='oil'))?AU_TREE_GAP:AU_GAP[t]||12;
  const freeAt=(x,y,r,t,ex)=>!hEach(x,y,r+130,o=>(!ex||!ex.includes(o))&&Math.hypot(o.x-x,o.y-y)<o.r+r+gapOf(t,o));
  const mirrorOf=n=>hEach(W-n.x,H-n.y,6,o=>o!==n&&o.kind==='node'&&o.type===n.type&&Math.hypot(o.x-(W-n.x),o.y-(H-n.y))<4);
  const drop=n=>{if(n.dead)return;n.dead=true;if(navBlocks(n))navStamp(n,-1);G.byId.delete(n.id);D.removed++};
  const move=(n,x,y)=>{if(navBlocks(n))navStamp(n,-1);hDel(n);n.x=x;n.y=y;n._u=undefined;hAdd(n);if(navBlocks(n))navStamp(n,1)};
  const nodesNow=()=>G.ents.filter(e=>e.kind==='node'&&!e.dead);
  /* ---- Erreichbarkeit zu Fuss ---- */
  const s0=navStart(hq[0]),s1=navStart(hq[1]);
  let rch=navFlood([s0],false),rchB=rch;
  if(s1<0||!rch[s1]){D.split=1;rchB=navFlood([s1],false)} /* Hauptlager nicht verbunden (sollte ensureWalk verhindern) */
  const near=(m,x,y,rad)=>{const x0=Math.max(0,Math.floor((x-rad)/NS)),x1=Math.min(NW-1,Math.floor((x+rad)/NS)),y0=Math.max(0,Math.floor((y-rad)/NS)),y1=Math.min(NH-1,Math.floor((y+rad)/NS));
    for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)if(m[yy*NW+xx]&&Math.hypot((xx+.5)*NS-x,(yy+.5)*NS-y)<=rad)return true;return false};
  const reachAny=(x,y,rad)=>near(rch,x,y,rad)||(rchB!==rch&&near(rchB,x,y,rad));
  /* ---- Platzprüfungen ---- */
  const oreSpot=(x,y,r)=>terrAt(x,y)===2&&slopeNear(x,y,MR)<=SLOPE_MINE&&validSpot(x,y,MR,false,true,true)&&reachAny(x,y,r+15);
  const derrickAt=(x,y,r)=>{for(let d=r+22;d<=MINE_RNG*.85-2;d+=14)for(let k=0;k<20;k++){const a=k*.314,px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(validSpot(px,py,DR,false,false,true)&&reachAny(px,py,22))return true}return false};
  const usable=n=>{ /* Landvorkommen: zu Fuss erreichbar und bebaubar (Mine bzw. Bohrturm) */
    if(n._u!==undefined)return n._u;let ok=terrAt(n.x,n.y)===2;
    if(ok){if(isOre(n.type))ok=oreSpot(n.x,n.y,n.r);else if(n.type==='oil')ok=reachAny(n.x,n.y,n.r+15)&&derrickAt(n.x,n.y,n.r);else ok=reachAny(n.x,n.y,n.r+15)}
    return n._u=ok};
  /* Platz für ein neues Landvorkommen am Punkt (x,y) – Spiegelbild wird getrennt geprüft */
  const spotOk=(t,x,y,r,ex)=>{if(!landSpot(x,y,r+4)||!freeAt(x,y,r,t,ex))return false;
    if(isOre(t))return slopeNear(x,y,MR)<=SLOPE_MINE&&validSpot(x,y,MR,false,true,true)&&reachAny(x,y,r+15);
    if(t==='oil')return reachAny(x,y,r+15)&&derrickAt(x,y,r);
    return reachAny(x,y,r+15)};
  /* Paar anlegen: beide Seiten oder keine */
  const addPair=(t,x,y,sz,okFn)=>{const r=Math.round(NODES[t].r*Math.sqrt(sz)),mx=W-x,my=H-y;
    if(Math.hypot(mx-x,my-y)<2*r+2*(AU_GAP[t]||12)+20||!okFn(x,y,r,false)||!okFn(mx,my,r,true))return null;
    const a=addNode(t,x,y,sz),b=addNode(t,mx,my,sz);a._fill=b._fill=1;hAdd(a);hAdd(b);return a};

  /* ===== 1) Vorkommen ohne Gegenstück ===== */
  for(const n of nodesNow()){if(n.dead||mirrorOf(n))continue;
    if(n.type==='tree'){if(Math.hypot(W-2*n.x,H-2*n.y)>=FOREST_S)drop(n),D.mirror++;continue} /* einzelne Bäume: lieber weglassen als nachpflanzen (Baum in der Kartenmitte ist sein eigenes Gegenstück) */
    const mx=W-n.x,my=H-n.y;
    if(Math.hypot(mx-n.x,my-n.y)>2*n.r+20&&freeAt(mx,my,n.r,n.type,[n])){const m=addNode(n.type,mx,my,n.sz);hAdd(m)}else drop(n);
    D.mirror++}
  /* ===== 2) Gelände ===== */
  for(const n of nodesNow()){const t=terrAt(n.x,n.y);
    if(n.sea?t>1:t!==2)drop(n)}
  /* ===== 3) Landvorkommen: Zugang und Bebaubarkeit ===== */
  const relocate=(n,m)=>{ /* nächsten gültigen Platz im Umkreis suchen; Spiegelbild wandert mit */
    const a0=R()*6.283,ex=[n,m];
    for(let d=14;d<=170;d+=14)for(let k=0;k<14;k++){const a=a0+k*.4488,x=n.x+Math.cos(a)*d,y=n.y+Math.sin(a)*d;
      if(spotOk(n.type,x,y,n.r,ex)&&spotOk(n.type,W-x,H-y,n.r,ex)&&(!m||Math.hypot(W-2*x,H-2*y)>2*n.r+40)){move(n,x,y);if(m)move(m,W-x,H-y);return true}}
    return false};
  const seenP=new Set();
  for(const n of nodesNow()){
    if(n.dead||n.sea||n.type==='tree'||n.type==='field'||seenP.has(n.id))continue;seenP.add(n.id);
    const m=mirrorOf(n);if(m)seenP.add(m.id);
    if(usable(n)&&(!m||usable(m)))continue;
    n._u=undefined;if(m)m._u=undefined;
    if(relocate(n,m))D.moved+=m?2:1;else{drop(n);if(m)drop(m)}}
  /* ===== 4) Fisch ===== */
  const sites=[]; /* mögliche Hafenplätze um das Hauptlager (flaches Wasser am Ufer, vom Hauptlager zu Fuss erreichbar) */
  {const h=hq[0],x0=Math.max(0,Math.floor((h.x-1600)/TG)),x1=Math.min(TW-1,Math.floor((h.x+1600)/TG)),y0=Math.max(0,Math.floor((h.y-1600)/TG)),y1=Math.min(TH-1,Math.floor((h.y+1600)/TG));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(TERR[y*TW+x]!==1)continue;const px=(x+.5)*TG,py=(y+.5)*TG,d=Math.hypot(px-h.x,py-h.y);if(d>1600||!harborOk(px,py,HR)||!near(rch,px,py,60))continue;sites.push({x:px,y:py,d})}}
  sites.sort((a,b)=>a.d-b.d);
  const starts=[];for(const s of sites)for(const[px,py]of[[s.x,s.y],[W-s.x,H-s.y]]){const c=navCell(px,py);if(navOpen(c,true))starts.push(c)}
  const WL=navLabel(starts,true),wat=WL.lab; /* Wasserflächen, in denen ein Boot von einem Hafenplatz aus fahren kann (Nummer > 0) */
  const shoreOk=n=>{if(n.type!=='fish')return false;const p=shoreOf(n);return !!p&&reachAny(p.x,p.y,12)};
  for(const n of nodesNow()){if(!n.sea)continue;
    const d=Math.min(Math.hypot(n.x-hq[0].x,n.y-hq[0].y),Math.hypot(n.x-hq[1].x,n.y-hq[1].y));
    if(d<1500&&!wat[navCell(n.x,n.y)]&&!shoreOk(n)){drop(n);D.fish++}}
  /* Fischgrund für die erste Hafen-Bucht (mind. 150 Felder = 15 000 px² Wasser, kein Tümpel) in 700 px */
  let hs=null;for(const s of sites){if(s.d>700)break;const l=wat[navCell(s.x,s.y)];if(l&&WL.size[l]>=150&&validSpot(s.x,s.y,HR,true,false,true)){hs=s;break}}
  D.hs=hs?{x:Math.round(hs.x),y:Math.round(hs.y),d:Math.round(hs.d),cells:WL.size[wat[navCell(hs.x,hs.y)]],sites:sites.length}:null;
  const fishN=(c,R,lab)=>{let n=0;for(const e of nodesNow())if(e.type==='fish'&&wat[navCell(e.x,e.y)]===lab&&Math.hypot(e.x-c.x,e.y-c.y)<R)n++;return n};
  const fishOk=(x,y,r,lab)=>{if(!(x>40&&y>40&&x<W-40&&y<H-40&&wat[navCell(x,y)]===lab))return false;return terrAt(x,y)<=1&&terrAt(x+r,y)<=1&&terrAt(x-r,y)<=1&&terrAt(x,y+r)<=1&&terrAt(x,y-r)<=1};
  const waterCells=(c,R,lab,d0)=>{const out=[],x0=Math.max(0,Math.floor((c.x-R)/NS)),x1=Math.min(NW-1,Math.floor((c.x+R)/NS)),y0=Math.max(0,Math.floor((c.y-R)/NS)),y1=Math.min(NH-1,Math.floor((c.y+R)/NS));
    for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){const i=yy*NW+xx;if(wat[i]===lab){const d=Math.hypot((xx+.5)*NS-c.x,(yy+.5)*NS-c.y);if(d>=d0&&d<R)out.push(i)}}return out};
  if(hs)for(let side=0;side<2;side++){
    const h=side?{x:W-hs.x,y:H-hs.y}:hs,lab=wat[navCell(h.x,h.y)],labM=wat[navCell(W-h.x,H-h.y)]; /* das Spiegelbild liegt im Wasser der anderen Seite */
    /* gezählt wird, was im Umkreis 700 px um das Hauptlager liegt; gibt es dort kaum Wasser, im Umkreis 900 px um den Hafenplatz */
    const okCells=(c,R,d0)=>waterCells(c,R,lab,d0).filter(i=>fishOk((i%NW+.5)*NS,(((i/NW)|0)+.5)*NS,8,lab));
    let c=hq[side],R_=700,cand=okCells(c,R_,0);
    if(cand.length<30){c=h;R_=AU_FISH_R;cand=okCells(c,R_,60)}
    for(let tries=0;cand.length&&fishN(c,R_,lab)<MAP_MIN_FISH&&tries<120;tries++){
      const i=cand[(R()*cand.length)|0],x=(i%NW+.5)*NS,y=(((i/NW)|0)+.5)*NS;
      if(addPair('fish',x,y,1,(px,py,r,m)=>fishOk(px,py,r,m?labM:lab)&&freeAt(px,py,r,'fish')))D.filled.fish=(D.filled.fish||0)+1}
    if(fishN(c,R_,lab)<MAP_MIN_FISH)D.fail.fish=(D.fail.fish||0)+1}
  /* ===== 5) Mindestmengen Land ===== */
  const amt=(m,rad,side)=>{const h=hq[side];let a=0;for(const n of nodesNow()){if(n.type!==m.t||Math.hypot(n.x-h.x,n.y-h.y)>=rad)continue;if(!usable(n))continue;a+=m.n?1:n.maxAmt}return a};
  for(const m of MAP_MIN){const need=m.n||m.amt,key=m.t+m.rad;
    /* Stufe 1: Ring und Radius der Vorgabe; findet sich dort kein Platz (viel Wasser/Fels), Stufe 2: Radius 1200 (Gold/Öl sind erst spät nötig) */
    const stages=[[m.rad,m.ring]];if(m.t==='gold'||m.t==='oil')stages.push([1200,[480,1150]]);
    for(let side=0;side<2;side++){const h=hq[side];
      for(let si=0;si<stages.length;si++){const[rad,ring]=stages[si];let tries=0;const a0=R()*6.283;
        while(amt(m,rad,side)<need&&tries<90){
          const a=a0+tries*2.39996,d=ring[0]+((tries*.618034)%1)*(ring[1]-ring[0]),x=h.x+Math.cos(a)*d,y=h.y+Math.sin(a)*d;tries++;
          if(m.t==='bush'){ /* Beeren in Büscheln */
            let n=0;for(let i=0;i<5;i++){const b=R()*6.283,e=Math.sqrt(R())*44,px=x+Math.cos(b)*e,py=y+Math.sin(b)*e;if(addPair('bush',px,py,1,(qx,qy,r)=>spotOk('bush',qx,qy,r)))n++}
            if(n)D.filled[key]=(D.filled[key]||0)+n*2;continue}
          if(addPair(m.t,x,y,m.sz,(qx,qy,r)=>spotOk(m.t,qx,qy,r)))D.filled[key]=(D.filled[key]||0)+2}
        if(amt(m,rad,side)>=need){if(si)D.far=(D.far||0)+1;break}}
      if(amt(m,stages[stages.length-1][0],side)<need){const o=m.rad>=850?D.soft:D.fail;o[key]=(o[key]||0)+1}}} /* weit entfernte Mengen (Gold, Öl, Stein/Eisen bis 1200 px) können auf Inselkarten fehlen: nur gezählt, nicht gewarnt */
  /* ===== 6) Gegenprobe: neue Vorkommen dürfen keinen Weg versperrt haben ===== */
  const fills=nodesNow().filter(n=>n._fill&&!n.sea);
  if(fills.length){
    const t1=navStart(hq[0]),t2=navStart(hq[1]),f1=navFlood([t1],false);
    if(t2<0||(!f1[t2]&&!D.split)){ /* Landweg zwischen den Hauptlagern gekappt: alle neuen Landvorkommen wieder weg */
      for(const n of fills)drop(n);D.conn=1;D.fail.conn=1}
    else{rch=f1;rchB=D.split?navFlood([t2],false):f1;
      for(const n of fills)if(!n.dead&&!reachAny(n.x,n.y,n.r+15))drop(n)}}
  /* ===== Aufräumen, Holz-Kontrolle ===== */
  const woodN=[[0,0],[0,0]];
  {const trees=nodesNow().filter(e=>e.type==='tree'),ok=new Set(),q=[];
   for(const t of trees)if(reachAny(t.x,t.y,t.r+15)){ok.add(t);q.push(t)}
   while(q.length){const t=q.pop();hEach(t.x,t.y,34,o=>{if(o.type==='tree'&&!ok.has(o)&&Math.hypot(o.x-t.x,o.y-t.y)<=34){ok.add(o);q.push(o)}return false})}
   for(const t of ok)for(let s=0;s<2;s++){const d=Math.hypot(t.x-hq[s].x,t.y-hq[s].y);if(d<600)woodN[s][0]++;if(d<900)woodN[s][1]++}
   D.woodLost=trees.length-ok.size}
  D.wood=woodN;if(woodN[0][0]<WOOD_MIN6/2||woodN[1][0]<WOOD_MIN6/2){D.fail.wood=1}
  for(const n of G.ents)if(n.kind==='node'){delete n._u;delete n._fill}
  if(D.removed||D.mirror){G.ents=G.ents.filter(e=>!e.dead)}
  D.ms=performance.now()-t0;
  const T=MAPDBG.auditSum||(MAPDBG.auditSum={runs:0,moved:0,removed:0,mirror:0,fish:0,fail:0,ms:0});
  T.runs++;T.moved+=D.moved;T.removed+=D.removed;T.mirror+=D.mirror;T.fish+=D.fish;T.ms+=D.ms;if(Object.keys(D.soft).length)T.soft=(T.soft||0)+1;
  if(Object.keys(D.fail).length){T.fail++;console.warn('Kartenprüfung: nicht behebbar',JSON.stringify(D.fail),'Karte',curMap,'Seed',seed)}
}
