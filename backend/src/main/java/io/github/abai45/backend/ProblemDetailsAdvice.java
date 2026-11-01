package io.github.abai45.backend;

import io.github.abai45.backend.model.ProblemDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Единый error-handling сервиса: ошибки отвечаются моделью ProblemDetails
 * (RFC 9457, application/problem+json) с русскими описаниями.
 */
@RestControllerAdvice
public class ProblemDetailsAdvice {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ProblemDetails> validation(ValidationException exception) {
        ProblemDetails problem = new ProblemDetails();
        problem.setType("about:blank");
        problem.setTitle("Ошибка валидации");
        problem.setStatus(HttpStatus.BAD_REQUEST.value());
        problem.setDetail("Проверьте правильность заполнения полей.");
        problem.setErrors(exception.errors());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ProblemDetails> notFound(NotFoundException exception) {
        ProblemDetails problem = new ProblemDetails();
        problem.setType("about:blank");
        problem.setTitle("Не найдено");
        problem.setStatus(HttpStatus.NOT_FOUND.value());
        problem.setDetail(exception.detail());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ProblemDetails> conflict(ConflictException exception) {
        ProblemDetails problem = new ProblemDetails();
        problem.setType("about:blank");
        problem.setTitle("Время занято");
        problem.setStatus(HttpStatus.CONFLICT.value());
        problem.setDetail(exception.detail());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }
}
