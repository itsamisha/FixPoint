#!/bin/bash
set -e

echo "Making mvnw executable..."
chmod +x mvnw

echo "Running Maven build..."
./mvnw clean package -DskipTests

echo "Build completed successfully!"
