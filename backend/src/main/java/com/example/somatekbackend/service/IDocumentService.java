package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DocumentUploadResponseDto;
import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.RagQueryResponseDto;
import com.example.somatekbackend.models.RagDocument;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IDocumentService {
    DocumentUploadResponseDto uploadDocument(MultipartFile file);

    RagQueryResponseDto queryDocuments(RagQueryRequestDto request);

    List<RagDocument> getAllDocuments();

    RagDocument getDocumentById(String id);

    void deleteDocument(String id);

    String getDocumentViewUrl(String id);
}
