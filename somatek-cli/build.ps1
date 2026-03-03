# Build script for Somatek CLI - Windows PowerShell
# Usage: .\build.ps1 [-Clean] [-Platform <platform>]

param(
    [switch]$Clean,
    [string]$Platform = "",
    [switch]$Help
)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $SCRIPT_DIR

# Colors
function Write-Info { Write-Host $args[0] -ForegroundColor Blue }
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }

# Help
if ($Help) {
    Write-Host "Usage: .\build.ps1 [-Clean] [-Platform <platform>]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Clean     Remove build artifacts before building"
    Write-Host "  -Platform  Target platform: linux, macos, windows (default: current platform)"
    Write-Host "  -Help      Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\build.ps1                    # Build for current platform"
    Write-Host "  .\build.ps1 -Clean             # Clean and build"
    Write-Host "  .\build.ps1 -Platform windows  # Build for Windows"
    exit 0
}

# Detect current platform if not specified
if (-not $Platform) {
    if ($env:OS -eq "Windows_NT") {
        $Platform = "windows"
    } elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname -s) -eq "Linux") {
        $Platform = "linux"
    } elseif ((Get-Command uname -ErrorAction SilentlyContinue) -and (uname -s) -eq "Darwin") {
        $Platform = "macos"
    } else {
        $Platform = "windows"
    }
}

Write-Info "========================================"
Write-Info "  Somatek CLI Build Script"
Write-Info "========================================"
Write-Warning "Platform: $Platform"
Write-Host ""

# Clean if requested
if ($Clean) {
    Write-Warning "Cleaning build artifacts..."
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue build, dist, __pycache__, somatek\*.pyc
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .eggs, *.egg-info
    Write-Success "✓ Clean complete"
    Write-Host ""
}

# Check prerequisites
Write-Warning "Checking prerequisites..."

# Check Python
try {
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) {
        $python = Get-Command python3 -ErrorAction SilentlyContinue
    }
    if (-not $python) {
        Write-Error "✗ Python not found"
        exit 1
    }
    $pythonVersion = & $python.Source --version 2>&1
    Write-Success "✓ $pythonVersion"
} catch {
    Write-Error "✗ Python not found"
    exit 1
}

# Check pip
try {
    & $python.Source -m pip --version | Out-Null
    Write-Success "✓ pip installed"
} catch {
    Write-Error "✗ pip not found"
    exit 1
}

# Install/upgrade build dependencies
Write-Host ""
Write-Warning "Installing build dependencies..."
& $python.Source -m pip install --upgrade pip setuptools wheel pyinstaller
& $python.Source -m pip install -e .

Write-Success "✓ Dependencies installed"

# Create dist directory
New-Item -ItemType Directory -Force -Path dist | Out-Null

# Build with PyInstaller
Write-Host ""
Write-Warning "Building Somatek CLI with PyInstaller..."
Write-Info "This may take several minutes..."

& pyinstaller --clean somatek-cli.spec

# Verify build
if (Test-Path "dist\somatek.exe") {
    Write-Host ""
    Write-Success "✓ Build successful!"
    
    # Show file info
    $binary = "dist\somatek.exe"
    $size = (Get-Item $binary).Length / 1MB
    Write-Info "Binary: $binary"
    Write-Info "Size: $([math]::Round($size, 2)) MB"
    
    Write-Host ""
    Write-Success "========================================"
    Write-Success "  Build Complete!"
    Write-Success "========================================"
    Write-Host ""
    Write-Host "Test the binary with:"
    Write-Info "  .\dist\somatek.exe --help"
    Write-Host ""
} else {
    Write-Host ""
    Write-Error "✗ Build failed - binary not found"
    exit 1
}
