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

            // Hard cap: truncate any chunk over 2000 chars (~500 tokens in any tokenizer)
            int maxCharsPerChunk = 2000;
            for (int j = 0; j < chunks.size(); j++) {
                String text = chunks.get(j).getText();
                if (text != null && text.length() > maxCharsPerChunk) {
                    logger.warn("Truncating oversized chunk ({} chars) for document: {}", text.length(), filename);
                    chunks.set(j, chunks.get(j).mutate().text(text.substring(0, maxCharsPerChunk)).build());
                }
            }

            // Store in vector store in batches of 20 (Ollama embeds each text independently)
            int batchSize = 20;
            List<String> vectorIds = new ArrayList<>();
            int skipped = 0;
            for (int i = 0; i < chunks.size(); i += batchSize) {
                List<Document> batch = chunks.subList(i, Math.min(i + batchSize, chunks.size()));
                try {
                    vectorStore.add(batch);
                    for (Document doc : batch) {
                        vectorIds.add(doc.getId());
                    }
                } catch (Exception ex) {
                    // Batch failed — fall back to one-by-one for this batch
                    for (Document doc : batch) {
                        try {
                            vectorStore.add(List.of(doc));
                            vectorIds.add(doc.getId());
                        } catch (Exception ex2) {
                            skipped++;
                            logger.warn("Skipping chunk for document {} — embedding failed: {}",
                                    filename, ex2.getMessage());
                        }
                    }
                }
                int processed = Math.min(i + batchSize, chunks.size());
                logger.info("Embedded {}/{} chunks (skipped {}) for document: {}",
                        processed, chunks.size(), skipped, filename);
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
