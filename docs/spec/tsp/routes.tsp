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
}
