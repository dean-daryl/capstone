# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for Somatek CLI - Self-contained executable."""

from pathlib import Path

block_cipher = None

# Project root - use current working directory (somatek-cli/)
project_root = Path.cwd()

# Collect all data files to include
datas = [
    # Include somatek package
    (str(project_root / "somatek"), "somatek"),
]

# Hidden imports - modules that PyInstaller can't detect automatically
# Optimized for size - excluded large unnecessary packages
hiddenimports = [
    # Somatek internal modules
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

    # Typer and Click (CLI framework)
    "typer",
    "click",
    "shellingham",

    # HTTP client
    "httpx",
    "httpcore",
    "anyio",
    "sniffio",

    # ChromaDB and dependencies (minimal set)
    "chromadb",
    "chromadb.config",
    "chromadb.api",
    "chromadb.api.types",
    "chromadb.api.models.Collection",
    "chromadb.api.client",
    "chromadb.db.impl.sqlite",
    "chromadb.segment.impl.vector.local_persistent_hnsw",
    "chromadb.telemetry",
    "chromadb.telemetry.product.posthog",
    "chromadb.errors",
    "chromadb.auth",

    # ChromaDB essential dependencies only
    "posthog",
    "opentelemetry",
    "opentelemetry.api",
    "opentelemetry.sdk",
    "grpc",
    "google.protobuf",
    "pypika",
    "bcrypt",
    "orjson",
    "mmh3",

    # Pydantic
    "pydantic",
    "pydantic.fields",
    "pydantic_core",

    # FastAPI (used by services)
    "fastapi",
    "uvicorn",
    "uvicorn.loops",
    "uvicorn.protocols",
    "uvicorn.protocols.http",
    "starlette",
    "starlette.routing",
    "starlette.middleware",
    "starlette.middleware.cors",
    "websockets",

    # Requests/urllib3 (used by various libs)
    "requests",
    "urllib3",
    "urllib3.contrib",
    "certifi",
    "charset_normalizer",
    "idna",

    # Other common dependencies
    "yaml",
    "sqlite3",
    "multiprocessing",
    "concurrent.futures",
    "pkg_resources",
    "setuptools",
    "numpy",
]

# Binaries to exclude (reduce size)
# These are large packages NOT needed for Somatek runtime
excludedmodules = [
    # Standard exclusions
    "test",
    "unittest",
    "doctest",
    "pdb",
    "pydoc",
    "distutils",
    
    # LARGE ML/AI frameworks (not needed at runtime)
    "torch",           # ~80 MB - PyTorch
    "torchvision",     # ~30 MB - TorchVision
    "transformers",    # ~60 MB - Hugging Face Transformers
    "tf_keras",        # ~25 MB - TensorFlow Keras
    "tensorflow",      # ~100+ MB - TensorFlow
    "onnxruntime",     # ~50 MB - ONNX Runtime (only for training)
    
    # Cloud deployment (not needed for local deployment)
    "kubernetes",      # ~20 MB
    "google.cloud",    # ~10 MB
    "google.cloud.storage",
    "azure",           # ~15 MB
    "azure.storage",
    
    # Math/Science libraries (not needed)
    "sympy",           # ~15 MB - Symbolic math
    "numba",           # ~15 MB - JIT compiler
    "nltk",            # ~12 MB - Natural language toolkit
    "sklearn",         # ~25 MB - Scikit-learn
    "scipy",           # ~30 MB - Scientific computing (optional)
    "networkx",        # ~10 MB - Graph library
    
    # Optional features not needed
    "gevent",          # ~8 MB - Async library
    # "pygments",      # ~5 MB - Syntax highlighting - KEEPING for typer rich
    "openpyxl",        # ~8 MB - Excel files
    "pandas",          # ~20 MB - Data frames (optional)
    "matplotlib",      # ~15 MB - Plotting
    "seaborn",         # ~5 MB - Statistical plots
]

# Additional hidden imports for packages that need explicit inclusion
hiddenimports.extend([
    "pygments",        # Needed by typer's rich integration
    "pygments.lexers",
    "pygments.formatters",
])

a = Analysis(
    [str(project_root / "somatek" / "cli.py")],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=excludedmodules,
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='somatek',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for CLI output
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Add icon file if desired
)
