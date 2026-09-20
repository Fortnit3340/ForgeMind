# ForgeMind AI v0.9

ForgeMind AI v0.6 combines the two directions you asked for:

1. **ForgeGUI-style asset workflow**
   - prompt-based asset creation workflow
   - reference image support
   - asset type, platform and style controls
   - 3D/game-ready export planning
   - asset library and generation history

2. **ForgeMind development workstation**
   - AI chat and coding
   - project browser + real file editor
   - Roblox Studio bridge
   - Blender bridge
   - permissions and action confirmations
   - API-key-per-user cloud AI
   - local-only bridge server
   - GitHub-ready project
   - packaging configuration for Windows/macOS/Linux

## Important
ForgeMind does not include a shared AI API key. Each user must enter their own key.
ForgeMind itself does not require a ForgeMind server for the desktop bridge.

True email verification and Roblox ownership verification require the corresponding provider/OAuth infrastructure. v0.6 therefore never pretends an unverified identity is verified. It stores the user's chosen identity and exposes provider hooks for real verification.

## Run
1. Install Node.js.
2. In this folder run:
   `npm install`
3. Run:
   `npm start`

Build installers:
`npm run dist`

Run checks:
`npm run check`

## Roblox bridge
See `bridge/Roblox/ForgeMindBridge.server.lua`.

## Blender bridge
See `bridge/Blender/forgemind_bridge.py`.

The bridge listens only on localhost and should be used with permissions disabled until you understand an action.

## v0.7 fix
v0.6 had an archive packaging mistake: the Electron `main.js` and `preload.js`
files were missing from the ZIP. That caused `window.forge` to be undefined and
the AI Lab showed `Cannot read properties of undefined (reading 'chat')`.
v0.7 includes both files and a startup guard.
