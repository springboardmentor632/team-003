package com.decisionhub.storage;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {

    StorageResult store(MultipartFile file, String folder) throws IOException;

    byte[] loadAsBytes(String storageKey) throws IOException;

    void delete(String storageKey);

    StorageProvider getProvider();

    boolean isConfigured();
}
