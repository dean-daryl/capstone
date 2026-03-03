package com.example.somatekbackend.service;

import io.minio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.stream.Collectors;

@Service
@Profile("!local")
public class MinioService implements IMinioService {

    private static final Logger logger = LoggerFactory.getLogger(MinioService.class);

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.public-url}")
    private String publicUrl;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    @Override
    public void uploadFile(String objectName, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            ensureBucketExists();
            setBucketPolicyPublic();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
            logger.info("Uploaded file to MinIO: {}", objectName);
        } catch (Exception e) {
            logger.error("Failed to upload file to MinIO: {}", objectName, e);
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public void uploadFile(String objectName, byte[] data, String contentType, long size) {
        try (InputStream inputStream = new ByteArrayInputStream(data)) {
            ensureBucketExists();
            setBucketPolicyPublic();
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(inputStream, size, -1)
                    .contentType(contentType)
                    .build());
            logger.info("Uploaded file to MinIO: {}", objectName);
        } catch (Exception e) {
            logger.error("Failed to upload file to MinIO: {}", objectName, e);
            throw new RuntimeException("Failed to upload file to MinIO: " + e.getMessage(), e);
        }
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            logger.info("Created MinIO bucket on demand: {}", bucketName);
        }
    }

    private void setBucketPolicyPublic() throws Exception {
        String policyJson = "{\n" +
                "  \"Version\": \"2012-10-17\",\n" +
                "  \"Statement\": [\n" +
                "    {\n" +
                "      \"Effect\": \"Allow\",\n" +
                "      \"Principal\": \"*\",\n" +
                "      \"Action\": [\"s3:GetObject\"],\n" +
                "      \"Resource\": [\"arn:aws:s3:::" + bucketName + "/*\"]\n" +
                "    }\n" +
                "  ]\n" +
                "}";
        minioClient.setBucketPolicy(SetBucketPolicyArgs.builder()
                .bucket(bucketName)
                .config(policyJson)
                .build());
        logger.info("Set bucket policy to public read: {}", bucketName);
    }

    @Override
    public String getPresignedUrl(String objectName) {
        if (!objectExists(objectName)) {
            throw new RuntimeException("Object not found: " + objectName);
        }

        // Bucket has public read policy, so use a direct URL instead of a presigned one.
        // This avoids SignatureDoesNotMatch errors when endpoint != publicUrl (e.g. Docker).
        String encodedPath = Arrays.stream(objectName.split("/"))
                .map(segment -> URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20"))
                .collect(Collectors.joining("/"));

        return publicUrl + "/" + bucketName + "/" + encodedPath;
    }

    /**
     * Check if an object exists in the bucket
     */
    public boolean objectExists(String objectName) {
        try {
            minioClient.statObject(StatObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void deleteObject(String objectName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .build());
            logger.info("Deleted file from MinIO: {}", objectName);
        } catch (Exception e) {
            logger.error("Failed to delete file from MinIO: {}", objectName, e);
            throw new RuntimeException("Failed to delete file from MinIO: " + e.getMessage(), e);
        }
    }
}
