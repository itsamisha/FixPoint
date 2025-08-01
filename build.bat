@echo off
REM FixPoint Build Script for Windows
echo ==========================================
echo   FixPoint Build Script
echo   Civic Issue Reporting Platform
echo ==========================================
echo.

setlocal enabledelayedexpansion

REM Set colors (if supported)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print status messages
:print_status
echo %BLUE%[INFO]%NC% %~1
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM Check if Java is installed
:check_java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Java is not installed. Please install Java 17 or higher."
    pause
    exit /b 1
)
for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%g
)
call :print_success "Java found: %JAVA_VERSION%"
goto :eof

REM Check if Node.js is installed
:check_node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "Node.js is not installed. Please install Node.js 16 or higher."
    pause
    exit /b 1
)
for /f %%i in ('node --version') do set NODE_VERSION=%%i
call :print_success "Node.js found: %NODE_VERSION%"
goto :eof

REM Check if npm is installed
:check_npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    call :print_error "npm is not installed. Please install npm."
    pause
    exit /b 1
)
for /f %%i in ('npm --version') do set NPM_VERSION=%%i
call :print_success "npm found: v%NPM_VERSION%"
goto :eof

REM Clean previous builds
:clean_builds
call :print_status "Cleaning previous builds..."

if exist "target" (
    rmdir /s /q "target"
    call :print_success "Cleaned Maven target directory"
)

if exist "frontend\build" (
    rmdir /s /q "frontend\build"
    call :print_success "Cleaned frontend build directory"
)

if "%~1"=="--clean-deps" (
    if exist "frontend\node_modules" (
        rmdir /s /q "frontend\node_modules"
        call :print_success "Cleaned frontend dependencies"
    )
)
goto :eof

REM Build backend
:build_backend
call :print_status "Building Spring Boot backend..."

if exist "mvnw.cmd" (
    call mvnw.cmd clean package -DskipTests
) else (
    mvn clean package -DskipTests >nul 2>&1
    if %errorlevel% neq 0 (
        call :print_error "Maven not found. Please install Maven or use the included wrapper."
        pause
        exit /b 1
    )
)

if %errorlevel% equ 0 (
    call :print_success "Backend build completed successfully"
) else (
    call :print_error "Backend build failed"
    pause
    exit /b 1
)
goto :eof

REM Install frontend dependencies
:install_frontend_deps
call :print_status "Installing frontend dependencies..."

cd frontend
call npm install

if %errorlevel% equ 0 (
    call :print_success "Frontend dependencies installed successfully"
) else (
    call :print_error "Failed to install frontend dependencies"
    cd ..
    pause
    exit /b 1
)

cd ..
goto :eof

REM Build frontend
:build_frontend
call :print_status "Building React frontend..."

cd frontend
call npm run build

if %errorlevel% equ 0 (
    call :print_success "Frontend build completed successfully"
) else (
    call :print_error "Frontend build failed"
    cd ..
    pause
    exit /b 1
)

cd ..
goto :eof

REM Run tests
:run_tests
call :print_status "Running backend tests..."

if exist "mvnw.cmd" (
    call mvnw.cmd test
) else (
    call mvn test
)

if %errorlevel% equ 0 (
    call :print_success "Backend tests passed"
) else (
    call :print_warning "Some backend tests failed"
)

call :print_status "Running frontend tests..."
cd frontend
call npm test -- --coverage --watchAll=false

if %errorlevel% equ 0 (
    call :print_success "Frontend tests passed"
) else (
    call :print_warning "Some frontend tests failed"
)

cd ..
goto :eof

REM Create deployment package
:create_package
call :print_status "Creating deployment package..."

for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "PACKAGE_NAME=fixpoint-%YYYY%%MM%%DD%-%HH%%Min%%Sec%"

if not exist "dist" mkdir "dist"
mkdir "dist\%PACKAGE_NAME%"

REM Copy backend JAR
for %%f in (target\fixpoint-*.jar) do copy "%%f" "dist\%PACKAGE_NAME%\"

REM Copy frontend build
xcopy /e /i "frontend\build" "dist\%PACKAGE_NAME%\frontend"

REM Copy configuration files
copy "src\main\resources\application.properties" "dist\%PACKAGE_NAME%\application.properties.example"

REM Copy documentation
copy "README.md" "dist\%PACKAGE_NAME%\"

REM Create startup scripts
echo @echo off > "dist\%PACKAGE_NAME%\start.bat"
echo echo Starting FixPoint Application... >> "dist\%PACKAGE_NAME%\start.bat"
echo java -jar fixpoint-*.jar >> "dist\%PACKAGE_NAME%\start.bat"
echo pause >> "dist\%PACKAGE_NAME%\start.bat"

echo #!/bin/bash > "dist\%PACKAGE_NAME%\start.sh"
echo echo "Starting FixPoint Application..." >> "dist\%PACKAGE_NAME%\start.sh"
echo java -jar fixpoint-*.jar >> "dist\%PACKAGE_NAME%\start.sh"

REM Create ZIP package (requires PowerShell)
powershell -command "Compress-Archive -Path 'dist\%PACKAGE_NAME%\*' -DestinationPath 'dist\%PACKAGE_NAME%.zip'"

call :print_success "Deployment package created: dist\%PACKAGE_NAME%.zip"
goto :eof

REM Start development servers
:start_dev_servers
call :print_status "Starting development servers..."

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    call :print_status "Installing frontend dependencies..."
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        call :print_error "Failed to install frontend dependencies"
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

call :print_status "Starting Spring Boot backend on port 8080..."
start "FixPoint Backend" cmd /k "cd /d %~dp0 && mvnw.cmd spring-boot:run"

timeout /t 3 /nobreak >nul

call :print_status "Starting React frontend on port 3000..."
start "FixPoint Frontend" cmd /k "cd /d %~dp0frontend && npm start"

call :print_success "Development servers are starting!"
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Both servers will open in separate windows.
pause
goto :eof

REM Main execution
:main
REM Parse command line arguments
set RUN_TESTS=false
set CREATE_PACKAGE=false
set CLEAN_DEPS=false
set DEV_MODE=false

:parse_args
if "%~1"=="--test" (
    set RUN_TESTS=true
    shift
    goto parse_args
)
if "%~1"=="--package" (
    set CREATE_PACKAGE=true
    shift
    goto parse_args
)
if "%~1"=="--clean-deps" (
    set CLEAN_DEPS=true
    shift
    goto parse_args
)
if "%~1"=="--dev" (
    set DEV_MODE=true
    shift
    goto parse_args
)
if "%~1"=="--help" goto show_help
if "%~1"=="-h" goto show_help
if "%~1"=="/?" goto show_help
if not "%~1"=="" (
    shift
    goto parse_args
)

REM Check prerequisites
call :check_java
call :check_node
call :check_npm

REM If development mode, start servers instead of building
if "%DEV_MODE%"=="true" (
    call :start_dev_servers
    goto :eof
)

REM Clean previous builds
if "%CLEAN_DEPS%"=="true" (
    call :clean_builds --clean-deps
) else (
    call :clean_builds
)

REM Install frontend dependencies
call :install_frontend_deps

REM Build components
call :build_backend
call :build_frontend

REM Run tests if requested
if "%RUN_TESTS%"=="true" (
    call :run_tests
)

REM Create package if requested
if "%CREATE_PACKAGE%"=="true" (
    call :create_package
)

echo.
call :print_success "Build completed successfully!"
echo.
echo Next steps:
echo 1. Backend JAR: target\fixpoint-*.jar
echo 2. Frontend build: frontend\build\
echo 3. Start backend: java -jar target\fixpoint-*.jar
echo 4. Serve frontend from frontend\build\ directory
echo.
echo For development:
echo 1. Backend: mvnw.cmd spring-boot:run
echo 2. Frontend: cd frontend ^&^& npm start
echo.
pause
goto :eof

:show_help
echo Usage: %0 [options]
echo.
echo Options:
echo   --test        Run tests after building
echo   --package     Create deployment package
echo   --clean-deps  Clean frontend dependencies before build
echo   --dev         Start development servers (both frontend and backend)
echo   --help, -h    Show this help message
echo.
echo Quick Start:
echo   %0 --dev      Start both development servers
echo   start-dev.bat Quick development startup (opens in separate windows)
echo.
pause
goto :eof

REM Start main execution
call :main %*
