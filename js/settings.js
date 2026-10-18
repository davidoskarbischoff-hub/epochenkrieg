/* Epochenkrieg – Einstellungen (Optionen-Menü). Werte werden im Browser gespeichert (localStorage) und von den anderen Dateien gelesen (OPT.xyz). */
'use strict';
const OPT_DEF={camSpeed:1,edgeScroll:true,zoomSpeed:1,hpBars:'hurt',tips:true,fps:false,shadows:true,grass:true,grade:true,bloom:true,weather:true,combatMusic:true,voices:true,toasts:true,room:true,roomStudio:false};
/* Tastenkürzel: Aktion → Standardtaste (im Menü „Steuerung“ änderbar) */
const KEYDEF=[['pause',' ','Pause','Leertaste'],['attack','q','Angriffsmarsch'],['rage','f','Kampfrausch'],['form','g','Formation wechseln'],['home','h','Zum Hauptlager'],['explore','e','Späher erkunden'],['idle','.','Untätigen Arbeiter wählen'],['loop','l','Befehlskette wiederholen'],['yes','y','Berater: annehmen'],['no','x','Berater: ablehnen'],['tree','t','Zeitalter-Baum'],['mute','m','Ton an/aus']];
OPT_DEF.keys=Object.fromEntries(KEYDEF.map(k=>[k[0],k[1]]));
const OPT=Object.assign({},OPT_DEF);
try{const sv=JSON.parse(localStorage.getItem('ek-opt')||'{}');Object.assign(OPT,sv);OPT.keys=Object.assign({},OPT_DEF.keys,sv.keys||{})}catch(_){}
let KEYACT={};function keysBuild(){KEYACT={};for(const[a,k]of Object.entries(OPT.keys))if(k)KEYACT[k]=a}keysBuild();
/* Welche Aktion gehört zur gedrückten Taste? */
function kA(e){return KEYACT[e.key.length===1?e.key.toLowerCase():e.key]}
function keyLabel(k){return k===' '?'Leertaste':k.length===1?k.toUpperCase():k}
function keySet(act,k){const o=Object.assign({},OPT.keys);for(const a in o)if(o[a]===k&&a!==act)o[a]='';o[act]=k;optSet('keys',o);keysBuild()}
function keysReset(){optSet('keys',Object.assign({},OPT_DEF.keys));keysBuild()}
function optSet(k,v){OPT[k]=v;try{localStorage.setItem('ek-opt',JSON.stringify(OPT))}catch(_){}optApply()}
function optReset(){Object.assign(OPT,OPT_DEF);OPT.keys=Object.assign({},OPT_DEF.keys);keysBuild();try{localStorage.setItem('ek-opt',JSON.stringify(OPT))}catch(_){}optApply()}
/* Wirkt sofort auf Szene, Ton und Oberfläche */
function optApply(){
  try{const gl=document.getElementById('gl');if(gl)gl.style.filter=OPT.grade?'contrast(1.07) saturate(1.1)':'';
    if(typeof r3!=='undefined'&&r3&&r3.sun){r3.sun.castShadow=OPT.shadows;for(const k of['i_tuft','i_flower'])if(r3[k])r3[k].visible=OPT.grass}
    if(typeof SND!=='undefined'&&SND.setFlags)SND.setFlags({war:OPT.combatMusic,voice:OPT.voices});
    const f=document.getElementById('fps');if(f)f.hidden=!OPT.fps;const bl=document.getElementById('bloom');if(bl)bl.hidden=!(OPT.bloom&&typeof GQ!=='undefined'&&GQ[gfxQ].bloom)}catch(_){}}
