package com.example.backend.auth;

import com.example.backend.generated.api.AuthenticationApi;
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

    @Override
    public ResponseEntity<UserResponseDto> register(RegisterRequestDto request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(registrationService.register(request));
    }
}