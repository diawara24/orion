package com.example.backend.exception;

import org.springframework.http.HttpStatus;

public class InvalidCurrentPasswordException extends ApiException {

    public InvalidCurrentPasswordException() {
        super(
                HttpStatus.BAD_REQUEST,
                ProblemCodes.VALIDATION_ERROR,
                "error.validation.title",
                "error.validation.detail"
        );
    }
}
