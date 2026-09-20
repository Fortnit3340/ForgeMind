@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required. & pause & exit /b 1)
call npm install
call npm run dist
echo Installer is in the release folder.
pause
