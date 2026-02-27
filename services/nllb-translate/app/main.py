import logging

from fastapi import FastAPI

from app.glossary import get_glossary, load_glossary
from app.model import get_model, load_model, translate_with_glossary
from app.schemas import GlossaryResponse, TranslateRequest, TranslateResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NLLB Translation Service", version="1.0.0")


@app.on_event("startup")
def startup():
    load_model()
    load_glossary()


@app.post("/translate", response_model=TranslateResponse)
def translate_text(request: TranslateRequest):
    translated, protected_terms, detected_subject = translate_with_glossary(
        request.text,
        request.src_lang,
        request.tgt_lang,
        request.protect_terms or None,
    )
    return TranslateResponse(
        translated_text=translated,
        src_lang=request.src_lang,
        tgt_lang=request.tgt_lang,
        protected_terms=protected_terms,
        detected_subject=detected_subject,
    )


@app.get("/glossary", response_model=GlossaryResponse)
def glossary_info():
    glossary = get_glossary()
    if glossary is None:
        return GlossaryResponse(total_terms=0, categories={})
    return glossary.get_glossary_info()


@app.get("/health")
def health():
    model_loaded = False
    glossary_loaded = False
    try:
        get_model()
        model_loaded = True
    except RuntimeError:
        pass
    glossary_loaded = get_glossary() is not None
    status = "healthy" if model_loaded else "unhealthy"
    return {
        "status": status,
        "model_loaded": model_loaded,
        "glossary_loaded": glossary_loaded,
    }
