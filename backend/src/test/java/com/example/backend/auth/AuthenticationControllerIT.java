package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.user.UserRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;


@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUser() throws Exception {
        String body = """
                {
                  "username": "orlando",
                  "email": "orlando@example.com",
                  "password": "Orion2026!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contextPath("/api/v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("orlando"))
                .andExpect(jsonPath("$.email").value("orlando@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());

        assertThat(userRepository.count()).isEqualTo(1);
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        String body = """
                {
                  "username": "orlando",
                  "email": "orlando@example.com",
                  "password": "Orion2026!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contextPath("/api/v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/auth/register")
                        .contextPath("/api/v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON
                ))
                .andExpect(jsonPath("$.code").value("RESOURCE_CONFLICT"));
    }

    @Test
    void shouldLoginWithEmailAndReturnValidJwt() throws Exception {
        String registrationBody = """
                {
                  "username": "orlando",
                  "email": "orlando@example.com",
                  "password": "Orion2026!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                .contextPath("/api/v1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationBody));

        String loginBody = """
                {
                  "username": "orlando@example.com",
                  "password": "Orion2026!"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contextPath("/api/v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andReturn();

        JsonNode response = objectMapper.readTree(
                result.getResponse().getContentAsString()
        );

        String accessToken = response.get("accessToken").asString();

        assertThat(jwtDecoder.decode(accessToken).getSubject()).isNotBlank();
    }

    @Test
    void shouldReturnUnauthorizedForInvalidCredentials() throws Exception {
        String body = """
                {
                  "username": "unknown@example.com",
                  "password": "Orion2026!"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contextPath("/api/v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON
                ))
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void shouldReturnUnauthorizedForProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .contextPath("/api/v1"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON
                ))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }
}
