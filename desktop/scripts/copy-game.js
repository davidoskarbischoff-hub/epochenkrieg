/* Kopiert das Spiel (index.html, css/, js/) unverändert in desktop/game, damit die App es mitnimmt. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),dest=path.join(__dirname,'..','game');
fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
for(const n of['index.html','css','js']){const s=path.join(root,n);if(!fs.existsSync(s)){console.error('Fehlt:',s);process.exit(1)}fs.cpSync(s,path.join(dest,n),{recursive:true})}
/* Modelle: nur die im Manifest eingetragenen Dateien mitnehmen (der Ordner models/neu ist sehr gross, die App soll klein bleiben) */
const mf=path.join(root,'models','manifest.json');
if(fs.existsSync(mf)){fs.mkdirSync(path.join(dest,'models'),{recursive:true});fs.copyFileSync(mf,path.join(dest,'models','manifest.json'));
  const m=JSON.parse(fs.readFileSync(mf,'utf8')),used=new Set();
  for(const sec of['units','buildings','animals','nodes'])for(const en of Object.values(m[sec]||{}))for(const x of Array.isArray(en)?en:[en])if(x&&x.file&&!x.off)used.add(x.file);
  for(const f of used){const a=path.join(root,'models',f);if(!fs.existsSync(a)){console.warn('Modell fehlt:',f);continue}const b=path.join(dest,'models',f);fs.mkdirSync(path.dirname(b),{recursive:true});fs.copyFileSync(a,b)}
  console.log('Modelle:',used.size)}
console.log('Spiel kopiert nach',dest);
