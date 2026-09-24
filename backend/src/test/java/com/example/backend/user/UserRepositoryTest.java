package com.example.backend.user;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    private final UserRepository userRepository;

    @Autowired
    UserRepositoryTest(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Test
    void shouldFindUserByUsernameOrEmail() {
        User savedUser = userRepository.saveAndFlush(
                User.builder()
                        .username("orlando")
                        .email("orlando@example.com")
                        .passwordHash("hashed-password")
                        .build()
        );

        assertThat(userRepository.existsByUsername("orlando")).isTrue();
        assertThat(userRepository.existsByEmail("orlando@example.com")).isTrue();
        assertThat(userRepository.findByUsernameOrEmail("orlando", "unknown@example.com"))
                .contains(savedUser);
        assertThat(userRepository.findByUsernameOrEmail("unknown", "orlando@example.com"))
                .contains(savedUser);
    }

    @Test
    void shouldReturnEmptyWhenUsernameAndEmailDoNotExist() {
        assertThat(userRepository.existsByUsername("unknown")).isFalse();
        assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
        assertThat(userRepository.findByUsernameOrEmail(
                "unknown",
                "unknown@example.com"
        )).isEmpty();
    }
}
