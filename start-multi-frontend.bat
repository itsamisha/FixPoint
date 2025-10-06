@echo off
echo Starting 4 Frontend Instances on ports 3000, 3001, 3002, 3003...
echo.

cd /d "%~dp0frontend"

if not exist "package.json" (
    echo Error: Frontend directory not found or invalid
    pause
    exit /b 1
)


echo Starting frontend on port 3001...
start "Frontend-3001" cmd /k "set PORT=3001 && set BROWSER=none && npm start"

echo Starting frontend on port 3002...
start "Frontend-3002" cmd /k "set PORT=3002 && set BROWSER=none && npm start"

echo Starting frontend on port 3003...
start "Frontend-3003" cmd /k "set PORT=3003 && set BROWSER=none && npm start"

echo.
echo All frontend instances started!
echo.
echo Access your applications at:
echo   http://localhost:3000
echo   http://localhost:3001
echo   http://localhost:3002
echo   http://localhost:3003
echo.
echo Close the individual command windows to stop each instance.
echo.
pause