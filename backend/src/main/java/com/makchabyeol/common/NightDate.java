package com.makchabyeol.common;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * "오늘 밤"은 한국 시간 정오에 바뀐다. 11/7 12:00 ~ 11/8 11:59는 모두 "2026-11-07" 밤.
 * 자정 기준으로 세면 23시에 띄운 별과 0시 10분에 띄운 별이 다른 날이 된다(docs/tech-design.md 3장).
 *
 * <p>프론트 {@code lib/night.js}와 같은 규칙이다. 두 곳이 어긋나면 "오늘 밤 별 개수"가 안 맞는다.
 */
public final class NightDate {

    private static final ZoneOffset KST = ZoneOffset.ofHours(9);
    private static final Duration NOON_SHIFT = Duration.ofHours(12);

    private NightDate() {}

    public static LocalDate of(Instant instant) {
        // 정오를 자정으로 당긴 뒤 날짜만 떼면 그게 밤 날짜다
        return instant.minus(NOON_SHIFT).atOffset(KST).toLocalDate();
    }

    public static LocalDate now(Clock clock) {
        return of(clock.instant());
    }
}
