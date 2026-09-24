package com.example.backend.article;

import com.example.backend.generated.api.ArticlesApi;
import com.example.backend.generated.model.ArticleDetailResponseDto;
import com.example.backend.generated.model.CreateArticleRequestDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ArticleController implements ArticlesApi {

    private final ArticleService articleService;


    /**
     * POST /articles : Publier un article
     *
     * @param createArticleRequestDto (required)
     * @return Article créé (status code 201)
     * or Données envoyées invalides (status code 400)
     * or Authentification requise ou identifiants invalides (status code 401)
     * or Ressource introuvable (status code 404)
     */
    @Override
    public ResponseEntity<ArticleDetailResponseDto> createArticle(
            CreateArticleRequestDto createArticleRequestDto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(articleService.create(createArticleRequestDto));
    }


    /**
     * GET /articles/{articleId} : Consulter un article
     *
     * @param articleId  (required)
     * @return Détail de l&#39;article (status code 200)
     *         or Authentification requise ou identifiants invalides (status code 401)
     *         or Ressource introuvable (status code 404)
     */
    @Override
    public ResponseEntity<ArticleDetailResponseDto> getArticleById(UUID articleId) {
        return ResponseEntity.ok(articleService.getById(articleId));
    }
}
