package io.github.abai45.backend;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.Meeting;
import io.github.abai45.backend.model.MeetingView;
import io.github.abai45.backend.model.Slot;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * API-тест записи гостя (шов HTTP): 201 и тело встречи с серверным end,
 * 400 problem+json по имени гостя, 404 неизвестного типа, 409 пересечения
 * (включая другой тип встреч и разные длительности), касание разрешено,
 * атомарность проверки и создания.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class MeetingsApiTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createMeetingReturns201WithServerComputedEnd() {
        EventTypeView type = createType("Запись 30 на 15", 30, 15);
        Slot slot = slotAt(type.getId(), 0, 2);

        ResponseEntity<MeetingView> response = restTemplate.exchange(
                "/api/meetings",
                HttpMethod.POST,
                json(meeting(type.getId(), "Мария", slot.getStart())),
                MeetingView.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        MeetingView body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getEventTypeId()).isEqualTo(type.getId());
        assertThat(body.getGuestName()).isEqualTo("Мария");
        assertThat(body.getStart()).isEqualTo(slot.getStart());
        assertThat(body.getEnd()).isEqualTo(slot.getStart().plusMinutes(30));
    }

    @Test
    void unknownEventTypeReturns404ProblemJson() {
        ResponseEntity<String> response =
                postMeeting("no-such-type", "Гость", OffsetDateTime.parse("2030-01-01T09:30:00+05:00"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(contentTypeIsProblem(response)).isTrue();
        assertThat(response.getBody()).contains("\"status\":404");
    }

    @Test
    void blankAndOversizedGuestNameReturn400WithFieldError() {
        EventTypeView type = createType("Имя гостя", 30, 15);
        Slot slot = slotAt(type.getId(), 1, 0);

        ResponseEntity<String> blank = postMeeting(type.getId(), "", slot.getStart());
        assertThat(blank.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(contentTypeIsProblem(blank)).isTrue();
        assertThat(blank.getBody()).contains("\"status\":400").contains("\"field\":\"guestName\"");

        ResponseEntity<String> tooLong = postMeeting(type.getId(), "а".repeat(101), slot.getStart());
        assertThat(tooLong.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(tooLong.getBody()).contains("\"field\":\"guestName\"");
    }

    @Test
    void overlappingSlotOfDifferentDurationAndTypeReturns409() {
        EventTypeView first = createType("Конфликт 60", 60, 15);
        EventTypeView other = createType("Конфликт 30 другого типа", 30, 15);

        // Встреча на 60 мин: 09:30–10:30.
        Slot busy = slotAt(first.getId(), 2, 0);
        assertThat(postMeeting(first.getId(), "Первый", busy.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);

        // Встреча на 30 мин: 10:00–10:30 другого типа — частичное наложение.
        Slot overlapping = slotAt(first.getId(), 2, 2);
        assertThat(overlapping.getStart()).isEqualTo(busy.getStart().plusMinutes(30));

        ResponseEntity<String> conflict = postMeeting(other.getId(), "Второй", overlapping.getStart());
        assertThat(conflict.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(contentTypeIsProblem(conflict)).isTrue();
        assertThat(conflict.getBody()).contains("\"status\":409");
    }

    @Test
    void touchingIntervalsAreAllowed() {
        EventTypeView type = createType("Касание 30 на 15", 30, 15);

        Slot morning = slotAt(type.getId(), 3, 0); // 09:30–10:00
        Slot touching = slotAt(type.getId(), 3, 2); // 10:00–10:30: окончание = начало
        assertThat(Duration.between(morning.getStart(), touching.getStart()).toMinutes())
                .isEqualTo(30);

        assertThat(postMeeting(type.getId(), "Утро", morning.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);
        assertThat(postMeeting(type.getId(), "Следом", touching.getStart()).getStatusCode())
                .isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void concurrentBookingOfSameSlotProducesExactlyOneMeeting() throws Exception {
        EventTypeView type = createType("Гонка слотов", 30, 15);
        Slot slot = slotAt(type.getId(), 4, 1);

        int racers = 5;
        ExecutorService pool = Executors.newFixedThreadPool(racers);
        try {
            List<Callable<HttpStatusCode>> attempts = IntStream.range(0, racers)
                    .mapToObj(i ->
                            (Callable<HttpStatusCode>) () -> postMeeting(type.getId(), "Гость " + i, slot.getStart())
                                    .getStatusCode())
                    .toList();
            List<Future<HttpStatusCode>> futures = pool.invokeAll(attempts);

            List<HttpStatusCode> codes = futures.stream()
                    .map(future -> {
                        try {
                            return future.get();
                        } catch (Exception e) {
                            throw new IllegalStateException(e);
                        }
                    })
                    .toList();
            assertThat(codes.stream().filter(HttpStatus.CREATED::equals).count())
                    .isEqualTo(1);
            assertThat(codes.stream().filter(HttpStatus.CONFLICT::equals).count())
                    .isEqualTo(racers - 1);
        } finally {
            pool.shutdown();
        }
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

    /** dayIndex-й день окна (14 дней), slotIndex-й старт внутри дня. */
    private Slot slotAt(String eventTypeId, int dayIndex, int slotIndex) {
        List<Slot> slots = listSlots(eventTypeId);
        var firstDay = slots.get(0).getStart().atZoneSameInstant(java.time.ZoneId.of("Asia/Almaty"));
        long perDay = slots.stream()
                .filter(slot -> slot.getStart()
                        .atZoneSameInstant(java.time.ZoneId.of("Asia/Almaty"))
                        .toLocalDate()
                        .equals(firstDay.toLocalDate()))
                .count();
        return slots.get((int) (dayIndex * perDay + slotIndex));
    }

    private List<Slot> listSlots(String eventTypeId) {
        ResponseEntity<Slot[]> response =
                restTemplate.exchange("/api/event-types/{id}/slots", HttpMethod.GET, null, Slot[].class, eventTypeId);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return List.of(response.getBody());
    }

    private ResponseEntity<String> postMeeting(String eventTypeId, String guestName, OffsetDateTime start) {
        return restTemplate.exchange(
                "/api/meetings", HttpMethod.POST, json(meeting(eventTypeId, guestName, start)), String.class);
    }

    private static Meeting meeting(String eventTypeId, String guestName, OffsetDateTime start) {
        Meeting meeting = new Meeting();
        meeting.setEventTypeId(eventTypeId);
        meeting.setGuestName(guestName);
        meeting.setStart(start);
        return meeting;
    }

    private static boolean contentTypeIsProblem(ResponseEntity<String> response) {
        MediaType contentType = response.getHeaders().getContentType();
        return contentType != null && contentType.includes(MediaType.APPLICATION_PROBLEM_JSON);
    }

    private static HttpEntity<Object> json(Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }
}
