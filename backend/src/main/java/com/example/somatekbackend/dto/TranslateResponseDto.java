package com.example.somatekbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TranslateResponseDto {
    @JsonProperty("translated_text")
    private String translatedText;

    @JsonProperty("src_lang")
    private String srcLang;

    @JsonProperty("tgt_lang")
    private String tgtLang;

    @JsonProperty("protected_terms")
    private List<String> protectedTerms = new ArrayList<>();

    @JsonProperty("detected_subject")
    private String detectedSubject;
}
