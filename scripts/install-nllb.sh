#!/usr/bin/env bash
# Somatek NLLB Translation Service Installer for Linux/macOS
# Usage: curl -fsSL .../install-nllb.sh | bash
# Or: curl -fsSL .../install-nllb.sh | bash -s -- [--version nllb-vX.X.X] [--location /usr/local/bin] [--model-dir DIR] [--skip-model]

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
MODEL_DIR="$HOME/.somatek/models/nllb-kin-ct2"
REPO="dean-daryl/somatek"
BINARY_NAME="somatek-nllb"
SKIP_MODEL=false

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
        --model-dir)
            MODEL_DIR="$2"
            shift 2
            ;;
        --skip-model)
            SKIP_MODEL=true
            shift
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        -h|--help)
            echo "Somatek NLLB Translation Service Installer"
            echo ""
            echo "Usage:"
            echo "  curl -fsSL .../install-nllb.sh | bash"
            echo "  curl -fsSL .../install-nllb.sh | bash -s -- [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --version      Specific version to install (default: latest nllb-v* tag)"
            echo "  --location     Binary installation directory (default: /usr/local/bin)"
            echo "  --model-dir    Model installation directory (default: ~/.somatek/models/nllb-kin-ct2)"
            echo "  --skip-model   Skip downloading the model files"
            echo "  --repo         GitHub repository (default: dean-daryl/somatek)"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Somatek NLLB Installer${NC}"
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
        echo "Somatek NLLB supports Linux and macOS only."
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

# Determine version to download — filter for nllb-v* tags only
if [ -z "$VERSION" ]; then
    echo -e "${YELLOW}Fetching latest NLLB version...${NC}"
    VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO}/releases" \
        | grep '"tag_name":' \
        | sed -E 's/.*"([^"]+)".*/\1/' \
        | grep '^nllb-v' \
        | head -n 1)
    if [ -z "$VERSION" ]; then
        echo -e "${RED}✗ Failed to fetch latest NLLB version${NC}"
        echo "  No nllb-v* releases found at https://github.com/${REPO}/releases"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Version: ${VERSION}${NC}"

# ── Binary download ──────────────────────────────────────────────────

BINARY_FILE="somatek-nllb-${PLATFORM}-${ARCH_LABEL}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY_FILE}"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo -e "${YELLOW}Downloading NLLB binary...${NC}"
if ! curl -fsSL -o "$TEMP_DIR/somatek-nllb" "$DOWNLOAD_URL"; then
    echo -e "${RED}✗ Download failed${NC}"
    echo ""
    echo "Available releases: https://github.com/${REPO}/releases"
    exit 1
fi

# Make executable
chmod +x "$TEMP_DIR/somatek-nllb"

# Verify binary runs
echo -e "${YELLOW}Verifying binary...${NC}"
if "$TEMP_DIR/somatek-nllb" --help &> /dev/null || true; then
    echo -e "${GREEN}✓ Binary downloaded${NC}"
fi

# Install to location
echo ""
echo -e "${YELLOW}Installing binary to ${LOCATION}...${NC}"

if [ ! -d "$LOCATION" ]; then
    mkdir -p "$LOCATION" || {
        echo -e "${RED}✗ Cannot create ${LOCATION}${NC}"
        echo "Try running with sudo or choose a different location:"
        echo "  ... | bash -s -- --location ~/.local/bin"
        exit 1
    }
fi

if [ -w "$LOCATION" ]; then
    mv "$TEMP_DIR/somatek-nllb" "$LOCATION/somatek-nllb"
else
    echo -e "${YELLOW}Password required to install to ${LOCATION}${NC}"
    sudo mv "$TEMP_DIR/somatek-nllb" "$LOCATION/somatek-nllb"
fi

chmod +x "$LOCATION/somatek-nllb"
echo -e "${GREEN}✓ Binary installed to ${LOCATION}/somatek-nllb${NC}"

# ── Model download ──────────────────────────────────────────────────

if [ "$SKIP_MODEL" = true ]; then
    echo ""
    echo -e "${YELLOW}Skipping model download (--skip-model)${NC}"
elif [ -d "$MODEL_DIR" ] && [ "$(ls -A "$MODEL_DIR" 2>/dev/null)" ]; then
    echo ""
    echo -e "${GREEN}✓ Model already present at ${MODEL_DIR} — skipping download${NC}"
else
    echo ""
    echo -e "${YELLOW}Downloading NLLB model (~630MB, this may take a while)...${NC}"
    MODEL_URL="https://github.com/${REPO}/releases/download/${VERSION}/somatek-nllb-model.tar.gz"

    if ! curl -fsSL -o "$TEMP_DIR/somatek-nllb-model.tar.gz" "$MODEL_URL"; then
        echo -e "${RED}✗ Model download failed${NC}"
        echo "  You can download the model manually later:"
        echo "  curl -fsSL -o model.tar.gz ${MODEL_URL}"
        echo "  mkdir -p ${MODEL_DIR} && tar xzf model.tar.gz -C ${MODEL_DIR}"
        echo ""
        echo -e "${YELLOW}The binary is installed — it will work once the model is in place.${NC}"
    else
        mkdir -p "$MODEL_DIR"
        echo -e "${YELLOW}Extracting model...${NC}"
        tar xzf "$TEMP_DIR/somatek-nllb-model.tar.gz" -C "$MODEL_DIR"
        echo -e "${GREEN}✓ Model installed to ${MODEL_DIR}${NC}"
    fi
fi

# ── PATH check ───────────────────────────────────────────────────────

if [[ ":$PATH:" != *":$LOCATION:"* ]]; then
    echo ""
    echo -e "${YELLOW}⚠ ${LOCATION} is not in your PATH${NC}"
    echo "Add it to your shell profile:"
    echo ""
    case "$SHELL" in
        */bash*)
            echo "  echo 'export PATH=\$PATH:$LOCATION' >> ~/.bashrc"
            echo "  source ~/.bashrc"
            ;;
        */zsh*)
            echo "  echo 'export PATH=\$PATH:$LOCATION' >> ~/.zshrc"
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

# ── Done ─────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Binary:  ${BLUE}${LOCATION}/somatek-nllb${NC}"
echo -e "Model:   ${BLUE}${MODEL_DIR}${NC}"
echo ""
echo -e "Start the translation service:"
echo -e "  ${BLUE}NLLB_MODEL_DIR=${MODEL_DIR} somatek-nllb${NC}"
echo ""
echo -e "Or use it via the Somatek CLI:"
echo -e "  ${BLUE}somatek start${NC}"
echo ""
