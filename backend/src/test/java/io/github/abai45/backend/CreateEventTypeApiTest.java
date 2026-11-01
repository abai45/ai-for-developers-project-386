package io.github.abai45.backend;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.abai45.backend.model.EventType;
import io.github.abai45.backend.model.EventTypeView;
import io.github.abai45.backend.model.ProblemDetails;
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
 * API-тест создания типа встречи (шов HTTP): 201 с телом, 400 problem+json
 * с массивом ошибок по полям, дубли названий разрешены.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class CreateEventTypeApiTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createValidEventTypeReturns201WithBody() {
        EventType request = eventType("Созвон", "Короткий синк", 30, 15);

        ResponseEntity<EventTypeView> response = post(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        EventTypeView body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getId()).isNotBlank();
        assertThat(body.getName()).isEqualTo("Созвон");
        assertThat(body.getDescription()).isEqualTo("Короткий синк");
        assertThat(body.getDurationMinutes()).isEqualTo(30);
        assertThat(body.getSlotStepMinutes()).isEqualTo(15);

        List<Map<String, Object>> list = getEventTypes();
        assertThat(list).anySatisfy(item -> assertThat(item).containsEntry("name", "Созвон"));
    }

    @Test
    void createInvalidEventTypeReturns400ProblemJsonWithFieldErrors() {
        Map<String, Object> request = Map.of(
                "name", "",
                "durationMinutes", 600,
                "slotStepMinutes", 900);

        ResponseEntity<ProblemDetails> response =
                restTemplate.exchange("/api/event-types", HttpMethod.POST, jsonEntity(request), ProblemDetails.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getHeaders().getContentType())
                .isNotNull()
                .satisfies(type -> assertThat(type.includes(MediaType.APPLICATION_PROBLEM_JSON))
                        .isTrue());
        ProblemDetails problem = response.getBody();
        assertThat(problem).isNotNull();
        assertThat(problem.getType()).isEqualTo("about:blank");
        assertThat(problem.getTitle()).isNotBlank();
        assertThat(problem.getStatus()).isEqualTo(400);
        assertThat(problem.getDetail()).isNotBlank();
        assertThat(problem.getErrors())
                .isNotNull()
                .extracting("field")
                .contains("name", "durationMinutes", "slotStepMinutes");
        assertThat(problem.getErrors()).allSatisfy(error -> {
            assertThat(error.getField()).isNotBlank();
            assertThat(error.getMessage()).isNotBlank();
        });
    }

    @Test
    void slotStepLargerThanDurationIsRejected() {
        EventType request = eventType("Длинный воркшоп", null, 60, 90);

        ResponseEntity<ProblemDetails> response =
                restTemplate.exchange("/api/event-types", HttpMethod.POST, jsonEntity(request), ProblemDetails.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getErrors())
                .isNotNull()
                .extracting("field")
                .contains("slotStepMinutes");
    }

    @Test
    void duplicateNamesAreAllowed() {
        EventType first = eventType("Дубликат", "Первый", 45, 5);
        EventType second = eventType("Дубликат", "Второй", 45, 10);

        assertThat(post(first).getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(post(second).getStatusCode()).isEqualTo(HttpStatus.CREATED);

        List<Map<String, Object>> duplicates = getEventTypes().stream()
                .filter(item -> "Дубликат".equals(item.get("name")))
                .toList();
        assertThat(duplicates).hasSize(2);
    }

    private ResponseEntity<EventTypeView> post(EventType request) {
        return restTemplate.exchange("/api/event-types", HttpMethod.POST, jsonEntity(request), EventTypeView.class);
    }

    private static HttpEntity<Object> jsonEntity(Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, headers);
    }

    private List<Map<String, Object>> getEventTypes() {
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "/api/event-types",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        return response.getBody();
    }

    private static EventType eventType(String name, String description, int duration, int step) {
        EventType eventType = new EventType();
        eventType.setName(name);
        eventType.setDescription(description);
        eventType.setDurationMinutes(duration);
        eventType.setSlotStepMinutes(step);
        return eventType;
    }
}
