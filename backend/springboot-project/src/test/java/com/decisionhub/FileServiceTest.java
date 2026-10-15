package com.decisionhub;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.model.Attachment;
import com.decisionhub.model.Decision;
import com.decisionhub.model.Option;
import com.decisionhub.model.User;
import com.decisionhub.repository.AttachmentRepository;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.OptionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.service.FileService;
import com.decisionhub.storage.AwsS3StorageService;
import com.decisionhub.storage.CloudinaryStorageService;
import com.decisionhub.storage.StorageResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FileServiceTest {

    @Autowired
    private FileService fileService;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AwsS3StorageService awsS3StorageService;

    @Autowired
    private CloudinaryStorageService cloudinaryStorageService;

    private User testUser;
    private Decision testDecision;
    private Option testOption;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(new User("Test Uploader", "uploader@test.com", "pass1234", "USER"));

        Decision d = new Decision();
        d.setTitle("Test Storage Board");
        d.setDescription("Testing file attachments");
        d.setCreatedBy(testUser.getName());
        testDecision = decisionRepository.save(d);

        Option o = new Option();
        o.setTitle("Cloud Option A");
        o.setDescription("Description A");
        o.setDecision(testDecision);
        testOption = optionRepository.save(o);
    }

    @Test
    @DisplayName("Upload document attachment to Decision successfully")
    void testUploadDocumentToDecision() throws IOException {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "architecture_spec.pdf",
                "application/pdf",
                "PDF Binary Data Sample".getBytes()
        );

        AttachmentResponse response = fileService.uploadFile(
                mockFile,
                testDecision.getId(),
                null,
                "DOCUMENT",
                testUser
        );

        assertNotNull(response.getId());
        assertEquals("architecture_spec.pdf", response.getOriginalFileName());
        assertEquals("application/pdf", response.getContentType());
        assertEquals("DOCUMENT", response.getFileType());
        assertEquals(testDecision.getId(), response.getDecisionId());
        assertEquals(testUser.getEmail(), response.getUploadedBy());

        // Verify attachment persistence and bytes loading
        Attachment persisted = fileService.getAttachment(response.getId());
        byte[] loadedBytes = fileService.loadAttachmentBytes(persisted);
        assertArrayEquals("PDF Binary Data Sample".getBytes(), loadedBytes);
    }

    @Test
    @DisplayName("Upload image to Decision sets decision cover imageUrl")
    void testUploadImageSetsCoverUrl() throws IOException {
        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "diagram.png",
                "image/png",
                new byte[]{1, 2, 3, 4, 5}
        );

        AttachmentResponse response = fileService.uploadFile(
                imageFile,
                testDecision.getId(),
                null,
                null,
                testUser
        );

        assertEquals("IMAGE", response.getFileType());
        Decision updated = decisionRepository.findById(testDecision.getId()).orElseThrow();
        assertNotNull(updated.getImageUrl());
        assertTrue(updated.getImageUrl().contains("/api/files/"));
    }

    @Test
    @DisplayName("Upload image to Option sets option imageUrl")
    void testUploadImageToOptionSetsOptionImage() throws IOException {
        MockMultipartFile imageFile = new MockMultipartFile(
                "file",
                "product.jpg",
                "image/jpeg",
                new byte[]{9, 8, 7, 6}
        );

        AttachmentResponse response = fileService.uploadFile(
                imageFile,
                null,
                testOption.getId(),
                null,
                testUser
        );

        assertEquals("IMAGE", response.getFileType());
        assertEquals(testOption.getId(), response.getOptionId());
        Option updated = optionRepository.findById(testOption.getId()).orElseThrow();
        assertNotNull(updated.getImageUrl());
    }

    @Test
    @DisplayName("Empty file upload throws IllegalArgumentException")
    void testEmptyFileUpload_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);
        assertThrows(IllegalArgumentException.class, () ->
                fileService.uploadFile(emptyFile, null, null, null, testUser)
        );
    }

    @Test
    @DisplayName("Query attachments by decision and option")
    void testQueryAttachments() throws IOException {
        MockMultipartFile doc = new MockMultipartFile("file", "doc.pdf", "application/pdf", "data".getBytes());
        fileService.uploadFile(doc, testDecision.getId(), null, null, testUser);

        List<AttachmentResponse> decisionAttachments = fileService.getDecisionAttachments(testDecision.getId());
        assertFalse(decisionAttachments.isEmpty());
        assertEquals("doc.pdf", decisionAttachments.get(0).getOriginalFileName());
    }

    @Test
    @DisplayName("AWS S3 Storage Service generates valid S3 keys and URLs")
    void testAwsS3StorageService() throws IOException {
        MockMultipartFile s3File = new MockMultipartFile("file", "s3test.png", "image/png", "imgdata".getBytes());
        StorageResult result = awsS3StorageService.store(s3File, "decisions");

        assertNotNull(result.getStorageKey());
        assertTrue(result.getStorageKey().startsWith("decisions/"));
        assertTrue(result.getFileUrl().contains("test-bucket.s3.us-east-1.amazonaws.com"));
        assertEquals("AWS_S3", result.getStorageProvider());
    }

    @Test
    @DisplayName("Cloudinary Storage Service generates valid Cloudinary CDN URLs")
    void testCloudinaryStorageService() throws IOException {
        MockMultipartFile cldFile = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", "clddata".getBytes());
        StorageResult result = cloudinaryStorageService.store(cldFile, "options");

        assertNotNull(result.getStorageKey());
        assertTrue(result.getStorageKey().startsWith("options/"));
        assertTrue(result.getFileUrl().contains("res.cloudinary.com/decisionhub-demo"));
        assertEquals("CLOUDINARY", result.getStorageProvider());
    }

    @Test
    @DisplayName("Unauthorized user cannot delete attachment")
    void testUnauthorizedDelete_ThrowsSecurityException() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "secret.pdf", "application/pdf", "sec".getBytes());
        AttachmentResponse res = fileService.uploadFile(file, null, null, null, testUser);

        User anotherUser = userRepository.save(new User("Intruder", "intruder@test.com", "pass", "USER"));
        assertThrows(SecurityException.class, () ->
                fileService.deleteAttachment(res.getId(), anotherUser)
        );
    }
}
