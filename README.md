# ForgeMind AI v0.2

ForgeMind AI is a desktop-first AI development workstation for coding, game development and 3D workflows.

## Working in this build
- Functional Electron desktop shell
- Project folder selection
- File tree with folder navigation
- Open/read/save files
- Create files and folders
- Keyboard save shortcut
- Functional persistent permission switches
- Separate Roblox Studio and Blender permission controls
- Action approval controls
- Keyless cloud-ready AI workspace UI
- GitHub-ready source

## Cloud / no API keys
The desktop client does not ask users for a personal AI API key. A hosted AI still needs a server-side inference service; this repository is structured so a ForgeMind Cloud gateway can be connected later without exposing provider credentials in the desktop client.

## Important integration note
The Roblox and Blender switches are permission state, not the completed application bridges. Real communication requires a local bridge/plugin running in Roblox Studio or Blender. The next integration layer should authenticate the bridge to this desktop app and expose narrowly scoped actions.

## Run
1. Install Node.js LTS.
2. Run `npm install`.
3. Run `npm start`.

## Build
Run `npm run build` to create Windows NSIS/portable, macOS DMG and Linux AppImage targets.
