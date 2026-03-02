"""Configuration management for Somatek CLI."""

import json
import secrets
from pathlib import Path
from typing import Optional

SOMATEK_HOME = Path.home() / ".somatek"
CONFIG_FILE = SOMATEK_HOME / "config.json"
DATA_DIR = SOMATEK_HOME / "data"
RUNTIME_DIR = SOMATEK_HOME / "runtime"
PIDS_DIR = SOMATEK_HOME / "pids"
LOGS_DIR = SOMATEK_HOME / "logs"


def ensure_dirs() -> None:
    """Create the ~/.somatek directory structure."""
    for d in [SOMATEK_HOME, DATA_DIR, RUNTIME_DIR, PIDS_DIR, LOGS_DIR, DATA_DIR / "files"]:
        d.mkdir(parents=True, exist_ok=True)


def load_config() -> dict:
    """Load config from ~/.somatek/config.json."""
    if CONFIG_FILE.exists():
        return json.loads(CONFIG_FILE.read_text())
    return {}


def save_config(cfg: dict) -> None:
    """Save config to ~/.somatek/config.json."""
    ensure_dirs()
    CONFIG_FILE.write_text(json.dumps(cfg, indent=2))


def get_or_create_config(email: Optional[str] = None, password: Optional[str] = None) -> dict:
    """Load existing config or create a new one with defaults."""
    cfg = load_config()
    if "jwt_secret" not in cfg:
        cfg["jwt_secret"] = secrets.token_urlsafe(32)
    if email:
        cfg["user_email"] = email
    if password:
        cfg["user_password"] = password
    if "data_dir" not in cfg:
        cfg["data_dir"] = str(DATA_DIR)
    save_config(cfg)
    return cfg


def get_pid_file(service: str) -> Path:
    """Get the PID file path for a service."""
    return PIDS_DIR / f"{service}.pid"


def write_pid(service: str, pid: int) -> None:
    """Write a PID file for a service."""
    ensure_dirs()
    get_pid_file(service).write_text(str(pid))


def read_pid(service: str) -> Optional[int]:
    """Read a PID file. Returns None if not found or invalid."""
    pid_file = get_pid_file(service)
    if not pid_file.exists():
        return None
    try:
        return int(pid_file.read_text().strip())
    except ValueError:
        return None


def clear_pid(service: str) -> None:
    """Remove a PID file."""
    pid_file = get_pid_file(service)
    if pid_file.exists():
        pid_file.unlink()
