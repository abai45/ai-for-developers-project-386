import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CalendarApi;

/** Типы встреч владельца. */
@tag("event-types")
@route("/api/event-types")
interface EventTypes {
  /** Список типов встреч владельца в порядке ответа сервера. */
  @get
  @operationId("listEventTypes")
  listEventTypes(): EventTypeView[];

  /** Создание типа встречи владельцем; дубли названий разрешены. */
  @post
  @operationId("createEventType")
  createEventType(@body eventType: EventType): {
    @statusCode
    statusCode: 201;

    @body
    body: EventTypeView;
  } | ValidationErrorResponse;
}
