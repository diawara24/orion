package com.example.backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();

        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            errors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        log.warn(
                "Validation failed: method={}, path={}, fields={}",
                request.getMethod(),
                request.getRequestURI(),
                errors.keySet()
        );

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                ProblemCodes.VALIDATION_ERROR,
                "error.validation.title",
                "error.validation.detail",
                request
        );

        problem.setProperty("errors", errors);

        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            String path = violation.getPropertyPath().toString();
            String field = path.substring(path.lastIndexOf('.') + 1);

            errors.putIfAbsent(field, violation.getMessage());
        }

        log.warn(
                "Constraint validation failed: method={}, path={}, fields={}",
                request.getMethod(),
                request.getRequestURI(),
                errors.keySet()
        );

        ProblemDetail problem = createProblem(
                HttpStatus.BAD_REQUEST,
                ProblemCodes.VALIDATION_ERROR,
                "error.validation.title",
                "error.validation.detail",
                request
        );

        problem.setProperty("errors", errors);

        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableRequest(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        log.warn(
                "Unreadable request body: method={}, path={}, cause={}",
                request.getMethod(),
                request.getRequestURI(),
                exception.getMostSpecificCause().getClass().getSimpleName()
        );

        return createProblem(
                HttpStatus.BAD_REQUEST,
                ProblemCodes.MALFORMED_REQUEST,
                "error.malformed-request.title",
                "error.malformed-request.detail",
                request
        );
    }

    @ExceptionHandler(ApiException.class)
    public ProblemDetail handleApiException(
            ApiException exception,
            HttpServletRequest request
    ) {
        log.warn(
                "API error: method={}, path={}, status={}, code={}",
                request.getMethod(),
                request.getRequestURI(),
                exception.getStatus().value(),
                exception.getCode()
        );

        return createProblem(
                exception.getStatus(),
                exception.getCode(),
                exception.getTitleMessageCode(),
                exception.getDetailMessageCode(),
                request,
                exception.getMessageArguments()
        );
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Erreur non gérée pour {} {}", request.getMethod(), request.getRequestURI(), exception);

        return createProblem(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ProblemCodes.INTERNAL_ERROR,
                "error.internal.title",
                "error.internal.detail",
                request
        );
    }

    private ProblemDetail createProblem(
            HttpStatus status,
            String code,
            String title,
            String detailMessageCode,
            HttpServletRequest request,
            Object... arguments
    ) {
        String msgTitle = messageSource.getMessage(title, null, request.getLocale());

        String detail = messageSource.getMessage(
                detailMessageCode,
                arguments,
                request.getLocale()
        );

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(msgTitle);
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code);

        return problem;
    }
}
