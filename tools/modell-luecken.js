// Lücken-Prüfung: node tools/modell-luecken.js – zeigt je Einheit/Gebäude und Zeitalter, ob ein echtes glTF-Modell greift (■) oder die Code-Figur (□)
const fs=require('fs'),vm=require('vm'),path=require('path'),R=path.resolve(__dirname,'..')+'/';
const ctx={window:{},console,localStorage:{getItem:()=>null},document:{createElement:()=>({getContext:()=>({})})}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(R+'js/data.js','utf8')+';this.UNITS=UNITS;this.BLDS=BLDS;this.UPTO=typeof UPTO!=="undefined"?UPTO:{};this.EPOCHS=EPOCHS;this.ANIMALS=ANIMALS',ctx);
const m=JSON.parse(fs.readFileSync(R+'models/manifest.json','utf8'));
const has=(sec,k,ep)=>{const en=m[sec]&&m[sec][k];if(!en)return 0;for(const x of[].concat(en))if(x&&x.file&&!x.off&&(!x.epochs||x.epochs.includes(ep))&&fs.existsSync(R+'models/'+x.file))return 1;return 0};
const N=ctx.EPOCHS.length;const out=[];
for(const[k,u]of Object.entries(ctx.UNITS)){const e0=Math.min(u.ep||0,N-1),e1=ctx.UPTO[k]!==undefined?ctx.UPTO[k]:N-1;if(u.ep>=9){out.push(k+': ep '+u.ep+' (spezial) '+[...Array(N).keys()].map(e=>has('units',k,e)?'■':'·').join(''));continue}
  const row=[...Array(N).keys()].map(e=>e<e0||e>e1?' ':has('units',k,e)?'■':'□').join('');if(row.includes('□'))out.push('UNIT '+k.padEnd(10)+' '+row+(u.nation?' nation:'+u.nation:''))}
for(const[k,d]of Object.entries(ctx.BLDS)){const e0=d.ep||0,row=[...Array(N).keys()].map(e=>e<e0?' ':has('buildings',k,e)?'■':'□').join('');if(row.includes('□'))out.push('BLD  '+k.padEnd(10)+' '+row)}
console.log('■ glTF  □ Code-Rückfall  (Spalten = Zeitalter 0..'+(N-1)+')\n'+out.join('\n'))
