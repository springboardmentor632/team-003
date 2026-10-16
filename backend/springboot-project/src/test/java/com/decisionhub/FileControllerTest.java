package com.decisionhub;

import com.decisionhub.dto.AttachmentResponse;
import com.decisionhub.model.Decision;
import com.decisionhub.model.User;
import com.decisionhub.repository.DecisionRepository;
import com.decisionhub.repository.UserRepository;
import com.decisionhub.security.JwtService;
import com.decisionhub.service.FileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DecisionRepository decisionRepository;

    @Autowired
    private FileService fileService;

    private User authUser;
    private String jwtToken;
    private Decision testDecision;

    @BeforeEach
    void setUp() {
        authUser = userRepository.save(new User("File Controller User", "controller.user@test.com", "pass1234", "USER"));
        jwtToken = "Bearer " + jwtService.generateToken(authUser.getEmail());

        Decision d = new Decision();
        d.setTitle("Controller Board");
        d.setDescription("Board for controller tests");
        d.setCreatedBy(authUser.getName());
        testDecision = decisionRepository.save(d);
    }

    @Test
    @DisplayName("POST /api/files/upload with valid file returns 201 Created")
    void testUploadFile_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                "Hello PDF Content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("decisionId", testDecision.getId().toString())
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.originalFileName").value("sample.pdf"))
                .andExpect(jsonPath("$.decisionId").value(testDecision.getId()))
                .andExpect(jsonPath("$.fileUrl").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/files/{id}/content returns file binary stream with 200 OK")
    void testGetFileContent_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "Hello Text Stream".getBytes()
        );
        AttachmentResponse uploaded = fileService.uploadFile(file, testDecision.getId(), null, null, authUser);

        // Content endpoint is public
        mockMvc.perform(get("/api/files/" + uploaded.getId() + "/content"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/plain"))
                .andExpect(content().string("Hello Text Stream"));
    }

    @Test
    @DisplayName("GET /api/files/decision/{id} lists attachments")
    void testGetDecisionAttachments() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "listed.pdf",
                "application/pdf",
                "list data".getBytes()
        );
        fileService.uploadFile(file, testDecision.getId(), null, null, authUser);

        mockMvc.perform(get("/api/files/decision/" + testDecision.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].originalFileName").value("listed.pdf"));
    }

    @Test
    @DisplayName("Unauthenticated upload is rejected with 403 Forbidden")
    void testUnauthenticatedUpload_Forbidden() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "denied.pdf", "application/pdf", "data".getBytes());

        mockMvc.perform(multipart("/api/files/upload").file(file))
                .andExpect(status().isForbidden());
    }
}
