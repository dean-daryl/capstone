import json
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

GLOSSARY_PATH = Path("/app/glossary.json")

_glossary = None


class GlossaryProtector:
    MIN_HITS_FOR_DETECTION = 2

    def __init__(self, glossary_data: dict):
        self._categories = glossary_data.get("categories", {})
        self._context_terms: dict[str, list[str]] = glossary_data.get("context_terms", {})
        self._all_terms: list[str] = []
        self._pattern: re.Pattern | None = None
        self._load()

    def _load(self) -> None:
        seen = set()
        for terms in self._categories.values():
            for term in terms:
                lower = term.lower()
                if lower not in seen:
                    seen.add(lower)
                    self._all_terms.append(term)

        # Sort longest-first so multi-word terms match before sub-terms
        self._all_terms.sort(key=len, reverse=True)

        if self._all_terms:
            escaped = [re.escape(t) for t in self._all_terms]
            self._pattern = re.compile(
                r"\b(?:" + "|".join(escaped) + r")\b",
                re.IGNORECASE,
            )

        logger.info(
            "Glossary loaded: %d unique terms from %d categories",
            len(self._all_terms),
            len(self._categories),
        )

    def detect_subject(self, text: str) -> str | None:
        text_lower = text.lower()
        category_hits: dict[str, int] = {}

        for category, terms in self._categories.items():
            count = 0
            for term in terms:
                pattern = re.compile(r"\b" + re.escape(term) + r"\b", re.IGNORECASE)
                if pattern.search(text_lower):
                    count += 1
            if count > 0:
                category_hits[category] = count

        if not category_hits:
            return None

        best_category = max(category_hits, key=category_hits.get)
        if category_hits[best_category] < self.MIN_HITS_FOR_DETECTION:
            return None

        return best_category

    def protect(
        self, text: str, extra_terms: list[str] | None = None
    ) -> tuple[str, dict[str, str], str | None]:
        detected_subject: str | None = None

        # When extra_terms are explicitly provided, use those (no auto-detection).
        # Otherwise, auto-detect the subject and merge in context terms.
        if extra_terms:
            additional_terms = extra_terms
        else:
            detected_subject = self.detect_subject(text)
            additional_terms = (
                list(self._context_terms.get(detected_subject, []))
                if detected_subject
                else []
            )

        pattern = self._pattern

        # Build a combined pattern if additional terms exist
        if additional_terms:
            combined = list(self._all_terms)
            seen = {t.lower() for t in self._all_terms}
            for term in additional_terms:
                if term.lower() not in seen:
                    combined.append(term)
                    seen.add(term.lower())
            combined.sort(key=len, reverse=True)
            escaped = [re.escape(t) for t in combined]
            pattern = re.compile(
                r"\b(?:" + "|".join(escaped) + r")\b",
                re.IGNORECASE,
            )

        if not pattern:
            return text, {}, detected_subject

        placeholder_map: dict[str, str] = {}
        counter = 0

        def _replace(match: re.Match) -> str:
            nonlocal counter
            original = match.group(0)
            placeholder = f"XGLOSS{counter}X"
            placeholder_map[placeholder] = original
            counter += 1
            return placeholder

        protected = pattern.sub(_replace, text)
        return protected, placeholder_map, detected_subject

    def restore(self, text: str, placeholder_map: dict[str, str]) -> str:
        for placeholder, original in placeholder_map.items():
            text = text.replace(placeholder, original)
        return text

    def get_glossary_info(self) -> dict:
        return {
            "total_terms": len(self._all_terms),
            "categories": {
                name: {"term_count": len(terms), "terms": sorted(terms)}
                for name, terms in self._categories.items()
            },
            "context_terms": {
                name: sorted(terms)
                for name, terms in self._context_terms.items()
            },
        }


def load_glossary() -> None:
    global _glossary
    if not GLOSSARY_PATH.exists():
        logger.warning("Glossary file not found at %s", GLOSSARY_PATH)
        return
    with open(GLOSSARY_PATH) as f:
        data = json.load(f)
    _glossary = GlossaryProtector(data)


def get_glossary() -> GlossaryProtector | None:
    return _glossary
