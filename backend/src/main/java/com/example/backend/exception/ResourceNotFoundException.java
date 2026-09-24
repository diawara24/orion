package com.example.backend.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class ResourceNotFoundException extends ApiException{
    public ResourceNotFoundException(String resourceName, UUID resourceId) {
        super(
                HttpStatus.NOT_FOUND,
                ProblemCodes.RESOURCE_NOT_FOUND,
                "error.not-found.title",
                "error.not-found.detail",
                resourceName,
                resourceId
        );
    }
}
