package com.example.backend.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.example.backend.exception.ConflictException;
import com.example.backend.generated.model.RegisterRequestDto;
import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.user.User;
import com.example.backend.user.UserMapper;
import com.example.backend.user.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private RegistrationService registrationService;

    @Test
    void shouldRegisterNormalizedUser() {
        RegisterRequestDto request = new RegisterRequestDto(
                "  orlando  ",
                "Orlando@Example.com ",
                "Orion2026!"
        );

        UserResponseDto expectedResponse = new UserResponseDto();
        expectedResponse.setId(UUID.randomUUID());

        when(userRepository.existsByUsername("orlando")).thenReturn(false);
        when(userRepository.existsByEmail("orlando@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Orion2026!")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toUserResponseDto(any(User.class))).thenReturn(expectedResponse);

        UserResponseDto actualResponse = registrationService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("orlando");
        assertThat(savedUser.getEmail()).isEqualTo("orlando@example.com");
        assertThat(savedUser.getPasswordHash()).isEqualTo("hashed-password");
        assertThat(actualResponse).isSameAs(expectedResponse);
    }

    @Test
    void shouldRejectExistingUsername() {
        RegisterRequestDto request = new RegisterRequestDto(
                "orlando",
                "orlando@example.com",
                "Orion2026!"
        );

        when(userRepository.existsByUsername("orlando")).thenReturn(true);

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(ConflictException.class);

        verifyNoInteractions(passwordEncoder, userMapper);
    }

    @Test
    void shouldPropagateDatabaseUniqueConstraintViolation() {
        RegisterRequestDto request = new RegisterRequestDto(
                "orlando",
                "orlando@example.com",
                "Orion2026!"
        );

        when(userRepository.existsByUsername("orlando")).thenReturn(false);
        when(userRepository.existsByEmail("orlando@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Orion2026!")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));

        assertThatThrownBy(() -> registrationService.register(request))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
