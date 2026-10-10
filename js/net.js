/* Epochenkrieg – Mehrspieler: Verbindung und Lobby.
   Zwei Wege zur Verbindung (kein eigener Server nötig):
   1) Internet: WebRTC über den kostenlosen PeerJS-Vermittler. Der Gastgeber bekommt einen Einladungslink (…?join=ID), der Gast öffnet ihn.
   2) Lokal testen: zwei Tabs im selben Browser sprechen über einen BroadcastChannel (Link …?join=local:CODE).
   Das Spiel selbst (Spielstand, Befehle) steckt in game.js (EKG.startMP, applySnap, execRemote). */
const Lobby=(()=>{
  let pingTimer=null,role=null,view='menu',peer=null,conn=null,bc=null,raw=null,link='',helloTimer=null,inGame=false;
  const SIZES={S:{n:'Klein',maps:['pass','river','lakes']},M:{n:'Mittel',maps:['land','coast','bay']},L:{n:'Gross',maps:['mountains','coast','land']}};
  const SPEEDS=[[1,'Normal (1×)'],[2,'Schnell (2×)'],[3,'Superschnell (3×)']];
  const st={cfg:{size:'M',map:'land',speed:1,side:'A',colH:PALETTE[0][1],colG:PALETTE[1][1]},prop:{},connected:false,status:'',error:''};
  const $=id=>document.getElementById(id);
  const baseUrl=()=>location.href.split('?')[0].split('#')[0];
  const rid=()=>Math.random().toString(36).slice(2,7);
  const T=(...a)=>tr(...a);

  function loadPeerJS(){return new Promise((res,rej)=>{if(window.Peer)return res();const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('peerjs'));document.head.appendChild(s)})}
  function close(){clearInterval(helloTimer);clearInterval(pingTimer);try{if(conn)conn.close()}catch(_){}try{if(peer)peer.destroy()}catch(_){}try{if(bc)bc.close()}catch(_){}conn=peer=bc=raw=null;st.connected=false}

  function onClosed(){if(inGame){EKG.peerLeft&&EKG.peerLeft();return}st.connected=false;st.status='Verbindung getrennt.';render()}
  function onData(m){
    if(!m||!m.t)return;
    switch(m.t){
      case'hello':if(role==='host'){st.connected=true;pushLobby();render()}break;
      case'lobby':if(role==='client'){clearInterval(helloTimer);st.cfg=m.cfg;st.prop=m.prop||{};st.connected=true;render()}break;
      case'prop':if(role==='host'){Object.assign(st.prop,m.p);pushLobby();render()}break;
      case'col':if(role==='host'&&m.c!==st.cfg.colH){st.cfg.colG=m.c;pushLobby();render()}break;
      case'start':if(role==='client'){inGame=true;clearInterval(pingTimer);pingTimer=setInterval(()=>{if(raw)raw({t:'ping'})},3000);EKG.startMP({role:'client',seed:m.seed,map:m.map,side:m.side,cfg:m.cfg,send:msg=>raw&&raw({t:'cmd',m:msg})})}break;
      case'ping':break;
      case'cmd':if(role==='host'&&inGame){try{EKG.execRemote(m.m)}catch(e){console.warn('cmd',e)}}break;
      case'snap':if(role==='client'){try{EKG.applySnap(m.s)}catch(e){console.warn('snap',e)}}break;
      case'msgs':if(role==='client')(m.list||[]).forEach(([t,k])=>EKG.toast(t,k));break;
    }}
  function pushLobby(){if(role==='host'&&raw&&st.connected)raw({t:'lobby',cfg:st.cfg,prop:st.prop})}

  /* ---- Gastgeber ---- */
  async function host(local){
    close();role='host';view='host';st.error='';st.status=local?'Lokaler Test: Öffne den Link in einem zweiten Tab.':'Verbinde mit dem Vermittler …';link='';render();
    if(local){const code=rid();bc=new BroadcastChannel('ek-'+code);link=baseUrl()+'?join=local:'+code;bc.onmessage=e=>{if(e.data&&e.data.to==='h')onData(e.data.msg)};raw=m=>bc.postMessage({to:'c',msg:m});st.status='Warte auf Mitspieler …';render();return}
    try{await loadPeerJS()}catch(_){st.error='Der Vermittlungsdienst (PeerJS) ist nicht erreichbar. Prüfe deine Internetverbindung – oder nutze „Lokal testen“.';render();return}
    peer=new Peer(undefined,{config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}});peer.on('disconnected',()=>{try{peer.reconnect()}catch(_){}});
    peer.on('open',id=>{link=baseUrl()+'?join='+id;st.status='Warte auf Mitspieler …';render()});
    peer.on('connection',c=>{if(conn&&conn.open){c.close();return}conn=c;raw=m=>{if(!(conn&&conn.open))return;if(m&&m.t==='snap'){const bf=conn.dataChannel?conn.dataChannel.bufferedAmount:0;if(bf>262144){NET.prev=null;return}NET.backlog=bf}conn.send(m)};c.on('data',onData);c.on('close',onClosed);c.on('error',()=>{})});
    peer.on('error',e=>{st.error='Verbindungsfehler ('+(e.type||'?')+').';render()});
  }
  /* ---- Gast ---- */
  async function join(target){
    close();role='client';view='join';st.error='';st.status='Verbinde …';st.connected=false;render();
    target=(target||'').trim();const m=/[?&]join=([^&#\s]+)/.exec(target);if(m)target=decodeURIComponent(m[1]);
    if(!target){st.error='Bitte einen Einladungslink oder Code eingeben.';view='enter';render();return}
    if(target.startsWith('local:')){const code=target.slice(6);bc=new BroadcastChannel('ek-'+code);bc.onmessage=e=>{if(e.data&&e.data.to==='c')onData(e.data.msg)};raw=m=>bc.postMessage({to:'h',msg:m});
      raw({t:'hello'});let tries=0;helloTimer=setInterval(()=>{if(!raw||st.connected)return;raw({t:'hello'});if(++tries===6){st.error='Kein Gastgeber gefunden. Der Gastgeber-Tab muss in DIESEM Browser (kein privates Fenster) offen bleiben und in der Lobby warten. Am besten das Spiel mit „npx serve .“ starten und beide Tabs über http://localhost:… öffnen.';render()}},1000);return}
    try{await loadPeerJS()}catch(_){st.error='Der Vermittlungsdienst (PeerJS) ist nicht erreichbar. Prüfe deine Internetverbindung.';render();return}
    peer=new Peer(undefined,{config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}});peer.on('disconnected',()=>{try{peer.reconnect()}catch(_){}});
    peer.on('open',()=>{conn=peer.connect(target,{reliable:true});conn.on('open',()=>{raw=m=>{if(conn&&conn.open)conn.send(m)};st.status='Verbunden – warte auf den Gastgeber …';raw({t:'hello'});render()});conn.on('data',onData);conn.on('close',onClosed);conn.on('error',()=>{})});
    peer.on('error',e=>{st.error=e.type==='peer-unavailable'?'Den Gastgeber gibt es nicht (mehr). Ist der Link noch aktuell?':'Verbindungsfehler ('+(e.type||'?')+').';render()});
  }
  function start(){
    if(role!=='host'||!st.connected)return;
    const seed=(Math.random()*1e9)|0;inGame=true;raw({t:'start',seed,map:st.cfg.map,side:st.cfg.side,cfg:st.cfg});
    EKG.startMP({role:'host',seed,map:st.cfg.map,side:st.cfg.side,cfg:st.cfg,send:msg=>raw&&raw(msg)});
  }
  function leave(){close();role=null;view='menu';inGame=false}

  /* ---- Oberfläche ---- */
  function open(){if(!role)view='menu';render()}
  function render(){
    const ov=$('overlay');ov.hidden=false;
    const host_=role==='host',c=st.cfg,pr=st.prop;
    const mark=(k,cur,prop)=>cur===k?'true':'false';
    const sizes=`<div class="diff" role="group">${Object.entries(SIZES).map(([k,v])=>`<button data-z="${k}" aria-pressed="${c.size===k}" class="${!host_&&pr.size===k?'prop':''}">${T(v.n)}</button>`).join('')}</div>`;
    const maps=`<div class="maps" role="group">${SIZES[c.size].maps.map(k=>{const m=MAPS[k];return`<button data-m="${k}" aria-pressed="${c.map===k}" class="${!host_&&pr.map===k?'prop':''}"><b>${T(m.name)}</b><img src="${mapPreview(k)}" alt="" title="${T(m.desc)}"></button>`}).join('')}</div>`;
    const speeds=`<div class="diff" role="group">${SPEEDS.map(([k,l])=>`<button data-v="${k}" aria-pressed="${c.speed===k}" class="${!host_&&pr.speed===k?'prop':''}">${T(l)}</button>`).join('')}</div>`;
    const sides=`<div class="diff" role="group">${[['A','Start unten links'],['B','Start oben rechts']].map(([k,l])=>`<button data-s="${k}" ${host_?'':'disabled'} aria-pressed="${k===c.side}">${T(l)}</button>`).join('')}</div>`;
    const mine=host_?c.colH:c.colG,other=host_?c.colG:c.colH;
    const cols=`<div class="swatches" role="group">${PALETTE.map(([n,h])=>`<button data-c="${h}" title="${T(n)}" style="background:${h}" aria-pressed="${mine===h}" ${other===h?'disabled':''}></button>`).join('')}</div>`;
    const propBox=host_&&Object.keys(pr).length?`<div class="propbox"><b>${T('Vorschlag des Mitspielers')}</b>: ${[pr.size?T('Grösse')+' '+T(SIZES[pr.size].n):'',pr.map?T('Karte')+' '+T(MAPS[pr.map].name):'',pr.speed?T('Tempo')+' '+pr.speed+'×':''].filter(Boolean).join(' · ')}<span><button class="btn2" id="pOk">${T('Übernehmen')}</button><button class="btn2" id="pNo">${T('Ablehnen')}</button></span></div>`:'';
    const note=!host_&&Object.keys(pr).length?`<p class="lnote">${T('Dein Vorschlag wurde an den Gastgeber geschickt.')}</p>`:'';
    const settings=`<label class="llabel">${T('Kartengrösse')}</label>${sizes}<label class="llabel">${T('Karte')}</label>${maps}<label class="llabel">${T('Spielgeschwindigkeit')}</label>${speeds}<label class="llabel">${T('Deine Seite')}</label>${sides}<label class="llabel">${T('Deine Farbe')}</label>${cols}`;
    const err=st.error?`<p class="lerr">${T(st.error)}</p>`:'';
    let h='';
    if(view==='menu')h=`<h1>${T('Mehrspieler')}</h1><p>${T('Spiele mit einem Freund: Du erstellst ein Spiel und schickst ihm den Einladungslink.')}</p>
      <div class="btnrow"><button class="go" id="lHost">${T('Spiel erstellen')}</button><button class="btn2" id="lEnter">${T('Einladungslink eingeben')}</button><button class="btn2" id="lLocal">${T('Lokal testen (zwei Tabs)')}</button><button class="btn2" id="lBack">${T('Zurück')}</button></div>
      <p class="lnote">${T('Hinweis: Damit dein Freund den Link öffnen kann, muss das Spiel im Internet erreichbar sein (z. B. auf GitHub Pages). Zum Ausprobieren allein: „Lokal testen“.')}</p>`;
    else if(view==='enter')h=`<h1>${T('Beitreten')}</h1><p>${T('Füge den Einladungslink oder den Code ein:')}</p><input id="lInput" class="linput" placeholder="…?join=…">${err}<div class="btnrow"><button class="go" id="lJoin">${T('Beitreten')}</button><button class="btn2" id="lBack">${T('Zurück')}</button></div>`;
    else if(view==='host')h=`<h1>${T('Lobby')}</h1>${err}
      <label class="llabel">${T('Einladungslink')}</label><div class="linkrow"><input id="lLink" class="linput" readonly value="${link}"><button class="btn2" id="lCopy">${T('Kopieren')}</button></div>
      <p class="lstat ${st.connected?'ok':''}">${st.connected?'● '+T('Mitspieler verbunden'):'○ '+T(st.status)}</p>${propBox}${settings}
      <div class="btnrow"><button class="go" id="lStart" ${st.connected?'':'disabled'}>${T('Spiel starten')}</button><button class="btn2" id="lBack">${T('Zurück')}</button></div>`;
    else h=`<h1>${T('Lobby')}</h1>${err}<p class="lstat ${st.connected?'ok':''}">${st.connected?'● '+T('Verbunden – warte, bis der Gastgeber das Spiel startet.'):'○ '+T(st.status)}</p>
      ${st.connected?`<p class="lnote">${T('Tippe auf eine Karte, Grösse oder ein Tempo, um sie dem Gastgeber vorzuschlagen. Deine Farbe wählst du selbst.')}</p>${note}${settings}`:''}<div class="btnrow"><button class="btn2" id="lBack">${T('Zurück')}</button></div>`;
    ov.innerHTML=`<div class="card lobby">${h}</div>`;
    const on=(id,fn)=>{const el=$(id);if(el)el.onclick=fn};
    on('lHost',()=>host(false));on('lLocal',()=>host(true));on('lEnter',()=>{view='enter';render()});
    on('lJoin',()=>join($('lInput').value));on('lBack',()=>{leave();EKG.showStart()});
    on('lStart',start);
    on('lCopy',()=>{const el=$('lLink');el.select();try{navigator.clipboard.writeText(el.value)}catch(_){document.execCommand('copy')}$('lCopy').textContent=T('Kopiert!')});
    const setCfg=(k,v)=>{if(host_){c[k]=v;if(k==='size'&&!SIZES[v].maps.includes(c.map))c.map=SIZES[v].maps[0];pushLobby();render()}else{pr[k]=v;if(k==='size'&&!SIZES[v].maps.includes(pr.map||c.map))delete pr.map;if(raw)raw({t:'prop',p:{[k]:v}});render()}};
    ov.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>setCfg('size',b.dataset.z));
    ov.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>setCfg('map',b.dataset.m));
    ov.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>setCfg('speed',+b.dataset.v));
    ov.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{if(host_){c.side=b.dataset.s;pushLobby();render()}});
    ov.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{if(host_){c.colH=b.dataset.c;pushLobby();render()}else{c.colG=b.dataset.c;if(raw)raw({t:'col',c:b.dataset.c});render()}});
    on('pOk',()=>{Object.assign(c,pr);if(!SIZES[c.size].maps.includes(c.map))c.map=SIZES[c.size].maps[0];st.prop={};pushLobby();render()});
    on('pNo',()=>{st.prop={};pushLobby();render()});
  }
  /* Einladungslink geöffnet? Dann gleich beitreten. */
  window.addEventListener('load',()=>{const j=new URLSearchParams(location.search).get('join');if(j)setTimeout(()=>join(j),300)});
  return{open,leave,render};
})();
window.Lobby=Lobby;
