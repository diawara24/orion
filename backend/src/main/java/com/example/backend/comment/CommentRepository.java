package com.example.backend.comment;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    long countByArticleId(UUID articleId);

    @EntityGraph(attributePaths = "author")
    Page<Comment> findByArticleId(UUID articleId, Pageable pageable);
}
