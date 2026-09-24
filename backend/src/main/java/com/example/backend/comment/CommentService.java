package com.example.backend.comment;

import com.example.backend.article.Article;
import com.example.backend.article.ArticleRepository;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.generated.model.CommentPageResponseDto;
import com.example.backend.generated.model.CommentResponseDto;
import com.example.backend.generated.model.CreateCommentRequestDto;
import com.example.backend.security.SecurityUtils;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Transactional
    public CommentResponseDto create(UUID articleId, CreateCommentRequestDto request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Article article = findArticle(articleId);
        User author = findUser(userId);

        Comment comment = commentRepository.saveAndFlush(Comment.builder()
                .content(request.getContent())
                .article(article)
                .author(author)
                .build());

        log.info("Comment created: id={}, articleId={}, authorId={}", comment.getId(), articleId, userId);

        return commentMapper.toResponseDto(comment);
    }

    @Transactional(readOnly = true)
    public CommentPageResponseDto getByArticleId(UUID articleId, int page, int size) {
        findArticle(articleId);

        Page<Comment> commentPage = commentRepository.findByArticleId(
                articleId,
                PageRequest.of(
                        page,
                        size,
                        Sort.by(Sort.Direction.ASC, "createdAt").and(Sort.by(Sort.Direction.ASC, "id"))
                )
        );

        return new CommentPageResponseDto(
                commentPage.getContent().stream().map(commentMapper::toResponseDto).toList(),
                commentPage.getNumber(),
                commentPage.getSize(),
                Math.toIntExact(commentPage.getTotalElements()),
                commentPage.getTotalPages()
        );
    }

    private Article findArticle(UUID articleId) {
        return articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("L'article", articleId));
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("L'utilisateur", userId));
    }
}
