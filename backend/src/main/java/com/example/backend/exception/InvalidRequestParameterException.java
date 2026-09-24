package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

public class InvalidRequestParameterException extends ApiException {

    @Getter
    private final String parameter;

    @Getter
    private final String validationMessage;

    public InvalidRequestParameterException(String parameter, String validationMessage) {
        super(
                HttpStatus.BAD_REQUEST,
                ProblemCodes.VALIDATION_ERROR,
                "error.validation.title",
                "error.validation.detail"
        );
        this.parameter = parameter;
        this.validationMessage = validationMessage;
    }
}
