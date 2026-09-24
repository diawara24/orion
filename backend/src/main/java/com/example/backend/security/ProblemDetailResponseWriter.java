package com.example.backend.security;

import com.example.backend.exception.ProblemCodes;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;

@Component
@RequiredArgsConstructor
public class ProblemDetailResponseWriter {

    private final ObjectMapper objectMapper;
    private final MessageSource messageSource;

    public void writeUnauthorized(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(
                request,
                response,
                HttpStatus.UNAUTHORIZED,
                ProblemCodes.UNAUTHORIZED,
                "error.unauthorized.title",
                "error.unauthorized.detail"
        );
    }

    public void writeForbidden(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(
                request,
                response,
                HttpStatus.FORBIDDEN,
                ProblemCodes.ACCESS_DENIED,
                "error.forbidden.title",
                "error.forbidden.detail"
        );
    }

    private void write(HttpServletRequest request, HttpServletResponse response, HttpStatus status, String code, String titleCode, String detailCode
    ) throws IOException {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                status,
                messageSource.getMessage(detailCode, null, request.getLocale())
        );

        problem.setTitle(
                messageSource.getMessage(titleCode, null, request.getLocale())
        );
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code);

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);

        objectMapper.writeValue(response.getOutputStream(), problem);
    }
}