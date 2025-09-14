#!/bin/bash

echo "Training ML Categorization Model..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Create models directory if it doesn't exist
mkdir -p models

# Train the model
echo "Starting model training..."
echo "This may take several minutes depending on your hardware..."
echo
python train_model.py

echo
echo "Training complete! Check the models/ directory for results."

