"""PyInstaller entry point for the NLLB translation service."""

import os
import sys


def main():
    # Resolve bundled glossary.json when running as frozen binary
    if getattr(sys, "frozen", False):
        bundle_dir = sys._MEIPASS
        glossary = os.path.join(bundle_dir, "glossary.json")
        if os.path.isfile(glossary):
            os.environ.setdefault("NLLB_GLOSSARY_PATH", glossary)

    # NLLB_MODEL_DIR is required
    model_dir = os.environ.get("NLLB_MODEL_DIR", "")
    if not model_dir or not os.path.isdir(model_dir):
        print(
            "ERROR: NLLB_MODEL_DIR must be set to a valid directory "
            "containing the CTranslate2 model files.",
            file=sys.stderr,
        )
        sys.exit(1)

    host = os.environ.get("NLLB_HOST", "127.0.0.1")
    port = int(os.environ.get("NLLB_PORT", "8002"))

    import uvicorn

    uvicorn.run("app.main:app", host=host, port=port, log_level="info")


if __name__ == "__main__":
    main()
