package com.example.backend.user;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.InvalidCurrentPasswordException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.generated.model.UpdateUserRequestDto;
import com.example.backend.generated.model.UserProfileResponseDto;
import com.example.backend.generated.model.UserResponseDto;
import com.example.backend.security.SecurityUtils;
import com.example.backend.topic.TopicService;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final TopicService topicService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponseDto getCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = findUser(userId);

        UserProfileResponseDto response = userMapper.toUserProfileResponseDto(user);
        response.setSubscriptions(topicService.getCurrentUserSubscriptions());
        return response;
    }

    @Transactional
    public UserResponseDto updateCurrentUser(UpdateUserRequestDto request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = findUser(userId);
        boolean passwordChangeRequested = request.getPassword() != null;

        if (request.getCurrentPassword() != null && !passwordChangeRequested) {
            throw new InvalidCurrentPasswordException();
        }

        if (passwordChangeRequested) {
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new InvalidCurrentPasswordException();
            }

            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        boolean usernameChanged = updateUsername(request.getUsername(), user);
        boolean emailChanged = updateEmail(request.getEmail(), user);

        log.info(
                "User profile updated: id={}, usernameChanged={}, emailChanged={}, passwordChanged={}",
                userId,
                usernameChanged,
                emailChanged,
                passwordChangeRequested
        );

        return userMapper.toUserResponseDto(user);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("L'utilisateur", userId));
    }

    private boolean updateUsername(String requestedUsername, User user) {
        if (requestedUsername == null) {
            return false;
        }

        String username = requestedUsername.trim();

        if (username.equals(user.getUsername())) {
            return false;
        }

        if (userRepository.existsByUsernameAndIdNot(username, user.getId())) {
            throw new ConflictException();
        }

        user.setUsername(username);
        return true;
    }

    private boolean updateEmail(String requestedEmail, User user) {
        if (requestedEmail == null) {
            return false;
        }

        String email = requestedEmail.trim().toLowerCase(Locale.ROOT);

        if (email.equals(user.getEmail())) {
            return false;
        }

        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new ConflictException();
        }

        user.setEmail(email);
        return true;
    }
}
