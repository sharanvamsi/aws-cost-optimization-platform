#!/bin/bash

# AWS Cost Optimization Platform - Quick Setup Script
# This script sets up the application for immediate use

set -e

echo "🚀 AWS Cost Optimization Platform - Quick Setup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js 18.0 or higher from: https://nodejs.org/"
        echo "After installation, run this script again."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18.0 or higher is required!"
        echo "Current version: $(node -v)"
        echo "Please update Node.js and run this script again."
        exit 1
    fi
    
    print_status "Node.js $(node -v) detected"
}

# Check if npm is available
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not available!"
        echo "Please ensure npm is installed with Node.js"
        exit 1
    fi
    print_status "npm $(npm -v) detected"
}

# Install dependencies
install_dependencies() {
    print_info "Installing project dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Create environment file
setup_environment() {
    if [ ! -f ".env.local" ]; then
        print_info "Creating environment configuration file..."
        cp .env.example .env.local 2>/dev/null || {
            echo "# AWS Cost Optimization Platform - Environment Configuration" > .env.local
            echo "# Optional: Add your OpenAI API key for enhanced recommendations" >> .env.local
            echo "# OPENAI_API_KEY=your_openai_api_key_here" >> .env.local
        }
        print_status "Environment file created (.env.local)"
        print_warning "You can add your OpenAI API key to .env.local for enhanced AI recommendations"
    else
        print_info "Environment file already exists"
    fi
}

# Build the application
build_application() {
    print_info "Building the application..."
    npm run build
    print_status "Application built successfully"
}

# Show completion message
show_completion() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    print_status "AWS Cost Optimization Platform is ready to use!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Start the development server:"
    echo "   ${BLUE}npm run dev${NC}"
    echo ""
    echo "2. Or start the production server:"
    echo "   ${BLUE}npm start${NC}"
    echo ""
    echo "3. Open your browser and navigate to:"
    echo "   ${BLUE}http://localhost:3000${NC}"
    echo ""
    echo "📚 Documentation:"
    echo "• README.md - Complete setup and usage guide"
    echo "• CONTRIBUTING.md - Development guidelines"
    echo "• CHANGELOG.md - Platform features and updates"
    echo ""
    echo "🔧 Deployment Options:"
    echo "• ./deploy.sh dev      - Start development server"
    echo "• ./deploy.sh start    - Start production server"
    echo "• ./deploy.sh docker   - Run with Docker"
    echo ""
    echo "💡 Optional Configuration:"
    echo "• Add OpenAI API key to .env.local for enhanced AI recommendations"
    echo "• Customize regional pricing in src/app/api/map-customer-region/route.ts"
    echo "• Modify lab types and costs for your specific use case"
    echo ""
    print_status "Happy analyzing! 🚀"
}

# Main setup process
main() {
    print_info "Starting setup process..."
    
    # Check prerequisites
    check_nodejs
    check_npm
    
    # Setup process
    install_dependencies
    setup_environment
    build_application
    
    # Show completion
    show_completion
}

# Run main function
main 