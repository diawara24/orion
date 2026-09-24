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

    @Test
    void shouldReturnOnlySubscribedArticlesWithPaginationAndSorting() throws Exception {
        User user = createUser("orlando");
        Topic subscribedTopic = createTopic("Spring Boot");
        Topic otherTopic = createTopic("Angular");
        subscriptionRepository.save(Subscription.builder().user(user).topic(subscribedTopic).build());

        Article olderArticle = createArticle(user, subscribedTopic, "Premier article", "premier-article");
        Article newerArticle = createArticle(user, subscribedTopic, "Second article", "second-article");
        createArticle(user, otherTopic, "Article exclu", "article-exclu");

        mockMvc.perform(get(CONTEXT_PATH + "/articles")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .param("sort", "oldest")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(olderArticle.getId().toString()))
                .andExpect(jsonPath("$.content[0].topic.subscribed").value(true))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get(CONTEXT_PATH + "/articles")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .param("sort", "newest")
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(newerArticle.getId().toString()));
    }

    @Test
    void shouldRejectUnsupportedFeedSort() throws Exception {
        User user = createUser("orlando");

        mockMvc.perform(get(CONTEXT_PATH + "/articles")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .param("sort", "title"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.sort").value("La valeur doit être \"newest\" ou \"oldest\"."));
    }

    @Test
    void shouldRejectInvalidFeedPagination() throws Exception {
        User user = createUser("orlando");

        mockMvc.perform(get(CONTEXT_PATH + "/articles")
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors.page").exists());
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

    private Article createArticle(User author, Topic topic, String title, String slug) {
        return articleRepository.saveAndFlush(Article.builder()
                .title(title)
                .slug(slug)
                .content("Contenu de l'article.")
                .author(author)
                .topic(topic)
                .build());
    }

    private String bearerTokenFor(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }
}
