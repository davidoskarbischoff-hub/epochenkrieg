/* Epochenkrieg – Tutorial: geführte Übung auf einer kleinen, friedlichen Karte (kein Gegner, keine gefährlichen Tiere).
   Eine Schrittliste (`STEPS`) mit Text, Zielmarke (Pfeil über einem Objekt oder Leuchtrahmen um einen Knopf) und einer Prüfung, ob der Schritt geschafft ist.
   Hängt nur lose am Spiel: `TUT.tick()` wird je Bild aus main.js gerufen, `G.tut` hält die KI an (sim.js). Nur Einzelspieler. */
(()=>{
  Object.assign(EN,{
    'Tutorial':'Tutorial','Willkommen im Epochenkrieg!':'Welcome to Epochenkrieg!','Kamera bewegen':'Move the camera','Zoomen':'Zoom','Drehen und neigen':'Rotate and tilt','Arbeiter auswählen':'Select a worker','Nahrung sammeln':'Gather food','Holz sammeln':'Gather wood',
    'Neue Arbeiter ausbilden':'Train new workers','Bevölkerung':'Population','Eine Hütte bauen':'Build a hut','Eine Kaserne bauen':'Build barracks','Truppen ausbilden':'Train troops','Angreifen':'Attack','Zeitalter-Aufstieg':'Advancing an age','Der Berater':'The advisor','Pause, Tempo, Speichern':'Pause, speed, saving','Geschafft!':'Well done!',
    'Weiter':'Next','Überspringen':'Skip','Tutorial beenden':'Quit tutorial','Weiterspielen':'Keep playing','Zurück ins Hauptmenü':'Back to main menu','Schritt {0} von {1}':'Step {0} of {1}','Gut gemacht!':'Nicely done!',
    'Du führst einen Stamm von der Steinzeit bis in die Neuzeit. In wenigen Schritten lernst du die Grundlagen. Das hier ist eine friedliche Übungskarte – niemand greift dich an.':'You lead a tribe from the Stone Age to the modern era. In a few steps you learn the basics. This is a peaceful practice map – nobody will attack you.',
    'Bewege die Karte mit W, A, S, D oder den Pfeiltasten – oder schiebe die Maus an den Bildschirmrand. Ein Klick auf die Minikarte unten links springt direkt dorthin.':'Move the map with W, A, S, D or the arrow keys – or push the mouse to the screen edge. Clicking the minimap at the bottom left jumps straight there.',
    'Mit dem Mausrad zoomst du hinein und heraus.':'Use the mouse wheel to zoom in and out.',
    'Halte die mittlere Maustaste gedrückt (oder Alt + linke Maustaste) und bewege die Maus: links/rechts dreht, hoch/runter neigt die Ansicht. Taste N stellt sie zurück.':'Hold the middle mouse button (or Alt + left button) and move the mouse: left/right rotates, up/down tilts the view. Key N resets it.',
    'Klicke einen deiner Arbeiter an – oder ziehe mit der linken Maustaste einen Rahmen um mehrere. Sie stehen neben dem Hauptlager.':'Click one of your workers – or drag a box with the left mouse button around several. They stand next to the town centre.',
    'Die roten Büsche tragen Beeren. Mit ausgewähltem Arbeiter: Rechtsklick auf einen Beerenstrauch. Er sammelt und trägt die Nahrung zum Hauptlager.':'The red bushes bear berries. With a worker selected: right-click a berry bush. They gather and carry the food to the town centre.',
    'Für Holz schickst du Arbeiter genauso zu einem Baum: Auswählen, dann Rechtsklick auf den Baum.':'For wood, send workers to a tree the same way: select, then right-click the tree.',
    'Klicke das Hauptlager an und drücke unten den Knopf „Arbeiter“. Mehr Arbeiter sammeln mehr Rohstoffe – und für den Aufstieg brauchst du viele.':'Click the town centre and press the “Worker” button below. More workers gather more resources – and you need many to advance.',
    'Oben siehst du die Bevölkerung (z. B. 5/10). Das Hauptlager erlaubt 10 Einwohner, jede Hütte +5. Ohne Platz kannst du nichts mehr ausbilden.':'At the top you see the population (e.g. 5/10). The town centre allows 10 inhabitants, every hut +5. Without room you cannot train more.',
    'Wähle einen Arbeiter, drücke unten „Hütte“ und klicke auf eine freie Stelle im grünen Gebiet. Der Arbeiter baut sie für dich.':'Select a worker, press “Hut” below and click a free spot in the green territory. The worker builds it for you.',
    'Soldaten brauchen eine Kaserne. Wähle einen Arbeiter, drücke „Kaserne“ und setze sie ins grüne Gebiet.':'Soldiers need barracks. Select a worker, press “Barracks” and place it in your territory.',
    'Warte, bis die Kaserne fertig ist, klicke sie an und bilde einen Krieger aus.':'Wait until the barracks is finished, click it and train a warrior.',
    'Truppen schickst du mit Rechtsklick auf den Boden los, ein Rechtsklick auf einen Gegner greift an. Taste Q startet einen Angriffsmarsch: Truppen kämpfen unterwegs gegen alles, was sie sehen. Hier gibt es keine Gegner – das probierst du in einer richtigen Partie.':'Send troops with a right-click on the ground; a right-click on an enemy attacks. Key Q starts an attack march: troops fight everything they see on the way. There are no enemies here – you try that in a real game.',
    'Im Hauptlager gibt es den Knopf „Aufstieg“. Du brauchst genug Arbeiter und Rohstoffe, danach müssen alle Gebäude und Truppen auf die aktuelle Stufe („Alle upgraden“). Dein Ziel: von der Steinzeit bis in die Neuzeit.':'The town centre has an “Advance” button. You need enough workers and resources, then all buildings and troops must be on the current level (“Upgrade all”). Your goal: from the Stone Age to the modern era.',
    'Der Berater schlägt dir sinnvolle nächste Schritte vor: Taste Y nimmt an, X lehnt ab. Im Menü (Esc) kannst du ihn abschalten.':'The advisor suggests useful next steps: key Y accepts, X declines. You can switch it off in the menu (Esc).',
    'Leertaste = Pause, der Knopf „Tempo“ wechselt zwischen 1×, 2×, 3× und 5×. Im Menü (Esc) kannst du speichern und laden.':'Space = pause, the “Speed” button cycles through 1×, 2×, 3× and 5×. In the menu (Esc) you can save and load.',
    'Du kennst jetzt die Grundlagen. Auf dieser Übungskarte kannst du frei weiterspielen oder zurück ins Hauptmenü gehen und eine echte Partie starten – viel Erfolg!':'You now know the basics. You can keep playing freely on this practice map or go back to the main menu and start a real game – good luck!'});
  const T={on:false,i:0,st:null,tick,start,stop,go:i=>go(i)},$$=id=>document.getElementById(id);
  const mine=()=>G.ents.filter(e=>!e.dead&&e.team===0),workers=()=>mine().filter(e=>e.kind==='unit'&&e.type==='worker'),hq=()=>mine().find(e=>e.type==='hq'),
    soldiers=()=>mine().filter(e=>e.kind==='unit'&&UNITS[e.type]&&!UNITS[e.type].gather&&e.type!=='cart'),blds=t=>mine().filter(e=>e.kind==='bld'&&e.type===t);
  const nearNode=(type,from)=>{let b=null,bd=1e12;for(const n of G.ents)if(!n.dead&&n.kind==='node'&&n.type===type&&nodeKnown(n)){const d=(n.x-from.x)**2+(n.y-from.y)**2;if(d<bd){bd=d;b=n}}return b};
  const actEl=key=>{const i=curActs.findIndex(a=>a.key===key);return i<0?null:document.querySelector('#acts .act[data-i="'+i+'"]')};
  const gathering=type=>workers().some(u=>{if(u.state!=='gather'||!u.tid)return false;const n=G.byId.get(u.tid);return n&&n.type===type});
  const selIs=e=>selection().some(s=>s===e||s.id===e.id);
  /* Schritt: id, Titel, Text, Prüfung (done), Zielmarke (target → {dom} oder {ent,z}), enter = Ausgangswerte merken, manual = „Weiter“ nötig */
  const STEPS=[
    {t:'Willkommen im Epochenkrieg!',x:'Du führst einen Stamm von der Steinzeit bis in die Neuzeit. In wenigen Schritten lernst du die Grundlagen. Das hier ist eine friedliche Übungskarte – niemand greift dich an.',manual:1},
    {t:'Kamera bewegen',x:'Bewege die Karte mit W, A, S, D oder den Pfeiltasten – oder schiebe die Maus an den Bildschirmrand. Ein Klick auf die Minikarte unten links springt direkt dorthin.',enter:s=>{s.x0=cam.x;s.y0=cam.y},done:s=>Math.hypot(cam.x-s.x0,cam.y-s.y0)>220,target:()=>({dom:$$('mini')})},
    {t:'Zoomen',x:'Mit dem Mausrad zoomst du hinein und heraus.',enter:s=>{s.z0=cam.z},done:s=>Math.abs(Math.log(cam.z/s.z0))>.22},
    {t:'Drehen und neigen',x:'Halte die mittlere Maustaste gedrückt (oder Alt + linke Maustaste) und bewege die Maus: links/rechts dreht, hoch/runter neigt die Ansicht. Taste N stellt sie zurück.',enter:s=>{s.a=cam.tyaw;s.b=cam.tpitch},done:s=>Math.abs(cam.tyaw-s.a)>.25||Math.abs(cam.tpitch-s.b)>.12,skip:1},
    {t:'Arbeiter auswählen',x:'Klicke einen deiner Arbeiter an – oder ziehe mit der linken Maustaste einen Rahmen um mehrere. Sie stehen neben dem Hauptlager.',enter:()=>{const h=hq();if(h)centerOn(h.x,h.y+40)},done:()=>selection().some(u=>u.type==='worker'&&u.team===0),target:()=>({ent:workers()[0],z:46})},
    {t:'Nahrung sammeln',x:'Die roten Büsche tragen Beeren. Mit ausgewähltem Arbeiter: Rechtsklick auf einen Beerenstrauch. Er sammelt und trägt die Nahrung zum Hauptlager.',done:()=>gathering('bush'),target:()=>({ent:nearNode('bush',hq()),z:36})},
    {t:'Holz sammeln',x:'Für Holz schickst du Arbeiter genauso zu einem Baum: Auswählen, dann Rechtsklick auf den Baum.',done:()=>gathering('tree'),target:()=>({ent:nearNode('tree',hq()),z:120})},
    {t:'Neue Arbeiter ausbilden',x:'Klicke das Hauptlager an und drücke unten den Knopf „Arbeiter“. Mehr Arbeiter sammeln mehr Rohstoffe – und für den Aufstieg brauchst du viele.',enter:s=>{s.n=workers().length},done:s=>workers().length>s.n||(hq().queue||[]).length>0,
      target:()=>{const h=hq();return selIs(h)&&actEl('tworker')?{dom:actEl('tworker')}:{ent:h,z:130}}},
    {t:'Bevölkerung',x:'Oben siehst du die Bevölkerung (z. B. 5/10). Das Hauptlager erlaubt 10 Einwohner, jede Hütte +5. Ohne Platz kannst du nichts mehr ausbilden.',manual:1,target:()=>({dom:$$('v-pop').parentNode})},
    {t:'Eine Hütte bauen',x:'Wähle einen Arbeiter, drücke unten „Hütte“ und klicke auf eine freie Stelle im grünen Gebiet. Der Arbeiter baut sie für dich.',enter:s=>{s.n=blds('house').length},done:s=>blds('house').length>s.n,
      target:()=>{const a=actEl('bhouse');return a?{dom:a}:{ent:workers()[0],z:46}}},
    {t:'Eine Kaserne bauen',x:'Soldaten brauchen eine Kaserne. Wähle einen Arbeiter, drücke „Kaserne“ und setze sie ins grüne Gebiet.',enter:s=>{s.n=blds('barracks').length},done:s=>blds('barracks').length>s.n,
      target:()=>{const a=actEl('bbarracks');return a?{dom:a}:{ent:workers()[0],z:46}}},
    {t:'Truppen ausbilden',x:'Warte, bis die Kaserne fertig ist, klicke sie an und bilde einen Krieger aus.',enter:s=>{s.n=soldiers().length},done:s=>soldiers().length>s.n||blds('barracks').some(b=>(b.queue||[]).length>0),
      target:()=>{const b=blds('barracks')[0];if(!b)return null;if(selIs(b)&&b.built){const a=curActs.find(a=>/^t/.test(a.key)&&!a.lock&&!a.need);if(a){const el=actEl(a.key);if(el)return{dom:el}}}return{ent:b,z:90}}},
    {t:'Angreifen',x:'Truppen schickst du mit Rechtsklick auf den Boden los, ein Rechtsklick auf einen Gegner greift an. Taste Q startet einen Angriffsmarsch: Truppen kämpfen unterwegs gegen alles, was sie sehen. Hier gibt es keine Gegner – das probierst du in einer richtigen Partie.',manual:1},
    {t:'Zeitalter-Aufstieg',x:'Im Hauptlager gibt es den Knopf „Aufstieg“. Du brauchst genug Arbeiter und Rohstoffe, danach müssen alle Gebäude und Truppen auf die aktuelle Stufe („Alle upgraden“). Dein Ziel: von der Steinzeit bis in die Neuzeit.',manual:1,target:()=>({dom:$$('epoch')})},
    {t:'Der Berater',x:'Der Berater schlägt dir sinnvolle nächste Schritte vor: Taste Y nimmt an, X lehnt ab. Im Menü (Esc) kannst du ihn abschalten.',manual:1},
    {t:'Pause, Tempo, Speichern',x:'Leertaste = Pause, der Knopf „Tempo“ wechselt zwischen 1×, 2×, 3× und 5×. Im Menü (Esc) kannst du speichern und laden.',manual:1,target:()=>({dom:$$('speedBtn')})},
    {t:'Geschafft!',x:'Du kennst jetzt die Grundlagen. Auf dieser Übungskarte kannst du frei weiterspielen oder zurück ins Hauptmenü gehen und eine echte Partie starten – viel Erfolg!',end:1}];
  /* ---------- Oberfläche ---------- */
  let box=null,arrow=null,hiEl=null,okT=0,chkT=0;
  function build(){
    if(box)return;box=document.createElement('div');box.id='tut';box.innerHTML='<div class="tt-h"><span class="tt-n"></span><button class="tt-x" type="button" aria-label="x">×</button></div><h3 class="tt-t"></h3><p class="tt-p"></p><div class="tt-bar"><i></i></div><div class="tt-b"></div>';
    $$('view').appendChild(box);arrow=document.createElement('div');arrow.id='tutArrow';arrow.innerHTML='<svg viewBox="0 0 40 52"><path d="M20 50L4 26h10V2h12v24h10z" fill="currentColor" stroke="#2a1a05" stroke-width="2.5" stroke-linejoin="round"/></svg>';$$('view').appendChild(arrow);
    box.querySelector('.tt-x').onclick=()=>{sfx('click');leave()};
    box.querySelector('.tt-b').onclick=e=>{const b=e.target.closest('button');if(!b)return;sfx('click');const a=b.dataset.a;if(a==='next'||a==='skip')go(T.i+1);else if(a==='keep')stop();else if(a==='menu')leave()}}
  function render(){
    const s=STEPS[T.i];box.querySelector('.tt-n').textContent=tr('Schritt {0} von {1}',T.i+1,STEPS.length);box.querySelector('.tt-t').textContent=tr(s.t);box.querySelector('.tt-p').textContent=tr(s.x);
    box.querySelector('.tt-bar i').style.width=(T.i/(STEPS.length-1)*100)+'%';box.classList.remove('ok');
    box.querySelector('.tt-b').innerHTML=s.end?`<button data-a="keep" class="pri">${tr('Weiterspielen')}</button><button data-a="menu">${tr('Zurück ins Hauptmenü')}</button>`:
      (s.manual?`<button data-a="next" class="pri">${tr('Weiter')}</button>`:`<button data-a="skip">${tr('Überspringen')}</button>`)}
  function go(i){
    if(i>=STEPS.length){stop();return}T.i=i;const s=STEPS[i];T.st={};okT=0;if(s.enter)try{s.enter(T.st)}catch(e){console.warn('Tutorial',e)}render()}
  /* Zielmarke: Leuchtrahmen um einen Knopf oder Pfeil über einem Objekt */
  function mark(){
    const s=STEPS[T.i];let tg=null;try{tg=s.target&&s.target()}catch(_){}
    const dom=tg&&tg.dom&&tg.dom.isConnected&&tg.dom.offsetParent!==null?tg.dom:null;
    if(hiEl!==dom){if(hiEl)hiEl.classList.remove('tut-hi');hiEl=dom;if(hiEl)hiEl.classList.add('tut-hi')}
    let ax=-1e4,ay=-1e4,show=false;
    if(tg&&tg.ent&&!tg.ent.dead&&R3.ok){const p=scr(tg.ent.x,tg.ent.y,tg.z||60);if(p.front&&p.x>10&&p.y>60&&p.x<VW-10&&p.y<VH-10){ax=p.x;ay=p.y;show=true}}
    arrow.style.transform=`translate(${ax-20}px,${ay-58}px)`;arrow.style.opacity=show?1:0}
  function tick(dt){
    if(!T.on)return;if(!G||!G.tut||NET.mp){stop();return}
    if(G.paused)return;
    try{mark()}catch(e){if(!T.warn){T.warn=1;console.warn('Tutorial-Marke',e)}}
    chkT+=dt;if(chkT<.2)return;chkT=0;const s=STEPS[T.i];
    if(!okT&&s.done){let ok=false;try{ok=s.done(T.st)}catch(_){}if(ok){okT=1;box.classList.add('ok');box.querySelector('.tt-p').textContent=tr('Gut gemacht!');box.querySelector('.tt-b').innerHTML='';sfx('click');setTimeout(()=>{if(T.on&&STEPS[T.i]===s)go(T.i+1)},1300)}}}
  function clear(){if(box)box.remove();if(arrow)arrow.remove();box=arrow=null;if(hiEl)hiEl.classList.remove('tut-hi');hiEl=null}
  function stop(){T.on=false;clear()}
  function leave(){stop();if(typeof showStart==='function')showStart()}
  /* ---------- Start: kleine Übungskarte ohne Gegner ---------- */
  function start(){
    if(NET.mp||!window.newGame)return;try{localStorage.setItem('ek-tut','1')}catch(_){}const o=$$('overlay');if(typeof MPV!=='undefined')MPV.stop();
    try{SND.init();SND.setEpoch(0)}catch(_){}
    document.body.classList.remove('mm');o.className='';o.hidden=true;diff='leicht';
    newGame('leicht',false,{map:'land',aiStyle:'turtle',size:'S',seed:20241027,water:0,mount:1,season:'summer'});
    if(typeof ROOM!=='undefined')ROOM.pkey=null;
    G.tut=true;G.running=true;G.started=true;G.speed=1;
    for(const e of G.ents)if(e.kind==='animal'&&ANIMALS[e.type]&&ANIMALS[e.type].agg)removeEnt(e);  /* nur friedliche Tiere */
    const r=G.res[0];r.food+=500;r.wood+=500;r.stone+=150;
    const h=hq();if(h)centerOn(h.x,h.y+40);
    build();T.on=true;chkT=0;go(0);updateUI()}
  window.TUT=T;
})();
