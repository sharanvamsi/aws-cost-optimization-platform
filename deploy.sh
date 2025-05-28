#!/bin/bash

# AWS Cost Analysis Platform - Deployment Script
# This script helps deploy the application in various environments

set -e

echo "🚀 AWS Cost Analysis Platform Deployment Script"
echo "================================================"

# Function to display usage
usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  dev         Start development server"
    echo "  build       Build for production"
    echo "  start       Start production server"
    echo "  docker      Build and run Docker container"
    echo "  install     Install dependencies"
    echo "  clean       Clean build artifacts"
    echo "  help        Show this help message"
    exit 1
}

# Function to check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed. Please install Node.js 18.0 or higher."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version 18.0 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    echo "✅ Node.js $(node -v) detected"
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed successfully"
}

# Function to build the application
build_app() {
    echo "🔨 Building application for production..."
    npm run build
    echo "✅ Build completed successfully"
}

# Function to start development server
start_dev() {
    echo "🔧 Starting development server..."
    echo "Navigate to http://localhost:3000 when ready"
    npm run dev
}

# Function to start production server
start_prod() {
    echo "🚀 Starting production server..."
    echo "Navigate to http://localhost:3000"
    npm start
}

# Function to build and run Docker container
docker_deploy() {
    echo "🐳 Building Docker container..."
    docker build -t aws-cost-platform .
    echo "🚀 Running Docker container..."
    echo "Navigate to http://localhost:3000"
    docker run -p 3000:3000 aws-cost-platform
}

# Function to clean build artifacts
clean_build() {
    echo "🧹 Cleaning build artifacts..."
    rm -rf .next
    rm -rf out
    rm -rf node_modules/.cache
    echo "✅ Clean completed"
}

# Main script logic
case "$1" in
    "dev")
        check_node
        install_deps
        start_dev
        ;;
    "build")
        check_node
        install_deps
        build_app
        ;;
    "start")
        check_node
        build_app
        start_prod
        ;;
    "docker")
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker is not installed. Please install Docker first."
            exit 1
        fi
        docker_deploy
        ;;
    "install")
        check_node
        install_deps
        ;;
    "clean")
        clean_build
        ;;
    "help")
        usage
        ;;
    *)
        echo "❌ Invalid option: $1"
        usage
        ;;
esac 