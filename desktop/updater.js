/* Auto-Update über GitHub Releases dieses öffentlichen Repositorys (kein Schlüssel nötig).
   Ablauf: prüfen → „Neue Version verfügbar“ → nach Bestätigung laden → nach Bestätigung installieren und neu starten.
   Windows: vollautomatisch. Mac (ohne Apple-Signatur): nur Hinweis + Link zur Download-Seite (Auto-Installation ist dort ohne bezahltes Zertifikat nicht möglich). */
const {app,dialog,shell}=require('electron');
const fs=require('fs'),path=require('path');
const pkg=require('./package.json');
const RELEASES_URL=`https://github.com/${(pkg.build&&pkg.build.publish&&pkg.build.publish[0].owner)||''}/${(pkg.build&&pkg.build.publish&&pkg.build.publish[0].repo)||''}/releases/latest`;

function init(getWin){
  let autoUpdater=null,manual=false,busy=false;
  const logFile=()=>path.join(app.getPath('userData'),'update.log');
  const log=m=>{const l=new Date().toISOString()+' '+m;try{console.log(l);fs.appendFileSync(logFile(),l+'\n')}catch(_){}};
  const box=opts=>{const w=getWin();return w?dialog.showMessageBox(w,opts):dialog.showMessageBox(opts)};
  const mac=process.platform==='darwin';

  async function check(isManual){
    manual=!!isManual;
    if(!app.isPackaged){if(manual)box({type:'info',title:'Updates',message:'Updates gibt es nur in der installierten App.',buttons:['OK']});return 'dev'}
    if(busy)return 'busy';
    try{
      if(!autoUpdater)setup();
      busy=true;log('Suche nach Updates (aktuell '+app.getVersion()+')');
      await autoUpdater.checkForUpdates();
    }catch(e){busy=false;log('Fehler bei der Suche: '+e.message);if(manual)box({type:'warning',title:'Updates',message:'Die Suche nach Updates hat nicht geklappt.',detail:'Bist du online? ('+e.message.slice(0,120)+')',buttons:['OK']})}
    return 'ok'}

  function setup(){
    ({autoUpdater}=require('electron-updater'));
    autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;autoUpdater.allowPrerelease=false;autoUpdater.logger={info:log,warn:log,error:log,debug:()=>{}};
    autoUpdater.on('update-not-available',()=>{busy=false;log('Kein Update');if(manual)box({type:'info',title:'Updates',message:'Du hast die neueste Version ('+app.getVersion()+').',buttons:['OK']})});
    autoUpdater.on('error',e=>{busy=false;log('Fehler: '+(e&&e.message));const w=getWin();if(w)w.setProgressBar(-1);if(manual)box({type:'warning',title:'Updates',message:'Das Update hat nicht geklappt.',detail:String(e&&e.message).slice(0,160),buttons:['OK']})});
    autoUpdater.on('update-available',async info=>{
      busy=false;log('Neue Version '+info.version);
      const notes=typeof info.releaseNotes==='string'?info.releaseNotes.replace(/<[^>]+>/g,'').trim().slice(0,400):'';
      const r=await box({type:'info',title:'Neue Version verfügbar',message:'Neue Version verfügbar: '+info.version,detail:'Du hast Version '+app.getVersion()+'.'+(notes?'\n\n'+notes:'')+(mac?'\n\nAuf dem Mac öffnet sich die Download-Seite.':'\n\nJetzt herunterladen?'),buttons:[mac?'Download-Seite öffnen':'Herunterladen','Später'],defaultId:0,cancelId:1});
      if(r.response!==0)return;
      if(mac){shell.openExternal(RELEASES_URL);return}
      busy=true;const w=getWin();if(w)w.setTitle('Epochenkrieg – Update wird geladen …');
      try{await autoUpdater.downloadUpdate()}catch(e){busy=false;log('Download-Fehler: '+e.message);if(w){w.setProgressBar(-1);w.setTitle('Epochenkrieg')}box({type:'warning',title:'Updates',message:'Das Herunterladen hat nicht geklappt.',detail:String(e.message).slice(0,160),buttons:['OK']})}});
    autoUpdater.on('download-progress',p=>{const w=getWin();if(w){w.setProgressBar(p.percent/100);w.setTitle('Epochenkrieg – Update '+Math.round(p.percent)+' %')}});
    autoUpdater.on('update-downloaded',async info=>{
      busy=false;log('Update geladen: '+info.version);const w=getWin();if(w){w.setProgressBar(-1);w.setTitle('Epochenkrieg')}
      autoUpdater.autoInstallOnAppQuit=true;
      const r=await box({type:'question',title:'Update bereit',message:'Version '+info.version+' ist bereit.',detail:'Jetzt installieren? Das Spiel startet danach neu. Laufende Partien gehen verloren.',buttons:['Jetzt installieren und neu starten','Beim nächsten Beenden installieren'],defaultId:0,cancelId:1});
      if(r.response===0)autoUpdater.quitAndInstall(false,true)})}
  return{check}
}
module.exports={init};
