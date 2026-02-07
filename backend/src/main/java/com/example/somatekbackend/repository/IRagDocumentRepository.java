package com.example.somatekbackend.repository;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.RagDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRagDocumentRepository extends MongoRepository<RagDocument, String> {
    List<RagDocument> findByStatus(EDocumentStatus status);

    List<RagDocument> findAllByOrderByCreatedAtDesc();
}
