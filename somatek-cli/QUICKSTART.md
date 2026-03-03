# Somatek CLI - Quick Reference

## For Users

### Install (One Command)

**Linux/macOS:**
```bash
curl -fsSL https://somatek.com/install.sh | bash
```

**Windows:**
```powershell
iwr https://somatek.com/install.ps1 -useb | iex
```

### First Use

```bash
somatek setup    # Required: downloads models, sets up environment
somatek start    # Launch all services
```

### Daily Use

```bash
somatek start    # Start services
somatek stop     # Stop services
somatek status   # Check what's running
```

### Access

- **Dashboard:** http://localhost:8080
- **API:** http://localhost:8080/api
- **Chrome Extension:** Load from `plugin/build/`

---

## For Developers

### Build Locally

```bash
cd somatek-cli
./build.sh --clean
```

### Test Binary

```bash
./dist/somatek --help
./dist/somatek version
```

### Create Release

```bash
# Update version in pyproject.toml and cli.py
git commit -am "Release v0.1.0"
git tag v0.1.0
git push origin v0.1.0
# GitHub Actions builds automatically
```

---

## File Locations

| Component | Location |
|-----------|----------|
| CLI binary | `~/.somatek/runtime/` or `/usr/local/bin/` |
| Config | `~/.somatek/config.json` |
| Data | `~/.somatek/data/` |
| Logs | `~/.somatek/logs/` |
| PIDs | `~/.somatek/pids/` |

---

## Ports

| Service | Port |
|---------|------|
| Backend | 8080 |
| ChromaDB | 8000 |
| Ollama | 11434 |
| TextCat | 8001 |
| NLLB | 8002 |

---

## Common Issues

### "Command not found"
Add to PATH:
```bash
export PATH=$PATH:/usr/local/bin  # Or wherever installed
```

### "Permission denied"
```bash
chmod +x /usr/local/bin/somatek
```

### "Port already in use"
```bash
somatek stop
somatek start
```

### Models not downloading
Check internet connection, then:
```bash
rm -rf ~/.somatek
somatek setup
```

---

## Architecture

```
somatek (CLI binary)
├── Embedded Python
├── typer (CLI framework)
├── httpx (HTTP client)
├── chromadb (vector DB)
└── Service managers
    ├── backend.py (Java Spring Boot)
    ├── ollama.py (LLM inference)
    ├── textcat.py (spaCy classification)
    ├── nllb.py (translation)
    └── chroma.py (vector search)
```

---

## Version Info

```bash
somatek version
# Output:
# Somatek CLI v0.1.0
# Running as self-contained binary
```
