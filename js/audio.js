/* Epochenkrieg – Klang. Alles wird im Browser erzeugt (Web Audio), keine Audiodateien. */
const SND=(()=>{
let ac=null,master,sfxG,musG,musBase,musWar,noiseBuf,musicV=.7,sfxV=.7,musTimer=null,epoch=0,fight=0,alertV=0,tn=0,mdst=null;
const last={};
try{const m=localStorage.getItem('ek-music-v'),f=localStorage.getItem('ek-sfx-v');if(m!==null)musicV=+m;if(f!==null)sfxV=+f}catch(_){}
const save=()=>{try{localStorage.setItem('ek-music-v',musicV);localStorage.setItem('ek-sfx-v',sfxV)}catch(_){}};

function init(){
  if(ac){if(ac.state==='suspended')ac.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  ac=new C();master=ac.createGain();master.gain.value=.8;master.connect(ac.destination);
  sfxG=ac.createGain();sfxG.gain.value=sfxV*.57;sfxG.connect(master);
  musG=ac.createGain();musG.gain.value=musicV*.45;musG.connect(master);
  musBase=ac.createGain();musBase.connect(musG);musWar=ac.createGain();musWar.gain.value=0;musWar.connect(musG);mdst=musBase;
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  // Wind: leises, langsam an- und abschwellendes Rauschen
  {const wg=ac.createGain(),ws=ac.createBufferSource(),wf=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();ws.buffer=noiseBuf;ws.loop=true;wf.type='bandpass';wf.frequency.value=420;wf.Q.value=.4;
    wg.gain.value=.035;lfo.frequency.value=.11;lg.gain.value=.022;lfo.connect(lg);lg.connect(wg.gain);ws.connect(wf);wf.connect(wg);wg.connect(sfxG);ws.start();lfo.start()}
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
  /* Raubtier: tiefes, rollendes Knurren mit rauem Atem */
  growl:t=>{tone(78,t,.7,{type:'sawtooth',vol:.22,to:52,atk:.05});tone(156,t,.6,{type:'sawtooth',vol:.08,to:100,atk:.05});noise(t,.6,{f:360,to:180,q:1.2,vol:.3});for(let i=0;i<5;i++)tone(60+rnd(-8,8),t+i*.1,.07,{type:'square',vol:.07})},
  /* Reh: kurzes, scharfes Schnauben */
  deer:t=>{noise(t,.12,{f:2200,to:1200,q:1.5,vol:.28});tone(rnd(520,640),t,.12,{type:'triangle',vol:.1,to:rnd(760,900)})},
  die:t=>{tone(260,t,.4,{type:'sawtooth',vol:.12,to:60});noise(t,.18,{f:600,to:200,vol:.2});tone(90,t+.05,.3,{type:'sine',vol:.3,to:40})},
  boom:t=>{noise(t,.5,{f:420,to:70,q:.5,vol:.9});tone(60,t,.45,{type:'sine',vol:.7,to:28});noise(t,.12,{f:2400,q:.8,vol:.5})},
  shot:t=>{noise(t,.18,{f:1800,to:300,q:.6,vol:.7});tone(120,t,.14,{type:'sine',vol:.35,to:60})},
  crumble:t=>{noise(t,.8,{f:600,to:80,q:.6,vol:.7});for(let i=0;i<5;i++)noise(t+i*.1,.12,{f:rnd(300,1200),q:1,vol:.3});tone(70,t,.6,{type:'sine',vol:.5,to:35})},
  built:t=>[0,.1,.2].forEach((d,i)=>tone([392,494,587][i],t+d,.3,{type:'triangle',vol:.2})),
  ready:t=>{tone(523,t,.18,{type:'triangle',vol:.2});tone(784,t+.12,.3,{type:'triangle',vol:.2})},
  alert:t=>{tone(196,t,.4,{type:'sawtooth',vol:.2});tone(185,t+.35,.5,{type:'sawtooth',vol:.2});noise(t,.8,{f:300,type:'lowpass',vol:.1})},
  epoch:t=>[0,.18,.36,.54].forEach((d,i)=>{tone([262,330,392,523][i],t+d,.7,{type:'triangle',vol:.25});tone([131,165,196,262][i],t+d,.7,{type:'sine',vol:.2})}),
  win:t=>[0,.2,.4,.7].forEach((d,i)=>{tone([392,494,587,784][i],t+d,.8,{type:'triangle',vol:.28})}),
  lose:t=>[0,.3,.6].forEach((d,i)=>{tone([330,262,196][i],t+d,1.1,{type:'sawtooth',vol:.18})})
};
const GAP={growl:.8,deer:.6,chop:.18,mine:.18,pick:.18,hammer:.18,hit:.06,arrow:.06,die:.05,click:.03,select:.05,order:.05,drop:.1,crumble:.2};
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
const line=(out,start,list,inst,vol)=>{let b=start;for(const[n,d]of list){if(n)out.push({b,m:midi(n),d:d*1.05,i:inst,v:vol});b+=d}return b};
function pieceGreensleeves(){ // Mittelalter: Lautenmusik, 3/4 (traditionell, gemeinfrei)
  const ev=[],A=[['A3',1],['C4',2],['D4',1],['E4',1.5],['F4',.5],['E4',1],['D4',2],['B3',1],['G3',1.5],['A3',.5],['B3',1],['C4',2],['A3',1],['A3',1.5],['G#3',.5],['A3',1],['B3',2],['G#3',1],['E3',3]];
  const B=[['A3',1],['C4',2],['D4',1],['E4',1.5],['F4',.5],['E4',1],['D4',2],['B3',1],['G3',1.5],['A3',.5],['B3',1],['C4',1.5],['B3',.5],['A3',1],['G#3',1.5],['F#3',.5],['G#3',1],['A3',3]];
  let t=line(ev,0,A,'pluck',.36);t=line(ev,t,B,'pluck',.36);
  const t2=line(ev,0,A.map(([n,d])=>[n&&n.replace(/(\d)/,x=>+x+1),d]),'flute',.2); line(ev,t2,B.map(([n,d])=>[n&&n.replace(/(\d)/,x=>+x+1),d]),'flute',.2);
  const len=Math.ceil(t/3)*3,roots=['A2','A2','C3','G2','E2','A2','A2','E2'],fifths=['E3','E3','G3','D3','B2','E3','E3','B2'];
  for(let bar=0;bar<len/3;bar++){const r=roots[bar%roots.length],f=fifths[bar%fifths.length];ev.push({b:bar*3,m:midi(r),d:2.6,i:'pluck',v:.4});ev.push({b:bar*3+1,m:midi(f),d:1.2,i:'pluck',v:.22});ev.push({b:bar*3+2,m:midi(f)+5,d:1.2,i:'pluck',v:.2});if(bar%4===0)ev.push({b:bar*3,m:0,d:0,i:'drum',v:.3})}
  return{bpm:104,len,ev}}
function pieceOde(){ // Neuzeit: Beethoven, Ode an die Freude (gemeinfrei)
  const ev=[],P1=[['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],['C4',1],['C4',1],['D4',1],['E4',1]],
    E1=[['E4',1.5],['D4',.5],['D4',2]],E2=[['D4',1.5],['C4',.5],['C4',2]],
    M=[['D4',1],['D4',1],['E4',1],['C4',1],['D4',1],['E4',.5],['F4',.5],['E4',1],['C4',1],['D4',1],['E4',.5],['F4',.5],['E4',1],['D4',1],['C4',1],['D4',1],['G3',2]];
  let t=line(ev,0,P1.concat(E1),'brass',.34);t=line(ev,t,P1.concat(E2),'brass',.34);t=line(ev,t,M,'brass',.34);t=line(ev,t,P1.concat(E2),'brass',.34);
  line(ev,0,[],'flute',0);
  let t3=0;for(const seg of[P1.concat(E1),P1.concat(E2),M,P1.concat(E2)])t3=line(ev,t3,seg.map(([n,d])=>[n&&n.replace(/(\d)/,x=>+x+1),d]),'flute',.16);
  const len=Math.ceil(t/4)*4,bass=['C2','C2','C2','G2','C2','C2','C2','G2','G2','C2','G2','C2'];
  for(let bar=0;bar<len/4;bar++){const r=bass[bar%bass.length];ev.push({b:bar*4,m:midi(r),d:3.6,i:'pad',v:.3});ev.push({b:bar*4,m:midi(r),d:1.8,i:'pluck',v:.34});ev.push({b:bar*4+2,m:midi(r)+7,d:1.8,i:'pluck',v:.26});ev.push({b:bar*4,m:0,d:0,i:'drum',v:.4});ev.push({b:bar*4+2,m:0,d:0,i:'drum',v:.25})}
  return{bpm:108,len,ev}}
const PIECES=[pieceSatie(),piecePachelbel(),pieceGrieg(),pieceGreensleeves(),pieceOde()];

/* Instrumente */
const INST={
  pad:(t,m,d,v)=>{const f=mhz(m);[0,3].forEach(c=>{const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;o.detune.value=c*4;
    fl.type='lowpass';fl.frequency.value=900;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.5,t+Math.min(.4,d*.3));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(fl);fl.connect(g);g.connect(mdst);o.start(t);o.stop(t+d+.05)})},
  pluck:(t,m,d,v)=>{tone(mhz(m),t,Math.min(d,1.2),{type:'triangle',vol:v,atk:.004,dest:mdst});tone(mhz(m)*2,t,.25,{type:'sine',vol:v*.3,atk:.002,dest:mdst})},
  flute:(t,m,d,v)=>{const o=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain();o.type='sine';o.frequency.value=mhz(m);
    lfo.frequency.value=5;lg.gain.value=mhz(m)*.006;lfo.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.08);g.gain.setValueAtTime(v,t+Math.max(.1,d*.6));g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(mdst);o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);
    noise(t,Math.min(d,.3),{f:mhz(m)*2,q:4,vol:v*.08,dest:mdst})},
  brass:(t,m,d,v)=>{const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=mhz(m);
    fl.type='lowpass';fl.frequency.setValueAtTime(500,t);fl.frequency.linearRampToValueAtTime(1800,t+d*.5);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.55,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+d*.95);
    o.connect(fl);fl.connect(g);g.connect(mdst);o.start(t);o.stop(t+d+.05)},
  snare:(t,m,d,v)=>{noise(t,.14,{f:2600,q:.7,vol:v*.7,dest:mdst});tone(190,t,.08,{type:'triangle',vol:v*.4,to:120,dest:mdst})},
  tom:(t,m,d,v)=>{tone(mhz(m||50),t,.3,{type:'sine',vol:v,to:mhz(m||50)*.6,dest:mdst});noise(t,.05,{f:400,type:'lowpass',vol:v*.3,dest:mdst})},
  strings:(t,m,d,v)=>{[-5,5].forEach(c=>{const o=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter(),lf=ac.createOscillator(),lg=ac.createGain();o.type='sawtooth';o.frequency.value=mhz(m);o.detune.value=c;fl.type='lowpass';fl.frequency.value=1500;
    lf.frequency.value=11;lg.gain.value=v*.22;lf.connect(lg);lg.connect(g.gain);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.35,t+.15);g.gain.setValueAtTime(v*.35,t+d*.8);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(fl);fl.connect(g);g.connect(mdst);o.start(t);lf.start(t);o.stop(t+d+.05);lf.stop(t+d+.05)})},
  drum:(t,m,d,v)=>{tone(95,t,.3,{type:'sine',vol:v,to:48,dest:mdst});noise(t,.06,{f:300,type:'lowpass',vol:v*.5,dest:mdst})}
};

/* Kampfmusik: eine zweite Ebene (Trommeln, tiefe Bläser, Streicher) wird über die Epochenmusik gelegt, sobald gekämpft wird */
function pieceWar(ep){
  const ev=[],bpm=[104,112,118,106,126][ep],roots=['D2','E2','D2','A2','E2'],rt=midi(roots[ep]),osc=[0,0,3,0,5,0,3,1];
  for(let bar=0;bar<4;bar++){const o=bar*4;
    for(let k=0;k<4;k++){ev.push({b:o+k,m:0,d:0,i:'drum',v:.55});if(ep>=2&&(k===1||k===3))ev.push({b:o+k,m:0,d:0,i:'snare',v:.5});if(k===2)ev.push({b:o+k+.5,m:rt+19,d:.3,i:'tom',v:.35})}
    if(bar===3)for(let k=0;k<4;k++)ev.push({b:o+3+k*.25,m:rt+24-k*2,d:.2,i:'tom',v:.4});
    if(ep>=1)for(let k=0;k<8;k++)ev.push({b:o+k*.5,m:rt+osc[k]+(bar%2?2:0),d:.45,i:ep>=3?'brass':'pluck',v:ep>=3?.3:.38});
    else for(let k=0;k<2;k++)ev.push({b:o+k*2,m:rt+12+(k?3:0),d:1.8,i:'flute',v:.3});
    ev.push({b:o,m:rt+12,d:4,i:'pad',v:.14});ev.push({b:o,m:rt+15,d:4,i:'pad',v:.11});ev.push({b:o,m:rt+19+(bar===3?1:0),d:4,i:'pad',v:.1});
    if(ep>=4)[0,3,7].forEach(c=>ev.push({b:o,m:rt+24+c,d:3.8,i:'strings',v:.2}));
    if(ep>=3&&bar%2===0)ev.push({b:o,m:rt+12,d:1.5,i:'brass',v:.42});
  }
  return{bpm,len:16,ev}}
const WARPIECES=[0,1,2,3,4].map(pieceWar);
const base={cur:-1,loopT:0,done:0},war={cur:-1,loopT:0,done:0};
function runLayer(L,P,dst){
  const spb=60/P.bpm;
  if(L.loopT+L.done*spb<ac.currentTime-.5){L.loopT=ac.currentTime+.4;L.done=0}
  let upTo=(ac.currentTime+1.2-L.loopT)/spb;
  for(let g=0;g<4;g++){
    const end=Math.min(upTo,P.len);mdst=dst;
    for(const e of P.ev)if(e.b>=L.done&&e.b<end&&e.m>=0)INST[e.i](L.loopT+e.b*spb,e.m,e.d*spb,e.v);
    L.done=Math.max(L.done,end);
    if(upTo>=P.len){L.loopT+=P.len*spb;L.done=0;upTo=(ac.currentTime+1.2-L.loopT)/spb;continue}
    break}
}
function chirp(t){const f=rnd(2400,4200);for(let i=0;i<2+(Math.random()*3|0);i++)tone(f*(1+i*.06),t+i*.09,.07,{type:'sine',vol:.035,to:f*rnd(1.1,1.4),dest:sfxG})}
function schedule(){
  if(!ac)return;
  fight*=.93;const want=Math.max(fight,alertV);tn+=(want-tn)*.18;const n=ac.currentTime;
  if(sfxV>0&&tn<.12&&epoch<4&&Math.random()<.035)chirp(n+.05+Math.random()*.2);
  if(musicV<=0)return;
  musBase.gain.setTargetAtTime(1-.6*tn,n,.6);musWar.gain.setTargetAtTime(tn>.1?Math.min(1.1,Math.pow(tn,1.15)*1.15):0,n,.5);
  if(base.cur!==epoch){base.cur=epoch;base.loopT=n+.4;base.done=0}
  runLayer(base,PIECES[base.cur],musBase);
  if(tn>.1){if(war.cur!==epoch){war.cur=epoch;war.loopT=n+.25;war.done=0}runLayer(war,WARPIECES[epoch],musWar)}else war.cur=-1;
}

function applyGains(){
  if(!ac)return;const n=ac.currentTime;
  musG.gain.setTargetAtTime(musicV*.45,n,.1);sfxG.gain.setTargetAtTime(sfxV*.57,n,.05);
}
return{
  init,play,
  setEpoch(e){epoch=Math.max(0,Math.min(PIECES.length-1,e|0))},
  setAlert(v){alertV=Math.max(0,Math.min(1,v))},
  setMusic(v){const was=musicV;musicV=Math.max(0,Math.min(1,v));if(was<=0&&musicV>0){base.cur=-1;war.cur=-1}save();applyGains()},
  setSfx(v){sfxV=Math.max(0,Math.min(1,v));save();applyGains()},
  get music(){return musicV},get sfx(){return sfxV}
};
})();
