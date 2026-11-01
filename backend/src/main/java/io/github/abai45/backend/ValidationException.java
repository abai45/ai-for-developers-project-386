package io.github.abai45.backend;

import io.github.abai45.backend.model.FieldError;
import java.util.List;

/**
 * Валидация полей не пройдена: несёт все ошибки, которые контроллер
 * собрал за один проход (ответ 400 problem+json формирует ProblemDetailsAdvice).
 */
class ValidationException extends RuntimeException {

    private final List<FieldError> errors;

    ValidationException(List<FieldError> errors) {
        this.errors = List.copyOf(errors);
    }

    List<FieldError> errors() {
        return errors;
    }
}
