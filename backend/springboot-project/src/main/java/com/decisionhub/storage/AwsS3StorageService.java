package com.decisionhub.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.UUID;

@Service
public class AwsS3StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(AwsS3StorageService.class);

    private final String bucket;
    private final String region;
    private final String accessKey;
    private final String secretKey;
    private final String customEndpoint;
    private final HttpClient httpClient;

    public AwsS3StorageService(@Value("${aws.s3.bucket:decisionhub-storage}") String bucket,
                               @Value("${aws.s3.region:us-east-1}") String region,
                               @Value("${aws.s3.access-key:}") String accessKey,
                               @Value("${aws.s3.secret-key:}") String secretKey,
                               @Value("${aws.s3.endpoint:}") String customEndpoint) {
        this.bucket = bucket;
        this.region = region;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.customEndpoint = customEndpoint;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public boolean isConfigured() {
        return accessKey != null && !accessKey.isBlank() && !accessKey.equalsIgnoreCase("decisionhub-dummy-key")
                && secretKey != null && !secretKey.isBlank() && !secretKey.equalsIgnoreCase("decisionhub-dummy-secret");
    }

    @Override
    public StorageResult store(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file to S3");
        }

        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
        String key = (folder != null && !folder.isBlank() ? folder + "/" : "") + UUID.randomUUID() + "_" + safeName;

        String fileUrl = buildObjectUrl(key);

        if (isConfigured()) {
            try {
                // If S3 credentials are provided, PUT to S3 endpoint
                HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                        .uri(URI.create(fileUrl))
                        .timeout(Duration.ofSeconds(30))
                        .header("Content-Type", file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                        .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()));

                HttpResponse<String> response = httpClient.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 400) {
                    log.warn("S3 upload returned HTTP {}: {}", response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.error("Failed to upload object to AWS S3: {}", key, e);
                throw new IOException("AWS S3 upload failed: " + e.getMessage(), e);
            }
        } else {
            log.info("[AWS S3 Mock/Dev] File uploaded with simulated S3 URL: {}", fileUrl);
        }

        return new StorageResult(key, fileUrl, StorageProvider.AWS_S3.name());
    }

    @Override
    public byte[] loadAsBytes(String storageKey) throws IOException {
        String fileUrl = buildObjectUrl(storageKey);
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fileUrl))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() == 200) {
                return response.body();
            }
            throw new IOException("Failed to download from S3, status: " + response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("S3 download interrupted", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (!isConfigured()) {
            log.info("[AWS S3 Mock/Dev] Deleted object: {}", storageKey);
            return;
        }
        try {
            String fileUrl = buildObjectUrl(storageKey);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fileUrl))
                    .DELETE()
                    .build();
            httpClient.send(request, HttpResponse.BodyHandlers.discarding());
        } catch (Exception e) {
            log.warn("Failed to delete S3 object: {}", storageKey, e);
        }
    }

    private String buildObjectUrl(String key) {
        if (customEndpoint != null && !customEndpoint.isBlank()) {
            String endpoint = customEndpoint.replaceAll("/+$", "");
            return endpoint + "/" + bucket + "/" + key;
        }
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.AWS_S3;
    }
}
