package com.example.somatekbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TextClassificationResponse {

    private List<CategoryScore> categories;

    @JsonProperty("text_snippet")
    private String textSnippet;

    @Getter
    @Setter
    public static class CategoryScore {
        private String label;
        private Double score;
    }
}
