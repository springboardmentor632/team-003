package com.decisionhub.service;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.model.Attachment;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.AttachmentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.storage.StorageResult;
import com.decisionhub.storage.StorageService;
import com.decisionhub.storage.StorageServiceFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private final AttachmentRepository attachmentRepository;
    private final DecisionRepository decisionRepository;
    private final OptionRepository optionRepository;
    private final StorageServiceFactory storageServiceFactory;

    public FileService(AttachmentRepository attachmentRepository,
                       DecisionRepository decisionRepository,
                       OptionRepository optionRepository,
                       StorageServiceFactory storageServiceFactory) {
        this.attachmentRepository = attachmentRepository;
        this.decisionRepository = decisionRepository;
        this.optionRepository = optionRepository;
        this.storageServiceFactory = storageServiceFactory;
    }

    @Transactional
    public AttachmentResponse uploadFile(MultipartFile file,
                                         Long decisionId,
                                         Long optionId,
                                         String customFileType,
                                         User uploader) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Upload file cannot be empty");
        }

        // Validate file size (max 25MB)
        if (file.getSize() > 25 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 25MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        String fileType = determineFileType(contentType, customFileType);
        String folder = (decisionId != null) ? "decisions" : ((optionId != null) ? "options" : "general");

        StorageService storageService = storageServiceFactory.getActiveStorageService();
        StorageResult storageResult = storageService.store(file, folder);

        String uploaderIdentifier = (uploader != null) ? uploader.getEmail() : "system";

        Attachment attachment = new Attachment(
                file.getOriginalFilename(),
                file.getOriginalFilename(),
                contentType,
                file.getSize(),
                storageResult.getFileUrl(),
                storageResult.getStorageProvider(),
                storageResult.getStorageKey(),
                fileType,
                uploaderIdentifier
        );

        if (decisionId != null) {
            Decision decision = decisionRepository.findById(decisionId)
                    .orElseThrow(() -> new IllegalArgumentException("Decision not found with id: " + decisionId));
            attachment.setDecision(decision);

            // Auto-set cover image if not yet set and file is an image
            if ("IMAGE".equals(fileType) && (decision.getImageUrl() == null || decision.getImageUrl().isBlank())) {
                decision.setImageUrl(storageResult.getFileUrl());
                decisionRepository.save(decision);
            }
        }

        if (optionId != null) {
            Option option = optionRepository.findById(optionId)
                    .orElseThrow(() -> new IllegalArgumentException("Option not found with id: " + optionId));
            attachment.setOption(option);

            // Auto-set option image if not yet set and file is an image
            if ("IMAGE".equals(fileType) && (option.getImageUrl() == null || option.getImageUrl().isBlank())) {
                option.setImageUrl(storageResult.getFileUrl());
                optionRepository.save(option);
            }
        }

        Attachment saved = attachmentRepository.save(attachment);

        // If local storage, format fileUrl to point to clean API content endpoint
        if ("LOCAL".equalsIgnoreCase(saved.getStorageProvider())) {
            saved.setFileUrl("/api/files/" + saved.getId() + "/content");
            saved = attachmentRepository.save(saved);
        }

        log.info("Successfully uploaded attachment id={}, file={}, provider={}",
                saved.getId(), saved.getOriginalFileName(), saved.getStorageProvider());

        return new AttachmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachment(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getDecisionAttachments(Long decisionId) {
        return attachmentRepository.findByDecisionId(decisionId).stream()
                .map(AttachmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getOptionAttachments(Long optionId) {
        return attachmentRepository.findByOptionId(optionId).stream()
                .map(AttachmentResponse::new)
                .collect(Collectors.toList());
    }

    public byte[] loadAttachmentBytes(Attachment attachment) throws IOException {
        StorageService storageService = storageServiceFactory.getStorageService(attachment.getStorageProvider());
        return storageService.loadAsBytes(attachment.getStorageKey());
    }

    @Transactional
    public void deleteAttachment(Long id, User requester) {
        Attachment attachment = getAttachment(id);

        boolean isAdmin = requester != null && "ADMIN".equalsIgnoreCase(requester.getRole());
        boolean isOwner = requester != null && requester.getEmail().equalsIgnoreCase(attachment.getUploadedBy());

        if (!isAdmin && !isOwner) {
            throw new SecurityException("You do not have permission to delete this attachment");
        }

        StorageService storageService = storageServiceFactory.getStorageService(attachment.getStorageProvider());
        storageService.delete(attachment.getStorageKey());

        attachmentRepository.delete(attachment);
        log.info("Deleted attachment id={} by user={}", id, requester != null ? requester.getEmail() : "anonymous");
    }

    private String determineFileType(String contentType, String customFileType) {
        if (customFileType != null && !customFileType.isBlank()) {
            return customFileType.toUpperCase();
        }
        if (contentType.startsWith("image/")) {
            return "IMAGE";
        }
        if (contentType.contains("pdf") || contentType.contains("document") || contentType.contains("text/")
                || contentType.contains("msword") || contentType.contains("sheet")) {
            return "DOCUMENT";
        }
        return "OTHER";
    }
}
