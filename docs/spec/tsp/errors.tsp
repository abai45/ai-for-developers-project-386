import "@typespec/http";

using TypeSpec.Http;

namespace CalendarApi;

/** Ошибка валидации одного поля. */
model FieldError {
  /** Имя поля, не прошедшего проверку: name, description, durationMinutes или slotStepMinutes. */
  field: string;

  /** Понятное описание ошибки на русском — показывается прямо у поля. */
  message: string;
}

/**
 * Описание ошибки по RFC 9457 (application/problem+json) — единая модель
 * для всех ошибок сервиса.
 */
model ProblemDetails {
  /** Тип проблемы; для этого сервиса — "about:blank". */
  type: string;

  /** Краткая заголовок ошибки по-русски. */
  title: string;

  /** HTTP-код ошибки. */
  status: int32;

  /** Человеческое описание проблемы на русском. */
  detail: string;

  /** Ошибки по полям — только для ответов 400. */
  errors?: FieldError[];
}

/** Ответ 400 с ошибками по полям — application/problem+json. */
model ValidationErrorResponse {
  @statusCode
  statusCode: 400;

  @header("Content-Type")
  contentType: "application/problem+json";

  @body
  body: ProblemDetails;
}
