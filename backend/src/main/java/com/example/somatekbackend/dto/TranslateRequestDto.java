package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TranslateRequestDto {
    private String text;
    private String srcLang = "eng_Latn";
    private String tgtLang = "kin_Latn";
    private List<String> protectTerms = new ArrayList<>();
}
