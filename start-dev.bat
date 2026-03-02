@echo off
setlocal

REM Start in the folder where this .bat lives
cd /d "%~dp0"

REM Frontend (Vite)
start "DTS Frontend (npm run dev)" cmd /k cd /d "%~dp0" ^&^& npm run dev

REM Backend (Express)
start "DTS Backend (npm start)" cmd /k cd /d "%~dp0backend" ^&^& npm start

REM Open browser (give Vite a moment to boot)
timeout /t 2 /nobreak >nul
start "" "http://192.168.1.115:5173/"

endlocal
