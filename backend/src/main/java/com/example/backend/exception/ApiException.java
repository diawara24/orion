package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

public abstract class ApiException extends RuntimeException {

    @Getter
    private final HttpStatus status;
    @Getter
    private final String code;
    @Getter
    private final String titleMessageCode;
    @Getter
    private final String detailMessageCode;
    private final Object[] messageArguments;

    protected ApiException(
            HttpStatus status,
            String code,
            String titleMessageCode,
            String detailMessageCode,
            Object... messageArguments
    ) {
        super(detailMessageCode);
        this.status = status;
        this.code = code;
        this.titleMessageCode = titleMessageCode;
        this.detailMessageCode = detailMessageCode;
        this.messageArguments = messageArguments.clone();
    }

    public Object[] getMessageArguments() {
        return messageArguments.clone();
    }
}
