@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies, this may take a while...
  call npm install --no-audit --no-fund
)

echo.
echo Starting Aether Persona at http://localhost:5173/
echo Close this window to stop the server.
echo.

start "" "http://localhost:5173/"
call npm run dev -- --port 5173 --strictPort
pause