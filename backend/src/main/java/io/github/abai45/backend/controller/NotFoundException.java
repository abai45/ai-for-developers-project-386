package io.github.abai45.backend.controller;

/**
 * Запрошенный объект (тип встречи, встреча) не найден — ответ 404
 * problem+json формирует ProblemDetailsAdvice.
 */
public class NotFoundException extends RuntimeException {

    private final String detail;

    public NotFoundException(String detail) {
        this.detail = detail;
    }

    public String detail() {
        return detail;
    }
}
