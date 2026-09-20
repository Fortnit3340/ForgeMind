
bl_info = {
    "name": "ForgeMind AI Bridge",
    "author": "ForgeMind",
    "version": (0, 6, 0),
    "blender": (3, 0, 0),
    "category": "3D View",
}

import bpy, json, urllib.request, urllib.error
from mathutils import Vector

BASE = "http://127.0.0.1:32145"
_enabled = True

def post(value):
    try:
        req = urllib.request.Request(
            BASE + "/blender/result",
            data=json.dumps(value).encode("utf-8"),
            headers={"Content-Type":"application/json"},
            method="POST",
        )
        urllib.request.urlopen(req, timeout=1).read()
    except Exception:
        pass

def handle(cmd):
    t = cmd.get("type")
    if t == "none": return
    if t == "ping":
        post({"ok": True, "type":"ping", "blender": bpy.app.version_string})
        return
    if t == "create_cube":
        name = cmd.get("name","ForgeMind_Cube")
        bpy.ops.mesh.primitive_cube_add(location=cmd.get("location",[0,0,0]))
        obj = bpy.context.object
        obj.name = name
        obj.scale = cmd.get("scale",[1,1,1])
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        post({"ok":True,"type":"create_cube","name":obj.name})
        return
    if t == "create_uv_sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(location=cmd.get("location",[0,0,0]))
        obj=bpy.context.object
        obj.name=cmd.get("name","ForgeMind_Sphere")
        post({"ok":True,"type":"create_uv_sphere","name":obj.name})
        return
    if t == "set_object_transform":
        obj=bpy.data.objects.get(cmd.get("name",""))
        if not obj:
            post({"ok":False,"error":"Object not found"}); return
        if "location" in cmd: obj.location = Vector(cmd["location"])
        if "rotation" in cmd: obj.rotation_euler = cmd["rotation"]
        if "scale" in cmd: obj.scale = cmd["scale"]
        post({"ok":True,"type":"set_object_transform","name":obj.name})
        return
    post({"ok":False,"error":"Command not allowed by bridge: "+str(t)})

def poll():
    if not _enabled:
        return 1.0
    try:
        with urllib.request.urlopen(BASE + "/blender/poll", timeout=0.7) as r:
            cmd=json.loads(r.read().decode("utf-8"))
            handle(cmd)
    except Exception:
        pass
    return 0.8

def register():
    bpy.app.timers.register(poll, first_interval=1.0, persistent=True)

def unregister():
    global _enabled
    _enabled=False
