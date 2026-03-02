package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.RagDocument;

import java.util.List;
import java.util.Optional;

public interface DocumentMetadataStore {
    RagDocument save(RagDocument document);

    Optional<RagDocument> findById(String id);

    List<RagDocument> findAll();

    List<RagDocument> findAllByOrderByCreatedAtDesc();

    List<RagDocument> findByStatus(EDocumentStatus status);

    void deleteById(String id);

    long count();
}
