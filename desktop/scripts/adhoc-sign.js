/* Mac: App mit einer einfachen Eigen-Signatur („ad hoc“) versehen. Kostet nichts und ersetzt kein Apple-Zertifikat, aber macOS zeigt dann
   meist „Trotzdem öffnen“ in den Einstellungen statt der Meldung „ist beschädigt“. Schlägt der Schritt fehl, wird trotzdem weitergebaut. */
const path=require('path'),{execFileSync}=require('child_process');
exports.default=async function(ctx){
  if(ctx.electronPlatformName!=='darwin')return;
  const app=path.join(ctx.appOutDir,ctx.packager.appInfo.productFilename+'.app');
  try{execFileSync('codesign',['--force','--deep','--sign','-',app],{stdio:'inherit'});console.log('Ad-hoc-Signatur gesetzt:',app)}
  catch(e){console.warn('Ad-hoc-Signatur nicht möglich (wird übersprungen):',e.message)}
};
