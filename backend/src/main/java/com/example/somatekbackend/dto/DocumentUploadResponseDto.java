package com.example.somatekbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadResponseDto {
    private String documentId;
    private String filename;
    private EDocumentStatus status;
    private int chunkCount;
    private String message;
}
