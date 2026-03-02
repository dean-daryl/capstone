"""NLLB translation sidecar service management."""

import os
import signal
import shutil
import subprocess

from somatek.config import LOGS_DIR, clear_pid, read_pid, write_pid
from somatek.health import check_port

SERVICE_NAME = "nllb"
NLLB_PORT = 8002


def is_running() -> bool:
    """Check if NLLB is running."""
    return check_port("localhost", NLLB_PORT)


def start() -> bool:
    """Start NLLB translation sidecar.

    Expects the NLLB service to be available as a Python module or script.
    """
    if is_running():
        print("  NLLB is already running.")
        return True

    nllb_cmd = shutil.which("nllb-serve")
    if nllb_cmd is None:
        print("  Warning: NLLB translation service not found. Translation will be unavailable.")
        print("  You can install it later and start it on port 8002.")
        return False

    log_file = LOGS_DIR / "nllb.log"
    print(f"  Starting NLLB (port {NLLB_PORT})...")

    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [nllb_cmd, "--port", str(NLLB_PORT)],
            stdout=lf,
            stderr=subprocess.STDOUT,
        )

    write_pid(SERVICE_NAME, proc.pid)

    import time

    for _ in range(10):
        if is_running():
            print("  NLLB started.")
            return True
        time.sleep(1)
    print("  Warning: NLLB may not have started.")
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
