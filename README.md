# ForgeMind AI

Desktop-first AI development workstation for coding, 3D workflows, Roblox Studio and Blender.

## Important cloud note
This project intentionally does **not** require a personal API key. A truly cloud-hosted AI still requires a server-side inference service; the desktop client cannot magically provide free hosted inference. The architecture therefore keeps the client keyless and is ready for a ForgeMind Cloud gateway.

## Run
1. Install Node.js LTS.
2. `npm install`
3. `npm start`

## Build installers
`npm run build`

Build targets include Windows NSIS + portable, macOS DMG and Linux AppImage.
