package io.github.abai45.backend;

import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.MeetingView;
import io.github.abai45.backend.model.Slot;
import io.github.abai45.backend.model.SlotStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Расчёт слотов записи — сервер источник истины (docs/decisions.md,
 * «Параметры расписания»): рабочее время 09:30–18:00 Asia/Almaty ежедневно,
 * окно 14 календарных дней начиная со следующего дня, старты 09:30 + k × шаг,
 * пока старт + длительность не выйдет за 18:00. Длительность слота равна
 * длительности типа. Статус считается по существующим встречам: строгое
 * пересечение интервалов (без касания) — occupied, в том числе встречи
 * других типов.
 */
@Component
public class SlotService {

    static final ZoneId OWNER_ZONE = ZoneId.of("Asia/Almaty");
    private static final LocalTime WORK_START = LocalTime.of(9, 30);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);
    private static final int WINDOW_DAYS = 14;

    private final MeetingStore meetingStore;

    public SlotService(MeetingStore meetingStore) {
        this.meetingStore = meetingStore;
    }

    /** Слоты типа в порядке возрастания времени; все в окне записи. */
    public List<Slot> slotsFor(EventTypeView eventType) {
        LocalDate firstDay = LocalDate.now(OWNER_ZONE).plusDays(1);
        int duration = eventType.getDurationMinutes();
        int step = eventType.getSlotStepMinutes();
        List<MeetingView> meetings = meetingStore.snapshot();

        List<Slot> slots = new ArrayList<>();
        for (int dayOffset = 0; dayOffset < WINDOW_DAYS; dayOffset++) {
            LocalDate day = firstDay.plusDays(dayOffset);
            for (LocalTime time = WORK_START;
                    !time.plusMinutes(duration).isAfter(WORK_END);
                    time = time.plusMinutes(step)) {
                LocalDateTime start = LocalDateTime.of(day, time);
                OffsetDateTime slotStart = start.atZone(OWNER_ZONE).toOffsetDateTime();
                OffsetDateTime slotEnd =
                        start.plusMinutes(duration).atZone(OWNER_ZONE).toOffsetDateTime();
                Slot slot = new Slot();
                slot.setStart(slotStart);
                slot.setEnd(slotEnd);
                slot.setStatus(isOccupied(slotStart, slotEnd, meetings) ? SlotStatus.OCCUPIED : SlotStatus.FREE);
                slots.add(slot);
            }
        }
        return slots;
    }

    /** Строгое пересечение интервалов; касание (окончание = начало) не занято. */
    private static boolean isOccupied(OffsetDateTime start, OffsetDateTime end, List<MeetingView> meetings) {
        return meetings.stream()
                .anyMatch(meeting -> meeting.getStart().isBefore(end) && start.isBefore(meeting.getEnd()));
    }
}
