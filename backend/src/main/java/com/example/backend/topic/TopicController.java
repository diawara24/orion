package com.example.backend.topic;

import com.example.backend.generated.api.TopicsApi;
import com.example.backend.generated.model.CreateTopicRequestDto;
import com.example.backend.generated.model.TopicAdminResponseDto;
import com.example.backend.generated.model.TopicResponseDto;
import com.example.backend.generated.model.UpdateTopicRequestDto;

import java.util.List;
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

    /**
     * GET /topics : Lister les thèmes
     *
     * @return Liste des thèmes et état d&#39;abonnement de l&#39;utilisateur (status code 200)
     * or Authentification requise ou identifiants invalides (status code 401)
     */
    @Override
    public ResponseEntity<List<TopicResponseDto>> getTopics() {

        return ResponseEntity.ok(topicService.getTopics());
    }

    /**
     * PUT /topics/{topicId}/subscription : S&#39;abonner à un thème
     * Opération idempotente ; un deuxième appel ne crée pas de doublon.
     *
     * @param topicId (required)
     * @return Abonnement créé ou déjà existant (status code 204)
     * or Authentification requise ou identifiants invalides (status code 401)
     * or Ressource introuvable (status code 404)
     */
    @Override
    public ResponseEntity<Void> subscribeToTopic(UUID topicId) {
        topicService.subscribe(topicId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /topics/{topicId}/subscription : Se désabonner d&#39;un thème
     *
     * @param topicId (required)
     * @return Abonnement supprimé (status code 204)
     * or Authentification requise ou identifiants invalides (status code 401)
     * or Ressource introuvable (status code 404)
     */
    @Override
    public ResponseEntity<Void> unsubscribeFromTopic(UUID topicId) {
        topicService.unsubscribe(topicId);
        return ResponseEntity.noContent().build();
    }
}
