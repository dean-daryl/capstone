package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DocumentUploadResponseDto;
import com.example.somatekbackend.dto.EDocumentStatus;
import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.RagQueryResponseDto;
import com.example.somatekbackend.models.RagDocument;
import com.example.somatekbackend.service.storage.DocumentMetadataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
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

    private static final String SYSTEM_PROMPT = """
            You are a helpful assistant that explains technical documents in simple English.
            Always respond in English. Translate any non-English text to English.
            Explain concepts in your own words — never copy text verbatim.
            Only use information from the provided context. If no relevant context exists, say so.
            """;

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final TokenTextSplitter tokenTextSplitter;
    private final DocumentMetadataStore documentMetadataStore;
    private final IMinioService minioService;
    private final DocumentProcessingService documentProcessingService;

    @Value("${rag.search.top-k:8}")
    private int topK;

    @Value("${rag.search.similarity-threshold:0.3}")
    private double similarityThreshold;

    public DocumentService(VectorStore vectorStore,
                           ChatModel chatModel,
                           TokenTextSplitter tokenTextSplitter,
                           DocumentMetadataStore documentMetadataStore,
                           IMinioService minioService,
                           DocumentProcessingService documentProcessingService) {
        this.vectorStore = vectorStore;
        this.chatClient = ChatClient.builder(chatModel).defaultSystem(SYSTEM_PROMPT).build();
        this.tokenTextSplitter = tokenTextSplitter;
        this.documentMetadataStore = documentMetadataStore;
        this.minioService = minioService;
        this.documentProcessingService = documentProcessingService;
    }

    @Override
    public DocumentUploadResponseDto uploadDocument(MultipartFile file, String courseId) {
        validateFileType(file);

        // Read file bytes into memory before the request ends
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to read file bytes: " + e.getMessage(), e);
        }

        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();
        long fileSize = file.getSize();

        // Create document record with UPLOADING status
        RagDocument ragDocument = new RagDocument();
        ragDocument.setFilename(filename);
        ragDocument.setContentType(contentType);
        ragDocument.setFileSizeBytes(fileSize);
        ragDocument.setStatus(EDocumentStatus.UPLOADING);
        ragDocument.setCourseId(courseId);
        ragDocument.setCreatedAt(LocalDateTime.now());
        ragDocument.setUpdatedAt(LocalDateTime.now());
        ragDocument = documentMetadataStore.save(ragDocument);

        try {
            // Store original file in MinIO (sync — fast, just a file copy)
            String objectName = ragDocument.getId() + "/" + filename;
            minioService.uploadFile(objectName, fileBytes, contentType, fileSize);
            ragDocument.setMinioObjectName(objectName);

            // Set status to PROCESSING before handing off to async
            ragDocument.setStatus(EDocumentStatus.PROCESSING);
            ragDocument.setUpdatedAt(LocalDateTime.now());
            ragDocument = documentMetadataStore.save(ragDocument);

            // Delegate heavy processing (Tika + chunking + embedding) to async service
            documentProcessingService.processDocument(
                    ragDocument.getId(), fileBytes, filename, contentType);

            return new DocumentUploadResponseDto(
                    ragDocument.getId(),
                    ragDocument.getFilename(),
                    ragDocument.getStatus(),
                    0,
                    "Document uploaded — processing in background"
            );
        } catch (Exception e) {
            logger.error("Failed to upload document: {}", filename, e);
            ragDocument.setStatus(EDocumentStatus.FAILED);
            ragDocument.setErrorMessage(e.getMessage());
            ragDocument.setUpdatedAt(LocalDateTime.now());
            documentMetadataStore.save(ragDocument);

            throw new RuntimeException("Failed to upload document: " + e.getMessage(), e);
        }
    }

    @Override
    public RagQueryResponseDto queryDocuments(RagQueryRequestDto request) {
        String question = request.getQuestion();

        // Single similarity search — reused for both LLM context and source references
        List<Document> relevantDocs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(topK)
                        .similarityThreshold(similarityThreshold)
                        .build());

        logger.info("Query: '{}' - Found {} relevant chunks", question, relevantDocs.size());

        // Build context from retrieved chunks
        StringBuilder context = new StringBuilder();
        for (Document doc : relevantDocs) {
            context.append(doc.getText()).append("\n\n");
        }

        // Single LLM call with manually constructed prompt
        String userPrompt = """
                Context from documents:
                %s

                User question: %s

                Explain the answer in simple, clear English:""".formatted(context.toString(), question);

        String answer = chatClient.prompt()
                .user(userPrompt)
                .call()
                .content();

        // Build source references from the same search results (no extra embedding call)
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

            if (documentId != null) {
                try {
                    RagDocument ragDoc = documentMetadataStore.findById(documentId).orElse(null);
                    if (ragDoc != null && ragDoc.getMinioObjectName() != null) {
                        source.setDocumentUrl(minioService.getPresignedUrl(ragDoc.getMinioObjectName()));
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
        return documentMetadataStore.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public RagDocument getDocumentById(String id) {
        return documentMetadataStore.findById(id)
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
        documentMetadataStore.deleteById(id);
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

    @Override
    public List<RagDocument> getDocumentsByCourseId(String courseId) {
        return documentMetadataStore.findByCourseId(courseId);
    }

    @Override
    public void deleteDocumentsByCourseId(String courseId) {
        List<RagDocument> documents = documentMetadataStore.findByCourseId(courseId);
        for (RagDocument doc : documents) {
            deleteDocument(doc.getId());
        }
    }

    @Override
    public void reprocessDocument(String id) {
        RagDocument ragDocument = getDocumentById(id);

        if (ragDocument.getMinioObjectName() == null) {
            throw new RuntimeException("Document has no stored file to reprocess: " + id);
        }

        // Clear old vectors if any
        if (ragDocument.getVectorIds() != null && !ragDocument.getVectorIds().isEmpty()) {
            vectorStore.delete(ragDocument.getVectorIds());
            ragDocument.setVectorIds(null);
        }

        // Reset status
        ragDocument.setStatus(EDocumentStatus.PROCESSING);
        ragDocument.setErrorMessage(null);
        ragDocument.setChunkCount(0);
        ragDocument.setUpdatedAt(LocalDateTime.now());
        documentMetadataStore.save(ragDocument);

        // Download file from MinIO and reprocess
        byte[] fileBytes = minioService.getFileBytes(ragDocument.getMinioObjectName());
        documentProcessingService.processDocument(
                ragDocument.getId(), fileBytes, ragDocument.getFilename(), ragDocument.getContentType());
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
