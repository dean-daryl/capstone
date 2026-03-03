# Somatek CLI Installer for Windows PowerShell
# Usage: Invoke-WebRequest -Uri https://somatek.com/install.ps1 -OutFile install.ps1; .\install.ps1
# Or: iwr https://somatek.com/install.ps1 -useb | iex

param(
    [string]$Version = "",
    [string]$Location = "",
    [string]$Repo = "dean-daryl/capstone",
    [switch]$Help
)

if ($Help) {
    Write-Host "Somatek CLI Installer for Windows"
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  iwr https://somatek.com/install.ps1 -useb | iex"
    Write-Host "  .\install.ps1 [-Version vX.X.X] [-Location C:\somatek]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Version    Specific version to install (default: latest)"
    Write-Host "  -Location   Installation directory (default: %USERPROFILE%\somatek)"
    Write-Host "  -Repo       GitHub repository (default: dean-daryl/capstone)"
    Write-Host "  -Help       Show this help message"
    exit 0
}

# Colors
function Write-Info { Write-Host $args[0] -ForegroundColor Blue }
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }

Write-Info "========================================"
Write-Info "  Somatek CLI Installer"
Write-Info "========================================"
Write-Host ""

# Default location
if (-not $Location) {
    $Location = "$env:USERPROFILE\somatek"
}

# Detect architecture
$Arch = (Get-CimInstance Win32_Processor).AddressWidth | Select-Object -First 1
if ($Arch -eq 64) {
    $ArchLabel = "x64"
} else {
    Write-Error "✗ Somatek CLI requires 64-bit Windows"
    exit 1
}

$Platform = "windows"
Write-Warning "Detected: Windows $ArchLabel"
Write-Host ""

# Check PowerShell version
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Warning "PowerShell 5+ recommended"
}

# Determine version to download
if (-not $Version) {
    Write-Warning "Fetching latest version..."
    try {
        $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest"
        $Version = $release.tag_name
    } catch {
        Write-Error "✗ Failed to fetch latest version"
        exit 1
    }
}

Write-Success "✓ Version: $Version"

# Binary filename
$BinaryFile = "somatek-windows-$ArchLabel.exe"

# Build download URL
$LocalPath = "somatek-cli\dist\$BinaryFile"
if (Test-Path $LocalPath) {
    Write-Warning "Using local build..."
    $DownloadUrl = "file://$(Resolve-Path $LocalPath)"
    $UseLocal = $true
} else {
    $DownloadUrl = "https://github.com/$Repo/releases/download/$Version/$BinaryFile"
    $UseLocal = $false
}

# Create temporary directory
$TempDir = Join-Path $env:TEMP "somatek-install-$(Get-Random)"
New-Item -ItemType Directory -Force -Path $TempDir | Out-Null

# Cleanup on exit
trap {
    if (Test-Path $TempDir) {
        Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
    }
} EXIT

# Download binary
Write-Warning "Downloading Somatek CLI..."
try {
    if ($UseLocal) {
        Copy-Item ($DownloadUrl -replace 'file://', '') "$TempDir\somatek.exe"
    } else {
        Invoke-WebRequest -Uri $DownloadUrl -OutFile "$TempDir\somatek.exe" -UseBasicParsing
    }
} catch {
    Write-Error "✗ Download failed"
    Write-Host ""
    Write-Host "Available releases: https://github.com/$Repo/releases"
    exit 1
}

# Verify binary
Write-Warning "Verifying binary..."
try {
    & "$TempDir\somatek.exe" --help | Out-Null
    Write-Success "✓ Binary verified"
} catch {
    Write-Error "✗ Binary verification failed"
    exit 1
}

# Install to location
Write-Host ""
Write-Warning "Installing to $Location..."

try {
    # Create location directory
    if (-not (Test-Path $Location)) {
        New-Item -ItemType Directory -Force -Path $Location | Out-Null
    }

    # Copy binary
    Copy-Item "$TempDir\somatek.exe" "$Location\somatek.exe" -Force

    Write-Success "✓ Installation complete"
} catch {
    Write-Error "✗ Installation failed: $($_.Exception.Message)"
    exit 1
}

# Add to PATH if not already present
$CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($CurrentPath -notlike "*$Location*") {
    Write-Host ""
    Write-Warning "Adding $Location to PATH..."
    try {
        [Environment]::SetEnvironmentVariable(
            "Path",
            "$CurrentPath;$Location",
            "User"
        )
        Write-Success "✓ PATH updated"
        Write-Host ""
        Write-Warning "Please restart your terminal or run:"
        Write-Host "  `$env:Path = [Environment]::GetEnvironmentVariable('Path', 'User')"
    } catch {
        Write-Warning "Could not update PATH automatically"
        Write-Host "Please add $Location to your PATH manually"
    }
}

Write-Host ""
Write-Success "========================================"
Write-Success "  Installation Complete!"
Write-Success "========================================"
Write-Host ""
Write-Host "Somatek CLI has been installed to: $Location\somatek.exe"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  somatek setup    # First-time setup (required)"
Write-Host "  somatek start    # Start all services"
Write-Host "  somatek --help   # Show all commands"
Write-Host ""
Write-Host "Documentation: https://github.com/$Repo"
Write-Host ""
