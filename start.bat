@echo off
setlocal enabledelayedexpansion

echo ============================================
echo  CivicMind AI - Dev Environment Bootstrap
echo ============================================

echo.
echo [1/4] Killing existing frontend (port 3000) service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [1/4] Killing existing backend (port 5000) service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo   killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [2/4] Installing frontend dependencies (root)...
call npm install
if errorlevel 1 (
    echo Frontend npm install failed.
    exit /b 1
)

echo.
echo [3/4] Installing backend dependencies...
pushd backend
call npm install
if errorlevel 1 (
    echo Backend npm install failed.
    popd
    exit /b 1
)
popd

echo.
echo [4/4] Starting dev servers in separate windows...
start "CivicMind Backend (port 5000)" cmd /k "cd /d %~dp0backend && npm run dev"
start "CivicMind Frontend (port 3000)" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo Done.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
endlocal
