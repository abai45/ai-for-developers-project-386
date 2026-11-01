package io.github.abai45.backend;

/**
 * Запрошенный объект (тип встречи, встреча) не найден — ответ 404
 * problem+json формирует ProblemDetailsAdvice.
 */
class NotFoundException extends RuntimeException {

    private final String detail;

    NotFoundException(String detail) {
        this.detail = detail;
    }

    String detail() {
        return detail;
    }
}
