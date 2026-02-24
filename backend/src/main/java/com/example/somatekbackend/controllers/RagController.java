package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.RagQueryRequestDto;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.service.IDocumentService;
import com.example.somatekbackend.service.UserQueryService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/rag")
@AllArgsConstructor
public class RagController {

    private final IDocumentService documentService;
    private final UserQueryService userQueryService;

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseObjectDto> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(documentService.uploadDocument(file)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<ResponseObjectDto> queryDocuments(@RequestBody RagQueryRequestDto request) {
        try {
            UUID customerId = request.getCustomerId();
            String type = request.getType();
            String source = request.getSource();
            return ResponseEntity.ok(new ResponseObjectDto(userQueryService.query(request.getQuestion(), type, source, customerId)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/documents")
    public ResponseEntity<ResponseObjectDto> getAllDocuments() {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(documentService.getAllDocuments()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<ResponseObjectDto> getDocumentById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(new ResponseObjectDto(documentService.getDocumentById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    @GetMapping("/documents/{id}/view")
    public ResponseEntity<ResponseObjectDto> getDocumentViewUrl(@PathVariable String id) {
        try {
            String url = documentService.getDocumentViewUrl(id);
            return ResponseEntity.ok(new ResponseObjectDto(java.util.Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<ResponseObjectDto> deleteDocument(@PathVariable String id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok(new ResponseObjectDto(null, "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObjectDto(e));
        }
    }
}
