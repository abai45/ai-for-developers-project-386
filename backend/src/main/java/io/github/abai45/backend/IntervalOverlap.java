package io.github.abai45.backend;

import java.time.OffsetDateTime;

/**
 * Правило пересечения интервалов — единое для занятости слотов и конфликта
 * записи: строгое наложение запрещено, касание (окончание = начало) разрешено.
 */
final class IntervalOverlap {

    private IntervalOverlap() {}

    static boolean overlaps(OffsetDateTime aStart, OffsetDateTime aEnd, OffsetDateTime bStart, OffsetDateTime bEnd) {
        return bStart.isBefore(aEnd) && aStart.isBefore(bEnd);
    }
}
