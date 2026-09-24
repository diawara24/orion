package com.example.backend.comment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.article.Article;
import com.example.backend.article.ArticleRepository;
import com.example.backend.security.JwtService;
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
class CommentControllerIT {

    private static final String CONTEXT_PATH = "/api/v1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanDatabase() {
        commentRepository.deleteAll();
        articleRepository.deleteAll();
        subscriptionRepository.deleteAll();
        topicRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldCreateCommentForCurrentUser() throws Exception {
        User user = createUser("orlando");
        Article article = createArticle(user);

        mockMvc.perform(post(CONTEXT_PATH + "/articles/{articleId}/comments", article.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "content": "Très bon article !"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Très bon article !"))
                .andExpect(jsonPath("$.author.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.author.username").value("orlando"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        assertThat(commentRepository.countByArticleId(article.getId())).isEqualTo(1);

        mockMvc.perform(get(CONTEXT_PATH + "/articles/{articleId}", article.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentCount").value(1));
    }

    @Test
    void shouldListArticleCommentsWithPagination() throws Exception {
        User user = createUser("orlando");
        Article article = createArticle(user);
        Comment firstComment = createComment(article, user, "Premier commentaire");
        createComment(article, user, "Second commentaire");

        mockMvc.perform(get(CONTEXT_PATH + "/articles/{articleId}/comments", article.getId())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user))
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(firstComment.getId().toString()))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(1))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    void shouldReturnNotFoundWhenListingCommentsOfUnknownArticle() throws Exception {
        User user = createUser("orlando");

        mockMvc.perform(get(CONTEXT_PATH + "/articles/{articleId}/comments", UUID.randomUUID())
                        .contextPath(CONTEXT_PATH)
                        .header(HttpHeaders.AUTHORIZATION, bearerTokenFor(user)))
                .andExpect(status().isNotFound());
    }

    private Comment createComment(Article article, User author, String content) {
        return commentRepository.saveAndFlush(Comment.builder()
                .content(content)
                .article(article)
                .author(author)
                .build());
    }

    private Article createArticle(User author) {
        Topic topic = topicRepository.save(Topic.builder().name("Spring Boot").build());

        return articleRepository.save(Article.builder()
                .title("Spring Boot Basics")
                .slug("spring-boot-basics")
                .content("Contenu de l'article.")
                .author(author)
                .topic(topic)
                .build());
    }

    private User createUser(String username) {
        return userRepository.save(User.builder()
                .username(username)
                .email(username + "@example.com")
                .passwordHash("unused")
                .role(Role.USER)
                .build());
    }

    private String bearerTokenFor(User user) {
        return "Bearer " + jwtService.generateAccessToken(user);
    }
}
