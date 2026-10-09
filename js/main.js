/* Epochenkrieg – Spielschleife und Start.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- loop ---------- */
let last=0;
/* Spielschritte: normal über requestAnimationFrame. Im Mehrspieler läuft das Spiel auch in einem Hintergrund-Tab weiter (ein Worker-Takt, den der Browser nicht drosselt), sonst friert es für den anderen Spieler ein. */
function simAdvance(raw){
  if(G&&G.running&&!G.over){
    if(NET.client){clientStep(raw);if(performance.now()-NET.lastSnap>8000&&!G.leftMsg){G.leftMsg=true;toast(tr('Keine Daten vom Gastgeber – Verbindung verloren?'),'warn')}}
    else if(!G.paused){let t=raw*G.speed;while(t>0){const s=Math.min(t,.04);step(s);t-=s}if(NET.host){NET.acc+=raw;if(NET.acc>=.1){NET.acc=0;sendSnap()}}}}}
let bgLast=performance.now();
try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),50)'],{type:'text/javascript'})));
  w.onmessage=()=>{const now=performance.now(),raw=Math.min(.25,(now-bgLast)/1000);bgLast=now;if(document.hidden&&NET.mp)simAdvance(raw)}}catch(_){}
function frame(ts){
  const raw=Math.min(.1,(ts-last)/1000||0);last=ts;bgLast=performance.now();
  simAdvance(raw);
  if(G&&G.over&&!G.overShown){updateUI();showEnd()}
  scrollCam(raw);draw();
  uiT+=raw;if(G&&uiT>.15){uiT=0;updateUI()}
  requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe(view);new ResizeObserver(resize).observe(mm);
window.EKG={startMP,endMP,execRemote,applySnap,peerLeft,toast,tr:(...a)=>tr(...a),get G(){return G},showStart:()=>showStart(),NET,setMap:m=>{curMap=m}};
window.__ek={terrOk,navOpen,navCell,navLos,flipTeams,encodeSnap,applySnap,execRemote,startMP,NET,bgCanvas:()=>bg,fogEx:()=>fogEx,grantAiTechs,startResearch,get G(){return G},applyLevels,pending,addUnit,addBld,placeBlock,spawn,nearestNode,centerOn,terrAt,cam};
document.querySelectorAll('[data-ic]').forEach(el=>{el.innerHTML=ART.icon(el.dataset.ic)});
setLang(LANG);resize();newGame('normal');updateUI();showStart();requestAnimationFrame(frame);
