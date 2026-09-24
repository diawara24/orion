package com.example.backend.article;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.security.JwtService;
import com.example.backend.subscription.Subscription;
import com.example.backend.subscription.SubscriptionRepository;
import com.example.backend.topic.Topic;
import com.example.backend.topic.TopicRepository;
import com.example.backend.user.Role;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
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
class ArticleControllerIT {

    private static final String CONTEXT_PATH = "/api/v1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        articleRepository.deleteAll();
        subscriptionRepository.deleteAll();
        topicRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldPublishArticleForCurrentUser() throws Exception {
        User user = createUser("orlando");
        Topic topic = createTopic("Spring Boot");

        mockMvc.perform(post(CONTEXT_PATH + "/articles")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Spring Boot pour débutants",
                                  "content": "Contenu de l'article.",
                                  "topicId": "%s"
                                }
                                """.formatted(topic.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Spring Boot pour débutants"))
                .andExpect(jsonPath("$.slug").value("spring-boot-pour-debutants"))
                .andExpect(jsonPath("$.author.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.topic.id").value(topic.getId().toString()))
                .andExpect(jsonPath("$.topic.subscribed").value(false))
                .andExpect(jsonPath("$.commentCount").value(0));

        assertThat(articleRepository.existsBySlug("spring-boot-pour-debutants")).isTrue();
    }

    @Test
    void shouldReturnArticleDetailWithSubscriptionStatus() throws Exception {
        User user = createUser("orlando");
        Topic topic = createTopic("Spring Boot");
        subscriptionRepository.save(Subscription.builder().user(user).topic(topic).build());
        Article article = articleRepository.save(Article.builder()
                .title("Spring Boot Basics")
                .slug("spring-boot-basics")
                .content("Contenu de l'article.")
                .author(user)
                .topic(topic)
                .build());

        mockMvc.perform(get(CONTEXT_PATH + "/articles/{articleId}", article.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(article.getId().toString()))
                .andExpect(jsonPath("$.content").value("Contenu de l'article."))
                .andExpect(jsonPath("$.topic.subscribed").value(true))
                .andExpect(jsonPath("$.commentCount").value(0));
    }

    private User createUser(String username) {
        return userRepository.save(User.builder()
                .username(username)
                .email(username + "@example.com")
                .passwordHash("unused")
                .role(Role.USER)
                .build());
    }

    private Topic createTopic(String name) {
        return topicRepository.save(Topic.builder().name(name).build());
    }

    private String bearerTokenFor(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }
}
