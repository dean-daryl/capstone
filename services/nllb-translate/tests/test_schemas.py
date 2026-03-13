import pytest
from pydantic import ValidationError

from app.schemas import TranslateRequest, TranslateResponse, GlossaryResponse


def test_translate_request_defaults():
    req = TranslateRequest(text="hello")
    assert req.src_lang == "eng_Latn"
    assert req.tgt_lang == "kin_Latn"
    assert req.protect_terms == []


def test_translate_request_custom_langs():
    req = TranslateRequest(text="bonjour", src_lang="fra_Latn", tgt_lang="eng_Latn")
    assert req.src_lang == "fra_Latn"
    assert req.tgt_lang == "eng_Latn"


def test_translate_request_missing_text():
    with pytest.raises(ValidationError):
        TranslateRequest()


def test_translate_response():
    resp = TranslateResponse(
        translated_text="Muraho",
        src_lang="eng_Latn",
        tgt_lang="kin_Latn",
    )
    assert resp.translated_text == "Muraho"
    assert resp.protected_terms == []
    assert resp.detected_subject is None


def test_glossary_response_empty():
    resp = GlossaryResponse(total_terms=0, categories={})
    assert resp.total_terms == 0
    assert resp.context_terms == {}
