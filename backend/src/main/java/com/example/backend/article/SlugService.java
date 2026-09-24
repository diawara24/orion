package com.example.backend.article;

import java.text.Normalizer;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class SlugService {

    public String generateUniqueSlug(String title, ArticleRepository articleRepository) {
        String baseSlug = slugify(title);
        String candidate = baseSlug;
        int suffix = 2;

        while (articleRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + suffix++;
        }

        return candidate;
    }

    private String slugify(String title) {
        String slug = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");

        return slug.isBlank() ? "article" : slug;
    }
}
