/* Epochenkrieg – Kartenarten, Kartenregler (Wasser, Gebirge, Jahreszeit) und Landformen.
   Zufall nur über die seed-gesteuerte Funktion R() aus genTerrain (nie Math.random), damit Vorschau, Gastgeber und Gast dieselbe Karte bekommen.
   Reihenfolge: nach data.js und settings.js, vor nav.js (genTerrain liest MAPS, MOPT, mapEff, SHAPES). */

/* Karten-Optionen: water 0..2 (wenig, mittel, viel), mount 0..2 (keine, wenige, viele), sel = gewählte Jahreszeit (spring|summer|autumn|winter|random),
   season = die für diese Karte gültige (bei „random“ aus dem Seed gewürfelt). Mittel/Wenige/Sommer = das bisherige Aussehen. */
const MOPT={water:1,mount:1,sel:'summer',season:'summer'};
const SEASON_IDS=['spring','summer','autumn','winter'];
const SEASON_NAMES={spring:'Frühling',summer:'Sommer',autumn:'Herbst',winter:'Winter',random:'Zufall'};
const seasonOf=(sel,seed)=>sel==='random'?SEASON_IDS[(Math.imul((seed|0)^0x5bd1e995,2654435761)>>>9)%4]:(SEASON_IDS.includes(sel)?sel:'summer');
const WATER_NAMES=['Wenig','Mittel','Viel'],MOUNT_NAMES=['Keine','Wenige','Viele'];

/* Kartenarten. Parameter: mid/ends = Breite der Landzunge in der Mitte und an den Enden, amp = Unregelmäßigkeit, wind = Schwung der Landzunge, full = nur Land,
   plat = Plateaus, bank = Sandbänke, mount/mthr0 = Berge (kleinere Schwelle = mehr Berge), cliff = Klippen an der Küste (Zugänge nur an Lücken), lakes = Seen,
   lakeIsl = Inseln in den Seen, islets = Inselchen im offenen Meer (Paare), river/rw = Fluss und Breite, shape = eigene Landform (SHAPES),
   pal = Farbwelt (MAPPAL), forest = Waldmenge, ppMax = wie weit die Basis von der Diagonale zur Küste rücken darf */
const MAPS={
  coast:{name:'Küste und Landzunge',desc:'Geschwungene Küste, Hügel, Plateaus, Fischgründe',mid:820,ends:1450,amp:1.25,wind:.8,plat:.55,bank:.6,mount:1,cliff:0,lakes:1.1,mthr0:0.62,islets:3},
  land:{name:'Festland',desc:'Nur Land mit Hügeln und Plateaus, kein Meer',full:1,amp:1,plat:.65,bank:.6,mount:1,cliff:0,mthr0:0.58,lakes0:.8},
  lakes:{name:'Seenplatte',desc:'Viele Seen und Teiche mit Inseln, Fische im Binnenland',full:1,amp:1,plat:.4,bank:.6,mount:1,cliff:0,lakes:1.7,mthr0:0.62,lakeIsl:.1},
  mountains:{name:'Bergland',desc:'Hohe Berge und Klippen, Häfen nur an Zugängen',mid:760,ends:1350,amp:1.15,wind:.7,plat:.3,bank:.6,mount:1,cliff:1,lakes:.9,islets:2},
  river:{name:'Flusstal',desc:'Ein Fluss mit Schleifen trennt die Basen, nur wenige Furten führen hinüber',full:1,amp:1,plat:.5,bank:.6,mount:1,cliff:0,river:1,rw:80,mthr0:0.62,lakes0:.7},
  pass:{name:'Gebirgspass',desc:'Bergmassiv mit engen Pässen als Engstellen',full:1,amp:1,plat:.2,bank:.6,mount:1,cliff:0,mthr0:.4,pmargin:1,lakes0:.7},
  bay:{name:'Große Bucht',desc:'Viel Wasser, breite Landbrücke, Inselchen',mid:600,ends:1250,amp:1,wind:1,plat:.45,bank:.5,mount:1,cliff:0,lakes:.8,mthr0:0.62,islets:4},
  /* neue Kartenarten mit eigener Silhouette */
  archipel:{name:'Inselreich',desc:'Große und kleine Inseln, verbunden durch Landbrücken und flache Furten',shape:'archipel',nIsl:3,isl:1,plat:.35,bank:.5,mount:1,cliff:0,mthr0:.64,amp:1,ppMax:0,forest:.8,islets:2},
  fjord:{name:'Fjordland',desc:'Lange Meeresarme zwischen steilen Ufern, Halbinseln, viele Häfen',shape:'fjord',nFj:3,plat:.3,bank:.4,mount:1,cliff:1,mthr0:.6,amp:1,ppMax:0,pal:'fjord',pine:.55},
  desert:{name:'Wüste',desc:'Dünen, rote Felsen und wenige Oasen mit Wasser und Palmenhainen',shape:'desert',nOas:3,plat:.25,bank:.5,mount:1,cliff:0,mthr0:.66,amp:1,ppMax:0,pal:'desert',forest:.4,pine:0},
  canyon:{name:'Canyon',desc:'Rote Hochplateaus mit Terrassen, Schluchten und ein Fluss',full:1,amp:1,plat:.95,platH:4.4,bank:.5,mount:1,cliff:0,mthr0:.7,river:1,rw:70,ppMax:0,pal:'canyon',forest:.6,pine:.5},
  delta:{name:'Sumpfdelta',desc:'Verzweigte Wasserarme, flache Furten und Inseln aus Schlamm',shape:'delta',chan:.05,plat:0,bank:.3,mount:0,cliff:0,amp:1,ppMax:0,pal:'swamp',forest:1.1,pine:.05},
  crater:{name:'Kraterrand',desc:'Ringgebirge um einen See in der Mitte, vier Pässe, dunkle Nadelwälder',shape:'crater',full:1,plat:.35,bank:.5,mount:1,cliff:0,mthr0:.68,amp:1,ppMax:0,pal:'crater',rim:1,forest:1,pine:.85,lakes0:.4},
};
/* Was die Regler „Wasser“ und „Gebirge“ bei der jeweiligen Karte bewirken (Hinweis unter den Reglern) */
const MAP_HINT={coast:['Meer und Seen','Berge und Klippen'],land:['Seen','Berge'],lakes:['Seen','Berge'],mountains:['Meer und Seen','Berge und Klippen'],river:['Flussbreite und Seen','Berge'],pass:['Seen','Bergmassiv'],bay:['Meer, Inselchen und Seen','Berge'],
  archipel:['Größe und Zahl der Inseln','Berge auf den Inseln'],fjord:['Zahl der Meeresarme','Berge und Klippen'],desert:['Zahl der Oasen','Felsen und Mesas'],canyon:['Flussbreite','Plateaus und Felsen'],delta:['Breite der Wasserarme','Felsen (nur bei „Viele“)'],crater:['Größe des Kratersees','Ringgebirge (ohne: sanfter Wall)']};
/* Reihenfolge in den Menüs: bekannte Karten zuerst, dann die neuen */
const MAP_ORDER=['coast','land','lakes','mountains','river','pass','bay','archipel','fjord','desert','canyon','delta','crater'];

/* Wirksame Kartenwerte = Kartenart + Regler Wasser/Gebirge. Bei Arten, wo ein Regler nichts Offensichtliches bewirkt, wird er sinnvoll abgebildet
   (z. B. Festland: viel Wasser = Seen; Wüste: Zahl der Oasen; Kraterrand: Größe des Sees). Mittel/Wenige = Grundwerte der Art. */
function mapEff(id){
  const b=MAPS[id]||MAPS.coast,c=Object.assign({},b),wa=MOPT.water,mo=MOPT.mount;
  const wf=[1.2,1,.72][wa];
  if(c.mid){c.mid*=wf;c.ends*=wf}
  if(c.lakes)c.lakes*=[.35,1,1.6][wa];
  else if(c.lakes0&&wa===2)c.lakes=c.lakes0;                       /* Landkarten ohne Meer: viel Wasser = Seen */
  if(c.islets)c.islets=Math.round(c.islets*[.34,1,1.7][wa]);
  if(c.river)c.rw=(c.rw||80)*[.7,1,1.5][wa];
  if(c.shape==='archipel'){c.isl=[1.28,1,.78][wa];c.nIsl=[2,3,4][wa]}   /* viel Wasser = kleinere, mehr Inseln */
  if(c.shape==='fjord')c.nFj=[2,3,4][wa];
  if(c.shape==='desert')c.nOas=[2,4,7][wa];
  if(c.shape==='delta')c.chan=[.04,.05,.075][wa];
  if(c.shape==='crater')c.lakeK=[.9,1,1.45][wa];
  if(mo===0){c.mount=0;c.cliff=0;c.plat=Math.min(1,(c.plat||0)+.2);c.rim=0}
  else if(mo===2){c.mount=1;c.mthr0=(c.mthr0||.54)-.1;c.rim=1.3}
  if(c.shape==='delta'){c.plat=0;if(mo===2){c.mount=1;c.mthr0=.6}}   /* Sumpf: nur mit „viele“ gibt es überhaupt Felsen */
  return c}

/* ---------- Landformen (Land/Wasser-Maske) der neuen Kartenarten ----------
   Jede Form bekommt ctx = {R, sym, nf (Rauschfelder), A, B (Startplätze), cfg, ks} und liefert
   {val(px,py): >0 = Land, ford(px,py): flaches Wasser erzwingen (Furt), post(land): Maske nachbearbeiten, terr(TERR): Felder nachbearbeiten (Fels), height(px,py,TERR): Höhenzuschlag}. */
const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy,t=l2?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2)):0;return Math.hypot(px-ax-dx*t,py-ay-dy*t)};
const polyDist=(px,py,P)=>{let d=1e9;for(let i=0;i<P.length-1;i++){const q=segDist(px,py,P[i].x,P[i].y,P[i+1].x,P[i+1].y);if(q<d)d=q}return d};
const mirPt=p=>({x:W-p.x,y:H-p.y});
const SHAPES={
  /* Inselreich: zwei Hauptinseln mit den Startplätzen, eine Insel in der Mitte, Paare kleinerer Inseln; Landbrücken (Land) und Furten (flaches Wasser) verbinden sie */
  archipel(x){
    const{R,A,B,cfg,ks,sym,nf}=x,wf=cfg.isl||1,isl=[],edges=[];
    const rb=450*ks*(.8+.2*wf);isl.push({x:A.x,y:A.y,r:rb},{x:B.x,y:B.y,r:rb},{x:W/2,y:H/2,r:310*ks*wf});
    const mir=i=>i<2?1-i:i===2?2:(i%2?i+1:i-1);                 /* Spiegelpartner (Mittelinseln liegen als Paare ab Nr. 3) */
    const hx=W*playF/2-330,hy=H*playF/2-330;
    for(let n=0,k=0;n<(cfg.nIsl||3)&&k<260;k++){
      const r=(230+R()*190)*ks*wf,px=W/2+(R()*2-1)*hx,py=H/2+(R()*2-1)*hy,mx=W-px,my=H-py;
      if(Math.hypot(px-mx,py-my)<2*r+190||!isl.every(o=>Math.hypot(o.x-px,o.y-py)>o.r+r+170&&Math.hypot(o.x-mx,o.y-my)>o.r+r+170))continue;
      isl.push({x:px,y:py,r},{x:mx,y:my,r});n++}
    /* Kante zwischen Insel i und j samt Spiegelbild (Landbrücke oder Furt, leicht gebogen) */
    const has=new Set(),key=(i,j)=>Math.min(i,j)+'-'+Math.max(i,j);
    const link=(i,j,type)=>{if(i===j||has.has(key(i,j)))return;has.add(key(i,j));
      const a=isl[i],b=isl[j],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,l=Math.hypot(b.x-a.x,b.y-a.y)||1,bow=key(mir(i),mir(j))===key(i,j)?(R(),0):(R()-.5)*.3*l /* Kante zu sich selbst gespiegelt: gerade, sonst nicht punktsymmetrisch */,hw=type==='land'?58+R()*20:80;
      const pts=[{x:a.x,y:a.y},{x:mx-(b.y-a.y)/l*bow,y:my+(b.x-a.x)/l*bow},{x:b.x,y:b.y}];edges.push({type,hw,pts});
      const i2=mir(i),j2=mir(j);if(!has.has(key(i2,j2))){has.add(key(i2,j2));edges.push({type,hw,pts:pts.map(mirPt)})}};
    const linkBoth=link;
    /* Hauptweg zwischen den Startinseln: Startinsel → nächste Mittelinsel → Mitte → gespiegelt → andere Startinsel (nie ohne Landweg oder Furt) */
    let m=-1,md=1e9;for(let i=3;i<isl.length;i++){const d=Math.hypot(isl[i].x-A.x,isl[i].y-A.y);if(d<md){md=d;m=i}}
    if(m<0){linkBoth(0,2,'ford')}else{linkBoth(0,m,'land');linkBoth(m,2,'ford')}
    for(let i=3;i<isl.length;i++){let j=-1,jd=1e9;for(let k=0;k<isl.length;k++){if(k===i)continue;const d=Math.hypot(isl[k].x-isl[i].x,isl[k].y-isl[i].y)-isl[k].r;if(d<jd&&!has.has(Math.min(i,k)+'-'+Math.max(i,k))){jd=d;j=k}}
      if(j>=0)linkBoth(i,j,R()<.5?'land':'ford')}
    const ed=edges.map(e=>({...e,land:e.type==='land'})),fd=ed.filter(e=>!e.land);
    return{isl,edges:ed,val(px,py){let v=-9e3;for(const o of isl){const q=o.r-Math.hypot(px-o.x,py-o.y);if(q>v)v=q}
        v+=(sym(nf.n1,px,py)-.5)*340+(sym(nf.n2,px,py)-.5)*120;
        for(const e of ed)if(e.land){const q=e.hw-polyDist(px,py,e.pts);if(q>v)v=q}return v},
      ford(px,py){for(const e of fd)if(polyDist(px,py,e.pts)<e.hw)return true;return false}}},
  /* Fjordland: breites Land, von den Rändern schneiden lange Meeresarme ins Land (nie nah an die Startplätze); steile Ufer */
  fjord(x){
    const{R,A,B,cfg,ks,sym,nf}=x,fj=[],hx=W*playF/2,hy=H*playF/2;
    const trim=pts=>{const out=[];for(const p of pts){if(Math.hypot(p.x-A.x,p.y-A.y)<430*ks+60||Math.hypot(p.x-B.x,p.y-B.y)<430*ks+60)break;out.push(p)}return out};
    /* der erste Fjord ist auf den Startplatz gerichtet und endet ca. 400 px davor (Hafen in Reichweite von KI und Berater); er zählt mit */
    {const jx=(R()-.5)*260,jy=(R()-.5)*260,lenL=Math.hypot(A.x-(W/2-hx-60),jy),lenB=Math.hypot(jx,H/2+hy+60-A.y),side=lenB>lenL?1:0,sx=side?A.x+jx:W/2-hx-60,sy=side?H/2+hy+60:A.y+jy,a=Math.atan2(A.y-sy,A.x-sx),len=Math.hypot(A.x-sx,A.y-sy),ph=R()*6,wob=40+R()*40,pts=[],N=26;
      for(let i=0;i<=N;i++){const t=i/N,off=Math.sin(t*4+ph)*wob*Math.min(1,t*3);pts.push({x:sx+Math.cos(a)*len*t-Math.sin(a)*off,y:sy+Math.sin(a)*len*t+Math.cos(a)*off})}
      const out=[];for(const p of pts){if(Math.hypot(p.x-A.x,p.y-A.y)<380*ks+50)break;out.push(p)}
      if(out.length>3){const hw=80+R()*30;fj.push({pts:out,hw},{pts:out.map(mirPt),hw})}}
    for(let n=fj.length/2,k=0;n<(cfg.nFj||3)&&k<80;k++){
      const side=R()<.5?0:1,len=(700+R()*600)*(.6+.4*ks);let sx,sy,a;
      if(side===0){sx=W/2-hx-60;sy=H/2-hy+300+R()*(2*hy-600);a=(R()-.5)*.9}else{sx=W/2-hx+300+R()*(2*hx-600);sy=H/2-hy-60;a=1.5708+(R()-.5)*.8}
      const ph=R()*6,wob=60+R()*70,pts=[];const N=26;
      for(let i=0;i<=N;i++){const t=i/N,off=Math.sin(t*5+ph)*wob*t+Math.sin(t*11+ph*2)*18;pts.push({x:sx+Math.cos(a)*len*t-Math.sin(a)*off,y:sy+Math.sin(a)*len*t+Math.cos(a)*off})}
      const tp=trim(pts);if(tp.length<12)continue;
      /* nicht zu nah an einem anderen Fjord (sonst wird das Land dazwischen zerrissen) */
      if(fj.some(f=>f.pts.some(p=>tp.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<430))))continue;
      fj.push({pts:tp,hw:78+R()*38});fj.push({pts:tp.map(mirPt),hw:fj[fj.length-1].hw});n++}
    /* Abstand zum nächsten Fjord (minus Breite) je Gelände-Feld: einmal vorberechnen statt für jede Abfrage alle Linien abzulaufen */
    const D=new Float32Array(TW*TH).fill(1e9),PAD=330;
    for(const f of fj)for(let i=0;i<f.pts.length-1;i++){const a=f.pts[i],b=f.pts[i+1],x0=Math.max(0,Math.floor((Math.min(a.x,b.x)-PAD-f.hw)/TG)),x1=Math.min(TW-1,Math.floor((Math.max(a.x,b.x)+PAD+f.hw)/TG)),y0=Math.max(0,Math.floor((Math.min(a.y,b.y)-PAD-f.hw)/TG)),y1=Math.min(TH-1,Math.floor((Math.max(a.y,b.y)+PAD+f.hw)/TG));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const q=segDist((x+.5)*TG,(y+.5)*TG,a.x,a.y,b.x,b.y)-f.hw,k=y*TW+x;if(q<D[k])D[k]=q}}
    const dF=(px,py)=>D[Math.max(0,Math.min(TH-1,py/TG|0))*TW+Math.max(0,Math.min(TW-1,px/TG|0))];
    return{fj,val(px,py){return Math.min(x.full(px,py),640+(sym(nf.n1,px,py)-.5)*330+(sym(nf.n2,px,py)-.5)*150,dF(px,py)*5)},
      height(px,py){const d=dF(px,py);return d<260?2.4*smooth(d,260,40):0},dF}},
  /* Wüste: Land mit Oasen (kleine Seen); je eine Oase in der Nähe jedes Startplatzes; sanfte Dünen */
  desert(x){
    const{R,A,B,cfg,ks,sym,nf}=x,oas=[];
    const put=(px,py,r)=>{oas.push({x:px,y:py,r},{x:W-px,y:H-py,r})};
    /* Startoase: ~ 420 px von der Basis, Richtung Kartenmitte (mit Streuung) */
    {const dx=W/2-A.x,dy=H/2-A.y,l=Math.hypot(dx,dy),a=Math.atan2(dy,dx)+(R()-.5)*1.1,d=(430+R()*90)*ks;put(A.x+Math.cos(a)*d,A.y+Math.sin(a)*d,70+R()*30)}
    const hx=W*playF/2-300,hy=H*playF/2-300;
    for(let n=0,k=0;n<(cfg.nOas||4)&&k<200;k++){const r=62+R()*70,px=W/2+(R()*2-1)*hx,py=H/2+(R()*2-1)*hy;
      if(oas.every(o=>Math.hypot(o.x-px,o.y-py)>o.r+r+380)&&Math.hypot(W-px-px,H-py-py)>2*r+400&&Math.hypot(px-A.x,py-A.y)>650*ks&&Math.hypot(px-B.x,py-B.y)>650*ks){put(px,py,r);n++}}
    const a=.55+R()*.4,ca=Math.cos(a),sa=Math.sin(a),ph=R()*6;
    return{oas,val(px,py){return x.full(px,py)},
      post(land){for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const px=(x+.5)*TG,py=(y+.5)*TG;
        for(const o of oas){const d=Math.hypot(px-o.x,py-o.y);if(d<o.r*(1+(sym(nf.n2,px,py)-.5)*.5)){land[y*TW+x]=0;break}}}},
      height(px,py){const u=px*ca+py*sa,v=-px*sa+py*ca;return .42*Math.sin(u/90+ph+sym(nf.n3,px,py)*5)*(.5+.5*Math.sin(v/300+ph))+.1*Math.sin(u/34+v/70)}}},
  /* Sumpfdelta: ein Netz verzweigter Wasserarme (Nullstellen eines Rauschfeldes) um Schlamm-Inseln; Wasserarme sind watbar */
  delta(x){
    const{cfg,sym,nf}=x,cw=cfg.chan||.05;
    /* grobe, weit ausholende Hauptarme (Nullstellen eines groben Feldes) plus Netz aus Nebenarmen; die Abtastpunkte sind leicht verwirbelt
       (ungerade um die Kartenmitte, bleibt punktsymmetrisch), damit keine geraden Rasterkanten entstehen */
    const wp=(px,py)=>{const u=px-W/2,v=py-H/2;return[px+70*Math.sin(v*.0061+u*.0023)+34*Math.sin(v*.017-u*.009),py+70*Math.sin(u*.0057-v*.0029)+34*Math.sin(u*.015+v*.011)]};
    const lag=[];{const{R,A,B,ks}=x;for(const P of[A]){const a=R()*6.283,d=(330+R()*60)*ks+40;lag.push({x:P.x+Math.cos(a)*d,y:P.y+Math.sin(a)*d,r:96+R()*28})}lag.push({x:W-lag[0].x,y:H-lag[0].y,r:lag[0].r})}
    return{lag,val(px,py){let lv=9e3;for(const o of lag)lv=Math.min(lv,(Math.hypot(px-o.x,py-o.y)-o.r)*12);const[qx,qy]=wp(px,py),c1=Math.abs((sym(nf.n7,qx,qy)-.5)+.5*(sym(nf.n6,qx,qy)-.5)),c2=Math.abs((sym(nf.n3,qx,qy)-.5)+.7*(sym(nf.n4,qx,qy)-.5));
      return Math.min(900,lv,(c1-cw*1.6)*2600,(c2-cw*.9)*2600)}}},
  /* Kraterrand: Land mit einem Kratersee in der Mitte und einem Ringgebirge (4 Pässe) darum; ohne „Gebirge“ nur ein sanfter Ringwall */
  crater(x){
    const{R,A,B,cfg,ks,sym,nf}=x,c={x:W/2,y:H/2},rho=Math.hypot(A.x-c.x,A.y-c.y),ang=Math.atan2(A.y-c.y,A.x-c.x),ph=R()*6.28,ph2=R()*6.28,gw=.2+(R()-.5)*.04,off=.95+R()*.15;
    const Rr=th=>rho*.56*(1+.07*Math.sin(2*th+ph)+.05*Math.sin(4*th+ph2)),Hw=th=>rho*.07*(1+.3*Math.sin(2*th+ph2));
    const Rl=th=>rho*.25*(cfg.lakeK||1)*(1+.12*Math.sin(2*th+ph)+.06*Math.sin(4*th+ph2));
    const gaps=[ang+off,ang-off,ang+off+Math.PI,ang-off+Math.PI];                                  /* vier Pässe, punktsymmetrisch */
    const gapAt=th=>{let m=9;for(const g of gaps){const d=Math.abs(Math.atan2(Math.sin(th-g),Math.cos(th-g)));if(d<m)m=d}return m};
    const polar=(px,py)=>{const dx=px-c.x,dy=py-c.y;return{r:Math.hypot(dx,dy),th:Math.atan2(dy,dx)}};
    return{rho,val(px,py){return x.full(px,py)},
      terr(T){for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x,px=(x+.5)*TG,py=(y+.5)*TG,{r,th}=polar(px,py),rl=Rl(th),rr=Rr(th),hw=Hw(th);
        if(r<rl){T[i]=0;continue}if(r<rl+70){if(T[i]===2||T[i]===3)T[i]=1;continue}
        if(cfg.rim&&Math.abs(r-rr)<hw&&gapAt(th)>gw*(rho*.56/Math.max(rr,1))){T[i]=3}}},
      height(px,py,T,i){const{r,th}=polar(px,py),rr=Rr(th),hw=Hw(th),rl=Rl(th);
        const rimH=(cfg.rim||0)>0?1:0,gap=gapAt(th)<gw*1.15?smooth(gapAt(th),gw*1.15,gw*.4):0;
        const prof=Math.max(0,1-Math.abs(r-rr)/(hw*2.3));let h=prof*prof*(3-2*prof)*(rimH?7.4:2.6)*(1-gap*.82);
        if(r<rl+90)h-=.6*smooth(r,rl+90,rl);if(r<rr&&r>rl)h+=.5*smooth(r,rl,rl+200); return h}}}
};
/* weiche Treppe 0..1 (b → a): 1 bei x<=b?, ab hier einfach: smooth(x,a,b) = 0 bei x>=a, 1 bei x<=b */
function smooth(x,a,b){const t=Math.max(0,Math.min(1,(a-x)/(a-b)));return t*t*(3-2*t)}

/* ---------- Farbwelten (Boden, Wasser, Fels) je Kartenart; Jahreszeiten färben sie um (siehe SEASONS) ----------
   Farben sind [r,g,b]; Listen von Tupeln 'r,g,b' stehen für Flecken. */
const MAPPAL={
  green:{deep:[26,68,102],deepB:['14,52,86','44,110,146'],shal:[74,163,176],shalB:'120,200,200',waveD:'150,200,230',waveS:'235,250,250',surf1:'190,230,225',surf2:'238,246,244',wet:[191,168,116],sand:[217,198,144],
    grass:[108,133,68],gB:['82,110,52','128,146,76','140,128,78'],biome:[['190,172,86',.3],['96,150,62',.26],['150,156,130',.22]],earth:'120,92,58',blade:['52,76,32','170,184,104','98,128,58'],
    flowers:['#f4e66a','#f7f3ea','#e07a8a','#9f7ad6','#f0a24a'],flowerN:1,pebble:['#8d8a7f','#a39f92'],edge:'28,44,18',rock:[141,134,121],rockD:'60,52,44',rockL:'196,186,168',peak:1,hq:'150,118,76'},
  desert:{grass:[206,176,116],gB:['196,160,98','222,196,138','184,140,84'],biome:[['230,200,140',.34],['190,130,80',.3],['214,170,110',.26]],earth:'160,110,64',blade:['150,120,70','214,190,130','176,140,84'],
    flowers:['#e6c75a','#d98a4a','#c96a3a'],flowerN:.18,pebble:['#a88c68','#c0a47c'],edge:'110,76,40',rock:[176,108,72],rockD:'92,50,32',rockL:'226,170,124',peak:.25,wet:[214,190,134],sand:[232,214,160],hq:'176,128,80',
    shal:[88,176,168],deep:[24,74,100]},
  canyon:{grass:[176,128,84],gB:['160,104,64','200,150,98','142,92,60'],biome:[['206,150,92',.32],['170,98,62',.3],['190,128,84',.24]],earth:'140,84,50',blade:['118,80,46','200,150,98','150,100,60'],
    flowers:['#d9a84a','#c8643a','#e8c27a'],flowerN:.2,pebble:['#9a7a5c','#b8946e'],edge:'88,52,30',rock:[168,96,64],rockD:'88,44,28',rockL:'224,158,112',peak:.2,wet:[200,170,120],sand:[222,192,142],hq:'170,120,76'},
  swamp:{deep:[22,56,66],deepB:['16,48,56','40,92,92'],shal:[88,128,98],shalB:'110,150,110',waveD:'140,180,170',waveS:'200,225,215',surf1:'170,200,170',surf2:'210,228,210',wet:[120,112,76],sand:[150,140,92],
    grass:[84,112,56],gB:['60,92,42','104,128,60','110,104,56'],biome:[['120,120,60',.32],['70,110,56',.3],['110,96,60',.26]],earth:'84,70,44',blade:['44,66,28','128,150,78','76,104,44'],
    flowers:['#e8e060','#c8d8a0','#d890b0'],flowerN:.5,pebble:['#767a62','#8a8c72'],edge:'24,40,20',rock:[120,116,98],rockD:'50,48,38',rockL:'170,166,140',peak:.5,hq:'122,100,64'},
  crater:{deep:[22,58,84],shal:[70,140,156],grass:[88,112,74],gB:['64,92,64','104,128,92','100,108,84'],biome:[['130,140,110',.3],['70,104,70',.28],['120,120,108',.26]],earth:'96,84,66',blade:['44,68,44','150,170,120','80,108,64'],
    flowers:['#f0e6a0','#d8d8e8','#c0a0d8'],flowerN:.4,pebble:['#7a7c78','#92948e'],edge:'22,36,26',rock:[112,108,104],rockD:'44,42,42',rockL:'180,176,170',peak:1.2,sand:[170,164,140],wet:[142,134,110],hq:'130,112,84'},
  fjord:{deep:[20,56,88],deepB:['10,44,76','34,92,130'],shal:[66,148,168],grass:[96,124,72],gB:['72,100,56','112,140,84','120,122,88'],biome:[['150,160,140',.3],['80,124,70',.28],['140,140,120',.22]],earth:'104,88,62',blade:['46,70,36','160,176,120','88,116,60'],
    flowerN:.5,pebble:['#858880','#9a9c92'],edge:'24,40,24',rock:[124,122,118],rockD:'48,48,48',rockL:'190,190,186',peak:1.3,sand:[200,188,150],wet:[170,156,118],hq:'140,114,80'},
};
/* Jahreszeiten färben die Farbwelt der Karte um (nur Aussehen, kein Einfluss auf das Spiel). gr = wie „grün“ die Landschaft ist (Wüste/Canyon ergrünen und verfärben sich weniger).
   snow = Schneedecke am Boden, ice = Eis auf dem flachen Wasser (beides 0..1), peak = Schneegrenze auf den Bergen (grösser = tiefer). */
const mixC=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),s2a=s=>s.split(',').map(Number),a2s=a=>a.map(v=>Math.round(v)).join(',');
function mapPal(id,season){
  const m=MAPS[id]||MAPS.coast,P=Object.assign({},MAPPAL.green,MAPPAL[m.pal||'green']);
  const gr=({desert:.2,canyon:.25}[m.pal])||1,mg=(c,t)=>a2s(mixC(s2a(c),t.c,t.k)); /* Fleck-Farbe 'r,g,b' zu einer Zielfarbe mischen */
  P.snow=0;P.ice=0;P.gr=gr;P.season=season||'summer';
  const tint=(list,c,k)=>list.map(x=>mg(x,{c,k}));
  if(season==='spring'){
    P.grass=mixC(P.grass,[118,168,62],.5*gr+.12);P.gB=tint(P.gB,[116,170,64],.45*gr+.1);P.biome=P.biome.map(([c,al])=>[mg(c,{c:[130,176,70],k:.4*gr}),al]);
    P.blade=tint(P.blade,[100,160,50],.4*gr);P.flowers=['#fff4f0','#f6b8d0','#f4e66a','#b99af0','#ffffff'];P.flowerN=Math.max(P.flowerN,.25)*(gr>.5?2.6:2.2);
    P.shal=mixC(P.shal,[110,200,196],.25);P.peak*=.75;P.edge=a2s(mixC(s2a(P.edge),[40,70,28],.4*gr))}
  else if(season==='autumn'){
    P.grass=mixC(P.grass,[172,146,60],.46*gr+.12);P.gB=tint(P.gB,[192,130,46],.5*gr+.12);P.biome=[[mg(P.biome[0][0],{c:[214,130,40],k:.6}),.36],[mg(P.biome[1][0],{c:[176,86,38],k:.6*gr+.2}),.32],[mg(P.biome[2][0],{c:[218,176,72],k:.55}),.28]];
    P.blade=tint(P.blade,[170,116,46],.55*gr+.1);P.flowers=['#e8a83a','#c8602a','#e0d098'];P.flowerN*=.4;P.earth='112,78,44';
    P.deep=mixC(P.deep,[44,66,84],.18);P.shal=mixC(P.shal,[104,150,150],.3);P.peak*=1.2;P.edge='70,44,16'}
  else if(season==='winter'){
    const sn=[236,241,247],kw=gr>.5?.86:.5;P.snow=gr>.5?1:.55;P.ice=.9;
    P.grass=mixC(P.grass,sn,kw);P.gB=['218,228,240','240,245,250','204,216,232'];P.biome=[['196,210,228',.34],['232,238,246',.3],['184,202,222',.28]];
    P.earth='132,128,136';P.blade=['148,168,190','240,245,250','186,204,224'];P.flowers=['#ffffff'];P.flowerN=0;P.edge='74,92,118';P.hq='170,160,150';P.pebble=['#8c9096','#a6aab0'];
    P.wet=mixC(P.wet,[196,202,206],.7);P.sand=mixC(P.sand,[226,229,230],.75);P.deep=mixC(P.deep,[16,44,76],.4);P.shal=mixC(P.shal,[150,196,214],.5);
    P.rock=mixC(P.rock,[196,204,212],.3);P.rockL='226,232,238';P.peak=3;P.surf1='210,230,240';P.surf2='244,250,252'}
  return P}
