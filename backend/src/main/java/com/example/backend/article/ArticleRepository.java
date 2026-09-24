package com.example.backend.article;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"author", "topic"})
    @Query(
            value = """
                    select article
                    from Article article
                    join Subscription subscription on subscription.topic.id = article.topic.id
                    where subscription.user.id = :userId
                    """,
            countQuery = """
                    select count(article)
                    from Article article
                    join Subscription subscription on subscription.topic.id = article.topic.id
                    where subscription.user.id = :userId
                    """
    )
    Page<Article> findSubscribedByUserId(@Param("userId") UUID userId, Pageable pageable);
}
