/* Epochenkrieg – Klang. Alles wird im Browser erzeugt (Web Audio), keine Audiodateien. */
const SND=(()=>{
let ac=null,master,sfxG,musG,noiseBuf,musicOn=true,sfxOn=true,musTimer=null,nextT=0,step=0,epoch=0,fight=0;
const last={};
try{musicOn=localStorage.getItem('ek-music')!=='0';sfxOn=localStorage.getItem('ek-sfx')!=='0'}catch(_){}
const save=()=>{try{localStorage.setItem('ek-music',musicOn?'1':'0');localStorage.setItem('ek-sfx',sfxOn?'1':'0')}catch(_){}};

function init(){
  if(ac){if(ac.state==='suspended')ac.resume();return}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  ac=new C();master=ac.createGain();master.gain.value=.8;master.connect(ac.destination);
  sfxG=ac.createGain();sfxG.gain.value=sfxOn?.7:0;sfxG.connect(master);
  musG=ac.createGain();musG.gain.value=musicOn?.32:0;musG.connect(master);
  noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  nextT=ac.currentTime+.3;
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
const FX={
  click:t=>tone(520,t,.07,{type:'triangle',vol:.18}),
  select:t=>{tone(330,t,.06,{type:'triangle',vol:.15});tone(495,t+.04,.07,{type:'triangle',vol:.12})},
  order:t=>tone(250,t,.09,{type:'triangle',vol:.16,to:190}),
  error:t=>{tone(140,t,.18,{type:'sawtooth',vol:.14});tone(120,t+.07,.18,{type:'sawtooth',vol:.12})},
  chop:t=>{noise(t,.07,{f:1800,q:.8,vol:.5});tone(150,t,.09,{type:'square',vol:.12,to:80})},
  mine:t=>{noise(t,.05,{f:4200,q:2,vol:.45});tone(1500+Math.random()*300,t,.07,{type:'triangle',vol:.1,to:900})},
  pick:t=>{tone(600+Math.random()*200,t,.08,{vol:.14,to:900});noise(t,.05,{f:2500,q:1,vol:.12})},
  hammer:t=>{noise(t,.05,{f:900,q:1.5,vol:.5});tone(210,t,.1,{type:'square',vol:.14,to:120})},
  drop:t=>{tone(400,t,.06,{type:'triangle',vol:.14});tone(560,t+.05,.09,{type:'triangle',vol:.14})},
  hit:t=>{noise(t,.12,{f:500,to:200,q:.7,vol:.55});tone(110,t,.14,{type:'sine',vol:.4,to:55})},
  arrow:t=>{noise(t,.18,{f:3500,to:900,q:3,vol:.18});tone(260,t,.08,{type:'triangle',vol:.1,to:140})},
  die:t=>{tone(300,t,.35,{type:'sawtooth',vol:.14,to:70});noise(t,.2,{f:700,to:200,vol:.2})},
  crumble:t=>{noise(t,.7,{f:600,to:80,q:.6,vol:.7});tone(70,t,.6,{type:'sine',vol:.5,to:35})},
  built:t=>[0,.1,.2].forEach((d,i)=>tone([392,494,587][i],t+d,.3,{type:'triangle',vol:.2})),
  ready:t=>{tone(523,t,.18,{type:'triangle',vol:.2});tone(784,t+.12,.3,{type:'triangle',vol:.2})},
  alert:t=>{tone(196,t,.4,{type:'sawtooth',vol:.2});tone(185,t+.35,.5,{type:'sawtooth',vol:.2});noise(t,.8,{f:300,type:'lowpass',vol:.1})},
  epoch:t=>[0,.18,.36,.54].forEach((d,i)=>{tone([262,330,392,523][i],t+d,.7,{type:'triangle',vol:.25});tone([131,165,196,262][i],t+d,.7,{type:'sine',vol:.2})}),
  win:t=>[0,.2,.4,.7].forEach((d,i)=>{tone([392,494,587,784][i],t+d,.8,{type:'triangle',vol:.28})}),
  lose:t=>[0,.3,.6].forEach((d,i)=>{tone([330,262,196][i],t+d,1.1,{type:'sawtooth',vol:.18})})
};
const GAP={chop:.18,mine:.18,pick:.18,hammer:.18,hit:.06,arrow:.06,die:.05,click:.03,select:.05,order:.05,drop:.1,crumble:.2};
function play(name){
  if(!ac||!sfxOn||!FX[name])return;
  const n=ac.currentTime;if(last[name]&&n-last[name]<(GAP[name]||.02))return;last[name]=n;
  if(name==='hit'||name==='arrow'||name==='die'||name==='crumble')fight=Math.min(1,fight+.3);
  FX[name](n+.005);
}

/* ---- Musik: ruhige Pentatonik, pro Epoche eine eigene Stimmung ---- */
const SCALES=[ // Steinzeit: dunkel und dumpf, Bronze: hell, Eisen: heroisch
  {root:110,steps:[0,3,5,7,10],bpm:62},
  {root:131,steps:[0,2,4,7,9],bpm:72},
  {root:146,steps:[0,2,3,7,8],bpm:84}
];
const hz=(root,semi)=>root*Math.pow(2,semi/12);
function schedule(){
  if(!ac||!musicOn)return;
  const sc=SCALES[epoch]||SCALES[0],beat=60/(sc.bpm*(1+fight*.25));fight=Math.max(0,fight-.05);
  while(nextT<ac.currentTime+1){
    const t=nextT,b=step%16;
    if(b%4===0){ // Trommel
      tone(80,t,.25,{type:'sine',vol:.55,to:45,dest:musG});
      if(epoch>0&&b%8===4)noise(t,.08,{f:900,q:1,vol:.12,dest:musG});
    }
    if(b===0){ // Bordun
      tone(hz(sc.root,-12),t,beat*8,{type:'triangle',vol:.28,atk:.8,dest:musG});
      tone(hz(sc.root,-5),t,beat*8,{type:'sine',vol:.2,atk:1,dest:musG});
    }
    if(Math.random()<(b%2===0?.45:.2)){ // Melodie
      const s=sc.steps[Math.floor(Math.random()*sc.steps.length)]+(Math.random()<.3?12:0);
      tone(hz(sc.root,s+12),t,beat*(1.5+Math.random()*2),{type:epoch===2?'sawtooth':'triangle',vol:epoch===2?.07:.14,atk:.03,dest:musG});
    }
    nextT+=beat/2;step++;
  }
}

function applyGains(){
  if(!ac)return;const n=ac.currentTime;
  musG.gain.setTargetAtTime(musicOn?.32:0,n,.1);sfxG.gain.setTargetAtTime(sfxOn?.7:0,n,.05);
}
return{
  init,play,
  setEpoch(e){epoch=Math.max(0,Math.min(2,e|0))},
  toggleMusic(){musicOn=!musicOn;save();applyGains();return musicOn},
  toggleSfx(){sfxOn=!sfxOn;save();applyGains();return sfxOn},
  get music(){return musicOn},get sfx(){return sfxOn}
};
})();
