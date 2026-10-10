/* Epochenkrieg – Spielschleife und Start.
   (Teil des Spiels; alle game-Dateien teilen sich die globalen Namen, Ladereihenfolge siehe index.html.) */
'use strict';
/* ---------- loop ---------- */
let last=0;
/* Spielschritte: normal über requestAnimationFrame. Im Mehrspieler läuft das Spiel auch in einem Hintergrund-Tab weiter (ein Worker-Takt, den der Browser nicht drosselt), sonst friert es für den anderen Spieler ein. */
function simAdvance(raw){
  if(G&&G.running&&!G.over){
    if(NET.client){clientStep(raw);if(performance.now()-NET.lastSnap>8000&&!G.leftMsg){G.leftMsg=true;toast(tr('Keine Daten vom Gastgeber – Verbindung verloren?'),'warn')}}
    else if(!G.paused){let t=raw*G.speed,n=0;const t0=performance.now();while(t>0){const s=Math.min(t,.04);try{step(s)}catch(e){NetLog.err('Spielschritt',e)}t-=s;n++}if(NET.mp&&n)NetLog.stepMs((performance.now()-t0)/n);if(NET.host){NET.acc+=raw;if(NET.acc>=(NET.interval||.1)){NET.acc=0;sendSnap()}}}}}
let bgLast=performance.now();
try{const w=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),50)'],{type:'text/javascript'})));
  w.onmessage=()=>{const now=performance.now(),raw=Math.min(.25,(now-bgLast)/1000);bgLast=now;if(document.hidden&&NET.mp)simAdvance(raw)}}catch(_){}
let fpsN=0,fpsT=0;
function frame(ts){
  requestAnimationFrame(frame); /* zuerst, damit ein Fehler im Bild die Schleife nicht beendet */
  const fd=ts-last;const raw=Math.min(.1,fd/1000||0);last=ts;bgLast=performance.now();
  try{
    if(NET.mp&&fd>0&&fd<2000)NetLog.frameMs(fd);
    simAdvance(raw);
    if(G&&G.over&&!G.overShown){updateUI();showEnd()}
    scrollCam(raw);draw();if(OPT.fps){fpsN++;fpsT+=raw;if(fpsT>=.5){const f=document.getElementById('fps');if(f)f.textContent=Math.round(fpsN/fpsT)+' FPS';fpsN=0;fpsT=0}}
    uiT+=raw;if(G&&uiT>.15){uiT=0;updateUI()}
    NetLog.refresh();
  }catch(e){NetLog.err('Bild',e)}
}
new ResizeObserver(resize).observe(view);new ResizeObserver(resize).observe(mm);
window.EKG={startMP,endMP,execRemote,applySnap,peerLeft,toast,tr:(...a)=>tr(...a),get G(){return G},showStart:()=>showStart(),NET,setMap:m=>{curMap=m}};
window.__ek={terrOk,navOpen,navCell,navLos,flipTeams,encodeSnap,applySnap,execRemote,startMP,NET,bgCanvas:()=>bg,fogEx:()=>fogEx,grantAiTechs,startResearch,get G(){return G},applyLevels,pending,addUnit,addBld,placeBlock,spawn,nearestNode,centerOn,terrAt,cam};
document.querySelectorAll('[data-ic]').forEach(el=>{el.innerHTML=ART.icon(el.dataset.ic)});
setLang(LANG);resize();newGame('normal');updateUI();showStart();requestAnimationFrame(frame);
