package io.github.abai45.backend;

/**
 * Запрошенное время пересекается с существующей встречей — ответ 409
 * problem+json формирует ProblemDetailsAdvice.
 */
class ConflictException extends RuntimeException {

    private final String detail;

    ConflictException(String detail) {
        this.detail = detail;
    }

    String detail() {
        return detail;
    }
}
