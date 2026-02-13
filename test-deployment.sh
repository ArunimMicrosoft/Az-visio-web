#!/bin/bash

# Azure Static Web Apps - Local Deployment Test Script
# This script helps you test the build locally before deploying to Azure

echo "🚀 Azure Architecture Designer - Deployment Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check Node.js version
echo "📋 Step 1: Checking Node.js version..."
NODE_VERSION=$(node --version 2>&1)
if [ $? -eq 0 ]; then
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm ci
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 3: Run build
echo ""
echo "🏗️  Step 3: Building application..."
npm run build
if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 4: Verify build output
echo ""
echo "🔍 Step 4: Verifying build output..."
if [ -d "build" ]; then
    print_success "Build directory exists"
    
    if [ -f "build/index.html" ]; then
        print_success "index.html found"
    else
        print_error "index.html not found in build directory"
        exit 1
    fi
    
    if [ -d "build/assets" ]; then
        print_success "Assets directory found"
    else
        print_warning "Assets directory not found (may be normal)"
    fi
    
    # Show build output structure
    echo ""
    echo "📂 Build directory contents:"
    ls -lh build/
    
    # Show total size
    BUILD_SIZE=$(du -sh build/ | cut -f1)
    echo ""
    echo "📊 Total build size: $BUILD_SIZE"
    
else
    print_error "Build directory not found"
    exit 1
fi

# Step 5: Check for common issues
echo ""
echo "🔍 Step 5: Checking for common issues..."

# Check for large files that might cause issues
LARGE_FILES=$(find build -type f -size +10M 2>/dev/null)
if [ -n "$LARGE_FILES" ]; then
    print_warning "Found files larger than 10MB:"
    echo "$LARGE_FILES"
    echo "Consider optimizing these files."
fi

# Check for proper file permissions
if [ ! -r "build/index.html" ]; then
    print_warning "index.html is not readable"
fi

# Step 6: Test local server (optional)
echo ""
echo "🌐 Step 6: Testing with local server..."
echo ""
echo "Do you want to test the build locally? (y/n)"
read -r RESPONSE

if [ "$RESPONSE" = "y" ] || [ "$RESPONSE" = "Y" ]; then
    echo ""
    echo "Starting local server..."
    echo "Open your browser to: http://localhost:4173"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx vite preview
fi

# Summary
echo ""
echo "================================================"
print_success "All checks passed!"
echo ""
echo "📋 Next Steps:"
echo "1. Ensure your Azure deployment token is up to date"
echo "2. Push your changes to trigger GitHub Actions deployment"
echo "3. Monitor deployment at: https://github.com/your-repo/actions"
echo ""
echo "📚 For deployment troubleshooting, see: AZURE_DEPLOYMENT_FIX.md"
echo ""
