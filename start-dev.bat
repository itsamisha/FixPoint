@echo off
REM FixPoint Development Startup Script
echo ==========================================
echo   FixPoint Development Server Startup
echo   Starting both Backend and Frontend
echo ==========================================
echo.

REM Check if Java is available
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed. Please install Java 17 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

echo [INFO] Starting FixPoint Development Servers...
echo.

REM Start backend in a new window
echo [INFO] Starting Spring Boot backend on port 8080...
start "FixPoint Backend" cmd /k "cd /d %~dp0 && mvnw.cmd spring-boot:run"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Start frontend in a new window
echo [INFO] Starting React frontend on port 3000...
start "FixPoint Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo [SUCCESS] Both servers are starting!
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul
