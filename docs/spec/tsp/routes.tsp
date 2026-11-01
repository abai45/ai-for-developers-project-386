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

  /**
   * Слоты записи типа встречи: окно 14 календарных дней со следующего дня,
   * рабочее время 09:30–18:00 Asia/Almaty; голый массив по возрастанию времени.
   */
  @get
  @route("/{eventTypeId}/slots")
  @operationId("listSlots")
  listSlots(
    @path
    @doc("Идентификатор типа встречи")
    eventTypeId: string,
  ): Slot[] | NotFoundResponse;
}

/** Встречи: запись гостей и список бронирований. */
@tag("meetings")
@route("/api/meetings")
interface Meetings {
  /**
   * Запись гостя на слот. Проверка пересечений атомарна: пересечение
   * с существующей встречей (в том числе другого типа) даёт 409;
   * касание интервалов разрешено. Окончание встречи вычисляет сервер.
   */
  @post
  @operationId("createMeeting")
  createMeeting(@body meeting: Meeting): {
    @statusCode
    statusCode: 201;

    @body
    body: MeetingView;
  } | ValidationErrorResponse | NotFoundResponse | ConflictResponse;
}
