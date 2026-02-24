package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DocumentUploadResponseDto;
import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.RagQueryResponseDto;
import com.example.somatekbackend.models.RagDocument;
import com.example.somatekbackend.repository.IRagDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class DocumentService implements IDocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    private final VectorStore vectorStore;
    private final ChatClient ragChatClient;
    private final TokenTextSplitter tokenTextSplitter;
    private final IRagDocumentRepository ragDocumentRepository;
    private final IMinioService minioService;

    @Value("${rag.search.top-k:8}")
    private int topK;

    @Value("${rag.search.similarity-threshold:0.3}")
    private double similarityThreshold;

    public DocumentService(VectorStore vectorStore,
                           @Qualifier("ragChatClient") ChatClient ragChatClient,
                           TokenTextSplitter tokenTextSplitter,
                           IRagDocumentRepository ragDocumentRepository,
                           IMinioService minioService) {
        this.vectorStore = vectorStore;
        this.ragChatClient = ragChatClient;
        this.tokenTextSplitter = tokenTextSplitter;
        this.ragDocumentRepository = ragDocumentRepository;
        this.minioService = minioService;
    }

    @Override
    public DocumentUploadResponseDto uploadDocument(MultipartFile file) {
        validateFileType(file);

        RagDocument ragDocument = new RagDocument();
        ragDocument.setFilename(file.getOriginalFilename());
        ragDocument.setContentType(file.getContentType());
        ragDocument.setFileSizeBytes(file.getSize());
        ragDocument.setStatus(EDocumentStatus.UPLOADING);
        ragDocument.setCreatedAt(LocalDateTime.now());
        ragDocument.setUpdatedAt(LocalDateTime.now());
        ragDocumentRepository.save(ragDocument);

        try {
            ragDocument.setStatus(EDocumentStatus.PROCESSING);
            ragDocumentRepository.save(ragDocument);

            // Store original file in MinIO
            String objectName = ragDocument.getId() + "/" + file.getOriginalFilename();
            minioService.uploadFile(objectName, file);
            ragDocument.setMinioObjectName(objectName);

            // Parse file with Tika
            TikaDocumentReader reader = new TikaDocumentReader(
                    new InputStreamResource(file.getInputStream()));
            List<Document> documents = reader.get();

            // Chunk documents
            List<Document> chunks = tokenTextSplitter.apply(documents);

            // Add metadata to each chunk
            for (Document chunk : chunks) {
                chunk.getMetadata().put("documentId", ragDocument.getId());
                chunk.getMetadata().put("filename", ragDocument.getFilename());
            }

            // Store in vector store (auto-embeds via Ollama and stores in Qdrant)
            vectorStore.add(chunks);

            // Collect vector IDs
            List<String> vectorIds = new ArrayList<>();
            for (Document chunk : chunks) {
                vectorIds.add(chunk.getId());
            }

            ragDocument.setVectorIds(vectorIds);
            ragDocument.setChunkCount(chunks.size());
            ragDocument.setStatus(EDocumentStatus.COMPLETED);
            ragDocument.setUpdatedAt(LocalDateTime.now());
            ragDocumentRepository.save(ragDocument);

            return new DocumentUploadResponseDto(
                    ragDocument.getId(),
                    ragDocument.getFilename(),
                    ragDocument.getStatus(),
                    ragDocument.getChunkCount(),
                    "Document uploaded and processed successfully"
            );
        } catch (Exception e) {
            logger.error("Failed to process document: {}", file.getOriginalFilename(), e);
            ragDocument.setStatus(EDocumentStatus.FAILED);
            ragDocument.setErrorMessage(e.getMessage());
            ragDocument.setUpdatedAt(LocalDateTime.now());
            ragDocumentRepository.save(ragDocument);

            throw new RuntimeException("Failed to process document: " + e.getMessage(), e);
        }
    }

    @Override
    public RagQueryResponseDto queryDocuments(RagQueryRequestDto request) {
        String question = request.getQuestion();

        // First, check what the vector store actually returns (without threshold for debugging)
        List<Document> debugDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .similarityThreshold(0.0)
                        .build());
        logger.info("Query: '{}' - Found {} documents with no threshold filter", question, debugDocs.size());
        for (Document doc : debugDocs) {
            logger.info("  -> score={}, text={}...", doc.getMetadata().get("distance"),
                    doc.getText().substring(0, Math.min(100, doc.getText().length())));
        }

        // Use the RAG ChatClient (QuestionAnswerAdvisor handles embed -> search -> augment -> LLM)
        String answer = ragChatClient.prompt()
                .user(question)
                .call()
                .content();

        // Separately retrieve source chunks for reference
        List<Document> relevantDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .similarityThreshold(similarityThreshold)
                        .build());

        List<RagQueryResponseDto.SourceChunk> sources = new ArrayList<>();
        for (Document doc : relevantDocs) {
            RagQueryResponseDto.SourceChunk source = new RagQueryResponseDto.SourceChunk();
            String documentId = (String) doc.getMetadata().get("documentId");
            source.setDocumentId(documentId);
            source.setFilename((String) doc.getMetadata().get("filename"));
            source.setChunkText(doc.getText());
            Object score = doc.getMetadata().get("distance");
            if (score instanceof Number) {
                source.setScore(((Number) score).doubleValue());
            }

            // Populate presigned URL for the source document
            if (documentId != null) {
                try {
                    RagDocument ragDoc = ragDocumentRepository.findById(documentId).orElse(null);
                    if (ragDoc != null && ragDoc.getMinioObjectName() != null) {
                        // Check if object exists in MinIO before generating URL
                        if (minioService.objectExists(ragDoc.getMinioObjectName())) {
                            source.setDocumentUrl(minioService.getPresignedUrl(ragDoc.getMinioObjectName()));
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Could not generate presigned URL for document {}: {}", documentId, e.getMessage());
                }
            }

            sources.add(source);
        }

        return new RagQueryResponseDto(answer, sources);
    }

    @Override
    public List<RagDocument> getAllDocuments() {
        return ragDocumentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public RagDocument getDocumentById(String id) {
        return ragDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found: " + id));
    }

    @Override
    public void deleteDocument(String id) {
        RagDocument ragDocument = getDocumentById(id);

        // Remove vectors from Qdrant
        if (ragDocument.getVectorIds() != null && !ragDocument.getVectorIds().isEmpty()) {
            vectorStore.delete(ragDocument.getVectorIds());
        }

        // Remove file from MinIO
        if (ragDocument.getMinioObjectName() != null) {
            try {
                minioService.deleteObject(ragDocument.getMinioObjectName());
            } catch (Exception e) {
                logger.warn("Could not delete MinIO object {}: {}", ragDocument.getMinioObjectName(), e.getMessage());
            }
        }

        // Remove MongoDB record
        ragDocumentRepository.deleteById(id);
    }

    @Override
    public String getDocumentViewUrl(String id) {
        RagDocument ragDocument = getDocumentById(id);
        if (ragDocument.getMinioObjectName() == null) {
            throw new RuntimeException("Document has no stored file: " + id);
        }
        if (!minioService.objectExists(ragDocument.getMinioObjectName())) {
            throw new RuntimeException("Document file not found in storage: " + ragDocument.getFilename());
        }
        return minioService.getPresignedUrl(ragDocument.getMinioObjectName());
    }

    private void validateFileType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty or null");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + contentType +
                            ". Allowed types: PDF, TXT, DOCX, PPTX");
        }
    }
}
