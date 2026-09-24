package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.backend.exception.InvalidCredentialsException;
import com.example.backend.generated.model.LoginRequestDto;
import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.security.JwtService;
import com.example.backend.user.User;
import com.example.backend.user.UserMapper;
import com.example.backend.user.UserRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class LoginServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private LoginService loginService;

    @Test
    void shouldLoginWithNormalizedEmail() {
        LoginRequestDto request = new LoginRequestDto(
                " Orlando@Example.com ",
                "Orion2026!"
        );

        User user = User.builder()
                .id(UUID.randomUUID())
                .username("orlando")
                .email("orlando@example.com")
                .passwordHash("hashed-password")
                .build();
        UserResponseDto userResponse = new UserResponseDto();

        when(userRepository.findByUsernameOrEmail(
                "Orlando@Example.com",
                "orlando@example.com"
        )).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Orion2026!", "hashed-password")).thenReturn(true);
        when(userMapper.toUserResponseDto(user)).thenReturn(userResponse);
        when(jwtService.generateAccessToken(user)).thenReturn("jwt-token");

        var response = loginService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-token");
        assertThat(response.getTokenType().getValue()).isEqualTo("Bearer");
        assertThat(response.getUser()).isSameAs(userResponse);
    }

    @Test
    void shouldRejectUnknownIdentifier() {
        LoginRequestDto request = new LoginRequestDto(
                "unknown@example.com",
                "Orion2026!"
        );

        when(userRepository.findByUsernameOrEmail(
                "unknown@example.com",
                "unknown@example.com"
        )).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loginService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    void shouldRejectInvalidPassword() {
        LoginRequestDto request = new LoginRequestDto(
                "orlando",
                "wrong-password"
        );
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("orlando")
                .email("orlando@example.com")
                .passwordHash("hashed-password")
                .build();

        when(userRepository.findByUsernameOrEmail("orlando", "orlando"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password"))
                .thenReturn(false);

        assertThatThrownBy(() -> loginService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);

        verify(jwtService, never()).generateAccessToken(any());
        verify(userMapper, never()).toUserResponseDto(any());
    }
}
