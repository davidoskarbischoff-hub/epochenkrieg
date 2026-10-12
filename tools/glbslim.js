/* GLB verschlanken (für einfache, untexturierte Low-Poly-Modelle wie das Quaternius-Natur-Paket):
   - alle Teile mit gleichem Material zu EINEM Teil zusammenfassen (weniger Zeichenaufrufe),
   - Knoten-Drehung/-Skalierung einrechnen (Modell steht danach ohne Umweg aufrecht, Y oben),
   - flach schattierte Modelle: Normalen weglassen und gleiche Eckpunkte zusammenlegen (Three.js rechnet dann flache Schattierung, Datei ~5x kleiner).
   Modelle mit Texturen, Skelett oder Animationen werden unverändert gelassen.
   Aufruf: node tools/glbslim.js [--flat] models/nature/CommonTree_1.glb [weitere.glb …]   (überschreibt die Dateien) */
const fs=require('fs');
function readGlb(buf){
  if(buf.readUInt32LE(0)!==0x46546c67)throw new Error('keine GLB-Datei');
  let o=12,json=null,bin=null;while(o<buf.length){const len=buf.readUInt32LE(o),type=buf.readUInt32LE(o+4),d=buf.slice(o+8,o+8+len);if(type===0x4e4f534a)json=JSON.parse(d.toString('utf8'));else if(type===0x004e4942)bin=d;o+=8+len}
  return{json,bin}}
const CT={5120:[1,'readInt8'],5121:[1,'readUInt8'],5122:[2,'readInt16LE'],5123:[2,'readUInt16LE'],5125:[4,'readUInt32LE'],5126:[4,'readFloatLE']},NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
function acc(j,bin,i){const a=j.accessors[i],bv=j.bufferViews[a.bufferView],[sz,fn]=CT[a.componentType],n=NC[a.type],st=bv.byteStride||sz*n,o0=(bv.byteOffset||0)+(a.byteOffset||0),out=new Array(a.count);
  for(let k=0;k<a.count;k++){const r=new Array(n);for(let c=0;c<n;c++)r[c]=bin[fn](o0+k*st+c*sz);out[k]=r}return out}
/* 4x4-Matrizen (Spalten-Reihenfolge wie glTF) */
const mul=(a,b)=>{const r=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];r[i*4+j]=s}return r};
function trs(n){if(n.matrix)return n.matrix.slice();const t=n.translation||[0,0,0],q=n.rotation||[0,0,0,1],s=n.scale||[1,1,1],[x,y,z,w]=q;
  return[(1-2*(y*y+z*z))*s[0],2*(x*y+z*w)*s[0],2*(x*z-y*w)*s[0],0,2*(x*y-z*w)*s[1],(1-2*(x*x+z*z))*s[1],2*(y*z+x*w)*s[1],0,2*(x*z+y*w)*s[2],2*(y*z-x*w)*s[2],(1-2*(x*x+y*y))*s[2],0,t[0],t[1],t[2],1]}
const xf=(m,v)=>[m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]];
const xn=(m,v)=>{/* Normalen: nur Drehung (gleichmässige Skalierung vorausgesetzt), danach normieren */const r=[m[0]*v[0]+m[4]*v[1]+m[8]*v[2],m[1]*v[0]+m[5]*v[1]+m[9]*v[2],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]],l=Math.hypot(...r)||1;return r.map(x=>x/l)};
function slim(file){
  const{json:j,bin}=readGlb(fs.readFileSync(file));
  if((j.images||[]).length||(j.skins||[]).length||(j.animations||[]).length)return console.log('übersprungen (Textur/Skelett/Animation):',file);
  const tris={};/* Material-Index → Liste von Dreiecken [[p,n],[p,n],[p,n]] */
  const walk=(ni,pm)=>{const n=j.nodes[ni],m=mul(pm,trs(n));
    if(n.mesh!==undefined)for(const p of j.meshes[n.mesh].primitives){if((p.mode??4)!==4)throw new Error('nur Dreiecke');
      const P=acc(j,bin,p.attributes.POSITION).map(v=>xf(m,v)),N=p.attributes.NORMAL!==undefined?acc(j,bin,p.attributes.NORMAL).map(v=>xn(m,v)):null,I=p.indices!==undefined?acc(j,bin,p.indices).map(v=>v[0]):P.map((_,i)=>i);
      const L=tris[p.material??-1]||(tris[p.material??-1]=[]);for(let i=0;i<I.length;i+=3)L.push([0,1,2].map(k=>[P[I[i+k]],N?N[I[i+k]]:null]))}
    for(const c of n.children||[])walk(c,m)};
  const sc=j.scenes[j.scene||0];for(const r of sc.nodes)walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  /* flach schattiert? Low-Poly: fast jede Eckpunkt-Normale ≈ Flächennormale (mind. 90 % mit Abweichung unter 18°) → Normalen weglassen */
  let nOk=0,nAll=0,noN=false;for(const L of Object.values(tris))for(const t of L){if(!t[0][1]){noN=true;continue}const[a,b,c]=t.map(v=>v[0]),u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],w=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],fn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],l=Math.hypot(...fn);if(l<1e-12)continue;
    for(const v of t){nAll++;if((v[1][0]*fn[0]+v[1][1]*fn[1]+v[1][2]*fn[2])/l>.95)nOk++}}
  const flat=!noN&&(FORCE||nOk>=nAll*.9);
  let ext=0;for(const L of Object.values(tris))for(const t of L)for(const v of t)for(const x of v[0])ext=Math.max(ext,Math.abs(x));const qz=ext*1e-5||1e-6;
  const chunks=[],bvs=[],accs=[],prims=[];let off=0;
  const push=(arr,target)=>{const b=Buffer.from(arr.buffer,arr.byteOffset,arr.byteLength);const pad=(4-(b.length%4))%4;bvs.push({buffer:0,byteOffset:off,byteLength:b.length,...(target?{target}:{})});chunks.push(b,Buffer.alloc(pad));off+=b.length+pad;return bvs.length-1};
  for(const[mi,L]of Object.entries(tris)){const map=new Map(),pos=[],nor=[],idx=[];
    for(const t of L)for(const[p,n]of t){const k=p.map(x=>Math.round(x/qz)).join(',')+(flat||!n?'':'|'+n.map(x=>Math.round(x*1e4)).join(','));let id=map.get(k);if(id===undefined){id=pos.length/3;map.set(k,id);pos.push(...p);if(!flat&&n)nor.push(...n)}idx.push(id)}
    const nv=pos.length/3,mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(let i=0;i<nv;i++)for(let c=0;c<3;c++){mn[c]=Math.min(mn[c],pos[i*3+c]);mx[c]=Math.max(mx[c],pos[i*3+c])}
    const attrs={POSITION:accs.push({bufferView:push(new Float32Array(pos),34962),componentType:5126,count:nv,type:'VEC3',min:mn,max:mx})-1};
    if(nor.length)attrs.NORMAL=accs.push({bufferView:push(new Float32Array(nor),34962),componentType:5126,count:nv,type:'VEC3'})-1;
    const big=nv>65535,ix=accs.push({bufferView:push(big?new Uint32Array(idx):new Uint16Array(idx),34963),componentType:big?5125:5123,count:idx.length,type:'SCALAR'})-1;
    prims.push({attributes:attrs,indices:ix,mode:4,...(+mi>=0?{material:+mi}:{})})}
  const name=(j.nodes[sc.nodes[0]]||{}).name||'Model';
  const out={asset:{version:'2.0',generator:'Epochenkrieg glbslim'},scene:0,scenes:[{nodes:[0]}],nodes:[{name,mesh:0}],meshes:[{name,primitives:prims}],materials:(j.materials||[]).map(m=>{const c={...m};delete c.extensions;return c}),accessors:accs,bufferViews:bvs,buffers:[{byteLength:off}]};
  let js=Buffer.from(JSON.stringify(out),'utf8');js=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]);const bd=Buffer.concat(chunks);
  const h=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);h.writeUInt32LE(0x46546c67,0);h.writeUInt32LE(2,4);h.writeUInt32LE(12+8+js.length+8+bd.length,8);jh.writeUInt32LE(js.length,0);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bd.length,0);bh.writeUInt32LE(0x004e4942,4);
  const before=fs.statSync(file).size,res=Buffer.concat([h,jh,js,bh,bd]);fs.writeFileSync(file,res);
  console.log(file,(before/1024).toFixed(0)+' KB →',(res.length/1024).toFixed(0)+' KB,',prims.length,'Teile,',flat?'flach':'mit Normalen')}
const FORCE=process.argv.includes('--flat');/* --flat: immer flach schattieren */
for(const f of process.argv.slice(2).filter(a=>a!=='--flat'))try{slim(f)}catch(e){console.log('Fehler',f,e.message)}
