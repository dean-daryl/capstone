package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TranslateRequestDto {
    private String text;
    private String srcLang = "eng_Latn";
    private String tgtLang = "kin_Latn";
}
