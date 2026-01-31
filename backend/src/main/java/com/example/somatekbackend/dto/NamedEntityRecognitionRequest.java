package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NamedEntityRecognitionRequest {
    private String text;
    private List<String> labels;
}
