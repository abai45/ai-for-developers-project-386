package io.github.abai45.backend.validation;

import java.time.OffsetDateTime;

/**
 * Правило пересечения интервалов — единое для занятости слотов и конфликта
 * записи: строгое наложение запрещено, касание (окончание = начало) разрешено.
 */
public final class IntervalOverlap {

    private IntervalOverlap() {}

    public static boolean overlaps(
            OffsetDateTime aStart, OffsetDateTime aEnd, OffsetDateTime bStart, OffsetDateTime bEnd) {
        return bStart.isBefore(aEnd) && aStart.isBefore(bEnd);
    }
}
