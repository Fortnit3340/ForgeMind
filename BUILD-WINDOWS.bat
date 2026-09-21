@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>nul || (echo Node.js is required. & pause & exit /b 1)

echo Installing pinned dependencies...
call npm install --include=dev --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo Dependency installation failed.
  pause
  exit /b 1
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo Electron executable is missing. Repairing...
  call npm install --save-dev electron@38.0.0 --include=dev --no-audit --no-fund
)

if not exist "node_modules\electron\dist\electron.exe" (
  echo.
  echo ERROR: Electron is still missing.
  echo Run REPAIR-ELECTRON-WINDOWS.bat.
  pause
  exit /b 1
)

echo Running JavaScript checks...
call npm run check
if errorlevel 1 (
  echo.
  echo ERROR: JavaScript validation failed.
  pause
  exit /b 1
)

echo.
echo Building Windows installer and portable app...
call npm run dist
if errorlevel 1 (
  echo.
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo Build completed. Files are in the release folder.
pause
