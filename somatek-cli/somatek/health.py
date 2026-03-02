"""Health check utilities."""

import time
from typing import Optional

import httpx


def wait_for_health(
    url: str,
    timeout: int = 120,
    interval: float = 2.0,
    label: str = "service",
) -> bool:
    """Poll a health endpoint until it returns 200 or timeout expires."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = httpx.get(url, timeout=5)
            if r.status_code == 200:
                return True
        except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout):
            pass
        time.sleep(interval)
    return False


def check_port(host: str, port: int) -> bool:
    """Check if a TCP port is responding."""
    import socket

    try:
        with socket.create_connection((host, port), timeout=2):
            return True
    except (ConnectionRefusedError, TimeoutError, OSError):
        return False
