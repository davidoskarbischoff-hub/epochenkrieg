// Messung: Zeichenaufrufe/Dreiecke auf grosser Karte, spätes Zeitalter, ~100 Einheiten, viele Gebäude
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8123/index.html?d=');await p.waitForTimeout(6000);
const out=await p.evaluate(async()=>{
 window.__seed=7;window.__dump=new URLSearchParams(location.search).get('d')||'';newGame('normal',false,{map:'coast',size:'L',aiStyle:'balanced'});G.running=true;G.started=true;
 document.body.classList.remove('mm');try{ROOM.on=false}catch(e){}
 for(let t=0;t<2;t++)G.epoch[t]=5;
 const hq=G.ents.find(e=>e.kind==='bld'&&e.team===0&&e.type==='hq');
 const bt=['house','barracks','tower','store','market','mine','farm','castle'];
 for(let i=0;i<48;i++){const a=i*.7,r=140+Math.floor(i/8)*45;try{addBld(bt[i%bt.length],0,hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,true)}catch(e){}}
 const ut=['worker','clubman','spear','archer','knight','catapult'].filter(k=>UNITS[k]);
 for(let i=0;i<100;i++){const a=i*.37,r=60+(i%10)*14;addUnit(ut[i%ut.length],0,hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r)}
 centerOn(hq.x,hq.y);cam.z=1.0;
 await new Promise(r=>setTimeout(r,6000));
 const res={};for(const z of[1.0,.7]){cam.z=z;await new Promise(r=>setTimeout(r,2500));const i=r3.rd.info;i.autoReset=false;i.reset();const f0=i.render.frame;await new Promise(r=>setTimeout(r,3000));const n=Math.max(1,i.render.frame-f0);res['z'+z]={calls:Math.round(i.render.calls/n),tris:Math.round(i.render.triangles/n),frames:n};i.autoReset=true;}
 res.ents=G.ents.length;const q=new URLSearchParams(location.search).get('x');if(q==='sh'){r3.rd.shadowMap.enabled=false;r3.scene.traverse(m=>{if(m.material)m.material.needsUpdate=true})}if(q==='nounit'){for(const e of G.ents){if(e.kind==='unit'){const o=R3.reg.get(entKey(e));if(o)o.obj.visible=false}}}if(q){await new Promise(r=>setTimeout(r,2500));const i=r3.rd.info;res.x={calls:i.render.calls,tris:i.render.triangles}}const cnt=(o)=>{let m=0,t=0;o.traverse(x=>{if(x.isMesh&&x.visible){m++;const g=x.geometry;t+=(g.index?g.index.count:g.attributes.position.count)/3*(x.count||1)}});return[m,Math.round(t/1000)+'k']};

 const bs={};for(const e of G.ents){let o=R3.reg.get(entKey(e));if(!o||!o.obj)continue;const k=e.kind+':'+e.type;const c=cnt(o.obj);bs[k]=bs[k]||[0,0,0];bs[k][0]++;bs[k][1]+=c[0];bs[k][2]+=parseInt(c[1])}res.by=bs;if(window.__dump){const e=G.ents.find(e=>e.type===window.__dump);const o=R3.reg.get(entKey(e));res.dump=[];o.obj.traverse(x=>{if(x.isMesh){const g=x.geometry;res.dump.push((x.name||'?')+(x.isSkinnedMesh?'*':'')+':'+(g.index?g.index.count:g.attributes.position.count)/3+':'+(x.material.name||''))}})}return res});
console.log(JSON.stringify(out),'ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();
