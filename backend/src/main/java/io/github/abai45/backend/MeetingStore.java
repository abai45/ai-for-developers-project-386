package io.github.abai45.backend;

import io.github.abai45.backend.model.MeetingView;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * In-memory хранилище встреч. Проверка пересечений и добавление выполняются
 * атомарно под монитором списка: одновременные запросы не могут создать
 * перекрывающиеся встречи (источник истины — сервер).
 */
@Component
public class MeetingStore {

    private final List<MeetingView> meetings = new java.util.concurrent.CopyOnWriteArrayList<>();

    /**
     * Атомарно проверяет пересечения и добавляет встречу.
     * Пересечение — строгое наложение интервалов; касание (окончание = начало) разрешено.
     *
     * @return false, если встреча уже пересекается с существующей (любого типа)
     */
    public boolean addIfNoOverlap(MeetingView meeting) {
        synchronized (meetings) {
            boolean overlaps = meetings.stream()
                    .anyMatch(existing -> existing.getStart().isBefore(meeting.getEnd())
                            && meeting.getStart().isBefore(existing.getEnd()));
            if (overlaps) {
                return false;
            }
            meetings.add(meeting);
            return true;
        }
    }

    /**
     * Предстоящие встречи всех типов: ещё не начавшиеся (start >= now),
     * отсортированные по возрастанию времени начала.
     */
    public List<MeetingView> upcoming(java.time.OffsetDateTime now) {
        return meetings.stream()
                .filter(meeting -> !meeting.getStart().isBefore(now))
                .sorted(java.util.Comparator.comparing(MeetingView::getStart))
                .toList();
    }
}
