package com.decisionhub.storage;

public class StorageResult {

    private final String storageKey;
    private final String fileUrl;
    private final String storageProvider;

    public StorageResult(String storageKey, String fileUrl, String storageProvider) {
        this.storageKey = storageKey;
        this.fileUrl = fileUrl;
        this.storageProvider = storageProvider;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getStorageProvider() {
        return storageProvider;
    }
}
