@echo off
echo Starting SynapseAI Twin - Backend and Frontend
echo.

echo [1] Starting Backend (Flask) on port 5000...
start "Backend" cmd /k "cd /d "%~dp0backend" && python app.py"

timeout /t 3 /nobreak >nul

echo [2] Starting Frontend (Vite) on port 5173...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers should be running now!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
