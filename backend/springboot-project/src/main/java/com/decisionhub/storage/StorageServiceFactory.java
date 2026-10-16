package com.decisionhub.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class StorageServiceFactory {

    private static final Logger log = LoggerFactory.getLogger(StorageServiceFactory.class);

    private final LocalStorageService localStorageService;
    private final AwsS3StorageService awsS3StorageService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final String configuredProvider;

    public StorageServiceFactory(LocalStorageService localStorageService,
                                 AwsS3StorageService awsS3StorageService,
                                 CloudinaryStorageService cloudinaryStorageService,
                                 @Value("${storage.provider:local}") String configuredProvider) {
        this.localStorageService = localStorageService;
        this.awsS3StorageService = awsS3StorageService;
        this.cloudinaryStorageService = cloudinaryStorageService;
        this.configuredProvider = configuredProvider;
        log.info("Initialized StorageServiceFactory with active default provider: {}", configuredProvider);
    }

    public StorageService getActiveStorageService() {
        if ("s3".equalsIgnoreCase(configuredProvider) || "aws_s3".equalsIgnoreCase(configuredProvider)) {
            return awsS3StorageService;
        } else if ("cloudinary".equalsIgnoreCase(configuredProvider)) {
            return cloudinaryStorageService;
        }
        return localStorageService;
    }

    public StorageService getStorageService(String providerName) {
        if (providerName == null || providerName.isBlank()) {
            return getActiveStorageService();
        }
        if (StorageProvider.AWS_S3.name().equalsIgnoreCase(providerName) || "s3".equalsIgnoreCase(providerName)) {
            return awsS3StorageService;
        } else if (StorageProvider.CLOUDINARY.name().equalsIgnoreCase(providerName) || "cloudinary".equalsIgnoreCase(providerName)) {
            return cloudinaryStorageService;
        }
        return localStorageService;
    }
}
