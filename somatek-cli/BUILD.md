# Somatek CLI - Build Instructions

This document explains how to build the self-contained Somatek CLI binary.

## Quick Start

### Build for Current Platform

```bash
cd somatek-cli

# Linux/macOS
./build.sh

# Windows
.\build.ps1
```

### Build with Clean

```bash
./build.sh --clean
```

## Prerequisites

### For Building

| Component | Version | Purpose |
|-----------|---------|---------|
| Python | 3.9+ | CLI runtime |
| Node.js | 16+ | Frontend build |
| Java | 21 | Backend JAR build |
| Maven | 3.8+ | Backend build |

### For Running (End Users)

**Nothing!** The binary is self-contained.

## Build Outputs

After building, you'll find:

```
somatek-cli/dist/
├── somatek              # Linux/macOS binary
└── somatek.exe          # Windows binary
```

## Installation

### From Local Build

```bash
# Linux/macOS
sudo cp dist/somatek /usr/local/bin/

# Windows
copy dist\somatek.exe C:\somatek\
```

### From GitHub Releases

```bash
# Linux/macOS
curl -fsSL https://somatek.com/install.sh | bash

# Windows PowerShell
iwr https://somatek.com/install.ps1 -useb | iex
```

## Build Process Details

### What Gets Bundled

The PyInstaller binary includes:

1. **Somatek CLI** - Python orchestration code
2. **All Python dependencies** - typer, httpx, chromadb, etc.
3. **Embedded Python runtime** - No external Python needed

### What Gets Downloaded on First Run

To keep the binary size manageable (~100MB vs ~2GB), these are downloaded during `somatek setup`:

1. **Ollama binary** - Platform-specific LLM runner
2. **Ollama models** - ~2GB of AI models
3. **Portable JRE** - ~50MB Java runtime
4. **Backend JAR** - Built locally or downloaded
5. **TextCat models** - spaCy classification models

## Cross-Platform Builds

### Build for All Platforms

Use GitHub Actions (recommended):

1. Tag a release: `git tag v0.1.0 && git push origin v0.1.0`
2. GitHub Actions builds for:
   - Linux x64
   - Linux ARM64
   - macOS Intel
   - macOS Apple Silicon
   - Windows x64

### Local Cross-Compilation

Cross-compilation is **not recommended** due to:
- Platform-specific binaries
- Different library paths
- Code signing requirements

Instead, build on each target platform or use GitHub Actions.

## Troubleshooting

### Build Fails with "Module Not Found"

Add the module to `hiddenimports` in `somatek-cli.spec`:

```python
hiddenimports = [
    # ... existing imports ...
    "missing.module.name",
]
```

### Binary Too Large

Check what's included:

```bash
pyinstaller --clean --log-level=DEBUG somatek-cli.spec
```

Common culprits:
- Unnecessary data files
- Full ML libraries when only inference is needed
- Debug symbols

### Binary Won't Run

1. **Check permissions**: `chmod +x somatek`
2. **Check architecture**: `file somatek`
3. **Check dependencies**: `ldd somatek` (Linux)

### macOS "Cannot Be Opened"

The binary needs to be signed:

```bash
codesign --sign - dist/somatek
```

Or allow in System Preferences → Security & Privacy.

## Version Management

### Update Version

Edit `pyproject.toml`:

```toml
[project]
version = "0.2.0"
```

Edit `somatek/cli.py`:

```python
__version__ = "0.2.0"
```

### Create Release

```bash
git commit -am "Release v0.2.0"
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actions will automatically:
1. Build for all platforms
2. Create GitHub Release
3. Upload binaries with checksums

## Performance Optimization

### UPX Compression

Enabled by default in the spec file. Reduces binary size by ~50%.

### Strip Symbols

For production builds:

```bash
strip dist/somatek  # Linux/macOS
```

## Security Considerations

### Code Signing

For production releases:

- **macOS**: Sign with Apple Developer ID
- **Windows**: Sign with EV certificate
- **Linux**: Provide GPG signatures for checksums

### Checksum Verification

Users should verify downloads:

```bash
sha256sum -c somatek-linux-x64.sha256
```

## Development Workflow

### Quick Iteration

For development, use the Python package directly:

```bash
pip install -e .
somatek --help
```

Only build the binary for:
- Release candidates
- Testing the bundled experience
- Performance testing

### Testing

```bash
# Test the binary
./dist/somatek --help
./dist/somatek version

# Test setup (dry run)
./dist/somatek setup --help
```

## Size Comparison

| Build Type | Size | Notes |
|------------|------|-------|
| Source only | ~100KB | Requires Python, pip install |
| PyInstaller binary | ~150MB | Self-contained |
| Full bundle (with models) | ~3GB | Not recommended |

## Resources

- [PyInstaller Documentation](https://pyinstaller.org/en/stable/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Somatek Architecture](../README.md)
