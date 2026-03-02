"""TextCat sidecar service management."""

import os
import signal
import shutil
import subprocess

from somatek.config import LOGS_DIR, clear_pid, read_pid, write_pid
from somatek.health import check_port

SERVICE_NAME = "textcat"
TEXTCAT_PORT = 8001


def is_running() -> bool:
    """Check if TextCat is running."""
    return check_port("localhost", TEXTCAT_PORT)


def start() -> bool:
    """Start TextCat sidecar.

    Expects the textcat service to be available as a Python module or script.
    The user should have it installed or available in their environment.
    """
    if is_running():
        print("  TextCat is already running.")
        return True

    # Check if textcat is available
    textcat_cmd = shutil.which("textcat-serve")
    if textcat_cmd is None:
        print("  Warning: TextCat service not found. Technology classification will be unavailable.")
        print("  You can install it later and start it on port 8001.")
        return False

    log_file = LOGS_DIR / "textcat.log"
    print(f"  Starting TextCat (port {TEXTCAT_PORT})...")

    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [textcat_cmd, "--port", str(TEXTCAT_PORT)],
            stdout=lf,
            stderr=subprocess.STDOUT,
        )

    write_pid(SERVICE_NAME, proc.pid)

    import time

    for _ in range(10):
        if is_running():
            print("  TextCat started.")
            return True
        time.sleep(1)
    print("  Warning: TextCat may not have started.")
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
