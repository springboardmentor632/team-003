package com.decisionhub.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path rootLocation;

    public LocalStorageService(@Value("${storage.local.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        init();
    }

    private void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Initialized local file storage directory at: {}", rootLocation);
        } catch (IOException e) {
            log.error("Could not create local upload directory at: {}", rootLocation, e);
        }
    }

    @Override
    public StorageResult store(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }

        String originalFilename = file.getOriginalFilename();
        String safeName = (originalFilename != null) ? originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_") : "file";
        String uniqueFileName = UUID.randomUUID().toString() + "_" + safeName;

        String safeFolder = (folder != null && !folder.isBlank()) ? folder.replaceAll("[^a-zA-Z0-9_-]", "") : "attachments";
        Path targetDir = this.rootLocation.resolve(safeFolder).normalize();
        Files.createDirectories(targetDir);

        Path targetPath = targetDir.resolve(uniqueFileName).normalize();

        // Path traversal validation
        if (!targetPath.startsWith(this.rootLocation)) {
            throw new SecurityException("Cannot store file outside upload directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        }

        String storageKey = safeFolder + "/" + uniqueFileName;
        String fileUrl = "/api/files/download/" + storageKey;

        log.debug("Stored local file: key={}, path={}", storageKey, targetPath);
        return new StorageResult(storageKey, fileUrl, StorageProvider.LOCAL.name());
    }

    @Override
    public byte[] loadAsBytes(String storageKey) throws IOException {
        Path filePath = this.rootLocation.resolve(storageKey).normalize();
        if (!filePath.startsWith(this.rootLocation)) {
            throw new SecurityException("Cannot read file outside upload directory");
        }
        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            throw new NoSuchFileException("File not found on local storage: " + storageKey);
        }
        return Files.readAllBytes(filePath);
    }

    @Override
    public void delete(String storageKey) {
        try {
            Path filePath = this.rootLocation.resolve(storageKey).normalize();
            if (filePath.startsWith(this.rootLocation) && Files.exists(filePath)) {
                Files.delete(filePath);
                log.debug("Deleted local file: {}", storageKey);
            }
        } catch (IOException e) {
            log.warn("Failed to delete local file: {}", storageKey, e);
        }
    }

    @Override
    public StorageProvider getProvider() {
        return StorageProvider.LOCAL;
    }

    @Override
    public boolean isConfigured() {
        return true;
    }
}
