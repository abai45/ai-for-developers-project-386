package io.github.abai45.backend.validation;

import io.github.abai45.backend.model.FieldError;

/** Фабрика ошибок валидации по полям для ответов 400 problem+json. */
public final class FieldErrors {

    private FieldErrors() {}

    public static FieldError of(String field, String message) {
        FieldError error = new FieldError();
        error.setField(field);
        error.setMessage(message);
        return error;
    }
}
