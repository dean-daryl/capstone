# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for the somatek-nllb standalone binary."""

import os

block_cipher = None

a = Analysis(
    ["entry.py"],
    pathex=[],
    binaries=[],
    datas=[
        ("glossary.json", "."),
        ("app", "app"),
    ],
    hiddenimports=[
        "ctranslate2",
        "transformers",
        "tokenizers",
        "sentencepiece",
        "fastapi",
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "pydantic",
        "anyio",
        "anyio._backends",
        "anyio._backends._asyncio",
        "app",
        "app.main",
        "app.model",
        "app.glossary",
        "app.schemas",
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        "torch",
        "tensorflow",
        "sklearn",
        "scipy",
        "pkg_resources",
        "setuptools",
    ],
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
    name="somatek-nllb",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
