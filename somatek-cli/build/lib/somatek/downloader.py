"""Download models, JRE, and locate backend JAR."""

import platform
import shutil
import subprocess
import sys
from pathlib import Path

from somatek.config import RUNTIME_DIR


def download_file(url: str, dest: Path, label: str = "") -> None:
    """Download a file with progress display using curl."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  Downloading {label or dest.name}...")
    result = subprocess.run(
        ["curl", "-fSL", "--progress-bar", "-o", str(dest), url],
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(f"Failed to download {url}")
    print(f"  Downloaded: {dest.name}")


def download_jre(target_dir: Path | None = None) -> Path:
    """Download a portable JRE 21 for the current platform.

    Returns the path to the java binary.
    """
    jre_dir = (target_dir or RUNTIME_DIR) / "jre"
    java_bin = jre_dir / "bin" / "java"

    if java_bin.exists():
        print("  JRE already downloaded.")
        return java_bin

    system = platform.system().lower()
    arch = platform.machine().lower()

    # Map architecture names
    if arch in ("x86_64", "amd64"):
        arch_label = "x64"
    elif arch in ("aarch64", "arm64"):
        arch_label = "aarch64"
    else:
        raise RuntimeError(f"Unsupported architecture: {arch}")

    if system == "darwin":
        os_label = "mac"
    elif system == "linux":
        os_label = "linux"
    else:
        raise RuntimeError(f"Unsupported OS: {system}. Use Linux or macOS.")

    # Adoptium JRE 21 URL
    url = (
        f"https://api.adoptium.net/v3/binary/latest/21/ga/"
        f"{os_label}/{arch_label}/jre/hotspot/normal/eclipse"
    )

    archive = RUNTIME_DIR / f"jre-{os_label}-{arch_label}.tar.gz"
    download_file(url, archive, "JRE 21")

    # Extract
    print("  Extracting JRE...")
    jre_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["tar", "xzf", str(archive), "-C", str(jre_dir), "--strip-components=1"],
        check=True,
    )
    archive.unlink()

    if not java_bin.exists():
        # On macOS, the structure may include Contents/Home
        mac_java = jre_dir / "Contents" / "Home" / "bin" / "java"
        if mac_java.exists():
            # Restructure: move Contents/Home/* up to jre_dir
            import shutil

            contents_home = jre_dir / "Contents" / "Home"
            for item in contents_home.iterdir():
                dest = jre_dir / item.name
                if dest.exists():
                    if dest.is_dir():
                        shutil.rmtree(dest)
                    else:
                        dest.unlink()
                shutil.move(str(item), str(dest))
            shutil.rmtree(jre_dir / "Contents")

    if not java_bin.exists():
        raise RuntimeError("JRE extraction failed: java binary not found")

    print(f"  JRE installed at: {jre_dir}")
    return java_bin


# JAR filename built by Maven
_JAR_NAME = "somatekai-0.0.1-SNAPSHOT.jar"


def _candidate_jar_paths() -> list[Path]:
    """Return a list of paths where the backend JAR might live.

    Searches relative to:
      1. The CLI package location  (somatek-cli/somatek/ → ../../backend/target/)
      2. The current working directory  (./backend/target/)
      3. Alongside the CLI package      (somatek-cli/backend.jar)
      4. Already installed              (~/.somatek/runtime/backend.jar)
    """
    cli_pkg = Path(__file__).resolve().parent          # …/somatek-cli/somatek/
    cli_root = cli_pkg.parent                          # …/somatek-cli/
    project_root = cli_root.parent                     # …/somatek/

    return [
        # Built by Maven in the same mono-repo
        project_root / "backend" / "target" / _JAR_NAME,
        # CWD-relative (if user runs from project root)
        Path.cwd() / "backend" / "target" / _JAR_NAME,
        # Manually placed next to the CLI
        cli_root / "backend.jar",
        cli_root / _JAR_NAME,
        # Already in the runtime directory
        RUNTIME_DIR / "backend.jar",
    ]


def locate_and_install_jar() -> Path:
    """Find the backend JAR and copy it to ~/.somatek/runtime/backend.jar.

    Returns the destination path.
    """
    dest = RUNTIME_DIR / "backend.jar"

    # Already installed — check it's a real file (not empty)
    if dest.exists() and dest.stat().st_size > 0:
        print(f"  Backend JAR already installed ({dest.stat().st_size // (1024*1024)} MB)")
        return dest

    for candidate in _candidate_jar_paths():
        if candidate == dest:
            continue
        if candidate.exists() and candidate.stat().st_size > 0:
            dest.parent.mkdir(parents=True, exist_ok=True)
            print(f"  Found JAR: {candidate}")
            print(f"  Copying to {dest}...")
            shutil.copy2(str(candidate), str(dest))
            print(f"  Backend JAR installed ({dest.stat().st_size // (1024*1024)} MB)")
            return dest

    # Not found anywhere
    raise FileNotFoundError(
        f"Backend JAR not found. Searched:\n"
        + "\n".join(f"  - {p}" for p in _candidate_jar_paths())
        + f"\n\nBuild it first:\n"
        f"  cd backend && mvn clean package -DskipTests\n"
        f"Or copy it manually:\n"
        f"  cp <path-to-jar> {dest}"
    )
