package com.example.somatekbackend.models;

import com.example.somatekbackend.dto.EDocumentStatus;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "rag-documents")
@Getter
@Setter
public class RagDocument {
    @Id
    private String id;

    private String filename;
    private String contentType;
    private long fileSizeBytes;
    private int chunkCount;
    private EDocumentStatus status;
    private String errorMessage;
    private List<String> vectorIds;
    private String minioObjectName;
    private String courseId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
