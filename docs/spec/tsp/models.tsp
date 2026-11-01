namespace CalendarApi;

/** Тип встречи: шаблон будущей встречи, который создаёт владелец. */
model EventType {
  /** Название типа встречи, 1–100 символов. */
  @minLength(1)
  @maxLength(100)
  name: string;

  /** Описание типа встречи, до 500 символов; отсутствие означает пусто. */
  @maxLength(500)
  description?: string;

  /** Длительность встречи в минутах, от 1 до 510. */
  @minValue(1)
  @maxValue(510)
  durationMinutes: int32;

  /**
   * Шаг слотов в минутах, от 1; сервер дополнительно проверяет,
   * что шаг не превышает длительность.
   */
  @minValue(1)
  slotStepMinutes: int32;
}

/** Тип встречи в ответах сервера: то же, что EventType, плюс серверный идентификатор. */
model EventTypeView extends EventType {
  /** Идентификатор типа встречи, устанавливается сервером. */
  id: string;
}
