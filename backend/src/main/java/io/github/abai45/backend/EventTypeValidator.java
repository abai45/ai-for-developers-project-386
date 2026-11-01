package io.github.abai45.backend;

import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.FieldError;
import java.util.ArrayList;
import java.util.List;

/**
 * Серверная валидация типа встречи — сервер источник истины (см. docs/decisions.md).
 * Собирает все ошибки полей за один проход; сообщения на русском показываются
 * прямо у поля в форме владельца.
 */
final class EventTypeValidator {

    private EventTypeValidator() {}

    static List<FieldError> validate(EventType eventType) {
        List<FieldError> errors = new ArrayList<>();

        String name = eventType.getName();
        if (name == null || name.isBlank()) {
            errors.add(fieldError("name", "Название обязательно (1–100 символов)."));
        } else if (name.length() > 100) {
            errors.add(fieldError("name", "Название не длиннее 100 символов."));
        }

        String description = eventType.getDescription();
        if (description != null && description.length() > 500) {
            errors.add(fieldError("description", "Описание не длиннее 500 символов."));
        }

        Integer duration = eventType.getDurationMinutes();
        if (duration == null) {
            errors.add(fieldError("durationMinutes", "Длительность обязательна (1–510 минут)."));
        } else if (duration < 1 || duration > 510) {
            errors.add(fieldError("durationMinutes", "Длительность должна быть от 1 до 510 минут."));
        }

        Integer step = eventType.getSlotStepMinutes();
        if (step == null || step < 1) {
            errors.add(fieldError("slotStepMinutes", "Шаг слота должен быть не меньше 1 минуты."));
        } else if (duration != null && step > duration) {
            // Сравнение с длительностью — даже когда сама длительность невалидна:
            // шаг не может превышать заявленную длительность ни при каких значениях.
            errors.add(fieldError("slotStepMinutes", "Шаг слота не может превышать длительность."));
        }

        return errors;
    }

    private static FieldError fieldError(String field, String message) {
        FieldError error = new FieldError();
        error.setField(field);
        error.setMessage(message);
        return error;
    }
}
