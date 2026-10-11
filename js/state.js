/* Epochenkrieg – Grundzustand: Seite, Kamera, Nebel des Krieges, Gebiet, Bauregeln, Mehrspieler-Schalter (NET).
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d'),mm=$('mini'),mctx=mm.getContext('2d'),view=$('view');
let dpr=1,VW=0,VH=0,MW=0,MH=0;
const cam={x:0,y:0,z:1};
/* Ton: Eigene Geräusche immer, fremde nur wenn sie im Bild sind */
/* ---------- Nebel des Krieges ---------- */
const FC=20,FW=W/FC,FH=H/FC;
let visF=null,exF=null,terrK=null,terrT=null,fogEx=null,fogVis=null,fogCv=null,fogCtx=null,fogImg=null,fogT=0,terr=null,terrCv=null,terrCtx=null,terrImg=null;
function fogReset(){fogEx=new Uint8Array(FW*FH);fogVis=new Uint8Array(FW*FH);visF=new Float32Array(FW*FH);exF=new Float32Array(FW*FH);terrK=new Float32Array(FW*FH);terrT=new Int8Array(FW*FH);fogCv=document.createElement('canvas');fogCv.width=FW;fogCv.height=FH;fogCtx=fogCv.getContext('2d');fogImg=fogCtx.createImageData(FW,FH);terr=new Int8Array(FW*FH);terrCv=document.createElement('canvas');terrCv.width=FW;terrCv.height=FH;terrCtx=terrCv.getContext('2d');terrImg=terrCtx.createImageData(FW,FH);fogT=0;fogUpdate()}
const fogIdx=(x,y)=>Math.max(0,Math.min(FH-1,y/FC|0))*FW+Math.max(0,Math.min(FW-1,x/FC|0));
/* Erze, Gold und Öl sieht man erst, wenn das Gebiet erkundet wurde (Nebel des Krieges); Bäume und Büsche sieht man immer */
const HIDDEN_NODES=new Set(['stone','iron','gold','oil']);
function nodeKnown(e){return !HIDDEN_NODES.has(e.type)||!fogEx||fogEx[fogIdx(e.x,e.y)]===1}
function sightOf(e){return e.kind==='unit'?UNITS[e.type].sight:e.built?BLDS[e.type].sight*(e.spec==='obs'?2:1)*(1.2+.05*(G.epoch[e.team]||0)):50}
/* Gebiet: jedes fertige Gebäude beansprucht einen Kreis; bei Überschneidung gewinnt das nähere Gebäude */
const ss=t=>{t=t<0?0:t>1?1:t;return t*t*(3-2*t)};
function terrUpdate(){
  terrK.fill(9);terrT.fill(-1);terr.fill(-1);
  for(const e of G.ents){if(e.dead||e.kind!=='bld'||!e.built)continue;const rad=BLDS[e.type].claim*(1+(G.tfx?G.tfx[e.team].claim:0))*(e.spec==='obs'?1.7:1)*(1.35+.07*(G.epoch[e.team]||0));if(!BLDS[e.type].claim)continue;const rc=rad/FC,cx=e.x/FC,cy=e.y/FC,R=rc*1.14;
    for(let y=Math.max(0,Math.floor(cy-R));y<=Math.min(FH-1,Math.ceil(cy+R));y++)for(let x=Math.max(0,Math.floor(cx-R));x<=Math.min(FW-1,Math.ceil(cx+R));x++){const dx=x+.5-cx,dy=y+.5-cy,k=Math.sqrt(dx*dx+dy*dy)/rc,i=y*FW+x;if(k<=1.14&&k<terrK[i]){terrK[i]=k;terrT[i]=e.team}}}
  for(let i=0;i<terr.length;i++)if(terrK[i]<=1)terr[i]=terrT[i];
}
/* Warum darf hier nicht gebaut werden? (null = erlaubt) */
function harborOk(x,y,r){if(terrAt(x,y)!==1)return false;let land=0,water=0;for(let k=0;k<16;k++){const a=k*.3927,px=x+Math.cos(a)*(r+24),py=y+Math.sin(a)*(r+24);if(onLand(px,py))land++;else if(terrAt(px,py)<=1&&navDyn[navCell(px,py)]===0)water++}return land>=2&&water>=3}
/* Mauern und Tore dürfen an andere Mauerstücke, Vorkommen und Gebäude anstossen (sonst bliebe zwischen den Stücken immer eine Lücke).
   Nur fast deckungsgleiche Mauerstücke sind verboten; Einheiten und Tiere stören nicht (sie gehen zur Seite). */
function wallSpot(x,y,r){
  if(x<r+12||y<r+12||x>W-r-12||y>H-r-12)return false;
  if(!onLand(x,y)||!onLand(x+r,y)||!onLand(x-r,y)||!onLand(x,y+r)||!onLand(x,y-r))return false;
  if(slopeNear(x,y,r)>.9)return false;
  for(const e of G.ents){if(e.dead||e.kind==='unit'||e.kind==='animal')continue;const d=Math.hypot(e.x-x,e.y-y);
    if(e.kind==='bld'&&(e.type==='wall'||e.type==='gate')){if(d<(e.r+r)*.62)return false}
    else if(d<e.r+r+(e.kind==='node'?-3:1))return false}
  return true}
function placeBlock(type,x,y){
  const d=BLDS[type];
  if(type==='harbor'){if(!validSpot(x,y,d.r,true))return tr('Hier ist kein Platz.');if(!harborOk(x,y,d.r))return tr('Der Hafen muss zwischen Land und flachem Wasser stehen.')}
  else if(type==='mine'){const sn=mineSnap(x,y);if(!sn||Math.hypot(sn.x-x,sn.y-y)>1)return tr('Eine Mine muss direkt auf Stein, Eisen oder Gold gebaut werden.');if(!validSpot(x,y,d.r,false,true))return tr('Hier ist kein Platz.')}
  else if(!((type==='wall'||type==='gate')?wallSpot(x,y,d.r):validSpot(x,y,d.r)))return tr('Hier ist kein Platz.');
  if((type==='derrick')&&!G.ents.some(n=>n.kind==='node'&&!n.dead&&MINE_RT[n.rt]===type&&nodeKnown(n)&&Math.hypot(n.x-x,n.y-y)<MINE_RNG*.85))return type==='mine'?tr('Eine Mine muss direkt an Stein, Eisen oder Gold stehen.'):tr('Ein Bohrturm muss in der Nähe eines entdeckten Ölfelds stehen.');
  if(NET.trust)return null;
  if(!fogEx[fogIdx(x,y)])return tr('Dieses Gebiet ist noch unerkundet.');
  if(terr[fogIdx(x,y)]===1)return tr('Im Gebiet des Gegners kann nicht gebaut werden. Ein Wachturm erobert Land zurück.');
  return null;
}
function fogUpdate(){
  terrUpdate();
  // Sicht: weicher Rand (Übergang über etwa 2 Felder), eigenes Gebiet ist immer sichtbar
  visF.fill(0);
  for(const e of G.ents){if(e.dead||e.team!==0)continue;const rc=sightOf(e)/FC,cx=e.x/FC,cy=e.y/FC,R=rc+1.2;
    for(let y=Math.max(0,Math.floor(cy-R));y<=Math.min(FH-1,Math.ceil(cy+R));y++)for(let x=Math.max(0,Math.floor(cx-R));x<=Math.min(FW-1,Math.ceil(cx+R));x++){const dx=x+.5-cx,dy=y+.5-cy,v=ss((rc+1-Math.sqrt(dx*dx+dy*dy))/2),i=y*FW+x;if(v>visF[i])visF[i]=v}}
  for(let i=0;i<terr.length;i++){if(terr[i]===0)visF[i]=1;fogVis[i]=visF[i]>.5?1:0;if(visF[i]>exF[i])exF[i]=visF[i];fogEx[i]=exF[i]>.5?1:0}
  for(const e of G.ents){if(e.kind!=='bld'||e.team!==1)continue;if(e.dead){G.mem.delete(e.id);continue}if(fogVis[fogIdx(e.x,e.y)])G.mem.set(e.id,{...e,queue:[]})}
  for(const [id,m] of G.mem)if(fogVis[fogIdx(m.x,m.y)]&&!G.byId.has(id))G.mem.delete(id);
  const px=fogImg.data;for(let i=0;i<visF.length;i++){const o=i*4;px[o]=44;px[o+1]=46;px[o+2]=50;px[o+3]=Math.round((1-visF[i])*(165-95*exF[i]))}
  fogCtx.putImageData(fogImg,0,0);
  // Gebiet: weicher Rand, grün für dich, rot für den Gegner (erst nach dem Erkunden)
  const tp=terrImg.data;
  for(let i=0;i<terrK.length;i++){const o=i*4,t=terrT[i],k=terrK[i];let a=0;
    if(t>=0){a=k<=1?60+130*ss((k-.84)/.16):190*(1-ss((k-1)/.14));if(t===1)a*=exF[i]}
    tp[o]=t===0?110:215;tp[o+1]=t===0?215:80;tp[o+2]=t===0?95:60;tp[o+3]=Math.round(a)}
  terrCtx.putImageData(terrImg,0,0);
}
/* Die Karte ist überall zu sehen (grau abgedunkelt). Gegnerische Einheiten nur im hellen Bereich, gegnerische Gebäude erst nach dem Erkunden */
const shown=e=>{if(e.inm)return false;if(e.kind==='node')return nodeKnown(e);if(e.kind==='animal')return fogVis[fogIdx(e.x,e.y)]===1;if(e.team!==1)return true;const i=fogIdx(e.x,e.y);return e.kind==='unit'?fogVis[i]===1:fogEx[i]===1};
function sfx(name,e){if(NET.cap)return;if(NET.host&&e&&G&&G.ev&&G.ev.length<14&&SFXNET.has(name))G.ev.push({t:'s',n:name,x:Math.round(e.x),y:Math.round(e.y)});if(typeof SND==='undefined')return;if(e&&!shown(e))return;let pan=0,vol=1;if(e&&R3.ok){const q=scr(e.x,e.y,0);if(!q.front||q.x<-40||q.y<-40||q.x>VW+40||q.y>VH+40)return;const dx=q.x/VW-.5,dy=q.y/VH-.5;pan=dx*1.7;vol=Math.max(.35,1.15-Math.hypot(dx,dy)*.9)*Math.min(1,.55+R3.k*.45)}SND.play(name,pan,vol)}
let G=null,bg=null,bgSmall=null,diff='normal',aiStyle='balanced';
/* Mehrspieler: host = rechnet das Spiel, client = zeigt den Stand und schickt Befehle. send = Funktion zum anderen Spieler. */
const NET={mp:false,host:false,client:false,send:null,cap:null,tgtSet:false,tgt:null,trust:false,acc:0,lastSnap:0};
const SFXNET=new Set(['grunt','yell','hit','arrow','boom','shot','die','crumble','chop','mine','pick','hammer']);
const sel=new Set();
let placing=null,armed=false,drag=null,panelSig='',uiT=0,lastClick={t:0,id:-1};
/* Mauer ziehen: {sx,sy = Bildschirmpunkt beim Drücken, x,y = Spielpunkt, line = schon gezogen (sonst einfacher Klick), shift} */
let wallDrag=null;
const mouse={x:0,y:0,in:false,type:'mouse'};
const keys={};

function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

