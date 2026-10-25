/* Zwei-Seiten-Mehrspielertest (reproduzierbar, ohne Internet).
   Start:  NODE_PATH=<ordner mit playwright> node tools/mp-test.js [ausgabeordner]
   Zwei Playwright-Seiten in EINEM Browser-Kontext (Software-GL), eigener Port,
   Verbindung lokal über BroadcastChannel (Lobby „Lokal testen“, ?join=local:CODE).
   Prüft: (1) Verbindung/Start/Snapshot/Konsole, (2) Aufstieg Zeitalter 6 mit Nationen beider Seiten,
   Nationen-Einheiten drüben sichtbar (Bilder), (3) Spät-Modelle nach EKMODELS.loadAll alle glTF,
   (4) Gast-Ego-Schlag 'ufire' über das Netz, (5) Gast-Turm-Freischuss 'tfire'. Ergebnis: Zeilen OK/FEHLER, Exitcode 1 bei Fehler. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=path.resolve(process.argv[2]||'/tmp/mp-test');fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.mp3':'audio/mpeg','.svg':'image/svg+xml','.wav':'audio/wav'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
const res=[];const rep=(n,ok,t)=>{res.push(ok);console.log((ok?'OK     ':'FEHLER ')+n+(t?' – '+t:''))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const T0=Date.now(),P=s=>console.log('   ['+Math.round((Date.now()-T0)/1000)+'s] '+s);
(async()=>{
 await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
 const b=await chromium.launch({executablePath:process.env.CHROME||'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:800,height:500}});
 await ctx.addInitScript(()=>{window.__seed=5;if(!location.search.includes('join'))window.__norender=true}); /* Gastgeber ohne Zeichnen (schneller), Gast zeichnet */ /* KEIN __eagerModels: Spät-Modelle laden nach */
 const h=await ctx.newPage(),g=await ctx.newPage(),errs=[];
 for(const [n,p] of [['H',h],['G',g]]){p.on('pageerror',e=>errs.push(n+' PE '+e.message));p.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&/snap|cmd/.test(m.text())))errs.push(n+' '+m.type()+' '+m.text().slice(0,200))})}
 await h.goto(`http://localhost:${port}/index.html`,{timeout:180000});await h.waitForFunction(()=>window.Lobby&&window.__ek,null,{timeout:180000});await sleep(5000);
 P('Seiten laden');await h.evaluate(()=>Lobby.open());await h.click('#lLocal');await sleep(500);
 const link=await h.inputValue('#lLink');await g.goto(link,{timeout:180000,waitUntil:'domcontentloaded'});
 await g.waitForFunction(()=>window.Lobby&&window.__ek,null,{timeout:180000});
 P('Gast verbunden');await sleep(15000);
 /* (0) Lobby: Bereit-Status und Chat in beide Richtungen */
 await g.waitForSelector('#lReady',{timeout:30000});
 const st0=await h.textContent('#lStart');
 await g.click('#lReady');await sleep(1500);
 const st1=await h.textContent('#lStart'),rd=await h.textContent('#lRdyS');
 rep('(0) Bereit: Gastgeber sieht Status und Start-Knopf',/wartet/.test(st0)&&/bereit/i.test(st1)&&!/wartet/.test(st1)&&rd==='bereit',st0.trim()+' -> '+st1.trim());
 await g.fill('#mpchatin','Hallo <b>Gastgeber</b>');await g.press('#mpchatin','Enter',{noWaitAfter:true,timeout:90000});await sleep(1000);
 await h.fill('#mpchatin','Hi Gast');await h.press('#mpchatin','Enter',{noWaitAfter:true,timeout:90000});await sleep(1000);
 const lg=p=>p.evaluate(()=>[...document.querySelectorAll('#mpchatlog .cl')].map(d=>d.textContent+'|'+d.querySelectorAll('b').length));
 const lh=await lg(h),lgg=await lg(g);
 rep('(0) Lobby-Chat in beide Richtungen, HTML bleibt Text',lh.some(x=>x.includes('Hallo <b>Gastgeber</b>'))&&lgg.some(x=>x.includes('Hi Gast'))&&lh.every(x=>x.endsWith('|1')),JSON.stringify([lh,lgg]));
 await h.click('#lStart',{noWaitAfter:true,timeout:120000});
 P('Start gedrückt');
 let ok1=false;for(let i=0;i<90&&!ok1;i++){await sleep(1000);ok1=await g.evaluate(()=>!!(typeof G!=='undefined'&&G&&G.ents&&G.ents.length>20&&NET.client&&NET.lastSnap>0)).catch(()=>false)}
 rep('(1) Verbindung, Start, Snapshot beim Gast',ok1,'Gast '+await g.evaluate(()=>typeof G!=='undefined'&&G&&G.ents?G.ents.length:-1).catch(()=>'?')+' Objekte, Host '+await h.evaluate(()=>G.ents.length));
 await sleep(4000);
 /* (0b) Chat im Spiel: Enter oeffnet die Zeile, Nachricht kommt beim anderen an und verschwindet nach 8 s */
 await g.keyboard.press('Enter');await g.keyboard.type('Gast im Spiel');await g.keyboard.press('Enter');
 await h.keyboard.press('Enter');await h.keyboard.type('Host im Spiel');await h.keyboard.press('Enter');await sleep(1500);
 const gh=await lg(h),gg=await lg(g);
 rep('(0b) Spiel-Chat in beide Richtungen',gh.some(x=>x.includes('Gast im Spiel'))&&gg.some(x=>x.includes('Host im Spiel')),JSON.stringify([gh,gg]));
 for(let i=0;i<30&&((await lg(h)).length||(await lg(g)).length);i++)await sleep(1000); /* Software-GL ist langsam: Zeitgeber koennen spaet laufen */
 rep('(0b) Chat-Zeilen verschwinden nach 8 s',(await lg(h)).length===0&&(await lg(g)).length===0);
 const cnt=p=>p.evaluate(()=>[G.ents.filter(e=>e.kind==='unit').length,G.ents.filter(e=>e.kind==='bld').length]);
 const cH=await cnt(h),cG=await cnt(g);rep('(1) gleiche Zahl Einheiten/Gebäude',cH[0]===cG[0]&&cH[1]===cG[1],JSON.stringify([cH,cG]));
 rep('(1) keine Konsolenfehler bis hier',errs.length===0,errs.slice(0,3).join(' | '));
 /* (2) Aufstieg bis Zeitalter 6 mit Nationen (Host = Team 0 = 'de', Gast = Team 1 auf dem Host = 'ru') */
 await h.evaluate(()=>{const E=__ek,G=E.G;const hqs=[0,1].map(t=>G.ents.find(e=>e.type==='hq'&&e.team===t));
  for(const t of[0,1]){G.epoch[t]=5;for(const r in G.res[t])G.res[t][r]=60000;
   for(let i=0;i<60;i++)E.addUnit('worker',t,hqs[t].x+80+(i%10)*14,hqs[t].y+130+((i/10)|0)*14)}
  E.applyLevels&&E.applyLevels(0);E.applyLevels&&E.applyLevels(1)}).catch(e=>console.log('prep',e.message));
 await sleep(3000);
 const adv=await h.evaluate(()=>{try{return advance(0,'de')}catch(e){return 'ERR '+e.message}});
 const advG=await g.evaluate(()=>{try{return advance(0,'ru')}catch(e){return 'ERR '+e.message}});
 await sleep(1500);
 await h.evaluate(()=>{for(const t of[0,1])if(G.adv[t])G.adv[t].t=G.adv[t].time-.2});
 let nat=[];for(let i=0;i<40;i++){await sleep(1000);nat=await h.evaluate(()=>[G.epoch[0],G.epoch[1],G.nation[0],G.nation[1]]);if(nat[0]===6&&nat[1]===6)break}
 rep('(2) Aufstieg Zeitalter 6 beider Seiten, Nationen',nat[0]===6&&nat[1]===6&&nat[2]==='de'&&nat[3]==='ru',JSON.stringify(nat)+' advance H/G='+adv+'/'+advG);
 await sleep(3000);
 const gn=await g.evaluate(()=>[G.epoch[0],G.epoch[1],G.nation[0],G.nation[1]]);
 rep('(2) Gast kennt Zeitalter/Nationen (er = Team 0)',gn[0]===6&&gn[2]==='ru'&&gn[3]==='de',JSON.stringify(gn));
 /* Nationen-Einheiten beider Seiten nebeneinander stellen */
 const sc=await h.evaluate(()=>{const E=__ek,G=E.G;const hq=G.ents.find(e=>e.type==='hq'&&e.team===0);const x0=hq.x+250,y0=hq.y+250;
  const mk=(t,ty,i,j)=>{const u=E.addUnit(ty,t,x0+i*45,y0+j*50);u.hp=u.maxHp=3000;return u.id};
  const ids=[];['sturm','bertha'].forEach((ty,i)=>ids.push(mk(0,ty,i,0)));['rekrut','kosak'].forEach((ty,i)=>ids.push(mk(1,ty,i,1)));
  return{x:x0,y:y0,ids}});
 await sleep(1500);
 const gSee=await g.evaluate(ids=>ids.map(id=>{const e=G.byId.get(id);return e&&[e.type,e.team]}),sc.ids);
 rep('(2) Nationen-Einheiten beim Gast angekommen',gSee.every(Boolean),JSON.stringify(gSee));
 for(const p of[h,g])await p.evaluate(s=>{ROOM.fly=null;__ek.centerOn(s.x+25,s.y-10);__ek.cam.z=2.6;const c=document.getElementById('c');if(c)c.style.display='none'},sc /* 2D-Anzeigen (Balken, Ringe) aus: Figuren frei sehen */);
 await sleep(8000);await h.screenshot({path:OUT+'/host_nationen.png',timeout:120000});await g.screenshot({path:OUT+'/gast_nationen.png',timeout:120000});
 console.log('   Bilder:',OUT+'/host_nationen.png',OUT+'/gast_nationen.png');
 rep('(2) keine Konsolenfehler (applySnap/cmd)',errs.length===0,errs.slice(0,3).join(' | '));
 /* (3) Nachladen: ohne __eagerModels erst laden lassen, dann Rückfall-Figuren zählen */
 for(const p of[h,g])await p.evaluate(()=>EKMODELS.loadAll()).catch(()=>{});
 await sleep(8000);
 const full=[await h.evaluate(()=>EKMODELS.full),await g.evaluate(()=>EKMODELS.full)];
 rep('(3) EKMODELS.full auf beiden Seiten nach loadAll',full[0]&&full[1],JSON.stringify(full));
 /* Registry nur beim Gast (Gastgeber zeichnet nicht): alle sichtbaren Objekte glTF? Code-Rückfall nur cannon/trench/derrick */
 const scan=()=>g.evaluate(()=>{let n=0,gl=0;const code=[];for(const e of G.ents){if(e.kind==='node'||e.kind==='animal'||e.dead)continue;const o=R3.reg.get(entKey(e));if(!o||!o.obj)continue;n++;let f=!!(o.rig&&o.rig.gltf);o.obj.traverse(c=>{if(c.userData&&c.userData.gltf)f=true});if(f)gl++;else code.push(e.type)}return{n,gl,code:[...new Set(code)],hq:G.ents.filter(e=>e.type==='hq').map(e=>{const o=R3.reg.get(entKey(e));return[e.team,e.lvl,e.done,o&&o.sig,o&&o.obj.visible,o&&o.obj.children.length,o&&!!o.obj.userData.gltf]})}});
 let vG=await scan();for(let i=0;i<12&&vG.code.some(t=>!['cannon','trench','derrick'].includes(t));i++){await g.evaluate(i=>{const q=G.ents.filter(e=>e.type==='hq');__ek.centerOn(q[i%q.length].x,q[i%q.length].y)},i);await sleep(5000);vG=await scan()} /* Gast zeichnet ~1 Bild/s; außerhalb des Bildes wird erst beim Hinschauen neu gebaut: Kamera über die Hauptlager schicken */
 console.log('   Registry Gast',JSON.stringify(vG));
 rep('(3) Gast: Objekte sichtbar, nur bekannte Code-Lücken',vG.n>0&&vG.code.every(t=>['cannon','trench','derrick'].includes(t)),`${vG.gl}/${vG.n} glTF, Code: ${vG.code}`);
 /* (4) Gast-Ego-Schlag über das Netz: Gast ist Team 1 auf dem Host */
 const e4=await h.evaluate(()=>{const E=__ek,G=E.G;const hq=G.ents.find(e=>e.type==='hq'&&e.team===1);const mk=(t,x,y)=>{const u=E.addUnit('spear',t,x,y);u.hp=u.maxHp=100000;return u};
  const a=mk(1,hq.x+300,hq.y+300),f=mk(0,hq.x+312,hq.y+300);a.cd=0;f.fa=0;return{a:a.id,f:f.id}});
 await sleep(2500);
 const hp0=await h.evaluate(i=>G.byId.get(i.f).hp,e4);let sent='',hp1=hp0;
 for(let k=0;k<4&&hp1>=hp0;k++){await h.evaluate(i=>{const a=G.byId.get(i.a),f=G.byId.get(i.f);a.cd=0;a.state='idle';f.x=a.x+12;f.y=a.y},e4); /* Nachladeuhr zurück: der Gastgeber darf nicht schon automatisch schlagen */
  sent+=await g.evaluate(i=>{const calls=[];const o=NET.send;NET.send=m=>{calls.push(m.c);return o(m)};try{unitStrike(0,i.a,i.f)}catch(e){calls.push('ERR '+e.message)}NET.send=o;return calls.join(',')+';'},e4);
  await sleep(2500);hp1=await h.evaluate(i=>G.byId.get(i.f).hp,e4)}
 rep("(4) Gast-Ego-Schlag 'ufire' über das Netz trifft",sent.includes('ufire')&&hp1<hp0,`gesendet=${sent} hp ${hp0}->${hp1}`);
 /* (5) Gast-Turm-Freischuss 'tfire' mit Zielpunkt (Ego-Wachturm ohne Ziel): Pfeil entsteht auf dem Gastgeber, trifft den Feind am Zielpunkt */
 const e5=await h.evaluate(()=>{const E=__ek,G=E.G;const hq=G.ents.find(e=>e.type==='hq'&&e.team===1);const t=E.addBld('tower',1,hq.x-260,hq.y+300,true);t.built=true;t.cd=0;t.manT=G.t+30;/* keine Auto-Schüsse */
  const f=E.addUnit('spear',0,t.x+90,t.y);f.hp=f.maxHp=100000;f.state='idle';return{t:t.id,f:f.id,fx:f.x,fy:f.y}});
 await sleep(2500);
 const q0=await h.evaluate(i=>G.byId.get(i.f).hp,e5);let s5='',q1=q0;
 for(let k=0;k<3&&q1>=q0;k++){await h.evaluate(i=>{const t=G.byId.get(i.t);t.cd=0;t.manT=G.t+30;const f=G.byId.get(i.f);f.x=i.fx;f.y=i.fy},e5);
  s5+=await g.evaluate(i=>{const calls=[];const o=NET.send;NET.send=m=>{calls.push(m.c+(m.tx!==undefined?'@'+m.tx+','+m.ty:''));return o(m)};try{towerFire(0,i.t,0,i.fx,i.fy)}catch(e){calls.push('ERR '+e.message)}NET.send=o;return calls.join(',')+';'},e5);
  await sleep(2500);q1=await h.evaluate(i=>G.byId.get(i.f).hp,e5)}
 rep("(5) Gast-Turm-Freischuss 'tfire' über das Netz trifft",s5.includes('tfire@')&&q1<q0,`gesendet=${s5} hp ${q0}->${q1}`);
 rep('(4) keine Konsolenfehler insgesamt',errs.length===0,errs.slice(0,4).join(' | '));
 await b.close();srv.close();
 console.log(res.every(Boolean)?'ALLES OK':'FEHLER VORHANDEN');process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.error('Testabbruch',e);process.exit(2)});
