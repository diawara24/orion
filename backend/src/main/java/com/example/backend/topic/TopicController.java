package com.example.backend.topic;

import com.example.backend.generated.api.TopicsApi;
import com.example.backend.generated.model.CreateTopicRequestDto;
import com.example.backend.generated.model.TopicAdminResponseDto;
import com.example.backend.generated.model.UpdateTopicRequestDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TopicController implements TopicsApi {

    private final TopicService topicService;

    @Override
    public ResponseEntity<TopicAdminResponseDto> createTopic(
            CreateTopicRequestDto createTopicRequestDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(topicService.create(createTopicRequestDto));
    }

    @Override
    public ResponseEntity<TopicAdminResponseDto> updateTopic(
            UUID topicId,
            UpdateTopicRequestDto updateTopicRequestDto
    ) {
        return ResponseEntity.ok(topicService.update(topicId, updateTopicRequestDto));
    }

    @Override
    public ResponseEntity<Void> deleteTopic(UUID topicId) {
        topicService.delete(topicId);

        return ResponseEntity.noContent().build();
    }
}
