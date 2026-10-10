/* Epochenkrieg – Mehrspieler-Protokoll und Verbindungsanzeige.
   Sammelt Verbindungsstatus, Ping, Rechenzeit des Gastgebers, Datenmenge und Fehler. Im Spiel zeigt eine kleine Anzeige oben rechts den Zustand
   ("Verbindung gut / schwach", "Gastgeber langsam", "Verbindung getrennt"); ein Klick darauf öffnet die Einzelheiten – gut zum Abfotografieren. */
const NetLog=(()=>{
  const buf=[],t0=performance.now(),S={state:'',role:'',ice:'-',rtt:null,rttMax:0,hostStepMs:null,hostFrameMs:null,hostFps:null,snapKB:null,snapPerS:0,snapAge:0,backlog:0,errors:0,reconnects:0,paused:false,saver:false,drops:0};
  let snapCnt=0,snapT=performance.now(),open=false,lastErr=0;
  const stamp=()=>((performance.now()-t0)/1000).toFixed(1).padStart(6)+'s';
  function log(kind,msg){buf.push(stamp()+' '+kind.padEnd(4)+' '+msg);if(buf.length>400)buf.shift();if(kind==='ERR')S.errors++}
  function err(where,e){const now=performance.now();if(now-lastErr<400)return;lastErr=now;log('ERR',where+': '+((e&&e.message)||e));try{console.error(where,e)}catch(_){}}
  window.addEventListener('error',e=>err('Fenster',e.error||e.message));
  window.addEventListener('unhandledrejection',e=>err('Zusage',e.reason));
  /* kleine Hilfen zum Mitschreiben */
  const set=(k,v)=>{if(S[k]!==v){S[k]=v;if(k==='state'||k==='ice'||k==='paused'||k==='saver')log('INFO',k+' → '+v)}};
  const onSnap=kb=>{snapCnt++;if(kb)S.snapKB=kb};
  const ema=(k,v)=>{S[k]=S[k]===null||S[k]===undefined?v:S[k]*.85+v*.15};
  const stepMs=ms=>ema('hostStepMs',ms),frameMs=ms=>{ema('hostFrameMs',ms);S.hostFps=1000/Math.max(1,S.hostFrameMs)};
  const rtt=ms=>{S.rtt=S.rtt===null?ms:S.rtt*.7+ms*.3;if(ms>S.rttMax)S.rttMax=ms};
  /* Gesamteinschätzung für die Anzeige */
  function verdict(){
    if(!NET.mp)return null;
    if(S.state==='getrennt'||S.state==='wiederverbinde')return{c:'bad',t:S.state==='getrennt'?'Verbindung getrennt':'Verbindung weg – verbinde neu …'};
    if(S.hostStepMs>30||(S.hostFps&&S.hostFps<18))return{c:'warn',t:'Gastgeber langsam'};
    if(NET.client&&(S.snapAge>1.5||(S.rtt&&S.rtt>400)))return{c:'warn',t:'Verbindung schwach'};
    if(NET.host&&S.backlog>131072)return{c:'warn',t:'Verbindung schwach'};
    return{c:'ok',t:'Verbindung gut'}}
  function text(){
    const f=(v,d=0)=>v===null||v===undefined?'–':(+v).toFixed(d);
    return ['Epochenkrieg Verbindungsprotokoll','Rolle: '+(NET.host?'Gastgeber':NET.client?'Gast':'-')+' · Zustand: '+(S.state||'-')+' · ICE: '+S.ice,
      'Ping: '+f(S.rtt)+' ms (max '+f(S.rttMax)+') · letzter Stand vor '+f(S.snapAge,1)+' s',
      'Gastgeber: Rechenschritt '+f(S.hostStepMs,1)+' ms · Bild '+f(S.hostFrameMs,1)+' ms ('+f(S.hostFps)+' FPS)'+(S.saver?' · Sparmodus AN':''),
      'Daten: '+f(S.snapKB,1)+' KB pro Stand · '+f(S.snapPerS,1)+' Stände/s · Rückstau '+f(S.backlog/1024)+' KB · verworfen '+S.drops,
      'Wiederverbindungen: '+S.reconnects+' · Fehler: '+S.errors+(S.paused?' · PAUSIERT':''),
      'Browser: '+navigator.userAgent.slice(0,90),'--- Ereignisse (neueste unten) ---',...buf.slice(-40)].join('\n')}
  /* Anzeige */
  let badge=null,panel=null;
  function ensure(){if(badge)return;const v=document.getElementById('view');if(!v)return;
    badge=document.createElement('button');badge.id='netbadge';badge.type='button';badge.hidden=true;v.appendChild(badge);
    panel=document.createElement('div');panel.id='netpanel';panel.hidden=true;panel.innerHTML='<pre></pre><div class="npbtn"><button type="button" id="npCopy">Kopieren</button><button type="button" id="npClose">Schliessen</button></div>';v.appendChild(panel);
    badge.onclick=()=>{open=!open;panel.hidden=!open;refresh(true)};
    panel.querySelector('#npClose').onclick=()=>{open=false;panel.hidden=true};
    panel.querySelector('#npCopy').onclick=()=>{const t=text();try{navigator.clipboard.writeText(t)}catch(_){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}panel.querySelector('#npCopy').textContent='Kopiert!';setTimeout(()=>{const b=panel.querySelector('#npCopy');if(b)b.textContent='Kopieren'},1500)}}
  let lastRef=0;
  function refresh(force){
    ensure();if(!badge)return;const now=performance.now();if(!force&&now-lastRef<500)return;lastRef=now;
    if(now-snapT>=2000){S.snapPerS=snapCnt/((now-snapT)/1000);snapCnt=0;snapT=now}
    if(NET.client)S.snapAge=(now-NET.lastSnap)/1000;
    if(NET.host){S.backlog=NET.backlog||0}
    const v=verdict();if(!v){badge.hidden=true;panel.hidden=true;return}
    badge.hidden=false;badge.className='nb-'+v.c;
    badge.textContent='● '+tr(v.t)+(NET.client&&S.rtt?' · '+Math.round(S.rtt)+' ms':NET.host&&S.hostStepMs!=null?' · '+Math.round(S.hostFps||0)+' FPS':'');
    if(open)panel.querySelector('pre').textContent=text()}
  function reset(){saverReset();buf.length=0;Object.assign(S,{state:'',ice:'-',rtt:null,rttMax:0,hostStepMs:null,hostFrameMs:null,hostFps:null,snapKB:null,snapPerS:0,snapAge:0,backlog:0,errors:0,reconnects:0,paused:false,saver:false,drops:0});snapCnt=0}
  /* Sparmodus: 6 s lang unter ~20 Bildern pro Sekunde → Grafik vereinfachen (und einmalig im Protokoll vermerken) */
  let slowT=0;
  function saverTick(fdMs){if(!NET.mp||typeof r3Saver!=='function')return;if(S.saver)return;
    if(fdMs>55){slowT+=fdMs/1000;if(slowT>6){S.saver=true;log('INFO','Sparmodus: Grafik vereinfacht (Bild zu langsam: '+Math.round(1000/fdMs)+' FPS)');r3Saver(true)}}else slowT=Math.max(0,slowT-fdMs/1000*2)}
  function saverReset(){slowT=0;if(S.saver){S.saver=false;if(typeof r3Saver==='function')r3Saver(false)}}
  return{log,err,set,S,onSnap,saverTick,saverReset,stepMs,frameMs,rtt,refresh,reset,text}
})();
