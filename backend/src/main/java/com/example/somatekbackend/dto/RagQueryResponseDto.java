package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RagQueryResponseDto {
    private String answer;
    private List<SourceChunk> sources;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SourceChunk {
        private String documentId;
        private String filename;
        private String chunkText;
        private double score;
    }
}
