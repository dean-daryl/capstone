from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_no_model():
    """When model is not loaded, health returns unhealthy."""
    with patch("app.main.get_labels", side_effect=RuntimeError("not loaded")):
        response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unhealthy"
    assert data["model_loaded"] is False


def test_classify_no_model():
    """When model is not loaded, classify returns empty categories."""
    with patch("app.main.classify", side_effect=RuntimeError("not loaded")):
        response = client.post("/classify", json={"text": "hello world"})
    assert response.status_code == 200
    data = response.json()
    assert data["categories"] == []
    assert data["text_snippet"] == "hello world"


def test_classify_truncates_snippet():
    """Text longer than 200 chars is truncated in snippet."""
    long_text = "a" * 300
    with patch("app.main.classify", return_value=[]):
        response = client.post("/classify", json={"text": long_text})
    assert response.status_code == 200
    assert len(response.json()["text_snippet"]) == 200


def test_classify_with_results():
    """When model returns categories, they are returned in the response."""
    mock_results = [
        {"label": "math", "score": 0.95},
        {"label": "algebra", "score": 0.7},
    ]
    with patch("app.main.classify", return_value=mock_results):
        response = client.post("/classify", json={"text": "solve for x", "threshold": 0.5})
    assert response.status_code == 200
    data = response.json()
    assert len(data["categories"]) == 2
    assert data["categories"][0]["label"] == "math"
