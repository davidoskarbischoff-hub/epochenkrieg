/* Kopiert das Spiel (index.html, css/, js/) unverändert in desktop/game, damit die App es mitnimmt. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..','..'),dest=path.join(__dirname,'..','game');
fs.rmSync(dest,{recursive:true,force:true});fs.mkdirSync(dest,{recursive:true});
for(const n of['index.html','css','js','models']){const s=path.join(root,n);if(!fs.existsSync(s)){if(n==='models')continue;console.error('Fehlt:',s);process.exit(1)}fs.cpSync(s,path.join(dest,n),{recursive:true})}
console.log('Spiel kopiert nach',dest);
