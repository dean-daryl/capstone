import logging

import ctranslate2
from transformers import AutoTokenizer

from app.glossary import get_glossary

logger = logging.getLogger(__name__)

_translator = None
_tokenizer = None

MODEL_DIR = "/app/model"


def load_model() -> None:
    global _translator, _tokenizer
    logger.info("Loading CTranslate2 model from %s ...", MODEL_DIR)
    _translator = ctranslate2.Translator(MODEL_DIR, device="cpu", inter_threads=4)
    logger.info("Loading tokenizer from %s ...", MODEL_DIR)
    _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
    logger.info("Model and tokenizer loaded successfully.")


def get_model():
    if _translator is None:
        raise RuntimeError("Model not loaded. Call load_model() first.")
    return _translator


def get_tokenizer():
    if _tokenizer is None:
        raise RuntimeError("Tokenizer not loaded. Call load_model() first.")
    return _tokenizer


def translate(text: str, src_lang: str = "eng_Latn", tgt_lang: str = "kin_Latn") -> str:
    translator = get_model()
    tokenizer = get_tokenizer()

    tokenizer.src_lang = src_lang
    tokens = tokenizer.tokenize(text)

    # NLLB CTranslate2 format: [src_lang] + tokens + [</s>]
    source = [src_lang] + tokens + ["</s>"]

    results = translator.translate_batch(
        [source],
        target_prefix=[[tgt_lang]],
        beam_size=4,
        max_decoding_length=256,
    )

    output_tokens = results[0].hypotheses[0][1:]  # Skip target language prefix
    token_ids = tokenizer.convert_tokens_to_ids(output_tokens)
    return tokenizer.decode(token_ids, skip_special_tokens=True)


def translate_with_glossary(
    text: str,
    src_lang: str = "eng_Latn",
    tgt_lang: str = "kin_Latn",
    extra_terms: list[str] | None = None,
) -> tuple[str, list[str], str | None]:
    glossary = get_glossary()
    if glossary is None:
        return translate(text, src_lang, tgt_lang), [], None

    protected_text, placeholder_map, detected_subject = glossary.protect(text, extra_terms)
    translated = translate(protected_text, src_lang, tgt_lang)
    restored = glossary.restore(translated, placeholder_map)
    protected_terms = list(placeholder_map.values())
    return restored, protected_terms, detected_subject
