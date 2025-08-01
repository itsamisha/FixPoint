@echo off
REM FixPoint Development Stop Script
echo ==========================================
echo   FixPoint Development Server Stop
echo   Stopping both Backend and Frontend
echo ==========================================
echo.

echo [INFO] Stopping FixPoint servers...

REM Stop processes running on port 8080 (Backend)
echo [INFO] Stopping backend (port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    echo Killing process %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Stop processes running on port 3000 (Frontend)
echo [INFO] Stopping frontend (port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Alternative: Stop all Java and Node processes
echo [INFO] Stopping all Java and Node.js processes...
taskkill /IM "java.exe" /F >nul 2>&1
taskkill /IM "node.exe" /F >nul 2>&1

echo.
echo [SUCCESS] FixPoint servers stopped!
echo.
pause
