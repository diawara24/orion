package com.example.backend.topic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.security.JwtService;
import com.example.backend.user.Role;
import com.example.backend.user.User;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TopicControllerIT {

    private static final String CONTEXT_PATH = "/api/v1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        topicRepository.deleteAll();
    }

    @Test
    void shouldCreateTopicAsAdmin() throws Exception {
        mockMvc.perform(post(CONTEXT_PATH + "/topics")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenForAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Spring Boot\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.name").value("Spring Boot"));

        assertThat(topicRepository.existsByName("Spring Boot")).isTrue();
    }

    @Test
    void shouldReturnConflictWhenTopicNameAlreadyExists() throws Exception {
        topicRepository.save(Topic.builder().name("Spring Boot").build());

        mockMvc.perform(post(CONTEXT_PATH + "/topics")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenForAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Spring Boot\"}"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(
                        MediaType.APPLICATION_PROBLEM_JSON
                ))
                .andExpect(jsonPath("$.code").value("RESOURCE_CONFLICT"));
    }

    @Test
    void shouldUpdateTopicAsAdmin() throws Exception {
        Topic topic = topicRepository.save(
                Topic.builder().name("Spring").build()
        );

        mockMvc.perform(patch(CONTEXT_PATH + "/topics/{topicId}", topic.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenForAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"Spring Boot\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(topic.getId().toString()))
                .andExpect(jsonPath("$.name").value("Spring Boot"));

        assertThat(topicRepository.existsByName("Spring Boot")).isTrue();
    }

    @Test
    void shouldDeleteTopicAsAdmin() throws Exception {
        Topic topic = topicRepository.save(
                Topic.builder().name("Spring Boot").build()
        );

        mockMvc.perform(delete(CONTEXT_PATH + "/topics/{topicId}", topic.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenForAdmin()))
                .andExpect(status().isNoContent());

        assertThat(topicRepository.existsById(topic.getId())).isFalse();
    }

    private String bearerTokenForAdmin() {
        User admin = User.builder()
                .id(UUID.randomUUID())
                .username("admin")
                .email("admin@example.com")
                .passwordHash("unused")
                .role(Role.ADMIN)
                .build();

        return "Bearer " + jwtService.generateAccessToken(admin);
    }
}
