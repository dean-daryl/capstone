"""NLLB translation sidecar service management."""

import os
import signal
import subprocess
import sys
from pathlib import Path

from somatek.config import LOGS_DIR, clear_pid, read_pid, write_pid
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


def _model_dir() -> Path | None:
    root = _find_project_root()
    if root:
        d = root / "models" / "nllb-kin-ct2"
        if d.is_dir():
            return d
    return None


def _glossary_path() -> Path | None:
    svc = _service_dir()
    if svc:
        p = svc / "glossary.json"
        if p.is_file():
            return p
    return None


def ensure_installed() -> None:
    """Install NLLB Python dependencies if needed."""
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
    """Start NLLB translation sidecar."""
    if is_running():
        print("  NLLB is already running.")
        return True

    svc = _service_dir()
    if svc is None:
        print("  Warning: NLLB service directory not found. Translation will be unavailable.")
        return False

    model = _model_dir()
    if model is None:
        print("  Warning: NLLB model not found at models/nllb-kin-ct2/. Translation will be unavailable.")
        return False

    # Dependencies should have been installed during setup
    log_file = LOGS_DIR / "nllb.log"
    print(f"  Starting NLLB (port {NLLB_PORT})...")

    env = {
        **os.environ,
        "NLLB_MODEL_DIR": str(model),
        "NLLB_GLOSSARY_PATH": str(_glossary_path() or ""),
    }

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

    import time

    for _ in range(60):
        if is_running():
            print("  NLLB started.")
            return True
        time.sleep(1)
    print("  Warning: NLLB may not have started. Check logs at:")
    print(f"    {log_file}")
    return False


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
