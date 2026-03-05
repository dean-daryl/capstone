package com.example.somatekbackend.service;

import org.springframework.web.multipart.MultipartFile;

public interface IMinioService {
    void uploadFile(String objectName, MultipartFile file);
    void uploadFile(String objectName, byte[] data, String contentType, long size);
    String getPresignedUrl(String objectName);
    void deleteObject(String objectName);
    boolean objectExists(String objectName);
    byte[] getFileBytes(String objectName);
}
