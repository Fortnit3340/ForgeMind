if (!window.forge) {
  document.body.innerHTML = '<div style="font-family:Segoe UI,Arial;padding:40px;color:white;background:#090b12;height:100vh"><h1>ForgeMind must be opened as a desktop app</h1><p>Do not open <b>src/index.html</b> directly in Chrome/Edge. Double-click <b>START-FORGEMIND-WINDOWS.bat</b> from the ForgeMind folder.</p><p>The launcher checks and repairs Electron before starting the app.</p></div>';
  throw new Error("ForgeMind preload bridge unavailable");
}

let S;
let currentFile = "";
const $ = id => document.getElementById(id);
const pages = ["home","forge","ai","code","roblox","blender","projects","account","settings"];

function go(page) {
  pages.forEach(p => $("page-"+p).classList.toggle("hidden", p !== page));
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("active", b.dataset.page===page));
  $("crumb").textContent = page[0].toUpperCase()+page.slice(1);
}
document.querySelectorAll("[data-page]").forEach(b => b.onclick=()=>go(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b => b.onclick=()=>go(b.dataset.go));

async function refresh() {
  S = await window.forge.getState();
  $("homeKey").textContent = "AI key: " + (S.hasApiKey ? "connected" : "not connected");
  $("homeEmail").textContent = "Email identity: " + (S.identity.email || "not set");
  $("homeRoblox").textContent = "Roblox identity: " + (S.identity.robloxUserId || "not set");
  $("engine").value=S.ai.engine||"lemonade"; $("provider").value=S.ai.provider||"Lemonade"; $("baseUrl").value=S.ai.baseUrl||(S.ai.engine==="lemonade"?"http://127.0.0.1:13305/v1":""); $("model").value=S.ai.model||"";
  $("email").value=S.identity.email||""; $("displayName").value=S.identity.displayName||""; $("robloxUserId").value=S.identity.robloxUserId||"";
  $("keyStatus").textContent=S.hasApiKey ? "API key is securely stored." : "No API key saved.";
  document.querySelectorAll("[data-perm]").forEach(x=>x.checked=!!S.permissions[x.dataset.perm]);
  $("bridgeStatus").textContent="Bridge: 127.0.0.1:"+S.bridgePort;
}
async function detectLemonade() {
  if (!window.forge.getModels) {
    $("modelStatus").textContent = "Model detection is unavailable in this build.";
    return;
  }
  $("modelStatus").textContent = "Checking Lemonade…";
  const res = await window.forge.getModels();
  if (!res.ok) {
    $("modelStatus").textContent = "Lemonade not reachable: " + res.error;
    return;
  }
  const models = (res.models || []).map(x => x.id || x.name).filter(Boolean);
  $("modelStatus").textContent = models.length
    ? "Detected: " + models.join(", ")
    : "Lemonade is reachable, but no model is downloaded.";
  if (!$("model").value && models[0]) $("model").value = models[0];
}
$("detectModels").onclick = async()=>{ await detectLemonade(); };

async function savePerm(key, value) {
  S.permissions[key]=value;
  await window.forge.setState({permissions:S.permissions});
}
document.querySelectorAll("[data-perm]").forEach(x=>x.onchange=()=>savePerm(x.dataset.perm,x.checked));

$("saveAI").onclick=async()=>{
  await window.forge.setState({ai:{engine:$("engine").value,provider:$("provider").value,baseUrl:$("baseUrl").value,model:$("model").value}});
  if($("apiKey").value.trim()) await window.forge.setApiKey($("apiKey").value.trim());
  $("apiKey").value=""; await refresh();
};
$("clearKey").onclick=async()=>{await window.forge.clearApiKey();await refresh()};
$("saveIdentity").onclick=async()=>{await window.forge.setState({identity:{...S.identity,email:$("email").value.trim(),displayName:$("displayName").value.trim()}});await refresh()};
$("saveRoblox").onclick=async()=>{await window.forge.setState({identity:{...S.identity,robloxUserId:$("robloxUserId").value.trim()}});await refresh()};

function addChat(text, who){const d=document.createElement("div");d.className="msg "+who;d.textContent=text;$("chat").appendChild(d);$("chat").scrollTop=$("chat").scrollHeight}
$("sendChat").onclick=async()=>{
  const t=$("chatInput").value.trim(); if(!t)return;
  $("chatInput").value=""; addChat(t,"user");
  try {
    const engine = S?.ai?.engine || "lemonade";
    const instructions = "You are ForgeMind AI. Work prompt-first: turn the user's goal into a concrete build plan, code, files, and exact next actions. Help with coding, game development, 3D workflows, Roblox Studio and Blender. Never claim an action was executed unless the local bridge reports a result. Respect enabled permissions.";
    const r=await window.forge.chat([
      {role:"system",content:instructions},
      {role:"user",content:t}
    ]);
    addChat(r,"ai");
    const badgeText = engine==="lemonade" ? "Lemonade • local" : "Cloud API • your key";
    $("aiEngineBadge").textContent = badgeText;
    if ($("aiEngineBadge2")) $("aiEngineBadge2").textContent = badgeText;
  } catch(e){addChat("Error: "+e.message,"ai")}
};
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.ctrlKey)$("sendChat").click()});

async function bridge(target, command, permission="action") {
  try { await window.forge.bridgeCommand({target,permission,...command}); logBridge(target,JSON.stringify(command)); }
  catch(e){ logBridge(target,"Blocked: "+e.message,true); }
}
function logBridge(target,text,bad=false){const id=target==="roblox"?"robloxLog":"blenderLog";const d=document.createElement("div");d.className="row";d.innerHTML=`<span>${text}</span><span class="small">${bad?"blocked":"queued"}</span>`;$(id).prepend(d)}
$("robloxPing").onclick=()=>bridge("roblox",{type:"ping"}, "action");
$("robloxPart").onclick=()=>bridge("roblox",{type:"create_part",name:"ForgeMind_TestPart",size:[4,2,4],position:[0,5,0],anchored:true},"action");
$("blenderPing").onclick=()=>bridge("blender",{type:"ping"},"action");
$("blenderCube").onclick=()=>bridge("blender",{type:"create_cube",name:"ForgeMind_TestCube",location:[0,0,0],scale:[1,1,1]},"action");

$("chooseFile").onclick=async()=>{const p=await window.forge.chooseFile();if(!p)return;currentFile=p;$("filePath").textContent=p;$("editor").value=await window.forge.readFile(p)};
$("saveFile").onclick=async()=>{if(!currentFile)return alert("Open a file first.");await window.forge.writeFile(currentFile,$("editor").value);$("filePath").textContent=currentFile+" • saved"};
$("askCode").onclick=()=>{go("ai");$("chatInput").value="Review or improve this code:\n\n"+$("editor").value.slice(0,12000);$("sendChat").click()};
$("chooseProject").onclick=async()=>{const p=await window.forge.chooseFolder();if(p){$("projectPath").textContent=p;loadFiles(p)}};
$("projectFolder").onclick=async()=>{const p=await window.forge.chooseFolder();if(p){$("projectPath").textContent=p;loadFiles(p)}};
async function loadFiles(p){const list=await window.forge.listFiles(p);$("fileList").innerHTML="";list.slice(0,300).forEach(f=>{const d=document.createElement("div");d.className="row";d.innerHTML=`<span>${f.isDir?"📁":"📄"} ${f.name}</span><button class="btn small">Open</button>`;if(!f.isDir)d.querySelector("button").onclick=()=>{currentFile=f.path;$("filePath").textContent=f.path;window.forge.readFile(f.path).then(v=>$("editor").value=v);go("code")};$("fileList").appendChild(d)})}
window.forge.onBridgeResult(v=>logBridge(v.target,JSON.stringify(v.value)));

refresh();

$("aiQuickBuild")?.addEventListener("click",()=>{
  go("ai");
  $("chatInput").value=$("homePrompt")?.value.trim() || "Build a small game from a prompt. Ask me only for the minimum missing details, then give me a concrete project plan and the first files to create.";
  $("sendChat").click();
});
$("aiQuickCode")?.addEventListener("click",()=>{
  go("ai");
  $("chatInput").value="Create the starter code for a small desktop game and explain the file structure.";
  $("sendChat").click();
});
window.forge.onStartupError?.(v=>{
  addChat?.("Electron failed to load the app page ("+v.errorCode+"): "+v.errorDescription,"ai");
});
