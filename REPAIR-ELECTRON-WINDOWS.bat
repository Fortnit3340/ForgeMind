@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title ForgeMind AI - Repair Electron

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  pause
  exit /b 1
)

echo Removing the local Electron package...
if exist "node_modules\electron" rmdir /s /q "node_modules\electron"

echo Installing the pinned Electron version...
call npm install --save-dev electron@38.0.0 --include=dev --no-audit --no-fund

if errorlevel 1 (
  echo.
  echo Electron repair failed. Check your internet connection and Node.js/npm setup.
  pause
  exit /b 1
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo Electron was installed but its executable is still missing.
  echo Try deleting node_modules and package-lock.json, then run START-FORGEMIND-WINDOWS.bat again.
  pause
  exit /b 1
)

echo.
echo Electron repair completed.
echo Start ForgeMind with START-FORGEMIND-WINDOWS.bat
pause
