/* Epochenkrieg – Einstellungen (Optionen-Menü). Werte werden im Browser gespeichert (localStorage) und von den anderen Dateien gelesen (OPT.xyz). */
'use strict';
const OPT_DEF={camSpeed:1,edgeScroll:true,zoomSpeed:1,hpBars:'hurt',tips:true,fps:false,shadows:true,grass:true,grade:true,bloom:true,combatMusic:true,voices:true,toasts:true};
const OPT=Object.assign({},OPT_DEF);
try{Object.assign(OPT,JSON.parse(localStorage.getItem('ek-opt')||'{}'))}catch(_){}
function optSet(k,v){OPT[k]=v;try{localStorage.setItem('ek-opt',JSON.stringify(OPT))}catch(_){}optApply()}
function optReset(){Object.assign(OPT,OPT_DEF);try{localStorage.setItem('ek-opt',JSON.stringify(OPT))}catch(_){}optApply()}
/* Wirkt sofort auf Szene, Ton und Oberfläche */
function optApply(){
  try{const gl=document.getElementById('gl');if(gl)gl.style.filter=OPT.grade?'contrast(1.07) saturate(1.1)':'';
    if(typeof r3!=='undefined'&&r3&&r3.sun){r3.sun.castShadow=OPT.shadows;for(const k of['i_tuft','i_flower'])if(r3[k])r3[k].visible=OPT.grass}
    if(typeof SND!=='undefined'&&SND.setFlags)SND.setFlags({war:OPT.combatMusic,voice:OPT.voices});
    const f=document.getElementById('fps');if(f)f.hidden=!OPT.fps;const bl=document.getElementById('bloom');if(bl)bl.hidden=!OPT.bloom}catch(_){}}
