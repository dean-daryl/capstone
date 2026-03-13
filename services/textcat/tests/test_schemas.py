import pytest
from pydantic import ValidationError

from app.schemas import CategoryScore, ClassifyRequest, ClassifyResponse


def test_classify_request_defaults():
    req = ClassifyRequest(text="hello world")
    assert req.text == "hello world"
    assert req.threshold == 0.5


def test_classify_request_custom_threshold():
    req = ClassifyRequest(text="test", threshold=0.8)
    assert req.threshold == 0.8


def test_classify_request_invalid_threshold():
    with pytest.raises(ValidationError):
        ClassifyRequest(text="test", threshold=1.5)


def test_classify_request_missing_text():
    with pytest.raises(ValidationError):
        ClassifyRequest()


def test_classify_response():
    resp = ClassifyResponse(
        categories=[CategoryScore(label="math", score=0.9)],
        text_snippet="some text",
    )
    assert len(resp.categories) == 1
    assert resp.categories[0].label == "math"
    assert resp.text_snippet == "some text"
