# ForgeMind AI v0.9.1

This release keeps the v0.8 desktop foundation and makes the workflow more prompt-first, similar in interaction style to modern AI builders.

## What changed
- Lemonade is now the local-first AI engine.
- Prompt-first AI Lab and home prompt launcher.
- Lemonade model detection.
- Automatic first-model selection when no local model is chosen.
- Cloud API mode remains available using the user's own key.
- Added Windows launcher that checks/repairs Electron before starting.
- Added dedicated Electron repair script.
- Added a clearer message when `index.html` is opened directly in a browser.

## Start on Windows
Double-click:
`START-FORGEMIND-WINDOWS.bat`

Do not open `src/index.html` directly.

## Checks
Run:
`npm run check`

## Build
Run:
`npm run dist`

The repository contains build configuration; a compiled installer is not included in this source ZIP unless one has been built separately.
