package io.github.abai45.backend;

import io.github.abai45.backend.api.EventTypesApi;
import io.github.abai45.backend.model.EventTypeView;
import java.util.List;
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
}
