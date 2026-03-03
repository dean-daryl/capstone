package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.RagDocument;
import com.example.somatekbackend.models.local.RagDocumentJpa;
import com.example.somatekbackend.repository.local.IRagDocumentJpaRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Profile("local")
@RequiredArgsConstructor
public class JpaDocumentMetadataStore implements DocumentMetadataStore {

    private final IRagDocumentJpaRepository repository;
    private final ObjectMapper objectMapper;

    @Override
    public RagDocument save(RagDocument document) {
        RagDocumentJpa jpa = toJpa(document);
        RagDocumentJpa saved = repository.save(jpa);
        return toMongo(saved);
    }

    @Override
    public Optional<RagDocument> findById(String id) {
        return repository.findById(id).map(this::toMongo);
    }

    @Override
    public List<RagDocument> findAll() {
        return repository.findAll().stream().map(this::toMongo).collect(Collectors.toList());
    }

    @Override
    public List<RagDocument> findAllByOrderByCreatedAtDesc() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::toMongo).collect(Collectors.toList());
    }

    @Override
    public List<RagDocument> findByStatus(EDocumentStatus status) {
        return repository.findByStatus(status).stream().map(this::toMongo).collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    @Override
    public long count() {
        return repository.count();
    }

    @Override
    public List<RagDocument> findByCourseId(String courseId) {
        return repository.findByCourseId(courseId).stream().map(this::toMongo).collect(Collectors.toList());
    }

    private RagDocumentJpa toJpa(RagDocument doc) {
        RagDocumentJpa jpa = new RagDocumentJpa();
        jpa.setId(doc.getId());
        jpa.setFilename(doc.getFilename());
        jpa.setContentType(doc.getContentType());
        jpa.setFileSizeBytes(doc.getFileSizeBytes());
        jpa.setChunkCount(doc.getChunkCount());
        jpa.setStatus(doc.getStatus());
        jpa.setErrorMessage(doc.getErrorMessage());
        jpa.setMinioObjectName(doc.getMinioObjectName());
        jpa.setCourseId(doc.getCourseId());
        jpa.setCreatedAt(doc.getCreatedAt());
        jpa.setUpdatedAt(doc.getUpdatedAt());
        if (doc.getVectorIds() != null) {
            try {
                jpa.setVectorIdsJson(objectMapper.writeValueAsString(doc.getVectorIds()));
            } catch (JsonProcessingException e) {
                jpa.setVectorIdsJson("[]");
            }
        }
        return jpa;
    }

    private RagDocument toMongo(RagDocumentJpa jpa) {
        RagDocument doc = new RagDocument();
        doc.setId(jpa.getId());
        doc.setFilename(jpa.getFilename());
        doc.setContentType(jpa.getContentType());
        doc.setFileSizeBytes(jpa.getFileSizeBytes());
        doc.setChunkCount(jpa.getChunkCount());
        doc.setStatus(jpa.getStatus());
        doc.setErrorMessage(jpa.getErrorMessage());
        doc.setMinioObjectName(jpa.getMinioObjectName());
        doc.setCourseId(jpa.getCourseId());
        doc.setCreatedAt(jpa.getCreatedAt());
        doc.setUpdatedAt(jpa.getUpdatedAt());
        if (jpa.getVectorIdsJson() != null) {
            try {
                doc.setVectorIds(objectMapper.readValue(jpa.getVectorIdsJson(), new TypeReference<List<String>>() {}));
            } catch (JsonProcessingException e) {
                doc.setVectorIds(Collections.emptyList());
            }
        }
        return doc;
    }
}
