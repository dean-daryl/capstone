package com.example.somatekbackend.service.storage;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.RagDocument;
import com.example.somatekbackend.repository.IRagDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@Profile("!local")
@RequiredArgsConstructor
public class MongoDocumentMetadataStore implements DocumentMetadataStore {

    private final IRagDocumentRepository repository;

    @Override
    public RagDocument save(RagDocument document) {
        return repository.save(document);
    }

    @Override
    public Optional<RagDocument> findById(String id) {
        return repository.findById(id);
    }

    @Override
    public List<RagDocument> findAll() {
        return repository.findAll();
    }

    @Override
    public List<RagDocument> findAllByOrderByCreatedAtDesc() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<RagDocument> findByStatus(EDocumentStatus status) {
        return repository.findByStatus(status);
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    @Override
    public long count() {
        return repository.count();
    }
}
