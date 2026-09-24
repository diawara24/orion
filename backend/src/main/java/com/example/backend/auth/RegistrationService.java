package com.example.backend.auth;


import com.example.backend.exception.ConflictException;
import com.example.backend.generated.model.RegisterRequestDto;
import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.user.User;
import com.example.backend.user.UserMapper;
import com.example.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    public UserResponseDto register(RegisterRequestDto request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)
                || userRepository.existsByEmail(email)) {
            throw new ConflictException();
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        return userMapper.toUserResponseDto(userRepository.save(user));
    }
}
