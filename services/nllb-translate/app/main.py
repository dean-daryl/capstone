import logging

from fastapi import FastAPI

from app.model import load_model, translate, get_model
from app.schemas import TranslateRequest, TranslateResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NLLB Translation Service", version="1.0.0")


@app.on_event("startup")
def startup():
    load_model()


@app.post("/translate", response_model=TranslateResponse)
def translate_text(request: TranslateRequest):
    translated = translate(request.text, request.src_lang, request.tgt_lang)
    return TranslateResponse(
        translated_text=translated,
        src_lang=request.src_lang,
        tgt_lang=request.tgt_lang,
    )


@app.get("/health")
def health():
    try:
        get_model()
        return {"status": "healthy", "model_loaded": True}
    except RuntimeError:
        return {"status": "unhealthy", "model_loaded": False}
