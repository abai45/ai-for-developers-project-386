package io.github.abai45.backend.controller;

/**
 * Запрошенное время пересекается с существующей встречей — ответ 409
 * problem+json формирует ProblemDetailsAdvice.
 */
public class ConflictException extends RuntimeException {

    private final String detail;

    public ConflictException(String detail) {
        this.detail = detail;
    }

    public String detail() {
        return detail;
    }
}
