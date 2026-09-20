if (!window.forge) {
  document.body.innerHTML = '<div style="font-family:Segoe UI,Arial;padding:40px;color:white;background:#090b12;height:100vh"><h1>ForgeMind could not start its desktop bridge</h1><p>The Electron preload bridge is missing or failed to load. Reinstall/restart ForgeMind v0.7.</p></div>';
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
  $("provider").value=S.ai.provider||""; $("baseUrl").value=S.ai.baseUrl||""; $("model").value=S.ai.model||"";
  $("email").value=S.identity.email||""; $("displayName").value=S.identity.displayName||""; $("robloxUserId").value=S.identity.robloxUserId||"";
  $("keyStatus").textContent=S.hasApiKey ? "API key is securely stored." : "No API key saved.";
  document.querySelectorAll("[data-perm]").forEach(x=>x.checked=!!S.permissions[x.dataset.perm]);
  $("bridgeStatus").textContent="Bridge: 127.0.0.1:"+S.bridgePort;
}
async function savePerm(key, value) {
  S.permissions[key]=value;
  await window.forge.setState({permissions:S.permissions});
}
document.querySelectorAll("[data-perm]").forEach(x=>x.onchange=()=>savePerm(x.dataset.perm,x.checked));

$("saveAI").onclick=async()=>{
  await window.forge.setState({ai:{provider:$("provider").value,baseUrl:$("baseUrl").value,model:$("model").value}});
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
  try { const r=await window.forge.chat([{role:"system",content:"You are ForgeMind AI. Help with coding, game development, 3D workflows, Roblox Studio and Blender. Be precise. If proposing an integration action, describe it clearly and do not assume permission."},{role:"user",content:t}]); addChat(r,"ai"); }
  catch(e){addChat("Error: "+e.message,"ai")}
};
$("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter"&&e.ctrlKey)$("sendChat").click()});

$("forgeAsset").onclick=()=>{
  const p=$("assetPrompt").value.trim()||"Untitled asset";
  $("assetTitle").textContent=p.slice(0,80);
  $("assetMeta").textContent=`${$("assetType").value} • ${$("assetPlatform").value} • ${$("assetStyle").value} • ${$("assetQuality").value}`;
  $("assetTags").innerHTML=["Prompted","Reference-aware","Game-ready workflow",$("assetPlatform").value].map(x=>`<span class="tag">${x}</span>`).join("");
};
$("sendAssetAI").onclick=()=>{go("ai");$("chatInput").value=`Refine this asset brief: ${$("assetPrompt").value||"Create a game-ready asset"}`;$("sendChat").click()};

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
