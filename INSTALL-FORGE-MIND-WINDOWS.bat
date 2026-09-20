@echo off
cd /d "%~dp0"
if exist "release\ForgeMind-AI-0.8.0-win-x64.exe" (start "" "release\ForgeMind-AI-0.8.0-win-x64.exe") else (echo Run BUILD-WINDOWS.bat first. & pause)
