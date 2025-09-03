#!/bin/bash
# deployment-script.sh - Manual deployment helper

echo "🚀 FixPoint Deployment Script"
echo "================================"

# Build Backend
echo "📦 Building Spring Boot backend..."
./mvnw clean package -DskipTests

# Build Frontend  
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Create deployment package
echo "📁 Creating deployment package..."
mkdir -p deploy
cp target/fixpoint-*.jar deploy/
cp -r frontend/build deploy/frontend

echo "✅ Deployment package ready in ./deploy/"
echo "📤 Upload the contents to your hosting provider"

# Instructions
echo ""
echo "🔧 Next Steps:"
echo "1. Upload jar file to backend hosting"
echo "2. Upload frontend/build to static hosting"  
echo "3. Set environment variables"
echo "4. Configure database connection"
echo "5. Start your application!"
