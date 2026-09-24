package com.example.backend.topic;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.generated.model.CreateTopicRequestDto;
import com.example.backend.generated.model.TopicAdminResponseDto;
import com.example.backend.generated.model.TopicResponseDto;
import com.example.backend.generated.model.UpdateTopicRequestDto;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import com.example.backend.security.SecurityUtils;
import com.example.backend.subscription.Subscription;
import com.example.backend.subscription.SubscriptionRepository;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final TopicMapper topicMapper;

    @Transactional
    public TopicAdminResponseDto create(CreateTopicRequestDto request) {
        String name = normalizeName(request.getName());

        if (topicRepository.existsByName(name)) {
            throw new ConflictException();
        }

        Topic topic = topicRepository.save(Topic.builder().name(name).build());

        log.info("Topic created: id={}, name={}", topic.getId(), topic.getName());

        return topicMapper.toAdminResponseDto(topic);
    }

    @Transactional
    public TopicAdminResponseDto update(UUID topicId, UpdateTopicRequestDto request) {
        Topic topic = findTopic(topicId);
        String name = normalizeName(request.getName());

        if (topicRepository.existsByNameAndIdNot(name, topicId)) {
            throw new ConflictException();
        }

        topic.setName(name);

        log.info("Topic updated: id={}, name={}", topic.getId(), topic.getName());

        return topicMapper.toAdminResponseDto(topic);
    }

    @Transactional
    public void delete(UUID topicId) {
        Topic topic = findTopic(topicId);

        topicRepository.delete(topic);

        log.info("Topic deleted: id={}", topicId);
    }

    private Topic findTopic(UUID topicId) {
        return topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Le thème", topicId));
    }

    @Transactional(readOnly = true)
    public List<TopicResponseDto> getTopics() {
        UUID userId = SecurityUtils.getCurrentUserId();
        Set<UUID> subscribedTopicIds = subscriptionRepository.findTopicIdsByUserId(userId);

        return topicRepository.findAll().stream()
                .map(topic -> toResponseDto(topic, subscribedTopicIds))
                .toList();
    }

    @Transactional
    public void subscribe(UUID topicId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Topic topic = findTopic(topicId);

        if (subscriptionRepository.existsByUserIdAndTopicId(userId, topicId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("L'utilisateur", userId));

        subscriptionRepository.save(Subscription.builder().user(user).topic(topic).build());
        log.info("User subscribed to topic: userId={}, topicId={}", userId, topicId);
    }

    @Transactional
    public void unsubscribe(UUID topicId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        findTopic(topicId);

        long deletedSubscriptions = subscriptionRepository.deleteByUserIdAndTopicId(userId, topicId);

        if (deletedSubscriptions > 0) {
            log.info("User unsubscribed from topic: userId={}, topicId={}", userId, topicId);
        }
    }

    private String normalizeName(String name) {
        return name.trim();
    }

    private TopicResponseDto toResponseDto(Topic topic, Set<UUID> subscribedTopicIds) {
        TopicResponseDto response = topicMapper.toResponseDto(topic);
        response.setSubscribed(subscribedTopicIds.contains(topic.getId()));
        return response;
    }
}
