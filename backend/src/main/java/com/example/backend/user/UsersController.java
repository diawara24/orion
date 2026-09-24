package com.example.backend.user;


import com.example.backend.generated.api.UsersApi;
import com.example.backend.generated.model.UpdateUserRequestDto;
import com.example.backend.generated.model.UserProfileResponseDto;
import com.example.backend.generated.model.UserResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UsersController implements UsersApi {

    private final UserService userService;

    /**
     * GET /users/me : Consulter son profil
     *
     * @return Profil de l&#39;utilisateur connecté (status code 200)
     * or Authentification requise ou identifiants invalides (status code 401)
     */
    @Override
    public ResponseEntity<UserProfileResponseDto> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    /**
     * PATCH /users/me : Modifier son profil
     *
     * @param updateUserRequestDto (required)
     * @return Profil mis à jour (status code 200)
     * or Données envoyées invalides (status code 400)
     * or Authentification requise ou identifiants invalides (status code 401)
     * or Conflit avec l&#39;état actuel de la ressource (status code 409)
     */
    @Override
    public ResponseEntity<UserResponseDto> updateCurrentUser(UpdateUserRequestDto updateUserRequestDto) {
        return ResponseEntity.ok(userService.updateCurrentUser(updateUserRequestDto));
    }
}
