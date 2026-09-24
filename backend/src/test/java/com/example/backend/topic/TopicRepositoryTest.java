package com.example.backend.topic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class TopicRepositoryTest {

    private final TopicRepository topicRepository;

    @Autowired
    TopicRepositoryTest(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    @Test
    void shouldPersistTopicAndFindItByName() {
        Topic savedTopic = topicRepository.saveAndFlush(
                Topic.builder().name("security").build()
        );

        assertThat(savedTopic.getId()).isNotNull();
        assertThat(topicRepository.existsByName("security")).isTrue();
    }

    @Test
    void shouldRejectDuplicateTopicName() {
        topicRepository.saveAndFlush(Topic.builder().name("security").build());

        assertThatThrownBy(() -> topicRepository.saveAndFlush(
                Topic.builder().name("security").build()
        )).isInstanceOf(DataIntegrityViolationException.class);
    }
}
