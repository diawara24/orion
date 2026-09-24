package com.example.backend.security;

import java.util.UUID;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public final class SecurityUtils {

    private SecurityUtils() {
        // Empêche l'instanciation
    }

    public static UUID getCurrentUserId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)
                || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Aucune authentification JWT valide n'est disponible."
            );
        }

        return UUID.fromString(jwtAuthentication.getToken().getSubject());
    }
}
