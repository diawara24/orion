package com.example.backend.subscription;

import java.util.Set;
import java.util.UUID;
import java.util.List;
import com.example.backend.topic.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    boolean existsByUserIdAndTopicId(UUID userId, UUID topicId);

    long countByUserIdAndTopicId(UUID userId, UUID topicId);

    long deleteByUserIdAndTopicId(UUID userId, UUID topicId);

    @Query("select subscription.topic.id from Subscription subscription where subscription.user.id = :userId")
    Set<UUID> findTopicIdsByUserId(UUID userId);

    @Query("""
            select subscription.topic
            from Subscription subscription
            where subscription.user.id = :userId
            order by subscription.topic.name asc
            """)
    List<Topic> findTopicsByUserId(UUID userId);
}
