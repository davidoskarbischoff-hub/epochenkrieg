/* Epochenkrieg – Kartenvorschau: stimmungsvolle Bilder der WIRKLICH erzeugten Karte (gleiche Erzeugung wie im Spiel, gleicher Seed → gleiche Karte).
   - Kacheln (Hauptmenü, Lobby): Gelände mit Jahreszeit-Farben, Hangschatten, Küstenschaum und Startplätzen; werden gestaffelt erzeugt und gemerkt.
   - Grosse Vorschau: zusätzlich Vorkommen (Wälder, Gold, Eisen, Stein, Öl, Beeren, Fisch) und Gebiet der beiden Startplätze.
   Die Erzeugung läuft in einem Zwischenzustand: alle globalen Kartenfelder (TERR, HL, G …) werden gesichert und danach zurückgesetzt, ein laufendes Spiel merkt nichts. */
const MPV=(()=>{
  const cache=new Map(),bigCache=new Map(),Q=[];let timer=0;
  const SZ={S:[.5,.62],M:[.78,.84],L:[1,.9]};
  const clamp=(v,a,b)=>v<a?a:v>b?b:v,s3=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
  const ih=(x,y)=>{let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return(ih(ix,iy)*(1-u)+ih(ix+1,iy)*u)*(1-v)+(ih(ix,iy+1)*(1-u)+ih(ix+1,iy+1)*u)*v};
  const fb=(x,y)=>.55*vn(x,y)+.3*vn(x*2.1+3.3,y*2.1+7.1)+.15*vn(x*4.3+11,y*4.3+2);
  const keyOf=(id,o)=>[id,o.seed,o.size,o.water,o.mount,o.season].join('|');

  /* ----- Erzeugen (mit Sicherung der globalen Kartenfelder) ----- */
  const save=()=>({G,TERR,HL,DSEA,MAINLAND,MAINPT,navT,navDyn,navGate,navVer,MAPCFG,MAPFEAT,startK,playF,curMap,mw:MOPT.water,mm:MOPT.mount,ms:MOPT.sel,mz:MOPT.season});
  const load=s=>{G=s.G;TERR=s.TERR;HL=s.HL;DSEA=s.DSEA;MAINLAND=s.MAINLAND;MAINPT=s.MAINPT;navT=s.navT;navDyn=s.navDyn;navGate=s.navGate;navVer=s.navVer;MAPCFG=s.MAPCFG;MAPFEAT=s.MAPFEAT;startK=s.startK;playF=s.playF;curMap=s.curMap;
    MOPT.water=s.mw;MOPT.mount=s.mm;MOPT.sel=s.ms;MOPT.season=s.mz;navFields.length=0};
  const scratchG=()=>({late:[],nation:[null,null],nfx:[nationFx(),nationFx()],t:0,ents:[],byId:new Map(),nid:1,epoch:[0,0],tfx:[techFx(new Set()),techFx(new Set())],tech:[new Set(),new Set()],bones:[],mem:new Map(),pop:[0,0],cap:[0,0],res:[{},{}],mp:false});
  function run(id,o,full){
    const sv=save();let out=null;
    try{
      const[sk,pf]=SZ[o.size]||SZ.L;startK=sk;playF=pf;curMap=id;MOPT.water=o.water;MOPT.mount=o.mount;MOPT.sel=o.season;const season=seasonOf(o.season,o.seed);MOPT.season=season;
      genTerrain(o.seed,id);const cfg=MAPCFG;let bases,nodes=[];
      if(full){ /* ganze Erzeugung wie im Spiel (Vorkommen, Wälder, Tiere), nur ohne Bodenbild */
        G=scratchG();navInit();genMap(o.seed);bases=G.ents.filter(e=>e.type==='hq').sort((a,b)=>b.team-a.team).map(e=>({x:e.x,y:e.y}));
        nodes=G.ents.filter(e=>e.kind==='node'&&!e.dead).map(e=>({t:e.type,x:e.x,y:e.y,sz:e.sz||1}))}
      else{bases=pickBases(cfg);genRelief(bases[0],bases[1],o.seed,id);applyPlayRect(playF);clearBases(bases);ensureWalk(bases);if(cfg.cliff){const rc=cfg.shape==='fjord'?560:380;carveCoast(bases[0].x,bases[0].y,rc);carveCoast(W-bases[0].x,H-bases[0].y,rc)}}
      out={id,o,season,bases,nodes,terr:TERR.slice(),hl:HL.slice(),pal:mapPal(id,season)};
    }catch(err){console.warn('Kartenvorschau',err)}finally{load(sv)}
    return out}

  /* ----- Malen ----- */
  const num=s=>s.split(',').map(Number);
  /* Felder in Kachel-Auflösung (einmal je Karte, unabhängig vom Massstab): Anteile, Höhe, Hangschatten fein/grob, Steilheit, Schlagschatten */
  function fields(S){
    if(S._f)return S._f;const T=S.terr,H0=S.hl,N=TW*TH;
    const lg=new Float32Array(N),sg=new Float32Array(N),rk=new Float32Array(N),hs=new Float32Array(N),shd=new Float32Array(N),sh2=new Float32Array(N),slp=new Float32Array(N),cast=new Float32Array(N);
    for(let y=0;y<TH;y++)for(let xx=0;xx<TW;xx++){let a=0,b=0,c=0,e=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=clamp(xx+dx,0,TW-1),ny=clamp(y+dy,0,TH-1),i=ny*TW+nx,wt=dx||dy?1:3,t=T[i];a+=wt*(t>=2?1:0);b+=wt*(t>=1?1:0);c+=wt*(t===3?1:0);e+=wt*Math.max(0,H0[i]);n+=wt}
      const i=y*TW+xx;lg[i]=a/n;sg[i]=b/n;rk[i]=c/n;hs[i]=e/n}
    const hq=new Float32Array(N);for(let i=0;i<N;i++){const v=hs[i];hq[i]=v<4?v:4+(v-4)*.3}  /* hohe Bergwand wird fürs Licht gestaucht (sonst Wellen-Streifen) */
    const g=(a,b)=>hq[clamp(b,0,TH-1)*TW+clamp(a,0,TW-1)];
    for(let y=0;y<TH;y++)for(let xx=0;xx<TW;xx++){const i=y*TW+xx;shd[i]=g(xx-1,y-1)-g(xx+1,y+1);sh2[i]=(g(xx-3,y-3)-g(xx+3,y+3))*.45+(g(xx-2,y)-g(xx+2,y)+g(xx,y-2)-g(xx,y+2))*.3;slp[i]=Math.hypot(g(xx+1,y)-g(xx-1,y),g(xx,y+1)-g(xx,y-1))}
    /* Schlagschatten: Licht kommt von links oben; wer von einem höheren Punkt in Richtung Licht überragt wird, liegt im Schatten */
    for(let y=0;y<TH;y++)for(let xx=0;xx<TW;xx++){const i=y*TW+xx;if(T[i]<2)continue;let sd=0;
      for(let k=1;k<=9;k++){const nx=xx-k,ny=y-k;if(nx<0||ny<0)break;const dh=hq[ny*TW+nx]-(hq[i]+k*.62);if(dh>0){const v=Math.min(1,dh/1.6);if(v>sd)sd=v;if(sd>=1)break}}
      cast[i]=sd}
    return S._f={lg,sg,rk,hs,shd,sh2,slp,cast}}
  function paint(cv,S,sc,opt){
    opt=opt||{};const w=TW*sc,h=TH*sc;cv.width=w;cv.height=h;const x=cv.getContext('2d'),im=x.createImageData(w,h),d=im.data,P=S.pal,T=S.terr,H0=S.hl;
    const F=fields(S),lg=F.lg,sg=F.sg,rk=F.rk,hs=F.hs,shd=F.shd,sh2=F.sh2,slp=F.slp,cast=F.cast;
    let mx=0;for(let i=0;i<T.length;i++)if(T[i]===3&&H0[i]>mx)mx=H0[i];
    const grass=P.grass,gB=P.gB.map(num),deep=P.deep,shal=P.shal,rock=P.rock,sand=P.sand,wet=P.wet,snowC=[238,243,248],iceC=[212,232,240],foamC=num(P.surf2),sn=mx>2.2&&P.peak>0?mx*.5/P.peak:99;
    const tn={spring:[.02,.04,-.02],autumn:[.08,.02,-.1],winter:[-.08,-.02,.08]}[P.season]||[0,0,0]; /* Rand der Vorschau nimmt die Stimmung der Jahreszeit an */
    let r=0,g=0,b=0;const mixt=(t,a)=>{r+=(a[0]-r)*t;g+=(a[1]-g)*t;b+=(a[2]-b)*t};
    const dry=S.id==='desert'||S.id==='canyon',PF=(SZ[S.o.size]||SZ.L)[1],hx=W*PF/2,hy=H*PF/2,
      wv=(x,y)=>Math.sin(x*.0047+y*.0031)*55+Math.sin(x*.0113-y*.0087+1.7)*30+Math.sin(y*.019+x*.004)*14,wob=(x,y)=>(wv(x,y)+wv(W-x,H-y))/2;
    for(let Y=0;Y<h;Y++){const fy=clamp((Y+.5)/sc-.5,0,TH-1.001),iy=fy|0,ty=fy-iy;
      for(let X=0;X<w;X++){const fx=clamp((X+.5)/sc-.5,0,TW-1.001),ix=fx|0,tx=fx-ix,i0=iy*TW+ix;
        const sm=a=>(a[i0]*(1-tx)+a[i0+1]*tx)*(1-ty)+(a[i0+TW]*(1-tx)+a[i0+TW+1]*tx)*ty;
        const L=sm(lg),S2=sm(sg),RK=sm(rk),HH=sm(hs),SH=sm(shd),SH2=sm(sh2),SL=sm(slp),CS=sm(cast),m=s3(.44,.56,L),u=X/sc,v=Y/sc,nz=fb(u*.3,v*.3),nz2=vn(u*.9+9,v*.9),fine=vn(u*2.6+31,v*2.6+5);
        /* Wasser: tief → flach, Eis im Winter, Küstenschaum */
        const tw=s3(.3,.8,S2);r=deep[0]+(shal[0]-deep[0])*tw;g=deep[1]+(shal[1]-deep[1])*tw;b=deep[2]+(shal[2]-deep[2])*tw;
        {const k=.9+.2*nz;r*=k;g*=k;b*=k}
        if(P.ice)mixt(P.ice*s3(.4,.8,S2)*(.8+.2*nz2),iceC);
        if(m<1){const f=s3(.08,.46,L)*(1-P.ice*.6);if(f>0)mixt(f*.62,foamC)}
        if(m>0){const R0=r,G0=g,B0=b;
          /* Land: Wiese mit Flecken, Höhenfarbe, Fels mit Schichten und Spalten, Schnee auf Gipfeln, Strand, Schneedecke */
          r=grass[0];g=grass[1];b=grass[2];mixt(nz*.7,gB[1]);mixt(nz2*.3,gB[0]);if(HH>1.3)mixt(s3(1.3,4.6,HH)*.5,gB[2]);
          if(dry){const band=.5+.5*Math.sin(HH*1.9+nz*2.4);mixt(.16*band,gB[2])}
          const cl=Math.max(RK,s3(.38,1.25,SL)*.7);                 /* Fels oder steile Hangkante */
          if(cl>0){const band=.5+.5*Math.sin(HH*2.3+nz*2.6),rg=1-Math.abs(2*fb(u*.55+4,v*.55)-1),k=(.72+.4*nz2)*(.88+.22*band)*(.8+.3*rg)*(.94+.1*fine);mixt(s3(.1,.62,cl),[rock[0]*k,rock[1]*k,rock[2]*k]);
            if(HH>sn){const sf=s3(sn,sn+mx*.16,HH)*RK;mixt(sf*(.78+.22*rg),snowC);const rd=(rg-.5)*.34+(fine-.5)*.12+(nz-.5)*.2;r*=1+rd*sf;g*=1+rd*sf*1.02;b*=1+rd*sf*.9}}   /* Schneefelder bekommen Grate und Mulden */
          if(L<.72)mixt(s3(.72,.5,L)*(1-cl),L<.58?wet:sand);
          if(P.snow)mixt(P.snow*(1-cl*.5)*(1-s3(.12,.55,SL))*(.88+.12*nz2),snowC);
          /* Licht: feiner und grober Hangschatten, dazu Schlagschatten der Berge (kühl) */
          const k=1+clamp(SH*(.2+cl*.16)+SH2*(.11+cl*.15),-.5,.42);r*=k;g*=k;b*=k;
          if(CS>0){const c=CS*(.34+.1*cl);r*=1-c*.95;g*=1-c*.9;b*=1-c*.66}
          r=R0+(r-R0)*m;g=G0+(g-G0)*m;b=B0+(b-B0)*m}
        if(PF<.999){ /* Randgebirge ausserhalb des Spielfelds: ruhige, dunkle Felswand ohne Schnee und Wellen */
          const px=u*TG,py=v*TG,o2=Math.max(Math.abs(px-W/2)-hx,Math.abs(py-H/2)-hy)+wob(px,py),ou=s3(-30,150,o2);
          if(ou>0){const lum=.34+.1*nz2;mixt(ou*.86,[rock[0]*lum+14*(P.snow?1:0),rock[1]*lum+16*(P.snow?1:0),rock[2]*lum+20*(P.snow?1:0)])}}
        const q2=(Math.pow(X/w-.5,2)+Math.pow(Y/h-.5,2))*2,vg=1-.3*q2,sun=1+.07*(1-(X/w+Y/h))*(P.snow?.5:1),o=(Y*w+X)*4;d[o]=clamp(r*vg*sun*(1+tn[0]*q2),0,255);d[o+1]=clamp(g*vg*sun*(1+tn[1]*q2),0,255);d[o+2]=clamp(b*vg*sun*(1+tn[2]*q2),0,255);d[o+3]=255}}
    x.putImageData(im,0,0);
    /* Vorkommen als kleine Symbole (nur grosse Vorschau) */
    const U=sc/TG;
    if(opt.syms&&S.nodes.length){
      const tc=P.season==='winter'?['rgba(24,36,30,.5)','rgba(46,84,60,.95)']:P.season==='autumn'?['rgba(40,24,10,.5)','rgba(150,72,22,.9)']:['rgba(10,28,10,.5)','rgba(28,70,26,.9)'];
      x.fillStyle=tc[0];x.beginPath();for(const n of S.nodes)if(n.t==='tree'){x.moveTo(n.x*U+1.7*sc/2+.6,n.y*U+.8);x.arc(n.x*U+.6,n.y*U+.8,1.7*sc/2,0,6.283)}x.fill();
      x.fillStyle=tc[1];x.beginPath();for(const n of S.nodes)if(n.t==='tree'){x.moveTo(n.x*U+1.7*sc/2,n.y*U);x.arc(n.x*U,n.y*U,1.7*sc/2,0,6.283)}x.fill();
      x.fillStyle='#d83a4a';x.beginPath();for(const n of S.nodes)if(n.t==='bush'){x.moveTo(n.x*U+1.4*sc/2,n.y*U);x.arc(n.x*U,n.y*U,1.4*sc/2,0,6.283)}x.fill();
      x.fillStyle='rgba(235,250,255,.85)';x.beginPath();for(const n of S.nodes)if(n.t==='fish'||n.t==='dolphin'||n.t==='whale'){const q=n.t==='fish'?1:n.t==='dolphin'?1.5:2.2;x.moveTo(n.x*U+1.5*q,n.y*U);x.ellipse(n.x*U,n.y*U,1.6*q*sc/2,.9*q*sc/2,0,0,6.283)}x.fill();
      const ore={stone:['#c9c4b8','#4a463e','sq'],iron:['#d8754a','#3c1a10','hex'],gold:['#ffd23c','#5a3c06','dia'],oil:['#1a1a22','#8fd6ff','drop']};
      for(const n of S.nodes){const c=ore[n.t];if(!c)continue;const px=n.x*U,py=n.y*U,q=(2.6+1.3*Math.sqrt(n.sz))*sc/2;
        x.beginPath();if(c[2]==='sq')x.rect(px-q,py-q*.8,2*q,1.6*q);else if(c[2]==='dia'){x.moveTo(px,py-q*1.2);x.lineTo(px+q,py);x.lineTo(px,py+q*1.2);x.lineTo(px-q,py)}
          else if(c[2]==='hex'){for(let k=0;k<6;k++){const a=k*1.0472+.52;x.lineTo(px+Math.cos(a)*q,py+Math.sin(a)*q)}}else{x.moveTo(px,py-q*1.3);x.quadraticCurveTo(px+q*1.2,py+q*.2,px,py+q);x.quadraticCurveTo(px-q*1.2,py+q*.2,px,py-q*1.3)}
        x.closePath();x.fillStyle=c[0];x.fill();x.lineWidth=Math.max(1,sc*.4);x.strokeStyle=c[1];x.stroke()}}
    /* Startplätze: Gebiet als weicher Kreis, Fahne mit Haus */
    if(opt.marks!==false)for(const[i,bs]of S.bases.entries()){const col=i?['#e0533c','rgba(224,83,60,.18)','#ffb0a0']:['#4a8fe0','rgba(74,143,224,.2)','#a8cfff'],px=bs.x*U,py=bs.y*U;
      if(opt.syms){x.beginPath();x.arc(px,py,260*U,0,6.283);x.fillStyle=col[1];x.fill();x.lineWidth=Math.max(1,sc*.5);x.strokeStyle=col[2];x.setLineDash([sc*2,sc*1.6]);x.stroke();x.setLineDash([])}
      const q=opt.syms?6.5*sc/2.2:4.4;x.beginPath();x.arc(px,py,q,0,6.283);x.fillStyle=col[0];x.fill();x.lineWidth=Math.max(1.2,sc*.55);x.strokeStyle='#fff';x.stroke();
      x.beginPath();x.moveTo(px-q*.55,py+q*.4);x.lineTo(px-q*.55,py-q*.1);x.lineTo(px,py-q*.55);x.lineTo(px+q*.55,py-q*.1);x.lineTo(px+q*.55,py+q*.4);x.closePath();x.fillStyle='#fff';x.fill()}
    if(opt.syms){const cx=w-34*sc/3,cy=34*sc/3,R0=20*sc/3;x.save();x.translate(cx,cy);x.globalAlpha=.85;x.beginPath();x.arc(0,0,R0,0,6.283);x.fillStyle='rgba(20,15,8,.55)';x.fill();x.lineWidth=Math.max(1,sc*.35);x.strokeStyle='#e3b66a';x.stroke();
      x.beginPath();x.moveTo(0,-R0*.85);x.lineTo(R0*.2,0);x.lineTo(0,R0*.25);x.lineTo(-R0*.2,0);x.closePath();x.fillStyle='#f3d79a';x.fill();x.beginPath();x.moveTo(0,R0*.85);x.lineTo(R0*.16,0);x.lineTo(-R0*.16,0);x.closePath();x.fillStyle='#8a6a32';x.fill();
      x.fillStyle='#f3d79a';x.font='bold '+Math.round(R0*.6)+'px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.fillText('N',0,-R0*1.35);x.restore()}
    return cv}

  /* ----- Kacheln: gestaffelt erzeugen (je Aufruf höchstens eine Karte), mit Zwischenspeicher ----- */
  function thumb(img,id,o){
    const k=keyOf(id,o);img.dataset.k=k;const hit=cache.get(k);
    if(hit){img.src=hit;img.classList.remove('pv-wait');return}
    img.removeAttribute('src');img.classList.add('pv-wait');Q.push({k,id,o,img});pump()}
  function pump(){
    if(timer)return;
    timer=setTimeout(()=>{timer=0;const job=Q.shift();if(!job)return;
      if(job.img.dataset.k===job.k&&job.img.isConnected){let url=cache.get(job.k);
        if(!url){const S=run(job.id,job.o,false);if(S){const cv=document.createElement('canvas');paint(cv,S,1,{marks:true});url=cv.toDataURL('image/jpeg',.9);cache.set(job.k,url);if(cache.size>160)cache.delete(cache.keys().next().value)}}
        if(url){job.img.src=url;job.img.classList.remove('pv-wait')}}
      if(Q.length)pump()},20)}
  /* alle Kacheln in einem Bereich (img[data-pv]) füllen; die gewählte Karte zuerst */
  function fill(root,o,first){
    Q.length=0;const imgs=[...root.querySelectorAll('img[data-pv]')];imgs.sort((a,b)=>(b.dataset.pv===first)-(a.dataset.pv===first));
    for(const im of imgs)thumb(im,im.dataset.pv,o)}
  /* grosse Vorschau: ganze Erzeugung mit Vorkommen, dann malen */
  function big(cv,id,o,sc){
    const k=keyOf(id,o);let S=bigCache.get(k);
    if(!S){S=run(id,o,true);if(!S)return null;bigCache.set(k,S);if(bigCache.size>6)bigCache.delete(bigCache.keys().next().value)}
    paint(cv,S,sc||3,{syms:true});return S}
  /* einzelnes Bild (Datenadresse) für Stellen ohne img[data-pv]; Rückgabe sofort, falls schon erzeugt */
  const cached=(id,o)=>cache.get(keyOf(id,o))||'';
  return{run,paint,thumb,fill,big,cached,keyOf,stop:()=>{Q.length=0}}
})();
/* Rückfall für ältere Aufrufe: fertige Kachel oder leer */
function mapPreview(id,o){return MPV.cached(id,o||{seed:11,size:'L',water:1,mount:1,season:'summer'})}
