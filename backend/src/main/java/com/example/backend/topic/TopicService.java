package com.example.backend.topic;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.generated.model.CreateTopicRequestDto;
import com.example.backend.generated.model.TopicAdminResponseDto;
import com.example.backend.generated.model.UpdateTopicRequestDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TopicService {

    private final TopicRepository topicRepository;
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

    private String normalizeName(String name) {
        return name.trim();
    }
}
