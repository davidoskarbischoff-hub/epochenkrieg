/* Epochenkrieg – Gelände und Wegfindung.
   Gelände: Raster mit 20-px-Feldern (TERR): 0 = tiefes Wasser, 1 = flaches Wasser, 2 = Land.
   Wegfindung: feineres Raster mit 10-px-Feldern; Gebäude und Ressourcen blockieren, tiefes Wasser blockiert Landeinheiten,
   Land blockiert Schiffe. Gesucht wird mit A*. */
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TG=20,TW=W/TG,TH=H/TG;
let TERR=null,MAINLAND=null;

/* ---------- Gelände erzeugen ---------- */
function genTerrain(seed){
  const R=mulberry(seed+7);
  const mk=(gw,gh)=>{const g=[];for(let i=0;i<(gw+1)*(gh+1);i++)g.push(R());
    return(x,y)=>{const fx=Math.max(0,Math.min(gw-1e-6,x/W*gw)),fy=Math.max(0,Math.min(gh-1e-6,y/H*gh));const ix=Math.floor(fx),iy=Math.floor(fy);
      let tx=fx-ix,ty=fy-iy;tx=tx*tx*(3-2*tx);ty=ty*ty*(3-2*ty);const a=g[iy*(gw+1)+ix],b=g[iy*(gw+1)+ix+1],c=g[(iy+1)*(gw+1)+ix],d=g[(iy+1)*(gw+1)+ix+1];
      return(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty}};
  const n1=mk(9,6),n2=mk(18,12),n3=mk(14,9);
  // punktsymmetrisch, damit beide Seiten gleich fair sind
  const sym=(f,x,y)=>(f(x,y)+f(W-x,H-y))/2;
  const L=Math.hypot(W,H);
  TERR=new Uint8Array(TW*TH);
  const land=new Uint8Array(TW*TH);
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){
    const px=(x+.5)*TG,py=(y+.5)*TG;
    const pp=(H*px+W*py-W*H)/L,t=(px*W+(H-py)*H)/(L*L);
    const w=250+650*Math.pow(Math.abs(t-.5)*2,1.4);
    const noise=(sym(n1,px,py)-.5)*340+(sym(n2,px,py)-.5)*110;
    land[y*TW+x]=w+noise-Math.abs(pp)>0?1:0}
  // flaches Wasser: Küstenstreifen (Abstand zum Land) plus Sandbänke
  const dist=new Int16Array(TW*TH).fill(-1),q=[];
  for(let i=0;i<land.length;i++)if(land[i]){dist[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const i=q[h],x=i%TW,y=(i/TW)|0;if(dist[i]>=9)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(dist[j]<0){dist[j]=dist[i]+1;q.push(j)}}}
  for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){const i=y*TW+x,px=(x+.5)*TG,py=(y+.5)*TG;
    if(land[i]){TERR[i]=2;continue}
    const bank=sym(n3,px,py)>.6&&dist[i]>=0&&dist[i]<=9;
    TERR[i]=(dist[i]>=0&&dist[i]<=3)||bank?1:0}
  // Landfelder, die vom Hauptland aus nicht erreichbar sind (kleine Inseln), merken
  MAINLAND=new Uint8Array(TW*TH);
  const sx=Math.floor(W*.17/TG),sy=Math.floor(H*.83/TG);
  const st=[sy*TW+sx];MAINLAND[st[0]]=1;
  while(st.length){const i=st.pop(),x=i%TW,y=(i/TW)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=TW||ny>=TH)continue;const j=ny*TW+nx;if(!MAINLAND[j]&&TERR[j]===2){MAINLAND[j]=1;st.push(j)}}}
}
function terrAt(x,y){const cx=Math.max(0,Math.min(TW-1,(x/TG)|0)),cy=Math.max(0,Math.min(TH-1,(y/TG)|0));return TERR[cy*TW+cx]}
const onLand=(x,y)=>terrAt(x,y)===2;
const inWater=(x,y)=>terrAt(x,y)<2;

/* ---------- Wegfindung ---------- */
const NS=10,NW=W/NS,NH=H/NS;
let navT=null,navDyn=null;
const navSeen=new Uint32Array(NW*NH),navG=new Float32Array(NW*NH),navPar=new Int32Array(NW*NH);let navGen=0;
function navInit(){navT=new Uint8Array(NW*NH);navDyn=new Uint8Array(NW*NH);
  for(let y=0;y<NH;y++)for(let x=0;x<NW;x++)navT[y*NW+x]=terrAt((x+.5)*NS,(y+.5)*NS)}
/* Gebäude und feste Ressourcen blockieren die Felder in ihrem Umkreis (+5 für die Breite der Einheiten) */
function navStamp(e,sign){const r=e.r+5,x0=Math.max(0,Math.floor((e.x-r)/NS)),x1=Math.min(NW-1,Math.floor((e.x+r)/NS)),y0=Math.max(0,Math.floor((e.y-r)/NS)),y1=Math.min(NH-1,Math.floor((e.y+r)/NS));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const dx=(x+.5)*NS-e.x,dy=(y+.5)*NS-e.y;if(dx*dx+dy*dy<=r*r)navDyn[y*NW+x]+=sign}}
const navOpen=(i,naval)=>navDyn[i]===0&&(naval?navT[i]<=1:navT[i]>=1);
const navCell=(x,y)=>Math.max(0,Math.min(NH-1,(y/NS)|0))*NW+Math.max(0,Math.min(NW-1,(x/NS)|0));
/* Gelände allein (ohne Gebäude): darf diese Einheit hier stehen? */
function terrOk(x,y,naval){const t=terrAt(x,y);return naval?t<=1:t>=1}
/* Freie Sicht zwischen zwei Punkten bis zur Länge 'len'? Felder nahe am Start zählen nicht (Start darf im Rand eines Hindernisses liegen) */
function navLos(x0,y0,x1,y1,naval,len){
  const dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy);if(d<1)return true;const L=Math.min(d,len===undefined?d:len);
  for(let s=4;s<=L;s+=4){const x=x0+dx/d*s,y=y0+dy/d*s;if(s>10&&!navOpen(navCell(x,y),naval))return false;if(!terrOk(x,y,naval))return false}
  return true}
/* A*: Weg von (sx,sy) bis auf 'goalR' Abstand an (tx,ty). Gibt eine Liste von Wegpunkten zurück, oder null.
   'seed' != 0 würfelt die Kosten leicht, damit festgefahrene Einheiten einen anderen Weg nehmen. */
function navPath(sx,sy,tx,ty,goalR,naval,seed){
  const s=navCell(sx,sy);navGen++;
  const gx=tx/NS,gy=ty/NS,gr=goalR/NS;
  const hx=(i)=>{const dx=Math.abs((i%NW)+.5-gx),dy=Math.abs(((i/NW)|0)+.5-gy);return(Math.max(dx,dy)+.4142*Math.min(dx,dy))-gr};
  const heap=[],hf=[];
  const push=(i,f)=>{heap.push(i);hf.push(f);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[heap[p],heap[k]]=[heap[k],heap[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const r=heap[0],lh=heap.pop(),lf=hf.pop();if(heap.length){heap[0]=lh;hf[0]=lf;let k=0;for(;;){let l=2*k+1,rr=l+1,m=k;if(l<heap.length&&hf[l]<hf[m])m=l;if(rr<heap.length&&hf[rr]<hf[m])m=rr;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return r};
  navSeen[s]=navGen;navG[s]=0;navPar[s]=-1;push(s,hx(s));
  let goal=-1,n=0,best=s,bestH=hx(s);
  while(heap.length&&n++<30000){
    const i=pop(),x=i%NW,y=(i/NW)|0,h=hx(i);
    if(h<bestH){bestH=h;best=i}
    if(h<=0.5&&(i===s||navOpen(i,naval))){goal=i;break}
    for(let k=0;k<8;k++){const dx=k<4?[1,-1,0,0][k]:[1,1,-1,-1][k-4],dy=k<4?[0,0,1,-1][k]:[1,-1,1,-1][k-4];
      const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=NW||ny>=NH)continue;const j=ny*NW+nx;if(!navOpen(j,naval))continue;
      if(k>=4&&(!navOpen(y*NW+nx,naval)||!navOpen(ny*NW+x,naval)))continue; // keine Ecken schneiden
      let c=k<4?1:1.4142;if(seed)c*=1+((((j*2654435761)^(seed*40503))>>>0)%100)/100*1.4;
      const g=navG[i]+c;if(navSeen[j]!==navGen||g<navG[j]){navSeen[j]=navGen;navG[j]=g;navPar[j]=i;push(j,g+hx(j))}}
  }
  if(goal<0)return null;
  const cells=[];for(let i=goal;i>=0;i=navPar[i])cells.push(i);cells.reverse();
  let pts=cells.map(i=>({x:(i%NW+.5)*NS,y:(((i/NW)|0)+.5)*NS}));
  // Weg glätten: Zwischenpunkte weglassen, wenn man direkt hinüberlaufen kann
  const out=[];let a=0;
  while(a<pts.length-1){let b=pts.length-1;while(b>a+1&&!navLos(pts[a].x,pts[a].y,pts[b].x,pts[b].y,naval))b--;out.push(pts[b]);a=b}
  return out;
}
