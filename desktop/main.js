/* Epochenkrieg – Desktop-App (Electron). Zeigt das Spiel unverändert an, ohne Server (eigenes Protokoll app://), mit Vollbild (F11 / Alt+Enter),
   ohne Drosselung im Hintergrund und mit Auto-Update (updater.js). */
const {app,BrowserWindow,protocol,Menu,shell,ipcMain,dialog}=require('electron');
const path=require('path'),fs=require('fs');
const pkg=require('./package.json');
const SMOKE=process.argv.includes('--smoke');

/* Kein Drosseln im Hintergrund, Ton ohne vorherigen Klick erlaubt */
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
if(SMOKE){app.commandLine.appendSwitch('use-gl','angle');app.commandLine.appendSwitch('use-angle','swiftshader');app.commandLine.appendSwitch('enable-unsafe-swiftshader');app.commandLine.appendSwitch('no-sandbox')}

protocol.registerSchemesAsPrivileged([{scheme:'app',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);

const GAME_DIR=path.join(__dirname,'game');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.ico':'image/x-icon','.woff2':'font/woff2','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
const stateFile=()=>path.join(app.getPath('userData'),'window.json');
function loadState(){try{return JSON.parse(fs.readFileSync(stateFile(),'utf8'))}catch(_){return{}}}
function saveState(win){try{const b=win.getNormalBounds();fs.writeFileSync(stateFile(),JSON.stringify({...b,max:win.isMaximized(),full:win.isFullScreen()}))}catch(_){}}

if(!app.requestSingleInstanceLock()){app.quit()}
let win=null,updater=null;
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus()}});

ipcMain.on('ek-app-info',e=>{e.returnValue={version:app.getVersion(),platform:process.platform,webUrl:pkg.webUrl||''}});
ipcMain.handle('ek-fullscreen',()=>{if(win)win.setFullScreen(!win.isFullScreen())});
ipcMain.handle('ek-check-updates',()=>updater?updater.check(true):null);

function createWindow(){
  const st=loadState();
  win=new BrowserWindow({width:st.width||1360,height:st.height||820,x:st.x,y:st.y,minWidth:900,minHeight:600,backgroundColor:'#101114',title:'Epochenkrieg',show:false,autoHideMenuBar:true,
    icon:path.join(__dirname,'build','icon.png'),
    webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,spellcheck:false}});
  Menu.setApplicationMenu(null);
  if(st.max)win.maximize();if(st.full)win.setFullScreen(true);
  win.once('ready-to-show',()=>win.show());
  win.on('close',()=>saveState(win));
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return{action:'deny'}});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('app://')){e.preventDefault();if(/^https?:/.test(url))shell.openExternal(url)}});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type!=='keyDown')return;
    if(i.key==='F11'||(i.alt&&i.key==='Enter')){win.setFullScreen(!win.isFullScreen());e.preventDefault()}
    else if(i.key==='Escape'&&win.isFullScreen()&&false){win.setFullScreen(false)}});
  /* Kamera/Mikrofon u. ä. werden nicht gebraucht; Zwischenablage und Vollbild sind erlaubt */
  win.webContents.session.setPermissionRequestHandler((wc,perm,cb)=>cb(['fullscreen','clipboard-sanitized-write','clipboard-read'].includes(perm)));
  win.loadURL('app://epochenkrieg/index.html');
  return win}

app.whenReady().then(()=>{
  protocol.handle('app',req=>{
    try{const u=new URL(req.url);let p=decodeURIComponent(u.pathname);if(p==='/'||p==='')p='/index.html';
      const full=path.normalize(path.join(GAME_DIR,p));if(!full.startsWith(GAME_DIR))return new Response('Nicht erlaubt',{status:403});
      const data=fs.readFileSync(full);return new Response(data,{headers:{'content-type':MIME[path.extname(full).toLowerCase()]||'application/octet-stream','cache-control':'no-cache'}})}
    catch(_){return new Response('Nicht gefunden',{status:404})}});
  createWindow();
  try{updater=require('./updater').init(()=>win)}catch(e){console.error('Updater nicht verfügbar:',e.message)}
  if(SMOKE)runSmoke();
  else if(updater)setTimeout(()=>updater.check(false),5000);
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

/* Selbsttest (npm run smoke): Spiel laden, kurz warten, Zustand + Bild ausgeben, beenden */
function runSmoke(){
  const out=process.argv.find(a=>a.startsWith('--shot='));const errs=[];
  win.webContents.on('console-message',(e,lvl,msg)=>{if(lvl>=3)errs.push(msg.slice(0,160))});
  win.webContents.on('did-finish-load',()=>setTimeout(async()=>{
    try{await win.webContents.executeJavaScript("document.getElementById('goBtn')&&document.getElementById('goBtn').click()");
      await new Promise(r=>setTimeout(r,2500));
      const r=await win.webContents.executeJavaScript("JSON.stringify({game:typeof G!=='undefined'&&!!G&&G.running,ents:typeof G!=='undefined'?G.ents.length:0,app:window.EK_APP,ua:navigator.userAgent.slice(0,60),bgthrottle:true})");
      console.log('SMOKE',r,'ERRORS',JSON.stringify(errs));
      if(out){const img=await win.webContents.capturePage();fs.writeFileSync(out.slice(7),img.toPNG())}
    }catch(e){console.log('SMOKE-FEHLER',e.message)}
    app.exit(0)},2500));
}
