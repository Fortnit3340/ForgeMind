const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('forge',{pickFolder:()=>ipcRenderer.invoke('pick-folder'),readFile:p=>ipcRenderer.invoke('read-file',p),writeFile:(p,c)=>ipcRenderer.invoke('write-file',p,c),listFiles:p=>ipcRenderer.invoke('list-files',p),openExternal:u=>ipcRenderer.invoke('open-external',u)});
