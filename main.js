const {app,BrowserWindow,ipcMain,dialog,shell} = require('electron');
const path=require('path'), fs=require('fs');
function createWindow(){const w=new BrowserWindow({width:1400,height:900,minWidth:1100,minHeight:700,backgroundColor:'#080b12',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});w.loadFile(path.join(__dirname,'index.html'));}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>BrowserWindow.getAllWindows().length||createWindow());});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
ipcMain.handle('pick-folder',async()=>{const r=await dialog.showOpenDialog({properties:['openDirectory']});return r.canceled?null:r.filePaths[0]});
ipcMain.handle('read-file',async(_,p)=>{try{return fs.readFileSync(p,'utf8')}catch(e){return null}});
ipcMain.handle('write-file',async(_,p,c)=>{try{fs.writeFileSync(p,c,'utf8');return true}catch(e){return false}});
ipcMain.handle('list-files',async(_,dir)=>{try{return fs.readdirSync(dir,{withFileTypes:true}).map(x=>({name:x.name,dir:x.isDirectory()})).filter(x=>!x.name.startsWith('.'))}catch(e){return []}});
ipcMain.handle('open-external',async(_,url)=>{if(/^https?:\/\//.test(url))await shell.openExternal(url)});
