@echo off
echo ========================================
echo 🚀 FixPoint Backend Runner
echo ========================================
echo.
echo This script helps you run the backend
echo.
echo Options:
echo 1. Install Maven (if not installed)
echo 2. Run with Maven (if installed)
echo 3. Open in IDE
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto install-maven
if "%choice%"=="2" goto run-maven
if "%choice%"=="3" goto open-ide
if "%choice%"=="4" goto exit
goto invalid

:install-maven
echo.
echo 📥 Installing Maven...
echo.
echo Step 1: Download Maven from:
echo https://maven.apache.org/download.cgi
echo.
echo Step 2: Extract to C:\Program Files\Apache\maven\
echo.
echo Step 3: Add to PATH environment variable
echo.
echo Step 4: Restart this script
echo.
pause
goto menu

:run-maven
echo.
echo 🔍 Checking if Maven is installed...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven not found! Please install it first.
    echo.
    goto install-maven
)
echo ✅ Maven found! Starting backend...
echo.
mvn spring-boot:run
goto menu

:open-ide
echo.
echo 🎯 Opening project in IDE...
echo.
echo Recommended IDEs:
echo 1. IntelliJ IDEA (Community Edition - FREE)
echo 2. Eclipse (FREE)
echo 3. VS Code (FREE)
echo.
echo Download links:
echo IntelliJ: https://www.jetbrains.com/idea/download/
echo Eclipse: https://www.eclipse.org/downloads/
echo VS Code: https://code.visualstudio.com/
echo.
echo After installing:
echo 1. Open the project folder
echo 2. Find the main Java class
echo 3. Right-click and "Run"
echo.
pause
goto menu

:invalid
echo.
echo ❌ Invalid choice! Please enter 1-4
echo.
pause
goto menu

:menu
cls
echo ========================================
echo 🚀 FixPoint Backend Runner
echo ========================================
echo.
echo Options:
echo 1. Install Maven (if not installed)
echo 2. Run with Maven (if installed)
echo 3. Open in IDE
echo 4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto install-maven
if "%choice%"=="2" goto run-maven
if "%choice%"=="3" goto open-ide
if "%choice%"=="4" goto exit
goto invalid

:exit
echo.
echo 👋 Goodbye! Good luck with your project!
echo.
pause
exit
