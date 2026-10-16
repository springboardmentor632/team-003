package com.decisionhub.controller;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.model.Attachment;
import com.decisionhub.model.User;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.FileService;
import com.decisionhub.storage.StorageService;
import com.decisionhub.storage.StorageServiceFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final UserRepository userRepository;
    private final StorageServiceFactory storageServiceFactory;

    public FileController(FileService fileService,
                          UserRepository userRepository,
                          StorageServiceFactory storageServiceFactory) {
        this.fileService = fileService;
        this.userRepository = userRepository;
        this.storageServiceFactory = storageServiceFactory;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AttachmentResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "decisionId", required = false) Long decisionId,
            @RequestParam(value = "optionId", required = false) Long optionId,
            @RequestParam(value = "fileType", required = false) String fileType,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        User uploader = null;
        if (userDetails != null) {
            uploader = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }

        AttachmentResponse response = fileService.uploadFile(file, decisionId, optionId, fileType, uploader);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttachmentResponse> getAttachmentInfo(@PathVariable Long id) {
        Attachment attachment = fileService.getAttachment(id);
        return ResponseEntity.ok(new AttachmentResponse(attachment));
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<byte[]> getFileContent(@PathVariable Long id) throws IOException {
        Attachment attachment = fileService.getAttachment(id);
        byte[] bytes = fileService.loadAttachmentBytes(attachment);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(attachment.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getOriginalFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(bytes);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws IOException {
        Attachment attachment = fileService.getAttachment(id);
        byte[] bytes = fileService.loadAttachmentBytes(attachment);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(bytes);
    }

    @GetMapping("/download/{folder}/{filename}")
    public ResponseEntity<byte[]> downloadDirectFile(@PathVariable String folder,
                                                     @PathVariable String filename) throws IOException {
        String storageKey = folder + "/" + filename;
        StorageService storageService = storageServiceFactory.getStorageService("LOCAL");
        byte[] bytes = storageService.loadAsBytes(storageKey);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }

    @GetMapping("/decision/{decisionId}")
    public ResponseEntity<List<AttachmentResponse>> getDecisionAttachments(@PathVariable Long decisionId) {
        return ResponseEntity.ok(fileService.getDecisionAttachments(decisionId));
    }

    @GetMapping("/option/{optionId}")
    public ResponseEntity<List<AttachmentResponse>> getOptionAttachments(@PathVariable Long optionId) {
        return ResponseEntity.ok(fileService.getOptionAttachments(optionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User requester = null;
        if (userDetails != null) {
            requester = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }
        fileService.deleteAttachment(id, requester);
        return ResponseEntity.noContent().build();
    }
}
