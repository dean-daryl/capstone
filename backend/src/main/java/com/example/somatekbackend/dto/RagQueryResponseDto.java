package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RagQueryResponseDto {
    private UUID queryId;
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
        private String documentUrl;
    }
}
