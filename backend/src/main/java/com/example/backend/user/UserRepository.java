package com.example.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameAndIdNot(String username, UUID id);

    boolean existsByEmailAndIdNot(String email, UUID id);

    Optional<User> findByUsernameOrEmail(String username, String email);
}
