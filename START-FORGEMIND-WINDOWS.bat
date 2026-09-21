@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title ForgeMind AI - Startup

echo.
echo ==========================================
echo          ForgeMind AI v0.9.1
echo      Lemonade-first desktop launcher
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo ERROR: package.json was not found.
  echo Please run this file from the ForgeMind project folder.
  pause
  exit /b 1
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo Electron is missing or was not installed correctly.
  echo Repairing the Electron installation now...
  echo.
  call npm install --include=dev --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo npm install failed.
    echo Try again with an internet connection, then run START-FORGEMIND-WINDOWS.bat.
    pause
    exit /b 1
  )
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo ERROR: Electron is still missing after npm install.
  echo Running the dedicated Electron repair...
  call npm install --save-dev electron@38.0.0 --include=dev --no-audit --no-fund
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo ERROR: Electron could not be repaired.
  echo Run REPAIR-ELECTRON-WINDOWS.bat and check your Node.js/npm installation.
  pause
  exit /b 1
)

echo Electron found. Starting ForgeMind...
echo.
start "" "node_modules\electron\dist\electron.exe" .
exit /b 0
