from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    text: str
    src_lang: str = Field(default="eng_Latn")
    tgt_lang: str = Field(default="kin_Latn")
    protect_terms: list[str] = Field(
        default=[],
        description="Additional terms to protect from translation for this request",
    )


class TranslateResponse(BaseModel):
    translated_text: str
    src_lang: str
    tgt_lang: str
    protected_terms: list[str] = []
    detected_subject: str | None = None


class GlossaryCategoryInfo(BaseModel):
    term_count: int
    terms: list[str]


class GlossaryResponse(BaseModel):
    total_terms: int
    categories: dict[str, GlossaryCategoryInfo]
    context_terms: dict[str, list[str]] = {}
