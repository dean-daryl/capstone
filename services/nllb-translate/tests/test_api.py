from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app, raise_server_exceptions=False)


def test_health_no_model():
    with patch("app.main.get_model", side_effect=RuntimeError("not loaded")), \
         patch("app.main.get_glossary", return_value=None):
        response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unhealthy"
    assert data["model_loaded"] is False


def test_glossary_endpoint_no_glossary():
    with patch("app.main.get_glossary", return_value=None):
        response = client.get("/glossary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_terms"] == 0


def test_translate_endpoint():
    with patch("app.main.translate_with_glossary", return_value=("Muraho", [], None)):
        response = client.post("/translate", json={"text": "Hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["translated_text"] == "Muraho"
    assert data["src_lang"] == "eng_Latn"
    assert data["tgt_lang"] == "kin_Latn"


def test_translate_with_protect_terms():
    with patch("app.main.translate_with_glossary", return_value=("translated API text", ["API"], "cs")):
        response = client.post("/translate", json={
            "text": "The API is important",
            "protect_terms": ["API"],
        })
    assert response.status_code == 200
    data = response.json()
    assert data["protected_terms"] == ["API"]
    assert data["detected_subject"] == "cs"
