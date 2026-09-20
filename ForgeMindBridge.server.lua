
-- ForgeMind AI v0.6 Roblox Studio bridge
-- Put this into a local Studio plugin/test environment.
-- It polls ONLY 127.0.0.1 and only performs allowlisted commands.
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local BASE = "http://127.0.0.1:32145"
local busy = false

local function postResult(value)
    pcall(function()
        HttpService:PostAsync(BASE.."/roblox/result", HttpService:JSONEncode(value),
            Enum.HttpContentType.ApplicationJson, false)
    end)
end

local function handle(cmd)
    if cmd.type == "none" then return end
    if cmd.type == "ping" then
        postResult({ok=true,type="ping",studio=true})
        return
    end
    if cmd.type == "create_part" then
        local p = Instance.new("Part")
        p.Name = cmd.name or "ForgeMindPart"
        local s = cmd.size or {4,2,4}
        p.Size = Vector3.new(s[1],s[2],s[3])
        local q = cmd.position or {0,5,0}
        p.Position = Vector3.new(q[1],q[2],q[3])
        p.Anchored = cmd.anchored ~= false
        p.Parent = workspace
        postResult({ok=true,type="create_part",name=p.Name})
        return
    end
    if cmd.type == "create_script" then
        local parent = workspace
        local obj = Instance.new(cmd.className == "LocalScript" and "LocalScript" or "Script")
        obj.Name = cmd.name or "ForgeMindScript"
        obj.Source = cmd.source or "-- ForgeMind"
        obj.Parent = parent
        postResult({ok=true,type="create_script",name=obj.Name})
        return
    end
    postResult({ok=false,error="Command not allowed by bridge: "..tostring(cmd.type)})
end

task.spawn(function()
    while true do
        task.wait(0.7)
        if busy then continue end
        busy = true
        local ok, response = pcall(function()
            return HttpService:GetAsync(BASE.."/roblox/poll")
        end)
        if ok then
            local parsedOk, cmd = pcall(function() return HttpService:JSONDecode(response) end)
            if parsedOk then handle(cmd) end
        end
        busy = false
    end
end)
