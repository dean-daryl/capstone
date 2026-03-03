#!/usr/bin/env bash
# Build script for Somatek CLI - Cross-platform PyInstaller builds
# Usage: ./build.sh [--clean] [--platform PLATFORM]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLEAN=false
PLATFORM=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [--clean] [--platform PLATFORM]"
            echo ""
            echo "Options:"
            echo "  --clean     Remove build artifacts before building"
            echo "  --platform  Target platform: linux, macos, windows (default: current platform)"
            echo "  -h, --help  Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Build for current platform"
            echo "  $0 --clean            # Clean and build"
            echo "  $0 --platform linux   # Build for Linux (from any platform)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Detect current platform if not specified
if [ -z "$PLATFORM" ]; then
    case "$(uname -s)" in
        Linux*)     PLATFORM="linux";;
        Darwin*)    PLATFORM="macos";;
        MINGW*|MSYS*|CYGWIN*) PLATFORM="windows";;
        *)          echo "Unknown platform: $(uname -s)"; exit 1;;
    esac
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Somatek CLI Build Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Platform: ${PLATFORM}${NC}"
echo ""

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo -e "${YELLOW}Cleaning build artifacts...${NC}"
    rm -rf build dist __pycache__ somatek/*.pyc
    rm -rf .eggs *.egg-info
    echo -e "${GREEN}✓ Clean complete${NC}"
    echo ""
fi

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python ${PYTHON_VERSION}${NC}"

# Check pip
if ! python3 -m pip --version &> /dev/null; then
    echo -e "${RED}✗ pip not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pip installed${NC}"

# Install/upgrade build dependencies
echo ""
echo -e "${YELLOW}Installing build dependencies...${NC}"
python3 -m pip install --upgrade pip setuptools wheel pyinstaller
python3 -m pip install -e .

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create dist directory
mkdir -p dist

# Build with PyInstaller
echo ""
echo -e "${YELLOW}Building Somatek CLI with PyInstaller...${NC}"
echo -e "${BLUE}This may take several minutes...${NC}"

pyinstaller --clean somatek-cli.spec

# Verify build
if [ -f "dist/somatek" ] || [ -f "dist/somatek.exe" ]; then
    echo ""
    echo -e "${GREEN}✓ Build successful!${NC}"
    
    # Show file info
    if [ -f "dist/somatek" ]; then
        BINARY="dist/somatek"
        SIZE=$(du -h "$BINARY" | cut -f1)
        echo -e "${BLUE}Binary: ${BINARY}${NC}"
        echo -e "${BLUE}Size: ${SIZE}${NC}"
    elif [ -f "dist/somatek.exe" ]; then
        BINARY="dist/somatek.exe"
        SIZE=$(du -h "$BINARY" 2>/dev/null | cut -f1 || stat -f%z "$BINARY")
        echo -e "${BLUE}Binary: ${BINARY}${NC}"
        echo -e "${BLUE}Size: ${SIZE}${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Build Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "Test the binary with:"
    echo -e "  ${BLUE}./dist/somatek --help${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Build failed - binary not found${NC}"
    exit 1
fi
