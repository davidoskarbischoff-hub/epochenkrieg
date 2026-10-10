/* Brücke zwischen Spiel und App: nur wenige, feste Funktionen (kein Zugriff auf Node im Spiel). */
const {contextBridge,ipcRenderer}=require('electron');
const info=ipcRenderer.sendSync('ek-app-info');
contextBridge.exposeInMainWorld('EK_APP',{
  isApp:true,version:info.version,platform:info.platform,webUrl:info.webUrl,
  checkForUpdates:()=>ipcRenderer.invoke('ek-check-updates'),
  toggleFullscreen:()=>ipcRenderer.invoke('ek-fullscreen')
});
