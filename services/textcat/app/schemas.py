from pydantic import BaseModel, Field


class ClassifyRequest(BaseModel):
    text: str
    threshold: float = Field(default=0.5, ge=0.0, le=1.0)


class CategoryScore(BaseModel):
    label: str
    score: float


class ClassifyResponse(BaseModel):
    categories: list[CategoryScore]
    text_snippet: str
