package com.example.somatekbackend.service;

import com.example.somatekbackend.dto.DocumentUploadResponseDto;
import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.RagQueryResponseDto;
import com.example.somatekbackend.models.RagDocument;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IDocumentService {
    DocumentUploadResponseDto uploadDocument(MultipartFile file, String courseId);

    RagQueryResponseDto queryDocuments(RagQueryRequestDto request);

    RagQueryResponseDto queryDirect(String question);

    List<RagDocument> getAllDocuments();

    RagDocument getDocumentById(String id);

    void deleteDocument(String id);

    String getDocumentViewUrl(String id);

    List<RagDocument> getDocumentsByCourseId(String courseId);

    void deleteDocumentsByCourseId(String courseId);

    void reprocessDocument(String id);
}
