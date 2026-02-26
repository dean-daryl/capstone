package com.example.somatekbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TranslateResponseDto {
    @JsonProperty("translated_text")
    private String translatedText;

    @JsonProperty("src_lang")
    private String srcLang;

    @JsonProperty("tgt_lang")
    private String tgtLang;
}
