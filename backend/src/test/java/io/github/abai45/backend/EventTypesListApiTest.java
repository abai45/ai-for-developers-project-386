package io.github.abai45.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * API-тест списка типов встреч (шов HTTP): сервер отвечает по контракту —
 * GET /api/event-types отдаёт голый JSON-массив объектов EventTypeView.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class EventTypesListApiTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void listEventTypesReturnsBareJsonArrayOfEventTypes() {
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "/api/event-types",
                org.springframework.http.HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType())
                .isNotNull()
                .satisfies(contentType -> assertThat(contentType.includes(MediaType.APPLICATION_JSON))
                        .isTrue());
        assertThat(response.getBody()).isNotNull();
    }
}
