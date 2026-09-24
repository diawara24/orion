package com.example.backend.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.security.JwtService;
import com.example.backend.subscription.Subscription;
import com.example.backend.subscription.SubscriptionRepository;
import com.example.backend.topic.Topic;
import com.example.backend.topic.TopicRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UsersControllerIT {

    private static final String CONTEXT_PATH = "/api/v1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDatabase() {
        subscriptionRepository.deleteAll();
        topicRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldReturnCurrentUserWithSubscribedTopics() throws Exception {
        User user = userRepository.save(User.builder()
                .username("orlando")
                .email("orlando@example.com")
                .passwordHash("unused")
                .role(Role.USER)
                .build());
        Topic topic = topicRepository.save(Topic.builder().name("Spring Boot").build());
        subscriptionRepository.save(Subscription.builder().user(user).topic(topic).build());

        mockMvc.perform(get(CONTEXT_PATH + "/users/me")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.username").value("orlando"))
                .andExpect(jsonPath("$.email").value("orlando@example.com"))
                .andExpect(jsonPath("$.subscriptions[0].id").value(topic.getId().toString()))
                .andExpect(jsonPath("$.subscriptions[0].subscribed").value(true));
    }

    @Test
    void shouldUpdateCurrentUserProfile() throws Exception {
        User user = createUser("orlando", "orlando@example.com", "OldPassword1!");

        mockMvc.perform(patch(CONTEXT_PATH + "/users/me")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "orlando-updated",
                                  "email": "ORLANDO.UPDATED@EXAMPLE.COM"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("orlando-updated"))
                .andExpect(jsonPath("$.email").value("orlando.updated@example.com"));
    }

    @Test
    void shouldRejectPasswordChangeWhenCurrentPasswordIsInvalid() throws Exception {
        User user = createUser("orlando", "orlando@example.com", "OldPassword1!");

        mockMvc.perform(patch(CONTEXT_PATH + "/users/me")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "IncorrectPassword1!",
                                  "password": "NewPassword1!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.currentPassword").isNotEmpty());
    }

    private String bearerTokenFor(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }

    private User createUser(String username, String email, String password) {
        return userRepository.save(User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.USER)
                .build());
    }
}
