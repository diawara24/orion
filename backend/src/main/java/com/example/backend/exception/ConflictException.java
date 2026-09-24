package com.example.backend.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends ApiException{

    public ConflictException() {
        super(
                HttpStatus.CONFLICT,
                ProblemCodes.RESOURCE_CONFLICT,
                "error.conflict.title",
                "error.conflict.detail"
        );
    }
}
