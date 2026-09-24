package com.example.backend.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends ApiException {
    public InvalidCredentialsException() {
        super(
                HttpStatus.UNAUTHORIZED,
                ProblemCodes.INVALID_CREDENTIALS,
                "error.invalid-credentials.title",
                "error.invalid-credentials.detail"
        );
    }
}
