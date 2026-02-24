package com.example.somatekbackend.service;

import org.springframework.web.multipart.MultipartFile;

public interface IMinioService {
    void uploadFile(String objectName, MultipartFile file);
    String getPresignedUrl(String objectName);
    void deleteObject(String objectName);
}
