package com.example.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    boolean existsByUserIdAndTopicId(UUID userId, UUID topicId);
}
