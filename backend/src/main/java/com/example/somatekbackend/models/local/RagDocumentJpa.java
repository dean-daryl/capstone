package com.example.somatekbackend.models.local;

import com.example.somatekbackend.dto.EDocumentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rag_documents")
@Getter
@Setter
public class RagDocumentJpa {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String filename;
    private String contentType;
    private long fileSizeBytes;
    private int chunkCount;

    @Enumerated(EnumType.STRING)
    private EDocumentStatus status;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String vectorIdsJson;

    private String minioObjectName;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
