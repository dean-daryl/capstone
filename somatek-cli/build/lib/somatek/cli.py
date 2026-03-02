"""Somatek CLI - Offline-first deployment tool for teachers."""

import subprocess
import sys
import webbrowser

import typer

from somatek.config import ensure_dirs, get_or_create_config, load_config, RUNTIME_DIR
from somatek.downloader import download_jre, locate_and_install_jar
from somatek.services import backend, chroma, nllb, ollama, textcat

app = typer.Typer(
    name="somatek",
    help="Somatek offline deployment tool for teachers.",
    add_completion=False,
)


@app.command()
def setup(
    email: str = typer.Option(
        None,
        prompt="Teacher email",
        help="Teacher email for login",
    ),
    password: str = typer.Option(
        None,
        prompt="Teacher password",
        hide_input=True,
        help="Teacher password for login",
    ),
) -> None:
    """Set up Somatek for first use.

    Creates the data directory, downloads required runtimes,
    and pulls AI models.
    """
    typer.echo("Setting up Somatek...\n")

    # 1. Create directory structure
    typer.echo("[1/5] Creating directory structure...")
    ensure_dirs()
    cfg = get_or_create_config(email=email, password=password)
    typer.echo("  Done.\n")

    # 2. Check / install Ollama
    typer.echo("[2/5] Checking Ollama...")
    ollama.ensure_installed()
    ollama.start()
    typer.echo("")

    # 3. Pull Ollama models
    typer.echo("[3/5] Pulling AI models (this may take a while)...")
    ollama.pull_models()
    typer.echo("")

    # 4. Download portable JRE
    typer.echo("[4/5] Downloading Java runtime...")
    download_jre()
    typer.echo("")

    # 5. Locate and install backend JAR
    typer.echo("[5/5] Installing backend...")
    try:
        jar_path = locate_and_install_jar()
    except FileNotFoundError as e:
        typer.echo(f"\n  {e}")
        raise typer.Exit(1)

    # 6. Install ChromaDB (so 'somatek start' doesn't need pip)
    typer.echo("\n[6/6] Installing ChromaDB...")
    chroma.ensure_installed()

    typer.echo("\nSetup complete! Run 'somatek start' to launch.")


@app.command()
def start(
    network: bool = typer.Option(
        False,
        "--network",
        help="Bind to 0.0.0.0 for classroom mode (students connect via local IP)",
    ),
) -> None:
    """Start all Somatek services."""
    cfg = load_config()
    if not cfg:
        typer.echo("Somatek is not set up. Run 'somatek setup' first.")
        raise typer.Exit(1)

    ensure_dirs()
    typer.echo("Starting Somatek services...\n")

    # 1. ChromaDB
    typer.echo("[1/5] ChromaDB...")
    chroma.ensure_installed()
    chroma.start()

    # 2. Ollama
    typer.echo("[2/5] Ollama...")
    ollama.start()

    # 3. TextCat
    typer.echo("[3/5] TextCat...")
    textcat.start()

    # 4. NLLB
    typer.echo("[4/5] NLLB...")
    nllb.start()

    # 5. Backend
    typer.echo("[5/5] Backend...")
    ok = backend.start()

    if ok:
        url = "http://localhost:8080"
        if network:
            _print_network_info()
        typer.echo(f"\nSomatek is ready! Opening {url}")
        webbrowser.open(url)
    else:
        typer.echo("\nSomatek started with warnings. Check logs in ~/.somatek/logs/")


@app.command()
def stop() -> None:
    """Stop all Somatek services."""
    typer.echo("Stopping Somatek services...\n")
    backend.stop()
    textcat.stop()
    nllb.stop()
    chroma.stop()
    typer.echo("\nAll services stopped. (Ollama left running as shared resource)")


@app.command()
def status() -> None:
    """Show the status of all Somatek services."""
    services = [
        ("ChromaDB", chroma.is_running()),
        ("Ollama", ollama.is_running()),
        ("TextCat", textcat.is_running()),
        ("NLLB", nllb.is_running()),
        ("Backend", backend.is_running()),
    ]

    typer.echo("Somatek Service Status\n")
    for name, running in services:
        icon = "running" if running else "stopped"
        typer.echo(f"  {name:12s} {icon}")


def _print_network_info() -> None:
    """Print the local IP for classroom mode."""
    import socket

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        typer.echo(f"\n  Classroom mode: Students can connect at http://{local_ip}:8080")
    except Exception:
        typer.echo("\n  Could not determine local IP for classroom mode.")


if __name__ == "__main__":
    app()
