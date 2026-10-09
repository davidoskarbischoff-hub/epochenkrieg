/* Epochenkrieg – Klang. Alles wird im Browser erzeugt (Web Audio), keine Audiodateien. */
const SND=(()=>{
let ac=null,master,sfxG,musG,noiseBuf,musicV=.7,sfxV=.7,musTimer=null,epoch=0,fight=0;
const last={};
try{const m=localStorage.getItem('ek-music-v'),f=localStorage.getItem('ek-sfx-v');if(m!==null)musicV=+m;if(f!==null)sfxV=+f}catch(_){}
const save=()=>{try{localStorage.setItem('ek-music-v',musicV);localStorage.setItem('ek-sfx-v',sfxV)}catch(_){}};

function init(){
  if(ac){if(ac.state==='suspended')ac.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  ac=new C();master=ac.createGain();master.gain.value=.8;master.connect(ac.destination);
  sfxG=ac.createGain();sfxG.gain.value=sfxV*.57;sfxG.connect(master);
  musG=ac.createGain();musG.gain.value=musicV*.45;musG.connect(master);
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  if(!musTimer)musTimer=setInterval(schedule,250);
}

/* ---- Bausteine ---- */
function tone(f,t,dur,{type='sine',vol=.3,to=null,dest=sfxG,atk=.005}={}){
  const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+atk);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05);
}
function noise(t,dur,{f=1000,to=null,q=1,type='bandpass',vol=.3,dest=sfxG}={}){
  const s=ac.createBufferSource();s.buffer=noiseBuf;s.loop=true;
  const fl=ac.createBiquadFilter();fl.type=type;fl.Q.value=q;fl.frequency.setValueAtTime(f,t);
  if(to)fl.frequency.exponentialRampToValueAtTime(to,t+dur);
  const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(fl);fl.connect(g);g.connect(dest);s.start(t,Math.random()*.5);s.stop(t+dur+.05);
}

/* ---- Geräusche ---- */
/* Metall: mehrere nicht-harmonische Obertöne ergeben einen Klang wie Eisen auf Stein oder Schwert auf Schwert */
function metal(t,f,dur,vol){[1,2.76,5.4,8.93].forEach((m,i)=>tone(f*m,t,dur/(1+i*.7),{type:'sine',vol:vol/(1+i*.8),atk:.001}))}
const rnd=(a,b)=>a+Math.random()*(b-a);
const FX={
  click:t=>tone(520,t,.07,{type:'triangle',vol:.18}),
  select:t=>{tone(330,t,.06,{type:'triangle',vol:.15});tone(495,t+.04,.07,{type:'triangle',vol:.12})},
  order:t=>tone(250,t,.09,{type:'triangle',vol:.16,to:190}),
  error:t=>{tone(140,t,.18,{type:'sawtooth',vol:.14});tone(120,t+.07,.18,{type:'sawtooth',vol:.12})},
  /* Holz: Axthieb – scharfes Knacken, dumpfes "Tock" und ein kurzes Hohlklingen des Stamms */
  chop:t=>{noise(t,.03,{f:3500,q:.7,vol:.6});noise(t,.09,{f:700,to:350,q:1.2,vol:.6});
    tone(rnd(150,190),t,.16,{type:'triangle',vol:.35,to:80});tone(rnd(300,380),t+.01,.12,{type:'sine',vol:.12,to:200})},
  /* Stein: Spitzhacke – metallisches "Ting", Steinsplitter, schwerer Aufprall */
  mine:t=>{metal(t,rnd(900,1250),.28,.16);noise(t,.04,{f:6000,type:'highpass',q:.5,vol:.35});
    noise(t+.03,.12,{f:2800,to:1500,q:1.5,vol:.18});tone(95,t,.12,{type:'sine',vol:.4,to:55})},
  /* Beeren: Rascheln im Gebüsch – mehrere leise, helle Rauschstösse und ein sanftes Zupfen */
  pick:t=>{for(let i=0;i<4;i++)noise(t+i*rnd(.045,.08),rnd(.05,.09),{f:rnd(4500,7500),to:rnd(2500,4000),q:.6,vol:rnd(.12,.22)});
    tone(rnd(700,950),t+.17,.05,{vol:.07,to:500})},
  hammer:t=>{noise(t,.03,{f:2500,q:.8,vol:.45});metal(t,rnd(500,620),.14,.07);tone(200,t,.1,{type:'triangle',vol:.3,to:110})},
  drop:t=>{tone(400,t,.06,{type:'triangle',vol:.14});tone(560,t+.05,.09,{type:'triangle',vol:.14})},
  /* Nahkampf: Klingenschlag – Metall, Schleifen, dumpfer Treffer. Tonhöhe variiert */
  hit:t=>{metal(t,rnd(750,1100),.3,.2);noise(t,.07,{f:4500,type:'highpass',q:.5,vol:.35});
    noise(t,.1,{f:500,to:220,q:.8,vol:.4});tone(100,t,.12,{type:'sine',vol:.35,to:55})},
  /* Pfeil: Sehne zupft, dann Zischen der Luft */
  arrow:t=>{tone(rnd(190,230),t,.12,{type:'triangle',vol:.3,to:120,atk:.001});tone(rnd(380,460),t,.06,{type:'square',vol:.06,to:240});
    noise(t+.02,.22,{f:2000,to:6500,q:2.5,vol:.2})},
  die:t=>{tone(260,t,.4,{type:'sawtooth',vol:.12,to:60});noise(t,.18,{f:600,to:200,vol:.2});tone(90,t+.05,.3,{type:'sine',vol:.3,to:40})},
  crumble:t=>{noise(t,.8,{f:600,to:80,q:.6,vol:.7});for(let i=0;i<5;i++)noise(t+i*.1,.12,{f:rnd(300,1200),q:1,vol:.3});tone(70,t,.6,{type:'sine',vol:.5,to:35})},
  built:t=>[0,.1,.2].forEach((d,i)=>tone([392,494,587][i],t+d,.3,{type:'triangle',vol:.2})),
  ready:t=>{tone(523,t,.18,{type:'triangle',vol:.2});tone(784,t+.12,.3,{type:'triangle',vol:.2})},
  alert:t=>{tone(196,t,.4,{type:'sawtooth',vol:.2});tone(185,t+.35,.5,{type:'sawtooth',vol:.2});noise(t,.8,{f:300,type:'lowpass',vol:.1})},
  epoch:t=>[0,.18,.36,.54].forEach((d,i)=>{tone([262,330,392,523][i],t+d,.7,{type:'triangle',vol:.25});tone([131,165,196,262][i],t+d,.7,{type:'sine',vol:.2})}),
  win:t=>[0,.2,.4,.7].forEach((d,i)=>{tone([392,494,587,784][i],t+d,.8,{type:'triangle',vol:.28})}),
  lose:t=>[0,.3,.6].forEach((d,i)=>{tone([330,262,196][i],t+d,1.1,{type:'sawtooth',vol:.18})})
};
const GAP={chop:.18,mine:.18,pick:.18,hammer:.18,hit:.06,arrow:.06,die:.05,click:.03,select:.05,order:.05,drop:.1,crumble:.2};
function play(name){
  if(!ac||sfxV<=0||!FX[name])return;
  const n=ac.currentTime;if(last[name]&&n-last[name]<(GAP[name]||.02))return;last[name]=n;
  if(name==='hit'||name==='arrow'||name==='die'||name==='crumble')fight=Math.min(1,fight+.3);
  FX[name](n+.005);
}

/* ---- Musik: drei gemeinfreie klassische Stücke, vereinfacht und mit Synthesizer gespielt ----
   Steinzeit: Satie, Gymnopédie Nr. 1 · Bronzezeit: Pachelbel, Kanon in D · Eisenzeit: Grieg, In der Halle des Bergkönigs */
const N={C:0,D:2,E:4,F:6-1,G:7,A:9,B:11};
const midi=(name)=>{const m=/^([A-G])([#b]?)(\d)$/.exec(name);return 12*(+m[3]+1)+N[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)};
const mhz=m=>440*Math.pow(2,(m-69)/12);
const seq=(start,notes,dur,out,inst,vol)=>notes.forEach((n,i)=>{if(n)out.push({b:start+i*dur,m:midi(n),d:dur*(inst==='pluck'?1.6:1),i:inst,v:vol})});

function pieceSatie(){ // 3/4, ruhig und weit
  const ev=[],chords=[['G2',['B3','D4','F#4','A4']],['D2',['A3','C#4','F#4','A4']]];
  for(let bar=0;bar<8;bar++){const [bass,ch]=chords[bar%2];
    ev.push({b:bar*3,m:midi(bass),d:2.8,i:'pad',v:.5});
    ch.forEach(n=>ev.push({b:bar*3+1,m:midi(n),d:1.8,i:'pad',v:.16}));
    ev.push({b:bar*3,m:0,d:0,i:'drum',v:.5});
  }
  const tune=[[0,'F#5',2],[2,'A5',1],[3,'G5',1.5],[4.5,'F#5',1.5],[6,'C#5',1.5],[7.5,'B4',1.5],[9,'C#5',1.5],[10.5,'D5',1.5],
    [12,'A4',3],[15,'F#5',2],[17,'A5',1],[18,'G5',1.5],[19.5,'F#5',1.5],[21,'C#5',1.5],[22.5,'D5',1.5]];
  tune.forEach(([b,n,d])=>ev.push({b,m:midi(n),d:d+.5,i:'flute',v:.4}));
  return{bpm:58,len:24,ev};
}
function piecePachelbel(){ // 4/4, acht Akkorde, drei Variationen
  const ev=[],bass=['D3','A2','B2','F#2','G2','D2','G2','A2'];
  const ch=[['D4','F#4','A4'],['C#4','E4','A4'],['B3','D4','F#4'],['A3','C#4','F#4'],['B3','D4','G4'],['A3','D4','F#4'],['B3','D4','G4'],['C#4','E4','A4']];
  const top=['F#5','E5','D5','C#5','B4','A4','B4','C#5'];
  for(let rep=0;rep<3;rep++)for(let c=0;c<8;c++){const t=(rep*8+c)*2;
    ev.push({b:t,m:midi(bass[c]),d:1.9,i:'pluck',v:.5});
    if(rep===0)ev.push({b:t,m:midi(top[c]),d:2,i:'flute',v:.38});
    else if(rep===1)[0,1].forEach(k=>ev.push({b:t+k,m:midi(ch[c][k===0?0:2])+12,d:1,i:'flute',v:.3}));
    else ch[c].concat(ch[c][1]).forEach((n,k)=>ev.push({b:t+k*.5,m:midi(n)+12,d:.7,i:'pluck',v:.28}));
    if(rep>0)ev.push({b:t,m:midi(ch[c][0]),d:2,i:'pad',v:.13});
    if(rep===2)ev.push({b:t,m:midi(top[c]),d:2,i:'flute',v:.3});
    if(rep===2&&c%2===0)ev.push({b:t,m:0,d:0,i:'drum',v:.35});
  }
  return{bpm:84,len:48,ev};
}
function pieceGrieg(){ // 4/4, schleichend, wird in Wiederholungen lauter
  const ev=[],motif=['B3','C#4','D4','E4','F#4','D4','F#4'],motif2=['F4','C#4','F4'];
  for(let rep=0;rep<4;rep++){const o=rep*8;
    seq(o,motif.concat([null]),.5,ev,'brass',.4+rep*.05);
    ev.push({b:o+3.5,m:0,d:0,i:'drum',v:.3});
    seq(o+4,['F4','C#4','F4',null,'E4','C4','E4',null],.5,ev,'brass',.4+rep*.05);
    // gezupfter Bass
    for(let k=0;k<16;k++)if(rep>0||k%2===0)ev.push({b:o+k*.5,m:midi(k%4<2?'B2':'F#2'),d:.4,i:'pluck',v:.35});
    if(rep>=2)for(let k=0;k<8;k++)ev.push({b:o+k,m:0,d:0,i:'drum',v:.4});
    if(rep>=1)seq(o,['B4','C#5','D5','E5','F#5','D5','F#5',null],.5,ev,'flute',.16);
  }
  return{bpm:120,len:32,ev};
}
const PIECES=[pieceSatie(),piecePachelbel(),pieceGrieg()];

/* Instrumente */
const INST={
  pad:(t,m,d,v)=>{const f=mhz(m);[0,3].forEach(c=>{const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;o.detune.value=c*4;
    fl.type='lowpass';fl.frequency.value=900;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.5,t+Math.min(.4,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(fl);fl.connect(g);g.connect(musG);o.start(t);o.stop(t+d+.05)})},
  pluck:(t,m,d,v)=>{tone(mhz(m),t,Math.min(d,1.2),{type:'triangle',vol:v,atk:.004,dest:musG});tone(mhz(m)*2,t,.25,{type:'sine',vol:v*.3,atk:.002,dest:musG})},
  flute:(t,m,d,v)=>{const o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain();o.type='sine';o.frequency.value=mhz(m);
    lfo.frequency.value=5;lg.gain.value=mhz(m)*.006;lfo.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.08);g.gain.setValueAtTime(v,t+Math.max(.1,d*.6));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(musG);o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
    noise(t,Math.min(d,.3),{f:mhz(m)*2,q:4,vol:v*.08,dest:musG})},
  brass:(t,m,d,v)=>{const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=mhz(m);
    fl.type='lowpass';fl.frequency.setValueAtTime(500,t);fl.frequency.linearRampToValueAtTime(1800,t+d*.5);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.55,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+d*.95);
    o.connect(fl);fl.connect(g);g.connect(musG);o.start(t);o.stop(t+d+.05)},
  drum:(t,m,d,v)=>{tone(95,t,.3,{type:'sine',vol:v,to:48,dest:musG});noise(t,.06,{f:300,type:'lowpass',vol:v*.5,dest:musG})}
};

let cur=-1,loopT=0,beatDone=0;
function startPiece(e){cur=e;loopT=ac.currentTime+.4;beatDone=0}
function schedule(){
  if(!ac||musicV<=0)return;
  if(cur!==epoch)startPiece(epoch);
  let P=PIECES[cur],spb=60/P.bpm;
  if(loopT+beatDone*spb<ac.currentTime-.5){startPiece(cur);P=PIECES[cur]}
  const upTo=(ac.currentTime+1.2-loopT)/spb;
  for(let guard=0;guard<4;guard++){
    const end=Math.min(upTo,P.len);
    for(const e of P.ev)if(e.b>=beatDone&&e.b<end&&e.m>=0)INST[e.i](loopT+e.b*spb,e.m,e.d*spb,e.v);
    beatDone=Math.max(beatDone,end);
    if(upTo>=P.len){loopT+=P.len*spb;beatDone=0;return schedule()}
    break;
  }
}

function applyGains(){
  if(!ac)return;const n=ac.currentTime;
  musG.gain.setTargetAtTime(musicV*.45,n,.1);sfxG.gain.setTargetAtTime(sfxV*.57,n,.05);
}
return{
  init,play,
  setEpoch(e){epoch=Math.max(0,Math.min(2,e|0))},
  setMusic(v){const was=musicV;musicV=Math.max(0,Math.min(1,v));if(was<=0&&musicV>0)cur=-1;save();applyGains()},
  setSfx(v){sfxV=Math.max(0,Math.min(1,v));save();applyGains()},
  get music(){return musicV},get sfx(){return sfxV}
};
})();
