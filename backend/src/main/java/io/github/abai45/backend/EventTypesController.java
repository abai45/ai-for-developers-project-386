package io.github.abai45.backend;

import io.github.abai45.backend.api.EventTypesApi;
import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.FieldError;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

/**
 * Контроллер типов встреч: реализует контрактный интерфейс EventTypesApi
 * поверх in-memory хранилища. Логика — здесь, контракт — в TypeSpec.
 */
@RestController
public class EventTypesController implements EventTypesApi {

    private final EventTypeStore store;

    public EventTypesController(EventTypeStore store) {
        this.store = store;
    }

    @Override
    public ResponseEntity<List<EventTypeView>> listEventTypes() {
        return ResponseEntity.ok(store.list());
    }

    @Override
    public ResponseEntity<EventTypeView> createEventType(EventType eventType) {
        List<FieldError> errors = EventTypeValidator.validate(eventType);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        EventTypeView view = new EventTypeView();
        view.setId(UUID.randomUUID().toString());
        view.setName(eventType.getName());
        view.setDescription(eventType.getDescription());
        view.setDurationMinutes(eventType.getDurationMinutes());
        view.setSlotStepMinutes(eventType.getSlotStepMinutes());
        store.add(view);

        return ResponseEntity.status(HttpStatus.CREATED).body(view);
    }
}
