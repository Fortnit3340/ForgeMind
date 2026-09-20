
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("forge", {
  getState: () => ipcRenderer.invoke("state:get"),
  setState: (patch) => ipcRenderer.invoke("state:set", patch),

  setApiKey: (key) => ipcRenderer.invoke("secret:set", key),
  clearApiKey: () => ipcRenderer.invoke("secret:clear"),

  chat: (messages) => ipcRenderer.invoke("ai:chat", messages),

  bridgeCommand: (command) => ipcRenderer.invoke("bridge:command", command),

  chooseFolder: () => ipcRenderer.invoke("dialog:folder"),
  chooseFile: () => ipcRenderer.invoke("dialog:file"),
  readFile: (filePath) => ipcRenderer.invoke("file:read", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("file:write", filePath, content),
  listFiles: (dir) => ipcRenderer.invoke("file:list", dir),

  openExternal: (url) => ipcRenderer.invoke("external:open", url),

  onBridgeResult: (fn) =>
    ipcRenderer.on("bridge-result", (_, value) => fn(value)),

  onBridgeStatus: (fn) =>
    ipcRenderer.on("bridge-status", (_, value) => fn(value))
});
