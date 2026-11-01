package io.github.abai45.backend;

import io.github.abai45.backend.api.MeetingsApi;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.FieldError;
import io.github.abai45.backend.model.Meeting;
import io.github.abai45.backend.model.MeetingView;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

/**
 * Контроллер встреч: запись гостя по контракту MeetingsApi.
 * Окончание встречи вычисляет сервер (начало + длительность типа),
 * пересечение интервалов запрещено атомарно — в том числе между типами встреч.
 */
@RestController
public class MeetingsController implements MeetingsApi {

    private final EventTypeStore eventTypeStore;
    private final MeetingStore meetingStore;

    public MeetingsController(EventTypeStore eventTypeStore, MeetingStore meetingStore) {
        this.eventTypeStore = eventTypeStore;
        this.meetingStore = meetingStore;
    }

    @Override
    public ResponseEntity<MeetingView> createMeeting(Meeting meeting) {
        List<FieldError> errors = validateGuestName(meeting.getGuestName());
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }

        EventTypeView eventType = eventTypeStore
                .findById(meeting.getEventTypeId())
                .orElseThrow(() -> new NotFoundException("Тип встречи не найден."));

        MeetingView view = new MeetingView();
        view.setEventTypeId(eventType.getId());
        view.setGuestName(meeting.getGuestName());
        view.setStart(meeting.getStart());
        view.setEnd(meeting.getStart().plusMinutes(eventType.getDurationMinutes()));

        if (!meetingStore.addIfNoOverlap(view)) {
            throw new ConflictException("На выбранное время только что записали встречу. Выберите другой слот.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(view);
    }

    @Override
    public ResponseEntity<List<MeetingView>> listMeetings() {
        return ResponseEntity.ok(meetingStore.upcoming(java.time.OffsetDateTime.now()));
    }

    private static List<FieldError> validateGuestName(String guestName) {
        List<FieldError> errors = new ArrayList<>();
        if (guestName == null || guestName.isBlank()) {
            errors.add(fieldError("guestName", "Имя обязательно (1–100 символов)."));
        } else if (guestName.length() > 100) {
            errors.add(fieldError("guestName", "Имя не длиннее 100 символов."));
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
