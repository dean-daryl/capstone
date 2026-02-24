package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TextClassificationRequest {
    private String text;
    private Double threshold;
}
