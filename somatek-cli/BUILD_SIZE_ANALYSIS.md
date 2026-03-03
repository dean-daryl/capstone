# Somatek CLI - Build Size Analysis

## 📊 Current Build Size Breakdown

### Build Artifacts (Pre-compression)

| Component | Size | Description |
|-----------|------|-------------|
| **PKG (binaries + data)** | **272 MB** | Native libraries, DLLs, .dylib files |
| **PYZ (Python code)** | **113 MB** | Compressed Python bytecode |
| **base_library.zip** | 1.4 MB | Standard library modules |
| **Total (uncompressed)** | **~386 MB** | Before final EXE packaging |

### Final Binary (Estimated)
- **Compressed**: ~150-200 MB (with UPX)
- **Uncompressed**: ~400-500 MB

---

## 🎯 Top Space Consumers (Python Packages)

| Rank | Package | Modules | Est. Size | Needed? |
|------|---------|---------|-----------|---------|
| 1 | **torch** | 2,014 | ~80 MB | ❌ No |
| 2 | **transformers** | 1,640 | ~60 MB | ❌ No |
| 3 | **spacy** | 870 | ~40 MB | ⚠️ Partial |
| 4 | **kubernetes** | 787 | ~20 MB | ❌ No |
| 5 | **sympy** | 573 | ~15 MB | ❌ No |
| 6 | **scipy** | 435 | ~30 MB | ⚠️ Maybe |
| 7 | **tf_keras** | 404 | ~25 MB | ❌ No |
| 8 | **pygments** | 335 | ~5 MB | ⚠️ Optional |
| 9 | **numba** | 332 | ~15 MB | ❌ No |
| 10 | **pandas** | 293 | ~20 MB | ⚠️ Maybe |
| 11 | **networkx** | 283 | ~10 MB | ❌ No |
| 12 | **gevent** | 257 | ~8 MB | ❌ No |
| 13 | **nltk** | 256 | ~12 MB | ❌ No |
| 14 | **sklearn** | 241 | ~25 MB | ❌ No |
| 15 | **sqlalchemy** | 192 | ~10 MB | ✅ Yes |

---

## 🔍 Root Cause Analysis

### Why Are These Included?

These packages are **NOT directly used** by Somatek CLI. They're pulled in as **transitive dependencies**:

```
chromadb
├── onnxruntime
│   └── torch (80 MB!) ← HUGE
├── transformers (60 MB) ← Large
└── posthog
    └── various libs

chromadb
├── kubernetes (20 MB) ← For cloud deployment
└── grpcio
    └── various libs

typer/rich
└── pygments (syntax highlighting)
```

### The Problem

PyInstaller sees `import chromadb` and includes **everything** ChromaDB might use, including:
- PyTorch (for ONNX runtime)
- Transformers (Hugging Face)
- Kubernetes SDK (for cloud deployments)
- NLTK, spaCy, scikit-learn (for various integrations)

**Most of these are never actually used** in your Somatek deployment scenario.

---

## 💡 Optimization Strategies

### Strategy 1: Exclude Unnecessary Packages (Recommended)

Update `somatek-cli.spec` to exclude large packages:

```python
excludedmodules = [
    # ML/AI frameworks (not needed at runtime)
    "torch",
    "transformers",
    "tf_keras",
    "onnxruntime",  # Only needed for model training
    
    # Cloud deployment (not needed for local deployment)
    "kubernetes",
    "google.cloud",
    "azure",
    
    # Math/Science (not needed)
    "sympy",
    "networkx",
    "nltk",
    "sklearn",
    "numba",
    
    # Optional features
    "gevent",
    "pygments",  # Only for syntax highlighting in IPython
]
```

**Expected savings**: ~200 MB → **~100 MB final binary**

### Strategy 2: Use ChromaDB Client Only

Instead of full ChromaDB, use the client-only mode:

```python
# In services/chroma.py
import chromadb
from chromadb.config import Settings

# Connect to existing ChromaDB server
client = chromadb.HttpClient(host="localhost", port=8000)
```

This avoids bundling ChromaDB's server-side dependencies.

**Expected savings**: ~50 MB

### Strategy 3: Lazy Loading for Large Dependencies

Only import heavy packages when actually needed:

```python
def ensure_chroma_installed():
    # Import only when function is called
    import chromadb
    # ... rest of code
```

Combined with PyInstaller's `--hidden-import` for runtime-only packages.

---

## 🎯 Recommended Spec File Changes

Here's the optimized `somatek-cli.spec`:

```python
# Add to excludedmodules
excludedmodules = [
    "torch",           # 80 MB - not needed
    "transformers",    # 60 MB - not needed
    "tf_keras",        # 25 MB - not needed
    "kubernetes",      # 20 MB - not needed
    "sympy",           # 15 MB - not needed
    "numba",           # 15 MB - not needed
    "nltk",            # 12 MB - not needed
    "networkx",        # 10 MB - not needed
    "gevent",          # 8 MB - not needed
    "google.cloud",    # 10 MB - not needed
    "azure",           # 15 MB - not needed
    "sklearn",         # 25 MB - not needed
    "openpyxl",        # 8 MB - not needed
    "tensorflow",      # 100+ MB - definitely not needed
    "torchvision",     # 30 MB - not needed
]

# Keep only essential hidden imports
hiddenimports = [
    # Somatek modules
    "somatek.cli",
    "somatek.config",
    "somatek.downloader",
    "somatek.builder",
    "somatek.health",
    "somatek.services",
    "somatek.services.backend",
    "somatek.services.chroma",
    "somatek.services.nllb",
    "somatek.services.ollama",
    "somatek.services.textcat",
    
    # Core dependencies
    "typer",
    "click",
    "httpx",
    "httpcore",
    "anyio",
    
    # ChromaDB (minimal)
    "chromadb",
    "chromadb.api",
    "chromadb.api.types",
    "chromadb.api.client",
    "chromadb.api.fastapi",
    "chromadb.db.impl.sqlite",
    "chromadb.segment.impl.vector.local_persistent_hnsw",
    
    # ChromaDB essentials only
    "posthog",
    "opentelemetry.api",
    "opentelemetry.sdk",
    "grpc",
    "google.protobuf",
    "pypika",
    "bcrypt",
    "orjson",
    "mmh3",
    
    # Pydantic & FastAPI
    "pydantic",
    "pydantic_core",
    "fastapi",
    "uvicorn",
    "starlette",
    
    # HTTP
    "requests",
    "urllib3",
    "certifi",
    
    # Standard essentials
    "yaml",
    "sqlite3",
    "multiprocessing",
    "concurrent.futures",
]
```

---

## 📈 Projected Size Reduction

| Scenario | PYZ Size | PKG Size | Total |
|----------|----------|----------|-------|
| **Current** | 113 MB | 272 MB | **385 MB** |
| After exclusions | ~50 MB | ~120 MB | **~170 MB** |
| After UPX compression | ~25 MB | ~60 MB | **~85 MB** |
| Final binary | | | **~100 MB** ✅ |

---

## 🚀 Action Items

### Immediate (High Impact)

1. **Exclude torch/transformers** - Save 140 MB
2. **Exclude kubernetes** - Save 20 MB
3. **Exclude sympy/numba/nltk** - Save 40 MB
4. **Test ChromaDB still works** - Verify functionality

### Medium Term

5. **Split ChromaDB client/server** - Only bundle client
6. **Use system packages** - Rely on system Python for heavy libs
7. **Download heavy models at runtime** - Like Ollama does

---

## 🧪 Testing After Optimization

After making changes, verify:

```bash
# Rebuild
./build.sh --clean

# Test basic functionality
./dist/somatek --help
./dist/somatek version

# Test each service
./dist/somatek setup
./dist/somatek start
./dist/somatek status

# Check all services respond
curl http://localhost:8080/health
curl http://localhost:8000/health  # ChromaDB
```

---

## 📝 Key Insight

> **Your Somatek CLI doesn't need PyTorch, Transformers, or Kubernetes SDK at runtime.**

These are only needed for:
- Training models (done separately)
- Cloud deployment (not your thesis scope)
- Alternative backends (you're using Ollama + local services)

By excluding them, you get a **75% smaller binary** without losing functionality.
