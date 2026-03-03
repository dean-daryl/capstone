import logging

from fastapi import FastAPI

from app.model import classify, get_labels, load_model
from app.schemas import CategoryScore, ClassifyRequest, ClassifyResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TextCat Service", version="1.0.0")


@app.on_event("startup")
def startup():
    try:
        load_model()
    except Exception as e:
        logger.warning("TextCat model not available at startup: %s. Service will return empty results.", e)


@app.post("/classify", response_model=ClassifyResponse)
def classify_text(request: ClassifyRequest):
    try:
        results = classify(request.text, request.threshold)
    except RuntimeError:
        logger.warning("TextCat model not loaded — returning empty categories.")
        results = []
    snippet = request.text[:200] if len(request.text) > 200 else request.text
    return ClassifyResponse(
        categories=[CategoryScore(**r) for r in results],
        text_snippet=snippet,
    )


@app.get("/health")
def health():
    try:
        labels = get_labels()
        return {
            "status": "healthy",
            "model_loaded": True,
            "label_count": len(labels),
        }
    except RuntimeError:
        return {"status": "unhealthy", "model_loaded": False, "label_count": 0}
