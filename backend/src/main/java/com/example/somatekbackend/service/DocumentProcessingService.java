package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.models.RagDocument;
import com.example.somatekbackend.service.storage.DocumentMetadataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentProcessingService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentProcessingService.class);

    private final VectorStore vectorStore;
    private final TokenTextSplitter tokenTextSplitter;
    private final DocumentMetadataStore documentMetadataStore;

    public DocumentProcessingService(VectorStore vectorStore,
                                     TokenTextSplitter tokenTextSplitter,
                                     DocumentMetadataStore documentMetadataStore) {
        this.vectorStore = vectorStore;
        this.tokenTextSplitter = tokenTextSplitter;
        this.documentMetadataStore = documentMetadataStore;
    }

    @Async("documentProcessingExecutor")
    public void processDocument(String documentId, byte[] fileBytes, String filename, String contentType) {
        logger.info("Starting async processing for document: {} ({})", filename, documentId);

        RagDocument ragDocument = documentMetadataStore.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        try {
            // Parse file with Tika using byte array
            ByteArrayResource resource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };
            TikaDocumentReader reader = new TikaDocumentReader(resource);
            List<Document> documents = reader.get();

            // Chunk documents
            List<Document> chunks = tokenTextSplitter.apply(documents);

            // Add metadata to each chunk
            for (Document chunk : chunks) {
                chunk.getMetadata().put("documentId", ragDocument.getId());
                chunk.getMetadata().put("filename", ragDocument.getFilename());
            }

            // Store in vector store one chunk at a time to avoid exceeding embedding context length
            List<String> vectorIds = new ArrayList<>();
            for (int i = 0; i < chunks.size(); i++) {
                vectorStore.add(List.of(chunks.get(i)));
                vectorIds.add(chunks.get(i).getId());
                if ((i + 1) % 50 == 0 || i == chunks.size() - 1) {
                    logger.info("Embedded {}/{} chunks for document: {}", i + 1, chunks.size(), filename);
                }
            }

            ragDocument.setVectorIds(vectorIds);
            ragDocument.setChunkCount(chunks.size());
            ragDocument.setStatus(EDocumentStatus.COMPLETED);
            ragDocument.setUpdatedAt(LocalDateTime.now());
            documentMetadataStore.save(ragDocument);

            logger.info("Async processing completed for document: {} ({} chunks)", filename, chunks.size());
        } catch (Exception e) {
            logger.error("Async processing failed for document: {}", filename, e);
            ragDocument.setStatus(EDocumentStatus.FAILED);
            ragDocument.setErrorMessage(e.getMessage());
            ragDocument.setUpdatedAt(LocalDateTime.now());
            documentMetadataStore.save(ragDocument);
        }
    }
}
