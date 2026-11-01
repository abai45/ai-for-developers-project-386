package io.github.abai45.backend;

import io.github.abai45.backend.model.EventTypeView;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Component;

/**
 * In-memory хранилище типов встреч владельца. Данные живут только в процессе:
 * перезапуск сервера очищает список (см. README).
 */
@Component
public class EventTypeStore {

    private final List<EventTypeView> eventTypes = new CopyOnWriteArrayList<>();

    /** Типы встреч в порядке добавления — порядок ответа сервера. */
    public List<EventTypeView> list() {
        return List.copyOf(eventTypes);
    }

    /** Добавляет тип встречи в конец списка. */
    public void add(EventTypeView eventType) {
        eventTypes.add(eventType);
    }
}
