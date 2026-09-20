
const { app, BrowserWindow, ipcMain, dialog, safeStorage, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

let win;
let server;

const PORT = 32145;
const queues = { roblox: [], blender: [] };

const state = {
  permissions: {
    robloxRead:false, robloxWrite:false, robloxActions:false,
    blenderRead:false, blenderWrite:false, blenderActions:false
  },
  identity: { email:"", robloxUserId:"", displayName:"" },
  ai: { provider:"Lemonade", baseUrl:"http://127.0.0.1:13305/v1", model:"" }
};

function dataDir(){ return path.join(app.getPath("userData"), "forgemind"); }
function statePath(){ return path.join(dataDir(), "state.json"); }
function secretPath(){ return path.join(dataDir(), "api-key.bin"); }

function ensureDir(){ fs.mkdirSync(dataDir(), {recursive:true}); }

function loadState(){
  ensureDir();
  try {
    const saved = JSON.parse(fs.readFileSync(statePath(),"utf8"));
    if (saved.permissions) state.permissions = {...state.permissions, ...saved.permissions};
    if (saved.identity) state.identity = {...state.identity, ...saved.identity};
    if (saved.ai) state.ai = {...state.ai, ...saved.ai};
  } catch {}
}

function saveState(){
  ensureDir();
  fs.writeFileSync(statePath(), JSON.stringify(state,null,2), "utf8");
}

function saveApiKey(key){
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("OS secure storage is unavailable on this computer.");
  }
  ensureDir();
  fs.writeFileSync(secretPath(), safeStorage.encryptString(key));
}

function getApiKey(){
  try {
    if (!fs.existsSync(secretPath())) return "";
    if (!safeStorage.isEncryptionAvailable()) return "";
    return safeStorage.decryptString(fs.readFileSync(secretPath()));
  } catch { return ""; }
}

function send(channel, value){
  if (win && !win.isDestroyed()) win.webContents.send(channel, value);
}

function reply(res, status, data){
  const out = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type":"application/json",
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Content-Type",
    "Access-Control-Allow-Methods":"GET,POST,OPTIONS"
  });
  res.end(out);
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    let raw="";
    req.on("data", chunk => raw += chunk);
    req.on("end", ()=>{
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch(e){ reject(e); }
    });
    req.on("error", reject);
  });
}

function permitted(target, kind){
  return !!state.permissions[`${target}${kind[0].toUpperCase()}${kind.slice(1)}`];
}

function startBridge(){
  server = http.createServer(async (req,res)=>{
    try {
      if (req.method === "OPTIONS") return reply(res,200,{ok:true});
      const url = new URL(req.url, `http://127.0.0.1:${PORT}`);

      if (url.pathname === "/health")
        return reply(res,200,{ok:true,name:"ForgeMind AI",version:"0.7.0",port:PORT});

      if (url.pathname === "/roblox/poll") {
        if (!permitted("roblox","read")) return reply(res,403,{ok:false,error:"Roblox read permission disabled"});
        return reply(res,200,queues.roblox.shift() || {type:"none"});
      }

      if (url.pathname === "/blender/poll") {
        if (!permitted("blender","read")) return reply(res,403,{ok:false,error:"Blender read permission disabled"});
        return reply(res,200,queues.blender.shift() || {type:"none"});
      }

      if (url.pathname === "/roblox/result" && req.method === "POST") {
        const value = await readBody(req);
        send("bridge-result",{target:"roblox",value});
        return reply(res,200,{ok:true});
      }

      if (url.pathname === "/blender/result" && req.method === "POST") {
        const value = await readBody(req);
        send("bridge-result",{target:"blender",value});
        return reply(res,200,{ok:true});
      }

      if (url.pathname === "/command" && req.method === "POST") {
        const command = await readBody(req);
        const target = command.target;
        const kind = command.permission || "action";
        if (!["roblox","blender"].includes(target))
          return reply(res,400,{ok:false,error:"Invalid target"});
        if (!permitted(target,kind))
          return reply(res,403,{ok:false,error:`${target} ${kind} permission disabled`});
        queues[target].push({
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
          ...command
        });
        return reply(res,200,{ok:true});
      }

      return reply(res,404,{ok:false,error:"Not found"});
    } catch(e) {
      return reply(res,500,{ok:false,error:e.message});
    }
  });

  server.on("error", err => {
    send("bridge-status",{ok:false,error:err.message});
  });

  server.listen(PORT,"127.0.0.1",()=>{
    send("bridge-status",{ok:true,port:PORT});
  });
}

async function chat(messages){
  const key = getApiKey();
  if (!key) throw new Error("No API key saved. Open Settings and add your own API key.");
  const base = (state.ai.baseUrl || "").trim().replace(/\/+$/,"");
  const model = (state.ai.model || "").trim();
  if (!base) throw new Error("AI Base URL is not set. Open Settings.");
  if (!model) throw new Error("AI model is not set. Open Settings.");

  const endpoint = base.endsWith("/chat/completions")
    ? base
    : `${base}/chat/completions`;

  const response = await fetch(endpoint,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${key}`
    },
    body:JSON.stringify({model,messages,temperature:0.7,stream:false})
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`AI provider ${response.status}: ${text.slice(0,500)}`);

  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error("AI provider returned invalid JSON."); }

  return data?.choices?.[0]?.message?.content ?? JSON.stringify(data);
}

function createWindow(){
  win = new BrowserWindow({
    width:1440,
    height:920,
    minWidth:1100,
    minHeight:700,
    backgroundColor:"#090b12",
    webPreferences:{
      preload:path.join(__dirname,"preload.js"),
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:false
    }
  });

  win.loadFile(path.join(__dirname,"index.html"));
}

app.whenReady().then(()=>{
  loadState();
  startBridge();
  createWindow();
});

app.on("window-all-closed",()=>{
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("activate",()=>{
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("state:get",()=>({
  ...state,
  hasApiKey:!!getApiKey(),
  bridgePort:PORT
}));

ipcMain.handle("state:set",(_,patch)=>{
  if (patch.permissions) state.permissions = {...state.permissions,...patch.permissions};
  if (patch.identity) state.identity = {...state.identity,...patch.identity};
  if (patch.ai) state.ai = {...state.ai,...patch.ai};
  saveState();
  return {...state,hasApiKey:!!getApiKey(),bridgePort:PORT};
});

ipcMain.handle("secret:set",(_,key)=>{
  if (!String(key||"").trim()) throw new Error("API key cannot be empty.");
  saveApiKey(String(key).trim());
  return true;
});

ipcMain.handle("secret:clear",()=>{
  try { fs.rmSync(secretPath()); } catch {}
  return true;
});

ipcMain.handle("ai:chat",(_,messages,model)=>{ if(model) state.ai.model=model; return chat(messages); });
ipcMain.handle("ai:models", async (_, baseUrl)=>{
  const base=String(baseUrl||"").trim().replace(/\/+$/,"");
  if(!base) throw new Error("AI Base URL is not set.");
  const url=base.endsWith("/v1") ? `${base}/models` : `${base}/models`;
  const key=getApiKey();
  const headers={};
  if(key) headers.Authorization=`Bearer ${key}`;
  const r=await fetch(url,{headers});
  const text=await r.text();
  if(!r.ok) throw new Error(`Model discovery ${r.status}: ${text.slice(0,300)}`);
  try{return JSON.parse(text);}catch{throw new Error("Model discovery returned invalid JSON.");}
});


ipcMain.handle("bridge:command",(_,command)=>{
  const target=command.target;
  const kind=command.permission || "action";
  if (!["roblox","blender"].includes(target)) throw new Error("Invalid bridge target.");
  if (!permitted(target,kind)) throw new Error(`${target} ${kind} permission is disabled.`);
  queues[target].push({
    id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    ...command
  });
  return {ok:true};
});

ipcMain.handle("dialog:folder",async()=>{
  const r=await dialog.showOpenDialog({properties:["openDirectory"]});
  return r.canceled ? "" : r.filePaths[0];
});

ipcMain.handle("dialog:file",async()=>{
  const r=await dialog.showOpenDialog({properties:["openFile"]});
  return r.canceled ? "" : r.filePaths[0];
});

ipcMain.handle("file:read",(_,filePath)=>{
  return fs.readFileSync(filePath,"utf8");
});

ipcMain.handle("file:write",(_,filePath,content)=>{
  fs.writeFileSync(filePath,content,"utf8");
  return true;
});

ipcMain.handle("file:list",(_,dir)=>{
  return fs.readdirSync(dir,{withFileTypes:true})
    .map(x=>({name:x.name,isDir:x.isDirectory(),path:path.join(dir,x.name)}))
    .sort((a,b)=>(b.isDir-a.isDir)||a.name.localeCompare(b.name));
});

ipcMain.handle("external:open",(_,url)=>shell.openExternal(url));
