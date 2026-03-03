import logging
import os
import re

import spacy

logger = logging.getLogger(__name__)

_nlp = None


def load_model(model_path: str = None) -> None:
    if model_path is None:
        model_path = os.environ.get("TEXTCAT_MODEL_DIR", "/app/model")
    global _nlp
    logger.info("Loading spaCy model from %s ...", model_path)
    try:
        _nlp = spacy.load(model_path)
        logger.info("Model loaded. Labels: %s", get_labels())
    except Exception as e:
        _nlp = None
        logger.warning("Failed to load textcat model from %s: %s. Service will return empty results.", model_path, e)


def get_nlp():
    if _nlp is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _nlp


def get_labels() -> list[str]:
    return list(get_nlp().get_pipe("textcat_multilabel").labels)


def normalize_label(raw_label: str) -> str:
    """Normalize label from |calculus|integration| to calculus > integration."""
    stripped = raw_label.strip("|")
    parts = [p.replace("-", " ") for p in stripped.split("|")]
    return " > ".join(parts)


def classify(text: str, threshold: float = 0.5) -> list[dict]:
    nlp = get_nlp()
    doc = nlp(text)
    results = []
    for label, score in doc.cats.items():
        if score >= threshold:
            results.append({
                "label": normalize_label(label),
                "score": round(score, 4),
            })
    results.sort(key=lambda x: x["score"], reverse=True)
    return results
