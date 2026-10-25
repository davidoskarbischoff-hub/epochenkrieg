/* Epochenkrieg – Kartenvorschau: stimmungsvolle Bilder der WIRKLICH erzeugten Karte (gleiche Erzeugung wie im Spiel, gleicher Seed → gleiche Karte).
   - Kacheln (Hauptmenü, Lobby): Gelände mit Jahreszeit-Farben, Hangschatten, Küstenschaum und Startplätzen; werden gestaffelt erzeugt und gemerkt.
   - Grosse Vorschau: zusätzlich Vorkommen (Wälder, Gold, Eisen, Stein, Öl, Beeren, Fisch) und Gebiet der beiden Startplätze.
   Die Erzeugung läuft in einem Zwischenzustand: alle globalen Kartenfelder (TERR, HL, G …) werden gesichert und danach zurückgesetzt, ein laufendes Spiel merkt nichts. */
const MPV=(()=>{
  const cache=new Map(),bigCache=new Map(),Q=[];let timer=0;
  const SZ={S:[.5,.62],M:[.78,.84],L:[1,.9]};
  const clamp=(v,a,b)=>v<a?a:v>b?b:v,s3=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
  const hash=(x,y)=>{const t=Math.sin(x*12.9898+y*78.233)*43758.5453;return t-Math.floor(t)};
  const vn=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return(hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v};
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
  function paint(cv,S,sc,opt){
    opt=opt||{};const w=TW*sc,h=TH*sc;cv.width=w;cv.height=h;const x=cv.getContext('2d'),im=x.createImageData(w,h),d=im.data,P=S.pal,T=S.terr,H0=S.hl,N=TW*TH;
    /* geglättete Felder: Land-Anteil, Land+flach-Anteil, Fels-Anteil, Höhe, Hangschatten (NW-Licht), Steilheit */
    const lg=new Float32Array(N),sg=new Float32Array(N),rk=new Float32Array(N),hs=new Float32Array(N),shd=new Float32Array(N),slp=new Float32Array(N);
    for(let y=0;y<TH;y++)for(let xx=0;xx<TW;xx++){let a=0,b=0,c=0,e=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=clamp(xx+dx,0,TW-1),ny=clamp(y+dy,0,TH-1),i=ny*TW+nx,wt=dx||dy?1:3,t=T[i];a+=wt*(t>=2?1:0);b+=wt*(t>=1?1:0);c+=wt*(t===3?1:0);e+=wt*Math.max(0,H0[i]);n+=wt}
      const i=y*TW+xx;lg[i]=a/n;sg[i]=b/n;rk[i]=c/n;hs[i]=e/n}
    for(let y=0;y<TH;y++)for(let xx=0;xx<TW;xx++){const i=y*TW+xx,g=(a,b)=>hs[clamp(b,0,TH-1)*TW+clamp(a,0,TW-1)];shd[i]=g(xx-1,y-1)-g(xx+1,y+1);slp[i]=Math.hypot(g(xx+1,y)-g(xx-1,y),g(xx,y+1)-g(xx,y-1))}
    let mx=0;for(let i=0;i<N;i++)if(T[i]===3&&H0[i]>mx)mx=H0[i];
    const grass=P.grass,gB=P.gB.map(num),deep=P.deep,shal=P.shal,rock=P.rock,sand=P.sand,wet=P.wet,snowC=[238,243,248],iceC=[212,232,240],foamC=num(P.surf2),sn=mx>2.2&&P.peak>0?mx*.5/P.peak:99;
    const tn={spring:[.02,.04,-.02],autumn:[.08,.02,-.1],winter:[-.08,-.02,.08]}[P.season]||[0,0,0]; /* Rand der Vorschau nimmt die Stimmung der Jahreszeit an */
    let r=0,g=0,b=0;const mixt=(t,a)=>{r+=(a[0]-r)*t;g+=(a[1]-g)*t;b+=(a[2]-b)*t};
    for(let Y=0;Y<h;Y++){const fy=clamp((Y+.5)/sc-.5,0,TH-1.001),iy=fy|0,ty=fy-iy;
      for(let X=0;X<w;X++){const fx=clamp((X+.5)/sc-.5,0,TW-1.001),ix=fx|0,tx=fx-ix,i0=iy*TW+ix;
        const sm=a=>(a[i0]*(1-tx)+a[i0+1]*tx)*(1-ty)+(a[i0+TW]*(1-tx)+a[i0+TW+1]*tx)*ty;
        const L=sm(lg),S2=sm(sg),RK=sm(rk),HH=sm(hs),SH=sm(shd),SL=sm(slp),m=s3(.44,.56,L),nz=vn(X/sc*.3,Y/sc*.3),nz2=vn(X/sc*.9+9,Y/sc*.9);
        /* Wasser: tief → flach, Eis im Winter, Küstenschaum */
        const tw=s3(.3,.8,S2);r=deep[0]+(shal[0]-deep[0])*tw;g=deep[1]+(shal[1]-deep[1])*tw;b=deep[2]+(shal[2]-deep[2])*tw;
        {const k=.93+.14*nz;r*=k;g*=k;b*=k}
        if(P.ice)mixt(P.ice*s3(.4,.8,S2)*(.8+.2*nz2),iceC);
        if(m<1){const f=s3(.08,.46,L)*(1-P.ice*.6);if(f>0)mixt(f*.62,foamC)}
        if(m>0){const R0=r,G0=g,B0=b;
          /* Land: Wiese mit Flecken, Höhenfarbe, Fels, Schnee auf Gipfeln, Strand, Schneedecke */
          r=grass[0];g=grass[1];b=grass[2];mixt(nz*.65,gB[1]);mixt(nz2*.35,gB[0]);if(HH>1.3)mixt(s3(1.3,4.6,HH)*.5,gB[2]);
          const rr=s3(.12,.7,RK);if(rr>0){const k=.8+.4*nz2;mixt(rr,[rock[0]*k,rock[1]*k,rock[2]*k]);if(HH>sn)mixt(s3(sn,sn+mx*.18,HH)*rr,snowC)}
          if(L<.72)mixt(s3(.72,.5,L)*(1-rr),L<.58?wet:sand);
          if(P.snow)mixt(P.snow*(1-rr*.55)*(1-s3(.12,.55,SL))*(.88+.12*nz2),snowC);
          const k=1+clamp(SH*(.17+rr*.14),-.34,.34);r*=k;g*=k;b*=k;
          r=R0+(r-R0)*m;g=G0+(g-G0)*m;b=B0+(b-B0)*m}
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
