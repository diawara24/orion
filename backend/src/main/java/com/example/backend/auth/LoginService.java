package com.example.backend.auth;

import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.generated.model.LoginRequestDto;
import com.example.backend.generated.model.LoginResponseDto;
import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.security.JwtService;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public LoginResponseDto login(LoginRequestDto request) {
        String identifier = request.getUsername().trim();
        String normalizedEmail = identifier.toLowerCase(Locale.ROOT);

        User user = userRepository
                .findByUsernameOrEmail(identifier, normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        )) {
            throw new InvalidCredentialsException();
        }

        UserResponseDto userResponse = userMapper.toResponseDto(user);

        return new LoginResponseDto(
                jwtService.generateAccessToken(user),
                LoginResponseDto.TokenTypeEnum.BEARER,
                userResponse
        );
    }
}