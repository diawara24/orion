package com.example.backend.comment;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.article.Article;
import com.example.backend.article.ArticleRepository;
import com.example.backend.topic.Topic;
import com.example.backend.topic.TopicRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class CommentRepositoryTest {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Autowired
    CommentRepositoryTest(
            CommentRepository commentRepository,
            ArticleRepository articleRepository,
            UserRepository userRepository,
            TopicRepository topicRepository
    ) {
        this.commentRepository = commentRepository;
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
    }

    @Test
    void shouldPersistCommentWithArticleAndAuthor() {
        Article article = createArticle();
        User author = createUser("commenter");

        Comment comment = commentRepository.save(Comment.builder()
                .content("Très bon article !")
                .article(article)
                .author(author)
                .build());

        assertThat(comment.getId()).isNotNull();
        assertThat(comment.getContent()).isEqualTo("Très bon article !");
        assertThat(comment.getArticle().getId()).isEqualTo(article.getId());
        assertThat(comment.getAuthor().getId()).isEqualTo(author.getId());
    }

    @Test
    void shouldDeleteCommentsWhenArticleIsDeleted() {
        Article article = createArticle();
        commentRepository.save(Comment.builder()
                .content("Très bon article !")
                .article(article)
                .author(createUser("commenter"))
                .build());

        articleRepository.delete(article);
        articleRepository.flush();

        assertThat(commentRepository.countByArticleId(article.getId())).isZero();
    }

    private Article createArticle() {
        User author = createUser("author");
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
                .passwordHash("hashed-password")
                .build());
    }
}
