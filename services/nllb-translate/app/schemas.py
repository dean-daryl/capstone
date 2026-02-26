from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    text: str
    src_lang: str = Field(default="eng_Latn")
    tgt_lang: str = Field(default="kin_Latn")


class TranslateResponse(BaseModel):
    translated_text: str
    src_lang: str
    tgt_lang: str
