package io.github.abai45.backend;

import io.github.abai45.backend.model.FieldError;

/** Фабрика ошибок валидации по полям для ответов 400 problem+json. */
final class FieldErrors {

    private FieldErrors() {}

    static FieldError of(String field, String message) {
        FieldError error = new FieldError();
        error.setField(field);
        error.setMessage(message);
        return error;
    }
}
