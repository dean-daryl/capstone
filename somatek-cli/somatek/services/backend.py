"""Java backend service management."""

import os
import signal
import subprocess
from pathlib import Path

from somatek.config import (
    LOGS_DIR,
    RUNTIME_DIR,
    clear_pid,
    load_config,
    read_pid,
    write_pid,
)
from somatek.health import wait_for_health

SERVICE_NAME = "backend"
BACKEND_PORT = 8080
HEALTH_URL = f"http://localhost:{BACKEND_PORT}/health"


def _find_java() -> str:
    """Find the java binary (portable JRE or system)."""
    portable_java = RUNTIME_DIR / "jre" / "bin" / "java"
    if portable_java.exists():
        return str(portable_java)
    # Fall back to system Java
    import shutil

    system_java = shutil.which("java")
    if system_java:
        return system_java
    raise RuntimeError("Java not found. Run 'somatek setup' first.")


def _find_jar() -> Path:
    """Find the backend JAR."""
    jar_path = RUNTIME_DIR / "backend.jar"
    if jar_path.exists():
        return jar_path
    raise RuntimeError(f"Backend JAR not found at {jar_path}. Run 'somatek setup' first.")


def is_running() -> bool:
    """Check if the backend is running."""
    pid = read_pid(SERVICE_NAME)
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        clear_pid(SERVICE_NAME)
        return False


def start() -> bool:
    """Start the Java backend."""
    if is_running():
        print("  Backend is already running.")
        return True

    java = _find_java()
    jar = _find_jar()
    cfg = load_config()

    env = os.environ.copy()
    env["SOMATEK_DATA_DIR"] = cfg.get("data_dir", str(Path.home() / ".somatek" / "data"))
    env["JWT_SECRET"] = cfg.get("jwt_secret", "change-me")
    env["SOMATEK_SEED_EMAIL"] = cfg.get("user_email", "teacher@school.rw")
    env["SOMATEK_SEED_PASSWORD"] = cfg.get("user_password", "changeme")

    log_file = LOGS_DIR / "backend.log"
    print(f"  Starting backend (logs: {log_file})...")

    with open(log_file, "w") as lf:
        proc = subprocess.Popen(
            [
                java,
                "-Djava.net.preferIPv4Stack=true",
                "-jar",
                str(jar),
                "--spring.profiles.active=local",
            ],
            env=env,
            stdout=lf,
            stderr=subprocess.STDOUT,
        )

    write_pid(SERVICE_NAME, proc.pid)
    print(f"  Backend started (PID {proc.pid}). Waiting for health check...")

    if wait_for_health(HEALTH_URL, timeout=120, label="backend"):
        print("  Backend is ready!")
        return True
    else:
        print("  Warning: Backend health check timed out. Check logs at:")
        print(f"    {log_file}")
        return False


def stop() -> None:
    """Stop the backend."""
    pid = read_pid(SERVICE_NAME)
    if pid is None:
        print("  Backend is not running.")
        return

    try:
        os.kill(pid, signal.SIGTERM)
        print(f"  Stopped backend (PID {pid}).")
    except OSError:
        print(f"  Backend process {pid} already stopped.")
    clear_pid(SERVICE_NAME)
