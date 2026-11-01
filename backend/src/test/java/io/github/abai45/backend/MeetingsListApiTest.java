package io.github.abai45.backend;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.Meeting;
import io.github.abai45.backend.model.MeetingView;
import io.github.abai45.backend.model.Slot;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;

/**
 * API-тест списка предстоящих встреч (шов HTTP): только ещё не начавшиеся
 * встречи всех типов, отсортированные по возрастанию времени начала.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class MeetingsListApiTest {

    private static final ZoneId ALMATY = ZoneId.of("Asia/Almaty");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void listMeetingsReturnsOnlyUpcomingSortedByStart() {
        EventTypeView typeA = createType("Список A 30", 30, 15);
        EventTypeView typeB = createType("Список B 45", 45, 15);

        Slot late = slotAt(typeA.getId(), 3, 10); // дальше по времени
        Slot early = slotAt(typeA.getId(), 3, 2); // раньше по времени
        Slot otherType = slotAt(typeB.getId(), 5, 4); // другой тип встречи

        // Записываем в обратном порядке: поздняя слот — раньше запросом.
        assertThat(book(typeA.getId(), "Поздний", late.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);
        assertThat(book(typeA.getId(), "Ранний", early.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);
        assertThat(book(typeB.getId(), "Другой тип", otherType.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        List<MeetingView> meetings = listMeetings();

        List<String> guests = meetings.stream().map(MeetingView::getGuestName).toList();
        assertThat(guests).contains("Ранний", "Поздний", "Другой тип");
        assertThat(meetings).isSortedAccordingTo(Comparator.comparing(MeetingView::getStart));

        OffsetDateTime now = OffsetDateTime.now(ALMATY);
        assertThat(meetings)
                .allSatisfy(meeting -> assertThat(meeting.getStart()).isAfterOrEqualTo(now));
    }

    @Test
    void pastMeetingsAreExcludedFromUpcomingList() {
        EventTypeView type = createType("Прошлая встреча 30", 30, 15);

        // Сервер — источник истины окна записи: вчерашнее время не является
        // слотом из окна и отклоняется 400 по полю start; в список попадает только будущее.
        OffsetDateTime past = OffsetDateTime.now(ALMATY)
                .minusDays(1)
                .withHour(10)
                .withMinute(0)
                .withSecond(0);
        assertThat(book(type.getId(), "Из прошлого", past).getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        List<MeetingView> meetings = listMeetings();
        assertThat(meetings)
                .noneSatisfy(meeting -> assertThat(meeting.getGuestName()).isEqualTo("Из прошлого"));
    }

    private EventTypeView createType(String name, int duration, int step) {
        EventType request = new EventType();
        request.setName(name);
        request.setDurationMinutes(duration);
        request.setSlotStepMinutes(step);
        ResponseEntity<EventTypeView> response =
                restTemplate.exchange("/api/event-types", HttpMethod.POST, json(request), EventTypeView.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private Slot slotAt(String eventTypeId, int dayIndex, int slotIndex) {
        List<Slot> slots = listSlots(eventTypeId);
        long perDay = slots.stream()
                .filter(slot -> slotDay(slot) == slotDay(slots.get(0)))
                .count();
        return slots.get((int) (dayIndex * perDay + slotIndex));
    }

    private static long slotDay(Slot slot) {
        return slot.getStart().atZoneSameInstant(ALMATY).toLocalDate().toEpochDay();
    }

    private List<Slot> listSlots(String eventTypeId) {
        ResponseEntity<Slot[]> response =
                restTemplate.exchange("/api/event-types/{id}/slots", HttpMethod.GET, null, Slot[].class, eventTypeId);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return List.of(response.getBody());
    }

    private List<MeetingView> listMeetings() {
        ResponseEntity<List<MeetingView>> response = restTemplate.exchange(
                "/api/meetings", HttpMethod.GET, null, new ParameterizedTypeReference<List<MeetingView>>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private ResponseEntity<String> book(String eventTypeId, String guestName, OffsetDateTime start) {
        Meeting meeting = new Meeting();
        meeting.setEventTypeId(eventTypeId);
        meeting.setGuestName(guestName);
        meeting.setStart(start);
        return restTemplate.exchange("/api/meetings", HttpMethod.POST, json(meeting), String.class);
    }

    private static HttpEntity<Object> json(Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
