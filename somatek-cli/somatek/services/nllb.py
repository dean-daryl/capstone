"""NLLB translation sidecar service management."""

import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

from somatek.config import LOGS_DIR, SOMATEK_HOME, clear_pid, read_pid, write_pid
from somatek.health import check_port

SERVICE_NAME = "nllb"
NLLB_PORT = 8002


def _find_project_root() -> Path | None:
    """Walk up from CWD to find the somatek project root."""
    cwd = Path.cwd()
    for d in [cwd, *cwd.parents]:
        if (d / "services" / "nllb-translate" / "app" / "main.py").is_file():
            return d
    return None


def _service_dir() -> Path | None:
    root = _find_project_root()
    if root:
        return root / "services" / "nllb-translate"
    return None


def _find_nllb_binary() -> Path | None:
    """Locate the standalone somatek-nllb binary.

    Search order:
      1. ~/.somatek/runtime/somatek-nllb
      2. Anywhere on PATH
      3. Adjacent to the currently running binary (PyInstaller peer)
    """
    # 1. Installed location
    installed = SOMATEK_HOME / "runtime" / "somatek-nllb"
    if installed.is_file() and os.access(installed, os.X_OK):
        return installed

    # 2. On PATH
    on_path = shutil.which("somatek-nllb")
    if on_path:
        return Path(on_path)

    # 3. Adjacent to the running binary (frozen peer)
    if getattr(sys, "frozen", False):
        peer = Path(sys.executable).parent / "somatek-nllb"
        if peer.is_file() and os.access(peer, os.X_OK):
            return peer

    return None


def _model_dir() -> Path | None:
    """Locate the CTranslate2 model directory.

    Search order:
      1. Project-local: <project-root>/models/nllb-kin-ct2/
      2. Installed:     ~/.somatek/models/nllb-kin-ct2/
    """
    root = _find_project_root()
    if root:
        d = root / "models" / "nllb-kin-ct2"
        if d.is_dir():
            return d

    installed = SOMATEK_HOME / "models" / "nllb-kin-ct2"
    if installed.is_dir():
        return installed

    return None


def _glossary_path() -> Path | None:
    svc = _service_dir()
    if svc:
        p = svc / "glossary.json"
        if p.is_file():
            return p
    return None


def _wait_for_start(log_file: Path, timeout: int = 60) -> bool:
    """Poll the NLLB port until it responds or timeout is reached."""
    for _ in range(timeout):
        if is_running():
            print("  NLLB started.")
            return True
        time.sleep(1)
    print("  Warning: NLLB may not have started. Check logs at:")
    print(f"    {log_file}")
    return False


def ensure_installed() -> None:
    """Install NLLB Python dependencies if needed.

    Skips pip install entirely when the standalone binary is available.
    """
    if _find_nllb_binary() is not None:
        return

    svc = _service_dir()
    if svc is None:
        return
    req = svc / "requirements.txt"
    if not req.exists():
        return
    print("  Installing NLLB dependencies (this may take a while on first run)...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(req), "-q"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def is_running() -> bool:
    """Check if NLLB is running."""
    return check_port("localhost", NLLB_PORT)


def start() -> bool:
    """Start NLLB translation sidecar.

    Tries the standalone binary first, then falls back to the Python subprocess.
    """
    if is_running():
        print("  NLLB is already running.")
        return True

    model = _model_dir()
    if model is None:
        print("  Warning: NLLB model not found. Translation will be unavailable.")
        print("    Searched: <project>/models/nllb-kin-ct2/ and ~/.somatek/models/nllb-kin-ct2/")
        return False

    log_file = LOGS_DIR / "nllb.log"

    env = {
        **os.environ,
        "NLLB_MODEL_DIR": str(model),
        "NLLB_PORT": str(NLLB_PORT),
        "NLLB_HOST": "127.0.0.1",
    }

    # ── Try standalone binary first ─────────────────────────────────
    binary = _find_nllb_binary()
    if binary is not None:
        print(f"  Starting NLLB via standalone binary (port {NLLB_PORT})...")
        with open(log_file, "w") as lf:
            proc = subprocess.Popen(
                [str(binary)],
                env=env,
                stdout=lf,
                stderr=subprocess.STDOUT,
            )
        write_pid(SERVICE_NAME, proc.pid)
        return _wait_for_start(log_file)

    # ── Fall back to Python subprocess ──────────────────────────────
    svc = _service_dir()
    if svc is None:
        print("  Warning: NLLB service directory not found and no standalone binary available.")
        print("    Translation will be unavailable.")
        return False

    glossary = _glossary_path()
    if glossary:
        env["NLLB_GLOSSARY_PATH"] = str(glossary)

    print(f"  Starting NLLB via Python (port {NLLB_PORT})...")
    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [
                sys.executable, "-m", "uvicorn",
                "app.main:app",
                "--host", "127.0.0.1",
                "--port", str(NLLB_PORT),
            ],
            cwd=str(svc),
            env=env,
            stdout=lf,
            stderr=subprocess.STDOUT,
        )

    write_pid(SERVICE_NAME, proc.pid)
    return _wait_for_start(log_file)


def stop() -> None:
    """Stop NLLB."""
    pid = read_pid(SERVICE_NAME)
    if pid is None:
        return
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"  Stopped NLLB (PID {pid}).")
    except OSError:
        pass
    clear_pid(SERVICE_NAME)
