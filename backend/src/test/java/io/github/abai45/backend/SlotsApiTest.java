package io.github.abai45.backend;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.ProblemDetails;
import io.github.abai45.backend.model.Slot;
import io.github.abai45.backend.model.SlotStatus;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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

/**
 * API-тест слотов записи (шов HTTP): окно 14 дней со следующего дня,
 * старты по шагу типа внутри рабочего времени 09:30–18:00 Asia/Almaty,
 * статус free, 404 для неизвестного типа.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class SlotsApiTest {

    private static final ZoneId ALMATY = ZoneId.of("Asia/Almaty");
    private static final LocalTime WORK_START = LocalTime.of(9, 30);
    private static final LocalTime WORK_END = LocalTime.of(18, 0);

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void slotsFollowStepWorkingHoursAndWindow() {
        EventTypeView type = createType("Слоты 30 на 15", 30, 15);

        List<Slot> slots = getSlots(type.getId());

        LocalDate tomorrow = LocalDate.now(ALMATY).plusDays(1);
        LocalDate lastDay = tomorrow.plusDays(13);

        // В дне 09:30..17:30 старты с шагом 15 → 33 слота; ровно 14 дней окна.
        Map<LocalDate, Long> byDay = slots.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        slot -> slot.getStart().atZoneSameInstant(ALMATY).toLocalDate(),
                        java.util.stream.Collectors.counting()));
        assertThat(byDay).hasSize(14);
        assertThat(byDay.keySet())
                .containsExactlyInAnyOrderElementsOf(java.util.stream.IntStream.rangeClosed(0, 13)
                        .mapToObj(tomorrow::plusDays)
                        .toList());
        assertThat(byDay.values()).allSatisfy(count -> assertThat(count).isEqualTo(33L));

        OffsetDateTime firstStart = slots.get(0).getStart();
        assertThat(firstStart.atZoneSameInstant(ALMATY).toLocalDate()).isEqualTo(tomorrow);
        assertThat(firstStart.atZoneSameInstant(ALMATY).toLocalTime()).isEqualTo(LocalTime.of(9, 30));

        assertThat(slots).isSortedAccordingTo(Comparator.comparing(Slot::getStart));
        assertThat(slots).allSatisfy(slot -> {
            OffsetDateTime start = slot.getStart();
            LocalDate day = start.atZoneSameInstant(ALMATY).toLocalDate();
            assertThat(day).isAfterOrEqualTo(tomorrow);
            assertThat(day).isBeforeOrEqualTo(lastDay);
            LocalTime time = start.atZoneSameInstant(ALMATY).toLocalTime();
            assertThat(time).isAfterOrEqualTo(WORK_START);
            assertThat(time.plusMinutes(30)).isBeforeOrEqualTo(WORK_END);
            assertThat(Duration.between(WORK_START, time).toMinutes() % 15).isZero();
            assertThat(slot.getEnd()).isEqualTo(start.plusMinutes(30));
            assertThat(slot.getStatus()).isEqualTo(SlotStatus.FREE);
        });
    }

    @Test
    void longMeetingFitsExactlyUntilWorkEnd() {
        EventTypeView type = createType("Марафон 510", 510, 1);

        List<Slot> slots = getSlots(type.getId());

        // 09:30 + 510 мин = ровно 18:00 — единственный старт в дне.
        assertThat(slots).hasSize(14);
        assertThat(slots).allSatisfy(slot -> {
            LocalTime time = slot.getStart().atZoneSameInstant(ALMATY).toLocalTime();
            assertThat(time).isEqualTo(WORK_START);
            assertThat(slot.getEnd().atZoneSameInstant(ALMATY).toLocalTime()).isEqualTo(WORK_END);
        });
    }

    @Test
    void unknownEventTypeReturns404ProblemJson() {
        ResponseEntity<ProblemDetails> response =
                restTemplate.exchange("/api/event-types/no-such-id/slots", HttpMethod.GET, null, ProblemDetails.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getHeaders().getContentType())
                .isNotNull()
                .satisfies(type -> assertThat(type.includes(MediaType.APPLICATION_PROBLEM_JSON))
                        .isTrue());
        ProblemDetails problem = response.getBody();
        assertThat(problem).isNotNull();
        assertThat(problem.getType()).isEqualTo("about:blank");
        assertThat(problem.getStatus()).isEqualTo(404);
        assertThat(problem.getDetail()).isNotBlank();
    }

    private EventTypeView createType(String name, int duration, int step) {
        EventType request = new EventType();
        request.setName(name);
        request.setDurationMinutes(duration);
        request.setSlotStepMinutes(step);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<EventTypeView> response = restTemplate.exchange(
                "/api/event-types", HttpMethod.POST, new HttpEntity<>(request, headers), EventTypeView.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }

    private List<Slot> getSlots(String eventTypeId) {
        ResponseEntity<List<Slot>> response = restTemplate.exchange(
                "/api/event-types/{id}/slots",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Slot>>() {},
                Map.of("id", eventTypeId));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        return response.getBody();
    }
}
