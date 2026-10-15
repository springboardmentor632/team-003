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
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.UUID;

@Service
public class CloudinaryStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);

    private final String cloudName;
    private final String apiKey;
    private final String apiSecret;
    private final HttpClient httpClient;

    public CloudinaryStorageService(@Value("${cloudinary.cloud-name:decisionhub-demo}") String cloudName,
                                    @Value("${cloudinary.api-key:}") String apiKey,
                                    @Value("${cloudinary.api-secret:}") String apiSecret) {
        this.cloudName = cloudName;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank() && !cloudName.equalsIgnoreCase("decisionhub-demo")
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    @Override
    public StorageResult store(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file to Cloudinary");
        }

        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "media";
        String publicId = (folder != null && !folder.isBlank() ? folder + "/" : "") + UUID.randomUUID() + "_" + safeName;

        String fileUrl = "https://res.cloudinary.com/" + cloudName + "/image/upload/v1/" + publicId;

        if (isConfigured()) {
            try {
                long timestamp = System.currentTimeMillis() / 1000L;
                String signatureData = "public_id=" + publicId + "&timestamp=" + timestamp + apiSecret;
                String signature = sha1Hex(signatureData);

                String boundary = "----DecisionHubBoundary" + UUID.randomUUID();
                byte[] multipartBody = buildMultipartPayload(boundary, file, publicId, timestamp, signature);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/auto/upload"))
                        .timeout(Duration.ofSeconds(30))
                        .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                        .POST(HttpRequest.BodyPublishers.ofByteArray(multipartBody))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 400) {
                    log.warn("Cloudinary upload failed with HTTP {}: {}", response.statusCode(), response.body());
                } else {
                    // Extract secure_url if returned in JSON
                    String body = response.body();
                    int urlIdx = body.indexOf("\"secure_url\":\"");
                    if (urlIdx != -1) {
                        int start = urlIdx + 14;
                        int end = body.indexOf("\"", start);
                        if (end != -1) {
                            fileUrl = body.substring(start, end).replace("\\/", "/");
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Cloudinary upload error: {}", publicId, e);
                throw new IOException("Cloudinary upload error: " + e.getMessage(), e);
            }
        } else {
            log.info("[Cloudinary Mock/Dev] File uploaded with simulated Cloudinary CDN URL: {}", fileUrl);
        }

        return new StorageResult(publicId, fileUrl, StorageProvider.CLOUDINARY.name());
    }

    @Override
    public byte[] loadAsBytes(String storageKey) throws IOException {
        String fileUrl = "https://res.cloudinary.com/" + cloudName + "/image/upload/v1/" + storageKey;
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
            throw new IOException("Failed to load from Cloudinary: HTTP " + response.statusCode());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Cloudinary download interrupted", e);
        }
    }

    @Override
    public void delete(String storageKey) {
        log.info("Cloudinary delete requested for: {}", storageKey);
    }

    private byte[] buildMultipartPayload(String boundary,
                                         MultipartFile file,
                                         String publicId,
                                         long timestamp,
                                         String signature) throws IOException {
        StringBuilder sb = new StringBuilder();
        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"api_key\"\r\n\r\n").append(apiKey).append("\r\n");

        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"timestamp\"\r\n\r\n").append(timestamp).append("\r\n");

        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"public_id\"\r\n\r\n").append(publicId).append("\r\n");

        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"signature\"\r\n\r\n").append(signature).append("\r\n");

        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(file.getOriginalFilename()).append("\"\r\n");
        sb.append("Content-Type: ").append(file.getContentType() != null ? file.getContentType() : "application/octet-stream").append("\r\n\r\n");

        byte[] headerBytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        byte[] fileBytes = file.getBytes();
        byte[] footerBytes = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);

        byte[] total = new byte[headerBytes.length + fileBytes.length + footerBytes.length];
        System.arraycopy(headerBytes, 0, total, 0, headerBytes.length);
        System.arraycopy(fileBytes, 0, total, headerBytes.length, fileBytes.length);
        System.arraycopy(footerBytes, 0, total, headerBytes.length + fileBytes.length, footerBytes.length);
        return total;
    }

    private String sha1Hex(String data) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-1 digest error", e);
        }
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.CLOUDINARY;
    }
}
