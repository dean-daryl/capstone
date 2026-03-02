"""Build frontend and backend JAR with bundled static files."""

import shutil
import subprocess
import sys
from pathlib import Path


def _find_project_root() -> Path:
    """Walk up from CWD to find the somatek project root (has backend/ and frontend/)."""
    cwd = Path.cwd()
    for d in [cwd, *cwd.parents]:
        if (d / "backend").is_dir() and (d / "frontend").is_dir():
            return d
    raise FileNotFoundError(
        "Could not find Somatek project root (expected backend/ and frontend/ directories).\n"
        "Run this command from inside the somatek project."
    )


def _find_npm() -> str:
    """Find npm binary."""
    npm = shutil.which("npm")
    if npm:
        return npm
    raise RuntimeError("npm not found. Install Node.js first: https://nodejs.org")


def _find_mvn() -> str:
    """Find Maven binary."""
    # Check common locations
    candidates = [
        shutil.which("mvn"),
        str(Path.home() / "Downloads" / "apache-maven-3.9.9" / "bin" / "mvn"),
    ]
    for c in candidates:
        if c and Path(c).exists():
            return c
    raise RuntimeError(
        "Maven not found. Install it or set PATH.\n"
        "Download: https://maven.apache.org/download.cgi"
    )


def build_frontend(project_root: Path) -> Path:
    """Build the frontend with local API URL.

    Returns the path to the dist/ directory.
    """
    frontend_dir = project_root / "frontend"
    if not frontend_dir.exists():
        raise FileNotFoundError(f"Frontend directory not found: {frontend_dir}")

    npm = _find_npm()

    # Install dependencies
    print("  Installing frontend dependencies...")
    subprocess.run([npm, "install"], cwd=str(frontend_dir), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    # Build with empty VITE_API_BASE_URL so it defaults to localhost:8080
    print("  Building frontend (local mode)...")
    env = {**__import__("os").environ, "VITE_API_BASE_URL": ""}
    subprocess.run([npm, "run", "build"], cwd=str(frontend_dir), check=True,
                   env=env, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    dist_dir = frontend_dir / "dist"
    if not dist_dir.exists():
        raise RuntimeError("Frontend build failed: dist/ directory not created")

    print(f"  Frontend built: {dist_dir}")
    return dist_dir


def bundle_frontend_into_backend(project_root: Path, dist_dir: Path) -> None:
    """Copy frontend dist/ into backend/src/main/resources/static/."""
    static_dir = project_root / "backend" / "src" / "main" / "resources" / "static"

    # Clear old static files
    if static_dir.exists():
        shutil.rmtree(static_dir)

    # Copy dist contents to static/
    shutil.copytree(str(dist_dir), str(static_dir))
    print(f"  Frontend bundled into: {static_dir}")


def build_backend_jar(project_root: Path) -> Path:
    """Build the backend fat JAR with Maven.

    Returns the path to the JAR file.
    """
    backend_dir = project_root / "backend"
    mvn = _find_mvn()

    print("  Building backend JAR (this may take a minute)...")
    subprocess.run(
        [mvn, "clean", "package", "-DskipTests", "-q"],
        cwd=str(backend_dir),
        check=True,
    )

    jar_path = backend_dir / "target" / "somatekai-0.0.1-SNAPSHOT.jar"
    if not jar_path.exists():
        raise RuntimeError("Backend build failed: JAR not found")

    size_mb = jar_path.stat().st_size // (1024 * 1024)
    print(f"  Backend JAR built: {jar_path} ({size_mb} MB)")
    return jar_path


def build_plugin(project_root: Path) -> Path:
    """Build the Chrome extension plugin.

    Returns the path to the build/ directory.
    """
    plugin_dir = project_root / "plugin"
    if not plugin_dir.exists():
        raise FileNotFoundError(f"Plugin directory not found: {plugin_dir}")

    npm = _find_npm()

    print("  Installing plugin dependencies...")
    subprocess.run([npm, "install"], cwd=str(plugin_dir), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    print("  Building plugin...")
    subprocess.run([npm, "run", "build"], cwd=str(plugin_dir), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    build_dir = plugin_dir / "build"
    if not build_dir.exists():
        raise RuntimeError("Plugin build failed: build/ directory not created")

    print(f"  Plugin built: {build_dir}")
    return build_dir


def full_build() -> Path:
    """Build everything: frontend → bundle into backend → JAR.

    Returns the path to the final JAR.
    """
    root = _find_project_root()

    print("Building frontend...")
    dist = build_frontend(root)

    print("\nBundling frontend into backend...")
    bundle_frontend_into_backend(root, dist)

    print("\nBuilding backend JAR...")
    jar = build_backend_jar(root)

    print("\nBuilding Chrome extension...")
    try:
        plugin_build = build_plugin(root)
        print(f"\n  Plugin ready at: {plugin_build}")
        print("  Load it in Chrome: chrome://extensions → Load unpacked → select that folder")
    except (FileNotFoundError, RuntimeError) as e:
        print(f"\n  Plugin build skipped: {e}")

    return jar
