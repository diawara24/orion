package com.example.backend.subscription;

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
class SubscriptionRepositoryTest {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;

    @Autowired
    SubscriptionRepositoryTest(
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            TopicRepository topicRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
    }

    @Test
    void shouldPersistSubscriptionAndFindItByUserAndTopic() {
        User user = saveUser();
        Topic topic = saveTopic();

        Subscription subscription = saveSubscription(user, topic);

        assertThat(subscription.getId()).isNotNull();
        assertThat(subscriptionRepository.existsByUserIdAndTopicId(
                user.getId(),
                topic.getId()
        )).isTrue();
    }

    @Test
    void shouldRejectDuplicateSubscription() {
        User user = saveUser();
        Topic topic = saveTopic();
        saveSubscription(user, topic);
        saveSubscription(user, topic);

        assertThatThrownBy(subscriptionRepository::flush)
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void shouldDeleteSubscriptionsWhenUserIsDeleted() {
        User user = saveUser();
        Subscription subscription = saveSubscription(user, saveTopic());

        userRepository.delete(user);

        assertThat(subscriptionRepository.existsById(subscription.getId())).isFalse();
    }

    @Test
    void shouldDeleteSubscriptionsWhenTopicIsDeleted() {
        Topic topic = saveTopic();
        Subscription subscription = saveSubscription(saveUser(), topic);

        topicRepository.delete(topic);

        assertThat(subscriptionRepository.existsById(subscription.getId())).isFalse();
    }

    private User saveUser() {
        return userRepository.save(User.builder()
                .username("orlando")
                .email("orlando@example.com")
                .passwordHash("hashed-password")
                .build());
    }

    private Topic saveTopic() {
        return topicRepository.save(Topic.builder()
                .name("security")
                .build());
    }

    private Subscription saveSubscription(User user, Topic topic) {
        return subscriptionRepository.save(Subscription.builder()
                .user(user)
                .topic(topic)
                .build());
    }
}
