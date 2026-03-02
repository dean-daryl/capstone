"""Ollama service management."""

import platform
import shutil
import subprocess
import sys

from somatek.health import check_port

OLLAMA_PORT = 11434
MODELS = ["llama3.2:3b", "nomic-embed-text"]


def is_installed() -> bool:
    """Check if Ollama is installed."""
    return shutil.which("ollama") is not None


def is_running() -> bool:
    """Check if Ollama is serving."""
    return check_port("localhost", OLLAMA_PORT)


def install() -> None:
    """Install Ollama (platform-specific)."""
    system = platform.system().lower()
    if system == "darwin":
        print("  Ollama is not installed. Please install it from https://ollama.com/download")
        print("  Or run: brew install ollama")
        sys.exit(1)
    elif system == "linux":
        print("  Installing Ollama...")
        result = subprocess.run(
            ["sh", "-c", "curl -fsSL https://ollama.com/install.sh | sh"],
            check=False,
        )
        if result.returncode != 0:
            print("  Failed to install Ollama. Please install manually: https://ollama.com/download")
            sys.exit(1)
        print("  Ollama installed successfully.")
    else:
        print(f"  Unsupported platform: {system}. Install Ollama manually: https://ollama.com/download")
        sys.exit(1)


def ensure_installed() -> None:
    """Ensure Ollama is installed, install if not."""
    if not is_installed():
        install()


def start() -> None:
    """Start Ollama serve if not already running."""
    if is_running():
        print("  Ollama is already running.")
        return
    print("  Starting Ollama...")
    subprocess.Popen(
        ["ollama", "serve"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    # Wait a bit for it to start
    import time

    for _ in range(15):
        if is_running():
            print("  Ollama started.")
            return
        time.sleep(1)
    print("  Warning: Ollama may not have started. Check manually.")


def pull_models() -> None:
    """Pull required Ollama models."""
    for model in MODELS:
        print(f"  Pulling model: {model}")
        result = subprocess.run(
            ["ollama", "pull", model],
            check=False,
        )
        if result.returncode != 0:
            print(f"  Warning: Failed to pull {model}. You can retry with: ollama pull {model}")
        else:
            print(f"  Model ready: {model}")
