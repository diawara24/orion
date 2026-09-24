package com.example.backend.article;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.generated.model.ArticleDetailResponseDto;
import com.example.backend.generated.model.CreateArticleRequestDto;
import com.example.backend.generated.model.TopicResponseDto;
import com.example.backend.security.SecurityUtils;
import com.example.backend.subscription.SubscriptionRepository;
import com.example.backend.topic.Topic;
import com.example.backend.topic.TopicRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ArticleMapper articleMapper;
    private final SlugService slugService;

    @Transactional
    public ArticleDetailResponseDto create(CreateArticleRequestDto request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        User author = findUser(userId);
        Topic topic = findTopic(request.getTopicId());

        Article article = Article.builder()
                .title(request.getTitle().trim())
                .slug(slugService.generateUniqueSlug(request.getTitle(), articleRepository))
                .content(request.getContent().trim())
                .author(author)
                .topic(topic)
                .build();

        Article savedArticle = articleRepository.saveAndFlush(article);

        log.info(
                "Article published: id={}, authorId={}, topicId={}",
                savedArticle.getId(),
                userId,
                topic.getId()
        );

        return toDetailResponseDto(savedArticle, userId);
    }

    @Transactional(readOnly = true)
    public ArticleDetailResponseDto getById(UUID articleId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("L'article", articleId));

        return toDetailResponseDto(article, userId);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("L'utilisateur", userId));
    }

    private Topic findTopic(UUID topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Le thème", topicId));
    }

    private ArticleDetailResponseDto toDetailResponseDto(Article article, UUID userId) {
        ArticleDetailResponseDto response = articleMapper.toDetailResponseDto(article);
        TopicResponseDto topic = response.getTopic();
        topic.setSubscribed(subscriptionRepository.existsByUserIdAndTopicId(userId, topic.getId()));
        response.setCommentCount(0);
        return response;
    }
}
