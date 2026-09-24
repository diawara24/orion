package com.example.backend.article;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.backend.topic.Topic;
import com.example.backend.topic.TopicRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class ArticleRepositoryTest {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Autowired
    ArticleRepositoryTest(
            ArticleRepository articleRepository,
            UserRepository userRepository,
            TopicRepository topicRepository
    ) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
    }

    @Test
    void shouldPersistArticleWithAuthorAndTopic() {
        Article article = articleRepository.save(createArticle("spring-boot-basics", "first"));

        assertThat(article.getId()).isNotNull();
        assertThat(article.getAuthor().getUsername()).isEqualTo("orlando-first");
        assertThat(article.getTopic().getName()).isEqualTo("Spring Boot first");
        assertThat(articleRepository.existsBySlug("spring-boot-basics")).isTrue();
    }

    @Test
    void shouldRejectDuplicateSlug() {
        articleRepository.save(createArticle("spring-boot-basics", "first"));
        articleRepository.save(createArticle("spring-boot-basics", "second"));

        assertThatThrownBy(articleRepository::flush)
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private Article createArticle(String slug, String suffix) {
        return Article.builder()
                .title("Spring Boot Basics")
                .slug(slug)
                .content("Contenu de l'article.")
                .author(userRepository.save(User.builder()
                        .username("orlando-" + suffix)
                        .email("orlando-" + suffix + "@example.com")
                        .passwordHash("hashed-password")
                        .build()))
                .topic(topicRepository.save(Topic.builder()
                        .name("Spring Boot " + suffix)
                        .build()))
                .build();
    }
}
