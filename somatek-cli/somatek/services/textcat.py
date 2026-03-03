"""TextCat sidecar service management."""

import os
import signal
import subprocess
import sys
from pathlib import Path

from somatek.config import LOGS_DIR, clear_pid, read_pid, write_pid
from somatek.health import check_port

SERVICE_NAME = "textcat"
TEXTCAT_PORT = 8001


def _find_project_root() -> Path | None:
    """Walk up from CWD to find the somatek project root."""
    cwd = Path.cwd()
    for d in [cwd, *cwd.parents]:
        if (d / "services" / "textcat" / "app" / "main.py").is_file():
            return d
    return None


def _service_dir() -> Path | None:
    root = _find_project_root()
    if root:
        return root / "services" / "textcat"
    return None


def _model_dir() -> Path | None:
    root = _find_project_root()
    if root:
        d = root / "models" / "textCat"
        if d.is_dir():
            return d
    return None


def ensure_installed() -> None:
    """Install TextCat Python dependencies if needed."""
    svc = _service_dir()
    if svc is None:
        return
    req = svc / "requirements.txt"
    if not req.exists():
        return
    print("  Installing TextCat dependencies (this may take a while on first run)...")
    subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(req), "-q"],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def is_running() -> bool:
    """Check if TextCat is running."""
    return check_port("localhost", TEXTCAT_PORT)


def start() -> bool:
    """Start TextCat sidecar."""
    if is_running():
        print("  TextCat is already running.")
        return True

    svc = _service_dir()
    if svc is None:
        print("  Warning: TextCat service directory not found. Classification will be unavailable.")
        return False

    model = _model_dir()
    if model is None:
        print("  Warning: TextCat model not found at models/textCat/. Classification will be unavailable.")
        return False

    # Dependencies should have been installed during setup
    log_file = LOGS_DIR / "textcat.log"
    print(f"  Starting TextCat (port {TEXTCAT_PORT})...")

    env = {
        **os.environ,
        "TEXTCAT_MODEL_DIR": str(model),
    }

    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [
                sys.executable, "-m", "uvicorn",
                "app.main:app",
                "--host", "127.0.0.1",
                "--port", str(TEXTCAT_PORT),
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
            print("  TextCat started.")
            return True
        time.sleep(1)
    print("  Warning: TextCat may not have started. Check logs at:")
    print(f"    {log_file}")
    return False


def stop() -> None:
    """Stop TextCat."""
    pid = read_pid(SERVICE_NAME)
    if pid is None:
        return
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"  Stopped TextCat (PID {pid}).")
    except OSError:
        pass
    clear_pid(SERVICE_NAME)
