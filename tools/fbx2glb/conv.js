// FBX → GLB (Dateien relativ zum Spielordner): node conv.js jobs.json   jobs: [{src,out,tex:{name:pfad},noflip,dark,rotX}]
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const REPO=process.env.REPO||path.resolve(__dirname,'../..'),NM=process.env.NM||path.join(__dirname,'node_modules');
(async()=>{const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
p.on('console',m=>{if(m.type()==='error')console.log('CE',m.text().slice(0,200))});
await p.route('http://conv.local/**',async r=>{const u=new URL(r.request().url());let f=decodeURIComponent(u.pathname);let fp;
  if(f==='/conv.html')fp=path.join(__dirname,'conv.html');else if(f.startsWith('/nm/'))fp=path.join(NM,f.slice(4));else if(f.startsWith('/repo/'))fp=path.join(REPO,f.slice(6));
  if(!fp||!fs.existsSync(fp))return r.fulfill({status:404,body:'nf'});const ct=fp.endsWith('.js')?'text/javascript':fp.endsWith('.html')?'text/html':fp.endsWith('.png')?'image/png':'application/octet-stream';
  r.fulfill({status:200,body:fs.readFileSync(fp),headers:{'content-type':ct}})});
await p.goto('http://conv.local/conv.html');await p.waitForFunction(()=>window.ready);
for(const j of jobs){try{const tex={};for(const[k,v]of Object.entries(j.tex||{}))tex[k.toLowerCase()]='/repo/'+v;
  const r=await p.evaluate(job=>window.convert(job),{...j,src:'/repo/'+j.src,tex});
  if(j.out){const o=path.join(REPO,j.out);fs.mkdirSync(path.dirname(o),{recursive:true});fs.writeFileSync(o,Buffer.from(r.b64,'base64'))}
  console.log(JSON.stringify({src:j.src,out:j.out,kb:Math.round(r.b64.length*.75/1024),...r.info}))}catch(e){console.log(JSON.stringify({src:j.src,err:String(e).slice(0,200)}))}}
await b.close()})();
