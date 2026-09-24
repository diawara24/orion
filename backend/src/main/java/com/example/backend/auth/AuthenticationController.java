package com.example.backend.auth;

import com.example.backend.generated.api.AuthenticationApi;
import com.example.backend.generated.model.LoginRequestDto;
import com.example.backend.generated.model.LoginResponseDto;
import com.example.backend.generated.model.RegisterRequestDto;
import com.example.backend.generated.model.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthenticationController implements AuthenticationApi {

    private final RegistrationService registrationService;
    private final LoginService loginService;

    /**
     * POST /auth/register : Créer un compte
     *
     * @param request (required)
     * @return Compte créé (status code 201)
     * or Données envoyées invalides (status code 400)
     * or Conflit avec l&#39;état actuel de la ressource (status code 409)
     */
    @Override
    public ResponseEntity<UserResponseDto> register(RegisterRequestDto request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(registrationService.register(request));
    }

    /**
     * POST /auth/login : Se connecter
     *
     * @param request (required)
     * @return Connexion réussie et jeton Bearer émis (status code 200)
     * or Données envoyées invalides (status code 400)
     * or Authentification requise ou identifiants invalides (status code 401)
     */
    @Override
    public ResponseEntity<LoginResponseDto> login(LoginRequestDto request) {
        return ResponseEntity.ok(loginService.login(request));
    }
}