package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NamedEntityRecognitionResponse {
    private List<String> technology;
    private List<String> concept;
}

