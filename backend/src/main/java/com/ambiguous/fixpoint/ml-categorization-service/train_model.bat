@echo off
echo Training ML Categorization Model...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Create models directory if it doesn't exist
if not exist "models" mkdir models

REM Train the model
echo Starting model training...
echo This may take several minutes depending on your hardware...
echo.
python train_model.py

echo.
echo Training complete! Check the models/ directory for results.
pause

