package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TextClassificationRequest {
    private String text;
    private Double threshold;
}
