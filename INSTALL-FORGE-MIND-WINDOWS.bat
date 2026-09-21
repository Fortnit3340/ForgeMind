@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ForgeMind AI v0.9.1
echo.
echo This launcher checks the Electron installation and starts the desktop app.
echo It does not open index.html in a browser.
echo.

call START-FORGEMIND-WINDOWS.bat
exit /b %errorlevel%
