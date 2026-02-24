package com.example.somatekbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class TextClassificationResponse {
    private List<CategoryScore> categories;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CategoryScore {
        private String label;
        private Double score;
    }
}
