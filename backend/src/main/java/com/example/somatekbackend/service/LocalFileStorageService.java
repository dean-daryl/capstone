package com.example.somatekbackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@Profile("local")
public class LocalFileStorageService implements IMinioService {

    private static final Logger logger = LoggerFactory.getLogger(LocalFileStorageService.class);

    private final Path baseDir;

    public LocalFileStorageService(@Value("${local.storage.base-dir}") String baseDirPath) {
        this.baseDir = Paths.get(baseDirPath);
        try {
            Files.createDirectories(this.baseDir);
            logger.info("Local file storage initialized at: {}", this.baseDir.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create local storage directory: " + baseDirPath, e);
        }
    }

    @Override
    public void uploadFile(String objectName, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            Path targetPath = baseDir.resolve(objectName);
            Files.createDirectories(targetPath.getParent());
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored file locally: {}", targetPath);
        } catch (IOException e) {
            logger.error("Failed to store file locally: {}", objectName, e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public void uploadFile(String objectName, byte[] data, String contentType, long size) {
        try (InputStream inputStream = new ByteArrayInputStream(data)) {
            Path targetPath = baseDir.resolve(objectName);
            Files.createDirectories(targetPath.getParent());
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Stored file locally: {}", targetPath);
        } catch (IOException e) {
            logger.error("Failed to store file locally: {}", objectName, e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPresignedUrl(String objectName) {
        return "/files/" + objectName;
    }

    @Override
    public void deleteObject(String objectName) {
        try {
            Path targetPath = baseDir.resolve(objectName);
            Files.deleteIfExists(targetPath);
            logger.info("Deleted local file: {}", targetPath);
        } catch (IOException e) {
            logger.error("Failed to delete local file: {}", objectName, e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] getFileBytes(String objectName) {
        try {
            return Files.readAllBytes(baseDir.resolve(objectName));
        } catch (IOException e) {
            logger.error("Failed to read local file: {}", objectName, e);
            throw new RuntimeException("Failed to read file: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean objectExists(String objectName) {
        return Files.exists(baseDir.resolve(objectName));
    }
}
