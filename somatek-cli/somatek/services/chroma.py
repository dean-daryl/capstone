"""ChromaDB service management."""

import os
import shutil
import signal
import subprocess
import sys

from somatek.config import DATA_DIR, LOGS_DIR, clear_pid, read_pid, write_pid
from somatek.health import check_port

SERVICE_NAME = "chroma"
CHROMA_PORT = 8000


def is_installed() -> bool:
    """Check if ChromaDB is installed."""
    return shutil.which("chroma") is not None


def ensure_installed() -> None:
    """Ensure ChromaDB is installed via pip."""
    if is_installed():
        return
    print("  Installing ChromaDB...")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "chromadb", "-q"],
        check=False,
    )
    if result.returncode != 0:
        print("  Failed to install ChromaDB. Install manually: pip install chromadb")
        sys.exit(1)
    print("  ChromaDB installed.")


def is_running() -> bool:
    """Check if ChromaDB is running."""
    return check_port("localhost", CHROMA_PORT)


def start() -> bool:
    """Start ChromaDB server."""
    if is_running():
        print("  ChromaDB is already running.")
        return True

    chroma_data = DATA_DIR / "chroma"
    chroma_data.mkdir(parents=True, exist_ok=True)
    log_file = LOGS_DIR / "chroma.log"

    print(f"  Starting ChromaDB (port {CHROMA_PORT})...")

    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [
                "chroma",
                "run",
                "--host",
                "127.0.0.1",
                "--path",
                str(chroma_data),
                "--port",
                str(CHROMA_PORT),
            ],
            stdout=lf,
            stderr=subprocess.STDOUT,
        )

    write_pid(SERVICE_NAME, proc.pid)

    import time

    for _ in range(15):
        if is_running():
            print("  ChromaDB started.")
            return True
        time.sleep(1)
    print("  Warning: ChromaDB may not have started. Check logs.")
    return False


def stop() -> None:
    """Stop ChromaDB."""
    pid = read_pid(SERVICE_NAME)
    if pid is None:
        print("  ChromaDB is not running.")
        return
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"  Stopped ChromaDB (PID {pid}).")
    except OSError:
        print(f"  ChromaDB process {pid} already stopped.")
    clear_pid(SERVICE_NAME)
