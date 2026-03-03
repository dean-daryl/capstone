#!/usr/bin/env bash
# Somatek CLI Installer for Linux/macOS
# Usage: curl -fsSL https://somatek.com/install.sh | bash
# Or: curl -fsSL https://somatek.com/install.sh | bash -s -- [--version vX.X.X] [--location /usr/local/bin]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
VERSION=""
LOCATION="/usr/local/bin"
REPO="dean-daryl/capstone"
BINARY_NAME="somatek"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --location)
            LOCATION="$2"
            shift 2
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        -h|--help)
            echo "Somatek CLI Installer"
            echo ""
            echo "Usage:"
            echo "  curl -fsSL https://somatek.com/install.sh | bash"
            echo "  curl -fsSL https://somatek.com/install.sh | bash -s -- [--version vX.X.X] [--location /path]"
            echo ""
            echo "Options:"
            echo "  --version    Specific version to install (default: latest)"
            echo "  --location   Installation directory (default: /usr/local/bin)"
            echo "  --repo       GitHub repository (default: dean-daryl/capstone)"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Somatek CLI Installer${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux*)
        PLATFORM="linux"
        ;;
    Darwin*)
        PLATFORM="macos"
        ;;
    *)
        echo -e "${RED}✗ Unsupported OS: $OS${NC}"
        echo "Somatek CLI supports Linux and macOS only."
        exit 1
        ;;
esac

case "$ARCH" in
    x86_64|amd64)
        ARCH_LABEL="x64"
        ;;
    aarch64|arm64)
        ARCH_LABEL="arm64"
        ;;
    *)
        echo -e "${RED}✗ Unsupported architecture: $ARCH${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}Detected: ${PLATFORM} ${ARCH_LABEL}${NC}"
echo ""

# Check for curl and tar
if ! command -v curl &> /dev/null; then
    echo -e "${RED}✗ curl is required but not installed${NC}"
    exit 1
fi

if ! command -v tar &> /dev/null; then
    echo -e "${RED}✗ tar is required but not installed${NC}"
    exit 1
fi

# Determine version to download
if [ -z "$VERSION" ]; then
    echo -e "${YELLOW}Fetching latest version...${NC}"
    VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
    if [ -z "$VERSION" ]; then
        echo -e "${RED}✗ Failed to fetch latest version${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Version: ${VERSION}${NC}"

# Determine binary filename
BINARY_FILE="somatek-${PLATFORM}-${ARCH_LABEL}"

# Build download URL
if [ -f "somatek-cli/dist/${BINARY_FILE}" ]; then
    # Local build exists
    echo -e "${YELLOW}Using local build...${NC}"
    DOWNLOAD_URL="file://$(pwd)/somatek-cli/dist/${BINARY_FILE}"
    USE_LOCAL=true
else
    # Download from GitHub releases
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_FILE}"
    USE_LOCAL=false
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Download binary
echo -e "${YELLOW}Downloading Somatek CLI...${NC}"
if [ "$USE_LOCAL" = true ]; then
    cp "${DOWNLOAD_URL#file://}" "$TEMP_DIR/somatek"
else
    if ! curl -fsSL -o "$TEMP_DIR/somatek" "$DOWNLOAD_URL"; then
        echo -e "${RED}✗ Download failed${NC}"
        echo ""
        echo "Available releases: https://github.com/${REPO}/releases"
        exit 1
    fi
fi

# Make executable
chmod +x "$TEMP_DIR/somatek"

# Verify binary works
echo -e "${YELLOW}Verifying binary...${NC}"
if ! "$TEMP_DIR/somatek" --version &> /dev/null; then
    # Version command might not exist, try help
    if ! "$TEMP_DIR/somatek" --help &> /dev/null; then
        echo -e "${RED}✗ Binary verification failed${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Binary verified${NC}"

# Install to location
echo ""
echo -e "${YELLOW}Installing to ${LOCATION}...${NC}"

# Create location if it doesn't exist
if [ ! -d "$LOCATION" ]; then
    mkdir -p "$LOCATION" || {
        echo -e "${RED}✗ Cannot create ${LOCATION}${NC}"
        echo "Try running with sudo or choose a different location:"
        echo "  curl -fsSL https://somatek.com/install.sh | bash -s -- --location ~/.local/bin"
        exit 1
    }
fi

# Check if we need sudo
if [ -w "$LOCATION" ]; then
    mv "$TEMP_DIR/somatek" "$LOCATION/somatek"
else
    echo -e "${YELLOW}Password required to install to ${LOCATION}${NC}"
    sudo mv "$TEMP_DIR/somatek" "$LOCATION/somatek"
fi

# Ensure it's executable
chmod +x "$LOCATION/somatek"

# Check if LOCATION is in PATH
if [[ ":$PATH:" != *":$LOCATION:"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠ ${LOCATION} is not in your PATH${NC}"
    echo "Add it to your shell profile:"
    echo ""
    case "$SHELL" in
        */bash*)
            echo "  echo 'export PATH=$PATH:$LOCATION' >> ~/.bashrc"
            echo "  source ~/.bashrc"
            ;;
        */zsh*)
            echo "  echo 'export PATH=$PATH:$LOCATION' >> ~/.zshrc"
            echo "  source ~/.zshrc"
            ;;
        */fish*)
            echo "  fish_add_path $LOCATION"
            ;;
        *)
            echo "  export PATH=\$PATH:$LOCATION"
            ;;
    esac
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Somatek CLI has been installed to: ${BLUE}$LOCATION/somatek${NC}"
echo ""
echo -e "Next steps:"
echo -e "  ${BLUE}somatek setup    # First-time setup (required)${NC}"
echo -e "  ${BLUE}somatek start    # Start all services${NC}"
echo -e "  ${BLUE}somatek --help   # Show all commands${NC}"
echo ""
echo -e "Documentation: https://github.com/${REPO}"
echo ""
