#!/bin/bash

# FixPoint Build Script
echo "🚀 Building FixPoint Civic Issue Reporting Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Java is installed
check_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2)
        print_success "Java found: $JAVA_VERSION"
    else
        print_error "Java is not installed. Please install Java 17 or higher."
        exit 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: v$NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Clean previous builds
clean_builds() {
    print_status "Cleaning previous builds..."
    
    # Clean Maven target directory
    if [ -d "target" ]; then
        rm -rf target
        print_success "Cleaned Maven target directory"
    fi
    
    # Clean frontend build directory
    if [ -d "frontend/build" ]; then
        rm -rf frontend/build
        print_success "Cleaned frontend build directory"
    fi
    
    # Clean frontend node_modules if requested
    if [ "$1" == "--clean-deps" ]; then
        if [ -d "frontend/node_modules" ]; then
            rm -rf frontend/node_modules
            print_success "Cleaned frontend dependencies"
        fi
    fi
}

# Build backend
build_backend() {
    print_status "Building Spring Boot backend..."
    
    if command -v ./mvnw &> /dev/null; then
        chmod +x ./mvnw
        ./mvnw clean package -DskipTests
    elif command -v mvn &> /dev/null; then
        mvn clean package -DskipTests
    else
        print_error "Maven not found. Please install Maven or use the included wrapper."
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Backend build completed successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    
    cd frontend
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Build frontend
build_frontend() {
    print_status "Building React frontend..."
    
    cd frontend
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed successfully"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd ..
}

# Run tests
run_tests() {
    print_status "Running backend tests..."
    
    if command -v ./mvnw &> /dev/null; then
        ./mvnw test
    else
        mvn test
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Backend tests passed"
    else
        print_warning "Some backend tests failed"
    fi
    
    print_status "Running frontend tests..."
    cd frontend
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        print_success "Frontend tests passed"
    else
        print_warning "Some frontend tests failed"
    fi
    
    cd ..
}

# Create deployment package
create_package() {
    print_status "Creating deployment package..."
    
    PACKAGE_NAME="fixpoint-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "dist/$PACKAGE_NAME"
    
    # Copy backend JAR
    cp target/fixpoint-*.jar "dist/$PACKAGE_NAME/"
    
    # Copy frontend build
    cp -r frontend/build "dist/$PACKAGE_NAME/frontend"
    
    # Copy configuration files
    cp src/main/resources/application.properties "dist/$PACKAGE_NAME/application.properties.example"
    
    # Copy documentation
    cp README.md "dist/$PACKAGE_NAME/"
    
    # Create startup scripts
    cat > "dist/$PACKAGE_NAME/start.sh" << EOF
#!/bin/bash
echo "Starting FixPoint Application..."
java -jar fixpoint-*.jar
EOF
    
    cat > "dist/$PACKAGE_NAME/start.bat" << EOF
@echo off
echo Starting FixPoint Application...
java -jar fixpoint-*.jar
pause
EOF
    
    chmod +x "dist/$PACKAGE_NAME/start.sh"
    
    # Create ZIP package
    cd dist
    zip -r "$PACKAGE_NAME.zip" "$PACKAGE_NAME"
    cd ..
    
    print_success "Deployment package created: dist/$PACKAGE_NAME.zip"
}

# Main execution
main() {
    echo "============================================"
    echo "  FixPoint Build Script"
    echo "  Civic Issue Reporting Platform"
    echo "============================================"
    echo ""
    
    # Parse command line arguments
    RUN_TESTS=false
    CREATE_PACKAGE=false
    CLEAN_DEPS=false
    
    for arg in "$@"; do
        case $arg in
            --test)
                RUN_TESTS=true
                shift
                ;;
            --package)
                CREATE_PACKAGE=true
                shift
                ;;
            --clean-deps)
                CLEAN_DEPS=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --test        Run tests after building"
                echo "  --package     Create deployment package"
                echo "  --clean-deps  Clean frontend dependencies before build"
                echo "  --help, -h    Show this help message"
                echo ""
                exit 0
                ;;
        esac
    done
    
    # Check prerequisites
    check_java
    check_node
    check_npm
    
    # Clean previous builds
    if [ "$CLEAN_DEPS" = true ]; then
        clean_builds --clean-deps
    else
        clean_builds
    fi
    
    # Install frontend dependencies
    install_frontend_deps
    
    # Build components
    build_backend
    build_frontend
    
    # Run tests if requested
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    fi
    
    # Create package if requested
    if [ "$CREATE_PACKAGE" = true ]; then
        create_package
    fi
    
    echo ""
    print_success "Build completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Backend JAR: target/fixpoint-*.jar"
    echo "2. Frontend build: frontend/build/"
    echo "3. Start backend: java -jar target/fixpoint-*.jar"
    echo "4. Serve frontend from frontend/build/ directory"
    echo ""
    echo "For development:"
    echo "1. Backend: ./mvnw spring-boot:run"
    echo "2. Frontend: cd frontend && npm start"
}

# Run main function with all arguments
main "$@"
